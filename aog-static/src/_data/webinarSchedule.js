/**
 * webinarSchedule.js — the public webinar series, split into upcoming and past.
 *
 * webinars.json is the file a human edits. This derives everything the templates
 * need from it, in one place, so no template has to know the filtering rules:
 *
 *   - a session without status "scheduled", or without a date, is dropped
 *     entirely. That is the safety catch: publishing Event markup for a session
 *     that is not really happening is worse than publishing none, so a draft
 *     simply does not exist as far as the build is concerned.
 *   - `startIso` carries the +10:00 offset. Queensland does not observe daylight
 *     saving, so the offset is constant year-round — but it has to be stated,
 *     because a start time with no timezone is ambiguous to every consumer of it.
 *   - past sessions keep their page. They stop being an event and become a page
 *     about a subject, which is the only durable value available once the
 *     recording itself stays behind the members' paywall.
 */
const data = require("./webinars.json");

const DURATION_MIN = 45;

const parse = (s) => {
  const startIso = `${s.date}T${s.time || "12:30"}:00${data.timezone || "+10:00"}`;
  const start = new Date(startIso);
  const end = new Date(start.getTime() + DURATION_MIN * 60000);
  return {
    ...s,
    startIso,
    endIso: end.toISOString().replace(/\.\d{3}Z$/, "Z"),
    url: `/webinars/${s.slug}/`,
    pretty: start.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Australia/Brisbane",
    }),
    prettyTime: `${s.time || "12:30"}pm AEST`,
  };
};

module.exports = () => {
  const sessions = (data.sessions || [])
    .filter((s) => s.status === "scheduled" && s.date && s.slug)
    .map(parse)
    .sort((a, b) => a.startIso.localeCompare(b.startIso));

  // Compared at build time. A session is "past" once its start has gone by.
  const now = Date.now();
  return {
    cadence: data.cadence,
    duration: data.duration || "PT45M",
    all: sessions,
    upcoming: sessions.filter((s) => new Date(s.startIso).getTime() >= now),
    past: sessions.filter((s) => new Date(s.startIso).getTime() < now).reverse(),
  };
};
