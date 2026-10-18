# blog.jimmac.eu

Formerly jekyll, now zola powered blog. Theme based off of 
[klise](https://github.com/piharpi/jekyll-klise).

## Features

- **Static site generation** with [Zola](https://www.getzola.org/)
- **Text-to-speech** voice cloning with [Qwen3-TTS](https://github.com/QwenLM/Qwen3-TTS)
- **Responsive design** with custom audio player
- **Fast builds** and deployment to GitHub Pages

## Text-to-Speech

Blog posts can include automatically generated voiceovers using voice cloning technology. See **[TTS.md](TTS.md)** for complete documentation.

**Quick start:**
```bash
./scripts/generate-tts.py            # latest post
./scripts/generate-tts.py --all
```

## Development

### Install Zola

```bash
# macOS
brew install zola

# Linux
# See https://www.getzola.org/documentation/getting-started/installation/
```

### Build and serve

```bash
# Development server with live reload
zola serve

# Production build
zola build
```

### Generate TTS audio

```bash
# Latest post (default)
./scripts/generate-tts.py

# Single post
./scripts/generate-tts.py content/posts/POST-NAME

# All posts
./scripts/generate-tts.py --all
```

The script bootstraps its own virtualenv and dependencies on first run. See [TTS.md](TTS.md) for details.

## Project Structure

```
blog.jimmac.eu/
├── content/          # Blog posts and pages
├── static/           # Static assets (CSS, JS, images)
├── templates/        # Zola templates
├── scripts/          # Site/TTS generation scripts
├── venv-qwen/        # Python virtual environment (TTS, auto-created)
├── TTS.md            # TTS documentation
└── README.md         # This file
```

## License

Content and code by Jakub Steiner unless otherwise noted.

