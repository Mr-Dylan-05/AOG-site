#!/usr/bin/env node
/**
 * fix-empty-links.js — anchors with href="" and WordPress export residue.
 *
 * Sibling to fix-dead-ctas.js, which handled circular #contact buttons and "#"
 * placeholders. This covers two families it did not, both found while sweeping
 * the click path and both live:
 *
 * A. href="" — 11 anchors, which reload the current page rather than going
 *    anywhere. Three are the "Find out more" buttons on the HOMEPAGE divisions
 *    cards (Workforce, Digital, Hold), so the primary route into three of the
 *    five divisions did nothing at all. The rest are "Explore the full site" on
 *    the three division pages, an "ENQUIRE NOW" button on /video-flexi/, and a
 *    link on /terms/.
 *
 *    A link checker cannot see these: href="" is valid markup that resolves to
 *    the current URL, so it never 404s. That is why check-assets.js reports a
 *    clean run on pages whose main call to action is inert.
 *
 * B. WORDPRESS EXPORT RESIDUE rendering as visible body text on four pages:
 *      - "[ninja_form id=N]" — the shortcode itself, where a form should be
 *      - "Modal Popup - ID"
 *      - 'Click here to edit the "Modal Popup" settings. This text will not be
 *        visible on frontend.' — the page builder's own editing instructions,
 *        published on a live page, asserting they would not be visible
 *      - a stray "close"
 *      - on /careers/, the tail of the SQL export: "', 'Careers"
 *    Ninja Forms went with WordPress, so those shortcodes could never render.
 *    Where one stood in for a real form it becomes a link to /contact-us/,
 *    matching how the other retired forms were handled; the rest is deleted.
 *
 * Also repoints /careers/'s "Current Vacancies" button, which targeted a
 * #current-vacancies section that does not exist, at the "Send Us Your CV"
 * section — the only thing the page actually offers.
 *
 * Idempotent.
 *
 * Usage:  node scripts/fix-empty-links.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DRY = process.argv.includes("--dry");
const stats = { hrefs: 0, shortcodes: 0, residue: 0, anchors: 0 };

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const write = (p, s) => { if (!DRY) fs.writeFileSync(path.join(ROOT, p), s); };

// ---------------------------------------------------------------- homepage
// Each empty href is matched to its divisions card by the brand named in the
// card body above it, rather than by position, so the mapping survives a
// reordering of the cards.
// These buttons carry target="_blank" rel="noopener": they were written to open
// the divisions' standalone microsites in a new tab, and the URLs were never
// filled in. The destinations are now pages on this site, so the new-tab
// attributes come off with them — an internal link should not open a new tab.
const BRAND_TO_PAGE = {
  "Ad On Workforce": "/ad-on-workforce-division/",
  "Ad On Digital": "/ad-on-digital/",
  "Ad On Hold": "/ad-on-hold/",
  "Ad On SA": "/ad-on-sa/",
  "Ad On AI": "/ad-on-ai-division/",
};

/** The label, with the arrow <span> and any other nested markup stripped. */
const labelText = (s) => s.replace(/<[^>]+>/g, "").replace(/&rarr;|&#8594;/g, "").trim();

const deblank = (attrs) =>
  attrs.replace(/\s*target="_blank"/g, "").replace(/\s*rel="noopener"/g, "");

for (const p of ["public/index.html", "public/ad-on-digital/index.html",
                 "public/ad-on-hold/index.html", "public/ad-on-sa/index.html",
                 "public/terms/index.html"]) {
  const html = read(p);
  write(p, html.replace(
    /<a([^>]*)href=""([^>]*)>([\s\S]*?)<\/a>/g,
    (m, pre, post, label, offset) => {
      const text = labelText(label);
      let target = null;

      if (/^Find out more$/i.test(text)) {
        // Match the card to its division by the brand named in the body above it,
        // rather than by position, so the mapping survives a card reorder.
        // The nearest preceding mention wins, so the window only has to be wide
        // enough to clear the longest card (the Workforce one, ~2.8k).
        const brands = html.slice(Math.max(0, offset - 4000), offset)
          .match(/Ad On (?:AI|Workforce|Hold|Digital|SA)/g);
        target = brands ? BRAND_TO_PAGE[brands[brands.length - 1]] : null;
      } else if (/^(Explore the full site|adongroup\.com\.au)$/i.test(text)) {
        // The copy itself says "the full Ad On Group site" — so that is where
        // it goes.
        target = "/";
      }

      if (!target) return m;
      stats.hrefs++;
      return `<a${deblank(pre)}href="${target}"${deblank(post)}>${label}</a>`;
    }
  ));
}

// --------------------------------------------------------- reference pages
const CTA = (label) => `<p><a class="button" href="/contact-us/">${label}</a></p>`;
const FORM_LABEL = { careers: "Send us your CV", "finder-seo-package": "Start your consultation" };

for (const slug of ["careers", "finder-seo-package", "grant-offer", "video-flexi"]) {
  const p = `src/pages/${slug}/index.njk`;
  let njk = read(p);

  // The builder's own editor chrome, published to the live site.
  for (const re of [
    /^[ \t]*<h5>Modal Popup - ID <\/h5>[ \t]*$/gm,
    /^[ \t]*Click here to edit the &quot;Modal Popup&quot; settings\. This text will not be visible on frontend\.[ \t]*$/gm,
    /^[ \t]*close[ \t]*$/gm,
    /^[ \t]*<p>\[ninja_form id=\d+\]<\/p>[ \t]*$/gm,
  ]) {
    const n = (njk.match(re) || []).length;
    if (n) { njk = njk.replace(re, ""); stats.residue += n; }
  }

  // Where a shortcode stood in for a real form, put the enquiry link there.
  njk = njk.replace(/^[ \t]*\[ninja_form id=\d+\][ \t]*$/gm, () => {
    stats.shortcodes++;
    return FORM_LABEL[slug] ? CTA(FORM_LABEL[slug]) : "";
  });

  if (slug === "careers") {
    if (njk.includes("-->',\t'Careers")) {
      njk = njk.replace("-->',\t'Careers", "-->");
      stats.residue++;
    }
    // "Current Vacancies" pointed at a section that does not exist.
    if (njk.includes('href="#current-vacancies"')) {
      njk = njk.replace('href="#current-vacancies"', 'href="#send-cv"');
      njk = njk.replace(/<h2>(\s*Send Us Your CV\s*)<\/h2>/, '<h2 id="send-cv">$1</h2>');
      stats.anchors++;
    }
  }

  if (slug === "video-flexi") {
    njk = njk.replace(/<a href="" target="_self" rel="noopener">/,
      () => { stats.hrefs++; return `<a href="/contact-us/" target="_self" rel="noopener">`; });
  }

  write(p, njk);
}

console.log(`${DRY ? "[dry run] " : ""}empty links and export residue`);
console.log(`  empty href="" links given a target : ${stats.hrefs}`);
console.log(`  [ninja_form] shortcodes replaced   : ${stats.shortcodes}`);
console.log(`  residue fragments removed          : ${stats.residue}`);
console.log(`  dead in-page anchors repointed     : ${stats.anchors}`);
