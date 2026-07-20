# Ad On Group — static site

This is the new **WordPress-free** version of the Ad On Group website. It's a
folder of plain HTML/CSS that runs on any hosting platform — no PHP, no MySQL,
no WordPress. A tiny build step assembles the pages so the shared header, menu,
and footer live in **one place** instead of being copy-pasted into every page.

---

## The idea in one picture

```
Your colleague designs a page        The shared "shell"              Final page
(HTML, e.g. Claude Design)   ─┐       (header / nav / footer)   ─┐
                              ├──►  npm run intake  ──►  a page  ├──► npm run build ──► _site/
                              │       + wired forms/scripts       │       (plain static files
handled once, reused          ┘       (src/_includes, _data)      ┘        you upload to hosting)
everywhere
```

- **You edit content**, not plumbing. Each page holds only its own content.
- **The shell is shared.** Change the menu once in `src/_data/nav.json`; every
  page updates.
- **The output is just files.** `npm run build` produces `_site/` — that's what
  gets hosted. No build tools need to run on the server.

---

## Day-to-day: adding / updating a page

Your colleague sends you an HTML file (a full page or just the body). To "fuse"
it into the site:

```bash
# a full designed page that includes its own header/footer:
npm run intake -- incoming/about.html --slug=/about/ --strip-chrome

# just-the-body content:
npm run intake -- incoming/about.html --slug=/about/
```

That creates `src/pages/about/index.njk`, already wrapped in the shared shell.
Then preview and build:

```bash
npm run serve     # live preview at http://localhost:8080
npm run build     # writes the final static site to _site/
```

### intake options

| Option | What it does |
|---|---|
| `--slug=/path/` | The URL the page lives at (defaults to the filename) |
| `--strip-chrome` | Removes a header/footer/nav the design shipped with (avoids double menus) |
| `--title="..."` | Override the page title |
| `--select=.selector` | Keep only the inner HTML of one element as the content |
| `--no-styles` / `--no-scripts` | Drop the design's own `<style>` / `<script>` |

---

## Where things live

| Path | What it is |
|---|---|
| `src/pages/**` | One folder per page. **This is the content you edit.** |
| `src/_data/nav.json` | The menu (primary + footer). Edit links here, once. |
| `src/_data/site.json` | Site name, logo, domain, and 3rd-party toggles (analytics, chat, forms). |
| `src/_includes/layouts/base.njk` | The shell: `<head>`, header, footer, script slots. |
| `src/_includes/partials/` | `header.njk` and `footer.njk` markup. |
| `src/assets/css/site.css` | Shared shell styles (restyle freely). |
| `public/` | Root files copied as-is: `robots.txt`, `_redirects`. |
| `_site/` | **Build output — this is what you upload to hosting.** (git-ignored) |

### Images / media
The WordPress media library (`../wp-content/uploads`, ~2.2 GB) is **reused** —
the build symlinks it into `_site/wp-content/uploads` so existing image URLs keep
working with zero duplication. When you deploy, upload the `wp-content/uploads`
folder alongside the site (once), or point the host at it.

---

## First-time setup

```bash
npm install      # installs Eleventy + the HTML parser (one time)
npm run build
```

Requires Node.js (v18+). The current pages under `src/pages/` were
auto-generated from the old site as **reference content** — real text, images,
titles, and URLs — ready for your colleague's redesigns to replace them.

---

## Implementing a Claude Design page (`.dc.html`)

Your colleague's redesigns come from the **Claude Design** project (`ad on group`)
as `.dc.html` files. These aren't plain HTML — they wrap content in `<x-dc>` /
`<helmet>` and rely on a React runtime (`support.js`) that the design preview
injects. `scripts/flatten-dc.js` bakes them into clean, dependency-free static
pages (hoists `<helmet>`→`<head>`, converts `style-hover`/`style-after` to real
CSS, expands `<sc-for>` loops, drops the runtime):

```bash
# 1. save the .dc.html into incoming/design/  (from the Design MCP or an export)
# 2. flatten it — for pages with a reviews loop, pass the data file:
node scripts/flatten-dc.js "incoming/design/Ad On Group - Home.dc.html" \
     "public/index.html" --data=incoming/design/reviews.json
npm run build
```

**All 36 design pages are implemented** under `public/<slug>/`. To (re)generate
them all in one pass from the exported design folder:

```bash
# edit the EX path at the top of the script if the export moves
bash scripts/batch-flatten.sh   # flattens every .dc.html -> public/<slug>/, removes colliding reference pages
npm run build
```

The flattener auto-recovers each page's dynamic data (team lists, reviews, program
modules) by evaluating the page's component script in a sandbox — no manual data
files needed, except the reviews carousel which is fed `incoming/design/reviews.json`
so all 7 reviews show (the script itself only exposes the 3 visible at a time).

Each flattened design page **replaces** the matching auto-ported reference page.
Un-redesigned pages (older blog posts, package pages) keep their plain reference
version — the site is a mix during the transition, which is expected.

Two nav variants exist **by design**: the Ad On Group nav (cyan) and the Ad On AI
nav (blue). The export also contains some alternate page variants (e.g. `About.dc.html`
vs `About Us.dc.html` vs `Our Company.dc.html`) — all are flattened; consolidate as needed.

### Design assets (`public/assets/design/`)
All 79 image assets are the **exact** design crops, copied from the exported
Design project (`/Users/dylanbailey/Downloads/ad on group/assets/`). If the
designer updates assets, re-copy that folder's images into `public/assets/design/`
and `npm run build`. (Earlier stand-ins were only needed before the export existed —
the Design MCP download caps at 256 KB and truncated the large photos.)

## Deploying (when ready)

The `_site/` folder is a complete static site. Any of these work:

- **Cloudflare Pages / Netlify** — connect the repo, build command `npm run build`,
  output dir `_site`. Free, fast, handles `_redirects` automatically.
- **Plain hosting (cPanel / S3 / nginx)** — upload the contents of `_site/`.

Point the domain's DNS at the host, upload `wp-content/uploads` once, done. All
the WordPress files (`wp-admin`, `wp-login.php`, `xmlrpc.php`, the database) are
gone.

---

## Still to do (final step, on purpose)

**Forms and 3rd-party tools** are deliberately left until last (they need
accounts/keys you set up):

- **Forms** (contact / careers / lead) — WordPress handled these; static sites
  can't. Point each form at a form service (Formspree / Netlify Forms / Basin)
  and set `formEndpoint` in `src/_data/site.json`.
- **Live chat (Tawk.to)** — set `tawkChat: true` + `tawkSrc` in `site.json`.
- **Analytics** — set `googleAnalytics` (GA4 ID) in `site.json`.
- **adon-ai app** — already a static build; drop it in and link to it.
