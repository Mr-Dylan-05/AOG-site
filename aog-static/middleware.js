// middleware.js — return HTTP 410 Gone for the legacy /products/* catalogue.
//
// Before this static site, adongroup.com.au served a large third-party product
// catalogue: ~137K URLs of the form /products/<slug>?srsltid=<id>. Those pages
// are gone, but Google still has them indexed. The static site already answers
// them with 404, which Google treats as "maybe temporary" and drops only
// slowly. A 410 (Gone) is the explicit "this is permanently gone" signal, so
// search engines de-index them faster.
//
// Scoped to the ROOT-level /products/ path only. The real page at
// /ad-on-hold-about/products/ does not match and is left untouched.
//
// vercel.json handles redirects and headers; those cannot emit a 410 (redirects
// are 3xx only), which is why this runs as Edge Middleware instead.

export const config = {
  matcher: ['/products', '/products/:path*'],
};

export default function middleware() {
  const body =
    '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="robots" content="noindex"><title>410 — Page gone</title></head>' +
    '<body style="font-family:system-ui,sans-serif;max-width:36rem;margin:6rem auto;padding:0 1rem;text-align:center">' +
    '<h1>410 — Gone</h1>' +
    '<p>This page no longer exists on adongroup.com.au.</p>' +
    '<p><a href="/">Go to the Ad On Group homepage</a></p>' +
    '</body></html>';

  return new Response(body, {
    status: 410,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'x-robots-tag': 'noindex',
    },
  });
}
