+++
title = "Building Flatpaks Locally, Part 2"
description = "Turns out there's a much easier method to building flatpaks on GNOMEOS. With Foundry"
date = 2026-09-23
aliases = ["/2026/building-flatpaks-followup/"]
[taxonomies]
tags = ["flatpak", "flathub", "gnome", "tech", "tutorial"]
[extra]
image = "thumb.png"
mastodon_url = "https://mastodon.social/@jimmac/117321986112178920"
related = [
  "posts/2026-09-18-building-flatpaks-locally/index.md",
  "posts/2022-11-11-Builder-Shell/index.md"
]
+++

Some of you mentioned the [flatpak-builder](/posts/building-flatpaks-locally/) approach is way too complicated. Indeed it is.

<!-- more -->

All you need to do with the [developer sysext](https://gnome.pages.gitlab.gnome.org/gnome-build-meta/docs/using.html#enable-development-tooling-and-utilities) on [GNOME OS](https://os.gnome.org) is to:

```
foundry init && foundry build
```

Been building projects left and right today and it's rad.