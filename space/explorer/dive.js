/* “里面是什么”模块：从太空一站一站钻到星球中心（太阳、行星共用）
   数据来自 BODY.dive：
     stops    —— 一站一站的停靠点（镜头离球心的距离、温度、要换的外观、要高亮的层）
     interior —— 剖面上的分层（半径范围、颜色、花纹）
   星球表面 shader 需要调用引擎提供的 cutDiscard()，这样剖开的楔形才会被挖掉。
   旁白 key：dive_intro，以及每一站的 dive_<站名>。 */
Explorer.registerModule('dive', ctx => {
  'use strict';
  const { camera, controls, cut, say, body } = ctx;
  const { stops, interior } = body.dive;
  const N = stops.length;
  const ELEV = 13;   // 默认镜头抬高的角度（度），略微从上往下看，能看见剖面上的一圈圈
  const openFrom = stops.findIndex(s => s.open) - 1;  // 从这一站往下开始剖开
  const layerIndex = id => interior.findIndex(l => l.id === id);

  // ============ 界面 ============
  const ui = document.createElement('div');
  ui.id = 'dive-panel';
  ui.hidden = true;
  ui.innerHTML = `
    <div class="thermo" aria-label="温度计">
      <div class="thermo-value" id="thermo-value"></div>
      <div class="thermo-tube"><i id="thermo-fill"></i></div>
      <div class="thermo-bulb"></div>
    </div>
    <div class="depth">
      <button class="depth-step" id="dive-up" aria-label="往外飞">⬆</button>
      <div class="depth-track" id="depth-track">
        ${stops.map((s, i) => `<button class="depth-stop" data-i="${i}" style="top:${i / (N - 1) * 100}%"><span>${s.name}</span></button>`).join('')}
        <div class="depth-handle" id="depth-handle">⛏️</div>
      </div>
      <button class="depth-step down" id="dive-down" aria-label="往下钻">⬇</button>
    </div>
    <div class="layer-card" id="layer-card">
      <h2 id="layer-name"></h2>
      <p class="layer-temp" id="layer-temp"></p>
      <p class="layer-fact" id="layer-fact"></p>
      <p class="layer-where" id="layer-where"></p>
    </div>`;
  document.body.append(ui);
  const $ = id => document.getElementById(id);

  // ============ 剖面（两块半圆片，挂在剖面框架上） ============
  const faceUniforms = {
    time: { value: 0 }, highlight: { value: -1 }, count: { value: interior.length },
    uR0: { value: interior.map(l => l.r0) }, uR1: { value: interior.map(l => l.r1) },
    uPat: { value: interior.map(l => l.pattern || 0) },
    uC0: { value: interior.map(l => new THREE.Color(l.c0)) }, uC1: { value: interior.map(l => new THREE.Color(l.c1)) },
  };
  const L = Math.max(1, interior.length);
  const faceMat = new THREE.ShaderMaterial({
    uniforms: faceUniforms,
    side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `
      #define L ${L}
      uniform float time, highlight, count;
      uniform float uR0[L], uR1[L], uPat[L];
      uniform vec3 uC0[L], uC1[L];
      varying vec2 vP;
      const float PI = 3.14159265;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){
        vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
      }
      // 对流：一根根上升的热柱和下沉的冷柱，花纹沿半径方向流动
      float convection(float psi, float t){
        float q = (psi / PI + 0.5) * 16.0;
        float plume = sin(fract(q) * PI);                 // 柱子中间热、边缘凉
        float dir = plume > 0.5 ? 1.0 : -1.0;            // 中间往上走，边缘往下沉
        float n = noise(vec2(q * 3.0, t * 9.0 - dir * time * 0.6));
        return 0.72 + 0.34 * plume + 0.22 * (n - 0.5);
      }
      void main(){
        float r = length(vP);
        if (r > 1.0) discard;
        float psi = atan(vP.y, vP.x);
        vec3 col = vec3(0.0); float bright = 1.0, isHl = 0.0, edge = 0.0;
        for (int i = 0; i < L; i++) {
          if (float(i) < count && r >= uR0[i] && r <= uR1[i]) {
            float t = (r - uR0[i]) / max(uR1[i] - uR0[i], 1e-4);
            col = mix(uC0[i], uC1[i], t);
            if (uPat[i] > 0.5 && uPat[i] < 1.5) bright = convection(psi, t);
            else if (uPat[i] < 2.5) bright = 0.97 + 0.06 * (noise(vP * 18.0 + time * 0.25) - 0.5);
            else if (uPat[i] < 3.5) {
              // 核聚变：一闪一闪的小亮点
              vec2 g = vP * 60.0, cell = floor(g);
              float k = floor(time * 4.0 + hash(cell) * 5.0);
              float spark = step(0.97, hash(cell + k)) * (1.0 - fract(time * 4.0 + hash(cell) * 5.0));
              spark *= smoothstep(0.45, 0.05, length(fract(g) - 0.5));   // 圆圆的小闪光，不是方块
              bright = 0.95 + 0.1 * noise(vP * 20.0 + time) - 0.2 * t + spark * 0.6;
            } else if (uPat[i] < 4.5) {
              // 液态外核：铁镍缓慢对流，不使用太阳的光子与聚变动画
              bright = 0.78 + 0.32 * convection(psi + sin(time * 0.15) * 0.08, t);
            }
            if (abs(float(i) - highlight) < 0.5) {
              isHl = 1.0;
              // 当前这一层的内外边缘描一圈亮边
              edge = -max(smoothstep(0.012, 0.0, abs(r - uR0[i])) * step(0.01, uR0[i]), smoothstep(0.012, 0.0, abs(r - uR1[i])));
            }
            if (isHl < 0.5) edge = smoothstep(0.006, 0.0, abs(r - uR0[i])) * step(0.01, uR0[i]);
          }
        }
        col *= bright;
        col = edge >= 0.0 ? mix(col, col * 0.45, edge)   // 层与层之间画一条暗线
                          : mix(col, vec3(1.0), -edge * 0.85);   // 当前层描亮边
        col = mix(col, vec3(1.0, 0.85, 0.6), smoothstep(0.985, 1.0, r) * 0.6);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const halfDisc = new THREE.CircleGeometry(1, 128, -Math.PI / 2, Math.PI);
  const faceA = new THREE.Mesh(halfDisc, faceMat);   // 固定在 atan(z,x) = 0
  const faceB = new THREE.Mesh(halfDisc, faceMat);   // 随剖开角度转动
  faceA.visible = faceB.visible = false;
  cut.frame.add(faceA, faceB);

  // ============ 剖面上的小动画：辐射区光点绕弯、核心闪光 ============
  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, '#ffffff'); grd.addColorStop(.35, 'rgba(255,255,220,.9)'); grd.addColorStop(1, 'rgba(255,240,180,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const fx = new THREE.Group();
  fx.visible = false;   // 不在“钻进去”时，这些小光点都待在球心，要藏起来
  cut.frame.add(fx);
  const radLayer = interior.find(l => l.pattern === 2);
  const coreLayer = interior.find(l => l.pattern === 3);
  const photons = radLayer ? Array.from({ length: 5 }, () => {
    // sizeAttenuation: false —— 按屏幕大小画，镜头凑得再近也不会变成一大团
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xfff2c0, transparent: true, depthWrite: false, sizeAttenuation: false }));
    sprite.scale.setScalar(0.03);
    const line = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xfff6d8, transparent: true, opacity: 0.7 }));
    fx.add(sprite, line);
    return { sprite, line, pts: [], next: 0 };
  }) : [];
  const sparks = coreLayer ? Array.from({ length: 10 }, () => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, sizeAttenuation: false, opacity: 0 }));
    fx.add(s);
    return { s, t0: -10 };
  }) : [];
  // 在两块剖面的“楔形那一侧”上取一个点（稍微浮起来，避免和剖面打架）
  function facePoint(r, psi, onB) {
    const p = new THREE.Vector3(r * Math.cos(psi), r * Math.sin(psi), 0);
    const a = onB ? cut.uniforms.cutAngle.value : 0;
    const lift = onB ? -0.003 : 0.003;
    return p.set(p.x * Math.cos(a) - lift * Math.sin(a), p.y, p.x * Math.sin(a) + lift * Math.cos(a));
  }
  function randomRadial(layer) {
    return { r: layer.r0 + (layer.r1 - layer.r0) * (0.1 + 0.8 * Math.random()), psi: (Math.random() - 0.5) * Math.PI * 0.85, onB: Math.random() < 0.5 };
  }
  function updateFx(now) {
    photons.forEach((ph, i) => {
      if (!ph.pts.length) { const s = randomRadial(radLayer); ph.pos = s; ph.pts = [s]; }
      if (now > ph.next) {
        // 光点随机拐弯：每一步都换个方向，所以出不去
        const last = ph.pos;
        const ang = Math.random() * Math.PI * 2, step = 0.035;
        let x = last.r * Math.cos(last.psi) + Math.cos(ang) * step, y = last.r * Math.sin(last.psi) + Math.sin(ang) * step;
        let r = Math.hypot(x, y), psi = Math.atan2(y, x);
        if (r < radLayer.r0 + 0.02 || r > radLayer.r1 - 0.02 || Math.abs(psi) > Math.PI * 0.45) { r = last.r; psi = last.psi; }
        ph.pos = { r, psi, onB: last.onB };
        ph.pts.push(ph.pos);
        if (ph.pts.length > 26) ph.pts.shift();
        ph.next = now + 110 + i * 7;
      }
      const v = ph.pts.map(p => facePoint(p.r, p.psi, p.onB));
      ph.sprite.position.copy(v[v.length - 1]);
      ph.line.geometry.setFromPoints(v);
    });
    sparks.forEach(sp => {
      const age = (now - sp.t0) / 700;
      if (age > 1 + Math.random() * 2) {
        const s = randomRadial(coreLayer);
        sp.s.position.copy(facePoint(Math.random() * coreLayer.r1 * 0.9, s.psi, s.onB));
        sp.t0 = now;
      }
      const a = Math.max(0, 1 - Math.min(1, age));
      sp.s.material.opacity = a;
      sp.s.scale.setScalar(0.015 + 0.035 * Math.min(1, age * 3));
    });
  }

  // ============ 深度条：拖动、点站名、上下按钮 ============
  let s = 0, target = 0, dragging = false, saidIndex = -1, entering = null;
  const track = $('depth-track'), handle = $('depth-handle');
  function sFromPointer(e) {
    const rect = track.getBoundingClientRect();
    return THREE.MathUtils.clamp((e.clientY - rect.top) / rect.height, 0, 1);
  }
  track.addEventListener('pointerdown', e => {
    if (e.target.closest('.depth-stop')) return;
    dragging = true;
    track.setPointerCapture(e.pointerId);
    s = target = sFromPointer(e);
  });
  track.addEventListener('pointermove', e => { if (dragging) s = target = sFromPointer(e); });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    target = Math.round(s * (N - 1)) / (N - 1);   // 松手后吸到最近的一站
  };
  track.addEventListener('pointerup', release);
  track.addEventListener('pointercancel', release);
  ui.querySelectorAll('.depth-stop').forEach(b => b.addEventListener('click', () => { target = +b.dataset.i / (N - 1); }));
  const stepBy = k => { target = THREE.MathUtils.clamp(Math.round(target * (N - 1)) + k, 0, N - 1) / (N - 1); };
  $('dive-down').onclick = () => stepBy(1);
  $('dive-up').onclick = () => stepBy(-1);

  // ============ 文字格式 ============
  function fmtTemp(t) {
    if (t < 0) return `零下 ${-Math.round(t)}℃`;
    if (t >= 1e4) { const w = t / 1e4; return `${w >= 10 ? Math.round(w) : w.toFixed(1)} 万℃`; }
    if (t < 1000) return `${Math.round(t)}℃`;
    return `${Math.round(t / 100) * 100}℃`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function fmtKm(km) {
    if (km >= 1e4) return `${Math.round(km / 1e4)} 万公里`;
    if (km >= 100) return `${Math.round(km).toLocaleString('zh-CN')} 公里`;
    if (km >= 10) return `${Math.round(km)} 公里`;
    return `${km.toFixed(1)} 公里`;
  }
  // 温度计用对数刻度，兼容太空低温、行星表面与恒星核心的巨大温差
  function thermoFrac(t) {
    if (t <= 0) return 0.02;
    return THREE.MathUtils.clamp((Math.log10(t) - 3) / (7.25 - 3), 0.06, 1);
  }

  // ============ 镜头路径 ============
  function pathAt(v) {
    const x = v * (N - 1), i = Math.min(N - 2, Math.floor(x)), f = x - i;
    const r = stops[i].r + (stops[i + 1].r - stops[i].r) * f;
    // 正温度按对数插值；跨过零度时用连续线性插值，避免负温区间跳变
    const t0 = stops[i].t, t1 = stops[i + 1].t;
    const t = t0 <= 0 || t1 <= 0 ? t0 + (t1 - t0) * f : Math.pow(10, Math.log10(t0) + (Math.log10(t1) - Math.log10(t0)) * f);
    const open = openFrom < 0 ? 0 : THREE.MathUtils.smoothstep(x, openFrom, openFrom + 0.35);
    const lerp = (key, def) => (stops[i][key] ?? def) + ((stops[i + 1][key] ?? def) - (stops[i][key] ?? def)) * f;
    const at = lerp('at', 0);
    // “现在在哪儿”：剖开前看镜头离球心多远，剖开后看对准的那一层
    const where = (stops[i].at ?? stops[i].r) + ((stops[i + 1].at ?? stops[i + 1].r) - (stops[i].at ?? stops[i].r)) * f;
    return { r, t, open, aim: lerp('aim', 0), at, elev: lerp('elev', ELEV), yaw: lerp('yaw', 0), where, i: Math.round(x) };
  }
  const bisector = new THREE.Vector3();
  const UP = new THREE.Vector3(0, 1, 0);
  function camPos(r, elevDeg = ELEV, yawDeg = 0) {
    // 楔形中线方向（剖面框架里 45° 的方向），偏 yaw 度、抬高 elev 度
    const e = THREE.MathUtils.degToRad(elevDeg), a = Math.PI / 4 + THREE.MathUtils.degToRad(yawDeg);
    bisector.set(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e));
    return bisector.clone().applyQuaternion(cut.frame.quaternion).multiplyScalar(r);
  }

  // ============ 到站 ============
  function arrive(i) {
    const st = stops[i];
    $('layer-name').textContent = st.name;
    $('layer-temp').textContent = '🌡️ ' + st.temp;
    $('layer-fact').textContent = st.fact;
    ui.querySelectorAll('.depth-stop').forEach((b, k) => b.classList.toggle('here', k === i));
    if (st.look && ctx.hooks.setLook) ctx.hooks.setLook(st.look);
    if (i !== saidIndex) {
      saidIndex = i;
      if (i > 0) say('dive_' + st.id);
    }
  }

  return {
    panel: '#dive-panel',
    enter({ silent } = {}) {
      controls.enabled = false;
      // 让楔形的开口正对孩子现在看的方向
      const az = Math.atan2(camera.position.z, camera.position.x);
      cut.frame.rotation.y = Math.PI / 4 - az;
      cut.frame.updateMatrixWorld();
      s = target = 0;
      saidIndex = 0;
      entering = { from: camera.position.clone(), t0: performance.now() };
      faceA.visible = faceB.visible = true;
      arrive(0);
      ctx.setSubtitle('里面是什么 · 科学模型示意');
      if (!silent) say('dive_intro');
    },
    exit() {
      cut.uniforms.cutAngle.value = 0;
      faceA.visible = faceB.visible = false;
      fx.visible = false;
      camera.position.copy(camPos(stops[0].r));
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.enabled = true;
    },
    update(now, dt, rawDt) {
      if (!dragging) s += (target - s) * (1 - Math.exp(-rawDt * 2.2));   // 与帧率无关的平滑移动
      if (Math.abs(target - s) < 0.0015 && !dragging) s = target;
      const p = pathAt(s);

      // 进入时先从原来的位置平滑飞到路径起点
      let pos = camPos(p.r, p.elev, p.yaw);
      if (entering) {
        const k = Math.min(1, (now - entering.t0) / 1400);
        pos = entering.from.clone().lerp(pos, ctx.ease(k));
        if (k >= 1) entering = null;
      }
      camera.position.copy(pos);
      // 视线对准剖面上 at 处（剖开前 at = 0，就是球心）
      const aimPoint = camPos(p.at, 0);
      const look = aimPoint.sub(pos).normalize();
      // aim > 0 时，视线从球心往旁边转，正对星球边缘（切点方向与球心方向夹角 = asin(1/r)）
      const limbAngle = Math.asin(Math.min(1, 1 / Math.max(p.r, 1)));
      look.applyAxisAngle(UP, -p.aim * limbAngle);
      camera.lookAt(pos.clone().add(look));

      const angle = p.open * Math.PI / 2;
      cut.uniforms.cutAngle.value = angle;
      faceB.rotation.y = -angle;
      const showFaces = angle > 0.002;
      faceA.visible = faceB.visible = fx.visible = showFaces;
      faceUniforms.time.value = now / 1000;

      // 镜头在哪一层，就让那一层亮起来
      const hereStop = stops[p.i];
      faceUniforms.highlight.value = hereStop.layer ? layerIndex(hereStop.layer) : -1;
      if (showFaces) updateFx(now);

      // 温度计、位置
      $('thermo-fill').style.height = (thermoFrac(p.t) * 100) + '%';
      $('thermo-value').textContent = fmtTemp(p.t);
      $('layer-where').textContent = p.where >= 1
        ? `📍 离${body.name}表面 ${fmtKm((p.where - 1) * body.radiusKm)}`
        : `📍 离${body.name}中心 ${fmtKm(p.where * body.radiusKm)}`;
      handle.style.top = (s * 100) + '%';

      // 停稳在一站上才换介绍、说话
      if (!dragging && s === target) {
        const i = Math.round(s * (N - 1));
        if (Math.abs(s * (N - 1) - i) < 1e-6 && ui.dataset.at !== String(i)) { ui.dataset.at = i; arrive(i); }
      } else {
        ui.dataset.at = '';
      }
    },
  };
});
