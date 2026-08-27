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
 * Separately, the page's own "Book a call" button pointed at /#contact — the
 * homepage's full contact form, which asks for first name, last name, phone,
 * contact preference and a message. The AI campaign is meant to land on the
 * short name-and-email form at /ai-training/, so that one button is repointed
 * there. Scoped to this page: /#contact is a legitimate homepage anchor
 * everywhere else, and the header and footer "Contact" links are deliberately
 * left alone, since those are shared chrome and have to stay identical across
 * the site.
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

/**
 * Page-scoped rewrites: [path suffix, regex, target]. Kept separate from PLAIN
 * because these hrefs are correct on other pages.
 */
const SCOPED = [
  // The export ships this button as /#contact, the homepage's long contact
  // form, so it is repointed at the contact page, which has a working tracked
  // form.
  //
  // It deliberately no longer matches /ai-training/. That href was rewritten
  // here while the lead page was removed, but the campaign landing page now
  // lives at that URL. Leaving it in the pattern meant this script would strip
  // any link to the landing page and quietly send it to the generic contact
  // form instead, every time it ran.
  ["ad-on-ai-division/index.html", /href="\/#contact"/g, "/contact-us/"],
];

/**
 * Copy rewrites: [path suffix, regex, replacement]. "Book a call" promised a
 * booking, but the page it now lands on asks for a name and an email and
 * answers with "Send me the details" — no call is scheduled. "Enquire now"
 * describes what the button actually does.
 */
const SCOPED_TEXT = [
  // Keyed on data-dc rather than the href, so it survives the button being
  // repointed. "Book a call" promised a booking the destination never offered.
  ["ad-on-ai-division/index.html", /(<a [^>]*data-dc="hd"[^>]*>)Book a call(<\/a>)/g, "$1Enquire now$2"],
  // The social-proof line under the client logos. The export claimed "trained
  // over 40+ ... to use AI", which counts AI training clients; the line is
  // meant to carry the group's whole client base.
  [
    "ad-on-ai-division/index.html",
    /We&rsquo;ve trained over (<span[^>]*>)40\+(<\/span>) Australian businesses just like yours to use AI\./g,
    "We&rsquo;ve worked with over $114,000$2 Australian businesses just like yours.",
  ],
];

let files = 0, links = 0, labels = 0;
const tally = {};

for (const file of walk(PUBLIC)) {
  let s = fs.readFileSync(file, "utf8");
  const before = s;

  for (const [suffix, re, to] of SCOPED) {
    if (!file.endsWith(suffix)) continue;
    s = s.replace(re, () => { links++; tally[to] = (tally[to] || 0) + 1; return `href="${to}"`; });
  }

  for (const [suffix, re, to] of SCOPED_TEXT) {
    if (!file.endsWith(suffix)) continue;
    s = s.replace(re, (...m) => { labels++; return to.replace("$1", m[1]).replace("$2", m[2]); });
  }

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

console.log(`${DRY ? "[dry] " : ""}repointed ${links} links, rewrote ${labels} text run(s), across ${files} file(s)`);
for (const [to, n] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
  console.log(`   ${String(n).padStart(2)} -> ${to}`);
}
