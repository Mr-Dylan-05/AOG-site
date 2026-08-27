#!/usr/bin/env node
/**
 * fix-cta-links.js — point "Book a call" at the form, not at an email client.
 *
 * The Ad On AI pages were imported from adon-ai.com.au, which had no form of
 * its own: every call-to-action there was a mailto. Carried onto this site that
 * is a dead end. A visitor on a phone taps "Book a call" and either nothing
 * happens or a blank mail app opens, and the enquiry is lost with no record of
 * it. It also means those leads never reach the sheet.
 *
 * Rewritten to /ai-enquiry/, the AI contact form, so they land in the `enquiry`
 * tab with the rest.
 *
 * ONLY the buttons. A mailto carrying a ?subject= is a call-to-action the
 * design wrote; a bare mailto:info@adongroup.com.au is the contact address
 * printed in a footer, and should stay a mailto. Verified across the built
 * site: 8 with a subject, 44 without, nothing ambiguous.
 *
 * Idempotent, and safe to re-run: once rewritten there are no subject-carrying
 * mailtos left to match.
 *
 * Usage:  node scripts/fix-cta-links.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const PUBLIC = path.join(__dirname, "..", "public");
const TARGET = "/ai-enquiry/";
const DRY = process.argv.includes("--dry");

/* A mailto with a subject line = a button. Without = an address. */
const CTA = /href="mailto:[^"]*\?subject=[^"]*"/g;

let files = 0, links = 0;
const touched = [];

(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html")) {
      const html = fs.readFileSync(p, "utf8");
      const found = html.match(CTA);
      if (!found) continue;
      files++; links += found.length;
      touched.push(`${path.relative(PUBLIC, p).replace(/\/index\.html$/, "") || "/"} (${found.length})`);
      if (!DRY) fs.writeFileSync(p, html.replace(CTA, `href="${TARGET}"`));
    }
  }
})(PUBLIC);

console.log(`  ${DRY ? "would rewrite" : "rewrote"} ${links} call-to-action mailto link(s) -> ${TARGET}`);
touched.sort().forEach((t) => console.log(`      ${t}`));
if (!touched.length) console.log("      (none left to fix)");
