#!/usr/bin/env node
/**
 * build-digital-pricing.js — /digital-pricing/, the old product pages as they were.
 *
 * This page is for reviewing what used to be up, so it reproduces the old
 * WordPress pages rather than restating them. Nothing here is written, priced,
 * grouped or summarised by the build: every word and every figure comes out of
 * src/_data/oldPages.json, which scripts/extract-old-pages.py pulls straight
 * from the published rows of the WordPress dump.
 *
 * That constraint is the point. Earlier versions of this page summarised the
 * products and had to pick between conflicting prices to do it, and the picks
 * were wrong — SEO Finder went up at $800 when its own live page said $1000.
 * Reproducing the pages removes the judgement call entirely.
 *
 * The only things stripped are editor furniture that no visitor ever saw:
 * Gutenberg comments, shortcodes, and the "Modal Popup" placeholder text that
 * says outright it is not visible on the frontend. Image URLs are repointed
 * from the old WordPress uploads folder to the assets this site already
 * carries. Everything else is left alone, including offers that have since
 * expired, because knowing what was on the page is the whole purpose.
 *
 * noindex, and linked from nowhere.
 *
 * Usage:  node scripts/build-digital-pricing.js
 *   (re-extract first with: python3 scripts/extract-old-pages.py)
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const PAGES = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "_data", "oldPages.json"), "utf8"));

const SHELL = fs.readFileSync(path.join(PUBLIC, "contact-us", "index.html"), "utf8");
const head = SHELL.slice(0, SHELL.indexOf("</head>"));
const ASSETS =
  (head.match(/<link rel="preload"[^>]*>/g) || []).join("\n") +
  "\n" +
  (head.match(/<style>[\s\S]*?<\/style>/g) || []).join("\n");

const BLUE = "#1BABE5", INK = "#0B1220", GREY = "#5A6473";

/**
 * Styling for the reproduced markup. This is Beaver Builder output — headings,
 * paragraphs, and feature lists built as <li> holding a tick image and a <p> —
 * so it needs its own rules rather than the site's page styles. Deliberately
 * plain: the job is legibility, not a redesign of pages that are no longer up.
 */
const PAGE_CSS = `
  .old { max-width: 760px; margin: 0 auto; padding: 0 24px 64px; }
  .old h1 { font-size: clamp(28px,3.4vw,40px); line-height: 1.1; letter-spacing: -0.035em; font-weight: 700; color: ${INK}; margin: 34px 0 0; text-transform: none; }
  .old h2 { font-size: 25px; letter-spacing: -0.025em; font-weight: 700; color: ${INK}; margin: 34px 0 0; }
  .old h3 { font-size: 21px; font-weight: 700; color: ${INK}; margin: 30px 0 0; }
  .old h4 { font-size: 18px; font-weight: 700; color: ${INK}; margin: 28px 0 0; }
  .old h5 { font-size: 16px; font-weight: 700; color: ${INK}; margin: 24px 0 0; }
  .old h6 { font-size: 15px; font-weight: 700; color: ${INK}; margin: 22px 0 0; }
  .old p { font-size: 16px; line-height: 1.68; color: #1F2733; margin: 12px 0 0; }
  .old ul { list-style: none; padding: 0; margin: 14px 0 0; }
  .old li { display: flex; align-items: flex-start; gap: 11px; margin: 10px 0 0; }
  .old li p { margin: 0; }
  /* the tick graphic each feature row starts with */
  .old li img { flex: none; width: 20px; height: 20px; margin-top: 3px; }
  .old img { max-width: 100%; height: auto; border-radius: 12px; display: block; margin: 22px auto 0; }
  .old a { color: ${BLUE}; }
  .old hr { border: 0; border-top: 1px solid rgba(11,18,32,0.10); margin: 34px 0 0; }

  @media (max-width: 560px) {
    /* A row of six prices left the slug a column two words wide, so
       "/brochure-campaign/ last edited 2025-09-08" broke over five lines.
       Stacked, each half gets the full width. */
    .idx-row { flex-direction: column; align-items: flex-start !important; gap: 10px !important; }
    .idx-row > span:last-child { text-align: left !important; }
  }
`;

const card = (inner, extra = "") =>
  `<div style="background:#fff;border:1px solid rgba(11,18,32,0.08);border-radius:20px;box-shadow:0 20px 46px -32px rgba(11,18,32,0.3);${extra}">${inner}</div>`;

const shell = (title, desc, bodyHtml) => `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="robots" content="noindex">
${ASSETS}
<style>${PAGE_CSS}</style>
</head>
<body>
<div style="max-width:100%;overflow-x:clip;background:transparent;position:relative">
${bodyHtml}
</div>
</body>
</html>
`;

const write = (dir, html) => {
  const out = path.join(PUBLIC, dir);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "index.html"), html);
};

// ---------------------------------------------------------------- index

const indexBody = `
  <section style="max-width:860px;margin:0 auto;padding:56px 24px 10px">
    <h1 style="font-size:clamp(30px,4vw,46px);line-height:1.05;letter-spacing:-0.042em;font-weight:600;color:${INK};margin:0">The old product <span style="color:${BLUE}">pages</span>.</h1>
    <p style="font-size:16.5px;line-height:1.65;color:${GREY};margin:14px 0 0;max-width:600px">Each one reproduced as it stood on the old site, wording and prices unchanged. The date is when that page was last edited in WordPress.</p>
  </section>

  <section style="max-width:860px;margin:0 auto;padding:22px 24px 70px">
    ${PAGES.map((p) => {
      const prices = [...new Set((p.html.match(/\$[0-9][0-9,]*/g) || []))]
        .sort((a, b) => parseInt(a.slice(1).replace(/,/g, ""), 10) - parseInt(b.slice(1).replace(/,/g, ""), 10));
      return card(
        `<a class="idx-row" href="/digital-pricing/${p.slug}/" style="display:flex;align-items:center;justify-content:space-between;gap:20px;text-decoration:none;padding:20px 24px">
        <span style="min-width:0">
          <span style="display:block;font-size:17px;font-weight:700;color:${INK}">${p.title}</span>
          <span style="display:block;font-size:13.5px;color:#8A93A1;margin-top:4px">/${p.slug}/ &middot; last edited ${p.modified}</span>
        </span>
        <span style="flex:none;font-size:14px;font-weight:700;color:${prices.length ? INK : "#B4BBC5"};text-align:right">${prices.length ? prices.join("&nbsp; ") : "no prices"}</span>
      </a>`,
        "margin:12px 0 0"
      );
    }).join("\n    ")}
  </section>
`;

write("digital-pricing", shell("The old product pages | Ad On Group", "The old Ad On Digital product pages, reproduced as they were.", indexBody));

// ---------------------------------------------------------------- one page each

PAGES.forEach((p, i) => {
  const prev = PAGES[i - 1];
  const next = PAGES[i + 1];
  const body = `
  <section style="max-width:760px;margin:0 auto;padding:34px 24px 0">
    <a href="/digital-pricing/" style="font-size:14px;font-weight:600;color:${BLUE};text-decoration:none">&larr; All old pages</a>
    <p style="font-size:13px;line-height:1.6;color:#8A93A1;margin:14px 0 0">Reproduced from the old <strong style="color:${GREY}">/${p.slug}/</strong>, last edited ${p.modified}. Wording and prices are unchanged.</p>
  </section>

  <div class="old">${p.html}</div>

  <section style="max-width:760px;margin:0 auto;padding:0 24px 70px;display:flex;justify-content:space-between;gap:16px">
    <span>${prev ? `<a href="/digital-pricing/${prev.slug}/" style="font-size:14px;font-weight:600;color:${BLUE};text-decoration:none">&larr; ${prev.title}</a>` : ""}</span>
    <span style="text-align:right">${next ? `<a href="/digital-pricing/${next.slug}/" style="font-size:14px;font-weight:600;color:${BLUE};text-decoration:none">${next.title} &rarr;</a>` : ""}</span>
  </section>
`;
  write(path.join("digital-pricing", p.slug), shell(`${p.title} (old page) | Ad On Group`, `The old ${p.title} page, reproduced as it was.`, body));
});

console.log(`  wrote digital-pricing/ index + ${PAGES.length} reproduced pages`);
for (const p of PAGES) {
  const prices = [...new Set((p.html.match(/\$[0-9][0-9,]*/g) || []))];
  console.log(`    /digital-pricing/${(p.slug + "/").padEnd(24)} ${p.modified}  ${prices.join(" ") || "-"}`);
}
