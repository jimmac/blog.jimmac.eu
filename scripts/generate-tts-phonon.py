#!/usr/bin/env python3
"""Generate spoken audio (Opus) for blog posts using Ollama + Phonon.

A macOS/Apple Silicon alternative to generate-tts.py (Qwen3-TTS). No Python
virtualenv, no model downloads in Python: it talks to a local Ollama server and
uses one of Phonon's built-in voices. Requires Ollama 0.40.9+ with the model
pulled:

    ollama pull phonon

Usage:

    ./scripts/generate-tts-phonon.py                 # latest post
    ./scripts/generate-tts-phonon.py content/posts/NAME
    ./scripts/generate-tts-phonon.py --all

Output is `speech.opus` next to the post's index.md, same as the Qwen script.
"""

import argparse
import glob
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
import wave

# --------------------------------------------------------------------------
# Paths and defaults
# --------------------------------------------------------------------------

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

OUTPUT_NAME = "speech.opus"
MIN_WORDS = 150

DEFAULT_MODEL = "phonon"
DEFAULT_VOICE = "default"
DEFAULT_HOST = "http://localhost:11434"

# Phonon returns raw 16-bit little-endian mono at 24 kHz.
SAMPLE_RATE = 24000
SAMPLE_WIDTH = 2
CHANNELS = 1

# The speech API accepts up to 4096 characters per request.
MAX_CHARS = 4000

# Pronunciation dictionary - map words to phonetic respellings.
PRONUNCIATION_FIXES = {
    "gesceap": "yeh-SHAP",
    "Gesceap": "yeh-SHAP",
    "GNOME": "NOME",
}


# --------------------------------------------------------------------------
# Ollama helpers
# --------------------------------------------------------------------------


def ollama_host():
    """Return the Ollama base URL, honouring OLLAMA_HOST."""
    host = os.environ.get("OLLAMA_HOST", DEFAULT_HOST).strip() or DEFAULT_HOST
    if "://" not in host:
        host = "http://" + host
    return host.rstrip("/")


def api_error_message(body):
    """Extract a human-readable error from an Ollama error response."""
    try:
        return json.loads(body.decode()).get("error") or body.decode().strip()
    except Exception:
        return body.decode(errors="replace").strip()


def check_environment(model):
    """Verify ollama, the server, and the requested model are available."""
    if shutil.which("ollama") is None:
        sys.exit(
            "ERROR: ollama not found.\n"
            "Install it on macOS with 'brew install ollama' (or download it from\n"
            "https://ollama.com/download) and run this script again."
        )

    try:
        with urllib.request.urlopen(f"{ollama_host()}/api/tags", timeout=10) as response:
            tags = json.load(response)
    except Exception as e:
        sys.exit(
            f"ERROR: cannot reach Ollama at {ollama_host()} ({e}).\n"
            "Start it with 'ollama serve' (or launch the Ollama app) and try again."
        )

    names = {m.get("name", "") for m in tags.get("models", [])}
    if model not in names and f"{model}:latest" not in names:
        sys.exit(
            f"ERROR: model '{model}' is not installed.\n"
            f"Pull it with 'ollama pull {model}' and try again."
        )


def synthesize(text, model, voice):
    """Generate one chunk of speech, returning raw 16-bit mono PCM."""
    payload = json.dumps(
        {
            "model": model,
            "input": text,
            "voice": voice,
            "response_format": "pcm",
        }
    ).encode()
    request = urllib.request.Request(
        f"{ollama_host()}/v1/audio/speech",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=600) as response:
            return response.read()
    except urllib.error.HTTPError as e:
        raise RuntimeError(api_error_message(e.read())) from e
    except urllib.error.URLError as e:
        raise RuntimeError(f"cannot reach Ollama at {ollama_host()}: {e.reason}") from e


# --------------------------------------------------------------------------
# Post parsing
# --------------------------------------------------------------------------


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


def chunk_text(text, max_chars=MAX_CHARS):
    """Split text into sentence-aligned chunks under the API character limit."""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current = ""

    for sentence in sentences:
        # Hard-wrap sentences that are longer than a whole request on their own.
        while len(sentence) > max_chars:
            split_at = sentence.rfind(" ", 0, max_chars)
            if split_at <= 0:
                split_at = max_chars
            if current:
                chunks.append(current)
                current = ""
            chunks.append(sentence[:split_at].strip())
            sentence = sentence[split_at:].lstrip()

        if not sentence:
            continue
        if current and len(current) + 1 + len(sentence) > max_chars:
            chunks.append(current)
            current = sentence
        else:
            current = f"{current} {sentence}".strip()

    if current:
        chunks.append(current)

    return chunks


def generate_audio(text, output_path, model, voice):
    """Generate speech chunk by chunk and encode the result to Opus via ffmpeg."""
    chunks = chunk_text(text)
    if not chunks:
        print("  No text to synthesize", file=sys.stderr)
        return False

    print(f"  Generating {len(chunks)} chunk(s)...", file=sys.stderr)

    pcm = bytearray()
    for i, chunk in enumerate(chunks, 1):
        try:
            audio = synthesize(chunk, model, voice)
        except Exception as e:
            print(f"  Phonon generation failed on chunk {i}: {e}", file=sys.stderr)
            return False
        if not audio:
            print(f"  Empty audio generated for chunk {i}", file=sys.stderr)
            return False
        pcm.extend(audio)
        print(f"  Chunk {i}/{len(chunks)} done", file=sys.stderr)

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_wav:
        tmp_wav_path = tmp_wav.name

    try:
        try:
            with wave.open(tmp_wav_path, "wb") as wav:
                wav.setnchannels(CHANNELS)
                wav.setsampwidth(SAMPLE_WIDTH)
                wav.setframerate(SAMPLE_RATE)
                wav.writeframes(bytes(pcm))

            ffmpeg_cmd = [
                "ffmpeg", "-y",
                "-i", tmp_wav_path,
                "-c:a", "libopus",
                "-b:a", "32k",
                "-application", "voip",
                output_path,
            ]

            result = subprocess.run(ffmpeg_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        except Exception as e:
            print(f"  Failed to write audio: {e}", file=sys.stderr)
            return False
    finally:
        os.unlink(tmp_wav_path)

    if result.returncode != 0:
        print(f"  ffmpeg failed: {result.stderr.decode()}", file=sys.stderr)
        return False

    return True


def process_post(post_dir, model, voice, dry_run=False, enforce_min_words=True, force=False):
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
        chunks = chunk_text(spoken_text)
        print(f"  [dry-run] Would generate ~{word_count} words in {len(chunks)} chunk(s)")
        return

    output_path = os.path.join(post_dir, OUTPUT_NAME)
    if not generate_audio(spoken_text, output_path, model, voice):
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
        description="Generate TTS audio for blog posts using Ollama + Phonon",
        epilog="With no arguments the latest post is generated (and forced).",
    )
    parser.add_argument("post_dir", nargs="?", help="Path to a post directory (default: latest post)")
    parser.add_argument("--all", action="store_true", help="Process all posts")
    parser.add_argument("--force", action="store_true", help="Regenerate even if audio exists")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Ollama speech model (default: phonon)")
    parser.add_argument("--voice", default=DEFAULT_VOICE, help="Phonon voice name (see 'ollama show phonon')")
    args = parser.parse_args()

    if shutil.which("ffmpeg") is None:
        sys.exit("ffmpeg not found. Install it (e.g. 'brew install ffmpeg' or your distro package).")

    check_environment(args.model)

    # Work from the repo root so relative post globs behave predictably.
    os.chdir(REPO_ROOT)

    if args.all:
        posts = sorted(glob.glob("content/posts/*/"))
        print(f"Found {len(posts)} post directories")
        for post_dir in posts:
            process_post(post_dir.rstrip("/"), args.model, args.voice,
                         args.dry_run, enforce_min_words=True, force=args.force)
    else:
        post_dir = args.post_dir or find_latest_post()
        # Explicit / latest target: skip the word-count gate and regenerate.
        process_post(post_dir.rstrip("/"), args.model, args.voice,
                     args.dry_run, enforce_min_words=False, force=True)


if __name__ == "__main__":
    # Keep progress output in order when stdout is redirected to a file/pipe.
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(line_buffering=True)
    main()
