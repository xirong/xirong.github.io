/* 真实的木星 · Cassini + Juno 全球贴图、扁球外观和“长什么样”模块。 */
window.JupiterLook = (() => {
  'use strict';

  const HOME_DIST = 4.5;
  const CLOSE_DIST = 1.18;
  const FLATTEN = 0.935;
  const TILT = THREE.MathUtils.degToRad(-3.13);
  const GRS = { lon: 125, lat: -22 };   // 主图中心约在东经 125°、南纬 22°；实际位置会随时间漂移

  function lonLat(lon, lat, r = 1) {
    const a = (lon + 180) / 360 * Math.PI * 2, b = lat * Math.PI / 180;
    return new THREE.Vector3(-Math.cos(a) * Math.cos(b) * r, Math.sin(b) * r, Math.sin(a) * Math.cos(b) * r);
  }

  function setup(ctx) {
    const { scene, camera, controls, bloom, loadTex, say } = ctx;
    camera.position.set(0.2, 0.35, HOME_DIST).setLength(HOME_DIST);
    const SUN_HOME = new THREE.Vector3(-0.55, 0.28, 0.79).normalize();
    const sunDir = SUN_HOME.clone();
    const jupiter = new THREE.Group();
    jupiter.rotation.z = TILT;
    scene.add(jupiter);

    const big = matchMedia('(pointer: fine)').matches && ctx.renderer.capabilities.maxTextureSize >= 8192;
    const TEX = { map: `assets/textures/jupiter-${big ? '8k' : '4k'}.jpg` };
    const uniforms = Object.assign({ map: { value: null }, sunDirection: { value: sunDir } }, ctx.cut.uniforms);
    const surfaceMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv; varying vec3 vN; varying vec3 vWorld;
        void main(){
          vUv = uv;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          vN = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: `
        uniform sampler2D map; uniform vec3 sunDirection;
        varying vec2 vUv; varying vec3 vN; varying vec3 vWorld;
        ${ctx.cut.glsl}
        void main(){
          cutDiscard(vWorld);
          vec3 n = normalize(vN);
          vec3 viewDir = normalize(cameraPosition - vWorld);
          float ndl = dot(n, sunDirection);
          float mu = clamp(dot(n, viewDir), 0.0, 1.0);
          vec3 albedo = texture2D(map, vUv).rgb;
          float light = 0.055 + 1.02 * max(ndl, 0.0);
          float limb = 0.72 + 0.28 * pow(mu, 0.45);
          vec3 color = albedo * light * limb;
          float haze = pow(1.0 - mu, 4.0) * max(ndl, 0.0) * 0.035;
          color += vec3(0.68, 0.61, 0.52) * haze;
          gl_FragColor = vec4(color, 1.0);
        }`,
    });
    const surface = new THREE.Mesh(new THREE.SphereGeometry(1, 192, 128), surfaceMat);
    surface.scale.y = FLATTEN;
    jupiter.add(surface);

    // 薄雾很弱，只保留云顶边缘的散射，不做地球式厚蓝大气。
    const hazeUniforms = Object.assign({ sunDirection: { value: sunDir } }, ctx.cut.uniforms);
    const hazeMat = new THREE.ShaderMaterial({
      uniforms: hazeUniforms, side: THREE.BackSide, transparent: true, depthWrite: false,
      vertexShader: `
        varying vec3 vN; varying vec3 vWorld;
        void main(){
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz; vN = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: `
        uniform vec3 sunDirection; varying vec3 vN; varying vec3 vWorld;
        ${ctx.cut.glsl}
        void main(){
          cutDiscard(vWorld);
          vec3 viewDir = normalize(cameraPosition - vWorld);
          float rim = pow(1.0 - abs(dot(normalize(vN), viewDir)), 4.0);
          float lit = max(dot(normalize(vN), sunDirection), 0.0);
          gl_FragColor = vec4(vec3(0.65, 0.57, 0.47), rim * lit * 0.10);
        }`,
    });
    const haze = new THREE.Mesh(new THREE.SphereGeometry(1.008, 128, 80), hazeMat);
    haze.scale.y = FLATTEN;
    jupiter.add(haze);

    // 风向箭头附在主球上；只表示相邻喷流方向相反，不改变真实照片。
    const winds = new THREE.Group();
    const LAT = [-42, -29, -17, -6, 7, 19, 31, 44];
    LAT.forEach((lat, i) => {
      const dirSign = lat === 7 ? 1 : (i % 2 ? 1 : -1);   // 赤道两侧喷流顺自转，其他相邻喷流交替
      const pts = [];
      for (let k = 0; k <= 28; k++) pts.push(lonLat(-28 + k * 2 * dirSign, lat, 1.008));
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: i % 2 ? 0x9ed5e8 : 0xf0cf8e, transparent: true, opacity: 0.72 }));
      winds.add(line);
      const endLon = -28 + 56 * dirSign;
      const tip = lonLat(endLon, lat, 1.008);
      const tangent = lonLat(endLon + dirSign, lat, 1.008).sub(tip).normalize();
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.065, 12),
        new THREE.MeshBasicMaterial({ color: i % 2 ? 0x9ed5e8 : 0xf0cf8e, transparent: true, opacity: 0.85 }));
      cone.position.copy(tip);
      cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
      winds.add(cone);
    });
    winds.visible = false;
    surface.add(winds);

    let mode = 'visible', fast = false, spin = true, closeTriggered = false;
    function setLook(next, { move = false } = {}) {
      mode = next;
      document.querySelectorAll('.lens').forEach(b => b.classList.toggle('active', b.dataset.mode === next));
      if (move && next === 'spot') {
        spin = false;
        surface.updateMatrixWorld(true);
        const current = surface.localToWorld(lonLat(GRS.lon, GRS.lat, 1));
        surface.rotation.y += Math.atan2(current.z, current.x) - Math.atan2(sunDir.z, sunDir.x);
        surface.updateMatrixWorld(true);   // 先让当前大红斑转到向阳面，再飞近，不固定在黑夜里
        const pos = surface.localToWorld(lonLat(GRS.lon, GRS.lat, 1.65));
        ctx.flyTo(pos, new THREE.Vector3(), 1600);
      } else if (move) {
        spin = true;
        ctx.flyDist(HOME_DIST, 1400);
      }
    }
    ctx.hooks.setLook = setLook;

    function toggleWinds(on) {
      winds.visible = on;
      document.getElementById('btn-winds').classList.toggle('on', on);
      say('winds');
    }
    function toggleRotate(on, silent = false) {
      fast = on;
      document.getElementById('btn-rotate').classList.toggle('on', on);
      if (on) spin = true;
      if (on && !silent) say('rotate');
    }
    ctx.hooks.sun = {
      surface,
      textures: TEX,
      setVisible(v) { jupiter.visible = v; },
      setRotateDemo(on) { toggleRotate(on, true); },
      setSpin(on) { spin = on; },
      getSpin: () => spin,
      setSunDir(v) { sunDir.copy(v).normalize(); },
      reset() {
        this.setVisible(true);
        spin = true;
        sunDir.copy(SUN_HOME);
        toggleRotate(false, true);
        winds.visible = false;
        document.getElementById('btn-winds').classList.remove('on');
        setLook('visible');
      },
    };

    document.querySelectorAll('.lens').forEach(btn => btn.addEventListener('click', () => {
      setLook(btn.dataset.mode, { move: true });
      say(btn.dataset.mode === 'spot' ? 'spot' : 'visible');
    }));
    document.getElementById('btn-winds').onclick = () => toggleWinds(!winds.visible);
    document.getElementById('btn-rotate').onclick = () => toggleRotate(!fast);
    document.getElementById('btn-zoom').onclick = () => ctx.flyDist(camera.position.length() < 1.65 ? HOME_DIST : CLOSE_DIST);
    document.getElementById('btn-flat').onclick = () => say('flat');
    const sceneCanvas = document.getElementById('scene');
    function welcomeOnPointer() {
      if (!ctx.spokenOnce && ctx.state.module === 'look') {
        say('welcome');
        sceneCanvas.removeEventListener('pointerdown', welcomeOnPointer);
      }
    }
    sceneCanvas.addEventListener('pointerdown', welcomeOnPointer);

    Explorer.registerModule('look', () => ({
      panel: '#look-panel',
      enter({ silent } = {}) {
        controls.enabled = true;
        controls.minDistance = 1.04;
        controls.maxDistance = 9;
        ctx.hooks.sun.setVisible(true);
        if (mode === 'visible') spin = true;
        ctx.setSubtitle('长什么样 · Cassini + Juno 真实观测拼合图');
        closeTriggered = camera.position.length() < 1.8;   // 从近景模块回来，不重复播“凑近看”
        const back = controls.target.lengthSq() > 1e-6 || camera.position.length() < 1.2 || camera.position.length() > 9;
        if (back) ctx.flyTo(camera.position.clone().sub(controls.target).setLength(HOME_DIST), new THREE.Vector3(), 1500);
        if (!silent) say(mode === 'spot' ? 'spot' : 'look');
      },
      exit() { toggleRotate(false, true); winds.visible = false; document.getElementById('btn-winds').classList.remove('on'); },
    }));

    ctx.onFrame((now, dt) => {
      if (spin) surface.rotation.y += dt * (fast ? 1.0 : 0.025);   // 从 +y 北极俯视：逆时针自转
      haze.rotation.y = surface.rotation.y;
      if (ctx.state.module === 'look') bloom.strength = 0.12;
      if (ctx.state.module === 'look') {
        const d = camera.position.length();
        controls.rotateSpeed = 0.18 + 0.45 * THREE.MathUtils.clamp((d - 1.05) / 2.5, 0, 1);
        if (d < 1.45 && !closeTriggered) { closeTriggered = true; say('closeup'); }
        if (d > 2.2) closeTriggered = false;
        document.getElementById('btn-zoom').classList.toggle('on', d < 1.65);
      }
    });

    return loadTex(TEX.map, THREE.RepeatWrapping).then(map => {
      uniforms.map.value = map;
      ctx.showCaption('拖一拖转转扁扁的木星；点“大红斑”飞到南半球。', 6500);
    });
  }

  return { setup };
})();
