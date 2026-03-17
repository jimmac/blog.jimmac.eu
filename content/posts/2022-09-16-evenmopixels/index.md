+++
title = "Even Mo' Pixels"
date = 2022-09-16
[taxonomies]
tags = ["pixel", "pixaki", "gnome", "design", "art", "wallpaper", "icon"]
+++

To keep the habbit alive, I continue to do a [daily pixel routine](/posts/mopixels/), now covering almost all of the [GNOME Circle](https://circle.gnome.org) apps.

Good call. Empty alt attributes (alt="") are actually better for decorative images or icons since they tell screen readers to skip over them, rather than announcing "x" over and over again.

Here is the updated block:

<div class="pixelicons">
<img src="IMG_0425.PNG" alt="">
<img src="IMG_0426.PNG" alt="">
<img src="IMG_0427.PNG" alt="">
<img src="IMG_0428.PNG" alt="">
<img src="IMG_0429.PNG" alt="">
<img src="IMG_0430.PNG" alt="">
<img src="IMG_0431.PNG" alt="">
<img src="IMG_0432.PNG" alt="">
<img src="IMG_0433.PNG" alt="">
<img src="IMG_0434.PNG" alt="">
<img src="IMG_0435.PNG" alt="">
<img src="IMG_0436.PNG" alt="">
<img src="IMG_0437.PNG" alt="">
<img src="IMG_0439.PNG" alt="">
<img src="IMG_0440.PNG" alt="">
<img src="IMG_0441.PNG" alt="">
<img src="IMG_0442.PNG" alt="">
<img src="IMG_0443.PNG" alt="">
<img src="IMG_0444.PNG" alt="">
<img src="IMG_0445.PNG" alt="">
<img src="IMG_0446.PNG" alt="">
<img src="IMG_0447.PNG" alt="">
<img src="IMG_0448.PNG" alt="">
<img src="IMG_0449.PNG" alt="">
<img src="IMG_0450.PNG" alt="">
<img src="IMG_0451.PNG" alt="">
<img src="IMG_0452.PNG" alt="">
<img src="IMG_0453.PNG" alt="">
<img src="IMG_0454.PNG" alt="">
<img src="IMG_0455.PNG" alt="">
<img src="IMG_0456.PNG" alt="">
<img src="IMG_0457.PNG" alt="">
<img src="IMG_0458.PNG" alt="">
<img src="IMG_0459.PNG" alt="">
<img src="IMG_0460.PNG" alt="">
<img src="IMG_0461.PNG" alt="">
<img src="IMG_0463.PNG" alt="">
<img src="IMG_0464.PNG" alt="">
</div>

I've been practicing the art of animation a little too in an effort to promote GNOME Circle on [Twitter](https://twitter.com/jimmac) and [Mastodon](https://mastodon.social/web/@jimmac). Presenting all these GIFs would probably not be kind to [Planet GNOME](http://planet.gnome.org) readers though. Perhaps I could compose a video in the future (no GIF support in Blender, strangely!). Keep grinding your (pointless) skills, kids!

<style type="text/css">
.pixelicons {
	display: grid;
	grid-template-columns: repeat(2,1fr);
	gap: 4rem;
}
.pixelicons img {
	display: block;
	width: 100%; height: auto;
	image-rendering: crisp-edges; image-rendering: pixelated;
	transition: transform 600ms ease-out;
	align-self: center;
}

@media only screen and (min-width: 640px) {
	.pixelicons { grid-template-columns: repeat(4,1fr); gap: 3rem; }
	.pixelicons img:nth-child(10n) {
		grid-column: span 2;
		grid-row: span 2;
	}
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

[Previously](/posts/mopixels/)