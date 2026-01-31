/**
 * 银河系探索 - 柳智天的宇宙课堂
 * 展示银河系结构、太阳系位置、日球层和奥尔特云
 */

// ============ 全局变量 ============
let scene, camera, renderer, controls;
let milkyWay; // 银河系
let galacticCenter; // 银河系中心黑洞
let solarSystem; // 太阳系标记
let heliopause; // 日球层
let oortCloud; // 奥尔特云
let starField; // 背景星空
let clock;
let raycaster, mouse;

// 太阳系在银河系中的位置（距银心约26000光年，这里用单位表示）
const SOLAR_SYSTEM_POS = new THREE.Vector3(5000, 0, 2000);

// ============ 初始化 ============
function init() {
    clock = new THREE.Clock();

    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020208);

    // 创建相机
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        100000
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

    // 创建控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 100;
    controls.maxDistance = 30000;
    controls.target.copy(SOLAR_SYSTEM_POS);

    // 创建场景内容
    createDistantStars();
    createMilkyWay();
    createGalacticCenter();
    createSolarSystemMarker();
    createHeliopause();
    createOortCloud();
    addLights();

    // 射线检测器
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // 事件监听
    window.addEventListener('resize', onWindowResize);
    controls.addEventListener('change', updateScaleIndicator);
    renderer.domElement.addEventListener('click', onCanvasClick);
    renderer.domElement.style.cursor = 'pointer';

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

// ============ 创建银河系 ============
function createMilkyWay() {
    const galaxyParticles = 100000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(galaxyParticles * 3);
    const colors = new Float32Array(galaxyParticles * 3);
    const sizes = new Float32Array(galaxyParticles);

    const arms = 4; // 旋臂数量
    const galaxyRadius = 10000;

    for (let i = 0; i < galaxyParticles; i++) {
        // 旋臂结构
        const armIndex = i % arms;
        const armAngle = (armIndex / arms) * Math.PI * 2;

        // 使用对数螺旋
        const distance = Math.pow(Math.random(), 0.5) * galaxyRadius;
        const spiralAngle = distance * 0.0015 + armAngle;
        const spread = (Math.random() - 0.5) * distance * 0.25;

        const x = Math.cos(spiralAngle) * distance + Math.cos(spiralAngle + Math.PI / 2) * spread;
        const z = Math.sin(spiralAngle) * distance + Math.sin(spiralAngle + Math.PI / 2) * spread;
        // 盘面厚度（中心厚，边缘薄）
        const diskThickness = 150 * (1 - distance / galaxyRadius * 0.7);
        const y = (Math.random() - 0.5) * diskThickness;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // 银河系颜色
        const distRatio = distance / galaxyRadius;
        if (distRatio < 0.15) {
            // 核心区域 - 金黄色（老年恒星）
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 0.85;
            colors[i * 3 + 2] = 0.5;
            sizes[i] = 4 + Math.random() * 3;
        } else if (distRatio < 0.4) {
            // 内盘 - 橙白色
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 0.95;
            colors[i * 3 + 2] = 0.8;
            sizes[i] = 2 + Math.random() * 2;
        } else if (distRatio < 0.7) {
            // 中盘 - 白色带蓝
            colors[i * 3] = 0.9;
            colors[i * 3 + 1] = 0.95;
            colors[i * 3 + 2] = 1.0;
            sizes[i] = 1.5 + Math.random() * 1.5;
        } else {
            // 外盘 - 淡蓝色（年轻恒星）
            colors[i * 3] = 0.7;
            colors[i * 3 + 1] = 0.85;
            colors[i * 3 + 2] = 1.0;
            sizes[i] = 1 + Math.random();
        }
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
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);
                float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                gl_FragColor = vec4(vColor, alpha * 0.8);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    milkyWay = new THREE.Points(geometry, material);
    scene.add(milkyWay);
}

// ============ 创建银河系中心黑洞 ============
function createGalacticCenter() {
    // 黑洞本体
    const blackHoleGeometry = new THREE.SphereGeometry(100, 64, 64);
    const blackHoleMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000
    });
    const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);

    // 吸积盘
    const diskGeometry = new THREE.RingGeometry(120, 400, 128);
    const diskMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
                float dist = length(vUv - vec2(0.5));
                
                // 旋转效果
                float spiral = sin(angle * 6.0 + dist * 20.0 - time * 2.0) * 0.5 + 0.5;
                
                // 颜色渐变（内热外冷）
                vec3 innerColor = vec3(1.0, 0.8, 0.3);
                vec3 outerColor = vec3(0.8, 0.2, 0.5);
                vec3 color = mix(innerColor, outerColor, dist * 2.0);
                
                float alpha = (1.0 - dist * 2.0) * spiral * 0.8;
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const disk = new THREE.Mesh(diskGeometry, diskMaterial);
    disk.rotation.x = Math.PI / 2;

    // 光晕
    const glowGeometry = new THREE.SphereGeometry(500, 32, 32);
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
                float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                vec3 color = vec3(0.5, 0.2, 0.8) * intensity;
                gl_FragColor = vec4(color, intensity * 0.3);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false
    });

    const glow = new THREE.Mesh(glowGeometry, glowMaterial);

    galacticCenter = new THREE.Group();
    galacticCenter.add(blackHole);
    galacticCenter.add(disk);
    galacticCenter.add(glow);
    scene.add(galacticCenter);
}

// ============ 创建太阳系标记 ============
function createSolarSystemMarker() {
    solarSystem = new THREE.Group();
    solarSystem.position.copy(SOLAR_SYSTEM_POS);

    // 太阳（一个发光的小点）
    const sunGeometry = new THREE.SphereGeometry(15, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xffcc00
    });
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
    scene.add(oortCloud);
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

// ============ 动画循环 ============
function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    controls.update();

    // 银河系缓慢旋转
    if (milkyWay) {
        milkyWay.rotation.y += 0.0001;
    }

    // 更新黑洞吸积盘
    if (galacticCenter) {
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

    renderer.render(scene, camera);
}

// ============ 窗口大小调整 ============
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============ 更新比例指示器 ============
function updateScaleIndicator() {
    const distance = camera.position.distanceTo(SOLAR_SYSTEM_POS);
    const scaleValue = document.getElementById('scaleValue');

    if (distance > 10000) {
        scaleValue.textContent = '银河系全景';
    } else if (distance > 3000) {
        scaleValue.textContent = '猎户臂视角';
    } else if (distance > 500) {
        scaleValue.textContent = '太阳系邻域';
    } else if (distance > 150) {
        scaleValue.textContent = '奥尔特云';
    } else {
        scaleValue.textContent = '日球层';
    }
}

// ============ 点击事件 ============
function onCanvasClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // 检测太阳系区域的点击
    if (solarSystem) {
        const solarSystemObjects = [];
        solarSystem.traverse(obj => {
            if (obj.isMesh) solarSystemObjects.push(obj);
        });

        // 也检测日球层和奥尔特云
        if (heliopause) solarSystemObjects.push(heliopause);

        const intersects = raycaster.intersectObjects(solarSystemObjects);

        if (intersects.length > 0) {
            // 点击了太阳系区域，跳转到太阳系页面
            window.location.href = 'solar-system.html';
        }
    }
}

// ============ 启动 ============
window.addEventListener('DOMContentLoaded', init);

