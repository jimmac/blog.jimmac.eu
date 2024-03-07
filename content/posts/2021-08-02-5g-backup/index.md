---
title: 5G Backup
date: 2021-08-02
tags:
- gnome
- whenthingsworklikemagic
---

![git worktree](5G_Backup.png)

When I get glimpses of the world outside of my FOSS bubble, I see all these tips and tricks articles how people can use their computers that provide something surprising or not universally known.

The equivalent of this in the FOSS world is a 6 page wiki outlining how to produce a `smb.conf` to share files between two computers in 2021.

To offset this depression, I'd like to present some cases when things work ... as they should.

# The case of unreliable Internets

For the longest of times, I paid for two internet access providers, sporting a router that would fall back onto the other in case the first one had issues. This may sound like an overkill for a home connection, but you have to realize working from home isn't something I've been doing for months, but years.

So why did I stop? Well finally Czech republic has joined countries with somewhat reasonable limited [unlimited data cellular connection](https://www.lupa.cz/aktuality/vodafone-uvadi-tarif-s-neomezenymi-daty-s-pevnym-pripojenim-a-ne-pro-jednotlivce/), so my 5G/LTE can work like a reasonable fallback.

Now the best part. How elaborate is the process of going online after my main ISP goes down?

1. First step is to hook up my iphone to the workstation using the lightning to usb cable.
2. That's it. There is no step 2.

This obviously wouldn't be as powerful of a set up guide if I explained you have to have `personal hotspot` enabled in ios, but honestly that's all the configuration you need. NetworkManager detects the device as a usb ethernet device and because the route is down for your main one, will happily set up the default route to the new one.

It works like magic. Like everything should.