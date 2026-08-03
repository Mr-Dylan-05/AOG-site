const fs = require("fs");
const path = require("path");

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
    try {
      require("./scripts/complete-head-meta.js");
    } catch (e) {
      console.warn("[head] completion failed:", e.message);
    }
  });

  // Schema.org JSON-LD.
  //
  // Injected after the build rather than from a template, because half the site
  // (the flattened design pages in public/) is passthrough-copied and never goes
  // through base.njk. Doing it here covers both page sources from one place.
  eleventyConfig.on("eleventy.after", () => {
    try {
      require("./scripts/inject-schema.js");
    } catch (e) {
      console.warn("[schema] injection failed:", e.message);
    }
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
    const endpoint = site.thirdParty && site.thirdParty.formEndpoint;
    const file = path.join(__dirname, "_site", "contact-us", "index.html");
    if (!fs.existsSync(file)) return;

    if (!endpoint) {
      console.log("[form] thirdParty.formEndpoint not set — contact form left inert");
      return;
    }

    let html = fs.readFileSync(file, "utf8");
    html = html.replace(
      /<form onsubmit="return false"/,
      `<form action="${endpoint}" method="POST"`
    );
    fs.writeFileSync(file, html);
    console.log(`[form] contact form wired to ${endpoint}`);
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
