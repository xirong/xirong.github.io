/* 真实的地球 · 真实昼夜、云层与大气外观，以及“长什么样”模块。 */
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

    // ============ 真实昼夜地表 ============
    const uniforms = Object.assign({
      dayMap: { value: null }, nightMap: { value: null }, specularMap: { value: null },
      sunDirection: { value: sunDir }, nightGain: { value: 1.7 },
    }, ctx.cut.uniforms);
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
        uniform sampler2D dayMap, nightMap, specularMap;
        uniform vec3 sunDirection; uniform float nightGain;
        varying vec2 vUv; varying vec3 vN; varying vec3 vWorld;
        ${ctx.cut.glsl}
        void main(){
          cutDiscard(vWorld);
          vec3 n = normalize(vN);
          vec3 viewDir = normalize(cameraPosition - vWorld);
          float ndl = dot(n, sunDirection);
          float daylight = smoothstep(-0.12, 0.24, ndl);
          vec3 day = texture2D(dayMap, vUv).rgb;
          vec3 lights = texture2D(nightMap, vUv).rgb;
          vec3 dark = day * 0.018 + lights * nightGain;
          vec3 lit = day * (0.16 + 1.08 * max(ndl, 0.0));
          vec3 color = mix(dark, lit, daylight);
          float ocean = texture2D(specularMap, vUv).r;
          vec3 reflected = reflect(-sunDirection, n);
          float sparkle = pow(max(dot(reflected, viewDir), 0.0), 52.0);
          color += vec3(0.72, 0.86, 1.0) * ocean * sparkle * daylight * 0.75;
          float rim = pow(1.0 - max(dot(n, viewDir), 0.0), 3.0);
          color += vec3(0.08, 0.25, 0.62) * rim * (0.18 + daylight * 0.32);
          gl_FragColor = vec4(color, 1.0);
        }`,
    });
    const surface = new THREE.Mesh(new THREE.SphereGeometry(1, 160, 112), surfaceMat);
    earth.add(surface);

    // ============ 独立云球：云图黑白值就是透明度 ============
    const cloudUniforms = Object.assign({
      cloudMap: { value: null }, sunDirection: { value: sunDir }, opacity: { value: 0.72 },
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
          float alpha = smoothstep(0.035, 0.82, cloud) * opacity;
          if (alpha < 0.008) discard;
          float ndl = dot(normalize(vN), sunDirection);
          float light = 0.10 + 0.94 * smoothstep(-0.16, 0.28, ndl);
          vec3 color = mix(vec3(0.12, 0.17, 0.25), vec3(1.0), light);
          gl_FragColor = vec4(color, alpha);
        }`,
    });
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.014, 128, 80), cloudMat);
    clouds.renderOrder = 1;
    earth.add(clouds);

    // ============ 大气边缘：薄薄的蓝光，不替代真实地表达面 ============
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
          float rim = pow(1.0 - abs(dot(normalize(vN), viewDir)), 2.2);
          float lit = 0.2 + 0.8 * smoothstep(-0.35, 0.3, dot(normalize(vN), sunDirection));
          gl_FragColor = vec4(vec3(0.16, 0.48, 1.0) * rim * lit, rim * 0.58);
        }`,
    });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.055, 96, 64), atmosphereMat);
    scene.add(atmosphere);

    // ============ 模块与观察按钮 ============
    let mode = 'day', fast = false, cloudsOn = true, hidden = false, closeTriggered = false;
    function switchMode(next, { move = false } = {}) {
      mode = next;
      document.querySelectorAll('.lens').forEach(b => b.classList.toggle('active', b.dataset.mode === next));
      uniforms.nightGain.value = next === 'night' ? 2.35 : 1.7;
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
      setRotateDemo(on) { toggleRotate(on, true); },
      reset() {
        this.setVisible(true);
        toggleRotate(false, true);
        switchMode('day');
        cloudsOn = true;
        clouds.visible = true;
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
      clouds.rotation.y += dt * (fast ? 1.258 : 0.043);
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
      loadTex('../textures/earth_daymap.jpg'),
      loadTex('../textures/earth_nightmap.jpg'),
      loadTex('../textures/earth_specular.jpg'),
      loadTex('../textures/earth_clouds.jpg'),
    ]).then(([day, night, specular, cloud]) => {
      uniforms.dayMap.value = day;
      uniforms.nightMap.value = night;
      uniforms.specularMap.value = specular;
      cloudUniforms.cloudMap.value = cloud;
      ctx.showCaption('拖一拖转转地球；点“夜晚灯光”，飞到背对太阳的一面。', 6500);
    });
  }

  return { setup };
})();
