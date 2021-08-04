---
title: Deescalating Tensions
date: 2021-08-04
tags:
- inkscape
- svg
- git
---

![inkscape](Inkscape.png)

One of the great attributes of [SVG](https://en.wikipedia.org/wiki/Scalable_Vector_Graphics) is that its text nature lends itself to be easily [version controlled](https://git-scm.com/). [Inkscape](https://inkscape.org) uses SVG as its native format (and extends it using its private namespace).

Unfortunately it uses the documents themselves to store things like canvas position and zoom state. This instantly erases one of the benefits for easy version control as every change instantly turns into unsolvable conflict.

Luckily you can at least give up the ability to store the canvas position for the greater good of not having merge conflicts, if you manage to convince your peers to change its defaults. Which is what this blog post is about :)

To change these defaults, you have to dive into the thick forrest that is Inkscape's preferences (`Edit > Preferences`). You'll find then in the `Interface > Windows` section. The default being the unfortunate `Save and restore window geometry for each document` needs to be changed either to `Don't save window geometry` or `Remember to use last window's geometry`.

From now on, rebasing [icon-development-kit](https://gitlab.gnome.org/Teams/Design/icon-development-kit) won't cause any more grey hair for you!