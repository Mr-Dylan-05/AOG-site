/**
 * proof.js — the credibility assets, made available to the Eleventy templates.
 *
 * These logos and reviews already existed in the repo and on the campaign page,
 * and the industry and location pages shipped without a single one of them: 50
 * images on the page that converts, zero on the twenty built after it. This is
 * what closes that gap.
 *
 * The headline number is deliberately Ad On Group's, not the AI program's.
 * "40+ businesses trained" invites exactly the comparison a newer competitor
 * wins; "trusted by over 14,000 Australian businesses" is true of Ad On Group,
 * is the reason to pick an established company over one founded last year, and
 * is the claim being made — so it is the one the page leads with.
 */
const reviews = require("../../incoming/design/campaign-reviews.json");

/** Recognisable clients, for the trust strip. Ad On Group clients across the
 *  group's services — which is what the 14,000 claim refers to. */
const CLIENTS = [
  // Century 21 and Coastal Dental are white-version marks — measured at 229 and
  // 252 luminance, which is invisible on this page's light ground. They belong on
  // a dark section, not here. Every logo below measured under 105.
  ["Harcourts", "/assets/design/client-harcourts.png"],
  ["Professionals", "/assets/design/client-professionals.png"],
  ["ARB 4x4 Accessories", "/assets/design/client-arb.png"],
  ["Manor Real Estate", "/assets/design/client-manor.png"],
  ["Bison Electrical", "/assets/design/client-bison.png"],
  ["Calibre Engineering", "/assets/design/client-calibre.png"],
  ["AIRLEC Adelaide Electrical", "/assets/design/client-airlec.png"],
  ["A Plus Property Services", "/assets/design/client-aplus-clean.png"],
];

/**
 * What comes with the program after the course ends. Taken from the sales page,
 * which is the authoritative description — the first version of these pages said
 * "monthly webinars and a support hour", which undersells two private hours a
 * month and weekly masterclasses badly.
 *
 * This is also the answer to a one-day workshop: a workshop ends, this does not.
 * So it gets images and its own section rather than a clause in a paragraph.
 */
const SUPPORT = [
  {
    title: "Your own learning platform",
    body: "24 interactive modules, self-paced, yours for life. The modules keep growing as AI does, so what your team learned last year does not quietly go out of date.",
    img: "/assets/campaign/academy-learning-platform.jpg",
    alt: "The Ad On Group AI learning platform",
  },
  {
    title: "Two private sessions every month",
    body: "An hour each, one to one with a Claude Certified Associate, spent on your team's actual work rather than a curriculum. This is where the difficult, specific problems get solved.",
    img: "/assets/campaign/ad-on-group-team-members.jpg",
    alt: "Ad On Group specialists working with a client team",
  },
  {
    title: "New masterclasses every week",
    body: "Fresh sessions and podcasts on real business applications, released weekly — because the tools change monthly and a course recorded last year cannot keep up on its own.",
    img: "/assets/campaign/training-recording-studio.jpg",
    alt: "Ad On Group recording studio where masterclasses are produced",
  },
  {
    title: "A community of teams doing the same thing",
    body: "A closed space to ask, share and show what is working, alongside staff from other Australian businesses using AI daily. Most people find the peer answers as useful as ours.",
    img: "/assets/campaign/community-discussion-space.jpg",
    alt: "The Ad On Group community discussion space",
  },
];

/** Who actually delivers it. The sales page has a "meet your Claude Certified
 *  Associates" section and the industry pages had nothing — no names, no faces,
 *  no credentials, on pages selling training. Both have their own bio page with
 *  their certifications marked up, so this links rather than duplicates. */
const TRAINERS = [
  {
    name: "Dylan Bailey",
    role: "Claude Certified Associate",
    img: "/assets/design/team-dylan.jpg",
    url: "/dylan-bailey/",
  },
  {
    name: "Beau Robards",
    role: "Claude Certified Associate",
    img: "/assets/design/team-beau.jpg",
    url: "/beau-robards/",
  },
];

module.exports = () => ({
  support: SUPPORT,
  trainers: TRAINERS,
  clientCount: "14,000",
  since: "2008",
  rating: reviews.profile.rating,
  reviewCount: reviews.profile.count,
  clients: CLIENTS.map(([name, src]) => ({ name, src })),
  /** Only the reviews actually about the AI training. A review praising an
   *  on-hold script is not evidence on a page selling AI training. */
  aiReviews: (reviews.reviews || [])
    .filter((r) => r.topic && r.topic !== "legacy")
    .sort((a, b) => String(b.date).localeCompare(String(a.date))),
});
