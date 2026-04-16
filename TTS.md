# Text-to-Speech for Blog Posts

Generate spoken audio for blog articles using [Piper](https://github.com/rhasspy/piper) — a fast, offline, neural TTS engine. No cloud APIs, no Python venv headaches.

## Why Piper

- Standalone binary — no pip, no brew dependencies
- `espeak-ng` (the only runtime dep) is already installed on GNOME OS
- Generates a 700-word post in ~3 seconds on CPU
- Good "news reader" quality, consistent voice across posts
- Completely offline

Coqui TTS (`pip install TTS`) requires Python <3.12 and the project is abandoned. `pocket-tts` from brew works but pulls in PyTorch (~2 GB). Piper is the pragmatic choice.

## Install Piper

```bash
# Download the prebuilt binary (~20 MB)
mkdir -p ~/Applications
curl -L https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz \
  | tar xz -C ~/Applications/

# Verify it runs
~/Applications/piper/piper --help
```

This gives you `~/Applications/piper/piper` plus its bundled `espeak-ng-data` and libs.

## Download a Voice

Voice models are ONNX files (~60 MB each) hosted on Hugging Face. Each voice needs two files: the `.onnx` model and its `.onnx.json` config.

Preview voices at https://rhasspy.github.io/piper-samples/ before downloading.

```bash
mkdir -p ~/Applications/piper/voices

# Example: "Amy" (US English, medium quality — natural and clear)
cd ~/Applications/piper/voices
curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx
curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx.json
```

Some other good English voices to try:

| Voice | Accent | ID |
|-------|--------|----|
| Amy | US | `en_US-amy-medium` |
| Lessac | US | `en_US-lessac-medium` |
| Jenny | UK | `en_GB-jenny_dioco-medium` |
| Alan | UK | `en_GB-alan-medium` |
| Joe | US | `en_US-joe-medium` |

## Generate Audio for a Post

### Quick test

```bash
echo "Hello, this is a test of the text to speech system." \
  | ~/Applications/piper/piper \
      --model ~/Applications/piper/voices/en_US-amy-medium.onnx \
      --output_file test.wav

# Play it (if pw-play is available on GNOME OS)
pw-play test.wav
```

### From a blog post

Piper reads plain text from stdin. Blog posts need markdown/front matter stripped first:

```bash
# Strip TOML front matter (between +++ delimiters) and markdown syntax
POST="content/posts/2026-04-20-app-icon-requests/index.md"

sed '1,/^+++$/{ /^+++$/,/^+++$/d }' "$POST" \
  | sed 's/!\[.*\](.*)//' \          # remove images
  | sed 's/\[([^]]*)\]([^)]*)/\1/g' \ # links -> text only
  | sed 's/[*_`#]//g' \               # remove emphasis/code/headings markers
  | ~/Applications/piper/piper \
      --model ~/Applications/piper/voices/en_US-amy-medium.onnx \
      --output_file speech.wav
```

### Compress to OGG/Opus (recommended)

Raw WAV files are large (~5 MB for a 700-word post). Compress with ffmpeg:

```bash
ffmpeg -i speech.wav -c:a libopus -b:a 48k -ar 48000 speech.opus
# Result: ~200-400 KB for a typical post
```

Or to MP3 if you prefer wider compatibility:

```bash
ffmpeg -i speech.wav -c:a libmp3lame -q:a 6 speech.mp3
# Result: ~500-700 KB
```

## Blog Integration

The blog already has a custom audio player (`static/assets/js/audio-player.js`) that upgrades any `<audio controls>` element. To wire up TTS audio:

### 1. Add audio front matter

In the post's `index.md`:

```toml
+++
title = "My Post"
date = 2026-04-14
[extra]
audio = "speech.opus"
+++
```

### 2. Update the post template

In `templates/post.html`, add this block after the header and before `page.content`:

```html
{% if page.extra.audio %}
<audio controls preload="metadata">
  <source src="{{ page.extra.audio }}" type="audio/ogg; codecs=opus">
  Your browser does not support the audio element.
</audio>
{% endif %}
```

The existing `audio-player.js` (already loaded in `post.html`) will automatically pick it up and render the styled player with playback controls.

### 3. Place the audio file

Drop the `.opus` file into the post's asset directory alongside `index.md`:

```
content/posts/2026-04-20-app-icon-requests/
  index.md
  speech.opus    <-- here
  thumb.webp
  ...
```

Zola's asset colocation handles the rest.

## Batch Script

A convenience script to generate audio for all posts (or only those missing it):

```bash
#!/bin/bash
# generate-tts.sh — run from the blog root

PIPER=~/Applications/piper/piper
MODEL=~/Applications/piper/voices/en_US-amy-medium.onnx

for post in content/posts/*/index.md; do
  dir=$(dirname "$post")
  out="$dir/speech.opus"

  # Skip if audio already exists
  [ -f "$out" ] && continue

  echo "Generating: $post"

  # Strip front matter and markdown, feed to piper, encode
  sed '/^+++$/,/^+++$/d' "$post" \
    | sed 's/!\[.*\](.*)//' \
    | sed 's/\[[^]]*\]([^)]*)//g' \
    | sed 's/[*_`#>]//g' \
    | sed '/^$/d' \
    | $PIPER --model "$MODEL" --output_file /tmp/tts_tmp.wav 2>/dev/null

  ffmpeg -y -i /tmp/tts_tmp.wav -c:a libopus -b:a 48k -ar 48000 "$out" 2>/dev/null
  rm -f /tmp/tts_tmp.wav

  echo "  -> $out ($(du -h "$out" | cut -f1))"
done
```

## Tuning

- **Speed:** Add `--length_scale 1.1` to piper for slightly slower speech (default 1.0, higher = slower)
- **Sentence pauses:** Add `--sentence_silence 0.5` for half-second pauses between sentences
- **Quality tiers:** Voices come in `x_low`, `low`, `medium`, `high` — medium is the sweet spot for file size vs. quality
- **Multiple speakers:** Some voices (like `vctk`) have multiple speakers, selectable with `--speaker <id>`

## File Size Budget

| Format | Bitrate | ~700 words (~3 min) |
|--------|---------|---------------------|
| WAV | uncompressed | ~5 MB |
| Opus | 48 kbps | ~200 KB |
| MP3 | ~80 kbps (VBR q6) | ~500 KB |

Opus at 48k is excellent for speech. The files are small enough to colocate with posts and deploy via GitHub Pages without concern.
