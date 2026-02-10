// ============================================================
// 和谐号 G879 高铁体验 · 北京南→德州东→济南东
// 6阶段状态机: MAP → STATION → BOARDING → DRIVING → ARRIVING → ARRIVED
// ============================================================

(function () {
    'use strict';

    // ============ 应用状态 ============
    const Phase = {
        MAP: 'MAP',
        STATION: 'STATION',
        BOARDING: 'BOARDING',
        DRIVING: 'DRIVING',
        ARRIVING: 'ARRIVING',
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

    // 德州东停站状态
    let dezhouState = 'approaching'; // approaching | stopping | stopped | departing | passed
    const DEZHOU_APPROACH_KM = 20; // 距德州东20km开始减速
    const DEZHOU_STOP_DURATION = 4; // 停站4秒
    let dezhouStopTimer = 0;

    // ============ 3D 全局 ============
    let scene, camera, renderer;
    let envGroup, stationGroup, trainGroup, personGroup;
    let currentView = 1;
    let lastTimestamp = 0;
    let animationId = null;

    // 小人动画
    let personLeftLeg, personRightLeg, personLeftArm, personRightArm;
    let personWalkTime = 0;
    let personTargetZ = 0;
    let personSpeed = 8; // 单位/秒

    // ============ DOM 元素 ============
    const $ = (id) => document.getElementById(id);

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

    // ============================================================
    //  阶段1: MAP — 地图界面
    // ============================================================

    async function initMap() {
        $('departBtn').addEventListener('click', onDepart);
        await loadSVGMap();
        setTimeout(() => playAudio('welcome'), 500);
    }

    async function loadSVGMap() {
        const container = $('mapContainer');
        try {
            const response = await fetch('../puzzle/china-map.svg');
            const svgText = await response.text();
            container.innerHTML = svgText;

            const svgEl = container.querySelector('svg');
            if (svgEl) {
                svgEl.setAttribute('viewBox', '0 0 595.28 504');
                svgEl.removeAttribute('width');
                svgEl.removeAttribute('height');

                // 高亮北京和山东
                const bjEl = svgEl.querySelector('.state.beijing');
                const sdEl = svgEl.querySelector('.state.shandong');
                if (bjEl) bjEl.classList.add('highlight-city');
                if (sdEl) sdEl.classList.add('highlight-city');

                addRouteOverlay(svgEl, bjEl, sdEl);
            }
        } catch (e) {
            container.innerHTML = '<div style="color:#fff;text-align:center;padding:40px;">地图加载中...</div>';
        }
    }

    function addRouteOverlay(svgEl, bjEl, sdEl) {
        if (!bjEl || !sdEl) return;

        const bjBox = bjEl.getBBox();
        const sdBox = sdEl.getBBox();
        const bjCx = bjBox.x + bjBox.width / 2;
        const bjCy = bjBox.y + bjBox.height / 2;

        // 德州东大约在山东北部
        const dzCx = sdBox.x + sdBox.width * 0.35;
        const dzCy = sdBox.y + sdBox.height * 0.15;
        // 济南东大约在山东中部偏北
        const jnCx = sdBox.x + sdBox.width * 0.45;
        const jnCy = sdBox.y + sdBox.height * 0.3;

        const ns = 'http://www.w3.org/2000/svg';

        // 路线：北京南→德州东
        addSvgLine(svgEl, ns, bjCx, bjCy, dzCx, dzCy);
        // 路线：德州东→济南东
        addSvgLine(svgEl, ns, dzCx, dzCy, jnCx, jnCy);

        // 城市点和标签
        addCityMarker(svgEl, ns, bjCx, bjCy, '北京南', '', -12);
        addCityMarker(svgEl, ns, dzCx, dzCy, '德州东', 'mid-label', -12);
        addCityMarker(svgEl, ns, jnCx, jnCy, '济南东', 'dest-label', 16);
    }

    function addSvgLine(svgEl, ns, x1, y1, x2, y2) {
        const glow = document.createElementNS(ns, 'line');
        glow.setAttribute('x1', x1); glow.setAttribute('y1', y1);
        glow.setAttribute('x2', x2); glow.setAttribute('y2', y2);
        glow.setAttribute('class', 'route-glow');
        svgEl.appendChild(glow);

        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', x1); line.setAttribute('y1', y1);
        line.setAttribute('x2', x2); line.setAttribute('y2', y2);
        line.setAttribute('class', 'route-line');
        svgEl.appendChild(line);
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

    // ============================================================
    //  MAP → STATION 过渡
    // ============================================================

    function onDepart() {
        if (phase !== Phase.MAP) return;
        phase = Phase.STATION;

        stopCurrentAudio();
        $('mapPhase').classList.add('zooming');

        setTimeout(() => {
            $('mapPhase').classList.add('hidden');
            initStationScene();
        }, 1200);
    }

    // ============================================================
    //  阶段2: STATION — 3D北京南站站台
    // ============================================================

    function initStationScene() {
        // 初始化 Three.js
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x2a2a3a); // 站内偏暗
        scene.fog = new THREE.Fog(0x2a2a3a, 60, 200);

        camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 500);
        // 站台视角：从站台一端看过去
        camera.position.set(8, 5, 60);
        camera.lookAt(0, 3, -20);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.id = 'three-canvas';
        document.body.appendChild(renderer.domElement);

        // 灯光：站内环境
        const ambient = new THREE.AmbientLight(0x8899aa, 0.5);
        scene.add(ambient);

        // 雨棚下方的灯光
        const stationLight1 = new THREE.PointLight(0xffeedd, 0.8, 100);
        stationLight1.position.set(0, 10, 0);
        scene.add(stationLight1);
        const stationLight2 = new THREE.PointLight(0xffeedd, 0.6, 100);
        stationLight2.position.set(0, 10, -40);
        scene.add(stationLight2);
        const stationLight3 = new THREE.PointLight(0xffeedd, 0.6, 100);
        stationLight3.position.set(0, 10, 40);
        scene.add(stationLight3);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
        dirLight.position.set(30, 50, 20);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.set(1024, 1024);
        scene.add(dirLight);

        stationGroup = new THREE.Group();
        scene.add(stationGroup);

        createStation();
        createHexiehaoTrain();
        createPersonModel();

        window.addEventListener('resize', onResize);

        // 显示站名
        $('stationLabel').textContent = '北京南站';
        $('stationLabel').classList.add('show');
        showHint('欢迎来到北京南站！', 3000);

        playAudio('boarding');

        // 渲染站台并等待
        renderStation();

        // 8秒后进入登车阶段
        setTimeout(() => {
            $('stationLabel').classList.remove('show');
            setTimeout(() => startBoarding(), 500);
        }, 5000);
    }

    function createStation() {
        // 站台地面
        const platformGeo = new THREE.BoxGeometry(12, 1.2, 200);
        const platformMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const platform = new THREE.Mesh(platformGeo, platformMat);
        platform.position.set(6, 0.6, 0);
        platform.receiveShadow = true;
        stationGroup.add(platform);

        // 黄色安全线
        const safeLineGeo = new THREE.BoxGeometry(0.3, 0.02, 200);
        const safeLineMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
        const safeLine = new THREE.Mesh(safeLineGeo, safeLineMat);
        safeLine.position.set(0.15, 1.22, 0);
        stationGroup.add(safeLine);

        // 铁轨（在站台旁边）
        const railGeo = new THREE.BoxGeometry(0.1, 0.14, 200);
        const railMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.7, roughness: 0.3 });
        for (const x of [-0.7, 0.7]) {
            const rail = new THREE.Mesh(railGeo, railMat);
            rail.position.set(x, 0.1, 0);
            stationGroup.add(rail);
        }

        // 铁轨下方路基
        const roadbedGeo = new THREE.BoxGeometry(4, 0.2, 200);
        const roadbedMat = new THREE.MeshLambertMaterial({ color: 0x505050 });
        const roadbed = new THREE.Mesh(roadbedGeo, roadbedMat);
        roadbed.position.set(0, 0.0, 0);
        roadbed.receiveShadow = true;
        stationGroup.add(roadbed);

        // 对面站台
        const platform2Geo = new THREE.BoxGeometry(8, 1.2, 200);
        const platform2 = new THREE.Mesh(platform2Geo, platformMat);
        platform2.position.set(-8, 0.6, 0);
        platform2.receiveShadow = true;
        stationGroup.add(platform2);

        // 钢柱 + 雨棚
        const pillarMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
        for (let z = -80; z <= 80; z += 20) {
            // 站台侧钢柱
            const pillar = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 12, 8),
                pillarMat
            );
            pillar.position.set(10, 7, z);
            pillar.castShadow = true;
            stationGroup.add(pillar);

            // 对面钢柱
            const pillar2 = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 12, 8),
                pillarMat
            );
            pillar2.position.set(-10, 7, z);
            pillar2.castShadow = true;
            stationGroup.add(pillar2);

            // 桁架横梁
            const beamGeo = new THREE.BoxGeometry(22, 0.5, 0.5);
            const beam = new THREE.Mesh(beamGeo, pillarMat);
            beam.position.set(0, 13, z);
            stationGroup.add(beam);

            // 斜撑
            const braceGeo = new THREE.BoxGeometry(0.2, 0.2, 8);
            const brace1 = new THREE.Mesh(braceGeo, pillarMat);
            brace1.position.set(6, 11, z);
            brace1.rotation.x = 0.3;
            stationGroup.add(brace1);
        }

        // 雨棚（半透明玻璃）
        const canopyGeo = new THREE.PlaneGeometry(24, 200);
        const canopyMat = new THREE.MeshLambertMaterial({
            color: 0xaabbcc,
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide
        });
        const canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.rotation.x = -Math.PI / 2;
        canopy.position.set(0, 13.2, 0);
        stationGroup.add(canopy);

        // LED 显示屏
        const ledCanvas = document.createElement('canvas');
        ledCanvas.width = 512;
        ledCanvas.height = 128;
        const lctx = ledCanvas.getContext('2d');
        lctx.fillStyle = '#001122';
        lctx.fillRect(0, 0, 512, 128);
        lctx.font = 'bold 36px "Noto Sans SC", sans-serif';
        lctx.fillStyle = '#00ff88';
        lctx.textAlign = 'center';
        lctx.textBaseline = 'middle';
        lctx.fillText('G879  北京南 → 济南东', 256, 45);
        lctx.font = '24px "Noto Sans SC", sans-serif';
        lctx.fillStyle = '#ffcc00';
        lctx.fillText('06车  即将开车', 256, 90);

        const ledTexture = new THREE.CanvasTexture(ledCanvas);
        const ledGeo = new THREE.PlaneGeometry(5, 1.2);
        const ledMat = new THREE.MeshBasicMaterial({ map: ledTexture });

        // 两块LED屏
        const led1 = new THREE.Mesh(ledGeo, ledMat);
        led1.position.set(10, 8, 20);
        led1.rotation.y = -Math.PI / 2 - 0.15;
        stationGroup.add(led1);

        const led2 = new THREE.Mesh(ledGeo, ledMat.clone());
        led2.position.set(10, 8, -20);
        led2.rotation.y = -Math.PI / 2 - 0.15;
        stationGroup.add(led2);

        // 站台上的座椅（简化）
        const benchMat = new THREE.MeshLambertMaterial({ color: 0x3355aa });
        for (let z = -60; z <= 60; z += 30) {
            const bench = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.5, 0.5),
                benchMat
            );
            bench.position.set(8, 1.5, z);
            stationGroup.add(bench);
        }
    }

    function createHexiehaoTrain() {
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
            car.position.z = -i * (carLength + gap) + 55; // 车头在z正方向
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
            // 车头主体
            const bodyLen = length * 0.6;
            const bodyGeo = new THREE.BoxGeometry(width, height, bodyLen);
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.z = -length * 0.2;
            body.castShadow = true;
            group.add(body);

            // 流线型车鼻（和谐号更圆润）
            const noseGeo = new THREE.CylinderGeometry(0, width / 2 * 0.85, length * 0.45, 12);
            const nose = new THREE.Mesh(noseGeo, bodyMat);
            nose.rotation.x = Math.PI / 2;
            nose.position.z = length * 0.35;
            nose.scale.set(1, 0.55, 1);
            nose.castShadow = true;
            group.add(nose);

            // 蓝色V形条纹（和谐号特征）- 用两个倾斜的面模拟
            const vStripeGeo = new THREE.BoxGeometry(0.04, 1.8, length * 0.35);
            for (const side of [-1, 1]) {
                const vStripe = new THREE.Mesh(vStripeGeo, blueMat);
                vStripe.position.set(side * width * 0.35, -0.2, length * 0.05);
                vStripe.rotation.z = side * 0.25;
                vStripe.rotation.y = side * 0.15;
                group.add(vStripe);
            }

            // 蓝色腰线
            const waistGeo = new THREE.BoxGeometry(width + 0.04, 0.15, bodyLen + 0.04);
            const waist = new THREE.Mesh(waistGeo, blueMat);
            waist.position.y = -height * 0.3;
            waist.position.z = -length * 0.2;
            group.add(waist);

            // 「和谐号」文字
            addHexiehaoLabel(group, width, height, length);
            // G879 车次
            addG879Label(group, width, height, length);

            // 车头窗户（挡风玻璃）
            const windshieldMat = new THREE.MeshLambertMaterial({ color: 0x1a1a2a });
            const wsGeo = new THREE.BoxGeometry(width * 0.7, height * 0.35, 0.05);
            const ws = new THREE.Mesh(wsGeo, windshieldMat);
            ws.position.set(0, 0.5, length * 0.1);
            group.add(ws);

            // 侧窗
            for (let wz = -length * 0.42; wz <= -length * 0.02; wz += 2.0) {
                addWindows(group, width, wz, windowMat);
            }

            // 底部
            const underGeo = new THREE.BoxGeometry(width - 0.2, 0.4, bodyLen);
            const under = new THREE.Mesh(underGeo, darkMat);
            under.position.y = -height / 2 - 0.1;
            under.position.z = -length * 0.2;
            group.add(under);
        } else if (isTail) {
            // 尾车（反向的车头）
            const bodyLen = length * 0.6;
            const bodyGeo = new THREE.BoxGeometry(width, height, bodyLen);
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.z = length * 0.2;
            body.castShadow = true;
            group.add(body);

            const noseGeo = new THREE.CylinderGeometry(0, width / 2 * 0.85, length * 0.45, 12);
            const nose = new THREE.Mesh(noseGeo, bodyMat);
            nose.rotation.x = -Math.PI / 2;
            nose.position.z = -length * 0.35;
            nose.scale.set(1, 0.55, 1);
            nose.castShadow = true;
            group.add(nose);

            const waistGeo = new THREE.BoxGeometry(width + 0.04, 0.15, bodyLen + 0.04);
            const waist = new THREE.Mesh(waistGeo, blueMat);
            waist.position.y = -height * 0.3;
            waist.position.z = length * 0.2;
            group.add(waist);

            for (let wz = length * 0.02; wz <= length * 0.42; wz += 2.0) {
                addWindows(group, width, wz, windowMat);
            }

            const underGeo = new THREE.BoxGeometry(width - 0.2, 0.4, bodyLen);
            const under = new THREE.Mesh(underGeo, darkMat);
            under.position.y = -height / 2 - 0.1;
            under.position.z = length * 0.2;
            group.add(under);
        } else {
            // 中间车厢
            const bodyGeo = new THREE.BoxGeometry(width, height, length);
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.castShadow = true;
            group.add(body);

            // 蓝色腰线
            const waistGeo = new THREE.BoxGeometry(width + 0.04, 0.15, length + 0.04);
            const waist = new THREE.Mesh(waistGeo, blueMat);
            waist.position.y = -height * 0.3;
            group.add(waist);

            // 车厢号标识（06车特别突出）
            if (carNum === 6) {
                addCarNumberLabel(group, width, height, '06', true);
                // 车门（06车）
                addDoor(group, width, height, length);
            } else {
                addCarNumberLabel(group, width, height, String(carNum).padStart(2, '0'), false);
            }

            // 侧窗
            const winCount = Math.floor(length / 2.0) - 1;
            const startZ = -(winCount - 1) * 2.0 / 2;
            for (let w = 0; w < winCount; w++) {
                addWindows(group, width, startZ + w * 2.0, windowMat);
            }

            // 车厢接缝
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

        // 车顶
        const roofLen = (isHead || isTail) ? length * 0.6 : length;
        const roofGeo = new THREE.BoxGeometry(width - 0.3, 0.12, roofLen);
        const roofMat = new THREE.MeshLambertMaterial({ color: 0xe5e5e5 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = height / 2 + 0.06;
        if (isHead) roof.position.z = -length * 0.2;
        if (isTail) roof.position.z = length * 0.2;
        group.add(roof);

        return group;
    }

    function addHexiehaoLabel(group, carWidth, carHeight, carLength) {
        const c = document.createElement('canvas');
        c.width = 256; c.height = 64;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#f2f2f2';
        ctx.fillRect(0, 0, 256, 64);
        ctx.font = 'bold 36px "Noto Sans SC", sans-serif';
        ctx.fillStyle = '#cc0000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('和谐号', 128, 32);

        const texture = new THREE.CanvasTexture(c);
        const mat = new THREE.MeshBasicMaterial({ map: texture });
        const geo = new THREE.PlaneGeometry(3.5, 0.9);

        for (const side of [-1, 1]) {
            const label = new THREE.Mesh(geo, side === -1 ? mat : mat.clone());
            label.position.set(side * (carWidth / 2 + 0.02), 0.2, -carLength * 0.15);
            label.rotation.y = side * Math.PI / 2;
            group.add(label);
        }
    }

    function addG879Label(group, carWidth, carHeight, carLength) {
        const c = document.createElement('canvas');
        c.width = 128; c.height = 48;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#f2f2f2';
        ctx.fillRect(0, 0, 128, 48);
        ctx.font = 'bold 28px "Noto Sans SC", sans-serif';
        ctx.fillStyle = '#1565c0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('G879', 64, 24);

        const texture = new THREE.CanvasTexture(c);
        const mat = new THREE.MeshBasicMaterial({ map: texture });
        const geo = new THREE.PlaneGeometry(2, 0.75);

        for (const side of [-1, 1]) {
            const label = new THREE.Mesh(geo, side === -1 ? mat : mat.clone());
            label.position.set(side * (carWidth / 2 + 0.02), -0.5, -carLength * 0.15);
            label.rotation.y = side * Math.PI / 2;
            group.add(label);
        }
    }

    function addCarNumberLabel(group, carWidth, carHeight, numStr, isSpecial) {
        const c = document.createElement('canvas');
        c.width = 128; c.height = 64;
        const ctx = c.getContext('2d');
        ctx.fillStyle = isSpecial ? '#1565c0' : '#444444';
        ctx.fillRect(0, 0, 128, 64);
        ctx.font = 'bold 40px "Noto Sans SC", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(numStr, 64, 32);

        const texture = new THREE.CanvasTexture(c);
        const mat = new THREE.MeshBasicMaterial({ map: texture });
        const geo = new THREE.PlaneGeometry(1.2, 0.6);

        for (const side of [-1, 1]) {
            const label = new THREE.Mesh(geo, side === -1 ? mat : mat.clone());
            label.position.set(side * (carWidth / 2 + 0.02), 0.8, 5); // 靠近车门
            label.rotation.y = side * Math.PI / 2;
            group.add(label);
        }
    }

    function addDoor(group, carWidth, carHeight, carLength) {
        // 车门（在06车上，面向站台侧，即+x侧）
        const doorMat = new THREE.MeshLambertMaterial({ color: 0x999999 });
        const doorGeo = new THREE.BoxGeometry(0.05, 2.2, 1.2);
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(carWidth / 2 + 0.03, -0.2, 5);
        group.add(door);
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
    function createPersonModel() {
        personGroup = new THREE.Group();

        const skinMat = new THREE.MeshLambertMaterial({ color: 0xf5c5a3 });
        const shirtMat = new THREE.MeshLambertMaterial({ color: 0x2196f3 });
        const pantsMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const shoeMat = new THREE.MeshLambertMaterial({ color: 0x222222 });

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

        // 小人初始位置：站台上，远离06车
        personGroup.position.set(4, 1.2, 55);
        scene.add(personGroup);
    }

    function renderStation() {
        if (!renderer) return;
        renderer.render(scene, camera);
        if (phase === Phase.STATION) {
            requestAnimationFrame(renderStation);
        }
    }

    // ============================================================
    //  阶段3: BOARDING — 小人上车
    // ============================================================

    function startBoarding() {
        phase = Phase.BOARDING;
        showHint('正在走向06车...', 6000);

        // 06车是第6节车厢，z位置大约在 55 - 5*(16+0.3) = 55 - 81.5 = -26.5
        // 车门位置 z偏移+5, 所以车门z大约 -26.5 + 5 = -21.5
        const car6Z = 55 - 5 * (16 + 0.3);
        personTargetZ = car6Z + 5; // 车门位置
        personWalkTime = 0;
        lastTimestamp = performance.now();
        animateBoardingWalk(lastTimestamp);
    }

    function animateBoardingWalk(timestamp) {
        if (phase !== Phase.BOARDING) return;

        const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
        lastTimestamp = timestamp;
        personWalkTime += dt;

        const currentZ = personGroup.position.z;
        const distToTarget = currentZ - personTargetZ;

        if (distToTarget > 0.5) {
            // 走向06车（z方向减小）
            personGroup.position.z -= personSpeed * dt;

            // 腿部摆动
            const swing = Math.sin(personWalkTime * 8) * 0.4;
            personLeftLeg.rotation.x = swing;
            personRightLeg.rotation.x = -swing;
            personLeftArm.rotation.x = -swing * 0.6;
            personRightArm.rotation.x = swing * 0.6;

            // 相机跟随
            camera.position.z = personGroup.position.z + 8;
            camera.lookAt(personGroup.position.x - 4, 3, personGroup.position.z - 5);

            renderer.render(scene, camera);
            requestAnimationFrame(animateBoardingWalk);
        } else {
            // 到达车门，停止摆腿
            personLeftLeg.rotation.x = 0;
            personRightLeg.rotation.x = 0;
            personLeftArm.rotation.x = 0;
            personRightArm.rotation.x = 0;

            personGroup.position.z = personTargetZ;
            hideHint();

            // 转向车门（面向-x方向）
            personGroup.rotation.y = -Math.PI / 2;
            renderer.render(scene, camera);

            // 走进车门（淡出）
            showHint('上车啦！找到05D座位！', 2000);
            let fadeStart = performance.now();
            const fadeIn = (ts) => {
                const elapsed = (ts - fadeStart) / 1000;
                if (elapsed < 1.5) {
                    personGroup.position.x -= dt * 2;
                    // 淡出效果：缩小
                    const s = Math.max(0, 1 - elapsed / 1.2);
                    personGroup.scale.set(s, s, s);
                    renderer.render(scene, camera);
                    requestAnimationFrame(fadeIn);
                } else {
                    personGroup.visible = false;
                    renderer.render(scene, camera);

                    // 过渡到行驶阶段
                    setTimeout(() => {
                        hideHint();
                        transitionToDriving();
                    }, 1000);
                }
            };
            fadeStart = performance.now();
            requestAnimationFrame(fadeIn);
        }
    }

    // ============================================================
    //  过渡到行驶阶段
    // ============================================================

    function transitionToDriving() {
        // 清理站台场景
        cleanupScene();

        // 初始化行驶3D场景
        initDrivingScene();

        // 显示出发站名
        $('stationLabel').textContent = '列车出发！';
        $('stationLabel').classList.add('show');
        playAudio('depart');

        setTimeout(() => {
            $('stationLabel').classList.remove('show');
            setTimeout(() => startDriving(), 500);
        }, 2000);
    }

    function cleanupScene() {
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

        // 控制按钮事件
        $('btnView1').addEventListener('click', () => setCameraView(1));
        $('btnView2').addEventListener('click', () => setCameraView(2));
        $('btnView3').addEventListener('click', () => setCameraView(3));
        $('replayBtn').addEventListener('click', replay);
        window.addEventListener('keydown', onKeyDown);
    }

    function startDriving() {
        phase = Phase.DRIVING;
        $('hud').style.display = 'block';
        $('controls').style.display = 'flex';
        targetSpeed = CRUISE_SPEED;
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
            const car = createHexiehaoDrivingCar(isHead, isTail, carLength, carWidth, carHeight);
            car.position.z = -i * (carLength + gap);
            trainGroup.add(car);
        }

        trainGroup.position.y = 0.45;
        trainGroup.position.z = 35;
        scene.add(trainGroup);
    }

    function createHexiehaoDrivingCar(isHead, isTail, length, width, height) {
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
            addG879Label(group, width, height, length);

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
        if (phase !== Phase.DRIVING) return;
        switch (e.code) {
            case 'Digit1': setCameraView(1); break;
            case 'Digit2': setCameraView(2); break;
            case 'Digit3': setCameraView(3); break;
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
        // 第一段进度：北京南→德州东 (0-315km)
        const pct1 = Math.min(100, (Math.min(journeyDistance, DEZHOU_KM) / DEZHOU_KM) * 100);
        $('progressFill').style.width = pct1 + '%';

        // 第二段进度：德州东→济南东 (315-406km)
        if (journeyDistance > DEZHOU_KM) {
            const pct2 = Math.min(100, ((journeyDistance - DEZHOU_KM) / (TOTAL_DISTANCE - DEZHOU_KM)) * 100);
            $('progressFill2').style.width = pct2 + '%';
        }

        // 列车图标位置
        const totalPct = Math.min(100, (journeyDistance / TOTAL_DISTANCE) * 100);
        $('progressTrain').style.left = Math.min(95, (journeyDistance <= DEZHOU_KM ? pct1 : 100)) + '%';

        $('speedVal').textContent = Math.round(currentSpeed);
        $('distVal').textContent = journeyDistance.toFixed(1);

        const min = Math.floor(journeyTime / 60);
        const sec = Math.floor(journeyTime % 60);
        $('timeVal').textContent = min + ':' + (sec < 10 ? '0' : '') + sec;
    }

    // ============ 行驶动画循环 ============
    function animateDriving(timestamp) {
        if (phase !== Phase.DRIVING) return;
        animationId = requestAnimationFrame(animateDriving);

        const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
        lastTimestamp = timestamp;

        // 德州东停站逻辑
        const distToDezhou = DEZHOU_KM - journeyDistance;
        const distToEnd = TOTAL_DISTANCE - journeyDistance;

        if (dezhouState === 'approaching') {
            if (distToDezhou <= 0.5) {
                // 到达德州东
                dezhouState = 'stopping';
                journeyDistance = DEZHOU_KM;
                currentSpeed = 0;
                targetSpeed = 0;
            } else if (distToDezhou < DEZHOU_APPROACH_KM) {
                // 接近德州东 减速（最低保持15km/h避免渐近线问题）
                targetSpeed = Math.max(15, (distToDezhou / DEZHOU_APPROACH_KM) * CRUISE_SPEED);

                if (!speedMilestones['arriving-dezhou'] && distToDezhou < DEZHOU_APPROACH_KM * 0.8) {
                    speedMilestones['arriving-dezhou'] = true;
                    playAudio('arriving-dezhou');
                }
            } else {
                targetSpeed = CRUISE_SPEED;
            }
        } else if (dezhouState === 'stopping') {
            currentSpeed = 0;
            targetSpeed = 0;
            dezhouState = 'stopped';
            dezhouStopTimer = 0;

            $('stationLabel').textContent = '德州东站';
            $('stationLabel').classList.add('show');
            playAudio('dezhou-stop');
        } else if (dezhouState === 'stopped') {
            currentSpeed = 0;
            dezhouStopTimer += dt;
            if (dezhouStopTimer > DEZHOU_STOP_DURATION) {
                dezhouState = 'departing';
                $('stationLabel').classList.remove('show');
                playAudio('dezhou-depart');
            }
        } else if (dezhouState === 'departing') {
            targetSpeed = CRUISE_SPEED;
            if (currentSpeed > CRUISE_SPEED * 0.9) {
                dezhouState = 'passed';
            }
        } else if (dezhouState === 'passed') {
            // 驶向济南东
            if (distToEnd < 15) {
                targetSpeed = Math.max(15, (distToEnd / 15) * CRUISE_SPEED);

                if (!speedMilestones['arriving-jinan']) {
                    speedMilestones['arriving-jinan'] = true;
                    playAudio('arriving-jinan');
                }
            } else {
                targetSpeed = CRUISE_SPEED;
            }
        }

        // 平滑加减速
        const accelRate = 60;
        if (currentSpeed < targetSpeed) {
            currentSpeed = Math.min(targetSpeed, currentSpeed + accelRate * dt);
        } else if (currentSpeed > targetSpeed) {
            currentSpeed = Math.max(targetSpeed, currentSpeed - accelRate * 1.5 * dt);
        }

        // 更新距离和时间
        const timeCompression = 15;
        const distDelta = (currentSpeed / 3600) * dt * timeCompression;
        journeyDistance += distDelta;
        journeyTime += dt;

        // 速度里程碑播报
        if (!speedMilestones[200] && currentSpeed >= 200 && dezhouState === 'approaching') {
            speedMilestones[200] = true;
            playAudio('speed-200');
        }
        if (!speedMilestones[300] && currentSpeed >= 295 && dezhouState === 'approaching') {
            speedMilestones[300] = true;
            playAudio('speed-300');
        }

        // 环境移动
        const moveSpeed = (currentSpeed / 3.6) * dt * 2;
        envGroup.children.forEach(child => {
            child.position.z += moveSpeed;
            if (child.position.z > CONFIG.trackLength) {
                child.position.z -= CONFIG.trackLength * 2;
            }
        });

        updateHUD();

        // 到站检查
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
        if (animationId) cancelAnimationFrame(animationId);
        renderer.render(scene, camera);

        $('stationLabel').textContent = '济南东站';
        $('stationLabel').classList.add('show');

        setTimeout(() => {
            $('stationLabel').classList.remove('show');
            startArrivedPhase();
        }, 2000);
    }

    // ============================================================
    //  阶段6: ARRIVED — 庆祝 + 下车
    // ============================================================

    function startArrivedPhase() {
        phase = Phase.ARRIVED;

        const min = Math.floor(journeyTime / 60);
        const sec = Math.floor(journeyTime % 60);
        $('arrivalStats').textContent =
            '全程 ' + TOTAL_DISTANCE + ' 公里，途经德州东，用时 ' + min + ' 分 ' + sec + ' 秒';

        $('arrivalOverlay').classList.add('show');
        $('hud').style.display = 'none';
        $('controls').style.display = 'none';

        playAudio('arrived');
    }

    // ============ 重玩 ============
    function replay() {
        cleanupScene();

        // 重置所有状态
        phase = Phase.MAP;
        journeyDistance = 0;
        journeyTime = 0;
        currentSpeed = 0;
        targetSpeed = 0;
        speedMilestones = {};
        dezhouState = 'approaching';
        dezhouStopTimer = 0;
        currentView = 1;
        animationId = null;

        // 重置 UI
        $('arrivalOverlay').classList.remove('show');
        $('mapPhase').classList.remove('zooming', 'hidden');
        $('hud').style.display = 'none';
        $('controls').style.display = 'none';
        $('stationLabel').classList.remove('show');
        $('progressFill').style.width = '0%';
        $('progressFill2').style.width = '0%';

        stopCurrentAudio();
        initMap();
    }

    // ============ 启动 ============
    initMap();
})();
