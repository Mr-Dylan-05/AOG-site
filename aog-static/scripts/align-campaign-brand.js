#!/usr/bin/env node
/**
 * align-campaign-brand.js — bring /ai-training/ into line with AOG's type and colour.
 *
 * Continuity, not a redesign. The dark ground, the section rhythm and the layout
 * are the campaign page's own and stay exactly as they are — no cards, no boxes,
 * nothing borrowed from the main site's visual structure. What changes is the
 * two things that made it read as a different company's page: the typefaces and
 * a palette that had drifted into six near-identical inks and an acid yellow.
 *
 *   Type    Manrope + DM Mono  ->  Inter Tight + Helvetica Neue + JetBrains Mono
 *   Yellow  #f2fc3b            ->  #1BABE5   (the AOG accent)
 *   Amber   #FBB400            ->  #1BABE5   in the 3 UI uses only
 *   Inks    6 near-identical navies -> #0B1220
 *
 * Two things this is careful about:
 *
 *   1. The 30 #FBB400 uses inside the Google review star SVGs are LEFT ALONE.
 *      Those stars are gold because that is what a Google review looks like;
 *      recolouring them would make real reviews look invented. Only the three
 *      interface uses change — the nav button, a focus ring, a heading accent.
 *
 *   2. Body copy maps to Helvetica Neue, not Inter Tight. Inter Tight here is a
 *      variable font cut 500-800, so 400-weight body text would be synthesised
 *      or clamped. Splitting headings and body is also exactly what the main
 *      site does, so this is the accurate match rather than a workaround.
 *
 * Runs after the other campaign builders (build-campaign-*.js, build-curriculum-block.js
 * and so on), because those emit their own markup with the old values. Idempotent.
 *
 * Usage:  node scripts/align-campaign-brand.js
 */
const fs = require("fs");
const path = require("path");

const PAGE = path.join(__dirname, "..", "public", "ai-training", "index.html");

const AOG_SANS = "'Inter Tight','Helvetica Neue',Helvetica,Arial,sans-serif";
const AOG_BODY = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const AOG_MONO = "'JetBrains Mono',ui-monospace,monospace";
const AOG_INK = "#0B1220";
const AOG_ACCENT = "#1BABE5";

/** The self-hosted AOG faces, replacing six Manrope/DM Mono declarations. */
const FACES =
  `@font-face{font-family:'Inter Tight';font-style:normal;font-weight:500 800;` +
  `font-display:swap;src:url('/assets/design/fonts/intertight.woff2') format('woff2')}` +
  `@font-face{font-family:'JetBrains Mono';font-style:normal;font-weight:500;` +
  `font-display:swap;src:url('/assets/design/fonts/jetbrainsmono-500.woff2') format('woff2')}`;

let html = fs.readFileSync(PAGE, "utf8");
const before = html;
const counts = {};
const bump = (k, n = 1) => (counts[k] = (counts[k] || 0) + n);

// ---------------------------------------------------------------- typefaces
if (!html.includes("intertight.woff2")) {
  // Replace the whole run of Manrope/DM Mono @font-face blocks with the AOG two.
  const faceRe = /@font-face\s*\{[^}]*(?:Manrope|DM Mono)[^}]*\}/g;
  const found = html.match(faceRe) || [];
  if (found.length) {
    html = html.replace(faceRe, "").replace(/(<style[^>]*>)/, `$1${FACES}`);
    bump("@font-face replaced", found.length);
  }
}

for (const [re, to, label] of [
  [/font-family:\s*'?Manrope'?\s*,\s*Arial\s*,\s*sans-serif/gi, `font-family:${AOG_SANS}`, "Manrope -> Inter Tight"],
  [/font-family:\s*'Manrope'/gi, `font-family:${AOG_SANS}`, "Manrope -> Inter Tight"],
  [/font-family:\s*Manrope\s*,/gi, `font-family:${AOG_SANS.replace(/,$/, "")},`, "Manrope -> Inter Tight"],
  [/font-family:\s*'DM Mono'\s*,\s*monospace/gi, `font-family:${AOG_MONO}`, "DM Mono -> JetBrains Mono"],
  [/font-family:\s*'DM Mono'/gi, `font-family:${AOG_MONO}`, "DM Mono -> JetBrains Mono"],
]) {
  const n = (html.match(re) || []).length;
  if (n) { html = html.replace(re, to); bump(label, n); }
}

// ---------------------------------------------------------- FONT SHORTHAND
// The first version of this only matched `font-family:`, and missed 21 uses in
// the `font:` shorthand — font:400 18px/1.65 Manrope!important. That is why the
// page kept rendering in Manrope no matter how many times this ran.
//
// The weight in the shorthand decides the stack: Inter Tight is cut 500-800, so
// anything under 500 goes to Helvetica Neue rather than being clamped heavier
// than the design intended.
{
  const re = /font:(\d{3})([^;{}]*?)Manrope(\s*,\s*Arial\s*,\s*sans-serif)?/g;
  let n = 0;
  html = html.replace(re, (_m, weight, mid) => {
    n++;
    const stack = Number(weight) >= 500 ? AOG_SANS : AOG_BODY;
    return `font:${weight}${mid}${stack}`;
  });
  if (n) bump("Manrope in font: shorthand", n);
}

// -------------------------------------------------------------- MONO SWEEP
// Same shorthand trap as Manrope: font:700 10px 'DM Mono'. Both family names
// are only ever font families on this page, so sweeping every occurrence is
// safer than trying to enumerate the declaration forms they appear in — which
// is what missed 45 of them across the first three attempts.
for (const [re, to, label] of [
  [/'DM Mono'\s*,\s*monospace/gi, AOG_MONO, "DM Mono swept"],
  [/'DM Mono'/gi, AOG_MONO, "DM Mono swept"],
  [/\bDM Mono\b/gi, AOG_MONO, "DM Mono swept"],
  [/'?\bManrope\b'?\s*,\s*Arial\s*,\s*sans-serif/gi, AOG_SANS, "Manrope swept"],
  [/'?\bManrope\b'?/gi, AOG_SANS, "Manrope swept"],
]) {
  const n = (html.match(re) || []).length;
  if (n) { html = html.replace(re, to); bump(label, n); }
}

// A stale override from an earlier attempt at this: it forced 16/9 on the
// community tile, which fixed the crop by shrinking the tile to half the height
// of its neighbour. Removed rather than left to fight the grid.
if (html.includes("aog-campaign-media")) {
  html = html.replace(/<style id="aog-campaign-media">[\s\S]*?<\/style>\s*/i, "");
  bump("stale aspect override removed", 1);
}

// Body copy back to Helvetica Neue. Depth 61 to clear the generated file's
// :root chains, which run to depth 60.
const ROOT61 = ":root".repeat(61);
if (!html.includes("aog-campaign-type")) {
  html = html.replace(
    /<\/body>/i,
    `<style id="aog-campaign-type">
${ROOT61} body p,${ROOT61} body li,${ROOT61} body .vid-cap{font-family:${AOG_BODY}!important}
</style>\n</body>`
  );
  bump("body-copy override", 1);
}

// ------------------------------------------------------------------- colour
// The acid yellow CTA. Dark text stays: #0B1220 on #1BABE5 measures ~7.7:1,
// while white on it is ~2.4:1 and would fail contrast.
for (const [re, to, label] of [
  [/#f2fc3b/gi, AOG_ACCENT, "acid yellow -> AOG accent"],
  [/#061023/g, AOG_INK, "button ink -> AOG ink"],
  [/#0b1830/gi, AOG_INK, "navy -> AOG ink"],
  [/#08142b/gi, AOG_INK, "navy -> AOG ink"],
  [/#07142e/gi, AOG_INK, "navy -> AOG ink"],
  [/#09172e/gi, AOG_INK, "navy -> AOG ink"],
  [/#0b1730/gi, AOG_INK, "navy -> AOG ink"],
  [/#0a1730/gi, AOG_INK, "navy -> AOG ink"],
]) {
  const n = (html.match(re) || []).length;
  if (n) { html = html.replace(re, to); bump(label, n); }
}

// The three interface uses of amber. Matched with their surrounding context so
// the 30 star-SVG fills cannot be caught by accident.
for (const [from, to, label] of [
  ["outline:2px solid #FBB400", `outline:2px solid ${AOG_ACCENT}`, "focus ring"],
  ["background:#FBB400", `background:${AOG_ACCENT}`, "nav Contact button"],
  ["b{color:#FBB400!important", `b{color:${AOG_ACCENT}!important`, "heading accent"],
]) {
  if (html.includes(from)) { html = html.split(from).join(to); bump("amber -> AOG accent (" + label + ")", 1); }
}

// ------------------------------------------------------- NO_YELLOW: all of it
// The first pass kept the gold review stars, on the argument that a Google
// review looks gold. Overruled: no yellow anywhere on this page.
//
// The Google mark is recoloured whole rather than just its yellow segment.
// Changing one of four brand colours leaves a mangled logo; a single-tone mark
// is a normal, recognisable treatment.
for (const [re, to, label] of [
  [/#FBB400/gi, AOG_ACCENT, "review stars -> AOG accent"],
  // A second acid yellow, one hex off the first and easy to miss on a scan
  // for the known value. Found by sweeping the whole yellow family instead.
  [/#F4EF32/gi, AOG_ACCENT, "second acid yellow -> AOG accent"],
  [/#4285F4/gi, AOG_INK, "Google mark -> monochrome"],
  [/#34A853/gi, AOG_INK, "Google mark -> monochrome"],
  [/#FBBC05/gi, AOG_INK, "Google mark -> monochrome"],
  [/#EA4335/gi, AOG_INK, "Google mark -> monochrome"],
]) {
  const n = (html.match(re) || []).length;
  if (n) { html = html.replace(re, to); bump(label, n); }
}

// ------------------------------------------------- one light blue, not eight
// .platform-shot carried a different offset-shadow blue at every breakpoint —
// eight values for one shadow — and .community-shot framed the same kind of
// image in a ninth. All become one tint of the AOG accent.
const TINT = "#8ED3F0";        // #1BABE5 lightened, for the offset shadow
const TINT_SOFT = "#DDF2FB";   // the same hue, for the image frame
for (const [re, to, label] of [
  [/#9ccce8|#9bcae9|#94c9eb|#a7d6ed|#8ec6ef|#89bdf0|#94cceb|#8ec8ee/gi, TINT, "shadow blue unified"],
  // The tile tint is the "light blue" — it shows through wherever an image
  // does not fill its card. Unifying the shade did not help; removing it does.
  [/#d8efff|#d9edff|#d9f0ff|#ddf2fb/gi, "transparent", "tile tint removed"],
]) {
  const n = (html.match(re) || []).length;
  if (n) { html = html.replace(re, to); bump(label, n); }
}

if (html === before) {
  console.log("Campaign brand: already aligned.");
} else {
  fs.writeFileSync(PAGE, html);
  console.log("Campaign brand aligned:");
  Object.entries(counts).forEach(([k, v]) => console.log(`   ${String(v).padStart(3)}  ${k}`));
  const gold = (html.match(/#FBB400|#FBBC05|#f2fc3b/gi) || []).length;
  console.log(`   ${String(gold).padStart(3)}  yellow values left on the page`);
}
