# Lead capture

Every form on the site posts to **`/api/lead`**, a function in this repo
(`api/lead.js`) that appends the submission to a Google Sheet.

There is no Formspree, no monthly cap, no third-party branding, and no separate
endpoint to paste in when a new form is added.

## How it fits together

```
form (data-form="quiz")
  -> src/assets/js/contact-form.js   posts url-encoded, adds `form` and `page`
  -> /api/lead                       (same origin, so no CORS)
  -> Google Sheet, one tab per form  quiz | contact | ...
```

The tab is named after the form's `data-form` value and is **created on first
use**. The header row is written from the first submission, and if a form later
gains a field, that field becomes a new column on the end. Existing columns are
never reordered, so old rows stay aligned. Adding a quiz question needs no
change to `api/lead.js`.

## One-time setup (about five minutes)

**1. Make the sheet.** Create a Google Sheet. From its URL, copy the id:

```
https://docs.google.com/spreadsheets/d/THIS_LONG_ID_HERE/edit
```

**2. Make a service account.** This is the "robot user" that writes to the sheet.

- Go to <https://console.cloud.google.com/> and create a project (any name).
- **APIs & Services > Library**, search **Google Sheets API**, click **Enable**.
- **APIs & Services > Credentials > Create credentials > Service account**.
  Name it something like `leads-writer`, then **Done**.
- Click the new service account, open the **Keys** tab, then
  **Add key > Create new key > JSON**. A `.json` file downloads. Keep it safe;
  it is a password.

**3. Share the sheet with it.** Open the JSON file and find `client_email`
(it looks like `leads-writer@your-project.iam.gserviceaccount.com`). In the
Google Sheet, press **Share**, paste that address, give it **Editor**, and
untick "Notify people".

> This step is the one people miss. Without it every write fails with a
> permission error, because the robot has no access to your sheet.

**4. Add two environment variables in Vercel.** Project > **Settings** >
**Environment Variables**. Add both to *Production*, *Preview* and *Development*:

| Name | Value |
| --- | --- |
| `LEADS_SHEET_ID` | the id from step 1 |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | the **entire contents** of the JSON file from step 2, pasted in as-is |

**5. Redeploy.** Environment variables are only picked up by a new deployment.

## Checking it works

Submit the quiz on the live site. A `quiz` tab should appear in the sheet with a
header row and your submission beneath it.

If nothing appears, open **Vercel > your project > Logs** and look for a line
starting `[lead]`. It says what went wrong, and it prints the full submission,
so a lead is recoverable even when the write failed:

- `not configured` - one of the two environment variables is missing, or the
  deployment predates them.
- `sheets 403` - step 3 was missed, or the wrong `client_email` was shared.
- `sheets 404` - `LEADS_SHEET_ID` is wrong.
- `google auth` - the JSON was pasted incompletely. It must include the whole
  `private_key`, `-----BEGIN PRIVATE KEY-----` and all.

A failed write returns an error to the visitor on purpose, so they can retry or
call, rather than showing a thank-you for a lead that was never saved.

## Getting told about new leads

Deliberately not built in, because Sheets already does it: in the sheet,
**Tools > Notification settings > Notify me at ...**, and choose *Any changes* /
*Right away*.

## Adding another form

1. Give the form `data-form="something"` and the fields `name` attributes.
2. Add `"something": "/api/lead"` under `thirdParty.forms` in
   `src/_data/site.json`.

A form whose key is missing or empty is deliberately left inert, so a half-built
form cannot silently post nowhere and look like it worked.
