+++
title = "Mo' Pixels"
description = "Daily pixel art practice mixing app icons with nostalgia."
date = 2021-10-13
[taxonomies]
tags = ["pixelart", "pixaki", "gnome", "design", "art", "wallpaper", "icon"]
+++

Recently I've been indulging myself in pixel art again. One might assume that's my comfort zone, but honestly I don't feel like I've ever truly mastered it. 

The initial push came from [my friend](https://vancura.design/), who quit his corporate job, to dive back into his passion and is [working on games](https://twitter.com/unientgames/status/1440048310962688000). Their first title is an oldschool pixel maze, (with a 2021 artistic twist, of course). His work inspired me to get back to pixel pushing.

To combine exploration with usefulness, I imagined mixing up of the new application icon style with pixels to perhaps bring back the [fun of colorful patterns](https://gitlab.gnome.org/GNOME/gnome-backgrounds/-/blob/gnome-3-36/backgrounds/Endless-shapes.jpg) into a wallpaper.

Sadly the result is visually [way too overwhelming](https://gitlab.gnome.org/GNOME/gnome-backgrounds/-/blob/wip/jimmac/prefers-dark-light/backgrounds/pixels-d.png), but the assets created can at least please your nostalgia bone here on planet GNOME (unless it becomes a mess without the stylesheet, we'll see). Stay curious!

<div class="pixelicons">
<img src="IMG_0257.PNG" alt="">
<img src="IMG_0250.PNG" alt="">
<img src="IMG_0258.PNG" alt="">
<img src="IMG_0248.PNG" alt="">
<img src="IMG_0223.PNG" alt="">
<img src="IMG_0228.PNG" alt="">
<img src="IMG_0259.PNG" alt="">
<img src="IMG_0230.PNG" alt="">
<img src="IMG_0265.PNG" alt="">
<img src="IMG_0242.PNG" alt="">
<img src="IMG_0256.PNG" alt="">
<img src="IMG_0254.PNG" alt="">
<img src="IMG_0219.PNG" alt="">
<img src="IMG_0252.PNG" alt="">
<img src="IMG_0226.PNG" alt="">
<img src="IMG_0233.PNG" alt="">
<img src="IMG_0247.PNG" alt="">
<img src="IMG_0260.PNG" alt="">
<img src="IMG_0222.PNG" alt="">
<img src="IMG_0221.PNG" alt="">
<img src="IMG_0224.PNG" alt="">
<img src="IMG_0251.PNG" alt="">
<img src="IMG_0266.PNG" alt="">
<img src="IMG_0227.PNG" alt="">
<img src="IMG_0246.PNG" alt="">
<img src="IMG_0244.PNG" alt="">
<img src="IMG_0241.PNG" alt="">
<img src="IMG_0253.PNG" alt="">
<img src="IMG_0231.PNG" alt="">
<img src="IMG_0264.PNG" alt="">
<img src="IMG_0255.PNG" alt="">
<img src="IMG_0229.PNG" alt="">
<img src="IMG_0234.PNG" alt="">
<img src="IMG_0240.PNG" alt="">
<img src="IMG_0237.PNG" alt="">
<img src="IMG_0225.PNG" alt="">
<img src="IMG_0262.PNG" alt="">
<img src="IMG_0263.PNG" alt="">
<img src="IMG_0236.PNG" alt="">
<img src="IMG_0249.PNG" alt="">
<img src="IMG_0261.PNG" alt="">
<img src="IMG_0239.PNG" alt="">
<img src="IMG_0235.PNG" alt="">
<img src="IMG_0245.PNG" alt="">
<img src="IMG_0243.PNG" alt="">
<img src="IMG_0238.PNG" alt="">
<img src="IMG_0232.PNG" alt="">
</div>
<style type="text/css">
.pixelicons {
	display: grid;
	/* grid-template-columns: repeat(3,1fr); */
	grid-template-columns: repeat(auto-fit, minmax(128px,1fr));
	gap: 64px;
}
.pixelicons img {
	display: block;
	width: 100%; height: auto;
	image-rendering: crisp-edges; image-rendering: pixelated;
	transition: transform 600ms ease-out;
	align-self: center;
}
.pixelicons img:hover {
	transition: transform 100ms ease-out;
	transform: scale(1.2);
}
.pixelicons img:active {
	transition: none;
	width: 32px;
	transform: scale(1);
}
</style>