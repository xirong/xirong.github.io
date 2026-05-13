const AUDIO_BASE = "audio/under-the-sea/";
const IMAGE_BASE = "images/under-the-sea/";

const steps = [
    step("title", "Song", "Under the Sea", "今天的主题是海底世界", "00-under-the-sea.mp3", "beach-title", startTask("准备出发", "先听标题，再大声说 Under the Sea")),
    step("mermaid-question", "Mia", "Is that a mermaid?", "那是美人鱼吗？", "01-is-that-a-mermaid.mp3", "beach", targetTask("mermaid-shadow", "点一点远处的影子", "Mia 看见了远处的尾巴，点一下海边的美人鱼影子")),
    step("not-sure", "Leo", "I'm not sure.", "我不确定", "02-im-not-sure.mp3", "beach-close", startTask("跟 Leo 说一遍", "点跟读，说 I'm not sure")),
    step("jellyfish", "Mia", "Look, jellyfish!", "看，水母！", "04-look-jellyfish.mp3", "jellyfish", targetTask("jellyfish", "找到水母", "点击发光的 jellyfish")),
    step("find-mermaid", "Leo", "I'm going to find the mermaid.", "我要去找美人鱼", "03-going-to-find-mermaid.mp3", "submarine", targetTask("submarine", "点击潜水艇出发", "坐进黄色潜水艇，准备下潜")),
    step("starfish", "Leo", "Look, a starfish!", "看，一只海星！", "05-look-a-starfish.mp3", "starfish", targetTask("starfish", "找到海星", "点击黄色 starfish")),
    step("where-starfish", "Mia", "Where is it?", "它在哪里？", "06-where-is-it.mp3", "starfish", choiceTask("选位置", "海星在哪里？", ["on", "behind", "between"], "on", "Right, it is on the turtle's back.")),
    step("turtle-back", "Leo", "It's on the turtle's back.", "它在乌龟背上", "07-on-turtles-back.mp3", "starfish", targetTask("turtle", "点乌龟背", "点一下 turtle's back，记住 on")),
    step("shark", "Mia", "Look, a shark!", "看，一条鲨鱼！", "08-look-a-shark.mp3", "shark", targetTask("shark", "点鲨鱼", "Shark 游过来了，点一下它")),
    step("where-shark", "Leo", "Where is it?", "它在哪里？", "09-where-is-it-shark.mp3", "shark", choiceTask("选位置", "鲨鱼藏在哪里？", ["on", "behind", "between"], "behind", "Yes, it is behind the dolphin.")),
    step("behind-dolphin", "Mia", "It's behind the dolphin!", "它在海豚后面！", "10-behind-the-dolphin.mp3", "dolphins", targetTask("dolphin", "点海豚", "点一下 dolphin，记住 behind")),
    step("thank-dolphins", "Leo", "Thank you, dolphins!", "谢谢你们，海豚！", "11-thank-you-dolphins.mp3", "dolphins", targetTask("dolphin-group", "谢谢海豚", "点击海豚群，说 Thank you, dolphins")),
    step("lost", "Mia", "We are lost. Who can help us?", "我们迷路了，谁能帮帮我们？", "12-we-are-lost.mp3", "lost", targetTask("crab", "找一个小帮手", "他们迷路了，点一下发光的小螃蟹问路")),
    step("where-mermaid", "Leo", "Where is the mermaid?", "美人鱼在哪里？", "13-where-is-mermaid.mp3", "coral", choiceTask("选位置", "美人鱼在哪里？", ["on the turtle", "behind the coral", "between two fish"], "behind the coral", "Yes, behind the coral.")),
    step("behind-coral", "Crab", "Far away behind the coral.", "在远远的珊瑚后面", "14-behind-coral.mp3", "coral", targetTask("coral", "点远处珊瑚", "点一下 coral，继续找美人鱼")),
    step("whale-danger", "Leo", "The whale is going to eat us!", "鲸鱼要吃掉我们了！", "15-whale-going-to-eat-us.mp3", "whale-danger", targetTask("whale", "点击鲸鱼", "鲸鱼张开大嘴，点它看看发生什么")),
    step("help", "Mia", "Oh, no! Help!", "不好，救命！", "16-oh-no-help.mp3", "help", targetTask("submarine", "摇一摇潜水艇", "点击潜水艇，喊 Help")),
    step("leo-where", "Mia", "Leo, where are you?", "Leo，你在哪里？", "17-leo-where-are-you.mp3", "between", choiceTask("选位置", "Leo 在哪里？", ["on", "behind", "between"], "between", "Right, between a seal and an octopus.")),
    step("between", "Leo", "I'm between a seal and an octopus.", "我在海豹和章鱼中间", "18-between-seal-octopus.mp3", "between", targetTask("leo", "找到 Leo", "点击 seal 和 octopus 中间的 Leo")),
    step("mermaids", "Mia", "The mermaids!", "美人鱼们！", "19-the-mermaids.mp3", "mermaids", targetTask("mermaids", "点美人鱼", "他们终于找到了 mermaids")),
    step("thank-whale", "Leo", "Thank you, whale!", "谢谢你，鲸鱼！", "20-thank-you-whale.mp3", "final", targetTask("whale", "谢谢鲸鱼", "点击 whale，完成这次海底复习"))
];

let current = 0;
let completed = new Set();
let activeAudio = null;

const stageEl = document.getElementById("stage");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const sceneBadge = document.getElementById("sceneBadge");
const sceneHint = document.getElementById("sceneHint");
const speakerName = document.getElementById("speakerName");
const englishLine = document.getElementById("englishLine");
const chineseHint = document.getElementById("chineseHint");
const taskBox = document.getElementById("taskBox");
const feedback = document.getElementById("feedback");
const listenBtn = document.getElementById("listenBtn");
const repeatBtn = document.getElementById("repeatBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const confetti = document.getElementById("confetti");

function step(id, speaker, line, zh, audio, world, task) {
    return { id, speaker, line, zh, audio, world, task };
}

function startTask(title, copy) {
    return { kind: "start", title, copy, done: "Great speaking!" };
}

function targetTask(target, title, copy) {
    return { kind: "target", target, title, copy, done: "Good job! You found it." };
}

function choiceTask(title, copy, choices, answer, done) {
    return { kind: "choice", title, copy, choices, answer, done };
}

function render() {
    const item = steps[current];
    stageEl.innerHTML = buildScene(item) + buildHotspot(item);
    progressText.textContent = `${current + 1} / ${steps.length}`;
    progressBar.style.width = `${((current + 1) / steps.length) * 100}%`;
    sceneBadge.textContent = `Scene ${current + 1}`;
    sceneHint.textContent = sceneLabel(item.world);
    speakerName.textContent = item.speaker;
    englishLine.textContent = item.line;
    chineseHint.textContent = item.zh;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = !completed.has(current);
    nextBtn.textContent = current === steps.length - 1 ? "再玩一次" : "下一句";
    setFeedback("先听一遍，再完成下面的小任务");
    renderTask(item);
    bindTargets(item);
}

const hotspots = {
    "mermaid-question": [55, 52, 20, 22],
    jellyfish: [58, 51, 46, 58],
    "find-mermaid": [48, 49, 60, 50],
    starfish: [48, 56, 28, 30],
    "turtle-back": [48, 56, 28, 30],
    shark: [49, 50, 58, 46],
    "behind-dolphin": [53, 50, 54, 44],
    "thank-dolphins": [56, 54, 68, 62],
    lost: [48, 48, 58, 50],
    "behind-coral": [48, 60, 36, 42],
    "whale-danger": [44, 51, 46, 58],
    help: [51, 56, 52, 48],
    between: [50, 65, 54, 38],
    mermaids: [50, 50, 74, 60],
    "thank-whale": [62, 58, 66, 58]
};

const frameImages = {
    title: "00-title.jpg",
    "mermaid-question": "01-mermaid-question.jpg",
    "not-sure": "02-not-sure.jpg",
    jellyfish: "03-jellyfish.jpg",
    "find-mermaid": "04-find-mermaid.jpg",
    starfish: "05-starfish.jpg",
    "where-starfish": "06-where-starfish.jpg",
    "turtle-back": "07-turtle-back.jpg",
    shark: "08-shark.jpg",
    "where-shark": "09-where-shark.jpg",
    "behind-dolphin": "10-behind-dolphin.jpg",
    "thank-dolphins": "11-thank-dolphins.jpg",
    lost: "12-lost.jpg",
    "where-mermaid": "13-where-mermaid.jpg",
    "behind-coral": "14-behind-coral.jpg",
    "whale-danger": "15-whale-danger.jpg",
    help: "16-help.jpg",
    "leo-where": "17-leo-where.jpg",
    between: "18-between.jpg",
    mermaids: "19-mermaids.jpg",
    "thank-whale": "20-thank-whale.jpg"
};

function buildHotspot(item) {
    if (item.task.kind !== "target") return "";
    const box = hotspots[item.id];
    if (!box) return "";
    const [left, top, width, height] = box;
    return `<button class="hotspot" type="button" data-hotspot style="left:${left}%;top:${top}%;width:${width}%;height:${height}%;" aria-label="${escapeAttr(item.task.title)}"></button>`;
}

function renderTask(item) {
    const task = item.task;
    if (task.kind === "choice") {
        taskBox.innerHTML = `
            <p class="task-title">${task.title}</p>
            <p class="task-copy">${task.copy}</p>
            <div class="choice-grid">
                ${task.choices.map(choice => `<button class="choice-btn" type="button" data-choice="${escapeAttr(choice)}">${choice}</button>`).join("")}
            </div>
        `;
        taskBox.querySelectorAll("[data-choice]").forEach(btn => {
            btn.addEventListener("click", () => {
                if (btn.dataset.choice === task.answer) {
                    complete(task.done);
                } else {
                    setFeedback("再看一下画面里的位置线索", "try");
                }
            });
        });
        return;
    }

    const actionText = task.kind === "target" ? "我找到啦" : "我跟读完啦";
    taskBox.innerHTML = `
        <p class="task-title">${task.title}</p>
        <p class="task-copy">${task.copy}</p>
        <button class="choice-btn" type="button" data-manual-complete>${actionText}</button>
    `;
    taskBox.querySelector("[data-manual-complete]").addEventListener("click", () => complete(task.done));
}

function bindTargets(item) {
    const hotspot = stageEl.querySelector("[data-hotspot]");
    if (hotspot) {
        const handleHotspot = () => {
            if (!completed.has(current)) complete(item.task.done);
        };
        hotspot.addEventListener("pointerdown", handleHotspot);
        hotspot.addEventListener("click", handleHotspot);
    }

    stageEl.querySelectorAll("[data-target]").forEach(target => {
        const active = item.task.kind === "target" && target.dataset.target === item.task.target;
        target.classList.toggle("is-active", active);
        target.setAttribute("tabindex", active ? "0" : "-1");
        target.setAttribute("role", active ? "button" : "img");
        const handleTarget = () => {
            if (active && !completed.has(current)) complete(item.task.done);
        };
        target.addEventListener("pointerdown", handleTarget);
        target.addEventListener("click", handleTarget);
        target.addEventListener("keydown", event => {
            if (active && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                complete(item.task.done);
            }
        });
    });
}

function complete(message) {
    completed.add(current);
    nextBtn.disabled = false;
    setFeedback(message, "good");
    burstConfetti();
}

function setFeedback(message, type = "") {
    feedback.className = `feedback ${type}`;
    feedback.textContent = message;
}

function playLine() {
    const item = steps[current];
    if (activeAudio) activeAudio.pause();
    activeAudio = new Audio(AUDIO_BASE + item.audio);
    activeAudio.play().catch(() => speakFallback(item.line));
}

function speakFallback(text) {
    if (!window.speechSynthesis) {
        setFeedback("音频还没准备好，可以先自己读这一句", "try");
        return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.82;
    utterance.pitch = 1.12;
    window.speechSynthesis.speak(utterance);
}

function repeatLine() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        complete("跟读完成，继续下一个小任务");
        return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setFeedback("正在听你跟读，说完会自动判断", "try");
    recognition.onerror = () => setFeedback("没有听清，也可以点任务按钮继续", "try");
    recognition.onresult = event => {
        const heard = event.results[0][0].transcript.toLowerCase();
        const wanted = steps[current].line.toLowerCase().replace(/[!?.,]/g, "");
        const keywords = wanted.split(/\s+/).filter(word => word.length > 2);
        const hits = keywords.filter(word => heard.includes(word)).length;
        if (hits >= Math.max(1, Math.ceil(keywords.length * 0.45))) {
            complete("跟读成功，声音很清楚");
        } else {
            setFeedback(`听到了 ${heard}，可以再试一次`, "try");
        }
    };
    recognition.start();
}

listenBtn.addEventListener("click", playLine);
repeatBtn.addEventListener("click", repeatLine);
prevBtn.addEventListener("click", () => {
    if (current > 0) {
        current -= 1;
        render();
    }
});
nextBtn.addEventListener("click", () => {
    if (current === steps.length - 1) {
        current = 0;
        completed = new Set();
    } else {
        current += 1;
    }
    render();
    playLine();
});

function buildScene(item) {
    const image = frameImages[item.id];
    if (image) {
        return `
            <div class="scene-frame" aria-label="${escapeAttr(item.line)}">
                <img class="scene-image" src="${IMAGE_BASE}${image}" alt="${escapeAttr(item.line)}">
            </div>
        `;
    }
    const sea = !item.world.startsWith("beach");
    return `
        <svg viewBox="0 0 1280 720" aria-label="${escapeAttr(item.line)}">
            ${defs()}
            ${sea ? underwaterBg(item.world) : beachBg(item.world)}
            ${sceneContent(item.world)}
            <g>
                <rect x="332" y="654" width="616" height="42" rx="4" fill="#f7e9b1" opacity=".86"/>
                <text x="640" y="682" text-anchor="middle" font-family="Nunito, sans-serif" font-size="25" font-weight="900" fill="#16354d">${escapeText(item.line)}</text>
            </g>
        </svg>
    `;
}

function sceneContent(world) {
    const scenes = {
        "beach-title": `
            <g transform="translate(760 306) scale(.78)" class="float">${mermaidShadow("mermaid-shadow")}</g>
            <g transform="translate(482 462) scale(.7)">${leo()}</g>
            <g transform="translate(610 472) scale(.58)">${mia()}</g>
        `,
        beach: `
            <g transform="translate(910 272) scale(.72)" class="float">${mermaidShadow("mermaid-shadow")}</g>
            <g transform="translate(462 492) scale(.68)">${leo()}</g>
            <g transform="translate(590 504) scale(.58)">${mia()}</g>
        `,
        "beach-close": `<g transform="translate(548 346) scale(1.42)">${leo()}</g>`,
        submarine: `<g transform="translate(340 186) scale(1.04)" class="bob">${submarine("submarine")}</g>`,
        jellyfish: `
            <g transform="translate(520 180) scale(1.3)" class="float">${jellyfish("jellyfish")}</g>
            <g transform="translate(230 116) scale(.74)" class="bob">${submarine("submarine")}</g>
            <g transform="translate(880 332) scale(.72)" class="float">${jellyfish("jellyfish-small")}</g>
        `,
        starfish: `
            <g transform="translate(610 432) scale(1.1)">${turtle("turtle")}</g>
            <g transform="translate(636 360) scale(1.08)" class="float">${starfish("starfish")}</g>
            <g transform="translate(165 88) scale(.68)" class="bob">${submarine("submarine")}</g>
        `,
        shark: `
            <g transform="translate(626 258) scale(1.1)" class="swim">${dolphin("dolphin")}</g>
            <g transform="translate(362 292) scale(.92)">${shark("shark")}</g>
            <g transform="translate(124 110) scale(.58)" class="bob">${submarine("submarine")}</g>
        `,
        dolphins: `
            <g data-target="dolphin-group" class="scene-target">
                <ellipse class="target-ring" cx="705" cy="320" rx="300" ry="210" fill="#ffe15a"/>
                <g transform="translate(505 210) scale(.78)" class="swim">${dolphin("dolphin")}</g>
                <g transform="translate(700 330) scale(.62)" class="swim">${dolphin("dolphin2")}</g>
                <g transform="translate(320 365) scale(.58)" class="swim">${dolphin("dolphin3")}</g>
                <g transform="translate(802 170) scale(.55)" class="swim">${dolphin("dolphin4")}</g>
            </g>
            <g transform="translate(100 104) scale(.55)" class="bob">${submarine("submarine")}</g>
        `,
        lost: `
            <g transform="translate(290 122) scale(.76)" class="bob">${submarine("submarine")}</g>
            <g transform="translate(728 454) scale(.72)" class="float">${crab("crab")}</g>
            <g transform="translate(520 330) scale(1.02)">${coral("decor-coral")}</g>
        `,
        coral: `
            <g transform="translate(700 360) scale(1.36)">${coral("coral")}</g>
            <g transform="translate(812 414) scale(.66)" class="float">${crab("crab")}</g>
            <g transform="translate(430 320) scale(.92)" opacity=".82">${mermaidShadow("mermaid-shadow")}</g>
            <g transform="translate(210 110) scale(.55)" class="bob">${submarine("submarine")}</g>
        `,
        "whale-danger": `
            <g transform="translate(660 260) scale(1.44)" class="swim">${whale("whale")}</g>
            <g transform="translate(206 268) scale(.65)" class="bob">${submarine("submarine")}</g>
        `,
        help: `
            <g transform="translate(460 222) scale(1.16)">${submarine("submarine")}</g>
            <g transform="translate(830 356) scale(.74)" class="swim">${whale("whale")}</g>
        `,
        between: `
            <g transform="translate(288 408) scale(.82)" class="swim">${seal("seal")}</g>
            <g transform="translate(532 378) scale(.9)" class="float">${leo("leo")}</g>
            <g transform="translate(820 424) scale(.9)" class="float">${octopus("octopus")}</g>
        `,
        mermaids: `
            <g transform="translate(178 306) scale(.72)" class="float">${mermaid("mermaids")}</g>
            <g transform="translate(366 248) scale(.8)" class="float">${mermaid("mermaids")}</g>
            <g transform="translate(548 312) scale(.7)" class="float">${mermaid("mermaids")}</g>
            <g transform="translate(846 360) scale(1.04)" class="swim">${whale("whale")}</g>
            <g transform="translate(182 108) scale(.48)" class="bob">${submarine("submarine")}</g>
        `,
        final: `
            <g transform="translate(760 296) scale(1.26)" class="swim">${whale("whale")}</g>
            <g transform="translate(230 204) scale(.62)" class="float">${mermaid("mermaids")}</g>
            <g transform="translate(372 242) scale(.58)" class="float">${mermaid("mermaids")}</g>
            <g transform="translate(172 418) scale(.68)">${leo()}</g>
            <g transform="translate(304 430) scale(.58)">${mia()}</g>
        `
    };
    return scenes[world] || scenes.jellyfish;
}

function sceneLabel(world) {
    return {
        "beach-title": "海岛开场",
        beach: "海边发现",
        "beach-close": "Leo 有点犹豫",
        submarine: "坐潜水艇下海",
        jellyfish: "发光水母",
        starfish: "海星和乌龟",
        shark: "鲨鱼和海豚",
        dolphins: "海豚帮忙",
        lost: "迷路了",
        coral: "珊瑚后面",
        "whale-danger": "鲸鱼来了",
        help: "喊 Help",
        between: "between 位置",
        mermaids: "找到美人鱼",
        final: "谢谢鲸鱼"
    }[world] || "海底冒险";
}

function defs() {
    return `
        <defs>
            <linearGradient id="waterDepth" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#33c5dd"/>
                <stop offset="0.48" stop-color="#0e8db8"/>
                <stop offset="1" stop-color="#064c89"/>
            </linearGradient>
            <radialGradient id="glass" cx="35%" cy="25%" r="70%">
                <stop offset="0" stop-color="#f5fdff" stop-opacity=".9"/>
                <stop offset=".45" stop-color="#bee7ee" stop-opacity=".54"/>
                <stop offset="1" stop-color="#6da9ba" stop-opacity=".58"/>
            </radialGradient>
            <filter id="softGlow">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
        </defs>
    `;
}

function beachBg(world) {
    const title = world === "beach-title" ? `<text x="640" y="148" text-anchor="middle" font-family="Nunito, sans-serif" font-size="82" font-weight="900" fill="#db51a5" transform="rotate(-2 640 148)">Under the Sea</text>` : "";
    return `
        <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#73d8e6"/><stop offset=".55" stop-color="#b7efe5"/><stop offset="1" stop-color="#f4da87"/>
            </linearGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#sky)"/>
        <g fill="#fff" opacity=".96">
            <ellipse cx="188" cy="102" rx="68" ry="24"/><ellipse cx="240" cy="92" rx="48" ry="26"/>
            <ellipse cx="820" cy="78" rx="88" ry="34"/><ellipse cx="912" cy="98" rx="66" ry="23"/>
            <ellipse cx="1058" cy="176" rx="62" ry="21"/>
        </g>
        <path d="M0 430 C220 374 332 452 500 404 C704 345 865 418 1018 390 C1120 370 1200 338 1280 344 L1280 720 L0 720 Z" fill="#f0c967"/>
        <path d="M0 350 C230 342 372 380 538 362 C694 344 832 314 1280 330 L1280 504 C1010 478 766 472 574 502 C362 536 216 524 0 488 Z" fill="#58bbd0"/>
        <path d="M0 388 C250 414 424 438 588 410 C766 378 972 372 1280 392 L1280 430 C980 410 808 416 610 442 C380 472 196 444 0 432 Z" fill="#dff7f5" opacity=".48"/>
        <g transform="translate(90 250)">
            <path d="M20 160 L64 38 L108 160 Z" fill="#a96b35"/>
            <path d="M64 38 C4 54 -24 88 -40 126 C34 110 76 86 64 38 Z" fill="#21865f"/>
            <path d="M64 38 C118 40 168 78 198 124 C126 114 76 84 64 38 Z" fill="#2b9a69"/>
            <path d="M64 38 C42 -18 86 -52 128 -82 C134 -22 104 20 64 38 Z" fill="#23855d"/>
        </g>
        <path d="M980 302 C1062 224 1188 238 1280 288 L1280 720 L960 720 Z" fill="#73b45d" opacity=".72"/>
        <ellipse cx="1020" cy="606" rx="48" ry="14" fill="#d5a954" opacity=".55"/>
        <ellipse cx="224" cy="626" rx="62" ry="16" fill="#d5a954" opacity=".55"/>
        ${title}
    `;
}

function underwaterBg(world) {
    const tint = world === "help" || world === "between" ? "#c98988" : "#0e8db8";
    return `
        <rect width="1280" height="720" fill="${tint}"/>
        <rect width="1280" height="720" fill="url(#waterDepth)" opacity="${world === "between" ? ".28" : "1"}"/>
        <path d="M0 82 C140 112 236 48 364 74 C520 106 650 112 812 68 C1012 16 1104 90 1280 46 L1280 0 L0 0 Z" fill="#d9fbff" opacity=".56"/>
        <path d="M90 0 L208 720" stroke="#fff" stroke-width="72" opacity=".14"/>
        <path d="M470 0 L300 720" stroke="#fff" stroke-width="44" opacity=".09"/>
        <path d="M930 0 L794 720" stroke="#fff" stroke-width="58" opacity=".1"/>
        ${bubbles()}
        <path d="M0 650 C194 610 320 684 514 642 C718 598 890 650 1088 624 C1160 614 1224 598 1280 604 L1280 720 L0 720 Z" fill="#0a6c8d" opacity=".42"/>
        ${plants()}
    `;
}

function submarine(target) {
    return targetWrap(target, 355, 245, 330, 214, `
        <path d="M146 132 C190 50 518 46 574 128 C648 238 580 382 445 404 L160 404 C60 350 56 226 146 132 Z" fill="#ffd22a"/>
        <path d="M156 168 C244 116 470 108 560 160 C544 102 478 70 344 70 C230 70 176 100 156 168 Z" fill="#ffef70" opacity=".45"/>
        <circle cx="322" cy="244" r="132" fill="#f23b2d"/><circle cx="322" cy="244" r="110" fill="#12a9b7"/><circle cx="322" cy="244" r="92" fill="url(#glass)"/>
        <circle cx="102" cy="244" r="76" fill="#f23b2d"/><circle cx="102" cy="244" r="60" fill="#12a9b7"/><circle cx="102" cy="244" r="48" fill="url(#glass)"/>
        <g transform="translate(300 206) scale(.46)">${leo()}</g><g transform="translate(92 212) scale(.38)">${mia()}</g>
        <circle cx="102" cy="376" r="34" fill="#ff7ab1"/><circle cx="102" cy="376" r="22" fill="#ffe34c"/>
        <circle cx="520" cy="376" r="34" fill="#ff7ab1"/><circle cx="520" cy="376" r="22" fill="#ffe34c"/>
        <path d="M574 214 L650 166 L650 322 Z" fill="#bf5ddf"/><path d="M650 166 L704 128 L704 360 L650 322 Z" fill="#8f42d1"/>
        <rect x="336" y="10" width="34" height="76" rx="16" fill="#c17ee4"/><rect x="292" y="72" width="120" height="36" rx="18" fill="#128f95"/>
        <path d="M202 202 C238 164 400 168 462 208" fill="none" stroke="#fff" stroke-width="16" opacity=".35"/>
    `);
}

function leo(target = "leo") {
    const petals = Array.from({ length: 14 }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / 14;
        const x = Math.cos(angle) * 62;
        const y = Math.sin(angle) * 62;
        return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="28" ry="48" fill="#f07824" transform="rotate(${(angle * 180 / Math.PI).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    }).join("");
    return targetWrap(target, 0, 10, 118, 126, `
        <circle cx="0" cy="0" r="72" fill="#ff8f2e"/>${petals}<circle cx="0" cy="0" r="56" fill="#ffe077"/>
        <circle cx="-22" cy="-10" r="11" fill="#fff"/><circle cx="22" cy="-10" r="11" fill="#fff"/>
        <circle cx="-20" cy="-8" r="6" fill="#2185d5"/><circle cx="20" cy="-8" r="6" fill="#2185d5"/>
        <circle cx="0" cy="4" r="8" fill="#d93636"/><path d="M-26 28 Q0 44 28 28" fill="none" stroke="#744019" stroke-width="5" stroke-linecap="round"/>
        <rect x="-48" y="68" width="96" height="80" rx="24" fill="#ef5b32"/><text x="0" y="124" text-anchor="middle" font-family="Nunito, sans-serif" font-size="54" font-weight="900" fill="#fff">1</text>
        <path d="M-68 86 Q-98 120 -70 150" fill="none" stroke="#ffe077" stroke-width="16" stroke-linecap="round"/><path d="M68 86 Q100 116 72 150" fill="none" stroke="#ffe077" stroke-width="16" stroke-linecap="round"/>
    `);
}

function mia() {
    return targetWrap("mia", 0, 8, 96, 118, `
        <circle cx="-38" cy="-52" r="24" fill="#80543e"/><circle cx="38" cy="-52" r="24" fill="#80543e"/>
        <circle cx="0" cy="0" r="62" fill="#8a5a40"/><circle cx="-22" cy="-12" r="13" fill="#fff"/><circle cx="22" cy="-12" r="13" fill="#fff"/>
        <circle cx="-18" cy="-8" r="6" fill="#2d2b2a"/><circle cx="18" cy="-8" r="6" fill="#2d2b2a"/><circle cx="0" cy="8" r="10" fill="#e64235"/>
        <path d="M-14 28 Q0 38 16 28" fill="none" stroke="#3f2d25" stroke-width="5" stroke-linecap="round"/>
        <rect x="-48" y="62" width="96" height="94" rx="32" fill="#ee9c8d"/>
        <g fill="#fff" opacity=".9"><path d="M-26 88 c8-16 28-2 0 16 c-28-18-8-32 0-16"/><path d="M16 118 c8-16 28-2 0 16 c-28-18-8-32 0-16"/></g>
        <path d="M-60 92 Q-94 120 -66 150" fill="none" stroke="#8a5a40" stroke-width="15" stroke-linecap="round"/><path d="M60 92 Q94 118 66 150" fill="none" stroke="#8a5a40" stroke-width="15" stroke-linecap="round"/>
    `);
}

function mermaidShadow(target) {
    return targetWrap(target, 44, 55, 98, 70, `
        <path d="M0 40 C24 4 80 10 94 52 C112 32 146 28 164 42 C134 54 116 82 112 120 C88 94 46 94 18 120 C30 86 22 62 0 40 Z" fill="#b044b5" opacity=".82"/>
        <circle cx="48" cy="20" r="18" fill="#cc6b3a"/>
        <path d="M42 40 C34 72 34 92 54 114" fill="none" stroke="#743269" stroke-width="10" stroke-linecap="round" opacity=".7"/>
    `);
}

function mermaid(target) {
    return targetWrap(target, 52, 74, 108, 82, `
        <circle cx="46" cy="12" r="22" fill="#f2b086"/><path d="M24 -4 C40 -40 82 -18 70 28 C58 12 44 10 24 -4 Z" fill="#d85d38"/>
        <path d="M40 34 C16 72 24 112 68 124 C96 116 104 70 74 34 Z" fill="#c65ac8"/>
        <path d="M64 124 C86 134 104 150 132 134 C120 168 92 176 62 148 C34 176 6 168 -8 134 C18 150 40 134 64 124 Z" fill="#28b8b1"/>
        <circle cx="38" cy="10" r="4" fill="#262b34"/><circle cx="56" cy="10" r="4" fill="#262b34"/><path d="M38 24 Q48 32 60 24" fill="none" stroke="#8d3b3b" stroke-width="4" stroke-linecap="round"/>
    `);
}

function jellyfish(target) {
    return targetWrap(target, 0, 52, 92, 112, `
        <g filter="url(#softGlow)">
            <path d="M-70 10 C-50 -58 46 -68 74 0 C96 52 42 78 -8 72 C-62 66 -92 48 -70 10 Z" fill="#f8d6f0" opacity=".78"/>
            <path d="M-50 34 C-18 58 24 58 58 30" fill="none" stroke="#fff" stroke-width="6" opacity=".5"/>
            <g fill="none" stroke="#f8d6f0" stroke-width="8" stroke-linecap="round" opacity=".85">
                <path d="M-48 58 C-80 100 -48 120 -76 166"/><path d="M-18 66 C-42 118 -8 132 -26 178"/><path d="M18 66 C-4 112 28 138 8 180"/><path d="M52 58 C34 108 78 126 48 168"/>
            </g>
        </g>
    `);
}

function turtle(target) {
    return targetWrap(target, 0, 0, 122, 82, `
        <ellipse cx="0" cy="0" rx="94" ry="58" fill="#50635a"/><path d="M-58 -4 C-28 -40 28 -40 58 -4 C28 28 -28 28 -58 -4 Z" fill="#7e8b67"/>
        <circle cx="94" cy="-8" r="24" fill="#26392f"/><circle cx="102" cy="-16" r="4" fill="#fff"/>
        <path d="M-76 40 Q-112 54 -128 36" fill="none" stroke="#26392f" stroke-width="18" stroke-linecap="round"/><path d="M-76 -38 Q-112 -54 -128 -36" fill="none" stroke="#26392f" stroke-width="18" stroke-linecap="round"/>
    `);
}

function starfish(target) {
    return targetWrap(target, 0, 0, 88, 88, `
        <path d="M0 -82 L20 -22 L84 -28 L32 10 L52 72 L0 34 L-52 72 L-32 10 L-84 -28 L-20 -22 Z" fill="#ffd532" stroke="#fff3a2" stroke-width="8" stroke-linejoin="round"/>
        <path d="M0 -54 L0 26 M-48 -14 L42 -14 M-26 42 L24 -42" stroke="#fff7bd" stroke-width="5" stroke-linecap="round" opacity=".8"/>
    `);
}

function shark(target) {
    return targetWrap(target, 88, 20, 154, 94, `
        <path d="M-80 28 C-12 -54 164 -58 250 10 C168 78 18 82 -80 28 Z" fill="#31a8bd"/>
        <path d="M-18 8 C10 74 130 78 230 22 C158 80 22 92 -80 28 Z" fill="#d6eef2"/><path d="M70 -34 L112 -104 L132 -24 Z" fill="#238fa4"/><path d="M-80 28 L-144 -20 L-124 54 Z" fill="#238fa4"/>
        <circle cx="180" cy="-4" r="9" fill="#182b34"/><path d="M196 26 Q220 46 244 24" fill="#fff"/><path d="M204 28 l8 16 l8 -16 l8 16 l8 -16" fill="none" stroke="#1e3340" stroke-width="3"/>
    `);
}

function dolphin(target) {
    return targetWrap(target, 104, 24, 144, 94, `
        <path d="M-64 24 C8 -64 166 -46 238 16 C170 84 24 92 -64 24 Z" fill="#8ccfe4"/>
        <path d="M28 46 C76 72 150 66 214 26 C172 92 58 94 -24 34 Z" fill="#dff6fb"/><path d="M74 -28 L112 -92 L126 -18 Z" fill="#75bfd8"/><path d="M-64 24 L-126 -18 L-104 56 Z" fill="#75bfd8"/>
        <circle cx="170" cy="-4" r="7" fill="#243744"/><path d="M184 24 Q206 44 228 24" fill="none" stroke="#e24b4b" stroke-width="8" stroke-linecap="round"/>
    `);
}

function whale(target) {
    return targetWrap(target, 40, 40, 250, 150, `
        <path d="M-190 48 C-130 -92 136 -116 270 24 C174 164 -86 176 -190 48 Z" fill="#8aa9db"/>
        <path d="M-144 84 C-38 138 122 124 224 56 C134 162 -62 174 -190 48 Z" fill="#e5f0ff"/><path d="M260 20 L344 -48 L326 44 L354 130 Z" fill="#6f90c8"/>
        <circle cx="142" cy="-14" r="12" fill="#fff"/><circle cx="144" cy="-14" r="6" fill="#192b3e"/><path d="M-12 44 C36 68 104 66 156 34" fill="none" stroke="#6d82b1" stroke-width="6" opacity=".5"/>
    `);
}

function seal(target) {
    return targetWrap(target, 30, 34, 132, 88, `
        <path d="M-90 68 C-42 -34 96 -58 178 24 C96 112 -34 126 -90 68 Z" fill="#a09ab0"/>
        <circle cx="72" cy="-18" r="50" fill="#aaa3b8"/><circle cx="52" cy="-28" r="8" fill="#252b34"/><circle cx="88" cy="-28" r="8" fill="#252b34"/>
        <path d="M54 -4 Q72 10 92 -4" fill="none" stroke="#56475a" stroke-width="5" stroke-linecap="round"/><path d="M-86 66 Q-140 84 -166 48" fill="none" stroke="#8a8498" stroke-width="20" stroke-linecap="round"/>
    `);
}

function octopus(target) {
    return targetWrap(target, 0, 24, 110, 120, `
        <ellipse cx="0" cy="-14" rx="62" ry="70" fill="#c99248"/><circle cx="-22" cy="-28" r="9" fill="#34251b"/><circle cx="22" cy="-28" r="9" fill="#34251b"/>
        <path d="M-20 2 Q0 16 22 2" fill="none" stroke="#6c3b1f" stroke-width="6" stroke-linecap="round"/>
        <g fill="none" stroke="#c99248" stroke-width="18" stroke-linecap="round"><path d="M-48 34 C-88 82 -52 108 -94 142"/><path d="M-18 50 C-48 98 -4 116 -34 154"/><path d="M20 50 C52 96 12 120 44 154"/><path d="M50 34 C94 78 58 110 104 142"/></g>
    `);
}

function crab(target) {
    return targetWrap(target, 0, 0, 118, 92, `
        <ellipse cx="0" cy="20" rx="66" ry="44" fill="#ff7f2f"/><circle cx="-26" cy="-28" r="13" fill="#ff7f2f"/><circle cx="26" cy="-28" r="13" fill="#ff7f2f"/>
        <circle cx="-26" cy="-30" r="5" fill="#1d2730"/><circle cx="26" cy="-30" r="5" fill="#1d2730"/>
        <path d="M-84 2 l-42 -32 M84 2 l42 -32" stroke="#ff7f2f" stroke-width="14" stroke-linecap="round"/><circle cx="-138" cy="-40" r="20" fill="#ff7f2f"/><circle cx="138" cy="-40" r="20" fill="#ff7f2f"/>
        <path d="M-24 30 Q0 46 26 30" fill="none" stroke="#7e3015" stroke-width="5" stroke-linecap="round"/>
    `);
}

function coral(target) {
    return targetWrap(target, 90, 70, 210, 144, `
        <path d="M-80 160 C-70 84 -66 42 -40 -10 M-40 44 C-88 28 -110 -20 -92 -64 M-34 40 C2 16 6 -36 -10 -76" fill="none" stroke="#244d3d" stroke-width="24" stroke-linecap="round"/>
        <path d="M42 166 C56 86 50 52 92 2 M88 52 C126 26 142 -24 124 -66 M90 54 C62 18 58 -34 82 -82" fill="none" stroke="#3b7d41" stroke-width="22" stroke-linecap="round"/>
        <path d="M154 170 C154 92 172 58 218 18 M202 60 C248 40 264 -12 248 -50" fill="none" stroke="#7db141" stroke-width="20" stroke-linecap="round"/>
        <g fill="#ff6588"><circle cx="-112" cy="142" r="28"/><circle cx="-62" cy="126" r="24"/><circle cx="24" cy="146" r="32"/><circle cx="88" cy="134" r="26"/><circle cx="174" cy="142" r="30"/></g>
        <g fill="#ffca33"><circle cx="-22" cy="112" r="18"/><circle cx="128" cy="104" r="20"/><circle cx="228" cy="128" r="18"/></g>
    `);
}

function targetWrap(target, cx, cy, rx, ry, body) {
    return `<g data-target="${target}" class="scene-target"><ellipse class="target-hit" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/><ellipse class="target-ring" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#ffe15a"/>${body}</g>`;
}

function plants() {
    return `
        <g fill="none" stroke-linecap="round">
            <path d="M82 720 C60 640 102 574 82 500 C64 436 92 372 86 320" stroke="#155f45" stroke-width="18"/>
            <path d="M146 720 C132 628 168 548 150 462" stroke="#1d724d" stroke-width="16"/>
            <path d="M1098 720 C1070 626 1118 566 1096 478 C1080 410 1112 362 1110 310" stroke="#155f45" stroke-width="18"/>
            <path d="M1170 720 C1150 626 1192 550 1178 470" stroke="#1d724d" stroke-width="16"/>
        </g>
        <g transform="translate(80 626) scale(.7)">${coral("decor-coral-left")}</g>
        <g transform="translate(1010 622) scale(.55)">${coral("decor-coral-right")}</g>
    `;
}

function bubbles() {
    return `
        <g opacity=".72" fill="none" stroke="#d9fbff">
            <circle cx="114" cy="212" r="12" stroke-width="4"/><circle cx="198" cy="146" r="8" stroke-width="3"/>
            <circle cx="1040" cy="154" r="11" stroke-width="4"/><circle cx="1110" cy="248" r="7" stroke-width="3"/>
            <circle cx="910" cy="414" r="10" stroke-width="3"/><circle cx="360" cy="392" r="7" stroke-width="3"/>
        </g>
    `;
}

function burstConfetti() {
    confetti.innerHTML = "";
    const colors = ["#ffd22a", "#ff6588", "#2bd4bd", "#58c7ff", "#ff9d1d"];
    for (let i = 0; i < 18; i += 1) {
        const piece = document.createElement("i");
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.background = colors[i % colors.length];
        piece.style.animationDelay = `${Math.random() * 0.25}s`;
        confetti.appendChild(piece);
    }
    setTimeout(() => {
        confetti.innerHTML = "";
    }, 2100);
}

function escapeAttr(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeText(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

render();
