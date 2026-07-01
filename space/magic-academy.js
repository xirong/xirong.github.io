/**
 * 智天宇宙魔法学院 - 太阳系新生区
 * 主流程：勋章地图 → 汉字点亮 → 英文点读 → 10 道数学 → 观测确认 → 领取勋章。
 */

// ============ 基础数据 ============
const academyData = window.MagicAcademyData || window.MagicAcademyDay1Data;
const missionSymbols = {
    badge: '章',
    story: '文',
    hanzi: '字',
    english: 'EN',
    math: '10',
    'star-size': '星'
};

let scene;
let camera;
let renderer;
let controls;
let raycaster;
let pointer;
let academyBodyGroup;
let starfield;
let animationFrameId;

let state = loadState();
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
        playMissionAudio(getCurrentMission());
    });
    document.getElementById('resetBtn').addEventListener('click', resetAcademy);
    document.getElementById('rewardContinueBtn').addEventListener('click', closeRewardModal);
}

// ============ 3D 场景 ============
function setupScene() {
    const container = document.getElementById('scene');
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020713, 0.0018);

    camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 1800);
    camera.position.set(0, 44, 116);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 72;
    controls.maxDistance = 180;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.28;

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    addLights();
    createStarfield();
    createAcademyBodies();

    renderer.domElement.addEventListener('click', handleSceneClick);
    window.addEventListener('resize', handleResize);
}

function addLights() {
    scene.add(new THREE.AmbientLight(0x9acfff, 0.52));

    const sunLight = new THREE.DirectionalLight(0xfff3c4, 1.85);
    sunLight.position.set(-48, 52, 76);
    scene.add(sunLight);

    const fill = new THREE.PointLight(0x67f1ff, 1.08, 260);
    fill.position.set(46, 24, 34);
    scene.add(fill);
}

function createStarfield() {
    const geometry = new THREE.BufferGeometry();
    const count = 1800;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
        const radius = 440 + Math.random() * 600;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starfield = new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.35,
            transparent: true,
            opacity: 0.84
        })
    );
    scene.add(starfield);
}

function createAcademyBodies() {
    const loader = new THREE.TextureLoader();
    academyBodyGroup = new THREE.Group();
    academyBodyGroup.name = 'academyBodies';

    academyData.missions.forEach((mission, index) => {
        const angle = index * Math.PI * 2 / academyData.missions.length - Math.PI / 2;
        const radius = mission.id === 'sun-badge' ? 0 : 42;
        const size = mission.id === 'sun-badge' ? 11 : 5.2;
        const material = new THREE.MeshStandardMaterial({
            map: loader.load(mission.texture),
            roughness: 0.72,
            metalness: 0.02,
            emissive: mission.id === 'sun-badge' ? new THREE.Color(0xff8a22) : new THREE.Color(0x000000),
            emissiveIntensity: mission.id === 'sun-badge' ? 0.32 : 0
        });
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 56, 56), material);
        mesh.name = mission.id;
        mesh.userData.missionId = mission.id;
        mesh.position.set(Math.cos(angle) * radius, Math.sin(index * 0.8) * 5, Math.sin(angle) * radius);
        academyBodyGroup.add(mesh);

        if (mission.id !== 'sun-badge') {
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(size + 1.15, 0.035, 8, 72),
                new THREE.MeshBasicMaterial({
                    color: 0x67f1ff,
                    transparent: true,
                    opacity: 0.24
                })
            );
            ring.rotation.x = Math.PI / 2;
            ring.position.copy(mesh.position);
            academyBodyGroup.add(ring);
        }
    });

    scene.add(academyBodyGroup);
    updateAcademyBodyState();
}

function animate() {
    animationFrameId = requestAnimationFrame(animate);
    const elapsed = performance.now() * 0.001;

    if (academyBodyGroup) {
        academyBodyGroup.rotation.y += 0.0016;
        academyBodyGroup.children.forEach(child => {
            if (child.isMesh && child.geometry.type === 'SphereGeometry') {
                child.rotation.y += child.name === 'sun-badge' ? 0.002 : 0.0036;
                const mission = academyData.missions.find(item => item.id === child.userData.missionId);
                if (mission && mission.id === getCurrentMission()?.id) {
                    child.position.y += Math.sin(elapsed * 2.2) * 0.006;
                }
            }
        });
    }

    if (starfield) starfield.rotation.y += 0.00025;
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

    const hits = raycaster.intersectObjects(academyBodyGroup.children, true);
    if (!hits.length) return;

    const missionId = hits[0].object.userData.missionId;
    const mission = academyData.missions.find(item => item.id === missionId);
    if (!mission) return;

    const index = academyData.missions.findIndex(item => item.id === mission.id);
    if (index >= 0) {
        state.currentMissionIndex = index;
        saveState();
        renderProgress();
        renderCurrentMission();
        showToast(`已切换到${mission.title}`);
    }
}

// ============ 任务渲染 ============
function renderCurrentMission() {
    const mission = getCurrentMission();
    const titleEl = document.getElementById('missionTitle');
    const instructionEl = document.getElementById('missionInstruction');
    const body = document.getElementById('missionBody');

    if (!mission) {
        titleEl.textContent = '太阳系新生区完成';
        instructionEl.textContent = academyData.completionText;
        body.innerHTML = renderComplete();
        bindMissionEvents(null);
        renderProgress();
        updateAcademyBodyState();
        return;
    }

    titleEl.textContent = mission.title;
    instructionEl.textContent = mission.instruction || '完成任务，领取太阳系勋章。';
    body.innerHTML = renderMission(mission);
    bindMissionEvents(mission);
    renderProgress();
    updateAcademyBodyState();
}

function renderMission(mission) {
    if (mission.type === 'badge') return renderBadgeMission(mission);
    return '';
}

function renderBadgeMission(mission) {
    const progress = getBadgeProgress(mission.id);
    const learnedChars = progress.chars.length;
    const learnedEnglish = progress.english.length;
    const correctMath = progress.mathCorrect.length;
    const mathQuestion = getCurrentBadgeMathQuestion(mission);
    const canClaim = canClaimBadge(mission);

    return `
        <article class="mission-card active badge-mission">
            <section class="badge-hero">
                <div class="badge-planet" style="background-image:url('${mission.texture}')"></div>
                <div class="badge-copy">
                    <div class="badge-kicker">太阳系新生区</div>
                    <h3>${escapeHtml(mission.targetName)} <span>${escapeHtml(mission.targetNameEn)}</span></h3>
                    ${mission.lines.map(line => `<p>${escapeHtml(line)}</p>`).join('')}
                    <a class="inline-link" href="${mission.observeLink}" target="_blank" rel="noopener">去太阳系页面找它</a>
                </div>
            </section>

            <div class="badge-meters">
                ${renderMeter('汉字', learnedChars, mission.chars.length)}
                ${renderMeter('英文', learnedEnglish, mission.english.length)}
                ${renderMeter('数学', correctMath, mission.questions.length)}
                ${renderMeter('观测', progress.observed ? 1 : 0, 1)}
            </div>

            <section class="task-section">
                <div class="section-title">
                    <h3>认一认</h3>
                    <span>${learnedChars}/${mission.chars.length}</span>
                </div>
                <div class="hanzi-grid">
                    ${mission.chars.map(item => renderCharButton(mission, item, progress)).join('')}
                </div>
            </section>

            <section class="task-section">
                <div class="section-title">
                    <h3>英文名</h3>
                    <span>${learnedEnglish}/${mission.english.length}</span>
                </div>
                <div class="english-grid">
                    ${mission.english.map((item, index) => renderEnglishButton(mission, item, index, progress)).join('')}
                </div>
            </section>

            <section class="task-section">
                <div class="section-title">
                    <h3>算一算</h3>
                    <span>${correctMath}/${mission.questions.length}</span>
                </div>
                ${renderMathBlock(mission, mathQuestion, progress)}
            </section>

            <section class="task-section observe-task${progress.observed ? ' done' : ''}">
                <div>
                    <h3>找一找</h3>
                    <p>去太阳系页面或在背景星图里找到「${escapeHtml(mission.targetName)}」，再回来确认观测。</p>
                </div>
                <button class="secondary-btn observe-btn" data-action="observe">${progress.observed ? '已观测' : '我找到了'}</button>
            </section>

            <button class="primary-btn" id="claimBadgeBtn" ${canClaim ? '' : 'disabled'}>
                ${canClaim ? `领取${escapeHtml(mission.title)}` : '完成四项任务后领奖'}
            </button>
        </article>
    `;
}

function renderMeter(label, value, total) {
    const percent = total ? Math.round(value / total * 100) : 0;
    return `
        <div class="badge-meter">
            <div class="meter-label"><span>${label}</span><strong>${value}/${total}</strong></div>
            <div class="meter-track"><div class="meter-fill" style="width:${percent}%"></div></div>
        </div>
    `;
}

function renderCharButton(mission, item, progress) {
    const learned = progress.chars.includes(item.char);
    return `
        <button class="hanzi-tile${learned ? ' learned' : ''}" data-action="char" data-char="${escapeAttr(item.char)}">
            <span class="hanzi-char">${escapeHtml(item.char)}</span>
            <span class="hanzi-pinyin">${escapeHtml(item.pinyin)}</span>
            <span class="hanzi-words">${escapeHtml(item.words)}</span>
        </button>
    `;
}

function renderEnglishButton(mission, item, index, progress) {
    const learned = progress.english.includes(item.word);
    return `
        <button class="english-tile${learned ? ' learned' : ''}" data-action="english" data-english-index="${index}">
            <span class="english-main">${escapeHtml(item.word)}</span>
            <span class="english-cn">${escapeHtml(item.cn)}</span>
        </button>
    `;
}

function renderMathBlock(mission, question, progress) {
    if (!question) {
        return `
            <div class="math-question complete-math">
                <h3>10 道能量题已经全部答对</h3>
                <p>数学补给完成，可以继续观测和领奖。</p>
            </div>
        `;
    }

    const index = mission.questions.findIndex(item => item.id === question.id);
    const options = makeAnswerOptions(question.answer).map(value => `
        <button class="option-btn" data-action="math-answer" data-answer="${value}">${value}</button>
    `).join('');

    return `
        <div class="rocket-meter"><div class="rocket-fill" style="width:${Math.round(progress.mathCorrect.length / mission.questions.length * 100)}%"></div></div>
        <div class="math-question">
            <div class="math-meta">第 ${index + 1}/${mission.questions.length} 题</div>
            <h3>${escapeHtml(question.question)}</h3>
            <div class="expression">${escapeHtml(question.expression)} = ?</div>
            <div class="option-row wide">${options}</div>
            <div class="feedback" id="mathFeedback">先心算，再选择正确数字。</div>
        </div>
    `;
}

function renderComplete() {
    return `
        <div class="complete-card">
            <h3>太阳系新生区完成</h3>
            <p>${escapeHtml(academyData.completionText)}</p>
            <button class="primary-btn" id="reviewBtn">再看一次勋章册</button>
        </div>
    `;
}

function bindMissionEvents(mission) {
    if (!mission) {
        const reviewBtn = document.getElementById('reviewBtn');
        if (reviewBtn) reviewBtn.addEventListener('click', () => showToast('勋章都在左下角的新生勋章册里。'));
        return;
    }

    document.querySelectorAll('[data-action="char"]').forEach(button => {
        button.addEventListener('click', () => handleCharClick(mission, button.dataset.char));
    });

    document.querySelectorAll('[data-action="english"]').forEach(button => {
        button.addEventListener('click', () => {
            const item = mission.english[Number(button.dataset.englishIndex)];
            handleEnglishClick(mission, item);
        });
    });

    document.querySelectorAll('[data-action="math-answer"]').forEach(button => {
        button.addEventListener('click', () => handleBadgeMathAnswer(mission, button));
    });

    const observeButton = document.querySelector('[data-action="observe"]');
    if (observeButton) observeButton.addEventListener('click', () => handleObserve(mission));

    const claimButton = document.getElementById('claimBadgeBtn');
    if (claimButton) claimButton.addEventListener('click', () => completeMission(mission));
}

// ============ 交互逻辑 ============
function handleCharClick(mission, char) {
    const progress = getBadgeProgress(mission.id);
    const item = mission.chars.find(entry => entry.char === char);
    if (!item) return;

    progress.chars = unique([...progress.chars, char]);
    state.learnedChars = unique([...state.learnedChars, char]);
    saveState();
    playAudio(item.audio, `${item.char}，${item.pinyin}。${item.words}。${item.sentence}`);
    renderCurrentMission();
}

function handleEnglishClick(mission, item) {
    const progress = getBadgeProgress(mission.id);
    progress.english = unique([...progress.english, item.word]);
    state.learnedWords = unique([...state.learnedWords, item.word]);
    saveState();
    playAudio(item.audio, `${item.word}. ${item.sentence}`);
    renderCurrentMission();
}

function handleBadgeMathAnswer(mission, button) {
    const question = getCurrentBadgeMathQuestion(mission);
    if (!question) return;

    const selected = Number(button.dataset.answer);
    const feedback = document.getElementById('mathFeedback');
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(item => item.disabled = true);

    if (selected === question.answer) {
        const progress = getBadgeProgress(mission.id);
        progress.mathCorrect = unique([...progress.mathCorrect, question.id]);
        saveState();
        button.classList.add('correct');
        if (feedback) feedback.textContent = '答对啦，能量增加。';
        playAudio(question.audio, `${question.question}，答对啦。`);

        setTimeout(() => renderCurrentMission(), 650);
        return;
    }

    button.classList.add('wrong');
    if (feedback) feedback.textContent = question.hint || '再想一想，先不要急着点。';
    playAudio('', question.hint || '再试一次，智天可以的。');

    setTimeout(() => {
        optionButtons.forEach(item => {
            item.disabled = false;
            item.classList.remove('wrong');
        });
        if (feedback) feedback.textContent = '再试一次，智天可以的。';
    }, 850);
}

function handleObserve(mission) {
    const progress = getBadgeProgress(mission.id);
    progress.observed = true;
    saveState();
    playAudio(mission.audio, `已确认观测${mission.targetName}。`);
    renderCurrentMission();
    showToast(`${mission.targetName}观测完成`);
}

function completeMission(mission) {
    if (!canClaimBadge(mission)) {
        showToast('还差一点点，四项任务都完成后再领奖。');
        return;
    }

    if (!state.completedMissions.includes(mission.id)) {
        state.completedMissions.push(mission.id);
    }

    if (mission.rewardId && !state.rewards.includes(mission.rewardId)) {
        state.rewards.push(mission.rewardId);
        saveState();
        renderRewards();
        updateAcademyBodyState();
        showReward(mission.rewardId, `你获得了${mission.title}`);
        return;
    }

    saveState();
    goToNextMission();
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
    playAudio(reward.audio || '', fallbackText || reward.text);
}

function closeRewardModal() {
    document.getElementById('rewardModal').classList.remove('visible');
    goToNextMission();
}

// ============ 进度和奖励 ============
function renderProgress() {
    const container = document.getElementById('progressStrip');
    container.innerHTML = academyData.missions.map((mission, index) => {
        const done = state.completedMissions.includes(mission.id);
        const active = index === state.currentMissionIndex && !done;
        const progress = getBadgeProgress(mission.id);
        const total = mission.chars.length + mission.english.length + mission.questions.length + 1;
        const count = progress.chars.length + progress.english.length + progress.mathCorrect.length + (progress.observed ? 1 : 0);
        return `
            <button class="progress-node${done ? ' done' : ''}${active ? ' active' : ''}" data-index="${index}" title="${escapeAttr(mission.title)}">
                <div class="node-symbol">${missionSymbols[mission.type] || '•'}</div>
                <div class="node-label">${escapeHtml(mission.shortTitle)}</div>
                <div class="node-count">${count}/${total}</div>
            </button>
        `;
    }).join('');

    container.querySelectorAll('.progress-node').forEach(button => {
        button.addEventListener('click', () => {
            state.currentMissionIndex = Number(button.dataset.index);
            saveState();
            renderCurrentMission();
        });
    });
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
                <div class="reward-name">${earned ? escapeHtml(reward.name) : '未解锁'}</div>
            </div>
        `;
    }).join('');
}

function updateAcademyBodyState() {
    if (!academyBodyGroup) return;
    const current = getCurrentMission();

    academyBodyGroup.children.forEach(child => {
        if (!child.userData?.missionId) return;
        const missionId = child.userData.missionId;
        const done = state.completedMissions.includes(missionId);
        const active = current?.id === missionId;
        child.scale.setScalar(active ? 1.28 : done ? 1.08 : 0.88);
        if (child.material) {
            child.material.opacity = active || done ? 1 : 0.72;
            child.material.transparent = true;
        }
    });
}

function getCurrentMission() {
    return academyData.missions[state.currentMissionIndex] || null;
}

function getBadgeProgress(missionId) {
    if (!state.badgeProgress[missionId]) {
        state.badgeProgress[missionId] = {
            chars: [],
            english: [],
            mathCorrect: [],
            observed: false
        };
    }
    return state.badgeProgress[missionId];
}

function getCurrentBadgeMathQuestion(mission) {
    const progress = getBadgeProgress(mission.id);
    return mission.questions.find(question => !progress.mathCorrect.includes(question.id)) || null;
}

function canClaimBadge(mission) {
    const progress = getBadgeProgress(mission.id);
    return progress.chars.length >= mission.chars.length
        && progress.english.length >= mission.english.length
        && progress.mathCorrect.length >= mission.questions.length
        && progress.observed;
}

// ============ 音频 ============
function playMissionAudio(mission) {
    if (!mission) {
        playAudio('', academyData.completionText);
        return;
    }

    const text = [
        mission.title,
        ...(mission.lines || []),
        `本关需要认 ${mission.chars.length} 个汉字，读 ${mission.english.length} 个英文，完成 ${mission.questions.length} 道题。`
    ].join('。');
    playAudio(mission.audio, text);
}

function playAudio(path, fallbackText) {
    stopAudio();

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

function stopAudio() {
    Object.values(audioCache).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

function speak(text) {
    if (!text || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, ''));
    utterance.lang = 'zh-CN';
    utterance.rate = 0.88;
    utterance.pitch = 1.12;
    window.speechSynthesis.speak(utterance);
}

// ============ 状态 ============
function loadState() {
    const empty = {
        currentMissionIndex: 0,
        completedMissions: [],
        rewards: [],
        learnedChars: [],
        learnedWords: [],
        badgeProgress: {}
    };

    try {
        const saved = JSON.parse(localStorage.getItem(academyData.storageKey));
        if (!saved) return empty;
        const merged = { ...empty, ...saved };
        const nextIndex = academyData.missions.findIndex(mission => !merged.completedMissions.includes(mission.id));
        merged.currentMissionIndex = nextIndex === -1 ? academyData.missions.length : nextIndex;
        merged.badgeProgress = merged.badgeProgress || {};
        return merged;
    } catch (error) {
        return empty;
    }
}

function saveState() {
    localStorage.setItem(academyData.storageKey, JSON.stringify(state));
}

function resetAcademy() {
    localStorage.removeItem(academyData.storageKey);
    state = loadState();
    renderRewards();
    updateAcademyBodyState();
    renderCurrentMission();
    showToast('太阳系新生区已重置，可以重新闯关。');
}

// ============ 工具函数 ============
function makeAnswerOptions(answer) {
    const values = new Set([answer]);
    values.add(Math.max(0, answer - 1));
    values.add(Math.min(10, answer + 1));
    values.add(Math.max(0, answer - 2));
    values.add(Math.min(10, answer + 2));

    for (let value = 0; values.size < 6 && value <= 10; value++) {
        values.add(value);
    }

    return Array.from(values).sort((a, b) => a - b);
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

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
    return escapeHtml(value);
}

window.addEventListener('beforeunload', () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
});

document.addEventListener('DOMContentLoaded', init);
