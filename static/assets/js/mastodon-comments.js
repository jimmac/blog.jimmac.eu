/**
 * Mastodon comments — progressive enhancement.
 *
 * Turned on per-post by <section class="mastodon-comments"
 * data-mastodon-url="..."> in templates/post.html. Fetches the thread
 * from the Mastodon API (public posts; no token) and renders the
 * replies locally. Without JavaScript the section stays hidden.
 *
 * Heavily adapted from the technique popularised by
 * https://cassidyjames.com (via jwildeboer's fediverse_comments).
 */
(function () {
  "use strict";

  var section = document.querySelector(".mastodon-comments[data-mastodon-url]");
  if (!section) return;

  var wrapper = section.querySelector(".mastodon-comments-list");
  if (!wrapper) return;

  // Progressive enhancement: once JS runs, the inline discussion takes
  // over from the "Discuss on the Fediverse" button (which remains the
  // no-JS fallback).
  section.hidden = false;
  var button = document.querySelector(".mastodon-discuss");
  if (button) button.hidden = true;

  // Parse https://host/@user/123456 (also tolerates ?fragment)
  var m = section.dataset.mastodonUrl.match(/^https:\/\/([^/]+)\/@[^/]+\/(\d+)/);
  if (!m) return;
  var HOST = m[1];
  var ID = m[2];
  // The blog owner's acct, used to tag the OP's replies.
  var OWNER_HOST = "mastodon.social";
  var OWNER_USER = "jimmac";

  var API = "https://" + HOST + "/api/v1/statuses/" + ID;

  fetch(API, { headers: { Accept: "application/json" } })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r); })
    .then(function (status) {
      return fetch(API + "/context", { headers: { Accept: "application/json" } })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r); })
        .then(function (ctx) { render(status, ctx || {}); });
    })
    .catch(function () {
      wrapper.innerHTML =
        '<p class="mastodon-comments-fallthrough">Couldn\u2019t load the discussion. ' +
        '<a href="' + section.dataset.mastodonUrl + '">View it on Mastodon</a>.</p>';
    });

  function render(status, ctx) {
    wrapper.innerHTML = "";
    var descendants = ctx.descendants;
    if (!descendants || !descendants.length) {
      wrapper.innerHTML =
        '<p class="mastodon-comments-none">No replies yet. Reply to ' +
        '<a href="' + section.dataset.mastodonUrl + '">this post</a> to be the first!</p>';
      return;
    }
    setStatusCounts(status);
    buildThread(domTree(status, descendants), wrapper);
  }

  function setStatusCounts(status) {
    var counts = section.querySelector(".mastodon-reply-count");
    if (counts && status.replies_count > 0) {
      counts.hidden = false;
      counts.textContent = "(" + status.replies_count + " " +
        (status.replies_count === 1 ? "reply" : "replies") + ")";
    }
  }

  /* ---------- thread building -------------------------------------- */

  // Map statuses by id and return depth-first {status, children} nodes.
  function domTree(root, list) {
    var byId = {};
    var nodes = [];
    list.forEach(function (s) {
      if (s.account.acct === OWNER_USER + "@" + OWNER_HOST &&
          s.in_reply_to_id === root.id) {
        // skip the blog owner's "linking back to the article" thread starter
        return;
      }
      byId[s.id] = { status: s, children: [] };
    });
    list.forEach(function (s) {
      if (!byId[s.id]) return;
      var parent = byId[s.in_reply_to_id];
      if (parent && s.id !== root.id) parent.children.push(byId[s.id]);
      else if (s.id !== root.id) nodes.push(byId[s.id]);
    });
    return { status: root, children: nodes };
  }

  function buildThread(node, container, depth) {
    depth = depth || 0;
    if (depth) {
      // the root status (depth 0) is the blog post hook itself — only
      // replies are shown
      container.appendChild(commentNode(node.status, depth));
    }
    node.children.sort(function (a, b) { return a.status.created_at < b.status.created_at ? -1 : 1; });
    var childrenBox;
    if (node.children.length) {
      childrenBox = document.createElement("div");
      childrenBox.className = "mastodon-thread";
      container.appendChild(childrenBox);
    }
    node.children.forEach(function (child) {
      buildThread(child, childrenBox || container, depth + 1);
    });
  }

  // mime-escape helper (media url -> img alt) not needed; just HTML escape
  function commentNode(status, depth) {
    var instance = status.account.acct.includes("@")
      ? status.account.acct.split("@")[1]
      : HOST;
    var isOp = status.account.acct === OWNER_USER + "@" + OWNER_HOST;

    var article = document.createElement("article");
    article.className = "mastodon-comment" + (isOp ? " is-op" : "");
    article.id = "comment-" + status.id;

    /* avatar */
    var avatar = document.createElement("a");
    avatar.className = "mastodon-avatar-link";
    avatar.href = status.account.url;
    avatar.rel = "noopener nofollow";
    var img = document.createElement("img");
    img.className = "mastodon-avatar";
    img.src = status.account.avatar_static;
    img.alt = "@" + status.account.username + "@" + instance + " avatar";
    img.loading = "lazy";
    avatar.appendChild(img);
    article.appendChild(avatar);

    /* header: name, instance, date */
    var header = document.createElement("header");
    header.className = "mastodon-comment-header";

    var name = document.createElement("a");
    name.className = "mastodon-name";
    name.href = status.account.url;
    name.rel = "noopener nofollow";
    var disp = status.account.display_name || status.account.username;
    var dispEl = document.createElement("span");
    dispEl.appendChild(emojifyText(disp, status.account.emojis || []));
    name.appendChild(dispEl);
    header.appendChild(name);

    var badge = document.createElement("a");
    badge.className = "mastodon-instance";
    badge.href = status.account.url;
    badge.rel = "noopener nofollow";
    badge.title = "@" + status.account.username + "@" + instance;
    badge.textContent = instance;
    header.appendChild(badge);

    var time = document.createElement("time");
    time.className = "mastodon-comment-date";
    time.setAttribute("datetime", status.created_at);
    if (status.edited_at) {
      time.title = "Edited " + new Date(status.edited_at).toLocaleString();
    }
    var link = document.createElement("a");
    link.href = status.url;
    link.rel = "noopener nofollow";
    link.textContent = new Date(status.created_at).toLocaleDateString(
      undefined, { dateStyle: "medium" });
    time.appendChild(link);
    header.appendChild(time);
    article.appendChild(header);

    /* main body */
    var body = document.createElement("div");
    body.className = "mastodon-comment-body";

    if (status.sensitive && status.spoiler_text !== "") {
      var details = document.createElement("details");
      var summary = document.createElement("summary");
      summary.textContent = status.spoiler_text || "Sensitive";
      var inner = document.createElement("div");
      inner.innerHTML = status.content;
      details.appendChild(summary);
      details.appendChild(inner);
      body.appendChild(details);
    } else {
      body.innerHTML = status.content;
    }

    /* media attachments */
    var media = (status.media_attachments || []).filter(function (a) {
      return a.type === "image" || a.type === "gifv";
    });
    if (media.length) {
      var grid = document.createElement("div");
      grid.className = "mastodon-media";
      media.forEach(function (a) {
        var item;
        if (a.type === "gifv") {
          item = document.createElement("video");
          item.src = a.url;
          item.autoplay = true;
          item.loop = true;
          item.muted = true;
          item.playsInline = true;
        } else {
          item = document.createElement("img");
          item.src = a.url;
          item.loading = "lazy";
          if (a.description) item.alt = a.description;
        }
        var anchor = document.createElement("a");
        anchor.className = "mastodon-media-item";
        anchor.href = a.url;
        anchor.rel = "noopener nofollow";
        anchor.appendChild(item);
        grid.appendChild(anchor);
      });
      body.appendChild(grid);
    }
    article.appendChild(body);

    /* footer: favourites + boosts */
    var foot = document.createElement("footer");
    foot.className = "mastodon-comment-meta";
    if (status.favourites_count > 0) {
      foot.appendChild(metaItem("\u2764", status.favourites_count, "Favourites"));
    }
    if (status.reblogs_count > 0) {
      foot.appendChild(metaItem("↻", status.reblogs_count, "Boosts"));
    }
    if (foot.childNodes.length) article.appendChild(foot);

    return article;
  }

  function metaItem(sym, n, label) {
    var s = document.createElement("span");
    s.className = "mastodon-meta-item";
    s.title = label;
    s.setAttribute("aria-label", label);
    s.textContent = sym + " " + n;
    return s;
  }

  /* Replace :shortcodes: with instance emoji <img> in a plain string. */
  function emojifyText(text, emojis) {
    var frag = document.createDocumentFragment();
    var re = /:[A-Za-z0-9_]+:/g;
    var last = 0, match;
    while ((match = re.exec(text)) !== null) {
      var code = match[0].slice(1, -1);
      var emoji = emojis.find(function (e) { return e.shortcode === code; });
      if (!emoji) continue;
      frag.appendChild(document.createTextNode(text.slice(last, match.index)));
      var i = document.createElement("img");
      i.className = "mastodon-emoji";
      i.src = emoji.static_url;
      i.alt = match[0];
      i.title = match[0];
      // Escape arbitrary text nodes coming from the API safely:
      // text nodes are created above, never innerHTML.
      frag.appendChild(i);
      last = match.index + match[0].length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    return frag;
  }

})();
