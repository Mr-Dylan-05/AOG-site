#!/usr/bin/env node
/**
 * fix-division-ctas.js — give the division pages a call to action that works.
 *
 * Every division page carries the same two "Explore the full site" buttons: the
 * primary one in the hero, and the one in the "Get started" card near the
 * bottom. On Ad On Workforce and Ad On AI they go somewhere — those divisions
 * have a section of their own behind them. On Ad On Digital, Ad On SA and
 * Ad On Hold they point at "/", so the hero's PRIMARY button dumps you back on
 * the home page you came from.
 *
 * It is not a mistyped href. Those three divisions have exactly one page each —
 * the one you are already reading. There is no "full site" to explore, so the
 * button was copied from the two divisions that have one onto three that do
 * not, and "/" is the only place left to send it. Repointing it would just move
 * the dead end, so:
 *
 *   HERO   The dead primary button is removed and the "Get in touch" beside it
 *          takes over the primary styling. The hero keeps one button, and that
 *          button works.
 *
 *   CARD   The "Get started" card's only button is repointed at /contact-us/
 *          and relabelled with the action the card's own sentence already
 *          promises — "book a chat", "book a discovery call", "get a quote".
 *          No new wording is invented; the label is lifted from the copy.
 *
 *   COPY   That sentence opens "Explore the full Ad On Group site to ...",
 *          which promises a site that does not exist. The clause is deleted
 *          and the next word capitalised. Nothing else in the sentence moves.
 *
 * Ad On Workforce and Ad On AI are deliberately untouched: their buttons
 * resolve, and their copy names a real destination.
 *
 * Idempotent, and safe to re-run after a re-export.
 *
 * Usage:  node scripts/fix-division-ctas.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const DRY = process.argv.includes("--dry");

const CONTACT = "/contact-us/";

/** The three divisions with nothing behind them, and the verb each one uses. */
const PAGES = {
  "ad-on-digital": {
    label: "Book a chat",
    from: "Explore the full Ad On Group site to see our digital marketing services in detail and book a&nbsp;chat.",
    to: "See our digital marketing services in detail and book a&nbsp;chat.",
  },
  "ad-on-sa": {
    label: "Book a discovery call",
    from: "Explore the full Ad On Group site to see how Ad On SA works and book a discovery&nbsp;call.",
    to: "See how Ad On SA works and book a discovery&nbsp;call.",
  },
  "ad-on-hold": {
    label: "Get a quote",
    from: "Explore the full Ad On Group site to see Ad On Hold in detail and get a&nbsp;quote.",
    to: "See Ad On Hold in detail and get a&nbsp;quote.",
  },
};

/** The hero's primary look, moved onto whichever button survives. */
const PRIMARY =
  "text-decoration:none;font-size:16px;font-weight:700;color:#fff;background:#1BABE5;" +
  "padding:15px 28px;border-radius:14px;display:inline-flex;align-items:center;gap:9px;" +
  "box-shadow:0 14px 26px -10px rgba(27,171,229,0.6);transition:transform .22s ease, box-shadow .22s ease";

/**
 * The <a> carrying a given data-dc id.
 *
 * Located by regex rather than indexOf on the attribute: flatten-dc.js bakes
 * the hover states into a <style> block as [data-dc="hc"]:hover rules, so the
 * first occurrence of the attribute in the file is CSS, not the button.
 */
function findAnchor(s, dc) {
  const m = new RegExp(`<a\\s[^>]*data-dc="${dc}"[^>]*>[\\s\\S]*?<\\/a>`).exec(s);
  return m ? { start: m.index, end: m.index + m[0].length, html: m[0] } : null;
}

/** The <a ...> that contains the given index. */
function anchorAround(s, idx) {
  const open = s.lastIndexOf("<a ", idx);
  if (open < 0) return null;
  const end = s.indexOf("</a>", open);
  return end < 0 ? null : { start: open, end: end + 4, html: s.slice(open, end + 4) };
}

let changed = 0;
const log = [];

for (const [slug, cfg] of Object.entries(PAGES)) {
  const file = path.join(PUBLIC, slug, "index.html");
  if (!fs.existsSync(file)) { log.push(`  ${slug}: page not found, skipped`); continue; }

  let s = fs.readFileSync(file, "utf8");
  const before = s;
  const did = [];

  // --- hero: drop the dead primary, promote "Get in touch" -----------------
  {
    const hero = findAnchor(s, "hc");
    if (hero && /Explore the full site/.test(hero.html) && /href="\/"/.test(hero.html)) {
      s = s.slice(0, hero.start) + s.slice(hero.end);
      did.push("removed dead hero button");

      // the surviving sibling becomes the primary
      const gi = s.indexOf(">Get in touch<");
      if (gi >= 0) {
        const btn = anchorAround(s, gi);
        if (btn) {
          const promoted = btn.html.replace(/style="[^"]*"/, `style="${PRIMARY}"`);
          s = s.slice(0, btn.start) + promoted + s.slice(btn.end);
          did.push("promoted “Get in touch” to primary");
        }
      }
    }
  }

  // --- card: repoint and relabel ------------------------------------------
  {
    const card = findAnchor(s, "hd");
    if (card && /Explore the full site/.test(card.html) && /href="\/"/.test(card.html)) {
      const fixed = card.html
        .replace('href="/"', `href="${CONTACT}"`)
        .replace("Explore the full site", cfg.label);
      s = s.slice(0, card.start) + fixed + s.slice(card.end);
      did.push(`card button → ${CONTACT} "${cfg.label}"`);
    }
  }

  // --- copy: drop the promise of a site that does not exist ----------------
  if (s.includes(cfg.from)) {
    s = s.replace(cfg.from, cfg.to);
    did.push("removed the “explore the full site” clause");
  }

  if (s !== before) {
    changed++;
    if (!DRY) fs.writeFileSync(file, s);
  }
  log.push(`  /${slug}/` + (did.length ? "\n     " + did.join("\n     ") : "  (already done)"));
}

console.log(`${DRY ? "[dry] " : ""}division CTAs — ${changed} page(s) changed`);
log.forEach((l) => console.log(l));
