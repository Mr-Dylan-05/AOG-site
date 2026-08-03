# Deploying the Ad On Group site

For whoever points hosting at this repo. **The short version:** this is a plain
static site — HTML, CSS and images, no PHP, no database, no WordPress. Almost any
host will serve it, and switching hosts later is cheap.

---

## The only three settings that matter

Whatever the platform, it needs to know these three things:

| Setting | Value | Why |
|---|---|---|
| **Root / base directory** | `aog-static` | The repo root is the *old WordPress install*, kept for reference. The real site is in this subfolder. Miss this and the build fails. |
| **Build command** | `npm run build` | Assembles the shared header/nav/footer into each page. |
| **Output / publish directory** | `_site` | The finished static site. |

Requires **Node 18+** (built and tested on Node 20).

If a host can't run a build step, run `npm run build` locally and upload the
contents of `_site/` — the output is just files and needs nothing at runtime.

---

## Does the platform choice matter?

Mostly no. **One thing** is genuinely host-specific: the format of the redirect
rules. Config for the common options is already committed, so this is covered
either way:

| Platform | Config file | Notes |
|---|---|---|
| **Vercel** | `vercel.json` | Set Root Directory to `aog-static` in project settings. |
| **Netlify** | `netlify.toml` | Set Base directory to `aog-static`; the file is read from there. |
| **Cloudflare Pages** | `public/_redirects` | Same format as Netlify. Set the build settings above in the dashboard. |
| **cPanel / Apache / nginx** | `public/.htaccess` | Apache reads it automatically. For nginx the rules need translating by hand. |

Files for platforms you don't use are simply ignored — they cost nothing.

### Why redirects matter here

They aren't decoration. Images moved out of the WordPress library
(`/wp-content/uploads/...`) into `/assets/media/...`. **Page URLs are unchanged**,
but years of inbound links, Google Image results and old social cards still point
at the old image paths. The rules keep those alive. Losing them means losing
image search traffic, not breaking the site.

---

## Before switching the domain over

1. **Deploy the branch first and check it on the preview URL.** Every host gives
   you one. Nothing about this needs to touch the live domain to be tested.
2. **Confirm the page count.** The site is **114 pages**, and `/sitemap.xml`
   should list all 114.
3. **Note that some images are placeholders.** 39 images no longer exist anywhere
   and currently show a labelled grey "PLACEHOLDER" box. That's known and
   deliberate, not a broken deploy.
4. **Forms, analytics and live chat are wired but switched off** — each is inert
   until its value is set in `src/_data/site.json` (GA4 ID, form endpoint,
   Tawk.to src). No code change needed, just those values and a rebuild. See
   "Still to do" in `README.md`.
5. **Eight pages are deliberately `noindex`** — they are empty shells carried
   over from WordPress and are excluded from `sitemap.xml` on purpose. That's
   why the sitemap lists 108 URLs for 116 pages.

## After switching over

- Submit `https://adongroup.com.au/sitemap.xml` in Google Search Console.
- **The old WordPress install should be taken offline, not left running.** As of
  August 2026 the live site was serving 150 injected spam product pages
  (`/products/4-inch-diameter-hose-clamp...`) in its sitemap — a compromise.
  Leaving it reachable leaves that exposure in place; this static site removes
  the attack surface entirely, but only once the old one is actually gone.

---

## What is NOT needed any more

No PHP. No MySQL. No `wp-admin`, `wp-login.php`, `xmlrpc.php`. No plugin
licences, no WordPress security tooling, no separate 2.2 GB media upload —
the images the site uses are in the repo.
