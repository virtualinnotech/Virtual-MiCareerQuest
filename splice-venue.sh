#!/bin/bash
set -e
FILE="MiCareerQuest-Ship-to-Venue-v13.html"
NEW_VENUE="venue-frame.html"

if [ ! -f "$FILE" ]; then echo "ERROR: $FILE not found in this folder. Run this from your repo folder."; exit 1; fi
if [ ! -f "$NEW_VENUE" ]; then echo "ERROR: $NEW_VENUE not found in this folder."; exit 1; fi

START_TAG='<script id="venue-source" type="application/octet-stream">'
END_TAG='</script>'

TAG_START=$(grep -abo -F "$START_TAG" "$FILE" | head -1 | cut -d: -f1)
if [ -z "$TAG_START" ]; then echo "ERROR: could not find the venue-source tag in $FILE."; exit 1; fi
CONTENT_START=$((TAG_START + ${#START_TAG}))

END_REL=$(tail -c +"$((CONTENT_START+1))" "$FILE" | grep -abo -F "$END_TAG" | head -1 | cut -d: -f1)
if [ -z "$END_REL" ]; then echo "ERROR: could not find the closing tag."; exit 1; fi
CONTENT_END=$((CONTENT_START + END_REL))

echo "Found the old venue content (bytes $CONTENT_START to $CONTENT_END). Splicing in the new version..."

TMPFILE="$FILE.tmp-new"
rm -f "$TMPFILE"
head -c "$CONTENT_START" "$FILE" > "$TMPFILE"
base64 < "$NEW_VENUE" >> "$TMPFILE"
tail -c +"$((CONTENT_END+1))" "$FILE" >> "$TMPFILE"

echo "Verifying the result before touching your original file..."
V_TAG_START=$(grep -abo -F "$START_TAG" "$TMPFILE" | head -1 | cut -d: -f1)
V_CONTENT_START=$((V_TAG_START + ${#START_TAG}))
V_END_REL=$(tail -c +"$((V_CONTENT_START+1))" "$TMPFILE" | grep -abo -F "$END_TAG" | head -1 | cut -d: -f1)
V_CONTENT_END=$((V_CONTENT_START + V_END_REL))

tail -c +"$((V_CONTENT_START+1))" "$TMPFILE" | head -c "$((V_CONTENT_END - V_CONTENT_START))" > "$TMPFILE.b64chunk"

rm -f "$TMPFILE.decoded"
( base64 -d < "$TMPFILE.b64chunk" > "$TMPFILE.decoded" ) 2>/dev/null || true
if [ ! -s "$TMPFILE.decoded" ]; then
  ( base64 -D < "$TMPFILE.b64chunk" > "$TMPFILE.decoded" ) 2>/dev/null || true
fi

if [ -s "$TMPFILE.decoded" ] && cmp -s "$TMPFILE.decoded" "$NEW_VENUE"; then
  mv "$TMPFILE" "$FILE"
  rm -f "$TMPFILE.decoded" "$TMPFILE.b64chunk"
  echo "SUCCESS: $FILE has been updated and verified byte-for-byte. Safe to commit."
else
  echo "VERIFICATION FAILED -- $FILE was NOT changed, nothing was overwritten. Stop here and tell Claude exactly what this printed."
  rm -f "$TMPFILE" "$TMPFILE.decoded" "$TMPFILE.b64chunk"
  exit 1
fi
