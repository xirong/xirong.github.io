# 真实的太阳：素材与做法

第一期：逼真外观。太阳表面全部来自真实观测照片，代码只负责光照、动画和交互。

## 球面贴图（`assets/map-*.jpg`）

NASA 太阳动力学天文台（SDO）公开图库 https://sdo.gsfc.nasa.gov/assets/img/browse/ ，4096 像素日面图。
致谢：Courtesy of NASA/SDO and the AIA, EVE, and HMI science teams。

| 文件 | 原图波段 | 说明 |
|---|---|---|
| `map-visible.jpg` | HMI 连续谱（HMIIC） | 可见光光球、黑子；灰度保存，页面着色 |
| `map-304.jpg` | AIA 304 Å | 色球、日珥，NASA 伪彩 |
| `map-171.jpg` | AIA 171 Å | 日冕磁环，NASA 伪彩 |
| `map-magnetic.jpg` | HMI 磁图（HMIB） | 白 = 指向观测者，黑 = 背离 |

每个波段用四张日面图拼成整颗球：相隔约 1/4 个自转周期（6.8 天），按卡林顿自转率换算经度，离日面中心越近的权重越大。拼之前先除以径向中位亮度，去掉照片自带的临边变化，页面 shader 再按物理规律加回去。HMI 在 2026-10-02 至 10-15 缺档，这两个相位改用整一圈之前（9 月 5 日、9 月 12 日）的照片。每张图的实际拍摄时间见 `assets/frames.js`。

## 日冕光环

- `corona-304.jpg`、`corona-171.jpg`：同一批最新 SDO 图里日面以外的部分（2026-10-23）。
- `corona-eclipse.jpg`：2017-08-21 美国日全食，NASA/Carla Thomas，NASA 图库编号 AFRC2017-0233-005，https://images.nasa.gov/details/AFRC2017-0233-005 。

## 米粒细节（`granules-tile.jpg`）

Hinode/SOT 2007-01-05 G 波段米粒组织观测，NASA/GSFC Scientific Visualization Studio（Tom Bridgman），https://svs.gsfc.nasa.gov/4061/ 。裁掉一个小孔和日期文字后做成无缝平铺贴图，凑近时叠加在球面上。

## 复用素材

- `../textures/starfield.jpg`、`../textures/moon.jpg`：Solar System Scope，CC BY 4.0。
- `vendor/`：Three.js r128 及其 examples 里的 OrbitControls、EffectComposer、UnrealBloomPass，MIT 许可。

## 处理过的地方

- 紫外和磁图颜色是 NASA 伪彩。
- 临边昏暗、辉光、米粒翻涌、较差自转（Snodgrass 公式）是代码加的光照和动画，自转已加速。
- 背面的照片比正面早几天到几周，太阳活动区会变化，所以拼缝附近可能有轻微不连续。

## 重新生成

```bash
python3 tools/fetch-sdo.py <下载目录> 2026-10-23T12:00
# 把 eclipse.jpg 和 ../sun-lab/assets/granules-observation.jpg 也放进 <下载目录>
python3 tools/build-textures.py <下载目录>
```

旁白：`narration.py` 改文本，`.venv/bin/python generate-audio.py` 用小晓（edge-tts 7.3.1）生成 MP3 和 `narration.js`。
