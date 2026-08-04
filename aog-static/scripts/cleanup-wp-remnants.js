#!/usr/bin/env node
/**
 * cleanup-wp-remnants.js — remove the last behavioural leftovers of WordPress.
 *
 * Two things, both safe to re-run:
 *
 * 1. Dead search widgets. The auto-ported blog/reference pages carry Beaver
 *    Builder's sidebar search box, which submits `?s=` to WordPress. There is no
 *    WordPress to answer it, so it silently does nothing — worse than absent.
 *    The whole <aside> is removed, not just the <form>, so no empty box is left.
 *
 * 2. Hardcoded https://adongroup.com.au links in <a> tags. These pin the site to
 *    the production domain, so on a preview deploy every one of them jumps back
 *    to the old WordPress site. Made root-relative instead.
 *
 *    Deliberately NOT touched: rel="canonical", og:url, ogImage and JSON-LD
 *    URLs. Those are *supposed* to be absolute — making them relative would
 *    actively damage the SEO this migration is trying to preserve.
 *
 * Usage:  node scripts/cleanup-wp-remnants.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DRY = process.argv.includes("--dry");

const SEARCH_WIDGET = /[ \t]*<aside[^>]*widget_search[^>]*>[\s\S]*?<\/aside>\s*/gi;
// Only <a href="…"> — never <link rel=canonical href="…"> or meta og:url.
const ABS_LINK = /(<a\s[^>]*?href=")https:\/\/(?:www\.)?adongroup\.com\.au/gi;

function sourceFiles() {
  const out = [];
  const walk = (dir, exts) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, exts);
      else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
    }
  };
  walk(path.join(ROOT, "public"), [".html"]);
  walk(path.join(ROOT, "src", "pages"), [".njk", ".html", ".md"]);
  walk(path.join(ROOT, "src", "_includes"), [".njk"]);
  return out;
}

let widgets = 0, links = 0, filesChanged = 0;
for (const file of sourceFiles()) {
  const before = fs.readFileSync(file, "utf8");
  let after = before;

  const w = after.match(SEARCH_WIDGET);
  if (w) { widgets += w.length; after = after.replace(SEARCH_WIDGET, "\n"); }

  const l = after.match(ABS_LINK);
  if (l) { links += l.length; after = after.replace(ABS_LINK, "$1"); }

  if (after !== before) {
    filesChanged++;
    if (!DRY) fs.writeFileSync(file, after);
  }
}

console.log(`${DRY ? "[dry run] " : ""}WordPress remnant cleanup`);
console.log(`  dead search widgets removed : ${widgets}`);
console.log(`  absolute <a> links relativised : ${links}`);
console.log(`  files changed : ${filesChanged}`);
