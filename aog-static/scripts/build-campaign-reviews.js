#!/usr/bin/env node
/**
 * build-campaign-reviews.js — the Google reviews block on /ai-training/.
 *
 * Shows the most RECENT reviews, because the older ones are about websites,
 * digital marketing and on-hold messaging, and this page sells AI training.
 * Reviews live in incoming/design/campaign-reviews.json and are sorted by date
 * here, so adding a newer one pushes the oldest off the block with no edit to
 * this file or to the page.
 *
 * The heading is the second reason in the Why Us section that opens above this
 * block, rather than a label of its own, so the eyebrow is gone and the Google
 * rating in the footer is what marks these as reviews.
 *
 * The card is the same one the rest of the site uses for Google reviews
 * (initial avatar, five gold stars, date, Google mark) so it reads as a real
 * review rather than a testimonial we wrote. Type and accent colour follow the
 * campaign page rather than the site, since that page has its own palette.
 *
 * Idempotent: replaces the block if it is already there.
 *
 * Usage:  node scripts/build-campaign-reviews.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PAGE = path.join(ROOT, "public", "ai-training", "index.html");
const DATA = path.join(ROOT, "incoming", "design", "campaign-reviews.json");

const cfg = JSON.parse(fs.readFileSync(DATA, "utf8"));
const show = cfg.show || 3;
const picked = [...cfg.reviews].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, show);

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const pretty = (d) => {
  const [y, m] = String(d).split("-");
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : d;
};
const esc = (s) => String(s).replace(/&(?![a-zA-Z#0-9]+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const STAR = `<svg width="13" height="13" viewBox="0 0 24 24" style="display:block"><path fill="#FBB400" d="M12 2l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.3 6.1 20l1.3-6.6L2.5 8.9l6.6-.8z"></path></svg>`;
const GOOGLE = `<svg width="17" height="17" viewBox="0 0 24 24" style="flex:none;opacity:.9" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v4h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.2-4.8 3.2-8Z"></path><path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.7l-3.6-2.7a6.6 6.6 0 0 1-9.8-3.4H2.1v2.8A11 11 0 0 0 12 23Z"></path><path fill="#FBBC05" d="M5.8 14.2a6.5 6.5 0 0 1 0-4.2V7.2H2.1a11 11 0 0 0 0 9.8l3.7-2.8Z"></path><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.1 1.6l3.1-3.1A11 11 0 0 0 2.1 7.2l3.7 2.8A6.6 6.6 0 0 1 12 5.4Z"></path></svg>`;

const card = (r) => `
        <article class="cr-card">
          <div class="cr-head">
            <span class="cr-avatar" style="background:${esc(r.av || "#2867e8")}">${esc(r.initials || r.name.slice(0, 2).toUpperCase())}</span>
            <div class="cr-who">
              <div class="cr-name">${esc(r.name)}</div>
              <div class="cr-meta"><span class="cr-stars">${STAR.repeat(r.rating || 5)}</span><span class="cr-date">${esc(pretty(r.date))}</span></div>
            </div>
            ${GOOGLE}
          </div>
          <p class="cr-text">${esc(r.text)}</p>
        </article>`;

const BLOCK = `<section class="campaign-reviews" id="reviews" aria-label="Google reviews">
      <h2>Trusted by over <b>14,000 Australian businesses</b> just like&nbsp;yours.</h2>
      <div class="cr-grid">${picked.map(card).join("")}
      </div>
      <p class="cr-foot">${GOOGLE}<span class="cr-score">${cfg.profile.rating}</span><span class="cr-stars">${STAR.repeat(5)}</span><span>from ${cfg.profile.count} Google reviews</span></p>
      <style>
        .campaign-reviews{padding:96px 7vw;background:#fff}
        .campaign-reviews .overline{font-family:'DM Mono',monospace;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#2867e8;margin:0 0 14px}
        .campaign-reviews h2{font-size:clamp(28px,3.6vw,46px);line-height:1.1;letter-spacing:-2px;margin:0 0 44px;color:#07142e}
        .campaign-reviews h2 b{color:#2867e8}
        /* minmax(0,...) not 1fr: the reviewer name is nowrap, so its min-content
           width would otherwise push a card wider than the column. */
        .cr-grid{display:grid;grid-template-columns:repeat(${Math.min(show, 3)},minmax(0,1fr));gap:20px;align-items:start}
        .cr-card{background:#f4f5f4;border-radius:16px;padding:26px 24px;min-width:0}
        .cr-head{display:flex;align-items:center;gap:12px;margin-bottom:14px}
        .cr-avatar{flex:none;width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#fff;letter-spacing:-.01em}
        .cr-who{flex:1;min-width:0}
        .cr-name{font-size:14.5px;font-weight:700;color:#07142e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .cr-meta{display:flex;align-items:center;gap:7px;margin-top:3px}
        .cr-stars{display:flex;gap:1.5px}
        .cr-date{font-size:11.5px;color:#8a93a1}
        .cr-text{font-size:14.5px;line-height:1.62;color:#414b59;margin:0}
        .cr-foot{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin:28px 0 0;font-size:14px;color:#69717e}
        .cr-score{font-weight:800;font-size:17px;color:#07142e;letter-spacing:-.5px}
        @media(max-width:860px){
          .campaign-reviews{padding:64px 24px}
          .cr-grid{grid-template-columns:minmax(0,1fr);gap:14px}
        }
      </style>
    </section>`;

let html = fs.readFileSync(PAGE, "utf8");

if (/<section class="campaign-reviews"/.test(html)) {
  html = html.replace(/<section class="campaign-reviews"[\s\S]*?<\/section>/, BLOCK);
} else {
  // Before the FAQ: proof lands after the pitch and before the questions,
  // rather than after the close where fewer people reach it.
  const at = html.search(/<section[^>]*class="[^"]*faq/i);
  if (at === -1) throw new Error("could not find the FAQ section to place the reviews before");
  html = html.slice(0, at) + BLOCK + html.slice(at);
}

fs.writeFileSync(PAGE, html);
console.log(`  reviews block: showing ${picked.length} of ${cfg.reviews.length}`);
picked.forEach((r) => console.log(`    ${pretty(r.date)}  ${r.name}${r.topic && r.topic !== "legacy" ? "  [" + r.topic + "]" : "  [not AI-related]"}`));
