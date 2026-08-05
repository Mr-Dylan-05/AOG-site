#!/usr/bin/env node
/**
 * unify-header.js — one header, the Ad On Group one, on every page.
 *
 * This is the Ad On Group site, but it was assembled from three separate design
 * exports and each brought its own navigation. The result: click into a
 * division and the header silently became that division's header, with its own
 * logo, its own menu and its own idea of where "Contact" goes.
 *
 *     86 pages   Ad On Group (the Eleventy template header)
 *     18 pages   Ad On Workforce  — wrong brand
 *     12 pages   Ad On Group (the design header)  <- the one we keep
 *      8 pages   Ad On AI         — wrong brand
 *
 * The design header is the one to standardise on: it is the full Ad On Group
 * bar the site was designed around — logo, About, Divisions, phone, Contact —
 * and it already points Contact at the page that actually has the form.
 *
 * Two fixes travel with it:
 *   - The wordmark used HAIR SPACE (&#8202;) between the words, which renders
 *     as "AdOnGroup". Ad On Group is three words; this uses real spaces.
 *   - Contact goes to /contact-us/ (the page with the form) rather than
 *     /contact/ (address and a map, no form) or /#contact (the bottom of the
 *     homepage, also no form).
 *
 * Idempotent: re-running finds the canonical bar already in place.
 *
 * Usage:  node scripts/unify-header.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const DRY = process.argv.includes("--dry");

/** Source of truth for the bar. */
const SOURCE = path.join(PUBLIC, "ad-on-digital", "index.html");
const MARK = "data-aog-header";

/** Balanced-tag slice starting at `start`. */
function element(html, start, tag) {
  const re = new RegExp(`<${tag}\\b|</${tag}>`, "gi");
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(html)) !== null) {
    depth += m[0][1] === "/" ? -1 : 1;
    if (depth === 0) return html.slice(start, m.index + m[0].length);
  }
  return null;
}

/** The first <nav> in the body — the site bar on these pages. */
function navOf(html) {
  const body = html.indexOf("<body");
  const at = html.indexOf("<nav", body === -1 ? 0 : body);
  if (at === -1) return null;
  const el = element(html, at, "nav");
  return el ? { at, html: el } : null;
}

/* ------------------------------------------------- build the canonical bar */

const src = fs.readFileSync(SOURCE, "utf8");
const found = navOf(src);
if (!found) {
  console.error("could not read the canonical nav from", SOURCE);
  process.exit(1);
}

let CANON = found.html
  // "AdOnGroup" -> "Ad On Group". Hair spaces are for kerning inside a word,
  // not for separating three of them.
  .replace(/Ad&#8202;On&#8202;Group/g, "Ad On Group")
  // Contact must reach the form, wherever it is linked from.
  .replace(/href="\/contact\/"/g, 'href="/contact-us/"')
  .replace(/href="\/#contact"/g, 'href="/contact-us/"');

if (!CANON.includes(MARK)) CANON = CANON.replace(/^<nav/, `<nav ${MARK}`);

/** The dropdown behaviour the bar needs, for pages whose CSS lacks it. */
const NAV_CSS = `
  .nav-prog { position: relative; }
  .nav-menu { opacity: 0; pointer-events: none; transform: translateY(6px); transition: opacity .18s ease, transform .18s ease; }
  .nav-prog:hover .nav-menu, .nav-menu:hover { opacity: 1; pointer-events: auto; transform: none; }
`;

/* ------------------------------------------------------------------ apply */

let replaced = 0, cssAdded = 0, already = 0, skipped = [];

const pages = fs
  .readdirSync(PUBLIC, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => path.join(PUBLIC, e.name, "index.html"))
  .filter((f) => fs.existsSync(f));
if (fs.existsSync(path.join(PUBLIC, "index.html"))) pages.push(path.join(PUBLIC, "index.html"));

for (const file of pages) {
  const before = fs.readFileSync(file, "utf8");
  const nav = navOf(before);
  if (!nav) { skipped.push(path.relative(PUBLIC, file) + " (no <nav>)"); continue; }

  let html = before;

  if (nav.html.includes(MARK)) {
    already++;
  } else {
    html = html.slice(0, nav.at) + CANON + html.slice(nav.at + nav.html.length);
    replaced++;
  }

  // The bar's dropdowns need .nav-prog/.nav-menu. Most design pages define it
  // already; any that don't would ship a permanently-open menu.
  if (!/\.nav-prog\s*\{/.test(html)) {
    if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, `<style>${NAV_CSS}</style>\n</head>`);
      cssAdded++;
    }
  }

  if (html !== before && !DRY) fs.writeFileSync(file, html);
}

console.log(`${DRY ? "[dry run] " : ""}header unification`);
console.log(`  pages given the Ad On Group bar : ${replaced}`);
console.log(`  already canonical              : ${already}`);
console.log(`  dropdown CSS added             : ${cssAdded}`);
if (skipped.length) {
  console.log(`  skipped                        : ${skipped.length}`);
  skipped.forEach((s) => console.log(`      ${s}`));
}
