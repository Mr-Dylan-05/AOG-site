#!/usr/bin/env node
/**
 * align-ai-palette.js — bring the Ad On AI pages onto the Ad On Group palette.
 *
 * The design review said /ad-on-ai-division/ "seems to have a style all of its
 * own". It does, and the cause is measurable: that page uses an indigo,
 * #2F6FED, 89 times against only 12 uses of Ad On Group blue. Every other
 * design page uses AOG blue and contains no indigo at all —
 * /ad-on-digital/ 36:0, /ad-on-workforce/ 92:0.
 *
 * So it isn't the gradients. Those are the same soft background washes the
 * rest of the site uses, and 13 of the "gradients" on the page are actually
 * mask-image fades on the marquee edges — removing those would break the fade
 * rather than flatten a colour. It is the accent colour, and it runs across
 * all eight Ad On AI pages.
 *
 *   #2F6FED  indigo      -> #1BABE5  Ad On Group blue
 *   #7FD0FF  pale blue   -> #5FCDF5  AOG light blue (the site's existing
 *                                    lighter tone, keeps contrast on the dark
 *                                    sections where this one is used)
 *
 * Deliberately NOT touched: #14A08C, a teal used only on 14px status dots. It
 * reads as "complete" next to the neutral and locked states; recolouring it to
 * blue would remove that distinction. Flagged rather than changed.
 *
 * Idempotent.
 *
 * Usage:  node scripts/align-ai-palette.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const DRY = process.argv.includes("--dry");

const SWAPS = [
  [/#2F6FED/gi, "#1BABE5"],
  [/#7FD0FF/gi, "#5FCDF5"],
];

let total = 0;
const perFile = [];

for (const entry of fs.readdirSync(PUBLIC, { withFileTypes: true })) {
  const file = entry.isDirectory()
    ? path.join(PUBLIC, entry.name, "index.html")
    : entry.name === "index.html"
    ? path.join(PUBLIC, entry.name)
    : null;
  if (!file || !fs.existsSync(file)) continue;

  const before = fs.readFileSync(file, "utf8");
  let after = before;
  let n = 0;
  for (const [re, to] of SWAPS) {
    after = after.replace(re, () => {
      n++;
      return to;
    });
  }
  if (n) {
    total += n;
    perFile.push([path.relative(PUBLIC, file).replace("/index.html", "") || "/", n]);
    if (!DRY) fs.writeFileSync(file, after);
  }
}

console.log(`${DRY ? "[dry run] " : ""}Ad On AI palette aligned to Ad On Group`);
for (const [p, n] of perFile.sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  /${p}`);
}
console.log(`  ---- ${total} colour references updated across ${perFile.length} pages`);
