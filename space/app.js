/**
 * 太阳系 3D 探索 - 柳智天的宇宙课堂
 * 使用 Three.js 创建的交互式太阳系动画
 */

// ============ 行星数据 ============
const planetData = {
    sun: {
        name: '太阳',
        nameCN: '太阳',
        nameEN: 'Sun',
        type: '恒星',
        diameter: 1392700, // km
        mass: 1989100, // 10²⁴ kg
        category: 'star',
        distance: 0,
        orbitPeriod: 0,
        rotationPeriod: 25.4, // 天
        color: 0xffcc00,
        emissive: 0xff6600,
        description: '🔥 太阳是一颗炙热的恒星，核心温度高达1500万度！表面温度也有5500度，任何靠近它的东西都会被瞬间蒸发。它的直径是地球的109倍，体积是地球的130万倍！如果太阳是一个篮球，地球只有一粒豌豆那么大。你看到的表面翻滚的火焰叫做"日珥"，每秒释放的能量相当于1000亿颗核弹！',
        relativeSize: 109.2,
        texture: null
    },
    mercury: {
        name: '水星',
        nameCN: '水星',
        nameEN: 'Mercury',
        type: '类地行星',
        diameter: 4879,
        mass: 0.330, // 10²⁴ kg
        category: 'terrestrial',
        distance: 57.9, // 百万 km
        orbitPeriod: 88, // 天
        rotationPeriod: 58.6,
        color: 0xb5b5b5,
        emissive: 0x333333,
        description: '水星是离太阳最近的行星，也是太阳系中最小的行星。它的表面布满了陨石坑，昼夜温差可达600°C！',
        relativeSize: 0.38,
        orbitRadius: 30
    },
    venus: {
        name: '金星',
        nameCN: '金星',
        nameEN: 'Venus',
        type: '类地行星',
        diameter: 12104,
        mass: 4.87, // 10²⁴ kg
        category: 'terrestrial',
        distance: 108.2,
        orbitPeriod: 224.7,
        rotationPeriod: 243,
        color: 0xe6c87a,
        emissive: 0x8b7355,
        description: '金星是太阳系中最热的行星，表面温度高达465°C！它的大小和地球相似，被称为地球的"姐妹星"。有趣的是，金星的一天比它的一年还要长！',
        relativeSize: 0.95,
        orbitRadius: 45
    },
    earth: {
        name: '地球',
        nameCN: '地球',
        nameEN: 'Earth',
        type: '类地行星',
        diameter: 12742,
        mass: 5.97, // 10²⁴ kg
        category: 'terrestrial',
        distance: 149.6,
        orbitPeriod: 365.25,
        rotationPeriod: 1,
        color: 0x6b93d6,
        emissive: 0x1a4d1a,
        description: '地球是我们的家园，也是目前已知唯一存在生命的行星。它拥有液态水、适宜的温度和保护性的大气层，这些条件使生命得以繁衍。',
        relativeSize: 1,
        orbitRadius: 62,
        moonCount: 1,
        moonInfo: '🌙 天然卫星(1颗)：月球\n🛰️ 人造卫星(数千颗)：国际空间站ISS、中国天宫空间站、哈勃望远镜、韦伯望远镜、GPS卫星群、北斗卫星、气象卫星、通信卫星等'
    },
    moon: {
        name: '月球',
        nameCN: '月球',
        nameEN: 'Moon',
        type: '卫星',
        diameter: 3474,
        mass: 0.0735, // 10²⁴ kg
        category: 'moon',
        distance: 0.384, // 距地球 384,400 km
        orbitPeriod: 27.3, // 天
        rotationPeriod: 27.3, // 同步自转
        color: 0xaaaaaa,
        emissive: 0x222222,
        description: '月球是地球唯一的天然卫星，也是人类唯一登陆过的地外天体。月球表面布满了陨石坑，没有大气层，昼夜温差极大。它的引力影响着地球的潮汐。',
        relativeSize: 0.27
    },
    mars: {
        name: '火星',
        nameCN: '火星',
        nameEN: 'Mars',
        type: '类地行星',
        diameter: 6779,
        mass: 0.642, // 10²⁴ kg
        category: 'terrestrial',
        distance: 227.9,
        orbitPeriod: 687,
        rotationPeriod: 1.03,
        color: 0xc1440e,
        emissive: 0x8b0000,
        description: '火星因其红色外观被称为"红色星球"。它有太阳系中最高的山（奥林匹斯山，高度是珠穆朗玛峰的3倍）和最大的峡谷。科学家正在探索在火星上建立人类基地的可能性！',
        relativeSize: 0.53,
        orbitRadius: 85,
        moonCount: 2,
        moonInfo: '🌙 卫星(2颗)：火卫一（福波斯）- 形状不规则的小卫星；火卫二（德莫斯）- 更小的土豆形卫星'
    },
    ceres: {
        name: '谷神星',
        nameCN: '谷神星',
        nameEN: 'Ceres',
        type: '矮行星',
        diameter: 940, // km
        mass: 0.000938, // 10²⁴ kg
        category: 'dwarf',
        distance: 414, // 百万 km（平均日距）
        orbitPeriod: 1682, // 天（约 4.6 年）
        rotationPeriod: 0.378, // 天（约 9 小时）
        color: 0x9a9a8a,
        emissive: 0x3a3a30,
        description: '谷神星是小行星带中最大的天体，也是太阳系中最小的矮行星。它由意大利天文学家皮亚齐在1801年发现。2015年黎明号探测器发现谷神星表面有神秘的亮斑，可能是盐类沉积物。谷神星直径约940公里，含有大量的冰和矿物质，科学家认为它的地壳下可能存在液态水海洋！',
        relativeSize: 0.074, // 940/12742
        orbitRadius: 110 // 在小行星带内（innerRadius=100, outerRadius=120）
    },
    ganymede: {
        name: '木卫三',
        nameCN: '木卫三',
        nameEN: 'Ganymede',
        type: '卫星',
        diameter: 5268, // km — 太阳系最大的卫星
        mass: 0.1482, // 10²⁴ kg
        category: 'moon',
        distance: 778.5, // 百万 km（随木星绕日）
        orbitPeriod: 4333, // 天（木星公转周期）
        rotationPeriod: 7.15, // 天（同步自转，绕木星一圈）
        color: 0xaabbcc,
        emissive: 0x334455,
        description: '木卫三（盖尼米德）是太阳系中最大的卫星，比水星还大！它是唯一拥有自身磁场的卫星。表面有两种地形：古老的暗色区域布满陨石坑，年轻的亮色区域有很多沟槽和山脊。科学家认为它的冰壳下面可能有一片比地球所有海洋加起来还大的咸水海洋！',
        relativeSize: 0.413 // 5268/12742
    },
    jupiter: {
        name: '木星',
        nameCN: '木星',
        nameEN: 'Jupiter',
        type: '气态巨行星',
        diameter: 139820,
        mass: 1898, // 10²⁴ kg
        category: 'jovian',
        distance: 778.5,
        orbitPeriod: 4333,
        rotationPeriod: 0.41,
        color: 0xd8ca9d,
        emissive: 0x8b7355,
        description: '木星是太阳系中最大的行星，它的体积是地球的1300多倍！木星著名的大红斑是一个持续了数百年的巨大风暴，比地球还要大。',
        relativeSize: 11.2,
        orbitRadius: 130,
        moonCount: 95,
        moonInfo: '🌙 卫星(95颗)：四大伽利略卫星 - 木卫一（艾奥，火山最活跃）、木卫二（欧罗巴，冰下有海洋）、木卫三（盖尼米德，最大卫星）、木卫四（卡利斯托，古老冰世界）'
    },
    saturn: {
        name: '土星',
        nameCN: '土星',
        nameEN: 'Saturn',
        type: '气态巨行星',
        diameter: 116460,
        mass: 568, // 10²⁴ kg
        category: 'jovian',
        distance: 1432,
        orbitPeriod: 10759,
        rotationPeriod: 0.44,
        color: 0xead6b8,
        emissive: 0xc4a35a,
        description: '土星以其壮观的环系统而闻名，这些环主要由冰块和岩石碎片组成。土星的密度非常低，如果有一个足够大的浴缸，土星可以漂浮在水面上！',
        relativeSize: 9.45,
        orbitRadius: 175,
        hasRings: true,
        moonCount: 146,
        moonInfo: '🌙 卫星(146颗)：土卫六（泰坦，有浓厚大气层和液态甲烷湖）、土卫二（恩克拉多斯，南极喷射冰泉）、土卫五（瑞亚，冰质卫星）'
    },
    uranus: {
        name: '天王星',
        nameCN: '天王星',
        nameEN: 'Uranus',
        type: '冰巨行星',
        diameter: 50724,
        mass: 86.8, // 10²⁴ kg
        category: 'jovian',
        distance: 2867,
        orbitPeriod: 30687,
        rotationPeriod: 0.72,
        color: 0x7de8d5,
        emissive: 0x3a9a8c,
        description: '天王星是一颗"躺着"转的行星，它的自转轴几乎与公转轨道平面平行。它呈现出美丽的蓝绿色，这是因为大气中的甲烷吸收了红光。',
        relativeSize: 4.0,
        orbitRadius: 220,
        moonCount: 28,
        moonInfo: '🌙 卫星(28颗)：天卫三（泰坦尼亚，最大卫星）、天卫四（奥伯龙，布满陨石坑）、天卫五（米兰达，有奇特地形）'
    },
    neptune: {
        name: '海王星',
        nameCN: '海王星',
        nameEN: 'Neptune',
        type: '冰巨行星',
        diameter: 49244,
        mass: 102, // 10²⁴ kg
        category: 'jovian',
        distance: 4515,
        orbitPeriod: 60190,
        rotationPeriod: 0.67,
        color: 0x5b5ddf,
        emissive: 0x1a1a8b,
        description: '海王星是太阳系中最远的行星，也是风速最快的行星，风速可达每小时2100公里！它的深蓝色外观让它以古罗马海神的名字命名。',
        relativeSize: 3.88,
        orbitRadius: 260,
        moonCount: 16,
        moonInfo: '🌙 卫星(16颗)：海卫一（特里同，逆行轨道，表面有氮冰喷泉，可能是被捕获的柯伊伯带天体）'
    },
    pluto: {
        name: '冥王星',
        nameCN: '冥王星',
        nameEN: 'Pluto',
        type: '矮行星',
        diameter: 2377,
        mass: 0.0130, // 10²⁴ kg
        category: 'dwarf',
        distance: 5906,
        orbitPeriod: 90560,
        rotationPeriod: 6.4,
        color: 0xc9b59a,
        emissive: 0x4a4035,
        description: '冥王星曾是第九大行星，2006年被重新分类为矮行星。它位于柯伊伯带内，表面有一个心形的氮冰平原"冥王之心"。2015年新视野号探测器首次飞掠冥王星，揭示了它丰富的地质特征。',
        relativeSize: 0.18,
        orbitRadius: 340,
        moonCount: 5,
        moonInfo: '🌙 卫星(5颗)：冥卫一（卡戎，大小接近冥王星的一半，两者互相潮汐锁定）、冥卫二、冥卫三、冥卫四、冥卫五'
    },
    haumea: {
        name: '妊神星',
        nameCN: '妊神星',
        nameEN: 'Haumea',
        type: '矮行星',
        diameter: 1632,
        mass: 0.0040, // 10²⁴ kg
        category: 'dwarf',
        distance: 6452,
        orbitPeriod: 104096,
        rotationPeriod: 0.16,
        color: 0xdad7cf,
        emissive: 0x5d5a52,
        description: '妊神星位于柯伊伯带，是一颗转得飞快的矮行星，快到把自己甩成了橄榄球一样的长椭球形。它表面覆盖着明亮的水冰，还拥有一条细细的环和两颗已知卫星，是太阳系里很特别的冰世界。',
        relativeSize: 0.13,
        orbitRadius: 370,
        moonCount: 2,
        moonInfo: '🌙 卫星(2颗)：妊卫一 Hiʻiaka（较大的外侧卫星）、妊卫二 Namaka（更靠内的小卫星）'
    },
    makemake: {
        name: '鸟神星',
        nameCN: '鸟神星',
        nameEN: 'Makemake',
        type: '矮行星',
        diameter: 1430,
        mass: 0.0031, // 10²⁴ kg
        category: 'dwarf',
        distance: 6850,
        orbitPeriod: 111401,
        rotationPeriod: 0.94,
        color: 0xc67555,
        emissive: 0x5a2d1d,
        description: '鸟神星位于柯伊伯带深处，表面带着偏红的冰冻甲烷色调，看起来像一颗被冰霜包裹的橘红色小世界。它以复活节岛神话中的创造之神命名，目前已知有一颗小卫星伴随它一起绕太阳运行。',
        relativeSize: 0.11,
        orbitRadius: 390,
        moonCount: 1,
        moonInfo: '🌙 卫星(1颗)：S/2015 (136472) 1（Makemake 的小卫星，常被称作 MK2）'
    },
    eris: {
        name: '阋神星',
        nameCN: '阋神星',
        nameEN: 'Eris',
        type: '矮行星',
        diameter: 2326,
        mass: 0.0165, // 10²⁴ kg
        category: 'dwarf',
        distance: 10149,
        orbitPeriod: 204175,
        rotationPeriod: 1.08,
        color: 0xd7d7d7,
        emissive: 0x4a4a4a,
        description: '阋神星是太阳系中最著名的外海矮行星之一，它比冥王星更重，轨道也更远、更偏心。正是它的发现推动了天文学家重新定义“行星”，最终让冥王星被归类为矮行星。',
        relativeSize: 0.18,
        orbitRadius: 440,
        moonCount: 1,
        moonInfo: '🌙 卫星(1颗)：阋卫一 Dysnomia，陪着阋神星一起在太阳系边缘漫游'
    },
    oortCloud: {
        name: '奥尔特云',
        nameCN: '奥尔特云',
        nameEN: 'Oort Cloud',
        type: '彗星云团',
        diameter: 200000, // AU（约 30 万亿公里直径）
        mass: 5, // 约5倍地球质量（估计值）
        category: 'region',
        distance: 50000, // AU（到太阳平均距离）
        orbitPeriod: 0,
        rotationPeriod: 0,
        color: 0xaaddff,
        emissive: 0x334466,
        description: '☄️ 奥尔特云是太阳系最遥远的边疆！它是一个巨大的球形云团，包裹着整个太阳系，由数万亿颗冰冻天体组成。这些冰块偶尔会被扰动，飞向太阳变成壮观的长周期彗星。奥尔特云距太阳约2000到100000天文单位（AU），光都要走1年多才能到达边缘！如果把太阳系比作一座城市，行星只占客厅，而奥尔特云就是整座城市的边界。',
        relativeSize: 0
    }
};

// ============ 太阳系介绍浮层数据 ============
const solarGuideTravelItems = [
    { type: 'planet', key: 'mercury', nameCN: '水星', nameEN: 'Mercury', time: '3分13秒' },
    { type: 'planet', key: 'venus', nameCN: '金星', nameEN: 'Venus', time: '6分05秒' },
    { type: 'planet', key: 'earth', nameCN: '地球', nameEN: 'Earth', time: '8分17秒' },
    { type: 'planet', key: 'mars', nameCN: '火星', nameEN: 'Mars', time: '12分39秒' },
    { type: 'belt', title: '小行星带', line1: '约 100 万颗', line2: '直径 > 1 km' },
    { type: 'planet', key: 'jupiter', nameCN: '木星', nameEN: 'Jupiter', time: '43分28秒' },
    { type: 'planet', key: 'saturn', nameCN: '土星', nameEN: 'Saturn', time: '1时18分' },
    { type: 'planet', key: 'uranus', nameCN: '天王星', nameEN: 'Uranus', time: '2时40分' },
    { type: 'planet', key: 'neptune', nameCN: '海王星', nameEN: 'Neptune', time: '4时02分' },
    { type: 'planet', key: 'pluto', nameCN: '冥王星', nameEN: 'Pluto', time: '4时46分' }
];

const solarGuideTimeline = [
    { year: '约46亿年前', label: '太阳系形成' },
    { year: '约45亿年前', label: '小行星带形成' },
    { year: '约45亿年前', label: '地球形成' },
    { year: '约38亿年前', label: '生命起源' },
    { year: '约6600万年前', label: '恐龙灭绝' },
    { year: '约300万年前', label: '人类出现' },
    { year: '20世纪中叶', label: '太空时代' }
];

const solarGuidePlanetCards = [
    {
        key: 'mercury',
        nameCN: '水星',
        nameEN: 'Mercury',
        diameter: '4,879 km',
        distance: '57,909,227 km',
        rotation: '58.6 地球日<br>约等于 58.6 天',
        orbit: '88 地球日<br>约等于 0.24 年',
        temperature: '-180°C ~ 430°C',
        moons: '0',
        quote: '我虽然是最小的，但跑得很快，因为我离太阳最近！',
        accent: '#b89564',
        outline: 'rgba(184, 149, 100, 0.38)',
        glow: 'rgba(184, 149, 100, 0.34)'
    },
    {
        key: 'venus',
        nameCN: '金星',
        nameEN: 'Venus',
        diameter: '12,104 km',
        distance: '108,209,475 km',
        rotation: '243 地球日<br>约等于 243 天',
        orbit: '224.7 地球日<br>约等于 0.62 年',
        temperature: '462°C ~ 472°C',
        moons: '0',
        quote: '我很热情，但我的爱会让你窒息，欢迎来到地狱级高温！',
        accent: '#d8a45b',
        outline: 'rgba(216, 164, 91, 0.38)',
        glow: 'rgba(216, 164, 91, 0.34)'
    },
    {
        key: 'earth',
        nameCN: '地球',
        nameEN: 'Earth',
        diameter: '12,742 km',
        distance: '149,598,023 km',
        rotation: '1 地球日<br>约等于 1 天',
        orbit: '365.25 地球日<br>约等于 1 年',
        temperature: '-88°C ~ 58°C',
        moons: '1',
        quote: '我是你唯一的家园，请好好珍惜我，别让我生病了！',
        accent: '#57a8ff',
        outline: 'rgba(87, 168, 255, 0.38)',
        glow: 'rgba(87, 168, 255, 0.34)'
    },
    {
        key: 'mars',
        nameCN: '火星',
        nameEN: 'Mars',
        diameter: '6,779 km',
        distance: '227,943,824 km',
        rotation: '1.03 地球日<br>约等于 1.03 天',
        orbit: '687 地球日<br>约等于 1.88 年',
        temperature: '-140°C ~ -20°C',
        moons: '2',
        quote: '人类总想来我这里定居，也许有一天，我会不再孤单。',
        accent: '#ff8357',
        outline: 'rgba(255, 131, 87, 0.38)',
        glow: 'rgba(255, 131, 87, 0.34)'
    },
    {
        key: 'jupiter',
        nameCN: '木星',
        nameEN: 'Jupiter',
        diameter: '139,820 km',
        distance: '778,340,821 km',
        rotation: '0.41 地球日<br>约等于 0.41 天',
        orbit: '4333 地球日<br>约等于 11.86 年',
        temperature: '-145°C',
        moons: '95+',
        quote: '我是太阳系的大哥，肚子上有个大红斑，比地球还大！',
        accent: '#d59d69',
        outline: 'rgba(213, 157, 105, 0.38)',
        glow: 'rgba(213, 157, 105, 0.34)'
    },
    {
        key: 'saturn',
        nameCN: '土星',
        nameEN: 'Saturn',
        diameter: '116,460 km',
        distance: '1,426,666,422 km',
        rotation: '0.45 地球日<br>约等于 0.45 天',
        orbit: '10759 地球日<br>约等于 29.46 年',
        temperature: '-178°C',
        moons: '146+',
        quote: '我的环是最美的，但我可不是靠脸吃饭的，我很有气质！',
        accent: '#e2c06e',
        outline: 'rgba(226, 192, 110, 0.38)',
        glow: 'rgba(226, 192, 110, 0.34)'
    },
    {
        key: 'uranus',
        nameCN: '天王星',
        nameEN: 'Uranus',
        diameter: '50,724 km',
        distance: '2,870,658,186 km',
        rotation: '0.72 地球日<br>约等于 0.72 天',
        orbit: '30687 地球日<br>约等于 84.0 年',
        temperature: '-224°C',
        moons: '27',
        quote: '我喜欢躺着转，因为我特立独行，不需要理由。',
        accent: '#68d7df',
        outline: 'rgba(104, 215, 223, 0.38)',
        glow: 'rgba(104, 215, 223, 0.34)'
    },
    {
        key: 'neptune',
        nameCN: '海王星',
        nameEN: 'Neptune',
        diameter: '49,244 km',
        distance: '4,498,396,441 km',
        rotation: '0.67 地球日<br>约等于 0.67 天',
        orbit: '60190 地球日<br>约等于 164.8 年',
        temperature: '-214°C',
        moons: '14',
        quote: '我风暴不断，风速快到离谱，没人比我更狂野！',
        accent: '#7b82ff',
        outline: 'rgba(123, 130, 255, 0.38)',
        glow: 'rgba(123, 130, 255, 0.34)'
    },
    {
        key: 'pluto',
        nameCN: '冥王星',
        nameEN: 'Pluto',
        diameter: '2,377 km',
        distance: '5,906,376,272 km',
        rotation: '6.4 地球日<br>约等于 6.4 天',
        orbit: '90560 地球日<br>约等于 247.94 年',
        temperature: '-229°C ~ -243°C',
        moons: '5',
        quote: '曾经的第九行星，2006 年被降级，但我依然很酷！',
        accent: '#c9ab8d',
        outline: 'rgba(201, 171, 141, 0.38)',
        glow: 'rgba(201, 171, 141, 0.34)'
    }
];

const solarGuideTextureMap = {
    sun: 'textures/sun.jpg',
    mercury: 'textures/mercury.jpg',
    venus: 'textures/venus_atmosphere.jpg',
    earth: 'textures/earth_daymap.jpg',
    mars: 'textures/mars.jpg',
    jupiter: 'textures/jupiter.jpg',
    saturn: 'textures/saturn.jpg',
    uranus: 'textures/uranus.jpg',
    neptune: 'textures/neptune.jpg',
    pluto: 'textures/pluto.jpg',
    haumea: 'textures/haumea.jpg',
    makemake: 'textures/makemake.jpg',
    eris: 'textures/eris.jpg'
};

// ============ 全局变量 ============
let scene, camera, renderer, controls;
let planets = {};
let moons = {}; // 所有卫星
let orbits = {};
let labels = {};
let sun;
let moon; // 月球（保留兼容）
let asteroidBelt; // 小行星带
let satellites = []; // 人造卫星
let kuiperBelt; // 柯伊伯带
let oortCloudInner;  // 内奥尔特云粒子
let oortCloudOuter;  // 外奥尔特云球壳
let oortCloudBoundary; // 边界标识

// ============ 音频播放（Edge-TTS MP3 + Web Speech API 降级） ============
let currentAudio = null;
let collisionAudioContext = null;

function playPlanetAudio(planetKey) {
    // 停止上一段音频
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    window.speechSynthesis && window.speechSynthesis.cancel();

    const data = planetData[planetKey];
    if (!data || !data.nameEN) return;

    // 构造降级文本
    const fallbackText = planetAudioNarration[planetKey] || `${data.nameCN}，${data.nameEN}`;

    const audioPath = `audio/solar/${planetKey}.mp3`;
    const audio = new Audio(audioPath);
    currentAudio = audio;

    audio.play().catch(() => {
        // MP3 加载失败，降级到 Web Speech API
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(fallbackText);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    });
}

function getCollisionAudioContext() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        if (!collisionAudioContext || collisionAudioContext.state === 'closed') {
            collisionAudioContext = new AudioCtx();
        }
        if (collisionAudioContext.state === 'suspended') {
            collisionAudioContext.resume();
        }
        return collisionAudioContext;
    } catch (e) {
        return null;
    }
}

function playCollisionTick(ctx, when, options = {}) {
    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const baseFrequency = options.baseFrequency || 800;
        const volume = options.volume || 0.11;
        const duration = options.duration || 0.055;

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(baseFrequency + (Math.random() - 0.5) * 220, when);
        osc.type = options.type || 'sine';
        gain.gain.setValueAtTime(volume, when);
        gain.gain.exponentialRampToValueAtTime(0.008, when + duration);
        osc.start(when);
        osc.stop(when + duration);
    } catch (e) {
        // 声音只是增强体验，失败时不影响主动画
    }
}

function playCollisionBurst(options = {}) {
    const ctx = getCollisionAudioContext();
    if (!ctx) return;

    const count = options.count || 18;
    const interval = options.interval || 0.085;
    const baseFrequency = options.baseFrequency || 800;
    const volume = options.volume || 0.1;
    const now = ctx.currentTime;

    for (let i = 0; i < count; i++) {
        const decay = 1 - (i / count) * 0.45;
        const jitter = Math.random() * 0.025;
        playCollisionTick(ctx, now + i * interval + jitter, {
            baseFrequency,
            volume: volume * decay,
            duration: 0.045 + Math.random() * 0.025,
            type: i % 3 === 0 ? 'triangle' : 'sine'
        });
    }
}

function playVolumeFillCollisionSound(targetCount, targetType = 'sun') {
    const countByScale = targetCount >= 1000000000 ? 24 : targetCount >= 1000000 ? 20 : targetCount >= 10000 ? 16 : 12;
    playCollisionBurst({
        count: countByScale,
        interval: targetType === 'blackHole' ? 0.07 : 0.09,
        baseFrequency: targetType === 'blackHole' ? 620 : 800,
        volume: targetType === 'blackHole' ? 0.085 : 0.105
    });
}

// 每个天体的语音介绍文本（用于 MP3 和 TTS 降级）
const planetAudioNarration = {
    sun: '太阳，Sun，太阳系的中心恒星。自转转完一整圈，约等于25.4个地球天。',
    mercury: '水星，Mercury，距离太阳0.4个天文单位。自转转完一整圈，约等于58.6个地球天。绕太阳公转一整圈，约等于0.24个地球年。',
    venus: '金星，Venus，距离太阳0.7个天文单位。自转转完一整圈，约等于243个地球天。绕太阳公转一整圈，约等于0.62个地球年。',
    earth: '地球，Earth，距离太阳1个天文单位。自转转完一整圈，约等于1个地球天。绕太阳公转一整圈，约等于1个地球年。',
    moon: '月球，Moon，地球的天然卫星。自转转完一整圈，约等于27.3个地球天。绕地球公转一整圈，约等于27.3个地球天。',
    mars: '火星，Mars，距离太阳1.5个天文单位。自转转完一整圈，约等于1.03个地球天。绕太阳公转一整圈，约等于1.88个地球年。',
    ceres: '谷神星，Ceres，距离太阳2.8个天文单位。自转转完一整圈，约等于0.38个地球天。绕太阳公转一整圈，约等于4.6个地球年。',
    jupiter: '木星，Jupiter，距离太阳5.2个天文单位。自转转完一整圈，约等于0.41个地球天。绕太阳公转一整圈，约等于11.86个地球年。',
    saturn: '土星，Saturn，距离太阳9.5个天文单位。自转转完一整圈，约等于0.45个地球天。绕太阳公转一整圈，约等于29.46个地球年。',
    uranus: '天王星，Uranus，距离太阳19.2个天文单位。自转转完一整圈，约等于0.72个地球天。绕太阳公转一整圈，约等于84个地球年。',
    neptune: '海王星，Neptune，距离太阳30个天文单位。自转转完一整圈，约等于0.67个地球天。绕太阳公转一整圈，约等于164.8个地球年。',
    pluto: '冥王星，Pluto，距离太阳39.5个天文单位。自转转完一整圈，约等于6.4个地球天。绕太阳公转一整圈，约等于247.94个地球年。',
    haumea: '妊神星，Haumea，距离太阳43.1个天文单位。自转转完一整圈，约等于0.16个地球天。绕太阳公转一整圈，约等于285个地球年。',
    makemake: '鸟神星，Makemake，距离太阳45.8个天文单位。自转转完一整圈，约等于0.94个地球天。绕太阳公转一整圈，约等于305个地球年。',
    eris: '阋神星，Eris，距离太阳67.7个天文单位。自转转完一整圈，约等于1.08个地球天。绕太阳公转一整圈，约等于559个地球年。',
};

// ============ 人造卫星数据 ============
const satellitesData = [
    { name: '国际空间站', nameCN: '国际空间站 ISS', orbitRadius: 1.8, orbitSpeed: 0.15, size: 0.15, color: 0xcccccc, inclination: 0.3 },
    { name: '中国空间站', nameCN: '天宫空间站', orbitRadius: 1.9, orbitSpeed: 0.14, size: 0.12, color: 0xffcc00, inclination: 0.25 },
    { name: '哈勃望远镜', nameCN: '哈勃望远镜', orbitRadius: 2.1, orbitSpeed: 0.12, size: 0.08, color: 0xaaaaff, inclination: 0.2 },
    { name: '韦伯望远镜', nameCN: '韦伯望远镜', orbitRadius: 3.5, orbitSpeed: 0.05, size: 0.1, color: 0xffdd88, inclination: 0.1 },
    { name: 'GPS卫星1', nameCN: 'GPS卫星', orbitRadius: 2.5, orbitSpeed: 0.08, size: 0.05, color: 0x44ff44, inclination: 0.4 },
    { name: 'GPS卫星2', nameCN: 'GPS卫星', orbitRadius: 2.5, orbitSpeed: 0.08, size: 0.05, color: 0x44ff44, inclination: -0.4, startAngle: 2.0 },
    { name: 'GPS卫星3', nameCN: 'GPS卫星', orbitRadius: 2.5, orbitSpeed: 0.08, size: 0.05, color: 0x44ff44, inclination: 0.1, startAngle: 4.0 },
    { name: '通信卫星1', nameCN: '通信卫星', orbitRadius: 3.0, orbitSpeed: 0.06, size: 0.04, color: 0xff8844, inclination: 0, startAngle: 1.0 },
    { name: '通信卫星2', nameCN: '通信卫星', orbitRadius: 3.0, orbitSpeed: 0.06, size: 0.04, color: 0xff8844, inclination: 0, startAngle: 3.5 },
    { name: '气象卫星', nameCN: '气象卫星', orbitRadius: 2.8, orbitSpeed: 0.07, size: 0.05, color: 0x88ddff, inclination: 0.5 },
    { name: '北斗卫星', nameCN: '北斗卫星', orbitRadius: 2.6, orbitSpeed: 0.075, size: 0.05, color: 0xff4444, inclination: 0.35, startAngle: 5.0 }
];
let starField;
let animationId;
let isAnimating = true;
let showOrbits = true;
let showLabels = true;
let isRealScale = false;
let selectedPlanet = null;
let clock;
let raycaster, mouse;
let currentSunStyle = 'simple'; // 'simple' 或 'realistic'
let currentComparisonMetric = 'diameter'; // 'diameter' 或 'mass'
let currentComparisonTab = 'diameter'; // 'diameter' 或各个“能装”页签
let isDiameterDetailMode = false; // 按直径页签内的小天体放大模式
let currentVolumeSelection = 'earth'; // volume tab（太阳）中选中的星球
let currentJupiterVolumeSelection = 'earth'; // jupiterVolume tab 中选中的星球
let currentSaturnVolumeSelection = 'earth'; // saturnVolume tab 中选中的星球
let currentUranusVolumeSelection = 'earth'; // uranusVolume tab 中选中的星球
let currentNeptuneVolumeSelection = 'earth'; // neptuneVolume tab 中选中的星球
let currentBlackHoleVolumeSelection = 'earth'; // blackHoleVolume tab 中选中的星球
let dragVolumeAnimationId = null; // 拖进太阳动画帧 ID
let activeDragCleanup = null; // 当前拖拽态的兜底清理函数
let pendingDragResultRevealIds = []; // 拖拽结果延时显隐定时器
let isRealMotion = false; // 是否使用真实自转 / 公转比例

// 折合后的“真实运动”速度
// 公转：1 秒约等于 24 个地球日，地球绕太阳一圈约 15.2 秒
// 自转：1 秒约等于 0.2 个地球日，地球自转一圈约 5 秒
const REAL_ORBIT_DAYS_PER_SECOND = 24;
const REAL_ROTATION_DAYS_PER_SECOND = 0.2;
const REAL_SCALE_REFERENCE_DIAMETER = planetData.jupiter.diameter;
const REAL_SCALE_REFERENCE_SIZE = 4 + planetData.jupiter.relativeSize * 0.4;
const BLACK_HOLE_EVENT_HORIZON_RADIUS_KM = 12000000;
const BLACK_HOLE_SOLAR_SYSTEM_SET_COUNT = 5123;

function clearPendingDragResultReveal(resetContent = false) {
    pendingDragResultRevealIds.forEach(id => clearTimeout(id));
    pendingDragResultRevealIds = [];

    const resultNum = document.getElementById('dragResultNumber');
    const resultText = document.getElementById('dragResultText');
    if (resultNum) {
        resultNum.classList.remove('visible');
        if (resetContent) {
            resultNum.textContent = '';
        }
    }
    if (resultText) {
        resultText.classList.remove('visible');
        if (resetContent) {
            resultText.textContent = '';
        }
    }

    if (activeDragCleanup === clearDragResultState) {
        activeDragCleanup = null;
    }
}

function clearDragResultState() {
    clearPendingDragResultReveal(true);
}

function scheduleDragResultReveal(fn, delay = 50) {
    const timeoutId = setTimeout(() => {
        pendingDragResultRevealIds = pendingDragResultRevealIds.filter(id => id !== timeoutId);
        fn();
    }, delay);
    pendingDragResultRevealIds.push(timeoutId);
}

function runActiveDragCleanup(skipCleanup) {
    if (activeDragCleanup && activeDragCleanup !== skipCleanup) {
        activeDragCleanup();
    }
}
const BLACK_HOLE_MASS_IN_SOLAR_MASSES = 4000000;
const BLACK_HOLE_TEXTURE_PATH = 'textures/2.png';
const blackHoleTextureImage = new Image();
blackHoleTextureImage.src = BLACK_HOLE_TEXTURE_PATH;

// 银河系中心黑洞 Sgr A*，按事件视界半径约 1200 万公里的球形空间估算
const blackHoleVolumeData = [
    { key: 'sun',      nameCN: '太阳',   count: 5132,           label: '5,132',      color: '#ffcc00' },
    { key: 'mercury',  nameCN: '水星',   count: 119000000000,   label: '1190 亿',    color: '#b5b5b5' },
    { key: 'venus',    nameCN: '金星',   count: 7800000000,     label: '78 亿',      color: '#e6c87a' },
    { key: 'earth',    nameCN: '地球',   count: 6700000000,     label: '67 亿',      color: '#6b93d6' },
    { key: 'mars',     nameCN: '火星',   count: 44400000000,    label: '444 亿',     color: '#c1440e' },
    { key: 'jupiter',  nameCN: '木星',   count: 5060000,        label: '506 万',     color: '#d8ca9d' },
    { key: 'saturn',   nameCN: '土星',   count: 8750000,        label: '875 万',     color: '#ead6b8' },
    { key: 'uranus',   nameCN: '天王星', count: 106000000,      label: '1.06 亿',    color: '#7de8d5' },
    { key: 'neptune',  nameCN: '海王星', count: 116000000,      label: '1.16 亿',    color: '#5b5ddf' },
    { key: 'pluto',    nameCN: '冥王星', count: 1030000000000,  label: '1.03 万亿',  color: '#c9b59a' },
    { key: 'eris',     nameCN: '阋神星', count: 1000000000000,  label: '1.00 万亿',  color: '#d7d7d7' },
    { key: 'haumea',   nameCN: '妊神星', count: 4730000000000,  label: '4.73 万亿',  color: '#dad7cf' },
    { key: 'makemake', nameCN: '鸟神星', count: 4750000000000,  label: '4.75 万亿',  color: '#c67555' },
    { key: 'ceres',    nameCN: '谷神星', count: 16680000000000, label: '16.68 万亿', color: '#9a9a8a' }
];

// ============ 卫星数据 ============
const moonsData = {
    // 火星的卫星
    mars: [
        { name: '火卫一', nameCN: '火卫一', diameter: 22.2, orbitRadius: 2.5, orbitSpeed: 0.08, color: 0x8b7355, desc: '福波斯，贴近火星的不规则小卫星', texturePath: 'textures/phobos.jpg', brightness: 1.08, fresnelColor: 'vec3(0.72, 0.62, 0.5)', fresnelIntensity: 0.08, segments: 48 },
        { name: '火卫二', nameCN: '火卫二', diameter: 12.6, orbitRadius: 3.5, orbitSpeed: 0.05, color: 0x9a8b7a, desc: '戴摩斯，更小更暗的外侧卫星', texturePath: 'textures/deimos.jpg', brightness: 1.12, fresnelColor: 'vec3(0.7, 0.66, 0.6)', fresnelIntensity: 0.08, segments: 48 }
    ],
    // 木星的伽利略卫星
    jupiter: [
        { name: '木卫一', nameCN: '木卫一', diameter: 3643, orbitRadius: 8, orbitSpeed: 0.07, color: 0xffdd44, desc: '艾奥，火山最活跃的天体', texturePath: 'textures/io.jpg', brightness: 1.08, fresnelColor: 'vec3(1.0, 0.72, 0.28)', fresnelIntensity: 0.08, segments: 48 },
        { name: '木卫二', nameCN: '木卫二', diameter: 3122, orbitRadius: 10, orbitSpeed: 0.055, color: 0xccddee, desc: '欧罗巴，冰下可能有海洋', texturePath: 'textures/europa.jpg', brightness: 1.18, fresnelColor: 'vec3(0.82, 0.92, 1.0)', fresnelIntensity: 0.16, segments: 48 },
        { name: '木卫三', nameCN: '木卫三', diameter: 5268, orbitRadius: 12.5, orbitSpeed: 0.04, color: 0xaabbcc, desc: '盖尼米德，最大的卫星', texturePath: 'textures/ganymede.jpg', brightness: 1.1, fresnelColor: 'vec3(0.76, 0.72, 0.62)', fresnelIntensity: 0.07, segments: 48 },
        { name: '木卫四', nameCN: '木卫四', diameter: 4821, orbitRadius: 15, orbitSpeed: 0.03, color: 0x887766, desc: '卡利斯托，古老的冰世界', texturePath: 'textures/callisto.jpg', brightness: 1.08, fresnelColor: 'vec3(0.58, 0.52, 0.42)', fresnelIntensity: 0.06, segments: 48 }
    ],
    // 土星的卫星
    saturn: [
        { name: '土卫六', nameCN: '土卫六', diameter: 5150, orbitRadius: 14, orbitSpeed: 0.035, color: 0xddaa55, desc: '泰坦，有浓厚大气层', texturePath: 'textures/titan.jpg', brightness: 1.1, fresnelColor: 'vec3(0.94, 0.74, 0.36)', fresnelIntensity: 0.12, atmosphereColor: [0.95, 0.7, 0.3], atmosphereSize: 1.07, atmosphereIntensity: 0.18, segments: 48 },
        { name: '土卫二', nameCN: '土卫二', diameter: 504, orbitRadius: 10, orbitSpeed: 0.06, color: 0xffffff, desc: '恩克拉多斯，喷射冰泉', texturePath: 'textures/enceladus.jpg', brightness: 1.24, fresnelColor: 'vec3(0.86, 0.94, 1.0)', fresnelIntensity: 0.18, segments: 48 },
        { name: '土卫五', nameCN: '土卫五', diameter: 1527, orbitRadius: 12, orbitSpeed: 0.045, color: 0xcccccc, desc: '瑞亚，冰质卫星', texturePath: 'textures/rhea.jpg', brightness: 1.12, fresnelColor: 'vec3(0.82, 0.84, 0.88)', fresnelIntensity: 0.1, segments: 48 }
    ],
    // 天王星的卫星
    uranus: [
        { name: '天卫三', nameCN: '天卫三', diameter: 1578, orbitRadius: 7, orbitSpeed: 0.05, color: 0xaabbbb, desc: '泰坦尼亚', texturePath: 'textures/titania.jpg', brightness: 1.14, fresnelColor: 'vec3(0.82, 0.88, 0.94)', fresnelIntensity: 0.08, segments: 48 },
        { name: '天卫四', nameCN: '天卫四', diameter: 1523, orbitRadius: 9, orbitSpeed: 0.04, color: 0x99aaaa, desc: '奥伯龙', texturePath: 'textures/oberon.jpg', brightness: 1.14, fresnelColor: 'vec3(0.8, 0.84, 0.9)', fresnelIntensity: 0.08, segments: 48 }
    ],
    // 海王星的卫星
    neptune: [
        { name: '海卫一', nameCN: '海卫一', diameter: 2707, orbitRadius: 7, orbitSpeed: -0.04, color: 0xddccbb, desc: '特里同，逆行卫星', texturePath: 'textures/triton.jpg', brightness: 1.12, fresnelColor: 'vec3(0.9, 0.86, 0.8)', fresnelIntensity: 0.08, segments: 48 }
    ]
};

// ============ 初始化 ============
function init() {
    clock = new THREE.Clock();

    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000005);

    // 创建相机
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        20000
    );
    camera.position.set(150, 100, 250);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 创建控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 30;
    controls.maxDistance = 2500;
    controls.enablePan = true;

    // 射线检测器
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // 创建场景内容
    createStarfield();
    createSimpleSun(); // 默认使用简洁模式
    createPlanets();
    createMoon();
    createAllMoons(); // 创建所有行星的卫星
    createArtificialSatellites(); // 创建地球人造卫星
    createAsteroidBelt();
    createKuiperBelt(); // 柯伊伯带
    createOortCloud(); // 奥尔特云
    createOrbits();
    addLights();

    // 事件监听
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onMouseClick);
    renderer.domElement.addEventListener('mousemove', onMouseMove);

    // 按钮事件
    setupControls();
    renderPlanetGuide();

    // 生成大小对比
    generateSizeComparison();
    setupComparisonTabs();
    updateModeIndicator();

    // 隐藏加载画面
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 2500);

    // 开始动画
    animate();
}

// ============ 创建星空背景 ============
function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 15000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;

        // 随机位置（球形分布）
        const radius = 1500 + Math.random() * 2000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);

        // 随机颜色（白色、淡蓝色、淡黄色）
        const colorChoice = Math.random();
        if (colorChoice < 0.6) {
            // 白色
            colors[i3] = 1;
            colors[i3 + 1] = 1;
            colors[i3 + 2] = 1;
        } else if (colorChoice < 0.8) {
            // 淡蓝色
            colors[i3] = 0.7;
            colors[i3 + 1] = 0.8;
            colors[i3 + 2] = 1;
        } else {
            // 淡黄色
            colors[i3] = 1;
            colors[i3 + 1] = 0.95;
            colors[i3 + 2] = 0.8;
        }

        // 随机大小
        sizes[i] = Math.random() * 2 + 0.5;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // 自定义着色器让星星更漂亮
    const starsMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            varying float vSize;
            uniform float time;
            
            void main() {
                vColor = color;
                vSize = size;
                
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                float twinkle = sin(time * 2.0 + position.x * 0.01) * 0.3 + 0.7;
                gl_PointSize = size * (300.0 / -mvPosition.z) * twinkle;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vSize;
            
            void main() {
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);
                float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                
                // 添加光晕效果
                float glow = exp(-dist * 3.0) * 0.5;
                
                gl_FragColor = vec4(vColor, (alpha + glow) * 0.9);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
}

// ============ 创建太阳 ============
function createSun() {
    // 太阳本体 - 炙热的核心（纹理 + 动态效果）
    const sunGeometry = new THREE.SphereGeometry(15, 128, 128);
    const textureLoader = new THREE.TextureLoader();
    const sunTexture = textureLoader.load('textures/sun.jpg');
    sunTexture.wrapS = THREE.RepeatWrapping;
    sunTexture.wrapT = THREE.RepeatWrapping;
    const sunMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            sunMap: { value: sunTexture }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vPosition;
            uniform float time;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                vUv = uv;
                vPosition = position;

                // 表面扰动 - 模拟等离子体沸腾
                vec3 pos = position;
                float displacement = sin(pos.x * 3.0 + time * 2.0) * sin(pos.y * 3.0 + time * 1.5) * sin(pos.z * 3.0 + time * 1.8) * 0.3;
                displacement += sin(pos.x * 8.0 - time * 3.0) * sin(pos.y * 8.0 + time * 2.5) * 0.15;
                pos += normal * displacement;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform sampler2D sunMap;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vPosition;

            void main() {
                // 从真实纹理采样太阳表面（米粒组织、黑子等细节）
                // UV 缓慢漂移模拟表面对流
                vec2 uv1 = vUv + vec2(time * 0.005, time * 0.003);
                vec2 uv2 = vUv + vec2(-time * 0.004, time * 0.006);
                vec3 tex1 = texture2D(sunMap, uv1).rgb;
                vec3 tex2 = texture2D(sunMap, uv2).rgb;
                // 两层纹理混合产生动态翻涌感
                vec3 baseColor = mix(tex1, tex2, 0.5);

                // 适度增强对比度，保持纹理细节
                baseColor = pow(baseColor, vec3(0.9)) * 1.15;

                // 边缘暗化（临边昏暗效果 - 太阳真实物理特征）
                float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
                float limbDarkening = pow(max(fresnel, 0.0), 0.5);
                baseColor *= limbDarkening * 0.3 + 0.7;

                // 边缘添加橙红色调
                float edge = pow(1.0 - max(fresnel, 0.0), 2.0);
                baseColor = mix(baseColor, vec3(1.0, 0.4, 0.1), edge * 0.3);

                // 脉动效果
                float pulse = sin(time * 1.5) * 0.05 + 1.0;
                baseColor *= pulse;

                gl_FragColor = vec4(baseColor, 1.0);
            }
        `
    });

    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.name = 'sun';
    sun.userData = planetData.sun;
    scene.add(sun);
    planets.sun = sun;

    // 内层日冕 - 炽热的气体层
    const innerCoronaGeometry = new THREE.SphereGeometry(17, 64, 64);
    const innerCoronaMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            uniform float time;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                
                // 火焰扰动
                vec3 pos = position;
                float wave = sin(position.x * 5.0 + time * 3.0) * sin(position.y * 5.0 - time * 2.0) * 0.5;
                pos += normal * wave;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
                
                // 动态火焰颜色
                float flicker = sin(time * 4.0 + vPosition.x * 3.0) * 0.15 + 0.85;
                float flicker2 = sin(time * 6.0 - vPosition.y * 4.0) * 0.1 + 0.9;
                
                vec3 color = vec3(1.0, 0.5, 0.1) * intensity * flicker * flicker2;
                color += vec3(1.0, 0.8, 0.3) * pow(intensity, 3.0) * 0.5;
                
                gl_FragColor = vec4(color, intensity * 0.8);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false
    });

    const innerCorona = new THREE.Mesh(innerCoronaGeometry, innerCoronaMaterial);
    sun.add(innerCorona);

    // 中层日冕 - 脉动的光环
    const midCoronaGeometry = new THREE.SphereGeometry(22, 64, 64);
    const midCoronaMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            uniform float time;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                
                // 大幅度波动
                vec3 pos = position;
                float wave = sin(position.x * 3.0 + time * 2.0) * sin(position.z * 3.0 + time * 1.5) * 1.5;
                wave += sin(position.y * 4.0 - time * 2.5) * 0.8;
                pos += normal * wave;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                
                // 多层次火焰效果
                float flame1 = sin(time * 3.0 + vPosition.x * 2.0 + vPosition.y * 2.0) * 0.2 + 0.8;
                float flame2 = sin(time * 5.0 - vPosition.z * 3.0) * 0.15 + 0.85;
                
                vec3 color = vec3(1.0, 0.4, 0.05) * intensity * flame1 * flame2;
                
                // 添加亮橙色高光
                color += vec3(1.0, 0.7, 0.2) * pow(intensity, 4.0) * 0.3;
                
                float pulse = sin(time * 2.0) * 0.15 + 0.85;
                
                gl_FragColor = vec4(color * pulse, intensity * 0.5);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false
    });

    const midCorona = new THREE.Mesh(midCoronaGeometry, midCoronaMaterial);
    sun.add(midCorona);

    // 外层日冕 - 扩散的热气
    const outerCoronaGeometry = new THREE.SphereGeometry(30, 64, 64);
    const outerCoronaMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            uniform float time;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                
                // 大范围波动
                vec3 pos = position;
                float wave = sin(position.x * 2.0 + time * 1.5) * sin(position.y * 2.0 - time) * 2.0;
                wave += sin(position.z * 1.5 + time * 1.2) * 1.5;
                pos += normal * wave;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                
                // 柔和的外层光芒
                float glow = sin(time * 1.5 + vPosition.x) * 0.1 + 0.9;
                
                vec3 color = vec3(1.0, 0.3, 0.0) * intensity * glow;
                color += vec3(0.8, 0.2, 0.0) * pow(intensity, 2.0) * 0.5;
                
                gl_FragColor = vec4(color, intensity * 0.35);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false
    });

    const outerCorona = new THREE.Mesh(outerCoronaGeometry, outerCoronaMaterial);
    sun.add(outerCorona);

    // 最外层光晕 - 热浪扩散效果
    const heatWaveGeometry = new THREE.SphereGeometry(40, 32, 32);
    const heatWaveMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            uniform float time;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                
                // 热浪扩散
                vec3 pos = position;
                float expand = sin(time * 0.8) * 3.0;
                pos += normal * expand;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec3 vNormal;
            
            void main() {
                float intensity = pow(0.35 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
                
                vec3 color = vec3(1.0, 0.2, 0.0) * intensity;
                
                float pulse = sin(time * 1.0) * 0.2 + 0.8;
                
                gl_FragColor = vec4(color * pulse, intensity * 0.2);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false
    });

    const heatWave = new THREE.Mesh(heatWaveGeometry, heatWaveMaterial);
    sun.add(heatWave);

    // 添加日珥粒子系统 - 太阳耀斑
    createSolarFlares();

    // 添加点光源让太阳照亮周围
    const sunPointLight = new THREE.PointLight(0xffaa33, 3, 500);
    sunPointLight.position.set(0, 0, 0);
    sun.add(sunPointLight);
}

// ============ 创建太阳耀斑粒子系统 ============
function createSolarFlares() {
    const flareCount = 200;
    const flareGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(flareCount * 3);
    const velocities = new Float32Array(flareCount * 3);
    const colors = new Float32Array(flareCount * 3);
    const sizes = new Float32Array(flareCount);
    const lifetimes = new Float32Array(flareCount);

    for (let i = 0; i < flareCount; i++) {
        // 随机位置在太阳表面
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 15 + Math.random() * 2;

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        // 向外的速度
        velocities[i * 3] = positions[i * 3] * 0.02;
        velocities[i * 3 + 1] = positions[i * 3 + 1] * 0.02;
        velocities[i * 3 + 2] = positions[i * 3 + 2] * 0.02;

        // 火焰颜色 (黄-橙-红)
        const colorChoice = Math.random();
        if (colorChoice < 0.3) {
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 0.9;
            colors[i * 3 + 2] = 0.3;
        } else if (colorChoice < 0.7) {
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 0.5;
            colors[i * 3 + 2] = 0.1;
        } else {
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 0.2;
            colors[i * 3 + 2] = 0.0;
        }

        sizes[i] = Math.random() * 3 + 1;
        lifetimes[i] = Math.random();
    }

    flareGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    flareGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    flareGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    flareGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    flareGeometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

    const flareMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            attribute vec3 velocity;
            attribute float lifetime;
            varying vec3 vColor;
            varying float vAlpha;
            uniform float time;
            
            void main() {
                vColor = color;
                
                // 计算生命周期
                float life = mod(lifetime + time * 0.1, 1.0);
                vAlpha = 1.0 - life;
                
                // 根据生命周期移动粒子
                vec3 pos = position + velocity * life * 50.0;
                
                // 添加一些随机扰动
                pos.x += sin(time * 3.0 + lifetime * 10.0) * life * 2.0;
                pos.y += cos(time * 2.5 + lifetime * 8.0) * life * 2.0;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (200.0 / -mvPosition.z) * (1.0 - life * 0.5);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;
            
            void main() {
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);
                
                // 柔和的圆形
                float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
                
                // 添加光晕
                float glow = exp(-dist * 4.0) * 0.5;
                
                gl_FragColor = vec4(vColor, (alpha + glow) * vAlpha * 0.8);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const flares = new THREE.Points(flareGeometry, flareMaterial);
    flares.name = 'solarFlares';
    sun.add(flares);
}

// ============ 创建简洁版太阳 ============
function createSimpleSun() {
    // 太阳本体 - 简洁模式（使用真实纹理）
    const sunTexture = new THREE.TextureLoader().load('textures/sun.jpg');
    sunTexture.wrapS = THREE.RepeatWrapping;
    sunTexture.wrapT = THREE.RepeatWrapping;

    const sunGeometry = new THREE.SphereGeometry(15, 64, 64);
    const sunMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            sunMap: { value: sunTexture }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec2 vUv;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform sampler2D sunMap;
            varying vec3 vNormal;
            varying vec2 vUv;

            void main() {
                // 双层UV漂移 - 模拟表面对流
                vec2 uv1 = vUv + vec2(time * 0.004, time * 0.002);
                vec2 uv2 = vUv + vec2(-time * 0.003, time * 0.005);
                vec3 tex1 = texture2D(sunMap, uv1).rgb;
                vec3 tex2 = texture2D(sunMap, uv2).rgb;
                vec3 color = mix(tex1, tex2, 0.5);

                // 提亮纹理
                color = pow(color, vec3(0.85)) * 1.2;

                // 边缘发光
                float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                color += vec3(1.0, 0.6, 0.2) * fresnel * 0.5;

                gl_FragColor = vec4(color, 1.0);
            }
        `
    });

    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.name = 'sun';
    sun.userData = planetData.sun;
    scene.add(sun);
    planets.sun = sun;

    // 太阳光晕 - 柔和版
    const coronaGeometry = new THREE.SphereGeometry(18, 32, 32);
    const coronaMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec3 vNormal;
            
            void main() {
                float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                vec3 color = vec3(1.0, 0.7, 0.2) * intensity;
                float pulse = sin(time * 2.0) * 0.1 + 0.9;
                gl_FragColor = vec4(color * pulse, intensity * 0.6);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });

    const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
    sun.add(corona);

    // 外层光晕
    const outerGlowGeometry = new THREE.SphereGeometry(25, 32, 32);
    const outerGlowMaterial = new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: `
            varying vec3 vNormal;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            
            void main() {
                float intensity = pow(0.4 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                vec3 color = vec3(1.0, 0.5, 0.1) * intensity;
                gl_FragColor = vec4(color, intensity * 0.3);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });

    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    sun.add(outerGlow);

    // 添加点光源
    const sunPointLight = new THREE.PointLight(0xffdd88, 2, 500);
    sunPointLight.position.set(0, 0, 0);
    sun.add(sunPointLight);
}

// ============ 切换太阳样式 ============
function switchSunStyle(style) {
    if (style === currentSunStyle) return;

    currentSunStyle = style;

    // 移除当前太阳
    if (sun) {
        scene.remove(sun);
        // 清理所有子对象
        sun.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
        delete planets.sun;
    }

    // 创建新太阳
    if (style === 'simple') {
        createSimpleSun();
    } else {
        createSun();
    }

}

// ============ 创建行星 ============
function createPlanets() {
    const planetNames = ['mercury', 'venus', 'earth', 'mars', 'ceres', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'haumea', 'makemake', 'eris'];

    planetNames.forEach(name => {
        const data = planetData[name];

        // 计算行星大小（教学模式下放大比例以便观看）
        let size;
        if (name === 'jupiter' || name === 'saturn') {
            size = 4 + data.relativeSize * 0.4;
        } else if (name === 'uranus' || name === 'neptune') {
            size = 2.5 + data.relativeSize * 0.3;
        } else if (name === 'ceres') {
            size = 0.8; // 矮行星，比水星小
        } else {
            size = 1 + data.relativeSize * 1.5;
        }

        // 创建行星
        const geometry = new THREE.SphereGeometry(size, 64, 64);

        let planet;

        // 所有行星使用真实纹理渲染
        const realisticCreators = {
            mercury: createRealisticMercury,
            venus: createRealisticVenus,
            earth: createRealisticEarth,
            mars: createRealisticMars,
            ceres: createRealisticCeres,
            jupiter: createRealisticJupiter,
            saturn: createRealisticSaturn,
            uranus: createRealisticUranus,
            neptune: createRealisticNeptune,
            pluto: createRealisticPluto,
            haumea: createRealisticHaumea,
            makemake: createRealisticMakemake,
            eris: createRealisticEris
        };

        if (realisticCreators[name]) {
            planet = realisticCreators[name](size);
        } else {
            const material = new THREE.MeshPhongMaterial({
                color: data.color,
                emissive: data.emissive,
                emissiveIntensity: 0.1,
                shininess: 30
            });
            planet = new THREE.Mesh(geometry, material);
        }

        planet.name = name;
        const demoOrbitSpeed = 0.5 / Math.sqrt(data.orbitRadius);
        const demoRotationSpeed = 0.01 / data.rotationPeriod;

        planet.userData = {
            ...data,
            orbitAngle: Math.random() * Math.PI * 2,
            orbitSpeed: demoOrbitSpeed,
            rotationSpeed: demoRotationSpeed,
            demoOrbitSpeed: demoOrbitSpeed,
            demoRotationSpeed: demoRotationSpeed,
            realOrbitSpeed: getRealOrbitSpeed(data.orbitPeriod),
            realRotationSpeed: getRealRotationSpeed(data.rotationPeriod),
            size: size
        };

        // 设置初始位置
        planet.position.x = data.orbitRadius;

        // 土星光环
        if (data.hasRings) {
            createSaturnRings(planet, size);
        }

        // 创建行星标签
        createPlanetLabel(planet, data.nameCN, data.nameEN);

        scene.add(planet);
        planets[name] = planet;
    });
}

// ============ 创建真实地球 - 纹理贴图版 ============
function createRealisticEarth(size) {
    const geometry = new THREE.SphereGeometry(size, 128, 128);

    // 纹理加载
    const textureLoader = new THREE.TextureLoader();
    const earthDayMap = textureLoader.load('textures/earth_daymap.jpg');

    const earthMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            dayTexture: { value: earthDayMap },
            sunDirection: { value: new THREE.Vector3(1, 0, 0) }
        },
        vertexShader: `
            uniform vec3 sunDirection;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vViewDir;
            varying vec3 vSunDir;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                vUv = uv;
                vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
                vViewDir = normalize(-mvPos.xyz);
                // 将世界空间的太阳方向转换到视图空间
                vSunDir = normalize(mat3(viewMatrix) * sunDirection);
                gl_Position = projectionMatrix * mvPos;
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform sampler2D dayTexture;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vViewDir;
            varying vec3 vSunDir;

            void main() {
                // 从纹理采样地表颜色，略微提升饱和度
                vec3 surfaceColor = texture2D(dayTexture, vUv).rgb;
                surfaceColor *= 1.15;

                // 光照 — 动态太阳方向，朝阳面亮背阳面暗
                float diff = max(dot(vNormal, vSunDir), 0.0);
                surfaceColor *= (diff * 0.55 + 0.45);

                // 大气散射 — 仅边缘薄薄一层蓝光，不遮盖纹理
                float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 4.0);
                vec3 atmosphere = vec3(0.3, 0.6, 1.0);
                surfaceColor = mix(surfaceColor, atmosphere, fresnel * 0.15);

                gl_FragColor = vec4(surfaceColor, 1.0);
            }
        `
    });

    const earth = new THREE.Mesh(geometry, earthMaterial);

    // 云层独立球体 — 降低不透明度，避免遮盖纹理
    const cloudGeometry = new THREE.SphereGeometry(size * 1.015, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
        map: textureLoader.load('textures/earth_clouds.jpg'),
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    earth.add(cloudMesh);
    earth.userData.cloudMesh = cloudMesh;

    // 添加大气层光晕 — 更薄更紧贴，只做边缘淡蓝勾边
    const atmosphereGeometry = new THREE.SphereGeometry(size * 1.08, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: `
            varying vec3 vNormal;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;

            void main() {
                float intensity = pow(0.55 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                vec3 atmosphereColor = vec3(0.3, 0.6, 1.0);
                gl_FragColor = vec4(atmosphereColor, intensity * 0.35);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earth.add(atmosphere);

    return earth;
}

// ============ 通用纹理行星创建辅助函数 ============
// config: { texturePath, brightness, atmosphereColor, atmosphereIntensity, atmosphereSize, fresnelColor, fresnelIntensity }
function createTexturedPlanet(size, config) {
    const segments = config.segments || 128;
    const geometry = new THREE.SphereGeometry(size, segments, segments);
    const textureLoader = new THREE.TextureLoader();
    const planetMap = textureLoader.load(config.texturePath);

    const brightness = config.brightness || 1.0;
    const fresnelColor = config.fresnelColor || 'vec3(0.0)';
    const fresnelIntensity = config.fresnelIntensity || 0.0;

    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            planetTexture: { value: planetMap },
            sunDirection: { value: new THREE.Vector3(1, 0, 0) }
        },
        vertexShader: `
            uniform vec3 sunDirection;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vViewDir;
            varying vec3 vSunDir;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vUv = uv;
                vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
                vViewDir = normalize(-mvPos.xyz);
                vSunDir = normalize(mat3(viewMatrix) * sunDirection);
                gl_Position = projectionMatrix * mvPos;
            }
        `,
        fragmentShader: `
            uniform sampler2D planetTexture;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vViewDir;
            varying vec3 vSunDir;
            void main() {
                vec3 surfaceColor = texture2D(planetTexture, vUv).rgb * ${brightness.toFixed(2)};
                float diff = max(dot(vNormal, vSunDir), 0.0);
                surfaceColor *= (diff * 0.6 + 0.4);
                float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 4.0);
                surfaceColor = mix(surfaceColor, ${fresnelColor}, fresnel * ${fresnelIntensity.toFixed(2)});
                gl_FragColor = vec4(surfaceColor, 1.0);
            }
        `
    });

    const planet = new THREE.Mesh(geometry, material);

    // 可选大气层光晕
    if (config.atmosphereColor) {
        const atmoSize = config.atmosphereSize || 1.06;
        const atmoIntensity = config.atmosphereIntensity || 0.25;
        const ac = config.atmosphereColor;
        const atmosphereGeometry = new THREE.SphereGeometry(size * atmoSize, 64, 64);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {},
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.55 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                    gl_FragColor = vec4(vec3(${ac[0].toFixed(2)}, ${ac[1].toFixed(2)}, ${ac[2].toFixed(2)}), intensity * ${atmoIntensity.toFixed(2)});
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            depthWrite: false
        });
        planet.add(new THREE.Mesh(atmosphereGeometry, atmosphereMaterial));
    }

    return planet;
}

// ============ 创建真实水星 - 纹理贴图版 ============
function createRealisticMercury(size) {
    return createTexturedPlanet(size, {
        texturePath: 'textures/mercury.jpg',
        brightness: 1.1,
        fresnelColor: 'vec3(0.6, 0.6, 0.6)',
        fresnelIntensity: 0.05
        // 无大气层
    });
}

// ============ 创建真实金星 - 纹理贴图版 ============
function createRealisticVenus(size) {
    return createTexturedPlanet(size, {
        texturePath: 'textures/venus_atmosphere.jpg',
        brightness: 1.15,
        fresnelColor: 'vec3(1.0, 0.9, 0.6)',
        fresnelIntensity: 0.2,
        atmosphereColor: [1.0, 0.85, 0.4],
        atmosphereSize: 1.08,
        atmosphereIntensity: 0.3
    });
}

// ============ 创建真实火星 - 纹理贴图版 ============
function createRealisticMars(size) {
    return createTexturedPlanet(size, {
        texturePath: 'textures/mars.jpg',
        brightness: 1.1,
        fresnelColor: 'vec3(0.9, 0.5, 0.3)',
        fresnelIntensity: 0.12,
        atmosphereColor: [0.9, 0.5, 0.2],
        atmosphereSize: 1.05,
        atmosphereIntensity: 0.2
    });
}

// ============ 创建真实木星 - 纹理贴图版 ============
function createRealisticJupiter(size) {
    return createTexturedPlanet(size, {
        texturePath: 'textures/jupiter.jpg',
        brightness: 1.05,
        fresnelColor: 'vec3(0.8, 0.7, 0.5)',
        fresnelIntensity: 0.08,
        atmosphereColor: [0.8, 0.7, 0.5],
        atmosphereSize: 1.04,
        atmosphereIntensity: 0.15
    });
}

// ============ 创建真实土星 - 纹理贴图版 ============
function createRealisticSaturn(size) {
    return createTexturedPlanet(size, {
        texturePath: 'textures/saturn.jpg',
        brightness: 1.1,
        fresnelColor: 'vec3(0.9, 0.85, 0.6)',
        fresnelIntensity: 0.1,
        atmosphereColor: [0.9, 0.8, 0.5],
        atmosphereSize: 1.05,
        atmosphereIntensity: 0.15
    });
}

// ============ 创建真实天王星 - 纹理贴图版 ============
function createRealisticUranus(size) {
    return createTexturedPlanet(size, {
        texturePath: 'textures/uranus.jpg',
        brightness: 1.1,
        fresnelColor: 'vec3(0.5, 0.8, 0.9)',
        fresnelIntensity: 0.15,
        atmosphereColor: [0.4, 0.8, 0.9],
        atmosphereSize: 1.06,
        atmosphereIntensity: 0.25
    });
}

// ============ 创建真实海王星 - 纹理贴图版 ============
function createRealisticNeptune(size) {
    return createTexturedPlanet(size, {
        texturePath: 'textures/neptune.jpg',
        brightness: 1.15,
        fresnelColor: 'vec3(0.3, 0.5, 1.0)',
        fresnelIntensity: 0.18,
        atmosphereColor: [0.3, 0.4, 1.0],
        atmosphereSize: 1.06,
        atmosphereIntensity: 0.3
    });
}

// ============ 创建真实冥王星 - 纹理贴图版 ============
function createRealisticPluto(size) {
    return createTexturedPlanet(size, {
        texturePath: 'textures/pluto.jpg',
        brightness: 1.1,
        fresnelColor: 'vec3(0.7, 0.7, 0.8)',
        fresnelIntensity: 0.05
        // 无大气层
    });
}

// ============ 创建真实妊神星 - 纹理贴图版 ============
function createRealisticHaumea(size) {
    return createTexturedPlanet(size, {
        texturePath: 'textures/haumea.jpg',
        brightness: 1.12,
        fresnelColor: 'vec3(0.86, 0.9, 0.96)',
        fresnelIntensity: 0.08
    });
}

// ============ 创建真实鸟神星 - 纹理贴图版 ============
function createRealisticMakemake(size) {
    return createTexturedPlanet(size, {
        texturePath: 'textures/makemake.jpg',
        brightness: 1.08,
        fresnelColor: 'vec3(0.92, 0.58, 0.38)',
        fresnelIntensity: 0.08
    });
}

// ============ 创建真实阋神星 - 纹理贴图版 ============
function createRealisticEris(size) {
    return createTexturedPlanet(size, {
        texturePath: 'textures/eris.jpg',
        brightness: 1.12,
        fresnelColor: 'vec3(0.88, 0.9, 0.95)',
        fresnelIntensity: 0.07
    });
}

// ============ 创建谷神星 ============
function createRealisticCeres(size) {
    return createTexturedPlanet(size, {
        texturePath: 'textures/ceres.jpg',
        brightness: 1.1,
        fresnelColor: 'vec3(0.6, 0.6, 0.6)',
        fresnelIntensity: 0.05
        // 无大气层（谷神星几乎没有大气）
    });
}

// ============ 创建真实卫星 ============
function createRealisticMoon(size, moonData) {
    return createTexturedPlanet(size, {
        texturePath: moonData.texturePath,
        brightness: moonData.brightness || 1.0,
        fresnelColor: moonData.fresnelColor || 'vec3(0.0)',
        fresnelIntensity: moonData.fresnelIntensity || 0.0,
        atmosphereColor: moonData.atmosphereColor,
        atmosphereSize: moonData.atmosphereSize,
        atmosphereIntensity: moonData.atmosphereIntensity,
        segments: moonData.segments || 48
    });
}

// ============ 创建月球 ============
function createMoon() {
    const moonData = planetData.moon;
    const earth = planets.earth;

    if (!earth) return;

    // 月球大小（相对于地球）
    const moonSize = earth.userData.size * 0.27;

    const geometry = new THREE.SphereGeometry(moonSize, 64, 64);

    // 月球纹理贴图 + 光照 shader
    const textureLoader = new THREE.TextureLoader();
    const moonMap = textureLoader.load('textures/moon.jpg');

    const moonMaterial = new THREE.ShaderMaterial({
        uniforms: {
            planetTexture: { value: moonMap },
            sunDirection: { value: new THREE.Vector3(1, 0, 0) }
        },
        vertexShader: `
            uniform vec3 sunDirection;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vSunDir;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vUv = uv;
                vSunDir = normalize(mat3(viewMatrix) * sunDirection);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D planetTexture;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vSunDir;
            void main() {
                vec3 surfaceColor = texture2D(planetTexture, vUv).rgb * 1.1;
                float diff = max(dot(vNormal, vSunDir), 0.0);
                surfaceColor *= (diff * 0.7 + 0.3);
                gl_FragColor = vec4(surfaceColor, 1.0);
            }
        `
    });

    const demoOrbitSpeed = earth.userData.demoOrbitSpeed * (earth.userData.orbitPeriod / moonData.orbitPeriod);

    moon = new THREE.Mesh(geometry, moonMaterial);
    moon.name = 'moon';
    moon.userData = {
        ...moonData,
        orbitAngle: 0,
        orbitRadius: earth.userData.size * 3, // 月球轨道半径
        orbitSpeed: demoOrbitSpeed,
        demoOrbitSpeed: demoOrbitSpeed,
        realOrbitSpeed: getRealOrbitSpeed(moonData.orbitPeriod),
        size: moonSize
    };

    // 创建月球标签
    createPlanetLabel(moon, '月球', 'Moon');

    scene.add(moon);
    planets.moon = moon;

    // 创建月球轨道（围绕地球）
    createMoonOrbit();
}

// ============ 创建月球轨道 ============
function createMoonOrbit() {
    const earth = planets.earth;
    if (!earth) return;

    const orbitRadius = earth.userData.size * 3;
    const orbitGeometry = new THREE.BufferGeometry();
    const points = [];

    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        points.push(
            Math.cos(angle) * orbitRadius,
            0,
            Math.sin(angle) * orbitRadius
        );
    }

    orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x666688,
        transparent: true,
        opacity: 0.3
    });

    const moonOrbit = new THREE.Line(orbitGeometry, orbitMaterial);
    moonOrbit.visible = showOrbits;

    // 月球轨道作为地球的子对象，会跟随地球移动
    earth.add(moonOrbit);
    orbits.moon = moonOrbit;
}

// ============ 创建所有行星的卫星 ============
function createAllMoons() {
    Object.keys(moonsData).forEach(planetName => {
        const planet = planets[planetName];
        if (!planet) return;

        const planetMoons = moonsData[planetName];
        moons[planetName] = [];

        planetMoons.forEach((moonData, index) => {
            // 卫星大小（根据行星大小调整）
            const moonSize = planet.userData.size * 0.12 + index * 0.05;

            const moonMesh = moonData.texturePath
                ? createRealisticMoon(moonSize, moonData)
                : new THREE.Mesh(
                    new THREE.SphereGeometry(moonSize, 32, 32),
                    new THREE.MeshPhongMaterial({
                        color: moonData.color,
                        emissive: moonData.color,
                        emissiveIntensity: 0.05,
                        shininess: 20
                    })
                );
            moonMesh.name = moonData.name;
            moonMesh.userData = {
                ...moonData,
                parentPlanet: planetName,
                orbitAngle: Math.random() * Math.PI * 2,
                size: moonSize
            };

            // 创建卫星标签
            createMoonLabel(moonMesh, moonData.nameCN, moonSize);

            scene.add(moonMesh);
            moons[planetName].push(moonMesh);

            // 创建卫星轨道
            createMoonOrbitLine(planet, moonData.orbitRadius, moonData.name);
        });
    });
}

// ============ 创建卫星标签 ============
function createMoonLabel(moonMesh, name, moonSize) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 32;

    context.fillStyle = 'rgba(0, 0, 0, 0.4)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = 'bold 18px Noto Sans SC';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#aaddff';
    context.fillText(name, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(4, 1, 1);
    sprite.position.y = moonSize + 1;
    sprite.userData = {
        offsetY: 1
    };
    sprite.visible = showLabels;

    moonMesh.add(sprite);
    labels[moonMesh.name] = sprite;
}

// ============ 创建卫星轨道线 ============
function createMoonOrbitLine(planet, orbitRadius, moonName) {
    const actualRadius = planet.userData.size + orbitRadius;
    const orbitGeometry = new THREE.BufferGeometry();
    const points = [];

    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        points.push(
            Math.cos(angle) * actualRadius,
            0,
            Math.sin(angle) * actualRadius
        );
    }

    orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x555577,
        transparent: true,
        opacity: 0.2
    });

    const moonOrbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    moonOrbitLine.visible = showOrbits;

    // 轨道作为行星的子对象
    planet.add(moonOrbitLine);
    orbits[moonName] = moonOrbitLine;
}

// ============ 创建地球人造卫星 ============
function createArtificialSatellites() {
    const earth = planets.earth;
    if (!earth) return;

    satellitesData.forEach((satData, index) => {
        // 创建卫星几何体
        const geometry = new THREE.SphereGeometry(satData.size, 16, 16);
        const material = new THREE.MeshPhongMaterial({
            color: satData.color,
            emissive: satData.color,
            emissiveIntensity: 0.35
        });

        const satellite = new THREE.Mesh(geometry, material);
        satellite.name = satData.name;
        satellite.userData = {
            ...satData,
            orbitAngle: satData.startAngle || (index * 0.7),
            parentPlanet: 'earth'
        };

        // 添加发光效果
        const glowGeometry = new THREE.SphereGeometry(satData.size * 2, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: satData.color,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        satellite.add(glow);

        // 为重要卫星创建标签
        if (satData.name === '国际空间站' || satData.name === '中国空间站' ||
            satData.name === '哈勃望远镜' || satData.name === '韦伯望远镜') {
            createSatelliteLabel(satellite, satData.nameCN);
        }

        scene.add(satellite);
        satellites.push(satellite);
    });
}

// ============ 创建卫星标签 ============
function createSatelliteLabel(satellite, name) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 40;

    context.fillStyle = 'rgba(0, 50, 100, 0.6)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = 'bold 16px Noto Sans SC';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#00ffcc';
    context.fillText(name, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(3, 0.6, 1);
    sprite.position.y = 0.5;
    sprite.visible = showLabels;

    satellite.add(sprite);
    labels[satellite.name] = sprite;
}

// ============ 创建小行星带 ============
function createAsteroidBelt() {
    const asteroidCount = 2000;
    const innerRadius = 100; // 火星轨道外
    const outerRadius = 120; // 木星轨道内

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(asteroidCount * 3);
    const colors = new Float32Array(asteroidCount * 3);
    const sizes = new Float32Array(asteroidCount);

    for (let i = 0; i < asteroidCount; i++) {
        // 随机分布在环形区域
        const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 8; // 垂直方向的随机偏移

        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius;

        // 灰褐色变化
        const colorVariation = 0.3 + Math.random() * 0.4;
        colors[i * 3] = colorVariation;
        colors[i * 3 + 1] = colorVariation * 0.9;
        colors[i * 3 + 2] = colorVariation * 0.8;

        // 随机大小
        sizes[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            
            void main() {
                vColor = color;
                
                // 缓慢旋转小行星带
                float angle = time * 0.01;
                vec3 pos = position;
                float cosA = cos(angle);
                float sinA = sin(angle);
                float newX = pos.x * cosA - pos.z * sinA;
                float newZ = pos.x * sinA + pos.z * cosA;
                pos.x = newX;
                pos.z = newZ;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (200.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);
                
                if (dist > 0.5) discard;
                
                float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
                gl_FragColor = vec4(vColor, alpha * 0.8);
            }
        `,
        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false
    });

    asteroidBelt = new THREE.Points(geometry, material);
    asteroidBelt.name = 'asteroidBelt';
    scene.add(asteroidBelt);
}

// ============ 创建土星环 ============
function createSaturnRings(saturn, saturnSize) {
    const ringGeometry = new THREE.RingGeometry(saturnSize * 1.4, saturnSize * 2.3, 128);

    // 修正 UV 坐标，让纹理沿径向展开
    const pos = ringGeometry.attributes.position;
    const uv = ringGeometry.attributes.uv;
    const innerR = saturnSize * 1.4;
    const outerR = saturnSize * 2.3;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const dist = Math.sqrt(x * x + y * y);
        const t = (dist - innerR) / (outerR - innerR);
        uv.setXY(i, t, 0.5);
    }

    // 加载土星环纹理
    const textureLoader = new THREE.TextureLoader();
    const ringTexture = textureLoader.load('textures/saturn_ring.png');

    const ringMaterial = new THREE.MeshBasicMaterial({
        map: ringTexture,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const rings = new THREE.Mesh(ringGeometry, ringMaterial);
    rings.rotation.x = Math.PI / 2.2;
    saturn.add(rings);
}

// ============ AU 距离数据 ============
const auDistances = {
    '太阳': null,
    '水星': '0.4 AU',
    '金星': '0.7 AU',
    '地球': '1.0 AU',
    '月球': null,
    '火星': '1.5 AU',
    '谷神星': '2.8 AU',
    '木星': '5.2 AU',
    '土星': '9.5 AU',
    '天王星': '19.2 AU',
    '海王星': '30 AU',
    '冥王星': '39.5 AU',
    '妊神星': '43.1 AU',
    '鸟神星': '45.8 AU',
    '阋神星': '67.7 AU',
    '奥尔特云': null
};

// ============ 创建行星标签 ============
function createPlanetLabel(planet, name, nameEN) {
    const au = auDistances[name];
    const bodyData = planetData[planet.name];
    const showPeriodChips = !!(bodyData && au && bodyData.orbitPeriod > 0 && bodyData.rotationPeriod > 0);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const hasEN = !!nameEN;
    const cnFont = 'bold 30px Noto Sans SC';
    const enFont = 'bold 18px Orbitron, sans-serif';
    const auFont = '20px Noto Sans SC';
    const chipFont = 'bold 18px Noto Sans SC';
    const gap = 10;
    const badgePadH = 8;
    const chipPadX = 12;
    const chipGap = 14;

    context.font = cnFont;
    const cnWidth = context.measureText(name).width;

    let enWidth = 0;
    if (hasEN) {
        context.font = enFont;
        enWidth = context.measureText(nameEN).width;
    }

    let auBadgeWidth = 0;
    let auTextWidth = 0;
    if (au) {
        context.font = auFont;
        auTextWidth = context.measureText(au).width;
        auBadgeWidth = auTextWidth + badgePadH * 2;
    }

    let totalWidth = cnWidth;
    if (hasEN) totalWidth += gap + enWidth;
    if (au) totalWidth += gap + auBadgeWidth;

    let rotationChipText = '';
    let orbitChipText = '';
    let bottomWidth = 0;
    let rotationChipWidth = 0;
    let orbitChipWidth = 0;

    if (showPeriodChips) {
        rotationChipText = '自转 ' + formatLabelRotationPeriod(bodyData.rotationPeriod);
        orbitChipText = '公转 ' + formatLabelOrbitYears(bodyData.orbitPeriod);

        context.font = chipFont;
        rotationChipWidth = context.measureText(rotationChipText).width + chipPadX * 2;
        orbitChipWidth = context.measureText(orbitChipText).width + chipPadX * 2;
        bottomWidth = rotationChipWidth + chipGap + orbitChipWidth;
    }

    canvas.width = Math.ceil(Math.max(totalWidth + 48, bottomWidth ? bottomWidth + 48 : 0, hasEN || au ? 420 : 256));
    canvas.height = showPeriodChips ? 108 : 64;

    function drawRoundedRect(x, y, width, height, radius, fillStyle, strokeStyle) {
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius);
        context.lineTo(x + width, y + height - radius);
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.closePath();
        context.fillStyle = fillStyle;
        context.fill();
        if (strokeStyle) {
            context.strokeStyle = strokeStyle;
            context.lineWidth = 1;
            context.stroke();
        }
    }

    drawRoundedRect(0.5, 0.5, canvas.width - 1, canvas.height - 1, 14, 'rgba(0, 0, 0, 0.58)', 'rgba(255, 255, 255, 0.06)');

    context.textBaseline = 'middle';
    const topCenterY = showPeriodChips ? 34 : canvas.height / 2;
    const startX = (canvas.width - totalWidth) / 2;
    let curX = startX;

    context.font = cnFont;
    context.textAlign = 'left';
    context.fillStyle = '#ffffff';
    context.fillText(name, curX, topCenterY);
    curX += cnWidth;

    if (hasEN) {
        curX += gap;
        context.font = enFont;
        context.fillStyle = '#f4d03f';
        context.fillText(nameEN, curX, topCenterY + 1);
        curX += enWidth;
    }

    if (au) {
        curX += gap;
        const badgeH = 26;
        const badgeY = topCenterY - badgeH / 2;
        drawRoundedRect(curX, badgeY, auBadgeWidth, badgeH, 6, 'rgba(0, 212, 255, 0.15)', null);
        context.font = auFont;
        context.fillStyle = '#00d4ff';
        context.fillText(au, curX + badgePadH, topCenterY + 1);
    }

    if (showPeriodChips) {
        const bottomY = 78;
        const chipsStartX = (canvas.width - bottomWidth) / 2;

        drawRoundedRect(chipsStartX, bottomY - 13, rotationChipWidth, 28, 8, 'rgba(0, 212, 255, 0.14)', 'rgba(0, 212, 255, 0.18)');
        context.font = chipFont;
        context.fillStyle = '#7fe7ff';
        context.fillText(rotationChipText, chipsStartX + chipPadX, bottomY + 1);

        const orbitChipX = chipsStartX + rotationChipWidth + chipGap;
        drawRoundedRect(orbitChipX, bottomY - 13, orbitChipWidth, 28, 8, 'rgba(244, 208, 63, 0.14)', 'rgba(244, 208, 63, 0.18)');
        context.fillStyle = '#ffe082';
        context.fillText(orbitChipText, orbitChipX + chipPadX, bottomY + 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(canvas.width / 28.5, canvas.height / 25.5, 1);
    sprite.userData.offsetY = showPeriodChips ? 5 : 3;
    sprite.position.y = planet.userData.size + sprite.userData.offsetY;
    sprite.visible = showLabels;

    planet.add(sprite);
    labels[planet.name] = sprite;
}

// ============ 创建柯伊伯带 ============
function createKuiperBelt() {
    const particleCount = 3000;
    const innerRadius = 300; // 海王星轨道外
    const outerRadius = 450;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 30;

        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius;

        // 冰蓝色调
        const colorVariation = 0.5 + Math.random() * 0.3;
        colors[i * 3] = colorVariation * 0.7;
        colors[i * 3 + 1] = colorVariation * 0.8;
        colors[i * 3 + 2] = colorVariation;

        sizes[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    kuiperBelt = new THREE.Points(geometry, material);
    kuiperBelt.name = 'kuiperBelt';
    scene.add(kuiperBelt);
}

// ============ 创建奥尔特云 ============
function createOortCloud() {
    // --- 内奥尔特云：球形分布的冰蓝粒子 ---
    const innerCount = 1500;
    const innerMinR = 550;
    const innerMaxR = 900;

    const innerGeo = new THREE.BufferGeometry();
    const innerPos = new Float32Array(innerCount * 3);
    const innerColors = new Float32Array(innerCount * 3);

    for (let i = 0; i < innerCount; i++) {
        // 球形均匀分布
        const r = innerMinR + Math.random() * (innerMaxR - innerMinR);
        const theta = Math.acos(2 * Math.random() - 1); // 极角
        const phi = Math.random() * Math.PI * 2; // 方位角

        innerPos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
        innerPos[i * 3 + 1] = r * Math.cos(theta);
        innerPos[i * 3 + 2] = r * Math.sin(theta) * Math.sin(phi);

        // 冰蓝白色，微弱变化
        const brightness = 0.6 + Math.random() * 0.4;
        innerColors[i * 3] = brightness * 0.75;
        innerColors[i * 3 + 1] = brightness * 0.85;
        innerColors[i * 3 + 2] = brightness;
    }

    innerGeo.setAttribute('position', new THREE.BufferAttribute(innerPos, 3));
    innerGeo.setAttribute('color', new THREE.BufferAttribute(innerColors, 3));

    const innerMat = new THREE.PointsMaterial({
        size: 1.2,
        vertexColors: true,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    oortCloudInner = new THREE.Points(innerGeo, innerMat);
    oortCloudInner.name = 'oortCloudInner';
    oortCloudInner.visible = false;
    scene.add(oortCloudInner);

    // --- 外奥尔特云：半透明球壳 (ShaderMaterial) ---
    const outerRadius = 1200;
    const outerGeo = new THREE.SphereGeometry(outerRadius, 64, 64);

    const outerMat = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            opacity: { value: 0 },
            color: { value: new THREE.Color(0x88bbff) }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform float opacity;
            uniform vec3 color;
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                // 菲涅尔效果：边缘更亮
                float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
                // 添加噪声般的明暗变化
                float noise = sin(vPosition.x * 0.02 + time * 0.3) *
                              cos(vPosition.y * 0.02 + time * 0.2) *
                              sin(vPosition.z * 0.02 + time * 0.25);
                float alpha = (fresnel * 0.15 + 0.02 + noise * 0.03) * opacity;
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    oortCloudOuter = new THREE.Mesh(outerGeo, outerMat);
    oortCloudOuter.name = 'oortCloudOuter';
    oortCloudOuter.visible = false;
    scene.add(oortCloudOuter);

    // --- 边界线框：虚线球体 ---
    const boundaryRadius = 1800;
    const boundaryGeo = new THREE.SphereGeometry(boundaryRadius, 32, 24);
    const edges = new THREE.EdgesGeometry(boundaryGeo);

    const boundaryMat = new THREE.LineDashedMaterial({
        color: 0x6699cc,
        dashSize: 30,
        gapSize: 20,
        transparent: true,
        opacity: 0
    });

    oortCloudBoundary = new THREE.LineSegments(edges, boundaryMat);
    oortCloudBoundary.computeLineDistances();
    oortCloudBoundary.name = 'oortCloudBoundary';
    oortCloudBoundary.visible = false;
    scene.add(oortCloudBoundary);
}

// ============ 奥尔特云可见性控制 ============
function updateOortCloudVisibility() {
    if (!oortCloudInner || !oortCloudOuter || !oortCloudBoundary) return;

    const dist = camera.position.length(); // 距原点的距离

    // 相机距离 < 500: 全部隐藏
    if (dist < 500) {
        oortCloudInner.visible = false;
        oortCloudOuter.visible = false;
        oortCloudBoundary.visible = false;
        return;
    }

    // 500-800: 内奥尔特云渐入
    if (dist >= 500) {
        oortCloudInner.visible = true;
        const innerAlpha = Math.min((dist - 500) / 300, 1.0); // 500→800 线性渐入
        oortCloudInner.material.opacity = innerAlpha * 0.5;
    }

    // 800-1200: 外奥尔特云球壳渐入
    if (dist >= 800) {
        oortCloudOuter.visible = true;
        const outerAlpha = Math.min((dist - 800) / 400, 1.0);
        oortCloudOuter.material.uniforms.opacity.value = outerAlpha;
    } else {
        oortCloudOuter.visible = false;
    }

    // >1000: 边界线框显示
    if (dist >= 1000) {
        oortCloudBoundary.visible = true;
        const boundaryAlpha = Math.min((dist - 1000) / 300, 1.0);
        oortCloudBoundary.material.opacity = boundaryAlpha * 0.3;
    } else {
        oortCloudBoundary.visible = false;
    }
}

// ============ 飞向奥尔特云 ============
function flyToOortCloud() {
    const targetPosition = new THREE.Vector3(0, 800, 1500);
    const lookAt = new THREE.Vector3(0, 0, 0);
    animateCamera(targetPosition, lookAt);

    // 显示信息面板
    const data = planetData.oortCloud;
    document.getElementById('planetName').textContent = data.nameCN;
    document.getElementById('planetType').textContent = data.type;
    document.getElementById('planetDiameter').textContent = '~30万亿 km';
    document.getElementById('planetDistance').textContent = '2,000-100,000 AU';
    document.getElementById('planetOrbitPeriod').textContent = '-';
    document.getElementById('planetRelativeSize').textContent = '包裹整个太阳系';
    document.getElementById('planetDescription').textContent = data.description;

    const moonsDiv = document.getElementById('planetMoons');
    moonsDiv.textContent = '☄️ 包含数万亿颗冰冻天体，是长周期彗星的来源。著名的彗星如海尔-波普彗星就来自奥尔特云！';
    moonsDiv.style.display = 'block';

    document.getElementById('exploreBtn').classList.remove('visible');

    const colorDot = document.getElementById('planetColorDot');
    colorDot.style.background = '#aaddff';
    colorDot.style.boxShadow = '0 0 20px #aaddff';

    document.getElementById('planetInfo').classList.add('visible');

    // 更新选择器
    document.querySelectorAll('.planet-dot').forEach(dot => {
        dot.classList.remove('active');
        if (dot.dataset.planet === 'oortCloud') {
            dot.classList.add('active');
        }
    });
}

// ============ 创建轨道 ============
function createOrbits() {
    const planetNames = ['mercury', 'venus', 'earth', 'mars', 'ceres', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'haumea', 'makemake', 'eris'];

    planetNames.forEach(name => {
        const data = planetData[name];
        const orbitGeometry = new THREE.BufferGeometry();
        const points = [];

        for (let i = 0; i <= 128; i++) {
            const angle = (i / 128) * Math.PI * 2;
            points.push(
                Math.cos(angle) * data.orbitRadius,
                0,
                Math.sin(angle) * data.orbitRadius
            );
        }

        orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

        const orbitMaterial = new THREE.LineBasicMaterial({
            color: 0x444466,
            transparent: true,
            opacity: 0.4
        });

        const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
        orbit.visible = showOrbits;
        scene.add(orbit);
        orbits[name] = orbit;
    });
}

// ============ 添加灯光 ============
function addLights() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0x222233, 0.3);
    scene.add(ambientLight);

    // 太阳点光源
    const sunLight = new THREE.PointLight(0xffffee, 2, 1000);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // 补充光
    const fillLight = new THREE.DirectionalLight(0x4466aa, 0.1);
    fillLight.position.set(-100, 50, 100);
    scene.add(fillLight);
}

// ============ 动画循环 ============
function animate() {
    animationId = requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsed = clock.elapsedTime;
    const frameFactor = delta * 60;

    // 更新控制器
    controls.update();

    // 更新星空
    if (starField && starField.material.uniforms) {
        starField.material.uniforms.time.value = elapsed;
    }

    // 更新太阳
    if (sun) {
        const sunRotationStep = isRealMotion
            ? getRealRotationSpeed(planetData.sun.rotationPeriod) * delta
            : 0.002 * frameFactor;
        sun.rotation.y += sunRotationStep;
        if (sun.material.uniforms) {
            sun.material.uniforms.time.value = elapsed;
        }
        sun.children.forEach(child => {
            if (child.material && child.material.uniforms && child.material.uniforms.time) {
                child.material.uniforms.time.value = elapsed;
            }
        });
    }

    // 更新行星
    if (isAnimating) {
        Object.keys(planets).forEach(name => {
            if (name === 'sun' || name === 'moon') return;

            const planet = planets[name];
            const data = planet.userData;
            const orbitStep = isRealMotion
                ? data.realOrbitSpeed * delta
                : data.demoOrbitSpeed * 0.01 * frameFactor;
            const rotationStep = isRealMotion
                ? data.realRotationSpeed * delta
                : data.demoRotationSpeed * frameFactor;

            // 公转
            data.orbitAngle += orbitStep;
            planet.position.x = Math.cos(data.orbitAngle) * data.orbitRadius;
            planet.position.z = Math.sin(data.orbitAngle) * data.orbitRadius;

            // 自转
            planet.rotation.y += rotationStep;

            // 天王星特殊倾斜
            if (name === 'uranus') {
                planet.rotation.z = Math.PI / 2;
            }

            // 统一更新所有行星的 shader uniforms（时间 + 太阳方向）
            if (planet.material.uniforms) {
                if (planet.material.uniforms.time) {
                    planet.material.uniforms.time.value = elapsed;
                }
                if (planet.material.uniforms.sunDirection) {
                    const sunDir = new THREE.Vector3()
                        .copy(planet.position).negate().normalize();
                    planet.material.uniforms.sunDirection.value.copy(sunDir);
                }
                // 地球云层旋转
                if (name === 'earth' && planet.userData.cloudMesh) {
                    const cloudRotationStep = isRealMotion
                        ? rotationStep * 1.05
                        : 0.0003 * frameFactor;
                    planet.userData.cloudMesh.rotation.y += cloudRotationStep;
                }
            }
        });

        // 更新月球位置（围绕地球转）
        if (moon && planets.earth) {
            const earth = planets.earth;
            const moonData = moon.userData;
            const moonOrbitStep = isRealMotion
                ? moonData.realOrbitSpeed * delta
                : moonData.demoOrbitSpeed * 0.01 * frameFactor;
            const moonOrbitRadius = isRealScale
                ? moonData.orbitRadius * earth.scale.x
                : moonData.orbitRadius;

            moonData.orbitAngle += moonOrbitStep;

            // 月球位置 = 地球位置 + 月球相对于地球的轨道位置
            moon.position.x = earth.position.x + Math.cos(moonData.orbitAngle) * moonOrbitRadius;
            moon.position.z = earth.position.z + Math.sin(moonData.orbitAngle) * moonOrbitRadius;
            moon.position.y = earth.position.y;

            // 月球自转（同步自转，始终一面朝向地球）
            moon.rotation.y = -moonData.orbitAngle;

            // 更新月球 shader 太阳方向
            if (moon.material.uniforms && moon.material.uniforms.sunDirection) {
                const sunDir = new THREE.Vector3()
                    .copy(moon.position).negate().normalize();
                moon.material.uniforms.sunDirection.value.copy(sunDir);
            }
        }

        // 更新所有卫星位置
        Object.keys(moons).forEach(planetName => {
            const planet = planets[planetName];
            if (!planet) return;

            const planetMoonsList = moons[planetName];
            planetMoonsList.forEach(moonMesh => {
                const data = moonMesh.userData;
                data.orbitAngle += data.orbitSpeed * 0.01;

                const actualRadius = isRealScale
                    ? (planet.userData.size + data.orbitRadius) * planet.scale.x
                    : planet.userData.size + data.orbitRadius;

                // 卫星位置 = 行星位置 + 卫星轨道位置
                moonMesh.position.x = planet.position.x + Math.cos(data.orbitAngle) * actualRadius;
                moonMesh.position.z = planet.position.z + Math.sin(data.orbitAngle) * actualRadius;
                moonMesh.position.y = planet.position.y;

                // 卫星自转
                moonMesh.rotation.y += 0.01;

                if (moonMesh.material.uniforms && moonMesh.material.uniforms.sunDirection) {
                    const sunDir = new THREE.Vector3()
                        .copy(moonMesh.position).negate().normalize();
                    moonMesh.material.uniforms.sunDirection.value.copy(sunDir);
                }
            });
        });

        // 更新人造卫星位置
        const earth = planets.earth;
        if (earth) {
            satellites.forEach(sat => {
                const data = sat.userData;
                data.orbitAngle += data.orbitSpeed * 0.01;

                const actualRadius = earth.userData.size + data.orbitRadius;
                const inclination = data.inclination || 0;

                // 带倾斜角的轨道
                sat.position.x = earth.position.x + Math.cos(data.orbitAngle) * actualRadius;
                sat.position.z = earth.position.z + Math.sin(data.orbitAngle) * actualRadius * Math.cos(inclination);
                sat.position.y = earth.position.y + Math.sin(data.orbitAngle) * actualRadius * Math.sin(inclination);
            });
        }
    }

    // 更新小行星带
    if (asteroidBelt && asteroidBelt.material.uniforms) {
        asteroidBelt.material.uniforms.time.value = elapsed;
    }

    // 缓慢旋转柯伊伯带
    if (kuiperBelt) {
        kuiperBelt.rotation.y += 0.0001;
    }

    // 更新奥尔特云
    updateOortCloudVisibility();
    if (oortCloudInner) {
        oortCloudInner.rotation.y += 0.00005;
    }
    if (oortCloudOuter && oortCloudOuter.material.uniforms) {
        oortCloudOuter.material.uniforms.time.value = elapsed;
    }

    // 渲染
    renderer.render(scene, camera);
}

// ============ 窗口大小调整 ============
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============ 鼠标点击 ============
function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const planetMeshes = Object.values(planets);
    const intersects = raycaster.intersectObjects(planetMeshes);

    if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object;
        selectPlanet(clickedPlanet.name);
    }
}

// ============ 鼠标移动 ============
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const planetMeshes = Object.values(planets);
    const intersects = raycaster.intersectObjects(planetMeshes);

    if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'default';
    }
}

// ============ 选择行星 ============
function selectPlanet(name) {
    selectedPlanet = name;

    // 奥尔特云特殊处理
    if (name === 'oortCloud') {
        flyToOortCloud();
        return;
    }

    const data = planetData[name];

    // 更新UI
    document.getElementById('planetName').textContent = data.nameCN;
    document.getElementById('planetType').textContent = data.type;
    document.getElementById('planetDiameter').textContent = formatNumber(data.diameter) + ' km';
    document.getElementById('planetDistance').textContent = data.distance === 0 ? '-' : formatDistance(data.distance);
    document.getElementById('planetOrbitPeriod').textContent = data.orbitPeriod === 0 ? '-' : formatOrbitPeriod(data.orbitPeriod);
    document.getElementById('planetRelativeSize').textContent = data.relativeSize + 'x 地球';
    document.getElementById('planetDescription').textContent = data.description;

    // 显示卫星信息
    const moonsDiv = document.getElementById('planetMoons');
    if (data.moonInfo) {
        moonsDiv.textContent = data.moonInfo;
        moonsDiv.style.display = 'block';
    } else {
        moonsDiv.style.display = 'none';
    }

    // 显示探索按钮（仅地球）
    const exploreBtn = document.getElementById('exploreBtn');
    if (name === 'earth') {
        exploreBtn.classList.add('visible');
    } else {
        exploreBtn.classList.remove('visible');
    }

    // 设置颜色
    const colorDot = document.getElementById('planetColorDot');
    colorDot.style.background = `#${data.color.toString(16).padStart(6, '0')}`;
    colorDot.style.boxShadow = `0 0 20px #${data.color.toString(16).padStart(6, '0')}`;

    // 显示面板
    document.getElementById('planetInfo').classList.add('visible');

    // 播放中英文语音介绍
    playPlanetAudio(name);

    // 更新行星选择器
    document.querySelectorAll('.planet-dot').forEach(dot => {
        dot.classList.remove('active');
        if (dot.dataset.planet === name) {
            dot.classList.add('active');
        }
    });

    // 移动相机到行星
    const planet = planets[name];
    if (planet) {
        const targetPosition = new THREE.Vector3();
        planet.getWorldPosition(targetPosition);

        const distance = name === 'sun' ? 80 : planet.userData.size * 8;
        const cameraTarget = new THREE.Vector3(
            targetPosition.x + distance,
            targetPosition.y + distance * 0.5,
            targetPosition.z + distance
        );

        animateCamera(cameraTarget, targetPosition);
    }
}

// ============ 相机动画 ============
function animateCamera(targetPosition, lookAtTarget) {
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    const duration = 1500;
    const startTime = Date.now();

    function updateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);

        camera.position.lerpVectors(startPosition, targetPosition, eased);
        controls.target.lerpVectors(startTarget, lookAtTarget, eased);

        if (progress < 1) {
            requestAnimationFrame(updateCamera);
        }
    }

    updateCamera();
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function openSizeComparisonPanel() {
    closePlanetGuidePanel();
    const panel = document.getElementById('sizeComparison');
    if (!panel) return;
    panel.classList.add('visible');
    panel.scrollTop = 0;
}

function closeSizeComparisonPanel() {
    cancelDragVolumeAnimation();
    runActiveDragCleanup();
    const panel = document.getElementById('sizeComparison');
    if (panel) {
        panel.style.overflow = 'auto';
        panel.classList.remove('visible');
    }
}

function openPlanetGuidePanel() {
    closeSizeComparisonPanel();
    const panel = document.getElementById('planetGuidePanel');
    if (!panel) return;
    panel.classList.add('visible');
    panel.scrollTop = 0;
}

function closePlanetGuidePanel() {
    const panel = document.getElementById('planetGuidePanel');
    if (panel) {
        panel.classList.remove('visible');
    }
}

// ============ 设置控制按钮 ============
function setupControls() {
    // 太阳系介绍
    const showPlanetGuideBtn = document.getElementById('showPlanetGuide');
    if (showPlanetGuideBtn) {
        showPlanetGuideBtn.addEventListener('click', openPlanetGuidePanel);
    }

    const closePlanetGuideBtn = document.getElementById('closePlanetGuide');
    if (closePlanetGuideBtn) {
        closePlanetGuideBtn.addEventListener('click', closePlanetGuidePanel);
    }

    // 大小对比
    document.getElementById('showComparison').addEventListener('click', function () {
        openSizeComparisonPanel();
    });

    document.getElementById('closeSizeComparison').addEventListener('click', function () {
        closeSizeComparisonPanel();
    });

    // 重置视角
    document.getElementById('resetView').addEventListener('click', function () {
        const targetPosition = new THREE.Vector3(150, 100, 250);
        const targetLookAt = new THREE.Vector3(0, 0, 0);
        animateCamera(targetPosition, targetLookAt);
        document.getElementById('planetInfo').classList.remove('visible');
        document.querySelectorAll('.planet-dot').forEach(dot => dot.classList.remove('active'));
    });

    // 关闭行星信息面板
    document.getElementById('closePlanetInfo').addEventListener('click', function () {
        document.getElementById('planetInfo').classList.remove('visible');
        document.querySelectorAll('.planet-dot').forEach(dot => dot.classList.remove('active'));
        selectedPlanet = null;
    });

    // 真实比例切换
    document.getElementById('toggleRealScale').addEventListener('click', function () {
        isRealScale = !isRealScale;
        this.classList.toggle('active', isRealScale);
        updateModeIndicator();

        // 切换比例（真实比例下行星会非常小）
        updatePlanetScales();
    });

    // 真实公转 / 自转切换
    const toggleRealMotionBtn = document.getElementById('toggleRealMotion');
    if (toggleRealMotionBtn) {
        toggleRealMotionBtn.addEventListener('click', function () {
            isRealMotion = !isRealMotion;
            this.classList.toggle('active', isRealMotion);
            updateModeIndicator();
        });
    }

    // 行星选择器
    document.querySelectorAll('.planet-dot').forEach(dot => {
        dot.addEventListener('click', function () {
            selectPlanet(this.dataset.planet);
        });
    });

    // 太阳样式选择器
    const sunStyleOptions = document.querySelectorAll('.sun-style-option');

    sunStyleOptions.forEach(option => {
        option.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();

            const style = this.dataset.style;

            // 更新UI
            document.querySelectorAll('.sun-style-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');

            // 切换太阳样式
            switchSunStyle(style);
        };
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closePlanetGuidePanel();
            closeSizeComparisonPanel();
        }
    });
}

// ============ 太阳系介绍浮层渲染 ============
function renderPlanetGuide() {
    const container = document.getElementById('planetGuideContent');
    if (!container) return;

    const travelListHTML = solarGuideTravelItems.map(item => {
        if (item.type === 'belt') {
            return `
                <div class="planet-guide-belt-item">
                    <div class="planet-guide-belt-visual" aria-hidden="true"></div>
                    <div class="planet-guide-belt-copy">
                        <strong>${item.title}</strong>
                        <span>${item.line1}</span>
                        <span>${item.line2}</span>
                    </div>
                </div>
            `;
        }

        const trackClass = item.key === 'saturn' ? 'planet-guide-track-dot saturn' : 'planet-guide-track-dot';
        return `
            <div class="planet-guide-travel-item">
                <div class="${trackClass}" style="background-image: url('${getSolarGuideTexture(item.key)}');" aria-hidden="true"></div>
                <div class="planet-guide-track-name">
                    <span class="cn">${item.nameCN}</span>
                    <span class="en">${item.nameEN}</span>
                </div>
                <div class="planet-guide-track-line" aria-hidden="true"></div>
                <div class="planet-guide-track-time">${item.time}</div>
            </div>
        `;
    }).join('');

    const timelineHTML = solarGuideTimeline.map(event => `
        <div class="planet-guide-era">
            <div class="planet-guide-era-year">${event.year}</div>
            <div class="planet-guide-era-dot" aria-hidden="true"></div>
            <div class="planet-guide-era-label">${event.label}</div>
        </div>
    `).join('');

    const cardsHTML = solarGuidePlanetCards.map(planet => {
        const avatarClass = planet.key === 'saturn' ? 'planet-guide-avatar saturn' : 'planet-guide-avatar';
        return `
            <article class="planet-guide-card" style="--guide-accent: ${planet.accent}; --guide-outline: ${planet.outline}; --guide-glow: ${planet.glow};">
                <div class="planet-guide-card-main">
                    <div class="planet-guide-avatar-wrap">
                        <div class="${avatarClass}" style="background-image: url('${getSolarGuideTexture(planet.key)}');" aria-hidden="true"></div>
                    </div>
                    <div class="planet-guide-card-body">
                        <div class="planet-guide-card-heading">
                            <h3>${planet.nameCN}</h3>
                            <span>${planet.nameEN}</span>
                        </div>
                        <div class="planet-guide-card-stats">
                            <div class="planet-guide-stat-column">
                                ${createGuideStat('◎', '直径', planet.diameter)}
                                ${createGuideStat('☉', '与太阳距离', planet.distance)}
                                ${createGuideStat('↻', '自转周期', planet.rotation)}
                            </div>
                            <div class="planet-guide-stat-column">
                                ${createGuideStat('🌡', '表面温度', planet.temperature)}
                                ${createGuideStat('⟳', '公转周期', planet.orbit)}
                                ${createGuideStat('☾', '已知卫星数', planet.moons)}
                            </div>
                        </div>
                    </div>
                    <div class="planet-guide-card-quote">
                        <div class="planet-guide-quote-label">星球自述</div>
                        <p>${planet.quote}</p>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    container.innerHTML = `
        <div class="planet-guide-layout">
            <section class="planet-guide-left">
                <div class="planet-guide-title-block">
                    <h2>太阳系行星指南</h2>
                    <p>Your Guide To The Solar System</p>
                    <div class="planet-guide-badge">八大行星，数据档案，光速旅行时间</div>
                </div>
                <div class="planet-guide-space-map">
                    <div class="planet-guide-sun-core" aria-hidden="true"></div>
                    <div class="planet-guide-sun-label">
                        <strong>太阳</strong>
                        <span>SUN</span>
                    </div>
                    <div class="planet-guide-light-label">光速旅行时间</div>
                    <div class="planet-guide-travel-list">
                        ${travelListHTML}
                    </div>
                    <div class="planet-guide-disclaimer">
                        数据基于 2024 年最新观测<br>
                        不按现实比例绘制
                    </div>
                </div>
                <div class="planet-guide-timeline">
                    ${timelineHTML}
                </div>
            </section>
            <section class="planet-guide-right">
                ${cardsHTML}
            </section>
        </div>
    `;
}

function createGuideStat(icon, label, value) {
    return `
        <div class="planet-guide-stat">
            <span class="planet-guide-stat-icon">${icon}</span>
            <span class="planet-guide-stat-label">${label}</span>
            <span class="planet-guide-stat-value">${value}</span>
        </div>
    `;
}

function getSolarGuideTexture(key) {
    return solarGuideTextureMap[key] || solarGuideTextureMap.earth;
}

function updateModeIndicator() {
    const scaleValue = document.getElementById('scaleValue');
    if (!scaleValue) return;

    const labels = [isRealScale ? '真实比例' : '教学模式'];
    if (isRealMotion) {
        labels.push('真实运动');
    }

    scaleValue.textContent = labels.join(' + ');
}

function getRealDisplaySize(diameter) {
    return REAL_SCALE_REFERENCE_SIZE * (diameter / REAL_SCALE_REFERENCE_DIAMETER);
}

function getRealScaleFactor(baseSize, diameter) {
    if (!baseSize || !diameter) return 1;
    return getRealDisplaySize(diameter) / baseSize;
}

function updateAttachedLabelPosition(labelSprite, baseSize, scale) {
    if (!labelSprite || !baseSize) return;

    const offsetY = labelSprite.userData.offsetY || 3;
    const safeScale = Math.max(scale, 0.0001);
    labelSprite.position.y = baseSize + offsetY / safeScale;
}

// ============ 更新行星大小 ============
function updatePlanetScales() {
    // 真实比例模式：以木星为基准，用统一直径基准计算所有天体大小
    const sunScaleFactor = 2.5;  // 太阳仍保留压缩显示，否则会过大

    Object.keys(planets).forEach(name => {
        const planet = planets[name];
        const data = planetData[name];

        let scale;
        if (isRealScale) {
            // 真实比例模式
            if (name === 'sun') {
                // 太阳：比木星大，但不是真实的10倍（否则太大）
                scale = sunScaleFactor;
            } else {
                scale = getRealScaleFactor(planet.userData.size, data.diameter);
            }
        } else {
            // 教学比例：所有行星大小相近，便于观察
            scale = 1;
        }

        planet.scale.setScalar(scale);
        updateAttachedLabelPosition(labels[name], planet.userData.size, scale);
    });

    Object.keys(moons).forEach(planetName => {
        moons[planetName].forEach(moonMesh => {
            const moonScale = isRealScale
                ? getRealScaleFactor(moonMesh.userData.size, moonMesh.userData.diameter)
                : 1;

            moonMesh.scale.setScalar(moonScale);
            updateAttachedLabelPosition(labels[moonMesh.name], moonMesh.userData.size, moonScale);
        });
    });
}

// ============ 行星对比换算工具 ============
const CAPACITY_TAB_TO_TARGET = {
    volume: 'sun',
    jupiterVolume: 'jupiter',
    saturnVolume: 'saturn',
    uranusVolume: 'uranus',
    neptuneVolume: 'neptune',
    dragVolume: 'sun',
    blackHoleVolume: 'blackHole',
    dragBlackHole: 'blackHole'
};

const CAPACITY_TARGETS = {
    sun: {
        key: 'sun',
        nameCN: '太阳',
        texture: 'textures/sun.jpg',
        color: '#ffcc00',
        objectKeys: ['jupiter', 'saturn', 'uranus', 'neptune', 'earth', 'venus', 'mars', 'ganymede', 'mercury', 'moon', 'pluto', 'eris', 'haumea', 'makemake', 'ceres']
    },
    jupiter: {
        key: 'jupiter',
        nameCN: '木星',
        texture: 'textures/jupiter.jpg',
        color: '#d8ca9d',
        objectKeys: ['saturn', 'uranus', 'neptune', 'earth', 'venus', 'mars', 'ganymede', 'mercury', 'moon', 'pluto', 'eris', 'haumea', 'makemake', 'ceres']
    },
    saturn: {
        key: 'saturn',
        nameCN: '土星',
        texture: 'textures/saturn.jpg',
        color: '#ead6b8',
        objectKeys: ['jupiter', 'uranus', 'neptune', 'earth', 'venus', 'mars', 'ganymede', 'mercury', 'moon', 'pluto', 'eris', 'haumea', 'makemake', 'ceres']
    },
    uranus: {
        key: 'uranus',
        nameCN: '天王星',
        texture: 'textures/uranus.jpg',
        color: '#7de8d5',
        objectKeys: ['jupiter', 'saturn', 'neptune', 'earth', 'venus', 'mars', 'ganymede', 'mercury', 'moon', 'pluto', 'eris', 'haumea', 'makemake', 'ceres']
    },
    neptune: {
        key: 'neptune',
        nameCN: '海王星',
        texture: 'textures/neptune.jpg',
        color: '#5b5ddf',
        objectKeys: ['jupiter', 'saturn', 'uranus', 'earth', 'venus', 'mars', 'ganymede', 'mercury', 'moon', 'pluto', 'eris', 'haumea', 'makemake', 'ceres']
    },
    blackHole: {
        key: 'blackHole',
        nameCN: '黑洞',
        color: '#fff3cf',
        objectKeys: ['sun', 'jupiter', 'saturn', 'uranus', 'neptune', 'earth', 'venus', 'mars', 'ganymede', 'mercury', 'moon', 'pluto', 'eris', 'haumea', 'makemake', 'ceres']
    }
};

function getCapacityTargetValue(targetKey, metric) {
    if (targetKey === 'blackHole') {
        if (metric === 'mass') return planetData.sun.mass * BLACK_HOLE_MASS_IN_SOLAR_MASSES;
        return BLACK_HOLE_EVENT_HORIZON_RADIUS_KM * 2;
    }
    const target = planetData[targetKey];
    return metric === 'mass' ? target.mass : target.diameter;
}

function getCapacityCount(targetKey, objectKey, metric = currentComparisonMetric) {
    const targetValue = getCapacityTargetValue(targetKey, metric);
    const objectValue = metric === 'mass' ? planetData[objectKey].mass : planetData[objectKey].diameter;
    if (!targetValue || !objectValue) return 0;
    if (metric === 'mass') return targetValue / objectValue;
    return Math.pow(targetValue / objectValue, 3);
}

function getCapacityData(targetKey) {
    const target = CAPACITY_TARGETS[targetKey];
    return target.objectKeys
        .map(key => {
            const data = planetData[key];
            const count = getCapacityCount(targetKey, key);
            return {
                key,
                nameCN: data.nameCN,
                count,
                label: formatCapacityLabel(count),
                color: '#' + data.color.toString(16).padStart(6, '0')
            };
        })
        .filter(item => Number.isFinite(item.count) && item.count > 0)
        .sort((a, b) => a.count - b.count);
}

function getCurrentCapacitySelection(targetKey) {
    if (targetKey === 'jupiter') return currentJupiterVolumeSelection;
    if (targetKey === 'saturn') return currentSaturnVolumeSelection;
    if (targetKey === 'uranus') return currentUranusVolumeSelection;
    if (targetKey === 'neptune') return currentNeptuneVolumeSelection;
    if (targetKey === 'blackHole') return currentBlackHoleVolumeSelection;
    return currentVolumeSelection;
}

function setCurrentCapacitySelection(targetKey, value) {
    if (targetKey === 'jupiter') currentJupiterVolumeSelection = value;
    else if (targetKey === 'saturn') currentSaturnVolumeSelection = value;
    else if (targetKey === 'uranus') currentUranusVolumeSelection = value;
    else if (targetKey === 'neptune') currentNeptuneVolumeSelection = value;
    else if (targetKey === 'blackHole') currentBlackHoleVolumeSelection = value;
    else currentVolumeSelection = value;
}

function getCapacitySubtitle(targetKey) {
    const target = CAPACITY_TARGETS[targetKey];
    if (targetKey === 'blackHole') {
        return currentComparisonMetric === 'mass'
            ? `按质量测算，银河系中心黑洞 Sgr A* 约为太阳质量的${formatCompactCount(BLACK_HOLE_MASS_IN_SOLAR_MASSES)}倍`
            : '按直径折算体积，银河系中心黑洞 Sgr A* 的事件视界半径约 1200 万公里';
    }

    const earthCount = getCapacityCount(targetKey, 'earth');
    const metricText = currentComparisonMetric === 'mass' ? '按质量测算' : '按直径折算体积';
    return `${metricText}，${target.nameCN}约为地球的${formatCapacityLabel(earthCount)}倍`;
}

function getCapacityUnitText(targetName, selected) {
    if (currentComparisonMetric === 'mass') {
        return `${targetName}质量约等于${selected.label}个${selected.nameCN}`;
    }
    return `${selected.label}个${selected.nameCN}才能填满${targetName}`;
}

function getCapacityNote(targetKey) {
    if (targetKey === 'blackHole') {
        if (currentComparisonMetric === 'mass') {
            return `按质量估算：Sgr A* 约为太阳质量的${formatCompactCount(BLACK_HOLE_MASS_IN_SOLAR_MASSES)}倍，数量 = 黑洞质量 / 天体质量。`;
        }
        return `按事件视界圈出的球形空间估算：能装数量 ≈ (事件视界半径 / 天体半径)³。如果把太阳、八大行星和五颗矮行星各放一个，这个黑洞大约能装 ${formatNumber(BLACK_HOLE_SOLAR_SYSTEM_SET_COUNT)} 套。`;
    }

    return currentComparisonMetric === 'mass'
        ? '当前页签使用质量相除，不再使用直径或体积来换算。'
        : '当前页签按直径折算体积，数量 ≈ (目标直径 / 天体直径)³。';
}

function getTargetCircleStyle(targetKey, size = 180) {
    const target = CAPACITY_TARGETS[targetKey];
    if (targetKey === 'blackHole' || targetKey === 'sun') {
        return `width:${size}px; height:${size}px;`;
    }
    return `
        width:${size}px; height:${size}px;
        background: url('${target.texture}') center/cover;
        box-shadow: 0 0 50px ${target.color}80, 0 0 100px ${target.color}40;
    `;
}

function renderCapacityComparison(container, subtitle, targetKey) {
    const target = CAPACITY_TARGETS[targetKey];
    subtitle.textContent = getCapacitySubtitle(targetKey);

    const capacityData = getCapacityData(targetKey);
    const selectedKey = getCurrentCapacitySelection(targetKey);
    const selected = capacityData.find(d => d.key === selectedKey) || capacityData.find(d => d.key === 'earth') || capacityData[0];
    setCurrentCapacitySelection(targetKey, selected.key);

    const logs = capacityData.map(item => Math.log10(Math.max(item.count, 0.000001)));
    const minLog = Math.min(...logs);
    const maxLog = Math.max(...logs);
    const targetDiameter = getCapacityTargetValue(targetKey, 'diameter');
    const wrapper = document.createElement('div');
    wrapper.className = 'volume-container';

    const targetClass = targetKey === 'blackHole' ? ' black-hole-core' : '';
    const labelColorStyle = targetKey === 'sun' || targetKey === 'blackHole' ? '' : 'color:rgba(255,255,255,0.76);';

    const heroHTML = `
        <div class="volume-hero">
            <div class="volume-sun-circle${targetClass}" style="${getTargetCircleStyle(targetKey, targetKey === 'sun' ? 200 : 180)}">
                <span class="volume-sun-label" style="${labelColorStyle}">${target.nameCN}能装</span>
                <span class="volume-sun-count" style="${labelColorStyle}">${selected.label}</span>
                <span class="volume-sun-unit" style="${labelColorStyle}">个${selected.nameCN}</span>
            </div>
            <div class="volume-big-number">
                <div class="number">${selected.label}</div>
                <div class="unit">${getCapacityUnitText(target.nameCN, selected)}</div>
            </div>
        </div>
        <div class="black-hole-note">${getCapacityNote(targetKey)}</div>
    `;

    let gridHTML = '<div class="volume-planet-grid">';
    capacityData.forEach(item => {
        const isActive = item.key === selected.key;
        const pData = planetData[item.key];
        const dotBase = targetKey === 'blackHole' ? 139820 : targetDiameter;
        const dotSize = Math.max(4, Math.min(30, (pData.diameter / dotBase) * 30));
        gridHTML += `
            <div class="volume-planet-card ${isActive ? 'active' : ''}" data-capacity-planet="${item.key}">
                <div class="dot" style="width:${dotSize}px; height:${dotSize}px; background:${item.color}; box-shadow: 0 0 8px ${item.color};"></div>
                <span class="card-name">${item.nameCN}</span>
            </div>
        `;
    });
    gridHTML += '</div>';

    let barHTML = '<div class="volume-bar-chart">';
    capacityData.forEach(item => {
        const isActive = item.key === selected.key;
        const logVal = Math.log10(Math.max(item.count, 0.000001));
        const percent = maxLog === minLog ? 100 : 10 + ((logVal - minLog) / (maxLog - minLog)) * 90;
        barHTML += `
            <div class="volume-bar-row ${isActive ? 'active' : ''}" data-capacity-planet="${item.key}">
                <span class="volume-bar-label">${item.nameCN}</span>
                <div class="volume-bar-track">
                    <div class="volume-bar-fill" style="width:${percent}%; background: linear-gradient(90deg, ${item.color}, ${item.color}aa);">
                        ${item.label}
                    </div>
                </div>
            </div>
        `;
    });
    barHTML += '</div>';

    const selectedData = planetData[selected.key];
    const planetRefSize = Math.max(3, Math.min(80, (selectedData.diameter / targetDiameter) * 80));
    const targetRefClass = targetKey === 'blackHole' ? 'black-hole-ref' : 'sun-ref';
    const refStyle = targetKey === 'blackHole' || targetKey === 'sun'
        ? ''
        : `background: url('${target.texture}') center/cover; box-shadow: 0 0 25px ${target.color}66;`;
    const sizeCompareHTML = `
        <div style="text-align:center;">
            <div class="volume-size-compare">
                <div class="${targetRefClass}" style="${refStyle}"></div>
                <div class="planet-ref" style="width:${planetRefSize}px; height:${planetRefSize}px; background:${selected.color}; box-shadow: 0 0 6px ${selected.color};"></div>
            </div>
            <div class="volume-compare-labels">
                <span>${targetKey === 'blackHole' ? 'Sgr A* 事件视界' : target.nameCN}</span>
                <span>${selected.nameCN}</span>
            </div>
        </div>
    `;

    wrapper.innerHTML = heroHTML + gridHTML + barHTML + sizeCompareHTML;
    container.appendChild(wrapper);

    wrapper.querySelectorAll('[data-capacity-planet]').forEach(el => {
        el.addEventListener('click', () => {
            setCurrentCapacitySelection(targetKey, el.dataset.capacityPlanet);
            generateSizeComparison(currentComparisonTab);
        });
    });
}

function renderDragCapacityComparison(container, subtitle, targetKey) {
    const target = CAPACITY_TARGETS[targetKey];
    const isBlackHole = targetKey === 'blackHole';
    const capacityData = getCapacityData(targetKey);

    subtitle.textContent = currentComparisonMetric === 'mass'
        ? `拖拽天体放入${target.nameCN}，按质量看看相当于多少个`
        : `拖拽天体放入${target.nameCN}，按直径折算体积看看能装多少个`;

    const wrapper = document.createElement('div');
    wrapper.className = `drag-volume-container${isBlackHole ? ' black-hole-drag' : ''}`;

    const canvasSize = isBlackHole ? 280 : 260;
    const dpr = window.devicePixelRatio || 1;

    function getDotSize(key) {
        const d = planetData[key].diameter;
        return Math.max(8, Math.min(isBlackHole ? 32 : 28, (d / 139820) * (isBlackHole ? 32 : 28)));
    }

    let trayHTML = '';
    capacityData.forEach((item, i) => {
        const dotSize = getDotSize(item.key);
        trayHTML += `
            <div class="drag-planet-item hint-pulse" data-drag-key="${item.key}" data-drag-index="${i}" style="animation-delay: ${i * (isBlackHole ? 0.14 : 0.2)}s;">
                <div class="drag-dot" style="width:${dotSize}px; height:${dotSize}px; background:${item.color}; box-shadow: 0 0 8px ${item.color};"></div>
                <span class="drag-name">${item.nameCN}</span>
            </div>
        `;
    });

    wrapper.innerHTML = `
        <div class="drag-instruction">👆 拖拽天体放入${target.nameCN}，看它${currentComparisonMetric === 'mass' ? '质量相当于多少个' : '能装多少个'}！</div>
        <div class="black-hole-note">${getCapacityNote(targetKey)}</div>
        <div class="drag-main-area">
            <div class="drag-sun-area">
                <canvas class="drag-sun-canvas" width="${canvasSize * dpr}" height="${canvasSize * dpr}" style="width:${canvasSize}px; height:${canvasSize}px;"></canvas>
            </div>
            <div class="drag-planet-tray">${trayHTML}</div>
        </div>
        <div class="drag-result" id="dragResult">
            <div class="result-number" id="dragResultNumber"></div>
            <div class="result-text" id="dragResultText"></div>
        </div>
    `;

    container.appendChild(wrapper);

    const canvas = wrapper.querySelector('.drag-sun-canvas');
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    if (isBlackHole) {
        drawIdleBlackHole(ctx, canvasSize);
        if (!blackHoleTextureImage.complete) {
            blackHoleTextureImage.onload = () => drawIdleBlackHole(ctx, canvasSize);
        }
    } else {
        drawIdleSun(ctx, canvasSize);
    }

    setupDragInteraction(wrapper, canvas, canvasSize, dpr, capacityData, {
        startAnimation: isBlackHole ? startBlackHoleFillAnimation : startFillAnimation,
        ghostMaxSize: isBlackHole ? 42 : 40,
        resultLabel: currentComparisonMetric === 'mass'
            ? `${target.nameCN}质量约等于`
            : `${target.nameCN}能装`
    });
}

// ============ 生成大小对比 ============
function generateSizeComparison(mode) {
    if (!mode) mode = currentComparisonTab;
    currentComparisonTab = mode;

    const container = document.getElementById('comparisonRow');
    container.innerHTML = '';
    container.classList.remove('compact-diameter-mode');
    container.classList.remove('diameter-detail-mode');

    const subtitle = document.getElementById('comparisonSubtitle');

    // volume/jupiterVolume 模式下隐藏类型图例，其他模式显示
    const isVolumeMode = mode === 'volume' || mode === 'jupiterVolume' || mode === 'saturnVolume' || mode === 'uranusVolume' || mode === 'neptuneVolume' || mode === 'dragVolume' || mode === 'blackHoleVolume' || mode === 'dragBlackHole';
    const legend = document.querySelector('.planet-types-legend');
    if (legend) legend.style.display = isVolumeMode ? 'none' : 'flex';

    // 放大对比链接只在 diameter 模式下显示
    const existingLink = document.getElementById('sizeDetailLink');
    if (existingLink && mode !== 'diameter') existingLink.style.display = 'none';

    // volume 模式下 planets-row 不需要 flex 横排，改为 block
    if (isVolumeMode) {
        isDiameterDetailMode = false;
        container.style.display = 'block';
        container.style.padding = '15px';
    } else {
        container.style.display = 'flex';
        container.style.padding = '30px';
    }

    // 类型标签映射
    const categoryLabels = {
        terrestrial: '🪨 岩石质',
        jovian: '💨 气态',
        star: '⭐ 恒星',
        dwarf: '🧊 矮行星',
        moon: '🌙 卫星'
    };

    // 行星纹理贴图映射
    const planetTextures = {
        sun: 'textures/sun.jpg',
        jupiter: 'textures/jupiter.jpg',
        saturn: 'textures/saturn.jpg',
        earth: 'textures/earth_daymap.jpg',
        mars: 'textures/mars.jpg',
        mercury: 'textures/mercury.jpg',
        venus: 'textures/venus_atmosphere.jpg',
        neptune: 'textures/neptune.jpg',
        uranus: 'textures/uranus.jpg',
        moon: 'textures/moon.jpg',
        pluto: 'textures/pluto.jpg',
        ceres: 'textures/ceres.jpg',
        haumea: 'textures/haumea.jpg',
        makemake: 'textures/makemake.jpg',
        eris: 'textures/eris.jpg',
        ganymede: 'textures/ganymede.jpg'
    };

    if (mode === 'diameter') {
        // 按直径排序（从大到小）
        const sortedPlanets = ['sun', 'jupiter', 'saturn', 'uranus', 'neptune', 'earth', 'venus', 'mars', 'ganymede', 'mercury', 'moon', 'pluto', 'eris', 'haumea', 'makemake', 'ceres'];
        subtitle.textContent = isDiameterDetailMode
            ? '去掉太阳、木星、土星，以天王星为最大参照，看清小天体真实比例'
            : '以地球为参考（直径 = 12,742 km）';

        // 放大版切换按钮（插入到 subtitle 后面、container 前面）
        let detailLink = document.getElementById('sizeDetailLink');
        if (!detailLink || detailLink.tagName !== 'BUTTON') {
            if (detailLink) detailLink.remove();
            detailLink = document.createElement('button');
            detailLink.id = 'sizeDetailLink';
            detailLink.type = 'button';
            detailLink.style.cssText = 'display:inline-block;margin-bottom:15px;padding:8px 20px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:20px;color:#7de8d5;font-size:0.9rem;text-decoration:none;transition:all 0.3s;cursor:pointer;font-family:inherit;';
            subtitle.parentNode.insertBefore(detailLink, container);
        }
        detailLink.textContent = isDiameterDetailMode
            ? '← 返回完整直径对比'
            : '🔍 去掉太阳/木星/土星，查看小天体放大对比 →';
        detailLink.onclick = function() {
            isDiameterDetailMode = !isDiameterDetailMode;
            generateSizeComparison('diameter');
        };
        detailLink.onmouseover = function() { this.style.background='rgba(255,255,255,0.15)'; this.style.borderColor='#7de8d5'; };
        detailLink.onmouseout = function() { this.style.background='rgba(255,255,255,0.08)'; this.style.borderColor='rgba(255,255,255,0.2)'; };
        detailLink.style.display = 'inline-block';

        if (isDiameterDetailMode) {
            container.classList.add('diameter-detail-mode');
            container.style.padding = '18px 12px 24px';

            const detailPlanets = ['uranus', 'neptune', 'earth', 'venus', 'mars', 'ganymede', 'mercury', 'moon', 'pluto', 'eris', 'haumea', 'makemake', 'ceres'];
            const maxDiameter = planetData.uranus.diameter;
            const maxDisplaySize = 260;
            const earthDiameter = 12742;

            detailPlanets.forEach(name => {
                const data = planetData[name];
                const categoryClass = data.category || '';
                const displaySize = Math.max(8, maxDisplaySize * (data.diameter / maxDiameter));
                const earthRatio = data.diameter / earthDiameter;
                const earthLabel = name === 'earth'
                    ? '= 1 地球'
                    : `= ${earthRatio.toFixed(2)} 地球`;
                const bgStyle = planetTextures[name]
                    ? `background: url('${planetTextures[name]}') center/cover;`
                    : `background: #${data.color.toString(16).padStart(6, '0')};`;

                const div = document.createElement('div');
                div.className = `comparison-planet diameter-detail-planet ${categoryClass}`;
                div.innerHTML = `
                    <div class="sphere" style="
                        width: ${displaySize}px;
                        height: ${displaySize}px;
                        ${bgStyle}
                        color: #${data.color.toString(16).padStart(6, '0')};
                    "></div>
                    <div class="name">${data.nameCN}</div>
                    <div class="size">${formatNumber(data.diameter)} km</div>
                    <div class="earth-ratio earth-small">${earthLabel}</div>
                    <span class="type-label ${categoryClass}">${categoryLabels[categoryClass] || data.type}</span>
                `;
                container.appendChild(div);
            });
            return;
        }

        container.classList.add('compact-diameter-mode');
        container.style.padding = '16px 4px 10px';

        const sunDisplaySize = 210;
        const jupiterDisplaySize = 90;
        const jupiterDiameter = 139820;
        const earthDiameter = 12742;

        sortedPlanets.forEach(name => {
            const data = planetData[name];
            const categoryClass = data.category || '';

            let displaySize;
            if (name === 'sun') {
                displaySize = sunDisplaySize;
            } else {
                const ratio = data.diameter / jupiterDiameter;
                displaySize = jupiterDisplaySize * ratio;
                displaySize = Math.max(5, displaySize);
            }

            const bgStyle = planetTextures[name]
                ? `background: url('${planetTextures[name]}') center/cover;`
                : `background: #${data.color.toString(16).padStart(6, '0')};`;

            // 计算地球直径倍数
            const earthRatio = data.diameter / earthDiameter;
            let earthCompareHTML = '';
            if (name === 'earth') {
                earthCompareHTML = '<div class="earth-ratio earth-ref">🌍 = 1（参考基准）</div>';
            } else if (earthRatio >= 1.5) {
                const rounded = Math.round(earthRatio);
                earthCompareHTML = `<div class="earth-ratio earth-big">≈ ${rounded} 个地球</div>`;
                // 可视化小地球圆点
                if (rounded <= 12) {
                    earthCompareHTML += '<div class="earth-dots">' +
                        Array(rounded).fill('<span class="earth-dot"></span>').join('') +
                        '</div>';
                } else {
                    // 超过12个用压缩展示：8个圆点 + 省略号 + 总数
                    earthCompareHTML += '<div class="earth-dots earth-dots-many">' +
                        Array(8).fill('<span class="earth-dot"></span>').join('') +
                        '<span class="earth-dot-ellipsis">···×' + rounded + '</span>' +
                        '</div>';
                }
            } else {
                const pct = Math.round(earthRatio * 100);
                earthCompareHTML = `<div class="earth-ratio earth-small">≈ 地球的 ${pct}%</div>`;
            }

            const div = document.createElement('div');
            div.className = `comparison-planet ${categoryClass}`;
            div.innerHTML = `
                <div class="sphere" style="
                    width: ${displaySize}px;
                    height: ${displaySize}px;
                    ${bgStyle}
                    color: #${data.color.toString(16).padStart(6, '0')};
                    ${name === 'sun' ? 'box-shadow: 0 0 60px rgba(255, 152, 0, 0.8), 0 0 120px rgba(255, 87, 34, 0.5);' : ''}
                "></div>
                <div class="name">${data.nameCN}</div>
                <div class="size">${formatNumber(data.diameter)} km</div>
                ${earthCompareHTML}
                <span class="type-label ${categoryClass}">${categoryLabels[categoryClass] || data.type}</span>
            `;
            container.appendChild(div);
        });
    } else if (mode === 'mass') {
        // 按质量排序（从大到小）
        const allPlanets = ['sun', 'jupiter', 'saturn', 'uranus', 'neptune', 'earth', 'venus', 'mars', 'ganymede', 'mercury', 'moon', 'pluto', 'eris', 'haumea', 'makemake', 'ceres'];
        const sortedPlanets = allPlanets.sort((a, b) => planetData[b].mass - planetData[a].mass);
        subtitle.textContent = '以地球为参考（质量 = 5.97 × 10²⁴ kg）';

        const sunDisplaySize = 300;
        const jupiterDisplaySize = 140;
        const jupiterMass = 1898;

        sortedPlanets.forEach(name => {
            const data = planetData[name];
            const categoryClass = data.category || '';

            let displaySize;
            if (name === 'sun') {
                displaySize = sunDisplaySize;
            } else {
                // 按质量比例计算球体大小（用立方根，因为质量与体积的关系）
                const ratio = data.mass / jupiterMass;
                displaySize = jupiterDisplaySize * Math.cbrt(ratio);
                displaySize = Math.max(5, displaySize);
            }

            // 格式化质量显示
            let massDisplay;
            const earthMasses = data.mass / 5.97;
            if (data.mass >= 100) {
                massDisplay = `${formatNumber(Math.round(data.mass))} × 10²⁴ kg`;
            } else if (data.mass >= 1) {
                massDisplay = `${data.mass} × 10²⁴ kg`;
            } else {
                massDisplay = `${data.mass} × 10²⁴ kg`;
            }

            // 地球质量单位
            let earthMassLabel;
            if (name === 'earth') {
                earthMassLabel = '= 1 地球质量';
            } else if (earthMasses >= 1) {
                earthMassLabel = `= ${earthMasses.toFixed(1)} 地球质量`;
            } else {
                earthMassLabel = `= ${earthMasses.toFixed(4)} 地球质量`;
            }

            const bgStyle2 = planetTextures[name]
                ? `background: url('${planetTextures[name]}') center/cover;`
                : `background: #${data.color.toString(16).padStart(6, '0')};`;

            const div = document.createElement('div');
            div.className = `comparison-planet ${categoryClass}`;
            div.innerHTML = `
                <div class="sphere" style="
                    width: ${displaySize}px;
                    height: ${displaySize}px;
                    ${bgStyle2}
                    color: #${data.color.toString(16).padStart(6, '0')};
                    ${name === 'sun' ? 'box-shadow: 0 0 60px rgba(255, 152, 0, 0.8), 0 0 120px rgba(255, 87, 34, 0.5);' : ''}
                "></div>
                <div class="name">${data.nameCN}</div>
                <div class="size">${massDisplay}</div>
                <div class="size" style="font-size: 0.65rem; color: rgba(255,255,255,0.5); margin-top: 2px;">${earthMassLabel}</div>
                <span class="type-label ${categoryClass}">${categoryLabels[categoryClass] || data.type}</span>
            `;
            container.appendChild(div);
        });
    } else if (mode === 'volume') {
        // 太阳能装多少个
        generateVolumeComparison(container, subtitle);
    } else if (mode === 'jupiterVolume') {
        // 木星能装多少个
        generateJupiterVolumeComparison(container, subtitle);
    } else if (mode === 'saturnVolume') {
        // 土星能装多少个
        generateSaturnVolumeComparison(container, subtitle);
    } else if (mode === 'uranusVolume') {
        // 天王星能装多少个
        generateUranusVolumeComparison(container, subtitle);
    } else if (mode === 'neptuneVolume') {
        // 海王星能装多少个
        generateNeptuneVolumeComparison(container, subtitle);
    } else if (mode === 'dragVolume') {
        // 拖进太阳
        cancelDragVolumeAnimation();
        generateDragVolumeComparison(container, subtitle);
    } else if (mode === 'blackHoleVolume') {
        // 黑洞能装多少个
        generateBlackHoleVolumeComparison(container, subtitle);
    } else if (mode === 'dragBlackHole') {
        // 拖进黑洞
        cancelDragVolumeAnimation();
        generateDragBlackHoleComparison(container, subtitle);
    }
}

// ============ 太阳能装多少个 ============
function generateVolumeComparison(container, subtitle) {
    return renderCapacityComparison(container, subtitle, 'sun');
}

// ============ 木星能装多少个 ============
function generateJupiterVolumeComparison(container, subtitle) {
    return renderCapacityComparison(container, subtitle, 'jupiter');
}

// ============ 土星能装多少个 ============
function generateSaturnVolumeComparison(container, subtitle) {
    return renderCapacityComparison(container, subtitle, 'saturn');
}

// ============ 天王星能装多少个 ============
function generateUranusVolumeComparison(container, subtitle) {
    return renderCapacityComparison(container, subtitle, 'uranus');
}

// ============ 海王星能装多少个 ============
function generateNeptuneVolumeComparison(container, subtitle) {
    return renderCapacityComparison(container, subtitle, 'neptune');
}

// ============ 黑洞能装多少个 ============
function generateBlackHoleVolumeComparison(container, subtitle) {
    return renderCapacityComparison(container, subtitle, 'blackHole');
}

// ============ 拖进太阳 ============
function cancelDragVolumeAnimation() {
    if (dragVolumeAnimationId) {
        cancelAnimationFrame(dragVolumeAnimationId);
        dragVolumeAnimationId = null;
    }
}

function generateDragVolumeComparison(container, subtitle) {
    return renderDragCapacityComparison(container, subtitle, 'sun');
}

function generateDragBlackHoleComparison(container, subtitle) {
    return renderDragCapacityComparison(container, subtitle, 'blackHole');
}

function drawIdleSun(ctx, size) {
    const cx = size / 2, cy = size / 2, r = size / 2 - 10;
    ctx.clearRect(0, 0, size, size);

    // 太阳渐变
    const grad = ctx.createRadialGradient(cx * 0.8, cy * 0.8, r * 0.1, cx, cy, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.2, '#fff9c4');
    grad.addColorStop(0.5, '#ffeb3b');
    grad.addColorStop(0.8, '#ff9800');
    grad.addColorStop(1, '#e65100');

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // 光晕
    const glow = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.15);
    glow.addColorStop(0, 'rgba(255, 152, 0, 0.3)');
    glow.addColorStop(1, 'rgba(255, 152, 0, 0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // 提示文字
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.font = '600 14px "Noto Sans SC"';
    ctx.textAlign = 'center';
    ctx.fillText('拖到这里', cx, cy);
}

function drawIdleBlackHole(ctx, size, pulse = 0, showHint = true) {
    const cx = size / 2, cy = size / 2, r = size / 2 - 18;
    ctx.clearRect(0, 0, size, size);

    const bg = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 1.3);
    bg.addColorStop(0, 'rgba(6, 10, 24, 1)');
    bg.addColorStop(0.46, 'rgba(10, 16, 34, 0.98)');
    bg.addColorStop(0.78, 'rgba(42, 70, 118, 0.32)');
    bg.addColorStop(1, 'rgba(12, 18, 38, 0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();

    if (blackHoleTextureImage.complete && blackHoleTextureImage.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.08, 0, Math.PI * 2);
        ctx.clip();
        const srcSize = Math.min(blackHoleTextureImage.naturalWidth, blackHoleTextureImage.naturalHeight);
        const sx = (blackHoleTextureImage.naturalWidth - srcSize) / 2;
        const sy = (blackHoleTextureImage.naturalHeight - srcSize) / 2;
        ctx.drawImage(blackHoleTextureImage, sx, sy, srcSize, srcSize, cx - r * 1.08, cy - r * 1.08, r * 2.16, r * 2.16);
        ctx.restore();
    } else {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.02);
        const diskGrad = ctx.createRadialGradient(0, 0, r * 0.28, 0, 0, r * 1.02);
        diskGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        diskGrad.addColorStop(0.42, 'rgba(255, 255, 255, 0.92)');
        diskGrad.addColorStop(0.58, 'rgba(166, 198, 255, 0.45)');
        diskGrad.addColorStop(0.84, 'rgba(78, 112, 182, 0.12)');
        diskGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.scale(1.32, 0.42);
        ctx.beginPath();
        ctx.arc(0, 0, r * (1 + pulse * 0.05), 0, Math.PI * 2);
        ctx.fillStyle = diskGrad;
        ctx.fill();
        ctx.restore();
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.02);
    const lensGrad = ctx.createRadialGradient(0, 0, r * 0.28, 0, 0, r * 1.02);
    lensGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    lensGrad.addColorStop(0.44, 'rgba(255, 255, 255, 0.18)');
    lensGrad.addColorStop(0.7, 'rgba(120, 170, 255, 0.12)');
    lensGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.scale(1.34, 0.42);
    ctx.beginPath();
    ctx.arc(0, 0, r * (1 + pulse * 0.05), 0, Math.PI * 2);
    ctx.fillStyle = lensGrad;
    ctx.fill();
    ctx.restore();

    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.42);
    coreGrad.addColorStop(0, '#000');
    coreGrad.addColorStop(0.68, '#030411');
    coreGrad.addColorStop(1, 'rgba(180, 210, 255, 0.24)');
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.42, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    if (showHint) {
        ctx.fillStyle = 'rgba(255, 244, 220, 0.86)';
        ctx.font = '600 14px "Noto Sans SC"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('拖到事件视界', cx, cy);
    }
}

function setupDragInteraction(wrapper, canvas, canvasSize, dpr, dragData, targetConfig = {}) {
    const sizeComparison = document.getElementById('sizeComparison');
    let ghost = null;
    let dragItem = null;
    let activeItem = null;
    let activePointerId = null;
    let pendingGhostRemovalId = null;
    let pendingGhostElement = null;
    let offsetX = 0, offsetY = 0;
    const startAnimation = targetConfig.startAnimation || startFillAnimation;
    const ghostMaxSize = targetConfig.ghostMaxSize || 40;

    function clearPendingGhostRemoval() {
        if (pendingGhostRemovalId !== null) {
            clearTimeout(pendingGhostRemovalId);
            pendingGhostRemovalId = null;
        }
        if (pendingGhostElement) {
            pendingGhostElement.remove();
            pendingGhostElement = null;
        }
        if (activeDragCleanup === clearPendingGhostRemoval) {
            activeDragCleanup = null;
        }
    }

    function scheduleGhostRemoval(ghostToRemove, delay) {
        pendingGhostElement = ghostToRemove;
        activeDragCleanup = clearPendingGhostRemoval;
        pendingGhostRemovalId = setTimeout(() => {
            ghostToRemove.remove();
            if (pendingGhostElement === ghostToRemove) {
                pendingGhostElement = null;
            }
            if (activeDragCleanup === clearPendingGhostRemoval) {
                activeDragCleanup = null;
            }
            pendingGhostRemovalId = null;
        }, delay);
    }

    function detachGlobalDragListeners() {
        document.removeEventListener('pointermove', handleGlobalPointerMove);
        document.removeEventListener('pointerup', handleGlobalPointerUp);
        document.removeEventListener('pointercancel', handleGlobalPointerCancel);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleWindowBlur);
        window.removeEventListener('pagehide', handlePageHide);
    }

    function resetDragState() {
        ghost = null;
        dragItem = null;
        activePointerId = null;
        activeItem = null;

        if (activeDragCleanup === cleanupDrag) {
            activeDragCleanup = null;
        }
    }

    function cleanupDrag(options = {}) {
        const removeGhost = options.removeGhost !== false;
        const resetOpacity = options.resetOpacity !== false;

        runActiveDragCleanup(cleanupDrag);
        detachGlobalDragListeners();
        clearPendingGhostRemoval();

        if (activeItem && activePointerId !== null && activeItem.hasPointerCapture && activeItem.hasPointerCapture(activePointerId)) {
            activeItem.releasePointerCapture(activePointerId);
        }

        if (removeGhost && ghost) {
            ghost.remove();
        }

        ghost = null;
        dragItem = null;
        activePointerId = null;
        if (sizeComparison) {
            sizeComparison.style.overflow = 'auto';
        }
        if (activeItem && resetOpacity) {
            activeItem.style.opacity = '1';
        }
        resetDragState();
    }

    function handleDrop(clientX, clientY) {
        if (!ghost || !dragItem) return;

        if (activeItem) {
            activeItem.style.opacity = '1';
        }
        if (sizeComparison) {
            sizeComparison.style.overflow = 'auto';
        }

        const canvasRect = canvas.getBoundingClientRect();
        const cx = canvasRect.left + canvasRect.width / 2;
        const cy = canvasRect.top + canvasRect.height / 2;
        const dist = Math.sqrt((clientX - cx) ** 2 + (clientY - cy) ** 2);
        const hitRadius = canvasRect.width / 2;

        detachGlobalDragListeners();

        if (dist < hitRadius * 1.2) {
            ghost.style.transition = 'all 0.2s ease';
            ghost.style.left = (cx - offsetX) + 'px';
            ghost.style.top = (cy - offsetY) + 'px';
            ghost.style.transform = 'scale(0)';
            ghost.style.opacity = '0';
            scheduleGhostRemoval(ghost, 200);

            clearDragResultState();

            cancelDragVolumeAnimation();
            const ctx2 = canvas.getContext('2d');
            ctx2.setTransform(1, 0, 0, 1, 0, 0);
            ctx2.scale(dpr, dpr);
            startAnimation(ctx2, canvasSize, dragItem, targetConfig);
        } else {
            ghost.classList.add('snap-back');
            scheduleGhostRemoval(ghost, 300);
        }

        resetDragState();
    }

    function handleGlobalPointerMove(e) {
        if (!ghost || e.pointerId !== activePointerId) return;
        ghost.style.left = (e.clientX - offsetX) + 'px';
        ghost.style.top = (e.clientY - offsetY) + 'px';
    }

    function handleGlobalPointerUp(e) {
        if (!ghost || e.pointerId !== activePointerId) return;
        handleDrop(e.clientX, e.clientY);
    }

    function handleGlobalPointerCancel(e) {
        if (!ghost || e.pointerId !== activePointerId) return;
        cleanupDrag();
    }

    function handleVisibilityChange() {
        if (document.hidden && ghost) {
            cleanupDrag();
        }
    }

    function handleWindowBlur() {
        if (ghost) {
            cleanupDrag();
        }
    }

    function handlePageHide() {
        if (ghost) {
            cleanupDrag();
        }
    }

    wrapper.querySelectorAll('.drag-planet-item').forEach(item => {
        item.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            const idx = parseInt(item.dataset.dragIndex);
            cleanupDrag();
            dragItem = dragData[idx];
            activeItem = item;
            activePointerId = e.pointerId;

            // 创建 ghost
            const dotSize = Math.max(20, Math.min(ghostMaxSize, (planetData[dragItem.key].diameter / 139820) * 40));
            ghost = document.createElement('div');
            ghost.className = 'drag-ghost';
            ghost.style.width = dotSize + 'px';
            ghost.style.height = dotSize + 'px';
            ghost.style.background = dragItem.color;
            ghost.style.boxShadow = `0 0 15px ${dragItem.color}`;
            ghost.style.left = (e.clientX - dotSize / 2) + 'px';
            ghost.style.top = (e.clientY - dotSize / 2) + 'px';
            document.body.appendChild(ghost);

            offsetX = dotSize / 2;
            offsetY = dotSize / 2;

            // 防止滚动
            if (sizeComparison) {
                sizeComparison.style.overflow = 'hidden';
            }

            item.setPointerCapture(e.pointerId);

            // 去掉脉冲动画
            item.classList.remove('hint-pulse');
            item.style.opacity = '0.4';
            document.addEventListener('pointermove', handleGlobalPointerMove);
            document.addEventListener('pointerup', handleGlobalPointerUp);
            document.addEventListener('pointercancel', handleGlobalPointerCancel);
            document.addEventListener('visibilitychange', handleVisibilityChange);
            window.addEventListener('blur', handleWindowBlur);
            window.addEventListener('pagehide', handlePageHide);
            activeDragCleanup = cleanupDrag;
        });

        item.addEventListener('lostpointercapture', () => {
            if (ghost) {
                cleanupDrag();
            }
        });
    });
}

function startFillAnimation(ctx, size, data, animationConfig = {}) {
    const cx = size / 2, cy = size / 2, r = size / 2 - 10;
    const targetCount = data.count;
    const color = data.color;
    const nameCN = data.nameCN;
    const label = data.label;
    playVolumeFillCollisionSound(targetCount, 'sun');

    // 粒子池
    const MAX_PARTICLES = 200;
    const particles = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
        particles.push({ alive: false, x: 0, y: 0, vx: 0, vy: 0, r: 0, alpha: 1 });
    }

    // 动画参数
    const duration = 3000; // ms
    let fillLevel = 0; // 0~1
    let displayCount = 0;
    const startTime = performance.now();
    let lastSpawnTime = 0;

    // 根据数量级决定粒子大小和生成速率
    let particleRadius, spawnInterval;
    if (targetCount <= 2000) {
        particleRadius = 5; spawnInterval = 15;
    } else if (targetCount <= 30000) {
        particleRadius = 4; spawnInterval = 10;
    } else if (targetCount <= 2000000) {
        particleRadius = 3; spawnInterval = 8;
    } else {
        particleRadius = 2; spawnInterval = 5;
    }

    function spawnParticle() {
        for (let i = 0; i < MAX_PARTICLES; i++) {
            if (!particles[i].alive) {
                const p = particles[i];
                p.alive = true;
                // 从太阳顶部随机位置生成
                const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
                const spawnR = r * 0.85;
                p.x = cx + Math.cos(angle) * spawnR * (0.3 + Math.random() * 0.7);
                p.y = cy - r * 0.7 - Math.random() * 10;
                p.vx = (Math.random() - 0.5) * 2;
                p.vy = Math.random() * 1 + 0.5;
                p.r = particleRadius + Math.random() * 1.5;
                p.alpha = 0.8 + Math.random() * 0.2;
                return;
            }
        }
    }

    function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);

        // easeInOutCubic for fill
        fillLevel = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        // 计数器：指数加速
        displayCount = Math.round(targetCount * fillLevel);

        // 填充线的 Y 位置（从底部往上）
        const fillY = cy + r - fillLevel * r * 2;

        ctx.clearRect(0, 0, size, size);

        // 1. 太阳底色
        const sunGrad = ctx.createRadialGradient(cx * 0.8, cy * 0.8, r * 0.1, cx, cy, r);
        sunGrad.addColorStop(0, '#ffffff');
        sunGrad.addColorStop(0.2, '#fff9c4');
        sunGrad.addColorStop(0.5, '#ffeb3b');
        sunGrad.addColorStop(0.8, '#ff9800');
        sunGrad.addColorStop(1, '#e65100');

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = sunGrad;
        ctx.fillRect(0, 0, size, size);

        // 2. 填充层（行星颜色半透明从底部上升）
        if (fillLevel > 0) {
            ctx.fillStyle = color + '55'; // 30% opacity
            ctx.fillRect(cx - r, fillY, r * 2, cy + r - fillY);

            // 填充层顶部渐变过渡
            const fadeGrad = ctx.createLinearGradient(0, fillY - 15, 0, fillY + 5);
            fadeGrad.addColorStop(0, color + '00');
            fadeGrad.addColorStop(1, color + '44');
            ctx.fillStyle = fadeGrad;
            ctx.fillRect(cx - r, fillY - 15, r * 2, 20);
        }

        // 3. 粒子
        if (progress < 0.95) {
            // 生成粒子
            if (now - lastSpawnTime > spawnInterval) {
                const spawnCount = Math.ceil(3 + progress * 5);
                for (let s = 0; s < spawnCount; s++) spawnParticle();
                lastSpawnTime = now;
            }
        }

        // 更新和绘制粒子
        for (let i = 0; i < MAX_PARTICLES; i++) {
            const p = particles[i];
            if (!p.alive) continue;

            p.vy += 0.15; // 重力
            p.x += p.vx;
            p.y += p.vy;

            // 碰到填充线反弹
            if (p.y + p.r > Math.max(fillY, cy - r + 5)) {
                p.y = Math.max(fillY, cy - r + 5) - p.r;
                p.vy *= -0.3;
                p.vx *= 0.8;
                if (Math.abs(p.vy) < 0.5) {
                    p.alive = false;
                    continue;
                }
            }

            // 超出太阳范围检测
            const dx = p.x - cx, dy = p.y - cy;
            if (dx * dx + dy * dy > (r - p.r) * (r - p.r)) {
                // 推回太阳内
                const dist = Math.sqrt(dx * dx + dy * dy);
                const nx = dx / dist, ny = dy / dist;
                p.x = cx + nx * (r - p.r - 1);
                p.y = cy + ny * (r - p.r - 1);
                // 反射速度
                const dot = p.vx * nx + p.vy * ny;
                p.vx -= 1.5 * dot * nx;
                p.vy -= 1.5 * dot * ny;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        ctx.restore();

        // 4. 光晕
        const glow = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.15);
        glow.addColorStop(0, 'rgba(255, 152, 0, 0.2)');
        glow.addColorStop(1, 'rgba(255, 152, 0, 0)');
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // 5. 计数器文字
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();

        let countText;
        if (displayCount >= 100000000) {
            countText = (displayCount / 100000000).toFixed(1) + ' 亿';
        } else if (displayCount >= 10000) {
            countText = (displayCount / 10000).toFixed(displayCount >= 1000000 ? 0 : 1) + ' 万';
        } else {
            countText = formatNumber(displayCount);
        }

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = '900 28px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(countText, cx + 1, cy - 5 + 1);
        ctx.fillStyle = '#fff';
        ctx.fillText(countText, cx, cy - 5);

        ctx.font = '500 13px "Noto Sans SC", sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('个' + nameCN, cx, cy + 20);
        ctx.restore();

        if (progress < 1) {
            dragVolumeAnimationId = requestAnimationFrame(animate);
        } else {
            // 动画完成，显示结果
            dragVolumeAnimationId = null;
            showDragResult(label, nameCN, animationConfig.resultLabel || '太阳能装');
        }
    }

    dragVolumeAnimationId = requestAnimationFrame(animate);
}

function startBlackHoleFillAnimation(ctx, size, data, animationConfig = {}) {
    const cx = size / 2, cy = size / 2, r = size / 2 - 18;
    const targetCount = data.count;
    const color = data.color;
    const nameCN = data.nameCN;
    const label = data.label;
    playVolumeFillCollisionSound(targetCount, 'blackHole');

    const MAX_PARTICLES = 240;
    const particles = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
        particles.push({ alive: false, x: 0, y: 0, angle: 0, radius: 0, speed: 0, dot: 0, alpha: 1 });
    }

    const duration = 3200;
    const startTime = performance.now();
    let displayCount = 0;
    let lastSpawnTime = 0;

    function spawnParticle() {
        for (let i = 0; i < MAX_PARTICLES; i++) {
            if (!particles[i].alive) {
                const p = particles[i];
                p.alive = true;
                p.angle = Math.random() * Math.PI * 2;
                p.radius = r * (1.05 + Math.random() * 0.18);
                p.speed = 0.055 + Math.random() * 0.04;
                p.dot = 2 + Math.random() * 3;
                p.alpha = 0.82 + Math.random() * 0.18;
                p.x = cx + Math.cos(p.angle) * p.radius;
                p.y = cy + Math.sin(p.angle) * p.radius * 0.42;
                return;
            }
        }
    }

    function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - progress, 3);
        displayCount = Math.round(targetCount * ease);

        drawIdleBlackHole(ctx, size, Math.sin(now * 0.006) * 0.5 + 0.5, false);

        if (progress < 0.96 && now - lastSpawnTime > 18) {
            const spawnCount = Math.ceil(5 + progress * 9);
            for (let s = 0; s < spawnCount; s++) spawnParticle();
            lastSpawnTime = now;
        }

        particles.forEach(p => {
            if (!p.alive) return;
            p.angle += p.speed;
            p.radius *= 0.965;
            p.x = cx + Math.cos(p.angle) * p.radius;
            p.y = cy + Math.sin(p.angle) * p.radius * 0.42;
            p.alpha *= 0.987;

            if (p.radius < r * 0.26 || p.alpha < 0.08) {
                p.alive = false;
                return;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.dot, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
        });

        const swallowGlow = ctx.createRadialGradient(cx, cy, r * 0.22, cx, cy, r * 0.62);
        swallowGlow.addColorStop(0, 'rgba(0, 0, 0, 0.96)');
        swallowGlow.addColorStop(0.55, 'rgba(0, 0, 0, 0.7)');
        swallowGlow.addColorStop(1, 'rgba(255, 147, 43, 0.08)');
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.62, 0, Math.PI * 2);
        ctx.fillStyle = swallowGlow;
        ctx.fill();

        const countText = formatCompactCount(displayCount);
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.font = '900 25px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(countText, cx + 1, cy + 1);
        ctx.fillStyle = '#fff4d2';
        ctx.fillText(countText, cx, cy);

        ctx.font = '500 13px "Noto Sans SC", sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.74)';
        ctx.fillText('个' + nameCN, cx, cy + 26);

        if (progress < 1) {
            dragVolumeAnimationId = requestAnimationFrame(animate);
        } else {
            dragVolumeAnimationId = null;
            showDragResult(label, nameCN, animationConfig.resultLabel || '黑洞事件视界能装');
        }
    }

    dragVolumeAnimationId = requestAnimationFrame(animate);
}

function showDragResult(label, nameCN, targetLabel = '太阳能装') {
    const resultNum = document.getElementById('dragResultNumber');
    const resultText = document.getElementById('dragResultText');
    clearPendingDragResultReveal();
    if (resultNum) {
        resultNum.textContent = label;
        scheduleDragResultReveal(() => {
            resultNum.classList.add('visible');
        });
    }
    if (resultText) {
        resultText.textContent = `${targetLabel} ${label}个${nameCN}！`;
        scheduleDragResultReveal(() => {
            resultText.classList.add('visible');
        });
    }
    activeDragCleanup = clearDragResultState;
}

function setupComparisonTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            cancelDragVolumeAnimation();
            runActiveDragCleanup();
            if (btn.dataset.metric) {
                currentComparisonMetric = btn.dataset.metric;
                currentComparisonTab = btn.dataset.tab || currentComparisonMetric;
                if (currentComparisonTab !== 'diameter') {
                    isDiameterDetailMode = false;
                }
            } else {
                currentComparisonTab = btn.dataset.tab;
            }
            updateComparisonTabActiveState();
            generateSizeComparison(currentComparisonTab);
        });
    });
}

function updateComparisonTabActiveState() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const isMetricActive = btn.dataset.metric && btn.dataset.metric === currentComparisonMetric;
        const isTabActive = btn.dataset.tab && btn.dataset.tab === currentComparisonTab && !btn.dataset.metric;
        const isDiameterMetricTabActive = btn.dataset.metric === 'diameter' && currentComparisonTab === 'diameter';
        btn.classList.toggle('active', isMetricActive || isTabActive || isDiameterMetricTabActive);
    });
}

// ============ 工具函数 ============
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatCapacityLabel(num) {
    if (num < 1) {
        return num.toFixed(2).replace(/\.?0+$/, '');
    }
    if (num < 10) {
        return num.toFixed(1).replace(/\.?0+$/, '');
    }
    if (num < 10000) {
        return formatNumber(Math.round(num));
    }
    return formatCompactCount(num);
}

function formatCompactCount(num) {
    if (num >= 1000000000000) {
        return (num / 1000000000000).toFixed(num >= 10000000000000 ? 1 : 2) + ' 万亿';
    }
    if (num >= 100000000) {
        return (num / 100000000).toFixed(num >= 1000000000 ? 0 : 1) + ' 亿';
    }
    if (num >= 10000) {
        return (num / 10000).toFixed(num >= 1000000 ? 0 : 1) + ' 万';
    }
    return formatNumber(num);
}

function formatDistance(distance) {
    if (distance >= 1000) {
        return (distance / 1000).toFixed(1) + ' 十亿 km';
    }
    return distance + ' 百万 km';
}

function getRealOrbitSpeed(periodDays) {
    if (!periodDays) return 0;
    return (Math.PI * 2 * REAL_ORBIT_DAYS_PER_SECOND) / periodDays;
}

function getRealRotationSpeed(periodDays) {
    if (!periodDays) return 0;
    return (Math.PI * 2 * REAL_ROTATION_DAYS_PER_SECOND) / periodDays;
}

function formatPeriodNumber(value) {
    return Number(value.toFixed(2)).toString();
}

function formatLabelPeriodNumber(value, fractionDigits) {
    return value.toFixed(fractionDigits).replace(/\.?0+$/, '');
}

function formatLabelRotationPeriod(days) {
    return formatLabelPeriodNumber(days, days >= 10 ? 1 : 2) + '天';
}

function formatLabelOrbitYears(days) {
    const years = days / 365.25;
    const fractionDigits = years >= 100 ? 1 : 2;
    return formatLabelPeriodNumber(years, fractionDigits) + '年';
}

function formatOrbitPeriod(days) {
    const orbitDays = formatPeriodNumber(days);
    const years = formatPeriodNumber(days / 365.25);
    return orbitDays + ' 地球日，约等于 ' + years + ' 年';
}

// ============ 启动 ============
window.addEventListener('DOMContentLoaded', init);
