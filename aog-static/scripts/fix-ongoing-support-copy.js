#!/usr/bin/env node
/**
 * Ongoing Support is a centrepiece of Ad On AI, not an optional add-on.
 *
 * The design export frames it as a bolt-on ("optional add-on", "not required",
 * and an FAQ that answers "Is it included?" with "No"). That is wrong about the
 * offering, and it is wrong in the most expensive place: it talks a buyer out of
 * the thing that makes the training stick.
 *
 * This runs after flatten so a re-export cannot quietly restore the old framing.
 * A missing `from` is reported loudly rather than skipped, because the usual
 * reason for one is that the designer reworded the sentence — which means the
 * old framing may be back in words this script no longer recognises.
 */
const fs = require("fs");
const path = require("path");

const LINK = 'style="color:#1BABE5;font-weight:600;text-decoration:none"';

const WORK = [
  {
    file: "public/ongoing-support/index.html",
    edits: [
      // hero
      ["An optional add-on you can layer on top of either ", "A core part of either "],
      [">Optional add-on</div>", ">Core to every program</div>"],
      // "add it to any program" section
      ["Add it to any program</span>", "Part of every program</span>"],
      ["An optional layer on top of the&nbsp;course.</h2>", "It comes with the&nbsp;program.</h2>"],
      [
        "Ongoing support and community are an add-on &mdash; not required, but there when you want to keep the momentum going after either&nbsp;program.",
        "Ongoing support and community aren&rsquo;t an extra &mdash; they&rsquo;re a core part of what Ad On AI delivers, and they&rsquo;re what keeps the momentum going long after either&nbsp;program ends.",
      ],
      // FAQ: what is it
      [
        "It's an optional layer on top of the course that keeps",
        "It's a core part of every Ad On AI program: the piece that keeps",
      ],
      // FAQ: is it included — the answer flips
      [
        `<div>No. It's an optional add-on after <a href="/programs/" ${LINK}>the program</a>, not a core inclusion. The program itself includes lifetime academy access.</div>`,
        `<div>Yes. It's one of the centrepieces of what we deliver, not an extra you bolt on afterwards &mdash; every <a href="/programs/" ${LINK}>program</a> includes it, along with lifetime academy access.</div>`,
      ],
      // closing CTA
      ["can be added on top of either program.", "come with either program."],
    ],
  },
  {
    file: "public/programs/index.html",
    edits: [
      ["Optional ongoing support</h3>", "Ongoing support included</h3>"],
      ["Ongoing &middot; add-on</span>", "Ongoing &middot; included</span>"],
      [
        "An optional add-on: monthly sessions on new tools and lifetime academy access keep their skills current",
        "Included with the program: monthly sessions on new tools and lifetime academy access keep their skills current",
      ],
      [
        "Add lifetime academy access, a monthly trends webinar and a community on top to keep skills sharp",
        "Lifetime academy access, a monthly trends webinar and a community keep skills sharp",
      ],
      [`access, and optional <a href="/ongoing-support/"`, `access, and <a href="/ongoing-support/"`],
      ["&mdash; is available to keep skills current", "&mdash; comes with every program to keep skills current"],
      ["— is available to keep skills current", "— comes with every program to keep skills current"],
    ],
    optional: ["&mdash; is available to keep skills current", "— is available to keep skills current"],
  },
  {
    file: "public/bpo-program/index.html",
    edits: [
      [">Optional add-on</span>", ">Included with the program</span>"],
      [
        `Add <a href="/ongoing-support/" ${LINK}>ongoing support</a> on top of the BPO program`,
        `<a href="/ongoing-support/" ${LINK}>Ongoing support</a> comes with the BPO program`,
      ],
    ],
  },
];

let changed = 0;
let already = 0;
const missing = [];

for (const { file, edits, optional = [] } of WORK) {
  const abs = path.join(process.cwd(), file);
  if (!fs.existsSync(abs)) {
    missing.push(`${file} (file not found)`);
    continue;
  }
  let html = fs.readFileSync(abs, "utf8");
  const before = html;

  for (const [from, to] of edits) {
    if (html.includes(from)) {
      html = html.split(from).join(to);
      changed++;
    } else if (html.includes(to)) {
      already++; // already applied — this script is idempotent
    } else if (!optional.includes(from)) {
      missing.push(`${file}: ${from.slice(0, 70)}…`);
    }
  }

  if (html !== before) fs.writeFileSync(abs, html);
}

console.log(`Ongoing Support copy: ${changed} replaced, ${already} already correct.`);
if (missing.length) {
  console.log("  ⚠  not found — check the wording hasn't changed upstream:");
  missing.forEach((m) => console.log("     " + m));
  process.exitCode = 1;
}
