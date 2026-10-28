// build.js — the AI Intermediate curriculum PDF (two A4 pages). Not on the website.
// Same layout and voice as scripts/curriculum-pdf (AI Enablement, the full program), different content.
//
// Regenerate after editing the wording below:
//   node scripts/intermediate-curriculum/build.js
//   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer \
//     --print-to-pdf=scripts/intermediate-curriculum/AI-Intermediate-Curriculum.pdf "file://$PWD/scripts/intermediate-curriculum/curriculum.html"
// (run from aog-static/). Check it is still exactly two pages.
//
// Modules and topics follow the curriculum outline supplied on 2026-10-27 (six modules, agents
// left to the full program), kept to short labels. A topic is a string, or { group } to start a
// labelled group inside a module.
const fs = require("fs");
const dir = __dirname;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&rsquo;");

const MODS = [
  { title: "Getting Started with Claude", level: "Beginner",
    body: "Find your way around and set Claude up to know you.",
    topics: [
      "Your first message",
      "Finding your way around",
      "Uploading files, photos and links",
      "Voice",
      "Research mode",
      "Making docs, PDFs, sheets and slides",
      "The quick-access window",
      "Privacy settings, and what not to share",
      "Memory and preferences",
    ] },
  { title: "Getting Good Results", level: "Beginner",
    body: "Prompts that work, and fixes for when they don&rsquo;t.",
    topics: [
      "CRAFTS: a good prompt",
      "Quick asks",
      "Letting Claude write the prompt",
      "Examples and context",
      "Clarifying questions",
      "Fixing a bad answer",
      "Projects",
    ] },
  { title: "Connecting Your Tools", level: "Intermediate",
    body: "Claude working inside the tools you already use.",
    topics: [
      "Connectors",
      "Specialist connectors",
      "Adding your own",
    ] },
  { title: "Skills", level: "Intermediate",
    body: "Ready-made instructions Claude runs on demand.",
    topics: [
      "What a skill is",
      "Three ways to create one: build it, Claude&rsquo;s library, or online",
      "Applying skills to your work",
      "An introduction to sub-skills",
    ] },
  { title: "More Claude Features and Other AI Tools", level: "Advanced",
    body: "Pages, designs, charts and more.",
    topics: [
      { group: "Claude features" },
      "Shareable tools and dashboards",
      "Web pages",
      "Claude in Excel, Word and PowerPoint",
      "Claude Design",
      "Charts and diagrams",
      "Data analysis",
      { group: "Other AI tools (optional, paid)" },
      "HeyGen: avatar videos",
      "ChatGPT: images",
      "Higgsfield: video",
      "ElevenLabs: voice",
    ] },
  { title: "Cowork", level: "Advanced",
    body: "Hand Claude whole jobs, then put them on a schedule.",
    topics: [
      "What Cowork is",
      "Skills in Cowork",
      "Scheduled tasks",
      "Claude in Chrome",
    ] },
];
if (MODS.length !== 6) throw new Error(`expected 6 modules, got ${MODS.length}`);

const STEPS = [
  { n: 1, name: "Get started", range: "Modules 1–2",
    body: "Find your way around Claude and set it up so it knows you. Then learn to get good answers, and fix the ones that aren&rsquo;t." },
  { n: 2, name: "Plug it in", range: "Modules 3–4",
    body: "Connect Claude to the tools you already use, build a workflow that does a real job, then turn it into a skill." },
  { n: 3, name: "Hand it over", range: "Modules 5–6",
    body: "Make pages, designs and charts, try other AI tools, then hand Claude whole jobs and put them on a schedule." },
];

const stepCards = STEPS.map((s) => `
      <div class="step s${s.n}">
        <div class="step-top"><span class="big">${s.n}</span><span class="range">${s.range}</span></div>
        <h3>${s.name}</h3>
        <p>${s.body}</p>
      </div>`).join(`<div class="arrow" aria-hidden="true"></div>`);

// Text already holds its entities (&rsquo; etc.), so it goes in as written.
const topic = (x) => {
  if (typeof x === "string") return `
            <li>${x}</li>`;
  return `
            <li class="grp">${x.group}</li>`;
};

const mod = (m, i) => `
        <div class="mod m${Math.floor(i / 2) + 1}">
          <div class="mhead"><span class="mn">${i + 1}</span><div><b>${esc(m.title)}</b><em>Module ${i + 1} &middot; ${m.level}</em></div></div>
          <p class="mbody">${m.body}</p>
          <ol>${m.topics.map(topic).join("")}
          </ol>
        </div>`;

// Modules 3–4 are the shortest pair, so the summary card fills the foot of that column.
const BUILT = ["Claude set up to know you", "A workspace for your repeat work", "A workflow on your own tools",
  "A Claude skill", "Your own Cowork task", "The knowledge to do all of them by yourself"];
const built = `
        <div class="built"><i>By the end you&rsquo;ll have</i><ul>${BUILT.map((b) => `<li>${b}</li>`).join("")}</ul></div>`;

const columns = [0, 2, 4].map((from) => `
      <section class="col">${MODS.slice(from, from + 2).map((m, j) => mod(m, from + j)).join("")}${from === 2 ? built : ""}
      </section>`).join("");

const html = `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<title>AI Intermediate Curriculum | Ad On Group</title>
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
  .p2head{padding:10mm 16mm 7mm;color:#fff;
    background:radial-gradient(100% 120% at 100% 0%, rgba(27,171,229,.3), transparent 55%),linear-gradient(170deg,#050b1c 0%,#0b1a45 70%,#1d4fd6 140%)}
  .p2head .row{display:flex;align-items:center;justify-content:space-between}
  .p2head .label{color:#8fd3ff}
  .p2head h2{margin:6mm 0 0;font-size:28px;letter-spacing:-.035em;font-weight:800;line-height:1.05}
  .p2head p{margin:2.5mm 0 0;font-size:13px;color:rgba(255,255,255,.75)}
  .cols{flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:6mm;padding:6mm 16mm 5mm}
  .col{display:flex;flex-direction:column}
  .mod{padding:0 0 5mm;margin:0 0 5mm;border-bottom:1px solid #e3e9f2}
  .mod:nth-child(2){border-bottom:0}
  .mhead{display:flex;gap:3mm;align-items:flex-start}
  .mn{flex:none;width:8mm;height:8mm;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;background:#0B1220}
  .m2 .mn{background:#1f4fd1}.m3 .mn{background:#1BABE5}
  .mhead b{display:block;font-size:14.5px;line-height:1.25;font-weight:800;letter-spacing:-.01em;margin-top:.3mm}
  .mhead em{display:block;font-style:normal;margin-top:.8mm;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8a93a1}
  .mbody{margin:2.2mm 0 1.8mm;font-size:11.5px;line-height:1.45;color:#4a5462}
  .mod ol{list-style:none;margin:0;padding:0}
  .mod ol>li{position:relative;padding:1.1mm 0 1.1mm 4.6mm;font-size:12px;line-height:1.4;color:#0B1220}
  .mod ol>li:before{content:"";position:absolute;left:.4mm;top:3mm;width:1.6mm;height:1.6mm;border-radius:50%;background:#c9d7ec}
  .m2 ol>li:before{background:#9db8e6}.m3 ol>li:before{background:#8fd3ff}
  .mod li.grp{padding:3mm 0 .6mm;font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#1f4fd1}
  .mod li.grp:before{display:none}
  .built{margin-top:auto;padding:4mm 4.5mm;border-radius:14px;color:#fff;
    background:radial-gradient(120% 140% at 100% 0%, rgba(27,171,229,.35), transparent 55%),#0B1220}
  .built i{display:block;font-style:normal;font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#8fd3ff;margin-bottom:2mm}
  .built ul{list-style:none;margin:0;padding:0}
  .built li{position:relative;padding:1.1mm 0 1.1mm 5mm;font-size:11.5px;line-height:1.35;font-weight:600}
  .built li:before{content:"";position:absolute;left:.3mm;top:1.9mm;width:2.4mm;height:1.3mm;border-left:1.6px solid #8fd3ff;border-bottom:1.6px solid #8fd3ff;transform:rotate(-45deg)}
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
    <p class="label">AI Intermediate &middot; Curriculum</p>
    <h1>Everything you need to get<br><span>AI working for you, fast.</span></h1>
    <p class="lede">A self-paced program for people who are short on time. It takes you from your first message to Claude running real jobs for you, taught on your own tasks.</p>
    <div class="facts"><span>6 modules</span><span>Self-paced</span><span>Taught in Claude</span><span>Plus optional AI tools for video, voice &amp; images</span></div>
  </div>

  <div class="body">
    <p class="label">How it works</p>
    <div class="steps">${stepCards}
    </div>

    <div class="incl">
      <p class="label">What you get</p>
      <div class="stats">
        <div class="sh">In the program</div><div class="sh">With membership</div>
        <div class="stat"><strong>6</strong><span>hands-on modules, done at your own pace</span></div>
        <div class="stat"><strong>&infin;</strong><span>lifetime access to the learning academy<sup>*</sup></span></div>
        <div class="stat"><strong>1 hr</strong><span>of one-on-one support every month</span></div>
        <div class="stat"><strong>&infin;</strong><span>access to our community while you&rsquo;re a member</span></div>
      </div>
      <p class="real"><b>Membership is separate from the program.</b> It covers your support hour and the community: tool masterclasses, weekly podcasts, a monthly newsletter and a peer network.</p>
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
    <h2>Everything you&rsquo;ll learn, module by module.</h2>
    <p>Short, hands-on modules. Each one ends with something you can use in your work the same day.</p>
  </div>
  <div class="cols">${columns}
  </div>
  <div class="p2foot"><span><b>Ad On Group</b> &middot; AI Intermediate</span><span><b>(07) 5586 1400</b> &middot; info@adongroup.com.au &middot; adongroup.com.au/ai-training</span></div>
</div>
</body>
</html>`;
fs.writeFileSync(dir + "/curriculum.html", html);
console.log("written");
