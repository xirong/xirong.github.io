/**
 * 地球的奥秘 - 柳智天的宇宙课堂
 * 展示地球自转、公转和四季变化
 * 改进版：更真实的颜色，中国和美国轮廓高亮
 */

// ============ 全局变量 ============
let scene, camera, renderer, controls;
let earth, sun, moon;
let earthOrbit;
let axisLine, axisArrow;
let starField;
let seasonMarkers = [];  // 保存四季标记和标签
let clock;
let currentMode = 'rotation';
let animationSpeed = 0.5;
let dayCount = 0;
let yearProgress = 0;
let orbitAngle = 0;
let isPlaying = true;
let hasCompletedOrbit = false;

// ============ 日食模式状态 ============
let eclipseGroup = null;
let eclipseProgress = 0;       // 0.0 → 1.0
let ecl_skyPlane = null;
let ecl_sunGlow = null;
let ecl_sunDisc = null;
let ecl_coronaRays = null;
let ecl_coronaInner = null;
let ecl_moonDisc = null;
let ecl_diamondRing = null;
let ecl_eclipseStars = null;

const ECLIPSE_SUN_RADIUS = 6.0;
const ECLIPSE_MOON_RADIUS = 6.15;
const ECLIPSE_CAMERA_Z = 20.0;

// 地球参数
const EARTH_RADIUS = 5;
const EARTH_ORBIT_RADIUS = 80;  // 半长轴
const EARTH_ORBIT_RADIUS_B = 72; // 半短轴（椭圆，稍微夸张以便观察）
const EARTH_TILT = 23.5 * Math.PI / 180;
const MOON_RADIUS = 1.2;
const MOON_ORBIT_RADIUS = 12;
const SUN_RADIUS = 15;

// 四季信息
const seasonInfo = {
    rotation: {
        title: '🔄 地球自转',
        content: `
            <p>地球像一个<span class="highlight">旋转的陀螺</span>，每天都在不停地转动！</p>
            <p>地球自转一圈需要<span class="highlight">24小时</span>，这就是我们一天的时间。</p>
            <p>当我们这边面对太阳时，就是<span class="highlight">白天</span>；背对太阳时，就是<span class="highlight">黑夜</span>。</p>
            <p>看！当<span class="highlight">中国</span>是白天的时候，<span class="highlight">美国</span>正好是黑夜呢！</p>
            <div class="fun-fact">
                <div class="fun-fact-title">🤔 智天，你知道吗？</div>
                <p>地球自转的速度非常快！在赤道上，地球表面的移动速度达到每小时1670公里，比飞机还快呢！</p>
            </div>
        `
    },
    revolution: {
        title: '🌸 公转与四季',
        content: `
            <p>地球围绕<span class="highlight">太阳</span>转圈圈，轨道是<span class="highlight">椭圆形</span>的！</p>
            <p>地球绕太阳转一圈需要<span class="highlight">365天</span>，这就是一年。</p>
            <p>为什么会有四季？秘密是<span class="highlight">地轴倾斜23.5度</span>！</p>
            <p>北半球朝向太阳时阳光<span class="highlight">直射</span>→夏天热；远离时阳光<span class="highlight">斜射</span>→冬天冷。</p>
            <div class="fun-fact">
                <div class="fun-fact-title">🤯 智天，你知道吗？</div>
                <p>北半球冬天时，地球反而离太阳<span class="highlight">更近</span>（近日点）！所以季节变化不是因为距离远近，而是因为地轴倾斜导致阳光照射角度不同！</p>
            </div>
        `
    },
    structure: {
        title: '🌋 地球内部结构',
        content: `
            <p><b>地球的里面能住人吗？</b>当然不能！越往地下越<span class="highlight">热</span>，压力也越<span class="highlight">大</span>。</p>
            <p>地球半径<span class="highlight">6371公里</span>，就像一个<span class="highlight">巨大的鸡蛋</span>：</p>
            <p>🥚 <span class="highlight">地壳</span> = 蛋壳（薄薄一层，只有5~70公里）</p>
            <p>🍳 <span class="highlight">地幔</span> = 蛋白（又厚又热，岩石会慢慢流动）</p>
            <p>🟡 <span class="highlight">地核</span> = 蛋黄（液态<span class="highlight">外核</span> + 固态<span class="highlight">内核</span>）</p>
            <p>两个重要的分界面：<span class="highlight">莫霍面</span>（地壳↔地幔）和<span class="highlight">古登堡面</span>（地幔↔外核）。</p>
            <div class="fun-fact">
                <div class="fun-fact-title">🔬 科学家怎么知道的？</div>
                <p>靠<span class="highlight">地震波</span>！地震时产生两种波：<span class="highlight">P波</span>（纵波，能穿过固体和液体）和<span class="highlight">S波</span>（横波，只能穿过固体）。S波到外核就消失了，说明外核是液态的！</p>
            </div>
            <div class="fun-fact">
                <div class="fun-fact-title">⛏️ 人类挖到多深？</div>
                <p>苏联的<span class="highlight">科拉超深钻孔</span>挖了12.2公里，仅穿透地壳的1/3！温度已达180°C，再往下钻头就会熔化。</p>
            </div>
        `
    },
    eclipse: {
        title: '🌑 日食',
        content: `
            <p>日食是<span class="highlight">月球</span>跑到太阳和地球中间，把太阳<span class="highlight">遮住</span>了！</p>
            <p>太阳比月球大<span class="highlight">400倍</span>，但太阳也比月球<span class="highlight">远400倍</span>，所以从地球上看，它们几乎<span class="highlight">一样大</span>！这真是太神奇了！</p>
            <p>日全食时，天空会突然变黑，能看到太阳周围美丽的<span class="highlight">日冕</span>——那是太阳的大气层在发光！</p>
            <div class="fun-fact">
                <div class="fun-fact-title">✨ 智天，你知道吗？</div>
                <p>日全食时还会出现<span class="highlight">钻石环</span>效应！月球边缘凹凸不平的山谷让最后一丝阳光钻出来，就像钻石一样闪闪发光，只会持续几秒钟！</p>
            </div>
            <div class="fun-fact">
                <div class="fun-fact-title">🔭 日食四个阶段</div>
                <p>
                <span class="highlight">第一接触</span> → 月球刚碰到太阳边缘<br>
                <span class="highlight">偏食阶段</span> → 月球越来越多地盖住太阳<br>
                <span class="highlight">日全食</span> → 太阳完全被遮住，日冕出现<br>
                <span class="highlight">第四接触</span> → 月球离开太阳，日食结束
                </p>
            </div>
        `
    }
};

// ============ 初始化 ============
function init() {
    clock = new THREE.Clock();
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000005);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 30, 50);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 15;
    controls.maxDistance = 200;

    createStarfield();
    createSun();
    createEarth();
    createMoon();
    createEarthOrbit();
    createAxisIndicator();
    addLights();
    createStructureModel();
    createEclipseScene();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onStructureClick);
    setupControls();

    // 纹理加载完成后隐藏 loading（使用 LoadingManager 检测）
    const checkLoaded = setInterval(() => {
        if (earth && earth.material && earth.material.uniforms &&
            earth.material.uniforms.dayTexture.value.image) {
            clearInterval(checkLoaded);
            document.getElementById('loadingScreen').classList.add('hidden');
        }
    }, 100);
    // 超时兜底：5 秒后强制隐藏
    setTimeout(() => {
        clearInterval(checkLoaded);
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 5000);

    animate();
}

// ============ 创建星空背景 ============
function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 10000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        const radius = 800 + Math.random() * 500;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, transparent: true, opacity: 0.8 });
    starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
}

// ============ 创建太阳 ============
function createSun() {
    const sunGeometry = new THREE.SphereGeometry(SUN_RADIUS, 64, 64);
    const sunMaterial = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
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
            void main() {
                vec3 color1 = vec3(1.0, 0.95, 0.5);
                vec3 color2 = vec3(1.0, 0.6, 0.1);
                float noise = sin(vUv.x * 20.0 + time) * sin(vUv.y * 20.0 + time) * 0.1;
                vec3 color = mix(color1, color2, noise + 0.5);
                float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                color += vec3(1.0, 0.5, 0.1) * fresnel * 0.3;
                gl_FragColor = vec4(color, 1.0);
            }
        `
    });

    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(0, 0, 0);
    scene.add(sun);

    const glowGeometry = new THREE.SphereGeometry(SUN_RADIUS * 1.3, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
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
                vec3 color = vec3(1.0, 0.6, 0.1) * intensity;
                gl_FragColor = vec4(color, intensity * 0.5);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });

    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    sun.add(glow);
}

// ============ 云层球体引用 ============
let cloudMesh;

// ============ 创建地球 - 纹理贴图版 ============
function createEarth() {
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 128, 128);

    // 纹理加载
    const textureLoader = new THREE.TextureLoader();
    const earthDayMap = textureLoader.load('textures/earth_daymap.jpg');
    const earthNightMap = textureLoader.load('textures/earth_nightmap.jpg');
    const earthSpecularMap = textureLoader.load('textures/earth_specular.jpg');
    const earthNormalMap = textureLoader.load('textures/earth_normal.jpg');
    const earthCloudsMap = textureLoader.load('textures/earth_clouds.jpg');

    const earthMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            sunDirection: { value: new THREE.Vector3(-1, 0, 0) },
            dayTexture: { value: earthDayMap },
            nightTexture: { value: earthNightMap },
            specularTexture: { value: earthSpecularMap }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vWorldPosition;
            varying vec3 vWorldNormal;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
                vUv = uv;
                vPosition = position;
                vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 sunDirection;
            uniform sampler2D dayTexture;
            uniform sampler2D nightTexture;
            uniform sampler2D specularTexture;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vWorldPosition;
            varying vec3 vWorldNormal;

            // 检测中国
            float isInChina(float lon, float lat) {
                if (lon < 73.0 || lon > 135.0 || lat < 18.0 || lat > 54.0) return 0.0;
                float china = 0.0;

                // 东北
                if (lat > 40.0 && lat < 54.0 && lon > 119.0 && lon < 135.0) {
                    if (lat > 43.0 && lon > 121.0 && lon < 135.0) {
                        float headTop = 53.5 - (lon - 123.0) * 0.3;
                        if (lat < headTop) china = 1.0;
                    }
                    if (lat > 40.0 && lat < 46.0 && lon > 119.0 && lon < 131.0) china = 1.0;
                }
                // 华北
                if (lat > 36.0 && lat < 43.0 && lon > 110.0 && lon < 120.0) china = 1.0;
                // 内蒙古
                if (lat > 37.0 && lat < 50.0 && lon > 97.0 && lon < 126.0) {
                    float backTop = min(42.0 + (lon - 97.0) * 0.25, 49.0);
                    float backBottom = 37.0 + (lon - 97.0) * 0.1;
                    if (lat < backTop && lat > backBottom) china = 1.0;
                }
                // 山东
                if (lat > 34.0 && lat < 38.5 && lon > 114.0 && lon < 123.0) {
                    china = 1.0;
                    float bohaiDist = length(vec2(lon - 119.0, lat - 38.5));
                    if (bohaiDist < 2.5 && lat > 37.0) china = 0.0;
                }
                // 华东华中
                if (lat > 24.0 && lat < 36.0 && lon > 108.0 && lon < 123.0) {
                    float eastCoast = 122.5 - (36.0 - lat) * 0.2;
                    if (lon < eastCoast) china = 1.0;
                }
                // 福建广东
                if (lat > 21.0 && lat < 29.0 && lon > 109.0 && lon < 120.5) {
                    float seCoast = 120.0 - (26.0 - lat) * 0.4;
                    if (lon < seCoast || lat > 26.0) china = 1.0;
                }
                // 西南
                if (lat > 21.0 && lat < 30.0 && lon > 97.0 && lon < 112.0) {
                    float legSouth = 21.5;
                    if (lon < 106.0) legSouth = 21.0 + (106.0 - lon) * 0.15;
                    if (lat > legSouth) china = 1.0;
                    if (lon > 106.0 && lon < 110.0 && lat < 22.0) china = 0.0;
                }
                // 海南
                if (lon > 108.5 && lon < 111.5 && lat > 18.0 && lat < 20.5) {
                    if (length(vec2(lon - 110.0, lat - 19.2)) < 1.5) china = 0.9;
                }
                // 新疆
                if (lat > 34.5 && lat < 49.5 && lon > 73.0 && lon < 97.0) {
                    float xjNorth = 49.0, xjSouth = 35.0;
                    if (lon < 80.0) {
                        xjNorth = 44.0 - (80.0 - lon) * 0.8;
                        xjSouth = 37.0 + (80.0 - lon) * 0.4;
                    }
                    if (lat < xjNorth && lat > xjSouth) china = 1.0;
                }
                // 西藏
                if (lat > 26.5 && lat < 37.0 && lon > 78.0 && lon < 100.0) {
                    float tibetSouth = 27.5 + (lon - 78.0) * 0.05;
                    if (lat > tibetSouth) china = 1.0;
                }
                // 青海甘肃
                if (lat > 32.0 && lat < 43.0 && lon > 89.0 && lon < 108.0) china = 1.0;
                // 四川
                if (lat > 26.0 && lat < 34.0 && lon > 97.0 && lon < 111.0) china = 1.0;
                // 台湾
                if (lon > 119.5 && lon < 122.5 && lat > 21.5 && lat < 25.5) {
                    if (length(vec2((lon - 121.0) * 0.7, lat - 23.5)) < 2.2) china = 0.9;
                }
                return china;
            }

            // 检测美国本土
            float isInUSA(float lon, float lat) {
                if (lon < -130.0 || lon > -65.0 || lat < 24.0 || lat > 50.0) return 0.0;
                float usa = 0.0;

                // 美国本土主体
                if (lon > -125.0 && lon < -67.0 && lat > 25.0 && lat < 49.0) {
                    usa = 1.0;
                    // 五大湖区域挖空
                    if (lon > -93.0 && lon < -76.0 && lat > 41.0 && lat < 49.0) {
                        float lakeDist = length(vec2(lon + 84.0, lat - 45.0));
                        if (lakeDist < 4.0) usa = 0.0;
                    }
                    // 西北角修正
                    if (lon < -120.0 && lat > 46.0) {
                        float corner = 49.0 - (lon + 125.0) * 0.5;
                        if (lat > corner) usa = 0.0;
                    }
                    // 佛罗里达半岛
                    if (lon > -88.0 && lon < -80.0 && lat > 24.5 && lat < 31.0) usa = 1.0;
                    // 墨西哥湾沿岸
                    if (lat < 30.0 && lon > -98.0 && lon < -88.0) {
                        float gulfCurve = 29.0 + (lon + 93.0) * 0.1;
                        if (lat < gulfCurve) usa = 0.0;
                    }
                }
                // 阿拉斯加
                if (lon > -170.0 && lon < -130.0 && lat > 54.0 && lat < 72.0) {
                    usa = 0.8;
                }
                return usa;
            }

            void main() {
                vec2 uv = vUv;

                float lon = uv.x * 360.0 - 180.0;
                float lat = (uv.y - 0.5) * 180.0;

                // 从纹理采样
                vec3 dayColor = texture2D(dayTexture, uv).rgb;
                vec3 nightColor = texture2D(nightTexture, uv).rgb;
                float specular = texture2D(specularTexture, uv).r;

                float inChina = isInChina(lon, lat);
                float inUSA = isInUSA(lon, lat);

                // ===== 中国边界 - 金色高亮 =====
                float chinaBorder = 0.0;
                if (inChina > 0.3) {
                    float dx = 0.0025;
                    float chinaL = isInChina((uv.x - dx) * 360.0 - 180.0, lat);
                    float chinaR = isInChina((uv.x + dx) * 360.0 - 180.0, lat);
                    float chinaU = isInChina(lon, ((uv.y + dx) - 0.5) * 180.0);
                    float chinaD = isInChina(lon, ((uv.y - dx) - 0.5) * 180.0);
                    float gradient = abs(chinaL - chinaR) + abs(chinaU - chinaD);
                    chinaBorder = smoothstep(0.2, 0.8, gradient);
                }

                // ===== 美国边界 - 蓝色高亮 =====
                float usaBorder = 0.0;
                if (inUSA > 0.3) {
                    float dx = 0.003;
                    float usaL = isInUSA((uv.x - dx) * 360.0 - 180.0, lat);
                    float usaR = isInUSA((uv.x + dx) * 360.0 - 180.0, lat);
                    float usaU = isInUSA(lon, ((uv.y + dx) - 0.5) * 180.0);
                    float usaD = isInUSA(lon, ((uv.y - dx) - 0.5) * 180.0);
                    float gradient = abs(usaL - usaR) + abs(usaU - usaD);
                    usaBorder = smoothstep(0.2, 0.8, gradient);
                }

                // 叠加边界颜色到白天纹理
                vec3 chinaBorderColor = vec3(1.0, 0.85, 0.1);
                vec3 usaBorderColor = vec3(0.2, 0.6, 1.0);
                dayColor = mix(dayColor, chinaBorderColor, chinaBorder * 0.85);
                dayColor = mix(dayColor, usaBorderColor, usaBorder * 0.85);

                // ===== 大气边缘 =====
                float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 3.5);
                vec3 atmosphere = vec3(0.35, 0.65, 1.0);
                dayColor = mix(dayColor, atmosphere, fresnel * 0.35);

                // 海洋高光（specular 贴图白色 = 海洋）
                float sunReflect = max(dot(reflect(-normalize(sunDirection), vWorldNormal), normalize(-vWorldPosition)), 0.0);
                float specHighlight = pow(sunReflect, 20.0) * specular * 0.5;
                dayColor += vec3(1.0) * specHighlight;

                // ===== 昼夜光照 =====
                float daylight = dot(vWorldNormal, normalize(sunDirection));
                float daySide = smoothstep(-0.12, 0.18, daylight);

                // 增亮白天
                vec3 litDay = dayColor * 1.15;

                // 夜晚 - 从夜景纹理采样城市灯光
                vec3 nightBase = dayColor * 0.06;

                // 增强中国和美国区域的城市灯光
                float chinaBoost = 1.0 + inChina * 1.2;
                float usaBoost = 1.0 + inUSA * 1.2;
                float regionBoost = max(chinaBoost, usaBoost);
                nightColor = nightColor * regionBoost;

                // 将城市灯光叠加到夜晚底色上
                vec3 nightFinal = nightBase + nightColor * 1.5;

                // 夜间边界发光
                nightFinal += chinaBorderColor * chinaBorder * 0.5;
                nightFinal += usaBorderColor * usaBorder * 0.5;

                // 晨昏线
                float twilight = smoothstep(-0.12, 0.0, daylight) * smoothstep(0.12, 0.0, daylight);
                vec3 twilightColor = mix(nightFinal, vec3(1.0, 0.45, 0.15), twilight * 0.35);

                vec3 finalColor = mix(nightFinal, litDay, daySide);
                finalColor = mix(finalColor, twilightColor, twilight);

                // 夜间大气微光
                float nightFresnel = fresnel * (1.0 - daySide) * 0.15;
                finalColor += atmosphere * nightFresnel;

                gl_FragColor = vec4(finalColor, 1.0);
            }
        `
    });

    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.rotation.z = EARTH_TILT;
    earth.position.set(EARTH_ORBIT_RADIUS, 0, 0);
    scene.add(earth);

    // 云层 - 独立球体，可独立旋转
    const cloudGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.02, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
        map: earthCloudsMap,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    earth.add(cloudMesh);

    // 大气层
    const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.1, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
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
                float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                vec3 color = vec3(0.3, 0.6, 1.0);
                gl_FragColor = vec4(color, intensity * 0.45);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earth.add(atmosphere);
}

// ============ 创建月球 ============
function createMoon() {
    const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 64, 64);
    const moonMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.9,
        metalness: 0.1
    });
    moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(MOON_ORBIT_RADIUS, 0, 0);
    earth.add(moon);

    const moonOrbitGeometry = new THREE.RingGeometry(MOON_ORBIT_RADIUS - 0.1, MOON_ORBIT_RADIUS + 0.1, 64);
    const moonOrbitMaterial = new THREE.MeshBasicMaterial({
        color: 0x444466,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide
    });
    const moonOrbit = new THREE.Mesh(moonOrbitGeometry, moonOrbitMaterial);
    moonOrbit.rotation.x = Math.PI / 2;
    earth.add(moonOrbit);
}

// ============ 创建地球轨道 ============
function createEarthOrbit() {
    // 创建椭圆轨道
    const curve = new THREE.EllipseCurve(
        0, 0,                              // 中心点
        EARTH_ORBIT_RADIUS,                // x半径（半长轴）
        EARTH_ORBIT_RADIUS_B,              // y半径（半短轴）
        0, 2 * Math.PI,                    // 起始和结束角度
        false,                             // 顺时针
        0                                  // 旋转
    );
    const points = curve.getPoints(128);
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.4
    });
    earthOrbit = new THREE.Line(orbitGeometry, orbitMaterial);
    earthOrbit.rotation.x = Math.PI / 2;
    scene.add(earthOrbit);

    // 四季位置（使用椭圆坐标）- 只显示夏至、秋分、冬至
    const seasonPositions = [
        { angle: Math.PI / 2, label: '夏至（远日点）', icon: '☀️', month: '6月21日', color: 0xFFD700 },
        { angle: Math.PI, label: '秋分', icon: '🍂', month: '9月23日', color: 0xDEB887 },
        { angle: Math.PI * 1.5, label: '冬至（近日点）', icon: '❄️', month: '12月22日', color: 0x87CEEB }
    ];

    seasonPositions.forEach(pos => {
        const markerGeometry = new THREE.SphereGeometry(1.5, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: pos.color });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        // 使用椭圆坐标
        marker.position.x = Math.cos(pos.angle) * EARTH_ORBIT_RADIUS;
        marker.position.z = Math.sin(pos.angle) * EARTH_ORBIT_RADIUS_B;
        scene.add(marker);
        seasonMarkers.push(marker);

        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.roundRect(0, 0, 320, 128, 15);
        ctx.fill();
        ctx.strokeStyle = `#${pos.color.toString(16).padStart(6, '0')}`;
        ctx.lineWidth = 3;
        ctx.roundRect(0, 0, 320, 128, 15);
        ctx.stroke();
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(pos.icon, 160, 45);
        ctx.font = 'bold 24px "Noto Sans SC", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(pos.label, 160, 80);
        ctx.font = '16px "Noto Sans SC", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(pos.month, 160, 108);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.x = Math.cos(pos.angle) * (EARTH_ORBIT_RADIUS + 12);
        sprite.position.z = Math.sin(pos.angle) * (EARTH_ORBIT_RADIUS_B + 12);
        sprite.position.y = 8;
        sprite.scale.set(24, 10, 1);
        scene.add(sprite);
        seasonMarkers.push(sprite);
    });
}

// ============ 创建地轴指示器 ============
function createAxisIndicator() {
    const axisLength = EARTH_RADIUS * 2.5;
    const axisGeometry = new THREE.CylinderGeometry(0.1, 0.1, axisLength, 8);
    const axisMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 });
    axisLine = new THREE.Mesh(axisGeometry, axisMaterial);
    earth.add(axisLine);

    const northGeometry = new THREE.ConeGeometry(0.4, 1, 8);
    const northMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 });
    const northMarker = new THREE.Mesh(northGeometry, northMaterial);
    northMarker.position.y = axisLength / 2 + 0.5;
    axisLine.add(northMarker);
}

// ============ 地球内部结构模型 ============
let structureGroup = null;       // 内部结构模型组
let structureLabels = [];        // 标签 Sprite 数组
let structureLayers = [];        // 各层 Mesh，用于点击检测
let highlightedLayer = null;     // 当前高亮的层
let structureRaycaster = new THREE.Raycaster();
let structureMouse = new THREE.Vector2();
let structureLights = [];        // 内部结构专用光源

// 各层数据定义
const STRUCTURE_LAYERS = [
    {
        name: '内核',
        nameEn: 'Inner Core',
        desc: '固态铁镍',
        depth: '5100~6371km',
        temp: '约5000~6000°C',
        pressure: '约360万个大气压',
        radiusRatio: 0.19,   // 内核半径 / 地球半径 ≈ 1221/6371
        color: 0xffcc00,
        emissive: 0xaa8800,
        detail: '内核是地球最中心的部分，温度高达<span class="highlight">6000°C</span>（比太阳表面还热！），但因为压力达到<span class="highlight">360万个大气压</span>，铁和镍被压成了<span class="highlight">固态</span>。内核的直径约2442公里，和月球差不多大！'
    },
    {
        name: '外核',
        nameEn: 'Outer Core',
        desc: '液态铁（流动）',
        depth: '2900~5100km',
        temp: '约4000~5000°C',
        pressure: '约135~330万个大气压',
        boundaryAbove: '古登堡面',
        boundaryAboveDepth: '2900km',
        radiusRatio: 0.545,  // 外核外径 / 地球半径 ≈ 3480/6371
        color: 0xff8800,
        emissive: 0x993300,
        detail: '外核是<span class="highlight">液态</span>的铁和镍，厚度约2200公里。液态铁的流动产生了地球的<span class="highlight">磁场</span>，就像一个巨大的磁铁！磁场形成了<span class="highlight">磁层</span>，保护地球上的生命免受太阳风和宇宙射线的伤害。科学家通过<span class="highlight">地震波</span>中的S波（横波）无法穿过外核，才发现这里是液态的！'
    },
    {
        name: '下地幔',
        nameEn: 'Lower Mantle',
        desc: '硅酸盐岩石（缓慢流动）',
        depth: '670~2900km',
        temp: '约1000~3700°C',
        pressure: '约24~135万个大气压',
        radiusRatio: 0.895,  // 下地幔外径 / 地球半径 ≈ 5701/6371
        color: 0xcc3300,
        emissive: 0x661100,
        detail: '下地幔是地球最厚的一层（约2230公里），由高温高压的硅酸盐岩石组成。虽然是固态，但在几百万年的时间尺度上会像糖浆一样<span class="highlight">缓慢流动</span>，这叫做<span class="highlight">地幔对流</span>。地幔对流是驱动<span class="highlight">板块运动</span>的"发动机"！'
    },
    {
        name: '上地幔',
        nameEn: 'Upper Mantle',
        desc: '橄榄岩（部分熔融）',
        depth: '35~670km',
        temp: '约500~900°C',
        pressure: '约1~24万个大气压',
        boundaryAbove: '莫霍面',
        boundaryAboveDepth: '约35km（大陆）/ 约7km（海洋）',
        radiusRatio: 0.99,   // 上地幔外径 / 地球半径 ≈ 6336/6371
        color: 0xe65500,
        emissive: 0x882200,
        detail: '上地幔上部（约100~350km）有一层<span class="highlight">软流层</span>（也叫低速层），这里的岩石部分熔融，像黏稠的麦芽糖。地壳和上地幔顶部合称<span class="highlight">岩石圈</span>，岩石圈被分成好多块<span class="highlight">板块</span>，它们"漂浮"在软流层上缓慢移动——这就是<span class="highlight">板块构造</span>！板块之间的碰撞和挤压导致了地震和火山。'
    },
    {
        name: '地壳',
        nameEn: 'Crust',
        desc: '岩石（花岗岩/玄武岩）',
        depth: '0~35km',
        temp: '约-20~400°C',
        pressure: '地表1个大气压',
        radiusRatio: 1.0,
        color: 0x8B7355,
        emissive: 0x443322,
        detail: '地壳是地球最薄的外壳，也是我们生活的地方！<span class="highlight">大陆地壳</span>较厚（30~70km），主要是花岗岩；<span class="highlight">海洋地壳</span>较薄（5~10km），主要是玄武岩。人类挖过的最深的洞是苏联的<span class="highlight">科拉超深钻孔</span>，深12.2公里，仅穿透了大陆地壳的约1/3！再往下就太热了，钻头都会熔化。'
    }
];

// 分界面数据（在剖面图上标注的重要界面）
const BOUNDARIES = [
    {
        name: '莫霍面',
        nameEn: 'Moho',
        desc: '地壳与地幔的分界面',
        depth: '约5~70km',
        discoverer: '莫霍洛维奇（1909年）',
        radiusRatio: 0.99,  // 上地幔与地壳的交界
        color: 0x00ffcc,
        detail: '<span class="highlight">莫霍面</span>是地壳和地幔之间的分界面，1909年由克罗地亚科学家<span class="highlight">莫霍洛维奇</span>通过研究地震波发现。在莫霍面处，地震波的传播速度会突然加快，说明下面的岩石密度更大。'
    },
    {
        name: '古登堡面',
        nameEn: 'Gutenberg',
        desc: '地幔与外核的分界面',
        depth: '约2900km',
        discoverer: '古登堡（1914年）',
        radiusRatio: 0.545, // 外核与下地幔的交界
        color: 0xff44ff,
        detail: '<span class="highlight">古登堡面</span>是地幔和外核之间的分界面，1914年由美国科学家<span class="highlight">古登堡</span>发现。在这里，地震横波（S波）突然消失了！因为S波不能在液体中传播，这证明了外核是<span class="highlight">液态</span>的。'
    }
];

function createStructureModel() {
    structureGroup = new THREE.Group();
    structureLabels = [];
    structureLayers = [];

    const baseRadius = EARTH_RADIUS;

    // 从内到外创建各层
    for (let i = 0; i < STRUCTURE_LAYERS.length; i++) {
        const layer = STRUCTURE_LAYERS[i];
        const outerR = baseRadius * layer.radiusRatio;
        const innerR = i > 0 ? baseRadius * STRUCTURE_LAYERS[i - 1].radiusRatio : 0;

        // ---- 后半球壳（只渲染外表面，不影响剖面视觉） ----
        // phiStart=PI/2 到 phiLength=PI：只生成 z<0 的后半球
        const halfGeo = new THREE.SphereGeometry(outerR, 64, 64,
            Math.PI / 2, Math.PI);
        const halfMat = new THREE.MeshPhongMaterial({
            color: layer.color,
            emissive: layer.emissive,
            emissiveIntensity: 0.4,
            shininess: 30,
            transparent: true,
            opacity: 0.6,
            side: THREE.FrontSide
        });
        const halfMesh = new THREE.Mesh(halfGeo, halfMat);
        halfMesh.userData = { layerIndex: i, layerName: layer.name };
        halfMesh.renderOrder = 0;
        structureGroup.add(halfMesh);
        structureLayers.push(halfMesh);

        // ---- 剖面圆环（主要可视元素） ----
        if (outerR > 0) {
            const ringGeo = new THREE.RingGeometry(innerR, outerR, 64);
            const ringMat = new THREE.MeshBasicMaterial({
                color: layer.color,
                side: THREE.DoubleSide
            });
            const ringMesh = new THREE.Mesh(ringGeo, ringMat);
            ringMesh.position.z = 0.01;
            ringMesh.renderOrder = 10 + i;
            ringMesh.userData = { layerIndex: i, layerName: layer.name };
            structureGroup.add(ringMesh);
            structureLayers.push(ringMesh);

            // 层间分界线（深色细环，增强层边界辨识度）
            if (i > 0) {
                const borderGeo = new THREE.RingGeometry(innerR - 0.02, innerR + 0.05, 64);
                const borderMat = new THREE.MeshBasicMaterial({
                    color: 0x111111,
                    side: THREE.DoubleSide
                });
                const borderMesh = new THREE.Mesh(borderGeo, borderMat);
                borderMesh.position.z = 0.02;
                borderMesh.renderOrder = 20 + i;
                structureGroup.add(borderMesh);
            }
        }
    }

    // 创建标签
    createStructureLabels(baseRadius);

    // 创建分界面标注（莫霍面、古登堡面）
    createBoundaryLabels(baseRadius);

    // 内部结构专用光源（太阳被隐藏后需要独立照明）
    const frontLight = new THREE.DirectionalLight(0xffffff, 1.2);
    frontLight.position.set(10, 10, 15);
    structureGroup.add(frontLight);
    structureLights.push(frontLight);

    const backLight = new THREE.DirectionalLight(0x8888ff, 0.5);
    backLight.position.set(-10, -5, -10);
    structureGroup.add(backLight);
    structureLights.push(backLight);

    const structureAmbient = new THREE.AmbientLight(0x444444, 0.8);
    structureGroup.add(structureAmbient);
    structureLights.push(structureAmbient);

    // 内部结构模型放在地球位置，初始隐藏
    structureGroup.visible = false;
    scene.add(structureGroup);
}

function createStructureLabels(baseRadius) {
    // 清除旧标签
    structureLabels.forEach(s => structureGroup.remove(s));
    structureLabels = [];

    // 标签沿上方扇形分布，从内核（中心）到地壳（外缘）
    const angleStart = 120 * Math.PI / 180;  // 左上
    const angleEnd = 40 * Math.PI / 180;     // 右上
    const totalLayers = STRUCTURE_LAYERS.length;

    for (let i = 0; i < totalLayers; i++) {
        const layer = STRUCTURE_LAYERS[i];
        const outerR = baseRadius * layer.radiusRatio;
        const innerR = i > 0 ? baseRadius * STRUCTURE_LAYERS[i - 1].radiusRatio : 0;
        const midR = (outerR + innerR) / 2;

        // 层中心锚点：沿该角度方向的 midR 位置
        const layerAngle = angleStart + (angleEnd - angleStart) * (i / (totalLayers - 1));
        const anchorX = midR * Math.cos(layerAngle);
        const anchorY = midR * Math.sin(layerAngle);

        // Canvas 绘制大字标签
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.roundRect(10, 10, 492, 180, 15);
        ctx.fill();
        ctx.strokeStyle = `#${layer.color.toString(16).padStart(6, '0')}`;
        ctx.lineWidth = 3;
        ctx.roundRect(10, 10, 492, 180, 15);
        ctx.stroke();

        // 大字名称
        ctx.font = 'bold 64px "Noto Sans SC", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(layer.name, 256, 70);

        // 说明文字
        ctx.font = '28px "Noto Sans SC", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(layer.desc, 256, 135);

        // 深度文字
        ctx.font = '22px "Noto Sans SC", sans-serif';
        ctx.fillStyle = `#${layer.color.toString(16).padStart(6, '0')}`;
        ctx.fillText(layer.depth, 256, 170);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false
        });
        const sprite = new THREE.Sprite(spriteMat);

        // 标签位置：沿辐射方向延伸到球体外侧上方
        const labelDist = baseRadius * 1.3 + i * 0.8;
        const labelX = labelDist * Math.cos(layerAngle);
        const labelY = labelDist * Math.sin(layerAngle);
        sprite.position.set(labelX, labelY, 0.5);
        sprite.scale.set(4, 1.6, 1);
        structureGroup.add(sprite);
        structureLabels.push(sprite);

        // 引导线：从层中心指向标签
        const linePoints = [
            new THREE.Vector3(anchorX, anchorY, 0),
            new THREE.Vector3(labelX - Math.cos(layerAngle) * 2.2, labelY - Math.sin(layerAngle) * 0.8, 0)
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
        const lineMat = new THREE.LineBasicMaterial({
            color: layer.color,
            transparent: true,
            opacity: 0.7
        });
        const line = new THREE.Line(lineGeo, lineMat);
        structureGroup.add(line);
        structureLabels.push(line);
    }
}

// 创建分界面标注（莫霍面、古登堡面）
function createBoundaryLabels(baseRadius) {
    BOUNDARIES.forEach((boundary, idx) => {
        const r = baseRadius * boundary.radiusRatio;

        // 在剖面上画虚线圆弧表示分界面
        const arcPoints = [];
        // 只画后半球（未被裁剪的部分）的弧线，从 -PI/2 到 PI/2（Y轴方向弧）
        const segments = 64;
        for (let j = 0; j <= segments; j++) {
            const angle = -Math.PI / 2 + (Math.PI * j / segments);
            arcPoints.push(new THREE.Vector3(
                r * Math.cos(angle),
                r * Math.sin(angle),
                0
            ));
        }
        const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
        const arcMat = new THREE.LineDashedMaterial({
            color: boundary.color,
            dashSize: 0.3,
            gapSize: 0.15,
            transparent: true,
            opacity: 0.8
        });
        const arcLine = new THREE.Line(arcGeo, arcMat);
        arcLine.computeLineDistances(); // 虚线需要调用此方法
        structureGroup.add(arcLine);
        structureLabels.push(arcLine);

        // 分界面名称标签
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.roundRect(5, 5, 390, 110, 10);
        ctx.fill();
        ctx.strokeStyle = `#${boundary.color.toString(16).padStart(6, '0')}`;
        ctx.lineWidth = 2;
        ctx.strokeStyle = `#${boundary.color.toString(16).padStart(6, '0')}`;
        ctx.setLineDash([8, 4]);
        ctx.roundRect(5, 5, 390, 110, 10);
        ctx.stroke();
        ctx.setLineDash([]);

        // 分界面名称（大字）
        ctx.font = 'bold 44px "Noto Sans SC", sans-serif';
        ctx.fillStyle = `#${boundary.color.toString(16).padStart(6, '0')}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(boundary.name, 200, 42);

        // 说明文字
        ctx.font = '24px "Noto Sans SC", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(boundary.desc, 200, 80);

        // 深度
        ctx.font = '18px "Noto Sans SC", sans-serif';
        ctx.fillStyle = `#${boundary.color.toString(16).padStart(6, '0')}`;
        ctx.fillText(`深度 ${boundary.depth}`, 200, 105);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false
        });
        const sprite = new THREE.Sprite(spriteMat);

        // 莫霍面标签放在左上，古登堡面标签放在左下
        const labelX = -(baseRadius * 1.1 + idx * 2.0);
        const labelY = (idx === 0) ? baseRadius * 0.8 : -(baseRadius * 0.5);
        sprite.position.set(labelX, labelY, 0.5);
        sprite.scale.set(4, 1.2, 1);
        structureGroup.add(sprite);
        structureLabels.push(sprite);

        // 引导线：从分界面弧线上一点指向标签
        const lineStartAngle = (idx === 0) ? Math.PI * 0.3 : -Math.PI * 0.2;
        const lineStartX = r * Math.cos(lineStartAngle);
        const lineStartY = r * Math.sin(lineStartAngle);
        const linePoints = [
            new THREE.Vector3(lineStartX, lineStartY, 0),
            new THREE.Vector3(labelX + 2, labelY, 0)
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
        const lineMat = new THREE.LineDashedMaterial({
            color: boundary.color,
            dashSize: 0.2,
            gapSize: 0.1,
            transparent: true,
            opacity: 0.6
        });
        const guideLine = new THREE.Line(lineGeo, lineMat);
        guideLine.computeLineDistances();
        structureGroup.add(guideLine);
        structureLabels.push(guideLine);
    });
}

// ============ 创建日食场景 ============
function createEclipseScene() {
    eclipseGroup = new THREE.Group();
    eclipseGroup.visible = false;
    scene.add(eclipseGroup);

    const textureLoader = new THREE.TextureLoader();

    // ---- 1. 天空背景平面 ----
    const skyGeo = new THREE.PlaneGeometry(200, 120);
    const skyMat = new THREE.ShaderMaterial({
        uniforms: {
            skyDarkness: { value: 0.0 },
            time: { value: 0.0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float skyDarkness;
            uniform float time;
            varying vec2 vUv;
            void main() {
                // 白天蓝色天空（上深下浅）
                vec3 dayTop = vec3(0.05, 0.15, 0.55);
                vec3 dayBottom = vec3(0.35, 0.6, 0.95);
                vec3 dayBlue = mix(dayBottom, dayTop, vUv.y);
                // 全食时的黑暗天空
                vec3 nightBlack = vec3(0.0, 0.0, 0.02);
                // 地平线微光（偏食阶段）
                float horizonGlow = smoothstep(0.25, 0.0, vUv.y) * (1.0 - skyDarkness) * 0.3;
                vec3 horizonColor = vec3(0.95, 0.45, 0.1);
                vec3 skyColor = mix(dayBlue, nightBlack, skyDarkness);
                skyColor = mix(skyColor, horizonColor, horizonGlow * skyDarkness * 2.0);
                gl_FragColor = vec4(skyColor, 1.0);
            }
        `
    });
    ecl_skyPlane = new THREE.Mesh(skyGeo, skyMat);
    ecl_skyPlane.position.z = -2;
    ecl_skyPlane.renderOrder = 0;
    eclipseGroup.add(ecl_skyPlane);

    // ---- 2. 日食星空（天空变暗时出现） ----
    const starCount = 300;
    const starPos = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
        starPos[i * 3] = (Math.random() - 0.5) * 180;
        starPos[i * 3 + 1] = (Math.random() - 0.5) * 100;
        starPos[i * 3 + 2] = -1;
        starSizes[i] = 0.5 + Math.random() * 2.0;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    // 圆形星星纹理
    const starCanvas = document.createElement('canvas');
    starCanvas.width = 32;
    starCanvas.height = 32;
    const starCtx = starCanvas.getContext('2d');
    const gradient = starCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    starCtx.fillStyle = gradient;
    starCtx.fillRect(0, 0, 32, 32);
    const starTexture = new THREE.CanvasTexture(starCanvas);
    const starMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.5,
        map: starTexture,
        transparent: true,
        opacity: 0,
        sizeAttenuation: true,
        depthWrite: false
    });
    ecl_eclipseStars = new THREE.Points(starGeo, starMat);
    ecl_eclipseStars.renderOrder = 1;
    ecl_eclipseStars.visible = false;
    eclipseGroup.add(ecl_eclipseStars);

    // ---- 3. 太阳外发光（始终可见的柔和光晕） ----
    const outerGlowGeo = new THREE.SphereGeometry(ECLIPSE_SUN_RADIUS * 2.8, 32, 32);
    const outerGlowMat = new THREE.ShaderMaterial({
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
                intensity = max(intensity, 0.0);
                vec3 color = vec3(1.0, 0.7, 0.15) * intensity;
                gl_FragColor = vec4(color, intensity * 0.4);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false
    });
    ecl_sunGlow = new THREE.Mesh(outerGlowGeo, outerGlowMat);
    ecl_sunGlow.renderOrder = 1;
    eclipseGroup.add(ecl_sunGlow);

    // ---- 4. 太阳盘面（使用 sun.jpg 真实纹理） ----
    const sunMap = textureLoader.load('textures/sun.jpg');
    const sunGeo = new THREE.SphereGeometry(ECLIPSE_SUN_RADIUS, 64, 64);
    const sunMat = new THREE.ShaderMaterial({
        uniforms: {
            sunTexture: { value: sunMap },
            time: { value: 0 },
            coverage: { value: 0 }
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D sunTexture;
            uniform float time;
            uniform float coverage;
            varying vec2 vUv;
            varying vec3 vNormal;
            void main() {
                vec3 texColor = texture2D(sunTexture, vUv).rgb;
                texColor *= 1.4;
                float pulse = 1.0 + 0.03 * sin(time * 2.5);
                texColor *= pulse;
                // 边缘暗化（limb darkening，真实太阳效果）
                float limb = dot(vNormal, vec3(0.0, 0.0, 1.0));
                limb = 0.5 + 0.5 * pow(limb, 0.4);
                texColor *= limb;
                gl_FragColor = vec4(texColor, 1.0);
            }
        `
    });
    ecl_sunDisc = new THREE.Mesh(sunGeo, sunMat);
    ecl_sunDisc.renderOrder = 2;
    eclipseGroup.add(ecl_sunDisc);

    // ---- 5. 日冕射线（全食时可见的放射状光芒） ----
    const rayCount = 24;
    const positions = [];
    const alphas = [];
    for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
        const len = ECLIPSE_SUN_RADIUS * (1.5 + Math.random() * 3.0);
        const baseWidth = 0.2 + Math.random() * 0.25;
        const cos_a = Math.cos(angle), sin_a = Math.sin(angle);
        const perpCos = Math.cos(angle + Math.PI / 2);
        const perpSin = Math.sin(angle + Math.PI / 2);
        const innerR = ECLIPSE_SUN_RADIUS * 1.02;
        // 三角形：2 个底部顶点 + 1 个尖端
        positions.push(
            cos_a * innerR + perpCos * baseWidth, sin_a * innerR + perpSin * baseWidth, 0.1,
            cos_a * innerR - perpCos * baseWidth, sin_a * innerR - perpSin * baseWidth, 0.1,
            cos_a * (innerR + len), sin_a * (innerR + len), 0.1
        );
        alphas.push(0.9, 0.9, 0.0);
    }
    const rayGeo = new THREE.BufferGeometry();
    rayGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    rayGeo.setAttribute('aAlpha', new THREE.Float32BufferAttribute(alphas, 1));
    const rayMat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
            attribute float aAlpha;
            varying float vAlpha;
            varying vec3 vPos;
            void main() {
                vAlpha = aAlpha;
                vPos = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying float vAlpha;
            varying vec3 vPos;
            void main() {
                float dist = length(vPos.xy);
                float pulse = 0.8 + 0.2 * sin(time * 1.5 + dist * 0.3);
                // 日冕颜色：内白外蓝
                vec3 innerColor = vec3(1.0, 1.0, 0.95);
                vec3 outerColor = vec3(0.5, 0.7, 1.0);
                vec3 coronaCol = mix(innerColor, outerColor, 1.0 - vAlpha);
                gl_FragColor = vec4(coronaCol * pulse, vAlpha * 0.8);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    ecl_coronaRays = new THREE.Mesh(rayGeo, rayMat);
    ecl_coronaRays.renderOrder = 3;
    ecl_coronaRays.visible = false;
    eclipseGroup.add(ecl_coronaRays);

    // ---- 6. 日冕内光晕（柔和的内圈光环） ----
    const innerCoronaGeo = new THREE.SphereGeometry(ECLIPSE_SUN_RADIUS * 1.6, 32, 32);
    const innerCoronaMat = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            coronaStrength: { value: 0 }
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
            uniform float coronaStrength;
            varying vec3 vNormal;
            void main() {
                float intensity = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                float pulse = 0.9 + 0.1 * sin(time * 2.0);
                vec3 color = mix(vec3(1.0, 1.0, 0.95), vec3(0.5, 0.7, 1.0), intensity);
                gl_FragColor = vec4(color * pulse, intensity * coronaStrength * 0.6);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false
    });
    ecl_coronaInner = new THREE.Mesh(innerCoronaGeo, innerCoronaMat);
    ecl_coronaInner.renderOrder = 3;
    eclipseGroup.add(ecl_coronaInner);

    // ---- 7. 月球盘面（暗色剪影，使用 moon.jpg 纹理） ----
    const moonMap = textureLoader.load('textures/moon.jpg');
    const moonGeo = new THREE.SphereGeometry(ECLIPSE_MOON_RADIUS, 64, 64);
    const moonMat = new THREE.MeshBasicMaterial({
        map: moonMap,
        color: 0x111111   // 暗色调，作为剪影
    });
    ecl_moonDisc = new THREE.Mesh(moonGeo, moonMat);
    ecl_moonDisc.position.set(18, 0, 0.3);
    ecl_moonDisc.renderOrder = 4;
    eclipseGroup.add(ecl_moonDisc);

    // ---- 8. 钻石环闪光（第二/三接触时闪现） ----
    // 创建星光纹理
    const drCanvas = document.createElement('canvas');
    drCanvas.width = 128;
    drCanvas.height = 128;
    const drCtx = drCanvas.getContext('2d');
    // 径向渐变：中心白亮，向外淡出
    const drGrad = drCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    drGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    drGrad.addColorStop(0.1, 'rgba(255, 255, 240, 0.9)');
    drGrad.addColorStop(0.3, 'rgba(255, 240, 200, 0.5)');
    drGrad.addColorStop(0.6, 'rgba(200, 220, 255, 0.2)');
    drGrad.addColorStop(1, 'rgba(150, 200, 255, 0)');
    drCtx.fillStyle = drGrad;
    drCtx.fillRect(0, 0, 128, 128);
    // 十字星芒
    drCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    drCtx.lineWidth = 2;
    drCtx.beginPath();
    drCtx.moveTo(0, 64); drCtx.lineTo(128, 64);
    drCtx.moveTo(64, 0); drCtx.lineTo(64, 128);
    drCtx.moveTo(20, 20); drCtx.lineTo(108, 108);
    drCtx.moveTo(108, 20); drCtx.lineTo(20, 108);
    drCtx.stroke();
    const drTexture = new THREE.CanvasTexture(drCanvas);

    const drGeo = new THREE.BufferGeometry();
    drGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 1], 3));
    const drMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 80,
        map: drTexture,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false
    });
    ecl_diamondRing = new THREE.Points(drGeo, drMat);
    ecl_diamondRing.renderOrder = 5;
    ecl_diamondRing.visible = false;
    eclipseGroup.add(ecl_diamondRing);
}

// ============ 日食视觉参数计算 ============
function getEclipseVisualParams(p) {
    // 月球从 x=+18 移到 x=-18
    const moonX = 18 - p * 36;

    // 月球与太阳中心的距离
    const dist = Math.abs(moonX);
    const overlap = ECLIPSE_SUN_RADIUS + ECLIPSE_MOON_RADIUS - dist;

    // 太阳被遮挡比例（近似）
    let sunCoverage = 0;
    if (overlap > 0) {
        sunCoverage = Math.min(overlap / (ECLIPSE_SUN_RADIUS * 2), 1.0);
        sunCoverage = Math.pow(sunCoverage, 0.6); // 非线性，让遮挡效果更明显
    }

    // 天空变暗程度
    const totalityCenter = 0.5;
    const distFromTotality = Math.abs(p - totalityCenter);
    const skyDarkness = Math.max(0, 1.0 - distFromTotality / 0.35);
    const skyDarknessSmooth = Math.pow(skyDarkness, 1.5); // 让变暗更集中在全食附近

    // 日冕可见度（仅在全食附近）
    const totalityWidth = 0.05;
    const coronaAlpha = Math.max(0, 1.0 - distFromTotality / totalityWidth);

    // 钻石环效果（第二接触 ~0.44-0.46，第三接触 ~0.54-0.56）
    let diamondRing = 0;
    const dr2Center = 0.45, dr3Center = 0.55;
    const drWidth = 0.015;
    const dr2Dist = Math.abs(p - dr2Center);
    const dr3Dist = Math.abs(p - dr3Center);
    if (dr2Dist < drWidth) {
        diamondRing = Math.cos(dr2Dist / drWidth * Math.PI * 0.5);
    } else if (dr3Dist < drWidth) {
        diamondRing = Math.cos(dr3Dist / drWidth * Math.PI * 0.5);
    }

    // 阶段标签
    let phaseLabel = '初始';
    if (p <= 0.0) phaseLabel = '初始';
    else if (p < 0.15) phaseLabel = '第一接触';
    else if (p < 0.44) phaseLabel = '偏食（遮挡增加）';
    else if (p < 0.46) phaseLabel = '✨ 钻石环！';
    else if (p < 0.54) phaseLabel = '🌑 日全食！';
    else if (p < 0.56) phaseLabel = '✨ 钻石环！';
    else if (p < 0.85) phaseLabel = '偏食（遮挡减少）';
    else if (p < 1.0) phaseLabel = '第四接触';
    else phaseLabel = '日食结束';

    return { moonX, skyDarkness: skyDarknessSmooth, coronaAlpha, diamondRing, sunCoverage, phaseLabel };
}

// ============ 更新日食场景 ============
function updateEclipseScene(p) {
    if (!eclipseGroup || !eclipseGroup.visible) return;

    const params = getEclipseVisualParams(p);

    // 1. 月球位置
    ecl_moonDisc.position.x = params.moonX;

    // 2. 天空背景暗度
    ecl_skyPlane.material.uniforms.skyDarkness.value = params.skyDarkness;

    // 3. 太阳盘面亮度
    ecl_sunDisc.material.uniforms.coverage.value = params.sunCoverage;

    // 4. 太阳外发光随遮挡减弱
    ecl_sunGlow.material.opacity = 1.0 - params.sunCoverage * 0.7;

    // 5. 日冕可见度
    ecl_coronaRays.visible = params.coronaAlpha > 0.01;
    if (ecl_coronaRays.visible) {
        ecl_coronaRays.material.opacity = params.coronaAlpha;
    }
    ecl_coronaInner.material.uniforms.coronaStrength.value = params.coronaAlpha;

    // 6. 钻石环
    ecl_diamondRing.visible = params.diamondRing > 0.01;
    if (ecl_diamondRing.visible) {
        ecl_diamondRing.material.opacity = params.diamondRing * 0.95;
        // 钻石环位置：月球边缘面向太阳残光的一侧
        // 月球从右往左移动：全食前，太阳残光在月球左侧；全食后，在右侧
        const side = (p < 0.5) ? -1 : 1;
        ecl_diamondRing.position.set(
            params.moonX + side * ECLIPSE_MOON_RADIUS * 0.95,
            0,
            1
        );
    }

    // 7. 星星（天空暗度 > 0.6 时出现）
    const starOpacity = Math.max(0, (params.skyDarkness - 0.6) / 0.4);
    ecl_eclipseStars.visible = starOpacity > 0.01;
    ecl_eclipseStars.material.opacity = starOpacity;

    // 8. 阶段标签
    const phaseEl = document.getElementById('eclipsePhaseLabel');
    if (phaseEl) phaseEl.textContent = params.phaseLabel;

    // 9. 信息面板标题动态更新
    if (currentMode === 'eclipse') {
        document.querySelector('#infoPanel h2').innerHTML = '🌑 ' + params.phaseLabel;
    }
}

// ============ 日冕脉动动画 ============
function updateEclipseCoronaPulse(time) {
    if (ecl_coronaRays && ecl_coronaRays.material.uniforms) {
        ecl_coronaRays.material.uniforms.time.value = time;
    }
    if (ecl_coronaInner && ecl_coronaInner.material.uniforms) {
        ecl_coronaInner.material.uniforms.time.value = time;
    }
    if (ecl_sunDisc && ecl_sunDisc.material.uniforms) {
        ecl_sunDisc.material.uniforms.time.value = time;
    }
    if (ecl_skyPlane && ecl_skyPlane.material.uniforms) {
        ecl_skyPlane.material.uniforms.time.value = time;
    }
}

// 内部结构动画更新
function updateStructureAnimation(time) {
    if (!structureGroup || !structureGroup.visible) return;

    // 外核流动效果：微调 emissive 强度
    structureLayers.forEach(mesh => {
        if (mesh.userData.layerName === '外核') {
            const pulse = 0.3 + Math.sin(time * 2) * 0.15;
            mesh.material.emissiveIntensity = pulse;
        }
        if (mesh.userData.layerName === '内核') {
            const pulse = 0.3 + Math.sin(time * 1.5 + 1) * 0.1;
            mesh.material.emissiveIntensity = pulse;
        }
    });
}

// 点击检测：高亮选中层并更新信息面板
function onStructureClick(event) {
    if (currentMode !== 'structure' || !structureGroup || !structureGroup.visible) return;

    structureMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    structureMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    structureRaycaster.setFromCamera(structureMouse, camera);
    const intersects = structureRaycaster.intersectObjects(structureLayers);

    if (intersects.length > 0) {
        const hit = intersects[0].object;
        const layerIndex = hit.userData.layerIndex;
        if (layerIndex === undefined) return;

        const layer = STRUCTURE_LAYERS[layerIndex];

        // 恢复所有层的默认状态
        structureLayers.forEach(mesh => {
            const idx = mesh.userData.layerIndex;
            if (idx !== undefined) {
                mesh.material.emissiveIntensity = 0.3;
                mesh.material.opacity = 0.95;
            }
        });

        // 高亮选中层
        structureLayers.forEach(mesh => {
            if (mesh.userData.layerIndex === layerIndex) {
                mesh.material.emissiveIntensity = 0.8;
                mesh.material.opacity = 1.0;
            }
        });
        highlightedLayer = layerIndex;

        // 更新信息面板为该层的详细信息
        let boundaryHtml = '';
        if (layer.boundaryAbove) {
            boundaryHtml = `<p>上方分界面：<span class="highlight">${layer.boundaryAbove}</span>（${layer.boundaryAboveDepth}）</p>`;
        }

        document.querySelector('#infoPanel h2').innerHTML = `🌋 ${layer.name}`;
        document.getElementById('infoContent').innerHTML = `
            <p style="font-size: 1.2rem; font-weight: bold; color: #${layer.color.toString(16).padStart(6, '0')};">${layer.name}（${layer.nameEn}）</p>
            <p>📏 深度范围：<span class="highlight">${layer.depth}</span></p>
            <p>🌡️ 温度：<span class="highlight">${layer.temp}</span></p>
            <p>💪 压力：<span class="highlight">${layer.pressure}</span></p>
            <p>🪨 组成：<span class="highlight">${layer.desc}</span></p>
            ${boundaryHtml}
            <p>${layer.detail}</p>
            <div class="fun-fact">
                <div class="fun-fact-title">💡 点击其他层查看更多</div>
                <p>试试点击不同的颜色层，了解地球每一层的秘密！</p>
            </div>
        `;
    }
}

// ============ 添加光源 ============
function addLights() {
    const sunLight = new THREE.PointLight(0xffffee, 2, 500);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x222233, 0.3);
    scene.add(ambientLight);
}

// ============ 设置控制 ============
function setupControls() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            updateInfoPanel();
            updateUIForMode();
        });
    });

    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    speedSlider.addEventListener('input', () => {
        animationSpeed = parseFloat(speedSlider.value);
        speedValue.textContent = animationSpeed.toFixed(1) + 'x';
    });



    const playBtn = document.getElementById('playPauseBtn');
    if (playBtn) playBtn.addEventListener('click', togglePlayPause);

    // 日食进度滑块
    const eclipseSlider = document.getElementById('eclipseSlider');
    if (eclipseSlider) {
        eclipseSlider.addEventListener('input', () => {
            eclipseProgress = parseFloat(eclipseSlider.value) / 100;
            updateEclipseScene(eclipseProgress);
            const pv = document.getElementById('eclipseProgressValue');
            if (pv) pv.textContent = (eclipseProgress * 100).toFixed(1) + '%';
        });
    }
}

function updateInfoPanel() {
    const info = seasonInfo[currentMode];
    document.querySelector('#infoPanel h2').innerHTML = info.title;
    document.getElementById('infoContent').innerHTML = info.content;
}

function updateUIForMode() {
    const axisIndicator = document.getElementById('axisIndicator');
    axisIndicator.classList.remove('visible');

    orbitAngle = 0;
    hasCompletedOrbit = false;
    isPlaying = true;
    dayCount = 0;
    yearProgress = 0;
    updatePlayButton();

    const msgEl = document.getElementById('completionMessage');
    if (msgEl) msgEl.style.display = 'none';

    earth.position.x = EARTH_ORBIT_RADIUS;
    earth.position.z = 0;

    // 恢复 OrbitControls（日食模式会禁用）
    controls.enabled = true;

    // 根据模式显示/隐藏四季标记
    const showSeasonMarkers = (currentMode === 'revolution');
    seasonMarkers.forEach(marker => {
        marker.visible = showSeasonMarkers;
    });

    // 特殊模式标记
    const isStructure = (currentMode === 'structure');
    const isEclipse = (currentMode === 'eclipse');
    const hideMainScene = isStructure || isEclipse;

    // 主场景对象在内部结构和日食模式下隐藏
    if (earthOrbit) earthOrbit.visible = !hideMainScene;
    if (sun) sun.visible = !hideMainScene;
    if (earth) earth.visible = !hideMainScene;
    if (starField) starField.visible = !isEclipse; // 日食有自己的星空

    // 内部结构模型
    if (structureGroup) {
        structureGroup.visible = isStructure;
        if (isStructure) {
            structureGroup.position.set(0, 0, 0);
            structureGroup.rotation.set(0, 0, 0);
            highlightedLayer = null;
        }
    }

    // 日食场景
    if (eclipseGroup) {
        eclipseGroup.visible = isEclipse;
        if (isEclipse) {
            eclipseProgress = 0;
            updateEclipseScene(0);
            const slider = document.getElementById('eclipseSlider');
            if (slider) slider.value = 0;
            const pv = document.getElementById('eclipseProgressValue');
            if (pv) pv.textContent = '0%';
        }
    }

    // 日食进度面板
    const eclipsePanel = document.getElementById('eclipseProgressPanel');
    if (eclipsePanel) {
        if (isEclipse) eclipsePanel.classList.add('visible');
        else eclipsePanel.classList.remove('visible');
    }

    // 隐藏/显示时间和速度控制
    document.getElementById('timeDisplay').style.display = hideMainScene ? 'none' : '';
    document.querySelector('.speed-control').style.display = isStructure ? 'none' : '';

    // 恢复场景背景色
    scene.background = new THREE.Color(0x000005);

    switch (currentMode) {
        case 'rotation':
            camera.position.set(0, 30, 50);
            controls.target.copy(earth.position);
            break;
        case 'revolution':
            camera.position.set(0, 100, 150);
            controls.target.set(0, 0, 0);
            axisIndicator.classList.add('visible');
            break;
        case 'structure':
            camera.position.set(4, 3, 18);
            controls.target.set(0, 0, 0);
            controls.minDistance = 10;
            controls.maxDistance = 50;
            break;
        case 'eclipse':
            camera.position.set(0, 0, ECLIPSE_CAMERA_Z);
            controls.target.set(0, 0, 0);
            controls.update(); // 先更新一次让相机对准目标
            controls.enabled = false; // 然后锁定视角
            camera.lookAt(0, 0, 0); // 确保相机朝向正确
            scene.background = new THREE.Color(0x000000);
            break;
    }

    // 非 structure/eclipse 模式恢复默认距离限制
    if (currentMode !== 'structure' && currentMode !== 'eclipse') {
        controls.minDistance = 15;
        controls.maxDistance = 200;
    }
}



function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    if (currentMode !== 'structure' && currentMode !== 'eclipse') {
        if (sun.material.uniforms) sun.material.uniforms.time.value = time;

        if (earth.material.uniforms) {
            earth.material.uniforms.time.value = time;
            const sunDir = new THREE.Vector3().subVectors(sun.position, earth.position).normalize();
            earth.material.uniforms.sunDirection.value = sunDir;
        }

        // 云层独立旋转（比地球慢，模拟大气流动）
        if (cloudMesh) {
            cloudMesh.rotation.y += delta * 0.02;
        }

        const speed = delta * animationSpeed;

        if (isPlaying) {
            switch (currentMode) {
                case 'rotation':
                    earth.rotation.y += speed * 2;
                    dayCount += speed * 0.5;
                    break;
                case 'revolution':
                    orbitAngle += speed * 0.25;
                    if (orbitAngle >= Math.PI * 2 && !hasCompletedOrbit) {
                        orbitAngle = Math.PI * 2;
                        hasCompletedOrbit = true;
                        isPlaying = false;
                        updatePlayButton();
                        showCompletionMessage('🌸☀️🍂❄️ 春夏秋冬，一年四季轮回完成！');
                    }
                    // 椭圆轨道
                    earth.position.x = Math.cos(orbitAngle) * EARTH_ORBIT_RADIUS;
                    earth.position.z = Math.sin(orbitAngle) * EARTH_ORBIT_RADIUS_B;
                    earth.rotation.y += speed * 0.4;
                    yearProgress = Math.min((orbitAngle / (Math.PI * 2)) * 100, 100);
                    dayCount = yearProgress * 3.65;
                    break;
            }
        }
    }

    // 日食模式动画
    if (currentMode === 'eclipse') {
        // 日冕脉动（即使暂停也要更新）
        updateEclipseCoronaPulse(time);

        if (isPlaying) {
            eclipseProgress += delta * animationSpeed * 0.04;
            if (eclipseProgress >= 1.0) {
                eclipseProgress = 1.0;
                isPlaying = false;
                updatePlayButton();
                showCompletionMessage('🌑☀️ 日食结束！太阳重新出现！');
            }
            updateEclipseScene(eclipseProgress);
            // 同步滑块
            const slider = document.getElementById('eclipseSlider');
            if (slider) slider.value = eclipseProgress * 100;
            const pv = document.getElementById('eclipseProgressValue');
            if (pv) pv.textContent = (eclipseProgress * 100).toFixed(1) + '%';
        }
    }

    // 内部结构动画
    updateStructureAnimation(time);

    const moonAngle = time * 0.5;
    moon.position.x = Math.cos(moonAngle) * MOON_ORBIT_RADIUS;
    moon.position.z = Math.sin(moonAngle) * MOON_ORBIT_RADIUS;

    if (currentMode !== 'structure' && currentMode !== 'eclipse') {
        document.getElementById('dayCount').textContent = `第 ${Math.floor(dayCount) + 1} 天`;
        document.getElementById('yearProgress').textContent = `公转进度: ${yearProgress.toFixed(1)}%`;
    }

    if (currentMode === 'rotation') {
        controls.target.copy(earth.position);
    }

    if (currentMode !== 'eclipse') {
        controls.update();
    }
    renderer.render(scene, camera);
}

function updatePlayButton() {
    const playBtn = document.getElementById('playPauseBtn');
    if (playBtn) {
        playBtn.innerHTML = isPlaying ?
            '<span class="icon">⏸️</span><span>暂停</span>' :
            '<span class="icon">▶️</span><span>播放</span>';
    }
}

function showCompletionMessage(message) {
    let msgEl = document.getElementById('completionMessage');
    if (!msgEl) {
        msgEl = document.createElement('div');
        msgEl.id = 'completionMessage';
        msgEl.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.85); border: 2px solid #f4d03f; border-radius: 20px;
            padding: 30px 50px; color: white; font-size: 1.3rem; text-align: center; z-index: 1000;
        `;
        document.body.appendChild(msgEl);
    }
    msgEl.innerHTML = `<div style="margin-bottom: 15px;">${message}</div>
        <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7);">点击「播放」按钮再转一圈</div>`;
    msgEl.style.display = 'block';
    setTimeout(() => { msgEl.style.display = 'none'; }, 4000);
}

function togglePlayPause() {
    if (hasCompletedOrbit) {
        orbitAngle = 0;
        hasCompletedOrbit = false;
        dayCount = 0;
        yearProgress = 0;
    }
    // 日食模式：播完后重播
    if (currentMode === 'eclipse' && eclipseProgress >= 1.0) {
        eclipseProgress = 0;
        updateEclipseScene(0);
        const slider = document.getElementById('eclipseSlider');
        if (slider) slider.value = 0;
    }
    isPlaying = !isPlaying;
    updatePlayButton();
    const msgEl = document.getElementById('completionMessage');
    if (msgEl) msgEl.style.display = 'none';
}

init();
