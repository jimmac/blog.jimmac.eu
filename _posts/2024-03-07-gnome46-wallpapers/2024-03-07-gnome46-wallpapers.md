---
title: GNOME 46 Wallpapers
date: 2024-03-07
tags:
- work
- gnome
- design
- wallpaper
- art
---

GNOME 46 is on its final stretch to be released. It's been a custom to blog a little about the wallpaper selection, which is a big part of GNOME's visual identity. 

![Wallpaper 1](wall-1.webp)

The first notable change in 46 is that we're finally delivering on the promise of bringing you a next generation image file format. While efficiency and filesize requirements might not be too high on the list outside of the geek crowd, there is one aspect of JPEG-XL that I am very excited about.

![Wallpaper 2](wall-2.webp)

JPEG-XL allows the use of client-side synthesized grain. Unlike traditional JPEGs, which often introduce visible noise artifacts, JPEG-XL separates the noise component from the actual image data. This allows for significantly more efficient compression of images that inherently require noise, such as those in gnome-backgrounds — smooth gradients that would otherwise be susceptible to color banding. To achieve similar fidelity of the grain if it were baked in, a classic format like JPEG would need an order of magnitude large filesize. Having the grain in the format itself allows to skip various techniques in the rendering or compositing in the 3D software.

![Wallpaper 3](wall-3.webp)

Instead of compressing a noisy image, JPEG-XL allows to generate film-like grain as part of the decoding process. This synthesized grain combats issues like color banding while allowing a much more efficient compression on the original image data.

![Wallpaper 4](wall-4.webp)

In essence, client-side grain in JPEG-XL isn't simply added noise, but a sophisticated strategy for achieving both efficient compression and visually pleasing image quality, especially for images that would otherwise require inherent noise.

![Wallpaper 5](wall-5.webp)

* Rounded default
* 3D objects
* python generated SVGs (neogeo)


[Previously]({% post_url 2023-01-30-gnome44-wallpapers/2023-01-30-gnome44-wallpapers %}),
[Previously]({% post_url 2022-08-08-gnome43-wallpapers/2022-08-08-gnome43-wallpapers %}),
[Previously]({% post_url  archive/2020-09-01-shelved-wallpapers-2/2020-09-01-shelved-wallpapers-2 %}),
[Previously]({% post_url  archive/2018-02-12-shelved-wallpapers/2018-02-12-shelved-wallpapers %})
