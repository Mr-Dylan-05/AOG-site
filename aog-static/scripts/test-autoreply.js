#!/usr/bin/env node
/**
 * test-autoreply.js — exercises the enquiry confirmation without sending mail.
 *
 * The four paths the brief asks for are all driven through a real local HTTP
 * server standing in for Calendly, rather than a stubbed fetch, so the timeout,
 * the status handling and the JSON parsing are genuinely executed.
 *
 *   node scripts/test-autoreply.js
 *
 * To send a real message instead, deploy and use the endpoint hook:
 *   /api/lead?selftest=<AUTOREPLY_TEST_KEY>&to=you@example.com&dry=1
 */
const http = require("http");
const assert = require("assert");

const BOOK = "https://calendly.com/adongroup-info/30min";
process.env.CALENDLY_BOOKING_URL = BOOK;
process.env.CALENDLY_EVENT_TYPE_URI = "https://api.calendly.com/event_types/TEST";
process.env.SENDER_NAME = "Paul Harding";
process.env.SENDER_PHONE = "(07) 5586 1400";
process.env.AUTOREPLY_REPLY_TO = "paul.harding@adongroup.com.au";

let pass = 0, fail = 0;
const ok = (name, fn) => {
  try { fn(); console.log(`  ✓ ${name}`); pass++; }
  catch (e) { console.log(`  ✗ ${name}\n      ${e.message}`); fail++; }
};

/** A Calendly stand-in. `mode` picks which failure to reproduce. */
function server(mode, times) {
  return new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      if (mode === "hang") return;                       // never answers -> timeout
      if (mode === "401") { res.writeHead(401, {"Content-Type":"application/json"});
        return res.end('{"title":"Unauthenticated"}'); }
      if (mode === "500") { res.writeHead(500); return res.end("upstream boom"); }
      if (mode === "garbage") { res.writeHead(200, {"Content-Type":"application/json"});
        return res.end("not json at all"); }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ collection: times || [] }));
    });
    s.listen(0, "127.0.0.1", () => resolve(s));
  });
}

/** Times relative to a base, as Calendly returns them. */
const at = (base, ms) => ({ status: "available", start_time: new Date(base + ms).toISOString() });
const HOUR = 3600e3, DAY = 24 * HOUR;

(async () => {
  console.log("\nBrisbane formatting (server clock is UTC)");
  // Reload the module fresh so CALENDLY_API_BASE is read per-case.
  const load = () => { delete require.cache[require.resolve("../api/lead.js")];
                       return require("../api/lead.js")._internals; };
  let I = load();

  ok("2:00pm Brisbane formats as the target string", () => {
    // 04:00Z on 15 Sep 2026 is 14:00 Brisbane the same day.
    const f = I.formatSlot(new Date("2026-09-15T04:00:00Z"));
    assert.strictEqual(f.long, "Tuesday 15 September, 2:00pm");
    assert.strictEqual(f.short, "2pm");
    assert.strictEqual(f.weekday, "Tuesday");
  });

  ok("a half-hour slot keeps its minutes in the subject", () => {
    const f = I.formatSlot(new Date("2026-09-15T04:30:00Z"));
    assert.strictEqual(f.short, "2:30pm");
  });

  ok("crossing midnight UTC still reads as the Brisbane day", () => {
    // 23:00Z on the 15th is 09:00 on the 16th in Brisbane.
    const f = I.formatSlot(new Date("2026-09-15T23:00:00Z"));
    assert.strictEqual(f.long, "Wednesday 16 September, 9:00am");
    // And the booking link must carry the 16th, not the 15th.
    const u = new URL(I.bookingUrl({ email: "a@b.com" }, new Date("2026-09-15T23:00:00Z")));
    assert.strictEqual(u.searchParams.get("date"), "2026-09-16");
    assert.strictEqual(u.searchParams.get("month"), "2026-09");
  });

  ok("a UTC instant late in the Brisbane day picks the right weekday", () => {
    // 14:00Z Friday is midnight Saturday in Brisbane.
    assert.strictEqual(I.bneParts(new Date("2026-09-18T14:00:00Z")).dow, 6);
  });

  console.log("\nSlot selection");
  const mon = Date.parse("2026-09-14T00:00:00Z");          // Mon 10:00 Brisbane

  ok("rejects anything under two hours away", () => {
    assert.strictEqual(I.pickSlot([at(mon, HOUR)], new Date(mon)), null);
  });
  ok("takes the first slot past the two-hour mark", () => {
    const got = I.pickSlot([at(mon, HOUR), at(mon, 3 * HOUR)], new Date(mon));
    assert.strictEqual(got.toISOString(), new Date(mon + 3 * HOUR).toISOString());
  });
  ok("rejects a weekend slot and takes the weekday after it", () => {
    const sat = at(mon, 5 * DAY), tue = at(mon, 1 * DAY + 3 * HOUR);
    const got = I.pickSlot([sat, tue], new Date(mon));
    assert.strictEqual(got.toISOString(), new Date(mon + DAY + 3 * HOUR).toISOString());
  });
  ok("rejects anything past three business days", () => {
    assert.strictEqual(I.pickSlot([at(mon, 5 * DAY)], new Date(mon)), null);
  });
  ok("Friday enquiry still reaches into the next week", () => {
    const fri = Date.parse("2026-09-18T00:00:00Z");        // Fri 10:00 Brisbane
    const wed = at(fri, 5 * DAY);                          // the following Wednesday
    assert.ok(I.pickSlot([wed], new Date(fri)), "Wednesday should be inside three business days");
  });

  console.log("\nSpreading, so offers do not stack");
  const HALF = 30 * 60e3;
  const fri = new Date("2026-09-11T00:59:00Z");            // Fri 10:59am Brisbane
  const realDay = ["09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30"];
  const realTimes = [];
  for (const d of ["15","16","17"])
    for (const t of realDay)
      realTimes.push({ status: "available", start_time: `2026-09-${d}T${t}:00+10:00` });

  ok("the same person always gets the same time", () => {
    const a = I.pickSlot(realTimes, fri, "dylan@adongroup.com.au");
    const b = I.pickSlot(realTimes, fri, "dylan@adongroup.com.au");
    assert.strictEqual(a.getTime(), b.getTime());
  });

  ok("case and stray whitespace do not change the answer", () => {
    const a = I.pickSlot(realTimes, fri, "dylan@adongroup.com.au");
    const b = I.pickSlot(realTimes, fri, "  DYLAN@AdOnGroup.com.au  ");
    assert.strictEqual(a.getTime(), b.getTime());
  });

  ok("consecutive enquirers do not stack into one block", () => {
    // The failure this exists to prevent: everyone offered 9:30, then 10:00,
    // then 10:30 as each is taken, filling one day as a solid run.
    const people = ["a@x.com","b@x.com","c@x.com","d@x.com","e@x.com","f@x.com",
                    "g@x.com","h@x.com","i@x.com","j@x.com","k@x.com","l@x.com"];
    const picked = people.map((p) => I.pickSlot(realTimes, fri, p));
    assert.ok(picked.every(Boolean), "everyone should get a slot");
    const distinctDays = new Set(picked.map((d) => I.bneParts(d).d));
    const distinctTimes = new Set(picked.map((d) => d.getTime()));
    assert.ok(distinctDays.size >= 2, `all on one day: ${[...distinctDays]}`);
    assert.ok(distinctTimes.size >= 6, `only ${distinctTimes.size} distinct times of 12`);
    // and nobody is pushed outside the promised window
    const cutoff = I.businessDayCutoff(fri).getTime();
    picked.forEach((d) => assert.ok(d.getTime() <= cutoff, `${d.toISOString()} is past the cutoff`));
  });

  ok("spread still respects every window rule", () => {
    const earliest = fri.getTime() + 2 * 3600e3;
    for (const p of ["a@x.com","b@x.com","c@x.com","d@x.com","e@x.com","f@x.com"]) {
      const d = I.pickSlot(realTimes, fri, p);
      assert.ok(d.getTime() >= earliest, "inside the two-hour guard");
      const dow = I.bneParts(d).dow;
      assert.ok(dow !== 0 && dow !== 6, "landed on a weekend");
    }
  });

  ok("with no key it is still the soonest", () =>
    assert.strictEqual(
      I.pickSlot(realTimes, fri).toISOString(),
      new Date("2026-09-15T09:30:00+10:00").toISOString()));

  ok("qualifying list is sorted even if the API returns it shuffled", () => {
    const shuffled = realTimes.slice().reverse();
    const got = I.qualifyingSlots(shuffled, fri);
    for (let i = 1; i < got.length; i++)
      assert.ok(got[i] >= got[i - 1], "not ascending");
  });

  ok("one open slot is still offered, not spread away", () => {
    const one = [{ status: "available", start_time: "2026-09-15T09:30:00+10:00" }];
    const d = I.pickSlot(one, fri, "anyone@x.com");
    assert.ok(d && d.toISOString() === new Date("2026-09-15T09:30:00+10:00").toISOString());
  });


  console.log("\nThe four paths");
  async function copyVia(mode, times) {
    const s = await server(mode, times);
    process.env.CALENDLY_API_BASE = `http://127.0.0.1:${s.address().port}`;
    process.env.CALENDLY_TOKEN = "tok";
    const J = load();
    const now = new Date(Date.now());
    const slot = await J.calendlySlot(now);
    const copy = J.autoReplyCopy({ name: "jane smith", email: "jane@example.com" }, slot);
    s.close();
    return { slot, copy, J };
  }
  const soon = () => {
    const base = Date.now();
    // next weekday, 3 hours out, nudged off a weekend
    let d = new Date(base + 3 * HOUR);
    while ([0, 6].includes(d.getUTCDay())) d = new Date(d.getTime() + DAY);
    return [{ status: "available", start_time: d.toISOString() }];
  };

  // The copy no longer branches on the slot, so all four paths must produce
  // the same message. That is the point of these four: not that each renders,
  // but that a slot cannot leak back into the wording.
  const SUBJECT = "Thinking about AI Training, Jane?";

  const A = await copyVia("ok", soon());
  ok("1. slot found  -> the slot is looked up and ignored", () => {
    assert.ok(A.slot, "expected a slot");
    assert.strictEqual(A.copy.subject, SUBJECT);
    assert.ok(A.copy.text.includes("Sometimes the Calendly link gets missed"), "missing the link line");
    assert.ok(A.copy.text.includes(BOOK), "missing the booking URL");
    assert.ok(!/I've got|Book that time:|here are the rest:/.test(A.copy.text),
      "the old slot offer is still being written");
  });

  const B = await copyVia("ok", []);
  ok("2. no slot     -> byte-identical copy", () => {
    assert.strictEqual(B.slot, null);
    assert.strictEqual(B.copy.subject, SUBJECT);
    assert.strictEqual(B.copy.text, A.copy.text, "a slot changed the wording");
  });

  const C = await copyVia("hang");
  ok("3. unreachable -> timeout changes nothing", () => {
    assert.strictEqual(C.slot, null);
    assert.strictEqual(C.copy.text, A.copy.text);
  });

  const D = await copyVia("401");
  ok("4. bad token   -> 401 changes nothing", () => {
    assert.strictEqual(D.slot, null);
    assert.strictEqual(D.copy.text, A.copy.text);
  });

  console.log("\nHeaders, on both paths");
  for (const [label, c] of [["slot", A], ["fallback", B]]) {
    ok(`${label}: Bcc to adonai@ and paul.harding@, Reply-To to Paul`, () => {
      const raw = c.J.buildMessage("info@adongroup.com.au", "Ad On Group", "jane@example.com", c.copy);
      // One header, two addresses, each in its own brackets. `Bcc: <a, b>` is
      // a single malformed address, not a list, and Gmail rejects it.
      assert.ok(
        raw.includes("Bcc: <adonai@adongroup.com.au>, <paul.harding@adongroup.com.au>"),
        "Bcc is not a well-formed two-address list"
      );
      assert.ok(raw.includes("Reply-To: <paul.harding@adongroup.com.au>"), "Reply-To missing");
      assert.ok(raw.includes("multipart/alternative"), "not multipart");
      assert.ok(raw.includes("text/plain"), "no plain-text part");
    });
  }

  console.log("\nNext intake date");
  // Brisbane is UTC+10, so an instant at 02:00Z is midday the same day there,
  // and one at 23:00Z has already rolled over to the next Brisbane day.
  const intake = (iso) => I.nextIntake(new Date(iso));

  ok("13 September -> 1 October", () =>
    assert.strictEqual(intake("2026-09-13T02:00:00Z"), "1 October"));
  ok("the 1st rolls to the month after, never today", () =>
    assert.strictEqual(intake("2026-10-01T02:00:00Z"), "1 November"));
  ok("3 October -> 1 November", () =>
    assert.strictEqual(intake("2026-10-03T02:00:00Z"), "1 November"));
  ok("18 November -> 1 December", () =>
    assert.strictEqual(intake("2026-11-18T02:00:00Z"), "1 December"));
  ok("31 December -> 1 January 2027, with the year", () =>
    assert.strictEqual(intake("2026-12-31T02:00:00Z"), "1 January 2027"));
  ok("no year on a same-year intake", () =>
    assert.ok(!/\d{4}/.test(intake("2026-09-13T02:00:00Z")), "year should be absent"));

  ok("last day of the month: UTC is a month behind Brisbane", () => {
    // 23:00Z on 30 Sep is already 1 Oct in Brisbane. Reading the server clock
    // would answer "1 October"; the correct answer is a month further on.
    assert.strictEqual(new Date("2026-09-30T23:00:00Z").getUTCMonth(), 8, "UTC is still September");
    assert.strictEqual(intake("2026-09-30T23:00:00Z"), "1 November");
  });

  ok("new year's eve in UTC is already next year in Brisbane", () => {
    // 14:00Z on 31 Dec 2026 is 00:00 on 1 Jan 2027 in Brisbane. Reading the
    // server clock would give December and answer "1 January 2027"; the reader
    // is already in January, so the right answer is a month further on. It
    // carries no year precisely because 2027 is now the current year.
    assert.strictEqual(new Date("2026-12-31T14:00:00Z").getUTCFullYear(), 2026, "UTC is still 2026");
    assert.strictEqual(intake("2026-12-31T14:00:00Z"), "1 February");
  });

  ok("every month of a year resolves to the next one", () => {
    const want = ["February","March","April","May","June","July",
                  "August","September","October","November","December","January"];
    for (let m = 0; m < 12; m++) {
      const d = new Date(Date.UTC(2026, m, 15, 2, 0, 0));
      const got = intake(d.toISOString());
      assert.ok(got.startsWith("1 " + want[m]), `month ${m + 1} gave ${got}`);
      if (m === 11) assert.ok(got.endsWith("2027"), `December should carry the year, got ${got}`);
    }
  });

  console.log("\nParagraphs the new copy dropped");
  // nextIntake() and formatSlot() are still exported and still unit-tested
  // above, but nothing in the mail calls them now. If either sentence comes
  // back into the copy it should be a decision, not a merge artefact.
  ok("no intake date, no phone number, no 'I'll run you through'", () => {
    for (const [label, c] of [["slot", A.copy], ["fallback", B.copy]]) {
      assert.ok(!/The next intake starts /.test(c.text), `${label}: intake line is back`);
      assert.ok(!/I'll run you through/.test(c.text), `${label}: run-through line is back`);
      assert.ok(!/5586 1400/.test(c.text), `${label}: phone number is back`);
    }
  });

  ok("the replaced paragraph is gone", () => {
    for (const c of [A.copy, B.copy]) {
      assert.ok(!/fifteen minutes|Nothing gets sold/.test(c.text), "old wording still present");
    }
  });

  ok("the subject is the same question on every path, and names them", () => {
    for (const [label, c] of [["slot", A.copy], ["fallback", B.copy]]) {
      assert.strictEqual(c.subject, SUBJECT, `${label}: ${c.subject}`);
      assert.ok(c.subject.includes("Jane"), `${label}: first name missing`);
    }
  });

  ok("no first name leaves no dangling comma in the subject", () => {
    const c = A.J.autoReplyCopy({ email: "x@y.com" }, null);
    assert.strictEqual(c.subject, "Thinking about AI Training?");
  });

  ok("never says Brisbane", () => {
    // The copy no longer names a timezone at all, because it no longer names a
    // time. The rule is kept because Calendly renders the zone itself.
    for (const c of [A.copy, B.copy])
      assert.ok(!/Brisbane/.test(c.text), "Brisbane leaked into the copy");
  });

  ok("but the times are still computed in Australia/Brisbane", () => {
    // Same zone, different name: 23:00Z is already the next day on the coast.
    assert.strictEqual(I.formatSlot(new Date("2026-09-15T23:00:00Z")).long,
      "Wednesday 16 September, 9:00am");
  });

  console.log("\nCopy rules");
  const both = [A.copy, B.copy];
  ok("no em-dashes", () => both.forEach((c) => {
    assert.ok(!c.text.includes("—") && !c.subject.includes("—"), `em-dash in: ${c.subject}`);
  }));
  // "course" was on this list until 23 Sep 2026. The supplied copy calls the
  // people on the call "course coordinators", so the word is now deliberate
  // and the rule covers only the other two.
  ok('never says "modules" or "community"', () => both.forEach((c) => {
    const m = c.text.match(/\b(modules?|community)\b/i);
    assert.ok(!m, `found "${m && m[0]}"`);
  }));
  ok("no price, no attachment, no postscript", () => both.forEach((c) => {
    assert.ok(!/\$|\bP\.?S\.?\b|attach/i.test(c.text), "found price, PS or attachment");
  }));
  ok("html carries no images, buttons or tracking pixels", () => both.forEach((c) => {
    assert.ok(!/<img|background-color|<table|<button/i.test(c.html), "html is not plain");
  }));
  ok("greeting uses the first name, tidied", () => {
    assert.ok(A.copy.text.startsWith("Hi Jane,"), A.copy.text.slice(0, 20));
  });
  ok("no name falls back to 'Hi there,'", () => {
    const c = A.J.autoReplyCopy({ email: "x@y.com" }, null);
    assert.ok(c.text.startsWith("Hi there,"), c.text.slice(0, 20));
  });
  ok("signature is the coordinator and the division, on two lines", () => {
    const lines = A.copy.text.trimEnd().split("\n");
    assert.strictEqual(lines[lines.length - 2], "Course Coordinator", "no coordinator line");
    assert.strictEqual(lines[lines.length - 1], "Ad On AI | Ad On Group", "no division line");
    assert.ok(!/Operating since 2008|Ad On AI, Ad On Group/.test(A.copy.text), "old signature survives");
    // the signature block keeps its line break in the HTML part
    assert.ok(A.copy.html.includes("Course Coordinator<br>Ad On AI | Ad On Group"), "signature reflowed");
  });

  console.log("\nPrefill");
  const linkFrom = (c) => new URL(c.text.match(/(https:\/\/\S+)/)[1]);

  ok("the booking link carries name and email, and no slot date", () => {
    for (const [label, c] of [["slot", A.copy], ["fallback", B.copy]]) {
      const u = linkFrom(c);
      assert.strictEqual(u.searchParams.get("email"), "jane@example.com", label);
      assert.strictEqual(u.searchParams.get("name"), "jane smith", label);
      assert.strictEqual(u.searchParams.get("date"), null, `${label}: a slot date leaked in`);
    }
  });

  ok("the link sits on its own line, under the sentence", () => {
    const lines = A.copy.text.split("\n");
    const at = lines.findIndex((l) => l.startsWith("https://"));
    assert.ok(at > 0, "link is not on its own line");
    assert.strictEqual(lines[at - 1], "Sometimes the Calendly link gets missed, so here it is again:");
  });

  ok("no booking url configured drops the paragraph rather than dangling it", () => {
    const saved = process.env.CALENDLY_BOOKING_URL;
    delete process.env.CALENDLY_BOOKING_URL;
    const c = A.J.autoReplyCopy({ name: "Jane", email: "j@e.com" }, null);
    process.env.CALENDLY_BOOKING_URL = saved;
    assert.ok(!c.text.includes("here it is again:"), "left a dangling link sentence");
    assert.ok(!/https?:\/\//.test(c.text), "a URL survived with no base configured");
    assert.ok(c.text.includes("Hope to speak soon."), "dropped more than the link paragraph");
  });

  console.log("\nBcc list");
  ok("AUTOREPLY_BCC overrides the default outright, and splits on commas", () => {
    const saved = process.env.AUTOREPLY_BCC;
    process.env.AUTOREPLY_BCC = " one@x.com ,two@y.com,  ";
    const raw = A.J.buildMessage("info@adongroup.com.au", "Ad On Group", "j@e.com", A.copy);
    if (saved === undefined) delete process.env.AUTOREPLY_BCC;
    else process.env.AUTOREPLY_BCC = saved;
    assert.ok(raw.includes("Bcc: <one@x.com>, <two@y.com>"), "did not trim, split or drop the empty");
    assert.ok(!raw.includes("adonai@"), "the default leaked in alongside the override");
  });

  ok("AUTOREPLY_BCC set empty sends no copy at all", () => {
    const saved = process.env.AUTOREPLY_BCC;
    process.env.AUTOREPLY_BCC = "";
    const raw = A.J.buildMessage("info@adongroup.com.au", "Ad On Group", "j@e.com", A.copy);
    if (saved === undefined) delete process.env.AUTOREPLY_BCC;
    else process.env.AUTOREPLY_BCC = saved;
    assert.ok(!/^Bcc:/m.test(raw), "a Bcc header survived an empty setting");
  });

  console.log(`\n${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})();
