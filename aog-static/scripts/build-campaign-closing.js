#!/usr/bin/env node
/**
 * build-campaign-closing.js — quiz demoted, and a real close on /ai-training/.
 *
 * The quiz was the last thing on the page: a full section with its own
 * headline, a big button and a three-stat row. That is bottom-of-funnel real
 * estate, and a quiz is not a bottom-of-funnel ask. Someone who has read the
 * whole page should be asked to get in touch, not to answer six questions.
 *
 * The quiz is not removed. It becomes a band above the FAQs: a label, a
 * one-line summary and a button. Its own copy, compressed. The three stats are
 * folded into that sentence rather than shown as figures, which is what made
 * it read as a section in its own right.
 *
 * It was a grey band with a text link at first, which read as too quiet. It is
 * now a blue-tinted card with a rule down its edge and a solid button, and the
 * button names the time cost, which is the quiz\'s best argument. Still a band
 * inside a white section, so it stays clearly under the closing CTA.
 *
 * In its place, a closing section that carries weight: dark, large type, and
 * the page's yellow on the button, the same colour as the hero CTA so the page
 * opens and closes on the same note.
 *
 * The closing copy is adapted from lines already on the site rather than
 * written fresh:
 *   /ai-quiz/   "Talk to one of our AI Training Facilitators and we will help
 *                you work out your best AI learning path." The opening half is
 *                kept; the tail was changed on request to "how to get ahead
 *                with AI", which ties it back to the headline above it and the
 *                hero at the top instead of naming a learning path.
 *   hero        "Get ahead with it."
 *
 * Idempotent: rebuilds both blocks from the original section every run.
 *
 * Usage:  node scripts/build-campaign-closing.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PAGE = path.join(ROOT, "public", "ai-training", "index.html");

const QUIZ = `<section class="cta cta--compact" id="quiz">
        <p class="overline">Take your AI readiness quiz</p>
        <h2>Ready to see where you sit <b>with AI?</b></h2>
        <p class="cta-copy">Answer six quick questions and receive your own personalised report, compared with 1,000s of others on their AI journey.</p>
        <a class="quiz-button" href="/ai-quiz/">Take the quiz &rarr;</a>
        <div class="cta-stats">
          <div><strong>6</strong><span>quick questions</span></div>
          <div><strong>1 minute</strong><span>to complete</span></div>
          <div><strong>Your report</strong><span>personalised to you</span></div>
        </div>
      </section>`;

const CLOSE = `<section class="campaign-close" id="enquire" aria-label="Get in touch">
        <div class="cc-inner">
          <p class="cc-eyebrow">Get started</p>
          <h2 class="cc-head">Ready to get ahead <b>with AI?</b></h2>
          <p class="cc-copy">Talk to one of our Claude Certified Associates and we will help you work out how to get ahead with AI.</p>
                    <div class="cc-form">
            <form data-contact-form data-form="enquiry" data-success-panel="#enquire-thanks" onsubmit="return false" style="display:flex;flex-direction:column;gap:10px">
            <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">
            <input type="hidden" name="source" value="/ai-training/">
            <input type="hidden" name="utm_source" data-utm="utm_source">
            <input type="hidden" name="utm_medium" data-utm="utm_medium">
            <input type="hidden" name="utm_campaign" data-utm="utm_campaign">
            <input type="hidden" name="utm_content" data-utm="utm_content">
            <label style="display:flex;flex-direction:column;gap:5px"><span style="font-size:14px;font-weight:700;letter-spacing:-0.01em;color:#0B1220">Your name</span><input type="text" name="name" required autocomplete="name" autocapitalize="words" style="font:inherit;font-size:16px;padding:15px 16px;min-height:52px;border-radius:12px;border:1.5px solid rgba(11,18,32,0.16);background:#fff;color:#0B1220;outline:none;width:100%;box-sizing:border-box"><span data-error style="font-size:13px;color:#C2410C"></span></label>
            <label style="display:flex;flex-direction:column;gap:5px"><span style="font-size:14px;font-weight:700;letter-spacing:-0.01em;color:#0B1220">Email</span><input type="email" name="email" required autocomplete="email" inputmode="email" spellcheck="false" style="font:inherit;font-size:16px;padding:15px 16px;min-height:52px;border-radius:12px;border:1.5px solid rgba(11,18,32,0.16);background:#fff;color:#0B1220;outline:none;width:100%;box-sizing:border-box"><span data-error style="font-size:13px;color:#C2410C"></span></label>
            <label style="display:flex;flex-direction:column;gap:5px"><span style="font-size:14px;font-weight:700;letter-spacing:-0.01em;color:#0B1220">Phone</span><input type="tel" name="phone" required autocomplete="tel" inputmode="tel" style="font:inherit;font-size:16px;padding:15px 16px;min-height:52px;border-radius:12px;border:1.5px solid rgba(11,18,32,0.16);background:#fff;color:#0B1220;outline:none;width:100%;box-sizing:border-box"><span data-error style="font-size:13px;color:#C2410C"></span></label>
            <label style="display:flex;flex-direction:column;gap:5px"><span style="font-size:14px;font-weight:700;letter-spacing:-0.01em;color:#0B1220">What would you like to use AI for? (optional)</span><textarea name="ai_goal" rows="4" placeholder="For example: cut down admin time, get quotes out faster, or help the team write better." style="font:inherit;font-size:16px;line-height:1.5;padding:14px 15px;border-radius:12px;border:1.5px solid rgba(11,18,32,0.16);background:#fff;color:#0B1220;outline:none;width:100%;box-sizing:border-box;resize:vertical"></textarea><span data-error style="font-size:13px;color:#C2410C"></span></label>
            <button type="submit" style="font:inherit;font-size:17px;font-weight:700;color:#fff;background:#1BABE5;border:none;padding:16px 26px;min-height:54px;border-radius:14px;cursor:pointer;width:100%;box-shadow:0 14px 26px -12px rgba(27,171,229,0.65)">Send my enquiry &rarr;</button>
            <p data-form-status class="form-status" role="status" aria-live="polite" style="font-size:14px;margin:0"></p>
            <p style="font-size:12.5px;line-height:1.5;color:#8A93A1;margin:2px 0 0">No obligation. We never share your details.</p>
            </form>
            <div id="enquire-thanks" hidden style="text-align:center;padding:10px 4px"><span style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:rgba(27,171,229,0.12)"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1BABE5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg></span><div style="font-size:21px;font-weight:800;letter-spacing:-0.025em;color:#0B1220;margin:15px 0 0">Thanks, we have got that.</div><p style="font-size:15.5px;line-height:1.6;color:#5A6473;margin:10px 0 0">One of our team will be in touch shortly. If you would rather talk now, call <a href="tel:+61755861400" style="color:#1483B5;font-weight:700;text-decoration:none">(07) 5586 1400</a>.</p></div>
          </div>
        </div>
      </section>`;

const DEEP = "html" + ":root".repeat(64) + " body main";

const STYLE = `<style id="closing-style">
        /* The quiz section as the export shipped it, scaled down. Everything is
           the original markup and the original styles; only the size changes,
           so it still reads as the same section rather than a different thing.
           The overrides sit on a 64-deep :root chain because the rules they
           reduce are themselves declared 7 to 10 deep. */
        ${DEEP} .cta--compact{padding:66px 8vw 52px!important}
        ${DEEP} .cta--compact h2{font-size:clamp(26px,3.1vw,40px)!important;letter-spacing:-1.6px!important;max-width:640px!important}
        ${DEEP} .cta--compact .overline{margin-bottom:13px!important}
        ${DEEP} .cta--compact .cta-copy{font-size:15.5px!important;max-width:540px!important;margin-top:14px!important}
        ${DEEP} .cta--compact .quiz-button{font-size:14.5px!important;padding:13px 26px!important;margin-top:24px!important}
        ${DEEP} .cta--compact .cta-stats{gap:20px!important;margin-top:38px!important;max-width:620px!important}
        ${DEEP} .cta--compact .cta-stats strong{font-size:26px!important;letter-spacing:-1.2px!important}
        ${DEEP} .cta--compact .cta-stats span{font-size:13px!important}

        .campaign-close{background:#0b1830}
        .cc-inner{max-width:900px;margin:0 auto;padding:104px 24px 112px;text-align:center}
        .cc-eyebrow{margin:0 0 18px;font-family:'DM Mono',monospace;font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:#7fb2ff}
        .cc-copy{margin:22px auto 38px;max-width:54ch;font-size:17px;line-height:1.6;color:#c3d1e8}
        /* The enquiry form sits on the dark section, so it is given a white
           card rather than restyled: every field keeps the styling it has on
           /ai-enquiry/, and the labels stay dark on white instead of
           disappearing into the navy. */
        .campaign-close{scroll-margin-top:24px}
        .cc-form{max-width:460px;margin:26px auto 0;padding:22px 22px 20px;background:#fff;
          border-radius:16px;text-align:left;box-shadow:0 18px 40px -24px rgba(0,0,0,.4)}
        .cc-form .form-status--ok{color:#166534}
        .cc-form .form-status--error{color:#C2410C}
        /* An empty error slot is still a flex child, so it was adding a gap
           under every field whether or not anything was wrong. Hidden until it
           has something to say — which is most of the airiness, removed without
           touching a single tap target. */
        .cc-form [data-error]:empty{display:none}

        @media(max-width:640px){
          ${DEEP} .cta--compact{padding:50px 24px 40px!important}
          ${DEEP} .cta--compact .cta-stats{gap:18px!important;margin-top:30px!important}
          .cc-inner{padding:76px 24px 84px}
          .cc-copy{font-size:16px;margin-bottom:32px}
          .cc-form{margin-top:22px;padding:18px 16px 16px}
        }
      </style>`;

/* The heading needs to beat the page's mobile h2 rule, which caps every h2 at
   about 6vw. Same chain depth as the Why Us banner, one past the file's
   deepest at 61. */
const HEAD_CSS = `<style id="closing-head-style">
        ${DEEP} .cc-head{font-size:clamp(36px,5.2vw,64px)!important;line-height:1.04!important;letter-spacing:-2.5px!important;margin:0!important;color:#fff!important;font-weight:800!important;max-width:none!important}
        ${DEEP} .cc-head b{color:#F4EF32!important;font-weight:800!important}
      </style>`;

let html = fs.readFileSync(PAGE, "utf8");

// Undo a previous run so this rebuilds from a known state.
html = html.replace(/<section class="cta cta--compact"[\s\S]*?<\/section>/, "");
// An earlier version of this script rendered the quiz as a .quiz-strip band.
// Still removed here so a page built by that version is cleaned up rather
// than ending up with both.
html = html.replace(/<section class="quiz-strip"[\s\S]*?<\/section>/, "");
html = html.replace(/<section class="campaign-close"[\s\S]*?<\/section>/, "");
html = html.replace(/<style id="closing-style">[\s\S]*?<\/style>/, "");
html = html.replace(/<style id="closing-head-style">[\s\S]*?<\/style>/, "");
// The original quiz section, if it is still the one the export shipped.
html = html.replace(/<section class="cta" id="contact">[\s\S]*?<\/section>/, "");

// The quiz sits above the FAQs, where it was, and the closing section with the
// enquiry form goes after them. The form is still the last thing on the page,
// so it remains the final ask; the quiz is simply back where it reads as a
// softer offer partway down rather than an afterthought below the form.
const faqAt = html.search(/<section[^>]*class="faq"/);
if (faqAt === -1) throw new Error("could not find the FAQ section");
html = html.slice(0, faqAt) + QUIZ + html.slice(faqAt);

const faqEnd = html.indexOf("</section>", html.search(/<section[^>]*class="faq"/)) + "</section>".length;
html = html.slice(0, faqEnd) + CLOSE + html.slice(faqEnd);

const headEnd = html.indexOf("</head>");
html = html.slice(0, headEnd) + STYLE + HEAD_CSS + html.slice(headEnd);

fs.writeFileSync(PAGE, html);
console.log("  quiz above the FAQs, closing section with the enquiry form after them");
