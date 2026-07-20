#!/usr/bin/env node
/**
 * intake.js — "fuse" a standalone HTML page into the Ad On Group static site.
 *
 * Takes a self-contained HTML file (e.g. a page your colleague designed in
 * Claude Design) and turns it into an Eleventy page that is automatically
 * wrapped in the shared header/nav/footer (the shell). The design's unique
 * body + its own <style> blocks are kept; any duplicate site chrome it shipped
 * with can be stripped so you don't get two nav bars.
 *
 * Usage:
 *   node scripts/intake.js <input.html> [options]
 *
 * Options:
 *   --slug=/about/            URL the page should live at (default: from filename)
 *   --title="About Us"        Override <title>
 *   --select=.fl-page-content Only keep the inner HTML of this CSS selector as content
 *   --strip-chrome            Remove the design's own <header>/<footer>/site <nav>
 *   --no-styles               Drop the design's <style>/<link> (use shared CSS only)
 *   --no-scripts              Drop the design's <script> tags
 *   --out=src/pages/x.njk     Explicit output path
 *
 * Examples:
 *   # Fuse a colleague's full designed page, dropping its duplicate header/footer:
 *   node scripts/intake.js incoming/about.html --slug=/about/ --strip-chrome
 *
 *   # Bootstrap a reference page from a captured WordPress page (content only):
 *   node scripts/intake.js capture/about.html --slug=/about/ \
 *        --select=.fl-page-content --no-styles --no-scripts
 */
const fs = require("fs");
const path = require("path");
const { parse } = require("node-html-parser");

const STAGING_HOSTS = [
  "https://adongroup.adondevelopment.com",
  "http://adongroup.adondevelopment.com",
  "https://www.adongroup.adondevelopment.com",
];

function arg(name, def) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : def;
}
function flag(name) {
  return process.argv.includes(`--${name}`);
}

const input = process.argv[2];
if (!input || input.startsWith("--")) {
  console.error("Usage: node scripts/intake.js <input.html> [options]");
  process.exit(1);
}

const raw = fs.readFileSync(input, "utf8");
const root = parse(raw, { comment: false });

// ---- Metadata ----
let title = arg("title", null);
if (!title) {
  const t = root.querySelector("title");
  title = t ? t.text.trim() : "";
  if (!title) {
    const h1 = root.querySelector("h1");
    title = h1 ? h1.text.trim() : "Untitled";
  }
}
const descEl = root.querySelector('meta[name="description"]');
const description = descEl ? (descEl.getAttribute("content") || "").trim() : "";
const ogEl = root.querySelector('meta[property="og:image"]');
const ogImage = ogEl ? (ogEl.getAttribute("content") || "").trim() : "";

// ---- Slug / output ----
let slug = arg("slug", null);
if (!slug) {
  const base = path.basename(input).replace(/\.html?$/i, "").replace(/__/g, "/");
  slug = base === "index" ? "/" : `/${base}/`;
}
if (!slug.startsWith("/")) slug = "/" + slug;
if (!slug.endsWith("/") && slug !== "/") slug += "/";
const permalink = slug === "/" ? "/index.html" : `${slug}index.html`;
const out = arg("out", path.join("src", "pages", permalink.replace(/^\//, "").replace(/index\.html$/, "index.njk")));

// ---- Content region ----
const select = arg("select", null);
let container;
if (select && root.querySelector(select)) {
  container = root.querySelector(select);
} else {
  container = root.querySelector("main") || root.querySelector("body") || root;
}

// Optionally strip site chrome the design shipped with
if (flag("strip-chrome")) {
  container.querySelectorAll("header, footer").forEach((el) => el.remove());
  container
    .querySelectorAll('nav[aria-label="Primary"], nav[aria-label="Menu"], .site-header, .site-footer')
    .forEach((el) => el.remove());
}

// Collect the design's own styles (unless suppressed)
let styleHtml = "";
if (!flag("no-styles")) {
  root.querySelectorAll("style").forEach((s) => { styleHtml += s.toString() + "\n"; });
  root.querySelectorAll('link[rel="stylesheet"]').forEach((l) => {
    const href = l.getAttribute("href") || "";
    // keep external design stylesheets (e.g. fonts/tailwind CDN); skip WP core css
    if (href && !/wp-content|wp-includes/.test(href)) styleHtml += l.toString() + "\n";
  });
}

let scriptHtml = "";
if (!flag("no-scripts")) {
  container.querySelectorAll("script").forEach((s) => { scriptHtml += s.toString() + "\n"; s.remove(); });
}

let content = container.innerHTML;

// ---- Rewrite absolute staging URLs -> root-relative so links/media work anywhere ----
const PROD_DOMAIN = "adongroup.com.au";
function rewrite(s) {
  let o = s;
  // 1) strip absolute staging site links down to root-relative paths
  for (const h of STAGING_HOSTS) o = o.split(h).join("");
  o = o.replace(/https?:\\?\/\\?\/(www\.)?adongroup\.adondevelopment\.com/g, "");
  // 2) any bare staging domain left (emails, plain text) -> production domain
  o = o.replace(/adongroup\.adondevelopment\.com/g, PROD_DOMAIN);
  // 3) links that pointed at the site root and got emptied -> "/"
  o = o.replace(/href=""/g, 'href="/"');
  return o;
}
content = rewrite(content);
styleHtml = rewrite(styleHtml);
scriptHtml = rewrite(scriptHtml);

// ---- Assemble Eleventy page ----
const bodyClass = arg("body-class", null);
const fm = [
  "---",
  "layout: layouts/base.njk",
  `title: ${JSON.stringify(title)}`,
  description ? `description: ${JSON.stringify(description)}` : null,
  ogImage ? `ogImage: ${JSON.stringify(rewrite(ogImage))}` : null,
  bodyClass ? `bodyClass: ${JSON.stringify(bodyClass)}` : null,
  `permalink: ${JSON.stringify(permalink)}`,
  "---",
].filter(Boolean).join("\n");

const body = [fm, "", styleHtml.trim(), "", content.trim(), "", scriptHtml.trim(), ""]
  .filter((x) => x !== null)
  .join("\n");

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, body, "utf8");
console.log(`✓ ${input}`);
console.log(`  -> ${out}`);
console.log(`     slug=${slug}  title="${title}"  ${description ? "(has meta description)" : "(no meta description)"}`);
