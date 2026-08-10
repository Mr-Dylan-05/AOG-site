const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

/**
 * Run a post-build script as a child process.
 *
 * These used to be invoked with require(), which was a serious bug: require()
 * caches, so each script ran ONCE per process. A one-off `npm run build` was
 * fine, but under `eleventy --serve` every rebuild regenerated the HTML and the
 * post-processing never ran again — silently stripping the mobile stylesheet,
 * the JSON-LD, the analytics tag and the form endpoint from every page. The
 * build still logged success, because the scripts had run (once, at startup).
 *
 * A child process has no such cache and re-runs on every build.
 */
function runStep(script, label) {
  try {
    const out = execFileSync("node", [path.join(__dirname, "scripts", script)], {
      encoding: "utf8",
    });
    process.stdout.write(out);
  } catch (e) {
    console.warn(`[${label}] failed:`, e.message.split("\n")[0]);
  }
}

module.exports = function (eleventyConfig) {
  // {% year %} -> current year (for footer copyright, etc.)
  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));

  // Static assets (CSS/JS/fonts) shipped with the new site
  eleventyConfig.addPassthroughCopy("src/assets");
  // Root-level files: robots.txt, favicon, _redirects, etc.
  eleventyConfig.addPassthroughCopy({ "public": "/" });

  // Media is fully self-contained: images live in public/assets/media/ and are
  // copied out by the passthrough above.
  //
  // This used to symlink the WordPress media library (../wp-content/uploads,
  // ~2.2 GB) into the output. That worked on a laptop but could never work on a
  // git-based host — the target sits outside the repo and is git-ignored, so a
  // deploy would have shipped a site of broken images. scripts/localise-media.js
  // copied in the ~370 images actually referenced (~41 MB) and rewrote every
  // path; old /wp-content/... URLs stay alive via public/_redirects.

  // Head metadata for the passthrough-copied design pages.
  // Runs before the schema step so JSON-LD can read the og:image it adds.
  eleventyConfig.on("eleventy.after", () => {
    runStep("complete-head-meta.js", "head");
  });

  // Schema.org JSON-LD.
  //
  // Injected after the build rather than from a template, because half the site
  // (the flattened design pages in public/) is passthrough-copied and never goes
  // through base.njk. Doing it here covers both page sources from one place.
  eleventyConfig.on("eleventy.after", () => {
    runStep("inject-schema.js", "schema");
  });

  // Contact form endpoint.
  //
  // The contact page is a flattened design page copied straight through, so it
  // can't read site.json the way a template can. This stamps the endpoint in
  // after the copy, which means filling in `thirdParty.formEndpoint` in
  // src/_data/site.json is the ONLY step needed to make the form live — no code
  // change, no redeploy of anything else.
  //
  // Until it is set the form stays deliberately inert (onsubmit="return false")
  // rather than silently posting nowhere and looking like it worked.
  eleventyConfig.on("eleventy.after", () => {
    const site = JSON.parse(
      fs.readFileSync(path.join(__dirname, "src", "_data", "site.json"), "utf8")
    );
    const tp = site.thirdParty || {};
    const endpoint = tp.formEndpoint;
    const provider = (tp.formProvider || "").toLowerCase();
    const file = path.join(__dirname, "_site", "contact-us", "index.html");
    if (!fs.existsSync(file)) return;

    let html = fs.readFileSync(file, "utf8");

    // Netlify handles forms at the host level: it detects the attributes in the
    // deployed HTML and provisions the endpoint itself, so there is nothing to
    // paste in. The hidden form-name field is how it identifies submissions.
    if (provider === "netlify") {
      html = html.replace(
        /<form([^>]*?)onsubmit="return false"/,
        `<form$1name="contact" method="POST" data-netlify="true" netlify-honeypot="_gotcha" action="/thank-you/"`
      );
      if (!html.includes('name="form-name"')) {
        html = html.replace(
          /(<form[^>]*>)/,
          `$1\n        <input type="hidden" name="form-name" value="contact">`
        );
      }
      fs.writeFileSync(file, html);
      console.log("[form] contact form wired to Netlify Forms");
      return;
    }

    if (!endpoint) {
      console.log("[form] thirdParty.formEndpoint not set — contact form left inert");
      return;
    }

    html = html.replace(
      /<form([^>]*?)onsubmit="return false"/,
      `<form$1action="${endpoint}" method="POST"`
    );
    fs.writeFileSync(file, html);
    console.log(`[form] contact form wired to ${endpoint}`);
  });

  // Every other form on the site.
  //
  // The hook above only ever knew about /contact-us/. Forms elsewhere carry
  // data-form="<key>" and take their endpoint from thirdParty.forms[key], so a
  // new form needs one line of JSON rather than a code change. A key with no
  // endpoint is left inert on purpose — the same rule the contact form follows,
  // because a form that silently posts nowhere looks like it worked.
  eleventyConfig.on("eleventy.after", () => {
    const site = JSON.parse(
      fs.readFileSync(path.join(__dirname, "src", "_data", "site.json"), "utf8")
    );
    const forms = (site.thirdParty || {}).forms || {};
    const out = path.join(__dirname, "_site");

    const walk = (dir, hits = []) => {
      if (!fs.existsSync(dir)) return hits;
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p, hits);
        else if (e.name === "index.html") hits.push(p);
      }
      return hits;
    };

    const wired = [];
    const inert = [];

    for (const file of walk(out)) {
      let html = fs.readFileSync(file, "utf8");
      let touched = false;

      html = html.replace(
        /<form([^>]*?\bdata-form="([a-z-]+)"[^>]*?)onsubmit="return false"/g,
        (whole, attrs, key) => {
          const endpoint = forms[key];
          const where = "/" + path.relative(out, path.dirname(file)) + "/";
          if (!endpoint) {
            inert.push(`${key} (${where})`);
            return whole;
          }
          touched = true;
          wired.push(`${key} -> ${endpoint}`);
          return `<form${attrs}action="${endpoint}" method="POST"`;
        }
      );

      if (touched) fs.writeFileSync(file, html);
    }

    for (const w of wired) console.log(`[form] ${w}`);
    for (const i of inert) console.log(`[form] no endpoint for ${i} — left inert`);
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "html", "md", "11ty.js"],
  };
};
