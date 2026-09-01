#!/usr/bin/env node
/**
 * build-ai-contact.js — /ai-enquiry/, the campaign contact page.
 *
 * Where the Meta campaign sends someone who wants to talk, rather than the
 * main contact page. Two reasons it is separate:
 *
 *   1. DIFFERENT DESTINATION. This posts to /api/lead with data-form="enquiry",
 *      so submissions land in their own `enquiry` tab of the leads sheet, apart
 *      from the quiz and from the main contact form's Formspree inbox. Campaign
 *      leads stay countable without unpicking them from general enquiries.
 *
 *   2. NO NAVIGATION. Paid traffic arrives with one job. Every nav link is an
 *      exit, so the header is the logo and the phone number and nothing else,
 *      and the footer is legal links only.
 *
 * Four fields, all required. Name, email and phone because someone asking to be
 * contacted expects to be asked how, and the AI question because it is the one
 * thing that lets whoever calls open with something other than "so, tell me
 * about your business".
 *
 * COPY
 * House rules, same as the quiz: no emoji, no ellipses, no em-dashes.
 *
 * The endpoint is NOT written here. It is stamped at build time from
 * thirdParty.forms.enquiry in src/_data/site.json, and assets/js/contact-form.js
 * is injected by scripts/complete-head-meta.js because the form carries
 * data-contact-form. Both happen during `npm run build`.
 *
 * Usage:  node scripts/build-ai-contact.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

/* Fonts and base styles are lifted from the contact page's head so this page
   cannot drift from the rest of the site's typography. */
const SHELL = fs.readFileSync(path.join(PUBLIC, "contact-us", "index.html"), "utf8");
const head = SHELL.slice(0, SHELL.indexOf("</head>"));
const ASSETS =
  (head.match(/<link rel="preload"[^>]*>/g) || []).join("\n") +
  "\n" +
  (head.match(/<style>[\s\S]*?<\/style>/g) || []).join("\n");

const BLUE = "#1BABE5", INK = "#0B1220", GREY = "#5A6473";
const SLUG = "/ai-enquiry/";
const FORM_KEY = "enquiry";

const input = (o) => `
          <label style="display:flex;flex-direction:column;gap:7px">
            <span style="font-size:14px;font-weight:700;letter-spacing:-0.01em;color:${INK}">${o.label}</span>
            ${o.textarea
              ? `<textarea name="${o.name}"${o.optional ? "" : " required"} rows="4" placeholder="${o.placeholder || ""}"
                      style="font:inherit;font-size:16px;line-height:1.5;padding:14px 15px;border-radius:12px;border:1.5px solid rgba(11,18,32,0.16);background:#fff;color:${INK};outline:none;width:100%;box-sizing:border-box;resize:vertical"></textarea>`
              : `<input type="${o.type}" name="${o.name}"${o.optional ? "" : " required"} ${o.attrs || ""}
                      style="font:inherit;font-size:16px;padding:15px 16px;min-height:52px;border-radius:12px;border:1.5px solid rgba(11,18,32,0.16);background:#fff;color:${INK};outline:none;width:100%;box-sizing:border-box">`}
            <span data-error style="font-size:13px;color:#C2410C"></span>
          </label>`;

const FIELDS = [
  { name: "name", label: "Your name", type: "text", attrs: 'autocomplete="name" autocapitalize="words"' },
  { name: "email", label: "Email", type: "email", attrs: 'autocomplete="email" inputmode="email" spellcheck="false"' },
  { name: "phone", label: "Phone", type: "tel", attrs: 'autocomplete="tel" inputmode="tel"' },
  {
    name: "ai_goal",
    // Optional. Asking someone to write a paragraph before they can send a
    // form is the most expensive field on it — name, email and phone are
    // enough to call them back, and what they want from AI is a conversation
    // rather than a required text box.
    label: "What would you like to use AI for? (optional)",
    optional: true,
    textarea: true,
    placeholder: "For example: cut down admin time, get quotes out faster, or help the team write better.",
  },
];

const body = `
  <header style="max-width:760px;margin:0 auto;padding:20px 22px 0;display:flex;align-items:center;justify-content:space-between;gap:16px">
    <span style="display:flex;align-items:center;gap:10px">
      <img src="/assets/design/adon-logo.png" alt="Ad On Group" style="width:32px;height:32px;object-fit:contain;display:block" width="320" height="320" loading="eager" fetchpriority="high" decoding="async">
      <span style="font-weight:800;font-size:17px;letter-spacing:-0.02em;color:${INK}">Ad On Group</span>
    </span>
    <a href="tel:+61755861400" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;font-size:15px;font-weight:700;color:#1483B5;white-space:nowrap"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"></path></svg>(07) 5586 1400</a>
  </header>

  <main style="max-width:760px;margin:0 auto;padding:34px 22px 72px">
    <div style="font-family:'JetBrains Mono',monospace;font-size:11.5px;letter-spacing:0.15em;text-transform:uppercase;color:${BLUE};font-weight:700">Get in touch</div>
    <h1 style="font-size:clamp(29px,4.2vw,46px);line-height:1.05;letter-spacing:-0.042em;font-weight:600;color:${INK};margin:14px 0 0">Let's work out where AI fits in your <span style="color:${BLUE}">business</span>.</h1>
    <p style="font-size:17px;line-height:1.6;color:#4A5462;margin:14px 0 0;max-width:520px">Tell us what you are after and one of our AI Training Facilitators will get back to you.</p>

    <div style="background:rgba(255,255,255,0.72);backdrop-filter:blur(20px) saturate(150%);-webkit-backdrop-filter:blur(20px) saturate(150%);border:1px solid rgba(255,255,255,0.9);box-shadow:0 26px 62px -32px rgba(11,18,32,0.38);border-radius:22px;padding:26px 24px;margin:28px 0 0;max-width:560px">
      <form data-contact-form data-form="${FORM_KEY}" data-success-panel="#enquiry-thanks" onsubmit="return false" style="display:flex;flex-direction:column;gap:14px">
        <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">
        <input type="hidden" name="source" value="${SLUG}">
        <input type="hidden" name="utm_source" data-utm="utm_source">
        <input type="hidden" name="utm_medium" data-utm="utm_medium">
        <input type="hidden" name="utm_campaign" data-utm="utm_campaign">
        <input type="hidden" name="utm_content" data-utm="utm_content">
${FIELDS.map(input).join("")}

        <button type="submit" style="font:inherit;font-size:17px;font-weight:700;color:#fff;background:${BLUE};border:none;padding:16px 26px;min-height:54px;border-radius:14px;cursor:pointer;width:100%;box-shadow:0 14px 26px -12px rgba(27,171,229,0.65)">Send my enquiry &rarr;</button>
        <p data-form-status class="form-status" role="status" aria-live="polite" style="font-size:14px;margin:0"></p>
        <p style="font-size:12.5px;line-height:1.5;color:#8A93A1;margin:2px 0 0">No obligation. We never share your details.</p>
      </form>

      <div id="enquiry-thanks" hidden style="text-align:center;padding:10px 4px">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:rgba(27,171,229,0.12)"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${BLUE}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg></span>
        <div style="font-size:21px;font-weight:800;letter-spacing:-0.025em;color:${INK};margin:15px 0 0">Thanks, we have got that.</div>
        <p style="font-size:15.5px;line-height:1.6;color:${GREY};margin:10px 0 0">Our team has reached out about AI training, please check your inbox. If you would rather talk now, book a time with our team below.</p><button type="button" data-calendly hidden style="display:none;font:inherit;font-size:15px;font-weight:700;color:#fff;background:#1BABE5;border:none;padding:13px 24px;min-height:48px;border-radius:12px;cursor:pointer;margin:16px 0 0">Book a time &rarr;</button>
      </div>
    </div>
  </main>

  <footer style="border-top:1px solid rgba(11,18,32,0.08)">
    <div style="max-width:760px;margin:0 auto;padding:20px 22px;display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between">
      <span style="font-size:13px;color:#8A93A1">&copy; ${new Date().getFullYear()} Ad On Group. All rights reserved.</span>
      <span style="display:flex;gap:18px;font-size:13px">
        <a href="/privacy-policy/" style="color:#8A93A1;text-decoration:none">Privacy Policy</a>
        <a href="/terms-and-conditions/" style="color:#8A93A1;text-decoration:none">Terms of Use</a>
      </span>
    </div>
  </footer>

`;

const html = `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Talk to us about AI | Ad On Group</title>
<meta name="description" content="Tell us what you are hoping to achieve with AI and one of our AI Training Facilitators will get back to you.">
<meta name="robots" content="noindex">
${ASSETS}
</head>
<body>
<div style="max-width:100%;overflow-x:clip;background:transparent;position:relative">
${body}
</div>
</body>
</html>
`;

const dir = path.join(PUBLIC, SLUG.replace(/^\/|\/$/g, ""));
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "index.html"), html);
console.log(`  wrote ${SLUG}index.html  (${html.length} bytes)`);
console.log(`  ${FIELDS.length} fields -> data-form="${FORM_KEY}" -> "${FORM_KEY}" tab in the leads sheet`);
