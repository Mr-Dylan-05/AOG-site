#!/usr/bin/env node
/**
 * add-alt-text.js — give every image an alt attribute.
 *
 * 42 images across 7 pages had none. An <img> with no alt attribute at all is
 * the worst case: a screen reader falls back to announcing the file name, so
 * "screencapture-kurrlemotors-au-2025-09-08-13_50_37-scaled.png" gets read out.
 *
 * Two correct answers, and which one applies matters:
 *
 *   alt="…"  content images — the photo or screenshot carries meaning
 *   alt=""   decorative images — marks them for screen readers to SKIP. This is
 *            the right answer for the device frames around the screenshots on
 *            /website-examples/, and for the service icons on /digital/ that
 *            sit directly beside their own visible text label. Describing those
 *            would make a screen reader announce the same thing twice.
 *
 * The photo descriptions were written from looking at the images, not inferred
 * from filenames.
 *
 * Usage:  node scripts/add-alt-text.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DRY = process.argv.includes("--dry");

/** src fragment -> alt text. "" means decorative. */
const ALT = [
  // --- photographs ------------------------------------------------------
  ["2025/03/DSC_0007-scaled.jpg",
    "Ad On Group team member reviewing a Google Ads campaign dashboard showing clicks, impressions and click-through rate"],
  ["2025/03/DSC_2294-scaled-e1742278322814.jpg",
    "Ad On Group staff working at computers in the open-plan office"],
  ["2020/12/pomeranian-dog-watching-videos-animal-and-technology.jpg",
    "A small dog watching a video playing on a screen"],
  ["2022/02/aog-sample-report-scaled.jpg",
    "Sample Ad On Group Google Ads performance report"],

  // --- client website screenshots on /websites/ -------------------------
  ["2020/12/veer-au.jpg", "Veer website built by Ad On Digital"],
  ["2025/09/screencapture-kurrlemotors-au", "Kurrle Motors website built by Ad On Digital"],
  ["2021/11/audsleywindows.png", "Audsley Windows website built by Ad On Digital"],
  ["2020/12/quantumsolar-au.jpg", "Quantum Solar website built by Ad On Digital"],

  // --- decorative -------------------------------------------------------
  // Device mock-up frames: the screenshot inside carries the meaning, the
  // phone/monitor outline around it does not.
  ["devices-showcase/images/desktop.png", ""],
  ["devices-showcase/images/iphone-6.png", ""],
  // Service icons on /digital/, each rendered immediately before its own
  // visible caption ("Unique Websites", "Blogs", …).
  ["2020/11/ic-websites.svg", ""],
  ["2020/11/ic-blogs.svg", ""],
  ["2020/11/ic-brochure.svg", ""],
  ["2020/11/ic-adwords.svg", ""],
  ["2020/11/ic-strategies.svg", ""],
];

function sources(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) sources(p, out);
    else if (/\.(njk|html|md)$/.test(e.name)) out.push(p);
  }
  return out;
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

let added = 0, decorative = 0, malformed = 0, filesTouched = 0, unmatched = 0;

for (const file of [
  ...sources(path.join(ROOT, "src", "pages")),
  ...sources(path.join(ROOT, "src", "_includes")),
  ...sources(path.join(ROOT, "public")),
]) {
  const before = fs.readFileSync(file, "utf8");

  const after = before.replace(/<img\b[^>]*>/gi, (tag) => {
    if (/\balt\s*=/i.test(tag)) return tag;

    // One image on /aog-report-explainers/ has an unquoted src, inherited from
    // the WordPress markup. Normalise it so the attribute can be read at all.
    let fixed = tag.replace(/\bsrc=\s*([^"'\s>]+)/i, (m, url) => {
      malformed++;
      return `src="${url}"`;
    });

    const src = (fixed.match(/src="([^"]*)"/i) || [, ""])[1];
    const hit = ALT.find(([frag]) => src.includes(frag));
    if (!hit) { unmatched++; return fixed; }

    if (hit[1] === "") decorative++; else added++;
    return fixed.replace(/<img\b/i, `<img alt="${esc(hit[1])}"`);
  });

  if (after !== before) {
    filesTouched++;
    if (!DRY) fs.writeFileSync(file, after);
  }
}

console.log(`${DRY ? "[dry run] " : ""}alt text`);
console.log(`  descriptive alt written : ${added}`);
console.log(`  marked decorative (alt="") : ${decorative}`);
console.log(`  malformed src attributes fixed : ${malformed}`);
console.log(`  files changed : ${filesTouched}`);
if (unmatched) console.log(`  ! still without alt (no mapping) : ${unmatched}`);
