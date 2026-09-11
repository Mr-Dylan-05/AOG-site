#!/usr/bin/env node
/**
 * calendly-setup.js — turn a Calendly personal access token into the two
 * values api/lead.js needs, and check the token actually works.
 *
 *   node scripts/calendly-setup.js <token>
 *
 * Prints CALENDLY_EVENT_TYPE_URI and CALENDLY_BOOKING_URL for each active
 * event type, then does a live availability lookup against the one it picks
 * so you can see whether the whole path works before setting anything.
 */
const token = (process.argv[2] || process.env.CALENDLY_TOKEN || "").trim();
if (!token) {
  console.error("Usage: node scripts/calendly-setup.js <token>");
  console.error("Token: calendly.com > Integrations & apps > API & webhooks >");
  console.error("       Personal access tokens > Generate new token");
  process.exit(1);
}

const api = async (path) => {
  const res = await fetch(`https://api.calendly.com${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  const body = await res.text();
  if (!res.ok) {
    const hint =
      res.status === 401 ? "  the token is wrong, expired, or was pasted with whitespace"
      : res.status === 403 ? "  the token is valid but lacks the scope it needs"
      : "";
    throw new Error(`${res.status} on ${path}\n${body.slice(0, 300)}${hint ? "\n" + hint : ""}`);
  }
  return JSON.parse(body);
};

(async () => {
  const me = (await api("/users/me")).resource;
  console.log(`\nToken works. Signed in as ${me.name} <${me.email}>`);
  console.log(`Scheduling page: ${me.scheduling_url}\n`);

  const types = (await api(`/event_types?user=${encodeURIComponent(me.uri)}&active=true`)).collection;
  if (!types.length) {
    console.log("No active event types on this account.");
    return;
  }

  console.log(`${types.length} active event type(s):\n`);
  types.forEach((t, i) => {
    console.log(`  [${i + 1}] ${t.name}  (${t.duration} min${t.secret ? ", secret" : ""})`);
    console.log(`      CALENDLY_EVENT_TYPE_URI = ${t.uri}`);
    console.log(`      CALENDLY_BOOKING_URL    = ${t.scheduling_url}\n`);
  });

  // Prove the availability call works on the most likely one: a 30 minute
  // meeting if there is one, otherwise the first.
  const pick = types.find((t) => t.duration === 30) || types[0];
  const now = new Date();
  const start = new Date(now.getTime() + 2 * 3600e3).toISOString();
  const end = new Date(now.getTime() + 7 * 24 * 3600e3).toISOString();
  console.log(`Checking availability on "${pick.name}" for the next 7 days...`);
  try {
    const times = (await api(
      `/event_type_available_times?event_type=${encodeURIComponent(pick.uri)}` +
      `&start_time=${encodeURIComponent(start)}&end_time=${encodeURIComponent(end)}`
    )).collection;
    console.log(`  ${times.length} open slot(s).`);
    if (times.length) {
      const fmt = (iso) =>
        new Intl.DateTimeFormat("en-AU", {
          timeZone: "Australia/Brisbane", weekday: "long", day: "numeric",
          month: "long", hour: "numeric", minute: "2-digit", hour12: true,
        }).format(new Date(iso));
      console.log(`  Soonest: ${fmt(times[0].start_time)} Brisbane time`);
      console.log("\n  That is the time the email would offer.");
    } else {
      console.log("  The email would fall back to 'pick whichever time suits you'.");
    }
  } catch (err) {
    console.log(`  availability lookup failed: ${err.message}`);
    console.log("  If this is a 403, the token needs the availability scope.");
  }
})().catch((err) => {
  console.error(`\nFailed: ${err.message}\n`);
  process.exit(1);
});
