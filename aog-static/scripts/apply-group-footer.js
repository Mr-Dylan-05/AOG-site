#!/usr/bin/env node
/**
 * apply-group-footer.js — use the Ad On Group footer on every built page.
 *
 * All design pages share one footer; the deployed adon-ai.com.au pages ship a
 * different one. This swaps that footer onto every page in public/ so the whole
 * site is consistent, and repairs links to the retired /ad-on-ai/ slug.
 *
 * Run last (batch-flatten.sh calls it after the design + deployed imports).
 */
const fs = require("fs");
const path = require("path");

const DESIGN = "/Users/dylanbailey/Downloads/ad on group/Ad On Group - Home.dc.html";
const PUB = path.join(__dirname, "..", "public");

const slugifyDc = (name) => {
  const b = name.replace(/\.dc\.html$/i, "").trim();
  if (/^Ad On Group\s*-\s*Home$/i.test(b)) return "/";
  return "/" + b.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + "/";
};
const rewriteAssets = (s) => s.replace(/(["'(])\/?assets\//g, "$1/assets/design/");

// Build the canonical Ad On Group footer with corrected links.
function buildFooter() {
  const s = fs.readFileSync(DESIGN, "utf8");
  let foot = s.match(/<footer\b[\s\S]*?<\/footer>/)[0];
  foot = rewriteAssets(foot).replace(/href="([^"]+?)\.dc\.html(#[^"]*)?"/g, (_m, n, f) => `href="${slugifyDc(n)}${f || ""}"`);
  // point retired/mismatched slugs at the pages that actually exist
  foot = foot.replace(/href="\/ad-on-ai\//g, 'href="/ad-on-ai-division/').replace(/href="\/bpo-ai-program\//g, 'href="/bpo-program/');
  return foot;
}
const FOOTER = buildFooter();

function walk(dir) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(p));
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

let count = 0;
for (const file of walk(PUB)) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  if (/<footer\b/.test(html)) html = html.replace(/<footer\b[\s\S]*?<\/footer>/, () => FOOTER);
  html = html.replace(/href="\/ad-on-ai\//g, 'href="/ad-on-ai-division/'); // retired slug
  if (html !== before) {
    fs.writeFileSync(file, html);
    count++;
  }
}
console.log(`Applied Ad On Group footer / fixed links on ${count} pages.`);
