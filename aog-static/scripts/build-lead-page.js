#!/usr/bin/env node
/**
 * RETIRED — this page has been removed from the site.
 *
 * /ai-training/ was the short name-and-email lead page for the paid campaign.
 * It is gone because the real sales landing page is expected to take that URL.
 * Nothing links to it and it is not in the sitemap, so re-running this script
 * would resurrect a page the site no longer wants. Kept only as the source if
 * that page ever needs rebuilding; delete it once the replacement is live.
 *
 * The Formspree "leads" endpoint it used is still configured in site.json,
 * ready for whatever takes its place.
 */
/**
 * build-lead-page.js — /ai-training/, the paid-ads landing page.
 *
 * This is where paid traffic lands, so it is built to convert rather than to
 * inform. Three things follow from that, and each is a deliberate departure
 * from the rest of the site:
 *
 *   1. NO NAVIGATION. Every nav link on a landing page is an exit. The header
 *      here is the logo and the phone number, nothing clickable that leads
 *      away except the phone. The footer is trimmed to legal links only.
 *
 *   2. THE FORM IS THE PAGE. Two fields and a button, above the fold on a
 *      390px phone without scrolling. Everything else sits below it and exists
 *      only to bring someone back up to it.
 *
 *   3. NOINDEX. It reuses the Ad On AI story, so leaving it indexable would
 *      put a thin near-duplicate in competition with /ad-on-ai-division/.
 *      Easily reversed if the page turns out to earn organic traffic.
 *
 * Mobile specifics that matter more than they look:
 *   - type="email" + inputmode="email" so the keyboard has an @ key
 *   - autocomplete="name" / "email" so the browser can fill both in one tap
 *   - enterkeyhint="send" so the return key says Send, not Go
 *   - 52px input and button heights, comfortably above the 44px tap minimum
 *   - NO autofocus: on a phone it throws the keyboard up on arrival and pushes
 *     the headline off screen before the visitor has read a word
 *
 * Usage:  node scripts/build-lead-page.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const SHELL = fs.readFileSync(path.join(PUBLIC, "contact-us", "index.html"), "utf8");

/** Fonts and base styles, reused so the type matches the rest of the site. */
const head = SHELL.slice(0, SHELL.indexOf("</head>"));
const HEAD_ASSETS =
  (head.match(/<link rel="preload"[^>]*>/g) || []).join("\n") +
  "\n" +
  (head.match(/<style>[\s\S]*?<\/style>/g) || []).join("\n");

const BLUE = "#1BABE5";
const INK = "#0B1220";
const GREY = "#5A6473";

const eyebrow = (t) =>
  `<span style="display:inline-flex;align-items:center;gap:10px;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.16em;color:${BLUE};text-transform:uppercase;font-weight:600"><span style="width:22px;height:1.5px;background:${BLUE}"></span>${t}</span>`;

const CARD =
  "background:#fff;border:1px solid rgba(11,18,32,0.08);border-radius:20px;padding:26px 24px;box-shadow:0 20px 46px -30px rgba(11,18,32,0.30)";

/* The three things below the fold, condensed from /ad-on-ai-division/ so the
   page stays light. A landing page that takes three seconds to paint has
   already lost some of the traffic it was paid for. */
const WHAT = [
  ["Built around your actual work", "Your staff learn AI on the jobs they already do, not on generic exercises. What they build in the program is what they use the next morning."],
  ["Three months, self-paced", "Around two hours a week across 24 modules. They go from using AI well, to automating repetitive work, to running agents that handle whole tasks."],
  ["Australian, and we answer the phone", "Ad On Group has been Australian owned and operated since 2008. You get people you can call, not a support queue."],
];

const ARC = [
  ["Month 1", "Foundations", "Getting genuinely good at AI: accurate, safe, and applied to real work."],
  ["Month 2", "Automation", "Turning repeatable tasks into workflows that run on a schedule."],
  ["Month 3", "AI agents", "Deploying agents that handle whole jobs, including one that manages the rest."],
];

const FAQ = [
  ["Do our staff need to be technical?", "No. The program is written for people who have never automated anything. Nobody is asked to write code."],
  ["How much time does it take?", "Around two hours a week for three months. It is self-paced, so it fits around the working day."],
  ["What does it cost?", "It is priced per seat and depends on how many staff you enrol. We will give you the figure on the call, with no obligation."],
];

const input = (name, label, type, extra) => `
        <label style="display:flex;flex-direction:column;gap:8px">
          <span style="font-size:14px;font-weight:700;letter-spacing:-0.01em;color:${INK}">${label}</span>
          <input type="${type}" name="${name}" required ${extra}
                 style="font:inherit;font-size:16px;padding:15px 16px;min-height:52px;border-radius:12px;border:1.5px solid rgba(11,18,32,0.16);background:#fff;color:${INK};outline:none;width:100%;box-sizing:border-box">
          <span data-error style="font-size:13px;color:#C2410C"></span>
        </label>`;

const FORM = `
      <form data-contact-form data-form="leads" data-success-panel="#lead-thanks" onsubmit="return false"
            style="display:flex;flex-direction:column;gap:14px">
        <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">
        <input type="hidden" name="_subject" value="New AI training enquiry (paid campaign)">
        <input type="hidden" name="source" value="/ai-training/">

        ${input("name", "Your name", "text", 'autocomplete="name" autocapitalize="words"')}
        ${input("email", "Email", "email", 'autocomplete="email" inputmode="email" spellcheck="false" enterkeyhint="send"')}

        <button type="submit" style="font:inherit;font-size:17px;font-weight:700;color:#fff;background:${BLUE};border:none;padding:16px 26px;min-height:54px;border-radius:14px;cursor:pointer;width:100%;box-shadow:0 14px 26px -12px rgba(27,171,229,0.65);transition:transform .18s ease, box-shadow .18s ease">Send me the details &rarr;</button>

        <p data-form-status class="form-status" role="status" aria-live="polite" style="font-size:14px;margin:0"></p>
        <p style="font-size:12.5px;line-height:1.5;color:#8A93A1;margin:2px 0 0">No obligation. We will email you the details and answer any questions. We never share your details.</p>
      </form>

      <div id="lead-thanks" hidden style="text-align:center;padding:12px 4px">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:rgba(27,171,229,0.12)"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${BLUE}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg></span>
        <div style="font-size:22px;font-weight:800;letter-spacing:-0.025em;color:${INK};margin:16px 0 0">Thanks, we have got that.</div>
        <p style="font-size:15.5px;line-height:1.65;color:${GREY};margin:10px 0 0">One of our team will email you shortly with the details of the AI Training and Enablement program. If you would rather talk now, call <a href="tel:+61755861400" style="color:#1483B5;font-weight:700;text-decoration:none">(07) 5586 1400</a>.</p>
      </div>`;

const body = `
  <header class="lp-head" style="max-width:1120px;margin:0 auto;padding:20px 22px 0;display:flex;align-items:center;justify-content:space-between;gap:16px">
    <span style="display:flex;align-items:center;gap:10px">
      <img src="/assets/design/adon-logo.png" alt="Ad On Group" style="width:32px;height:32px;object-fit:contain;display:block" width="320" height="320" loading="eager" fetchpriority="high" decoding="async">
      <span style="font-weight:800;font-size:17px;letter-spacing:-0.02em;color:${INK}">Ad On Group</span>
    </span>
    <a href="tel:+61755861400" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;font-size:15px;font-weight:700;color:#1483B5;white-space:nowrap"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"></path></svg>(07) 5586 1400</a>
  </header>

  <section class="lp-hero-sec" style="max-width:1120px;margin:0 auto;padding:26px 22px 40px">
    <div class="lead-hero" style="display:grid;grid-template-columns:1.02fr 0.98fr;grid-template-areas:'pitch form' 'proof form';gap:26px 44px;align-items:start">
      <div style="grid-area:pitch">
        ${eyebrow("Ad On AI")}
        <h1 style="font-size:clamp(30px,4.4vw,52px);line-height:1.04;letter-spacing:-0.042em;font-weight:600;color:${INK};margin:16px 0 0">Get your team actually <span style="color:${BLUE}">using AI</span>.</h1>
        <p style="font-size:17px;line-height:1.6;color:#4A5462;margin:16px 0 0;max-width:480px">A three month program that trains your staff to use AI on the work they already do. Leave your name and we will send you the details.</p>
      </div>

      <div style="grid-area:proof">
        <div style="display:flex;flex-wrap:wrap;gap:18px;margin:0">
          ${["Self-paced, around 2 hours a week", "No technical background needed", "Australian owned since 2008"]
            .map(
              (t) => `<span style="display:inline-flex;align-items:center;gap:8px;font-size:14.5px;font-weight:600;color:#1F2733">
            <span style="flex:none;width:20px;height:20px;border-radius:6px;background:${BLUE};display:inline-flex;align-items:center;justify-content:center"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg></span>${t}</span>`
            )
            .join("\n          ")}
        </div>
      </div>

      <div id="get-details" class="lp-form-card" style="grid-area:form;background:rgba(255,255,255,0.72);backdrop-filter:blur(20px) saturate(150%);-webkit-backdrop-filter:blur(20px) saturate(150%);border:1px solid rgba(255,255,255,0.9);box-shadow:0 26px 62px -32px rgba(11,18,32,0.38);border-radius:22px;padding:26px 24px">
        <div style="font-size:19px;font-weight:800;letter-spacing:-0.022em;color:${INK}">Send me the details</div>
        <p style="font-size:14.5px;line-height:1.55;color:${GREY};margin:7px 0 18px">Two fields. We will do the rest.</p>
        ${FORM}
      </div>
    </div>
  </section>

  <section style="max-width:1120px;margin:0 auto;padding:24px 22px 40px">
    ${eyebrow("What it is")}
    <h2 style="font-size:clamp(23px,2.8vw,34px);line-height:1.14;letter-spacing:-0.03em;font-weight:600;color:${INK};margin:14px 0 0">Training that shows up in their <span style="color:${BLUE}">actual work</span>.</h2>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin:28px 0 0">
      ${WHAT.map(
        ([t, d]) => `<div style="${CARD}">
        <div style="font-size:17px;font-weight:800;letter-spacing:-0.02em;color:${INK}">${t}</div>
        <p style="font-size:14.5px;line-height:1.62;color:${GREY};margin:9px 0 0">${d}</p>
      </div>`
      ).join("\n      ")}
    </div>
  </section>

  <section style="max-width:1120px;margin:0 auto;padding:24px 22px 40px">
    ${eyebrow("The three months")}
    <h2 style="font-size:clamp(23px,2.8vw,34px);line-height:1.14;letter-spacing:-0.03em;font-weight:600;color:${INK};margin:14px 0 0">From AI curious to running their own <span style="color:${BLUE}">agents</span>.</h2>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin:28px 0 0">
      ${ARC.map(
        ([m, t, d]) => `<div style="${CARD}">
        <span style="font-family:'JetBrains Mono',monospace;font-size:11.5px;letter-spacing:0.14em;text-transform:uppercase;color:#1483B5;font-weight:700">${m}</span>
        <div style="font-size:17px;font-weight:800;letter-spacing:-0.02em;color:${INK};margin:10px 0 0">${t}</div>
        <p style="font-size:14.5px;line-height:1.62;color:${GREY};margin:8px 0 0">${d}</p>
      </div>`
      ).join("\n      ")}
    </div>
  </section>

  <section style="max-width:820px;margin:0 auto;padding:24px 22px 40px">
    ${eyebrow("Questions")}
    <div style="margin:24px 0 0">
      ${FAQ.map(
        ([q, a]) => `<details class="aoa-faq">
        <summary>${q}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg></summary>
        <div>${a}</div>
      </details>`
      ).join("\n      ")}
    </div>
  </section>

  <section style="max-width:820px;margin:0 auto;padding:24px 22px 72px;text-align:center">
    <h2 style="font-size:clamp(23px,2.8vw,34px);line-height:1.14;letter-spacing:-0.03em;font-weight:600;color:${INK};margin:0">Want the <span style="color:${BLUE}">details</span>?</h2>
    <p style="font-size:16px;line-height:1.6;color:${GREY};margin:12px 0 0">Leave your name and email and we will send them through.</p>
    <a href="#get-details" style="display:inline-flex;align-items:center;gap:9px;margin:22px 0 0;text-decoration:none;font-size:16.5px;font-weight:700;color:#fff;background:${BLUE};padding:16px 30px;min-height:54px;border-radius:14px;box-shadow:0 14px 26px -12px rgba(27,171,229,0.65)">Send me the details <span style="font-size:17px">&rarr;</span></a>
  </section>

  <footer style="border-top:1px solid rgba(11,18,32,0.08);margin-top:8px">
    <div style="max-width:1120px;margin:0 auto;padding:22px;display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between">
      <span style="font-size:13px;color:#8A93A1">&copy; ${new Date().getFullYear()} Ad On Group. All rights reserved.</span>
      <span style="display:flex;gap:20px;font-size:13px">
        <a href="/privacy-policy/" style="color:#8A93A1;text-decoration:none">Privacy Policy</a>
        <a href="/terms-and-conditions/" style="color:#8A93A1;text-decoration:none">Terms of Use</a>
      </span>
    </div>
  </footer>

  <style>
    /* Laptop: pitch and proof points stack in the left column, form on the
       right. Phone: headline first so an arriving visitor knows what this is,
       then the form, then the proof points. Putting the form above the
       headline tested worse on paper: 'Send me the details' with nothing above
       it does not say details of what. */
    @media (max-width: 900px) {
      .lead-hero {
        grid-template-columns: 1fr !important;
        grid-template-areas: 'pitch' 'form' 'proof' !important;
        gap: 16px !important;
      }
      /* Every pixel above the button is a pixel of scroll between an arriving
         visitor and the only action on the page. Tightened until the whole
         form, button included, sits inside a 664px iPhone viewport with the
         headline still above it. */
      .lp-head { padding-top: 12px !important; }
      .lp-hero-sec { padding-top: 14px !important; padding-bottom: 26px !important; }
      .lp-form-card { padding: 20px 18px !important; }
      .lead-hero h1 { font-size: 30px !important; line-height: 1.06 !important; }
      .lead-hero > div[style*="pitch"] p { margin-top: 12px !important; font-size: 15.5px !important; }
    }
  </style>
`;

const html = `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AI Training for Australian Teams | Ad On AI</title>
<meta name="description" content="A three month program that trains your staff to use AI on the work they already do. Leave your name and email and we will send you the details.">
<meta name="robots" content="noindex">
${HEAD_ASSETS}
</head>
<body>

<div style="max-width:100%;overflow-x:clip;background:transparent;position:relative">
${body}
</div>
</body>
</html>
`;

const dir = path.join(PUBLIC, "ai-training");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "index.html"), html);
console.log(`  wrote ai-training/index.html  (${html.length} bytes)`);
console.log("  noindex, no site navigation, form inert until an endpoint is set.");
