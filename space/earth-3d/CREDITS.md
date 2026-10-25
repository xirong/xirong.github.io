# 真实的地球：素材与做法

页面复用 `../explorer/` 的星球探索引擎。本目录只放地球的数据、外观、24 个场景、照片和旁白。

“长什么样”使用真实地表达面、夜间灯光与云图，代码负责太阳光照、昼夜过渡、海面高光、大气边缘和动画。“里面是什么”以及板块、火山、地球形成等动态过程是科学模型示意，不是钻进地球拍到的照片；大小、距离和时间压缩会在场景或“家长看”中说明。

## 球面贴图

复用 `../textures/`：

- `earth_daymap.jpg`、`earth_nightmap.jpg`、`earth_clouds.jpg`、`earth_specular.jpg`：Solar System Scope，CC BY 4.0，https://www.solarsystemscope.com/textures/ 。
- `moon.jpg`、`mars.jpg`、`starfield.jpg`：Solar System Scope，CC BY 4.0。
- `deep-sky/orion_m42.jpg`：哈勃，NASA/ESA，复用网站已有素材。
- `../explorer/vendor/`：Three.js r128 及 examples 组件，MIT 许可。

夜景和云图是观测合成素材，不代表页面打开时的实时地球；自转、公转与场景动画均经过加速。

## 真实照片（`assets/photos/`）

| 文件 | 内容 | 来源与许可 |
|---|---|---|
| `blue-marble.jpg` | 1972-12-07 阿波罗 17 号飞向月球途中拍摄的“蓝色弹珠”，NASA 编号 AS17-148-22727 | NASA Johnson Space Center；NASA 说明 https://science.nasa.gov/earth/earth-observatory/the-blue-marble-from-apollo-17-1133/ ；经 Wikimedia Commons 文件缩小 https://commons.wikimedia.org/wiki/File:The_Earth_seen_from_Apollo_17.jpg |
| `hurricane.jpg` | 2003 年国际空间站拍摄的伊莎贝尔飓风 | NASA；Wikimedia Commons 文件与来源说明 https://commons.wikimedia.org/wiki/File:Hurricane_Isabel_from_ISS.jpg |
| `volcano.jpg` | 夏威夷 Puʻu ʻŌʻō 火山与岩浆 | USGS Hawaiian Volcano Observatory；Wikimedia Commons 文件与来源说明 https://commons.wikimedia.org/wiki/File:Puu_Oo_cropped.jpg |

极光场景复用 `../sun-3d/assets/photos/aurora-iss.jpg`：NASA，2024-10-30 国际空间站拍摄。星云场景复用上述哈勃猎户座大星云素材。

## 旁白

`narration.py` 是唯一旁白文本来源。用 `zh-CN-XiaoxiaoNeural`、语速 `-5%` 预生成 94 条 MP3，浏览器 Web Speech 只做兜底。修改文本后运行：

```bash
../sun-3d/.venv/bin/python generate-audio.py
```

生成器会跳过文本未变化的音频，并更新 `narration.js` 和 `audio/manifest.json`。
