# 真实的地球：素材与做法

页面复用 `../explorer/` 的星球探索引擎。本目录只放地球的数据、外观、24 个场景、照片和旁白。

“长什么样”使用真实地表达面、夜间灯光与云图，代码负责太阳光照、昼夜过渡、海面高光、大气边缘和动画。“里面是什么”以及板块、火山、地球形成等动态过程是科学模型示意，不是钻进地球拍到的照片；大小、距离和时间压缩会在场景或“家长看”中说明。

## 球面贴图（`assets/textures/`，由 `tools/build-textures.py` 生成）

全部来自 NASA，公有领域：

| 文件 | 内容 | 来源 |
|---|---|---|
| `day-8k.jpg`、`day-4k.jpg` | Blue Marble Next Generation，2004 年 7 月，无阴影真实颜色 | NASA Earth Observatory 图像编号 74092 |
| `night-8k.jpg`、`night-4k.jpg` | Black Marble 2016 夜间灯光 | NASA Earth Observatory 144898 |
| `clouds-8k.jpg`、`clouds-4k.jpg` | Blue Marble 云图 cloud_combined_8192 | NASA Visible Earth 57747 |
| `normal-8k.jpg`、`normal-4k.jpg` | 由 GEBCO 2008 陆地高程（73934）算出的法线贴图 | NASA Visible Earth / GEBCO |
| `ocean-4k.png` | 由 GEBCO 2008 海底深度（73963）得到的海洋遮罩 | NASA Visible Earth / GEBCO |

原图下载地址：`https://eoimages.gsfc.nasa.gov/images/imagerecords/` 下的 74000/74092、144000/144898、57000/57747、73000/73934、73000/73963。重新生成：

```bash
python3 tools/build-textures.py <放原图的目录>
```

其他复用：`../textures/moon.jpg`、`mars.jpg`、`sun.jpg`、`starfield.jpg`（Solar System Scope，CC BY 4.0），`deep-sky/orion_m42.jpg`（哈勃，NASA/ESA），`../explorer/vendor/`（Three.js r128，MIT）。

夜景、云图都是拼合图，不代表页面打开时的实时地球；自转、公转与场景动画均经过加速。

## 真实照片（`assets/photos/`）

| 文件 | 内容 | 来源与许可 |
|---|---|---|
| `blue-marble.jpg` | 1972-12-07 阿波罗 17 号飞向月球途中拍摄的“蓝色弹珠”，NASA 编号 AS17-148-22727 | NASA Johnson Space Center；NASA 说明 https://science.nasa.gov/earth/earth-observatory/the-blue-marble-from-apollo-17-1133/ ；经 Wikimedia Commons 文件缩小 https://commons.wikimedia.org/wiki/File:The_Earth_seen_from_Apollo_17.jpg |
| `typhoon-soudelor.jpg` | 2015-08-04 NASA Aqua 卫星 MODIS 拍到的超强台风苏迪罗（从正上方拍），以风眼为中心裁成方形；同一张图的 2048 像素版 `textures/typhoon-decal.jpg` 贴在 3D 地球上 | NASA Goddard，NASA 图库编号 GSFC_20171208_Archive_e000672 |
| `volcano.jpg` | 夏威夷 Puʻu ʻŌʻō 火山与岩浆 | USGS Hawaiian Volcano Observatory；Wikimedia Commons 文件与来源说明 https://commons.wikimedia.org/wiki/File:Puu_Oo_cropped.jpg |

极光场景复用 `../sun-3d/assets/photos/aurora-iss.jpg`：NASA，2024-10-30 国际空间站拍摄。星云场景复用上述哈勃猎户座大星云素材。

## 场景里用到的真实地点和数据

- 台风：贴在东经 140°、北纬 17° 附近（苏迪罗当天的大致位置），从上往下看逆时针转。
- 陆地：喜马拉雅山脉、撒哈拉沙漠、亚马孙雨林、华北平原、南极冰盖都按真实经纬度飞过去看，太阳从东边斜照，地形起伏来自 GEBCO 高程。
- 麦哲伦船队：按真实航点（西班牙 → 麦哲伦海峡 → 太平洋 → 关岛 → 菲律宾马克坦岛 → 香料群岛 → 好望角 → 西班牙）沿大圆弧连线。
- 月食：地球本影在月球距离处的半径约 0.73 个地球半径，影子边缘按这个画在月亮上。帆船场景里海面的弯曲程度放大了。

## 旁白

`narration.py` 是唯一旁白文本来源。用 `zh-CN-XiaoxiaoNeural`、语速 `-5%` 预生成 94 条 MP3，浏览器 Web Speech 只做兜底。修改文本后运行：

```bash
../sun-3d/.venv/bin/python generate-audio.py
```

生成器会跳过文本未变化的音频，并更新 `narration.js` 和 `audio/manifest.json`。
