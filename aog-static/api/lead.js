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
const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.send";
const GMAIL_SEND = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
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
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "fbclid", "landing_page",
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

/**
 * A token for one scope. `subject` impersonates a Workspace mailbox, which is
 * how mail leaves as info@ rather than as the service account — it requires
 * domain-wide delegation for that scope, granted once in the Admin console.
 */
async function accessToken(creds, scope = SCOPE, subject = "") {
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: creds.client_email,
      scope,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
      ...(subject ? { sub: subject } : {}),
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
  if (!res.ok) {
    // The two failures worth naming, because the raw response does not say
    // which of them it is and they need different fixes.
    if (json.error === "unauthorized_client") {
      throw new Error(
        `google auth: the service account is not authorised to act as ${subject || "this user"}. ` +
          "Domain-wide delegation is missing, or was granted for a different scope, " +
          "or the numeric Unique ID was mistyped. It can also take a few minutes to " +
          "propagate after being added."
      );
    }
    if (json.error === "invalid_grant" && subject) {
      throw new Error(
        `google auth: ${subject} was rejected. The mailbox must exist in this ` +
          "Workspace domain and the service account key must belong to it."
      );
    }
    throw new Error(`google auth ${res.status}: ${JSON.stringify(json)}`);
  }
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

/* ----------------------------------------------------- the auto-reply ---- */

/**
 * The confirmation sent to the person who enquired.
 *
 * WHY FROM HERE AND NOT FROM THE SHEET
 * Same reason the Chat notification lives here: every row arrives through the
 * Sheets API as a service account, and neither an Apps Script trigger nor
 * Sheets' own notification rules fire for that. A time-based poll would put
 * minutes between someone pressing submit and the mail they were promised on
 * the thank-you panel.
 *
 * WHY GMAIL AND NOT AN EMAIL SERVICE
 * It sends as a real Workspace mailbox, so SPF and DKIM already pass with no
 * DNS change, replies land in the inbox someone is already watching, and a
 * copy appears in Sent. It also reuses the service account and the JWT code
 * that are already here — no vendor, no key, no dependency.
 *
 * SETUP (once, by a Workspace super-admin)
 *   Admin console > Security > Access and data control > API controls
 *     > Domain-wide delegation > Add new
 *   Client ID : the service account's numeric "Unique ID"
 *               (Cloud Console > IAM & Admin > Service Accounts)
 *   Scope     : https://www.googleapis.com/auth/gmail.send   (this one only)
 *
 * ENV
 *   AUTOREPLY_FROM   the mailbox to send as, e.g. info@adongroup.com.au.
 *                    UNSET = nothing is sent. That is the switch.
 *   AUTOREPLY_NAME   display name, defaults to "Ad On Group"
 *   BOOKING_URL      optional, the Calendly link to offer in the mail
 *   AUTOREPLY_BCC    optional, silent copy; defaults to adonai@adongroup.com.au,
 *                    set it to an empty string to send no copy at all
 */

/* Which forms get a confirmation.
   data-form="enquiry" and nothing else. That key is used on exactly two
   pages, the inline form on /ai-training/ and /ai-enquiry/, both of them AI
   training — so the mail can talk about AI training and be right every time.
   The quiz is deliberately out: answering six questions to see your own
   result is not an enquiry, and "we have got your enquiry" would be wrong.
   The contact, partner and referral forms are not AI training at all. */
const AUTOREPLY_FORMS = ["enquiry"];

/**
 * The first name from whatever they typed into the name field.
 *
 * People type "jane smith", "SMITH, Jane", "Dr Jane Smith" and " jane ". The
 * greeting has to survive all of it, and fall back to a plain "Hi," rather
 * than greet someone by a title or an empty string.
 */
function firstName(record) {
  let raw = String(record.firstName || record.name || "").trim();
  if (!raw) return "";
  if (raw.includes(",")) raw = raw.split(",")[1] || raw.split(",")[0];   // "Smith, Jane"
  const skip = /^(mr|mrs|ms|miss|mx|dr|prof|sir)\.?$/i;
  const word = raw.trim().split(/[\s]+/).find((w) => w && !skip.test(w)) || "";
  if (word.includes("@")) return "";            // an address typed into the name field
  const clean = word.replace(/[^\p{L}\p{M}'-]/gu, "");
  if (!clean || clean.length > 30) return "";
  // "jane" and "JANE" both become "Jane". Mixed case is left alone, so
  // "McLean" and "O'Neil" keep the capitals their owner gave them.
  const uniform = clean === clean.toLowerCase() || clean === clean.toUpperCase();
  return uniform
    ? clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase()
    : clean;
}

/**
 * ============ PLACEHOLDER COPY — NOT APPROVED, REPLACE BEFORE ENABLING ======
 * Nothing below has been signed off. It exists so the path can be tested end
 * to end; leaving AUTOREPLY_FROM unset keeps it unsent. Editing this function
 * is the whole job of changing the email.
 */
function autoReplyCopy(record) {
  const hello = `Hi${firstName(record) ? " " + firstName(record) : ""},`;
  const booking = process.env.BOOKING_URL || "";

  const subject = "We have got your AI training enquiry";
  const lines = [
    hello,
    "",
    "Thanks for getting in touch about AI training. One of our course facilitators will be in contact shortly.",
    ...(booking ? ["", `If you would rather talk sooner, you can book a time here: ${booking}`] : []),
    "",
    "Ad On Group",
    "(07) 5586 1400",
  ];
  const text = lines.join("\n");
  const html =
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#0B1220">` +
    lines
      .map((l) =>
        l === ""
          ? "<p style=\"margin:0 0 14px\"></p>"
          : `<p style="margin:0 0 14px">${escapeHtml(l).replace(
              /(https?:\/\/\S+)/,
              '<a href="$1" style="color:#1483B5">$1</a>'
            )}</p>`
      )
      .join("") +
    `</div>`;
  return { subject, text, html };
}
/* =========================================================================== */

/** RFC 2047, so a subject with an accent or a dash does not arrive as mojibake. */
const encodeHeader = (v) =>
  /^[\x20-\x7E]*$/.test(v)
    ? v
    : `=?UTF-8?B?${Buffer.from(v, "utf8").toString("base64")}?=`;

/** Base64 body, wrapped at 76 columns as the MIME spec requires. */
const b64body = (v) =>
  (Buffer.from(v, "utf8").toString("base64").match(/.{1,76}/g) || []).join("\r\n");

/**
 * multipart/alternative: a plain-text part alongside the HTML. Text-only
 * clients and spam filters both prefer a message that carries one.
 */
function buildMessage(from, name, to, copy) {
  const boundary = "aog-" + crypto.randomBytes(12).toString("hex");
  // Bcc, so the copy is invisible to the person who enquired — they see a
  // reply from info@ and nothing else. Gmail honours a Bcc header on a raw
  // message: it delivers to the address and strips the header on the way out.
  // Set AUTOREPLY_BCC to "" to turn it off; unset falls back to the default.
  const bcc =
    process.env.AUTOREPLY_BCC !== undefined
      ? process.env.AUTOREPLY_BCC.trim()
      : "adonai@adongroup.com.au";
  return [
    `From: ${encodeHeader(name)} <${from}>`,
    `To: <${to}>`,
    ...(bcc ? [`Bcc: <${bcc}>`] : []),
    `Subject: ${encodeHeader(copy.subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    b64body(copy.text),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    b64body(copy.html),
    `--${boundary}--`,
    "",
  ].join("\r\n");
}

/**
 * Best-effort, exactly like the Chat notification. The lead is already in the
 * sheet; a mail that fails is worth a log line and nothing more. Awaited rather
 * than left running, because the function is frozen the moment it responds.
 */
async function sendAutoReply(creds, form, record) {
  const from = (process.env.AUTOREPLY_FROM || "").trim();
  // Every exit says why. Silent returns are what made "no email arrived"
  // impossible to tell apart from "the variable is not set in this
  // environment" — the log is the only place this path is visible.
  if (!from) {
    console.log("[lead] auto-reply skipped: AUTOREPLY_FROM is not set");
    return;
  }
  if (!AUTOREPLY_FORMS.includes(form)) {
    console.log(`[lead] auto-reply skipped: form "${form}" is not in [${AUTOREPLY_FORMS}]`);
    return;
  }

  const to = String(record.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) {
    console.log(`[lead] auto-reply skipped: no usable email address (${JSON.stringify(to)})`);
    return;
  }

  try {
    const token = await accessToken(creds, GMAIL_SCOPE, from);
    const raw = Buffer.from(
      buildMessage(from, process.env.AUTOREPLY_NAME || "Ad On Group", to, autoReplyCopy(record))
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await fetch(GMAIL_SEND, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ raw }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[lead] auto-reply ${res.status}:`, detail.slice(0, 300));
    } else {
      console.log(`[lead] auto-reply sent to ${to} as ${from}`);
    }
  } catch (err) {
    console.error("[lead] auto-reply failed:", err.message);
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
    await sendAutoReply(creds, form, record);

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
