#!/usr/bin/env python3
"""
optimise-image-files.py — shrink the image files themselves.

The site ships 42.8 MB of images over 250 KB, and almost all of it is
over-resolution rather than too many pictures. Measured in the browser:

    aow-icon-finance.png    1254x1254, 1.5 MB   rendered at 100x100
    adon-logo.png           2000x2000, 1.4 MB   rendered at  32x32
    aow-culture-*.jpg       2560x1707, ~800 KB  rendered at 233x174

Files are resized and re-encoded IN PLACE — same path, same filename, same
format. That matters: `/wp-content/uploads/* -> /assets/media/*` redirects keep
years of inbound image links alive, and any change of extension would break
them. Nothing here changes a URL.

Sizing policy, deliberately generous so nothing can look soft:
  * where a page sets an explicit CSS pixel width, target 3x that (retina plus
    headroom), with a 320px floor
  * otherwise cap the longest edge at 1920px, which covers a full-bleed hero
  * never upscale, never touch anything already small enough

Transparency is preserved (RGBA PNGs stay RGBA). SVGs are left alone — they're
vectors and already tiny.

Usage:  python3 scripts/optimise-image-files.py [--dry] [--min-kb N]
"""

import os
import re
import sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
SITE = os.path.join(ROOT, "_site")
DRY = "--dry" in sys.argv
MIN_BYTES = 1024 * int(
    sys.argv[sys.argv.index("--min-kb") + 1] if "--min-kb" in sys.argv else 120
)

FLUID_CAP = 1920      # longest edge for images with no explicit CSS width
RETINA = 3            # multiplier on a known CSS width
FLOOR = 320           # never go below this on the longest edge
JPEG_Q = 82

IMG_TAG = re.compile(r"<img\b[^>]*>", re.I)

# Rendered sizes measured in a real browser at desktop width, for images whose
# CSS width is fluid (percentage / object-fit) and so can't be read from markup.
# Only needed for the few large ones; everything else falls back to FLUID_CAP.
MEASURED = {
    "/assets/design/aow-why-crop.png": 424,
    "/assets/design/aow-hero-team.jpg": 511,
    "/assets/design/aow-culture-boardroom.jpg": 233,
    "/assets/design/aow-culture-lineup.jpg": 233,
    "/assets/design/aow-culture-pair.jpg": 233,
    "/assets/design/aow-culture-xmas.jpg": 233,
    "/assets/design/aow-desk-clean.png": 424,
}


def referenced_assets() -> set[str]:
    """Asset URLs the built site actually uses.

    Unreferenced files are left untouched: they may be staged for a future
    design, and re-compressing something nobody is serving only risks degrading
    an original for no gain.
    """
    refs: set[str] = set()
    for dirpath, _, names in os.walk(SITE):
        for n in names:
            if not n.endswith((".html", ".css", ".xml", ".txt", ".json", ".webmanifest")):
                continue
            text = open(os.path.join(dirpath, n), encoding="utf8", errors="ignore").read()
            for m in re.finditer(r"/assets/[^\s\"'()<>\\]+", text):
                refs.add(re.sub(r"[?#].*$", "", m.group(0)))
    return refs


def known_widths() -> dict[str, int]:
    """Largest explicit CSS pixel width each image is rendered at, sitewide."""
    widths: dict[str, int] = {}
    for dirpath, _, names in os.walk(SITE):
        for n in names:
            if not n.endswith(".html"):
                continue
            html = open(os.path.join(dirpath, n), encoding="utf8", errors="ignore").read()
            for m in IMG_TAG.finditer(html):
                tag = m.group(0)
                src = re.search(r'src="([^"]+)"', tag)
                style = re.search(r'style="([^"]*)"', tag)
                if not src or not style:
                    continue
                url = re.sub(r"[?#].*$", "", src.group(1))
                if not url.startswith("/assets/"):
                    continue
                w = re.search(r"(?:^|;)\s*width\s*:\s*(\d+(?:\.\d+)?)px", style.group(1))
                if not w:
                    w = re.search(r"max-width\s*:\s*(\d+(?:\.\d+)?)px", style.group(1))
                if w:
                    widths[url] = max(widths.get(url, 0), int(float(w.group(1))))
    return widths


def target_edge(url: str, widths: dict[str, int]) -> int:
    css = widths.get(url)
    measured = MEASURED.get(url)
    best = max(x for x in (css, measured, 0) if x is not None)
    if best:
        return max(FLOOR, best * RETINA)
    return FLUID_CAP


def main() -> None:
    widths = known_widths()
    refs = referenced_assets()
    saved = before_total = 0
    resized = reencoded = skipped = 0
    rows = []

    for base in ("assets/design", "assets/media"):
        for dirpath, _, names in os.walk(os.path.join(PUBLIC, base)):
            for n in names:
                ext = os.path.splitext(n)[1].lower()
                if ext not in (".png", ".jpg", ".jpeg", ".webp"):
                    continue
                path = os.path.join(dirpath, n)
                size = os.path.getsize(path)
                if size < MIN_BYTES:
                    continue

                url = "/" + os.path.relpath(path, PUBLIC).replace(os.sep, "/")
                if url not in refs:
                    skipped += 1
                    continue
                try:
                    im = Image.open(path)
                    im.load()
                except Exception:
                    skipped += 1
                    continue

                w, h = im.size
                cap = target_edge(url, widths)
                longest = max(w, h)
                did_resize = False

                if longest > cap:
                    scale = cap / longest
                    im = im.resize((max(1, round(w * scale)), max(1, round(h * scale))),
                                   Image.LANCZOS)
                    did_resize = True

                params: dict = {}
                if ext == ".png":
                    fmt = "PNG"
                    params = dict(optimize=True)
                elif ext == ".webp":
                    fmt = "WEBP"
                    params = dict(quality=JPEG_Q, method=6)
                else:
                    fmt = "JPEG"
                    params = dict(quality=JPEG_Q, optimize=True, progressive=True)
                    if im.mode not in ("RGB", "L"):
                        im = im.convert("RGB")

                tmp = path + ".opt"
                try:
                    im.save(tmp, fmt, **params)
                except Exception:
                    if os.path.exists(tmp):
                        os.remove(tmp)
                    skipped += 1
                    continue

                new = os.path.getsize(tmp)
                # Only keep the new file if it is meaningfully smaller.
                if new < size * 0.95:
                    before_total += size
                    saved += size - new
                    rows.append((size - new, url, f"{w}x{h}", f"{im.size[0]}x{im.size[1]}",
                                 size, new))
                    if did_resize:
                        resized += 1
                    else:
                        reencoded += 1
                    if DRY:
                        os.remove(tmp)
                    else:
                        os.replace(tmp, path)
                else:
                    os.remove(tmp)
                    skipped += 1

    rows.sort(reverse=True)
    print(f"{'[dry run] ' if DRY else ''}image file optimisation")
    print(f"  resized        : {resized}")
    print(f"  re-encoded only: {reencoded}")
    print(f"  unchanged      : {skipped}")
    print(f"  before         : {before_total/1024/1024:.1f} MB")
    print(f"  after          : {(before_total-saved)/1024/1024:.1f} MB")
    print(f"  saved          : {saved/1024/1024:.1f} MB "
          f"({saved*100//before_total if before_total else 0}%)")
    print("\n  biggest wins:")
    for d, url, dim0, dim1, s0, s1 in rows[:14]:
        print(f"    -{d//1024:5} KB  {dim0:>10} -> {dim1:<10} "
              f"{s0//1024:5}KB -> {s1//1024:4}KB  {url}")


if __name__ == "__main__":
    main()
