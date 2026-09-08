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

if (html === before) {
  console.log("Campaign brand: already aligned.");
} else {
  fs.writeFileSync(PAGE, html);
  console.log("Campaign brand aligned:");
  Object.entries(counts).forEach(([k, v]) => console.log(`   ${String(v).padStart(3)}  ${k}`));
  const stars = (html.match(/fill="#FBB400"/g) || []).length;
  console.log(`   ${String(stars).padStart(3)}  review star fills left gold, as intended`);
}
