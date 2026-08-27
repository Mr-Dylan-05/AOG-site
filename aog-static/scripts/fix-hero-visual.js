#!/usr/bin/env node
/**
 * fix-hero-visual.js — swap the hero's empty progress card for a real photo.
 *
 * The bottom-right tile in the hero was a CSS-drawn "Learning progress 50%"
 * card: a heading, a number and five empty bars. At its rendered size it read
 * as a mostly blank white box next to three real images.
 *
 * It becomes group-au-office.png, the Gold Coast head office. It is a real
 * Ad On Group building with the wordmark on it rather than stock, and a
 * centre crop keeps the logo, the entrance and the street number, so the
 * portrait tile costs it nothing.
 *
 * Worth knowing: 648x362 is the only copy of this photo anywhere in the repo,
 * including every dist-old folder in the WordPress theme. The tile needs
 * 510x600 at 2x, so it is upscaled about 1.66x and will be a little soft on a
 * retina screen. A larger original would be a straight improvement.
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
 * MOBILE. Two faults on a phone, both from the export rather than this swap:
 *
 *   The left stack carries transform:translateY(-22px) and the right +24px, a
 *   stagger that reads well on a wide layout. Stacked on a phone it drags the
 *   first tile up under the "Claude Certified Associates" badge, which they
 *   visibly overlap. The offsets are dropped below 760px.
 *
 *   The academy screenshot is set to width:100%;height:auto. On desktop the
 *   frame is deliberately wider than its tile (420px inside 247px) so the
 *   screenshot bleeds past the edge and fills the height. On a phone the tile
 *   turns portrait, the shot shrinks to the tile's width and fills only 36% of
 *   it, leaving a pale empty block. Sizing it by height instead restores the
 *   bleed the desktop layout was designed around.
 *
 * These need a media query, so unlike the tile swap they cannot be inline.
 * .platform-shot is declared on a 61-deep :root chain, the deepest in the
 * file, so the block below sits at 64 to clear it.
 *
 * Idempotent: restores the original card first, so re-running never nests.
 *
 * Usage:  node scripts/fix-hero-visual.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PAGE = path.join(ROOT, "public", "ai-training", "index.html");
const IMG = "/assets/design/group-au-office.png";

// 64 :root repetitions: one deeper than the 61 the page uses for .platform-shot.
const DEEP = "html" + ":root".repeat(64) + " body main";

const MOBILE_STYLE = `<style id="hero-mobile-style">
        @media(max-width:760px){
          ${DEEP} .hero-visual-stack-left,
          ${DEEP} .hero-visual-stack-right{transform:none!important}
          ${DEEP} .hero-visual{margin-top:16px!important}
          ${DEEP} .visual-platform .platform-shot{width:auto!important;max-width:none!important;height:100%!important}
          ${DEEP} .visual-platform .platform-shot img{width:auto!important;max-width:none!important;height:100%!important;display:block!important}
        }
      </style>`;

const CHART =
  '<div class="visual-card visual-chart"><span>Learning progress</span><b>50%</b><i></i><i></i><i></i><i></i><i></i></div>';

const TILE_CSS =
  "display:block!important;padding:0!important;background:none!important;" +
  "gap:0!important;overflow:hidden!important";
// A straight centre crop is right here: the wordmark, the entrance and the
// street number all sit mid-frame, so nothing worth seeing is cut away.
const IMG_CSS =
  "width:100%!important;height:100%!important;object-fit:cover!important;" +
  "object-position:50% 50%!important;display:block!important";

const PHOTO =
  '<figure class="visual-card visual-chart visual-studio" style="' + TILE_CSS + '">' +
  '<img src="' + IMG + '" alt="The Ad On Group head office on the Gold Coast" style="' + IMG_CSS + '"/>' +
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


html = html.replace(/<style id="hero-mobile-style">[\s\S]*?<\/style>/, "");
const heroEnd = html.indexOf("</section>", html.indexOf('class="hero"'));
if (heroEnd === -1) throw new Error("could not find the end of the hero section");
html = html.slice(0, heroEnd) + MOBILE_STYLE + html.slice(heroEnd);

fs.writeFileSync(PAGE, html);
console.log(`  hero tile 4: progress card -> ${IMG}`);
console.log("  mobile: stagger offsets dropped, academy shot sized to fill");
