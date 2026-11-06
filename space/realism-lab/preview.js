/* 独立视觉实验：观测素材负责外观，Three.js 负责光照、空间和交互。 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const mobile = matchMedia('(max-width:650px)').matches;
  const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const state = { world: 'solar', view: 'earth', paused: reducedMotion, ready: false, elapsed: 0 };
  let renderer, scene, camera, controls, solar, galaxy, sunLight, closeLight, transition;
  let clouds, moon, sunHalo, starfield, galaxyReady = false, galaxyPromise;
  let lastFrame = 0, animationId, contextLost = false;
  const bodies = {}, labels = [], pickable = [], spin = [], animatedMaterials = [];
  const vector = new THREE.Vector3(), priorTarget = new THREE.Vector3();
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  const sphere = new THREE.SphereGeometry(1, 96, 64);
  const textureLoader = new THREE.TextureLoader();
  const planetConfig = [
    ['mercury', '水星', 'mercury.jpg', .52, 13, .9, .241],
    ['venus', '金星', 'venus_atmosphere.jpg', .92, 21, 2.3, .615],
    ['earth', '地球', 'earth_daymap.jpg', 1.25, 30, .5, 1],
    ['mars', '火星', 'mars.jpg', .72, 41, 4.1, 1.88],
    ['jupiter', '木星', 'jupiter.jpg', 3.05, 61, 2.65, 11.86],
    ['saturn', '土星', null, 2.55, 87, 5.5, 29.45],
    ['uranus', '天王星', 'uranus.jpg', 1.55, 113, 3.7, 84],
    ['neptune', '海王星', 'neptune.jpg', 1.5, 138, 1.5, 164.8]
  ];
  const copy = {
    earth: ['地球，有光的那一面。', '慢慢转到背面，看白昼变成黑夜。云层浮在海洋上，大气在边缘亮起一圈薄薄的蓝。', '观测数据贴图 · 实时光照'],
    saturn: ['一圈薄环，一个世界。', '拖动看看：宽阔的土星环，从侧面看几乎变成一条线。再找一找，土星投在环上的影子。', 'Blender 模型 · 真实环纹理'],
    jupiter: ['靠近这颗气态巨人。', '条带环绕着木星。试着绕到它背后：再巨大的行星，也只有朝向太阳的一面是白昼。', '观测数据贴图 · 球面云带'],
    overview: ['八颗行星，一颗太阳。', '拖动整个太阳系，看看轨道的空间关系。点击一颗行星，就能飞到它的身边。', '自由观察 · 点选飞近'],
    oblique: ['我们的家，是一座星系。', '先从远处看旋臂，再把银河转向侧面。无数星光组成扁扁的银盘，中央却鼓了起来。', '观测约束的结构示意 · 立体星光'],
    top: ['旋臂，绕着中央展开。', '蓝白色旋臂围绕暖色的中央棒状结构。暗纹提示尘埃的位置，这些形状来自银河结构重建。', '外部全貌为艺术重建'],
    edge: ['换个角度，看见厚度。', '银河像一只很薄的盘子，中间有一个鼓起的部分。拖动它，看看同一片星光怎样改变模样。', '银盘与中央隆起 · 厚度示意'],
    home: ['太阳，在这里。', '这枚小标记代表太阳系。它在银河盘里，距离银心约 2.6 万光年，并不在银河的中心。', '标记放大显示 · 方位示意']
  };

  // ============ 加载与错误反馈 ============
  function fail(error) {
    console.error(error);
    $('loading').hidden = true;
    $('error').hidden = false;
    $('error-detail').textContent = '模型或图形环境加载失败。请确认浏览器已启用硬件加速，并重新加载。' + (error.message ? '（' + error.message + '）' : '');
  }
  function texture(file, color = true) {
    return new Promise((resolve, reject) => textureLoader.load('../textures/' + file, map => {
      map.encoding = color ? THREE.sRGBEncoding : THREE.LinearEncoding;
      map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      resolve(map);
    }, undefined, () => reject(new Error('无法加载 ' + file))));
  }
  function seededRandom(seed) {
    return () => { seed = (Math.imul(1664525, seed) + 1013904223) | 0; return (seed >>> 0) / 4294967296; };
  }
  function addLabel(text, object, kind = '') {
    const element = document.createElement('span');
    element.className = 'scene-label ' + kind;
    element.textContent = text;
    $('labels').appendChild(element);
    labels.push({ element, object, kind });
  }

  // ============ 渲染环境 ============
  function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x03070d);
    $('viewport').appendChild(renderer.domElement);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(mobile ? 48 : 38, 1, .05, 2400);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = .075;
    controls.enablePan = false;
    controls.rotateSpeed = .55;
    controls.zoomSpeed = .65;
    controls.addEventListener('start', () => {
      if (!transition) return;
      transition = null;
      priorTarget.copy(targetFor(state.view));
      setControlBounds(false);
    });
    scene.add(new THREE.AmbientLight(0x7992b3, .045));
    solar = new THREE.Group(); galaxy = new THREE.Group();
    scene.add(solar, galaxy); galaxy.visible = false;
    sunLight = new THREE.PointLight(0xfff6e8, 2.35, 0, 0);
    solar.add(sunLight);
    closeLight = new THREE.DirectionalLight(0xfff6e8, 2.35);
    closeLight.castShadow = true;
    closeLight.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
    Object.assign(closeLight.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: .5, far: 65 });
    closeLight.shadow.bias = -.00015;
    closeLight.shadow.normalBias = .02;
    scene.add(closeLight, closeLight.target);
    renderer.domElement.addEventListener('webglcontextlost', event => {
      event.preventDefault(); contextLost = true; cancelAnimationFrame(animationId);
      fail(new Error('图形上下文中断'));
    });
    window.addEventListener('resize', resize);
    resize();
    createBackground();
  }
  function resize() {
    const { width, height } = $('viewport').getBoundingClientRect();
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // 横屏把主体稍向右移，竖屏给说明和底部操作留出空间。
    camera.setViewOffset(width, height, width > 650 ? -width * .1 : 0, width <= 650 ? -height * .015 : 0, width, height);
    animatedMaterials.forEach(m => { m.uniforms.pixelRatio.value = renderer.getPixelRatio(); });
  }
  function createBackground() {
    const rand = seededRandom(42), positions = [], colors = [];
    for (let i = 0; i < 2300; i++) {
      const z = rand() * 2 - 1, angle = rand() * Math.PI * 2, r = Math.sqrt(1 - z * z);
      positions.push(800 * r * Math.cos(angle), 800 * z, 800 * r * Math.sin(angle));
      const brightness = .18 + Math.pow(rand(), 4) * .55;
      colors.push(brightness * .9, brightness * .95, brightness);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    starfield = new THREE.Points(geo, new THREE.PointsMaterial({ size: 1.15, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: .75, depthWrite: false }));
    scene.add(starfield);
  }

  // ============ 地表、云层和昼夜 ============
  function nightSideMaterial(day, night, normal, specular) {
    const material = new THREE.MeshPhongMaterial({ map: day, normalMap: normal, normalScale: new THREE.Vector2(.4, .4), specularMap: specular, specular: 0x304458, shininess: 70, emissiveMap: night, emissive: 0xffddaa, emissiveIntensity: .7 });
    material.onBeforeCompile = shader => {
      const varyings = 'varying vec3 vSurfaceWorld; varying vec3 vNormalWorld;\n';
      shader.vertexShader = varyings + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvSurfaceWorld = (modelMatrix * vec4(position, 1.0)).xyz;\nvNormalWorld = normalize(mat3(modelMatrix) * normal);');
      shader.fragmentShader = varyings + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\nfloat daylight = dot(normalize(vNormalWorld), normalize(-vSurfaceWorld));\ntotalEmissiveRadiance *= 1.0 - smoothstep(-0.16, 0.12, daylight);');
    };
    return material;
  }
  function atmosphere(radius) {
    const mesh = new THREE.Mesh(sphere, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: 'varying vec3 n; varying vec3 p; void main(){ n=normalize(mat3(modelMatrix)*normal);p=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}',
      fragmentShader: 'varying vec3 n;varying vec3 p;void main(){vec3 N=normalize(n);float rim=pow(1.-max(dot(N,normalize(cameraPosition-p)),0.),3.6);float day=smoothstep(-.22,.7,dot(N,normalize(-p)));gl_FragColor=vec4(vec3(.16,.48,1.),rim*day*.65);}'
    }));
    mesh.scale.setScalar(radius * 1.035);
    return mesh;
  }
  function orbitLine(radius) {
    const points = [];
    for (let i = 0; i < 256; i++) { const a = i / 256 * Math.PI * 2; points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius)); }
    return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0x597085, transparent: true, opacity: .19 }));
  }
  function glowTexture() {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d'), gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,247,217,.8)'); gradient.addColorStop(.2, 'rgba(255,207,141,.25)'); gradient.addColorStop(.5, 'rgba(247,167,90,.06)'); gradient.addColorStop(1, 'rgba(255,180,90,0)');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }
  async function createSolar() {
    const [day, night, normal, specular, cloudMap, moonMap, sunMap] = await Promise.all([
      texture('earth_daymap.jpg'), texture('earth_nightmap.jpg'), texture('earth_normal.jpg', false), texture('earth_specular.jpg', false), texture('earth_clouds.jpg', false), texture('moon.jpg'), texture('sun.jpg')
    ]);
    const sun = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ map: sunMap, color: 0xffe2a8 }));
    sun.scale.setScalar(5); solar.add(sun);
    sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    sunHalo.scale.set(31, 31, 1); solar.add(sunHalo);
    const tasks = planetConfig.map(async ([key, name, file, radius, distance, phase, period]) => {
      const anchor = new THREE.Group(); solar.add(anchor);
      const tilt = new THREE.Group(); anchor.add(tilt);
      tilt.rotation.z = (key === 'earth' ? 23.44 : key === 'uranus' ? 97.8 : 3) * Math.PI / 180;
      if (key === 'saturn') { tilt.rotation.z = 0; tilt.rotation.x = 26.7 * Math.PI / 180; }
      bodies[key] = { key, name, anchor, tilt, radius, distance, phase, period };
      let mesh;
      if (key === 'saturn') {
        const gltf = await new Promise((resolve, reject) => new THREE.GLTFLoader().load('assets/saturn.glb', resolve, undefined, reject));
        mesh = gltf.scene; mesh.scale.setScalar(radius); tilt.add(mesh);
        mesh.traverse(node => { if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; node.userData.bodyKey = key; pickable.push(node); if (node.material.map) node.material.map.anisotropy = 8; if (node.name === 'SaturnRings') node.material.alphaTest = .12; } });
      } else {
        const material = key === 'earth' ? nightSideMaterial(day, night, normal, specular) : new THREE.MeshStandardMaterial({ map: await texture(file), roughness: 1, metalness: 0 });
        mesh = new THREE.Mesh(sphere, material); mesh.scale.set(radius, radius * (key === 'jupiter' ? .94 : 1), radius);
        mesh.castShadow = true; mesh.receiveShadow = true; tilt.add(mesh); mesh.userData.bodyKey = key; pickable.push(mesh);
        spin.push({ mesh, speed: key === 'earth' ? .065 : key === 'venus' || key === 'uranus' ? -.03 : .085 });
      }
      if (key === 'earth') {
        mesh.rotation.y = 2.8;
        clouds = new THREE.Mesh(sphere, new THREE.MeshPhongMaterial({ color: 0xffffff, alphaMap: cloudMap, transparent: true, opacity: .85, depthWrite: false, shininess: 3 }));
        clouds.scale.setScalar(radius * 1.012); clouds.rotation.y = 2.8; tilt.add(clouds); tilt.add(atmosphere(radius));
        moon = new THREE.Mesh(sphere, new THREE.MeshStandardMaterial({ map: moonMap, roughness: 1 }));
        moon.scale.setScalar(.34); moon.castShadow = true; moon.receiveShadow = true; anchor.add(moon);
      }
      const line = orbitLine(distance); solar.add(line); bodies[key].orbit = line;
      addLabel(name, anchor);
    });
    await Promise.all(tasks);
    updateSolar(0);
  }
  function updateSolar(delta) {
    Object.values(bodies).forEach(body => {
      const angle = body.phase + state.elapsed * .006 / body.period;
      body.anchor.position.set(Math.cos(angle) * body.distance, 0, Math.sin(angle) * body.distance);
      body.orbit.visible = state.view === 'overview';
    });
    spin.forEach(({ mesh, speed }) => { mesh.rotation.y += delta * speed; });
    if (clouds) clouds.rotation.y += delta * .071;
    if (moon) { const a = state.elapsed * .025 + .5; moon.position.set(Math.cos(a) * 4.4, .3, Math.sin(a) * 4.4); moon.rotation.y = -a; }
  }

  // ============ 银河：从来源图采样，建立有厚度的星光体积 ============
  async function createGalaxy() {
    if (galaxyReady) return;
    if (galaxyPromise) return galaxyPromise;
    galaxyPromise = (async () => {
      const map = await texture('milkyway.jpg');
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 768;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(map.image, 0, 0, 768, 768);
      const pixels = ctx.getImageData(0, 0, 768, 768).data;
      const rand = seededRandom(20261106), positions = [], colors = [], sizes = [];
      const count = mobile ? 65000 : 135000;
      const gaussian = () => Math.sqrt(-2 * Math.log(Math.max(.00001, rand()))) * Math.cos(2 * Math.PI * rand());
      for (let i = 0, attempts = 0; i < count && attempts < count * 25; attempts++) {
        const u = rand(), v = rand(), px = (Math.floor(v * 768) * 768 + Math.floor(u * 768)) * 4;
        const r = pixels[px] / 255, g = pixels[px + 1] / 255, b = pixels[px + 2] / 255;
        const luminance = r * .2126 + g * .7152 + b * .0722;
        const x = (u - .5) * 112, z = (v - .5) * 112, radial = Math.hypot(x, z);
        if (radial > 54 || rand() > Math.pow(luminance, 1.15) * .83) continue;
        const bulge = Math.exp(-(x * x + z * z) / 95);
        const y = gaussian() * (.48 + bulge * 3.1);
        positions.push(x, y, z);
        // 保留源图的冷暖和暗纹，厚度为教学模型，不推断实测单星坐标。
        const intensity = (.22 + Math.pow(luminance, .6) * .64) * (1 + bulge * 3);
        colors.push(r * intensity * 1.45, g * intensity * 1.45, b * intensity * 1.45);
        sizes.push(.11 + rand() * .23 + (i % 37 === 0 ? .34 : 0));
        i++;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
      const material = new THREE.ShaderMaterial({
        uniforms: { pixelRatio: { value: renderer.getPixelRatio() }, sizeBoost: { value: 1 }, opacity: { value: .3 } }, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        vertexShader: 'attribute float aSize;uniform float pixelRatio;uniform float sizeBoost;varying vec3 c;void main(){c=color;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(aSize*600.*sizeBoost*pixelRatio/max(1.,-p.z),1.,40.*pixelRatio);}',
        fragmentShader: 'uniform float opacity;varying vec3 c;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;float a=exp(-r*r*22.)*opacity;gl_FragColor=vec4(c,a);}'
      });
      animatedMaterials.push(material);
      material.userData.baseOpacity = .3;
      galaxy.add(new THREE.Points(geo, material));
      // 同一三维分布的柔光层，让遥远的未分辨星光汇合，不用一张平面底图。
      const haze = material.clone();
      haze.uniforms.sizeBoost.value = 9;
      haze.userData.baseOpacity = mobile ? .12 : .06;
      animatedMaterials.push(haze);
      galaxy.add(new THREE.Points(geo, haze));
      // 一半径单位约为一千光年。方位仅示意，径向距离约 2.6 万光年。
      const home = new THREE.Group(); home.position.set(21, .7, 15.3); galaxy.add(home); galaxy.userData.home = home;
      const marker = new THREE.Mesh(new THREE.SphereGeometry(.22, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe6a9, depthTest: false }));
      home.add(marker);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffdf9c, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }));
      halo.scale.set(3, 3, 1); home.add(halo);
      addLabel('太阳系 · 我们在这里', home, 'home-label');
      galaxyReady = true; map.dispose();
    })();
    return galaxyPromise;
  }

  // ============ 视角与交互 ============
  function targetFor(view) {
    if (state.world === 'galaxy') return view === 'home' ? galaxy.userData.home.position.clone() : new THREE.Vector3();
    return bodies[view] ? bodies[view].anchor.position.clone() : new THREE.Vector3();
  }
  function cameraOffset(view) {
    const fit = innerWidth <= 650 ? 1.45 : innerHeight < 560 ? 1.2 : 1;
    if (state.world === 'galaxy') {
      return ({ oblique: new THREE.Vector3(25, 66, 106), top: new THREE.Vector3(0, 175, .01), edge: new THREE.Vector3(0, 7, 145), home: new THREE.Vector3(12, 17, 30) }[view]).multiplyScalar(fit);
    }
    if (view === 'overview') return new THREE.Vector3(235, 230, 300).multiplyScalar(fit);
    const body = bodies[view], r = body.radius;
    const towardSun = body.anchor.position.clone().normalize().negate();
    const tangent = new THREE.Vector3(-towardSun.z, 0, towardSun.x);
    return towardSun.multiplyScalar(r * (view === 'saturn' ? 6.2 : 3.3)).add(tangent.multiplyScalar(r * (view === 'saturn' ? 5.7 : 4.3))).add(new THREE.Vector3(0, r * (view === 'saturn' ? 3.4 : 1.7), 0)).multiplyScalar(fit);
  }
  function setView(view, immediate = false) {
    state.view = view;
    const target = targetFor(view), offset = cameraOffset(view);
    if (immediate || reducedMotion) { controls.target.copy(target); camera.position.copy(target).add(offset); transition = null; }
    else transition = { started: performance.now(), from: camera.position.clone(), fromTarget: controls.target.clone(), toTarget: target, offset, duration: state.world === 'galaxy' ? 1800 : 2200 };
    priorTarget.copy(target);
    setControlBounds(Boolean(transition));
    let description = copy[view];
    if (!description && bodies[view]) description = ['来到' + bodies[view].name + '的身边。', '拖动视角，绕到它的另一面，看看太阳光怎样照亮这颗行星。', '观测数据贴图 · 实时光照'];
    $('scene-title').textContent = description[0]; $('scene-description').textContent = description[1]; $('material-tag').textContent = description[2];
    $('eyebrow').textContent = state.world === 'solar' ? '01 / SOLAR SYSTEM' : '02 / MILKY WAY';
    document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
    document.querySelectorAll('[data-world]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.world === state.world)));
    $('solar-presets').hidden = state.world !== 'solar'; $('galaxy-presets').hidden = state.world !== 'galaxy';
    $('view-note').textContent = state.world === 'solar' ? '实景质感 / 教学尺度' : '结构重建 / 非外拍照片';
    $('truth-note').textContent = state.world === 'solar' ? '行星大小、间距均不按真实比例；运动加速，位置不代表今日星历。太阳采用增强色贴图。' : '银河全貌为艺术重建；星光分布与厚度为示意，非逐星测量。太阳方位示意，标记放大。';
    $('pause').hidden = state.world === 'galaxy';
    updateLight();
  }
  function setControlBounds(inFlight) {
    const view = state.view;
    controls.minDistance = inFlight ? .1 : state.world === 'galaxy' ? (view === 'home' ? 5 : 32) : view === 'overview' ? 24 : bodies[view].radius * (view === 'saturn' ? 2.8 : 1.7);
    controls.maxDistance = inFlight ? 1500 : state.world === 'galaxy' ? 260 : view === 'overview' ? 650 : bodies[view].radius * 28;
  }
  async function switchWorld(world) {
    if (world === state.world || !state.ready) return;
    if (world === 'galaxy' && !galaxyReady) {
      $('loading').hidden = false; $('loading-detail').textContent = '正在构建立体银河';
      try { await createGalaxy(); } catch (error) { fail(error); return; }
      $('loading').hidden = true;
    }
    state.world = world; solar.visible = world === 'solar'; galaxy.visible = world === 'galaxy';
    starfield.material.opacity = world === 'galaxy' ? .28 : .75;
    setView(world === 'galaxy' ? 'oblique' : 'earth', true);
  }
  function updateLight() {
    const close = state.world === 'solar' && bodies[state.view];
    sunLight.visible = !close; closeLight.visible = Boolean(close);
    if (close) {
      closeLight.target.position.copy(close.anchor.position);
      closeLight.position.copy(close.anchor.position).add(close.anchor.position.clone().normalize().multiplyScalar(-25));
    }
  }
  function updateLabels() {
    const w = $('viewport').clientWidth, h = $('viewport').clientHeight;
    labels.forEach(label => {
      const show = label.kind === 'home-label' ? state.world === 'galaxy' : state.world === 'solar' && state.view === 'overview';
      if (!show) { label.element.hidden = true; return; }
      label.object.getWorldPosition(vector); vector.project(camera);
      const x = (vector.x * .5 + .5) * w, y = (-vector.y * .5 + .5) * h;
      label.element.hidden = vector.z > 1 || vector.z < -1 || x < 0 || x > w - 100 || y < 95 || y > h - 190;
      label.element.style.left = x + 'px'; label.element.style.top = y + 'px';
    });
  }
  function wireUI() {
    document.querySelectorAll('[data-world]').forEach(button => button.addEventListener('click', () => switchWorld(button.dataset.world)));
    document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { if (state.ready) setView(button.dataset.view); }));
    $('pause').setAttribute('aria-pressed', String(state.paused));
    function pauseText() { $('pause').innerHTML = state.paused ? '▷ <span>继续</span>' : 'Ⅱ <span>暂停</span>'; $('pause').setAttribute('aria-label', state.paused ? '继续天体运动' : '暂停天体运动'); }
    pauseText();
    $('pause').addEventListener('click', () => { state.paused = !state.paused; $('pause').setAttribute('aria-pressed', String(state.paused)); pauseText(); });
    $('reset').addEventListener('click', () => { if (state.ready) setView(state.view); });
    $('about-open').addEventListener('click', () => $('about').showModal());
    $('about-close').addEventListener('click', () => $('about').close());
    let start = null;
    renderer.domElement.addEventListener('pointerdown', event => { start = { x: event.clientX, y: event.clientY }; });
    renderer.domElement.addEventListener('pointerup', event => {
      if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5 || state.world !== 'solar' || state.view !== 'overview') return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(pickable, false)[0];
      if (hit) setView(hit.object.userData.bodyKey);
      start = null;
    });
    document.addEventListener('visibilitychange', () => { lastFrame = performance.now(); });
  }

  // ============ 动画循环 ============
  function frame(now) {
    if (contextLost) return;
    animationId = requestAnimationFrame(frame);
    const dt = Math.min((now - (lastFrame || now)) / 1000, .05); lastFrame = now;
    if (document.hidden) return;
    const delta = state.paused || state.world !== 'solar' ? 0 : dt;
    state.elapsed += delta; updateSolar(delta);
    if (transition) {
      const t = Math.min(1, (now - transition.started) / transition.duration), ease = t * t * (3 - 2 * t);
      const target = targetFor(state.view);
      controls.target.lerpVectors(transition.fromTarget, target, ease);
      camera.position.lerpVectors(transition.from, target.clone().add(transition.offset), ease);
      if (t === 1) { transition = null; priorTarget.copy(target); setControlBounds(false); }
    } else if (state.world === 'solar' && bodies[state.view]) {
      const target = targetFor(state.view), shift = target.clone().sub(priorTarget);
      camera.position.add(shift); controls.target.add(shift); priorTarget.copy(target);
    }
    updateLight(); controls.update();
    if (state.world === 'galaxy') {
      // 侧面视线穿过更多星光，适度降低曝光以保留核心和薄盘的层次。
      const direction = vector.copy(camera.position).sub(controls.target);
      const inclination = Math.abs(direction.y) / direction.length();
      const exposure = .16 + .84 * inclination;
      animatedMaterials.forEach(material => { material.uniforms.opacity.value = material.userData.baseOpacity * exposure; });
    }
    updateLabels(); renderer.render(scene, camera);
  }
  async function init() {
    try {
      initRenderer(); wireUI(); await createSolar();
      state.ready = true; setView('earth', true); $('loading').hidden = true;
      animationId = requestAnimationFrame(frame);
      // 只读诊断入口，用于核实场景状态、模型载入与运动暂停。
      window.observatory = { snapshot: () => ({ ...state, galaxyReady, inFlight: Boolean(transition), camera: camera.position.toArray(), target: controls.target.toArray(), bounds: [controls.minDistance, controls.maxDistance], renderer: { ...renderer.info.render }, bodies: Object.fromEntries(Object.entries(bodies).map(([key, b]) => [key, { position: b.anchor.position.toArray(), screen: b.anchor.position.clone().project(camera).toArray(), radius: b.radius }])), saturnMeshes: bodies.saturn.tilt.children[0].children.map(c => c.name), galaxyParticles: galaxyReady ? galaxy.children[0].geometry.attributes.position.count : 0, earthRotation: spin.find(s => s.mesh.userData.bodyKey === 'earth').mesh.rotation.y }) };
    } catch (error) { fail(error); }
  }
  init();
})();
