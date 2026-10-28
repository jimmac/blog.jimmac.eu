# TTS

Voiceovers are generated locally with **Ollama + Phonon** via
`scripts/generate-tts.py`. No Python virtualenv, no model downloads: the
script talks to a local Ollama server and uses one of Phonon's built-in
voices. It writes `speech.opus` next to a post's `index.md` and patches
`audio = "speech.opus"` into its `[extra]` front matter.

## Requirements

[Ollama](https://ollama.com) 0.40.9 or newer running on Apple Silicon, the
model, and `ffmpeg`:

```bash
ollama pull phonon
```

## Usage

- `./scripts/generate-tts.py` — latest post (default)
- `./scripts/generate-tts.py content/posts/POST-NAME` — a specific post
- `./scripts/generate-tts.py --all [--force] [--dry-run]`
- `./scripts/generate-tts.py --voice Zoey` — pick a voice
  (`ollama show phonon` lists them all; the default voice is `Lottie`)
- `./scripts/generate-tts.py --model phonon:40m-pt` — use another model

Long posts are split into sentence-aligned chunks under the speech API's
4,096-character limit, then joined and encoded as 32 kbps Opus.
`OLLAMA_HOST` is honoured if Ollama runs somewhere other than
`http://localhost:11434`.

Fix mispronunciations in `PRONUNCIATION_FIXES` in `scripts/generate-tts.py`.

## Links

- Ollama speech: https://docs.ollama.com/capabilities/speech
- Phonon: https://ollama.com/library/phonon
- Phonon announcement: https://gradium.ai/blog/release-phonon-open-weight
