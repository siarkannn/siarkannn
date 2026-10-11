#!/usr/bin/env bash
# Video Asset Integrity & Non-Destructive Inspector
# STRICT NON-DESTRUCTIVE GUARANTEE: Never overwrites, downscales, or reduces file size.
# Ensures the user's original video file (e.g. 48MB+, 4K/1080p) remains 100% intact.

set -e

INPUT="${1:-public/video/showreel.mp4}"

if [ ! -f "$INPUT" ]; then
  echo "Input video $INPUT not found."
  exit 1
fi

FILE_SIZE=$(stat -c%s "$INPUT" 2>/dev/null || stat -f%z "$INPUT" 2>/dev/null || echo "0")
echo "Checking video integrity for $INPUT (Size: $FILE_SIZE bytes)..."

# Verify media stream integrity without modifying the original file
if ffmpeg -v error -i "$INPUT" -f null - 2>/dev/null; then
  echo "Video file integrity verified. Original file preserved without modification."
else
  echo "Warning: File may have decode issues, but original file has been kept untouched."
fi
