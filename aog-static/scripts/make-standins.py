#!/usr/bin/env python3
"""
make-standins.py — generate placeholder images for media the site references
but that no longer exists anywhere (not in the WordPress library, not on the
live or staging site, not in the Claude Design export).

They are deliberately *labelled* rather than invisible: a silent blank would
quietly ship to production, whereas these are obvious in a preview and easy to
find later with `grep -rl "assets/media" | ...` or by eye.

Dimensions are read from the WordPress size suffix (foo-1024x768.png) so the
stand-in occupies the same space as the real image did and layouts don't shift.

Usage:  python3 scripts/make-standins.py [--force]
        (reads the missing list from localise-media.js output)
"""

import os
import re
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEDIA = os.path.join(ROOT, "public", "assets", "media")
FORCE = "--force" in sys.argv

BG = (241, 243, 245)
EDGE = (206, 212, 218)
ACCENT = (27, 171, 229)      # Ad On Group cyan
TEXT = (108, 117, 125)


REF_RE = re.compile(r"/assets/media/([^\s\"'`)<>\\]+)")


def source_files():
    for base, exts in ((os.path.join(ROOT, "public"), (".html",)),
                       (os.path.join(ROOT, "src"), (".njk", ".html", ".md", ".json"))):
        for dirpath, _, names in os.walk(base):
            for n in names:
                if n.endswith(exts):
                    yield os.path.join(dirpath, n)


def missing_paths():
    """Every /assets/media/ reference in the source that has no file on disk.

    Doubles as a media link checker — run it any time to catch a bad path.
    """
    refs = set()
    for f in source_files():
        with open(f, encoding="utf8", errors="ignore") as fh:
            for m in REF_RE.finditer(fh.read()):
                rel = re.sub(r"[?#].*$", "", m.group(1))
                rel = re.sub(r"&(amp|quot|#0?39);.*$", "", rel)
                if rel:
                    refs.add(rel)
    return sorted(r for r in refs if not os.path.exists(os.path.join(MEDIA, r)))


def dimensions(name):
    m = re.search(r"-(\d{2,5})x(\d{2,5})\.", name)
    if m:
        return int(m.group(1)), int(m.group(2))
    if "logo" in name.lower() or "icon" in name.lower():
        return 400, 400
    if "banner" in name.lower() or "hero" in name.lower():
        return 1600, 700
    return 1200, 800


def font(size):
    for p in ("/System/Library/Fonts/Supplemental/Arial.ttf",
              "/System/Library/Fonts/Helvetica.ttc"):
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                pass
    return ImageFont.load_default()


def build(rel):
    w, h = dimensions(os.path.basename(rel))
    img = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(img)

    # border + accent bar, so it reads as intentional rather than broken
    d.rectangle([0, 0, w - 1, h - 1], outline=EDGE, width=max(1, min(w, h) // 200))
    d.rectangle([0, 0, w, max(3, h // 60)], fill=ACCENT)

    label = "PLACEHOLDER"
    sub = os.path.basename(rel)
    dim = f"{w}x{h}"

    f1 = font(max(11, min(w // 14, h // 7, 46)))
    f2 = font(max(9, min(w // 30, h // 16, 20)))

    def centred(text, fnt, y):
        box = d.textbbox((0, 0), text, font=fnt)
        d.text(((w - (box[2] - box[0])) / 2, y), text, font=fnt, fill=TEXT)
        return box[3] - box[1]

    total = h / 2 - (h // 10)
    total += centred(label, f1, total) + max(6, h // 40)
    if w >= 220:
        total += centred(sub, f2, total) + max(4, h // 60)
        centred(dim, f2, total)

    dest = os.path.join(MEDIA, rel)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    ext = os.path.splitext(rel)[1].lower()
    if ext in (".jpg", ".jpeg"):
        img.save(dest, "JPEG", quality=82)
    elif ext == ".gif":
        img.convert("P", palette=Image.ADAPTIVE).save(dest, "GIF")
    elif ext == ".webp":
        img.save(dest, "WEBP", quality=82)
    else:
        img.save(dest, "PNG", optimize=True)
    return dest, (w, h)


def main():
    made, skipped, unsupported = 0, 0, []
    for rel in missing_paths():
        if os.path.splitext(rel)[1].lower() not in (
            ".jpg", ".jpeg", ".png", ".gif", ".webp"
        ):
            unsupported.append(rel)
            continue
        if os.path.exists(os.path.join(MEDIA, rel)) and not FORCE:
            skipped += 1
            continue
        dest, (w, h) = build(rel)
        made += 1
        print(f"  {rel}  ({w}x{h})")

    print(f"\nstand-ins written: {made}" + (f", already present: {skipped}" if skipped else ""))
    if unsupported:
        print("\nNOT generated (not an image — needs a real decision):")
        for u in unsupported:
            print(f"  {u}")


if __name__ == "__main__":
    main()
