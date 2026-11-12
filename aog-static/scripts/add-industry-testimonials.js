#!/usr/bin/env node
/**
 * add-industry-testimonials.js — the two industry testimonial videos on
 * /ai-training/, between the Google reviews and their "Get more info" button.
 *
 * HOSTING
 * Same as the hero video: the adon-videos R2 bucket, public r2.dev URL. The
 * files are 720x1280 H.264 at ~1.1Mbps with 96kbps AAC, faststart, encoded by
 * scripts/encode.swift from the 1080x1920 originals (68MB -> 14.7MB and
 * 79MB -> 16.9MB). R2 answers range requests, so they stream.
 *
 * PERFORMANCE
 * - preload="none": no video bytes until someone taps play.
 * - Posters (540x960, ~90KB each) are NOT in a poster attribute, because a
 *   poster is fetched as soon as the element is parsed, wherever it sits on
 *   the page. They sit in data-poster and are applied by an
 *   IntersectionObserver once the section is within 600px of the viewport.
 *   Without IntersectionObserver they are applied straight away.
 * - aspect-ratio reserves the 9:16 box, so nothing shifts when a poster lands.
 *
 * PLAYBACK
 * The same rules as the hero video (see simplify-video-control.js): nothing
 * autoplays, a tap plays with sound, a refused unmute falls back to muted with
 * "Tap for sound", tapping the frame pauses, scrolling away pauses. Starting
 * any video on the page pauses every other one, the hero included.
 *
 * Idempotent: the block between the markers is replaced on each run.
 * Usage:  node scripts/add-industry-testimonials.js [--dry]
 */
const fs = require("fs");
const path = require("path");

const PAGE = path.join(__dirname, "..", "public", "ai-training", "index.html");
const DRY = process.argv.includes("--dry");
const R2 = "https://pub-f0773479a3e54dc68633fadac765b41e.r2.dev";

const VIDEOS = [
  { slug: "realestate", caption: "Real estate", label: "Real estate testimonial" },
  { slug: "tradie", caption: "Trades", label: "Trades testimonial" },
];

const START = "<!-- industry-testimonials -->";
const END = "<!-- /industry-testimonials -->";
const ANCHOR = '<div class="rev-cta">';

const card = (v) => `<figure class="iv-card"><div class="iv-vid is-blocked"><video class="iv-el" preload="none" muted playsinline width="720" height="1280" data-poster="${R2}/testimonial-${v.slug}-poster.jpg" aria-label="${v.label}"><source src="${R2}/testimonial-${v.slug}.mp4" type="video/mp4"></video><button type="button" class="iv-play" aria-label="Play video with sound"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"></path></svg><span class="iv-play-text">Tap to play</span></button></div><figcaption>${v.caption}</figcaption></figure>`;

const BLOCK = `${START}<section class="industry-videos" id="industry" aria-label="Industry testimonials">
  <h2>Industry <b>testimonials</b></h2>
  <div class="iv-grid">${VIDEOS.map(card).join("")}</div>
<style id="industry-testimonials-style">
#industry{background:#fff;padding:8px 24px 56px;text-align:center}
#industry h2{font-size:clamp(28px,3.6vw,46px)!important;line-height:1.1!important;letter-spacing:-.045em!important;margin:0 0 36px!important;color:#0B1220!important;text-align:center!important}
#industry h2 b{color:#2867e8}
#industry .iv-grid{display:grid;grid-template-columns:repeat(2,minmax(0,340px));gap:28px;justify-content:center}
#industry .iv-card{margin:0}
#industry .iv-vid{position:relative;aspect-ratio:9/16;border-radius:16px;overflow:hidden;background:#0B1220;box-shadow:0 18px 40px -24px rgba(11,24,48,.5)}
#industry .iv-el{display:block;width:100%;height:100%;object-fit:cover;background:#0B1220;cursor:pointer}
#industry .iv-play{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);display:inline-flex;align-items:center;gap:7px;font:inherit;font-size:13px;font-weight:700;letter-spacing:.02em;color:#fff;background:rgba(8,17,34,.92);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.22);padding:11px 18px;border-radius:999px;cursor:pointer;line-height:1;white-space:nowrap}
#industry .iv-play[hidden]{display:none}
#industry .iv-play:focus-visible{outline:2px solid #7fb2ff;outline-offset:2px}
#industry figcaption{margin-top:14px;font:700 11px 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;color:#2867e8}
@media(max-width:640px){
  #industry{padding:0 24px 48px}
  #industry .iv-grid{grid-template-columns:minmax(0,320px);gap:32px}
}
</style>
<script id="industry-testimonials-js">
(function () {
  "use strict";
  var section = document.getElementById("industry");
  if (!section) return;
  var wraps = [].slice.call(section.querySelectorAll(".iv-vid"));

  /* Posters wait until the section is close. */
  function posters() {
    wraps.forEach(function (w) {
      var v = w.querySelector("video");
      if (v.dataset.poster && !v.poster) v.poster = v.dataset.poster;
    });
  }
  if ("IntersectionObserver" in window) {
    var near = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { posters(); near.disconnect(); }
    }, { rootMargin: "600px 0px" });
    near.observe(section);
  } else {
    posters();
  }

  wraps.forEach(function (wrap) {
    var v = wrap.querySelector("video"),
        btn = wrap.querySelector(".iv-play"),
        label = wrap.querySelector(".iv-play-text");
    var everPlayed = false;

    function render() {
      var playing = !v.paused && !v.ended;
      var silent = playing && v.muted;
      btn.hidden = playing && !silent;
      label.textContent = silent ? "Tap for sound" : "Tap to play";
      btn.setAttribute("aria-label", silent ? "Turn the sound on" : "Play video with sound");
      wrap.classList.toggle("is-blocked", !playing);
    }

    function start() {
      if (v.readyState === 0) v.load();
      v.muted = false;
      if (v.ended) { try { v.currentTime = 0; } catch (e) {} }
      var p = v.play();
      if (!p || !p.then) return;
      p.catch(function () {
        v.muted = true;
        var again = v.play();
        if (again && again.catch) again.catch(render);
      });
    }

    v.addEventListener("playing", function () { everPlayed = true; render(); });
    v.addEventListener("volumechange", render);
    v.addEventListener("pause", render);
    v.addEventListener("ended", render);

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      start();
    });
    v.addEventListener("click", function () {
      if (v.paused || v.muted) start();
      else v.pause();
    });

    render();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting && everPlayed && !v.paused) v.pause();
        });
      }, { threshold: 0.25 }).observe(v);
    }
  });

  /* One video at a time, across the whole page. */
  document.addEventListener("play", function (e) {
    var all = document.querySelectorAll("video");
    for (var i = 0; i < all.length; i++) {
      if (all[i] !== e.target && !all[i].paused) all[i].pause();
    }
  }, true);
})();
</script>
</section>${END}`;

let html = fs.readFileSync(PAGE, "utf8");
const before = html;

const s = html.indexOf(START);
if (s !== -1) {
  const e = html.indexOf(END, s);
  if (e === -1) throw new Error("start marker without end marker");
  html = html.slice(0, s) + BLOCK + html.slice(e + END.length);
} else {
  const a = html.indexOf(ANCHOR);
  if (a === -1 || html.indexOf(ANCHOR, a + 1) !== -1) throw new Error("rev-cta anchor not found exactly once");
  html = html.slice(0, a) + BLOCK + html.slice(a);
}

if (html === before) { console.log("no change"); process.exit(0); }
if (DRY) { console.log("would write", html.length - before.length, "bytes"); process.exit(0); }
fs.writeFileSync(PAGE, html);
console.log("wrote", PAGE);
