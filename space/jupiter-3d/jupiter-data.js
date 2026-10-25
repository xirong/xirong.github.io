/* 真实的木星 · 知识地图、近似内部结构与 24 个场景的数据。 */
window.BODY = {
  id: 'jupiter',
  name: '木星',
  title: '真实的木星',
  radiusKm: 71492,
  flatten: 0.935,

  map: [
    { id: 'look', icon: '🔭', name: '长什么样', module: 'look' },
    { id: 'inside', icon: '⛏️', name: '里面是什么', module: 'dive' },
    { id: 'size', icon: '⚖️', name: '有多大多重', module: 'stage' },
    { id: 'motion', icon: '🌀', name: '怎么动', module: 'stage' },
    { id: 'activity', icon: '⚡', name: '会发生什么', module: 'stage' },
    { id: 'life', icon: '🌱', name: '和我们的关系', module: 'stage' },
    { id: 'story', icon: '⏳', name: '一生的故事', module: 'stage' },
    { id: 'probe', icon: '🚀', name: '谁去研究过', module: 'stage' },
    { id: 'quiz', icon: '⭐', name: '闯关复习', href: '../jupiter.html' },
  ],

  dive: {
    thermoMax: 25000,
    stops: [
      { id: 'space', name: '太空', r: 4.6, t: -161, look: 'visible', temp: '约零下 161℃（0.1 bar 上层大气代表值）', fact: '太空不是一团冷空气。先认识木星寒冷的上层大气，再向云顶靠近。' },
      { id: 'clouds', name: '氨云云顶', r: 1.06, aim: 0.88, t: -110, look: 'visible', temp: '约零下 110℃', fact: '我们看到的“表面”其实是云，不是地面。' },
      { id: 'deep', name: '更深的大气', r: 1.005, t: 50, look: 'visible', temp: '约 0～100℃（近似）', fact: '再往下可能有水云和闪电，气体越来越稠。' },
      { id: 'liquid', name: '液态氢', r: 2.8, at: 0.875, elev: 28, yaw: 20, t: 5000, layer: 'liquid', temp: '几千℃（模型近似）', fact: '压力把氢挤成液体，却没有一片可以站的海岸。', open: true },
      { id: 'metallic', name: '金属氢', r: 1.75, at: 0.58, elev: 28, yaw: 16, t: 12000, layer: 'metallic', temp: '一万多℃（模型近似）', fact: '液态氢能导电，和木星强大的磁场有关。' },
      { id: 'core', name: '稀释核心', r: 0.95, at: 0.12, elev: 30, yaw: 10, t: 20000, layer: 'core', temp: '约 2 万℃（估计）', fact: '中心不是硬球，而是和周围物质慢慢混在一起的“模糊核心”。' },
    ],
    interior: [
      { id: 'core', r0: 0, r1: 0.40, c0: '#d6b183', c1: '#a98264', pattern: 0 },
      { id: 'metallic', r0: 0.40, r1: 0.80, c0: '#9d94b8', c1: '#716f9a', pattern: 4 },
      { id: 'liquid', r0: 0.80, r1: 0.95, c0: '#c9a56d', c1: '#a8764e', pattern: 4 },
      { id: 'atmosphere', r0: 0.95, r1: 1.0, c0: '#d8c5a4', c1: '#8c6e56', pattern: 1 },
    ],
  },

  stages: {
    size: [
      { id: 'size_line', icon: '🌍', title: '11 个多一点地球排直径', sub: '木星赤道直径约 142,984 公里', actions: [{ id: 'go', label: '🌍 排排队' }], quiz: { options: ['约 11 个', '约 3 个', '约 100 个'], answer: 0 } },
      { id: 'size_fill', icon: '🫙', title: '能装约 1,321 个地球', sub: '木星的体积', actions: [{ id: 'go', label: '🫙 往里装' }], quiz: { options: ['约 13 个', '约 1,321 个', '约 130 万个'], answer: 1 } },
      { id: 'size_mass', icon: '⚖️', title: '质量约 318 个地球', sub: '比另外七大行星加起来还重', actions: [{ id: 'go', label: '⚖️ 放地球' }], quiz: { options: ['约 318 个', '约 3 个', '一样重'], answer: 0 } },
      { id: 'size_weight', icon: '🧒', title: '木星赤道云顶的体重', sub: '比较体重秤读数，没有地方站', slider: { min: 10, max: 40, value: 20, label: '我的体重', unit: ' 公斤' }, actions: [{ id: 'moon', label: '🌙 到月球' }, { id: 'earth', label: '🌍 到地球' }, { id: 'jupiter', label: '🪐 到木星云顶' }], quiz: { options: ['可以站在地面上', '没有地面可以站', '站在冰海上'], answer: 1 } },
      { id: 'size_far', icon: '💡', title: '阳光跑到木星', sub: '约 5.2 个天文单位', actions: [{ id: 'go', label: '💡 出发' }], quiz: { options: ['约 43 分钟', '约 8 分钟', '约 1 秒'], answer: 0 } },
    ],
    motion: [
      { id: 'motion_spin', icon: '🔄', title: '太阳系里转得最快', sub: '一天约 9 小时 56 分，所以木星有点扁', actions: [{ id: 'go', label: '⏩ 转一天' }], quiz: { options: ['约 10 小时', '约 24 小时', '约 一年'], answer: 0 } },
      { id: 'motion_year', icon: '🪐', title: '木星的一年很长', sub: '绕太阳一圈约 11.862 个地球年 · 轨道大小示意', actions: [{ id: 'go', label: '⏩ 过一年' }], quiz: { options: ['约 12 年', '约 12 天', '约 12 个月'], answer: 0 } },
      { id: 'motion_axis', icon: '📐', title: '几乎直着身子公转', sub: '地轴只歪约 3.13°，几乎没有四季 · 轨道大小示意', actions: [{ id: 'go', label: '🌍 和地球比' }], quiz: { options: ['几乎没有四季', '四季特别分明', '每个月都是夏天'], answer: 0 } },
      { id: 'motion_moons', icon: '🌙', title: '四颗卫星跳共振舞', sub: '木卫一、二、三的公转周期约 1:2:4 · 大小和距离示意', actions: [{ id: 'go', label: '⏩ 看共振' }], quiz: { options: ['1:2:4', '1:1:1', '4:2:1'], answer: 0 } },
    ],
    activity: [
      { id: 'act_spot', icon: '🌀', title: '大红斑在南半球', sub: '南纬约 22°的反气旋，正在慢慢缩小', photo: { src: 'assets/photos/great-red-spot.jpg', credit: 'NASA/JPL-Caltech/SwRI/MSSS · Juno 拍摄的大红斑' }, actions: [{ id: 'spin', label: '🌀 看旋转' }, { id: 'compare', label: '🌍 比大小' }], quiz: { options: ['南半球', '北半球', '只在赤道上'], answer: 0 } },
      { id: 'act_belts', icon: '💨', title: '条纹里藏着大风和闪电', sub: '相邻喷流方向相反，Juno 还看到了闪电', photo: { src: 'assets/photos/lightning.jpg', credit: 'NASA/JPL-Caltech/SwRI · Juno SRU 拍到的木星闪电' }, actions: [{ id: 'winds', label: '💨 看风向' }, { id: 'lightning', label: '⚡ 看闪电' }], quiz: { options: ['相邻喷流方向相反', '所有风都朝一边', '木星上没有风'], answer: 0 } },
      { id: 'act_aurora', icon: '🌈', title: '两极有紫外极光', sub: '木星自转、强磁场和木卫一都很重要', photo: { src: 'assets/photos/aurora.jpg', credit: 'NASA/ESA · Hubble 光学与紫外合成图' }, actions: [{ id: 'go', label: '✨ 看极光' }], quiz: { options: ['两极附近', '只在赤道', '大红斑里面'], answer: 0 } },
      { id: 'act_impact', icon: '☄️', title: '1994 年彗星撞木星', sub: '苏梅克-列维 9 号约 21 块碎片接连撞来', photo: { src: 'assets/photos/sl9.jpg', credit: 'Hubble Comet Team/NASA · SL9 撞击留下的黑斑' }, actions: [{ id: 'go', label: '☄️ 看撞击' }], quiz: { options: ['彗星碎片', '人造卫星', '地球'], answer: 0 } },
    ],
    life: [
      { id: 'life_gravity', icon: '🛡️', title: '木星会改变小天体的路', sub: '可能撞过来，也可能被甩出去，“保护地球”仍在讨论', actions: [{ id: 'go', label: '☄️ 改变轨道' }], quiz: { options: ['木星永远保护地球', '木星会改变一些天体轨道', '小天体都不会受影响'], answer: 1 } },
      { id: 'life_sky', icon: '🔭', title: '肉眼亮点，望远镜里的卫星', sub: '小望远镜能看到四颗伽利略卫星', actions: [{ id: 'telescope', label: '🔭 用望远镜' }], quiz: { options: ['肉眼就能看到大红斑', '小望远镜能看到四颗卫星', '木星用肉眼看不见'], answer: 1 } },
      { id: 'life_europa', icon: '🧊', title: '木卫二冰下可能有海洋', sub: '科学家在寻找适合生命的条件，还没有发现生命', photo: { src: 'assets/photos/europa.jpg', credit: 'NASA/JPL-Caltech/SETI · 木卫二近似真实色马赛克' }, actions: [{ id: 'go', label: '🧊 剖开看看' }], quiz: { options: ['冰下可能有海洋', '已经发现外星人', '表面都是海水'], answer: 0 } },
    ],
    story: [
      { id: 'story_birth', icon: '☁️', title: '先长核心，再吸进气体', sub: '约 46 亿年前，核心吸积假说', actions: [{ id: 'go', label: '🌀 聚起来' }], quiz: { options: ['先核心再吸进氢氦', '先变成太阳', '从地球吹过去'], answer: 0 } },
      { id: 'story_migration', icon: '🧭', title: '木星可能搬过家', sub: '大迁移假说，不是确定的历史', actions: [{ id: 'go', label: '🧭 看一种假说' }], quiz: { options: ['一种科学假说', '已经拍下的历史', '木星从不移动'], answer: 0 } },
      { id: 'story_future', icon: '🔴', title: '太阳老了，木星可能还在', sub: '距离很远，轨道还可能向外移动', actions: [{ id: 'go', label: '🔴 看遥远的未来' }], quiz: { options: ['木星可能幸存', '木星一定变成恒星', '木星明天消失'], answer: 0 } },
    ],
    probe: [
      { id: 'probe_galileo', icon: '🔭', title: '1610 年：伽利略发现卫星', sub: '几颗小点改变了人类对宇宙的认识', actions: [{ id: 'go', label: '🔭 连续看几晚' }], quiz: { options: ['伽利略', '麦哲伦', '牛顿'], answer: 0 } },
      { id: 'probe_flyby', icon: '🚀', title: '先驱者和旅行者飞掠木星', sub: '1970 年代的近距离接触，发现了暗环', actions: [{ id: 'go', label: '💫 看暗淡的环' }], quiz: { options: ['尘埃组成的暗环', '又亮又宽的冰环', '木星光环不存在'], answer: 0 } },
      { id: 'probe_orbiter', icon: '🛰️', title: '伽利略号环绕木星', sub: '1995—2003，还释放了大气探针 · 轨道和大小示意', photo: { src: 'assets/photos/galileo.png', credit: 'NASA · Galileo 航天器模型' }, actions: [{ id: 'go', label: '🛰️ 看大气探针' }], quiz: { options: ['伽利略号', '帕克号', '哈勃号'], answer: 0 } },
      { id: 'probe_juno', icon: '🛰️', title: '朱诺号从两极看木星', sub: '2016 年抵达，发现模糊核心和极区气旋 · 极轨示意', photo: { src: 'assets/photos/polar-cyclones.jpg', credit: 'NASA/JPL-Caltech/SwRI/MSSS/ASI/INAF/JIRAM · Juno 极区观测' }, actions: [{ id: 'go', label: '🛰️ 飞一次极轨' }], quiz: { options: ['模糊的核心', '坚硬的铁球核心', '城市灯光'], answer: 0 } },
      { id: 'probe_future', icon: '🧭', title: '下一批探测器在路上', sub: 'JUICE、欧罗巴快船和计划中的天问四号', photo: { src: 'assets/photos/juice.jpg', credit: 'ESA/ATG Medialab · JUICE 艺术想象图（CC BY-SA 3.0 IGO）' }, actions: [{ id: 'go', label: '🚀 看看时间表' }], quiz: { options: ['JUICE 和欧罗巴快船', '阿波罗 11 号', '国际空间站'], answer: 0 } },
    ],
  },
};
