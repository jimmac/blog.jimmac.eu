#!/usr/bin/env python3
"""Generate spoken audio (Opus) for blog posts using Qwen3-TTS.

Single entry point. Run it with any Python 3:

    ./scripts/generate-tts.py                 # latest post
    ./scripts/generate-tts.py content/posts/NAME
    ./scripts/generate-tts.py --all

On the first run it creates a dedicated virtualenv (venv-qwen) next to this
file, installs/updates every dependency it needs, and then re-executes itself
inside that environment. No manual setup, no activating anything.
"""

import argparse
import glob
import hashlib
import os
import re
import subprocess
import sys
import tempfile

# --------------------------------------------------------------------------
# Paths
# --------------------------------------------------------------------------

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPTS_DIR)
VENV_DIR = os.path.join(REPO_ROOT, "venv-qwen")
VENV_PYTHON = os.path.join(VENV_DIR, "bin", "python")
STAMP_FILE = os.path.join(VENV_DIR, ".tts-requirements")
VOICE_REFERENCE = os.path.join(SCRIPTS_DIR, "voice_reference_10s.wav")

# --------------------------------------------------------------------------
# Environment bootstrap
# --------------------------------------------------------------------------

TORCH_INDEX = "https://download.pytorch.org/whl/cpu"

# pip invocations, in order. The list is hashed to know when to reinstall.
PIP_STEPS = [
    ["--upgrade", "pip", "setuptools", "wheel"],
    ["torch", "torchaudio", "--index-url", TORCH_INDEX],
    ["--no-deps", "qwen-tts"],
    [
        "transformers==4.57.3",
        "accelerate==1.12.0",
        "librosa",
        "soundfile",
        "onnxruntime",
        "einops",
        "sox",
        "scipy",
        "numpy",
    ],
]

REQUIRED_IMPORTS = ["qwen_tts", "torch", "scipy", "numpy"]


def _requirements_hash():
    return hashlib.sha256(repr(PIP_STEPS).encode()).hexdigest()


def _find_python310():
    """Locate a Python 3.10 interpreter (the version Qwen3-TTS is pinned to)."""
    for name in ("python3.10", "python3"):
        exe = subprocess.run(
            ["bash", "-lc", f"command -v {name}"],
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
        ).stdout.strip()
        if not exe:
            continue
        try:
            major, minor = (
                int(x) for x in
                subprocess.run(
                    [exe, "-c", "import sys;print('%d %d' % sys.version_info[:2])"],
                    stdout=subprocess.PIPE,
                    text=True,
                    check=True,
                ).stdout.split()
            )
        except Exception:
            continue
        if (major, minor) == (3, 10):
            return exe
    return None


def _deps_ok():
    if not os.path.exists(STAMP_FILE):
        return False
    with open(STAMP_FILE) as f:
        if f.read().strip() != _requirements_hash():
            return False
    try:
        subprocess.run(
            [VENV_PYTHON, "-c", "import " + ", ".join(REQUIRED_IMPORTS)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except Exception:
        return False
    return True


def _install_deps():
    print("Setting up TTS dependencies (this may take a while)...", file=sys.stderr)
    for step in PIP_STEPS:
        print(f"  pip install {' '.join(step)}", file=sys.stderr)
        subprocess.run([VENV_PYTHON, "-m", "pip", "install", *step], check=True)
    with open(STAMP_FILE, "w") as f:
        f.write(_requirements_hash())


def ensure_environment():
    """Make sure we run inside the venv with all dependencies present."""
    if os.path.realpath(sys.executable) == os.path.realpath(VENV_PYTHON):
        return

    if not os.path.exists(VENV_PYTHON):
        python = _find_python310()
        if python is None:
            sys.exit(
                "ERROR: Python 3.10 not found.\n"
                "Install it (e.g. 'brew install python@3.10' or your distro package)\n"
                "and run this script again."
            )
        print(f"Creating virtualenv at {VENV_DIR}...", file=sys.stderr)
        subprocess.run([python, "-m", "venv", VENV_DIR], check=True)

    if not _deps_ok():
        _install_deps()

    print("Launching TTS environment...", file=sys.stderr)
    os.execv(VENV_PYTHON, [VENV_PYTHON, os.path.abspath(__file__), *sys.argv[1:]])


# --------------------------------------------------------------------------
# Generation (runs inside the venv)
# --------------------------------------------------------------------------

OUTPUT_NAME = "speech.opus"
MIN_WORDS = 150

# Hugging Face model id. 0.6B base (voice clone) by default.
MODEL_NAME = "Qwen/Qwen3-TTS-12Hz-0.6B-Base"
LANGUAGE = "English"

# Transcript of the reference audio (required for full cloning quality).
# Leave empty for embedding-only cloning (lower fidelity but works).
REFERENCE_TEXT = "The proof. The blog port worked better than expected. Finding CI github action was where most enthusiasm was lo-"

# Pronunciation dictionary - map words to phonetic respellings.
PRONUNCIATION_FIXES = {
    "gesceap": "yeh-SHAP",
    "Gesceap": "yeh-SHAP",
    "GNOME": "NOME",
}

_qwen_model = None


def get_qwen_model():
    """Get or initialize the Qwen3-TTS model (singleton)."""
    global _qwen_model
    if _qwen_model is None:
        import torch

        device = "cuda" if torch.cuda.is_available() else "cpu"
        if device == "cpu":
            torch.set_num_threads(os.cpu_count())
            torch.set_num_interop_threads(min(4, os.cpu_count()))
            print(f"Initializing Qwen3-TTS model on CPU ({os.cpu_count()} threads)...", file=sys.stderr)
        else:
            print(f"Initializing Qwen3-TTS model on {device}...", file=sys.stderr)
        dtype = torch.bfloat16 if device == "cuda" else torch.float32
        _qwen_model = Qwen3TTSModel.from_pretrained(
            MODEL_NAME,
            device_map=device,
            dtype=dtype,
            attn_implementation="flash_attention_2" if device == "cuda" else "eager",
        )
    return _qwen_model


def parse_post(path):
    """Split a post into (front_matter_str, body_str, title_str)."""
    with open(path) as f:
        content = f.read()

    parts = content.split("+++")
    if len(parts) < 3:
        return None, None, None

    front_matter = parts[1]
    body = "+++".join(parts[2:])  # rejoin in case body contains +++

    title = ""
    for line in front_matter.splitlines():
        m = re.match(r'^title\s*=\s*"(.*)"', line)
        if m:
            title = m.group(1)
            break

    return front_matter, body, title


def has_audio(front_matter):
    """Check if front matter already has an audio field in [extra]."""
    in_extra = False
    for line in front_matter.splitlines():
        stripped = line.strip()
        if stripped == "[extra]":
            in_extra = True
            continue
        if in_extra and stripped.startswith("["):
            in_extra = False
        if in_extra and re.match(r'^audio\s*=', stripped):
            return True
    return False


def strip_markdown(text):
    """Convert markdown body to plain text suitable for TTS."""
    # Remove HTML comments
    text = re.sub(r"<!--.*?-->", "", text, flags=re.DOTALL)
    # Remove script tags and their contents
    text = re.sub(r"<script\b[^>]*>.*?</script>", "", text, flags=re.DOTALL | re.IGNORECASE)
    # Remove style tags and their contents
    text = re.sub(r"<style\b[^>]*>.*?</style>", "", text, flags=re.DOTALL | re.IGNORECASE)
    # Remove code blocks (fenced code) - must be before HTML removal
    text = re.sub(r"```[a-z]*\n.*?\n```", "", text, flags=re.DOTALL)
    # Remove HTML blocks and inline HTML
    text = re.sub(r"<[^>]+>", "", text)
    # Remove images
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text)
    # Convert links to just their text
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)
    # Remove HTML entities
    text = text.replace("&mdash;", "\u2014")
    text = text.replace("&ndash;", "\u2013")
    text = text.replace("&amp;", "&")
    text = text.replace("&lt;", "<")
    text = text.replace("&gt;", ">")
    # Convert headings to text with pauses (double period = longer pause)
    text = re.sub(r"^#{1,6}\s+(.+?)$", r"\1..", text, flags=re.MULTILINE)
    # Remove bold/italic markers
    text = re.sub(r"\*{1,3}([^*]+)\*{1,3}", r"\1", text)
    text = re.sub(r"_{1,3}([^_]+)_{1,3}", r"\1", text)
    # Remove inline code
    text = re.sub(r"`([^`]*)`", r"\1", text)
    # Remove horizontal rules
    text = re.sub(r"^[-*_]{3,}\s*$", "", text, flags=re.MULTILINE)
    # Remove blockquote markers
    text = re.sub(r"^>\s*", "", text, flags=re.MULTILINE)
    # Collapse multiple blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def patch_front_matter(path, front_matter, body):
    """Add or update audio field in [extra] section and write back."""
    lines = front_matter.splitlines()
    new_lines = []
    patched = False
    in_extra = False

    for line in lines:
        stripped = line.strip()

        if stripped == "[extra]":
            in_extra = True
            new_lines.append(line)
            continue

        if in_extra and re.match(r'^audio\s*=', stripped):
            if not patched:
                new_lines.append(f'audio = "{OUTPUT_NAME}"')
                patched = True
            continue

        if in_extra and stripped.startswith("["):
            if not patched:
                new_lines.append(f'audio = "{OUTPUT_NAME}"')
                patched = True
            in_extra = False

        new_lines.append(line)

    if in_extra and not patched:
        new_lines.append(f'audio = "{OUTPUT_NAME}"')
        patched = True

    if not patched:
        new_lines.append("[extra]")
        new_lines.append(f'audio = "{OUTPUT_NAME}"')

    new_front_matter = "\n".join(new_lines).strip()
    with open(path, "w") as f:
        f.write(f"+++\n{new_front_matter}\n+++{body}")


def fix_pronunciation(text):
    """Replace words with phonetic respellings for better TTS pronunciation."""
    for word, respelling in PRONUNCIATION_FIXES.items():
        text = re.sub(rf'\b{re.escape(word)}\b', respelling, text, flags=re.IGNORECASE)
    return text


def chunk_text(text, max_words=100):
    """Split text into chunks by sentences, respecting max word count."""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current_chunk = []
    current_words = 0

    for sentence in sentences:
        sentence_words = len(sentence.split())
        if current_words + sentence_words > max_words and current_chunk:
            chunks.append(' '.join(current_chunk))
            current_chunk = [sentence]
            current_words = sentence_words
        else:
            current_chunk.append(sentence)
            current_words += sentence_words

    if current_chunk:
        chunks.append(' '.join(current_chunk))

    return chunks


def generate_audio(text, output_path):
    """Generate TTS using Qwen3-TTS and encode to Opus via ffmpeg."""
    import numpy as np
    import torch
    from scipy.io import wavfile

    model = get_qwen_model()

    chunks = chunk_text(text, max_words=100)
    print(f"  Generating {len(chunks)} chunk(s)...", file=sys.stderr)

    # Build the voice clone prompt once (extracts speaker embedding).
    try:
        if REFERENCE_TEXT:
            prompt = model.create_voice_clone_prompt(
                ref_audio=VOICE_REFERENCE,
                ref_text=REFERENCE_TEXT,
                x_vector_only_mode=False,
            )
        else:
            prompt = model.create_voice_clone_prompt(
                ref_audio=VOICE_REFERENCE,
                x_vector_only_mode=True,
            )
    except Exception as e:
        print(f"  Failed to build voice clone prompt: {e}", file=sys.stderr)
        return False

    with torch.inference_mode():
        try:
            wavs, sr = model.generate_voice_clone(
                text=chunks,
                language=[LANGUAGE] * len(chunks),
                voice_clone_prompt=prompt,
            )
        except Exception as e:
            print(f"  Qwen3-TTS generation failed: {e}", file=sys.stderr)
            return False

    all_audio = []
    for i, wav in enumerate(wavs, 1):
        print(f"  Chunk {i}/{len(wavs)} done", file=sys.stderr)
        audio_np = wav.cpu().numpy() if hasattr(wav, "cpu") else np.asarray(wav)
        if audio_np.ndim == 2:
            audio_np = audio_np[0]
        if audio_np.size == 0:
            print(f"  Empty audio generated for chunk {i}", file=sys.stderr)
            return False
        all_audio.append(audio_np)

    combined_audio = np.concatenate(all_audio)

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_wav:
        tmp_wav_path = tmp_wav.name

    try:
        audio_np = np.clip(combined_audio, -1.0, 1.0)
        audio_int16 = (audio_np * 32767).astype(np.int16)
        wavfile.write(tmp_wav_path, sr, audio_int16)
    except Exception as e:
        print(f"  Failed to save WAV: {e}", file=sys.stderr)
        if os.path.exists(tmp_wav_path):
            os.unlink(tmp_wav_path)
        return False

    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-i", tmp_wav_path,
        "-c:a", "libopus",
        "-b:a", "32k",
        "-application", "voip",
        output_path,
    ]

    result = subprocess.run(ffmpeg_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    os.unlink(tmp_wav_path)

    if result.returncode != 0:
        print(f"  ffmpeg failed: {result.stderr.decode()}", file=sys.stderr)
        return False

    return True


def process_post(post_dir, dry_run=False, enforce_min_words=True, force=False):
    """Process a single post directory."""
    index_path = os.path.join(post_dir, "index.md")
    if not os.path.exists(index_path):
        print(f"  Skipping {post_dir}: no index.md")
        return

    front_matter, body, title = parse_post(index_path)
    if front_matter is None:
        print(f"  Skipping {post_dir}: could not parse front matter")
        return

    if not force and has_audio(front_matter):
        print(f"  Skipping {post_dir}: already has audio")
        return

    print(f"  Processing: {title or post_dir}")

    plain_text = strip_markdown(body)
    if not plain_text:
        print(f"  Skipping {post_dir}: no text content")
        return

    spoken_text = f"{title}.\n\n{plain_text}" if title else plain_text
    spoken_text = fix_pronunciation(spoken_text)

    word_count = len(spoken_text.split())

    if enforce_min_words and word_count < MIN_WORDS:
        print(f"  Skipping {post_dir}: only {word_count} words (minimum {MIN_WORDS})")
        return

    if dry_run:
        print(f"  [dry-run] Would generate ~{word_count} words of speech")
        return

    output_path = os.path.join(post_dir, OUTPUT_NAME)
    if not generate_audio(spoken_text, output_path):
        return

    size = os.path.getsize(output_path)
    print(f"  Generated: {output_path} ({size / 1024:.0f} KB)")

    patch_front_matter(index_path, front_matter, body)
    print(f"  Patched front matter: {index_path}")


def find_latest_post():
    """Return the newest post directory (by the date in its name)."""
    dated = []
    for post_dir in glob.glob(os.path.join(REPO_ROOT, "content/posts/*/")):
        name = os.path.basename(post_dir.rstrip("/"))
        m = re.match(r"(\d{4}-\d{2}-\d{2})", name)
        if m:
            dated.append((m.group(1), post_dir.rstrip("/")))
    if not dated:
        sys.exit("No dated posts found under content/posts/")
    return sorted(dated)[-1][1]


def main():
    parser = argparse.ArgumentParser(
        description="Generate TTS audio for blog posts using Qwen3-TTS",
        epilog="With no arguments the latest post is generated (and forced).",
    )
    parser.add_argument("post_dir", nargs="?", help="Path to a post directory (default: latest post)")
    parser.add_argument("--all", action="store_true", help="Process all posts")
    parser.add_argument("--force", action="store_true", help="Regenerate even if audio exists")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done")
    parser.add_argument("--model", default=MODEL_NAME, help="Hugging Face / local model id")
    parser.add_argument("--language", default=LANGUAGE, help="Language for synthesis (e.g. English, Auto)")
    parser.add_argument("--ref-text", default=REFERENCE_TEXT, help="Transcript of the reference audio")
    args = parser.parse_args()

    globals().update(
        MODEL_NAME=args.model,
        LANGUAGE=args.language,
        REFERENCE_TEXT=args.ref_text,
    )

    if not os.path.exists(VOICE_REFERENCE):
        sys.exit(f"Voice reference file not found at {VOICE_REFERENCE}")

    if subprocess.run(["bash", "-lc", "command -v ffmpeg"], stdout=subprocess.DEVNULL).returncode != 0:
        sys.exit("ffmpeg not found. Install it (e.g. 'brew install ffmpeg' or your distro package).")

    # Work from the repo root so relative post globs behave predictably.
    os.chdir(REPO_ROOT)

    if args.all:
        posts = sorted(glob.glob("content/posts/*/"))
        print(f"Found {len(posts)} post directories")
        for post_dir in posts:
            process_post(post_dir.rstrip("/"), args.dry_run,
                         enforce_min_words=True, force=args.force)
    else:
        post_dir = args.post_dir or find_latest_post()
        # Explicit / latest target: skip the word-count gate and regenerate.
        process_post(post_dir.rstrip("/"), args.dry_run,
                     enforce_min_words=False, force=True)


if __name__ == "__main__":
    ensure_environment()

    # Imported lazily so the bootstrap (which runs with plain system python)
    # never needs the heavy dependencies.
    from qwen_tts import Qwen3TTSModel  # noqa: E402

    main()
