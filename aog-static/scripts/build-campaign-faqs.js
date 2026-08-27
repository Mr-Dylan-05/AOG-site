#!/usr/bin/env node
/**
 * build-campaign-faqs.js — extra FAQ entries on /ai-training/.
 *
 * Appends to the FAQ section the page already has, matching its markup
 * exactly: a .faq-item wrapping a <button> with the question and a +/-
 * toggle, then a <p><i> answer. The page's own script hides every answer but
 * the first on load, so new items ship with "+" and no hidden attribute,
 * which is how the existing ones are authored.
 *
 * Supplied wording, with typos corrected. Each fix is listed here so the
 * changes are visible rather than silent:
 *
 *   mastersclasses      -> masterclasses
 *   accross             -> across
 *   transferrable       -> transferable
 *   "the course and     -> "the course as well as"
 *    well as"
 *   "value insights     -> "valuable insights in the community"
 *    into the community"
 *   "2 one on one"      -> "two one-on-one", matching the hero, which
 *                          already writes "one-on-one"
 *
 * Idempotent: its own items carry data-faq="campaign" and are replaced.
 *
 * Usage:  node scripts/build-campaign-faqs.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PAGE = path.join(ROOT, "public", "ai-training", "index.html");

const FAQS = [
  [
    "How does the ongoing monthly support membership work?",
    "You have access to a closed community of other learners, for questions and sharing, access to our Certified Claude experts for your two one-on-one support sessions, weekly masterclasses and podcasts.",
  ],
  [
    "Does the course only cover using Claude?",
    "The course covers AI use generally, but Claude is a focus given that it's the most popular AI platform for business use. The principles remain transferable across most of the AI platforms.",
  ],
  [
    "Can I cancel my monthly membership?",
    "Yes, but you will lose access to the course as well as your one-on-one support and access to the valuable insights in the community.",
  ],
];

// The page writes apostrophes as &#x27; throughout; match it.
const esc = (s) =>
  String(s)
    .replace(/&(?![a-zA-Z#0-9]+;)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#x27;");

const item = ([q, a]) =>
  `<div class="faq-item" data-faq="campaign"><button><b>${esc(q)}</b><span>+</span></button><p><i>${esc(a)}</i></p></div>`;

const BLOCK = FAQS.map(item).join("");

let html = fs.readFileSync(PAGE, "utf8");

// drop a previous run
html = html.replace(/<div class="faq-item" data-faq="campaign">[\s\S]*?<\/div><\/div>/g, (m) =>
  m.endsWith("</div></div>") ? "</div>" : m
);
html = html.replace(/<div class="faq-item" data-faq="campaign">.*?<\/p><\/div>/g, "");

// append after the last existing item inside the FAQ section
const secStart = html.search(/<section[^>]*class="faq"/);
if (secStart === -1) throw new Error("could not find the FAQ section");
const secEnd = html.indexOf("</section>", secStart);
const section = html.slice(secStart, secEnd);

const lastItem = section.lastIndexOf('<div class="faq-item">');
if (lastItem === -1) throw new Error("could not find an existing .faq-item to append after");
const closeAt = section.indexOf("</div>", section.indexOf("</button>", lastItem));
const insertAt = secStart + section.indexOf("</div>", closeAt) + "</div>".length;

html = html.slice(0, insertAt) + BLOCK + html.slice(insertAt);

fs.writeFileSync(PAGE, html);
console.log(`  campaign FAQs: ${FAQS.length} appended`);
