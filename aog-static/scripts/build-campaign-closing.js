#!/usr/bin/env node
/**
 * build-campaign-closing.js — quiz demoted, and a real close on /ai-training/.
 *
 * The quiz was the last thing on the page: a full section with its own
 * headline, a big button and a three-stat row. That is bottom-of-funnel real
 * estate, and a quiz is not a bottom-of-funnel ask. Someone who has read the
 * whole page should be asked to get in touch, not to answer six questions.
 *
 * The quiz is not removed. It becomes a quiet band above the FAQs: a label, a
 * one-line summary and a text link. Its own copy, compressed. The three stats
 * are folded into that sentence rather than shown as figures, which is what
 * made it read as a section in its own right.
 *
 * In its place, a closing section that carries weight: dark, large type, and
 * the page's yellow on the button, the same colour as the hero CTA so the page
 * opens and closes on the same note.
 *
 * The closing copy is adapted from lines already on the site rather than
 * written fresh, but it is new wording on the page and worth a read:
 *   /ai-quiz/            "Talk to one of our AI Training Facilitators and we
 *                         will help you work out your best AI learning path."
 *   hero                 "Get ahead with it."
 *
 * Idempotent: rebuilds both blocks from the original section every run.
 *
 * Usage:  node scripts/build-campaign-closing.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PAGE = path.join(ROOT, "public", "ai-training", "index.html");

const QUIZ = `<section class="quiz-strip" id="quiz" aria-label="AI readiness quiz">
        <div class="qs-inner">
          <div class="qs-text">
            <p class="qs-label">AI readiness quiz</p>
            <p class="qs-line">Six quick questions, about five minutes, and a personalised report comparing you with thousands of others.</p>
          </div>
          <a class="qs-link" href="/ai-quiz/">Take the quiz <span aria-hidden="true">&rarr;</span></a>
        </div>
      </section>`;

const CLOSE = `<section class="campaign-close" id="contact" aria-label="Get in touch">
        <div class="cc-inner">
          <p class="cc-eyebrow">Get started</p>
          <h2 class="cc-head">Ready to get ahead <b>with AI?</b></h2>
          <p class="cc-copy">Talk to one of our Claude Certified Associates and we will help you work out your best AI learning path.</p>
          <a class="cc-btn" href="/ai-enquiry/">GET IN TOUCH <span aria-hidden="true">&rarr;</span></a>
        </div>
      </section>`;

const STYLE = `<style id="closing-style">
        .quiz-strip{background:#f4f6f9;border-top:1px solid #e4e8ee;border-bottom:1px solid #e4e8ee}
        .qs-inner{max-width:1120px;margin:0 auto;padding:30px 24px;display:flex;align-items:center;justify-content:space-between;gap:22px;flex-wrap:wrap}
        .qs-text{min-width:0}
        .qs-label{margin:0 0 5px;font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.15em;text-transform:uppercase;color:#7a8698}
        .qs-line{margin:0;font-size:15px;line-height:1.5;color:#3f4a5a;max-width:62ch}
        .qs-link{flex:none;text-decoration:none;font-size:14.5px;font-weight:700;color:#2867e8;
          border-bottom:1.5px solid rgba(40,103,232,.35);padding-bottom:2px;white-space:nowrap}
        .qs-link:hover{border-bottom-color:#2867e8}
        .qs-link span{display:inline-block;transition:transform .18s ease}
        .qs-link:hover span{transform:translateX(3px)}

        .campaign-close{background:#0b1830}
        .cc-inner{max-width:900px;margin:0 auto;padding:104px 24px 112px;text-align:center}
        .cc-eyebrow{margin:0 0 18px;font-family:'DM Mono',monospace;font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:#7fb2ff}
        .cc-copy{margin:22px auto 38px;max-width:54ch;font-size:17px;line-height:1.6;color:#c3d1e8}
        .cc-btn{display:inline-flex;align-items:center;gap:12px;text-decoration:none;background:#F4EF32;color:#0b1830;
          font-size:17px;font-weight:800;letter-spacing:.01em;padding:20px 40px;border-radius:999px;
          box-shadow:0 20px 44px -18px rgba(244,239,50,.55);transition:transform .2s ease,box-shadow .2s ease}
        .cc-btn:hover{transform:translateY(-2px);box-shadow:0 26px 52px -18px rgba(244,239,50,.7)}
        .cc-btn span{transition:transform .18s ease}
        .cc-btn:hover span{transform:translateX(4px)}

        @media(max-width:640px){
          .qs-inner{padding:24px;gap:14px}
          .cc-inner{padding:76px 24px 84px}
          .cc-copy{font-size:16px;margin-bottom:32px}
          .cc-btn{width:100%;justify-content:center;padding:19px 28px}
        }
        @media(prefers-reduced-motion:reduce){
          .cc-btn,.cc-btn span,.qs-link span{transition:none}
          .cc-btn:hover{transform:none}
        }
      </style>`;

/* The heading needs to beat the page's mobile h2 rule, which caps every h2 at
   about 6vw. Same chain depth as the Why Us banner, one past the file's
   deepest at 61. */
const DEEP = "html" + ":root".repeat(64) + " body main";
const HEAD_CSS = `<style id="closing-head-style">
        ${DEEP} .cc-head{font-size:clamp(36px,5.2vw,64px)!important;line-height:1.04!important;letter-spacing:-2.5px!important;margin:0!important;color:#fff!important;font-weight:800!important;max-width:none!important}
        ${DEEP} .cc-head b{color:#F4EF32!important;font-weight:800!important}
      </style>`;

let html = fs.readFileSync(PAGE, "utf8");

// Undo a previous run so this rebuilds from a known state.
html = html.replace(/<section class="quiz-strip"[\s\S]*?<\/section>/, "");
html = html.replace(/<section class="campaign-close"[\s\S]*?<\/section>/, "");
html = html.replace(/<style id="closing-style">[\s\S]*?<\/style>/, "");
html = html.replace(/<style id="closing-head-style">[\s\S]*?<\/style>/, "");
// The original quiz section, if it is still the one the export shipped.
html = html.replace(/<section class="cta" id="contact">[\s\S]*?<\/section>/, "");

const faqAt = html.search(/<section[^>]*class="faq"/);
if (faqAt === -1) throw new Error("could not find the FAQ section");
html = html.slice(0, faqAt) + QUIZ + html.slice(faqAt);

const faqEnd = html.indexOf("</section>", html.search(/<section[^>]*class="faq"/)) + "</section>".length;
html = html.slice(0, faqEnd) + CLOSE + html.slice(faqEnd);

const headEnd = html.indexOf("</head>");
html = html.slice(0, headEnd) + STYLE + HEAD_CSS + html.slice(headEnd);

fs.writeFileSync(PAGE, html);
console.log("  quiz demoted to a band above the FAQs, closing section added after them");
