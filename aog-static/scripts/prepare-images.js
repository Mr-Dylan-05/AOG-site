#!/usr/bin/env node
/**
 * prepare-images.js — copy photographs out of the WordPress library and size
 * them for the web.
 *
 * The originals are camera files: several run to 20MB+ and 6000px wide. They
 * are resized and re-encoded here rather than shipped as-is, then written to
 * public/assets/media/<original wordpress path>.
 *
 * Keeping the WordPress path matters: the /wp-content/uploads/* ->
 * /assets/media/* redirect means an old inbound link to a photo still resolves
 * to that same photo.
 *
 * Uses `sips`, which ships with macOS, so there is no dependency to install.
 * Skips any file already prepared, so re-running is cheap.
 *
 * Usage:  node scripts/prepare-images.js [--force]
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "..", "wp-content", "uploads");
const DEST = path.join(ROOT, "public", "assets", "media");
const FORCE = process.argv.includes("--force");

// Longest edge, by how the photo is used. A circular 120px avatar does not need
// a 4000px source; a full-width hero does need more than a gallery thumbnail.
const SIZES = { hero: 1600, gallery: 1000, avatar: 600 };

const WANT = [
  // culture — hero and the six themed galleries
  ["2025/04/DSC_2483.jpg", "hero"],
  ["2025/04/DSC_2525-1.jpg", "hero"],
  ["2025/04/1000004029-1.jpg", "gallery"],
  ["2025/04/SMY_8574-scaled.jpg", "gallery"],
  ["2025/04/SMY_8550-scaled.jpg", "gallery"],
  ["2025/04/SMY_8416-scaled.jpg", "gallery"],
  ["2025/04/SMY_0935-scaled.jpg", "gallery"],
  ["2025/04/IMG_0243-scaled.jpg", "gallery"],
  ["2025/04/IMG_9686-scaled.jpg", "gallery"],
  ["2025/04/IMG_0243-1-scaled.jpg", "gallery"],
  ["2025/04/1000058439.jpg", "gallery"],
  ["2025/04/1000020926.jpg", "gallery"],
  ["2025/04/1000020920.jpg", "gallery"],
  ["2025/04/IMG_5878-scaled.jpg", "gallery"],
  ["2025/04/IMG_7165-scaled.jpg", "gallery"],
  ["2025/04/IMG_7174-scaled.jpg", "gallery"],
  ["2025/04/IMG_7213.jpg", "gallery"],
  ["2025/04/IMG_7089-scaled.jpg", "gallery"],
  ["2025/04/IMG_9224-scaled.jpg", "gallery"],
  ["2025/04/IMG_5591-scaled.jpg", "gallery"],
  ["2025/04/IMG_5176-scaled.jpg", "gallery"],
  ["2025/04/IMG_0847-scaled.jpg", "gallery"],
  ["2025/05/1000005295.jpg", "gallery"],
  ["2025/05/1000005488.jpg", "gallery"],
  ["2025/05/1000005592.jpg", "gallery"],
  ["2025/05/1000005618.jpg", "gallery"],

  // offices
  ["2025/04/SMY_7534.jpg", "hero"],
  ["2025/08/SMY_7552-1.jpg", "gallery"],
  ["2025/04/SMY_7369.jpg", "gallery"],
  ["2025/04/SMY_7398.jpg", "gallery"],
  ["2025/04/SMY_7564.jpg", "gallery"],
  ["2025/04/SMY_7566.jpg", "gallery"],
  ["2025/04/SMY_7593.jpg", "gallery"],
  ["2025/04/SMY_7686.jpg", "gallery"],
  ["2025/04/DSC_2422.jpg", "gallery"],
  ["2025/04/DSC_2432.jpg", "gallery"],

  // history
  ["2025/08/SMY_7715-2.jpg", "hero"],
  ["2025/08/IMG_4816-1.png", "gallery"],
  ["2025/08/Group-638-1.png", "gallery"],

  // people — the South Africa headshots
  ["2026/03/Jacqueline-Jeftha-Photo.jpg", "avatar"],
  ["2026/03/Siwe-Mdlalose-Photo.jpg", "avatar"],
  ["2026/03/Vincent-Ntentesa-Photo.jpg", "avatar"],
  ["2026/03/Nontobeko-Gumede.jpg", "avatar"],
  ["2026/03/Yolanda-Drysdale-Photo.jpeg", "avatar"],

  // people — the 15 headshots identified from adonworkforce.com.au/our-people/
  // and adonsa.co.za/meet-the-team/, which name every face the library did not.
  ["2025/03/Screenshot-2024-11-22-150703-e1733900092526.png", "avatar"],
  ["2025/03/IMG-7775-scaled-e1733901081176.jpg", "avatar"],
  ["2025/03/2-1-scaled-e1733964362970.jpg", "avatar"],
  ["2025/03/Image_20241205_141835_165-scaled-e1733965774973.jpeg", "avatar"],
  ["2025/03/3-2-e1733968468910.jpg", "avatar"],
  ["2025/04/unnamed-2-e1744080935699.jpg", "avatar"],
  ["2025/04/IMG_4816-scaled-e1744080961452.jpg", "avatar"],
  ["2025/03/IMG_0162-scaled-e1733970936223.jpg", "avatar"],
  ["2025/03/Delo-2-e1733971231915.jpg", "avatar"],
  ["2025/03/1000019268-e1733971393293.jpg", "avatar"],
  ["2025/03/1000042972-1-e1733971438510.jpg", "avatar"],
  ["2025/09/da3bbc90-e490-44df-b156-fabed8209ecc.webp", "avatar"],
  ["2025/09/SMY_8172-4-2.webp", "avatar"],
  ["2025/09/received_555246257364131.webp", "avatar"],
  ["2026/03/Kerry-Morris-Photo.jpg", "avatar"],

  // about-us, staff benefits and purpose
  ["2025/03/DSC_2294.jpg", "hero"],
  ["2025/04/DSC_2711.jpg", "hero"],
  ["2025/04/SMY_0574-scaled.jpg", "gallery"],
  ["2025/04/IMG_7182-1-scaled.jpg", "gallery"],
  ["2025/04/IMG_9251-1-scaled.jpg", "gallery"],
  ["2025/04/SMY_8394-scaled.jpg", "gallery"],
  ["2025/05/1000005485.jpg", "gallery"],
  // The two the live WordPress /purpose/ page itself used.
  ["2025/07/shutterstock_2523853651-scaled.jpg", "hero"],
  ["2025/08/Group-638-3.png", "gallery"],
];

let copied = 0, skipped = 0, failed = 0, savedBytes = 0;

for (const [rel, kind] of WANT) {
  const from = path.join(SRC, rel);
  const to = path.join(DEST, rel);

  if (!fs.existsSync(from)) { console.error(`  ! missing source: ${rel}`); failed++; continue; }
  if (fs.existsSync(to) && !FORCE) { skipped++; continue; }

  fs.mkdirSync(path.dirname(to), { recursive: true });
  try {
    if (/\.webp$/i.test(from)) {
      // sips cannot read webp. Nothing else here needs a decoder, so rather
      // than add a dependency, copy it through — these are already web-sized.
      fs.copyFileSync(from, to);
      const n = fs.statSync(to).size;
      copied++;
      console.log(`  ${String(Math.round(n / 1024)).padStart(6)}KB -> ${String(Math.round(n / 1024)).padStart(5)}KB  ${rel}  (webp, copied as-is)`);
      continue;
    }
    execFileSync("sips", ["-Z", String(SIZES[kind]), from, "--out", to], { stdio: "pipe" });
    const a = fs.statSync(from).size;
    let b = fs.statSync(to).size;
    let note = "";
    // Re-encoding a PNG can cost more than it saves — sips rewrites it at a
    // higher bit depth than the original was stored at. When that happens the
    // original is smaller AND higher resolution, so ship that instead.
    if (b >= a) {
      fs.copyFileSync(from, to);
      b = fs.statSync(to).size;
      note = "  (re-encode inflated it; kept original)";
    }
    savedBytes += a - b;
    copied++;
    console.log(`  ${String(Math.round(a / 1024)).padStart(6)}KB -> ${String(Math.round(b / 1024)).padStart(5)}KB  ${rel}${note}`);
  } catch (e) {
    console.error(`  ! sips failed on ${rel}: ${e.message.split("\n")[0]}`);
    failed++;
  }
}

console.log(`\nprepared ${copied} image(s), skipped ${skipped} already present, ${failed} failed`);
if (savedBytes > 0) console.log(`saved ${(savedBytes / 1024 / 1024).toFixed(1)}MB versus shipping the originals`);
