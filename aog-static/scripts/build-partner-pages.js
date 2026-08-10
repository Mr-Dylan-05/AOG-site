#!/usr/bin/env node
/**
 * build-partner-pages.js — generate /partners/ and /partners/submit/.
 *
 * These are DRAFTS. Both carry <meta name="robots" content="noindex">, which
 * also keeps them out of the sitemap (src/_data/staticPages.js already skips
 * noindex pages), and neither is linked from the navigation.
 *
 * The page shell — head, fonts, the three <style> blocks, the Ad On Group nav
 * bar and the footer — is lifted verbatim from public/contact-us/index.html at
 * generation time rather than retyped, so the chrome cannot drift from the rest
 * of the site. Only the body content below is new, and it is built from the
 * conventions already in use:
 *
 *   section shell   max-width:1200px; margin:0 auto; padding:88px 28px 96px
 *   eyebrow         JetBrains Mono 12px, 0.16em tracking, #1BABE5, uppercase,
 *                   preceded by a 22x1.5px rule
 *   heading         black with a single #1BABE5 highlight phrase
 *   body            15-17px, line-height 1.6-1.7, #5A6473
 *   card            radius 18-20px, 1px rgba(11,18,32,0.08) border, soft shadow
 *   accordion       <details class="aoa-faq"> with the rotating plus icon
 *   form            label/input pairs, glass panel, _gotcha honeypot,
 *                   data-contact-form for the shared validation script
 *
 * Usage:  node scripts/build-partner-pages.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const SHELL_SRC = path.join(PUBLIC, "contact-us", "index.html");

const shell = fs.readFileSync(SHELL_SRC, "utf8");

/** The <style> blocks and font preloads the design pages rely on. */
function headAssets(html) {
  const head = html.slice(0, html.indexOf("</head>"));
  const preloads = head.match(/<link rel="preload"[^>]*>/g) || [];
  const styles = head.match(/<style>[\s\S]*?<\/style>/g) || [];
  return preloads.join("\n") + "\n" + styles.join("\n");
}

function between(html, startRe, tag) {
  const at = html.search(startRe);
  if (at === -1) return "";
  const re = new RegExp(`<${tag}\\b|</${tag}>`, "gi");
  re.lastIndex = at;
  let depth = 0, m;
  while ((m = re.exec(html)) !== null) {
    depth += m[0][1] === "/" ? -1 : 1;
    if (depth === 0) return html.slice(at, m.index + m[0].length);
  }
  return "";
}

const HEAD_ASSETS = headAssets(shell);
const NAV = between(shell.slice(shell.indexOf("<body")), /<nav\b/, "nav");
const FOOTER = between(shell, /<footer\b/, "footer");
const WRAP_OPEN =
  '<div style="max-width:100%;overflow-x:clip;background:transparent;position:relative">';

/* ------------------------------------------------------------- primitives */

const eyebrow = (text) =>
  `<span style="display:inline-flex;align-items:center;gap:10px;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.16em;color:#1BABE5;text-transform:uppercase;font-weight:600"><span style="width:22px;height:1.5px;background:#1BABE5"></span>${text}</span>`;

/** Section heading: black, with one blue highlight phrase. */
const h2 = (plain, highlight, tail = ".") =>
  `<h2 style="font-size:clamp(24px,3vw,38px);line-height:1.12;letter-spacing:-0.03em;font-weight:600;color:#0B1220;margin:14px 0 0">${plain} <span style="color:#1BABE5">${highlight}</span>${tail}</h2>`;

const lede = (text) =>
  `<p style="font-size:16.5px;line-height:1.7;color:#5A6473;margin:18px 0 0;max-width:660px">${text}</p>`;

const CARD =
  "background:#fff;border:1px solid rgba(11,18,32,0.08);border-radius:20px;padding:28px 26px;box-shadow:0 20px 46px -30px rgba(11,18,32,0.30)";

const INPUT =
  "font:inherit;font-size:15px;padding:12px 14px;border-radius:11px;border:1px solid rgba(11,18,32,0.14);background:#fff;color:#0B1220;outline:none";

const LABEL = 'style="display:flex;flex-direction:column;gap:7px"';
const LABEL_TEXT =
  'style="font-size:13.5px;font-weight:700;letter-spacing:-0.01em;color:#0B1220"';

const field = (label, input, hint) =>
  `<label ${LABEL}><span ${LABEL_TEXT}>${label}</span>${input}${
    hint ? `<span style="font-size:12.5px;color:#8A93A1">${hint}</span>` : ""
  }<span data-error style="font-size:12.5px;color:#C2410C"></span></label>`;

const HONEYPOT =
  '<input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">';

const submitBtn = (text) =>
  `<button type="submit" style="font:inherit;font-size:15px;font-weight:700;color:#fff;background:#0B1220;border:none;padding:14px 26px;border-radius:14px;cursor:pointer;align-self:flex-start;transition:transform .2s ease, box-shadow .2s ease">${text} &rarr;</button>`;

const FORM_PANEL =
  "background:rgba(255,255,255,0.66);backdrop-filter:blur(20px) saturate(150%);-webkit-backdrop-filter:blur(20px) saturate(150%);border:1px solid rgba(255,255,255,0.85);box-shadow:0 24px 60px -34px rgba(11,18,32,0.34);border-radius:20px;padding:30px 28px;display:flex;flex-direction:column;gap:16px";

/** A clearly marked slot for content that is not ours to write. */
const placeholder = (title, note) =>
  `<div data-placeholder style="border:2px dashed rgba(27,171,229,0.55);background:rgba(27,171,229,0.05);border-radius:14px;padding:20px 22px;margin:22px 0 0">
        <div style="font-family:'JetBrains Mono',monospace;font-size:11.5px;letter-spacing:0.14em;text-transform:uppercase;color:#1483B5;font-weight:600">Placeholder &middot; ${title}</div>
        <p style="font-size:14.5px;line-height:1.6;color:#5A6473;margin:9px 0 0">${note}</p>
      </div>`;

function page({ title, description, body }) {
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="noindex">
${HEAD_ASSETS}
</head>
<body>

${WRAP_OPEN}

${NAV}

${body}

${FOOTER}
</div>
</body>
</html>
`;
}

/* ------------------------------------------------------ page 1: /partners/ */

const HOW_IT_WORKS = [
  ["01", "Register", "Fill in the form below. We set you up as a partner and send you your referral link."],
  ["02", "Refer", "Send us the business through the partner form. We take it from there and contact them directly."],
  ["03", "Get paid", "$500 ex GST for every seat they enrol, paid once their payment clears."],
];

const SUITS = [
  "Accountants",
  "Bookkeepers",
  "Business coaches",
  "HR consultants",
  "IT providers",
  "Anyone advising Australian small and medium businesses",
];

const FAQS = [
  ["When do I get paid?", "Once the client's payment for their seats has cleared. We pay by bank transfer, and you invoice us or we self-bill, whichever suits you."],
  ["What counts as a referral?", "A business you introduce to us that we had not already spoken to. Submit them through the partner form and the referral is recorded against your name from that point."],
  ["What if two partners refer the same business?", "The first submission recorded wins. If both arrive close together we will talk to both of you before anything is paid, rather than deciding quietly."],
  ["Do I need to sell anything?", "No. Send us the introduction and we do the rest. You are not expected to explain the program, quote on it, or handle objections."],
  ["Is there a cap on what I can earn?", "No cap. The fee is per seat, so a partner who refers a handful of larger businesses can earn considerably more than one who refers many single-seat clients."],
];

const partnerTypeCard = (kind, blurb, points, highlight) => `
        <div style="${CARD}${highlight ? ";border-color:rgba(27,171,229,0.40)" : ""}">
          <div style="font-size:19px;font-weight:800;letter-spacing:-0.02em;color:#0B1220">${kind}</div>
          <p style="font-size:15px;line-height:1.65;color:#5A6473;margin:10px 0 0">${blurb}</p>
          <div style="display:flex;flex-direction:column;gap:11px;margin:20px 0 0">
            ${points
              .map(
                (p) => `<div style="display:flex;align-items:flex-start;gap:11px">
              <span style="flex:none;width:22px;height:22px;border-radius:7px;background:#1BABE5;display:inline-flex;align-items:center;justify-content:center;margin-top:1px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg></span>
              <span style="font-size:15px;line-height:1.45;color:#1F2733">${p}</span>
            </div>`
              )
              .join("\n            ")}
          </div>
        </div>`;

const partnersBody = `
  <section style="max-width:1200px;margin:0 auto;padding:76px 28px 40px">
    <div style="display:grid;grid-template-columns:1.05fr 0.95fr;gap:56px;align-items:center">
      <div>
        ${eyebrow("Partner Program")}
        <h1 style="font-size:clamp(34px,4.8vw,62px);line-height:1.0;letter-spacing:-0.045em;font-weight:600;color:#0B1220;margin:18px 0 0">Earn <span style="color:#1BABE5">$500 per seat</span> you refer.</h1>
        <p style="font-size:17px;line-height:1.65;color:#4A5462;margin:22px 0 0;max-width:520px">Refer a business to the Ad On AI program and we pay you $500 ex GST for every staff member they enrol. You make the introduction, we do the rest.</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:30px">
          <a href="#signup" style="text-decoration:none;font-size:16px;font-weight:700;color:#fff;background:#1BABE5;padding:15px 28px;border-radius:14px;display:inline-flex;align-items:center;gap:9px;box-shadow:0 14px 26px -10px rgba(27,171,229,0.6);transition:transform .22s ease, box-shadow .22s ease">Become a partner <span style="font-size:17px">&rarr;</span></a>
          <a href="/partners/submit/" style="text-decoration:none;font-size:16px;font-weight:700;color:#0B1220;background:rgba(255,255,255,0.7);border:1px solid rgba(11,18,32,0.1);padding:15px 28px;border-radius:14px;display:inline-flex;align-items:center">Already a partner? Submit a referral</a>
        </div>
      </div>
      <div class="aog-m-autoh" style="position:relative;display:flex;justify-content:center;align-items:center;min-height:360px">
        <div style="${CARD};width:100%;max-width:420px">
          <div style="font-family:'JetBrains Mono',monospace;font-size:11.5px;letter-spacing:0.14em;text-transform:uppercase;color:#8A93A1;font-weight:600">What one referral pays</div>
          <div style="display:flex;align-items:baseline;gap:10px;margin:14px 0 0">
            <span style="font-size:44px;font-weight:800;letter-spacing:-0.04em;color:#1BABE5;line-height:1">$2,000</span>
            <span style="font-size:14.5px;color:#5A6473">ex GST</span>
          </div>
          <p style="font-size:14.5px;line-height:1.6;color:#5A6473;margin:12px 0 0">A client who enrols four staff. The fee is per seat, so it scales with the size of the business you introduce.</p>
        </div>
      </div>
    </div>
  </section>

  <section style="max-width:1200px;margin:0 auto;padding:64px 28px 40px">
    ${eyebrow("How it works")}
    ${h2("Three steps, and only one of them is", "yours")}
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin:34px 0 0">
      ${HOW_IT_WORKS.map(
        ([n, t, d]) => `<div style="${CARD}">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;background:rgba(27,171,229,0.10);color:#1483B5;font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700">${n}</span>
        <div style="font-size:18px;font-weight:800;letter-spacing:-0.02em;color:#0B1220;margin:16px 0 0">${t}</div>
        <p style="font-size:15px;line-height:1.62;color:#5A6473;margin:9px 0 0">${d}</p>
      </div>`
      ).join("\n      ")}
    </div>
  </section>

  <section style="max-width:1200px;margin:0 auto;padding:56px 28px 40px">
    ${eyebrow("What it's worth")}
    ${h2("The fee is per seat, not", "per client")}
    ${lede(
      "Most businesses that take on the program enrol more than one person. Every one of those seats pays you $500 ex GST, so a single introduction can be worth several times the headline number."
    )}
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin:30px 0 0">
      ${[
        ["1 seat", "$500"],
        ["2 seats", "$1,000"],
        ["4 seats", "$2,000"],
        ["10 seats", "$5,000"],
      ]
        .map(
          ([seats, fee]) => `<div style="${CARD};padding:22px 20px">
        <div style="font-size:13px;font-weight:700;letter-spacing:0.02em;color:#8A93A1;text-transform:uppercase;font-family:'JetBrains Mono',monospace">${seats}</div>
        <div style="font-size:30px;font-weight:800;letter-spacing:-0.03em;color:#0B1220;margin:8px 0 0">${fee}</div>
        <div style="font-size:13px;color:#8A93A1;margin:4px 0 0">ex GST</div>
      </div>`
        )
        .join("\n      ")}
    </div>
  </section>

  <section style="max-width:1200px;margin:0 auto;padding:56px 28px 40px">
    ${eyebrow("Two ways to join")}
    ${h2("Pick whichever fits how you", "operate")}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:34px 0 0">
      ${partnerTypeCard(
        "Individual",
        "For anyone who wants to pass on a name without taking on an arrangement to manage.",
        [
          "$500 ex GST per enrolled seat",
          "No agreement to manage",
          "No ongoing commitment or targets",
        ],
        false
      )}
      ${partnerTypeCard(
        "Business partner",
        "For firms who want the relationship visible to their own clients.",
        [
          "$500 ex GST per enrolled seat, the same rate",
          "Official Ad On AI Partner badge for your site and marketing",
          "Listing in the Ad On AI partner directory",
        ],
        true
      )}
    </div>
  </section>

  <section style="max-width:1200px;margin:0 auto;padding:56px 28px 40px">
    ${eyebrow("Who this suits")}
    ${h2("If you already advise Australian businesses, this", "fits")}
    ${lede(
      "The partners this works best for are the people a business owner already trusts. You are not being asked to become a salesperson for us."
    )}
    <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:flex-start;max-width:1000px;margin:26px 0 0">
      ${SUITS.map(
        (s) =>
          `<span style="display:inline-flex;align-items:center;font-size:14.5px;font-weight:600;color:#1483B5;background:rgba(27,171,229,0.07);border:1px solid rgba(27,171,229,0.28);padding:10px 18px;border-radius:999px">${s}</span>`
      ).join("\n      ")}
    </div>
  </section>

  <section style="max-width:900px;margin:0 auto;padding:56px 28px 40px">
    ${eyebrow("Questions")}
    ${h2("The things partners ask", "first")}
    <div style="margin:32px 0 0">
      ${FAQS.map(
        ([q, a]) => `<details class="aoa-faq">
        <summary>${q}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg></summary>
        <div>${a}</div>
      </details>`
      ).join("\n      ")}
    </div>
  </section>

  <section id="signup" style="max-width:760px;margin:0 auto;padding:56px 28px 96px">
    ${eyebrow("Register")}
    ${h2("Become an Ad On AI", "partner")}
    ${lede("Fill this in and we will set you up. If anything is unclear, call (07) 5586 1400.")}

    <form data-contact-form data-form="partner" onsubmit="return false" style="${FORM_PANEL};margin:28px 0 0">
      ${HONEYPOT}
      <input type="hidden" name="_subject" value="New Ad On AI partner registration">

      ${field("Full name", `<input type="text" name="fullName" required autocomplete="name" style="${INPUT}">`)}
      ${field("Email", `<input type="email" name="email" required autocomplete="email" style="${INPUT}">`)}
      ${field("Phone", `<input type="tel" name="phone" required autocomplete="tel" style="${INPUT}">`)}

      <fieldset style="border:none;padding:0;margin:0;display:flex;flex-direction:column;gap:9px">
        <legend ${LABEL_TEXT.replace('style="', 'style="padding:0;')}>Partner type</legend>
        <div style="display:flex;flex-wrap:wrap;gap:10px">
          <label style="display:inline-flex;align-items:center;gap:9px;font-size:15px;color:#1F2733;background:#fff;border:1px solid rgba(11,18,32,0.14);border-radius:11px;padding:11px 16px;cursor:pointer">
            <input type="radio" name="partnerType" value="Individual" required checked> Individual
          </label>
          <label style="display:inline-flex;align-items:center;gap:9px;font-size:15px;color:#1F2733;background:#fff;border:1px solid rgba(11,18,32,0.14);border-radius:11px;padding:11px 16px;cursor:pointer">
            <input type="radio" name="partnerType" value="Business"> Business
          </label>
        </div>
        <span data-error style="font-size:12.5px;color:#C2410C"></span>
      </fieldset>

      <div data-when-business hidden>
        ${field("Business name", `<input type="text" name="businessName" autocomplete="organization" style="${INPUT}">`)}
      </div>

      ${field("Website", `<input type="url" name="website" placeholder="https://" autocomplete="url" style="${INPUT}">`, "Optional")}
      ${field(
        "How you'll refer",
        `<textarea name="howRefer" rows="3" style="${INPUT};resize:vertical"></textarea>`,
        "Optional. A sentence on who you work with is plenty."
      )}

      <label style="display:flex;align-items:flex-start;gap:11px;font-size:14.5px;line-height:1.55;color:#1F2733">
        <input type="checkbox" name="acceptTerms" required style="margin-top:3px;flex:none">
        <span>I accept the <a href="/partners/terms/" style="color:#1483B5;font-weight:600">Ad On AI Partner Terms</a>.<span data-error style="display:block;font-size:12.5px;color:#C2410C"></span></span>
      </label>

      ${submitBtn("Register as a partner")}
      <p data-form-status class="form-status" role="status" aria-live="polite" style="font-size:14.5px;margin:0"></p>
    </form>

    ${placeholder(
      "Partner terms",
      "The partner agreement and T&amp;Cs are being drafted separately. The checkbox above links to /partners/terms/, which does not exist yet. Replace that link, and put the agreed terms on that page, before this goes live."
    )}
  </section>

  <script>
  /* Business name is only asked for when Business is selected. Plain listener,
     no dependency, and the field is hidden rather than removed so the value
     survives a partner switching back and forth. */
  (function () {
    var wrap = document.querySelector("[data-when-business]");
    if (!wrap) return;
    var input = wrap.querySelector("input");
    function sync() {
      var business = document.querySelector('input[name="partnerType"][value="Business"]');
      var on = business && business.checked;
      wrap.hidden = !on;
      if (input) input.required = !!on;
    }
    document.querySelectorAll('input[name="partnerType"]').forEach(function (r) {
      r.addEventListener("change", sync);
    });
    sync();
  })();
  </script>
`;

/* ------------------------------------------------ page 2: /partners/submit/ */

const submitBody = `
  <section style="max-width:760px;margin:0 auto;padding:76px 28px 96px">
    ${eyebrow("Partner referral")}
    <h1 style="font-size:clamp(30px,4vw,52px);line-height:1.02;letter-spacing:-0.045em;font-weight:600;color:#0B1220;margin:18px 0 0">Submit a <span style="color:#1BABE5">referral</span>.</h1>
    <p style="font-size:16.5px;line-height:1.7;color:#5A6473;margin:18px 0 0">We contact the business directly and take it from there. You do not need to sell anything, explain the program, or answer questions about it.</p>

    <form data-contact-form data-form="referral" onsubmit="return false" style="${FORM_PANEL};margin:30px 0 0">
      ${HONEYPOT}
      <input type="hidden" name="_subject" value="New Ad On AI partner referral">

      <div style="font-family:'JetBrains Mono',monospace;font-size:11.5px;letter-spacing:0.14em;text-transform:uppercase;color:#8A93A1;font-weight:600">Your details</div>
      ${field("Your name", `<input type="text" name="partnerName" required autocomplete="name" style="${INPUT}">`)}
      ${field(
        "Your email",
        `<input type="email" name="partnerEmail" required autocomplete="email" style="${INPUT}">`,
        "Use the same address you registered with so we can match this to your partner record."
      )}

      <div style="height:1px;background:rgba(11,18,32,0.08);margin:6px 0"></div>

      <div style="font-family:'JetBrains Mono',monospace;font-size:11.5px;letter-spacing:0.14em;text-transform:uppercase;color:#8A93A1;font-weight:600">Who you're referring</div>
      ${field("Contact name", `<input type="text" name="referralName" required style="${INPUT}">`)}
      ${field("Business name", `<input type="text" name="referralBusiness" required style="${INPUT}">`)}
      ${field("Contact email", `<input type="email" name="referralEmail" required style="${INPUT}">`)}
      ${field("Contact phone", `<input type="tel" name="referralPhone" required style="${INPUT}">`)}
      ${field(
        "Roughly how many staff would enrol",
        `<input type="text" name="seatEstimate" style="${INPUT}" placeholder="A rough number is fine">`,
        "Optional. It helps us size the conversation."
      )}
      ${field("Your relationship to them", `<input type="text" name="relationship" style="${INPUT}" placeholder="Client, colleague, former client">`, "Optional")}
      ${field(
        "Anything we should know before we call",
        `<textarea name="notes" rows="3" style="${INPUT};resize:vertical"></textarea>`,
        "Optional"
      )}

      ${submitBtn("Submit referral")}
      <p data-form-status class="form-status" role="status" aria-live="polite" style="font-size:14.5px;margin:0"></p>
    </form>

    <p style="font-size:14.5px;line-height:1.6;color:#8A93A1;margin:20px 0 0">Not a partner yet? <a href="/partners/" style="color:#1483B5;font-weight:600">Register here</a> first so we can match your referrals to you.</p>
  </section>
`;

/* ------------------------------------------------------------------ write */

const targets = [
  {
    dir: path.join(PUBLIC, "partners"),
    html: page({
      title: "Partner Program | Ad On AI",
      description:
        "Refer a business to the Ad On AI program and earn $500 ex GST for every seat they enrol. For accountants, bookkeepers, coaches and consultants advising Australian businesses.",
      body: partnersBody,
    }),
  },
  {
    dir: path.join(PUBLIC, "partners", "submit"),
    html: page({
      title: "Submit a Referral | Ad On AI Partner Program",
      description:
        "Ad On AI partners: submit a referral. We contact the business directly, so you do not need to sell anything.",
      body: submitBody,
    }),
  },
];

for (const t of targets) {
  fs.mkdirSync(t.dir, { recursive: true });
  fs.writeFileSync(path.join(t.dir, "index.html"), t.html);
  console.log(`  wrote ${path.relative(PUBLIC, path.join(t.dir, "index.html"))}  (${t.html.length} bytes)`);
}
console.log("\nBoth pages are noindex drafts and are not linked from the navigation.");
