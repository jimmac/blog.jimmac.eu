#!/usr/bin/env python3
"""Generate text-to-speech audio for blog posts using Piper TTS."""

import argparse
import glob
import json
import os
import platform
import re
import subprocess
import sys

# Platform-specific paths
if platform.system() == "Darwin":  # macOS
    # Use Python piper-tts package (native ARM64 support)
    # Try to find piper in PATH first, then check user pip bin directory
    import shutil
    piper_path = shutil.which("piper")
    if not piper_path:
        # Construct path based on current Python version
        py_version = f"{sys.version_info.major}.{sys.version_info.minor}"
        piper_path = os.path.expanduser(f"~/Library/Python/{py_version}/bin/piper")
    PIPER = piper_path
    MODEL = os.path.expanduser("~/Applications/piper/voices/en_US-joe-medium.onnx")
else:  # Linux
    PIPER = os.path.expanduser("~/Applications/piper/piper")
    MODEL = os.path.expanduser("~/Applications/piper/voices/en_US-joe-medium.onnx")

MODEL_CONFIG = MODEL + ".json"
OUTPUT_NAME = "speech.opus"
MIN_WORDS = 150


def get_sample_rate():
    with open(MODEL_CONFIG) as f:
        config = json.load(f)
    return config["audio"]["sample_rate"]


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


def generate_audio(text, output_path, sample_rate):
    """Run Piper TTS and encode to Opus via ffmpeg."""
    piper_cmd = [
        PIPER,
        "--model", MODEL,
        "--output_raw",
        "--sentence_silence", "0.3",
    ]
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-f", "s16le",
        "-ar", str(sample_rate),
        "-ac", "1",
        "-i", "pipe:",
        "-c:a", "libopus",
        "-b:a", "32k",
        "-application", "voip",
        output_path,
    ]

    piper = subprocess.Popen(
        piper_cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    ffmpeg = subprocess.Popen(
        ffmpeg_cmd,
        stdin=piper.stdout,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    # Close piper's stdout in parent so ffmpeg gets EOF when piper finishes
    piper.stdout.close()
    piper.stdin.write(text.encode("utf-8"))
    piper.stdin.close()

    _, ffmpeg_err = ffmpeg.communicate()
    piper.wait()

    if piper.returncode != 0:
        print(f"  Piper failed (exit {piper.returncode})", file=sys.stderr)
        return False
    if ffmpeg.returncode != 0:
        print(f"  ffmpeg failed: {ffmpeg_err.decode()}", file=sys.stderr)
        return False

    return True


def process_post(post_dir, sample_rate, dry_run=False, enforce_min_words=True, force=False):
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
    if not generate_audio(spoken_text, output_path, sample_rate):
        return

    size = os.path.getsize(output_path)
    print(f"  Generated: {output_path} ({size / 1024:.0f} KB)")

    patch_front_matter(index_path, front_matter, body)
    print(f"  Patched front matter: {index_path}")


def main():
    parser = argparse.ArgumentParser(description="Generate TTS audio for blog posts")
    parser.add_argument("post_dir", nargs="?", help="Path to a post directory")
    parser.add_argument("--all", action="store_true", help="Process all posts")
    parser.add_argument("--force", action="store_true", help="Regenerate even if audio exists")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done")
    args = parser.parse_args()

    if not args.post_dir and not args.all:
        parser.error("Provide a post directory or use --all")

    if not os.path.exists(PIPER):
        print(f"Piper not found at {PIPER}", file=sys.stderr)
        sys.exit(1)
    if not os.path.exists(MODEL):
        print(f"Voice model not found at {MODEL}", file=sys.stderr)
        sys.exit(1)

    sample_rate = get_sample_rate()

    if args.all:
        posts = sorted(glob.glob("content/posts/*/"))
        print(f"Found {len(posts)} post directories")
        for post_dir in posts:
            process_post(post_dir.rstrip("/"), sample_rate, args.dry_run,
                        enforce_min_words=True, force=args.force)
    else:
        # When explicitly specifying a post, skip the word count check and force regeneration
        process_post(args.post_dir.rstrip("/"), sample_rate, args.dry_run,
                    enforce_min_words=False, force=True)


if __name__ == "__main__":
    main()
