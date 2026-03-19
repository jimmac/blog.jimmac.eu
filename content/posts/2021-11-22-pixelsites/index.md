+++
title = "Pixel Sites"
description = "Building mini-sites for FOSS projects with plain CSS and pixel art."
date = 2021-11-22
[taxonomies]
tags = ["gnome", "design", "work", "sketch", "art", "pixaki"]
+++

<!-- <a href="{{ site.url }}{{ page.url }}">absolute links</a> -->

I've created a [couple](https://pipewire.org/) [of](https://fleet-commander.org/) [minisites](https://containertoolbx.org/) for key OS components, built using no frameworks, but plain CSS. Just having CSS grid and variables made it viable for me to avoid using frameworks recently. Having [includes/imports](https://www.w3.org/TR/html-imports/) one wouldn't even need [Jekyll](https://jekyllrb.com/).

<div class="inlineimgs">
<a href="Flatpak_Website.png"><img src="Flatpak_Website.png" alt=""></a>
<a href="Fleet_Commander.png"><img src="Fleet_Commander.png" alt=""></a>
<a href="Toolbox_Packages_Within.png"><img src="Toolbox_Packages_Within.png" alt=""></a>
<a href="ZBus_Website.png"><img src="ZBus_Website.png" alt=""></a>
</div>

The founding stone on all of these is the pixel art, which is now becoming my favorite art form.

<div class="pixels">
<img src="flatpak.gif" alt="Flatpak">
<img src="fleetcommander.gif" alt="Fleet Comander">
<img src="toolbox.gif" alt="Toolbox">
<img src="zbus.gif" alt="Zbus">
</div>

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
