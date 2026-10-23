# 太阳探索实验室：科学与素材

本页是交互教学模型，不是实时观测，也不声称还原人眼在太阳内部会看到的景象。内部不可直接摄影；颜色、时间和微观粒子大小均经教学处理。

## 科学数据

- NASA Sun Facts：https://science.nasa.gov/sun/facts/
- NASA/Marshall The Solar Interior：https://solarscience.msfc.nasa.gov/interior.shtml
- NASA/Marshall Photospheric Features：https://solarscience.msfc.nasa.gov/feature1.shtml
- NASA/Marshall The Photosphere：https://solarscience.msfc.nasa.gov/surface.shtml
- NASA/Marshall The Chromosphere：https://solarscience.msfc.nasa.gov/chromos.shtml
- NASA Sun Fact Sheet：https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html
- NASA Space Place：https://spaceplace.nasa.gov/all-about-the-sun/en/

数值核对日期：2026-10-23。半径使用 695,700 km；直径为其两倍。质量 1.9884 × 10³⁰ kg，体积 1.412 × 10¹⁸ km³。温度以近似值呈现，核心 1,500 万℃为中心值，光球 5,500℃为代表值。日地光行时间采用约 500 秒。内部分界约 0.25 R 与 0.70 R；薄大气层的局部画面放大展示。

## 图像

- `../textures/sun.jpg`、`../textures/earth_daymap.jpg`：复用项目已有 Solar System Scope 素材，CC BY 4.0。https://www.solarsystemscope.com/textures/ 。太阳球面是合成外观素材，不能作为同步的全球观测图。
- `assets/sdo-visible.jpg`：NASA/SDO 与 HMI 科学团队。来源 https://sdo.gsfc.nasa.gov/assets/img/latest/latest_2048_HMII.jpg 。HMI 连续谱强度灰度图，保持原图和日期标注。
- `assets/sdo-ultraviolet.jpg`：NASA/SDO 与 AIA 科学团队。来源 https://sdo.gsfc.nasa.gov/assets/img/latest/latest_2048_0171.jpg 。171 Å 极紫外伪彩观测，配色不代表肉眼颜色。
- `assets/sunspot-observation.jpg`：Hinode/SOT 于 2007-01-05 的 G 波段黑子观测。NASA/GSFC Scientific Visualization Studio 制图，Tom Bridgman。来源 https://svs.gsfc.nasa.gov/vis/a000000/a004000/a004061/SunspotGBand_20070105_stand.2Kx1K.00100.jpg 。
- `assets/granules-observation.jpg`：同任务、同日期的 G 波段对流米粒组织观测，署名同上。来源 https://svs.gsfc.nasa.gov/vis/a000000/a004000/a004061/ConvectionGBand_20070105_stand.1Kx1K.00100.jpg 。
- 上述两张图的来源和完整制作名单：https://svs.gsfc.nasa.gov/4061/ 。使用依据为该页面链接的 NASA 影像使用准则 https://www.nasa.gov/nasa-brand-center/images-and-media/ ，教育展示保留来源，不暗示机构背书。球面黑子点和三维局部平面为贴图映射，不是实测三维重建。

观测素材于 2026-10-23 保存到本项目。图内日期才是观测时间，保存时间不是拍摄时间。页面不发起实时数据请求。

## 代码与语音

- `vendor/three.min.js`、`vendor/OrbitControls.js`：复用项目 macOS Vendor 中的 Three.js r128，MIT。许可见 `vendor/LICENSE`。
- 小晓语音由 `narration.py` 中的中文文本生成。安装 `requirements.txt` 后运行 `python3 generate-audio.py` 生成 MP3 和 `narration.js`；文本哈希防止复用过期音频，失败不保留半成品。
- 浏览器 Speech Synthesis 仅为播放失败时的兜底；关闭语音立即停止播放。

## 运行

在仓库根目录启动 `python3 -m http.server 8765`，打开 `/space/sun-lab/index.html`。所有三维库、贴图、观测图片与语音均本地加载，可随现有 macOS 包分发。
