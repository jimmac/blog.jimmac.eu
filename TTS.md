# Text-to-Speech for Blog Posts

Generate spoken audio for blog articles using [Chatterbox TTS](https://github.com/resemble-ai/chatterbox) — a high-quality, voice-cloning neural TTS engine.

## Current System: Chatterbox (Voice Cloning)

The blog now uses **Chatterbox-Turbo**, which clones a reference voice to generate natural-sounding speech. This produces much more human-like voiceovers compared to traditional TTS systems.

### Why Chatterbox

- **Voice cloning** — uses a 10-second audio sample to replicate your voice
- **High quality** — sounds significantly more natural than Piper or similar TTS
- **Paralinguistic features** — supports `[laugh]`, `[chuckle]`, etc. tags
- **Open source** — from Resemble AI
- Works on CPU (no GPU required, though GPU accelerates generation)

### Requirements

- Python 3.10 or 3.11 (Python 3.14+ has compatibility issues)
- ~2 GB disk space for model files
- ffmpeg (for audio encoding)
- A 10-second reference audio clip of the target voice

## Installation

Works on both macOS and GNOME OS using Homebrew.

```bash
# Install Python 3.10 if needed (via Homebrew)
brew install python@3.10

# Install ffmpeg if not already installed
brew install ffmpeg

# Create virtual environment
python3.10 -m venv venv-py310

# Activate it
source venv-py310/bin/activate

# Install dependencies
pip install -r requirements-tts.txt

# If requirements-tts.txt doesn't exist, install manually:
pip install chatterbox-tts torch torchaudio scipy

# Downgrade setuptools to get pkg_resources (required by Perth watermarker)
pip install 'setuptools<72'
```

## Prepare Voice Reference

Chatterbox requires a 10-second audio clip to clone the voice:

```bash
# Convert your reference audio to the correct format
# Input: any audio file (m4a, mp3, wav, etc.)
# Output: 24kHz mono WAV, exactly 10 seconds

ffmpeg -i ~/path/to/your/voice-recording.m4a \
  -t 10 \
  -ar 24000 \
  -ac 1 \
  scripts/voice_reference_10s.wav
```

**Requirements for reference audio:**
- At least 10 seconds of clean speech
- Single speaker
- Minimal background noise
- Natural speaking pace
- The script will use the first 10 seconds

## Generate Audio for Posts

### Single post

```bash
./scripts/generate-tts.py content/posts/POST-NAME
```

Example:
```bash
./scripts/generate-tts.py content/posts/2026-04-05-japan
```

### All posts

```bash
./scripts/generate-tts.py --all
```

This will:
- Skip posts under 150 words
- Skip posts that already have audio (unless --force is used)
- Generate chunked audio for longer posts (100 words per chunk)
- Concatenate chunks into single Opus file
- Update front matter with `audio = "speech.opus"`

### Force regeneration

```bash
./scripts/generate-tts.py --all --force
```

### Dry run (preview without generating)

```bash
./scripts/generate-tts.py --all --dry-run
```

## How It Works

The `generate-tts.py` script:

1. **Reads the post** — parses front matter and body
2. **Strips markdown** — removes images, links, code blocks, etc.
3. **Chunks text** — splits into ~100 word segments (to avoid tokenizer truncation)
4. **Generates audio** — uses Chatterbox with your voice reference for each chunk
5. **Concatenates chunks** — combines into single audio stream
6. **Encodes to Opus** — compresses to ~200-500 KB using ffmpeg
7. **Updates front matter** — adds `audio = "speech.opus"` to `[extra]` section

## Output Format

- **Format:** Ogg Opus
- **Bitrate:** 32 kbps (optimized for voice)
- **Sample rate:** 24 kHz
- **File size:** ~200-500 KB for typical posts
- **Location:** `content/posts/POST-NAME/speech.opus`

## Blog Integration

The blog is already configured to use TTS audio:

1. The `post.html` template checks for `page.extra.audio`
2. If present, renders an `<audio>` element
3. The audio player JavaScript (`static/assets/js/audio-player.js`) enhances it

No additional setup needed — just generate the audio files.

## Troubleshooting

### Python version issues

Chatterbox requires Python 3.10 or 3.11. Python 3.14+ has dtype compatibility issues.

```bash
# Check your Python version
python3.10 --version

# If not installed
brew install python@3.10
```

### setuptools/pkg_resources error

The Perth watermarker requires `pkg_resources` which was removed in setuptools 72+:

```bash
source venv-py310/bin/activate
pip install 'setuptools<72'
```

### Audio is truncated/short

This was an issue with the initial implementation. The current script chunks text into 100-word segments to avoid tokenizer truncation. Make sure you're using the latest version of `generate-tts.py`.

### ffmpeg not found

```bash
brew install ffmpeg
```

## Performance

**On Apple Silicon M4 (CPU):**
- Model loading: ~5 seconds (first time only)
- Generation: ~2-3 seconds per 100-word chunk
- Typical 500-word post: ~30-40 seconds total

**On GNOME OS (CPU):**
- Similar performance to macOS
- GPU acceleration available with CUDA (much faster on NVIDIA hardware)

**GPU Acceleration (GNOME OS):**

**For NVIDIA GPUs:**

Install CUDA-enabled PyTorch for significant speedup:

```bash
source venv-py310/bin/activate

# Replace cu121 with your CUDA version (check with: nvidia-smi)
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121
```

**For AMD GPUs (experimental):**

AMD RDNA 1 GPUs (RX 5700 XT, RX 5600 XT) are not officially supported by ROCm, but you can try the community workaround:

```bash
source venv-py310/bin/activate
pip install torch-amd-setup
```

This package auto-detects RDNA 1 GPUs and configures the necessary environment. Test if it worked:

```bash
python -c "import torch; print(f'GPU: {torch.cuda.is_available()}')"
```

**Note:** RDNA 3+ GPUs have better official ROCm support. RDNA 1 support is community-maintained and may not work reliably. CPU generation is stable and reasonably fast.

The script automatically detects and uses GPU if available.

## File Structure

```
blog.jimmac.eu/
├── scripts/
│   ├── generate-tts.py          # Main TTS generation script
│   ├── voice_reference_10s.wav  # 10-second voice reference
│   └── test-chatterbox.py       # Test script
├── venv-py310/                  # Python 3.10 virtual environment
├── requirements-tts.txt         # Python dependencies
└── content/posts/
    └── POST-NAME/
        ├── index.md
        └── speech.opus          # Generated audio
```

## Advanced Usage

### Custom voice reference per generation

Edit `scripts/generate-tts.py` and change the `VOICE_REFERENCE` path, or modify the `generate_audio()` function to accept a reference path parameter.

### Adjust chunk size

Edit `scripts/generate-tts.py` and modify the `max_words` parameter in `chunk_text()`:

```python
# Default: 100 words per chunk
chunks = chunk_text(text, max_words=100)

# For longer chunks (faster but may hit tokenizer limit):
chunks = chunk_text(text, max_words=150)

# For shorter chunks (slower but more reliable):
chunks = chunk_text(text, max_words=75)
```

### Custom pronunciation

If certain words or names are mispronounced, add them to the pronunciation dictionary in `scripts/generate-tts.py`:

```python
# Around line 29
PRONUNCIATION_FIXES = {
    "gesceap": "yeh-SHAP",        # IPA: /jeˈʃæ͜ɑp/
    "Gesceap": "yeh-SHAP",
    "your-word": "phonetic spelling",
}
```

Tips for phonetic respelling:
- Use simple phonetic spelling (e.g., "yeh-SHAP" instead of IPA)
- Add both lowercase and capitalized versions
- Test different respellings to find what sounds best
- Hyphens can help emphasize syllable breaks

### Paralinguistic tags

Add emotion tags to your blog posts (they'll be preserved through markdown stripping):

```markdown
This is amazing [chuckle]. Really, I can't believe it [laugh].
Hold on [cough], let me explain...
```

## Alternative: Piper (Legacy)

The previous TTS system used Piper, a simpler neural TTS without voice cloning. Instructions preserved below for reference.

<details>
<summary>Click to expand Piper documentation</summary>

### Install Piper

```bash
# Download the prebuilt binary (~20 MB)
mkdir -p ~/Applications
curl -L https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz \
  | tar xz -C ~/Applications/

# Verify it runs
~/Applications/piper/piper --help
```

### Download a Voice

```bash
mkdir -p ~/Applications/piper/voices
cd ~/Applications/piper/voices
curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx
curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx.json
```

### Generate with Piper

```bash
echo "Test" | ~/Applications/piper/piper \
  --model ~/Applications/piper/voices/en_US-amy-medium.onnx \
  --output_file test.wav
```

</details>

## License & Credits

- **Chatterbox TTS:** [Resemble AI](https://github.com/resemble-ai/chatterbox)
- **Perth Watermarker:** Embedded in generated audio
- **Blog theme:** Based on [klise](https://github.com/piharpi/jekyll-klise)
