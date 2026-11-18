"use strict";

const moons = [
  {
    id: "io",
    name: "木卫一",
    en: "IO",
    tag: "火山世界",
    tint: "#3f3226",
    light: "#ffe3a0",
    fact: "木卫一上有许多活火山。它绕木星跑得很快，在这四颗大卫星里离木星最近。",
  },
  {
    id: "europa",
    name: "木卫二",
    en: "EUROPA",
    tag: "冰下海洋之谜",
    tint: "#39332e",
    light: "#ecdfcb",
    fact: "木卫二表面覆盖着冰，冰上有长长的裂纹。科学家从观测中推测，冰壳下面可能藏着液态海洋。",
  },
  {
    id: "ganymede",
    name: "木卫三",
    en: "GANYMEDE",
    tag: "最大的卫星",
    tint: "#2e3642",
    light: "#c5d8ed",
    fact: "木卫三是太阳系里最大的卫星，直径甚至超过了水星。它一直绕着木星运行。",
  },
  {
    id: "callisto",
    name: "木卫四",
    en: "CALLISTO",
    tag: "古老的撞击坑",
    tint: "#39373c",
    light: "#d3c7b9",
    fact: "木卫四的表面布满撞击坑。它们保存着很久以前小天体撞上来的痕迹。",
  },
];
// 两张教学示意图只比较投影位置，不对应实际日期和轨道比例。
const frames = [
  [65, 24, 78, 92],
  [35, 68, 17, 85],
];
const byId = (id) => document.getElementById(id);
const panel = byId("panel"),
  content = byId("content");
const libraryKey = "jupiter-observatory:discovery:v1";
const fresh = () => ({
  step: "mark",
  marks: new Set(),
  guess: "",
  track: null,
});
let trip = fresh(),
  started = false,
  voiceKey = "",
  audioEnabled = true,
  serial = 0;
let lastDiscovery = null;
try {
  const saved = JSON.parse(localStorage.getItem(libraryKey));
  if (
    saved &&
    Number.isInteger(saved.track) &&
    moons[saved.track] &&
    ["stay", "move"].includes(saved.guess)
  )
    lastDiscovery = saved;
} catch {}
const audio = new Audio();
const icons = {
  sound:
    '<path d="M3 9h4l5-4v14l-5-4H3zM16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  mute: '<path d="M3 9h4l5-4v14l-5-4H3zM16 9l5 6m0-6-5 6"/>',
  scope:
    '<path d="m3 11 13-7 3 5-13 7zM16 4l2-1 4 7-2 1M11 14v3m-4 5 4-6 4 6"/>',
  moon: '<path d="M20 15A8 8 0 0 1 9 4 8.5 8.5 0 1 0 20 15z"/>',
  target:
    '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>',
};
function drawIcons() {
  document.querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML =
      '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24">' +
      icons[el.dataset.icon] +
      "</svg>";
  });
}
function stopVoice() {
  serial++;
  audio.onerror = null;
  audio.pause();
  window.speechSynthesis?.cancel();
}
function say(key) {
  stopVoice();
  voiceKey = key;
  if (!key || !audioEnabled) return;
  const text = window.OBS_VOICE?.[key];
  if (!text) return;
  const token = serial;
  let tried = false;
  const fallback = () => {
    if (tried || token !== serial || !audioEnabled || !window.speechSynthesis)
      return;
    tried = true;
    const line = new SpeechSynthesisUtterance(text);
    line.lang = "zh-CN";
    line.rate = 0.9;
    window.speechSynthesis.speak(line);
    byId("sound").title = "当前旁白来自浏览器语音";
  };
  audio.onerror = fallback;
  audio.src = "audio/" + key + ".mp3";
  audio.play().catch(fallback);
}
function soundControl() {
  const btn = byId("sound");
  btn.setAttribute("aria-pressed", String(audioEnabled));
  btn.setAttribute("aria-label", audioEnabled ? "关闭语音" : "开启语音");
  btn.title = audioEnabled ? "旁白：小晓（Edge TTS）" : "语音已关闭";
  btn.querySelector("span").textContent = audioEnabled ? "语音开" : "语音关";
  btn.querySelector("i").dataset.icon = audioEnabled ? "sound" : "mute";
  drawIcons();
}
byId("sound").onclick = () => {
  audioEnabled = !audioEnabled;
  soundControl();
  if (audioEnabled) say("intro");
  else stopVoice();
};
function starField() {
  let seed = 1996;
  const rand = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
  const host = document.querySelector(".stars");
  for (let i = 0; i < 155; i++) {
    const star = document.createElement("i"),
      size = rand() * 1.6 + 0.65;
    star.style.cssText =
      "left:" +
      rand() * 100 +
      "%;top:" +
      rand() * 100 +
      "%;opacity:" +
      (rand() * 0.6 + 0.15) +
      ";width:" +
      size +
      "px;height:" +
      size +
      "px";
    host.append(star);
  }
}
// ============ 观测视野和记录 ============
function field(
  night,
  interactive = false,
  labels = 0,
  tracked = null,
  marked = false,
  target = "",
) {
  const points = moons
    .map((m, i) => {
      const picked = marked && trip.marks.has(i),
        tracking = tracked === i;
      const tag = interactive ? "button" : "span",
        attr = interactive
          ? ' data-moon="' +
            i +
            '" aria-label="' +
            m.name +
            '" aria-pressed="' +
            (picked || tracking) +
            '"'
          : ' aria-hidden="true"';
      return (
        "<" +
        tag +
        attr +
        ' class="dot ' +
        (picked ? "marked " : "") +
        (tracking ? "tracked" : "") +
        '" style="left:' +
        frames[night][i] +
        "%;--light:" +
        m.light +
        '"><i></i></' +
        tag +
        ">"
      );
    })
    .join("");
  return (
    '<div class="scope"><span class="night">第' +
    (night ? "二" : "一") +
    '晚</span><span class="field-note">模拟视野</span><img class="planet" src="images/jupiter.webp" alt="木星位于画面中央">' +
    points +
    (target
      ? '<span class="tag-target ' + target + '">↓ 贴在这里</span>'
      : "") +
    (labels >= 1 ? '<b class="side-tag l">左</b>' : "") +
    (labels >= 2 ? '<b class="side-tag r">右</b>' : "") +
    "</div>"
  );
}
function choice(value, text, big = false) {
  return (
    '<button class="choice' +
    (big ? " big" : "") +
    '" data-choice="' +
    value +
    '">' +
    text +
    "</button>"
  );
}
function action(id, text) {
  return (
    '<button class="primary" data-action="' + id + '">' + text + "</button>"
  );
}
function setPanel(label, title, body, key = "") {
  byId("panel-label").textContent = label;
  content.innerHTML =
    '<h2 id="dialog-title" tabindex="-1">' + title + "</h2>" + body;
  byId("read").hidden = !key;
  byId("read").disabled = !audioEnabled;
  voiceKey = key;
  if (!panel.open) panel.showModal();
  panel.scrollTop = 0;
  byId("dialog-title").focus({ preventScroll: true });
  say(key);
}
function showStep() {
  const s = trip.step;
  if (s === "mark") {
    setPanel(
      "第一晚 · 寻找卫星",
      "把四颗亮点标出来",
      "<p>点一下小亮点，就给它圈上一个记号。</p>" +
        field(0, true, 0, null, true) +
        '<p class="message" role="status" id="feedback"></p><div class="choices" id="next"></div>',
      "mark",
    );
    updateMarks();
    return;
  }
  if (s === "left" || s === "right") {
    const side = s === "left" ? "左" : "右";
    setPanel(
      "第一晚 · 写观测记录",
      "给" + side + "边贴上方向字",
      field(0, false, s === "left" ? 0 : 1, null, false, s) +
        '<p>听一听，选一个方向字贴到箭头旁。</p><div class="choices">' +
        choice("right", "右", true) +
        choice("left", "左", true) +
        '</div><p class="message" id="feedback" role="status"></p>',
      s,
    );
    return;
  }
  if (s === "count") {
    setPanel(
      "第一晚 · 数一数",
      "两边合起来有几颗？",
      field(0, false, 2) +
        '<p>左边 1 颗，右边 3 颗。把它们合在一起数一数。</p><div class="choices">' +
        [3, 4, 5].map((n) => choice(n, String(n), true)).join("") +
        '</div><p class="message" id="feedback" role="status"></p>',
      "count",
    );
    return;
  }
  if (s === "predict") {
    setPanel(
      "两晚之间 · 猜一猜",
      "明晚再看，亮点还在原处吗？",
      field(0, false, 2) +
        '<p>你可以先猜。选好后，把望远镜拨到下一晚。</p><div class="choices">' +
        choice("stay", "还在原处") +
        choice("move", "会换位置") +
        "</div>",
      "predict",
    );
    return;
  }
  if (s === "compare") {
    setPanel(
      "第二晚 · 对照观测",
      "找出同一颗卫星",
      "<p>你猜它们" +
        (trip.guess === "move" ? "会换位置" : "还在原处") +
        '。点任意一颗亮点，两张图会同时圈出它。</p><div class="stack">' +
        field(0, true, 0, trip.track) +
        field(1, true, 0, trip.track) +
        '</div><p id="feedback" class="message" role="status"></p><div class="choices" id="next"></div>',
      "compare",
    );
    updateTrack();
    return;
  }
}
function updateMarks() {
  byId("feedback").textContent = "已经标记 " + trip.marks.size + " / 4 颗";
  byId("next").innerHTML =
    trip.marks.size === 4
      ? action("label", "给观测图贴字 →") +
        '<button class="secondary" data-action="predict">直接猜第二晚</button>'
      : "";
}
function trackText(i) {
  const a = frames[0][i],
    b = frames[1][i];
  return (
    moons[i].name +
    "：第一晚在木星" +
    (a < 50 ? "左" : "右") +
    "边，第二晚" +
    (a < 50 !== b < 50
      ? "到了" + (b < 50 ? "左" : "右") + "边"
      : Math.abs(b - 50) < Math.abs(a - 50)
        ? "更靠近木星了"
        : "离木星更远了") +
    "。"
  );
}
function updateTrack() {
  const i = trip.track;
  byId("feedback").textContent =
    i === null ? "点一个亮点，追踪它的变化。" : trackText(i);
  byId("next").innerHTML = i === null ? "" : action("save", "收进我的发现册 →");
}
function renderBook() {
  document.querySelector(".book-dot").hidden = !lastDiscovery;
  if (!lastDiscovery) {
    setPanel(
      "我的发现册",
      "第一张观测记录，等你来画",
      '<p>完成两晚的观测，就能在这里翻看自己的发现。</p><div class="choices">' +
        action("start", "去观测 →") +
        "</div>",
    );
    return;
  }
  const d = lastDiscovery;
  setPanel(
    "我的发现册 · 最近一次木星观测",
    "我跟踪了" + moons[d.track].name,
    "<p>我原来猜，四颗亮点" +
      (d.guess === "move" ? "会换位置" : "还在原处") +
      '。</p><div class="stack">' +
      field(0, false, 2, d.track) +
      field(1, false, 2, d.track) +
      "</div><p>" +
      trackText(d.track) +
      '</p><p class="plate">指给家人看：我知道它动了，因为……</p><p class="muted" id="saved-note"></p><div class="choices">' +
      action("again", "再观测一次") +
      '<button class="secondary" data-action="close">回到观测台</button></div>',
    "finish",
  );
}
function openTrip() {
  started = true;
  byId("start-label").textContent = "继续观测";
  showStep();
}
function save() {
  lastDiscovery = { track: trip.track, guess: trip.guess };
  let persisted = false;
  try {
    localStorage.setItem(libraryKey, JSON.stringify(lastDiscovery));
    persisted = true;
  } catch {}
  trip = fresh();
  started = false;
  byId("start-label").textContent = "开始观测";
  renderBook();
  byId("saved-note").textContent = persisted
    ? "已保存在这台设备上。"
    : "本次记录可在当前页面翻看。";
}
function selectChoice(v) {
  const s = trip.step;
  if (s === "predict") {
    trip.guess = v;
    trip.step = "compare";
    showStep();
    return;
  }
  if (
    (s === "left" && v === "left") ||
    (s === "right" && v === "right") ||
    (s === "count" && v === "4")
  ) {
    trip.step = { left: "right", right: "count", count: "predict" }[s];
    showStep();
  } else {
    byId("feedback").textContent =
      s === "count"
        ? "从左边的一颗开始，把右边的三颗也数进去。"
        : "再听一次读音，看看另一个字。";
    say("retry");
    voiceKey = s;
  }
}
content.addEventListener("click", (event) => {
  const b = event.target.closest("button");
  if (!b) return;
  if (b.dataset.moon !== undefined) {
    const i = Number(b.dataset.moon);
    if (trip.step === "mark") {
      trip.marks.add(i);
      b.classList.add("marked");
      b.setAttribute("aria-pressed", "true");
      updateMarks();
    }
    if (trip.step === "compare") {
      trip.track = i;
      content.querySelectorAll("[data-moon]").forEach((dot) => {
        const on = Number(dot.dataset.moon) === i;
        dot.classList.toggle("tracked", on);
        dot.setAttribute("aria-pressed", String(on));
      });
      updateTrack();
    }
  } else if (b.dataset.choice !== undefined) {
    selectChoice(b.dataset.choice);
  } else if (b.dataset.action === "predict") {
    trip.step = "predict";
    showStep();
  } else if (b.dataset.action === "label") {
    trip.step = "left";
    showStep();
  } else if (b.dataset.action === "start" || b.dataset.action === "again") {
    openTrip();
  } else if (b.dataset.action === "save") {
    save();
  } else if (b.dataset.action === "close") {
    panel.close();
  }
});
// ============ 卫星档案与入口 ============
byId("atlas").innerHTML = moons
  .map(
    (m) =>
      '<button class="atlas-card" style="--tint:' +
      m.tint +
      '" data-profile="' +
      m.id +
      '"><img src="images/' +
      m.id +
      '.webp" alt=""><span><em>' +
      m.en +
      "</em><strong>" +
      m.name +
      "</strong><small>" +
      m.tag +
      '</small></span><span aria-hidden="true" class="open-arrow">↗</span></button>',
  )
  .join("");
byId("atlas").onclick = (event) => {
  const b = event.target.closest("button");
  if (!b) return;
  const m = moons.find((item) => item.id === b.dataset.profile);
  setPanel(
    "卫星档案 · " + m.en,
    m.name + " · " + m.tag,
    '<div class="profile"><img src="images/' +
      m.id +
      '.webp" alt="' +
      m.name +
      '的球面示意"><p>' +
      m.fact +
      '</p></div><div class="choices">' +
      action("start", started ? "继续观测 →" : "从望远镜里找它 →") +
      "</div>",
  );
};
byId("credits").onclick = () => {
  setPanel(
    "模型与素材",
    "关于这次观测",
    '<p class="source">两晚的画面用于比较卫星位置。日期、亮点大小和间距均为教学示意；木星还有许多其他卫星。</p><p class="source">木星球面由卡西尼和朱诺任务的拼合贴图投影、加光生成。NASA/JPL-Caltech/SSI/SwRI/MSSS/ASI/INAF/JIRAM/Björn Jónsson，<a href="https://www.planetary.org/space-images/merged-cassini-and-juno">原始素材</a> · <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>。</p><p class="source">木卫三使用伽利略号拍摄的增强色影像，已裁切。NASA/JPL/DLR，<a href="https://science.nasa.gov/photojournal/ganymedes-trailing-hemisphere/">PIA01666</a>。其余三颗卫星使用项目已有贴图，经投影和光照处理。<a href="https://www.solarsystemscope.com/textures/">Solar System Scope</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。<a href="https://science.nasa.gov/jupiter/jupiter-moons/">NASA 木星卫星资料</a>。</p>',
  );
};
byId("start").onclick = openTrip;
byId("home").onclick = () => window.scrollTo(0, 0);
byId("book").onclick = renderBook;
byId("read").onclick = () => say(voiceKey);
byId("close").onclick = () => panel.close();
panel.addEventListener("close", () => {
  stopVoice();
});
panel.addEventListener("click", (event) => {
  if (event.target === panel) {
    const r = panel.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      panel.close();
  }
});
document.querySelector(".book-dot").hidden = !lastDiscovery;
starField();
soundControl();
