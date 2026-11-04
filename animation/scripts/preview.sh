#!/usr/bin/env bash
# Preview rápido: ~357x640, 15 fps efetivos, CRF alto. Serve só para validar ritmo/composição.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out
npx remotion render src/index.ts Main out/preview.mp4 \
  --scale=0.33 --every-nth-frame=2 --crf=34 --concurrency=4 ${BROWSER_EXE:+--browser-executable="$BROWSER_EXE"}
echo "Preview: out/preview.mp4"
