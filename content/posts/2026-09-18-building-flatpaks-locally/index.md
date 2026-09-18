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

On GNOME OS, some developer tools like `git` and `toolbox` are in the base image. 

## Installing flatpak-builder

`flatpak-builder` isn't part of base OS though. It is distributed on [Flathub](https://flathub.org) as `org.flatpak.Builder`. Install it like any other Flatpak:

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

## Developer extension

There are some extra tools for development available for GNOME OS though. You get them by enabling the *developer system extension*:

```bash
sudo updatectl enable devel --now
```

This gives you the toolchain needed to clone repos and build things locally. So instead of installing the flatpak, you get `flatpak-builder` as a utility.