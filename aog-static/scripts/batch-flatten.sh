#!/bin/bash
export PATH="/Users/dylanbailey/.nvm/versions/node/v20.20.0/bin:/usr/bin:/bin"
SITE=/Users/dylanbailey/Downloads/aog-002/aog-static
EX="/Users/dylanbailey/Downloads/ad on group"
cd "$SITE" || exit 1

slugify() {
  local b="$1"
  if [ "$b" = "Ad On Group - Home" ]; then echo "/"; return; fi
  echo "/$(echo "$b" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')/"
}

REVIEWS="$SITE/incoming/design/reviews.json"
# /ad-on-ai/ is sourced from the deployed adon-ai.com.au repo (real content),
# not the design project's placeholder "Ad On AI.dc.html".
ADONAI_SRC="/Users/dylanbailey/Documents/GitHub/dylan-website/index.html"
count=0; warns=0
while IFS= read -r f; do
  base=$(basename "$f" .dc.html)
  # skip the design-project Ad On AI placeholder — handled separately below
  [ "$base" = "Ad On AI" ] && continue
  slug=$(slugify "$base")
  if [ "$slug" = "/" ]; then out="public/index.html"; else out="public${slug}index.html"; fi
  # reviews carousel pages get the full review data
  dataflag=""
  grep -q 'list="{{ reviews }}"' "$f" && dataflag="--data=$REVIEWS"
  warn=$(node scripts/flatten-dc.js "$f" "$out" $dataflag 2>&1 | grep -c '\[warn\]')
  [ "$warn" -gt 0 ] && { warns=$((warns+1)); printf "  ⚠  %-34s -> %s\n" "$base" "$slug"; }
  # remove any colliding reference page
  refdir="src/pages${slug}"
  [ -f "${refdir}index.njk" ] && rm -f "${refdir}index.njk"
  count=$((count+1))
done < <(find "$EX" -maxdepth 1 -name '*.dc.html')

echo "Flattened $count design pages ($warns had warnings)."

# Overlay the real deployed adon-ai.com.au pages (replace placeholders + add bios/pricing)
if [ -f "$ADONAI_SRC" ]; then
  node scripts/import-dylan-website.js
else
  echo "  ⚠  dylan-website not found at $ADONAI_SRC — skipped deployed AI pages"
fi

# Point "Book a call" at the form. The imported Ad On AI pages used mailto,
# which is a dead end on a phone and never reaches the leads sheet.
node scripts/fix-cta-links.js

# Use the Ad On Group footer sitewide (and fix links to the retired /ad-on-ai/)
node scripts/apply-group-footer.js
