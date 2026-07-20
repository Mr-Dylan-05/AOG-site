const fs = require("fs");
const path = require("path");

module.exports = function (eleventyConfig) {
  // {% year %} -> current year (for footer copyright, etc.)
  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));

  // Static assets (CSS/JS/fonts) shipped with the new site
  eleventyConfig.addPassthroughCopy("src/assets");
  // Root-level files: robots.txt, favicon, _redirects, etc.
  eleventyConfig.addPassthroughCopy({ "public": "/" });

  // Media reuse: the WordPress media library (../wp-content/uploads, ~2.2GB)
  // is NOT copied on every build. Instead we symlink it into the output so
  // image URLs like /wp-content/uploads/... keep working, with zero duplication.
  eleventyConfig.on("eleventy.after", () => {
    const out = path.join(__dirname, "_site", "wp-content");
    const target = path.join(__dirname, "..", "wp-content", "uploads");
    try {
      if (fs.existsSync(target)) {
        fs.mkdirSync(out, { recursive: true });
        const link = path.join(out, "uploads");
        if (!fs.existsSync(link)) fs.symlinkSync(target, link, "dir");
      }
    } catch (e) {
      console.warn("[media] could not link uploads:", e.message);
    }
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
