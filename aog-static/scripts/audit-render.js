#!/usr/bin/env node
/**
 * audit-render.js — load every page in a real browser and report every image
 * that does not actually appear.
 *
 * audit-images.js checks that referenced files exist on disk. That is necessary
 * but nowhere near sufficient: an image can be present and still not reach the
 * user. This drives real Chrome over the built site and reports what the
 * browser actually did, at both desktop and phone width:
 *
 *   FAILED     the network request 404'd / errored, or naturalWidth is 0
 *   COLLAPSED  loaded, but rendered at zero width or height
 *   HIDDEN     loaded, but display:none / visibility:hidden / opacity:0
 *   OVERFLOW   renders wider than the viewport (the mobile complaint)
 *   SQUASHED   displayed aspect ratio is far from the file's own
 *   BG-FAILED  a CSS background-image whose request failed
 *
 * Needs Playwright and a local Chrome. Deliberately NOT a devDependency: its
 * postinstall downloads browser binaries, and everything in package.json gets
 * installed on the deploy host, where this script is never run. Install it just
 * when you need it:
 *
 *   npm i --no-save playwright     (or: npx playwright)
 *
 * Point --base at a server for the built site (e.g. `npx serve _site`), or at
 * production to audit what users are actually getting right now.
 *
 * Usage:
 *   node scripts/audit-render.js [--base http://localhost:8899] [--json]
 *                                [--only /path/] [--desktop-only]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE = path.join(ROOT, "_site");

function arg(flag, dflt) {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : dflt;
}
const BASE = arg("--base", "http://localhost:8899").replace(/\/$/, "");
const ONLY = arg("--only", null);
const JSON_OUT = process.argv.includes("--json");
const VIEWPORTS = process.argv.includes("--desktop-only")
  ? [{ name: "desktop", width: 1280, height: 900 }]
  : [
      { name: "desktop", width: 1280, height: 900 },
      { name: "mobile", width: 390, height: 844 },
    ];

/** Every page URL in the built site. */
function pages() {
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === "index.html") {
        const rel = path.relative(SITE, path.dirname(p));
        out.push("/" + (rel ? rel + "/" : ""));
      }
    }
  })(SITE);
  return out.sort().filter((u) => !ONLY || u.includes(ONLY));
}

(async () => {
  const { chromium } = require("playwright");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const urls = pages();
  const findings = [];

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });

    for (const url of urls) {
      const page = await ctx.newPage();
      const netFail = new Map(); // url -> reason

      page.on("response", (r) => {
        const ct = r.headers()["content-type"] || "";
        if (r.status() >= 400 && (/image/.test(ct) || /\.(jpe?g|png|gif|webp|svg|avif|ico)/i.test(r.url())))
          netFail.set(r.url(), `HTTP ${r.status()}`);
      });
      page.on("requestfailed", (r) => {
        if (/\.(jpe?g|png|gif|webp|svg|avif|ico)/i.test(r.url()))
          netFail.set(r.url(), r.failure()?.errorText || "request failed");
      });

      try {
        // "load" rather than "networkidle": one page embeds a third-party
        // review widget that keeps a connection open, so networkidle never
        // settles and every page paid a 45s timeout. The scroll-and-settle
        // below is what actually commits the lazy images anyway.
        await page.goto(BASE + url, { waitUntil: "load", timeout: 30000 });
      } catch {
        // carry on with whatever loaded rather than dropping the page
      }

      // Force lazy images to commit: scroll the full height, then settle.
      await page.evaluate(async () => {
        const step = window.innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
        document.querySelectorAll("img[loading=lazy]").forEach((i) => {
          i.loading = "eager";
        });
        await new Promise((r) => setTimeout(r, 400));
      });
      await page.waitForTimeout(500);

      const result = await page.evaluate((vpWidth) => {
        const out = [];
        const seen = new Set();

        for (const img of document.querySelectorAll("img")) {
          const cs = getComputedStyle(img);
          const r = img.getBoundingClientRect();
          const src = img.currentSrc || img.src || "";
          const key = src + "|" + (img.alt || "");

          const hidden =
            cs.display === "none" ||
            cs.visibility === "hidden" ||
            parseFloat(cs.opacity) === 0;

          // A parent can hide it just as effectively.
          let ancestorHidden = false;
          for (let el = img.parentElement; el && el !== document.body; el = el.parentElement) {
            const p = getComputedStyle(el);
            if (p.display === "none" || p.visibility === "hidden" || parseFloat(p.opacity) === 0) {
              ancestorHidden = true;
              break;
            }
          }

          const loaded = img.complete && img.naturalWidth > 0;

          if (!loaded && !hidden && !ancestorHidden) {
            out.push({ type: "FAILED", src, alt: img.alt || "", detail: "naturalWidth 0 — did not load" });
            continue;
          }
          if (!loaded) continue; // hidden AND unloaded: not user-visible, skip

          if (hidden || ancestorHidden) {
            // A crossfade deck has all but one panel faded out at any instant.
            // That is the design working, not a missing image, so skip panels
            // the rotator has claimed.
            if (img.closest("[data-aog-rotates]")) continue;
            out.push({
              type: "HIDDEN",
              src,
              alt: img.alt || "",
              detail: ancestorHidden ? "an ancestor is hidden" : `${cs.display}/${cs.visibility}/${cs.opacity}`,
            });
            continue;
          }
          if (r.width < 1 || r.height < 1) {
            out.push({ type: "COLLAPSED", src, alt: img.alt || "", detail: `renders ${Math.round(r.width)}x${Math.round(r.height)}` });
            continue;
          }
          if (r.right > vpWidth + 2 || r.left < -2) {
            // A scrolling marquee is deliberately wider than the screen and is
            // clipped by an ancestor — that is the design working, not a bug.
            // Only flag overflow that actually reaches the document edge.
            let clipped = false;
            for (let el = img.parentElement; el && el !== document.documentElement; el = el.parentElement) {
              const o = getComputedStyle(el);
              if (/hidden|clip|auto|scroll/.test(o.overflowX + o.overflow)) {
                const pr = el.getBoundingClientRect();
                if (pr.right <= vpWidth + 2 && pr.left >= -2) clipped = true;
                break;
              }
            }
            if (!clipped)
              out.push({
                type: "OVERFLOW",
                src,
                alt: img.alt || "",
                detail: `spans ${Math.round(r.left)}..${Math.round(r.right)} in a ${vpWidth}px viewport`,
              });
            continue;
          }
          // aspect distortion — only flag gross cases, object-fit is legitimate
          const natural = img.naturalWidth / img.naturalHeight;
          const shown = r.width / r.height;
          if (
            cs.objectFit === "fill" &&
            natural > 0 &&
            (shown / natural > 1.6 || natural / shown > 1.6)
          ) {
            out.push({
              type: "SQUASHED",
              src,
              alt: img.alt || "",
              detail: `natural ${natural.toFixed(2)} vs shown ${shown.toFixed(2)}`,
            });
          }
        }

        // Page-level sideways scroll. Worth reporting next to the images
        // because the usual cause is one over-wide element, and an image is a
        // prime suspect — but the symptom the user feels is the whole page
        // sliding, so it belongs at page level, measured once.
        const de = document.documentElement;
        if (de.scrollWidth > de.clientWidth + 2) {
          // Name the widest element that actually crosses the right edge,
          // ignoring anything clipped by an ancestor (marquees are fine).
          let worst = null;
          for (const el of document.querySelectorAll("body *")) {
            const r = el.getBoundingClientRect();
            if (r.width < 1 || r.right <= de.clientWidth + 2) continue;
            let clipped = false;
            for (let a = el.parentElement; a && a !== de; a = a.parentElement) {
              const o = getComputedStyle(a);
              if (/hidden|clip|auto|scroll/.test(o.overflowX + o.overflow)) {
                const pr = a.getBoundingClientRect();
                if (pr.right <= de.clientWidth + 2) clipped = true;
                break;
              }
            }
            if (clipped) continue;
            if (!worst || r.right > worst.right) {
              worst = {
                right: r.right,
                tag: el.tagName.toLowerCase(),
                cls: String(el.className || "").slice(0, 40),
                img: el.tagName === "IMG" ? el.currentSrc || el.src : "",
              };
            }
          }
          out.push({
            type: "_HSCROLL",
            src: worst ? `${worst.tag}${worst.cls ? "." + worst.cls : ""}` : "(unidentified)",
            alt: "",
            detail: `page is ${de.scrollWidth}px wide in a ${de.clientWidth}px viewport` +
              (worst ? ` — widest offender reaches ${Math.round(worst.right)}px` : ""),
          });
        }

        // CSS background images actually in use
        for (const el of document.querySelectorAll("*")) {
          const bg = getComputedStyle(el).backgroundImage;
          if (!bg || bg === "none" || !bg.includes("url(")) continue;
          const m = bg.match(/url\(["']?(.*?)["']?\)/);
          if (!m) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 1 || r.height < 1) continue;
          if (seen.has(m[1])) continue;
          seen.add(m[1]);
          out.push({ type: "_BG", src: m[1], alt: "", detail: "background-image" });
        }
        return out;
      }, vp.width);

      for (const f of result) {
        // Turn background-image probes into findings only if the net failed.
        if (f.type === "_BG") {
          if (netFail.has(f.src))
            findings.push({ page: url, vp: vp.name, type: "BG-FAILED", ...f, detail: netFail.get(f.src) });
          continue;
        }
        if (f.type === "_HSCROLL") {
          findings.push({ page: url, vp: vp.name, ...f, type: "HSCROLL" });
          continue;
        }
        if (f.type === "FAILED" && netFail.has(f.src))
          f.detail = netFail.get(f.src);
        findings.push({ page: url, vp: vp.name, ...f });
      }

      // Anything that failed on the wire but wasn't matched to an element
      for (const [u, reason] of netFail) {
        if (!findings.some((f) => f.page === url && f.vp === vp.name && f.src === u))
          findings.push({ page: url, vp: vp.name, type: "FAILED", src: u, alt: "", detail: reason });
      }

      await page.close();
    }
    await ctx.close();
    process.stderr.write(`  ${vp.name} pass done (${urls.length} pages)\n`);
  }

  await browser.close();

  /* ---------------------------------------------------------------- report */
  if (JSON_OUT) {
    console.log(JSON.stringify(findings, null, 2));
    process.exit(findings.length ? 1 : 0);
  }

  const order = ["FAILED", "BG-FAILED", "COLLAPSED", "HSCROLL", "OVERFLOW", "SQUASHED", "HIDDEN"];
  const blurb = {
    FAILED: "did not load — the user sees a broken image",
    "BG-FAILED": "CSS background image failed to load",
    COLLAPSED: "loaded but renders at zero size",
    HSCROLL: "page scrolls sideways — the whole layout slides",
    OVERFLOW: "renders outside the viewport",
    SQUASHED: "stretched badly out of its natural aspect",
    HIDDEN: "loaded but hidden by CSS (often intentional)",
  };

  console.log(`\nrender audit — ${urls.length} pages x ${VIEWPORTS.length} viewport(s)\n`);
  let breaking = 0;
  for (const type of order) {
    const list = findings.filter((f) => f.type === type);
    if (!list.length) continue;
    if (type !== "HIDDEN") breaking += list.length;

    const byImg = new Map();
    for (const f of list) {
      const key = f.src.replace(/^https?:\/\/[^/]+/, "");
      if (!byImg.has(key)) byImg.set(key, { detail: f.detail, hits: [] });
      byImg.get(key).hits.push(`${f.page}${f.vp === "mobile" ? " [m]" : ""}`);
    }
    console.log(`${type} — ${blurb[type]}   (${byImg.size} images, ${list.length} occurrences)`);
    for (const [src, info] of [...byImg.entries()].sort((a, b) => b[1].hits.length - a[1].hits.length)) {
      console.log(`   ${src || "(empty src)"}`);
      console.log(`      ${info.detail}`);
      const h = info.hits;
      console.log(`      ${h.length > 4 ? h.slice(0, 4).join(", ") + ` +${h.length - 4} more` : h.join(", ")}`);
    }
    console.log("");
  }
  if (!findings.length) console.log("every image rendered on every page\n");
  process.exit(breaking ? 1 : 0);
})();
