#!/usr/bin/env node
/**
 * fix-navigation.js — repair the click path.
 *
 * Four faults, found after launch. All of them are in the <nav> element.
 * (Note: <header> on these design pages is the HERO section, not the nav bar —
 * the nav is a separate <nav> that sits above it.)
 *
 * 1. THE DEAD END. 19 pages carry the Ad On Workforce nav, whose "Home" link
 *    points at /ad-on-workforce/. That nav contains no link to / at all, so on
 *    those pages the only route back to Ad On Group was a footer link — on
 *    /contact-us/ that sits at character 24,458 of a 27,849-character page.
 *    A visitor who clicked "Contact" from the group homepage landed in the
 *    Workforce division with no visible way out.
 *    "Home" on adongroup.com.au now means the group home. The Workforce
 *    division home is still one click away under "About Us".
 *
 * 2. /contact-us/ WAS AN AD ON WORKFORCE PAGE. It is the group's contact page,
 *    linked from the group nav and from every page on the site, but carried the
 *    Workforce logo, the Workforce nav and Workforce-only copy. It now uses the
 *    group nav and neutral wording that suits an enquiry about any division.
 *
 * 3. THE GROUP NAV'S "Contact" SCROLLED INSTEAD OF NAVIGATING. It pointed at
 *    #contact, dropping the visitor at the foot of the same page — where the
 *    only onward link was into the Workforce-branded contact page, which is how
 *    fault 1 was reached in the first place.
 *
 * 4. DEAD ANCHORS. The Workforce nav's "Positions" points at #services, but 5
 *    pages have no such section, so the link did nothing at all. Same class of
 *    bug for "Divisions" (#divisions) once the group nav appears off-homepage:
 *    an in-page anchor is only valid on the page that owns the section.
 *
 * Idempotent.
 *
 * Usage:  node scripts/fix-navigation.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const DRY = process.argv.includes("--dry");

function pages(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) pages(p, out);
    else if (e.name === "index.html") out.push(p);
  }
  return out;
}

/** The nav bar — everything from <nav to </nav>. Not <header>, which is the hero. */
function navRange(html) {
  const start = html.indexOf("<nav");
  if (start === -1) return null;
  const end = html.indexOf("</nav>", start);
  if (end === -1) return null;
  return [start, end + "</nav>".length];
}

const stats = { home: 0, contact: 0, divisions: 0, services: 0, swapped: 0, copy: 0, files: 0 };

// The canonical Ad On Group nav, lifted from the homepage.
const homeHtml = fs.readFileSync(path.join(PUBLIC, "index.html"), "utf8");
const hr = navRange(homeHtml);
if (!hr) { console.error("! could not read the group nav from the homepage"); process.exit(1); }
const GROUP_NAV = homeHtml.slice(hr[0], hr[1]);

for (const file of pages(PUBLIC)) {
  const before = fs.readFileSync(file, "utf8");
  let html = before;
  const rel = "/" + path.relative(PUBLIC, path.dirname(file)).split(path.sep).join("/") + "/";
  const isHome = rel === "/./" || rel === "//";

  // --- 2. /contact-us/ becomes an Ad On Group page ------------------------
  if (rel === "/contact-us/") {
    const r = navRange(html);
    if (r && html.slice(r[0], r[1]).includes("aow-logo")) {
      html = html.slice(0, r[0]) + GROUP_NAV + html.slice(r[1]);
      stats.swapped++;
    }
    // This page takes enquiries for every division, not just offshore staffing.
    // The headings keep their gradient <span>, so each replacement has to step
    // around it rather than match the sentence as flat text.
    const COPY = [
      // H1: "Find the Perfect Support Staff ... — [Get in Touch]"
      [/(>)Find the Perfect Support Staff for Your Business &mdash; (<span[^>]*>)Get in Touch(<\/span>)/,
       "$1Get in Touch with $2Ad&#8202;On&#8202;Group$3"],
      // H2: "It's time to leverage an [offshore workforce!]"
      [/(>)It&rsquo;s time to leverage an (<span[^>]*>)offshore workforce!(<\/span>)/,
       "$1Let&rsquo;s find the right $2solution for you.$3"],
      [/Get the job done while saving up to 80% on your wage bill &mdash; without the headaches\./,
       "Offshore staffing, AI training and enablement, digital marketing or on-hold messaging &mdash; " +
       "tell us what you&rsquo;re trying to solve and we&rsquo;ll point you to the right division."],
      // The closing "Enquire Now" button linked to /contact-us/ — the page it is
      // already on, so it just reloaded. Send it to the form instead.
      [/<form data-contact-form/, '<form id="enquiry" data-contact-form'],
      [/href="\/contact-us\/"([^>]*data-dc="hh")/, 'href="#enquiry"$1'],
    ];
    for (const [find, repl] of COPY) {
      if (find.test(html)) { html = html.replace(find, repl); stats.copy++; }
    }
  }

  // --- nav repairs --------------------------------------------------------
  const r = navRange(html);
  if (r) {
    let nav = html.slice(r[0], r[1]);
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));

    // 1. "Home" must mean the site's home.
    nav = nav.replace(/href="\/ad-on-workforce\/"([^>]*)>Home</g,
      (m, a) => { stats.home++; return `href="/"${a}>Home<`; });

    // 3. "Contact" should navigate to the contact page. It pointed at #contact
    //    on the homepage (scroll to the foot of the same page) and at /#contact
    //    on the 11 other group pages (jump to the homepage, then scroll to its
    //    foot) — neither reaches the contact page.
    nav = nav.replace(/href="\/?#contact"([^>]*)>\s*Contact\s*</g,
      (m, a) => { stats.contact++; return `href="/contact-us/"${a}>Contact<`; });

    // 4. In-page anchors only work on the page that owns the section.
    if (!ids.has("divisions")) {
      nav = nav.replace(/href="#divisions"/g,
        () => { stats.divisions++; return `href="/#divisions"`; });
    }
    if (!ids.has("services")) {
      nav = nav.replace(/href="#services"/g,
        () => { stats.services++; return `href="/ad-on-workforce/#services"`; });
    }

    if (nav !== html.slice(r[0], r[1])) html = html.slice(0, r[0]) + nav + html.slice(r[1]);
  }

  if (html !== before) {
    stats.files++;
    if (!DRY) fs.writeFileSync(file, html);
  }
}

console.log(`${DRY ? "[dry run] " : ""}navigation repair`);
console.log(`  "Home" repointed to /                  : ${stats.home}`);
console.log(`  nav "Contact" -> /contact-us/          : ${stats.contact}`);
console.log(`  dead #divisions -> /#divisions         : ${stats.divisions}`);
console.log(`  dead #services -> /ad-on-workforce/... : ${stats.services}`);
console.log(`  /contact-us/ given the group nav       : ${stats.swapped}`);
console.log(`  Workforce-only copy generalised        : ${stats.copy}`);
console.log(`  files changed                          : ${stats.files}`);
