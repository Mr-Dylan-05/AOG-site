/**
 * No-show nurture emails for AI Training bookings
 *
 * When someone books an AI Training call and doesn't turn up, the sales team
 * sets call_status to "No show" on the booking tab of the Campaign Leads
 * sheet. This script then sends Pete's no-show nurture emails 2 to 7 (Paul,
 * 18 Nov 2026: "run with email 2 onwards of what Pete did"), one at a time:
 *
 *   Email 2  the morning after the row is marked No show
 *   Email 3  2 days later
 *   Email 4  2 days later
 *   Email 5  2 days later
 *   Email 6  2 days later
 *   Email 7  2 days later, then the sequence is finished
 *
 * Emails go out at about 9am Brisbane time, never before 8am or after 6pm,
 * and never two on the same day for one person.
 *
 * IT STOPS BY ITSELF WHEN
 *   - call_status changes from No show to anything else (e.g. Rescheduled);
 *   - the same email address books again (a newer row on the booking tab);
 *   - they reply to any email (this is also how they unsubscribe: every email
 *     says "reply STOP and we won't email you again");
 *   - Calendly emails this mailbox about a new booking for their address.
 * The reason goes in nurture_status. To stop someone by hand, type
 * "stopped" in their nurture_status cell.
 *
 * SENDER
 * Sent from info@adongroup.com.au as "Ad On AI", replies to info@. Gmail only
 * lets a script send from its own account or a verified send-as alias, and it
 * can only see replies in its own mailbox, so INSTALL THIS SIGNED IN AS
 * info@adongroup.com.au. nurtureSetup() refuses to start otherwise.
 *
 * INSTALL (as info@adongroup.com.au, in a NEW standalone project)
 * 0. Make sure info@adongroup.com.au can edit the Campaign Leads sheet.
 * 1. Go to script.google.com > New project. Name it "No-show nurture".
 *    Paste this file over the default Code.gs. (Keep it out of the sheet's
 *    own "sms reminder" project so the two can never interfere.)
 * 2. Project Settings: set the time zone to Australia/Brisbane.
 * 3. Run nurtureSendSamples() and approve the permissions. All six emails
 *    arrive in info@'s inbox (or NURTURE_TEST_TO, see below) for a final read.
 * 4. Run nurturePreview(). It logs who is marked No show and what would
 *    happen to each row. Nothing is sent or written.
 * 5. Run nurtureSetup(). It adds four columns at the end of the booking tab
 *    (nurture_started_at, nurture_sent, nurture_last_sent_at,
 *    nurture_status), marks No-show rows booked more than 30 days ago as
 *    "skipped: before go-live", and starts an hourly timer.
 *
 * TESTING WITH REAL ROWS
 * Script property NURTURE_TEST_TO (Project Settings > Script properties): while
 * set, every email goes to that address instead, with "[TEST for name@...]"
 * in the subject. Delete the property to go live. Rows sent in test mode
 * still count as sent, so clear their four nurture cells afterwards if they
 * should get the real emails.
 *
 * TURN IT OFF: run nurtureStop(). Rows keep their markers.
 */

const NURTURE_SHEET_ID = '164GY9O3w465ertosUCN1S_Xdk5zhgetSzfss065fOEo';
const NURTURE_TAB = 'booking';
const NURTURE_TZ = 'Australia/Brisbane';
const NURTURE_HANDLER = 'nurtureRun';
const NURTURE_FROM = 'info@adongroup.com.au';
const NURTURE_FROM_NAME = 'Ad On AI';
const NURTURE_SEND_HOUR = 9;
const NURTURE_WINDOW = [8, 18];          // only send between 8am and 6pm
const NURTURE_MIN_GAP_HOURS = 36;        // never two emails within this
const NURTURE_BACKFILL_DAYS = 30;
const NURTURE_NOSHOW = /^\s*no[\s-]*show/i;   // "No show", "No-show reached", ...
const NURTURE_COLS = ['nurture_started_at', 'nurture_sent', 'nurture_last_sent_at', 'nurture_status'];

const NURTURE_CALENDLY = 'https://calendly.com/adongroup-info/30min';
const NURTURE_CALENDLY_GUESTS = 'paul.harding@adongroup.com.au';   // same as the website's booking link
const NURTURE_INFO_PAGE = 'https://adongroup.com.au/ai-training/';

const NURTURE_SIGNOFF = ['The Ad On AI team', 'Course Coordinator', 'Ad On AI | Ad On Group'];
const NURTURE_FOOTER = 'Ad On Group (ABN 54 808 983 598) · 1/44 Township Drive, Burleigh Heads QLD 4220 · (07) 5586 1400';
const NURTURE_OPTOUT = "Don't want these emails? Just reply STOP and we won't email you again.";

/*
 * The emails. Pete's copy ("Appointment NO SHOW nurture emails.docx",
 * 30 Oct 2026), emails 2 to 7, with only these changes: the name in each
 * subject, "14 000" written as "14,000", and email 3's "(link)" made a real
 * link to the AI Training page.
 *
 * Blocks: a plain string is a paragraph; {b:'...'} is a bold paragraph;
 * {q:[...]} is a group of short lines; 'BOOK' is the Book a call button;
 * {link:[before, text, after]} is a paragraph with the info-page link.
 * {first} is the person's first name.
 */
const NURTURE_EMAILS = [
  {
    n: 2, day: 1,
    subject: 'Who would actually be teaching you AI, {first}?',
    blocks: [
      "One question worth asking when you're comparing AI training programs is:",
      { b: 'Who is actually behind the training?' },
      'Ad On AI is part of Ad On Group, an established Australian company since 2008 with a long history of working with over 14,000 Australian businesses.',
      'And our AI training is delivered by Claude-certified Associates and AI specialists — not someone who simply started calling themselves an AI expert.',
      "You're learning from people who work with these technologies and businesses every day.",
      "If you'd like to understand how that translates into the Ad On AI program, book a quick chat with us:",
      'BOOK',
    ],
  },
  {
    n: 3, day: 3,
    subject: 'What happens during AND after you finish the course, {first}?',
    blocks: [
      "Here's something we think is often overlooked with AI training.",
      { b: 'What happens when the course finishes?' },
      "Because that's often when the real questions start.",
      { q: ['"How do I use this for my business?"', '"Can AI actually do this task?"', '"How do I improve this workflow?"', '"What should I try next?"'] },
      "That's why Ad On AI isn't designed as a hit-and-run training course.",
      'You learn at your own pace, AND have 2 hours of one-on-one support and mentorship every month to keep progressing from day 1.',
      { link: ['Make sure to check out ', 'our info page on our website', ' to get the full picture.'] },
      "If ongoing support is important to you, let's have a chat:",
      'BOOK',
    ],
  },
  {
    n: 4, day: 5,
    subject: 'You might be wondering how much the Ad On AI Training costs, {first}?',
    blocks: [
      "We sent you the Ad On AI Training website info — but you may have noticed we didn't include the price.",
      "There's a reason for that.",
      "The Ad On AI Training and ongoing support programme is designed for different people and different goals, so we prefer to understand what you're looking to achieve before talking through the options. We have a faster paced course or an advanced one. Which path we go down would depend on your goals and situation.",
      "And frankly, we'd rather have a conversation than send you a price and leave you to work everything out yourself.",
      "The call is quick, there's no obligation, and you can ask us anything about the program.",
      'BOOK',
      "If you're wondering \"How much is this actually going to cost me?\" — let's talk.",
    ],
  },
  {
    n: 5, day: 7,
    subject: "AI isn't really the hard part, {first}",
    blocks: [
      'A lot of people tell us the same thing:',
      { b: "\"I know I need to get better at AI. I just don't know where to start.\"" },
      "And that's exactly the problem.",
      "There are thousands of tools, countless YouTube videos and a new AI announcement every week.",
      "The challenge isn't finding information.",
      "It's knowing what matters, what to learn from who and how to actually use it.",
      "That's where structured training, expert guidance and ongoing mentorship can make a big difference.",
      "If you'd like to talk through where you should start, book a quick call:",
      'BOOK',
    ],
  },
  {
    n: 6, day: 9,
    subject: 'What could becoming REALLY good at AI actually change, {first}?',
    blocks: [
      'Forget AI for a moment.',
      'Think about your work or your business.',
      { q: ['What would it mean if you could get more done in less time?', 'Reduce repetitive tasks?', 'Become more valuable to your employer or have more productive employees?', 'Give your business more capacity without simply working longer?', 'Or finally have the confidence to use AI properly rather than occasionally asking ChatGPT a question?'] },
      "That's the outcome we're aiming for with our Ad On AI Training programme and ongoing support.",
      'Not just learning AI.',
      'Learning how to use it to improve the way you work.',
      "If you'd like to explore what that could look like for you, book a quick call:",
      'BOOK',
    ],
  },
  {
    n: 7, day: 11,
    subject: '{first}, we can only support so many people at once',
    blocks: [
      'One final thought from us.',
      'We deliberately keep the number of people we take through Ad On AI manageable.',
      { b: 'Why?' },
      "Because 2 hours of one-on-one support every month isn't something you can provide to unlimited numbers of people and still do properly.",
      "We want our learners to be able to ask questions, get guidance and have someone help them turn what they're learning into something useful.",
      "So if you've been considering getting serious about AI, we'd encourage you to have the conversation. Let's talk.",
      'BOOK',
      "We'll explain the program, answer your questions and help you decide whether it's right for you.",
    ],
  },
];

/* ------------------------------------------------------------------ entry points */

/** Run once, as info@adongroup.com.au. Columns, old rows, then the hourly timer. */
function nurtureSetup() {
  nurtureCheckSender_();
  const sheet = nurtureSheet_();
  nurtureEnsureColumns_(sheet);
  const t = nurtureTable_(sheet);
  const cutoff = Date.now() - NURTURE_BACKFILL_DAYS * 86400000;
  let skipped = 0;
  t.rows.forEach(function (r) {
    if (!NURTURE_NOSHOW.test(r.get('call_status')) || r.get('nurture_status') || r.get('nurture_started_at')) return;
    const when = nurtureToMs_(r.get('booked_for')) || nurtureToMs_(r.get('submitted_at'));
    if (when && when < cutoff) { r.set('nurture_status', 'skipped: before go-live'); skipped++; }
  });
  ScriptApp.getProjectTriggers()
    .filter(function (tr) { return tr.getHandlerFunction() === NURTURE_HANDLER; })
    .forEach(function (tr) { ScriptApp.deleteTrigger(tr); });
  ScriptApp.newTrigger(NURTURE_HANDLER).timeBased().everyHours(1).create();
  Logger.log('Set up. ' + skipped + ' old No-show row(s) skipped. Hourly timer on.');
}

/** The hourly run. */
function nurtureRun() {
  const lock = LockService.getDocumentLock() || LockService.getScriptLock();
  if (!lock.tryLock(30000)) return;
  try {
    nurtureProcess_(false);
  } finally {
    lock.releaseLock();
  }
}

/** Logs what the next run would do. Sends and writes nothing. */
function nurturePreview() {
  nurtureProcess_(true);
}

/** Sends all six emails, with a sample name, to NURTURE_TEST_TO or this account. */
function nurtureSendSamples() {
  const to = PropertiesService.getScriptProperties().getProperty('NURTURE_TEST_TO') || Session.getActiveUser().getEmail();
  NURTURE_EMAILS.forEach(function (e) {
    const m = nurtureCompose_(e, 'Sam', 'Sam Sample', 'sam.sample@example.com');
    GmailApp.sendEmail(to, '[SAMPLE ' + e.n + '/7] ' + m.subject, m.text, nurtureMailOptions_(m.html));
  });
  Logger.log('Sent ' + NURTURE_EMAILS.length + ' samples to ' + to);
}

/** Turns the timer off. */
function nurtureStop() {
  ScriptApp.getProjectTriggers()
    .filter(function (tr) { return tr.getHandlerFunction() === NURTURE_HANDLER; })
    .forEach(function (tr) { ScriptApp.deleteTrigger(tr); });
  Logger.log('Timer off.');
}

/* ------------------------------------------------------------------ the work */

function nurtureProcess_(dryRun) {
  const sheet = nurtureSheet_();
  const t = nurtureTable_(sheet);
  const now = Date.now();
  const hour = Number(Utilities.formatDate(new Date(), NURTURE_TZ, 'H'));
  const inWindow = hour >= NURTURE_WINDOW[0] && hour < NURTURE_WINDOW[1];
  const testTo = PropertiesService.getScriptProperties().getProperty('NURTURE_TEST_TO');
  const say = function (r, msg) { if (dryRun) Logger.log('Row ' + r.num + ' (' + r.get('email') + '): ' + msg); };

  t.rows.forEach(function (r) {
    const status = String(r.get('nurture_status') || '').trim();
    if (/^(stopped|done|skipped|error)/i.test(status)) return;
    const isNoShow = NURTURE_NOSHOW.test(r.get('call_status'));
    const started = nurtureToMs_(r.get('nurture_started_at'));

    if (!started) {
      if (!isNoShow) return;
      say(r, 'marked No show: would start the sequence now (email 2 tomorrow morning)');
      if (!dryRun) {
        r.set('nurture_started_at', new Date(now));
        r.set('nurture_sent', 0);
        r.set('nurture_status', 'active');
      }
      return;
    }

    if (!isNoShow) {
      say(r, 'status changed to "' + r.get('call_status') + '": would stop');
      if (!dryRun) r.set('nurture_status', 'stopped: status changed to ' + (r.get('call_status') || 'blank'));
      return;
    }

    const sent = Number(r.get('nurture_sent')) || 0;
    if (sent >= NURTURE_EMAILS.length) {
      if (!dryRun) r.set('nurture_status', 'done');
      return;
    }
    const next = NURTURE_EMAILS[sent];
    const due = nurtureDueAt_(started, next.day);
    const last = nurtureToMs_(r.get('nurture_last_sent_at'));
    if (now < due || (last && now - last < NURTURE_MIN_GAP_HOURS * 3600000)) {
      say(r, 'email ' + next.n + ' due ' + Utilities.formatDate(new Date(Math.max(due, last + NURTURE_MIN_GAP_HOURS * 3600000)), NURTURE_TZ, 'EEE d MMM h:mm a'));
      return;
    }
    if (!inWindow) { say(r, 'email ' + next.n + ' is due, waiting for business hours'); return; }

    const email = String(r.get('email') || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      say(r, 'no valid email: would stop');
      if (!dryRun) r.set('nurture_status', 'stopped: no valid email');
      return;
    }
    const why = nurtureStopReason_(t, r, email, started);
    if (why) {
      say(r, why + ': would stop');
      if (!dryRun) r.set('nurture_status', 'stopped: ' + why);
      return;
    }

    const name = String(r.get('name') || [r.get('firstName'), r.get('lastName')].filter(String).join(' ')).trim();
    const first = nurtureFirstName_(r.get('firstName') || name);
    const m = nurtureCompose_(next, first, name, email);
    if (dryRun) { say(r, 'would send email ' + next.n + ': ' + m.subject + (testTo ? ' (to ' + testTo + ')' : '')); return; }

    try {
      const to = testTo || email;
      const subject = testTo ? '[TEST for ' + email + '] ' + m.subject : m.subject;
      GmailApp.sendEmail(to, subject, m.text, nurtureMailOptions_(m.html));
      const stamp = Utilities.formatDate(new Date(), NURTURE_TZ, 'd MMM h:mm a');
      r.set('nurture_sent', sent + 1);
      r.set('nurture_last_sent_at', new Date());
      r.set('nurture_status', (sent + 1 >= NURTURE_EMAILS.length ? 'done' : 'active') + ' · email ' + next.n + ' sent ' + stamp + (testTo ? ' (test)' : ''));
    } catch (err) {
      r.set('nurture_status', 'error: ' + String(err && err.message || err).slice(0, 120) + ' (clear this cell to retry)');
    }
  });
}

/** Why the sequence should stop for this person, or '' to carry on. */
function nurtureStopReason_(t, r, email, started) {
  // A newer booking from the same address on the booking tab.
  const rebooked = t.rows.some(function (o) {
    if (o.num === r.num) return false;
    if (String(o.get('email') || '').trim().toLowerCase() !== email) return false;
    return nurtureToMs_(o.get('submitted_at')) > started;
  });
  if (rebooked) return 'booked again';

  const since = Utilities.formatDate(new Date(started), NURTURE_TZ, 'yyyy/MM/dd');
  // They replied (this is also the STOP opt-out).
  if (GmailApp.search('from:' + email + ' after:' + since, 0, 1).length) return 'replied';
  // Calendly told this mailbox about a new booking for them.
  if (GmailApp.search('from:calendly.com "' + email + '" after:' + since, 0, 1).length) return 'booked again (Calendly)';
  return '';
}

/** 9am Brisbane, `days` days after the day the sequence started. */
function nurtureDueAt_(startedMs, days) {
  const day = Utilities.formatDate(new Date(startedMs), NURTURE_TZ, 'yyyy-MM-dd');
  const nine = new Date(day + 'T' + ('0' + NURTURE_SEND_HOUR).slice(-2) + ':00:00+10:00').getTime();
  return nine + days * 86400000;
}

/* ------------------------------------------------------------------ the email */

function nurtureCompose_(e, first, fullName, email) {
  const fill = function (s) {
    return first ? s.replace(/\{first\}/g, first) : s.replace(/,?\s*\{first\}[,?]?\s*/g, function (m) { return /\?/.test(m) ? '?' : ' '; }).replace(/^\s+|\s+$/g, '');
  };
  let subject = fill(e.subject);
  subject = subject.charAt(0).toUpperCase() + subject.slice(1);

  const link = NURTURE_CALENDLY +
    '?guests=' + encodeURIComponent(NURTURE_CALENDLY_GUESTS) +
    (fullName ? '&name=' + encodeURIComponent(fullName) : '') +
    '&email=' + encodeURIComponent(email) +
    '&utm_source=noshow-nurture&utm_medium=email&utm_campaign=noshow-email-' + e.n;

  const esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  const P = 'margin:0 0 16px;font-size:15px;line-height:1.6;color:#1F2937';
  const html = [];
  const text = [];
  const greet = 'Hi ' + (first || 'there') + ',';
  html.push('<p style="' + P + '">' + esc(greet) + '</p>');
  text.push(greet);

  e.blocks.forEach(function (b) {
    if (b === 'BOOK') {
      html.push('<p style="margin:22px 0 24px"><a href="' + esc(link) + '" style="display:inline-block;background:#1BABE5;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 22px;border-radius:10px">Book a call</a></p>');
      text.push('Book a call: ' + link);
    } else if (typeof b === 'string') {
      html.push('<p style="' + P + '">' + esc(b) + '</p>');
      text.push(b);
    } else if (b.b) {
      html.push('<p style="' + P + ';font-weight:700">' + esc(b.b) + '</p>');
      text.push(b.b);
    } else if (b.q) {
      html.push('<p style="' + P + '">' + b.q.map(esc).join('<br>') + '</p>');
      text.push(b.q.join('\n'));
    } else if (b.link) {
      html.push('<p style="' + P + '">' + esc(b.link[0]) + '<a href="' + NURTURE_INFO_PAGE + '" style="color:#1BABE5">' + esc(b.link[1]) + '</a>' + esc(b.link[2]) + '</p>');
      text.push(b.link[0] + b.link[1] + ' (' + NURTURE_INFO_PAGE + ')' + b.link[2]);
    }
  });

  html.push('<p style="' + P + ';margin-top:8px">' + NURTURE_SIGNOFF.map(esc).join('<br>') + '</p>');
  html.push('<p style="margin:28px 0 0;padding-top:14px;border-top:1px solid #E5E7EB;font-size:12px;line-height:1.5;color:#6B7280">' + esc(NURTURE_FOOTER) + '<br>' + esc(NURTURE_OPTOUT) + '</p>');
  text.push(NURTURE_SIGNOFF.join('\n'));
  text.push('--\n' + NURTURE_FOOTER + '\n' + NURTURE_OPTOUT);

  return {
    subject: subject,
    html: '<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px">' + html.join('\n') + '</div>',
    text: text.join('\n\n'),
  };
}

function nurtureMailOptions_(html) {
  const opts = { htmlBody: html, name: NURTURE_FROM_NAME, replyTo: NURTURE_FROM };
  if (Session.getActiveUser().getEmail().toLowerCase() !== NURTURE_FROM) opts.from = NURTURE_FROM;
  return opts;
}

function nurtureFirstName_(s) {
  const w = String(s || '').trim().split(/\s+/)[0] || '';
  if (!w || /@/.test(w)) return '';
  return w === w.toLowerCase() || w === w.toUpperCase() ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w;
}

/* ------------------------------------------------------------------ the sheet */

function nurtureCheckSender_() {
  const me = Session.getActiveUser().getEmail().toLowerCase();
  if (me === NURTURE_FROM) return;
  if (GmailApp.getAliases().map(function (a) { return a.toLowerCase(); }).indexOf(NURTURE_FROM) !== -1) {
    Logger.log('Warning: running as ' + me + ' with ' + NURTURE_FROM + ' as an alias. Emails will send, but replies to info@ are not visible to this account, so "stop on reply" will not work. Install as ' + NURTURE_FROM + ' instead.');
    return;
  }
  throw new Error('Install this signed in as ' + NURTURE_FROM + ' (currently ' + me + ').');
}

function nurtureSheet_() {
  const sheet = SpreadsheetApp.openById(NURTURE_SHEET_ID).getSheetByName(NURTURE_TAB);
  if (!sheet) throw new Error('No "' + NURTURE_TAB + '" tab in the leads sheet');
  return sheet;
}

/** Adds the nurture columns after the last header, if they are not there yet. */
function nurtureEnsureColumns_(sheet) {
  const width = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, width).getValues()[0].map(function (h) { return String(h).trim(); });
  let last = 0;
  headers.forEach(function (h, i) { if (h) last = i + 1; });
  NURTURE_COLS.forEach(function (c) {
    if (headers.indexOf(c) !== -1) return;
    last++;
    if (last > sheet.getMaxColumns()) sheet.insertColumnAfter(sheet.getMaxColumns());
    sheet.getRange(1, last).setValue(c);
  });
}

/** Rows as objects that read and write cells by header name. */
function nurtureTable_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const all = sheet.getRange(1, 1, Math.max(lastRow, 1), lastCol).getValues();
  const headers = all[0].map(function (h) { return String(h).trim(); });
  ['email', 'call_status'].forEach(function (h) {
    if (headers.indexOf(h) === -1) throw new Error('Header "' + h + '" not found on the ' + NURTURE_TAB + ' tab');
  });
  const col = function (h) { return headers.indexOf(h); };
  const rows = all.slice(1).map(function (values, i) {
    const num = i + 2;
    return {
      num: num,
      get: function (h) { const c = col(h); return c === -1 ? '' : values[c]; },
      set: function (h, v) {
        const c = col(h);
        if (c === -1) throw new Error('Column "' + h + '" missing. Run nurtureSetup() first.');
        sheet.getRange(num, c + 1).setValue(v);
        values[c] = v;
      },
    };
  });
  return { headers: headers, rows: rows };
}

function nurtureToMs_(v) {
  if (v instanceof Date) return v.getTime();
  if (v === '' || v === null || v === undefined) return 0;
  const ms = new Date(String(v)).getTime();
  return isNaN(ms) ? 0 : ms;
}
