# blog.jimmac.eu

Formerly jekyll, now zola powered blog. Theme based off of 
[klise](https://github.com/piharpi/jekyll-klise).

## Features

- **Static site generation** with [Zola](https://www.getzola.org/)
- **Text-to-speech** with [Ollama Phonon](https://ollama.com/library/phonon)
- **Responsive design** with custom audio player
- **Lazy YouTube embeds** — click-to-load facade player, no third-party JS until play
- **Fast builds** and deployment to GitHub Pages

## YouTube embeds

Posts embed YouTube videos with a click-to-load facade player: custom chrome
around a poster thumbnail, nothing fetched from YouTube (no player JS, no
tracking) until the visitor presses play. Without JavaScript the poster stays
a plain link to the video.

```md
{{< youtube id="VIDEO_ID" title="Video Title" />}}

<!-- vertical video / Shorts -->
{{< youtube id="VIDEO_ID" title="Video Title" ratio="9 / 16" />}}
```

- Component: `templates/components.html`
- Styles: `static/assets/css/style.css` (`.yt`)
- Behavior: `static/assets/js/youtube-player.js`

## Text-to-Speech

Blog posts can include automatically generated voiceovers via Ollama + Phonon.
See **[TTS.md](TTS.md)** for complete documentation.

**Quick start:**
```bash
ollama pull phonon
./scripts/generate-tts.py            # latest post, built-in voice
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

Note: `zola serve` ignores HTTP `Range` requests (it answers `200` with the
full body), which WebKitGTK browsers (Epiphany) treat as a media error —
post audio will not load or play at all under the dev server. To test audio
playback in Epiphany, `zola build` and serve `public/` with a range-capable
server (anything production-grade, e.g. `python3 -m http.server` does not
qualify; nginx or `python3 -m RangeHTTPServer` do).

### Generate TTS audio

```bash
# Latest post
./scripts/generate-tts.py

# Single post
./scripts/generate-tts.py content/posts/POST-NAME

# All posts
./scripts/generate-tts.py --all
```

The script talks to a local Ollama server. See [TTS.md](TTS.md) for details.

## Project Structure

```
blog.jimmac.eu/
├── content/          # Blog posts and pages
├── static/           # Static assets (CSS, JS, images)
├── templates/        # Zola templates
├── scripts/          # Site/TTS generation scripts
├── TTS.md            # TTS documentation
└── README.md         # This file
```

## License

Content and code by Jakub Steiner unless otherwise noted.

