#!/Users/jsteiner/src/blog.jimmac.eu/venv-py310/bin/python
"""Generate text-to-speech audio for blog posts using Chatterbox TTS."""

import argparse
import glob
import os
import re
import subprocess
import sys
import tempfile

# Chatterbox imports
try:
    from chatterbox.tts_turbo import ChatterboxTurboTTS
    import torch
    import numpy as np
    from scipy.io import wavfile
    # Set default dtype to float32 to avoid dtype mismatch errors
    torch.set_default_dtype(torch.float32)
except ImportError as e:
    print(f"Error: Missing required packages. Install with: pip install chatterbox-tts torch scipy", file=sys.stderr)
    print(f"Details: {e}", file=sys.stderr)
    sys.exit(1)

OUTPUT_NAME = "speech.opus"
MIN_WORDS = 150

# Reference audio for voice cloning
VOICE_REFERENCE = os.path.join(os.path.dirname(__file__), "voice_reference_10s.wav")

# Global model instance (initialized on first use)
_chatterbox_model = None


def get_chatterbox_model():
    """Get or initialize the Chatterbox TTS model (singleton)."""
    global _chatterbox_model
    if _chatterbox_model is None:
        # Determine device (cuda if available, else cpu)
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Initializing Chatterbox TTS model on {device}...", file=sys.stderr)
        _chatterbox_model = ChatterboxTurboTTS.from_pretrained(device=device)
    return _chatterbox_model


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
    # Remove heading markers
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)
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

        # Check if we're entering [extra] section
        if stripped == "[extra]":
            in_extra = True
            new_lines.append(line)
            continue

        # If we're in [extra] and hit an existing audio line, replace it
        if in_extra and re.match(r'^audio\s*=', stripped):
            if not patched:
                new_lines.append(f'audio = "{OUTPUT_NAME}"')
                patched = True
            # Skip any additional audio lines
            continue

        # If we're leaving [extra] section, add audio if we haven't yet
        if in_extra and stripped.startswith("["):
            if not patched:
                new_lines.append(f'audio = "{OUTPUT_NAME}"')
                patched = True
            in_extra = False

        new_lines.append(line)

    # If [extra] was the last section and we haven't patched yet
    if in_extra and not patched:
        new_lines.append(f'audio = "{OUTPUT_NAME}"')
        patched = True

    # If there was no [extra] section at all
    if not patched:
        new_lines.append("[extra]")
        new_lines.append(f'audio = "{OUTPUT_NAME}"')

    new_front_matter = "\n".join(new_lines).strip()
    with open(path, "w") as f:
        f.write(f"+++\n{new_front_matter}\n+++{body}")


def chunk_text(text, max_words=100):
    """Split text into chunks by sentences, respecting max word count."""
    # Split into sentences
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
    """Generate TTS using Chatterbox and encode to Opus via ffmpeg."""
    model = get_chatterbox_model()

    # Split text into chunks to avoid tokenizer truncation
    chunks = chunk_text(text, max_words=100)
    print(f"  Generating {len(chunks)} chunk(s)...", file=sys.stderr)

    all_audio = []

    for i, chunk in enumerate(chunks, 1):
        print(f"  Chunk {i}/{len(chunks)}...", file=sys.stderr)
        try:
            wav = model.generate(chunk, audio_prompt_path=VOICE_REFERENCE)
            # Convert to numpy
            audio_np = wav.cpu().numpy()
            if audio_np.ndim == 2:
                audio_np = audio_np[0]
            all_audio.append(audio_np)
        except Exception as e:
            print(f"  Chatterbox generation failed on chunk {i}: {e}", file=sys.stderr)
            return False

    # Concatenate all audio chunks
    if not all_audio:
        print(f"  No audio generated", file=sys.stderr)
        return False

    combined_audio = np.concatenate(all_audio)

    # Save to temporary WAV file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_wav:
        tmp_wav_path = tmp_wav.name

    try:
        # Normalize to int16 range
        audio_np = np.clip(combined_audio, -1.0, 1.0)
        audio_int16 = (audio_np * 32767).astype(np.int16)
        # Save using scipy
        wavfile.write(tmp_wav_path, model.sr, audio_int16)
    except Exception as e:
        print(f"  Failed to save WAV: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        if os.path.exists(tmp_wav_path):
            os.unlink(tmp_wav_path)
        return False

    # Convert WAV to Opus using ffmpeg
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-i", tmp_wav_path,
        "-c:a", "libopus",
        "-b:a", "32k",
        "-application", "voip",
        output_path,
    ]

    result = subprocess.run(
        ffmpeg_cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    # Clean up temp file
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

    # Prepend title as spoken intro
    spoken_text = f"{title}.\n\n{plain_text}" if title else plain_text
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


def main():
    parser = argparse.ArgumentParser(description="Generate TTS audio for blog posts using Chatterbox")
    parser.add_argument("post_dir", nargs="?", help="Path to a post directory")
    parser.add_argument("--all", action="store_true", help="Process all posts")
    parser.add_argument("--force", action="store_true", help="Regenerate even if audio exists")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done")
    args = parser.parse_args()

    if not args.post_dir and not args.all:
        parser.error("Provide a post directory or use --all")

    if not os.path.exists(VOICE_REFERENCE):
        print(f"Voice reference file not found at {VOICE_REFERENCE}", file=sys.stderr)
        sys.exit(1)

    if args.all:
        posts = sorted(glob.glob("content/posts/*/"))
        print(f"Found {len(posts)} post directories")
        for post_dir in posts:
            process_post(post_dir.rstrip("/"), args.dry_run,
                        enforce_min_words=True, force=args.force)
    else:
        # When explicitly specifying a post, skip the word count check and force regeneration
        process_post(args.post_dir.rstrip("/"), args.dry_run,
                    enforce_min_words=False, force=True)


if __name__ == "__main__":
    main()
