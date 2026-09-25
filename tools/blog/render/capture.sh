#!/usr/bin/env bash
# Captures an HTML figure to a PNG at an exact pixel size.
#
#   capture.sh <source.html> <out.png> [width] [height]
#
# Chrome renders at 2x so small mono labels stay crisp, then sips downsamples to
# the size the blog expects. Same approach as history-revert/listing/render.sh.
# Override the browser with CHROME=/path/to/chrome.
set -euo pipefail

src="$1"
out="$2"
width="${3:-1200}"
height="${4:-630}"

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
[ -x "$CHROME" ] || { echo "Chrome not found at $CHROME" >&2; exit 1; }

source_path="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
raw="$(mktemp -t figure-XXXXXX).png"

"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=2 --window-size="$width,$height" \
  --screenshot="$raw" "file://$source_path" >/dev/null 2>&1

sips -z "$height" "$width" "$raw" --out "$out" >/dev/null
rm -f "$raw"
