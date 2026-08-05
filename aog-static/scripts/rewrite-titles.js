#!/usr/bin/env node
/**
 * rewrite-titles.js — title tags, meta descriptions and H1s.
 *
 * Search Console, 12 months to cutover: 139,476 non-brand impressions produced
 * 278 clicks. 85% of all clicks come from people already searching "ad on
 * group". The domain is shown for large non-brand demand and almost never
 * clicked, and in every case below a page already ranks for the cluster — its
 * title just does not use the words people type.
 *
 *   facebook advertising            17,401 imp   pos 62.6
 *   google ads management           12,009 imp   pos 37.9
 *   google adwords management        4,697 imp   pos 46.8
 *   facebook                         2,718 imp   pos  8.0
 *   google ads management services   2,015 imp   pos 79.2
 *   facebook marketing packages      1,960 imp   pos 15.9
 *   facebook ads package             1,351 imp   pos 13.1
 *   facebook advertising packages    1,286 imp   pos 18.7
 *
 * The homepage matters most on its own: 43,775 impressions, 2,066 clicks (two
 * thirds of the site's total) and all 233 external backlinks point at it. Its
 * title was the word "Home".
 *
 * Body copy and page structure are unchanged — this touches only the <title>,
 * the meta description and the H1, which is the whole lever available.
 *
 * Two page sources, so two mechanisms: src/pages/** carry front matter that
 * base.njk renders; public/** are flattened design pages whose tags are already
 * in the HTML.
 *
 * Idempotent — a page already carrying the new text is skipped.
 *
 * Usage:  node scripts/rewrite-titles.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DRY = process.argv.includes("--dry");

/**
 * Each entry: the page, and any of title / description / h1 to change.
 * `h1From` is matched literally so a changed page fails loudly rather than
 * silently rewriting the wrong heading.
 */
const EDITS = [
  {
    page: "public/index.html",
    title: "Ad On Group | Offshore Staff, AI Training & Digital Marketing",
    description:
      "Australian-owned since 2008. Offshore staffing, AI training and enablement, " +
      "digital marketing and on-hold messaging — four divisions, one group.",
  },
  {
    page: "src/pages/facebook-packages/index.njk",
    title: "Facebook & Instagram Advertising Packages | Ad On Group",
    description:
      "Managed Facebook and Instagram advertising packages — campaign setup, ad " +
      "creative, audience targeting and monthly reporting, run by an Australian team.",
  },
  {
    page: "src/pages/google-ads-management/index.njk",
    title: "Google Ads Management Services | Ad On Group",
    description:
      "Google Ads management for Australian businesses — keyword research, campaign " +
      "build, bid management and monthly reporting from a Google Partner agency.",
  },
  {
    page: "src/pages/finder-seo-package/index.njk",
    title: "SEO Packages & Search Engine Optimisation | Ad On Group",
    description:
      "SEO packages for Australian businesses — keyword strategy, an initial audit " +
      "and roadmap, ongoing optimisation and monthly ranking reports.",
    h1From: "seo finder",
    h1To: "SEO Finder Package",
  },
  {
    page: "public/ad-on-workforce/index.html",
    title: "Offshore Staff & Outsourcing Services | Ad On Workforce",
    description:
      "Dedicated offshore staff from the Philippines and South Africa — admin, " +
      "customer service, finance and marketing roles, Australian-managed.",
  },
  {
    page: "public/offices/index.html",
    title: "Offices | Gold Coast, Philippines & South Africa | Ad On Group",
    description:
      "Ad On Group's head office is on the Gold Coast, with a staff office in the " +
      "Philippines and remote teams across South Africa.",
  },
  // H1 only — all-caps headings read as shouting and carry no case signal.
  {
    page: "src/pages/careers/index.njk",
    h1From: "IF YOU'RE AWESOME, WE'RE HIRING",
    h1To: "If you're awesome, we're hiring",
  },
  {
    page: "src/pages/websites/index.njk",
    h1From: "WEBSITES",
    h1To: "Website Design & Development",
  },
];

/** What the page currently says, so "already applied" is an exact comparison. */
function currentValue(src, isFM, kind) {
  if (isFM) {
    const m = src.match(new RegExp(`^${kind}:\\s*(.*)$`, "m"));
    if (!m) return null;
    try { return JSON.parse(m[1]); } catch { return m[1].replace(/^["']|["']$/g, ""); }
  }
  if (kind === "title") {
    const m = src.match(/<title>([\s\S]*?)<\/title>/); return m ? m[1] : null;
  }
  const m = src.match(/<meta name="description" content=(["'])([\s\S]*?)\1/);
  return m ? m[2] : null;
}

let t = 0, d = 0, h = 0, skipped = 0, failed = 0;

/** Front-matter pages: replace the YAML value. */
function editFrontMatter(src, key, value) {
  const re = new RegExp(`^(${key}:\\s*)(".*"|'.*'|.*)$`, "m");
  if (!re.test(src)) return null;
  return src.replace(re, `$1${JSON.stringify(value)}`);
}

/** Design pages: replace the rendered tag. */
function editTag(src, kind, value) {
  if (kind === "title") {
    if (!/<title>[\s\S]*?<\/title>/.test(src)) return null;
    return src.replace(/<title>[\s\S]*?<\/title>/, `<title>${value}</title>`);
  }
  const re = /(<meta name="description" content=)(["'])([\s\S]*?)\2/;
  if (!re.test(src)) return null;
  return src.replace(re, `$1$2${value.replace(/"/g, "&quot;")}$2`);
}

for (const e of EDITS) {
  const file = path.join(ROOT, e.page);
  if (!fs.existsSync(file)) { console.error(`  ! missing: ${e.page}`); failed++; continue; }
  const before = fs.readFileSync(file, "utf8");
  let src = before;
  const isFM = e.page.endsWith(".njk");

  if (e.title) {
    if (currentValue(src, isFM, "title") === e.title) { skipped++; }
    else {
      const out = isFM ? editFrontMatter(src, "title", e.title) : editTag(src, "title", e.title);
      if (out === null) { console.error(`  ! no title found in ${e.page}`); failed++; }
      else { src = out; t++; }
    }
  }
  if (e.description) {
    if (currentValue(src, isFM, "description") === e.description) { skipped++; }
    else {
      const out = isFM ? editFrontMatter(src, "description", e.description)
                       : editTag(src, "description", e.description);
      if (out === null) { console.error(`  ! no description found in ${e.page}`); failed++; }
      else { src = out; d++; }
    }
  }
  if (e.h1From) {
    // Target the <h1> element itself. An earlier version matched the bare
    // string anywhere in the file, which skipped /finder-seo-package/ because
    // "SEO Finder Package" already appears as a different heading further down.
    const m = src.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/);
    if (!m) { console.error(`  ! no <h1> in ${e.page}`); failed++; }
    else if (m[1].includes(e.h1To)) { skipped++; }
    else if (!m[1].includes(e.h1From)) {
      console.error(`  ! H1 reads "${m[1].trim().slice(0,40)}", expected "${e.h1From}" — not touching ${e.page}`);
      failed++;
    } else {
      src = src.replace(m[0], m[0].replace(e.h1From, e.h1To));
      h++;
    }
  }

  if (src !== before && !DRY) fs.writeFileSync(file, src);
}

console.log(`${DRY ? "[dry run] " : ""}title / description / H1`);
console.log(`  titles rewritten       : ${t}`);
console.log(`  descriptions rewritten : ${d}`);
console.log(`  H1s rewritten          : ${h}`);
console.log(`  already applied        : ${skipped}`);
if (failed) console.log(`  FAILED                 : ${failed}`);
