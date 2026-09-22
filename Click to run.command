#!/bin/bash

# MiCareerQuest local development launcher
# Double-click this file on macOS to start the local web server.

cd "$(dirname "$0")" || exit 1
PORT=8000
URL="http://localhost:${PORT}/"

echo ""
echo "=============================================="
echo "   MiCareerQuest DEV"
echo "=============================================="
echo ""
echo "Starting local server on port ${PORT}..."
echo "Game: ${URL}"
echo ""
echo "Keep this Terminal window open while testing."
echo "Press Control+C here when you are finished."
echo ""

# Open the browser after the server has had a moment to start.
(sleep 1.2; open "$URL") &

python3 -m http.server "$PORT"

STATUS=$?
echo ""
if [ "$STATUS" -ne 0 ]; then
  echo "The server could not start."
  echo "If port ${PORT} is already in use, close the other MiCareerQuest Terminal window and try again."
fi

echo ""
read -n 1 -s -r -p "Press any key to close this window..."
echo ""
