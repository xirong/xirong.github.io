# 飞进太阳 · Blender 交互预览

只覆盖太阳从外面进入核心的旅程。入口为 `index.html`，与正式的 `../index.html`、共用的 `../../explorer/dive.js` 以及其他行星页面隔离。

点击「开始飞行」体验约 44 秒的完整镜头；也可以拖进度条、点击地点、看剖面、暂停后拖动观察。声音默认关闭，打开后复用原太阳页的小晓 MP3。辐射区只显示修正后的文字说明，没有复用原版“光被撞”的简化旁白。

## Blender 与网页各自负责什么

- `source/build-sun.py`：独立 Blender 场景。生成有厚度的分层球壳、两侧有起伏的剖面、对流胞、辐射路径、核心和日冕细丝；用 Cycles 烘焙三个内部材质；按层合并网格；导出 GLB。
- `source/sun-interior.blend`：打包了纹理的可编辑源工程。渲染时隐藏开口盖片，显示剖面。
- `source/render-plasma.py`：Cycles 渲染带透明度的等离子体积云，网页用它做有远近关系的云层。云的外观是示意。
- `assets/sun-interior.glb`：浏览器实际加载的 Blender 模型，14 个网格。没有运行时建模服务。
- `assets/blender-cutaway.png`：Blender 实际渲染输出，用于视觉审核和 WebGL 失败时的静态入口。
- `preview.js`：Three.js r128 加载 GLB，完成连续镜头、微观放大、粒子移动、辉光、交互与音频。

完整模型没有把 Cycles 的体积散射实时搬进浏览器。内部云雾使用预渲染透明素材，网格、视差、镜头和交互是实时三维。为了看清内部，靠近时外层逐渐透明；这也不是太阳实际会发生的变化。

## 重新生成

需要 Blender 5.2 系列。项目以本机 Blender 5.2.1 LTS 验证。命令应在仓库根目录执行：

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
  --python space/sun-3d/interior-preview/source/build-sun.py
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
  --python space/sun-3d/interior-preview/source/render-plasma.py
```

改材质后给第一条命令加 `-- --rebake`，覆盖本预览生成的三张烘焙纹理。不要把脚本粘进有未保存作品的 Blender 交互窗口，脚本专供独立 `--factory-startup` 进程。

本地预览：`python3 -m http.server 8765`，打开 `/space/sun-3d/interior-preview/`。`?stop=3` 直接看剖面，`?stop=4` 看对流区，`?stop=6` 看核心。

## 科学边界与素材来源

- 外表：复用 `../assets/map-304.jpg`，NASA/SDO AIA 304 Å 观测拼图。它是紫外伪彩，映射成球面也有时间差。原始日期和拼接方法见 [原太阳页素材说明](../CREDITS.md)。
- 该伪彩观测用于保持外观的丰富细节，不能视为单独某个层的真实可见光照片。表面停靠点的 5,500℃ 指光球，不是 AIA 304 Å 所对应的氦发射温度。
- 内部无法直接拍摄。颜色、纹理、路径、粒子形状与速度全部是教学模型。三维剖面的分层半径取核心约 0.25 R、辐射区外边缘约 0.7 R；大气薄层与日冕范围没有统一按比例放大。
- 核心近景把微观过程放大。四个氢核到氦核的示意省略中间反应、正电子和中微子，不用作核反应的精确模拟。
- 太阳没有固体外壳，流线不是管道，内部也不是可供探测器实际飞行的空腔。
- 分层、温度和能量传递依据：[NASA Sun Facts](https://science.nasa.gov/sun/facts/)，本次核对日期 2026-10-26。
- Three.js、OrbitControls 与后处理复用项目内 r128，MIT 许可。新增 `vendor/GLTFLoader.js` 来自 [Three.js 官方 r128](https://github.com/mrdoob/three.js/blob/r128/examples/js/loaders/GLTFLoader.js)，许可见 [LICENSE](../../explorer/vendor/LICENSE)。

本预览不替换正式入口，也不更新 APP / DMG。先验证视觉方向，再决定接回原来的“里面是什么”模块。
