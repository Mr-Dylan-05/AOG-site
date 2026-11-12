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
 *   1. Seven service boxes on /ad-on-digital/ ("Everything you need to get
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
 * /ai-seo/ is new, so like /blog-writing/ it has its own title. Its package and
 * intro are Taryn's copy, kept in build-digital-pricing.js with the rest.
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
const { buildModels, list, priceBox, esc, BLUE, INK, GREY } = require("./build-digital-pricing.js");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const HUB = path.join(PUBLIC, "ad-on-digital", "index.html");
const SITE = "https://adongroup.com.au";

const icon = (d) => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

/** The seven products, in the order they appear everywhere. */
const PRODUCTS = [
  {
    slug: "websites", url: "/websites/", name: "Websites", showPackageName: true,
    title: "Websites | Ad On Group",
    description: "All our websites are not only written, designed and produced for you but they all come with an option for a motion graphics video.",
    icon: icon('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
    h1: 'Websites that <span style="color:#1BABE5">grow with you</span>.',
    summary: "Fully managed websites, written, designed and built for you, then kept up to date as your business changes.",
    highlights: ["Up to 12 pages, content written for you", "Hosting, security and updates included", "Optional motion graphic video and animated logo"],
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
    slug: "ai-seo", url: "/ai-seo/", name: "AI SEO",
    title: "AI SEO & AI Search Optimisation | Ad On Group",
    description: "AI SEO for Australian businesses: a website audit, monthly blogs, FAQs and review software, to help tools like ChatGPT, Perplexity and Google AI Overviews find and trust your business.",
    icon: icon('<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>'),
    h1: 'Get found in <span style="color:#1BABE5">AI search</span>.',
    summary: "Help tools like ChatGPT, Perplexity and Google AI Overviews read your website, understand your business and trust what they find.",
    highlights: ["Website audit for AI search", "Monthly blogs and a dedicated FAQ section", "Review software to build trust"],
    why: 'Why AI SEO <span style="color:#1BABE5">matters</span>.',
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

const models = new Map(buildModels().map((m) => [m.slug, m]));
for (const p of PRODUCTS) {
  if (!models.has(p.slug)) throw new Error(`no copy for ${p.slug}`);
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
  .dg-proof{display:grid;grid-template-columns:1fr 1fr;gap:20px}
  .dg-proof-nums{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:22px}
  .dg-pkg{display:grid;grid-template-columns:1.3fr 0.7fr;gap:30px;align-items:start}
  .dg-cta{text-decoration:none;font-size:16px;font-weight:700;padding:15px 28px;border-radius:14px;display:inline-flex;align-items:center;gap:9px;transition:transform .22s ease, box-shadow .22s ease}
  .dg-cta:hover{transform:translateY(-2px)}
  details.dg-faq summary{list-style:none;display:flex;justify-content:space-between;gap:16px;align-items:flex-start}
  details.dg-faq summary::-webkit-details-marker{display:none}
  details.dg-faq summary::after{content:"+";flex:none;color:${BLUE};font-weight:700;font-size:20px;line-height:1}
  details.dg-faq[open] summary::after{content:"\\2212"}
  @media (min-width:961px){ .dg-grid > .dg-card:last-child:nth-child(3n+1){grid-column:2} }
  @media (max-width:960px){ .dg-grid{grid-template-columns:repeat(2,1fr)} }
  @media (max-width:820px){
    .dg-hero,.dg-pkg,.dg-proof{grid-template-columns:1fr;gap:28px}
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
        <div style="margin-top:auto;padding-top:18px;font-size:14px;color:${GREY}">From <strong style="font-size:18px;font-weight:800;letter-spacing:-0.02em;color:${INK}">${fromPrice(models.get(p.slug))}</strong> a month</div>
        <span class="dg-more" style="margin-top:0;padding-top:10px">Learn more <span aria-hidden="true">&rarr;</span></span>
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
    <p style="font-size:16px;line-height:1.6;color:${GREY};margin:16px auto 0;max-width:640px;text-align:center">Pick one service or combine them. Each one is fully managed for&nbsp;you.</p>
    <div style="margin:34px 0 0">
    ${cards(PRODUCTS)}
    </div>
    <p style="font-size:14px;line-height:1.6;color:${GREY};margin:22px auto 0;max-width:640px;text-align:center">Prices exclude GST. Most packages have a once-off set-up fee, and every package has a 12 month minimum term, then month by&nbsp;month.</p>
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
    .replace(/Let&rsquo;s talk about your&nbsp;marketing\./, `Talk to us about ${esc(p.name)}`)
    .replace(/Tell us what you&rsquo;re working on and we&rsquo;ll tell you what we&rsquo;d do\. No hard sell, just a&nbsp;chat\./, "Tell us about your business and we&rsquo;ll recommend the right package. No hard sell, just a&nbsp;chat.");

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
    ${m.products.map((pr) => packageCard(pr, single && !p.showPackageName)).join("")}
  </section>

  ${m.faqs.length ? `<section data-reveal style="max-width:900px;margin:0 auto;padding:40px 28px 32px">
    <div style="text-align:center;margin:0 auto 34px">${eyebrow("FAQs")}${h2(`Questions, <span style="color:${BLUE}">answered</span>.`)}</div>
    <div style="display:flex;flex-direction:column;gap:14px">
      ${m.faqs.map((f) => `<details class="dg-faq" style="${glass};border-radius:16px;padding:20px 24px"><summary style="font-size:17px;font-weight:700;letter-spacing:-0.015em;color:${INK};cursor:pointer">${esc(tidy(f.q))}</summary><p style="font-size:15.5px;line-height:1.65;color:#4A5462;margin:14px 0 0">${esc(tidy(f.a))}</p></details>`).join("\n      ")}
    </div>
  </section>` : ""}

  <section data-reveal style="max-width:1180px;margin:0 auto;padding:40px 28px 32px">
    <div style="text-align:center;max-width:720px;margin:0 auto 34px">${eyebrow("More from Ad On Digital")}${h2(`One team for <span style="color:${BLUE}">all of it</span>.`)}</div>
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

console.log("  /ad-on-digital/: menu bar + 7 service boxes");
for (const p of PRODUCTS) {
  const m = productPage(p);
  console.log(`  ${p.url.padEnd(26)} ${String(m.products.length).padStart(2)} packages, ${String(m.faqs.length).padStart(2)} FAQs, from ${fromPrice(m)}`);
}

// --------------------------------------------------------------- growth plans

/**
 * /website-ai-visibility-plans/ — the Website & AI Visibility Growth Plans
 * (Starter and Premium Growth). Every sentence of copy is the bundle
 * document's own, extracted into digital-plans.json. What this adds is
 * layout and a few labels: the hero illustration, the checklist counter, the
 * price toggle, the comparison table and the team photos.
 *
 * The set-up fee is not in the document. It was set by email on 11 Nov 2026:
 * Peter Bailey, "$200 ex for website only (starter) and $500 ex once off set
 * up fee for premium growth package", replacing Paul's earlier suggestion of
 * matching the monthly amount. One figure per plan, for every customer, so it
 * does not change with the price toggle.
 *
 * noindex and linked from nowhere while it is reviewed. To publish it, drop
 * the robots line in plansHead() and add it to the menu and service boxes.
 */
const PLANS = require("./digital-plans.json");
const PLANS_PAGE = {
  url: "/website-ai-visibility-plans/",
  title: "Website & AI Visibility Growth Plans | Ad On Digital",
  description: "A professionally managed website with SEO and AEO foundations, from $400 + GST per month. Two plans from Ad On Digital: Starter and Premium Growth.",
};

/** Once-off set-up fee per plan, excluding GST (see the note above). */
const SETUP_FEE = { "STARTER": "$200", "PREMIUM GROWTH": "$500" };
const setupFee = (pl) => {
  const fee = SETUP_FEE[pl.name];
  if (!fee) throw new Error(`no set-up fee for plan ${pl.name}`);
  return fee;
};

/** "PREMIUM GROWTH" -> "Premium Growth": the document sets plan names in capitals. */
const planName = (s) => String(s).toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const money = (s) => (String(s).match(/\$[\d,]+/) || [""])[0];
const noStop = (s) => String(s).replace(/\.$/, "");
const pText = (t, extra = "") => `<p style="font-size:16.5px;line-height:1.7;color:#4A5462;margin:14px 0 0;${extra}">${esc(t)}</p>`;
const mono = (t, color = "#8A93A1") => `<div class="vp-mono" style="color:${color}">${t}</div>`;
const svg = (d, size = 22, stroke = "#fff") => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 4.5a3 3 0 0 1 0 5.8M21 20c0-2.6-1.6-4.8-4-5.6"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M14 9l2 2"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
};
const iconTile = (d, size = 46) => `<div style="flex:none;width:${size}px;height:${size}px;border-radius:14px;background:linear-gradient(135deg,#1BABE5,#5FCDF5);display:flex;align-items:center;justify-content:center;box-shadow:0 10px 20px -8px rgba(27,171,229,0.6)">${svg(d)}</div>`;
const numBadge = (n) => `<div style="flex:none;width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#1BABE5,#5FCDF5);display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:13px;color:#fff;box-shadow:0 10px 20px -8px rgba(27,171,229,0.6)">${String(n).padStart(2, "0")}</div>`;
const yes = `<span class="vp-yes" aria-label="Included">${svg('<path d="M5 12l5 5 9-10"/>', 16, "#1BABE5")}</span>`;
const no = `<span class="vp-no" aria-label="Not included">&ndash;</span>`;

const PLANS_STYLE = `<style id="vp-style">
  .vp-mono{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700}
  .vp-hero{display:grid;grid-template-columns:1.02fr 0.98fr;gap:60px;align-items:center}
  .vp-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px}
  .vp-chips span{font-size:14px;font-weight:700;color:#1483B5;background:rgba(27,171,229,0.09);border:1px solid rgba(27,171,229,0.25);padding:7px 14px;border-radius:999px;opacity:0;animation:vpIn .5s ease forwards}
  .vp-mock{position:relative;border-radius:22px;overflow:hidden;background:rgba(255,255,255,0.72);backdrop-filter:blur(18px) saturate(150%);-webkit-backdrop-filter:blur(18px) saturate(150%);border:1px solid rgba(255,255,255,0.9);box-shadow:0 40px 80px -40px rgba(11,18,32,0.45),inset 0 1px 0 rgba(255,255,255,0.8)}
  .vp-mock-bar{display:flex;align-items:center;gap:7px;padding:13px 16px;border-bottom:1px solid rgba(11,18,32,0.07);background:rgba(255,255,255,0.6)}
  .vp-mock-bar i{width:10px;height:10px;border-radius:50%;background:#E3E7EE}
  .vp-mock-bar span{margin-left:10px;flex:1;font-size:12.5px;color:#6B7482;background:rgba(11,18,32,0.05);border-radius:8px;padding:6px 12px}
  .vp-mock-body{position:relative;padding:22px 22px 26px;min-height:330px}
  .vp-sk{background:linear-gradient(90deg,#E8EDF4,#F2F5F9);border-radius:6px}
  .vp-mock-tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:20px}
  .vp-mock-tiles div{height:62px;border-radius:12px;background:linear-gradient(150deg,rgba(27,171,229,0.16),rgba(95,205,245,0.08));border:1px solid rgba(27,171,229,0.18)}
  .vp-scan{position:absolute;left:0;right:0;top:0;height:70px;background:linear-gradient(180deg,rgba(27,171,229,0),rgba(27,171,229,0.16) 70%,rgba(27,171,229,0.5) 100%);border-bottom:2px solid rgba(27,171,229,0.7);animation:vpScan 4.2s ease-in-out infinite;pointer-events:none}
  .vp-tag{position:absolute;display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:#0B1220;background:#fff;border:1px solid rgba(27,171,229,0.35);box-shadow:0 10px 24px -12px rgba(11,18,32,0.35);padding:6px 11px 6px 8px;border-radius:999px;opacity:0;transform:translateY(6px) scale(.96);animation:vpTag .45s ease forwards}
  .vp-tag b{width:16px;height:16px;border-radius:50%;background:#1BABE5;display:inline-flex;align-items:center;justify-content:center}
  .vp-mock-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;padding:14px 18px;border-top:1px solid rgba(11,18,32,0.07);background:rgba(27,171,229,0.05);font-size:13.5px;color:#4A5462}
  .vp-mock-foot strong{color:#0B1220}
  .vp-float{position:absolute;font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;letter-spacing:0.08em;color:#fff;background:#0B1220;border-radius:12px;padding:9px 13px;box-shadow:0 18px 30px -14px rgba(11,18,32,0.6);animation:vpFloat 6s ease-in-out infinite}
  .vp-both{display:grid;grid-template-columns:1fr auto 1fr;gap:18px;align-items:stretch;margin-top:30px}
  .vp-plus{align-self:center;font-size:28px;font-weight:800;color:#1BABE5}
  .vp-qgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:28px}
  .vp-q{display:flex;align-items:flex-start;gap:14px;text-align:left;font:inherit;font-size:15.5px;line-height:1.45;font-weight:500;color:#0B1220;background:rgba(255,255,255,0.66);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.85);box-shadow:0 14px 34px -26px rgba(11,18,32,0.2);border-radius:14px;padding:16px 18px;cursor:pointer;transition:transform .18s ease,border-color .18s ease,background .18s ease}
  .vp-q:hover{transform:translateY(-2px)}
  .vp-q .vp-box{flex:none;width:22px;height:22px;border-radius:7px;border:2px solid rgba(11,18,32,0.22);display:inline-flex;align-items:center;justify-content:center;margin-top:1px;transition:all .18s ease}
  .vp-q .vp-box svg{opacity:0;transition:opacity .15s ease}
  .vp-q[aria-pressed="true"]{border-color:rgba(27,171,229,0.55);background:rgba(27,171,229,0.07)}
  .vp-q[aria-pressed="true"] .vp-box{background:#1BABE5;border-color:#1BABE5}
  .vp-q[aria-pressed="true"] .vp-box svg{opacity:1}
  .vp-meter{height:8px;border-radius:999px;background:rgba(11,18,32,0.07);overflow:hidden;margin-top:12px}
  .vp-meter i{display:block;height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,#1BABE5,#5FCDF5);transition:width .35s ease}
  .vp-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;position:relative;margin-top:36px}
  .vp-steps:before{content:"";position:absolute;left:12%;right:12%;top:32px;border-top:2px dashed rgba(27,171,229,0.35)}
  .vp-step{position:relative;text-align:center;padding:0 10px}
  .vp-step .vp-ring{width:66px;height:66px;margin:0 auto;border-radius:20px;background:linear-gradient(135deg,#1BABE5,#5FCDF5);display:flex;align-items:center;justify-content:center;box-shadow:0 16px 30px -12px rgba(27,171,229,0.7),0 0 0 8px rgba(252,251,250,0.9)}
  .vp-bento{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:34px}
  .vp-bento > div{border-radius:18px;padding:24px;transition:transform .22s ease,box-shadow .22s ease}
  .vp-bento > div:hover{transform:translateY(-3px);box-shadow:0 26px 48px -26px rgba(11,18,32,0.32)}
  .vp-bento .vp-wide{grid-column:span 2;background:linear-gradient(135deg,rgba(27,171,229,0.14),rgba(95,205,245,0.06)) ,rgba(255,255,255,0.62)}
  .vp-toggle{display:inline-flex;padding:5px;border-radius:999px;background:rgba(11,18,32,0.06);margin-top:22px}
  .vp-toggle button{font:inherit;font-size:14.5px;font-weight:700;color:#4A5462;background:transparent;border:0;border-radius:999px;padding:10px 18px;cursor:pointer;transition:all .2s ease}
  .vp-toggle button[aria-pressed="true"]{background:#fff;color:#0B1220;box-shadow:0 6px 16px -8px rgba(11,18,32,0.4)}
  .vp-plans{display:grid;grid-template-columns:1fr 1fr;gap:22px;align-items:start;margin-top:30px}
  .vp-card{border-radius:24px;padding:32px}
  .vp-dark{position:relative;overflow:hidden;background:radial-gradient(120% 80% at 100% 0%,rgba(27,171,229,0.35),transparent 55%),radial-gradient(90% 60% at 0% 100%,rgba(45,212,191,0.16),transparent 60%),#0B1220;color:#fff;box-shadow:0 40px 80px -40px rgba(11,18,32,0.8)}
  .vp-dark p,.vp-dark li{color:rgba(255,255,255,0.74)!important}
  .vp-badge{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:#0B1220;background:linear-gradient(90deg,#5FCDF5,#B9ECFF);padding:6px 12px;border-radius:999px}
  .vp-price{font-size:46px;font-weight:800;letter-spacing:-0.045em;line-height:1;transition:opacity .2s ease}
  .vp-compare{width:100%;border-collapse:separate;border-spacing:0;font-size:15px}
  .vp-compare th,.vp-compare td{padding:13px 16px;border-bottom:1px solid rgba(11,18,32,0.07);text-align:left;vertical-align:middle}
  .vp-compare th:not(:first-child),.vp-compare td:not(:first-child){text-align:center;width:150px}
  .vp-compare thead th{position:sticky;top:0;background:rgba(252,251,250,0.96);font-size:15px;font-weight:800;color:#0B1220}
  .vp-compare td:last-child{background:rgba(27,171,229,0.05)}
  .vp-compare tr.vp-sec td{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#8A93A1;font-weight:700;padding-top:22px}
  .vp-yes{display:inline-flex;width:26px;height:26px;border-radius:8px;background:rgba(27,171,229,0.14);align-items:center;justify-content:center}
  .vp-no{color:#B4BBC6;font-weight:700}
  .vp-table{width:100%;border-collapse:collapse;font-size:15.5px}
  .vp-table th,.vp-table td{text-align:left;padding:14px 12px;border-bottom:1px solid rgba(11,18,32,0.08)}
  .vp-table th{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#8A93A1;font-weight:700}
  .vp-faces{display:flex}
  .vp-faces img{border-radius:50%;object-fit:cover;display:block;margin-left:-10px;background:#E8EDF4}
  .vp-faces img:first-child{margin-left:0}
  .vp-people{display:grid;grid-template-columns:1.1fr 0.9fr;gap:0;align-items:stretch;border-radius:26px;overflow:hidden}
  .vp-people-img{position:relative;min-height:380px}
  .vp-people-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 46%}
  .vp-terms h3{font-size:16px;font-weight:800;color:#0B1220;margin:24px 0 6px}
  .vp-terms p,.vp-terms li{font-size:14.5px;line-height:1.65;color:#4A5462;margin:6px 0 0}
  .vp-terms ul{margin:6px 0 0;padding-left:20px}
  @keyframes vpIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  @keyframes vpTag{to{opacity:1;transform:none}}
  @keyframes vpScan{0%{transform:translateY(-70px)}55%{transform:translateY(300px)}100%{transform:translateY(300px);opacity:0}}
  @keyframes vpFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @media (prefers-reduced-motion:reduce){ .vp-scan{display:none} .vp-tag,.vp-chips span{animation:none;opacity:1;transform:none} .vp-float{animation:none} }
  @media (max-width:1000px){ .vp-bento{grid-template-columns:repeat(2,1fr)} }
  @media (max-width:900px){ .vp-hero,.vp-plans,.vp-people{grid-template-columns:1fr} .vp-people-img{min-height:300px} .vp-steps{grid-template-columns:1fr;gap:30px} .vp-steps:before{display:none} }
  @media (max-width:700px){ .vp-qgrid,.vp-bento{grid-template-columns:1fr} .vp-bento .vp-wide{grid-column:auto} .vp-both{grid-template-columns:1fr} .vp-plus{justify-self:center} .vp-card{padding:24px} .vp-compare th,.vp-compare td{padding:11px 8px;font-size:14px} .vp-compare th:not(:first-child),.vp-compare td:not(:first-child){width:84px} .vp-float{display:none} }
</style>`;

function plansHead() {
  return pageHead(PLANS_PAGE, PLANS_PAGE.title, PLANS_PAGE.description)
    .replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="noindex">')
    + PLANS_STYLE + "\n";
}

/** The hero illustration: a website being read, tag by tag. */
function heroMock() {
  const tags = [
    // [label, top in px, left as a share of the width], each beside what it names
    ["Business name", 2, 30], ["Location", 64, 54], ["Structured data", 112, 34],
    ["Services", 176, 6], ["Reviews", 234, 44], ["FAQs", 290, 60],
  ];
  const tick = `<b>${svg('<path d="M5 12l5 5 9-10"/>', 10)}</b>`;
  return `<div style="position:relative">
        <div class="vp-mock" aria-hidden="true">
          <div class="vp-mock-bar"><i></i><i></i><i></i><span>yourbusiness.com.au</span></div>
          <div class="vp-mock-body">
            <div style="display:flex;justify-content:space-between;align-items:center"><div class="vp-sk" style="width:92px;height:20px;border-radius:7px;background:linear-gradient(135deg,#1BABE5,#5FCDF5)"></div><div style="display:flex;gap:10px"><div class="vp-sk" style="width:40px;height:9px"></div><div class="vp-sk" style="width:40px;height:9px"></div><div class="vp-sk" style="width:40px;height:9px"></div></div></div>
            <div class="vp-sk" style="width:78%;height:22px;margin-top:30px"></div>
            <div class="vp-sk" style="width:52%;height:22px;margin-top:10px"></div>
            <div class="vp-sk" style="width:88%;height:9px;margin-top:18px"></div>
            <div class="vp-sk" style="width:70%;height:9px;margin-top:8px"></div>
            <div class="vp-mock-tiles"><div></div><div></div><div></div></div>
            <div style="display:flex;align-items:center;gap:10px;margin-top:20px"><span style="color:#F5A623;letter-spacing:2px;font-size:15px">&#9733;&#9733;&#9733;&#9733;&#9733;</span><div class="vp-sk" style="width:120px;height:9px"></div></div>
            <div class="vp-sk" style="width:94%;height:30px;margin-top:16px;border-radius:10px"></div>
            <div class="vp-sk" style="width:94%;height:30px;margin-top:8px;border-radius:10px"></div>
            <div class="vp-scan"></div>
            ${tags.map(([t, top, left], i) => `<span class="vp-tag" style="top:${top}px;left:${left}%;animation-delay:${0.5 + i * 0.45}s">${tick}${t}</span>`).join("")}
          </div>
          <div class="vp-mock-foot"><span>Read by <strong>search engines</strong> and <strong>AI platforms</strong></span><span style="display:inline-flex;gap:6px"><span class="vp-badge" style="background:rgba(27,171,229,0.14);color:#1483B5">SEO</span><span class="vp-badge" style="background:rgba(27,171,229,0.14);color:#1483B5">AEO</span></span></div>
        </div>
        <div class="vp-float" style="top:-18px;right:24px">ChatGPT &middot; Claude &middot; Gemini</div>
        <div class="vp-float" style="bottom:46px;left:-22px;animation-delay:-3s;background:#fff;color:#0B1220;border:1px solid rgba(11,18,32,0.08)">Google search</div>
      </div>`;
}

function planCard(pl, dark) {
  const label = (t) => mono(esc(t), dark ? "rgba(255,255,255,0.55)" : "#8A93A1");
  const title = dark ? "#fff" : INK;
  const extras = pl.extras ? `
        <div style="margin-top:26px">${label(pl.listLabel)}</div>
        <div style="display:flex;flex-direction:column;gap:18px;margin-top:16px">
          ${pl.extras.map((x, i) => `<div style="display:flex;gap:14px;align-items:flex-start">${numBadge(i + 1)}<div style="min-width:0">
            <div style="font-size:16px;font-weight:800;letter-spacing:-0.01em;color:${title}">${esc(x.title)}</div>
            ${x.text.map((t) => `<p style="font-size:14.5px;line-height:1.6;margin:6px 0 0">${esc(t)}</p>`).join("")}
            ${x.list ? `<ul style="margin:6px 0 0;padding-left:20px">${x.list.map((t) => `<li style="font-size:14.5px;line-height:1.6">${esc(t)}</li>`).join("")}</ul>` : ""}
            ${x.after ? `<p style="font-size:13px;line-height:1.55;margin:6px 0 0;opacity:.85">${esc(x.after)}</p>` : ""}
          </div></div>`).join("\n          ")}
        </div>
        <div style="margin-top:26px">${label(pl.alsoLabel)}</div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px">
          ${pl.also.map((t) => `<div style="display:flex;align-items:flex-start;gap:11px">${tickSm}<span style="font-size:15px;line-height:1.55;color:rgba(255,255,255,0.9)">${esc(t)}</span></div>`).join("")}
        </div>` : `
        <div style="margin-top:26px">${label(pl.listLabel)}</div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px">
          ${pl.items.map((t) => `<div style="display:flex;align-items:flex-start;gap:11px">${tickSm}<span style="font-size:15px;line-height:1.55;color:rgba(255,255,255,0.9)">${esc(t)}</span></div>`).join("")}
        </div>`;
  return `<div class="vp-card ${dark ? "vp-dark" : ""}" style="${dark ? "" : glass}">
        <div style="font-size:46px;font-weight:800;letter-spacing:-0.045em;line-height:1;color:#fff">${esc(planName(pl.name))}</div>
        <h3 style="font-size:24px;line-height:1.2;letter-spacing:-0.025em;font-weight:800;color:${title};margin:12px 0 0">${esc(pl.tagline)}</h3>
        ${pl.extras ? `<span class="vp-badge" style="margin-top:14px">Everything in Starter, plus ${pl.extras.length} more</span>` : ""}
        <div style="margin-top:22px;padding:22px;border-radius:18px;${dark ? "background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12)" : "background:rgba(27,171,229,0.06);border:1px solid rgba(27,171,229,0.22)"}">
          <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><span class="vp-price" data-std="${money(pl.price)}" data-ex="${money(pl.existing)}" style="color:${dark ? "#5FCDF5" : BLUE}">${money(pl.price)}</span><span style="font-size:15px;color:${dark ? "rgba(255,255,255,0.7)" : GREY}">+ GST per month</span></div>
          <div class="vp-price-note" data-std="${esc(`${money(pl.existing)} + GST per month for existing Ad On Group customers`)}" data-ex="${esc("Existing Ad On Group customer price")}" style="font-size:14.5px;line-height:1.55;font-weight:600;color:${title};margin-top:12px">${esc(`${money(pl.existing)} + GST per month for existing Ad On Group customers`)}</div>
          <div style="font-size:14.5px;line-height:1.55;margin-top:10px;color:${dark ? "rgba(255,255,255,0.8)" : GREY}">Plus a <strong style="color:${title}">${setupFee(pl)}</strong> + GST once-off set-up fee</div>
          <div style="font-size:14px;margin-top:6px;color:${dark ? "rgba(255,255,255,0.6)" : GREY}">${esc(pl.term)}</div>
        </div>
        ${pText(pl.desc, `margin-top:20px;${dark ? "color:rgba(255,255,255,0.8)" : ""}`)}
        ${extras}
        ${pText(pl.close, `margin-top:24px;font-size:15px;${dark ? "color:rgba(255,255,255,0.8)" : ""}`)}
        <a class="dg-cta" href="/contact-us/" style="margin-top:24px;width:100%;justify-content:center;${pl.extras ? `color:#fff;background:${BLUE};box-shadow:0 14px 26px -10px rgba(27,171,229,0.7)` : `color:${INK};background:#fff`}">Enquire about ${esc(planName(pl.name))} <span aria-hidden="true">&rarr;</span></a>
      </div>`;
}

/** Starter's list and Premium Growth's additions, side by side. */
function compareTable(starter, premium) {
  const pages = (pl) => (pl.items || pl.also).find((t) => /website pages/i.test(t)).match(/Up to \d+/)[0];
  const shared = starter.items.filter((t) => !/website pages/i.test(t));
  const row = (label, a, b) => `<tr><td>${label}</td><td>${a}</td><td>${b}</td></tr>`;
  return `<table class="vp-compare">
        <thead><tr><th style="text-align:left"><span class="vp-mono" style="color:#8A93A1">Compare</span></th><th>${esc(planName(starter.name))}</th><th>${esc(planName(premium.name))}</th></tr></thead>
        <tbody>
          ${row("<strong>Monthly price</strong>", `<strong class="vp-price" data-std="${money(starter.price)}" data-ex="${money(starter.existing)}" style="font-size:18px;letter-spacing:-0.02em">${money(starter.price)}</strong>`, `<strong class="vp-price" data-std="${money(premium.price)}" data-ex="${money(premium.existing)}" style="font-size:18px;letter-spacing:-0.02em;color:${BLUE}">${money(premium.price)}</strong>`)}
          ${row("Once-off set-up fee", setupFee(starter), setupFee(premium))}
          ${row("Website pages", pages(starter), pages(premium))}
          <tr class="vp-sec"><td colspan="3">Both plans</td></tr>
          ${shared.map((t) => row(esc(noStop(t)), yes, yes)).join("\n          ")}
          <tr class="vp-sec"><td colspan="3">Premium Growth adds</td></tr>
          ${premium.extras.map((x) => row(esc(x.title), no, yes)).join("\n          ")}
          ${row("Minimum commitment", esc(noStop(starter.term.replace(/^Minimum commitment:\s*/i, ""))), esc(noStop(premium.term.replace(/^Minimum commitment:\s*/i, ""))))}
        </tbody>
      </table>`;
}

/** Real team members, from /people/. Shown as faces, not as a claim about who handles which account. */
const TEAM = [
  ["Taryn Boxer", "Chief Operating Officer", "/assets/design/team-taryn-sq.jpg"],
  ["Leah", "General Manager", "/assets/design/team-leah-sq.jpg"],
  ["Ben", "Business Development Manager", "/assets/design/team-ben-sq.jpg"],
  ["James", "Business Development Manager", "/assets/media/2025/03/IMG-7775-scaled-e1733901081176-sq.jpg"],
  ["McLean", "IT and Data Manager", "/assets/media/2025/03/Image_20241205_141835_165-scaled-e1733965774973-sq.jpg"],
];
const faces = (size, ring) => `<div class="vp-faces">${TEAM.map(([n, r, src]) => `<img src="${src}" alt="${esc(`${n}, ${r} at Ad On Group`)}" width="${size}" height="${size}" loading="lazy" decoding="async" style="width:${size}px;height:${size}px;box-shadow:0 0 0 3px ${ring}">`).join("")}</div>`;

const PLANS_SCRIPT = `<script>
(function () {
  // The checklist: tick what sounds familiar, the counter keeps score.
  var qs = [].slice.call(document.querySelectorAll(".vp-q"));
  var count = document.querySelector("[data-vp-count]"), bar = document.querySelector(".vp-meter i");
  function score() {
    var n = qs.filter(function (q) { return q.getAttribute("aria-pressed") === "true"; }).length;
    if (count) count.textContent = n + " of " + qs.length;
    if (bar) bar.style.width = (n / qs.length * 100) + "%";
  }
  qs.forEach(function (q) {
    q.addEventListener("click", function () {
      q.setAttribute("aria-pressed", q.getAttribute("aria-pressed") === "true" ? "false" : "true");
      score();
    });
  });
  // The price toggle: standard or existing customer.
  var btns = [].slice.call(document.querySelectorAll(".vp-toggle button"));
  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      var mode = b.getAttribute("data-mode");
      btns.forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
      [].forEach.call(document.querySelectorAll("[data-std][data-ex]"), function (el) {
        el.textContent = el.getAttribute(mode === "ex" ? "data-ex" : "data-std");
      });
    });
  });
})();
</script>`;

function plansPage() {
  const d = PLANS;
  const [starter, premium] = d.plans.plans;
  const card = (inner, extra = "") => `<div style="${glass};border-radius:18px;padding:24px;${extra}">${inner}</div>`;
  const support = d.included.items.find((x) => /support/i.test(x.title));
  const includedIcons = [ICON.monitor, ICON.shield, ICON.pencil, ICON.search, ICON.spark, ICON.trend, ICON.people];
  const pillarIcons = [ICON.search, ICON.star, ICON.trend];
  const boxTick = svg('<path d="M5 12l5 5 9-10"/>', 14);

  const cta = ctaSection
    .replace(/Let&rsquo;s talk about your&nbsp;marketing\./, esc(d.cta.h))
    .replace(/Tell us what you&rsquo;re working on and we&rsquo;ll tell you what we&rsquo;d do\. No hard sell, just a&nbsp;chat\./,
      `${d.cta.text.map(esc).join(" ")}<br><br><strong style="color:${INK}">${esc(d.cta.lead)}</strong> ${esc(d.cta.contact)}`);

  const body = `
  ${menuBar({})}

  <header id="top" style="max-width:1220px;margin:0 auto;padding:64px 28px 48px">
    <div class="vp-hero">
      <div>
        ${eyebrow(esc(d.title))}
        <h1 style="font-size:clamp(34px,5vw,62px);line-height:1.0;letter-spacing:-0.048em;font-weight:600;margin:18px 0 0;color:${INK}">${esc(d.h1).replace("do more than just exist", `<span style="color:${BLUE}">do more than just exist</span>`)}</h1>
        <div class="vp-chips">${d.tagline.split(/(?<=\.)\s+/).map((t, i) => `<span style="animation-delay:${0.15 + i * 0.15}s">${esc(t.replace(/\.$/, ""))}</span>`).join("")}</div>
        <p style="font-size:17px;line-height:1.65;color:#4A5462;margin:22px 0 0;max-width:540px">${esc(d.intro[0])}</p>
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px 18px;margin-top:30px">
          <a class="dg-cta" href="#plans" style="color:#fff;background:${BLUE};box-shadow:0 14px 26px -10px rgba(27,171,229,0.6)">See the plans <span aria-hidden="true">&darr;</span></a>
          <a class="dg-cta" href="/contact-us/" style="color:${INK};background:rgba(255,255,255,0.7);border:1px solid rgba(11,18,32,0.14)">Get in touch</a>
          <span style="font-size:14px;color:${GREY}">From <strong style="color:${INK}">${money(starter.price)} + GST</strong> per month</span>
        </div>
        <div style="display:flex;align-items:center;gap:14px;margin-top:28px">${faces(42, "#FCFBFA")}<span style="font-size:14px;line-height:1.45;color:#4A5462;max-width:300px">${esc(support.text.split(". ").pop())}</span></div>
      </div>
      ${heroMock()}
    </div>
  </header>

  <section data-reveal style="max-width:980px;margin:0 auto;padding:30px 28px 40px;text-align:center">
    <p style="font-size:clamp(19px,2.2vw,24px);line-height:1.5;color:#4A5462;margin:0 auto;max-width:760px">${esc(d.intro[1])}</p>
    <div class="vp-both">
      ${card(`<div style="display:flex;align-items:center;gap:14px">${iconTile(ICON.search)}<div style="text-align:left"><div style="font-size:18px;font-weight:800;color:${INK}">Search engines</div><div style="font-size:14.5px;color:${GREY};margin-top:3px">Traditional Google searches</div></div></div>`)}
      <div class="vp-plus" aria-hidden="true">+</div>
      ${card(`<div style="display:flex;align-items:center;gap:14px">${iconTile(ICON.spark)}<div style="text-align:left"><div style="font-size:18px;font-weight:800;color:${INK}">AI platforms</div><div style="font-size:14.5px;color:${GREY};margin-top:3px">ChatGPT, Claude and Gemini</div></div></div>`)}
    </div>
    <h2 style="font-size:clamp(28px,3.6vw,46px);line-height:1.08;letter-spacing:-0.035em;font-weight:800;margin:34px 0 0;color:${INK}">${esc(d.intro[2]).replace("work for both", `<span style="color:${BLUE}">work for both</span>`)}</h2>
    ${d.intro.slice(3).map((t) => pText(t, "max-width:700px;margin-left:auto;margin-right:auto")).join("")}
  </section>

  <section data-reveal style="max-width:1100px;margin:0 auto;padding:44px 28px">
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:24px">
      <div style="max-width:640px">${eyebrow("The problem")}${h2(esc(d.problem.h))}${pText(d.problem.lead)}<div style="margin-top:10px">${mono("Tick any that apply", BLUE)}</div></div>
      <div style="${glass};border-radius:16px;padding:16px 20px;min-width:220px">
        ${mono("Sounds familiar")}
        <div data-vp-count style="font-size:28px;font-weight:800;letter-spacing:-0.03em;color:${INK};margin-top:6px">0 of ${d.problem.items.length}</div>
        <div class="vp-meter"><i></i></div>
      </div>
    </div>
    <div class="vp-qgrid">
      ${d.problem.items.map((t) => `<button type="button" class="vp-q" aria-pressed="false"><span class="vp-box">${boxTick}</span><span>${esc(t)}</span></button>`).join("\n      ")}
    </div>
    <div style="${glass};border-radius:20px;padding:26px 30px;margin-top:22px;border-left:4px solid ${BLUE}">
      ${d.problem.close.map((t, i) => `<p style="margin:${i ? "8px" : "0"} 0 0;font-size:${i === 1 ? "20px" : "16.5px"};line-height:1.5;font-weight:${i === 1 ? 800 : 400};color:${i === 1 ? INK : "#4A5462"}">${esc(t)}</p>`).join("")}
    </div>
  </section>

  <section data-reveal style="max-width:1180px;margin:0 auto;padding:44px 28px">
    <div style="text-align:center;max-width:760px;margin:0 auto">${eyebrow("Our approach")}${h2(esc(d.better.h))}${d.better.intro.map((t) => pText(t)).join("")}</div>
    <div class="vp-steps">
      ${d.better.pillars.map((x, i) => `<div class="vp-step">
        <div class="vp-ring">${svg(pillarIcons[i], 28)}</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.16em;color:${BLUE};margin-top:18px">0${i + 1}</div>
        <div style="font-size:22px;font-weight:800;letter-spacing:-0.025em;color:${INK};margin:6px 0 0">${esc(x.title)}</div>
        ${x.text.map((t, j) => `<p style="font-size:15.5px;line-height:1.6;color:${j ? "#4A5462" : INK};font-weight:${j ? 400 : 600};margin:10px auto 0;max-width:330px">${esc(t)}</p>`).join("")}
      </div>`).join("\n      ")}
    </div>
  </section>

  <section data-reveal style="max-width:1180px;margin:0 auto;padding:44px 28px">
    <div style="text-align:center;max-width:760px;margin:0 auto">${eyebrow("What&rsquo;s included")}${h2(esc(d.included.h))}${d.included.intro.map((t) => pText(t)).join("")}</div>
    <div class="vp-bento">
      ${d.included.items.map((x, i) => `<div class="${i === 0 ? "vp-wide" : ""}" style="${glass}">
        ${iconTile(includedIcons[i], i === 0 ? 54 : 44)}
        <div style="font-size:${i === 0 ? 22 : 17}px;font-weight:800;letter-spacing:-0.02em;color:${INK};margin:16px 0 0">${esc(x.title)}</div>
        <p style="font-size:${i === 0 ? 16 : 14.5}px;line-height:1.6;color:#4A5462;margin:8px 0 0">${esc(x.text)}</p>
      </div>`).join("\n      ")}
    </div>
  </section>

  <section data-reveal style="max-width:1180px;margin:0 auto;padding:30px 28px 44px">
    <div class="vp-people vp-dark">
      <div class="vp-people-img"><img src="/assets/design/team-meeting.jpg" alt="Ad On Group team members in a meeting" width="1122" height="1402" loading="lazy" decoding="async"></div>
      <div style="padding:clamp(28px,4vw,48px);display:flex;flex-direction:column;justify-content:center">
        ${mono("Real people", "#5FCDF5")}
        <h2 style="font-size:clamp(26px,3vw,38px);line-height:1.1;letter-spacing:-0.03em;font-weight:800;color:#fff;margin:14px 0 0">${esc(support.title)}</h2>
        <p style="font-size:17px;line-height:1.65;margin:16px 0 0">${esc(support.text)}</p>
      </div>
    </div>
  </section>

  <section id="plans" data-reveal style="max-width:1140px;margin:0 auto;padding:52px 28px 20px;scroll-margin-top:90px">
    <div style="text-align:center;max-width:760px;margin:0 auto">
      ${eyebrow("Plans")}${h2(esc(d.plans.h))}${pText(d.plans.intro)}
      <div class="vp-toggle" role="group" aria-label="Show prices for"><button type="button" data-mode="std" aria-pressed="true">Standard pricing</button><button type="button" data-mode="ex" aria-pressed="false">Existing Ad On Group customer</button></div>
    </div>
    <div class="vp-plans">
      ${planCard(starter, true)}
      ${planCard(premium, true)}
    </div>
  </section>

  <section data-reveal style="max-width:900px;margin:0 auto;padding:40px 28px 20px">
    <div style="text-align:center;margin:0 auto 26px">${eyebrow("Side by side")}${h2(`${esc(planName(starter.name))} or <span style="color:${BLUE}">${esc(planName(premium.name))}</span>?`)}</div>
    <div style="${glass};border-radius:20px;padding:10px 14px;overflow-x:auto">${compareTable(starter, premium)}</div>
  </section>

  <section data-reveal style="max-width:900px;margin:0 auto;padding:44px 28px 32px">
    <div style="text-align:center;margin:0 auto 34px">${eyebrow("FAQs")}${h2(`Frequently asked <span style="color:${BLUE}">questions</span>.`)}</div>
    <div style="display:flex;flex-direction:column;gap:12px">
      ${d.faqs.map((f) => `<details class="dg-faq" style="${glass};border-radius:16px;padding:18px 22px"><summary style="font-size:16.5px;font-weight:700;letter-spacing:-0.015em;color:${INK};cursor:pointer">${esc(f.q)}</summary>${f.a.map((t) => `<p style="font-size:15px;line-height:1.65;color:#4A5462;margin:12px 0 0">${esc(t)}</p>`).join("")}</details>`).join("\n      ")}
      <details class="dg-faq vp-terms" id="terms" style="${glass};border-radius:16px;padding:18px 22px"><summary style="font-size:16.5px;font-weight:700;letter-spacing:-0.015em;color:${INK};cursor:pointer">Full terms and conditions</summary>
        <p style="font-weight:700;color:${INK};margin-top:14px">${esc(d.terms.h)}: ${esc(d.terms.subtitle)}</p>
        ${d.terms.intro.map((t) => `<p>${esc(t)}</p>`).join("")}
        ${d.terms.clauses.map((c) => `<h3>${esc(c.h)}</h3>${c.body.map((b) => Array.isArray(b) ? `<ul>${b.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : `<p>${esc(b)}</p>`).join("")}`).join("\n        ")}
      </details>
    </div>
  </section>

  ${cta}
  ${PLANS_SCRIPT}
`;


  const html = plansHead() + bodyOpen + "\n" + body + "\n\n  " + footer;
  const out = path.join(PUBLIC, PLANS_PAGE.url);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "index.html"), html);
  console.log(`  ${PLANS_PAGE.url} (noindex) ${d.plans.plans.length} plans, ${d.faqs.length} FAQs, ${d.terms.clauses.length} terms clauses`);
}

plansPage();
