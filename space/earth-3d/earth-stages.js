/* 真实的地球 · 24 个场景模块的 3D 场景
   有多大多重、怎么动、会发生什么、和我们的关系、一生的故事、谁去研究过。
   每个函数接收 api（见 ../explorer/stage.js），把物体加进 api.root，返回 { update, action, slider, exit }。
   星球、照片都用真实贴图；比例做了缩小，场景里会用 api.live 说明“不是真实比例”。
   共享接口 ctx.hooks.sun 在主 agent 的地球页面里控制的是主地球（名字沿用了太阳的）。 */
window.EarthStages = (() => {
  'use strict';

  function setup(ctx) {
    const { loadTex } = ctx;
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const now = () => performance.now();
    const ease = ctx.ease;
    const clamp = THREE.MathUtils.clamp;
    const smooth = (a, b, x) => THREE.MathUtils.smoothstep(x, a, b);
    const hideSun = () => { if (ctx.hooks.sun) ctx.hooks.sun.setVisible(false); };
    // 月球直径约是地球的 27.3%，体积约 1/49，质量约 1/81
    const MOON_D = 0.2727;               // 月球直径 / 地球直径

    // ============ 小工具 ============
    function withTex(mat, src, key = 'map') {
      loadTex(src).then(t => { mat[key] = t; mat.needsUpdate = true; });
      return mat;
    }
    function ball(r, src, { lit = false, color = 0xffffff } = {}) {
      const mat = lit ? new THREE.MeshLambertMaterial({ color }) : new THREE.MeshBasicMaterial({ color });
      if (src) withTex(mat, src);
      return new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), mat);
    }
    const glowTex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const g = c.getContext('2d'), grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(.25, 'rgba(255,255,255,.7)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    })();
    function glow(color, size, { strength = 1 } = {}) {
      const m = new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      m.color.multiplyScalar(strength);
      const s = new THREE.Sprite(m);
      s.scale.setScalar(size);
      return s;
    }
    // 文字标签：按屏幕大小画，镜头远近都看得清
    function label(text, { color = '#cfe3f5', h = 0.028 } = {}) {
      const c = document.createElement('canvas'), g = c.getContext('2d');
      const font = '700 44px "Noto Sans SC", sans-serif';
      g.font = font;
      const w = Math.ceil(g.measureText(text).width) + 36;
      c.width = w; c.height = 64;
      g.font = font;
      g.fillStyle = 'rgba(6,10,16,.55)';
      g.beginPath(); g.roundRect ? g.roundRect(0, 0, w, 64, 32) : g.rect(0, 0, w, 64); g.fill();
      g.fillStyle = color; g.textBaseline = 'middle'; g.fillText(text, 18, 34);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false, sizeAttenuation: false }));
      s.scale.set(h * w / 64, h, 1);
      s.renderOrder = 10;
      return s;
    }
    function ring(r, color = 0xffffff, opacity = 0.25, seg = 128) {
      const pts = [];
      for (let i = 0; i <= seg; i++) { const a = i / seg * Math.PI * 2; pts.push(V(Math.cos(a) * r, 0, Math.sin(a) * r)); }
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
    }
    function lights(root, dir = [-5, 3, 4], amb = 0.35) {
      root.add(new THREE.AmbientLight(0xffffff, amb));
      const d = new THREE.DirectionalLight(0xffffff, 1.1);
      d.position.set(...dir);
      root.add(d);
      return d;
    }
    // 太阳（真实贴图的小太阳，地球页面里没有 sunBall，就贴 sun.jpg）
    function sunBall(r) {
      const m = ball(r, '../textures/sun.jpg');
      m.material.color.setScalar(1.6);   // 照片偏暗，提亮一点
      return m;
    }
    // 昼夜地球：白天贴图 + 夜晚城市灯光贴图，按太阳光方向混合
    function dayNightEarth(r, sunDir) {
      const u = { day: { value: null }, night: { value: null }, sunDir: { value: sunDir }, light: { value: 1 } };
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 96, 64), new THREE.ShaderMaterial({
        uniforms: u,
        vertexShader: 'varying vec2 vUv; varying vec3 vN; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `
          uniform sampler2D day, night; uniform vec3 sunDir; uniform float light;
          varying vec2 vUv; varying vec3 vN;
          void main(){
            float ndl = dot(normalize(vN), normalize(sunDir));
            vec3 d = texture2D(day, vUv).rgb * (0.05 + 1.2 * max(ndl, 0.0)) * smoothstep(-0.12, 0.25, ndl) * light;
            vec3 nt = texture2D(night, vUv).rgb;   // Black Marble：只取亮的城市灯光
            vec3 n = nt * smoothstep(0.16, 0.5, dot(nt, vec3(0.3, 0.59, 0.11))) * vec3(1.15, 0.95, 0.7) * 1.8 * (1.0 - smoothstep(-0.2, 0.15, ndl) * light);
            gl_FragColor = vec4(d + n, 1.0);
          }`,
      }));
      loadTex('assets/textures/day-4k.jpg').then(t => { u.day.value = t; });
      loadTex('assets/textures/night-4k.jpg').then(t => { u.night.value = t; });
      return { mesh, u };
    }
    // 经纬度 → 球面上的点（和 THREE.SphereGeometry + 等距柱状贴图的约定一致，经度 -180° 在 u = 0）
    function lonLat(lon, lat, r) {
      const a = (lon + 180) / 360 * Math.PI * 2, b = lat * Math.PI / 180;
      return V(-Math.cos(a) * Math.cos(b) * r, Math.sin(b) * r, Math.sin(a) * Math.cos(b) * r);
    }
    // 在真实的主地球上做场景（高清贴图、云、大气都是同一套）：停住自转，挂上去的东西退出时摘掉
    function mainEarth(api) {
      const h = ctx.hooks.sun, surface = h.surface, attached = [];
      h.setSpin(false);
      surface.updateMatrixWorld(true);
      return {
        surface,
        // 某个经纬度在世界坐标里的位置，以及那里的“上、东、北”方向
        point(lon, lat) {
          const pos = surface.localToWorld(lonLat(lon, lat, 1));
          const normal = pos.clone().normalize();
          const east = lonLat(lon + 0.5, lat, 1).sub(lonLat(lon - 0.5, lat, 1)).transformDirection(surface.matrixWorld);
          return { pos, normal, east, north: normal.clone().cross(east).normalize() };
        },
        sun: v => h.setSunDir(v),
        clouds: on => h.setClouds(on),
        attach(o) { surface.add(o); attached.push(o); },
        done() {
          attached.forEach(o => {
            surface.remove(o);
            o.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
          });
          h.setSpin(true);
        },
      };
    }
    // 人造卫星（卫星与空间站共用的小模型）
    function satellite(color = 0xd8b04a) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.12), new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.35 }));
      const panelMat = new THREE.MeshStandardMaterial({ color: 0x1d3c8f, metalness: 0.3, roughness: 0.4, side: THREE.DoubleSide });
      [-1, 1].forEach(s => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.008, 0.1), panelMat);
        p.position.x = s * 0.18;
        g.add(p);
      });
      const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.01, 0.02, 16), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
      dish.position.set(0, 0.1, 0);
      g.add(body, dish);
      return g;
    }

    // ============ 有多大多重 ============
    const S = {};
    S.size_line = api => {
      hideSun();
      api.fly([0.75, 0, 5.4], [0.75, 0, 0]);
      lights(api.root, [3, 4, 6], 0.7);
      const earth = ball(1, 'assets/textures/day-4k.jpg', { lit: true });
      api.root.add(earth);
      // 月球竖着排在地球旁边（和地球离镜头一样远，大小才比得准）；两条横线标出地球的上下边
      const COL = 1.55;
      const lineMat = new THREE.LineBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 0.8 });
      [-1, 1].forEach(y => api.root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, y, 0), V(COL + 0.5, y, 0)]), lineMat)));
      const dia = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(COL + 0.45, -1, 0), V(COL + 0.45, 1, 0)]), lineMat);
      // 月球用真实比例：直径约是地球的 0.273。从南极往上排，第 4 个只放得进大半个
      const n = 4, mr = MOON_D;
      const moonGeo = new THREE.SphereGeometry(mr, 32, 20);
      const moonMat = withTex(new THREE.MeshLambertMaterial(), '../textures/moon.jpg');
      const moons = [];
      for (let i = 0; i < n; i++) {
        const m = new THREE.Mesh(moonGeo, moonMat);
        m.userData.target = V(COL, -1 + mr + i * mr * 2, 0);
        m.userData.start = m.userData.target.clone().add(V(2.5, 0, 0));
        m.position.copy(m.userData.start);
        m.scale.setScalar(0.001);
        api.root.add(m);
        moons.push(m);
      }
      const over = label('多出来一点', { h: 0.024 });
      over.position.set(COL - 0.2, 1.22, 0);
      over.visible = false;
      api.root.add(dia, over);
      let t0 = 0;
      api.live('月球直径约 3,475 公里，地球约 12,742 公里。点“🌙 排排队”');
      return {
        action() { t0 = now(); },
        update(t, dt) {
          earth.rotation.y += dt * 0.1;
          if (!t0) return;
          const seconds = (now() - t0) / 1000;
          let placed = 0;
          moons.forEach((m, i) => {
            const k = ease(clamp((seconds - i * 0.6) / 0.8, 0, 1));
            m.position.lerpVectors(m.userData.start, m.userData.target, k);
            m.scale.setScalar(Math.max(0.001, k));
            if (k >= 1) placed++;
          });
          over.visible = placed === n;
          api.live(placed < n
            ? `🌙 排了 <b>${placed}</b> 个月球……`
            : '🌙 3 个排不满，第 4 个只放得进大半个：地球直径 ≈ <b>3.7</b> 个月球');
        },
      };
    };

    S.size_fill = api => {
      hideSun();
      api.fly([0, 0.4, 4.2]);
      lights(api.root, [3, 5, 6], 0.6);
      // 按体积换算约 49 个月球装得下一个地球（知识点不变）。
      // 真实等体积小球（半径≈0.27）会互相穿插，所以显示球缩小、层距放大，仅作示意；
      // 数量严格 49：1 个球心 + 6 个内层 + 42 个外层，任意两颗最终都不相碰：
      // 球心距 0.34 ≥ 2×0.16；内外层最小间距 0.72-0.34=0.38；外层 42 颗黄金螺旋最小间距≈0.43。
      const MR = 0.16, INNER_R = 0.34, PACK_R = 0.72;
      const GOLDEN = Math.PI * (3 - Math.sqrt(5));
      const slots = [{ target: V(0, 0, 0) }];
      [[6, INNER_R], [42, PACK_R]].forEach(([count, radius], si) => {
        for (let i = 0; i < count; i++) {
          const y = 1 - 2 * (i + 0.5) / count;
          const rr = Math.sqrt(Math.max(0, 1 - y * y));
          const a = i * GOLDEN + si * 0.7;
          slots.push({ target: V(Math.cos(a) * rr * radius, y * radius, Math.sin(a) * rr * radius) });
        }
      });
      // 每颗独立出发，从上往下掉进球里
      const POUR = 9;
      slots.forEach((s, i) => {
        s.start = V(s.target.x * 0.8 + (Math.random() - .5) * 0.2, 1.9 + Math.random() * 0.25, s.target.z * 0.8 + (Math.random() - .5) * 0.2);
        s.fall = Math.sqrt(2 * Math.max(0.1, s.start.y - s.target.y) / 7.5);
        s.delay = i / slots.length * POUR;
        s.turn = i * GOLDEN;
      });
      const moons = new THREE.InstancedMesh(new THREE.SphereGeometry(MR, 10, 8), withTex(new THREE.MeshLambertMaterial(), '../textures/moon.jpg'), slots.length);
      moons.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      const matrix = new THREE.Matrix4(), q = new THREE.Quaternion(), yAxis = V(0, 1, 0);
      const pos = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1), hidden = new THREE.Matrix4().makeScale(0, 0, 0);
      slots.forEach((s, i) => moons.setMatrixAt(i, hidden));
      // 半透明地球外壳：能看出月球倒进了地球的范围
      const shellMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32),
        new THREE.MeshBasicMaterial({ color: 0x2e6fd8, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }));
      const wire = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(1.001, 24, 16)),
        new THREE.LineBasicMaterial({ color: 0x6fa8ff, transparent: true, opacity: 0.25 }));
      const g = new THREE.Group();
      g.add(shellMesh, wire, moons);
      api.root.add(g);
      let t0 = 0, settled = false;
      api.live('约 49 个月球才装得下一个地球（大小和排布仅示意）。点“🫙 往里装”');
      return {
        action() { t0 = now(); settled = false; slots.forEach((s, i) => moons.setMatrixAt(i, hidden)); moons.instanceMatrix.needsUpdate = true; g.rotation.y = 0; },
        update(t, dt) {
          if (settled) { g.rotation.y += dt * 0.05; return; }
          if (!t0) return;
          const seconds = (now() - t0) / 1000;
          let landed = 0;
          slots.forEach((s, i) => {
            const age = seconds - s.delay;
            if (age < 0) { moons.setMatrixAt(i, hidden); return; }
            const k = clamp(age / s.fall, 0, 1);
            if (k >= 1) landed++;
            pos.lerpVectors(s.start, s.target, k * k);
            pos.y += Math.sin(clamp((age - s.fall) / 0.15, 0, 1) * Math.PI) * MR * 0.3;
            q.setFromAxisAngle(yAxis, s.turn + age);
            matrix.compose(pos, q, one);
            moons.setMatrixAt(i, matrix);
          });
          moons.instanceMatrix.needsUpdate = true;
          api.live(`🫙 已经装了 <b>${landed}</b> / ${slots.length} 个月球${landed >= slots.length ? ' —— 装满啦！（按体积换算约 49 个）' : ''}`);
          if (landed >= slots.length) settled = true;
        },
      };
    };

    S.size_mass = api => {
      hideSun();
      api.fly([0, 0.6, 9.5], [0, -0.5, 0]);
      lights(api.root, [3, 6, 6], 0.55);
      const wood = new THREE.MeshStandardMaterial({ color: 0xc9a46a, metalness: 0.2, roughness: 0.6 });
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 2.6, 16), wood);
      post.position.y = -1.3;
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.15, 32), wood);
      base.position.y = -2.6;
      const beam = new THREE.Group();
      beam.add(new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.1, 0.12), wood));
      const pans = [-3, 3].map(x => {
        const g = new THREE.Group();
        g.position.x = x;
        const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.75, 0.08, 32), new THREE.MeshStandardMaterial({ color: 0xd7c08a, metalness: 0.5, roughness: 0.3 }));
        pan.position.y = -1.35;
        const strings = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), V(-0.85, -1.35, 0), V(0, 0, 0), V(0.85, -1.35, 0)]), new THREE.LineBasicMaterial({ color: 0xbbbbbb }));
        g.add(pan, strings);
        beam.add(g);
        return g;
      });
      // 左边挂一个地球
      const earth = ball(0.62, 'assets/textures/day-4k.jpg', { lit: true });
      earth.position.y = -0.72;
      pans[0].add(earth);
      // 右边堆 81 个月球
      const mr = 0.62 * MOON_D, panTop = -1.31;   // 月球按真实大小画
      const heapPositions = [];
      const rowStep = Math.sqrt(3) * mr, layerStep = Math.sqrt(8 / 3) * mr;
      for (let layer = 0; layer < 14 && heapPositions.length < 81; layer++) {
        const shrink = Math.max(0.2, 0.95 - layer * 0.11), y = panTop + mr + layer * layerStep;
        const shift = layer % 2 ? mr : 0;
        for (let row = -6; row <= 6; row++) {
          const z = row * rowStep;
          const rowOff = Math.abs(row) % 2 * mr;
          for (let col = -6; col <= 6; col++) {
            const x = col * mr * 2 + rowOff + shift;
            if (Math.hypot(x, z) <= 0.98 * shrink + 1e-6 && heapPositions.length < 81) heapPositions.push(V(x, y, z));
          }
        }
      }
      const heap = new THREE.InstancedMesh(new THREE.SphereGeometry(mr, 10, 8), withTex(new THREE.MeshLambertMaterial(), '../textures/moon.jpg'), heapPositions.length);
      const m4 = new THREE.Matrix4();
      heapPositions.forEach((p, i) => { m4.setPosition(p); heap.setMatrixAt(i, m4); });
      heap.count = 0;
      pans[1].add(heap);
      const tagL = label('1 个地球'), tagR = label(`${heapPositions.length} 个月球`);
      tagL.position.set(-3, -2.2, 0.9); tagR.position.set(3, -2.2, 0.9);
      api.root.add(post, base, beam, tagL, tagR);
      beam.rotation.z = 0.3;   // 一开始地球这边沉下去
      let t0 = 0;
      api.live('一个地球 ≈ 81 个月球那么重。点“⚖️ 放月球”');
      return {
        action() { t0 = now(); },
        update() {
          const k = t0 ? ease(clamp((now() - t0) / 7000, 0, 1)) : 0;
          beam.rotation.z = 0.3 * (1 - k);
          pans.forEach(p => { p.rotation.z = -beam.rotation.z; });   // 秤盘保持水平
          heap.count = Math.round(heapPositions.length * k);
          if (t0) api.live(`⚖️ 放了 <b>${heap.count}</b> / ${heapPositions.length} 个月球${k >= 1 ? ' —— 平啦！' : ''}`);
        },
      };
    };

    S.size_weight = api => {
      hideSun();
      const home = [[0, 0.6, 7], [0, 0, 0]];
      api.fly(...home);
      lights(api.root, [3, 5, 6], 0.55);
      const moon = ball(0.5, '../textures/moon.jpg', { lit: true });
      moon.position.set(-2.9, 0, 0);
      const earth = ball(1, 'assets/textures/day-4k.jpg', { lit: true });
      earth.position.set(0, 0, 0);
      const mars = ball(0.55, '../textures/mars.jpg', { lit: true });
      mars.position.set(2.9, 0, 0);
      const tags = [['🌙 月球', moon, 0.85], ['🌍 地球', earth, 1.45], ['🔴 火星', mars, 0.95]].map(([t, o, dy]) => {
        const l = label(t); l.position.copy(o.position).add(V(0, -dy, 0)); return l;
      });
      api.root.add(moon, earth, mars, ...tags);
      const G = { moon: 0.165, earth: 1, mars: 0.379 };
      let kg = 20, pick = 'earth';
      const fmt = v => (v < 10 ? v.toFixed(1) : Math.round(v));
      function show() {
        api.live(['moon', 'earth', 'mars'].map(k => {
          const name = { moon: '🌙 月球', earth: '🌍 地球', mars: '🔴 火星' }[k];
          const v = `重力 ${G[k]} 倍 → ${fmt(kg * G[k])} 公斤`;
          return k === pick ? `<span class="big">${name}：<b>${v}</b></span>` : `${name}：${v}`;
        }).join('<br>'));
      }
      show();
      const views = { moon: [[-2.9, 0.3, 2.2], [-2.9, 0, 0]], earth: [[0, 0.4, 3.6], [0, 0, 0]], mars: [[2.9, 0.3, 2.4], [2.9, 0, 0]] };
      return {
        slider(v) { kg = v; show(); },
        action(id) { pick = id; show(); api.fly(...views[id], 1400); },
        update(t, dt) { earth.rotation.y += dt * 0.15; moon.rotation.y += dt * 0.05; mars.rotation.y += dt * 0.12; },
      };
    };

    S.size_far = api => {
      hideSun();
      api.fly([0, 3, 14], [0, 0, 0]);
      const earth = ball(0.5, 'assets/textures/day-4k.jpg');
      earth.position.set(-4, 0, 0);
      const moon = ball(0.135, '../textures/moon.jpg');
      moon.position.set(4, 0, 0);
      const path = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(-3.7, 0, 0), V(3.85, 0, 0)]),
        new THREE.LineDashedMaterial({ color: 0xcfe3f5, dashSize: 0.25, gapSize: 0.18, transparent: true, opacity: 0.5 }));
      path.computeLineDistances();
      const photon = glow(0xfff1b0, 0.5, { strength: 1.6 });
      photon.visible = false;
      const flash = glow(0x9fd0ff, 1);
      flash.position.copy(moon.position);
      flash.material.opacity = 0;
      const tagE = label('地球'), tagM = label('月球');
      tagE.position.set(-4, -0.8, 0); tagM.position.set(4, -0.45, 0);
      api.root.add(earth, moon, path, photon, flash, tagE, tagM);
      let t0 = 0;
      api.live('地月距离约 38.4 万公里（画面压缩了）。点“💡 出发”，让光跑一趟');
      return {
        action() { t0 = now(); photon.visible = true; },
        update(t, dt) {
          earth.rotation.y += dt * 0.1;
          if (!t0) return;
          const k = clamp((now() - t0) / 8000, 0, 1);   // 8 秒演示 1.3 秒
          photon.position.set(-3.7 + 7.55 * k, 0, 0);
          api.live(`⏱️ 光跑了 <b>${(1.3 * k).toFixed(2)} 秒</b>${k >= 1 ? '　🚀 坐飞机要飞约 18 天！' : ''}（8 秒演示 1.3 秒）`);
          flash.material.opacity = k >= 1 ? Math.max(0, 1 - (now() - t0 - 8000) / 1500) : 0;
        },
      };
    };

    // ============ 怎么动 ============
    S.motion_spin = api => {
      hideSun();
      api.fly([-1.6, 1.0, 4.4], [-0.2, 0, 0]);   // 正对晨昏线，白天黑夜各一半
      const sunPos = V(-8, 1.5, 3);   // 太阳从侧面照过来
      const sun = sunBall(1.1);
      sun.position.copy(sunPos);
      const { mesh: earth } = dayNightEarth(1.4, sunPos.clone().normalize());
      // 北京：钉在地球上，跟着地球一起转；转到背面会被地球挡住
      const city = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff5a4a, transparent: true, depthWrite: false }));
      city.scale.setScalar(0.12);
      city.position.copy(lonLat(116.4, 39.9, 1.41));
      const tag = label('北京', { h: 0.024 });
      tag.material.depthTest = true;   // 转到背面时也被地球挡住
      tag.position.copy(lonLat(116.4, 39.9, 1.6));
      earth.add(city, tag);
      api.root.add(sun, earth);
      const DAY_SEC = 12;               // 12 秒演示一昼夜
      let t0 = 0, start = 0;
      api.live('地球自西向东转，一圈约 24 小时。点“⏩ 转一天”');
      return {
        action() { t0 = now(); start = earth.rotation.y; },
        update(t, dt) {
          if (!t0) { earth.rotation.y += dt * 0.08; return; }
          const k = Math.min(1, (now() - t0) / 1000 / DAY_SEC);
          earth.rotation.y = start + k * Math.PI * 2;   // 从北极上方看是逆时针，太阳从东边升起
          const hour = Math.min(24, Math.floor(k * 24));
          api.live(`🕐 转了 <b>${hour}</b> / 24 小时${k >= 1 ? ' —— 北京又转回到了原来的位置' : ''}`);
          if (k >= 1) t0 = 0;
        },
      };
    };

    S.motion_year = api => {
      hideSun();
      api.fly([0, 10.5, 12], [0.6, 0, 0]);
      api.root.add(new THREE.AmbientLight(0xffffff, 0.22));
      api.root.add(new THREE.PointLight(0xfff2dd, 1.6, 0, 0));
      const sun = sunBall(0.9);
      api.root.add(sun);
      const TILT = 23.5 * Math.PI / 180, D = 4.2;
      api.root.add(ring(D, 0xcfe3f5, 0.25));
      // 地轴歪 23.5°，公转时指向不变（一直指着北极星方向）。北极歪向 -x，所以地球在 +x 时北半球是夏天
      const pivot = new THREE.Group();
      const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.7, 8), new THREE.MeshBasicMaterial({ color: 0xffe9a0 }));
      const north = label('北', { h: 0.022 });
      north.position.y = 0.95;
      const { mesh: earth, u } = dayNightEarth(0.6, V(1, 0, 0));
      const tiltG = new THREE.Group();
      tiltG.rotation.z = TILT;
      tiltG.add(axis, earth, north);
      pivot.add(tiltG);
      api.root.add(pivot);
      // 从北极上方看，地球逆时针公转：春分 → 夏至 → 秋分 → 冬至（北半球）
      const SEASONS = [['春分 · 3 月', Math.PI / 2], ['夏至 · 6 月', 0], ['秋分 · 9 月', -Math.PI / 2], ['冬至 · 12 月', Math.PI]];
      SEASONS.forEach(([name, a]) => {
        const l = label(name, { h: 0.026 });
        l.position.set(Math.cos(a) * D, -0.9, Math.sin(a) * D);
        api.root.add(l);
      });
      const MONTHS = ['3 月', '4 月', '5 月', '6 月', '7 月', '8 月', '9 月', '10 月', '11 月', '12 月', '1 月', '2 月'];
      const YEAR_SEC = 16;              // 16 秒演示一年
      let a = Math.PI / 2, t0 = 0;
      const place = () => {
        pivot.position.set(Math.cos(a) * D, 0, Math.sin(a) * D);
        u.sunDir.value.copy(pivot.position).multiplyScalar(-1).normalize();
      };
      place();
      api.live('地轴歪着 23.5°，而且一直指向同一个方向。点“⏩ 过一年”');
      return {
        action() { t0 = now(); a = Math.PI / 2; place(); },
        update(t, dt) {
          earth.rotation.y += dt * 0.6;
          if (t0) {
            const k = clamp((now() - t0) / 1000 / YEAR_SEC, 0, 1);
            a = Math.PI / 2 - k * Math.PI * 2;
            place();
            const m = Math.min(11, Math.floor(k * 12));
            const summer = Math.cos(a) > 0.92, winter = Math.cos(a) < -0.92;
            api.live(`📅 北半球 <b>${MONTHS[m]}</b>${summer ? ' · 北极歪向太阳：夏天' : winter ? ' · 北极背着太阳：冬天' : ''}${k >= 1 ? ' —— 一年过去啦！' : ''}`);
            if (k >= 1) t0 = 0;
          } else {
            a -= dt * 0.05; place();
          }
        },
      };
    };

    S.motion_moon = api => {
      hideSun();
      api.fly([0.8, 6.5, 6.5], [0.8, 0, 0]);
      const sunDir = V(-3, 1, 4).normalize();
      const d = lights(api.root, sunDir.clone().multiplyScalar(10).toArray(), 0.12);
      d.intensity = 1.3;
      const { mesh: earth } = dayNightEarth(1, sunDir);
      const D = 3.2;                    // 压缩了：真实距离约 30 个地球直径
      api.root.add(earth, ring(D, 0xcfe3f5, 0.4));
      const moon = ball(MOON_D, '../textures/moon.jpg', { lit: true });
      api.root.add(moon);
      const MONTH_SEC = 10;             // 10 秒演示 27.3 天
      let a = 0, t0 = 0;
      api.live('月球绕地球一圈约 27.3 天，总是同一面朝着地球（距离压缩了）。点“⏩ 转一圈”');
      return {
        action() { t0 = now(); a = 0; },
        update(t, dt) {
          earth.rotation.y += dt * 0.25;
          if (t0) {
            const k = clamp((now() - t0) / 1000 / MONTH_SEC, 0, 1);
            a = -k * Math.PI * 2;        // 从北极上方看逆时针
            const day = Math.min(27, Math.floor(k * 27.3) + 1);
            api.live(`🗓️ 第 <b>${day}</b> / 27 天${k >= 1 ? ' —— 转回来啦！月相变一轮还要再多两天，约 29.5 天' : ''}`);
            if (k >= 1) t0 = 0;
          } else {
            a -= dt * 0.12;
          }
          moon.position.set(Math.cos(a) * D, 0, Math.sin(a) * D);
          moon.rotation.y = -a - Math.PI;   // 潮汐锁定：贴图正面（月球正面）一直朝着地球
        },
      };
    };

    // ============ 会发生什么 ============
    S.act_quake = api => {
      hideSun();
      api.fly([0, 4.2, 7.5], [0, -0.3, 0]);
      lights(api.root, [3, 6, 5], 0.5);
      // 两块板块沿断层（x = 0）一前一后地错开：边上被卡住，岩石一点点被拧弯，卡不住时突然滑开
      const rock = new THREE.MeshStandardMaterial({ color: 0x8a6f4d, roughness: 0.9 });
      const grass = new THREE.MeshStandardMaterial({ color: 0x6f8a4a, roughness: 1 });
      const plates = [-1, 1].map(side => {
        const g = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(3, 0.7, 3), rock);
        body.position.set(side * 1.52, -0.35, 0);
        const top = new THREE.Mesh(new THREE.BoxGeometry(3, 0.04, 3), grass);
        top.position.set(side * 1.52, 0.02, 0);
        g.add(body, top);
        api.root.add(g);
        return g;
      });
      // 房子放在板块上，跟着板块一起动
      const houses = [];
      [[-2.3, 0.7, 0], [-1, -0.8, 0], [1.1, 0.8, 1], [2.3, -0.5, 1]].forEach(([x, z, p]) => {
        const h = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, 0.28), new THREE.MeshStandardMaterial({ color: 0xd8c9a8 }));
        h.position.set(x, 0.16, z);
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.16, 4), new THREE.MeshStandardMaterial({ color: 0xb5502e }));
        roof.position.y = 0.2; roof.rotation.y = Math.PI / 4;
        h.add(roof);
        plates[p].add(h);
        houses.push(h);
      });
      // 横穿断层的一条路：看它先被拧弯，再突然断开错位
      // 路是一条有宽度的带子：每个截面两个点（z ± 0.09）
      const N = 61, roadPts = [], roadIdx = [];
      for (let i = 0; i < N; i++) { const x = -3 + 6 * i / (N - 1); roadPts.push(V(x, 0.06, -0.09), V(x, 0.06, 0.09)); }
      for (let i = 0; i < N - 1; i++) { const a = i * 2; roadIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      const roadGeo = new THREE.BufferGeometry().setFromPoints(roadPts);
      roadGeo.setIndex(roadIdx);
      const road = new THREE.Mesh(roadGeo, new THREE.MeshBasicMaterial({ color: 0x3b3b40, side: THREE.DoubleSide }));
      const fault = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, 0.05, -1.5), V(0, 0.05, 1.5)]),
        new THREE.LineDashedMaterial({ color: 0xff6a4a, dashSize: 0.12, gapSize: 0.08 }));
      fault.computeLineDistances();
      const waves = [0, 1, 2].map(() => {
        const w = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 64),
          new THREE.MeshBasicMaterial({ color: 0xffd76b, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
        w.rotation.x = -Math.PI / 2;
        w.position.y = 0.07;
        api.root.add(w);
        return w;
      });
      api.root.add(road, fault);
      const LOAD = 4, SLIP = 0.3;        // 4 秒慢慢拧，最后错开 0.3
      let t0 = 0;
      const drawRoad = (far, near) => {
        // far：远处板块已经走了多少；near：断层旁边跟上了多少（卡住时为 0）
        const p = roadGeo.attributes.position;
        for (let i = 0; i < N; i++) {
          const x = -3 + 6 * i / (N - 1), side = Math.sign(x) || 1;
          const bend = Math.tanh(Math.abs(x) / 0.9);       // 离断层越远，跟着板块走得越多
          const z = side * (near + (far - near) * bend);
          p.setZ(i * 2, z - 0.09); p.setZ(i * 2 + 1, z + 0.09);
        }
        p.needsUpdate = true;
      };
      drawRoad(0, 0);
      api.live('一条路横跨断层。点“💥 模拟地震”');
      return {
        action() { t0 = now(); },
        update(t, dt) {
          if (!t0) return;
          const s = (now() - t0) / 1000;
          const far = SLIP / 2 * smooth(0, LOAD, s);                    // 板块慢慢错开
          const near = s > LOAD ? SLIP / 2 * smooth(LOAD, LOAD + 0.25, s) : 0;   // 卡不住了，一下子滑开
          drawRoad(far, near);
          plates[0].position.z = -near; plates[1].position.z = near;
          const jolt = s > LOAD ? 0.25 * Math.exp(-(s - LOAD) * 2) : 0;
          houses.forEach((h, i) => { h.rotation.z = jolt * Math.sin(i * 1.7 + s * 22); });
          waves.forEach((w, i) => {
            const wt = (s - LOAD - i * 0.45) / 2.2;
            w.material.opacity = wt > 0 && wt < 1 ? (1 - wt) * 0.85 : 0;
            w.scale.setScalar(0.3 + clamp(wt, 0, 1) * 3.6);
          });
          api.live(s <= LOAD ? '🤏 板块在慢慢错开，断层旁边卡住了，路被一点点拧弯……'
            : s < LOAD + 3 ? '💥 卡不住了！岩石一下子滑开，路断成两截，地震波一圈圈传开'
            : '地震过去了，路被错开了。再点“💥 模拟地震”看一次');
          if (s > LOAD + 6) { t0 = 0; }
        },
      };
    };

    S.act_volcano = api => {
      hideSun();
      api.fly([0.4, 1.2, 8], [0, -0.6, 0]);
      lights(api.root, [4, 6, 5], 0.55);
      // 火山剖面：山体是固体岩石，中间一根细细的岩浆通道，地下深处有岩浆房
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x6d5a44, roughness: 0.95, side: THREE.DoubleSide });
      const cone = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2.2, 48, 1, true, Math.PI / 2, Math.PI), rockMat);   // 后半个山体
      const cutMat = new THREE.MeshStandardMaterial({ color: 0x8a7458, roughness: 1, side: THREE.DoubleSide });
      const shape = new THREE.Shape();
      shape.moveTo(-2.2, -1.1); shape.lineTo(2.2, -1.1); shape.lineTo(0.18, 1.0); shape.lineTo(-0.18, 1.0); shape.closePath();
      const cut = new THREE.Mesh(new THREE.ShapeGeometry(shape), cutMat);   // 正对镜头的剖面
      // 地下：一块切开的地层，里面是岩浆房
      const crust = new THREE.Mesh(new THREE.BoxGeometry(9, 1.6, 4), new THREE.MeshStandardMaterial({ color: 0x5b4a3a, roughness: 1 }));
      crust.position.set(0, -1.9, -2);
      const grass = new THREE.Mesh(new THREE.BoxGeometry(9, 0.04, 4), new THREE.MeshStandardMaterial({ color: 0x4d6b3a, roughness: 1 }));
      grass.position.set(0, -1.1, -2);
      const magmaMat = new THREE.MeshStandardMaterial({ color: 0xd8501a, emissive: 0xff4a10, emissiveIntensity: 0.45, side: THREE.DoubleSide });
      const chamber = new THREE.Mesh(new THREE.CircleGeometry(1, 48), magmaMat);
      chamber.scale.set(1.1, 0.38, 1);
      chamber.position.set(0, -2.15, 0.01);
      const conduit = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 3.2), magmaMat);
      conduit.position.set(0, -0.6, 0.012);
      const crater = glow(0xff9a4a, 0.7, { strength: 1.4 });
      crater.position.set(0, 1.05, 0);
      const tags = [['岩浆房', [1.6, -2.15, 0.05]], ['岩浆通道', [0.85, -0.2, 0.05]], ['火山口', [0.75, 1.15, 0.05]]].map(([t, p]) => {
        const l = label(t, { h: 0.022 }); l.position.set(...p); return l;
      });
      api.root.add(cone, cut, crust, grass, chamber, conduit, crater, ...tags);
      // 喷出的岩浆粒子
      const N = 260, pos = new Float32Array(N * 3), P = [];
      for (let i = 0; i < N; i++) P.push({ t: Math.random() * 3 });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const lava = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffa040, size: 0.09, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      api.root.add(lava);
      let t0 = 0;
      api.live('剖开火山看里面。点“🌋 喷一次”');
      return {
        action() { t0 = now(); P.forEach(p => { p.t = Math.random() * 0.5; }); },
        update(t, dt) {
          crater.material.opacity = 0.5 + 0.3 * Math.sin(t / 300);
          if (!t0) return;
          const s = (now() - t0) / 1000;
          const power = s < 0.4 ? s / 0.4 : Math.exp(-(s - 0.4) * 0.55);   // 越喷越弱
          magmaMat.emissiveIntensity = 0.45 + 0.4 * power;
          P.forEach((p, i) => {
            p.t += dt * (0.7 + power);
            const lt = p.t % 3, ang = i * 2.399, spread = lt * 0.32;
            pos.set([Math.cos(ang) * spread * (0.4 + power), 1.05 + lt * 1.6 * power - lt * lt * 0.55, Math.sin(ang) * spread * (0.4 + power) * 0.4], i * 3);
          });
          geo.attributes.position.needsUpdate = true;
          lava.material.opacity = Math.min(1, power * 1.4);
          api.live(power > 0.35 ? '🌋 岩浆房里的岩浆顺着通道冲上来，从火山口喷出！' : '喷发慢慢停下来了。再点“🌋 喷一次”');
        },
      };
    };

    S.act_typhoon = api => {
      // 在真实地球上看台风：贴的是 NASA Aqua 卫星从正上方拍的超强台风“苏迪罗”（2015-08-04）
      const E = mainEarth(api);
      E.clouds(false);
      const place = E.point(140, 17);
      E.sun(place.normal);                                   // 正午，太阳在头顶
      api.fly(place.pos.clone().multiplyScalar(1.85).toArray(), place.pos.toArray(), 2200);
      const decal = new THREE.Group();
      decal.position.copy(lonLat(140, 17, 1.012));
      decal.quaternion.setFromUnitVectors(V(0, 0, 1), lonLat(140, 17, 1).normalize());
      const u = { map: { value: null } };
      const photo = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.ShaderMaterial({
        uniforms: u, transparent: true, depthWrite: false,
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `
          uniform sampler2D map; varying vec2 vUv;
          void main(){
            vec3 c = texture2D(map, vUv).rgb;
            float lum = dot(c, vec3(0.3, 0.59, 0.11));
            float r = length(vUv - 0.5);
            float a = smoothstep(0.32, 0.72, lum) * (1.0 - smoothstep(0.34, 0.5, r));   // 只留下云，海面透出真实地球
            gl_FragColor = vec4(c * 1.05, a);
          }`,
      }));
      loadTex('assets/textures/typhoon-decal.jpg').then(t => { u.map.value = t; });
      const spinner = new THREE.Group();
      spinner.add(photo);
      // 逆时针的箭头：一圈弧线 + 三个小三角
      const arrows = new THREE.Group();
      const arcMat = new THREE.MeshBasicMaterial({ color: 0xffd76b, transparent: true, opacity: 0.85, depthWrite: false });
      [0, 1, 2].forEach(i => {
        const arc = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.004, 6, 32, Math.PI * 0.45), arcMat);
        arc.rotation.z = i * Math.PI * 2 / 3;
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.03, 8), arcMat);
        const a = i * Math.PI * 2 / 3 + Math.PI * 0.45;
        tip.position.set(Math.cos(a) * 0.2, Math.sin(a) * 0.2, 0);
        tip.rotation.z = a;                                   // 尖头沿逆时针方向
        arrows.add(arc, tip);
      });
      arrows.position.z = 0.004;
      arrows.visible = false;
      decal.add(spinner, arrows);
      E.attach(decal);
      const tag = label('台风 · 风眼在中间', { h: 0.024 });
      tag.position.copy(lonLat(140, 26, 1.03));
      E.attach(tag);
      let fast = 0;
      api.live('NASA 卫星从正上方拍到的真实台风。点“🌀 转起来”');
      return {
        action() { fast = now(); arrows.visible = true; },
        update(t, dt) {
          const quick = now() - fast < 7000;
          spinner.rotation.z += dt * (quick ? 0.6 : 0.05);    // 从上往下看逆时针
          arrows.rotation.z += dt * (quick ? 0.6 : 0.05);
          if (fast) api.live(quick ? '🌀 北半球的台风逆时针转：风绕着风眼往里吹，中间的风眼反而很平静' : '台风一边转，一边慢慢往西北方向移动');
        },
        exit: E.done,
      };
    };

    S.act_aurora = api => {
      hideSun();
      api.fly([-1, 4, 13], [-1.2, 0, 0]);
      const sun = sunBall(1);
      sun.position.set(-9, 0, 0);
      const EX = 3.5, ER = 1;
      const earth = dayNightEarth(ER, V(-1, 0, 0)).mesh;   // 对着太阳的一面是白天
      earth.position.set(EX, 0, 0);
      api.root.add(sun, earth);
      // 磁力线：偶极子 r = L·cos²λ，向阳面压扁、背阳面拉长
      const fieldMat = new THREE.LineBasicMaterial({ color: 0x6fd8ff, transparent: true, opacity: 0.45 });
      [1.8, 2.6, 3.6].forEach(L => [1, -1].forEach(side => {
        const pts = [];
        for (let i = 0; i <= 80; i++) {
          const lat = -1.35 + 2.7 * i / 80, r = L * ER * Math.cos(lat) ** 2;
          if (r < ER) continue;
          let x = side * r * Math.cos(lat);
          x *= x < 0 ? 0.62 : 1.7;
          pts.push(V(EX + x, r * Math.sin(lat), 0));
        }
        api.root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), fieldMat));
      }));
      const auroraMat = new THREE.MeshBasicMaterial({ color: 0x5dff9a, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
      [1, -1].forEach(s => {
        const a = new THREE.Mesh(new THREE.TorusGeometry(ER * 0.45, 0.05, 8, 48), auroraMat);
        a.rotation.x = Math.PI / 2;
        a.position.set(EX, s * ER * 0.9, 0);
        api.root.add(a);
      });
      // 太阳风小粒子：少数顺着磁力线钻进南北极，点亮极光
      const N = 600, pos = new Float32Array(N * 3), P = [];
      const spawn = (p, storm) => {
        p.pos = V(-7.8, (Math.random() - .5) * 2.4, (Math.random() - .5) * 2.4);
        p.v = (storm ? 5.5 : 3.2) * (0.8 + Math.random() * 0.4);
        p.polar = Math.random() < 0.07;
        p.storm = storm;
      };
      for (let i = 0; i < N; i++) { const p = {}; spawn(p, false); p.pos.x = -7.8 + Math.random() * 19; P.push(p); }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      api.root.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffe0a0, size: 0.07, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })));
      // 宇航员拍到的极光照片（复用太阳页面的）
      const photo = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.6), withTex(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.95 }), '../sun-3d/assets/photos/aurora-iss.jpg'));
      photo.position.set(7.2, 1.8, -1);
      photo.rotation.y = 0.5;
      const ptag = label('空间站拍到的极光', { h: 0.022 });
      ptag.position.set(7.2, 0.6, -1);
      api.root.add(photo, ptag);
      let boost = 0, stormT = -1e9;
      api.live('🌬️ 太阳风一直在吹，只有少量粒子钻进南北极');
      return {
        action() {
          stormT = now();
          P.forEach((p, i) => { if (i % 2 === 0) spawn(p, true); });
        },
        update(t, dt) {
          earth.rotation.y += dt * 0.2;
          const nose = EX - 1.9;
          P.forEach((p, i) => {
            if (p.polar && p.pos.x > nose - 0.3) {
              const pole = V(EX, Math.sign(p.pos.y || 1) * ER * 0.9, 0);
              p.pos.lerp(pole, 1 - Math.exp(-dt * 3));
              if (p.pos.distanceTo(pole) < 0.09) { boost = Math.min(1, boost + (p.storm ? 0.08 : 0.02)); spawn(p, false); }
            } else {
              p.pos.x += p.v * dt;
              if (p.pos.x > nose) {
                // 被磁场挡开，从旁边绕过去
                const perp = V(0, p.pos.y, p.pos.z), d = perp.length(), wall = 2 + (p.pos.x - nose) * 0.35;
                if (d < wall) perp.setLength(d + (wall - d) * (1 - Math.exp(-dt * 6)) + 0.001), p.pos.y = perp.y, p.pos.z = perp.z;
              }
              if (p.pos.x > 12) spawn(p, false);
            }
            pos.set([p.pos.x, p.pos.y, p.pos.z], i * 3);
          });
          geo.attributes.position.needsUpdate = true;
          boost = Math.max(0, boost - dt * 0.12);
          auroraMat.opacity = 0.3 + 0.7 * boost;
          auroraMat.color.setRGB(0.35 + 0.4 * boost, 1, 0.6 - 0.2 * boost);
          api.live(now() - stormT < 6000 ? '💥 太阳风暴来了！极光变亮变漂亮' : '🌬️ 太阳风一直在吹，只有少量粒子钻进南北极');
        },
      };
    };

    // ============ 和我们的关系 ============
    S.life_ocean = api => {
      hideSun();
      api.fly([0.6, 1, 8.4], [0.6, -0.3, 0]);
      lights(api.root, [3, 5, 6], 0.6);
      const earth = ball(0.75, 'assets/textures/day-4k.jpg', { lit: true });
      earth.position.set(0.3, 1.5, -1);
      const etag = label('从太空看：地球是蓝色的', { h: 0.024 });
      etag.position.set(0.3, 2.45, -1);
      api.root.add(earth, etag);
      // 10 个一样的杯子：7 个装海水，3 个装陆地的泥土
      const cups = [];
      for (let i = 0; i < 10; i++) {
        const x = -2.7 + i * 0.6, isSea = i < 7;
        const glass = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.5),
          new THREE.MeshStandardMaterial({ color: 0xd8e8f2, transparent: true, opacity: 0.22, roughness: 0.1, depthWrite: false }));
        glass.position.set(x, -0.9, 0);
        const fill = new THREE.Mesh(new THREE.BoxGeometry(0.44, 1, 0.44),
          new THREE.MeshStandardMaterial({ color: isSea ? 0x2e8fd8 : 0x8a6a3e, transparent: isSea, opacity: isSea ? 0.85 : 1 }));
        fill.position.set(x, -1.4, 0);
        fill.scale.y = 0.001;
        api.root.add(glass, fill);
        cups.push(fill);
      }
      const tagSea = label('🌊 海洋 7 份', { h: 0.024 }), tagLand = label('⛰️ 陆地 3 份', { h: 0.024 });
      tagSea.position.set(-0.9, -1.75, 0.4); tagLand.position.set(2.1, -1.75, 0.4);
      tagSea.visible = tagLand.visible = false;
      api.root.add(tagSea, tagLand);
      let t0 = 0;
      api.live('把地球表面分成 10 份。点“🎨 涂一涂”');
      return {
        action() { t0 = now(); cups.forEach(w => { w.scale.y = 0.001; }); },
        update(t, dt) {
          earth.rotation.y += dt * 0.15;
          if (!t0) return;
          const s = (now() - t0) / 1000;
          let sea = 0, land = 0;
          cups.forEach((w, i) => {
            const k = ease(clamp((s - i * 0.35) / 0.9, 0, 1));
            w.scale.y = Math.max(0.001, k);
            w.position.y = -1.4 + k * 0.5;
            if (k >= 1) { if (i < 7) sea++; else land++; }
          });
          tagSea.visible = sea === 7; tagLand.visible = land === 3;
          api.live(`🌊 海洋 <b>${sea}</b> 份　⛰️ 陆地 <b>${land}</b> 份${land === 3 ? ' —— 海洋最多，所以地球叫“蓝色星球”！' : ''}`);
        },
      };
    };

    S.life_land = api => {
      // 飞到真实地球上的几个地方：低低的太阳斜照，山脉的起伏才看得清
      const E = mainEarth(api);
      E.clouds(false);
      const PLACES = [
        { name: '⛰️ 喜马拉雅山脉', lon: 86.9, lat: 28.0, alt: 0.32, text: '世界上最高的山脉，珠穆朗玛峰高 8,849 米，山顶有积雪' },
        { name: '🏜️ 撒哈拉沙漠', lon: 13, lat: 23, alt: 0.45, text: '世界上最大的热沙漠，黄黄的一大片，很少下雨' },
        { name: '🌳 亚马孙雨林', lon: -62, lat: -4, alt: 0.45, text: '世界上最大的热带雨林，深绿色，住着好多动物和植物' },
        { name: '🌾 华北平原', lon: 116, lat: 36, alt: 0.3, text: '又平又宽的平原，适合种庄稼，北京就在它的北边' },
        { name: '🧊 南极冰盖', lon: 40, lat: -78, alt: 0.5, text: '白白的冰盖，平均有约 2 千米厚，是地球上最冷的地方' },
      ];
      let step = -1, cur = null;
      const go = () => {
        const p = PLACES[step], pt = E.point(p.lon, p.lat);
        E.sun(pt.normal.clone().multiplyScalar(0.45).add(pt.east.clone().multiplyScalar(0.9)));   // 早晨的太阳从东边斜照
        api.fly(pt.pos.clone().multiplyScalar(1 + p.alt).add(pt.north.clone().multiplyScalar(-p.alt * 0.6)).toArray(), pt.pos.toArray(), 2200);
        if (cur) cur.parent.remove(cur);
        cur = label(p.name, { h: 0.026 });
        cur.position.copy(lonLat(p.lon, p.lat + 4, 1.02));
        E.attach(cur);
        api.live(`${p.name}：${p.text}`);
      };
      api.fly([0, 0.4, 3.6]);
      api.live('陆地上有高山、沙漠、森林、平原，还有冰盖。点“✈️ 飞过去看”');
      return {
        action() { step = (step + 1) % PLACES.length; go(); },
        exit: E.done,
      };
    };

    S.life_air = api => {
      hideSun();
      // 站在地面上看天空：太阳高时天是蓝的，太阳快落山时变成橙红的晚霞
      const sunDir = V(0, 0.8, -1).normalize();
      const u = { sunDir: { value: sunDir } };
      const sky = new THREE.Mesh(new THREE.SphereGeometry(60, 64, 32), new THREE.ShaderMaterial({
        uniforms: u, side: THREE.BackSide, depthWrite: false,
        vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `
          uniform vec3 sunDir; varying vec3 vDir;
          void main(){
            vec3 v = normalize(vDir);
            float e = sunDir.y;                                  // 太阳高度
            float sunset = 1.0 - smoothstep(0.02, 0.4, e);       // 太阳越低越像晚霞
            float mu = max(dot(v, sunDir), 0.0);
            float up = pow(max(v.y, 0.0), 0.45);
            vec3 zenith = mix(vec3(0.16, 0.42, 0.95), vec3(0.12, 0.17, 0.42), sunset);
            vec3 horizonFar = mix(vec3(0.72, 0.85, 1.0), vec3(0.45, 0.36, 0.62), sunset);
            vec3 horizonSun = mix(vec3(0.85, 0.92, 1.0), vec3(1.0, 0.42, 0.12), sunset);
            vec3 horizon = mix(horizonFar, horizonSun, pow(mu, 3.0));
            vec3 c = mix(horizon, zenith, up);
            c += vec3(1.0, 0.85, 0.6) * pow(mu, 300.0) * 3.0 + mix(vec3(1.0, 0.9, 0.7), vec3(1.0, 0.5, 0.2), sunset) * pow(mu, 12.0) * 0.35;
            c *= 0.25 + 0.75 * smoothstep(-0.12, 0.05, e);
            gl_FragColor = vec4(c, 1.0);
          }`,
      }));
      const ground = new THREE.Mesh(new THREE.CircleGeometry(58, 64), new THREE.MeshStandardMaterial({ color: 0x2f4a26, roughness: 1 }));
      ground.rotation.x = -Math.PI / 2;
      const amb = new THREE.HemisphereLight(0xbfd8ff, 0x2a3a20, 0.6);
      const sunLight = new THREE.DirectionalLight(0xffffff, 1);
      api.root.add(sky, ground, amb, sunLight);
      // 远处的小山和一座小房子
      [[-14, -26, 6, 4], [6, -30, 9, 5], [22, -24, 5, 3]].forEach(([x, z, r, h]) => {
        const hill = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x3a5a2e, roughness: 1 }));
        hill.scale.y = h / r; hill.position.set(x, 0, z);
        api.root.add(hill);
      });
      const house = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1), new THREE.MeshStandardMaterial({ color: 0xd8c9a8 }));
      house.position.set(-3, 0.45, -8);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.6, 4), new THREE.MeshStandardMaterial({ color: 0xb5502e }));
      roof.position.y = 0.75; roof.rotation.y = Math.PI / 4;
      house.add(roof);
      api.root.add(house);
      api.fly([0, 1.6, 4], [0, 4, -20]);
      // 卡片里的小图：中午阳光穿过的空气薄，傍晚斜着穿过的空气厚
      const diagram = sunsetOn => api.extra(`<svg viewBox="0 0 300 120" style="width:100%">
        <path d="M0,118 Q150,70 300,118" fill="#2e6fd8" opacity=".9"/>
        <path d="M0,118 Q150,40 300,118" fill="none" stroke="#7fb4ff" stroke-width="14" opacity=".35"/>
        <circle cx="150" cy="93" r="4" fill="#ffd76b"/>
        <line x1="150" y1="5" x2="150" y2="89" stroke="#fff3c0" stroke-width="${sunsetOn ? 1 : 3}" opacity="${sunsetOn ? .4 : 1}"/>
        <line x1="10" y1="62" x2="146" y2="92" stroke="#ff9a4a" stroke-width="${sunsetOn ? 3 : 1}" opacity="${sunsetOn ? 1 : .4}"/>
        <text x="156" y="20" fill="#fff3c0" font-size="11">中午：穿过的空气薄</text>
        <text x="8" y="52" fill="#ffb27a" font-size="11">傍晚：斜着穿过厚厚的空气</text></svg>`);
      diagram(false);
      let sunset = false, elev = 0.85;
      api.live('☀️ 中午：太阳高高的，空气把蓝光散到整个天空，天是蓝的');
      return {
        action() {
          sunset = !sunset;
          diagram(sunset);
          api.live(sunset ? '🌇 傍晚：阳光斜着穿过厚厚的空气，蓝光在路上都被散掉了，剩下橙红色的晚霞' : '☀️ 中午：太阳高高的，空气把蓝光散到整个天空，天是蓝的');
        },
        update(t, dt, rawDt) {
          elev += ((sunset ? 0.04 : 0.85) - elev) * (1 - Math.exp(-rawDt * 0.9));
          sunDir.set(0.25, Math.sin(elev), -Math.cos(elev)).normalize();
          sunLight.position.copy(sunDir).multiplyScalar(30);
          sunLight.color.setRGB(1, 0.55 + 0.45 * Math.min(1, elev * 2), 0.3 + 0.7 * Math.min(1, elev * 2));
          amb.intensity = 0.25 + 0.4 * Math.min(1, elev * 2);
        },
      };
    };

    S.life_water = api => {
      hideSun();
      api.fly([0.3, 2, 7.5], [0, 0.4, 0]);
      lights(api.root, [3, 5, 6], 0.55);
      const sun = sunBall(0.6);
      sun.position.set(-4.5, 2.6, -2);
      // 大海 + 小河 + 云
      const sea = new THREE.Mesh(new THREE.CircleGeometry(2.2, 48), new THREE.MeshStandardMaterial({ color: 0x1d6fb8, roughness: 0.5 }));
      sea.rotation.x = -Math.PI / 2; sea.position.set(-1.6, -0.57, 0);
      const ground = new THREE.Mesh(new THREE.BoxGeometry(9, 0.3, 4), new THREE.MeshStandardMaterial({ color: 0x6d8a4d, roughness: 1 }));
      ground.position.y = -0.75;
      const river = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.4), new THREE.MeshStandardMaterial({ color: 0x2e8fd8, roughness: 0.4 }));
      river.rotation.x = -Math.PI / 2; river.rotation.z = 0.35;
      river.position.set(0.8, -0.58, 0.2);
      api.root.add(sun, ground, sea, river);
      const cloudMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false });
      const cloud = new THREE.Group();
      [[0, 0, 0, 0.9], [0.5, 0.12, 0.1, 0.65], [-0.5, 0.08, -0.05, 0.7]].forEach(([x, y, z, s]) => {
        const p = new THREE.Sprite(cloudMat.clone());
        p.position.set(x, y, z); p.scale.setScalar(s);
        cloud.add(p);
      });
      cloud.position.set(0.4, 2, 0);
      api.root.add(cloud);
      // 三群粒子：水汽上升 / 雨滴下落 / 河水流动
      const NV = 140, NR = 200, NW = 80;
      const posV = new Float32Array(NV * 3), posR = new Float32Array(NR * 3), posW = new Float32Array(NW * 3);
      const gV = new THREE.BufferGeometry(); gV.setAttribute('position', new THREE.BufferAttribute(posV, 3));
      const gR = new THREE.BufferGeometry(); gR.setAttribute('position', new THREE.BufferAttribute(posR, 3));
      const gW = new THREE.BufferGeometry(); gW.setAttribute('position', new THREE.BufferAttribute(posW, 3));
      api.root.add(
        new THREE.Points(gV, new THREE.PointsMaterial({ color: 0xbfe8ff, size: 0.09, transparent: true, opacity: 0.85, depthWrite: false })),
        new THREE.Points(gR, new THREE.PointsMaterial({ color: 0x6fb8ff, size: 0.08, transparent: true, opacity: 0.9, depthWrite: false })),
        new THREE.Points(gW, new THREE.PointsMaterial({ color: 0x9fd8ff, size: 0.07, transparent: true, opacity: 0.9, depthWrite: false })),
      );
      const STEP = 5;                    // 5 秒演示一个循环：蒸发→云→雨→河
      let t0 = now();
      api.live('💧 水在天上和地上旅行。点“🔁 再旅行一次”');
      return {
        action() { t0 = now(); },
        update(t, dt) {
          const s = ((now() - t0) / 1000) % STEP;
          for (let i = 0; i < NV; i++) {
            const k = ((s / 2.2) + i / NV) % 1;
            posV.set([-1.6 + Math.sin(i * 3.1) * 1.4 * (1 - k * 0.5), -0.5 + k * 2.1, Math.cos(i * 2.3) * 0.9 * (1 - k * 0.5)], i * 3);
          }
          for (let i = 0; i < NR; i++) {
            const raining = s > 2.4 && s < 4;
            const k = ((s - 2.4) / 1.6 + i / NR) % 1;
            posR.set([
              0.4 + Math.sin(i * 5.7) * 0.9,
              raining ? 1.4 - k * 1.9 : -5,
              Math.cos(i * 4.3) * 0.7,
            ], i * 3);
          }
          for (let i = 0; i < NW; i++) {
            const k = ((s / STEP) + i / NW) % 1;
            posW.set([2.3 - k * 3, -0.55, 0.75 - k * 0.8], i * 3);
          }
          gV.attributes.position.needsUpdate = true;
          gR.attributes.position.needsUpdate = true;
          gW.attributes.position.needsUpdate = true;
          const stage = s < 2.2 ? '☀️ 太阳晒着大海，水变成水汽升上天' : s < 2.9 ? '☁️ 水汽聚在一起，变成云' : s < 4 ? '🌧️ 云太重了，变成雨落下来' : '🏞️ 雨水流进小河，又回到大海';
          api.live(`${stage}（5 秒演示一次旅行）`);
        },
      };
    };

    // ============ 一生的故事 ============
    S.story_nebula = api => {
      hideSun();
      api.fly([0, 7, 9], [0, 0, 0]);
      const bg = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), withTex(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.25, depthWrite: false }), '../textures/deep-sky/orion_m42.jpg'));
      bg.position.set(0, -6, -14);
      bg.rotation.x = -0.5;
      // 太阳已经在中间亮起来了，周围是一大圈扁扁的尘埃盘
      const sun = sunBall(0.45);
      const sunGlow = glow(0xffd28a, 2.4, { strength: 1.1 });
      const orbit = ring(3, 0x9fd0ff, 0.35);
      const N = 3000, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), P = [];
      for (let i = 0; i < N; i++) {
        const r = 1 + Math.pow(Math.random(), 0.8) * 5;
        P.push({ r, a: Math.random() * Math.PI * 2, y: (Math.random() - 0.5) * 0.12 * r, eaten: false });
        const warm = Math.random();
        col.set([0.75 + 0.25 * warm, 0.55 + 0.25 * warm, 0.4 + 0.2 * (1 - warm)], i * 3);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const disk = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false }));
      const baby = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), new THREE.MeshBasicMaterial({ color: 0xff7a30 }));
      baby.scale.setScalar(0.001);
      const tag = label('未来地球的轨道', { h: 0.022 });
      tag.position.set(0, 0.3, 3);
      api.root.add(bg, sun, sunGlow, orbit, disk, baby, tag);
      let t0 = 0, ba = 0;
      api.live('太阳已经出生了，周围转着一大圈尘埃和小石块。点“🌀 聚起来”');
      return {
        action() { t0 = now(); P.forEach(p => { p.eaten = false; }); },
        update(t, dt) {
          const k = t0 ? clamp((now() - t0) / 9000, 0, 1) : 0;
          ba += dt * 0.35 * Math.pow(1 / 3, 1.5) * 3;
          const bpos = V(Math.cos(ba) * 3, 0, -Math.sin(ba) * 3);   // 从上往下看逆时针
          let eaten = 0;
          P.forEach((p, i) => {
            p.a += dt * 0.6 * Math.pow(1 / p.r, 1.5) * 3;   // 越靠里转得越快
            let q = V(Math.cos(p.a) * p.r, p.y, -Math.sin(p.a) * p.r);
            // 地球轨道附近的尘埃被越滚越大的“地球宝宝”吸过去
            if (t0 && Math.abs(p.r - 3) < 0.55 * k + 0.05) {
              const pull = smooth(0, 1, k * 1.4 - Math.abs(p.r - 3));
              q = q.lerp(bpos, pull);
              if (pull > 0.95) { p.eaten = true; }
            }
            if (p.eaten) { eaten++; q.set(0, -999, 0); }
            pos.set([q.x, q.y, q.z], i * 3);
          });
          geo.attributes.position.needsUpdate = true;
          baby.position.copy(bpos);
          baby.scale.setScalar(t0 ? 0.02 + 0.2 * smooth(0.1, 1, k) : 0.001);
          if (t0) api.live(k < 1 ? `☄️ 小石块撞在一起，越撞越大……（${Math.round(k * 100)}%）` : '🌋 一颗滚烫的“地球宝宝”出现了，它把轨道附近的尘埃都吸走了');
        },
      };
    };

    S.story_birth = api => {
      hideSun();
      api.fly([0, 0.6, 8.5]);
      // 尘埃先聚成一个炽热的大球，再沉淀分层：重的铁沉到中间，轻的岩石浮在外面
      const N = 2000, pos = new Float32Array(N * 3), P = [];
      for (let i = 0; i < N; i++) {
        const r = 6 * Math.cbrt(Math.random()), a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
        P.push({ dir: V(Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a)), r });
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const dust = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffc890, size: 0.06, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
      api.root.add(dust);
      const R = 1.35;
      // 只画后半个球壳，前面的剖面才不会被挡住
      const hot = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 48), new THREE.MeshBasicMaterial({ color: 0xff6a1a, transparent: true, opacity: 0, side: THREE.BackSide }));
      api.root.add(hot);
      // 剖面：真实比例的三层（地壳不到半径的 1%，这里加粗到 2% 才看得见）
      const cutG = new THREE.Group();
      cutG.position.z = R * 0.02;
      const layerMat = c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0 });
      const mantle = new THREE.Mesh(new THREE.CircleGeometry(R * 0.98, 96), layerMat(0xe2702c));
      const core = new THREE.Mesh(new THREE.CircleGeometry(R * 0.546, 96), layerMat(0xffd25a));
      const crust = new THREE.Mesh(new THREE.RingGeometry(R * 0.98, R, 96), layerMat(0xe8dcc4));
      core.position.z = 0.002; crust.position.z = 0.003;
      cutG.add(mantle, core, crust);
      api.root.add(cutG);
      const tags = [['🪨 地壳：最外面薄薄一层', [R * 0.8, R * 0.95]], ['🟠 地幔：最厚的一层', [R * 0.25, R * 0.72]], ['🟡 地核：铁和镍，沉在中间', [0, -0.05]]].map(([t, [x, y]]) => {
        const l = label(t, { h: 0.022 }); l.position.set(x, y, 0.2); l.visible = false; api.root.add(l); return l;
      });
      let t0 = 0;
      api.live('46 亿年前，尘埃和小石块慢慢聚在一起。点“🔥 地球诞生”');
      return {
        action() { t0 = now(); },
        update(t, dt) {
          if (!t0) return;
          const s = (now() - t0) / 1000;
          const k = ease(clamp(s / 5, 0, 1));
          P.forEach((p, i) => {
            const r = p.r * (1 - 0.92 * k);
            pos.set([p.dir.x * r, p.dir.y * r, p.dir.z * r], i * 3);
          });
          geo.attributes.position.needsUpdate = true;
          dust.material.opacity = 0.8 * (1 - smooth(0.7, 1, k));
          hot.material.opacity = smooth(0.5, 1, k) * 0.95;
          hot.scale.setScalar(0.6 + 0.4 * k);
          const lk = ease(clamp((s - 5.5) / 2, 0, 1));
          [mantle, core, crust].forEach(m => { m.material.opacity = lk; });
          tags.forEach((l, i) => { l.visible = s > 6 + i * 0.6; });
          api.live(s < 5 ? `☄️ 尘埃和小石块撞在一起……变成一颗滚烫的地球（${Math.round(k * 100)}%）` : '🌡️ 重的铁沉到中间成了地核，轻的岩石浮在外面：分成了三层');
        },
      };
    };

    S.story_moon = api => {
      hideSun();
      api.fly([0, 2, 8.5], [0.5, 0, 0]);
      api.root.add(new THREE.AmbientLight(0xffffff, 0.3));
      const pl = new THREE.PointLight(0xfff2dd, 1.4, 0, 0);
      api.root.add(pl);
      // 年轻的炽热地球
      const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48),
        new THREE.MeshStandardMaterial({ color: 0xff7a30, emissive: 0xff5a10, emissiveIntensity: 0.7 }));
      api.root.add(earth);
      // 另一颗行星“忒伊亚”冲过来
      const theia = ball(0.55, '../textures/mars.jpg');
      api.root.add(theia);
      // 撞出来的碎片
      const N = 700, pos = new Float32Array(N * 3), P = [];
      for (let i = 0; i < N; i++) P.push({ a: Math.random() * Math.PI * 2, r: 0.2, v: 0, up: (Math.random() - .5) * 2, delay: Math.random() * 1.2 });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const debris = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffc890, size: 0.07, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      api.root.add(debris);
      // 碎片聚成的月球
      const moon = ball(0.27, '../textures/moon.jpg');
      moon.visible = false;
      api.root.add(moon);
      let t0 = 0;
      api.live('科学家认为：很久以前，一颗和火星差不多大的行星撞上了年轻的地球。点“💥 模拟碰撞”');
      return {
        action() { t0 = now(); theia.visible = true; moon.visible = false; },
        update(t, dt) {
          if (!t0) return;
          const s = (now() - t0) / 1000;
          if (s < 2.2) {
            // 忒伊亚冲过来
            const k = ease(s / 2.2);
            theia.position.set(6 - 6.9 * k, 1.2 - 0.6 * k, 0);
          } else if (s < 3) {
            theia.visible = false;
            debris.material.opacity = 0.9;
            // 爆炸！碎片飞出去
            P.forEach((p, i) => {
              p.v = Math.min(3.2, (p.v || 0.2) + dt * 6);
              p.r += p.v * dt;
              pos.set([Math.cos(p.a) * p.r, p.up * p.r * 0.4, Math.sin(p.a) * p.r], i * 3);
            });
            geo.attributes.position.needsUpdate = true;
            api.live('💥 撞上了！地球外面飞起一大片碎石');
          } else if (s < 7) {
            // 碎片聚成月球，留在一圈轨道上
            const k = ease(clamp((s - 3) / 3.5, 0, 1));
            debris.material.opacity = 0.9 * (1 - k);
            const a = -Math.PI / 2 + k * Math.PI * 2;
            moon.visible = true;
            moon.position.set(Math.cos(a) * 3, Math.sin(k * Math.PI) * 0.3, Math.sin(a) * 3);
            moon.scale.setScalar(Math.max(0.05, k));
            P.forEach((p, i) => {
              p.r = p.r * (1 - dt * 0.5) + 3 * dt * 0.5;
              pos.set([Math.cos(p.a) * p.r, p.up * p.r * 0.1, Math.sin(p.a) * p.r], i * 3);
            });
            geo.attributes.position.needsUpdate = true;
            api.live('🌙 碎石绕着地球转，慢慢聚成了月球');
          } else {
            const a = -Math.PI / 2 + ease(1) * Math.PI * 2 + (s - 7) * 0.25;
            moon.position.set(Math.cos(a) * 3, 0, Math.sin(a) * 3);
            api.live('🌙 月球就一直陪着地球转到现在');
          }
        },
      };
    };

    S.story_life = api => {
      hideSun();
      api.fly([0, 0.3, 4.4]);
      // 四个阶段：滚烫的火球 → 下雨成海、到处是水 → 海里出现看不见的小生命 → 今天的地球
      const u = { day: { value: null }, spec: { value: null }, heat: { value: 1 }, ocean: { value: 0 }, life: { value: 0 }, today: { value: 0 }, time: { value: 0 } };
      const earth = new THREE.Mesh(new THREE.SphereGeometry(1.4, 96, 64), new THREE.ShaderMaterial({
        uniforms: u,
        vertexShader: 'varying vec2 vUv; varying vec3 vN; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `
          uniform sampler2D day, spec; uniform float heat, ocean, life, today, time;
          varying vec2 vUv; varying vec3 vN;
          float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
          void main(){
            vec2 p = vUv * vec2(16.0, 8.0);
            float n = noise(p) * 0.6 + noise(p * 2.7) * 0.4;
            vec3 molten = mix(vec3(0.35, 0.06, 0.02), vec3(1.0, 0.45, 0.1), smoothstep(0.35, 0.8, n + 0.15 * sin(time * 0.6 + n * 9.0)));
            // 早期地球：几乎全是海，只有零星的火山小岛（不是今天的大陆）
            float island = smoothstep(0.78, 0.84, n);
            vec3 sea = mix(vec3(0.05, 0.16, 0.32), vec3(0.42, 0.36, 0.3), island);
            sea = mix(sea, sea * vec3(0.8, 1.25, 1.0) + vec3(0.0, 0.05, 0.02), life * (1.0 - island));   // 海里的微生物让海水微微泛绿
            vec3 now_ = texture2D(day, vUv).rgb;
            vec3 c = mix(molten, sea, ocean);
            c = mix(c, now_, today);
            float lit = 0.35 + 0.65 * max(dot(normalize(vN), normalize(vec3(-0.5, 0.4, 0.8))), 0.0);
            gl_FragColor = vec4(c * mix(1.0, lit, ocean), 1.0);
          }`,
      }));
      loadTex('assets/textures/day-4k.jpg').then(t => { u.day.value = t; });
      api.root.add(earth);
      const STEPS = [
        { ocean: 0, life: 0, today: 0, text: '🌋 刚出生的地球：到处是滚烫的岩浆' },
        { ocean: 1, life: 0, today: 0, text: '🌧️ 地球慢慢变凉，下了很久很久的雨，几乎到处都是海洋' },
        { ocean: 1, life: 1, today: 0, text: '🦠 大约 35 亿年前，海里出现了最早的小生命，小得眼睛看不见' },
        { ocean: 1, life: 1, today: 1, text: '🌍 又过了 30 多亿年，才有了陆地上的植物；大陆也一直在慢慢移动，变成今天的样子' },
      ];
      let step = 0;
      api.live(`${STEPS[0].text}。点“🌱 看变化”`);
      return {
        action() { step = (step + 1) % STEPS.length; api.live(STEPS[step].text); },
        update(t, dt, rawDt) {
          earth.rotation.y += dt * 0.08;
          u.time.value = t / 1000;
          const f = 1 - Math.exp(-rawDt * 1.2);
          ['ocean', 'life', 'today'].forEach(k => { u[k].value += (STEPS[step][k] - u[k].value) * f; });
        },
      };
    };

    // ============ 谁去研究过 ============
    S.probe_round = api => {
      hideSun();
      // ===== 月食：地球的影子落在月亮上，边总是圆弧 =====
      const ecl = new THREE.Group();
      const sun = sunBall(0.9);
      sun.position.set(-12, 0, 0);
      const light = new THREE.DirectionalLight(0xffffff, 1.2);
      light.position.set(-10, 0, 0);
      const earth = ball(1, 'assets/textures/day-4k.jpg', { lit: true });
      // 地球的本影：一根越来越细的影子（月亮那么远时半径约 0.73 个地球半径）
      const UMBRA = 0.73, MX = 4.5;
      const shadowGeo = new THREE.CylinderGeometry(UMBRA, 1, MX + 0.6, 48, 1, true);
      shadowGeo.rotateZ(-Math.PI / 2);   // 粗的一头贴着地球，细的一头指向月亮
      const shadow = new THREE.Mesh(shadowGeo, new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }));
      shadow.position.x = (MX + 0.6) / 2;
      const mu = { map: { value: null }, umbra: { value: UMBRA } };
      const moon = new THREE.Mesh(new THREE.SphereGeometry(MOON_D, 64, 48), new THREE.ShaderMaterial({
        uniforms: mu,
        vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vW; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
        fragmentShader: `
          uniform sampler2D map; uniform float umbra; varying vec2 vUv; varying vec3 vN; varying vec3 vW;
          void main(){
            vec3 c = texture2D(map, vUv).rgb * (0.08 + 1.1 * max(dot(normalize(vN), vec3(-1.0, 0.0, 0.0)), 0.0));
            float d = length(vW.yz);                               // 离地影中心线多远
            float inU = 1.0 - smoothstep(umbra - 0.015, umbra + 0.015, d);
            float inP = 1.0 - smoothstep(umbra, umbra + 0.45, d);
            c *= 1.0 - 0.35 * inP;                                 // 半影：暗一点
            c = mix(c, c * vec3(0.55, 0.16, 0.08), inU);           // 本影：暗红色（大气把红光折射进来）
            gl_FragColor = vec4(c, 1.0);
          }`,
      }));
      loadTex('../textures/moon.jpg').then(t => { mu.map.value = t; });
      const tagE = label('地球', { h: 0.024 }); tagE.position.set(0, -1.3, 0);
      const tagS = label('地球的影子', { h: 0.024 }); tagS.position.set(2.4, -1.05, 0);
      ecl.add(sun, light, earth, shadow, moon, tagE, tagS);
      // ===== 帆船：海面是弯的，船身先消失，桅杆最后消失（弯曲程度放大了） =====
      const sea = new THREE.Group();
      const R = 30;
      const ocean = new THREE.Mesh(new THREE.SphereGeometry(R, 128, 64), new THREE.MeshStandardMaterial({ color: 0x1d5f99, roughness: 0.35, metalness: 0.1 }));
      ocean.position.y = -R;
      const skyDome = new THREE.Mesh(new THREE.SphereGeometry(80, 32, 16), new THREE.MeshBasicMaterial({ color: 0x9cc8f0, side: THREE.BackSide }));
      sea.add(ocean, skyDome, new THREE.HemisphereLight(0xffffff, 0x335577, 0.9));
      const sunL = new THREE.DirectionalLight(0xffffff, 0.8); sunL.position.set(5, 10, 6); sea.add(sunL);
      const ship = new THREE.Group();
      const hull = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.7), new THREE.MeshStandardMaterial({ color: 0x8a5a2e }));   // 船头朝着远方
      hull.position.y = 0.11;
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.75, 8), new THREE.MeshStandardMaterial({ color: 0x5a4020 }));
      mast.position.y = 0.5;
      const sail = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.42), new THREE.MeshStandardMaterial({ color: 0xc8bea6, side: THREE.DoubleSide }));   // 颜色压暗一点，免得被辉光糊成白块
      sail.position.set(0, 0.5, 0.03);   // 帆正对着岸边的我们
      ship.add(hull, mast, sail);
      const shipHolder = new THREE.Group();
      shipHolder.add(ship);
      sea.add(shipHolder);
      const placeShip = th => {   // 船贴着弯弯的海面走（th = 绕球心转过的角度）
        shipHolder.position.set(0, -R + R * Math.cos(th), -R * Math.sin(th));
        shipHolder.rotation.x = -th;
      };
      sea.visible = false;
      api.root.add(ecl, sea);
      let mode = 'eclipse', t0 = 0;
      const show = m => {
        mode = m; t0 = now();
        ecl.visible = m === 'eclipse'; sea.visible = m === 'ship';
        if (m === 'eclipse') api.fly([2.2, 2.6, 6.5], [2.6, 0, 0], 1500);
        else { placeShip(0.07); api.fly([0, 0.6, 0], [0, 0.35, -12], 1500); }
      };
      show('eclipse');
      t0 = 0;
      moon.position.set(MX, 0, -1.6);
      api.live('月食时，地球挡住阳光，影子落在月亮上。点“🌑 看月食”');
      return {
        action(id) { show(id); },
        update(t, dt) {
          earth.rotation.y += dt * 0.1;
          if (!t0) return;
          const s = (now() - t0) / 1000;
          if (mode === 'eclipse') {
            // 先走到一半进影子的位置停一会儿（能看清圆弧形的影子边），再全部进去，最后走出来
            const z = s < 5 ? -1.6 + 0.84 * ease(clamp(s / 5, 0, 1))
              : s < 9 ? -0.76                                    // 月亮一半在影子里
              : -0.76 + 2.36 * ease(clamp((s - 9) / 8, 0, 1));
            moon.position.set(MX, 0, z);
            if (s > 1 && s < 1.1) api.fly([MX - 1.6, 0.35, 0.55], [MX, 0, -0.4], 2500);   // 凑近月亮，从地球这边看
            api.live(s < 4 ? '🌑 月亮慢慢走进地球的影子……'
              : s < 9 ? '🔴 停一下，看影子的边：是一段圆弧！'
              : s < 14 ? '🔴 月亮整个进到影子里，变成了暗红色'
              : '🌕 不管哪一次月食，地影的边都是圆的 —— 地球是个球');
          } else {
            const th = 0.07 + 0.38 * clamp(s / 10, 0, 1);
            placeShip(th);
            const d = th * R;   // 船离岸边的距离
            api.live(d < 6 ? '⛵ 船开远了……' : d < 9.6 ? '👀 船身先沉到弯弯的海面后面了，只剩帆和桅杆！' : d < 12.6 ? '👀 只剩桅杆尖了……' : '🌍 桅杆也看不见了 —— 海面是弯的，地球是圆的！（弯曲程度放大了）');
          }
        },
      };
    };

    S.probe_magellan = api => {
      // 在真实地球上画出麦哲伦船队（维多利亚号）的真实航线：从西班牙出发一直往西，绕地球一圈回到西班牙
      const E = mainEarth(api);
      E.clouds(false);
      const WAY = [
        [-6.35, 36.78, '1519 年 9 月 · 从西班牙出发'], [-15.4, 28.1], [-25, 10], [-35, -5], [-43.2, -22.9], [-56, -35], [-67.7, -49.3],
        [-68.5, -52.5, '1520 年 11 月 · 穿过南美洲南端的海峡（后来叫麦哲伦海峡）'], [-72, -53.5], [-75, -52.5],
        [-82, -40, '进入太平洋，一连航行了 3 个多月'], [-100, -25], [-125, -12], [-150, -2], [-175, 8], [165, 12], [144.7, 13.4],
        [123.98, 10.3, '1521 年 4 月 · 麦哲伦在菲律宾的战斗中去世'], [127.4, 0.7, '剩下的船员继续航行，到了香料群岛'], [124, -9],
        [100, -20, '穿过印度洋'], [70, -32], [40, -37], [18.5, -34.4, '1522 年 5 月 · 绕过非洲南端的好望角'], [0, -20], [-15, 0], [-23.5, 15], [-15, 30],
        [-6.35, 36.78, '1522 年 9 月 · 只剩 1 艘船、18 名船员回到西班牙：绕地球一圈！'],
      ];
      // 相邻航点之间沿大圆弧插值
      const pts = [], notes = [];
      for (let i = 0; i < WAY.length - 1; i++) {
        const a = lonLat(WAY[i][0], WAY[i][1], 1).normalize(), b = lonLat(WAY[i + 1][0], WAY[i + 1][1], 1).normalize();
        if (WAY[i][2]) notes.push([pts.length, WAY[i][2]]);
        const n = Math.max(2, Math.ceil(a.angleTo(b) / 0.02));
        for (let k = 0; k < n; k++) {
          const t = k / n, ang = a.angleTo(b);
          const p = a.clone().multiplyScalar(Math.sin((1 - t) * ang)).add(b.clone().multiplyScalar(Math.sin(t * ang))).divideScalar(Math.sin(ang) || 1);
          pts.push(p.normalize().multiplyScalar(1.006));
        }
      }
      pts.push(lonLat(WAY[0][0], WAY[0][1], 1.006));
      notes.push([pts.length - 1, WAY[WAY.length - 1][2]]);
      const all = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: 0xffd76b, dashSize: 0.02, gapSize: 0.015, transparent: true, opacity: 0.6 }));
      all.computeLineDistances();
      const done = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xffe9a0 }));
      done.geometry.setDrawRange(0, 0);
      const ship = glow(0xffd76b, 0.04, { strength: 1.3 });
      ship.position.copy(pts[0]);
      const start = label('西班牙', { h: 0.022 }); start.position.copy(lonLat(-6.35, 40, 1.03));
      const mactan = label('麦哲伦在这里去世', { h: 0.022 }); mactan.position.copy(lonLat(124, 14, 1.03));
      [all, done, ship, start, mactan].forEach(o => E.attach(o));
      const at = i => E.surface.localToWorld(pts[i].clone());
      const look = i => { const w = at(i); E.sun(w.clone().normalize().add(V(0, 0.7, 0))); api.fly(w.clone().normalize().multiplyScalar(3).toArray(), [0, 0, 0], 1200); };   // 太阳偏上方，海面反光不挡住船
      look(0);
      let t0 = 0, lastNote = -1, lastFly = 0;
      const TRIP = 24;                  // 24 秒演示三年
      api.live('1519 年，5 艘船从西班牙出发，一直往西开。点“⛵ 出发”');
      return {
        action() { t0 = now(); lastNote = -1; done.geometry.setDrawRange(0, 0); },
        update() {
          if (!t0) return;
          const k = clamp((now() - t0) / 1000 / TRIP, 0, 1);
          const idx = Math.min(pts.length - 1, Math.floor(k * (pts.length - 1)));
          done.geometry.setDrawRange(0, idx + 1);
          ship.position.copy(pts[idx]);
          if (now() - lastFly > 1300) { lastFly = now(); look(idx); }   // 镜头跟着船
          notes.forEach(([i, text], n) => { if (idx >= i && n > lastNote) { lastNote = n; api.live(`⛵ ${text}`); } });
          if (k >= 1) t0 = 0;
        },
        exit: E.done,
      };
    };

    S.probe_apollo = api => {
      hideSun();
      api.fly([0, 0.4, 7]);
      lights(api.root, [1, 1, 6], 0.25);   // 太阳在宇航员身后，所以地球几乎整个被照亮
      // 真实比例：地球直径约是月球的 3.7 倍。宇航员离地球近、离月球远
      const earth = ball(0.9, 'assets/textures/day-4k.jpg', { lit: true });
      earth.position.set(-2.4, 0.2, 0);
      const moon = ball(0.9 * MOON_D, '../textures/moon.jpg', { lit: true });
      moon.position.set(3.6, 0.5, -3);
      const ship = satellite(0xdddddd);
      ship.scale.setScalar(1.6);
      ship.position.set(0.9, -0.2, 1.2);
      ship.lookAt(earth.position);
      const tagE = label('地球', { h: 0.024 }), tagM = label('月球（还很远）', { h: 0.024 }), tagS = label('阿波罗 17 号', { h: 0.022 });
      tagE.position.set(-2.4, -0.95, 0); tagM.position.set(3.6, 0.05, -3); tagS.position.set(0.9, -0.55, 1.2);
      api.root.add(earth, moon, ship, tagE, tagM, tagS);
      const photo = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), withTex(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }), 'assets/photos/blue-marble.jpg'));
      photo.position.set(0.4, 0.4, 2.6);
      api.root.add(photo);
      let t0 = 0;
      api.live('1972 年，阿波罗 17 号在飞往月球的路上回头看地球。点“📷 看地球”');
      return {
        action() { t0 = now(); api.fly([0.4, 0.4, 7.2], [0.4, 0.4, 2.6], 2500); },
        update(t, dt) {
          earth.rotation.y += dt * 0.12;
          moon.rotation.y += dt * 0.03;
          if (t0) {
            photo.material.opacity = smooth(1500, 2800, now() - t0);
            [tagE, tagM, tagS].forEach(l => { l.visible = photo.material.opacity < 0.5; });
            if (now() - t0 > 2800) api.live('🔵 这就是宇航员拍下的真实照片“蓝色弹珠”：小小的蓝色地球飘在黑黑的太空里');
          }
        },
      };
    };

    S.probe_station = api => {
      hideSun();
      api.fly([1.2, 1.4, 5.4], [0.8, 0, 0]);
      const sun = sunBall(0.9);
      sun.position.set(-9, 2, -2);
      const d = lights(api.root, sun.position.toArray(), 0.35);
      d.intensity = 1.25;
      const earth = ball(1.15, 'assets/textures/day-4k.jpg', { lit: true });
      api.root.add(sun, earth);
      // 空间站 + 卫星在不同高度的轨道上绕地球
      const SATS = [
        { name: '空间站', color: 0xffffff, r: 1.55, speed: 0.9, tilt: 0.9 },
        { name: '北斗导航卫星', color: 0xffc86b, r: 2.4, speed: 0.3, tilt: -0.96 },
        { name: '静止气象卫星', color: 0x6fd0ff, r: 3.0, speed: 0.12, tilt: 0 },   // 和地球自转一样快，所以一直停在同一个地方上空
      ];
      const list = SATS.map(s => {
        const g = satellite(s.color);
        g.scale.setScalar(s.name === '空间站' ? 2.6 : 2);
        const l = label(s.name);
        l.scale.divideScalar(g.scale.x);
        l.position.y = 0.22;
        g.add(l);
        const orbit = new THREE.Group();
        orbit.rotation.set(s.tilt, 0, s.tilt * 0.3);
        orbit.add(ring(s.r, s.color, 0.3), g);
        api.root.add(orbit);
        return { g, s, a: 0 };
      });
      let t0 = 0;
      api.live('空间站离地面约 400 公里，绕一圈约 90 分钟（大小和距离都压缩了）。点“🛰️ 绕一圈”');
      return {
        action() { t0 = now(); list.forEach(o => { o.a = 0; }); },
        update(t, dt) {
          earth.rotation.y += dt * 0.12;
          list.forEach(o => {
            o.a += dt * o.s.speed * (t0 ? 2.2 : 1);   // 演示时全体加速
            o.g.position.set(Math.cos(o.a) * o.s.r, 0, Math.sin(o.a) * o.s.r);
            o.g.lookAt(sun.position);
          });
          if (t0) {
            // 按空间站实际转过的角度换算分钟：转满一圈 = 90 分钟，和加速倍率无关
            const station = list[0];
            const mins = Math.min(90, Math.floor(station.a / (Math.PI * 2) * 90));
            api.live(`🛰️ 空间站绕地球 <b>${mins}</b> / 90 分钟${mins >= 90 ? ' —— 从上面能看到整个地球！' : ''}（大小和距离都压缩了）`);
            if (mins >= 90) t0 = 0;
          }
        },
      };
    };

    ctx.hooks.stages = S;
  }

  return { setup };
})();
