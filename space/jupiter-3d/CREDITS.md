# 真实的木星：素材、许可与处理

## 主全球贴图（`assets/textures/jupiter-*.jpg`）

- 原图：Björn Jónsson，14400×7200 简单圆柱投影地图。
- 下载：https://planetary.s3.amazonaws.com/web/assets/pictures/20180511_jupiter_map_css_plus_juno_bj.jpg
- 素材页：https://www.planetary.org/space-images/merged-cassini-and-juno
- 制作说明：https://www.planetary.org/articles/0514-juno-meets-cassini-a-new
- 署名：NASA/JPL-Caltech/SSI/SwRI/MSSS/ASI/INAF/JIRAM/Björn Jónsson。
- 许可：素材页明确标注 **Creative Commons Attribution 3.0 Unported（CC BY 3.0）**。

中低纬来自 Cassini 在 2000 年 12 月飞掠时约 100 张照片；极区来自 Juno JunoCam/JIRAM 多次飞掠。不同区域、不同年份的观测被拼成一个更完整的全球图。作者称这种拼合为“fiction”——它不是木星在某一时刻的实拍。页面不把这张图说成实时影像，也不让不同纬度条纹撕裂这张静态地图。

`tools/build-textures.py <源jpg>` 以 LANCZOS 缩放到电脑 8192×4096、手机 4096×2048，JPEG quality=88、optimize、progressive。8K 约 4.5MB，4K 约 1.26MB；30MB 原图不随网页发布。

## 场景照片（`assets/photos/`）

均只缩放到最长边不超过 1600，PNG 模型保留透明通道。局部照片、斜拍照片和艺术图只用于卡片或独立展示，不冒充球面正射贴图。

| 文件 | 内容与来源 | 作者与许可 |
|---|---|---|
| `great-red-spot.jpg` | Juno PJ10 在 2017 年拍摄的大红斑，PIA21395 | NASA/JPL-Caltech/SwRI/MSSS，NASA 公有领域；https://images-assets.nasa.gov/image/PIA21395/PIA21395~orig.jpg |
| `aurora.jpg` | 2014 光学木星与 2016 紫外极光合成，heic1613a | NASA/ESA，CC BY 4.0；https://esahubble.org/images/heic1613a/ |
| `lightning.jpg` | 2018-05-24 Juno SRU 拍到闪电与北部极光椭圆，PIA22968 | NASA/JPL-Caltech/SwRI，NASA 公有领域；https://www.jpl.nasa.gov/images/pia22968-junos-sru-captures-jupiter-lightning/ |
| `sl9.jpg` | 1994 年 SL9 多处撞击痕，Hubble Comet Team | NASA/ESA，公有领域；https://commons.wikimedia.org/wiki/File:Jupiter_showing_SL9_impact_sites.jpg |
| `polar-cyclones.jpg` | Juno 极区气旋观测，PIA26295 | NASA/JPL-Caltech/SwRI/MSSS/ASI/INAF/JIRAM；https://images-assets.nasa.gov/image/PIA26295/PIA26295~orig.jpg |
| `galileo.png` | Galileo 航天器图标/模型，来自 NASA Spacecraft Icons | NASA，公有领域；https://science.nasa.gov/toolkits/spacecraft-icons 与 https://commons.wikimedia.org/wiki/File:Galileo_spacecraft_model.png |
| `juice.jpg` | JUICE 飞掠 Callisto 的艺术想象图 | ESA/ATG Medialab，CC BY-SA 3.0 IGO；https://commons.wikimedia.org/wiki/File:Juice_flyby_of_Callisto_artists_impression.jpg |
| `europa-clipper.png` | Europa Clipper 航天器图标/模型，来自 NASA Spacecraft Icons | NASA/JPL，公有领域；https://commons.wikimedia.org/wiki/File:Europa_Clipper_spacecraft_model.png |
| `europa.jpg` | 木卫二近似真实色全球马赛克，PIA19048 | NASA/JPL-Caltech/SETI，公有领域；https://commons.wikimedia.org/wiki/File:PIA19048_realistic_color_Europa_mosaic_(original).jpg |

## 复用网站已有素材

- `../textures/io.jpg`、`europa.jpg`、`ganymede.jpg`、`callisto.jpg`、`earth_daymap.jpg`、`moon.jpg`、`sun.jpg`、`starfield.jpg`：真实星球贴图，来源见 `../textures/README.md`（Solar System Scope，CC BY 4.0；个别任务图按原说明）。
- `../textures/deep-sky/orion_m42.jpg`：NASA/ESA Hubble，用于形成背景示意。
- `../textures/stars/red_supergiant_surface.jpg`：由 ESO 参宿四观测图派生，用于红巨星示意。
- `../explorer/vendor/`：Three.js r128 及 examples 组件，MIT 许可。

## 科学模型与事实来源

- NASA 木星事实：https://science.nasa.gov/jupiter/facts/
- NASA 行星数据表：https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html 。上层大气温度采用 0.1 bar 处 112 K（约 -161℃）的代表值，不把真空写成有气温；体重采用 1 bar 赤道视重 23.12 / 9.78 ≈ 2.364 倍，区别于未计自转的平均重力比 2.640。
- NASA 当前卫星页（115 颗）：https://science.nasa.gov/jupiter/jupiter-moons/
- NASA Juno：https://science.nasa.gov/mission/juno/（任务主页的 2025 年计划已不是最新状态）
- NASA 2026-05-05 发布朱诺号 2026-05-01 飞掠 Thebe 的新观测：https://science.nasa.gov/photojournal/nasas-juno-misson-captures-jupiter-moon-thebe/ 。因此页面不写“2025 年已结束”。
- 朱诺任务团队 2025 年 EPSC-DPS 摘要（EM2 计划自 2025 年 10 月起持续三年；当时提案仍在审查）：https://ui.adsabs.harvard.edu/abs/2025epsc.conf..158B/abstract 。页面仅写“任务团队计划探测到 2028 年”，不把计划写成已经完成的任务。
- Europa Clipper 时间线：https://science.nasa.gov/mission/europa-clipper/mission-timeline/
- 天问四号计划的信息核对采用 2026-04-24 人民日报客户端报道；页面只写“计划 2030 年前后发射”，不写未确定的抵达时间。

内部层次、形成、迁移、撞击和未来动画均为科学模型示意；近似边界不代表固体壳，假说与估计会明确标注。小天体、轨道、距离和排布为便于理解而压缩的场景会在卡片中说明。

## 旁白

全部文本集中在 `narration.py`，用 `zh-CN-XiaoxiaoNeural`、rate `-5%` 生成 MP3。运行 `../sun-3d/.venv/bin/python generate-audio.py` 可增量更新 `narration.js` 与 `audio/manifest.json`；不再使用的 key 与音频应同步删除。
