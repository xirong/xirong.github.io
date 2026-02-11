/* global THREE */

(() => {
  'use strict';

  // ==================== 基本工具 ====================
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (current, target, lambda, dt) => lerp(current, target, 1 - Math.exp(-lambda * dt));

  // 小而稳定的伪随机（用于“无限循环”场景重排，不会闪烁到不可控）
  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ==================== 配置 ====================
  const CONFIG = {
    segLen: 170,
    numSegs: 9,
    worldWidth: 70,
    treeMax: 10,
    houseMax: 5,
    poleEvery: 22,
    speedDefault: 55, // 单位/秒（不是 km/h，仅用于视觉效果）
    speedMin: 0,
    speedMax: 95,
    accel: 3.6,
    decel: 5.0,
  };

  const PRESETS = {
    1: { name: '夏日侧视', camera: 'side' },
    2: { name: '夏日俯视', camera: 'top' },
  };

  // ==================== DOM ====================
  const appEl = document.getElementById('app');
  const speedBarEl = document.getElementById('speedBar');
  const readoutEl = document.getElementById('readout');
  const mapOverlayEl = document.getElementById('mapOverlay');
  const chinaMapEl = document.getElementById('chinaMap');
  const tripBannerEl = document.getElementById('tripBanner');
  const mapTitleSubEl = document.getElementById('mapTitleSub');
  const toastEl = document.getElementById('toast');

  let toastTimer = null;
  function showToast(text, ms = 2200) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add('show');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.classList.remove('show');
    }, ms);
  }

  // ==================== Three.js 初始化 ====================
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  } catch (e) {
    appEl.textContent = '你的浏览器不支持 WebGL，无法运行这个 3D 动画。';
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  appEl.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 1200);

  // 雾让画面更接近截图那种“柔和、低多边形”的感觉
  const fog = new THREE.Fog(0x92b7dd, 120, 420);
  scene.fog = fog;

  // 灯光：半球光 + 方向光（不追求真实，只追求“清爽”）
  const hemi = new THREE.HemisphereLight(0xbfdcff, 0x343434, 0.85);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(90, 140, 80);
  scene.add(sun);

  // ==================== 材质（只保留夏日） ====================
  const mats = {
    trainBody: new THREE.MeshStandardMaterial({ color: 0xf4f6f8, roughness: 0.92, metalness: 0.03, flatShading: true }),
    trainStripe: new THREE.MeshStandardMaterial({ color: 0x1f5fb2, roughness: 0.75, metalness: 0.02, flatShading: true }),
    trainWindow: new THREE.MeshStandardMaterial({ color: 0xb8d7f2, roughness: 0.45, metalness: 0.08, flatShading: true }),
    trainBase: new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.98, metalness: 0.02, flatShading: true }),
    trackBallast: new THREE.MeshStandardMaterial({ color: 0x6b6f76, roughness: 1.0, metalness: 0.0, flatShading: true }),
    rail: new THREE.MeshStandardMaterial({ color: 0x9aa1a8, roughness: 0.7, metalness: 0.15, flatShading: true }),
    sleeper: new THREE.MeshStandardMaterial({ color: 0x7a6b58, roughness: 1.0, metalness: 0.0, flatShading: true }),
    ground: new THREE.MeshStandardMaterial({ color: 0x1d8f2e, roughness: 1.0, metalness: 0.0, flatShading: true }),
    pole: new THREE.MeshStandardMaterial({ color: 0x666a70, roughness: 0.9, metalness: 0.05, flatShading: true }),
    wire: new THREE.LineBasicMaterial({ color: 0x5d5f63 }),
    treeTrunk: new THREE.MeshStandardMaterial({ color: 0x4b2f1a, roughness: 1.0, metalness: 0.0, flatShading: true }),
    treeLeaf: new THREE.MeshStandardMaterial({ color: 0x2fa241, roughness: 1.0, metalness: 0.0, flatShading: true }),
    houseWall: new THREE.MeshStandardMaterial({ color: 0xd9d0c3, roughness: 1.0, metalness: 0.0, flatShading: true }),
    houseRoof: new THREE.MeshStandardMaterial({ color: 0x8d1c1c, roughness: 1.0, metalness: 0.0, flatShading: true }),
    mountain: new THREE.MeshStandardMaterial({ color: 0x2d3b4b, roughness: 1.0, metalness: 0.0, flatShading: true }),
    hill: new THREE.MeshStandardMaterial({ color: 0xbad7b0, roughness: 1.0, metalness: 0.0, flatShading: true }),
    cloud: new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 1.0, metalness: 0.0, flatShading: true }),
    road: new THREE.MeshStandardMaterial({ color: 0x2e3136, roughness: 1.0, metalness: 0.0, flatShading: true }),
    roadLine: new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 1.0, metalness: 0.0, flatShading: true }),
  };

  function applySummer() {
    scene.background = new THREE.Color(0x4ea5ff);
    fog.color.setHex(0x92b7dd);
    hemi.intensity = 0.88;
    hemi.color.setHex(0xbfdcff);
    hemi.groundColor.setHex(0x343434);
    sun.intensity = 0.92;
    sun.color.setHex(0xffffff);

    mats.ground.color.setHex(0x1d8f2e);
    mats.treeLeaf.color.setHex(0x2fa241);
    mats.hill.color.setHex(0xbad7b0);
    mats.mountain.color.setHex(0x2d3b4b);
    mats.cloud.color.setHex(0xf2f2f2);
  }

  // 初始化为夏日场景
  applySummer();

  // ==================== 几何：列车 ====================
  function makeTrain() {
    const group = new THREE.Group();

    const carLen = 18;
    const carW = 4.2;
    const carH = 3.1;
    const baseH = 0.8;
    const gap = 0.45;

    const carCount = 9;
    const totalLen = carCount * carLen + (carCount - 1) * gap;

    const bodyGeo = new THREE.BoxGeometry(carLen, carH, carW);
    const baseGeo = new THREE.BoxGeometry(carLen, baseH, carW * 0.92);
    const stripeGeo = new THREE.BoxGeometry(carLen, 0.28, 0.08);
    const windowGeo = new THREE.BoxGeometry(1.15, 0.8, 0.06);
    const bogieGeo = new THREE.BoxGeometry(1.7, 0.35, 1.2);

    // “复兴号高铁”侧面文字贴图（用 canvas 生成，避免引入额外资源）
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sctx = signCanvas.getContext('2d');
    sctx.clearRect(0, 0, signCanvas.width, signCanvas.height);
    sctx.font = '800 64px "Noto Sans SC", system-ui, -apple-system, Segoe UI, sans-serif';
    sctx.textAlign = 'center';
    sctx.textBaseline = 'middle';
    sctx.lineJoin = 'round';
    sctx.lineWidth = 10;
    sctx.strokeStyle = 'rgba(255,255,255,0.75)';
    sctx.strokeText('复兴号高铁', signCanvas.width / 2, signCanvas.height / 2 + 2);
    sctx.fillStyle = '#c61a1a';
    sctx.fillText('复兴号高铁', signCanvas.width / 2, signCanvas.height / 2 + 2);

    const signTex = new THREE.CanvasTexture(signCanvas);
    signTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    signTex.needsUpdate = true;
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, transparent: true, depthWrite: false });
    const signGeo = new THREE.PlaneGeometry(7.2, 1.35);

    for (let i = 0; i < carCount; i++) {
      const car = new THREE.Group();

      const body = new THREE.Mesh(bodyGeo, mats.trainBody);
      body.position.set(0, baseH + carH * 0.5, 0);
      car.add(body);

      const base = new THREE.Mesh(baseGeo, mats.trainBase);
      base.position.set(0, baseH * 0.5, 0);
      car.add(base);

      // 蓝色腰线（两侧）
      const stripeL = new THREE.Mesh(stripeGeo, mats.trainStripe);
      stripeL.position.set(0, baseH + 1.25, carW * 0.5 + 0.04);
      car.add(stripeL);
      const stripeR = stripeL.clone();
      stripeR.position.z *= -1;
      car.add(stripeR);

      // 车窗（两侧）
      const windowCount = 9;
      for (let w = 0; w < windowCount; w++) {
        const wx = (-carLen * 0.5) + 2.2 + w * 1.65;
        const win = new THREE.Mesh(windowGeo, mats.trainWindow);
        win.position.set(wx, baseH + 1.85, carW * 0.5 + 0.05);
        car.add(win);
        const win2 = win.clone();
        win2.position.z *= -1;
        car.add(win2);
      }

      // 简化的转向架
      const b1 = new THREE.Mesh(bogieGeo, mats.trainBase);
      b1.position.set(-carLen * 0.35, 0.23, 0);
      car.add(b1);
      const b2 = b1.clone();
      b2.position.x = carLen * 0.35;
      car.add(b2);

      // 前车头（用圆柱/锥体做一个简单“流线”）
      if (i === 0) {
        const noseLen = 6.2;
        const noseGeo = new THREE.CylinderGeometry(carW * 0.58, carW * 0.18, noseLen, 10, 1, false);
        const nose = new THREE.Mesh(noseGeo, mats.trainBody);
        nose.rotation.z = Math.PI / 2;
        nose.position.set(-carLen * 0.5 - noseLen * 0.48, baseH + 1.55, 0);
        car.add(nose);

        const tipGeo = new THREE.ConeGeometry(carW * 0.22, 2.3, 10, 1, false);
        const tip = new THREE.Mesh(tipGeo, mats.trainBody);
        tip.rotation.z = Math.PI / 2;
        tip.position.set(-carLen * 0.5 - noseLen * 0.98 - 1.0, baseH + 1.55, 0);
        car.add(tip);
      }

      // 车厢连接处（视觉分割）
      if (i !== carCount - 1) {
        const jointGeo = new THREE.BoxGeometry(gap, carH * 0.9, carW * 0.92);
        const joint = new THREE.Mesh(jointGeo, mats.trainBase);
        joint.position.set(carLen * 0.5 + gap * 0.5, baseH + carH * 0.5, 0);
        car.add(joint);
      }

      // 车身文字（放在中间几节，更容易被看到）
      if (i === 3 || i === 4) {
        const signL = new THREE.Mesh(signGeo, signMat);
        signL.position.set(0.2, baseH + 1.35, carW * 0.5 + 0.095);
        car.add(signL);

        const signR = new THREE.Mesh(signGeo, signMat);
        signR.position.set(0.2, baseH + 1.35, -carW * 0.5 - 0.095);
        signR.rotation.y = Math.PI;
        car.add(signR);
      }

      const x = -totalLen * 0.5 + i * (carLen + gap) + carLen * 0.5;
      car.position.x = x;
      group.add(car);
    }

    // 放到轨道上
    group.position.set(0, 0.1, 0);
    return group;
  }

  // ==================== 几何：树 / 房子 / 电线杆 ====================
  const SHARED = {
    treeLeafGeo: new THREE.IcosahedronGeometry(1.35, 0),
    treeTrunkGeo: new THREE.CylinderGeometry(0.22, 0.28, 2.0, 6),
    houseBodyGeo: new THREE.BoxGeometry(2.2, 1.25, 2.2),
    houseRoofGeo: new THREE.ConeGeometry(1.75, 1.6, 4),
    poleGeo: new THREE.CylinderGeometry(0.12, 0.14, 8.3, 7),
    poleArmGeo: new THREE.BoxGeometry(3.1, 0.12, 0.12),
  };

  function makeTree() {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(SHARED.treeTrunkGeo, mats.treeTrunk);
    trunk.position.y = 1.0;
    g.add(trunk);
    const leaf = new THREE.Mesh(SHARED.treeLeafGeo, mats.treeLeaf);
    leaf.position.y = 2.25;
    g.add(leaf);
    g.userData.leaf = leaf;
    return g;
  }

  function makeHouse() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(SHARED.houseBodyGeo, mats.houseWall);
    body.position.y = 0.62;
    g.add(body);
    const roof = new THREE.Mesh(SHARED.houseRoofGeo, mats.houseRoof);
    roof.position.y = 1.85;
    roof.rotation.y = Math.PI / 4;
    g.add(roof);
    return g;
  }

  function makePole() {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(SHARED.poleGeo, mats.pole);
    pole.position.y = 4.15;
    g.add(pole);
    const arm = new THREE.Mesh(SHARED.poleArmGeo, mats.pole);
    arm.position.set(1.1, 8.0, 0);
    g.add(arm);
    return g;
  }

  // ==================== 轨道/地面分段（无限循环） ====================
  const nearWorld = new THREE.Group();
  scene.add(nearWorld);

  // 列车放在近景里，但本体不移动；通过移动地面/电线杆来制造“前进”感觉
  const train = makeTrain();
  train.position.set(12, 0.46, 0);
  train.rotation.y = Math.PI; // 让车头朝向前进方向（+X）
  nearWorld.add(train);

  function makeNearSegment(segLen) {
    const seg = new THREE.Group();

    // 地面
    const groundGeo = new THREE.PlaneGeometry(segLen, CONFIG.worldWidth);
    const ground = new THREE.Mesh(groundGeo, mats.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    seg.add(ground);

    // 轨枕道床
    const ballastGeo = new THREE.BoxGeometry(segLen, 0.28, 7.6);
    const ballast = new THREE.Mesh(ballastGeo, mats.trackBallast);
    ballast.position.set(0, 0.14, 0);
    seg.add(ballast);

    // 钢轨（两条）
    const railGeo = new THREE.BoxGeometry(segLen, 0.18, 0.22);
    const railL = new THREE.Mesh(railGeo, mats.rail);
    railL.position.set(0, 0.46, 0.95);
    seg.add(railL);
    const railR = railL.clone();
    railR.position.z = -0.95;
    seg.add(railR);

    // 轨枕（Instanced，省性能）
    const sleeperGeo = new THREE.BoxGeometry(1.9, 0.22, 0.6);
    const sleeperCount = Math.floor(segLen / 2.7);
    const sleepers = new THREE.InstancedMesh(sleeperGeo, mats.sleeper, sleeperCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < sleeperCount; i++) {
      dummy.position.set(-segLen * 0.5 + i * (segLen / sleeperCount), 0.33, 0);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      sleepers.setMatrixAt(i, dummy.matrix);
    }
    sleepers.instanceMatrix.needsUpdate = true;
    seg.add(sleepers);

    // 公路（用于俯视图更像截图 3）
    const roadGeo = new THREE.PlaneGeometry(segLen, 10);
    const road = new THREE.Mesh(roadGeo, mats.road);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, -14);
    seg.add(road);

    const lineGeo = new THREE.BoxGeometry(2.2, 0.03, 0.25);
    const lineCount = Math.floor(segLen / 7.5);
    const lines = new THREE.InstancedMesh(lineGeo, mats.roadLine, lineCount);
    for (let i = 0; i < lineCount; i++) {
      dummy.position.set(-segLen * 0.5 + 3 + i * (segLen / lineCount), 0.03, -14);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      lines.setMatrixAt(i, dummy.matrix);
    }
    lines.instanceMatrix.needsUpdate = true;
    seg.add(lines);

    // 电线杆 + 导线
    const poleCount = Math.max(2, Math.floor(segLen / CONFIG.poleEvery));
    for (let i = 0; i < poleCount; i++) {
      const pole = makePole();
      const px = -segLen * 0.5 + 10 + i * (segLen / poleCount);
      pole.position.set(px, 0, 3.6);
      seg.add(pole);
    }

    const wirePts1 = [
      new THREE.Vector3(-segLen * 0.5, 8.15, 2.95),
      new THREE.Vector3(segLen * 0.5, 8.15, 2.95),
    ];
    const wireGeo1 = new THREE.BufferGeometry().setFromPoints(wirePts1);
    const wire1 = new THREE.Line(wireGeo1, mats.wire);
    seg.add(wire1);

    const wirePts2 = [
      new THREE.Vector3(-segLen * 0.5, 7.65, 3.18),
      new THREE.Vector3(segLen * 0.5, 7.65, 3.18),
    ];
    const wireGeo2 = new THREE.BufferGeometry().setFromPoints(wirePts2);
    const wire2 = new THREE.Line(wireGeo2, mats.wire);
    seg.add(wire2);

    // 装饰池：固定数量的树/房子，循环重排（避免每次 wrap 都 new 一堆对象）
    const decor = new THREE.Group();
    seg.add(decor);
    seg.userData.decor = decor;
    seg.userData.trees = [];
    seg.userData.houses = [];

    for (let i = 0; i < CONFIG.treeMax; i++) {
      const t = makeTree();
      decor.add(t);
      seg.userData.trees.push(t);
    }
    for (let i = 0; i < CONFIG.houseMax; i++) {
      const h = makeHouse();
      decor.add(h);
      seg.userData.houses.push(h);
    }

    seg.userData.seed = ((Math.random() * 1e9) | 0) >>> 0;
    fillNearSegment(seg);
    return seg;
  }

  function fillNearSegment(seg) {
    const rng = mulberry32(seg.userData.seed);

    // 树
    const treeN = 4 + Math.floor(rng() * 6); // 4~9
    for (let i = 0; i < seg.userData.trees.length; i++) {
      const t = seg.userData.trees[i];
      if (i >= treeN) {
        t.visible = false;
        continue;
      }
      t.visible = true;
      const x = (rng() - 0.5) * CONFIG.segLen;
      const side = rng() < 0.68 ? 1 : -1;
      const zBase = side > 0 ? 7.5 : 10.5;
      const z = side * (zBase + rng() * 15.5);
      const s = 0.85 + rng() * 1.35;
      t.position.set(x, 0, z);
      t.scale.setScalar(s);
      t.rotation.y = rng() * Math.PI * 2;
      // 让树冠稍微“偏一偏”，更像低多边形玩具风
      if (t.userData.leaf) {
        t.userData.leaf.position.x = (rng() - 0.5) * 0.35;
        t.userData.leaf.position.z = (rng() - 0.5) * 0.35;
      }
    }

    // 小房子
    const houseN = rng() < 0.55 ? 1 + Math.floor(rng() * 4) : 0;
    for (let i = 0; i < seg.userData.houses.length; i++) {
      const h = seg.userData.houses[i];
      if (i >= houseN) {
        h.visible = false;
        continue;
      }
      h.visible = true;
      const x = (rng() - 0.5) * CONFIG.segLen;
      const side = rng() < 0.5 ? 1 : -1;
      const z = side * (22 + rng() * 14);
      const s = 0.85 + rng() * 1.15;
      h.position.set(x, 0, z);
      h.scale.setScalar(s);
      h.rotation.y = rng() * Math.PI * 2;
    }

    // 每次 wrap 稍微变一点，让路上有“变化感”
    seg.userData.seed = (seg.userData.seed + 0x9E3779B9) >>> 0;
  }

  const nearSegs = [];
  const totalLen = CONFIG.segLen * CONFIG.numSegs;
  for (let i = 0; i < CONFIG.numSegs; i++) {
    const seg = makeNearSegment(CONFIG.segLen);
    seg.position.x = (i * CONFIG.segLen) - totalLen * 0.5 + CONFIG.segLen * 0.5;
    nearWorld.add(seg);
    nearSegs.push(seg);
  }

  // ==================== 远景：山 + 云（不需要循环，足够大即可） ====================
  const farWorld = new THREE.Group();
  scene.add(farWorld);

  function makeMountain(radius, height, x, z, rotY) {
    // 4 面锥体更像截图里的“巨大棱锥山”
    const geo = new THREE.ConeGeometry(radius, height, 4, 1, false);
    const m = new THREE.Mesh(geo, mats.mountain);
    m.position.set(x, height * 0.5 - 2, z);
    m.rotation.y = rotY;
    farWorld.add(m);
  }

  function makeHill(radius, height, x, z, rotY) {
    const geo = new THREE.ConeGeometry(radius, height, 4, 1, false);
    const m = new THREE.Mesh(geo, mats.hill);
    m.position.set(x, height * 0.5 - 2, z);
    m.rotation.y = rotY;
    farWorld.add(m);
  }

  // 把山放到相机“前方”，更接近你截图里那种远景构图
  makeMountain(95, 160, 210, -165, Math.PI * 0.15);
  makeHill(42, 72, 110, -120, Math.PI * 0.25);
  makeHill(55, 88, 330, -220, Math.PI * 0.5);
  makeHill(32, 55, 70, -250, Math.PI * 0.1);

  // 云：几个球团
  const skyWorld = new THREE.Group();
  scene.add(skyWorld);

  function makeCloud(x, y, z, s) {
    const g = new THREE.Group();
    const geo = new THREE.IcosahedronGeometry(3.2, 0);
    for (let i = 0; i < 5; i++) {
      const p = new THREE.Mesh(geo, mats.cloud);
      p.position.set((i - 2) * 2.6, (i % 2) * 1.3, (i - 2) * 0.9);
      p.scale.setScalar(0.8 + i * 0.07);
      g.add(p);
    }
    g.position.set(x, y, z);
    g.scale.setScalar(s);
    skyWorld.add(g);
    return g;
  }

  const clouds = [
    makeCloud(-140, 70, -60, 1.3),
    makeCloud(50, 85, -120, 1.0),
    makeCloud(220, 78, -40, 0.9),
  ];

  // ==================== 相机预设 ====================
  const camTargets = {
    side: {
      pos: new THREE.Vector3(-52, 12.5, 30),
      look: new THREE.Vector3(24, 6.2, 0),
      fov: 46,
    },
    top: {
      pos: new THREE.Vector3(-20, 96, 18),
      look: new THREE.Vector3(18, 0.8, -6),
      fov: 52,
    },
  };

  // ==================== 中国地图（开场 + 右上角小地图） ====================
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const mapUI = {
    ok: false,
    svgRoot: null,
    fullViewBox: { x: 0, y: 0, w: 595.28, h: 504 },
    currentViewBox: { x: 0, y: 0, w: 595.28, h: 504 },
    zoomViewBox: null,
    anim: null,

    stateEls: { beijing: null, tianjin: null },
    routeBg: null,
    routeFg: null,
    routeLen: 0,
    dot: null,
    startMarker: null,
    endMarker: null,

    startPt: null,
    endPt: null,

    bannerLeftEl: null,
    bannerRightEl: null,
  };

  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function svgCreate(tag, attrs = null) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    }
    return el;
  }

  function setMapViewBox(vb) {
    if (!mapUI.svgRoot) return;
    mapUI.currentViewBox = { x: vb.x, y: vb.y, w: vb.w, h: vb.h };
    mapUI.svgRoot.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  }

  function animateMapViewBox(to, durationMs, onDone = null) {
    mapUI.anim = {
      from: { ...mapUI.currentViewBox },
      to: { ...to },
      durationMs,
      elapsedMs: 0,
      onDone,
    };
  }

  function calcZoomViewBox(pad = 90) {
    const a = mapUI.startPt;
    const b = mapUI.endPt;
    if (!a || !b) return { ...mapUI.fullViewBox };
    const minX = Math.min(a.x, b.x) - pad;
    const minY = Math.min(a.y, b.y) - pad;
    const maxX = Math.max(a.x, b.x) + pad;
    const maxY = Math.max(a.y, b.y) + pad;
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }

  function parseViewBox(vbStr) {
    const parts = String(vbStr || '').trim().split(/[\s,]+/).map(Number).filter((n) => Number.isFinite(n));
    if (parts.length === 4) return { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
    return { x: 0, y: 0, w: 595.28, h: 504 };
  }

  async function initMapUI(route) {
    if (!mapOverlayEl || !chinaMapEl || !tripBannerEl) return;
    if (mapUI.ok) return;

    if (mapTitleSubEl) mapTitleSubEl.textContent = '加载中国地图中...';

    try {
      const resp = await fetch('../puzzle/china-map.svg', { cache: 'force-cache' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const svgText = await resp.text();
      chinaMapEl.innerHTML = svgText;

      const svgRoot = chinaMapEl.querySelector('svg');
      if (!svgRoot) throw new Error('SVG 根节点不存在');
      mapUI.svgRoot = svgRoot;

      // 用容器尺寸控制显示，避免 SVG 自己的 width/height 影响布局
      svgRoot.removeAttribute('width');
      svgRoot.removeAttribute('height');

      mapUI.fullViewBox = parseViewBox(svgRoot.getAttribute('viewBox'));
      setMapViewBox(mapUI.fullViewBox);

      // 轻微“拼图风”轮廓：真实形状 + 半透明填充
      const stateNodes = svgRoot.querySelectorAll('.state');
      stateNodes.forEach((el) => {
        el.style.fill = 'rgba(255,255,255,0.08)';
        el.style.stroke = 'rgba(255,255,255,0.26)';
        el.style.strokeWidth = '0.7';
        el.style.strokeLinejoin = 'round';
        el.style.strokeLinecap = 'round';
      });

      // Banner DOM（只创建一次，后续只更新文本）
      tripBannerEl.textContent = '';
      mapUI.bannerLeftEl = document.createElement('div');
      mapUI.bannerRightEl = document.createElement('div');
      mapUI.bannerRightEl.className = 'pill';
      tripBannerEl.appendChild(mapUI.bannerLeftEl);
      tripBannerEl.appendChild(mapUI.bannerRightEl);

      // 等待一帧，确保 getBBox 稳定
      await new Promise((r) => requestAnimationFrame(r));

      const bjEl = svgRoot.querySelector('.state.beijing');
      const tjEl = svgRoot.querySelector('.state.tianjin');
      if (!bjEl || !tjEl) throw new Error('未找到北京/天津省份元素');
      mapUI.stateEls.beijing = bjEl;
      mapUI.stateEls.tianjin = tjEl;

      // 站点位置：用省份轮廓中心点稍向南偏移，近似“北京南/天津南”
      const bbBj = bjEl.getBBox();
      const bbTj = tjEl.getBBox();
      const bjCenter = { x: bbBj.x + bbBj.width * 0.5, y: bbBj.y + bbBj.height * 0.5 };
      const tjCenter = { x: bbTj.x + bbTj.width * 0.5, y: bbTj.y + bbTj.height * 0.5 };
      mapUI.startPt = { x: bjCenter.x, y: bjCenter.y + Math.max(3.5, bbBj.height * 0.45) };
      mapUI.endPt = { x: tjCenter.x, y: tjCenter.y + Math.max(3.5, bbTj.height * 0.45) };
      mapUI.zoomViewBox = calcZoomViewBox(90);

      // 让北京/天津更显眼
      bjEl.style.fill = 'rgba(255,217,61,0.26)';
      bjEl.style.stroke = 'rgba(255,217,61,0.72)';
      bjEl.style.strokeWidth = '1.4';
      tjEl.style.fill = 'rgba(255,107,107,0.22)';
      tjEl.style.stroke = 'rgba(255,107,107,0.72)';
      tjEl.style.strokeWidth = '1.2';

      // 叠加路线与站点（在 SVG 顶层，确保可见）
      const gOverlay = svgCreate('g', { id: 'routeOverlay' });
      svgRoot.appendChild(gOverlay);

      const d = `M ${mapUI.startPt.x} ${mapUI.startPt.y} L ${mapUI.endPt.x} ${mapUI.endPt.y}`;
      mapUI.routeBg = svgCreate('path', {
        d,
        fill: 'none',
        stroke: 'rgba(255,255,255,0.26)',
        'stroke-width': 6.5,
        'stroke-linecap': 'round',
        'vector-effect': 'non-scaling-stroke',
      });
      gOverlay.appendChild(mapUI.routeBg);

      mapUI.routeFg = svgCreate('path', {
        d,
        fill: 'none',
        stroke: '#00d9ff',
        'stroke-width': 4.8,
        'stroke-linecap': 'round',
        'vector-effect': 'non-scaling-stroke',
      });
      gOverlay.appendChild(mapUI.routeFg);

      mapUI.routeLen = mapUI.routeFg.getTotalLength();
      mapUI.routeFg.setAttribute('stroke-dasharray', String(mapUI.routeLen));
      mapUI.routeFg.setAttribute('stroke-dashoffset', String(mapUI.routeLen));

      mapUI.startMarker = svgCreate('circle', {
        cx: mapUI.startPt.x,
        cy: mapUI.startPt.y,
        r: 6.5,
        fill: '#ffd93d',
        stroke: 'rgba(0,0,0,0.35)',
        'stroke-width': 2.2,
        'vector-effect': 'non-scaling-stroke',
      });
      gOverlay.appendChild(mapUI.startMarker);

      mapUI.endMarker = svgCreate('circle', {
        cx: mapUI.endPt.x,
        cy: mapUI.endPt.y,
        r: 6.5,
        fill: '#ff6b6b',
        stroke: 'rgba(0,0,0,0.35)',
        'stroke-width': 2.2,
        'vector-effect': 'non-scaling-stroke',
      });
      gOverlay.appendChild(mapUI.endMarker);

      const labelCommon = {
        fill: 'rgba(255,255,255,0.92)',
        'font-size': 16,
        'font-weight': 800,
        'paint-order': 'stroke',
        stroke: 'rgba(0,0,0,0.35)',
        'stroke-width': 4,
      };

      const t1 = svgCreate('text', { x: mapUI.startPt.x + 10, y: mapUI.startPt.y - 10, ...labelCommon });
      t1.textContent = route.from;
      gOverlay.appendChild(t1);

      const t2 = svgCreate('text', { x: mapUI.endPt.x + 10, y: mapUI.endPt.y - 10, ...labelCommon });
      t2.textContent = route.to;
      gOverlay.appendChild(t2);

      mapUI.dot = svgCreate('circle', {
        cx: mapUI.startPt.x,
        cy: mapUI.startPt.y,
        r: 4.2,
        fill: '#ffffff',
        stroke: '#ff3d3d',
        'stroke-width': 2.6,
        'vector-effect': 'non-scaling-stroke',
      });
      gOverlay.appendChild(mapUI.dot);

      mapUI.ok = true;
      if (mapTitleSubEl) mapTitleSubEl.textContent = '按 Space 出发';
      updateMapProgress(0, 'ready');
    } catch (err) {
      console.warn('地图加载失败:', err);
      if (mapTitleSubEl) mapTitleSubEl.textContent = '地图加载失败（请刷新重试）';
    }
  }

  function updateMapProgress(t, phase) {
    if (!mapUI.ok) return;
    const tt = clamp(t, 0, 1);

    // 进度线
    const off = (1 - tt) * mapUI.routeLen;
    mapUI.routeFg.setAttribute('stroke-dashoffset', String(off));

    // 小火车点
    const x = lerp(mapUI.startPt.x, mapUI.endPt.x, tt);
    const y = lerp(mapUI.startPt.y, mapUI.endPt.y, tt);
    mapUI.dot.setAttribute('cx', String(x));
    mapUI.dot.setAttribute('cy', String(y));

    // 到站高亮天津
    const tj = mapUI.stateEls.tianjin;
    if (phase === 'arrived') {
      if (tj) {
        tj.style.fill = 'rgba(38, 222, 129, 0.34)';
        tj.style.stroke = 'rgba(38, 222, 129, 0.90)';
        tj.style.strokeWidth = '1.8';
      }
      mapUI.endMarker.setAttribute('fill', '#26de81');
      mapUI.endMarker.setAttribute('r', '7.5');
    } else {
      if (tj) {
        tj.style.fill = 'rgba(255,107,107,0.22)';
        tj.style.stroke = 'rgba(255,107,107,0.72)';
        tj.style.strokeWidth = '1.2';
      }
      mapUI.endMarker.setAttribute('fill', '#ff6b6b');
      mapUI.endMarker.setAttribute('r', '6.5');
    }
  }

  const state = {
    running: false,
    speed: 0,
    targetSpeed: CONFIG.speedDefault,
    preset: 1,
    cameraMode: 'side',

    tripPhase: 'ready', // ready | running | arrived
    kmTravelled: 0,
    route: { from: '北京南', to: '天津南', distanceKm: 120, timeScale: 28 },
  };

  function applyPreset(id) {
    const preset = PRESETS[id] || PRESETS[1];
    state.preset = id;
    state.cameraMode = preset.camera;
  }

  applyPreset(1);

  // 初始化地图 UI（开场全屏）
  initMapUI(state.route);

  function resetTrip() {
    state.tripPhase = 'ready';
    state.kmTravelled = 0;
    state.running = false;
    state.speed = 0;

    if (mapTitleSubEl) mapTitleSubEl.textContent = '按 Space 出发';
    if (mapOverlayEl) mapOverlayEl.classList.remove('mini');

    if (mapUI.ok) {
      mapUI.anim = null;
      setMapViewBox(mapUI.fullViewBox);
      updateMapProgress(0, 'ready');
    }
  }

  function startTrip() {
    if (state.tripPhase !== 'ready') return;

    state.tripPhase = 'running';
    state.running = true;
    showToast('从北京南出发！');

    if (mapTitleSubEl) mapTitleSubEl.textContent = '正在出发...';
    if (mapUI.ok) {
      animateMapViewBox(mapUI.zoomViewBox, 1200, () => {
        if (mapOverlayEl) mapOverlayEl.classList.add('mini');
      });
    } else if (mapOverlayEl) {
      mapOverlayEl.classList.add('mini');
    }
  }

  // 初始相机位置
  camera.position.copy(camTargets.side.pos);
  camera.lookAt(camTargets.side.look);

  // ==================== 输入 ====================
  window.addEventListener('keydown', (e) => {
    const key = e.key;

    if (key === ' ' || key === 'Spacebar') {
      e.preventDefault();
      if (state.tripPhase === 'ready') {
        startTrip();
      } else if (state.tripPhase === 'running') {
        state.running = !state.running;
      } else if (state.tripPhase === 'arrived') {
        resetTrip();
      }
      return;
    }

    if (key === '1' || key === '2') {
      applyPreset(Number(key));
      return;
    }

    if (key === 'ArrowUp') {
      state.targetSpeed = clamp(state.targetSpeed + 7, CONFIG.speedMin, CONFIG.speedMax);
      return;
    }
    if (key === 'ArrowDown') {
      state.targetSpeed = clamp(state.targetSpeed - 7, CONFIG.speedMin, CONFIG.speedMax);
      return;
    }
  });

  // ==================== Resize ====================
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  // ==================== 主循环 ====================
  let last = performance.now();
  let tAccum = 0;

  function update(dt) {
    tAccum += dt;

    // 地图 viewBox 动画（全中国 -> 京津段放大）
    if (mapUI.ok && mapUI.anim) {
      mapUI.anim.elapsedMs += dt * 1000;
      const p = clamp(mapUI.anim.elapsedMs / mapUI.anim.durationMs, 0, 1);
      const e = easeInOutCubic(p);
      const from = mapUI.anim.from;
      const to = mapUI.anim.to;
      setMapViewBox({
        x: lerp(from.x, to.x, e),
        y: lerp(from.y, to.y, e),
        w: lerp(from.w, to.w, e),
        h: lerp(from.h, to.h, e),
      });
      if (p >= 1) {
        const cb = mapUI.anim.onDone;
        mapUI.anim = null;
        if (cb) cb();
      }
    }

    const desired = state.running ? state.targetSpeed : 0;
    const lambda = state.running ? CONFIG.accel : CONFIG.decel;
    state.speed = damp(state.speed, desired, lambda, dt);
    state.speed = clamp(state.speed, 0, CONFIG.speedMax);

    // 用一个直观的映射值给孩子看（不追求真实换算，只追求“有感觉”）
    const speedKmh = (state.speed / CONFIG.speedMax) * 350;

    // 行程推进（北京南 -> 天津南）
    if (state.tripPhase === 'running') {
      state.kmTravelled += speedKmh * (dt / 3600) * state.route.timeScale;
      if (state.kmTravelled >= state.route.distanceKm) {
        state.kmTravelled = state.route.distanceKm;
        state.tripPhase = 'arrived';
        state.running = false;
        showToast('到达天津南站！');
        if (mapTitleSubEl) mapTitleSubEl.textContent = '到达天津南站！按 Space 重新开始';
      }
    }

    const tRoute = state.route.distanceKm > 0 ? (state.kmTravelled / state.route.distanceKm) : 0;
    updateMapProgress(tRoute, state.tripPhase);

    // 近景循环移动
    for (let i = 0; i < nearSegs.length; i++) {
      const seg = nearSegs[i];
      seg.position.x -= state.speed * dt;
      if (seg.position.x < -totalLen * 0.5 - CONFIG.segLen * 0.5) {
        seg.position.x += totalLen;
        fillNearSegment(seg);
      }
    }

    // 云慢慢漂
    for (let i = 0; i < clouds.length; i++) {
      const c = clouds[i];
      c.position.x += dt * (0.9 + i * 0.25);
      if (c.position.x > 360) c.position.x = -360;
    }

    // 轻微“镜头呼吸”，模拟行驶的动感（不晕）
    const target = camTargets[state.cameraMode];
    const shake = clamp(state.speed / CONFIG.speedDefault, 0, 1);
    const bob = Math.sin(tAccum * 2.2) * 0.25 * shake;
    const sway = Math.sin(tAccum * 1.4) * 0.18 * shake;

    camera.fov = damp(camera.fov, target.fov, 4.0, dt);
    camera.updateProjectionMatrix();

    const desiredPos = target.pos.clone();
    desiredPos.y += bob;
    desiredPos.z += sway;
    camera.position.x = damp(camera.position.x, desiredPos.x, 3.2, dt);
    camera.position.y = damp(camera.position.y, desiredPos.y, 3.2, dt);
    camera.position.z = damp(camera.position.z, desiredPos.z, 3.2, dt);

    const desiredLook = target.look.clone();
    desiredLook.y += Math.sin(tAccum * 1.8) * 0.12 * shake;
    camera.lookAt(desiredLook);

    // HUD
    const pct = clamp(state.speed / CONFIG.speedMax, 0, 1);
    speedBarEl.style.width = `${Math.round(pct * 100)}%`;
    const presetName = (PRESETS[state.preset] && PRESETS[state.preset].name) ? PRESETS[state.preset].name : '';

    let phaseTxt = '准备出发';
    if (state.tripPhase === 'running') phaseTxt = state.running ? '行驶中' : '已暂停';
    if (state.tripPhase === 'arrived') phaseTxt = '已到站';

    // 顶部地图提示文字（只在非到站时刷新，避免覆盖到站提示）
    if (mapTitleSubEl && state.tripPhase !== 'arrived') {
      if (state.tripPhase === 'ready') {
        mapTitleSubEl.textContent = '按 Space 出发';
      } else {
        mapTitleSubEl.textContent = state.running ? '行驶中（↑↓ 调速，Space 暂停）' : '已暂停（按 Space 继续）';
      }
    }

    // 左上角 HUD 文本
    readoutEl.textContent = [
      `行程：${state.route.from} → ${state.route.to}`,
      `视角：${presetName}`,
      `状态：${phaseTxt}`,
      `时速：${Math.round(speedKmh)} km/h`,
      `里程：${state.kmTravelled.toFixed(1)} / ${state.route.distanceKm} km`,
    ].join(' / ');

    // 地图底部 Banner（开场全屏 & 右上角小地图都显示）
    if (mapUI.bannerLeftEl && mapUI.bannerRightEl) {
      mapUI.bannerLeftEl.textContent = `行程：${state.route.from} → ${state.route.to}｜${phaseTxt}`;
      mapUI.bannerRightEl.textContent = `里程 ${state.kmTravelled.toFixed(1)}/${state.route.distanceKm} km｜${Math.round(speedKmh)} km/h`;
    }
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
