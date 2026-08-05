#!/usr/bin/env node
/**
 * audit-images.js — find every image on the built site that will not render.
 *
 * Written after a round of "the media is broken everywhere" that the existing
 * checker missed, because check-assets.js only looks at <img src> in the
 * SOURCE. Images break in more ways than that, so this one works on the BUILT
 * output (_site) and covers every way a page can ask for an image:
 *
 *   <img src>            <img srcset>          <source src|srcset>
 *   <link rel=icon>      <meta og:image>       <meta twitter:image>
 *   inline background-image / background: url()
 *   url() inside .css files
 *   <image href> / xlink:href inside inline SVG
 *   JSON-LD "image" / "logo" / "contentUrl"
 *
 * and then classifies each reference:
 *
 *   MISSING      resolves to no file on disk -> renders as a broken icon
 *   EMPTY        src="" or src="#" -> browser re-requests the page as an image
 *   PLACEHOLDER  our generated grey stand-in (cyan accent bar at the top)
 *   OFFSITE      absolute URL to a host we don't control (the old WordPress
 *                boxes especially — those die when the install is turned off)
 *   CORRUPT      file exists but is zero-byte or not decodable as an image
 *
 * Usage:  node scripts/audit-images.js [--json] [--quiet]
 * Exit:   1 if anything renders broken (MISSING/EMPTY/CORRUPT/PLACEHOLDER)
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const SITE = path.join(ROOT, "_site");
const JSON_OUT = process.argv.includes("--json");
const QUIET = process.argv.includes("--quiet");

const IMG_EXT = /\.(jpe?g|png|gif|webp|svg|avif|bmp|ico|tiff?)$/i;

/* Hosts that were part of the WordPress estate. A reference to one of these is
 * a live dependency on a box that is being decommissioned. */
const LEGACY_HOST =
  /(adondevelopment\.com|kxcdn\.com|wp\.com|gravatar\.com|adongroup\.com\.au\/wp-)/i;

function walk(dir, test, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, test, out);
    else if (test(e.name)) out.push(p);
  }
  return out;
}

/* ---------------------------------------------------------------- extraction */

/** Every image URL a single HTML document asks for, with how it asked. */
function refsFromHtml(html) {
  const found = [];
  const add = (url, kind) => {
    if (url === undefined || url === null) return;
    found.push({ url: String(url).trim(), kind });
  };

  // <img src> / <input type=image src>
  for (const m of html.matchAll(/<(?:img|input)\b[^>]*?\ssrc=(["'])(.*?)\1/gi))
    add(m[2], "img[src]");

  // src with no quotes at all — rarer, but it happens in flattened exports
  for (const m of html.matchAll(/<img\b[^>]*?\ssrc=([^\s"'>]+)/gi))
    add(m[1], "img[src]");

  // srcset on <img> and <source>: "a.jpg 1x, b.jpg 2x"
  for (const m of html.matchAll(/\ssrcset=(["'])(.*?)\1/gi))
    for (const cand of m[2].split(","))
      add(cand.trim().split(/\s+/)[0], "srcset");

  // <source src> inside <picture>/<video>
  for (const m of html.matchAll(/<source\b[^>]*?\ssrc=(["'])(.*?)\1/gi))
    add(m[2], "source[src]");

  // poster frames
  for (const m of html.matchAll(/\sposter=(["'])(.*?)\1/gi)) add(m[2], "poster");

  // favicons / touch icons
  for (const m of html.matchAll(/<link\b[^>]*?rel=(["'])[^"']*icon[^"']*\1[^>]*>/gi)) {
    const href = m[0].match(/href=(["'])(.*?)\1/i);
    if (href) add(href[2], "link[icon]");
  }

  // social preview images
  for (const m of html.matchAll(
    /<meta\b[^>]*?(?:property|name)=(["'])(og:image(?::secure_url)?|twitter:image)\1[^>]*>/gi
  )) {
    const c = m[0].match(/content=(["'])(.*?)\1/i);
    if (c) add(c[2], `meta[${m[2]}]`);
  }

  // inline background-image / background shorthand
  for (const m of html.matchAll(/url\((["']?)([^"')]+)\1\)/gi))
    add(m[2], "css url()");

  // inline SVG <image href> / xlink:href
  for (const m of html.matchAll(/<image\b[^>]*?\s(?:xlink:)?href=(["'])(.*?)\1/gi))
    add(m[2], "svg image");

  // JSON-LD image fields
  for (const m of html.matchAll(
    /"(?:image|logo|contentUrl|thumbnailUrl)"\s*:\s*"([^"]+)"/gi
  ))
    add(m[1], "json-ld");

  return found;
}

/** url() references inside a stylesheet. */
function refsFromCss(css) {
  const found = [];
  for (const m of css.matchAll(/url\((["']?)([^"')]+)\1\)/gi))
    found.push({ url: m[2].trim(), kind: "css url()" });
  return found;
}

/* --------------------------------------------------------------- resolution */

/** Where a URL lands on disk, or null if it isn't ours to resolve. */
function resolveLocal(url, fromFile) {
  if (/^(data:|blob:|mailto:|tel:|javascript:|#)/i.test(url)) return null;
  if (/^(https?:)?\/\//i.test(url)) return null; // absolute — handled separately
  const clean = url.replace(/[?#].*$/, "").replace(/&(amp|quot|#0?39);.*$/, "");
  if (!clean) return null;
  return clean.startsWith("/")
    ? path.join(SITE, clean)
    : path.resolve(path.dirname(fromFile), clean);
}

/* ------------------------------------------------------- file-level checks */

/**
 * Batch-classify image files with Pillow: placeholder / corrupt / ok.
 *
 * One python process for the whole set rather than one per file — the earlier
 * per-file version took minutes on a few hundred images.
 */
function inspectFiles(files) {
  if (!files.length) return {};
  const listing = path.join(ROOT, ".image-audit-list.txt");
  fs.writeFileSync(listing, files.join("\n"));
  const py = `
import sys, json
from PIL import Image
out = {}
for line in open(sys.argv[1], encoding="utf8").read().splitlines():
    if not line: continue
    try:
        im = Image.open(line)
        im.load()
        rgb = im.convert("RGB")
        w, h = rgb.size
        # our stand-in generator paints a cyan bar across the very top
        top = rgb.getpixel((w // 2, 1))
        placeholder = all(abs(top[i] - c) < 12 for i, c in enumerate((27, 171, 229)))
        # a flat single-colour image is almost never real content
        small = rgb.resize((8, 8))
        px = list(small.getdata())
        flat = max(max(p) - min(p) for p in px) < 4 and len(set(px)) <= 2
        out[line] = {"status": "placeholder" if placeholder else "ok",
                     "w": w, "h": h, "flat": flat}
    except Exception as e:
        out[line] = {"status": "corrupt", "error": str(e)[:120]}
print(json.dumps(out))
`;
  try {
    const res = execFileSync("python3", ["-c", py, listing], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
    return JSON.parse(res);
  } catch (e) {
    console.warn("[audit] Pillow inspection unavailable:", e.message.split("\n")[0]);
    return {};
  } finally {
    fs.unlinkSync(listing);
  }
}

/* -------------------------------------------------------------------- main */

const htmlFiles = walk(SITE, (n) => n.endsWith(".html"));
const cssFiles = walk(SITE, (n) => n.endsWith(".css"));

const problems = []; // {page, url, kind, type, detail}
const localTargets = new Set();
const refCount = new Map(); // disk path -> times referenced

function record(page, url, kind, type, detail) {
  problems.push({ page, url, kind, type, detail });
}

function processRefs(file, refs) {
  const page = path.relative(SITE, file);
  for (const { url, kind } of refs) {
    // src="" / src="#" — the browser resolves this to the page itself and
    // downloads the whole HTML document as an image.
    if (url === "" || url === "#") {
      record(page, url || "(empty)", kind, "EMPTY", "empty src attribute");
      continue;
    }
    if (/^(data:|blob:|mailto:|tel:|javascript:)/i.test(url)) continue;

    if (/^(https?:)?\/\//i.test(url)) {
      const host = (url.match(/^(?:https?:)?\/\/([^/]+)/) || [, ""])[1];
      if (LEGACY_HOST.test(url)) {
        record(page, url, kind, "OFFSITE", `legacy host ${host}`);
      } else if (/adongroup\.com\.au/i.test(host)) {
        // our own canonical host — fine for meta tags, and it resolves
      } else if (IMG_EXT.test(url.replace(/[?#].*$/, ""))) {
        record(page, url, kind, "OFFSITE", `third-party host ${host}`);
      }
      continue;
    }

    const disk = resolveLocal(url, file);
    if (!disk) continue;
    // Only judge things that look like images; url() also carries fonts.
    if (!IMG_EXT.test(disk) && kind !== "img[src]" && kind !== "srcset") continue;
    if (!IMG_EXT.test(disk)) {
      record(page, url, kind, "MISSING", "not an image extension");
      continue;
    }

    if (!fs.existsSync(disk)) {
      record(page, url, kind, "MISSING", "no file at " + path.relative(SITE, disk));
      continue;
    }
    localTargets.add(disk);
    refCount.set(disk, (refCount.get(disk) || 0) + 1);
  }
}

for (const f of htmlFiles) processRefs(f, refsFromHtml(fs.readFileSync(f, "utf8")));
for (const f of cssFiles) processRefs(f, refsFromCss(fs.readFileSync(f, "utf8")));

// zero-byte check is cheap and catches truncated copies
const zero = [];
const raster = [];
for (const t of localTargets) {
  const size = fs.statSync(t).size;
  if (size === 0) zero.push(t);
  else if (!/\.svg$/i.test(t)) raster.push(t);
}

const inspected = inspectFiles(raster);

// Map disk path -> the pages that reference it, so a bad file names its pages.
const pagesFor = new Map();
for (const f of [...htmlFiles, ...cssFiles]) {
  const refs = f.endsWith(".css")
    ? refsFromCss(fs.readFileSync(f, "utf8"))
    : refsFromHtml(fs.readFileSync(f, "utf8"));
  for (const { url } of refs) {
    const disk = resolveLocal(url, f);
    if (!disk || !localTargets.has(disk)) continue;
    if (!pagesFor.has(disk)) pagesFor.set(disk, new Set());
    pagesFor.get(disk).add(path.relative(SITE, f));
  }
}

for (const t of zero)
  record([...(pagesFor.get(t) || ["?"])][0], "/" + path.relative(SITE, t), "file", "CORRUPT", "zero-byte file");

for (const [file, info] of Object.entries(inspected)) {
  const rel = "/" + path.relative(SITE, file);
  const pages = [...(pagesFor.get(file) || ["?"])];
  if (info.status === "corrupt")
    record(pages[0], rel, "file", "CORRUPT", info.error || "will not decode");
  else if (info.status === "placeholder")
    record(pages[0], rel, "file", "PLACEHOLDER", `${info.w}x${info.h} generated stand-in`);
  else if (info.flat)
    record(pages[0], rel, "file", "BLANK", `${info.w}x${info.h} single flat colour`);
}

/* ------------------------------------------------------------------ report */

const byType = {};
for (const p of problems) (byType[p.type] ||= []).push(p);

if (JSON_OUT) {
  console.log(JSON.stringify({ problems, byType: Object.keys(byType) }, null, 2));
} else {
  const order = ["MISSING", "EMPTY", "CORRUPT", "PLACEHOLDER", "BLANK", "OFFSITE"];
  const blurb = {
    MISSING: "referenced but no file on disk — renders as a broken image",
    EMPTY: "empty src — browser downloads the page as an image",
    CORRUPT: "file present but will not decode",
    PLACEHOLDER: "our generated grey 'PLACEHOLDER' stand-in is still shipping",
    BLANK: "decodes, but is a single flat colour",
    OFFSITE: "hosted somewhere we don't control",
  };

  console.log(`\nimage audit — ${htmlFiles.length} pages, ${cssFiles.length} stylesheets`);
  console.log(`${localTargets.size} distinct local images referenced\n`);

  for (const type of order) {
    const list = byType[type];
    if (!list || !list.length) continue;
    // collapse identical url+type so a sitewide logo isn't printed 124 times
    const uniq = new Map();
    for (const p of list) {
      const key = p.url + "|" + p.type;
      if (!uniq.has(key)) uniq.set(key, { ...p, pages: new Set() });
      uniq.get(key).pages.add(p.page);
    }
    console.log(`${type}  (${uniq.size} distinct, ${list.length} refs) — ${blurb[type]}`);
    for (const p of [...uniq.values()].sort((a, b) => b.pages.size - a.pages.size)) {
      const n = p.pages.size;
      const where = n > 3 ? `${n} pages` : [...p.pages].join(", ");
      console.log(`   ${p.url}`);
      console.log(`      via ${p.kind} · ${p.detail} · ${where}`);
    }
    console.log("");
  }

  if (!problems.length) console.log("no image problems found\n");

  if (!QUIET) {
    const unref = walk(path.join(SITE, "assets", "media"), (n) => IMG_EXT.test(n)).filter(
      (f) => !localTargets.has(f)
    );
    if (unref.length)
      console.log(`note: ${unref.length} media files exist but are never referenced\n`);
  }
}

const breaking = ["MISSING", "EMPTY", "CORRUPT", "PLACEHOLDER"].some(
  (t) => byType[t] && byType[t].length
);
process.exit(breaking ? 1 : 0);
