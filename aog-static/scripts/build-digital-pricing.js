#!/usr/bin/env node
/**
 * build-digital-pricing.js — /digital-pricing/, the Ad On Digital bundle sheet.
 *
 * Account managers screenshare this with clients, so everything on it is
 * written for a client to read. Nothing internal, no build instructions, no
 * placeholders, and no "(internal)" in the title, because a browser tab is on
 * screen for the whole call.
 *
 * BUNDLES, NOT PRODUCTS. The first version of this page listed the individual
 * products with their own prices. That was wrong: the page it replaces sold
 * bundles, and a client looking at a per-product list will add the numbers up
 * and arrive at a figure nobody quotes.
 *
 * WHERE THE NUMBERS COME FROM
 * The WordPress dump, taking the live pages rather than their revisions:
 *
 *   Online Accelerator   page 3558, /online-accelerator/, modified 2024-11-21.
 *                        RRP $2300, offer $900/month, $900 set-up. An earlier
 *                        2023 revision of the same page says $600; that is the
 *                        superseded version and is deliberately not used.
 *   Stimulus Package     the packages price list, 2 to 5 product tiers.
 *
 * Both carry conditions that matter commercially, and they are on the page
 * because a client should see them: the Accelerator's inclusions cannot be
 * dropped for a lower price, and Stimulus is an existing-customer offer subject
 * to qualification.
 *
 * Usage:  node scripts/build-digital-pricing.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const SHELL = fs.readFileSync(path.join(PUBLIC, "contact-us", "index.html"), "utf8");
const head = SHELL.slice(0, SHELL.indexOf("</head>"));
const ASSETS =
  (head.match(/<link rel="preload"[^>]*>/g) || []).join("\n") +
  "\n" +
  (head.match(/<style>[\s\S]*?<\/style>/g) || []).join("\n");

const BLUE = "#1BABE5", INK = "#0B1220", GREY = "#5A6473";

const ACCELERATOR = {
  name: "Online Accelerator",
  rrp: "$2,300",
  price: "$900",
  setup: "$900",
  term: "12 month minimum term, then month by month",
  note: "Removing any of the standard inclusions does not change the bundle price.",
  includes: [
    ["Local SEO", "Climb the organic results on Google above your competition. As per our SEO Finder package."],
    ["Website", "New build, or maintain and improve your existing site, optimised for Google. Includes ongoing updates and hosting. As per our Website Illuminate package."],
    ["Google Business Profile", "Manage and update opening hours, contact details, FAQs, keywords, services, images, blogs, offers and reviews."],
    ["Monthly blog", "Engage your customers and boost your keywords on Google. As per our Blog package."],
    ["Monthly digital brochure", "Stay front of mind with existing customers, sent by email or SMS. As per our Digital Brochure package."],
  ],
  extras: [
    ["Google Ads search campaign management", "$400"],
    ["Facebook lead generation and awareness campaign management", "$400"],
  ],
};

const STIMULUS = {
  name: "Stimulus Package",
  term: "12 month minimum term, then month by month",
  note: "A bundled offer for existing Ad On Group customers who qualify.",
  tiers: [
    ["2 products", "$400", "$400"],
    ["3 products", "$500", "$500"],
    ["4 products", "$600", "$600"],
    ["5 products", "$700", "$700"],
  ],
};

const tick = `<span style="flex:none;width:22px;height:22px;border-radius:7px;background:${BLUE};display:inline-flex;align-items:center;justify-content:center;margin-top:2px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg></span>`;

const body = `
  <section style="max-width:1000px;margin:0 auto;padding:56px 24px 20px">
    <h1 style="font-size:clamp(30px,4vw,48px);line-height:1.04;letter-spacing:-0.042em;font-weight:600;color:${INK};margin:0">Ad On Digital <span style="color:${BLUE}">bundles</span>.</h1>
    <p style="font-size:16.5px;line-height:1.65;color:${GREY};margin:14px 0 0;max-width:620px">All prices exclude GST.</p>
  </section>

  <section style="max-width:1000px;margin:0 auto;padding:14px 24px 20px">
    <div style="background:#fff;border:1px solid rgba(27,171,229,0.35);border-radius:22px;padding:32px 30px;box-shadow:0 26px 60px -34px rgba(11,18,32,0.34)">
      <div class="bundle-grid" style="display:grid;grid-template-columns:1.25fr 0.75fr;gap:34px;align-items:start">
        <div>
          <div style="font-size:24px;font-weight:800;letter-spacing:-0.028em;color:${INK}">${ACCELERATOR.name}</div>
          <div style="display:flex;flex-direction:column;gap:13px;margin:22px 0 0">
            ${ACCELERATOR.includes
              .map(
                ([t, d]) => `<div style="display:flex;align-items:flex-start;gap:12px">
              ${tick}
              <span style="font-size:15px;line-height:1.55;color:#1F2733"><strong style="color:${INK}">${t}.</strong> ${d}</span>
            </div>`
              )
              .join("\n            ")}
          </div>
        </div>

        <div style="background:rgba(27,171,229,0.06);border:1px solid rgba(27,171,229,0.22);border-radius:16px;padding:22px 20px">
          <div style="font-size:14px;color:#8A93A1;text-decoration:line-through">${ACCELERATOR.rrp} per month</div>
          <div style="display:flex;align-items:baseline;gap:8px;margin:6px 0 0">
            <span style="font-size:40px;font-weight:800;letter-spacing:-0.04em;color:${BLUE};line-height:1">${ACCELERATOR.price}</span>
            <span style="font-size:14.5px;color:${GREY}">per month</span>
          </div>
          <div style="height:1px;background:rgba(11,18,32,0.10);margin:16px 0"></div>
          <div style="font-size:14.5px;line-height:1.6;color:${GREY}">
            <div><strong style="color:${INK}">${ACCELERATOR.setup}</strong> once off set-up fee</div>
            <div style="margin-top:6px">${ACCELERATOR.term}</div>
          </div>
        </div>
      </div>

      <div style="height:1px;background:rgba(11,18,32,0.08);margin:26px 0 0"></div>

      <div style="margin:22px 0 0">
        <div style="font-family:'JetBrains Mono',monospace;font-size:11.5px;letter-spacing:0.14em;text-transform:uppercase;color:#8A93A1;font-weight:700">Add to the Accelerator</div>
        <div class="extras-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:14px 0 0">
          ${ACCELERATOR.extras
            .map(
              ([t, p]) => `<div style="display:flex;align-items:center;justify-content:space-between;gap:14px;background:rgba(11,18,32,0.02);border:1px solid rgba(11,18,32,0.08);border-radius:12px;padding:14px 16px">
            <span style="font-size:14.5px;line-height:1.45;color:#1F2733">${t}</span>
            <span style="flex:none;font-size:16px;font-weight:800;color:${INK}">${p}<span style="font-size:12.5px;font-weight:600;color:#8A93A1"> /mo</span></span>
          </div>`
            )
            .join("\n          ")}
        </div>
        <p style="font-size:13.5px;line-height:1.55;color:#8A93A1;margin:12px 0 0">These rates apply when added to the Online Accelerator. ${ACCELERATOR.note}</p>
      </div>
    </div>
  </section>

  <section style="max-width:1000px;margin:0 auto;padding:20px 24px 70px">
    <div style="background:#fff;border:1px solid rgba(11,18,32,0.08);border-radius:22px;padding:30px;box-shadow:0 20px 46px -32px rgba(11,18,32,0.3)">
      <div style="font-size:22px;font-weight:800;letter-spacing:-0.026em;color:${INK}">${STIMULUS.name}</div>
      <p style="font-size:15px;line-height:1.6;color:${GREY};margin:8px 0 0">Bundle two or more products and the monthly price is set by how many you take.</p>

      <div style="overflow-x:auto;margin:22px 0 0;-webkit-overflow-scrolling:touch">
        <table style="width:100%;border-collapse:collapse;min-width:420px">
          <thead>
            <tr>
              <th style="text-align:left;padding:11px 12px;font-size:11.5px;letter-spacing:0.1em;text-transform:uppercase;color:#8A93A1;font-family:'JetBrains Mono',monospace;border-bottom:1px solid rgba(11,18,32,0.10)">Bundle</th>
              <th style="text-align:left;padding:11px 12px;font-size:11.5px;letter-spacing:0.1em;text-transform:uppercase;color:#8A93A1;font-family:'JetBrains Mono',monospace;border-bottom:1px solid rgba(11,18,32,0.10)">Per month</th>
              <th style="text-align:left;padding:11px 12px;font-size:11.5px;letter-spacing:0.1em;text-transform:uppercase;color:#8A93A1;font-family:'JetBrains Mono',monospace;border-bottom:1px solid rgba(11,18,32,0.10)">Set-up</th>
            </tr>
          </thead>
          <tbody>
            ${STIMULUS.tiers
              .map(
                ([n, p, s]) => `<tr>
              <td style="padding:14px 12px;font-size:15.5px;font-weight:700;color:${INK};border-top:1px solid rgba(11,18,32,0.07)">${n}</td>
              <td style="padding:14px 12px;font-size:15.5px;font-weight:700;color:${INK};border-top:1px solid rgba(11,18,32,0.07);white-space:nowrap">${p}</td>
              <td style="padding:14px 12px;font-size:15px;color:${GREY};border-top:1px solid rgba(11,18,32,0.07);white-space:nowrap">${s}</td>
            </tr>`
              )
              .join("\n            ")}
          </tbody>
        </table>
      </div>

      <p style="font-size:13.5px;line-height:1.55;color:#8A93A1;margin:16px 0 0">${STIMULUS.note} ${STIMULUS.term}.</p>
    </div>
  </section>

  <style>
    @media (max-width: 860px) {
      .bundle-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
      /* Price first on a phone: it is the thing being asked about. */
      .bundle-grid > div:last-child { order: -1; }
      .extras-grid { grid-template-columns: 1fr !important; }
    }
  </style>
`;

const html = `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ad On Digital Bundles | Ad On Group</title>
<meta name="description" content="Ad On Digital bundle pricing.">
<meta name="robots" content="noindex">
${ASSETS}
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
console.log(`    ${ACCELERATOR.name.padEnd(24)} ${ACCELERATOR.price}/mo (RRP ${ACCELERATOR.rrp})  set-up ${ACCELERATOR.setup}  ${ACCELERATOR.includes.length} inclusions, ${ACCELERATOR.extras.length} extras`);
for (const [n, p, s] of STIMULUS.tiers) console.log(`    ${(STIMULUS.name + " " + n).padEnd(24)} ${p}/mo  set-up ${s}`);
