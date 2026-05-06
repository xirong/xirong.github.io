# 智天太空探险 macOS App

这是 `space/` 内容的 macOS 本地 App 壳，使用 SwiftUI + WKWebView 承载现有静态页面。
App 内注册了 `zhitian-space://` 本地资源协议，避免直接使用 `file://` 时 WebKit 对 WebGL 纹理、音频等本地资源读取不稳定的问题。

## 目标

- 把 `space/textures/`、`space/audio/` 和 Three.js 依赖打进 App 包
- 入口只保留“太空天文”和“太阳系探险家系列”
- 保持现有 HTML/CSS/JavaScript 逻辑，减少重写成本
- 支持离线打开，降低 GitHub Pages 和网络速度对体验的影响

## 常用命令

```bash
./script/build_and_run.sh
./script/build_and_run.sh --verify
./script/build_and_run.sh --dmg
```

构建产物：

- `dist/智天太空探险.app`
- `dist/智天太空探险.dmg`

打包时会先复制 `space/`，再把 CDN 版 Three.js、OrbitControls、postprocessing 脚本替换为 `macos/ZhitianSpace/Vendor/` 中的本地文件。原始网页文件不会被改动。
