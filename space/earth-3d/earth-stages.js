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
    // 月球直径约是地球的 27%（约 1/4），体积约 1/49，质量约 1/81
    const MOON_D = 0.27;                 // 月球直径 / 地球直径
    const MOON_M = Math.cbrt(81);        // 等质量小月球直径比 ≈ 4.33

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
            vec3 d = texture2D(day, vUv).rgb * smoothstep(-0.12, 0.25, ndl) * light;
            vec3 n = texture2D(night, vUv).rgb * 1.6 * (1.0 - smoothstep(-0.2, 0.15, ndl) * light);
            gl_FragColor = vec4(d + n, 1.0);
          }`,
      }));
      loadTex('../textures/earth_daymap.jpg').then(t => { u.day.value = t; });
      loadTex('../textures/earth_nightmap.jpg').then(t => { u.night.value = t; });
      return { mesh, u };
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
      api.fly([0, 0, 3.4]);
      lights(api.root, [3, 4, 6], 0.7);
      const earth = ball(1, '../textures/earth_daymap.jpg', { lit: true });
      api.root.add(earth);
      // 直径参考线：从南极到北极
      const dia = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, -1.06, 0), V(0, 1.06, 0)]),
        new THREE.LineBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 0.6 }));
      const n = 4, mr = MOON_D;                       // 4 个月球排成一排 = 地球直径
      const moonGeo = new THREE.SphereGeometry(mr, 24, 16);
      const moonMat = withTex(new THREE.MeshLambertMaterial(), '../textures/moon.jpg');
      const moons = [];
      for (let i = 0; i < n; i++) {
        const m = new THREE.Mesh(moonGeo, moonMat);
        m.userData.target = V(0, (i - 1.5) * mr * 2, 1.15);
        m.userData.start = m.userData.target.clone().add(V(0, 0, -2.5));
        m.position.copy(m.userData.start);
        m.scale.setScalar(0.001);
        api.root.add(m);
        moons.push(m);
      }
      const tag = label('一个月球');
      tag.position.set(0.55, 0.62, 1.15);
      api.root.add(dia, tag);
      let t0 = 0;
      api.live('月球直径约 3474 公里，约为地球的 1/4。点“排排队”');
      return {
        action() { t0 = now(); },
        update(t, dt) {
          earth.rotation.y += dt * 0.1;
          if (!t0) return;
          const seconds = (now() - t0) / 1000;
          moons.forEach((m, i) => {
            const k = ease(clamp((seconds - i * 0.45) / 0.7, 0, 1));
            m.position.lerpVectors(m.userData.start, m.userData.target, k);
            m.scale.setScalar(Math.max(0.001, k));
          });
          const done = clamp(seconds / (0.45 * 3 + 0.7), 0, 1);
          api.live(`🌙 排了 <b>${Math.round(done * n)}</b> / ${n} 个月球${done >= 1 ? ' —— 刚好是一条直径！' : ''}`);
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
      api.live('约 49 个月球才装得下一个地球（大小和排布仅示意）。点“往里装”');
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
      const earth = ball(0.62, '../textures/earth_daymap.jpg', { lit: true });
      earth.position.y = -0.72;
      pans[0].add(earth);
      // 右边堆 81 个月球
      const mr = 0.62 / MOON_M, panTop = -1.31;
      const heapPositions = [];
      const rowStep = Math.sqrt(3) * mr, layerStep = Math.sqrt(8 / 3) * mr;
      for (let layer = 0; layer < 6 && heapPositions.length < 81; layer++) {
        const shrink = Math.max(0.15, 0.95 - layer * 0.19), y = panTop + mr + layer * layerStep;
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
      api.live('一个地球 ≈ 81 个月球那么重。点“放月球”');
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
      const earth = ball(1, '../textures/earth_daymap.jpg', { lit: true });
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
      const earth = ball(0.5, '../textures/earth_daymap.jpg');
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
      api.live('地月距离约 38.4 万公里（画面压缩了）。点“出发”，让光跑一趟');
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
      api.fly([0.4, 0.4, 4.4]);
      const sunPos = V(-8, 1.5, 3);   // 太阳从侧面照过来，昼夜各一半
      const sun = sunBall(1.1);
      sun.position.copy(sunPos);
      const { mesh: earth, u } = dayNightEarth(1.4, sunPos.clone().normalize());
      const cityTex = glowTex;
      const city = new THREE.Sprite(new THREE.SpriteMaterial({ map: cityTex, color: 0xff5a4a, transparent: true, depthTest: false }));
      city.scale.setScalar(0.09);
      api.root.add(sun, earth, city);
      const DAY_SEC = 12;               // 12 秒演示一昼夜
      let t0 = 0, prevHour = -1;
      api.live('地球自转一圈 = 一天（24 小时）。点“转一天”');
      return {
        action() { t0 = now(); earth.rotation.y = 0; prevHour = -1; },
        update(t, dt) {
          if (!t0) { earth.rotation.y += dt * 0.08; }
          else {
            const k = ((now() - t0) / 1000 / DAY_SEC) % 1;
            earth.rotation.y = -k * Math.PI * 2;
            const hour = Math.floor(k * 24);
            if (hour !== prevHour) {
              prevHour = hour;
              api.live(`🕐 自转一圈 <b>${hour}</b> / 24 小时${hour >= 23 ? ' —— 一天过去啦，同一个城市再次迎接早晨' : ''}`);
            }
          }
          // 小红点固定在地球上（东经城市），随地球一起转
          const a = -Math.PI / 2 + earth.rotation.y;
          city.position.set(Math.cos(a) * 1.42, 0.35, Math.sin(a) * 1.42);
        },
      };
    };

    S.motion_year = api => {
      hideSun();
      api.fly([0, 7, 10], [0, 0, 0]);
      api.root.add(new THREE.AmbientLight(0xffffff, 0.22));
      const pl = new THREE.PointLight(0xfff2dd, 1.6, 0, 0);
      api.root.add(pl);
      const sun = sunBall(1);
      api.root.add(sun);
      const TILT = 23.5 * Math.PI / 180, D = 4.6;
      api.root.add(ring(D, 0xcfe3f5, 0.18));
      // 地轴 + 地球（地轴保持 23.5° 倾斜，公转时方向不变）
      const pivot = new THREE.Group();
      const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.3, 8), new THREE.MeshBasicMaterial({ color: 0xffe9a0 }));
      const { mesh: earth, u } = dayNightEarth(0.42, V(1, 0, 0));
      const tiltG = new THREE.Group();
      tiltG.rotation.z = TILT;
      tiltG.add(axis, earth);
      pivot.add(tiltG);
      api.root.add(pivot);
      const SEASONS = [['春', 0], ['夏', 1], ['秋', 2], ['冬', 3]];
      SEASONS.forEach(([name, k]) => {
        const a = k * Math.PI / 2 - Math.PI / 2;
        const l = label(`${name}天`, { h: 0.03 });
        l.position.set(Math.cos(a) * D, -0.55, Math.sin(a) * D);
        api.root.add(l);
      });
      const YEAR_SEC = 16;              // 16 秒演示一年
      let a = -Math.PI / 2, t0 = 0;
      const place = () => {
        pivot.position.set(Math.cos(a) * D, 0, Math.sin(a) * D);
        u.sunDir.value.copy(pivot.position).multiplyScalar(-1).normalize();   // 地球 → 原点太阳的方向，公转到哪侧都对
      };
      place();
      api.live('地轴歪着 23.5°，绕太阳一圈 = 一年，有了四季。点“过一年”');
      return {
        action() { t0 = now(); a = -Math.PI / 2; place(); },
        update(t, dt) {
          earth.rotation.y += dt * 0.4;
          if (t0) {
            const k = clamp((now() - t0) / 1000 / YEAR_SEC, 0, 1);
            a = -Math.PI / 2 + k * Math.PI * 2;
            place();
            const month = Math.min(12, Math.floor(k * 12) + 1);
            api.live(`📅 第 <b>${month}</b> 个月${k >= 1 ? ' —— 一年过去啦！' : ''}（16 秒演示一年）`);
            if (k >= 1) t0 = 0;
          } else {
            a += dt * 0.05; place();
          }
        },
      };
    };

    S.motion_moon = api => {
      hideSun();
      api.fly([0.5, 1.8, 7], [0, 0, 0]);
      lights(api.root, [-4, 3, 5], 0.35);
      const { mesh: earth, u } = dayNightEarth(1, V(-3, 1, 4).normalize());
      const D = 3.2;                    // 压缩了：真实距离约 30 个地球直径
      api.root.add(earth, ring(D, 0xcfe3f5, 0.2));
      const moon = ball(0.27, '../textures/moon.jpg', { lit: true });
      api.root.add(moon);
      const MONTH_SEC = 10;             // 10 秒演示 27.3 天
      let a = 0, t0 = 0;
      api.live('月球绕地球一圈约 27.3 天（距离压缩了）。点“转一个月”');
      return {
        action() { t0 = now(); a = 0; },
        update(t, dt) {
          earth.rotation.y += dt * 0.06;
          if (t0) {
            const k = clamp((now() - t0) / 1000 / MONTH_SEC, 0, 1);
            a = k * Math.PI * 2;
            const day = Math.min(27, Math.floor(k * 27.3) + 1);
            api.live(`🗓️ 第 <b>${day}</b> / 27 天${k >= 1 ? ' —— 一个月过去啦！' : ''}（10 秒演示 27.3 天）`);
            if (k >= 1) t0 = 0;
          } else {
            a += dt * 0.12;
          }
          moon.position.set(Math.cos(a) * D, 0, Math.sin(a) * D);
          moon.rotation.y = -a + Math.PI / 2;   // 潮汐锁定：永远同一面朝着地球
        },
      };
    };

    // ============ 会发生什么 ============
    S.act_quake = api => {
      hideSun();
      api.fly([0, 3.4, 8.5], [0, -0.5, 0]);
      lights(api.root, [3, 6, 5], 0.5);
      // 两块板块：一大块地壳从中间断开
      const rock = new THREE.MeshStandardMaterial({ color: 0x8a6f4d, roughness: 0.9 });
      const plateL = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.7, 2.4), rock);
      plateL.position.set(-1.62, -0.35, 0);
      const plateR = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.7, 2.4), rock);
      plateR.position.set(1.62, -0.35, 0);
      // 断面上的小房子
      const houses = [];
      [[-2.2, 0.4], [-1, -0.5], [1.1, 0.5], [2.3, -0.3]].forEach(([x, z]) => {
        const h = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, 0.28), new THREE.MeshStandardMaterial({ color: 0xd8c9a8 }));
        h.position.set(x, 0.12, z);
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.16, 4), new THREE.MeshStandardMaterial({ color: 0xb5502e }));
        roof.position.y = 0.2; roof.rotation.y = Math.PI / 4;
        h.add(roof);
        api.root.add(h);
        houses.push(h);
      });
      // 地震波：一圈一圈扩散的圆环
      const waves = [0, 1, 2].map(i => {
        const w = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 64),
          new THREE.MeshBasicMaterial({ color: 0xffd76b, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
        w.rotation.x = -Math.PI / 2;
        w.position.y = 0.02;
        api.root.add(w);
        return w;
      });
      const fault = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, 0.02, -1.3), V(0, 0.02, 1.3)]),
        new THREE.LineBasicMaterial({ color: 0xff8866, transparent: true, opacity: 0.8 }));
      api.root.add(plateL, plateR, fault);
      let t0 = 0;
      const L0 = plateL.position.x, R0 = plateR.position.x;
      api.live('两块板块挤在一起。点“震一下”');
      return {
        action() { t0 = now(); },
        update(t, dt) {
          if (!t0) return;
          const s = (now() - t0) / 1000;
          // 先慢慢挤（0~2.5 秒），再突然错动（2.5 秒）
          const press = smooth(0, 2.5, s) * 0.22;
          const jolt = s > 2.5 ? 0.3 * Math.exp(-(s - 2.5) * 2.2) : 0;
          const lurch = s > 2.5 ? 0.24 * smooth(2.5, 3.1, s) : 0;   // 右边板块突然错动
          plateL.position.x = L0 + press;
          plateR.position.x = R0 - press + lurch;
          plateR.position.z = lurch * 0.6;
          houses.forEach((h, i) => { h.rotation.z = jolt * Math.sin(i * 1.7 + s * 20); });
          waves.forEach((w, i) => {
            const wt = (s - 2.5 - i * 0.5) / 2.2;
            if (wt > 0 && wt < 1) {
              w.scale.setScalar(0.3 + wt * 3.4);
              w.material.opacity = (1 - wt) * 0.85;
            } else w.material.opacity = 0;
          });
          api.live(s <= 2.5 ? '🤏 板块一点一点挤紧……' : s < 5 ? '💥 错动了！地震波一圈一圈传开' : '地震波传完了。点“震一下”可以再试');
        },
      };
    };

    S.act_volcano = api => {
      hideSun();
      api.fly([0.6, 2.2, 7], [0, -0.6, 0]);
      lights(api.root, [4, 6, 5], 0.5);
      // 剖面火山：切开一半，能看见里面的岩浆通道
      const coneMat = new THREE.MeshStandardMaterial({ color: 0x6d5a44, roughness: 0.95, side: THREE.DoubleSide });
      const cone = new THREE.Mesh(new THREE.ConeGeometry(1.9, 2.2, 48, 1, true, 0, Math.PI), coneMat);
      cone.position.y = 0;
      const inner = new THREE.Mesh(new THREE.ConeGeometry(1.35, 1.9, 48, 1, true, 0, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0xff7a2a, emissive: 0xff5a10, emissiveIntensity: 0.8, side: THREE.DoubleSide }));
      inner.position.y = -0.1;
      const ground = new THREE.Mesh(new THREE.CircleGeometry(4.5, 48), new THREE.MeshStandardMaterial({ color: 0x4d6b3a, roughness: 1 }));
      ground.rotation.x = -Math.PI / 2; ground.position.y = -1.1;
      // 岩浆通道：从地下通到火山口
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 1.6, 16),
        new THREE.MeshStandardMaterial({ color: 0xff8a3a, emissive: 0xff6a1a, emissiveIntensity: 1 }));
      pipe.position.set(0, -0.5, 0.9);
      const crater = glow(0xff9a4a, 0.7, { strength: 1.4 });
      crater.position.set(0, 1.12, 0);
      api.root.add(cone, inner, ground, pipe, crater);
      // 喷出的岩浆粒子和烟
      const N = 260, pos = new Float32Array(N * 3), P = [];
      for (let i = 0; i < N; i++) P.push({ t: Math.random() * 3 });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const lava = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffa040, size: 0.09, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
      api.root.add(lava);
      // 真实火山照片（主 agent 提供的 assets/photos/volcano.jpg）
      const photo = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.7), withTex(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.95 }), 'assets/photos/volcano.jpg'));
      photo.position.set(3.1, 0.4, -0.8);
      photo.rotation.y = -0.4;
      const ptag = label('真实火山照片', { h: 0.024 });
      ptag.position.set(3.1, -0.65, -0.8);
      api.root.add(photo, ptag);
      let t0 = 0;
      api.live('剖开火山看里面。点“喷一下”');
      return {
        action() { t0 = now(); P.forEach(p => { p.t = Math.random() * 0.5; }); },
        update(t, dt) {
          crater.material.opacity = 0.5 + 0.3 * Math.sin(t / 300);
          if (!t0) return;
          const s = (now() - t0) / 1000;
          const power = s < 0.4 ? s / 0.4 : Math.exp(-(s - 0.4) * 0.55);   // 越喷越弱
          P.forEach((p, i) => {
            p.t += dt * (0.7 + power);
            const lt = p.t % 3;
            const ang = i * 2.399;
            const spread = lt * 0.32;
            pos.set([
              Math.cos(ang) * spread * (0.4 + power),
              1.1 + lt * 1.6 * power - lt * lt * 0.55,
              Math.sin(ang) * spread * (0.4 + power),
            ], i * 3);
          });
          geo.attributes.position.needsUpdate = true;
          lava.material.opacity = Math.min(1, power * 1.4);
          api.live(power > 0.35 ? '🌋 岩浆从地下通道涌上来，喷出火山口！' : '喷发慢慢停下来了。点“喷一下”再来一次');
        },
      };
    };

    S.act_typhoon = api => {
      hideSun();
      api.fly([0, 6.5, 8], [0, 0, 0]);
      // 海面
      const sea = new THREE.Mesh(new THREE.CircleGeometry(6, 48), new THREE.MeshStandardMaterial({ color: 0x14507d, roughness: 0.6 }));
      sea.rotation.x = -Math.PI / 2;
      api.root.add(sea, new THREE.AmbientLight(0xffffff, 0.5));
      // 螺旋云带：一群软软的白点排成旋臂，绕着风眼转
      const N = 900, pos = new Float32Array(N * 3), seeds = [];
      for (let i = 0; i < N; i++) seeds.push({ r: 0.7 + Math.random() * 3.6, arm: i % 3, w: 0.9 + Math.random() * 0.3, j: (Math.random() - .5) * 0.5 });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const clouds = new THREE.Points(geo, new THREE.PointsMaterial({
        map: glowTex, color: 0xffffff, size: 0.5, transparent: true, opacity: 0.8, depthWrite: false,
      }));
      clouds.rotation.x = -Math.PI / 2;
      api.root.add(clouds);
      const eye = glow(0x9fd0ff, 0.9, { strength: 0.9 });
      eye.position.y = 0.15;
      api.root.add(eye);
      // 真实台风卫星照片（assets/photos/hurricane.jpg）
      const photo = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.8), withTex(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.95 }), 'assets/photos/hurricane.jpg'));
      photo.position.set(4.2, 2.6, -1.5);
      photo.rotation.y = -0.5;
      const ptag = label('卫星拍的真实台风', { h: 0.024 });
      ptag.position.set(4.2, 0.9, -1.5);
      api.root.add(photo, ptag);
      let a = 0, fast = 0;
      api.live('云排成螺旋形，绕着风眼打转。点“转快点”');
      return {
        action() { fast = now(); },
        update(t, dt) {
          a += dt * (now() - fast < 6000 ? 2.4 : 0.7);
          seeds.forEach((sd, i) => {
            const th = sd.arm * (Math.PI * 2 / 3) + sd.r * 1.9 - a * sd.w;
            const rr = sd.r + sd.j;
            pos.set([Math.cos(th) * rr, Math.sin(th) * rr, 0.2 + sd.j * 0.4], i * 3);
          });
          geo.attributes.position.needsUpdate = true;
          api.live(now() - fast < 6000 ? '🌀 转得好快！中间的风眼反而很平静' : '🌀 台风一直在转：里面的云被甩成一条条旋臂');
        },
      };
    };

    S.act_aurora = api => {
      hideSun();
      api.fly([-1, 4, 13], [-1.2, 0, 0]);
      const sun = sunBall(1);
      sun.position.set(-9, 0, 0);
      const EX = 3.5, ER = 1;
      const earth = ball(ER, '../textures/earth_daymap.jpg');
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
      api.fly([0.4, 1.4, 6.5], [0, -0.4, 0]);
      lights(api.root, [3, 5, 6], 0.6);
      const earth = ball(0.85, '../textures/earth_daymap.jpg', { lit: true });
      earth.position.set(-2.6, 0.9, 0);
      const etag = label('从太空看：地球是蓝色的');
      etag.position.set(-2.6, 1.95, 0);
      api.root.add(earth, etag);
      // 10 个一样的杯子，7 个倒进蓝色海水
      const cups = [];
      for (let i = 0; i < 10; i++) {
        const x = -2.7 + i * 0.6;
        const glass = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.5),
          new THREE.MeshStandardMaterial({ color: 0xd8e8f2, transparent: true, opacity: 0.25, roughness: 0.1 }));
        glass.position.set(x, -0.9, 0);
        const water = new THREE.Mesh(new THREE.BoxGeometry(0.44, 1, 0.44),
          new THREE.MeshStandardMaterial({ color: 0x2e8fd8, transparent: true, opacity: 0.85 }));
        water.position.set(x, -1.4, 0);   // 底部对齐，往上长
        water.scale.y = 0.001;
        api.root.add(glass, water);
        cups.push(water);
      }
      let t0 = 0;
      api.live('把地球分成 10 份。点“分一分”');
      return {
        action() { t0 = now(); cups.forEach(w => { w.scale.y = 0.001; }); },
        update(t, dt) {
          earth.rotation.y += dt * 0.15;
          if (!t0) return;
          const s = (now() - t0) / 1000;
          cups.forEach((w, i) => {
            const k = ease(clamp((s - i * 0.35) / 0.9, 0, 1));
            w.scale.y = Math.max(0.001, k);
            w.position.y = -1.4 + k * 0.5;
          });
          const filled = cups.filter((w, i) => i < 7 && w.scale.y > 0.9).length;
          api.live(`🌊 10 份里 <b>${filled}</b> 份是海洋${filled >= 7 ? ' —— 所以地球叫“蓝色星球”！' : ''}`);
        },
      };
    };

    S.life_land = api => {
      hideSun();
      api.fly([0, 2.6, 8], [0, -0.4, 0]);
      lights(api.root, [3, 6, 5], 0.55);
      // 三种地表并排：山地 / 平原 / 沙漠
      const ground = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 3), new THREE.MeshStandardMaterial({ color: 0x5d7d46, roughness: 1 }));
      ground.position.y = -0.2;
      api.root.add(ground);
      const snowMat = new THREE.MeshStandardMaterial({ color: 0xf0f4f8, roughness: 0.8 });
      [[-1.9, 0.9, 1.6], [-3.4, 1.3, 2.1], [-0.6, 0.7, 1.2]].forEach(([x, h, r]) => {
        const mtn = new THREE.Mesh(new THREE.ConeGeometry(r * 0.55, h, 4), new THREE.MeshStandardMaterial({ color: 0x7d6a55, roughness: 1, flatShading: true }));
        mtn.position.set(x, h / 2, -0.4);
        mtn.rotation.y = Math.random() * 3;
        const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.22, h * 0.35, 4), snowMat);
        cap.position.set(x, h * 0.82, -0.4);
        cap.rotation.y = mtn.rotation.y;
        api.root.add(mtn, cap);
      });
      const desert = new THREE.Mesh(new THREE.CircleGeometry(1.5, 32), new THREE.MeshStandardMaterial({ color: 0xd8b56a, roughness: 1 }));
      desert.rotation.x = -Math.PI / 2;
      desert.position.set(3.2, 0.01, -0.4);
      api.root.add(desert);
      [[2.4, 0.3], [3.6, -0.9], [4.1, 0.5], [2.9, 1]].forEach(([x, z]) => {
        const dune = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), new THREE.MeshStandardMaterial({ color: 0xe0c078, roughness: 1 }));
        dune.scale.y = 0.45;
        dune.position.set(x, 0.05, z - 0.4);
        api.root.add(dune);
      });
      const earth = ball(0.55, '../textures/earth_daymap.jpg', { lit: true });
      earth.position.set(0, 2.2, -1.2);
      api.root.add(earth);
      const LANDS = [
        { name: '⛰️ 山地', pos: [-2, 1.7, -0.4], view: [[-2, 1.8, 4.5], [-2, 0.4, -0.4]] },
        { name: '🌾 平原', pos: [0.6, 0.8, 0.6], view: [[0.6, 1.4, 4.5], [0.6, 0, 0]] },
        { name: '🏜️ 沙漠', pos: [3.2, 1.1, -0.4], view: [[3.2, 1.6, 4], [3.2, 0.2, -0.4]] },
      ];
      const tags = LANDS.map(l => { const t = label(l.name); t.position.set(...l.pos); t.visible = false; api.root.add(t); return t; });
      let step = -1;
      api.live('地球表面有各种各样的样子。点“看一看”');
      return {
        action() {
          step = (step + 1) % LANDS.length;
          tags.forEach((t, i) => { t.visible = i === step; });
          api.fly(...LANDS[step].view, 1500);
          api.live(`👀 这是${LANDS[step].name.replace(/^.\s/, '')}`);
        },
      };
    };

    S.life_air = api => {
      hideSun();
      api.fly([0, 0.3, 4.6]);
      // 大气层：地球 + 一圈淡淡的蓝边；太阳低时边缘变红（晚霞）
      const u = { sunH: { value: 1 }, day: { value: null } };
      const earth = new THREE.Mesh(new THREE.SphereGeometry(1.3, 96, 64), new THREE.ShaderMaterial({
        uniforms: u,
        vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vWorld; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); vec4 wp = modelMatrix * vec4(position, 1.0); vWorld = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }',
        fragmentShader: `
          uniform sampler2D day; uniform float sunH;
          varying vec2 vUv; varying vec3 vN; varying vec3 vWorld;
          void main(){
            vec3 c = texture2D(day, vUv).rgb;
            // 边缘 = 法线和视线的夹角，镜头怎么拖都对
            float rim = pow(1.0 - clamp(dot(normalize(vN), normalize(cameraPosition - vWorld)), 0.0, 1.0), 2.2);
            // 大气边缘：太阳高时是蓝光（瑞利散射），太阳低时变红（晚霞）
            vec3 sky = mix(vec3(1.0, 0.38, 0.15), vec3(0.35, 0.62, 1.0), clamp(sunH, 0.0, 1.0));
            gl_FragColor = vec4(c + sky * rim * 0.9, 1.0);
          }`,
      }));
      loadTex('../textures/earth_daymap.jpg').then(t => { u.day.value = t; });
      const sun = sunBall(0.5);
      const sunSprite = glow(0xffe9b0, 2, { strength: 1.2 });
      api.root.add(earth, sun, sunSprite);
      let sunset = false;
      const place = k => {
        // k=1 太阳在头顶，k=0 落到地平线上
        sun.position.set(-4.2, 0.3 + k * 3.2, -1);
        sunSprite.position.copy(sun.position);
      };
      place(1);
      api.live('☀️ 现在是正午：大气把蓝光散得满地都是，天是蓝的');
      return {
        action() {
          sunset = !sunset;
          api.live(sunset ? '🌇 太阳落山了：光要穿过更厚的大气，蓝光散光了，剩下红彤彤的晚霞' : '☀️ 现在是正午：大气把蓝光散得满地都是，天是蓝的');
        },
        update(t, dt, rawDt) {
          earth.rotation.y += dt * 0.06;
          const f = 1 - Math.exp(-rawDt * 1.5);
          u.sunH.value += ((sunset ? 0 : 1) - u.sunH.value) * f;
          place(u.sunH.value);
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
      api.live('💧 水在天上和地上旅行。点“再旅行一次”');
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
      api.fly([0, 2.5, 9]);
      const bg = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), withTex(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.5, depthWrite: false }), '../textures/deep-sky/orion_m42.jpg'));
      bg.position.z = -12;
      const N = 2400, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), P = [];
      const palette = [[1, .55, .6], [.55, .7, 1], [1, .8, .5], [.9, .6, 1]];
      for (let i = 0; i < N; i++) {
        const r = 4.2 * Math.cbrt(Math.random()), th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        P.push({ r, th, y: r * Math.cos(ph) * 0.35, rr: r * Math.sin(ph) });
        col.set(palette[i % 4], i * 3);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const disk = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
      api.root.add(bg, disk);
      const baby = glow(0xfff0c0, 0.01, { strength: 1.6 });
      api.root.add(baby);
      let t0 = 0;
      api.live('背景是哈勃拍的猎户座大星云。点“转起来”');
      return {
        action() { t0 = now(); },
        update(t, dt) {
          const k = t0 ? ease(clamp((now() - t0) / 8000, 0, 1)) : 0;
          P.forEach((p, i) => {
            p.th += dt * (0.04 + 0.5 * k / (0.3 + p.rr * (1 - 0.85 * k)));   // 越缩转得越快
            const rr = p.rr * (1 - 0.85 * k);
            pos.set([Math.cos(p.th) * rr, p.y * (1 - 0.95 * k), Math.sin(p.th) * rr], i * 3);
          });
          geo.attributes.position.needsUpdate = true;
          baby.scale.setScalar(0.01 + 2 * smooth(0.4, 1, k));
          if (k >= 1) api.live('🎉 太阳在中间亮起来了，周围剩下的一圈尘埃，后来聚成了地球和其他行星');
        },
      };
    };

    S.story_birth = api => {
      hideSun();
      api.fly([0, 0.6, 8.5]);
      // 尘埃先聚成一个炽热的大球，再分成一层一层
      const N = 2000, pos = new Float32Array(N * 3), P = [];
      for (let i = 0; i < N; i++) {
        const r = 6 * Math.cbrt(Math.random()), a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
        P.push({ dir: V(Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a)), r });
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const dust = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffc890, size: 0.06, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
      api.root.add(dust);
      const hot = new THREE.Mesh(new THREE.SphereGeometry(1.35, 64, 48),
        new THREE.MeshBasicMaterial({ color: 0xff6a1a, transparent: true, opacity: 0 }));
      api.root.add(hot);
      // 三层圈：地壳 / 地幔 / 地核
      const LAYERS = [
        ['🪨 地壳：最薄最硬的一层', 1.0, 0xd8c9a8],
        ['🟠 地幔：滚烫的慢动作石头', 0.82, 0xff9a4a],
        ['🟡 地核：铁做的，最热', 0.5, 0xffe06b],
      ];
      const layers = LAYERS.map(([name, r, c]) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(r * 1.35, 48, 32),
          new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, wireframe: r !== 0.5 }));
        const l = label(name, { h: 0.024 });
        l.position.set(0, -1.35 * r - 0.25, 0);
        l.visible = false;
        api.root.add(m, l);
        return { m, l };
      });
      let t0 = 0;
      api.live('46 亿年前，尘埃慢慢聚在一起。点“聚起来”');
      return {
        action() {
          t0 = now();
          layers.forEach(({ m, l }) => { m.material.opacity = 0; l.visible = false; });
        },
        update(t, dt) {
          if (!t0) return;
          const s = (now() - t0) / 1000;
          const k = ease(clamp(s / 5, 0, 1));
          P.forEach((p, i) => {
            const r = p.r * (1 - 0.92 * k);
            pos.set([p.dir.x * r, p.dir.y * r, p.dir.z * r], i * 3);
          });
          geo.attributes.position.needsUpdate = true;
          hot.material.opacity = smooth(0.5, 1, k) * 0.95;
          hot.scale.setScalar(0.6 + 0.4 * k);
          const lk = ease(clamp((s - 5.5) / 2, 0, 1));
          layers.forEach(({ m, l }, i) => {
            const on = s > 5.5 + i * 0.5;
            m.material.opacity = on ? (i === 2 ? 0.85 : 0.35) * lk : 0;
            l.visible = on;
          });
          api.live(s < 5 ? `☄️ 尘埃聚在一起……变成一颗滚烫的地球（${Math.round(k * 100)}%）` : '🌡️ 热地球慢慢分成三层：地壳、地幔、地核');
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
      api.live('很久很久以前，一颗行星撞上了年轻的地球。点“撞一下”');
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
      api.fly([0, 0.3, 4.2]);
      // 炽热地球 → 冷却出海洋 → 绿色生命：一个 shader  uniform 三段变化
      const u = { day: { value: null }, heat: { value: 1 }, life: { value: 0 } };
      const earth = new THREE.Mesh(new THREE.SphereGeometry(1.4, 96, 64), new THREE.ShaderMaterial({
        uniforms: u,
        vertexShader: 'varying vec2 vUv; varying vec3 vN; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `
          uniform sampler2D day; uniform float heat, life;
          varying vec2 vUv; varying vec3 vN;
          void main(){
            vec3 e = texture2D(day, vUv).rgb;
            vec3 molten = vec3(1.0, 0.42, 0.1) * (0.6 + 0.4 * e.r);
            vec3 cool = e * (1.0 + life * vec3(-0.2, 0.35, -0.2));   // 生命让大陆变绿
            gl_FragColor = vec4(mix(molten, cool, heat), 1.0);
          }`,
      }));
      loadTex('../textures/earth_daymap.jpg').then(t => { u.day.value = t; });
      api.root.add(earth);
      let t0 = 0;
      api.live('早期的地球是个滚烫的火球。点“慢慢变”');
      return {
        action() { t0 = now(); },
        update(t, dt, rawDt) {
          earth.rotation.y += dt * 0.08;
          const f = 1 - Math.exp(-rawDt * 0.8);
          if (!t0) return;
          const s = (now() - t0) / 1000;
          u.heat.value += ((s < 4 ? 0 : clamp((s - 4) / 5, 0, 1)) - u.heat.value) * f;
          u.life.value += ((s < 8 ? 0 : clamp((s - 8) / 4, 0, 1)) - u.life.value) * f;
          api.live(s < 4 ? '🌡️ 火球慢慢冷却下来……' : s < 8 ? '🌊 水汽凝结，下起大雨，海洋出现了' : u.life.value > 0.9 ? '🦠 海洋里出现了最早的生命！' : '🦠 生命正在海洋里悄悄出现……');
        },
      };
    };

    // ============ 谁去研究过 ============
    S.probe_round = api => {
      hideSun();
      api.fly([0, 1.6, 9], [0, 0, -1]);
      // 海平面 + 远处微微弯曲的海面：船开出去，先沉下去的是船身，桅杆最后消失
      const ocean = new THREE.Mesh(new THREE.CircleGeometry(30, 64), new THREE.MeshStandardMaterial({ color: 0x14507d, roughness: 0.6 }));
      ocean.rotation.x = -Math.PI / 2;
      ocean.position.y = -0.85;
      api.root.add(ocean, new THREE.AmbientLight(0xffffff, 0.55));
      const d = lights(api.root, [2, 5, 8], 0.3);
      // 地球弧线示意（实际上海面本身就是圆球表面的一部分，这里用贴地弧线提示）
      const arcPts = [];
      for (let i = 0; i <= 60; i++) {
        const x = -12 + 24 * i / 60;
        arcPts.push(V(x, -0.85 - x * x * 0.012, -x * x * 0.004));
      }
      const horizon = new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcPts), new THREE.LineBasicMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.6 }));
      api.root.add(horizon);
      // 小船：船身 + 桅杆
      const ship = new THREE.Group();
      const hull = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.22, 0.22), new THREE.MeshStandardMaterial({ color: 0x8a5a2e }));
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8), new THREE.MeshStandardMaterial({ color: 0x5a4020 }));
      mast.position.y = 0.4;
      const sail = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.42), new THREE.MeshStandardMaterial({ color: 0xf0ead8, side: THREE.DoubleSide }));
      sail.position.set(0.14, 0.42, 0);
      ship.add(hull, mast, sail);
      api.root.add(ship);
      let t0 = 0;
      api.live('古人发现：船开远了，会先看不见船身，最后才看不见桅杆。点“开船”');
      return {
        action() { t0 = now(); },
        update(t, dt) {
          if (!t0) { ship.position.set(2, -0.75, 3); return; }
          const k = ease(clamp((now() - t0) / 7000, 0, 1));
          const x = 2 + k * 8;
          ship.position.set(x, -0.75 - x * x * 0.012, 3 - k * 2);   // 沿着弯曲的海面往下沉
          ship.rotation.z = -x * 0.024;
          api.live(k < 0.4 ? '⛵ 船开远了……' : k < 0.75 ? '👀 船身先沉到海平面下面，只剩桅杆！' : k >= 1 ? '🌍 桅杆也消失了 —— 海面是弯的，地球是圆的！' : '👀 只剩桅杆了……');
        },
      };
    };

    S.probe_magellan = api => {
      hideSun();
      api.fly([0, 0.4, 6.2]);
      lights(api.root, [-4, 2, 5], 0.5);
      const earth = ball(1.3, '../textures/earth_daymap.jpg', { lit: true });
      api.root.add(earth);
      // 麦哲伦船队的航线：绕地球一圈的粗线
      const pts = [];
      for (let i = 0; i <= 120; i++) {
        const a = i / 120 * Math.PI * 2;
        pts.push(V(Math.cos(a) * 1.33, Math.sin(a * 2) * 0.28, Math.sin(a) * 1.33));
      }
      const path = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xffd76b, transparent: true, opacity: 0.75 }));
      api.root.add(path);
      // 走过的部分变亮：用第二条线按进度画
      const doneGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const done = new THREE.Line(doneGeo, new THREE.LineBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 1 }));
      done.geometry.setDrawRange(0, 0);
      api.root.add(done);
      const ship = new THREE.Group();
      const hull = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.05), new THREE.MeshStandardMaterial({ color: 0x8a5a2e }));
      const sail = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.12), new THREE.MeshStandardMaterial({ color: 0xf0ead8, side: THREE.DoubleSide }));
      sail.position.set(0.03, 0.08, 0);
      ship.add(hull, sail);
      ship.scale.setScalar(2.2);
      api.root.add(ship);
      let t0 = 0;
      const TRIP = 14;                  // 14 秒演示三年的航行
      api.live('500 多年前，麦哲伦船队从西班牙出发。点“出发”');
      return {
        action() { t0 = now(); done.geometry.setDrawRange(0, 0); },
        update(t, dt) {
          earth.rotation.y += t0 ? 0 : dt * 0.1;
          if (!t0) return;
          const k = clamp((now() - t0) / 1000 / TRIP, 0, 1);
          const idx = Math.floor(k * 120);
          done.geometry.setDrawRange(0, idx + 1);
          ship.position.copy(pts[idx]);
          ship.lookAt(pts[Math.min(120, idx + 2)]);
          const years = (3 * k).toFixed(1);
          api.live(`⛵ 航行中……约 <b>${years}</b> / 3 年${k >= 1 ? ' —— 船队绕地球一圈回到了起点！' : ''}（14 秒演示三年）`);
        },
      };
    };

    S.probe_apollo = api => {
      hideSun();
      api.fly([0, 0.4, 6.5]);
      lights(api.root, [-4, 2, 5], 0.45);
      const moon = ball(1.1, '../textures/moon.jpg', { lit: true });
      moon.position.set(-3.4, -0.3, 0);
      const earth = ball(0.5, '../textures/earth_daymap.jpg', { lit: true });
      earth.position.set(3.2, 0.6, 0);
      api.root.add(moon, earth);
      // 阿波罗 17 号拍的照片「蓝色弹珠」（assets/photos/blue-marble.jpg）
      const photo = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), withTex(new THREE.MeshBasicMaterial({ transparent: true }), 'assets/photos/blue-marble.jpg'));
      photo.position.set(0, 0.3, -1.2);
      api.root.add(photo);
      const tag = label('📷 蓝色弹珠 · 阿波罗 17 号 · 1972 年', { h: 0.026 });
      tag.position.set(0, -1.35, -1.2);
      api.root.add(tag);
      let t0 = 0;
      api.live('宇航员在飞向月球的路上回头拍下了整张地球。点“拍照片”');
      return {
        action() { t0 = now(); api.fly([0, 0.35, 2.6], [0, 0.35, -1.2], 3000); },   // 镜头凑近照片
        update(t, dt) {
          earth.rotation.y += dt * 0.12;
          moon.rotation.y += dt * 0.03;
          if (t0 && now() - t0 > 3000) api.live('🔵 小小的蓝色圆球悬浮在黑色太空里 —— 这就是我们的家');
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
      const earth = ball(1.15, '../textures/earth_daymap.jpg', { lit: true });
      api.root.add(sun, earth);
      // 空间站 + 卫星在不同高度的轨道上绕地球
      const SATS = [
        { name: '空间站', color: 0xffffff, r: 1.55, speed: 0.9, tilt: 0.35 },
        { name: '气象卫星', color: 0x6fd0ff, r: 2.1, speed: 0.55, tilt: 1.2 },
        { name: '导航卫星', color: 0xffc86b, r: 2.7, speed: 0.4, tilt: -0.6 },
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
      api.live('空间站离地面约 400 公里（大小和距离都压缩了），绕一圈约 90 分钟。点“看一圈”');
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
