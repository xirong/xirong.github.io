// ============================================================
// 和谐号 G879 高铁体验 · 北京南→德州东→济南东
// 8阶段状态机:
// MAP → STATION_BJS → BOARDING_WALK → CABIN_SEATING → DRIVING
// → ARRIVING → CABIN_ALIGHT → ARRIVED
// ============================================================

(function () {
    'use strict';

    // ============ 应用状态 ============
    const Phase = {
        MAP: 'MAP',
        STATION_BJS: 'STATION_BJS',
        BOARDING_WALK: 'BOARDING_WALK',
        CABIN_SEATING: 'CABIN_SEATING',
        DRIVING: 'DRIVING',
        ARRIVING: 'ARRIVING',
        CABIN_ALIGHT: 'CABIN_ALIGHT',
        ARRIVED: 'ARRIVED'
    };
    let phase = Phase.MAP;

    // ============ 路线配置 ============
    const ROUTE = [
        { name: '北京南', km: 0 },
        { name: '德州东', km: 315 },
        { name: '济南东', km: 406 }
    ];
    const TOTAL_DISTANCE = 406;
    const CRUISE_SPEED = 300;
    const TIME_COMPRESSION = 35;
    const SPEED_FACTOR_MIN = 0.6;
    const SPEED_FACTOR_MAX = 1.8;
    const SPEED_FACTOR_STEP = 0.1;
    const DEZHOU_KM = 315;

    // ============ 3D 配置 ============
    const CONFIG = {
        trackLength: 600,
        trackWidth: 3.6,
        railGauge: 1.435,
        sleeperSpacing: 2.5,
        poleSpacing: 50,
    };

    // ============ 音频系统 ============
    const audioCache = {};
    let _currentAudio = null;
    const AUDIO_BASE = 'audio/train/';
    const AUDIO_PATHS = {
        welcome: AUDIO_BASE + 'welcome.mp3',
        boarding: AUDIO_BASE + 'boarding.mp3',
        depart: AUDIO_BASE + 'depart.mp3',
        'speed-200': AUDIO_BASE + 'speed-200.mp3',
        'speed-300': AUDIO_BASE + 'speed-300.mp3',
        'arriving-dezhou': AUDIO_BASE + 'arriving-dezhou.mp3',
        'dezhou-stop': AUDIO_BASE + 'dezhou-stop.mp3',
        'dezhou-depart': AUDIO_BASE + 'dezhou-depart.mp3',
        'arriving-jinan': AUDIO_BASE + 'arriving-jinan.mp3',
        arrived: AUDIO_BASE + 'arrived.mp3',
    };
    const AUDIO_FALLBACK = {
        welcome: '欢迎乘坐G879次列车！本次列车由北京南开往济南东，沿途停靠德州东。',
        boarding: '旅客您好，G879次列车即将开车，请抓紧时间上车。',
        depart: '各位旅客，列车出发了！请坐好扶稳！',
        'speed-200': '现在时速200公里！',
        'speed-300': '哇，300公里每小时了！这就是高铁的速度！',
        'arriving-dezhou': '前方到站，德州东。',
        'dezhou-stop': '德州东站到了。',
        'dezhou-depart': '德州东站开车，下一站，济南东。',
        'arriving-jinan': '前方终点站，济南东。',
        arrived: '济南东站到了！全程406公里，感谢您乘坐G879次列车！',
    };

    function stopCurrentAudio() {
        if (_currentAudio) {
            _currentAudio.pause();
            _currentAudio.currentTime = 0;
            _currentAudio = null;
        }
        if ('speechSynthesis' in window) speechSynthesis.cancel();
    }

    function speak(text) {
        if (!('speechSynthesis' in window)) return;
        speechSynthesis.cancel();
        setTimeout(() => {
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'zh-CN';
            u.rate = 0.85;
            u.pitch = 1.15;
            speechSynthesis.speak(u);
        }, 50);
    }

    function playAudio(key, onEnd) {
        stopCurrentAudio();
        const path = AUDIO_PATHS[key];
        const fallback = AUDIO_FALLBACK[key];
        if (!path) { if (onEnd) onEnd(); return; }

        let audio = audioCache[path];
        if (!audio) {
            audio = new Audio(path);
            audioCache[path] = audio;
        }
        _currentAudio = audio;
        audio.currentTime = 0;

        audio.onended = () => {
            _currentAudio = null;
            if (onEnd) onEnd();
        };
        audio.onerror = () => {
            _currentAudio = null;
            speak(fallback);
            if (onEnd) setTimeout(onEnd, 3000);
        };
        audio.play().catch(() => {
            _currentAudio = null;
            speak(fallback);
            if (onEnd) setTimeout(onEnd, 3000);
        });
    }

    // ============ 旅程状态 ============
    let journeyDistance = 0;
    let journeyTime = 0;
    let currentSpeed = 0;
    let targetSpeed = 0;
    let speedMilestones = {};
    let speedFactor = 1.0;
    let isPaused = false;

    // 德州东停站状态
    let dezhouState = 'approaching'; // approaching | stopping | stopped | departing | passed
    const DEZHOU_APPROACH_KM = 20; // 距德州东20km开始减速
    const DEZHOU_STOP_DURATION = 4; // 停站4秒
    let dezhouStopTimer = 0;

    // ============ 3D 全局 ============
    let scene, camera, renderer;
    let envGroup, stationGroup, trainGroup, personGroup;
    let stationDoors = [];
    let currentView = 1;
    let lastTimestamp = 0;
    let animationId = null;
    let currentCutscene = null;
    let cutsceneStart = 0;
    let cabinSceneData = null;
    let controlsBound = false;
    let hasPlayedWelcome = false;

    // 小人动画
    let personLeftLeg, personRightLeg, personLeftArm, personRightArm;
    let personWalkTime = 0;
    let personTargetZ = 0;
    let personSpeed = 8; // 单位/秒

    // 地图与小地图
    let routeGeo = null;
    let mapProgressDot = null;
    let miniMapData = {
        svg: null,
        bgLine1: null,
        bgLine2: null,
        doneLine1: null,
        doneLine2: null,
        trainDot: null,
        stationDot1: null,
        stationDot2: null,
        stationDot3: null
    };

    // ============ DOM 元素 ============
    const $ = (id) => document.getElementById(id);
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    function showHint(text, duration) {
        const hint = $('phaseHint');
        hint.textContent = text;
        hint.classList.add('show');
        if (duration) {
            setTimeout(() => hint.classList.remove('show'), duration);
        }
    }

    function hideHint() {
        $('phaseHint').classList.remove('show');
    }

    function bindGlobalEvents() {
        if (controlsBound) return;
        controlsBound = true;
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('resize', onResize);
    }

    function phaseToStatusText() {
        if (phase === Phase.DRIVING) {
            if (isPaused) return '已暂停';
            if (dezhouState === 'stopped') return '停靠德州东';
            if (dezhouState === 'stopping') return '进站减速';
            if (dezhouState === 'departing') return '德州东发车';
            if (dezhouState === 'passed') return '驶向济南东';
            return '行驶中';
        }
        if (phase === Phase.CABIN_SEATING) return '06车 寻找05D';
        if (phase === Phase.CABIN_ALIGHT) return '准备下车';
        if (phase === Phase.ARRIVING) return '终点进站';
        if (phase === Phase.ARRIVED) return '已到达';
        return '准备中';
    }

    function updateStatusUI() {
        const statusEl = $('statusVal');
        const factorEl = $('factorVal');
        if (statusEl) statusEl.textContent = phaseToStatusText();
        if (factorEl) factorEl.textContent = `x${speedFactor.toFixed(1)}`;
    }

    // ============================================================
    //  阶段1: MAP — 地图界面
    // ============================================================

    async function initMap() {
        bindGlobalEvents();
        $('departBtn').onclick = onDepart;
        await loadSVGMap();
        updateRouteProgressVisuals(0);
        updateStatusUI();
        if (!hasPlayedWelcome) {
            hasPlayedWelcome = true;
            setTimeout(() => playAudio('welcome'), 500);
        }
    }

    async function loadSVGMap() {
        const container = $('mapContainer');
        const miniContainer = $('miniMapContainer');
        routeGeo = null;
        mapProgressDot = null;
        miniMapData = {
            svg: null,
            bgLine1: null,
            bgLine2: null,
            doneLine1: null,
            doneLine2: null,
            trainDot: null,
            stationDot1: null,
            stationDot2: null,
            stationDot3: null
        };

        try {
            const response = await fetch('../puzzle/china-map.svg');
            const svgText = await response.text();
            container.innerHTML = svgText;
            miniContainer.innerHTML = svgText;

            const svgEl = container.querySelector('svg');
            const miniSvgEl = miniContainer.querySelector('svg');
            if (!svgEl || !miniSvgEl) return;

            svgEl.setAttribute('viewBox', '0 0 595.28 504');
            svgEl.removeAttribute('width');
            svgEl.removeAttribute('height');
            miniSvgEl.setAttribute('viewBox', '0 0 595.28 504');
            miniSvgEl.removeAttribute('width');
            miniSvgEl.removeAttribute('height');

            const bjEl = svgEl.querySelector('.state.beijing');
            const sdEl = svgEl.querySelector('.state.shandong');
            if (bjEl) bjEl.classList.add('highlight-city');
            if (sdEl) sdEl.classList.add('highlight-city');

            routeGeo = addRouteOverlay(svgEl, bjEl, sdEl, false);
            if (routeGeo) {
                buildMiniMap(miniSvgEl, routeGeo);
            }
        } catch (e) {
            container.innerHTML = '<div style="color:#fff;text-align:center;padding:40px;">地图加载中...</div>';
            miniContainer.innerHTML = '';
        }
    }

    function addRouteOverlay(svgEl, bjEl, sdEl, forMiniMap) {
        if (!bjEl || !sdEl) return null;

        const bjBox = bjEl.getBBox();
        const sdBox = sdEl.getBBox();
        const bjCx = bjBox.x + bjBox.width / 2;
        const bjCy = bjBox.y + bjBox.height / 2 + 4;

        // 德州东大约在山东北部
        const dzCx = sdBox.x + sdBox.width * 0.35;
        const dzCy = sdBox.y + sdBox.height * 0.15;
        // 济南东大约在山东中部偏北
        const jnCx = sdBox.x + sdBox.width * 0.45;
        const jnCy = sdBox.y + sdBox.height * 0.3;

        const ns = 'http://www.w3.org/2000/svg';

        addSvgLine(svgEl, ns, bjCx, bjCy, dzCx, dzCy, 'route-glow');
        addSvgLine(svgEl, ns, bjCx, bjCy, dzCx, dzCy, 'route-line');
        addSvgLine(svgEl, ns, dzCx, dzCy, jnCx, jnCy, 'route-glow');
        addSvgLine(svgEl, ns, dzCx, dzCy, jnCx, jnCy, 'route-line');

        addCityMarker(svgEl, ns, bjCx, bjCy, '北京南', '', -12);
        addCityMarker(svgEl, ns, dzCx, dzCy, '德州东', 'mid-label', -12);
        addCityMarker(svgEl, ns, jnCx, jnCy, '济南东', 'dest-label', 16);

        if (!forMiniMap) {
            mapProgressDot = document.createElementNS(ns, 'circle');
            mapProgressDot.setAttribute('r', '4.5');
            mapProgressDot.setAttribute('fill', '#ffeb3b');
            mapProgressDot.setAttribute('stroke', '#ff5252');
            mapProgressDot.setAttribute('stroke-width', '1.8');
            mapProgressDot.setAttribute('cx', bjCx);
            mapProgressDot.setAttribute('cy', bjCy);
            svgEl.appendChild(mapProgressDot);
        }

        return {
            bj: { x: bjCx, y: bjCy },
            dz: { x: dzCx, y: dzCy },
            jn: { x: jnCx, y: jnCy }
        };
    }

    function addSvgLine(svgEl, ns, x1, y1, x2, y2, cls) {
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', x1); line.setAttribute('y1', y1);
        line.setAttribute('x2', x2); line.setAttribute('y2', y2);
        if (cls) line.setAttribute('class', cls);
        svgEl.appendChild(line);
        return line;
    }

    function addCityMarker(svgEl, ns, cx, cy, name, labelClass, yOffset) {
        const dot = document.createElementNS(ns, 'circle');
        dot.setAttribute('cx', cx); dot.setAttribute('cy', cy);
        dot.setAttribute('r', '4');
        dot.setAttribute('class', 'city-dot');
        svgEl.appendChild(dot);

        const label = document.createElementNS(ns, 'text');
        label.setAttribute('x', cx);
        label.setAttribute('y', cy + yOffset);
        label.setAttribute('class', 'city-label ' + labelClass);
        label.textContent = name;
        svgEl.appendChild(label);
    }

    function buildMiniMap(miniSvgEl, geo) {
        const ns = 'http://www.w3.org/2000/svg';
        miniSvgEl.querySelectorAll('.state').forEach((el) => {
            el.style.fill = 'rgba(255,255,255,0.10)';
            el.style.stroke = 'rgba(255,255,255,0.24)';
            el.style.strokeWidth = '0.35';
        });

        const pad = 34;
        const minX = Math.min(geo.bj.x, geo.dz.x, geo.jn.x) - pad;
        const minY = Math.min(geo.bj.y, geo.dz.y, geo.jn.y) - pad;
        const maxX = Math.max(geo.bj.x, geo.dz.x, geo.jn.x) + pad;
        const maxY = Math.max(geo.bj.y, geo.dz.y, geo.jn.y) + pad;
        miniSvgEl.setAttribute('viewBox', `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);

        miniMapData.svg = miniSvgEl;
        miniMapData.bgLine1 = addSvgLine(miniSvgEl, ns, geo.bj.x, geo.bj.y, geo.dz.x, geo.dz.y);
        miniMapData.bgLine2 = addSvgLine(miniSvgEl, ns, geo.dz.x, geo.dz.y, geo.jn.x, geo.jn.y);
        miniMapData.doneLine1 = addSvgLine(miniSvgEl, ns, geo.bj.x, geo.bj.y, geo.bj.x, geo.bj.y);
        miniMapData.doneLine2 = addSvgLine(miniSvgEl, ns, geo.dz.x, geo.dz.y, geo.dz.x, geo.dz.y);

        [miniMapData.bgLine1, miniMapData.bgLine2].forEach((line) => {
            line.setAttribute('stroke', 'rgba(255,255,255,0.35)');
            line.setAttribute('stroke-width', '2');
            line.setAttribute('stroke-dasharray', '4 4');
        });
        [miniMapData.doneLine1, miniMapData.doneLine2].forEach((line) => {
            line.setAttribute('stroke', '#64ffda');
            line.setAttribute('stroke-width', '3');
            line.setAttribute('stroke-linecap', 'round');
        });

        miniMapData.stationDot1 = document.createElementNS(ns, 'circle');
        miniMapData.stationDot1.setAttribute('cx', geo.bj.x);
        miniMapData.stationDot1.setAttribute('cy', geo.bj.y);
        miniMapData.stationDot1.setAttribute('r', '2.4');
        miniMapData.stationDot1.setAttribute('fill', '#4fc3f7');
        miniSvgEl.appendChild(miniMapData.stationDot1);

        miniMapData.stationDot2 = document.createElementNS(ns, 'circle');
        miniMapData.stationDot2.setAttribute('cx', geo.dz.x);
        miniMapData.stationDot2.setAttribute('cy', geo.dz.y);
        miniMapData.stationDot2.setAttribute('r', '2.2');
        miniMapData.stationDot2.setAttribute('fill', '#a5d6a7');
        miniSvgEl.appendChild(miniMapData.stationDot2);

        miniMapData.stationDot3 = document.createElementNS(ns, 'circle');
        miniMapData.stationDot3.setAttribute('cx', geo.jn.x);
        miniMapData.stationDot3.setAttribute('cy', geo.jn.y);
        miniMapData.stationDot3.setAttribute('r', '2.3');
        miniMapData.stationDot3.setAttribute('fill', '#ff8a65');
        miniSvgEl.appendChild(miniMapData.stationDot3);

        miniMapData.trainDot = document.createElementNS(ns, 'circle');
        miniMapData.trainDot.setAttribute('r', '3.2');
        miniMapData.trainDot.setAttribute('fill', '#ffeb3b');
        miniMapData.trainDot.setAttribute('stroke', '#f44336');
        miniMapData.trainDot.setAttribute('stroke-width', '1.1');
        miniSvgEl.appendChild(miniMapData.trainDot);

        updateMiniMapProgress(0);
    }

    function getRoutePointByDistance(distanceKm) {
        if (!routeGeo) return { x: 0, y: 0 };
        if (distanceKm <= DEZHOU_KM) {
            const t = clamp(distanceKm / DEZHOU_KM, 0, 1);
            return {
                x: lerp(routeGeo.bj.x, routeGeo.dz.x, t),
                y: lerp(routeGeo.bj.y, routeGeo.dz.y, t)
            };
        }
        const t = clamp((distanceKm - DEZHOU_KM) / (TOTAL_DISTANCE - DEZHOU_KM), 0, 1);
        return {
            x: lerp(routeGeo.dz.x, routeGeo.jn.x, t),
            y: lerp(routeGeo.dz.y, routeGeo.jn.y, t)
        };
    }

    function updateRouteProgressVisuals(distanceKm) {
        if (!routeGeo) return;
        const p = getRoutePointByDistance(distanceKm);
        if (mapProgressDot) {
            mapProgressDot.setAttribute('cx', p.x);
            mapProgressDot.setAttribute('cy', p.y);
        }
        updateMiniMapProgress(distanceKm);
    }

    function updateMiniMapProgress(distanceKm) {
        if (!routeGeo || !miniMapData.trainDot) return;
        const p = getRoutePointByDistance(distanceKm);
        miniMapData.trainDot.setAttribute('cx', p.x);
        miniMapData.trainDot.setAttribute('cy', p.y);

        const t1 = clamp(distanceKm / DEZHOU_KM, 0, 1);
        const l1x = lerp(routeGeo.bj.x, routeGeo.dz.x, t1);
        const l1y = lerp(routeGeo.bj.y, routeGeo.dz.y, t1);
        miniMapData.doneLine1.setAttribute('x1', routeGeo.bj.x);
        miniMapData.doneLine1.setAttribute('y1', routeGeo.bj.y);
        miniMapData.doneLine1.setAttribute('x2', l1x);
        miniMapData.doneLine1.setAttribute('y2', l1y);

        if (distanceKm > DEZHOU_KM) {
            const t2 = clamp((distanceKm - DEZHOU_KM) / (TOTAL_DISTANCE - DEZHOU_KM), 0, 1);
            const l2x = lerp(routeGeo.dz.x, routeGeo.jn.x, t2);
            const l2y = lerp(routeGeo.dz.y, routeGeo.jn.y, t2);
            miniMapData.doneLine2.setAttribute('x1', routeGeo.dz.x);
            miniMapData.doneLine2.setAttribute('y1', routeGeo.dz.y);
            miniMapData.doneLine2.setAttribute('x2', l2x);
            miniMapData.doneLine2.setAttribute('y2', l2y);
        } else {
            miniMapData.doneLine2.setAttribute('x1', routeGeo.dz.x);
            miniMapData.doneLine2.setAttribute('y1', routeGeo.dz.y);
            miniMapData.doneLine2.setAttribute('x2', routeGeo.dz.x);
            miniMapData.doneLine2.setAttribute('y2', routeGeo.dz.y);
        }
    }

    // ============================================================
    //  MAP → STATION 过渡
    // ============================================================

    function onDepart() {
        if (phase !== Phase.MAP) return;
        phase = Phase.STATION_BJS;
        isPaused = false;
        updateStatusUI();

        stopCurrentAudio();
        $('mapPhase').classList.add('zooming');
        $('miniMap').classList.remove('show');
        showHint('列车准备进站，欢迎来到北京南站！', 1500);

        setTimeout(() => {
            $('mapPhase').classList.add('hidden');
            initStationScene();
        }, 1200);
    }

    // ============================================================
    //  阶段2: STATION_BJS — 3D北京南站站台
    // ============================================================

    function initStationScene() {
        cleanupScene();
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x8a929d);
        scene.fog = new THREE.Fog(0x8a929d, 90, 340);

        camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.5, 760);
        camera.position.set(11.5, 4.5, 92);
        camera.lookAt(0, 2.0, -36);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.id = 'three-canvas';
        document.body.appendChild(renderer.domElement);

        const ambient = new THREE.AmbientLight(0x90a0b3, 0.78);
        scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.72);
        dirLight.position.set(56, 74, 26);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.set(2048, 2048);
        dirLight.shadow.camera.left = -100;
        dirLight.shadow.camera.right = 100;
        dirLight.shadow.camera.top = 120;
        dirLight.shadow.camera.bottom = -120;
        dirLight.shadow.camera.far = 300;
        scene.add(dirLight);

        const stationLightA = new THREE.PointLight(0xf7f2e4, 0.66, 210);
        stationLightA.position.set(0, 18, -12);
        scene.add(stationLightA);
        const stationLightB = new THREE.PointLight(0xf7f2e4, 0.66, 210);
        stationLightB.position.set(0, 18, 62);
        scene.add(stationLightB);

        stationGroup = new THREE.Group();
        scene.add(stationGroup);

        createStationBeijingSouth();
        createHexiehaoTrain();
        createPersonModel();
        setTrainDoorOpenRatio(0);
        $('miniMap').classList.remove('show');

        updateStatusUI();

        $('stationLabel').textContent = '北京南站';
        $('stationLabel').classList.add('show');
        showHint('北京南站发车前，先上 06 车，找到 05D！', 3600);

        playAudio('boarding');
        renderStation();

        setTimeout(() => {
            if (phase !== Phase.STATION_BJS) return;
            $('stationLabel').classList.remove('show');
            setTimeout(() => startBoarding(), 500);
        }, 4200);
    }

    function createStationBeijingSouth() {
        const platformLength = 320;
        const platformWidth = 16;
        const floorWidth = 66;
        const mainTrackX = 0;
        const oppositeTrackX = -10.5;

        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = 1024;
        tileCanvas.height = 1024;
        const tctx = tileCanvas.getContext('2d');
        tctx.fillStyle = '#b7bcc3';
        tctx.fillRect(0, 0, 1024, 1024);
        for (let i = 0; i <= 1024; i += 64) {
            tctx.strokeStyle = i % 128 === 0 ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.22)';
            tctx.lineWidth = 2;
            tctx.beginPath();
            tctx.moveTo(i, 0);
            tctx.lineTo(i, 1024);
            tctx.stroke();
            tctx.beginPath();
            tctx.moveTo(0, i);
            tctx.lineTo(1024, i);
            tctx.stroke();
        }

        const floorTexture = new THREE.CanvasTexture(tileCanvas);
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(22, 108);

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(floorWidth, platformLength + 26),
            new THREE.MeshStandardMaterial({
                map: floorTexture,
                color: 0xe4e8ee,
                roughness: 0.22,
                metalness: 0.03
            })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        stationGroup.add(floor);

        const platform = new THREE.Mesh(
            new THREE.BoxGeometry(platformWidth, 0.6, platformLength),
            new THREE.MeshStandardMaterial({ color: 0xa6adb7, roughness: 0.62, metalness: 0.08 })
        );
        platform.position.set(6.3, 0.3, 0);
        platform.receiveShadow = true;
        stationGroup.add(platform);

        const oppositePlatform = new THREE.Mesh(
            new THREE.BoxGeometry(10.4, 0.5, platformLength),
            new THREE.MeshStandardMaterial({ color: 0x9ca4af, roughness: 0.66, metalness: 0.05 })
        );
        oppositePlatform.position.set(-15.5, 0.25, 0);
        oppositePlatform.receiveShadow = true;
        stationGroup.add(oppositePlatform);

        const tactile = new THREE.Mesh(
            new THREE.BoxGeometry(0.9, 0.03, platformLength),
            new THREE.MeshStandardMaterial({ color: 0xe9be38, roughness: 0.58, metalness: 0.02 })
        );
        tactile.position.set(0.55, 0.62, 0);
        stationGroup.add(tactile);

        const sleeperMat = new THREE.MeshLambertMaterial({ color: 0x6c6f76 });
        const sleeperGeo = new THREE.BoxGeometry(2.3, 0.12, 0.26);
        const railGeo = new THREE.BoxGeometry(0.1, 0.2, platformLength);
        const railMat = new THREE.MeshStandardMaterial({ color: 0x8f949b, roughness: 0.3, metalness: 0.75 });

        for (const trackCenter of [mainTrackX, oppositeTrackX]) {
            const bed = new THREE.Mesh(
                new THREE.BoxGeometry(4.6, 0.3, platformLength + 8),
                new THREE.MeshLambertMaterial({ color: 0x565b64 })
            );
            bed.position.set(trackCenter, 0.08, 0);
            bed.receiveShadow = true;
            stationGroup.add(bed);

            for (const side of [-1, 1]) {
                const rail = new THREE.Mesh(railGeo, railMat);
                rail.position.set(trackCenter + side * (CONFIG.railGauge / 2), 0.45, 0);
                stationGroup.add(rail);
            }

            for (let z = -platformLength / 2; z < platformLength / 2; z += 2.6) {
                const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
                sleeper.position.set(trackCenter, 0.29, z);
                stationGroup.add(sleeper);
            }
        }

        const steelMat = new THREE.MeshStandardMaterial({ color: 0x6f7782, roughness: 0.44, metalness: 0.42 });
        const zSlots = [];
        for (let z = -140; z <= 140; z += 17.5) zSlots.push(z);
        const colGeo = new THREE.CylinderGeometry(0.28, 0.33, 15.5, 8);
        const beamGeo = new THREE.BoxGeometry(31, 0.38, 0.5);
        const braceGeo = new THREE.BoxGeometry(0.16, 0.16, 9.5);
        const topChordGeo = new THREE.BoxGeometry(31, 0.22, 0.22);
        const matrix = new THREE.Matrix4();

        const colMesh = new THREE.InstancedMesh(colGeo, steelMat, zSlots.length * 2);
        let idx = 0;
        for (const z of zSlots) {
            matrix.makeTranslation(14.2, 8.2, z);
            colMesh.setMatrixAt(idx++, matrix);
            matrix.makeTranslation(-14.2, 8.2, z);
            colMesh.setMatrixAt(idx++, matrix);
        }
        colMesh.castShadow = true;
        stationGroup.add(colMesh);

        const beamMesh = new THREE.InstancedMesh(beamGeo, steelMat, zSlots.length);
        const chordMesh = new THREE.InstancedMesh(topChordGeo, steelMat, zSlots.length);
        for (let i = 0; i < zSlots.length; i++) {
            matrix.makeTranslation(0, 15.9, zSlots[i]);
            beamMesh.setMatrixAt(i, matrix);
            matrix.makeTranslation(0, 18.4, zSlots[i]);
            chordMesh.setMatrixAt(i, matrix);
        }
        beamMesh.castShadow = true;
        stationGroup.add(beamMesh);
        stationGroup.add(chordMesh);

        const braceMesh = new THREE.InstancedMesh(braceGeo, steelMat, zSlots.length * 2);
        idx = 0;
        for (const z of zSlots) {
            matrix.makeRotationX(0.48);
            matrix.setPosition(8.6, 14.4, z);
            braceMesh.setMatrixAt(idx++, matrix);
            matrix.makeRotationX(-0.48);
            matrix.setPosition(-8.6, 14.4, z);
            braceMesh.setMatrixAt(idx++, matrix);
        }
        braceMesh.castShadow = true;
        stationGroup.add(braceMesh);

        const canopy = new THREE.Mesh(
            new THREE.PlaneGeometry(31.5, platformLength + 16),
            new THREE.MeshStandardMaterial({
                color: 0xcfdbe8,
                transparent: true,
                opacity: 0.36,
                roughness: 0.18,
                metalness: 0.05,
                side: THREE.DoubleSide
            })
        );
        canopy.rotation.x = -Math.PI / 2;
        canopy.position.set(0, 18.85, 0);
        stationGroup.add(canopy);

        const skylightMat = new THREE.MeshBasicMaterial({
            color: 0xe2f0ff,
            transparent: true,
            opacity: 0.28,
            side: THREE.DoubleSide
        });
        for (const x of [-9, -3, 3, 9]) {
            const strip = new THREE.Mesh(new THREE.PlaneGeometry(2.2, platformLength + 10), skylightMat);
            strip.rotation.x = -Math.PI / 2;
            strip.position.set(x, 18.92, 0);
            stationGroup.add(strip);
        }

        const ledCanvas = document.createElement('canvas');
        ledCanvas.width = 1024;
        ledCanvas.height = 256;
        const lctx = ledCanvas.getContext('2d');
        lctx.fillStyle = '#071b2d';
        lctx.fillRect(0, 0, 1024, 256);
        lctx.fillStyle = '#1f3a56';
        lctx.fillRect(10, 10, 1004, 236);
        lctx.font = 'bold 66px "Noto Sans SC", sans-serif';
        lctx.fillStyle = '#7cffc4';
        lctx.textAlign = 'center';
        lctx.textBaseline = 'middle';
        lctx.fillText('和谐号 G879 次列车', 512, 94);
        lctx.font = 'bold 46px "Noto Sans SC", sans-serif';
        lctx.fillStyle = '#ffe066';
        lctx.fillText('北京南 → 德州东 → 济南东', 512, 166);
        lctx.font = 'bold 34px "Noto Sans SC", sans-serif';
        lctx.fillStyle = '#7ec8ff';
        lctx.fillText('06车 05D 请尽快上车', 512, 214);
        const ledTexture = new THREE.CanvasTexture(ledCanvas);
        const ledMat = new THREE.MeshBasicMaterial({ map: ledTexture });
        for (const z of [34, -12, -62]) {
            const led = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 1.9), ledMat);
            led.position.set(12.2, 8.6, z);
            led.rotation.y = -Math.PI / 2 + 0.08;
            stationGroup.add(led);
        }

        const benchMat = new THREE.MeshLambertMaterial({ color: 0x3f5e89 });
        for (const z of [-100, -70, -40, -10, 20, 50]) {
            const bench = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.45, 0.55), benchMat);
            bench.position.set(9.1, 0.83, z);
            stationGroup.add(bench);
        }

        const passengerMat = new THREE.MeshLambertMaterial({ color: 0xe1e6ef });
        for (const p of [
            [9.6, 0.6, -76], [8.6, 0.6, -8], [9.8, 0.6, 26], [8.8, 0.6, 64]
        ]) {
            const avatar = new THREE.Group();
            const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.25, 8), passengerMat);
            torso.position.y = 0.78;
            avatar.add(torso);
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshLambertMaterial({ color: 0xf3d5bf }));
            head.position.y = 1.52;
            avatar.add(head);
            avatar.position.set(p[0], p[1], p[2]);
            stationGroup.add(avatar);
        }

        const farTrain = new THREE.Group();
        const farBodyMat = new THREE.MeshLambertMaterial({ color: 0xf3f4f6 });
        const farStripeMat = new THREE.MeshLambertMaterial({ color: 0x1f6ec9 });
        for (let i = 0; i < 5; i++) {
            const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 18), farBodyMat);
            body.position.set(0, 1.9, i * -18.6 + 56);
            farTrain.add(body);
            const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.16, 18.2), farStripeMat);
            stripe.position.set(0, 1.22, i * -18.6 + 56);
            farTrain.add(stripe);
        }
        farTrain.position.x = oppositeTrackX;
        stationGroup.add(farTrain);
    }

    function createHexiehaoTrain() {
        stationDoors = [];
        trainGroup = new THREE.Group();
        const carCount = 8;
        const carLength = 16;
        const carWidth = 2.4;
        const carHeight = 2.8;
        const gap = 0.3;

        for (let i = 0; i < carCount; i++) {
            const isHead = (i === 0);
            const isTail = (i === carCount - 1);
            const carNum = i + 1;
            const car = createHexiehaoCar(isHead, isTail, carLength, carWidth, carHeight, carNum);
            car.position.z = -i * (carLength + gap) + 55;
            if (car.userData.doorSet) stationDoors.push(car.userData.doorSet);
            trainGroup.add(car);
        }

        trainGroup.position.set(0, 1.2, 0);
        scene.add(trainGroup);
    }

    function createHexiehaoCar(isHead, isTail, length, width, height, carNum) {
        const group = new THREE.Group();
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0xf2f2f2 });
        const blueMat = new THREE.MeshLambertMaterial({ color: 0x1565c0 });
        const windowMat = new THREE.MeshLambertMaterial({ color: 0x5ba3e6, side: THREE.DoubleSide });
        const darkMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });

        if (isHead) {
            const bodyLen = length * 0.6;
            const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, bodyLen), bodyMat);
            body.position.z = -length * 0.2;
            body.castShadow = true;
            group.add(body);

            const nose = new THREE.Mesh(new THREE.CylinderGeometry(0, width / 2 * 0.85, length * 0.45, 12), bodyMat);
            nose.rotation.x = Math.PI / 2;
            nose.position.z = length * 0.35;
            nose.scale.set(1, 0.55, 1);
            nose.castShadow = true;
            group.add(nose);

            const vStripeGeo = new THREE.BoxGeometry(0.04, 1.8, length * 0.35);
            for (const side of [-1, 1]) {
                const vStripe = new THREE.Mesh(vStripeGeo, blueMat);
                vStripe.position.set(side * width * 0.35, -0.2, length * 0.05);
                vStripe.rotation.z = side * 0.25;
                vStripe.rotation.y = side * 0.15;
                group.add(vStripe);
            }

            const waist = new THREE.Mesh(
                new THREE.BoxGeometry(width + 0.04, 0.15, bodyLen + 0.04),
                blueMat
            );
            waist.position.y = -height * 0.3;
            waist.position.z = -length * 0.2;
            group.add(waist);

            addHexiehaoLabel(group, width, height, length);
            addG879Label(group, width, height, length, true);

            const ws = new THREE.Mesh(
                new THREE.BoxGeometry(width * 0.7, height * 0.35, 0.05),
                new THREE.MeshLambertMaterial({ color: 0x1a1a2a })
            );
            ws.position.set(0, 0.5, length * 0.1);
            group.add(ws);

            for (let wz = -length * 0.42; wz <= -length * 0.02; wz += 2.0) {
                addWindows(group, width, wz, windowMat);
            }

            const under = new THREE.Mesh(new THREE.BoxGeometry(width - 0.2, 0.4, bodyLen), darkMat);
            under.position.y = -height / 2 - 0.1;
            under.position.z = -length * 0.2;
            group.add(under);
        } else if (isTail) {
            const bodyLen = length * 0.6;
            const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, bodyLen), bodyMat);
            body.position.z = length * 0.2;
            body.castShadow = true;
            group.add(body);

            const nose = new THREE.Mesh(new THREE.CylinderGeometry(0, width / 2 * 0.85, length * 0.45, 12), bodyMat);
            nose.rotation.x = -Math.PI / 2;
            nose.position.z = -length * 0.35;
            nose.scale.set(1, 0.55, 1);
            nose.castShadow = true;
            group.add(nose);

            const waist = new THREE.Mesh(
                new THREE.BoxGeometry(width + 0.04, 0.15, bodyLen + 0.04),
                blueMat
            );
            waist.position.y = -height * 0.3;
            waist.position.z = length * 0.2;
            group.add(waist);

            for (let wz = length * 0.02; wz <= length * 0.42; wz += 2.0) {
                addWindows(group, width, wz, windowMat);
            }

            const under = new THREE.Mesh(new THREE.BoxGeometry(width - 0.2, 0.4, bodyLen), darkMat);
            under.position.y = -height / 2 - 0.1;
            under.position.z = length * 0.2;
            group.add(under);
        } else {
            const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, length), bodyMat);
            body.castShadow = true;
            group.add(body);

            const waist = new THREE.Mesh(new THREE.BoxGeometry(width + 0.04, 0.15, length + 0.04), blueMat);
            waist.position.y = -height * 0.3;
            group.add(waist);

            if (carNum === 6) {
                addCarNumberLabel(group, width, height, '06车', true);
                addSeatMarkerLabel(group, width, '05D');
                const doorSet = addDoor(group, width, height, length);
                group.userData.doorSet = doorSet;
            } else {
                addCarNumberLabel(group, width, height, `${String(carNum).padStart(2, '0')}车`, false);
            }

            if (carNum === 3 || carNum === 4) {
                addG879Label(group, width, height, length, true);
            }

            const winCount = Math.floor(length / 2.0) - 1;
            const startZ = -(winCount - 1) * 2.0 / 2;
            for (let w = 0; w < winCount; w++) {
                addWindows(group, width, startZ + w * 2.0, windowMat);
            }

            const divGeo = new THREE.BoxGeometry(width + 0.04, height + 0.02, 0.06);
            const divMat = new THREE.MeshLambertMaterial({ color: 0xdcdcdc });
            for (const zz of [length / 2, -length / 2]) {
                const div = new THREE.Mesh(divGeo, divMat);
                div.position.z = zz;
                group.add(div);
            }

            const under = new THREE.Mesh(new THREE.BoxGeometry(width - 0.2, 0.4, length), darkMat);
            under.position.y = -height / 2 - 0.1;
            group.add(under);
        }

        const roofLen = (isHead || isTail) ? length * 0.6 : length;
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(width - 0.3, 0.12, roofLen),
            new THREE.MeshLambertMaterial({ color: 0xe5e5e5 })
        );
        roof.position.y = height / 2 + 0.06;
        if (isHead) roof.position.z = -length * 0.2;
        if (isTail) roof.position.z = length * 0.2;
        group.add(roof);

        return group;
    }

    function addHexiehaoLabel(group, carWidth, carHeight, carLength) {
        const c = document.createElement('canvas');
        c.width = 1024; c.height = 256;
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.font = 'bold 136px "Noto Sans SC", sans-serif';
        ctx.lineWidth = 26;
        ctx.strokeStyle = 'rgba(255,255,255,0.92)';
        ctx.strokeText('和谐号', 512, 138);
        ctx.fillStyle = '#c31212';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('和谐号', 512, 138);

        const texture = new THREE.CanvasTexture(c);
        texture.anisotropy = 4;
        const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const geo = new THREE.PlaneGeometry(3.9, 0.98);

        for (const side of [-1, 1]) {
            const label = new THREE.Mesh(geo, side === -1 ? mat : mat.clone());
            label.position.set(side * (carWidth / 2 + 0.03), 0.26, -carLength * 0.15);
            label.rotation.y = side * Math.PI / 2;
            group.add(label);
        }
    }

    function addG879Label(group, carWidth, carHeight, carLength, compact) {
        const c = document.createElement('canvas');
        c.width = 1024; c.height = 256;
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.font = compact ? 'bold 90px "Noto Sans SC", sans-serif' : 'bold 96px "Noto Sans SC", sans-serif';
        ctx.lineWidth = 18;
        ctx.strokeStyle = 'rgba(255,255,255,0.88)';
        const txt = compact ? 'G879 次列车' : 'G879';
        ctx.strokeText(txt, 512, 132);
        ctx.fillStyle = '#1565c0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(txt, 512, 132);

        const texture = new THREE.CanvasTexture(c);
        texture.anisotropy = 4;
        const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const geo = new THREE.PlaneGeometry(compact ? 3.85 : 2.35, 0.82);

        for (const side of [-1, 1]) {
            const label = new THREE.Mesh(geo, side === -1 ? mat : mat.clone());
            label.position.set(side * (carWidth / 2 + 0.03), -0.52, -carLength * 0.15);
            label.rotation.y = side * Math.PI / 2;
            group.add(label);
        }
    }

    function addCarNumberLabel(group, carWidth, carHeight, numStr, isSpecial) {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 256;
        const ctx = c.getContext('2d');
        ctx.fillStyle = isSpecial ? '#1565c0' : '#444444';
        ctx.fillRect(0, 0, 512, 256);
        ctx.font = 'bold 122px "Noto Sans SC", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 8;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(numStr, 256, 128);
        ctx.fillText(numStr, 256, 128);

        const texture = new THREE.CanvasTexture(c);
        texture.anisotropy = 4;
        const mat = new THREE.MeshBasicMaterial({ map: texture });
        const geo = new THREE.PlaneGeometry(1.55, 0.7);

        for (const side of [-1, 1]) {
            const label = new THREE.Mesh(geo, side === -1 ? mat : mat.clone());
            label.position.set(side * (carWidth / 2 + 0.03), 0.84, 5.05);
            label.rotation.y = side * Math.PI / 2;
            group.add(label);
        }
    }

    function addSeatMarkerLabel(group, carWidth, seatText) {
        const c = document.createElement('canvas');
        c.width = 384;
        c.height = 160;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#0f5db4';
        ctx.fillRect(0, 0, 384, 160);
        ctx.font = 'bold 88px "Noto Sans SC", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(seatText, 192, 82);

        const texture = new THREE.CanvasTexture(c);
        const mat = new THREE.MeshBasicMaterial({ map: texture });
        const geo = new THREE.PlaneGeometry(1.2, 0.5);
        for (const side of [-1, 1]) {
            const label = new THREE.Mesh(geo, side === -1 ? mat : mat.clone());
            label.position.set(side * (carWidth / 2 + 0.03), 0.1, 4.7);
            label.rotation.y = side * Math.PI / 2;
            group.add(label);
        }
    }

    function addDoor(group, carWidth, carHeight, carLength) {
        const doorMat = new THREE.MeshLambertMaterial({ color: 0x8f959f });
        const leafGeo = new THREE.BoxGeometry(0.05, 2.15, 0.58);
        const rightLeaf = new THREE.Mesh(leafGeo, doorMat);
        const leftLeaf = new THREE.Mesh(leafGeo, doorMat);
        const doorX = carWidth / 2 + 0.03;
        const centerZ = 5;
        const halfGap = 0.31;

        leftLeaf.position.set(doorX, -0.18, centerZ - halfGap);
        rightLeaf.position.set(doorX, -0.18, centerZ + halfGap);
        group.add(leftLeaf);
        group.add(rightLeaf);

        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 2.3, 1.28),
            new THREE.MeshLambertMaterial({ color: 0xc8ced6 })
        );
        frame.position.set(doorX - 0.015, -0.16, centerZ);
        group.add(frame);

        return {
            left: leftLeaf,
            right: rightLeaf,
            leftClosed: centerZ - halfGap,
            rightClosed: centerZ + halfGap,
            leftOpen: centerZ - 0.78,
            rightOpen: centerZ + 0.78
        };
    }

    function setTrainDoorOpenRatio(ratio) {
        const t = clamp(ratio, 0, 1);
        stationDoors.forEach((door) => {
            door.left.position.z = lerp(door.leftClosed, door.leftOpen, t);
            door.right.position.z = lerp(door.rightClosed, door.rightOpen, t);
        });
    }

    function addWindows(group, carWidth, z, mat) {
        for (const side of [-1, 1]) {
            const winGeo = new THREE.BoxGeometry(0.02, 0.85, 1.1);
            const win = new THREE.Mesh(winGeo, mat);
            win.position.set(side * (carWidth / 2 + 0.01), 0.35, z);
            group.add(win);
        }
    }

    // ============ 小人模型 ============
    let personMaterials = []; // 所有小人材质，用于淡入淡出

    function setPersonOpacity(opacity) {
        personMaterials.forEach(mat => {
            mat.transparent = true;
            mat.opacity = opacity;
        });
    }

    function createPersonModel(startX, startY, startZ) {
        personGroup = new THREE.Group();
        personMaterials = [];

        const skinMat = new THREE.MeshLambertMaterial({ color: 0xf5c5a3 });
        const shirtMat = new THREE.MeshLambertMaterial({ color: 0x2196f3 });
        const pantsMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const shoeMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
        personMaterials.push(skinMat, shirtMat, pantsMat, shoeMat);

        // 头
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), skinMat);
        head.position.y = 1.55;
        head.castShadow = true;
        personGroup.add(head);

        // 身体
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.3), shirtMat);
        body.position.y = 1.1;
        body.castShadow = true;
        personGroup.add(body);

        // 左腿
        personLeftLeg = new THREE.Group();
        const ll = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), pantsMat);
        ll.position.y = -0.25;
        personLeftLeg.add(ll);
        const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.22), shoeMat);
        lShoe.position.y = -0.52;
        lShoe.position.z = 0.03;
        personLeftLeg.add(lShoe);
        personLeftLeg.position.set(-0.12, 0.8, 0);
        personGroup.add(personLeftLeg);

        // 右腿
        personRightLeg = new THREE.Group();
        const rl = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), pantsMat);
        rl.position.y = -0.25;
        personRightLeg.add(rl);
        const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.22), shoeMat);
        rShoe.position.y = -0.52;
        rShoe.position.z = 0.03;
        personRightLeg.add(rShoe);
        personRightLeg.position.set(0.12, 0.8, 0);
        personGroup.add(personRightLeg);

        // 左臂
        personLeftArm = new THREE.Group();
        const la = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.12), shirtMat);
        la.position.y = -0.22;
        personLeftArm.add(la);
        personLeftArm.position.set(-0.35, 1.3, 0);
        personGroup.add(personLeftArm);

        // 右臂
        personRightArm = new THREE.Group();
        const ra = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.12), shirtMat);
        ra.position.y = -0.22;
        personRightArm.add(ra);
        personRightArm.position.set(0.35, 1.3, 0);
        personGroup.add(personRightArm);

        personGroup.position.set(
            typeof startX === 'number' ? startX : 4,
            typeof startY === 'number' ? startY : 0.36,
            typeof startZ === 'number' ? startZ : 55
        );
        scene.add(personGroup);
    }

    function renderStation() {
        if (!renderer) return;
        renderer.render(scene, camera);
        if (phase === Phase.STATION_BJS) {
            requestAnimationFrame(renderStation);
        }
    }

    // ============================================================
    //  阶段3: BOARDING_WALK — 小人上车
    // ============================================================

    function startBoarding() {
        phase = Phase.BOARDING_WALK;
        currentCutscene = 'boarding';
        cutsceneStart = performance.now();
        showHint('正在走向 06 车门...', 2600);
        updateStatusUI();

        const car6Z = 55 - 5 * (16 + 0.3);
        personTargetZ = car6Z + 5;
        personWalkTime = 0;
        personGroup.visible = true;
        personGroup.scale.set(1, 1, 1);
        personGroup.position.set(4, 0.36, 55);
        personGroup.rotation.set(0, 0, 0);
        setTrainDoorOpenRatio(0);
        lastTimestamp = performance.now();
        animateBoardingWalk(lastTimestamp);
    }

    function animateBoardingWalk(timestamp) {
        if (phase !== Phase.BOARDING_WALK) return;

        const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
        lastTimestamp = timestamp;
        personWalkTime += dt;
        const elapsed = (timestamp - cutsceneStart) / 1000;
        const walkDuration = clamp((55 - personTargetZ) / 8.5, 5.5, 8.2);
        const approachDuration = 1.8;  // 走向车门
        const enterDuration = 1.6;     // 走入车内
        const openStart = Math.max(0, walkDuration - 1.1);

        if (elapsed < walkDuration) {
            // 阶段1: 沿站台走到06车门口
            const t = clamp(elapsed / walkDuration, 0, 1);
            personGroup.position.z = lerp(55, personTargetZ, t);
            const swing = Math.sin(personWalkTime * 8) * 0.42;
            personLeftLeg.rotation.x = swing;
            personRightLeg.rotation.x = -swing;
            personLeftArm.rotation.x = -swing * 0.58;
            personRightArm.rotation.x = swing * 0.58;
            camera.position.z = personGroup.position.z + 10;
            camera.lookAt(0.6, 1.8, personGroup.position.z - 7);
            if (elapsed > openStart) {
                setTrainDoorOpenRatio((elapsed - openStart) / (walkDuration - openStart));
            }
        } else if (elapsed < walkDuration + approachDuration) {
            // 阶段2: 转身走向车门（x: 4 → 1.3，到达门口）
            const t = easeInOut((elapsed - walkDuration) / approachDuration);
            personGroup.rotation.y = -Math.PI / 2;
            const swing = Math.sin(personWalkTime * 6) * 0.3;
            personLeftLeg.rotation.x = swing;
            personRightLeg.rotation.x = -swing;
            personLeftArm.rotation.x = -swing * 0.4;
            personRightArm.rotation.x = swing * 0.4;
            personGroup.position.z = personTargetZ;
            personGroup.position.x = lerp(4, 1.3, t);
            setTrainDoorOpenRatio(1);
        } else if (elapsed < walkDuration + approachDuration + enterDuration) {
            // 阶段3: 在车门口淡出（模拟走入车厢内部）
            const t = easeInOut((elapsed - walkDuration - approachDuration) / enterDuration);
            personGroup.rotation.y = -Math.PI / 2;
            personLeftLeg.rotation.x = 0;
            personRightLeg.rotation.x = 0;
            personLeftArm.rotation.x = 0;
            personRightArm.rotation.x = 0;
            personGroup.position.z = personTargetZ;
            // 只微微向门内移动一小步（不穿过车体）
            personGroup.position.x = lerp(1.3, 1.1, t);
            // 逐渐淡出
            setPersonOpacity(1 - t);
            setTrainDoorOpenRatio(1);
            if (t > 0.3) showHint('上车完成，去 06 车 05D 座位！', 1200);
        } else {
            setPersonOpacity(1);
            personGroup.visible = false;
            hideHint();
            transitionToCabinSeating();
            return;
        }

        renderer.render(scene, camera);
        requestAnimationFrame(animateBoardingWalk);
    }

    // ============================================================
    //  过渡到车厢坐下
    // ============================================================

    function transitionToCabinSeating() {
        cleanupScene();
        phase = Phase.CABIN_SEATING;
        currentCutscene = 'seating';
        cutsceneStart = performance.now();
        initCabinScene('seating');
        updateStatusUI();
        showHint('06车车厢内：找到 05D 并坐下', 2200);
        animateCabinCutscene(cutsceneStart);
    }

    function transitionToDriving() {
        cleanupScene();
        initDrivingScene();
        $('stationLabel').textContent = '列车出发！';
        $('stationLabel').classList.add('show');
        playAudio('depart');
        setTimeout(() => {
            $('stationLabel').classList.remove('show');
            setTimeout(() => startDriving(), 500);
        }, 2000);
    }

    function transitionToCabinAlight() {
        cleanupScene();
        phase = Phase.CABIN_ALIGHT;
        currentCutscene = 'alight';
        cutsceneStart = performance.now();
        initCabinScene('alight');
        updateStatusUI();
        showHint('终点站到了，起身从 06 车门下车', 2200);
        animateCabinCutscene(cutsceneStart);
    }

    function initCabinScene(mode) {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x6e7885);
        scene.fog = new THREE.Fog(0x6e7885, 18, 52);
        camera = new THREE.PerspectiveCamera(56, window.innerWidth / window.innerHeight, 0.1, 150);
        camera.position.set(-0.4, 2.2, 11.5);
        camera.lookAt(1.1, 1.5, -1.8);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.id = 'three-canvas';
        document.body.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xa7b3c4, 0.82));
        const keyLight = new THREE.DirectionalLight(0xffffff, 0.76);
        keyLight.position.set(12, 18, 8);
        keyLight.castShadow = true;
        scene.add(keyLight);

        cabinSceneData = createCabinInterior();
        createPersonModel(
            mode === 'seating' ? 0.7 : cabinSceneData.seat.x,
            1.2,
            mode === 'seating' ? 8.4 : cabinSceneData.seat.z
        );

        if (mode === 'alight') {
            personGroup.rotation.y = Math.PI;
            personGroup.position.y = 0.86;
            setPersonSitPose(1);
        } else {
            personGroup.rotation.y = 0;
            setPersonSitPose(0);
        }
    }

    function createCabinInterior() {
        const group = new THREE.Group();
        scene.add(group);

        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(5.2, 0.22, 22),
            new THREE.MeshStandardMaterial({ color: 0x9aa2ad, roughness: 0.52, metalness: 0.05 })
        );
        floor.position.y = -0.06;
        group.add(floor);

        const sideWallMat = new THREE.MeshStandardMaterial({ color: 0xd9dee7, roughness: 0.45, metalness: 0.06 });
        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.75, 22), sideWallMat);
        leftWall.position.set(-2.55, 1.32, 0);
        group.add(leftWall);
        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.75, 22), sideWallMat);
        rightWall.position.set(2.55, 1.32, 0);
        group.add(rightWall);

        const ceiling = new THREE.Mesh(
            new THREE.BoxGeometry(5.2, 0.2, 22),
            new THREE.MeshStandardMaterial({ color: 0xe8edf4, roughness: 0.35, metalness: 0.03 })
        );
        ceiling.position.set(0, 2.72, 0);
        group.add(ceiling);

        const panelMat = new THREE.MeshLambertMaterial({ color: 0x5c84bc });
        const baseMat = new THREE.MeshLambertMaterial({ color: 0x3f4f63 });
        const rowZ = [5.8, 3.7, 1.6, -0.5, -2.6, -4.7];
        rowZ.forEach((z, i) => {
            for (const x of [-1.8, -1.15, 1.0, 1.58, 2.15]) {
                const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.52, 0.74), panelMat);
                seat.position.set(x, 0.92, z);
                group.add(seat);
                const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.58), baseMat);
                seatBase.position.set(x, 0.47, z + 0.02);
                group.add(seatBase);
            }
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.15, 6), new THREE.MeshLambertMaterial({ color: 0xc8d5e8 }));
            pole.position.set(0, 1.25, z);
            group.add(pole);
            if (i < rowZ.length - 1) {
                const rowLine = new THREE.Mesh(new THREE.BoxGeometry(5.1, 0.02, 0.04), new THREE.MeshBasicMaterial({ color: 0xffffff }));
                rowLine.position.set(0, 0.01, z - 1.04);
                group.add(rowLine);
            }
        });

        const targetSeat = { x: 1.58, z: -2.6 };
        const glowRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.38, 0.055, 10, 28),
            new THREE.MeshBasicMaterial({ color: 0xffeb3b })
        );
        glowRing.rotation.x = Math.PI / 2;
        glowRing.position.set(targetSeat.x, 0.72, targetSeat.z);
        group.add(glowRing);

        const signCanvas = document.createElement('canvas');
        signCanvas.width = 512;
        signCanvas.height = 128;
        const sctx = signCanvas.getContext('2d');
        sctx.fillStyle = '#0f2034';
        sctx.fillRect(0, 0, 512, 128);
        sctx.fillStyle = '#1f7fd3';
        sctx.fillRect(6, 6, 500, 116);
        sctx.font = 'bold 52px "Noto Sans SC", sans-serif';
        sctx.fillStyle = '#ffffff';
        sctx.textAlign = 'center';
        sctx.textBaseline = 'middle';
        sctx.fillText('06车  05D', 256, 64);
        const sign = new THREE.Mesh(
            new THREE.PlaneGeometry(2.7, 0.65),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(signCanvas), side: THREE.DoubleSide })
        );
        sign.position.set(0, 2.3, 7.8);
        group.add(sign);

        const doorFrame = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 2.4, 0.08),
            new THREE.MeshLambertMaterial({ color: 0xc9d1db })
        );
        doorFrame.position.set(0, 1.2, 8.9);
        group.add(doorFrame);

        return {
            seat: new THREE.Vector3(targetSeat.x, 1.2, targetSeat.z),
            door: new THREE.Vector3(0.7, 1.2, 8.5),
            aisleX: 0.7
        };
    }

    function setPersonSitPose(amount) {
        const t = clamp(amount, 0, 1);
        personLeftLeg.rotation.x = -1.2 * t;
        personRightLeg.rotation.x = -1.2 * t;
        personLeftArm.rotation.x = -0.35 * t;
        personRightArm.rotation.x = -0.35 * t;
    }

    function animateCabinCutscene(timestamp) {
        if (phase !== Phase.CABIN_SEATING && phase !== Phase.CABIN_ALIGHT) return;
        const elapsed = (timestamp - cutsceneStart) / 1000;
        const seatPos = cabinSceneData.seat;

        if (phase === Phase.CABIN_SEATING) {
            if (elapsed < 2.4) {
                const t = easeInOut(elapsed / 2.4);
                personGroup.position.z = lerp(8.4, seatPos.z, t);
                personGroup.position.x = cabinSceneData.aisleX;
                personGroup.rotation.y = 0;
                const swing = Math.sin(elapsed * 8) * 0.35;
                personLeftLeg.rotation.x = swing;
                personRightLeg.rotation.x = -swing;
                personLeftArm.rotation.x = -swing * 0.5;
                personRightArm.rotation.x = swing * 0.5;
            } else if (elapsed < 3.4) {
                const t = easeInOut((elapsed - 2.4) / 1.0);
                personGroup.position.z = seatPos.z;
                personGroup.position.x = lerp(cabinSceneData.aisleX, seatPos.x, t);
                personGroup.rotation.y = Math.PI * t;
                setPersonSitPose(0);
            } else if (elapsed < 4.4) {
                const t = easeInOut((elapsed - 3.4) / 1.0);
                personGroup.position.set(seatPos.x, lerp(1.2, 0.86, t), seatPos.z);
                personGroup.rotation.y = Math.PI;
                setPersonSitPose(t);
                if (t > 0.5) showHint('05D 已入座，准备发车！', 1200);
            } else {
                personGroup.position.set(seatPos.x, 0.86, seatPos.z);
                personGroup.rotation.y = Math.PI;
                setPersonSitPose(1);
                if (elapsed > 5.2) {
                    hideHint();
                    transitionToDriving();
                    return;
                }
            }
        } else {
            if (elapsed < 1.0) {
                const t = easeInOut(elapsed / 1.0);
                personGroup.position.set(seatPos.x, lerp(0.86, 1.2, t), seatPos.z);
                personGroup.rotation.y = Math.PI;
                setPersonSitPose(1 - t);
            } else if (elapsed < 2.1) {
                const t = easeInOut((elapsed - 1.0) / 1.1);
                personGroup.position.z = seatPos.z;
                personGroup.position.x = lerp(seatPos.x, cabinSceneData.aisleX, t);
                personGroup.rotation.y = Math.PI * (1 - t);
                setPersonSitPose(0);
            } else if (elapsed < 4.2) {
                const t = easeInOut((elapsed - 2.1) / 2.1);
                personGroup.position.x = cabinSceneData.aisleX;
                personGroup.position.z = lerp(seatPos.z, cabinSceneData.door.z, t);
                const swing = Math.sin((elapsed - 2.1) * 8) * 0.32;
                personLeftLeg.rotation.x = swing;
                personRightLeg.rotation.x = -swing;
                personLeftArm.rotation.x = -swing * 0.5;
                personRightArm.rotation.x = swing * 0.5;
            } else if (elapsed < 5.2) {
                const t = clamp((elapsed - 4.2) / 1.0, 0, 1);
                personGroup.position.x = cabinSceneData.aisleX;
                personGroup.position.z = cabinSceneData.door.z;
                personGroup.scale.set(1 - t, 1 - t, 1 - t);
            } else {
                hideHint();
                personGroup.visible = false;
                startArrivedPhase();
                return;
            }
        }

        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animateCabinCutscene);
    }

    function cleanupScene() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        if (renderer) {
            renderer.domElement.remove();
            renderer.dispose();
        }
        scene = null;
        camera = null;
        renderer = null;
        stationGroup = null;
        trainGroup = null;
        personGroup = null;
        envGroup = null;
        cabinSceneData = null;
        stationDoors = [];
    }

    // ============================================================
    //  阶段4: DRIVING — 行驶中
    // ============================================================

    function initDrivingScene() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x5ba3e6);
        scene.fog = new THREE.Fog(0x7ec8e3, 80, 400);

        camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 1000);
        setCameraView(1);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.id = 'three-canvas';
        document.body.appendChild(renderer.domElement);

        const ambient = new THREE.AmbientLight(0x8899bb, 0.6);
        scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
        dirLight.position.set(50, 80, 30);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.set(2048, 2048);
        dirLight.shadow.camera.left = -120;
        dirLight.shadow.camera.right = 120;
        dirLight.shadow.camera.top = 120;
        dirLight.shadow.camera.bottom = -120;
        dirLight.shadow.camera.far = 300;
        scene.add(dirLight);

        envGroup = new THREE.Group();
        scene.add(envGroup);

        createGround();
        createDrivingTracks();
        createDrivingTrain();
        createPowerLines();
        createTrees();
        createHouses();
        createClouds();

        $('btnView1').onclick = () => setCameraView(1);
        $('btnView2').onclick = () => setCameraView(2);
        $('btnView3').onclick = () => setCameraView(3);
        $('replayBtn').onclick = replay;
    }

    function startDriving() {
        phase = Phase.DRIVING;
        isPaused = false;
        $('hud').style.display = 'block';
        $('controls').style.display = 'flex';
        $('miniMap').classList.add('show');
        targetSpeed = CRUISE_SPEED * speedFactor;
        updateStatusUI();
        lastTimestamp = performance.now();
        animateDriving(lastTimestamp);
    }

    // ============ 行驶用地面 ============
    function createGround() {
        const geo = new THREE.PlaneGeometry(400, CONFIG.trackLength * 2);
        const mat = new THREE.MeshLambertMaterial({ color: 0x4caf50 });
        const ground = new THREE.Mesh(geo, mat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.05;
        ground.receiveShadow = true;
        scene.add(ground);
    }

    // ============ 行驶用铁轨 ============
    function createDrivingTracks() {
        const halfLen = CONFIG.trackLength;

        const roadbedGeo = new THREE.BoxGeometry(CONFIG.trackWidth + 3.5, 0.35, halfLen * 2);
        const roadbedMat = new THREE.MeshLambertMaterial({ color: 0x505050 });
        const roadbed = new THREE.Mesh(roadbedGeo, roadbedMat);
        roadbed.position.y = 0.05;
        roadbed.receiveShadow = true;
        scene.add(roadbed);

        const gravelGeo = new THREE.BoxGeometry(CONFIG.trackWidth + 1.8, 0.18, halfLen * 2);
        const gravelMat = new THREE.MeshLambertMaterial({ color: 0x606060 });
        const gravel = new THREE.Mesh(gravelGeo, gravelMat);
        gravel.position.y = 0.24;
        gravel.receiveShadow = true;
        scene.add(gravel);

        const railGeo = new THREE.BoxGeometry(0.1, 0.14, halfLen * 2);
        const railMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.7, roughness: 0.3 });
        for (const side of [-1, 1]) {
            const rail = new THREE.Mesh(railGeo, railMat);
            rail.position.set(side * CONFIG.railGauge / 2, 0.38, 0);
            scene.add(rail);
        }

        const sleeperGeo = new THREE.BoxGeometry(CONFIG.railGauge + 0.9, 0.1, 0.22);
        const sleeperMat = new THREE.MeshLambertMaterial({ color: 0x707070 });
        for (let z = -halfLen; z < halfLen; z += CONFIG.sleeperSpacing) {
            const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
            sleeper.position.set(0, 0.3, z);
            envGroup.add(sleeper);
        }
    }

    // ============ 行驶列车（和谐号外观） ============
    function createDrivingTrain() {
        trainGroup = new THREE.Group();
        const carCount = 7;
        const carLength = 16;
        const carWidth = 2.4;
        const carHeight = 2.8;
        const gap = 0.3;

        for (let i = 0; i < carCount; i++) {
            const isHead = (i === 0);
            const isTail = (i === carCount - 1);
            const car = createHexiehaoDrivingCar(isHead, isTail, carLength, carWidth, carHeight, i + 1);
            car.position.z = -i * (carLength + gap);
            trainGroup.add(car);
        }

        trainGroup.position.y = 0.45;
        trainGroup.position.z = 35;
        scene.add(trainGroup);
    }

    function createHexiehaoDrivingCar(isHead, isTail, length, width, height, carNum) {
        const group = new THREE.Group();
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0xf2f2f2 });
        const blueMat = new THREE.MeshLambertMaterial({ color: 0x1565c0 });
        const windowMat = new THREE.MeshLambertMaterial({ color: 0x5ba3e6, side: THREE.DoubleSide });
        const darkMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });

        if (isHead) {
            const bodyLen = length * 0.65;
            const bodyGeo = new THREE.BoxGeometry(width, height, bodyLen);
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.z = -length * 0.175;
            body.castShadow = true;
            group.add(body);

            // 和谐号圆润车鼻
            const noseGeo = new THREE.CylinderGeometry(0, width / 2 * 0.85, length * 0.42, 12);
            const nose = new THREE.Mesh(noseGeo, bodyMat);
            nose.rotation.x = Math.PI / 2;
            nose.position.z = length * 0.38;
            nose.scale.set(1, 0.55, 1);
            nose.castShadow = true;
            group.add(nose);

            // 蓝色V形条纹
            const vStripeGeo = new THREE.BoxGeometry(0.04, 1.6, length * 0.3);
            for (const side of [-1, 1]) {
                const vStripe = new THREE.Mesh(vStripeGeo, blueMat);
                vStripe.position.set(side * width * 0.35, -0.15, length * 0.08);
                vStripe.rotation.z = side * 0.25;
                vStripe.rotation.y = side * 0.15;
                group.add(vStripe);
            }

            // 蓝色腰线
            const waistGeo = new THREE.BoxGeometry(width + 0.04, 0.15, bodyLen + 0.04);
            const waist = new THREE.Mesh(waistGeo, blueMat);
            waist.position.y = -height * 0.3;
            waist.position.z = -length * 0.175;
            group.add(waist);

            // 和谐号文字
            addHexiehaoLabel(group, width, height, length);
            addG879Label(group, width, height, length, true);

            for (let wz = -length * 0.4; wz <= length * 0.08; wz += 2.0) {
                addWindows(group, width, wz, windowMat);
            }

            const underGeo = new THREE.BoxGeometry(width - 0.2, 0.4, bodyLen);
            const under = new THREE.Mesh(underGeo, darkMat);
            under.position.y = -height / 2 - 0.1;
            under.position.z = -length * 0.175;
            group.add(under);
        } else if (isTail) {
            const bodyLen = length * 0.65;
            const bodyGeo = new THREE.BoxGeometry(width, height, bodyLen);
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.z = length * 0.175;
            body.castShadow = true;
            group.add(body);

            const noseGeo = new THREE.CylinderGeometry(0, width / 2 * 0.85, length * 0.42, 12);
            const nose = new THREE.Mesh(noseGeo, bodyMat);
            nose.rotation.x = -Math.PI / 2;
            nose.position.z = -length * 0.38;
            nose.scale.set(1, 0.55, 1);
            nose.castShadow = true;
            group.add(nose);

            const waistGeo = new THREE.BoxGeometry(width + 0.04, 0.15, bodyLen + 0.04);
            const waist = new THREE.Mesh(waistGeo, blueMat);
            waist.position.y = -height * 0.3;
            waist.position.z = length * 0.175;
            group.add(waist);

            for (let wz = -length * 0.08; wz <= length * 0.4; wz += 2.0) {
                addWindows(group, width, wz, windowMat);
            }

            const underGeo = new THREE.BoxGeometry(width - 0.2, 0.4, bodyLen);
            const under = new THREE.Mesh(underGeo, darkMat);
            under.position.y = -height / 2 - 0.1;
            under.position.z = length * 0.175;
            group.add(under);
        } else {
            const bodyGeo = new THREE.BoxGeometry(width, height, length);
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.castShadow = true;
            group.add(body);

            const waistGeo = new THREE.BoxGeometry(width + 0.04, 0.15, length + 0.04);
            const waist = new THREE.Mesh(waistGeo, blueMat);
            waist.position.y = -height * 0.3;
            group.add(waist);

            const winCount = Math.floor(length / 2.0) - 1;
            const startZ = -(winCount - 1) * 2.0 / 2;
            for (let w = 0; w < winCount; w++) {
                addWindows(group, width, startZ + w * 2.0, windowMat);
            }

            if (carNum === 6) {
                addCarNumberLabel(group, width, height, '06车', true);
                addSeatMarkerLabel(group, width, '05D');
            } else {
                addCarNumberLabel(group, width, height, `${String(carNum).padStart(2, '0')}车`, false);
            }

            const divGeo = new THREE.BoxGeometry(width + 0.04, height + 0.02, 0.06);
            const divMat = new THREE.MeshLambertMaterial({ color: 0xdcdcdc });
            for (const zz of [length / 2, -length / 2]) {
                const div = new THREE.Mesh(divGeo, divMat);
                div.position.z = zz;
                group.add(div);
            }

            const underGeo = new THREE.BoxGeometry(width - 0.2, 0.4, length);
            const under = new THREE.Mesh(underGeo, darkMat);
            under.position.y = -height / 2 - 0.1;
            group.add(under);
        }

        const roofLen = (isHead || isTail) ? length * 0.65 : length;
        const roofGeo = new THREE.BoxGeometry(width - 0.3, 0.12, roofLen);
        const roofMat = new THREE.MeshLambertMaterial({ color: 0xe5e5e5 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = height / 2 + 0.06;
        if (isHead) roof.position.z = -length * 0.175;
        if (isTail) roof.position.z = length * 0.175;
        group.add(roof);

        return group;
    }

    // ============ 电线杆 ============
    function createPowerLines() {
        const poleMat = new THREE.MeshLambertMaterial({ color: 0x555555 });

        for (let z = -CONFIG.trackLength; z < CONFIG.trackLength; z += CONFIG.poleSpacing) {
            for (const side of [-1, 1]) {
                const poleGroup = new THREE.Group();

                const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 10, 6);
                const pole = new THREE.Mesh(poleGeo, poleMat);
                pole.position.y = 5;
                pole.castShadow = true;
                poleGroup.add(pole);

                const armGeo = new THREE.BoxGeometry(3.5, 0.18, 0.18);
                const arm = new THREE.Mesh(armGeo, poleMat);
                arm.position.y = 10;
                poleGroup.add(arm);

                poleGroup.position.set(side * (CONFIG.trackWidth / 2 + 2.8), 0, z);
                envGroup.add(poleGroup);
            }
        }

        const wireMat = new THREE.LineBasicMaterial({ color: 0x444444 });
        for (const side of [-1, 1]) {
            const cablePoints = [];
            for (let z = -CONFIG.trackLength; z <= CONFIG.trackLength; z += CONFIG.poleSpacing) {
                cablePoints.push(new THREE.Vector3(side * (CONFIG.trackWidth / 2 + 1.5), 9.6, z));
            }
            const cableGeo = new THREE.BufferGeometry().setFromPoints(cablePoints);
            const cable = new THREE.Line(cableGeo, wireMat);
            scene.add(cable);
        }
    }

    // ============ 树木 ============
    function createTrees() {
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5d3a1a });
        const leafColor = 0x2e8b2e;

        for (let i = 0; i < 100; i++) {
            const treeGroup = new THREE.Group();

            const trunkH = 1.8 + Math.random() * 2.0;
            const trunkGeo = new THREE.CylinderGeometry(0.15, 0.22, trunkH, 6);
            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.y = trunkH / 2;
            trunk.castShadow = true;
            treeGroup.add(trunk);

            const radius = 1.5 + Math.random() * 1.8;
            const crownGeo = new THREE.SphereGeometry(radius, 8, 6);
            const leafMat = new THREE.MeshLambertMaterial({ color: leafColor });
            const crown = new THREE.Mesh(crownGeo, leafMat);
            crown.position.y = trunkH + radius * 0.65;
            crown.castShadow = true;
            treeGroup.add(crown);

            const side = Math.random() > 0.5 ? 1 : -1;
            const nearTrack = Math.random() < 0.4;
            const xOff = nearTrack
                ? CONFIG.trackWidth / 2 + 4 + Math.random() * 8
                : CONFIG.trackWidth / 2 + 12 + Math.random() * 45;
            const zPos = (Math.random() - 0.5) * CONFIG.trackLength * 2;
            treeGroup.position.set(side * xOff, 0, zPos);

            envGroup.add(treeGroup);
        }
    }

    // ============ 房子 ============
    function createHouses() {
        for (let i = 0; i < 25; i++) {
            const house = createHouse();
            const side = Math.random() > 0.5 ? 1 : -1;
            const xOff = CONFIG.trackWidth / 2 + 8 + Math.random() * 45;
            const zPos = (Math.random() - 0.5) * CONFIG.trackLength * 2;
            house.position.set(side * xOff, 0, zPos);
            house.rotation.y = Math.random() * Math.PI * 2;
            envGroup.add(house);
        }
    }

    function createHouse() {
        const group = new THREE.Group();
        const w = 3 + Math.random() * 2;
        const h = 2.5 + Math.random() * 1;
        const d = 3 + Math.random() * 2;

        const wallGeo = new THREE.BoxGeometry(w, h, d);
        const wallMat = new THREE.MeshLambertMaterial({ color: 0xe8d8b8 });
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.y = h / 2;
        wall.castShadow = true;
        wall.receiveShadow = true;
        group.add(wall);

        const roofGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.75, 1.8, 4);
        const roofMat = new THREE.MeshLambertMaterial({ color: 0x8b1a1a });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = h + 0.9;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);

        return group;
    }

    // ============ 云朵 ============
    function createClouds() {
        for (let i = 0; i < 15; i++) {
            const cloud = createCloud();
            cloud.position.set(
                (Math.random() - 0.5) * 250,
                35 + Math.random() * 35,
                (Math.random() - 0.5) * CONFIG.trackLength * 1.5
            );
            envGroup.add(cloud);
        }
    }

    function createCloud() {
        const group = new THREE.Group();
        const mat = new THREE.MeshLambertMaterial({ color: 0xf8f8f8 });

        const count = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            const geo = new THREE.SphereGeometry(2.5 + Math.random() * 3.5, 8, 6);
            const part = new THREE.Mesh(geo, mat);
            part.scale.set(1.8, 0.45, 1.2);
            part.position.set(i * 3 - count * 1.5, Math.random() * 0.5, Math.random() * 1.5);
            group.add(part);
        }
        return group;
    }

    // ============ 相机视角 ============
    function setCameraView(viewNum) {
        if (!camera) return;
        currentView = viewNum;
        switch (viewNum) {
            case 1: // 侧面视角
                camera.position.set(14, 4.5, 25);
                camera.lookAt(0, 2.5, -10);
                break;
            case 2: // 俯视视角
                camera.position.set(0, 55, 15);
                camera.lookAt(0, 0, -25);
                break;
            case 3: // 车内视角（从窗户向外看）
                camera.position.set(1.0, 2.2, 10);
                camera.lookAt(15, 2, 10);
                break;
        }
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.view) === viewNum);
        });
    }

    // ============ 键盘控制 ============
    function onKeyDown(e) {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                if (phase === Phase.MAP) {
                    onDepart();
                } else if (phase === Phase.DRIVING) {
                    isPaused = !isPaused;
                    showHint(isPaused ? '已暂停（按 Space 继续）' : '继续行驶', 900);
                    updateStatusUI();
                } else if (phase === Phase.ARRIVED) {
                    replay();
                }
                break;
            case 'ArrowUp':
                if (phase === Phase.DRIVING) {
                    speedFactor = clamp(speedFactor + SPEED_FACTOR_STEP, SPEED_FACTOR_MIN, SPEED_FACTOR_MAX);
                    showHint(`速度倍率 x${speedFactor.toFixed(1)}`, 700);
                    updateStatusUI();
                }
                break;
            case 'ArrowDown':
                if (phase === Phase.DRIVING) {
                    speedFactor = clamp(speedFactor - SPEED_FACTOR_STEP, SPEED_FACTOR_MIN, SPEED_FACTOR_MAX);
                    showHint(`速度倍率 x${speedFactor.toFixed(1)}`, 700);
                    updateStatusUI();
                }
                break;
            case 'Digit1':
                if (phase === Phase.DRIVING) setCameraView(1);
                break;
            case 'Digit2':
                if (phase === Phase.DRIVING) setCameraView(2);
                break;
            case 'Digit3':
                if (phase === Phase.DRIVING) setCameraView(3);
                break;
        }
    }

    // ============ 窗口大小 ============
    function onResize() {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // ============ HUD 更新 ============
    function updateHUD() {
        const pct1 = Math.min(100, (Math.min(journeyDistance, DEZHOU_KM) / DEZHOU_KM) * 100);
        $('progressFill').style.width = pct1 + '%';

        if (journeyDistance > DEZHOU_KM) {
            const pct2 = Math.min(100, ((journeyDistance - DEZHOU_KM) / (TOTAL_DISTANCE - DEZHOU_KM)) * 100);
            $('progressFill2').style.width = pct2 + '%';
        } else {
            $('progressFill2').style.width = '0%';
        }

        $('progressTrain').style.left = Math.min(95, (journeyDistance <= DEZHOU_KM ? pct1 : 100)) + '%';
        $('speedVal').textContent = Math.round(currentSpeed);
        $('distVal').textContent = journeyDistance.toFixed(1);
        const min = Math.floor(journeyTime / 60);
        const sec = Math.floor(journeyTime % 60);
        $('timeVal').textContent = min + ':' + (sec < 10 ? '0' : '') + sec;
        updateStatusUI();
        updateRouteProgressVisuals(journeyDistance);
    }

    // ============ 行驶动画循环 ============
    function animateDriving(timestamp) {
        if (phase !== Phase.DRIVING) return;
        animationId = requestAnimationFrame(animateDriving);

        const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
        lastTimestamp = timestamp;

        if (isPaused) {
            updateHUD();
            renderer.render(scene, camera);
            return;
        }

        const distToDezhou = DEZHOU_KM - journeyDistance;
        const distToEnd = TOTAL_DISTANCE - journeyDistance;
        const targetSpeedBase = CRUISE_SPEED * speedFactor;

        if (dezhouState === 'approaching') {
            if (distToDezhou <= 0.5) {
                dezhouState = 'stopping';
                journeyDistance = DEZHOU_KM;
                currentSpeed = 0;
                targetSpeed = 0;
            } else if (distToDezhou < DEZHOU_APPROACH_KM) {
                targetSpeed = Math.max(15, (distToDezhou / DEZHOU_APPROACH_KM) * targetSpeedBase);

                if (!speedMilestones['arriving-dezhou'] && distToDezhou < DEZHOU_APPROACH_KM * 0.8) {
                    speedMilestones['arriving-dezhou'] = true;
                    playAudio('arriving-dezhou');
                }
            } else {
                targetSpeed = targetSpeedBase;
            }
        } else if (dezhouState === 'stopping') {
            currentSpeed = 0;
            targetSpeed = 0;
            dezhouState = 'stopped';
            dezhouStopTimer = 0;
            $('stationLabel').textContent = '德州东站';
            $('stationLabel').classList.add('show');
            playAudio('dezhou-stop');
            showHint('德州东站短暂停靠中...', 1500);
        } else if (dezhouState === 'stopped') {
            currentSpeed = 0;
            dezhouStopTimer += dt;
            if (dezhouStopTimer > DEZHOU_STOP_DURATION) {
                dezhouState = 'departing';
                $('stationLabel').classList.remove('show');
                playAudio('dezhou-depart');
                showHint('德州东发车，下一站济南东！', 1300);
            }
        } else if (dezhouState === 'departing') {
            targetSpeed = targetSpeedBase;
            if (currentSpeed > targetSpeedBase * 0.9) {
                dezhouState = 'passed';
            }
        } else if (dezhouState === 'passed') {
            if (distToEnd < 15) {
                targetSpeed = Math.max(10, (distToEnd / 15) * targetSpeedBase);

                if (!speedMilestones['arriving-jinan']) {
                    speedMilestones['arriving-jinan'] = true;
                    playAudio('arriving-jinan');
                }
            } else {
                targetSpeed = targetSpeedBase;
            }
        }

        const accelRate = 60;
        if (currentSpeed < targetSpeed) {
            currentSpeed = Math.min(targetSpeed, currentSpeed + accelRate * dt);
        } else if (currentSpeed > targetSpeed) {
            currentSpeed = Math.max(targetSpeed, currentSpeed - accelRate * 1.5 * dt);
        }

        const distDelta = (currentSpeed / 3600) * dt * TIME_COMPRESSION;
        journeyDistance += distDelta;
        journeyTime += dt;

        if (!speedMilestones[200] && currentSpeed >= 200 && dezhouState === 'approaching') {
            speedMilestones[200] = true;
            playAudio('speed-200');
        }
        if (!speedMilestones[300] && currentSpeed >= 295 && dezhouState === 'approaching') {
            speedMilestones[300] = true;
            playAudio('speed-300');
        }

        const moveSpeed = (currentSpeed / 3.6) * dt * 2;
        envGroup.children.forEach(child => {
            child.position.z += moveSpeed;
            if (child.position.z > CONFIG.trackLength) {
                child.position.z -= CONFIG.trackLength * 2;
            }
        });

        updateHUD();

        if (journeyDistance >= TOTAL_DISTANCE) {
            journeyDistance = TOTAL_DISTANCE;
            currentSpeed = 0;
            updateHUD();
            onArrival();
            return;
        }

        renderer.render(scene, camera);
    }

    // ============================================================
    //  阶段5: ARRIVING — 到达济南东
    // ============================================================

    function onArrival() {
        phase = Phase.ARRIVING;
        isPaused = false;
        updateStatusUI();
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        $('stationLabel').textContent = '济南东站';
        $('stationLabel').classList.add('show');

        setTimeout(() => {
            if (phase !== Phase.ARRIVING) return;
            $('stationLabel').classList.remove('show');
            transitionToCabinAlight();
        }, 2000);
    }

    // ============================================================
    //  阶段6: ARRIVED — 庆祝 + 下车
    // ============================================================

    function startArrivedPhase() {
        phase = Phase.ARRIVED;
        updateStatusUI();

        const min = Math.floor(journeyTime / 60);
        const sec = Math.floor(journeyTime % 60);
        $('arrivalStats').textContent =
            '全程 ' + TOTAL_DISTANCE + ' 公里，途经德州东，用时 ' + min + ' 分 ' + sec + ' 秒';

        $('arrivalOverlay').classList.add('show');
        $('hud').style.display = 'none';
        $('controls').style.display = 'none';
        $('miniMap').classList.remove('show');

        playAudio('arrived');
    }

    // ============ 重玩 ============
    function replay() {
        cleanupScene();

        phase = Phase.MAP;
        journeyDistance = 0;
        journeyTime = 0;
        currentSpeed = 0;
        targetSpeed = 0;
        speedMilestones = {};
        speedFactor = 1.0;
        isPaused = false;
        dezhouState = 'approaching';
        dezhouStopTimer = 0;
        currentView = 1;
        animationId = null;
        currentCutscene = null;
        cutsceneStart = 0;

        $('arrivalOverlay').classList.remove('show');
        $('mapPhase').classList.remove('zooming', 'hidden');
        $('hud').style.display = 'none';
        $('controls').style.display = 'none';
        $('miniMap').classList.remove('show');
        $('stationLabel').classList.remove('show');
        $('progressFill').style.width = '0%';
        $('progressFill2').style.width = '0%';
        $('progressTrain').style.left = '0%';
        updateStatusUI();
        updateRouteProgressVisuals(0);

        stopCurrentAudio();
        initMap();
    }

    // ============ 启动 ============
    initMap();
})();
