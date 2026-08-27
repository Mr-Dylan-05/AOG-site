#!/usr/bin/env node
/**
 * build-campaign-header.js — strip the nav pill from /ai-training/.
 *
 * A campaign landing page has one job, and a full site bar with About,
 * Divisions, a phone number and a Contact button gives paid traffic six ways
 * to leave before it reaches the form. This replaces it with the logo alone,
 * sitting on the hero with no chrome behind it, the way the Neurex reference
 * does it.
 *
 * TWO THINGS THAT ARE NOT COSMETIC
 *
 *   It keeps the data-aog-header attribute. unify-header.js treats any nav
 *   carrying that marker as already canonical and leaves it alone; without it
 *   the next run of that script would put the full pill straight back.
 *
 *   It is no longer sticky. The wordmark is white because the hero is almost
 *   black at the top (rgb(1,6,15)), but the sections below it are white. A
 *   sticky white logo would disappear the moment you scrolled past the hero.
 *   Static means it scrolls away with the hero, which is what the reference
 *   does and what a landing page wants anyway.
 *
 * The mark keeps its Ad On Group cyan, which reads cleanly on the dark hero;
 * only the wordmark needs to turn white. adon-logo-footer.png is the white
 * lockup if a fully white mark is ever wanted, but it is a stacked lockup and
 * sets the wordmark too small at header size.
 *
 * The 1268px max-width with 24px padding is not arbitrary: it puts the logo at
 * 110px on a 1440 screen and 24px on a phone, which is exactly where the hero
 * headline and its eyebrow sit.
 *
 * The nav is not deleted, it is folded behind a button on the right of the
 * bar, the way the Neurex reference does it. Someone who wants the rest of
 * the site can still reach it; it just is not competing with the form. The
 * links come from the canonical nav so they stay in step with the site.
 *
 * The button is a real <button> with aria-expanded and aria-controls, so it
 * works from the keyboard for free. Escape closes it and returns focus, and a
 * click anywhere outside closes it.
 *
 * It also drops the hero\'s "AD ON GROUP" eyebrow. That line sat under a logo
 * inside a pill and read as a label; with the pill gone the wordmark sits
 * directly above it and the page said "Ad On Group" twice in the first 60px.
 * The eyebrow is removed rather than reworded, because nothing else needs
 * saying between the logo and the headline. It lives in this script because
 * it is a consequence of the header change, not a separate edit.
 *
 * Idempotent: replaces its own header if it is already there.
 *
 * Usage:  node scripts/build-campaign-header.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PAGE = path.join(ROOT, "public", "ai-training", "index.html");

/* The usual Ad On Group bar, behind a button. Taken from the canonical nav so
   the destinations stay in step with the rest of the site. */
const MENU = [
  ["About", [
    ["History", "/history/"],
    ["Purpose", "/purpose/"],
    ["People", "/people/"],
    ["Culture", "/culture/"],
    ["Offices", "/offices/"],
  ]],
  ["Divisions", [
    ["Ad On AI", "/ad-on-ai-division/"],
    ["Ad On Workforce", "/ad-on-workforce-division/"],
    ["Ad On Hold", "/ad-on-hold/"],
    ["Ad On Digital", "/ad-on-digital/"],
    ["Ad On SA", "/ad-on-sa/"],
  ]],
];

const group = ([label, links]) => `
            <div class="ch-group">
              <p class="ch-label">${label}</p>
              ${links.map(([t, h]) => `<a href="${h}">${t}</a>`).join("\n              ")}
            </div>`;

const HEADER = `<nav data-aog-header data-campaign-header style="position:relative;z-index:60;background:transparent">
      <div class="ch-bar">
        <a class="ch-logo" href="/" aria-label="Ad On Group">
          <span class="ch-mark"><img src="/assets/design/adon-logo.png" alt="" width="320" height="320"></span>
          <span class="ch-word">Ad On Group</span>
        </a>
        <button class="ch-toggle" type="button" aria-expanded="false" aria-controls="campaign-menu" aria-label="Open menu">
          <span class="ch-bars" aria-hidden="true"><i></i><i></i><i></i></span>
        </button>
        <div class="ch-panel" id="campaign-menu" hidden>
          ${MENU.map(group).join("")}
          <div class="ch-actions">
            <a class="ch-tel" href="tel:+61755861400">(07) 5586 1400</a>
            <a class="ch-contact" href="/contact-us/">Contact</a>
          </div>
        </div>
      </div>
      <style>
        .ch-bar{max-width:1268px;margin:0 auto;padding:30px 24px 0;display:flex;align-items:center;justify-content:space-between;position:relative}
        .ch-logo{display:inline-flex;align-items:center;gap:11px;text-decoration:none}
        .ch-mark{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;flex:none}
        .ch-mark img{width:100%;height:100%;object-fit:contain;display:block}
        .ch-word{font-size:19px;font-weight:800;letter-spacing:-.02em;color:#fff;line-height:1}

        .ch-toggle{width:46px;height:46px;flex:none;display:inline-flex;align-items:center;justify-content:center;
          background:transparent;border:1px solid rgba(255,255,255,.30);border-radius:13px;cursor:pointer;padding:0;
          transition:background .18s ease,border-color .18s ease}
        .ch-toggle:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.5)}
        .ch-toggle:focus-visible{outline:2px solid #FBB400;outline-offset:3px}
        .ch-bars{display:flex;flex-direction:column;justify-content:center;gap:4px;width:19px;height:13px}
        .ch-bars i{display:block;height:1.8px;background:#fff;border-radius:2px;transition:transform .22s ease,opacity .18s ease}
        .ch-toggle[aria-expanded="true"] .ch-bars i:nth-child(1){transform:translateY(5.8px) rotate(45deg)}
        .ch-toggle[aria-expanded="true"] .ch-bars i:nth-child(2){opacity:0}
        .ch-toggle[aria-expanded="true"] .ch-bars i:nth-child(3){transform:translateY(-5.8px) rotate(-45deg)}

        .ch-panel{position:absolute;top:calc(100% + 12px);right:24px;z-index:70;min-width:270px;
          background:rgba(9,20,40,.97);backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%);
          border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:20px 22px;
          box-shadow:0 28px 60px -22px rgba(0,0,0,.75);display:flex;flex-direction:column;gap:18px}
        .ch-panel[hidden]{display:none}
        .ch-group{display:flex;flex-direction:column;gap:9px}
        .ch-label{margin:0 0 2px;font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.15em;text-transform:uppercase;color:#7fb2ff}
        .ch-group a{text-decoration:none;color:#e7eefb;font-size:15.5px;font-weight:600;line-height:1.25}
        .ch-group a:hover{color:#fff;text-decoration:underline;text-underline-offset:3px}
        .ch-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding-top:16px;border-top:1px solid rgba(255,255,255,.12)}
        .ch-tel{text-decoration:none;color:#9fb0c9;font-size:14.5px;font-weight:600;white-space:nowrap}
        .ch-tel:hover{color:#fff}
        .ch-contact{text-decoration:none;background:#FBB400;color:#0b1830;font-weight:800;font-size:14.5px;
          padding:10px 18px;border-radius:999px;white-space:nowrap}
        .ch-contact:hover{filter:brightness(1.06)}

        @media(max-width:520px){
          .ch-panel{right:24px;left:24px;min-width:0}
        }
        @media(prefers-reduced-motion:reduce){
          .ch-toggle,.ch-bars i{transition:none}
        }
      </style>
    </nav>`;

const MENU_JS = `<script id="campaign-header-js">
      (function(){
        var btn = document.querySelector('.ch-toggle');
        var panel = document.getElementById('campaign-menu');
        if(!btn || !panel) return;

        function setOpen(open){
          panel.hidden = !open;
          btn.setAttribute('aria-expanded', open ? 'true' : 'false');
          btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        }

        btn.addEventListener('click', function(e){
          e.stopPropagation();
          setOpen(panel.hidden);
        });

        // Anywhere outside closes it. The panel stops its own clicks so a
        // stray click inside does not shut it before a link is followed.
        panel.addEventListener('click', function(e){ e.stopPropagation(); });
        document.addEventListener('click', function(){ if(!panel.hidden) setOpen(false); });

        document.addEventListener('keydown', function(e){
          if(e.key === 'Escape' && !panel.hidden){ setOpen(false); btn.focus(); }
        });
      })();
      </script>`;

const EYEBROW = '<p class="overline">AD ON GROUP</p>';

let html = fs.readFileSync(PAGE, "utf8");

const heroAt = html.indexOf('class="hero"');
let eyebrowDropped = false;
if (heroAt !== -1) {
  const hero = html.slice(heroAt, heroAt + 800);
  if (hero.includes(EYEBROW)) {
    html = html.slice(0, heroAt) + hero.replace(EYEBROW, "") + html.slice(heroAt + 800);
    eyebrowDropped = true;
  }
}

const at = html.indexOf("<nav data-aog-header");
if (at === -1) throw new Error("no <nav data-aog-header> on the page");
const end = html.indexOf("</nav>", at);
if (end === -1) throw new Error("unterminated <nav> on the page");

const oldNav = html.slice(at, end + "</nav>".length);
const wasPill = oldNav.includes("aog-m-pill");

html = html.slice(0, at) + HEADER + html.slice(end + "</nav>".length);

// the toggle script, replaced rather than stacked on a re-run
html = html.replace(/<script id="campaign-header-js">[\s\S]*?<\/script>/, "");
const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd === -1) throw new Error("no </body> on the page");
html = html.slice(0, bodyEnd) + MENU_JS + html.slice(bodyEnd);

fs.writeFileSync(PAGE, html);
console.log(`  campaign header: ${wasPill ? "pill replaced with" : "already"} logo only, ${oldNav.length} -> ${HEADER.length} bytes`);
console.log(eyebrowDropped ? "  hero eyebrow removed (duplicated the wordmark above it)" : "  hero eyebrow already gone");
console.log(`  menu: ${MENU.reduce((n, g) => n + g[1].length, 0)} links in ${MENU.length} groups, plus phone and Contact`);
