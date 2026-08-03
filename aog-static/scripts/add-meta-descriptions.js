#!/usr/bin/env node
/**
 * add-meta-descriptions.js — write the meta descriptions the site never had.
 *
 * The old WordPress site had Yoast installed but no descriptions filled in on
 * any page, so this isn't restoring anything — it's new copy. Each one was
 * written from that page's own content, not generated from the title, and each
 * is unique (duplicate descriptions are worse than none).
 *
 * Descriptions land in front matter for src/pages/** (base.njk renders them as
 * both meta description and og:description) and directly in <head> for the
 * flattened design pages in public/**.
 *
 * NOT covered — 8 pages that are empty shells, nav and footer with no body
 * content at all:
 *   /ad-on-workforce/about/   /ad-on-workforce/services/   /careers/   /edm/
 *   /google-ads/   /faqs/aod-faqs/   /faqs/aoh-faqs/
 *   /animated-video-maker-help-build-your-brand/
 * Giving those a description would invite Google to index thin content. They
 * need real content or a noindex — a content decision, not a metadata one.
 *
 * Usage:  node scripts/add-meta-descriptions.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DRY = process.argv.includes("--dry");

const DESCRIPTIONS = {
  "ad-on-hold-about": "Since 2008 Ad On Hold has helped Australian businesses turn hold time into advertising — a better caller experience and a genuinely captive audience.",
  "ad-on-hold-about/products": "Ad On Hold packages — on-hold messages, greetings, IVR and after-hours recordings with custom copywriting, professional voice-over and royalty-free music.",
  "ad-on-hold-message": "Ad On Hold is more than a hold message. How brands like Autobarn, Harcourts, Harley-Davidson and Ray White use on-hold advertising to reach callers.",
  "ad-on-mobile-goldcoast-company": "An Australian first from a Gold Coast company — Ad On Mobile, the marketing technology changing how small business owners promote products and services.",
  "ad-on-mobile-messaging": "You already use your mobile for business — but how effective is it really? Why Ad On Mobile gives small businesses a real advantage in mobile messaging.",
  "aog-report-explainers": "A plain-English guide to your Ad On Group Google Ads report — what clicks, impressions, date ranges and each of the other metrics actually mean.",
  "blog": "Insights from Ad On Group on outsourcing, remote staffing, digital marketing and the changing shape of office administration for Australian businesses.",
  "brochure-campaign": "Stay front of mind with the customers who matter most. Ad On Group brochure campaigns keep your brand in front of your existing customer base.",
  "case-study": "How Ad On Group helped KR Blinds achieve a 300% year-on-year revenue increase — the full case study from owners Toni and Larry Geltch.",
  "christmas-offer-2019": "Enquire about the Ad On Group Christmas video offer — leave your details and our team will be in touch with you shortly.",
  "contact": "Get in touch with Ad On Group — 1/44 Township Drive, Burleigh Heads QLD 4219. Call (07) 5586 1400 or email info@adongroup.com.au.",
  "digital-advertising-on-social-media-platforms-and-websites": "Digital advertising across social platforms and websites — why Facebook's billion-plus users make social a channel Australian businesses can't ignore.",
  "direct-debit-services-agreement": "The Ad On Group Direct Debit Service Agreement — your obligations under a direct debit arrangement and how the Merchant administers it.",
  "easy-rate-app": "Get more Google reviews, easily. The Easy Rate app by Ad On Review lets you send, respond to and track feedback requests from your mobile.",
  "easy-rate-app/faqs": "Common questions about the Easy Rate app — starting a trial, setting it up, how long it takes to go live, and what's involved day to day.",
  "easy-rate-app/thank-you": "Thanks for contacting us about the Easy Rate app. Our team will be in touch within 24 hours on weekdays to arrange your demo.",
  "easy-rate-app/try-now": "Request a demo of the Easy Rate app by Ad On Review and start collecting more Google reviews from the customers you already serve.",
  "excellent-online-digital-marketing": "Why an excellent customer support system is essential to online digital marketing, and how it helps your company keep and grow its customer base.",
  "faqs/aow-faqs": "Frequently asked questions about Ad On Workforce — the roles we provide, where our staff are based, and how outsourced staffing actually works.",
  "google-ads-management": "Google Ads management from Ad On Group — why paying to appear on page one increasingly matters, and how we manage your campaigns and your spend.",
  "home-2025": "Ad On Group is an innovative Australian business with three main divisions: offshore staffing, digital marketing and on-hold messaging.",
  "how-can-a-business-benefit-from-asking-their-customers-for-feedback": "The more you ask, the more your business benefits. How asking customers for feedback drives engagement, trust and growth in the digital age.",
  "how-your-website-should-work-for-you": "People once judged you by your shoes — today they judge you by your website. How many customers have you lost to a site that doesn't work for you?",
  "maximising-efficiency-overseas-remote-staff-and-the-evolution-of-office-administration": "How overseas remote staff are reshaping office administration after the shift to remote work, and what that change means for Australian businesses.",
  "mobile-advertising-strategies-with-instagram": "Upgrade your mobile advertising strategy with Instagram — how a photo-sharing app became a powerful channel for reaching new customers.",
  "on-hold-message": "How an on-hold message can drive enquiries and open new conversations — because the key to a successful business isn't the cheapest price.",
  "privacy-policy": "The Ad On Group privacy policy — how we collect, use and protect customer information across our products and ongoing services.",
  "program-pricing": "Pricing for the Ad On AI Enablement Program — from Anthropic's sole SME-focused AI training partner in Australia.",
  "refer-a-friend": "Know a business that could benefit from Ad On Group? Refer a friend and invite them to see what we do.",
  "regain-balance-in-your-life-the-transformative-power-of-remote-staffing": "Juggling too many responsibilities in a small business? How remote staffing gives owners back their time and restores some work-life balance.",
  "regular-connection-with-your-customer-base": "How many people have you spoken to today? Why regular, genuine connection with your customer base matters more than most businesses think.",
  "seo-stands-for": "SEO stands for Search Engine Optimisation — what it means, what the surrounding jargon means, and why ranking near the top of search matters.",
  "sitemap": "A full index of pages across the Ad On Group website — workforce, digital, on-hold and AI services, plus company information.",
  "social-media-matters-to-your-business": "Top six reasons social media matters to your business — starting with the simplest one: it's where your customers already spend their time.",
  "streamlining-staff-training-the-power-of-outsourcing-with-robust-back-office-support": "Time is a precious commodity. How outsourcing with robust back-office support streamlines staff training for busy Australian businesses.",
  "terms-and-conditions": "Ad On Group product terms and conditions — package pricing, special offers, and the terms that apply to each of our services.",
  "thank-you": "Thank you — your message has been received. The Ad On Group team will reach out to you by email shortly.",
  "the-hidden-costs-of-hiring-in-australia-unraveling-the-full-employment-picture": "Hiring in Australia isn't just about agreeing a salary. Unpacking the hidden costs of employment and the full picture owners should budget for.",
  "video-for-business": "Why video for your business is a must — with attention spans down to about eight seconds, video is how you get your message across fast.",
  "website-examples": "Website examples from Ad On Group across auto, trades, hospitality, fitness, health and beauty, retail, medical, construction and more.",
};

/**
 * Pages that HAD a description but shared it verbatim with other pages.
 * Duplicate descriptions compete with each other in search, so these are
 * overwritten with something specific to each page.
 *
 * Not touched: the /package/* pairs (e.g. /customer-service/ vs
 * /package/customer-service/). Those share a description because they are
 * genuinely near-duplicate pages — that needs consolidating at the page level,
 * and papering over it with different copy would hide the real problem.
 */
const DEDUPE = {
  "offices": "Ad On Group's head office is on the Gold Coast, Australia, home to most management and client-facing teams, with remote teams in South Africa and the Philippines.",
  "people": "Meet the Ad On Group management team — operations, finance, talent and business development leaders across our Australian and international offices.",
  "history": "Born in 2008 and still growing. Through the global financial crisis, a pandemic, floods, earthquakes, cyclones and fires — nearly 20 years of adapting and innovating.",
  "purpose": "Our purpose is simply to make our customers' lives better — through the right offshore staff, saving time and money, and helping businesses grow.",
  "culture": "A look inside life at Ad On Group — Friday lunches, Christmas parties and the team spirit that keeps our people together across offices.",
  "domains": ".au domains have landed. Shorter, sharper and easier to remember — and available to whoever secures it first. Safeguard your .au domain with Ad On Group.",
  "facebook-packages": "Billions log into Facebook every day. Ad On Group's Facebook and Instagram advertising packages help you reach that audience and turn it into customers.",
  "ai-enablement-specialist": "An outsourced AI Enablement Specialist trains your staff on AI tools and prompting, then builds the automations that cut manual, repetitive work.",
};

let njk = 0, html = 0, skipped = 0, missing = 0, deduped = 0;

const ALL = { ...DESCRIPTIONS, ...DEDUPE };

for (const [slug, desc] of Object.entries(ALL)) {
  const overwrite = slug in DEDUPE;
  const njkFile = path.join(ROOT, "src", "pages", slug, "index.njk");
  const htmlFile = path.join(ROOT, "public", slug, "index.html");

  if (fs.existsSync(njkFile)) {
    const before = fs.readFileSync(njkFile, "utf8");
    if (/^description:/m.test(before)) {
      if (!overwrite) { skipped++; continue; }
      const after = before.replace(/^description:.*$/m, `description: ${JSON.stringify(desc)}`);
      if (!DRY) fs.writeFileSync(njkFile, after);
      deduped++; continue;
    }
    // Slot it straight after the title line, matching the existing key order.
    const after = before.replace(
      /^(title:.*)$/m,
      `$1\ndescription: ${JSON.stringify(desc)}`
    );
    if (after === before) { console.warn(`  ! no title line: ${slug}`); continue; }
    if (!DRY) fs.writeFileSync(njkFile, after);
    njk++;
  } else if (fs.existsSync(htmlFile)) {
    const before = fs.readFileSync(htmlFile, "utf8");
    if (/<meta[^>]*name=["']description["']/i.test(before)) {
      if (!overwrite) { skipped++; continue; }
      const after = before.replace(
        /(<meta[^>]*name=["']description["'][^>]*content=)(["'])(?:.*?)\2/is,
        `$1$2${desc.replace(/"/g, "&quot;")}$2`
      );
      if (!DRY) fs.writeFileSync(htmlFile, after);
      deduped++; continue;
    }
    const after = before.replace(
      /(<title>.*?<\/title>)/s,
      `$1\n<meta name="description" content="${desc.replace(/"/g, "&quot;")}">`
    );
    if (after === before) { console.warn(`  ! no <title>: ${slug}`); continue; }
    if (!DRY) fs.writeFileSync(htmlFile, after);
    html++;
  } else {
    console.warn(`  ! no source for: ${slug}`);
    missing++;
  }
}

console.log(`${DRY ? "[dry run] " : ""}meta descriptions`);
console.log(`  new — front matter (src/pages) : ${njk}`);
console.log(`  new — <head> (public)          : ${html}`);
console.log(`  de-duplicated (overwritten)    : ${deduped}`);
console.log(`  left alone (already unique)    : ${skipped}`);
console.log(`  source not found              : ${missing}`);
console.log(`  total touched                 : ${njk + html + deduped} of ${Object.keys(ALL).length}`);
