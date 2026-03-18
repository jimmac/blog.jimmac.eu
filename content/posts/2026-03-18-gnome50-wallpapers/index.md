+++
title = "GNOME 50 Wallpapers"
date = 2026-03-18
slug = "gnome50-wallpapers"
draft = true
[taxonomies]
tags = ["work", "gnome", "design", "wallpaper", "art"]
[extra]
image = "thumb.png"
+++

GNOME 50 just got released! Maybe you'd like to learn a bit about the background (*ding*) of the new additions to the collection.

While there's no change in the general style, you may be surprised to see the default shifting from the triangular theme to hexagons. 

<img src="default.webp" class="full" alt="Default Wallpaper in GNOME 50">

Well maybe not so surprised if you followed the gnome-backgrounds repo more closely, during the development cycle. We've had the rounded hexagon design introduced sometime in 2024, but it was pulled back due to being a little too flat despite going through a number of lighting and color iterations. There's also been few other hex designs in 2022 and 2020. They never made it to the ultimate post of being the default. Until now.

<div class="sketches">
<img src="hex-1.webp" alt="">
<img src="hex-2.webp" alt="">
<img src="hex-3.webp" alt="">
<img src="hex-4.webp" alt="">
</div>

<style type="text/css">
.sketches {
	display: grid;
	grid-template-columns: repeat(2,1fr);
	gap: 1rem;
	grid-auto-flow: row dense;
}
.sketches img {
	display: block;
	width: 100%; height: auto;
	transition-duration: 0;
	align-self: center;
}

@media only screen and (min-width: 640px) {
	.sketches { grid-template-columns: repeat(4,1fr); }
	.sketches img.big {
		grid-column: span 2;
		grid-row: span 2;
	}
}
.sketches img:hover {
	transition: transform 100ms ease-out;
	transform: scale(1.5);
	image-rendering: crisp-edges;
	image-rendering: pixelated;
}
.sketches img:active {
	width: 135px;
	transform: scale(3);
	transition: none;
	image-rendering: crisp-edges;
	image-rendering: pixelated;
}
</style>

The only part of the work on the new symbolics has been an update to the symbolics wallpaper that has gone through many iterations over the years. Truth be told it's not been a very favorite pick. I've rarely seen any screenshots of it in the wild. Let's see if the new incarnation does better.

<video controls nosound autoplay loop class="image full">
<source src="timelapse.webm" type="video/webm">
<source src="timelapse.mp4" type="video/mp4">
</video>

Similarly the glass chip wallpaper has undergone a bit of a makeover as well. I'll also mention a ... let's say less original design that caters to the dark theme folks out there. While every wallpaper in GNOME features light and dark variant, **Tubes** has a dark and *darker* variant.