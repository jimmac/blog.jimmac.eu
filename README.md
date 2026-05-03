# blog.jimmac.eu

Formerly jekyll, now zola powered blog. Theme based off of 
[klise](https://github.com/piharpi/jekyll-klise).

## Features

- **Static site generation** with [Zola](https://www.getzola.org/)
- **Text-to-speech** voice cloning with [Chatterbox TTS](https://github.com/resemble-ai/chatterbox)
- **Responsive design** with custom audio player
- **Fast builds** and deployment to GitHub Pages

## Text-to-Speech

Blog posts can include automatically generated voiceovers using voice cloning technology. See **[TTS.md](TTS.md)** for complete documentation.

**Quick setup:**
```bash
./scripts/setup-tts.sh
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
# Setup (first time only)
./scripts/setup-tts.sh

# Generate for all posts
./scripts/generate-tts.py --all

# Single post
./scripts/generate-tts.py content/posts/POST-NAME
```

See [TTS.md](TTS.md) for detailed TTS documentation.

## Project Structure

```
blog.jimmac.eu/
├── content/          # Blog posts and pages
├── static/           # Static assets (CSS, JS, images)
├── templates/        # Zola templates
├── scripts/          # TTS generation scripts
├── venv-py310/       # Python virtual environment (TTS)
├── TTS.md            # TTS documentation
└── README.md         # This file
```

## License

Content and code by Jakub Steiner unless otherwise noted.

