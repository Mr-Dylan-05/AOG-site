#!/usr/bin/env node
/**
 * enhance-contact-form.js — accessibility and UX fixes for the contact form.
 *
 * The form came out of the design flatten as a visual object rather than a
 * working one. Fields were named by scripts/wire-contact-form.js; this handles
 * the parts that affect whether people can actually complete it:
 *
 *   - the radio group becomes a <fieldset>/<legend>, so a screen reader
 *     announces "How should we contact you?" before the options rather than
 *     reading two orphaned radios
 *   - a live status region, so success and failure are announced rather than
 *     only shown
 *   - a hidden _subject so enquiries arrive with a useful subject line instead
 *     of the form service's default
 *   - data-contact-form, which is what assets/js/contact-form.js binds to
 *
 * Idempotent — safe to re-run.
 *
 * Usage:  node scripts/enhance-contact-form.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "public", "contact-us", "index.html");
const DRY = process.argv.includes("--dry");

let html = fs.readFileSync(FILE, "utf8");
const before = html;
const done = [];

// --- hook for the JS -------------------------------------------------------
if (!/<form[^>]*data-contact-form/.test(html)) {
  html = html.replace(/<form\b/, '<form data-contact-form');
  done.push("added data-contact-form hook");
}

// --- subject line ----------------------------------------------------------
if (!html.includes('name="_subject"')) {
  html = html.replace(
    /<input type="text" name="_gotcha"/,
    '<input type="hidden" name="_subject" value="Website enquiry — adongroup.com.au">\n        <input type="text" name="_gotcha"'
  );
  done.push("added _subject");
}

// --- radio group becomes a real fieldset -----------------------------------
// Screen readers otherwise announce two radios with no idea what they answer.
if (!html.includes("contact-pref-group")) {
  const m = html.match(
    /<div><span[^>]*>How should we contact you\?[\s\S]*?<\/div>\s*<\/div>/
  );
  if (m) {
    const block = m[0];
    const inner = block.match(/<div[^>]*>\s*<label[\s\S]*?<\/div>/);
    const legendStyle = (block.match(/<span([^>]*)>How should we contact you\?/) || [, ""])[1];
    if (inner) {
      const fieldset =
        `<fieldset class="contact-pref-group" style="border:0;padding:0;margin:0">\n` +
        `          <legend${legendStyle}>How should we contact you? <span aria-hidden="true">*</span></legend>\n` +
        `          ${inner[0]}\n` +
        `        </fieldset>`;
      html = html.replace(block, fieldset);
      done.push("radio group -> fieldset/legend");
    }
  }
}

// --- live status region ----------------------------------------------------
if (!html.includes("data-form-status")) {
  html = html.replace(
    /<button type="submit"/,
    '<p class="form-status" data-form-status role="status" aria-live="polite"></p>\n        <button type="submit"'
  );
  done.push("added aria-live status region");
}

if (html !== before && !DRY) fs.writeFileSync(FILE, html);

console.log(`${DRY ? "[dry run] " : ""}contact form enhancements`);
if (!done.length) console.log("  nothing to do — already applied");
for (const d of done) console.log(`  ${d}`);
