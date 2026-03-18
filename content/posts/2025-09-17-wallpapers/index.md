+++
title = "HDR Wallpapers"
slug = "wallpapers-2025"
date = 2025-09-17
[taxonomies]
tags = ["work", "gnome", "design", "wallpaper", "art"]
[extra]
image = "walls.webp"
+++

GNOME 49 brought another round of [changes to the default wallpaper set](https://release.gnome.org/49/#wallpapers) — some new additions, and a few removals too. Not just to keep the old *GNOME Design loves to delete things trope* alive, but to make room for fresh work and reduce stylistic overlap.

Our goal has always been to provide a varied collection of abstract wallpapers. (Light/dark photographic sets are still on the wish list — we’ll get there, promise! 😉). When we introduce new designs, some of the older ones naturally have to step aside.

We’ve actually been shipping wallpapers in high bit depth formats for quite a while, even back when the GNOME display pipeline (based on gdk-pixbuf) was limited to 8-bit output. That changed in GNOME 49. Thanks to Sophie’s Glycin, we now have a color-managed pipeline that makes full use of modern hardware — even if you’re still on an SDR display.

So what does that mean for wallpapers? Well, with HDR displays (using OLED or Mini-LED panels), you can push brightness and contrast to extremes — bright enough to feel like a flashlight in your face. That’s great for games and movies, but it’s not something you want staring back at you from the desktop all day. With wallpapers, subtlety matters.

The new set takes advantage of wider color gamuts (Display P3 instead of sRGB) and higher precision (16-bit per channel instead of 8-bit). That translates to smoother gradients, richer tones, and more depth — without the blinding highlights. Think of it as HDR done tastefully: more range to play with, but in service of calm, everyday visuals rather than spectacle.

<video controls nosound loop class="image full" poster="timelapse.webp">
<source src="timelapse.webm" type="video/webm">
<source src="timelapse.mp4" type="video/mp4">
</video>

Personally, I still think HDR makes the most sense today in games, videos, and fullscreen photography, where those deep contrasts and bright highlights can really shine. On the desktop, apps and creative tools still need to catch up. Blender, for instance, already shows it's colormanaged HDR preview pipeline on macOS, and HDR display support is expected to land for Wayland in Blender 5.0.