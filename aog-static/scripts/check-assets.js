#!/usr/bin/env node
/**
 * check-assets.js — verify the built site references nothing that doesn't exist,
 * and nothing that still lives on the old WordPress infrastructure.
 *
 * Run against _site/ AFTER `npm run build`:
 *
 *     npm run build && node scripts/check-assets.js
 *
 * Three checks, because each has caught a real bug:
 *
 *  1. MISSING ASSETS — a root-relative src/href/srcset/url() with no file behind it.
 *
 *  2. LEGACY-HOST REFS — a fully-qualified URL pointing at a WordPress host or
 *     old CDN. These are the dangerous ones: they still *load* for whoever runs
 *     the check (the old site is up), so they look fine in a browser while being
 *     completely broken for the migration. An earlier bug rewrote the path of
 *     such URLs but left the host, giving
 *     https://adongroup.adondevelopment.com/assets/media/... — a 404 that an
 *     earlier relative-only checker reported as "0 broken refs".
 *     rel=canonical / og:url are exempt: those are *supposed* to be absolute.
 *
 *  3. BROKEN INTERNAL LINKS — an <a href> to a page the build didn't produce.
 *
 * Exits non-zero if 1 or 2 find anything. Broken links are reported but do not
 * fail the run — they are tracked separately as a content cleanup.
 */

const fs = require("fs");
const path = require("path");

const SITE = path.join(__dirname, "..", "_site");

const LEGACY_HOSTS = [
  "adongroup.com.au",
  "www.adongroup.com.au",
  "adongroup.adondevelopment.com",
  "adonworkforce.com.au",
  "adongroup-1712c.kxcdn.com",
  "adonworkforce-1712c.kxcdn.com",
];

// Attributes that are meant to hold an absolute canonical URL.
const ABSOLUTE_OK = /(?:rel="canonical"|property="og:(?:url|image)"|name="twitter:[a-z:]*"|"@id"|"url")/;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

if (!fs.existsSync(SITE)) {
  console.error("_site/ not found — run `npm run build` first.");
  process.exit(2);
}

const all = walk(SITE);
const htmlFiles = all.filter((f) => f.endsWith(".html"));

// Everything the build actually produced, as servable URLs.
const exists = new Set();
for (const f of all) {
  const rel = "/" + path.relative(SITE, f).split(path.sep).join("/");
  exists.add(rel);
  if (rel.endsWith("/index.html")) exists.add(rel.slice(0, -"index.html".length));
}

const clean = (u) => u.replace(/[?#].*$/, "").replace(/&(amp|quot|#0?39);.*$/, "");

const missing = new Map();
const legacy = new Map();
const brokenLinks = new Map();
const add = (map, key, where) => {
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(where);
};

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const where = "/" + path.relative(SITE, file).split(path.sep).join("/");

  // --- local assets + links ---------------------------------------------
  const refs = [];
  for (const m of html.matchAll(/(?:src|href)="(\/[^"]*)"/g)) refs.push([m[1], m[0]]);
  for (const m of html.matchAll(/url\((["']?)(\/[^)"']+)\1\)/g)) refs.push([m[2], m[0]]);
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const part of m[1].split(",")) {
      const u = part.trim().split(/\s+/)[0];
      if (u.startsWith("/")) refs.push([u, "srcset"]);
    }
  }

  for (const [raw, ctx] of refs) {
    const u = clean(raw);
    if (!u || u.startsWith("//")) continue;
    if (exists.has(u)) continue;
    // A link to a directory-style URL is fine if the directory produced a page.
    if (!u.includes(".") && exists.has(u.endsWith("/") ? u : u + "/")) continue;

    const isAsset = /\.(jpg|jpeg|png|gif|webp|svg|ico|mp4|webm|css|js|woff2?|ttf|pdf|txt|xml|json)$/i.test(u);
    if (isAsset || ctx === "srcset" || ctx.startsWith("url(")) add(missing, u, where);
    else add(brokenLinks, u.endsWith("/") ? u : u + "/", where);
  }

  // --- absolute refs to legacy hosts -------------------------------------
  for (const m of html.matchAll(/<[^>]+>/g)) {
    const tag = m[0];
    if (ABSOLUTE_OK.test(tag)) continue;
    for (const host of LEGACY_HOSTS) {
      const re = new RegExp(`(?:src|href|content)="https?://${host.replace(/\./g, "\\.")}([^"]*)"`, "g");
      for (const hit of tag.matchAll(re)) {
        // An <a> to the live site is a content choice; an ASSET is a bug.
        const isAsset = /^<(img|script|link|iframe|source|video)\b/i.test(tag);
        if (isAsset) add(legacy, `https://${host}${hit[1]}`, where);
      }
    }
  }
}

const report = (title, map, limit = 20) => {
  console.log(`\n${title}: ${map.size}`);
  let i = 0;
  for (const [k, v] of [...map].sort((a, b) => b[1].size - a[1].size)) {
    if (i++ >= limit) { console.log(`   … and ${map.size - limit} more`); break; }
    console.log(`   ${String(v.size).padStart(3)}x  ${k}`);
    console.log(`        e.g. ${[...v][0]}`);
  }
};

console.log(`checked ${htmlFiles.length} pages, ${all.length} output files`);
report("MISSING ASSETS (fatal)", missing);
report("LEGACY-HOST ASSET REFS (fatal)", legacy);
report("BROKEN INTERNAL LINKS (reported, not fatal)", brokenLinks);

const fatal = missing.size + legacy.size;
console.log(
  `\n${fatal === 0 ? "PASS" : "FAIL"} — ${missing.size} missing asset(s), ` +
  `${legacy.size} legacy-host ref(s), ${brokenLinks.size} broken link target(s)`
);
process.exit(fatal === 0 ? 0 : 1);
