#!/usr/bin/env node
/**
 * clear-placeholders.js — retire the generated placeholder images.
 *
 * 39 images referenced by the site no longer exist anywhere, so
 * scripts/make-standins.py generated labelled grey stand-ins for them. Checking
 * how each is actually used, none of them render as a visible <img>:
 *
 *   28  CSS background-image on /website-examples/ only — the screenshot
 *       thumbnails inside the device mock-ups on that one page
 *   10  og:image / twitter:image (and the matching schema ImageObject) — never
 *       visible on the page, but they are what a shared link previews
 *    1  unreferenced
 *
 * So nothing user-visible is lost by removing them, and the social images are
 * better repointed than deleted — a shared link currently previews a grey box
 * reading "PLACEHOLDER".
 *
 *   social refs  -> the site's default social image (a real photo)
 *   backgrounds  -> declaration dropped; the device mock-up keeps its frame
 *   files        -> deleted
 *
 * Usage:  node scripts/clear-placeholders.js [--dry]
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const DRY = process.argv.includes("--dry");

const site = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "_data", "site.json"), "utf8"));
const FALLBACK = site.defaultOgImage;

/** Detect our generated stand-ins: the generator paints a cyan accent bar. */
function isPlaceholder(file) {
  try {
    const out = execFileSync("python3", ["-c", `
from PIL import Image
import sys
try:
    im = Image.open(sys.argv[1]).convert("RGB")
    w, h = im.size
    p = im.getpixel((w // 2, 1))
    print("yes" if all(abs(p[i] - c) < 12 for i, c in enumerate((27, 171, 229))) else "no")
except Exception:
    print("no")
`, file], { encoding: "utf8" }).trim();
    return out === "yes";
  } catch { return false; }
}

const media = path.join(PUBLIC, "assets", "media");
const placeholders = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(png|jpe?g|gif|webp)$/i.test(e.name) && isPlaceholder(p)) {
      placeholders.push("/" + path.relative(PUBLIC, p).split(path.sep).join("/"));
    }
  }
})(media);

function sources(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) sources(p, out);
    else if (/\.(njk|html|md|json)$/.test(e.name)) out.push(p);
  }
  return out;
}

let socialFixed = 0, bgRemoved = 0, filesTouched = 0;

for (const file of [
  ...sources(path.join(ROOT, "src", "pages")),
  ...sources(path.join(ROOT, "src", "_includes")),
  ...sources(path.join(ROOT, "src", "_data")),
  ...sources(PUBLIC),
]) {
  const before = fs.readFileSync(file, "utf8");
  let text = before;

  for (const ph of placeholders) {
    // Drop background-image declarations pointing at a placeholder. The mock-up
    // frame around it stays, so the layout is unchanged — just no grey box.
    const bg = new RegExp(
      `\\s*background-image:\\s*url\\((["']?)${ph.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\1\\)\\s*;?`,
      "g"
    );
    const hits = text.match(bg);
    if (hits) { bgRemoved += hits.length; text = text.replace(bg, ""); }

    // Everything else referencing it is a social/schema image URL.
    if (text.includes(ph)) {
      const n = text.split(ph).length - 1;
      text = text.split(ph).join(FALLBACK);
      socialFixed += n;
    }
  }

  if (text !== before) {
    filesTouched++;
    if (!DRY) fs.writeFileSync(file, text);
  }
}

let deleted = 0;
for (const ph of placeholders) {
  const p = path.join(PUBLIC, ph.replace(/^\//, ""));
  if (fs.existsSync(p)) { if (!DRY) fs.unlinkSync(p); deleted++; }
}

console.log(`${DRY ? "[dry run] " : ""}placeholder cleanup`);
console.log(`  placeholder files found : ${placeholders.length}`);
console.log(`  social/schema refs moved to ${FALLBACK} : ${socialFixed}`);
console.log(`  background declarations removed : ${bgRemoved}`);
console.log(`  source files changed    : ${filesTouched}`);
console.log(`  placeholder files deleted : ${deleted}`);
