#!/usr/bin/env node
/**
 * fix-credential-name.js — one name for the Claude certification.
 *
 * The site called it three things: "Certified Claude Expert", "Claude Certified
 * Expert" and "Claude Certified Associate". A credential is an entity, and an
 * entity with three names is three weak entities rather than one strong one —
 * which matters here more than usual, because this certification is the main
 * third-party proof that the AI training is delivered by qualified people.
 * "Claude Certified Associates" is the correct name.
 *
 * Bare "Claude Certified" used as an adjective is left alone; it reads fine and
 * is not a competing name for the credential.
 *
 * /ai-training/ is never touched. It is the paid campaign landing page and is
 * out of scope for search work by standing instruction — it already uses the
 * correct name in any case.
 */
const fs = require("fs");
const path = require("path");

/** Standing exclusion: the paid landing page is not ours to edit. */
const EXCLUDED = ["public/ai-training/"];

const RENAMES = [
  [/Certified Claude Experts/g, "Claude Certified Associates"],
  [/Certified Claude Expert/g, "Claude Certified Associate"],
  [/Claude Certified Experts/g, "Claude Certified Associates"],
  [/Claude Certified Expert(?!s)/g, "Claude Certified Associate"],
];

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f);
    else if (/\.(html|txt)$/.test(e.name)) files.push(f);
  }
})("public");

let pages = 0, replaced = 0, skipped = 0;

for (const file of files) {
  if (EXCLUDED.some((x) => file.startsWith(x))) { skipped++; continue; }
  const before = fs.readFileSync(file, "utf8");
  let after = before, n = 0;
  for (const [re, to] of RENAMES) {
    after = after.replace(re, () => { n++; return to; });
  }
  if (n) { fs.writeFileSync(file, after); pages++; replaced += n; }
}

console.log(`Credential name: ${replaced} replacements across ${pages} files (${skipped} excluded).`);
