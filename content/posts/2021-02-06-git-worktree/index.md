---
title: Git Worktree — Concurrent Development
date: 2021-02-06
tags:
- work
- git
- gnome
---

![git worktree](git-worktree.png)

Sometimes you have to sit on two chairs at the same time. No, I don't mean to give you east-European political advice. I mean developing things in two concurrent branches can be a pain with the constant switching. 

In my case I need to develop a stylesheet for both *gtk3* and *gtk4* at the same time, usually having to compare the two running concurrently. [Matthias](https://blogs.gnome.org/mclasen/) recently introduced me to the secret cabal of people knowing about `git worktree`. Thanks to it you can have two branches of the same project checked out at the same time, not only saving you the (cheap) drive space, but keeping a single history so *cherry picking* and diffing between the two doesn't need to involve refreshing remotes or jumping through other hoops.

So let's take a look at my scenario. I have gtk checked out in [Builder](https://flathub.org/apps/details/org.gnome.Builder), by default going to `~/Projects/gtk`. The `master` branch equates to the new goodness of *gtk4*. Pushing the *run* button will build me `gtk4-widget-factory` ready to test the stylesheet. But to have the gtk3 equivalent run side by side, I don't use a duplicate of the repo, but instead created a worktree copy:

```
cd ~/Projects/gtk
git checkout -tb gtk-3-24 origin/gtk-3-24 
git checkout master 
git worktree add ../gtk3 gtk-3-24
```

At this point you can open the `gtk3` project in Builder and works as if those were not closely interconnected. But every commit is 'visible' in the other project.