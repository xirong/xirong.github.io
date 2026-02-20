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

    window.addEventListener('resize', onWindowResize);
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

    // 根据模式显示/隐藏四季标记（轨道始终可见）
    const showSeasonMarkers = (currentMode === 'revolution');
    seasonMarkers.forEach(marker => {
        marker.visible = showSeasonMarkers;
    });
    // 轨道始终可见
    if (earthOrbit) {
        earthOrbit.visible = true;
    }

    switch (currentMode) {
        case 'rotation':
            // 与初始视角一致
            camera.position.set(0, 30, 50);
            controls.target.copy(earth.position);
            break;
        case 'revolution':
            camera.position.set(0, 100, 150);
            controls.target.set(0, 0, 0);
            axisIndicator.classList.add('visible');
            break;
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

    const moonAngle = time * 0.5;
    moon.position.x = Math.cos(moonAngle) * MOON_ORBIT_RADIUS;
    moon.position.z = Math.sin(moonAngle) * MOON_ORBIT_RADIUS;

    document.getElementById('dayCount').textContent = `第 ${Math.floor(dayCount) + 1} 天`;
    document.getElementById('yearProgress').textContent = `公转进度: ${yearProgress.toFixed(1)}%`;

    if (currentMode === 'rotation') {
        controls.target.copy(earth.position);
    }

    controls.update();
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
    isPlaying = !isPlaying;
    updatePlayButton();
    const msgEl = document.getElementById('completionMessage');
    if (msgEl) msgEl.style.display = 'none';
}

init();
