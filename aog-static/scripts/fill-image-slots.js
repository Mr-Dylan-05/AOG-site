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
 * NOT filled, deliberately:
 *   office-au   no photograph of the Gold Coast head office exists anywhere in
 *               the library — putting a Philippines interior there would
 *               misrepresent it.
 *   office-sa   the South African staff are all work-from-home; there is no
 *               South African office to photograph.
 *   person-*    15 of the 24 team members have no identifiable headshot. Their
 *               photos are probably among the 36 unnamed People-attached files
 *               (1000000201.jpg and similar), but a filename cannot be matched
 *               to a face. Those stay as initials until someone identifies them.
 *
 * Idempotent — a slot that already holds an <img> is left alone.
 *
 * Usage:  node scripts/fill-image-slots.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const DRY = process.argv.includes("--dry");

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

// office-au and office-sa are intentionally absent — see the header note.
const OFFICES = {
  "office-ph":  [M("2025/04/SMY_7534.jpg"), "Reception area of the Ad On Group office in the Philippines"],
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

const OUR_OFFICES = { "office-ph": OFFICES["office-ph"] };

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
  "person-jacqueline":[M("2026/03/Jacqueline-Jeftha-Photo.jpg"), "Jacqueline Jeftha, Finance and Compliance Manager at Ad On Group"],
  "person-siwe":      [M("2026/03/Siwe-Mdlalose-Photo.jpg"), "Siwe Mdlalose, Divisional Manager at Ad On Group"],
  "person-vincent":   [M("2026/03/Vincent-Ntentesa-Photo.jpg"), "Vincent Ntentesa, Talent Specialist at Ad On Group"],
  "person-nontobeko": [M("2026/03/Nontobeko-Gumede.jpg"), "Nontobeko Gumede, Administrator at Ad On Group"],
  "person-yolanda":   [M("2026/03/Yolanda-Drysdale-Photo.jpeg"), "Yolanda Drysdale, Recruitment Manager at Ad On Group"],
};

const PAGES = {
  "culture": CULTURE,
  "our-culture": OUR_CULTURE,
  "offices": OFFICES,
  "our-offices": OUR_OFFICES,
  "history": HISTORY,
  "people": PEOPLE,
  "our-people": PEOPLE,
};

// The hero-ish slots load eagerly; galleries below the fold do not.
const EAGER = new Set(["culture-hero", "people-hero", "office-ph", "history-1"]);

const IMG_STYLE = "width:100%;height:100%;object-fit:cover;display:block";

let filled = 0, already = 0, missing = 0, pagesTouched = 0;
const absent = new Set();

for (const [slug, map] of Object.entries(PAGES)) {
  const file = path.join(PUBLIC, slug, "index.html");
  if (!fs.existsSync(file)) { console.error(`! no such page: /${slug}/`); continue; }
  const before = fs.readFileSync(file, "utf8");
  let html = before;

  for (const [slot, [src, alt]] of Object.entries(map)) {
    // Check the file was actually prepared before pointing markup at it.
    const onDisk = path.join(PUBLIC, src.replace(/^\//, ""));
    if (!fs.existsSync(onDisk)) { absent.add(src); missing++; continue; }

    const re = new RegExp(
      `(<div[^>]*data-img-slot="${slot.replace(/[-]/g, "\\-")}"[^>]*>)([\\s\\S]*?)(</div>)`,
      "g"
    );
    html = html.replace(re, (m, open, inner, close) => {
      if (inner.includes("<img")) { already++; return m; }
      filled++;
      const load = EAGER.has(slot)
        ? 'loading="eager" fetchpriority="high"'
        : 'loading="lazy"';
      return `${open}<img src="${src}" alt="${alt}" style="${IMG_STYLE}" ${load} decoding="async">${close}`;
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
console.log(`  pages changed         : ${pagesTouched}`);
if (missing) {
  console.log(`  SKIPPED, file not prepared : ${missing}`);
  for (const s of absent) console.log(`      ${s}`);
  console.log(`  -> run: node scripts/prepare-images.js`);
}
