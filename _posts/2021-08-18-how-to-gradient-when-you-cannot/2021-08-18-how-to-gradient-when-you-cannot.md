---
title: How to Gradient When You Can't
date: 2021-08-18
tags:
- work
- gnome
- inkscape
- tutorial
---

[comment]: <> <a href="{{ site.url }}{{ page.url }}">absolute links</a>
[comment]: [Previously]({% post_url 2021-02-25-tour-sketches/2021-02-25-tour-sketches %}).

While this topic isn't anything new (the asset in question is probably a decade old) I never shared a dirty little secret about some of our symbolic assets.

[UI icons](https://developer.gnome.org/hig/guidelines/ui-icons.html) in GNOME are to a major extent *monochrome*. They behave like text and can be rendered with various foreground colors depending on context. In a small subset of icons we use partially shaded elements. Those are done as a solid fill as well, but lowered opacity. Then can still remain recolorable at runtime. 

What we don't have is the ability to draw a *gradient* that remains recolorable, because we'd need more somphisticated machinery to rewrite the stops of the gradient definition. Or can we? Unless you're reading this on [Planet](https://planet.gnome.org/) or in your fancy [RSS reader](https://flathub.org/apps/details/com.gitlab.newsflash), you can see the spinner we've been using for well over 7 years now:

<style type="text/css">
#spinnerbg {
	width: 50%;
	min-width: 300px;
	height: 300px;
	margin: 32px auto;
	background-color: #f0f0f0;
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 16px;
	transition: all 1s ease-out;
}

body[data-theme="dark"] #spinnerbg {
	background-color: #0c0c0c;
}

#spinnerbg:hover,
body[data-theme="dark"] #spinnerbg:hover { 	
	transform: scale(0.95); 
	background-color: transparent;
cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='96' viewport='0 0 100 100' style='fill:black;font-size:48px;'><text y='50%'>🔍</text></svg>") 16 0, auto;
}

#icon {
	display: block;
	width: 16px;
	height: 16px;
	transform: rotate(0deg);
	animation: infirotation 1s linear infinite;
	transition: all 1s ease-out;
}
	#icon path { fill: black; }
	body[data-theme="dark"] #icon path { fill: white; }
	#icon:hover { animation-duration: 5s; }

.container {
	transition: transform 200ms ease-out;
}
#spinnerbg:hover .container {
	transform: scale(16);
}
@keyframes infirotation {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(359deg); }
}
</style>
<section id="spinnerbg">
<div class="container">

<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path d="M7.979 1.055a1.474 1.474 0 0 0-.27.025c-3 .16-5.627 2.222-6.451 5.129A7.13 7.13 0 0 0 4.5 14.037a7.13 7.13 0 0 0 8.4-1.105 7.13 7.13 0 0 0 1.106-8.4c1.507 2.725 1.032 6.162-1.135 8.37-2.228 2.148-5.654 2.577-8.33 1.065-2.618-1.576-3.914-4.73-3.18-7.672-.708 2.948.623 6.072 3.221 7.601 2.654 1.471 6.026 1.005 8.174-1.109 2.094-2.168 2.514-5.528 1.037-8.133 1.453 2.618.992 5.956-1.096 8.075-2.137 2.067-5.464 2.484-8.033 1.025C2.146 12.244.888 9.182 1.6 6.357c-.685 2.832.604 5.863 3.103 7.327 2.547 1.417 5.821.963 7.88-1.07 2.014-2.078 2.42-5.34.997-7.837 1.4 2.51.951 5.75-1.056 7.778-2.048 1.988-5.276 2.391-7.737.986C2.37 12.098 1.15 9.125 1.838 6.418c-.662 2.714.59 5.655 2.988 7.053 2.439 1.363 5.614.923 7.582-1.032 1.935-1.987 2.329-5.152.96-7.54 1.345 2.402.91 5.544-1.018 7.482-1.958 1.908-5.089 2.299-7.442.947C2.59 11.951 1.411 9.071 2.076 6.48c-.639 2.598.574 5.446 2.873 6.778 2.331 1.31 5.408.882 7.286-.992 1.855-1.898 2.235-4.963.92-7.245 1.292 2.295.869 5.338-.979 7.186-1.867 1.829-4.9 2.206-7.145.908-2.219-1.31-3.36-4.1-2.718-6.574-.616 2.48.56 5.238 2.76 6.504 2.223 1.256 5.2.842 6.988-.953 1.775-1.807 2.143-4.774.88-6.947 1.239 2.187.83 5.13-.939 6.888-1.777 1.75-4.71 2.114-6.847.87-2.12-1.246-3.223-3.943-2.604-6.3-.593 2.364.544 5.03 2.645 6.229 2.115 1.203 4.993.801 6.69-.914 1.697-1.717 2.051-4.585.843-6.65 1.184 2.08.788 4.924-.9 6.591-1.688 1.67-4.522 2.021-6.551.83-2.02-1.179-3.085-3.785-2.489-6.025-.57 2.247.53 4.822 2.53 5.955 2.007 1.15 4.786.76 6.394-.875 1.616-1.627 1.958-4.395.803-6.353 1.131 1.971.747 4.717-.861 6.295-1.597 1.59-4.332 1.927-6.254.79-1.92-1.113-2.947-3.628-2.373-5.751-.547 2.13.513 4.614 2.414 5.681 1.9 1.096 4.58.72 6.097-.836 1.537-1.536 1.865-4.206.764-6.056 1.077 1.864.707 4.51-.822 5.998-1.507 1.51-4.143 1.835-5.957.752-1.82-1.047-2.808-3.47-2.258-5.477-.524 2.013.498 4.405 2.299 5.406 1.792 1.042 4.373.68 5.8-.797 1.457-1.446 1.773-4.016.725-5.76 1.024 1.757.666 4.305-.783 5.702-1.417 1.43-3.953 1.742-5.66.713-1.721-.981-2.672-3.314-2.145-5.203-.5 1.896.484 4.197 2.186 5.132 1.684.989 4.166.64 5.504-.757 1.377-1.357 1.68-3.828.685-5.463.97 1.649.626 4.097-.744 5.404-1.326 1.35-3.764 1.65-5.363.674-1.621-.915-2.534-3.155-2.03-4.928-.477 1.78.47 3.988 2.07 4.858 1.578.934 3.96.598 5.208-.72 1.297-1.266 1.587-3.638.646-5.165.917 1.54.585 3.89-.705 5.107-1.236 1.271-3.575 1.557-5.066.635-1.522-.849-2.395-2.999-1.914-4.654-.455 1.662.453 3.779 1.955 4.582 1.469.88 3.752.557 4.908-.68 1.217-1.176 1.494-3.447.607-4.865.875 1.425.577 3.685-.636 4.836-1.15 1.213-3.411 1.51-4.836.636-1.47-.797-2.343-2.904-1.867-4.507.39-1.626 2.197-3.013 3.869-2.97V4a1.474 1.474 0 0 0 .002 0 1.474 1.474 0 0 0 1.472-1.473 1.474 1.474 0 0 0-1.472-1.472 1.474 1.474 0 0 0-.002 0z" style="marker:none" color="#000" overflow="visible" fill="#474747"/></svg>

</div>
</section>

It actually isn't filtered particularly well in Firefox, but is nice and clean in gtk. Firefox amplifies one of the big downsides of this method, it's quite prone to moiré. If you hover over the spinner, it reveals the nasty hack how the fade to transparency has been achieved.

Let me show you how it's done in [Inkscape](https://flathub.org/apps/details/org.inkscape.Inkscape). The UI is a bit of afterthought, but you can make actual objects follow a path. 

<video controls autoplay loop class="image full">
<source src="{{site.url}}{{page.url}}inkscape-10fps.webm" type="video/webm">
<source src="http://jimmac.musichall.cz/stuff/blog/inkscape-10fps.mp4" type="video/mp4"><!-- safari is very picky -->
</video>

* The first step will be to create our spinner in its linear form. Create a rectangle, convert it into a shape with `Ctrl+Shift+C` and subdivide one of the sides a couple of times using the `Add Node` button in the context menubar.
* To create the etch-gradient, select every even node on the side and move them horizontally.
* Next step is to create the curve this object will follow. The easiest is to use the `Ellipse` primitive and only make it go along around 270deg rather than a full circle.
* Now onto the magic. Putting shapes onto curves is done with a `pattern along curve` path effect found in the `path` menu. Despite the odd terminology, path effects can be previewed in real time and working with them is much easier than filters.
Setting the source shape can be done multiple ways, but I found pasting from clipboard the easiest. If the source object is actually on canvas, the shape will remain *linked* and editing the source shape will result in the path effect updating on the target curve in real time, allowing iteration into perfection.

I bet there is a filter that can produce halftoning out of a gradient, but who's brave enough to spend an evening in the `filters` menu.

The best thing about the spinner is that [Software](https://gitlab.gnome.org/GNOME/gnome-software/) is now getting a lot less of it. Phillip & Milan, thank you.