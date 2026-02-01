/**
 * 智天号太空探险 - 儿童模式 v2
 * 优化版：行星有明显特征，相机完全锁定
 */

// ============ 关卡数据 ============
const levelsData = [
    {
        id: 1, title: "我们的家", icon: "🌍", targets: ["earth", "moon"],
        badge: "🏅", badgeName: "地球徽章", unlocked: true, completed: false,
        intro: "我是地球，你的家在我身上。我有蓝色的大海和绿色的陆地。",
        tasks: [
            { type: "click", target: "earth", instruction: "找到地球！点击蓝绿色的星球", hint: "👆 蓝色+绿色的那个就是地球哦！", successMessage: "太棒了！这就是地球，我们的家！" },
            { type: "click", target: "moon", instruction: "找到月亮！地球旁边的小灰球", hint: "👆 看，地球旁边有个小伙伴！", successMessage: "对啦！月亮一直绕着地球转呀转！" },
            { type: "quiz", question: "月亮绕着谁转？", options: [{ text: "太阳", icon: "☀️", correct: false }, { text: "地球", icon: "🌍", correct: true }, { text: "火星", icon: "🔴", correct: false }], hint: "想一想，月亮是谁的小伙伴？" }
        ]
    },
    {
        id: 2, title: "离太阳很近", icon: "☀️", targets: ["mercury", "venus"],
        badge: "🥇", badgeName: "烈日徽章", unlocked: false, completed: false,
        intro: "水星和金星离太阳最近，那里非常非常热！",
        tasks: [
            { type: "click", target: "sun", instruction: "找到太阳！最大最亮的金色火球", hint: "👆 中间那个超级大的金色球！", successMessage: "对！太阳是个超级大火球！" },
            { type: "click", target: "mercury", instruction: "找到水星！离太阳最近的灰色小球", hint: "👆 太阳旁边最近的灰色小球！", successMessage: "找到啦！水星离太阳最近，超级热！" },
            { type: "quiz", question: "离太阳近感觉怎么样？", options: [{ text: "很冷", icon: "🥶", correct: false }, { text: "很热", icon: "🥵", correct: true }, { text: "刚刚好", icon: "😊", correct: false }], hint: "太阳是个大火球，靠近它会怎样呢？" }
        ]
    },
    {
        id: 3, title: "红色邻居", icon: "🔴", targets: ["mars"],
        badge: "🏆", badgeName: "火星徽章", unlocked: false, completed: false,
        intro: "我是火星，我红红的。也许未来我们会去我那里探险。",
        tasks: [
            { type: "click", target: "mars", instruction: "找到火星！那个橙红色的星球", hint: "👆 找找看哪个是橙红色的？", successMessage: "太厉害了！火星就是红色的！" },
            { type: "quiz", question: "火星是什么颜色？", options: [{ text: "蓝色", icon: "🟦", correct: false }, { text: "红色", icon: "🟥", correct: true }, { text: "绿色", icon: "🟩", correct: false }], hint: "火星的名字里有个'火'字哦！" }
        ]
    },
    {
        id: 4, title: "最大的行星", icon: "🟤", targets: ["jupiter"],
        badge: "👑", badgeName: "木星徽章", unlocked: false, completed: false,
        intro: "我是木星，我是最大的行星。我有很多很多卫星，比如木卫一、木卫二。",
        tasks: [
            { type: "click", target: "jupiter", instruction: "找到木星！有条纹的超大星球", hint: "👆 看看哪个星球最大还有条纹？", successMessage: "答对啦！木星是太阳系里最大的行星！" },
            { type: "quiz", question: "木星有多少卫星？", options: [{ text: "只有 1 个", icon: "🌙", correct: false }, { text: "很多很多", icon: "🌙🌙🌙", correct: true }, { text: "没有", icon: "❌", correct: false }], hint: "木星的卫星可多啦！比如木卫一、木卫二。" }
        ]
    },
    {
        id: 5, title: "戴光环的星球", icon: "💍", targets: ["saturn"],
        badge: "💎", badgeName: "土星徽章", unlocked: false, completed: false,
        intro: "我是土星，我戴着漂亮的光环，像呼啦圈一样。",
        tasks: [
            { type: "click", target: "saturn", instruction: "找到土星！戴着漂亮光环的那个", hint: "👆 哪个星球有漂亮的环？", successMessage: "太棒了！土星的光环好漂亮！" },
            { type: "quiz", question: "土星的光环像什么？", options: [{ text: "帽子", icon: "🎩", correct: false }, { text: "呼啦圈", icon: "⭕", correct: true }, { text: "球", icon: "⚽", correct: false }], hint: "光环绕着土星转呀转！" }
        ]
    },
    {
        id: 6, title: "很远很冷", icon: "🥶", targets: ["uranus", "neptune"],
        badge: "❄️", badgeName: "冰雪徽章", unlocked: false, completed: false,
        intro: "我们住得很远很远，那里很冷很冷。天王星是青绿色的，海王星是深蓝色的。",
        tasks: [
            { type: "click", target: "neptune", instruction: "找到海王星！最外面的深蓝色星球", hint: "👆 看看最外面那个深蓝色的！", successMessage: "找到啦！海王星离太阳最远最远！" },
            { type: "quiz", question: "离太阳越远感觉怎样？", options: [{ text: "越热", icon: "🥵", correct: false }, { text: "越冷", icon: "🥶", correct: true }, { text: "一样", icon: "😐", correct: false }], hint: "太阳是暖暖的，离开它越远..." }
        ]
    }
];

// ============ 儿童版行星数据（增强视觉特征） ============
const kidsPlanetData = {
    sun: { name: "太阳", icon: "☀️", mustKnow: "太阳是个超级大火球！", funFact: "太阳一直在燃烧自己，给大家带来光和热。所有的行星都绕着太阳转呀转。", size: 18, orbitRadius: 0 },
    mercury: { name: "水星", icon: "⚫", mustKnow: "水星离太阳最近，跑得最快！", funFact: "水星很小，白天超级热，晚上超级冷，温差特别特别大！", size: 1.5, orbitRadius: 32 },
    venus: { name: "金星", icon: "🟡", mustKnow: "金星是最热最热的行星！", funFact: "金星离太阳近，又被厚厚的云包着，热气散不出去，所以比水星还热呢！", size: 2.2, orbitRadius: 45 },
    earth: { name: "地球", icon: "🌍", mustKnow: "地球是我们的家！", funFact: "地球有蓝色的大海、绿色的陆地，还有厚厚的大气层保护着我们。", size: 2.5, orbitRadius: 60 },
    moon: { name: "月亮", icon: "🌙", mustKnow: "月亮绕着地球转！", funFact: "月亮是地球的卫星，它自己不会发光，我们看到的月光其实是太阳光照在月亮上反射过来的。", size: 0.8 },
    mars: { name: "火星", icon: "🔴", mustKnow: "火星红红的！", funFact: "火星上有太阳系最大的火山——奥林帕斯山，还经常刮很大很大的沙尘暴！也许未来我们会去火星探险。", size: 2, orbitRadius: 82 },
    jupiter: { name: "木星", icon: "🟤", mustKnow: "木星最大！", funFact: "木星是气态行星，没有硬硬的地面。身上的大红斑是一个超级大风暴，已经刮了好几百年了！木星有很多卫星，比如木卫一、木卫二。", size: 8, orbitRadius: 120 },
    saturn: { name: "土星", icon: "💍", mustKnow: "土星有漂亮的光环！", funFact: "土星也是气态行星。它的光环是由无数冰块和石头组成的。土星特别特别轻，如果有个超级大浴缸，它能浮在水上呢！", size: 7, orbitRadius: 160, hasRings: true },
    uranus: { name: "天王星", icon: "🟢", mustKnow: "天王星是青绿色的！", funFact: "天王星躺着转，跟别人不一样。它是太阳系最冷的行星，因为离太阳很远，自己又不会发热。", size: 4, orbitRadius: 200 },
    neptune: { name: "海王星", icon: "🔵", mustKnow: "海王星离太阳最远！", funFact: "海王星是深蓝色的，上面的风超级超级大，是太阳系里风最大的行星！", size: 3.8, orbitRadius: 240 },
    asteroidBelt: { name: "小行星带", icon: "☄️", mustKnow: "小行星带在火星和木星之间！", funFact: "这里有很多很多大大小小的石头和岩石，它们也绕着太阳转。最大的一颗叫谷神星，是个矮行星。", size: 3, orbitRadius: 100 },
    pluto: { name: "冥王星", icon: "⚪", mustKnow: "冥王星是一颗矮行星！", funFact: "冥王星很小很小，以前被当作第九大行星，后来科学家发现它太小了，就改叫矮行星啦。它住在柯伊伯带里。", size: 1.2, orbitRadius: 290 },
    kuiperBelt: { name: "柯伊伯带", icon: "💫", mustKnow: "柯伊伯带在海王星外面！", funFact: "柯伊伯带是太阳系外围的一个大圈圈，里面有很多冰块和小天体。冥王星就住在这里，它还有很多邻居呢！", size: 3, orbitRadius: 310 }
};

// ============ 全局变量 ============
let scene, camera, renderer, controls;
let planets = {};
let planetLabels = {};
let sun, moon;
let clock;
let raycaster, mouse;
let currentMode = "menu";
let currentLevelIndex = 0;
let currentTaskIndex = 0;
let collectedBadges = [];
let isAnimating = true;
let currentPlanetIndex = 0;
const planetOrder = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'asteroidBelt', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'kuiperBelt'];

// ============ 初始化 ============
function init() {
    clock = new THREE.Clock();
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050515);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.set(100, 80, 200);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 创建控制器（启用触摸操作）
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.minDistance = 30;
    controls.maxDistance = 700;
    controls.autoRotate = false;

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    createStarfield();
    createSunWithGlow();
    createPlanetsWithTextures();
    createMoonObj();
    createAsteroidBelt();
    createPluto();
    createKuiperBelt();
    createOrbits();
    addLights();
    loadProgress();

    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onCanvasClick);
    setupUIEvents();
    generateLevelCards();

    setTimeout(() => { document.getElementById('loadingScreen').classList.add('hidden'); }, 1500);
    animate();
}

// ============ 创建星空 ============
function createStarfield() {
    const geo = new THREE.BufferGeometry();
    const count = 5000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
        const r = 600 + Math.random() * 1000;
        const t = Math.random() * Math.PI * 2;
        const p = Math.acos(2 * Math.random() - 1);
        pos[i] = r * Math.sin(p) * Math.cos(t);
        pos[i + 1] = r * Math.sin(p) * Math.sin(t);
        pos[i + 2] = r * Math.cos(p);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, transparent: true, opacity: 0.8 });
    scene.add(new THREE.Points(geo, mat));
}

// ============ 创建太阳（发光效果） ============
function createSunWithGlow() {
    const d = kidsPlanetData.sun;
    // 核心
    const geo = new THREE.SphereGeometry(d.size, 64, 64);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    sun = new THREE.Mesh(geo, mat);
    sun.name = 'sun';
    sun.userData = d;
    scene.add(sun);
    planets.sun = sun;

    // 光晕层
    for (let i = 1; i <= 3; i++) {
        const gGeo = new THREE.SphereGeometry(d.size * (1 + i * 0.15), 32, 32);
        const gMat = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.2 / i, side: THREE.BackSide });
        sun.add(new THREE.Mesh(gGeo, gMat));
    }

    const light = new THREE.PointLight(0xffaa33, 2, 600);
    sun.add(light);
    createLabel(sun, "☀️ 太阳");
}

// ============ 创建有特征的行星 ============
function createPlanetsWithTextures() {
    const names = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
    names.forEach(name => {
        const d = kidsPlanetData[name];
        const geo = new THREE.SphereGeometry(d.size, 48, 48);
        let mat;

        // 根据行星特征创建不同材质
        if (name === 'earth') {
            // 地球：蓝绿色
            mat = createEarthMaterial(d.size);
        } else if (name === 'mars') {
            // 火星：橙红色带深色斑纹
            mat = createMarsMaterial();
        } else if (name === 'jupiter') {
            // 木星：条纹
            mat = createJupiterMaterial();
        } else if (name === 'venus') {
            // 金星：淡黄色带云纹
            mat = createVenusMaterial();
        } else if (name === 'mercury') {
            // 水星：灰色带陨石坑
            mat = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 1, metalness: 0.2 });
        } else if (name === 'uranus') {
            mat = new THREE.MeshStandardMaterial({ color: 0x7de3e3, roughness: 0.5 });
        } else if (name === 'neptune') {
            mat = new THREE.MeshStandardMaterial({ color: 0x3d5ef7, roughness: 0.5 });
        } else {
            mat = new THREE.MeshStandardMaterial({ color: 0xead6b8, roughness: 0.7 });
        }

        const planet = new THREE.Mesh(geo, mat);
        planet.name = name;
        planet.userData = { ...d, orbitAngle: Math.random() * Math.PI * 2, orbitSpeed: 0.2 / Math.sqrt(d.orbitRadius) };
        planet.position.x = d.orbitRadius;
        scene.add(planet);
        planets[name] = planet;

        // 土星环
        if (d.hasRings) {
            const ringGeo = new THREE.RingGeometry(d.size * 1.3, d.size * 2.3, 64);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xc9a86c, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2.2;
            planet.add(ring);
        }

        createLabel(planet, d.icon + " " + d.name);
    });
}

// ============ 地球材质（蓝绿色） ============
function createEarthMaterial(size) {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    // 海洋
    ctx.fillStyle = '#4a90d9';
    ctx.fillRect(0, 0, 512, 256);
    // 陆地
    ctx.fillStyle = '#3d8b3d';
    ctx.beginPath();
    ctx.ellipse(150, 100, 80, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(350, 80, 60, 40, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(280, 180, 90, 50, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(100, 200, 50, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    // 云
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random() * 512, Math.random() * 256, 40 + Math.random() * 30, 15, Math.random(), 0, Math.PI * 2);
        ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 });
}

// ============ 火星材质（橙红色） ============
function createMarsMaterial() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#c1440e';
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = '#8b2500';
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 256, Math.random() * 128, 5 + Math.random() * 15, 0, Math.PI * 2);
        ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 });
}

// ============ 木星材质（条纹） ============
function createJupiterMaterial() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const colors = ['#d4b483', '#c19a6b', '#a67b5b', '#8b6914', '#d4a574', '#c9a86c'];
    for (let y = 0; y < 256; y += 20) {
        ctx.fillStyle = colors[Math.floor(y / 20) % colors.length];
        ctx.fillRect(0, y, 512, 22);
    }
    // 大红斑
    ctx.fillStyle = '#cd5c5c';
    ctx.beginPath();
    ctx.ellipse(320, 140, 50, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    const tex = new THREE.CanvasTexture(canvas);
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 });
}

// ============ 金星材质 ============
function createVenusMaterial() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e6c87a';
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = 'rgba(255,240,200,0.4)';
    for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random() * 256, Math.random() * 128, 30 + Math.random() * 40, 10, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 });
}

// ============ 创建月球 ============
function createMoonObj() {
    const d = kidsPlanetData.moon;
    const geo = new THREE.SphereGeometry(d.size, 32, 32);
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#b0b0b0';
    ctx.fillRect(0, 0, 128, 64);
    ctx.fillStyle = '#888888';
    for (let i = 0; i < 25; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 128, Math.random() * 64, 2 + Math.random() * 6, 0, Math.PI * 2);
        ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1 });
    moon = new THREE.Mesh(geo, mat);
    moon.name = 'moon';
    moon.userData = { ...d, orbitAngle: 0 };
    scene.add(moon);
    planets.moon = moon;
    createLabel(moon, "🌙 月亮");
}

// ============ 创建标签 ============
function createLabel(parent, text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(text, 128, 40);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    const scale = parent.userData.size ? parent.userData.size * 1.5 + 3 : 8;
    sprite.scale.set(scale, scale / 4, 1);
    sprite.position.y = (parent.userData.size || 5) + 3;
    parent.add(sprite);
    planetLabels[parent.name] = sprite;
}

// ============ 创建小行星带 ============
function createAsteroidBelt() {
    const d = kidsPlanetData.asteroidBelt;
    const group = new THREE.Group();
    group.name = 'asteroidBelt';
    group.userData = { ...d };
    const count = 600;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = d.orbitRadius - 8 + Math.random() * 16;
        const y = (Math.random() - 0.5) * 3;
        pos[i * 3] = Math.cos(angle) * r;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xaa9977, size: 1.2, transparent: true, opacity: 0.7 });
    const points = new THREE.Points(geo, mat);
    group.add(points);
    // 添加几个较大的小行星作为可见标记
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const r = d.orbitRadius - 4 + Math.random() * 8;
        const rockGeo = new THREE.IcosahedronGeometry(0.4 + Math.random() * 0.4, 0);
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x998866, roughness: 1 });
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.set(Math.cos(angle) * r, (Math.random() - 0.5) * 2, Math.sin(angle) * r);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        group.add(rock);
    }
    scene.add(group);
    planets.asteroidBelt = group;
    // 标签放在环的上方
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 256; labelCanvas.height = 64;
    const labelCtx = labelCanvas.getContext('2d');
    labelCtx.font = 'bold 28px Arial';
    labelCtx.fillStyle = 'white';
    labelCtx.textAlign = 'center';
    labelCtx.fillText("☄️ 小行星带", 128, 40);
    const labelTex = new THREE.CanvasTexture(labelCanvas);
    const labelMat = new THREE.SpriteMaterial({ map: labelTex, transparent: true });
    const labelSprite = new THREE.Sprite(labelMat);
    labelSprite.scale.set(12, 3, 1);
    labelSprite.position.set(d.orbitRadius, 5, 0);
    group.add(labelSprite);
    planetLabels.asteroidBelt = labelSprite;
}

// ============ 创建冥王星 ============
function createPluto() {
    const d = kidsPlanetData.pluto;
    const geo = new THREE.SphereGeometry(d.size, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ color: 0xc9b8a0, roughness: 0.9 });
    const pluto = new THREE.Mesh(geo, mat);
    pluto.name = 'pluto';
    pluto.userData = { ...d, orbitAngle: Math.random() * Math.PI * 2, orbitSpeed: 0.2 / Math.sqrt(d.orbitRadius) };
    pluto.position.x = d.orbitRadius;
    scene.add(pluto);
    planets.pluto = pluto;
    createLabel(pluto, "⚪ 冥王星");
}

// ============ 创建柯伊伯带 ============
function createKuiperBelt() {
    const d = kidsPlanetData.kuiperBelt;
    const group = new THREE.Group();
    group.name = 'kuiperBelt';
    group.userData = { ...d };
    const count = 800;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = d.orbitRadius - 15 + Math.random() * 30;
        const y = (Math.random() - 0.5) * 5;
        pos[i * 3] = Math.cos(angle) * r;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0x8899bb, size: 1, transparent: true, opacity: 0.5 });
    const points = new THREE.Points(geo, mat);
    group.add(points);
    scene.add(group);
    planets.kuiperBelt = group;
    // 标签放在环的上方
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 256; labelCanvas.height = 64;
    const labelCtx = labelCanvas.getContext('2d');
    labelCtx.font = 'bold 28px Arial';
    labelCtx.fillStyle = 'white';
    labelCtx.textAlign = 'center';
    labelCtx.fillText("💫 柯伊伯带", 128, 40);
    const labelTex = new THREE.CanvasTexture(labelCanvas);
    const labelMat = new THREE.SpriteMaterial({ map: labelTex, transparent: true });
    const labelSprite = new THREE.Sprite(labelMat);
    labelSprite.scale.set(12, 3, 1);
    labelSprite.position.set(d.orbitRadius, 5, 0);
    group.add(labelSprite);
    planetLabels.kuiperBelt = labelSprite;
}

// ============ 创建轨道 ============
function createOrbits() {
    ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].forEach(name => {
        const r = kidsPlanetData[name].orbitRadius;
        const geo = new THREE.RingGeometry(r - 0.3, r + 0.3, 128);
        const mat = new THREE.MeshBasicMaterial({ color: 0x555577, side: THREE.DoubleSide, transparent: true, opacity: 0.25 });
        const orbit = new THREE.Mesh(geo, mat);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);
    });
}

// ============ 添加灯光 ============
function addLights() {
    scene.add(new THREE.AmbientLight(0x606060, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(50, 50, 50);
    scene.add(dirLight);
}

// ============ 动画循环 ============
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    if (isAnimating) {
        Object.keys(planets).forEach(name => {
            if (name === 'sun' || name === 'moon' || name === 'asteroidBelt' || name === 'kuiperBelt') return;
            const p = planets[name];
            const d = p.userData;
            d.orbitAngle += d.orbitSpeed * delta;
            p.position.x = Math.cos(d.orbitAngle) * d.orbitRadius;
            p.position.z = Math.sin(d.orbitAngle) * d.orbitRadius;
            p.rotation.y += delta * 0.3;
        });
        if (moon && planets.earth) {
            moon.userData.orbitAngle += delta * 0.3;
            const e = planets.earth.position;
            moon.position.x = e.x + Math.cos(moon.userData.orbitAngle) * 6;
            moon.position.z = e.z + Math.sin(moon.userData.orbitAngle) * 6;
            moon.position.y = Math.sin(moon.userData.orbitAngle * 0.8) * 0.5;
        }
        if (sun) {
            sun.rotation.y += delta * 0.05;
            sun.scale.setScalar(1 + Math.sin(time * 2) * 0.02);
        }
    }
    controls.update();
    renderer.render(scene, camera);
}

// ============ 窗口调整 ============
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============ 画布点击 ============
function onCanvasClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(Object.values(planets));
    if (hits.length > 0) {
        const name = hits[0].object.name;
        if (currentMode === 'mission') handleMissionClick(name);
        else if (currentMode === 'freeExplore') { showPlanetInfoCard(name); focusOnPlanet(name); }
    }
}

// ============ 任务点击 ============
function handleMissionClick(planetName) {
    const task = levelsData[currentLevelIndex].tasks[currentTaskIndex];
    if (task.type === 'click' && task.target === planetName) {
        playSuccessEffect();
        speak(task.successMessage);
        setTimeout(() => {
            currentTaskIndex++;
            if (currentTaskIndex < levelsData[currentLevelIndex].tasks.length) showNextTask();
            else completeLevel();
        }, 2000);
    } else {
        highlightPlanet(task.target);
        speak("再找找看哦！" + task.hint);
    }
}

// ============ UI 事件 ============
function setupUIEvents() {
    document.getElementById('startMissionBtn').onclick = showLevelSelect;
    document.getElementById('freeExploreBtn').onclick = startFreeExplore;
    document.getElementById('closeLevelSelect').onclick = hideLevelSelect;
    document.getElementById('rewardContinueBtn').onclick = () => { hideReward(); currentLevelIndex < levelsData.length - 1 ? showLevelSelect() : showMainMenu(); };
    document.getElementById('closeCard').onclick = () => document.getElementById('planetInfoCard').classList.remove('visible');
    document.getElementById('prevPlanet').onclick = () => navigatePlanet(-1);
    document.getElementById('nextPlanet').onclick = () => navigatePlanet(1);
}

// ============ 关卡卡片 ============
function generateLevelCards() {
    const grid = document.getElementById('levelsGrid');
    grid.innerHTML = '';
    levelsData.forEach((lv, i) => {
        const card = document.createElement('div');
        card.className = `level-card ${lv.unlocked ? '' : 'locked'} ${lv.completed ? 'completed' : ''}`;
        card.innerHTML = `<div class="level-icon">${lv.icon}</div><div class="level-name">第 ${lv.id} 关</div><div class="level-name">${lv.title}</div><div class="level-status">${lv.completed ? '已完成 ✓' : (lv.unlocked ? '可以玩' : '🔒')}</div>${lv.completed ? `<div class="level-badge">${lv.badge}</div>` : ''}`;
        if (lv.unlocked) card.onclick = () => startLevel(i);
        grid.appendChild(card);
    });
}

// ============ 界面切换 ============
function showMainMenu() {
    currentMode = 'menu';
    document.getElementById('mainMenu').style.display = 'flex';
    document.getElementById('levelSelect').classList.remove('visible');
    document.getElementById('gameUI').classList.remove('visible');
    document.getElementById('navArrows').style.display = 'none';
    document.getElementById('planetInfoCard').classList.remove('visible');
    animateCameraTo({ x: 100, y: 80, z: 200 }, { x: 0, y: 0, z: 0 });
}
function showLevelSelect() {
    currentMode = 'levelSelect';
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('levelSelect').classList.add('visible');
    generateLevelCards();
}
function hideLevelSelect() {
    document.getElementById('levelSelect').classList.remove('visible');
    showMainMenu();
}

// ============ 开始关卡 ============
function startLevel(index) {
    currentLevelIndex = index;
    currentTaskIndex = 0;
    currentMode = 'mission';
    const lv = levelsData[index];
    document.getElementById('levelSelect').classList.remove('visible');
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('gameUI').classList.add('visible');
    document.getElementById('optionsPanel').classList.remove('visible');
    speak(lv.intro);
    // 根据任务目标定位相机
    const target = lv.targets[0];
    focusOnPlanet(target);
    setTimeout(showNextTask, 2500);
}

// ============ 显示下一个任务 ============
function showNextTask() {
    const task = levelsData[currentLevelIndex].tasks[currentTaskIndex];
    document.getElementById('taskInstruction').textContent = task.instruction || task.question;
    document.getElementById('taskHint').textContent = task.hint;
    document.getElementById('taskPanel').style.display = 'block';

    if (task.type === 'quiz') {
        const panel = document.getElementById('optionsPanel');
        panel.innerHTML = '';
        task.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<span class="option-icon">${opt.icon}</span><span>${opt.text}</span>`;
            btn.onclick = () => handleQuizAnswer(opt, btn, task);
            panel.appendChild(btn);
        });
        panel.classList.add('visible');
    } else {
        document.getElementById('optionsPanel').classList.remove('visible');
        if (task.target) { highlightPlanet(task.target); focusOnPlanet(task.target); }
    }
    speak(task.instruction || task.question);
}

// ============ 问答处理 ============
function handleQuizAnswer(opt, btn, task) {
    if (opt.correct) {
        btn.classList.add('correct');
        playSuccessEffect();
        speak("太棒了！答对啦！");
        setTimeout(() => {
            currentTaskIndex++;
            if (currentTaskIndex < levelsData[currentLevelIndex].tasks.length) showNextTask();
            else completeLevel();
        }, 1500);
    } else {
        btn.classList.add('wrong');
        speak(task.hint);
        setTimeout(() => btn.classList.remove('wrong'), 500);
    }
}

// ============ 完成关卡 ============
function completeLevel() {
    const lv = levelsData[currentLevelIndex];
    lv.completed = true;
    collectedBadges.push(lv.badge);
    if (currentLevelIndex < levelsData.length - 1) levelsData[currentLevelIndex + 1].unlocked = true;
    saveProgress();
    document.getElementById('badgeCount').textContent = collectedBadges.length;
    document.getElementById('gameUI').classList.remove('visible');
    showReward(lv);
}
function showReward(lv) {
    document.getElementById('rewardBadge').textContent = lv.badge;
    document.getElementById('rewardText').textContent = "太棒了！";
    document.getElementById('rewardSubtext').textContent = `你获得了${lv.badgeName}！`;
    document.getElementById('rewardOverlay').classList.add('visible');
    createStarsEffect();
    speak(`恭喜你！获得了${lv.badgeName}！`);
}
function hideReward() { document.getElementById('rewardOverlay').classList.remove('visible'); }

// ============ 自由探索 ============
function startFreeExplore() {
    currentMode = 'freeExplore';
    currentPlanetIndex = 3; // 从地球开始
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('navArrows').style.display = 'flex';
    focusOnPlanet(planetOrder[currentPlanetIndex]);
    showPlanetInfoCard(planetOrder[currentPlanetIndex]);
}
function navigatePlanet(dir) {
    currentPlanetIndex = (currentPlanetIndex + dir + planetOrder.length) % planetOrder.length;
    const name = planetOrder[currentPlanetIndex];
    focusOnPlanet(name);
    showPlanetInfoCard(name);
}
function showPlanetInfoCard(name) {
    const d = kidsPlanetData[name];
    if (!d) return;
    document.getElementById('cardPlanetName').textContent = d.icon + " " + d.name;
    document.getElementById('cardMustKnow').textContent = d.mustKnow;
    document.getElementById('cardFunFact').textContent = d.funFact;
    document.getElementById('planetInfoCard').classList.add('visible');
    speak(d.mustKnow + " " + d.funFact);
}

// ============ 相机控制（完全锁定，程序驱动） ============
function focusOnPlanet(name) {
    const p = planets[name];
    if (!p) return;
    // 小行星带和柯伊伯带是环形结构，相机从侧面俯视
    if (name === 'asteroidBelt' || name === 'kuiperBelt') {
        const r = p.userData.orbitRadius;
        const targetCam = { x: r * 0.8, y: r * 0.6, z: r * 0.8 };
        const targetLook = { x: 0, y: 0, z: 0 };
        animateCameraTo(targetCam, targetLook);
        return;
    }
    const offset = (p.userData.size || 5) * 4 + 20;
    const targetCam = { x: p.position.x + offset, y: p.position.y + offset * 0.5, z: p.position.z + offset };
    const targetLook = { x: p.position.x, y: p.position.y, z: p.position.z };
    animateCameraTo(targetCam, targetLook);
}
function animateCameraTo(targetPos, lookPos) {
    const startPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const startTarget = { x: controls.target.x, y: controls.target.y, z: controls.target.z };
    const startTime = Date.now();
    const duration = 1200;
    function update() {
        const t = Math.min((Date.now() - startTime) / duration, 1);
        const e = 1 - Math.pow(1 - t, 3);
        camera.position.x = startPos.x + (targetPos.x - startPos.x) * e;
        camera.position.y = startPos.y + (targetPos.y - startPos.y) * e;
        camera.position.z = startPos.z + (targetPos.z - startPos.z) * e;
        controls.target.x = startTarget.x + (lookPos.x - startTarget.x) * e;
        controls.target.y = startTarget.y + (lookPos.y - startTarget.y) * e;
        controls.target.z = startTarget.z + (lookPos.z - startTarget.z) * e;
        if (t < 1) requestAnimationFrame(update);
    }
    update();
}

// ============ 高亮行星 ============
function highlightPlanet(name) {
    const p = planets[name];
    if (!p) return;
    const orig = p.scale.x;
    let count = 0;
    function pulse() {
        count++;
        p.scale.setScalar(orig * (1 + Math.sin(count * 0.4) * 0.25));
        if (count < 25) requestAnimationFrame(pulse);
        else p.scale.setScalar(orig);
    }
    pulse();
}

// ============ 语音 ============
function speak(text) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN'; u.rate = 0.85; u.pitch = 1.15;
    const ind = document.getElementById('audioIndicator');
    document.getElementById('speechText').textContent = text;
    ind.classList.add('speaking');
    u.onend = () => ind.classList.remove('speaking');
    speechSynthesis.speak(u);
}

// ============ 特效 ============
function playSuccessEffect() { createStarsEffect(); }
function createStarsEffect() {
    const c = document.getElementById('starsEffect');
    const emojis = ['⭐', '🌟', '✨', '💫', '🎉'];
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const s = document.createElement('div');
            s.className = 'star-particle';
            s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            s.style.left = Math.random() * 100 + 'vw';
            s.style.animationDuration = (1 + Math.random()) + 's';
            c.appendChild(s);
            setTimeout(() => s.remove(), 2000);
        }, i * 80);
    }
}

// ============ 存档 ============
function saveProgress() {
    localStorage.setItem('kidsProgress', JSON.stringify({ levels: levelsData.map(l => ({ completed: l.completed, unlocked: l.unlocked })), badges: collectedBadges }));
}
function loadProgress() {
    const s = localStorage.getItem('kidsProgress');
    if (s) {
        const p = JSON.parse(s);
        p.levels.forEach((l, i) => { if (levelsData[i]) { levelsData[i].completed = l.completed; levelsData[i].unlocked = l.unlocked; } });
        collectedBadges = p.badges || [];
        document.getElementById('badgeCount').textContent = collectedBadges.length;
    }
}

window.addEventListener('DOMContentLoaded', init);
