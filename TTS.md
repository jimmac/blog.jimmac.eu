# TTS

Voiceovers are generated locally with **Qwen3-TTS**, cloned from a 10-second reference clip.

## Usage

- `./scripts/generate-tts.py` — latest post (default)
- `./scripts/generate-tts.py content/posts/POST-NAME` — a specific post
- `./scripts/generate-tts.py --all [--force] [--dry-run]`

- The script sets up its own venv (`venv-qwen`) and installs dependencies on first run. Requires Python 3.10 and `ffmpeg`.
- Output: `content/posts/POST-NAME/speech.opus`, hooked up via `audio = "speech.opus"` in the post's `[extra]` front matter.
- Fix mispronunciations in `PRONUNCIATION_FIXES` in `scripts/generate-tts.py`.

## Links

- Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Model: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base

### Formerly used: Chatterbox

Kept for reference only — no longer wired into the scripts.

- Chatterbox TTS (Resemble AI, MIT): https://github.com/resemble-ai/chatterbox
- Model: https://huggingface.co/ResembleAI/chatterbox
