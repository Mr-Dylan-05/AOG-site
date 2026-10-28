// Builds brochure.html: the one-page AI Enablement pricing brochure. Not on the website.
// Same layout as scripts/intermediate-pricing (AI Intermediate) so the two read as a pair, with
// the inclusions of scripts/pricing-brochure (the older full-program brochure): 24 modules up to
// AI agents, $2,500 + $200/mo, 2 support hours, the live webinar. Audience-neutral ("you"), ex GST.
//
// Usage:
//   node scripts/enablement-pricing/build.js [page height, default 560mm]
//   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
//     --no-pdf-header-footer --print-to-pdf=scripts/enablement-pricing/AI-Enablement-Pricing-Brochure.pdf \
//     scripts/enablement-pricing/brochure.html
const fs = require("fs");
const A = "../../public/assets";

const upfront = [
  "All 24 modules &amp; platform access",
  "Hands-on lessons, taught on your own tasks",
  "Lifetime academy access*",
  "Progress reporting for managers",
];

// Support isn't in the program fee: it comes with the monthly membership, alongside the community.
const ongoing = [
  "2 hours of one-on-one support every month",
  "A monthly live webinar on what&rsquo;s new in AI",
  "Community: masterclasses, podcasts, a newsletter and a peer network",
];

// What membership gives members. Wording follows /ongoing-support.
const community = [
  ["Monthly", "One-on-one support", "Two hours with our AI specialists each month, for your questions and the trickier workflows."],
  ["Monthly", "Live AI trends webinar", "One hour on what&rsquo;s actually changed: new models, releases and the skills worth adopting. Recorded if you can&rsquo;t make it."],
  ["Per tool", "Tool masterclasses", "Focused sessions on each new tool worth your time, built around real business use. Recorded and kept in the academy."],
  ["Weekly", "Business podcasts", "Short, practical episodes on how real businesses are putting AI to work."],
  ["Monthly", "The newsletter", "A round-up of what changed and what&rsquo;s worth your attention, in plain English."],
  ["Always on", "A peer network", "Other people from Australian businesses who use AI heavily in their own work. Compare notes and swap what works."],
];

const why = [
  ["The complete program", "24 modules across three topics: the essentials, automation and AI agents. Nothing left out."],
  ["Built three times over", "You build each skill, workflow and agent three times, on three different jobs, so it sticks."],
  ["Your own AI helpers, not just better prompts", "Skills, automations and agents that do real tasks for you."],
  ["Skills that outlast the tools", "What you learn works in whatever AI tool comes next."],
];

const topics = [
  ["The essential skills", "Modules 1&ndash;8", "Use AI properly: give it clear instructions, check its work, connect it to your email, calendar and files, and set it up so it already knows your work."],
  ["Automation", "Modules 9&ndash;16", "Hand over the jobs you repeat every week. Turn them into skills AI runs on demand, then put them on a schedule."],
  ["AI agents", "Modules 17&ndash;24", "Let AI handle whole jobs. Plan an agent, build it, launch it, then add more and put a lead agent in charge."],
];

const guarantee = [
  ["5&ndash;6", "Ready&#8209;made prompts for your main tasks"],
  ["3&times;", "AI skills built around your job"],
  ["3&times;", "AI tasks using images, docs &amp; screenshots"],
  ["3&times;", "Workflows AI runs start to finish"],
  ["3&times;", "AI agents doing real work"],
  ["1&times;", "Lead agent running the others"],
  ["1&times;", "Job running on a schedule"],
  ["1&times;", "Browser job handed over to AI"],
  ["1&times;", "Skill that builds new skills"],
];

const faqs = [
  ["How is this different from AI Intermediate?", "It&rsquo;s our complete program. AI Intermediate builds each thing once and stops at scheduled tasks. AI Enablement builds each one three times over, then goes on to AI agents."],
  ["Can I join the community without finishing the course?", "No, the course needs to be completed first."],
  ["Can I cancel?", "Yes, you can cancel your membership any time. That ends your support, community and academy access, and a re&#8209;joining fee applies if you come back later."],
  ["Can I transfer my membership?", "No. It includes lifetime access to the Ad On AI Academy*, so it can&rsquo;t be transferred."],
  ["How do I book my one-on-one support?", "It comes with your membership. Book through the calendar link in your platform, in sessions of at least 1 hour."],
  ["Do unused support hours roll over?", "No. The 2 hours are use-it-or-lose-it each month. If you need more, extra support is $300 per hour, ex GST."],
  ["Is the platform secure?", "Yes, all features and content are hosted securely."],
  ["When do my entitlements begin?", "From the day you start your course."],
];

const tick = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#5db4f2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.2 4.2L19 7"/></svg>`;

const html = `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<title>AI Enablement | Ad On AI</title>
<style>
  @font-face{font-family:'Inter Tight';src:url('${A}/design/fonts/intertight.woff2') format('woff2');font-weight:400 800}
  @font-face{font-family:'JetBrains Mono';src:url('${A}/design/fonts/jetbrainsmono-500.woff2') format('woff2');font-weight:500}
  @page{size:210mm PAGEH;margin:0}
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;background:#070b14}
  body{width:210mm;font-family:'Inter Tight','Helvetica Neue',Arial,sans-serif;color:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .wrap{position:relative;overflow:hidden;background:
      radial-gradient(70% 22% at 85% 4%,rgba(60,140,220,.22),transparent 70%),
      radial-gradient(60% 14% at 0% 44%,rgba(40,100,200,.14),transparent 70%),
      radial-gradient(70% 16% at 100% 74%,rgba(40,110,210,.13),transparent 70%),#070b14}
  section{padding:0 14mm}
  .eb{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;color:#5db4f2;margin:0 0 10px}
  h2{font-size:26px;line-height:1.1;letter-spacing:-.02em;font-weight:800;margin:0}
  .sub{font-size:13px;line-height:1.55;color:#9aa6b8;margin:8px 0 0;max-width:140mm}
  .card{background:rgba(255,255,255,.035);border:1px solid rgba(150,190,235,.14);border-radius:14px}
  .rule{height:1px;background:rgba(150,190,235,.12);margin:11mm 0 9mm}

  .top{display:flex;justify-content:space-between;align-items:center;padding:12mm 14mm 0}
  .brand{display:flex;align-items:center;gap:8px;font-weight:800;font-size:14px;letter-spacing:.02em}
  .brand img{width:26px;height:26px}
  .pill{display:flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.18em;text-transform:uppercase;color:#c9d4e3;border:1px solid rgba(150,190,235,.25);border-radius:99px;padding:4px 12px 4px 7px}
  .pill img{width:16px;height:16px}

  .hero{display:grid;grid-template-columns:1.2fr .8fr;gap:6mm;align-items:center;margin-top:8mm}
  h1{font-size:38px;line-height:1.06;letter-spacing:-.025em;font-weight:800;margin:0}
  h1 span{color:#5db4f2}
  .lede{font-size:13.5px;line-height:1.55;color:#aab5c5;margin:12px 0 0}
  .hero img{width:100%;max-width:62mm;display:block;margin:0 auto;filter:drop-shadow(0 18px 40px rgba(40,120,220,.35))}

  .price{margin-top:8mm;padding:6mm 6.5mm;display:grid;grid-template-columns:1fr auto 1fr;gap:6mm;
    background:linear-gradient(135deg,rgba(60,140,230,.20),rgba(30,70,140,.12));border:1px solid rgba(110,180,245,.35);border-radius:16px}
  .price .plus{align-self:center;font-size:24px;font-weight:300;color:#5db4f2}
  .lab{font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.2em;text-transform:uppercase;color:#8fc6f2}
  .amt{font-size:32px;font-weight:800;letter-spacing:-.03em;margin:4px 0 0}
  .amt small{font-size:15px;font-weight:700;color:#cfe3f7}
  .per{font-size:11px;color:#9aa6b8;margin:2px 0 10px}
  .price ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}
  .price li{display:flex;gap:8px;align-items:baseline;font-size:12px;line-height:1.4;color:#dfe7f1}
  .price li svg{flex:none;position:relative;top:1px}
  .tools{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:5mm}
  .tools b{font-size:11px;font-weight:600;color:#9aa6b8;margin-right:4px}
  .tools span{font-size:11px;font-weight:600;color:#dfe7f1;border:1px solid rgba(150,190,235,.2);border-radius:99px;padding:4px 10px}
  .tag{font-style:italic;font-size:12px;color:#9aa6b8;margin-left:auto}

  .why{display:grid;grid-template-columns:1fr 1fr;gap:3.5mm;margin-top:6mm}
  .why .card{padding:4.5mm 5mm}
  .why h3,.steps h3{font-size:14.5px;font-weight:700;letter-spacing:-.01em;margin:0 0 4px}
  .why p,.steps p{font-size:12px;line-height:1.5;color:#9aa6b8;margin:0}

  .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:3.5mm;margin-top:6mm}
  .steps .card{padding:5mm;background:linear-gradient(180deg,rgba(60,130,220,.14),rgba(255,255,255,.02))}
  .steps .n{font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.2em;text-transform:uppercase;color:#8fc6f2}
  .steps h3{font-size:17px;margin:6px 0 1px}
  .steps .t{font-size:11.5px;font-weight:600;color:#5db4f2;margin:0 0 8px}

  .comm{display:grid;grid-template-columns:repeat(6,1fr);gap:3.5mm;margin-top:6mm}
  .comm .card{grid-column:span 2;padding:4.5mm 5mm}
  .comm .n{font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.2em;text-transform:uppercase;color:#8fc6f2}
  .comm h3{font-size:14.5px;font-weight:700;letter-spacing:-.01em;margin:5px 0 4px}
  .comm p{font-size:12px;line-height:1.5;color:#9aa6b8;margin:0}

  .guar{display:grid;grid-template-columns:repeat(3,1fr);gap:2.6mm;margin-top:6mm}
  .guar .card{display:flex;align-items:center;gap:10px;padding:3.2mm 4mm;border-radius:11px}
  .guar b{flex:none;min-width:30px;font-size:16px;font-weight:800;color:#5db4f2}
  .guar span{font-size:11.5px;line-height:1.35;color:#dfe7f1}
  .more{margin-top:2.6mm;padding:3.2mm 4mm;display:flex;gap:10px;align-items:center;border-left:2px solid #5db4f2}
  .more b{font-size:16px;color:#5db4f2}
  .more span{font-size:11.5px;color:#aab5c5}

  .faq{display:grid;grid-template-columns:1fr 1fr;gap:5mm 9mm;margin-top:6mm}
  .faq h4{font-size:13px;font-weight:700;margin:0 0 3px;letter-spacing:-.005em}
  .faq p{font-size:11.5px;line-height:1.5;color:#9aa6b8;margin:0}

  .cta{margin-top:11mm;padding:9mm 14mm 7mm;display:flex;align-items:center;justify-content:space-between;gap:8mm;
    background:linear-gradient(90deg,#0d1a2e,#0b1628);border-top:1px solid rgba(150,190,235,.14)}
  .cta h2{font-size:22px}
  .cta .c{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:#8fc6f2;margin-top:6px}
  .btn{flex:none;background:#5db4f2;color:#06101e;border-radius:12px;padding:5mm 8mm;font-size:14px;font-weight:700;text-align:center;line-height:1.3}
  .btn small{display:block;font-size:12px;font-weight:600;opacity:.8}
  .fine{margin:0;padding:0 14mm 7mm;background:#0c1729;font-size:9.5px;color:#7d8aa0}
</style>
</head>
<body>
<div class="wrap" id="wrap">
  <div class="top">
    <div class="brand"><img src="${A}/design/adon-logo.png" alt="">AD ON AI</div>
    <div class="pill"><img src="${A}/design/logo-claude.svg" alt="">Certified Claude Experts</div>
  </div>

  <section>
    <div class="hero">
      <div>
        <p class="eb">// AI Enablement</p>
        <h1>The complete<br><span>AI program,</span><br>from first prompt<br>to <span>AI agents.</span></h1>
        <p class="lede">Our most comprehensive program. It takes you from using AI now and then to building skills, automations and AI agents that do real work for you. Taught on your own tasks.</p>
      </div>
      <img src="${A}/campaign/glass-man.webp" alt="">
    </div>

    <div class="price">
      <div>
        <div class="lab">Program fee</div>
        <div class="amt">$2,500</div>
        <div class="per">per person &middot; once-off &middot; ex GST</div>
        <ul>${upfront.map((t) => `
          <li>${tick}${t}</li>`).join("")}
        </ul>
      </div>
      <div class="plus">+</div>
      <div>
        <div class="lab">Membership</div>
        <div class="amt">$200<small> / mo</small></div>
        <div class="per">per person &middot; ex GST &middot; support &amp; community</div>
        <ul>${ongoing.map((t) => `
          <li>${tick}${t}</li>`).join("")}
        </ul>
      </div>
    </div>

    <div class="tools"><b>Works with</b><span>Claude</span><span>ChatGPT</span><span>Gemini</span><span>Copilot</span><span>Grok</span><span>and more</span><em class="tag">Everything, all the way to AI agents</em></div>

    <div class="rule"></div>
    <p class="eb">What you get</p>
    <h2>Not another workshop you forget by Friday.</h2>
    <p class="sub">You take a job you do by hand and teach AI to do it. Those jobs don&rsquo;t come back.</p>
    <div class="why">${why.map(([h, p]) => `
      <div class="card"><h3>${h}</h3><p>${p}</p></div>`).join("")}
    </div>

    <div class="rule"></div>
    <p class="eb">The journey</p>
    <h2>Three topics, from the basics to AI agents.</h2>
    <div class="steps">${topics.map(([h, t, p], i) => `
      <div class="card"><div class="n">Step ${i + 1}</div><h3>${h}</h3><div class="t">${t}</div><p>${p}</p></div>`).join("")}
    </div>

    <div class="rule"></div>
    <p class="eb">Your membership</p>
    <h2>What your $200 a month gets you.</h2>
    <p class="sub">Support isn&rsquo;t part of the program fee. It comes with your membership, along with everything in the community.</p>
    <div class="comm">${community.map(([n, h, p]) => `
      <div class="card"><div class="n">${n}</div><h3>${h}</h3><p>${p}</p></div>`).join("")}
    </div>

    <div class="rule"></div>
    <p class="eb">What you build</p>
    <h2>What you walk away with.</h2>
    <p class="sub">Three of most things, each built around the work you&rsquo;re already doing.</p>
    <div class="guar">${guarantee.map(([n, t]) => `
      <div class="card"><b>${n}</b><span>${t}</span></div>`).join("")}
    </div>
    <div class="card more"><b>&infin;</b><span>Plus the knowledge to keep building them yourself, and every other skill you pick up along the way.</span></div>

    <div class="rule"></div>
    <p class="eb">FAQs</p>
    <h2>The questions we hear most.</h2>
    <div class="faq">${faqs.map(([q, a]) => `
      <div><h4>${q}</h4><p>${a}</p></div>`).join("")}
    </div>
  </section>

  <div class="cta">
    <div>
      <h2>Ready to get started? Talk to us.</h2>
      <div class="c">adon-ai.com.au &nbsp;|&nbsp; info@adongroup.com.au</div>
    </div>
    <div class="btn">Book a discovery call<small>07 5586 1400</small></div>
  </div>
  <p class="fine">* Lifetime academy access continues for as long as you keep an active membership.</p>
</div>
</body>
</html>`;

// Page height = content height, so the PDF is one continuous page like the full-program brochure.
const mm = process.argv[2] || "560mm";
fs.writeFileSync(__dirname + "/brochure.html", html.replace("PAGEH", mm));
console.log("written, page height", mm);
