#!/usr/bin/env node
/**
 * restore-page-meta.js — put back the <title> and meta description that the
 * Ad On AI import dropped.
 *
 * scripts/import-dylan-website.js flattens pages from the deployed adon-ai.com.au
 * site, but the flatten lost the <head> metadata. Eight pages shipped with NO
 * <title> at all — including /programs/ and /bpo-program/ — which means search
 * engines invent one. The values below are the real ones, read from the source
 * repo (~/Documents/GitHub/dylan-website), so this is restoring what already
 * existed rather than inventing copy.
 *
 * Also fixes /ai-enablement-specialist/, which carried a copy-pasted title from
 * the customer-service page and so was competing with it in search.
 *
 * Safe to re-run: a page that already has a correct <title> is left alone.
 *
 * Usage:  node scripts/restore-page-meta.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DRY = process.argv.includes("--dry");

// slug -> [title, description]   (source: dylan-website repo)
const META = {
  "ad-on-ai-division": [
    "Ad On AI | AI Training &amp; Enablement for Australian Teams",
    "A 3-month AI training program that gets your non-technical team using AI on real work — building reusable prompts, automations and agents. Book a call.",
  ],
  "programs": [
    "AI Training &amp; Enablement Program | Ad On AI",
    "Our flagship 3-month AI Training &amp; Enablement program takes non-technical staff from their first prompts to deployed AI agents. Self-paced and hands-on.",
  ],
  "ongoing-support": [
    "Ongoing AI Support, Webinars &amp; Masterclasses | Ad On AI",
    "Keep your team's AI skills sharp after the program with ongoing webinars, masterclasses and community — optional add-ons as AI keeps moving.",
  ],
  "bpo-program": [
    "BPO AI Program for Outsourced Teams | Ad On AI",
    "Structured AI enablement built for BPO and outsourced teams — a monthly cycle that turns your people into confident, productive AI users in three months.",
  ],
  "about": [
    "About Us | Certified Claude Experts | Ad On AI",
    "Meet the team behind Ad On AI — Australian AI trainers and Certified Claude Experts helping SME staff turn AI into real, everyday output.",
  ],
  "ad-on-group": [
    "Ad On Group | Australian-Owned Since 2008",
    "Ad On Group is an Australian-owned company since 2008 — divisions across workforce, AI, digital and hold, helping businesses grow with people and technology.",
  ],
  "terms": [
    "Terms &amp; Conditions | Ad On AI",
    "The terms and conditions governing use of the Ad On AI website, training programs and services.",
  ],

  // Design-project variant of /bpo-program/. Given a distinct title so the two
  // don't compete in search — but they are near-duplicate pages and one of them
  // should probably be consolidated away. Flagged, not decided here.
  "bpo-ai-program": [
    "BPO AI Program | Structured AI Enablement | Ad On Group",
    "Structured AI enablement for outsourced and BPO teams — a monthly cycle that builds confident, productive AI users across your people.",
  ],

  // Was titled "Outsource Customer Service | Ad On Workforce" — a copy-paste
  // from /customer-service/. The page is about the AI Enablement Specialist role.
  "ai-enablement-specialist": [
    "AI Enablement Specialist | Ad On Workforce",
    "Hire an outsourced AI Enablement Specialist — the key tasks this role takes on, and how an Ad On Workforce specialist supports your team day to day.",
  ],
};

// Titles that are wrong rather than missing, so overwriting is intended.
const OVERWRITE = new Set(["ai-enablement-specialist"]);

let fixedTitle = 0, fixedDesc = 0, skipped = 0;

for (const [slug, [title, desc]] of Object.entries(META)) {
  const file = path.join(ROOT, "public", slug, "index.html");
  if (!fs.existsSync(file)) { console.warn(`  ! missing page: ${slug}`); continue; }

  let html = fs.readFileSync(file, "utf8");
  const before = html;

  const titleTag = html.match(/<title>(.*?)<\/title>/s);
  if (!titleTag || !titleTag[1].trim() || OVERWRITE.has(slug)) {
    if (titleTag) html = html.replace(/<title>.*?<\/title>/s, `<title>${title}</title>`);
    else html = html.replace(/<head>/i, `<head>\n<title>${title}</title>`);
    fixedTitle++;
  }

  if (!/<meta[^>]*name=["']description["']/i.test(html)) {
    html = html.replace(
      /(<title>.*?<\/title>)/s,
      `$1\n<meta name="description" content="${desc}">`
    );
    fixedDesc++;
  }

  if (html === before) { skipped++; continue; }
  if (!DRY) fs.writeFileSync(file, html);
}

console.log(`${DRY ? "[dry run] " : ""}page meta restore`);
console.log(`  titles set        : ${fixedTitle}`);
console.log(`  descriptions set  : ${fixedDesc}`);
console.log(`  already correct   : ${skipped}`);
