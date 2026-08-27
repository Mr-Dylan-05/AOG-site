#!/usr/bin/env node
/**
 * fix-campaign-ctas.js — call-to-action wording on /ai-training/.
 *
 * The two dark buttons said "BOOK NOW", which promises a booking. They go to
 * /ai-enquiry/, a four-field form that asks for a name, an email, a phone
 * number and what you want to achieve with AI. Nothing is scheduled, so
 * "GET IN TOUCH" is what actually happens next.
 *
 * The label is literal uppercase in the markup, not text-transform, so it is
 * swapped as written.
 *
 * NOT changed: the hero's "Book a time to talk", which is a different string
 * and was not asked about. It has the same mismatch with the form behind it,
 * so it is worth a look, but changing the one button a visitor sees first is
 * not something to do quietly.
 *
 * Idempotent, and a no-op once the labels are already right.
 *
 * Usage:  node scripts/fix-campaign-ctas.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PAGE = path.join(ROOT, "public", "ai-training", "index.html");

/** [what the export ships, what it should say] */
const LABELS = [["BOOK NOW", "GET IN TOUCH"]];

let html = fs.readFileSync(PAGE, "utf8");
let changed = 0;

for (const [from, to] of LABELS) {
  // Only inside an anchor, so the phrase is never rewritten in body copy.
  const re = new RegExp(`(<a\\b[^>]*>)([^<]*?)${from}`, "g");
  html = html.replace(re, (_m, open, lead) => {
    changed++;
    return open + lead + to;
  });
}

fs.writeFileSync(PAGE, html);
console.log(`  campaign CTAs: ${changed} button${changed === 1 ? "" : "s"} relabelled`);
if (!changed) console.log("  (already done, or the export changed its wording)");
