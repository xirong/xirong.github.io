/* 真实的太阳 · 外观（“长什么样”模块）
   球面贴图全部来自 NASA/SDO 真实照片（tools/build-textures.py 生成）；
   代码只负责光照（临边昏暗、辉光）、动画（较差自转、米粒翻涌）和交互。
   setup(ctx) 由 ../explorer/engine.js 调用。 */
window.SunLook = (() => {
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

  function setup(ctx) {
    const { scene, camera, controls, bloom, loadTex, say, ease } = ctx;
    camera.position.set(0.5, 0.45, HOME_DIST).setLength(HOME_DIST);
    const mapTex = mode => loadTex(MODES[mode].map, THREE.RepeatWrapping);

    // ============ 太阳球体 shader ============
    const sun = new THREE.Group();
    sun.rotation.y = -Math.PI / 2;   // 让最新一张照片的日面中心朝向 +z（初始镜头方向）
    scene.add(sun);

    const sunUniforms = Object.assign({
      mapA: { value: null }, mapB: { value: null }, mixAB: { value: 0 },
      pA: { value: new THREE.Vector4() }, pB: { value: new THREE.Vector4() },
      tintA: { value: new THREE.Vector3() }, tintB: { value: new THREE.Vector3() },
      granules: { value: null }, time: { value: 0 }, days: { value: 0 }, close: { value: 0 },
    }, ctx.cut.uniforms);
    const sunMat = new THREE.ShaderMaterial({
      uniforms: sunUniforms,
      vertexShader: `
        varying vec2 vUv; varying vec3 vN; varying vec3 vView; varying vec3 vWorld;
        void main(){
          vUv = uv;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          vN = normalize(mat3(modelMatrix) * normal);
          vView = cameraPosition - wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: `
        uniform sampler2D mapA, mapB, granules;
        uniform float mixAB, time, days, close;
        uniform vec4 pA, pB; uniform vec3 tintA, tintB;
        varying vec2 vUv; varying vec3 vN; varying vec3 vView; varying vec3 vWorld;
        const float PI = 3.14159265;
        ${ctx.cut.glsl}
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
          cutDiscard(vWorld);
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
    sun.add(new THREE.Mesh(new THREE.SphereGeometry(SUN_R, 192, 128), sunMat));

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
    const halo = addBillboard(haloMat, 6);

    const coronaMeshes = {};
    Object.entries(CORONAS).forEach(([key, c]) => {
      const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
      if (c.gain) mat.color.setScalar(c.gain);   // 照片里的外冕很淡，提亮后交给辉光
      const mesh = addBillboard(mat, c.outer);
      mesh.visible = false;
      mesh.userData.target = 0;
      coronaMeshes[key] = mesh;
      loadTex(c.src).then(t => { mat.map = t; mat.needsUpdate = true; });
    });

    // ============ 月亮（日全食） ============
    const moon = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), new THREE.MeshBasicMaterial({ color: 0x0d0d0f }));
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
    let days = 0;

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
        const p = surfacePoint(m.userData.u0 + omegaDeg(m.userData.lat) * days / 360, m.userData.lat, 1.012);
        m.position.copy(p);
        return p;
      });
      trail.geometry.setFromPoints(pts);
    }

    // ============ 切换眼镜 ============
    let mode = 'visible', fading = null, switchToken = 0;
    function setUniforms(slot, m) {
      sunUniforms['p' + slot].value.fromArray(MODES[m].p);
      sunUniforms['tint' + slot].value.fromArray(MODES[m].tint);
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
      fading = { from: performance.now() };
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
    ctx.hooks.setLook = switchMode;

    // ============ 按钮 ============
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
    }
    function toggleRotate(on, { silent } = {}) {
      rotateDemo.on = on;
      document.getElementById('btn-rotate').classList.toggle('on', on);
      if (on) { startRotateDemo(); if (!silent) say('rotate'); }
      markers.forEach(m => { m.visible = on; });
      trail.visible = on;
    }
    // 给场景模块用：藏起真实太阳（连同光晕、日冕、月亮）、打开自转演示
    let hidden = false;
    ctx.hooks.sun = {
      setVisible(v) { hidden = !v; sun.visible = v; if (!v) moon.visible = false; },
      setRotateDemo(on) { toggleRotate(on, { silent: true }); },
      reset() {
        this.setVisible(true);
        if (eclipse.on) toggleEclipse(false);
        if (rotateDemo.on) toggleRotate(false);
        switchMode('visible');
      },
    };
    document.querySelectorAll('.lens').forEach(btn => btn.addEventListener('click', () => {
      if (eclipse.on) toggleEclipse(false);
      switchMode(btn.dataset.mode);
      say(btn.dataset.mode);
    }));
    document.getElementById('btn-eclipse').onclick = () => toggleEclipse(!eclipse.on);
    document.getElementById('btn-rotate').onclick = () => toggleRotate(!rotateDemo.on);
    document.getElementById('btn-zoom').onclick = () => ctx.flyDist(camera.position.length() < 1.6 ? HOME_DIST : CLOSE_DIST);
    document.getElementById('btn-limb').onclick = () => say('limb');
    // 第一次触摸时播放欢迎语（浏览器要求用户先操作才能出声）
    document.getElementById('scene').addEventListener('pointerdown', () => {
      if (!ctx.spokenOnce && ctx.state.module === 'look') say('welcome');
    }, { once: true });

    // 拍摄日期
    let photoDate = '';
    const frames = window.SUN_FRAMES;
    if (frames && frames.HMIIC) {
      const d = new Date(frames.HMIIC[0].time);
      photoDate = `SDO 卫星照片 · ${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
    }

    // ============ “长什么样”模块 ============
    Explorer.registerModule('look', () => ({
      panel: '#look-panel',
      enter({ silent } = {}) {
        controls.enabled = true;
        controls.minDistance = 1.03;
        controls.maxDistance = 9;
        ctx.hooks.sun.setVisible(true);
        ctx.setSubtitle('长什么样 · ' + photoDate);
        // 从别的模块回来：镜头可能不在原位，飞回看着太阳的位置
        const back = controls.target.lengthSq() > 1e-6 || camera.position.length() < 1.3 || camera.position.length() > 9;
        if (back) ctx.flyTo(camera.position.clone().sub(controls.target).setLength(HOME_DIST), new THREE.Vector3(), 1600);
        if (!silent) say(mode === 'visible' ? 'look' : mode);
      },
      exit() {
        if (eclipse.on) toggleEclipse(false);
        if (rotateDemo.on) toggleRotate(false);
      },
    }));

    // ============ 每帧更新（不管在哪个模块） ============
    let closeTriggered = false;
    const tmpRight = new THREE.Vector3();
    ctx.onFrame((now, dt, rawDt) => {
      const fade = 1 - Math.exp(-rawDt * 3.5);   // 淡入淡出与帧率无关
      days += dt * (rotateDemo.on ? DAYS_PER_SEC_DEMO : DAYS_PER_SEC);
      sunUniforms.time.value = now / 1000;
      sunUniforms.days.value = days;

      const d = camera.position.length();
      const inside = d < 1.02 || ctx.cut.uniforms.cutAngle.value > 0.01;
      sunUniforms.close.value = THREE.MathUtils.clamp((1.9 - d) / 0.7, 0, 1);
      if (ctx.state.module === 'look') {
        // 离得越近，转动越慢，方便看细节
        controls.rotateSpeed = 0.12 + 0.5 * THREE.MathUtils.clamp((d - 1.05) / 2.5, 0, 1);
        if (d < 1.45 && !closeTriggered && mode === 'visible') { closeTriggered = true; say('closeup'); }
        if (d > 2.2) closeTriggered = false;
        document.getElementById('btn-zoom').classList.toggle('on', d < 1.6);
      }

      if (fading) {
        const t = Math.min(1, (now - fading.from) / 800);
        sunUniforms.mixAB.value = t;
        if (t >= 1) finishFade();
      }

      // 面向镜头的平面：大小随轮廓放大；镜头钻进去或剖开时收起来
      const limbScale = d / Math.sqrt(Math.max(d * d - SUN_R * SUN_R, 1e-4));
      billboards.forEach(b => {
        b.lookAt(camera.position);   // 正对镜头所在的位置（镜头转头看边缘时也不歪）
        b.scale.setScalar(b.userData.half * limbScale);
      });
      halo.visible = !inside && !hidden;

      const cfg = MODES[mode];
      haloMat.uniforms.color.value.lerp(new THREE.Vector3().fromArray(cfg.halo), fade);
      haloMat.uniforms.strength.value += ((eclipse.on ? 0 : cfg.haloK) - haloMat.uniforms.strength.value) * fade;

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
        const target = inside || hidden ? 0 : key === 'eclipse' ? totality : mesh.userData.target;
        const op = mesh.material.opacity + (target - mesh.material.opacity) * fade;
        mesh.material.opacity = op;
        mesh.visible = op > 0.005;
      });

      // 凑近时满屏都是亮面，辉光会把画面糊成一片白，所以随距离减弱
      const baseBloom = inside ? 0.18 : 0.5 * (1 - 0.9 * sunUniforms.close.value);
      bloom.strength = eclipse.on ? baseBloom + 0.3 * totality : baseBloom;

      if (rotateDemo.on) updateMarkers();
    });

    // ============ 先把可见光贴图和米粒贴图加载好 ============
    return Promise.all([mapTex('visible'), loadTex('assets/granules-tile.jpg', THREE.RepeatWrapping)]).then(([vis, gran]) => {
      sunUniforms.mapA.value = sunUniforms.mapB.value = vis;
      sunUniforms.granules.value = gran;
      setUniforms('A', 'visible');
      setUniforms('B', 'visible');
      ctx.showCaption('用手指拖一拖，转转太阳；两个手指张开，凑近看。', 6000);
      // 其余眼镜在后台慢慢加载
      ['uv304', 'uv171', 'magnetic'].reduce((p, m) => p.then(() => mapTex(m)), Promise.resolve());
    });
  }

  return { setup };
})();
