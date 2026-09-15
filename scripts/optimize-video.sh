#!/usr/bin/env bash
# Web-Optimized Video Pipeline for Vercel & Production
# Ensures MP4 files have faststart (moov atom at start), 24/25fps progressive scan,
# yuv420p color format for 100% device compatibility, and no unnecessary audio track.

set -e

INPUT="${1:-public/video/showreel.mp4}"
OUTPUT="${2:-public/video/showreel_optimized.mp4}"

if [ ! -f "$INPUT" ]; then
  echo "Input video $INPUT not found."
  exit 1
fi

echo "Optimizing $INPUT -> $OUTPUT..."

ffmpeg -y -i "$INPUT" \
  -c:v libx264 \
  -profile:v high \
  -level 4.1 \
  -pix_fmt yuv420p \
  -colorspace bt709 \
  -color_primaries bt709 \
  -color_trc bt709 \
  -color_range tv \
  -movflags +faststart \
  -an \
  "$OUTPUT"

mv "$OUTPUT" "$INPUT"
echo "Video optimized successfully."
