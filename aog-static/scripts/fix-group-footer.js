#!/usr/bin/env node
/**
 * fix-group-footer.js — correct the footer on the Ad On Group design pages.
 *
 * The footer on 38 design pages — including the homepage — is the Ad On AI
 * footer. This isn't a migration fault: the design export's own
 * "Ad On Group - Home.dc.html" carries it, so apply-group-footer.js faithfully
 * propagated the wrong footer everywhere.
 *
 * Six things wrong with it on a group site:
 *
 *   1. branded "Ad On AI", with the AI logo
 *   2. the logo links to /ad-on-ai-division/ rather than home
 *   3. the description describes the AI division, not the group
 *   4. the only navigation offered is the three AI programs, on a site with
 *      five divisions
 *   5. the contact address is hello@adon-ai.com.au
 *   6. three DEAD links on every page: "Contact" points at #contact (an anchor
 *      that exists on almost no page) and Privacy Policy / Terms of Use both
 *      point at "#"
 *
 * Item 6 is the one worth noting — those are broken links sitewide that a link
 * checker won't flag, because an anchor is technically valid.
 *
 * Idempotent.
 *
 * Usage:  node scripts/fix-group-footer.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const DRY = process.argv.includes("--dry");

/** Each fix: [description, find, replace]. Order matters. */
const FIXES = [
  ["logo alt", /(<img src="\/assets\/design\/adon-logo\.png" alt=")Ad On AI(")/g, "$1Ad On Group$2"],
  ["wordmark", /Ad&#8202;On&#8202;AI/g, "Ad&#8202;On&#8202;Group"],
  ["logo link -> home", /(<a href=")\/ad-on-ai-division\/#top(")/g, "$1/$2"],
  [
    "description",
    /A division of Ad On Group &mdash; practical AI training and enablement for Australian businesses\./g,
    "Australian-owned since 2008 &mdash; offshore staffing, AI training, digital marketing and on-hold messaging.",
  ],
  ["column heading", /(>)Programs(<\/div>)/g, "$1Divisions$2"],
  [
    "division links",
    /<a href="\/programs\/"([^>]*)>AI Training &amp; Enablement<\/a>\s*<a href="\/bpo-program\/"[^>]*>BPO AI Program<\/a>\s*<a href="\/ongoing-support\/"[^>]*>Ongoing Support<\/a>/g,
    (m, attrs) =>
      `<a href="/ad-on-workforce/"${attrs}>Ad On Workforce</a>\n          ` +
      `<a href="/ad-on-ai-division/"${attrs}>Ad On AI</a>\n          ` +
      `<a href="/ad-on-digital/"${attrs}>Ad On Digital</a>\n          ` +
      `<a href="/ad-on-hold/"${attrs}>Ad On Hold</a>`,
  ],
  ["email", /hello@adon-ai\.com\.au/g, "info@adongroup.com.au"],
  ["dead contact link", /href="#contact"([^>]*)>Contact<\/a>/g, 'href="/contact-us/"$1>Contact</a>'],
  ["dead privacy link", /href="#"([^>]*)>Privacy Policy<\/a>/g, 'href="/privacy-policy/"$1>Privacy Policy</a>'],
  ["dead terms link", /href="#"([^>]*)>Terms of Use<\/a>/g, 'href="/terms-and-conditions/"$1>Terms of Use</a>'],
];

function pages(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) pages(p, out);
    else if (e.name === "index.html") out.push(p);
  }
  return out;
}

const totals = Object.fromEntries(FIXES.map(([label]) => [label, 0]));
let filesChanged = 0;

for (const file of pages(PUBLIC)) {
  const before = fs.readFileSync(file, "utf8");
  const footerAt = before.lastIndexOf("<footer");
  if (footerAt === -1) continue;

  // Only rewrite inside the footer — "Ad On AI" is legitimate body copy on the
  // AI division pages and must not be touched there.
  const head = before.slice(0, footerAt);
  let foot = before.slice(footerAt);

  for (const [label, find, repl] of FIXES) {
    const hits = foot.match(find);
    if (hits) { totals[label] += hits.length; foot = foot.replace(find, repl); }
  }

  const after = head + foot;
  if (after !== before) {
    filesChanged++;
    if (!DRY) fs.writeFileSync(file, after);
  }
}

console.log(`${DRY ? "[dry run] " : ""}group footer corrections`);
for (const [label, n] of Object.entries(totals)) {
  console.log(`  ${label.padEnd(20)} ${n}`);
}
console.log(`  files changed        ${filesChanged}`);
