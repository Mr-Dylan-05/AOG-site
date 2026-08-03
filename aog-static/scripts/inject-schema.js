#!/usr/bin/env node
/**
 * inject-schema.js — add Schema.org JSON-LD to every indexable page.
 *
 * Runs over _site/ after the build (wired into .eleventy.js), so it covers both
 * page sources: the Eleventy-built reference pages AND the design pages that are
 * passthrough-copied from public/ and never see a template.
 *
 * Why this matters here: structured data is how Google and AI answer engines
 * resolve "Ad On Group" as an *entity* rather than a string — what it is, where
 * it is, what it sells, who to contact. Before this, 2 of 117 pages had any.
 *
 * Everything below is derived from facts already on the site (contact page,
 * history page, llms.txt) or extracted from each page's own markup. Nothing is
 * invented. `sameAs` is deliberately empty: the footer's social links are bare
 * placeholders (https://www.facebook.com with no profile), so there is nothing
 * truthful to point at.
 *
 * Emits one @graph per page:
 *   Organization + WebSite            — sitewide identity, stable @ids
 *   WebPage                           — this page, linked to both
 *   BreadcrumbList                    — on nested URLs
 *   FAQPage                           — where <details>/<summary> pairs exist
 *   BlogPosting                       — where a date/author byline exists
 *   Service                           — on the division and program pages
 *
 * Usage:  node scripts/inject-schema.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE = path.join(ROOT, "_site");
const DRY = process.argv.includes("--dry");
const MARKER = "data-schema=\"aog\"";

const site = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "_data", "site.json"), "utf8"));
const BASE = site.url.replace(/\/$/, "");

const ORG_ID = `${BASE}/#organization`;
const SITE_ID = `${BASE}/#website`;

// ---------------------------------------------------------------- constants
const ORGANIZATION = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: "Ad On Group",
  url: `${BASE}/`,
  logo: {
    "@type": "ImageObject",
    url: `${BASE}/assets/media/2025/07/AdonGroup-logo-WF-Icon_on-white-300x172.jpg`,
  },
  description:
    "Australian-owned since 2008. Ad On Group helps Australian businesses work smarter through offshore staffing, AI training and enablement, digital marketing and on-hold messaging.",
  foundingDate: "2008",
  email: "info@adongroup.com.au",
  telephone: "+61755861400",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1/44 Township Drive",
    addressLocality: "Burleigh Heads",
    addressRegion: "QLD",
    postalCode: "4219",
    addressCountry: "AU",
  },
  areaServed: { "@type": "Country", name: "Australia" },
  identifier: { "@type": "PropertyValue", propertyID: "ABN", value: "54 808 983 598" },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+61755861400",
    email: "info@adongroup.com.au",
    contactType: "customer service",
    areaServed: "AU",
    availableLanguage: "en",
  },
};

const WEBSITE = {
  "@type": "WebSite",
  "@id": SITE_ID,
  url: `${BASE}/`,
  name: "Ad On Group",
  publisher: { "@id": ORG_ID },
  inLanguage: "en-AU",
};

/** URL -> the service that page describes. Names match each page's own title. */
const SERVICES = {
  "/ad-on-workforce/": "Offshore Staffing",
  "/ad-on-workforce-division/": "Offshore Staffing",
  "/ad-on-digital/": "Digital Marketing",
  "/ad-on-hold/": "On-Hold Messaging",
  "/ad-on-sa/": "Remote Talent (South Africa)",
  "/ad-on-ai-division/": "AI Training and Enablement",
  "/programs/": "AI Training & Enablement Program",
  "/bpo-program/": "BPO AI Program",
  "/bpo-ai-program/": "BPO AI Program",
  "/ongoing-support/": "Ongoing AI Support",
};

// Author accounts that are CMS logins rather than people. Attributing a post to
// "fligno_dev" would be worse than attributing it to the company.
const NON_PERSON_AUTHORS = new Set(["fligno_dev", "adon_dev", "admin", "adon"]);

// ---------------------------------------------------------------- helpers
const decode = (s) =>
  s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;|&#x27;|&rsquo;/g, "'")
    .replace(/&nbsp;/g, " ").replace(/&hellip;/g, "…")
    .replace(/&[a-z#0-9]+;/gi, " ");

const strip = (s) => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name === "index.html") out.push(p);
  }
  return out;
}

const MONTHS = {
  january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
  july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
};

function isoDate(text) {
  const m = text.match(/([A-Z][a-z]+) (\d{1,2}), (\d{4})/);
  if (!m) return null;
  const mm = MONTHS[m[1].toLowerCase()];
  if (!mm) return null;
  return `${m[3]}-${mm}-${String(m[2]).padStart(2, "0")}`;
}

/** Q/A pairs from <details><summary>Q</summary>A</details>. */
function faqPairs(html) {
  const out = [];
  for (const m of html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/gi)) {
    const inner = m[1];
    const s = inner.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i);
    if (!s) continue;
    // The summary carries a "+" affordance span; drop it before reading the text.
    const q = strip(s[1].replace(/<span\b[^>]*>[\s\S]*?<\/span>/gi, ""));
    const a = strip(inner.replace(s[0], ""));
    if (q.length > 3 && a.length > 10) out.push([q, a]);
  }
  return out;
}

function breadcrumb(url, titleOf) {
  const parts = url.split("/").filter(Boolean);
  if (!parts.length) return null;
  const items = [{ "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` }];
  let acc = "";
  parts.forEach((seg, i) => {
    acc += `/${seg}`;
    const u = `${BASE}${acc}/`;
    items.push({
      "@type": "ListItem",
      position: i + 2,
      name: titleOf(`${acc}/`) || seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      item: u,
    });
  });
  return { "@type": "BreadcrumbList", "@id": `${BASE}${url}#breadcrumb`, itemListElement: items };
}

// ---------------------------------------------------------------- pass 1: read
const files = walk(SITE);
const pages = files.map((file) => {
  const html = fs.readFileSync(file, "utf8");
  const rel = path.relative(SITE, path.dirname(file)).split(path.sep).join("/");
  const url = rel === "" ? "/" : `/${rel}/`;
  const t = html.match(/<title>([\s\S]*?)<\/title>/i);
  const d = html.match(/<meta[^>]*name=(["'])description\1[^>]*content=(["'])([\s\S]*?)\2/i);
  const img = html.match(/<meta[^>]*property=(["'])og:image\1[^>]*content=(["'])([\s\S]*?)\2/i);
  return {
    file, url, html,
    title: t ? decode(t[1].trim()) : null,
    description: d ? decode(d[3].trim()) : null,
    ogImage: img ? img[3].trim() : null,
    noindex: /<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html),
  };
});
const titles = new Map(pages.map((p) => [p.url, p.title]));
/** Short, human label for a breadcrumb step. Page titles here are often full
 *  sentences ("FAQs: Get Answers to Your Questions About Ad On Workforce"),
 *  which read badly as a crumb — fall back to the slug when that happens. */
const titleOf = (u) => {
  const t = titles.get(u);
  if (!t) return null;
  const short = t.split("|")[0].split(/[:–—]/)[0].trim();
  return short.length > 0 && short.length <= 40 ? short : null;
};

// ---------------------------------------------------------------- pass 2: build
let injected = 0;
const counts = { WebPage: 0, BreadcrumbList: 0, FAQPage: 0, BlogPosting: 0, Service: 0 };

for (const p of pages) {
  if (p.noindex) continue;
  if (p.html.includes(MARKER)) continue;
  if (!/<\/head>/i.test(p.html)) continue;

  const pageUrl = `${BASE}${p.url}`;
  const graph = [ORGANIZATION, WEBSITE];

  const webpage = {
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: p.title || "Ad On Group",
    isPartOf: { "@id": SITE_ID },
    about: { "@id": ORG_ID },
    inLanguage: "en-AU",
  };
  if (p.description) webpage.description = p.description;
  if (p.ogImage) {
    webpage.primaryImageOfPage = {
      "@type": "ImageObject",
      url: p.ogImage.startsWith("http") ? p.ogImage : `${BASE}${p.ogImage}`,
    };
  }

  const crumbs = breadcrumb(p.url, titleOf);
  if (crumbs) { webpage.breadcrumb = { "@id": crumbs["@id"] }; graph.push(crumbs); counts.BreadcrumbList++; }

  graph.push(webpage);
  counts.WebPage++;

  // --- FAQ ---------------------------------------------------------------
  const pairs = faqPairs(p.html);
  if (pairs.length >= 2) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      isPartOf: { "@id": `${pageUrl}#webpage` },
      mainEntity: pairs.map(([q, a]) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    });
    counts.FAQPage++;
  }

  // --- Blog posting ------------------------------------------------------
  const text = strip(p.html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " "));
  const byline = text.match(/([A-Z][a-z]+ \d{1,2}, \d{4})\s*\/\s*([A-Za-z0-9_\- ]+?)\s*\/\s*No Comments/);
  if (byline) {
    const date = isoDate(byline[1]);
    const who = byline[2].trim();
    const author = NON_PERSON_AUTHORS.has(who.toLowerCase())
      ? { "@id": ORG_ID }
      : { "@type": "Person", name: who };
    const post = {
      "@type": "BlogPosting",
      "@id": `${pageUrl}#article`,
      headline: (p.title || "").split("|")[0].trim(),
      mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
      author,
      publisher: { "@id": ORG_ID },
      inLanguage: "en-AU",
    };
    if (date) { post.datePublished = date; post.dateModified = date; }
    if (p.description) post.description = p.description;
    if (p.ogImage) post.image = p.ogImage.startsWith("http") ? p.ogImage : `${BASE}${p.ogImage}`;
    graph.push(post);
    counts.BlogPosting++;
  }

  // --- Service -----------------------------------------------------------
  if (SERVICES[p.url]) {
    graph.push({
      "@type": "Service",
      "@id": `${pageUrl}#service`,
      name: SERVICES[p.url],
      provider: { "@id": ORG_ID },
      areaServed: { "@type": "Country", name: "Australia" },
      ...(p.description ? { description: p.description } : {}),
      mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
    });
    counts.Service++;
  }

  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 0)
    .replace(/</g, "\\u003c");   // never let a stray "<" close the script early
  const block = `<script type="application/ld+json" ${MARKER}>${json}</script>\n</head>`;

  if (!DRY) fs.writeFileSync(p.file, p.html.replace(/<\/head>/i, block));
  injected++;
}

console.log(`${DRY ? "[dry run] " : ""}[schema] ${injected} pages`);
for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(16)} ${v}`);
