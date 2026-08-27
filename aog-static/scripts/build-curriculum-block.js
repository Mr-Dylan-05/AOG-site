#!/usr/bin/env node
/**
 * build-curriculum-block.js — "What you'll learn" on /ai-training/.
 *
 * The campaign page explains the format (modules, 1:1s, community) but never
 * says what is actually taught, and never says what someone ends up holding.
 * Both exist on /programs/; neither was on the page the ads point at.
 *
 * COLLAPSED BY DEFAULT, all three. The full curriculum is 24 modules and would
 * bury the page, so each month is a <details> row: month, its one-line promise
 * and a module count, expanding to the eight titles. Closed, the whole
 * curriculum is three rows and about 250px; opening all three adds a further
 * 1,000px on a phone, which is exactly what this avoids. <details> rather than JS so it works before any script runs and
 * stays keyboard and screen-reader operable for free.
 *
 * The scorecard underneath is the same one from /programs/, reframed from
 * "each staff member you enrol" to second person, because this page sells to
 * the person reading it rather than to an employer.
 *
 * PROVENANCE. Module titles, month names, taglines and the deliverables list
 * are lifted verbatim from /programs/. They are hardcoded here rather than
 * scraped: that page's markup is a flattened design export and parsing it
 * would break the moment it is re-exported. If the curriculum changes there,
 * change it here too.
 *
 * The page carries its own palette (#2867e8 blue, #FBB400 gold, DM Mono) and a
 * stylesheet full of !important globals, including an h2 rule that would
 * reformat any heading dropped in. So this block is namespaced and brings its
 * own scoped styles, the same way build-campaign-reviews.js does.
 *
 * Idempotent: replaces the block if it is already there.
 *
 * Usage:  node scripts/build-curriculum-block.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PAGE = path.join(ROOT, "public", "ai-training", "index.html");

const MONTHS = [
  {
    n: "01",
    name: "Foundations",
    tag: "get fluent",
    promise: "Getting genuinely good at AI: accurate, safe, on-the-job use, and your first real working AI workflow.",
    modules: [
      "What AI Is & the Rules of Engagement",
      "Context Engineering",
      "Metaprompting & Hallucination Detection",
      "Persistent Context Infrastructure",
      "Multimodal Capability & Verification",
      "MCP & the Connected Second Brain",
      "Build the AI-Powered Workflow",
      "Evals & the Audit Loop",
    ],
  },
  {
    n: "02",
    name: "Automating Your Tasks",
    tag: "get your time back",
    promise: "Turning repeatable tasks into AI workflows and automations that run on a schedule, even in the background.",
    modules: [
      "Training Your Claude — Intro to Skills",
      "Making Your Own Skills",
      "Inter-tool Cooperation",
      "How Automated Work Actually Works",
      "Why Automations Break & What Makes One Trustworthy",
      "Claude Cowork I — Your First Major Automation",
      "Claude Cowork II — Expand & Build",
      "Scheduled Tasks + Claude in Chrome",
    ],
  },
  {
    n: "03",
    name: "Agentic AI",
    tag: "go autonomous",
    promise: "Designing and deploying AI agents that handle whole jobs on their own, including a manager agent that runs the rest.",
    modules: [
      "Intro to Agentic AI",
      "Agent Design",
      "Agentic Infrastructure",
      "Agentic Building & Deployment",
      "Autonomous Iteration",
      "Hardening & Agent Supervision",
      "Multi-Agent Orchestration",
      "Your Agentic Operating System",
    ],
  },
];

/* Straight from /programs/. Totals 21, which is where the "20+" comes from. */
const WALKAWAY = [
  ["5–6", "reusable prompt packs covering your main tasks"],
  ["1", "AI-powered workflow, end to end"],
  ["3", "multimodal AI-powered tasks"],
  ["3", "custom Claude skills built"],
  ["1", "meta skill built"],
  ["2", "cross-tool AI-powered workflows"],
  ["1", "Claude Cowork automation"],
  ["1", "Claude-in-Chrome automation"],
  ["3", "AI agents"],
  ["1", "agentic AI orchestrator agent"],
];

const esc = (s) =>
  String(s).replace(/&(?![a-zA-Z#0-9]+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const CHEV = `<svg class="cur-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>`;
const TICK = `<span class="cur-tick" aria-hidden="true"></span>`;

const monthRow = (m) => `
        <details class="cur-month">
          <summary>
            <span class="cur-num">${esc(m.n)}</span>
            <span class="cur-sum">
              <span class="cur-name">Month ${esc(String(Number(m.n)))}: ${esc(m.name)}</span>
              <span class="cur-tag">${esc(m.tag)}</span>
            </span>
            <span class="cur-count">${m.modules.length} modules</span>
            ${CHEV}
          </summary>
          <div class="cur-body">
            <p class="cur-promise">${esc(m.promise)}</p>
            <ol class="cur-mods">${m.modules
              .map((t, j) => `
              <li><span class="cur-mn">${String(Number(m.n) * 8 - 8 + j + 1).padStart(2, "0")}</span>${esc(t)}</li>`)
              .join("")}
            </ol>
          </div>
        </details>`;

const BLOCK = `<section class="campaign-curriculum" id="curriculum" aria-label="What you'll learn">
        <p class="overline">Curriculum</p>
        <h2>What you'll <b>learn</b>.</h2>
        <p class="cur-lede">Twenty-four modules over three months, self-paced at about two hours a week. Open a month to see what is in it.</p>

        <div class="cur-list">${MONTHS.map(monthRow).join("")}
        </div>

        <div class="cur-score">
          <div class="cur-score-head">
            <p class="overline">What you'll walk away with</p>
            <h3>You finish with <b>20+ working AI builds</b>, tied to your own job.</h3>
            <p class="cur-score-lede">Not theory you forget by Friday. At a minimum you will have personally built and deployed every one of these, plus a record of the hours you got back.</p>
            <p class="cur-stat"><span>20+</span>deployed AI builds<br>minimum</p>
          </div>
          <ul class="cur-deliverables">${WALKAWAY.map(
            ([n, t]) => `
            <li>${TICK}<span><b>${esc(n)}</b> ${esc(t)}</span></li>`
          ).join("")}
          </ul>
        </div>

        <style>
          .campaign-curriculum{padding:96px 7vw;background:#f7f8fa}
          .campaign-curriculum .overline{font-family:'DM Mono',monospace;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#2867e8;margin:0 0 14px}
          .campaign-curriculum h2{font-size:clamp(28px,3.6vw,46px);line-height:1.1;letter-spacing:-2px;margin:0 0 16px;color:#07142e}
          .campaign-curriculum h2 b{color:#2867e8}
          .cur-lede{font-size:16px;line-height:1.6;color:#414b59;margin:0 0 34px;max-width:60ch}

          .cur-list{display:flex;flex-direction:column;gap:12px}
          .cur-month{background:#fff;border:1px solid #e4e7ec;border-radius:16px;overflow:hidden}
          .cur-month[open]{border-color:rgba(40,103,232,.34)}
          .cur-month>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:16px;padding:20px 22px;min-height:44px}
          .cur-month>summary::-webkit-details-marker{display:none}
          .cur-month>summary:focus-visible{outline:2px solid #2867e8;outline-offset:-2px}
          .cur-num{flex:none;font-family:'DM Mono',monospace;font-size:12px;font-weight:600;color:#2867e8;background:rgba(40,103,232,.09);border-radius:8px;padding:6px 9px}
          .cur-sum{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
          .cur-name{font-size:17px;font-weight:700;color:#07142e;letter-spacing:-.2px}
          .cur-tag{font-family:'DM Mono',monospace;font-size:11.5px;letter-spacing:.13em;text-transform:uppercase;color:#8a93a1}
          .cur-count{flex:none;font-size:13px;color:#69717e;white-space:nowrap}
          .cur-chev{flex:none;color:#2867e8;transition:transform .22s ease}
          .cur-month[open] .cur-chev{transform:rotate(180deg)}
          .cur-body{padding:0 22px 22px}
          .cur-promise{font-size:15px;line-height:1.6;color:#414b59;margin:0 0 16px;max-width:62ch}
          .cur-mods{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px 26px}
          .cur-mods li{display:flex;gap:10px;font-size:14.5px;line-height:1.5;color:#27313f;min-width:0}
          .cur-mn{flex:none;font-family:'DM Mono',monospace;font-size:12px;color:#a2abb7;padding-top:1px}

          .cur-score{margin:46px 0 0;background:#fff;border:1px solid #e4e7ec;border-radius:20px;padding:34px 32px;display:grid;grid-template-columns:1fr 1fr;gap:38px;align-items:start}
          .cur-score-head h3{font-size:clamp(21px,2.3vw,29px);line-height:1.14;letter-spacing:-1px;margin:0 0 14px;color:#07142e;font-weight:800}
          .cur-score-head h3 b{color:#2867e8}
          .cur-score-lede{font-size:15px;line-height:1.6;color:#414b59;margin:0 0 20px}
          .cur-stat{display:inline-flex;align-items:center;gap:11px;background:rgba(40,103,232,.08);border:1px solid rgba(40,103,232,.16);border-radius:12px;padding:11px 15px;margin:0;font-size:13px;line-height:1.3;color:#3a434f;font-weight:600}
          .cur-stat span{font-size:24px;font-weight:800;letter-spacing:-.03em;color:#2867e8}
          .cur-deliverables{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:11px}
          .cur-deliverables li{display:flex;align-items:flex-start;gap:11px;font-size:15px;line-height:1.45;color:#27313f}
          .cur-deliverables b{color:#07142e;font-weight:700}
          .cur-tick{flex:none;width:19px;height:19px;margin-top:1px;border-radius:6px;background:rgba(40,103,232,.10);border:1px solid rgba(40,103,232,.2);position:relative}
          .cur-tick::after{content:"";position:absolute;left:5.5px;top:4px;width:5px;height:8px;border-right:2px solid #2867e8;border-bottom:2px solid #2867e8;transform:rotate(45deg)}

          @media(max-width:860px){
            .campaign-curriculum{padding:64px 24px}
            .cur-mods{grid-template-columns:minmax(0,1fr)}
            .cur-score{grid-template-columns:minmax(0,1fr);gap:26px;padding:26px 22px}
            .cur-count{display:none}
            .cur-month>summary{padding:16px 18px;gap:12px}
            .cur-body{padding:0 18px 18px}
          }
          @media(prefers-reduced-motion:reduce){ .cur-chev{transition:none} }
        </style>
      </section>`;

let html = fs.readFileSync(PAGE, "utf8");

if (/<section class="campaign-curriculum"/.test(html)) {
  html = html.replace(/<section class="campaign-curriculum"[\s\S]*?<\/section>/, BLOCK);
} else {
  // After the "how it works" section and before the proof: someone reads what
  // the program is, then what is in it, then who else has done it.
  const at = html.search(/<section[^>]*class="campaign-reviews"/);
  const fallback = html.search(/<section[^>]*(?:id|class)="[^"]*faq/i);
  const at2 = at !== -1 ? at : fallback;
  if (at2 === -1) throw new Error("could not find the reviews or FAQ section to place the curriculum before");
  html = html.slice(0, at2) + BLOCK + html.slice(at2);
}

fs.writeFileSync(PAGE, html);
console.log(`  curriculum block: ${MONTHS.length} months, ${MONTHS.reduce((n, m) => n + m.modules.length, 0)} modules`);
console.log(`  scorecard: ${WALKAWAY.length} deliverables, ${WALKAWAY.reduce((n, [q]) => n + Number(String(q).split("–")[0]), 0)} builds minimum`);
