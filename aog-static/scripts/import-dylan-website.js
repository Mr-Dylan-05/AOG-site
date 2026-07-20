#!/usr/bin/env node
/**
 * import-dylan-website.js — port the deployed adon-ai.com.au site
 * (the `dylan-website` repo) into the Ad On Group static site.
 *
 * The Ad On AI homepage lives ONLY at /ad-on-ai-division/ (the slug the Ad On
 * Group nav links to). There is no /ad-on-ai/. On that one page the deployed
 * Ad On AI nav is swapped for the main Ad On Group (cyan) nav so it reads as an
 * Ad On Group division page. Other deployed pages keep their Ad On AI nav.
 *
 * Run after batch-flatten.sh (batch-flatten calls this at the end).
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const SRC = "/Users/dylanbailey/Documents/GitHub/dylan-website";
const OUT = path.join(__dirname, "..", "public");
const REVIEWS = path.join(__dirname, "..", "incoming", "design", "reviews.json");
const FLATTEN = path.join(__dirname, "flatten-dc.js");
const GROUP_DIV = "/Users/dylanbailey/Downloads/ad on group/Ad On AI Division.dc.html";
const AI_HOME_SLUG = "/ad-on-ai-division/";

// deployed .dc.html pages (flatten) — replace design placeholders. NOTE: no index here.
const XDC = {
  "programs.html": "/programs/",
  "ongoing-support.html": "/ongoing-support/",
  "bpo-program.html": "/bpo-program/",
  "about.html": "/about/",
  "ad-on-group.html": "/ad-on-group/",
  "terms.html": "/terms/",
};
// already-flat static pages (copy) — new pages
const PLAIN = {
  "dylan-bailey.html": "/dylan-bailey/",
  "beau-robards.html": "/beau-robards/",
  "program-pricing.html": "/program-pricing/",
};

// On the AI site "/" is the AI home, which on our site is AI_HOME_SLUG.
function remapLinks(html) {
  return html.replace(/href="(\/[^"]*)"/g, (m, p) => {
    const h = p.indexOf("#");
    let pth = h >= 0 ? p.slice(0, h) : p;
    const frag = h >= 0 ? p.slice(h) : "";
    if (pth.startsWith("/assets/")) return m;
    if (/\.[a-z0-9]{1,6}$/i.test(pth)) return m;
    if (pth === "" || pth === "/") pth = AI_HOME_SLUG;
    else if (!pth.endsWith("/")) pth += "/";
    return `href="${pth}${frag}"`;
  });
}
const rewriteAssets = (s) => s.replace(/(["'(])\/?assets\//g, "$1/assets/design/");
const outPath = (slug) => path.join(OUT, slug.replace(/^\//, ""), "index.html");
const slugifyDc = (name) => {
  const b = name.replace(/\.dc\.html$/i, "").trim();
  if (/^Ad On Group\s*-\s*Home$/i.test(b)) return "/";
  return "/" + b.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + "/";
};

// Build the Ad On Group nav (markup + its hover CSS) from the design division file.
function buildGroupNav() {
  const raw = fs.readFileSync(GROUP_DIV, "utf8");
  let nav = raw.match(/<nav\b[\s\S]*?<\/nav>/)[0];
  nav = rewriteAssets(nav).replace(/href="([^"]+?)\.dc\.html(#[^"]*)?"/g, (_m, n, f) => `href="${slugifyDc(n)}${f || ""}"`);
  const rules = [];
  let k = 0;
  const P = { "style-hover": ":hover", "style-after": "::after", "style-before": "::before" };
  for (const attr of Object.keys(P)) {
    nav = nav.replace(new RegExp(`\\s${attr}="([^"]*)"`, "g"), (_m, d) => {
      const id = "gn" + (k++).toString(36);
      let dd = d.trim();
      if (dd && !dd.endsWith(";")) dd += ";";
      rules.push(`[data-dc="${id}"]${P[attr]}{${dd}}`);
      return ` data-dc="${id}"`;
    });
  }
  // dropdown behaviour is class-based; include it so it works regardless of the host page's <head>
  const css =
    `.nav-prog{position:relative}.nav-menu{opacity:0;pointer-events:none;transform:translateY(6px);transition:opacity .18s ease,transform .18s ease}` +
    `.nav-prog:hover .nav-menu,.nav-menu:hover{opacity:1;pointer-events:auto;transform:none}\n` +
    rules.join("\n");
  return { nav, css };
}

let n = 0;
// --- Ad On AI homepage -> /ad-on-ai-division/ with the Ad On Group nav ---
{
  const tmp = "/tmp/imp_ai_home.html";
  execSync(`node "${FLATTEN}" "${path.join(SRC, "index.html")}" "${tmp}" --data="${REVIEWS}"`, { stdio: "ignore" });
  let html = remapLinks(fs.readFileSync(tmp, "utf8"));
  const { nav, css } = buildGroupNav();
  html = html.replace(/<nav\b[\s\S]*?<\/nav>/, () => nav); // swap AI nav -> Ad On Group nav
  html = html.replace("</head>", `<style>/* Ad On Group nav */\n${css}\n</style>\n</head>`);
  const op = outPath(AI_HOME_SLUG);
  fs.mkdirSync(path.dirname(op), { recursive: true });
  fs.writeFileSync(op, html);
  console.log(`  page  index.html  ->  ${AI_HOME_SLUG}  (Ad On Group nav)`);
  n++;
}
// --- other deployed .dc.html pages (keep their Ad On AI nav) ---
for (const [f, slug] of Object.entries(XDC)) {
  const src = path.join(SRC, f);
  const tmp = "/tmp/imp_" + f.replace(/[^a-z0-9.]/gi, "_");
  const dataFlag = fs.readFileSync(src, "utf8").includes('list="{{ reviews }}"') ? `--data="${REVIEWS}"` : "";
  execSync(`node "${FLATTEN}" "${src}" "${tmp}" ${dataFlag}`, { stdio: "ignore" });
  const op = outPath(slug);
  fs.mkdirSync(path.dirname(op), { recursive: true });
  fs.writeFileSync(op, remapLinks(fs.readFileSync(tmp, "utf8")));
  console.log(`  page  ${f}  ->  ${slug}`);
  n++;
}
// --- plain static pages ---
for (const [f, slug] of Object.entries(PLAIN)) {
  const op = outPath(slug);
  fs.mkdirSync(path.dirname(op), { recursive: true });
  fs.writeFileSync(op, remapLinks(rewriteAssets(fs.readFileSync(path.join(SRC, f), "utf8"))));
  console.log(`  page  ${f}  ->  ${slug}  (static)`);
  n++;
}
// --- remove the retired /ad-on-ai/ slug ---
fs.rmSync(path.join(OUT, "ad-on-ai"), { recursive: true, force: true });
console.log(`  removed /ad-on-ai/ (consolidated into ${AI_HOME_SLUG})`);

console.log(`Imported ${n} deployed Ad On AI pages.`);
