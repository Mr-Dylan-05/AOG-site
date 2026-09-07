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

module.exports = () => ({
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
