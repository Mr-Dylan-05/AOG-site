#!/usr/bin/env node
/**
 * selfhost-fonts.js — stop 34 pages fetching fonts from Google.
 *
 * The site is split: pages imported from the Ad On AI build self-host their
 * fonts, while 34 pages still request them from fonts.googleapis.com. The
 * request is for exactly the two faces already sitting in the repo —
 * Inter Tight 500-800 and JetBrains Mono 500 — so the round trip buys nothing:
 *
 *   https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800
 *                                     &family=JetBrains+Mono:wght@500&display=swap
 *
 * Serving them locally removes a render-blocking request to a third-party
 * origin (two, counting fonts.gstatic.com), removes a DNS + TLS handshake from
 * the critical path, and stops sending every visitor's IP address to Google —
 * which also matters for Australian privacy expectations.
 *
 * The @font-face block below is copied verbatim from the pages that already
 * self-host, so both halves of the site render identically.
 *
 * Idempotent: pages already converted are skipped.
 *
 * Usage:  node scripts/selfhost-fonts.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DRY = process.argv.includes("--dry");

const UNICODE_RANGE =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304," +
  "U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";

const LOCAL_FONTS = `<link rel="preload" as="font" type="font/woff2" href="/assets/design/fonts/intertight.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/assets/design/fonts/jetbrainsmono-500.woff2" crossorigin>
<style>@font-face{font-family:'Inter Tight';font-style:normal;font-weight:500 800;font-display:swap;src:url('/assets/design/fonts/intertight.woff2') format('woff2');unicode-range:${UNICODE_RANGE};}
@font-face{font-family:'JetBrains Mono';font-style:normal;font-weight:500;font-display:swap;src:url('/assets/design/fonts/jetbrainsmono-500.woff2') format('woff2');unicode-range:${UNICODE_RANGE};}</style>`;

// Every Google-font-related tag: the stylesheet itself, plus the preconnect and
// dns-prefetch hints that only exist to speed it up.
const GOOGLE_TAGS =
  /[ \t]*<link\b[^>]*(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>\s*/gi;

function sources(dir, exts, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) sources(p, exts, out);
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

const files = [
  ...sources(path.join(ROOT, "src", "pages"), [".njk", ".html", ".md"]),
  ...sources(path.join(ROOT, "src", "_includes"), [".njk"]),
  ...sources(path.join(ROOT, "public"), [".html"]),
];

let changed = 0, tagsRemoved = 0, skipped = 0;

for (const file of files) {
  const before = fs.readFileSync(file, "utf8");
  if (!/fonts\.(googleapis|gstatic)\.com/i.test(before)) continue;

  const already = before.includes("/assets/design/fonts/intertight.woff2");
  const hits = before.match(GOOGLE_TAGS) || [];
  let after = before.replace(GOOGLE_TAGS, "");
  tagsRemoved += hits.length;

  if (already) {
    skipped++;                       // fonts were already local; just drop the remote tags
  } else if (/<\/head>/i.test(after)) {
    after = after.replace(/<\/head>/i, `${LOCAL_FONTS}\n</head>`);
  } else {
    // Reference pages are body fragments wrapped by base.njk — no <head> of
    // their own. They DO open with YAML front matter, and that must stay on
    // line 1: anything above it stops Eleventy seeing it at all, which silently
    // drops the page's `permalink` and moves the page to a different URL.
    const fm = after.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
    after = fm
      ? fm[0] + LOCAL_FONTS + "\n" + after.slice(fm[0].length)
      : LOCAL_FONTS + "\n" + after;
  }

  if (after !== before) {
    changed++;
    if (!DRY) fs.writeFileSync(file, after);
  }
}

console.log(`${DRY ? "[dry run] " : ""}self-hosted fonts`);
console.log(`  files changed          : ${changed}`);
console.log(`  google font tags removed: ${tagsRemoved}`);
console.log(`  already local          : ${skipped}`);
