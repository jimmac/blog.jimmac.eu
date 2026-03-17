+++
title = "Pixel Inktober"
slug = "pixel-inktober-2022"
date = 2022-10-31
[taxonomies]
tags = ["pixel", "pixaki", "aseprite", "art"]
+++

Just like [last year](/posts/pixel-inktober/), October was filled with quick pixel dailies. I decided to only post [on mastodon](https://mastodon.social/@jimmac), but due to the twitter exodus couldn't quite post the 30kB images for the two remaining days. Good old blog post it is!

<div class="pixelicons">
<img src="sheet.png" alt="x">
<img src="01.gif" alt="1. Gargoyle" class="big">
<img src="02.png" alt="2. Scurry">
<img src="03.gif" alt="3. Bat">
<img src="04.png" alt="4. Scallop">
<img src="05.png" alt="5. Flame">
<img src="06.png" alt="6. Bouquet">
<img src="07.png" alt="7. Trip" class="big">
<img src="08.png" alt="8. Match" class="big">
<img src="09.png" alt="9. Nest">
<img src="10.png" alt="10. Crabby">
<img src="11.png" alt="11. Eagle">
<img src="12.png" alt="12. Forget">
<img src="13.png" alt="13. Kind">
<img src="14.png" alt="14. Empty" class="big">
<img src="15.png" alt="15. Armadillo" class="big">
<img src="16.gif" alt="16. Fowl">
<img src="17.png" alt="17. Salty">
<img src="18.png" alt="18. Scrape">
<img src="19.png" alt="19. Ponytail">
<img src="20.png" alt="20. Bluff">
<img src="21.png" alt="21. Bad Dog">
<img src="22.png" alt="22. Heist">
<img src="23.gif" alt="23. Booger">
<img src="24.png" alt="24. Fairy">
<img src="25.png" alt="25. Tempting" class="big">
<img src="26.png" alt="26. Ego">
<img src="27.png" alt="27. Snack" class="big">
<img src="28.png" alt="28. Camping" class="big">
<img src="29.png" alt="29. Uh-oh">
<img src="30.png" alt="30. Gear">
<img src="31.png" alt="31. Farm">
</div>


<style type="text/css">
.pixelicons {
	display: grid;
	grid-template-columns: repeat(2,1fr);
	gap: 1rem;
	grid-auto-flow: row dense;
}
.pixelicons img {
	display: block;
	width: 100%; height: auto;
	/* image-rendering: crisp-edges; */  
	/* image-rendering: pixelated; */
	transition-duration: 0;
	align-self: center;
}

@media only screen and (min-width: 640px) {
	.pixelicons { grid-template-columns: repeat(4,1fr); }
	.pixelicons img.big {
		grid-column: span 2;
		grid-row: span 2;
	}
}
.pixelicons img:hover {
	transition: transform 100ms ease-out;
	transform: scale(1.5);
	image-rendering: crisp-edges;
	image-rendering: pixelated;
}
.pixelicons img:active {
	width: 135px;
	transform: scale(3);
	transition: none;
	image-rendering: crisp-edges;
	image-rendering: pixelated;
}
</style>


[Previously](/posts/pixel-inktober/), [Previously](/posts/evenmopixels/), [Previously](/posts/mopixels/).
