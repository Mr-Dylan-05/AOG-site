#!/usr/bin/env node
/**
 * simplify-video-control.js — one button on the hero video: "Tap to play".
 *
 * WHAT IT REPLACED
 * The control was a three-state sound toggle: a muted-speaker icon, a
 * speaker icon, a play triangle, and a label that read "Play", "Sound" or
 * "Sound on" depending on which of them applied. Three icons and three labels
 * to express "watch this", on a page whose job is to get someone to watch it.
 *
 * WHAT IT DOES NOW
 * Paused, ended or never started, it reads "Tap to play". A tap starts it with
 * the sound on. Once it is running the button gets out of the way, and tapping
 * the frame pauses and brings it back.
 *
 * THE ONE EXTRA STATE, AND WHY IT HAS TO EXIST
 * A browser can refuse unmuted playback even on a real tap. The old code
 * already handled that by retrying muted, which is right: silent video beats
 * no video. But with the sound toggle gone that would leave someone watching
 * it muted with nothing to press, so in that case alone the button comes back
 * reading "Tap for sound". It is not reachable on a browser that honours the
 * first tap, which is all of them on a real gesture.
 *
 * Idempotent. Usage:  node scripts/simplify-video-control.js [--dry]
 */
const fs = require("fs");
const path = require("path");

const PAGE = path.join(__dirname, "..", "public", "ai-training", "index.html");
const DRY = process.argv.includes("--dry");
let html = fs.readFileSync(PAGE, "utf8");
const before = html;
const counts = {};
const bump = (k, n = 1) => (counts[k] = (counts[k] || 0) + n);

/* ---------------------------------------------------------------- markup ---
   The two speaker icons go. The play triangle stays and stops being hidden,
   because the button's resting state is now "not playing". */
{
  const re = /<svg class="vid-(?:off|on)"[\s\S]*?<\/svg>/g;
  const n = (html.match(re) || []).length;
  if (n) { html = html.replace(re, ""); bump("sound icons removed", n); }
}
{
  const re = /(<svg class="vid-play"[^>]*?)\s+hidden(\s*>)/;
  if (re.test(html)) { html = html.replace(re, "$1$2"); bump("play icon shown by default"); }
}
{
  const re = /(<span class="vid-sound-text">)[^<]*(<\/span>)/;
  if (re.test(html)) {
    const m = html.match(re);
    if (m && m[0].indexOf("Tap to play") === -1) {
      html = html.replace(re, "$1Tap to play$2");
      bump("label -> Tap to play");
    }
  }
}
{
  const re = /(<button type="button" class="vid-sound" aria-pressed="false" aria-label=")[^"]*(")/;
  if (re.test(html) && !/aria-label="Play video with sound"/.test(html)) {
    html = html.replace(re, "$1Play video with sound$2");
    bump("button label");
  }
}

/* ------------------------------------------------------------------ code ---
   The whole IIFE is replaced rather than patched. Its old shape was built
   around keeping three icons in step with two independent states (playing,
   muted); there is one state now, and editing around that would leave the
   dead branches behind. */
const START = '(function () {\n  "use strict";\n  var wrap = document.querySelector("#how .how-studio .vid");';
const at = html.indexOf(START);
if (at === -1) {
  console.error("  ⚠ video script not found; nothing changed");
} else {
  const end = html.indexOf("})();", at);
  if (end === -1) { console.error("  ⚠ unterminated video script"); }
  else {
    const NEW = `(function () {
  "use strict";
  var wrap = document.querySelector("#how .how-studio .vid");
  if (!wrap) return;
  var v = wrap.querySelector(".vid-el"),
      btn = wrap.querySelector(".vid-sound"),
      label = wrap.querySelector(".vid-sound-text");
  var everPlayed = false;

  /* One question decides everything on screen: is it playing with sound?
     If it is, the button is out of the way. If it is not, the button says
     what a tap will do. The element's own state is read rather than tracked,
     so a rejected play() cannot leave the label contradicting the video. */
  function render() {
    var playing = !v.paused && !v.ended;
    var silent = playing && v.muted;          // only after a refused unmute
    btn.hidden = playing && !silent;
    if (label) label.textContent = silent ? "Tap for sound" : "Tap to play";
    btn.setAttribute("aria-label", silent ? "Turn the sound on" : "Play video with sound");
    wrap.classList.toggle("is-blocked", !playing);
  }

  /* Everything the element needs is set BEFORE play() is called. Seeking or
     unmuting after it aborts the attempt on a phone, where almost nothing is
     buffered yet: preload="none" means the fetch has only just begun when the
     tap lands. */
  function start() {
    if (v.readyState === 0) v.load();
    v.muted = false;
    if (v.readyState >= 1 && v.currentTime > 1.5) {
      try { v.currentTime = 0; } catch (e) { /* not seekable yet; play on */ }
    }
    var p = v.play();
    if (!p || !p.then) return;
    p.catch(function () {
      /* Sound refused is not playback refused. Silent video beats no video,
         so drop back to muted and let render() offer the sound instead. */
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

  /* Tapping the frame starts it too, and pauses it once it is running. */
  v.addEventListener("click", function () {
    if (v.paused || v.muted) start();
    else v.pause();
  });

  /* No autoplay: it waits on the poster, and nothing is fetched until asked.
     The observer has one job, pausing a video that scrolls out of view so the
     sound does not follow someone down the page. It never starts anything. */
  render();
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting && everPlayed && !v.paused) v.pause();
      });
    }, { threshold: 0.25 });
    io.observe(v);
  }
})();`;
    html = html.slice(0, at) + NEW + html.slice(end + 5);
    bump("player script replaced");
  }
}

if (html === before) {
  console.log("Video control: already simplified.");
} else if (!DRY) {
  fs.writeFileSync(PAGE, html);
  console.log("Video control simplified:");
  Object.entries(counts).forEach(([k, v]) => console.log(`   ${String(v).padStart(3)}  ${k}`));
}
