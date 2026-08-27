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
 * Idempotent: replaces its own header if it is already there.
 *
 * Usage:  node scripts/build-campaign-header.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PAGE = path.join(ROOT, "public", "ai-training", "index.html");

const HEADER = `<nav data-aog-header data-campaign-header style="position:relative;z-index:50;background:transparent">
      <div style="max-width:1268px;margin:0 auto;padding:30px 24px 0">
        <a href="/" aria-label="Ad On Group" style="display:inline-flex;align-items:center;gap:11px;text-decoration:none">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;flex:none"><img src="/assets/design/adon-logo.png" alt="" width="320" height="320" style="width:100%;height:100%;object-fit:contain;display:block"></span>
          <span style="font-size:19px;font-weight:800;letter-spacing:-0.02em;color:#fff;line-height:1">Ad On Group</span>
        </a>
      </div>
    </nav>`;

let html = fs.readFileSync(PAGE, "utf8");

const at = html.indexOf("<nav data-aog-header");
if (at === -1) throw new Error("no <nav data-aog-header> on the page");
const end = html.indexOf("</nav>", at);
if (end === -1) throw new Error("unterminated <nav> on the page");

const oldNav = html.slice(at, end + "</nav>".length);
const wasPill = oldNav.includes("aog-m-pill");

html = html.slice(0, at) + HEADER + html.slice(end + "</nav>".length);

fs.writeFileSync(PAGE, html);
console.log(`  campaign header: ${wasPill ? "pill replaced with" : "already"} logo only, ${oldNav.length} -> ${HEADER.length} bytes`);
