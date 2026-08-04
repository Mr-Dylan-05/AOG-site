#!/usr/bin/env node
/**
 * fix-dead-ctas.js — point call-to-action buttons that go nowhere at the
 * contact page.
 *
 * Two kinds, both invisible to a link checker because an anchor is technically
 * a valid href:
 *
 *  1. CIRCULAR. The homepage's closing "Contact us →" button sits *inside* the
 *     #contact section and links to #contact. Clicking it scrolls to where the
 *     visitor already is, so the site's final call to action does nothing. The
 *     same pattern appears on the division pages.
 *
 *  2. EMPTY. "Enquire Now" on /grant-offer/ links to "#" — a placeholder that
 *     was never filled in.
 *
 * Both are repointed at /contact-us/, which is a real page with a working form.
 *
 * NOT touched: anchor links that genuinely scroll somewhere else (the header
 * "Contact" and "Book a call" buttons sit outside the section they target, so
 * they work as intended), and the two /media/ links whose destinations are
 * external news coverage nobody has supplied URLs for.
 *
 * Idempotent.
 *
 * Usage:  node scripts/fix-dead-ctas.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const PAGES_SRC = path.join(ROOT, "src", "pages");
const DRY = process.argv.includes("--dry");
const TARGET = "/contact-us/";

function files(dir, ext, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files(p, ext, out);
    else if (e.name.endsWith(ext)) out.push(p);
  }
  return out;
}

/** Locate the #contact section so we can tell "inside" from "outside". */
function contactRange(html) {
  const idAt = html.search(/id="contact"/);
  if (idAt === -1) return null;
  // Walk back to the opening tag, then forward matching the element.
  const open = html.lastIndexOf("<", idAt);
  const tag = (html.slice(open + 1).match(/^([a-z]+)/i) || [])[1];
  if (!tag) return null;
  const re = new RegExp(`<${tag}\\b|</${tag}>`, "gi");
  re.lastIndex = open;
  let depth = 0, m;
  while ((m = re.exec(html)) !== null) {
    depth += m[0][1] === "/" ? -1 : 1;
    if (depth === 0) return [open, m.index + m[0].length];
  }
  return null;
}

let circular = 0, empty = 0, filesChanged = 0;

for (const file of [...files(PUBLIC, ".html"), ...files(PAGES_SRC, ".njk")]) {
  const before = fs.readFileSync(file, "utf8");
  let html = before;

  // --- 1. circular #contact links -----------------------------------------
  const range = contactRange(html);
  if (range) {
    const [s, e] = range;
    const section = html.slice(s, e);
    const fixed = section.replace(
      /href="#contact"/g,
      () => { circular++; return `href="${TARGET}"`; }
    );
    if (fixed !== section) html = html.slice(0, s) + fixed + html.slice(e);
  }

  // --- 2. placeholder "#" buttons -----------------------------------------
  html = html.replace(
    /href="#"([^>]*)>(\s*Enquire Now\s*)<\/a>/g,
    (m, attrs, text) => { empty++; return `href="${TARGET}"${attrs}>${text}</a>`; }
  );

  if (html !== before) {
    filesChanged++;
    if (!DRY) fs.writeFileSync(file, html);
  }
}

console.log(`${DRY ? "[dry run] " : ""}dead call-to-action links`);
console.log(`  circular #contact buttons repointed : ${circular}`);
console.log(`  empty "#" buttons repointed         : ${empty}`);
console.log(`  files changed                       : ${filesChanged}`);
