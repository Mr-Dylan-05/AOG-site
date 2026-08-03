#!/usr/bin/env node
/**
 * complete-head-meta.js — fill in head tags the design pages never got.
 *
 * base.njk gives every Eleventy-built page a canonical link and a full set of
 * Open Graph / Twitter tags. The flattened design pages in public/ bypass that
 * template entirely, and the Ad On AI import drops <head> metadata, so nine
 * pages — including /programs/, /bpo-program/ and /ad-on-ai-division/ — shipped
 * with no canonical at all, and most design pages had no og:type or
 * twitter:card.
 *
 * This runs over _site/ after the build (wired into .eleventy.js) and only ever
 * ADDS what is missing: an existing canonical or og tag is left exactly as it is.
 *
 * Usage:  node scripts/complete-head-meta.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE = path.join(ROOT, "_site");
const DRY = process.argv.includes("--dry");

const site = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "_data", "site.json"), "utf8"));
const BASE = site.url.replace(/\/$/, "");

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name === "index.html") out.push(p);
  }
  return out;
}

const attr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const has = (html, re) => re.test(html);

let canonical = 0, og = 0, tw = 0, ogImage = 0, mobileCss = 0, ga = 0, tawk = 0, touched = 0;

for (const file of walk(SITE)) {
  const html = fs.readFileSync(file, "utf8");
  if (!/<\/head>/i.test(html)) continue;

  const rel = path.relative(SITE, path.dirname(file)).split(path.sep).join("/");
  const url = `${BASE}${rel === "" ? "/" : `/${rel}/`}`;

  const titleM = html.match(/<title>([\s\S]*?)<\/title>/i);
  const descM = html.match(/<meta[^>]*name=(["'])description\1[^>]*content=(["'])([\s\S]*?)\2/i);
  const imgM = html.match(/<meta[^>]*property=(["'])og:image\1[^>]*content=(["'])([\s\S]*?)\2/i);

  const title = titleM ? titleM[1].trim() : site.name;
  const desc = descM ? descM[3].trim() : null;
  let image = imgM ? imgM[3].trim() : null;
  // Pages with no image of their own still need a social card — without one,
  // a shared link renders as a bare text row. Falls back to the group team shot.
  if (!image && site.defaultOgImage) image = site.defaultOgImage;
  if (image && image.startsWith("/")) image = BASE + image;

  const add = [];

  // Responsive rescue layer. Injected here rather than in base.njk because the
  // design pages are passthrough-copied and never see a template — and they are
  // precisely the ones that need it (zero @media rules between them).
  if (!html.includes("/assets/css/mobile.css")) {
    add.push(`<link rel="stylesheet" href="/assets/css/mobile.css">`);
    mobileCss++;
  }

  if (image && !has(html, /<meta[^>]+property=["']og:image["']/i)) {
    add.push(`<meta property="og:image" content="${attr(image)}">`);
    ogImage++;
  }

  if (!has(html, /<link[^>]+rel=["']canonical["']/i)) {
    add.push(`<link rel="canonical" href="${url}">`);
    canonical++;
  }

  if (!has(html, /<meta[^>]+property=["']og:type["']/i)) {
    add.push(`<meta property="og:type" content="website">`);
    if (!has(html, /<meta[^>]+property=["']og:locale["']/i)) add.push(`<meta property="og:locale" content="en_AU">`);
    if (!has(html, /<meta[^>]+property=["']og:site_name["']/i)) add.push(`<meta property="og:site_name" content="${attr(site.name)}">`);
    if (!has(html, /<meta[^>]+property=["']og:title["']/i)) add.push(`<meta property="og:title" content="${attr(title)}">`);
    if (!has(html, /<meta[^>]+property=["']og:url["']/i)) add.push(`<meta property="og:url" content="${url}">`);
    if (desc && !has(html, /<meta[^>]+property=["']og:description["']/i)) add.push(`<meta property="og:description" content="${attr(desc)}">`);
    og++;
  }

  if (!has(html, /<meta[^>]+name=["']twitter:card["']/i)) {
    add.push(`<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">`);
    add.push(`<meta name="twitter:title" content="${attr(title)}">`);
    if (desc) add.push(`<meta name="twitter:description" content="${attr(desc)}">`);
    if (image) add.push(`<meta name="twitter:image" content="${attr(image)}">`);
    tw++;
  }

  // --- third-party tags -------------------------------------------------
  // base.njk emits these, but only for Eleventy-built pages. The design pages
  // are passthrough-copied and never see the template — which silently left
  // analytics off the homepage and every division page. Injecting here covers
  // both sources; the guard stops it doubling up on pages that already have it.
  const tp = site.thirdParty || {};
  let body = null;

  if (tp.googleAnalytics && !html.includes(tp.googleAnalytics)) {
    body = (body || "") +
      `<script async src="https://www.googletagmanager.com/gtag/js?id=${tp.googleAnalytics}"></script>\n` +
      `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}` +
      `gtag('js',new Date());gtag('config','${tp.googleAnalytics}');</script>`;
    ga++;
  }
  if (tp.tawkChat && tp.tawkSrc && !html.includes(tp.tawkSrc)) {
    body = (body || "") + `\n<script async src="${tp.tawkSrc}" crossorigin="*"></script>`;
    tawk++;
  }

  if (!add.length && !body) continue;
  touched++;
  let out = html;
  if (add.length) out = out.replace(/<\/head>/i, `${add.join("\n")}\n</head>`);
  if (body) {
    out = /<\/body>/i.test(out)
      ? out.replace(/<\/body>/i, `${body}\n</body>`)
      : out.replace(/<\/html>/i, `${body}\n</html>`);
  }
  if (!DRY) fs.writeFileSync(file, out);
}

console.log(`${DRY ? "[dry run] " : ""}[head] ${touched} pages completed`);
console.log(`  canonical added   : ${canonical}`);
console.log(`  open graph added  : ${og}`);
console.log(`  twitter card added: ${tw}`);
console.log(`  og:image defaulted: ${ogImage}`);
console.log(`  mobile.css linked : ${mobileCss}`);
console.log(`  analytics injected: ${ga}`);
console.log(`  chat injected     : ${tawk}`);
