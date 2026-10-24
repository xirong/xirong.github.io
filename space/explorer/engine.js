/* 星球探索引擎（太阳、行星、卫星共用）
   负责：渲染器/镜头/辉光、星空、知识地图、模块切换、小晓旁白、字幕、家长看。
   每个星球页面只需提供：window.BODY 数据 + 自己的外观脚本（setup）+ 旁白 narration.js。
   用法见 README.md。 */
window.Explorer = (() => {
  'use strict';

  const factories = {};

  // ============ 注册模块 ============
  // factory(ctx) 返回 { name, panel, enter(), exit(), update(now, dt) }
  function registerModule(id, factory) {
    factories[id] = factory;
  }

  // ============ 外壳界面（顶栏、字幕、地图、加载） ============
  function buildChrome(body) {
    const top = document.createElement('header');
    top.className = 'top';
    top.innerHTML = `
      <div class="top-left">
        <a class="round" href="../../index.html" aria-label="返回学习乐园">🏠</a>
        <button id="btn-map" class="pill map-pill">🗺️ <span class="long">知识</span>地图</button>
      </div>
      <div class="title"><h1>${body.title}</h1><p id="subtitle"></p></div>
      <div class="top-right">
        <button id="btn-sound" class="round" aria-label="关闭声音">🔊</button>
        <button id="btn-parent" class="pill">家长看</button>
      </div>`;
    document.getElementById('scene').after(top);   // 放在画布后面，才不会被画布盖住

    const extra = document.createElement('div');
    extra.innerHTML = `
      <div id="loading" class="loading"><span class="spinner"></span><span>正在搬来${body.name}…</span></div>
      <p id="caption" class="caption" aria-live="polite"></p>
      <dialog id="map" class="map-sheet">
        <h2>${body.name}的知识地图</h2>
        <div class="map-grid">${body.map.map(m => `
          <button class="map-card${m.module || m.href ? '' : ' soon'}" data-id="${m.id}">
            <b>${m.icon}</b><span>${m.name}</span>${m.module || m.href ? '' : '<i>快来啦</i>'}
          </button>`).join('')}
        </div>
        <form method="dialog"><button class="map-close">关上地图</button></form>
      </dialog>`;
    document.body.append(...extra.children);
  }

  // ============ 启动 ============
  function start({ body, setup }) {
    buildChrome(body);
    const canvas = document.getElementById('scene');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.004, 300);
    // 竖屏时按宽度留出同样的视野，星球不会撑出屏幕
    function fitFov() {
      const a = innerWidth / innerHeight;
      camera.aspect = a;
      camera.fov = a >= 1 ? 38 : THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(19)) / a));
      camera.updateProjectionMatrix();
    }
    fitFov();

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
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
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

    // ============ 星空 ============
    loadTex('../textures/starfield.jpg').then(t => {
      scene.add(new THREE.Mesh(new THREE.SphereGeometry(150, 48, 32),
        new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, color: 0x3a3a3a, depthWrite: false })));
    });

    // ============ 剖开用的公共参数 ============
    // 剖面框架 frame 的局部坐标里，atan(z, x) 落在 (0, angle) 的楔形被挖掉。
    // 星球表面 shader 拼上 cut.glsl，并在 main() 开头调用 cutDiscard(世界坐标)。
    const cutFrame = new THREE.Object3D();
    scene.add(cutFrame);
    const cut = {
      frame: cutFrame,
      uniforms: { cutAngle: { value: 0 }, cutInv: { value: new THREE.Matrix4() } },
      glsl: `
        uniform float cutAngle; uniform mat4 cutInv;
        void cutDiscard(vec3 wp){
          if (cutAngle < 0.001) return;
          vec3 lp = (cutInv * vec4(wp, 1.0)).xyz;
          float a = atan(lp.z, lp.x);
          if (a > 0.0 && a < cutAngle) discard;
        }`,
    };

    // ============ 旁白（小晓 MP3，失败时浏览器语音兜底） ============
    const NARRATION = window.NARRATION || {};
    const narrator = new Audio();
    const caption = document.getElementById('caption');
    let soundOn = true, captionTimer = 0, zhVoice = null, spokenOnce = false;
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
    function say(key) {
      const n = NARRATION[key];
      if (!n) { console.warn('缺少旁白', key); return; }
      spokenOnce = true;
      showCaption(n.text, Math.max(5000, n.text.length * 260));
      if (soundOn) playAudio(n.audio, n.text);
    }
    narrator.addEventListener('ended', () => {
      clearTimeout(captionTimer);
      captionTimer = setTimeout(() => caption.classList.remove('show'), 1500);
    });
    document.getElementById('btn-sound').onclick = e => {
      soundOn = !soundOn;
      e.currentTarget.textContent = soundOn ? '🔊' : '🔇';
      e.currentTarget.setAttribute('aria-label', soundOn ? '关闭声音' : '打开声音');
      if (!soundOn) { narrator.pause(); if ('speechSynthesis' in window) speechSynthesis.cancel(); }
    };

    // ============ 镜头飞行（沿当前方向改变距离） ============
    let flight = null;
    const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    function flyDist(dist, dur = 2200) {
      flight = { from: camera.position.length(), to: dist, t0: performance.now(), dur };
    }

    // ============ ctx：交给星球脚本和模块使用 ============
    const frameHooks = [];
    const ctx = {
      body, scene, camera, controls, renderer, composer, bloom, cut,
      loadTex, say, showCaption, flyDist, ease,
      onFrame: fn => frameHooks.push(fn),
      setSubtitle: text => { document.getElementById('subtitle').textContent = text; },
      hooks: {},           // 星球脚本提供，例如 setLook(眼镜)
      state: { module: null, dist: camera.position.length() },
      get spokenOnce() { return spokenOnce; },
    };

    // ============ 模块切换 ============
    const modules = {};
    let current = null;
    function go(id, { silent } = {}) {
      const item = body.map.find(m => m.id === id && m.module);
      if (!item || !modules[item.module]) return;
      const next = modules[item.module];
      if (current === next) return;
      if (current) {
        current.exit && current.exit();
        if (current.panel) document.querySelector(current.panel).hidden = true;
      }
      current = next;
      ctx.state.module = item.module;
      if (next.panel) document.querySelector(next.panel).hidden = false;
      ctx.setSubtitle(item.name);
      document.querySelectorAll('.map-card').forEach(c => c.classList.toggle('active', c.dataset.id === id));
      history.replaceState(null, '', '#' + id);
      next.enter && next.enter({ silent });
    }
    ctx.go = go;
    window.__explorer = ctx;   // 方便在浏览器控制台里调试

    const mapDlg = document.getElementById('map');
    document.getElementById('btn-map').onclick = () => { mapDlg.showModal(); if (!spokenOnce) say('map'); };
    mapDlg.addEventListener('click', e => { if (e.target === mapDlg) mapDlg.close(); });
    document.querySelectorAll('.map-card').forEach(card => card.addEventListener('click', () => {
      const item = body.map.find(m => m.id === card.dataset.id);
      if (item.href) { location.href = item.href; return; }
      if (!item.module) {
        card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
        say('soon');
        return;
      }
      mapDlg.close();
      go(item.id);
    }));

    const parent = document.getElementById('parent');
    document.getElementById('btn-parent').onclick = () => parent && parent.showModal();
    if (parent) parent.addEventListener('click', e => { if (e.target === parent) parent.close(); });

    // ============ 每帧 ============
    let last = performance.now();
    function frame(now) {
      const rawDt = Math.min(1, (now - last) / 1000);
      const dt = Math.min(0.05, rawDt);
      last = now;

      if (flight) {
        const t = Math.min(1, (now - flight.t0) / flight.dur);
        camera.position.setLength(flight.from + (flight.to - flight.from) * ease(t));
        if (t >= 1) flight = null;
      }
      // 模块自己开镜头时（比如钻进去），不能让控制器把镜头推回最小距离外
      if (controls.enabled) controls.update();
      if (current && current.update) current.update(now, dt, rawDt);
      ctx.state.dist = camera.position.length();

      cutFrame.updateMatrixWorld();
      cut.uniforms.cutInv.value.copy(cutFrame.matrixWorld).invert();
      frameHooks.forEach(fn => fn(now, dt, rawDt));

      composer.render();
      requestAnimationFrame(frame);
    }

    addEventListener('resize', () => {
      fitFov();
      renderer.setSize(innerWidth, innerHeight);
      composer.setSize(innerWidth, innerHeight);
    });

    // ============ 星球脚本准备好后开始 ============
    Promise.resolve(setup(ctx)).then(() => {
      body.map.forEach(m => {
        if (m.module && factories[m.module] && !modules[m.module]) modules[m.module] = factories[m.module](ctx);
      });
      document.getElementById('loading').classList.add('done');
      const first = location.hash.slice(1);
      go(body.map.some(m => m.id === first && m.module) ? first : body.map.find(m => m.module).id, { silent: true });
      requestAnimationFrame(frame);
    }).catch(err => {
      console.error(err);
      document.querySelector('#loading span:last-child').textContent = '照片没加载出来，请刷新试试';
    });

    return ctx;
  }

  return { registerModule, start };
})();
