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
    setupWordAdventureEvents();
    generateLevelCards();
    loadWordProgress();

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
        else if (currentMode === 'wordAdventure') handleWordAdventureClick(name);
    }
}

// ============ 任务点击 ============
function handleMissionClick(planetName) {
    const task = levelsData[currentLevelIndex].tasks[currentTaskIndex];
    if (task.type === 'click' && task.target === planetName) {
        playSuccessEffect();
        const levelId = levelsData[currentLevelIndex].id;
        playAudio(audioPaths.taskSuccess(levelId, currentTaskIndex + 1), task.successMessage, () => {
            currentTaskIndex++;
            if (currentTaskIndex < levelsData[currentLevelIndex].tasks.length) showNextTask();
            else completeLevel();
        });
    } else {
        highlightPlanet(task.target);
        const levelId = levelsData[currentLevelIndex].id;
        playAudio(audioPaths.taskHint(levelId, currentTaskIndex + 1), "再找找看哦！" + task.hint);
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
    wordAdventureMode = false;
    document.getElementById('mainMenu').style.display = 'flex';
    document.getElementById('levelSelect').classList.remove('visible');
    document.getElementById('gameUI').classList.remove('visible');
    document.getElementById('navArrows').style.display = 'none';
    document.getElementById('planetInfoCard').classList.remove('visible');
    document.getElementById('wordProgressBar').classList.remove('visible');
    document.getElementById('wordBackBtn').style.display = 'none';
    document.getElementById('wordNavArrows').classList.remove('visible');
    document.getElementById('wordHintTip').style.display = 'none';
    document.getElementById('wordLearningCard').classList.remove('visible');
    document.getElementById('wordQuizOverlay').classList.remove('visible');
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
    // 根据任务目标定位相机
    const target = lv.targets[0];
    focusOnPlanet(target);
    // 播放关卡介绍音频，等播完后再显示任务
    playAudio(audioPaths.levelIntro(lv.id), lv.intro, () => {
        showNextTask();
    });
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
    // 任务提示语音：使用对应的 hint 音频
    const levelId = levelsData[currentLevelIndex].id;
    const hintText = task.instruction || task.question;
    playAudio(audioPaths.taskHint(levelId, currentTaskIndex + 1), hintText);
}

// ============ 问答处理 ============
function handleQuizAnswer(opt, btn, task) {
    if (opt.correct) {
        btn.classList.add('correct');
        playSuccessEffect();
        playAudio(audioPaths.fixed.quizCorrect, "太棒了！答对啦！", () => {
            currentTaskIndex++;
            if (currentTaskIndex < levelsData[currentLevelIndex].tasks.length) showNextTask();
            else completeLevel();
        });
    } else {
        btn.classList.add('wrong');
        const levelId = levelsData[currentLevelIndex].id;
        playAudio(audioPaths.taskHint(levelId, currentTaskIndex + 1), task.hint);
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
    playAudio(audioPaths.levelBadge(lv.id), `恭喜你！获得了${lv.badgeName}！`);
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
    playAudio(audioPaths.planetInfo(name), d.mustKnow + " " + d.funFact);
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
// Chrome/Safari 存在 bug：speechSynthesis 长时间运行后会自动暂停
// 需要定时 resume 保持引擎活跃
let _speechKeepAlive = null;

// 音频缓存
const audioCache = {};
// 当前正在播放的音频（用于互斥，避免多个音频同时播放）
let _currentAudio = null;
// 音频播放完毕回调
let _audioEndCallback = null;

// 音频路径配置
const audioPaths = {
    fixed: {
        quizCorrect: 'audio/fixed/quiz-correct.mp3',
        wordIntro: 'audio/fixed/word-intro.mp3',
        wordNoTask: 'audio/fixed/word-no-task.mp3'
    },
    // 动态生成路径的辅助函数
    levelIntro: (levelId) => `audio/levels/level-${levelId}-intro.mp3`,
    levelBadge: (levelId) => `audio/levels/level-${levelId}-badge.mp3`,
    taskSuccess: (levelId, taskIdx) => `audio/levels/level-${levelId}-task-${taskIdx}-success.mp3`,
    taskHint: (levelId, taskIdx) => `audio/levels/level-${levelId}-task-${taskIdx}-hint.mp3`,
    planetInfo: (planetKey) => `audio/planets/${planetKey}-info.mp3`,
    wordIntroAudio: (char) => `audio/words/${char}-intro.mp3`,
    wordChar: (char) => `audio/words/${char}-char.mp3`,
    wordCorrect: (char) => `audio/words/${char}-correct.mp3`,
    wordWrong: (char) => `audio/words/${char}-wrong.mp3`,
    planetComplete: (planetKey) => `audio/words/planet-${planetKey}-complete.mp3`
};

// 停止当前正在播放的音频
function stopCurrentAudio() {
    if (_currentAudio) {
        _currentAudio.pause();
        _currentAudio.currentTime = 0;
        _currentAudio.onended = null;
        _currentAudio.onerror = null;
        _currentAudio = null;
    }
    _audioEndCallback = null;
    // 同时取消 TTS
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    document.getElementById('audioIndicator').classList.remove('speaking');
}

// 播放预生成音频，失败时降级到 Web Speech API
// onEnd 可选回调：音频播放完毕后执行
function playAudio(audioPath, fallbackText, onEnd) {
    // 先停掉之前的音频，避免叠加播放
    stopCurrentAudio();

    // 显示语音指示器
    const ind = document.getElementById('audioIndicator');
    document.getElementById('speechText').textContent = fallbackText;
    ind.classList.add('speaking');

    // 尝试播放预生成音频
    let audio = audioCache[audioPath];
    if (!audio) {
        audio = new Audio(audioPath);
        audioCache[audioPath] = audio;
    }

    _currentAudio = audio;
    _audioEndCallback = onEnd || null;

    audio.currentTime = 0;
    audio.onended = () => {
        ind.classList.remove('speaking');
        _currentAudio = null;
        if (_audioEndCallback) { const cb = _audioEndCallback; _audioEndCallback = null; cb(); }
    };
    audio.onerror = () => {
        console.log('音频加载失败，使用 TTS 备选:', audioPath);
        ind.classList.remove('speaking');
        _currentAudio = null;
        _audioEndCallback = null;
        speak(fallbackText, onEnd);  // 降级到原有 TTS，传递回调
    };

    audio.play().catch(() => {
        console.log('音频播放失败，使用 TTS 备选:', audioPath);
        ind.classList.remove('speaking');
        _currentAudio = null;
        _audioEndCallback = null;
        speak(fallbackText, onEnd);
    });
}

// 原始 TTS 函数（作为备选）
function speak(text, onEnd) {
    if (!('speechSynthesis' in window)) { if (onEnd) onEnd(); return; }
    speechSynthesis.cancel();
    // cancel() 后需要短暂延迟，否则引擎会卡死不发声
    setTimeout(() => {
        speechSynthesis.resume();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'zh-CN'; u.rate = 0.85; u.pitch = 1.15;
        const ind = document.getElementById('audioIndicator');
        document.getElementById('speechText').textContent = text;
        ind.classList.add('speaking');
        u.onend = () => { ind.classList.remove('speaking'); if (onEnd) onEnd(); };
        u.onerror = () => { ind.classList.remove('speaking'); if (onEnd) onEnd(); };
        speechSynthesis.speak(u);
        // Chrome bug: 长utterance播放中引擎会暂停，用定时器持续 resume
        clearInterval(_speechKeepAlive);
        _speechKeepAlive = setInterval(() => {
            if (!speechSynthesis.speaking) {
                clearInterval(_speechKeepAlive);
            } else {
                speechSynthesis.pause();
                speechSynthesis.resume();
            }
        }, 5000);
    }, 50);
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

// ============ 识字探险：象形汉字数据 ============
// 每个汉字包含：char（字）、pinyin（拼音）、words（组词）、sentence（造句）、pictograph（象形图绘制函数名）
const planetWords = {
    sun: {
        name: '太阳', icon: '☀️',
        words: [
            { char: '日', pinyin: 'rì', words: '红日 · 明日', sentence: '红日初升，照亮了大地。', pictograph: 'drawSun' },
            { char: '火', pinyin: 'huǒ', words: '火苗 · 火炬', sentence: '火苗跳跃，温暖了整个房间。', pictograph: 'drawFire' },
            { char: '大', pinyin: 'dà', words: '大小 · 大人', sentence: '大象很大，小蚂蚁很小。', pictograph: 'drawBig' },
            { char: '光', pinyin: 'guāng', words: '阳光 · 月光', sentence: '阳光暖暖的照在身上。', pictograph: 'drawLight' },
            { char: '热', pinyin: 'rè', words: '热水 · 炎热', sentence: '夏天好热，吃冰棍凉快。', pictograph: 'drawHot' }
        ]
    },
    earth: {
        name: '地球', icon: '🌍',
        words: [
            { char: '山', pinyin: 'shān', words: '高山 · 山峰', sentence: '高高的山像巨人站着。', pictograph: 'drawMountain' },
            { char: '水', pinyin: 'shuǐ', words: '河水 · 雨水', sentence: '小河的水哗啦啦地流。', pictograph: 'drawWater' },
            { char: '木', pinyin: 'mù', words: '树木 · 木头', sentence: '森林里有很多树木。', pictograph: 'drawTree' },
            { char: '土', pinyin: 'tǔ', words: '泥土 · 土地', sentence: '泥土里长出了小苗。', pictograph: 'drawEarth' },
            { char: '田', pinyin: 'tián', words: '田地 · 田野', sentence: '田野里麦苗绿油油一片。', pictograph: 'drawField' },
            { char: '云', pinyin: 'yún', words: '白云 · 云朵', sentence: '白云像棉花糖飘在天上。', pictograph: 'drawCloud' },
            { char: '雨', pinyin: 'yǔ', words: '下雨 · 雨滴', sentence: '下雨了，滴答滴答响。', pictograph: 'drawRain' }
        ]
    },
    moon: {
        name: '月球', icon: '🌙',
        words: [
            { char: '月', pinyin: 'yuè', words: '月亮 · 月光', sentence: '月亮悄悄爬上了树梢。', pictograph: 'drawMoon' },
            { char: '石', pinyin: 'shí', words: '石头 · 岩石', sentence: '河边有很多圆圆的石头。', pictograph: 'drawStone' },
            { char: '小', pinyin: 'xiǎo', words: '大小 · 小鸟', sentence: '小小的蚂蚁力气大。', pictograph: 'drawSmall' }
        ]
    },
    saturn: {
        name: '土星', icon: '🪐',
        words: [
            { char: '星', pinyin: 'xīng', words: '星星 · 星空', sentence: '满天星星亮晶晶。', pictograph: 'drawStar' },
            { char: '目', pinyin: 'mù', words: '眼目 · 目光', sentence: '用眼睛看世界真奇妙。', pictograph: 'drawEye' },
            { char: '口', pinyin: 'kǒu', words: '口才 · 口算', sentence: '他口才极佳，赢得了众人赞许。', pictograph: 'drawMouth' }
        ]
    },
    mars: {
        name: '火星', icon: '🔴',
        words: [
            { char: '人', pinyin: 'rén', words: '大人 · 人们', sentence: '小朋友长大变成大人。', pictograph: 'drawPerson' },
            { char: '上', pinyin: 'shàng', words: '上面 · 上学', sentence: '小鸟飞到树上去了。', pictograph: 'drawUp' },
            { char: '下', pinyin: 'xià', words: '下面 · 下雨', sentence: '苹果从树上掉下来了。', pictograph: 'drawDown' }
        ]
    },
    jupiter: {
        name: '木星', icon: '🟤',
        words: [
            { char: '天', pinyin: 'tiān', words: '天空 · 蓝天', sentence: '蓝色的天空让人心情愉快。', pictograph: 'drawSky' },
            { char: '手', pinyin: 'shǒu', words: '小手 · 手指', sentence: '我有两只小手会画画。', pictograph: 'drawHand' },
            { char: '足', pinyin: 'zú', words: '脚足 · 足球', sentence: '小脚丫踩在沙滩上。', pictograph: 'drawFoot' }
        ]
    },
    neptune: {
        name: '海王星', icon: '🔵',
        words: [
            { char: '鱼', pinyin: 'yú', words: '小鱼 · 金鱼', sentence: '小鱼在水里游来游去。', pictograph: 'drawFish' },
            { char: '门', pinyin: 'mén', words: '大门 · 门口', sentence: '打开门，阳光照进来。', pictograph: 'drawDoor' },
            { char: '井', pinyin: 'jǐng', words: '水井 · 井口', sentence: '村民们在水井旁洗衣服。', pictograph: 'drawWell' }
        ]
    },
    venus: {
        name: '金星', icon: '🟡',
        words: [
            { char: '心', pinyin: 'xīn', words: '开心 · 爱心', sentence: '帮助别人让我很开心。', pictograph: 'drawHeart' },
            { char: '耳', pinyin: 'ěr', words: '耳朵 · 耳机', sentence: '用耳朵听美妙的音乐。', pictograph: 'drawEar' },
            { char: '舟', pinyin: 'zhōu', words: '小舟 · 舟船', sentence: '小舟在湖面上轻轻漂。', pictograph: 'drawBoat' }
        ]
    }
};

// ============ 象形图绘制函数 ============
const pictographDrawers = {
    // 日 - 太阳（圆形+笑脸）
    drawSun(ctx, w, h) {
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath(); ctx.arc(w/2, h/2, 40, 0, Math.PI*2); ctx.fill();
        // 光芒
        ctx.strokeStyle = '#FF9F43'; ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
            const angle = i * Math.PI / 4;
            ctx.beginPath();
            ctx.moveTo(w/2 + Math.cos(angle)*45, h/2 + Math.sin(angle)*45);
            ctx.lineTo(w/2 + Math.cos(angle)*60, h/2 + Math.sin(angle)*60);
            ctx.stroke();
        }
        // 笑脸
        ctx.fillStyle = '#E67E22';
        ctx.beginPath(); ctx.arc(w/2-12, h/2-8, 5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w/2+12, h/2-8, 5, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#E67E22'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(w/2, h/2+5, 15, 0.2, Math.PI-0.2); ctx.stroke();
    },
    // 火 - 象形火字：严格按照参考图绘制
    drawFire(ctx, w, h) {
        const cx = w / 2, cy = h / 2 + 15;

        // ===== 两根粗木柴交叉成"人"字形 =====
        // 左木柴
        ctx.save();
        ctx.translate(cx - 8, cy + 25);
        ctx.rotate(-0.45);
        // 木柴主体
        ctx.fillStyle = '#8B5A2B';
        ctx.beginPath();
        ctx.roundRect(-8, -5, 16, 55, 3);
        ctx.fill();
        ctx.strokeStyle = '#5D3A1A';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // 年轮截面（底部）
        ctx.fillStyle = '#DEB887';
        ctx.beginPath();
        ctx.ellipse(0, 50, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        // 年轮圈
        ctx.strokeStyle = '#A0522D';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(0, 50, 5, 4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 50, 2, 1.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 右木柴
        ctx.save();
        ctx.translate(cx + 8, cy + 25);
        ctx.rotate(0.45);
        ctx.fillStyle = '#8B5A2B';
        ctx.beginPath();
        ctx.roundRect(-8, -5, 16, 55, 3);
        ctx.fill();
        ctx.strokeStyle = '#5D3A1A';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // 年轮截面
        ctx.fillStyle = '#DEB887';
        ctx.beginPath();
        ctx.ellipse(0, 50, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.strokeStyle = '#A0522D';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(0, 50, 5, 4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 50, 2, 1.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // ===== 火焰 - 严格按照"火"字笔画结构 =====
        // "火"字结构：左点、右点 + 中间撇捺

        // 笔画1：左点（小火舌向左下斜）
        ctx.fillStyle = '#E53935';
        ctx.beginPath();
        ctx.moveTo(cx - 25, cy - 25);
        ctx.quadraticCurveTo(cx - 35, cy - 15, cx - 30, cy + 5);
        ctx.quadraticCurveTo(cx - 22, cy - 5, cx - 18, cy - 15);
        ctx.quadraticCurveTo(cx - 20, cy - 22, cx - 25, cy - 25);
        ctx.fill();
        // 左点内芯
        ctx.fillStyle = '#FF9800';
        ctx.beginPath();
        ctx.moveTo(cx - 25, cy - 18);
        ctx.quadraticCurveTo(cx - 30, cy - 10, cx - 27, cy);
        ctx.quadraticCurveTo(cx - 23, cy - 8, cx - 21, cy - 14);
        ctx.quadraticCurveTo(cx - 22, cy - 16, cx - 25, cy - 18);
        ctx.fill();

        // 笔画2：右点（小火舌向右下斜）
        ctx.fillStyle = '#E53935';
        ctx.beginPath();
        ctx.moveTo(cx + 25, cy - 25);
        ctx.quadraticCurveTo(cx + 35, cy - 15, cx + 30, cy + 5);
        ctx.quadraticCurveTo(cx + 22, cy - 5, cx + 18, cy - 15);
        ctx.quadraticCurveTo(cx + 20, cy - 22, cx + 25, cy - 25);
        ctx.fill();
        // 右点内芯
        ctx.fillStyle = '#FF9800';
        ctx.beginPath();
        ctx.moveTo(cx + 25, cy - 18);
        ctx.quadraticCurveTo(cx + 30, cy - 10, cx + 27, cy);
        ctx.quadraticCurveTo(cx + 23, cy - 8, cx + 21, cy - 14);
        ctx.quadraticCurveTo(cx + 22, cy - 16, cx + 25, cy - 18);
        ctx.fill();

        // 笔画3+4：中间主火焰（撇+捺合为一体向上）
        // 外层红色
        ctx.fillStyle = '#E53935';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 55); // 顶点
        ctx.quadraticCurveTo(cx - 18, cy - 35, cx - 15, cy + 10);
        ctx.quadraticCurveTo(cx, cy + 15, cx + 15, cy + 10);
        ctx.quadraticCurveTo(cx + 18, cy - 35, cx, cy - 55);
        ctx.fill();

        // 中层橙色
        ctx.fillStyle = '#FF9800';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 42);
        ctx.quadraticCurveTo(cx - 12, cy - 25, cx - 10, cy + 5);
        ctx.quadraticCurveTo(cx, cy + 8, cx + 10, cy + 5);
        ctx.quadraticCurveTo(cx + 12, cy - 25, cx, cy - 42);
        ctx.fill();

        // 内芯黄色
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 28);
        ctx.quadraticCurveTo(cx - 6, cy - 15, cx - 5, cy);
        ctx.quadraticCurveTo(cx, cy + 2, cx + 5, cy);
        ctx.quadraticCurveTo(cx + 6, cy - 15, cx, cy - 28);
        ctx.fill();
    },
    // 山 - 三座山峰
    drawMountain(ctx, w, h) {
        ctx.fillStyle = '#2ECC71';
        ctx.beginPath(); ctx.moveTo(w/2, 20); ctx.lineTo(w/2+50, h-20); ctx.lineTo(w/2-50, h-20); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#27AE60';
        ctx.beginPath(); ctx.moveTo(w/2-30, 45); ctx.lineTo(w/2-30+35, h-20); ctx.lineTo(w/2-30-35, h-20); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(w/2+35, 50); ctx.lineTo(w/2+35+30, h-20); ctx.lineTo(w/2+35-30, h-20); ctx.closePath(); ctx.fill();
        // 雪顶
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.moveTo(w/2, 20); ctx.lineTo(w/2+12, 40); ctx.lineTo(w/2-12, 40); ctx.closePath(); ctx.fill();
    },
    // 水 - 波浪
    drawWater(ctx, w, h) {
        ctx.strokeStyle = '#3498DB'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(20, 40 + i*30);
            ctx.quadraticCurveTo(45, 25 + i*30, 70, 40 + i*30);
            ctx.quadraticCurveTo(95, 55 + i*30, 120, 40 + i*30);
            ctx.stroke();
        }
        // 水滴
        ctx.fillStyle = '#3498DB';
        ctx.beginPath(); ctx.moveTo(w/2, 15); ctx.quadraticCurveTo(w/2+10, 30, w/2, 38);
        ctx.quadraticCurveTo(w/2-10, 30, w/2, 15); ctx.fill();
    },
    // 月 - 弯月+笑脸
    drawMoon(ctx, w, h) {
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath(); ctx.arc(w/2, h/2, 45, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fffaf5';
        ctx.beginPath(); ctx.arc(w/2+25, h/2-15, 35, 0, Math.PI*2); ctx.fill();
        // 表情
        ctx.fillStyle = '#E67E22';
        ctx.beginPath(); ctx.arc(w/2-15, h/2-5, 4, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#E67E22'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(w/2-8, h/2+12, 10, 0.3, Math.PI-0.3); ctx.stroke();
    },
    // 木 - 树
    drawTree(ctx, w, h) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(w/2-8, h/2, 16, 50);
        ctx.fillStyle = '#27AE60';
        ctx.beginPath(); ctx.arc(w/2, h/2-10, 40, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#2ECC71';
        ctx.beginPath(); ctx.arc(w/2-20, h/2+5, 25, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w/2+20, h/2+5, 25, 0, Math.PI*2); ctx.fill();
    },
    // 土 - 土堆
    drawEarth(ctx, w, h) {
        ctx.fillStyle = '#D35400';
        ctx.beginPath();
        ctx.moveTo(15, h-25); ctx.lineTo(w-15, h-25);
        ctx.lineTo(w-35, h-55); ctx.lineTo(35, h-55); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#E67E22';
        ctx.fillRect(20, h-25, w-40, 15);
        // 小苗
        ctx.strokeStyle = '#27AE60'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(w/2, h-55); ctx.lineTo(w/2, h-80); ctx.stroke();
        ctx.fillStyle = '#2ECC71';
        ctx.beginPath(); ctx.ellipse(w/2-8, h-80, 10, 6, -0.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(w/2+8, h-80, 10, 6, 0.5, 0, Math.PI*2); ctx.fill();
    },
    // 田 - 田字格
    drawField(ctx, w, h) {
        ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 4;
        ctx.strokeRect(30, 30, 80, 80);
        ctx.beginPath(); ctx.moveTo(70, 30); ctx.lineTo(70, 110); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(30, 70); ctx.lineTo(110, 70); ctx.stroke();
        ctx.fillStyle = '#27AE60';
        ctx.fillRect(35, 35, 30, 30); ctx.fillRect(75, 35, 30, 30);
        ctx.fillRect(35, 75, 30, 30); ctx.fillRect(75, 75, 30, 30);
    },
    // 人 - 小人
    drawPerson(ctx, w, h) {
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath(); ctx.arc(w/2, 35, 20, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#3498DB'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(w/2, 55); ctx.lineTo(w/2, 95); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2-25, 70); ctx.lineTo(w/2, 60); ctx.lineTo(w/2+25, 70); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2, 95); ctx.lineTo(w/2-20, 125); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2, 95); ctx.lineTo(w/2+20, 125); ctx.stroke();
    },
    // 口 - 嘴巴
    drawMouth(ctx, w, h) {
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.ellipse(w/2, h/2, 45, 30, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#C0392B';
        ctx.beginPath();
        ctx.ellipse(w/2, h/2+10, 35, 18, 0, 0, Math.PI); ctx.fill();
        // 牙齿
        ctx.fillStyle = '#FFF';
        ctx.fillRect(w/2-25, h/2-5, 50, 12);
    },
    // 目 - 眼睛
    drawEye(ctx, w, h) {
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.ellipse(w/2, h/2, 50, 30, 0, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(w/2, h/2, 50, 30, 0, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = '#3498DB';
        ctx.beginPath(); ctx.arc(w/2, h/2, 18, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(w/2, h/2, 8, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.arc(w/2+5, h/2-5, 4, 0, Math.PI*2); ctx.fill();
    },
    // 大 - 大人张开手脚
    drawBig(ctx, w, h) {
        ctx.fillStyle = '#9B59B6';
        ctx.beginPath(); ctx.arc(w/2, 25, 15, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#9B59B6'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(w/2, 40); ctx.lineTo(w/2, 85); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(20, 55); ctx.lineTo(w/2, 55); ctx.lineTo(w-20, 55); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2, 85); ctx.lineTo(30, 125); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2, 85); ctx.lineTo(w-30, 125); ctx.stroke();
    },
    // 小 - 小
    drawSmall(ctx, w, h) {
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath(); ctx.arc(w/2, h/2-10, 8, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#E74C3C'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(w/2, h/2); ctx.lineTo(w/2, h/2+40); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2-30, h/2+15); ctx.lineTo(w/2, h/2+30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2+30, h/2+15); ctx.lineTo(w/2, h/2+30); ctx.stroke();
    },
    // 上 - 箭头向上
    drawUp(ctx, w, h) {
        ctx.fillStyle = '#2ECC71';
        ctx.beginPath();
        ctx.moveTo(w/2, 20); ctx.lineTo(w/2+30, 60); ctx.lineTo(w/2+12, 60);
        ctx.lineTo(w/2+12, 110); ctx.lineTo(w/2-12, 110); ctx.lineTo(w/2-12, 60);
        ctx.lineTo(w/2-30, 60); ctx.closePath(); ctx.fill();
    },
    // 下 - 箭头向下
    drawDown(ctx, w, h) {
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.moveTo(w/2, 120); ctx.lineTo(w/2+30, 80); ctx.lineTo(w/2+12, 80);
        ctx.lineTo(w/2+12, 30); ctx.lineTo(w/2-12, 30); ctx.lineTo(w/2-12, 80);
        ctx.lineTo(w/2-30, 80); ctx.closePath(); ctx.fill();
    },
    // 云 - 云朵
    drawCloud(ctx, w, h) {
        ctx.fillStyle = '#ECF0F1';
        ctx.beginPath(); ctx.arc(45, h/2+10, 25, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(70, h/2-5, 30, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(100, h/2+5, 28, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(75, h/2+20, 22, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#BDC3C7'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(45, h/2+10, 25, Math.PI*0.8, Math.PI*1.8); ctx.stroke();
        ctx.beginPath(); ctx.arc(70, h/2-5, 30, Math.PI*1.2, Math.PI*1.9); ctx.stroke();
    },
    // 雨 - 云+雨滴
    drawRain(ctx, w, h) {
        ctx.fillStyle = '#95A5A6';
        ctx.beginPath(); ctx.arc(40, 40, 20, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(70, 35, 25, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(100, 40, 20, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#3498DB';
        for (let i = 0; i < 5; i++) {
            const x = 30 + i*22, y = 75 + (i%2)*15;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x+6, y+15, x, y+22);
            ctx.quadraticCurveTo(x-6, y+15, x, y); ctx.fill();
        }
    },
    // 石 - 石头
    drawStone(ctx, w, h) {
        ctx.fillStyle = '#7F8C8D';
        ctx.beginPath();
        ctx.moveTo(30, h-30); ctx.quadraticCurveTo(20, h/2, 50, 35);
        ctx.quadraticCurveTo(80, 25, 100, 40);
        ctx.quadraticCurveTo(120, 60, 110, h-30); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#95A5A6';
        ctx.beginPath(); ctx.ellipse(65, 55, 20, 12, 0.3, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#BDC3C7';
        ctx.beginPath(); ctx.ellipse(80, 70, 8, 5, -0.2, 0, Math.PI*2); ctx.fill();
    },
    // 天 - 天空+太阳+云
    drawSky(ctx, w, h) {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#87CEEB'); grad.addColorStop(1, '#E0F7FA');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath(); ctx.arc(100, 35, 20, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.arc(35, 50, 15, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(55, 45, 18, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(50, 60, 12, 0, Math.PI*2); ctx.fill();
    },
    // 星 - 五角星
    drawStar(ctx, w, h) {
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI / 5) - Math.PI/2;
            const x = w/2 + Math.cos(angle) * 45;
            const y = h/2 + Math.sin(angle) * 45;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.fill();
        // 闪光
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.arc(w/2+10, h/2-15, 5, 0, Math.PI*2); ctx.fill();
    },
    // 心 - 爱心
    drawHeart(ctx, w, h) {
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.moveTo(w/2, h/2+30);
        ctx.bezierCurveTo(w/2-50, h/2-10, w/2-50, h/2-50, w/2, h/2-20);
        ctx.bezierCurveTo(w/2+50, h/2-50, w/2+50, h/2-10, w/2, h/2+30);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.arc(w/2-15, h/2-25, 8, 0, Math.PI*2); ctx.fill();
    },
    // 手 - 手掌
    drawHand(ctx, w, h) {
        ctx.fillStyle = '#FDEBD0';
        ctx.beginPath();
        ctx.moveTo(40, h-25); ctx.quadraticCurveTo(35, h/2+20, 45, h/2);
        ctx.lineTo(50, 40); ctx.lineTo(58, 40); ctx.lineTo(55, h/2);
        ctx.lineTo(60, 30); ctx.lineTo(68, 30); ctx.lineTo(68, h/2);
        ctx.lineTo(75, 35); ctx.lineTo(83, 35); ctx.lineTo(80, h/2);
        ctx.lineTo(90, 45); ctx.lineTo(98, 50); ctx.lineTo(90, h/2+5);
        ctx.quadraticCurveTo(105, h/2+30, 95, h-25);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#E8DAEF'; ctx.lineWidth = 2; ctx.stroke();
    },
    // 足 - 脚
    drawFoot(ctx, w, h) {
        ctx.fillStyle = '#FDEBD0';
        ctx.beginPath();
        ctx.moveTo(35, 40); ctx.quadraticCurveTo(30, h/2, 35, h-40);
        ctx.quadraticCurveTo(40, h-25, 60, h-30);
        ctx.lineTo(70, h-35); ctx.lineTo(80, h-32); ctx.lineTo(90, h-35);
        ctx.lineTo(100, h-38); ctx.lineTo(105, h-45);
        ctx.quadraticCurveTo(110, h/2, 100, 40);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#E8DAEF'; ctx.lineWidth = 2; ctx.stroke();
    },
    // 鱼 - 小鱼
    drawFish(ctx, w, h) {
        ctx.fillStyle = '#F39C12';
        ctx.beginPath();
        ctx.moveTo(25, h/2); ctx.quadraticCurveTo(60, h/2-35, 95, h/2);
        ctx.quadraticCurveTo(60, h/2+35, 25, h/2); ctx.fill();
        // 尾巴
        ctx.beginPath(); ctx.moveTo(25, h/2); ctx.lineTo(5, h/2-20);
        ctx.lineTo(5, h/2+20); ctx.closePath(); ctx.fill();
        // 眼睛
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.arc(75, h/2-5, 8, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(77, h/2-5, 4, 0, Math.PI*2); ctx.fill();
        // 鳞片
        ctx.strokeStyle = '#E67E22'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(50, h/2, 8, 0.5, 2.5); ctx.stroke();
        ctx.beginPath(); ctx.arc(60, h/2+8, 6, 0.5, 2.5); ctx.stroke();
    },
    // 门 - 门
    drawDoor(ctx, w, h) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(30, 20, 80, 100);
        ctx.strokeStyle = '#5D3A1A'; ctx.lineWidth = 4;
        ctx.strokeRect(30, 20, 80, 100);
        ctx.beginPath(); ctx.moveTo(70, 20); ctx.lineTo(70, 120); ctx.stroke();
        // 门把手
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath(); ctx.arc(58, 75, 5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(82, 75, 5, 0, Math.PI*2); ctx.fill();
    },
    // 井 - 水井
    drawWell(ctx, w, h) {
        ctx.fillStyle = '#7F8C8D';
        ctx.fillRect(25, 50, 90, 15);
        ctx.fillRect(25, 80, 90, 15);
        ctx.fillRect(35, 50, 15, 45);
        ctx.fillRect(90, 50, 15, 45);
        ctx.fillStyle = '#3498DB';
        ctx.fillRect(52, 67, 36, 11);
    },
    // 耳 - 耳朵
    drawEar(ctx, w, h) {
        ctx.fillStyle = '#FDEBD0';
        ctx.beginPath();
        ctx.moveTo(w/2, 25); ctx.quadraticCurveTo(w/2+45, 35, w/2+40, h/2);
        ctx.quadraticCurveTo(w/2+45, h-35, w/2+10, h-25);
        ctx.quadraticCurveTo(w/2-15, h-30, w/2-10, h/2+20);
        ctx.quadraticCurveTo(w/2-5, h/2-10, w/2, 25);
        ctx.fill();
        ctx.strokeStyle = '#E8DAEF'; ctx.lineWidth = 2; ctx.stroke();
        ctx.strokeStyle = '#D5CABD'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w/2+5, 45); ctx.quadraticCurveTo(w/2+25, h/2, w/2+10, h-45);
        ctx.stroke();
    },
    // 舟 - 小船
    drawBoat(ctx, w, h) {
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(15, h/2+15); ctx.lineTo(35, h-25); ctx.lineTo(105, h-25);
        ctx.lineTo(125, h/2+15); ctx.quadraticCurveTo(70, h/2+35, 15, h/2+15);
        ctx.fill();
        // 帆
        ctx.fillStyle = '#ECF0F1';
        ctx.beginPath(); ctx.moveTo(70, h/2+10); ctx.lineTo(70, 20);
        ctx.lineTo(100, h/2); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#BDC3C7'; ctx.lineWidth = 2; ctx.stroke();
        // 桅杆
        ctx.strokeStyle = '#5D3A1A'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(70, 20); ctx.lineTo(70, h-25); ctx.stroke();
    },
    // 光 - 光芒
    drawLight(ctx, w, h) {
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath(); ctx.arc(w/2, h/2, 25, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#F4D03F'; ctx.lineWidth = 3;
        for (let i = 0; i < 12; i++) {
            const angle = i * Math.PI / 6;
            const inner = 30, outer = 50;
            ctx.beginPath();
            ctx.moveTo(w/2 + Math.cos(angle)*inner, h/2 + Math.sin(angle)*inner);
            ctx.lineTo(w/2 + Math.cos(angle)*outer, h/2 + Math.sin(angle)*outer);
            ctx.stroke();
        }
    },
    // 热 - 热气腾腾
    drawHot(ctx, w, h) {
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath(); ctx.arc(w/2, h/2+20, 30, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#C0392B'; ctx.lineWidth = 3;
        // 热气
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(w/2-20+i*20, h/2-15);
            ctx.quadraticCurveTo(w/2-25+i*20, h/2-35, w/2-20+i*20, h/2-45);
            ctx.quadraticCurveTo(w/2-15+i*20, h/2-55, w/2-20+i*20, h/2-65);
            ctx.stroke();
        }
    }
};

// 识字探险可点击的星球顺序
const wordPlanetOrder = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
// 映射：没有专属汉字的星球用邻近的汉字数据
const wordPlanetMapping = {
    sun: 'sun', mercury: 'sun', venus: 'venus', earth: 'earth',
    moon: 'moon', mars: 'mars', jupiter: 'jupiter', saturn: 'saturn',
    uranus: 'neptune', neptune: 'neptune'
};

// ============ 识字探险：状态 ============
let wordAdventureMode = false;
let currentWordPlanet = null;      // 当前学习的星球key
let currentWordIndex = 0;          // 当前学习的汉字索引
let learnedWords = new Set();      // 已学过的汉字
let wordQuizScore = 0;             // 测验得分
let wordPlanetNavIndex = 0;        // 星球导航索引

// ============ 识字探险：获取所有汉字总数 ============
function getTotalWordCount() {
    let count = 0;
    Object.values(planetWords).forEach(p => count += p.words.length);
    return count;
}

// ============ 识字探险：开始 ============
function startWordAdventure() {
    wordAdventureMode = true;
    currentMode = 'wordAdventure';
    wordPlanetNavIndex = 0;

    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('wordProgressBar').classList.add('visible');
    document.getElementById('wordBackBtn').style.display = 'block';
    document.getElementById('wordNavArrows').classList.add('visible');
    document.getElementById('wordHintTip').style.display = 'block';

    updateWordProgress();
    animateCameraTo({ x: 100, y: 80, z: 200 }, { x: 0, y: 0, z: 0 });
    playAudio(audioPaths.fixed.wordIntro, '欢迎来到识字探险！点击任意星球开始学习汉字吧！');
}

// ============ 识字探险：退出 ============
function exitWordAdventure() {
    wordAdventureMode = false;
    document.getElementById('wordProgressBar').classList.remove('visible');
    document.getElementById('wordBackBtn').style.display = 'none';
    document.getElementById('wordNavArrows').classList.remove('visible');
    document.getElementById('wordHintTip').style.display = 'none';
    document.getElementById('wordLearningCard').classList.remove('visible');
    document.getElementById('wordQuizOverlay').classList.remove('visible');
    showMainMenu();
}

// ============ 识字探险：更新进度 ============
function updateWordProgress() {
    const total = getTotalWordCount();
    const learned = learnedWords.size;
    const pct = Math.round((learned / total) * 100);
    document.getElementById('wordProgressFill').style.width = pct + '%';
    document.getElementById('wordProgressText').textContent = learned + '/' + total;
}

// ============ 识字探险：点击星球处理 ============
function handleWordAdventureClick(planetName) {
    const mappedKey = wordPlanetMapping[planetName];
    if (!mappedKey || !planetWords[mappedKey]) {
        playAudio(audioPaths.fixed.wordNoTask, '这个星球暂时没有汉字任务，试试别的星球吧！');
        return;
    }
    currentWordPlanet = mappedKey;
    currentWordIndex = 0;
    document.getElementById('wordHintTip').style.display = 'none';
    focusOnPlanet(planetName);
    setTimeout(() => showWordLearningCard(), 800);
}

// ============ 识字探险：显示汉字学习卡片 ============
function showWordLearningCard() {
    const data = planetWords[currentWordPlanet];
    if (!data) return;
    const word = data.words[currentWordIndex];

    document.getElementById('wlcCharacter').textContent = word.char;
    document.getElementById('wlcPinyin').textContent = word.pinyin;
    document.getElementById('wlcWordGroup').textContent = word.words || '';
    document.getElementById('wlcSentence').textContent = word.sentence;

    // 绘制象形图
    const canvas = document.getElementById('wlcPictograph');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (word.pictograph && pictographDrawers[word.pictograph]) {
        pictographDrawers[word.pictograph](ctx, canvas.width, canvas.height);
    } else {
        // 没有象形图时显示占位
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ccc';
        ctx.font = '60px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(word.char, canvas.width/2, canvas.height/2);
    }

    // 相关汉字
    const container = document.getElementById('wlcRelatedWords');
    container.innerHTML = '';
    data.words.forEach((w, i) => {
        const chip = document.createElement('span');
        chip.className = 'word-chip';
        if (i === currentWordIndex) chip.classList.add('active');
        if (learnedWords.has(w.char)) chip.classList.add('learned');
        chip.textContent = w.char;
        chip.onclick = () => {
            currentWordIndex = i;
            showWordLearningCard();
            const wordData = data.words[i];
            playAudio(audioPaths.wordIntroAudio(wordData.char), wordData.char + '，' + wordData.pinyin + '。' + wordData.sentence);
        };
        container.appendChild(chip);
    });

    document.getElementById('wordLearningCard').classList.add('visible');

    // 标记为已学过
    learnedWords.add(word.char);
    updateWordProgress();
    saveWordProgress();

    playAudio(audioPaths.wordIntroAudio(word.char), word.char + '，' + word.pinyin + '。' + word.sentence);
}

// ============ 识字探险：下一个汉字 ============
function nextWord() {
    const data = planetWords[currentWordPlanet];
    if (!data) return;
    currentWordIndex++;
    if (currentWordIndex >= data.words.length) {
        // 这个星球的汉字学完了
        const planetName = data.name;
        playAudio(audioPaths.planetComplete(currentWordPlanet), '太棒了！' + planetName + '的汉字都学完了！试试别的星球吧！');
        document.getElementById('wordLearningCard').classList.remove('visible');
        playSuccessEffect();
        return;
    }
    showWordLearningCard();
}

// ============ 识字探险：小测验 ============
function startWordQuiz() {
    const data = planetWords[currentWordPlanet];
    if (!data || data.words.length < 2) return;

    document.getElementById('wordLearningCard').classList.remove('visible');
    document.getElementById('wordQuizOverlay').classList.add('visible');

    // 随机选择测验类型
    const quizType = Math.random() > 0.5 ? 'listen' : 'read';
    const correctWord = data.words[currentWordIndex];

    if (quizType === 'listen') {
        // 听音选字
        document.getElementById('quizPrompt').textContent = '🔊 听一听，选出正确的字';
        document.getElementById('quizCharacter').textContent = '';
        document.getElementById('quizHintText').textContent = '读音：' + correctWord.pinyin;
        playAudio(audioPaths.wordChar(correctWord.char), correctWord.char);
    } else {
        // 看字选拼音变为：看情境句选字
        document.getElementById('quizPrompt').textContent = '👀 这个字读什么？';
        document.getElementById('quizCharacter').textContent = correctWord.char;
        document.getElementById('quizHintText').textContent = correctWord.sentence;
    }

    // 生成4个选项（含正确答案）
    const options = [correctWord];
    const allWords = [];
    Object.values(planetWords).forEach(p => p.words.forEach(w => {
        if (w.char !== correctWord.char) allWords.push(w);
    }));
    // 随机选3个干扰项
    const shuffled = allWords.sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3 && i < shuffled.length; i++) {
        options.push(shuffled[i]);
    }
    // 打乱选项
    options.sort(() => Math.random() - 0.5);

    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = '';
    document.getElementById('quizResult').textContent = '';
    document.getElementById('quizResult').classList.remove('visible');
    document.getElementById('quizCloseBtn').style.display = 'none';

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        if (quizType === 'listen') {
            btn.textContent = opt.char;
        } else {
            btn.textContent = opt.pinyin;
        }
        btn.onclick = () => handleWordQuizAnswer(opt, correctWord, btn, optionsContainer);
        optionsContainer.appendChild(btn);
    });
}

// ============ 识字探险：测验答题处理 ============
function handleWordQuizAnswer(selected, correct, btn, container) {
    // 禁用所有按钮
    container.querySelectorAll('.quiz-option').forEach(b => b.style.pointerEvents = 'none');

    const resultEl = document.getElementById('quizResult');

    if (selected.char === correct.char) {
        btn.classList.add('correct');
        resultEl.textContent = '🎉 太棒了！答对啦！';
        resultEl.style.color = '#4ecdc4';
        playSuccessEffect();
        wordQuizScore++;
        playAudio(audioPaths.wordCorrect(correct.char), '太棒了！答对啦！' + correct.char + '，' + correct.sentence);
    } else {
        btn.classList.add('wrong');
        // 高亮正确答案
        container.querySelectorAll('.quiz-option').forEach(b => {
            if (b.textContent === correct.char || b.textContent === correct.pinyin) {
                b.classList.add('correct');
            }
        });
        resultEl.textContent = '😊 没关系，正确答案是「' + correct.char + '」';
        resultEl.style.color = '#ff9f43';
        playAudio(audioPaths.wordWrong(correct.char), '没关系！正确答案是' + correct.char + '。' + correct.sentence);
    }
    resultEl.classList.add('visible');
    document.getElementById('quizCloseBtn').style.display = 'inline-block';
}

// ============ 识字探险：关闭测验 ============
function closeWordQuiz() {
    document.getElementById('wordQuizOverlay').classList.remove('visible');
    showWordLearningCard();
}

// ============ 识字探险：星球导航 ============
function navigateWordPlanet(dir) {
    wordPlanetNavIndex = (wordPlanetNavIndex + dir + wordPlanetOrder.length) % wordPlanetOrder.length;
    const name = wordPlanetOrder[wordPlanetNavIndex];
    focusOnPlanet(name);
    // 自动打开该星球的汉字卡片
    const mappedKey = wordPlanetMapping[name];
    if (mappedKey && planetWords[mappedKey]) {
        currentWordPlanet = mappedKey;
        currentWordIndex = 0;
        document.getElementById('wordHintTip').style.display = 'none';
        setTimeout(() => showWordLearningCard(), 800);
    }
}

// ============ 识字探险：存档 ============
function saveWordProgress() {
    localStorage.setItem('wordAdventureProgress', JSON.stringify({
        learnedWords: Array.from(learnedWords),
        quizScore: wordQuizScore
    }));
}
function loadWordProgress() {
    const s = localStorage.getItem('wordAdventureProgress');
    if (s) {
        const p = JSON.parse(s);
        learnedWords = new Set(p.learnedWords || []);
        wordQuizScore = p.quizScore || 0;
    }
}

// ============ 识字探险：UI 事件绑定 ============
function setupWordAdventureEvents() {
    document.getElementById('wordAdventureBtn').onclick = startWordAdventure;
    document.getElementById('wordBackBtn').onclick = exitWordAdventure;
    document.getElementById('closeWordCard').onclick = () => document.getElementById('wordLearningCard').classList.remove('visible');
    document.getElementById('wlcSpeakBtn').onclick = () => {
        const data = planetWords[currentWordPlanet];
        if (data) {
            const w = data.words[currentWordIndex];
            playAudio(audioPaths.wordIntroAudio(w.char), w.char + '，' + w.pinyin + '。' + w.sentence);
        }
    };
    document.getElementById('wlcSentence').onclick = () => {
        const data = planetWords[currentWordPlanet];
        if (data) {
            const w = data.words[currentWordIndex];
            playAudio(audioPaths.wordIntroAudio(w.char), w.sentence);
        }
    };
    document.getElementById('wlcQuizBtn').onclick = startWordQuiz;
    document.getElementById('wlcNextBtn').onclick = nextWord;
    document.getElementById('quizCloseBtn').onclick = closeWordQuiz;
    document.getElementById('wordPrevPlanet').onclick = () => navigateWordPlanet(-1);
    document.getElementById('wordNextPlanet').onclick = () => navigateWordPlanet(1);
}

window.addEventListener('DOMContentLoaded', init);
