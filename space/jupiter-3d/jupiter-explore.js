/* 真实的木星 · 会发生什么 / 和我们的关系 / 一生的故事 / 谁去研究过（15 个场景）
   window.JupiterExplore(helpers) 收到 jupiter-stages.js 传进来的共享工具，返回 { 场景id: api => 场景 }。
   画面优先用真实贴图的主木星（mainJupiter）和真实照片；形成、迁移、未来都标明“科学家认为/估计”，
   每个动手按钮都可以反复按。挂在主木星上的东西退出时由 mainJupiter 的 done() 统一摘掉。
   方向约定（从北极上空看都是逆时针）：
   - 位置写成 (cos a, 0, sin a) 的，a 要减小；(cos a, 0, -sin a) 或行星自转 rotation.y 的，要增大。 */
window.JupiterExplore = h => {
  'use strict';
  const S = {};
  const { ctx, loadTex, V, now, ease, clamp, smooth, hideSun, EARTH_D, FLATTEN,
          withTex, ball, jupiterBall, glow, label, ring, ellipse, lights, sunBall, spritePhoto, lonLat, mainJupiter } = h;
  const TAU = Math.PI * 2;

  // ============ 通用小工具 ============
  // 挂在主木星（扁球）上的标签：抵消 y 方向的扁缩，转到背面时被木星挡住
  function surfLabel(text, opts = {}) {
    const l = label(text, Object.assign({ depth: true }, opts));
    l.scale.y /= FLATTEN;
    return l;
  }
  // 主球局部坐标的切平面：x 朝东、y 朝北、z 朝外，避免世界朝向被父球重复旋转
  function tangentFrame(pt) {
    return pt.quaternion.clone();
  }
  // 通用的探测器小模型（示意用，不是某一艘的真模型）
  function probeModel() {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcfc8b8, metalness: 0.5, roughness: 0.45 });
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.14, 10), bodyMat));
    const dish = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.07, 14, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xe8e2d2, side: THREE.DoubleSide }));
    dish.position.y = 0.12;
    const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.42, 6), bodyMat);
    boom.position.y = -0.26;
    g.add(dish, boom);
    return g;
  }
  // 四颗伽利略卫星（真实贴图）：扁平一点的椭圆轨道，像小望远镜里看到的一排
  function moonsView(root, jx) {
    const DEF = [
      { tex: 'io', name: '木卫一', R: 1.14, r: 0.048, T: 1.77, a0: 0.35 },
      { tex: 'europa', name: '木卫二', R: 1.48, r: 0.052, T: 3.55, a0: 2.1 },
      { tex: 'ganymede', name: '木卫三', R: 1.92, r: 0.07, T: 7.15, a0: 4.1 },
      { tex: 'callisto', name: '木卫四', R: 2.58, r: 0.062, T: 16.7, a0: 5.2 },
    ];
    const list = DEF.map(d => {
      const m = ball(d.r, `../textures/${d.tex}.jpg`, { lit: true });
      const l = label(d.name, { h: 0.02 });
      l.position.set(0, -0.17, 0);
      m.add(l);
      const pts = [];
      for (let i = 0; i <= 72; i++) {
        const a = i / 72 * TAU;
        pts.push(V(jx + Math.cos(a) * d.R, Math.sin(a) * d.R * 0.45, -0.02));
      }
      root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0x8a94a8, transparent: true, opacity: 0.16 })), m);
      return Object.assign({ m }, d);
    });
    const place = night => list.forEach(o => {
      const a = (o.a0 + night * TAU / o.T) % TAU;
      o.m.position.set(jx + Math.cos(a) * o.R, Math.sin(a) * o.R * 0.45, 0);
    });
    return { list, place };
  }

  // ============ act_spot · 大红斑在南半球 ============
  S.act_spot = api => {
    const J = mainJupiter(api);
    const sunward = V(-0.55, 0.28, 0.79).normalize();
    J.sun(sunward);
    J.face(125, -22, sunward);          // 先让当前大红斑处于向阳面，再定位镜头
    const pt = J.point(125, -22);   // 主图大红斑中心：东经 125°、南纬 22°
    // 镜头在大红斑的北上方斜着看：从太空正上方看，南半球的反气旋是逆时针
    const camPos = pt.pos.clone().addScaledVector(pt.normal, 0.95).addScaledVector(pt.north, 1.3);
    api.fly(camPos.toArray(), pt.pos.toArray(), 2200);
    lights(api.root, camPos.toArray(), 0.5);   // 照亮挂上去的地球模型（主木星自身是 shader，不吃灯光）
    const frameQ = tangentFrame(pt);

    // 逆时针旋转箭头：绕朝外的法线逆时针 = 南半球反气旋（从太空正上方看）
    const rotor = new THREE.Group();
    rotor.position.copy(lonLat(125, -22, 1.008));
    rotor.quaternion.copy(frameQ);
    rotor.scale.y = 1 / FLATTEN;               // 抵消主球扁缩，箭头圆不变形
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffb27a, transparent: true, opacity: 0, depthWrite: false });
    [0, 1, 2].forEach(i => {
      const a0 = i * TAU / 3;
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.006, 6, 28, Math.PI * 0.5), arrowMat);
      arc.position.z = 0.004;
      arc.rotation.z = a0;
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.04, 8), arrowMat);
      const ta = a0 + Math.PI * 0.5;
      tip.position.set(Math.cos(ta) * 0.2, Math.sin(ta) * 0.2, 0.004);
      tip.rotation.z = ta;                     // 尖头沿逆时针切线
      rotor.add(arc, tip);
    });
    J.attach(rotor);

    // 比大小：地球圆盘和大红斑轮廓画在同一片云上（同一深度，大小才比得准）
    const cmp = new THREE.Group();
    cmp.position.copy(lonLat(125, -22, 1.008));   // 轮廓贴着云顶，地球底部与它在同一切平面
    cmp.quaternion.copy(frameQ);
    cmp.scale.y = 1 / FLATTEN;
    const grsPts = [];
    for (let i = 0; i <= 48; i++) {
      const t = i / 48 * TAU;
      grsPts.push(V(Math.cos(t) * 0.116, Math.sin(t) * 0.085, 0));   // 大红斑 ≈ 宽 1.3 个地球
    }
    cmp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(grsPts),
      new THREE.LineBasicMaterial({ color: 0xff9a5a, transparent: true, opacity: 0.9 })));
    const earth = new THREE.Mesh(new THREE.SphereGeometry(EARTH_D, 32, 24),
      withTex(new THREE.MeshLambertMaterial(), '../textures/earth_daymap.jpg'));
    earth.position.set(0.22, 0, EARTH_D);      // 贴着云层并排在镜头内：GRS 宽 1.3 个地球
    const tagE = surfLabel('🌍 地球', { h: 0.024, color: '#bcd8ff' });
    tagE.position.set(0.22, -0.17, 0);
    const tagG = surfLabel('大红斑 ≈ 1.3 个地球宽', { h: 0.024, color: '#ffb27a' });
    tagG.position.set(0, 0.155, 0);
    cmp.add(earth, tagE, tagG);
    cmp.visible = false;
    J.attach(cmp);

    const tagSpot = surfLabel('大红斑', { h: 0.026, color: '#ffb27a' });
    tagSpot.position.copy(lonLat(125, -22, 1.012));
    tagSpot.position.y -= 0.145;
    J.attach(tagSpot);

    let spinUntil = 0;
    api.live('大红斑就在这张照片里：南纬约 22°的反气旋。点“🌀 看旋转”或“🌍 比大小”');
    return {
      action(id) {
        if (id === 'spin') {
          spinUntil = now() + 7000;
          api.live('🌀 从太空正上方看，大红斑在<b>逆时针</b>慢慢转，转一圈要好几天');
        } else if (id === 'compare') {
          cmp.visible = !cmp.visible;
          if (cmp.visible) {
            const center = cmp.getWorldPosition(new THREE.Vector3());
            const view = center.clone().addScaledVector(pt.normal, 1.8).addScaledVector(pt.north, 0.55);
            api.fly(view.toArray(), center.toArray(), 1500);
          }
          api.live(cmp.visible
            ? '🌍 大红斑现在约 1.3 个地球那么宽；一百多年前它有过 2～3 个地球宽，一直在慢慢缩小'
            : '大红斑就在这张照片里：南纬约 22°的反气旋。点“🌀 看旋转”或“🌍 比大小”');
        }
      },
      update(t, dt) {
        if (!spinUntil) return;
        if (now() < spinUntil) {
          arrowMat.opacity = Math.min(0.9, arrowMat.opacity + dt * 2);
          rotor.rotation.z += dt * 0.9;
        } else {
          rotor.rotation.z += dt * 0.1;
          arrowMat.opacity = Math.max(0, arrowMat.opacity - dt * 0.5);
          if (!arrowMat.opacity) spinUntil = 0;
        }
      },
      exit: J.done,
    };
  };

  // ============ act_belts · 条纹里藏着大风和闪电 ============
  S.act_belts = api => {
    const J = mainJupiter(api);
    const sunward = V(-0.55, 0.28, 0.79).normalize();
    J.sun(sunward);
    J.face(0, 0, sunward);             // 让风箭头所在的经度朝向镜头，而不是背面
    api.fly([0.5, 0.45, 3.9], [0, 0, 0], 2000);
    // 风向箭头：和“长什么样”模块同一套纬度和配色，相邻两条带方向相反
    const LAT = [-42, -29, -17, -6, 7, 19, 31, 44];
    const winds = new THREE.Group();
    LAT.forEach((lat, i) => {
      const dir = lat === 7 ? 1 : (i % 2 ? 1 : -1);   // 赤道两侧喷流顺自转，其他相邻喷流交替
      const color = i % 2 ? 0x9ed5e8 : 0xf0cf8e;
      const pts = [];
      for (let k = 0; k <= 28; k++) pts.push(lonLat(-28 + k * 2 * dir, lat, 1.008));
      winds.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.75 })));
      const endLon = -28 + 56 * dir;
      const tip = lonLat(endLon, lat, 1.008);
      const tan = lonLat(endLon + dir, lat, 1.008).sub(tip).normalize();
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.07, 12),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 }));
      cone.position.copy(tip);
      cone.quaternion.setFromUnitVectors(V(0, 1, 0), tan);
      winds.add(cone);
    });
    winds.visible = false;
    J.attach(winds);

    // 闪电：云带里的小亮点，亮一下就没（Juno 的仪器真的观测到过）
    const flashGroup = new THREE.Group();
    J.attach(flashGroup);
    let bolts = [], boltT0 = 0;
    function strike() {
      bolts.forEach(b => { flashGroup.remove(b.s); b.s.material.dispose(); });
      bolts = [];
      const BELTS = [-17, -6, 7, 19, 31];
      for (let i = 0; i < 14; i++) {
        const s = glow(0xcfe2ff, 0.05 + Math.random() * 0.06, { strength: 0.95 });
        s.position.copy(lonLat(-140 + Math.random() * 280, BELTS[i % BELTS.length] + (Math.random() - .5) * 4, 1.006));
        s.material.opacity = 0;
        flashGroup.add(s);
        bolts.push({ s, at: Math.random() * 3.2, dur: 0.14 + Math.random() * 0.12 });
      }
      boltT0 = now();
    }

    api.live('条纹里全是风：浅色带朝上冒、深色带朝下沉。点“💨 看风向”或“⚡ 看闪电”');
    return {
      action(id) {
        if (id === 'winds') {
          winds.visible = !winds.visible;
          api.live(winds.visible
            ? '💨 相邻喷流方向相反；箭头只标方向，真实云图保持不动'
            : '风箭头收起来了。浅色带上升、深色带下沉');
        } else if (id === 'lightning') {
          strike();
          api.live('⚡ 云层深处亮起小闪电——Juno 的仪器“听”到过它们');
        }
      },
      update(t, dt) {
        if (!boltT0) return;
        const age = (now() - boltT0) / 1000;
        bolts.forEach(b => {
          const k = (age - b.at) / b.dur;
          b.s.material.opacity = k > 0 && k < 1 ? Math.sin(k * Math.PI) : 0;
        });
        if (age > 4.5) {
          boltT0 = 0;
          api.live('⚡ 一场闪电雨过去了。点“⚡ 看闪电”再看一场');
        }
      },
      exit: J.done,
    };
  };

  // ============ act_aurora · 两极有紫外极光 ============
  S.act_aurora = api => {
    const J = mainJupiter(api);
    J.sun(V(0.3, 0.85, 0.45));                 // 太阳偏高，极区看得清
    api.fly([0.45, 4.0, 1.8], [0, 0.45, 0], 2200);   // 在北极上空斜看（手机也能收进整个环）
    // 极光环（贴在主球上）：主要是看不见的紫外光，照片里常染成紫色
    const auroraMat = new THREE.MeshBasicMaterial({ color: 0x7a5cff, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false });
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.011, 8, 48), auroraMat);
    r1.rotation.x = Math.PI / 2;
    r1.position.copy(lonLat(0, 90, 1.012));
    const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.056, 0.008, 8, 40), auroraMat.clone());
    r2.rotation.x = Math.PI / 2;
    r2.position.copy(lonLat(0, 90, 1.007));
    const cap = glow(0x8a6aff, 0.34, { strength: 0.7 });
    cap.position.copy(lonLat(0, 90, 1.01));
    J.attach(r1); J.attach(r2); J.attach(cap);
    const tagA = surfLabel('紫外极光（示意）', { h: 0.025, color: '#b49aff' });
    tagA.position.copy(lonLat(40, 62, 1.04));
    J.attach(tagA);

    // 木卫一（真实贴图）绕圈，喷出的粒子顺着磁力线落向极区
    const io = ball(0.042, '../textures/io.jpg', { lit: true });
    const ioTag = label('木卫一：火山不断喷出粒子', { h: 0.023 });
    ioTag.position.y = 0.12;
    io.add(ioTag);
    const D_IO = 1.4;                          // 距离压缩，只为看清楚
    const ioOrbit = new THREE.Group();
    ioOrbit.rotation.set(0.32, 0, 0.1);
    ioOrbit.add(ring(D_IO, 0x9a8a76, 0.3), io);
    api.root.add(ioOrbit, lights(api.root, [2, 4, 5], 0.4));

    // 磁力线管道：从木卫一弯向北极；粒子在里面流动
    const NPts = 26, fluxPos = new Float32Array(NPts * 3);
    const fluxGeo = new THREE.BufferGeometry();
    fluxGeo.setAttribute('position', new THREE.BufferAttribute(fluxPos, 3));
    const flux = new THREE.Line(fluxGeo, new THREE.LineBasicMaterial({ color: 0x9fd5ff, transparent: true, opacity: 0.45 }));
    api.root.add(flux);
    const NP = 22, fpos = new Float32Array(NP * 3);
    const fgeo = new THREE.BufferGeometry();
    fgeo.setAttribute('position', new THREE.BufferAttribute(fpos, 3));
    api.root.add(new THREE.Points(fgeo, new THREE.PointsMaterial({ color: 0xbfe8ff, size: 0.05, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })));
    const A = new THREE.Vector3(), B = new THREE.Vector3(), M = new THREE.Vector3();
    let ioA = 0, flowOff = 0, boostUntil = 0;

    api.live('木星极光在<b>两极</b>，主要是看不见的紫外光（画面染成紫色，木卫一的距离是示意）。点“✨ 看极光”');
    return {
      action() {
        boostUntil = now() + 6000;
        api.live('✨ 木星的能量主要来自它自己：转得飞快＋磁场超强；木卫一喷出的粒子顺着磁力线落到两极，打出紫外极光——不全靠太阳风');
      },
      update(t, dt) {
        ioA -= dt * 0.22;                      // (cos a, 0, sin a) 形式：a 减小 = 从北极上空看逆时针公转
        io.position.set(Math.cos(ioA) * D_IO, 0, Math.sin(ioA) * D_IO);
        io.rotation.y = -ioA - Math.PI;        // 潮汐锁定：同一面朝着木星
        const boost = now() < boostUntil ? 3.2 : 1;
        flowOff += dt * 0.3 * boost;
        auroraMat.opacity = 0.3 + (boost - 1) * 0.12;
        r2.material.opacity = 0.3 + (boost - 1) * 0.12;
        // 更新管道曲线和粒子
        io.getWorldPosition(A);
        r1.getWorldPosition(B);
        M.copy(A).add(B).multiplyScalar(0.5).normalize().multiplyScalar(Math.max(A.length(), B.length()) + 0.35);
        for (let i = 0; i < NPts; i++) {
          const k = i / (NPts - 1), ik = 1 - k;
          fluxPos.set([ik * ik * A.x + 2 * ik * k * M.x + k * k * B.x,
                       ik * ik * A.y + 2 * ik * k * M.y + k * k * B.y,
                       ik * ik * A.z + 2 * ik * k * M.z + k * k * B.z], i * 3);
        }
        fluxGeo.attributes.position.needsUpdate = true;
        for (let i = 0; i < NP; i++) {
          const k = (flowOff + i / NP) % 1, ik = 1 - k;
          fpos.set([ik * ik * A.x + 2 * ik * k * M.x + k * k * B.x,
                    ik * ik * A.y + 2 * ik * k * M.y + k * k * B.y,
                    ik * ik * A.z + 2 * ik * k * M.z + k * k * B.z], i * 3);
        }
        fgeo.attributes.position.needsUpdate = true;
      },
      exit: J.done,
    };
  };

  // ============ act_impact · 1994 年彗星撞木星 ============
  S.act_impact = api => {
    const J = mainJupiter(api);
    const viewDir = V(0.6, 0.5, 3.6).normalize();
    J.face(-90, -44, viewDir);   // 先把南半球撞击带转向镜头，不依赖进入场景前停了多久
    const focus = J.point(-90, -44);
    const sunward = focus.normal.clone().add(V(-0.55, 0.28, 0.79).normalize()).normalize();
    J.sun(sunward);   // 南侧正视撞击带，侧向阳光照亮云纹而不冲白
    api.fly(focus.pos.clone().addScaledVector(focus.normal, 2.6).toArray(), focus.pos.toArray(), 2000);
    // 约 21 块碎片排成一串（“珍珠串”），从木星右上方飞来，撞进南纬约 44° 的云带（经度 -116°～-64°，正对镜头）
    const FRAG_N = 21, impacts = [];
    for (let i = 0; i < FRAG_N; i++) {
      const lon = -116 + i * 2.6 + (Math.random() - .5) * 1.5;
      const pt = J.point(lon, -44);
      const flash = glow(0xffd9a0, 0.1, { strength: 1.1 });
      flash.position.copy(lonLat(lon, -44, 1.006));
      flash.material.opacity = 0;
      J.attach(flash);
      const scar = new THREE.Mesh(new THREE.CircleGeometry(0.025, 24),
        new THREE.MeshBasicMaterial({ color: 0x2b1a12, transparent: true, opacity: 0, depthWrite: false }));
      scar.position.copy(lonLat(lon, -44, 1.0035));
      scar.quaternion.copy(tangentFrame(pt));
      scar.scale.y = 0.6 / FLATTEN;          // 扁扁的暗斑，竖直方向抵消主球扁缩
      J.attach(scar);
      const sprite = glow(0xffe0b0, 0.035, { strength: 0.9 });
      sprite.visible = false;
      api.root.add(sprite);
      impacts.push({
        sprite, flash, scar, tHit: 2.0 + i * 0.22,
        from: V(4.4, 2.6, 2.2).add(V(Math.sin(i * 1.7) * 0.4, Math.cos(i * 2.3) * 0.22, Math.sin(i * 0.9) * 0.25)),
        to: pt.pos,
      });
    }
    let t0 = 0;
    api.live('1994 年夏天，一颗彗星碎了，约 21 块碎片接连撞上木星。点“☄️ 看撞击”');
    return {
      action() {
        t0 = now();
        impacts.forEach(im => {
          im.sprite.visible = false;
          im.flash.material.opacity = 0;
          im.scar.material.opacity = 0;
        });
      },
      update(t, dt) {
        if (!t0) return;
        const s = (now() - t0) / 1000;
        let hit = 0;
        impacts.forEach((im, i) => {
          const k = clamp((s - i * 0.05) / (im.tHit - i * 0.05), 0, 1);
          if (k <= 0) return;
          if (k < 1) {
            im.sprite.visible = true;
            im.sprite.position.lerpVectors(im.from, im.to, k * k);   // 越飞越快
          } else {
            im.sprite.visible = false;
            hit++;
            const fs = s - im.tHit;
            im.flash.material.opacity = fs < 0.4 ? 1 - fs / 0.4 : 0;
            im.scar.material.opacity = Math.min(0.85, Math.max(0, (fs - 0.3) / 1.2) * 0.85);
          }
        });
        api.live(s < 2 ? '☄️ 苏梅克-列维 9 号被木星扯成一串碎片，正排着队飞来……'
          : hit < impacts.length ? `💥 第 ${hit} / ${impacts.length} 块撞上了！（演示加快了，真实撞击隔了好几天）`
          : '☁️ 暗斑是云被撞出来的伤痕，不是石头上的坑——木星没有固体表面。几个月后暗斑才慢慢散掉');
      },
      exit: J.done,
    };
  };

  // ============ life_gravity · 木星会改变小天体的路 ============
  S.life_gravity = api => {
    hideSun();
    api.fly([0.1, 2.2, 10], [0, 0, 0], 2000);
    lights(api.root, [-6, 3, 5], 0.45);
    const sun = sunBall(0.55);
    sun.position.set(-2.7, 0.2, -0.4);
    const jup = jupiterBall(0.8, { lit: true });
    const earth = ball(0.13, '../textures/earth_daymap.jpg', { lit: true });
    earth.position.set(2.6, -0.35, 0.2);
    const tagS = label('☀️ 太阳', { h: 0.024 }); tagS.position.set(-2.7, -0.6, -0.4);
    const tagJ = label('🪐 木星', { h: 0.024 }); tagJ.position.set(0, -1.15, 0);
    const tagE = label('🌍 地球', { h: 0.024 }); tagE.position.set(2.6, -0.78, 0.2);
    api.root.add(sun, jup, earth, tagS, tagJ, tagE);
    // 四条代表轨迹：被甩远 / 撞上木星 / 被推向地球 / 被引力扭弯后溜走
    const ROUTES = [
      { color: 0x9ed5e8, end: '甩出老远', tagOff: V(0, -0.32, 0), pts: [[-1.9, 1.6, 0.3], [-0.5, 1.3, 0.5], [0.9, 2.1, 0.4], [3.1, 2.7, 0.2]] },
      { color: 0xffc98a, end: '撞上木星', tagOff: V(0.32, 0.42, -0.1), pts: [[2.0, 1.7, -0.5], [0.7, 0.9, -0.25], [0.5, 0.62, -0.15]] },
      { color: 0xff8a6a, end: '推向地球！', tagOff: V(-0.25, -0.55, 0), pts: [[-1.7, -1.8, 0.4], [-0.2, -1.0, 0.25], [1.6, -0.5, 0.1], [2.45, -0.4, 0.05]] },
      { color: 0xc9b8ff, end: '被扭弯', tagOff: V(0, -0.32, 0), pts: [[2.3, -1.3, 0.7], [0.8, -0.3, 0.9], [-1.0, 0.5, 0.8], [-2.5, 1.5, 0.5]] },
    ];
    const routes = ROUTES.map((r, ri) => {
      const curve = new THREE.CatmullRomCurve3(r.pts.map(p => V(...p)));
      api.root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)),
        new THREE.LineBasicMaterial({ color: r.color, transparent: true, opacity: 0.28 })));
      const dot = glow(r.color, 0.12, { strength: 1 });
      api.root.add(dot);
      const tag = label(r.end, { h: 0.022, color: '#e8d9c2' });
      tag.position.copy(curve.getPoint(1)).add(r.tagOff);
      api.root.add(tag);
      return { curve, dot, phase: ri * 0.26 };
    });
    const hitFlash = glow(0xffc98a, 0.3, { strength: 1 });
    hitFlash.position.set(0.5, 0.62, -0.15);
    api.root.add(hitFlash);
    let t0 = now(), said = false;
    api.live('木星引力会改变小天体的路（大小和距离压缩了）。点“☄️ 改变轨道”');
    return {
      action() { t0 = now(); said = false; api.live('☄️ 一样的靠近，不一样的结局：有的被甩远，有的撞上去，有的被推往地球……'); },
      update(t, dt) {
        jup.rotation.y += dt * 0.25;           // rotation.y 增大 = 从北极上空看逆时针自转
        const cyc = ((now() - t0) / 1000 / 9) % 1;
        routes.forEach(r => {
          const k = (cyc + r.phase) % 1;
          r.dot.position.copy(r.curve.getPoint(k));
          r.dot.material.opacity = k > 0.95 ? (1 - k) / 0.05 * 0.9 : 0.9;
        });
        const kHit = (cyc + routes[1].phase) % 1;
        hitFlash.material.opacity = kHit > 0.96 ? (kHit - 0.96) / 0.04 * 0.9 : 0;
        if (!said && (now() - t0) / 1000 > 9.5) {
          said = true;
          api.live('“保护地球”还是“把麻烦送过来”？科学家还在讨论。再点“☄️ 改变轨道”看一遍');
        }
      },
    };
  };

  // ============ life_sky · 肉眼亮点，望远镜里的卫星 ============
  S.life_sky = api => {
    hideSun();
    api.fly([0, 0.15, 7.8], [0, 0, 0], 2000);
    lights(api.root, [4, 3, 6], 0.5);
    // 肉眼：夜空里一颗亮亮的“星”
    const naked = new THREE.Group();
    naked.add(glow(0xfff3d0, 0.3, { strength: 1.2 }));
    const tagEye = label('木星：夜空里很亮的“星”', { h: 0.028 });
    tagEye.position.y = -0.55;
    naked.add(tagEye);
    api.root.add(naked);
    // 望远镜视野（真实贴图的木星和卫星）
    const scope = new THREE.Group();
    const jup = jupiterBall(0.8, { lit: true });
    jup.position.set(-0.9, 0, 0);
    scope.add(jup);
    const view = moonsView(scope, -0.9);
    scope.visible = false;
    api.root.add(scope);
    let night = 0, mode = 'naked';
    api.live('夜空里木星是很亮的一颗“星”。点“🔭 用望远镜”，看看它的四颗大卫星');
    return {
      action() {
        if (mode === 'naked') {
          mode = 'scope';
          naked.visible = false;
          scope.visible = true;
          night = 0;
          view.place(0);
          api.fly([-0.9, 0.05, 8.6], [-0.9, 0, 0], 1800);
          api.live('🔭 哇！木星旁边有四颗小星星排成队（大小和距离夸大了）：木卫一、木卫二、木卫三、木卫四');
        } else {
          night++;
          view.place(night);
          api.live(`🌙 第 ${night + 1} 晚：四颗卫星的位置又变了！它们都在绕着木星转（距离压缩了）`);
        }
      },
      update(t, dt) { jup.rotation.y += dt * 0.15; },
    };
  };

  // ============ life_europa · 木卫二冰下可能有海洋 ============
  S.life_europa = api => {
    hideSun();
    api.fly([0, 0.3, 3.7], [0, 0, 0], 2000);
    lights(api.root, [3, 4, 6], 0.55);
    // 完整的木卫二（真实贴图）
    const full = new THREE.Mesh(new THREE.SphereGeometry(1, 72, 48),
      withTex(new THREE.MeshLambertMaterial(), '../textures/europa.jpg'));
    api.root.add(full);
    // 剖开的内部：冰壳 / 冰下海洋（科学家认为可能有）/ 岩石内部
    const cut = new THREE.Group();
    const shellIn = new THREE.Mesh(new THREE.SphereGeometry(1, 72, 48),
      withTex(new THREE.MeshLambertMaterial({ side: THREE.BackSide }), '../textures/europa.jpg'));   // 只画后半球，剖面才看得见
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 8, 72),
      new THREE.MeshBasicMaterial({ color: 0xdfe9f2 }));
    const ocean = new THREE.Mesh(new THREE.RingGeometry(0.92, 0.985, 72), new THREE.MeshBasicMaterial({ color: 0x1d4e8a, transparent: true, opacity: 0.92 }));
    const rock = new THREE.Mesh(new THREE.CircleGeometry(0.92, 64), new THREE.MeshBasicMaterial({ color: 0x6d5f4e }));
    rock.position.z = 0.02;
    const iceRing = new THREE.Mesh(new THREE.RingGeometry(0.985, 1, 72), new THREE.MeshBasicMaterial({ color: 0xe8f0f6 }));
    iceRing.position.z = 0.03;
    cut.add(shellIn, rim, ocean, rock, iceRing);
    const tags = [
      ['冰壳', 0.77, 0.63],
      ['冰下海洋（可能）', 0.74, -0.61],
      ['岩石内部', 0, -0.35],
    ].map(([text, x, y]) => {
      const l = label(text, { h: 0.024, color: '#cfe3f5' });
      l.position.set(x, y, 0.02);
      l.visible = false;
      cut.add(l);
      return l;
    });
    cut.visible = false;
    api.root.add(cut);
    let opened = false, t0 = 0;
    api.live('木卫二表面全是冰，还有一道道裂纹。点“🧊 剖开看看”');
    return {
      action() {
        opened = !opened;
        full.visible = !opened;
        cut.visible = opened;
        t0 = now();
        tags.forEach(l => { l.visible = false; });
        api.live(opened
          ? '🧊 切开看看：冰壳下面，科学家认为可能藏着一大片海洋——还没有发现生命哦'
          : '木卫二表面全是冰，还有一道道裂纹。点“🧊 剖开看看”');
      },
      update(t, dt) {
        if (opened) shellIn.rotation.y += dt * 0.05;
        if (!opened || !t0) return;
        const s = (now() - t0) / 1000;
        tags.forEach((l, i) => { l.visible = s > 0.4 + i * 0.7; });
      },
    };
  };

  // ============ story_birth · 先长核心，再吸进气体（核心吸积假说） ============
  S.story_birth = api => {
    hideSun();
    api.fly([0, 2.0, 6.8], [0, 0.1, 0], 2000);
    lights(api.root, [4, 4, 5], 0.5);
    const sun = sunBall(0.55);
    api.root.add(sun);
    const JUP_R = 1.9;                       // 原木星轨道（示意）
    api.root.add(ring(JUP_R, 0xc9b8a0, 0.22));
    // 一大圈尘埃和小冰块（冰粒偏蓝白、岩石偏暖）
    const N = 1400, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), P = [];
    for (let i = 0; i < N; i++) {
      const r = 0.7 + Math.pow(Math.random(), 0.85) * 2.7, a = Math.random() * TAU;
      P.push({ r, a, y: (Math.random() - .5) * 0.13 * r, eaten: false });
      const ice = Math.random() < 0.5;
      col.set(ice ? [0.75, 0.85, 0.95] : [0.9, 0.75, 0.55], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    api.root.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.045, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false })));
    // 岩石冰核 → 吸进氢和氦 → 大行星
    const core = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), new THREE.MeshStandardMaterial({ color: 0x8a6f52, roughness: 0.9 }));
    core.position.set(JUP_R, 0, 0);
    core.scale.setScalar(0.001);
    const gas = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32),
      new THREE.MeshLambertMaterial({ color: 0xd9bd92, transparent: true, opacity: 0, depthWrite: false }));
    withTex(gas.material, 'assets/textures/jupiter-4k.jpg');   // 形成过程是示意，长出的云带仍来自真实观测
    gas.position.copy(core.position);
    const tagCore = label('先聚成岩石冰核', { h: 0.024 });
    tagCore.position.set(JUP_R, -0.5, 0);
    const tagGas = label('再吸进大量氢和氦', { h: 0.024 });
    tagGas.position.set(JUP_R, 0.95, 0);
    tagGas.visible = false;
    api.root.add(core, gas, tagCore, tagGas);
    let t0 = 0;
    api.live('科学家的一种假说（核心吸积）：约 46 亿年前，木星是尘埃和小冰块撞出来的。点“🌀 聚起来”');
    return {
      action() {
        t0 = now();
        P.forEach(p => { p.eaten = false; });
        core.scale.setScalar(0.001);
        gas.scale.setScalar(0.001);
        gas.material.opacity = 0;
        tagGas.visible = false;
      },
      update(t, dt) {
        const s = t0 ? (now() - t0) / 1000 : 0;
        const k = t0 ? ease(clamp(s / 11, 0, 1)) : 0;
        core.scale.setScalar(0.02 + 0.2 * smooth(0, 0.45, k));            // 第一步：岩石冰核长大
        const gk = smooth(0.35, 0.95, k);
        gas.scale.setScalar(0.25 + 0.55 * gk);                            // 第二步：大口吸进气体
        gas.material.opacity = 0.55 * gk;
        tagGas.visible = k > 0.45;
        P.forEach((p, i) => {
          p.a += dt * 0.9 * Math.pow(2.1 / p.r, 1.5);                     // (cos a, 0, -sin a) 形式：a 增大 = 从北极看逆时针；越靠近太阳转得越快
          const q = V(Math.cos(p.a) * p.r, p.y, -Math.sin(p.a) * p.r);
          if (t0 && !p.eaten) {
            const d = q.distanceTo(core.position);
            if (d < 0.62) q.lerp(core.position, 1 - Math.exp(-dt * 4));   // 被核心吸过去
            if (d < 0.22 + 0.14 * k) p.eaten = true;
          }
          if (p.eaten) q.set(0, -999, 0);
          pos.set([q.x, q.y, q.z], i * 3);
        });
        geo.attributes.position.needsUpdate = true;
        if (!t0) return;
        api.live(s < 4 ? '☄️ 尘埃和小冰块撞在一起，越撞越大，聚成一颗岩石冰核……'
          : s < 11 ? '🌪️ 岩石冰核够重了，开始大口吸进氢和氦气体……'
          : '🪐 木星出生了！这是科学家的一种假说，真正的过程没有人亲眼见过');
      },
    };
  };

  // ============ story_migration · 木星可能搬过家（大迁移假说） ============
  S.story_migration = api => {
    hideSun();
    api.fly([0, 7.4, 4.6], [0, 0, 0], 2000);   // 从北极上空俯瞰整个太阳系（示意）
    api.root.add(new THREE.AmbientLight(0xffffff, 0.3));
    api.root.add(new THREE.PointLight(0xfff2dd, 1.5, 0, 0));
    api.root.add(sunBall(0.55));
    const R_OUT = 2.4, R_IN = 1.0, ICE = 1.75;   // 今天轨道 / 最近时轨道 / 冰线（都示意）
    [['🌍', '../textures/earth_daymap.jpg', 1.35, 0.08], ['🔴', '../textures/mars.jpg', 1.9, 0.06]].forEach(([, tex, r, rad]) => {
      const b = ball(rad, tex);
      b.position.set(r, 0, 0);
      api.root.add(b, ring(r, 0x8a94a8, 0.22));
    });
    api.root.add(ring(ICE, 0x7fc8e8, 0.45));
    const tagIce = label('冰线：外面积雪成冰', { h: 0.023, color: '#9fd8f0' });
    tagIce.position.set(ICE * 0.82, 0, -ICE * 0.57);
    api.root.add(tagIce);
    const jupRing = ring(1, 0xd9b98c, 0.35);
    const satRing = ring(1, 0xc9b8a0, 0.25);
    const jup = jupiterBall(0.26, { lit: true });
    const sat = ball(0.22, '../textures/saturn.jpg', { lit: true });
    const tagJ = label('木星', { h: 0.023 });
    tagJ.position.y = 0.42;
    jup.add(tagJ);
    const tagSat = label('土星', { h: 0.022 });
    tagSat.position.y = 0.36;
    sat.add(tagSat);
    api.root.add(jupRing, satRing, jup, sat);
    let t0 = 0;
    const DUR = 13;
    api.live('科学家猜想（大迁移假说）：木星小时候可能“搬过家”。点“🧭 看一种假说”');
    return {
      action() { t0 = now(); api.live('🧭 很久很久以前……年轻的木星离开远处的家，朝太阳挪（示意动画）'); },
      update(t, dt) {
        const s = t0 ? (now() - t0) / 1000 : 0;
        const k1 = smooth(0.02, 0.42, s / DUR);   // 先向内迁
        const k2 = smooth(0.55, 0.95, s / DUR);   // 再被土星“拉”回远处
        const rj = R_OUT + (R_IN - R_OUT) * k1 + (R_OUT - R_IN) * k2;
        const rs = R_OUT * 1.18 + (R_IN * 1.5 - R_OUT * 1.18) * k1 + (R_OUT * 1.18 - R_IN * 1.5) * k2;
        const aj = 2.4 + s * 0.14;                // (cos a, 0, -sin a) 形式：a 增大 = 从北极上空看逆时针
        jup.position.set(Math.cos(aj) * rj, 0, -Math.sin(aj) * rj);
        jupRing.scale.setScalar(Math.max(rj, 0.001));
        sat.position.set(Math.cos(aj - 0.9) * rs, 0, -Math.sin(aj - 0.9) * rs);
        satRing.scale.setScalar(Math.max(rs, 0.001));
        if (!t0) return;
        api.live(s / DUR < 0.42 ? '🧭 年轻的木星朝太阳挪，越过了冰线……（假说的示意动画）'
          : s / DUR < 0.55 ? '⚠️ 要是它一直冲进去，今天地球的位置可能就乱了'
          : s / DUR < 0.95 ? '🤝 土星长成后，两颗星的引力互相拉住（1:2 共振），又一起挪回远处'
          : '🏠 它们停在了今天的大致位置。这只是科学家的一种假说，不是拍下来的历史');
      },
    };
  };

  // ============ story_future · 太阳老了，木星可能还在 ============
  S.story_future = api => {
    hideSun();
    api.fly([0, 8, 14.5], [0, 0, 0], 2000);
    api.root.add(new THREE.AmbientLight(0xffffff, 0.25));
    api.root.add(new THREE.PointLight(0xffe8c0, 1.5, 0, 0));
    const sunMat = withTex(new THREE.MeshBasicMaterial({ color: 0xfff2c0 }), '../textures/stars/red_supergiant_surface.jpg');
    const sun = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 40), sunMat);
    const sunGlow = glow(0xff6a3a, 2.4, { strength: 0.8 });
    api.root.add(sun, sunGlow);
    const tagSun = label('太阳', { h: 0.024 });
    tagSun.position.set(0, 2.1, 0);
    api.root.add(tagSun);
    const R = 4.2;
    api.root.add(ring(R, 0xc9b8a0, 0.3));
    const outR = ring(R * 1.12, 0x9ed5e8, 0.28);
    api.root.add(outR);
    const tagOut = label('虚线：轨道可能再往外挪一点', { h: 0.023, color: '#9ed5e8' });
    tagOut.position.set(-4.55, 0.35, -1.75);
    api.root.add(tagOut);
    const jup = jupiterBall(0.5, { lit: true });
    const tagJ = label('木星：离得远，可能没事', { h: 0.024 });
    tagJ.position.y = 0.85;
    jup.add(tagJ);
    api.root.add(jup);
    let a = 0.8, t0 = 0;
    api.live('科学家估计：很久很久以后，太阳会变老、变大。点“🔴 看遥远的未来”');
    return {
      action() { t0 = now(); api.live('🔴 大约 50 亿年后（科学家估计），太阳可能膨胀成一颗红巨星……'); },
      update(t, dt) {
        a += dt * 0.12;                          // (cos a, 0, -sin a) 形式：a 增大 = 从北极上空看逆时针公转
        const progress = t0 ? ease(clamp((now() - t0) / 10000, 0, 1)) : 0;
        const orbitR = R * (1 + 0.12 * progress);
        jup.position.set(Math.cos(a) * orbitR, 0, -Math.sin(a) * orbitR);
        jup.rotation.y += dt * 0.2;
        const s = t0 ? (now() - t0) / 1000 : 0;
        const k = t0 ? ease(clamp(s / 10, 0, 1)) : 0;
        sun.scale.setScalar(0.55 + 1.05 * k);    // 太阳膨胀成红巨星（示意）
        sunMat.color.setRGB(1, 0.93 - 0.61 * k, 0.75 - 0.57 * k);
        sunGlow.scale.setScalar(2 + 3.6 * k);
        sunGlow.material.opacity = 0.35 + 0.3 * k;
        tagSun.position.y = 2.1 + 1.6 * k;       // 标签跟着变大的太阳往上挪
        if (!t0) return;
        api.live(s < 10 ? '🔴 太阳变大、变红了……木星在远处看着（大小和距离是示意）'
          : '🪐 木星离得远，科学家估计它能幸存下来，轨道还可能向外挪一挪');
      },
    };
  };

  // ============ probe_galileo · 1610 年：伽利略发现卫星 ============
  S.probe_galileo = api => {
    hideSun();
    api.fly([-0.95, 0.1, 8.6], [-0.95, 0, 0], 2000);
    lights(api.root, [4, 3, 6], 0.5);
    const jup = jupiterBall(0.72, { lit: true });
    jup.position.set(-0.95, 0, 0);
    const tagJ = label('木星', { h: 0.022 });
    tagJ.position.set(-0.95, -0.95, 0);
    api.root.add(jup, tagJ);
    const view = moonsView(api.root, -0.95);
    view.place(0);   // 第一晚还没点按钮时，四颗卫星也在各自的位置
    let night = 0;
    api.live('1610 年，伽利略把望远镜指向木星，看到旁边有四颗小星星。点“🔭 连续看几晚”');
    return {
      action() {
        night++;
        view.place(night - 1);
        api.live(night === 1
          ? '🔭 第 1 晚：四颗小点在木星旁边（大小和距离夸大了）'
          : `📓 第 ${night} 晚：它们的位置又变了！原来它们绕着木星转——不是所有天体都绕地球`);
      },
      update(t, dt) { jup.rotation.y += dt * 0.12; },
    };
  };

  // ============ probe_flyby · 先驱者和旅行者飞掠木星 ============
  S.probe_flyby = api => {
    const J = mainJupiter(api);
    api.fly([0.5, 1.4, 4.3], [0, 0, 0], 2000);
    lights(api.root, [3, 4, 6], 0.6);
    // 木星的尘埃环：又细又暗，绝不能画成土星那样
    const r1 = ring(1.4, 0x9a8a76, 0.13);
    const r2 = ring(1.62, 0x8a7a66, 0.09);
    J.attach(r1); J.attach(r2);
    const tagRing = surfLabel('暗淡的尘埃环', { h: 0.024, color: '#cbb89a' });
    tagRing.position.copy(lonLat(-35, 24, 1.34));   // 放在朝镜头这一侧，不会被木星挡住
    J.attach(tagRing);
    // 探测器沿一条弧线飞掠（示意模型）
    const probe = probeModel();
    const path = new THREE.CatmullRomCurve3([V(5.2, 1.8, -2.6), V(2.6, 0.7, -1.2), V(1.7, 0.4, 1.1), V(3.4, 0.9, 2.9), V(6.2, 1.6, 3.8)]);
    probe.position.copy(path.getPoint(0));
    api.root.add(probe, new THREE.Line(new THREE.BufferGeometry().setFromPoints(path.getPoints(80)),
      new THREE.LineBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 0.3 })));
    let t0 = 0;
    api.live('1973—1979 年，先驱者号和旅行者号先后飞过木星。点“💫 看暗淡的环”');
    return {
      action() { t0 = now(); api.live('🚀 探测器沿着一条弧线飞过木星（大小和距离压缩了）……'); },
      update(t, dt) {
        if (!t0) return;
        const s = (now() - t0) / 1000, DUR = 9;
        const k = clamp(s / DUR, 0, 1);
        probe.position.copy(path.getPoint(k));
        probe.lookAt(path.getPoint(Math.min(1, k + 0.02)));
        if (k > 0.55) {                          // 飞掠时让暗环闪一闪
          const p = 0.08 * Math.sin((k - 0.55) * 18) ** 2;
          r1.material.opacity = 0.13 + p;
          r2.material.opacity = 0.09 + p;
        }
        if (s > DUR) {
          t0 = 0;
          r1.material.opacity = 0.13;
          r2.material.opacity = 0.09;
          api.live('💫 旅行者 1 号在 1979 年发现：木星有一圈<b>很暗很细</b>的尘埃环，比土星的环暗得多，环里主要是尘埃');
        } else if (k > 0.55) {
          api.live('👀 飞过的时候仔细看：木星腰上有一圈淡淡的环……');
        }
      },
      exit: J.done,
    };
  };

  // ============ probe_orbiter · 伽利略号环绕木星 ============
  S.probe_orbiter = api => {
    const J = mainJupiter(api);
    api.fly([0.4, 1.4, 8.6], [0, 0, 0], 2000);
    lights(api.root, [4, 4, 5], 0.55);
    // 伽利略号的椭圆轨道（焦点在木星中心），轨道面微微翘起；椭圆参数 z 取 +sin，所以近心点方向 E 要减小 = 逆时针
    const tiltG = new THREE.Group();
    tiltG.rotation.x = 0.3;
    tiltG.rotation.z = 0.12;
    const ORB = { a: 2.1, e: 0.35 };
    tiltG.add(ellipse(ORB.a, ORB.e, 0xd9b98c, 0.4));
    api.root.add(tiltG);
    const orbiter = spritePhoto('assets/photos/galileo.png', 0.34);   // 透明模型的伽利略号
    const tagO = label('伽利略号（1995—2003 环绕木星）', { h: 0.023 });
    tagO.position.y = 0.42;
    orbiter.add(tagO);
    tiltG.add(orbiter);
    // 大气探针：分离 → 钻进大气 → 发回约 1 小时数据
    const capsule = new THREE.Group();
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 16), new THREE.MeshStandardMaterial({ color: 0xd8cbb0 }));
    cone.rotation.x = Math.PI;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10, 0, TAU, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xb8a888 }));
    dome.position.y = 0.05;
    capsule.add(cone, dome);
    capsule.visible = false;
    const heat = glow(0xffa050, 0.16, { strength: 1 });
    heat.visible = false;
    const P0 = V(1.9, 0.62, 0.8), P1 = V(0.55, 0.2, 0.24).setLength(1.0);   // 终点在云顶上
    api.root.add(capsule, heat);
    let ea = 0, t0 = 0;
    api.live('伽利略号绕着木星转了 8 年！它还放出一颗小探针钻进大气。点“🛰️ 看大气探针”');
    return {
      action() { t0 = now(); capsule.visible = true; heat.visible = true; api.live('🛰️ 探针和轨道器告别，朝木星大气冲下去……'); },
      update(t, dt) {
        ea -= dt * 0.5;                        // 椭圆 +sin 参数：E 减小 = 从北极上空看逆时针环绕
        orbiter.position.set(ORB.a * (Math.cos(ea) - ORB.e), 0, ORB.a * Math.sqrt(1 - ORB.e * ORB.e) * Math.sin(ea));
        if (!t0) return;
        const s = (now() - t0) / 1000, DUR = 8;
        const k = clamp(s / DUR, 0, 1);
        capsule.position.lerpVectors(P0, P1, k * k);
        heat.position.copy(capsule.position);
        heat.material.opacity = k > 0.55 && k < 0.95 ? 0.9 : Math.max(0, 0.9 - (k - 0.95) * 8);
        if (s > DUR + 1.5) {
          t0 = 0;
          capsule.visible = false;
          heat.visible = false;
          api.live('📡 探针一边下降一边发回数据，撑了约 1 小时，最后消失在厚厚的云层里；轨道器继续工作到 2003 年');
        } else if (k > 0.55) {
          api.live(k < 0.85 ? '🔥 探针和大气摩擦，烧得发亮！降落伞打开，慢了下来' : '📡 它穿过云层，把测到的数据发回轨道器');
        }
      },
      exit: J.done,
    };
  };

  // ============ probe_juno · 朱诺号从两极看木星 ============
  S.probe_juno = api => {
    const J = mainJupiter(api);
    api.fly([0.4, 5.2, 4.0], [0, 0.4, 0], 2200);   // 斜看北极，完整极轨不会被窄屏裁掉
    lights(api.root, [4, 4, 5], 0.5);
    // 极轨：几乎竖着的椭圆，掠过北极和南极；近心点略高于北极，不会穿进木星
    const tiltG = new THREE.Group();
    tiltG.rotation.z = 1.25;
    tiltG.rotation.y = 0.15;
    const ORB = { a: 2.1, e: 0.38 };
    tiltG.add(ellipse(ORB.a, ORB.e, 0x9ed5e8, 0.45));
    api.root.add(tiltG);
    const juno = new THREE.Group();
    juno.add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 6),
      new THREE.MeshStandardMaterial({ color: 0xd8d2c2, metalness: 0.4, roughness: 0.5 })));
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x27408f, metalness: 0.3, roughness: 0.5, side: THREE.DoubleSide });
    [0, 1, 2].forEach(i => {                 // 三块太阳能板（示意）
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.008, 0.09), panelMat);
      p.rotation.y = i * Math.PI / 3;
      juno.add(p);
    });
    const tag = label('朱诺号（2016 年抵达，仍在探测）', { h: 0.022 });
    tag.position.y = 0.34;
    juno.add(tag);
    tiltG.add(juno);
    const tagPole = surfLabel('极区：一圈气旋（点卡片照片放大）', { h: 0.024, color: '#bcd8ff' });
    tagPole.position.copy(lonLat(30, 66, 1.04));
    J.attach(tagPole);
    let ea = 0, t0 = 0;
    api.live('朱诺号沿着“过极点”的轨道绕木星飞。点“🛰️ 飞一次极轨”');
    return {
      action() { t0 = now(); api.live('🛰️ 正掠过北极上空！两极的云带花样和赤道完全不一样'); },
      update(t, dt) {
        ea -= dt * (t0 ? 0.9 : 0.22);          // 椭圆 +sin 参数：E 减小 = 逆时针
        const E = ea % TAU;
        juno.position.set(ORB.a * (Math.cos(E) - ORB.e), 0, ORB.a * Math.sqrt(1 - ORB.e * ORB.e) * Math.sin(E));
        if (!t0) return;
        const s = (now() - t0) / 1000;
        if (s > 7) {
          t0 = 0;
          api.live('🔵 朱诺号还发现：木星的核心是“模糊的”，不是硬邦邦的铁球。2026 年它仍在工作，任务团队计划探测到 2028 年');
        }
      },
      exit: J.done,
    };
  };

  // ============ probe_future · 下一批探测器在路上 ============
  S.probe_future = api => {
    hideSun();
    api.fly([0, 3.4, 15.2], [0, 0.1, 0], 2000);
    lights(api.root, [5, 3, 6], 0.5);
    // 时间线是示意（不均匀刻度）：左地球、右木星
    const X = { earth: -4.2, y2023: -3.1, y2024: -2.4, now: -0.7, y2030: 1.5, y2031: 2.3, tw4: 3.5, jup: 4.4 };
    const earth = ball(0.16, '../textures/earth_daymap.jpg', { lit: true });
    earth.position.set(X.earth, 0, 0);
    const jup = jupiterBall(0.55, { lit: true });
    jup.position.set(X.jup, 0.1, 0);
    const tagEarth = label('地球', { h: 0.023 }); tagEarth.position.set(X.earth, -0.42, 0);
    const tagJup = label('木星', { h: 0.023 }); tagJup.position.set(X.jup, -0.78, 0);
    api.root.add(earth, jup, tagEarth, tagJup);
    api.root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(-3.6, -0.75, 0), V(4.1, -0.75, 0)]),
      new THREE.LineBasicMaterial({ color: 0xc9b8a0, transparent: true, opacity: 0.5 })));
    [[X.y2023, '2023 出发', -1.0], [X.y2024, '2024 出发', -1.35], [X.now, '现在 · 2026', -1.0], [X.y2030, '2030 抵达', -1.35], [X.y2031, '2031 抵达', -1.0]].forEach(([x, text, y]) => {
      api.root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(x, -0.82, 0), V(x, -0.68, 0)]),
        new THREE.LineBasicMaterial({ color: 0xc9b8a0, transparent: true, opacity: 0.6 })));
      const l = label(text, { h: 0.021, color: '#d8cbb2' });
      l.position.set(x, y, 0);
      api.root.add(l);
    });
    // 三艘飞船：JUICE 艺术图、欧罗巴快船透明模型、天问四号示意模型（高低错开，免得标签互相叠）
    const juice = spritePhoto('assets/photos/juice.jpg', 0.85);
    juice.position.set(X.y2023, 1.2, 0);
    const tagJuice = label('JUICE（欧空局）', { h: 0.022 });
    tagJuice.position.set(X.y2023, 2.0, 0);
    const clipper = spritePhoto('assets/photos/europa-clipper.png', 0.72);
    clipper.position.set(X.y2024, 0.75, 0.05);
    const tagClip = label('欧罗巴快船（NASA）', { h: 0.022 });
    tagClip.position.set(X.y2024, 1.62, 0);
    const tw4 = probeModel();
    tw4.scale.setScalar(2.2);
    tw4.position.set(X.tw4, 1.05, 0);
    const tagTw = label('天问四号 · 计划中', { h: 0.022, color: '#ffd9a0' });
    tagTw.position.set(X.tw4, 1.8, 0);
    api.root.add(juice, tagJuice, clipper, tagClip, tw4, tagTw);
    // 两颗飞行中的小光点：从发射年份飞向木星
    const m1 = glow(0xffe9a0, 0.12, { strength: 1 });
    const m2 = glow(0xffe9a0, 0.12, { strength: 1 });
    m1.visible = m2.visible = false;
    api.root.add(m1, m2);
    let t0 = 0;
    api.live('新的探测器正在飞往木星！点“🚀 看看时间表”');
    return {
      action() {
        t0 = now();
        m1.visible = m2.visible = true;
        api.live('🚀 JUICE 2023 年出发、欧罗巴快船 2024 年出发，现在都还在路上（时间线是示意）');
      },
      update(t, dt) {
        jup.rotation.y += dt * 0.2;
        if (!t0) return;
        const s = (now() - t0) / 1000;
        const k1 = clamp(s / 3.5, 0, 1), k2 = clamp((s - 0.8) / 3.5, 0, 1);
        m1.position.set(X.y2023 + (X.jup - 0.75 - X.y2023) * ease(k1), 0.2, 0);
        m2.position.set(X.y2024 + (X.jup - 0.75 - X.y2024) * ease(k2), 0.2, 0.05);
        if (s > 9) {
          t0 = 0;
          m1.visible = m2.visible = false;
          api.live('🛰️ 欧罗巴快船预计 2030 年到木星，JUICE 预计 2031 年到；中国的天问四号计划 2030 年前后发射');
        }
      },
    };
  };

  return S;
};
