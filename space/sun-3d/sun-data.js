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
    { id: 'size',     icon: '⚖️', name: '有多大多重' },
    { id: 'motion',   icon: '🌀', name: '怎么动' },
    { id: 'activity', icon: '⚡', name: '会发生什么' },
    { id: 'life',     icon: '🌱', name: '和我们的关系' },
    { id: 'story',    icon: '⏳', name: '一生的故事' },
    { id: 'probe',    icon: '🚀', name: '谁去研究过' },
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
};
