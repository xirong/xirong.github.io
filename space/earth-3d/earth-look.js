/* 真实的地球 · 真实昼夜、云层与大气外观，以及“长什么样”模块。
   贴图来自 NASA（tools/build-textures.py 生成）；代码只负责光照、晨昏散射、云影和动画。 */
window.EarthLook = (() => {
  'use strict';

  const HOME_DIST = 4.6;
  const CLOSE_DIST = 1.22;

  function setup(ctx) {
    const { scene, camera, controls, bloom, loadTex, say } = ctx;
    camera.position.set(0.35, 0.5, HOME_DIST).setLength(HOME_DIST);
    const sunDir = new THREE.Vector3(-0.65, 0.35, 0.7).normalize();
    const earth = new THREE.Group();
    earth.rotation.z = THREE.MathUtils.degToRad(-23.5);
    scene.add(earth);

    // 电脑用 8K 地表和云，手机/平板用 4K（显存有限）
    const big = matchMedia('(pointer: fine)').matches && ctx.renderer.capabilities.maxTextureSize >= 8192;
    const TEX = {
      day: `assets/textures/day-${big ? '8k' : '4k'}.jpg`,
      clouds: `assets/textures/clouds-${big ? '8k' : '4k'}.jpg`,
      night: 'assets/textures/night-4k.jpg',
      normal: 'assets/textures/normal-4k.jpg',
      ocean: 'assets/textures/ocean-4k.png',
    };

    // 球面上的“东”和“北”方向（和 SphereGeometry 的 uv 一致），法线贴图要用
    const tangentGlsl = `
      varying vec3 vT; varying vec3 vB;
      void tangentFrame(vec3 n){
        vec3 t = vec3(n.z, 0.0, -n.x);
        t = length(t) < 1e-4 ? vec3(1.0, 0.0, 0.0) : normalize(t);
        vT = normalize(mat3(modelMatrix) * t);
        vB = normalize(mat3(modelMatrix) * cross(n, t));
      }`;

    // ============ 真实地表：NASA Blue Marble + 地形起伏 + 夜灯 + 海面反光 + 云影 + 晨昏线 ============
    const uniforms = Object.assign({
      dayMap: { value: null }, nightMap: { value: null }, normalMap: { value: null }, oceanMap: { value: null }, cloudMap: { value: null },
      sunDirection: { value: sunDir }, nightGain: { value: 1.6 }, cloudShift: { value: 0 }, cloudShadow: { value: 1 },
    }, ctx.cut.uniforms);
    const surfaceMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv; varying vec3 vN; varying vec3 vWorld;
        ${tangentGlsl}
        void main(){
          vUv = uv;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          vN = normalize(mat3(modelMatrix) * normal);
          tangentFrame(normalize(normal));
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: `
        uniform sampler2D dayMap, nightMap, normalMap, oceanMap, cloudMap;
        uniform vec3 sunDirection; uniform float nightGain, cloudShift, cloudShadow;
        varying vec2 vUv; varying vec3 vN; varying vec3 vWorld; varying vec3 vT; varying vec3 vB;
        ${ctx.cut.glsl}
        void main(){
          cutDiscard(vWorld);
          vec3 n0 = normalize(vN);
          vec3 m = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
          vec3 n = normalize(normalize(vT) * m.x + normalize(vB) * m.y + n0 * m.z);   // 山脉的起伏
          vec3 viewDir = normalize(cameraPosition - vWorld);
          float ndl0 = dot(n0, sunDirection);                  // 昼夜分界用光滑球面
          float ndl = dot(n, sunDirection);                    // 明暗细节用带起伏的法线
          float daylight = smoothstep(-0.10, 0.18, ndl0);
          vec3 day = texture2D(dayMap, vUv).rgb;
          float ocean = texture2D(oceanMap, vUv).r;
          // 云的影子：云层自己在转，所以按云层的经度去取
          float cloud = texture2D(cloudMap, vUv + vec2(cloudShift, 0.0)).r;
          float shadow = 1.0 - cloudShadow * 0.45 * smoothstep(0.15, 0.8, cloud);
          vec3 lit = day * (0.04 + 1.25 * max(ndl, 0.0)) * shadow;
          // 晨昏线附近，阳光穿过很厚的大气，变成橙红色
          float dusk = smoothstep(0.35, 0.0, ndl0) * smoothstep(-0.12, 0.05, ndl0);
          lit *= mix(vec3(1.0), vec3(1.25, 0.62, 0.38), dusk * 0.85);
          // 夜灯：Black Marble 底色是淡蓝的陆地，只取亮的城市灯光
          vec3 night = texture2D(nightMap, vUv).rgb;
          float lum = dot(night, vec3(0.3, 0.59, 0.11));
          vec3 lights = night * smoothstep(0.16, 0.5, lum) * vec3(1.15, 0.95, 0.7) * nightGain;
          vec3 color = mix(lights + day * 0.012, lit, daylight);
          // 海面反光
          vec3 h = normalize(sunDirection + viewDir);
          float glint = pow(max(dot(n0, h), 0.0), 600.0) * 0.55 + pow(max(dot(n0, h), 0.0), 60.0) * 0.07;
          color += vec3(1.0, 0.93, 0.8) * ocean * glint * daylight * shadow * (1.0 - smoothstep(0.2, 0.7, cloud));
          color += ocean * vec3(0.0, 0.025, 0.07) * daylight * shadow;   // 深海的一点蓝
          // 越靠边看到的大气越厚，蒙上一层蓝
          float fres = pow(1.0 - max(dot(n0, viewDir), 0.0), 2.5);
          color = mix(color, vec3(0.32, 0.55, 1.0) * max(ndl0 + 0.15, 0.0), fres * 0.55 * smoothstep(-0.2, 0.2, ndl0));
          gl_FragColor = vec4(color, 1.0);
        }`,
    });
    const surface = new THREE.Mesh(new THREE.SphereGeometry(1, 192, 128), surfaceMat);
    earth.add(surface);

    // ============ 云层：真实云图，离地约 25 公里（真实的云在 12 公里以下，这里略加高才看得出层次） ============
    const cloudUniforms = Object.assign({
      cloudMap: { value: null }, sunDirection: { value: sunDir }, opacity: { value: 0.9 },
    }, ctx.cut.uniforms);
    const cloudMat = new THREE.ShaderMaterial({
      uniforms: cloudUniforms, transparent: true, depthWrite: false,
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
        uniform sampler2D cloudMap; uniform vec3 sunDirection; uniform float opacity;
        varying vec2 vUv; varying vec3 vN; varying vec3 vWorld;
        ${ctx.cut.glsl}
        void main(){
          cutDiscard(vWorld);
          float cloud = texture2D(cloudMap, vUv).r;
          float alpha = smoothstep(0.12, 0.85, cloud) * opacity;
          if (alpha < 0.01) discard;
          float ndl = dot(normalize(vN), sunDirection);
          float light = smoothstep(-0.12, 0.25, ndl);
          float dusk = smoothstep(0.3, 0.0, ndl) * smoothstep(-0.12, 0.04, ndl);
          vec3 color = mix(vec3(0.02, 0.03, 0.05), vec3(1.0), light) * mix(vec3(1.0), vec3(1.2, 0.6, 0.38), dusk);
          gl_FragColor = vec4(color, alpha * (0.35 + 0.65 * light));
        }`,
    });
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.004, 160, 100), cloudMat);
    clouds.renderOrder = 1;
    earth.add(clouds);

    // ============ 大气层：白天一侧蓝色，晨昏线一侧橙红，背光一侧没有 ============
    const atmosphereUniforms = Object.assign({ sunDirection: { value: sunDir } }, ctx.cut.uniforms);
    const atmosphereMat = new THREE.ShaderMaterial({
      uniforms: atmosphereUniforms, side: THREE.BackSide, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `
        varying vec3 vN; varying vec3 vWorld;
        void main(){
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          vN = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: `
        uniform vec3 sunDirection; varying vec3 vN; varying vec3 vWorld;
        ${ctx.cut.glsl}
        void main(){
          cutDiscard(vWorld);
          vec3 viewDir = normalize(cameraPosition - vWorld);
          vec3 n = normalize(vN);
          float limb = pow(clamp(1.0 - abs(dot(n, viewDir)), 0.0, 1.0), 3.0);
          float ndl = dot(n, sunDirection);            // 边缘处这一圈大气被太阳照到多少
          float day = smoothstep(-0.25, 0.35, ndl);
          float dusk = smoothstep(0.3, 0.0, ndl) * smoothstep(-0.3, -0.02, ndl);
          vec3 color = vec3(0.25, 0.52, 1.0) * day + vec3(1.0, 0.45, 0.2) * dusk * 0.3;   // 背光一侧只剩很淡的一圈红边
          gl_FragColor = vec4(color * limb * 1.6, 1.0);
        }`,
    });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.03, 128, 80), atmosphereMat);
    scene.add(atmosphere);

    // ============ 模块与观察按钮 ============
    let mode = 'day', fast = false, cloudsOn = true, hidden = false, closeTriggered = false;
    function switchMode(next, { move = false } = {}) {
      mode = next;
      document.querySelectorAll('.lens').forEach(b => b.classList.toggle('active', b.dataset.mode === next));
      uniforms.nightGain.value = next === 'night' ? 2.2 : 1.6;
      if (move) {
        const dir = sunDir.clone().multiplyScalar(next === 'night' ? -HOME_DIST : HOME_DIST);
        dir.y += 0.35;
        ctx.flyTo(dir, new THREE.Vector3(), 1500);
      }
    }
    ctx.hooks.setLook = switchMode;

    function toggleClouds(on) {
      cloudsOn = on;
      clouds.visible = on && !hidden;
      uniforms.cloudShadow.value = on ? 1 : 0;
      const btn = document.getElementById('btn-clouds');
      btn.classList.toggle('on', !on);
      btn.querySelector('span').textContent = on ? '去掉云层' : '放回云层';
      say(on ? 'clouds_on' : 'clouds_off');
    }
    function toggleRotate(on, silent = false) {
      fast = on;
      document.getElementById('btn-rotate').classList.toggle('on', on);
      if (on && !silent) say('rotate');
    }
    ctx.hooks.sun = {
      setVisible(v) {
        hidden = !v;
        earth.visible = v;
        atmosphere.visible = v;
        if (v) clouds.visible = cloudsOn;
      },
      textures: TEX,
      setRotateDemo(on) { toggleRotate(on, true); },
      reset() {
        this.setVisible(true);
        toggleRotate(false, true);
        switchMode('day');
        cloudsOn = true;
        clouds.visible = true;
        uniforms.cloudShadow.value = 1;
        const btn = document.getElementById('btn-clouds');
        btn.classList.remove('on');
        btn.querySelector('span').textContent = '去掉云层';
      },
    };

    document.querySelectorAll('.lens').forEach(btn => btn.addEventListener('click', () => {
      switchMode(btn.dataset.mode, { move: true });
      say(btn.dataset.mode);
    }));
    document.getElementById('btn-clouds').onclick = () => toggleClouds(!cloudsOn);
    document.getElementById('btn-rotate').onclick = () => toggleRotate(!fast);
    document.getElementById('btn-zoom').onclick = () => ctx.flyDist(camera.position.length() < 1.65 ? HOME_DIST : CLOSE_DIST);
    document.getElementById('btn-blue').onclick = () => say('blue');
    document.getElementById('scene').addEventListener('pointerdown', () => {
      if (!ctx.spokenOnce && ctx.state.module === 'look') say('welcome');
    }, { once: true });

    Explorer.registerModule('look', () => ({
      panel: '#look-panel',
      enter({ silent } = {}) {
        controls.enabled = true;
        controls.minDistance = 1.06;
        controls.maxDistance = 9;
        ctx.hooks.sun.setVisible(true);
        ctx.setSubtitle('长什么样 · 真实地表、夜景和云图');
        const back = controls.target.lengthSq() > 1e-6 || camera.position.length() < 1.2 || camera.position.length() > 9;
        if (back) ctx.flyTo(camera.position.clone().sub(controls.target).setLength(HOME_DIST), new THREE.Vector3(), 1500);
        if (!silent) say(mode === 'day' ? 'look' : mode);
      },
      exit() { toggleRotate(false, true); },
    }));

    ctx.onFrame((now, dt) => {
      surface.rotation.y += dt * (fast ? 1.25 : 0.035);
      clouds.rotation.y = surface.rotation.y + now / 1000 * 0.004;   // 云跟着地球转，自己再慢慢往东飘
      uniforms.cloudShift.value = (surface.rotation.y - clouds.rotation.y) / (Math.PI * 2);
      bloom.strength = 0.24;
      if (ctx.state.module === 'look') {
        const d = camera.position.length();
        controls.rotateSpeed = 0.18 + 0.45 * THREE.MathUtils.clamp((d - 1.08) / 2.5, 0, 1);
        if (d < 1.5 && !closeTriggered) { closeTriggered = true; say('closeup'); }
        if (d > 2.2) closeTriggered = false;
        document.getElementById('btn-zoom').classList.toggle('on', d < 1.65);
      }
    });

    return Promise.all([
      loadTex(TEX.day, THREE.RepeatWrapping),
      loadTex(TEX.night, THREE.RepeatWrapping),
      loadTex(TEX.normal, THREE.RepeatWrapping),
      loadTex(TEX.ocean, THREE.RepeatWrapping),
      loadTex(TEX.clouds, THREE.RepeatWrapping),
    ]).then(([day, night, normal, ocean, cloud]) => {
      uniforms.dayMap.value = day;
      uniforms.nightMap.value = night;
      uniforms.normalMap.value = normal;
      uniforms.oceanMap.value = ocean;
      uniforms.cloudMap.value = cloud;
      cloudUniforms.cloudMap.value = cloud;
      ctx.showCaption('拖一拖转转地球；点“夜晚灯光”，飞到背对太阳的一面。', 6500);
    });
  }

  return { setup };
})();
