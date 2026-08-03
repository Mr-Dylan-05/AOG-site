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
