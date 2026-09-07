#!/usr/bin/env node
/**
 * build-industry-links.js — list the industry pages on the Ad On AI hub.
 *
 * The six /ai-training-<industry>/ pages are Eleventy-built, but the hub they
 * belong to is a flattened design page in public/, so it cannot loop over the
 * data file the way a template can. Without this the industry pages would be
 * reachable only from the sitemap and from each other — an island, with none of
 * the hub's link equity flowing into them and nothing on the hub signalling that
 * the sectors are covered.
 *
 * Placed before the FAQ, which is where the page stops selling and starts
 * answering: "here is what it is, here is who it is for, now your questions".
 *
 * Reads src/_data/industries.json, so adding a seventh page means editing that
 * file only. Idempotent — replaces its own block if already present.
 *
 * Usage:  node scripts/build-industry-links.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PAGE = path.join(ROOT, "public", "ad-on-ai-division", "index.html");
const DATA = path.join(ROOT, "src", "_data", "industries.json");

const LOCS = path.join(ROOT, "src", "_data", "locations.json");

const items = JSON.parse(fs.readFileSync(DATA, "utf8")).items;
const places = JSON.parse(fs.readFileSync(LOCS, "utf8")).items;
const esc = (s) => String(s).replace(/&(?![a-zA-Z#0-9]+;)/g, "&amp;").replace(/</g, "&lt;");

const card = (i) => `
        <a href="${i.url}" style="display:block;background:#F1F4F8;border-radius:16px;padding:22px 20px;text-decoration:none;color:#0B1220;min-width:0">
          <span style="display:block;font-size:16.5px;font-weight:700;letter-spacing:-0.01em;margin-bottom:6px">${esc(i.label)}</span>
          <span style="display:block;font-size:14.5px;line-height:1.55;color:#5A6473">${esc(i.blurb)}</span>
        </a>`;

const BLOCK = `<section class="aog-industries" style="max-width:1160px;margin:0 auto;padding:28px 28px 72px">
      <span style="display:inline-flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:15px;letter-spacing:0.16em;color:#1BABE5;text-transform:uppercase"><span style="width:22px;height:1.5px;background:#1BABE5"></span>By industry</span>
      <h2 style="font-size:clamp(24px,3vw,38px);line-height:1.1;letter-spacing:-0.03em;font-weight:800;margin:14px 0 10px">Built around the work your sector actually&nbsp;does.</h2>
      <p style="font-size:16px;line-height:1.65;color:#4A5462;margin:0 0 26px;max-width:60ch">The program is the same three months. The examples, the workflows and the questions we answer are not &mdash; a progress note and a listing description are different problems.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:16px">${items.map(card).join("")}
      </div>
      <p style="font-size:16px;line-height:1.65;color:#4A5462;margin:26px 0 0;max-width:60ch">Not ready to talk to anyone yet? We run a <a href="/webinars/" style="color:#1BABE5;font-weight:600;text-decoration:none">free webinar every month</a>, one sector at a time &mdash; online, 45 minutes, open to&nbsp;anyone.</p>
      <h3 style="font-size:17px;font-weight:800;letter-spacing:-0.01em;margin:38px 0 14px">And where we train them</h3>
      <div style="display:flex;flex-wrap:wrap;gap:10px">${places
        .filter((l) => l.hasPage)
        .map(
          (l) =>
            `<a href="/ai-training-${l.slug}/" style="font-size:14.5px;font-weight:600;border:1px solid #E3E8EF;border-radius:999px;padding:9px 16px;text-decoration:none;color:#0B1220">${esc(l.name)}</a>`
        )
        .join("")}
      </div>
    </section>`;

let html = fs.readFileSync(PAGE, "utf8");

if (/<section class="aog-industries"/.test(html)) {
  html = html.replace(/<section class="aog-industries"[\s\S]*?<\/section>/, BLOCK);
} else {
  // Anchor on the FAQ eyebrow, not the heading. The heading reads "Questions,
  // answered." but the word "answered" is wrapped in a gradient span, so it does
  // not match as contiguous text.
  const faq = html.search(/>FAQs<\/span>/i);
  if (faq === -1) throw new Error("could not find the FAQ eyebrow to place the industries before");
  const at = html.lastIndexOf("<section", faq);
  if (at === -1) throw new Error("could not find the section wrapping the FAQ");
  html = html.slice(0, at) + BLOCK + "\n    " + html.slice(at);
}

fs.writeFileSync(PAGE, html);
console.log(`Industry links: ${items.length} on /ad-on-ai-division/`);
