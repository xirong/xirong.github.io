# 太阳系 Blender 几何 catalog

`models.glb` 是 `solar-system.html` 的天体与人造卫星几何库。它只保存 Blender 生成的网格、UV、法线和默认 PBR 参数，不嵌入任何图片。天然天体网页继续复用现有 `space/textures/` 的真实贴图，因此不会把同一批纹理重复下载到 GLB 中。

## 使用契约

- 用 `GLTFLoader` 加载 `models.glb` 后，按下表的 node 名称提取并 clone 单个模板。不要把整个 catalog scene 直接加入场景，因为所有模板都以原点为中心，会彼此重叠。
- 在 clone 后再单独 clone 材质并设置当前网页的真实贴图。`unitSphere` 和 `icySphere` 故意引用同一份 glTF mesh，若给两者设置不同贴图，必须先复制材质。
- 所有 node 都是 glTF/Three.js 的 Y-up 坐标，几何已烘焙为原点中心。node 本身没有 translation、rotation 或 scale；页面负责轨道位置、自转、行星倾角、环的朝向和动画。
- 所有主体均有 UV。球体是等距经纬 UV；环是径向 UV，`U=0` 为内缘、`U=1` 为外缘、`V=0.5`；环是薄平面，位于 glTF XZ 平面且双面。
- 天然天体的默认材质是非金属 PBR，只提供合理的粗糙度和临时色。它不取代页面的真实纹理、昼夜计算、云层、大气或教学效果。
- `artificial*` 节点也是单一 `Mesh`，但带多个 PBR 材质组来保留金属、白色舱体、深蓝太阳能板、金色部件和 Webb 遮阳罩的可识别分件色。网页应 clone 这些材质组，而不是把整个卫星替换成一个统一球形或单材质。
- 每个人造卫星模板都将**最大顶点到原点的距离归一化为 1.0**。这是页面 `template.geometry.clone().scale(satData.size)` 的单位半径契约，不代表真实米制尺寸。

## 节点清单

| node | 尺寸 / 形状 | 当前网页映射或用途 |
| --- | --- | --- |
| `unitSphere` | 半径 1，96×64 平滑 UV 球 | 水星、金星、地球、火星、谷神星、海王星、冥王星、鸟神星、阋神星、太阳等近球形本体 |
| `icySphere` | 与 `unitSphere` 共用 mesh | 月球、Io、Europa、Ganymede、Callisto、Titan、Enceladus、Rhea、Miranda、Titania、Oberon、Triton、Charon 等近球形卫星 |
| `jupiterBody` | 半径 `(X,Y,Z)=(1,.935,1)` | 木星；Y 为自转短轴 |
| `saturnBody` | 半径 `(1,.900,1)` | 土星；Y 为自转短轴 |
| `haumeaBody` | 半径 `(1,.440,.740)` | 妊神星教学三轴椭球，详见科学边界 |
| `irregularPhobos` / `irregularDeimos` | app.js seed 1.7 / 2.4 | `moonsData.mars[0]` / `[1]` |
| `irregularNix` / `irregularHydra` / `irregularKerberos` / `irregularStyx` | seed 3.1 / 4.2 / 5.3 / 6.4 | `moonsData.pluto[1]` 至 `[4]` |
| `irregularHiiaka` | seed 7.5 | `moonsData.haumea[0]` |
| `irregularMK2` | seed 8.6 | `moonsData.makemake[0]` |
| `irregularDysnomia` | seed 9.7 | `moonsData.eris[0]` |
| `asteroidRock0` … `asteroidRock3` | 四种低面数不规则 icosphere，球面 UV | 小行星带实例化时轮换使用；页面附加已有岩石贴图 |
| `SaturnRings` | XZ 平面，内外半径 `1.40 / 2.30` | 土星主环，页面使用 `textures/saturn_ring.png` |
| `UranusRings` | XZ 平面，`1.35 / 2.75` | 天王星原主环尺度 |
| `UranusInnerRings` | XZ 平面，`1.78 / 1.92` | 天王星原内窄环尺度 |
| `RheaDustRing` / `RheaOuterDustRing` | XZ 平面，`1.55 / 2.35`、`2.38 / 2.55` | 保留当前 `createMoonDustRing()` 的两条相对尺度 |
| `artificialISS` | 单 Mesh，模块、桁架、八块太阳翼、散热器 | `satellitesData[0]`，ISS 教学备用轮廓 |
| `artificialTiangong` | 单 Mesh，三舱、节点、四组太阳翼 | `satellitesData[1]`，天宫教学备用轮廓 |
| `artificialHubble` | 单 Mesh，圆柱光学筒、开口遮光罩、双翼 | `satellitesData[2]`，哈勃教学备用轮廓 |
| `artificialWebb` | 单 Mesh，18 片金色六角镜、五层遮阳罩、总线和太阳翼 | `satellitesData[3]`，Webb 教学备用轮廓 |
| `artificialGPS` | 单 Mesh，紧凑总线、双翼、信号天线 | `satellitesData[4]` 至 `[6]`，通用 GPS 轮廓 |
| `artificialComms` | 单 Mesh，双翼与大口径高增益天线 | `satellitesData[7]`、`[8]`，通用通信卫星轮廓 |
| `artificialWeather` | 单 Mesh，五片太阳翼、仪器圆筒、总线 | `satellitesData[9]`，通用气象卫星轮廓 |
| `artificialBeidou` | 单 Mesh，双翼、导航天线与金色载荷罩 | `satellitesData[10]`，通用北斗导航卫星轮廓 |

## 人造卫星接入契约

页面按 `satellitesData` 的运行时实例选择模板，再 `geometry.clone()` 并以该实例原有的 `size` 缩放。模板节点没有父节点，也没有节点级 translation、rotation 或 scale。

| `satellitesData` 项 | 节点 | 重用数 |
| --- | --- | ---: |
| `国际空间站`，索引 0 | `artificialISS` | 1 |
| `中国空间站`，索引 1 | `artificialTiangong` | 1 |
| `哈勃望远镜`，索引 2 | `artificialHubble` | 1 |
| `韦伯望远镜`，索引 3 | `artificialWebb` | 1 |
| `GPS卫星1` 至 `GPS卫星3`，索引 4–6 | `artificialGPS` | 3 |
| `通信卫星1`、`通信卫星2`，索引 7–8 | `artificialComms` | 2 |
| `气象卫星`，索引 9 | `artificialWeather` | 1 |
| `北斗卫星`，索引 10 | `artificialBeidou` | 1 |

每个卫星节点都有可用 UV，且材质只包含 glTF metallic-roughness PBR 参数，没有图片或纹理引用。`SatelliteMetalPBR`、`SatelliteWhitePBR`、`SatelliteDarkPBR`、`SolarPanelPBR`、`GoldPBR` 和 `SunshieldPBR` 是稳定的材质名称；其中自然天体材质保持 `metallicFactor: 0`，人造卫星材质按分件需要使用非零金属度。

`moonsData` 中当前唯一出现的 `shape: 'irregularRock'` 条目都在表中。Hiʻiaka、MK2、Dysnomia 等远端小卫星没有足够分辨率的逐面观测模型，因此这些节点只能称为**按现有 seed/axisScale 生成的教学不规则网格**，不能表述为其精确真实外形。

当前代码虽然在 Haumea 的说明文字中提到细环，却没有 `hasRings`、运行时环创建器或可保留的半径比例，所以 catalog 不新增 `HaumeaRing`。若页面要把这项事实加入画面，需要在运行时层另行明确环尺度与倾角。

## 科学来源与边界

- 木星 `.935`、土星 `.900` 的归一化扁率，以及 Saturn/Uranus/Rhea 环相对半径，来自本次任务契约和当前 `space/app.js` 的几何配置。它们服务于页面的缩放教学，不是千米单位的测量模型。
- 当前 `app.js` 对 Haumea 只有“快速自转造成长椭球形”的文字，没有数值 `axisScale` 或可复用环几何。因此 `haumeaBody` 的 `(1,.440,.740)` 是明确的教学三轴椭球比例，用来避免把它画成球；不是观测反演的精确轴比。NASA 也说明 Haumea 的快速自转使它呈橄榄球状，且有环和两颗卫星：<https://science.nasa.gov/dwarf-planets/haumea/>。
- `space/textures/` 的纹理来源、许可和署名继续由项目既有规则与 `space/textures/README.md` 管理。catalog 不复制或改写这些素材。
- 小行星 `asteroidRock0` 至 `asteroidRock3` 是通用实例模板，不对应任何命名小行星；纹理和尺寸由网页实例化时赋予。
- 人造卫星不是官方 CAD、测绘模型或可用于工程判断的几何资产。它们是低面数、按外部轮廓和关键部件做出的教学备用模型。ISS 参考 NASA 所列的桁架、加压舱段和八组主太阳翼尺寸关系：<https://www.nasa.gov/international-space-station/space-station-facts-and-figures/>。天宫只按中国载人航天工程公开的天和、问天、梦天三舱组合表达：<https://en.cmse.gov.cn/missions/CMTH/>。
- 哈勃备用模型保留圆柱式光学望远镜和一对太阳翼这一辨识特征，参考 NASA 的构型资料：<https://www.nasa.gov/wp-content/uploads/2015/02/hubble_telescope_diagram.pdf>。Webb 备用模型保留 18 片金色六角主镜、五层遮阳罩、总线和太阳翼，参考 NASA 的部件图：<https://science.nasa.gov/asset/webb/webb-telescope-spacecraft-diagram/>。
- `artificialGPS` 和 `artificialBeidou` 分别只表达“导航卫星”这一类平台，不对应 GPS 或北斗的具体 block/星号。GPS 的任务与星座背景见 <https://www.gps.gov/space-segment>，北斗的官方星座资料见 <https://www.beidou.gov.cn/xt/gfxz/201912/P020230516558050038035.pdf>。`artificialComms` 是通用通信卫星轮廓；`artificialWeather` 只借鉴 NOAA GOES-R 的大型太阳翼、仪器和静止气象任务特征，并不表示任一 GOES 实飞构型：<https://www.nesdis.noaa.gov/our-satellites/currently-flying/geostationary-satellites>。

## 重建与验证

在仓库根目录执行：

```bash
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
  --python space/solar-assets/build_models.py
```

脚本会清空 factory-startup 的临时场景，创建所有模板并导出 `models.glb`。导出前会检查 node 名称、UV、已烘焙的 identity transform、8 个人造模板的单位半径和材料组；导出后会检查 GLB 2.0 header、节点、无图片/纹理引用、所有材质的 PBR 参数、天然天体的非金属约束和小于 2,000,000 bytes 的体积。它不会保存或改动用户当前打开的 Blender 文件。

2026-11-06 的已确认构建结果：Blender 5.2.1 LTS 导出 31 个 node、30 个 unique mesh、73,296 个 unique triangles，`models.glb` 为 1,726,500 bytes，当前导出文件的 SHA-256 为 `8f62bb1082ac53ca2868c4337218617bae5bdf2ade1e167db6435b347fcbe962`。独立 GLB 二进制检查与 clean factory-startup 重新导入均通过。


## 正式页面的接入与验证

`space/solar-realism.js` 在主场景初始化后复用原 Mesh 根对象，只替换其几何与材质；原有轨道、标签、选择和比例功能继续引用这些根对象。共覆盖 13 个行星/矮行星、22 个天然卫星、11 个人造卫星、2,000 个小行星与 3,000 个柯伊伯带岩块。太阳的两种外观、背景恒星、奥尔特云和独立大小对比仍沿用原实现。

- 默认关闭“昼夜明暗”，表面使用均匀展示光和轻微的视角明暗，便于看清贴图；开启时改用位于太阳中心的点光照明。该开关不写入浏览器存储，每次打开默认关闭。
- 地球夜景按表面朝向太阳的方向限制在夜面；云层有独立透明度和缓慢转动。环带用双面散射示意和球形遮挡近似计算行星投影，不是完整的体积散射或全部天体之间的食现象计算。
- Blender 导出的 UV 北极在 V=0，模块将自然天体和岩块 UV 翻转为现有 `TextureLoader.flipY=true` 的约定。官方航天器的自包含材质按 GLTFLoader 的原始 UV/纹理约定加载。
- [ISS、哈勃、韦伯的官方来源及 Blender 处理](artificial/README.md)单独记录。官网模型加载失败时保留 catalog 中对应的教学模型；其余卫星使用教学外形。航天器沿用原页面的示意轨道，并按原 `size` 的 2.8 倍显示，以便辨认部件，不表示与地球的真实比例。
- catalog 加载失败时保留原基础几何，并继续提供新版材质与昼夜开关；页面显示重试按钮。加载成功前先检查全部节点，避免缺失节点造成部分替换。岩块使用八次实例化绘制批次，未为 5,000 个岩块分别建立绘制调用。
- 远端卫星复用的月面/岩石贴图、妊神星比例及土卫五尘埃环均延续页面的教学示意，不能当作这些对象的逐面实测模型或确认存在的环结构。

浏览器验证应覆盖：默认 OFF、ON/OFF 画面差异、地球日夜、土星环影、太阳样式切换、暂停、真实比例/公转、大小对比、手机设置操作、网络中断后的重试及模型数量无重复。官方模型许可与作者署名见上方的来源说明。
