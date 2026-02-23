// ============================================================
// 复兴号 CR400AF · 3D 探索
// 外观展示 + 驾驶室内部
// ============================================================

(function () {
    'use strict';

    // ============ 全局状态 ============
    let scene, camera, renderer, controls;
    let trainGroup = null;          // 列车外观模型组
    let cabinGroup = null;          // 驾驶室内部模型组
    let groundGroup = null;         // 地面/铁轨
    let currentMode = 'exterior';   // exterior | cabin
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();
    let clickableExterior = [];     // 可点击的外部车厢
    let clickableCabin = [];        // 可点击的驾驶室控件
    let hoveredObject = null;
    let selectedCar = null;
    let animationId = null;
    let clock = new THREE.Clock();

    // ============ 列车尺寸常量 ============
    const CAR_WIDTH = 3.36;
    const CAR_HEIGHT = 3.6;
    const HEAD_LENGTH = 26.5;
    const MID_LENGTH = 25;
    const GAP = 0.4;
    const NOSE_LENGTH = 12;        // 飞龙车鼻长度

    // ============ 颜色常量 ============
    const COLOR = {
        body: 0xf0f0f0,
        gold: 0xC8A951,
        goldDark: 0x9a7d3a,
        window: 0x2a4a6e,
        windowFrame: 0x888888,
        dark: 0x2a2a2a,
        floor: 0x555555,
        rail: 0x777777,
        sleeper: 0x8B7355,
        ground: 0x3a5a3a,
        led: 0xff3300,
        headlight: 0xffffcc,
    };

    // ============ 车厢配置 ============
    const CAR_CONFIG = [
        { num: 1, type: 'head', label: '01车', seat: '商务座', desc: '头车（驾驶室+商务座）', detail: '1车是<span class="highlight">头车</span>，前端是<span class="highlight">驾驶室</span>，后端设有<span class="highlight">商务座</span>，宽敞的1+2布局大座椅，可以180度旋转！' },
        { num: 2, type: 'mid', label: '02车', seat: '一等座', desc: '一等座车厢', detail: '2车是<span class="highlight">一等座</span>车厢，2+2布局，座椅间距更宽，配备独立阅读灯和充电插座。' },
        { num: 3, type: 'mid', label: '03车', seat: '二等座', desc: '二等座车厢', detail: '3车是<span class="highlight">二等座</span>车厢，3+2布局，是最常见的座位类型，每排5个座位。' },
        { num: 4, type: 'mid', label: '04车', seat: '餐车/二等', desc: '餐车+二等座', detail: '4车是<span class="highlight">餐车</span>和<span class="highlight">二等座</span>合并车厢，中间有餐吧台，可以买零食和盒饭！' },
        { num: 5, type: 'mid', label: '05车', seat: '二等座', desc: '二等座车厢', detail: '5车是<span class="highlight">二等座</span>车厢，3+2布局。窗户又大又明亮，可以看风景！' },
        { num: 6, type: 'mid', label: '06车', seat: '二等座', desc: '二等座车厢', detail: '6车是<span class="highlight">二等座</span>车厢。你知道吗？复兴号的Wi-Fi覆盖全车，可以上网！' },
        { num: 7, type: 'mid', label: '07车', seat: '一等座', desc: '一等座车厢', detail: '7车是<span class="highlight">一等座</span>车厢，2+2布局，座椅更宽更舒服，适合长途旅行。' },
        { num: 8, type: 'tail', label: '08车', seat: '商务座', desc: '尾车（驾驶室+商务座）', detail: '8车是<span class="highlight">尾车</span>，后端有<span class="highlight">驾驶室</span>，列车掉头后这里就变成车头了！' },
    ];

    // ============ 驾驶室控件数据 ============
    const CAB_CONTROLS = [
        { id: 'atp_screen', name: 'ATP 安全监控屏', desc: '这是<span class="highlight">ATP（列车自动防护系统）</span>的显示屏。它像列车的"大脑"，时刻监控着列车的速度和前方信号。如果司机不小心超速了，ATP 会<span class="highlight">自动刹车</span>，保证旅客安全！', color: 0x1a3a5a },
        { id: 'speed_gauge', name: '速度表', desc: '圆形的<span class="highlight">速度表</span>，指针会随着列车加速而转动。最高刻度到 <span class="highlight">400km/h</span>！复兴号的运营速度是 350km/h，但测试时曾跑到 420km/h！', color: 0x1a2a3a },
        { id: 'traction_handle', name: '牵引/制动手柄', desc: '这是最重要的操纵装置——<span class="highlight">牵引制动一体化手柄</span>。往前推是<span class="highlight">加速（牵引）</span>，往后拉是<span class="highlight">减速（制动）</span>。司机就像在玩一个大型游戏手柄！', color: 0x444444 },
        { id: 'direction_handle', name: '方向手柄', desc: '控制列车<span class="highlight">前进或后退</span>的手柄。有三个档位：向前、零位、向后。停车时必须回到零位。', color: 0x555555 },
        { id: 'emergency_brake', name: '紧急制动按钮', desc: '红色的大蘑菇头按钮！遇到<span class="highlight">紧急情况</span>时按下去，列车会用最大力量<span class="highlight">紧急停车</span>。这是最后的安全防线！按下后需要旋转才能弹起恢复。', color: 0xcc0000 },
        { id: 'horn_btn', name: '鸣笛按钮', desc: '<span class="highlight">鸣笛按钮</span>！按下去列车就会发出"嘟——"的声音。进站、过道口、遇到行人时都要鸣笛警示。复兴号的喇叭声音很特别，像是在唱歌！', color: 0xccaa00 },
        { id: 'pantograph_sw', name: '受电弓开关', desc: '控制车顶<span class="highlight">受电弓</span>升降的开关。受电弓升起后紧贴在头顶的电线（接触网）上，从 <span class="highlight">25000伏</span> 的高压电线中获取电力驱动列车！', color: 0x3366aa },
        { id: 'door_panel', name: '车门控制面板', desc: '控制全列车<span class="highlight">车门</span>开关的面板。左侧开门、右侧开门、关门都在这里。到站后司机会按下对应方向的开门按钮，让旅客上下车。', color: 0x336633 },
        { id: 'radio', name: '无线电台', desc: '<span class="highlight">无线电通信设备</span>，用于和车站调度员通话。出发前、进站前都要和调度确认信号和轨道。就像飞行员和塔台通话一样！', color: 0x3a3a4a },
        { id: 'wiper_sw', name: '雨刷器开关', desc: '控制前挡风玻璃<span class="highlight">雨刷器</span>的开关。下雨、下雪时打开雨刷器，保证司机能看清前方的铁路。有慢速和快速两个档位。', color: 0x4a4a5a },
        { id: 'headlight_sw', name: '头灯开关', desc: '控制列车<span class="highlight">前大灯</span>的开关。夜间行驶、进隧道时要开灯。复兴号的大灯非常亮，能照亮前方 <span class="highlight">800米</span> 的铁路！', color: 0x4a4a5a },
        { id: 'vigilance', name: '警惕装置（踏板）', desc: '司机脚下的<span class="highlight">警惕踏板</span>（也叫"死人开关"）。司机必须每隔一段时间踩一下，证明自己是清醒的。如果超过30秒没踩，列车会<span class="highlight">自动刹车</span>！', color: 0x555555 },
    ];

    // ============ 初始化 ============
    function init() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB);
        scene.fog = new THREE.Fog(0x87CEEB, 200, 600);

        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(40, 20, 80);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.insertBefore(renderer.domElement, document.body.firstChild);
        renderer.domElement.id = 'three-canvas';

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.minDistance = 5;
        controls.maxDistance = 250;
        controls.target.set(0, 2, 0);
        controls.maxPolarAngle = Math.PI * 0.85;

        addLights();
        createGround();
        createTracks();
        createTrain();
        createCabinInterior();

        // 事件
        window.addEventListener('resize', onResize);
        window.addEventListener('click', onClick);
        window.addEventListener('mousemove', onMouseMove);
        setupControlButtons();

        // 隐藏 loading
        setTimeout(() => {
            const loading = document.getElementById('loading');
            loading.classList.add('fade-out');
            setTimeout(() => loading.style.display = 'none', 500);
        }, 800);

        animate();
    }

    // ============ 灯光 ============
    function addLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 0.8);
        sun.position.set(50, 80, 30);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.left = -150;
        sun.shadow.camera.right = 150;
        sun.shadow.camera.top = 50;
        sun.shadow.camera.bottom = -50;
        scene.add(sun);

        const fill = new THREE.DirectionalLight(0xaaccff, 0.3);
        fill.position.set(-30, 20, -20);
        scene.add(fill);
    }

    // ============ 地面和铁轨 ============
    function createGround() {
        groundGroup = new THREE.Group();

        // 地面
        const groundGeo = new THREE.PlaneGeometry(800, 200);
        const groundMat = new THREE.MeshLambertMaterial({ color: COLOR.ground });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.5;
        ground.receiveShadow = true;
        groundGroup.add(ground);

        // 道砟（碎石路基）
        const ballastGeo = new THREE.BoxGeometry(320, 0.4, 6);
        const ballastMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const ballast = new THREE.Mesh(ballastGeo, ballastMat);
        ballast.position.y = -0.3;
        ballast.receiveShadow = true;
        groundGroup.add(ballast);

        scene.add(groundGroup);
    }

    function createTracks() {
        const trackGroup = new THREE.Group();
        const railMat = new THREE.MeshLambertMaterial({ color: COLOR.rail });
        const sleeperMat = new THREE.MeshLambertMaterial({ color: COLOR.sleeper });
        const railGauge = 1.435;
        const trackLen = 320;

        // 两根钢轨
        for (const side of [-1, 1]) {
            const rail = new THREE.Mesh(
                new THREE.BoxGeometry(trackLen, 0.15, 0.07),
                railMat
            );
            rail.position.set(0, -0.05, side * railGauge / 2);
            trackGroup.add(rail);
        }

        // 轨枕
        for (let x = -trackLen / 2; x < trackLen / 2; x += 0.6) {
            const sleeper = new THREE.Mesh(
                new THREE.BoxGeometry(0.22, 0.1, 2.6),
                sleeperMat
            );
            sleeper.position.set(x, -0.15, 0);
            trackGroup.add(sleeper);
        }

        trackGroup.position.y = 0;
        scene.add(trackGroup);
    }

    // ============ 创建完整列车 ============
    function createTrain() {
        trainGroup = new THREE.Group();
        clickableExterior = [];
        let xOffset = 0;

        for (let i = 0; i < CAR_CONFIG.length; i++) {
            const cfg = CAR_CONFIG[i];
            const isHead = cfg.type === 'head';
            const isTail = cfg.type === 'tail';
            const carLen = isHead || isTail ? HEAD_LENGTH : MID_LENGTH;

            const car = createCar(cfg, carLen);
            car.position.x = xOffset - carLen / 2;
            car.userData = { carIndex: i, config: cfg };
            trainGroup.add(car);

            // 记录可点击区域（用车身主体）
            car.traverse((child) => {
                if (child.isMesh && child.userData.isCarBody) {
                    clickableExterior.push(child);
                }
            });

            xOffset -= carLen + GAP;
        }

        // 将列车居中
        const totalLen = CAR_CONFIG.reduce((sum, cfg) => sum + (cfg.type === 'head' || cfg.type === 'tail' ? HEAD_LENGTH : MID_LENGTH), 0) + GAP * 7;
        trainGroup.position.x = totalLen / 2;
        trainGroup.position.y = 1.0;

        scene.add(trainGroup);
    }

    function createCar(cfg, length) {
        const group = new THREE.Group();
        const isHead = cfg.type === 'head';
        const isTail = cfg.type === 'tail';

        const bodyMat = new THREE.MeshPhongMaterial({ color: COLOR.body, specular: 0x222222, shininess: 40 });
        const goldMat = new THREE.MeshPhongMaterial({ color: COLOR.gold, specular: 0x444444, shininess: 60 });
        const windowMat = new THREE.MeshPhongMaterial({ color: COLOR.window, specular: 0x666666, shininess: 80, transparent: true, opacity: 0.85 });
        const darkMat = new THREE.MeshLambertMaterial({ color: COLOR.dark });

        if (isHead || isTail) {
            // 头/尾车
            const noseDir = isHead ? 1 : -1;
            const bodyLen = length - NOSE_LENGTH;

            // 车身主体
            const body = new THREE.Mesh(new THREE.BoxGeometry(bodyLen, CAR_HEIGHT, CAR_WIDTH), bodyMat);
            body.position.x = -noseDir * NOSE_LENGTH / 2;
            body.castShadow = true;
            body.userData.isCarBody = true;
            body.userData.parentCar = group;
            group.add(body);

            // 车顶（平滑弧面）
            const roofGeo = new THREE.BoxGeometry(bodyLen, 0.15, CAR_WIDTH + 0.04);
            const roof = new THREE.Mesh(roofGeo, bodyMat);
            roof.position.set(-noseDir * NOSE_LENGTH / 2, CAR_HEIGHT / 2 + 0.05, 0);
            group.add(roof);

            // 流线型车鼻 - 使用多段几何体营造弧线
            createNose(group, noseDir, bodyMat, goldMat);

            // 挡风玻璃（贴合在车鼻上方，后仰倾斜）
            const windshieldMat = new THREE.MeshPhongMaterial({ color: 0x1a2a3a, specular: 0x888888, shininess: 100, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
            const windshield = new THREE.Mesh(new THREE.PlaneGeometry(CAR_WIDTH * 0.55, CAR_HEIGHT * 0.32), windshieldMat);
            // 先设旋转再设位置：面朝前方且后仰
            windshield.rotation.order = 'YXZ';
            windshield.rotation.y = noseDir > 0 ? Math.PI / 2 : -Math.PI / 2;
            windshield.rotation.x = -0.35; // 后仰倾斜
            windshield.position.set(noseDir * (NOSE_LENGTH * 0.45), CAR_HEIGHT * 0.3, 0);
            group.add(windshield);

            // LED 目的地显示屏
            const ledCanvas = createLEDTexture(isHead ? '北京南 → 上海虹桥' : 'G1次');
            const ledMat = new THREE.MeshBasicMaterial({ map: ledCanvas });
            const led = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.5), ledMat);
            led.position.set(noseDir * (length / 2 - 5.5), CAR_HEIGHT * 0.35, noseDir > 0 ? CAR_WIDTH / 2 + 0.02 : -(CAR_WIDTH / 2 + 0.02));
            led.rotation.y = noseDir > 0 ? Math.PI / 2 : -Math.PI / 2;
            group.add(led);

            // 头灯
            for (const zSide of [-1, 1]) {
                const headlight = new THREE.Mesh(
                    new THREE.CircleGeometry(0.2, 12),
                    new THREE.MeshBasicMaterial({ color: COLOR.headlight })
                );
                headlight.position.set(noseDir * (length / 2 - 2.5), -CAR_HEIGHT * 0.1, zSide * CAR_WIDTH * 0.35);
                headlight.rotation.y = noseDir > 0 ? Math.PI / 6 * zSide : Math.PI + Math.PI / 6 * zSide;
                group.add(headlight);
            }

            // 金色腰线
            const waist = new THREE.Mesh(
                new THREE.BoxGeometry(bodyLen + 0.1, 0.12, CAR_WIDTH + 0.04),
                goldMat
            );
            waist.position.set(-noseDir * NOSE_LENGTH / 2, -CAR_HEIGHT * 0.25, 0);
            group.add(waist);

            // 车窗
            const winStart = -noseDir * NOSE_LENGTH / 2 - bodyLen / 2 + 1.5;
            const winEnd = -noseDir * NOSE_LENGTH / 2 + bodyLen / 2 - 1.5;
            for (let wx = winStart; wx <= winEnd; wx += 1.8) {
                addWindow(group, wx, windowMat);
            }

            // 底部设备舱
            const underBody = new THREE.Mesh(new THREE.BoxGeometry(bodyLen, 0.5, CAR_WIDTH - 0.3), darkMat);
            underBody.position.set(-noseDir * NOSE_LENGTH / 2, -CAR_HEIGHT / 2 - 0.15, 0);
            group.add(underBody);

            // 受电弓（仅头车和某些中间车顶上有）
            if (isHead) createPantograph(group, -2);

        } else {
            // 中间车
            const body = new THREE.Mesh(new THREE.BoxGeometry(length, CAR_HEIGHT, CAR_WIDTH), bodyMat);
            body.castShadow = true;
            body.userData.isCarBody = true;
            body.userData.parentCar = group;
            group.add(body);

            // 车顶（平滑弧面）
            const roofGeo = new THREE.BoxGeometry(length, 0.15, CAR_WIDTH + 0.04);
            const roof = new THREE.Mesh(roofGeo, bodyMat);
            roof.position.y = CAR_HEIGHT / 2 + 0.05;
            group.add(roof);

            // 金色腰线
            const waist = new THREE.Mesh(
                new THREE.BoxGeometry(length + 0.1, 0.12, CAR_WIDTH + 0.04),
                goldMat
            );
            waist.position.y = -CAR_HEIGHT * 0.25;
            group.add(waist);

            // 车窗
            for (let wx = -length / 2 + 1.5; wx <= length / 2 - 1.5; wx += 1.8) {
                addWindow(group, wx, windowMat);
            }

            // 车门（每侧2个）
            for (const zSide of [-1, 1]) {
                for (const xPos of [-length * 0.3, length * 0.3]) {
                    addDoor(group, xPos, zSide, darkMat);
                }
            }

            // 底部设备舱
            const underBody = new THREE.Mesh(new THREE.BoxGeometry(length, 0.5, CAR_WIDTH - 0.3), darkMat);
            underBody.position.y = -CAR_HEIGHT / 2 - 0.15;
            group.add(underBody);

            // 受电弓（3车和6车有）
            if (cfg.num === 3 || cfg.num === 6) {
                createPantograph(group, 0);
            }

            // 车厢连接处挡板
            const divMat = new THREE.MeshLambertMaterial({ color: 0xdcdcdc });
            for (const xEnd of [length / 2, -length / 2]) {
                const div = new THREE.Mesh(new THREE.BoxGeometry(0.08, CAR_HEIGHT + 0.02, CAR_WIDTH + 0.04), divMat);
                div.position.x = xEnd;
                group.add(div);
            }
        }

        // 转向架（所有车厢通用）
        const carLen = isHead || isTail ? HEAD_LENGTH : MID_LENGTH;
        createBogies(group, carLen, isHead, isTail);

        // 车号标签
        addCarLabel(group, cfg);

        return group;
    }

    // ============ 流线型车鼻 ============
    function createNose(group, dir, bodyMat, goldMat) {
        // 使用 LatheGeometry 生成光滑旋转体车鼻
        const points = [];
        const noseSegs = 30;
        for (let i = 0; i <= noseSegs; i++) {
            const t = i / noseSegs; // 0=尖端, 1=根部
            // 使用三次贝塞尔曲线形状：从尖端逐渐展开到全宽
            const radius = CAR_WIDTH / 2 * Math.pow(t, 0.6);
            const x = t * NOSE_LENGTH;
            points.push(new THREE.Vector2(radius, x));
        }

        const latheGeo = new THREE.LatheGeometry(points, 32, 0, Math.PI * 2);
        const noseMesh = new THREE.Mesh(latheGeo, bodyMat);
        noseMesh.rotation.z = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
        noseMesh.position.x = dir > 0 ? NOSE_LENGTH / 2 : -NOSE_LENGTH / 2;
        // 垂直方向压扁，模拟复兴号扁平的子弹头
        noseMesh.scale.y = 0.55;
        noseMesh.castShadow = true;
        noseMesh.userData.isCarBody = true;
        noseMesh.userData.parentCar = group;
        group.add(noseMesh);

        // 金色V形条纹（沿车鼻两侧）
        const vLen = NOSE_LENGTH * 0.6;
        const vStripeGeo = new THREE.BoxGeometry(vLen, 0.04, 0.08);
        for (const zSide of [-1, 1]) {
            const vStripe = new THREE.Mesh(vStripeGeo, goldMat);
            vStripe.position.set(dir * NOSE_LENGTH * 0.25, -CAR_HEIGHT * 0.1, zSide * CAR_WIDTH * 0.3);
            vStripe.rotation.z = dir * zSide * 0.12;
            vStripe.rotation.y = zSide * 0.1;
            group.add(vStripe);
        }
    }

    // ============ 车窗 ============
    function addWindow(group, xPos, windowMat) {
        for (const zSide of [-1, 1]) {
            const win = new THREE.Mesh(
                new THREE.PlaneGeometry(1.2, 0.9),
                windowMat
            );
            win.position.set(xPos, CAR_HEIGHT * 0.1, zSide * (CAR_WIDTH / 2 + 0.02));
            win.rotation.y = zSide > 0 ? Math.PI / 2 : -Math.PI / 2;
            group.add(win);

            // 窗框
            const frameMat = new THREE.MeshLambertMaterial({ color: COLOR.windowFrame });
            const frameGeo = new THREE.BoxGeometry(1.3, 1.0, 0.02);
            const frame = new THREE.Mesh(frameGeo, frameMat);
            frame.position.copy(win.position);
            frame.position.z += zSide * (-0.01);
            frame.rotation.y = win.rotation.y;
            group.add(frame);
        }
    }

    // ============ 车门 ============
    function addDoor(group, xPos, zSide, darkMat) {
        const doorW = 1.3;
        const doorH = 2.2;
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(doorW, doorH, 0.06),
            darkMat
        );
        door.position.set(xPos, -CAR_HEIGHT / 2 + doorH / 2 + 0.1, zSide * (CAR_WIDTH / 2 + 0.02));
        door.rotation.y = zSide > 0 ? Math.PI / 2 : -Math.PI / 2;
        group.add(door);

        // 门把手区域
        const handleMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.03), handleMat);
        handle.position.set(xPos, -CAR_HEIGHT / 2 + doorH / 2, zSide * (CAR_WIDTH / 2 + 0.06));
        handle.rotation.y = zSide > 0 ? Math.PI / 2 : -Math.PI / 2;
        group.add(handle);
    }

    // ============ 受电弓 ============
    function createPantograph(group, xPos) {
        const mat = new THREE.MeshLambertMaterial({ color: 0x555555 });
        const wireFrame = new THREE.MeshLambertMaterial({ color: 0x888888 });

        // 底座
        const base = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.15, 1.2), mat);
        base.position.set(xPos, CAR_HEIGHT / 2 + 0.15, 0);
        group.add(base);

        // 下臂
        const lowerArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.5, 0.08), mat);
        lowerArm.position.set(xPos - 0.2, CAR_HEIGHT / 2 + 0.9, 0);
        lowerArm.rotation.z = 0.15;
        group.add(lowerArm);

        // 上臂
        const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.2, 0.06), mat);
        upperArm.position.set(xPos + 0.1, CAR_HEIGHT / 2 + 1.8, 0);
        upperArm.rotation.z = -0.2;
        group.add(upperArm);

        // 碳滑板（顶部横杆）
        const slide = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 1.8), wireFrame);
        slide.position.set(xPos + 0.15, CAR_HEIGHT / 2 + 2.3, 0);
        group.add(slide);
    }

    // ============ 转向架 ============
    function createBogies(group, carLen, isHead, isTail) {
        const bogieSpacing = carLen * 0.6;
        const bogieMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const wheelMat = new THREE.MeshLambertMaterial({ color: 0x444444 });

        for (const xSide of [-1, 1]) {
            const bogieX = xSide * bogieSpacing / 2;
            // 偏移：头车/尾车的转向架位置不同
            const offset = isHead ? -3 : isTail ? 3 : 0;

            // 转向架框架
            const frame = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.3, CAR_WIDTH * 0.7), bogieMat);
            frame.position.set(bogieX + offset, -CAR_HEIGHT / 2 - 0.35, 0);
            group.add(frame);

            // 轮对（每个转向架2对轮）
            for (const wx of [-0.8, 0.8]) {
                for (const wz of [-0.5, 0.5]) {
                    const wheel = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.43, 0.43, 0.12, 12),
                        wheelMat
                    );
                    wheel.rotation.x = Math.PI / 2;
                    wheel.position.set(bogieX + offset + wx, -CAR_HEIGHT / 2 - 0.55, wz);
                    group.add(wheel);
                }
            }
        }
    }

    // ============ 车号标签（Canvas 纹理） ============
    function addCarLabel(group, cfg) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.clearRect(0, 0, 256, 128);

        // 车号
        ctx.font = 'bold 48px "Noto Sans SC", sans-serif';
        ctx.fillStyle = '#333333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cfg.label, 128, 45);

        // 座位类型
        ctx.font = '28px "Noto Sans SC", sans-serif';
        ctx.fillStyle = '#C8A951';
        ctx.fillText(cfg.seat, 128, 95);

        const texture = new THREE.CanvasTexture(canvas);
        const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });

        for (const zSide of [-1, 1]) {
            const label = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 1.8), mat);
            const labelX = cfg.type === 'head' ? -3 : cfg.type === 'tail' ? 3 : 0;
            label.position.set(labelX, CAR_HEIGHT * 0.35, zSide * (CAR_WIDTH / 2 + 0.03));
            label.rotation.y = zSide > 0 ? Math.PI / 2 : -Math.PI / 2;
            group.add(label);
        }
    }

    // ============ LED 显示屏纹理 ============
    function createLEDTexture(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 96;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, 512, 96);
        ctx.font = 'bold 36px "Noto Sans SC", sans-serif';
        ctx.fillStyle = '#ff3300';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 256, 48);
        return new THREE.CanvasTexture(canvas);
    }

    // ============ 驾驶室内部 ============
    function createCabinInterior() {
        cabinGroup = new THREE.Group();
        cabinGroup.visible = false;
        clickableCabin = [];

        const floorMat = new THREE.MeshStandardMaterial({ color: 0x4a4a5a, roughness: 0.6 });
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x6a6a7a, roughness: 0.4 });
        const consoleMat = new THREE.MeshStandardMaterial({ color: 0x3a3a4a, roughness: 0.3, metalness: 0.2 });

        // 驾驶室空间：宽约3m，深约4m，高约2.3m
        const cabW = 3.2, cabD = 4.0, cabH = 2.3;

        // 地板
        const floor = new THREE.Mesh(new THREE.BoxGeometry(cabD, 0.1, cabW), floorMat);
        floor.position.y = 0;
        cabinGroup.add(floor);

        // 天花板
        const ceiling = new THREE.Mesh(new THREE.BoxGeometry(cabD, 0.1, cabW), new THREE.MeshStandardMaterial({ color: 0x8a8a9a, roughness: 0.3 }));
        ceiling.position.y = cabH;
        cabinGroup.add(ceiling);

        // 左右墙壁
        for (const zSide of [-1, 1]) {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(cabD, cabH, 0.1), wallMat);
            wall.position.set(0, cabH / 2, zSide * cabW / 2);
            cabinGroup.add(wall);
        }

        // 后墙（驾驶室与客室之间的隔墙）
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, cabH, cabW), wallMat);
        backWall.position.set(-cabD / 2, cabH / 2, 0);
        cabinGroup.add(backWall);

        // 前挡风玻璃（大面积倾斜玻璃）
        const glassMat = new THREE.MeshPhongMaterial({
            color: 0x3a5a7a,
            specular: 0xaaaaaa,
            shininess: 100,
            transparent: true,
            opacity: 0.4,
        });
        const windshield = new THREE.Mesh(new THREE.PlaneGeometry(cabW * 0.9, cabH * 0.7), glassMat);
        windshield.position.set(cabD / 2 - 0.2, cabH * 0.55, 0);
        windshield.rotation.y = Math.PI / 2;
        windshield.rotation.z = 0.15; // 微微倾斜
        cabinGroup.add(windshield);

        // 透过玻璃看到的铁轨（简化的延伸线）
        const trackLineMat = new THREE.MeshBasicMaterial({ color: 0x666666 });
        for (const zOff of [-0.4, 0.4]) {
            const trackLine = new THREE.Mesh(new THREE.BoxGeometry(30, 0.05, 0.04), trackLineMat);
            trackLine.position.set(cabD / 2 + 15, -0.3, zOff);
            cabinGroup.add(trackLine);
        }

        // ========== 操纵台 ==========
        // 主操纵台（弧形台面）
        const consoleTop = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.08, cabW * 0.85),
            consoleMat
        );
        consoleTop.position.set(cabD / 2 - 1.5, 0.95, 0);
        consoleTop.rotation.z = -0.1;
        cabinGroup.add(consoleTop);

        // 操纵台下方面板
        const consoleFront = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.7, cabW * 0.85),
            new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.5 })
        );
        consoleFront.position.set(cabD / 2 - 0.7, 0.6, 0);
        cabinGroup.add(consoleFront);

        // 驾驶座椅
        createDriverSeat(cabinGroup);

        // ========== 各控件 ==========
        // 1. ATP 安全监控屏（中央大屏）
        const atpScreen = createScreen(1.4, 0.8, CAB_CONTROLS[0]);
        atpScreen.position.set(cabD / 2 - 1.2, 1.4, 0);
        atpScreen.rotation.y = -Math.PI / 2;
        atpScreen.rotation.x = 0.15;
        cabinGroup.add(atpScreen);

        // 2. 速度表（ATP屏幕右侧）
        const speedGauge = createGauge(0.3, CAB_CONTROLS[1]);
        speedGauge.position.set(cabD / 2 - 1.2, 1.4, 0.9);
        speedGauge.rotation.y = -Math.PI / 2;
        cabinGroup.add(speedGauge);

        // 3. 牵引/制动手柄（左手侧）
        const tractionHandle = createHandle(CAB_CONTROLS[2]);
        tractionHandle.position.set(cabD / 2 - 1.8, 0.95, -0.8);
        cabinGroup.add(tractionHandle);

        // 4. 方向手柄（牵引手柄旁边）
        const dirHandle = createSmallHandle(CAB_CONTROLS[3]);
        dirHandle.position.set(cabD / 2 - 1.8, 0.95, -0.5);
        cabinGroup.add(dirHandle);

        // 5. 紧急制动按钮（操纵台中央偏右，醒目位置）
        const emergBrake = createMushroomButton(0.12, CAB_CONTROLS[4]);
        emergBrake.position.set(cabD / 2 - 1.5, 1.02, 0.5);
        cabinGroup.add(emergBrake);

        // 6. 鸣笛按钮
        const hornBtn = createPushButton(0.06, CAB_CONTROLS[5]);
        hornBtn.position.set(cabD / 2 - 1.5, 1.02, 0.3);
        cabinGroup.add(hornBtn);

        // 7. 受电弓开关
        const pantoSw = createToggleSwitch(CAB_CONTROLS[6]);
        pantoSw.position.set(cabD / 2 - 1.1, 1.02, -1.0);
        cabinGroup.add(pantoSw);

        // 8. 车门控制面板
        const doorPanel = createDoorPanel(CAB_CONTROLS[7]);
        doorPanel.position.set(cabD / 2 - 1.1, 1.02, 1.0);
        cabinGroup.add(doorPanel);

        // 9. 无线电台（左侧墙壁上）
        const radio = createRadioUnit(CAB_CONTROLS[8]);
        radio.position.set(-cabD / 2 + 0.6, 1.2, -cabW / 2 + 0.15);
        radio.rotation.y = Math.PI / 2;
        cabinGroup.add(radio);

        // 10. 雨刷器开关
        const wiperSw = createToggleSwitch(CAB_CONTROLS[9]);
        wiperSw.position.set(cabD / 2 - 0.8, 1.65, -0.6);
        cabinGroup.add(wiperSw);

        // 11. 头灯开关
        const lightSw = createToggleSwitch(CAB_CONTROLS[10]);
        lightSw.position.set(cabD / 2 - 0.8, 1.65, -0.3);
        cabinGroup.add(lightSw);

        // 12. 警惕踏板（地板上）
        const vigilance = createVigilancePedal(CAB_CONTROLS[11]);
        vigilance.position.set(cabD / 2 - 2.0, 0.06, 0);
        cabinGroup.add(vigilance);

        // 驾驶室内灯光
        const cabLight = new THREE.PointLight(0xffffff, 0.5, 8);
        cabLight.position.set(0, cabH - 0.3, 0);
        cabinGroup.add(cabLight);

        const consolLight = new THREE.PointLight(0x88aaff, 0.3, 3);
        consolLight.position.set(cabD / 2 - 1.2, 1.5, 0);
        cabinGroup.add(consolLight);

        scene.add(cabinGroup);
    }

    // ============ 驾驶座椅 ============
    function createDriverSeat(parent) {
        const seatMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.6 });
        const group = new THREE.Group();

        // 座垫
        const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.5), seatMat);
        cushion.position.y = 0.5;
        group.add(cushion);

        // 靠背
        const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.1), seatMat);
        backrest.position.set(0, 0.82, -0.22);
        backrest.rotation.x = 0.1;
        group.add(backrest);

        // 底座
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.4, 8), new THREE.MeshLambertMaterial({ color: 0x444444 }));
        base.position.y = 0.25;
        group.add(base);

        // 扶手
        for (const zSide of [-1, 1]) {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.06), seatMat);
            arm.position.set(-0.05, 0.62, zSide * 0.28);
            group.add(arm);
        }

        group.position.set(0, 0, 0);
        parent.add(group);
    }

    // ============ 控件创建函数 ============

    // 屏幕（ATP主屏）
    function createScreen(w, h, data) {
        const group = new THREE.Group();

        // 屏幕边框
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(w + 0.06, h + 0.06, 0.04),
            new THREE.MeshLambertMaterial({ color: 0x222222 })
        );
        group.add(frame);

        // 屏幕内容（Canvas 纹理）
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 320;
        const ctx = canvas.getContext('2d');

        // 背景
        ctx.fillStyle = '#0a1a2a';
        ctx.fillRect(0, 0, 512, 320);

        // 速度显示
        ctx.font = 'bold 80px monospace';
        ctx.fillStyle = '#00ff66';
        ctx.textAlign = 'center';
        ctx.fillText('350', 256, 120);
        ctx.font = '24px sans-serif';
        ctx.fillStyle = '#88aacc';
        ctx.fillText('km/h', 256, 155);

        // 线路信息
        ctx.font = '22px sans-serif';
        ctx.fillStyle = '#4488cc';
        ctx.fillText('京沪高铁 · G1次', 256, 200);
        ctx.fillText('北京南 → 上海虹桥', 256, 235);

        // 信号指示
        ctx.fillStyle = '#00cc00';
        ctx.fillRect(30, 270, 20, 20);
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText('绿灯 · 正常运行', 160, 285);

        // ATP 标志
        ctx.font = 'bold 20px monospace';
        ctx.fillStyle = '#ffcc00';
        ctx.fillText('ATP 正常', 430, 30);

        const texture = new THREE.CanvasTexture(canvas);
        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(w, h),
            new THREE.MeshBasicMaterial({ map: texture })
        );
        screen.position.z = 0.025;
        screen.userData.cabControl = data;
        clickableCabin.push(screen);
        group.add(screen);

        return group;
    }

    // 圆形速度表
    function createGauge(radius, data) {
        const group = new THREE.Group();

        // 表盘背景
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(128, 128, 120, 0, Math.PI * 2);
        ctx.fill();

        // 刻度
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        for (let i = 0; i <= 40; i++) {
            const angle = -Math.PI * 0.75 + (Math.PI * 1.5) * (i / 40);
            const r1 = i % 5 === 0 ? 95 : 105;
            const r2 = 115;
            ctx.beginPath();
            ctx.moveTo(128 + Math.cos(angle) * r1, 128 + Math.sin(angle) * r1);
            ctx.lineTo(128 + Math.cos(angle) * r2, 128 + Math.sin(angle) * r2);
            ctx.stroke();

            if (i % 5 === 0) {
                ctx.font = '14px sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(String(i * 10), 128 + Math.cos(angle) * 78, 128 + Math.sin(angle) * 78);
            }
        }

        // 指针（指向350）
        const pAngle = -Math.PI * 0.75 + (Math.PI * 1.5) * (350 / 400);
        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(128, 128);
        ctx.lineTo(128 + Math.cos(pAngle) * 90, 128 + Math.sin(pAngle) * 90);
        ctx.stroke();

        // 中心点
        ctx.fillStyle = '#ff3333';
        ctx.beginPath();
        ctx.arc(128, 128, 6, 0, Math.PI * 2);
        ctx.fill();

        // 数字
        ctx.font = 'bold 28px monospace';
        ctx.fillStyle = '#00ff66';
        ctx.textAlign = 'center';
        ctx.fillText('350', 128, 170);
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#888888';
        ctx.fillText('km/h', 128, 195);

        const texture = new THREE.CanvasTexture(canvas);
        const gauge = new THREE.Mesh(
            new THREE.CircleGeometry(radius, 32),
            new THREE.MeshBasicMaterial({ map: texture })
        );
        gauge.userData.cabControl = data;
        clickableCabin.push(gauge);
        group.add(gauge);

        // 外圈金属框
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(radius, 0.02, 8, 32),
            new THREE.MeshLambertMaterial({ color: 0x888888 })
        );
        group.add(ring);

        return group;
    }

    // T形牵引/制动手柄
    function createHandle(data) {
        const group = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.4, metalness: 0.4 });

        // 手柄杆
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.25, 8), mat);
        shaft.position.y = 0.12;
        group.add(shaft);

        // T形握把
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.04),
            new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 }));
        grip.position.y = 0.25;
        group.add(grip);

        // 底座
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 12), mat);
        base.position.y = 0;
        group.add(base);

        // 刻度标记
        const scaleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        for (let i = 0; i < 7; i++) {
            const mark = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.003, 0.06), scaleMat);
            mark.position.set(0, 0.02 + i * 0.03, -0.04);
            group.add(mark);
        }

        group.userData.cabControl = data;
        group.traverse(child => {
            if (child.isMesh) {
                child.userData.cabControl = data;
                clickableCabin.push(child);
            }
        });

        return group;
    }

    // 小手柄（方向手柄）
    function createSmallHandle(data) {
        const group = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.4, metalness: 0.3 });

        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.15, 8), mat);
        shaft.position.y = 0.08;
        group.add(shaft);

        const knob = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6 }));
        knob.position.y = 0.16;
        group.add(knob);

        group.userData.cabControl = data;
        group.traverse(child => {
            if (child.isMesh) {
                child.userData.cabControl = data;
                clickableCabin.push(child);
            }
        });

        return group;
    }

    // 蘑菇头紧急制动按钮
    function createMushroomButton(radius, data) {
        const group = new THREE.Group();

        // 底座环
        const baseMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const base = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.3, radius * 1.3, 0.03, 16), baseMat);
        group.add(base);

        // 蘑菇头
        const headMat = new THREE.MeshPhongMaterial({ color: data.color, specular: 0x444444, shininess: 60 });
        const head = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), headMat);
        head.position.y = 0.02;
        head.userData.cabControl = data;
        clickableCabin.push(head);
        group.add(head);

        // 按钮上的标志
        const labelCanvas = document.createElement('canvas');
        labelCanvas.width = 64;
        labelCanvas.height = 64;
        const lctx = labelCanvas.getContext('2d');
        lctx.fillStyle = '#ffffff';
        lctx.font = 'bold 24px sans-serif';
        lctx.textAlign = 'center';
        lctx.textBaseline = 'middle';
        lctx.fillText('停', 32, 32);
        const labelTex = new THREE.CanvasTexture(labelCanvas);
        const label = new THREE.Mesh(
            new THREE.CircleGeometry(radius * 0.6, 16),
            new THREE.MeshBasicMaterial({ map: labelTex, transparent: true })
        );
        label.position.y = radius + 0.02;
        label.rotation.x = -Math.PI / 2;
        group.add(label);

        return group;
    }

    // 普通按钮
    function createPushButton(radius, data) {
        const group = new THREE.Group();
        const base = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.2, radius * 1.2, 0.02, 12), new THREE.MeshLambertMaterial({ color: 0x333333 }));
        group.add(base);

        const btn = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, 0.04, 12),
            new THREE.MeshPhongMaterial({ color: data.color, specular: 0x222222, shininess: 40 })
        );
        btn.position.y = 0.03;
        btn.userData.cabControl = data;
        clickableCabin.push(btn);
        group.add(btn);

        return group;
    }

    // 拨动开关
    function createToggleSwitch(data) {
        const group = new THREE.Group();
        const baseMat = new THREE.MeshLambertMaterial({ color: 0x3a3a4a });
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.04), baseMat);
        group.add(base);

        const lever = new THREE.Mesh(
            new THREE.CylinderGeometry(0.008, 0.008, 0.06, 8),
            new THREE.MeshPhongMaterial({ color: data.color, specular: 0x333333 })
        );
        lever.position.y = 0.04;
        lever.rotation.z = 0.3; // 倾斜表示开启
        lever.userData.cabControl = data;
        clickableCabin.push(lever);
        group.add(lever);

        return group;
    }

    // 车门控制面板
    function createDoorPanel(data) {
        const group = new THREE.Group();

        // 面板底板
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.02, 0.25),
            new THREE.MeshLambertMaterial({ color: 0x2a3a2a })
        );
        group.add(panel);

        // 按钮们
        const btnColors = [0x00cc00, 0x00cc00, 0xcc0000, 0xcccc00];
        for (let i = 0; i < 4; i++) {
            const btn = new THREE.Mesh(
                new THREE.CylinderGeometry(0.025, 0.025, 0.02, 12),
                new THREE.MeshPhongMaterial({ color: btnColors[i] })
            );
            btn.position.set((i % 2) * 0.1 - 0.05, 0.02, Math.floor(i / 2) * 0.08 - 0.04);
            btn.userData.cabControl = data;
            clickableCabin.push(btn);
            group.add(btn);
        }

        return group;
    }

    // 无线电台
    function createRadioUnit(data) {
        const group = new THREE.Group();
        const mat = new THREE.MeshLambertMaterial({ color: 0x3a3a4a });

        // 机体
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.08), mat);
        body.userData.cabControl = data;
        clickableCabin.push(body);
        group.add(body);

        // 小屏幕
        const screenCanvas = document.createElement('canvas');
        screenCanvas.width = 128;
        screenCanvas.height = 64;
        const sctx = screenCanvas.getContext('2d');
        sctx.fillStyle = '#0a2a0a';
        sctx.fillRect(0, 0, 128, 64);
        sctx.font = 'bold 20px monospace';
        sctx.fillStyle = '#00ff66';
        sctx.textAlign = 'center';
        sctx.fillText('CH: 01', 64, 32);
        sctx.font = '12px sans-serif';
        sctx.fillText('信号良好', 64, 52);

        const screenMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.2, 0.1),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(screenCanvas) })
        );
        screenMesh.position.set(0, 0.05, 0.045);
        group.add(screenMesh);

        // 话筒
        const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.012, 0.12, 8),
            new THREE.MeshLambertMaterial({ color: 0x222222 }));
        mic.position.set(0.2, -0.05, 0);
        mic.rotation.z = -0.5;
        group.add(mic);

        return group;
    }

    // 警惕踏板
    function createVigilancePedal(data) {
        const group = new THREE.Group();

        const pedal = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.03, 0.15),
            new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.7, metalness: 0.3 })
        );
        pedal.userData.cabControl = data;
        clickableCabin.push(pedal);
        group.add(pedal);

        // 踏板边缘防滑纹
        for (let i = 0; i < 5; i++) {
            const ridge = new THREE.Mesh(
                new THREE.BoxGeometry(0.28, 0.005, 0.01),
                new THREE.MeshLambertMaterial({ color: 0x777777 })
            );
            ridge.position.set(0, 0.02, -0.06 + i * 0.03);
            group.add(ridge);
        }

        return group;
    }

    // ============ 模式切换 ============
    function enterCabin() {
        currentMode = 'cabin';
        trainGroup.visible = false;
        groundGroup.visible = false;
        cabinGroup.visible = true;

        // 切换相机
        camera.position.set(-1.5, 1.3, 0);
        controls.target.set(1.0, 1.0, 0);
        controls.minDistance = 0.5;
        controls.maxDistance = 5;
        controls.update();

        // 更新 UI
        document.getElementById('cabBtn').textContent = '🔙 返回外部';
        document.getElementById('cabBtn').classList.remove('enter-cab');
        document.getElementById('hint').textContent = '🖱️ 拖拽观察 · 点击控件查看说明';

        // 隐藏视角按钮
        document.querySelectorAll('.ctrl-btn[data-view]').forEach(btn => btn.style.display = 'none');

        // 更新信息面板
        updateInfoPanel('cabin_overview');

        // 更改场景背景
        scene.background = new THREE.Color(0x1a1a2a);
        scene.fog = null;
    }

    function exitCabin() {
        currentMode = 'exterior';
        trainGroup.visible = true;
        groundGroup.visible = true;
        cabinGroup.visible = false;

        // 恢复相机
        camera.position.set(40, 20, 80);
        controls.target.set(0, 2, 0);
        controls.minDistance = 5;
        controls.maxDistance = 250;
        controls.update();

        // 更新 UI
        document.getElementById('cabBtn').textContent = '🎮 进入驾驶室';
        document.getElementById('cabBtn').classList.add('enter-cab');
        document.getElementById('hint').textContent = '🖱️ 拖拽旋转 · 滚轮缩放 · 右键平移 · 点击车厢查看信息';

        // 显示视角按钮
        document.querySelectorAll('.ctrl-btn[data-view]').forEach(btn => btn.style.display = '');

        // 更新信息面板
        updateInfoPanel('overview');

        // 恢复背景
        scene.background = new THREE.Color(0x87CEEB);
        scene.fog = new THREE.Fog(0x87CEEB, 200, 600);
    }

    // ============ 信息面板更新 ============
    function updateInfoPanel(type, data) {
        const title = document.querySelector('#infoPanel h2');
        const tags = document.querySelector('.info-tag-row');
        const content = document.getElementById('infoContent');

        if (type === 'overview') {
            title.textContent = '复兴号 CR400AF';
            tags.innerHTML = '<span class="info-tag">8辆编组</span><span class="info-tag">350km/h</span><span class="info-tag">飞龙造型</span>';
            content.innerHTML = `
                <p><span class="highlight">复兴号</span>是中国自主研发的高速动车组，代表着世界最先进的高铁技术！</p>
                <p>CR400AF 的「飞龙」造型车头长达 <span class="highlight">12米</span>，像一条银色的巨龙在大地上飞驰。</p>
                <p>最高运营速度 <span class="highlight">350公里/小时</span>，是世界上商业运营速度最快的高铁之一！</p>
                <div class="fun-fact">
                    <div class="fun-fact-title">🤔 智天，你知道吗？</div>
                    <p>复兴号每秒能跑 <span class="highlight">97米</span>，比猎豹还快3倍！试试点击车厢或驾驶室探索更多秘密吧！</p>
                </div>`;
        } else if (type === 'car') {
            const cfg = data;
            title.textContent = `${cfg.label} · ${cfg.desc}`;
            tags.innerHTML = `<span class="info-tag">${cfg.seat}</span><span class="info-tag">${cfg.label}</span>`;
            content.innerHTML = `<p>${cfg.detail}</p>
                <div class="fun-fact">
                    <div class="fun-fact-title">💡 小知识</div>
                    <p>复兴号全列设有 <span class="highlight">WiFi</span>，所有座位都有充电插座，二等座还有 USB 接口哦！</p>
                </div>`;
        } else if (type === 'cabin_overview') {
            title.textContent = '🚂 驾驶室内部';
            tags.innerHTML = '<span class="info-tag">操纵台</span><span class="info-tag">12个主要控件</span>';
            content.innerHTML = `
                <p>这是复兴号的<span class="highlight">驾驶室</span>！司机就在这里操控着时速350公里的高铁。</p>
                <p>前面是巨大的<span class="highlight">挡风玻璃</span>，可以看到前方的铁路。操纵台上有各种仪表和控件。</p>
                <p>试试<span class="highlight">点击各个按钮和仪表</span>，了解它们的作用吧！</p>
                <div class="fun-fact">
                    <div class="fun-fact-title">🤔 智天，你知道吗？</div>
                    <p>高铁司机需要经过 <span class="highlight">3年以上</span> 的专业训练才能上岗！他们需要记住所有控件的位置和功能。</p>
                </div>`;
        } else if (type === 'cab_control') {
            title.textContent = data.name;
            tags.innerHTML = '<span class="info-tag">驾驶室控件</span>';
            content.innerHTML = `<p>${data.desc}</p>`;
        }

        // 确保面板可见
        document.getElementById('infoPanel').classList.remove('hidden');
    }

    // ============ 事件处理 ============
    function onClick(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        if (currentMode === 'exterior') {
            const hits = raycaster.intersectObjects(clickableExterior);
            if (hits.length > 0) {
                const hit = hits[0].object;
                const car = hit.userData.parentCar;
                if (car && car.userData.config) {
                    // 高亮选中车厢
                    highlightCar(car.userData.carIndex);
                    updateInfoPanel('car', car.userData.config);
                }
            }
        } else if (currentMode === 'cabin') {
            const hits = raycaster.intersectObjects(clickableCabin);
            if (hits.length > 0) {
                const data = hits[0].object.userData.cabControl;
                if (data) {
                    updateInfoPanel('cab_control', data);
                }
            }
        }
    }

    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        // 恢复之前的 hover 对象
        if (hoveredObject) {
            if (hoveredObject.material && hoveredObject.material.emissive) {
                hoveredObject.material.emissive.setHex(hoveredObject.userData._origEmissive || 0);
            }
            hoveredObject = null;
            document.body.style.cursor = 'default';
        }

        const targets = currentMode === 'exterior' ? clickableExterior : clickableCabin;
        const hits = raycaster.intersectObjects(targets);
        if (hits.length > 0) {
            const obj = hits[0].object;
            if (obj.material && obj.material.emissive) {
                obj.userData._origEmissive = obj.material.emissive.getHex();
                obj.material.emissive.setHex(0x333333);
            }
            hoveredObject = obj;
            document.body.style.cursor = 'pointer';
        }
    }

    function highlightCar(carIndex) {
        // 重置所有车厢
        if (selectedCar !== null) {
            trainGroup.children.forEach(car => {
                car.traverse(child => {
                    if (child.isMesh && child.userData.isCarBody && child.material.emissive) {
                        child.material.emissive.setHex(0);
                    }
                });
            });
        }

        // 高亮选中车厢
        const car = trainGroup.children[carIndex];
        if (car) {
            car.traverse(child => {
                if (child.isMesh && child.userData.isCarBody && child.material.emissive) {
                    child.material.emissive.setHex(0x222200);
                }
            });
        }
        selectedCar = carIndex;
    }

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // ============ 控制按钮 ============
    function setupControlButtons() {
        // 视角切换
        document.querySelectorAll('.ctrl-btn[data-view]').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                document.querySelectorAll('.ctrl-btn[data-view]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                switchView(view);
            });
        });

        // 进入/退出驾驶室
        document.getElementById('cabBtn').addEventListener('click', () => {
            if (currentMode === 'exterior') {
                enterCabin();
            } else {
                exitCabin();
            }
        });
    }

    function switchView(view) {
        const totalLen = CAR_CONFIG.reduce((sum, cfg) => sum + (cfg.type === 'head' || cfg.type === 'tail' ? HEAD_LENGTH : MID_LENGTH), 0) + GAP * 7;

        switch (view) {
            case 'side':
                camera.position.set(0, 8, 50);
                controls.target.set(0, 2, 0);
                break;
            case 'top':
                camera.position.set(0, 60, 0.1);
                controls.target.set(0, 0, 0);
                break;
            case 'head':
                camera.position.set(totalLen / 2 + 15, 5, 10);
                controls.target.set(totalLen / 2 - 5, 2, 0);
                break;
            case 'front':
                camera.position.set(totalLen / 2 + 20, 3, 0.1);
                controls.target.set(totalLen / 2 - 5, 2, 0);
                break;
        }
        controls.update();
    }

    // ============ 动画循环 ============
    function animate() {
        animationId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    // ============ 启动 ============
    init();

})();
