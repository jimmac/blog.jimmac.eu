# Text-to-Speech for Blog Posts

Generate spoken audio for blog articles using either **Chatterbox TTS** (voice cloning, MIT) or **Qwen3-TTS** (Apache 2.0). Both run locally, clone the 10-second reference voice, and share the same CLI.

## Prerequisites

- Python 3.10
- ffmpeg
- `scripts/voice_reference_10s.wav` — 10s of clean, single-speaker audio (24kHz mono)

## Chatterbox Setup

```bash
python3.10 -m venv venv-py310
source venv-py310/bin/activate
pip install -r requirements-tts.txt
pip install 'setuptools<72'   # pkg_resources compat for Perth watermarker
```

## Qwen3-TTS Setup

Separate venv required (pins an incompatible transformers version).

```bash
python3.10 -m venv venv-qwen
source venv-qwen/bin/activate
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install --no-deps qwen-tts
pip install "transformers==4.57.3" "accelerate==1.12.0" librosa soundfile onnxruntime einops sox
```

The CUDA/GPU index for torch is only relevant if you have an NVIDIA GPU.

### macOS (Apple Silicon) via Homebrew

On M1/M2/M3/M4 the PyPI PyTorch build is already Metal-accelerated — no `--index-url` needed.

```bash
brew install python@3.10 ffmpeg
python3.10 -m venv venv-qwen
source venv-qwen/bin/activate
pip install torch torchaudio
pip install --no-deps qwen-tts
pip install "transformers==4.57.3" "accelerate==1.12.0" librosa soundfile onnxruntime einops sox
```

`--model Qwen/Qwen3-TTS-12Hz-1.7B-Base` swaps to the larger checkpoint if your M-series can handle it.

### Reference transcript (Qwen only)

Qwen3-TTS needs the transcript of the reference clip for full cloning quality. Set it in `scripts/generate-tts-qwen.py`:

```python
REFERENCE_TEXT = "Whatever is spoken in the first 10 seconds of voice_reference_10s.wav"
```

Leave it empty to fall back to embedding-only cloning (lower fidelity but works).

## Generate Audio

Both scripts use the same syntax.

```bash
source venv-py310/bin/activate      # or venv-qwen
./scripts/generate-tts.py content/posts/POST-NAME
./scripts/generate-tts.py --all
./scripts/generate-tts.py --all --force
./scripts/generate-tts.py --all --dry-run
```

`--all` skips posts under 150 words and posts that already have audio (unless `--force`). Each post is chunked (~100 words), generated, concatenated, and encoded to Opus (32 kbps) as `content/posts/POST-NAME/speech.opus`, and `audio = "speech.opus"` is added to the post's `[extra]` front matter. The blog template renders this automatically.

For Qwen, optional extras: `--model`, `--language`, `--ref-text`.

## Notes

- Chatterbox supports `[laugh]`, `[chuckle]` etc. paralinguistic tags; Qwen does not.
- Qwen3-TTS is noticeably slower on CPU-only machines (~minutes per 100-word chunk, vs seconds for Chatterbox).
- If words are mispronounced, add phonetic respellings to `PRONUNCIATION_FIXES` in the respective script (e.g. `"GNOME": "NOME"`).

## File Structure

```
scripts/
├── generate-tts.py          # Chatterbox
├── generate-tts-qwen.py     # Qwen3-TTS
└── voice_reference_10s.wav
content/posts/POST-NAME/speech.opus
```