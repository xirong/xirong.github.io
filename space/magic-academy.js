/**
 * 智天宇宙魔法学院 - 地球村第 1 天
 * 主流程：故事互动 → 汉字点亮 → 英语电台 → 数学补给 → 恒星比较奖励。
 */

// ============ 基础数据 ============
const academyData = window.MagicAcademyDay1Data;
const missionSymbols = {
    story: '🌍',
    hanzi: '字',
    english: 'EN',
    math: '10',
    'star-size': '⭐'
};

let scene;
let camera;
let renderer;
let controls;
let earthMesh;
let moonMesh;
let uranusMesh;
let neptuneMesh;
let starGroup;
let raycaster;
let pointer;
let animationFrameId;

let state = loadState();
let currentMathIndex = 0;
let beaconHits = new Set(state.beacons || []);
const audioCache = {};

// ============ 初始化 ============
function init() {
    setupScene();
    setupUI();
    renderProgress();
    renderRewards();
    renderCurrentMission();
    animate();
    playAudio(academyData.introAudio, academyData.introText);
}

function setupUI() {
    document.getElementById('listenBtn').addEventListener('click', () => {
        const mission = getCurrentMission();
        playMissionAudio(mission);
    });

    document.getElementById('resetBtn').addEventListener('click', resetDay);
    document.getElementById('rewardContinueBtn').addEventListener('click', closeRewardModal);

    document.querySelectorAll('.beacon').forEach(button => {
        button.addEventListener('click', () => handleBeaconClick(button));
    });
}

// ============ 3D 场景 ============
function setupScene() {
    const container = document.getElementById('scene');
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020713, 0.0018);

    camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 1600);
    camera.position.set(0, 38, 94);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 52;
    controls.maxDistance = 160;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    addLights();
    createStarfield();
    createEarthVillage();
    createRewardPlanets();
    createAlnitakStar();

    renderer.domElement.addEventListener('click', handleSceneClick);
    window.addEventListener('resize', handleResize);
}

function addLights() {
    scene.add(new THREE.AmbientLight(0x9acfff, 0.45));

    const sunLight = new THREE.DirectionalLight(0xfff3c4, 1.8);
    sunLight.position.set(-42, 46, 64);
    scene.add(sunLight);

    const fill = new THREE.PointLight(0x67f1ff, 1.1, 220);
    fill.position.set(32, 20, 32);
    scene.add(fill);
}

function createStarfield() {
    const geometry = new THREE.BufferGeometry();
    const count = 1600;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
        const radius = 420 + Math.random() * 520;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.35,
        transparent: true,
        opacity: 0.82
    });
    scene.add(new THREE.Points(geometry, material));
}

function createEarthVillage() {
    const loader = new THREE.TextureLoader();
    const earthTexture = loader.load('textures/earth_daymap.jpg');
    const cloudsTexture = loader.load('textures/earth_clouds.jpg');
    const moonTexture = loader.load('textures/moon.jpg');

    earthMesh = new THREE.Mesh(
        new THREE.SphereGeometry(18, 72, 72),
        new THREE.MeshStandardMaterial({
            map: earthTexture,
            roughness: 0.72,
            metalness: 0.02
        })
    );
    earthMesh.name = 'earth';
    earthMesh.position.set(-9, -4, 0);
    scene.add(earthMesh);

    const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(18.35, 72, 72),
        new THREE.MeshStandardMaterial({
            map: cloudsTexture,
            transparent: true,
            opacity: 0.34,
            depthWrite: false
        })
    );
    clouds.name = 'clouds';
    earthMesh.add(clouds);

    const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(19.2, 48, 48),
        new THREE.MeshBasicMaterial({
            color: 0x4bb8ff,
            transparent: true,
            opacity: 0.11,
            side: THREE.BackSide
        })
    );
    earthMesh.add(atmosphere);

    moonMesh = new THREE.Mesh(
        new THREE.SphereGeometry(4.4, 40, 40),
        new THREE.MeshStandardMaterial({
            map: moonTexture,
            roughness: 0.9
        })
    );
    moonMesh.name = 'moon';
    moonMesh.position.set(28, 8, -7);
    scene.add(moonMesh);

    createSignalRing();
}

function createSignalRing() {
    const group = new THREE.Group();
    group.name = 'signalRing';
    const colors = [0x67f1ff, 0xffd86b, 0x82f0a3];

    for (let i = 0; i < 3; i++) {
        const dot = new THREE.Mesh(
            new THREE.SphereGeometry(1.2, 20, 20),
            new THREE.MeshBasicMaterial({ color: colors[i] })
        );
        const angle = i * Math.PI * 2 / 3 + 0.4;
        dot.position.set(Math.cos(angle) * 24 - 9, Math.sin(angle) * 8 + 5, Math.sin(angle) * 11);
        dot.name = `beacon-${i}`;
        group.add(dot);
    }

    scene.add(group);
}

function createRewardPlanets() {
    const loader = new THREE.TextureLoader();
    uranusMesh = createPlanetMesh('uranus', 'textures/uranus.jpg', 5.2, [36, -7, -16], loader);
    neptuneMesh = createPlanetMesh('neptune', 'textures/neptune.jpg', 5.1, [48, 8, -24], loader);
    scene.add(uranusMesh);
    scene.add(neptuneMesh);
    updateRewardPlanetVisibility();
}

function createPlanetMesh(name, texturePath, size, position, loader) {
    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(size, 48, 48),
        new THREE.MeshStandardMaterial({
            map: loader.load(texturePath),
            roughness: 0.68
        })
    );
    mesh.name = name;
    mesh.position.set(position[0], position[1], position[2]);
    return mesh;
}

function createAlnitakStar() {
    starGroup = new THREE.Group();
    starGroup.name = 'alnitak';
    starGroup.visible = state.rewards.includes('alnitak-star');

    const core = new THREE.Mesh(
        new THREE.SphereGeometry(6.8, 48, 48),
        new THREE.MeshBasicMaterial({ color: 0x8bb7ff })
    );
    starGroup.add(core);

    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(9.6, 48, 48),
        new THREE.MeshBasicMaterial({
            color: 0x426cff,
            transparent: true,
            opacity: 0.22,
            side: THREE.BackSide
        })
    );
    starGroup.add(glow);
    starGroup.position.set(-42, 18, -18);
    scene.add(starGroup);
}

function animate() {
    animationFrameId = requestAnimationFrame(animate);
    const elapsed = performance.now() * 0.001;

    if (earthMesh) {
        earthMesh.rotation.y += 0.0016;
        const clouds = earthMesh.children.find(child => child.name === 'clouds');
        if (clouds) clouds.rotation.y += 0.0008;
    }

    if (moonMesh) {
        moonMesh.position.x = 28 + Math.cos(elapsed * 0.45) * 4;
        moonMesh.position.z = -7 + Math.sin(elapsed * 0.45) * 5;
        moonMesh.rotation.y += 0.002;
    }

    if (uranusMesh) uranusMesh.rotation.y += 0.002;
    if (neptuneMesh) neptuneMesh.rotation.y += 0.0024;
    if (starGroup) starGroup.rotation.y += 0.004;

    controls.update();
    renderer.render(scene, camera);
}

function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleSceneClick(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const targets = [earthMesh, moonMesh, uranusMesh, neptuneMesh, starGroup].filter(Boolean);
    const hits = raycaster.intersectObjects(targets, true);
    if (!hits.length) return;

    const root = findRootObject(hits[0].object);
    if (!root) return;

    const names = {
        earth: '地球村醒着呢，继续完成任务吧。',
        moon: '月亮在旁边陪智天完成第一天任务。',
        uranus: '这是你收集到的天王星冰蓝卡。',
        neptune: '这是你收集到的海王星深蓝卡。',
        alnitak: '参宿一出现了，它比太阳大很多。'
    };
    showToast(names[root.name] || '点到宇宙物体了。');
}

function findRootObject(object) {
    let current = object;
    while (current.parent && current.parent !== scene) current = current.parent;
    return current;
}

// ============ 任务渲染 ============
function renderCurrentMission() {
    const mission = getCurrentMission();
    const titleEl = document.getElementById('missionTitle');
    const instructionEl = document.getElementById('missionInstruction');
    const body = document.getElementById('missionBody');

    if (!mission) {
        titleEl.textContent = '地球村第 1 天完成';
        instructionEl.textContent = academyData.completionText;
        body.innerHTML = renderComplete();
        hideBeacons();
        return;
    }

    titleEl.textContent = mission.title;
    instructionEl.textContent = mission.instruction || mission.rewardText || '完成这个任务，收集宇宙奖励。';
    body.innerHTML = renderMission(mission);
    bindMissionEvents(mission);
    renderBeaconsForMission(mission);
    renderProgress();
}

function renderMission(mission) {
    if (mission.type === 'story') return renderStoryMission(mission);
    if (mission.type === 'hanzi') return renderHanziMission(mission);
    if (mission.type === 'english') return renderEnglishMission(mission);
    if (mission.type === 'math') return renderMathMission(mission);
    if (mission.type === 'star-size') return renderStarSizeMission(mission);
    return '';
}

function renderStoryMission(mission) {
    const lines = mission.lines.map(line => `<div class="story-line">${line}</div>`).join('');
    const disabled = beaconHits.size >= 3 ? '' : 'disabled';
    return `
        <article class="mission-card active">
            <div class="story-lines">${lines}</div>
            <div class="feedback" id="storyFeedback">已点亮 ${beaconHits.size}/3 颗信标</div>
            <button class="primary-btn" id="completeStoryBtn" ${disabled}>领取地球村通行卡</button>
        </article>
    `;
}

function renderHanziMission(mission) {
    return `
        <article class="mission-card active">
            <div class="word-card">
                <div class="big-char">${mission.char}</div>
                <div class="word-detail">
                    <h3>${mission.char} · ${mission.pinyin} · ${mission.english}</h3>
                    <p>${mission.words}</p>
                    <p>${mission.sentence}</p>
                </div>
            </div>
            <button class="primary-btn" id="completeHanziBtn">点亮「${mission.char}」这颗星</button>
        </article>
    `;
}

function renderEnglishMission(mission) {
    const words = mission.words.map((item, index) => `
        <div class="english-word">
            <div>
                <div class="word-main">${item.word}</div>
                <p>${item.cn}</p>
                <p class="sentence">${item.sentence}</p>
            </div>
            <button class="sound-btn" data-word-index="${index}" aria-label="播放 ${item.word}">▶</button>
        </div>
    `).join('');

    return `
        <article class="mission-card active">
            <div class="english-list">${words}</div>
            <button class="primary-btn" id="completeEnglishBtn">发射英语信号</button>
        </article>
    `;
}

function renderMathMission(mission) {
    currentMathIndex = Math.min(currentMathIndex, mission.questions.length - 1);
    const question = mission.questions[currentMathIndex];
    const options = question.options.map(value => `
        <button class="option-btn" data-answer="${value}">${value}</button>
    `).join('');

    const progress = Math.round((state.mathCorrect.length / mission.questions.length) * 100);
    return `
        <article class="mission-card active">
            <div class="rocket-meter"><div class="rocket-fill" id="rocketFill" style="width: ${progress}%"></div></div>
            <div class="math-question">
                <h3>${question.question}</h3>
                <div class="expression">${question.expression}</div>
                <div class="option-row">${options}</div>
                <div class="feedback" id="mathFeedback">第 ${currentMathIndex + 1}/${mission.questions.length} 题，给火箭加能量。</div>
            </div>
        </article>
    `;
}

function renderStarSizeMission(mission) {
    const dots = Array.from({ length: 36 }, (_, index) => {
        const angle = index * Math.PI * 2 / 36;
        const ring = index % 2 === 0 ? 38 : 68;
        const x = 50 + Math.cos(angle) * ring / 1.9;
        const y = 50 + Math.sin(angle) * ring / 2.25;
        return `<span class="sun-dot" style="--x:${x}%; --y:${y}%; animation-delay:${index * 0.018}s"></span>`;
    }).join('');

    return `
        <article class="mission-card active">
            <div class="star-compare">
                <h3>${mission.starName} ${mission.starNameEn}</h3>
                <p>${mission.sentence}</p>
                <div class="star-stage" id="starStage">
                    <div class="giant-star"></div>
                    ${dots}
                </div>
                <div class="star-number">${mission.capacityLabel}</div>
            </div>
            <button class="primary-btn" id="launchSunBtn">把小太阳弹进参宿一</button>
        </article>
    `;
}

function renderComplete() {
    return `
        <div class="complete-card">
            <h3>第一天完成</h3>
            <p>${academyData.completionText}</p>
            <button class="primary-btn" id="reviewBtn">再看一次奖励册</button>
        </div>
    `;
}

function bindMissionEvents(mission) {
    if (mission.type === 'story') {
        const button = document.getElementById('completeStoryBtn');
        if (button) button.addEventListener('click', () => completeMission(mission));
    }

    if (mission.type === 'hanzi') {
        document.getElementById('completeHanziBtn').addEventListener('click', () => {
            state.learnedChars = unique([...state.learnedChars, mission.char]);
            completeMission(mission);
        });
    }

    if (mission.type === 'english') {
        document.querySelectorAll('[data-word-index]').forEach(button => {
            button.addEventListener('click', () => {
                const item = mission.words[Number(button.dataset.wordIndex)];
                speak(`${item.word}. ${item.sentence}`);
            });
        });
        document.getElementById('completeEnglishBtn').addEventListener('click', () => {
            state.learnedWords = unique([...state.learnedWords, ...mission.words.map(item => item.word)]);
            completeMission(mission);
        });
    }

    if (mission.type === 'math') {
        document.querySelectorAll('.option-btn').forEach(button => {
            button.addEventListener('click', () => handleMathAnswer(mission, button));
        });
    }

    if (mission.type === 'star-size') {
        document.getElementById('launchSunBtn').addEventListener('click', () => {
            document.getElementById('starStage').classList.add('launched');
            playAudio(mission.audio, mission.sentence);
            setTimeout(() => completeMission(mission), 1250);
        });
    }

    const reviewBtn = document.getElementById('reviewBtn');
    if (reviewBtn) reviewBtn.addEventListener('click', () => showToast('奖励都在左下角的地球村奖励册里。'));
}

// ============ 交互逻辑 ============
function handleBeaconClick(button) {
    const mission = getCurrentMission();
    if (!mission || mission.type !== 'story') return;

    const index = Number(button.dataset.beacon);
    beaconHits.add(index);
    button.classList.add('done');
    button.textContent = '✓';
    state.beacons = Array.from(beaconHits);
    saveState();

    const feedback = document.getElementById('storyFeedback');
    if (feedback) feedback.textContent = `已点亮 ${beaconHits.size}/3 颗信标`;

    const completeButton = document.getElementById('completeStoryBtn');
    if (completeButton && beaconHits.size >= 3) {
        completeButton.disabled = false;
        showToast('地球村醒来了，可以领取通行卡。');
    } else {
        showToast('信标点亮了。');
    }
}

function handleMathAnswer(mission, button) {
    const question = mission.questions[currentMathIndex];
    const selected = Number(button.dataset.answer);
    const feedback = document.getElementById('mathFeedback');
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(item => item.disabled = true);

    if (selected === question.answer) {
        button.classList.add('correct');
        state.mathCorrect = unique([...state.mathCorrect, question.id]);
        saveState();
        updateRocketFill(mission);
        if (feedback) feedback.textContent = '答对啦，火箭能量增加。';
        playAudio(`${audioBaseForMath(question.id)}.mp3`, `${question.question}，答对啦。`);

        setTimeout(() => {
            if (state.mathCorrect.length >= mission.questions.length) {
                completeMission(mission);
                return;
            }
            currentMathIndex = findNextMathIndex(mission);
            renderCurrentMission();
        }, 650);
        return;
    }

    button.classList.add('wrong');
    const rightButton = Array.from(optionButtons).find(item => Number(item.dataset.answer) === question.answer);
    if (rightButton) rightButton.classList.add('correct');
    if (feedback) feedback.textContent = question.hint;
    playAudio(`${audioBaseForMath(question.id)}-hint.mp3`, question.hint);

    setTimeout(() => {
        optionButtons.forEach(item => {
            item.disabled = false;
            item.classList.remove('wrong', 'correct');
        });
        if (feedback) feedback.textContent = '再试一次，智天可以的。';
    }, 1000);
}

function updateRocketFill(mission) {
    const fill = document.getElementById('rocketFill');
    if (!fill) return;
    const progress = Math.round((state.mathCorrect.length / mission.questions.length) * 100);
    fill.style.width = `${progress}%`;
}

function findNextMathIndex(mission) {
    return mission.questions.findIndex(question => !state.mathCorrect.includes(question.id));
}

function completeMission(mission) {
    if (!state.completedMissions.includes(mission.id)) {
        state.completedMissions.push(mission.id);
    }

    if (mission.rewardId && !state.rewards.includes(mission.rewardId)) {
        state.rewards.push(mission.rewardId);
        saveState();
        renderRewards();
        updateRewardPlanetVisibility();
        showReward(mission.rewardId, mission.rewardText);
    } else {
        saveState();
        goToNextMission();
    }
}

function goToNextMission() {
    const nextIndex = academyData.missions.findIndex(mission => !state.completedMissions.includes(mission.id));
    state.currentMissionIndex = nextIndex === -1 ? academyData.missions.length : nextIndex;
    saveState();
    renderProgress();
    renderCurrentMission();

    const nextMission = getCurrentMission();
    if (nextMission) playMissionAudio(nextMission);
}

function showReward(rewardId, fallbackText) {
    const reward = academyData.rewards.find(item => item.id === rewardId);
    if (!reward) {
        goToNextMission();
        return;
    }

    const preview = document.getElementById('rewardPreview');
    preview.className = `reward-preview${reward.kind === 'star' ? ' star' : ''}`;
    if (reward.texture) {
        preview.style.backgroundImage = `url("${reward.texture}")`;
        preview.style.backgroundSize = 'cover';
        preview.style.backgroundPosition = 'center';
    } else {
        preview.style.backgroundImage = '';
    }

    document.getElementById('rewardTitle').textContent = reward.title;
    document.getElementById('rewardDesc').textContent = reward.text;
    document.getElementById('rewardModal').classList.add('visible');
    playAudio(`${audioBaseForReward(rewardId)}.mp3`, fallbackText || reward.text);
}

function closeRewardModal() {
    document.getElementById('rewardModal').classList.remove('visible');
    goToNextMission();
}

function renderBeaconsForMission(mission) {
    document.querySelectorAll('.beacon').forEach(button => {
        button.classList.toggle('visible', mission.type === 'story');
        const index = Number(button.dataset.beacon);
        button.classList.toggle('done', beaconHits.has(index));
        button.textContent = beaconHits.has(index) ? '✓' : String(index + 1);
    });
}

function hideBeacons() {
    document.querySelectorAll('.beacon').forEach(button => button.classList.remove('visible'));
}

function updateRewardPlanetVisibility() {
    if (uranusMesh) uranusMesh.visible = state.rewards.includes('uranus-card');
    if (neptuneMesh) neptuneMesh.visible = state.rewards.includes('neptune-card');
    if (starGroup) starGroup.visible = state.rewards.includes('alnitak-star');
}

// ============ 进度和奖励 ============
function renderProgress() {
    const container = document.getElementById('progressStrip');
    container.innerHTML = academyData.missions.map((mission, index) => {
        const done = state.completedMissions.includes(mission.id);
        const active = index === state.currentMissionIndex && !done;
        return `
            <div class="progress-node${done ? ' done' : ''}${active ? ' active' : ''}">
                <div class="node-symbol">${missionSymbols[mission.type] || '•'}</div>
                <div class="node-label">${mission.shortTitle}</div>
            </div>
        `;
    }).join('');
}

function renderRewards() {
    const container = document.getElementById('rewardGrid');
    container.innerHTML = academyData.rewards.map(reward => {
        const earned = state.rewards.includes(reward.id);
        const textureStyle = earned && reward.texture
            ? `style="background-image:url('${reward.texture}');background-size:cover;background-position:center"`
            : '';
        return `
            <div class="reward-chip${earned ? ' earned' : ''}">
                <div class="reward-orb${reward.kind === 'star' ? ' star' : ''}" ${textureStyle}></div>
                <div class="reward-name">${earned ? reward.name : '未解锁'}</div>
            </div>
        `;
    }).join('');
}

function getCurrentMission() {
    return academyData.missions[state.currentMissionIndex] || null;
}

// ============ 音频 ============
function playMissionAudio(mission) {
    if (!mission) {
        playAudio('', academyData.completionText);
        return;
    }

    let text = mission.title;
    if (mission.lines) text = mission.lines.join('。');
    if (mission.type === 'hanzi') text = `${mission.char}，${mission.pinyin}，${mission.words}。${mission.sentence}`;
    if (mission.type === 'english') text = mission.words.map(item => `${item.word}. ${item.sentence}`).join(' ');
    if (mission.type === 'math') text = '火箭补给站，完成五道十以内加减法。';
    if (mission.type === 'star-size') text = mission.sentence;

    playAudio(mission.audio, text);
}

function playAudio(path, fallbackText) {
    if (!path) {
        speak(fallbackText);
        return;
    }

    let audio = audioCache[path];
    if (!audio) {
        audio = new Audio(path);
        audioCache[path] = audio;
    }

    audio.currentTime = 0;
    audio.onerror = () => speak(fallbackText);
    audio.play().catch(() => speak(fallbackText));
}

function speak(text) {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, ''));
    utterance.lang = /[a-zA-Z]/.test(text) ? 'zh-CN' : 'zh-CN';
    utterance.rate = 0.88;
    utterance.pitch = 1.12;
    window.speechSynthesis.speak(utterance);
}

function audioBaseForMath(id) {
    return `audio/magic-academy/day1/math-${id}`;
}

function audioBaseForReward(id) {
    return `audio/magic-academy/day1/reward-${id}`;
}

// ============ 状态 ============
function loadState() {
    const empty = {
        currentMissionIndex: 0,
        completedMissions: [],
        rewards: [],
        learnedChars: [],
        learnedWords: [],
        mathCorrect: [],
        beacons: []
    };

    try {
        const saved = JSON.parse(localStorage.getItem(academyData.storageKey));
        if (!saved) return empty;
        const merged = { ...empty, ...saved };
        const nextIndex = academyData.missions.findIndex(mission => !merged.completedMissions.includes(mission.id));
        merged.currentMissionIndex = nextIndex === -1 ? academyData.missions.length : nextIndex;
        return merged;
    } catch (error) {
        return empty;
    }
}

function saveState() {
    localStorage.setItem(academyData.storageKey, JSON.stringify(state));
}

function resetDay() {
    localStorage.removeItem(academyData.storageKey);
    state = loadState();
    currentMathIndex = 0;
    beaconHits = new Set();
    renderRewards();
    updateRewardPlanetVisibility();
    renderCurrentMission();
    showToast('第 1 天已重置，可以重新玩。');
}

function unique(items) {
    return Array.from(new Set(items));
}

function showToast(text) {
    const toast = document.getElementById('toast');
    toast.textContent = text;
    toast.classList.add('visible');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('visible'), 1800);
}

window.addEventListener('beforeunload', () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
});

document.addEventListener('DOMContentLoaded', init);
