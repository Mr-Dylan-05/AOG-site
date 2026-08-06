#!/usr/bin/env python3
"""
normalise-avatars.py — square, face-centred crops for the team photos.

The team cards render each portrait in a `aspect-ratio:1/1` circle with
`object-fit:cover`. 23 of the 24 source files are not square — they run from
0.67 (a tall portrait) to 2.35 (a very wide one) — so the browser crops each
one from its centre. That is why the heads come out at different sizes and why
Kerry's, the tallest portrait of the set, is cut off at the top.

CSS can't fix this: `object-position` would need a different value per image,
and the real problem is that the faces sit at different scales to begin with.
So the crop is done once, here, against the actual pixels.

For each photo: find the face, then cut the largest square that keeps the face
at a consistent size and position — horizontally centred, and placed so there
is comfortable headroom above. If no face is found the file is left alone and
reported, rather than guessed at.

Writes alongside the original as <name>-sq.jpg so nothing is destroyed; the
HTML is repointed separately.

Usage:  python3 scripts/normalise-avatars.py [--dry]
"""

import os
import re
import sys
import glob

import cv2
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
DRY = "--dry" in sys.argv
OUT_SIZE = 800

# Proportion of the final square the face should occupy, and where its centre
# should sit vertically. Tuned so a head reads the same size in every circle
# and never touches the top edge.
FACE_FRACTION = 0.42
FACE_CENTRE_Y = 0.42

detector = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
profile = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_profileface.xml")


def find_face(path):
    """Largest face in the image as (x, y, w, h), or None."""
    img = cv2.imread(path)
    if img is None:
        return None, None
    grey = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    grey = cv2.equalizeHist(grey)
    faces = detector.detectMultiScale(grey, 1.08, 5, minSize=(40, 40))
    if len(faces) == 0:
        faces = profile.detectMultiScale(grey, 1.08, 5, minSize=(40, 40))
    if len(faces) == 0:
        return None, img.shape[:2]
    return max(faces, key=lambda f: f[2] * f[3]), img.shape[:2]


def square_for(face, shape):
    """The crop box that puts this face at the standard size and position."""
    ih, iw = shape
    fx, fy, fw, fh = face
    side = fw / FACE_FRACTION                       # face should be 42% of the square
    side = min(side, iw, ih)                        # can't exceed the source
    cx = fx + fw / 2
    cy = fy + fh / 2
    left = cx - side / 2
    top = cy - side * FACE_CENTRE_Y
    # keep the box inside the image
    left = max(0, min(left, iw - side))
    top = max(0, min(top, ih - side))
    return int(left), int(top), int(side)


def main():
    srcs = set()
    for page in ("people", "our-people"):
        p = os.path.join(PUBLIC, page, "index.html")
        if not os.path.exists(p):
            continue
        html = open(p, encoding="utf8", errors="ignore").read()
        for m in re.finditer(r'data-img-slot="person-[a-z]+"[^>]*>\s*<img src="([^"]+)"', html):
            srcs.add(m.group(1))

    done, skipped, already = 0, [], 0
    for rel in sorted(srcs):
        src = os.path.join(PUBLIC, rel.lstrip("/"))
        if not os.path.exists(src):
            skipped.append((rel, "file missing"))
            continue
        stem, _ = os.path.splitext(src)
        dest = stem + "-sq.jpg"

        face, shape = find_face(src)
        if shape is None:
            skipped.append((rel, "unreadable"))
            continue
        if face is None:
            skipped.append((rel, "no face found — left alone"))
            continue

        left, top, side = square_for(face, shape)
        im = Image.open(src).convert("RGB")
        im = im.crop((left, top, left + side, top + side)).resize((OUT_SIZE, OUT_SIZE), Image.LANCZOS)
        if not DRY:
            im.save(dest, "JPEG", quality=86, optimize=True, progressive=True)
        done += 1
        print(f"  {os.path.basename(rel)[:44]:46} face {face[2]}px -> square {side}px")

    print(f"\n{'[dry run] ' if DRY else ''}avatars normalised: {done}, skipped: {len(skipped)}")
    for rel, why in skipped:
        print(f"   SKIPPED  {os.path.basename(rel)[:44]:46} {why}")


if __name__ == "__main__":
    main()
