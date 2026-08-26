/**
 * /api/lead — the site's own form endpoint. Appends every submission to a
 * Google Sheet.
 *
 * WHY THIS EXISTS
 * The forms used to post to Formspree. Same-origin now, which means no CORS,
 * no per-form endpoint to paste in, no monthly submission cap, and the quiz's
 * fourteen fields land as fourteen sortable columns instead of one blob of
 * text in an email.
 *
 * ONE TAB PER FORM
 * A submission's `form` value (the form's data-form attribute) picks the tab:
 * quiz, leads, contact. The tab is created on first use and the header row is
 * written from the payload. If a form later gains a field, the new column is
 * appended to the header rather than dropped, so adding a quiz question needs
 * no change here.
 *
 * NO DEPENDENCIES
 * The Google service-account handshake is a signed JWT swapped for an access
 * token, which is about thirty lines with node:crypto. Pulling in googleapis
 * for that would add tens of megabytes to a function that appends one row.
 *
 * ENV (set in Vercel > Settings > Environment Variables)
 *   GOOGLE_SERVICE_ACCOUNT_JSON  the whole service-account key file, pasted in
 *   LEADS_SHEET_ID               the id from the sheet's URL
 *
 * FAILURE
 * If Sheets rejects the write we return 502 rather than a cheerful 200, so the
 * visitor sees the error and can retry or call. The payload is also written to
 * the Vercel log, so a lead is recoverable even in that case.
 */

const crypto = require("crypto");

const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS = "https://sheets.googleapis.com/v4/spreadsheets";

/* Column order for a tab's first submission. Anything not listed still gets a
   column, just after these. Ordered the way a person reads a lead: who they
   are, then what they told us, then where they came from. */
const PREFERRED = [
  "submitted_at", "form",
  "name", "firstName", "lastName", "email", "phone", "company",
  "role", "website", "job_title", "industry",
  "message", "contactPreference",
  "score", "band",
  "current_use", "worry", "motivation", "barrier", "support", "intent",
  "source", "page",
  "utm_source", "utm_medium", "utm_campaign", "utm_content",
];

const b64url = (b) =>
  Buffer.from(b).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function accessToken(creds) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: creds.client_email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(`${head}.${claim}`)
    .sign(creds.private_key);
  const assertion = `${head}.${claim}.${b64url(signature)}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`google auth ${res.status}: ${JSON.stringify(json)}`);
  return json.access_token;
}

function api(token) {
  return async (pathAndQuery, init = {}) => {
    const res = await fetch(`${SHEETS}/${pathAndQuery}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`sheets ${res.status}: ${JSON.stringify(json)}`);
    return json;
  };
}

/* Returns the tab's header row, creating the tab if it is not there yet. */
async function ensureTab(call, sheetId, tab) {
  const meta = await call(`${sheetId}?fields=sheets.properties.title`);
  const titles = (meta.sheets || []).map((s) => s.properties.title);
  if (!titles.includes(tab)) {
    await call(`${sheetId}:batchUpdate`, {
      method: "POST",
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title: tab } } }] }),
    });
    return [];
  }
  const row = await call(`${sheetId}/values/${encodeURIComponent(tab)}!1:1`);
  return (row.values && row.values[0]) || [];
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // Vercel parses url-encoded and JSON bodies for us; a string turns up only if
  // something posted with an unexpected content type.
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (_) {
      body = Object.fromEntries(new URLSearchParams(body));
    }
  }
  if (!body || typeof body !== "object") {
    return res.status(400).json({ ok: false, error: "No form data" });
  }

  // Honeypot. A bot fills every field it finds, so anything here means it is
  // not a person. Answer 200 so the bot believes it succeeded and moves on.
  if (String(body._gotcha || "").trim()) return res.status(200).json({ ok: true });

  const form = String(body.form || body["data-form"] || "contact")
    .replace(/[^a-z0-9_-]/gi, "")
    .slice(0, 40) || "contact";

  // Underscore-prefixed keys are form-service directives (_subject, _gotcha),
  // not answers, so they are not columns.
  const record = { submitted_at: new Date().toISOString(), form };
  for (const [k, v] of Object.entries(body)) {
    if (k.startsWith("_") || k === "form") continue;
    record[k] = Array.isArray(v) ? v.join(", ") : String(v == null ? "" : v).slice(0, 2000);
  }
  if (!record.page) {
    record.page = String(req.headers.referer || "").slice(0, 300);
  }

  // Something has to be in it. Guards against an empty probe creating rows.
  if (!record.email && !record.name && !record.message) {
    return res.status(400).json({ ok: false, error: "Nothing to record" });
  }

  const sheetId = process.env.LEADS_SHEET_ID;
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!sheetId || !raw) {
    console.error("[lead] not configured; payload:", JSON.stringify(record));
    return res.status(500).json({ ok: false, error: "Lead capture is not configured" });
  }

  try {
    const creds = JSON.parse(raw);
    const call = api(await accessToken(creds));

    let header = await ensureTab(call, sheetId, form);

    // Extend, never reorder: existing rows are already aligned to the header
    // that is there, so a new field becomes a new column on the end.
    const additions = Object.keys(record).filter((k) => !header.includes(k));
    if (header.length === 0) {
      const known = PREFERRED.filter((k) => k in record);
      header = known.concat(additions.filter((k) => !known.includes(k)));
    } else if (additions.length) {
      header = header.concat(additions);
    }
    if (additions.length || header.length) {
      await call(
        `${sheetId}/values/${encodeURIComponent(form)}!1:1?valueInputOption=RAW`,
        { method: "PUT", body: JSON.stringify({ values: [header] }) }
      );
    }

    await call(
      `${sheetId}/values/${encodeURIComponent(form)}!A:A:append` +
        `?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        body: JSON.stringify({ values: [header.map((h) => record[h] ?? "")] }),
      }
    );

    return res.status(200).json({ ok: true });
  } catch (err) {
    // Logged in full so the lead survives even when the write does not.
    console.error("[lead] write failed:", err.message, "payload:", JSON.stringify(record));
    return res.status(502).json({ ok: false, error: "Could not record submission" });
  }
};
