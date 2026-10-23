#!/usr/bin/env node
/**
 * build-digital-products.js — the Ad On Digital products, visible and in the
 * new look.
 *
 * The products were only reachable two ways: the old WordPress-styled pages at
 * /websites/, /finder-seo-package/ and so on, linked from nothing in the new
 * header, and /digital-pricing/, which is noindex and linked from nowhere. The
 * /ad-on-digital/ page itself listed the services as plain labels that went
 * nowhere. Taryn asked for the products to be visible again, using the previous
 * content, styled to match the rest of the site.
 *
 * This writes three things, all from the same copy:
 *
 *   1. Six service boxes on /ad-on-digital/ ("Everything you need to get
 *      found"), each with a short summary and a Learn more link.
 *   2. A product menu bar under the header, on /ad-on-digital/ and on every
 *      product page, so the products are one click away and never hidden in a
 *      dropdown.
 *   3. A product page per service, at the URL the old site used, so existing
 *      links and search rankings carry over. /blogs/ is now the Workforce blog
 *      index, so the blog-writing product moves to /blog-writing/.
 *
 * SEARCH TITLES
 * Each page keeps the <title> and meta description the old page ranked with,
 * so moving to the new look does not cost search traffic. /blog-writing/ is a
 * new URL and has its own.
 *
 * WHERE THE WORDS AND FIGURES COME FROM
 * The package names, features, benefits, prices and FAQs are the old site's own
 * copy, read through build-digital-pricing.js's parser so the two can never
 * disagree on a price. The box summaries, highlights and headings below are new
 * and short, written from that copy.
 *
 * NOT INCLUDED (Taryn): Domains, Video Ads (Video Flexi), Workforce.
 *
 * Idempotent: the /ad-on-digital/ blocks sit between markers and are replaced
 * on every run; the product pages are rewritten whole.
 *
 * Usage:  node scripts/build-digital-products.js
 */

const fs = require("fs");
const path = require("path");
const { PAGES, model, list, priceBox, esc, BLUE, INK, GREY } = require("./build-digital-pricing.js");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const HUB = path.join(PUBLIC, "ad-on-digital", "index.html");
const SITE = "https://adongroup.com.au";

const icon = (d) => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

/** The six products, in the order they appear everywhere. */
const PRODUCTS = [
  {
    slug: "websites", url: "/websites/", name: "Websites",
    title: "Websites | Ad On Group",
    description: "All our websites are not only written, designed and produced for you but they all come with an option for a motion graphics video.",
    icon: icon('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
    h1: 'Websites that <span style="color:#1BABE5">grow with you</span>.',
    summary: "Fully managed websites, written, designed and built for you, then kept up to date as your business changes.",
    highlights: ["Up to 12 pages, content written for you", "Hosting, security and updates included", "Ecommerce option for up to 30 products"],
    why: 'So what makes our websites <span style="color:#1BABE5">different</span>?',
  },
  {
    slug: "finder-seo-package", url: "/finder-seo-package/", name: "SEO",
    title: "SEO Packages & Search Engine Optimisation | Ad On Group",
    description: "SEO packages for Australian businesses — keyword strategy, an initial audit and roadmap, ongoing optimisation and monthly ranking reports.",
    icon: icon('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
    h1: 'Get found on <span style="color:#1BABE5">Google&rsquo;s first page</span>.',
    summary: "Monthly SEO that follows Google’s best practice, with regular content and a report that shows exactly where you rank.",
    highlights: ["Website audit and keyword plan", "On-page, off-page and local SEO", "Easy-to-read monthly ranking reports"],
    why: 'SEO that follows <span style="color:#1BABE5">Google&rsquo;s best practice</span>.',
  },
  {
    slug: "google-ads-management", url: "/google-ads-management/", name: "Google Ads",
    title: "Google Ads Management Services | Ad On Group",
    description: "Google Ads management for Australian businesses — keyword research, campaign build, bid management and monthly reporting from a Google Partner agency.",
    icon: icon('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>'),
    h1: 'Ads that match <span style="color:#1BABE5">the search</span>.',
    summary: "Search, Display, YouTube and Remarketing campaigns, set up and managed by Google Ads certified specialists.",
    highlights: ["Google Ads certified specialists", "Search, Display, Video and Remarketing", "Conversion tracking on calls and leads"],
    why: 'Google Ads, <span style="color:#1BABE5">managed properly</span>.',
  },
  {
    slug: "facebook-packages", url: "/facebook-packages/", name: "Facebook & Instagram",
    title: "Facebook & Instagram Advertising Packages | Ad On Group",
    description: "Managed Facebook and Instagram advertising packages — campaign setup, ad creative, audience targeting and monthly reporting, run by an Australian team.",
    icon: icon('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'),
    h1: 'Reach customers <span style="color:#1BABE5">where they scroll</span>.',
    summary: "Awareness and Lead Generation packages for Facebook and Instagram, with the creative, audiences and retargeting handled for you.",
    highlights: ["Ad creative and copywriting included", "Lookalike audiences and retargeting", "Awareness or lead generation packages"],
    why: 'Billions of people log on <span style="color:#1BABE5">every day</span>.',
  },
  {
    slug: "brochure-campaign", url: "/brochure-campaign/", name: "Digital Brochures",
    title: "Brochure Campaign | Ad On Group",
    description: "Stay front of mind with the customers who matter most. Ad On Group brochure campaigns keep your brand in front of your existing customer base.",
    icon: icon('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>'),
    h1: 'Stay <span style="color:#1BABE5">front of mind</span> with your customers.',
    summary: "A designed digital brochure every two months, emailed or texted to your customer base to drive repeat business.",
    highlights: ["Concept, copy and design every 2 months", "Sent by email or SMS for you", "Reports on views, opens and actions"],
    why: 'Put a digital fence around <span style="color:#1BABE5">your customers</span>.',
  },
  {
    slug: "blogs", url: "/blog-writing/", name: "Blogs & Content",
    title: "Blog Writing Services | Ad On Group",
    description: "Regular, relevant blogs written for your website — topics planned with you, keyword placement and tagging — to build trust and help Google find your business.",
    icon: icon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>'),
    h1: 'Content that <span style="color:#1BABE5">builds trust</span>.',
    summary: "Regular, relevant blogs that connect with your customers and help Google show your business when people search.",
    highlights: ["Topics planned with your input", "Up to 500 words every 2 months", "Keyword placement and tagging"],
    why: 'Why regular blogs <span style="color:#1BABE5">matter</span>.',
  },
];

/** Spelling slips in the old copy. Everything else is left as it was written. */
const TYPOS = [
  [/all devises/g, "all devices"],
  [/the Googles paid ads/g, "Google’s paid ads"],
];
const tidy = (s) => TYPOS.reduce((t, [a, b]) => t.replace(a, b), s);

const models = new Map(PAGES.map((p) => [p.slug, model(p)]));
for (const p of PRODUCTS) {
  if (!models.has(p.slug)) throw new Error(`no old copy for ${p.slug}`);
}

// --------------------------------------------------------------- shared pieces

const eyebrow = (t) => `<span style="display:inline-flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:15px;letter-spacing:0.16em;color:${BLUE};text-transform:uppercase"><span style="width:22px;height:1.5px;background:${BLUE}"></span>${t}</span>`;
const h2 = (t) => `<h2 style="font-size:clamp(24px,3vw,38px);line-height:1.1;letter-spacing:-0.03em;font-weight:800;margin:14px 0 0;color:${INK}">${t}</h2>`;
const glass = "background:rgba(255,255,255,0.62);backdrop-filter:blur(16px) saturate(150%);-webkit-backdrop-filter:blur(16px) saturate(150%);border:1px solid rgba(255,255,255,0.85);box-shadow:0 16px 40px -26px rgba(11,18,32,0.22)";
const tickSm = `<span style="flex:none;width:18px;height:18px;border-radius:5px;background:rgba(27,171,229,0.14);display:inline-flex;align-items:center;justify-content:center;margin-top:2px"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="${BLUE}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>`;

/** Lowest monthly price across a product's packages, for "from $X". */
const fromPrice = (m) => {
  const n = m.products.map((p) => parseInt(p.price.amount.replace(/[^\d]/g, ""), 10)).filter(Boolean);
  return n.length ? "$" + Math.min(...n).toLocaleString("en-AU") : "";
};

const STYLE = `<style id="dg-style">
  .dg-bar{border-bottom:1px solid rgba(11,18,32,0.06);background:rgba(252,251,250,0.6)}
  .dg-bar-in{max-width:1268px;margin:0 auto;padding:10px 24px;display:flex;align-items:center;gap:8px;overflow-x:auto;scrollbar-width:none}
  .dg-bar-in::-webkit-scrollbar{display:none}
  .dg-bar-label{flex:none;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${BLUE};text-decoration:none;margin-right:6px;white-space:nowrap}
  .dg-bar a.dg-tab{flex:none;font-size:14px;font-weight:600;color:#3A434F;text-decoration:none;padding:7px 14px;border-radius:999px;border:1px solid transparent;white-space:nowrap;transition:background .18s ease,color .18s ease}
  .dg-bar a.dg-tab:hover{background:rgba(27,171,229,0.08);color:#1483B5}
  .dg-bar a.dg-tab[aria-current="page"]{background:${BLUE};color:#fff}
  .dg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  .dg-card{display:flex;flex-direction:column;text-decoration:none;color:inherit;border-radius:18px;padding:26px;transition:transform .22s ease,box-shadow .22s ease}
  .dg-card:hover{transform:translateY(-3px);box-shadow:0 26px 48px -26px rgba(11,18,32,0.32)}
  .dg-card:hover .dg-more{gap:10px}
  .dg-more{display:inline-flex;align-items:center;gap:6px;margin-top:auto;padding-top:20px;font-size:15px;font-weight:700;color:${BLUE};transition:gap .18s ease}
  .dg-hero{display:grid;grid-template-columns:1.1fr 0.9fr;gap:56px;align-items:center}
  .dg-pkg{display:grid;grid-template-columns:1.3fr 0.7fr;gap:30px;align-items:start}
  .dg-cta{text-decoration:none;font-size:16px;font-weight:700;padding:15px 28px;border-radius:14px;display:inline-flex;align-items:center;gap:9px;transition:transform .22s ease, box-shadow .22s ease}
  .dg-cta:hover{transform:translateY(-2px)}
  details.dg-faq summary{list-style:none;display:flex;justify-content:space-between;gap:16px;align-items:flex-start}
  details.dg-faq summary::-webkit-details-marker{display:none}
  details.dg-faq summary::after{content:"+";flex:none;color:${BLUE};font-weight:700;font-size:20px;line-height:1}
  details.dg-faq[open] summary::after{content:"\\2212"}
  @media (max-width:960px){ .dg-grid{grid-template-columns:repeat(2,1fr)} }
  @media (max-width:820px){
    .dg-hero,.dg-pkg{grid-template-columns:1fr;gap:28px}
    .dg-pkg > div:last-child{order:-1}
  }
  @media (max-width:620px){ .dg-grid{grid-template-columns:1fr} .dg-bar-in{padding:10px 16px} }
</style>`;

/** The product menu bar: always visible, never a dropdown. */
const menuBar = (current) => `<div class="dg-bar">
    <nav class="dg-bar-in" aria-label="Ad On Digital services">
      <a class="dg-bar-label" href="/ad-on-digital/"${current ? "" : ' aria-current="page"'}>Ad On Digital</a>
      ${PRODUCTS.map((p) => `<a class="dg-tab" href="${p.url}"${p === current ? ' aria-current="page"' : ""}>${esc(p.name)}</a>`).join("\n      ")}
    </nav>
  </div>`;

/** A service box: icon, name, summary, three highlights, Learn more. */
const card = (p) => `<a class="dg-card" href="${p.url}" style="${glass}">
        <div style="width:44px;height:44px;border-radius:13px;background:linear-gradient(135deg,#1BABE5,#5FCDF5);display:flex;align-items:center;justify-content:center;box-shadow:0 10px 20px -8px rgba(27,171,229,0.6)">${p.icon}</div>
        <div style="font-size:19px;font-weight:800;letter-spacing:-0.02em;color:${INK};margin:18px 0 8px">${esc(p.name)}</div>
        <p style="font-size:15px;line-height:1.6;color:#4A5462;margin:0">${esc(p.summary)}</p>
        <div style="display:flex;flex-direction:column;gap:9px;margin-top:16px">
          ${p.highlights.map((t) => `<div style="display:flex;align-items:flex-start;gap:10px">${tickSm}<span style="font-size:14px;line-height:1.5;color:#1F2733">${esc(t)}</span></div>`).join("\n          ")}
        </div>
        <span class="dg-more">Learn more <span aria-hidden="true">&rarr;</span></span>
      </a>`;

const cards = (items) => `<div class="dg-grid">
      ${items.map(card).join("\n      ")}
    </div>`;

// --------------------------------------------------------------- the hub

const MENU_START = "<!-- digital-menu:start -->", MENU_END = "<!-- digital-menu:end -->";
const BOX_START = "<!-- digital-services:start -->", BOX_END = "<!-- digital-services:end -->";

/** Replace the block between two markers, or put it at `fallback` the first time. */
function splice(html, start, end, block, fallback) {
  const i = html.indexOf(start);
  if (i !== -1) {
    const j = html.indexOf(end, i);
    return html.slice(0, i) + block + html.slice(j + end.length);
  }
  const at = fallback(html);
  if (!at) throw new Error(`could not place ${start}`);
  return html.slice(0, at[0]) + block + html.slice(at[1]);
}

let hub = fs.readFileSync(HUB, "utf8");

hub = splice(hub, MENU_START, MENU_END, `${MENU_START}\n  ${STYLE}\n  ${menuBar(null)}\n  ${MENU_END}`, (h) => {
  const at = h.indexOf("</nav>", h.indexOf("data-aog-header")) + "</nav>".length;
  return [at, at];
});

// First run: the boxes replace the row of plain service labels.
hub = splice(hub, BOX_START, BOX_END, `${BOX_START}
    <p style="font-size:16px;line-height:1.6;color:${GREY};margin:16px auto 0;max-width:640px;text-align:center">Six fully managed services that work together, so every part of your marketing pulls in the same&nbsp;direction.</p>
    <div style="margin:34px 0 0">
    ${cards(PRODUCTS)}
    </div>
    ${BOX_END}`, (h) => {
  const m = /<div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;max-width:820px;margin:30px auto 0">[\s\S]*?<\/div>/.exec(h);
  return m && [m.index, m.index + m[0].length];
});

fs.writeFileSync(HUB, hub);

// --------------------------------------------------------------- product pages

// The page frame is /ad-on-digital/'s own: head, header, CTA and footer.
const head = hub.slice(0, hub.indexOf("</head>"))
  .replace(/<style id="dg-style">[\s\S]*?<\/style>/, "");
const navEnd = hub.indexOf("</nav>", hub.indexOf("data-aog-header")) + "</nav>".length;
const bodyOpen = hub.slice(hub.indexOf("</head>"), navEnd);
const footer = hub.slice(hub.indexOf("<!-- ======================= FOOTER"));
const ctaSection = (/<section id="contact"[\s\S]*?<\/section>/.exec(hub) || [""])[0];

function pageHead(p, title, desc) {
  const url = SITE + p.url;
  return head
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(desc)}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(desc)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    + STYLE + "\n";
}

/** A short line that ends in "?" reads as a subheading, not a paragraph. */
const para = (t) => t.length < 90 && /\?$/.test(t)
  ? `<h3 style="font-size:20px;line-height:1.25;letter-spacing:-0.02em;font-weight:800;color:${INK};margin:26px 0 0">${esc(t)}</h3>`
  : `<p style="font-size:16.5px;line-height:1.7;color:#4A5462;margin:16px 0 0">${esc(tidy(t))}</p>`;

/** Prose outside the packages: keep a heading only when it introduces a list. */
function prose(m) {
  const out = [];
  for (let i = 0; i < m.prose.length; i++) {
    const b = m.prose[i], next = m.prose[i + 1];
    if (b.k === "h" && next && next.k === "ul") {
      out.push(`<div style="margin:26px 0 0;${glass};border-radius:16px;padding:22px 24px">
        <div style="font-size:17px;font-weight:800;letter-spacing:-0.015em;color:${INK}">${esc(b.t)}</div>
        ${list(next.items.map(tidy), "")}
      </div>`);
      i++;
    } else if (b.k === "p") {
      out.push(para(b.t));
    }
  }
  return out.join("\n      ");
}

const packageCard = (pr, single) => `
      <div style="${glass};border-radius:20px;padding:28px;margin:18px 0 0">
        <div class="dg-pkg">
          <div style="min-width:0">
            ${single ? "" : `<h3 style="font-size:22px;font-weight:800;letter-spacing:-0.026em;color:${INK};margin:0">${esc(pr.name)}</h3>`}
            ${pr.paras.map((t) => `<p style="font-size:15.5px;line-height:1.65;color:${GREY};margin:${single ? "0" : "10px"} 0 0">${esc(tidy(t))}</p>`).join("")}
            ${list(pr.features.map(tidy), pr.benefits.length ? "Features" : "")}
            ${list(pr.benefits.map(tidy), "Benefits")}
          </div>
          <div>
            ${priceBox(pr.price)}
            <a class="dg-cta" href="/contact-us/" style="margin-top:14px;width:100%;justify-content:center;color:#fff;background:${BLUE};box-shadow:0 14px 26px -10px rgba(27,171,229,0.6)">Enquire now</a>
          </div>
        </div>
      </div>`;

function productPage(p) {
  const m = models.get(p.slug);
  const single = m.products.length === 1;
  const from = fromPrice(m);
  const others = PRODUCTS.filter((o) => o !== p);

  const cta = ctaSection
    .replace(/Ready to get your business&nbsp;found\?/, `Talk to us about ${esc(p.name)}`)
    .replace(/See our digital marketing services in detail and book a&nbsp;chat\./, "Tell us about your business and we&rsquo;ll recommend the right package. No hard sell, just a&nbsp;chat.");

  const body = `
  ${menuBar(p)}

  <header id="top" data-reveal style="max-width:1200px;margin:0 auto;padding:64px 28px 40px">
    <div class="dg-hero">
      <div>
        ${eyebrow(esc(p.name))}
        <h1 style="font-size:clamp(32px,4.6vw,56px);line-height:1.02;letter-spacing:-0.045em;font-weight:600;margin:18px 0 0;color:${INK}">${p.h1}</h1>
        <p style="font-size:17px;line-height:1.65;color:#4A5462;margin:22px 0 0;max-width:540px">${esc(p.summary)}</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:30px">
          <a class="dg-cta" href="#packages" style="color:#fff;background:${BLUE};box-shadow:0 14px 26px -10px rgba(27,171,229,0.6)">See packages</a>
          <a class="dg-cta" href="/contact-us/" style="color:${INK};background:rgba(255,255,255,0.7);border:1px solid rgba(11,18,32,0.14)">Get in touch</a>
        </div>
      </div>
      <div style="${glass};border-radius:22px;padding:30px">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="flex:none;width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#1BABE5,#5FCDF5);display:flex;align-items:center;justify-content:center;box-shadow:0 10px 20px -8px rgba(27,171,229,0.6)">${p.icon}</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8A93A1">At a glance</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;margin-top:22px">
          ${p.highlights.map((t) => `<div style="display:flex;align-items:flex-start;gap:11px">${tickSm}<span style="font-size:15.5px;line-height:1.5;color:#1F2733;font-weight:500">${esc(t)}</span></div>`).join("\n          ")}
          <div style="display:flex;align-items:flex-start;gap:11px">${tickSm}<span style="font-size:15.5px;line-height:1.5;color:#1F2733;font-weight:500">Fully managed by our Australian team</span></div>
        </div>
        ${from ? `<div style="height:1px;background:rgba(11,18,32,0.10);margin:24px 0 18px"></div>
        <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap"><span style="font-size:14px;color:${GREY}">${m.products.length > 1 ? "Packages from" : "From"}</span><span style="font-size:32px;font-weight:800;letter-spacing:-0.04em;color:${BLUE};line-height:1">${from}</span><span style="font-size:14px;color:${GREY}">per month, ex GST</span></div>` : ""}
      </div>
    </div>
  </header>

  <section data-reveal style="max-width:820px;margin:0 auto;padding:24px 28px 32px">
    ${eyebrow("Why Ad On Digital")}
    ${h2(p.why)}
    ${m.intro.map(para).join("\n    ")}
    ${prose(m)}
  </section>

  <section id="packages" data-reveal style="max-width:1080px;margin:0 auto;padding:32px 28px 24px;scroll-margin-top:90px">
    <div style="text-align:center;max-width:720px;margin:0 auto">
      ${eyebrow("Packages")}
      ${h2(single ? `What&rsquo;s <span style="color:${BLUE}">included</span>.` : `Choose your <span style="color:${BLUE}">package</span>.`)}
      <p style="font-size:16px;line-height:1.6;color:#5A6473;margin:16px auto 0">All prices exclude GST. Every package has a 12 month minimum term, then month by&nbsp;month.</p>
    </div>
    ${m.products.map((pr) => packageCard(pr, single)).join("")}
  </section>

  ${m.faqs.length ? `<section data-reveal style="max-width:900px;margin:0 auto;padding:40px 28px 32px">
    <div style="text-align:center;margin:0 auto 34px">${eyebrow("FAQs")}${h2(`Questions, <span style="color:${BLUE}">answered</span>.`)}</div>
    <div style="display:flex;flex-direction:column;gap:14px">
      ${m.faqs.map((f) => `<details class="dg-faq" style="${glass};border-radius:16px;padding:20px 24px"><summary style="font-size:17px;font-weight:700;letter-spacing:-0.015em;color:${INK};cursor:pointer">${esc(tidy(f.q))}</summary><p style="font-size:15.5px;line-height:1.65;color:#4A5462;margin:14px 0 0">${esc(tidy(f.a))}</p></details>`).join("\n      ")}
    </div>
  </section>` : ""}

  <section data-reveal style="max-width:1180px;margin:0 auto;padding:40px 28px 32px">
    <div style="text-align:center;max-width:720px;margin:0 auto 34px">${eyebrow("More from Ad On Digital")}${h2(`One team for your <span style="color:${BLUE}">whole funnel</span>.`)}</div>
    ${cards(others)}
  </section>

  ${cta}
`;

  const html = pageHead(p, p.title, p.description) + bodyOpen + "\n" + body + "\n\n  " + footer;
  const out = path.join(PUBLIC, p.url);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "index.html"), html);
  return m;
}

console.log("  /ad-on-digital/: menu bar + 6 service boxes");
for (const p of PRODUCTS) {
  const m = productPage(p);
  console.log(`  ${p.url.padEnd(26)} ${String(m.products.length).padStart(2)} packages, ${String(m.faqs.length).padStart(2)} FAQs, from ${fromPrice(m)}`);
}
