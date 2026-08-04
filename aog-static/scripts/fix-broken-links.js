#!/usr/bin/env node
/**
 * fix-broken-links.js — remove the dead ends WordPress left behind.
 *
 * The ported blog pages link to things the static site never generated: 529
 * links to /category/*, 31 to /author/*, plus deleted posts and blog pagination.
 * 591 dead links in total. Every one is a dead end for a visitor and wasted
 * crawl budget for a search engine.
 *
 * Three different treatments, because the right fix differs:
 *
 *  1. DEAD SIDEBAR WIDGETS — the Categories and Archives widgets exist only to
 *     link to archive pages that don't exist. Unwrapping them would leave a
 *     list of meaningless plain words, so the whole <aside> goes, same as the
 *     dead search widget removed earlier.
 *
 *  2. LINKS THAT MOVED — the /resources/* articles live on the Ad On AI site
 *     (verified 200). Those are repointed there rather than stripped.
 *
 *  3. EVERYTHING ELSE — unwrapped: the <a> is removed but its text is kept, so
 *     the sentence still reads exactly as before. No wording changes.
 *
 * Which targets count as dead is computed from the actual build output, not
 * hardcoded, so this stays correct as pages are added or removed.
 *
 * Run AFTER a build (it reads _site/ to learn what exists), then rebuild.
 *
 * Usage:  npm run build && node scripts/fix-broken-links.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE = path.join(ROOT, "_site");
const DRY = process.argv.includes("--dry");

// Articles that exist on the Ad On AI site rather than here.
const MOVED = /^\/resources\/([a-z0-9-]+)\/?$/;
const MOVED_BASE = "https://www.adon-ai.com.au/resources/";

const DEAD_WIDGETS = /[ \t]*<aside[^>]*\b(?:widget_categories|widget_archive)\b[^>]*>[\s\S]*?<\/aside>\s*/gi;

if (!fs.existsSync(SITE)) {
  console.error("_site/ not found — run `npm run build` first.");
  process.exit(2);
}

// ------------------------------------------------- what actually exists
const exists = new Set();
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else {
      const rel = "/" + path.relative(SITE, p).split(path.sep).join("/");
      exists.add(rel);
      // Directory URL for each index.html. path.relative returns "" (not ".")
      // when dir === SITE, so the root has to be special-cased — getting this
      // wrong makes "/" itself look like a dead link.
      if (e.name === "index.html") {
        const d = path.relative(SITE, dir).split(path.sep).join("/");
        exists.add(d === "" ? "/" : `/${d}/`);
      }
    }
  }
})(SITE);

const isDead = (href) => {
  const u = href.replace(/[?#].*$/, "");
  if (!u.startsWith("/")) return false;                 // external / anchor
  if (/\.[a-z0-9]{2,5}$/i.test(u)) return false;        // an asset, not a page
  const norm = u.endsWith("/") ? u : u + "/";
  return !exists.has(norm) && !exists.has(u);
};

// ------------------------------------------------- source files
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
  ...sources(path.join(ROOT, "public"), [".html"]),
];

let widgets = 0, moved = 0, unwrapped = 0, changedFiles = 0;
const unwrappedTargets = new Map();

for (const file of files) {
  const before = fs.readFileSync(file, "utf8");
  let html = before;

  // 1. dead sidebar widgets
  const w = html.match(DEAD_WIDGETS);
  if (w) { widgets += w.length; html = html.replace(DEAD_WIDGETS, "\n"); }

  // 2 + 3. per-link treatment
  html = html.replace(
    /<a\b([^>]*?)href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi,
    (whole, pre, href, post, text) => {
      if (!isDead(href)) return whole;

      const m = href.replace(/[?#].*$/, "").match(MOVED);
      if (m) {
        moved++;
        return `<a${pre}href="${MOVED_BASE}${m[1]}"${post}>${text}</a>`;
      }

      unwrapped++;
      unwrappedTargets.set(href, (unwrappedTargets.get(href) || 0) + 1);
      return text;   // keep the words, drop the dead link
    }
  );

  if (html !== before) {
    changedFiles++;
    if (!DRY) fs.writeFileSync(file, html);
  }
}

console.log(`${DRY ? "[dry run] " : ""}broken link cleanup`);
console.log(`  dead sidebar widgets removed : ${widgets}`);
console.log(`  links repointed to Ad On AI  : ${moved}`);
console.log(`  links unwrapped (text kept)  : ${unwrapped}`);
console.log(`  files changed                : ${changedFiles}`);

if (unwrappedTargets.size) {
  console.log("\n  unwrapped targets:");
  for (const [t, c] of [...unwrappedTargets].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`    ${String(c).padStart(3)}x  ${t}`);
  }
}
