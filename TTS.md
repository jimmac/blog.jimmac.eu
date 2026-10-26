# TTS

Voiceovers are generated locally by one of two scripts. Both write the same
`speech.opus` next to a post's `index.md` and patch `audio = "speech.opus"` into
its `[extra]` front matter.

- **Ollama + Phonon** — `scripts/generate-tts-phonon.py`. The macOS/Apple
  Silicon option: no Python virtualenv and no voice-cloning setup. Uses one of
  Phonon's built-in voices.
- **Qwen3-TTS** — `scripts/generate-tts.py`. Clones a voice from a 10-second
  reference clip. Requires Python 3.10 and sets up its own venv.

## Ollama + Phonon (macOS)

Requires [Ollama](https://ollama.com) 0.40.9 or newer running on Apple Silicon,
the model, and `ffmpeg`:

```bash
ollama pull phonon
```

### Usage

- `./scripts/generate-tts-phonon.py` — latest post (default)
- `./scripts/generate-tts-phonon.py content/posts/POST-NAME` — a specific post
- `./scripts/generate-tts-phonon.py --all [--force] [--dry-run]`
- `./scripts/generate-tts-phonon.py --voice Zoey` — pick a voice
  (`ollama show phonon` lists them all; the default voice is `default`)
- `./scripts/generate-tts-phonon.py --model phonon:40m-pt` — use another model

Long posts are split into sentence-aligned chunks under the speech API's
4,096-character limit, then joined and encoded as 32 kbps Opus.
`OLLAMA_HOST` is honoured if Ollama runs somewhere other than
`http://localhost:11434`.

Fix mispronunciations in `PRONUNCIATION_FIXES` in the script you use (the two
scripts keep separate dictionaries).

## Qwen3-TTS (voice cloning)

Cloned from a 10-second reference clip.

### Usage

- `./scripts/generate-tts.py` — latest post (default)
- `./scripts/generate-tts.py content/posts/POST-NAME` — a specific post
- `./scripts/generate-tts.py --all [--force] [--dry-run]`

- The script sets up its own venv (`venv-qwen`) and installs dependencies on first run. Requires Python 3.10 and `ffmpeg`.
- Output: `content/posts/POST-NAME/speech.opus`, hooked up via `audio = "speech.opus"` in the post's `[extra]` front matter.
- Fix mispronunciations in `PRONUNCIATION_FIXES` in `scripts/generate-tts.py`.

## Links

- Ollama speech: https://docs.ollama.com/capabilities/speech
- Phonon: https://ollama.com/library/phonon
- Phonon announcement: https://gradium.ai/blog/release-phonon-open-weight
- Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Model: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base

### Formerly used: Chatterbox

Kept for reference only — no longer wired into the scripts.

- Chatterbox TTS (Resemble AI, MIT): https://github.com/resemble-ai/chatterbox
- Model: https://huggingface.co/ResembleAI/chatterbox
