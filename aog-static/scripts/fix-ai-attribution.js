#!/usr/bin/env node
/**
 * fix-ai-attribution.js — put Ad On Group's name on the AI training pages.
 *
 * The AI pages arrived titled "… | Ad On AI", which asks a search engine to
 * credit a brand with no trading history, no reviews and no external mentions,
 * on the domain of a company that has all three. Ad On AI is the name of the
 * program; Ad On Group delivers it, and Ad On Group is the entity worth
 * accumulating signal against. So the program keeps its name in the title and
 * the group takes the suffix.
 *
 * Titles only. Body copy is left exactly as written.
 */
const fs = require("fs");
const path = require("path");

/** Pages whose title needs more than the suffix swap. */
const SPECIAL = [
  [
    "<title>Ad On AI | Practical AI Training &amp; Enablement for Business</title>",
    "<title>Ad On AI — AI Training &amp; Enablement | Ad On Group</title>",
  ],
  [
    "<title>Submit a Referral | Ad On AI Partner Program</title>",
    "<title>Submit a Referral | Ad On Group AI Partner Program</title>",
  ],
];

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f);
    else if (e.name === "index.html") files.push(f);
  }
})("public");

let changed = 0;
const touched = [];

for (const file of files) {
  const before = fs.readFileSync(file, "utf8");
  let after = before;

  for (const [a, b] of SPECIAL) if (after.includes(a)) after = after.replace(a, b);

  // A second <h1>, inside the learning-platform mockup. It is a picture of an
  // app, not a heading of this page, and it left /ad-on-ai-division/ with two
  // competing H1s on the page meant to own "AI training". .aca-h1 sets margin,
  // family, size, weight, colour and tracking explicitly, so a div renders
  // identically.
  after = after.replace(
    /<h1 class="aca-h1">([\s\S]*?)<\/h1>/g,
    (_m, inner) => `<div class="aca-h1">${inner}</div>`
  );

  // The general case: an "| Ad On AI" suffix on the title, and on og:title
  // where the export duplicated it.
  after = after
    .replace(/\| Ad On AI<\/title>/g, "| Ad On Group</title>")
    .replace(/\| Ad On AI"(\s*\/?>)/g, '| Ad On Group"$1');

  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
    touched.push(file.replace("public", "").replace("index.html", ""));
  }
}

console.log(`AI attribution: ${changed} page titles now credit Ad On Group.`);
touched.forEach((u) => console.log("   " + u));
