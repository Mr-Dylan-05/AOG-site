#!/usr/bin/env node
/**
 * fix-ai-division-faq.js — rebuild the FAQ section on /ad-on-ai-division/.
 *
 * The page shipped with eight EMPTY accordion shells and one orphaned answer
 * ("Yes, any time.") with no question attached. The questions and answers were
 * rendered by the design's runtime, which the flatten dropped — so the section
 * has been showing eight blank boxes on a key division page.
 *
 * Replaced with the eight membership FAQs supplied by the business, using the
 * same <details>/<summary> pattern as /faqs/. That pattern works without
 * JavaScript and is what scripts/inject-schema.js reads to emit FAQPage
 * structured data, so these become eligible for FAQ rich results too.
 *
 * Idempotent — re-running finds no empty shells and does nothing.
 *
 * Usage:  node scripts/fix-ai-division-faq.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "public", "ad-on-ai-division", "index.html");
const DRY = process.argv.includes("--dry");

const FAQS = [
  [
    "Can I cancel my membership?",
    "Yes, you can cancel at any time. Please note that upon cancellation, you will lose all included benefits. Should you wish to rejoin later, a re-joining fee will apply.",
  ],
  [
    "Can I transfer my membership?",
    "No. Memberships are non-transferable as they include ongoing access to the Ad On AI Training Academy.",
  ],
  [
    "Can I join the Ad On AI Community membership without having completed the course?",
    "No, completion of the course is a prerequisite for membership.",
  ],
  [
    "If I don't use my 2 hours of monthly mentoring support, does it roll over to the next month?",
    "No, mentoring hours do not accumulate and operate on a &ldquo;use it or lose it&rdquo; basis each month.",
  ],
  [
    "How do I book my one-on-one mentoring support sessions?",
    "Bookings can be made via the calendar link within your membership platform. Please note that slots must be booked for a minimum of 1 hour.",
  ],
  [
    "If I need more than the included 2 hours per month, what is the cost for additional support?",
    "Additional support is available at a fixed hourly rate.",
  ],
  [
    "Is the membership run on a secure platform?",
    "Yes, all features and content are hosted securely on your platform.",
  ],
  [
    "When do my membership entitlements begin?",
    "Your entitlements begin from the day you start your course (Month 1).",
  ],
];

// Styling copied from the working accordion on /faqs/ so the two match, with
// the Ad On AI blue rather than the group cyan to suit this page.
const SUMMARY_STYLE =
  "list-style:none;cursor:pointer;padding:18px 22px;display:flex;align-items:center;" +
  "justify-content:space-between;gap:16px;font-size:16px;font-weight:700;" +
  "letter-spacing:-0.015em;color:#0B1220";
const ICON_STYLE =
  "flex:none;width:26px;height:26px;border-radius:8px;background:rgba(47,111,237,0.1);" +
  "display:inline-flex;align-items:center;justify-content:center;color:#2F6FED;" +
  "font-size:18px;font-weight:600";
const DETAILS_STYLE =
  "background:#fff;border:1px solid rgba(11,18,32,0.07);border-radius:16px;overflow:hidden";
const ANSWER_STYLE = "padding:0 22px 20px;font-size:15.5px;line-height:1.6;color:#4A5462";

const block = FAQS.map(([q, a]) =>
  `        <details style="${DETAILS_STYLE}">\n` +
  `          <summary style="${SUMMARY_STYLE}">${q}<span style="${ICON_STYLE}">+</span></summary>\n` +
  `          <div style="${ANSWER_STYLE}">${a}</div>\n` +
  `        </details>`
).join("\n\n");

let html = fs.readFileSync(FILE, "utf8");

// The empty shells sit in the flex column immediately after the FAQ heading.
const startAt = html.indexOf("Frequently asked questions");
if (startAt === -1) { console.error("! FAQ heading not found"); process.exit(1); }

const listStart = html.indexOf('<div style="display:flex;flex-direction:column;gap:12px">', startAt);
if (listStart === -1) { console.error("! FAQ list container not found"); process.exit(1); }

// Walk to the matching close of that container.
const re = /<div\b|<\/div>/gi;
re.lastIndex = listStart;
let depth = 0, end = -1, m;
while ((m = re.exec(html)) !== null) {
  depth += m[0].toLowerCase() === "</div>" ? -1 : 1;
  if (depth === 0) { end = m.index + m[0].length; break; }
}
if (end === -1) { console.error("! unbalanced FAQ container"); process.exit(1); }

const existing = html.slice(listStart, end);
if (existing.includes("<details")) {
  console.log("FAQ already rebuilt — nothing to do");
  process.exit(0);
}

const shells = (existing.match(/<div style="background:#fff;border:1px solid/g) || []).length;
const replacement =
  `<div style="display:flex;flex-direction:column;gap:12px">\n${block}\n      </div>`;

html = html.slice(0, listStart) + replacement + html.slice(end);
if (!DRY) fs.writeFileSync(FILE, html);

console.log(`${DRY ? "[dry run] " : ""}/ad-on-ai-division/ FAQ`);
console.log(`  empty accordion shells replaced : ${shells}`);
console.log(`  questions written               : ${FAQS.length}`);
