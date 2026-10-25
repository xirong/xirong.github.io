/* 真实的木星 · “有多大多重”与“怎么动”共 9 个场景。
   大小比例全页只用 h.EARTH_D（地球赤道直径 / 木星赤道直径 = 12756/142984）这一个常数。
   旋转方向约定：rotation.y 增大 = 从北极（+y）俯视逆时针；位置写成 (cos a, 0, sin a) 时
   a 递减才是逆时针（等价于写成 (cos a, 0, -sin a)）。每个转动都写了方向注释。 */
window.JupiterSizeMotion = h => {
  'use strict';
  const { ctx, loadTex, V, now, ease, clamp, smooth, hideSun, EARTH_D, FLATTEN,
    withTex, ball, jupiterBall, glow, label, ring, ellipse, lights, sunBall, spritePhoto, lonLat, mainJupiter } = h;
  const S = {};
  const EARTH_TEX = '../textures/earth_daymap.jpg';   // 和主地球同款 Blue Marble 贴图
  const MOON_TEX = '../textures/moon.jpg';
  // 木星贴图很亮：受光的木星球统一压暗，亮带才不会糊成一团白（辉光阈值 0.86）
  function softJupiter(r) {
    const m = jupiterBall(r, { lit: true });
    m.material.color.setScalar(0.55);
    return m;
  }

  // ============ size_line：11 个多一点地球排满木星直径 ============
  S.size_line = api => {
    hideSun();
    const R = 1.7;                    // 画面里的木星半径；地球半径 = R × EARTH_D，严格真实比例
    const er = R * EARTH_D;           // ≈ 0.152
    api.fly([0.3, 0.25, 11.5], [0.3, 0, 0]);
    lights(api.root, [3, 4, 6], 0.5).intensity = 0.72;   // 木星贴图偏亮，光弱一点防止发白
    const jup = softJupiter(R);   // 真实木星贴图，扁 0.935
    jup.position.set(-1.6, 0, 0);
    api.root.add(jup);
    // 木星右边排一排地球，和木星同一深度（z 都是 0），大小才比得准：
    // 前 11 个刚好排满直径，第 12 个只进来约 21%（11.21 = 11 + 0.21）
    const N = 12, X0 = 0.3, DIA = 11.21 * er * 2;
    const geo = new THREE.SphereGeometry(er, 40, 28);
    const mat = withTex(new THREE.MeshLambertMaterial(), EARTH_TEX);
    const earths = [];
    for (let i = 0; i < N; i++) {
      const e = new THREE.Mesh(geo, mat);
      e.userData.target = V(X0 + er + i * er * 2, 0, 0);
      e.userData.start = e.userData.target.clone().add(V(0, 3.4, 0));
      e.position.copy(e.userData.start);
      e.scale.setScalar(0.001);
      api.root.add(e);
      earths.push(e);
    }
    // 直径标尺：两端竖刻度之间 = 木星直径；右端刻度穿过第 12 个地球，示意“只进来一小部分”
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 0.9 });
    [X0 - 0.06, X0 + DIA + 0.06].forEach(x => api.root.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([V(x, -er * 1.5, 0), V(x, er * 1.5, 0)]), lineMat)));
    const tag = label('第 12 个只进来一小部分', { h: 0.026 });
    tag.position.set(X0 + DIA / 2, -er - 0.65, 0);
    tag.visible = false;
    const tagLen = label('← 1 个木星的直径 →', { h: 0.024 });
    tagLen.position.set(X0 + DIA / 2, -er * 2.6, 0);
    const tagJ = label('🪐 木星（真实比例）', { h: 0.028 });
    tagJ.position.set(jup.position.x, -R * FLATTEN - 0.45, 0);
    api.root.add(tag, tagLen, tagJ);
    let t0 = 0;
    api.live('木星赤道直径约 142,984 公里，是地球的 11.21 倍。点“🌍 排排队”');
    return {
      action() { t0 = now(); tag.visible = false; earths.forEach(e => { e.position.copy(e.userData.start); e.scale.setScalar(0.001); }); },
      update(t, dt) {
        jup.rotation.y += dt * 0.05;   // 自转：rotation.y 增大 = 北极俯视逆时针
        if (!t0) return;
        const s = (now() - t0) / 1000;
        let placed = 0;
        earths.forEach((e, i) => {
          const k = ease(clamp((s - i * 0.5) / 0.75, 0, 1));
          e.position.lerpVectors(e.userData.start, e.userData.target, k);
          e.scale.setScalar(Math.max(0.001, k));
          if (k >= 1) placed++;
        });
        tag.visible = placed === N;
        api.live(placed < N
          ? `🌍 排了 <b>${Math.min(placed, 11)}</b> 个地球……`
          : '🌍 11 个还差一点，第 12 个只进来约 21% —— 直径 ≈ <b>11.21</b> 个地球（同一排，真实比例）');
      },
    };
  };

  // ============ size_fill：体积约 1,321 个地球，连续倒入计数 ============
  S.size_fill = api => {
    hideSun();
    api.fly([0.35, 0.55, 4.6], [0.35, 0, 0]);
    lights(api.root, [3, 5, 6], 0.6);
    // 真实等体积小球（半径≈0.089）一定会互相穿插，所以显示球缩小、分层摆开，仅作示意；
    // 数量严格 1,321：1 个球心 + 5 层斐波那契球壳（40+120+240+380+540 = 1,320），
    // 同壳最小间距 ≈0.112，相邻壳径向间距 ≥0.14，构造上任意两颗都不相碰，运行时再自检一遍。
    const shells = [[40, 0.26], [120, 0.42], [240, 0.60], [380, 0.76], [540, 0.90]];
    const GOLDEN = Math.PI * (3 - Math.sqrt(5));
    const slots = [{ target: V(0, 0, 0) }];
    shells.forEach(([count, radius], si) => {
      for (let i = 0; i < count; i++) {
        const y = 1 - 2 * (i + 0.5) / count;
        const rr = Math.sqrt(Math.max(0, 1 - y * y));
        const a = i * GOLDEN + si * 0.7;
        slots.push({ target: V(Math.cos(a) * rr * radius, y * radius, Math.sin(a) * rr * radius) });
      }
    });
    let MR = 0.05;
    let minD = Infinity;
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const d = slots[i].target.distanceTo(slots[j].target);
        if (d < minD) minD = d;
      }
    }
    MR = Math.min(MR, minD / 2.05);   // 保证 2×MR < 最小球心距，球与球不穿插
    // 每颗从上上方独立落进自己的坑位
    const POUR = 16;
    slots.forEach(s => {
      s.start = V(s.target.x * 0.75 + (Math.random() - .5) * 0.25, 1.85 + Math.random() * 0.3, s.target.z * 0.75 + (Math.random() - .5) * 0.25);
      s.fall = Math.sqrt(2 * Math.max(0.1, s.start.y - s.target.y) / 7.5);
      s.delay = (slots.indexOf(s)) / slots.length * POUR;
      s.turn = slots.indexOf(s) * GOLDEN;
    });
    const moons = new THREE.InstancedMesh(new THREE.SphereGeometry(MR, 10, 8), withTex(new THREE.MeshLambertMaterial(), EARTH_TEX), slots.length);
    moons.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const matrix = new THREE.Matrix4(), q = new THREE.Quaternion(), yAxis = V(0, 1, 0);
    const pos = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1), hidden = new THREE.Matrix4().makeScale(0, 0, 0);
    slots.forEach((s, i) => moons.setMatrixAt(i, hidden));
    // 半透明木星外壳：真实贴图淡淡的影子，能看出地球倒进木星的范围
    const shellMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15, depthWrite: false, side: THREE.DoubleSide });
    withTex(shellMat, 'assets/textures/jupiter-4k.jpg');
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), shellMat);
    const wire = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(1.001, 20, 14)),
      new THREE.LineBasicMaterial({ color: 0xd9b98c, transparent: true, opacity: 0.12 }));
    const tag = label('木星的体积 ≈ 1,321 个地球', { h: 0.028 });
    tag.position.set(0, 1.5, 0);
    const g = new THREE.Group();
    g.add(shell, wire, moons);
    api.root.add(g, tag);
    const TOTAL = slots.length;
    let t0 = 0, settled = false;
    api.live('按体积算，木星里大约装得下 1,321 个地球（小球大小仅示意，数量是真的）。点“🫙 往里装”');
    return {
      action() { t0 = now(); settled = false; slots.forEach((s, i) => moons.setMatrixAt(i, hidden)); moons.instanceMatrix.needsUpdate = true; g.rotation.y = 0; },
      update(t, dt) {
        if (settled) { g.rotation.y += dt * 0.06; return; }
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
        api.live(`🫙 已经装了 <b>${landed}</b> / ${TOTAL} 个地球${landed >= TOTAL ? ' —— 装满啦！（按体积换算约 1,321 个）' : ''}`);
        if (landed >= TOTAL) settled = true;
      },
    };
  };

  // ============ size_mass：质量约 318 个地球，真实大小天平 ============
  S.size_mass = api => {
    hideSun();
    api.fly([0, 0.6, 12.5], [0, -0.5, 0]);
    lights(api.root, [3, 6, 6], 0.45).intensity = 0.7;   // 木星贴图偏亮，压暗防发白
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
    // 左边挂一个木星（真实比例：地球半径 = 木星半径 × EARTH_D）
    const jup = softJupiter(0.62);
    jup.position.y = -0.72;
    pans[0].add(jup);
    // 右边往秤盘里堆 318 个地球，地球按同一 EARTH_D 真实大小画
    const mr = 0.62 * EARTH_D, panTop = -1.31;
    const heapPositions = [];
    const rowStep = Math.sqrt(3) * mr, layerStep = Math.sqrt(8 / 3) * mr;
    for (let layer = 0; layer < 14 && heapPositions.length < 318; layer++) {
      const shrink = Math.max(0.3, 1 - layer * 0.18), y = panTop + mr + layer * layerStep;
      const shift = layer % 2 ? mr : 0;
      for (let row = -8; row <= 8; row++) {
        const z = row * rowStep;
        const rowOff = Math.abs(row) % 2 * mr;
        for (let col = -8; col <= 8; col++) {
          const x = col * mr * 2 + rowOff + shift;
          if (Math.hypot(x, z) <= 0.72 * shrink && heapPositions.length < 318) heapPositions.push(V(x, y, z));
        }
      }
    }
    const heap = new THREE.InstancedMesh(new THREE.SphereGeometry(mr, 10, 8), withTex(new THREE.MeshLambertMaterial(), EARTH_TEX), heapPositions.length);
    const m4 = new THREE.Matrix4();
    heapPositions.forEach((p, i) => { m4.setPosition(p); heap.setMatrixAt(i, m4); });
    heap.count = 0;
    pans[1].add(heap);
    const tagL = label('1 个木星'), tagR = label(`${heapPositions.length} 个地球`);
    tagL.position.set(-3, -2.2, 0.9); tagR.position.set(3, -2.2, 0.9);
    api.root.add(post, base, beam, tagL, tagR);
    beam.rotation.z = 0.3;   // 一开始木星这边沉下去（左边重）
    let t0 = 0;
    api.live('一个木星 ≈ 318 个地球那么重，比另外七大行星加起来还重。点“⚖️ 放地球”');
    return {
      action() { t0 = now(); },
      update() {
        const k = t0 ? ease(clamp((now() - t0) / 8000, 0, 1)) : 0;
        beam.rotation.z = 0.3 * (1 - k);                        // 地球越堆越多，渐渐持平
        pans.forEach(p => { p.rotation.z = -beam.rotation.z; });   // 秤盘保持水平
        heap.count = Math.round(heapPositions.length * k);
        if (t0) api.live(`⚖️ 右边堆了 <b>${heap.count}</b> / ${heapPositions.length} 个地球${k >= 1 ? ' —— 平啦！' : ''}`);
      },
    };
  };

  // ============ size_weight：木星赤道云顶的称重（含自转的视重，没有地面） ============
  S.size_weight = api => {
    hideSun();
    api.fly([0.3, 0.55, 14.8], [0.3, 0, 0]);
    lights(api.root, [3, 5, 6], 0.5).intensity = 0.75;
    // 三个天体都飘在半空：只比较体重秤读数。木星是气体星球，云顶没有地面可以站
    const moon = ball(0.42, MOON_TEX, { lit: true });
    moon.position.set(-2.9, 0, 0);
    const earth = ball(0.8, EARTH_TEX, { lit: true });
    earth.position.set(0, 0, 0);
    const jup = softJupiter(1.4);
    jup.position.set(2.9, 0, 0);
    const G = { moon: 0.166, earth: 1, jupiter: 23.12 / 9.78 };   // NASA 1 bar 赤道视重之比，含自转的影响
    const names = { moon: '🌙 月球', earth: '🌍 地球', jupiter: '🪐 木星赤道云顶' };
    const tags = [['moon', moon, 0.5], ['earth', earth, 0.9], ['jupiter', jup, 1.6]].map(([k, o, dy]) => {
      const l = label(names[k], { h: 0.026 });
      l.position.copy(o.position).add(V(0, dy, 0));
      api.root.add(l);
      return l;
    });
    const factors = [['moon', '秤的读数 ×0.166', -0.85], ['earth', '秤的读数 ×1', -1.25], ['jupiter', '秤的读数约 ×2.36', -2.05]].map(([k, txt, dy]) => {
      const l = label(txt, { h: 0.024, color: k === 'jupiter' ? '#ffd76b' : '#eadbc7' });
      l.position.copy({ moon, earth, jupiter: jup }[k].position).add(V(0, dy, 0));
      api.root.add(l);
      return l;
    });
    api.root.add(moon, earth, jup);
    let kg = 20, pick = 'earth';
    const fmt = v => (v < 10 ? v.toFixed(1) : Math.round(v));
    function show() {
      api.live(['moon', 'earth', 'jupiter'].map(k => {
        const v = `${fmt(kg * G[k])} 公斤`;
        return k === pick ? `<span class="big">${names[k]}：<b>${v}</b></span>` : `${names[k]}：${v}`;
      }).join('<br>') + '<br><small>比较秤的读数，质量没有变；木星没有地面</small>');
    }
    show();
    const views = {
      moon: [[-2.9, 0.35, 2.9], [-2.9, 0, 0]],
      earth: [[0, 0.45, 3.4], [0, 0, 0]],
      jupiter: [[2.9, 0.6, 5.2], [2.9, 0, 0]],
    };
    return {
      slider(v) { kg = v; show(); },
      action(id) { pick = id; show(); api.fly(...views[id], 1400); },
      update(t, dt) {
        earth.rotation.y += dt * 0.15;   // 三个球慢慢自转：rotation.y 增大 = 北极俯视逆时针
        moon.rotation.y += dt * 0.05;
        jup.rotation.y += dt * 0.3;
      },
    };
  };

  // ============ size_far：阳光跑到木星要约 43 分钟 ============
  S.size_far = api => {
    hideSun();
    api.fly([0.4, 2.4, 18.4], [0.4, 0, 0]);
    const sun = sunBall(1.1);
    sun.position.set(-4.5, 0, 0);
    const halo = glow(0xffd28a, 3.2, { strength: 0.9 });
    halo.position.copy(sun.position);
    const earth = ball(0.45, EARTH_TEX);
    earth.position.set(0, 0, 0);
    const jup = jupiterBall(0.95, { lit: false });   // 这个场景没有灯光，用不受光的基本材质
    jup.material.color.setScalar(0.88);   // 贴图亮，压一点防止糊白
    jup.position.set(5.5, 0, 0);
    // 虚线光路：从太阳边缘到木星边缘（距离和大小都压缩了）
    const path = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(-3.35, 0, 0), V(4.5, 0, 0)]),
      new THREE.LineDashedMaterial({ color: 0xffe9a0, dashSize: 0.25, gapSize: 0.18, transparent: true, opacity: 0.5 }));
    path.computeLineDistances();
    const photon = glow(0xfff1b0, 0.45, { strength: 1.15 });
    photon.visible = false;
    const flashE = glow(0x9fd0ff, 0.9);
    flashE.position.set(0.45, 0.35, 0);
    flashE.material.opacity = 0;
    const flashJ = glow(0xffc86b, 1.4);
    flashJ.position.set(4.7, 0.5, 0);
    flashJ.material.opacity = 0;
    const tagS = label('☀️ 太阳'), tagE = label('地球 · 光约 8 分钟'), tagJ = label('木星 · 约 43 分钟');
    tagS.position.set(-4.5, -1.5, 0); tagE.position.set(0, -0.85, 0); tagJ.position.set(5.2, -1.5, 0);
    const note = label('日木距离 ≈ 5.2 个天文单位（画面压缩了）', { h: 0.024 });
    note.position.set(0.5, 1.6, 0);
    api.root.add(sun, halo, earth, jup, path, photon, flashE, flashJ, tagS, tagE, tagJ, note);
    const MIN = 43;                 // 演示 12 秒 = 光跑 43 分钟
    let t0 = 0;
    api.live('木星离太阳约 5.2 个天文单位，阳光要约 43 分钟才跑到（轨道忽近忽远：约 41～45 分钟）。点“💡 出发”');
    return {
      action() { t0 = now(); photon.visible = true; flashE.material.opacity = 0; flashJ.material.opacity = 0; },
      update(t, dt) {
        if (!t0) return;
        const k = clamp((now() - t0) / 1000 / 12, 0, 1);
        photon.position.set(-3.35 + 7.85 * k, 0, 0);
        const mins = MIN * k;
        const atEarth = k >= 8 / 43;
        api.live(`⏱️ 光跑了 <b>${Math.floor(mins)}</b> / 43 分钟${atEarth ? ' —— 8 分钟时先经过地球！' : ''}${k >= 1 ? '　到木星啦！' : ''}`);
        flashE.material.opacity = atEarth ? Math.max(0, 1 - (mins - 8) / 2) : 0;
        if (k >= 1) {
          flashJ.material.opacity = Math.max(0, 1 - (now() - t0 - 12000) / 1500);
          if (flashJ.material.opacity <= 0) { t0 = 0; photon.visible = false; }
        }
      },
    };
  };

  // ============ motion_spin：一天约 9 小时 56 分（9.925 小时），转得扁 ============
  S.motion_spin = api => {
    const J = mainJupiter(api);   // 用真实的主木星：停住自转，标记挂到表面，退出时摘除并恢复
    api.fly([0.7, 3.9, 4.8], [0.4, 0, 0]);   // 从北半球上空俯视，才看得出自转是逆时针
    // 赤道上的红点 + 标签，跟着木星一起转
    const dot = glow(0xff7a5a, 0.14, { strength: 1.2 });
    dot.position.copy(lonLat(0, 0, 1.012));
    const tag = label('跟着这个点看', { h: 0.024 });
    tag.position.copy(lonLat(0, 15, 1.14));
    tag.material.depthTest = true;   // 点转到背面时，标签也被木星挡住
    J.attach(dot);
    J.attach(tag);
    // 北极上方一个固定不动的逆时针弧线箭头（不跟着转，纯粹指示方向）
    const arcPts = [];
    for (let i = 0; i <= 30; i++) { const a = 0.4 + 1.5 * i / 30; arcPts.push(V(Math.cos(a) * 1.55, 1.18, Math.sin(a) * 1.55)); }
    const arc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcPts),
      new THREE.LineBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 0.7 }));
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 10), new THREE.MeshBasicMaterial({ color: 0xffe9a0 }));
    const aEnd = 1.9;
    head.position.set(Math.cos(aEnd) * 1.55, 1.18, Math.sin(aEnd) * 1.55);
    head.quaternion.setFromUnitVectors(V(0, 1, 0), V(Math.sin(aEnd), 0, -Math.cos(aEnd)).normalize());   // 箭头朝逆时针方向
    const arcTag = label('自转：逆时针', { h: 0.024 });
    arcTag.position.set(0, 1.75, 1.85);
    api.root.add(arc, head, arcTag);
    const DAY_SEC = 11;             // 11 秒演示木星的一天
    let t0 = 0, startRot = 0;
    api.live('木星的一天只有 9 小时 56 分，是太阳系里转得最快的行星。点“⏩ 转一天”');
    return {
      action() { t0 = now(); startRot = J.surface.rotation.y; },
      update(t, dt) {
        if (!t0) { J.surface.rotation.y += dt * 0.03; return; }   // 平时慢慢Idle自转（逆时针）
        const k = clamp((now() - t0) / 1000 / DAY_SEC, 0, 1);
        J.surface.rotation.y = startRot + k * Math.PI * 2;   // rotation.y 增大 = 从北极俯视逆时针
        const mins = k * 596;                                // 9.925 小时 ≈ 596 分钟 = 9 小时 56 分
        const hh = Math.floor(mins / 60), mm = Math.floor(mins % 60);
        api.live(`🕐 木星转了 <b>${hh}</b> 小时 <b>${mm}</b> 分 / 9 小时 56 分${k >= 1 ? ' —— 一天过去啦！' : ''}`);
        if (k >= 1) {
          t0 = 0;
          api.live('🕐 一天只有 9 小时 56 分！转得这么快，木星被甩得扁扁的：赤道半径约是两极的 <b>1.07</b> 倍');
        }
      },
      exit: J.done,
    };
  };

  // ============ motion_year：绕太阳一圈 = 11.862 个地球年（逆时针） ============
  S.motion_year = api => {
    hideSun();
    api.fly([0, 15.6, 9.1], [0, 0, 0]);   // 从北极高空俯视：公转是逆时针，完整轨道也留在窄屏里
    api.root.add(new THREE.AmbientLight(0xffffff, 0.2));
    api.root.add(new THREE.PointLight(0xfff2dd, 0.95, 0, 0));   // 点光弱一点，木星亮带才不糊白
    const sun = sunBall(1.15);
    api.root.add(sun);
    const D = 5.2, DE = 2.4;
    api.root.add(ring(D, 0xd9b98c, 0.3), ring(DE, 0x6fa8ff, 0.2));
    // 木星：轴只歪 3.13°；地轴方向在公转中保持不变
    const pivot = new THREE.Group();
    const jup = softJupiter(0.7);
    const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.9, 8), new THREE.MeshBasicMaterial({ color: 0xffe9a0 }));
    const north = label('北', { h: 0.022 });
    north.position.y = 1.05;
    const tiltG = new THREE.Group();
    tiltG.rotation.z = THREE.MathUtils.degToRad(3.13);
    tiltG.add(jup, axis, north);
    pivot.add(tiltG);
    api.root.add(pivot);
    const earth = ball(0.3, EARTH_TEX, { lit: true });
    api.root.add(earth);
    const tagS = label('☀️ 太阳', { h: 0.024 });
    tagS.position.set(0, -1.6, 0);
    const note = label('木星 1 圈 = 11.862 个地球年', { h: 0.026 });
    note.position.set(0, 0, D + 1.2);
    const noteE = label('地球轨道', { h: 0.02 });
    noteE.position.set(0, 0, -DE - 0.55);
    api.root.add(tagS, note, noteE);
    const YEAR_SEC = 18;            // 18 秒演示木星的一年
    const RATIO = 11.862;           // 一个木星年 = 11.862 个地球年
    let a = -Math.PI / 2, ae = -Math.PI / 2, t0 = 0;
    const place = () => {
      pivot.position.set(Math.cos(a) * D, 0, Math.sin(a) * D);   // a 递减 = 从北极俯视逆时针
      earth.position.set(Math.cos(ae) * DE, 0, Math.sin(ae) * DE);
    };
    place();
    api.live('木星绕太阳一圈，地球上已经过了 11.862 年。点“⏩ 过一年”');
    return {
      action() { t0 = now(); a = -Math.PI / 2; ae = -Math.PI / 2; place(); },
      update(t, dt) {
        jup.rotation.y += dt * (t0 ? 2.2 : 0.5);   // 自转也是逆时针
        if (t0) {
          const k = clamp((now() - t0) / 1000 / YEAR_SEC, 0, 1);
          a = -Math.PI / 2 - k * Math.PI * 2;             // 逆时针
          ae = -Math.PI / 2 - k * Math.PI * 2 * RATIO;    // 地球同期转 11.862 圈
          place();
          const years = (k * RATIO).toFixed(1);
          api.live(`🪐 木星走了 <b>${Math.round(k * 100)}%</b>　🌍 地球已经过了 <b>${years}</b> 年${k >= 1 ? ' —— 木星的一年过完啦！' : ''}`);
          if (k >= 1) {
            t0 = 0;
            api.live('🪐 木星的一年 ≈ <b>11.862</b> 个地球年：木星绕一圈，地球差不多绕了 12 圈');
          }
        } else {
          a -= dt * 0.04; ae -= dt * 0.04 * RATIO; place();   // 没演示时也在慢慢公转（逆时针）
        }
      },
    };
  };

  // ============ motion_axis：轴只歪 3.13°，几乎没有四季（和地球 23.44° 对比） ============
  S.motion_axis = api => {
    hideSun();
    api.fly([0, 5.5, 15.6], [0.2, 0, 0]);
    api.root.add(new THREE.AmbientLight(0xffffff, 0.2));
    api.root.add(new THREE.PointLight(0xfff2dd, 0.95, 0, 0));
    const sun = sunBall(1.0);
    api.root.add(sun);
    const DE = 2.3, DJ = 4.6;
    api.root.add(ring(DE, 0x6fa8ff, 0.25), ring(DJ, 0xd9b98c, 0.25));
    // 每个行星：pivot 带着它公转，tiltG 把自转轴歪一个角度；轴在公转中一直指着同一个方向
    function planet(r, tex, tiltDeg, axisLen) {
      const pivot = new THREE.Group();
      const mesh = tex === 'jupiter' ? softJupiter(r) : ball(r, tex, { lit: true });
      const tiltG = new THREE.Group();
      tiltG.rotation.z = THREE.MathUtils.degToRad(tiltDeg);   // 轴顶歪向 -x；公转全程保持这个方向
      const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, axisLen, 8), new THREE.MeshBasicMaterial({ color: 0xffe9a0 }));
      const north = label('北', { h: 0.022 });
      north.position.y = axisLen / 2 + 0.12;
      // 虚线延长线：表示轴一直指着同一个远方方向
      const guide = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([V(0, axisLen / 2, 0), V(0, axisLen / 2 + 1.5, 0)]),
        new THREE.LineDashedMaterial({ color: 0xffe9a0, dashSize: 0.12, gapSize: 0.09, transparent: true, opacity: 0.55 }));
      guide.computeLineDistances();
      tiltG.add(mesh, axis, north, guide);
      pivot.add(tiltG);
      api.root.add(pivot);
      return { pivot, mesh, a: -Math.PI / 2 };
    }
    const E = planet(0.42, EARTH_TEX, 23.44, 1.5);   // 地球：轴歪 23.44°
    const Jp = planet(0.72, 'jupiter', 3.13, 2.1);   // 木星：轴只歪 3.13°
    const tagS = label('☀️ 太阳', { h: 0.024 });
    tagS.position.set(0, -1.5, 0);
    const tagE = label('地球：轴歪 23.44°，四季分明', { h: 0.024 });
    const tagJ = label('木星：轴只歪 3.13°', { h: 0.024, color: '#ffd76b' });
    api.root.add(tagS, tagE, tagJ);
    const note = label('两根轴一直指着同一个方向', { h: 0.022 });
    note.position.set(-3.4, 2.9, 0);
    api.root.add(note);
    const YEAR_SEC = 20;            // 20 秒演示地球的一年（木星只走 1/11.862）
    const RATIO = 11.862;
    let t0 = 0;
    const camera = ctx.camera;
    const labelRight = new THREE.Vector3(), labelUp = new THREE.Vector3();
    const projected = new THREE.Vector3(), direction = new THREE.Vector2();
    function placeTag(tag, pivot, distance) {
      camera.updateMatrixWorld();
      labelRight.setFromMatrixColumn(camera.matrixWorld, 0);
      labelUp.setFromMatrixColumn(camera.matrixWorld, 1);
      projected.copy(pivot.position).project(camera);
      direction.set(projected.x, projected.y);
      if (direction.lengthSq() < 0.0001) direction.set(0, 1);
      else direction.normalize();
      tag.position.copy(pivot.position)   // 标签朝屏幕外侧展开，不盖住太阳和另一个行星
        .addScaledVector(labelRight, direction.x * distance)
        .addScaledVector(labelUp, direction.y * distance);
    }
    const place = () => {
      E.pivot.position.set(Math.cos(E.a) * DE, 0, Math.sin(E.a) * DE);      // a 递减 = 逆时针
      Jp.pivot.position.set(Math.cos(Jp.a) * DJ, 0, Math.sin(Jp.a) * DJ);
      placeTag(tagE, E.pivot, 1.05);
      placeTag(tagJ, Jp.pivot, 1.45);
    };
    place();
    api.live('地球的自转轴歪了 23.44°，木星只歪 3.13°。点“🌍 和地球比”');
    return {
      action() { t0 = now(); E.a = -Math.PI / 2; Jp.a = -Math.PI / 2; place(); },
      update(t, dt) {
        E.mesh.rotation.y += dt * 0.5;   // 自转：rotation.y 增大 = 北极俯视逆时针
        Jp.mesh.rotation.y += dt * 1.2;
        if (t0) {
          const k = clamp((now() - t0) / 1000 / YEAR_SEC, 0, 1);
          E.a = -Math.PI / 2 - k * Math.PI * 2;
          Jp.a = -Math.PI / 2 - k * Math.PI * 2 / RATIO;
          place();
          const c = Math.cos(E.a);   // >0：北极歪向太阳（北半球夏天）；<0：背向（冬天）
          const season = c > 0.85 ? '　🔥 北半球夏天' : c < -0.85 ? '　❄️ 北半球冬天' : '';
          api.live(`🌍 地球轴歪 23.44°，一年里夏天冬天换来换去${season}　🪐 木星几乎直着，一年到头都差不多${k >= 1 ? ' —— 这就是“几乎没有四季”' : ''}`);
          if (k >= 1) t0 = 0;
        } else {
          E.a -= dt * 0.05; Jp.a -= dt * 0.05 / RATIO; place();
        }
      },
    };
  };

  // ============ motion_moons：四颗伽利略卫星，1:2:4 共振，全部潮汐锁定 ============
  S.motion_moons = api => {
    hideSun();
    api.fly([0, 10.4, 13.6], [0, 0.2, 0]);   // 从上方俯视四条完整轨道（逆时针），手机也不裁掉外侧卫星
    lights(api.root, [-6, 2.5, 4], 0.3).intensity = 0.72;   // 光弱一点，木星亮带不糊白
    const jup = softJupiter(1.5);   // 真实木星贴图，扁 0.935
    api.root.add(jup);
    // 四颗卫星：相互之间的真实大小比例（整体放大 5 倍方便看清楚），周期 1.77 / 3.55 / 7.15 / 16.69 天
    const JR = 71492;   // 木星赤道半径（公里）
    const MOONS = [
      { name: '木卫一 Io', tex: '../textures/io.jpg', rKm: 1822, T: 1.77, d: 2.6, color: 0xf0d060 },
      { name: '木卫二 Europa', tex: '../textures/europa.jpg', rKm: 1561, T: 3.55, d: 3.3, color: 0xe8dcc0 },
      { name: '木卫三 Ganymede', tex: '../textures/ganymede.jpg', rKm: 2634, T: 7.15, d: 4.2, color: 0xc0a884 },
      { name: '木卫四 Callisto', tex: '../textures/callisto.jpg', rKm: 2411, T: 16.69, d: 5.3, color: 0x9a8874 },
    ];
    const SCALE = 5;
    const list = MOONS.map(m => {
      const r = 1.5 * (m.rKm / JR) * SCALE;
      const mesh = ball(r, m.tex, { lit: true });
      const tag = label(m.name, { h: 0.024 });
      tag.position.y = r + 0.32;
      mesh.add(tag);
      api.root.add(mesh, ring(m.d, m.color, 0.32));
      return { ...m, r, mesh, a: Math.PI / 2, done: 0 };
    });
    // 最内圈上的一个逆时针弧线箭头（固定不动，只指示公转方向）
    const arcPts = [];
    for (let i = 0; i <= 26; i++) { const a = 2.4 + 1.1 * i / 26; arcPts.push(V(Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6)); }
    const arc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcPts),
      new THREE.LineBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 0.65 }));
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 10), new THREE.MeshBasicMaterial({ color: 0xffe9a0 }));
    const aEnd = 3.5;
    head.position.set(Math.cos(aEnd) * 2.6, 0, Math.sin(aEnd) * 2.6);
    head.quaternion.setFromUnitVectors(V(0, 1, 0), V(Math.sin(aEnd), 0, -Math.cos(aEnd)).normalize());   // 朝逆时针方向
    const arcTag = label('都朝这个方向转（逆时针）', { h: 0.022 });
    arcTag.position.set(-1.2, 0.3, 2.75);
    api.root.add(arc, head, arcTag);
    const DEMO_DAYS = 7.15, DEMO_SEC = 16;   // 16 秒演示 7.15 天 = 木卫三正好 1 圈
    let t0 = 0, simDays = 0;
    const place = () => list.forEach(m => {
      m.mesh.position.set(Math.cos(m.a) * m.d, 0, Math.sin(m.a) * m.d);   // a 递减 = 从北极俯视逆时针
      m.mesh.rotation.y = -m.a - Math.PI;   // 潮汐锁定：贴图正面（经度 0°）始终朝着木星
    });
    place();
    api.live('四颗伽利略卫星都逆时针绕木星，而且每颗总用同一面对着木星（潮汐锁定，像月球对我们）。点“⏩ 看共振”');
    return {
      action() { t0 = now(); simDays = 0; list.forEach(m => { m.a = Math.PI / 2; }); place(); },
      update(t, dt) {
        jup.rotation.y += dt * 0.25;   // 木星自转：rotation.y 增大 = 北极俯视逆时针
        if (t0) {
          const k = clamp((now() - t0) / 1000 / DEMO_SEC, 0, 1);
          simDays = k * DEMO_DAYS;
          list.forEach(m => { m.a = Math.PI / 2 - (simDays / m.T) * Math.PI * 2; m.done = simDays / m.T; });
          place();
          api.live(`🗓️ 过了 <b>${simDays.toFixed(1)}</b> 天：Io <b>${list[0].done.toFixed(1)}</b> 圈 · Europa <b>${list[1].done.toFixed(1)}</b> 圈 · Ganymede <b>${list[2].done.toFixed(1)}</b> 圈 —— 约 <b>1:2:4</b>${k >= 1 ? '　木卫四 Callisto 要 16.69 天才转一圈，不参加这个共振' : ''}`);
          if (k >= 1) t0 = 0;
        } else {
          list.forEach(m => { m.a -= dt * (Math.PI * 2 / m.T) * 0.22; });   // 平时也慢慢公转（逆时针）
          place();
        }
      },
    };
  };

  return S;
};
