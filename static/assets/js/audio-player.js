let _ctx;
function getCtx() { return _ctx || (_ctx = new AudioContext()); }

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("audio[controls]").forEach(initPlayer);
  document.querySelectorAll(".tts-button").forEach(initTTSPlayer);
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
      const INITIAL = 65536;
      const MAX_TAG = 2 * 1024 * 1024; // don't fetch more than 2 MB for metadata
      let resp = await fetch(src.url, { headers: { Range: `bytes=0-${INITIAL - 1}` } });
      let buf = await resp.arrayBuffer();
      const d = new Uint8Array(buf);
      let meta = null;

      if (d[0] === 0x49 && d[1] === 0x44 && d[2] === 0x33) {
        const tagSize = synchsafeInt(d, 6) + 10;
        if (tagSize > INITIAL && tagSize <= MAX_TAG) {
          const full = await fetch(src.url, { headers: { Range: `bytes=0-${tagSize - 1}` } });
          buf = await full.arrayBuffer();
        }
        meta = parseID3v2(buf);
      } else {
        meta = parseMP4(buf);
      }

      if (meta && (meta.title || meta.artist || meta.picture)) return meta;
    } catch { /* network error, try next */ }
  }

  // fallback: derive title from filename
  const fallbackUrl = (mp3 || m4a || srcList[0])?.url;
  const name = fallbackUrl ? titleFromURL(fallbackUrl) : "";
  return name ? { title: name } : null;
}

/* ----------------------------------------------------------------
   Shared 5-band meter (iOS Podcasts style).
   Per-band auto-center in the dB domain: each bar tracks its own slow
   average and displays deviation from it, so quiet speech and hot masters
   both sit mid-scale. A fresh AnalyserNode reports -Infinity until audio
   flows, which would poison the envelopes with NaN — guarded below.
   ---------------------------------------------------------------- */

function createMeter(audio, bars) {
  let analyser, freqData, floatData, rafId, bandBins;
  // Bands in Hz so the low bar actually covers the kick (~45-120 Hz).
  const BANDS_HZ = [[45, 120], [120, 280], [280, 900], [900, 2800], [2800, 11000]];
  const MIN_H = 0.15;
  const ATTACK = 0.7;   // fast rise so kicks pop
  const RELEASE = 0.18; // glide back down like iOS
  const DB_DEV_RANGE = 12; // ±6 dB maps to full swing
  const USE_FLOAT = typeof Float32Array !== "undefined";
  const shown = Array.from({ length: bars.length }, () => 0);
  const mean = Array.from({ length: bars.length }, () => null);

  function resetBars() {
    for (let i = 0; i < bars.length; i++) {
      shown[i] = 0;
      bars[i].style.transform = `scaleY(${MIN_H})`;
    }
  }
  function resetRange() {
    for (let i = 0; i < mean.length; i++) mean[i] = null;
  }
  function initAnalyser() {
    if (analyser) return;
    try {
      const ctx = getCtx();
      if (ctx.state === "suspended") ctx.resume();
      const src = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      // Fast enough to follow kicks; our own envelope does the gliding.
      analyser.smoothingTimeConstant = 0.35;
      analyser.minDecibels = -85;
      analyser.maxDecibels = -25;
      freqData = new Uint8Array(analyser.frequencyBinCount);
      if (USE_FLOAT && analyser.getFloatFrequencyData) {
        floatData = new Float32Array(analyser.frequencyBinCount);
      }
      // Hz bands -> bins for this context's sample rate, non-overlapping.
      const binHz = ctx.sampleRate / analyser.fftSize;
      bandBins = BANDS_HZ.slice(0, bars.length).map(([loHz, hiHz]) => {
        const lo = Math.max(1, Math.floor(loHz / binHz));
        const hi = Math.min(analyser.frequencyBinCount - 1, Math.max(lo, Math.floor(hiHz / binHz)));
        return [lo, hi];
      });
      src.connect(analyser);
      analyser.connect(ctx.destination);
    } catch { /* cross-origin or unsupported – bars stay flat */ }
  }
  function bandAvgDb(lo, hi) {
    let sum = 0;
    for (let b = lo; b <= hi; b++) sum += floatData[b];
    return sum / (hi - lo + 1);
  }
  function bandAvgByte(lo, hi) {
    const end = Math.min(hi, freqData.length - 1);
    let sum = 0;
    for (let b = lo; b <= end; b++) sum += freqData[b];
    return sum / ((end - lo + 1) * 255);
  }
  function tickLevels() {
    if (!analyser) return;
    if (floatData) {
      analyser.getFloatFrequencyData(floatData);
      for (let i = 0; i < bandBins.length; i++) {
        const inst = bandAvgDb(bandBins[i][0], bandBins[i][1]);
        if (!isFinite(inst) || inst <= -80) {
          shown[i] += (0 - shown[i]) * RELEASE;
          bars[i].style.transform = `scaleY(${(MIN_H + (1 - MIN_H) * shown[i]).toFixed(3)})`;
          continue;
        }
        mean[i] = mean[i] === null ? inst : mean[i] + (inst - mean[i]) * 0.01;
        const norm = Math.min(1, Math.max(0, 0.5 + (inst - mean[i]) / DB_DEV_RANGE));
        const rate = norm > shown[i] ? ATTACK : RELEASE;
        shown[i] += (norm - shown[i]) * rate;
        bars[i].style.transform = `scaleY(${(MIN_H + (1 - MIN_H) * shown[i]).toFixed(3)})`;
      }
    } else {
      // Fallback for browsers without float frequency data.
      analyser.getByteFrequencyData(freqData);
      for (let i = 0; i < bandBins.length; i++) {
        const inst = bandAvgByte(bandBins[i][0], bandBins[i][1]);
        const rate = inst > shown[i] ? ATTACK : RELEASE;
        shown[i] += (inst - shown[i]) * rate;
        bars[i].style.transform = `scaleY(${(MIN_H + (1 - MIN_H) * shown[i]).toFixed(3)})`;
      }
    }
    rafId = requestAnimationFrame(tickLevels);
  }

  return {
    start() { initAnalyser(); tickLevels(); },
    stop(withRange) {
      cancelAnimationFrame(rafId);
      resetBars();
      if (withRange) resetRange();
    },
  };
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

  // --- level bars (5-band meter, iOS Podcasts style) ---
  const levels = document.createElement("div");
  levels.className = "ap-levels";
  const bars = Array.from({ length: 5 }, () => levels.appendChild(document.createElement("span")));

  player.append(metaRow, controls, progress, timeRow, levels);
  audio.parentNode.insertBefore(player, audio);
  player.appendChild(audio);

  // --- wiring ---
  btnPlay.addEventListener("click", () => {
    if (audio.paused) audio.play(); else audio.pause();
  });
  btnBack.addEventListener("click", () => { audio.currentTime = Math.max(0, audio.currentTime - 15); });
  btnFwd.addEventListener("click", () => { audio.currentTime = Math.min(audio.duration, audio.currentTime + 15); });

  // --- analyser-driven level bars (shared meter engine) ---
  const meter = createMeter(audio, bars);

  audio.addEventListener("play", () => {
    player.classList.add("playing");
    meter.start();
  });
  audio.addEventListener("pause", () => { player.classList.remove("playing"); meter.stop(false); });
  audio.addEventListener("loadedmetadata", () => { timeDur.textContent = formatTime(audio.duration); });
  audio.addEventListener("timeupdate", () => {
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    fill.style.width = pct + "%";
    timeCur.textContent = formatTime(audio.currentTime);
  });
  audio.addEventListener("ended", () => { player.classList.remove("playing"); meter.stop(true); });

  track.addEventListener("click", (e) => {
    const ratio = e.offsetX / track.offsetWidth;
    audio.currentTime = ratio * audio.duration;
  });

  // --- async metadata fetch ---
  fetchMeta(audio).then(meta => {
    if (!meta) return;
    if (meta.title) metaTitle.textContent = meta.title;
    if (meta.artist) metaArtist.textContent = meta.artist;
    if (meta.picture) {
      metaArt.src = meta.picture;
      metaArt.hidden = false;
      metaRow.classList.add("ap-meta--with-art");
    }
    if (meta.title || meta.artist) metaRow.hidden = false;
  });
}

function makeBtn(cls, svg) {
  const btn = document.createElement("button");
  btn.className = cls;
  btn.innerHTML = svg;
  return btn;
}

/* ----------------------------------------------------------------
   Inline TTS player (compact, beside post title)
   ---------------------------------------------------------------- */

function initTTSPlayer(button) {
  const audio = document.createElement("audio");
  audio.preload = "metadata";
  const source = document.createElement("source");
  source.src = button.dataset.src;
  source.type = "audio/ogg; codecs=opus";
  audio.appendChild(source);
  audio.style.display = "none";
  button.appendChild(audio);

  button.style.display = "inline-flex";

  const durationEl = button.querySelector(".tts-duration");
  const bars = Array.from(button.querySelectorAll(".tts-levels span"));

  audio.addEventListener("loadedmetadata", () => {
    if (isFinite(audio.duration)) {
      durationEl.textContent = formatTime(audio.duration);
    }
  });

  // Also try durationchange for Opus files that report duration late
  audio.addEventListener("durationchange", () => {
    if (isFinite(audio.duration) && audio.duration > 0) {
      durationEl.textContent = formatTime(audio.duration);
    }
  });

  const meter = createMeter(audio, bars);

  button.addEventListener("click", (e) => {
    e.preventDefault();
    if (audio.paused) audio.play(); else audio.pause();
  });

  audio.addEventListener("play", () => {
    button.classList.add("tts-playing");
    meter.start();
  });

  audio.addEventListener("pause", () => {
    button.classList.remove("tts-playing");
    meter.stop(false);
  });

  audio.addEventListener("timeupdate", () => {
    if (isFinite(audio.duration)) {
      const remaining = audio.duration - audio.currentTime;
      durationEl.textContent = formatTime(remaining);
    }
  });

  audio.addEventListener("ended", () => {
    button.classList.remove("tts-playing");
    meter.stop(true);
    audio.currentTime = 0;
    if (isFinite(audio.duration)) {
      durationEl.textContent = formatTime(audio.duration);
    }
  });
}
