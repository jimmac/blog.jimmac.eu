---
title: GNOME 47 Wallpapers
date: 2024-09-24
image: wallpapers.webp
tags:
- work
- gnome
- design
- wallpaper
- art
---

With the 47 release out, it's my bi-annual duty to bore you with detail about the wallpapers. To many, these are just little trinkets, stickers that go along the product. But GNOME wallpapers are the aesthetic pillars of the project and carriers of the visual brand. The characteristic blue default with the dark top bar is a key visual anchor.

![GNOME 47 Wallpapers](wallpapers-l.webp)

GNOME 47 doesn't ship with dramatic changes to the default blue wallpaper. It has been slightly tweaked, but the main motive, rounded triangles remain. The small touch that some may have noticed is that the dark variant mimicks the real world in that the aperture of the camera opens up wider and thus the depth of field is shallower for dark.

<video controls nosound autoplay loop class="image full">
<source src="{{site.url}}{{page.url}}focus.webm" type="video/webm">
<source src="{{site.url}}{{page.url}}focus.mp4" type="video/mp4">
</video>

The supplemental wallpapers is where most of the updates happened this cycle though.

There have not been that many removals as the filesize of the JXL wallpapers isn't pushing us too much to remove old cruft, so it's mainly an issue of providing enough variation and not repeat ourselves much visually. We want to have a fairly varied selection. Notably photographic wallpapers [are still missing](https://gitlab.gnome.org/GNOME/gnome-backgrounds/-/issues/20), hopefully we can address that thorn in the future.

In terms of fine tuning changes, the classic, `Pixels` has been updated to feature newer apps from [GNOME Circle](https://circle.gnome.org).

<video controls nosound autoplay loop class="image full">
<source src="{{site.url}}{{page.url}}pixels-timelapse.webm" type="video/webm">
<source src="{{site.url}}{{page.url}}pixels-timelapse.mp4" type="video/mp4">
</video>

The dark variant of `Pills` has received some lighting and shading updates and features a subtle sub surface scattering shading. 

As for new additions, this release has quite a few. I've worked with Dominik Baran to deliver a tube-map-inspired vector wallpaper, which I'm a big fan of. As a wink to the Vera Molnar a simple geometric `Mollnar` is making use of the SVG format.

Majorty of our wallpapers are still bitmap, as our renderers don't quite provide means to fight color banding. Some designs are much more efficient as simple vector artowk though. Other platforms seem to lean into mesh gradients which we also currently have to render into bitmaps. 

Some more abstract shapes have been introduced -- `Sheet` and `Swoosh`. Can't have enough pixel icons, so a few variants of oldschool single bit aesthetic comes with `LCD` and `LCD-rainbow`. Both are rendered with a simulated screen vibe, even though the realism breaks apart in the color gradient variant.

And last but not least a bit of visually overwheling `Symbolic Soup`, which will probably not appeal to everyone, but provides some variety in the default selection. 

## Preview

[![LCD](lcd-d.webp)](lcd-d.jxl)
[![Pills](pills-d.webp)](pills-d.jxl)
[![Map](map-d.svg)](map-d.svg){:.big}
[![Mollnar](mollnar-d.svg)](mollnar-d.svg)
[![LCD Raindow](lcd-rainbow-l.webp)](lcd-rainbow-l.jxl)
[![Pixels](pixels-d.webp)](pixels-d.jxl){:.big}
[![Sheet](sheet-l.webp)](sheet-l.jxl)
[![Swoosh](swoosh-l.webp)](swoosh-l.jxl)
[![Symbolic Soup](symbolic-soup-d.webp)](symbolic-soup-d.jxl)
{:.walls}

If you're wondering about the strange square aspect ratio, take a look at the wallpaper sizing guide in our [GNOME Interface Guidelines](https://developer.gnome.org/hig/reference/backgrounds.html).

<style type="text/css">
.walls {
	display: grid;
	grid-template-columns: repeat(2,1fr);
	gap: 1rem;
	grid-auto-flow: row dense;
}
.walls img {
	display: block;
	width: 100%; height: auto;
	transition-duration: 0;
	align-self: center;
}

@media only screen and (min-width: 640px) {
	.walls { grid-template-columns: repeat(4,1fr); }
	.walls a.big {
		grid-column: span 2;
		grid-row: span 2;
	}
}
</style>