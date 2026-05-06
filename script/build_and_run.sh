#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-run}"
APP_NAME="ZhitianSpace"
BUNDLE_DISPLAY_NAME="智天太空探险"
BUNDLE_ID="com.xirong.zhitian-space"
MIN_SYSTEM_VERSION="13.0"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT_DIR/macos/ZhitianSpace"
DIST_DIR="$ROOT_DIR/dist"
APP_BUNDLE="$DIST_DIR/$BUNDLE_DISPLAY_NAME.app"
APP_CONTENTS="$APP_BUNDLE/Contents"
APP_MACOS="$APP_CONTENTS/MacOS"
APP_RESOURCES="$APP_CONTENTS/Resources"
APP_BINARY="$APP_MACOS/$APP_NAME"
INFO_PLIST="$APP_CONTENTS/Info.plist"
WEB_CONTENT_DIR="$APP_DIR/.build-web/WebContent"
CONFIGURATION="${CONFIGURATION:-release}"

prepare_web_content() {
  "$APP_DIR/Scripts/prepare-web-content.sh" "$WEB_CONTENT_DIR"
}

build_app() {
  pkill -x "$APP_NAME" >/dev/null 2>&1 || true

  prepare_web_content
  swift build --package-path "$APP_DIR" --configuration "$CONFIGURATION"
  BUILD_BINARY="$(swift build --package-path "$APP_DIR" --configuration "$CONFIGURATION" --show-bin-path)/$APP_NAME"

  rm -rf "$APP_BUNDLE"
  mkdir -p "$APP_MACOS" "$APP_RESOURCES"
  cp "$BUILD_BINARY" "$APP_BINARY"
  chmod +x "$APP_BINARY"
  rsync -a --delete "$WEB_CONTENT_DIR/" "$APP_RESOURCES/WebContent/"

  cat >"$INFO_PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key>
  <string>$APP_NAME</string>
  <key>CFBundleIdentifier</key>
  <string>$BUNDLE_ID</string>
  <key>CFBundleName</key>
  <string>$BUNDLE_DISPLAY_NAME</string>
  <key>CFBundleDisplayName</key>
  <string>$BUNDLE_DISPLAY_NAME</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>0.1.0</string>
  <key>CFBundleVersion</key>
  <string>1</string>
  <key>LSMinimumSystemVersion</key>
  <string>$MIN_SYSTEM_VERSION</string>
  <key>NSHighResolutionCapable</key>
  <true/>
  <key>NSPrincipalClass</key>
  <string>NSApplication</string>
</dict>
</plist>
PLIST

  codesign --force --deep --sign - "$APP_BUNDLE" >/dev/null
}

open_app() {
  /usr/bin/open -n "$APP_BUNDLE"
}

create_dmg() {
  DMG_PATH="$DIST_DIR/$BUNDLE_DISPLAY_NAME.dmg"
  rm -f "$DMG_PATH"
  hdiutil create -volname "$BUNDLE_DISPLAY_NAME" -srcfolder "$APP_BUNDLE" -ov -format UDZO "$DMG_PATH" >/dev/null
  echo "$DMG_PATH"
}

case "$MODE" in
  run)
    build_app
    open_app
    ;;
  --debug|debug)
    build_app
    lldb -- "$APP_BINARY"
    ;;
  --logs|logs)
    build_app
    open_app
    /usr/bin/log stream --info --style compact --predicate "process == \"$APP_NAME\""
    ;;
  --telemetry|telemetry)
    build_app
    open_app
    /usr/bin/log stream --info --style compact --predicate "subsystem == \"$BUNDLE_ID\""
    ;;
  --verify|verify)
    build_app
    open_app
    sleep 2
    pgrep -x "$APP_NAME" >/dev/null
    ;;
  --dmg|dmg)
    build_app
    create_dmg
    ;;
  *)
    echo "usage: $0 [run|--debug|--logs|--telemetry|--verify|--dmg]" >&2
    exit 2
    ;;
esac
