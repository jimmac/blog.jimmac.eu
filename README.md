# blog.jimmac.eu — Zola Migration

Migrated from Jekyll + jekyll-postfiles to [Zola](https://www.getzola.org/).
Single binary, zero dependency hell.

## Getting started

```bash
# Install Zola (one binary, no runtime needed)
# macOS:
brew install zola
# Linux (download binary from https://github.com/getzola/zola/releases):
chmod +x zola && sudo mv zola /usr/local/bin/

# Serve locally with live reload
zola serve

# Build for production
zola build
# Output is in public/
```

## Project structure

```
.
├── config.toml          # site config (replaces _config.yml)
├── content/
│   ├── _index.md        # home section front matter
│   ├── about.md         # about page
│   ├── archive.md       # archive page
│   ├── 404.md
│   └── posts/
│       ├── _index.md
│       ├── 2025-11-21-3D-website/
│       │   ├── index.md       # post content + front matter
│       │   ├── dark.webp      # co-located assets ✓
│       │   └── light.webp
│       └── 2025-12-08-dithering/
│           ├── index.md
│           ├── halftone.webp
│           └── gegl-dither.webp
├── sass/
│   └── assets/css/
│       ├── style.scss   # main stylesheet (compiled → /assets/css/style.css)
│       └── klise/       # sass partials (unchanged from Jekyll)
├── static/              # copied verbatim to output root
│   └── assets/
│       ├── fonts/
│       ├── img/
│       ├── js/
│       └── favicons/
└── templates/
    ├── macros.html      # head, navbar, footer, author (replaces _includes/)
    ├── base.html        # HTML shell (replaces _layouts/default.html)
    ├── index.html       # home page (replaces _layouts/home.html)
    ├── post.html        # single post (replaces _layouts/post.html)
    ├── page.html        # generic page (replaces _layouts/page.html)
    ├── archive.html     # archive page
    ├── 404.html
    └── tags/
        ├── list.html    # /tags/ — all tags (replaces tags.html)
        └── single.html  # /tags/<name>/ — single tag
```

## Writing a new post

Create a folder under `content/posts/` and drop your Markdown and assets in:

```bash
mkdir content/posts/2026-03-17-my-new-post
# create content/posts/2026-03-17-my-new-post/index.md
```

Front matter format (TOML, between `+++`):

```toml
+++
title = "My New Post"
date = 2026-03-17
[taxonomies]
tags = ["gnome", "design"]
[extra]
image = "cover.webp"   # used for OG/Twitter cards
modified = "2026-03-20"  # optional, shows "updated at" footer
+++

Your markdown content here. Images reference by filename only:

![Alt text](cover.webp)
```

## Key differences from Jekyll

| Jekyll | Zola |
|--------|------|
| `_posts/2025-01-01-title.md` | `content/posts/2025-01-01-title/index.md` |
| `{% post_url ... %}` | Plain relative or absolute path: `/posts/2025-01-01-title/` |
| `{{ page.url }}` | `{{ page.permalink }}` |
| `{{ content }}` | `{{ page.content \| safe }}` |
| `{{ post.date \| date: "%b %d, %Y" }}` | `{{ post.date \| date(format="%b %d, %Y") }}` |
| `_data/menus.yml` | `config.extra.menus` in `config.toml` |
| `site.author.name` | `config.extra.author.name` |
| `page.tags` (array) | `page.taxonomies.tags` (array) |
| `jekyll-feed` plugin | built-in (`feed_filenames = ["feed.xml"]`) |
| `jekyll-sitemap` plugin | built-in (`generate_sitemap = true`, default) |
| `jekyll-postfiles` plugin | built-in (co-located assets in page bundle) |

## Search (archive page)

Search is powered by Zola's built-in [elasticlunr](https://www.getzola.org/documentation/content/search/)
integration. `build_search_index = true` in `config.toml` tells Zola to emit
`/search_index.en.json` and `/elasticlunr.min.js` at build time.
`static/assets/js/search.js` wires those up to the `#search-input` and
`#search-results` elements — no external dependencies, no stale JSON to maintain.

The old `SimpleJekyllSearch` binary (`search.min.js`) and the static
`search.json` have been removed.

## Deployment (GitHub Pages)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shalzz/zola-deploy-action@v0.18.0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
