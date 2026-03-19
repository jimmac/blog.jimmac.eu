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

<div class="image-grid pixelated">
<img src="flatpak.gif" alt="Flatpak">
<img src="fleetcommander.gif" alt="Fleet Comander">
<img src="toolbox.gif" alt="Toolbox">
<img src="zbus.gif" alt="Zbus">
</div>

If you maintain an upstream OS component and are looking to replace a wiki or a markdown readme with a simple site, I've [created a template](https://github.com/jimmac/os-component-website) to get you started quickly.
