#!/usr/bin/env node
/**
 * build-curriculum-block.js — "What you'll learn" on /ai-training/.
 *
 * The campaign page explains the format (24 modules, 1:1s, community) but never
 * said what is actually taught, and never said what someone ends up holding.
 *
 * The walk-away list that sat under the card row has been removed on request.
 * The undo step below still strips it, so an older build is cleaned up rather
 * than left with an orphan.
 *
 * COMPACT, AND INSIDE THE CARD THAT ALREADY EXISTS. A first version added a
 * full-width section with the 24 module titles behind three accordions. It was
 * accurate and far too big: 1,312px on a phone before anyone expanded
 * anything, for a page whose job is to get someone to the enquiry form. This
 * version puts eight topic labels into the "24 Interactive Modules" card the
 * page already has, and the walk-away list into a strip under it. Nothing new
 * is introduced to the page's structure and nothing expands.
 *
 * The eight labels are groupings of the real 24 modules on /programs/, not a
 * different curriculum:
 *
 *   AI Fundamentals ............ 01
 *   Prompt Engineering ......... 02, 03
 *   Claude Cowork .............. 14, 15
 *   Connected Second Brain ..... 04, 06
 *   AI Workflows ............... 07, 11
 *   Custom Claude Skills ....... 09, 10
 *   Automation ................. 12, 13, 16
 *   AI Agents .................. 17-24
 *
 * Modules 05 and 08, multimodal verification and the audit loop, no longer
 * have a label of their own: "Accuracy & Verification" covered them and was
 * replaced with "Claude Cowork" on request. They are still in the program,
 * just not surfaced in this eight-item summary.
 *
 * The deliverables are verbatim from /programs/, reframed to second person
 * because this page sells to the reader rather than to their employer.
 *
 * The page's stylesheet is !important-heavy with global h2/h3 rules, so
 * everything here is namespaced and brings its own scoped styles, the same way
 * build-campaign-reviews.js does.
 *
 * Idempotent: strips its own previous output before injecting.
 *
 * Usage:  node scripts/build-curriculum-block.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PAGE = path.join(ROOT, "public", "ai-training", "index.html");

const TOPICS = [
  "AI Fundamentals",
  "Prompt Engineering",
  "Claude Cowork",
  "Connected Second Brain",
  "AI Workflows",
  "Custom Claude Skills",
  "Automation",
  "AI Agents",
];

const esc = (s) =>
  String(s).replace(/&(?![a-zA-Z#0-9]+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// The card as the page ships it, and the same card with the topics added.
const CARD_FROM =
  "<article><strong>24</strong><h3>Interactive Modules</h3><p>Full of examples, videos, step-by-step instructions.</p></article>";

const CARD_TO = `<article class="cur-card"><strong>24</strong><h3>Interactive Modules</h3><p>Full of examples, videos, step-by-step instructions.</p><div class="cur-learn"><p class="cur-label">What you&rsquo;ll learn</p><ol class="cur-months"><li class="cur-month"><p class="cur-mhead"><b>Month 1</b>Foundations<i>get fluent</i></p><p class="cur-mout">Learning <em>advanced prompt engineering</em> and <em>context management</em> techniques. <em>Claude Projects</em> that hold everything about your business so you stop re-explaining it. Get AI to work across your documents, images and screenshots. Building your first <em>AI-powered workflow</em>, end to end.</p></li><li class="cur-month"><p class="cur-mhead"><b>Month 2</b>Automating Your Tasks<i>get your time back</i></p><p class="cur-mout">Teaching AI your job. <em>Custom Claude skills</em> built around how you actually work, and a <em>meta skill</em> that writes the next ones. <em>Claude Cowork automations</em> and <em>Claude in Chrome browser automations</em> across the tools you already use, scheduled to run without you.</p></li><li class="cur-month"><p class="cur-mhead"><b>Month 3</b>Agentic AI<i>go autonomous</i></p><p class="cur-mout">Handing whole jobs over to AI. Building <em>autonomous AI agents</em> that carry out complete processes on their own &mdash; deciding what to do next, working across your tools, running start to finish without you &mdash; then an <em>orchestrator AI agent</em> that directs them all as one system. Effectively, your own <em>virtual employees</em>.</p></li></ol><a class="dark-button cur-cta" href="#enquire" data-intent="curriculum">Request the full curriculum &rarr;</a></div></article>`;

const STYLE = `<style id="cur-style">
        .cur-card .cur-learn{margin-top:20px;padding-top:18px;border-top:1px solid rgba(11,24,48,.10)}
        .cur-label{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.15em;text-transform:uppercase;color:#2867e8;margin:0 0 14px;font-weight:700}
        .cur-topics{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 22px}
        /* The page styles every <li> with a top rule and 13px of vertical
           padding, which made each of these 65px tall. The rules are for its
           own long-form lists, not an eight-item label grid. */
        .cur-topics li{display:flex!important;gap:9px;align-items:baseline;font-size:14.5px;line-height:1.4;color:#27313f;min-width:0;padding:0!important;border:0!important;margin:0!important}
        .cur-topics li span{flex:none;font-family:'DM Mono',monospace;font-size:11px;color:#a2abb7}
        .cur-foot{font-size:12.5px;line-height:1.5;color:#8a93a1;margin:16px 0 0}
        /* Months, not module names. The 24 titles are the thing people enquire
           for; what sells here is what they walk away holding. */
        .cur-months{list-style:none;margin:0;padding:0;display:grid;gap:14px}
        .cur-month{display:block}
        .cur-mhead{display:flex;align-items:baseline;flex-wrap:wrap;gap:8px;margin:0 0 4px}
        .cur-mhead b{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.14em;
          text-transform:uppercase;font-weight:700;color:#2867e8}
        .cur-mhead i{font-style:normal;font-size:12px;color:#8a93a1}
        .cur-mhead{font-size:14.5px;font-weight:700;color:#0b1830;letter-spacing:-.01em}
        .cur-mout{margin:0;font-size:13.5px;line-height:1.5;color:#4a5462}
        .cur-foot b{color:#0b1830;font-weight:800}

        .cur-mout em{font-style:normal;font-weight:700;color:#2867e8}html:root:root:root:root:root:root:root:root:root:root body main .program-cards .cur-card .cur-mout em{color:#2867e8!important}html:root:root:root:root:root:root:root:root:root:root body main .program-cards .cur-card:hover .cur-mout em{color:#a9ccff!important}




        .cur-more{display:inline-flex;align-items:center;gap:7px;margin:14px 0 0;font-size:14px;font-weight:700;text-decoration:none;border-bottom:1.5px solid currentColor;padding-bottom:2px;line-height:1.2}
        .cur-more span{transition:transform .18s ease}
        .cur-more:hover span{transform:translateX(3px)}
        html:root:root:root:root:root:root:root:root:root:root body main .program-cards .cur-card .cur-cta{background:#0b1631!important;color:#fff!important}html:root:root:root:root:root:root:root:root:root:root body main .program-cards .cur-card:hover .cur-cta{background:#fff!important;color:#0b1631!important}


        /* The row is three equal columns, so the taller modules card stretched
           the other two into half-empty boxes. Give the modules card the left
           column across both rows and let the other two stack beside it, which
           is how the reference lays it out. */
        @media(min-width:861px){
          /* The cards flip to a dark gradient on :hover and the page recolours its
           own <p> and <strong> to suit. Anything added here keeps whatever
           colour it was given, so the label row and the topic list stayed dark
           slate on dark navy and effectively vanished. These restate both
           states at the page's own specificity. */
        html:root:root:root:root:root:root:root:root:root:root body main .program-cards .cur-card .cur-label{color:#2867e8!important}
        html:root:root:root:root:root:root:root:root:root:root body main .program-cards .cur-card:hover .cur-label{color:#a9ccff!important}
        html:root:root:root:root:root:root:root:root:root:root body main .program-cards .cur-card .cur-topics li{color:#27313f!important}
        html:root:root:root:root:root:root:root:root:root:root body main .program-cards .cur-card:hover .cur-topics li{color:#eaf1ff!important}
        html:root:root:root:root:root:root:root:root:root:root body main .program-cards .cur-card .cur-topics li span{color:#a2abb7!important}
        html:root:root:root:root:root:root:root:root:root:root body main .program-cards .cur-card:hover .cur-topics li span{color:#93b8f5!important}
        html:root:root:root:root:root:root:root:root:root:root body main .program-cards .cur-card .cur-more{color:#2867e8!important}
        html:root:root:root:root:root:root:root:root:root:root body main .program-cards .cur-card:hover .cur-more{color:#ffffff!important}
        html:root:root:root:root:root:root:root:root:root:root body main .program-cards .cur-card .cur-learn{border-top-color:rgba(11,24,48,.10)!important}
        html:root:root:root:root:root:root:root:root:root:root body main .program-cards .cur-card:hover .cur-learn{border-top-color:rgba(255,255,255,.22)!important}

        /* The page sets this row with ten chained :root selectors, so a plain
             .program-cards loses even with !important. Matching the prefix and
             relying on source order (this <style> sits later in the document)
             is what actually wins. */
          html:root:root:root:root:root:root:root:root:root:root body main .program-cards{grid-template-columns:1.25fr 1fr!important;align-items:start!important}
          html:root:root:root:root:root:root:root:root:root:root body main .program-cards .cur-card{grid-row:span 2!important}
        }

        @media(max-width:860px){
          /* The labels are two or three words, so they stay in two columns on a
             phone. Stacking them was what made the first version taller on
             mobile than the full-width section it replaced. */
          .cur-topics{gap:9px 14px}
          .cur-topics li{font-size:13.5px}
        }
      </style>`;

let html = fs.readFileSync(PAGE, "utf8");

// --- undo any previous run -------------------------------------------------
html = html.replace(/<section class="campaign-curriculum"[\s\S]*?<\/section>/, "");
html = html.replace(/<style id="cur-style">[\s\S]*?<\/style>/, "");
html = html.replace(/<div class="cur-away">[\s\S]*?<\/ul><\/div>/, "");
if (html.includes('<article class="cur-card">')) {
  html = html.replace(/<article class="cur-card">[\s\S]*?<\/article>/, CARD_FROM);
}

if (!html.includes(CARD_FROM)) {
  throw new Error('could not find the "24 Interactive Modules" card to extend');
}
html = html.replace(CARD_FROM, CARD_TO);

// The style block goes straight after the three cards.
const CARDS_END = '</article></div>';
const at = html.indexOf(CARDS_END, html.indexOf('<div class="program-cards">'));
if (at === -1) throw new Error("could not find the end of the program-cards row");
html = html.slice(0, at + CARDS_END.length) + STYLE + html.slice(at + CARDS_END.length);

fs.writeFileSync(PAGE, html);
console.log(`  topics in the modules card: ${TOPICS.length}`);
