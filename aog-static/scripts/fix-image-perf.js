#!/usr/bin/env node
/**
 * fix-image-perf.js — layout shift and image weight.
 *
 * Two problems, both measurable:
 *
 *   1. 263 of 830 <img> tags carry no width/height, so the browser cannot
 *      reserve space before the image arrives and the page jumps as each one
 *      lands. That is the most common cause of a poor CLS score.
 *
 *   2. 303 PNGs against 115 JPEGs and no AVIF at all. PNG is a lossless format
 *      meant for flat graphics; used for a photograph it is several times the
 *      size of an equivalent JPEG. The heaviest single asset on the site is
 *      aow-why-crop.png at 1.9MB.
 *
 * The dimensions come from the files themselves, read out of the PNG/JPEG/WebP
 * headers, so they are the true intrinsic size rather than a guess. Only
 * width/height are added; nothing about how an image displays changes, because
 * the CSS already sizes them.
 *
 * Conversion is deliberately narrow. It only touches /assets/design/, whose
 * files are new and have no legacy URL, and it skips anything with an alpha
 * channel or where JPEG saves too little to be worth it.
 *
 * Converted files are RENAMED to .jpg and every reference is updated. Writing
 * JPEG bytes into a .png path would be the easy way to keep links working, and
 * it would break the site: vercel.json sets X-Content-Type-Options: nosniff, so
 * the file would be served as image/png and the browser would refuse it.
 *
 * /assets/media/ is left alone on purpose. Those files have matching
 * /wp-content/uploads/ paths that old inbound links and Google Images still
 * resolve through, so renaming them needs a redirect per file — a separate
 * decision, worth about 17MB.
 *
 * Idempotent.
 *
 * Usage:  node scripts/fix-image-perf.js [--dry] [--skip-convert]
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const SRC_PAGES = path.join(ROOT, "src");
const DRY = process.argv.includes("--dry");
const SKIP_CONVERT = process.argv.includes("--skip-convert");

/* ------------------------------------------------------------------ sizing */

/** Intrinsic dimensions straight from the file header. */
function dimensions(file) {
  let buf;
  try { buf = fs.readFileSync(file); } catch { return null; }

  // PNG: IHDR is always the first chunk.
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  // GIF
  if (buf.length > 10 && buf.slice(0, 3).toString("latin1") === "GIF") {
    return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
  }
  // WebP (VP8X / VP8 / VP8L)
  if (buf.length > 30 && buf.slice(0, 4).toString("latin1") === "RIFF" &&
      buf.slice(8, 12).toString("latin1") === "WEBP") {
    const fmt = buf.slice(12, 16).toString("latin1");
    if (fmt === "VP8X") return { w: (buf.readUIntLE(24, 3) & 0xffffff) + 1, h: (buf.readUIntLE(27, 3) & 0xffffff) + 1 };
    if (fmt === "VP8 ") return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
    if (fmt === "VP8L") {
      const b = buf.readUInt32LE(21);
      return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
    }
  }
  // SVG: no pixel header, so take the viewBox (or an explicit width/height).
  if (buf.slice(0, 400).toString("latin1").includes("<svg")) {
    const head = buf.slice(0, 2000).toString("latin1");
    const vb = head.match(/viewBox="[\d.\-]+\s+[\d.\-]+\s+([\d.]+)\s+([\d.]+)"/i);
    if (vb) return { w: Math.round(+vb[1]), h: Math.round(+vb[2]) };
    const w = head.match(/\bwidth="([\d.]+)/i), h = head.match(/\bheight="([\d.]+)/i);
    if (w && h) return { w: Math.round(+w[1]), h: Math.round(+h[1]) };
    return null;
  }
  // JPEG: walk the segments to the first frame header.
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}

function htmlFiles(dir, ext, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, ext, out);
    else if (ext.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

let added = 0, noSize = 0, unresolved = new Set();

for (const file of [...htmlFiles(PUBLIC, [".html"]), ...htmlFiles(SRC_PAGES, [".njk"])]) {
  const before = fs.readFileSync(file, "utf8");
  const out = before.replace(/<img\b[^>]*>/g, (tag) => {
    if (/\bwidth\s*=/.test(tag) && /\bheight\s*=/.test(tag)) return tag;
    const m = tag.match(/\bsrc="([^"]+)"/);
    if (!m || !m[1].startsWith("/")) return tag;               // leave data: and remote
    const asset = path.join(PUBLIC, m[1].replace(/^\//, "").split("?")[0]);
    const d = dimensions(asset);
    if (!d || !d.w || !d.h) { noSize++; unresolved.add(m[1]); return tag; }
    added++;
    // Insert before the closing bracket, preserving any self-closing slash.
    return tag.replace(/\s*\/?>$/, (end) =>
      ` width="${d.w}" height="${d.h}"${end.trim().startsWith("/") ? " />" : ">"}`);
  });
  if (out !== before && !DRY) fs.writeFileSync(file, out);
}

/* -------------------------------------------------------------- conversion */

/**
 * Does this PNG carry transparency? JPEG has no alpha channel, so flattening
 * one would paint the transparent areas black. Read it from the format rather
 * than guessing from the filename: IHDR colour type 4 and 6 carry an alpha
 * channel outright, and a palette image can carry one via a tRNS chunk.
 */
function hasAlpha(file) {
  const buf = fs.readFileSync(file);
  if (buf.length < 26 || buf.readUInt32BE(0) !== 0x89504e47) return false;
  const colourType = buf[25];
  if (colourType === 4 || colourType === 6) return true;
  return buf.slice(0, 4096).includes(Buffer.from("tRNS"));
}

let converted = 0, keptPng = 0, keptAlpha = 0, savedBytes = 0;
const renamed = [];

if (!SKIP_CONVERT) {
  // Only /assets/design/. Those are new assets with no legacy URL, so the file
  // can be renamed. Everything under /assets/media/ keeps a matching
  // /wp-content/uploads/ path that old inbound links and Google Images still
  // use, and renaming those would break them — see the note printed at the end.
  //
  // The extension has to change. vercel.json sets X-Content-Type-Options:
  // nosniff, so a JPEG served from a .png path would be sent as image/png and
  // the browser would refuse to render it.
  const designDir = path.join(PUBLIC, "assets", "design");
  const refFiles = [...htmlFiles(PUBLIC, [".html"]), ...htmlFiles(SRC_PAGES, [".njk", ".css"]),
                    ...htmlFiles(path.join(ROOT, "src", "assets"), [".css"])];

  for (const png of htmlFiles(designDir, [".png"])) {
    const size = fs.statSync(png).size;
    if (size < 150 * 1024) continue;
    if (hasAlpha(png)) { keptAlpha++; continue; }

    const jpg = png.replace(/\.png$/i, ".jpg");
    const tmp = jpg + ".tmp";
    try {
      execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "82",
                            png, "--out", tmp], { stdio: "pipe" });
    } catch { continue; }

    const newSize = fs.statSync(tmp).size;
    if (newSize >= size * 0.6) { keptPng++; fs.unlinkSync(tmp); continue; }

    const from = "/" + path.relative(PUBLIC, png).split(path.sep).join("/");
    const to = "/" + path.relative(PUBLIC, jpg).split(path.sep).join("/");
    let refs = 0;
    for (const f of refFiles) {
      const before = fs.readFileSync(f, "utf8");
      if (!before.includes(from)) continue;
      refs += before.split(from).length - 1;
      if (!DRY) fs.writeFileSync(f, before.split(from).join(to));
    }

    savedBytes += size - newSize;
    converted++;
    renamed.push({ from, to, refs, kb: Math.round((size - newSize) / 1024) });
    if (DRY) fs.unlinkSync(tmp);
    else { fs.renameSync(tmp, jpg); fs.unlinkSync(png); }
  }
}

console.log(`${DRY ? "[dry run] " : ""}image performance`);
console.log(`  width/height added        : ${added}`);
if (noSize) {
  console.log(`  could not size           : ${noSize} (${unresolved.size} distinct)`);
  [...unresolved].slice(0, 5).forEach((u) => console.log(`      ${u}`));
}
if (!SKIP_CONVERT) {
  console.log(`  design PNGs -> JPEG      : ${converted}`);
  renamed.forEach((r) => console.log(`      ${r.from}  ->  ${r.to}   (-${r.kb}KB, ${r.refs} refs updated)`));
  console.log(`  left as PNG (transparent): ${keptAlpha}`);
  console.log(`  left as PNG (little gain): ${keptPng}`);
  console.log(`  saved                    : ${(savedBytes / 1024 / 1024).toFixed(1)}MB`);
}
