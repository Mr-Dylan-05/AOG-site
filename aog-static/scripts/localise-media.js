#!/usr/bin/env node
/**
 * localise-media.js — cut the WordPress media cord.
 *
 * The site used to serve images straight out of the WordPress media library
 * (../wp-content/uploads, 2.2 GB, git-ignored) via a build-time symlink, and in
 * places via the old KeyCDN mirrors. Neither survives a git-based host: the
 * symlink points outside the repo and the CDN is WordPress-era infrastructure.
 *
 * This copies ONLY the images the site actually references (~370 of ~12,000)
 * into public/assets/media/, keeping the year/month subpaths so filenames can't
 * collide, then rewrites every reference to point at the local copy.
 *
 *   /wp-content/uploads/2024/11/foo.png                     -> /assets/media/2024/11/foo.png
 *   https://adongroup-1712c.kxcdn.com/wp-content/uploads/... -> /assets/media/...
 *   /wp-content/plugins/<x>/img/bar.png                     -> /assets/media/_plugins/<x>/img/bar.png
 *
 * Old image URLs stay alive via a catch-all rule in public/_redirects.
 *
 * Usage:  node scripts/localise-media.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const WP = path.join(ROOT, "..");                       // the old WordPress install
const MEDIA_OUT = path.join(ROOT, "public", "assets", "media");
const DRY = process.argv.includes("--dry");

// Hosts that served the same wp-content tree: the old KeyCDN mirrors, plus the
// WordPress sites themselves (some page content — especially anything recovered
// from the database dump — uses fully-qualified URLs rather than paths).
const HOSTS = [
  "adongroup-1712c.kxcdn.com",
  "adonworkforce-1712c.kxcdn.com",
  "adongroup.com.au",
  "www.adongroup.com.au",
  "adongroup.adondevelopment.com",
  "adonworkforce.com.au",
];
const CDN_HOSTS = HOSTS.flatMap((h) => [`https://${h}`, `http://${h}`]);

/** Every source file that can carry a media reference. */
function sourceFiles() {
  const out = [];
  const walk = (dir, exts) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, exts);
      else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
    }
  };
  walk(path.join(ROOT, "public"), [".html"]);
  walk(path.join(ROOT, "src", "pages"), [".njk", ".html", ".md"]);
  walk(path.join(ROOT, "src", "_includes"), [".njk"]);
  out.push(path.join(ROOT, "src", "_data", "site.json"));
  return out.filter((f) => fs.existsSync(f));
}

/** Strip query strings / fragments / stray HTML entities from a captured URL. */
function cleanRef(ref) {
  return ref.replace(/[?#].*$/, "").replace(/&(amp|quot|#0?39);.*$/, "");
}

const REF_RE = /\/wp-content\/(uploads|plugins)\/([^\s"'`)<>\\]+)/g;

// ---------------------------------------------------------------- collect
const referenced = new Map(); // relative source path -> destination subpath
for (const file of sourceFiles()) {
  const content = fs.readFileSync(file, "utf8");
  let m;
  while ((m = REF_RE.exec(content)) !== null) {
    const kind = m[1];
    const rest = cleanRef(m[2]);
    if (!rest) continue;
    const from = path.join(WP, "wp-content", kind, rest);
    const to = kind === "uploads" ? rest : path.join("_plugins", rest);
    referenced.set(from, to);
  }
}

// ---------------------------------------------------------------- copy
let copied = 0, bytes = 0, already = 0;
const missing = [];
for (const [from, to] of referenced) {
  if (!fs.existsSync(from)) { missing.push(to); continue; }
  const dest = path.join(MEDIA_OUT, to);
  if (fs.existsSync(dest)) { already++; continue; }
  bytes += fs.statSync(from).size;
  copied++;
  if (DRY) continue;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(from, dest);
}

// ---------------------------------------------------------------- rewrite
let filesChanged = 0, refsRewritten = 0;
for (const file of sourceFiles()) {
  const before = fs.readFileSync(file, "utf8");
  let after = before;
  for (const host of CDN_HOSTS) {
    after = after.split(`${host}/wp-content/uploads/`).join("/assets/media/");
    after = after.split(`${host}/wp-content/plugins/`).join("/assets/media/_plugins/");
  }
  after = after.split("/wp-content/uploads/").join("/assets/media/");
  after = after.split("/wp-content/plugins/").join("/assets/media/_plugins/");

  // Repair pass: an earlier version of this script only knew about the kxcdn
  // hosts, so a fully-qualified WordPress URL had its *path* rewritten while the
  // *host* was left behind — producing things like
  //   https://adongroup.adondevelopment.com/assets/media/2020/12/ic-check.svg
  // which 404s, even though the file sits right there in public/assets/media/.
  // Harmless to re-run once everything is already root-relative.
  for (const host of CDN_HOSTS) {
    after = after.split(`${host}/assets/media/`).join("/assets/media/");
  }
  if (after === before) continue;
  refsRewritten += (before.match(REF_RE) || []).length;
  filesChanged++;
  if (!DRY) fs.writeFileSync(file, after);
}

// ---------------------------------------------------------------- report
const mb = (bytes / 1024 / 1024).toFixed(1);
console.log(`${DRY ? "[dry run] " : ""}media localisation`);
console.log(`  referenced files : ${referenced.size}`);
console.log(`  copied           : ${copied} (${mb} MB)${already ? `, ${already} already present` : ""}`);
console.log(`  missing on disk  : ${missing.length}`);
console.log(`  refs rewritten   : ${refsRewritten} across ${filesChanged} files`);
if (missing.length) {
  console.log("\n  missing (need stand-ins or replacement art):");
  for (const m of missing.sort()) console.log(`    /assets/media/${m}`);
}
