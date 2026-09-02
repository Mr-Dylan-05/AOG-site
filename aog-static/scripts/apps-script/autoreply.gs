/**
 * autoreply.gs — the enquiry confirmation, sent from the Google Sheet.
 *
 * WHY A TIMER AND NOT onEdit / onChange
 * Rows arrive through the Sheets API as a service account. Neither onEdit nor
 * onChange fires for that — they react to a person editing the sheet — and
 * neither do Sheets' own notification rules. A time-driven trigger polls
 * instead, which is why this scans for unsent rows rather than reacting to one.
 *
 * WHY THIS INSTEAD OF SENDING FROM THE SITE
 * Sending from the serverless function needs domain-wide delegation, which is a
 * Workspace super-admin grant. This runs as whoever owns the script, so it needs
 * no admin involvement at all — just the normal one-time authorisation prompt.
 *
 * WHAT IT COSTS: about a minute of delay instead of instant.
 *
 * INSTALL
 *   1. Open the leads spreadsheet > Extensions > Apps Script
 *   2. Paste this file in, replacing anything there
 *   3. Check the settings below, especially START_FROM
 *   4. Run `install` once from the toolbar and accept the permission prompt
 *   5. Send a test enquiry through the form and watch the `enquiry` tab
 *
 * To send as info@adongroup.com.au the script must run under an account that
 * has it as a Send-as alias (Gmail > Settings > Accounts). Owning the script
 * from the info@ account itself is simpler. If the alias is not available the
 * script falls back to the owner's own address rather than failing, and says so
 * in the log.
 */

/* ----------------------------------------------------------- settings ---- */

var TAB = "enquiry";               // the tab /api/lead writes AI training enquiries to
var MARKER = "autoreply_sent";     // column this script creates and stamps
var SEND_AS = "info@adongroup.com.au";
var SENDER_NAME = "Ad On Group";
var BCC = "adonai@adongroup.com.au";   // "" for none
var BOOKING = "https://calendly.com/adongroup-info/30min?guests=paul@adongroup.com.au";

/**
 * Nothing submitted before this is ever emailed.
 *
 * Without it the first run would mail every historical lead in the tab at once
 * — the single worst thing this script could do. Set it to now when installing.
 */
var START_FROM = "2026-09-02T00:00:00+10:00";

var MAX_PER_RUN = 40;              // keeps one run well inside the quota

/* --------------------------------------------------------------- copy ---- */

/**
 * PLACEHOLDER — not signed off. Editing this function is the whole job of
 * changing the email.
 */
function buildEmail_(row) {
  var name = firstName_(row.name);
  var hello = name ? "Hi " + name + "," : "Hi,";
  var lines = [
    hello,
    "",
    "Thanks for getting in touch about AI training. One of our course facilitators will be in contact shortly.",
    "",
    "If you would rather talk sooner, you can book a time here:",
    BOOKING,
    "",
    "Ad On Group",
    "(07) 5586 1400"
  ];
  return {
    subject: "We have got your AI training enquiry",
    body: lines.join("\n"),
    html: lines
      .map(function (l) {
        if (l === "") return "<p style=\"margin:0 0 14px\"></p>";
        if (l.indexOf("http") === 0) {
          return '<p style="margin:0 0 14px"><a href="' + l + '" style="color:#1483B5">' + l + "</a></p>";
        }
        return '<p style="margin:0 0 14px">' + escapeHtml_(l) + "</p>";
      })
      .join("")
  };
}

/* ------------------------------------------------------------- helpers --- */

function escapeHtml_(v) {
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** First name from whatever they typed, or "" so the greeting stays "Hi,". */
function firstName_(raw) {
  raw = String(raw == null ? "" : raw).trim();
  if (!raw) return "";
  if (raw.indexOf(",") > -1) raw = raw.split(",")[1] || raw.split(",")[0];
  var skip = /^(mr|mrs|ms|miss|mx|dr|prof|sir)\.?$/i;
  var word = "";
  var parts = raw.trim().split(/\s+/);
  for (var i = 0; i < parts.length; i++) {
    if (parts[i] && !skip.test(parts[i])) { word = parts[i]; break; }
  }
  if (!word || word.indexOf("@") > -1) return "";
  var clean = word.replace(/[^A-Za-zÀ-ɏ'-]/g, "");
  if (!clean || clean.length > 30) return "";
  var uniform = clean === clean.toLowerCase() || clean === clean.toUpperCase();
  return uniform ? clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase() : clean;
}

function validEmail_(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim());
}

/** The alias, if this account is allowed to use it. */
function sendAs_() {
  try {
    var aliases = GmailApp.getAliases();
    if (aliases.indexOf(SEND_AS) > -1) return SEND_AS;
    if (Session.getEffectiveUser().getEmail() === SEND_AS) return SEND_AS;
  } catch (e) { /* fall through */ }
  Logger.log("Alias " + SEND_AS + " not available; sending as the script owner instead.");
  return "";
}

/* ----------------------------------------------------------------- run --- */

/** Run once from the toolbar. Safe to run again; it will not stack triggers. */
function install() {
  var existing = ScriptApp.getProjectTriggers();
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].getHandlerFunction() === "sendPendingReplies") {
      ScriptApp.deleteTrigger(existing[i]);
    }
  }
  ScriptApp.newTrigger("sendPendingReplies").timeBased().everyMinutes(1).create();
  Logger.log("Installed. Checking every minute; nothing before " + START_FROM + " will be emailed.");
  sendPendingReplies();
}

function sendPendingReplies() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return;          // never let two runs overlap
  try {
    var sheet = SpreadsheetApp.getActive().getSheetByName(TAB);
    if (!sheet) { Logger.log('No tab named "' + TAB + '"'); return; }

    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow < 2) return;

    var header = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var col = function (name) { return header.indexOf(name); };

    // The marker column is created on first run rather than by hand.
    var markerCol = col(MARKER);
    if (markerCol === -1) {
      markerCol = lastCol;
      sheet.getRange(1, markerCol + 1).setValue(MARKER);
      header.push(MARKER);
      lastCol = lastCol + 1;
    }

    var emailCol = col("email");
    var nameCol = col("name");
    var whenCol = col("submitted_at");
    if (emailCol === -1) { Logger.log("No email column"); return; }

    var rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    var cutoff = new Date(START_FROM).getTime();
    var alias = sendAs_();
    var sent = 0;

    for (var i = 0; i < rows.length && sent < MAX_PER_RUN; i++) {
      var r = rows[i];
      if (String(r[markerCol] || "").trim()) continue;        // already handled
      var to = String(r[emailCol] || "").trim();
      if (!validEmail_(to)) continue;

      // Anything older than the cutoff is marked, never sent. That is what
      // stops the first run mailing the whole back catalogue.
      var when = whenCol > -1 ? new Date(r[whenCol]).getTime() : NaN;
      if (!isNaN(when) && when < cutoff) {
        sheet.getRange(i + 2, markerCol + 1).setValue("skipped (before cutoff)");
        continue;
      }

      var mail = buildEmail_({ name: nameCol > -1 ? r[nameCol] : "" });
      var options = { name: SENDER_NAME, htmlBody: mail.html };
      if (alias) options.from = alias;
      if (BCC) options.bcc = BCC;

      try {
        GmailApp.sendEmail(to, mail.subject, mail.body, options);
        sheet.getRange(i + 2, markerCol + 1).setValue(new Date());
        sent++;
      } catch (err) {
        // Stamped so one bad address cannot block the queue every minute.
        sheet.getRange(i + 2, markerCol + 1).setValue("failed: " + err.message);
        Logger.log("Row " + (i + 2) + " failed: " + err.message);
      }
    }
    if (sent) Logger.log("Sent " + sent);
  } finally {
    lock.releaseLock();
  }
}
