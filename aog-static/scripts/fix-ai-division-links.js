#!/usr/bin/env node
/**
 * fix-ai-division-links.js — repoint the retired slugs the Ad On AI design
 * export links to.
 *
 * The Claude Design export for /ad-on-ai-division/ was drawn up when the AI
 * content lived at /ad-on-ai/, /ad-on-group/ and /bpo-ai-program/. None of
 * those exist on this site, so seven call-to-action buttons on the division
 * page — including "See Full Curriculum" — returned a 404. They are the page's
 * only conversion path, so the page was decorative.
 *
 * A blanket slug swap is wrong here: the seven /ad-on-ai/ links are not one
 * destination. They are mapped by what each button offers, against what the
 * target pages actually contain:
 *
 *   "See Full Curriculum", "See the program",       -> /programs/
 *   "Start Your AI Journey", "Start Learning Today"     "AI Training & Enablement Program", and the
 *                                                       only page here carrying the modules, the
 *                                                       Month 1 breakdown and the 24-module count.
 *
 *   "Explore the membership"                        -> /ongoing-support/
 *                                                       The membership section sells community and
 *                                                       masterclasses; that page is the one with
 *                                                       them (community x5, masterclass x7).
 *
 *   "Explore the full site"                         -> /programs/
 *                                                       Its own copy reads "see the program in
 *                                                       detail". The sentence says "the full Ad On
 *                                                       AI site", which is adon-ai.com.au, but
 *                                                       sending group traffic off-site is a
 *                                                       commercial call, not a link fix. Kept
 *                                                       internal; change the EXTERNAL_FULL_SITE
 *                                                       constant if that is wanted instead.
 *
 *   the footer wordmark, /ad-on-ai/#top             -> /
 *                                                       It reads "Ad On Group" and belongs on home.
 *
 * Idempotent, and safe to re-run after any re-export of the page.
 *
 * Usage:  node scripts/fix-ai-division-links.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const DRY = process.argv.includes("--dry");

/** Set to "https://www.adon-ai.com.au/" to send "Explore the full site" off-site. */
const EXTERNAL_FULL_SITE = null;

const PLAIN = [
  [/href="\/ad-on-ai\/#top"/g, "/"],
  [/href="\/ad-on-group\/"/g, "/"],
  [/href="\/bpo-ai-program\/"/g, "/bpo-program/"],
];

/**
 * The remaining /ad-on-ai/ links, decided by the button's own label. The label
 * sits after the href in the same <a>, so each rule matches the anchor whole
 * rather than the href alone.
 */
const BY_LABEL = [
  [/membership/i, "/ongoing-support/"],
  [/full site/i, EXTERNAL_FULL_SITE || "/programs/"],
];
const DEFAULT_TARGET = "/programs/";

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

let files = 0, links = 0;
const tally = {};

for (const file of walk(PUBLIC)) {
  let s = fs.readFileSync(file, "utf8");
  const before = s;

  for (const [re, to] of PLAIN) {
    s = s.replace(re, () => { links++; tally[to] = (tally[to] || 0) + 1; return `href="${to}"`; });
  }

  // Whole anchors still pointing at /ad-on-ai/, routed by their label.
  s = s.replace(/<a\s+href="\/ad-on-ai\/"([\s\S]*?)<\/a>/g, (whole, rest) => {
    const label = rest.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    let to = DEFAULT_TARGET;
    for (const [re, target] of BY_LABEL) if (re.test(label)) { to = target; break; }
    links++;
    tally[to] = (tally[to] || 0) + 1;
    return `<a href="${to}"${rest}</a>`;
  });

  if (s !== before) {
    files++;
    if (!DRY) fs.writeFileSync(file, s);
  }
}

console.log(`${DRY ? "[dry] " : ""}repointed ${links} links across ${files} file(s)`);
for (const [to, n] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
  console.log(`   ${String(n).padStart(2)} -> ${to}`);
}
