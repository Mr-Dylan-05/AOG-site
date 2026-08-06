#!/usr/bin/env node
/**
 * flatten-gradient-text.js — solid heading colour instead of gradient text.
 *
 * The design pages colour their highlight words with a gradient clipped to the
 * glyphs (`background-clip:text` + `color:transparent`), usually with a
 * shimmer animation sweeping across it and sometimes a drop-shadow glow.
 *
 * Three problems with that, all raised in the design review:
 *
 *   - It reads as a different visual language from the rest of the site, which
 *     uses flat black and one blue.
 *   - The glow is what looks like a drop shadow on text. There is no
 *     `text-shadow` anywhere on the site — this is it.
 *   - Clipped-gradient text is laid out as a single unbreakable painted box in
 *     some engines, which is why "3 countries" was breaking oddly.
 *
 * Replacement colour is picked from the gradient's own stops so nothing shifts
 * hue: a gradient built on the near-black brand ink stays black, everything
 * else becomes Ad On Group blue. The AI pages used their own indigo (#2F6FED)
 * and a pale blue on dark sections; the review asked for AOG blue, so those
 * come across too.
 *
 * Idempotent: a style with no background-clip:text is left alone.
 *
 * Usage:  node scripts/flatten-gradient-text.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const DRY = process.argv.includes("--dry");

const AOG_BLUE = "#1BABE5";
const AOG_INK = "#0B1220";

/** What this gradient should collapse to. */
function solidFor(style) {
  const grad = (style.match(/linear-gradient\(([^)]*)\)/) || [, ""])[1];
  // A sheen sweeping across dark text: the ends are the ink colour and only
  // the middle lifts to blue. That one is black text, not blue text.
  const stops = grad.match(/#[0-9a-f]{3,8}/gi) || [];
  if (stops.length && stops[0].toUpperCase() === AOG_INK) return AOG_INK;
  return AOG_BLUE;
}

/** Strip the gradient machinery out of one style attribute. */
function flatten(style) {
  const solid = solidFor(style);
  let out = style
    .replace(/(?:^|;)\s*background\s*:\s*linear-gradient\([^)]*\)\s*(?=;|$)/gi, ";")
    .replace(/(?:^|;)\s*background-size\s*:[^;]*/gi, ";")
    .replace(/(?:^|;)\s*-webkit-background-clip\s*:\s*text\s*(?=;|$)/gi, ";")
    .replace(/(?:^|;)\s*background-clip\s*:\s*text\s*(?=;|$)/gi, ";")
    // the shimmer only exists to animate the gradient
    .replace(/(?:^|;)\s*animation\s*:\s*adonShimmer[^;]*/gi, ";")
    // the glow that reads as a text drop shadow
    .replace(/(?:^|;)\s*filter\s*:\s*drop-shadow\([^)]*\)\s*(?=;|$)/gi, ";")
    .replace(/color\s*:\s*transparent/gi, `color:${solid}`);

  // tidy the semicolons we left behind
  out = out.replace(/;{2,}/g, ";").replace(/^;|;$/g, "").trim();
  // if the span only ever had colour via the gradient, make sure it has one
  if (!/(?:^|;)\s*color\s*:/i.test(out)) out = (out ? out + ";" : "") + `color:${solid}`;
  return out;
}

/**
 * Strip a drop-shadow glow from text elements.
 *
 * Separate pass because these sit on spans that were already a solid colour,
 * so the gradient pass never saw them. Scoped to text-bearing tags — a
 * drop-shadow on an icon or an image may well be deliberate, and this is a
 * "remove drop shadows from all text" instruction, not from everything.
 */
const TEXT_TAGS = "span|h1|h2|h3|h4|h5|h6|p|strong|em|b|i|a|li";
function stripTextGlow(html) {
  let n = 0;
  const out = html.replace(
    new RegExp(`<(${TEXT_TAGS})\\b([^>]*?)style="([^"]*)"`, "gi"),
    (whole, tag, pre, style) => {
      if (!/drop-shadow\(/i.test(style)) return whole;
      let s = style
        .replace(/(?:^|;)\s*filter\s*:\s*drop-shadow\([^)]*\)\s*(?=;|$)/gi, ";")
        // a filter list that also holds other functions: drop the shadow only
        .replace(/drop-shadow\([^)]*\)\s*/gi, "")
        .replace(/(?:^|;)\s*filter\s*:\s*(?=;|$)/gi, ";")
        .replace(/;{2,}/g, ";")
        .replace(/^;|;$/g, "")
        .trim();
      if (s === style) return whole;
      n++;
      return `<${tag}${pre}style="${s}"`;
    }
  );
  return [out, n];
}

let spans = 0, files = 0, glows = 0;
const byColour = { [AOG_BLUE]: 0, [AOG_INK]: 0 };

for (const entry of fs.readdirSync(PUBLIC, { withFileTypes: true })) {
  const file = entry.isDirectory()
    ? path.join(PUBLIC, entry.name, "index.html")
    : entry.name === "index.html"
    ? path.join(PUBLIC, entry.name)
    : null;
  if (!file || !fs.existsSync(file)) continue;

  const before = fs.readFileSync(file, "utf8");
  let after = before.replace(/style="([^"]*background-clip\s*:\s*text[^"]*)"/gi, (whole, style) => {
    const next = flatten(style);
    if (next === style) return whole;
    spans++;
    byColour[solidFor(style)]++;
    return `style="${next}"`;
  });
  const [stripped, n] = stripTextGlow(after);
  after = stripped;
  glows += n;

  if (after !== before) {
    files++;
    if (!DRY) fs.writeFileSync(file, after);
  }
}

console.log(`${DRY ? "[dry run] " : ""}gradient text flattened`);
console.log(`  spans changed        : ${spans}`);
console.log(`    -> ${AOG_BLUE} (blue) : ${byColour[AOG_BLUE]}`);
console.log(`    -> ${AOG_INK} (ink)  : ${byColour[AOG_INK]}`);
console.log(`  text glows removed   : ${glows}`);
console.log(`  files changed        : ${files}`);
