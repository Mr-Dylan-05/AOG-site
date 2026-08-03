#!/usr/bin/env node
/**
 * consolidate-pages.js — remove duplicate and empty pages, redirecting as we go.
 *
 * Three groups, all approved by Dylan:
 *
 * 1. EMPTY PAGES (8). Nav and footer with no body content at all, carried over
 *    from WordPress as shells. Previously noindex'd; now deleted outright.
 *    Each 301s somewhere sensible so any existing link still lands.
 *
 * 2. DUPLICATE ROLE PAGES (7). /package/<role>/ and /<role>/ are the same page.
 *    The short URL wins: it is the redesigned version, it is what the new nav
 *    links to, and it is what the canonical tags already point at. The
 *    /package/ URLs have more internal links today (76 vs 20) purely because
 *    the legacy reference-page nav points at them — a 301 carries that across
 *    rather than losing it.
 *
 * 3. NEAR-DUPLICATES (2). /bpo-ai-program/ is 96% identical to /bpo-program/
 *    and orphaned (1 inlink). /ad-on-group/ is 88% identical to the homepage.
 *
 * Internal links to a removed URL are rewritten to its target, so the site
 * doesn't rely on the redirects for its own navigation.
 *
 * Usage:  node scripts/consolidate-pages.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DRY = process.argv.includes("--dry");

/** removed URL -> where it should go instead */
const REDIRECTS = {
  // 1. empty shells
  "/careers/": "/contact-us/",
  "/edm/": "/ad-on-digital/",
  "/google-ads/": "/google-ads-management/",
  "/ad-on-workforce/about/": "/ad-on-workforce/",
  "/ad-on-workforce/services/": "/ad-on-workforce/",
  "/faqs/aod-faqs/": "/faqs/",
  "/faqs/aoh-faqs/": "/faqs/",
  "/animated-video-maker-help-build-your-brand/": "/animated-video-maker/",

  // 2. duplicate role pages — short URL wins
  "/package/customer-service/": "/customer-service/",
  "/package/general-admin-staff/": "/general-admin-staff/",
  "/package/finance-admin-staff/": "/finance-admin-staff/",
  "/package/data-entry-collation-position/": "/data-entry-collation/",
  "/package/bespoke-repeatable-task-role/": "/bespoke-repeatable-task-role/",
  "/package/marketing-assistant/": "/marketing-assistant/",
  "/package/executive-personal-assistant/": "/executive-personal-assistant/",

  // 3. near-duplicates
  "/bpo-ai-program/": "/bpo-program/",
  "/ad-on-group/": "/",
};

const rm = (p) => {
  if (!fs.existsSync(p)) return false;
  if (!DRY) fs.rmSync(p, { recursive: true, force: true });
  return true;
};

// ------------------------------------------------------------ delete sources
let deleted = 0;
for (const url of Object.keys(REDIRECTS)) {
  const slug = url.replace(/^\/|\/$/g, "");
  if (rm(path.join(ROOT, "src", "pages", slug))) deleted++;
  else if (rm(path.join(ROOT, "public", slug))) deleted++;
  else console.warn(`  ! no source found for ${url}`);
}

// ------------------------------------------------------- rewrite inbound links
function sources(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) sources(p, out);
    else if (/\.(njk|html|md)$/.test(e.name)) out.push(p);
  }
  return out;
}

let rewritten = 0, filesTouched = 0;
for (const file of [
  ...sources(path.join(ROOT, "src", "pages")),
  ...sources(path.join(ROOT, "src", "_includes")),
  ...sources(path.join(ROOT, "public")),
]) {
  const before = fs.readFileSync(file, "utf8");
  let html = before;
  for (const [from, to] of Object.entries(REDIRECTS)) {
    const n = html.split(`href="${from}"`).length - 1;
    if (n) { html = html.split(`href="${from}"`).join(`href="${to}"`); rewritten += n; }
  }
  if (html !== before) {
    filesTouched++;
    if (!DRY) fs.writeFileSync(file, html);
  }
}

// The shared nav lives in a data file, not markup — missing it left every
// reference page linking to pages that no longer exist. Entries whose target
// was removed are repointed; a child that would then duplicate its parent
// (e.g. "About" -> /ad-on-workforce/ under "Ad On Workforce") is dropped.
const NAV = path.join(ROOT, "src", "_data", "nav.json");
if (fs.existsSync(NAV)) {
  const nav = JSON.parse(fs.readFileSync(NAV, "utf8"));
  let navFixed = 0, navDropped = 0;
  const fix = (items, parentUrl) =>
    items.reduce((keep, item) => {
      if (REDIRECTS[item.url]) { item.url = REDIRECTS[item.url]; navFixed++; }
      if (item.children) item.children = fix(item.children, item.url);
      if (parentUrl && item.url === parentUrl && !item.children) { navDropped++; return keep; }
      keep.push(item);
      return keep;
    }, []);
  for (const key of Object.keys(nav)) nav[key] = fix(nav[key], null);
  if (!DRY) fs.writeFileSync(NAV, JSON.stringify(nav, null, 2) + "\n");
  console.log(`  nav.json entries repointed : ${navFixed}${navDropped ? `, ${navDropped} dropped as redundant` : ""}`);
}

// ------------------------------------------------------------ write redirects
const REDIR_FILE = path.join(ROOT, "public", "_redirects");
const MARK_START = "# --- Consolidated pages (scripts/consolidate-pages.js) ---";
const MARK_END = "# --- end consolidated pages ---";
let redirects = fs.readFileSync(REDIR_FILE, "utf8");
redirects = redirects.replace(
  new RegExp(`${MARK_START}[\\s\\S]*?${MARK_END}\\n?`), ""
);
const block =
  `${MARK_START}\n` +
  `# Empty shells and duplicate pages removed; 301 so existing links still land.\n` +
  Object.entries(REDIRECTS)
    .map(([from, to]) => `${from.padEnd(46)}${to.padEnd(34)}301`)
    .join("\n") +
  `\n${MARK_END}\n`;
if (!DRY) fs.writeFileSync(REDIR_FILE, redirects.trimEnd() + "\n\n" + block);

// mirror into .htaccess for Apache hosting
const HT = path.join(ROOT, "public", ".htaccess");
let ht = fs.readFileSync(HT, "utf8");
ht = ht.replace(new RegExp(`  ${MARK_START}[\\s\\S]*?  ${MARK_END}\\n?`), "");
const htBlock =
  `  ${MARK_START}\n` +
  Object.entries(REDIRECTS)
    .map(([from, to]) => `  RewriteRule ^${from.replace(/^\//, "").replace(/\/$/, "")}/?$ ${to} [R=301,L]`)
    .join("\n") +
  `\n  ${MARK_END}\n`;
ht = ht.replace(/(\n  # Serve \/path\/ from)/, `\n${htBlock}$1`);
if (!DRY) fs.writeFileSync(HT, ht);

console.log(`${DRY ? "[dry run] " : ""}page consolidation`);
console.log(`  pages deleted        : ${deleted} of ${Object.keys(REDIRECTS).length}`);
console.log(`  internal links moved : ${rewritten} across ${filesTouched} files`);
console.log(`  301s written to _redirects and .htaccess`);
