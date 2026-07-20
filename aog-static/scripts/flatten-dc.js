#!/usr/bin/env node
/**
 * flatten-dc.js — convert a Claude Design ".dc.html" page into a clean,
 * dependency-free static HTML page (no React runtime, no support.js).
 *
 * Pure string transforms (no DOM re-serialization — parsers corrupt the markup):
 *   - <helmet> contents            -> real <head>
 *   - content between </helmet> and </x-dc> -> <body>
 *   - style-hover/-after/-before   -> unique data-attr + matching CSS rule
 *   - <script>, <template id=__bundler_thumbnail> (runtime/editor) -> dropped
 *   - {{ accent }}                 -> the page's accent colour (from data-props)
 *   - <sc-for list="{{ name }}" as="x"> -> expanded from a --data JSON list
 *   - <sc-if value="{{ x.flag }}">  -> kept only when the value is truthy
 *   - {{ starRow }}/{{ starRowSm }} -> baked 5-star SVG rows (house helper)
 *   - {{ x.field }} inside loops    -> the item's field
 *   - controls with onClick="{{…}}" -> removed (dead without JS)
 *   - assets/… -> /assets/design/… ; Foo.dc.html links -> /foo/ slugs
 *
 * Dynamic list/flag data lives in each page's component <script>. Supply it as a
 * --data JSON file: { "team": [ {name, role, photo, cert, av}, … ] }. Run once,
 * read the "unresolved binding" warnings, and add whatever it reports.
 *
 * Usage: node scripts/flatten-dc.js "<in.dc.html>" "<out.html>" [--data=x.json]
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

// Render a React.createElement(...) tree to an HTML string (the design's
// component scripts build star rows etc. this way).
function renderEl(tag, props, children) {
  props = props || {};
  let attrs = "";
  for (const [k, v] of Object.entries(props)) {
    if (k === "key" || v == null || v === false) continue;
    if (k === "style" && typeof v === "object") {
      attrs += ` style="${Object.entries(v).map(([p, val]) => `${p.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}:${val}`).join(";")}"`;
    } else if (k === "className") attrs += ` class="${v}"`;
    else attrs += ` ${k}="${String(v).replace(/"/g, "&quot;")}"`;
  }
  const kids = [].concat(children).flat(Infinity).map((c) => (c == null ? "" : typeof c === "object" && c.__html !== undefined ? c.__html : String(c))).join("");
  return { __html: `<${tag}${attrs}>${kids}</${tag}>` };
}

// Run a page's <script data-dc-script> component to recover its data
// (accent, team[], reviews[], …) without the browser React runtime.
function evalComponentData(raw) {
  const sm = raw.match(/data-dc-script[^>]*>([\s\S]*?)<\/script>/i);
  if (!sm) return {};
  const body = sm[1];
  let props = {};
  const dp = raw.match(/data-props="([^"]*)"/);
  if (dp) {
    try {
      const o = JSON.parse(dp[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
      for (const [k, v] of Object.entries(o)) if (v && typeof v === "object" && "default" in v) props[k] = v.default;
    } catch (_) {}
  }
  const sandbox = {
    React: { createElement: (t, p, ...c) => renderEl(t, p, c) },
    window: { __resources: {} },
    console: { log() {}, warn() {}, error() {} },
    __result: null,
  };
  sandbox.DCLogic = class { constructor() { this.props = props; this.state = {}; } setState() {} };
  try {
    vm.createContext(sandbox);
    vm.runInContext(body + "\n__result = (typeof Component!=='undefined') ? new Component().renderVals() : {};", sandbox, { timeout: 2000 });
    return sandbox.__result || {};
  } catch (e) {
    console.warn(`[warn] could not evaluate component script: ${e.message}`);
    return {};
  }
}

const input = process.argv[2];
const output = process.argv[3];
const dataArg = (process.argv.find((a) => a.startsWith("--data=")) || "").split("=")[1];
if (!input || !output) {
  console.error('Usage: node scripts/flatten-dc.js "<in.dc.html>" "<out.html>" [--data=x.json]');
  process.exit(1);
}
const raw = fs.readFileSync(input, "utf8");

// ---- data: --data JSON (wins) + evaluated component data + accent + star helpers ----
const data = dataArg ? JSON.parse(fs.readFileSync(dataArg, "utf8")) : {};
const evalData = evalComponentData(raw);
for (const [k, v] of Object.entries(evalData)) if (data[k] == null) data[k] = v;
if (data.accent == null) {
  let accent = "#2F6FED";
  const dp = raw.match(/data-props="([^"]*)"/);
  if (dp) { try { const o = JSON.parse(dp[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&")); if (o.accent && o.accent.default) accent = o.accent.default; } catch (_) {} }
  const alt = raw.match(/accent\s*=\s*this\.props\.accent\s*\?\?\s*'(#[0-9A-Fa-f]{3,8})'/);
  data.accent = alt ? alt[1] : accent;
}
const star = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" style="display:block"><path fill="#FBB400" d="M12 2l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.3 6.1 20l1.3-6.6L2.5 8.9l6.6-.8z"></path></svg>`;
const starRow = (s) => [1, 2, 3, 4, 5].map(() => `<span>${star(s)}</span>`).join("");
if (data.starRow == null) data.starRow = starRow(15);
if (data.starRowSm == null) data.starRowSm = starRow(12);

// ---- split <head> (helmet) from body content ----
const hm = raw.match(/<helmet>([\s\S]*?)<\/helmet>/i);
let headInner = hm ? hm[1].trim() : "";
const afterHelmet = raw.includes("</helmet>") ? raw.split("</helmet>")[1] : raw;
const xdcEnd = afterHelmet.lastIndexOf("</x-dc>");
let body = xdcEnd >= 0 ? afterHelmet.slice(0, xdcEnd) : afterHelmet;

// ---- drop runtime/editor cruft ----
body = body.replace(/<script\b[\s\S]*?<\/script>/gi, "");
body = body.replace(/<template\b[^>]*__bundler_thumbnail[\s\S]*?<\/template>/gi, "");
body = body.replace(/<button\b[^>]*on[A-Za-z]+="{{[^}]*}}"[\s\S]*?<\/button>/gi, "");

// ---- bake style-hover/-after/-before into CSS via unique data-attrs ----
const rules = [];
let n = 0;
const PSEUDO = { "style-hover": [":hover", "h"], "style-after": ["::after", "a"], "style-before": ["::before", "b"] };
for (const attr of Object.keys(PSEUDO)) {
  const [pseudo, prefix] = PSEUDO[attr];
  body = body.replace(new RegExp(`\\s${attr}="([^"]*)"`, "g"), (_m, decls) => {
    const id = prefix + (n++).toString(36);
    let d = decls.trim();
    if (d && !d.endsWith(";")) d += ";";
    rules.push(`[data-dc="${id}"]${pseudo}{${d}}`);
    return ` data-dc="${id}"`;
  });
}

// ---- template resolver (scoped {{ }} + <sc-if>) ----
const resolvePath = (p, scope) => p.trim().split(".").reduce((o, k) => (o == null ? undefined : o[k]), scope);
const renderVal = (v) =>
  v == null ? "" : Array.isArray(v) ? v.map(renderVal).join("") : typeof v === "object" && v.__html !== undefined ? v.__html : String(v);
function applyScope(str, scope) {
  str = str.replace(/<sc-if\b[^>]*\bvalue="{{\s*([^}]+?)\s*}}"[^>]*>([\s\S]*?)<\/sc-if>/gi, (_m, cond, inner) =>
    resolvePath(cond, scope) ? expand(inner, scope) : ""
  );
  str = str.replace(/{{\s*([^}]+?)\s*}}/g, (m, expr) => {
    const v = resolvePath(expr, scope);
    return v === undefined ? m : renderVal(v);
  });
  return str;
}

// Recursively expand <sc-for> (handles nesting via depth-matched close tags),
// then resolve <sc-if> / {{ }} at the base.
const OPEN_FOR = /<sc-for\b[^>]*\blist="{{\s*([\w.]+)\s*}}"[^>]*\bas="(\w+)"[^>]*>/;
function expand(str, scope) {
  const m = OPEN_FOR.exec(str);
  if (!m) return applyScope(str, scope);
  const afterOpen = m.index + m[0].length;
  let depth = 1;
  const tagRe = /<sc-for\b|<\/sc-for>/g;
  tagRe.lastIndex = afterOpen;
  let t, closeStart = -1, closeEnd = -1;
  while ((t = tagRe.exec(str))) {
    if (t[0] === "</sc-for>") { if (--depth === 0) { closeStart = t.index; closeEnd = tagRe.lastIndex; break; } }
    else depth++;
  }
  if (closeStart < 0) return applyScope(str, scope); // malformed — bail
  const tmpl = str.slice(afterOpen, closeStart);
  const items = resolvePath(m[1], scope) || [];
  if (!Array.isArray(items) || !items.length) console.warn(`[warn] sc-for over "${m[1]}" is empty`);
  const expanded = (Array.isArray(items) ? items : []).map((item) => expand(tmpl, { ...scope, [m[2]]: item })).join("\n");
  return applyScope(str.slice(0, m.index), scope) + expanded + expand(str.slice(closeEnd), scope);
}
body = expand(body, data);

// ---- rewrites: assets + internal links ----
const slugify = (name) => {
  const b = name.replace(/\.dc\.html$/i, "").trim();
  if (/^Ad On Group\s*-\s*Home$/i.test(b)) return "/";
  return "/" + b.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + "/";
};
const rewrite = (s) =>
  s
    .replace(/(["'(])\/?assets\//g, "$1/assets/design/")
    .replace(/href="([^"]+?)\.dc\.html(#[^"]*)?"/g, (_m, name, frag) => `href="${slugify(name)}${frag || ""}"`);
headInner = rewrite(headInner);
body = rewrite(body);

// ---- report + strip any leftover unresolved bindings ----
const leftover = [...body.matchAll(/{{\s*([^}]+?)\s*}}/g)].map((m) => m[1].trim());
if (leftover.length) {
  console.warn(`[warn] ${leftover.length} unresolved binding(s): ${[...new Set(leftover)].join(", ")}`);
  body = body.replace(/{{\s*[^}]+?\s*}}/g, "");
}

const generatedCss = rules.length ? `\n<style>/* baked from style-hover/after (was support.js) */\n${rules.join("\n")}\n</style>` : "";
const html = `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${headInner}${generatedCss}
</head>
<body>
${body.trim()}
</body>
</html>
`;
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, html, "utf8");
console.log(`✓ flattened ${path.basename(input)} -> ${output}  (accent ${data.accent})`);
console.log(`  baked ${rules.length} interaction rules; body ${body.length}b`);
