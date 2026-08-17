#!/usr/bin/env node
/**
 * build-digital-pricing.js — /digital-pricing/, the Ad On Digital price list.
 *
 * CLIENT FACING. An account manager screenshares this during a call, so there
 * is nothing on it about where it came from: no "old pages", no last-edited
 * dates, no internal notes, no dead enquiry buttons.
 *
 * WHERE THE WORDS AND FIGURES COME FROM
 * src/_data/oldPages.json, which scripts/extract-old-pages.py pulls from the
 * PUBLISHED rows of the WordPress dump. Every product name, feature, benefit,
 * FAQ answer and price here is the site's own copy. This build reformats it;
 * it does not write it. That rule exists because the two earlier versions of
 * this page summarised the products instead, and to do that they had to pick
 * between figures and picked wrong.
 *
 * ONE PRICE PER PRODUCT
 * Where a page carried competing figures for the same thing, the price on the
 * page it belongs to wins, and it is the only one shown. The earlier
 * "conflicts" were an artefact of reading revision rows: the parser stopped at
 * the first ";" and never reached the published pages, so 2022 drafts were
 * being compared against each other. Read properly there is one current price
 * per product and no conflict to resolve.
 *
 * Add-ons are shown separately from the product price, because they are extra
 * line items rather than an alternative price for the same thing — the video
 * option on a website, the YouTube production fee on Google Ads Video, the
 * extra send bundles on a Brochure Campaign.
 *
 * NOT INCLUDED
 *   Online Accelerator and Stimulus  — discontinued (Taryn).
 *   Easy Rate App                    — its page carries no price at all.
 *   Products                         — an index page, replaced by this one.
 *
 * noindex, and linked from nowhere.
 *
 * Usage:  node scripts/build-digital-pricing.js
 *   (re-extract first with: python3 scripts/extract-old-pages.py)
 */

const fs = require("fs");
const path = require("path");
const { parse } = require("node-html-parser");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const ALL = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "_data", "oldPages.json"), "utf8"));

const SKIP = new Set(["products", "online-accelerator", "easy-rate-app"]);
const PAGES = ALL.filter((p) => !SKIP.has(p.slug));

const SHELL = fs.readFileSync(path.join(PUBLIC, "contact-us", "index.html"), "utf8");
const headHtml = SHELL.slice(0, SHELL.indexOf("</head>"));
const ASSETS =
  (headHtml.match(/<link rel="preload"[^>]*>/g) || []).join("\n") +
  "\n" +
  (headHtml.match(/<style>[\s\S]*?<\/style>/g) || []).join("\n");

const BLUE = "#1BABE5", INK = "#0B1220", GREY = "#5A6473";

/** Section headings that structure a page rather than name a product. */
const STRUCTURAL = /^(features|key features|benefits|package inclusions|got questions\??|frequently asked questions|faqs?|start your consultation now|don'?t take our word for it|we focus in 3 areas)$/i;
/** Headings that were only there to introduce a form that no longer exists. */
const DROP_HEADING = /^(start your consultation now|enquire now)$/i;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const txt = (n) => (n.textContent || "").replace(/\s+/g, " ").trim();
const isPrice = (s) => /^\$[\d,]+/.test(s.trim());
/**
 * A video embed that lost its player leaves the raw URL behind as body text —
 * /video-flexi/ carried a bare Wistia iframe URL. It is not copy, and it was
 * the one thing on the page long enough to overflow a phone.
 */
const isBareUrl = (s) => /^https?:\/\/\S+$/i.test(s.trim());

/** Nicely-cased product titles where the source shouted or ran words together. */
const TITLE_FIX = {
  "websites": "Websites",
  "seo finder": "SEO Finder",
  "blogs": "Blogs",
  "video flexi": "Video Flexi",
  "review me": "Review Me",
  "brochure campaign": "Brochure Campaign",
  "google ads management": "Google Ads Management",
  "facebook / instagram packages": "Facebook and Instagram",
};

// --------------------------------------------------------------- parsing

/** Flatten a page into an ordered list of simple blocks. */
function blocks(html) {
  const root = parse(html, { blockTextElements: {} });
  const out = [];

  const walk = (node) => {
    for (const c of node.childNodes) {
      if (c.nodeType === 3) {
        const t = (c.rawText || "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
        if (t && !isBareUrl(t)) out.push({ k: "text", t });
        continue;
      }
      if (c.nodeType !== 1) continue;
      const tag = c.rawTagName ? c.rawTagName.toLowerCase() : "";

      if (/^h[1-6]$/.test(tag)) {
        const t = txt(c);
        if (t) out.push({ k: "h", level: +tag[1], t });
      } else if (tag === "p") {
        const t = txt(c);
        if (t && !isBareUrl(t)) out.push({ k: "p", t });
      } else if (tag === "ul" || tag === "ol") {
        const items = c.querySelectorAll("li").map((li) => txt(li)).filter(Boolean);
        if (items.length) out.push({ k: "ul", items });
      } else if (tag === "img") {
        const src = c.getAttribute("src") || "";
        const w = parseInt(c.getAttribute("width") || "0", 10);
        // the tick graphic that prefixes every feature row is not an illustration
        if (src && !/ic-check/i.test(src) && w !== 20) {
          out.push({ k: "img", src, alt: c.getAttribute("alt") || "" });
        }
      } else if (tag === "a" || tag === "br" || tag === "script" || tag === "style") {
        // dead enquiry links and spacers: drop
        if (tag === "a") {
          const t = txt(c);
          if (t && !/enquire|consultation|click here/i.test(t)) out.push({ k: "text", t });
        }
      } else {
        walk(c);
      }
    }
  };
  walk(root);
  return out;
}

/**
 * Pull a price out of the run of blocks that follows a "$400" heading.
 * The source writes it as a heading for the amount, an <h6> for the period,
 * then loose text for the set-up fee, the term, and any add-on.
 */
function readPrice(bl, i) {
  const amount = bl[i].t.trim().replace(/\s+/g, " ");
  const price = { amount, period: "", setup: "", term: "", addons: [], notes: [] };
  let j = i + 1;
  for (; j < bl.length; j++) {
    const b = bl[j];
    if (b.k === "h" && !/excluding|ex\b|per month/i.test(b.t)) break;
    if (b.k === "ul" || b.k === "img") break;
    const t = (b.t || "").trim();
    if (!t) continue;
    if (/^ex(cluding)?\s*(gst)?\s*per month$/i.test(t)) { price.period = "per month, excluding GST"; continue; }
    // the Facebook pages write it "once-off set-up fee"; the rest "once off set up fee"
    if (/once[-\s]?off set[-\s]?up fee/i.test(t)) { price.setup = (t.match(/\$[\d,]+/) || [""])[0]; continue; }
    if (/minimum term/i.test(t)) { price.term = t.replace(/^\*+/, "").trim(); continue; }
    // "$800 per month management fee" restates the headline price rather than
    // adding to it, so it is not an extra.
    const same = (t.match(/\$[\d,]+/) || [""])[0] === amount;
    if (same && /management fee/i.test(t)) continue;
    if (/\$[\d,]+/.test(t) && /per month|per day/i.test(t) && !same) { price.addons.push(t.replace(/^\*+/, "").trim()); continue; }
    if (t.length > 8) price.notes.push(t.replace(/^\*+/, "").trim());
  }
  return { price, next: j };
}

/** Turn a flat block list into products, prose, FAQs and quotes. */
function model(page) {
  const bl = blocks(page.html);
  const m = { slug: page.slug, title: "", intro: [], hero: null, products: [], prose: [], faqs: [], quotes: [] };

  // title: first heading that is not a price
  const firstH = bl.find((b) => b.k === "h" && !isPrice(b.t));
  const rawTitle = firstH ? firstH.t : page.title;
  m.title = TITLE_FIX[rawTitle.toLowerCase()] || TITLE_FIX[page.title.toLowerCase()] || rawTitle;

  let mode = "intro";
  let cur = null;      // current product
  let bucket = null;   // "features" | "benefits"
  let q = null;

  const openProduct = (name) => {
    cur = { name, features: [], benefits: [], paras: [], price: null, img: null };
    m.products.push(cur);
    bucket = null;
  };

  for (let i = 0; i < bl.length; i++) {
    const b = bl[i];

    if (b.k === "h") {
      const t = b.t.trim();

      if (isPrice(t)) {
        const { price, next } = readPrice(bl, i);
        if (!cur) openProduct(m.title);
        cur.price = price;
        i = next - 1;
        continue;
      }
      if (DROP_HEADING.test(t)) continue;
      if (/^(got questions\??|frequently asked questions|faqs?)$/i.test(t)) { mode = "faq"; q = null; continue; }
      if (/^don'?t take our word for it$/i.test(t)) { mode = "quotes"; continue; }
      if (/^(features|key features|package inclusions)$/i.test(t)) { bucket = "features"; continue; }
      if (/^benefits$/i.test(t)) { bucket = "benefits"; continue; }

      if (mode === "faq" && b.level >= 5) { q = { q: t, a: "" }; m.faqs.push(q); continue; }
      if (mode === "quotes") { m.quotes.push({ name: t, text: "" }); continue; }

      // a real product heading, or a prose sub-heading
      if (b.level <= 3 && !STRUCTURAL.test(t) && b !== firstH && !t.endsWith("?")) {
        // treat as a product only if a price follows before the next h1-h3
        let priced = false;
        for (let k = i + 1; k < bl.length; k++) {
          const n = bl[k];
          if (n.k === "h" && isPrice(n.t)) { priced = true; break; }
          if (n.k === "h" && n.level <= 3 && !STRUCTURAL.test(n.t)) break;
        }
        if (priced) { openProduct(t); mode = "product"; continue; }
      }
      if (b !== firstH) m.prose.push({ k: "h", t });
      continue;
    }

    if (mode === "faq" && q) { q.a = (q.a ? q.a + " " : "") + (b.t || ""); continue; }
    if (mode === "quotes" && m.quotes.length) {
      const last = m.quotes[m.quotes.length - 1];
      if (b.k === "p" || b.k === "text") last.text = (last.text ? last.text + " " : "") + b.t;
      continue;
    }

    if (b.k === "img") {
      if (!m.hero) m.hero = b;
      else if (cur && !cur.img) cur.img = b;
      continue;
    }
    if (b.k === "ul") {
      if (cur && bucket) cur[bucket].push(...b.items);
      else if (cur) cur.features.push(...b.items);
      else m.prose.push(b);
      continue;
    }
    if (b.k === "p" || b.k === "text") {
      if (mode === "intro") m.intro.push(b.t);
      else if (cur) cur.paras.push(b.t);
      else m.prose.push({ k: "p", t: b.t });
    }
  }

  m.faqs = m.faqs.filter((f) => f.a.trim());
  m.quotes = m.quotes.filter((x) => x.text.trim());
  m.products = m.products.filter((p) => p.price);
  return m;
}

// --------------------------------------------------------------- rendering

const tick = `<span style="flex:none;width:20px;height:20px;border-radius:6px;background:${BLUE};display:inline-flex;align-items:center;justify-content:center;margin-top:2px"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>`;

const list = (items, label) => !items.length ? "" : `
        <div style="margin:18px 0 0">
          ${label ? `<div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#8A93A1;font-weight:700">${label}</div>` : ""}
          <div style="display:flex;flex-direction:column;gap:10px;margin:11px 0 0">
            ${items.map((t) => `<div style="display:flex;align-items:flex-start;gap:11px">${tick}<span style="font-size:15px;line-height:1.55;color:#1F2733">${esc(t)}</span></div>`).join("\n            ")}
          </div>
        </div>`;

const priceBox = (p) => `
        <div style="background:rgba(27,171,229,0.06);border:1px solid rgba(27,171,229,0.22);border-radius:16px;padding:20px">
          <div style="display:flex;align-items:baseline;gap:8px">
            <span style="font-size:38px;font-weight:800;letter-spacing:-0.04em;color:${BLUE};line-height:1">${esc(p.amount)}</span>
          </div>
          <div style="font-size:14px;color:${GREY};margin-top:4px">${esc(p.period || "per month, excluding GST")}</div>
          ${p.setup || p.term ? `<div style="height:1px;background:rgba(11,18,32,0.10);margin:15px 0"></div>
          <div style="font-size:14px;line-height:1.6;color:${GREY}">
            ${p.setup ? `<div><strong style="color:${INK}">${esc(p.setup)}</strong> once off set-up fee</div>` : ""}
            ${p.term ? `<div style="margin-top:6px">${esc(p.term)}</div>` : ""}
          </div>` : ""}
          ${p.addons.length ? `<div style="height:1px;background:rgba(11,18,32,0.10);margin:15px 0"></div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:0.13em;text-transform:uppercase;color:#8A93A1;font-weight:700">Optional extras</div>
          ${p.addons.map((a) => `<div style="font-size:14px;line-height:1.55;color:${GREY};margin-top:7px">${esc(a)}</div>`).join("")}` : ""}
          ${p.notes.length ? `<div style="margin-top:14px">${p.notes.map((a) => `<div style="font-size:13px;line-height:1.55;color:#8A93A1;margin-top:6px">${esc(a)}</div>`).join("")}</div>` : ""}
        </div>`;

const productCard = (pr, single) => `
    <div style="background:#fff;border:1px solid rgba(11,18,32,0.08);border-radius:20px;padding:28px;margin:16px 0 0;box-shadow:0 20px 46px -32px rgba(11,18,32,0.3)">
      <div class="prod-grid" style="display:grid;grid-template-columns:1.3fr 0.7fr;gap:30px;align-items:start">
        <div style="min-width:0">
          ${single ? "" : `<div style="font-size:21px;font-weight:800;letter-spacing:-0.026em;color:${INK}">${esc(pr.name)}</div>`}
          ${pr.paras.map((t) => `<p style="font-size:15.5px;line-height:1.65;color:${GREY};margin:${single ? "0" : "10px"} 0 0">${esc(t)}</p>`).join("")}
          ${list(pr.features, pr.benefits.length ? "Features" : "")}
          ${list(pr.benefits, "Benefits")}
        </div>
        <div>${priceBox(pr.price)}</div>
      </div>
    </div>`;

const shell = (title, desc, bodyHtml) => `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex">
${ASSETS}
<style>
  .wrap { max-width: 980px; margin: 0 auto; padding: 0 24px; }
  details.faq { border-top: 1px solid rgba(11,18,32,0.08); }
  details.faq summary { list-style: none; cursor: pointer; padding: 16px 0; font-size: 15.5px; font-weight: 700; color: ${INK}; display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
  details.faq summary::-webkit-details-marker { display: none; }
  details.faq summary::after { content: "+"; flex: none; color: ${BLUE}; font-weight: 700; font-size: 19px; line-height: 1; }
  details.faq[open] summary::after { content: "\\2212"; }
  details.faq p { font-size: 15px; line-height: 1.65; color: ${GREY}; margin: 0 0 16px; }
  @media (max-width: 820px) {
    .prod-grid { grid-template-columns: 1fr !important; gap: 22px !important; }
    /* price first on a phone: it is what the call is about */
    .prod-grid > div:last-child { order: -1; }
    .idx-row { flex-direction: column; align-items: flex-start !important; gap: 8px !important; }
    .idx-row > span:last-child { text-align: left !important; }
  }
</style>
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

const MODELS = PAGES.map(model);

// --------------------------------------------------------------- subpages

for (let i = 0; i < MODELS.length; i++) {
  const m = MODELS[i];
  const prev = MODELS[i - 1], next = MODELS[i + 1];
  const single = m.products.length === 1 && m.products[0].name === m.title;

  const body = `
  <section class="wrap" style="padding-top:52px">
    <a href="/digital-pricing/" style="font-size:14px;font-weight:600;color:${BLUE};text-decoration:none">&larr; All pricing</a>
    <h1 style="font-size:clamp(29px,3.8vw,44px);line-height:1.06;letter-spacing:-0.04em;font-weight:600;color:${INK};margin:16px 0 0">${esc(m.title)}</h1>
    ${m.intro.map((t) => `<p style="font-size:16.5px;line-height:1.68;color:${GREY};margin:14px 0 0;max-width:66ch">${esc(t)}</p>`).join("")}
  </section>

  <section class="wrap" style="padding-top:14px;padding-bottom:${m.faqs.length ? "10" : "70"}px">
    ${m.products.map((p) => productCard(p, single)).join("")}
  </section>

  ${m.faqs.length ? `<section class="wrap" style="padding-bottom:60px">
    <div style="background:#fff;border:1px solid rgba(11,18,32,0.08);border-radius:20px;padding:8px 26px 10px;margin:22px 0 0;box-shadow:0 20px 46px -32px rgba(11,18,32,0.3)">
      <div style="font-size:19px;font-weight:800;letter-spacing:-0.024em;color:${INK};padding:20px 0 6px">Common questions</div>
      ${m.faqs.map((f) => `<details class="faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("\n      ")}
    </div>
  </section>` : ""}

  <section class="wrap" style="padding-bottom:70px;display:flex;justify-content:space-between;gap:16px">
    <span>${prev ? `<a href="/digital-pricing/${prev.slug}/" style="font-size:14px;font-weight:600;color:${BLUE};text-decoration:none">&larr; ${esc(prev.title)}</a>` : ""}</span>
    <span style="text-align:right">${next ? `<a href="/digital-pricing/${next.slug}/" style="font-size:14px;font-weight:600;color:${BLUE};text-decoration:none">${esc(next.title)} &rarr;</a>` : ""}</span>
  </section>
`;
  write(path.join("digital-pricing", m.slug), shell(`${m.title} | Ad On Group`, `${m.title} pricing.`, body));
}

// --------------------------------------------------------------- index

const indexBody = `
  <section class="wrap" style="padding-top:56px">
    <h1 style="font-size:clamp(30px,4vw,46px);line-height:1.05;letter-spacing:-0.042em;font-weight:600;color:${INK};margin:0">Ad On Digital <span style="color:${BLUE}">pricing</span>.</h1>
    <p style="font-size:16.5px;line-height:1.65;color:${GREY};margin:14px 0 0;max-width:600px">All prices exclude GST. Every package has a 12 month minimum term, then month by month.</p>
  </section>

  <section class="wrap" style="padding-top:24px;padding-bottom:70px">
    ${MODELS.map((m) => `
    <div style="background:#fff;border:1px solid rgba(11,18,32,0.08);border-radius:20px;padding:22px 26px;margin:14px 0 0;box-shadow:0 20px 46px -32px rgba(11,18,32,0.3)">
      <a href="/digital-pricing/${m.slug}/" style="text-decoration:none;display:block"><span style="font-size:18px;font-weight:800;letter-spacing:-0.024em;color:${INK}">${esc(m.title)}</span></a>
      <div style="display:flex;flex-direction:column;margin:12px 0 0">
        ${m.products.map((p, i) => `<a class="idx-row" href="/digital-pricing/${m.slug}/" style="display:flex;align-items:center;justify-content:space-between;gap:20px;text-decoration:none;padding:11px 0;${i ? "border-top:1px solid rgba(11,18,32,0.07)" : ""}">
          <span style="font-size:15.5px;color:#1F2733;min-width:0">${esc(p.name === m.title ? "" : p.name)}</span>
          <span style="flex:none;text-align:right;white-space:nowrap"><strong style="font-size:17px;font-weight:800;color:${INK}">${esc(p.price.amount)}</strong><span style="font-size:12.5px;color:#8A93A1;font-weight:600"> /mo</span>${p.price.setup ? `<span style="font-size:12.5px;color:#8A93A1"> &middot; ${esc(p.price.setup)} set-up</span>` : ""}</span>
        </a>`).join("")}
      </div>
    </div>`).join("")}
  </section>
`;

write("digital-pricing", shell("Ad On Digital Pricing | Ad On Group", "Ad On Digital package pricing.", indexBody));

const n = MODELS.reduce((a, m) => a + m.products.length, 0);
console.log(`  wrote digital-pricing/ index + ${MODELS.length} product pages, ${n} priced packages`);
for (const m of MODELS) {
  console.log(`    ${m.title}`);
  for (const p of m.products) {
    console.log(`      ${p.name.padEnd(34)} ${p.price.amount.padEnd(7)} set-up ${(p.price.setup || "-").padEnd(6)} ${p.price.addons.length ? "+" + p.price.addons.length + " extra" : ""}`);
  }
  console.log(`      ${String(m.faqs.length).padStart(2)} FAQs${m.quotes.length ? `, ${m.quotes.length} quotes dropped` : ""}`);
}
