#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="${1:?usage: prepare-web-content.sh <output-dir>}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT_DIR="$(cd "$APP_DIR/../.." && pwd)"
VENDOR_DIR="$APP_DIR/Vendor"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

for file in \
  index.html \
  favicon.ico \
  readme.md \
  sun_vol_vs_mass.html \
  1251425375.txt \
  CNAME.bak \
  sogousiteverification.txt
do
  if [[ -f "$ROOT_DIR/$file" ]]; then
    rsync -a "$ROOT_DIR/$file" "$OUT_DIR/"
  fi
done

for dir in space math puzzle engineering etf; do
  if [[ -d "$ROOT_DIR/$dir" ]]; then
    rsync -a --delete \
      --exclude '.DS_Store' \
      --exclude '__pycache__' \
      "$ROOT_DIR/$dir" "$OUT_DIR/"
  fi
done

mkdir -p "$OUT_DIR/space/vendor"
rsync -a --delete "$VENDOR_DIR/" "$OUT_DIR/space/vendor/"
mkdir -p "$OUT_DIR/engineering/vendor"
rsync -a --delete "$VENDOR_DIR/" "$OUT_DIR/engineering/vendor/"

find "$OUT_DIR" -name '*.html' -print0 | while IFS= read -r -d '' file; do
  perl -0pi -e '
    s#\s*<link[^>]*(?:fonts\.loli\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>\n?##gs;
    s#https://cdnjs\.cloudflare\.com/ajax/libs/three\.js/r128/three\.min\.js#vendor/three/three.min.js#g;
    s#https://cdn\.jsdelivr\.net/npm/three\@0\.128\.0/examples/js/controls/OrbitControls\.js#vendor/three/examples/js/controls/OrbitControls.js#g;
    s#https://cdn\.jsdelivr\.net/npm/three\@0\.128\.0/examples/js/postprocessing/EffectComposer\.js#vendor/three/examples/js/postprocessing/EffectComposer.js#g;
    s#https://cdn\.jsdelivr\.net/npm/three\@0\.128\.0/examples/js/postprocessing/RenderPass\.js#vendor/three/examples/js/postprocessing/RenderPass.js#g;
    s#https://cdn\.jsdelivr\.net/npm/three\@0\.128\.0/examples/js/postprocessing/ShaderPass\.js#vendor/three/examples/js/postprocessing/ShaderPass.js#g;
    s#https://cdn\.jsdelivr\.net/npm/three\@0\.128\.0/examples/js/postprocessing/UnrealBloomPass\.js#vendor/three/examples/js/postprocessing/UnrealBloomPass.js#g;
    s#https://cdn\.jsdelivr\.net/npm/three\@0\.128\.0/examples/js/shaders/LuminosityHighPassShader\.js#vendor/three/examples/js/shaders/LuminosityHighPassShader.js#g;
    s#https://cdn\.jsdelivr\.net/npm/three\@0\.128\.0/examples/js/shaders/CopyShader\.js#vendor/three/examples/js/shaders/CopyShader.js#g;
  ' "$file"
done

if find "$OUT_DIR" -name '*.html' -print0 | xargs -0 rg -n "https?://(cdnjs|cdn\.jsdelivr|fonts\.loli|fonts\.googleapis|fonts\.gstatic)" >/tmp/zhitian-space-network-leftovers.txt; then
  cat /tmp/zhitian-space-network-leftovers.txt >&2
  echo "External runtime dependency remained in packaged web content." >&2
  exit 1
fi
