#!/usr/bin/env node
/**
 * fix-cross-domain.js — stop pages on adongroup.com.au pointing at adon-ai.com.au.
 *
 * The bio pages came across from the deployed Ad On AI site with their original
 * head intact, which left two of them carrying `rel="canonical"` to the other
 * domain. A canonical is not a hint: it tells Google the real version of this
 * page lives elsewhere and to credit that domain instead. On the pages that
 * introduce the people who deliver the AI training, that is the exact signal
 * the site can least afford to give away — and og:url and the imported JSON-LD
 * @ids said the same thing more quietly.
 *
 * Runs after the import so a re-import cannot restore any of it.
 *
 * Two things are deliberately left alone:
 *   - /resources/… links, because those four articles genuinely only exist on
 *     the other domain. Rewriting them would manufacture a 404; they want
 *     porting, which is a content job, not a rewrite.
 *   - Asset URLs (anything with a file extension), which may not exist here.
 */
const fs = require("fs");
const path = require("path");

const OLD = "https://www.adon-ai.com.au";
const NEW = "https://adongroup.com.au";

/** A path that should keep pointing at the old domain. */
const keep = (p) => p.startsWith("/resources/") || /\.[a-z0-9]{2,4}$/i.test(p);

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f);
    else if (e.name.endsWith(".html")) files.push(f);
  }
})("public");

let pages = 0, rewritten = 0, kept = 0;

for (const file of files) {
  const before = fs.readFileSync(file, "utf8");
  if (!before.includes(OLD)) continue;

  const after = before.replace(
    new RegExp(OLD.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^\"'\\s>)]*)", "g"),
    (match, rest) => {
      if (keep(rest)) { kept++; return match; }
      rewritten++;
      // trailingSlash is on, so emit the slashed form rather than eat a 308.
      const p = rest && !rest.endsWith("/") ? rest + "/" : rest || "/";
      return NEW + p;
    }
  );

  if (after !== before) { fs.writeFileSync(file, after); pages++; }
}

console.log(`Cross-domain: ${rewritten} references re-pointed across ${pages} pages (${kept} left on adon-ai.com.au by design).`);
