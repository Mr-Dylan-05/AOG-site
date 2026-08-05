#!/usr/bin/env node
/**
 * mobile-fixups.js — tag the specific elements that break the mobile layout.
 *
 * The flattened design pages carry desktop geometry in inline styles. CSS can't
 * match on numeric values ("any height over 300px"), so the earlier attempt used
 * blanket rules — which hid content instead of reflowing it. This marks the
 * exact elements instead, and mobile.css then treats each class properly.
 *
 * Three classes, for three distinct failure modes seen on the live pages:
 *
 *   aog-m-autoh   Inline height/min-height of 300px or more. On a phone these
 *                 reserve a screenful of empty space — the hero left a large
 *                 dead gap below the copy because its container was locked to
 *                 500px regardless of what was inside it.
 *
 *   aog-m-stack   Absolutely-positioned elements that CONTAIN an image. These
 *                 were previously hidden outright when they sat off-canvas,
 *                 which is why images "went missing" on mobile. Making them
 *                 static lets them stack into the flow and stay visible.
 *
 *   aog-m-pill    A container with border-radius of 100px or more that is a
 *                 flex row. Once it wraps to multiple rows the huge radius
 *                 becomes a giant oval whose curve clips its own buttons —
 *                 which is what made the header look broken.
 *
 * Idempotent.
 *
 * Usage:  node scripts/mobile-fixups.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DRY = process.argv.includes("--dry");

function sources(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) sources(p, out);
    else if (/\.(html|njk)$/.test(e.name)) out.push(p);
  }
  return out;
}

/** Add a class to an opening tag, preserving any existing class attribute. */
function addClass(tag, cls) {
  if (new RegExp(`class="[^"]*\\b${cls}\\b`).test(tag)) return tag;
  return /class="/.test(tag)
    ? tag.replace(/class="/, `class="${cls} `)
    : tag.replace(/^<(\w+)/, `<$1 class="${cls}"`);
}

/** Find the matching close for the tag starting at `start`. */
function matchingEnd(html, start, tagName) {
  const re = new RegExp(`<${tagName}\\b|</${tagName}>`, "gi");
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(html)) !== null) {
    depth += m[0][1] === "/" ? -1 : 1;
    if (depth === 0) return m.index;
  }
  return -1;
}

let autoh = 0, stack = 0, pill = 0, corner = 0, filesTouched = 0;

for (const file of sources(path.join(ROOT, "public"))) {
  const before = fs.readFileSync(file, "utf8");
  let html = before;

  html = html.replace(/<(div|section|header|figure|aside)\b[^>]*style="[^"]*"[^>]*>/gi, (tag) => {
    const style = (tag.match(/style="([^"]*)"/) || [, ""])[1];
    let out = tag;

    // --- fixed heights that reserve dead space -------------------------
    const h = style.match(/(?:^|;)\s*(?:min-)?height:\s*(\d{3,4})px/);
    if (h && Number(h[1]) >= 300) { out = addClass(out, "aog-m-autoh"); autoh++; }

    // --- oversized pill radius on a wrapping flex row -------------------
    const r = style.match(/border-radius:\s*(\d{3,4})px/);
    if (r && Number(r[1]) >= 100 && /display:\s*flex/.test(style)) {
      out = addClass(out, "aog-m-pill"); pill++;
    }

    return out;
  });

  // --- small logo chips pinned to a card corner -------------------------
  // A 62-128px chip sits absolutely in a card's top corner while the card's
  // copy is centred and full-width. On a wide card the two never meet; at
  // 390px the heading runs straight under the chip, which is what clipped
  // "Ad On Workforce" on the division cards. Returning the chip to the flow
  // puts it above the copy instead.
  //
  // Width-capped at 140px so this only ever catches chips — never a hero
  // image that happens to be positioned.
  html = html.replace(
    /<(span|div)(\s+style="([^"]*position:\s*absolute[^"]*)")([^>]*)>(\s*<img\b)/gi,
    (whole, tag, styleAttr, style, rest, img) => {
      const w = style.match(/(?:^|;)\s*width:\s*(\d+)px/);
      if (!w || Number(w[1]) > 140) return whole;
      if (/aog-m-corner/.test(rest)) return whole;
      corner++;
      return `<${tag} class="aog-m-corner"${styleAttr}${rest}>${img}`;
    }
  );

  // --- absolutely-positioned wrappers that contain an image -------------
  // Done separately because it needs to look INSIDE the element.
  let idx = 0;
  while (true) {
    const m = html.slice(idx).match(/<div\b[^>]*style="[^"]*position:\s*absolute[^"]*"[^>]*>/i);
    if (!m) break;
    const at = idx + m.index;
    const end = matchingEnd(html, at, "div");
    const inner = end > at ? html.slice(at, end) : "";
    if (/<img\b/i.test(inner)) {
      const tagged = addClass(m[0], "aog-m-stack");
      if (tagged !== m[0]) {
        html = html.slice(0, at) + tagged + html.slice(at + m[0].length);
        stack++;
        idx = at + tagged.length;
        continue;
      }
    }
    idx = at + m[0].length;
  }

  if (html !== before) {
    filesTouched++;
    if (!DRY) fs.writeFileSync(file, html);
  }
}

console.log(`${DRY ? "[dry run] " : ""}mobile fixups`);
console.log(`  fixed-height containers tagged : ${autoh}`);
console.log(`  image wrappers tagged to stack : ${stack}`);
console.log(`  oversized pill radii tagged    : ${pill}`);
console.log(`  corner logo chips tagged       : ${corner}`);
console.log(`  files changed                  : ${filesTouched}`);
