#!/usr/bin/env node
/**
 * build-campaign-reviews.js — the Google reviews blocks on the AI pages.
 *
 * Two blocks, from one set of reviews in incoming/design/campaign-reviews.json:
 *
 *   /ai-training/  the paid landing page. Shows the most RECENT reviews, since
 *                  the older ones are about websites, digital marketing and
 *                  on-hold messaging, and this page sells AI training.
 *   /programs/     the flagship AI training page. Shows only the reviews
 *                  actually ABOUT the AI training (topic !== "legacy").
 *
 * Why /programs/ matters more than it looks: /ai-training/ is noindex, so
 * before this every review a crawler could read was about websites and on-hold
 * messaging. The site's own review corpus was evidence that this is a marketing
 * agency. Reviews only count as a signal on a page that can be indexed, and
 * the Review schema in inject-schema.js keys off the review text appearing in
 * the page, so putting them here is all that is needed — no schema edit.
 *
 * Each block carries its own scoped CSS and follows the palette of the page it
 * sits on: the campaign page has its own design, the rest of the site does not.
 *
 * Idempotent: replaces a block if it is already there.
 *
 * Usage:  node scripts/build-campaign-reviews.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "incoming", "design", "campaign-reviews.json");

const cfg = JSON.parse(fs.readFileSync(DATA, "utf8"));

const byDate = (rs) => [...rs].sort((a, b) => String(b.date).localeCompare(String(a.date)));
const isAboutAi = (r) => r.topic && r.topic !== "legacy";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const pretty = (d) => {
  const [y, m] = String(d).split("-");
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : d;
};
const esc = (s) => String(s).replace(/&(?![a-zA-Z#0-9]+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Google's own review-star yellow. Deliberately #FBBC04 and not #FBB400 (the
 * design file's UI amber) or #FBBC05 (the Google logo's yellow): both of those
 * are swept to other colours by align-campaign-brand.js, so giving the stars a
 * value nothing else owns is what stops them being recoloured by accident.
 */
const STAR = `<svg width="13" height="13" viewBox="0 0 24 24" style="display:block"><path fill="#FBBC04" d="M12 2l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.3 6.1 20l1.3-6.6L2.5 8.9l6.6-.8z"></path></svg>`;
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

const block = (t, picked) => `<section class="${t.cls}" id="reviews" aria-label="Google reviews">
      <h2>${t.heading}</h2>
      <div class="cr-grid">${picked.map(card).join("")}
      </div>
      <p class="cr-foot">${GOOGLE}<span class="cr-score">${cfg.profile.rating}</span><span class="cr-stars">${STAR.repeat(5)}</span><span>from ${cfg.profile.count} Google reviews</span></p>
      <style>
        .${t.cls}{padding:${t.pad};background:${t.bg}}
        .${t.cls} .overline{font-family:${t.mono};font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${t.accent};margin:0 0 14px}
        .${t.cls} h2{font-size:${t.h2size};line-height:1.1;letter-spacing:${t.h2track};${t.h2weight}margin:0 0 44px;color:${t.ink}}
        .${t.cls} h2 b{color:${t.accent}}
        /* minmax(0,...) not 1fr: the reviewer name is nowrap, so its min-content
           width would otherwise push a card wider than the column. */
        /* Six columns with each card spanning two, rather than three columns
           of one. Same three-across row, but it gives the last row somewhere
           to sit: with five cards the trailing pair would otherwise stack
           left and leave a hole on the right. Card four starts a column in,
           which centres the two of them under the three above. The rule is
           keyed on "fourth, and second from last", so it stops applying by
           itself if the count changes. */
        .cr-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:20px;align-items:start}
        .cr-grid>.cr-card{grid-column:span 2}
        .cr-grid>.cr-card:nth-child(4):nth-last-child(2){grid-column:2/span 2}
        .cr-card{background:${t.cardBg};border-radius:16px;padding:26px 24px;min-width:0}
        .cr-head{display:flex;align-items:center;gap:12px;margin-bottom:14px}
        .cr-avatar{flex:none;width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#fff;letter-spacing:-.01em}
        .cr-who{flex:1;min-width:0}
        .cr-name{font-size:14.5px;font-weight:700;color:${t.ink};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .cr-meta{display:flex;align-items:center;gap:7px;margin-top:3px}
        .cr-stars{display:flex;gap:1.5px}
        .cr-date{font-size:11.5px;color:#8a93a1}
        .cr-text{font-size:14.5px;line-height:1.62;color:#414b59;margin:0}
        .cr-foot{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin:28px 0 0;font-size:14px;color:#69717e}
        .cr-score{font-weight:800;font-size:17px;color:${t.ink};letter-spacing:-.5px}
        @media(max-width:860px){
          .${t.cls}{padding:${t.padSmall}}
          .cr-grid{grid-template-columns:minmax(0,1fr);gap:14px}
          .cr-grid>.cr-card,.cr-grid>.cr-card:nth-child(4):nth-last-child(2){grid-column:1/-1}
        }
      </style>
    </section>`;

const TARGETS = [
  {
    // The paid landing page. Palette, type and copy are its own, not the site's.
    page: path.join(ROOT, "public", "ai-training", "index.html"),
    cls: "campaign-reviews",
    campaign: true,
    pick: (rs) => byDate(rs).slice(0, cfg.show || 3),
    heading: `Trusted by over <b>14,000 Australian businesses</b> just like&nbsp;yours.`,
    accent: "#2867e8", ink: "#07142e", cardBg: "#f4f5f4", bg: "#fff",
    mono: "'DM Mono',monospace",
    pad: "96px 7vw", padSmall: "64px 24px",
    h2size: "clamp(28px,3.6vw,46px)", h2track: "-2px", h2weight: "",
    // Proof lands after the pitch and before the questions, rather than after
    // the close where fewer people reach it.
    before: /<section[^>]*class="[^"]*faq/i,
  },
  {
    // The flagship AI training page, and the indexable one. Only the reviews
    // that are actually about the training — a review praising an on-hold
    // script is not evidence on this page, and it is the wrong signal to feed
    // an answer engine trying to work out what this company trains people in.
    page: path.join(ROOT, "public", "programs", "index.html"),
    cls: "aog-reviews",
    pick: (rs) => byDate(rs.filter(isAboutAi)),
    heading: `What people say after the&nbsp;program.`,
    accent: "#1BABE5", ink: "#0B1220", cardBg: "#F1F4F8", bg: "transparent",
    mono: "'JetBrains Mono',monospace",
    pad: "28px 28px 72px", padSmall: "24px 24px 56px",
    h2size: "clamp(24px,3vw,38px)", h2track: "-0.03em", h2weight: "font-weight:800;",
    before: /<section[^>]*id="faqs"/i,
  },
];

/**
 * The paid campaign landing page is out of scope by standing instruction: it is
 * tuned for ad conversion and is not to be changed for search work. Its block is
 * left exactly as it is unless you ask for it explicitly with --include-campaign.
 */
const INCLUDE_CAMPAIGN = process.argv.includes("--include-campaign");

for (const t of TARGETS) {
  if (t.campaign && !INCLUDE_CAMPAIGN) {
    console.log("  /ai-training/  left alone (paid landing page; pass --include-campaign to rebuild it)");
    continue;
  }
  if (!fs.existsSync(t.page)) { console.log(`  skipped (missing): ${t.page}`); continue; }

  const picked = t.pick(cfg.reviews);
  if (!picked.length) { console.log(`  skipped (no reviews matched): ${t.cls}`); continue; }

  const BLOCK = block(t, picked);
  let html = fs.readFileSync(t.page, "utf8");
  const re = new RegExp(`<section class="${t.cls}"[\\s\\S]*?<\\/section>`);

  if (re.test(html)) {
    html = html.replace(re, BLOCK);
  } else {
    const at = html.search(t.before);
    if (at === -1) throw new Error(`could not find the anchor to place the reviews before on ${t.page}`);
    html = html.slice(0, at) + BLOCK + html.slice(at);
  }

  fs.writeFileSync(t.page, html);
  const where = t.page.replace(ROOT + "/public", "").replace("/index.html", "/");
  console.log(`  ${where}  ${picked.length} of ${cfg.reviews.length} reviews`);
  picked.forEach((r) => console.log(`      ${pretty(r.date)}  ${r.name}  [${r.topic || "not AI-related"}]`));
}

// ---------------------------------------------------------------------------
// The homepage rating badge showed the stars and the review count but never the
// score itself. The schema asserts 4.8, and a marked-up rating is supposed to be
// one the visitor can see, so print it.
{
  const home = path.join(ROOT, "public", "index.html");
  const was = `<div style="font-size:12px;color:#6B7480">Based on ${cfg.profile.count} reviews</div>`;
  const now = `<div style="font-size:12px;color:#6B7480"><b style="color:#0B1220;font-weight:800">${cfg.profile.rating}</b> from ${cfg.profile.count} Google reviews</div>`;
  const html = fs.readFileSync(home, "utf8");
  if (html.includes(was)) {
    fs.writeFileSync(home, html.replace(was, now));
    console.log(`  /  rating badge now shows ${cfg.profile.rating}`);
  } else if (html.includes(now)) {
    console.log("  /  rating badge already showing the score");
  } else {
    console.log("  ⚠  /  rating badge not found — check the homepage markup hasn't changed");
  }
}
