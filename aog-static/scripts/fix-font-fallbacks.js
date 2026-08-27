#!/usr/bin/env node
/**
 * fix-font-fallbacks.js — stop the page flashing serif while Manrope loads.
 *
 * The export declares its font two ways. Most rules say
 * "Manrope, Arial, sans-serif"; a number say bare "Manrope", usually inside a
 * font: shorthand. Every @font-face is font-display:swap, so until Manrope
 * arrives the browser renders the fallback, and for a bare family name the
 * fallback is the browser default, which is Times. The FAQ questions are the
 * clearest case: the button and its <b> compute to "Manrope" with nothing
 * after it, so they render serif on a cold load while the headings around
 * them, which have the full stack, do not.
 *
 * That is what "the fonts have gone strange" is. It is not a broken file:
 * every woff2 returns 200 and all six faces load. It is the swap window, and
 * on a slow connection or a cache miss it is visible for as long as the font
 * takes to arrive.
 *
 * This finds every selector whose declared family is bare Manrope and restates
 * it with a real stack. It is generated from the page's own CSS rather than
 * hardcoded, so a re-export with different selectors is still covered.
 *
 * Arial is the fallback the export itself uses elsewhere, so the swap is
 * between two sans faces of similar width rather than a jump to serif.
 *
 * Idempotent: replaces its own block.
 *
 * Usage:  node scripts/fix-font-fallbacks.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PAGE = path.join(ROOT, "public", "ai-training", "index.html");
const STACK = 'Manrope,"Helvetica Neue",Arial,sans-serif';

let html = fs.readFileSync(PAGE, "utf8");
html = html.replace(/<style id="font-fallback-style">[\s\S]*?<\/style>/, "");

const css = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || []).join("\n");

/**
 * The part of a selector after the export's own "html:root...:root body main"
 * prefix. Without this the generated rule reads
 * "html:root... body main html:root... body main .how h2:before", which puts
 * an <html> inside a <main> and therefore matches nothing at all. That is why
 * a first version of this script fixed the FAQ, whose selectors were added by
 * hand, and silently did nothing for every selector it found by scanning.
 */
function tail(sel) {
  const s = sel.trim();
  const i = s.lastIndexOf(" body main ");
  const out = i === -1 ? s : s.slice(i + " body main ".length).trim();
  return /(^|\s)html\b/.test(out) ? "" : out;
}

const selectors = new Set();
/**
 * Selectors the export deliberately sets in Georgia. Some of them ALSO have a
 * bare-Manrope rule elsewhere in the file, so scanning alone sweeps them in and
 * the override turns "ONGOING SUPPORT." from italic serif into sans. Anything
 * that asks for a serif anywhere is left alone.
 */
const serifOnPurpose = new Set();
const ruleRe = /([^{}]{1,400})\{([^}]*)\}/g;
let m;
while ((m = ruleRe.exec(css))) {
  const sel = m[1].trim();
  const body = m[2];
  if (!sel || sel.startsWith("@") || sel.includes("@font-face")) continue;

  // font-family: Manrope   (nothing after it)
  const fam = /font-family\s*:\s*["']?Manrope["']?\s*(!important)?\s*(;|$)/.test(body);

  // font: <stuff> Manrope  (family is last in the shorthand, so no fallback)
  let short = false;
  const sh = body.match(/font\s*:\s*([^;}]+)/g) || [];
  for (const s of sh) {
    const val = s.replace(/^font\s*:\s*/, "").replace(/!important/g, "").trim();
    if (/Manrope$/i.test(val)) short = true;
  }

  if (/Georgia|(^|[\s:,])serif/i.test(body)) {
    sel.split(",").forEach((x) => { const t = tail(x); if (t) serifOnPurpose.add(t); });
  }

  if (fam || short) {
    sel.split(",").forEach((s) => {
      const t = tail(s);
      if (t) selectors.add(t);
    });
  }
}

// The FAQ button inherits bare Manrope without a rule of its own that a scan
// can see, so it is named directly.
["button", ".faq-item button", ".faq-item b"].forEach((s) => selectors.add(s));

for (const s of serifOnPurpose) selectors.delete(s);

if (!selectors.size) {
  console.log("  no bare-Manrope declarations found, nothing to do");
  process.exit(0);
}

/* Deeper than anything in the file, which tops out at 61 repetitions. */
const DEEP = "html" + ":root".repeat(64) + " body main";
const rules = [...selectors]
  .map((s) => `${DEEP} ${s}{font-family:${STACK}!important}`)
  .join("\n        ");

const BLOCK = `<style id="font-fallback-style">
        ${rules}
      </style>`;

const headEnd = html.indexOf("</head>");
if (headEnd === -1) throw new Error("no </head> on the page");
html = html.slice(0, headEnd) + BLOCK + html.slice(headEnd);

fs.writeFileSync(PAGE, html);
console.log(`  font fallbacks: ${selectors.size} selectors given a full stack`);
