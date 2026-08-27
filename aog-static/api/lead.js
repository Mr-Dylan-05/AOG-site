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
 * GOOGLE CHAT
 * Every saved lead is also posted to a Google Chat space, because a row
 * appearing in a spreadsheet is not a notification and nobody watches a sheet.
 * It is done here rather than from the sheet on purpose: an Apps Script
 * trigger and Sheets' own notification rules both react to people editing the
 * sheet, and neither fires for a write made through the API by a service
 * account, which is the only way rows ever arrive.
 *
 * The post is best-effort. A lead that is in the sheet is safe whether or not
 * Chat hears about it, so a webhook that is missing, slow or broken is logged
 * and ignored rather than failing the submission. With no webhook set, this
 * whole path is inert, the same way a form with no endpoint is.
 *
 * ENV (set in Vercel > Settings > Environment Variables)
 *   GOOGLE_SERVICE_ACCOUNT_JSON  the whole service-account key file, pasted in
 *   LEADS_SHEET_ID               the id from the sheet's URL
 *   GOOGLE_CHAT_WEBHOOK_URL      incoming webhook for the space to notify
 *   GOOGLE_CHAT_WEBHOOK_URL_<FORM>  optional, routes one form to its own space
 *                                (e.g. GOOGLE_CHAT_WEBHOOK_URL_QUIZ)
 *   GOOGLE_CHAT_MENTION          optional, e.g. <users/all>, to ping the space
 *
 * FAILURE
 * If Sheets rejects the write we return 502 rather than a cheerful 200, so the
 * visitor sees the error and can retry or call. The payload is also written to
 * the Vercel log, and Chat is told the lead arrived but was not saved, so a
 * lead is recoverable even in that case.
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
  "message", "ai_goal", "contactPreference",
  "score", "band",
  "current_use", "worry", "motivation", "barrier", "support", "intent",
  "source", "page",
  "utm_source", "utm_medium", "utm_campaign", "utm_content",
];

/* What goes on the Chat card, in the order a person reads a lead. Everything
   else stays in the sheet: the card is a nudge to act, not the record. */
const CARD_FIELDS = [
  "name", "firstName", "lastName", "email", "phone", "company", "role",
  "job_title", "industry", "website", "message", "ai_goal", "intent",
  "contactPreference", "band", "score",
];

const CARD_LABELS = {
  ai_goal: "What they want from AI",
  contactPreference: "Prefers",
  job_title: "Job title",
  firstName: "First name",
  lastName: "Last name",
  band: "Quiz band",
  score: "Quiz score",
};

/* Fallback for a field with no entry above: "job_title" -> "Job title". A new
   quiz question then reads properly on the card without touching this file. */
const label = (key) => {
  const words = key.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const CARD_ICONS = {
  name: "PERSON", firstName: "PERSON", lastName: "PERSON",
  email: "EMAIL", phone: "PHONE", company: "STORE", website: "BOOKMARK",
  message: "DESCRIPTION", ai_goal: "DESCRIPTION",
  band: "STAR", score: "STAR",
};

/* Where the team reading the notification is, so the timestamp on the card is
   their time rather than UTC. */
const TIMEZONE = "Australia/Sydney";

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

/* Returns the tab's header row and its gid, creating the tab if it is not
   there yet. The gid is only wanted so the Chat card can link to the tab the
   lead actually landed in rather than to whichever one opens first. */
async function ensureTab(call, sheetId, tab) {
  const meta = await call(`${sheetId}?fields=sheets.properties(title,sheetId)`);
  const existing = (meta.sheets || []).find((s) => s.properties.title === tab);
  if (!existing) {
    const made = await call(`${sheetId}:batchUpdate`, {
      method: "POST",
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title: tab } } }] }),
    });
    const props = ((made.replies || [])[0] || {}).addSheet;
    return { header: [], gid: props ? props.properties.sheetId : null };
  }
  const row = await call(`${sheetId}/values/${encodeURIComponent(tab)}!1:1`);
  return { header: (row.values && row.values[0]) || [], gid: existing.properties.sheetId };
}

/* Chat card text takes a small subset of HTML, so anything a visitor typed has
   to be escaped or a stray angle bracket eats the rest of the line. */
const escapeHtml = (v) =>
  String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* A form can have its own space; otherwise everything lands in one. */
function webhookFor(form) {
  const own = `GOOGLE_CHAT_WEBHOOK_URL_${form.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
  return process.env[own] || process.env.GOOGLE_CHAT_WEBHOOK_URL || "";
}

function chatMessage(form, record, sheetUrl, failed) {
  const named = [record.name, record.firstName, record.lastName]
    .filter(Boolean).join(" ").trim();
  // Angle brackets are how Chat writes a mention, so they are stripped from
  // the plain-text line rather than escaped.
  const who = (named || record.email || "Someone").replace(/[<>]/g, "").slice(0, 80);
  const mention = process.env.GOOGLE_CHAT_MENTION
    ? `${process.env.GOOGLE_CHAT_MENTION} ` : "";

  const widgets = [];
  for (const key of CARD_FIELDS) {
    const value = String(record[key] == null ? "" : record[key]).trim();
    if (!value) continue;
    widgets.push({
      decoratedText: {
        topLabel: CARD_LABELS[key] || label(key),
        text: escapeHtml(value.slice(0, 400)),
        wrapText: true,
        ...(CARD_ICONS[key] ? { startIcon: { knownIcon: CARD_ICONS[key] } } : {}),
      },
    });
  }

  // Which ad or page produced this, which is the whole point of running the
  // campaign pages separately from the main contact form.
  const from = ["utm_source", "utm_campaign", "utm_medium", "utm_content"]
    .map((k) => record[k]).filter(Boolean).join(" \u00b7 ") || record.source || record.page;
  if (from) {
    widgets.push({
      decoratedText: {
        topLabel: "Came from",
        text: escapeHtml(String(from).slice(0, 300)),
        wrapText: true,
        startIcon: { knownIcon: "BOOKMARK" },
      },
    });
  }

  if (failed) {
    widgets.push({
      decoratedText: {
        topLabel: "Warning",
        text: "This lead was <b>not saved to the sheet</b>. The full payload is in the Vercel log.",
        wrapText: true,
      },
    });
  }

  const sections = [{ widgets }];
  if (sheetUrl && !failed) {
    sections.push({
      widgets: [{
        buttonList: {
          buttons: [{ text: "Open the sheet", onClick: { openLink: { url: sheetUrl } } }],
        },
      }],
    });
  }

  let when = "";
  try {
    when = new Date().toLocaleString("en-AU", {
      timeZone: TIMEZONE, dateStyle: "medium", timeStyle: "short",
    });
  } catch (_) { /* a bad timezone name should not cost us the notification */ }

  return {
    // Chat's notification popup shows this line, not the card, so it has to
    // say who and which form on its own.
    text: failed
      ? `${mention}\u26a0\ufe0f ${form} lead from ${who} could NOT be saved to the sheet`
      : `${mention}New ${form} lead: ${who}`,
    cardsV2: [{
      cardId: "lead",
      card: {
        header: {
          title: escapeHtml(who),
          subtitle: [failed ? `${form} \u2014 NOT SAVED` : form, when].filter(Boolean).join(" \u00b7 "),
        },
        sections,
      },
    }],
  };
}

/* Best-effort: the lead is already safe in the sheet, so nothing here is
   allowed to throw. Awaited rather than left running, because a serverless
   function is frozen the moment it responds and a floating fetch would be
   killed mid-flight; the timeout keeps a hung webhook off the visitor's
   thank-you page. */
async function notifyChat(form, record, sheetUrl, failed) {
  const url = webhookFor(form);
  if (!url) return;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(chatMessage(form, record, sheetUrl, failed)),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[lead] chat notify ${res.status}:`, detail.slice(0, 300));
    }
  } catch (err) {
    console.error("[lead] chat notify failed:", err.message);
  }
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
    // Same reasoning as the write failure below: the lead exists, the record
    // of it does not, so say so anywhere that can still be heard.
    console.error("[lead] not configured; payload:", JSON.stringify(record));
    await notifyChat(form, record, "", true);
    return res.status(500).json({ ok: false, error: "Lead capture is not configured" });
  }

  try {
    const creds = JSON.parse(raw);
    const call = api(await accessToken(creds));

    let { header, gid } = await ensureTab(call, sheetId, form);

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

    const sheetUrl =
      `https://docs.google.com/spreadsheets/d/${sheetId}/edit` +
      (gid == null ? "" : `#gid=${gid}`);
    await notifyChat(form, record, sheetUrl, false);

    return res.status(200).json({ ok: true });
  } catch (err) {
    // Logged in full so the lead survives even when the write does not, and
    // Chat is told too: a lead that failed to save is the one most worth
    // interrupting somebody about.
    console.error("[lead] write failed:", err.message, "payload:", JSON.stringify(record));
    await notifyChat(form, record, "", true);
    return res.status(502).json({ ok: false, error: "Could not record submission" });
  }
};
