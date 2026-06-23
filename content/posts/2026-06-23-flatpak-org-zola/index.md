+++
title = "Flatpak.org Rewrite"
description = "Flatpak website deserved a better backend."
date = 2026-06-23
draft = true
aliases = ["/2026/flatpak-org-zola/"]
[taxonomies]
tags = ["flatpak", "tech", "work"]
[extra]
related = [
  "posts/2022-06-13-flatpak-refresh/index.md",
  "posts/2026-04-10-port-to-zola/index.md",
  "posts/2026-04-13-release-gnome-zola/index.md",
]
image = "flatpak-pixels.apng"
mastodon_url = "https://mastodon.social/@jimmac/"
+++

The Flatpak website has been running on [Middleman](https://middlemanapp.com/) for years and time hasn't been kind. Touching the project resulted in seeing 42 vulnerability warnings. The gem itself hasn't seen an update in ages, and the dependency graph had grown into something you wouldn't show anyone. 

<div id="crt-container" class="image-grid pixelated">
<img loading="lazy" src="flatpak-pixels.apng" alt="Flatpak Pixlart - a package delivery guy carrying a box with an open truck with warning lights" class="full pixelated">
</div>


Very recently, which happens to be 4 years ago, we've done a [rebrand](/posts/flatpak-refresh/) to reflect the fact that Flatpak has *hit it big*. There were a few hints of the old baggage, but overall it didn't feel like a website from 2007. But it was just lipstick.

For the layout I reached for the same named-grid approach we designed for [gnome.org](https://www.gnome.org). Instead of fighting with a rigid single column you get a multi-column grid with named areas. It keeps the markup clean and the CSS stays declarative — no wrapper divs, no negative margins, just the grid exposing its marvels.

Most of the navigation is left to the footer. Another pattern we've embraced elsewhere and has worked well. A major simplification came from the great work of Kolja ([razze](https://osna.social/@razze)) on [Flathub](https://flathub.org/en/setup) -- all the distro setup instructions are maintained at one place. 

<script src="/assets/js/UPNG.js"></script>
<script src="/assets/js/p5.min.js"></script>
<script src="/assets/js/pipboy.js"></script>
<script>
PipBoy({
  container: 'crt-container',
  srcs: [
    'flatpak-pixels.apng',
  ],
  width: 288,
  height: 240
});
</script>