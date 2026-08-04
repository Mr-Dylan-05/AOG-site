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
/** The five divisions, as first-class entities the graph can point at. Models
 *  the brand architecture explicitly instead of leaving it implied by nav. */
const DIVISIONS = [
  ["Ad On Workforce", "/ad-on-workforce/", "Offshore staffing from the Philippines"],
  ["Ad On AI", "/ad-on-ai-division/", "AI training and enablement for Australian teams"],
  ["Ad On Digital", "/ad-on-digital/", "Fully managed digital marketing"],
  ["Ad On Hold", "/ad-on-hold/", "On-hold messaging and caller experience"],
  ["Ad On SA", "/ad-on-sa/", "Remote talent from South Africa"],
];

/** Roles Ad On Workforce staffs. Each has its own page on the site. */
const WORKFORCE_ROLES = [
  ["Executive / Personal Assistant", "/executive-personal-assistant/"],
  ["General Admin Staff", "/general-admin-staff/"],
  ["Finance Admin Staff", "/finance-admin-staff/"],
  ["Customer Service", "/customer-service/"],
  ["Data Entry / Collation", "/data-entry-collation/"],
  ["Marketing Assistant", "/marketing-assistant/"],
  ["Bespoke Repeatable Task Role", "/bespoke-repeatable-task-role/"],
  ["AI Enablement Specialist", "/ai-enablement-specialist/"],
];

/**
 * Team members, taken from the /about/ page where the site itself publishes
 * name, role and LinkedIn profile together. Sourced from Ad On Group's own
 * pages rather than looked up externally, so every value is one the company
 * has already chosen to publish.
 *
 * Lindsey (CFO) and James (Business Development) appear on /people/ by first
 * name only, with no profile link — no way to identify them without guessing,
 * so they are omitted rather than invented.
 */
const TEAM = [
  ["Dylan Bailey", "Facilitator", "https://www.linkedin.com/in/dylan-bailey-544986378"],
  ["Beau Robards", "Facilitator", "https://www.linkedin.com/in/beau-robards-6b4b09357"],
  ["Taryn Boxer", "Operations Manager", "https://www.linkedin.com/in/taryn-boxer-84b482285"],
  ["Ben Ragless", "Business Development", "https://www.linkedin.com/in/ben-ragless-46299386"],
  ["Leah Barnes", "Training Coordinator", "https://www.linkedin.com/in/leah-barnes-91305a2a3"],
  ["Tracy Malone", "Training Coordinator", "https://www.linkedin.com/in/tracy-malone-606907258"],
];

const ORGANIZATION = {
  // Multi-typed: it's an organisation, and it's a service business with a
  // street address — which is what local results key off.
  "@type": ["Organization", "ProfessionalService"],
  "@id": ORG_ID,
  name: "Ad On Group",
  slogan: "Innovative Solutions From an Innovative Company",
  knowsAbout: [
    "Offshore staffing",
    "Business process outsourcing",
    "AI training and enablement",
    "Digital marketing",
    "On-hold messaging",
  ],
  subOrganization: DIVISIONS.map(([name, url, description]) => ({
    "@type": "Organization",
    "@id": `${BASE}${url}#division`,
    name,
    url: `${BASE}${url}`,
    description,
    parentOrganization: { "@id": ORG_ID },
  })),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Ad On Group services",
    itemListElement: DIVISIONS.map(([name, url, description]) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name, description, url: `${BASE}${url}` },
    })),
  },
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
  // Verified company profiles. These are how a search engine confirms that the
  // entity on this site and the entity on those platforms are the same company.
  sameAs: site.social || [],
  employee: TEAM.map(([name, jobTitle, url]) => ({
    "@type": "Person",
    name,
    jobTitle,
    sameAs: [url],
    worksFor: { "@id": ORG_ID },
  })),
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+61755861400",
    email: "info@adongroup.com.au",
    contactType: "customer service",
    areaServed: "AU",
    availableLanguage: "en",
  },
};

/**
 * Compact Organization for inner pages.
 *
 * Google processes each page independently, so every page needs enough to
 * identify the publisher — but repeating the five divisions and the full offer
 * catalogue on all 107 pages cost ~5 KB each for no extra meaning. The full
 * entity is emitted on the pages that actually describe the company (below);
 * everywhere else carries identity only, under the same @id, so the graph still
 * resolves to one entity.
 */
const ORGANIZATION_COMPACT = {
  "@type": ["Organization", "ProfessionalService"],
  "@id": ORG_ID,
  name: ORGANIZATION.name,
  url: ORGANIZATION.url,
  logo: ORGANIZATION.logo,
  email: ORGANIZATION.email,
  telephone: ORGANIZATION.telephone,
  address: ORGANIZATION.address,
};

/**
 * Topic entities for the resource articles.
 *
 * `about` tells a search or answer engine what a page is *about* as an entity
 * rather than as a string, and `sameAs` grounds that entity in a public
 * knowledge base. It's the difference between "this page contains the words
 * 'context window'" and "this page is about the concept Context Window, which
 * is the thing Wikipedia describes here" — which is what lets an engine decide
 * the page is a relevant source for a question phrased differently.
 *
 * Only concepts with a genuine public entry are listed; inventing a sameAs for
 * something with no authoritative page would be worse than omitting it.
 */
const TOPIC_ENTITIES = {
  "/resources/what-is-mcp/": ["Model Context Protocol", "https://en.wikipedia.org/wiki/Model_Context_Protocol"],
  "/resources/what-is-a-context-window/": ["Context window", "https://en.wikipedia.org/wiki/Large_language_model"],
  "/resources/what-are-tokens/": ["Lexical analysis", "https://en.wikipedia.org/wiki/Lexical_analysis"],
  "/resources/what-are-embeddings/": ["Word embedding", "https://en.wikipedia.org/wiki/Word_embedding"],
  "/resources/what-is-fine-tuning/": ["Fine-tuning (deep learning)", "https://en.wikipedia.org/wiki/Fine-tuning_(deep_learning)"],
  "/resources/what-is-multimodal-ai/": ["Multimodal learning", "https://en.wikipedia.org/wiki/Multimodal_learning"],
  "/resources/what-is-a-system-prompt/": ["Prompt engineering", "https://en.wikipedia.org/wiki/Prompt_engineering"],
  "/resources/what-is-prompt-injection/": ["Prompt injection", "https://en.wikipedia.org/wiki/Prompt_injection"],
  "/resources/what-is-ai-bias/": ["Algorithmic bias", "https://en.wikipedia.org/wiki/Algorithmic_bias"],
  "/resources/ai-and-the-privacy-act/": ["Privacy Act 1988", "https://en.wikipedia.org/wiki/Privacy_Act_1988"],
  "/resources/ai-and-copyright-in-australia/": ["Copyright law of Australia", "https://en.wikipedia.org/wiki/Copyright_law_of_Australia"],
  "/resources/what-are-ai-guardrails/": ["AI safety", "https://en.wikipedia.org/wiki/AI_safety"],
  "/resources/is-it-safe-to-put-company-data-into-ai/": ["Information privacy", "https://en.wikipedia.org/wiki/Information_privacy"],
  "/resources/what-is-shadow-ai/": ["Shadow IT", "https://en.wikipedia.org/wiki/Shadow_IT"],
};

/** Pages where the company itself is the subject — these get the full entity. */
const FULL_ORG_PAGES = new Set([
  "/", "/about-us/", "/about/", "/our-company/", "/contact-us/", "/contact/",
  "/history/", "/purpose/", "/people/", "/our-people/", "/offices/", "/our-offices/",
]);

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


/** More specific WebPage subtypes, so each page says what KIND of page it is. */
const PAGE_TYPES = {
  "/contact-us/": "ContactPage",
  "/contact/": "ContactPage",
  "/about-us/": "AboutPage",
  "/about/": "AboutPage",
  "/our-company/": "AboutPage",
  "/history/": "AboutPage",
  "/purpose/": "AboutPage",
  "/culture/": "AboutPage",
  "/people/": "AboutPage",
  "/our-people/": "AboutPage",
  "/blog/": "CollectionPage",
  "/blogs/": "CollectionPage",
  "/privacy-policy/": "WebPage",
};

/** The AI programs are genuinely courses — every fact here is stated on the
 *  programs page ("Three months, 24 modules", self-paced, ~two hours a week). */
const COURSES = {
  "/programs/": {
    name: "AI Training & Enablement Program",
    description:
      "A three-month, self-paced AI enablement program taking non-technical staff from their first prompts to deployed AI agents. 24 modules, around two hours per week.",
  },
  "/bpo-program/": {
    name: "BPO AI Program",
    description:
      "Structured AI enablement for BPO and outsourced teams, run on a monthly cycle across three months.",
  },
};

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
  const graph = [FULL_ORG_PAGES.has(p.url) ? ORGANIZATION : ORGANIZATION_COMPACT, WEBSITE];

  const webpage = {
    "@type": PAGE_TYPES[p.url] || "WebPage",
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

  // --- Resource article --------------------------------------------------
  // The AI resource library carries its own byline ("By Dylan Bailey, Certified
  // Claude Expert · Updated 4 August 2026"). Named authorship with a stated
  // credential is exactly the signal Google and answer engines look for on
  // informational content, so it belongs in the graph, not only in visible text.
  if (p.url.startsWith("/resources/") && p.url !== "/resources/") {
    const upd = p.html.match(/Updated\s+(\d{1,2})\s+([A-Z][a-z]+)\s+(\d{4})/);
    const iso = upd && MONTHS[upd[2].toLowerCase()]
      ? `${upd[3]}-${MONTHS[upd[2].toLowerCase()]}-${String(upd[1]).padStart(2, "0")}`
      : null;
    const article = {
      "@type": "Article",
      "@id": `${pageUrl}#article`,
      headline: (p.title || "").split("|")[0].trim(),
      mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
      author: {
        "@type": "Person",
        name: "Dylan Bailey",
        jobTitle: "Certified Claude Expert",
        url: `${BASE}/dylan-bailey/`,
        worksFor: { "@id": ORG_ID },
      },
      publisher: { "@id": ORG_ID },
      inLanguage: "en-AU",
      isAccessibleForFree: true,
    };
    const topic = TOPIC_ENTITIES[p.url];
    if (topic) {
      article.about = { "@type": "Thing", name: topic[0], sameAs: topic[1] };
      // Also naming the discipline gives engines a broader entity to hang the
      // page off when the specific concept isn't what was asked about.
      article.mentions = {
        "@type": "Thing",
        name: "Artificial intelligence",
        sameAs: "https://en.wikipedia.org/wiki/Artificial_intelligence",
      };
    }
    article.audience = { "@type": "Audience", audienceType: "Australian small and medium businesses" };
    if (p.description) article.description = p.description;
    if (iso) { article.datePublished = iso; article.dateModified = iso; }
    if (p.ogImage) article.image = p.ogImage.startsWith("http") ? p.ogImage : `${BASE}${p.ogImage}`;
    graph.push(article);
    counts.Article = (counts.Article || 0) + 1;
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
    const service = {
      "@type": "Service",
      "@id": `${pageUrl}#service`,
      name: SERVICES[p.url],
      serviceType: SERVICES[p.url],
      provider: { "@id": ORG_ID },
      areaServed: { "@type": "Country", name: "Australia" },
      ...(p.description ? { description: p.description } : {}),
      mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
    };
    // The staffing pages each describe a concrete role, so the Workforce
    // service can enumerate exactly what it offers rather than just naming
    // itself — the difference between "we do staffing" and a list an answer
    // engine can actually quote.
    if (p.url === "/ad-on-workforce/" || p.url === "/ad-on-workforce-division/") {
      service.hasOfferCatalog = {
        "@type": "OfferCatalog",
        name: "Outsourced roles",
        itemListElement: WORKFORCE_ROLES.map(([name, url]) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name, url: `${BASE}${url}` },
        })),
      };
    }
    graph.push(service);
    counts.Service++;
  }

  // --- Course ------------------------------------------------------------
  if (COURSES[p.url]) {
    const c = COURSES[p.url];
    graph.push({
      "@type": "Course",
      "@id": `${pageUrl}#course`,
      name: c.name,
      description: c.description,
      url: pageUrl,
      provider: { "@id": ORG_ID },
      inLanguage: "en-AU",
      mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: "PT2H",     // per week, stated on the programs page
        location: { "@type": "VirtualLocation", url: pageUrl },
      },
    });
    counts.Course = (counts.Course || 0) + 1;
  }

  // --- Blog index --------------------------------------------------------
  // A listing page should say what it lists; otherwise it looks like a thin
  // page of links to a crawler.
  if (webpage["@type"] === "CollectionPage") {
    const posts = [...new Set(
      [...p.html.matchAll(/<a\b[^>]*href="(\/[a-z0-9-]{12,}\/)"/gi)].map((m) => m[1])
    )].filter((u) => u !== p.url).slice(0, 30);
    if (posts.length >= 3) {
      graph.push({
        "@type": "ItemList",
        "@id": `${pageUrl}#list`,
        itemListElement: posts.map((u, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${BASE}${u}`,
          ...(titles.get(u) ? { name: titles.get(u).split("|")[0].trim() } : {}),
        })),
      });
      counts.ItemList = (counts.ItemList || 0) + 1;
    }
  }

  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 0)
    .replace(/</g, "\\u003c");   // never let a stray "<" close the script early
  const block = `<script type="application/ld+json" ${MARKER}>${json}</script>\n</head>`;

  if (!DRY) fs.writeFileSync(p.file, p.html.replace(/<\/head>/i, block));
  injected++;
}

console.log(`${DRY ? "[dry run] " : ""}[schema] ${injected} pages`);
for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(16)} ${v}`);
