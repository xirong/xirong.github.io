/* 场景模块：知识地图上“有多大多重”“怎么动”这些格子共用（太阳、行星共用）
   每个知识点 = 一个 3D 场景 + 小晓讲解 + 动手按钮 + 一个小问题。
   数据：BODY.stages[格子 id] = [ { id, icon, title, sub, photo, actions, slider, quiz } ]
     讲解文字   —— 旁白表 NARRATION[场景 id]（卡片上显示的也是它，只写一处）
     动手按钮   —— actions: [{ id, label }]，按下时说 NARRATION[场景 id_按钮 id]（有就说）
     滑块       —— slider: { min, max, value, step, label, unit }
     小问题     —— quiz: { options: [...], answer: 下标 }，题目是 NARRATION['q_' + 场景 id]
     真实照片   —— photo: { src, credit }
   3D 场景由星球脚本提供：ctx.hooks.stages[场景 id] = api => ({ update, action, slider, exit })
   api：root（场景自己的 Group，退出时自动清掉）、fly、say、live（卡片上的实时读数）、extra（卡片上的附加内容） */
Explorer.registerModule('stage', (ctx, item) => {
  'use strict';
  const { scene, camera, controls, say, body } = ctx;
  const scenes = body.stages[item.id];
  const N = scenes.length;
  const NARR = window.NARRATION || {};
  const text = key => (NARR[key] && NARR[key].text) || '';

  // ============ 星星：答对的题记在本机 ============
  const starKey = `explorer-${body.id}-stars`;
  let stars = new Set();
  try { stars = new Set(JSON.parse(localStorage.getItem(starKey) || '[]')); } catch (e) { /* 隐私模式下读不到也没关系 */ }
  function addStar(id) {
    stars.add(id);
    try { localStorage.setItem(starKey, JSON.stringify([...stars])); } catch (e) { /* 存不了就只在这次有效 */ }
  }

  // ============ 界面 ============
  const panel = document.createElement('div');
  panel.id = `stage-${item.id}`;
  panel.className = 'stage-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <div class="stage-card">
      <div class="stage-steps">${scenes.map((s, i) => `<button class="stage-step" data-i="${i}" aria-label="${s.title}">${s.icon}</button>`).join('')}</div>
      <p class="stage-sub"></p>
      <h2 class="stage-title"></h2>
      <p class="stage-text"></p>
      <figure class="stage-photo" hidden><img alt=""><figcaption></figcaption></figure>
      <div class="stage-extra"></div>
      <p class="stage-live"></p>
      <div class="stage-slider" hidden><label><span></span><input type="range"></label><b></b></div>
      <div class="stage-actions"></div>
      <div class="stage-nav">
        <button class="stage-prev">◀ 上一个</button>
        <button class="stage-quiz">🤔 考考我</button>
        <button class="stage-next">下一个 ▶</button>
      </div>
    </div>
    <dialog class="quiz">
      <p class="quiz-q"></p>
      <div class="quiz-options"></div>
      <p class="quiz-result"></p>
      <form method="dialog"><button class="quiz-close">关上</button></form>
    </dialog>
    <dialog class="photo-big"><img alt=""><form method="dialog"><button class="quiz-close">关上</button></form></dialog>`;
  document.body.append(panel);
  const $ = sel => panel.querySelector(sel);

  // ============ 让 3D 画面给卡片让位 ============
  // 宽屏卡片在左边：画面中心往右挪；手机卡片在下面：画面中心往上挪
  function applyOffset(on) {
    const w = innerWidth, h = innerHeight, card = $('.stage-card');
    if (!on) { camera.clearViewOffset(); return; }
    if (w > 640) camera.setViewOffset(w, h, -(card.offsetWidth + 16) / 2, 0, w, h);
    else camera.setViewOffset(w, h, 0, card.offsetHeight * 0.45, w, h);
  }
  addEventListener('resize', () => { if (!panel.hidden) applyOffset(true); });

  // ============ 进入 / 离开一个场景 ============
  let index = 0, live = null, root = null;
  const api = {
    THREE, ctx,
    get root() { return root; },
    say: key => NARR[key] && say(key),
    fly: (pos, target, dur) => ctx.flyTo(new THREE.Vector3(...pos), new THREE.Vector3(...(target || [0, 0, 0])), dur),
    live: html => { $('.stage-live').innerHTML = html || ''; },
    extra: html => { $('.stage-extra').innerHTML = html || ''; },
  };

  function clearScene() {
    if (live && live.exit) live.exit();
    live = null;
    if (root) {
      scene.remove(root);
      root.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) [].concat(o.material).forEach(m => m.dispose());
      });
    }
    root = null;
  }

  function show(i, { silent } = {}) {
    clearScene();
    index = (i + N) % N;
    const sc = scenes[index];
    root = new THREE.Group();
    scene.add(root);

    // 每个场景从同一个起点开始：真实星球在原位、默认外观、镜头可以自由转
    if (ctx.hooks.sun) ctx.hooks.sun.reset();
    controls.enabled = true;
    controls.minDistance = 0.3;
    controls.maxDistance = 80;
    api.live('');
    api.extra('');

    $('.stage-sub').textContent = sc.sub || '';
    $('.stage-title').textContent = sc.title;
    $('.stage-text').textContent = text(sc.id);
    panel.querySelectorAll('.stage-step').forEach((b, k) => {
      b.classList.toggle('here', k === index);
      b.classList.toggle('star', stars.has(scenes[k].id));
    });
    const photo = $('.stage-photo');
    photo.hidden = !sc.photo;
    if (sc.photo) {
      photo.querySelector('img').src = sc.photo.src;
      photo.querySelector('figcaption').textContent = sc.photo.credit;
    }
    $('.stage-actions').innerHTML = (sc.actions || []).map(a => `<button class="stage-action" data-id="${a.id}">${a.label}</button>`).join('');
    const sl = $('.stage-slider');
    sl.hidden = !sc.slider;
    if (sc.slider) {
      const input = sl.querySelector('input');
      Object.assign(input, { min: sc.slider.min, max: sc.slider.max, step: sc.slider.step || 1, value: sc.slider.value });
      sl.querySelector('span').textContent = sc.slider.label;
      sl.querySelector('b').textContent = sc.slider.value + (sc.slider.unit || '');
    }
    $('.stage-quiz').hidden = !sc.quiz;
    ctx.setSubtitle(`${item.name} · ${index + 1}/${N}`);

    const build = ctx.hooks.stages && ctx.hooks.stages[sc.id];
    live = build ? build(api) || {} : {};
    if (sc.slider && live.slider) live.slider(+sc.slider.value);
    if (!silent) say(sc.id);
    requestAnimationFrame(() => applyOffset(true));   // 卡片排好版后再量高度
  }

  // ============ 按钮 ============
  panel.querySelectorAll('.stage-step').forEach(b => b.addEventListener('click', () => show(+b.dataset.i)));
  $('.stage-prev').onclick = () => show(index - 1);
  $('.stage-next').onclick = () => show(index + 1);
  $('.stage-actions').addEventListener('click', e => {
    const b = e.target.closest('.stage-action');
    if (!b) return;
    const sc = scenes[index];
    if (live && live.action) live.action(b.dataset.id, b);
    api.say(`${sc.id}_${b.dataset.id}`);
  });
  $('.stage-slider input').addEventListener('input', e => {
    const sc = scenes[index];
    $('.stage-slider b').textContent = e.target.value + (sc.slider.unit || '');
    if (live && live.slider) live.slider(+e.target.value);
  });
  $('.stage-photo').addEventListener('click', () => {
    const big = $('.photo-big');
    big.querySelector('img').src = scenes[index].photo.src;
    big.showModal();
  });
  panel.querySelectorAll('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));

  // ============ 小问题 ============
  const quiz = $('.quiz');
  $('.stage-quiz').onclick = () => {
    const sc = scenes[index];
    quiz.querySelector('.quiz-q').textContent = text('q_' + sc.id);
    quiz.querySelector('.quiz-result').textContent = '';
    quiz.querySelector('.quiz-options').innerHTML = sc.quiz.options.map((o, k) => `<button class="quiz-option" data-k="${k}">${o}</button>`).join('');
    quiz.showModal();
    say('q_' + sc.id);
  };
  quiz.querySelector('.quiz-options').addEventListener('click', e => {
    const b = e.target.closest('.quiz-option');
    if (!b) return;
    const sc = scenes[index];
    if (+b.dataset.k === sc.quiz.answer) {
      b.classList.add('right');
      quiz.querySelector('.quiz-result').textContent = '⭐ 答对啦！';
      addStar(sc.id);
      panel.querySelector(`.stage-step[data-i="${index}"]`).classList.add('star');
      say('quiz_right');
    } else {
      b.classList.add('wrong');
      quiz.querySelector('.quiz-result').textContent = '再想一想～';
      say('quiz_try');
    }
  });

  return {
    panel: '#' + panel.id,
    enter({ silent } = {}) { show(index, { silent }); },
    exit() {
      applyOffset(false);
      clearScene();
      if (ctx.hooks.sun) ctx.hooks.sun.reset();
      controls.minDistance = 1.03;
      controls.maxDistance = 9;
    },
    update(now, dt, rawDt) { if (live && live.update) live.update(now, dt, rawDt); },
  };
});
