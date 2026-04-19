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
const starTextureCache = new Map();
const NEIGHBORHOOD_THRESHOLD = 400; // 切换到邻域视图的距离阈值
const NEIGHBORHOOD_SCALE = 10; // 邻域视图中1光年 = 10单位
const GALACTIC_CENTER = new THREE.Vector3(0, 0, 0);
const GALACTIC_ROTATION_SPEED = -0.0002; // 整体放慢到更适合肉眼观察的速度
const tempSolarSystemPosition = new THREE.Vector3();
const tempFocusedWorldPosition = new THREE.Vector3();
const tempLineEndPosition = new THREE.Vector3();
const SOLAR_ORBIT_SETTINGS = {
    speedFactor: 0.97,
    bobAmplitude: 10,
    bobSpeedFactor: 0.5,
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
        particleCount: 8000,
        type: 'spiral',
        arms: 2,
        color: { r: 1.0, g: 0.9, b: 0.7 },
        tilt: { x: 0.3, z: 0.2 },
        zone: 'A'
    },
    triangulum: {
        position: new THREE.Vector3(-100000, -5000, 120000),
        radius: 12000,
        particleCount: 4000,
        type: 'spiral',
        arms: 3,
        color: { r: 0.8, g: 0.9, b: 1.0 },
        tilt: { x: -0.2, z: 0.4 },
        zone: 'A'
    },
    sombrero: {
        position: new THREE.Vector3(200000, 30000, -150000),
        radius: 10000,
        particleCount: 3000,
        type: 'spiral',
        arms: 2,
        color: { r: 1.0, g: 0.85, b: 0.6 },
        tilt: { x: 1.4, z: 0.1 }, // 几乎侧面
        zone: 'B'
    },
    whirlpool: {
        position: new THREE.Vector3(-180000, -20000, -200000),
        radius: 12000,
        particleCount: 5000,
        type: 'spiral',
        arms: 2,
        color: { r: 0.9, g: 0.95, b: 1.0 },
        tilt: { x: 0.1, z: 0.05 }, // 正面
        zone: 'B'
    },
    centaurusA: {
        position: new THREE.Vector3(150000, -40000, 100000),
        radius: 12000,
        particleCount: 3000,
        type: 'elliptical',
        color: { r: 1.0, g: 0.8, b: 0.5 },
        zone: 'B'
    },
    antennae: {
        position: new THREE.Vector3(-250000, 50000, 180000),
        radius: 15000,
        particleCount: 4500,
        type: 'interacting',
        color: { r: 0.85, g: 0.9, b: 1.0 },
        zone: 'B'
    }
};

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
        title: '🌌 本星系群',
        paragraphs: [
            '银河系属于<span class="highlight">本星系群</span>，这是一个包含50多个星系的星系集团。',
            '<span class="highlight">仙女座星系（M31）</span>是本群最大的星系，比银河系还大，正以每秒300公里的速度向我们靠近！',
            '约<span class="highlight">45亿年后</span>，银河系和仙女座星系将发生壮观的碰撞和合并。'
        ]
    },
    deepSpace: {
        title: '🌌 宇宙深处',
        paragraphs: [
            '在本星系群之外，宇宙中散布着<span class="highlight">数千亿</span>个星系。',
            '<span class="highlight">草帽星系</span>、<span class="highlight">漩涡星系</span>等都是天文学家最喜爱观测的目标。',
            '每个星系都是一个包含数十亿到数万亿恒星的"岛宇宙"，可能存在无数行星和生命！'
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
    const angle = orbit.angleOffset + diskAngle * orbit.speedFactor;
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

// ============ 初始化 ============
function init() {
    clock = new THREE.Clock();

    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020208);

    // 创建相机（扩展远裁面）
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        1000000
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
    controls.maxDistance = 500000;
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
            texWarm: { value: getStarTexture('yellow') },
            texHot: { value: getStarTexture('white') },
            texCool: { value: getStarTexture('orange') }
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
            uniform sampler2D texWarm;
            uniform sampler2D texHot;
            uniform sampler2D texCool;

            varying vec2 vUv;

            float luma(vec3 c) {
                return dot(c, vec3(0.299, 0.587, 0.114));
            }

            float sampleTextureBand(sampler2D tex, vec2 uv) {
                return luma(texture2D(tex, uv).rgb);
            }

            void main() {
                vec2 p = vUv * 2.0 - 1.0;
                p.x *= 1.12;

                float r = length(vec2(p.x * 0.98, p.y * 1.04));
                float x = p.x;
                float y = p.y;

                float horizon = 1.0 - smoothstep(0.58, 0.605, r);
                float photonRing = exp(-pow((r - 0.62) / 0.022, 2.0));
                float innerHalo = exp(-pow((r - 0.68) / 0.07, 2.0));

                float diskBand = exp(-pow(y / 0.07, 2.0));
                float diskCore = exp(-pow(y / 0.03, 2.0));
                float diskFalloff = 1.0 - smoothstep(0.7, 1.08, abs(x));

                float topLift = 0.28 + 0.42 * exp(-pow(x / 0.48, 2.0));
                float topWidth = mix(0.08, 0.17, exp(-pow(x / 0.6, 2.0)));
                float topArc = exp(-pow((y - topLift) / topWidth, 2.0));

                float bottomLift = -0.25 - 0.3 * exp(-pow(x / 0.42, 2.0));
                float bottomWidth = mix(0.06, 0.11, exp(-pow(x / 0.58, 2.0)));
                float bottomArc = exp(-pow((y - bottomLift) / bottomWidth, 2.0));

                float texWarmA = sampleTextureBand(texWarm, vec2(
                    fract(x * 0.18 + 0.5 - time * 0.01),
                    fract(abs(y) * 1.8 + time * 0.005)
                ));
                float texHotA = sampleTextureBand(texHot, vec2(
                    fract(x * 0.35 + 0.5 + time * 0.014),
                    fract(abs(y) * 3.2 - time * 0.004)
                ));
                float texCoolA = sampleTextureBand(texCool, vec2(
                    fract(x * 0.28 + 0.5 - time * 0.012),
                    fract(abs(y) * 2.4 + time * 0.006)
                ));

                float diskTexture = clamp(texWarmA * 0.55 + texHotA * 0.4 + texCoolA * 0.25, 0.0, 1.3);
                float arcTexture = clamp(texHotA * 0.45 + texWarmA * 0.3, 0.0, 1.1);
                float doppler = 1.0 + clamp(x, -1.0, 1.0) * 0.24;

                vec3 diskColor = mix(vec3(0.38, 0.18, 0.08), vec3(1.0, 0.84, 0.48), smoothstep(0.15, 0.95, diskTexture));
                vec3 diskHotColor = mix(diskColor, vec3(1.0, 0.98, 0.95), smoothstep(0.45, 1.0, diskCore + diskTexture * 0.45));
                vec3 arcColor = mix(vec3(0.74, 0.79, 0.92), vec3(0.98, 0.98, 1.0), smoothstep(0.2, 1.0, arcTexture));
                vec3 outerBlue = vec3(0.26, 0.34, 0.62);

                vec3 color = vec3(0.0);
                color += diskHotColor * diskBand * diskFalloff * (0.32 + diskTexture * 0.62) * doppler;
                color += diskHotColor * diskCore * diskFalloff * 0.34;
                color += arcColor * topArc * (0.22 + arcTexture * 0.22);
                color += arcColor * bottomArc * (0.08 + arcTexture * 0.1);
                color += vec3(0.98, 0.97, 1.0) * photonRing * 0.56;
                color += vec3(1.0, 0.9, 0.72) * innerHalo * 0.1;
                color += outerBlue * exp(-pow(r / 1.25, 2.0)) * 0.12;

                float alpha = 0.0;
                alpha += diskBand * diskFalloff * (0.34 + diskTexture * 0.28);
                alpha += topArc * 0.32;
                alpha += bottomArc * 0.13;
                alpha += photonRing * 0.24;
                alpha += innerHalo * 0.08;
                alpha = clamp(alpha, 0.0, 0.95);

                vec3 finalColor = color * (1.0 - horizon);
                finalColor = mix(finalColor, vec3(0.0), horizon);

                float finalAlpha = max(alpha, horizon * 0.98);
                if (finalAlpha < 0.01) discard;

                gl_FragColor = vec4(finalColor, finalAlpha);
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

    const blackHoleCard = new THREE.Mesh(
        new THREE.PlaneGeometry(2350, 1600),
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
    coolHalo.scale.set(3000, 2050, 1);
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
    warmHalo.scale.set(1680, 1100, 1);
    warmHalo.position.set(0, -10, -5);
    warmHalo.renderOrder = 20;
    galacticCenter.add(warmHalo);

    const coreShadow = new THREE.Mesh(
        new THREE.SphereGeometry(140, 64, 64),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.92,
            depthWrite: false,
            depthTest: false
        })
    );
    coreShadow.name = 'coreShadow';
    coreShadow.renderOrder = 22;
    galacticCenter.add(coreShadow);

    scene.add(galacticCenter);
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
        }

        if (galaxyObj) {
            galaxyObj.key = key;
            galaxyObj.config = config;
            externalGalaxies.push(galaxyObj);
        }
    }
}

// ============ 创建螺旋星系 ============
function createSpiralGalaxy(key, config) {
    const group = new THREE.Group();
    group.position.copy(config.position);

    // 粒子系统
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(config.particleCount * 3);
    const colors = new Float32Array(config.particleCount * 3);
    const sizes = new Float32Array(config.particleCount);

    const arms = config.arms || 2;
    const radius = config.radius;

    for (let i = 0; i < config.particleCount; i++) {
        const armIndex = i % arms;
        const armAngle = (armIndex / arms) * Math.PI * 2;

        const distance = Math.pow(Math.random(), 0.5) * radius;
        const spiralAngle = distance * 0.0008 + armAngle;
        const spread = (Math.random() - 0.5) * distance * 0.3;

        const x = Math.cos(spiralAngle) * distance + Math.cos(spiralAngle + Math.PI / 2) * spread;
        const z = Math.sin(spiralAngle) * distance + Math.sin(spiralAngle + Math.PI / 2) * spread;
        const diskThickness = radius * 0.02 * (1 - distance / radius * 0.5);
        const y = (Math.random() - 0.5) * diskThickness;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        const distRatio = distance / radius;
        const c = config.color;
        if (distRatio < 0.2) {
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g * 0.9;
            colors[i * 3 + 2] = c.b * 0.6;
            sizes[i] = 4 + Math.random() * 3;
        } else {
            colors[i * 3] = c.r * 0.8;
            colors[i * 3 + 1] = c.g * 0.9;
            colors[i * 3 + 2] = c.b;
            sizes[i] = 2 + Math.random() * 2;
        }
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
                gl_PointSize = clamp(gl_PointSize, 1.0, 10.0);
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

    // 应用倾角
    if (config.tilt) {
        particles.rotation.x = config.tilt.x || 0;
        particles.rotation.z = config.tilt.z || 0;
    }

    group.add(particles);
    group.particles = particles;

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

    // 创建标签
    createGalaxyLabel(group, galaxyData[key].name, 0, config.radius * 0.6, 0, key);

    scene.add(group);
    return group;
}

// ============ 创建椭圆星系 ============
function createEllipticalGalaxy(key, config) {
    const group = new THREE.Group();
    group.position.copy(config.position);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(config.particleCount * 3);
    const colors = new Float32Array(config.particleCount * 3);
    const sizes = new Float32Array(config.particleCount);

    for (let i = 0; i < config.particleCount; i++) {
        // 高斯分布
        const r = gaussianRandom() * config.radius * 0.4;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        // 椭球形状（y轴压扁）
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
        positions[i * 3 + 2] = r * Math.cos(phi);

        const c = config.color;
        const distRatio = r / (config.radius * 0.4);
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g * (1 - distRatio * 0.2);
        colors[i * 3 + 2] = c.b * (1 - distRatio * 0.3);
        sizes[i] = 3 + Math.random() * 2;
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
                gl_PointSize = clamp(gl_PointSize, 1.0, 10.0);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;

            void main() {
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);
                float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                gl_FragColor = vec4(vColor, alpha * 0.6);
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
        opacity: 0.8
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

    // 标签
    createGalaxyLabel(group, galaxyData[key].name, 0, config.radius * 0.5, 0, key);

    scene.add(group);
    return group;
}

// ============ 创建不规则星系 ============
function createIrregularGalaxy(key, config) {
    const group = new THREE.Group();
    group.position.copy(config.position);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(config.particleCount * 3);
    const colors = new Float32Array(config.particleCount * 3);
    const sizes = new Float32Array(config.particleCount);

    // 创建多个随机团块
    const clumps = 5 + Math.floor(Math.random() * 5);
    const clumpCenters = [];
    for (let c = 0; c < clumps; c++) {
        clumpCenters.push({
            x: (Math.random() - 0.5) * config.radius * 0.8,
            y: (Math.random() - 0.5) * config.radius * 0.3,
            z: (Math.random() - 0.5) * config.radius * 0.8,
            size: 0.2 + Math.random() * 0.3
        });
    }

    for (let i = 0; i < config.particleCount; i++) {
        const clump = clumpCenters[Math.floor(Math.random() * clumps)];
        const r = gaussianRandom() * config.radius * clump.size;

        positions[i * 3] = clump.x + (Math.random() - 0.5) * r;
        positions[i * 3 + 1] = clump.y + (Math.random() - 0.5) * r * 0.5;
        positions[i * 3 + 2] = clump.z + (Math.random() - 0.5) * r;

        const c = config.color;
        // 蓝白色调（活跃恒星形成）
        colors[i * 3] = c.r * (0.8 + Math.random() * 0.2);
        colors[i * 3 + 1] = c.g * (0.9 + Math.random() * 0.1);
        colors[i * 3 + 2] = c.b;
        sizes[i] = 2 + Math.random() * 2;
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
    sprite.scale.set(config.radius * 1.2, config.radius * 0.8, 1);
    sprite.visible = false;
    group.add(sprite);
    group.sprite = sprite;

    // 点击目标
    const clickTarget = createGalaxyClickTarget(new THREE.Vector3(0, 0, 0), config.radius * 0.6);
    group.add(clickTarget);
    group.clickTarget = clickTarget;

    // 标签
    createGalaxyLabel(group, galaxyData[key].name, 0, config.radius * 0.4, 0, key);

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

    // 标签
    createGalaxyLabel(group, galaxyData[key].name, 0, config.radius * 0.4, 0, key);

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
                bobAmplitude: config.size === 'hypergiant' ? 18 : 10,
                bobSpeedFactor: 0.45
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

// ============ 创建星系名称标签 ============
function createGalaxyLabel(parent, text, x, y, z, key) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;

    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = 'bold 36px Noto Sans SC';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#ffffff';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });

    const sprite = new THREE.Sprite(material);
    const config = galaxyRenderConfigs[key];
    sprite.scale.set(config.radius * 0.8, config.radius * 0.2, 1);
    sprite.position.set(x, y, z);
    sprite.name = 'galaxyLabel';
    sprite.galaxyKey = key;

    parent.add(sprite);
    galaxyLabels.push(sprite);
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

    const elapsed = clock.getElapsedTime();
    const distance = camera.position.length();

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
    // 按常见天文学俯视图约定：从北银极看，银河系整体应为顺时针旋转
    if (milkyWay) {
        milkyWay.rotation.y += GALACTIC_ROTATION_SPEED;
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

    // 更新黑洞吸积盘
    if (galacticCenter) {
        const blackHoleCard = galacticCenter.getObjectByName('blackHoleCard');
        const coolHalo = galacticCenter.getObjectByName('coolHalo');
        const warmHalo = galacticCenter.getObjectByName('warmHalo');
        const coreShadow = galacticCenter.getObjectByName('coreShadow');

        if (blackHoleCard) {
            blackHoleCard.quaternion.copy(camera.quaternion);
            const pulse = 1 + Math.sin(elapsed * 0.7) * 0.015;
            blackHoleCard.scale.set(pulse, pulse, 1);
        }

        if (coolHalo) {
            coolHalo.material.opacity = 0.11 + Math.sin(elapsed * 0.35) * 0.015;
        }

        if (warmHalo) {
            warmHalo.material.opacity = 0.105 + Math.cos(elapsed * 0.48) * 0.015;
        }

        if (coreShadow) {
            coreShadow.material.opacity = 0.9 + Math.sin(elapsed * 0.5) * 0.02;
        }

        galacticCenter.children.forEach(child => {
            if (child.material && child.material.uniforms && child.material.uniforms.time) {
                child.material.uniforms.time.value = elapsed;
            }
        });
    }

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
        oortCloud.rotation.y += 0.0002;
    }

    // 外部星系更新
    for (const galaxy of externalGalaxies) {
        // 缓慢旋转
        if (galaxy.particles) {
            galaxy.particles.rotation.y += 0.00005;
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
        if (galaxy.config.zone === 'A') {
            galaxy.visible = zoneDistance > 20000;
        } else {
            galaxy.visible = zoneDistance > 150000;
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
    } else if (distance > 200000) {
        scaleValue.textContent = '宇宙深处';
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
        // 恒星邻域放大视图
        content = infoPanelContent.solarNeighborhood;
    } else if (level === 4 || level === 5) {
        content = infoPanelContent.solarSystem;
    } else if (level === 6) {
        content = infoPanelContent.solarSystem;
    } else if (level === 7) {
        content = infoPanelContent.localNeighbors;
    } else if (level === 8) {
        content = infoPanelContent.localGroup;
    } else {
        content = infoPanelContent.deepSpace;
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
        item.style.display = (level === 6) ? 'flex' : 'none';
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

    // 检测银河系中心黑洞点击（投影距离检测，跳转到黑洞页面）
    if (galacticCenter) {
        const bhWorld = new THREE.Vector3(0, 0, 0);
        bhWorld.project(camera);
        // 黑洞在相机前方（z < 1）且在屏幕范围内
        if (bhWorld.z < 1 && Math.abs(bhWorld.x) < 2 && Math.abs(bhWorld.y) < 2) {
            const bhScreenX = (bhWorld.x + 1) / 2 * window.innerWidth;
            const bhScreenY = (-bhWorld.y + 1) / 2 * window.innerHeight;
            const dx = event.clientX - bhScreenX;
            const dy = event.clientY - bhScreenY;
            const screenDist = Math.sqrt(dx * dx + dy * dy);
            // 新版银心黑洞更显眼，适当放宽点击命中范围
            if (screenDist < 110) {
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
