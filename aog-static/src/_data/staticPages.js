/**
 * staticPages — the flattened design pages that live in public/.
 *
 * Those pages are passthrough-copied straight into the output, so Eleventy never
 * builds them and they never appear in `collections.all`. That meant the sitemap
 * silently listed only the auto-ported reference pages — every redesigned page,
 * including /contact-us/, /programs/ and the division pages, was missing.
 *
 * This walks public/ for index.html files and exposes their URLs so sitemap.njk
 * can include them alongside the Eleventy pages.
 */

const fs = require("fs");
const path = require("path");

const PUBLIC = path.join(__dirname, "..", "..", "public");

module.exports = function () {
  const urls = [];

  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // assets/ holds media and CSS, not pages
        if (entry.name === "assets") continue;
        walk(full);
      } else if (entry.name === "index.html") {
        const rel = path.relative(PUBLIC, path.dirname(full));
        urls.push(rel === "" ? "/" : `/${rel.split(path.sep).join("/")}/`);
      }
    }
  };

  walk(PUBLIC);
  return urls.sort();
};
