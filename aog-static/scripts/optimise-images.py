#!/usr/bin/env python3
"""
optimise-images.py — add width/height and lazy loading to <img> tags.

Two separate wins, both measured by Core Web Vitals:

  width/height   Without them the browser doesn't know how much space to
                 reserve, so the page jumps as each image arrives. That's
                 Cumulative Layout Shift, and 384 of 765 images had no
                 dimensions. Values are read from the actual image files, so
                 they're correct rather than guessed. CSS still controls the
                 rendered size — these only supply the aspect ratio.

  loading=lazy   Offscreen images shouldn't block the first paint. 565 of 765
                 had no loading attribute.

Deliberately NOT lazy: the first image on each page. That's usually the hero,
and lazy-loading the largest contentful element delays it — the opposite of the
intent. The first image gets loading="eager" + fetchpriority="high" instead.

Existing width/height/loading attributes are never overwritten. SVGs get the
loading treatment but no dimensions (they scale, and Pillow can't read them).

Alt text is NOT touched: 86 images lack it, but writing alt text is copywriting.

Usage:  python3 scripts/optimise-images.py [--dry]
"""

import os
import re
import sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
DRY = "--dry" in sys.argv

IMG_RE = re.compile(r"<img\b[^>]*>", re.I)
SRC_RE = re.compile(r'\bsrc=["\']([^"\']+)["\']', re.I)

_dims: dict[str, tuple[int, int] | None] = {}


def dimensions(src: str):
    """Pixel size of a local image, or None."""
    url = re.sub(r"[?#].*$", "", src)
    if not url.startswith("/assets/"):
        return None
    if url in _dims:
        return _dims[url]
    path = os.path.join(PUBLIC, url.lstrip("/"))
    result = None
    if os.path.exists(path) and not url.lower().endswith(".svg"):
        try:
            with Image.open(path) as im:
                result = im.size
        except Exception:
            result = None
    _dims[url] = result
    return result


def source_files():
    for base, exts in ((os.path.join(ROOT, "src", "pages"), (".njk", ".html", ".md")),
                       (os.path.join(ROOT, "src", "_includes"), (".njk",)),
                       (PUBLIC, (".html",))):
        for dirpath, _, names in os.walk(base):
            for n in names:
                if n.endswith(exts):
                    yield os.path.join(dirpath, n)


def hero_policy(path: str, index: int) -> bool:
    """True if this image should load eagerly.

    The shared partials each hold a single logo, so per-file "first image"
    counting would mark BOTH the header and footer logo as the hero. The header
    logo genuinely is above the fold on every page; the footer logo never is.
    """
    name = os.path.basename(path)
    if name in ("header.njk", "footer.njk"):
        return name == "header.njk"
    return index == 1


def main():
    files = sized = lazied = eager = 0

    for path in source_files():
        with open(path, encoding="utf8", errors="ignore") as fh:
            original = fh.read()

        seen = 0          # image index within this page
        stats = [0, 0, 0]  # sized, lazied, eager

        def fix(match):
            nonlocal seen
            tag = match.group(0)
            seen += 1
            first = hero_policy(path, seen)

            src_m = SRC_RE.search(tag)
            src = src_m.group(1) if src_m else ""

            # --- dimensions ---
            if not re.search(r"\bwidth=", tag, re.I) and not re.search(r"\bheight=", tag, re.I):
                dim = dimensions(src)
                if dim:
                    tag = tag[:-1].rstrip() + f' width="{dim[0]}" height="{dim[1]}">'
                    stats[0] += 1

            # --- loading ---
            if not re.search(r"\bloading=", tag, re.I):
                if first:
                    extra = ' loading="eager"'
                    if not re.search(r"\bfetchpriority=", tag, re.I):
                        extra += ' fetchpriority="high"'
                    stats[2] += 1
                else:
                    extra = ' loading="lazy"'
                    stats[1] += 1
                tag = tag[:-1].rstrip() + extra + ">"

            if not re.search(r"\bdecoding=", tag, re.I):
                tag = tag[:-1].rstrip() + ' decoding="async">'

            return tag

        updated = IMG_RE.sub(fix, original)

        if updated != original:
            files += 1
            sized += stats[0]
            lazied += stats[1]
            eager += stats[2]
            if not DRY:
                with open(path, "w", encoding="utf8") as fh:
                    fh.write(updated)

    print(f"{'[dry run] ' if DRY else ''}image attributes")
    print(f"  files changed          : {files}")
    print(f"  width/height added     : {sized}")
    print(f"  loading=lazy added     : {lazied}")
    print(f"  loading=eager (hero)   : {eager}")
    resolved = sum(1 for v in _dims.values() if v)
    print(f"  images measured on disk: {resolved} of {len(_dims)} referenced")


if __name__ == "__main__":
    main()
