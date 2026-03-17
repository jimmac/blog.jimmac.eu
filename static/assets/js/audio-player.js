document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("audio[controls]").forEach(initPlayer);
});

function formatTime(s) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ":" + String(sec).padStart(2, "0");
}

function initPlayer(audio) {
  audio.removeAttribute("controls");

  const player = document.createElement("div");
  player.className = "audio-player";

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

  player.append(controls, progress, timeRow);
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

  // click-to-seek on the track
  track.addEventListener("click", (e) => {
    const ratio = e.offsetX / track.offsetWidth;
    audio.currentTime = ratio * audio.duration;
  });
}

function makeBtn(cls, svg) {
  const btn = document.createElement("button");
  btn.className = cls;
  btn.innerHTML = svg;
  return btn;
}
