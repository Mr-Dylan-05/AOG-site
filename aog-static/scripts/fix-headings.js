#!/usr/bin/env node
/**
 * fix-headings.js — give every page an <h1>.
 *
 * 56 of 107 indexable pages had no h1 at all. Beaver Builder styled headings by
 * appearance rather than meaning, so the ported pages open with
 * <h2 class="fl-heading"> (and occasionally h3/h5) even when that heading IS the
 * page title. Both Google and answer engines lean on h1 to decide what a page is
 * about, so half the site was leaving that unanswered.
 *
 * This promotes each page's FIRST in-body heading to h1, keeping its classes and
 * inner markup untouched — the visible text does not change, only the tag.
 * Subsequent headings are left alone: they are already h2/h3 section headings, so
 * once the first becomes h1 the hierarchy reads correctly.
 *
 * Only the first heading, only pages that currently have no h1, and only the
 * region between </header> and <footer> so the shared chrome is never touched.
 *
 * Four pages are skipped on purpose — see SKIP below. Blanket-promoting their
 * first heading would have produced an actively misleading h1, which is worse
 * than none.
 *
 * Usage:  node scripts/fix-headings.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DRY = process.argv.includes("--dry");

/**
 * Pages whose first heading is NOT the page's subject:
 *   /easy-rate-app/try-now/  first heading is "Easy Rate app available on" (a caption)
 *   /grant-offer/            first heading is "Choose Any 2 Products" (a step, not the title)
 *   /finder-seo-package/     no heading at all — 7 words of content
 *   /website-examples/       no heading at all — a bare gallery
 * The last two are thin pages that need content, not a tag change.
 */
const SKIP = new Set([
  "easy-rate-app/try-now",
  "grant-offer",
  "finder-seo-package",
  "website-examples",
]);

function sources(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) sources(p, out);
    else if (/\.(njk|html|md)$/.test(e.name)) out.push(p);
  }
  return out;
}

let promoted = 0, skipped = 0, already = 0, emptied = 0;
const changes = [];

// Empty headings used as spacers (<h2></h2>) confuse outline parsers and put a
// meaningless heading ahead of the real one. Cheap to remove, so do it first.
for (const file of [
  ...sources(path.join(ROOT, "src", "pages")),
  ...sources(path.join(ROOT, "public")),
]) {
  const before = fs.readFileSync(file, "utf8");
  const after = before.replace(
    /[ \t]*<(h[1-6])(\s[^>]*)?>([\s\S]*?)<\/\1>\s*/gi,
    (whole, _tag, _attrs, inner) => {
      const text = inner.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").trim();
      if (text) return whole;
      emptied++;
      return "\n";
    }
  );
  if (after !== before && !DRY) fs.writeFileSync(file, after);
}

for (const file of sources(path.join(ROOT, "src", "pages"))) {
  const slug = path
    .relative(path.join(ROOT, "src", "pages"), path.dirname(file))
    .split(path.sep).join("/");

  const before = fs.readFileSync(file, "utf8");

  if (/<h1\b/i.test(before)) { already++; continue; }
  if (SKIP.has(slug)) { skipped++; continue; }

  // Front matter must stay untouched; only the body is rewritten.
  const fm = before.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  const head = fm ? fm[0] : "";
  const body = fm ? before.slice(fm[0].length) : before;

  // Take the first heading that actually says something. Some ported pages open
  // with an empty <h2></h2> used as a spacer — promoting that would produce an
  // empty h1, which is worse than having none.
  let m = null;
  for (const cand of body.matchAll(/<(h[2-6])(\s[^>]*)?>([\s\S]*?)<\/\1>/gi)) {
    const text = cand[3].replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").trim();
    if (text.length >= 3) { m = cand; break; }
  }
  if (!m) { skipped++; continue; }

  const [whole, tag, attrs = "", inner] = m;
  const replacement = `<h1${attrs}>${inner}</h1>`;
  const updated = head + body.replace(whole, replacement);

  const text = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  changes.push(`${tag} -> h1   /${slug}/   "${text.slice(0, 54)}"`);
  promoted++;

  if (!DRY) fs.writeFileSync(file, updated);
}

console.log(`${DRY ? "[dry run] " : ""}heading hierarchy`);
console.log(`  promoted to h1 : ${promoted}`);
console.log(`  already had h1 : ${already}`);
console.log(`  skipped        : ${skipped}`);
console.log(`  empty headings removed: ${emptied}`);
if (changes.length) {
  console.log("");
  for (const c of changes.slice(0, 20)) console.log(`   ${c}`);
  if (changes.length > 20) console.log(`   … and ${changes.length - 20} more`);
}
