/* 真实的地球 · 知识地图、内部结构与六个场景模块的数据。 */
window.BODY = {
  id: 'earth',
  name: '地球',
  title: '真实的地球',
  radiusKm: 6371,

  map: [
    { id: 'look',     icon: '🔭', name: '长什么样',   module: 'look' },
    { id: 'inside',   icon: '⛏️', name: '里面是什么', module: 'dive' },
    { id: 'size',     icon: '⚖️', name: '有多大多重', module: 'stage' },
    { id: 'motion',   icon: '🌀', name: '怎么动',     module: 'stage' },
    { id: 'activity', icon: '⚡', name: '会发生什么', module: 'stage' },
    { id: 'life',     icon: '🌱', name: '和我们的关系', module: 'stage' },
    { id: 'story',    icon: '⏳', name: '一生的故事', module: 'stage' },
    { id: 'probe',    icon: '🚀', name: '谁去研究过', module: 'stage' },
    { id: 'quiz',     icon: '⭐', name: '闯关复习', href: '../earth-explorer.html' },
  ],

  // r、at 以地球平均半径为 1；内部边界采用常见的近似值。
  dive: {
    stops: [
      { id: 'space',        name: '太空',   r: 4.6, t: -270, look: 'day', temp: '约零下 270℃', fact: '我们的蓝色家园，就在前面。' },
      { id: 'atmosphere',   name: '大气',   r: 1.06, aim: 0.86, t: -50, look: 'day', temp: '随高度变化很大', fact: '一层看不见的空气外衣，保护着生命。' },
      { id: 'crust',        name: '地壳',   r: 1.005, t: 15, look: 'day', temp: '地表平均约 15℃', fact: '薄薄硬硬的外壳，我们就住在这里。' },
      { id: 'upper_mantle', name: '上地幔', r: 2.8, at: 0.95, elev: 28, yaw: 20, t: 1000, layer: 'upper_mantle', temp: '约 500～1,500℃', fact: '岩石很热，能像特别稠的糖浆一样慢慢流动。', open: true },
      { id: 'lower_mantle', name: '下地幔', r: 2.1, at: 0.72, elev: 28, yaw: 16, t: 3000, layer: 'lower_mantle', temp: '约 1,500～3,700℃', fact: '地球最厚的一层，热岩石仍在慢慢对流。' },
      { id: 'outer_core',   name: '外核',   r: 1.45, at: 0.38, elev: 30, yaw: 12, t: 4500, layer: 'outer_core', temp: '约 3,700～5,500℃', fact: '液态铁和镍在这里流动，帮助产生地球磁场。' },
      { id: 'inner_core',   name: '内核',   r: 0.95, at: 0.08, elev: 30, yaw: 10, t: 5500, layer: 'inner_core', temp: '约 5,000～6,000℃', fact: '一个又热又压得很紧的固态铁镍球。' },
    ],
    interior: [
      { id: 'inner_core',   r0: 0,      r1: 0.1915, c0: '#fff2b0', c1: '#ffc85c', pattern: 0 },
      { id: 'outer_core',   r0: 0.1915, r1: 0.546,  c0: '#ffb137', c1: '#ed6b20', pattern: 4 },
      { id: 'lower_mantle', r0: 0.546,  r1: 0.896,  c0: '#d94b24', c1: '#a72e20', pattern: 1 },
      { id: 'upper_mantle', r0: 0.896,  r1: 0.9945, c0: '#a8442b', c1: '#74513b', pattern: 1 },
      { id: 'crust',        r0: 0.9945, r1: 1.0,    c0: '#77806b', c1: '#a6a48c', pattern: 0 },
    ],
  },

  stages: {
    size: [
      { id: 'size_line', icon: '🌙', title: '约 4 个月球排一排', sub: '地球直径约 12,742 公里', actions: [{ id: 'go', label: '🌙 排排队' }], quiz: { options: ['约 4 个', '约 40 个', '约 400 个'], answer: 0 } },
      { id: 'size_fill', icon: '🫙', title: '能装约 49 个月球', sub: '地球和月球比体积', actions: [{ id: 'go', label: '🫙 往里装' }], quiz: { options: ['约 5 个', '约 49 个', '约 490 个'], answer: 1 } },
      { id: 'size_mass', icon: '⚖️', title: '天平称一称', sub: '地球质量约是月球的 81 倍', actions: [{ id: 'go', label: '⚖️ 放月球' }], quiz: { options: ['约 8 个', '约 81 个', '约 810 个'], answer: 1 } },
      { id: 'size_weight', icon: '🧒', title: '换个星球有多重', sub: '比一比地球、月球和火星', slider: { min: 10, max: 40, value: 20, label: '我的体重', unit: ' 公斤' }, actions: [{ id: 'moon', label: '🌙 站到月球' }, { id: 'earth', label: '🌍 站到地球' }, { id: 'mars', label: '🔴 站到火星' }], quiz: { options: ['月球', '地球', '火星'], answer: 0 } },
      { id: 'size_far', icon: '💡', title: '光跑到月球', sub: '地月平均距离约 38.4 万公里', actions: [{ id: 'go', label: '💡 出发' }], quiz: { options: ['约 1 秒', '约 8 分钟', '约 1 天'], answer: 0 } },
    ],
    motion: [
      { id: 'motion_spin', icon: '🌗', title: '自转带来白天黑夜', sub: '约 24 小时转一圈', actions: [{ id: 'go', label: '⏩ 转一天' }], quiz: { options: ['约 24 小时', '约 1 小时', '约 1 年'], answer: 0 } },
      { id: 'motion_year', icon: '🍂', title: '歪着身子绕太阳', sub: '地轴倾角约 23.5°，一年一圈', actions: [{ id: 'go', label: '⏩ 过一年' }], quiz: { options: ['地轴倾斜并公转', '夏天离太阳最近', '太阳会变大小'], answer: 0 } },
      { id: 'motion_moon', icon: '🌙', title: '月球绕着地球转', sub: '一圈约 27.3 天', actions: [{ id: 'go', label: '⏩ 转一圈' }], quiz: { options: ['约 27 天', '约 1 天', '约 1 年'], answer: 0 } },
    ],
    activity: [
      { id: 'act_quake', icon: '🧩', title: '板块慢慢动，地震突然来', sub: '地壳分成许多会移动的板块', actions: [{ id: 'go', label: '💥 模拟地震' }], quiz: { options: ['板块相互挤压错动', '地球打喷嚏', '月亮撞地球'], answer: 0 } },
      { id: 'act_volcano', icon: '🌋', title: '火山喷发了', sub: '岩浆沿通道来到地表', photo: { src: 'assets/photos/volcano.jpg', credit: '真实火山照片 · 来源见 CREDITS.md' }, actions: [{ id: 'go', label: '🌋 喷一次' }], quiz: { options: ['岩浆', '自来水', '云'], answer: 0 } },
      { id: 'act_typhoon', icon: '🌀', title: '台风像巨大的旋转云盘', sub: '暖海水给它能量', photo: { src: 'assets/photos/hurricane.jpg', credit: '卫星真实云系照片 · 来源见 CREDITS.md' }, actions: [{ id: 'go', label: '🌀 转起来' }], quiz: { options: ['温暖的海水', '月亮的光', '高山'], answer: 0 } },
      { id: 'act_aurora', icon: '🌈', title: '极光在两极发光', sub: '太阳风遇到地球磁场和大气', photo: { src: '../sun-3d/assets/photos/aurora-iss.jpg', credit: 'NASA · 国际空间站拍摄的极光' }, actions: [{ id: 'go', label: '✨ 点亮极光' }], quiz: { options: ['太阳风和大气粒子碰撞', '月亮反光', '海底火山'], answer: 0 } },
    ],
    life: [
      { id: 'life_ocean', icon: '🌊', title: '蓝色海洋占约 71%', sub: '十分之七的表面被水覆盖', actions: [{ id: 'go', label: '🎨 涂一涂' }], quiz: { options: ['约 71%', '约 7%', '约 100%'], answer: 0 } },
      { id: 'life_land', icon: '⛰️', title: '陆地不只是平地', sub: '山地、平原、沙漠和森林', actions: [{ id: 'go', label: '🏔️ 看地形' }], quiz: { options: ['绿色和棕色的陆地', '蓝色的海洋', '白色的云'], answer: 0 } },
      { id: 'life_air', icon: '🌈', title: '大气是看不见的外衣', sub: '有空气，也让天空呈蓝色', actions: [{ id: 'go', label: '🌇 换晚霞' }], quiz: { options: ['大气散射蓝色光', '大海把天染蓝', '蓝色油漆'], answer: 0 } },
      { id: 'life_water', icon: '💧', title: '水一直在旅行', sub: '蒸发、成云、下雨、流回大海', actions: [{ id: 'go', label: '➡️ 下一站' }], quiz: { options: ['河流和大海', '外太空', '地心'], answer: 0 } },
    ],
    story: [
      { id: 'story_nebula', icon: '☁️', title: '太阳星云里的尘埃', sub: '约 46 亿年前', actions: [{ id: 'go', label: '🌀 聚起来' }], quiz: { options: ['约 46 亿年前', '约 46 年前', '约 460 亿年前'], answer: 0 } },
      { id: 'story_birth', icon: '🔥', title: '炽热的地球宝宝', sub: '碰撞聚积，重物质沉向中心', actions: [{ id: 'go', label: '🔥 地球诞生' }], quiz: { options: ['很热', '一开始就是冰球', '没有变化'], answer: 0 } },
      { id: 'story_moon', icon: '💥', title: '一次大碰撞', sub: '科学模型：碎屑聚集形成月球', actions: [{ id: 'go', label: '💥 模拟碰撞' }], quiz: { options: ['大碰撞后的碎屑聚集', '从太阳掉下来', '云变成的'], answer: 0 } },
      { id: 'story_life', icon: '🌱', title: '蓝色家园有了生命', sub: '冷却、海洋形成，生命慢慢出现', actions: [{ id: 'go', label: '🌱 看变化' }], quiz: { options: ['海洋里', '月球上', '人造卫星里'], answer: 0 } },
    ],
    probe: [
      { id: 'probe_round', icon: '🌑', title: '古人发现地球是球', sub: '月食里的地影总是圆的', actions: [{ id: 'go', label: '🌑 看月食' }], quiz: { options: ['圆圆的影子', '影子的声音', '月亮的颜色'], answer: 0 } },
      { id: 'probe_magellan', icon: '⛵', title: '麦哲伦船队环球航行', sub: '1519—1522 年，船队完成环球', actions: [{ id: 'go', label: '⛵ 出发' }], quiz: { options: ['环球航行', '飞到太阳', '钻进地心'], answer: 0 } },
      { id: 'probe_apollo', icon: '📷', title: '阿波罗拍下蓝色弹珠', sub: '1972 年，从太空看见整个地球', photo: { src: 'assets/photos/blue-marble.jpg', credit: 'NASA · 阿波罗 17 号“蓝色弹珠”' }, actions: [{ id: 'go', label: '📷 看地球' }], quiz: { options: ['阿波罗 17 号', '帕克探测器', '麦哲伦船队'], answer: 0 } },
      { id: 'probe_station', icon: '🛰️', title: '卫星和空间站看地球', sub: '观察云、海洋、天气和我们的家', actions: [{ id: 'go', label: '🛰️ 绕一圈' }], quiz: { options: ['卫星和空间站', '海底潜水艇', '高山'], answer: 0 } },
    ],
  },
};
