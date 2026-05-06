#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="${1:?usage: prepare-web-content.sh <output-dir>}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT_DIR="$(cd "$APP_DIR/../.." && pwd)"
VENDOR_DIR="$APP_DIR/Vendor"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

rsync -a --delete \
  --exclude '.DS_Store' \
  --exclude '__pycache__' \
  "$ROOT_DIR/space" "$OUT_DIR/"

mkdir -p "$OUT_DIR/app"
rsync -a --delete "$APP_DIR/WebContent/app/" "$OUT_DIR/app/"

mkdir -p "$OUT_DIR/space/vendor"
rsync -a --delete "$VENDOR_DIR/" "$OUT_DIR/space/vendor/"

find "$OUT_DIR/space" -name '*.html' -print0 | while IFS= read -r -d '' file; do
  perl -0pi -e '
    s#\s*<link[^>]*fonts\.loli\.net[^>]*>\n?##gs;
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

if rg -n "https?://(cdnjs|cdn\.jsdelivr|fonts\.loli)" "$OUT_DIR/space" "$OUT_DIR/app" >/tmp/zhitian-space-network-leftovers.txt; then
  cat /tmp/zhitian-space-network-leftovers.txt >&2
  echo "External runtime dependency remained in packaged web content." >&2
  exit 1
fi
