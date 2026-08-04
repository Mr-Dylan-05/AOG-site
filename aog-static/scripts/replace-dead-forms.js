#!/usr/bin/env node
/**
 * replace-dead-forms.js — swap the dead Ninja Forms embeds for a link to /contact-us/.
 *
 * Seven reference pages carry a Ninja Forms widget: a <noscript> notice, the
 * plugin's inline <style>, an empty #nf-form-N-cont container and several
 * <script> template blocks. WordPress used to hydrate that container; nothing
 * does now, so with JavaScript on a visitor just sees a blank gap where the
 * form should be, and the page's call to action silently does nothing.
 *
 * Each widget is replaced with a plain link through to the working contact
 * form. The surrounding headings ("Invite Your Friends", "Request a Demo") are
 * left untouched, so each page still reads as its own thing.
 *
 * Method: locate the enclosing `<div class="fl-html">` and walk forward
 * counting <div>/</div> to its matching close, then splice. (Verified that the
 * embedded scripts contain no "<div" substrings, so the count can't be thrown
 * off. A full DOM re-serialise is deliberately avoided — it mangles this
 * Beaver Builder markup.)
 *
 * Idempotent: pages already converted are skipped.
 *
 * Usage:  node scripts/replace-dead-forms.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DRY = process.argv.includes("--dry");

const PAGES = [
  "refer-a-friend",
  "domains",
  "websites",
  "facebook-packages",
  "brochure-campaign",
  "google-ads-management",
  "easy-rate-app/try-now",
];

const MARKER = "ninja-forms-noscript-message";

// Wrapper the embed sits in. Most pages use Beaver Builder's HTML module;
// /domains/ puts its form inside a UABB modal instead, so that wrapper is
// matched too. The nearest preceding one wins.
const OPENERS = ['<div class="fl-html">', '<div class="uabb-modal-text'];

const CTA = `<div class="fl-html">
	<p class="aog-form-cta"><a href="/contact-us/">Contact us &rarr;</a></p>
</div>`;

/** End index (exclusive) of the <div> opening at `start`. */
function matchingDivEnd(html, start) {
  const re = /<div\b|<\/div>/gi;
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(html)) !== null) {
    depth += m[0].toLowerCase() === "</div>" ? -1 : 1;
    if (depth === 0) return m.index + m[0].length;
  }
  return -1;
}

let converted = 0, blocks = 0, skipped = 0;

for (const slug of PAGES) {
  const file = path.join(ROOT, "src", "pages", slug, "index.njk");
  if (!fs.existsSync(file)) { console.warn(`  ! missing: ${slug}`); continue; }

  let html = fs.readFileSync(file, "utf8");
  if (!html.includes(MARKER)) { skipped++; console.log(`  – already done: ${slug}`); continue; }

  let n = 0;
  while (true) {
    const marker = html.indexOf(MARKER);
    if (marker === -1) break;

    const open = Math.max(...OPENERS.map((o) => html.lastIndexOf(o, marker)));
    if (open === -1) { console.warn(`  ! no wrapper for ${slug}`); break; }

    const end = matchingDivEnd(html, open);
    if (end === -1) { console.warn(`  ! unbalanced divs in ${slug}`); break; }

    html = html.slice(0, open) + CTA + html.slice(end);
    n++; blocks++;
  }

  if (n) {
    if (!DRY) fs.writeFileSync(file, html);
    converted++;
    console.log(`  ${slug}: ${n} form block${n > 1 ? "s" : ""} -> /contact-us/`);
  }
}

console.log(`\n${DRY ? "[dry run] " : ""}dead forms replaced`);
console.log(`  pages converted : ${converted}`);
console.log(`  blocks replaced : ${blocks}`);
console.log(`  already done    : ${skipped}`);
