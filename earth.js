/**
 * 地球的奥秘 - 柳智天的宇宙课堂
 * 展示地球自转、公转和四季变化
 */

// ============ 全局变量 ============
let scene, camera, renderer, controls;
let earth, sun, moon;
let earthOrbit;
let axisLine, axisArrow;
let starField;
let clock;
let currentMode = 'rotation';
let animationSpeed = 1;
let dayCount = 0;
let yearProgress = 0;
let orbitAngle = 0;
let isPlaying = true;  // 是否正在播放
let hasCompletedOrbit = false;  // 是否已完成一圈公转

// 地球参数
const EARTH_RADIUS = 5;
const EARTH_ORBIT_RADIUS = 80;
const EARTH_TILT = 23.5 * Math.PI / 180; // 地轴倾斜角度 23.5度
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
            <div class="fun-fact">
                <div class="fun-fact-title">🤔 智天，你知道吗？</div>
                <p>地球自转的速度非常快！在赤道上，地球表面的移动速度达到每小时1670公里，比飞机还快呢！</p>
            </div>
        `
    },
    revolution: {
        title: '☀️ 地球公转',
        content: `
            <p>地球不仅会自转，还会围绕<span class="highlight">太阳</span>转圈圈！</p>
            <p>地球绕太阳转一圈需要<span class="highlight">365天</span>，这就是一年的时间。</p>
            <p>地球和太阳的距离大约是<span class="highlight">1.5亿公里</span>，光从太阳到地球需要8分钟！</p>
            <div class="fun-fact">
                <div class="fun-fact-title">🚀 智天，你知道吗？</div>
                <p>地球绕太阳公转的速度是每秒30公里！如果坐火箭以这个速度飞，从北京到上海只需要40秒！</p>
            </div>
        `
    },
    seasons: {
        title: '🌸 四季变化',
        content: `
            <p>为什么会有<span class="highlight">春、夏、秋、冬</span>四个季节呢？</p>
            <p>秘密就在于地球的<span class="highlight">地轴是倾斜的</span>！倾斜角度是23.5度。</p>
            <p>当北半球朝向太阳时，阳光直射，天气变热，就是<span class="highlight">夏天</span>。</p>
            <p>当北半球远离太阳时，阳光斜射，天气变冷，就是<span class="highlight">冬天</span>。</p>
            <div class="fun-fact">
                <div class="fun-fact-title">🌍 智天，你知道吗？</div>
                <p>当我们这里是夏天的时候，澳大利亚的小朋友正在过冬天呢！因为他们在南半球。</p>
            </div>
        `
    },
    daynight: {
        title: '🌓 昼夜交替',
        content: `
            <p>为什么会有<span class="highlight">白天和黑夜</span>呢？</p>
            <p>因为地球是个<span class="highlight">大球</span>，太阳只能照亮一半！</p>
            <p>被太阳照到的一面是<span class="highlight">白天</span>，照不到的一面是<span class="highlight">黑夜</span>。</p>
            <p>地球不停地转，所以白天和黑夜会<span class="highlight">轮流出现</span>。</p>
            <div class="fun-fact">
                <div class="fun-fact-title">🌙 智天，你知道吗？</div>
                <p>当我们睡觉的时候，地球另一边的小朋友正在吃早餐呢！这就是时差。</p>
            </div>
        `
    }
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
        2000
    );
    camera.position.set(0, 30, 50);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 创建控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 15;
    controls.maxDistance = 200;

    // 创建场景内容
    createStarfield();
    createSun();
    createEarth();
    createMoon();
    createEarthOrbit();
    createAxisIndicator();
    addLights();

    // 事件监听
    window.addEventListener('resize', onWindowResize);
    setupControls();

    // 隐藏加载画面
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 1500);

    // 开始动画
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

    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.5,
        transparent: true,
        opacity: 0.8
    });

    starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
}

// ============ 创建太阳 ============
function createSun() {
    const sunGeometry = new THREE.SphereGeometry(SUN_RADIUS, 64, 64);
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

    // 太阳光晕
    const glowGeometry = new THREE.SphereGeometry(SUN_RADIUS * 1.3, 32, 32);
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

// ============ 创建地球 ============
function createEarth() {
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 128, 128);

    const earthMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            sunDirection: { value: new THREE.Vector3(-1, 0, 0) }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vWorldPosition;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vUv = uv;
                vPosition = position;
                vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 sunDirection;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vWorldPosition;
            
            // 改进的噪声函数
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
            
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);
                vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m; m = m*m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                vec3 g;
                g.x = a0.x * x0.x + h.x * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }
            
            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                for (int i = 0; i < 6; i++) {
                    value += amplitude * snoise(p);
                    p *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }
            
            void main() {
                vec2 uv = vUv;
                
                // 更真实的大陆形状 - 模拟真实地球
                float continent1 = fbm(uv * 4.0 + vec2(0.0, 0.0)); // 亚欧大陆
                float continent2 = fbm(uv * 4.0 + vec2(3.0, 1.0)); // 美洲
                float continent3 = fbm(uv * 5.0 + vec2(1.5, 2.0)); // 非洲
                float continent4 = fbm(uv * 6.0 + vec2(4.0, 3.0)); // 澳洲
                
                // 组合大陆
                float landNoise = max(max(continent1, continent2), max(continent3, continent4));
                landNoise += fbm(uv * 12.0) * 0.2; // 添加细节
                
                // 调整海陆比例 (地球约70%是海洋)
                float landMask = smoothstep(0.35, 0.5, landNoise);
                
                // 更鲜艳的海洋颜色 - 深蓝色
                vec3 deepOcean = vec3(0.0, 0.1, 0.4);      // 深海蓝
                vec3 midOcean = vec3(0.0, 0.2, 0.6);       // 中层海蓝
                vec3 shallowOcean = vec3(0.1, 0.4, 0.7);   // 浅海蓝绿
                
                float oceanDepth = fbm(uv * 15.0) * 0.5 + 0.5;
                vec3 oceanColor = mix(deepOcean, midOcean, oceanDepth);
                // 近岸浅水区
                float coastDist = smoothstep(0.3, 0.45, landNoise);
                oceanColor = mix(oceanColor, shallowOcean, coastDist * 0.6);
                
                // 更鲜艳的陆地颜色
                vec3 darkForest = vec3(0.05, 0.25, 0.05);   // 深绿森林
                vec3 forest = vec3(0.1, 0.4, 0.1);          // 森林绿
                vec3 grassland = vec3(0.3, 0.5, 0.15);      // 草原黄绿
                vec3 savanna = vec3(0.6, 0.5, 0.2);         // 稀树草原
                vec3 desert = vec3(0.85, 0.7, 0.4);         // 沙漠黄
                vec3 mountains = vec3(0.45, 0.35, 0.25);    // 山脉棕
                vec3 snow = vec3(0.95, 0.97, 1.0);          // 雪白
                
                // 根据纬度和噪声混合地形
                float latitude = abs(uv.y - 0.5) * 2.0; // 0在赤道，1在极地
                float terrainNoise = fbm(uv * 10.0 + 5.0);
                float heightNoise = fbm(uv * 20.0);
                
                // 热带雨林 (赤道附近)
                vec3 landColor = mix(darkForest, forest, terrainNoise);
                
                // 温带 (中纬度)
                float temperate = smoothstep(0.15, 0.4, latitude);
                landColor = mix(landColor, grassland, temperate * (1.0 - terrainNoise * 0.5));
                
                // 沙漠带 (副热带)
                float desertBand = smoothstep(0.2, 0.35, latitude) * smoothstep(0.5, 0.35, latitude);
                float desertNoise = smoothstep(0.4, 0.7, terrainNoise);
                landColor = mix(landColor, desert, desertBand * desertNoise * 0.8);
                
                // 稀树草原
                landColor = mix(landColor, savanna, desertBand * (1.0 - desertNoise) * 0.5);
                
                // 山脉 (高海拔)
                float mountainMask = smoothstep(0.55, 0.75, heightNoise);
                landColor = mix(landColor, mountains, mountainMask * 0.7);
                
                // 山顶积雪
                float snowLine = smoothstep(0.7, 0.85, heightNoise) * smoothstep(0.3, 0.5, latitude);
                landColor = mix(landColor, snow, snowLine * 0.8);
                
                // 极地冰盖 - 更明显
                float polarNorth = smoothstep(0.12, 0.0, uv.y);
                float polarSouth = smoothstep(0.88, 1.0, uv.y);
                float polar = max(polarNorth, polarSouth);
                vec3 ice = vec3(0.92, 0.95, 1.0);
                
                // 混合海洋和陆地
                vec3 surfaceColor = mix(oceanColor, landColor, landMask);
                
                // 添加冰盖
                surfaceColor = mix(surfaceColor, ice, polar * 0.9);
                
                // 云层 - 更自然的分布
                float clouds1 = fbm(uv * 5.0 + time * 0.003);
                float clouds2 = fbm(uv * 8.0 - time * 0.002 + 10.0);
                float clouds = (clouds1 + clouds2) * 0.5;
                clouds = smoothstep(0.3, 0.65, clouds);
                vec3 cloudColor = vec3(1.0, 1.0, 1.0);
                surfaceColor = mix(surfaceColor, cloudColor, clouds * 0.45);
                
                // 大气散射效果（边缘发蓝光）
                float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 3.5);
                vec3 atmosphere = vec3(0.4, 0.7, 1.0);
                surfaceColor = mix(surfaceColor, atmosphere, fresnel * 0.5);
                
                // 昼夜光照
                float daylight = dot(normalize(vWorldPosition), normalize(sunDirection));
                daylight = smoothstep(-0.15, 0.25, daylight);
                
                // 夜晚效果
                vec3 nightColor = surfaceColor * 0.03;
                // 城市灯光
                float cityLights = fbm(uv * 40.0) * landMask * (1.0 - polar);
                cityLights = smoothstep(0.55, 0.75, cityLights);
                nightColor += vec3(1.0, 0.85, 0.5) * cityLights * 0.4;
                
                // 混合昼夜
                vec3 finalColor = mix(nightColor, surfaceColor, daylight);
                
                // 增加整体饱和度
                float gray = dot(finalColor, vec3(0.299, 0.587, 0.114));
                finalColor = mix(vec3(gray), finalColor, 1.2);
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `
    });

    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.rotation.z = EARTH_TILT; // 地轴倾斜
    earth.position.set(EARTH_ORBIT_RADIUS, 0, 0);
    scene.add(earth);

    // 大气层光晕 - 更明显的蓝色
    const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.15, 64, 64);
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
                float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
                vec3 color = vec3(0.3, 0.6, 1.0);
                gl_FragColor = vec4(color, intensity * 0.6);
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
    
    // 使用着色器创建真实的月球表面
    const moonMaterial = new THREE.ShaderMaterial({
        uniforms: {
            sunDirection: { value: new THREE.Vector3(-1, 0, 0) }
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
            uniform vec3 sunDirection;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vPosition;
            
            // 噪声函数
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
            float crater(vec2 uv, vec2 center, float size) {
                float dist = length(uv - center) / size;
                // 陨石坑边缘凸起，中心凹陷
                float rim = smoothstep(0.8, 1.0, dist) * smoothstep(1.3, 1.0, dist);
                float bowl = smoothstep(0.0, 0.8, dist);
                return rim * 0.3 - (1.0 - bowl) * 0.2;
            }
            
            void main() {
                vec2 uv = vUv;
                
                // 月球基础颜色 - 灰色调
                vec3 baseGray = vec3(0.55, 0.53, 0.5);
                vec3 darkGray = vec3(0.3, 0.28, 0.26);
                vec3 lightGray = vec3(0.7, 0.68, 0.65);
                
                // 月海 (较暗的区域)
                float maria1 = fbm(uv * 3.0 + vec2(0.5, 0.3));
                float maria2 = fbm(uv * 2.5 + vec2(2.0, 1.0));
                float mariaMask = smoothstep(0.4, 0.6, maria1) * smoothstep(0.35, 0.55, maria2);
                
                vec3 surfaceColor = mix(baseGray, darkGray, mariaMask * 0.6);
                
                // 高地 (较亮的区域)
                float highlands = fbm(uv * 4.0 + vec2(1.0, 2.0));
                surfaceColor = mix(surfaceColor, lightGray, smoothstep(0.5, 0.7, highlands) * 0.4);
                
                // 添加大陨石坑
                float craterEffect = 0.0;
                
                // 大型陨石坑
                craterEffect += crater(uv, vec2(0.3, 0.4), 0.12);
                craterEffect += crater(uv, vec2(0.7, 0.3), 0.1);
                craterEffect += crater(uv, vec2(0.5, 0.7), 0.15);
                craterEffect += crater(uv, vec2(0.2, 0.6), 0.08);
                craterEffect += crater(uv, vec2(0.8, 0.6), 0.11);
                craterEffect += crater(uv, vec2(0.4, 0.2), 0.09);
                craterEffect += crater(uv, vec2(0.6, 0.5), 0.07);
                craterEffect += crater(uv, vec2(0.15, 0.25), 0.06);
                craterEffect += crater(uv, vec2(0.85, 0.8), 0.1);
                craterEffect += crater(uv, vec2(0.45, 0.85), 0.08);
                
                // 中型陨石坑
                for (float i = 0.0; i < 15.0; i++) {
                    vec2 pos = vec2(
                        fract(sin(i * 127.1) * 43758.5453),
                        fract(sin(i * 311.7) * 43758.5453)
                    );
                    float size = 0.03 + fract(sin(i * 78.233) * 43758.5453) * 0.04;
                    craterEffect += crater(uv, pos, size) * 0.5;
                }
                
                // 小型陨石坑纹理
                float smallCraters = fbm(uv * 30.0) * 0.15;
                float tinyCraters = fbm(uv * 60.0) * 0.08;
                
                // 应用陨石坑效果到颜色
                surfaceColor += vec3(craterEffect * 0.4);
                surfaceColor -= vec3(smallCraters * 0.3);
                surfaceColor += vec3(tinyCraters * 0.15);
                
                // 表面粗糙度
                float roughness = fbm(uv * 50.0) * 0.1;
                surfaceColor += vec3(roughness - 0.05);
                
                // 光照
                vec3 lightDir = normalize(vec3(1.0, 0.5, 1.0));
                float diff = max(dot(vNormal, lightDir), 0.0);
                
                // 增加对比度的光照
                float shadow = smoothstep(-0.1, 0.3, diff);
                surfaceColor *= (shadow * 0.7 + 0.3);
                
                // 边缘稍暗
                float edge = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 1.5);
                surfaceColor *= (1.0 - edge * 0.2);
                
                // 确保颜色在合理范围
                surfaceColor = clamp(surfaceColor, 0.15, 0.85);
                
                gl_FragColor = vec4(surfaceColor, 1.0);
            }
        `
    });

    moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(MOON_ORBIT_RADIUS, 0, 0);
    earth.add(moon);

    // 月球轨道
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
    const orbitGeometry = new THREE.RingGeometry(EARTH_ORBIT_RADIUS - 0.3, EARTH_ORBIT_RADIUS + 0.3, 128);
    const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    earthOrbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    earthOrbit.rotation.x = Math.PI / 2;
    scene.add(earthOrbit);

    // 四季位置标记和文字
    const seasonPositions = [
        { angle: 0, label: '春分', icon: '🌸', month: '3月21日', color: 0x90EE90 },
        { angle: Math.PI / 2, label: '夏至', icon: '☀️', month: '6月21日', color: 0xFFD700 },
        { angle: Math.PI, label: '秋分', icon: '🍂', month: '9月23日', color: 0xDEB887 },
        { angle: Math.PI * 1.5, label: '冬至', icon: '❄️', month: '12月22日', color: 0x87CEEB }
    ];

    seasonPositions.forEach(pos => {
        // 位置标记球
        const markerGeometry = new THREE.SphereGeometry(1.5, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: pos.color });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.x = Math.cos(pos.angle) * EARTH_ORBIT_RADIUS;
        marker.position.z = Math.sin(pos.angle) * EARTH_ORBIT_RADIUS;
        marker.position.y = 0;
        scene.add(marker);

        // 创建文字标签 (使用Canvas绘制)
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.roundRect(0, 0, 256, 128, 15);
        ctx.fill();
        
        // 边框
        ctx.strokeStyle = `#${pos.color.toString(16).padStart(6, '0')}`;
        ctx.lineWidth = 3;
        ctx.roundRect(0, 0, 256, 128, 15);
        ctx.stroke();
        
        // 图标
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(pos.icon, 128, 45);
        
        // 节气名称
        ctx.font = 'bold 28px "Noto Sans SC", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(pos.label, 128, 80);
        
        // 日期
        ctx.font = '18px "Noto Sans SC", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(pos.month, 128, 108);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.x = Math.cos(pos.angle) * (EARTH_ORBIT_RADIUS + 12);
        sprite.position.z = Math.sin(pos.angle) * (EARTH_ORBIT_RADIUS + 12);
        sprite.position.y = 8;
        sprite.scale.set(20, 10, 1);
        scene.add(sprite);
    });
}

// ============ 创建地轴指示器 ============
function createAxisIndicator() {
    // 地轴线
    const axisLength = EARTH_RADIUS * 2.5;
    const axisGeometry = new THREE.CylinderGeometry(0.1, 0.1, axisLength, 8);
    const axisMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 });
    axisLine = new THREE.Mesh(axisGeometry, axisMaterial);
    earth.add(axisLine);

    // 北极标记
    const northGeometry = new THREE.ConeGeometry(0.4, 1, 8);
    const northMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 });
    const northMarker = new THREE.Mesh(northGeometry, northMaterial);
    northMarker.position.y = axisLength / 2 + 0.5;
    axisLine.add(northMarker);
}

// ============ 添加光源 ============
function addLights() {
    // 太阳光
    const sunLight = new THREE.PointLight(0xffffee, 2, 500);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // 环境光
    const ambientLight = new THREE.AmbientLight(0x222233, 0.3);
    scene.add(ambientLight);
}

// ============ 设置控制 ============
function setupControls() {
    // 模式切换
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            updateInfoPanel();
            updateUIForMode();
        });
    });

    // 速度控制
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    speedSlider.addEventListener('input', () => {
        animationSpeed = parseFloat(speedSlider.value);
        speedValue.textContent = animationSpeed.toFixed(1) + 'x';
    });

    // 四季点击
    document.querySelectorAll('.season-item').forEach(item => {
        item.addEventListener('click', () => {
            const season = item.dataset.season;
            jumpToSeason(season);
        });
    });
    
    // 播放/暂停按钮
    const playBtn = document.getElementById('playPauseBtn');
    if (playBtn) {
        playBtn.addEventListener('click', togglePlayPause);
    }
}

// ============ 更新信息面板 ============
function updateInfoPanel() {
    const info = seasonInfo[currentMode];
    document.querySelector('#infoPanel h2').innerHTML = info.title;
    document.getElementById('infoContent').innerHTML = info.content;
}

// ============ 根据模式更新UI ============
function updateUIForMode() {
    const seasonIndicator = document.getElementById('seasonIndicator');
    const axisIndicator = document.getElementById('axisIndicator');

    // 重置
    seasonIndicator.classList.remove('visible');
    axisIndicator.classList.remove('visible');
    
    // 切换模式时重置公转状态
    orbitAngle = 0;
    hasCompletedOrbit = false;
    isPlaying = true;
    dayCount = 0;
    yearProgress = 0;
    updatePlayButton();
    
    // 隐藏完成消息
    const msgEl = document.getElementById('completionMessage');
    if (msgEl) {
        msgEl.style.display = 'none';
    }
    
    // 重置地球位置
    earth.position.x = EARTH_ORBIT_RADIUS;
    earth.position.z = 0;

    switch (currentMode) {
        case 'rotation':
            camera.position.set(0, 10, 20);
            controls.target.copy(earth.position);
            break;
        case 'revolution':
            camera.position.set(0, 100, 150);
            controls.target.set(0, 0, 0);
            break;
        case 'seasons':
            camera.position.set(0, 80, 120);
            controls.target.set(0, 0, 0);
            seasonIndicator.classList.add('visible');
            axisIndicator.classList.add('visible');
            break;
        case 'daynight':
            camera.position.set(20, 5, 15);
            controls.target.copy(earth.position);
            break;
    }
}

// ============ 跳转到指定季节 ============
function jumpToSeason(season) {
    const seasonAngles = {
        spring: 0,
        summer: Math.PI / 2,
        autumn: Math.PI,
        winter: Math.PI * 1.5
    };
    orbitAngle = seasonAngles[season];
    updateSeasonIndicator();
}

// ============ 更新四季指示器 ============
function updateSeasonIndicator() {
    const normalizedAngle = ((orbitAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    let currentSeason;

    if (normalizedAngle < Math.PI / 4 || normalizedAngle >= Math.PI * 7 / 4) {
        currentSeason = 'spring';
    } else if (normalizedAngle < Math.PI * 3 / 4) {
        currentSeason = 'summer';
    } else if (normalizedAngle < Math.PI * 5 / 4) {
        currentSeason = 'autumn';
    } else {
        currentSeason = 'winter';
    }

    document.querySelectorAll('.season-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.season === currentSeason) {
            item.classList.add('active');
        }
    });
}

// ============ 窗口大小调整 ============
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============ 动画循环 ============
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // 更新太阳着色器
    if (sun.material.uniforms) {
        sun.material.uniforms.time.value = time;
    }

    // 更新地球着色器
    if (earth.material.uniforms) {
        earth.material.uniforms.time.value = time;
        // 更新太阳方向（用于昼夜效果）
        const sunDir = new THREE.Vector3().subVectors(sun.position, earth.position).normalize();
        earth.material.uniforms.sunDirection.value = sunDir;
    }

    // 根据模式执行不同动画
    const speed = delta * animationSpeed;

    // 只有在播放状态才执行动画
    if (isPlaying) {
        switch (currentMode) {
            case 'rotation':
                // 自转演示 - 地球快速自转
                earth.rotation.y += speed * 2;
                dayCount += speed * 0.5;
                break;

            case 'revolution':
                // 公转演示 - 地球绕太阳转
                const prevAngle = orbitAngle;
                orbitAngle += speed * 0.3;
                
                // 检查是否完成一圈
                if (orbitAngle >= Math.PI * 2 && !hasCompletedOrbit) {
                    orbitAngle = Math.PI * 2;
                    hasCompletedOrbit = true;
                    isPlaying = false;
                    updatePlayButton();
                    showCompletionMessage('🎉 地球绕太阳转了一圈！这就是一年（365天）');
                }
                
                earth.position.x = Math.cos(orbitAngle) * EARTH_ORBIT_RADIUS;
                earth.position.z = Math.sin(orbitAngle) * EARTH_ORBIT_RADIUS;
                earth.rotation.y += speed * 0.5;
                yearProgress = Math.min((orbitAngle / (Math.PI * 2)) * 100, 100);
                dayCount = yearProgress * 3.65;
                break;

            case 'seasons':
                // 四季演示 - 慢速公转，强调地轴倾斜
                orbitAngle += speed * 0.2;
                
                // 检查是否完成一圈
                if (orbitAngle >= Math.PI * 2 && !hasCompletedOrbit) {
                    orbitAngle = Math.PI * 2;
                    hasCompletedOrbit = true;
                    isPlaying = false;
                    updatePlayButton();
                    showCompletionMessage('🌸☀️🍂❄️ 春夏秋冬，四季轮回完成！');
                }
                
                earth.position.x = Math.cos(orbitAngle) * EARTH_ORBIT_RADIUS;
                earth.position.z = Math.sin(orbitAngle) * EARTH_ORBIT_RADIUS;
                earth.rotation.y += speed * 0.3;
                yearProgress = Math.min((orbitAngle / (Math.PI * 2)) * 100, 100);
                dayCount = yearProgress * 3.65;
                updateSeasonIndicator();
                break;

            case 'daynight':
                // 昼夜演示 - 聚焦自转
                earth.rotation.y += speed * 1.5;
                dayCount += speed * 0.3;
                break;
        }
    }

    // 月球绕地球转
    const moonAngle = time * 0.5;
    moon.position.x = Math.cos(moonAngle) * MOON_ORBIT_RADIUS;
    moon.position.z = Math.sin(moonAngle) * MOON_ORBIT_RADIUS;

    // 更新时间显示
    document.getElementById('dayCount').textContent = `第 ${Math.floor(dayCount) + 1} 天`;
    document.getElementById('yearProgress').textContent = `公转进度: ${yearProgress.toFixed(1)}%`;

    // 在公转/四季模式下，相机跟随地球
    if (currentMode === 'rotation' || currentMode === 'daynight') {
        controls.target.copy(earth.position);
    }

    controls.update();
    renderer.render(scene, camera);
}

// ============ 更新播放按钮状态 ============
function updatePlayButton() {
    const playBtn = document.getElementById('playPauseBtn');
    if (playBtn) {
        playBtn.innerHTML = isPlaying ? 
            '<span class="icon">⏸️</span><span>暂停</span>' : 
            '<span class="icon">▶️</span><span>播放</span>';
    }
}

// ============ 显示完成消息 ============
function showCompletionMessage(message) {
    // 创建消息元素
    let msgEl = document.getElementById('completionMessage');
    if (!msgEl) {
        msgEl = document.createElement('div');
        msgEl.id = 'completionMessage';
        msgEl.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.85);
            border: 2px solid #f4d03f;
            border-radius: 20px;
            padding: 30px 50px;
            color: white;
            font-size: 1.3rem;
            text-align: center;
            z-index: 1000;
            animation: popIn 0.3s ease;
        `;
        document.body.appendChild(msgEl);
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes popIn {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    msgEl.innerHTML = `
        <div style="margin-bottom: 15px;">${message}</div>
        <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7);">点击「播放」按钮再转一圈</div>
    `;
    msgEl.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        msgEl.style.display = 'none';
    }, 4000);
}

// ============ 切换播放/暂停 ============
function togglePlayPause() {
    // 如果已完成一圈，重置
    if (hasCompletedOrbit) {
        orbitAngle = 0;
        hasCompletedOrbit = false;
        dayCount = 0;
        yearProgress = 0;
    }
    
    isPlaying = !isPlaying;
    updatePlayButton();
    
    // 隐藏完成消息
    const msgEl = document.getElementById('completionMessage');
    if (msgEl) {
        msgEl.style.display = 'none';
    }
}

// 启动
init();
