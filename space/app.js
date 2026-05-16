/**
 * 太阳系 3D 探索 - 柳智天的宇宙课堂
 * 使用 Three.js 创建的交互式太阳系动画
 */

const STAR_SURFACE_TEXTURES = {
    proximaCentauri: 'textures/stars/red_dwarf_surface.jpg',
    alphaCentauri: 'textures/stars/yellow_star_surface.jpg',
    betaCentauri: 'textures/stars/blue_white_star_surface.jpg',
    sirius: 'textures/stars/blue_white_star_surface.jpg',
    arcturus: 'textures/stars/orange_star_surface.jpg',
    antares: 'textures/stars/generated/antares_custom.jpg',
    betelgeuse: 'textures/stars/generated/betelgeuse_custom.png',
    vyCanisMajoris: 'textures/stars/generated/vy_canis_majoris_custom.png',
    uyScuti: 'textures/stars/generated/uy_scuti_custom.png'
};

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
    proximaCentauri: {
        name: '比邻星',
        nameCN: '比邻星',
        nameEN: 'Proxima Centauri',
        type: '红矮星',
        diameter: 214754, // km，0.1542 R☉ × 本页太阳直径
        mass: 242869, // 10²⁴ kg，约 0.1221 M☉
        category: 'star',
        distance: 40140000000000, // km，约 4.24 光年
        orbitPeriod: 550000 * 365.25,
        rotationPeriod: 83,
        color: 0xd94d34,
        emissive: 0x8f1f1c,
        description: '比邻星是离太阳最近的恒星，是一颗又小又暗的红矮星，直径大约是太阳的 0.154 倍，比木星大约 1.5 倍。',
        relativeSize: 16.85,
        texturePath: STAR_SURFACE_TEXTURES.proximaCentauri
    },
    alphaCentauri: {
        name: '半人马座α星',
        nameCN: '半人马座α星',
        nameEN: 'Alpha Centauri A',
        type: '类太阳恒星',
        diameter: 1703829, // km，约 1.2234 R☉
        mass: 2145841, // 10²⁴ kg，约 1.0788 M☉
        category: 'star',
        distance: 41340000000000, // km，约 4.37 光年
        orbitPeriod: 79.9 * 365.25,
        rotationPeriod: 22,
        color: 0xffd56b,
        emissive: 0xffb13b,
        description: '半人马座α星是距离太阳系最近的恒星系统中最亮的主星，大小和太阳很接近，但比太阳稍大、稍重。',
        relativeSize: 133.72,
        texturePath: STAR_SURFACE_TEXTURES.alphaCentauri
    },
    betaCentauri: {
        name: '半人马座β星',
        nameCN: '半人马座β星',
        nameEN: 'Beta Centauri',
        type: '蓝白巨星',
        diameter: 13202796, // km，约 9.48 R☉
        mass: 18100810, // 10²⁴ kg，约 9.1 M☉
        category: 'star',
        distance: 3700000000000000, // km，约 390 光年
        orbitPeriod: 357,
        rotationPeriod: 0,
        color: 0xbfdcff,
        emissive: 0x8bbcff,
        description: '半人马座β星是一颗明亮的蓝白色巨星，南半球常把它和半人马座α星一起当作指向南十字座的“指针星”。',
        relativeSize: 1036.17,
        texturePath: STAR_SURFACE_TEXTURES.betaCentauri
    },
    sirius: {
        name: '天狼星',
        nameCN: '天狼星',
        nameEN: 'Sirius A',
        type: '蓝白主序星',
        diameter: 3314626, // km，约 2.38 R☉
        mass: 4103513, // 10²⁴ kg，约 2.063 M☉
        category: 'star',
        distance: 81360000000000, // km，约 8.6 光年
        orbitPeriod: 50.1 * 365.25,
        rotationPeriod: 5.5,
        color: 0xbfdcff,
        emissive: 0x8bbcff,
        description: '天狼星是夜空中最亮的恒星，主星比太阳更大、更亮，旁边还有一颗很小但密度极高的白矮星。',
        relativeSize: 260.13,
        texturePath: STAR_SURFACE_TEXTURES.sirius
    },
    arcturus: {
        name: '大角星',
        nameCN: '大角星',
        nameEN: 'Arcturus',
        type: '红巨星',
        diameter: 35374580, // km，约 25.4 R☉
        mass: 2148228, // 10²⁴ kg，约 1.08 M☉
        category: 'star',
        distance: 347000000000000, // km，约 36.7 光年
        orbitPeriod: 0,
        rotationPeriod: 0,
        color: 0xff8f45,
        emissive: 0xd85f2a,
        description: '大角星是一颗红巨星，直径大约是太阳的 25 倍，用来理解“恒星变老后会膨胀”很直观。',
        relativeSize: 2776.22,
        texturePath: STAR_SURFACE_TEXTURES.arcturus
    },
    antares: {
        name: '心宿二',
        nameCN: '心宿二',
        nameEN: 'Antares',
        type: '红超巨星',
        diameter: 947036000, // km，约 680 R☉
        mass: 24664840, // 10²⁴ kg，约 12.4 M☉
        category: 'star',
        distance: 5200000000000000, // km，约 550 光年
        orbitPeriod: 0,
        rotationPeriod: 0,
        color: 0xff5c34,
        emissive: 0xb82419,
        description: '心宿二是天蝎座的红超巨星，名字有“火星的对手”的意思，因为它看起来也带着醒目的红色。',
        relativeSize: 74321.14,
        texturePath: STAR_SURFACE_TEXTURES.antares
    },
    betelgeuse: {
        name: '参宿四',
        nameCN: '参宿四',
        nameEN: 'Betelgeuse',
        type: '红超巨星',
        diameter: 1235324900, // km，约 887 R☉
        mass: 32820150, // 10²⁴ kg，约 16.5 M☉
        category: 'star',
        distance: 5200000000000000, // km，约 550 光年
        orbitPeriod: 0,
        rotationPeriod: 0,
        color: 0xff6d3a,
        emissive: 0xc72c1f,
        description: '参宿四是猎户座肩膀位置的红超巨星，如果放到太阳的位置，它的外层会大到接近火星轨道。',
        relativeSize: 96948.12,
        texturePath: STAR_SURFACE_TEXTURES.betelgeuse
    },
    vyCanisMajoris: {
        name: '大犬座VY',
        nameCN: '大犬座VY',
        nameEN: 'VY Canis Majoris',
        type: '红特超巨星',
        diameter: 1977634000, // km，约 1420 R☉
        mass: 33814700, // 10²⁴ kg，约 17 M☉
        category: 'star',
        distance: 36900000000000000, // km，约 3900 光年
        orbitPeriod: 0,
        rotationPeriod: 0,
        color: 0xd94a2b,
        emissive: 0x9c1f17,
        description: '大犬座VY是非常巨大的红特超巨星，太阳放到它旁边会像一个小亮点。',
        relativeSize: 155203.26,
        texturePath: STAR_SURFACE_TEXTURES.vyCanisMajoris
    },
    uyScuti: {
        name: '盾牌座UY',
        nameCN: '盾牌座UY',
        nameEN: 'UY Scuti',
        type: '红超巨星',
        diameter: 2367590000, // km，约 1700 R☉
        mass: 15912800, // 10²⁴ kg，约 8 M☉
        category: 'star',
        distance: 89900000000000000, // km，约 9500 光年
        orbitPeriod: 0,
        rotationPeriod: 0,
        color: 0xb93426,
        emissive: 0x7f1814,
        description: '盾牌座UY曾被认为是已知体积最大的恒星之一，很适合用来感受红超巨星的夸张尺度。',
        relativeSize: 185807.57,
        texturePath: STAR_SURFACE_TEXTURES.uyScuti
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
    io: {
        name: '木卫一',
        nameCN: '木卫一',
        nameEN: 'Io',
        type: '卫星',
        diameter: 3643, // km
        mass: 0.0089, // 10²⁴ kg
        category: 'moon',
        distance: 778.5, // 百万 km（随木星）
        orbitPeriod: 1.77, // 天（木星公转周期）
        rotationPeriod: 1.77, // 同步自转
        color: 0xffdd44,
        emissive: 0x4a2f19,
        description: '木卫一是太阳系里火山活动最剧烈的天体。它的表面有很多活火山，经常会喷出岩浆和硫磺，所以看起来是黄色、橙色、红色的。它不是一颗安静的月亮，而像一个一直在冒火的“小火球”。',
        relativeSize: 0.286 // 3643/12742
    },
    europa: {
        name: '木卫二',
        nameCN: '木卫二',
        nameEN: 'Europa',
        type: '卫星',
        diameter: 3122, // km
        mass: 0.0048, // 10²⁴ kg
        category: 'moon',
        distance: 778.5, // 百万 km（随木星）
        orbitPeriod: 3.55, // 天（木星公转周期）
        rotationPeriod: 3.55, // 同步自转
        color: 0xccddee,
        emissive: 0x2f4f70,
        description: '木卫二是木星的一颗冰壳卫星，表面覆盖着厚厚的冰，冰下面可能有一片很深的地下海洋。科学家认为，那里可能有适合生命存在的环境，所以木卫二是太阳系里最值得探索的卫星之一。',
        relativeSize: 0.245 // 3122/12742
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
        orbitPeriod: 7.15, // 天（木星公转周期）
        rotationPeriod: 7.15, // 天（同步自转，绕木星一圈）
        color: 0xaabbcc,
        emissive: 0x334455,
        description: '木卫三是太阳系最大的卫星，比水星还大，它的外面像冰壳，里面可能有一片看不见的大海，木卫三有自己的磁场，像是自己的保护罩。',
        relativeSize: 0.413 // 5268/12742
    },
    titan: {
        name: '土卫六',
        nameCN: '土卫六',
        nameEN: 'Titan',
        type: '卫星',
        diameter: 5150, // km
        mass: 0.1345, // 10²⁴ kg
        category: 'moon',
        distance: 1435, // 百万 km（随土星）
        orbitPeriod: 15.95, // 天（土星公转周期）
        rotationPeriod: 15.95, // 天（同步）
        color: 0xf6d08b,
        emissive: 0x6d5638,
        description: '土卫六是土星最大的卫星，拥有浓厚的大气层和液态甲烷湖海，它有自己独特的雾色天象。',
        relativeSize: 0.404 // 5150/12742
    },
    rhea: {
        name: '土卫五',
        nameCN: '土卫五',
        nameEN: 'Rhea',
        type: '卫星',
        diameter: 1528, // km
        mass: 0.002306, // 10²⁴ kg
        category: 'moon',
        distance: 1435.8, // 百万 km（随土星）
        orbitPeriod: 4.52, // 天
        rotationPeriod: 4.52,
        color: 0x9fa2b8,
        emissive: 0x5b6070,
        description: '土卫五是土星的一颗大型明亮冰质卫星，表面很亮，保存了很多古老的撞击坑。',
        relativeSize: 0.12 // 1528/12742
    },
    enceladus: {
        name: '土卫二',
        nameCN: '土卫二',
        nameEN: 'Enceladus',
        type: '卫星',
        diameter: 504, // km
        mass: 0.000108, // 10²⁴ kg
        category: 'moon',
        distance: 1435.2, // 百万 km（随土星）
        orbitPeriod: 1.37, // 天
        rotationPeriod: 1.37,
        color: 0x9fd9ff,
        emissive: 0x2f4f70,
        description: '土卫二是土星内部很活跃的冰卫星，南极有“虎纹”冰裂隙，会喷出冰尘和蒸汽。',
        relativeSize: 0.0396 // 504/12742
    },
    phobos: {
        name: '火卫一',
        nameCN: '火卫一',
        nameEN: 'Phobos',
        type: '卫星',
        diameter: 22.2, // km
        mass: 0.0000000107, // 10²⁴ kg
        category: 'moon',
        distance: 1.5, // 百万 km（随火星）
        orbitPeriod: 0.3189, // 天（火星公转周期）
        rotationPeriod: 0.3189,
        color: 0x8a7c66,
        emissive: 0x3b3022,
        description: '火卫一离火星很近，形状不规则，表面坑坑洼洼，像颗贴着主星慢跑的小卫星。',
        relativeSize: 0.00174 // 22.2/12742
    },
    deimos: {
        name: '火卫二',
        nameCN: '火卫二',
        nameEN: 'Deimos',
        type: '卫星',
        diameter: 12.6, // km
        mass: 0.0000000015, // 10²⁴ kg
        category: 'moon',
        distance: 2.3, // 百万 km（随火星）
        orbitPeriod: 1.26, // 天
        rotationPeriod: 1.26, // 同步自转
        color: 0x6e7280,
        emissive: 0x2a2f3a,
        description: '火卫二是火星较远更小的卫星，表面更暗更平静，像颗安静的伴星。',
        relativeSize: 0.00099 // 12.6/12742
    },
    triton: {
        name: '海卫一',
        nameCN: '海卫一',
        nameEN: 'Triton',
        type: '卫星',
        diameter: 2707, // km
        mass: 0.0214, // 10²⁴ kg
        category: 'moon',
        distance: 4500, // 百万 km（随海王星）
        orbitPeriod: -5.88, // 天（逆行）
        rotationPeriod: -5.88,
        color: 0x7cc8ff,
        emissive: 0x2f5f8d,
        description: '海卫一轨道逆行，可能不是原生形成，表面有年轻的地质痕迹。',
        relativeSize: 0.2124 // 2707/12742
    },
    titania: {
        name: '天卫一',
        nameCN: '天卫一',
        nameEN: 'Titania',
        type: '卫星',
        diameter: 1578, // km
        mass: 0.00342, // 10²⁴ kg
        category: 'moon',
        distance: 2870, // 百万 km（随天王星）
        orbitPeriod: 8.71, // 天
        rotationPeriod: 8.71,
        color: 0x88b999,
        emissive: 0x3e5b61,
        description: '天卫一是天王星系统里较大的卫星，拥有巨大的断裂谷和亮暗相间地形。',
        relativeSize: 0.1238 // 1578/12742
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
        diameter: 30000000000000, // km，约 30 万亿公里，约 200,000 AU
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

// ============ 行星视频映射 ============
const planetVideos = {
    sun: 'videos/sun.mov',
    mercury: 'videos/Mercury.mp4',
    venus: 'videos/venus.mp4',
    earth: 'videos/Earth.mp4',
    moon: 'videos/moon.mp4',
    mars: 'videos/mars.mp4',
    jupiter: 'videos/Jupiter.mp4',
    uranus: 'videos/Uranus.mp4',
    neptune: 'videos/Neptune.mp4',
    enceladus: 'videos/Enceladus.mp4',
};

// ============ 太阳系介绍浮层数据 ============
const SOLAR_GUIDE_VIDEO_PATH = 'videos/9solor-planents.mp4';

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
    moon: 'textures/moon.jpg',
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
    const fallbackText = data?.nameCN
        ? `${data.nameCN}，${data.nameEN}`
        : planetAudioNarration[planetKey];
    if (!data && !fallbackText) return;

    // 构造降级文本
    const audioFallbackText = planetAudioNarration[planetKey] || fallbackText;

    const audioPath = `audio/solar/${planetKey}.mp3`;
    const fallbackTextFinal = audioFallbackText;
    const audio = new Audio(audioPath);
    currentAudio = audio;

    audio.play().catch(() => {
        // MP3 加载失败，降级到 Web Speech API
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(fallbackTextFinal);
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

function playVolumeFillCollisionSound(targetCount, targetType = 'sun', durationMs = 3000) {
    const interval = targetType === 'blackHole' ? 0.07 : 0.09;
    const minByScale = targetCount >= 1000000000 ? 24 : targetCount >= 1000000 ? 20 : targetCount >= 10000 ? 16 : 12;
    // 让"咔哒"声一直延续到动画结束（多铺 2 个尾音让收尾自然）
    const durationCount = Math.ceil((durationMs / 1000) / interval) + 2;
    playCollisionBurst({
        count: Math.max(minByScale, durationCount),
        interval,
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
    io: '木卫一，Io，太阳系里火山活动最活跃的卫星。它的表面有很多活火山，经常会喷出岩浆和硫磺，所以看起来是黄色、橙色、红色。它不是一颗安静的月亮，而像一个一直在冒火的小火球。',
    europa: '木卫二，Europa，木星的一颗冰壳卫星，表面覆盖着厚厚的冰，冰下面可能有一片很深的地下海洋，那里可能有适合生命存在的环境，所以木卫二是太阳系里最值得探索的卫星之一。',
    ganymede: '木卫三，Ganymede，太阳系最大的卫星，比水星还大，它的外面像冰壳，里面可能有一片看不见的大海，木卫三有自己的磁场，像是自己的保护罩。',
    titan: '土卫六，Titan，土星最大的卫星之一，常有厚厚的氮气大气层，地表有甲烷湖海和有机物染色的色带，是一个独特的“多雾天体”。',
    enceladus: '土卫二，Enceladus，土星内部热活动很活跃，南极有冰裂隙“虎纹”，会把冰尘和蒸汽喷出到外太空。现在很多任务把它当成‘最有希望发现生命迹象’的目标之一。',
    rhea: '土卫五，Rhea，土星的一颗大型冰质卫星，表面很亮、布满陨石坑和断裂带，和木星土星系内卫星相比表面保存得相对完整。',
    phobos: '火卫一，Phobos，火星离它最近的小卫星，形状不规则，表面坑坑洼洼，靠得很近、绕行也很快，像个“贴着火星跑”的小月球。',
    deimos: '火卫二，Deimos，火星的外侧卫星，体积更小更暗，轨道离得更远、更平稳，像颗安静、细小的伴星。',
    triton: '海卫一，Triton，海王星的最大卫星，轨道是逆行的，说明它很可能不是原生形成，而是后来被俘获，表面有年轻的地质痕迹。',
    titania: '天卫一，Titania，天王星系统里体积较大的卫星之一，表面有巨型断谷和亮暗相间地形，内部可能藏有历史上复杂的构造痕迹。',
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

const satelliteDockItems = [
    { key: 'io', nameCN: '木卫一', nameShort: '木卫一', accent: 0xffdd44, texture: 'textures/io.jpg' },
    { key: 'ganymede', nameCN: '木卫三', nameShort: '木卫三', accent: 0xaabbcc, texture: 'textures/ganymede.jpg' },
    { key: 'europa', nameCN: '木卫二', nameShort: '木卫二', accent: 0xccddee, texture: 'textures/europa.jpg' },
    { key: 'titan', nameCN: '土卫六', nameShort: '土卫六', accent: 0xf6d08b, texture: 'textures/titan.jpg' },
    { key: 'rhea', nameCN: '土卫五', nameShort: '土卫五', accent: 0x9fa2b8, texture: 'textures/rhea.jpg' },
    { key: 'enceladus', nameCN: '土卫二', nameShort: '土卫二', accent: 0x9fd9ff, texture: 'textures/enceladus.jpg' },
    { key: 'phobos', nameCN: '火卫一', nameShort: '火卫一', accent: 0x8a7c66, texture: 'textures/phobos_clean.jpg' },
    { key: 'deimos', nameCN: '火卫二', nameShort: '火卫二', accent: 0x6e7280, texture: 'textures/deimos.jpg' },
    { key: 'triton', nameCN: '海卫一', nameShort: '海卫一', accent: 0x7cc8ff, texture: 'textures/triton.jpg' },
    { key: 'titania', nameCN: '天卫一', nameShort: '天卫一', accent: 0x88b999, texture: 'textures/titania.jpg' }
];

const moonKeyToName = {
    io: '木卫一',
    europa: '木卫二',
    ganymede: '木卫三',
    titan: '土卫六',
    rhea: '土卫五',
    enceladus: '土卫二',
    phobos: '火卫一',
    deimos: '火卫二',
    triton: '海卫一',
    titania: '天卫一'
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
let isSatelliteStripOpen = false;
let clock;
let raycaster, mouse;
let currentSunStyle = 'simple'; // 'simple' 或 'realistic'
let currentComparisonMetric = 'diameter'; // 'diameter'、'mass' 或 'width'
let currentComparisonTab = 'diameter'; // 'diameter'、'mass'、'volumeCapacity'、'massCapacity' 或 'widthCapacity'
let isDiameterDetailMode = false; // 按直径页签内的小天体放大模式
let currentDiameterDetailIndex = -1; // 按直径页签下的当前小天体版本索引
const SATELLITE_COMPARISON_KEYS = [
    'ganymede',
    'titan',
    'io',
    'europa',
    'triton',
    'titania',
    'rhea',
    'enceladus',
    'phobos',
    'deimos'
];
const COMPARISON_BODY_KEYS = [
    'uyScuti',
    'vyCanisMajoris',
    'betelgeuse',
    'antares',
    'arcturus',
    'betaCentauri',
    'sirius',
    'alphaCentauri',
    'sun',
    'proximaCentauri',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'earth',
    'venus',
    'mars',
    'mercury',
    ...SATELLITE_COMPARISON_KEYS,
    'moon',
    'pluto',
    'eris',
    'haumea',
    'makemake',
    'ceres'
];
const DIAMETER_BLACK_HOLE_KEY = 'blackHoleScope';
const DIAMETER_START_KEYS = [
    'oortCloud',
    DIAMETER_BLACK_HOLE_KEY,
    'sun',
    'proximaCentauri',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'earth',
    'mars',
    'ganymede',
    'phobos'
];

function uniqueComparisonKeys(keys) {
    return [...new Set(keys)].filter(key => planetData[key]);
}

function uniqueDiameterComparisonKeys(keys) {
    const seen = new Set();
    return keys.filter(key => {
        if (seen.has(key)) return false;
        if (key !== DIAMETER_BLACK_HOLE_KEY && !planetData[key]) return false;
        seen.add(key);
        return true;
    });
}

function sortComparisonKeys(keys, metric = 'diameter') {
    return uniqueComparisonKeys(keys)
        .sort((a, b) => {
            const aValue = planetData[a]?.[metric] || 0;
            const bValue = planetData[b]?.[metric] || 0;
            return bValue - aValue;
        });
}

function getComparisonKeysWithout(excludedKeys) {
    const excluded = new Set(excludedKeys);
    return COMPARISON_BODY_KEYS.filter(key => !excluded.has(key));
}

function getCapacityObjectKeys(targetKey) {
    return COMPARISON_BODY_KEYS.filter(key => key !== targetKey);
}

function getDiameterBaseSequenceKeys() {
    return uniqueDiameterComparisonKeys([
        'oortCloud',
        DIAMETER_BLACK_HOLE_KEY,
        ...sortComparisonKeys(COMPARISON_BODY_KEYS, 'diameter')
    ]);
}

function getDiameterStartLabel(key) {
    if (key === 'oortCloud') return '全部';
    if (key === DIAMETER_BLACK_HOLE_KEY) return '从黑洞开始';
    return `从${planetData[key].nameCN}开始`;
}

function getDiameterStartSubtitle(key) {
    if (key === 'oortCloud') {
        return '从奥尔特云开始，把黑洞、巨星、太阳、比邻星和后面的天体按真实直径排在一起';
    }
    if (key === DIAMETER_BLACK_HOLE_KEY) {
        return '去掉奥尔特云，从黑洞开始，后面的天体会按当前最大天体重新缩放';
    }
    return `从${planetData[key].nameCN}开始，前面更大的天体先收起来，后面的天体按真实直径重新缩放`;
}

function buildDiameterDetailProfiles() {
    const baseSequence = getDiameterBaseSequenceKeys();
    return DIAMETER_START_KEYS
        .map(startKey => {
            const startIndex = baseSequence.indexOf(startKey);
            if (startIndex < 0) return null;
            const planets = baseSequence.slice(startIndex);
            return {
                label: getDiameterStartLabel(startKey),
                subtitle: getDiameterStartSubtitle(startKey),
                isBlackHoleProfile: planets.includes(DIAMETER_BLACK_HOLE_KEY),
                planets
            };
        })
        .filter(Boolean);
}

const DIAMETER_DETAIL_PROFILES = buildDiameterDetailProfiles();
let currentCapacityView = 'sun';
const currentCapacitySelections = {
    uyScuti: 'sun',
    vyCanisMajoris: 'sun',
    betelgeuse: 'sun',
    antares: 'sun',
    arcturus: 'sun',
    betaCentauri: 'sun',
    sirius: 'sun',
    alphaCentauri: 'sun',
    sun: 'earth',
    jupiter: 'earth',
    saturn: 'earth',
    uranus: 'earth',
    neptune: 'earth',
    earth: 'venus',
    venus: 'mars',
    mars: 'ganymede',
    proximaCentauri: 'jupiter',
    blackHole: 'earth',
    blackHoleEventHorizon: 'earth',
    blackHoleGravitationalRadius: 'earth',
    dragBlackHole: 'earth',
    dragBlackHoleEventHorizon: 'earth',
    dragBlackHoleGravitationalRadius: 'earth'
};
let dragVolumeAnimationId = null; // 拖进太阳动画帧 ID
let activeDragCleanup = null; // 当前拖拽态的兜底清理函数
let pendingDragResultRevealIds = []; // 拖拽结果延时显隐定时器
let isRealMotion = false; // 是否使用真实自转 / 公转比例
let simulationTime = 0; // 暂停期间不增长，恢复时从冻结画面继续
let currentBlackHoleScope = 'blackHoleEventHorizon'; // 黑洞能装子口径
let currentDragBlackHoleScope = 'blackHoleEventHorizon'; // 拖进黑洞子口径

// 折合后的“真实运动”速度
// 公转：1 秒约等于 24 个地球日，地球绕太阳一圈约 15.2 秒
// 自转：1 秒约等于 0.2 个地球日，地球自转一圈约 5 秒
const REAL_ORBIT_DAYS_PER_SECOND = 24;
const REAL_ROTATION_DAYS_PER_SECOND = 0.2;
const REAL_SCALE_REFERENCE_DIAMETER = planetData.jupiter.diameter;
const REAL_SCALE_REFERENCE_SIZE = 4 + planetData.jupiter.relativeSize * 0.4;
// 黑洞口径：事件视界（史瓦西半径）与引力影响区
const BLACK_HOLE_EVENT_HORIZON_RADIUS_KM = 12000000;
// 简化教学口径：用“引力影响区”展示 Sgr A*，约 1,000,000,000 km（约 6.7 AU）
const BLACK_HOLE_GRAVITY_RADIUS_KM = 1000000000;
const COMPARISON_MODE_ALIASES = {
    volume: 'volumeCapacity',
    sunVolume: 'volumeCapacity'
};
const DRAG_COMPARISON_TABS = new Set([
    'dragVolume',
    'dragBlackHole',
    'dragBlackHoleEventHorizon',
    'dragBlackHoleGravitationalRadius'
]);
const CAPACITY_MODE_METRICS = {
    volumeCapacity: 'diameter',
    massCapacity: 'mass',
    widthCapacity: 'width'
};
const CAPACITY_COMPARISON_TABS = new Set([
    'volumeCapacity',
    'massCapacity',
    'widthCapacity',
    'sunVolume',
    'volume',
    'jupiterVolume',
    'saturnVolume',
    'uranusVolume',
    'neptuneVolume',
    'dragVolume',
    'blackHoleVolume',
    'dragBlackHole',
    'dragBlackHoleEventHorizon',
    'dragBlackHoleGravitationalRadius',
    'blackHoleEventHorizonVolume',
    'blackHoleGravitationalVolume'
]);
// 两种黑洞口径：事件视界与引力影响区
const BLACK_HOLE_SCOPE_LABELS = {
    blackHoleEventHorizon: '事件视界',
    blackHoleGravitationalRadius: '引力影响区'
};
const BLACK_HOLE_TARGET_KEYS = Object.keys(BLACK_HOLE_SCOPE_LABELS);
const BLACK_HOLE_SCOPE_OPTIONS = [
    { key: 'blackHoleEventHorizon', label: '事件视界' },
    { key: 'blackHoleGravitationalRadius', label: '引力影响区' }
];
const TEACHING_NUMBER_FONT = '"Noto Sans SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';

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

function normalizeComparisonMode(mode) {
    return COMPARISON_MODE_ALIASES[mode] || mode;
}

function isDragComparisonTab(mode) {
    return DRAG_COMPARISON_TABS.has(normalizeComparisonMode(mode));
}

function isCapacityComparisonMode(mode) {
    return CAPACITY_COMPARISON_TABS.has(normalizeComparisonMode(mode));
}
const BLACK_HOLE_MASS_IN_SOLAR_MASSES = 4000000;
const BLACK_HOLE_TEXTURE_PATH = 'textures/2.png';
const blackHoleTextureImage = new Image();
blackHoleTextureImage.src = BLACK_HOLE_TEXTURE_PATH;

// ============ 拖入填充动画 - 行星纹理缓存 ============
// 在 canvas 粒子里贴对应天体的真实纹理（用 Solar System Scope 资源）
const DRAG_VOLUME_TEXTURE_PATHS = {
    sun: 'textures/sun.jpg',
    proximaCentauri: STAR_SURFACE_TEXTURES.proximaCentauri,
    alphaCentauri: STAR_SURFACE_TEXTURES.alphaCentauri,
    betaCentauri: STAR_SURFACE_TEXTURES.betaCentauri,
    sirius: STAR_SURFACE_TEXTURES.sirius,
    arcturus: STAR_SURFACE_TEXTURES.arcturus,
    antares: STAR_SURFACE_TEXTURES.antares,
    betelgeuse: STAR_SURFACE_TEXTURES.betelgeuse,
    vyCanisMajoris: STAR_SURFACE_TEXTURES.vyCanisMajoris,
    uyScuti: STAR_SURFACE_TEXTURES.uyScuti,
    mercury: 'textures/mercury.jpg',
    venus: 'textures/venus_atmosphere.jpg',
    earth: 'textures/earth_daymap.jpg',
    moon: 'textures/moon.jpg',
    mars: 'textures/mars.jpg',
    ceres: 'textures/ceres.jpg',
    jupiter: 'textures/jupiter.jpg',
    saturn: 'textures/saturn.jpg',
    uranus: 'textures/uranus.jpg',
    neptune: 'textures/neptune.jpg',
    pluto: 'textures/pluto.jpg',
    eris: 'textures/eris.jpg',
    haumea: 'textures/haumea.jpg',
    makemake: 'textures/makemake.jpg',
    io: 'textures/io.jpg',
    europa: 'textures/europa.jpg',
    ganymede: 'textures/ganymede.jpg',
    callisto: 'textures/callisto.jpg',
    titan: 'textures/titan.jpg',
    rhea: 'textures/rhea.jpg',
    enceladus: 'textures/enceladus.jpg',
    phobos: 'textures/phobos_clean.jpg',
    deimos: 'textures/deimos.jpg',
    triton: 'textures/triton.jpg',
    titania: 'textures/titania.jpg',
    oberon: 'textures/oberon.jpg'
};
const dragVolumeTextureCache = {};
function getDragVolumeTexture(key) {
    const path = DRAG_VOLUME_TEXTURE_PATHS[key];
    if (!path) return null;
    if (!dragVolumeTextureCache[path]) {
        const img = new Image();
        img.src = path;
        dragVolumeTextureCache[path] = img;
    }
    return dragVolumeTextureCache[path];
}
// 预加载（提高首次拖入时的命中率）
Object.keys(DRAG_VOLUME_TEXTURE_PATHS).forEach(getDragVolumeTexture);

// 拖入容器样式：'realistic'（默认太阳/黑洞）或 'glass'（透明玻璃球）
let dragContainerStyle = 'realistic';
function isGlassDragMode() { return dragContainerStyle === 'glass'; }

// 玻璃球容器分上下两层：先画 back 作底，再画装入的小球，最后画 front 高光描边
function drawGlassContainerBack(ctx, size, margin = 10) {
    const cx = size / 2, cy = size / 2, r = size / 2 - margin;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    const inner = ctx.createRadialGradient(cx, cy, r * 0.05, cx, cy, r);
    inner.addColorStop(0, 'rgba(220, 240, 255, 0.06)');
    inner.addColorStop(0.6, 'rgba(160, 200, 255, 0.08)');
    inner.addColorStop(1, 'rgba(110, 150, 220, 0.18)');
    ctx.fillStyle = inner;
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
}
function drawGlassContainerFront(ctx, size, margin = 10) {
    const cx = size / 2, cy = size / 2, r = size / 2 - margin;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    // 左上反光
    const hilite = ctx.createRadialGradient(cx - r * 0.45, cy - r * 0.55, 0, cx - r * 0.45, cy - r * 0.55, r * 0.7);
    hilite.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
    hilite.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
    hilite.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = hilite;
    ctx.fillRect(0, 0, size, size);
    // 底部反射弧
    const refl = ctx.createLinearGradient(0, cy + r * 0.45, 0, cy + r);
    refl.addColorStop(0, 'rgba(255, 255, 255, 0)');
    refl.addColorStop(1, 'rgba(170, 200, 240, 0.16)');
    ctx.fillStyle = refl;
    ctx.fillRect(cx - r, cy + r * 0.45, r * 2, r);
    ctx.restore();
    // 玻璃边缘双层描边
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(220, 240, 255, 0.62)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r - 3, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
}

// 计算大球（半径 R）内可以六边形密铺的小球（半径 r0）槽位
// 返回相对球心的 [{x,y}] 列表，按从下到上、左右居中的顺序排好
function computeHexSlots(R, r0, options = {}) {
    const padding = options.padding ?? r0 * 0.05;
    const outerR = R - r0 - padding;
    if (outerR <= 0) return [];
    const innerR = options.innerR ?? 0; // 用于黑洞：挖掉中心黑核
    const innerR2 = innerR * innerR;
    const rowH = Math.sqrt(3) * r0 * (options.rowScale ?? 1);
    const colW = 2 * r0 * (options.colScale ?? 1);
    const halfRows = Math.ceil(outerR / rowH) + 1;
    const halfCols = Math.ceil(outerR / colW) + 1;
    const slots = [];
    for (let j = -halfRows; j <= halfRows; j++) {
        const y = j * rowH;
        const offset = (j & 1) ? r0 : 0;
        for (let i = -halfCols; i <= halfCols; i++) {
            const x = i * colW + offset;
            const d2 = x * x + y * y;
            if (d2 <= outerR * outerR && d2 >= innerR2) {
                slots.push({ x, y });
            }
        }
    }
    // 从底部往顶部依次"长高"，同一行从中央向两侧扩散
    slots.sort((a, b) => {
        if (b.y !== a.y) return b.y - a.y;
        return Math.abs(a.x) - Math.abs(b.x);
    });
    return slots;
}

const LOW_COUNT_VISUAL_LIMIT = 100;
const MAX_VISUAL_PARTICLE_COUNT = 5000;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function getVisualParticleCount(targetCount) {
    if (!Number.isFinite(targetCount) || targetCount <= 0) return 1;
    return Math.max(1, Math.min(MAX_VISUAL_PARTICLE_COUNT, Math.round(targetCount)));
}

function shouldUseCountedLayout(targetCount) {
    return getVisualParticleCount(targetCount) <= LOW_COUNT_VISUAL_LIMIT;
}

function sort2DFillSlots(slots) {
    return slots.sort((a, b) => {
        if (b.y !== a.y) return b.y - a.y;
        return Math.abs(a.x) - Math.abs(b.x);
    });
}

function computeCountedCircleSlots(R, r0, count, options = {}) {
    const innerR = options.innerR ?? 0;
    const padding = options.padding ?? r0 * 0.04;
    const outerLimit = Math.max(0, R - padding - r0 * 0.78);
    const innerLimit = innerR > 0 ? Math.min(outerLimit, innerR + r0 * 0.32) : 0;
    const radialSpan = Math.max(0, outerLimit - innerLimit);

    if (count <= 1) {
        return [{ x: 0, y: innerR > 0 ? innerLimit : 0 }];
    }

    if (innerR <= 0 && count <= 12) {
        if (count === 2) {
            const dx = outerLimit * 0.42;
            return sort2DFillSlots([{ x: -dx, y: 0 }, { x: dx, y: 0 }]);
        }
        if (count <= 4) {
            const ringR = outerLimit * 0.62;
            const startAngle = count === 3 ? -Math.PI / 2 : Math.PI / 4;
            const slots = Array.from({ length: count }, (_, i) => {
                const angle = startAngle + i * Math.PI * 2 / count;
                return { x: Math.cos(angle) * ringR, y: Math.sin(angle) * ringR };
            });
            return sort2DFillSlots(slots);
        }

        const slots = [{ x: 0, y: 0 }];
        const ringCount = count - 1;
        const ringR = outerLimit * (count <= 7 ? 0.62 : 0.72);
        for (let i = 0; i < ringCount; i++) {
            const angle = -Math.PI / 2 + i * Math.PI * 2 / ringCount;
            slots.push({ x: Math.cos(angle) * ringR, y: Math.sin(angle) * ringR });
        }
        return sort2DFillSlots(slots);
    }

    const slots = [];
    for (let i = 0; i < count; i++) {
        const t = (i + 0.5) / count;
        const radial = innerLimit + radialSpan * Math.sqrt(t);
        const angle = -Math.PI / 2 + i * GOLDEN_ANGLE;
        slots.push({
            x: Math.cos(angle) * radial,
            y: Math.sin(angle) * radial
        });
    }
    return sort2DFillSlots(slots);
}

function compute2DParticleSlots(R, r0, visualCount, targetCount, options = {}) {
    if (shouldUseCountedLayout(targetCount)) {
        return computeCountedCircleSlots(R, r0, visualCount, options);
    }
    return computeHexSlots(R, r0, options);
}

// 在 canvas 上绘制一个带光照的纹理小行星
function drawTexturedMiniPlanet(ctx, x, y, radius, key, fallbackColor) {
    if (radius < 0.5) return;
    const img = getDragVolumeTexture(key);
    const ready = img && img.complete && img.naturalWidth > 0;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();

    if (ready) {
        const srcSize = Math.min(img.naturalWidth, img.naturalHeight);
        const sx = (img.naturalWidth - srcSize) / 2;
        const sy = (img.naturalHeight - srcSize) / 2;
        ctx.drawImage(img, sx, sy, srcSize, srcSize, x - radius, y - radius, radius * 2, radius * 2);
    } else {
        ctx.fillStyle = fallbackColor || '#888';
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    // 球体光照：左上方光源 + 右下方阴影，让平面纹理看起来像 3D
    const lightGrad = ctx.createRadialGradient(
        x - radius * 0.4, y - radius * 0.45, radius * 0.05,
        x, y, radius * 1.05
    );
    lightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.32)');
    lightGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0)');
    lightGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.28)');
    lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = lightGrad;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

    ctx.restore();
}

// 在已激活的 Three.js 场景里跑装入动画：按时间从下到上显形小球
function start3DFillAnimation(data, animationConfig = {}, defaultResultLabel = '能装', soundType = 'sun') {
    const targetCount = data.count;
    const visualCount = getVisualParticleCount(targetCount);
    const R = 2.4;
    const r0 = compute3DParticleRadius(R, targetCount);
    const slots = compute3DParticleSlots(R, r0, visualCount, targetCount);
    const finalShown = Math.min(slots.length, visualCount);
    Drag3DScene.setData(data.key, r0, R, slots.slice(0, finalShown), {
        glass: true, // 3D 永远是玻璃外壳
        fallbackColor: data.color
    });
    Drag3DScene.setVisibleCount(0);

    const duration = soundType === 'blackHole' ? 3200 : 3000;
    playVolumeFillCollisionSound(targetCount, soundType, duration);
    const startTime = performance.now();
    let resultShown = false;

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const fillLevel = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        Drag3DScene.setVisibleCount(Math.ceil(fillLevel * finalShown));
        if (progress < 1) {
            dragVolumeAnimationId = requestAnimationFrame(step);
        } else {
            dragVolumeAnimationId = null;
            if (!resultShown) {
                showDragResult(data.label, data.nameCN, animationConfig.resultLabel || defaultResultLabel);
                resultShown = true;
            }
        }
    }
    dragVolumeAnimationId = requestAnimationFrame(step);
}

// 按目标数量反推：少量天体时让球占大，多时密铺到很小
// 2D 圆内 hex packing 容量 ≈ 0.907 * (R/r)²  →  r = R * sqrt(0.907 / N)
function compute2DParticleRadius(R, targetCount) {
    const visualCount = getVisualParticleCount(targetCount);
    if (visualCount <= LOW_COUNT_VISUAL_LIMIT) {
        const fillDensity = visualCount <= 2 ? 0.9 : visualCount <= 6 ? 0.86 : 0.82;
        return Math.max(5, Math.min(R * 0.88, R * Math.sqrt(fillDensity / visualCount)));
    }
    const N = Math.min(Math.max(1, targetCount), MAX_VISUAL_PARTICLE_COUNT);
    const r = R * Math.sqrt(0.907 / N);
    // 下限：5px 防止粒子过小看不见纹理
    return Math.max(5, Math.min(R * 0.7, r));
}
// 3D 球内 FCC packing 容量 ≈ 0.74 * (R/r)³  →  r = R * cbrt(0.74 / N)
function compute3DParticleRadius(R, targetCount) {
    const visualCount = getVisualParticleCount(targetCount);
    if (visualCount <= LOW_COUNT_VISUAL_LIMIT) {
        const fillDensity = visualCount <= 2 ? 0.82 : 0.74;
        return Math.max(0.06, Math.min(R * 0.86, R * Math.cbrt(fillDensity / visualCount)));
    }
    const N = Math.min(Math.max(1, targetCount), MAX_VISUAL_PARTICLE_COUNT);
    const r = R * Math.cbrt(0.74 / N);
    return Math.max(0.06, Math.min(R * 0.7, r));
}

// ============ 3D 装入容器（Three.js）============
// 当用户切到"3D 立体"模式时启用：用透明玻璃球外壳 + 球内 FCC 紧密堆积纹理小球，
// 鼠标可拖动旋转，自动慢转。原 2D 装入完全不动。
let dragRender3D = false;
function isDrag3DMode() { return dragRender3D; }

// 球内 FCC（面心立方）紧密堆积槽位：覆盖率约 74%，比简单立方更密
function computeSphereSlots3D(R, r0, options = {}) {
    const padding = options.padding ?? r0 * 0.08;
    const innerR = R - r0 - padding;
    if (innerR <= 0) return [];
    const innerR2 = innerR * innerR;
    // FCC 三向间距
    const a = 2 * r0;                  // 列间距
    const b = Math.sqrt(3) * r0;       // 同层行间距
    const c = Math.sqrt(2 / 3) * 2 * r0; // 层间距
    const halfL = Math.ceil(innerR / c) + 1;
    const halfR = Math.ceil(innerR / b) + 1;
    const halfC = Math.ceil(innerR / a) + 1;
    const slots = [];
    for (let l = -halfL; l <= halfL; l++) {
        const z = l * c;
        // 相邻层错位
        const layerOff = Math.abs(l) % 2;
        for (let j = -halfR; j <= halfR; j++) {
            const y = j * b + (layerOff ? b / 2 : 0);
            const rowOff = (j & 1) ^ layerOff;
            for (let i = -halfC; i <= halfC; i++) {
                const x = i * a + (rowOff ? r0 : 0);
                if (x * x + y * y + z * z <= innerR2) {
                    slots.push({ x, y, z });
                }
            }
        }
    }
    // 从底向上显形（Three.js +y 朝上，y 越小越靠下），同高度从中心向外
    slots.sort((a2, b2) => {
        if (a2.y !== b2.y) return a2.y - b2.y;
        return (a2.x * a2.x + a2.z * a2.z) - (b2.x * b2.x + b2.z * b2.z);
    });
    return slots;
}

function computeCountedSphereSlots3D(R, r0, count) {
    const outerLimit = Math.max(0, R - r0 * 0.9);
    if (count <= 1) return [{ x: 0, y: 0, z: 0 }];
    if (count === 2) {
        const dx = outerLimit * 0.42;
        return [{ x: -dx, y: 0, z: 0 }, { x: dx, y: 0, z: 0 }];
    }

    const slots = [];
    for (let i = 0; i < count; i++) {
        const t = (i + 0.5) / count;
        const radius = outerLimit * Math.cbrt(t);
        const yUnit = 1 - 2 * t;
        const ring = Math.sqrt(Math.max(0, 1 - yUnit * yUnit));
        const angle = i * GOLDEN_ANGLE;
        slots.push({
            x: Math.cos(angle) * ring * radius,
            y: yUnit * radius,
            z: Math.sin(angle) * ring * radius
        });
    }
    slots.sort((a2, b2) => {
        if (a2.y !== b2.y) return a2.y - b2.y;
        return (a2.x * a2.x + a2.z * a2.z) - (b2.x * b2.x + b2.z * b2.z);
    });
    return slots;
}

function compute3DParticleSlots(R, r0, visualCount, targetCount) {
    if (shouldUseCountedLayout(targetCount)) {
        return computeCountedSphereSlots3D(R, r0, visualCount);
    }
    return computeSphereSlots3D(R, r0);
}

// Three.js 3D 装入场景（单例：同时只有一个浮层使用）
const Drag3DScene = (function () {
    let renderer = null, scene = null, camera = null, controls = null;
    let glassMesh = null;
    let instanceMesh = null;
    let slotsCache = [];          // 每个 slot：{x,y,z, spinX, spinY, birthTime, settled}
    let particleScale = 0;
    let visibleCount = 0;
    let spawnHeight = 0;          // 球生成时的初始 y（球外顶部）
    const FALL_DURATION = 650;    // ms
    let rafId = null;
    const textureCache = {};
    let baseGeo = null;
    let currentCanvas = null;
    const dummy = (typeof THREE !== 'undefined') ? new THREE.Object3D() : null;

    function ensureBaseGeo() {
        if (!baseGeo) baseGeo = new THREE.SphereGeometry(1, 28, 22);
    }

    function loadTexture(key) {
        if (textureCache[key]) return textureCache[key];
        const path = DRAG_VOLUME_TEXTURE_PATHS[key];
        if (!path) return null;
        // 复用 2D 已经预加载好的 HTMLImageElement，绕过 TextureLoader 的异步竞态
        const cachedImg = getDragVolumeTexture(key);
        let tex;
        if (cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0) {
            tex = new THREE.Texture(cachedImg);
            tex.needsUpdate = true;
        } else {
            tex = new THREE.TextureLoader().load(path);
            // image 加载完后强制 trigger 上传
            if (cachedImg) {
                const trigger = () => { tex.image = cachedImg; tex.needsUpdate = true; };
                if (cachedImg.complete) trigger();
                else cachedImg.addEventListener('load', trigger, { once: true });
            }
        }
        if ('SRGBColorSpace' in THREE) tex.colorSpace = THREE.SRGBColorSpace;
        else tex.encoding = THREE.sRGBEncoding;
        textureCache[key] = tex;
        return tex;
    }

    function init(canvas, size, dpr) {
        ensureBaseGeo();
        currentCanvas = canvas;
        try {
            renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        } catch (e) {
            console.warn('Drag3DScene: WebGLRenderer init failed', e);
            renderer = null;
            currentCanvas = null;
            return;
        }
        if (!renderer || !renderer.getContext()) {
            renderer = null;
            currentCanvas = null;
            return;
        }
        renderer.setPixelRatio(dpr || window.devicePixelRatio || 1);
        renderer.setSize(size, size, false);
        if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
        else if ('outputEncoding' in renderer) renderer.outputEncoding = THREE.sRGBEncoding;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
        camera.position.set(0, 0.6, 7.6);

        scene.add(new THREE.AmbientLight(0xffffff, 0.55));
        const key = new THREE.DirectionalLight(0xffffff, 1.0);
        key.position.set(4, 6, 5);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x9fc0ff, 0.45);
        rim.position.set(-5, -2, -4);
        scene.add(rim);

        controls = new THREE.OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.6;
    }

    function disposeMeshes() {
        if (instanceMesh) {
            scene.remove(instanceMesh);
            instanceMesh.geometry.dispose?.();
            instanceMesh.material.dispose?.();
            instanceMesh = null;
        }
        if (glassMesh) {
            scene.remove(glassMesh);
            glassMesh.geometry.dispose?.();
            glassMesh.material.dispose?.();
            glassMesh = null;
        }
    }

    function setData(textureKey, particleRadius, R, slots, options = {}) {
        if (!renderer) return;
        disposeMeshes();
        particleScale = particleRadius;
        spawnHeight = R + particleRadius * 6;
        visibleCount = 0;
        // slot 内部状态：每颗球 spawn 时记录 birthTime，掉落到目标位置后 settled
        slotsCache = slots.map(s => ({
            x: s.x, y: s.y, z: s.z,
            spinX: Math.random() * Math.PI * 2,
            spinY: Math.random() * Math.PI * 2,
            birthTime: -1,
            settled: false
        }));

        // 玻璃球外壳
        const glassMat = new THREE.MeshPhongMaterial({
            color: 0xc8e0ff,
            transparent: true,
            opacity: 0.16,
            shininess: 90,
            specular: 0xffffff,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        glassMesh = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 48), glassMat);
        scene.add(glassMesh);
        glassMesh.visible = options.glass !== false;

        // 内部小球
        const tex = loadTexture(textureKey);
        const mat = new THREE.MeshStandardMaterial({
            map: tex || null,
            roughness: 0.75,
            metalness: 0.05,
            color: tex ? 0xffffff : (options.fallbackColor || 0x888888)
        });
        instanceMesh = new THREE.InstancedMesh(baseGeo, mat, slots.length);
        instanceMesh.castShadow = false;
        instanceMesh.receiveShadow = false;
        // 初始全部置于 spawn 位置（visibleCount=0 不渲染，但 matrix 先备好）
        for (let i = 0; i < slotsCache.length; i++) {
            const s = slotsCache[i];
            dummy.position.set(s.x, spawnHeight, s.z);
            dummy.scale.setScalar(particleRadius);
            dummy.rotation.set(s.spinX, s.spinY, 0);
            dummy.updateMatrix();
            instanceMesh.setMatrixAt(i, dummy.matrix);
        }
        instanceMesh.count = 0;
        instanceMesh.instanceMatrix.needsUpdate = true;
        scene.add(instanceMesh);
    }

    function setVisibleCount(n) {
        if (!instanceMesh) return;
        const newCount = Math.max(0, Math.min(slotsCache.length, n | 0));
        const now = performance.now();
        // 新加入的 slot 给 birthTime，让 tick 内 lerp 出掉落动画
        for (let i = visibleCount; i < newCount; i++) {
            const s = slotsCache[i];
            if (s.birthTime < 0) s.birthTime = now;
        }
        // 倒退（重置）也清掉 settled 状态
        for (let i = newCount; i < visibleCount; i++) {
            const s = slotsCache[i];
            s.birthTime = -1;
            s.settled = false;
        }
        visibleCount = newCount;
        instanceMesh.count = visibleCount;
    }

    function tickFalling(now) {
        if (!instanceMesh || visibleCount === 0) return;
        let needs = false;
        for (let i = 0; i < visibleCount; i++) {
            const s = slotsCache[i];
            if (s.settled) continue;
            const elapsed = now - s.birthTime;
            const t = Math.min(1, Math.max(0, elapsed / FALL_DURATION));
            const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic（落地慢）
            const cy = spawnHeight + (s.y - spawnHeight) * ease;
            dummy.position.set(s.x, cy, s.z);
            dummy.scale.setScalar(particleScale);
            dummy.rotation.set(s.spinX, s.spinY, 0);
            dummy.updateMatrix();
            instanceMesh.setMatrixAt(i, dummy.matrix);
            needs = true;
            if (t >= 1) s.settled = true;
        }
        if (needs) instanceMesh.instanceMatrix.needsUpdate = true;
    }

    function setGlassVisible(v) {
        if (glassMesh) glassMesh.visible = !!v;
    }

    function start() {
        if (!renderer) return;
        if (rafId) cancelAnimationFrame(rafId);
        const loop = (now) => {
            tickFalling(now || performance.now());
            controls?.update();
            renderer.render(scene, camera);
            rafId = requestAnimationFrame(loop);
        };
        loop(performance.now());
    }

    function stop() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
    }

    function destroy() {
        stop();
        disposeMeshes();
        if (controls) controls.dispose();
        if (renderer) {
            renderer.dispose();
            renderer.forceContextLoss?.();
        }
        // 必须清纹理与几何缓存：旧 GL context 已销毁，下次 init 用新 renderer
        // 时复用旧 Texture/BufferGeometry 会读不到 GPU 资源 → 显示白球
        Object.keys(textureCache).forEach(k => {
            textureCache[k].dispose?.();
            delete textureCache[k];
        });
        if (baseGeo) {
            baseGeo.dispose?.();
            baseGeo = null;
        }
        slotsCache = [];
        visibleCount = 0;
        renderer = null; controls = null; scene = null; camera = null;
        currentCanvas = null;
    }

    function resize(size, dpr) {
        if (renderer) renderer.setSize(size, size, false);
        if (renderer && (dpr || 1) !== renderer.getPixelRatio()) renderer.setPixelRatio(dpr || 1);
    }

    return {
        init, setData, setVisibleCount, setGlassVisible,
        start, stop, destroy, resize,
        get isReady() { return !!renderer; },
        get canvas() { return currentCanvas; },
        get slotCount() { return slotsCache.length; }
    };
})();

// 银河系中心黑洞 Sgr A*，按引力影响区口径估算
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
        { name: '火卫一', nameCN: '火卫一', diameter: 22.2, orbitRadius: 2.5, orbitSpeed: 0.08, color: 0x8b7355, desc: '火卫一（Phobos）是贴近火星的内侧卫星，形状不规则、表面坑洼。它离火星非常近，每天要跑很多圈，外观偏暗、偏破碎。', texturePath: 'textures/phobos_clean.jpg', brightness: 1.08, fresnelColor: 'vec3(0.72, 0.62, 0.5)', fresnelIntensity: 0.08, shape: 'irregularRock', rockSeed: 1.7, axisScale: [1.25, 1.02, 0.84] },
        { name: '火卫二', nameCN: '火卫二', diameter: 12.6, orbitRadius: 3.5, orbitSpeed: 0.05, color: 0x9a8b7a, desc: '火卫二（Deimos）是火星的外侧卫星，体积更小更暗，轨道更远，运行更慢，适合理解“卫星也有“多层”轨道”的差别。', texturePath: 'textures/deimos.jpg', brightness: 1.12, fresnelColor: 'vec3(0.7, 0.66, 0.6)', fresnelIntensity: 0.08, shape: 'irregularRock', rockSeed: 2.4, axisScale: [1.18, 0.96, 0.84] }
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
        { name: '土卫六', nameCN: '土卫六', diameter: 5150, orbitRadius: 14, orbitSpeed: 0.035, color: 0xddaa55, desc: '土卫六（Titan）是土星最大的卫星之一，拥有浓厚氮气大气，地表有甲烷湖海和迷雾状天象，被称为“另一个早期地球”。', texturePath: 'textures/titan.jpg', brightness: 1.1, fresnelColor: 'vec3(0.94, 0.74, 0.36)', fresnelIntensity: 0.12, atmosphereColor: [0.95, 0.7, 0.3], atmosphereSize: 1.07, atmosphereIntensity: 0.18, segments: 48 },
        { name: '土卫二', nameCN: '土卫二', diameter: 504, orbitRadius: 10, orbitSpeed: 0.06, color: 0xffffff, desc: '土卫二（Enceladus）在南极有“虎纹”冰裂隙，正在向太空喷射含冰颗粒和蒸汽，常被拿来讨论是否存在地下海洋。', texturePath: 'textures/enceladus.jpg', brightness: 1.24, fresnelColor: 'vec3(0.86, 0.94, 1.0)', fresnelIntensity: 0.18, segments: 48 },
        { name: '土卫五', nameCN: '土卫五', diameter: 1527, orbitRadius: 12, orbitSpeed: 0.045, color: 0xcccccc, desc: '土卫五（Rhea）是土星较亮的一颗大卫星，表面主要是冰和岩石，保存了很多陨石坑与地形裂隙，对撞击史很友好。', texturePath: 'textures/rhea.jpg', brightness: 1.12, fresnelColor: 'vec3(0.82, 0.84, 0.88)', fresnelIntensity: 0.1, segments: 48 }
    ],
    // 天王星的卫星
    uranus: [
        { name: '天卫一', nameCN: '天卫一', diameter: 1578, orbitRadius: 7, orbitSpeed: 0.05, color: 0xaabbbb, desc: '天卫一（Titania）是天王星系统中较大的卫星，拥有巨大的断裂谷和古老平原，显示它有复杂的内部演化历史。', texturePath: 'textures/titania.jpg', brightness: 1.14, fresnelColor: 'vec3(0.82, 0.88, 0.94)', fresnelIntensity: 0.08, segments: 48 },
        { name: '天卫四', nameCN: '天卫四', diameter: 1523, orbitRadius: 9, orbitSpeed: 0.04, color: 0x99aaaa, desc: '奥伯龙', texturePath: 'textures/oberon.jpg', brightness: 1.14, fresnelColor: 'vec3(0.8, 0.84, 0.9)', fresnelIntensity: 0.08, segments: 48 }
    ],
    // 海王星的卫星
    neptune: [
        { name: '海卫一', nameCN: '海卫一', diameter: 2707, orbitRadius: 7, orbitSpeed: -0.04, color: 0xddccbb, desc: '海卫一（Triton）围绕海王星逆行，疑似被俘获，南北两半球地貌差异明显，带有年轻地质活动的痕迹。', texturePath: 'textures/triton.jpg', brightness: 1.12, fresnelColor: 'vec3(0.9, 0.86, 0.8)', fresnelIntensity: 0.08, segments: 48 }
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
    controls.minDistance = 0.5;
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

// ============ 连续不规则石块几何体 ============
function createIrregularRockGeometry(size, config = {}) {
    const geometry = new THREE.SphereGeometry(size, 64, 32);
    const position = geometry.attributes.position;
    const seed = config.rockSeed || 1;
    const axisScale = config.axisScale || [1.18, 0.96, 0.84];

    for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const y = position.getY(i);
        const z = position.getZ(i);
        const length = Math.sqrt(x * x + y * y + z * z) || 1;
        const nx = x / length;
        const ny = y / length;
        const nz = z / length;
        const broadLump = Math.sin(nx * 3.2 + ny * 1.7 + seed) * 0.055;
        const sideDent = Math.sin(ny * 4.5 - nz * 2.1 + seed * 1.9) * 0.04;
        const ridge = Math.sin((nx + nz) * 5.3 + seed * 2.7) * 0.03;
        const factor = 1 + broadLump + sideDent + ridge;

        position.setXYZ(
            i,
            nx * size * axisScale[0] * factor,
            ny * size * axisScale[1] * (factor * 0.96 + 0.04),
            nz * size * axisScale[2] * (factor * 0.98 + 0.02)
        );
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    return geometry;
}

// ============ 通用纹理行星创建辅助函数 ============
// config: { texturePath, brightness, atmosphereColor, atmosphereIntensity, atmosphereSize, fresnelColor, fresnelIntensity, shape }
function createTexturedPlanet(size, config) {
    const segments = config.segments || 128;
    const geometry = config.shape === 'irregularRock'
        ? createIrregularRockGeometry(size, config)
        : new THREE.SphereGeometry(size, segments, segments);
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
    if (config.shape !== 'irregularRock' && config.atmosphereColor) {
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
        segments: moonData.segments || 48,
        shape: moonData.shape,
        rockSeed: moonData.rockSeed,
        axisScale: moonData.axisScale
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

    setPlanetInfoDot('oortCloud', { ...data, color: 0xaaddff, texturePath: 'textures/starfield.jpg' });

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
    if (isAnimating) {
        simulationTime += delta;
    }
    const elapsed = simulationTime;
    const frameFactor = delta * 60;

    // 更新控制器
    controls.update();

    // 更新星空
    if (starField && starField.material.uniforms) {
        starField.material.uniforms.time.value = elapsed;
    }

    // 更新太阳
    if (isAnimating && sun) {
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
    if (isAnimating && asteroidBelt && asteroidBelt.material.uniforms) {
        asteroidBelt.material.uniforms.time.value = elapsed;
    }

    // 缓慢旋转柯伊伯带
    if (isAnimating && kuiperBelt) {
        kuiperBelt.rotation.y += 0.0001;
    }

    // 更新奥尔特云
    updateOortCloudVisibility();
    if (isAnimating && oortCloudInner) {
        oortCloudInner.rotation.y += 0.00005;
    }
    if (isAnimating && oortCloudOuter && oortCloudOuter.material.uniforms) {
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
    // 点击星球体不再触发聚焦，改用底部 dock 栏选择行星
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
    const data = planetData[name];
    const isMoon = !data;

    const targetMesh = getTargetMesh(name);
    if (isMoon && !targetMesh) return;

    selectedPlanet = name;
    hideSatelliteStrip();

    if (!data && targetMesh) {
        const moonData = targetMesh.userData || {};
        const parentPlanet = moonData.parentPlanet && planetData[moonData.parentPlanet]
            ? planetData[moonData.parentPlanet].nameCN
            : '';

        document.getElementById('planetName').textContent = moonData.nameCN || name;
        document.getElementById('planetType').textContent = parentPlanet ? `${parentPlanet}卫星` : '天然卫星';
        document.getElementById('planetDiameter').textContent = moonData.diameter ? formatNumber(moonData.diameter) + ' km' : '-';
        document.getElementById('planetDistance').textContent = parentPlanet ? `围绕${parentPlanet}轨道运行` : '-';
        document.getElementById('planetOrbitPeriod').textContent = moonData.orbitPeriod ? formatOrbitPeriod(moonData.orbitPeriod) : '-';
        document.getElementById('planetRelativeSize').textContent = moonData.diameter ? `${(moonData.diameter / 12742).toFixed(3)} 倍地球直径` : '-';
        document.getElementById('planetDescription').textContent = moonData.desc || '-';

        const moonsDiv = document.getElementById('planetMoons');
        moonsDiv.style.display = 'none';

        const exploreBtn = document.getElementById('exploreBtn');
        exploreBtn.classList.remove('visible');

        updatePlanetVideoCard(name);
        setPlanetInfoDot(name, moonData);

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

        const targetPosition = new THREE.Vector3();
        targetMesh.getWorldPosition(targetPosition);

        const targetSize = targetMesh.userData?.size || 1;
        const distance = name === 'sun' ? 80 : targetSize * 8;
        const cameraTarget = new THREE.Vector3(
            targetPosition.x + distance,
            targetPosition.y + distance * 0.5,
            targetPosition.z + distance
        );

        animateCamera(cameraTarget, targetPosition);
        return;
    }

    // 奥尔特云特殊处理
    if (name === 'oortCloud') {
        flyToOortCloud();
        return;
    }

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

    // 设置纹理图标
    setPlanetInfoDot(name, data);

    // 更新视频卡片
    updatePlanetVideoCard(name);

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

    // 移动相机到目标天体
    if (targetMesh) {
        const targetPosition = new THREE.Vector3();
        targetMesh.getWorldPosition(targetPosition);

        const targetSize = targetMesh.userData?.size || 1;
        const distance = name === 'sun' ? 80 : targetSize * 8;
        const cameraTarget = new THREE.Vector3(
            targetPosition.x + distance,
            targetPosition.y + distance * 0.5,
            targetPosition.z + distance
        );

        animateCamera(cameraTarget, targetPosition);
    }
}

function renderSatelliteDock() {
    const track = document.getElementById('satelliteStripTrack');
    if (!track) return;

    track.innerHTML = satelliteDockItems.map(item => {
        const baseColor = toRgba(item.accent, 0.34);
        const softGlow = toRgba(item.accent, 0.16);
        const rimGlow = toRgba(item.accent, 0.7);
        const texture = item.texture ? `url('${item.texture}')` : 'none';

        return `
            <div class="planet-dot satellite-dot" data-planet="${item.key}" data-name="${item.nameCN}" style="--satellite-base:${baseColor}; --satellite-soft:${softGlow}; --satellite-rim:${rimGlow}; --satellite-texture:${texture};">
                <span class="satellite-dot-label">${item.nameShort}</span>
            </div>
        `;
    }).join('');
}

function getTargetMesh(planetOrMoonKey) {
    const planetMesh = planets[planetOrMoonKey];
    if (planetMesh) return planetMesh;

    const targetMoonName = moonKeyToName[planetOrMoonKey];
    if (!targetMoonName) return null;

    for (const moonList of Object.values(moons)) {
        for (const moonMesh of moonList) {
            if (moonMesh && moonMesh.name === targetMoonName) {
                return moonMesh;
            }
        }
    }
    return null;
}

function toRgba(hexColor, alpha = 1) {
    let value = hexColor;

    if (typeof hexColor === 'string') {
        value = parseInt(hexColor.replace('#', ''), 16);
    }

    if (!Number.isFinite(value)) {
        value = 0x8fbcff;
    }

    const safeValue = value & 0xffffff;
    const r = (safeValue >> 16) & 0xff;
    const g = (safeValue >> 8) & 0xff;
    const b = safeValue & 0xff;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getBodyTexturePath(key, bodyData = {}) {
    if (bodyData.texturePath) return bodyData.texturePath;

    const satelliteItem = satelliteDockItems.find(item => item.key === key);
    return satelliteItem?.texture || solarGuideTextureMap[key] || null;
}

function setPlanetInfoDot(key, bodyData = {}) {
    const colorDot = document.getElementById('planetColorDot');
    if (!colorDot) return;

    const color = bodyData.color || 0x99ccff;
    const colorHex = `#${color.toString(16).padStart(6, '0')}`;
    const texturePath = getBodyTexturePath(key, bodyData);

    colorDot.style.color = colorHex;
    colorDot.style.boxShadow = `0 0 20px ${colorHex}`;
    colorDot.style.backgroundColor = colorHex;

    if (texturePath) {
        colorDot.style.backgroundImage = `radial-gradient(circle at 30% 24%, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.03) 24%, rgba(0, 0, 0, 0.2) 72%), url('${texturePath}')`;
        colorDot.style.backgroundSize = '100% 100%, cover';
        colorDot.style.backgroundPosition = 'center, center';
        colorDot.style.backgroundRepeat = 'no-repeat, no-repeat';
        colorDot.style.filter = 'saturate(1.18) contrast(1.08) brightness(1.02)';
    } else {
        colorDot.style.backgroundImage = '';
        colorDot.style.backgroundSize = '';
        colorDot.style.backgroundPosition = '';
        colorDot.style.backgroundRepeat = '';
        colorDot.style.filter = '';
    }
}

function showSatelliteStrip() {
    const strip = document.getElementById('satelliteStrip');
    const hub = document.querySelector('.planet-dot[data-planet="satelliteHub"]');

    if (!strip) return;
    strip.classList.add('visible');
    isSatelliteStripOpen = true;
    if (hub) {
        hub.classList.add('active');
    }
}

function hideSatelliteStrip() {
    const strip = document.getElementById('satelliteStrip');
    const hub = document.querySelector('.planet-dot[data-planet="satelliteHub"]');

    if (!strip) return;
    strip.classList.remove('visible');
    isSatelliteStripOpen = false;
    if (hub) {
        hub.classList.remove('active');
    }
}

function toggleSatelliteStrip() {
    if (isSatelliteStripOpen) {
        hideSatelliteStrip();
        return;
    }
    showSatelliteStrip();
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
    generateSizeComparison(currentComparisonTab);
    panel.scrollTop = 0;
}

function closeSizeComparisonPanel() {
    cancelDragVolumeAnimation();
    runActiveDragCleanup();
    if (Drag3DScene && Drag3DScene.isReady) {
        Drag3DScene.stop();
        Drag3DScene.destroy();
    }
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
        pauseSolarGuideVideo();
        panel.classList.remove('visible');
    }
}

function requireSpaceEnergyGate(gateId, onPass) {
    if (window.LearningGate && typeof window.LearningGate.require === 'function') {
        window.LearningGate.require({
            gateId,
            planId: 'space-energy-math-10',
            onPass
        });
        return;
    }

    onPass();
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
        requireSpaceEnergyGate('solar-size-comparison', openSizeComparisonPanel);
    });

    document.getElementById('closeSizeComparison').addEventListener('click', function () {
        closeSizeComparisonPanel();
    });

    // 重置视角
    document.getElementById('resetView').addEventListener('click', function () {
        const targetPosition = new THREE.Vector3(150, 100, 250);
        const targetLookAt = new THREE.Vector3(0, 0, 0);
        animateCamera(targetPosition, targetLookAt);
        document.getElementById('planetInfo').classList.remove('visible', 'expanded');
        hideSatelliteStrip();
        document.querySelectorAll('.planet-dot').forEach(dot => dot.classList.remove('active'));
    });

    // 关闭行星信息面板
    document.getElementById('closePlanetInfo').addEventListener('click', function () {
        document.getElementById('planetInfo').classList.remove('visible', 'expanded');
        hideSatelliteStrip();
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

    // 暂停 / 恢复所有天体运动
    const toggleMotionPauseBtn = document.getElementById('toggleMotionPause');
    if (toggleMotionPauseBtn) {
        toggleMotionPauseBtn.addEventListener('click', function () {
            isAnimating = !isAnimating;
            updateMotionPauseButton();
            updateModeIndicator();
        });
        updateMotionPauseButton();
    }

    // 卫星分组行
    renderSatelliteDock();

    // 行星选择器
    document.querySelectorAll('.planet-dot').forEach(dot => {
        dot.addEventListener('click', function () {
            const target = this.dataset.planet;
            if (target === 'satelliteHub') {
                toggleSatelliteStrip();
                return;
            }
            if (!target) return;
            hideSatelliteStrip();
            selectPlanet(target);
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
            hideSatelliteStrip();
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
                <article class="planet-guide-video-card" id="solarGuideVideoCard">
                    <video class="planet-guide-video" id="solarGuideVideo" src="${SOLAR_GUIDE_VIDEO_PATH}" preload="metadata" playsinline></video>
                    <div class="planet-guide-video-shade" aria-hidden="true"></div>
                    <button class="planet-guide-video-play" id="solarGuideVideoPlay" type="button" aria-label="播放太阳系全景视频">
                        <span class="play-icon">▶</span>
                        <span>播放</span>
                    </button>
                    <div class="planet-guide-video-caption">
                        <strong>太阳系全景</strong>
                        <span>Solar System</span>
                    </div>
                </article>
                ${cardsHTML}
            </section>
        </div>
    `;

    setupSolarGuideVideo();
}

function setupSolarGuideVideo() {
    const card = document.getElementById('solarGuideVideoCard');
    const video = document.getElementById('solarGuideVideo');
    const playButton = document.getElementById('solarGuideVideoPlay');
    if (!card || !video || !playButton) return;

    const markPlaying = () => {
        card.classList.add('is-playing');
        video.controls = true;
    };
    const markPaused = () => {
        if (video.paused || video.ended) {
            card.classList.remove('is-playing');
        }
    };

    playButton.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        markPlaying();
        video.play().catch(() => {
            card.classList.remove('is-playing');
            video.controls = true;
        });
    });

    card.addEventListener('click', event => {
        if (event.target === playButton || playButton.contains(event.target) || event.target === video) return;
        if (video.paused) {
            markPlaying();
            video.play().catch(() => {
                card.classList.remove('is-playing');
                video.controls = true;
            });
        }
    });

    video.addEventListener('play', markPlaying);
    video.addEventListener('pause', markPaused);
    video.addEventListener('ended', markPaused);
}

function pauseSolarGuideVideo() {
    const card = document.getElementById('solarGuideVideoCard');
    const video = document.getElementById('solarGuideVideo');
    if (!video) return;

    video.pause();
    if (card) {
        card.classList.remove('is-playing');
    }
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
    if (!isAnimating) {
        labels.push('暂停中');
    }

    scaleValue.textContent = labels.join(' + ');
}

function updateMotionPauseButton() {
    const btn = document.getElementById('toggleMotionPause');
    if (!btn) return;

    const isPaused = !isAnimating;
    const icon = btn.querySelector('.icon');
    const label = btn.querySelector('.label');

    btn.classList.toggle('active', isPaused);
    btn.setAttribute('aria-pressed', String(isPaused));
    btn.title = isPaused ? '恢复所有天体转动' : '暂停所有天体转动';

    if (icon) {
        icon.textContent = isPaused ? '▶' : '⏸';
    }
    if (label) {
        label.textContent = isPaused ? '继续转动' : '暂停转动';
    }
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
const CAPACITY_TARGETS = {
    uyScuti: {
        key: 'uyScuti',
        nameCN: '盾牌座UY',
        texture: STAR_SURFACE_TEXTURES.uyScuti,
        color: '#b93426',
        objectKeys: getCapacityObjectKeys('uyScuti')
    },
    vyCanisMajoris: {
        key: 'vyCanisMajoris',
        nameCN: '大犬座VY',
        texture: STAR_SURFACE_TEXTURES.vyCanisMajoris,
        color: '#d94a2b',
        objectKeys: getCapacityObjectKeys('vyCanisMajoris')
    },
    betelgeuse: {
        key: 'betelgeuse',
        nameCN: '参宿四',
        texture: STAR_SURFACE_TEXTURES.betelgeuse,
        color: '#ff6d3a',
        objectKeys: getCapacityObjectKeys('betelgeuse')
    },
    antares: {
        key: 'antares',
        nameCN: '心宿二',
        texture: STAR_SURFACE_TEXTURES.antares,
        color: '#ff5c34',
        objectKeys: getCapacityObjectKeys('antares')
    },
    arcturus: {
        key: 'arcturus',
        nameCN: '大角星',
        texture: STAR_SURFACE_TEXTURES.arcturus,
        color: '#ff8f45',
        objectKeys: getCapacityObjectKeys('arcturus')
    },
    betaCentauri: {
        key: 'betaCentauri',
        nameCN: '半人马座β星',
        texture: STAR_SURFACE_TEXTURES.betaCentauri,
        color: '#bfdcff',
        objectKeys: getCapacityObjectKeys('betaCentauri')
    },
    sirius: {
        key: 'sirius',
        nameCN: '天狼星',
        texture: STAR_SURFACE_TEXTURES.sirius,
        color: '#bfdcff',
        objectKeys: getCapacityObjectKeys('sirius')
    },
    alphaCentauri: {
        key: 'alphaCentauri',
        nameCN: '半人马座α星',
        texture: STAR_SURFACE_TEXTURES.alphaCentauri,
        color: '#ffd56b',
        objectKeys: getCapacityObjectKeys('alphaCentauri')
    },
    sun: {
        key: 'sun',
        nameCN: '太阳',
        texture: 'textures/sun.jpg',
        color: '#ffcc00',
        objectKeys: getCapacityObjectKeys('sun')
    },
    jupiter: {
        key: 'jupiter',
        nameCN: '木星',
        texture: 'textures/jupiter.jpg',
        color: '#d8ca9d',
        objectKeys: getCapacityObjectKeys('jupiter')
    },
    saturn: {
        key: 'saturn',
        nameCN: '土星',
        texture: 'textures/saturn.jpg',
        color: '#ead6b8',
        objectKeys: getCapacityObjectKeys('saturn')
    },
    uranus: {
        key: 'uranus',
        nameCN: '天王星',
        texture: 'textures/uranus.jpg',
        color: '#7de8d5',
        objectKeys: getCapacityObjectKeys('uranus')
    },
    neptune: {
        key: 'neptune',
        nameCN: '海王星',
        texture: 'textures/neptune.jpg',
        color: '#5b5ddf',
        objectKeys: getCapacityObjectKeys('neptune')
    },
    earth: {
        key: 'earth',
        nameCN: '地球',
        texture: 'textures/earth_daymap.jpg',
        color: '#6b93d6',
        objectKeys: getCapacityObjectKeys('earth')
    },
    venus: {
        key: 'venus',
        nameCN: '金星',
        texture: 'textures/venus_atmosphere.jpg',
        color: '#e6c87a',
        objectKeys: getCapacityObjectKeys('venus')
    },
    mars: {
        key: 'mars',
        nameCN: '火星',
        texture: 'textures/mars.jpg',
        color: '#c1440e',
        objectKeys: getCapacityObjectKeys('mars')
    },
    blackHole: {
        key: 'blackHole',
        nameCN: '黑洞（事件视界）',
        color: '#fff3cf',
        objectKeys: getCapacityObjectKeys('blackHole')
    },
    blackHoleEventHorizon: {
        key: 'blackHoleEventHorizon',
        nameCN: '黑洞（事件视界）',
        color: '#fff3cf',
        objectKeys: getCapacityObjectKeys('blackHoleEventHorizon')
    },
    blackHoleGravitationalRadius: {
        key: 'blackHoleGravitationalRadius',
        nameCN: '黑洞（引力影响区）',
        color: '#ffd59a',
        objectKeys: getCapacityObjectKeys('blackHoleGravitationalRadius')
    },
    proximaCentauri: {
        key: 'proximaCentauri',
        nameCN: '比邻星',
        color: '#d94d34',
        objectKeys: getCapacityObjectKeys('proximaCentauri')
    }
};

const PROXIMA_CAPACITY_TARGETS = new Set([
    'sun',
    'blackHole',
    'blackHoleEventHorizon',
    'blackHoleGravitationalRadius'
]);

const CAPACITY_COUNT_OVERRIDES = {
    // 太阳能装采用 sun_vol_vs_mass.html 中的教学数据；其他目标缺失时继续按公式计算。
    sun: {
        diameter: {
            jupiter: { count: 1000 },
            saturn: { count: 1700 },
            uranus: { count: 20000 },
            neptune: { count: 22000 },
            earth: { count: 1300000 },
            venus: { count: 1500000 },
            mars: { count: 8600000 }
        },
        mass: {
            jupiter: { count: 1048 },
            saturn: { count: 3500 },
            uranus: { count: 22900 },
            neptune: { count: 19400 },
            earth: { count: 333000 },
            venus: { count: 409000 },
            mars: { count: 3112000 },
            ganymede: { count: 13420000 },
            mercury: { count: 6025000 },
            moon: { count: 27090000 },
            eris: { count: 119800000 },
            pluto: { count: 152700000 },
            haumea: { count: 496500000 },
            makemake: { count: 641600000 },
            ceres: { count: 2118000000 }
        }
    }
};

function getCapacityTargetValue(targetKey, metric) {
    if (BLACK_HOLE_TARGET_KEYS.includes(targetKey) || targetKey === 'blackHole') {
        if (metric === 'mass') return planetData.sun.mass * BLACK_HOLE_MASS_IN_SOLAR_MASSES;
        const radiusKm = targetKey === 'blackHoleGravitationalRadius'
            ? BLACK_HOLE_GRAVITY_RADIUS_KM
            : BLACK_HOLE_EVENT_HORIZON_RADIUS_KM;
        return radiusKm * 2;
    }
    const target = planetData[targetKey];
    return metric === 'mass' ? target.mass : target.diameter;
}

function getCapacityCountOverride(targetKey, objectKey, metric = currentComparisonMetric) {
    return CAPACITY_COUNT_OVERRIDES[targetKey]?.[metric]?.[objectKey] || null;
}

function getCapacityCount(targetKey, objectKey, metric = currentComparisonMetric) {
    const override = getCapacityCountOverride(targetKey, objectKey, metric);
    if (override) return override.count;

    const targetValue = getCapacityTargetValue(targetKey, metric);
    const objectValue = metric === 'mass' ? planetData[objectKey].mass : planetData[objectKey].diameter;
    if (!targetValue || !objectValue) return 0;
    if (metric === 'mass') return targetValue / objectValue;
    if (metric === 'width') return targetValue / objectValue;
    return Math.pow(targetValue / objectValue, 3);
}

function isBlackHoleTargetType(targetKey) {
    return targetKey === 'blackHole' || BLACK_HOLE_TARGET_KEYS.includes(targetKey);
}

function isBlackHoleCapacityParent(targetKey) {
    return targetKey === 'blackHole' || isBlackHoleTargetType(targetKey);
}

function isDragBlackHoleCapacityParent(targetKey) {
    return targetKey === 'dragBlackHole' || targetKey === 'dragBlackHoleEventHorizon' || targetKey === 'dragBlackHoleGravitationalRadius';
}

function getBlackHoleScopeFromView(targetView, fallback = 'blackHoleEventHorizon') {
    return targetView === 'blackHoleGravitationalRadius' || targetView === 'dragBlackHoleGravitationalRadius'
        ? 'blackHoleGravitationalRadius'
        : fallback;
}

function getBlackHoleScopeLabel(targetKey) {
    if (targetKey === 'blackHoleGravitationalRadius') return BLACK_HOLE_SCOPE_LABELS.blackHoleGravitationalRadius;
    return BLACK_HOLE_SCOPE_LABELS.blackHoleEventHorizon;
}

function getBlackHoleScopeRadius(targetKey) {
    return targetKey === 'blackHoleGravitationalRadius'
        ? BLACK_HOLE_GRAVITY_RADIUS_KM
        : BLACK_HOLE_EVENT_HORIZON_RADIUS_KM;
}

function getCapacityData(targetKey) {
    const target = CAPACITY_TARGETS[targetKey];
    const objectKeys = target.objectKeys.slice();
    if (PROXIMA_CAPACITY_TARGETS.has(targetKey)) {
        objectKeys.push('proximaCentauri');
    }
    return uniqueComparisonKeys(objectKeys)
        .map(key => {
            const data = planetData[key];
            const count = getCapacityCount(targetKey, key);
            const override = getCapacityCountOverride(targetKey, key);
            return {
                key,
                nameCN: data.nameCN,
                count,
                label: override?.label || formatCapacityLabel(count),
                color: '#' + data.color.toString(16).padStart(6, '0')
            };
        })
        .filter(item => Number.isFinite(item.count) && item.count >= 1)
        .sort((a, b) => a.count - b.count);
}

function getCurrentCapacitySelection(targetKey) {
    return currentCapacitySelections[targetKey] || currentCapacitySelections.sun;
}

function setCurrentCapacitySelection(targetKey, value) {
    currentCapacitySelections[targetKey] = value;
}

function getCapacitySubtitle(targetKey) {
    const target = CAPACITY_TARGETS[targetKey];
    if (isBlackHoleTargetType(targetKey)) {
        const scopeLabel = getBlackHoleScopeLabel(targetKey);
        return currentComparisonMetric === 'mass'
            ? `按质量测算，银河系中心黑洞 Sgr A* 约为太阳质量的${formatCompactCount(BLACK_HOLE_MASS_IN_SOLAR_MASSES)}倍`
            : currentComparisonMetric === 'width'
                ? `按宽度测算，银河系中心黑洞 Sgr A* 的${scopeLabel}直径约等于太阳直径的${formatCapacityLabel(getCapacityCount(targetKey, 'sun'))}倍`
                : `按${scopeLabel}体积估算，银河系中心黑洞 Sgr A* 的${scopeLabel}半径约 ${formatNumber(getBlackHoleScopeRadius(targetKey))} 公里`;
    }

    const earthCount = getCapacityCount(targetKey, 'earth');
    const earthOverride = getCapacityCountOverride(targetKey, 'earth');
    const metricText = currentComparisonMetric === 'mass'
        ? '按质量测算'
        : currentComparisonMetric === 'width'
            ? '按宽度测算'
            : '按直径折算体积';
    if (targetKey === 'earth') {
        return `${metricText}，地球是当前目标，下面只展示比地球更小的天体`;
    }
    return `${metricText}，${target.nameCN}约为地球的${earthOverride?.label || formatCapacityLabel(earthCount)}倍`;
}

function getCapacityTargetDisplayName(targetKey) {
    return isBlackHoleTargetType(targetKey) ? '黑洞' : (CAPACITY_TARGETS[targetKey]?.nameCN || '');
}

function getCapacityUnitText(targetKey, selected) {
    const targetName = getCapacityTargetDisplayName(targetKey);
    if (currentComparisonMetric === 'mass') {
        return `${targetName}质量约等于${selected.label}个${selected.nameCN}`;
    }
    if (currentComparisonMetric === 'width') {
        return `${targetName}直径约等于${selected.label}个${selected.nameCN}横向排起来`;
    }
    return `${selected.label}个${selected.nameCN}才能填满${targetName}`;
}

function getCapacityNote(targetKey) {
    if (isBlackHoleTargetType(targetKey)) {
        const scopeLabel = getBlackHoleScopeLabel(targetKey);
        if (currentComparisonMetric === 'mass') {
            return `按质量估算：Sgr A* 约为太阳质量的${formatCompactCount(BLACK_HOLE_MASS_IN_SOLAR_MASSES)}倍，数量 = 黑洞质量 / 天体质量。`;
        }
        if (currentComparisonMetric === 'width') {
            return `按宽度估算：数量 = ${scopeLabel}直径 / 天体直径，表示把这些天体横向排起来大约能排多少个。`;
        }
        return `按${scopeLabel}估算：能装数量 ≈ (${scopeLabel}半径 / 天体半径)³，数值会比较大，仅用于量级理解。`;
    }

    const targetBody = planetData[targetKey];
    if (targetBody?.category === 'star' && targetKey !== 'sun') {
        const solarDiameterRatio = targetBody.diameter / planetData.sun.diameter;
        const solarMassRatio = targetBody.mass / planetData.sun.mass;
        if (currentComparisonMetric === 'mass') {
            return `按质量测算：${targetBody.nameCN}质量约为太阳的 ${solarMassRatio.toFixed(solarMassRatio < 1 ? 4 : 1)} 倍，数量 = 恒星质量 / 天体质量。`;
        }
        if (currentComparisonMetric === 'width') {
            return `按宽度测算：${targetBody.nameCN}直径约 ${formatNumber(targetBody.diameter)} 公里，数量 = 恒星直径 / 天体直径。`;
        }
        return `${targetBody.nameCN}按直径约 ${solarDiameterRatio.toFixed(solarDiameterRatio < 1 ? 4 : 1)} 个太阳折算，数量 ≈ (恒星直径 / 天体直径)³。`;
    }

    if (currentComparisonMetric === 'width') {
        return '当前页签使用直径相除，数量 = 目标直径 / 天体直径，表示横向排起来大约能排多少个。';
    }

    if (targetKey === 'sun' && currentComparisonMetric !== 'mass') {
        return '这里使用适合小朋友记忆的近似体积数字；比邻星按半径 0.1542 R☉ 折算，直径约 214,754 公里。';
    }

    return currentComparisonMetric === 'mass'
        ? '当前页签使用质量相除，只展示至少能等于 1 个的天体。'
        : '当前页签按直径折算体积，数量 ≈ (目标直径 / 天体直径)³，只展示至少能装下 1 个的天体。';
}

function getTargetCircleStyle(targetKey, size = 180) {
    const target = CAPACITY_TARGETS[targetKey];
    if (isBlackHoleTargetType(targetKey) || targetKey === 'sun') {
        return `width:${size}px; height:${size}px;`;
    }
    return `
        width:${size}px; height:${size}px;
        background: url('${target.texture}') center/cover;
        box-shadow: 0 0 50px ${target.color}80, 0 0 100px ${target.color}40;
    `;
}

function renderCapacityComparison(container, subtitle, targetKey) {
    // 所有 target（含黑洞）都走二合一拖入式布局：左拖入容器 + 中 tray + 右 bar chart
    cancelDragVolumeAnimation();
    return renderDragCapacityComparison(container, subtitle, targetKey, { includeBarChart: true });
}

function renderCapacityTargetPicker(container) {
    const targetOptions = [
        { key: 'sun', icon: '☀️', name: '太阳' },
        { key: 'jupiter', icon: '🪐', name: '木星' },
        { key: 'saturn', icon: '🪐', name: '土星' },
        { key: 'uranus', icon: '🪐', name: '天王星' },
        { key: 'neptune', icon: '🪐', name: '海王星' },
        { key: 'earth', icon: '🌍', name: '地球' },
        { key: 'venus', icon: '🟡', name: '金星' },
        { key: 'mars', icon: '🔴', name: '火星' },
        { key: 'blackHole', icon: '🕳️', name: '黑洞', isGroup: true },
        { key: 'uyScuti', icon: '⭐', name: '盾牌座UY' },
        { key: 'vyCanisMajoris', icon: '⭐', name: '大犬座VY' },
        { key: 'betelgeuse', icon: '⭐', name: '参宿四' },
        { key: 'antares', icon: '⭐', name: '心宿二' },
        { key: 'arcturus', icon: '⭐', name: '大角星' },
        { key: 'betaCentauri', icon: '⭐', name: '半人马座β星' },
        { key: 'sirius', icon: '⭐', name: '天狼星' },
        { key: 'alphaCentauri', icon: '⭐', name: '半人马座α星' },
        { key: 'proximaCentauri', icon: '⭐', name: '比邻星' }
    ];
    const suffix = currentComparisonMetric === 'width'
        ? '宽度'
        : currentComparisonMetric === 'mass'
            ? '质量'
            : '能装';

    const picker = document.createElement('div');
    picker.className = 'capacity-target-picker';
    targetOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.type = 'button';
        const isActive = option.key === 'blackHole'
            ? isBlackHoleCapacityParent(currentCapacityView)
            : option.key === 'dragBlackHole'
                ? isDragBlackHoleCapacityParent(currentCapacityView)
                : option.key === currentCapacityView;
        btn.className = `capacity-target-btn${isActive ? ' active' : ''}`;
        btn.dataset.capacityView = option.key;
        const targetLabel = option.key === 'blackHole'
            ? `${option.name}${suffix}`
            : option.isAction || option.isGroup
                ? option.name
                : `${option.name}${suffix}`;
        btn.textContent = `${option.icon} ${targetLabel}`;
        btn.addEventListener('click', () => {
            if (option.key === 'blackHole') {
                currentCapacityView = 'blackHole';
                currentBlackHoleScope = getBlackHoleScopeFromView(currentCapacityView, currentBlackHoleScope);
            } else if (option.key === 'dragBlackHole') {
                currentCapacityView = 'dragBlackHole';
                currentDragBlackHoleScope = getBlackHoleScopeFromView(currentCapacityView, currentDragBlackHoleScope);
            } else {
                currentCapacityView = option.key;
            }
            generateSizeComparison(currentComparisonTab);
        });
        picker.appendChild(btn);
    });
    container.appendChild(picker);
}

function renderBlackHoleScopePicker(container, mode = 'capacity', options = {}) {
    const scopePicker = document.createElement('div');
    scopePicker.className = options.pickerClass || 'capacity-target-picker';
    const scopeLabelSuffix = options.labelSuffix || '';
    if (mode === 'diameter') {
        scopePicker.style.margin = options.noNegativeMargin ? '0 auto 10px' : '-2px auto 10px';
    } else {
        scopePicker.style.margin = '-4px auto 12px';
    }
    if (options.scopesWidthFull) {
        scopePicker.style.width = '100%';
        scopePicker.style.justifyContent = 'center';
    }

    const currentScope = mode === 'drag' ? currentDragBlackHoleScope : currentBlackHoleScope;
    BLACK_HOLE_SCOPE_OPTIONS.forEach(option => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `capacity-target-btn${option.key === currentScope ? ' active' : ''}`;
        btn.dataset.blackHoleScope = option.key;
        btn.textContent = `${option.label}${scopeLabelSuffix}`;
        btn.addEventListener('click', () => {
            if (mode === 'drag') {
                currentDragBlackHoleScope = option.key;
            } else {
                currentBlackHoleScope = option.key;
            }
            generateSizeComparison(currentComparisonTab);
        });
        scopePicker.appendChild(btn);
    });
    container.appendChild(scopePicker);
}

function renderCapacityMode(container, subtitle) {
    renderCapacityTargetPicker(container);
    if (isDragBlackHoleCapacityParent(currentCapacityView)) {
        currentDragBlackHoleScope = getBlackHoleScopeFromView(currentCapacityView, currentDragBlackHoleScope);
        renderBlackHoleScopePicker(container, 'drag');
        cancelDragVolumeAnimation();
        generateDragBlackHoleComparison(container, subtitle, currentDragBlackHoleScope);
        return;
    }
    if (currentCapacityView === 'dragVolume') {
        cancelDragVolumeAnimation();
        generateDragVolumeComparison(container, subtitle);
        return;
    }
    if (isBlackHoleCapacityParent(currentCapacityView)) {
        currentBlackHoleScope = getBlackHoleScopeFromView(currentCapacityView, currentBlackHoleScope);
        renderBlackHoleScopePicker(container);
        renderCapacityComparison(container, subtitle, currentBlackHoleScope);
        return;
    }
    renderCapacityComparison(container, subtitle, currentCapacityView);
}

function renderDragCapacityComparison(container, subtitle, targetKey, options = {}) {
    const target = CAPACITY_TARGETS[targetKey];
    const isBlackHole = isBlackHoleTargetType(targetKey);
    const blackHoleScopeLabel = isBlackHole ? getBlackHoleScopeLabel(targetKey) : '';
    const capacityData = getCapacityData(targetKey);
    const targetDisplayName = isBlackHole ? '黑洞' : target.nameCN;
    const includeBarChart = !!options.includeBarChart;
    const isStellarTarget = !isBlackHole && planetData[targetKey]?.category === 'star';

    subtitle.textContent = currentComparisonMetric === 'mass'
        ? `拖拽天体放入${targetDisplayName}，按质量看看相当于多少个`
        : currentComparisonMetric === 'width'
            ? `拖拽天体放入${targetDisplayName}，按宽度看看横向约等于多少个`
            : `拖拽天体放入${targetDisplayName}，按直径折算体积看看能装多少个`;

    const wrapper = document.createElement('div');
    wrapper.className = `drag-volume-container${isBlackHole ? ' black-hole-drag' : ''}${includeBarChart ? ' drag-volume-container--with-bars' : ''}`;

    // 装入球放大让纹理细节更清晰；ghost 也按比例放大
    const canvasSize = isBlackHole ? 480 : 460;
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

    // 初始选中天体（沿用 currentCapacitySelections，方便切换 tab 时记忆）
    const selectedKey = getCurrentCapacitySelection(targetKey);
    let initialSelected = capacityData.find(d => d.key === selectedKey)
        || capacityData.find(d => d.key === 'jupiter')
        || capacityData.find(d => d.key === 'earth')
        || capacityData[0];
    if (initialSelected) setCurrentCapacitySelection(targetKey, initialSelected.key);

    const targetDiameter = getCapacityTargetValue(targetKey, 'diameter');
    function computePlanetRefSize(item) {
        const pData = planetData[item.key];
        return Math.max(3, Math.min(80, (pData.diameter / targetDiameter) * 80));
    }

    let barChartHTML = '';
    if (includeBarChart) {
        const logs = capacityData.map(item => Math.log10(Math.max(item.count, 0.000001)));
        const minLog = Math.min(...logs);
        const maxLog = Math.max(...logs);
        let barInnerHTML = '<div class="volume-bar-chart">';
        capacityData.forEach(item => {
            const isActive = initialSelected && item.key === initialSelected.key;
            const logVal = Math.log10(Math.max(item.count, 0.000001));
            const percent = maxLog === minLog ? 100 : 10 + ((logVal - minLog) / (maxLog - minLog)) * 90;
            barInnerHTML += `
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
        barInnerHTML += '</div>';

        // 底部"目标 vs 选中天体"按真实直径比例的对比小图
        const targetRefClass = isBlackHole
            ? 'black-hole-ref'
            : targetKey === 'proximaCentauri'
                ? 'proxima-ref'
                : 'sun-ref';
        const refStyle = !isBlackHole && targetKey !== 'sun' && targetKey !== 'proximaCentauri' && target.texture
            ? `background: url('${target.texture}') center/cover; box-shadow: 0 0 25px ${target.color}66;`
            : '';
        const initialPlanetSize = initialSelected ? computePlanetRefSize(initialSelected) : 4;
        const initialPlanetColor = initialSelected ? initialSelected.color : '#888';
        const initialPlanetName = initialSelected ? initialSelected.nameCN : '';
        const sizeCompareHTML = `
            <div class="drag-size-compare">
                <div class="volume-size-compare">
                    <div class="${targetRefClass}" style="${refStyle}"></div>
                    <div class="planet-ref" data-planet-ref style="width:${initialPlanetSize}px; height:${initialPlanetSize}px; background:${initialPlanetColor}; box-shadow: 0 0 6px ${initialPlanetColor};"></div>
                </div>
                <div class="volume-compare-labels">
                    <span>${targetDisplayName}</span>
                    <span data-planet-ref-label>${initialPlanetName}</span>
                </div>
            </div>
        `;
        barChartHTML = `<div class="drag-bar-chart-side">${barInnerHTML}${sizeCompareHTML}</div>`;
    }

    const realisticLabel = isBlackHole
        ? '🌑 还原黑洞'
        : isStellarTarget
            ? `⭐ 还原${target.nameCN}`
            : '☀️ 还原太阳';
    const initialToggleLabel = isGlassDragMode() ? realisticLabel : '🪟 切换为玻璃球';
    const initial3DLabel = isDrag3DMode() ? '🟢 切回 2D' : '🎲 切换 3D';
    const mainAreaClass = `drag-main-area${includeBarChart ? ' drag-main-area--with-bars' : ''}`;

    wrapper.innerHTML = `
        <div class="drag-instruction">👆 拖拽天体放入${target.nameCN}，看它${currentComparisonMetric === 'mass' ? '质量相当于多少个' : currentComparisonMetric === 'width' ? '横向约等于多少个' : '能装多少个'}！</div>
        <div class="black-hole-note">${getCapacityNote(targetKey)}</div>
        <div class="${mainAreaClass}">
            <div class="drag-sun-area" style="width:${canvasSize}px; height:${canvasSize}px;">
                <button class="drag-style-toggle" type="button" aria-pressed="${isGlassDragMode()}">${initialToggleLabel}</button>
                <button class="drag-3d-toggle" type="button" aria-pressed="${isDrag3DMode()}">${initial3DLabel}</button>
                <canvas class="drag-sun-canvas" width="${canvasSize * dpr}" height="${canvasSize * dpr}" style="width:${canvasSize}px; height:${canvasSize}px; position:absolute; top:0; left:0; ${isDrag3DMode() ? 'display:none;' : ''}"></canvas>
                <canvas class="drag-sun-canvas-3d" width="${canvasSize * dpr}" height="${canvasSize * dpr}" style="width:${canvasSize}px; height:${canvasSize}px; ${isDrag3DMode() ? '' : 'display:none;'}"></canvas>
            </div>
            <div class="drag-planet-tray">${trayHTML}</div>
            ${barChartHTML}
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

    // 切换选中天体：高亮 bar 行 + tray 卡片 + 更新底部 vs 对比小图
    function applySelected(itemKey) {
        const item = capacityData.find(d => d.key === itemKey);
        if (!item) return;
        setCurrentCapacitySelection(targetKey, itemKey);
        wrapper.querySelectorAll('.drag-bar-chart-side .volume-bar-row.active').forEach(el => el.classList.remove('active'));
        const row = wrapper.querySelector(`.drag-bar-chart-side .volume-bar-row[data-capacity-planet="${itemKey}"]`);
        if (row) row.classList.add('active');
        wrapper.querySelectorAll('.drag-planet-item.active').forEach(el => el.classList.remove('active'));
        const trayItem = wrapper.querySelector(`.drag-planet-item[data-drag-key="${itemKey}"]`);
        if (trayItem) trayItem.classList.add('active');
        const planetRef = wrapper.querySelector('[data-planet-ref]');
        const planetRefLabel = wrapper.querySelector('[data-planet-ref-label]');
        if (planetRef) {
            const sz = computePlanetRefSize(item);
            planetRef.style.width = sz + 'px';
            planetRef.style.height = sz + 'px';
            planetRef.style.background = item.color;
            planetRef.style.boxShadow = `0 0 6px ${item.color}`;
        }
        if (planetRefLabel) planetRefLabel.textContent = item.nameCN;
    }

    if (initialSelected) {
        const trayItem = wrapper.querySelector(`.drag-planet-item[data-drag-key="${initialSelected.key}"]`);
        if (trayItem) trayItem.classList.add('active');
    }

    // 让 bar chart 上的某一行也能直接触发"装入"动画（无需拖动）
    if (includeBarChart) {
        wrapper.querySelectorAll('.drag-bar-chart-side .volume-bar-row').forEach(row => {
            row.addEventListener('click', () => {
                const key = row.dataset.capacityPlanet;
                const item = capacityData.find(d => d.key === key);
                if (!item) return;
                applySelected(key);
                cancelDragVolumeAnimation();
                const ctx2 = canvas.getContext('2d');
                ctx2.setTransform(1, 0, 0, 1, 0, 0);
                ctx2.scale(dpr, dpr);
                clearDragResultState();
                const startAnim = isBlackHole ? startBlackHoleFillAnimation : startFillAnimation;
                const animConfig = {
                    resultLabel: currentComparisonMetric === 'mass'
                        ? `${targetDisplayName}质量约等于`
                        : currentComparisonMetric === 'width'
                            ? `${targetDisplayName}宽度约等于`
                            : `${targetDisplayName}能装`,
                    blackHoleScopeLabel: isBlackHole ? blackHoleScopeLabel : '',
                    wrapper,
                    targetKey
                };
                startAnim(ctx2, canvasSize, item, animConfig);
            });
        });
    }

    function drawIdle() {
        if (isBlackHole) {
            drawIdleBlackHole(ctx, canvasSize, 0, true, blackHoleScopeLabel);
            if (!blackHoleTextureImage.complete) {
                blackHoleTextureImage.onload = () => drawIdleBlackHole(ctx, canvasSize, 0, true, blackHoleScopeLabel);
            }
        } else {
            drawIdleContainer(ctx, canvasSize, targetKey, { blackHoleScopeLabel });
        }
    }
    wrapper._dragRedraw = drawIdle;
    drawIdle();

    // 玻璃/原版切换按钮（仅 2D 模式生效；3D 永远是玻璃）
    const toggleBtn = wrapper.querySelector('.drag-style-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (isDrag3DMode()) return; // 3D 模式锁定玻璃
            dragContainerStyle = isGlassDragMode() ? 'realistic' : 'glass';
            toggleBtn.textContent = isGlassDragMode() ? realisticLabel : '🪟 切换为玻璃球';
            toggleBtn.setAttribute('aria-pressed', isGlassDragMode());
            if (typeof wrapper._dragRedraw === 'function') {
                wrapper._dragRedraw();
            }
        });
    }

    // 3D 立体切换按钮
    const canvas3D = wrapper.querySelector('.drag-sun-canvas-3d');
    const toggle3DBtn = wrapper.querySelector('.drag-3d-toggle');

    function syncGlassToggleVisibility() {
        if (toggleBtn) toggleBtn.style.display = isDrag3DMode() ? 'none' : '';
    }

    function activate3DScene(initialItem) {
        if (!canvas3D) return;
        canvas.style.display = 'none';
        canvas3D.style.display = 'block';
        cancelDragVolumeAnimation();
        // 旧 wrapper 上的 3D scene 也得换到当前 canvas
        if (Drag3DScene.isReady && Drag3DScene.canvas !== canvas3D) {
            Drag3DScene.stop();
            Drag3DScene.destroy();
        }
        if (!Drag3DScene.isReady) {
            Drag3DScene.init(canvas3D, canvasSize, dpr);
        }
        Drag3DScene.start();
        // 初始 idle：空玻璃球（3D 永远玻璃外壳）
        const item = initialItem || initialSelected;
        if (item) {
            const visualCount = getVisualParticleCount(item.count);
            const R = 2.4;
            const r0 = compute3DParticleRadius(R, item.count);
            const slots = compute3DParticleSlots(R, r0, visualCount, item.count);
            const finalShown = Math.min(slots.length, visualCount);
            Drag3DScene.setData(item.key, r0, R, slots.slice(0, finalShown), {
                glass: true,
                fallbackColor: item.color
            });
            Drag3DScene.setVisibleCount(0);
        }
        syncGlassToggleVisibility();
    }
    function deactivate3DScene() {
        Drag3DScene.stop();
        Drag3DScene.destroy();
        if (canvas3D) canvas3D.style.display = 'none';
        canvas.style.display = 'block';
        syncGlassToggleVisibility();
        if (typeof wrapper._dragRedraw === 'function') wrapper._dragRedraw();
    }

    syncGlassToggleVisibility();
    if (isDrag3DMode()) {
        // 进入页面时已是 3D 模式（用户上次开启）
        activate3DScene(initialSelected);
    }

    if (toggle3DBtn) {
        toggle3DBtn.addEventListener('click', () => {
            dragRender3D = !dragRender3D;
            toggle3DBtn.textContent = isDrag3DMode() ? '🟢 切回 2D' : '🎲 切换 3D';
            toggle3DBtn.setAttribute('aria-pressed', isDrag3DMode());
            if (isDrag3DMode()) {
                activate3DScene(initialSelected);
            } else {
                deactivate3DScene();
            }
        });
    }
    // 关闭浮层时也销毁 3D，避免泄漏
    wrapper._destroy3D = () => {
        if (Drag3DScene.isReady) {
            Drag3DScene.stop();
            Drag3DScene.destroy();
        }
    };

    setupDragInteraction(wrapper, canvas, canvasSize, dpr, capacityData, {
        startAnimation: isBlackHole ? startBlackHoleFillAnimation : startFillAnimation,
        ghostMaxSize: isBlackHole ? 70 : 64,
        resultLabel: currentComparisonMetric === 'mass'
            ? `${targetDisplayName}质量约等于`
            : currentComparisonMetric === 'width'
                ? `${targetDisplayName}宽度约等于`
                : `${targetDisplayName}能装`,
        blackHoleScopeLabel: isBlackHole ? blackHoleScopeLabel : '',
        wrapper,
        onSelect: includeBarChart ? applySelected : undefined,
        targetKey,
        // 用 .drag-sun-area 元素做拖拽 hit 判定，覆盖 2D/3D 两个 canvas
        getHitElement: () => wrapper.querySelector('.drag-sun-area')
    });
}

// ============ 生成大小对比 ============
function generateSizeComparison(mode) {
    // 切换 tab 时旧 wrapper 会被替换；销毁旧 3D scene 防止持有失效 canvas
    if (Drag3DScene && Drag3DScene.isReady) {
        Drag3DScene.stop();
        Drag3DScene.destroy();
    }
    if (!mode) mode = currentComparisonTab;
    mode = normalizeComparisonMode(mode);
    currentComparisonTab = mode;
    if (mode === 'diameter' || mode === 'mass') {
        currentComparisonMetric = mode;
    } else if (CAPACITY_MODE_METRICS[mode]) {
        currentComparisonMetric = CAPACITY_MODE_METRICS[mode];
    }
    updateComparisonTabActiveState();

    const container = document.getElementById('comparisonRow');
    container.innerHTML = '';
    container.classList.remove('compact-diameter-mode');
    container.classList.remove('compact-mass-mode');
    container.classList.remove('diameter-detail-mode');

    const subtitle = document.getElementById('comparisonSubtitle');

    // 所有“能装 / 拖拽”模式下隐藏类型图例，其他模式显示
    const isVolumeMode = isCapacityComparisonMode(mode);
    const legend = document.querySelector('.planet-types-legend');
    if (legend) legend.style.display = isVolumeMode ? 'none' : 'flex';

    // 直径子标签（小行星/遥远天体对比）只在 diameter 模式下显示
    const detailTabs = document.getElementById('diameterDetailTabs');
    if (detailTabs) {
        if (mode !== 'diameter') {
            detailTabs.style.display = 'none';
            detailTabs.innerHTML = '';
        }
    }

    // 对比换算模式下 planets-row 不需要 flex 横排，改为 block
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
        moon: '🌙 卫星',
        blackHole: '🕳️ 黑洞',
        region: '☁️ 天体云团'
    };

    // 行星纹理贴图映射
    const planetTextures = {
        sun: 'textures/sun.jpg',
        proximaCentauri: STAR_SURFACE_TEXTURES.proximaCentauri,
        alphaCentauri: STAR_SURFACE_TEXTURES.alphaCentauri,
        betaCentauri: STAR_SURFACE_TEXTURES.betaCentauri,
        sirius: STAR_SURFACE_TEXTURES.sirius,
        arcturus: STAR_SURFACE_TEXTURES.arcturus,
        antares: STAR_SURFACE_TEXTURES.antares,
        betelgeuse: STAR_SURFACE_TEXTURES.betelgeuse,
        vyCanisMajoris: STAR_SURFACE_TEXTURES.vyCanisMajoris,
        uyScuti: STAR_SURFACE_TEXTURES.uyScuti,
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
        ganymede: 'textures/ganymede.jpg',
        io: 'textures/io.jpg',
        europa: 'textures/europa.jpg',
        titan: 'textures/titan.jpg',
        rhea: 'textures/rhea.jpg',
        enceladus: 'textures/enceladus.jpg',
        phobos: 'textures/phobos_clean.jpg',
        deimos: 'textures/deimos.jpg',
        triton: 'textures/triton.jpg',
        titania: 'textures/titania.jpg',
        oortCloud: 'textures/starfield.jpg'
    };

    const getDiameterPlanetData = (key) => {
        if (key === DIAMETER_BLACK_HOLE_KEY || key === 'blackHole' || BLACK_HOLE_TARGET_KEYS.includes(key)) {
            const scopeKey = BLACK_HOLE_TARGET_KEYS.includes(key) ? key : currentBlackHoleScope;
            const isGravityScope = scopeKey === 'blackHoleGravitationalRadius';
            const scopeLabel = getBlackHoleScopeLabel(scopeKey);
            return {
                name: '银河系中心黑洞',
                nameCN: '黑洞',
                nameEN: 'Black Hole',
                type: `${scopeLabel}口径`,
                diameter: (isGravityScope ? BLACK_HOLE_GRAVITY_RADIUS_KM : BLACK_HOLE_EVENT_HORIZON_RADIUS_KM) * 2,
                mass: planetData.sun.mass * BLACK_HOLE_MASS_IN_SOLAR_MASSES,
                category: 'blackHole',
                color: 0xffefd6
            };
        }
        if (key === 'oortCloud' && planetData[key]) {
            return {
                ...planetData[key],
                category: 'region'
            };
        }
        return planetData[key];
    };

    const getDiameterSphereStyle = (key, data) => {
        if (key === DIAMETER_BLACK_HOLE_KEY || key === 'blackHole' || BLACK_HOLE_TARGET_KEYS.includes(key)) {
            return `background: url('${BLACK_HOLE_TEXTURE_PATH}') center/cover;`;
        }
        if (key === 'proximaCentauri') {
            return `background: radial-gradient(circle at 32% 28%, #ffe0b2 0 9%, #ff9a55 22%, #d94d34 58%, #381112 100%), radial-gradient(circle at 70% 62%, rgba(80, 16, 18, 0.34), transparent 24%), radial-gradient(circle at 44% 72%, rgba(255, 210, 150, 0.2), transparent 18%);`;
        }
        if (key === 'oortCloud') {
            return `background: radial-gradient(circle at 30% 25%, rgba(183, 230, 255, 0.2), rgba(183, 230, 255, 0) 45%), radial-gradient(circle at 75% 75%, rgba(120, 170, 255, 0.22), rgba(120, 170, 255, 0) 50%), url('textures/starfield.jpg') center/cover;`;
        }
        return planetTextures[key]
            ? `background: url('${planetTextures[key]}') center/cover;`
            : `background: #${data.color.toString(16).padStart(6, '0')};`;
    };

    const getComparisonShapeClass = (key) => {
        if (key === 'phobos') return 'irregular-rock phobos-rock';
        if (key === 'deimos') return 'irregular-rock deimos-rock';
        return '';
    };

    if (mode === 'diameter') {
        if (currentDiameterDetailIndex < 0 || currentDiameterDetailIndex >= DIAMETER_DETAIL_PROFILES.length) {
            currentDiameterDetailIndex = 0;
        }
        isDiameterDetailMode = true;
        // 按直径排序（从大到小）
        const sortedPlanets = sortComparisonKeys(COMPARISON_BODY_KEYS, 'diameter');
        const detailProfile = isDiameterDetailMode && currentDiameterDetailIndex >= 0
            ? DIAMETER_DETAIL_PROFILES[Math.min(currentDiameterDetailIndex, DIAMETER_DETAIL_PROFILES.length - 1)]
            : null;
        subtitle.textContent = isDiameterDetailMode && detailProfile ? detailProfile.subtitle : '以地球为参考（直径 = 12,742 km）';

        if (detailTabs) {
            detailTabs.style.display = 'block';
            detailTabs.innerHTML = '';
            const mainTabRow = document.createElement('div');
            mainTabRow.style.display = 'flex';
            mainTabRow.style.flexWrap = 'wrap';
            mainTabRow.style.justifyContent = 'center';
            mainTabRow.style.gap = '8px';
            mainTabRow.style.width = '100%';
            DIAMETER_DETAIL_PROFILES.forEach((profile, index) => {
                const tabBtn = document.createElement('button');
                tabBtn.className = 'diameter-detail-tab';
                if (isDiameterDetailMode && currentDiameterDetailIndex === index) {
                    tabBtn.classList.add('active');
                }
                tabBtn.type = 'button';
                tabBtn.textContent = profile.label;
                tabBtn.addEventListener('click', () => {
                    isDiameterDetailMode = true;
                    currentDiameterDetailIndex = index;
                    generateSizeComparison('diameter');
                });
                mainTabRow.appendChild(tabBtn);
            });
            detailTabs.appendChild(mainTabRow);

            if (isDiameterDetailMode && detailProfile && detailProfile.isBlackHoleProfile) {
                const scopeRow = document.createElement('div');
                scopeRow.style.display = 'flex';
                scopeRow.style.flexWrap = 'wrap';
                scopeRow.style.justifyContent = 'center';
                scopeRow.style.gap = '8px';
                scopeRow.style.width = '100%';
                scopeRow.style.margin = '10px auto 0';
                renderBlackHoleScopePicker(scopeRow, 'diameter', {
                    labelSuffix: '口径',
                    pickerClass: 'capacity-target-picker',
                    noNegativeMargin: true
                });
                detailTabs.appendChild(scopeRow);
            }
        }

        if (isDiameterDetailMode) {
            container.classList.add('diameter-detail-mode');
            container.style.padding = '18px 12px 24px';

            const profile = detailProfile || DIAMETER_DETAIL_PROFILES[0];
            const isBlackHoleDetailProfile = profile && profile.isBlackHoleProfile;
            const diameterBlackHoleScope = isBlackHoleDetailProfile
                ? (BLACK_HOLE_TARGET_KEYS.includes(currentBlackHoleScope) ? currentBlackHoleScope : BLACK_HOLE_TARGET_KEYS[0])
                : null;
            if (diameterBlackHoleScope) {
                currentBlackHoleScope = diameterBlackHoleScope;
            }
            const detailPlanets = isBlackHoleDetailProfile
                ? profile.planets.map(name => (name === DIAMETER_BLACK_HOLE_KEY || BLACK_HOLE_TARGET_KEYS.includes(name) ? diameterBlackHoleScope : name))
                : sortComparisonKeys(profile.planets, 'diameter');
            if (isBlackHoleDetailProfile) {
                detailPlanets.sort((a, b) => {
                    const aData = getDiameterPlanetData(a);
                    const bData = getDiameterPlanetData(b);
                    return (bData?.diameter || 0) - (aData?.diameter || 0);
                });
            }
            const maxDiameter = Math.max(
                1,
                ...detailPlanets.map(name => {
                    const item = getDiameterPlanetData(name);
                    return item && item.diameter ? item.diameter : 1;
                })
            );
            const maxDisplaySize = 260;
            const earthDiameter = 12742;

            detailPlanets.forEach(name => {
                const data = getDiameterPlanetData(name);
                if (!data) return;
                const categoryClass = data.category || '';
                const shapeClass = getComparisonShapeClass(name);
                const displaySize = Math.max(8, maxDisplaySize * (data.diameter / maxDiameter));
                const earthRatio = data.diameter / earthDiameter;
                const earthLabel = name === 'earth'
                    ? '= 1 地球'
                    : `= ${earthRatio.toFixed(2)} 地球`;
                const bgStyle = getDiameterSphereStyle(name, data);
                const extraStyle = name === DIAMETER_BLACK_HOLE_KEY || BLACK_HOLE_TARGET_KEYS.includes(name) || name === 'blackHole'
                    ? 'box-shadow: 0 0 50px rgba(255, 210, 140, 0.5), 0 0 100px rgba(255, 90, 20, 0.25);'
                    : '';

                const div = document.createElement('div');
                div.className = `comparison-planet diameter-detail-planet ${categoryClass} ${shapeClass}`;
                div.innerHTML = `
                    <div class="sphere" style="
                        width: ${displaySize}px;
                        height: ${displaySize}px;
                        ${bgStyle}
                        ${extraStyle}
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
            const shapeClass = getComparisonShapeClass(name);

            let displaySize;
            if (name === 'sun') {
                displaySize = sunDisplaySize;
            } else {
                const ratio = data.diameter / jupiterDiameter;
                displaySize = jupiterDisplaySize * ratio;
                displaySize = Math.max(5, displaySize);
            }

            const bgStyle = getDiameterSphereStyle(name, data);

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
            div.className = `comparison-planet ${categoryClass} ${shapeClass}`;
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
        const sortedPlanets = sortComparisonKeys(COMPARISON_BODY_KEYS, 'mass');
        subtitle.textContent = '以地球质量为数字参考；恒星按太阳比例压缩显示，行星按木星比例压缩显示';
        container.classList.add('compact-mass-mode');
        container.style.padding = '18px 8px 12px';

        const sunDisplaySize = 300;
        const jupiterDisplaySize = 140;
        const jupiterMass = 1898;
        const sunMass = planetData.sun.mass;

        sortedPlanets.forEach(name => {
            const data = planetData[name];
            const categoryClass = data.category || '';
            const shapeClass = getComparisonShapeClass(name);

            let displaySize;
            if (name === 'sun') {
                displaySize = sunDisplaySize;
            } else if (data.category === 'star') {
                const ratio = data.mass / sunMass;
                displaySize = sunDisplaySize * Math.cbrt(ratio);
                displaySize = Math.max(48, Math.min(sunDisplaySize * 0.82, displaySize));
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
            if (name === 'sun') {
                earthMassLabel = '= 1 太阳质量';
            } else if (data.category === 'star') {
                earthMassLabel = `≈ ${(data.mass / sunMass).toFixed(3)} 太阳质量`;
            } else if (name === 'earth') {
                earthMassLabel = '= 1 地球质量';
            } else if (earthMasses >= 1) {
                earthMassLabel = `= ${earthMasses.toFixed(1)} 地球质量`;
            } else {
                earthMassLabel = `= ${earthMasses.toFixed(4)} 地球质量`;
            }

            const bgStyle2 = getDiameterSphereStyle(name, data);

            const div = document.createElement('div');
            div.className = `comparison-planet ${categoryClass} ${shapeClass}`;
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
    } else if (mode === 'volumeCapacity' || mode === 'massCapacity' || mode === 'widthCapacity') {
        renderCapacityMode(container, subtitle);
    } else if (mode === 'sunVolume' || mode === 'volume') {
        currentCapacityView = 'sun';
        renderCapacityMode(container, subtitle);
    } else if (mode === 'jupiterVolume') {
        currentCapacityView = 'jupiter';
        renderCapacityMode(container, subtitle);
    } else if (mode === 'saturnVolume') {
        currentCapacityView = 'saturn';
        renderCapacityMode(container, subtitle);
    } else if (mode === 'uranusVolume') {
        currentCapacityView = 'uranus';
        renderCapacityMode(container, subtitle);
    } else if (mode === 'neptuneVolume') {
        currentCapacityView = 'neptune';
        renderCapacityMode(container, subtitle);
    } else if (mode === 'dragVolume') {
        // 拖进太阳
        cancelDragVolumeAnimation();
        generateDragVolumeComparison(container, subtitle);
    } else if (mode === 'blackHoleVolume') {
        // 黑洞能装多少个
        currentCapacityView = 'blackHole';
        currentBlackHoleScope = 'blackHoleEventHorizon';
        generateBlackHoleVolumeComparison(container, subtitle, currentBlackHoleScope);
    } else if (mode === 'blackHoleEventHorizonVolume') {
        // 黑洞（事件视界）能装多少个
        currentCapacityView = 'blackHole';
        currentBlackHoleScope = 'blackHoleEventHorizon';
        generateBlackHoleVolumeComparison(container, subtitle, currentBlackHoleScope);
    } else if (mode === 'blackHoleGravitationalVolume') {
        // 黑洞（引力影响区）能装多少个
        currentCapacityView = 'blackHole';
        currentBlackHoleScope = 'blackHoleGravitationalRadius';
        generateBlackHoleVolumeComparison(container, subtitle, currentBlackHoleScope);
    } else if (mode === 'dragBlackHole') {
        // 拖进黑洞
        cancelDragVolumeAnimation();
        currentCapacityView = 'dragBlackHole';
        currentDragBlackHoleScope = 'blackHoleEventHorizon';
        generateDragBlackHoleComparison(container, subtitle, currentDragBlackHoleScope);
    } else if (mode === 'dragBlackHoleEventHorizon') {
        // 兼容旧入口：拖进黑洞（事件视界）
        currentCapacityView = 'dragBlackHole';
        currentDragBlackHoleScope = 'blackHoleEventHorizon';
        cancelDragVolumeAnimation();
        generateDragBlackHoleComparison(container, subtitle, currentDragBlackHoleScope);
    } else if (mode === 'dragBlackHoleGravitationalRadius') {
        // 兼容旧入口：拖进黑洞（引力影响区）
        currentCapacityView = 'dragBlackHole';
        currentDragBlackHoleScope = 'blackHoleGravitationalRadius';
        cancelDragVolumeAnimation();
        generateDragBlackHoleComparison(container, subtitle, currentDragBlackHoleScope);
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
function generateBlackHoleVolumeComparison(container, subtitle, targetKey = 'blackHoleEventHorizon') {
    return renderCapacityComparison(container, subtitle, targetKey);
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

function generateDragBlackHoleComparison(container, subtitle, targetKey = 'blackHoleEventHorizon') {
    return renderDragCapacityComparison(container, subtitle, targetKey);
}

// 把 #rrggbb 转 'r, g, b'，用于做 rgba 渐变
function hexToRgbStr(hex) {
    const m = /^#([0-9a-fA-F]{6})$/.exec(hex || '');
    if (!m) return '255, 255, 255';
    const v = parseInt(m[1], 16);
    return `${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}`;
}

function drawProximaSurface(ctx, cx, cy, r) {
    const core = ctx.createRadialGradient(cx - r * 0.36, cy - r * 0.38, r * 0.08, cx, cy, r);
    core.addColorStop(0, '#ffe0b2');
    core.addColorStop(0.22, '#ff9a55');
    core.addColorStop(0.58, '#d94d34');
    core.addColorStop(1, '#381112');
    ctx.fillStyle = core;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    for (let i = 0; i < 20; i++) {
        const angle = i * 2.399963;
        const rr = r * (0.15 + ((i * 37) % 70) / 100);
        const x = cx + Math.cos(angle) * rr * 0.72;
        const y = cy + Math.sin(angle) * rr * 0.72;
        const spotR = r * (0.025 + ((i * 13) % 22) / 1000);
        ctx.beginPath();
        ctx.arc(x, y, spotR, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0
            ? 'rgba(255, 210, 150, 0.18)'
            : 'rgba(80, 16, 18, 0.22)';
        ctx.fill();
    }

    const limb = ctx.createRadialGradient(cx, cy, r * 0.35, cx, cy, r);
    limb.addColorStop(0, 'rgba(255, 180, 100, 0)');
    limb.addColorStop(0.78, 'rgba(40, 8, 10, 0.18)');
    limb.addColorStop(1, 'rgba(0, 0, 0, 0.52)');
    ctx.fillStyle = limb;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
}

// 把行星纹理画进圆形容器（带球体光照与外围微弱光晕）
function drawPlanetTextureContainer(ctx, size, targetKey, opts = {}) {
    const cx = size / 2, cy = size / 2, r = size / 2 - (opts.margin ?? 10);
    const target = (typeof CAPACITY_TARGETS !== 'undefined') ? CAPACITY_TARGETS[targetKey] : null;
    const fallbackColor = (target && target.color) || '#888888';
    const img = getDragVolumeTexture(targetKey);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    if (targetKey === 'proximaCentauri') {
        drawProximaSurface(ctx, cx, cy, r);
    } else if (img && img.complete && img.naturalWidth > 0) {
        const srcSize = Math.min(img.naturalWidth, img.naturalHeight);
        const sx = (img.naturalWidth - srcSize) / 2;
        const sy = (img.naturalHeight - srcSize) / 2;
        ctx.drawImage(img, sx, sy, srcSize, srcSize, cx - r, cy - r, r * 2, r * 2);
    } else {
        ctx.fillStyle = fallbackColor;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    // 球面光照：左上高光 + 右下阴影
    const lightGrad = ctx.createRadialGradient(
        cx - r * 0.4, cy - r * 0.45, r * 0.05,
        cx, cy, r * 1.05
    );
    lightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
    lightGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0)');
    lightGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.34)');
    lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0.62)');
    ctx.fillStyle = lightGrad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();

    if (opts.glow !== false) {
        const rgb = hexToRgbStr(fallbackColor);
        const glow = ctx.createRadialGradient(cx, cy, r * 0.92, cx, cy, r * 1.18);
        glow.addColorStop(0, `rgba(${rgb}, 0.22)`);
        glow.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.18, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
    }
}

// 通用 idle 渲染：根据 targetKey 自动选择太阳渐变 / 黑洞 / 行星纹理 / 玻璃球
function drawIdleContainer(ctx, size, targetKey, options = {}) {
    if (isBlackHoleTargetType(targetKey)) {
        drawIdleBlackHole(ctx, size, 0, true, options.blackHoleScopeLabel || getBlackHoleScopeLabel(targetKey));
        return;
    }
    if (targetKey === 'sun') {
        drawIdleSun(ctx, size);
        return;
    }
    const cx = size / 2, cy = size / 2;
    const sizeScale = size / 260;
    const hintFontPx = Math.max(14, Math.round(14 * sizeScale));
    ctx.clearRect(0, 0, size, size);
    if (isGlassDragMode()) {
        drawGlassContainerBack(ctx, size, 10);
        drawGlassContainerFront(ctx, size, 10);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = `600 ${hintFontPx}px "Noto Sans SC"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('拖到这里', cx, cy);
        return;
    }
    drawPlanetTextureContainer(ctx, size, targetKey);
    // 提示文字
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.font = `600 ${hintFontPx}px "Noto Sans SC"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('拖到这里', cx, cy);
    // 纹理还在加载时延迟重绘
    const img = getDragVolumeTexture(targetKey);
    if (img && !img.complete) {
        img.onload = () => drawIdleContainer(ctx, size, targetKey, options);
    }
}

function drawIdleSun(ctx, size) {
    const cx = size / 2, cy = size / 2, r = size / 2 - 10;
    const sizeScale = size / 260;
    const hintFontPx = Math.max(14, Math.round(14 * sizeScale));
    ctx.clearRect(0, 0, size, size);

    if (isGlassDragMode()) {
        drawGlassContainerBack(ctx, size, 10);
        drawGlassContainerFront(ctx, size, 10);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = `600 ${hintFontPx}px "Noto Sans SC"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('拖到这里', cx, cy);
        return;
    }

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
    ctx.font = `600 ${hintFontPx}px "Noto Sans SC"`;
    ctx.textAlign = 'center';
    ctx.fillText('拖到这里', cx, cy);
}

function drawIdleBlackHole(ctx, size, pulse = 0, showHint = true, scopeLabel = '引力影响区') {
    const cx = size / 2, cy = size / 2, r = size / 2 - 18;
    const sizeScale = size / 280;
    const hintFontPx = Math.max(14, Math.round(14 * sizeScale));
    ctx.clearRect(0, 0, size, size);

    if (isGlassDragMode()) {
        drawGlassContainerBack(ctx, size, 18);
        drawGlassContainerFront(ctx, size, 18);
        if (showHint) {
            ctx.fillStyle = 'rgba(255, 244, 220, 0.86)';
            ctx.font = `600 ${hintFontPx}px "Noto Sans SC"`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`拖到${scopeLabel}`, cx, cy);
        }
        return;
    }

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
        ctx.font = `600 ${hintFontPx}px "Noto Sans SC"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const hintText = `拖到${scopeLabel}`;
        ctx.fillText(hintText, cx, cy);
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

    function getDropClickTarget(clientX, clientY) {
        const elements = document.elementsFromPoint
            ? document.elementsFromPoint(clientX, clientY)
            : [document.elementFromPoint(clientX, clientY)].filter(Boolean);

        for (const element of elements) {
            if (!element || element.classList?.contains('drag-ghost')) {
                continue;
            }

            const style = window.getComputedStyle(element);
            if (style.visibility === 'hidden' || style.pointerEvents === 'none') {
                continue;
            }

            const clickable = element.closest('a[href], button, [role="button"]');
            if (!clickable) {
                continue;
            }
            if (wrapper.contains(clickable)
                && !clickable.classList.contains('tab-btn')
                && !clickable.classList.contains('diameter-detail-tab')
                && clickable.id !== 'closeSizeComparison') {
                continue;
            }
            return clickable;
        }
        return null;
    }

    function handleDrop(clientX, clientY) {
        if (!ghost || !dragItem) return;

        if (activeItem) {
            activeItem.style.opacity = '1';
        }
        if (sizeComparison) {
            sizeComparison.style.overflow = 'auto';
        }

        // 用容器（drag-sun-area 等）做 hit 判定，避免 2D canvas 在 3D 模式被
        // display:none 后 rect 全为 0 导致拖拽永远落不进去
        const hitElement = (typeof targetConfig.getHitElement === 'function')
            ? targetConfig.getHitElement()
            : (targetConfig.hitElement || canvas);
        const canvasRect = (hitElement || canvas).getBoundingClientRect();
        const cx = canvasRect.left + canvasRect.width / 2;
        const cy = canvasRect.top + canvasRect.height / 2;
        const dist = Math.sqrt((clientX - cx) ** 2 + (clientY - cy) ** 2);
        const hitRadius = canvasRect.width / 2;
        const clickTarget = getDropClickTarget(clientX, clientY);

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
            if (typeof targetConfig.onSelect === 'function') {
                targetConfig.onSelect(dragItem.key);
            }
            startAnimation(ctx2, canvasSize, dragItem, targetConfig);
        } else {
            ghost.classList.add('snap-back');
            scheduleGhostRemoval(ghost, 300);
            if (clickTarget) {
                setTimeout(() => {
                    clickTarget.click();
                }, 0);
            }
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
    if (isDrag3DMode() && Drag3DScene.isReady) {
        return start3DFillAnimation(data, animationConfig, animationConfig.resultLabel || '能装');
    }
    const cx = size / 2, cy = size / 2, r = size / 2 - 10;
    const targetCount = data.count;
    const color = data.color;
    const nameCN = data.nameCN;
    const label = data.label;
    const dragKey = data.key;
    const duration = 3000;
    playVolumeFillCollisionSound(targetCount, 'sun', duration);
    // 容器目标（决定底色与外圈光晕颜色）；缺失时按太阳处理
    const containerKey = animationConfig.targetKey || 'sun';
    const containerTarget = (typeof CAPACITY_TARGETS !== 'undefined') ? CAPACITY_TARGETS[containerKey] : null;
    const containerIsSun = containerKey === 'sun';
    const containerTexture = !containerIsSun ? getDragVolumeTexture(containerKey) : null;
    const containerGlowRgb = hexToRgbStr((containerTarget && containerTarget.color) || (containerIsSun ? '#ff9800' : '#888888'));

    // 粒子半径按目标数量反推（数量越少球越大，少量也能撑满容器）
    const sizeScale = size / 260; // 历史基线，文字字号继续按它缩放
    const particleRadius = compute2DParticleRadius(r, targetCount);
    const visualCount = getVisualParticleCount(targetCount);

    // 六边形密铺槽位：动画过程中按从底向上的顺序逐渐"显形"
    const slots = compute2DParticleSlots(r, particleRadius, visualCount, targetCount);
    const totalSlots = slots.length;
    const finalShown = Math.min(totalSlots, visualCount);

    // 高亮飞入粒子（少量装饰，从顶部落入下一个待显形槽位）
    const FLYING_MAX = 6;
    const flying = [];
    for (let i = 0; i < FLYING_MAX; i++) flying.push({ alive: false });

    let displayCount = 0;
    const startTime = performance.now();

    function spawnFlying(slot) {
        for (let i = 0; i < FLYING_MAX; i++) {
            const p = flying[i];
            if (!p.alive) {
                p.alive = true;
                p.targetX = cx + slot.x;
                p.targetY = cy + slot.y;
                p.x = cx + (Math.random() - 0.5) * r * 1.2;
                p.y = cy - r - particleRadius - 6;
                p.life = 0; // 0~1, 1=到达目标
                p.lifeSpeed = 0.06 + Math.random() * 0.04;
                return;
            }
        }
    }

    let resultShown = false;
    let lastFrameTime = 0;
    function animate(now) {
        lastFrameTime = now;
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const fillLevel = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        displayCount = Math.round(targetCount * fillLevel);
        const visibleCount = Math.min(finalShown, Math.ceil(fillLevel * finalShown));
        const isGlass = isGlassDragMode();

        ctx.clearRect(0, 0, size, size);

        if (isGlass) {
            drawGlassContainerBack(ctx, size, 10);
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();

        if (!isGlass) {
            if (containerIsSun) {
                // 太阳底色
                const sunGrad = ctx.createRadialGradient(cx * 0.8, cy * 0.8, r * 0.1, cx, cy, r);
                sunGrad.addColorStop(0, '#ffffff');
                sunGrad.addColorStop(0.2, '#fff9c4');
                sunGrad.addColorStop(0.5, '#ffeb3b');
                sunGrad.addColorStop(0.8, '#ff9800');
                sunGrad.addColorStop(1, '#e65100');
                ctx.fillStyle = sunGrad;
                ctx.fillRect(0, 0, size, size);
            } else if (containerKey === 'proximaCentauri') {
                drawProximaSurface(ctx, cx, cy, r);
            } else if (containerTexture && containerTexture.complete && containerTexture.naturalWidth > 0) {
                // 行星纹理底色
                const srcSize = Math.min(containerTexture.naturalWidth, containerTexture.naturalHeight);
                const sx = (containerTexture.naturalWidth - srcSize) / 2;
                const sy = (containerTexture.naturalHeight - srcSize) / 2;
                ctx.drawImage(containerTexture, sx, sy, srcSize, srcSize, cx - r, cy - r, r * 2, r * 2);
                // 球面光照
                const lightGrad = ctx.createRadialGradient(
                    cx - r * 0.4, cy - r * 0.45, r * 0.05,
                    cx, cy, r * 1.05
                );
                lightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
                lightGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0)');
                lightGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.34)');
                lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0.62)');
                ctx.fillStyle = lightGrad;
                ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
            } else {
                // 纹理未加载时用纯色 fallback
                ctx.fillStyle = (containerTarget && containerTarget.color) || '#444';
                ctx.fillRect(0, 0, size, size);
            }
        }

        // 2. 已显形的密铺小球（六边形铺满）
        for (let i = 0; i < visibleCount; i++) {
            const s = slots[i];
            drawTexturedMiniPlanet(ctx, cx + s.x, cy + s.y, particleRadius, dragKey, color);
        }

        // 3. 顶部"飞入"粒子（少量装饰，朝下一个待显形槽位飞入）
        if (progress < 0.97 && visibleCount < finalShown) {
            // 让飞入粒子数量与显形速率挂钩
            const aliveCount = flying.reduce((acc, p) => acc + (p.alive ? 1 : 0), 0);
            if (aliveCount < 3 && Math.random() < 0.5) {
                const idx = Math.min(finalShown - 1, visibleCount + Math.floor(Math.random() * 6));
                if (slots[idx]) spawnFlying(slots[idx]);
            }
            for (let i = 0; i < FLYING_MAX; i++) {
                const p = flying[i];
                if (!p.alive) continue;
                p.life += p.lifeSpeed;
                if (p.life >= 1) {
                    p.alive = false;
                    continue;
                }
                // 抛物线轨迹：x 线性、y 二次加速（重力感）
                const t = p.life;
                const px = p.x + (p.targetX - p.x) * t;
                const py = p.y + (p.targetY - p.y) * (t * t);
                drawTexturedMiniPlanet(ctx, px, py, particleRadius, dragKey, color);
            }
        }

        ctx.restore();

        // 4. 光晕（玻璃模式不画外圈光晕，让玻璃描边代替）
        if (!isGlass) {
            const glow = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.15);
            glow.addColorStop(0, `rgba(${containerGlowRgb}, 0.22)`);
            glow.addColorStop(1, `rgba(${containerGlowRgb}, 0)`);
            ctx.beginPath();
            ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();
        } else {
            // 玻璃模式：边缘高光与描边
            drawGlassContainerFront(ctx, size, 10);
        }

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

        const numFontPx = Math.round(28 * sizeScale);
        const subFontPx = Math.round(13 * sizeScale);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = `900 ${numFontPx}px ${TEACHING_NUMBER_FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(countText, cx + 1, cy - 5 * sizeScale + 1);
        ctx.fillStyle = '#fff';
        ctx.fillText(countText, cx, cy - 5 * sizeScale);

        ctx.font = `500 ${subFontPx}px "Noto Sans SC", sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('个' + nameCN, cx, cy + 20 * sizeScale);
        ctx.restore();

        if (progress < 1) {
            dragVolumeAnimationId = requestAnimationFrame(animate);
        } else {
            // 动画完成，显示结果（仅一次），画面定格在最后状态
            dragVolumeAnimationId = null;
            if (!resultShown) {
                showDragResult(label, nameCN, animationConfig.resultLabel || '能装');
                resultShown = true;
            }
        }
    }

    if (animationConfig.wrapper) {
        // 切换玻璃/原版时调用，重画当前帧（动画结束后画面定格也能立即应用样式）
        animationConfig.wrapper._dragRedraw = () => animate(lastFrameTime || performance.now());
    }
    dragVolumeAnimationId = requestAnimationFrame(animate);
}

function startBlackHoleFillAnimation(ctx, size, data, animationConfig = {}) {
    if (isDrag3DMode() && Drag3DScene.isReady) {
        return start3DFillAnimation(data, animationConfig,
            (animationConfig.blackHoleScopeLabel ? `${animationConfig.blackHoleScopeLabel}能装` : '黑洞能装'),
            'blackHole');
    }
    const cx = size / 2, cy = size / 2, r = size / 2 - 18;
    const targetCount = data.count;
    const color = data.color;
    const nameCN = data.nameCN;
    const label = data.label;
    const dragKey = data.key;
    const duration = 3200;
    playVolumeFillCollisionSound(targetCount, 'blackHole', duration);

    // 粒子半径按目标数量反推
    const sizeScale = size / 280; // 历史基线，文字字号继续按它缩放
    // 黑洞容器留出中心黑核区域，可用半径稍小
    const usableR = r * 0.92;
    const particleRadius = compute2DParticleRadius(usableR, targetCount);
    const visualCount = getVisualParticleCount(targetCount);

    // 黑洞密铺：留出中心 r*0.32 作为黑核吞噬区
    const slots = compute2DParticleSlots(r, particleRadius, visualCount, targetCount, { innerR: r * 0.32 });
    const totalSlots = slots.length;
    const finalShown = Math.min(totalSlots, visualCount);

    // 飞入装饰粒子：从外围螺旋飞向下一个待显形槽位
    const FLYING_MAX = 6;
    const flying = [];
    for (let i = 0; i < FLYING_MAX; i++) flying.push({ alive: false });

    const startTime = performance.now();
    let displayCount = 0;

    function spawnFlying(slot) {
        for (let i = 0; i < FLYING_MAX; i++) {
            const p = flying[i];
            if (!p.alive) {
                p.alive = true;
                p.targetX = cx + slot.x;
                p.targetY = cy + slot.y;
                const ang = Math.random() * Math.PI * 2;
                const orbR = r * (1.05 + Math.random() * 0.15);
                p.x = cx + Math.cos(ang) * orbR;
                p.y = cy + Math.sin(ang) * orbR * 0.45;
                p.life = 0;
                p.lifeSpeed = 0.05 + Math.random() * 0.04;
                return;
            }
        }
    }

    let resultShown = false;
    let lastFrameTime = 0;
    function animate(now) {
        lastFrameTime = now;
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - progress, 3);
        displayCount = Math.round(targetCount * ease);
        const visibleCount = Math.min(finalShown, Math.ceil(ease * finalShown));
        const isGlass = isGlassDragMode();

        ctx.clearRect(0, 0, size, size);

        if (isGlass) {
            drawGlassContainerBack(ctx, size, 18);
        } else {
            drawIdleBlackHole(ctx, size, Math.sin(now * 0.006) * 0.5 + 0.5, false);
            // 中心黑核 + 暖光圈，覆盖在黑洞背景上
            const swallowGlow = ctx.createRadialGradient(cx, cy, r * 0.18, cx, cy, r * 0.42);
            swallowGlow.addColorStop(0, 'rgba(0, 0, 0, 0.96)');
            swallowGlow.addColorStop(0.6, 'rgba(0, 0, 0, 0.78)');
            swallowGlow.addColorStop(1, 'rgba(255, 147, 43, 0.06)');
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.42, 0, Math.PI * 2);
            ctx.fillStyle = swallowGlow;
            ctx.fill();
        }

        // 已显形的密铺小球（环形铺满）
        for (let i = 0; i < visibleCount; i++) {
            const s = slots[i];
            drawTexturedMiniPlanet(ctx, cx + s.x, cy + s.y, particleRadius, dragKey, color);
        }

        // 飞入装饰粒子
        if (progress < 0.96 && visibleCount < finalShown) {
            const aliveCount = flying.reduce((acc, p) => acc + (p.alive ? 1 : 0), 0);
            if (aliveCount < 4 && Math.random() < 0.6) {
                const idx = Math.min(finalShown - 1, visibleCount + Math.floor(Math.random() * 8));
                if (slots[idx]) spawnFlying(slots[idx]);
            }
            for (let i = 0; i < FLYING_MAX; i++) {
                const p = flying[i];
                if (!p.alive) continue;
                p.life += p.lifeSpeed;
                if (p.life >= 1) {
                    p.alive = false;
                    continue;
                }
                const t = p.life;
                const px = p.x + (p.targetX - p.x) * t;
                const py = p.y + (p.targetY - p.y) * t;
                drawTexturedMiniPlanet(ctx, px, py, particleRadius, dragKey, color);
            }
        }

        if (isGlass) {
            drawGlassContainerFront(ctx, size, 18);
        }

        const countText = formatCompactCount(displayCount);
        const numFontPx = Math.round(25 * sizeScale);
        const subFontPx = Math.round(13 * sizeScale);
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.font = `900 ${numFontPx}px ${TEACHING_NUMBER_FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(countText, cx + 1, cy + 1);
        ctx.fillStyle = '#fff4d2';
        ctx.fillText(countText, cx, cy);

        ctx.font = `500 ${subFontPx}px "Noto Sans SC", sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.74)';
        ctx.fillText('个' + nameCN, cx, cy + 26 * sizeScale);

        if (progress < 1) {
            dragVolumeAnimationId = requestAnimationFrame(animate);
        } else {
            dragVolumeAnimationId = null;
            if (!resultShown) {
                const defaultLabel = animationConfig.blackHoleScopeLabel
                    ? `${animationConfig.blackHoleScopeLabel}能装`
                    : '黑洞能装';
                showDragResult(label, nameCN, animationConfig.resultLabel || defaultLabel);
                resultShown = true;
            }
        }
    }
    if (animationConfig.wrapper) {
        animationConfig.wrapper._dragRedraw = () => animate(lastFrameTime || performance.now());
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
    document.querySelectorAll('.comparison-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            cancelDragVolumeAnimation();
            runActiveDragCleanup();
            currentComparisonTab = normalizeComparisonMode(btn.dataset.tab);
            if (btn.dataset.capacityMetric) {
                currentComparisonMetric = btn.dataset.capacityMetric;
            } else if (currentComparisonTab === 'diameter' || currentComparisonTab === 'mass') {
                currentComparisonMetric = currentComparisonTab;
            }
            if (currentComparisonTab !== 'diameter') {
                isDiameterDetailMode = false;
                currentDiameterDetailIndex = -1;
            }
            generateSizeComparison(currentComparisonTab);
        });
    });
}

function updateComparisonTabActiveState() {
    document.querySelectorAll('.comparison-tabs .tab-btn').forEach(btn => {
        const isTabActive = btn.dataset.tab && normalizeComparisonMode(btn.dataset.tab) === currentComparisonTab;
        btn.classList.toggle('active', isTabActive);
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
        return stripTrailingZero((num / 1000000000000).toFixed(num >= 10000000000000 ? 1 : 2)) + '万亿';
    }
    if (num >= 100000000) {
        return stripTrailingZero((num / 100000000).toFixed(num >= 1000000000 ? 0 : 1)) + '亿';
    }
    if (num >= 10000) {
        return stripTrailingZero((num / 10000).toFixed(num >= 1000000 ? 0 : 1)) + '万';
    }
    return formatNumber(num);
}

function stripTrailingZero(value) {
    return String(value).replace(/\.0$/, '');
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

// ============ 行星视频 · 信息面板卡片 + 影院模式 ============

function updatePlanetVideoCard(planetKey) {
    const card = document.getElementById('planetVideoCard');
    const preview = document.getElementById('planetVideoPreview');
    if (!card || !preview) return;

    const videoSrc = planetVideos[planetKey];
    if (!videoSrc) {
        card.style.display = 'none';
        preview.removeAttribute('src');
        preview.load();
        return;
    }

    preview.src = videoSrc;
    card.style.display = 'block';
}

function openPlanetTheater() {
    const preview = document.getElementById('planetVideoPreview');
    const theater = document.getElementById('planetTheater');
    const theaterVideo = document.getElementById('planetTheaterVideo');
    const titleEl = document.getElementById('planetTheaterTitle');
    if (!preview || !theater || !theaterVideo || !preview.src) return;

    if (currentAudio) {
        currentAudio.pause();
    }
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    const data = planetData[selectedPlanet];
    const label = data ? data.nameCN : selectedPlanet;
    titleEl.textContent = label + ' · 真实影像';

    theaterVideo.src = preview.src;
    theater.classList.add('visible');
    theaterVideo.play().catch(() => {});

    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) canvasContainer.style.pointerEvents = 'none';
}

function closePlanetTheater() {
    const theater = document.getElementById('planetTheater');
    const theaterVideo = document.getElementById('planetTheaterVideo');
    if (!theater) return;

    theater.classList.remove('visible');
    if (theaterVideo) {
        theaterVideo.pause();
        theaterVideo.removeAttribute('src');
        theaterVideo.load();
    }

    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) canvasContainer.style.pointerEvents = '';
}

function setupPlanetVideoListeners() {
    const card = document.getElementById('planetVideoCard');
    const playBtn = document.getElementById('planetVideoPlayBtn');
    const closeBtn = document.getElementById('planetTheaterClose');
    const backdrop = document.querySelector('.planet-theater-backdrop');

    if (playBtn) {
        playBtn.addEventListener('click', e => {
            e.stopPropagation();
            openPlanetTheater();
        });
    }
    if (card) {
        card.addEventListener('click', () => openPlanetTheater());
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closePlanetTheater());
    }
    if (backdrop) {
        backdrop.addEventListener('click', () => closePlanetTheater());
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            const theater = document.getElementById('planetTheater');
            if (theater && theater.classList.contains('visible')) {
                closePlanetTheater();
            }
        }
    });
}

// ============ 启动 ============
window.addEventListener('DOMContentLoaded', () => {
    init();
    setupPlanetVideoListeners();
});
