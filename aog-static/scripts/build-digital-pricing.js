#!/usr/bin/env node
/**
 * build-digital-pricing.js — /digital-pricing/, the internal Ad On Digital price list.
 *
 * Restored after the migration dropped it. The old page lived inside
 * /online-accelerator/ and /stimulus-marketing-packages/, both of which were
 * redirected to /ad-on-digital/ during consolidation.
 *
 * WHERE THE NUMBERS COME FROM
 *
 * Not from the WordPress dump. The dump does still hold the old pricing, but
 * only as Beaver Builder module records whose titles are bare amounts and
 * image filenames, with the product names in separate sibling modules. Pairing
 * a price to a product from that would have been inference, and a PM quoting
 * an inferred price to a client is worse than having no page.
 *
 * Instead every figure is read from the product's OWN live page at build time,
 * which is the company's currently published price. Re-run this after changing
 * any product page and the table follows.
 *
 * That distinction caught a real error: a naive read of /finder-seo-package/
 * returns "$200 per month", which is not the price. It is an inclusion,
 * "Current offer inclusion - worth $200 per month". SEO is $1000. This script
 * ignores any amount preceded by "worth".
 *
 * NOINDEX, and deliberately so. It is an internal reference for the team to
 * quote from, not a public price list, and prices change.
 *
 * Usage:  node scripts/build-digital-pricing.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const SITE = path.join(ROOT, "_site");

const PRODUCTS = [
  ["Websites", "websites", "Design, build and hosting, with ongoing changes."],
  ["SEO", "finder-seo-package", "On-page and off-page work, with monthly ranking reports."],
  ["Google Ads", "google-ads-management", "Managed search campaigns. Excludes the ad spend itself."],
  ["Facebook Packages", "facebook-packages", "Managed Meta campaigns. Excludes the ad spend itself."],
  ["Brochure Campaign", "brochure-campaign", "Digital brochures for your products and services."],
  ["Blogs", "blogs", "Written and published for you."],
  ["Video Flexi", "video-flexi", "Animated video, with changes every two months."],
];

const money = (s) => Number(String(s).replace(/[$,]/g, ""));

/** Read the published figures off a product's own built page. */
function figuresFor(slug) {
  const file = path.join(SITE, slug, "index.html");
  if (!fs.existsSync(file)) return null;
  let t = fs.readFileSync(file, "utf8");
  t = t.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");
  t = t.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

  // "$N per month", but never "worth $N per month" — that is an inclusion, not
  // a price, and reading it as one puts SEO at $200 instead of $1000.
  const prices = [];
  const priceRe = /(worth\s+)?\$([0-9][0-9,]*)\s*(?:ex(?:cl(?:uding)?)?\.?\s*gst\s*)?per month/gi;
  let m;
  while ((m = priceRe.exec(t)) !== null) if (!m[1]) prices.push("$" + m[2]);

  const setups = (t.match(/\$[0-9][0-9,]*\s*(?:ex(?:cl(?:uding)?)?\.?\s*gst\s*)?once[- ]off\s*set[- ]?up fee/gi) || [])
    .map((s) => (s.match(/\$[0-9][0-9,]*/) || [])[0]);

  const term = (t.match(/(\d+)\s*month minimum term/i) || [])[1];

  const uniq = (a) => [...new Set(a)].sort((x, y) => money(x) - money(y));
  return { prices: uniq(prices), setups: uniq(setups), term };
}

const rows = PRODUCTS.map(([name, slug, blurb]) => ({ name, slug, blurb, ...(figuresFor(slug) || { prices: [], setups: [] }) }));

const fmt = (list) => (list.length === 0 ? null : list.length === 1 ? list[0] : list.join(" / "));

const BLUE = "#1BABE5", INK = "#0B1220", GREY = "#5A6473";

const row = (r) => {
  const price = fmt(r.prices);
  const setup = fmt(r.setups);
  const missing = !price;
  return `
        <tr style="border-top:1px solid rgba(11,18,32,0.08)">
          <td style="padding:16px 14px;vertical-align:top">
            <a href="/${r.slug}/" style="font-size:15.5px;font-weight:700;color:${INK};text-decoration:none">${r.name}</a>
            <div style="font-size:13.5px;line-height:1.5;color:#8A93A1;margin:4px 0 0">${r.blurb}</div>
          </td>
          <td style="padding:16px 14px;vertical-align:top;white-space:nowrap;font-size:15.5px;font-weight:700;color:${INK}">${
            price || "&mdash;"
          }${price && r.prices.length > 1 ? '<div style="font-size:12px;font-weight:600;color:#8A93A1;margin-top:3px">tiers</div>' : ""}</td>
          <td style="padding:16px 14px;vertical-align:top;white-space:nowrap;font-size:15px;color:${GREY}">${setup || "&mdash;"}</td>
          <td style="padding:16px 14px;vertical-align:top;white-space:nowrap;font-size:15px;color:${GREY}">${r.term ? r.term + " months" : "&mdash;"}</td>
        </tr>`;
};

const missing = rows.filter((r) => r.prices.length === 0);

const body = `
  <section style="max-width:1000px;margin:0 auto;padding:60px 24px 30px">
    <h1 style="font-size:clamp(30px,4vw,48px);line-height:1.04;letter-spacing:-0.042em;font-weight:600;color:${INK};margin:0">Ad On Digital <span style="color:${BLUE}">pricing</span>.</h1>

    <div style="overflow-x:auto;margin:26px 0 0;-webkit-overflow-scrolling:touch">
      <table style="width:100%;border-collapse:collapse;min-width:620px;background:#fff;border:1px solid rgba(11,18,32,0.08);border-radius:16px;overflow:hidden">
        <thead>
          <tr style="background:rgba(11,18,32,0.03)">
            <th style="text-align:left;padding:13px 14px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#8A93A1;font-family:'JetBrains Mono',monospace">Product</th>
            <th style="text-align:left;padding:13px 14px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#8A93A1;font-family:'JetBrains Mono',monospace">Per month</th>
            <th style="text-align:left;padding:13px 14px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#8A93A1;font-family:'JetBrains Mono',monospace">Set-up</th>
            <th style="text-align:left;padding:13px 14px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#8A93A1;font-family:'JetBrains Mono',monospace">Min term</th>
          </tr>
        </thead>
        <tbody>${rows.map(row).join("")}
        </tbody>
      </table>
    </div>



  </section>
`;

const shell = fs.readFileSync(path.join(PUBLIC, "contact-us", "index.html"), "utf8");
const head = shell.slice(0, shell.indexOf("</head>"));
const assets =
  (head.match(/<link rel="preload"[^>]*>/g) || []).join("\n") + "\n" + (head.match(/<style>[\s\S]*?<\/style>/g) || []).join("\n");

const html = `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ad On Digital Pricing | Ad On Group</title>
<meta name="description" content="Ad On Digital product pricing.">
<meta name="robots" content="noindex">
${assets}
</head>
<body>
<div style="max-width:100%;overflow-x:clip;background:transparent;position:relative">
${body}
</div>
</body>
</html>
`;

const dir = path.join(PUBLIC, "digital-pricing");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "index.html"), html);

console.log("  wrote digital-pricing/index.html");
for (const r of rows) {
  console.log(
    `    ${r.name.padEnd(20)} ${(fmt(r.prices) || "NOT PUBLISHED").padEnd(22)} setup ${(fmt(r.setups) || "-").padEnd(14)} ${r.term ? r.term + "mth" : "-"}`
  );
}
