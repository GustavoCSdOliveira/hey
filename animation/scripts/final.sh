#!/usr/bin/env bash
# Render final: frames em 1080x1920 (ProRes-like qualidade intermediária) -> FFmpeg H.264 1080p.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out
npx remotion render src/index.ts Main out/master.mp4 \
  --codec=h264 --crf=12 --pixel-format=yuv420p ${BROWSER_EXE:+--browser-executable="$BROWSER_EXE"}
ffmpeg -y -i out/master.mp4 -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p \
  -vf "scale=1080:1920:flags=lanczos" -c:a aac -b:a 192k -movflags +faststart out/final_1080p.mp4
echo "Final: out/final_1080p.mp4"
