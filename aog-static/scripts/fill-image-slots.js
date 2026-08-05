#!/usr/bin/env node
/**
 * fill-image-slots.js — put real photographs into the empty design placeholders.
 *
 * The Claude Design pages ship with `data-img-slot` divs: tinted gradient boxes
 * holding a label (or, on the team cards, the person's first initial). 157 of
 * them across 18 pages were never filled, so /culture/ and /offices/ were photo
 * galleries with no photographs.
 *
 * The photographs existed the whole time. The WordPress media library is on
 * disk under wp-content/uploads (12,275 files), and the database records which
 * page each image was attached to — 234 for Culture, 36 for People, 30 for
 * Offices. The live WordPress page at the old host also still renders them
 * under their original section headings ("Lunches", "Parties", "Team Building"
 * …), which is how each photo here is matched to a slot rather than guessed at.
 *
 * Images are resized and re-encoded on the way in (scripts/prepare-images.js)
 * and written to public/assets/media/<original wordpress path>. Keeping the
 * WordPress path means the /wp-content/uploads/* -> /assets/media/* redirect
 * still resolves old inbound image links to the same picture.
 *
 * The office slots use the three location photographs that already ship as
 * design assets, because the homepage offices row uses exactly those — the
 * Gold Coast head office, Cape Town (the South African staff work remotely,
 * so there is no office to photograph), and the Philippines building.
 *
 * NOT filled, deliberately:
 *   person-*    15 of the 24 team members have no identifiable headshot. Their
 *               photos are probably among the 36 unnamed People-attached files
 *               (1000000201.jpg and similar), but a filename cannot be matched
 *               to a face. Those stay as initials until someone identifies them.
 *   purpose-hero  the design labels this "The founders", and no photograph of
 *               the founders exists in the library. It carries the image the
 *               live WordPress /purpose/ page used in that position instead.
 *
 * Idempotent — a slot already holding an <img> is left alone. Pass --replace
 * to re-point slots whose mapping has since changed.
 *
 * Usage:  node scripts/fill-image-slots.js [--dry] [--replace]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const DRY = process.argv.includes("--dry");
const REPLACE = process.argv.includes("--replace");

// Where a photo lives once prepared. Paths mirror the WordPress library.
const M = (p) => `/assets/media/${p}`;
const D = (p) => `/assets/design/${p}`;

// --- the photographs, matched to slots via the original page's own sections ---
const CULTURE = {
  "culture-hero":    [M("2025/04/DSC_2483.jpg"), "Ad On Group team members together in branded shirts at a company event"],
  "lunches-0":       [M("2025/04/1000004029-1.jpg"), "Team members serving a shared lechon lunch in the office"],
  "lunches-1":       [M("2025/04/SMY_8574-scaled.jpg"), "Staff sharing a catered lunch around a long table"],
  "lunches-2":       [M("2025/04/SMY_8550-scaled.jpg"), "Colleagues eating together at their desks during a team lunch"],
  "lunches-3":       [M("2025/04/SMY_8416-scaled.jpg"), "Team gathered around a table over a shared meal"],
  "parties-0":       [M("2025/04/SMY_0935-scaled.jpg"), "Staff in formal dress at the Ad On Group annual party"],
  "parties-1":       [M("2025/04/IMG_0243-scaled.jpg"), "Large group photograph of the team at the company Christmas party"],
  "parties-2":       [M("2025/04/IMG_9686-scaled.jpg"), "Colleagues seated together in evening wear at the staff party"],
  "parties-3":       [M("2025/04/IMG_0243-1-scaled.jpg"), "Team line-up on stage at the annual celebration"],
  "events-0":        [M("2025/04/1000058439.jpg"), "Team celebrating Valentine's Day in the office with decorations"],
  "events-1":        [M("2025/04/1000020926.jpg"), "Staff holding heart balloons at an office celebration"],
  "events-2":        [M("2025/04/1000020920.jpg"), "Large group of staff at an in-office Valentine's Day event"],
  "events-3":        [M("2025/04/IMG_5878-scaled.jpg"), "Team members posing with props at a company event"],
  "teambuilding-0":  [M("2025/04/IMG_7165-scaled.jpg"), "Staff in team colours at the annual team-building day"],
  "teambuilding-1":  [M("2025/04/IMG_7174-scaled.jpg"), "Team cheering together during outdoor team-building games"],
  "teambuilding-2":  [M("2025/04/IMG_7213.jpg"), "Colleagues seated together at the team-building event"],
  "teambuilding-3":  [M("2025/04/IMG_7089-scaled.jpg"), "Team members competing in an outdoor team-building activity"],
  "wellness-0":      [M("2025/04/IMG_9224-scaled.jpg"), "Staff with race bibs and medals after a company fun run"],
  "wellness-1":      [M("2025/04/IMG_5591-scaled.jpg"), "Team on court during a staff sports session"],
  "wellness-2":      [M("2025/04/IMG_5176-scaled.jpg"), "Colleagues at the staff bowling night"],
  "wellness-3":      [M("2025/04/IMG_0847-scaled.jpg"), "Staff taking part in an office dance and fitness class"],
  "conference-0":    [M("2025/05/1000005295.jpg"), "Team on a group cycling tour during the company conference"],
  "conference-1":    [M("2025/05/1000005488.jpg"), "Colleagues together on a conference trip"],
  "conference-2":    [M("2025/05/1000005592.jpg"), "Team cycling through the city on a conference outing"],
  "conference-3":    [M("2025/05/1000005618.jpg"), "Group photograph of the team on the conference programme"],
};

const OUR_CULTURE = {
  "culture-hero":    CULTURE["culture-hero"],
  "culture-connect": [M("2025/04/DSC_2525-1.jpg"), "Ad On Group staff together in branded shirts at a company gathering"],
  "culture-g0":      CULTURE["lunches-1"],
  "culture-g1":      CULTURE["lunches-2"],
  "culture-g2":      CULTURE["parties-0"],
  "culture-g3":      CULTURE["parties-1"],
  "culture-g4":      CULTURE["events-0"],
  "culture-g5":      CULTURE["events-1"],
  "culture-g6":      CULTURE["teambuilding-0"],
  "culture-g7":      CULTURE["teambuilding-1"],
  "culture-g8":      CULTURE["wellness-0"],
  "culture-g9":      CULTURE["wellness-1"],
  "culture-g10":     CULTURE["conference-0"],
  "culture-g11":     CULTURE["conference-1"],
};

// The three location shots already ship as design assets — they are the same
// photographs the homepage uses for its offices row, so the two pages agree.
const OFFICES = {
  "office-au":  [D("group-au-office.png"), "The Ad On Group head office building on the Gold Coast, Australia"],
  "office-sa":  [D("group-capetown.webp"), "Cape Town, South Africa, where the South African team works remotely"],
  "office-ph":  [D("group-ph-office.jpg"), "The Ad On Group office building in the Philippines"],
  "facility-0": [M("2025/08/SMY_7552-1.jpg"), "Staff at work on the office floor in the Philippines"],
  "facility-1": [M("2025/04/SMY_7369.jpg"), "Rows of workstations on the Philippines office floor"],
  "facility-2": [M("2025/04/SMY_7398.jpg"), "Technician working on the office server rack"],
  "facility-3": [M("2025/04/SMY_7564.jpg"), "Office space with floor-to-ceiling windows"],
  "facility-4": [M("2025/04/SMY_7566.jpg"), "Glass-partitioned meeting spaces in the office"],
  "facility-5": [M("2025/04/SMY_7593.jpg"), "Breakout seating area in the office"],
  "facility-6": [M("2025/04/SMY_7686.jpg"), "Staff lockers in the office"],
  "facility-7": [M("2025/04/DSC_2422.jpg"), "Boardroom with meeting table and chairs"],
  "facility-8": [M("2025/04/DSC_2432.jpg"), "Staff kitchen and pantry area"],
};

const OUR_OFFICES = {
  "office-au": OFFICES["office-au"],
  "office-sa": OFFICES["office-sa"],
  "office-ph": OFFICES["office-ph"],
};

const ABOUT_US = {
  "about-hero":    [M("2025/03/DSC_2294.jpg"), "Ad On Workforce staff at work on the office floor"],
  "about-quality": [M("2025/04/SMY_7534.jpg"), "Reception area of the Ad On Group office in the Philippines"],
  "about-success": [M("2025/04/SMY_0574-scaled.jpg"), "Team members celebrating together at a company event"],
};

const STAFF_BENEFITS = {
  "staff-hero":  [M("2025/04/DSC_2711.jpg"), "Ad On Group staff together at a company event"],
  "staff-gal-1": [M("2025/04/IMG_7182-1-scaled.jpg"), "Staff taking part in the annual team-building day"],
  "staff-gal-2": [M("2025/04/IMG_9251-1-scaled.jpg"), "Team members at a staff wellness and sports session"],
  "staff-gal-3": [M("2025/04/SMY_8394-scaled.jpg"), "Colleagues sharing a catered lunch in the office"],
  "staff-gal-4": [M("2025/05/1000005485.jpg"), "The team together on the annual conference trip"],
};

// Both images are the ones the live WordPress /purpose/ page used itself.
// The design labels the first slot "The founders", but no photograph of the
// founders exists anywhere in the library — flagged rather than faked.
const PURPOSE = {
  "purpose-hero": [M("2025/07/shutterstock_2523853651-scaled.jpg"), "Colleagues in discussion around a meeting table"],
  "purpose-1":    [M("2025/08/Group-638-3.png"), "An Ad On Group presentation to staff at a company conference"],
};

// Nine article cards, each linking to a post on adonworkforce.com.au. The
// thumbnails are those posts' own featured images, downloaded from the CDN and
// served locally — the static site must not depend on the old WordPress host.
const BLOGS = {
  "blog-0": [M("blog/1956688939.png"), "Overseas remote staff and the evolution of office administration"],
  "blog-1": [M("blog/2135676263-Converted.png"), "The transformative power of remote staffing"],
  "blog-2": [M("blog/1661363914.png"), "Streamlining staff training through outsourcing"],
  "blog-3": [M("blog/2100479419.png"), "The hidden costs of hiring in Australia"],
  "blog-4": [M("blog/1675928800_blog_05-e1733368613565.jpg"), "The role of technology in staff outsourcing"],
  "blog-5": [M("blog/1837241830_blog_04-e1733368549399.jpg"), "Tips for managing an outsourced workforce"],
  "blog-6": [M("blog/1856535433_blog_03-e1733374545133.jpg"), "The impact of COVID-19 on staff outsourcing"],
  "blog-7": [M("blog/1820322704_blog_02-e1733368651861.jpg"), "Choosing the right outsourcing partner for your business"],
  "blog-8": [M("blog/1802447638_blog_01-e1733368717528.jpg"), "The benefits of staff outsourcing services"],
};

const HISTORY = {
  "history-1": [M("2025/08/SMY_7715-2.jpg"), "Ad On Group staff at work on the office floor"],
  "history-2": [M("2025/08/IMG_4816-1.png"), "A video call with team members joining from multiple locations"],
  "history-3": [M("2025/08/Group-638-1.png"), "Offshore team members working at their monitors"],
};

// Four headshots already ship as design assets and are reused as-is.
const PEOPLE = {
  "people-hero":      [M("2025/04/DSC_2525-1.jpg"), "Members of the Ad On Group team together at a company gathering"],
  "person-taryn":     [D("team-taryn.jpg"), "Taryn, Chief Operations Officer at Ad On Group"],
  "person-leah":      [D("team-leah.jpg"), "Leah, General Manager at Ad On Group"],
  "person-tracy":     [D("team-tracy.jpg"), "Tracy, Talent Manager at Ad On Group"],
  "person-ben":       [D("team-ben.jpg"), "Ben, Business Development Manager at Ad On Group"],
  // Named from adonworkforce.com.au/our-people/ and adonsa.co.za/meet-the-team/,
  // which caption every face the media library left anonymous. Roles are the
  // ones those pages give.
  "person-lindsey":   [M("2025/03/Screenshot-2024-11-22-150703-e1733900092526.png"), "Lindsey, Chief Financial Officer at Ad On Group"],
  "person-james":     [M("2025/03/IMG-7775-scaled-e1733901081176.jpg"), "James, Business Development Manager at Ad On Group"],
  "person-izah":      [M("2025/03/2-1-scaled-e1733964362970.jpg"), "Izah, HR Manager at Ad On Group"],
  "person-mclean":    [M("2025/03/Image_20241205_141835_165-scaled-e1733965774973.jpeg"), "McLean, IT and Data Manager at Ad On Group"],
  "person-jenny":     [M("2025/03/3-2-e1733968468910.jpg"), "Jenny, Selection and Assessment Manager at Ad On Group"],
  "person-faye":      [M("2025/04/unnamed-2-e1744080935699.jpg"), "Faye, Office and Compliance Manager at Ad On Group"],
  "person-mia":       [M("2025/04/IMG_4816-scaled-e1744080961452.jpg"), "Mia, Team Leader at Ad On Group"],
  "person-joanne":    [M("2025/03/IMG_0162-scaled-e1733970936223.jpg"), "Joanne, Team Leader at Ad On Group"],
  "person-rodel":     [M("2025/03/Delo-2-e1733971231915.jpg"), "Rodel, Team Leader at Ad On Group"],
  "person-kay":       [M("2025/03/1000019268-e1733971393293.jpg"), "Kay, Team Leader at Ad On Group"],
  "person-jane":      [M("2025/03/1000042972-1-e1733971438510.jpg"), "Jane, Team Leader at Ad On Group"],
  "person-shaira":    [M("2025/09/da3bbc90-e490-44df-b156-fabed8209ecc.webp"), "Shaira, Team Leader at Ad On Group"],
  "person-vanessa":   [M("2025/09/SMY_8172-4-2.webp"), "Vanessa, Team Leader at Ad On Group"],
  "person-karen":     [M("2025/09/received_555246257364131.webp"), "Karen, Team Leader at Ad On Group"],
  "person-kerry":     [M("2026/03/Kerry-Morris-Photo.jpg"), "Kerry Morris, Chief Executive Officer of Ad On SA"],
  "person-jacqueline":[M("2026/03/Jacqueline-Jeftha-Photo.jpg"), "Jacqueline Jeftha, Finance and Compliance Manager at Ad On Group"],
  "person-siwe":      [M("2026/03/Siwe-Mdlalose-Photo.jpg"), "Siwe Mdlalose, Divisional Manager at Ad On Group"],
  "person-vincent":   [M("2026/03/Vincent-Ntentesa-Photo.jpg"), "Vincent Ntentesa, Talent Specialist at Ad On Group"],
  "person-nontobeko": [M("2026/03/Nontobeko-Gumede.jpg"), "Nontobeko Gumede, Administrator at Ad On Group"],
  "person-yolanda":   [M("2026/03/Yolanda-Drysdale-Photo.jpeg"), "Yolanda Drysdale, Recruitment Manager at Ad On Group"],
};

// --- division pages -------------------------------------------------------
// Each page pairs a hero (5:4, beside the pitch) with a "solution" image that
// sits between the customer's stated problems and the answer to them.
const AD_ON_DIGITAL = {
  // A marketer working across search, ads and analytics — reads as the service
  // itself. Replaces the earlier choice (a portrait screenshot of a sample Ads
  // report), which sat awkwardly as a contained document in the hero frame.
  "digital-hero":     [M("2025/09/shutterstock_2511675757.webp"), "A marketer working across a laptop and tablet with digital advertising, search and analytics panels"],
  "digital-solution": [M("2025/02/Group-388.png"), "The Ad On Digital team working together at their desks"],
};

const AD_ON_HOLD = {
  // hold-hero is left empty: there is no photograph of a recording studio,
  // a microphone or voice production anywhere in the library.
  "hold-solution": [M("2025/08/DSC_2286-1.png"), "Ad On Group staff handling calls on the office floor"],
};

// Sourced from the live Ad On SA site (adonsa.co.za), which leads with the same
// Cape Town waterfront the group already ships as a design asset. The team works
// remotely, so there is no office to photograph — the "solution" slot carries a
// real Ad On SA professional (the one team headshot that is landscape and so
// fills a 4:3 frame without cropping the face).
const AD_ON_SA = {
  "sa-hero":     [D("group-capetown.webp"), "Aerial view of Cape Town, South Africa, where the Ad On SA team is based"],
  "sa-solution": [M("2026/03/Vincent-Ntentesa-Photo.jpg"), "Vincent Ntentesa, a Talent Specialist on the Ad On SA remote team"],
};

const AD_ON_WORKFORCE_DIVISION = {
  "wf-hero":     [M("2025/03/DSC_2294.jpg"), "Offshore staff at work on the office floor in the Philippines"],
  "wf-solution": [M("2025/04/DSC_0034-scaled-circle-6a5b4b1601702299f9b8e502ff39e28e-w2gnu9a57dxj.jpg"), "An Ad On Group team meeting in the boardroom, with colleagues joining by video call"],
};

const OUR_COMPANY = {
  "company-hero":    [M("2025/04/DSC_2483.jpg"), "Members of the Ad On Workforce team together at a company event"],
  "company-support": [M("2025/04/SMY_7564.jpg"), "Modern office space with floor-to-ceiling windows"],
};

const PAGES = {
  "culture": CULTURE,
  "ad-on-digital": AD_ON_DIGITAL,
  "ad-on-sa": AD_ON_SA,
  "ad-on-hold": AD_ON_HOLD,
  "ad-on-workforce-division": AD_ON_WORKFORCE_DIVISION,
  "our-company": OUR_COMPANY,
  "our-culture": OUR_CULTURE,
  "offices": OFFICES,
  "our-offices": OUR_OFFICES,
  "history": HISTORY,
  "people": PEOPLE,
  "our-people": PEOPLE,
  "about-us": ABOUT_US,
  "our-staff-benefits": STAFF_BENEFITS,
  "purpose": PURPOSE,
  "blogs": BLOGS,
};

// The hero-ish slots load eagerly; galleries below the fold do not.
const EAGER = new Set([
  "culture-hero", "people-hero", "office-au", "history-1",
  "about-hero", "staff-hero", "purpose-hero", "sa-hero", "digital-hero",
]);

// Photographs fill the frame. A document — the sample Google Ads report — is
// portrait in a landscape frame, so cover would crop most of it away; it is
// contained instead and sits on the slot's own tint like a document preview.
const FIT = {
  cover: "width:100%;height:100%;object-fit:cover;display:block",
  contain: "width:100%;height:100%;object-fit:contain;display:block;padding:22px",
};

let filled = 0, already = 0, replaced = 0, missing = 0, pagesTouched = 0;
const absent = new Set();

for (const [slug, map] of Object.entries(PAGES)) {
  const file = path.join(PUBLIC, slug, "index.html");
  if (!fs.existsSync(file)) { console.error(`! no such page: /${slug}/`); continue; }
  const before = fs.readFileSync(file, "utf8");
  let html = before;

  for (const [slot, [src, alt, fit]] of Object.entries(map)) {
    // Check the file was actually prepared before pointing markup at it.
    const onDisk = path.join(PUBLIC, src.replace(/^\//, ""));
    if (!fs.existsSync(onDisk)) { absent.add(src); missing++; continue; }

    const re = new RegExp(
      `(<div[^>]*data-img-slot="${slot.replace(/[-]/g, "\\-")}"[^>]*>)([\\s\\S]*?)(</div>)`,
      "g"
    );
    html = html.replace(re, (m, open, inner, close) => {
      if (inner.includes("<img")) {
        // Already filled. Leave it unless the mapping has since changed and
        // --replace was passed, so a corrected choice can actually land.
        const current = (inner.match(/<img[^>]*src="([^"]*)"/) || [])[1];
        if (!REPLACE || current === src) { already++; return m; }
        replaced++;
      } else {
        filled++;
      }
      const load = EAGER.has(slot)
        ? 'loading="eager" fetchpriority="high"'
        : 'loading="lazy"';
      return `${open}<img src="${src}" alt="${alt}" style="${FIT[fit || 'cover']}" ${load} decoding="async">${close}`;
    });
  }

  if (html !== before) {
    pagesTouched++;
    if (!DRY) fs.writeFileSync(file, html);
  }
}

console.log(`${DRY ? "[dry run] " : ""}image slots`);
console.log(`  slots filled          : ${filled}`);
console.log(`  already had an image  : ${already}`);
if (replaced) console.log(`  re-pointed to a new photo : ${replaced}`);
console.log(`  pages changed         : ${pagesTouched}`);
if (missing) {
  console.log(`  SKIPPED, file not prepared : ${missing}`);
  for (const s of absent) console.log(`      ${s}`);
  console.log(`  -> run: node scripts/prepare-images.js`);
}
