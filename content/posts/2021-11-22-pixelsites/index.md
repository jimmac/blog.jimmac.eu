---
title: Pixel Sites
date: 2021-11-22
tags:
- gnome
- design
- work
- sketch
- art
- pixaki
---

[comment]: <> <a href="{{ site.url }}{{ page.url }}">absolute links</a>

I've created a [couple](https://pipewire.org/) [of](https://fleet-commander.org/) [minisites](https://containertoolbx.org/) for key OS components, built using no frameworks, but plain CSS. Just having CSS grid and variables made it viable for me to avoid using frameworks recently. Having [includes/imports](https://www.w3.org/TR/html-imports/) one wouldn't even need [Jekyll](https://jekyllrb.com/).

<div class="inlineimgs" markdown="1">
[![](Flatpak_Website.png)](Flatpak_Website.png)
[![](Fleet_Commander.png)](Fleet_Commander.png)
[![](Toolbox_Packages_Within.png)](Toolbox_Packages_Within.png)
[![](ZBus_Website.png)](ZBus_Website.png)
</div>

The founding stone on all of these is the pixel art, which is now becoming my favorite art form.

![Flatpak](flatpak.gif)
![Fleet Comander](fleetcommander.gif)
![Toolbox](toolbox.gif)
![Zbus](zbus.gif)
{:.pixels}

<style type="text/css">
.pixels {
	display: grid;
	grid-template-columns: repeat(2,1fr);
	/* grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); */
	gap: 16px;
}
.pixels img {
	display: block;
	width: 100%; height: auto;
	image-rendering: crisp-edges; image-rendering: pixelated;
	transition: transform 600ms ease-out;
	align-self: center;
}
.pixels img:active {
	transition: none;
	width: 135px;
	transform: scale(1);
}
</style>

If you maintain an upstream OS component and are looking to replace a wiki or a markdown readme with a simple site, I've [created a template](https://github.com/jimmac/os-component-website) to get you started quickly.
