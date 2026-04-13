+++
title = "release.gnome.org refactor"
description = "After successfully moving this blog to Zola, doubts got suppressed and I found my favorite SSG."
date = 2026-04-13
[taxonomies]
tags = ["blog", "tech", "gnome", "work"]
[extra]
image = "release.webp"
mastodon_url = "https://mastodon.social/@jimmac/116396962857435861"
+++

After successfully moving *this* blog to [Zola](/posts/port-to-zola/), doubts got suppressed and I couldn't resist porting the [GNOME Release Notes](https://release.gnome.org) too.

## The Proof

The blog port worked better than expected. Fighting CI github action was where most enthusiasm was lost. The real test though was whether Zola could handle a site way more important than my little blog — one hosting release notes for GNOME.

## What Changed

The main work was porting the templates from Liquid to Tera, the same exercise as the blog. That included structural change to shift releases from Jekyll pages to proper Zola *posts*. This enabled two things that weren't possible before:

- **RSS feed** — With releases as posts, generating a feed is native. Something I was planning to do in the Jekyll world … but there were *roadblocks*.
- **The archive** — Old release notes going back to GNOME 2.x have been properly ported over. They're now part of the navigable archive instead of lost to the ages. I'm afraid it's quite a cringe town if you hold nostalgic ideas how amazing things were back in the day.

## The Payoff

The site now has a working [RSS feed](https://release.gnome.org/atom.xml) — years of broken promises finally fulfilled. The full archive from GNOME 2.x through 50 is available. And perhaps best of all: zero dependency management and supporting people who "just want to write a bit of markdown". Just a single binary.

I'd say it's another success story and if I were a Jekyll project in the [websites team space](https://gitlab.gnome.org/Teams/Websites), I'd start to worry.
