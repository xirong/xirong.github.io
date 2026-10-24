/* 太阳的知识地图与科学数据。
   以后做行星：复制一份改成 earth-data.js，换数据、贴图和旁白即可，引擎不用动。
   温度为代表值或近似范围，与 ../sun-lab/data.js 核对一致（来源见 CREDITS.md）。 */
window.BODY = {
  id: 'sun',
  name: '太阳',
  title: '真实的太阳',
  radiusKm: 695700,

  // ============ 知识地图（九宫格） ============
  // module：已做好的模块；href：链接到网站里已有的页面；都没有就是“快来啦”
  map: [
    { id: 'look',     icon: '🔭', name: '长什么样',   module: 'look' },
    { id: 'inside',   icon: '⛏️', name: '里面是什么', module: 'dive' },
    { id: 'size',     icon: '⚖️', name: '有多大多重',   module: 'stage' },
    { id: 'motion',   icon: '🌀', name: '怎么动',       module: 'stage' },
    { id: 'activity', icon: '⚡', name: '会发生什么',   module: 'stage' },
    { id: 'life',     icon: '🌱', name: '和我们的关系', module: 'stage' },
    { id: 'story',    icon: '⏳', name: '一生的故事',   module: 'stage' },
    { id: 'probe',    icon: '🚀', name: '谁去研究过',   module: 'stage' },
    { id: 'quiz',     icon: '⭐', name: '闯关复习', href: '../sun.html' },
  ],

  // ============ 钻进去：从太空一站一站钻到中心 ============
  // r：镜头离球心的距离（太阳半径 = 1）；t：温度计显示的代表温度（℃）
  // aim：镜头转向边缘的程度（0 看球心，1 正对边缘）——大气层要从边上才看得见
  // at：剖开以后镜头对准剖面上离球心多远的地方（就是“现在钻到哪儿了”）；elev：镜头抬高的角度
  // yaw：镜头偏离楔形中线的角度（偏一点才能同时看见剖面和外壳，要小于 45°，否则会钻到实心部分里）
  // look：在球外时用哪副眼镜看（大气层要用紫外眼镜才看得见）
  // layer：在球里时高亮哪一层剖面
  dive: {
    stops: [
      { id: 'space',        name: '太空',   r: 4.6,  t: -270,     look: 'visible', temp: '约零下 270℃',      fact: '太空又黑又冷，太阳就在前面。' },
      { id: 'corona',       name: '日冕',   r: 2.4,  aim: 0.8, t: 1500000,  look: 'uv171',   temp: '约 100 万～200 万℃', fact: '最外面的一层，很稀薄，却特别热。' },
      { id: 'transition',   name: '过渡区', r: 1.7,  aim: 0.88, t: 100000,   look: 'uv304',   temp: '几万℃ → 约 100 万℃', fact: '薄薄一层，温度在这里突然升高。' },
      { id: 'chromosphere', name: '色球',   r: 1.3,  aim: 0.92, t: 10000,    look: 'uv304',   temp: '约 4,000～20,000℃',  fact: '光球上面一层红红的大气。' },
      { id: 'photosphere',  name: '光球',   r: 1.07, t: 5500,     look: 'visible', temp: '约 5,500℃',          fact: '我们看见的亮表面，不是硬的。' },
      { id: 'convection',   name: '对流区', r: 2.7, at: 0.75, elev: 28, yaw: 20, t: 1000000,  layer: 'convection', temp: '约 5,700℃ → 200 万℃', fact: '热的往上冒，凉的往下沉。', open: true },
      { id: 'radiative',    name: '辐射区', r: 1.75, at: 0.42, elev: 28, yaw: 16, t: 4500000,  layer: 'radiative',  temp: '约 200 万 → 700 万℃', fact: '光绕来绕去，要走好几万年。' },
      { id: 'core',         name: '核心',   r: 0.95, at: 0.08, elev: 30, yaw: 10, t: 15000000, layer: 'core',       temp: '约 1,500 万℃',        fact: '核聚变发生的地方，能量从这里来。' },
    ],
    // 剖面上的三层：r0～r1 为太阳半径的比例；pattern 1 对流 / 2 辐射 / 3 核聚变
    interior: [
      { id: 'core',       r0: 0,    r1: 0.25, c0: '#ffe9a6', c1: '#ffbd48', pattern: 3 },
      { id: 'radiative',  r0: 0.25, r1: 0.70, c0: '#ffb648', c1: '#f57a26', pattern: 2 },
      { id: 'convection', r0: 0.70, r1: 1.0,  c0: '#ec6a1e', c1: '#b8340c', pattern: 1 },
    ],
  },

  // ============ 场景模块：每格几个知识点 ============
  // 讲解文字在 narration.py（键名 = 场景 id），题目在 'q_' + 场景 id，3D 场景在 sun-stages.js
  stages: {
    size: [
      { id: 'size_line',   icon: '🌍', title: '109 个地球排一排', sub: '直径约 139 万公里', actions: [{ id: 'go', label: '🌍 排排队' }], quiz: { options: ['10 个', '109 个', '1000 个'], answer: 1 } },
      { id: 'size_fill',   icon: '🫙', title: '能装 130 万个地球', sub: '体积', actions: [{ id: 'go', label: '🫙 往里装' }], quiz: { options: ['13 个', '1300 个', '130 万个'], answer: 2 } },
      { id: 'size_mass',   icon: '⚖️', title: '天平称一称', sub: '质量约是地球的 33 万倍', actions: [{ id: 'go', label: '⚖️ 放地球' }], quiz: { options: ['太阳', '地球', '一样重'], answer: 0 } },
      { id: 'size_weight', icon: '🧒', title: '我在太阳上有多重', sub: '引力约是地球的 28 倍', slider: { min: 10, max: 40, value: 20, label: '我的体重', unit: ' 公斤' },
        actions: [{ id: 'moon', label: '🌙 站到月球' }, { id: 'earth', label: '🌍 站到地球' }, { id: 'sun', label: '☀️ 站到太阳' }], quiz: { options: ['更轻', '更重', '不变'], answer: 1 } },
      { id: 'size_far',    icon: '💡', title: '阳光跑到地球', sub: '约 1.5 亿公里', actions: [{ id: 'go', label: '💡 出发' }], quiz: { options: ['8 秒', '8 分钟', '8 天'], answer: 1 } },
    ],
    motion: [
      { id: 'motion_spin',   icon: '🔄', title: '太阳也会自转', sub: '赤道约 25 天，两极约 35 天', actions: [{ id: 'go', label: '🔁 再排一次' }], quiz: { options: ['中间的赤道', '两头'], answer: 0 } },
      { id: 'motion_family', icon: '🪐', title: '八大行星绕着太阳转', sub: '距离和大小都不是真实比例', actions: [{ id: 'off', label: '🚫 关掉引力' }, { id: 'on', label: '🧲 打开引力' }], quiz: { options: ['绳子', '引力', '风'], answer: 1 } },
      { id: 'motion_galaxy', icon: '🌌', title: '太阳在银河系里转圈', sub: '转一圈要两亿多年', actions: [{ id: 'go', label: '⏩ 转起来' }], quiz: { options: ['一年', '一百年', '两亿多年'], answer: 2 } },
    ],
    activity: [
      { id: 'act_cycle', icon: '🔢', title: '黑子多了又少：11 年周期', sub: '左 2019 年 · 右 2024 年', quiz: { options: ['2019 年', '2024 年'], answer: 1 } },
      { id: 'act_flare', icon: '⚡', title: '耀斑：太阳闪了一下', sub: '磁力打结又断开', photo: { src: 'assets/photos/flare-2024.jpg', credit: 'NASA/SDO AIA 131Å · 2024-05-14 的大耀斑（右边最亮处）' }, actions: [{ id: 'go', label: '⚡ 闪一下' }], quiz: { options: ['太阳突然变亮', '太阳上的洞'], answer: 0 } },
      { id: 'act_wind',  icon: '🌬️', title: '太阳风和极光', sub: '地球磁场像盾牌', photo: { src: 'assets/photos/aurora-iss.jpg', credit: 'NASA · 2024-10-30 国际空间站拍到的极光' }, actions: [{ id: 'go', label: '💥 喷一大团' }], quiz: { options: ['太阳风', '月亮', '云'], answer: 0 } },
      { id: 'act_comet', icon: '☄️', title: '彗星的尾巴背对太阳', sub: '是太阳光和太阳风吹出来的', photo: { src: 'assets/photos/comet-neowise.jpg', credit: 'NASA/Bill Ingalls · 2020 年的新智彗星' }, actions: [{ id: 'go', label: '⏩ 飞快一点' }], quiz: { options: ['朝着太阳', '背着太阳'], answer: 1 } },
    ],
    life: [
      { id: 'life_light',   icon: '🌗', title: '白天和黑夜', sub: '太阳送来光和热', actions: [{ id: 'off', label: '🌑 关掉太阳' }, { id: 'on', label: '☀️ 打开太阳' }], quiz: { options: ['冰球', '火球', '没变化'], answer: 0 } },
      { id: 'life_food',    icon: '🍚', title: '我们吃的饭也来自太阳', sub: '能量一站一站传下去', actions: [{ id: 'go', label: '➡️ 下一站' }], quiz: { options: ['阳光', '糖果', '电视'], answer: 0 } },
      { id: 'life_rainbow', icon: '🌈', title: '阳光藏着七种颜色', sub: '三棱镜和彩虹', actions: [{ id: 'go', label: '🔺 放三棱镜' }], quiz: { options: ['3 种', '7 种', '10 种'], answer: 1 } },
      { id: 'life_safe',    icon: '🕶️', title: '保护眼睛和皮肤', sub: '安全第一', quiz: { options: ['可以', '不可以'], answer: 1 } },
    ],
    story: [
      { id: 'story_nebula', icon: '☁️', title: '一团星云', sub: '约 46 亿年前', actions: [{ id: 'go', label: '🌀 缩起来' }], quiz: { options: ['星云', '大海', '鸡蛋'], answer: 0 } },
      { id: 'story_now',    icon: '☀️', title: '现在的太阳', sub: '46 亿岁，正当壮年', quiz: { options: ['46 岁', '46 亿岁'], answer: 1 } },
      { id: 'story_giant',  icon: '🔴', title: '变成红巨星', sub: '大约 50 亿年以后', actions: [{ id: 'go', label: '🎈 变大' }], quiz: { options: ['红巨星', '黑洞', '月亮'], answer: 0 } },
      { id: 'story_dwarf',  icon: '⚪', title: '最后变成白矮星', sub: '更久更久以后', photo: { src: 'assets/photos/helix-nebula.jpg', credit: 'NASA/JPL-Caltech GALEX · 螺旋星云（行星状星云）' }, actions: [{ id: 'go', label: '💨 气体飘走' }], quiz: { options: ['白矮星', '黑洞'], answer: 0 } },
    ],
    probe: [
      { id: 'probe_ancient', icon: '🕰️', title: '古人看太阳：日晷', sub: '两千多年前就记录了黑子', actions: [{ id: 'go', label: '🌅 让太阳走' }], quiz: { options: ['影子', '声音'], answer: 0 } },
      { id: 'probe_sdo',     icon: '🛰️', title: 'SDO：拍下这些照片的卫星', sub: '2010 年发射', photo: { src: 'assets/photos/sdo-art.jpg', credit: 'NASA/GSFC · SDO 艺术想象图' }, quiz: { options: ['卫星', '画家'], answer: 0 } },
      { id: 'probe_china',   icon: '🇨🇳', title: '羲和号和夸父一号', sub: '中国的太阳卫星', quiz: { options: ['夸父一号', '嫦娥一号'], answer: 0 } },
      { id: 'probe_parker',  icon: '🚀', title: '帕克：飞得离太阳最近', sub: '2018 年出发', photo: { src: 'assets/photos/parker-launch.jpg', credit: 'NASA/Bill Ingalls · 2018-08-12 帕克探测器发射' }, actions: [{ id: 'go', label: '🚀 冲刺' }], quiz: { options: ['隔热盾', '冰块'], answer: 0 } },
    ],
  },
};
