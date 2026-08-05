#!/usr/bin/env node
/**
 * trim-meta-lengths.js — bring titles and descriptions inside the lengths
 * Google will actually render.
 *
 * 29 titles ran past 62 characters and truncate in results; 16 descriptions ran
 * past 160. None of this changes what a visitor reads: the visible headline is
 * the H1, which is separate markup. Only the <title> and the meta description
 * move.
 *
 * Titles are handled in two passes:
 *
 *   1. Drop the "| Ad On Group" suffix where that alone brings the title under
 *      62. Google appends the site name to results anyway, so the suffix is the
 *      cheapest thing to give up. That fixes 18.
 *
 *   2. The remaining 11 are long article headlines. Cutting them mechanically
 *      would strand a half-clause, so each is written out by hand below, keeping
 *      the phrase someone would actually search.
 *
 * Descriptions get the same treatment. Truncating these read badly — every one
 * ended mid-sentence — so the eleven that were over are rewritten in full below,
 * tightened rather than cut. trimDescription stays as a safety net for anything
 * added later.
 *
 * Idempotent.
 *
 * Usage:  node scripts/trim-meta-lengths.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE = path.join(ROOT, "_site");
const DRY = process.argv.includes("--dry");
const TITLE_MAX = 62;
const DESC_MAX = 158;

/** The eleven that need a human, keyed by URL. */
const BY_HAND = {
  "/maximising-efficiency-overseas-remote-staff-and-the-evolution-of-office-administration/":
    "Overseas Remote Staff & the Future of Office Admin",
  "/streamlining-staff-training-the-power-of-outsourcing-with-robust-back-office-support/":
    "Streamlining Staff Training Through Outsourcing",
  "/on-hold-message/":
    "How an On-Hold Message Drives Enquiries | Ad On Group",
  "/the-hidden-costs-of-hiring-in-australia-unraveling-the-full-employment-picture/":
    "The Hidden Costs of Hiring an Employee in Australia",
  "/ad-on-mobile-messaging/":
    "Is Your Mobile Phone Working Hard Enough for Your Business?",
  "/regain-balance-in-your-life-the-transformative-power-of-remote-staffing/":
    "Regain Balance: The Power of Remote Staffing",
  "/how-can-a-business-benefit-from-asking-their-customers-for-feedback/":
    "Why Asking Customers for Feedback Grows Your Business",
  "/turn-customers-into-your-digital-marketing-ninjas-with-google-reviews/":
    "Turn Customers Into Marketers With Google Reviews",
  "/beau-robards/": "Beau Robards, Certified Claude Expert | Ad On AI",
  "/dylan-bailey/": "Dylan Bailey, Certified Claude Expert | Ad On AI",
  "/our-culture/": "Our Culture | Ad On Workforce",
};

const DESC_BY_HAND = {
  "/animated-video-maker/": "Animated video brings a brand campaign to life. Ad On Group produces short promotional and explainer videos for Australian businesses.",
  "/resources/ai-and-copyright-in-australia/": "Australian copyright requires a human author, so purely AI-generated material likely attracts none — which matters when you need to own or licence it.",
  "/resources/ai-and-the-privacy-act/": "Putting personal information into an AI tool is a disclosure under Australian privacy law. The Privacy Act and the APPs apply as they would anywhere else.",
  "/resources/free-vs-paid-ai-tools/": "The gap between free and paid AI tiers isn't mainly features. It's which model you reach, whether your data trains it, and whether you can administer it.",
  "/resources/how-to-roll-out-ai-to-your-team/": "Most AI rollouts stall after the enthusiasts. Getting the rest of the team using it takes specific tasks, protected time and a visible standard.",
  "/resources/is-it-safe-to-put-company-data-into-ai/": "It depends on your plan and the data. Business and enterprise tiers generally don't train on your inputs; free consumer tiers often may.",
  "/resources/what-are-ai-guardrails/": "Guardrails are the constraints that stop an AI system doing what it shouldn't — what it can access, what it can act on, and what needs approval first.",
  "/resources/what-is-a-context-window/": "A context window is how much an AI model holds in mind at once — the conversation, your documents, its replies. Once full, the earliest material drops out.",
  "/resources/what-is-ai-bias/": "AI bias is systematic skew in output reflecting patterns in training data. In business it shows up most in screening, ranking and anything that sorts people.",
  "/resources/what-is-fine-tuning/": "Fine-tuning retrains a model on your own examples to change how it behaves. For most businesses, better prompting or connecting your data is enough.",
  "/resources/what-is-mcp/": "MCP is a standard that lets AI assistants connect to your real tools and data — files, calendar, CRM — instead of only what you paste into the chat."
};

const SUFFIX = /\s*\|\s*Ad On (Group|Workforce|AI|Digital|Hold)\s*$/;

/**
 * Cut at a sentence boundary when that keeps most of the text, otherwise at a
 * word boundary.
 *
 * An earlier version also cut at commas and turned the comma into a full stop,
 * which produced fragments: "...to change how it behaves. For most businesses."
 * A comma is mid-thought by definition, so it is never a safe place to stop.
 */
function trimDescription(s, max) {
  if (s.length <= max) return s;
  const window = s.slice(0, max + 1);
  const sentence = window.search(/[.!?](?=[^.!?]*$)/);
  if (sentence >= max * 0.6) return window.slice(0, sentence + 1).trim();
  const word = window.search(/\s(?=\S*$)/);
  return window.slice(0, word > 0 ? word : max).trim();
}

/** Lengths must be measured on what a reader sees, not on escaped HTML:
 *  "it&#39;s" is five characters longer than "it's" and skews every check. */
function decode(s) {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
          .replace(/&quot;/g, '"').replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
          .replace(/&#x27;|&apos;/g, "'").replace(/&nbsp;/g, " ");
}

/** Map a built URL back to the file that produced it. */
function sourceFor(url) {
  const slug = url.replace(/^\/|\/$/g, "");
  const njk = path.join(ROOT, "src", "pages", slug, "index.njk");
  if (fs.existsSync(njk)) return { file: njk, fm: true };
  const html = path.join(ROOT, "public", slug, "index.html");
  if (fs.existsSync(html)) return { file: html, fm: false };
  const root = path.join(ROOT, "public", "index.html");
  if (slug === "" && fs.existsSync(root)) return { file: root, fm: false };
  return null;
}

function readMeta(src, fm, kind) {
  if (fm) {
    const m = src.match(new RegExp(`^${kind}:\\s*(.*)$`, "m"));
    if (!m) return null;
    try { return JSON.parse(m[1]); } catch { return m[1].replace(/^["']|["']$/g, ""); }
  }
  if (kind === "title") {
    const m = src.match(/<title>([\s\S]*?)<\/title>/); return m ? m[1] : null;
  }
  const m = src.match(/<meta name="description" content=(["'])([\s\S]*?)\1/);
  return m ? m[2] : null;
}

function writeMeta(src, fm, kind, value) {
  if (fm) {
    const re = new RegExp(`^(${kind}:\\s*)(.*)$`, "m");
    return re.test(src) ? src.replace(re, `$1${JSON.stringify(value)}`) : null;
  }
  if (kind === "title") {
    return src.replace(/<title>[\s\S]*?<\/title>/, `<title>${value}</title>`);
  }
  return src.replace(/(<meta name="description" content=)(["'])([\s\S]*?)\2/,
                     `$1$2${value.replace(/"/g, "&quot;")}$2`);
}

// Walk the built site so we measure what Google actually receives.
const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === "index.html") {
      let u = "/" + path.relative(SITE, dir).split(path.sep).join("/");
      u = (u === "/." ? "/" : u + "/").replace("//", "/");
      pages.push({ url: u, html: fs.readFileSync(p, "utf8") });
    }
  }
})(SITE);

let suffixDropped = 0, byHand = 0, descTrimmed = 0, missing = 0, unresolved = [];

for (const { url, html } of pages) {
  const builtTitle = decode((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "");
  const builtDesc = decode((html.match(/<meta name="description" content=(["'])([\s\S]*?)\1/) || [])[2] || "");
  const needTitle = builtTitle.length > TITLE_MAX;
  const needDesc = builtDesc.length > DESC_MAX;
  if (!needTitle && !needDesc) continue;

  const s = sourceFor(url);
  if (!s) { missing++; unresolved.push(url); continue; }
  const before = fs.readFileSync(s.file, "utf8");
  let src = before;

  if (needTitle) {
    const cur = readMeta(src, s.fm, "title");
    if (cur !== null) {
      let next = BY_HAND[url];
      let hand = Boolean(next);
      if (!next) {
        const stripped = cur.replace(SUFFIX, "");
        if (stripped.length <= TITLE_MAX && stripped !== cur) next = stripped;
      }
      if (next && next !== cur) {
        const out = writeMeta(src, s.fm, "title", next);
        if (out) { src = out; hand ? byHand++ : suffixDropped++; }
      }
    }
  }
  if (needDesc) {
    const cur = readMeta(src, s.fm, "description");
    if (cur !== null && cur.length > DESC_MAX) {
      const next = DESC_BY_HAND[url] || trimDescription(cur, DESC_MAX);
      if (next !== cur) {
        const out = writeMeta(src, s.fm, "description", next);
        if (out) { src = out; descTrimmed++; }
      }
    }
  }

  if (src !== before && !DRY) fs.writeFileSync(s.file, src);
}

console.log(`${DRY ? "[dry run] " : ""}meta lengths`);
console.log(`  titles: brand suffix dropped : ${suffixDropped}`);
console.log(`  titles: rewritten by hand    : ${byHand}`);
console.log(`  descriptions trimmed         : ${descTrimmed}`);
if (missing) {
  console.log(`  source not found for         : ${missing}`);
  unresolved.slice(0, 8).forEach((u) => console.log(`      ${u}`));
}
