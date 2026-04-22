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

<div id="crt-mopixels" class="image-grid pixelated">
<img loading="lazy" src="IMG_0257.PNG" alt="">
<img loading="lazy" src="IMG_0250.PNG" alt="">
<img loading="lazy" src="IMG_0258.PNG" alt="">
<img loading="lazy" src="IMG_0248.PNG" alt="">
<img loading="lazy" src="IMG_0223.PNG" alt="">
<img loading="lazy" src="IMG_0228.PNG" alt="">
<img loading="lazy" src="IMG_0259.PNG" alt="">
<img loading="lazy" src="IMG_0230.PNG" alt="">
<img loading="lazy" src="IMG_0265.PNG" alt="">
<img loading="lazy" src="IMG_0242.PNG" alt="">
<img loading="lazy" src="IMG_0256.PNG" alt="">
<img loading="lazy" src="IMG_0254.PNG" alt="">
<img loading="lazy" src="IMG_0219.PNG" alt="">
<img loading="lazy" src="IMG_0252.PNG" alt="">
<img loading="lazy" src="IMG_0226.PNG" alt="">
<img loading="lazy" src="IMG_0233.PNG" alt="">
<img loading="lazy" src="IMG_0247.PNG" alt="">
<img loading="lazy" src="IMG_0260.PNG" alt="">
<img loading="lazy" src="IMG_0222.PNG" alt="">
<img loading="lazy" src="IMG_0221.PNG" alt="">
<img loading="lazy" src="IMG_0224.PNG" alt="">
<img loading="lazy" src="IMG_0251.PNG" alt="">
<img loading="lazy" src="IMG_0266.PNG" alt="">
<img loading="lazy" src="IMG_0227.PNG" alt="">
<img loading="lazy" src="IMG_0246.PNG" alt="">
<img loading="lazy" src="IMG_0244.PNG" alt="">
<img loading="lazy" src="IMG_0241.PNG" alt="">
<img loading="lazy" src="IMG_0253.PNG" alt="">
<img loading="lazy" src="IMG_0231.PNG" alt="">
<img loading="lazy" src="IMG_0264.PNG" alt="">
<img loading="lazy" src="IMG_0255.PNG" alt="">
<img loading="lazy" src="IMG_0229.PNG" alt="">
<img loading="lazy" src="IMG_0234.PNG" alt="">
<img loading="lazy" src="IMG_0240.PNG" alt="">
<img loading="lazy" src="IMG_0237.PNG" alt="">
<img loading="lazy" src="IMG_0225.PNG" alt="">
<img loading="lazy" src="IMG_0262.PNG" alt="">
<img loading="lazy" src="IMG_0263.PNG" alt="">
<img loading="lazy" src="IMG_0236.PNG" alt="">
<img loading="lazy" src="IMG_0249.PNG" alt="">
<img loading="lazy" src="IMG_0261.PNG" alt="">
<img loading="lazy" src="IMG_0239.PNG" alt="">
<img loading="lazy" src="IMG_0235.PNG" alt="">
<img loading="lazy" src="IMG_0245.PNG" alt="">
<img loading="lazy" src="IMG_0243.PNG" alt="">
<img loading="lazy" src="IMG_0238.PNG" alt="">
<img loading="lazy" src="IMG_0232.PNG" alt="">
</div>

<script src="/assets/js/p5.min.js"></script>
<script src="/assets/js/pipboy.js"></script>
<script>
PipBoy({
  container: 'crt-mopixels',
  srcs: [
    'IMG_0257.PNG','IMG_0250.PNG','IMG_0258.PNG','IMG_0248.PNG',
    'IMG_0223.PNG','IMG_0228.PNG','IMG_0259.PNG','IMG_0230.PNG',
    'IMG_0265.PNG','IMG_0242.PNG','IMG_0256.PNG','IMG_0254.PNG',
    'IMG_0219.PNG','IMG_0252.PNG','IMG_0226.PNG','IMG_0233.PNG',
    'IMG_0247.PNG','IMG_0260.PNG','IMG_0222.PNG','IMG_0221.PNG',
    'IMG_0224.PNG','IMG_0251.PNG','IMG_0266.PNG','IMG_0227.PNG',
    'IMG_0246.PNG','IMG_0244.PNG','IMG_0241.PNG','IMG_0253.PNG',
    'IMG_0231.PNG','IMG_0264.PNG','IMG_0255.PNG','IMG_0229.PNG',
    'IMG_0234.PNG','IMG_0240.PNG','IMG_0237.PNG','IMG_0225.PNG',
    'IMG_0262.PNG','IMG_0263.PNG','IMG_0236.PNG','IMG_0249.PNG',
    'IMG_0261.PNG','IMG_0239.PNG','IMG_0235.PNG','IMG_0245.PNG',
    'IMG_0243.PNG','IMG_0238.PNG','IMG_0232.PNG'
  ],
  width: 32,
  height: 32,
  pad: 72
});
</script>