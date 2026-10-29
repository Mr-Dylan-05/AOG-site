// build.js — the AI Intermediate web pages, adapted straight from the brochures:
//   public/ai-intermediate/index.html          (curriculum, from scripts/intermediate-curriculum)
//   public/ai-intermediate-pricing/index.html  (pricing, from scripts/intermediate-pricing; noindex, sales-only)
//
// The brochures are the source of truth. Their data arrays are read from the brochure build files, so
// after editing a brochure, re-run this to bring the pages back in line:
//   node scripts/intermediate-web/build.js   (from aog-static/)
//
// Head, nav, partner strip and footer come from public/program-pricing/index.html, so the pages match
// the rest of the AI section.
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..", "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

// Pull `const NAME = [ ... ];` literals out of a brochure build file.
const grab = (src, name) => {
  const m = src.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\]);`));
  if (!m) throw new Error(`${name} not found`);
  return eval(m[1]);
};
const cur = read("scripts/intermediate-curriculum/build.js");
const pri = read("scripts/intermediate-pricing/build.js");
const MODS = grab(cur, "MODS"), STEPS = grab(cur, "STEPS"), BUILT = grab(cur, "BUILT");
const upfront = grab(pri, "upfront"), ongoing = grab(pri, "ongoing"), community = grab(pri, "community");
const why = grab(pri, "why"), topics = grab(pri, "topics"), guarantee = grab(pri, "guarantee"), faqs = grab(pri, "faqs");

const tpl = read("public/program-pricing/index.html");
const top = tpl.slice(0, tpl.indexOf("  <!-- ===== HERO ===== -->"));
const bottom = tpl.slice(tpl.indexOf("  <!-- ===== FOOTER ===== -->"));

const PLUS = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>`;
const KEY = `<svg viewBox="0 0 24 24" fill="none" stroke="#0B1220" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-label="Key"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="#0B1220"/></svg>`;
const h2 = (eb, title, sub) => `
    <span class="eyebrow">${eb}</span>
    <h2 class="ai-h2">${title}</h2>${sub ? `
    <p class="ai-sub">${sub}</p>` : ""}`;
const cta = (title) => `
  <!-- ===== CTA ===== -->
  <section class="sec" style="padding-bottom:16px">
    <div class="glass" style="padding:44px 40px;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;background:rgba(11,18,32,0.98);border:1px solid rgba(11,18,32,0.4)">
      <div>
        <h2 style="font-size:clamp(24px,3vw,36px);line-height:1.1;letter-spacing:-0.03em;font-weight:800;margin:0 0 8px;color:#fff">${title}</h2>
        <div style="font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:0.04em;color:#8A93A1">(07) 5586 1400 &nbsp;|&nbsp; info@adongroup.com.au</div>
      </div>
      <a href="/ai-enquiry/" style="text-decoration:none;font-size:16px;font-weight:700;color:#0B1220;background:#56C5E8;padding:15px 28px;border-radius:14px;white-space:nowrap">Book a discovery call &rarr;</a>
    </div>
  </section>

`;

const css = `<style>
  .ai-h2 { font-size:clamp(26px,3.4vw,42px); line-height:1.06; letter-spacing:-0.035em; font-weight:800; margin:14px 0 0; color:#0B1220; }
  .ai-sub { font-size:17px; line-height:1.6; color:#5A6473; margin:16px 0 30px; max-width:660px; }
  .ai-h1 { font-size:clamp(38px,6vw,68px); line-height:1.0; letter-spacing:-0.045em; font-weight:800; margin:16px 0 0; color:#0B1220; max-width:860px; }
  .ai-h1 span { color:#1BABE5; }
  .ai-lede { font-size:18px; line-height:1.6; color:#5A6473; margin:22px 0 0; max-width:680px; }
  .ai-pill { display:inline-flex; align-items:center; gap:8px; font-family:'JetBrains Mono',monospace; font-size:11.5px; letter-spacing:0.12em; text-transform:uppercase; color:#0B1220; background:rgba(255,255,255,0.7); border:1px solid rgba(11,18,32,0.1); border-radius:999px; padding:6px 13px 6px 9px; margin-bottom:18px; }
  .ai-pill img { width:16px; height:16px; }
  .ai-chips { display:flex; flex-wrap:wrap; gap:8px; margin-top:24px; }
  .ai-chips span { font-size:13.5px; font-weight:600; color:#0B1220; background:rgba(255,255,255,0.7); border:1px solid rgba(11,18,32,0.08); border-radius:999px; padding:6px 13px; }
  .ai-step { padding:26px; }
  .ai-step-top { display:flex; align-items:center; justify-content:space-between; }
  .ai-step-top b { font-family:'Inter Tight',sans-serif; font-size:44px; font-weight:800; line-height:1; color:#1BABE5; letter-spacing:-0.04em; }
  .ai-step-top span { font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:#1BABE5; background:rgba(27,171,229,0.1); border-radius:999px; padding:5px 10px; }
  .ai-step h3, .pp-m h3 { font-size:20px; margin:16px 0 8px; letter-spacing:-0.02em; color:#0B1220; }
  .ai-step p { font-size:15px; line-height:1.6; color:#5A6473; margin:0; }
  .ai-stats { display:grid; grid-template-columns:repeat(4,1fr); }
  .ai-sh { grid-column:span 2; font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#1BABE5; padding:14px 22px; border-bottom:1px solid rgba(11,18,32,0.07); }
  .ai-sh + .ai-sh { border-left:1px solid rgba(11,18,32,0.07); }
  .ai-stat { padding:22px; border-left:1px solid rgba(11,18,32,0.07); }
  .ai-sh + .ai-sh + .ai-stat { border-left:0; }
  .ai-stat strong { display:block; font-family:'Inter Tight',sans-serif; font-size:34px; font-weight:800; letter-spacing:-0.03em; line-height:1; color:#0B1220; }
  .ai-stat strong svg { display:block; width:34px; height:34px; }
  .ai-stat span { display:block; margin-top:10px; font-size:14px; line-height:1.45; color:#5A6473; }
  .ai-note { font-size:15px; line-height:1.6; color:#5A6473; margin:18px 0 0; }
  .ai-note b { color:#0B1220; }
  .ai-mods { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; align-items:start; }
  .ai-mod { padding:24px; }
  .ai-mhead { display:flex; gap:13px; align-items:flex-start; }
  .ai-mhead > span { flex:none; width:34px; height:34px; border-radius:10px; background:#1BABE5; color:#fff; font-family:'Inter Tight',sans-serif; font-weight:800; font-size:16px; display:inline-flex; align-items:center; justify-content:center; }
  .ai-mhead b { display:block; font-family:'Inter Tight',sans-serif; font-size:17px; line-height:1.2; letter-spacing:-0.02em; color:#0B1220; }
  .ai-mhead em { display:block; font-style:normal; font-family:'JetBrains Mono',monospace; font-size:10.5px; letter-spacing:0.1em; text-transform:uppercase; color:#8A93A1; margin-top:4px; }
  .ai-mbody { font-size:14.5px; line-height:1.5; color:#5A6473; margin:14px 0 12px; }
  .ai-mod ul { list-style:none; margin:0; padding:12px 0 0; border-top:1px solid rgba(11,18,32,0.07); display:flex; flex-direction:column; gap:7px; }
  .ai-mod li { position:relative; padding-left:16px; font-size:14px; line-height:1.4; color:#27313F; }
  .ai-mod li::before { content:""; position:absolute; left:2px; top:7px; width:5px; height:5px; border-radius:50%; background:#1BABE5; }
  .ai-mod li.grp { padding-left:0; margin-top:6px; font-family:'JetBrains Mono',monospace; font-size:10.5px; letter-spacing:0.1em; text-transform:uppercase; color:#1BABE5; }
  .ai-mod li.grp::before { display:none; }
  .ai-end { margin-top:18px; padding:24px 26px; border-left:3px solid #1BABE5; }
  .ai-end h3 { font-size:19px; margin:0 0 14px; letter-spacing:-0.02em; color:#0B1220; }
  .ai-end .pp-list { display:grid; grid-template-columns:repeat(3,1fr); gap:11px 22px; }
  .pp-price2 { display:grid; grid-template-columns:1fr auto 1fr; gap:26px; align-items:start; padding:32px; }
  .pp-and { font-family:'Inter Tight',sans-serif; font-size:30px; font-weight:800; color:#1BABE5; align-self:center; }
  .ai-tools { margin-top:22px; display:flex; flex-wrap:wrap; align-items:center; gap:10px; justify-content:center; }
  .ai-tools b { font-size:13px; color:#7C8696; font-weight:600; }
  .ai-tools span { font-size:13.5px; font-weight:600; color:#0B1220; background:rgba(255,255,255,0.7); border:1px solid rgba(11,18,32,0.08); border-radius:999px; padding:6px 13px; }
  .ai-tools em { flex-basis:100%; text-align:center; font-size:15px; color:#5A6473; margin-top:6px; }
  @media (max-width: 860px){
    .ai-stats { grid-template-columns:1fr 1fr; }
    .ai-stats > :nth-child(1) { order:1; } .ai-stats > :nth-child(3) { order:2; } .ai-stats > :nth-child(4) { order:3; }
    .ai-stats > :nth-child(2) { order:4; border-left:0; border-top:1px solid rgba(11,18,32,0.07); }
    .ai-stats > :nth-child(5) { order:5; border-left:0; } .ai-stats > :nth-child(6) { order:6; }
    .ai-mods, .ai-end .pp-list { grid-template-columns:1fr; }
    .pp-price2 { grid-template-columns:1fr; padding:24px; }
    .pp-and { justify-self:start; }
  }
</style>
`;

const page = (title, desc, robots, body) => {
  let t = top
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${desc}">`)
    .replace(/<meta name="robots" content="[^"]*">/, `<meta name="robots" content="${robots}">`);
  t = t.replace("</head>", css + "</head>");
  return t + body + bottom;
};

// ---------------------------------------------------------------- curriculum
const topicLi = (x) => typeof x === "string" ? `<li>${x}</li>` : `<li class="grp">${x.group}</li>`;
const curBody = `  <!-- ===== HERO ===== -->
  <section class="sec" style="padding-bottom:24px">
    <div class="ai-pill"><img src="/assets/design/logo-claude.svg" alt="" width="16" height="16">Claude Certified Associates</div>
    <div><span class="eyebrow">AI Intermediate · Curriculum</span></div>
    <h1 class="ai-h1">Everything you need to get <span>AI working for you, fast.</span></h1>
    <p class="ai-lede">A self-paced program for people who are short on time. It takes you from your first message to Claude running real jobs for you, taught on your own tasks.</p>
    <div class="ai-chips"><span>6 modules</span><span>Self-paced</span><span>Taught in Claude</span><span>Plus optional AI tools for video, voice &amp; images</span></div>
  </section>

  <!-- ===== HOW IT WORKS ===== -->
  <section class="sec">${h2("How it works", "Three steps to getting AI working for&nbsp;you.")}
    <div class="pp-3" style="margin-top:30px">${STEPS.map((s) => `
      <div class="glass ai-step"><div class="ai-step-top"><b>${s.n}</b><span>${s.range}</span></div><h3>${s.name}</h3><p>${s.body}</p></div>`).join("")}
    </div>
  </section>

  <!-- ===== WHAT YOU GET ===== -->
  <section class="sec">${h2("What you get", "The program, and what membership adds.")}
    <div class="glass ai-stats" style="margin-top:30px;padding:0;overflow:hidden">
      <div class="ai-sh">In the program</div><div class="ai-sh">With membership</div>
      <div class="ai-stat"><strong>6</strong><span>hands-on modules, done at your own pace</span></div>
      <div class="ai-stat"><strong>${KEY}</strong><span>access to the Learning Academy</span></div>
      <div class="ai-stat"><strong>1 hr</strong><span>of one-on-one support every month</span></div>
      <div class="ai-stat"><strong>Ongoing</strong><span>academy and community access while you’re a member</span></div>
    </div>
    <p class="ai-note"><b>Membership is separate from the program.</b> It covers your support hour and the community: tool masterclasses, weekly podcasts, a monthly newsletter and a peer network.</p>
  </section>

  <!-- ===== FULL CURRICULUM ===== -->
  <section class="sec">${h2("The full curriculum", "Everything you’ll learn, module by&nbsp;module.", "Short, hands-on modules. Each one ends with something you can use in your work the same day.")}
    <div class="ai-mods">${MODS.map((m, i) => `
      <div class="glass ai-mod">
        <div class="ai-mhead"><span>${i + 1}</span><div><b>${m.title}</b><em>Module ${i + 1} · ${m.level}</em></div></div>
        <p class="ai-mbody">${m.body}</p>
        <ul>${m.topics.map(topicLi).join("")}</ul>
      </div>`).join("")}
    </div>
    <div class="glass ai-end">
      <h3>By the end you’ll have</h3>
      <ul class="pp-list">${BUILT.map((b) => `<li>${b}</li>`).join("")}</ul>
    </div>
  </section>
${cta("We’ll walk you through it on a&nbsp;call.")}`;

// ---------------------------------------------------------------- pricing
const priBody = `  <!-- ===== HERO ===== -->
  <section class="sec" style="padding-bottom:24px">
    <span class="eyebrow">// AI Intermediate</span>
    <h1 class="ai-h1">Learn to use AI <span>like a pro,</span> in a fraction of <span>the time.</span></h1>
    <p class="ai-lede">A self-paced program that takes you from your first message to Claude doing real jobs on a schedule without you. Taught on your own tasks, for people who don’t have time to spare.</p>
  </section>

  <!-- ===== PRICING ===== -->
  <section class="sec" style="padding-top:24px" id="pricing">
    <div class="glass pp-feat pp-price2">
      <div>
        <div class="pp-lab">Program fee</div>
        <div class="pp-amt"><span>$500</span></div>
        <div class="pp-per">per person · once-off · ex GST</div>
        <ul class="pp-list">${upfront.map((t) => `
          <li>${t}</li>`).join("")}
        </ul>
      </div>
      <div class="pp-and">+</div>
      <div>
        <div class="pp-lab">Membership</div>
        <div class="pp-amt"><span>$100</span><small>/ mo</small></div>
        <div class="pp-per">per person · ex GST · support &amp; community</div>
        <ul class="pp-list">${ongoing.map((t) => `
          <li>${t}</li>`).join("")}
        </ul>
      </div>
    </div>
    <div class="ai-tools"><b>Taught in</b><span>Claude</span><span>Cowork</span><span>Claude in Chrome</span><span>Excel, Word &amp; PowerPoint</span><em>The full journey, without the long runway</em></div>
  </section>

  <!-- ===== WHAT YOU GET ===== -->
  <section class="sec">${h2("What you get", "Not another course you never get&nbsp;to.", "You take a job you do by hand and teach AI to do it. Those jobs don’t come&nbsp;back.")}
    <div class="pp-4">${why.map(([t, d]) => `
      <div class="glass" style="padding:26px 26px 28px"><h3 style="font-size:19px;font-weight:800;margin:0 0 8px;letter-spacing:-0.02em;color:#0B1220">${t}</h3><p style="font-size:15px;line-height:1.6;color:#5A6473;margin:0">${d}</p></div>`).join("")}
    </div>
  </section>

  <!-- ===== JOURNEY ===== -->
  <section class="sec">${h2("The journey", "Three steps to getting AI working for&nbsp;you.")}
    <div class="pp-3" style="margin-top:30px">${topics.map(([n, r, d], i) => `
      <div class="glass" style="padding:26px"><div class="eyebrow">Step ${i + 1}</div><h3 style="font-size:22px;font-weight:800;margin:12px 0 2px;letter-spacing:-0.02em;color:#0B1220">${n}</h3><div style="font-size:14px;font-weight:600;color:#1BABE5;margin-bottom:14px">${r}</div><p style="font-size:15px;line-height:1.6;color:#5A6473;margin:0">${d}</p></div>`).join("")}
    </div>
  </section>

  <!-- ===== MEMBERSHIP ===== -->
  <section class="sec">${h2("Your membership", "What your $100 a month gets&nbsp;you.", "Support isn’t part of the program fee. It comes with your membership, along with everything in the community.")}
    <div class="pp-3">${community.map(([tag, t, d]) => `
      <div class="glass pp-m"><div class="eyebrow">${tag}</div><h3>${t}</h3><p>${d}</p></div>`).join("")}
    </div>
  </section>

  <!-- ===== WALK AWAY WITH ===== -->
  <section class="sec">${h2("What you build", "What you walk away&nbsp;with.", "One of everything, built around the work you’re already doing.")}
    <div class="pp-guar">${guarantee.map(([n, t]) => `
      <div class="glass pp-g"><b>${n || "&#10003;"}</b><span>${t}</span></div>`).join("")}
    </div>
    <div class="glass pp-g pp-gm" style="margin-top:12px"><b>+</b><span>Plus the pages, designs, charts and documents you make along the way, and optional AI video, voice and images.</span></div>
  </section>

  <!-- ===== FAQ ===== -->
  <section class="sec">${h2("FAQs", "The questions we hear&nbsp;most.")}
    <div class="pp-faq" style="margin-top:30px">${faqs.map(([q, a]) => `
      <details class="aoa-faq"><summary>${q}${PLUS}</summary><div>${a}</div></details>`).join("")}
    </div>
  </section>
${cta("Ready to get started? Talk to&nbsp;us.")}`;

const out = (dir, html) => {
  fs.mkdirSync(path.join(root, "public", dir), { recursive: true });
  fs.writeFileSync(path.join(root, "public", dir, "index.html"), html);
  console.log("written", `public/${dir}/index.html`);
};
out("ai-intermediate", page(
  "AI Intermediate — Curriculum | Ad On Group",
  "AI Intermediate: a six-module, self-paced program that gets Claude doing real work for you, fast. Taught on your own tasks by Claude Certified Associates.",
  "index, follow, max-image-preview:large, max-snippet:-1",
  curBody));
out("ai-intermediate-pricing", page(
  "AI Intermediate — Pricing | Ad On Group",
  "Pricing for AI Intermediate, the six-module Ad On AI training program.",
  "noindex, nofollow",
  priBody));
