#!/usr/bin/env node
/**
 * refresh-lastmod.js — let lastmod catch up with edits made since the migration.
 *
 * build-lastmod.js worked out an honest date for every URL at migration time,
 * from the WordPress post_modified column and the design export dates. That was
 * right then, and its central point still stands: stamping every URL with
 * today's date is a signal Google learns to discount.
 *
 * But those dates are now frozen in the past while we keep editing. Pages that
 * were substantially reworked in August still advertise July dates —
 * /ad-on-ai-division/ had its entire palette rewritten and still claimed
 * 2026-07-31; /people/ had all 24 photographs replaced and still claimed
 * 2026-07-20. We were telling Google nothing had changed, then wondering why it
 * wasn't recrawling.
 *
 * So: take the later of the recorded date and the last commit that touched that
 * page's OWN source file. Per-file, deliberately — a change to mobile.css is a
 * real change, but it isn't a change to any particular page's content, and
 * bumping all 123 URLs because one stylesheet moved is exactly the
 * everything-changed-today signal we're avoiding. Pages nobody has touched keep
 * their original dates.
 *
 * Reads and rewrites src/_data/lastmod.json, which sitemap.njk consumes. Run it
 * after a batch of content work, not on every build: it needs git history,
 * which the deploy host doesn't have.
 *
 * Usage:  node scripts/refresh-lastmod.js [--dry]
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const REPO = path.join(ROOT, "..");
const DRY = process.argv.includes("--dry");
const STORE = path.join(ROOT, "src", "_data", "lastmod.json");

/** Where a URL's source lives — a design page, or a ported template. */
function sourceFor(url) {
  const slug = url.replace(/^\/|\/$/g, "");
  const candidates = slug
    ? [
        path.join("aog-static", "public", slug, "index.html"),
        path.join("aog-static", "src", "pages", slug, "index.njk"),
        path.join("aog-static", "src", "pages", slug, "index.md"),
      ]
    : [path.join("aog-static", "public", "index.html")];
  return candidates.find((c) => fs.existsSync(path.join(REPO, c))) || null;
}

/** Date of the last commit that changed this file, YYYY-MM-DD, or null. */
function lastCommit(relPath) {
  try {
    const out = execFileSync(
      "git",
      ["log", "-1", "--format=%ad", "--date=short", "--", relPath],
      { cwd: REPO, encoding: "utf8" }
    ).trim();
    return out || null;
  } catch {
    return null;
  }
}

const store = JSON.parse(fs.readFileSync(STORE, "utf8"));
let bumped = 0, unchanged = 0, noSource = [];
const changes = [];

for (const [url, current] of Object.entries(store)) {
  const src = sourceFor(url);
  if (!src) {
    noSource.push(url);
    continue;
  }
  const git = lastCommit(src);
  if (!git || git <= current) {
    unchanged++;
    continue;
  }
  changes.push([url, current, git]);
  store[url] = git;
  bumped++;
}

if (!DRY) {
  fs.writeFileSync(STORE, JSON.stringify(store, null, 2) + "\n");
}

console.log(`${DRY ? "[dry run] " : ""}lastmod refreshed from git`);
console.log(`  bumped        : ${bumped}`);
console.log(`  already newest: ${unchanged}`);
if (noSource.length) console.log(`  no source file: ${noSource.length}`);

const spread = {};
for (const [, , to] of changes) spread[to] = (spread[to] || 0) + 1;
if (Object.keys(spread).length) {
  console.log(`  new dates     : ${Object.entries(spread).map(([d, n]) => `${d} (${n})`).join(", ")}`);
}
for (const [url, from, to] of changes.slice(0, 12)) {
  console.log(`      ${url.padEnd(34)} ${from} -> ${to}`);
}
if (changes.length > 12) console.log(`      ... and ${changes.length - 12} more`);
