# 地球与木星内部的 Blender 模型

这次只替换 earth-3d、jupiter-3d 的“里面是什么”内部画面。保留原深度条、温度计、卡片、MP3 旁白和其他模块。太阳继续使用自己的 sun-interior.js；公共 dive.js 不再修改。

## 渲染与维护

- `blender-interior.js` 是两个页面主动加载的接入器，通过已有 `ctx.hooks.diveView` 接口接管内部镜头。退出后复原外观、色彩、裁剪距离、控制器和辉光设置。
- 两个页面的 `earth-interior.js` / `jupiter-interior.js` 定义每站镜头、剖面显示比例和流动范围。显示内容统一跟随原深度参数，不另建播放进度。
- 第一次进入内部才加载本地 GLB。任一必需素材失败时保留原剖面，显示重试按钮；加载结束不会切换用户所在模块。
- 模型包含 Blender 生成的真实网格、烘焙颜色与法线贴图。浏览器只做光照、镜头、材质渐隐和动画。木星云体由 Cycles 离线体积渲染，再以多个面向镜头的图面摆在三维空间中；这不是实时体积流体求解。
- 鼠标/触摸旋转和缩放在到站后可用。“看整体剖面”切回全局定位，“回到这一层”恢复近景；“暂停运动”冻结箭头、光点、流场、云体和闪电。系统减少动态效果时默认暂停。
- `interior-source/*.blend` 保留可编辑工程和打包纹理。`.blend1` 等自动备份不提交。

在仓库根目录使用 Blender 5.2：

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python space/explorer/tools/build-planet-interiors.py -- earth
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python space/explorer/tools/build-planet-interiors.py -- jupiter
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python space/explorer/tools/render-interior-cloud.py
```

已有 JPG 烘焙结果会复用；需要重做材质时在第一、第二条末尾加 `--rebake`。生成器使用独立 Blender 场景，不读取用户正在编辑的工程。Cycles 检查图输出到忽略目录 `output/playwright/`。

## 科学边界与场景约定

视点为假想可移动观察者，时代为现代内部结构模型。内部没有可供取用的实拍照片，纹理、照明、色彩和运动均为教学示意；表面贴图沿用各页面 CREDITS 的观测素材。木星的蓝色用于区分金属氢，不能解释为其真实可见颜色。流动曲线和光点表示路径，不是管道、真实发光颗粒或单个原子。

| 页面 / 深度站 | 画面要表达的事实 | 比例与运动约束 | 核对重点 |
|---|---|---|---|
| 地球 / 地壳 2 | 薄岩石外壳包围内部各层 | 总览按半径近似比例；地壳厚度采用约 35 km 示意，不代表全球等厚 | 真实表面、薄壳及多层切面可旋转查看 |
| 地球 / 上、下地幔 3、4 | 地幔主要为固态岩石，可长期缓慢变形 | 分界约 660 km、2890 km；箭头大幅加速，无真实速度比例 | 岩石材质持续存在，箭头显示循环方向，不画整体熔岩海 |
| 地球 / 外核 5 | 液态铁镍流动 | 内核与外核边界约 1221 km、3480 km 半径；时间压缩 | 流线和光点移动，内核仍可定位 |
| 地球 / 内核 6 | 高压下保持固态的铁镍 | 镜头放大观察，金色及起伏为示意 | 固体球体不参与液态流动 |
| 木星 / 深层大气 2 | 云雾深处没有地面 | 大气云体与闪电的时间、距离压缩 | 有前后层次，闪光柔和，暂停后停止 |
| 木星 / 液态氢、金属氢 3、4 | 物质随压力逐渐变化，金属氢是导电流体 | 近似区域边界为 0.95R、0.8R；这些并非测得的硬壳 | 近景没有硬边界，流体沿三维路径运动 |
| 木星 / 稀释核心 5 | 重物质逐渐与氢氦混合 | 中心混合区取约 0.4R 示意；不同模型范围不同 | 不存在实心核心球面；云体与流动相互混合 |

木星整体模型保留约 0.935 的极/赤道半径比。整体剖面上的分色用于定位，其切面不代表真实墙壁；近景会隐去这些定位面。各层温度与旁白继续沿用当前页面数据，内部深处的温度为范围或估计。

## 原始资料

核对日期：2026-10-27。

- NASA Earth Facts：<https://science.nasa.gov/earth/facts/>，地核成分、液态外核与固态内核。
- USGS This Dynamic Earth，Inside the Earth：<https://pubs.usgs.gov/gip/dynamic/inside.html>，层次与尺度。
- USGS Are tectonic plates floating on magma?：<https://www.usgs.gov/faqs/are-tectonic-plates-floating-magma>，地幔主要固态与长期塑性变形。
- NASA Jupiter Facts：<https://science.nasa.gov/jupiter/jupiter-facts/>，无固体地面、液态氢、金属氢与混合核心。
- Juno 任务团队 Jupiter’s Dilute Core：<https://www.missionjuno.swri.edu/science-findings/jupiters-dilute-core>，模糊核心与内部模型的不确定性。

Three.js r128 `GLTFLoader.js` 来自官方 examples/js/loaders/GLTFLoader.js，MIT 许可，许可文本复用 `vendor/LICENSE`。
