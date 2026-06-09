+++
title = "How to Symbolic Icon"
description = "A walkthrough of creating GNOME symbolic icons with 2021 tooling."
date = 2021-04-30
aliases = ["/2021/how-to-symbolic/"]
[taxonomies]
tags = ["icon", "design", "gnome", "work", "inkscape"]
[extra]
image = "pencil.jpg"
audio = "speech.opus"
related = [
  "posts/2020-04-06-art-vs-design/index.md",
  "posts/2019-01-23-the-big-app-icon-redesign/index.md",
  "posts/2015-03-24-high-contrast-refresh/index.md",
]
+++
<img loading="lazy" src="icon-tooling.svg" alt="Icon Tooling">

Unlike [application icons](/posts/the-big-app-icon-redesign/), the [symbolic icons](https://teams.pages.gitlab.gnome.org/Design/hig-www/guidelines/ui-icons.html) don't convey application identity, but rely on visual metaphor to describe an action (what a button in the UI does).

GNOME has not used fullcolor icons in toolbars and most of the UI in many years. Instead we use symbols, adjusting legibility and their rendering the same way we do with text (recoloring the foreground and background as you can demo switching the dark theme on this blog post).

<svg viewBox="0 0 800 100" xmlns="http://www.w3.org/2000/svg" id="symbols">
<style>g.symbolic{fill:#000}@media(prefers-color-scheme:dark){g.symbolic{fill:#fff}}</style>
<g class="symbolic"><path d="M446.067 38.298a7.5 7.5 0 00-5.277 1.97l-1.512 1.347-1.511-1.348a7.5 7.5 0 10-9.977 11.203l11.488 10.235 11.489-10.235a7.5 7.5 0 00-4.7-13.172z"/></g>
<g class="symbolic"><path d="M528.597 36.992a1 1 0 00-.176.016h-3.82c-1.108 0-2 .892-2 2s.892 2 2 2h3.543l2.25 12h-.723a1 1 0 00-.07 0c-1.07 0-2.063.573-2.598 1.5a3.004 3.004 0 000 3 3.003 3.003 0 002.598 1.5h1.176a3 3 0 00-.176 1 3 3 0 003 3 3 3 0 003-3 3 3 0 00-.176-1h6.352a3 3 0 00-.176 1 3 3 0 003 3 3 3 0 003-3 3 3 0 00-2.875-2.992 1 1 0 00-.125-.008h-16a.998.998 0 01-.867-1.5c.18-.311.508-.5.867-.5h14c1.294 0 2.414-.618 3.223-1.508.808-.89 1.376-2.036 1.84-3.297.925-2.522 1.423-5.557 1.917-7.996a1 1 0 00-.98-1.2h-19.418l-.598-3.183a1 1 0 00-.988-.832zm1.961 6.016h2.043v2h2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h1.734c-.128.655-.268 1.328-.402 2h-1.332v2h.902a24.4 24.4 0 01-.554 2h-.348v.926c-.153.376-.306.757-.477 1.074h-1.523v1.742c-.3.163-.62.258-1 .258h-1v-2h-2v2h-2v-2h-2v2h-2v-2h-2v2h-.168l-.375-2h.543v-2h-.918l-.375-2h1.293v-2h-1.668zm2.043 4v2h2v-2zm2 0h2v-2h-2zm2 0v2h2v-2zm2 0h2v-2h-2zm2 0v2h2v-2zm2 0h2v-2h-2zm2 0v2h2v-2zm0 2h-2v2h2zm-4 0h-2v2h2zm-4 0h-2v2h2z"/></g>
<g class="symbolic"><path d="M40.05 39.624a2 2 0 00-1.799.966 14.008 14.008 0 00-2.112 7.398 2 2 0 104 0c0-1.868.524-3.7 1.51-5.286a2 2 0 00-1.6-3.078z"/><path d="M38.107 45.96a2 2 0 00-1.968 2.028v10.126a2 2 0 104 0V47.988a2 2 0 00-2.032-2.028z" fill-rule="evenodd"/><path d="M50.14 39.988c-4.397 0-8 3.606-8 8a2 2 0 104 0c0-2.232 1.765-4 4-4 2.231 0 4 1.768 4 4a2 2 0 104 0c0-4.394-3.607-8-8-8z"/><path d="M50.107 45.96a2 2 0 00-1.968 2.028v10s-.002 1.19.288 2.64c.29 1.452.826 3.302 2.298 4.774a2 2 0 102.828-2.828c-.53-.528-.994-1.678-1.204-2.726-.21-1.05-.21-1.86-.21-1.86v-10a2 2 0 00-2.032-2.028zm-6 0a2 2 0 00-1.968 2.028v2a2 2 0 104 0v-2a2 2 0 00-2.032-2.028zm0 8a2 2 0 00-1.968 2.028v6a2 2 0 104 0v-6a2 2 0 00-2.032-2.028zm12-8a2 2 0 00-1.968 2.028v10s.018.88.35 1.882a9.12 9.12 0 002.236 3.532 2 2 0 102.828-2.828c-.766-.764-1.1-1.472-1.266-1.968-.168-.498-.148-.618-.148-.618v-10a2 2 0 00-2.032-2.028zm6 0a2 2 0 00-1.968 2.028v2a2 2 0 104 0v-2a2 2 0 00-2.032-2.028z"/><path d="M50.283 33.988a13.992 13.992 0 00-6.976 1.78 2 2 0 101.948 3.494 9.994 9.994 0 019.94.1 9.992 9.992 0 014.944 8.626 2 2 0 104 0 14.012 14.012 0 00-6.92-12.078 13.986 13.986 0 00-6.934-1.922z"/><path d="M64.14 55.988a2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2 2 2 0 012 2z"/></g>
<g class="symbolic"><path d="M139.431 34c-4 0-4 4-4 4v24c0 4 4 4 4 4h16s4 0 4-4V40l-6-6zm2 12l1.996.012v4h-4l.004-2.012s0-2 2-2zm12 0c2 0 2 2 2 2l-.004 2.004h-4v-4zm-8.004.012h4v4h-4zm-6 5.992h16V56h.004v4c0 2-2 2-2 2l-2.004-.004.004-5.992h-12.004zm12.004 4h3.996V56h-3.996zm-12.004 2h4v4L141.431 62c-2 0-2-2-2-2zm6 0h4v4h-4z"/></g>
<g class="symbolic"><path d="M236.724 43.013a1 1 0 00-1 1v5.938a9.032 9.032 0 006 8.5v2.562h-4c-1.13 0-2 .98-2 2v2h18v-2c0-1.168-.952-2-2-2h-4v-2.562a9.032 9.032 0 006-8.5v-5.938a1 1 0 00-2 0c0 .138.012.256.062.376v5.56a7.042 7.042 0 01-7.06 7.064c-3.908 0-7.002-3.134-7.002-7.062v-5.938a1 1 0 00-1-1zm8-8.026c2.77 0 5 2.23 5 5v10.026c0 2.77-2.23 5-5 5a4.99 4.99 0 01-5-5V39.987c0-2.77 2.23-5 5-5z"/></g>
<g class="symbolic"><path d="M334.986 35.972a2 2 0 00-1.97 2.028v1a2 2 0 00.146.742l6 15A2 2 0 00341.016 56h6.614l2.516 6.704a2 2 0 001.87 1.296h3a2 2 0 100-4h-1.612l-2.516-6.704A2 2 0 00349.016 52h-6.644l-5.356-13.386V38a2 2 0 00-2.03-2.028z"/><path d="M341.016 38a4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4 4 4 0 014 4z"/><path d="M333.384 45.04c-3.75 1.756-6.368 5.56-6.368 9.96 0 6.052 4.95 11 11 11 4.006 0 7.428-2.214 9.314-5.45L346.31 58h-1.984c-1.12 2.366-3.5 4-6.31 4a6.97 6.97 0 01-7-7c0-2.72 1.538-5.03 3.78-6.192z"/><path d="M339.016 46a2 2 0 100 4h8a2 2 0 100-4z"/></g>
<g class="symbolic"><path d="M618.894 44h4.968l5.94-6h1.092v24h-.95l-6.08-6h-4.97z"/><path d="M648.894 50c0-5.628-2-10.344-5.172-14h-2.828v2.96c2.53 3.04 4 6.44 4 11.04 0 4.6-1.56 8-4 11.04V64h2.762c2.932-3.28 5.238-8.372 5.238-14z"/><path d="M642.894 50c0-4.332-1.478-8.04-4-10h-2v4c1.214 1.578 2 3.52 2 6 0 2.482-.786 4.44-2 6v4h2c2.446-1.99 4-5.746 4-10z"/><path d="M636.894 50c0-2.514-.624-4.432-2-6h-2v12h2c1.344-1.674 2-3.484 2-6z"/></g>
<g class="symbolic"><path d="M727.186 41h16c1.108 0 2 .892 2 2v14c0 1.108-.892 2-2 2h-16c-1.108 0-2-.892-2-2V43c0-1.108.892-2 2-2zm-2 8.94l-6.94-6.94h-1.06v14h1z"/></g>
</svg>

But how does one create such an icon? Here's a walkthrough of the process, using our 2021 tooling. While the actual drawing of shapes still happens in [Inkscape](https://flathub.org/apps/details/org.inkscape.Inkscape), the workflow is now heavily supported by a suite of [design tools](https://tools.design.gnome.org).


Before we dive into *creation* though, let's start with a more common case: In many cases developers just want to pick and use an existing icon rather than attempting to create it or commission a designer.

## Finding an Icon

Historically, looking up icons has been a matter of familiarizing yourself with the [icon naming spec](https://developer.gnome.org/icon-naming-spec/), which was built on the concept of *semantic naming*. However, it turns out developers really just want that symbol that *looks like a door*, rather than adhering to the strict semantic constraints. Combined with icon themes and evolving visual trends this semantic dream gradually faded over time.

The very basic set of icons is provided directly by the [toolkit](https://gtk.org). For the most part it still adheres to the semantic names such as `edit-copy` or `menu-open` rather than descriptive names like `scissors` or `pencil`. The coverage of the set is [quite conservative](https://gitlab.gnome.org/GNOME/gtk/-/tree/master/gtk/icons/scalable) and you're likely to need something that isn't provided by GTK itself. 

Sounds like a lot of work? Lucky for you we have [Icon Library](https://flathub.org/apps/details/org.gnome.design.IconLibrary) to make this easy!

### Icon Library

The app can help you not only to search for an appropriate icon using keywords, it can assist you distributing the assets along with your app (as a [gresource](https://developer.gnome.org/gio/stable/GResource.html)). While it's on you as a developer to maintain the assets you bundle, no longer will your app break when you've used the `the wrench` icon when the designers followed a trend of using a pegged wheel for `preferences` or decided to drop an old or unused icon.

<a href="https://flathub.org/apps/details/org.gnome.design.IconLibrary"><img loading="lazy" src="icon-library.png" alt="Icon Library"></a>

It's worth noting the app is also quite useful for designers, since you can also copy & paste icons into mockups easily.

The application is currently being ported to [GTK 4](https://gtk.org) so there's a lot of moving parts in the air at the moment, but the latest release on Flathub is perfectly usable.

## Creation

So let's assume the icons available don't really fit your need and you need to create one from scratch. I should boldly proclaim that with no API-like maintenance burden, the design team is more than happy to fulfill app developers' requests. Especially apps aiming to be listed in [GNOME Circle](https://circle.gnome.org), feel free to request an icon [on Gitlab](https://gitlab.gnome.org/Teams/Design/icon-development-kit/-/issues). 

The first step is always to figure out **the metaphor**. Sketching out some ideas on paper is a solid recommendation. Even if you think you're no good at sketching, try it. In fact, especially when you're not good at sketching, the process will help you identify very strong metaphors that convey the meaning even using a few squibbly lines. The more definition you provide, the harder it is to tell whether the function isn't overshadowed by the form.

<img loading="lazy" src="sketching.png" alt="Sketching">

Once you're somewhat convinced a fitting metaphor can be executed on the 16x16 pixel grid, it's time to reach for the tool to guide your throughout the process, [Symbolic Preview](https://flathub.org/apps/details/org.gnome.design.SymbolicPreview).

### A Handful

Let's assume you have a small app that is very early in development and you decided to make it easy to report issues with it and need a `report bug` icon for the headerbar.

<img loading="lazy" src="pencil.jpg" alt="Pencil">

`Symbolic Preview` either allows you to create a single symbolic or a sheet with many symbolics. In our first case, we'll go for just one.

<img loading="lazy" src="single-vs-many.png" alt="Single Symbolic">

After providing a name for your icon (prefixing with app name can avoid some [theming issues](https://gitlab.gnome.org/GNOME/gnome-screenshot/-/issues/125)) a template is saved. Currently you have to do some file system surfing to open up the asset in [Inkscape](https://flathub.org/apps/details/org.inkscape.Inkscape).

<img loading="lazy" src="single-1.png" alt="File Naming">

Symbolic preview can be used as its name suggests. Currently it doesn't [auto-reload](https://gitlab.gnome.org/World/design/symbolic-preview/-/issues/26) on changes, but hopefully that will come soon. 

There are some [basic guidelines](https://teams.pages.gitlab.gnome.org/Design/hig-www/guidelines/ui-icons.html) on how to produce a GNOME symbolic icons, but to provide a *tl;dr* &mdash; 

* Use filled shapes to provide enough contrast
* Maintain the overall contrast not going edge to edge
* Main outline should not use a hairline stroke, 2px strokes are advised
* Convert strokes to outlines. The old toolchain allowed to use strokes as long as no fill was used on the same object, but it has been the source of many misrenderings. Just convert all strokes to outlines with `Path>Stroke to Path` in Inkscape.

<img loading="lazy" src="single-2.png" alt="Symbolic Preview">

The app provides different color contexts and displays your icon among existing symbolics, not unlike what App Icon Preview does for app icons. Again, this is when you only need to ship a handful of icons with your app.

Your needs may, however, exceed just a few. Maintaining lots of individual icons in separate files becomes daunting. Also, there is no need to see your icons in the context of others when they form a large enough set on their own. 

The same app we just used to create and test a single symbolic icon can be used to maintain a large set of symbolics in a single library file. The [icon-development-kit](https://gitlab.gnome.org/Teams/Design/icon-development-kit) that is the source for most of the icons you can search with [Icons Library](https://flathub.org/apps/details/org.gnome.design.IconLibrary) is also maintained this way. Let's take a look how you can maintain a whole set of symbolics icons.

### A Lot

Unlike individual icons, for preview and export to work, this workflow is very Inkscape centered and there are numerous constraints to be mindful of, so let's dive in.

#### Export Conventions
There are a few conventions you need to follow in order for the export to work. Icon devel kit describes the [conventions in detail](https://gitlab.gnome.org/Teams/Design/icon-development-kit), but let's sum them up here:

- Each icon is a group (`<g>`). To force its size to be 16x16px, the icon should include a `<rect>` with no stroke or fill, that is exactly 16x16 and aligns to the pixel grid. This rectangle is removed during export.
- The name of the icon is taken from the `title` property of the group in the object properties in Inkscape (`Object>Object Properties`). (`<title/>`).
- If you wish to omit an icon in the preview and export, don't provide a name for it or append `-old` to it. This can be useful for some 'build assets'.

#### Metadata
While it's mainly useful for maintaining a collection like icon-development-kit, you will save yourself time [looking up your own assets](https://gitlab.gnome.org/World/design/symbolic-preview/-/issues/31) if you provide some metadata describing your icon. 

<img loading="lazy" src="multiple-1.png" alt="Sheet Preview">

Keywords for an icon are given as space separated words in the `label` attribute in object properties in Inkscape (`inkscape:label` attribute).


# Acknowledgments

Jokingly we refer to the [design tool page](https://tools.design.gnome.org) as the *Bilal page*. A huge thank you goes to [Bilal Elmoussaoui](https://belmoussaoui.com/) for writing brilliant apps for GNOME and making the design process a little less punishing.

<style type="text/css">
#symbols {
  width: 100%;
}
</style>
