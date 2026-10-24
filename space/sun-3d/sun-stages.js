/* 真实的太阳 · 六个场景模块的 3D 场景
   有多大多重、怎么动、会发生什么、和我们的关系、一生的故事、谁去研究过。
   每个函数接收 api（见 ../explorer/stage.js），把物体加进 api.root，返回 { update, action, slider, exit }。
   星球、星云、照片都用真实贴图；比例做了缩小，场景里会说明“不是真实比例”。 */
window.SunStages = (() => {
  'use strict';

  function setup(ctx) {
    const { loadTex, renderer } = ctx;
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const now = () => performance.now();
    const ease = ctx.ease;
    const clamp = THREE.MathUtils.clamp;
    const smooth = (a, b, x) => THREE.MathUtils.smoothstep(x, a, b);

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
    // 用 SDO 可见光贴图画的小太阳（可以再混一张红巨星贴图）
    function sunBall(r) {
      const uniforms = {
        map: { value: null }, map2: { value: null }, mix2: { value: 0 },
        tint: { value: new THREE.Vector3(1.16, 0.82, 0.38) }, tint2: { value: new THREE.Vector3(1.3, 0.55, 0.3) }, gain: { value: 1 },
      };
      const mat = new THREE.ShaderMaterial({
        uniforms, transparent: true,
        vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vN = normalize(mat3(modelMatrix) * normal); vV = cameraPosition - wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }',
        fragmentShader: `
          uniform sampler2D map, map2; uniform float mix2, gain; uniform vec3 tint, tint2;
          varying vec2 vUv; varying vec3 vN; varying vec3 vV;
          void main(){
            float mu = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
            vec3 a = vec3(texture2D(map, vUv).r * 1.45) * tint;
            vec3 b = texture2D(map2, vUv).rgb * tint2;
            vec3 c = mix(a, b, mix2) * (1.0 - vec3(0.56, 0.72, 0.86) * (1.0 - mu));
            gl_FragColor = vec4(c * gain, gain);
          }`,
      });
      loadTex('assets/map-visible.jpg', THREE.RepeatWrapping).then(t => { uniforms.map.value = t; });
      return { mesh: new THREE.Mesh(new THREE.SphereGeometry(r, 64, 48), mat), uniforms };
    }
    const glowTex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const g = c.getContext('2d'), grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(.25, 'rgba(255,255,255,.7)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    })();
    function glow(color, size, { screen = false, strength = 1 } = {}) {
      const m = new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: !screen });
      m.color.multiplyScalar(strength);
      const s = new THREE.Sprite(m);
      s.scale.setScalar(size);
      return s;
    }
    // 文字标签：按屏幕大小画，镜头远近都看得清
    function label(text, { color = '#dccfb8', h = 0.028 } = {}) {   // 颜色略暗，免得被辉光糊掉
      const c = document.createElement('canvas'), g = c.getContext('2d');
      const font = '700 44px "Noto Sans SC", sans-serif';
      g.font = font;
      const w = Math.ceil(g.measureText(text).width) + 36;
      c.width = w; c.height = 64;
      g.font = font;
      g.fillStyle = 'rgba(10,8,6,.55)';
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
    const hideSun = () => ctx.hooks.sun.setVisible(false);
    const wan = n => n >= 1e4 ? `${(n / 1e4).toFixed(n >= 1e5 ? 0 : 1)} 万` : `${Math.round(n)}`;
    // 开普勒运动：给平近点角求椭圆上的位置
    function kepler(M, a, e) {
      let E = M;
      for (let i = 0; i < 6; i++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      return { x: a * (Math.cos(E) - e), z: a * Math.sqrt(1 - e * e) * Math.sin(E), r: a * (1 - e * Math.cos(E)) };
    }
    function ellipse(a, e, color, opacity) {
      const pts = [];
      for (let i = 0; i <= 200; i++) { const k = kepler(i / 200 * Math.PI * 2, a, e); pts.push(V(k.x, 0, k.z)); }
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
    }
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
      api.fly([0, 0, 3.2]);
      const n = 109, r = 1 / 109;
      const inst = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 12, 8), withTex(new THREE.MeshBasicMaterial(), '../textures/earth_daymap.jpg'), n);
      const m = new THREE.Matrix4();
      for (let i = 0; i < n; i++) {
        const x = -1 + (2 * i + 1) / n;
        m.setPosition(x, 0, Math.sqrt(Math.max(0, 1 - x * x)) + r * 1.5);   // 贴着太阳正面排一行
        inst.setMatrixAt(i, m);
      }
      inst.count = 0;
      const tag = label('一个小蓝点 = 一个地球');
      tag.position.set(-0.75, 0.12, 0.7);
      tag.visible = false;
      api.root.add(inst, tag);
      let t0 = 0;
      api.live('点“排排队”，看看要多少个地球');
      return {
        action() { t0 = now(); },
        update() {
          if (!t0) return;
          const c = Math.min(n, Math.floor((now() - t0) / 45));
          inst.count = c;
          tag.visible = c > 0;
          api.live(`🌍 已经排了 <b>${c}</b> 个地球${c === n ? ' —— 刚好排满！' : ''}`);
        },
      };
    };

    S.size_fill = api => {
      api.fly([0, 0.6, 4]);
      const N = 500, pos = new Float32Array(N * 3), seeds = [];
      for (let i = 0; i < N; i++) seeds.push({ dir: V(Math.random() - .5, Math.random() * .8 + .3, Math.random() - .5).normalize(), off: Math.random() });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x5aa8ff, size: 0.045, sizeAttenuation: true }));
      pts.visible = false;
      api.root.add(pts);
      let t0 = 0;
      api.live('点“往里装”，把地球倒进太阳里');
      return {
        action() { t0 = now(); pts.visible = true; },
        update() {
          if (!t0) return;
          const t = (now() - t0) / 1000;
          seeds.forEach((s, i) => {
            const k = (t * 0.8 + s.off) % 1;           // 从外面落进太阳中心
            const p = s.dir.clone().multiplyScalar(2.6 * (1 - k));
            pos.set([p.x, p.y, p.z], i * 3);
          });
          geo.attributes.position.needsUpdate = true;
          const done = ease(clamp(t / 7, 0, 1));
          api.live(`🫙 已经装了 <b>${wan(1300000 * done)}</b> 个地球${done >= 1 ? ' —— 装满啦！' : ''}`);
          if (done >= 1 && t > 8) pts.visible = false;
        },
      };
    };

    S.size_mass = api => {
      hideSun();
      api.fly([0, 0.4, 11], [0, -0.4, 0]);
      lights(api.root, [3, 6, 6], 0.5);
      const wood = new THREE.MeshStandardMaterial({ color: 0xc9a46a, metalness: 0.2, roughness: 0.6 });
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 2.4, 16), wood);
      post.position.y = -1.2;
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.15, 32), wood);
      base.position.y = -2.4;
      const beam = new THREE.Group();
      beam.add(new THREE.Mesh(new THREE.BoxGeometry(6, 0.1, 0.12), wood));
      const pans = [-2.8, 2.8].map(x => {
        const g = new THREE.Group();
        g.position.x = x;
        const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.7, 0.08, 32), new THREE.MeshStandardMaterial({ color: 0xd7c08a, metalness: 0.5, roughness: 0.3 }));
        pan.position.y = -1.3;
        const strings = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), V(-0.8, -1.3, 0), V(0, 0, 0), V(0.8, -1.3, 0)]), new THREE.LineBasicMaterial({ color: 0xbbbbbb }));
        g.add(pan, strings);
        beam.add(g);
        return g;
      });
      const sun = sunBall(0.75);
      sun.mesh.position.y = -0.5;
      pans[0].add(sun.mesh);
      const earthGeo = new THREE.SphereGeometry(0.07, 12, 8);
      const heap = new THREE.InstancedMesh(earthGeo, withTex(new THREE.MeshLambertMaterial(), '../textures/earth_daymap.jpg'), 220);
      const m = new THREE.Matrix4();
      for (let i = 0; i < 220; i++) {   // 堆成小山
        const layer = Math.floor(Math.sqrt(i)), a = i * 2.4;
        const rr = 0.75 * (1 - layer / 16) * Math.sqrt(Math.random());
        m.setPosition(Math.cos(a) * rr, -1.2 + layer * 0.07, Math.sin(a) * rr);
        heap.setMatrixAt(i, m);
      }
      heap.count = 0;
      pans[1].add(heap);
      const tagS = label('太阳'), tagE = label('地球');
      tagS.position.set(-2.8, -2.05, 0.9); tagE.position.set(2.8, -2.05, 0.9);
      api.root.add(post, base, beam, tagS, tagE);
      beam.rotation.z = 0.32;
      let t0 = 0;
      api.live('现在太阳这边沉下去了。点“放地球”');
      return {
        action() { t0 = now(); },
        update() {
          const k = t0 ? ease(clamp((now() - t0) / 6000, 0, 1)) : 0;
          beam.rotation.z = 0.32 * (1 - k);
          pans.forEach(p => { p.rotation.z = -beam.rotation.z; });   // 秤盘保持水平
          heap.count = Math.round(220 * k);
          if (t0) api.live(`⚖️ 放了 <b>${wan(333000 * k)}</b> 个地球${k >= 1 ? ' —— 平啦！' : ''}`);
        },
      };
    };

    S.size_weight = api => {
      hideSun();
      const home = [[0.3, 0.5, 6.5], [0.3, 0, 0]];
      api.fly(...home);
      const moon = ball(0.27, '../textures/moon.jpg');
      moon.position.set(-2.6, 0, 0);
      const earth = ball(0.5, '../textures/earth_daymap.jpg');
      earth.position.set(-1, 0, 0);
      const sun = sunBall(3);
      sun.mesh.position.set(4.6, 0, -1.5);
      const tags = [['🌙 月球', moon, 0.45], ['🌍 地球', earth, 0.7], ['☀️ 太阳', sun.mesh, 3.2]].map(([t, o, dy]) => {
        const l = label(t); l.position.copy(o.position).add(V(0, -dy, 0)); return l;
      });
      api.root.add(moon, earth, sun.mesh, ...tags);
      const G = { moon: 0.165, earth: 1, sun: 27.9 };
      let kg = 20, pick = 'earth';
      const fmt = v => (v < 10 ? v.toFixed(1) : Math.round(v));
      function show() {
        api.live(['moon', 'earth', 'sun'].map(k => {
          const name = { moon: '🌙 月球', earth: '🌍 地球', sun: '☀️ 太阳' }[k];
          const v = `${fmt(kg * G[k])} 公斤`;
          return k === pick ? `<span class="big">${name}：<b>${v}</b></span>` : `${name}：${v}`;
        }).join('　'));
      }
      show();
      const views = { moon: [[-2.6, 0.2, 1.6], [-2.6, 0, 0]], earth: [[-1, 0.2, 2.4], [-1, 0, 0]], sun: [[1.6, 0.6, 6], [3.2, 0, -1]] };
      return {
        slider(v) { kg = v; show(); },
        action(id) { pick = id; show(); api.fly(...views[id], 1400); },
        update() { earth.rotation.y += 0.003; moon.rotation.y += 0.002; },
      };
    };

    S.size_far = api => {
      hideSun();
      api.fly([1.5, 4, 18], [1.5, 0, 0]);
      const sun = sunBall(1);
      sun.mesh.position.set(-7, 0, 0);
      const earth = ball(0.22, '../textures/earth_daymap.jpg');
      earth.position.set(7, 0, 0);
      const path = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(-6, 0, 0), V(6.8, 0, 0)]), new THREE.LineDashedMaterial({ color: 0xffe9a0, dashSize: 0.25, gapSize: 0.18, transparent: true, opacity: 0.5 }));
      path.computeLineDistances();
      const photon = glow(0xfff1b0, 0.9, { strength: 1.5 });
      photon.visible = false;
      const flash = glow(0x9fd0ff, 1.4);
      flash.position.copy(earth.position);
      flash.material.opacity = 0;
      const tagE = label('地球'); tagE.position.set(7, -0.55, 0);
      const tagS = label('太阳'); tagS.position.set(-7, -1.45, 0);
      api.root.add(sun.mesh, earth, path, photon, flash, tagE, tagS);
      let t0 = 0;
      api.live('距离约 1.5 亿公里。点“出发”，让阳光跑一趟');
      return {
        action() { t0 = now(); photon.visible = true; },
        update() {
          earth.rotation.y += 0.004;
          if (!t0) return;
          const k = clamp((now() - t0) / 8000, 0, 1);   // 8 秒演示 500 秒
          photon.position.set(-6 + 12.8 * k, 0, 0);
          const secs = Math.round(500 * k);
          flash.material.opacity = k >= 1 ? Math.max(0, 1 - (now() - t0 - 8000) / 1500) : 0;
          api.live(`⏱️ 阳光跑了 <b>${Math.floor(secs / 60)} 分 ${secs % 60} 秒</b>${k >= 1 ? '　✈️ 坐飞机要飞约 19 年！' : ''}`);
        },
      };
    };

    // ============ 怎么动 ============
    S.motion_spin = api => {
      api.fly([0.5, 0.45, 4.6]);
      // 等镜头飞到位再排队，小亮点才会出现在正对镜头的那一面
      const timer = setTimeout(() => ctx.hooks.sun.setRotateDemo(true), 1900);
      api.live('看小亮点：赤道的跑得快，两头的跑得慢');
      return {
        action() { ctx.hooks.sun.setRotateDemo(false); ctx.hooks.sun.setRotateDemo(true); },
        exit() { clearTimeout(timer); ctx.hooks.sun.setRotateDemo(false); },
      };
    };

    S.motion_family = api => {
      api.fly([0, 17, 15], [0, 0, 1.5]);
      api.root.add(new THREE.AmbientLight(0xffffff, 0.18));
      const pl = new THREE.PointLight(0xfff2dd, 1.6, 0, 0);
      api.root.add(pl);
      const P = [
        ['水星', 'mercury', 2.6, 0.12], ['金星', 'venus_atmosphere', 3.4, 0.2], ['地球', 'earth_daymap', 4.3, 0.21], ['火星', 'mars', 5.2, 0.15],
        ['木星', 'jupiter', 7.2, 0.55], ['土星', 'saturn', 9.2, 0.46], ['天王星', 'uranus', 11, 0.32], ['海王星', 'neptune', 12.6, 0.31],
      ];
      const planets = P.map(([name, tex, d, r], i) => {
        const mesh = ball(r, `../textures/${tex}.jpg`, { lit: true });
        if (name === '土星') {
          const ringMat = withTex(new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, transparent: true }), '../textures/saturn_ring.png');
          const rg = new THREE.RingGeometry(r * 1.3, r * 2.2, 64);
          // 让圆环贴图沿半径方向展开
          const p = rg.attributes.position, uv = rg.attributes.uv;
          for (let k = 0; k < p.count; k++) { const len = Math.hypot(p.getX(k), p.getY(k)); uv.setXY(k, (len - r * 1.3) / (r * 0.9), 0.5); }
          const ringMesh = new THREE.Mesh(rg, ringMat);
          ringMesh.rotation.x = -Math.PI / 2 + 0.45;
          mesh.add(ringMesh);
        }
        const tag = label(name, { h: 0.024 });
        tag.position.y = r + 0.35;
        mesh.add(tag);
        api.root.add(ring(d, 0xffffff, 0.12), mesh);
        return { mesh, d, w: 0.9 * Math.pow(2.6 / d, 1.5), a: i * 1.7, vel: V(0, 0, 0) };
      });
      let gravity = true;
      const place = p => V(Math.cos(p.a) * p.d, 0, Math.sin(p.a) * p.d);
      planets.forEach(p => p.mesh.position.copy(place(p)));
      api.live('🧲 引力：开');
      return {
        action(id) {
          gravity = id === 'on';
          if (!gravity) planets.forEach(p => { p.vel.set(-Math.sin(p.a), 0, Math.cos(p.a)).multiplyScalar(p.w * p.d); });
          api.live(gravity ? '🧲 引力：开' : '🚫 引力：关 —— 行星沿直线飞走了');
        },
        update(t, dt) {
          planets.forEach(p => {
            p.mesh.rotation.y += dt * 0.6;
            if (gravity) {
              p.a += p.w * dt;
              p.mesh.position.lerp(place(p), 1 - Math.exp(-dt * 2.5));   // 打开引力后慢慢回到轨道上
            } else {
              p.mesh.position.addScaledVector(p.vel, dt);
            }
          });
        },
      };
    };

    S.motion_galaxy = api => {
      hideSun();
      api.fly([0, 7, 11]);
      const disk = new THREE.Group();
      disk.rotation.x = -Math.PI / 2 + 0.35;
      const photo = new THREE.Mesh(new THREE.PlaneGeometry(16, 12.5), withTex(new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), '../textures/deep-sky/m101_pinwheel.jpg'));
      const orbit = ring(4.6, 0xffe08a, 0.45);
      orbit.rotation.x = Math.PI / 2;
      const sunDot = glow(0xffd36b, 0.9, { strength: 1.6 });
      const tag = label('☀️ 太阳大约在这里');
      tag.position.y = 0.8;
      sunDot.add(tag);
      disk.add(photo, orbit, sunDot);
      api.root.add(disk);
      let a = 0.6, fast = 0;
      api.live('照片是和银河系很像的风车星系 M101（哈勃望远镜）');
      return {
        action() { fast = now(); },
        update(t, dt) {
          const speed = now() - fast < 6000 ? 0.6 : 0.05;
          a += speed * dt;
          disk.rotation.z += speed * dt * 0.15;
          sunDot.position.set(Math.cos(a) * 4.6, Math.sin(a) * 4.6, 0.05);
        },
      };
    };

    // ============ 会发生什么 ============
    S.act_cycle = api => {
      hideSun();
      api.fly([0, 0, 7.5]);
      [['assets/photos/cycle-2019.jpg', -1.75, '2019 年 · 黑子很少'], ['assets/photos/cycle-2024.jpg', 1.75, '2024 年 · 黑子很多']].forEach(([src, x, t]) => {
        const p = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), withTex(new THREE.MeshBasicMaterial(), src));
        p.position.x = x;
        const l = label(t);
        l.position.set(x, -1.9, 0);
        api.root.add(p, l);
      });
      api.live('真实照片：NASA/SDO HMI，2019-12-15 和 2024-08-08');
      return {};
    };

    S.act_flare = api => {
      api.fly([0.3, 0.25, 4.2]);
      const spot = V(0.62, 0.3, 0.73).normalize().multiplyScalar(1.01);
      const core = glow(0xffffff, 0.1, { strength: 3 });
      const halo = glow(0xfff0c0, 0.6, { strength: 1.5 });
      [core, halo].forEach(s => { s.position.copy(spot); s.material.opacity = 0; });
      api.root.add(core, halo);
      let t0 = 0;
      return {
        action() { t0 = now(); },
        update() {
          const t = (now() - t0) / 1000;
          const k = t0 && t < 2.5 ? (t < 0.25 ? t / 0.25 : Math.exp(-(t - 0.25) * 1.8)) : 0;
          core.material.opacity = k; halo.material.opacity = k;
          core.scale.setScalar(0.1 + 0.22 * k); halo.scale.setScalar(0.3 + 0.75 * k);
        },
      };
    };

    S.act_wind = api => {
      hideSun();
      api.fly([-1, 4.5, 16], [-1.2, 0, 0]);
      const sun = sunBall(1.2);
      sun.mesh.position.set(-8, 0, 0);
      const EX = 4, ER = 0.6;
      const earth = ball(ER, '../textures/earth_daymap.jpg');
      earth.position.set(EX, 0, 0);
      api.root.add(sun.mesh, earth);
      // 磁力线：偶极子 r = L·cos²λ，向阳面压扁、背阳面拉长
      const fieldMat = new THREE.LineBasicMaterial({ color: 0x6fd8ff, transparent: true, opacity: 0.45 });
      [1.6, 2.3, 3.2, 4.2].forEach(L => [1, -1].forEach(side => {
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
        const a = new THREE.Mesh(new THREE.TorusGeometry(ER * 0.42, 0.035, 8, 48), auroraMat);
        a.rotation.x = Math.PI / 2;
        a.position.set(EX, s * ER * 0.9, 0);
        api.root.add(a);
      });
      // 太阳风小粒子
      const N = 700, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), P = [];
      const spawn = (p, cme) => {
        p.pos = V(-6.8, (Math.random() - .5) * 2.2, (Math.random() - .5) * 2.2);
        p.v = (cme ? 5.5 : 3.2) * (0.8 + Math.random() * 0.4);
        p.polar = Math.random() < 0.06;
        p.cme = cme;
      };
      for (let i = 0; i < N; i++) { const p = {}; spawn(p, false); p.pos.x = -6.8 + Math.random() * 18; P.push(p); }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      api.root.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })));
      let boost = 0, cmeT = -1e9;
      return {
        action() {
          cmeT = now();
          P.forEach((p, i) => { if (i % 2 === 0) spawn(p, true); });
        },
        update(t, dt) {
          earth.rotation.y += dt * 0.25;
          const nose = EX - 1.8;
          P.forEach((p, i) => {
            if (p.polar && p.pos.x > nose - 0.3) {
              // 顺着磁力线钻到南北极
              const pole = V(EX, Math.sign(p.pos.y || 1) * ER * 0.9, 0);
              p.pos.lerp(pole, 1 - Math.exp(-dt * 3));
              if (p.pos.distanceTo(pole) < 0.08) { boost = Math.min(1, boost + (p.cme ? 0.08 : 0.02)); spawn(p, false); }
            } else {
              p.pos.x += p.v * dt;
              if (p.pos.x > nose) {
                // 被磁场挡开，从旁边绕过去
                const perp = V(0, p.pos.y, p.pos.z), d = perp.length(), wall = 1.9 + (p.pos.x - nose) * 0.35;
                if (d < wall) perp.setLength(d + (wall - d) * (1 - Math.exp(-dt * 6)) + 0.001), p.pos.y = perp.y, p.pos.z = perp.z;
              }
              if (p.pos.x > 11) spawn(p, false);
            }
            pos.set([p.pos.x, p.pos.y, p.pos.z], i * 3);
            const c = p.cme ? [1, 0.55, 0.2] : [1, 0.9, 0.6];
            col.set(c, i * 3);
          });
          geo.attributes.position.needsUpdate = true;
          geo.attributes.color.needsUpdate = true;
          boost = Math.max(0, boost - dt * 0.12);
          auroraMat.opacity = 0.3 + 0.7 * boost;
          auroraMat.color.setRGB(0.35 + 0.4 * boost, 1, 0.6 - 0.2 * boost);
          api.live(now() - cmeT < 6000 ? '💥 日冕物质抛射来了！极光变亮' : '🌬️ 太阳风一直在吹');
        },
      };
    };

    S.act_comet = api => {
      api.fly([-1.2, 12, 9], [-1.5, 0, 0]);
      const a = 3.6, e = 0.65;
      api.root.add(ellipse(a, e, 0x9fd0ff, 0.25));
      const nucleus = glow(0xdff2ff, 0.5, { strength: 1.8 });
      const N = 360, pos = new Float32Array(N * 3), seeds = [];
      for (let i = 0; i < N; i++) seeds.push({ s: Math.random(), u: (Math.random() - .5), w: (Math.random() - .5) });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const tail = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xbfe6ff, size: 0.06, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
      const tag = label('彗星');
      api.root.add(nucleus, tail, tag);
      let M = 5.4, fast = 0;
      return {
        action() { fast = now(); },
        update(t, dt) {
          M += dt * (now() - fast < 6000 ? 0.9 : 0.3);
          const k = kepler(M, a, e);
          const p = V(k.x, 0, k.z);
          nucleus.position.copy(p);
          tag.position.copy(p).add(V(0, 0.45, 0));
          const away = p.clone().normalize(), side = V(-away.z, 0, away.x);
          const len = clamp(4.5 / k.r, 0.6, 3.4);       // 离太阳越近，尾巴越长
          seeds.forEach((sd, i) => {
            const q = p.clone().addScaledVector(away, sd.s * len).addScaledVector(side, sd.u * sd.s * 0.5 + sd.s * sd.s * 0.3).add(V(0, sd.w * sd.s * 0.3, 0));
            pos.set([q.x, q.y, q.z], i * 3);
          });
          geo.attributes.position.needsUpdate = true;
        },
      };
    };

    // ============ 和我们的关系 ============
    S.life_light = api => {
      hideSun();
      api.fly([1.6, 0.7, 4.8], [-0.5, 0, 0]);
      const sun = sunBall(1.6);
      sun.mesh.position.set(-12, 0.5, 2);   // 从侧面照过来，白天黑夜各一半
      const sunDir = sun.mesh.position.clone().normalize();
      const u = { day: { value: null }, night: { value: null }, sunDir: { value: sunDir }, light: { value: 1 }, frost: { value: 0 } };
      const earth = new THREE.Mesh(new THREE.SphereGeometry(1.4, 96, 64), new THREE.ShaderMaterial({
        uniforms: u,
        vertexShader: 'varying vec2 vUv; varying vec3 vN; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `
          uniform sampler2D day, night; uniform vec3 sunDir; uniform float light, frost;
          varying vec2 vUv; varying vec3 vN;
          void main(){
            float ndl = dot(normalize(vN), sunDir);
            vec3 d = texture2D(day, vUv).rgb * smoothstep(-0.12, 0.25, ndl) * light;
            vec3 n = texture2D(night, vUv).rgb * 1.6 * (1.0 - smoothstep(-0.2, 0.15, ndl) * light);
            vec3 c = d + n * (1.0 - frost);
            vec3 ice = vec3(0.72, 0.84, 0.95) * (0.16 + 0.12 * texture2D(day, vUv).g);   // 冻成冰球，只有星光照着
            gl_FragColor = vec4(mix(c, ice, frost), 1.0);
          }`,
      }));
      loadTex('../textures/earth_daymap.jpg').then(t => { u.day.value = t; });
      loadTex('../textures/earth_nightmap.jpg').then(t => { u.night.value = t; });
      api.root.add(sun.mesh, earth);
      let on = true;
      return {
        action(id) { on = id === 'on'; },
        update(t, dt, rawDt) {
          earth.rotation.y += dt * 0.15;
          const f = 1 - Math.exp(-rawDt * 1.2);
          u.light.value += ((on ? 1 : 0) - u.light.value) * f;
          u.frost.value += ((on ? 0 : 1) - u.frost.value) * f * 0.6;
          sun.uniforms.gain.value = Math.max(0.02, u.light.value);
          api.live(on ? '☀️ 太阳：开' : `🥶 太阳：关　地球温度一直往下掉`);
        },
      };
    };

    S.life_food = api => {
      api.fly([2.4, 0.4, 4.6], [1.5, 0, 0]);
      const rows = [['☀️ 太阳', '🌱 小草', '🐰 小兔子', '🦊 狐狸'], ['☀️ 太阳', '🌾 稻子', '🍚 米饭', '🧒 我']];
      let step = 1;
      const draw = () => api.extra(`<div class="chain">${rows.map(r => `<div class="chain-row">${r.map((x, i) =>
        `${i ? '<i class="chain-arrow' + (i < step ? ' on' : '') + '">→</i>' : ''}<span class="chain-item${i < step ? ' on' : ''}">${x}</span>`).join('')}</div>`).join('')}</div>`);
      draw();
      return { action() { step = step >= 4 ? 1 : step + 1; draw(); } };
    };

    S.life_rainbow = api => {
      hideSun();
      api.fly([0, 0.6, 7.5], [0.6, 0, 0]);
      lights(api.root, [-3, 4, 6], 0.6);
      const sun = sunBall(0.7);
      sun.mesh.position.set(-8, 0.5, -1);
      const prism = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.4, 3), new THREE.MeshStandardMaterial({ color: 0xcfefff, transparent: true, opacity: 0.32, roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false }));
      prism.rotation.x = Math.PI / 2;
      prism.rotation.y = Math.PI / 2;
      prism.add(new THREE.LineSegments(new THREE.EdgesGeometry(prism.geometry), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })));
      prism.visible = false;
      const beamMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      beamMat.color.multiplyScalar(1.6);
      const beamIn = new THREE.Mesh(new THREE.BoxGeometry(1, 0.06, 0.06), beamMat);
      const beamOut = beamIn.clone();
      // 光线从左边来；没放三棱镜时直直穿过去
      const setBeam = (m, a, b) => { m.position.copy(a).add(b).multiplyScalar(0.5); m.scale.x = a.distanceTo(b); m.rotation.z = Math.atan2(b.y - a.y, b.x - a.x); };
      setBeam(beamIn, V(-7.3, 0.45, 0), V(-0.35, 0.12, 0));
      setBeam(beamOut, V(-0.35, 0.12, 0), V(6, -0.15, 0));
      const colors = [0xff2a2a, 0xff8c1a, 0xffe41a, 0x3cdc3c, 0x1ad7e6, 0x2a5cff, 0x9b3cff];
      const fan = new THREE.Group();
      colors.forEach((c, i) => {
        const a0 = -0.18 - i * 0.055, a1 = a0 - 0.05, o = V(0.42, -0.05, 0), L = 7;
        const g = new THREE.BufferGeometry().setFromPoints([o, V(o.x + Math.cos(a0) * L, o.y + Math.sin(a0) * L, 0), V(o.x + Math.cos(a1) * L, o.y + Math.sin(a1) * L, 0)]);
        fan.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.85, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })));
      });
      fan.visible = false;
      api.root.add(sun.mesh, prism, beamIn, beamOut, fan);
      api.live('现在阳光直直地穿过去，是白色的');
      let on = false;
      return {
        action() {
          on = !on;
          prism.visible = fan.visible = on;
          beamOut.visible = !on;
          api.live(on ? '🌈 红、橙、黄、绿、青、蓝、紫' : '现在阳光直直地穿过去，是白色的');
        },
      };
    };

    S.life_safe = api => {
      api.fly([0.5, 0.45, 4.6]);
      api.extra(`<ul class="safe-list">
        <li><b>🚫👀</b>千万不能直接看太阳</li>
        <li><b>🕶️❌</b>普通墨镜也不行</li>
        <li><b>👓✅</b>看日食要戴专用日食眼镜</li>
        <li><b>🧢🧴</b>出门戴帽子、涂防晒</li></ul>`);
      return {};
    };

    // ============ 一生的故事 ============
    const timeline = here => `<div class="timeline">${[['☁️', '星云', '46 亿年前'], ['☀️', '现在', '46 亿岁'], ['🔴', '红巨星', '约 50 亿年后'], ['⚪', '白矮星', '更久以后']]
      .map(([i, n, w], k) => `<span class="tl${k === here ? ' here' : ''}"><b>${i}</b>${n}<small>${w}</small></span>`).join('<i class="tl-line"></i>')}</div>`;

    S.story_nebula = api => {
      hideSun();
      api.fly([0, 2.5, 9.5]);
      api.extra(timeline(0));
      const bg = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), withTex(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.55, depthWrite: false }), '../textures/deep-sky/orion_m42.jpg'));
      bg.position.z = -12;
      const N = 2600, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), P = [];
      const palette = [[1, .55, .6], [.55, .7, 1], [1, .8, .5], [.9, .6, 1]];
      for (let i = 0; i < N; i++) {
        const r = 4 * Math.cbrt(Math.random()), th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        P.push({ r, th, y: r * Math.cos(ph), rr: r * Math.sin(ph) });
        col.set(palette[i % 4], i * 3);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const cloud = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
      const baby = glow(0xfff0c0, 0.01, { strength: 1.6 });
      const sun = sunBall(0.35);
      sun.uniforms.gain.value = 0;
      api.root.add(bg, cloud, baby, sun.mesh);
      let t0 = 0;
      api.live('背景是哈勃拍的猎户座大星云');
      return {
        action() { t0 = now(); },
        update(t, dt) {
          const k = t0 ? ease(clamp((now() - t0) / 7000, 0, 1)) : 0;
          P.forEach((p, i) => {
            p.th += dt * (0.05 + 0.6 * k / (0.3 + p.rr * (1 - 0.85 * k)));   // 越缩越快地转
            const rr = p.rr * (1 - 0.88 * k), y = p.y * (1 - 0.97 * k);
            pos.set([Math.cos(p.th) * rr, y, Math.sin(p.th) * rr], i * 3);
          });
          geo.attributes.position.needsUpdate = true;
          baby.scale.setScalar(0.01 + 2.2 * smooth(0.4, 1, k));
          sun.uniforms.gain.value = smooth(0.75, 1, k);
          if (k >= 1) api.live('🎉 太阳宝宝出生啦！周围剩下的物质，后来变成了行星');
        },
      };
    };

    S.story_now = api => {
      api.fly([0.5, 0.45, 4.6]);
      api.extra(timeline(1));
      api.live('燃料还够用大约 50 亿年');
      return {};
    };

    S.story_giant = api => {
      hideSun();
      api.fly([0, 8.5, 15]);
      api.extra(timeline(2));
      const sun = sunBall(1);
      loadTex('../textures/stars/red_supergiant_surface.jpg').then(t => { sun.uniforms.map2.value = t; });
      const orbits = [['水星', 'mercury', 1.4, 0.1], ['金星', 'venus_atmosphere', 2.6, 0.17], ['地球', 'earth_daymap', 3.6, 0.18]].map(([n, tex, d, r], i) => {
        const m = ball(r, `../textures/${tex}.jpg`);
        const l = label(n, { h: 0.024 }); l.position.y = r + 0.3; m.add(l);
        api.root.add(ring(d, 0xffffff, 0.15), m);
        return { m, d, a: i * 2.1, w: 0.5 * Math.pow(1.4 / d, 1.5) };
      });
      api.root.add(sun.mesh);
      let t0 = 0;
      api.live('不是真实比例：真的太阳比这里小得多');
      return {
        action() { t0 = now(); },
        update(t, dt) {
          const k = t0 ? ease(clamp((now() - t0) / 6500, 0, 1)) : 0;
          const R = 1 + 2.35 * k;
          sun.mesh.scale.setScalar(R);
          sun.uniforms.mix2.value = k;
          orbits.forEach(o => {
            o.a += o.w * dt;
            o.m.position.set(Math.cos(o.a) * o.d, 0, Math.sin(o.a) * o.d);
            o.m.scale.setScalar(o.d < R - 0.05 ? Math.max(0.001, o.m.scale.x - dt * 2) : 1);   // 被吞进去
          });
          if (k >= 1) api.live('🔴 水星、金星被吞掉了，地球就在边上');
        },
      };
    };

    S.story_dwarf = api => {
      hideSun();
      api.fly([0, 0, 10]);
      api.extra(timeline(3));
      const neb = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), withTex(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }), 'assets/photos/helix-nebula.jpg'));
      neb.position.z = -0.5;
      const giant = sunBall(2);
      giant.uniforms.mix2.value = 1;
      loadTex('../textures/stars/red_supergiant_surface.jpg').then(t => { giant.uniforms.map2.value = t; });
      const dwarf = glow(0xe8f2ff, 0.0, { strength: 2 });
      api.root.add(neb, giant.mesh, dwarf);
      let t0 = 0;
      return {
        action() { t0 = now(); },
        update() {
          const k = t0 ? ease(clamp((now() - t0) / 6000, 0, 1)) : 0;
          giant.mesh.scale.setScalar(1 + 1.6 * k);
          giant.uniforms.gain.value = 1 - k;
          giant.mesh.visible = k < 0.999;
          neb.material.opacity = smooth(0.3, 1, k);
          dwarf.scale.setScalar(0.7 * smooth(0.5, 1, k));
          if (k >= 1) api.live('⚪ 中间的小白点就是白矮星，和地球差不多大');
        },
      };
    };

    // ============ 谁去研究过 ============
    S.probe_ancient = api => {
      hideSun();
      api.fly([0, 4.2, 5.2], [0, -0.3, 0]);
      renderer.shadowMap.enabled = true;
      api.root.add(new THREE.AmbientLight(0xffffff, 0.3));
      const light = new THREE.DirectionalLight(0xfff1d6, 0.85);
      light.castShadow = true;
      light.shadow.mapSize.set(1024, 1024);
      Object.assign(light.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 });
      api.root.add(light, light.target);
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 1 }));
      ground.rotation.x = -Math.PI / 2; ground.position.y = -0.6; ground.receiveShadow = true;
      const stone = new THREE.MeshStandardMaterial({ color: 0xb3aa96, roughness: 0.85 });
      const dial = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.8, 0.25, 64), stone);
      dial.position.y = -0.45; dial.receiveShadow = true; dial.castShadow = true;
      for (let h = 0; h <= 12; h++) {   // 刻度：早上 6 点到晚上 6 点
        const a = Math.PI - h / 12 * Math.PI;
        const mark = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.05), new THREE.MeshStandardMaterial({ color: 0x5a4a32 }));
        mark.position.set(Math.cos(a) * 1.45, -0.31, Math.sin(a) * 1.45);
        mark.rotation.y = -a;
        mark.receiveShadow = true;
        api.root.add(mark);
      }
      const shape = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(1.2, 0), new THREE.Vector2(0, 1.1)]);
      const gnomon = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: 0x8c6b3c, metalness: 0.4, roughness: 0.5 }));
      gnomon.rotation.y = Math.PI / 2;
      gnomon.position.set(0.03, -0.32, 0.6);
      gnomon.castShadow = true;
      const sky = glow(0xffe6a0, 1.4, { strength: 1.4 });
      api.root.add(ground, dial, gnomon, sky);
      let theta = Math.PI / 3, t0 = 0;
      const place = () => {
        const p = V(Math.cos(theta) * 7, Math.sin(theta) * 6 + 0.3, -2.5);
        light.position.copy(p);
        sky.position.copy(p);
        const hour = 6 + 12 * theta / Math.PI;
        const h = Math.floor(hour), m = Math.round((hour - h) * 60 / 10) * 10;
        api.live(`🕰️ 影子告诉我们：现在大约 <b>${h < 12 ? '上午' : h === 12 ? '中午' : '下午'} ${h > 12 ? h - 12 : h} 点${m ? m + ' 分' : ''}</b>`);
      };
      place();
      return {
        action() { t0 = now(); },
        update() {
          if (t0) { theta = 0.25 + (Math.PI - 0.5) * clamp((now() - t0) / 9000, 0, 1); place(); }
        },
        exit() { renderer.shadowMap.enabled = false; },
      };
    };

    // 地球 + 远处的太阳 + 绕地球转的卫星（SDO、羲和号、夸父一号共用）
    function earthOrbitScene(api, sats) {
      hideSun();
      api.fly([1.2, 1.6, 6.2], [1.6, 0, 0]);
      const sun = sunBall(1.1);
      sun.mesh.position.set(-10, 0.5, -3);
      const d = lights(api.root, sun.mesh.position.toArray(), 0.35);
      d.intensity = 1.3;
      const earth = ball(1, '../textures/earth_daymap.jpg', { lit: true });
      earth.position.set(2.2, 0, 0);
      api.root.add(sun.mesh, earth);
      const list = sats.map(s => {
        const g = satellite(s.color);
        g.scale.setScalar(2.6);
        const l = label(s.name);
        l.scale.divideScalar(2.6);   // 标签按屏幕大小画，抵消卫星模型的放大
        l.position.y = 0.2;
        g.add(l);
        const orbit = new THREE.Group();
        orbit.position.copy(earth.position);
        orbit.rotation.set(s.tilt, 0, s.tilt * 0.3);
        const path = ring(s.r, s.color, 0.35);
        orbit.add(path, g);
        api.root.add(orbit);
        return { g, s, a: s.phase || 0 };
      });
      return {
        update(t, dt) {
          earth.rotation.y += dt * 0.1;
          list.forEach(o => {
            o.a += dt * o.s.speed;
            o.g.position.set(Math.cos(o.a) * o.s.r, 0, Math.sin(o.a) * o.s.r);
            o.g.lookAt(sun.mesh.position);   // 镜头一直对着太阳
          });
        },
      };
    }
    S.probe_sdo = api => {
      api.live('SDO 在离地面约 3.6 万公里的轨道上，一直看得到太阳');
      return earthOrbitScene(api, [{ name: 'SDO', color: 0xd8b04a, r: 2.3, tilt: 0.5, speed: 0.35 }]);
    };
    S.probe_china = api => {
      api.extra(`<ul class="safe-list">
        <li><b>🛰️</b>羲和号 · 2021 年发射 · 中国第一颗太阳探测卫星</li>
        <li><b>🛰️</b>夸父一号 · 2022 年发射 · 名字来自“夸父逐日”</li></ul>`);
      return earthOrbitScene(api, [
        { name: '羲和号', color: 0xff6b5a, r: 1.3, tilt: 1.7, speed: 0.9 },
        { name: '夸父一号', color: 0x6fd0ff, r: 1.38, tilt: 1.6, speed: 0.85, phase: 2.6 },
      ]);
    };

    S.probe_parker = api => {
      api.fly([0, 9.5, 11]);
      api.root.add(new THREE.AmbientLight(0xffffff, 0.3));
      const pl = new THREE.PointLight(0xffffff, 1.5, 0, 0);
      api.root.add(pl);
      const peri = 1.6, apo = 9, a = (peri + apo) / 2, e = (apo - peri) / (apo + peri);
      api.root.add(ellipse(a, e, 0xffb070, 0.35), ring(9, 0xffffff, 0.12));
      const venus = ball(0.2, '../textures/venus_atmosphere.jpg', { lit: true });
      const vtag = label('金星轨道', { h: 0.022 }); vtag.position.y = 0.45; venus.add(vtag);
      const probe = new THREE.Group();
      const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 32), new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.6 }));
      shield.rotation.x = Math.PI / 2;
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 6), new THREE.MeshStandardMaterial({ color: 0xb8902e, metalness: 0.6, roughness: 0.4 }));
      body.rotation.x = -Math.PI / 2; body.position.z = -0.22;
      probe.add(shield, body);
      probe.scale.setScalar(2);
      const ptag = label('帕克'); ptag.scale.divideScalar(2); ptag.position.y = 0.35; probe.add(ptag);
      api.root.add(venus, probe);
      let M = 2.8, fast = 0, va = 1;
      const vmax = Math.sqrt(2 / peri - 1 / a);
      return {
        action() { fast = now(); },
        update(t, dt) {
          const k = kepler(M, a, e);
          const v = Math.sqrt(2 / k.r - 1 / a);
          M += dt * (now() - fast < 6000 ? 1.2 : 0.35);
          probe.position.set(k.x, 0, k.z);
          probe.lookAt(0, 0, 0);   // 隔热盾一直对着太阳
          va += dt * 0.08;
          venus.position.set(Math.cos(va) * 9, 0, Math.sin(va) * 9);
          // 把示意轨道换算成真实距离：近日点约 690 万公里（离球心），远日点约 1.09 亿公里
          const km = 6.9e6 + (k.r - peri) / (apo - peri) * (1.09e8 - 6.9e6) - 6.96e5;
          api.live(`🚀 离太阳表面约 <b>${Math.round(km / 1e4)} 万公里</b>　速度约 <b>${Math.round(69.2 * v / vmax)} 万公里/小时</b>`);
        },
      };
    };

    ctx.hooks.stages = S;
  }

  return { setup };
})();
