/**
 * gone.js — returns 410 Gone for the injected spam URLs.
 *
 * The compromised WordPress site served spam product pages on any unrecognised
 * /products/ path, and Google indexed them at scale: /products/<slug>?srsltid=...
 * WordPress is gone, so no new ones can be created — but roughly 106,000 were
 * already in the index and they clear on Google's schedule, not ours.
 *
 * Why this exists as a function rather than a redirect: vercel.json's `redirects`
 * can only emit 3xx, because a redirect needs a destination. The previous fix
 * wrote `/products/* /404.html 410` into public/_redirects, which is Netlify
 * format — Vercel never reads that file, so the rule was dead and the URLs have
 * been returning a plain 404 ever since. A 404 does eventually clear them, which
 * is why the numbers moved but only moderately.
 *
 * 410 states the resource is permanently gone. Google acts on it faster and more
 * decisively than a 404, and unlike a redirect to the homepage it does not
 * associate 106,000 spam product pages with the page we most want to rank.
 *
 * Two things NOT to do, both of which make this worse:
 *   - robots.txt Disallow. Blocking the crawl stops Google ever seeing the 410,
 *     so already-indexed URLs linger indefinitely.
 *   - 301 to /. Google reads a redirect to an irrelevant page as a soft 404, the
 *     URL stays known, and at this volume it looks like manipulation.
 */
module.exports = (req, res) => {
  res.statusCode = 410;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  // Belt and braces: a 410 body is not normally indexed, but this costs nothing
  // and covers the case where a crawler treats the response as a soft error.
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.end(
    `<!doctype html><html lang="en-AU"><head><meta charset="utf-8">` +
      `<meta name="robots" content="noindex, nofollow">` +
      `<meta name="viewport" content="width=device-width, initial-scale=1">` +
      `<title>Page gone | Ad On Group</title></head>` +
      `<body style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;` +
      `background:#FBF6F2;color:#0B1220;display:grid;place-items:center;min-height:100vh">` +
      `<main style="text-align:center;padding:40px 24px;max-width:34rem">` +
      `<p style="font-family:ui-monospace,monospace;font-size:13px;letter-spacing:.16em;` +
      `text-transform:uppercase;color:#1BABE5;margin:0 0 14px">410 &middot; Gone</p>` +
      `<h1 style="font-size:clamp(26px,4vw,38px);line-height:1.1;letter-spacing:-.03em;margin:0 0 14px">` +
      `This page no longer exists.</h1>` +
      `<p style="font-size:16.5px;line-height:1.6;color:#4A5462;margin:0 0 26px">` +
      `It was never part of Ad On Group&rsquo;s website. If you were looking for our ` +
      `AI training, offshore staffing, digital marketing or on-hold messaging, everything ` +
      `is on the main site.</p>` +
      `<a href="/" style="display:inline-block;background:#0B1220;color:#fff;text-decoration:none;` +
      `font-size:16px;font-weight:700;padding:14px 26px;border-radius:999px">Go to Ad On Group</a>` +
      `</main></body></html>`
  );
};
