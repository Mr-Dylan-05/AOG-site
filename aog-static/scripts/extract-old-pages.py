#!/usr/bin/env python3
"""extract-old-pages.py — pull the old WordPress product pages out of the dump.

Run once, by hand, on a machine that has adminer.sql. It writes
src/_data/oldPages.json, which is committed; the page build reads that. The
dump is 382MB and git-ignored, so nothing in the normal build may depend on it.

WHY A REAL PARSER
The dump is a single INSERT per table with every row inside it, and post_content
is Beaver Builder markup full of parentheses, quotes and backslash escapes.
Splitting on "),(" cuts rows in half. Adminer also breaks a large table across
several INSERT statements, so stopping at the first ";" silently drops most of
the table — that failure looked exactly like a site whose content ended in
early 2022, which is what sent the first version of the pricing page to the
wrong numbers.

WHICH ROWS
Only post_status='publish' and post_type='page'. Revisions are deliberately
excluded: the dump holds 976 of them, several carry prices that were never
live, and mixing them with published rows is what produced two conflicting
figures for the same package.

Usage:  python3 scripts/extract-old-pages.py [path/to/adminer.sql]
"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DEFAULT_SQL = os.path.join(os.path.dirname(ROOT), "adminer.sql")
OUT = os.path.join(ROOT, "src", "_data", "oldPages.json")

TABLE = "wp_p14adr9vea_posts"

COLS = ["ID", "post_author", "post_date", "post_date_gmt", "post_content", "post_title",
        "post_excerpt", "post_status", "comment_status", "ping_status", "post_password",
        "post_name", "to_ping", "pinged", "post_modified", "post_modified_gmt",
        "post_content_filtered", "post_parent", "guid", "menu_order", "post_type",
        "post_mime_type", "comment_count"]

UNESC = {"n": "\n", "r": "\r", "t": "\t", "0": "\0", "\\": "\\", "'": "'", '"': '"', "Z": "\x1a"}

# The product pages, in the order they should appear.
WANT = [
    "products",
    "online-accelerator",
    "websites",
    "finder-seo-package",
    "google-ads-management",
    "facebook-packages",
    "blogs",
    "brochure-campaign",
    "video-flexi",
    "review-me",
    "easy-rate-app",
]

CHUNK = 1 << 22


def rows(path, table=TABLE):
    marker = "INSERT INTO `%s` " % table
    f = io.open(path, "r", encoding="utf8", errors="replace", newline="")
    buf = ""
    seeking = True
    vals, cur = [], []
    in_str = esc = started = False

    while True:
        if not buf:
            buf = f.read(CHUNK)
            if not buf:
                break

        if seeking:
            i = buf.find(marker)
            if i < 0:
                buf = buf[-(len(marker) + 8):]
                more = f.read(CHUNK)
                if not more:
                    break
                buf += more
                continue
            j = buf.find(" VALUES", i)
            if j < 0:
                buf += f.read(CHUNK)
                continue
            buf = buf[j + 7:]
            seeking = False
            vals, cur = [], []
            in_str = esc = started = False

        for k, ch in enumerate(buf):
            if esc:
                cur.append(UNESC.get(ch, ch))
                esc = False
            elif in_str:
                if ch == "\\":
                    esc = True
                elif ch == "'":
                    in_str = False
                else:
                    cur.append(ch)
            elif ch == "'":
                in_str = True
                started = True
            elif ch == "(":
                vals, cur, started = [], [], False
            elif ch == ",":
                vals.append("".join(cur) if started or cur else None)
                cur, started = [], False
            elif ch == ")":
                vals.append("".join(cur) if started or cur else None)
                if len(vals) >= len(COLS):
                    yield dict(zip(COLS, vals))
                vals, cur, started = [], [], False
            elif ch == ";":
                seeking = True
                buf = buf[k + 1:]
                break
            elif ch.strip():
                cur.append(ch)
                started = True
        else:
            buf = ""
    f.close()


# Editor furniture that was never visible to a visitor. The Modal Popup line
# uses &quot; rather than a literal quote, which is why matching on " missed it.
Q = r"(?:&quot;|\"|&#8220;|&#8221;)"
CRUFT = [
    re.compile(r"<!--\s*/?wp:[^>]*-->"),
    re.compile(r"\[[a-z_]+[^\]]*\]", re.I),                       # shortcodes
    re.compile(r"<h[1-6][^>]*>\s*Modal Popup[^<]*</h[1-6]>", re.I),
    re.compile(r"Modal Popup - ID", re.I),
    re.compile(r"Click here to edit the\s*%s\s*Modal Popup\s*%s\s*settings\.\s*"
               r"This text will not be visible on frontend\.?" % (Q, Q), re.I),
    re.compile(r"<h[1-6][^>]*>\s*(?:&nbsp;|\s)*</h[1-6]>", re.I),  # spacer headings
]


def clean(html_str):
    """Keep the page as it was; drop only what the editor added."""
    s = html_str or ""
    for pat in CRUFT:
        s = pat.sub("", s)
    # point images at the assets the static site already carries
    s = re.sub(r'(https?:)?//[^"\']*?/wp-content/uploads/', "/assets/media/", s)
    s = re.sub(r'\sonerror="[^"]*"', "", s)
    s = re.sub(r"\s*\n\s*\n\s*", "\n", s)
    return s.strip()


def main():
    sql = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SQL
    if not os.path.exists(sql):
        sys.exit("cannot find the dump at %s — pass its path as an argument" % sql)

    found = {}
    for r in rows(sql):
        if r["post_status"] == "publish" and r["post_type"] == "page":
            slug = r["post_name"] or ""
            if slug in WANT:
                # keep the most recently modified if a slug appears twice
                prev = found.get(slug)
                if not prev or (r["post_modified"] or "") > (prev["post_modified"] or ""):
                    found[slug] = r

    out = []
    for slug in WANT:
        r = found.get(slug)
        if not r:
            print("  MISSING  %s" % slug)
            continue
        body = clean(r["post_content"])
        prices = sorted(set(re.findall(r"\$[0-9][0-9,]*", body)),
                        key=lambda x: int(x[1:].replace(",", "")))
        out.append({
            "slug": slug,
            "id": r["ID"],
            "title": (r["post_title"] or "").strip(),
            "modified": (r["post_modified"] or "")[:10],
            "html": body,
        })
        print("  %-22s id %-5s mod %s  %6d chars  %s"
              % (slug, r["ID"], (r["post_modified"] or "")[:10], len(body), " ".join(prices[:8])))

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with io.open(OUT, "w", encoding="utf8") as f:
        json.dump(out, f, indent=1, ensure_ascii=False)
    print("\n  wrote %s — %d pages" % (os.path.relpath(OUT, ROOT), len(out)))


if __name__ == "__main__":
    main()
