#!/usr/bin/env node
/**
 * build-associates-strip.js — "Why us" on /ai-training/, above the reviews.
 *
 * The seven Claude Certified Associates, lifted from the same strip on
 * /ad-on-ai-division/. It sits directly above the Google reviews so the two
 * read as one Why Us section: who you would be trained by, then what people
 * say about being trained by them.
 *
 * The wording is the strip's own. "Meet your certified associates" is promoted
 * from a label to the heading rather than a new headline being written for it,
 * and no lede is invented; the reviews below supply the evidence.
 *
 * Avatars pick the square crop where one exists (-sq) and the JPEG over the
 * PNG where both do. team-dylan.png and team-beau.png are 1.9MB and 320KB for
 * the same images available at 106KB and 44KB, which is not worth paying for a
 * 78px circle.
 *
 * Dark, like the Community Access card and unlike the white reviews block
 * under it, so the two halves of the section stay legible as separate beats.
 *
 * Idempotent: replaces the block if it is already there.
 *
 * Usage:  node scripts/build-associates-strip.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PAGE = path.join(ROOT, "public", "ai-training", "index.html");

const PEOPLE = [
  ["Dylan Bailey", "Facilitator", "team-dylan.jpg"],
  ["Beau Robards", "Facilitator", "team-beau.jpg"],
  ["Taryn Boxer", "Operations", "team-taryn-sq.jpg"],
  ["Ben Ragless", "Business Dev", "team-ben-sq.jpg"],
  ["Leah Barnes", "Training", "team-leah-sq.jpg"],
  ["Tracy Malone", "Training", "team-tracy-sq.jpg"],
  ["McLean", "IT and Data Manager", "team-mclean.jpg"],
];

const esc = (s) =>
  String(s).replace(/&(?![a-zA-Z#0-9]+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const missing = PEOPLE.filter(([, , f]) => !fs.existsSync(path.join(ROOT, "public", "assets", "design", f)));
if (missing.length) throw new Error("missing avatars: " + missing.map((m) => m[2]).join(", "));

const person = ([name, role, file]) => `
          <li>
            <span class="why-av"><img src="/assets/design/${file}" alt="${esc(name)}" loading="lazy" decoding="async"/></span>
            <span class="why-name">${esc(name)}</span>
            <span class="why-role">${esc(role)}</span>
            <span class="why-cert"><img src="/assets/design/logo-claude.svg" alt="" aria-hidden="true"/>Certified</span>
          </li>`;

const BLOCK = `<section class="campaign-why" id="why-us" aria-label="Why us">
        <p class="overline">Why us</p>
        <h2>Meet your <b>certified associates</b>.</h2>
        <ul class="why-people">${PEOPLE.map(person).join("")}
        </ul>
        <style>
          .campaign-why{padding:88px 7vw 76px;background:#0b1830}
          .campaign-why .overline{font-family:'DM Mono',monospace;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#7fb2ff;margin:0 0 14px}
          .campaign-why h2{font-size:clamp(28px,3.6vw,46px);line-height:1.1;letter-spacing:-2px;margin:0 0 46px;color:#fff}
          .campaign-why h2 b{color:#FBB400}
          .why-people{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:26px 18px}
          .why-people li{display:flex;flex-direction:column;align-items:center;text-align:center;gap:0;padding:0;border:0;margin:0;min-width:0}
          .why-av{width:88px;height:88px;border-radius:50%;overflow:hidden;background:#1a2536;border:2px solid rgba(255,255,255,.18);box-shadow:0 12px 26px -14px rgba(0,0,0,.7)}
          .why-av img{width:100%;height:100%;object-fit:cover;display:block}
          .why-name{margin-top:14px;font-size:15px;font-weight:700;color:#fff;line-height:1.25}
          .why-role{margin-top:3px;font-size:13px;color:#9fb0c9;line-height:1.3}
          .why-cert{margin-top:11px;display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:#dce6f5;white-space:nowrap}
          .why-cert img{width:12px;height:12px;display:block}
          @media(max-width:1024px){ .why-people{grid-template-columns:repeat(4,minmax(0,1fr));gap:30px 16px} }
          @media(max-width:640px){
            .campaign-why{padding:64px 24px 58px}
            .campaign-why h2{margin-bottom:34px}
            .why-people{grid-template-columns:repeat(3,minmax(0,1fr));gap:26px 12px}
            .why-av{width:72px;height:72px}
            .why-name{font-size:13.5px;margin-top:11px}
            .why-role{font-size:12px}
            .why-cert{font-size:9.5px;padding:4px 9px;gap:5px}
            /* Seven into three leaves one on the last row. Left in the first
               column it reads as a gap rather than the end of a list; in the
               middle column it reads as centred. */
            .why-people li:last-child{grid-column:2}
          }
        </style>
      </section>`;

let html = fs.readFileSync(PAGE, "utf8");

if (/<section class="campaign-why"/.test(html)) {
  html = html.replace(/<section class="campaign-why"[\s\S]*?<\/section>/, BLOCK);
} else {
  const at = html.search(/<section[^>]*class="campaign-reviews"/);
  if (at === -1) throw new Error("could not find the reviews section to place the strip above");
  html = html.slice(0, at) + BLOCK + html.slice(at);
}

fs.writeFileSync(PAGE, html);
console.log(`  why-us strip: ${PEOPLE.length} associates, above the reviews`);
