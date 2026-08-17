#!/usr/bin/env node
/**
 * build-digital-pricing.js — /digital-pricing/, the Ad On Digital price sheet.
 *
 * Account managers screenshare this with clients, so everything on it is
 * written for a client to read. Nothing internal, no build instructions, no
 * placeholders, and no "(internal)" in the title, because a browser tab is on
 * screen for the whole call.
 *
 * WHAT IS ON IT
 * The two bundles first, because they are what gets sold, then every
 * individual package underneath so a manager can price a custom mix on the
 * same screen without opening a second tab.
 *
 * WHERE THE NUMBERS COME FROM
 * The WordPress dump. Several packages appear at two different prices there,
 * from two different price lists, so the figures below were resolved with a
 * rule rather than a guess:
 *
 *   1. A product's own live page beats any revision of it. This is what settles
 *      the Accelerator: page 3558, /online-accelerator/, modified 2024-11-21,
 *      says $900. An earlier 2023 revision says $600 and is not used.
 *   2. Where two lists disagree, the one where the set-up fee equals the first
 *      month wins. That relationship holds across every package that states
 *      both figures — Accelerator 900/900, Stimulus 400/400 through 700/700,
 *      Illuminate 400/400, Showcase Ecommerce 500/500, SEO Finder 800/800 —
 *      so it identifies one internally consistent list. The competing list
 *      (Illuminate $250 with a $200 set-up, SEO Finder $1000) does not hold it.
 *
 * SUPERSEDED, and flagged here because it is the one figure on the page that
 * the rule above could not confirm: Website Showcase at $375. It exists only in
 * the older list, and it sits below Illuminate's $400 despite including more
 * pages. It is on the page because every package was asked for; it wants a
 * human to confirm it before anyone quotes from it.
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

const TERM = "12 month minimum term, then month by month";

const ACCELERATOR = {
  name: "Online Accelerator",
  rrp: "$2,300",
  price: "$900",
  setup: "$900",
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
  note: "A bundled offer for existing Ad On Group customers who qualify.",
  tiers: [
    ["2 products", "$400", "$400"],
    ["3 products", "$500", "$500"],
    ["4 products", "$600", "$600"],
    ["5 products", "$700", "$700"],
  ],
};

/**
 * Every individual package. `setup` is stated per row rather than derived, so
 * that a package whose set-up fee stops matching its first month can be
 * corrected here without anyone having to know the rule that produced it.
 * `check` marks a figure the resolution rule could not confirm.
 */
const GROUPS = [
  {
    name: "Websites",
    items: [
      { name: "Website Illuminate", price: "$400", setup: "$400",
        desc: "Up to 6 pages, with the content written, designed and project managed for you. Quarterly content and graphic updates, speed and mobile optimisation, hosting and security, and monthly traffic and search reporting." },
      { name: "Website Showcase", price: "$375", setup: "$300", check: true,
        desc: "Up to 12 pages, with the same writing, design and ongoing updates as Illuminate." },
      { name: "Website Showcase Ecommerce", price: "$500", setup: "$500",
        desc: "Website Showcase plus up to 30 shopping cart items, so customers buy directly from your site." },
    ],
  },
  {
    name: "Getting found",
    items: [
      { name: "SEO Finder", price: "$800", setup: "$800",
        desc: "Ongoing search optimisation across your website, your Google Business Profile and the questions customers actually search, with a monthly report showing the movement." },
      { name: "Google Ads Management", price: "$800", setup: "$800",
        desc: "Search campaign build and ongoing management, so you can hold the top of the first page while your organic ranking builds." },
      { name: "Google Ads Remarketing", price: "$400", setup: "$400",
        desc: "Follow the visitors who did not enquire the first time and put your business back in front of them." },
    ],
  },
  {
    name: "Reviews",
    items: [
      { name: "Ad On Review Easy Rate App", price: "$200", setup: "$200",
        desc: "Automatically asks your customers for feedback after they deal with you, so the reviews keep coming without anyone having to chase them." },
      { name: "Ad On Review 5 Star", price: "$400", setup: "$400",
        desc: "The full review programme. Builds your Google rating and routes unhappy customers to you offline before they post." },
    ],
  },
  {
    name: "Staying front of mind",
    items: [
      { name: "Blog Package", price: "$300", setup: "$300",
        desc: "A written blog every month, on the keywords you want to rank for." },
      { name: "Brochure Campaign", price: "$600", setup: "$600",
        desc: "A monthly digital brochure to your existing customer database, sent by email or SMS." },
      { name: "Video Flexi", price: "$300", setup: "$300",
        desc: "A motion graphic video about your business plus an animated logo, with changes every two months." },
    ],
  },
  {
    name: "On hold",
    items: [
      { name: "Ad On Hold Flexi Message", price: "$80", setup: "$80",
        desc: "Professionally written and produced on-hold messaging, updated as your offers change." },
    ],
  },
];

const tick = `<span style="flex:none;width:22px;height:22px;border-radius:7px;background:${BLUE};display:inline-flex;align-items:center;justify-content:center;margin-top:2px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg></span>`;

const kicker = (t) =>
  `<div style="font-family:'JetBrains Mono',monospace;font-size:11.5px;letter-spacing:0.14em;text-transform:uppercase;color:#8A93A1;font-weight:700">${t}</div>`;

const body = `
  <section style="max-width:1000px;margin:0 auto;padding:56px 24px 18px">
    <h1 style="font-size:clamp(30px,4vw,48px);line-height:1.04;letter-spacing:-0.042em;font-weight:600;color:${INK};margin:0">Ad On Digital <span style="color:${BLUE}">pricing</span>.</h1>
    <p style="font-size:16.5px;line-height:1.65;color:${GREY};margin:14px 0 0;max-width:640px">All prices exclude GST. Every package carries a ${TERM.toLowerCase()}, and a once off set-up fee equal to the first month unless shown otherwise.</p>
    <nav style="display:flex;flex-wrap:wrap;gap:8px;margin:22px 0 0">
      ${[["Online Accelerator", "accelerator"], ["Stimulus Package", "stimulus"], ...GROUPS.map((g) => [g.name, g.name.toLowerCase().replace(/\s+/g, "-")])]
        .map(
          ([t, id]) =>
            `<a href="#${id}" style="text-decoration:none;font-size:13.5px;font-weight:600;color:${INK};background:rgba(27,171,229,0.09);border:1px solid rgba(27,171,229,0.24);border-radius:999px;padding:7px 14px">${t}</a>`
        )
        .join("\n      ")}
    </nav>
  </section>

  <section id="accelerator" style="max-width:1000px;margin:0 auto;padding:20px 24px 12px;scroll-margin-top:20px">
    ${kicker("Bundle")}
    <div style="background:#fff;border:1px solid rgba(27,171,229,0.35);border-radius:22px;padding:30px;margin:12px 0 0;box-shadow:0 26px 60px -34px rgba(11,18,32,0.34)">
      <div class="bundle-grid" style="display:grid;grid-template-columns:1.25fr 0.75fr;gap:32px;align-items:start">
        <div>
          <div style="font-size:24px;font-weight:800;letter-spacing:-0.028em;color:${INK}">${ACCELERATOR.name}</div>
          <div style="display:flex;flex-direction:column;gap:12px;margin:20px 0 0">
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

        <div style="background:rgba(27,171,229,0.06);border:1px solid rgba(27,171,229,0.22);border-radius:16px;padding:20px">
          <div style="font-size:14px;color:#8A93A1;text-decoration:line-through">${ACCELERATOR.rrp} per month</div>
          <div style="display:flex;align-items:baseline;gap:8px;margin:6px 0 0">
            <span style="font-size:40px;font-weight:800;letter-spacing:-0.04em;color:${BLUE};line-height:1">${ACCELERATOR.price}</span>
            <span style="font-size:14.5px;color:${GREY}">per month</span>
          </div>
          <div style="height:1px;background:rgba(11,18,32,0.10);margin:15px 0"></div>
          <div style="font-size:14.5px;line-height:1.6;color:${GREY}">
            <div><strong style="color:${INK}">${ACCELERATOR.setup}</strong> once off set-up fee</div>
            <div style="margin-top:6px">${TERM}</div>
          </div>
        </div>
      </div>

      <div style="height:1px;background:rgba(11,18,32,0.08);margin:24px 0 0"></div>

      <div style="margin:20px 0 0">
        ${kicker("Add to the Accelerator")}
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

  <section id="stimulus" style="max-width:1000px;margin:0 auto;padding:18px 24px 12px;scroll-margin-top:20px">
    ${kicker("Bundle")}
    <div style="background:#fff;border:1px solid rgba(11,18,32,0.08);border-radius:22px;padding:28px;margin:12px 0 0;box-shadow:0 20px 46px -32px rgba(11,18,32,0.3)">
      <div style="font-size:22px;font-weight:800;letter-spacing:-0.026em;color:${INK}">${STIMULUS.name}</div>
      <p style="font-size:15px;line-height:1.6;color:${GREY};margin:8px 0 0">Take two or more of the packages below and the monthly price is set by how many you take, not by which ones.</p>

      <table class="price-table" style="width:100%;border-collapse:collapse;margin:20px 0 0">
        <thead>
          <tr>
            <th style="text-align:left;padding:10px 10px 10px 0;font-size:11px;letter-spacing:0.09em;text-transform:uppercase;color:#8A93A1;font-family:'JetBrains Mono',monospace;border-bottom:1px solid rgba(11,18,32,0.10)">Bundle</th>
            <th style="text-align:right;padding:10px 0;font-size:11px;letter-spacing:0.09em;text-transform:uppercase;color:#8A93A1;font-family:'JetBrains Mono',monospace;border-bottom:1px solid rgba(11,18,32,0.10);white-space:nowrap">Per month</th>
            <th style="text-align:right;padding:10px 0 10px 10px;font-size:11px;letter-spacing:0.09em;text-transform:uppercase;color:#8A93A1;font-family:'JetBrains Mono',monospace;border-bottom:1px solid rgba(11,18,32,0.10);white-space:nowrap">Set-up</th>
          </tr>
        </thead>
        <tbody>
          ${STIMULUS.tiers
            .map(
              ([n, p, s]) => `<tr>
            <td style="padding:13px 10px 13px 0;font-size:15.5px;font-weight:700;color:${INK};border-top:1px solid rgba(11,18,32,0.07)">${n}</td>
            <td style="padding:13px 0;font-size:15.5px;font-weight:700;color:${INK};border-top:1px solid rgba(11,18,32,0.07);text-align:right;white-space:nowrap">${p}</td>
            <td style="padding:13px 0 13px 10px;font-size:15px;color:${GREY};border-top:1px solid rgba(11,18,32,0.07);text-align:right;white-space:nowrap">${s}</td>
          </tr>`
            )
            .join("\n          ")}
        </tbody>
      </table>

      <p style="font-size:13.5px;line-height:1.55;color:#8A93A1;margin:15px 0 0">${STIMULUS.note} ${TERM}.</p>
    </div>
  </section>

  <section style="max-width:1000px;margin:0 auto;padding:18px 24px 60px">
    ${kicker("Individual packages")}
    ${GROUPS.map(
      (g) => `
    <div id="${g.name.toLowerCase().replace(/\s+/g, "-")}" style="background:#fff;border:1px solid rgba(11,18,32,0.08);border-radius:22px;padding:26px 28px;margin:14px 0 0;box-shadow:0 20px 46px -32px rgba(11,18,32,0.3);scroll-margin-top:20px">
      <div style="font-size:19px;font-weight:800;letter-spacing:-0.024em;color:${INK}">${g.name}</div>
      <div style="display:flex;flex-direction:column;margin:14px 0 0">
        ${g.items
          .map(
            (it, i) => `<div class="pkg-row" style="display:flex;align-items:flex-start;justify-content:space-between;gap:26px;padding:${i ? "18px" : "4px"} 0 18px;${i ? "border-top:1px solid rgba(11,18,32,0.07)" : ""}">
          <div style="min-width:0">
            <div style="font-size:16.5px;font-weight:700;color:${INK}">${it.name}</div>
            <p style="font-size:14.5px;line-height:1.6;color:${GREY};margin:6px 0 0;max-width:62ch">${it.desc}</p>
          </div>
          <div class="pkg-price" style="flex:none;text-align:right">
            <div style="font-size:22px;font-weight:800;letter-spacing:-0.03em;color:${INK};line-height:1.1;white-space:nowrap">${it.price}<span style="font-size:13px;font-weight:600;color:#8A93A1"> /mo</span></div>
            <div style="font-size:13px;color:#8A93A1;margin-top:4px;white-space:nowrap">${it.setup} set-up</div>
          </div>
        </div>`
          )
          .join("\n        ")}
      </div>
    </div>`
    ).join("\n    ")}

    <p style="font-size:13.5px;line-height:1.55;color:#8A93A1;margin:22px 0 0">All prices exclude GST. ${TERM}.</p>
  </section>

  <style>
    @media (max-width: 860px) {
      .bundle-grid { grid-template-columns: 1fr !important; gap: 22px !important; }
      /* Price first on a phone: it is the thing being asked about. */
      .bundle-grid > div:last-child { order: -1; }
      .extras-grid { grid-template-columns: 1fr !important; }
    }
    @media (max-width: 560px) {
      /* The price sat in its own column and pushed the set-up figure off the
         side of a 390px screen. Stacked under the name it always fits, and
         nothing is hidden behind a horizontal scroll nobody notices. */
      .pkg-row { flex-direction: column; gap: 10px !important; }
      .pkg-price { text-align: left !important; }
      .pkg-price > div:last-child { display: inline; margin-left: 10px; }
      .price-table { font-size: 14px; }
    }
  </style>
`;

const html = `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ad On Digital Pricing | Ad On Group</title>
<meta name="description" content="Ad On Digital bundle and package pricing.">
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

const total = 2 + GROUPS.reduce((n, g) => n + g.items.length, 0);
console.log(`  wrote digital-pricing/index.html — ${total} priced entries`);
console.log(`    ${ACCELERATOR.name.padEnd(28)} ${ACCELERATOR.price}/mo (RRP ${ACCELERATOR.rrp})  set-up ${ACCELERATOR.setup}`);
console.log(`    ${(STIMULUS.name + " 2-5 products").padEnd(28)} $400-$700/mo  set-up matches`);
for (const g of GROUPS) {
  for (const it of g.items) {
    console.log(`    ${it.name.padEnd(28)} ${it.price}/mo  set-up ${it.setup}${it.check ? "   <-- superseded list, needs confirming" : ""}`);
  }
}
