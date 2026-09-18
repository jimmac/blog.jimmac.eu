+++
title = "Building Flatpaks Locally"
description = "Using flatpak-builder from Flathub to build and test Flatpak apps on your own machine."
date = 2026-09-18
aliases = ["/2026/building-flatpaks-locally/"]
[taxonomies]
tags = ["flatpak", "flathub", "gnome", "tech", "tutorial"]
[extra]
image = "thumb.svg"
mastodon_url = "https://mastodon.social/@jimmac/117293604864644158"
related = [
  "posts/2022-11-11-Builder-Shell/index.md",
  "posts/2021-02-04-curtail/index.md",
  "posts/2021-02-06-git-worktree/index.md",
]
+++

<img loading="lazy" src="flatpak-builder.svg" alt="Flatpak Builder icon" class="full">

I like to run my [Linux as an operating system](https://os.gnome.org), so I usually resort to [toolbox](https://containertoolbx.org) for packages and development. However `flatpak-builder` is distributed as a flatpak itself, so here's how you can go about building flatpaks yourself for when [GNOME Nighlies](https://nightly.gnome.org) are not enough.

<!-- more -->

On GNOME OS, developer tools like `git` and `toolbox` aren't part of the base image. You get them by enabling the *developer system extension*:

```bash
sudo updatectl enable devel --now
```

This gives you the toolchain needed to clone repos and build things locally.

## Installing flatpak-builder

The builder is distributed on Flathub as `org.flatpak.Builder`. Install it like any other Flatpak:

```bash
flatpak install flathub org.flatpak.Builder
```




## Building and Installing Locally

Here's how I build [Shaper](https://gitlab.gnome.org/World/design/shaper), an icon designer for GNOME symbolics. 

```bash
flatpak run --command=flatpak-builder \
org.flatpak.Builder --user --install \
--force-clean build-dir org.gnome.design.Shaper.json
```

And that's it!
