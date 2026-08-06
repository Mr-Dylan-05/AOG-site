#!/usr/bin/env node
/**
 * fix-widows.js — stop a heading or paragraph ending on a lone word.
 *
 * The design review flagged this seven times, always the same shape: the last
 * word and its full stop dropped onto a line by themselves.
 *
 *   Business shouldn't be this
 *   hard.
 *
 * mobile.css sets `text-wrap: balance` on headings and `pretty` on body copy,
 * which fixes most of them for free. But `pretty` is best-effort — Chrome only
 * reflows the last few lines within a budget, and it left "…so should you!" and
 * "…great moments together!" still hanging, at 16% and 18% of the line.
 *
 * So this joins the final two words with a non-breaking space, which the
 * browser cannot break. Nothing about the copy changes: the rendered text is
 * character-for-character identical, only the space between the last two words
 * stops being a breaking one.
 *
 * Guarded so it can't create a worse problem than it solves:
 *   - only elements of 4+ words (a short line can't widow)
 *   - only when the last two words together are short enough to sit on one
 *     line on a phone; joining "…comprehensive implementation" would push an
 *     over-long unbreakable run off a 320px screen
 *
 * Handles the case where the final word is wrapped in its own span, which is
 * how the design pages colour their highlight word.
 *
 * Idempotent: an element already ending in &nbsp; is skipped.
 *
 * Usage:  node scripts/fix-widows.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const DRY = process.argv.includes("--dry");

const TAGS = "h1|h2|h3|p";
/** Longest last-two-words run we're willing to make unbreakable. */
const MAX_RUN = 22;
/** Below this many words an element can't really widow. */
const MIN_WORDS = 4;

const plain = (s) => s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();

function join(inner) {
  if (/&nbsp;\s*(<[^>]+>)?\s*$/.test(inner)) return inner; // already done
  const words = plain(inner).split(/\s+/).filter(Boolean);
  if (words.length < MIN_WORDS) return inner;

  const lastTwo = words.slice(-2).join(" ");
  if (lastTwo.length > MAX_RUN) return inner;

  // (a) the tail is a coloured span:  … word <span …>final.</span>
  const spanTail = inner.match(/^([\s\S]*\S)(\s+)(<span\b[^>]*>[^<]*<\/span>\s*)$/);
  if (spanTail) return spanTail[1] + "&nbsp;" + spanTail[3];

  // (b) plain text tail:  … word final.
  const textTail = inner.match(/^([\s\S]*\S)(\s+)([^\s<]+\s*)$/);
  if (textTail) return textTail[1] + "&nbsp;" + textTail[3];

  return inner;
}

let changed = 0, files = 0;

for (const entry of fs.readdirSync(PUBLIC, { withFileTypes: true })) {
  const file = entry.isDirectory()
    ? path.join(PUBLIC, entry.name, "index.html")
    : entry.name === "index.html"
    ? path.join(PUBLIC, entry.name)
    : null;
  if (!file || !fs.existsSync(file)) continue;

  const before = fs.readFileSync(file, "utf8");
  const after = before.replace(
    new RegExp(`<(${TAGS})\\b([^>]*)>([\\s\\S]*?)</\\1>`, "gi"),
    (whole, tag, attrs, inner) => {
      const next = join(inner);
      if (next === inner) return whole;
      changed++;
      return `<${tag}${attrs}>${next}</${tag}>`;
    }
  );

  if (after !== before) {
    files++;
    if (!DRY) fs.writeFileSync(file, after);
  }
}

console.log(`${DRY ? "[dry run] " : ""}widows joined`);
console.log(`  elements changed : ${changed}`);
console.log(`  files changed    : ${files}`);
