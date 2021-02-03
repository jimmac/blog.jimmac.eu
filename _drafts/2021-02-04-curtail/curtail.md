---
title: Curtail
tags:
- app
- flathub
---

[comment]: <> <div class="inlineimgs" markdown="1">
[comment]: <> <a href="{{ site.url }}{{ page.url }}">absolute links</a>
[comment]: <> [article links]({% post_url archive/2018-02-12-shelved-wallpapers/2018-02-12-shelved-wallpapers %})

While the app got some spotlight on [GNOME Circle](https://circle.gnome.org), I found it super handy to my own use that I decided to write about it here as well.

# ImageMagick

Even though I keep forgetting syntax for everything, one of the few bash constructs I remember is the `for in` loop. Mainly because that's how I repeadly convert and modify images on the command line with ImageMagick's `convert` or `mogrify` (same but dangerously operating on the same file):

```
for image in *jpeg; 
	do 
	out=`basename $image .jpeg`-thumb.jpeg
	convert -geometry 400 $image $out
done
```

Well usually on one line as:

```
for image in *jpeg; do out=`basename $image .jpeg`-thumb.jpeg; convert -geometry 400 $image $out; done
```