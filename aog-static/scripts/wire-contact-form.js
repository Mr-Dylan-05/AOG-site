#!/usr/bin/env node
/**
 * wire-contact-form.js — turn the contact form from a mockup into a real form.
 *
 * The flattened design page shipped `<form onsubmit="return false">` with fields
 * that have NO name attributes. Even pointed at a form service it would have
 * submitted an empty payload — so this adds names, values and required flags.
 *
 * The endpoint itself is NOT set here. It is stamped in at build time from
 * `thirdParty.formEndpoint` in src/_data/site.json (see .eleventy.js), so the
 * form starts working the moment that value is filled in, with no code change.
 *
 * Idempotent: re-running does nothing once the fields are named.
 *
 * Usage:  node scripts/wire-contact-form.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "public", "contact-us", "index.html");
const DRY = process.argv.includes("--dry");

let html = fs.readFileSync(FILE, "utf8");

if (/name="firstName"/.test(html)) {
  console.log("contact form already wired — nothing to do");
  process.exit(0);
}

const form = html.match(/<form[\s\S]*?<\/form>/);
if (!form) { console.error("! no <form> found in public/contact-us/index.html"); process.exit(1); }

let f = form[0];

// Fields in document order. Each tag type is counted as we go, so the first
// text input gets firstName and the second gets lastName — a plain sequential
// replace would put both on the first one, since it still matches afterwards.
const FIELDS = {
  '<input type="text"': [
    'name="firstName" required autocomplete="given-name"',
    'name="lastName" required autocomplete="family-name"',
  ],
  '<input type="email"': ['name="email" required autocomplete="email"'],
  '<input type="tel"': ['name="phone" required autocomplete="tel"'],
  "<textarea": ['name="message" required'],
};

let named = 0;
for (const [tag, attrsList] of Object.entries(FIELDS)) {
  let seen = 0;
  f = f.split(tag).reduce((acc, part, i) => {
    if (i === 0) return part;
    const attrs = attrsList[seen++];
    named += attrs ? 1 : 0;
    return acc + tag + (attrs ? ` ${attrs}` : "") + part;
  }, "");
}

// Contact-preference radios already share a name; they just need values, and
// one of them needs to be the default so the required group can be satisfied.
let radio = 0;
f = f.replace(/<input type="radio" name="contactpref"/g, () => {
  radio++;
  return radio === 1
    ? '<input type="radio" name="contactPreference" value="email" checked required'
    : '<input type="radio" name="contactPreference" value="phone"';
});

// Honeypot: bots fill hidden fields, humans don't. Costs nothing, and every
// form service supports ignoring a named field.
f = f.replace(
  /<button type="submit"/,
  '<input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">\n        <button type="submit"'
);

html = html.replace(form[0], f);

if (!DRY) fs.writeFileSync(FILE, html);

console.log(`${DRY ? "[dry run] " : ""}contact form wired`);
console.log(`  named fields   : ${named}`);
console.log(`  radio values   : ${radio}`);
console.log(`  honeypot added : yes`);
console.log(`  endpoint       : stamped at build from site.json thirdParty.formEndpoint`);
