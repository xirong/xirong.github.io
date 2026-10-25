# 星球探索引擎

> 要做新星球？先读 [PLANET-GUIDE.md](PLANET-GUIDE.md)：做法、检查流程、地球页踩过的坑、木星方案。

太阳、行星、卫星的 3D 知识页面共用这套引擎。现有用户是 `../sun-3d/` 和 `../earth-3d/`。

## 每个星球页面由什么组成

| 文件 | 内容 | 每颗星球都要写？ |
|---|---|---|
| `explorer/engine.js` | 渲染器、镜头、辉光、星空、知识地图、模块切换、小晓旁白、字幕、家长看 | 共用 |
| `explorer/dive.js` | “里面是什么”：剖开、深度条、温度计、逐层介绍 | 共用 |
| `explorer/stage.js` | 场景模块：知识点卡片、步骤图标、动手按钮、滑块、照片、“考考我”、星星 | 共用 |
| `xxx-3d/xxx-stages.js` | 每个知识点的 3D 场景（`ctx.hooks.stages[场景 id]`） | ✅ |
| `explorer/explorer.css` | 全部界面样式 | 共用 |
| `xxx-3d/xxx-data.js` | `window.BODY`：知识地图、钻进去的停靠点、剖面分层 | ✅ |
| `xxx-3d/xxx-look.js` | 星球外观（真实贴图 + shader）和“长什么样”模块 | ✅ |
| `xxx-3d/narration.py` | 旁白文本；`generate-audio.py` 生成 MP3 和 `narration.js` | ✅ |
| `xxx-3d/index.html` | 画布、外观模块的按钮、家长看内容、按顺序引入脚本 | ✅ |

## 知识地图

`BODY.map` 固定九格，所有星球用同一套分类，孩子换一颗星球也知道去哪儿找：

长什么样 · 里面是什么 · 有多大多重 · 怎么动 · 会发生什么 · 和我们的关系 · 一生的故事 · 谁去研究过 · 闯关复习

每格三种状态：`module`（已做好的模块）、`href`（链接到网站里已有的页面）、都不写（显示“快来啦”）。

`module: 'stage'` 的格子从 `BODY.stages[格子 id]` 读知识点列表，每个知识点：

```js
{ id, icon, title, sub,                        // 讲解文字放在 narration.py 的 NARRATION[id]
  photo: { src, credit },                      // 可选：真实照片，点一下放大
  actions: [{ id, label }],                    // 可选：动手按钮，按下时说 NARRATION[id_按钮id]
  slider: { min, max, value, label, unit },    // 可选：滑块
  quiz: { options: [...], answer: 下标 } }     // 题目是 NARRATION['q_' + id]
```

3D 场景函数 `api => ({ update, action(id), slider(v), exit })`，`api.root` 里的东西切换时自动清掉；`api.fly(位置, 看向)`、`api.live(html)` 实时读数、`api.extra(html)` 卡片插图。当前主星球可用 `ctx.hooks.sun.setVisible(false)` 藏起来（这个历史接口名在太阳和地球页共用）。

## 写一个外观脚本

```js
window.EarthLook = {
  setup(ctx) {
    // 1. 用 ctx.loadTex 加载真实贴图，建球体加进 ctx.scene
    // 2. 表面 shader 拼上 ctx.cut.glsl，main() 开头调用 cutDiscard(世界坐标)，
    //    uniforms 里合并 ctx.cut.uniforms —— 这样“钻进去”才能把球剖开
    // 3. 提供 ctx.hooks.setLook(名字)，钻进去的停靠点会调用它换外观
    // 4. Explorer.registerModule('look', () => ({ panel, enter, exit }))
    // 5. ctx.onFrame((now, dt, rawDt) => { ... }) 做每帧动画
    return Promise; // 第一张贴图加载好后 resolve
  },
};
```

## 钻进去的数据

```js
dive: {
  stops: [   // 从外到内，一站一站
    { id, name, r, t, temp, fact,     // r 镜头离球心距离（星球半径 = 1），t 温度计的代表温度
      look, aim,                       // 在球外：换哪种外观、镜头转向边缘多少
      open, at, elev, yaw, layer },    // 剖开后：对准哪儿、镜头角度、高亮哪一层
  ],
  interior: [ { id, r0, r1, c0, c1, pattern } ],   // 1 岩石对流 / 2 辐射 / 3 核聚变 / 4 液态外核对流 / 0 素色
}
```

旁白 key：`map`、`soon`、`look`、`dive_intro`、每站的 `dive_<站 id>`、`quiz_right`、`quiz_try`，以及每个场景的 `<场景 id>`、`<场景 id>_<按钮 id>`、`q_<场景 id>`。

## 调试

浏览器控制台里 `__explorer` 就是 ctx，例如 `__explorer.go('inside')`。改了 css/js 记得把 `index.html` 里的 `?v=` 版本号改掉，否则浏览器会用旧缓存。
