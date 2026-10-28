// build.js — the AI Enablement curriculum PDF (two A4 pages). Not on the website.
// Page 1 follows scripts/intermediate-curriculum (AI Intermediate) so the two read as a pair;
// page 2 is the 24-module list from scripts/curriculum-pdf, which still feeds the website PDF.
//
// Regenerate after editing the wording below:
//   node scripts/enablement-curriculum/build.js
//   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer \
//     --print-to-pdf=scripts/enablement-curriculum/AI-Enablement-Curriculum.pdf "file://$PWD/scripts/enablement-curriculum/curriculum.html"
// (run from aog-static/). Check it is still exactly two pages.
//
// Module descriptions come from curriculum-pdf/modules.json (as in the academy); the titles are
// the same softened ones curriculum-pdf uses.
const fs = require("fs");
const dir = __dirname;
const mods = JSON.parse(fs.readFileSync(dir + "/../curriculum-pdf/modules.json", "utf8"));
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&rsquo;");

const SOFT = [
  "AI Basics and Safe Use",
  "Giving AI the Right Background",
  "Better Prompts, Fewer Mistakes",
  "Memory & Context",
  "Connecting AI to Your Email and Files",
  "Plan Your First AI Workflow",
  "Build Your First Workflow",
  "Make It Reliable",
  "Ready-Made AI Skills",
  "Build Your Own Skills",
  "Your AI Toolkit",
  "How Automation Works",
  "Your First Hands-Free Job",
  "Hand Over Bigger Jobs",
  "Put Your Jobs on a Schedule",
  "AI in Your Browser, Safely",
  "Do You Need an Agent?",
  "Plan Your Agent",
  "Get Set Up to Build",
  "Build and Launch Your Agent",
  "Make Your Agent Better",
  "Make It Safe, Then Build Another",
  "Build a Team of Agents",
  "Run It All and Measure the Results",
];
if (SOFT.length !== mods.length) throw new Error("title count mismatch");

const STEPS = [
  { n: 1, name: "The essential skills", sub: "Foundations", range: "Modules 1–8", from: 0,
    body: "Use AI properly: give it clear instructions, check its work, connect it to your email, calendar and files, and set it up so it already knows your work." },
  { n: 2, name: "Automation", sub: "Automating your tasks", range: "Modules 9–16", from: 8,
    body: "Hand over the jobs you repeat every week. Turn them into skills AI runs on demand, then put them on a schedule." },
  { n: 3, name: "AI agents", sub: "Agentic AI", range: "Modules 17–24", from: 16,
    body: "Let AI handle whole jobs. Plan an agent, build it, launch it, then add more and put a lead agent in charge." },
];

const stepCards = STEPS.map((s) => `
      <div class="step s${s.n}">
        <div class="step-top"><span class="big">${s.n}</span><span class="range">${s.range}</span></div>
        <h3>${s.name}</h3>
        <p>${s.body}</p>
      </div>`).join(`<div class="arrow" aria-hidden="true"></div>`);

const columns = STEPS.map((s) => {
  const items = mods.slice(s.from, s.from + 8).map((m, i) => `
          <li><span class="dot">${s.from + i + 1}</span><div><b>${esc(SOFT[s.from + i])}</b><span>${esc(m.description)}</span></div></li>`).join("");
  return `
      <section class="col c${s.n}">
        <header><span class="cn">${s.n}</span><div><h3>${s.name}</h3><p>${s.range}</p></div></header>
        <ol>${items}
        </ol>
      </section>`;
}).join("");

const html = `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<title>AI Enablement Curriculum | Ad On Group</title>
<style>
  @font-face{font-family:'Inter Tight';src:url('../../public/assets/design/fonts/intertight.woff2') format('woff2');font-weight:400 800}
  @page{size:A4;margin:0}
  *{box-sizing:border-box}
  html,body{margin:0;padding:0}
  body{font-family:'Inter Tight','Helvetica Neue',Helvetica,Arial,sans-serif;color:#0B1220;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .page{position:relative;width:210mm;height:297mm;overflow:hidden;display:flex;flex-direction:column;background:#fff;break-after:page}
  .page:last-child{break-after:auto}

  /* ---------- shared ---------- */
  .brand{display:flex;align-items:center;gap:8px;font-weight:800;font-size:16px;letter-spacing:-.02em;color:#fff}
  .brand img{width:28px;height:28px}
  .label{font-size:10.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}

  /* ---------- page 1: cover band ---------- */
  .cover{position:relative;padding:13mm 16mm 12mm;color:#fff;
    background:
      radial-gradient(110% 80% at 85% 0%, rgba(27,171,229,.28), transparent 55%),
      radial-gradient(90% 70% at 0% 100%, rgba(37,99,255,.45), transparent 60%),
      linear-gradient(170deg,#050b1c 0%,#0b1a45 55%,#1d4fd6 100%)}
  .cover:after{content:"";position:absolute;inset:0;
    background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);
    background-size:9mm 9mm;mask-image:linear-gradient(180deg,transparent,#000 40%,transparent);-webkit-mask-image:linear-gradient(180deg,transparent,#000 40%,transparent)}
  .cover>*{position:relative;z-index:1}
  .cover-top{display:flex;align-items:center;justify-content:space-between}
  .pill{display:flex;align-items:center;gap:7px;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#cfe9ff;border:1px solid rgba(207,233,255,.35);background:rgba(255,255,255,.06);border-radius:99px;padding:5px 12px 5px 8px}
  .pill img{width:18px;height:18px}
  .cover .label{color:#8fd3ff;margin:17mm 0 4mm}
  .cover h1{margin:0;font-size:44px;line-height:1.02;letter-spacing:-.04em;font-weight:800}
  .cover h1 span{color:#8fd3ff}
  .cover .lede{margin:5mm 0 0;max-width:150mm;font-size:15.5px;line-height:1.55;color:rgba(255,255,255,.8)}
  .facts{display:flex;gap:2.5mm;margin-top:7mm;flex-wrap:wrap}
  .facts span{font-size:11.5px;font-weight:600;color:#fff;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);border-radius:99px;padding:5px 11px}

  /* ---------- page 1: steps ---------- */
  .body{padding:7mm 16mm 0;display:flex;flex-direction:column;flex:1}
  .body .label{color:#1f4fd1;margin:0 0 4mm}
  .steps{display:grid;grid-template-columns:1fr 5mm 1fr 5mm 1fr;align-items:stretch}
  .step{border-radius:16px;padding:5mm 5mm 5.5mm;background:#f4f8fe;border:1px solid #e2ecf9;display:flex;flex-direction:column}
  .step-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:4mm}
  .big{font-size:40px;line-height:1;font-weight:800;letter-spacing:-.04em;background:linear-gradient(135deg,#0B1220,#2563FF);-webkit-background-clip:text;background-clip:text;color:transparent}
  .s2 .big{background-image:linear-gradient(135deg,#1f4fd1,#1BABE5)}
  .s3 .big{background-image:linear-gradient(135deg,#1BABE5,#59d3ff)}
  .range{font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#1f4fd1;background:#fff;border:1px solid #d6e4f7;border-radius:99px;padding:4px 8px}
  .step h3{margin:0 0 2mm;font-size:17px;letter-spacing:-.02em;font-weight:800}
  .step p{margin:0;font-size:12.5px;line-height:1.5;color:#3d4757}
  .arrow{position:relative}
  .arrow:before{content:"";position:absolute;left:50%;top:50%;width:2.6mm;height:2.6mm;border-top:2px solid #9db8e6;border-right:2px solid #9db8e6;transform:translate(-70%,-50%) rotate(45deg)}

  /* ---------- page 1: included ---------- */
  .incl{margin-top:6mm}
  .stats{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid #e3e9f2;border-radius:16px;overflow:hidden}
  .stat{padding:5mm 5mm 4.5mm;border-left:1px solid #e3e9f2}
  .sh{grid-column:span 2;padding:2.6mm 5mm;font-size:9.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#1f4fd1;background:#f4f8fe;border-bottom:1px solid #e3e9f2}
  .sh+.sh{border-left:1px solid #e3e9f2}
  .sh+.sh+.stat{border-left:0}
  .stat strong{display:block;font-size:26px;font-weight:800;letter-spacing:-.03em;color:#0B1220;line-height:1}
  .stat span{display:block;margin-top:2mm;font-size:11.5px;line-height:1.4;color:#4a5462}
  .real{margin:4mm 0 0;font-size:12.5px;line-height:1.5;color:#4a5462}
  .real b{color:#0B1220}

  .cta{margin:auto 0 4mm;display:flex;align-items:center;justify-content:space-between;gap:8mm;padding:6mm 7mm;border-radius:18px;color:#fff;
    background:radial-gradient(120% 140% at 100% 0%, rgba(27,171,229,.35), transparent 55%),#0B1220}
  .cta .t{font-size:19px;font-weight:800;letter-spacing:-.02em}
  .cta .t span{display:block;margin-top:2px;font-size:12px;font-weight:500;color:#aab8cc;letter-spacing:0}
  .cta .c{font-size:11.5px;line-height:1.7;text-align:right;color:#d5deea}
  .cta .c b{color:#fff;font-size:13px}
  .fine{margin:0 0 7mm;font-size:9.5px;line-height:1.4;color:#6b7686}
  .stat sup{font-size:.8em;line-height:0}

  /* ---------- page 2 ---------- */
  .p2head{padding:11mm 16mm 9mm;color:#fff;
    background:radial-gradient(100% 120% at 100% 0%, rgba(27,171,229,.3), transparent 55%),linear-gradient(170deg,#050b1c 0%,#0b1a45 70%,#1d4fd6 140%)}
  .p2head .row{display:flex;align-items:center;justify-content:space-between}
  .p2head .label{color:#8fd3ff}
  .p2head h2{margin:7mm 0 0;font-size:28px;letter-spacing:-.035em;font-weight:800;line-height:1.05}
  .p2head p{margin:2.5mm 0 0;font-size:13px;color:rgba(255,255,255,.75)}
  .cols{flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:5mm;padding:8mm 16mm 0}
  .col header{display:flex;align-items:center;gap:3mm;padding-bottom:3.5mm;margin-bottom:1mm;border-bottom:2px solid #0B1220}
  .c2 header{border-color:#1f4fd1}.c3 header{border-color:#1BABE5}
  .cn{width:8mm;height:8mm;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none;font-size:13px;font-weight:800;color:#fff;background:#0B1220}
  .c2 .cn{background:#1f4fd1}.c3 .cn{background:#1BABE5}
  .col h3{margin:0;font-size:15.5px;font-weight:800;letter-spacing:-.015em}
  .col header p{margin:1px 0 0;font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8a93a1}
  .col ol{list-style:none;margin:0;padding:0;position:relative}
  .col ol:before{content:"";position:absolute;left:3.1mm;top:5mm;bottom:5mm;width:1.5px;background:#dfe7f2}
  .col li{position:relative;display:flex;gap:3mm;padding:3.7mm 0}
  .dot{position:relative;z-index:1;flex:none;width:6.4mm;height:6.4mm;border-radius:50%;background:#fff;border:1.5px solid #c9d7ec;
    display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:800;color:#0B1220}
  .c2 .dot{color:#1f4fd1}.c3 .dot{color:#118fc4}
  .col li b{display:block;font-size:12.6px;line-height:1.3;font-weight:700;letter-spacing:-.005em;margin-top:.6mm}
  .col li div span{display:block;margin-top:1mm;font-size:10.6px;line-height:1.45;color:#4a5462}
  .p2foot{display:flex;justify-content:space-between;align-items:center;margin:0 16mm 10mm;padding-top:4mm;border-top:1px solid #e3e9f2;font-size:11px;color:#4a5462}
  .p2foot b{color:#0B1220}
</style>
</head>
<body>
<div class="page">
  <div class="cover">
    <div class="cover-top">
      <div class="brand"><img src="../../public/assets/design/adon-logo.png" alt="">Ad On Group</div>
      <div class="pill"><img src="../../public/assets/design/logo-claude.svg" alt="">Claude Certified Associates</div>
    </div>
    <p class="label">AI Enablement &middot; Curriculum</p>
    <h1>From your first prompt<br><span>to your own AI agents.</span></h1>
    <p class="lede">Our most comprehensive program. It takes you from using AI now and then to building skills, automations and AI agents that do real work for you, taught on your own tasks.</p>
    <div class="facts"><span>24 modules</span><span>3 main topics</span><span>Self-paced</span><span>Works with Claude, ChatGPT, Copilot, Gemini &amp; Grok</span></div>
  </div>

  <div class="body">
    <p class="label">How it works</p>
    <div class="steps">${stepCards}
    </div>

    <div class="incl">
      <p class="label">What you get</p>
      <div class="stats">
        <div class="sh">In the program</div><div class="sh">With membership</div>
        <div class="stat"><strong>24</strong><span>hands-on modules, done at your own pace</span></div>
        <div class="stat"><strong>&infin;</strong><span>lifetime access to the learning academy<sup>*</sup></span></div>
        <div class="stat"><strong>2 hrs</strong><span>of one-on-one support every month</span></div>
        <div class="stat"><strong>&infin;</strong><span>access to our community while you&rsquo;re a member</span></div>
      </div>
      <p class="real"><b>Membership is separate from the program.</b> It covers your support hours, a monthly live webinar on what&rsquo;s new in AI, and the community: tool masterclasses, weekly podcasts, a monthly newsletter and a peer network.</p>
    </div>

    <div class="cta">
      <div class="t">We&rsquo;ll walk you through it on a call.<span>Book a time at adongroup.com.au/ai-training</span></div>
      <div class="c"><b>(07) 5586 1400</b><br>info@adongroup.com.au<br>1/44 Township Dr, Burleigh Heads QLD</div>
    </div>
    <p class="fine">* Lifetime academy access continues for as long as you keep an active membership.</p>
  </div>
</div>

<div class="page">
  <div class="p2head">
    <div class="row">
      <div class="brand"><img src="../../public/assets/design/adon-logo.png" alt="">Ad On Group</div>
      <span class="label">The full curriculum</span>
    </div>
    <h2>Everything you&rsquo;ll learn, step by step.</h2>
    <p>Short, hands-on modules. Each one ends with something you can use in your work the same day.</p>
  </div>
  <div class="cols">${columns}
  </div>
  <div class="p2foot"><span><b>Ad On Group</b> &middot; AI Enablement</span><span><b>(07) 5586 1400</b> &middot; info@adongroup.com.au &middot; adongroup.com.au/ai-training</span></div>
</div>
</body>
</html>`;
fs.writeFileSync(dir + "/curriculum.html", html);
console.log("written");
