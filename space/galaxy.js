/**
 * 银河系探索 - 柳智天的宇宙课堂
 * 展示银河系结构、太阳系位置、日球层、奥尔特云及宇宙中其他知名星系
 */

// ============ 全局变量 ============
let scene, camera, renderer, controls;
let milkyWay; // 银河系
let milkyWayGlow; // 银河系远距离发光点
let galacticCenter; // 银河系中心黑洞
let solarSystem; // 太阳系标记
let heliopause; // 日球层
let oortCloud; // 奥尔特云
let starField; // 背景星空
let cosmicStarField; // 宇宙深空背景
let cosmicStructures = {}; // 本星系群/室女座/拉尼亚凯亚/可观测宇宙
let clock;
let textureLoader;
let raycaster, mouse;
let externalGalaxies = []; // 外部星系对象数组
let galaxyLabels = []; // 星系名称标签
let currentZoomLevel = 5; // 当前缩放层级
let starSystems = []; // 恒星系统对象数组（银河系尺度）
let neighborhoodStarSystems = []; // 太阳系邻域恒星系统（局部尺度）
let isNeighborhoodView = false; // 当前是否处于邻域视图
let focusedControlsTarget = null; // 当前缩放焦点
let focusedControlsObject = null; // 当前聚焦对象
let currentGalaxyAudio = null; // 当前播放的星系介绍音频
let simulationTime = 0; // 受暂停和慢速观察影响的模拟时间
let motionPaused = false; // 是否暂停整体运动
const starTextureCache = new Map();
const NEIGHBORHOOD_THRESHOLD = 400; // 切换到邻域视图的距离阈值
const NEIGHBORHOOD_SCALE = 10; // 邻域视图中1光年 = 10单位
const GALACTIC_CENTER = new THREE.Vector3(0, 0, 0);
const GALACTIC_ROTATION_SPEED = -0.00012; // 银河整体再慢一点，只保留能被肉眼感知的缓慢旋转
const GALACTIC_LANDMARK_SPEED_SCALE = 0.58; // 太阳系和著名恒星的公转再额外放慢，便于近距离观察
const GALACTIC_BLACK_HOLE_TEXTURE_PATH = 'textures/2.png';
const BLACK_HOLE_REVEAL_START_DISTANCE = 5200; // 缩放到银心附近才开始显出黑洞
const BLACK_HOLE_FULL_REVEAL_DISTANCE = 1700;
const tempSolarSystemPosition = new THREE.Vector3();
const tempFocusedWorldPosition = new THREE.Vector3();
const tempLineEndPosition = new THREE.Vector3();
const SOLAR_ORBIT_SETTINGS = {
    speedFactor: 0.97 * GALACTIC_LANDMARK_SPEED_SCALE,
    bobAmplitude: 8,
    bobSpeedFactor: 0.35,
    bobPhase: 0.35
};

// 太阳系在银河系中的位置（距银心约26000光年，这里用单位表示）
const SOLAR_SYSTEM_POS = new THREE.Vector3(5000, 0, 2000);

// ============ 恒星系统数据 ============
const starSystemData = {
    alphaCentauri: {
        name: '半人马座α',
        nameEn: 'Alpha Centauri',
        type: '三合星系统',
        spectralType: 'G2V + K1V + M5.5Ve',
        distance: '4.37光年',
        brightness: '视星等 -0.27',
        planets: 1,
        description: '距离太阳系最近的恒星系统，由三颗恒星组成：半人马座α A、B和比邻星，画面里更亮的黄白色主星是A，旁边偏橙的是B，更远处的小红星就是比邻星。',
        funFact: '比邻星是距离我们最近的恒星，它周围发现了一颗可能宜居的行星——比邻星b！'
    },
    barnardStar: {
        name: '巴纳德星',
        nameEn: "Barnard's Star",
        type: '红矮星',
        spectralType: 'M4Ve',
        distance: '6光年',
        brightness: '视星等 9.5',
        planets: 1,
        description: '第二近的恒星系统，是一颗古老的红矮星，运动速度极快。',
        funFact: '巴纳德星是天空中自行运动最快的恒星，每年移动10.3角秒！'
    },
    sirius: {
        name: '天狼星',
        nameEn: 'Sirius',
        type: '双星系统',
        spectralType: 'A1V + DA2',
        distance: '8.6光年',
        brightness: '视星等 -1.46',
        planets: 0,
        description: '夜空中最亮的恒星，由一颗蓝白色主序星和一颗白矮星组成。',
        funFact: '天狼星B是人类发现的第一颗白矮星，它的密度是水的100万倍！'
    },
    epsilonEridani: {
        name: '天苑四',
        nameEn: 'Epsilon Eridani',
        type: '类太阳恒星',
        spectralType: 'K2V',
        distance: '10.5光年',
        brightness: '视星等 3.73',
        planets: 2,
        description: '一颗年轻的类太阳恒星，拥有尘埃盘和至少两颗行星。',
        funFact: '天苑四是科幻作品中的热门目的地，《星际迷航》中的瓦肯星就设定在这里！'
    },
    trappist1: {
        name: 'TRAPPIST-1',
        nameEn: 'TRAPPIST-1',
        type: '红矮星',
        spectralType: 'M8V',
        distance: '39光年',
        brightness: '视星等 18.8',
        planets: 7,
        description: '一个拥有7颗类地行星的恒星系统，其中3颗位于宜居带！',
        funFact: '这7颗行星都比地球到月球的距离还近，站在其中一颗上可以清晰看到其他行星的地貌！'
    },
    kepler452: {
        name: '开普勒-452',
        nameEn: 'Kepler-452',
        type: '类太阳恒星',
        spectralType: 'G2V',
        distance: '1400光年',
        brightness: '视星等 13.4',
        planets: 1,
        description: '拥有"地球2.0"——开普勒-452b的恒星，与太阳非常相似。',
        funFact: '开普勒-452b的公转周期是385天，与地球的365天非常接近！'
    },
    betelgeuse: {
        name: '参宿四',
        nameEn: 'Betelgeuse',
        type: '红超巨星',
        spectralType: 'M1-M2 Ia-ab',
        distance: '700光年',
        brightness: '视星等 0.5',
        planets: 0,
        description: '猎户座的"肩膀"，一颗即将爆发为超新星的红超巨星。',
        funFact: '参宿四的直径是太阳的1000倍，如果放在太阳位置，它会吞没火星轨道！'
    },
    vega: {
        name: '织女星',
        nameEn: 'Vega',
        type: '白色主序星',
        spectralType: 'A0V',
        distance: '25光年',
        brightness: '视星等 0.03',
        planets: 0,
        description: '夏季大三角之一，北半球夜空中第二亮的恒星，拥有尘埃盘。',
        funFact: '织女星曾是北极星，约12000年后它将再次成为北极星！'
    },
    ross154: {
        name: '罗斯154',
        nameEn: 'Ross 154',
        type: '红矮星',
        spectralType: 'M3.5Ve',
        distance: '9.7光年',
        brightness: '视星等 10.4',
        planets: 0,
        description: '距离太阳系较近的红矮星之一，是一颗耀星，会发生强烈的耀斑。',
        funFact: '罗斯154的耀斑可以在几分钟内让它的亮度增加数倍！'
    },
    lacaille9352: {
        name: '拉卡伊9352',
        nameEn: 'Lacaille 9352',
        type: '红矮星',
        spectralType: 'M1V',
        distance: '10.7光年',
        brightness: '视星等 7.34',
        planets: 0,
        description: '最亮的近距离红矮星之一，位于南天的显微镜座。',
        funFact: '这颗恒星是以法国天文学家拉卡伊命名的，他在1751年编目了这颗星！'
    },
    tauCeti: {
        name: '鲸鱼座τ',
        nameEn: 'Tau Ceti',
        type: '类太阳恒星',
        spectralType: 'G8.5V',
        distance: '11.9光年',
        brightness: '视星等 3.49',
        planets: 5,
        description: '最接近太阳的类太阳恒星之一，可能拥有5颗行星的系统。',
        funFact: '鲸鱼座τ是SETI项目最早的搜索目标之一，因为它与太阳如此相似！'
    },
    procyon: {
        name: '南河三',
        nameEn: 'Procyon',
        type: '双星系统',
        spectralType: 'F5IV-V + DQZ',
        distance: '11.5光年',
        brightness: '视星等 0.34',
        planets: 0,
        description: '冬季大三角的成员之一，由一颗亚巨星和一颗白矮星组成。',
        funFact: '南河三的名字源自希腊语"狗前面的"，因为它在天狼星（大犬座α）之前升起！'
    },
    arcturus: {
        name: '大角星',
        nameEn: 'Arcturus',
        type: '红巨星',
        spectralType: 'K1.5 IIIpe',
        distance: '36.7光年',
        brightness: '视星等 -0.05',
        planets: 0,
        description: '北天最亮的恒星，牧夫座的主星。它是一颗红巨星，直径约为太阳的25倍。',
        funFact: '大角星是1933年芝加哥世博会的"明星"——它的光被用来触发开幕式的灯光！这道光走了40年才到达地球。'
    },
    antares: {
        name: '心宿二',
        nameEn: 'Antares',
        type: '红超巨星',
        spectralType: 'M1.5Iab-Ib',
        distance: '~550光年',
        brightness: '视星等 1.06',
        planets: 0,
        description: '天蝎座的心脏，一颗巨大的红超巨星。名字的意思是"火星的对手"，因为它的红色与火星相似。',
        funFact: '心宿二的直径是太阳的680倍，如果放在太阳位置，它会吞没火星的轨道！'
    },
    vyCanisMajoris: {
        name: '大犬座VY',
        nameEn: 'VY Canis Majoris',
        type: '红特超巨星',
        spectralType: 'M3-M4.5',
        distance: '~3,900光年',
        brightness: '视星等 7.95',
        planets: 0,
        description: '曾被认为是已知最大的恒星之一，是一颗极其巨大的红特超巨星，正在快速丧失质量。',
        funFact: '大犬座VY的直径是太阳的1,400倍！如果它替代太阳，它的表面会延伸到土星轨道附近！'
    },
    uyScuti: {
        name: '盾牌座UY',
        nameEn: 'UY Scuti',
        type: '红超巨星',
        spectralType: 'M4Ia',
        distance: '~9,500光年',
        brightness: '视星等 11.2',
        planets: 0,
        description: '曾被认为是已知体积最大的恒星，位于银河系中心方向的盾牌座。',
        funFact: '盾牌座UY的直径是太阳的1,700倍，光绕它一圈需要7个小时，绕太阳只需14.5秒！'
    },
    pistolStar: {
        name: '手枪星',
        nameEn: 'Pistol Star',
        type: '蓝特超巨星',
        spectralType: 'LBV',
        distance: '~25,000光年',
        brightness: '绝对星等 -11.8',
        planets: 0,
        description: '银河系中最明亮的恒星之一，位于银河系中心附近。它的亮度是太阳的160万倍！',
        funFact: '手枪星在4~6千年前的一次大爆发中释放了约10个太阳质量的物质，形成了手枪星云！'
    }
};

// ============ 太阳系邻域视图恒星配置（局部放大尺度）============
// 在这个视图中：1单位 = 1光年 * NEIGHBORHOOD_SCALE
// 太阳位于原点(0,0,0)，其他恒星根据真实距离放置
const neighborhoodStarConfigs = {
    alphaCentauri: {
        distanceLY: 4.37, // 光年
        angle: Math.PI * 0.3, // 方位角
        elevation: 0.1, // 仰角
        color: '#ffcc00',
        starType: 'triple',
        hasPlanets: true,
        systemRadius: 24,
        labelOffsetY: 36,
        components: [
            {
                label: 'A',
                radius: 7.5,
                color: '#fff1b8',
                textureProfile: 'sun',
                position: { x: -7, y: 0, z: 0 },
                glowScale: 1.6,
                glowOpacity: 0.55
            },
            {
                label: 'B',
                radius: 5.5,
                color: '#ffc56b',
                textureProfile: 'orange',
                position: { x: 8, y: 3, z: 0 },
                glowScale: 1.5,
                glowOpacity: 0.5
            },
            {
                label: '比邻星',
                radius: 2.6,
                color: '#ff6a5e',
                textureProfile: 'redDwarf',
                position: { x: -18, y: -10, z: 4 },
                glowScale: 1.9,
                glowOpacity: 0.65,
                labelOffsetY: 8
            }
        ]
    },
    barnardStar: {
        distanceLY: 6,
        angle: Math.PI * 1.2,
        elevation: 0.2,
        color: '#ff6633',
        textureProfile: 'redDwarf',
        starType: 'single',
        hasPlanets: true
    },
    sirius: {
        distanceLY: 8.6,
        angle: Math.PI * 0.8,
        elevation: -0.15,
        color: '#aaccff',
        textureProfile: 'blueWhite',
        starType: 'binary',
        hasPlanets: false
    },
    epsilonEridani: {
        distanceLY: 10.5,
        angle: Math.PI * 1.6,
        elevation: 0.05,
        color: '#ffcc00',
        textureProfile: 'orange',
        starType: 'single',
        hasPlanets: true
    },
    ross154: {
        distanceLY: 9.7,
        angle: Math.PI * 0.5,
        elevation: -0.3,
        color: '#ff6633',
        textureProfile: 'redDwarf',
        starType: 'single',
        hasPlanets: false
    },
    lacaille9352: {
        distanceLY: 10.7,
        angle: Math.PI * 1.9,
        elevation: 0.25,
        color: '#ff8844',
        textureProfile: 'redDwarf',
        starType: 'single',
        hasPlanets: false
    },
    vega: {
        distanceLY: 25,
        angle: Math.PI * 0.1,
        elevation: 0.4,
        color: '#aaccff',
        textureProfile: 'blueWhite',
        starType: 'single',
        hasPlanets: false
    },
    trappist1: {
        distanceLY: 39,
        angle: Math.PI * 1.4,
        elevation: -0.1,
        color: '#ff6633',
        textureProfile: 'redDwarf',
        starType: 'single',
        hasPlanets: true
    },
    tauCeti: {
        distanceLY: 11.9,
        angle: Math.PI * 0.6,
        elevation: 0.15,
        color: '#ffdd66',
        textureProfile: 'yellow',
        starType: 'single',
        hasPlanets: true
    },
    procyon: {
        distanceLY: 11.5,
        angle: Math.PI * 1.1,
        elevation: -0.2,
        color: '#ffffcc',
        textureProfile: 'white',
        starType: 'binary',
        hasPlanets: false
    },
    arcturus: {
        distanceLY: 36.7,
        angle: Math.PI * 1.7,
        elevation: 0.35,
        color: '#ff8833',
        textureProfile: 'orange',
        starType: 'single',
        hasPlanets: false
    }
};

// ============ 银河系尺度恒星配置 ============
// 位置相对于 SOLAR_SYSTEM_POS，offset 为场景单位偏移方向
const galacticStarConfigs = {
    betelgeuse: {
        distanceLY: 700,
        zone: 'A',
        color: '#ff4444',
        textureProfile: 'betelgeuse',
        size: 'supergiant',
        hasPlanets: false,
        offset: { x: 0.6, y: 0.2, z: -0.8 }
    },
    antares: {
        distanceLY: 550,
        zone: 'A',
        color: '#ff4444',
        textureProfile: 'antares',
        size: 'supergiant',
        hasPlanets: false,
        offset: { x: -0.7, y: -0.1, z: 0.7 }
    },
    kepler452: {
        distanceLY: 1400,
        zone: 'A',
        color: '#ffcc00',
        textureProfile: 'sun',
        size: 'normal',
        hasPlanets: true,
        offset: { x: 0.3, y: 0.05, z: 0.95 }
    },
    vyCanisMajoris: {
        distanceLY: 3900,
        zone: 'A',
        color: '#ff3333',
        textureProfile: 'redSupergiant',
        size: 'hypergiant',
        hasPlanets: false,
        offset: { x: -0.5, y: 0.1, z: -0.85 }
    },
    uyScuti: {
        distanceLY: 9500,
        zone: 'B',
        color: '#ff3333',
        textureProfile: 'redSupergiant',
        size: 'hypergiant',
        hasPlanets: false,
        offset: { x: 0.8, y: -0.05, z: 0.6 }
    },
    pistolStar: {
        distanceLY: 25000,
        zone: 'B',
        color: '#4488ff',
        textureProfile: 'blueWhite',
        size: 'hypergiant',
        hasPlanets: false,
        offset: { x: -0.95, y: 0.0, z: -0.3 }
    }
};

// ============ 恒星纹理配置 ============
const starTextureProfiles = {
    sun: 'textures/sun.jpg',
    yellow: 'textures/stars/yellow_star_surface.jpg',
    orange: 'textures/stars/orange_star_surface.jpg',
    redDwarf: 'textures/stars/red_dwarf_surface.jpg',
    blueWhite: 'textures/stars/blue_white_star_surface.jpg',
    white: 'textures/stars/white_star_surface.jpg',
    betelgeuse: 'textures/stars/betelgeuse_surface.jpg',
    antares: 'textures/stars/antares_surface.jpg',
    redSupergiant: 'textures/stars/red_supergiant_surface.jpg'
};

// ============ 星系数据 ============
const galaxyData = {
    lmc: {
        name: '大麦哲伦云',
        nameEn: 'Large Magellanic Cloud',
        type: '不规则星系',
        distance: '16万光年',
        diameter: '1.4万光年',
        stars: '约300亿颗',
        description: '银河系最大的卫星星系，肉眼可见于南半球夜空。',
        funFact: '大麦哲伦云正在与银河系发生引力相互作用，未来可能被银河系吞噬！'
    },
    smc: {
        name: '小麦哲伦云',
        nameEn: 'Small Magellanic Cloud',
        type: '不规则矮星系',
        distance: '20万光年',
        diameter: '7000光年',
        stars: '约30亿颗',
        description: '银河系的另一个卫星星系，与大麦哲伦云是"姐妹星系"。',
        funFact: '小麦哲伦云是航海家麦哲伦在环球航行时记录的，因此得名！'
    },
    andromeda: {
        name: '仙女座星系',
        nameEn: 'Andromeda Galaxy (M31)',
        type: '棒旋星系',
        distance: '254万光年',
        diameter: '22万光年',
        stars: '约1万亿颗',
        description: '本星系群中最大的星系，肉眼可见的最远天体。',
        funFact: '仙女座星系正以每秒300公里的速度向银河系靠近，约45亿年后将与银河系碰撞合并！'
    },
    triangulum: {
        name: '三角座星系',
        nameEn: 'Triangulum Galaxy (M33)',
        type: '螺旋星系',
        distance: '300万光年',
        diameter: '6万光年',
        stars: '约400亿颗',
        description: '本星系群第三大星系，拥有活跃的恒星形成区域。',
        funFact: '三角座星系可能是仙女座星系的卫星星系，它们之间有氢气桥连接！'
    },
    sombrero: {
        name: '草帽星系',
        nameEn: 'Sombrero Galaxy (M104)',
        type: '螺旋星系',
        distance: '2900万光年',
        diameter: '5万光年',
        stars: '约8000亿颗',
        description: '因其独特的侧面视角和明亮的核心而得名。',
        funFact: '草帽星系的中心黑洞质量是太阳的10亿倍，是银河系中心黑洞的250倍！'
    },
    whirlpool: {
        name: '漩涡星系',
        nameEn: 'Whirlpool Galaxy (M51)',
        type: '螺旋星系',
        distance: '2300万光年',
        diameter: '6万光年',
        stars: '约1000亿颗',
        description: '经典的正面螺旋星系，旋臂结构清晰可见。',
        funFact: '漩涡星系正在与旁边的小星系NGC 5195发生引力交互，这使它的旋臂特别明显！'
    },
    centaurusA: {
        name: '半人马座A',
        nameEn: 'Centaurus A',
        type: '椭圆星系',
        distance: '1200万光年',
        diameter: '6万光年',
        stars: '约3000亿颗',
        description: '最近的活跃星系核之一，中心喷射强大的射电喷流。',
        funFact: '半人马座A的射电喷流延伸超过100万光年，是宇宙中最壮观的景象之一！'
    },
    antennae: {
        name: '触须星系',
        nameEn: 'Antennae Galaxies',
        type: '碰撞星系',
        distance: '4500万光年',
        diameter: '共约10万光年',
        stars: '数千亿颗',
        description: '两个正在碰撞合并的螺旋星系，呈现独特的"触须"形态。',
        funFact: '触须星系是银河系与仙女座星系未来碰撞的预演，展示了星系合并的壮观过程！'
    },
    // ===== 10 个近邻星系扩充 =====
    sgrDsph: {
        name: '人马座矮椭球',
        nameEn: 'Sagittarius Dwarf (Sgr dSph)',
        type: '矮椭球星系',
        distance: '约7万光年',
        diameter: '1万光年',
        stars: '数亿颗',
        description: '银河系最近的卫星星系之一，正在被银河系的潮汐力撕裂吞噬。',
        funFact: '人马座矮椭球的恒星正沿着一条"潮汐流"散落在银河系周围，环绕银河整整一圈！'
    },
    sculptorDwarf: {
        name: '玉夫座矮星系',
        nameEn: 'Sculptor Dwarf',
        type: '矮椭球星系',
        distance: '29万光年',
        diameter: '约3000光年',
        stars: '数百万颗',
        description: '银河系的卫星矮星系之一，几乎只剩老年恒星。',
        funFact: '玉夫座矮星系含有大量"暗物质"，质量是其可见恒星的几十倍！'
    },
    leoI: {
        name: '狮子座 I 矮星系',
        nameEn: 'Leo I Dwarf',
        type: '矮椭球星系',
        distance: '82万光年',
        diameter: '约2000光年',
        stars: '数百万颗',
        description: '本星系群中距离最远的银河系卫星之一。',
        funFact: '狮子座 I 是本星系群中最孤立的矮星系之一，可能并不真的属于银河系。'
    },
    ngc6822: {
        name: '巴纳德星系',
        nameEn: 'Barnard\'s Galaxy (NGC 6822)',
        type: '不规则矮星系',
        distance: '160万光年',
        diameter: '约7000光年',
        stars: '约10亿颗',
        description: '由天文学家爱德华·巴纳德于1884年发现，本星系群中较活跃的矮星系。',
        funFact: '巴纳德星系含有许多明亮的恒星形成区，颇似一个迷你麦哲伦云。'
    },
    ic10: {
        name: 'IC 10 星系',
        nameEn: 'IC 10',
        type: '不规则矮星系',
        distance: '220万光年',
        diameter: '约5000光年',
        stars: '约10亿颗',
        description: '本星系群中唯一已知的星暴矮星系，恒星诞生极其活跃。',
        funFact: 'IC 10 拥有罕见高密度的沃尔夫–拉叶星，是研究大质量恒星演化的天然实验室！'
    },
    ic1613: {
        name: 'IC 1613 星系',
        nameEn: 'IC 1613',
        type: '不规则矮星系',
        distance: '240万光年',
        diameter: '约1万光年',
        stars: '约1亿颗',
        description: '本星系群边缘的孤立矮星系，几乎不含尘埃，是观测变星的"标准烛光"。',
        funFact: 'IC 1613 因为没有尘埃遮挡，是天文学家测量宇宙距离的金标准！'
    },
    m32: {
        name: 'M32 矮椭圆星系',
        nameEn: 'M32 (NGC 221)',
        type: '致密椭圆星系',
        distance: '254万光年',
        diameter: '约6500光年',
        stars: '约30亿颗',
        description: '紧邻仙女座星系的一颗致密卫星，曾是被仙女座剥离的星系核。',
        funFact: 'M32 中心也藏着一颗超大质量黑洞，质量约为太阳的250万倍！'
    },
    m110: {
        name: 'M110 矮椭圆星系',
        nameEn: 'M110 (NGC 205)',
        type: '矮椭圆星系',
        distance: '270万光年',
        diameter: '约1.7万光年',
        stars: '约90亿颗',
        description: '仙女座星系的另一颗著名卫星，比 M32 更松散。',
        funFact: 'M110 是为数不多含有尘埃带和年轻恒星的椭圆星系！'
    },
    ngc253: {
        name: '玉夫座星系',
        nameEn: 'Sculptor Galaxy (NGC 253)',
        type: '中间型螺旋星系',
        distance: '1100万光年',
        diameter: '约9万光年',
        stars: '约3000亿颗',
        description: '玉夫座星系群最亮的成员，南天最壮观的螺旋星系之一。',
        funFact: 'NGC 253 是著名的"星暴星系"，中心区域恒星形成速度是银河系的数十倍！'
    },
    m81m82: {
        name: 'M81 & 雪茄星系',
        nameEn: 'M81 & M82 (Cigar Galaxy)',
        type: '互动双星系',
        distance: '1200万光年',
        diameter: '约15万光年',
        stars: '数千亿颗',
        description: 'M81 是宏伟的螺旋星系，M82（雪茄星系）则因受 M81 引力扰动正在剧烈爆发恒星形成。',
        funFact: 'M81 与 M82 在数亿年前曾近距离相擦，扰动至今未平息！'
    }
};

// ============ 星系渲染配置 ============
const galaxyRenderConfigs = {
    lmc: {
        position: new THREE.Vector3(25000, 3000, -20000),
        radius: 3500,
        particleCount: 2000,
        type: 'irregular',
        color: { r: 0.6, g: 0.8, b: 1.0 },
        zone: 'A'
    },
    smc: {
        position: new THREE.Vector3(30000, -2000, -25000),
        radius: 2000,
        particleCount: 1500,
        type: 'irregular',
        color: { r: 0.7, g: 0.85, b: 1.0 },
        zone: 'A'
    },
    andromeda: {
        position: new THREE.Vector3(-120000, 10000, 80000),
        radius: 22000,
        particleCount: 16000,
        type: 'spiral',
        arms: 2,
        tightness: 0.45,
        armWidth: 0.55,
        color: { r: 1.0, g: 0.9, b: 0.7 },
        tilt: { x: 0.3, z: 0.2 },
        zone: 'A'
    },
    triangulum: {
        position: new THREE.Vector3(-100000, -5000, 120000),
        radius: 12000,
        particleCount: 8000,
        type: 'spiral',
        arms: 3,
        tightness: 0.42,
        armWidth: 0.6,
        hasBar: false,
        color: { r: 0.8, g: 0.9, b: 1.0 },
        tilt: { x: -0.2, z: 0.4 },
        zone: 'A'
    },
    sombrero: {
        position: new THREE.Vector3(200000, 30000, -150000),
        radius: 10000,
        particleCount: 6000,
        type: 'spiral',
        arms: 2,
        tightness: 0.5,
        hasBar: false,
        color: { r: 1.0, g: 0.85, b: 0.6 },
        tilt: { x: 1.4, z: 0.1 }, // 几乎侧面
        zone: 'B'
    },
    whirlpool: {
        position: new THREE.Vector3(-180000, -20000, -200000),
        radius: 12000,
        particleCount: 9000,
        type: 'spiral',
        arms: 2,
        tightness: 0.36,
        armWidth: 0.5,
        hasBar: false,
        color: { r: 0.9, g: 0.95, b: 1.0 },
        tilt: { x: 0.1, z: 0.05 }, // 正面
        zone: 'B'
    },
    centaurusA: {
        position: new THREE.Vector3(150000, -40000, 100000),
        radius: 12000,
        particleCount: 3000,
        type: 'elliptical',
        flatten: 0.78,
        color: { r: 1.0, g: 0.8, b: 0.5 },
        dustLane: { tilt: 0.5 }, // 半人马座 A 的著名横贯尘埃带
        zone: 'B'
    },
    antennae: {
        position: new THREE.Vector3(-250000, 50000, 180000),
        radius: 15000,
        particleCount: 4500,
        type: 'interacting',
        color: { r: 0.85, g: 0.9, b: 1.0 },
        zone: 'B'
    },
    // ===== 银河系卫星矮星系（zone LOCAL，始终可见，方便从任何角度观察）=====
    sgrDsph: {
        position: new THREE.Vector3(3500, -3200, 1000),
        radius: 700,
        particleCount: 800,
        type: 'irregular',
        elongation: 1.0,
        color: { r: 1.0, g: 0.85, b: 0.7 },
        hiiCount: 2,
        zone: 'LOCAL'
    },
    sculptorDwarf: {
        position: new THREE.Vector3(8500, -10000, 4500),
        radius: 600,
        particleCount: 700,
        type: 'elliptical',
        flatten: 0.85,
        color: { r: 1.0, g: 0.85, b: 0.65 },
        zone: 'LOCAL'
    },
    leoI: {
        position: new THREE.Vector3(-22000, 26000, -7000),
        radius: 800,
        particleCount: 800,
        type: 'elliptical',
        flatten: 0.9,
        color: { r: 1.0, g: 0.82, b: 0.6 },
        zone: 'A'
    },
    // ===== 本星系群其他成员 =====
    ngc6822: {
        position: new THREE.Vector3(46000, -38000, -82000),
        radius: 1500,
        particleCount: 1400,
        type: 'irregular',
        elongation: 0.9,
        color: { r: 0.75, g: 0.85, b: 1.0 },
        zone: 'A'
    },
    ic10: {
        position: new THREE.Vector3(-92000, 18000, 58000),
        radius: 1400,
        particleCount: 1300,
        type: 'irregular',
        elongation: 0.7,
        color: { r: 0.75, g: 0.9, b: 1.0 },
        hiiCount: 14,
        zone: 'A'
    },
    ic1613: {
        position: new THREE.Vector3(-46000, 52000, -125000),
        radius: 1500,
        particleCount: 1200,
        type: 'irregular',
        elongation: 1.1,
        color: { r: 0.8, g: 0.88, b: 1.0 },
        zone: 'A'
    },
    m32: {
        // 紧邻仙女座（仙女座位置 -120000, 10000, 80000）
        position: new THREE.Vector3(-118000, 8500, 76000),
        radius: 1100,
        particleCount: 900,
        type: 'elliptical',
        flatten: 0.7,
        color: { r: 1.0, g: 0.85, b: 0.6 },
        zone: 'A'
    },
    m110: {
        position: new THREE.Vector3(-124000, 12000, 84500),
        radius: 1500,
        particleCount: 1100,
        type: 'elliptical',
        flatten: 0.55,
        color: { r: 1.0, g: 0.88, b: 0.7 },
        zone: 'A'
    },
    // ===== 本星系群外（zone B，远视角）=====
    ngc253: {
        position: new THREE.Vector3(80000, -100000, 30000),
        radius: 7000,
        particleCount: 3500,
        type: 'spiral',
        arms: 2,
        tightness: 0.46,
        armWidth: 0.6,
        hasBar: false,
        color: { r: 1.0, g: 0.9, b: 0.7 },
        tilt: { x: 1.1, z: 0.2 }, // 接近侧视
        zone: 'B'
    },
    m81m82: {
        position: new THREE.Vector3(-160000, 90000, -110000),
        radius: 11000,
        particleCount: 5000,
        type: 'pair',
        color: { r: 0.95, g: 0.92, b: 0.85 },
        zone: 'B'
    }
};

// ============ 星系 Dock 配置 ============
const galaxyDockItems = [
    { key: 'galacticCenter', name: '银河系中心黑洞', shortName: '黑洞', tone: 'black-hole' },
    { key: 'lmc', shortName: '大麦' },
    { key: 'smc', shortName: '小麦' },
    { key: 'sgrDsph', shortName: '人马' },
    { key: 'sculptorDwarf', shortName: '玉夫' },
    { key: 'leoI', shortName: '狮I' },
    { key: 'andromeda', shortName: '仙女' },
    { key: 'triangulum', shortName: '三角' },
    { key: 'm32', shortName: 'M32' },
    { key: 'm110', shortName: 'M110' },
    { key: 'ngc6822', shortName: '巴纳' },
    { key: 'ic10', shortName: 'IC10' },
    { key: 'ic1613', shortName: 'IC1613' },
    { key: 'sombrero', shortName: '草帽' },
    { key: 'whirlpool', shortName: '漩涡' },
    { key: 'centaurusA', shortName: '半A' },
    { key: 'ngc253', shortName: '玉夫座' },
    { key: 'm81m82', shortName: 'M81' },
    { key: 'antennae', shortName: '触须' }
];

// ============ 信息面板内容 ============
const infoPanelContent = {
    solarSystem: {
        title: '🌌 银河系',
        paragraphs: [
            '银河系是一个棒旋星系，直径约<span class="highlight">10万光年</span>，包含<span class="highlight">2000-4000亿</span>颗恒星。',
            '太阳系位于<span class="highlight">猎户臂</span>上，距离银河系中心约<span class="highlight">26000光年</span>。',
            '银河系中心是一个超大质量黑洞——<span class="highlight">人马座A*</span>，质量约为太阳的400万倍。'
        ]
    },
    galacticCenter: {
        title: '🕳️ 银河系中心黑洞',
        paragraphs: [
            '<span class="highlight">人马座A*</span>位于银河系正中央，是一个超大质量黑洞。',
            '它的质量约为<span class="highlight">400万个太阳</span>，周围的恒星会围着它高速绕行。',
            '这里不是太阳系附近，而是银河系最深处的核心区域。'
        ]
    },
    localNeighbors: {
        title: '🌌 银河系近邻',
        paragraphs: [
            '银河系并不孤独！在它周围有多个<span class="highlight">卫星星系</span>环绕运行。',
            '<span class="highlight">大麦哲伦云</span>和<span class="highlight">小麦哲伦云</span>是最著名的两个，在南半球可以用肉眼看到。',
            '这些矮星系正被银河系的引力牵引，未来可能与银河系合并。'
        ]
    },
    solarNeighborhood: {
        title: '⭐ 太阳系邻域（放大视图）',
        paragraphs: [
            '欢迎进入太阳系邻域的<span class="highlight">放大视图</span>！这里展示了太阳周围<span class="highlight">40光年</span>内的恒星邻居。',
            '<span class="highlight">半人马座α</span>（4.37光年）是最近的恒星系统；<span class="highlight">天狼星</span>（8.6光年）是夜空最亮的恒星。',
            '虚线表示到太阳的距离。<span class="highlight">绿色光环</span>标记有已确认行星的恒星。点击恒星了解更多！'
        ]
    },
    localGroup: {
        title: '🌌 本星系群 Local Group',
        paragraphs: [
            '银河系属于<span class="highlight">本星系群</span>，跨度约<span class="highlight">1000万光年</span>，包含 50 多个星系。',
            '<span class="highlight">仙女座 M31</span>与<span class="highlight">银河系</span>是两位主角，共有约 30 颗矮卫星：<span class="highlight">M32 / M110 / 大小麦哲伦云 / 人马座矮椭球 / 玉夫座矮 / 巴纳德 / IC 10 / IC 1613</span> 等。',
            '约<span class="highlight">45亿年后</span>，仙女座与银河系将发生壮观的碰撞合并，形成"银仙系"。'
        ]
    },
    virgo: {
        title: '🌌 室女座星系团 Virgo Cluster',
        paragraphs: [
            '本星系群属于更大的<span class="highlight">室女座超星系团</span>，距离我们约<span class="highlight">5400万光年</span>。',
            '室女座星系团包含<span class="highlight">1300+ 个星系</span>，中心是巨型椭圆<span class="highlight">M87</span> —— 它的超大质量黑洞是人类拍到的第一张黑洞照片！',
            '银河系正以每秒约 600 km 的速度朝它的方向"坠落"。'
        ]
    },
    laniakea: {
        title: '🌌 拉尼亚凯亚超星系团 Laniakea',
        paragraphs: [
            '继续放大，本星系群、室女座星系团都只是<span class="highlight">拉尼亚凯亚超星系团</span>的一根丝。',
            '拉尼亚凯亚跨越<span class="highlight">5亿光年</span>，由<span class="highlight">10万个星系</span>组成宇宙网，所有成员都向中心的<span class="highlight">巨引源 Great Attractor</span>缓慢流动。',
            '它的名字在夏威夷语中意为"<span class="highlight">辽阔的天空</span>"——2014 年才被绘制出来，是人类已知最大的家园结构！'
        ]
    },
    universe: {
        title: '🌌 可观测宇宙 Observable Universe',
        paragraphs: [
            '我们能"看到"的整个宇宙是一个直径约<span class="highlight">930亿光年</span>的球形区域。',
            '其中估计有<span class="highlight">2 万亿个星系</span>、上百万亿亿颗恒星。',
            '球壳之外的部分因为光速极限，永远无法到达我们的眼睛——但宇宙本身或许还要大得多得多。'
        ]
    }
};

// ============ 获取恒星纹理 ============
function getStarTexture(textureProfile) {
    const texturePath = starTextureProfiles[textureProfile];
    if (!texturePath || !textureLoader) return null;

    if (!starTextureCache.has(texturePath)) {
        const texture = textureLoader.load(texturePath);
        texture.encoding = THREE.sRGBEncoding;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = renderer ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 1;
        starTextureCache.set(texturePath, texture);
    }

    return starTextureCache.get(texturePath);
}

// ============ 创建恒星表面材质 ============
function createStarSurfaceMaterial(fallbackColor, textureProfile) {
    const texture = getStarTexture(textureProfile);
    const material = new THREE.MeshBasicMaterial(
        texture
            ? {
                map: texture,
                color: 0xffffff
            }
            : {
                color: new THREE.Color(fallbackColor)
            }
    );

    material.userData.baseOpacity = 1.0;
    return material;
}

// ============ 银河系公转辅助 ============
function getGalacticOrbitSpeedFactor(radius) {
    if (!radius) return 1;
    return THREE.MathUtils.clamp(1.1 - (radius / 40000) * 0.28, 0.86, 1.08);
}

function registerGalacticOrbit(object, anchor, options = {}) {
    if (!object || !anchor) return;

    const orbitRadius = Math.hypot(anchor.x, anchor.z);
    object.userData.galacticOrbit = {
        orbitRadius,
        angleOffset: Math.atan2(anchor.z, anchor.x),
        baseY: anchor.y,
        speedFactor: options.speedFactor !== undefined ? options.speedFactor : getGalacticOrbitSpeedFactor(orbitRadius),
        bobAmplitude: options.bobAmplitude || 0,
        bobSpeedFactor: options.bobSpeedFactor || 0.6,
        bobPhase: options.bobPhase !== undefined ? options.bobPhase : Math.random() * Math.PI * 2
    };
}

function updateGalacticOrbit(object, diskAngle, elapsed) {
    if (!object || !object.userData.galacticOrbit) return;

    const orbit = object.userData.galacticOrbit;
    const angle = orbit.angleOffset - diskAngle * orbit.speedFactor;
    const yOffset = orbit.bobAmplitude > 0
        ? Math.sin(elapsed * orbit.bobSpeedFactor + orbit.bobPhase) * orbit.bobAmplitude
        : 0;

    object.position.set(
        Math.cos(angle) * orbit.orbitRadius,
        orbit.baseY + yOffset,
        Math.sin(angle) * orbit.orbitRadius
    );
}

function registerNeighborhoodOffset(object, localOffset) {
    if (!object) return;
    object.userData.neighborhoodOffset = localOffset.clone();
}

function getSolarSystemWorldPosition(target = new THREE.Vector3()) {
    if (solarSystem) {
        solarSystem.getWorldPosition(target);
        return target;
    }

    return target.copy(SOLAR_SYSTEM_POS);
}

function getGalacticMotionScale(distance, distToSolarSystem) {
    if (motionPaused) {
        return 0;
    }

    if (focusedControlsObject && focusedControlsObject.userData && focusedControlsObject.userData.galacticOrbit) {
        return 0.02;
    }

    if (distToSolarSystem < NEIGHBORHOOD_THRESHOLD * 1.8) {
        return 0.02;
    }

    if (distToSolarSystem < 3000) {
        return 0.08;
    }

    if (distance < 15000) {
        return 0.45;
    }

    return 1;
}

function updateMotionToggleButton() {
    const motionToggle = document.getElementById('motionToggle');
    if (!motionToggle) return;

    const icon = motionToggle.querySelector('.motion-toggle-icon');
    const label = motionToggle.querySelector('.motion-toggle-label');

    motionToggle.classList.toggle('paused', motionPaused);
    motionToggle.setAttribute('aria-pressed', motionPaused ? 'true' : 'false');

    if (icon) {
        icon.textContent = motionPaused ? '▶️' : '⏸️';
    }

    if (label) {
        label.textContent = motionPaused ? '继续转动' : '暂停转动';
    }
}

function toggleGalacticMotion() {
    motionPaused = !motionPaused;
    updateMotionToggleButton();
}

// ============ 星系语音介绍 ============
function stopGalaxyAudio() {
    if (currentGalaxyAudio) {
        currentGalaxyAudio.pause();
        currentGalaxyAudio = null;
    }

    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}

function getGalaxyNarrationText(key) {
    if (key === 'galacticCenter') {
        return '银河系中心黑洞，人马座A星。它位于银河系正中央，是一个超大质量黑洞。它的质量约为400万个太阳，周围的恒星会围着它高速绕行。这里是银河系最深处的核心区域。';
    }

    const data = galaxyData[key];
    if (!data) return '';

    return `${data.name}。它是${data.type}，距离我们${data.distance}，直径${data.diameter}，恒星数量${data.stars}。${data.description}${data.funFact}`;
}

function playGalaxyAudio(key) {
    const fallbackText = getGalaxyNarrationText(key);
    if (!fallbackText) return;

    stopGalaxyAudio();

    const audio = new Audio(`audio/galaxy/${key}.mp3`);
    currentGalaxyAudio = audio;

    audio.play().catch(() => {
        if (!window.speechSynthesis) return;

        const utterance = new SpeechSynthesisUtterance(fallbackText);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    });
}

// ============ 星系 Dock ============
function renderGalaxyDock() {
    const track = document.getElementById('galaxyDockTrack');
    if (!track) return;

    track.innerHTML = galaxyDockItems.map(item => {
        const data = galaxyData[item.key] || {};
        const name = item.name || data.name || item.shortName;
        const tone = item.tone || getGalaxyDockTone(item.key);
        return `
            <button class="galaxy-dock-dot ${tone}" type="button" data-galaxy-key="${item.key}" data-name="${name}" title="${name}" aria-label="进入${name}">
                ${item.shortName}
            </button>
        `;
    }).join('');
}

function setupGalaxyDock() {
    const track = document.getElementById('galaxyDockTrack');
    if (!track) return;

    track.addEventListener('click', event => {
        const button = event.target.closest('.galaxy-dock-dot');
        if (!button) return;

        event.stopPropagation();
        selectGalaxyDockTarget(button.dataset.galaxyKey, button);
    });
}

function getGalaxyDockTone(key) {
    const type = galaxyRenderConfigs[key]?.type;
    if (type === 'spiral') return 'spiral';
    if (type === 'elliptical') return 'elliptical';
    if (type === 'interacting' || type === 'pair') return 'interacting';
    return 'irregular';
}

function setActiveGalaxyDockItem(key) {
    document.querySelectorAll('.galaxy-dock-dot').forEach(button => {
        button.classList.toggle('active', button.dataset.galaxyKey === key);
    });
}

function selectGalaxyDockTarget(key, button) {
    if (!key) return;

    setActiveGalaxyDockItem(key);
    hideGalaxyPopup();
    hideStarSystemPopup();

    if (key === 'galacticCenter') {
        focusGalacticBlackHoleFromDock();
        return;
    }

    const galaxy = externalGalaxies.find(item => item.key === key);
    if (!galaxy) return;

    focusDockObject(galaxy, getGalaxyDockViewDistance(galaxy));

    if (button) {
        const rect = button.getBoundingClientRect();
        showGalaxyPopup(key, rect.left + rect.width / 2, rect.top);
    }
}

function getGalaxyDockViewDistance(galaxy) {
    const radius = galaxy.config?.radius || 2500;
    if (galaxy.config?.zone === 'LOCAL') {
        return Math.max(radius * 8, 4200);
    }
    return Math.max(radius * 4.5, 10000);
}

function focusDockObject(object, viewDistance) {
    if (!object) return;

    const targetPoint = new THREE.Vector3();
    object.getWorldPosition(targetPoint);
    animateCameraToPoint(targetPoint, viewDistance, () => {
        focusControlsOnObject(object, { immediate: true });
        updateScaleIndicator();
    });
}

function focusGalacticBlackHoleFromDock() {
    const targetPoint = GALACTIC_CENTER.clone();
    playGalaxyAudio('galacticCenter');
    animateCameraToPoint(targetPoint, 2200, () => {
        setControlsFocus(targetPoint, { immediate: true });
        updateScaleIndicator();
    });
}

function animateCameraToPoint(targetPoint, viewDistance, onComplete) {
    if (!targetPoint) return;

    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    const viewDirection = new THREE.Vector3(0.68, 0.42, 0.72).normalize();
    const targetPosition = targetPoint.clone().add(viewDirection.multiplyScalar(viewDistance));
    const duration = 1400;
    const startTime = Date.now();
    clearControlsFocus();

    function animateDockFlight() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const easeT = 1 - Math.pow(1 - t, 3);

        camera.position.lerpVectors(startPosition, targetPosition, easeT);
        controls.target.lerpVectors(startTarget, targetPoint, easeT);
        controls.update();

        if (t < 1) {
            requestAnimationFrame(animateDockFlight);
        } else if (onComplete) {
            onComplete();
        }
    }

    animateDockFlight();
}

function updateNeighborhoodSystemPositions(solarPosition) {
    for (const starSystem of neighborhoodStarSystems) {
        const localOffset = starSystem.userData.neighborhoodOffset;
        if (!localOffset) continue;

        starSystem.position.copy(solarPosition).add(localOffset);
    }
}

function updateNeighborhoodDistanceLines(solarPosition) {
    for (const starSystem of neighborhoodStarSystems) {
        if (!starSystem.distanceLine) continue;

        const linePositions = starSystem.distanceLine.geometry.attributes.position;
        const starPosition = starSystem.getWorldPosition(tempLineEndPosition);
        linePositions.setXYZ(0, solarPosition.x, solarPosition.y, solarPosition.z);
        linePositions.setXYZ(1, starPosition.x, starPosition.y, starPosition.z);
        linePositions.needsUpdate = true;
    }
}

function updateGalacticMotion(elapsed) {
    const diskAngle = milkyWay ? milkyWay.rotation.y : 0;

    updateGalacticOrbit(solarSystem, diskAngle, elapsed);
    updateGalacticOrbit(heliopause, diskAngle, elapsed);
    updateGalacticOrbit(oortCloud, diskAngle, elapsed);

    for (const starSystem of starSystems) {
        updateGalacticOrbit(starSystem, diskAngle, elapsed);
    }

    const solarPosition = getSolarSystemWorldPosition(tempSolarSystemPosition);
    updateNeighborhoodSystemPositions(solarPosition);
    updateNeighborhoodDistanceLines(solarPosition);
}

// ============ 宇宙级结构 LOD（淡入淡出）============
function fadeBetween(distance, fadeIn, fullIn, fullOut, fadeOut) {
    if (distance < fadeIn || distance > fadeOut) return 0;
    if (distance < fullIn) return (distance - fadeIn) / (fullIn - fadeIn);
    if (distance > fullOut) return 1 - (distance - fullOut) / (fadeOut - fullOut);
    return 1;
}

function applyOpacityToObject(obj, alpha) {
    obj.traverse(child => {
        if (child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            for (const m of mats) {
                if (m.userData.baseOpacity === undefined) {
                    m.userData.baseOpacity = m.opacity !== undefined ? m.opacity : 1;
                }
                m.opacity = m.userData.baseOpacity * alpha;
                m.transparent = true;
            }
        }
    });
}

function updateCosmicStructures(distance, elapsed) {
    if (!cosmicStructures.localGroup) return;

    // 本星系群边界：80000 起淡入，180000 完整，260000 起淡出，420000 隐
    const lgAlpha = fadeBetween(distance, 80000, 180000, 260000, 420000);
    cosmicStructures.localGroup.visible = lgAlpha > 0.01;
    if (lgAlpha > 0.01) applyOpacityToObject(cosmicStructures.localGroup, lgAlpha);

    // 室女座星系团：250000 起淡入，450000 完整，700000 起淡出，900000 隐
    const vgAlpha = fadeBetween(distance, 250000, 450000, 700000, 900000);
    cosmicStructures.virgo.visible = vgAlpha > 0.01;
    if (vgAlpha > 0.01) applyOpacityToObject(cosmicStructures.virgo, vgAlpha);

    // 拉尼亚凯亚：350000 起淡入，700000 完整，1100000 起淡出，1300000 隐
    const lkAlpha = fadeBetween(distance, 350000, 700000, 1100000, 1300000);
    cosmicStructures.laniakea.visible = lkAlpha > 0.01;
    if (lkAlpha > 0.01) applyOpacityToObject(cosmicStructures.laniakea, lkAlpha);

    // 可观测宇宙球壳：650000 起淡入，1000000 完整，永不淡出
    const universeAlpha = fadeBetween(distance, 650000, 1000000, 2000000, 2500000);
    cosmicStructures.universeShell.visible = universeAlpha > 0.01;
    if (universeAlpha > 0.01) applyOpacityToObject(cosmicStructures.universeShell, universeAlpha);

    // 微旋转，让纤维网有"活的"感觉
    cosmicStructures.laniakea.rotation.y = elapsed * 0.0005;
    cosmicStructures.virgo.rotation.y = elapsed * 0.001;
    cosmicStructures.universeShell.rotation.y = elapsed * 0.0001;
}

// ============ 初始化 ============
function init() {
    clock = new THREE.Clock();
    simulationTime = 0;

    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020208);

    // 创建相机（扩展远裁面，支持宇宙级缩放）
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        3000000
    );
    camera.position.set(0, 12000, 8000);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    textureLoader = new THREE.TextureLoader();

    // 创建控制器（扩展最大距离）
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 100;
    controls.maxDistance = 1500000;
    controls.target.copy(GALACTIC_CENTER);

    // 创建场景内容
    createDistantStars();
    createCosmicStarField();
    createMilkyWay();
    createMilkyWayGlow();
    createGalacticCenter();
    createSolarSystemMarker();
    createHeliopause();
    createOortCloud();
    createExternalGalaxies();
    createCosmicStructures(); // 本星系群/室女座/拉尼亚凯亚/可观测宇宙
    createNeighborhoodStarSystems(); // 创建太阳系邻域视图的恒星
    createGalacticStarSystems(); // 创建银河系尺度的著名恒星
    addLights();

    // 射线检测器
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // 事件监听
    window.addEventListener('resize', onWindowResize);
    controls.addEventListener('change', updateScaleIndicator);
    renderer.domElement.addEventListener('click', onCanvasClick);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.style.cursor = 'pointer';

    // 弹窗关闭按钮事件
    const closeBtn = document.querySelector('.galaxy-popup-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideGalaxyPopup);
    }

    // 恒星系统弹窗关闭按钮事件
    const starCloseBtn = document.querySelector('.star-popup-close');
    if (starCloseBtn) {
        starCloseBtn.addEventListener('click', hideStarSystemPopup);
    }

    // 点击空白处关闭弹窗
    document.addEventListener('click', (e) => {
        const galaxyPopup = document.getElementById('galaxyPopup');
        const starPopup = document.getElementById('starSystemPopup');

        // 检查是否点击了弹窗外部
        const clickedOutsideGalaxyPopup = galaxyPopup && galaxyPopup.classList.contains('visible') &&
            !galaxyPopup.contains(e.target);
        const clickedOutsideStarPopup = starPopup && starPopup.classList.contains('visible') &&
            !starPopup.contains(e.target);

        if ((clickedOutsideGalaxyPopup || clickedOutsideStarPopup) &&
            e.target.closest('#canvas-container')) {
            // 延迟检查，避免与点击冲突
            setTimeout(() => {
                raycaster.setFromCamera(mouse, camera);
                let hitObject = false;

                // 检查是否点击了恒星系统（包括邻域恒星）
                for (const starSystem of starSystems) {
                    if (starSystem.clickTarget && starSystem.visible) {
                        const intersects = raycaster.intersectObject(starSystem.clickTarget);
                        if (intersects.length > 0) {
                            hitObject = true;
                            break;
                        }
                    }
                }

                // 检查邻域恒星系统（当处于邻域视图时）
                if (!hitObject && isNeighborhoodView) {
                    for (const starSystem of neighborhoodStarSystems) {
                        if (starSystem.clickTarget && starSystem.visible && starSystem.name !== 'neighborhoodSun') {
                            const intersects = raycaster.intersectObject(starSystem.clickTarget);
                            if (intersects.length > 0) {
                                hitObject = true;
                                break;
                            }
                        }
                    }
                }

                // 检查是否点击了星系
                if (!hitObject) {
                    for (const galaxy of externalGalaxies) {
                        if (galaxy.clickTarget && galaxy.visible) {
                            const intersects = raycaster.intersectObject(galaxy.clickTarget);
                            if (intersects.length > 0) {
                                hitObject = true;
                                break;
                            }
                        }
                    }
                }

                if (!hitObject) {
                    hideGalaxyPopup();
                    hideStarSystemPopup();
                }
            }, 50);
        }
    });

    // 回到银河系按钮
    const returnBtn = document.getElementById('returnToMilkyWay');
    if (returnBtn) {
        returnBtn.addEventListener('click', returnToMilkyWay);
    }

    const motionToggle = document.getElementById('motionToggle');
    if (motionToggle) {
        motionToggle.addEventListener('click', toggleGalacticMotion);
        updateMotionToggleButton();
    }

    renderGalaxyDock();
    setupGalaxyDock();

    // 隐藏加载画面
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 2000);

    // 开始动画
    animate();
}

// ============ 创建远景星空 ============
function createDistantStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 10000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        const radius = 30000 + Math.random() * 20000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2,
        transparent: true,
        opacity: 0.6
    });

    starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
}

// ============ 创建宇宙深空背景星空 ============
function createCosmicStarField() {
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 15000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        const radius = 200000 + Math.random() * 200000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 3,
        transparent: true,
        opacity: 0.4
    });

    cosmicStarField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(cosmicStarField);
}

// ============ 创建银河系 ============
function createMilkyWay() {
    const galaxyRadius = 10000;

    milkyWay = new THREE.Group();

    // === 1. Canvas 生成银河系纹理 ===
    const texSize = 2048;
    const canvas = document.createElement('canvas');
    canvas.width = texSize;
    canvas.height = texSize;
    const ctx = canvas.getContext('2d');

    // 简易噪声函数
    function hash(x, y) {
        const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
        return n - Math.floor(n);
    }
    // 平滑噪声（双线性插值）
    function smoothNoise(x, y) {
        const ix = Math.floor(x), iy = Math.floor(y);
        const fx = x - ix, fy = y - iy;
        const a = hash(ix, iy), b = hash(ix + 1, iy);
        const c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
        const ux = fx * fx * (3 - 2 * fx);
        const uy = fy * fy * (3 - 2 * fy);
        return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
    }
    function fbm(x, y, oct) {
        let v = 0, amp = 0.5, freq = 1;
        for (let i = 0; i < oct; i++) {
            v += amp * smoothNoise(x * freq, y * freq);
            amp *= 0.5; freq *= 2.0;
        }
        return v;
    }

    // 填充黑色背景
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, texSize, texSize);
    const imgData = ctx.getImageData(0, 0, texSize, texSize);
    const px = imgData.data;
    const cx = texSize / 2, cy = texSize / 2;

    for (let py = 0; py < texSize; py++) {
        for (let pxx = 0; pxx < texSize; pxx++) {
            const dx = (pxx - cx) / cx; // -1..1
            const dy = (py - cy) / cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 1.05) continue;

            const angle = Math.atan2(dy, dx);
            const idx = (py * texSize + pxx) * 4;

            // --- 中央核球（紧凑椭球，暖黄/橙色） ---
            const bulgeA = 0.14, bulgeB = 0.10;
            const bulgeAngle = 0.45;
            const cosBa = Math.cos(bulgeAngle), sinBa = Math.sin(bulgeAngle);
            const rotDx = dx * cosBa + dy * sinBa;
            const rotDy = -dx * sinBa + dy * cosBa;
            const bulgeDist = Math.sqrt((rotDx / bulgeA) ** 2 + (rotDy / bulgeB) ** 2);
            const bulge = Math.exp(-bulgeDist * bulgeDist * 2.0);

            // --- 中央棒状结构（连接核球和旋臂起点） ---
            const barLen = 0.20, barW = 0.045;
            const barAngle = 0.45;
            const cosBar = Math.cos(barAngle), sinBar = Math.sin(barAngle);
            const barX = dx * cosBar + dy * sinBar;
            const barY = -dx * sinBar + dy * cosBar;
            const barProfile = Math.exp(-((barX / barLen) ** 2 + (barY / barW) ** 2) * 2.5);
            const bar = barProfile * 0.45 * Math.max(0, 1 - dist / 0.28);

            // --- 旋臂（2主臂 + 2副臂，对数螺旋，宽厚弥散） ---
            const spiralTightness = 0.38;
            const logDist = Math.log(Math.max(dist, 0.01));
            let armBrightness = 0;

            // 主臂（2条，宽厚的旋臂）
            for (let a = 0; a < 2; a++) {
                const armOffset = a * Math.PI;
                const spiralAngle = logDist / spiralTightness + armOffset;
                let diff = angle - spiralAngle;
                diff = ((diff % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI;

                // 旋臂核心（很宽的高斯分布）
                const sigma2 = 0.12 + dist * 0.14;
                const armCore = Math.exp(-(diff * diff) / (2 * sigma2));
                // 更宽的弥散晕（让旋臂有柔和边缘）
                const armHalo = Math.exp(-(diff * diff) / (2 * sigma2 * 5)) * 0.4;
                // fbm 噪声细节
                const n1 = fbm(pxx * 0.004 + a * 23.1, py * 0.004 + a * 11.3, 5);
                const n2 = fbm(pxx * 0.008 + a * 7.7, py * 0.008 + a * 5.1, 4);
                armBrightness += armCore * (0.45 + n1 * 0.55) + armHalo * (0.25 + n2 * 0.3);
            }

            // 副臂（2条，也相当宽，偏移90°）
            for (let a = 0; a < 2; a++) {
                const armOffset = a * Math.PI + Math.PI * 0.5;
                const spiralAngle = logDist / (spiralTightness * 0.92) + armOffset;
                let diff = angle - spiralAngle;
                diff = ((diff % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
                const sigma2 = 0.08 + dist * 0.10;
                const armCore = Math.exp(-(diff * diff) / (2 * sigma2));
                const armHalo = Math.exp(-(diff * diff) / (2 * sigma2 * 4)) * 0.3;
                const n1 = fbm(pxx * 0.005 + a * 31.3, py * 0.005 + a * 17.7, 4);
                armBrightness += (armCore * (0.3 + n1 * 0.35) + armHalo * 0.2) * 0.55;
            }

            armBrightness = Math.min(armBrightness, 1.3);

            // 旋臂只在一定半径外才显著（核球区域被核球覆盖）
            const armStartFade = Math.min(1, Math.max(0, (dist - 0.05) / 0.1));
            // 外部渐隐
            const fadeout = Math.max(0, 1.0 - Math.pow(dist, 2.0));

            // --- 尘埃暗带（旋臂内侧暗区） ---
            const dustN = fbm(pxx * 0.003 + 50, py * 0.003 + 50, 5);
            const dustLane = 1.0 - (armBrightness > 0.15 && armBrightness < 0.5 ? dustN * 0.3 : 0);

            // --- HII 区星云亮斑（旋臂内明亮团块） ---
            const clumpN = fbm(pxx * 0.015, py * 0.015, 3);
            const clumps = (armBrightness > 0.3 && clumpN > 0.5) ?
                (clumpN - 0.5) * 2.0 * armBrightness : 0;

            // --- 盘面底光（臂间弥漫星光，整个盘面有微弱光） ---
            const diskBase = Math.max(0, 1.0 - dist * 1.0) ** 1.5 * 0.12;

            // --- 合成 ---
            const armContrib = armBrightness * armStartFade * fadeout * dustLane;
            let totalBright = Math.min(1.0,
                bulge * 0.9 +
                bar * 0.5 +
                armContrib * 0.65 +
                clumps * 0.12 +
                diskBase
            );
            // gamma 校正：提升暗区可见度（模拟真实照片的动态范围）
            totalBright = Math.pow(totalBright, 0.82);

            // --- 颜色（核球暖橙 → 旋臂蓝白，中心更暖更饱和） ---
            const bulgeInfluence = Math.max(0, bulge * 0.95);
            const t = Math.min(1, dist / 0.5);
            // 核球色：深暖橙 (255, 185, 80) - 非常饱和的暖色
            // 旋臂色：从暖白过渡到蓝白
            const rr = bulgeInfluence * 255 + (1 - bulgeInfluence) * (225 - t * 50);
            const gg = bulgeInfluence * 185 + (1 - bulgeInfluence) * (220 - t * 30);
            const bb = bulgeInfluence * 80  + (1 - bulgeInfluence) * (215 + t * 40);

            // 微量亮星点
            const starRand = hash(pxx * 0.7, py * 0.7);
            const star = starRand > 0.97 ? (0.2 + starRand * 0.15) * fadeout : 0;

            // 旋臂中偶尔有蓝白色亮星（HII区）
            const hiiStar = (armBrightness > 0.3 && starRand > 0.93) ? 0.15 : 0;

            const bright = Math.min(1.0, totalBright + star + hiiStar);
            px[idx]     = Math.min(255, rr * bright);
            px[idx + 1] = Math.min(255, gg * bright);
            px[idx + 2] = Math.min(255, bb * bright);
            px[idx + 3] = Math.min(255, bright * 280); // 略高alpha增加可见度
        }
    }
    ctx.putImageData(imgData, 0, 0);

    // 核球暖色辉光 + 整盘微弱暖光
    ctx.globalCompositeOperation = 'screen';
    // 核球辉光（暖橙色）
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, texSize * 0.16);
    glow.addColorStop(0, 'rgba(255, 195, 80, 0.55)');
    glow.addColorStop(0.3, 'rgba(255, 180, 70, 0.3)');
    glow.addColorStop(0.7, 'rgba(230, 190, 130, 0.08)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, texSize, texSize);
    // 整盘微弱暖色弥漫光（让臂间不那么黑，但保持对比）
    const diskGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, texSize * 0.42);
    diskGlow.addColorStop(0, 'rgba(240, 210, 160, 0.08)');
    diskGlow.addColorStop(0.5, 'rgba(210, 200, 190, 0.03)');
    diskGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = diskGlow;
    ctx.fillRect(0, 0, texSize, texSize);
    ctx.globalCompositeOperation = 'source-over';

    // === 2. 纹理圆盘 ===
    const diskTexture = new THREE.CanvasTexture(canvas);
    diskTexture.needsUpdate = true;

    const diskGeo = new THREE.CircleGeometry(galaxyRadius, 128);
    const diskMat = new THREE.MeshBasicMaterial({
        map: diskTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
        opacity: 0.95
    });
    const diskMesh = new THREE.Mesh(diskGeo, diskMat);
    diskMesh.rotation.x = -Math.PI / 2; // 水平放置
    milkyWay.add(diskMesh);

    // === 3. 稀疏粒子覆盖层（跟随旋臂的星点） ===
    const starCount = 40000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
        // 对数螺旋分布，匹配纹理的旋臂结构
        const isMainArm = i < starCount * 0.6;
        const armIndex = isMainArm ? (i % 2) : (i % 2);
        const armOffset = isMainArm ? (armIndex * Math.PI) : (armIndex * Math.PI + Math.PI * 0.5);

        const d = Math.pow(Math.random(), 0.6) * galaxyRadius;
        const logD = Math.log(Math.max(d / galaxyRadius, 0.01));
        const spiralAngle = logD / 0.35 + armOffset;
        // 展幅随距离增大
        const spreadAmount = (0.15 + d / galaxyRadius * 0.3) * d;
        const spread = (Math.random() - 0.5) * spreadAmount;
        starPos[i * 3]     = Math.cos(spiralAngle) * d + Math.cos(spiralAngle + Math.PI / 2) * spread;
        starPos[i * 3 + 1] = (Math.random() - 0.5) * 80 * (1 - d / galaxyRadius * 0.8);
        starPos[i * 3 + 2] = Math.sin(spiralAngle) * d + Math.sin(spiralAngle + Math.PI / 2) * spread;

        const dr = d / galaxyRadius;
        if (dr < 0.1) {
            // 核球：暖黄
            starColors[i*3] = 1; starColors[i*3+1] = 0.85; starColors[i*3+2] = 0.5;
        } else if (dr < 0.4) {
            // 内臂：白色偏暖
            starColors[i*3] = 1; starColors[i*3+1] = 0.95; starColors[i*3+2] = 0.85;
        } else {
            // 外臂：蓝白色
            starColors[i*3] = 0.75; starColors[i*3+1] = 0.85; starColors[i*3+2] = 1;
        }
        starSizes[i] = 0.8 + Math.random() * 2.5;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

    const starMat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (3000.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            void main() {
                vec2 c = gl_PointCoord - vec2(0.5);
                float d = length(c);
                float alpha = 1.0 - smoothstep(0.0, 0.5, d);
                gl_FragColor = vec4(vColor, alpha * 0.6);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    milkyWay.add(new THREE.Points(starGeo, starMat));

    scene.add(milkyWay);
}

// ============ 创建银河系远距离发光点 ============
function createMilkyWayGlow() {
    const spriteMaterial = new THREE.SpriteMaterial({
        map: createGlowTexture(256, { r: 0.9, g: 0.85, b: 0.7 }),
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.8
    });

    milkyWayGlow = new THREE.Sprite(spriteMaterial);
    milkyWayGlow.scale.set(15000, 15000, 1);
    milkyWayGlow.position.set(0, 0, 0);
    milkyWayGlow.visible = false; // 初始不可见
    scene.add(milkyWayGlow);
}

// ============ 创建发光纹理 ============
function createGlowTexture(size, color) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 1)`);
    gradient.addColorStop(0.3, `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 0.5)`);
    gradient.addColorStop(0.6, `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 0.2)`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// ============ 创建银心黑洞材质 ============
function createGalacticBlackHoleMaterial() {
    return new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            reveal: { value: 0 },
            blackHoleMap: { value: textureLoader.load(GALACTIC_BLACK_HOLE_TEXTURE_PATH) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            precision highp float;

            uniform float time;
            uniform float reveal;
            uniform sampler2D blackHoleMap;

            varying vec2 vUv;

            float luma(vec3 color) {
                return dot(color, vec3(0.299, 0.587, 0.114));
            }

            void main() {
                vec2 p = vUv * 2.0 - 1.0;
                vec4 tex = texture2D(blackHoleMap, vUv);
                float oval = length(vec2(p.x * 0.68, p.y * 1.02));
                float edgeFade = 1.0 - smoothstep(0.78, 1.02, oval);
                float softVignette = 1.0 - smoothstep(0.62, 1.08, length(p));
                float shimmer = 0.94 + 0.06 * sin(time * 0.7);
                float brightness = luma(tex.rgb);
                float brightStructure = smoothstep(0.24, 0.52, brightness);
                float softGlow = smoothstep(0.38, 0.72, brightness) * 0.4;
                float centerHole = 1.0 - smoothstep(0.18, 0.34, length(vec2(p.x * 1.08, p.y * 1.22)));

                vec3 color = tex.rgb * (1.08 + reveal * 0.16) * shimmer;
                color += vec3(0.18, 0.26, 0.42) * softVignette * softGlow;

                float textureMask = max(brightStructure, centerHole * 0.9);
                float alpha = edgeFade * reveal * textureMask;
                if (alpha < 0.01) discard;

                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        depthTest: false
    });
}

// ============ 创建银河系中心黑洞 ============
function createGalacticCenter() {
    galacticCenter = new THREE.Group();
    galacticCenter.renderOrder = 20;

    const centralBulge = new THREE.Sprite(new THREE.SpriteMaterial({
        map: createGlowTexture(512, { r: 1.0, g: 0.88, b: 0.58 }),
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false
    }));
    centralBulge.name = 'centralBulge';
    centralBulge.scale.set(2650, 1550, 1);
    centralBulge.position.set(0, 0, -22);
    centralBulge.renderOrder = 17;
    galacticCenter.add(centralBulge);

    const centralBlueBloom = new THREE.Sprite(new THREE.SpriteMaterial({
        map: createGlowTexture(512, { r: 0.58, g: 0.72, b: 1.0 }),
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false
    }));
    centralBlueBloom.name = 'centralBlueBloom';
    centralBlueBloom.scale.set(3900, 2450, 1);
    centralBlueBloom.position.set(0, 0, -32);
    centralBlueBloom.renderOrder = 16;
    galacticCenter.add(centralBlueBloom);

    const blackHoleCard = new THREE.Mesh(
        new THREE.PlaneGeometry(1850, 1235),
        createGalacticBlackHoleMaterial()
    );
    blackHoleCard.name = 'blackHoleCard';
    blackHoleCard.renderOrder = 21;
    galacticCenter.add(blackHoleCard);

    const coolHalo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: createGlowTexture(512, { r: 0.58, g: 0.72, b: 1.0 }),
        transparent: true,
        opacity: 0.13,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false
    }));
    coolHalo.name = 'coolHalo';
    coolHalo.scale.set(2500, 1700, 1);
    coolHalo.position.set(0, 0, -10);
    coolHalo.renderOrder = 19;
    galacticCenter.add(coolHalo);

    const warmHalo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: createGlowTexture(512, { r: 1.0, g: 0.82, b: 0.45 }),
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false
    }));
    warmHalo.name = 'warmHalo';
    warmHalo.scale.set(2200, 1320, 1);
    warmHalo.position.set(0, -10, -5);
    warmHalo.renderOrder = 20;
    galacticCenter.add(warmHalo);

    const coreShadow = new THREE.Mesh(
        new THREE.SphereGeometry(140, 64, 64),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            depthTest: false
        })
    );
    coreShadow.name = 'coreShadow';
    coreShadow.renderOrder = 22;
    galacticCenter.add(coreShadow);

    scene.add(galacticCenter);
}

function updateGalacticCenterAppearance(distance, elapsed) {
    if (!galacticCenter) return;

    const reveal = THREE.MathUtils.clamp(
        1 - (distance - BLACK_HOLE_FULL_REVEAL_DISTANCE) / (BLACK_HOLE_REVEAL_START_DISTANCE - BLACK_HOLE_FULL_REVEAL_DISTANCE),
        0,
        1
    );
    const farCore = 1 - reveal;

    const blackHoleCard = galacticCenter.getObjectByName('blackHoleCard');
    const centralBulge = galacticCenter.getObjectByName('centralBulge');
    const centralBlueBloom = galacticCenter.getObjectByName('centralBlueBloom');
    const coolHalo = galacticCenter.getObjectByName('coolHalo');
    const warmHalo = galacticCenter.getObjectByName('warmHalo');
    const coreShadow = galacticCenter.getObjectByName('coreShadow');

    if (blackHoleCard) {
        blackHoleCard.quaternion.copy(camera.quaternion);
        const pulse = 1 + Math.sin(elapsed * 0.7) * 0.012;
        const closeScale = 0.82 + reveal * 0.28;
        blackHoleCard.scale.set(pulse * closeScale, pulse * closeScale, 1);
        blackHoleCard.visible = reveal > 0.01;
        if (blackHoleCard.material.uniforms) {
            blackHoleCard.material.uniforms.reveal.value = reveal;
            blackHoleCard.material.uniforms.time.value = elapsed;
        }
    }

    if (centralBulge) {
        centralBulge.material.opacity = 0.34 + farCore * 0.28 + Math.sin(elapsed * 0.28) * 0.025;
        centralBulge.scale.set(2600 + farCore * 900, 1500 + farCore * 520, 1);
    }

    if (centralBlueBloom) {
        centralBlueBloom.material.opacity = 0.08 + farCore * 0.2;
    }

    if (coolHalo) {
        coolHalo.material.opacity = (0.05 + farCore * 0.16 + reveal * 0.08) + Math.sin(elapsed * 0.35) * 0.012;
    }

    if (warmHalo) {
        warmHalo.material.opacity = (0.18 + farCore * 0.16 - reveal * 0.08) + Math.cos(elapsed * 0.48) * 0.012;
    }

    if (coreShadow) {
        coreShadow.visible = reveal > 0.08;
        coreShadow.material.opacity = reveal * (0.62 + Math.sin(elapsed * 0.5) * 0.02);
        const shadowScale = 0.55 + reveal * 0.45;
        coreShadow.scale.setScalar(shadowScale);
    }
}

// ============ 创建太阳系标记 ============
function createSolarSystemMarker() {
    solarSystem = new THREE.Group();
    solarSystem.position.copy(SOLAR_SYSTEM_POS);

    // 太阳（一个发光的小点）
    const sunGeometry = new THREE.SphereGeometry(15, 32, 32);
    const sunMaterial = createStarSurfaceMaterial('#ffcc00', 'sun');
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    solarSystem.add(sun);

    // 太阳光晕
    const sunGlowGeometry = new THREE.SphereGeometry(25, 32, 32);
    const sunGlowMaterial = new THREE.ShaderMaterial({
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
                float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                vec3 color = vec3(1.0, 0.8, 0.2) * intensity;
                gl_FragColor = vec4(color, intensity);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });
    const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
    solarSystem.add(sunGlow);

    // "你在这里"标记环
    const ringGeometry = new THREE.RingGeometry(40, 50, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    solarSystem.add(ring);

    // 外圈脉冲环
    const pulseRingGeometry = new THREE.RingGeometry(55, 60, 64);
    const pulseRingMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
    });
    const pulseRing = new THREE.Mesh(pulseRingGeometry, pulseRingMaterial);
    pulseRing.rotation.x = Math.PI / 2;
    pulseRing.name = 'pulseRing';
    solarSystem.add(pulseRing);

    // 标签
    createLabel(solarSystem, '☀️ 太阳系\n你在这里', 0, 80, 0);
    registerGalacticOrbit(solarSystem, SOLAR_SYSTEM_POS, SOLAR_ORBIT_SETTINGS);

    scene.add(solarSystem);
}

// ============ 创建日球层边界 ============
function createHeliopause() {
    const radius = 70; // 相对太阳系的大小
    const geometry = new THREE.SphereGeometry(radius, 64, 64);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
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
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);

                // 波动效果
                float wave = sin(vPosition.x * 0.1 + time) * sin(vPosition.y * 0.1 + time * 0.7) * 0.2 + 0.8;

                vec3 color = vec3(0.2, 0.6, 1.0) * intensity * wave;
                gl_FragColor = vec4(color, intensity * 0.4);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false
    });

    heliopause = new THREE.Mesh(geometry, material);
    heliopause.position.copy(SOLAR_SYSTEM_POS);
    registerGalacticOrbit(heliopause, SOLAR_SYSTEM_POS, SOLAR_ORBIT_SETTINGS);
    scene.add(heliopause);
}

// ============ 创建奥尔特云 ============
function createOortCloud() {
    const particleCount = 3000;
    const innerRadius = 80;
    const outerRadius = 200;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        // 球壳分布
        const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        // 淡蓝白色
        colors[i * 3] = 0.7 + Math.random() * 0.3;
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 2] = 1.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });

    oortCloud = new THREE.Points(geometry, material);
    oortCloud.position.copy(SOLAR_SYSTEM_POS);
    registerGalacticOrbit(oortCloud, SOLAR_SYSTEM_POS, SOLAR_ORBIT_SETTINGS);
    scene.add(oortCloud);
}

// ============ 创建宇宙级结构 ============
// 包含：本星系群边界、室女座星系团、拉尼亚凯亚超星系团（纤维网）、可观测宇宙球壳
function createCosmicStructures() {
    cosmicStructures.localGroup = createLocalGroupBoundary();
    cosmicStructures.virgo = createVirgoCluster();
    cosmicStructures.laniakea = createLaniakeaSupercluster();
    cosmicStructures.universeShell = createObservableUniverseShell();
}

// ===== 本星系群边界（围绕银心的扁球形薄壳）=====
// 真实直径约 1000 万光年，包含 50+ 星系；按场景比例放在 ~180000 单位
function createLocalGroupBoundary() {
    const group = new THREE.Group();

    // 半透明球壳网格（背面渲染，避免遮挡内部）
    const geom = new THREE.SphereGeometry(180000, 48, 32);
    const mat = new THREE.MeshBasicMaterial({
        color: 0x6a4cff,
        transparent: true,
        opacity: 0.04,
        side: THREE.BackSide,
        depthWrite: false
    });
    const shell = new THREE.Mesh(geom, mat);
    shell.scale.set(1.0, 0.75, 1.1);
    group.add(shell);

    // 网格线（明显轮廓）
    const wireGeom = new THREE.SphereGeometry(180000, 28, 18);
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0xa78bfa,
        transparent: true,
        opacity: 0.45,
        wireframe: true,
        depthWrite: false
    });
    const wire = new THREE.Mesh(wireGeom, wireMat);
    wire.scale.set(1.0, 0.75, 1.1);
    group.add(wire);

    // 边缘高亮粒子（让球壳更"具体"）
    const beadCount = 800;
    const beadPositions = new Float32Array(beadCount * 3);
    const beadColors = new Float32Array(beadCount * 3);
    const beadSizes = new Float32Array(beadCount);
    for (let i = 0; i < beadCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        beadPositions[i * 3] = 180000 * Math.sin(phi) * Math.cos(theta);
        beadPositions[i * 3 + 1] = 180000 * 0.75 * Math.sin(phi) * Math.sin(theta);
        beadPositions[i * 3 + 2] = 180000 * 1.1 * Math.cos(phi);
        beadColors[i * 3] = 0.72;
        beadColors[i * 3 + 1] = 0.55;
        beadColors[i * 3 + 2] = 1.0;
        beadSizes[i] = 5 + Math.random() * 4;
    }
    const beads = buildGalaxyParticles(beadPositions, beadColors, beadSizes);
    group.add(beads);

    // 居中标签
    const label = makeStructureLabel('本星系群', 'Local Group', 36000);
    label.position.set(0, 150000, 0);
    group.add(label);

    group.visible = false; // 默认隐藏，按 LOD 显
    scene.add(group);
    return group;
}

// ===== 室女座星系团（一团 ~80 个星系点 + 中央 M87 亮核）=====
// 真实距离约 5400 万光年，按场景非线性压缩到 ~330000 单位
function createVirgoCluster() {
    const group = new THREE.Group();
    // 大致朝向真实银道方向（北银极偏向）
    const center = new THREE.Vector3(120000, 280000, 90000);
    group.position.copy(center);

    const memberCount = 90;
    const positions = new Float32Array(memberCount * 3);
    const colors = new Float32Array(memberCount * 3);
    const sizes = new Float32Array(memberCount);

    for (let i = 0; i < memberCount; i++) {
        // 中央密集球分布
        const r = Math.abs(gaussianRandom()) * 22000 + Math.random() * 8000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        // 多数偏黄红（椭圆星系主导），少数偏蓝（旋涡）
        const isElliptical = Math.random() < 0.65;
        if (isElliptical) {
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 0.85;
            colors[i * 3 + 2] = 0.6;
        } else {
            colors[i * 3] = 0.85;
            colors[i * 3 + 1] = 0.92;
            colors[i * 3 + 2] = 1.0;
        }
        sizes[i] = 14 + Math.random() * 14;
    }

    const particles = buildGalaxyParticles(positions, colors, sizes);
    group.add(particles);

    // 中央 M87（巨型椭圆，超大质量黑洞所在）
    const m87 = makeAccentSprite('bulgeCore', 12000, 1.0);
    group.add(m87);

    // 大尺度发光（远视角看像一个星系团）
    const haloMat = new THREE.SpriteMaterial({
        map: createGlowTexture(256, { r: 1.0, g: 0.85, b: 0.6 }),
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.55,
        depthWrite: false
    });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.set(70000, 70000, 1);
    group.add(halo);

    // 标签
    const label = makeStructureLabel('室女座星系团', 'Virgo Cluster', 22000);
    label.position.set(0, 36000, 0);
    group.add(label);

    group.visible = false;
    scene.add(group);
    return group;
}

// ===== 拉尼亚凯亚超星系团（纤维网状结构）=====
// 真实跨度 ~5亿光年，包含 10万个星系；这里压缩到 ~520000 单位
// 用多条 CatmullRomCurve3 曲线绘制纤维丝，节点处放星系密集团
function createLaniakeaSupercluster() {
    const group = new THREE.Group();

    // 大型节点（已知超星系结构）
    // 1. 本星系群锚点（接近原点）
    // 2. 室女座星系团锚（靠近 virgo 中心方向）
    // 3. 巨引源 Great Attractor（拉尼亚凯亚中心，反方向偏 -x -z）
    // 4. 长蛇-半人马超星系团节点
    // 5. 孔雀座-印第安超星系团节点
    // 6. 后发星系团节点（北方）
    const nodes = [
        { name: '本星系群', nameEn: 'Local Group', pos: new THREE.Vector3(0, 0, 0), size: 12000, isLocal: true },
        { name: '室女座星系团', nameEn: 'Virgo Cluster', pos: new THREE.Vector3(120000, 280000, 90000), size: 28000, isLocal: true },
        { name: '巨引源', nameEn: 'Great Attractor', pos: new THREE.Vector3(-380000, -50000, -260000), size: 56000 },
        { name: '长蛇-半人马', nameEn: 'Hydra-Cen Supercluster', pos: new THREE.Vector3(-220000, -180000, -80000), size: 36000 },
        { name: '孔雀-印第安', nameEn: 'Pavo-Indus', pos: new THREE.Vector3(60000, -260000, -340000), size: 30000 },
        { name: '后发星系团', nameEn: 'Coma Cluster', pos: new THREE.Vector3(-90000, 410000, 200000), size: 36000 },
        { name: '英仙-双鱼', nameEn: 'Perseus-Pisces', pos: new THREE.Vector3(380000, 120000, -180000), size: 30000 },
        { name: '玉夫-武仙', nameEn: 'Sculptor Wall', pos: new THREE.Vector3(280000, -240000, 360000), size: 26000 }
    ];

    // 纤维网连接（哪些节点之间有星系丝）
    const filaments = [
        [0, 1], // 本星系群→室女座
        [1, 5], // 室女座→后发
        [1, 6], // 室女座→英仙双鱼
        [0, 3], // 本星系群→长蛇半人马
        [3, 2], // 长蛇半人马→巨引源（拉尼亚凯亚主轴）
        [1, 2], // 室女座→巨引源
        [3, 4], // 长蛇半人马→孔雀印第安
        [2, 4], // 巨引源→孔雀印第安
        [5, 6], // 后发→英仙双鱼
        [6, 7], // 英仙双鱼→玉夫武仙
        [0, 4], // 本星系群→孔雀印第安（次要丝）
    ];

    // 画纤维丝（粒子流）
    for (const [aIdx, bIdx] of filaments) {
        const a = nodes[aIdx].pos;
        const b = nodes[bIdx].pos;

        // 曲线略加 wobble 让它弯曲
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const perp = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3(0, 1, 0)).normalize();
        const wobble = perp.multiplyScalar((Math.random() - 0.5) * 80000);
        mid.add(wobble);
        mid.y += (Math.random() - 0.5) * 60000;

        const curve = new THREE.CatmullRomCurve3([a, mid, b]);
        const samples = 220;
        const positions = new Float32Array(samples * 3);
        const colors = new Float32Array(samples * 3);
        const sizes = new Float32Array(samples);
        for (let i = 0; i < samples; i++) {
            const t = i / (samples - 1);
            const p = curve.getPoint(t);
            // 沿曲线随机扩散，形成丝状云
            const spread = 4500 + Math.random() * 2500;
            positions[i * 3] = p.x + gaussianRandom() * spread;
            positions[i * 3 + 1] = p.y + gaussianRandom() * spread;
            positions[i * 3 + 2] = p.z + gaussianRandom() * spread;
            // 中心略亮，端点稍暗
            const lum = 0.5 + Math.sin(t * Math.PI) * 0.4;
            colors[i * 3] = 0.85 * lum;
            colors[i * 3 + 1] = 0.85 * lum;
            colors[i * 3 + 2] = 1.0 * lum;
            sizes[i] = 18 + Math.random() * 12;
        }
        const filament = buildGalaxyParticles(positions, colors, sizes);
        group.add(filament);
    }

    // 节点处的星系密集团 + 标签
    for (const node of nodes) {
        if (node.isLocal) continue; // 本群和室女座已单独绘制

        const clumpCount = 60;
        const positions = new Float32Array(clumpCount * 3);
        const colors = new Float32Array(clumpCount * 3);
        const sizes = new Float32Array(clumpCount);
        for (let i = 0; i < clumpCount; i++) {
            const r = Math.abs(gaussianRandom()) * node.size;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            positions[i * 3] = node.pos.x + r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = node.pos.y + r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = node.pos.z + r * Math.cos(phi);
            const isE = Math.random() < 0.6;
            if (isE) {
                colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.82; colors[i * 3 + 2] = 0.55;
            } else {
                colors[i * 3] = 0.85; colors[i * 3 + 1] = 0.9; colors[i * 3 + 2] = 1.0;
            }
            sizes[i] = 16 + Math.random() * 14;
        }
        const cluster = buildGalaxyParticles(positions, colors, sizes);
        group.add(cluster);

        // 节点中央光晕
        const haloMat = new THREE.SpriteMaterial({
            map: createGlowTexture(256, { r: 1.0, g: 0.85, b: 0.65 }),
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.45,
            depthWrite: false
        });
        const halo = new THREE.Sprite(haloMat);
        halo.scale.set(node.size * 2.3, node.size * 2.3, 1);
        halo.position.copy(node.pos);
        group.add(halo);

        // 节点标签
        const label = makeStructureLabel(node.name, node.nameEn, node.size * 0.85);
        label.position.copy(node.pos);
        label.position.y += node.size * 1.4;
        group.add(label);
    }

    // 拉尼亚凯亚整体名称标签（朝主轴方向放）
    const mainLabel = makeStructureLabel('拉尼亚凯亚超星系团', 'Laniakea Supercluster', 60000);
    mainLabel.position.set(-160000, 320000, -110000);
    group.add(mainLabel);

    group.visible = false;
    scene.add(group);
    return group;
}

// ===== 可观测宇宙球壳（类似奥尔特云）=====
function createObservableUniverseShell() {
    const group = new THREE.Group();
    const innerR = 850000;
    const outerR = 1000000;

    const particleCount = 8000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        const r = innerR + Math.random() * (outerR - innerR);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        // 微红移色调（远处的星系泛红）
        const tint = Math.random();
        if (tint < 0.6) {
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 0.7 + Math.random() * 0.2;
            colors[i * 3 + 2] = 0.55 + Math.random() * 0.2;
        } else {
            colors[i * 3] = 0.85 + Math.random() * 0.15;
            colors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
            colors[i * 3 + 2] = 1.0;
        }
        sizes[i] = 22 + Math.random() * 18;
    }

    const shellParticles = buildGalaxyParticles(positions, colors, sizes);
    group.add(shellParticles);

    // 微薄宇宙微波背景式的弱光球壳（半透 mesh）
    const fillGeom = new THREE.SphereGeometry(outerR * 0.99, 48, 32);
    const fillMat = new THREE.MeshBasicMaterial({
        color: 0x1a0a30,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide,
        depthWrite: false
    });
    const fill = new THREE.Mesh(fillGeom, fillMat);
    group.add(fill);

    // 远处标签
    const label = makeStructureLabel('可观测宇宙', 'Observable Universe', 130000);
    label.position.set(0, outerR * 0.95, 0);
    group.add(label);

    group.visible = false;
    scene.add(group);
    return group;
}

// ===== 通用结构标签（中文大、英文小）=====
function makeStructureLabel(cn, en, scale) {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 220;
    const ctx = canvas.getContext('2d');

    // 背景
    ctx.fillStyle = 'rgba(8, 6, 24, 0.6)';
    const padX = 12, padY = 12, radius = 22;
    const w = canvas.width - padX * 2, h = canvas.height - padY * 2;
    ctx.beginPath();
    ctx.moveTo(padX + radius, padY);
    ctx.lineTo(padX + w - radius, padY);
    ctx.quadraticCurveTo(padX + w, padY, padX + w, padY + radius);
    ctx.lineTo(padX + w, padY + h - radius);
    ctx.quadraticCurveTo(padX + w, padY + h, padX + w - radius, padY + h);
    ctx.lineTo(padX + radius, padY + h);
    ctx.quadraticCurveTo(padX, padY + h, padX, padY + h - radius);
    ctx.lineTo(padX, padY + radius);
    ctx.quadraticCurveTo(padX, padY, padX + radius, padY);
    ctx.closePath();
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '700 84px "Noto Sans SC", sans-serif';
    ctx.shadowColor = 'rgba(155, 110, 255, 0.85)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(cn, canvas.width / 2, 84);

    ctx.shadowBlur = 0;
    ctx.font = 'italic 600 38px "Orbitron", sans-serif';
    ctx.fillStyle = '#9bd6ff';
    ctx.fillText(en, canvas.width / 2, 158);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        depthTest: false
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(scale, scale * (canvas.height / canvas.width), 1);
    sprite.renderOrder = 999; // 标签盖在粒子之上
    return sprite;
}

// ============ 创建所有外部星系 ============
function createExternalGalaxies() {
    for (const [key, config] of Object.entries(galaxyRenderConfigs)) {
        let galaxyObj;

        switch (config.type) {
            case 'spiral':
                galaxyObj = createSpiralGalaxy(key, config);
                break;
            case 'elliptical':
                galaxyObj = createEllipticalGalaxy(key, config);
                break;
            case 'irregular':
                galaxyObj = createIrregularGalaxy(key, config);
                break;
            case 'interacting':
                galaxyObj = createInteractingGalaxies(key, config);
                break;
            case 'pair':
                galaxyObj = createPairGalaxies(key, config);
                break;
        }

        if (galaxyObj) {
            galaxyObj.key = key;
            galaxyObj.config = config;
            externalGalaxies.push(galaxyObj);
        }
    }
}

// ============ 创建一对靠近的星系（M81 + M82）============
function createPairGalaxies(key, config) {
    const group = new THREE.Group();
    group.position.copy(config.position);

    const radius = config.radius;

    // 内部 detail 容器：LOD 切换时隐藏整个细节
    const detail = new THREE.Group();

    // 主星系 M81：宏伟螺旋
    const primary = createInlineSpiral({
        radius: radius * 0.65,
        particleCount: Math.floor(config.particleCount * 0.6),
        arms: 2,
        tightness: 0.4,
        armWidth: 0.5,
        color: { r: 1.0, g: 0.92, b: 0.78 },
        tilt: { x: 0.4, z: 0.15 }
    });
    primary.position.set(-radius * 0.3, 0, 0);
    detail.add(primary);

    // 伴星系 M82：雪茄星系（侧视、剧烈活动）
    const cigar = createInlineCigar({
        radius: radius * 0.32,
        particleCount: Math.floor(config.particleCount * 0.35),
        elongation: 1.6,
        color: { r: 1.0, g: 0.78, b: 0.6 },
        hiiCount: 18,
        hasOutflow: true
    });
    cigar.position.set(radius * 0.6, radius * 0.4, radius * 0.1);
    cigar.rotation.z = Math.PI / 4;
    detail.add(cigar);

    group.add(detail);
    group.particles = detail; // LOD 控制对象

    // 远距离 LOD sprite
    const spriteMaterial = new THREE.SpriteMaterial({
        map: createGlowTexture(256, config.color),
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.8
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(radius * 1.6, radius * 1.0, 1);
    sprite.visible = false;
    group.add(sprite);
    group.sprite = sprite;

    // 点击目标
    const clickTarget = createGalaxyClickTarget(new THREE.Vector3(0, 0, 0), radius * 0.7);
    group.add(clickTarget);
    group.clickTarget = clickTarget;

    // 双语标签
    createGalaxyLabel(group, galaxyData[key], 0, radius * 1.25, 0, key);

    scene.add(group);
    return group;
}

// 内联：构造一个螺旋粒子组（不创建 group/label）
function createInlineSpiral(cfg) {
    const wrapper = new THREE.Group();
    const arms = cfg.arms || 2;
    const radius = cfg.radius;
    const tightness = cfg.tightness || 0.4;
    const armWidth = cfg.armWidth || 0.5;
    const total = cfg.particleCount;
    const c = cfg.color;

    const positions = new Float32Array(total * 3);
    const colors = new Float32Array(total * 3);
    const sizes = new Float32Array(total);

    const innerR = radius * 0.18;
    for (let i = 0; i < total; i++) {
        const isCore = i < total * 0.18;
        if (isCore) {
            const r = Math.abs(gaussianRandom()) * radius * 0.18;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5;
            positions[i * 3 + 2] = r * Math.cos(phi);
            colors[i * 3] = Math.min(1, c.r + 0.05);
            colors[i * 3 + 1] = c.g * 0.95;
            colors[i * 3 + 2] = c.b * 0.7;
            sizes[i] = 3 + Math.random() * 2;
        } else {
            const distance = innerR + Math.random() * (radius - innerR);
            const armOffset = (Math.floor(Math.random() * arms) / arms) * Math.PI * 2;
            const logR = Math.log(Math.max(distance / innerR, 1.001));
            const angle = logR / tightness + armOffset + gaussianRandom() * armWidth * 0.35;
            positions[i * 3] = Math.cos(angle) * distance;
            positions[i * 3 + 1] = gaussianRandom() * radius * 0.022;
            positions[i * 3 + 2] = Math.sin(angle) * distance;
            colors[i * 3] = c.r * (0.85 + Math.random() * 0.15);
            colors[i * 3 + 1] = c.g * (0.92 + Math.random() * 0.08);
            colors[i * 3 + 2] = Math.min(1, c.b + Math.random() * 0.1);
            sizes[i] = 2 + Math.random() * 2;
        }
    }
    const particles = buildGalaxyParticles(positions, colors, sizes);
    if (cfg.tilt) {
        particles.rotation.x = cfg.tilt.x || 0;
        particles.rotation.z = cfg.tilt.z || 0;
    }
    wrapper.add(particles);

    // 旋臂上的 HII 区
    for (let i = 0; i < 6; i++) {
        const distance = innerR + Math.random() * (radius - innerR) * 0.85;
        const armOffset = (Math.floor(Math.random() * arms) / arms) * Math.PI * 2;
        const logR = Math.log(Math.max(distance / innerR, 1.001));
        const angle = logR / tightness + armOffset + gaussianRandom() * armWidth * 0.2;
        const sprite = makeAccentSprite('hii', radius * 0.07, 0.7);
        sprite.position.set(Math.cos(angle) * distance, 0, Math.sin(angle) * distance);
        if (cfg.tilt) {
            sprite.position.applyEuler(new THREE.Euler(cfg.tilt.x || 0, 0, cfg.tilt.z || 0));
        }
        wrapper.add(sprite);
    }

    // 核球辉光
    const glow = makeAccentSprite('bulgeCore', radius * 0.5, 0.7);
    wrapper.add(glow);

    return wrapper;
}

// 内联：构造一个雪茄星系（M82 风格）
function createInlineCigar(cfg) {
    const wrapper = new THREE.Group();
    const total = cfg.particleCount;
    const radius = cfg.radius;
    const elongation = cfg.elongation || 1.6;
    const c = cfg.color;

    const positions = new Float32Array(total * 3);
    const colors = new Float32Array(total * 3);
    const sizes = new Float32Array(total);

    for (let i = 0; i < total; i++) {
        const x = gaussianRandom() * radius * elongation;
        const y = gaussianRandom() * radius * 0.35;
        const z = gaussianRandom() * radius * 0.45;
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        colors[i * 3] = c.r * (0.85 + Math.random() * 0.15);
        colors[i * 3 + 1] = c.g * (0.85 + Math.random() * 0.15);
        colors[i * 3 + 2] = c.b * (0.85 + Math.random() * 0.15);
        sizes[i] = 2 + Math.random() * 2;
    }
    const particles = buildGalaxyParticles(positions, colors, sizes);
    wrapper.add(particles);

    // 强烈恒星形成区（粉红色 H-α 喷流）
    for (let i = 0; i < cfg.hiiCount; i++) {
        const u = (Math.random() - 0.5) * 1.6;
        const sprite = makeAccentSprite('hii', radius * (0.18 + Math.random() * 0.1), 0.55 + Math.random() * 0.3);
        sprite.position.set(u * radius * elongation, gaussianRandom() * radius * 0.15, gaussianRandom() * radius * 0.2);
        wrapper.add(sprite);
    }

    // 垂直双向超级风（M82 著名的星暴喷流）
    if (cfg.hasOutflow) {
        for (let dir = -1; dir <= 1; dir += 2) {
            for (let j = 0; j < 6; j++) {
                const sprite = makeAccentSprite('hii', radius * (0.2 + j * 0.05), 0.4 - j * 0.05);
                sprite.position.set(0, dir * radius * (0.4 + j * 0.3), 0);
                wrapper.add(sprite);
            }
        }
    }

    // 核心辉光
    const glow = makeAccentSprite('bulgeCore', radius * 0.6, 0.7);
    wrapper.add(glow);

    return wrapper;
}

// ============ 通用粒子着色器 ============
// 距离衰减做了下限限制，避免远距离星系（仙女座等）粒子缩成 1 像素几乎不可见
const GALAXY_PARTICLE_VERTEX = `
    attribute float size;
    attribute vec3 color;
    varying vec3 vColor;

    void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float scale = max(1.2, 12000.0 / -mvPosition.z * 1.6);
        gl_PointSize = size * scale;
        gl_PointSize = clamp(gl_PointSize, 2.0, 22.0);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const GALAXY_PARTICLE_FRAGMENT = `
    varying vec3 vColor;

    void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        gl_FragColor = vec4(vColor, alpha * 0.95);
    }
`;

function buildGalaxyParticles(positions, colors, sizes) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: GALAXY_PARTICLE_VERTEX,
        fragmentShader: GALAXY_PARTICLE_FRAGMENT,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    return new THREE.Points(geometry, material);
}

// HII 区/尘埃带使用的 Sprite 纹理缓存
const galaxyAccentTextureCache = {};
function getAccentTexture(kind) {
    if (galaxyAccentTextureCache[kind]) return galaxyAccentTextureCache[kind];

    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);

    if (kind === 'hii') {
        // 粉红色发射星云（H-α）
        grad.addColorStop(0, 'rgba(255, 180, 200, 1)');
        grad.addColorStop(0.25, 'rgba(255, 110, 150, 0.7)');
        grad.addColorStop(0.6, 'rgba(220, 60, 110, 0.25)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else if (kind === 'blueCluster') {
        // 蓝白色年轻星团
        grad.addColorStop(0, 'rgba(220, 235, 255, 1)');
        grad.addColorStop(0.25, 'rgba(160, 200, 255, 0.7)');
        grad.addColorStop(0.6, 'rgba(80, 130, 220, 0.2)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else if (kind === 'bulgeCore') {
        // 暖黄核球辉光
        grad.addColorStop(0, 'rgba(255, 235, 180, 1)');
        grad.addColorStop(0.3, 'rgba(255, 200, 130, 0.55)');
        grad.addColorStop(0.7, 'rgba(220, 150, 80, 0.15)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    galaxyAccentTextureCache[kind] = tex;
    return tex;
}

function makeAccentSprite(kind, scale, opacity) {
    const mat = new THREE.SpriteMaterial({
        map: getAccentTexture(kind),
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: opacity,
        depthWrite: false
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(scale, scale, 1);
    return sprite;
}

// ============ 创建螺旋星系（强化结构：核球+棒+对数螺旋臂+HII区+尘埃带）============
function createSpiralGalaxy(key, config) {
    const group = new THREE.Group();
    group.position.copy(config.position);

    const arms = config.arms || 2;
    const radius = config.radius;
    const totalCount = config.particleCount;
    const tightness = config.tightness !== undefined ? config.tightness : 0.42; // 旋臂松紧（越大越松）
    const armWidth = config.armWidth !== undefined ? config.armWidth : 0.55; // 旋臂角度宽度
    const hasBar = config.hasBar !== false; // 棒旋
    const barLength = (config.barLength !== undefined ? config.barLength : 0.35) * radius;

    // 三层粒子分布：核球(15%) / 棒(8%) / 旋臂+盘(77%)
    const bulgeCount = Math.floor(totalCount * 0.15);
    const barCount = hasBar ? Math.floor(totalCount * 0.08) : 0;
    const armCount = totalCount - bulgeCount - barCount;

    const positions = new Float32Array(totalCount * 3);
    const colors = new Float32Array(totalCount * 3);
    const sizes = new Float32Array(totalCount);

    const c = config.color;
    let idx = 0;

    // === 核球：高斯椭球，暖色（黄→橙红） ===
    const bulgeR = radius * 0.18;
    const bulgeFlat = 0.55; // 略扁
    for (let i = 0; i < bulgeCount; i++) {
        const r = Math.abs(gaussianRandom()) * bulgeR;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[idx * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[idx * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * bulgeFlat;
        positions[idx * 3 + 2] = r * Math.cos(phi);

        const t = r / bulgeR;
        // 中心更白黄，外围橙红
        colors[idx * 3] = Math.min(1, c.r + 0.1);
        colors[idx * 3 + 1] = Math.max(0.5, c.g * (0.95 - t * 0.15));
        colors[idx * 3 + 2] = Math.max(0.3, c.b * (0.7 - t * 0.25));
        sizes[idx] = 3 + Math.random() * 3;
        idx++;
    }

    // === 棒结构：沿 x 方向延伸的椭球 ===
    if (hasBar) {
        for (let i = 0; i < barCount; i++) {
            const u = (Math.random() - 0.5) * 2; // -1..1
            const x = u * barLength;
            const r = Math.abs(gaussianRandom()) * radius * 0.05 * (1 - Math.abs(u) * 0.4);
            const ang = Math.random() * Math.PI * 2;

            positions[idx * 3] = x + Math.cos(ang) * r * 0.3;
            positions[idx * 3 + 1] = (Math.random() - 0.5) * radius * 0.025;
            positions[idx * 3 + 2] = Math.sin(ang) * r;

            colors[idx * 3] = Math.min(1, c.r + 0.05);
            colors[idx * 3 + 1] = c.g * 0.9;
            colors[idx * 3 + 2] = c.b * 0.65;
            sizes[idx] = 2.5 + Math.random() * 2.5;
            idx++;
        }
    }

    // === 旋臂 + 盘 ===
    // 对数螺旋：r = a*e^(b*theta)；写成 theta = ln(r/r0) / b
    // 用密度调制：在旋臂角度附近粒子更密
    const innerR = barLength * 0.95; // 棒末端开始长出旋臂
    const outerR = radius;

    for (let i = 0; i < armCount; i++) {
        // 半径偏向中等距离，让盘"满"
        const rRand = Math.random();
        // 三段：内盘(短)、旋臂主区(主)、外晕(衰减)
        let distance;
        if (rRand < 0.15) {
            distance = innerR + Math.random() * (outerR - innerR) * 0.2;
        } else if (rRand < 0.85) {
            distance = innerR + Math.random() * (outerR - innerR) * 0.95;
        } else {
            distance = outerR * (0.85 + Math.random() * 0.18);
        }

        const armIndex = Math.floor(Math.random() * arms);
        const armOffset = (armIndex / arms) * Math.PI * 2;
        const logR = Math.log(Math.max(distance / innerR, 1.001));
        const armCenterAngle = logR / tightness + armOffset;

        // 用 sin² 调制让粒子靠近旋臂中心；少量(15%)散落到旋臂之间形成盘
        let angle;
        const onArm = Math.random() < 0.85;
        if (onArm) {
            // 在旋臂中心 ± armWidth/2 范围内偏正态分布
            angle = armCenterAngle + gaussianRandom() * armWidth * 0.35;
        } else {
            angle = Math.random() * Math.PI * 2;
        }

        // 径向抖动（让旋臂有粗细感）
        const radialJitter = (Math.random() - 0.5) * radius * 0.02;
        const r = distance + radialJitter;

        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        const diskThickness = radius * 0.025 * Math.max(0.3, 1 - distance / radius * 0.6);
        const y = gaussianRandom() * diskThickness;

        positions[idx * 3] = x;
        positions[idx * 3 + 1] = y;
        positions[idx * 3 + 2] = z;

        const distRatio = distance / radius;
        if (onArm) {
            // 旋臂上：偏蓝白（年轻恒星），略带粉
            const blueMix = 0.35 + Math.random() * 0.5;
            colors[idx * 3] = c.r * (0.85 + Math.random() * 0.15);
            colors[idx * 3 + 1] = c.g * (0.92 + Math.random() * 0.08);
            colors[idx * 3 + 2] = Math.min(1.0, c.b * (0.95 + Math.random() * 0.1) + blueMix * 0.1);
            sizes[idx] = 2.2 + Math.random() * 2.2;
        } else {
            // 盘弥散：偏暗淡黄
            colors[idx * 3] = c.r * 0.7;
            colors[idx * 3 + 1] = c.g * 0.7;
            colors[idx * 3 + 2] = c.b * 0.75;
            sizes[idx] = 1.6 + Math.random() * 1.4;
        }

        // 距离衰减亮度
        if (distRatio > 0.85) {
            const fade = 1 - (distRatio - 0.85) / 0.15 * 0.5;
            colors[idx * 3] *= fade;
            colors[idx * 3 + 1] *= fade;
            colors[idx * 3 + 2] *= fade;
        }

        idx++;
    }

    const particles = buildGalaxyParticles(positions, colors, sizes);

    // 应用倾角
    if (config.tilt) {
        particles.rotation.x = config.tilt.x || 0;
        particles.rotation.z = config.tilt.z || 0;
    }

    group.add(particles);
    group.particles = particles;

    // === 核球辉光 sprite（叠加于核心，做小做暗以免淹没旋臂粒子）===
    const bulgeGlow = makeAccentSprite('bulgeCore', radius * 0.32, 0.45);
    if (config.tilt) {
        // 让 glow 也跟着倾斜（用 group 包一层）
        const tiltGroup = new THREE.Group();
        tiltGroup.rotation.x = config.tilt.x || 0;
        tiltGroup.rotation.z = config.tilt.z || 0;
        tiltGroup.add(bulgeGlow);
        group.add(tiltGroup);
    } else {
        group.add(bulgeGlow);
    }

    // === HII 区（旋臂上的粉红发射星云）===
    const hiiCount = Math.max(6, Math.floor(arms * 5));
    const hiiContainer = new THREE.Group();
    if (config.tilt) {
        hiiContainer.rotation.x = config.tilt.x || 0;
        hiiContainer.rotation.z = config.tilt.z || 0;
    }
    for (let i = 0; i < hiiCount; i++) {
        const armIndex = i % arms;
        const armOffset = (armIndex / arms) * Math.PI * 2;
        const distance = innerR + Math.random() * (outerR - innerR) * 0.85;
        const logR = Math.log(Math.max(distance / innerR, 1.001));
        const angle = logR / tightness + armOffset + gaussianRandom() * armWidth * 0.2;
        const px = Math.cos(angle) * distance;
        const pz = Math.sin(angle) * distance;
        const py = (Math.random() - 0.5) * radius * 0.015;
        const sprite = makeAccentSprite('hii', radius * (0.06 + Math.random() * 0.05), 0.7 + Math.random() * 0.2);
        sprite.position.set(px, py, pz);
        hiiContainer.add(sprite);

        // 顺便加一个蓝白年轻星团做配色
        if (Math.random() < 0.6) {
            const blueSprite = makeAccentSprite('blueCluster', radius * (0.04 + Math.random() * 0.03), 0.55);
            blueSprite.position.set(px + (Math.random() - 0.5) * radius * 0.05, py, pz + (Math.random() - 0.5) * radius * 0.05);
            hiiContainer.add(blueSprite);
        }
    }
    group.add(hiiContainer);

    // === 尘埃带：沿盘平面的暗环（细而淡，避免淹没旋臂）===
    if (config.dustRing !== false) {
        const dustRingGeom = new THREE.RingGeometry(radius * 0.35, radius * 0.85, 96, 1);
        const dustRingMat = new THREE.MeshBasicMaterial({
            color: 0x140804,
            transparent: true,
            opacity: 0.18,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.NormalBlending
        });
        const dustRing = new THREE.Mesh(dustRingGeom, dustRingMat);
        dustRing.rotation.x = Math.PI / 2;
        if (config.tilt) {
            const dustTilt = new THREE.Group();
            dustTilt.rotation.x = config.tilt.x || 0;
            dustTilt.rotation.z = config.tilt.z || 0;
            dustTilt.add(dustRing);
            group.add(dustTilt);
        } else {
            group.add(dustRing);
        }
    }

    // 创建发光 Sprite（LOD远距离使用）
    const spriteMaterial = new THREE.SpriteMaterial({
        map: createGlowTexture(256, config.color),
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.8
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(config.radius * 1.5, config.radius * 1.5, 1);
    sprite.visible = false;
    group.add(sprite);
    group.sprite = sprite;

    // 创建点击目标
    const clickTarget = createGalaxyClickTarget(new THREE.Vector3(0, 0, 0), config.radius * 0.8);
    group.add(clickTarget);
    group.clickTarget = clickTarget;

    // 创建双语标签
    createGalaxyLabel(group, galaxyData[key], 0, config.radius * 1.25, 0, key);

    scene.add(group);
    return group;
}

// ============ 创建椭圆星系（核心密集+暗淡晕，可选尘埃带）============
function createEllipticalGalaxy(key, config) {
    const group = new THREE.Group();
    group.position.copy(config.position);

    const totalCount = config.particleCount;
    const flatten = config.flatten !== undefined ? config.flatten : 0.7;
    const radius = config.radius;
    const c = config.color;

    // 核心(45%)+主体(45%)+晕(10%)
    const coreCount = Math.floor(totalCount * 0.45);
    const mainCount = Math.floor(totalCount * 0.45);
    const haloCount = totalCount - coreCount - mainCount;

    const positions = new Float32Array(totalCount * 3);
    const colors = new Float32Array(totalCount * 3);
    const sizes = new Float32Array(totalCount);

    let idx = 0;
    // 核心
    for (let i = 0; i < coreCount; i++) {
        const r = Math.abs(gaussianRandom()) * radius * 0.18;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[idx * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[idx * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * flatten;
        positions[idx * 3 + 2] = r * Math.cos(phi);
        const t = r / (radius * 0.18);
        colors[idx * 3] = Math.min(1, c.r + 0.05);
        colors[idx * 3 + 1] = c.g * (0.95 - t * 0.1);
        colors[idx * 3 + 2] = c.b * (0.85 - t * 0.2);
        sizes[idx] = 3 + Math.random() * 2.5;
        idx++;
    }
    // 主体
    for (let i = 0; i < mainCount; i++) {
        const r = (0.18 + Math.pow(Math.random(), 1.6) * 0.6) * radius;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[idx * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[idx * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * flatten;
        positions[idx * 3 + 2] = r * Math.cos(phi);
        const t = r / radius;
        colors[idx * 3] = c.r * (0.95 - t * 0.15);
        colors[idx * 3 + 1] = c.g * (0.9 - t * 0.2);
        colors[idx * 3 + 2] = c.b * (0.85 - t * 0.25);
        sizes[idx] = 2 + Math.random() * 2;
        idx++;
    }
    // 晕
    for (let i = 0; i < haloCount; i++) {
        const r = (0.7 + Math.random() * 0.5) * radius;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[idx * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[idx * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * flatten;
        positions[idx * 3 + 2] = r * Math.cos(phi);
        colors[idx * 3] = c.r * 0.55;
        colors[idx * 3 + 1] = c.g * 0.5;
        colors[idx * 3 + 2] = c.b * 0.5;
        sizes[idx] = 1.4 + Math.random() * 1.0;
        idx++;
    }

    const particles = buildGalaxyParticles(positions, colors, sizes);
    group.add(particles);
    group.particles = particles;

    // 核心辉光（椭圆星系核心略亮）
    const coreGlow = makeAccentSprite('bulgeCore', radius * 0.4, 0.55);
    group.add(coreGlow);

    // 可选：横穿赤道的暗尘带（半人马座 A 经典特征）
    if (config.dustLane) {
        const lane = new THREE.Mesh(
            new THREE.CylinderGeometry(radius * 0.85, radius * 0.85, radius * 0.08, 64, 1, true),
            new THREE.MeshBasicMaterial({
                color: 0x070406,
                transparent: true,
                opacity: 0.65,
                side: THREE.DoubleSide,
                depthWrite: false
            })
        );
        lane.rotation.x = Math.PI / 2;
        if (config.dustLane.tilt) {
            lane.rotation.z = config.dustLane.tilt;
        }
        group.add(lane);

        // 尘带边缘的粉色 H II 区点缀（恒星形成区）
        const hiiBand = 8;
        const dustGroup = new THREE.Group();
        dustGroup.rotation.x = config.dustLane.tilt || 0;
        for (let i = 0; i < hiiBand; i++) {
            const angle = (i / hiiBand) * Math.PI * 2 + Math.random() * 0.3;
            const r = radius * (0.55 + Math.random() * 0.25);
            const sprite = makeAccentSprite('hii', radius * 0.07, 0.55);
            sprite.position.set(Math.cos(angle) * r, (Math.random() - 0.5) * radius * 0.03, Math.sin(angle) * r);
            dustGroup.add(sprite);
        }
        group.add(dustGroup);
    }

    // 发光 Sprite
    const spriteMaterial = new THREE.SpriteMaterial({
        map: createGlowTexture(256, config.color),
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.85
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(config.radius * 1.4, config.radius * 1.0, 1);
    sprite.visible = false;
    group.add(sprite);
    group.sprite = sprite;

    // 点击目标
    const clickTarget = createGalaxyClickTarget(new THREE.Vector3(0, 0, 0), config.radius * 0.6);
    group.add(clickTarget);
    group.clickTarget = clickTarget;

    // 双语标签
    createGalaxyLabel(group, galaxyData[key], 0, config.radius * 1.2, 0, key);

    scene.add(group);
    return group;
}

// ============ 创建不规则星系（云絮+大量HII区+蓝色年轻星团）============
function createIrregularGalaxy(key, config) {
    const group = new THREE.Group();
    group.position.copy(config.position);

    const totalCount = config.particleCount;
    const radius = config.radius;
    const c = config.color;

    const positions = new Float32Array(totalCount * 3);
    const colors = new Float32Array(totalCount * 3);
    const sizes = new Float32Array(totalCount);

    // 多个云团（结构主导）
    const clumps = 6 + Math.floor(Math.random() * 4);
    const clumpCenters = [];
    for (let cc = 0; cc < clumps; cc++) {
        // LMC 偏长条带；用类似的非各向同性偏移
        const t = (cc / clumps - 0.5) * 1.6;
        clumpCenters.push({
            x: t * radius * (config.elongation || 0.7) + (Math.random() - 0.5) * radius * 0.3,
            y: (Math.random() - 0.5) * radius * 0.25,
            z: (Math.random() - 0.5) * radius * (config.elongation ? 0.4 : 0.7),
            scale: 0.18 + Math.random() * 0.22,
            weight: 0.7 + Math.random() * 0.6
        });
    }

    let totalWeight = 0;
    clumpCenters.forEach(cl => totalWeight += cl.weight);

    for (let i = 0; i < totalCount; i++) {
        // 按权重选云团
        let pick = Math.random() * totalWeight;
        let clump = clumpCenters[0];
        for (const cl of clumpCenters) {
            pick -= cl.weight;
            if (pick <= 0) { clump = cl; break; }
        }

        const r = Math.abs(gaussianRandom()) * radius * clump.scale;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = clump.x + r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = clump.y + r * Math.sin(phi) * Math.sin(theta) * 0.45;
        positions[i * 3 + 2] = clump.z + r * Math.cos(phi);

        // 蓝白主导（活跃恒星形成），偶尔粉色调
        const bluish = Math.random();
        if (bluish < 0.15) {
            // H-α 余辉，偏粉
            colors[i * 3] = Math.min(1, c.r + 0.15);
            colors[i * 3 + 1] = c.g * 0.7;
            colors[i * 3 + 2] = c.b * 0.85;
        } else {
            colors[i * 3] = c.r * (0.75 + Math.random() * 0.25);
            colors[i * 3 + 1] = c.g * (0.88 + Math.random() * 0.12);
            colors[i * 3 + 2] = Math.min(1, c.b * (0.95 + Math.random() * 0.1));
        }
        sizes[i] = 1.8 + Math.random() * 2.2;
    }

    const particles = buildGalaxyParticles(positions, colors, sizes);
    group.add(particles);
    group.particles = particles;

    // HII 区（粉色发射星云，比螺旋更多）
    const hiiCount = config.hiiCount || (clumps * 2 + 4);
    for (let i = 0; i < hiiCount; i++) {
        const clump = clumpCenters[Math.floor(Math.random() * clumps)];
        const offX = (Math.random() - 0.5) * radius * clump.scale * 1.3;
        const offY = (Math.random() - 0.5) * radius * 0.06;
        const offZ = (Math.random() - 0.5) * radius * clump.scale * 1.3;
        const sprite = makeAccentSprite('hii', radius * (0.05 + Math.random() * 0.06), 0.6 + Math.random() * 0.25);
        sprite.position.set(clump.x + offX, clump.y + offY, clump.z + offZ);
        group.add(sprite);

        // 配套蓝色年轻星团
        if (Math.random() < 0.7) {
            const blueSprite = makeAccentSprite('blueCluster', radius * (0.04 + Math.random() * 0.04), 0.5);
            blueSprite.position.set(clump.x + offX * 1.1, clump.y + offY, clump.z + offZ * 1.1);
            group.add(blueSprite);
        }
    }

    // 发光 Sprite
    const spriteMaterial = new THREE.SpriteMaterial({
        map: createGlowTexture(256, config.color),
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.7
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(config.radius * 1.2, config.radius * 0.8, 1);
    sprite.visible = false;
    group.add(sprite);
    group.sprite = sprite;

    // 点击目标
    const clickTarget = createGalaxyClickTarget(new THREE.Vector3(0, 0, 0), config.radius * 0.6);
    group.add(clickTarget);
    group.clickTarget = clickTarget;

    // 双语标签
    createGalaxyLabel(group, galaxyData[key], 0, config.radius * 1.2, 0, key);

    scene.add(group);
    return group;
}

// ============ 创建碰撞星系 ============
function createInteractingGalaxies(key, config) {
    const group = new THREE.Group();
    group.position.copy(config.position);

    const geometry = new THREE.BufferGeometry();
    const particlesPerGalaxy = Math.floor(config.particleCount / 2.5);
    const bridgeParticles = config.particleCount - particlesPerGalaxy * 2;
    const totalParticles = config.particleCount;

    const positions = new Float32Array(totalParticles * 3);
    const colors = new Float32Array(totalParticles * 3);
    const sizes = new Float32Array(totalParticles);

    const offset1 = new THREE.Vector3(-config.radius * 0.3, 0, -config.radius * 0.2);
    const offset2 = new THREE.Vector3(config.radius * 0.3, config.radius * 0.1, config.radius * 0.2);

    let idx = 0;

    // 第一个螺旋星系
    for (let i = 0; i < particlesPerGalaxy; i++) {
        const armIndex = i % 2;
        const armAngle = (armIndex / 2) * Math.PI * 2;
        const distance = Math.pow(Math.random(), 0.5) * config.radius * 0.4;
        const spiralAngle = distance * 0.001 + armAngle;
        const spread = (Math.random() - 0.5) * distance * 0.3;

        positions[idx * 3] = offset1.x + Math.cos(spiralAngle) * distance + spread * Math.cos(spiralAngle + Math.PI / 2);
        positions[idx * 3 + 1] = offset1.y + (Math.random() - 0.5) * config.radius * 0.02;
        positions[idx * 3 + 2] = offset1.z + Math.sin(spiralAngle) * distance + spread * Math.sin(spiralAngle + Math.PI / 2);

        colors[idx * 3] = config.color.r * 0.9;
        colors[idx * 3 + 1] = config.color.g * 0.95;
        colors[idx * 3 + 2] = config.color.b;
        sizes[idx] = 2 + Math.random() * 2;
        idx++;
    }

    // 第二个螺旋星系
    for (let i = 0; i < particlesPerGalaxy; i++) {
        const armIndex = i % 2;
        const armAngle = (armIndex / 2) * Math.PI * 2 + Math.PI / 4;
        const distance = Math.pow(Math.random(), 0.5) * config.radius * 0.35;
        const spiralAngle = distance * 0.001 + armAngle;
        const spread = (Math.random() - 0.5) * distance * 0.3;

        positions[idx * 3] = offset2.x + Math.cos(spiralAngle) * distance + spread * Math.cos(spiralAngle + Math.PI / 2);
        positions[idx * 3 + 1] = offset2.y + (Math.random() - 0.5) * config.radius * 0.02;
        positions[idx * 3 + 2] = offset2.z + Math.sin(spiralAngle) * distance + spread * Math.sin(spiralAngle + Math.PI / 2);

        colors[idx * 3] = config.color.r;
        colors[idx * 3 + 1] = config.color.g * 0.9;
        colors[idx * 3 + 2] = config.color.b * 0.95;
        sizes[idx] = 2 + Math.random() * 2;
        idx++;
    }

    // 连接"触须"桥梁
    for (let i = 0; i < bridgeParticles; i++) {
        const t = Math.random();
        const curve = Math.sin(t * Math.PI) * config.radius * 0.3;

        positions[idx * 3] = offset1.x + (offset2.x - offset1.x) * t + (Math.random() - 0.5) * curve * 0.5;
        positions[idx * 3 + 1] = offset1.y + (offset2.y - offset1.y) * t + curve * (Math.random() - 0.3);
        positions[idx * 3 + 2] = offset1.z + (offset2.z - offset1.z) * t + (Math.random() - 0.5) * curve * 0.5;

        colors[idx * 3] = config.color.r * 0.7;
        colors[idx * 3 + 1] = config.color.g * 0.8;
        colors[idx * 3 + 2] = config.color.b * 0.9;
        sizes[idx] = 1.5 + Math.random() * 1.5;
        idx++;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;

            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (5000.0 / -mvPosition.z);
                gl_PointSize = clamp(gl_PointSize, 1.0, 8.0);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;

            void main() {
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);
                float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                gl_FragColor = vec4(vColor, alpha * 0.7);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    group.add(particles);
    group.particles = particles;

    // 发光 Sprite
    const spriteMaterial = new THREE.SpriteMaterial({
        map: createGlowTexture(256, config.color),
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.7
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(config.radius * 1.5, config.radius, 1);
    sprite.visible = false;
    group.add(sprite);
    group.sprite = sprite;

    // 点击目标
    const clickTarget = createGalaxyClickTarget(new THREE.Vector3(0, 0, 0), config.radius * 0.5);
    group.add(clickTarget);
    group.clickTarget = clickTarget;

    // 双语标签
    createGalaxyLabel(group, galaxyData[key], 0, config.radius * 1.2, 0, key);

    scene.add(group);
    return group;
}

// ============ 创建银河系尺度恒星系统 ============
function createGalacticStarSystems() {
    for (const [key, config] of Object.entries(galacticStarConfigs)) {
        // 计算场景位置：太阳系位置 + 方向偏移 * (距离/5)
        const sceneDistance = config.distanceLY / 5;
        const offset = config.offset;
        const position = SOLAR_SYSTEM_POS.clone().add(
            new THREE.Vector3(
                offset.x * sceneDistance,
                offset.y * sceneDistance,
                offset.z * sceneDistance
            )
        );

        const starGroup = createGalacticStar(key, config, position);

        if (starGroup) {
            starGroup.key = key;
            starGroup.config = config;
            starGroup.visible = false; // 由 updateStarSystems 控制可见性
            registerGalacticOrbit(starGroup, position, {
                speedFactor: getGalacticOrbitSpeedFactor(Math.hypot(position.x, position.z)) * GALACTIC_LANDMARK_SPEED_SCALE,
                bobAmplitude: config.size === 'hypergiant' ? 18 : 10,
                bobSpeedFactor: 0.35
            });
            starSystems.push(starGroup);
        }
    }
}

// ============ 创建银河尺度恒星 ============
function createGalacticStar(key, config, position) {
    const group = new THREE.Group();
    group.position.copy(position);

    // 根据恒星尺寸确定球体大小
    let starSize = 15;
    if (config.size === 'supergiant') starSize = 30;
    else if (config.size === 'hypergiant') starSize = 45;

    // 手枪星（蓝特超巨星）特殊大小
    if (key === 'pistolStar') starSize = 35;

    // 主星球体
    const starGeometry = new THREE.SphereGeometry(starSize, 32, 32);
    const starMaterial = createStarSurfaceMaterial(config.color, config.textureProfile);
    const star = new THREE.Mesh(starGeometry, starMaterial);
    group.add(star);

    // 内层辉光
    const glowGeometry = new THREE.SphereGeometry(starSize * 1.8, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            glowColor: { value: new THREE.Color(config.color) }
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 glowColor;
            varying vec3 vNormal;
            void main() {
                float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(glowColor, intensity * 0.8);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);

    // 超巨星/特超巨星：添加脉动辉光层
    if (config.size === 'supergiant' || config.size === 'hypergiant') {
        const pulseGlowGeometry = new THREE.SphereGeometry(starSize * 3, 32, 32);
        const pulseGlowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(config.color) },
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
                uniform vec3 glowColor;
                uniform float time;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                    float pulse = 0.5 + 0.5 * sin(time * 1.5);
                    gl_FragColor = vec4(glowColor, intensity * 0.4 * pulse);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            depthWrite: false
        });
        const pulseGlow = new THREE.Mesh(pulseGlowGeometry, pulseGlowMaterial);
        pulseGlow.name = 'supergiantGlow';
        group.add(pulseGlow);
    }

    // 如果有行星，添加绿色脉冲环
    if (config.hasPlanets) {
        const planetRingGeometry = new THREE.RingGeometry(starSize * 2, starSize * 2.3, 64);
        const planetRingMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const planetRing = new THREE.Mesh(planetRingGeometry, planetRingMaterial);
        planetRing.rotation.x = Math.PI / 2;
        planetRing.name = 'planetRing';
        group.add(planetRing);
    }

    // 点击目标
    const clickTarget = createStarSystemClickTarget(starSize * 3);
    group.add(clickTarget);
    group.clickTarget = clickTarget;

    // 标签（显示名称和距离）
    const data = starSystemData[key];
    if (data) {
        const labelText = `${data.name}\n${data.distance}`;
        createGalacticStarLabel(group, labelText, 0, starSize * 4, 0, key, config);
    }

    scene.add(group);
    return group;
}

// ============ 创建银河尺度恒星标签 ============
function createGalacticStarLabel(parent, text, x, y, z, key, config) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;

    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = 'bold 28px Noto Sans SC';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = config.color;

    const lines = text.split('\n');
    context.fillText(lines[0], canvas.width / 2, 40);
    if (lines[1]) {
        context.font = '22px Noto Sans SC';
        context.fillStyle = '#cccccc';
        context.fillText(lines[1], canvas.width / 2, 85);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });

    const sprite = new THREE.Sprite(material);
    // 银河尺度需要更大的标签
    const labelScale = config.size === 'hypergiant' ? 120 : (config.size === 'supergiant' ? 90 : 70);
    sprite.scale.set(labelScale, labelScale * 0.25, 1);
    sprite.position.set(x, y, z);
    sprite.name = 'galacticStarLabel';
    sprite.starSystemKey = key;

    parent.add(sprite);
}

// ============ 创建太阳系邻域恒星系统（局部放大视图）============
function createNeighborhoodStarSystems() {
    for (const [key, config] of Object.entries(neighborhoodStarConfigs)) {
        // 计算恒星在邻域视图中的位置
        // 使用球坐标：距离*比例尺，方位角，仰角
        const radius = config.distanceLY * NEIGHBORHOOD_SCALE;
        const x = radius * Math.cos(config.elevation) * Math.cos(config.angle);
        const y = radius * Math.sin(config.elevation);
        const z = radius * Math.cos(config.elevation) * Math.sin(config.angle);

        // 位置相对于太阳系位置
        const position = SOLAR_SYSTEM_POS.clone().add(new THREE.Vector3(x, y, z));

        // 创建恒星标记
        const starGroup = createNeighborhoodStar(key, config, position);

        if (starGroup) {
            starGroup.key = key;
            starGroup.config = config;
            starGroup.visible = false; // 初始不可见
            registerNeighborhoodOffset(starGroup, new THREE.Vector3(x, y, z));
            neighborhoodStarSystems.push(starGroup);
        }
    }

    // 创建邻域视图中的太阳标记（中心）
    createNeighborhoodSun();
}

// ============ 创建邻域视图中的太阳 ============
function createNeighborhoodSun() {
    const sunGroup = new THREE.Group();
    sunGroup.position.copy(SOLAR_SYSTEM_POS);
    sunGroup.name = 'neighborhoodSun';

    // 太阳核心（适中大小）
    const sunGeometry = new THREE.SphereGeometry(5, 64, 64);
    const sunMaterial = createStarSurfaceMaterial('#ffdd00', 'sun');
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sunGroup.add(sun);

    // 太阳光晕（较小）
    const glowGeometry = new THREE.SphereGeometry(10, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
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
                float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                vec3 color = vec3(1.0, 0.9, 0.4) * intensity * 0.6;
                gl_FragColor = vec4(color, intensity * 0.6);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    sunGroup.add(glow);

    // 外层光晕（较小）
    const outerGlowGeometry = new THREE.SphereGeometry(15, 32, 32);
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
                vec3 color = vec3(1.0, 0.7, 0.2) * intensity * 0.5;
                gl_FragColor = vec4(color, intensity * 0.2);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });
    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    sunGroup.add(outerGlow);

    // "太阳" 标签
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 96;

    context.fillStyle = 'rgba(0, 0, 0, 0.6)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = 'bold 24px Noto Sans SC';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#ffdd00';
    context.fillText('☀️ 太阳', canvas.width / 2, 35);
    context.font = '16px Noto Sans SC';
    context.fillStyle = '#ffffff';
    context.fillText('你在这里', canvas.width / 2, 65);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });
    const label = new THREE.Sprite(spriteMaterial);
    label.scale.set(40, 15, 1);
    label.position.set(0, 35, 0);
    sunGroup.add(label);

    sunGroup.visible = false;
    registerNeighborhoodOffset(sunGroup, new THREE.Vector3(0, 0, 0));
    scene.add(sunGroup);
    neighborhoodStarSystems.push(sunGroup);
}

// ============ 添加邻域恒星组件 ============
function addNeighborhoodStarComponent(parent, component) {
    const componentGroup = new THREE.Group();
    const position = component.position || { x: 0, y: 0, z: 0 };
    const radius = component.radius || 4;
    const starColor = new THREE.Color(component.color || '#ffffff');

    componentGroup.position.set(position.x || 0, position.y || 0, position.z || 0);

    const starGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const starMaterial = createStarSurfaceMaterial(component.color || '#ffffff', component.textureProfile);
    const star = new THREE.Mesh(starGeometry, starMaterial);
    componentGroup.add(star);

    const glowGeometry = new THREE.SphereGeometry(radius * (component.glowScale || 1.8), 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            glowColor: { value: starColor },
            glowOpacity: { value: component.glowOpacity || 0.8 }
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 glowColor;
            uniform float glowOpacity;
            varying vec3 vNormal;
            void main() {
                float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(glowColor, intensity * glowOpacity);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    componentGroup.add(glow);

    if (component.label) {
        const labelOffsetY = component.labelOffsetY !== undefined ? component.labelOffsetY : radius * 2.4;
        createNeighborhoodComponentLabel(
            componentGroup,
            component.label,
            0,
            labelOffsetY,
            0,
            component.color || '#ffffff'
        );
    }

    parent.add(componentGroup);
    return componentGroup;
}

// ============ 创建邻域恒星组件标签 ============
function createNeighborhoodComponentLabel(parent, text, x, y, z, color) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 192;
    canvas.height = 64;

    context.fillStyle = 'rgba(0, 0, 0, 0.45)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = 'bold 18px Noto Sans SC';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = color;
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });

    const sprite = new THREE.Sprite(material);
    const labelWidth = text.length > 2 ? 24 : 12;
    sprite.scale.set(labelWidth, 8, 1);
    sprite.position.set(x, y, z);
    sprite.name = 'neighborhoodComponentLabel';

    parent.add(sprite);
}

// ============ 创建邻域视图中的恒星 ============
function createNeighborhoodStar(key, config, position) {
    const group = new THREE.Group();
    group.position.copy(position);

    // 根据恒星类型确定大小
    let starSize = 5;
    if (config.starType === 'triple') starSize = 7;
    else if (config.starType === 'binary') starSize = 6;

    if (config.components && config.components.length > 0) {
        for (const component of config.components) {
            addNeighborhoodStarComponent(group, component);
        }
    } else {
        // 主星
        const starGeometry = new THREE.SphereGeometry(starSize, 32, 32);
        const starMaterial = createStarSurfaceMaterial(config.color, config.textureProfile);
        const star = new THREE.Mesh(starGeometry, starMaterial);
        group.add(star);

        // 光晕
        const glowGeometry = new THREE.SphereGeometry(starSize * 1.8, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(config.color) }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(glowColor, intensity * 0.8);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        group.add(glow);
    }

    const systemRadius = config.systemRadius || starSize * 3;
    const labelOffsetY = config.labelOffsetY || starSize * 4;

    // 如果有行星，添加绿色脉冲环
    if (config.hasPlanets) {
        const planetRingGeometry = new THREE.RingGeometry(systemRadius, systemRadius * 1.15, 64);
        const planetRingMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const planetRing = new THREE.Mesh(planetRingGeometry, planetRingMaterial);
        planetRing.rotation.x = Math.PI / 2;
        planetRing.name = 'planetRing';
        group.add(planetRing);
    }

    // 距离指示线（从太阳到这颗恒星）
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array([
        SOLAR_SYSTEM_POS.x, SOLAR_SYSTEM_POS.y, SOLAR_SYSTEM_POS.z,
        position.x, position.y, position.z
    ]);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(config.color),
        transparent: true,
        opacity: 0.2
    });
    const distanceLine = new THREE.Line(lineGeometry, lineMaterial);
    distanceLine.name = 'distanceLine';
    // 将线添加到场景而不是恒星组（这样位置计算正确）
    scene.add(distanceLine);
    group.distanceLine = distanceLine;
    distanceLine.visible = false;

    // 点击目标
    const clickTarget = createStarSystemClickTarget(systemRadius * 1.2);
    group.add(clickTarget);
    group.clickTarget = clickTarget;

    // 标签（显示名称和距离）
    const data = starSystemData[key];
    if (data) {
        createNeighborhoodStarLabel(group, `${data.name}\n${config.distanceLY}光年`, 0, labelOffsetY, 0, key);
    }

    scene.add(group);
    return group;
}

// ============ 创建邻域恒星标签 ============
function createNeighborhoodStarLabel(parent, text, x, y, z, key) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 96;

    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = 'bold 20px Noto Sans SC';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#ffffff';

    const lines = text.split('\n');
    lines.forEach((line, index) => {
        context.fillText(line, canvas.width / 2, 30 + index * 28);
    });

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(35, 14, 1);
    sprite.position.set(x, y, z);
    sprite.name = 'neighborhoodStarLabel';
    sprite.starSystemKey = key;

    parent.add(sprite);
}

// ============ 创建恒星系统点击目标 ============
function createStarSystemClickTarget(radius) {
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
        colorWrite: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'clickTarget';
    return mesh;
}

// ============ 创建星系点击目标 ============
function createGalaxyClickTarget(pos, radius) {
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
        colorWrite: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'clickTarget';
    mesh.position.copy(pos);
    return mesh;
}

// ============ 创建星系名称标签（中英双语，中文大英文小）============
function createGalaxyLabel(parent, info, x, y, z, key) {
    // info 可以是字符串（向后兼容）或包含 name/nameEn 的对象
    const cn = (typeof info === 'string') ? info : info.name;
    const en = (typeof info === 'string') ? '' : (info.nameEn || '');

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 160;

    // 半透明背景圆角条
    context.fillStyle = 'rgba(0, 0, 0, 0.55)';
    const padX = 8;
    const padY = 8;
    const radius = 16;
    const w = canvas.width - padX * 2;
    const h = canvas.height - padY * 2;
    context.beginPath();
    context.moveTo(padX + radius, padY);
    context.lineTo(padX + w - radius, padY);
    context.quadraticCurveTo(padX + w, padY, padX + w, padY + radius);
    context.lineTo(padX + w, padY + h - radius);
    context.quadraticCurveTo(padX + w, padY + h, padX + w - radius, padY + h);
    context.lineTo(padX + radius, padY + h);
    context.quadraticCurveTo(padX, padY + h, padX, padY + h - radius);
    context.lineTo(padX, padY + radius);
    context.quadraticCurveTo(padX, padY, padX + radius, padY);
    context.closePath();
    context.fill();

    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // 中文（大字号）
    context.font = '700 56px "Noto Sans SC", sans-serif';
    context.fillStyle = '#ffffff';
    context.shadowColor = 'rgba(139, 92, 246, 0.8)';
    context.shadowBlur = 12;
    context.fillText(cn, canvas.width / 2, en ? 60 : canvas.height / 2);

    // 英文（小字号、青色、斜体）
    if (en) {
        context.shadowBlur = 0;
        context.font = 'italic 500 26px "Orbitron", "Noto Sans SC", sans-serif';
        context.fillStyle = '#9bd6ff';
        context.fillText(en, canvas.width / 2, 115);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false
    });

    const sprite = new THREE.Sprite(material);
    const config = galaxyRenderConfigs[key];
    const baseW = config && config.radius ? config.radius * 0.6 : 3000;
    // 标签宽度有上下限，避免极小或极大星系标签失衡
    const labelW = THREE.MathUtils.clamp(baseW, 1200, 14000);
    sprite.scale.set(labelW, labelW * 0.31, 1);
    sprite.position.set(x, y, z);
    sprite.name = 'galaxyLabel';
    sprite.galaxyKey = key;
    sprite.userData.baseLabelW = labelW;

    parent.add(sprite);
    galaxyLabels.push(sprite);
    return sprite;
}

// ============ 创建标签 ============
function createLabel(parent, text, x, y, z) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;

    context.fillStyle = 'rgba(0, 0, 0, 0.6)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = 'bold 24px Noto Sans SC';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#00ffff';

    const lines = text.split('\n');
    lines.forEach((line, index) => {
        context.fillText(line, canvas.width / 2, 40 + index * 35);
    });

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(150, 75, 1);
    sprite.position.set(x, y, z);

    parent.add(sprite);
}

// ============ 添加灯光 ============
function addLights() {
    const ambientLight = new THREE.AmbientLight(0x222233, 0.5);
    scene.add(ambientLight);
}

// ============ 高斯随机数 (Box-Muller变换) ============
function gaussianRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// ============ 动画循环 ============
function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);
    const distance = camera.position.length();
    const solarPositionForMotion = getSolarSystemWorldPosition(tempSolarSystemPosition);
    const distToSolarSystem = camera.position.distanceTo(solarPositionForMotion);
    const motionScale = getGalacticMotionScale(distance, distToSolarSystem);
    const frameStep = delta * 60 * motionScale;
    simulationTime += delta * motionScale;
    const elapsed = simulationTime;

    controls.update();

    // 动态调整近裁面（防止深度精度问题）
    if (distance > 100000) {
        camera.near = 100;
    } else if (distance > 10000) {
        camera.near = 10;
    } else {
        camera.near = 1;
    }
    camera.updateProjectionMatrix();

    // 动态调整缩放速度
    if (distance > 100000) {
        controls.zoomSpeed = 3.0;
    } else if (distance > 50000) {
        controls.zoomSpeed = 2.0;
    } else if (distance > 10000) {
        controls.zoomSpeed = 1.5;
    } else {
        controls.zoomSpeed = 1.0;
    }

    // 更新控制目标点（远距离时渐变到原点）
    updateControlsTarget(distance);

    // 银河系缓慢旋转
    // 背景星盘与著名恒星保持同向，页面默认视角下整体呈顺时针
    if (milkyWay) {
        milkyWay.rotation.y += GALACTIC_ROTATION_SPEED * frameStep;
    }

    updateGalacticMotion(elapsed);

    // 银河系 LOD
    if (milkyWay && milkyWayGlow) {
        if (distance > 80000) {
            milkyWay.visible = false;
            milkyWayGlow.visible = true;
            milkyWayGlow.material.opacity = Math.min((distance - 80000) / 50000, 0.8);
        } else {
            milkyWay.visible = true;
            milkyWayGlow.visible = false;
        }
    }

    // 远景显示明亮银核，拉近后才逐渐显出中心黑洞
    updateGalacticCenterAppearance(distance, elapsed);

    // 更新日球层
    if (heliopause && heliopause.material.uniforms) {
        heliopause.material.uniforms.time.value = elapsed;
    }

    // 太阳系标记脉冲
    if (solarSystem) {
        const pulseRing = solarSystem.getObjectByName('pulseRing');
        if (pulseRing) {
            const scale = 1 + Math.sin(elapsed * 2) * 0.2;
            pulseRing.scale.set(scale, scale, 1);
            pulseRing.material.opacity = 0.3 + Math.sin(elapsed * 2) * 0.2;
        }
    }

    // 奥尔特云缓慢旋转
    if (oortCloud) {
        oortCloud.rotation.y += 0.0002 * frameStep;
    }

    // 宇宙级结构 LOD（按距离淡入淡出）
    updateCosmicStructures(distance, elapsed);

    // 外部星系更新
    for (const galaxy of externalGalaxies) {
        // 缓慢旋转
        if (galaxy.particles) {
            galaxy.particles.rotation.y += 0.00005 * frameStep;
        }

        // LOD 切换
        const galaxyDist = camera.position.distanceTo(galaxy.position);
        const lodThreshold = galaxy.config.radius * 5;

        if (galaxy.particles && galaxy.sprite) {
            if (galaxyDist > lodThreshold) {
                galaxy.particles.visible = false;
                galaxy.sprite.visible = true;
                // 透明度随距离变化
                galaxy.sprite.material.opacity = Math.min(0.8, 0.3 + (galaxyDist - lodThreshold) / lodThreshold * 0.5);
            } else {
                galaxy.particles.visible = true;
                galaxy.sprite.visible = false;
            }
        }

        // 可见性控制
        const zoneDistance = camera.position.length();
        if (galaxy.config.zone === 'LOCAL') {
            // 银河系卫星（如 Sgr dSph）始终可见，但仅近距离显粒子
            galaxy.visible = true;
        } else if (galaxy.config.zone === 'A') {
            galaxy.visible = zoneDistance > 18000;
        } else {
            galaxy.visible = zoneDistance > 130000;
        }
    }

    // 恒星系统更新
    const solarPosition = getSolarSystemWorldPosition(tempSolarSystemPosition);
    updateStarSystems(elapsed, distance, solarPosition);

    // 更新太阳系邻域视图（多尺度切换）
    updateNeighborhoodView(elapsed, distance, solarPosition);

    // 更新悬停效果
    updateGalaxyHover();
    updateStarSystemHover();

    renderer.render(scene, camera);
}

// ============ 设置缩放焦点 ============
function setControlsFocus(point, options = {}) {
    if (!point) return;

    focusedControlsObject = null;
    focusedControlsTarget = point.clone();

    if (options.immediate) {
        controls.target.copy(focusedControlsTarget);
    }

    controls.update();
}

// ============ 聚焦到对象 ============
function focusControlsOnObject(object, options = {}) {
    if (!object) return;

    focusedControlsObject = object;
    object.getWorldPosition(tempFocusedWorldPosition);
    focusedControlsTarget = tempFocusedWorldPosition.clone();

    if (options.immediate) {
        controls.target.copy(tempFocusedWorldPosition);
    }

    controls.update();
}

// ============ 清除缩放焦点 ============
function clearControlsFocus() {
    focusedControlsTarget = null;
    focusedControlsObject = null;
}

// ============ 更新控制目标点 ============
function updateControlsTarget(distance) {
    const solarPosition = getSolarSystemWorldPosition(tempSolarSystemPosition);

    if (focusedControlsObject) {
        focusedControlsObject.getWorldPosition(tempFocusedWorldPosition);
        focusedControlsTarget = tempFocusedWorldPosition.clone();
    }

    if (focusedControlsTarget) {
        controls.target.lerp(focusedControlsTarget, 0.18);
        return;
    }

    // 默认以银河系中心为缩放中心，只有真正贴近太阳系邻域时才平滑切换到太阳系
    const solarFocusStart = NEIGHBORHOOD_THRESHOLD * 1.2;
    const distToSolarSystem = camera.position.distanceTo(solarPosition);

    if (distToSolarSystem < solarFocusStart) {
        const t = THREE.MathUtils.clamp(
            1 - (distToSolarSystem - NEIGHBORHOOD_THRESHOLD) / (solarFocusStart - NEIGHBORHOOD_THRESHOLD),
            0,
            1
        );
        controls.target.lerpVectors(GALACTIC_CENTER, solarPosition, t);
    } else {
        controls.target.copy(GALACTIC_CENTER);
    }
}

// ============ 窗口大小调整 ============
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============ 更新比例指示器 ============
function updateScaleIndicator() {
    const distance = camera.position.length();
    const distToSolarSystem = camera.position.distanceTo(getSolarSystemWorldPosition(tempSolarSystemPosition));
    const scaleValue = document.getElementById('scaleValue');
    let level;

    // 优先检查：如果接近太阳系，进入邻域视图模式
    if (distToSolarSystem < NEIGHBORHOOD_THRESHOLD) {
        if (distToSolarSystem > 100) {
            scaleValue.textContent = '⭐ 恒星邻域（放大）';
            level = 3;
        } else if (distToSolarSystem > 50) {
            scaleValue.textContent = '太阳系';
            level = 2;
        } else {
            scaleValue.textContent = '太阳系近处';
            level = 1;
        }
    } else if (distance < BLACK_HOLE_REVEAL_START_DISTANCE && controls.target.distanceTo(GALACTIC_CENTER) < 1200) {
        scaleValue.textContent = '银河系中心黑洞';
        level = 13;
    } else if (distance > 950000) {
        scaleValue.textContent = '可观测宇宙';
        level = 12;
    } else if (distance > 600000) {
        scaleValue.textContent = '拉尼亚凯亚超星系团';
        level = 11;
    } else if (distance > 350000) {
        scaleValue.textContent = '室女座星系团';
        level = 10;
    } else if (distance > 200000) {
        scaleValue.textContent = '本星系群外缘';
        level = 9;
    } else if (distance > 80000) {
        scaleValue.textContent = '本星系群';
        level = 8;
    } else if (distance > 25000) {
        scaleValue.textContent = '银河系近邻';
        level = 7;
    } else if (distance > 10000) {
        scaleValue.textContent = '银河系全景';
        level = 6;
    } else if (distance > 3000) {
        scaleValue.textContent = '猎户臂视角';
        level = 5;
    } else {
        scaleValue.textContent = '太阳系附近';
        level = 4;
    }

    // 更新信息面板
    if (level !== currentZoomLevel) {
        currentZoomLevel = level;
        updateInfoPanel(level);
        updateLegend(level);
        updateReturnButton(level);
    }
}

// ============ 更新信息面板 ============
function updateInfoPanel(level) {
    const infoPanel = document.getElementById('infoPanel');
    const infoContent = infoPanel.querySelector('.info-content');
    if (!infoContent) return;

    let content;
    if (level <= 2) {
        content = infoPanelContent.solarSystem;
    } else if (level === 3) {
        content = infoPanelContent.solarNeighborhood;
    } else if (level === 13) {
        content = infoPanelContent.galacticCenter;
    } else if (level === 4 || level === 5 || level === 6) {
        content = infoPanelContent.solarSystem;
    } else if (level === 7) {
        content = infoPanelContent.localNeighbors;
    } else if (level === 8 || level === 9) {
        content = infoPanelContent.localGroup;
    } else if (level === 10) {
        content = infoPanelContent.virgo;
    } else if (level === 11) {
        content = infoPanelContent.laniakea;
    } else {
        content = infoPanelContent.universe;
    }

    // 淡出动画
    infoContent.style.opacity = '0';

    setTimeout(() => {
        infoContent.innerHTML = `
            <h2>${content.title}</h2>
            ${content.paragraphs.map(p => `<p>${p}</p>`).join('')}
        `;
        // 淡入动画
        infoContent.style.opacity = '1';
    }, 300);
}

// ============ 更新图例 ============
function updateLegend(level) {
    const galaxyLegendItems = document.querySelectorAll('.legend-item.galaxy-type');
    const localLegendItems = document.querySelectorAll('.legend-item.local-type');
    const starLegendItems = document.querySelectorAll('.legend-item.star-type');

    // 星系类型图例：远距离（level >= 7）
    galaxyLegendItems.forEach(item => {
        item.style.display = level >= 7 ? 'flex' : 'none';
    });

    // 本地类型图例：银河系全景视图
    localLegendItems.forEach(item => {
        item.style.display = (level === 6 || level === 13) ? 'flex' : 'none';
    });

    // 恒星类型图例：恒星邻域放大视图（level === 3）
    starLegendItems.forEach(item => {
        item.style.display = (level === 3) ? 'flex' : 'none';
    });
}

// ============ 更新返回按钮 ============
function updateReturnButton(level) {
    const returnBtn = document.getElementById('returnToMilkyWay');
    if (returnBtn) {
        returnBtn.style.display = level >= 7 ? 'flex' : 'none';
    }
}

// ============ 返回银河系 ============
function returnToMilkyWay() {
    const targetPosition = new THREE.Vector3(0, 12000, 8000);
    const startPosition = camera.position.clone();
    const duration = 2000;
    const startTime = Date.now();
    clearControlsFocus();
    setActiveGalaxyDockItem(null);
    stopGalaxyAudio();

    function animateReturn() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        // 缓动函数
        const easeT = 1 - Math.pow(1 - t, 3);
        camera.position.lerpVectors(startPosition, targetPosition, easeT);
        controls.target.lerpVectors(controls.target.clone(), GALACTIC_CENTER, easeT);

        if (t < 1) {
            requestAnimationFrame(animateReturn);
        }
    }

    animateReturn();
}

// ============ 鼠标移动事件 ============
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// ============ 更新星系悬停效果 ============
let hoveredGalaxy = null;

function updateGalaxyHover() {
    raycaster.setFromCamera(mouse, camera);

    let found = null;

    for (const galaxy of externalGalaxies) {
        if (!galaxy.visible || !galaxy.clickTarget) continue;

        const intersects = raycaster.intersectObject(galaxy.clickTarget);
        if (intersects.length > 0) {
            found = galaxy;
            break;
        }
    }

    if (found !== hoveredGalaxy) {
        // 恢复之前的星系
        if (hoveredGalaxy && hoveredGalaxy.sprite) {
            hoveredGalaxy.sprite.material.opacity = 0.8;
        }

        hoveredGalaxy = found;

        // 高亮新星系
        if (hoveredGalaxy) {
            renderer.domElement.style.cursor = 'pointer';
            if (hoveredGalaxy.sprite && hoveredGalaxy.sprite.visible) {
                hoveredGalaxy.sprite.material.opacity = 1.0;
            }
        } else if (!hoveredStarSystem) {
            renderer.domElement.style.cursor = 'default';
        }
    }
}

// ============ 恒星系统更新函数 ============
function updateStarSystems(elapsed, distance, solarPosition) {
    // 计算到太阳系的距离，用于邻域视图判断
    const distToSolarSystem = camera.position.distanceTo(solarPosition);

    for (const starSystem of starSystems) {
        // 可见性控制
        const config = starSystem.config;
        let visible = false;
        let opacity = 1.0;

        // 邻域视图中隐藏银河尺度恒星（平滑过渡）
        if (distToSolarSystem < NEIGHBORHOOD_THRESHOLD) {
            visible = false;
            starSystem.visible = false;
            continue;
        } else if (distToSolarSystem < NEIGHBORHOOD_THRESHOLD * 1.5) {
            // 过渡区域：逐渐淡出
            opacity = (distToSolarSystem - NEIGHBORHOOD_THRESHOLD) / (NEIGHBORHOOD_THRESHOLD * 0.5);
        }

        if (config.zone === 'A') {
            // Zone A: 500-3000 距离可见，10000以上淡出
            if (distance >= 500 && distance <= 10000) {
                visible = true;
                if (distance > 3000) {
                    opacity = Math.min(opacity, 1.0 - (distance - 3000) / 7000);
                }
            }
        } else {
            // Zone B: 3000-10000 距离可见，25000以上淡出
            if (distance >= 3000 && distance <= 25000) {
                visible = true;
                if (distance > 10000) {
                    opacity = Math.min(opacity, 1.0 - (distance - 10000) / 15000);
                }
            }
        }

        // 太近时也淡出（< 500）
        if (distance < 500 && distance >= 150) {
            visible = true;
            opacity = Math.min(opacity, (distance - 150) / 350);
        } else if (distance < 150) {
            visible = false;
        }

        starSystem.visible = visible;

        // 更新透明度
        if (visible) {
            starSystem.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                    if (child.name !== 'planetRing' && child.name !== 'clickTarget') {
                        child.material.opacity = Math.max(0, Math.min(1, opacity * (child.material.userData?.baseOpacity || 0.8)));
                    }
                }
            });
        }

        // 行星脉冲环动画
        const planetRing = starSystem.getObjectByName('planetRing');
        if (planetRing && visible) {
            const scale = 1 + Math.sin(elapsed * 2) * 0.15;
            planetRing.scale.set(scale, scale, 1);
            planetRing.material.opacity = (0.4 + Math.sin(elapsed * 2) * 0.2) * opacity;
        }

        // 红超巨星脉动
        const supergiantGlow = starSystem.getObjectByName('supergiantGlow');
        if (supergiantGlow && supergiantGlow.material.uniforms) {
            supergiantGlow.material.uniforms.time.value = elapsed;
        }
    }
}

// ============ 更新太阳系邻域视图（多尺度切换）============
function updateNeighborhoodView(elapsed, distance, solarPosition) {
    // 计算相机到太阳系的距离
    const distToSolarSystem = camera.position.distanceTo(solarPosition);

    // 判断是否应该进入邻域视图
    const shouldBeNeighborhood = distToSolarSystem < NEIGHBORHOOD_THRESHOLD;

    // 视图切换
    if (shouldBeNeighborhood !== isNeighborhoodView) {
        isNeighborhoodView = shouldBeNeighborhood;

        // 切换银河系尺度恒星系统的可见性
        for (const starSystem of starSystems) {
            if (starSystem.config && starSystem.config.zone === 'A') {
                // Zone A 的恒星在邻域视图中隐藏
                // （它们会被邻域恒星替代）
            }
        }
    }

    // 计算平滑过渡因子
    let transitionFactor = 0;
    if (distToSolarSystem < NEIGHBORHOOD_THRESHOLD) {
        // 完全进入邻域视图
        transitionFactor = 1;
    } else if (distToSolarSystem < NEIGHBORHOOD_THRESHOLD * 1.5) {
        // 过渡区域
        transitionFactor = 1 - (distToSolarSystem - NEIGHBORHOOD_THRESHOLD) / (NEIGHBORHOOD_THRESHOLD * 0.5);
    }

    // 更新邻域恒星系统
    for (const starSystem of neighborhoodStarSystems) {
        // 设置可见性
        starSystem.visible = transitionFactor > 0.1;

        // 设置透明度（平滑过渡）
        if (starSystem.visible) {
            starSystem.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                    if (child.name !== 'planetRing' && child.name !== 'clickTarget') {
                        child.material.opacity = transitionFactor * 0.8;
                    }
                }
            });

            // 更新距离线可见性
            if (starSystem.distanceLine) {
                starSystem.distanceLine.visible = transitionFactor > 0.5;
                starSystem.distanceLine.material.opacity = transitionFactor * 0.25;
            }

            // 行星脉冲环动画
            const planetRing = starSystem.getObjectByName('planetRing');
            if (planetRing) {
                const scale = 1 + Math.sin(elapsed * 2) * 0.15;
                planetRing.scale.set(scale, scale, 1);
                planetRing.material.opacity = (0.4 + Math.sin(elapsed * 2) * 0.2) * transitionFactor;
            }
        } else {
            // 隐藏距离线
            if (starSystem.distanceLine) {
                starSystem.distanceLine.visible = false;
            }
        }
    }

    // 隐藏银河系尺度的太阳系标记（当进入邻域视图时）
    if (solarSystem) {
        // 在邻域视图中淡出原有太阳系标记
        const solarSystemOpacity = 1 - transitionFactor;
        solarSystem.traverse(child => {
            if (child.material && child.material.opacity !== undefined) {
                if (child.name !== 'pulseRing') {
                    child.material.opacity = solarSystemOpacity * 0.8;
                }
            }
        });

        // 完全进入邻域视图时隐藏太阳系标记
        solarSystem.visible = transitionFactor < 0.9;
    }
}

// ============ 恒星系统悬停效果 ============
let hoveredStarSystem = null;

function updateStarSystemHover() {
    raycaster.setFromCamera(mouse, camera);

    let found = null;

    // 首先检测邻域恒星系统
    if (isNeighborhoodView) {
        for (const starSystem of neighborhoodStarSystems) {
            if (!starSystem.visible || !starSystem.clickTarget) continue;
            if (starSystem.name === 'neighborhoodSun') continue;

            const intersects = raycaster.intersectObject(starSystem.clickTarget);
            if (intersects.length > 0) {
                found = starSystem;
                break;
            }
        }
    }

    // 然后检测银河系尺度恒星系统
    if (!found) {
        for (const starSystem of starSystems) {
            if (!starSystem.visible || !starSystem.clickTarget) continue;

            const intersects = raycaster.intersectObject(starSystem.clickTarget);
            if (intersects.length > 0) {
                found = starSystem;
                break;
            }
        }
    }

    if (found !== hoveredStarSystem) {
        hoveredStarSystem = found;

        if (hoveredStarSystem) {
            renderer.domElement.style.cursor = 'pointer';
        } else if (!hoveredGalaxy) {
            renderer.domElement.style.cursor = 'default';
        }
    }
}

// ============ 点击事件 ============
function onCanvasClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // 首先检测邻域恒星系统点击（当处于邻域视图时）
    if (isNeighborhoodView) {
        for (const starSystem of neighborhoodStarSystems) {
            if (!starSystem.visible || !starSystem.clickTarget) continue;
            // 跳过太阳（neighborhoodSun）
            if (starSystem.name === 'neighborhoodSun') continue;

            const intersects = raycaster.intersectObject(starSystem.clickTarget);
            if (intersects.length > 0) {
                focusControlsOnObject(starSystem, { immediate: true });
                showStarSystemPopup(starSystem.key, event.clientX, event.clientY);
                return;
            }
        }
    }

    // 检测银河系尺度恒星系统点击
    for (const starSystem of starSystems) {
        if (!starSystem.visible || !starSystem.clickTarget) continue;

        const intersects = raycaster.intersectObject(starSystem.clickTarget);
        if (intersects.length > 0) {
            focusControlsOnObject(starSystem, { immediate: true });
            showStarSystemPopup(starSystem.key, event.clientX, event.clientY);
            return;
        }
    }

    // 检测外部星系点击
    for (const galaxy of externalGalaxies) {
        if (!galaxy.visible || !galaxy.clickTarget) continue;

        const intersects = raycaster.intersectObject(galaxy.clickTarget);
        if (intersects.length > 0) {
            focusControlsOnObject(galaxy, { immediate: true });
            showGalaxyPopup(galaxy.key, event.clientX, event.clientY);
            return;
        }
    }

    // 检测银河系中心黑洞点击：只有放大到银心附近后才允许进入黑洞页面
    const cameraDistanceToCenter = camera.position.length();
    if (galacticCenter && cameraDistanceToCenter < BLACK_HOLE_REVEAL_START_DISTANCE) {
        const bhWorld = new THREE.Vector3(0, 0, 0);
        bhWorld.project(camera);
        // 黑洞在相机前方（z < 1）且在屏幕范围内
        if (bhWorld.z < 1 && Math.abs(bhWorld.x) < 2 && Math.abs(bhWorld.y) < 2) {
            const bhScreenX = (bhWorld.x + 1) / 2 * window.innerWidth;
            const bhScreenY = (-bhWorld.y + 1) / 2 * window.innerHeight;
            const dx = event.clientX - bhScreenX;
            const dy = event.clientY - bhScreenY;
            const screenDist = Math.sqrt(dx * dx + dy * dy);
            const reveal = THREE.MathUtils.clamp(
                1 - (cameraDistanceToCenter - BLACK_HOLE_FULL_REVEAL_DISTANCE) / (BLACK_HOLE_REVEAL_START_DISTANCE - BLACK_HOLE_FULL_REVEAL_DISTANCE),
                0,
                1
            );
            if (screenDist < 55 + reveal * 65) {
                window.location.href = 'blackhole-3d.html';
                return;
            }
        }
    }

    // 太阳系区域点击已禁用（因为添加了附近恒星系统）
}

// ============ 显示星系弹窗 ============
function showGalaxyPopup(key, x, y) {
    const data = galaxyData[key];
    if (!data) return;

    const popup = document.getElementById('galaxyPopup');
    if (!popup) return;

    hideStarSystemPopup();

    // 填充数据
    popup.querySelector('.galaxy-popup-name').textContent = data.name;
    popup.querySelector('.galaxy-popup-name-en').textContent = data.nameEn;
    popup.querySelector('.stat-type').textContent = data.type;
    popup.querySelector('.stat-distance').textContent = data.distance;
    popup.querySelector('.stat-diameter').textContent = data.diameter;
    popup.querySelector('.stat-stars').textContent = data.stars;
    popup.querySelector('.galaxy-popup-desc').textContent = data.description;
    popup.querySelector('.galaxy-popup-funfact').textContent = '💡 ' + data.funFact;

    // 定位弹窗
    const popupWidth = 360;
    const popupHeight = 400;
    let left = x + 20;
    let top = y - popupHeight / 2;

    // 边界检测
    if (left + popupWidth > window.innerWidth - 20) {
        left = x - popupWidth - 20;
    }
    if (top < 20) {
        top = 20;
    }
    if (top + popupHeight > window.innerHeight - 20) {
        top = window.innerHeight - popupHeight - 20;
    }

    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
    popup.classList.add('visible');
    playGalaxyAudio(key);
}

// ============ 隐藏星系弹窗 ============
function hideGalaxyPopup() {
    const popup = document.getElementById('galaxyPopup');
    if (popup) {
        popup.classList.remove('visible');
    }
}

// ============ 显示恒星系统弹窗 ============
function showStarSystemPopup(key, x, y) {
    const data = starSystemData[key];
    if (!data) return;

    const popup = document.getElementById('starSystemPopup');
    if (!popup) return;

    // 隐藏星系弹窗
    hideGalaxyPopup();
    stopGalaxyAudio();

    // 填充数据
    popup.querySelector('.star-popup-name').textContent = data.name;
    popup.querySelector('.star-popup-name-en').textContent = data.nameEn;
    popup.querySelector('.star-stat-type').textContent = data.type;
    popup.querySelector('.star-stat-spectral').textContent = data.spectralType;
    popup.querySelector('.star-stat-distance').textContent = data.distance;
    popup.querySelector('.star-stat-brightness').textContent = data.brightness;

    // 行星数量
    const planetsEl = popup.querySelector('.star-stat-planets');
    if (data.planets > 0) {
        planetsEl.textContent = `${data.planets}颗已确认`;
        planetsEl.style.color = '#00ff88';
    } else {
        planetsEl.textContent = '未发现';
        planetsEl.style.color = '';
    }

    popup.querySelector('.star-popup-desc').textContent = data.description;
    popup.querySelector('.star-popup-funfact').textContent = '💡 ' + data.funFact;

    // 定位弹窗
    const popupWidth = 360;
    const popupHeight = 420;
    let left = x + 20;
    let top = y - popupHeight / 2;

    // 边界检测
    if (left + popupWidth > window.innerWidth - 20) {
        left = x - popupWidth - 20;
    }
    if (top < 20) {
        top = 20;
    }
    if (top + popupHeight > window.innerHeight - 20) {
        top = window.innerHeight - popupHeight - 20;
    }

    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
    popup.classList.add('visible');
}

// ============ 隐藏恒星系统弹窗 ============
function hideStarSystemPopup() {
    const popup = document.getElementById('starSystemPopup');
    if (popup) {
        popup.classList.remove('visible');
    }
}

// ============ 启动 ============
window.addEventListener('DOMContentLoaded', init);
