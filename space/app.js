/**
 * 太阳系 3D 探索 - 柳智天的宇宙课堂
 * 使用 Three.js 创建的交互式太阳系动画
 */

// ============ 行星数据 ============
const planetData = {
    sun: {
        name: '太阳',
        nameCN: '太阳',
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
        type: '类地行星',
        diameter: 12104,
        mass: 4.87, // 10²⁴ kg
        category: 'terrestrial',
        distance: 108.2,
        orbitPeriod: 225,
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
        type: '类地行星',
        diameter: 12742,
        mass: 5.97, // 10²⁴ kg
        category: 'terrestrial',
        distance: 149.6,
        orbitPeriod: 365,
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
    jupiter: {
        name: '木星',
        nameCN: '木星',
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
    oortCloud: {
        name: '奥尔特云',
        nameCN: '奥尔特云',
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
let currentComparisonTab = 'diameter'; // 'diameter' 或 'mass'

// ============ 卫星数据 ============
const moonsData = {
    // 火星的卫星
    mars: [
        { name: '火卫一', nameCN: '火卫一', diameter: 22.2, orbitRadius: 2.5, orbitSpeed: 0.08, color: 0x8b7355 },
        { name: '火卫二', nameCN: '火卫二', diameter: 12.6, orbitRadius: 3.5, orbitSpeed: 0.05, color: 0x9a8b7a }
    ],
    // 木星的伽利略卫星
    jupiter: [
        { name: '木卫一', nameCN: '木卫一', diameter: 3643, orbitRadius: 8, orbitSpeed: 0.07, color: 0xffdd44, desc: '艾奥，火山最活跃的天体' },
        { name: '木卫二', nameCN: '木卫二', diameter: 3122, orbitRadius: 10, orbitSpeed: 0.055, color: 0xccddee, desc: '欧罗巴，冰下可能有海洋' },
        { name: '木卫三', nameCN: '木卫三', diameter: 5268, orbitRadius: 12.5, orbitSpeed: 0.04, color: 0xaabbcc, desc: '盖尼米德，最大的卫星' },
        { name: '木卫四', nameCN: '木卫四', diameter: 4821, orbitRadius: 15, orbitSpeed: 0.03, color: 0x887766, desc: '卡利斯托，古老的冰世界' }
    ],
    // 土星的卫星
    saturn: [
        { name: '土卫六', nameCN: '土卫六', diameter: 5150, orbitRadius: 14, orbitSpeed: 0.035, color: 0xddaa55, desc: '泰坦，有浓厚大气层' },
        { name: '土卫二', nameCN: '土卫二', diameter: 504, orbitRadius: 10, orbitSpeed: 0.06, color: 0xffffff, desc: '恩克拉多斯，喷射冰泉' },
        { name: '土卫五', nameCN: '土卫五', diameter: 1527, orbitRadius: 12, orbitSpeed: 0.045, color: 0xcccccc, desc: '瑞亚，冰质卫星' }
    ],
    // 天王星的卫星
    uranus: [
        { name: '天卫三', nameCN: '天卫三', diameter: 1578, orbitRadius: 7, orbitSpeed: 0.05, color: 0xaabbbb, desc: '泰坦尼亚' },
        { name: '天卫四', nameCN: '天卫四', diameter: 1523, orbitRadius: 9, orbitSpeed: 0.04, color: 0x99aaaa, desc: '奥伯龙' }
    ],
    // 海王星的卫星
    neptune: [
        { name: '海卫一', nameCN: '海卫一', diameter: 2707, orbitRadius: 7, orbitSpeed: -0.04, color: 0xddccbb, desc: '特里同，逆行卫星' }
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

    // 生成大小对比
    generateSizeComparison();
    setupComparisonTabs();

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
    // 太阳本体 - 炙热的核心
    const sunGeometry = new THREE.SphereGeometry(15, 128, 128);
    const sunMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vPosition;
            uniform float time;
            
            // 简单噪声用于表面变形
            float hash(vec3 p) {
                return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
            }
            
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
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vPosition;
            
            // 高级噪声函数
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
            
            float snoise(vec3 v) {
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                
                vec3 i  = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);
                
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);
                
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;
                
                i = mod289(i);
                vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                
                float n_ = 0.142857142857;
                vec3 ns = n_ * D.wyz - D.xzx;
                
                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                
                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);
                
                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);
                
                vec4 b0 = vec4(x.xy, y.xy);
                vec4 b1 = vec4(x.zw, y.zw);
                
                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));
                
                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
                
                vec3 p0 = vec3(a0.xy, h.x);
                vec3 p1 = vec3(a0.zw, h.y);
                vec3 p2 = vec3(a1.xy, h.z);
                vec3 p3 = vec3(a1.zw, h.w);
                
                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;
                
                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
            }
            
            float fbm(vec3 p) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.0;
                for (int i = 0; i < 6; i++) {
                    value += amplitude * snoise(p * frequency);
                    amplitude *= 0.5;
                    frequency *= 2.0;
                }
                return value;
            }
            
            void main() {
                vec3 pos = vPosition;
                
                // 多层次动态纹理 - 模拟太阳表面对流层
                float noise1 = fbm(pos * 0.5 + time * 0.3);
                float noise2 = fbm(pos * 1.0 - time * 0.2);
                float noise3 = fbm(pos * 2.0 + time * 0.5);
                float noise4 = fbm(pos * 4.0 - time * 0.8); // 细节层
                
                // 太阳黑子效果
                float sunspot = smoothstep(0.6, 0.65, noise1) * smoothstep(0.55, 0.5, noise2);
                
                // 炙热的颜色渐变 - 从白热到暗红
                vec3 coreWhite = vec3(1.0, 1.0, 0.95);      // 核心白热
                vec3 hotYellow = vec3(1.0, 0.95, 0.4);      // 高温黄
                vec3 fireOrange = vec3(1.0, 0.6, 0.1);       // 火焰橙
                vec3 deepRed = vec3(0.9, 0.2, 0.05);         // 深红
                vec3 darkSpot = vec3(0.3, 0.1, 0.05);        // 太阳黑子
                
                // 混合颜色
                float colorMix = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
                vec3 baseColor = mix(coreWhite, hotYellow, colorMix);
                baseColor = mix(baseColor, fireOrange, noise2 * 0.6);
                baseColor = mix(baseColor, deepRed, noise3 * 0.4);
                
                // 添加太阳黑子
                baseColor = mix(baseColor, darkSpot, sunspot * 0.7);
                
                // 添加炽热的高光细节
                float highlight = pow(noise4 * 0.5 + 0.5, 3.0);
                baseColor += coreWhite * highlight * 0.3;
                
                // 边缘暗化（临边昏暗效果）
                float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
                float limbDarkening = pow(fresnel, 0.4);
                baseColor *= limbDarkening * 0.4 + 0.6;
                
                // 脉动效果
                float pulse = sin(time * 1.5) * 0.05 + 1.0;
                baseColor *= pulse;
                
                // 增加整体亮度
                baseColor *= 1.2;
                
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
    // 太阳本体 - 简洁卡通风格
    const sunGeometry = new THREE.SphereGeometry(15, 64, 64);
    const sunMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
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
            varying vec3 vNormal;
            varying vec2 vUv;
            
            // 简单噪声函数
            float noise(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }
            
            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                for (int i = 0; i < 5; i++) {
                    value += amplitude * noise(p);
                    p *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }
            
            void main() {
                vec2 uv = vUv;
                
                // 动态纹理
                float n = fbm(uv * 10.0 + time * 0.1);
                float n2 = fbm(uv * 20.0 - time * 0.15);
                
                // 颜色渐变 - 柔和的黄橙色
                vec3 color1 = vec3(1.0, 0.95, 0.5);  // 亮黄色
                vec3 color2 = vec3(1.0, 0.7, 0.2);   // 橙黄色
                vec3 color3 = vec3(1.0, 0.5, 0.1);   // 橙色
                
                vec3 color = mix(color1, color2, n);
                color = mix(color, color3, n2 * 0.3);
                
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

    console.log('太阳样式已切换为:', style === 'simple' ? '简洁模式' : '炙热模式');
}

// ============ 创建行星 ============
function createPlanets() {
    const planetNames = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

    planetNames.forEach(name => {
        const data = planetData[name];

        // 计算行星大小（教学模式下放大比例以便观看）
        let size;
        if (name === 'jupiter' || name === 'saturn') {
            size = 4 + data.relativeSize * 0.4;
        } else if (name === 'uranus' || name === 'neptune') {
            size = 2.5 + data.relativeSize * 0.3;
        } else {
            size = 1 + data.relativeSize * 1.5;
        }

        // 创建行星
        const geometry = new THREE.SphereGeometry(size, 64, 64);

        let planet;

        // 为地球创建特殊的真实效果
        if (name === 'earth') {
            planet = createRealisticEarth(size);
        } else if (name === 'jupiter') {
            planet = createRealisticJupiter(size);
        } else {
            // 创建材质
            const material = new THREE.MeshPhongMaterial({
                color: data.color,
                emissive: data.emissive,
                emissiveIntensity: 0.1,
                shininess: 30
            });

            planet = new THREE.Mesh(geometry, material);
        }

        planet.name = name;
        planet.userData = {
            ...data,
            orbitAngle: Math.random() * Math.PI * 2,
            orbitSpeed: 0.5 / Math.sqrt(data.orbitRadius),
            rotationSpeed: 0.01 / data.rotationPeriod,
            size: size
        };

        // 设置初始位置
        planet.position.x = data.orbitRadius;

        // 土星光环
        if (data.hasRings) {
            createSaturnRings(planet, size);
        }

        // 创建行星标签
        createPlanetLabel(planet, data.nameCN);

        scene.add(planet);
        planets[name] = planet;
    });
}

// ============ 创建真实地球 ============
function createRealisticEarth(size) {
    const geometry = new THREE.SphereGeometry(size, 128, 128);

    // 使用着色器创建真实的地球外观
    const earthMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vPosition;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vUv = uv;
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vPosition;
            
            // 噪声函数用于生成大陆
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }
            
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }
            
            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                for (int i = 0; i < 6; i++) {
                    value += amplitude * noise(p);
                    p *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }
            
            void main() {
                vec2 uv = vUv;
                
                // 生成大陆形状
                float continent = fbm(uv * 8.0 + vec2(1.5, 0.5));
                continent += fbm(uv * 16.0) * 0.3;
                
                // 调整大陆分布
                float landMask = smoothstep(0.45, 0.55, continent);
                
                // 海洋颜色 - 深蓝到浅蓝渐变
                vec3 deepOcean = vec3(0.02, 0.08, 0.25);
                vec3 shallowOcean = vec3(0.1, 0.3, 0.55);
                vec3 oceanColor = mix(deepOcean, shallowOcean, fbm(uv * 20.0) * 0.5 + 0.3);
                
                // 大陆颜色
                vec3 forest = vec3(0.1, 0.35, 0.15);      // 森林绿
                vec3 plains = vec3(0.25, 0.45, 0.2);      // 草原
                vec3 desert = vec3(0.65, 0.55, 0.35);     // 沙漠
                vec3 mountains = vec3(0.4, 0.35, 0.3);    // 山脉
                
                // 根据位置混合不同地形
                float terrainNoise = fbm(uv * 12.0 + 3.0);
                vec3 landColor = mix(forest, plains, terrainNoise);
                
                // 添加沙漠区域（赤道附近）
                float equator = 1.0 - abs(uv.y - 0.5) * 2.0;
                float desertMask = smoothstep(0.5, 0.7, terrainNoise) * equator;
                landColor = mix(landColor, desert, desertMask * 0.7);
                
                // 添加山脉
                float mountainNoise = fbm(uv * 25.0);
                float mountainMask = smoothstep(0.6, 0.75, mountainNoise);
                landColor = mix(landColor, mountains, mountainMask * 0.5);
                
                // 极地冰盖
                float polar = smoothstep(0.15, 0.0, uv.y) + smoothstep(0.85, 1.0, uv.y);
                vec3 ice = vec3(0.9, 0.95, 1.0);
                
                // 混合海洋和陆地
                vec3 surfaceColor = mix(oceanColor, landColor, landMask);
                
                // 添加冰盖
                surfaceColor = mix(surfaceColor, ice, polar * 0.8);
                
                // 云层效果
                float clouds = fbm(uv * 6.0 + time * 0.01);
                clouds = smoothstep(0.4, 0.7, clouds);
                vec3 cloudColor = vec3(1.0, 1.0, 1.0);
                surfaceColor = mix(surfaceColor, cloudColor, clouds * 0.4);
                
                // 大气散射效果（边缘发蓝光）
                float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                vec3 atmosphere = vec3(0.3, 0.6, 1.0);
                surfaceColor = mix(surfaceColor, atmosphere, fresnel * 0.4);
                
                // 光照
                vec3 lightDir = normalize(vec3(-1.0, 0.3, 0.5));
                float diff = max(dot(vNormal, lightDir), 0.0);
                surfaceColor *= (diff * 0.6 + 0.4);
                
                gl_FragColor = vec4(surfaceColor, 1.0);
            }
        `
    });

    const earth = new THREE.Mesh(geometry, earthMaterial);

    // 添加大气层光晕
    const atmosphereGeometry = new THREE.SphereGeometry(size * 1.15, 64, 64);
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
                float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
                vec3 atmosphereColor = vec3(0.3, 0.6, 1.0);
                gl_FragColor = vec4(atmosphereColor, intensity * 0.6);
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

// ============ 创建真实木星（带大红斑）============
function createRealisticJupiter(size) {
    const geometry = new THREE.SphereGeometry(size, 128, 128);

    const jupiterMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vPosition;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vUv = uv;
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vPosition;
            
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }
            
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }
            
            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                for (int i = 0; i < 5; i++) {
                    value += amplitude * noise(p);
                    p *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }
            
            void main() {
                vec2 uv = vUv;
                
                // 木星条纹 - 水平带状结构
                float bands = sin(uv.y * 25.0) * 0.5 + 0.5;
                float bandNoise = fbm(vec2(uv.x * 8.0 + time * 0.02, uv.y * 30.0));
                bands = bands * 0.7 + bandNoise * 0.3;
                
                // 木星基础颜色
                vec3 lightBand = vec3(0.95, 0.9, 0.8);   // 浅色带
                vec3 darkBand = vec3(0.75, 0.6, 0.45);   // 深色带
                vec3 orangeBand = vec3(0.9, 0.7, 0.5);   // 橙色带
                
                // 混合条纹颜色
                vec3 baseColor = mix(darkBand, lightBand, bands);
                float orangeZone = sin(uv.y * 12.0 + 1.5) * 0.5 + 0.5;
                baseColor = mix(baseColor, orangeBand, orangeZone * 0.4);
                
                // 添加湍流细节
                float turbulence = fbm(vec2(uv.x * 20.0 + time * 0.03, uv.y * 40.0));
                baseColor += vec3(turbulence * 0.1 - 0.05);
                
                // ====== 大红斑 ======
                // 大红斑位置（南半球，约22度）
                vec2 grsCenter = vec2(0.3, 0.35); // 红斑中心
                vec2 grsSize = vec2(0.12, 0.06);   // 红斑大小（椭圆形）
                
                // 计算到红斑中心的距离（椭圆）
                vec2 grsOffset = uv - grsCenter;
                float grsDist = length(grsOffset / grsSize);
                
                // 红斑颜色
                vec3 grsColorOuter = vec3(0.8, 0.4, 0.3);  // 外圈偏红
                vec3 grsColorInner = vec3(0.95, 0.5, 0.35); // 内圈偏橙
                vec3 grsColorCore = vec3(0.7, 0.25, 0.2);   // 核心深红
                
                // 红斑内部的漩涡
                float grsAngle = atan(grsOffset.y, grsOffset.x);
                float grsSpiral = sin(grsAngle * 3.0 + grsDist * 15.0 - time * 0.5) * 0.5 + 0.5;
                
                // 混合红斑颜色
                vec3 grsColor = mix(grsColorCore, grsColorInner, grsDist * 0.8);
                grsColor = mix(grsColor, grsColorOuter, smoothstep(0.3, 0.9, grsDist));
                grsColor += vec3(grsSpiral * 0.15); // 添加漩涡纹理
                
                // 应用红斑
                float grsMask = 1.0 - smoothstep(0.8, 1.0, grsDist);
                baseColor = mix(baseColor, grsColor, grsMask);
                
                // 添加红斑边缘的暗环
                float grsRing = smoothstep(0.85, 0.95, grsDist) * smoothstep(1.1, 0.95, grsDist);
                baseColor = mix(baseColor, darkBand * 0.8, grsRing * 0.5);
                
                // ====== 小红斑（红斑Jr）======
                vec2 grs2Center = vec2(0.65, 0.42);
                vec2 grs2Offset = uv - grs2Center;
                float grs2Dist = length(grs2Offset / vec2(0.04, 0.025));
                float grs2Mask = 1.0 - smoothstep(0.7, 1.0, grs2Dist);
                vec3 grs2Color = vec3(0.85, 0.5, 0.4);
                baseColor = mix(baseColor, grs2Color, grs2Mask * 0.7);
                
                // 光照
                vec3 lightDir = normalize(vec3(-1.0, 0.3, 0.5));
                float diff = max(dot(vNormal, lightDir), 0.0);
                baseColor *= (diff * 0.5 + 0.5);
                
                // 边缘变暗
                float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
                baseColor *= pow(fresnel, 0.3) * 0.3 + 0.7;
                
                gl_FragColor = vec4(baseColor, 1.0);
            }
        `
    });

    const jupiter = new THREE.Mesh(geometry, jupiterMaterial);
    return jupiter;
}

// ============ 创建月球 ============
function createMoon() {
    const moonData = planetData.moon;
    const earth = planets.earth;

    if (!earth) return;

    // 月球大小（相对于地球）
    const moonSize = earth.userData.size * 0.27;

    const geometry = new THREE.SphereGeometry(moonSize, 64, 64);

    // 月球着色器 - 带陨石坑
    const moonMaterial = new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: `
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vPosition;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vUv = uv;
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vPosition;
            
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }
            
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }
            
            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                for (int i = 0; i < 5; i++) {
                    value += amplitude * noise(p);
                    p *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }
            
            // 陨石坑函数
            float crater(vec2 uv, vec2 center, float radius) {
                float d = distance(uv, center);
                float rim = smoothstep(radius, radius * 0.9, d) * smoothstep(radius * 0.7, radius * 0.8, d);
                float floor = smoothstep(radius * 0.6, radius * 0.3, d);
                return rim * 0.3 - floor * 0.15;
            }
            
            void main() {
                vec2 uv = vUv;
                
                // 基础月球颜色（灰色变化）
                float baseNoise = fbm(uv * 10.0);
                vec3 lightGray = vec3(0.75, 0.73, 0.7);
                vec3 darkGray = vec3(0.4, 0.38, 0.35);
                vec3 baseColor = mix(lightGray, darkGray, baseNoise);
                
                // 月海（较暗区域）
                float mare = fbm(uv * 4.0 + 0.5);
                mare = smoothstep(0.45, 0.6, mare);
                vec3 mareColor = vec3(0.3, 0.28, 0.26);
                baseColor = mix(baseColor, mareColor, mare * 0.6);
                
                // 添加陨石坑
                float craterEffect = 0.0;
                
                // 大陨石坑
                craterEffect += crater(uv, vec2(0.3, 0.4), 0.08);
                craterEffect += crater(uv, vec2(0.7, 0.6), 0.1);
                craterEffect += crater(uv, vec2(0.5, 0.2), 0.06);
                craterEffect += crater(uv, vec2(0.2, 0.7), 0.07);
                craterEffect += crater(uv, vec2(0.8, 0.3), 0.05);
                craterEffect += crater(uv, vec2(0.4, 0.8), 0.09);
                
                // 小陨石坑（用噪声模拟）
                float smallCraters = fbm(uv * 30.0);
                smallCraters = smoothstep(0.6, 0.7, smallCraters) * 0.1;
                
                baseColor += vec3(craterEffect);
                baseColor -= vec3(smallCraters);
                
                // 光照
                vec3 lightDir = normalize(vec3(-1.0, 0.3, 0.5));
                float diff = max(dot(vNormal, lightDir), 0.0);
                baseColor *= (diff * 0.7 + 0.3);
                
                gl_FragColor = vec4(baseColor, 1.0);
            }
        `
    });

    moon = new THREE.Mesh(geometry, moonMaterial);
    moon.name = 'moon';
    moon.userData = {
        ...moonData,
        orbitAngle: 0,
        orbitRadius: earth.userData.size * 3, // 月球轨道半径
        orbitSpeed: 0.05,
        size: moonSize
    };

    // 创建月球标签
    createPlanetLabel(moon, '月球');

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

            // 创建卫星几何体
            const geometry = new THREE.SphereGeometry(moonSize, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: moonData.color,
                emissive: moonData.color,
                emissiveIntensity: 0.05,
                shininess: 20
            });

            const moonMesh = new THREE.Mesh(geometry, material);
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
        const material = new THREE.MeshBasicMaterial({
            color: satData.color,
            emissive: satData.color
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

    // 创建环的材质
    const ringMaterial = new THREE.ShaderMaterial({
        uniforms: {
            innerRadius: { value: saturnSize * 1.4 },
            outerRadius: { value: saturnSize * 2.3 }
        },
        vertexShader: `
            varying vec2 vUv;
            varying float vDistance;
            
            void main() {
                vUv = uv;
                vDistance = length(position.xy);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float innerRadius;
            uniform float outerRadius;
            varying vec2 vUv;
            varying float vDistance;
            
            void main() {
                float t = (vDistance - innerRadius) / (outerRadius - innerRadius);
                
                // 创建环带纹理
                float bands = sin(t * 50.0) * 0.5 + 0.5;
                float gaps = smoothstep(0.0, 0.02, sin(t * 100.0) * 0.5 + 0.5);
                
                vec3 color1 = vec3(0.9, 0.85, 0.7);
                vec3 color2 = vec3(0.7, 0.6, 0.5);
                vec3 color = mix(color1, color2, bands);
                
                float alpha = gaps * (1.0 - pow(abs(t - 0.5) * 2.0, 2.0)) * 0.8;
                
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const rings = new THREE.Mesh(ringGeometry, ringMaterial);
    rings.rotation.x = Math.PI / 2.2;
    saturn.add(rings);
}

// ============ 创建行星标签 ============
function createPlanetLabel(planet, name) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;

    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = 'bold 32px Noto Sans SC';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#ffffff';
    context.fillText(name, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(10, 2.5, 1);
    sprite.position.y = planet.userData.size + 3;
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
    const planetNames = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

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

    const elapsed = clock.getElapsedTime();

    // 更新控制器
    controls.update();

    // 更新星空
    if (starField && starField.material.uniforms) {
        starField.material.uniforms.time.value = elapsed;
    }

    // 更新太阳
    if (sun) {
        sun.rotation.y += 0.002;
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

            // 公转
            data.orbitAngle += data.orbitSpeed * 0.01;
            planet.position.x = Math.cos(data.orbitAngle) * data.orbitRadius;
            planet.position.z = Math.sin(data.orbitAngle) * data.orbitRadius;

            // 自转
            planet.rotation.y += data.rotationSpeed;

            // 天王星特殊倾斜
            if (name === 'uranus') {
                planet.rotation.z = Math.PI / 2;
            }

            // 更新地球shader时间
            if (name === 'earth' && planet.material.uniforms) {
                planet.material.uniforms.time.value = elapsed;
            }

            // 更新木星shader时间（大红斑动画）
            if (name === 'jupiter' && planet.material.uniforms) {
                planet.material.uniforms.time.value = elapsed;
            }
        });

        // 更新月球位置（围绕地球转）
        if (moon && planets.earth) {
            const earth = planets.earth;
            const moonData = moon.userData;

            moonData.orbitAngle += moonData.orbitSpeed * 0.01;

            // 月球位置 = 地球位置 + 月球相对于地球的轨道位置
            moon.position.x = earth.position.x + Math.cos(moonData.orbitAngle) * moonData.orbitRadius;
            moon.position.z = earth.position.z + Math.sin(moonData.orbitAngle) * moonData.orbitRadius;
            moon.position.y = earth.position.y;

            // 月球自转（同步自转，始终一面朝向地球）
            moon.rotation.y = -moonData.orbitAngle;
        }

        // 更新所有卫星位置
        Object.keys(moons).forEach(planetName => {
            const planet = planets[planetName];
            if (!planet) return;

            const planetMoonsList = moons[planetName];
            planetMoonsList.forEach(moonMesh => {
                const data = moonMesh.userData;
                data.orbitAngle += data.orbitSpeed * 0.01;

                const actualRadius = planet.userData.size + data.orbitRadius;

                // 卫星位置 = 行星位置 + 卫星轨道位置
                moonMesh.position.x = planet.position.x + Math.cos(data.orbitAngle) * actualRadius;
                moonMesh.position.z = planet.position.z + Math.sin(data.orbitAngle) * actualRadius;
                moonMesh.position.y = planet.position.y;

                // 卫星自转
                moonMesh.rotation.y += 0.01;
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

// ============ 设置控制按钮 ============
function setupControls() {
    // 大小对比
    document.getElementById('showComparison').addEventListener('click', function () {
        document.getElementById('sizeComparison').classList.add('visible');
    });

    document.getElementById('closeSizeComparison').addEventListener('click', function () {
        document.getElementById('sizeComparison').classList.remove('visible');
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
        document.getElementById('scaleValue').textContent = isRealScale ? '真实比例' : '教学模式';

        // 切换比例（真实比例下行星会非常小）
        updatePlanetScales();
    });

    // 行星选择器
    document.querySelectorAll('.planet-dot').forEach(dot => {
        dot.addEventListener('click', function () {
            selectPlanet(this.dataset.planet);
        });
    });

    // 奥尔特云按钮
    const oortBtn = document.getElementById('viewOortCloud');
    if (oortBtn) {
        oortBtn.addEventListener('click', function () {
            flyToOortCloud();
        });
    }

    // 太阳样式选择器
    const sunStyleOptions = document.querySelectorAll('.sun-style-option');
    console.log('找到太阳样式选项数量:', sunStyleOptions.length);

    sunStyleOptions.forEach((option, index) => {
        console.log('绑定事件到选项:', index, option.dataset.style);

        option.onclick = function (e) {
            console.log('点击了太阳样式选项:', this.dataset.style);
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
}

// ============ 更新行星大小 ============
function updatePlanetScales() {
    // 真实比例模式：以木星为基准，太阳单独处理
    // 和大小对比面板使用相同的比例逻辑
    const jupiterDiameter = 139820;
    const sunScaleFactor = 2.5;  // 太阳相对木星的显示比例（实际是10倍，但为了可视性压缩）
    const jupiterScaleFactor = 1.0;  // 木星基准

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
                // 其他行星：以木星为基准的真实比例
                const ratio = data.diameter / jupiterDiameter;
                scale = jupiterScaleFactor * ratio;
                // 最小比例，确保小天体可见
                scale = Math.max(0.02, scale);
            }
        } else {
            // 教学比例：所有行星大小相近，便于观察
            scale = 1;
        }

        planet.scale.setScalar(scale);

        // 更新标签位置
        if (labels[name]) {
            labels[name].position.y = planet.userData.size * scale + 3;
        }
    });
}

// ============ 生成大小对比 ============
function generateSizeComparison(mode) {
    if (!mode) mode = currentComparisonTab;
    currentComparisonTab = mode;

    const container = document.getElementById('comparisonRow');
    container.innerHTML = '';

    const subtitle = document.getElementById('comparisonSubtitle');

    // 类型标签映射
    const categoryLabels = {
        terrestrial: '🪨 岩石质',
        jovian: '💨 气态',
        star: '⭐ 恒星',
        dwarf: '🧊 矮行星',
        moon: '🌙 卫星'
    };

    if (mode === 'diameter') {
        // 按直径排序（从大到小）
        const sortedPlanets = ['sun', 'jupiter', 'saturn', 'uranus', 'neptune', 'earth', 'venus', 'mars', 'mercury', 'moon', 'pluto'];
        subtitle.textContent = '以地球为参考（直径 = 12,742 km）';

        const sunDisplaySize = 300;
        const jupiterDisplaySize = 140;
        const jupiterDiameter = 139820;

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

            const div = document.createElement('div');
            div.className = `comparison-planet ${categoryClass}`;
            div.innerHTML = `
                <div class="sphere" style="
                    width: ${displaySize}px;
                    height: ${displaySize}px;
                    background: ${name === 'sun' ?
                    'radial-gradient(circle at 30% 30%, #ffffff, #fff9c4, #ffeb3b, #ff9800, #f44336)' :
                    `#${data.color.toString(16).padStart(6, '0')}`};
                    color: #${data.color.toString(16).padStart(6, '0')};
                    ${name === 'sun' ? 'box-shadow: 0 0 60px rgba(255, 152, 0, 0.8), 0 0 120px rgba(255, 87, 34, 0.5);' : ''}
                "></div>
                <div class="name">${data.nameCN}</div>
                <div class="size">${formatNumber(data.diameter)} km</div>
                <span class="type-label ${categoryClass}">${categoryLabels[categoryClass] || data.type}</span>
            `;
            container.appendChild(div);
        });
    } else {
        // 按质量排序（从大到小）
        const allPlanets = ['sun', 'jupiter', 'saturn', 'uranus', 'neptune', 'earth', 'venus', 'mars', 'mercury', 'moon', 'pluto'];
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

            const div = document.createElement('div');
            div.className = `comparison-planet ${categoryClass}`;
            div.innerHTML = `
                <div class="sphere" style="
                    width: ${displaySize}px;
                    height: ${displaySize}px;
                    background: ${name === 'sun' ?
                    'radial-gradient(circle at 30% 30%, #ffffff, #fff9c4, #ffeb3b, #ff9800, #f44336)' :
                    `#${data.color.toString(16).padStart(6, '0')}`};
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
    }
}

function setupComparisonTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentComparisonTab = btn.dataset.tab;
            generateSizeComparison(currentComparisonTab);
        });
    });
}

// ============ 工具函数 ============
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatDistance(distance) {
    if (distance >= 1000) {
        return (distance / 1000).toFixed(1) + ' 十亿 km';
    }
    return distance + ' 百万 km';
}

function formatOrbitPeriod(days) {
    if (days >= 365) {
        const years = (days / 365).toFixed(1);
        return years + ' 年';
    }
    return days + ' 天';
}

// ============ 启动 ============
window.addEventListener('DOMContentLoaded', init);

