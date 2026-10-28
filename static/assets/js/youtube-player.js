/* ----------------------------------------------------------------
   YouTube facade player – click to load.
   The youtube component (templates/components.html) renders a poster
   with a play affordance and no third-party markup; the iframe is
   only created once the visitor actually hits play. Without JS the
   facade remains a plain link to the video.
   ---------------------------------------------------------------- */

document.addEventListener("click", (e) => {
  const facade = e.target.closest(".yt__facade");
  if (!facade) return;

  const player = facade.closest(".yt");
  const id = player && player.dataset.ytId;
  if (!id) return;

  e.preventDefault();

  const iframe = document.createElement("iframe");
  iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
  iframe.title = player.dataset.ytTitle || "YouTube video player";
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.allowFullscreen = true;

  facade.replaceWith(iframe);
  player.classList.add("yt--playing");
});

/* ----------------------------------------------------------------
   Poster fallback chain.
   When a video has no maxresdefault.jpg, YouTube answers with a
   404 — or, to browsers, with a 120x90 gray placeholder served as
   HTTP 200, which does not trigger onerror. So after every load,
   check the natural size and step down:
   maxresdefault -> sddefault -> hqdefault.
   ---------------------------------------------------------------- */

const POSTER_FALLBACKS = ["sddefault", "hqdefault"];
const POSTER_PLACEHOLDER_WIDTH = 120;

function initPoster(img) {
  const player = img.closest(".yt");
  if (!player || !player.dataset.ytId) return;

  let step = 0;
  const check = () => {
    if (!img.complete) return;                                 // still loading
    if (img.naturalWidth > POSTER_PLACEHOLDER_WIDTH) return;   // real thumbnail
    if (step >= POSTER_FALLBACKS.length) return;               // chain exhausted
    img.src = "https://i.ytimg.com/vi/" + player.dataset.ytId + "/" + POSTER_FALLBACKS[step++] + ".jpg";
  };

  img.addEventListener("load", check);
  img.addEventListener("error", check);
  check(); // the poster may already be a loaded placeholder
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".yt__poster").forEach(initPoster);
});
