// Builds brochure.html: the one-page AI Intermediate pricing brochure. Not on the website.
// Same layout and voice as scripts/pricing-brochure (AI Enablement, the full program), different content.
// Wording follows the intermediate curriculum PDF: six modules, each thing built once, no
// agents (those stay in AI Enablement), audience-neutral ("you", not "your staff"), prices ex GST.
//
// Usage:
//   node scripts/intermediate-pricing/build.js [page height, default 560mm]
//   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
//     --no-pdf-header-footer --print-to-pdf=scripts/intermediate-pricing/AI-Intermediate-Pricing-Brochure.pdf \
//     scripts/intermediate-pricing/brochure.html
const fs = require("fs");
const A = "../../public/assets";

const upfront = [
  "All 6 modules &amp; platform access",
  "Hands-on lessons, taught on your own tasks",
  "Lifetime academy access*",
];

// Support isn't in the program fee: it comes with the monthly membership, alongside the community.
const ongoing = [
  "1 hour of one-on-one support every month",
  "Community: masterclasses, podcasts, a newsletter and a peer network",
];

// What the community gives members. Wording follows /ongoing-support, minus the live webinars.
const community = [
  ["Monthly", "One-on-one support", "An hour with our AI specialists each month, for your questions and the trickier workflows."],
  ["Per tool", "Tool masterclasses", "Focused sessions on each new tool worth your time, built around real business use. Recorded and kept in the academy."],
  ["Weekly", "Business podcasts", "Short, practical episodes on how real businesses are putting AI to work."],
  ["Monthly", "The newsletter", "A round-up of what changed and what&rsquo;s worth your attention, in plain English."],
  ["Always on", "A peer network", "Other people from Australian businesses who use AI heavily in their own work. Compare notes and swap what works."],
];

const why = [
  ["Built for people short on time", "Six short, self-paced modules. Do one when you have a spare hour."],
  ["Straight to what&rsquo;s useful", "From your first message to jobs running on a schedule. You build each thing once, so you cover the ground fast."],
  ["Taught on your real work", "Every lesson uses the tasks you already do, so what you build is in use the same day."],
  ["Help whenever you need it", "Add a membership for the community, and one-on-one support when you get stuck."],
];

const topics = [
  ["Get started", "Modules 1&ndash;2", "Find your way around Claude and set it up so it knows you. Then learn to get good answers, and fix the ones that aren&rsquo;t."],
  ["Plug it in", "Modules 3&ndash;4", "Connect Claude to the tools you already use, build a workflow that does a real job, then turn it into a skill."],
  ["Hand it over", "Modules 5&ndash;6", "Make pages, designs and charts, try other AI tools, then hand Claude whole jobs and put them on a schedule."],
];

// Matches the curriculum's "By the end you'll have" card. The last one isn't a count, so it gets a tick.
const guarantee = [
  ["1&times;", "Claude set up to know you"],
  ["1&times;", "Workspace for your repeat work"],
  ["1&times;", "Workflow on your own tools"],
  ["1&times;", "A Claude skill"],
  ["1&times;", "Your own Cowork task"],
  [null, "The knowledge to do all of them by yourself"],
];

const faqs = [
  ["How is this different from AI Enablement?", "It&rsquo;s shorter, and focused on getting Claude working for you day to day. You build each thing once. AI Enablement builds each one three times over, then goes on to AI agents."],
  ["What do I need to take part?", "A paid Claude plan. The other AI tools in Module 5 are optional and paid for separately."],
  ["Can I cancel?", "Yes, you can cancel your membership any time. That ends your support, community and academy access, and a re&#8209;joining fee applies if you come back later."],
  ["Can I transfer my membership?", "No. It includes lifetime access to the Ad On AI Academy*, so it can&rsquo;t be transferred."],
  ["How do I book my one-on-one support?", "It comes with your membership. Book through the calendar link in your platform, in sessions of at least 1 hour."],
  ["Do unused support hours roll over?", "No. The hour is use-it-or-lose-it each month. If you need more, extra support is $300 per hour, ex GST."],
  ["Is the platform secure?", "Yes, all features and content are hosted securely."],
  ["When do my entitlements begin?", "From the day you start your course."],
];

const tick = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#5db4f2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.2 4.2L19 7"/></svg>`;

const html = `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<title>AI Intermediate | Ad On AI</title>
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
  .comm .card:nth-child(n+4){grid-column:span 3}
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
        <p class="eb">// AI Intermediate</p>
        <h1>Learn to use AI<br><span>like a pro,</span><br>in a fraction<br>of <span>the time.</span></h1>
        <p class="lede">A self-paced program that takes you from your first message to Claude doing real jobs on a schedule without you. Taught on your own tasks, for people who don&rsquo;t have time to spare.</p>
      </div>
      <img src="${A}/campaign/glass-man.webp" alt="">
    </div>

    <div class="price">
      <div>
        <div class="lab">Program fee</div>
        <div class="amt">$500</div>
        <div class="per">per person &middot; once-off &middot; ex GST</div>
        <ul>${upfront.map((t) => `
          <li>${tick}${t}</li>`).join("")}
        </ul>
      </div>
      <div class="plus">+</div>
      <div>
        <div class="lab">Membership</div>
        <div class="amt">$100<small> / mo</small></div>
        <div class="per">per person &middot; ex GST &middot; support &amp; community</div>
        <ul>${ongoing.map((t) => `
          <li>${tick}${t}</li>`).join("")}
        </ul>
      </div>
    </div>

    <div class="tools"><b>Taught in</b><span>Claude</span><span>Cowork</span><span>Claude in Chrome</span><span>Excel, Word &amp; PowerPoint</span><em class="tag">The full journey, without the long runway</em></div>

    <div class="rule"></div>
    <p class="eb">What you get</p>
    <h2>Not another course you never get to.</h2>
    <p class="sub">You take a job you do by hand and teach AI to do it. Those jobs don&rsquo;t come back.</p>
    <div class="why">${why.map(([h, p]) => `
      <div class="card"><h3>${h}</h3><p>${p}</p></div>`).join("")}
    </div>

    <div class="rule"></div>
    <p class="eb">The journey</p>
    <h2>Three steps to getting AI working for you.</h2>
    <div class="steps">${topics.map(([h, t, p], i) => `
      <div class="card"><div class="n">Step ${i + 1}</div><h3>${h}</h3><div class="t">${t}</div><p>${p}</p></div>`).join("")}
    </div>

    <div class="rule"></div>
    <p class="eb">Your membership</p>
    <h2>What your $100 a month gets you.</h2>
    <p class="sub">Support isn&rsquo;t part of the program fee. It comes with your membership, along with everything in the community.</p>
    <div class="comm">${community.map(([n, h, p]) => `
      <div class="card"><div class="n">${n}</div><h3>${h}</h3><p>${p}</p></div>`).join("")}
    </div>

    <div class="rule"></div>
    <p class="eb">What you build</p>
    <h2>What you walk away with.</h2>
    <p class="sub">One of everything, built around the work you&rsquo;re already doing.</p>
    <div class="guar">${guarantee.map(([n, t]) => `
      <div class="card"><b>${n || tick.replace(/"11"/g, '"16"')}</b><span>${t}</span></div>`).join("")}
    </div>
    <div class="card more"><b>+</b><span>Plus the pages, designs, charts and documents you make along the way, and optional AI video, voice and images.</span></div>

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
