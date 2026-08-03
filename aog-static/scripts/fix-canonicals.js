#!/usr/bin/env node
/**
 * fix-canonicals.js — make canonical and og:url self-referencing.
 *
 * The design pages were originally built for adonworkforce.com.au, and the
 * flatten carried their <head> across verbatim. The result: 9 pages on
 * adongroup.com.au declared
 *
 *     <link rel="canonical" href="https://adonworkforce.com.au/package/customer-service/">
 *
 * plus 19 og:url tags pointing the same way. A cross-domain canonical is an
 * instruction, not a hint: it tells Google "don't index this URL, index that one
 * instead", so those pages could not rank on adongroup.com.au at all — including
 * /ad-on-workforce/ and every staffing role page.
 *
 * Note the paths differ between the two sites (/package/customer-service/ there
 * vs /customer-service/ here), so this can't just swap the hostname — each tag
 * is rewritten to the page's OWN URL.
 *
 * Only rewrites tags pointing at a *different* domain. Correct self-referencing
 * tags are left alone, so this is safe to re-run — worth doing after any future
 * import, since that is where the problem comes from.
 *
 * Usage:  node scripts/fix-canonicals.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const DRY = process.argv.includes("--dry");

const site = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "_data", "site.json"), "utf8"));
const BASE = site.url.replace(/\/$/, "");

/**
 * Hosts whose canonicals should be pulled back to this site.
 *
 * Only adonworkforce.com.au. The two bio pages (/dylan-bailey/, /beau-robards/)
 * canonical to adon-ai.com.au, which serves them and returns 200 — that is a
 * deliberate consolidation of duplicated bios onto the Ad On AI site, not a
 * leftover, so it is left alone.
 */
const REWRITE_HOSTS = ["adonworkforce.com.au"];
const shouldRewrite = (href) => REWRITE_HOSTS.some((h) => href.includes(h));

/**
 * Pages whose canonical points at a different page on THIS domain.
 *
 * These five were flattened out of a single design page and kept its canonical,
 * so each was telling Google "index the homepage instead of me" while also
 * appearing in sitemap.xml — contradictory, and it meant none of them could
 * rank. Their og:url was remapped correctly during the flatten; only the
 * canonical was missed, which is the tell.
 *
 * NOT included: /ad-on-workforce-division/, whose canonical points at
 * /ad-on-workforce/. Those two really are near-duplicate pages, so consolidating
 * them is deliberate and correct.
 */
const SELF_CANONICAL = new Set([
  "offices", "people", "history", "purpose", "culture",
]);

function pages(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) pages(p, out);
    else if (e.name === "index.html") out.push(p);
  }
  return out;
}

let canonical = 0, ogurl = 0, relative = 0, misdirected = 0, files = 0;
const changed = [];

for (const file of pages(PUBLIC)) {
  const rel = path.relative(PUBLIC, path.dirname(file)).split(path.sep).join("/");
  const url = `${BASE}${rel === "" ? "/" : `/${rel}/`}`;
  const before = fs.readFileSync(file, "utf8");
  let html = before;
  const hits = [];

  html = html.replace(
    /(<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=)(["'])(https?:\/\/[^"']+)\2/gi,
    (whole, pre, q, href) => {
      if (!shouldRewrite(href)) return whole;
      canonical++; hits.push("canonical");
      return `${pre}${q}${url}${q}`;
    }
  );

  html = html.replace(
    /(<meta\b[^>]*\bproperty=["']og:url["'][^>]*\bcontent=)(["'])(https?:\/\/[^"']+)\2/gi,
    (whole, pre, q, href) => {
      if (!shouldRewrite(href)) return whole;
      ogurl++; hits.push("og:url");
      return `${pre}${q}${url}${q}`;
    }
  );

  // Relative canonicals resolve correctly today, but they're brittle: any
  // context where the page is served or copied under a different base — a
  // preview deploy, a scraper, a syndicated copy — resolves them somewhere
  // else entirely. Absolute is the whole point of a canonical.
  html = html.replace(
    /(<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=)(["'])(\/[^"']*)\2/gi,
    (whole, pre, q) => {
      relative++; hits.push("relative canonical");
      return `${pre}${q}${url}${q}`;
    }
  );

  // Same-domain but pointing at the wrong page — see SELF_CANONICAL above.
  if (SELF_CANONICAL.has(rel)) {
    html = html.replace(
      /(<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=)(["'])([^"']+)\2/gi,
      (whole, pre, q, href) => {
        if (href === url) return whole;
        misdirected++; hits.push("misdirected canonical");
        return `${pre}${q}${url}${q}`;
      }
    );
  }

  if (html !== before) {
    files++;
    changed.push(`${rel === "" ? "/" : `/${rel}/`}  (${[...new Set(hits)].join(" + ")})`);
    if (!DRY) fs.writeFileSync(file, html);
  }
}

console.log(`${DRY ? "[dry run] " : ""}cross-domain canonical fix`);
console.log(`  canonical rewritten : ${canonical}`);
console.log(`  og:url rewritten    : ${ogurl}`);
console.log(`  relative -> absolute: ${relative}`);
console.log(`  misdirected fixed   : ${misdirected}`);
console.log(`  files changed       : ${files}`);
if (changed.length) {
  console.log("\n  pages:");
  for (const c of changed.sort()) console.log(`    ${c}`);
}
