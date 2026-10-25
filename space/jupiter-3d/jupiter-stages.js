/* 真实的木星 · 场景共享工具与注册入口。场景分组只负责各自的教学演示。 */
window.JupiterStages = (() => {
  'use strict';

  function setup(ctx) {
    const { loadTex } = ctx;
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const now = () => performance.now();
    const ease = ctx.ease;
    const clamp = THREE.MathUtils.clamp;
    const smooth = (a, b, x) => THREE.MathUtils.smoothstep(x, a, b);
    const hideSun = () => { if (ctx.hooks.sun) ctx.hooks.sun.setVisible(false); };
    const EARTH_D = 12756 / 142984;       // 地球赤道直径 / 木星赤道直径，全页唯一比例
    const FLATTEN = 0.935;

    function withTex(mat, src, key = 'map') {
      loadTex(src).then(t => { mat[key] = t; mat.needsUpdate = true; });
      return mat;
    }
    function ball(r, src, { lit = false, color = 0xffffff, flatten = 1 } = {}) {
      const mat = lit ? new THREE.MeshLambertMaterial({ color }) : new THREE.MeshBasicMaterial({ color });
      if (src) withTex(mat, src);
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 56, 36), mat);
      mesh.scale.y = flatten;
      return mesh;
    }
    function jupiterBall(r, { lit = true } = {}) {
      const mesh = ball(r, 'assets/textures/jupiter-4k.jpg', { lit, flatten: FLATTEN });
      if (lit) mesh.material.color.setScalar(0.55);   // 受光后的亮带仍低于辉光阈值，保留真实云带细节
      return mesh;
    }
    const glowTex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const g = c.getContext('2d'), grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grd.addColorStop(0, 'rgba(255,255,255,1)');
      grd.addColorStop(.25, 'rgba(255,255,255,.68)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    })();
    function glow(color, size, { strength = 1, depthTest = true } = {}) {
      const m = new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false, depthTest, blending: THREE.AdditiveBlending });
      m.color.multiplyScalar(Math.min(strength, 1.5));
      const s = new THREE.Sprite(m);
      s.scale.setScalar(size);
      return s;
    }
    function label(text, { color = '#eadbc7', h = 0.027, depth = false } = {}) {
      const c = document.createElement('canvas'), g = c.getContext('2d');
      const font = '700 44px "Noto Sans SC", sans-serif';
      g.font = font;
      const w = Math.ceil(g.measureText(text).width) + 36;
      c.width = w; c.height = 64;
      g.font = font;
      g.fillStyle = 'rgba(12,9,7,.68)';
      g.beginPath(); g.roundRect ? g.roundRect(0, 0, w, 64, 30) : g.rect(0, 0, w, 64); g.fill();
      g.fillStyle = color; g.textBaseline = 'middle'; g.fillText(text, 18, 34);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: depth, sizeAttenuation: false }));
      s.scale.set(h * w / 64, h, 1);
      s.renderOrder = 10;
      return s;
    }
    function ring(r, color = 0xffffff, opacity = 0.25, seg = 160) {
      const pts = [];
      for (let i = 0; i <= seg; i++) { const a = i / seg * Math.PI * 2; pts.push(V(Math.cos(a) * r, 0, Math.sin(a) * r)); }
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
    }
    function ellipse(a, e, color = 0xd9b98c, opacity = 0.3) {
      const pts = [];
      for (let i = 0; i <= 220; i++) { const t = i / 220 * Math.PI * 2; pts.push(V(a * (Math.cos(t) - e), 0, a * Math.sqrt(1 - e * e) * Math.sin(t))); }
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
    }
    function lights(root, dir = [-5, 3, 4], amb = 0.35) {
      root.add(new THREE.AmbientLight(0xffffff, amb));
      const d = new THREE.DirectionalLight(0xfff3df, 1.05);
      d.position.set(...dir);
      root.add(d);
      return d;
    }
    function sunBall(r) {
      const m = ball(r, '../textures/sun.jpg');
      m.material.color.setScalar(1.2);
      return m;
    }
    function spritePhoto(src, width, { opacity = 1 } = {}) {
      const mat = new THREE.SpriteMaterial({ transparent: true, opacity, depthWrite: false });
      const sprite = new THREE.Sprite(mat);
      loadTex(src).then(t => {
        mat.map = t; mat.needsUpdate = true;
        const im = t.image;
        sprite.scale.set(width, width * im.height / im.width, 1);
      });
      return sprite;
    }
    function lonLat(lon, lat, r = 1) {
      const a = (lon + 180) / 360 * Math.PI * 2, b = lat * Math.PI / 180;
      return V(-Math.cos(a) * Math.cos(b) * r, Math.sin(b) * r, Math.sin(a) * Math.cos(b) * r);
    }

    // 在真实的主木星上标地点：停自转、挂到主表面，退出时全部摘除并恢复。
    function mainJupiter(api) {
      const h = ctx.hooks.sun, surface = h.surface, attached = [];
      const wasSpin = h.getSpin ? h.getSpin() : true;
      h.setSpin(false);
      surface.updateMatrixWorld(true);
      return {
        surface,
        point(lon, lat) {
          surface.updateMatrixWorld(true);
          const p = lonLat(lon, lat, 1);
          const pos = surface.localToWorld(p.clone());
          const localNormal = V(p.x, p.y / (FLATTEN * FLATTEN), p.z).normalize();   // 椭球法线不是把径向量直接压扁
          const normal = localNormal.transformDirection(surface.matrixWorld).normalize();
          const east = lonLat(lon + 0.5, lat, 1).sub(lonLat(lon - 0.5, lat, 1)).transformDirection(surface.matrixWorld).normalize();
          const north = normal.clone().cross(east).normalize();
          const quaternion = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(east, north, normal));
          quaternion.premultiply(surface.getWorldQuaternion(new THREE.Quaternion()).invert());   // 世界朝向转成主球的局部朝向
          return { pos, normal, east, north, quaternion };
        },
        sun: v => h.setSunDir(v),
        face(lon, lat, dir) {
          const current = surface.localToWorld(lonLat(lon, lat, 1));
          surface.rotation.y += Math.atan2(current.z, current.x) - Math.atan2(dir.z, dir.x);
          surface.updateMatrixWorld(true);
        },
        attach(o) { surface.add(o); attached.push(o); },
        done() {
          attached.forEach(o => {
            surface.remove(o);
            o.traverse(c => {
              if (c.geometry) c.geometry.dispose();
              if (c.material) [].concat(c.material).forEach(m => m.dispose());
            });
          });
          h.setSpin(wasSpin);
        },
      };
    }

    const helpers = {
      ctx, loadTex, V, now, ease, clamp, smooth, hideSun, EARTH_D, FLATTEN,
      withTex, ball, jupiterBall, glow, label, ring, ellipse, lights, sunBall, spritePhoto, lonLat, mainJupiter,
    };
    const S = {};
    Object.assign(S, window.JupiterSizeMotion(helpers), window.JupiterExplore(helpers));
    ctx.hooks.stages = S;
  }

  return { setup };
})();
