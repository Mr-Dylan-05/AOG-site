#!/usr/bin/env node
/**
 * fix-hero-visual.js — swap the hero's empty progress card for a real photo.
 *
 * The bottom-right tile in the hero was a CSS-drawn "Learning progress 50%"
 * card: a heading, a number and five empty bars. At its rendered size it read
 * as a mostly blank white box next to three real images.
 *
 * It becomes training-recording-studio.jpg, which already sits in the campaign
 * folder. It earns the slot on three counts: it is a genuine Ad On Group
 * person in a branded tee rather than stock, the subject is centred so it
 * survives the crop to a 255x300 portrait tile, and it shows a side of the
 * business the other three tiles do not, that the training modules are
 * actually produced in house.
 *
 * The tile keeps the .visual-chart class so it inherits the slot's own
 * per-breakpoint heights. The page pins those explicitly, and the chart slot
 * is the taller of the two (300px on desktop against the photo's 222px);
 * reclassing it as a photo shrank it and left the right stack 91px short of
 * the left.
 *
 * The card decoration meant for the bars is stripped with INLINE !important
 * rather than a stylesheet rule. The page escalates specificity by repeating
 * :root, up to 61 times, and .visual-card's padding sits on a 12-deep chain.
 * Matching that is an arms race with no ceiling; an inline !important sits
 * above every selector in the cascade and cannot be out-specified.
 *
 * Idempotent: restores the original card first, so re-running never nests.
 *
 * Usage:  node scripts/fix-hero-visual.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PAGE = path.join(ROOT, "public", "ai-training", "index.html");
const IMG = "/assets/campaign/training-recording-studio.jpg";

const CHART =
  '<div class="visual-card visual-chart"><span>Learning progress</span><b>50%</b><i></i><i></i><i></i><i></i><i></i></div>';

const TILE_CSS =
  "display:block!important;padding:0!important;background:none!important;" +
  "gap:0!important;overflow:hidden!important";
// object-position sits the face just above centre: a straight centre crop of a
// 16:9 frame puts the chin on the tile's midline.
const IMG_CSS =
  "width:100%!important;height:100%!important;object-fit:cover!important;" +
  "object-position:50% 32%!important;display:block!important";

const PHOTO =
  '<figure class="visual-card visual-chart visual-studio" style="' + TILE_CSS + '">' +
  '<img src="' + IMG + '" alt="An Ad On Group trainer recording a module in the studio" style="' + IMG_CSS + '"/>' +
  '</figure>';


let html = fs.readFileSync(PAGE, "utf8");

// undo a previous run so this never stacks
// Matches whatever classes a previous run used, so changing them here does
// not strand an older build that this script can no longer recognise.
html = html.replace(/<figure class="[^"]*visual-studio[^"]*"[^>]*>[\s\S]*?<\/figure>/, CHART);
html = html.replace(/<style id="hero-visual-style">[\s\S]*?<\/style>/, "");  // legacy from an earlier run

if (!html.includes(CHART)) {
  throw new Error("could not find the hero progress card to replace");
}

const missing = !fs.existsSync(path.join(ROOT, "public", IMG.replace(/^\//, "")));
if (missing) throw new Error(`image not found: public${IMG}`);

html = html.replace(CHART, PHOTO);


fs.writeFileSync(PAGE, html);
console.log(`  hero tile 4: progress card -> ${IMG}`);
