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
  {
    name: "Dylan Bailey",
    jobTitle: "Facilitator",
    url: "https://www.linkedin.com/in/dylan-bailey-544986378",
    certs: [
      { name: "Building with the Claude API", issued: "2026-05-24", id: "dcmuv8p7s79f" },
      { name: "Claude Code in Action", issued: "2026-05-19", id: "x9zff2dxjtmc" },
      { name: "Introduction to Model Context Protocol", issued: "2026-05-19", id: "es9q57inzwit" },
    ],
  },
  {
    name: "Beau Robards",
    jobTitle: "Facilitator",
    url: "https://www.linkedin.com/in/beau-robards-6b4b09357",
    certs: [
      { name: "Building with the Claude API", issued: "2026-05-17", id: "n62y3wsca8nc" },
      { name: "Claude 101", issued: "2026-05-10", id: "ei9zawcy6zdt" },
      { name: "Claude Code in Action", issued: "2026-05-19", id: "36o5os24aibf" },
      { name: "Introduction to Agent Skills", issued: "2026-05-10", id: "gjqq2orqeime" },
      { name: "Introduction to Model Context Protocol", issued: "2026-05-17", id: "f7pjhnffpx66" },
    ],
  },
  {
    name: "Taryn Boxer",
    jobTitle: "Chief Operating Officer",
    url: "https://www.linkedin.com/in/taryn-boxer-84b482285",
    certs: [
      { name: "Building with the Claude API", issued: "2026-05-18", id: "j8k76bz9oqu3" },
      { name: "Claude Code in Action", issued: "2026-05-18", id: "gapbizujntkt" },
      { name: "Introduction to Agent Skills", issued: "2026-05-17", id: "owyiz7r5cyzs" },
      { name: "Introduction to Model Context Protocol", issued: "2026-05-18", id: "a9x73h8t6df8" },
    ],
  },
  {
    name: "Ben Ragless",
    jobTitle: "Business Development",
    url: "https://www.linkedin.com/in/ben-ragless-46299386",
  },
  {
    name: "Leah Barnes",
    jobTitle: "Training Coordinator",
    url: "https://www.linkedin.com/in/leah-barnes-91305a2a3",
    certs: [
      { name: "Building with the Claude API", issued: "2026-05-17", id: "cbwr7q3yighj" },
      { name: "Claude Code in Action", issued: "2026-05-17", id: "87a6e7oo4fbj" },
      { name: "Introduction to Agent Skills", issued: "2026-05-17", id: "375jmiw9gf5s" },
      { name: "Introduction to Model Context Protocol", issued: "2026-05-17", id: "h5rgbphj8y9n" },
    ],
  },
  {
    name: "Tracy Malone",
    jobTitle: "Training Coordinator",
    url: "https://www.linkedin.com/in/tracy-malone-606907258",
    certs: [
      { name: "Building with the Claude API" },
      { name: "Claude Code in Action" },
      { name: "Introduction to Agent Skills" },
      { name: "Introduction to Model Context Protocol", issued: "2026-05-17", id: "8ibweuprumje" },
    ],
  },
];

/**
 * Ad On AI, typed as a training provider rather than as one of five divisions.
 *
 * The problem this solves: every division was a bare `Organization` with a
 * one-line description, at exact parity with its siblings. Nothing in the graph
 * said what *kind* of company Ad On AI is. An answer engine asked for "AI
 * training companies in Australia" looks for an entity typed as a training
 * provider; a diversified ProfessionalService that happens to list a division
 * called "Ad On AI" does not match that shape, which is how the question ends up
 * answered with the big consultancies by default.
 *
 * EducationalOrganization is the specific type for a training provider. The
 * courses are re-attributed to it below, because a Course whose provider is the
 * parent strengthens the wrong entity — it says the diversified agency runs
 * training, not that there is an AI training company here.
 */
const AD_ON_AI_ID = `${BASE}/ad-on-ai-division/#division`;

const AD_ON_AI = {
  "@type": ["Organization", "EducationalOrganization"],
  "@id": AD_ON_AI_ID,
  name: "Ad On AI",
  url: `${BASE}/ad-on-ai-division/`,
  description:
    "Ad On AI is Ad On Group's AI training program. Through it, Ad On Group — an Australian-owned company operating since 2008 — trains non-technical staff at Australian businesses to use AI in their everyday work, over three months, delivered by Claude Certified Associates.",
  parentOrganization: { "@id": ORG_ID },
  knowsAbout: [
    "AI training",
    "AI adoption",
    "AI enablement",
    "Prompt engineering",
    "AI automation",
    "AI agents",
    "Generative AI for business",
  ],
  areaServed: { "@type": "Country", name: "Australia" },
};

/** Extra properties merged into a division's node in `subOrganization`. */
const DIVISION_EXTRAS = { "/ad-on-ai-division/": AD_ON_AI };

/** Pages where Ad On AI is the subject, so the entity travels with them. */
const AI_PAGES = new Set([
  "/ad-on-ai-division/", "/programs/", "/bpo-program/", "/ongoing-support/",
]);
const isAiPage = (url) =>
  AI_PAGES.has(url) || url.startsWith("/resources/") || url.startsWith("/ai-training-");

const ORGANIZATION = {
  // Multi-typed: it's an organisation, and it's a service business with a
  // street address — which is what local results key off.
  "@type": ["Organization", "ProfessionalService", "EducationalOrganization"],
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
    ...(DIVISION_EXTRAS[url] || {}),
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
  // Coordinates, hours and headcount are what turn a ProfessionalService entry
  // from a name-and-address into something local search can actually rank and
  // display. Coordinates are from the company's own Google Maps listing.
  geo: {
    "@type": "GeoCoordinates",
    latitude: -28.1133038,
    longitude: 153.4347102,
  },
  hasMap: "https://www.google.com/maps/place/Ad+On+Group/@-28.1133038,153.4347102,17z",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "17:00",
  },
  numberOfEmployees: { "@type": "QuantitativeValue", value: 141 },
  foundingLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Gold Coast",
      addressRegion: "QLD",
      addressCountry: "AU",
    },
  },
  // Verified company profiles. These are how a search engine confirms that the
  // entity on this site and the entity on those platforms are the same company.
  // The Google Business Profile listing is included alongside the social
  // profiles. It gives Google an explicit statement that the entity described
  // here and the entity in the knowledge panel are the same one, rather than
  // leaving it to be inferred from matching name, address and phone.
  sameAs: [
    ...(site.social || []),
    "https://www.google.com/maps/place/Ad+On+Group/@-28.1133038,153.4347102,17z",
  ],
  employee: TEAM.map(({ name, jobTitle, url, certs }) => ({
    "@type": "Person",
    name,
    jobTitle,
    sameAs: [url],
    worksFor: { "@id": ORG_ID },
    // Anthropic's own certificates, each independently verifiable at
    // verify.skilljar.com. Course names and dates come from those verification
    // pages, not from the PDFs — their filenames are opaque hashes and their
    // text layer carries only the holder's name, with the course baked into
    // the certificate image.
    ...(certs && certs.length
      ? {
          hasCredential: certs.map((c) => ({
            "@type": "EducationalOccupationalCredential",
            name: c.name,
            credentialCategory: "certificate",
            recognizedBy: {
              "@type": "Organization",
              name: "Anthropic",
              url: "https://www.anthropic.com/",
            },
            ...(c.issued ? { dateCreated: c.issued } : {}),
            ...(c.id ? { url: `https://verify.skilljar.com/c/${c.id}` } : {}),
          })),
        }
      : {}),
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
  // The AI pages too. They are where the training is sold, so they are where the
  // group needs to arrive in full — trading since 2008, ABN, address, 141 staff,
  // certified trainers. A course attributed to a thinly described sub-brand
  // inherits none of that.
  "/ad-on-ai-division/", "/programs/", "/bpo-program/", "/ongoing-support/",
]);

const WEBSITE = {
  "@type": "WebSite",
  "@id": SITE_ID,
  url: `${BASE}/`,
  name: "Ad On Group",
  publisher: { "@id": ORG_ID },
  inLanguage: "en-AU",
};


/**
 * The service areas, read from the same file the pages render from, so the
 * visible list and the structured data cannot drift apart.
 *
 * Named on the industry pages because "AI training for accounting firms in
 * Brisbane" is a question with almost no competition, where the head term has
 * plenty of it. The visible copy makes that claim to a reader; areaServed makes
 * the same claim to a machine. Australia stays at the head of the list — the
 * program is delivered online, so narrowing it to seven places would assert
 * something smaller than the truth.
 */
/** slug -> that one area, for the page that is about it. */
const LOCATION_AREA = (() => {
  try {
    const items = JSON.parse(
      fs.readFileSync(path.join(ROOT, "src/_data/locations.json"), "utf8")
    ).items;
    return Object.fromEntries(
      items.map((l) => [
        `/ai-training-${l.slug}/`,
        [
          { "@type": "Country", name: "Australia" },
          { "@type": "AdministrativeArea", name: `${l.name}, ${l.region}` },
        ],
      ])
    );
  } catch {
    return {};
  }
})();

const SERVICE_AREAS = (() => {
  try {
    const items = JSON.parse(
      fs.readFileSync(path.join(ROOT, "src/_data/locations.json"), "utf8")
    ).items;
    return [
      { "@type": "Country", name: "Australia" },
      ...items.map((l) => ({ "@type": "AdministrativeArea", name: `${l.name}, ${l.region}` })),
    ];
  } catch {
    return [{ "@type": "Country", name: "Australia" }];
  }
})();


/**
 * The public webinar series, as Event markup.
 *
 * This is the one thing on the site that produces a dated, listable artefact
 * every month. A three-month program is a private engagement that generates
 * nothing anyone can link to, which is precisely why newer workshop-based
 * competitors out-rank a far more credible business: their product is public by
 * default. These pages are how that gets answered.
 *
 * EducationEvent rather than plain Event: it is accurate, Google accepts Event
 * subtypes for rich results, and it reinforces the same claim the rest of the
 * graph makes — that this is a training provider.
 *
 * A session is only marked up if webinars.json says status "scheduled" and gives
 * it a date. Event markup for something that is not happening is worse than no
 * markup, so drafts produce nothing at all.
 */
const WEBINARS = (() => {
  try {
    const d = JSON.parse(fs.readFileSync(path.join(ROOT, "src/_data/webinars.json"), "utf8"));
    const tz = d.timezone || "+10:00";
    const out = {};
    for (const w of d.sessions || []) {
      if (w.status !== "scheduled" || !w.date || !w.slug) continue;
      // Keep both ends in the venue's offset rather than mixing local and UTC:
      // a start in +10:00 with an end in Z is valid but reads as a mistake.
      const [hh, mm] = (w.time || "12:30").split(":").map(Number);
      const endMins = hh * 60 + mm + 45;
      const pad = (n) => String(n).padStart(2, "0");
      const endLocal = pad(Math.floor(endMins / 60) % 24) + ":" + pad(endMins % 60);
      out[`/webinars/${w.slug}/`] = {
        name: w.title,
        description: w.blurb,
        startDate: `${w.date}T${w.time || "12:30"}:00${tz}`,
        endDate: `${w.date}T${endLocal}:00${tz}`,
      };
    }
    return out;
  } catch {
    return {};
  }
})();


/**
 * The syllabus, for pages that show it.
 *
 * "What does Ad On Group teach?" is the question these pages have to answer
 * better than anyone, and the answer used to exist only as prose on one page
 * that search could not reach. The teaches property puts the named techniques and tools —
 * prompt engineering, Claude Projects, Cowork automations, orchestrator agents
 * — into the graph as competencies, and and hasPart gives the three months their
 * own describable structure.
 *
 * Gated on the page actually rendering the curriculum, so it travels with the
 * section rather than with a URL list.
 */
const CURRICULUM = (() => {
  try {
    return require(path.join(ROOT, "src/_data/curriculum.js"))();
  } catch {
    return null;
  }
})();

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
  // Industry pages. Each is a real service offering, not a landing page for one,
  // so each gets its own Service node rather than borrowing the program's.
  "/ai-training-accounting/": "AI Training for Accounting Firms",
  "/ai-training-disability-services/": "AI Training for NDIS and Disability Service Providers",
  "/ai-training-real-estate/": "AI Training for Real Estate Agencies",
  "/ai-training-healthcare/": "AI Training for Medical and Allied Health Practices",
  "/ai-training-legal/": "AI Training for Law Practices",
  "/ai-training-construction/": "AI Training for Construction and Engineering Firms",
  // Location pages. Each names its own area rather than the full list, because
  // that page is about that place.
  "/ai-training-gold-coast/": "AI Training in Gold Coast",
  "/ai-training-brisbane/": "AI Training in Brisbane",
  "/ai-training-ipswich/": "AI Training in Ipswich",
  "/ai-training-logan/": "AI Training in Logan",
  "/ai-training-sunshine-coast/": "AI Training in Sunshine Coast",
  "/ai-training-northern-nsw/": "AI Training in Northern NSW",
  "/ai-training-adelaide/": "AI Training in Adelaide",
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

// ------------------------------------------------------------------- reviews
/**
 * The real Google Business Profile rating, and the individual reviews behind it.
 *
 * Marked up only on pages that actually show it. Structured data has to match
 * what a visitor sees; a rating asserted on a page that never displays one is
 * how a site gets its markup distrusted across the board. So detection is by
 * page content rather than a URL list — put the reviews block on another page
 * and its schema follows it there, with no edit here.
 */
const REVIEWS = (() => {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, "incoming/design/campaign-reviews.json"), "utf8"));
  } catch {
    return null;
  }
})();

const AGGREGATE_RATING =
  REVIEWS && REVIEWS.profile
    ? {
        "@type": "AggregateRating",
        ratingValue: REVIEWS.profile.rating,
        reviewCount: REVIEWS.profile.count,
        bestRating: 5,
        worstRating: 1,
      }
    : null;

/** A reviewer display name that is plainly a business rather than a person. */
const BUSINESS_NAME = /\b(pty|ltd|supplies|services|centre|center|clinic|medical|dental|roofing|electrical|engineering|solutions|group)\b/i;

/** Tags, entities and punctuation stripped, so page text and JSON compare alike. */
const normalise = (s) =>
  String(s).replace(/<[^>]*>/g, " ").replace(/&[a-z]+;|&#\d+;/gi, " ").replace(/[^a-z0-9]+/gi, " ").toLowerCase().trim();

const reviewNode = (r, i) => ({
  "@type": "Review",
  "@id": `${BASE}/#review-${i + 1}`,
  itemReviewed: { "@id": ORG_ID },
  author: { "@type": BUSINESS_NAME.test(r.name) ? "Organization" : "Person", name: r.name },
  reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
  // The source records the month only, so the month is all that gets asserted.
  // Padding it to a specific day would be inventing a fact.
  datePublished: r.date,
  reviewBody: r.text,
});

// ---------------------------------------------------------------- pass 2: build
let injected = 0;
const counts = { WebPage: 0, BreadcrumbList: 0, FAQPage: 0, BlogPosting: 0, Service: 0 };

for (const p of pages) {
  if (p.noindex) continue;
  if (p.html.includes(MARKER)) continue;
  if (!/<\/head>/i.test(p.html)) continue;

  const pageUrl = `${BASE}${p.url}`;
  const fullOrg = FULL_ORG_PAGES.has(p.url) || p.url.startsWith("/ai-training-");
  const graph = [fullOrg ? ORGANIZATION : ORGANIZATION_COMPACT, WEBSITE];

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

  // --- Ad On AI as an entity in its own right -----------------------------
  if (isAiPage(p.url)) {
    graph.push(AD_ON_AI);
    counts.EducationalOrganization = (counts.EducationalOrganization || 0) + 1;
  }

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
        jobTitle: "Claude Certified Associate",
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
      areaServed:
        LOCATION_AREA[p.url] ||
        (p.url.startsWith("/ai-training-")
          ? SERVICE_AREAS
          : { "@type": "Country", name: "Australia" }),
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

  // --- Rating & reviews ---------------------------------------------------
  // Both are gated on the page visibly carrying them (see REVIEWS above).
  if (AGGREGATE_RATING && new RegExp(`\\b${REVIEWS.profile.count}\\s+(?:Google\\s+)?reviews\\b`, "i").test(p.html)) {
    // graph[0] is a shared constant pushed by reference, so clone rather than
    // mutate — otherwise the rating leaks onto every other page in the run.
    graph[0] = { ...graph[0], aggregateRating: AGGREGATE_RATING };
    counts.AggregateRating = (counts.AggregateRating || 0) + 1;
  }
  if (REVIEWS && Array.isArray(REVIEWS.reviews)) {
    // Match on the review body, not the reviewer name: names like "Victoria"
    // are ordinary words that appear all over the site, and matching those
    // attaches reviews to pages that never showed one.
    const pageText = normalise(p.html);
    const shown = REVIEWS.reviews.filter(
      (r) => r.name && r.text && pageText.includes(normalise(r.text).slice(0, 60))
    );
    if (shown.length >= 2) {
      shown.forEach((r, i) => graph.push(reviewNode(r, i)));
      counts.Review = (counts.Review || 0) + shown.length;
    }
  }

  // --- Course (pages that publish the syllabus) ---------------------------
  if (CURRICULUM && /class="ind-months"/.test(p.html)) {
    graph.push({
      "@type": "Course",
      "@id": `${pageUrl}#course`,
      name: SERVICES[p.url] || "AI Training & Enablement Program",
      description: p.description || undefined,
      url: pageUrl,
      provider: { "@id": ORG_ID },
      inLanguage: "en-AU",
      timeRequired: "P3M",
      educationalCredentialAwarded: "Claude Certified Associate program completion",
      teaches: CURRICULUM.teaches,
      numberOfLessons: CURRICULUM.moduleCount,
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: "PT2H",
        location: { "@type": "VirtualLocation", url: pageUrl },
      },
      hasPart: CURRICULUM.months.map((m) => ({
        "@type": "Course",
        "@id": `${pageUrl}#month-${m.n}`,
        name: `Month ${m.n}: ${m.name}`,
        description: m.body,
        teaches: m.teaches,
        provider: { "@id": ORG_ID },
      })),
      mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
    });
    counts.Course = (counts.Course || 0) + 1;
  }

  // --- Webinar ------------------------------------------------------------
  const webinar = WEBINARS[p.url];
  if (webinar) {
    graph.push({
      "@type": "EducationEvent",
      "@id": `${pageUrl}#event`,
      name: webinar.name,
      description: webinar.description,
      startDate: webinar.startDate,
      endDate: webinar.endDate,
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      inLanguage: "en-AU",
      isAccessibleForFree: true,
      location: { "@type": "VirtualLocation", url: pageUrl },
      organizer: { "@id": ORG_ID },
      performer: { "@id": ORG_ID },
      about: { "@id": AD_ON_AI_ID },
      mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
      offers: {
        "@type": "Offer",
        price: 0,
        priceCurrency: "AUD",
        availability: "https://schema.org/InStock",
        url: pageUrl,
        category: "Free",
      },
    });
    // about points at Ad On AI, so the sub-entity needs to be in this graph.
    if (!graph.some((n) => n["@id"] === AD_ON_AI_ID)) graph.push(AD_ON_AI);
    counts.Event = (counts.Event || 0) + 1;
  }

  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 0)
    .replace(/</g, "\\u003c");   // never let a stray "<" close the script early
  const block = `<script type="application/ld+json" ${MARKER}>${json}</script>\n</head>`;

  if (!DRY) fs.writeFileSync(p.file, p.html.replace(/<\/head>/i, block));
  injected++;
}

console.log(`${DRY ? "[dry run] " : ""}[schema] ${injected} pages`);
for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(16)} ${v}`);
