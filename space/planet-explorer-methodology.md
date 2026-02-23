# 星球探险家系列 — 创作方法论与实施计划

## 一、创作背景

柳智天（5岁）和爸爸一起在B站看了一套太阳系科普视频（BV1Wd4y1r7UE，共15集），
爸爸希望把每集学到的知识，用互动程序做成"复习闯关"，在复习天文知识的同时融入汉字学习和10以内数学。

---

## 二、从一个视频到一个互动页面 — 完整创作流程

以第4集《月球》为例，记录从 B站视频 → 互动闯关页面的全过程：

### Step 1：看视频 + 口头总结知识点
```
爸爸看完视频后，告诉 Claude：
"这集讲了月球引力、大碰撞形成、潮汐锁定、人类登月、月球表面、没有空气"
```
**关键**：不需要逐字转述视频内容，只需要列出"这10分钟讲了哪几个知识点"。

### Step 2：Claude 研究现有代码库
```
自动扫描已有代码，理解项目的：
├── 3D 渲染模式（Three.js + 真实纹理 ShaderMaterial）
├── 儿童闯关模式（kids.js 的 levelsData 结构）
├── 汉字学习模式（planetWords + pictographDrawers）
├── 语音方案（Edge-TTS 预生成 MP3 + Web Speech fallback）
└── 已有纹理（textures/moon.jpg 等）
```

### Step 3：设计6大章节内容
```
每个视频知识点 → 一个章节，每章包含：
┌────────────────────────────────────┐
│  科普故事（2-3条大字卡片 + 语音朗读）  │
│         ↓                          │
│  汉字学习（2个字 + 拼音 + 组词 + 象形图）│
│         ↓                          │
│  知识测验（3选1 + 答错提示）          │
│         ↓                          │
│  数学挑战（3选1, 10以内加减法）        │
│         ↓                          │
│  获得星星 ⭐ → 解锁下一章             │
└────────────────────────────────────┘
```

### Step 4：实现 3 个文件
```
space/xxx.html  — 页面骨架（Loading、3D容器、所有面板的 HTML + CSS）
space/xxx.js    — 3D场景 + 章节数据 + 闯关逻辑 + 语音 + 存档
index.html      — 添加入口卡片
```

### Step 5：生成语音
```bash
# 创建 generate-xxx-audio.py，用 Edge-TTS 生成全部 MP3
cd space && python3 generate-xxx-audio.py
# 输出到 audio/xxx/ 目录，JS 中用 playAudio(path, fallback) 播放
```

### Step 6：自测验证
```
python3 -m http.server 8765
→ Playwright 打开页面 → 逐章点击验证 → 检查控制台零错误 → 截图确认视觉效果
```

---

## 三、B站视频系列全15集目录

视频链接：https://www.bilibili.com/video/BV1Wd4y1r7UE/

| 集数 | 标题 | 主题 | 时长 | 已有页面 | 待建页面 |
|------|------|------|------|----------|----------|
| P1 | 如果地球停止了转动 | 地球自转 | 10:44 | earth.html ✅ | — |
| P2 | 地球的里边真的可以住人吗？ | 地球内部结构 | 8:22 | earth.html（结构模式）✅ | — |
| P3 | 太阳为什么会发出刺眼的光芒？ | 太阳 | 9:56 | — | **sun.html** |
| P4 | 月球上是不是有人居住呢？ | 月球 | 9:29 | moon.html ✅ | — |
| P5 | 远看火星 | 火星 | 9:44 | — | **mars.html** |
| P6 | 寻找好奇号 | 火星探测器 | 10:12 | — | （可合并到 mars.html）|
| P7 | 水星之旅 | 水星 | 8:38 | — | **mercury.html** |
| P8 | 金星是金色的吗？ | 金星 | 9:07 | — | **venus.html** |
| P9 | 木星为什么不发光 | 木星 | 9:05 | — | **jupiter.html** |
| P10 | 美丽的土星 | 土星 | 9:25 | — | **saturn.html** |
| P11 | 天王星之旅 | 天王星 | 9:31 | — | **天王星（可选）** |
| P12 | 海王星的故事 | 海王星 | 8:30 | — | **neptune.html** |
| P13 | 流浪的小行星 | 小行星/矮行星 | 9:57 | asteroid-impact.html（部分）| **asteroid.html** |
| P14 | 彗星和流星雨 | 彗星/流星 | 8:46 | — | **comet.html** |
| P15 | 冲出太阳系 | 太阳系边缘 | 9:58 | — | （可选）|

### 优先级排序（推荐先做）

**第一批（核心行星，纹理已有）**：
1. P3 太阳 → `sun.html`
2. P5+P6 火星 → `mars.html`
3. P9 木星 → `jupiter.html`
4. P10 土星 → `saturn.html`

**第二批（补齐八大行星）**：
5. P7 水星 → `mercury.html`
6. P8 金星 → `venus.html`
7. P12 海王星 → `neptune.html`
8. P11 天王星 → `uranus.html`（可选）

**第三批（特殊主题）**：
9. P13 小行星 → `asteroid.html`
10. P14 彗星和流星雨 → `comet.html`

---

## 四、每个星球页面的标准模板

### 文件清单
```
space/
├── {planet}.html           # 页面骨架
├── {planet}.js             # 3D + 章节 + 交互
├── generate-{planet}-audio.py  # Edge-TTS 音频生成
└── audio/{planet}/         # MP3 文件目录
    ├── ch1-story-1.mp3
    ├── ch1-hanzi-1.mp3
    ├── ch1-quiz.mp3
    ├── ...
    └── final-badge.mp3
```

### 章节数据结构（每个星球 6 章）
```javascript
{
    id: 1,
    title: '章节标题',
    icon: '🔥',
    desc: '一句话描述',
    stories: ['故事1（含<span class="highlight">关键词</span>）', '故事2', '故事3'],
    hanzi: [
        { char: '字', pinyin: 'zì', words: '组词1 · 组词2', sentence: '造句', pictograph: 'drawXxx' }
    ],
    quiz: { question: '问题？', options: [{text, correct}], hint: '提示' },
    math: { question: '算术？', options: [{text, correct}], hint: '提示' }
}
```

### 测验与数学设计规范

**答案位置必须岔开**：6 章的正确答案位置不能全在同一个选项，必须在 A/B/C 之间均匀分布。推荐模式：

```
         第1章  第2章  第3章  第4章  第5章  第6章
知识测验:   A     C     B     A     C     B
数学挑战:   B     A     C     B     A     C
```

规则：
- 相邻两章的知识测验正确位置不同
- 相邻两章的数学挑战正确位置不同
- 同一章内，知识测验与数学挑战的正确位置不同

**数学题必须在 10 以内**：所有加减法算式的数字和结果都不超过 10。
- ✅ `3 + 4 = 7`、`6 - 1 = 5`、`2 + 5 = 7`
- ❌ `30 - 27 = 3`（虽然结果是3，但涉及了27和30）

### 3D 场景标准
- 纹理：`textures/{planet}.jpg`（已有）
- Shader：参照 `app.js` 的 `createTexturedPlanet()` 配置
- 背景：星空粒子 3000 颗
- 远处参照天体：如火星页面远处放小地球

### 配色主题
| 星球 | 主色 | CSS 变量名 |
|------|------|-----------|
| 太阳 | 金橙 #FFB300 | --sun-gold |
| 火星 | 铁锈红 #C1440E | --mars-red |
| 木星 | 褐黄 #C88B3A | --jupiter-brown |
| 土星 | 淡金 #E8D5A3 | --saturn-gold |
| 水星 | 灰银 #8C8C8C | --mercury-gray |
| 金星 | 琥珀黄 #D4A017 | --venus-amber |
| 海王星 | 深蓝 #1A5276 | --neptune-blue |
| 天王星 | 青蓝 #5DADE2 | --uranus-cyan |

---

## 五、并行实施方案

可以同时启动多个 Agent，每个 Agent 独立创建一个星球页面：

```
Agent 1: sun.html     (太阳 — P3)
Agent 2: mars.html    (火星 — P5+P6)
Agent 3: jupiter.html (木星 — P9)
Agent 4: saturn.html  (土星 — P10)
```

每个 Agent 的任务：
1. 根据视频集数和知识点，编写 6 章内容
2. 创建 {planet}.html + {planet}.js
3. 创建 generate-{planet}-audio.py 并运行生成 MP3
4. 修改 index.html 添加入口卡片
5. 自测验证

**注意**：多 Agent 同时修改 index.html 会冲突，建议最后由主 Agent 统一添加入口。

---

## 六、汉字分配方案

避免各星球重复使用相同汉字，总计需要 12字/星球 × 8星球 = 96 字。
以下基于 kids.js 已有数据 + 新增，按星球主题分配：

| 星球 | 12个汉字（6章×2字） |
|------|-------------------|
| 月球 ✅ | 月、大、石、星、天、地、人、飞、山、土、风、空 |
| 太阳 | 日、火、光、热、红、明、金、亮、力、能、阳、白 |
| 火星 | 沙、尘、车、轮、冰、水、干、冷、远、近、色、红 |
| 木星 | 云、雷、雨、木、目、口、耳、手、环、圈、气、电 |
| 土星 | 冰、石、花、美、小、中、上、下、里、外、圆、方 |
| 水星 | 快、慢、早、晚、黑、白、长、短、多、少、前、后 |
| 金星 | 心、热、厚、薄、高、低、开、关、左、右、出、入 |
| 海王星 | 鱼、门、井、深、暗、蓝、冰、寒、波、浪、海、洋 |

> 注：部分汉字可能在 kids.js 的 pictographDrawers 中已有绘制函数，可直接复用。

---

## 七、参考代码索引

| 功能 | 参照文件 | 说明 |
|------|---------|------|
| 月球纹理 shader | app.js:1413-1442 | 标准天体 shader |
| 汉字数据结构 | kids.js:935-1007 | planetWords |
| 象形图绘制 | kids.js:1010-1503 | pictographDrawers |
| 闯关数据结构 | kids.js:7-64 | levelsData |
| Edge-TTS 脚本 | generate-moon-audio.py | 音频生成模板 |
| 页面 HTML 结构 | moon.html | 完整页面模板 |
| 3D 场景 + 交互 | moon.js | JS 完整模板 |
| 纹理文件 | textures/*.jpg | 已有全部行星纹理 |
|  |  |  |
