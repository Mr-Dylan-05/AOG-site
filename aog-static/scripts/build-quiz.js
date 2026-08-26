#!/usr/bin/env node
/**
 * build-quiz.js — /ai-quiz/, the Meta campaign quiz.
 *
 * Ad tap lands here. Six questions, one per screen, tap to answer and it
 * advances on its own. The last screen shows the result and the form together
 * rather than gating the result behind the form.
 *
 * COPY
 * Supplied by Dylan and then de-slopped on his instruction: the "Why it's
 * there" notes were internal rationale and are gone, as are the emoji, the
 * ellipses, the em-dashes (a standing rule for this site), the section labels
 * ("The uncomfortable one", "The realisation") and "YOUR AI WAKE-UP CALL".
 * The emotional arc he built is intact; only the packaging changed.
 *
 * SCORING
 * Each answer carries a weight, low for "barely started" and high for "ready
 * to go". The total maps to one of three bands. The band only changes the
 * headline and one line: the substance of the result is the same for everyone,
 * which is how Dylan wrote it and is honest, because the advice genuinely does
 * not change. What changes is where they are starting from.
 *
 * WHAT GETS SENT
 * Not just the score. Every answer goes through as a named field, because the
 * motivation question and the support question are the two most useful things
 * a setter can know before picking up the phone. UTM parameters ride along too,
 * so a lead can be traced to the creative that produced it.
 *
 * Pixel-ready: fires a Meta `Lead` event on submit if fbq is present. There is
 * no Pixel on the site yet, so the call is guarded.
 *
 * Usage:  node scripts/build-quiz.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const SHELL = fs.readFileSync(path.join(PUBLIC, "contact-us", "index.html"), "utf8");
const head = SHELL.slice(0, SHELL.indexOf("</head>"));
const ASSETS =
  (head.match(/<link rel="preload"[^>]*>/g) || []).join("\n") +
  "\n" +
  (head.match(/<style>[\s\S]*?<\/style>/g) || []).join("\n");

const BLUE = "#1BABE5", INK = "#0B1220", GREY = "#5A6473";

/* Weights ascend with readiness and intent. Question 4 is inverted: "nothing
   is stopping me" is the ready answer, so it sits at the top of its list. */
const QUESTIONS = [
  {
    id: "current_use",
    intro: "Where you are now",
    q: "How are you using AI at the moment?",
    a: [
      ["Barely using it", 0],
      ["Mostly search, research and writing", 1],
      ["I use ChatGPT or Claude regularly, but mainly as a chatbot", 2],
      ["I am starting to automate tasks and workflows", 3],
      ["I am experimenting with agents and more advanced automation", 4],
    ],
  },
  {
    id: "worry",
    intro: "Imagine nothing changes",
    q: "Twelve months from now, which would worry you most?",
    a: [
      ["People around me are much better at AI than I am", 2],
      ["My role has changed and my skills have not", 2],
      ["I am still spending hours on things AI could have handled", 2],
      ["Other businesses have moved ahead while I have not", 2],
      ["I will wish I had started a year earlier", 2],
    ],
  },
  {
    id: "motivation",
    intro: "Now the other way round",
    q: "If you became genuinely good at AI, what would you most want it to change?",
    a: [
      ["Make me more valuable at work", 2],
      ["Give me back hours every week", 2],
      ["Make my career feel more secure", 2],
      ["Open up new income opportunities", 2],
      ["Give me a better balance between work and life", 2],
      ["Stop me feeling left behind", 2],
    ],
  },
  {
    id: "barrier",
    intro: "The honest bit",
    q: "If AI could make you significantly more productive, what is stopping you?",
    a: [
      ["I do not know where to start", 1],
      ["I do not know what is possible yet", 1],
      ["I do not have the time to work it out", 2],
      ["So much is changing that I do not know what to learn", 2],
      ["I keep meaning to and have not made it a priority", 2],
      ["Nothing. I am ready to get good at it", 4],
    ],
  },
  {
    id: "support",
    intro: "Learning it is one thing, keeping up is another",
    q: "Once you have the basics, how important is ongoing help?",
    a: [
      ["Not important. Give me the knowledge and I will run with it", 1],
      ["Useful. Someone to ask when I get stuck", 2],
      ["Important. Ongoing tuition and practical support", 3],
      ["Very important. A community where I keep learning", 4],
      ["Essential. Ongoing guidance as AI keeps changing", 4],
    ],
  },
  {
    id: "intent",
    intro: "Last one",
    q: "Which sounds most like you?",
    a: [
      ["I know I should learn AI. I have not got around to it", 1],
      ["I want to understand what I should be learning first", 2],
      ["I want to become genuinely good at using AI", 3],
      ["I want to use AI to change how I work and open up opportunities", 4],
      ["I am ready to invest in myself and start now", 5],
    ],
  },
];

/* INTAKE (before the scored questions)
   Segments the lead and collects the one detail that makes the follow-up
   specific: a website for a business, a role and industry for an employee.
   Scored zero on purpose. These say who someone is, not how AI-ready they are,
   and folding them into the score would move people between bands for reasons
   the result copy does not reflect. */
const ROLE = {
  id: "role",
  intro: "First up",
  q: "Which best describes you?",
  a: [
    ["I own or help lead a business", "business"],
    ["I am an individual employee", "individual"],
  ],
};

/* Broad enough that nobody has to hunt, short enough to scan on a phone.
   "Other" last on both so the list never dead-ends. */
const JOB_TITLES = [
  "Administration or office support",
  "Customer service",
  "Finance or accounts",
  "Marketing",
  "Sales or business development",
  "Operations",
  "HR or people",
  "Executive or personal assistant",
  "IT or technical",
  "Management or team lead",
  "Other",
];

const INDUSTRIES = [
  "Professional services",
  "Construction and trades",
  "Real estate and property",
  "Healthcare and medical",
  "Retail and e-commerce",
  "Hospitality and tourism",
  "Manufacturing",
  "Transport and logistics",
  "Education and training",
  "Financial services and insurance",
  "Technology",
  "Marketing and creative",
  "Not for profit",
  "Government",
  "Other",
];

/* One screen per branch. Both are skippable: a half-answered lead is worth more
   than a bounce, and anything missing can be asked on the call. Flip `skip` to
   false to force an answer. */
const INTAKE = {
  business: {
    id: "business",
    intro: "Your business",
    q: "What is your company website?",
    help: "We use this to look up your business so the audit reflects what you actually do, rather than generic advice.",
    skip: true,
    fields: [
      { name: "website", label: "Company website", type: "url", placeholder: "yourcompany.com.au" },
    ],
  },
  individual: {
    id: "individual",
    intro: "Your role",
    q: "What do you do?",
    help: "So we can show you where AI fits in a role like yours, not in general.",
    skip: true,
    fields: [
      { name: "job_title", label: "Job title", type: "select", options: JOB_TITLES },
      { name: "industry", label: "Industry", type: "select", options: INDUSTRIES },
    ],
  },
};

/* Only the heading and the opening line change by band. The risk, opportunity
   and next step below are the same for everyone, as written. */
const BANDS = [
  { max: 10, title: "You have not really started", line: "You are near the beginning, which is a better place to be than it feels. Nothing here needs undoing first." },
  { max: 17, title: "You have made a start", line: "You are using AI, but not yet in the way that changes how much you get done. That gap is the whole opportunity." },
  { max: 99, title: "You are ready to go further", line: "You are already past the basics. What you are missing is structure, and someone to keep you moving as things change." },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

const eyebrow = (t) =>
  `<div style="font-family:'JetBrains Mono',monospace;font-size:11.5px;letter-spacing:0.15em;text-transform:uppercase;color:${BLUE};font-weight:700">${esc(t)}</div>`;
const heading = (t) =>
  `<h2 style="font-size:clamp(22px,3.4vw,30px);line-height:1.2;letter-spacing:-0.03em;font-weight:600;color:${INK};margin:12px 0 0">${esc(t)}</h2>`;
const backBtn = `<button type="button" class="q-back" style="margin-top:18px">Back</button>`;

/* Screen 1: who they are. Rendered as tap options so it keeps the rhythm of the
   rest of the quiz; data-role tells the script which branch to splice in. */
const roleScreen = `
      <div class="q-screen" data-screen="${ROLE.id}" hidden>
        ${eyebrow(ROLE.intro)}
        ${heading(ROLE.q)}
        <div style="display:flex;flex-direction:column;gap:10px;margin:22px 0 0">
          ${ROLE.a
            .map(
              ([text, value]) =>
                `<button type="button" class="q-opt" data-q="role" data-pts="0" data-role="${value}" data-answer="${esc(text)}">${esc(text)}</button>`
            )
            .join("\n          ")}
        </div>
      </div>`;

const field = (f) =>
  f.type === "select"
    ? `<label class="q-field">
            <span>${esc(f.label)}</span>
            <select name="${f.name}" data-intake="${f.name}">
              <option value="">Select ${esc(f.label.toLowerCase())}</option>
              ${f.options.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("\n              ")}
            </select>
            <span class="q-err" data-err></span>
          </label>`
    : `<label class="q-field">
            <span>${esc(f.label)}</span>
            <input type="text" name="${f.name}" data-intake="${f.name}" inputmode="url" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="${esc(f.placeholder || "")}">
            <span class="q-err" data-err></span>
          </label>`;

const intakeScreens = Object.values(INTAKE)
  .map(
    (s) => `
      <div class="q-screen" data-screen="${s.id}" hidden>
        ${eyebrow(s.intro)}
        ${heading(s.q)}
        <p style="font-size:15px;line-height:1.6;color:${GREY};margin:12px 0 0;max-width:520px">${esc(s.help)}</p>
        <div style="display:flex;flex-direction:column;gap:14px;margin:22px 0 0;max-width:480px">
          ${s.fields.map(field).join("\n          ")}
        </div>
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin:22px 0 0">
          <button type="button" class="q-next">Continue &rarr;</button>
          ${s.skip ? `<button type="button" class="q-skip">Skip this</button>` : ""}
        </div>
        ${backBtn}
      </div>`
  )
  .join("");

const screens = QUESTIONS.map(
  (item) => `
      <div class="q-screen" data-screen="${item.id}" hidden>
        ${eyebrow(item.intro)}
        ${heading(item.q)}
        <div style="display:flex;flex-direction:column;gap:10px;margin:22px 0 0">
          ${item.a
            .map(
              ([text, pts], j) =>
                `<button type="button" class="q-opt" data-q="${item.id}" data-pts="${pts}" data-answer="${esc(text)}" data-idx="${j}">${esc(text)}</button>`
            )
            .join("\n          ")}
        </div>
        ${backBtn}
      </div>`
).join("");

const body = `
  <header style="max-width:820px;margin:0 auto;padding:18px 20px 0;display:flex;align-items:center;justify-content:space-between;gap:16px">
    <span style="display:flex;align-items:center;gap:10px">
      <img src="/assets/design/adon-logo.png" alt="Ad On Group" style="width:30px;height:30px;object-fit:contain;display:block" width="320" height="320" loading="eager" fetchpriority="high" decoding="async">
      <span style="font-weight:800;font-size:16px;letter-spacing:-0.02em;color:${INK}">Ad On Group</span>
    </span>
    <a href="tel:+61755861400" style="text-decoration:none;font-size:14.5px;font-weight:700;color:#1483B5;white-space:nowrap">(07) 5586 1400</a>
  </header>

  <main style="max-width:820px;margin:0 auto;padding:22px 20px 70px">

    <div id="quiz-progress" style="height:5px;border-radius:99px;background:rgba(11,18,32,0.08);overflow:hidden;margin:0 0 26px">
      <div id="quiz-bar" style="height:100%;width:0%;background:${BLUE};border-radius:99px;transition:width .3s ease"></div>
    </div>

    <div id="quiz-intro">
      <div style="font-family:'JetBrains Mono',monospace;font-size:11.5px;letter-spacing:0.15em;text-transform:uppercase;color:${BLUE};font-weight:700">A few quick questions, about a minute</div>
      <h1 style="font-size:clamp(30px,4.6vw,50px);line-height:1.04;letter-spacing:-0.042em;font-weight:600;color:${INK};margin:14px 0 0">Are you ready for <span style="color:${BLUE}">AI</span>?</h1>
      <p style="font-size:17px;line-height:1.6;color:#4A5462;margin:14px 0 0">Answer honestly and we will show you where you stand, what it is costing you, and what to do about it.</p>
      <button type="button" id="quiz-start" style="font:inherit;font-size:17px;font-weight:700;color:#fff;background:${BLUE};border:none;padding:16px 30px;min-height:54px;border-radius:14px;cursor:pointer;margin:24px 0 0;box-shadow:0 14px 26px -12px rgba(27,171,229,0.65)">Start &rarr;</button>
    </div>

    <div id="quiz-questions" hidden>${roleScreen}${intakeScreens}${screens}
    </div>

    <div id="quiz-result" hidden>
      <div style="font-family:'JetBrains Mono',monospace;font-size:11.5px;letter-spacing:0.15em;text-transform:uppercase;color:${BLUE};font-weight:700">Your result</div>
      <h2 id="band-title" style="font-size:clamp(26px,3.8vw,38px);line-height:1.1;letter-spacing:-0.035em;font-weight:600;color:${INK};margin:12px 0 0"></h2>
      <p id="band-line" style="font-size:17px;line-height:1.62;color:#4A5462;margin:12px 0 0"></p>

      <div class="result-grid" style="display:grid;grid-template-columns:1.05fr 0.95fr;gap:32px;align-items:start;margin:30px 0 0">
        <div style="display:flex;flex-direction:column;gap:16px">
          ${[
            ["Your biggest risk", "Staying where you are while the people around you keep moving forward."],
            ["Your biggest opportunity", "You do not need to become an AI expert. You need to become highly capable at using AI to make yourself more valuable, productive and adaptable."],
            ["Your next step", "Do not try to learn everything. Learn the right things, apply them to your real work, and have someone in your corner as you keep progressing."],
          ]
            .map(
              ([t, d]) => `<div style="background:#fff;border:1px solid rgba(11,18,32,0.08);border-radius:16px;padding:20px 20px;box-shadow:0 18px 40px -30px rgba(11,18,32,0.3)">
            <div style="font-size:15.5px;font-weight:800;letter-spacing:-0.02em;color:${INK}">${t}</div>
            <p style="font-size:15px;line-height:1.6;color:${GREY};margin:7px 0 0">${d}</p>
          </div>`
            )
            .join("\n          ")}
        </div>

        <div style="background:rgba(255,255,255,0.72);backdrop-filter:blur(20px) saturate(150%);-webkit-backdrop-filter:blur(20px) saturate(150%);border:1px solid rgba(255,255,255,0.9);box-shadow:0 26px 62px -32px rgba(11,18,32,0.38);border-radius:20px;padding:24px 22px">
          <div style="font-size:18px;font-weight:800;letter-spacing:-0.022em;color:${INK}">Want us to show you what that looks like?</div>
          <p style="font-size:14.5px;line-height:1.55;color:${GREY};margin:7px 0 16px">Talk to one of our AI Training Facilitators and we will help you work out your best AI learning path.</p>

          <form data-contact-form data-form="quiz" data-success-panel="#quiz-thanks" onsubmit="return false" style="display:flex;flex-direction:column;gap:13px">
            <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">
            <input type="hidden" name="_subject" value="AI readiness quiz result">
            <input type="hidden" name="source" value="/ai-quiz/">
            <input type="hidden" name="score" id="f-score">
            <input type="hidden" name="band" id="f-band">
            <input type="hidden" name="role" id="f-role">
            <input type="hidden" name="website" id="f-website">
            <input type="hidden" name="job_title" id="f-job_title">
            <input type="hidden" name="industry" id="f-industry">
            ${QUESTIONS.map((q) => `<input type="hidden" name="${q.id}" id="f-${q.id}">`).join("\n            ")}
            <input type="hidden" name="utm_source" id="f-utm_source">
            <input type="hidden" name="utm_medium" id="f-utm_medium">
            <input type="hidden" name="utm_campaign" id="f-utm_campaign">
            <input type="hidden" name="utm_content" id="f-utm_content">

            <label style="display:flex;flex-direction:column;gap:7px">
              <span style="font-size:14px;font-weight:700;color:${INK}">Your name</span>
              <input type="text" name="name" required autocomplete="name" autocapitalize="words" style="font:inherit;font-size:16px;padding:14px 15px;min-height:52px;border-radius:12px;border:1.5px solid rgba(11,18,32,0.16);background:#fff;color:${INK};outline:none;width:100%;box-sizing:border-box">
              <span data-error style="font-size:13px;color:#C2410C"></span>
            </label>
            <label style="display:flex;flex-direction:column;gap:7px">
              <span style="font-size:14px;font-weight:700;color:${INK}">Email</span>
              <input type="email" name="email" required autocomplete="email" inputmode="email" spellcheck="false" enterkeyhint="send" style="font:inherit;font-size:16px;padding:14px 15px;min-height:52px;border-radius:12px;border:1.5px solid rgba(11,18,32,0.16);background:#fff;color:${INK};outline:none;width:100%;box-sizing:border-box">
              <span data-error style="font-size:13px;color:#C2410C"></span>
            </label>

            <button type="submit" style="font:inherit;font-size:16.5px;font-weight:700;color:#fff;background:${BLUE};border:none;padding:15px 24px;min-height:54px;border-radius:14px;cursor:pointer;width:100%;box-shadow:0 14px 26px -12px rgba(27,171,229,0.65)">Show me my AI path &rarr;</button>
            <p data-form-status class="form-status" role="status" aria-live="polite" style="font-size:14px;margin:0"></p>
            <p style="font-size:12.5px;line-height:1.5;color:#8A93A1;margin:0">No obligation. We never share your details.</p>
          </form>

          <div id="quiz-thanks" hidden style="text-align:center;padding:8px 2px">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;background:rgba(27,171,229,0.12)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${BLUE}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg></span>
            <div style="font-size:20px;font-weight:800;letter-spacing:-0.025em;color:${INK};margin:14px 0 0">Thanks, we have got that.</div>
            <p style="font-size:15px;line-height:1.6;color:${GREY};margin:9px 0 0">One of our facilitators will be in touch to walk you through your AI learning path. If you would rather talk now, call <a href="tel:+61755861400" style="color:#1483B5;font-weight:700;text-decoration:none">(07) 5586 1400</a>.</p>
          </div>
        </div>
      </div>
    </div>
  </main>

  <footer style="border-top:1px solid rgba(11,18,32,0.08)">
    <div style="max-width:820px;margin:0 auto;padding:20px;display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between">
      <span style="font-size:13px;color:#8A93A1">&copy; ${new Date().getFullYear()} Ad On Group. All rights reserved.</span>
      <span style="display:flex;gap:18px;font-size:13px">
        <a href="/privacy-policy/" style="color:#8A93A1;text-decoration:none">Privacy Policy</a>
        <a href="/terms-and-conditions/" style="color:#8A93A1;text-decoration:none">Terms of Use</a>
      </span>
    </div>
  </footer>

  <style>
    .q-opt {
      font: inherit; font-size: 16px; line-height: 1.45; text-align: left;
      color: ${INK}; background: #fff;
      border: 1.5px solid rgba(11,18,32,0.14); border-radius: 14px;
      padding: 15px 17px; min-height: 54px; width: 100%; cursor: pointer;
      transition: border-color .15s ease, background .15s ease, transform .12s ease;
    }
    .q-opt:hover { border-color: ${BLUE}; background: rgba(27,171,229,0.04); }
    .q-opt:active { transform: scale(0.99); }
    .q-opt[aria-pressed="true"] { border-color: ${BLUE}; background: rgba(27,171,229,0.10); }
    .q-back {
      font: inherit; font-size: 14.5px; font-weight: 600; color: #8A93A1;
      background: none; border: none; padding: 8px 2px; cursor: pointer;
    }
    .q-back:hover { color: ${INK}; }

    /* Intake screens. 16px on the controls is deliberate: anything smaller and
       iOS Safari zooms the page when the field takes focus. */
    .q-field { display: flex; flex-direction: column; gap: 7px; }
    .q-field > span { font-size: 14px; font-weight: 700; color: ${INK}; }
    .q-field input, .q-field select {
      font: inherit; font-size: 16px; padding: 14px 15px; min-height: 54px;
      border-radius: 12px; border: 1.5px solid rgba(11,18,32,0.16);
      background: #fff; color: ${INK}; outline: none; width: 100%;
      box-sizing: border-box; appearance: none; -webkit-appearance: none;
    }
    .q-field select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2.5 4.5L6 8l3.5-3.5' fill='none' stroke='%235A6473' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 15px center;
      background-size: 13px; padding-right: 40px;
    }
    .q-field input:focus, .q-field select:focus { border-color: ${BLUE}; }
    .q-field[data-invalid="true"] input, .q-field[data-invalid="true"] select { border-color: #C2410C; }
    .q-err { font-size: 13px; color: #C2410C; margin: 0; }
    .q-next {
      font: inherit; font-size: 16.5px; font-weight: 700; color: #fff;
      background: ${BLUE}; border: none; padding: 15px 28px; min-height: 54px;
      border-radius: 14px; cursor: pointer;
      box-shadow: 0 14px 26px -12px rgba(27,171,229,0.65);
    }
    .q-skip {
      font: inherit; font-size: 14.5px; font-weight: 600; color: #8A93A1;
      background: none; border: none; padding: 8px 2px; cursor: pointer;
      text-decoration: underline;
    }
    .q-skip:hover { color: ${INK}; }
    @media (max-width: 820px) {
      .result-grid { grid-template-columns: 1fr !important; gap: 22px !important; }
      /* Form first on a phone: someone who has answered six questions came for
         the result, and the result is directly above it either way. */
      .result-grid > div:last-child { order: -1; }
    }
  </style>

  <script>
  (function () {
    "use strict";
    var QS = ${JSON.stringify(QUESTIONS.map((q) => q.id))};
    var BANDS = ${JSON.stringify(BANDS)};
    var step = 0, score = 0;
    var answers = {};
    var intake = { role: "", website: "", job_title: "", industry: "" };

    /* The run of screens for this visitor. The branch screen is spliced in once
       they say who they are, so the length (and the progress bar) is honest
       either way. Rebuilt if they go back and switch. */
    var flow = ["role"].concat(QS);

    var intro = document.getElementById("quiz-intro");
    var wrap = document.getElementById("quiz-questions");
    var result = document.getElementById("quiz-result");
    var bar = document.getElementById("quiz-bar");

    function screenEl(id) { return wrap.querySelector('.q-screen[data-screen="' + id + '"]'); }

    function show(i) {
      step = i;
      var all = wrap.querySelectorAll(".q-screen");
      for (var k = 0; k < all.length; k++) all[k].hidden = true;
      var el = screenEl(flow[i]);
      if (el) el.hidden = false;
      bar.style.width = Math.round((i / flow.length) * 100) + "%";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function next() {
      if (step + 1 >= flow.length) finish();
      else show(step + 1);
    }

    document.getElementById("quiz-start").addEventListener("click", function () {
      intro.hidden = true;
      wrap.hidden = false;
      show(0);
    });

    // A website only has to be plausible. Anything stricter rejects real input
    // (no protocol, a trailing path) for no gain: a human reads this later.
    function plausibleSite(v) {
      var host = v.trim().replace(/^https?:\\/\\//i, "").split("/")[0];
      return /^[a-z0-9][a-z0-9.-]*\\.[a-z]{2,}$/i.test(host);
    }

    function readIntake(el, opts) {
      var ok = true;
      var fields = el.querySelectorAll("[data-intake]");
      for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        var name = f.getAttribute("data-intake");
        var val = (f.value || "").trim();
        var box = f.closest(".q-field");
        var err = box && box.querySelector("[data-err]");
        if (err) err.textContent = "";
        if (box) box.removeAttribute("data-invalid");

        // Empty is allowed everywhere: the screen is skippable by design. Only
        // something typed gets checked, and only the website can be malformed.
        if (opts.validate && val && name === "website" && !plausibleSite(val)) {
          if (err) err.textContent = "That does not look like a website address.";
          if (box) box.setAttribute("data-invalid", "true");
          ok = false;
          continue;
        }
        intake[name] = opts.clear ? "" : val;
        if (opts.clear) f.value = "";
      }
      return ok;
    }

    wrap.addEventListener("click", function (e) {
      var opt = e.target.closest(".q-opt");
      if (opt) {
        var q = opt.getAttribute("data-q");
        // going back and changing an answer must not double-count
        if (answers[q]) score -= answers[q].pts;
        answers[q] = { text: opt.getAttribute("data-answer"), pts: Number(opt.getAttribute("data-pts")) };
        score += answers[q].pts;

        var sibs = opt.parentElement.querySelectorAll(".q-opt");
        for (var i = 0; i < sibs.length; i++) sibs[i].setAttribute("aria-pressed", sibs[i] === opt ? "true" : "false");

        var branch = opt.getAttribute("data-role");
        if (branch) {
          intake.role = opt.getAttribute("data-answer");
          // Switching branch must not leave the other branch's answers behind.
          var drop = screenEl(branch === "business" ? "individual" : "business");
          if (drop) readIntake(drop, { clear: true });
          flow = ["role", branch].concat(QS);
        }

        setTimeout(next, 180);
        return;
      }

      var cont = e.target.closest(".q-next");
      if (cont) {
        var scr = cont.closest(".q-screen");
        if (readIntake(scr, { validate: true })) next();
        return;
      }

      var skip = e.target.closest(".q-skip");
      if (skip) {
        readIntake(skip.closest(".q-screen"), { clear: true });
        next();
        return;
      }

      if (e.target.closest(".q-back")) show(Math.max(0, step - 1));
    });

    function finish() {
      bar.style.width = "100%";
      wrap.hidden = true;
      result.hidden = false;

      var band = BANDS[BANDS.length - 1];
      for (var i = 0; i < BANDS.length; i++) if (score <= BANDS[i].max) { band = BANDS[i]; break; }
      document.getElementById("band-title").textContent = band.title;
      document.getElementById("band-line").textContent = band.line;

      var set = function (id, v) { var el = document.getElementById(id); if (el) el.value = v; };
      set("f-score", String(score));
      set("f-band", band.title);
      set("f-role", intake.role);
      set("f-website", intake.website);
      set("f-job_title", intake.job_title);
      set("f-industry", intake.industry);
      QS.forEach(function (q) { set("f-" + q, answers[q] ? answers[q].text : ""); });

      // Carry the ad's tracking through so a lead can be traced to its creative.
      var p = new URLSearchParams(window.location.search);
      ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach(function (k) {
        set("f-" + k, p.get(k) || "");
      });

      if (typeof window.gtag === "function") {
        window.gtag("event", "quiz_complete", { score: score, band: band.title });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  })();
  </script>
`;

const html = `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Are You Ready for AI? | Ad On AI</title>
<meta name="description" content="Six questions, about a minute. Find out where you stand with AI and what to do next.">
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

const dir = path.join(PUBLIC, "ai-quiz");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "index.html"), html);
console.log(`  wrote ai-quiz/index.html  (${html.length} bytes)`);
console.log(`  ${QUESTIONS.length} questions, ${BANDS.length} result bands, max score ${QUESTIONS.reduce((s, q) => s + Math.max(...q.a.map((a) => a[1])), 0)}`);
