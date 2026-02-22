# CLAUDE.md - 智天学习乐园项目规范

本文件记录项目结构、技术细节和与 Claude 协作开发的规范。

---

## 一、核心工作流程

### 代码完成后必须自测验证

**重要规则**：写完代码后，必须进行自测验证，确认功能正确后再向用户汇报。

#### 网页/前端项目验证流程：

1. **启动本地服务器**（从项目根目录）
   ```bash
   cd /Users/liuxirong/Downloads/vibecoding/Education/xirong.github.io
   python3 -m http.server 8765
   ```

2. **使用 Playwright MCP 打开浏览器验证**
   - 导航到页面：`http://localhost:8765/path/to/file.html`
   - 截图查看渲染效果
   - 测试交互功能（点击、缩放、输入等）
   - 验证各种状态和边界条件

3. **验证完成后**
   - 关闭浏览器
   - 停止服务器：`pkill -f "python3 -m http.server 8765"`
   - 向用户汇报：做了什么、验证了什么、结果如何

#### 为什么要这样做：
- 避免交付有 bug 的代码
- 确保功能符合预期
- 节省用户手动验证的时间
- 提前发现并修复问题

---

## 二、项目概述

**项目名称**：智天的学习乐园（柳智天的教育网站）
**域名**：xirong.github.io
**目标用户**：儿童（柳智天）
**技术栈**：纯前端（HTML/CSS/JavaScript），Three.js 用于 3D 场景

---

## 三、目录结构

```
xirong.github.io/
├── index.html              # 主页 - 学习乐园入口
├── CLAUDE.md               # 本文件 - 项目规范
├── readme.md               # 原始说明文件
│
├── space/                  # 🚀 宇宙探索模块
│   ├── galaxy.html/.js     # 银河系探索（Three.js 3D）
│   ├── solar-system.html   # 太阳系探索
│   ├── earth.html/.js      # 地球探索
│   ├── kids.html/.js       # 儿童版宇宙
│   ├── asteroid-impact.html # 小行星撞击模拟
│   ├── space-words.html    # 宇宙词汇学习
│   ├── app.js              # 通用工具函数
│   └── textures/           # NASA 卫星纹理贴图（地球等天体）
│
├── puzzle/                 # 🧩 拼图游戏模块
│   ├── china.html          # 中国地图拼图
│   ├── us.html             # 美国地图拼图
│   ├── china-map.svg       # 中国地图 SVG
│   ├── us-map.svg          # 美国地图 SVG
│   ├── js/
│   │   ├── puzzle-engine.js    # 拼图引擎
│   │   ├── province-info.js    # 中国省份信息
│   │   ├── china-map-data.js   # 中国地图数据
│   │   └── us-state-info.js    # 美国州信息
│   └── css/style.css
│
├── math/                   # 🔢 数学学习模块
│   ├── num.html            # 数字学习
│   └── make-ten.html       # 凑十游戏
│
├── engineering/            # 🏗️ 工程科普模块
│   ├── beijing-water.html  # 北京排水系统
│   └── elevator.html       # 电梯原理
│
└── etf/                    # 📈 投资工具（成人用）
    ├── index.html          # ETF 工具首页
    └── grid-trading-tool.html # 网格交易工具
```

---

## 四、重点模块详解

### 4.1 宇宙探索模块 (`space/`)

#### 核心文件：galaxy.js

**功能**：交互式银河系 3D 探索，使用 Three.js 实现

**多尺度视图系统**：
| 距离范围 | 视角名称 | 显示内容 |
|---------|---------|---------|
| < 100 | 太阳系近处 | 仅太阳系 |
| 100-400 | 恒星邻域（放大）| 太阳+邻近恒星（真实距离比例） |
| 400-3000 | 太阳系附近 | 银河系尺度恒星标记 |
| 3000-10000 | 猎户臂视角 | 所有恒星系统 |
| 10000-25000 | 银河系全景 | 银河系结构 |
| 25000-80000 | 银河系近邻 | 卫星星系 |
| 80000-200000 | 本星系群 | 仙女座等 |
| > 200000 | 宇宙深处 | 更多星系 |

**关键常量**：
```javascript
const SOLAR_SYSTEM_POS = new THREE.Vector3(5000, 0, 2000); // 太阳系位置
const NEIGHBORHOOD_THRESHOLD = 400;  // 邻域视图切换阈值
const NEIGHBORHOOD_SCALE = 10;       // 邻域视图：1光年 = 10单位
```

**恒星系统数据**：
- Zone A（最近邻居）：半人马座α、巴纳德星、天狼星、天苑四
- Zone B（较远）：TRAPPIST-1、织女星、开普勒-452、参宿四
- 邻域视图额外恒星：罗斯154、拉卡伊9352、鲸鱼座τ、南河三

**恒星颜色编码**：
- 类太阳恒星：金黄色 `#ffcc00`
- 红矮星：橙红色 `#ff6633`
- 蓝白星：蓝白色 `#aaccff`
- 红超巨星：深红色 `#ff4444`
- 有行星系统：绿色脉冲环 `#00ff88`

**重要行为**：
- 点击太阳系区域**不会**跳转到 solar-system.html（已禁用）
- 点击恒星系统会弹出信息卡片
- 相机靠近太阳系时自动切换到邻域放大视图

### 4.2 拼图游戏模块 (`puzzle/`)

- 支持中国省份和美国州拼图
- SVG 格式地图，可交互拖拽
- 包含地理知识信息

### 4.3 数学学习模块 (`math/`)

- `num.html`：数字认识和练习
- `make-ten.html`：凑十游戏，练习加法

### 4.4 工程科普模块 (`engineering/`)

- 北京排水系统可视化
- 电梯原理动画演示

---

## 五、技术规范

### 5.1 Three.js 使用

- CDN 引入：`https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`
- OrbitControls：`https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js`

### 5.2 字体

- 主字体：Noto Sans SC（思源黑体）
- 科技字体：Orbitron
- CDN：`https://fonts.loli.net`

### 5.3 代码风格

- 中文注释
- 函数用 `// ============ 函数名 ============` 分隔
- 配置数据放在文件顶部

### 5.4 真实物体渲染原则：纹理优先，程序化兜底

> **一句话原则**：凡是渲染现实世界中真实存在的东西（天体、地形、建筑等），永远不要用纯代码去"画"它的样子——去网上找它的真实照片/纹理贴图，贴上去，再用代码叠加光照、动画等交互效果。代码擅长算法和交互，但永远画不出大自然本身的样子。

**展开说明**：当需要渲染现实世界中存在的物体（地球、月球、火星、木星等天体，或其他真实物件）时，**优先使用真实纹理贴图**，而不是纯程序化 shader 模拟。

#### 为什么纹理远优于程序化生成

| 对比项 | 真实纹理贴图 | 纯程序化 shader |
|-------|------------|---------------|
| 视觉真实度 | 卫星照片级别，海岸线/地形精确 | 靠数学函数近似，细节失真 |
| 开发效率 | 下载纹理 + 简单采样即可 | 需要大量 noise/fbm 函数调参 |
| 维护成本 | 换一张图即可升级 | 改 shader 参数牵一发动全身 |
| 文件大小 | 2K 纹理约 200-500KB/张 | shader 代码体积小但效果差 |

#### 实践经验（太阳系全天体纹理改造）

本项目太阳系所有天体已完成从纯程序化到真实纹理的改造：

- **改造前**：用 `noise()`/`fbm()`/`hash()` 等数学函数模拟地表（地球大陆、月球陨石坑、木星条纹等），或直接用纯色 `MeshPhongMaterial`，效果不真实
- **改造后**：全部使用 Solar System Scope 卫星照片纹理（2K），通过通用辅助函数 `createTexturedPlanet()` 统一渲染，叠加 ShaderMaterial 实现动态光照（sunDirection）和 Fresnel 大气散射

#### 推荐的纹理来源

- **Solar System Scope**：`https://www.solarsystemscope.com/textures/` — 免费太阳系天体纹理，2K/8K 分辨率
- **NASA Visible Earth**：`https://visibleearth.nasa.gov/` — NASA 官方地球观测图像
- **Three.js 社区资源**：GitHub 上常见的免费纹理集合

#### 纹理 + Shader 混合架构

最佳实践是**纹理提供基础外观，shader 叠加交互效果**：

```
真实纹理（基础层）
  ↓ texture2D() 采样
自定义 Shader（效果层）
  ├── 昼夜光照切换（sunDirection）
  ├── 大气层 Fresnel 边缘发光
  ├── 区域高亮（如国家边界描边）
  ├── 云层（独立球体或 shader 内采样）
  └── 特殊效果（撞击、爆炸等）
```

#### 当前项目纹理目录

```
space/textures/
├── earth_daymap.jpg      # 地球白天（卫星照片，2048x1024）
├── earth_nightmap.jpg    # 地球夜晚（城市灯光）
├── earth_clouds.jpg      # 地球云层
├── earth_normal.jpg      # 法线贴图（地形凹凸）
├── earth_specular.jpg    # 高光贴图（海洋反光）
├── mercury.jpg           # 水星表面
├── venus_atmosphere.jpg  # 金星大气层（用于渲染）
├── venus_surface.jpg     # 金星地表（雷达成像，备用）
├── mars.jpg              # 火星表面
├── jupiter.jpg           # 木星表面（含大红斑和条纹）
├── saturn.jpg            # 土星表面
├── saturn_ring.png       # 土星环（带 alpha 通道）
├── uranus.jpg            # 天王星表面
├── neptune.jpg           # 海王星表面
├── moon.jpg              # 月球表面
└── pluto.jpg             # 冥王星表面
```

#### 天体纹理渲染参数速查

每个天体通过 `createTexturedPlanet()` 渲染，关键差异参数：

| 天体 | 大气层颜色 | 大气强度 | Fresnel 散射 | 特殊处理 |
|------|-----------|---------|-------------|---------|
| 水星 | 无 | — | 极弱灰色 | 无大气层 |
| 金星 | 黄橙色 | 0.3（厚） | 强黄色 | 浓厚大气 |
| 地球 | 蓝色 | 0.35 | 蓝色 | 独立函数，含云层球体 |
| 火星 | 橙红色 | 0.2（薄） | 橙红色 | 稀薄大气 |
| 木星 | 土黄色 | 0.15 | 弱土黄 | — |
| 土星 | 淡黄色 | 0.15 | 弱黄色 | 带纹理光环 |
| 天王星 | 青蓝色 | 0.25 | 青色 | — |
| 海王星 | 深蓝色 | 0.3 | 蓝色 | — |
| 冥王星 | 无 | — | 极弱灰色 | 无大气层 |
| 月球 | 无 | — | — | 独立创建，同步自转 |

> 未来添加新天体时，从 Solar System Scope 下载 2K 纹理到 `space/textures/`，然后调用 `createTexturedPlanet()` 即可，无需重复编写 shader。

#### 新增天体的标准流程

1. **下载纹理**：从 Solar System Scope 下载 2K JPG（`https://www.solarsystemscope.com/textures/download/2k_xxx.jpg`）
2. **验证格式**：`file textures/xxx.jpg` 确认是 JPEG（有些实际是 TIFF，需 `sips -s format jpeg` 转换）
3. **创建渲染函数**：调用 `createTexturedPlanet(size, config)` 配置纹理路径、大气参数
4. **注册路由**：在 `createPlanets()` 的 `realisticCreators` 对象中添加映射
5. **shader 更新自动生效**：动画循环已统一处理所有 `sunDirection`/`time` uniform

#### 注意事项

- 纹理分辨率：2K（2048x1024）对 Web 场景足够，8K 文件太大不适合前端
- Solar System Scope 纹理许可：CC BY 4.0（需署名 INOVE / Solar System Scope）
- 不是所有天体都有纹理（如冥王星），可用同站 fictional 纹理替代
- 云层如需独立旋转，建议用单独的 `THREE.Mesh` 球体（半径略大于地球，如 `radius * 1.02`）
- 如果 shader 中有覆盖效果（如尘埃、爆炸）需要盖住云层，则将云层采样放在 shader 内而非独立球体

---

## 六、常见问题

### Q: 恒星系统为什么看起来距离太阳很近？
A: 需要使用多尺度视图系统。银河系尺度下恒星确实非常靠近太阳系位置（因为相对银河系它们是邻居）。当相机靠近时（距离 < 400），会切换到"邻域放大视图"，此时恒星按真实光年距离放置。

### Q: 点击太阳系为什么不跳转了？
A: 已禁用该功能，因为添加了周围恒星系统后，太阳系区域需要展示邻域恒星，不适合作为跳转入口。

---

## 七、语音 TTS 实现方案（重要）

### 7.1 方案概述

由于 xirong.github.io 是纯前端静态网站（GitHub Pages），无法调用后端服务，且浏览器内置的 Web Speech API 效果较差，项目采用 **预生成 MP3 + 降级 fallback** 的方案：

1. **主方案**：使用 **Microsoft Edge-TTS** 预先生成高质量 MP3 文件，部署到 `audio/` 目录
2. **备选方案**：当 MP3 加载失败时，自动降级到浏览器内置的 Web Speech API

### 7.2 技术实现

#### 音频生成脚本（Python）

```bash
# 位置：space/generate-audio.py
# 依赖：pip install edge-tts

cd /Users/liuxirong/Downloads/vibecoding/Education/xirong.github.io/space
python3 generate-audio.py
```

**脚本核心代码**：
```python
import edge_tts
import asyncio

# 推荐语音：小晓 - 儿童友好的中文女声
VOICE = "zh-CN-XiaoxiaoNeural"

async def generate_audio(path, text):
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(path)  # 输出 MP3 文件
```

#### 前端播放代码（JavaScript）

```javascript
// 音频缓存
const audioCache = {};

// 音频路径配置（统一管理）
const audioPaths = {
    fixed: {
        quizCorrect: 'audio/fixed/quiz-correct.mp3',
        wordIntro: 'audio/fixed/word-intro.mp3',
    },
    // 动态路径生成函数
    levelIntro: (levelId) => `audio/levels/level-${levelId}-intro.mp3`,
    planetInfo: (planetKey) => `audio/planets/${planetKey}-info.mp3`,
    wordChar: (char) => `audio/words/${char}-char.mp3`,
};

// 播放预生成音频，失败时降级到 Web Speech API
function playAudio(audioPath, fallbackText) {
    let audio = audioCache[audioPath];
    if (!audio) {
        audio = new Audio(audioPath);
        audioCache[audioPath] = audio;
    }

    audio.currentTime = 0;
    audio.onerror = () => {
        console.log('音频加载失败，使用 TTS 备选:', audioPath);
        speak(fallbackText);  // 降级到 Web Speech API
    };

    audio.play().catch(() => speak(fallbackText));
}

// 原始 TTS 函数（作为备选）
function speak(text) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    setTimeout(() => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'zh-CN';
        u.rate = 0.85;
        u.pitch = 1.15;
        speechSynthesis.speak(u);
    }, 50);
}
```

### 7.3 目录结构

```
space/
├── generate-audio.py          # 音频生成脚本
└── audio/
    ├── fixed/                 # 固定文本（通用提示音）
    │   ├── quiz-correct.mp3
    │   └── word-intro.mp3
    ├── levels/                # 关卡相关音频
    │   ├── level-1-intro.mp3
    │   ├── level-1-badge.mp3
    │   └── level-1-task-1-hint.mp3
    ├── planets/               # 星球介绍音频
    │   ├── sun-info.mp3
    │   └── earth-info.mp3
    └── words/                 # 识字汉字音频
        ├── 日-intro.mp3
        ├── 日-char.mp3
        ├── 日-correct.mp3
        └── 日-wrong.mp3
```

### 7.4 Edge-TTS 可用语音

| 语音代码 | 名称 | 特点 | 适用场景 |
|---------|------|------|---------|
| `zh-CN-XiaoxiaoNeural` | 小晓 | 清晰甜美 | **儿童教育（推荐）** |
| `zh-CN-YunxiNeural` | 云希 | 男声自然 | 一般朗读 |
| `zh-CN-YunyangNeural` | 云扬 | 播音风格 | 新闻播报 |
| `zh-CN-XiaoyiNeural` | 小艺 | 温柔亲切 | 故事讲述 |

### 7.5 新增语音的流程

1. **在 `generate-audio.py` 中添加数据**
   ```python
   # 例如添加新的关卡介绍
   LEVELS_DATA.append({
       "id": 7,
       "intro": "新关卡的介绍文字...",
       "badge_name": "新徽章名",
       "tasks": [...]
   })
   ```

2. **运行生成脚本**
   ```bash
   cd space && python3 generate-audio.py
   ```

3. **在 JavaScript 中添加路径配置**（如果是新类型音频）
   ```javascript
   const audioPaths = {
       // 添加新的路径映射
       newCategory: (id) => `audio/new/${id}.mp3`,
   };
   ```

4. **调用播放函数**
   ```javascript
   playAudio(audioPaths.newCategory(someId), "备选文本");
   ```

### 7.6 方案优势

| 对比项 | 预生成 MP3 | 浏览器 TTS |
|-------|-----------|-----------|
| 语音质量 | ★★★★★ 接近真人 | ★★☆☆☆ 机械感重 |
| 一致性 | 所有设备相同效果 | 依赖设备支持 |
| 离线可用 | ✅ 缓存后可离线 | ❌ 部分设备需网络 |
| 部署成本 | 需预生成文件 | 无需额外文件 |
| 适用平台 | 纯前端可用 | 纯前端可用 |

---

## 八、Git 信息

- 主分支：master
- 远程仓库：GitHub Pages 托管
