#!/usr/bin/env node
/**
 * build-lastmod.js — work out an honest <lastmod> for each URL.
 *
 * Writes src/_data/lastmod.json, which sitemap.njk reads. The result is
 * COMMITTED rather than computed at build time, because two of the three
 * sources aren't available on a host: the 400 MB WordPress dump is git-ignored,
 * and the dylan-website repo only exists on Dylan's machine.
 *
 * The temptation is to stamp everything with today's date. That is worse than
 * useless — lastmod is supposed to mean "when the content last meaningfully
 * changed", and a sitemap where every URL changed today is a signal Google
 * learns to discount. Re-tagging markup for SEO is not a content change.
 *
 * So each URL gets a date from whichever source actually knows:
 *
 *   1. public/<slug>/    — redesigned pages. Their content is new, so the
 *                          WordPress date would understate it even where the
 *                          slug matches an old page.
 *                          · imported from the Ad On AI site  -> that repo's
 *                            last commit date for the source file
 *                          · from the Claude Design export     -> the export date
 *   2. src/pages/<slug>/ — ported pages: post_modified from the WordPress
 *                          database, the real date the content last changed
 *   3. neither           — no lastmod emitted. Omitting is valid per the
 *                          sitemap spec and honest; inventing a date is not.
 *
 * Usage:  node scripts/build-lastmod.js [--dry]
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const DRY = process.argv.includes("--dry");

const SQL = path.join(ROOT, "..", "adminer.sql");
const DESIGN_EXPORT = "/Users/dylanbailey/Downloads/ad on group";
const AI_REPO = "/Users/dylanbailey/Documents/GitHub/dylan-website";

/** Redesigned pages imported from the Ad On AI site -> source file there. */
const AI_IMPORTS = {
  "ad-on-ai-division": "index.html",
  "programs": "programs.html",
  "ongoing-support": "ongoing-support.html",
  "bpo-program": "bpo-program.html",
  "about": "about.html",
  "ad-on-group": "ad-on-group.html",
  "terms": "terms.html",
  "program-pricing": "program-pricing.html",
  "dylan-bailey": "dylan-bailey.html",
  "beau-robards": "beau-robards.html",
};

// ---------------------------------------------------------- WordPress dates
function wordpressDates() {
  const out = {};
  if (!fs.existsSync(SQL)) {
    console.warn("  ! adminer.sql not found — keeping existing WordPress dates");
    return null;
  }
  // …'post_status','comment_status','ping_status','post_password','post_name',
  //   'to_ping','pinged','post_modified',…
  const re = /'publish',\s*'(?:open|closed)',\s*'(?:open|closed)',\s*'[^']*',\s*'([a-z0-9-]{2,120})',\s*'[^']*',\s*'[^']*',\s*'(\d{4}-\d{2}-\d{2}) /g;
  const fd = fs.openSync(SQL, "r");
  const CHUNK = 32 * 1024 * 1024;
  const buf = Buffer.alloc(CHUNK);
  let carry = "";
  let read;
  while ((read = fs.readSync(fd, buf, 0, CHUNK, null)) > 0) {
    const text = carry + buf.slice(0, read).toString("latin1");
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null) {
      const [, slug, date] = m;
      if (!out[slug] || date > out[slug]) out[slug] = date;
    }
    carry = text.slice(-2000);
  }
  fs.closeSync(fd);
  return out;
}

// ---------------------------------------------------------- redesign dates
function gitDate(repo, file) {
  try {
    return execFileSync("git", ["log", "-1", "--format=%as", "--", file],
      { cwd: repo, encoding: "utf8" }).trim() || null;
  } catch { return null; }
}

function designExportDate() {
  try {
    const files = fs.readdirSync(DESIGN_EXPORT).filter((f) => f.endsWith(".dc.html"));
    let newest = 0;
    for (const f of files) {
      const t = fs.statSync(path.join(DESIGN_EXPORT, f)).mtimeMs;
      if (t > newest) newest = t;
    }
    return newest ? new Date(newest).toISOString().slice(0, 10) : null;
  } catch { return null; }
}

// ---------------------------------------------------------- assemble
const wp = wordpressDates();
const design = designExportDate();
const existing = (() => {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, "src", "_data", "lastmod.json"), "utf8")); }
  catch { return {}; }
})();

function pagesIn(dir, ext) {
  const out = [];
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === ext) out.push(path.relative(dir, path.dirname(p)).split(path.sep).join("/"));
    }
  };
  walk(dir);
  return out;
}

const result = {};
const stats = { ai: 0, design: 0, wordpress: 0, resource: 0, none: 0 };

/**
 * Resource articles carry their own date in front matter ("updated: 4 August
 * 2026"), which is the authoritative one — they're written here rather than
 * ported from anywhere, so no external source knows better.
 */
const MONTHS = {
  january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
  july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
};
(function resources(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { resources(p); continue; }
    if (e.name !== "index.njk") continue;
    const text = fs.readFileSync(p, "utf8");
    const url = (text.match(/^permalink:\s*"([^"]+)"/m) || [])[1];
    const upd = text.match(/^updated:\s*"?(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})"?/m);
    if (!url || !upd) continue;
    const mm = MONTHS[upd[2].toLowerCase()];
    if (!mm) continue;
    result[url.replace(/index\.html$/, "")] =
      `${upd[3]}-${mm}-${String(upd[1]).padStart(2, "0")}`;
    stats.resource++;
  }
})(path.join(ROOT, "src", "pages", "resources"));

for (const slug of pagesIn(path.join(ROOT, "public"), "index.html")) {
  const url = slug === "" ? "/" : `/${slug}/`;
  const leaf = slug.split("/").pop();
  if (AI_IMPORTS[leaf]) {
    const d = gitDate(AI_REPO, AI_IMPORTS[leaf]) || existing[url];
    if (d) { result[url] = d; stats.ai++; continue; }
  }
  const d = design || existing[url];
  if (d) { result[url] = d; stats.design++; } else stats.none++;
}

for (const slug of pagesIn(path.join(ROOT, "src", "pages"), "index.njk")) {
  const url = `/${slug}/`;
  if (result[url]) continue;                      // public/ already won
  const leaf = slug.split("/").pop();
  const d = (wp && wp[leaf]) || existing[url];
  if (d) { result[url] = d; stats.wordpress++; } else stats.none++;
}

const sorted = Object.fromEntries(Object.entries(result).sort());
const dest = path.join(ROOT, "src", "_data", "lastmod.json");
if (!DRY) fs.writeFileSync(dest, JSON.stringify(sorted, null, 2) + "\n");

console.log(`${DRY ? "[dry run] " : ""}lastmod dates`);
console.log(`  from Ad On AI repo   : ${stats.ai}`);
console.log(`  from design export   : ${stats.design}  (${design || "unavailable"})`);
console.log(`  from WordPress dump  : ${stats.wordpress}`);
console.log(`  from resource front matter : ${stats.resource}`);
console.log(`  no date -> omitted   : ${stats.none}`);
console.log(`  total written        : ${Object.keys(sorted).length}`);
