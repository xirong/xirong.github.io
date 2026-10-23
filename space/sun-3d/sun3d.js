/* 真实的太阳 · 第一期：逼真外观
   球面贴图全部来自 NASA/SDO 真实照片（tools/build-textures.py 生成）；
   代码只负责光照（临边昏暗、辉光）、动画（较差自转、米粒翻涌）和交互。 */
(() => {
  'use strict';

  // ============ 常量与眼镜配置 ============
  const SUN_R = 1;
  const HOME_DIST = 4.6;
  const CLOSE_DIST = 1.07;
  const DAYS_PER_SEC = 0.25;       // 平时：约 100 秒转一圈
  const DAYS_PER_SEC_DEMO = 2.2;   // 转圈圈演示：约 12 秒转一圈

  // p = [是否灰度图, 增益, 临边类型(0 变暗 / 1 变亮 / 2 不变), 米粒细节]
  const MODES = {
    visible:  { map: 'assets/map-visible.jpg',  p: [1, 1.45, 0, 1], tint: [1.16, 0.82, 0.38], halo: [1.0, 0.62, 0.25], haloK: 1.0, corona: null },
    uv304:    { map: 'assets/map-304.jpg',      p: [0, 1.25, 1, 0], tint: [1, 1, 1],          halo: [1.0, 0.22, 0.04], haloK: 0.7, corona: 'c304' },
    uv171:    { map: 'assets/map-171.jpg',      p: [0, 1.20, 1, 0], tint: [1, 1, 1],          halo: [0.95, 0.72, 0.12], haloK: 0.55, corona: 'c171' },
    magnetic: { map: 'assets/map-magnetic.jpg', p: [1, 0.80, 2, 0], tint: [1, 1, 1],          halo: [0.5, 0.5, 0.5], haloK: 0.12, corona: null },
  };
  // 日冕光环贴图：outer = 贴图半边长是几个太阳半径（与 build-textures.py 一致）
  const CORONAS = {
    c304:    { src: 'assets/corona-304.jpg',     outer: 1.45 },
    c171:    { src: 'assets/corona-171.jpg',     outer: 1.32 },
    eclipse: { src: 'assets/corona-eclipse.jpg', outer: 4.0, gain: 2.2 },
  };

  // ============ 渲染器、相机、控制 ============
  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.005, 300);
  // 竖屏时按宽度留出同样的视野，太阳不会撑出屏幕
  function fitFov() {
    const a = innerWidth / innerHeight;
    camera.aspect = a;
    camera.fov = a >= 1 ? 38 : THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(19)) / a));
    camera.updateProjectionMatrix();
  }
  fitFov();
  camera.position.set(0.5, 0.45, HOME_DIST).setLength(HOME_DIST);

  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 1.03;
  controls.maxDistance = 9;
  controls.zoomSpeed = 0.7;

  const composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));
  const bloom = new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.5, 0.4, 0.86);
  composer.addPass(bloom);

  // ============ 贴图加载 ============
  const loader = new THREE.TextureLoader();
  const texCache = {};
  function loadTex(src, wrap) {
    if (!texCache[src]) {
      texCache[src] = new Promise((resolve, reject) => loader.load(src, t => {
        t.anisotropy = maxAniso;
        if (wrap) t.wrapS = t.wrapT = wrap;
        resolve(t);
      }, undefined, reject));
    }
    return texCache[src];
  }
  const mapTex = mode => loadTex(MODES[mode].map, THREE.RepeatWrapping);

  // ============ 星空背景 ============
  loadTex('../textures/starfield.jpg').then(t => {
    const sky = new THREE.Mesh(new THREE.SphereGeometry(150, 48, 32),
      new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, color: 0x3a3a3a, depthWrite: false }));
    scene.add(sky);
  });

  // ============ 太阳球体 shader ============
  const sun = new THREE.Group();
  sun.rotation.y = -Math.PI / 2;   // 让最新一张照片的日面中心朝向 +z（初始镜头方向）
  scene.add(sun);

  const sunUniforms = {
    mapA: { value: null }, mapB: { value: null }, mixAB: { value: 0 },
    pA: { value: new THREE.Vector4() }, pB: { value: new THREE.Vector4() },
    tintA: { value: new THREE.Vector3() }, tintB: { value: new THREE.Vector3() },
    granules: { value: null }, time: { value: 0 }, days: { value: 0 }, close: { value: 0 },
  };
  const sunMat = new THREE.ShaderMaterial({
    uniforms: sunUniforms,
    vertexShader: `
      varying vec2 vUv; varying vec3 vN; varying vec3 vView;
      void main(){
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vN = normalize(mat3(modelMatrix) * normal);
        vView = cameraPosition - wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: `
      uniform sampler2D mapA, mapB, granules;
      uniform float mixAB, time, days, close;
      uniform vec4 pA, pB; uniform vec3 tintA, tintB;
      varying vec2 vUv; varying vec3 vN; varying vec3 vView;
      const float PI = 3.14159265;
      // Snodgrass 较差自转（恒星自转率，度/天）
      float omega(float lat){ float s = sin(lat); s *= s; return 14.713 - 2.396 * s - 1.787 * s * s; }
      vec3 shade(sampler2D m, vec4 p, vec3 tint, vec2 uv, float mu){
        vec3 c = texture2D(m, uv).rgb;
        if (p.x > 0.5) c = vec3(c.r) * tint;
        c *= p.y;
        if (p.z < 0.5) {            // 可见光：临边昏暗，蓝光暗得更多，所以边缘发红
          vec3 u = vec3(0.56, 0.72, 0.86);
          c *= 1.0 - u * (1.0 - mu);
        } else if (p.z < 1.5) {     // 极紫外：光学薄，边缘略亮
          c *= 1.0 + 0.5 * pow(1.0 - mu, 2.0);
        }
        return c;
      }
      float granule(vec2 g){        // 两组错开的取样交替淡入淡出，看起来像在翻涌
        float k = 0.06, ph = fract(time * k);
        float n1 = floor(time * k), n2 = floor(time * k + 0.5);
        float s1 = texture2D(granules, g + vec2(0.37, 0.61) * n1 + ph * 0.015).r;
        float s2 = texture2D(granules, g + vec2(0.37, 0.61) * n2 + 0.5 + fract(ph + 0.5) * 0.015).r;
        float w = 1.0 - abs(2.0 * ph - 1.0);
        return mix(s2, s1, w);
      }
      void main(){
        float lat = (vUv.y - 0.5) * PI;
        vec2 uv = vec2(vUv.x - omega(lat) * days / 360.0, vUv.y);
        float mu = clamp(dot(normalize(vN), normalize(vView)), 0.0, 1.0);
        vec3 c = mix(shade(mapA, pA, tintA, uv, mu), shade(mapB, pB, tintB, uv, mu), mixAB);
        float det = mix(pA.w, pB.w, mixAB);
        if (det > 0.0) {
          float g = granule(uv * vec2(140.0, 70.0));
          c *= 1.0 + (g - 0.5) * det * (0.25 + 0.95 * close);
          c *= mix(1.0, 0.8, close * det);   // 凑近时压一点亮度，米粒才看得清
        }
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(SUN_R, 192, 128), sunMat);
  sun.add(sunMesh);

  // ============ 光晕与日冕（始终面向镜头的平面） ============
  // 镜头离得近时，球的轮廓在“过球心的平面”上看起来更大：limbScale = d / sqrt(d² - 1)
  const billboards = [];
  function addBillboard(mat, halfSize) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    mesh.userData.half = halfSize;
    mesh.renderOrder = 2;
    scene.add(mesh);
    billboards.push(mesh);
    return mesh;
  }

  const haloMat = new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Vector3(1, .6, .25) }, strength: { value: 1 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `
      uniform vec3 color; uniform float strength; varying vec2 vUv;
      void main(){
        float r = length(vUv * 2.0 - 1.0) * 6.0;      // 以太阳半径为单位
        if (r < 0.97) discard;
        float x = max(r - 0.985, 0.0);
        float g = 0.75 * exp(-x * 10.0) + 0.28 * exp(-x * 2.4) + 0.07 * exp(-x * 0.6);
        gl_FragColor = vec4(color * g * strength, 1.0);
      }`,
  });
  addBillboard(haloMat, 6);

  const coronaMeshes = {};
  Object.entries(CORONAS).forEach(([key, c]) => {
    const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    const mesh = addBillboard(mat, c.outer);
    mesh.visible = false;
    mesh.userData.target = 0;
    coronaMeshes[key] = mesh;
    if (c.gain) mat.color.setScalar(c.gain);   // 照片里的外冕很淡，提亮后交给辉光
    loadTex(c.src).then(t => { mat.map = t; mat.needsUpdate = true; });
  });

  // ============ 月亮（日全食） ============
  const moon = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48),
    new THREE.MeshBasicMaterial({ color: 0x0d0d0f }));
  moon.visible = false;
  scene.add(moon);
  loadTex('../textures/moon.jpg').then(t => { moon.material.map = t; moon.material.needsUpdate = true; });
  const eclipse = { on: false, slide: 1, from: 1, t0: 0 };   // slide：1 = 月亮在旁边，0 = 正好挡住

  // ============ 自转演示的小亮点 ============
  const LATS = [-60, -40, -20, 0, 20, 40, 60].map(d => d * Math.PI / 180);
  const omegaDeg = lat => { const s = Math.sin(lat) ** 2; return 14.713 - 2.396 * s - 1.787 * s * s; };
  const dotTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, '#ffffff'); grd.addColorStop(.3, '#9fe8ff'); grd.addColorStop(1, 'rgba(80,200,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const markers = LATS.map(lat => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, transparent: true, depthWrite: false }));
    s.scale.setScalar(lat === 0 ? 0.1 : 0.075);
    s.userData = { lat, u0: 0 };
    s.visible = false;
    sun.add(s);
    return s;
  });
  const trail = new THREE.Line(new THREE.BufferGeometry().setFromPoints(markers.map(() => new THREE.Vector3())),
    new THREE.LineBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: .55 }));
  trail.visible = false;
  sun.add(trail);
  const rotateDemo = { on: false };

  // 球面坐标：与 THREE.SphereGeometry 的 uv 约定一致
  function surfacePoint(u, lat, r) {
    const a = u * Math.PI * 2;
    return new THREE.Vector3(-Math.cos(a) * Math.cos(lat) * r, Math.sin(lat) * r, Math.sin(a) * Math.cos(lat) * r);
  }
  function startRotateDemo() {
    // 让一排亮点从镜头正对的经线出发
    const local = sun.worldToLocal(camera.position.clone()).normalize();
    const uFront = Math.atan2(local.z, -local.x) / (Math.PI * 2);
    markers.forEach(m => { m.userData.u0 = uFront - omegaDeg(m.userData.lat) * days / 360; });
  }
  function updateMarkers() {
    const pts = markers.map(m => {
      const u = m.userData.u0 + omegaDeg(m.userData.lat) * days / 360;
      const p = surfacePoint(u, m.userData.lat, 1.012);
      m.position.copy(p);
      return p;
    });
    trail.geometry.setFromPoints(pts);
  }

  // ============ 切换眼镜 ============
  let mode = 'visible', fading = null, switchToken = 0;
  function setUniforms(slot, m) {
    const cfg = MODES[m];
    sunUniforms['p' + slot].value.fromArray(cfg.p);
    sunUniforms['tint' + slot].value.fromArray(cfg.tint);
  }
  async function switchMode(next) {
    const token = ++switchToken;
    document.querySelectorAll('.lens').forEach(b => b.classList.toggle('active', b.dataset.mode === next));
    document.getElementById('btn-limb').hidden = next !== 'visible';
    if (next === mode && !fading) return;
    const tex = await mapTex(next);
    if (token !== switchToken) return;   // 等贴图期间孩子又点了别的眼镜
    if (fading) finishFade();
    sunUniforms.mapB.value = tex;
    setUniforms('B', next);
    fading = { from: performance.now(), to: next };
    mode = next;
    Object.entries(coronaMeshes).forEach(([key, mesh]) => {
      mesh.userData.target = key === MODES[next].corona ? 1 : 0;
    });
  }
  function finishFade() {
    sunUniforms.mapA.value = sunUniforms.mapB.value;
    setUniforms('A', mode);
    sunUniforms.mixAB.value = 0;
    fading = null;
  }

  // ============ 旁白（小晓 MP3，失败时浏览器语音兜底） ============
  const NARRATION = window.NARRATION || {};
  const narrator = new Audio();
  const caption = document.getElementById('caption');
  let soundOn = true, captionTimer = 0, zhVoice = null;
  function pickVoice() {
    const zh = speechSynthesis.getVoices().filter(v => /^zh([-_]|$)/i.test(v.lang));
    zhVoice = zh.find(v => /CN/i.test(v.lang)) || zh[0] || null;
  }
  if ('speechSynthesis' in window) { speechSynthesis.addEventListener('voiceschanged', pickVoice); pickVoice(); }
  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (zhVoice) u.voice = zhVoice;
    u.lang = 'zh-CN'; u.rate = 0.9; u.pitch = 1.1;
    speechSynthesis.speak(u);
  }
  function playAudio(src, fallbackText) {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    narrator.pause();
    if (!src) { speak(fallbackText); return; }
    narrator.src = src;
    narrator.currentTime = 0;
    narrator.onerror = () => speak(fallbackText);
    narrator.play().catch(() => speak(fallbackText));
  }
  function showCaption(text, ms) {
    caption.textContent = text;
    caption.classList.add('show');
    clearTimeout(captionTimer);
    captionTimer = setTimeout(() => caption.classList.remove('show'), ms);
  }
  let spokenOnce = false;
  function say(key) {
    const n = NARRATION[key];
    if (!n) { console.warn('缺少旁白', key); return; }
    spokenOnce = true;
    showCaption(n.text, Math.max(5000, n.text.length * 260));
    if (soundOn) playAudio(n.audio, n.text);
  }
  narrator.addEventListener('ended', () => { clearTimeout(captionTimer); captionTimer = setTimeout(() => caption.classList.remove('show'), 1500); });

  document.getElementById('btn-sound').onclick = e => {
    soundOn = !soundOn;
    e.currentTarget.textContent = soundOn ? '🔊' : '🔇';
    e.currentTarget.setAttribute('aria-label', soundOn ? '关闭声音' : '打开声音');
    if (!soundOn) { narrator.pause(); if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  };

  // ============ 按钮 ============
  document.querySelectorAll('.lens').forEach(btn => btn.addEventListener('click', () => {
    if (eclipse.on) toggleEclipse(false);
    switchMode(btn.dataset.mode);
    say(btn.dataset.mode);
  }));

  function toggleEclipse(on) {
    eclipse.on = on;
    eclipse.from = eclipse.slide;
    eclipse.t0 = performance.now();
    document.getElementById('btn-eclipse').classList.toggle('on', on);
    if (on) {
      switchMode('visible');
      moon.visible = true;
      say('eclipse');
    }
    coronaMeshes.eclipse.userData.target = on ? 1 : 0;
  }
  document.getElementById('btn-eclipse').onclick = () => toggleEclipse(!eclipse.on);

  document.getElementById('btn-rotate').onclick = e => {
    rotateDemo.on = !rotateDemo.on;
    e.currentTarget.classList.toggle('on', rotateDemo.on);
    if (rotateDemo.on) { startRotateDemo(); say('rotate'); }
    markers.forEach(m => { m.visible = rotateDemo.on; });
    trail.visible = rotateDemo.on;
  };

  // 镜头沿当前方向飞到目标距离
  let flight = null;
  function flyTo(dist) {
    flight = { from: camera.position.length(), to: dist, t0: performance.now(), dur: 2200 };
  }
  document.getElementById('btn-zoom').onclick = e => {
    const near = camera.position.length() < 1.6;
    e.currentTarget.classList.toggle('on', !near);
    flyTo(near ? HOME_DIST : CLOSE_DIST);
  };

  document.getElementById('btn-limb').onclick = () => say('limb');
  const parent = document.getElementById('parent');
  document.getElementById('btn-parent').onclick = () => parent.showModal();
  parent.addEventListener('click', e => { if (e.target === parent) parent.close(); });

  // 第一次触摸时播放欢迎语（浏览器要求用户先操作才能出声）
  canvas.addEventListener('pointerdown', () => { if (!spokenOnce) say('welcome'); }, { once: true });

  // 拍摄日期
  const frames = window.SUN_FRAMES;
  if (frames && frames.HMIIC) {
    const d = new Date(frames.HMIIC[0].time);
    document.getElementById('photo-date').textContent = `SDO 卫星照片 · ${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
  }

  // ============ 每帧更新 ============
  let days = 0, closeTriggered = false, last = performance.now();
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const tmpRight = new THREE.Vector3();

  function frame(now) {
    const rawDt = Math.min(1, (now - last) / 1000);
    const dt = Math.min(0.05, rawDt);
    const fade = 1 - Math.exp(-rawDt * 3.5);   // 淡入淡出与帧率无关
    last = now;
    days += dt * (rotateDemo.on ? DAYS_PER_SEC_DEMO : DAYS_PER_SEC);
    sunUniforms.time.value = now / 1000;
    sunUniforms.days.value = days;

    if (flight) {
      const t = Math.min(1, (now - flight.t0) / flight.dur);
      camera.position.setLength(flight.from + (flight.to - flight.from) * ease(t));
      if (t >= 1) flight = null;
    }
    controls.update();

    const d = camera.position.length();
    // 离得越近，转动越慢，方便看细节
    controls.rotateSpeed = 0.12 + 0.5 * THREE.MathUtils.clamp((d - 1.05) / 2.5, 0, 1);
    sunUniforms.close.value = THREE.MathUtils.clamp((1.9 - d) / 0.7, 0, 1);
    if (d < 1.45 && !closeTriggered && mode === 'visible') { closeTriggered = true; say('closeup'); }
    if (d > 2.2) closeTriggered = false;
    document.getElementById('btn-zoom').classList.toggle('on', d < 1.6);

    if (fading) {
      const t = Math.min(1, (now - fading.from) / 800);
      sunUniforms.mixAB.value = t;
      if (t >= 1) finishFade();
    }

    // 面向镜头的平面：大小随轮廓放大
    const limbScale = d / Math.sqrt(Math.max(d * d - SUN_R * SUN_R, 1e-4));
    billboards.forEach(b => {
      b.quaternion.copy(camera.quaternion);
      b.scale.setScalar(b.userData.half * limbScale);
    });

    // 光晕颜色和亮度
    const cfg = MODES[mode];
    const haloTarget = eclipse.on ? 0 : cfg.haloK;
    haloMat.uniforms.color.value.lerp(new THREE.Vector3().fromArray(cfg.halo), fade);
    haloMat.uniforms.strength.value += (haloTarget - haloMat.uniforms.strength.value) * fade;

    // 日全食：月亮滑进来正好盖住太阳
    const et = Math.min(1, (now - eclipse.t0) / 3500);
    eclipse.slide = eclipse.from + ((eclipse.on ? 0 : 1) - eclipse.from) * ease(et);
    if (moon.visible) {
      const dir = camera.position.clone().normalize();
      const moonDist = d * 0.4;
      const alpha = Math.asin(Math.min(1, SUN_R / d));
      const r = moonDist * Math.sin(alpha) * 1.006;   // 球的视半径 = asin(r / 距离)
      tmpRight.setFromMatrixColumn(camera.matrixWorld, 0);
      moon.position.copy(camera.position).addScaledVector(dir, -moonDist).addScaledVector(tmpRight, eclipse.slide * r * 2.6);
      moon.scale.setScalar(r);
      if (!eclipse.on && et >= 1) moon.visible = false;
    }
    const totality = eclipse.on ? THREE.MathUtils.clamp(1 - eclipse.slide / 0.06, 0, 1) : 0;

    Object.entries(coronaMeshes).forEach(([key, mesh]) => {
      const target = key === 'eclipse' ? totality : mesh.userData.target;
      const op = mesh.material.opacity + (target - mesh.material.opacity) * fade;
      mesh.material.opacity = op;
      mesh.visible = op > 0.005;
    });
    // 凑近时满屏都是亮面，辉光会把画面糊成一片白，所以随距离减弱
    const baseBloom = 0.5 * (1 - 0.9 * sunUniforms.close.value);
    bloom.strength = eclipse.on ? baseBloom + 0.3 * totality : baseBloom;

    if (rotateDemo.on) updateMarkers();

    composer.render();
    requestAnimationFrame(frame);
  }

  // ============ 尺寸 ============
  addEventListener('resize', () => {
    fitFov();
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
  });

  // ============ 启动 ============
  Promise.all([mapTex('visible'), loadTex('assets/granules-tile.jpg', THREE.RepeatWrapping)]).then(([vis, gran]) => {
    sunUniforms.mapA.value = sunUniforms.mapB.value = vis;
    sunUniforms.granules.value = gran;
    setUniforms('A', 'visible');
    setUniforms('B', 'visible');
    document.getElementById('loading').classList.add('done');
    showCaption('用手指拖一拖，转转太阳；两个手指张开，凑近看。', 6000);
    requestAnimationFrame(frame);
    // 其余眼镜在后台慢慢加载
    ['uv304', 'uv171', 'magnetic'].reduce((p, m) => p.then(() => mapTex(m)), Promise.resolve());
  }).catch(err => {
    console.error(err);
    document.querySelector('#loading span:last-child').textContent = '太阳照片没加载出来，请刷新试试';
  });
})();
