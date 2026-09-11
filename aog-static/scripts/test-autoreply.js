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
process.env.AUTOREPLY_REPLY_TO = "paul@adongroup.com.au";

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

  const A = await copyVia("ok", soon());
  ok("1. slot found  -> subject proposes a day and time", () => {
    assert.ok(A.slot, "expected a slot");
    assert.match(A.copy.subject, /^AI training: would \w+ at \d/);
    assert.ok(A.copy.text.includes("I've got"), "missing the offer line");
    assert.ok(A.copy.text.includes("Book that time:"), "missing the deep link");
    assert.ok(A.copy.text.includes("here are the rest:"), "missing the all-times link");
  });

  const B = await copyVia("ok", []);
  ok("2. no slot     -> fallback subject and wording", () => {
    assert.strictEqual(B.slot, null);
    assert.strictEqual(B.copy.subject, "AI training: a time that suits you");
    assert.ok(B.copy.text.includes("Grab whichever time suits you here:"), "missing fallback line");
    assert.ok(!B.copy.text.includes("I've got"), "slot copy leaked into the fallback");
  });

  const C = await copyVia("hang");
  ok("3. unreachable -> timeout falls through to fallback", () => {
    assert.strictEqual(C.slot, null);
    assert.strictEqual(C.copy.subject, "AI training: a time that suits you");
  });

  const D = await copyVia("401");
  ok("4. bad token   -> 401 falls through to fallback", () => {
    assert.strictEqual(D.slot, null);
    assert.strictEqual(D.copy.subject, "AI training: a time that suits you");
  });

  const E = await copyVia("garbage");
  ok("   malformed body also falls through", () => assert.strictEqual(E.slot, null));
  const F = await copyVia("500");
  ok("   500 also falls through", () => assert.strictEqual(F.slot, null));

  console.log("\nHeaders, on both paths");
  for (const [label, c] of [["slot", A], ["fallback", B]]) {
    ok(`${label}: Bcc to adonai@ and Reply-To to Paul`, () => {
      const raw = c.J.buildMessage("info@adongroup.com.au", "Ad On Group", "jane@example.com", c.copy);
      assert.ok(raw.includes("Bcc: <adonai@adongroup.com.au>"), "Bcc missing");
      assert.ok(raw.includes("Reply-To: <paul@adongroup.com.au>"), "Reply-To missing");
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

  console.log("\nThe intake paragraph");
  ok("stands alone on its own line in both versions", () => {
    for (const [label, c] of [["slot", A.copy], ["fallback", B.copy]]) {
      const lines = c.text.split("\n");
      const at = lines.findIndex((l) => /^The next intake starts /.test(l));
      assert.ok(at > -1, `${label}: paragraph missing`);
      assert.match(lines[at], /^The next intake starts \d+ [A-Z][a-z]+( \d{4})?\.$/, `${label}: ${lines[at]}`);
      assert.strictEqual(lines[at - 1], "", `${label}: not preceded by a blank line`);
      // and it follows the paragraph it is meant to follow
      const runThrough = lines.findIndex((l) => l.startsWith("I'll run you through"));
      assert.ok(runThrough > -1 && runThrough < at, `${label}: not after the "I'll run you through" paragraph`);
      assert.strictEqual(lines[at - 2], "private one-on-one support works, and what it costs.",
        `${label}: something sits between them`);
    }
  });

  ok("the replaced paragraph is gone", () => {
    for (const c of [A.copy, B.copy]) {
      assert.ok(!/fifteen minutes|Nothing gets sold/.test(c.text), "old wording still present");
    }
  });

  ok("both subjects lead with AI training, for a cold inbox", () => {
    for (const [label, c] of [["slot", A.copy], ["fallback", B.copy]]) {
      assert.ok(c.subject.startsWith("AI training"), `${label}: ${c.subject}`);
      // it has to survive a truncated inbox list, so it goes first, not last
      assert.ok(c.subject.indexOf("AI training") === 0, `${label}: not leading`);
    }
  });

  ok("says Gold Coast time, never Brisbane", () => {
    assert.ok(A.copy.text.includes("Gold Coast time free."), "label missing");
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
  ok('never says "course", "modules" or "community"', () => both.forEach((c) => {
    const m = c.text.match(/\b(course|modules?|community)\b/i);
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
  ok("signature carries the sender, division and 2008", () => {
    assert.ok(A.copy.text.includes("Paul Harding"), "no sender name");
    assert.ok(A.copy.text.includes("Ad On AI, Ad On Group"), "no division line");
    assert.ok(A.copy.text.includes("Operating since 2008"), "no since line");
  });

  console.log("\nPrefill");
  ok("deep link carries name, email and the slot date", () => {
    const u = new URL(A.copy.text.match(/Book that time: (\S+)/)[1]);
    assert.strictEqual(u.searchParams.get("email"), "jane@example.com");
    assert.strictEqual(u.searchParams.get("name"), "jane smith");
    assert.ok(u.searchParams.get("date"), "no date parameter");
  });
  ok("fallback link still carries name and email", () => {
    const u = new URL(B.copy.text.match(/suits you here: (\S+)/)[1]);
    assert.strictEqual(u.searchParams.get("email"), "jane@example.com");
    assert.strictEqual(u.searchParams.get("name"), "jane smith");
    assert.strictEqual(u.searchParams.get("date"), null);
  });
  ok("no booking url configured still sends a coherent email", () => {
    const saved = process.env.CALENDLY_BOOKING_URL;
    delete process.env.CALENDLY_BOOKING_URL;
    const c = A.J.autoReplyCopy({ name: "Jane", email: "j@e.com" }, null);
    process.env.CALENDLY_BOOKING_URL = saved;
    assert.ok(!c.text.includes("here:"), "left a dangling link sentence");
    assert.ok(c.text.includes("(07) 5586 1400"), "lost the phone fallback");
  });

  console.log(`\n${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})();
