document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("audio[controls]").forEach(initPlayer);
});

function formatTime(s) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ":" + String(sec).padStart(2, "0");
}

/* ----------------------------------------------------------------
   Metadata parsing – ID3v2 (MP3) and MP4 atoms (M4A/AAC)
   ---------------------------------------------------------------- */

function synchsafeInt(buf, off) {
  return (buf[off] << 21) | (buf[off+1] << 14) | (buf[off+2] << 7) | buf[off+3];
}

function uint32(buf, off) {
  return (buf[off] << 24) | (buf[off+1] << 16) | (buf[off+2] << 8) | buf[off+3];
}

function decodeText(bytes, encoding) {
  if (encoding === 3 || encoding === 0) {
    const charset = encoding === 3 ? "utf-8" : "iso-8859-1";
    return new TextDecoder(charset).decode(bytes);
  }
  if (encoding === 1 || encoding === 2) {
    const charset = encoding === 2 ? "utf-16be" : "utf-16";
    return new TextDecoder(charset).decode(bytes);
  }
  return new TextDecoder("utf-8").decode(bytes);
}

function parseID3v2(buf) {
  const d = new Uint8Array(buf);
  if (d[0] !== 0x49 || d[1] !== 0x44 || d[2] !== 0x33) return null;
  const major = d[3];
  const tagSize = synchsafeInt(d, 6);
  const meta = {};
  let pos = 10;
  if (d[5] & 0x40) pos += 10; // skip extended header (simplified)
  const end = 10 + tagSize;
  const frameIdLen = major >= 3 ? 4 : 3;
  const frameSizeLen = major >= 3 ? 4 : 3;
  const frameHeadLen = major >= 3 ? 10 : 6;
  const wantText = major >= 3
    ? { TIT2: "title", TPE1: "artist", TALB: "album" }
    : { TT2: "title", TP1: "artist", TAL: "album" };

  while (pos + frameHeadLen < end) {
    const id = String.fromCharCode(...d.slice(pos, pos + frameIdLen));
    if (id[0] === "\0") break;
    let size;
    if (major >= 3) {
      size = major === 4
        ? synchsafeInt(d, pos + 4)
        : uint32(d, pos + 4);
    } else {
      size = (d[pos+3] << 16) | (d[pos+4] << 8) | d[pos+5];
    }
    const dataStart = pos + frameHeadLen;
    const dataEnd = Math.min(dataStart + size, end);

    if (wantText[id] && size > 1) {
      const enc = d[dataStart];
      let raw = d.slice(dataStart + 1, dataEnd);
      if (raw[raw.length - 1] === 0) raw = raw.slice(0, -1);
      meta[wantText[id]] = decodeText(raw, enc);
    }
    if ((id === "APIC" || id === "PIC") && size > 16 && !meta.picture) {
      meta.picture = parseAPIC(d, dataStart, dataEnd, id === "PIC");
    }
    pos = dataEnd;
  }
  return Object.keys(meta).length ? meta : null;
}

function parseAPIC(d, start, end, isV22) {
  const enc = d[start];
  let pos = start + 1;
  let mime;
  if (isV22) {
    mime = "image/" + String.fromCharCode(d[pos], d[pos+1], d[pos+2]).toLowerCase();
    pos += 3;
  } else {
    const mimeEnd = d.indexOf(0, pos);
    mime = new TextDecoder("ascii").decode(d.slice(pos, mimeEnd));
    pos = mimeEnd + 1;
  }
  pos++; // picture type byte
  // skip description (null-terminated, encoding-dependent)
  if (enc === 1 || enc === 2) {
    while (pos + 1 < end && !(d[pos] === 0 && d[pos+1] === 0)) pos++;
    pos += 2;
  } else {
    while (pos < end && d[pos] !== 0) pos++;
    pos++;
  }
  if (pos >= end) return null;
  const blob = new Blob([d.slice(pos, end)], { type: mime || "image/jpeg" });
  return URL.createObjectURL(blob);
}

function parseMP4(buf) {
  const d = new Uint8Array(buf);
  const meta = {};

  function findAtom(start, end, name) {
    let pos = start;
    while (pos + 8 <= end) {
      const size = uint32(d, pos);
      const type = String.fromCharCode(d[pos+4], d[pos+5], d[pos+6], d[pos+7]);
      if (size < 8) return null;
      if (type === name) return { start: pos, end: pos + size, headerEnd: pos + 8 };
      pos += size;
    }
    return null;
  }

  const moov = findAtom(0, d.length, "moov");
  if (!moov) return null;
  const udta = findAtom(moov.headerEnd, moov.end, "udta");
  if (!udta) return null;
  const metaAtom = findAtom(udta.headerEnd, udta.end, "meta");
  if (!metaAtom) return null;
  // meta has 4-byte version+flags after header
  const ilst = findAtom(metaAtom.headerEnd + 4, metaAtom.end, "ilst");
  if (!ilst) return null;

  const nameMap = { "\xA9nam": "title", "\xA9ART": "artist", "\xA9alb": "album", "covr": "picture" };
  let pos = ilst.headerEnd;
  while (pos + 8 <= ilst.end) {
    const aSize = uint32(d, pos);
    const aType = String.fromCharCode(d[pos+4], d[pos+5], d[pos+6], d[pos+7]);
    if (aSize < 8) break;
    const key = nameMap[aType];
    if (key) {
      const dataAtom = findAtom(pos + 8, pos + aSize, "data");
      if (dataAtom) {
        const payload = d.slice(dataAtom.headerEnd + 8, dataAtom.end); // skip type+locale (8 bytes)
        if (key === "picture") {
          const blob = new Blob([payload], { type: "image/jpeg" });
          meta.picture = URL.createObjectURL(blob);
        } else {
          meta[key] = new TextDecoder("utf-8").decode(payload);
        }
      }
    }
    pos += aSize;
  }
  return Object.keys(meta).length ? meta : null;
}

function titleFromURL(url) {
  try {
    const path = decodeURIComponent(new URL(url, location.href).pathname);
    const file = path.split("/").pop() || "";
    return file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
  } catch { return ""; }
}

async function fetchMeta(audio) {
  const sources = audio.querySelectorAll("source");
  const srcList = sources.length
    ? Array.from(sources).map(s => ({ url: s.src, type: s.type }))
    : [{ url: audio.src, type: "" }];

  const mp3 = srcList.find(s => s.type === "audio/mpeg" || s.url.endsWith(".mp3"));
  const m4a = srcList.find(s => /audio\/(mp4|aac|x-m4a)/.test(s.type) || /\.(m4a|aac|mp4)$/i.test(s.url));

  // prefer MP3 (ID3 is most common), fall back to M4A
  for (const src of [mp3, m4a].filter(Boolean)) {
    try {
      const resp = await fetch(src.url, { headers: { Range: "bytes=0-65535" } });
      const buf = await resp.arrayBuffer();
      const d = new Uint8Array(buf);
      let meta = null;
      if (d[0] === 0x49 && d[1] === 0x44 && d[2] === 0x33) meta = parseID3v2(buf);
      else meta = parseMP4(buf);
      if (meta && (meta.title || meta.artist || meta.picture)) return meta;
    } catch { /* network error, try next */ }
  }

  // fallback: derive title from filename
  const fallbackUrl = (mp3 || m4a || srcList[0])?.url;
  const name = fallbackUrl ? titleFromURL(fallbackUrl) : "";
  return name ? { title: name } : null;
}

/* ----------------------------------------------------------------
   Player init
   ---------------------------------------------------------------- */

function initPlayer(audio) {
  audio.removeAttribute("controls");

  const player = document.createElement("div");
  player.className = "audio-player";

  // --- metadata (populated async) ---
  const metaRow = document.createElement("div");
  metaRow.className = "ap-meta";
  metaRow.hidden = true;

  const metaText = document.createElement("div");
  metaText.className = "ap-meta-text";
  const metaTitle = document.createElement("span");
  metaTitle.className = "ap-meta-title";
  const metaArtist = document.createElement("span");
  metaArtist.className = "ap-meta-artist";
  metaText.append(metaTitle, metaArtist);

  const metaArt = document.createElement("img");
  metaArt.className = "ap-meta-art";
  metaArt.hidden = true;

  metaRow.append(metaArt, metaText);

  // --- buttons ---
  const controls = document.createElement("div");
  controls.className = "ap-controls";

  const btnBack = makeBtn("ap-seek",
    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/><text x="12" y="16" text-anchor="middle" font-size="7" font-weight="700" font-family="Inter, sans-serif">15</text></svg>`);
  const btnPlay = makeBtn("ap-play",
    `<svg class="icon-play" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>
     <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></svg>`);
  const btnFwd = makeBtn("ap-seek",
    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/><text x="12" y="16" text-anchor="middle" font-size="7" font-weight="700" font-family="Inter, sans-serif">15</text></svg>`);

  controls.append(btnBack, btnPlay, btnFwd);

  // --- progress ---
  const progress = document.createElement("div");
  progress.className = "ap-progress";
  const track = document.createElement("div");
  track.className = "ap-track";
  const fill = document.createElement("div");
  fill.className = "ap-fill";
  track.appendChild(fill);
  progress.appendChild(track);

  // --- time ---
  const timeRow = document.createElement("div");
  timeRow.className = "ap-time";
  const timeCur = document.createElement("span");
  const timeDur = document.createElement("span");
  timeCur.textContent = "0:00";
  timeDur.textContent = "0:00";
  timeRow.append(timeCur, timeDur);

  player.append(metaRow, controls, progress, timeRow);
  audio.parentNode.insertBefore(player, audio);
  player.appendChild(audio);

  // --- wiring ---
  btnPlay.addEventListener("click", () => {
    if (audio.paused) audio.play(); else audio.pause();
  });
  btnBack.addEventListener("click", () => { audio.currentTime = Math.max(0, audio.currentTime - 15); });
  btnFwd.addEventListener("click", () => { audio.currentTime = Math.min(audio.duration, audio.currentTime + 15); });

  audio.addEventListener("play", () => player.classList.add("playing"));
  audio.addEventListener("pause", () => player.classList.remove("playing"));
  audio.addEventListener("loadedmetadata", () => { timeDur.textContent = formatTime(audio.duration); });
  audio.addEventListener("timeupdate", () => {
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    fill.style.width = pct + "%";
    timeCur.textContent = formatTime(audio.currentTime);
  });
  audio.addEventListener("ended", () => player.classList.remove("playing"));

  track.addEventListener("click", (e) => {
    const ratio = e.offsetX / track.offsetWidth;
    audio.currentTime = ratio * audio.duration;
  });

  // --- async metadata fetch ---
  fetchMeta(audio).then(meta => {
    if (!meta) return;
    if (meta.title) metaTitle.textContent = meta.title;
    if (meta.artist) metaArtist.textContent = meta.artist;
    if (meta.picture) { metaArt.src = meta.picture; metaArt.hidden = false; }
    if (meta.title || meta.artist) metaRow.hidden = false;
  });
}

function makeBtn(cls, svg) {
  const btn = document.createElement("button");
  btn.className = cls;
  btn.innerHTML = svg;
  return btn;
}
