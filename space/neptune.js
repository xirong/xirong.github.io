/**
 * 海王星探险家 - 柳智天的宇宙课堂
 * 6大章节闯关：科普故事 → 汉字学习 → 知识测验 → 数学挑战 → 获得星星
 */

// ============ 全局变量 ============
let scene, camera, renderer, controls;
let neptuneMesh, sunRef, starField;
let clock;

// ============ 章节数据 ============
const chaptersData = [
    {
        id: 1,
        title: '最远的行星',
        icon: '🌌',
        desc: '海王星离太阳有多远？',
        stories: [
            '海王星是太阳系中离太阳<span class="highlight">最远的行星</span>！',
            '海王星离太阳大约<span class="highlight">45亿公里</span>！阳光到海王星要<span class="highlight">4个多小时</span>！',
            '在海王星上看太阳，太阳就像一颗<span class="highlight">特别亮的星星</span>。'
        ],
        hanzi: [
            { char: '海', pinyin: 'hǎi', words: '大海 · 海洋', sentence: '蓝蓝的大海一望无际。', pictograph: 'drawSea' },
            { char: '洋', pinyin: 'yáng', words: '海洋 · 太平洋', sentence: '太平洋是最大的海洋。', pictograph: 'drawOcean' }
        ],
        quiz: {
            question: '太阳系中离太阳最远的行星是？',
            options: [
                { text: '海王星', correct: true },
                { text: '天王星', correct: false },
                { text: '土星', correct: false }
            ],
            hint: '它是太阳系的第8颗行星哦！'
        },
        math: [
            {
                type: 'choice',
                question: '太阳系有8颗行星，海王星排第8，前面有几颗？',
                options: [
                    { text: '6颗', correct: false },
                    { text: '7颗', correct: true },
                    { text: '8颗', correct: false }
                ],
                hint: '8 - 1 = ?'
            },
            {
                type: 'fillin',
                question: '阳光到海王星要4个多小时，到地球要8分钟。4 + 3 = ？',
                answer: 7,
                hint: '4加3等于7哦！'
            },
            {
                type: 'fillin',
                question: '海王星是最远的行星，离太阳的距离是地球的4倍，再加3倍更远，一共是几倍？',
                answer: 7,
                hint: '4加3等于7'
            },
            {
                type: 'sequential',
                question: '探险队出发去海王星，准备了9天粮食，用了4天，补充了2天的，还剩几天？',
                expression: '9 - 4 + 2',
                answer: 7,
                hint: '先算9减4等于5，再算5加2等于7'
            }
        ]
    },
    {
        id: 2,
        title: '蓝色的巨人',
        icon: '💎',
        desc: '海王星为什么是蓝色的？',
        stories: [
            '海王星是一颗美丽的<span class="highlight">蓝色星球</span>！',
            '它的蓝色来自大气中的<span class="highlight">甲烷气体</span>，甲烷吸收了红光，只反射<span class="highlight">蓝光</span>！',
            '海王星的大小是地球的<span class="highlight">4倍</span>，能装下<span class="highlight">57个</span>地球！'
        ],
        hanzi: [
            { char: '蓝', pinyin: 'lán', words: '蓝色 · 蓝天', sentence: '蓝天上飘着白云。', pictograph: 'drawBlue' },
            { char: '深', pinyin: 'shēn', words: '深浅 · 深海', sentence: '大海深处住着大鲸鱼。', pictograph: 'drawDeep' }
        ],
        quiz: {
            question: '海王星为什么是蓝色的？',
            options: [
                { text: '因为有很多水', correct: false },
                { text: '因为很冷', correct: false },
                { text: '大气中的甲烷吸收了红光', correct: true }
            ],
            hint: '跟大气中一种特殊的气体有关...'
        },
        math: [
            {
                type: 'choice',
                question: '海王星能装下地球，智天数了4个又数了3个，一共数了几个？',
                options: [
                    { text: '7个', correct: true },
                    { text: '6个', correct: false },
                    { text: '8个', correct: false }
                ],
                hint: '4 + 3 = ?'
            },
            {
                type: 'fillin',
                question: '海王星的大小是地球的4倍，比地球多几倍？4 - 1 = ？',
                answer: 3,
                hint: '4减1等于3哦！'
            },
            {
                type: 'fillin',
                question: '海王星的深蓝色很美，科学家数了5个蓝色区域，又发现了3个，一共几个？',
                answer: 8,
                hint: '5加3等于8'
            },
            {
                type: 'sequential',
                question: '海王星大气有10层深蓝色云，消散了4层，又生成了2层，现在有几层？',
                expression: '10 - 4 + 2',
                answer: 8,
                hint: '先算10减4等于6，再算6加2等于8'
            }
        ]
    },
    {
        id: 3,
        title: '超级风暴',
        icon: '🌀',
        desc: '太阳系最快的风',
        stories: [
            '海王星上的风是太阳系中<span class="highlight">最快的</span>！风速可以超过每小时<span class="highlight">2000公里</span>！',
            '1989年旅行者2号发现了一个叫<span class="highlight">"大黑斑"</span>的巨大风暴！',
            '海王星上还有高高的<span class="highlight">冰云</span>在天上飘。'
        ],
        hanzi: [
            { char: '波', pinyin: 'bō', words: '波浪 · 风波', sentence: '海面上翻起了大波浪。', pictograph: 'drawWave' },
            { char: '浪', pinyin: 'làng', words: '浪花 · 海浪', sentence: '海浪拍打着沙滩。', pictograph: 'drawSurf' }
        ],
        quiz: {
            question: '海王星上发现的巨大风暴叫什么？',
            options: [
                { text: '大红斑', correct: false },
                { text: '大黑斑', correct: true },
                { text: '大蓝斑', correct: false }
            ],
            hint: '它的颜色是黑色的哦...'
        },
        math: [
            {
                type: 'choice',
                question: '风暴刮了3天停了，又刮了5天，一共刮了几天？',
                options: [
                    { text: '7天', correct: false },
                    { text: '9天', correct: false },
                    { text: '8天', correct: true }
                ],
                hint: '3 + 5 = ?'
            },
            {
                type: 'fillin',
                question: '大黑斑风暴有10级风力，小风暴有4级，大的比小的多几级？10 - 4 = ？',
                answer: 6,
                hint: '10减4等于6哦！'
            },
            {
                type: 'fillin',
                question: '大暗斑超强风暴已经刮了6天，又刮了3天，一共刮了几天？',
                answer: 9,
                hint: '6加3等于9'
            },
            {
                type: 'sequential',
                question: '大暗斑风暴有8个旋臂，消失了3个，又多出了2个，现在有几个旋臂？',
                expression: '8 - 3 + 2',
                answer: 7,
                hint: '先算8减3等于5，再算5加2等于7'
            }
        ]
    },
    {
        id: 4,
        title: '海王星的卫星',
        icon: '🛰️',
        desc: '倒着转的海卫一',
        stories: [
            '海王星有<span class="highlight">16颗</span>已知的卫星，最大的叫<span class="highlight">"海卫一"</span>，也叫特里同！',
            '海卫一很特别，它是<span class="highlight">倒着绕海王星转的</span>！说明它可能是被海王星<span class="highlight">"抓"来的</span>！',
            '海卫一表面有<span class="highlight">氮冰喷泉</span>，会喷出黑色的烟柱！'
        ],
        hanzi: [
            { char: '鱼', pinyin: 'yú', words: '小鱼 · 金鱼', sentence: '小鱼在水里游来游去。', pictograph: 'drawFish' },
            { char: '门', pinyin: 'mén', words: '大门 · 门口', sentence: '打开大门迎客人。', pictograph: 'drawDoor' }
        ],
        quiz: {
            question: '海卫一为什么特别？',
            options: [
                { text: '它是倒着绕海王星转的', correct: true },
                { text: '它有大气层', correct: false },
                { text: '它会发光', correct: false }
            ],
            hint: '它转的方向跟其他卫星不一样...'
        },
        math: [
            {
                type: 'choice',
                question: '海卫一喷了2次冰泉，又喷了4次，一共喷了几次？',
                options: [
                    { text: '5次', correct: false },
                    { text: '6次', correct: true },
                    { text: '7次', correct: false }
                ],
                hint: '2 + 4 = ?'
            },
            {
                type: 'fillin',
                question: '海卫一喷了6次冰泉，停了2次，还在喷的有几次？',
                answer: 4,
                hint: '6 - 2 = ?'
            },
            {
                type: 'fillin',
                question: '海卫一倒着转，喷了5次冰泉，海王星又让它多喷了3次，一共喷了几次？',
                answer: 8,
                hint: '5加3等于8'
            },
            {
                type: 'sequential',
                question: '海卫一有9次氮冰喷发，平息了4次，极寒又触发了2次，现在有几次喷发？',
                expression: '9 - 4 + 2',
                answer: 7,
                hint: '先算9减4等于5，再算5加2等于7'
            }
        ]
    },
    {
        id: 5,
        title: '冰巨星',
        icon: '❄️',
        desc: '钻石雨的秘密',
        stories: [
            '海王星和天王星被叫做<span class="highlight">"冰巨星"</span>，它们和木星土星的"气巨星"不同！',
            '海王星内部有大量的<span class="highlight">水冰、氨冰和甲烷冰</span>！',
            '科学家猜测在海王星深处，巨大的压力可能把碳变成了<span class="highlight">钻石雨</span>！'
        ],
        hanzi: [
            { char: '冰', pinyin: 'bīng', words: '冰块 · 冰冷', sentence: '冬天河面结了厚厚的冰。', pictograph: 'drawIce' },
            { char: '寒', pinyin: 'hán', words: '寒冷 · 严寒', sentence: '寒冷的冬天要穿棉袄。', pictograph: 'drawCold' }
        ],
        quiz: {
            question: '海王星深处可能下什么雨？',
            options: [
                { text: '水雨', correct: false },
                { text: '铁雨', correct: false },
                { text: '钻石雨', correct: true }
            ],
            hint: '碳在巨大压力下会变成一种很珍贵的东西...'
        },
        math: [
            {
                type: 'choice',
                question: '天上下了4颗钻石和2颗冰块，一共下了几颗？',
                options: [
                    { text: '6颗', correct: true },
                    { text: '5颗', correct: false },
                    { text: '7颗', correct: false }
                ],
                hint: '4 + 2 = ?'
            },
            {
                type: 'fillin',
                question: '钻石雨下了8颗钻石，智天捡了5颗，还剩几颗？8 - 5 = ？',
                answer: 3,
                hint: '8减5等于3哦！'
            },
            {
                type: 'fillin',
                question: '海王星极冷的深处下了7颗钻石雨，又下了2颗，一共几颗？',
                answer: 9,
                hint: '7加2等于9'
            },
            {
                type: 'sequential',
                question: '钻石雨下了6颗，智天捡了2颗，爸爸又找到了3颗，一共有几颗钻石？',
                expression: '6 - 2 + 3',
                answer: 7,
                hint: '先算6减2等于4，再算4加3等于7'
            }
        ]
    },
    {
        id: 6,
        title: '发现海王星',
        icon: '🔭',
        desc: '数学的力量',
        stories: [
            '海王星是人类用<span class="highlight">数学计算</span>发现的！科学家发现天王星的轨道不太对，推测外面还有一颗行星在<span class="highlight">"拉"</span>它！',
            '<span class="highlight">1846年</span>，科学家按照计算的位置用望远镜找到了海王星！',
            '这证明了<span class="highlight">数学的力量</span>真的很厉害！'
        ],
        hanzi: [
            { char: '井', pinyin: 'jǐng', words: '水井 · 天井', sentence: '古时候人们从井里打水喝。', pictograph: 'drawWell' },
            { char: '暗', pinyin: 'àn', words: '黑暗 · 暗淡', sentence: '黑暗中有一盏小灯。', pictograph: 'drawDark' }
        ],
        quiz: {
            question: '海王星是怎么被发现的？',
            options: [
                { text: '碰巧看到的', correct: false },
                { text: '用数学计算出位置再找到的', correct: true },
                { text: '宇航员飞过去的', correct: false }
            ],
            hint: '科学家先算出了它应该在哪里...'
        },
        math: [
            {
                type: 'choice',
                question: '科学家算了3天又算了4天，终于找到了海王星，一共算了几天？',
                options: [
                    { text: '6天', correct: false },
                    { text: '8天', correct: false },
                    { text: '7天', correct: true }
                ],
                hint: '3 + 4 = ?'
            },
            {
                type: 'fillin',
                question: '望远镜看了10颗星星，其中有1颗是海王星，其他的有几颗？10 - 1 = ？',
                answer: 9,
                hint: '10减1等于9哦！'
            },
            {
                type: 'fillin',
                question: '科学家用数学发现了海王星，算了8道题，错了1道，答对了几道？',
                answer: 7,
                hint: '8减1等于7'
            },
            {
                type: 'sequential',
                question: '科学家观测了6颗星，发现3颗不对，又重新找了4颗，现在找了几颗？',
                expression: '6 - 3 + 4',
                answer: 7,
                hint: '先算6减3等于3，再算3加4等于7'
            }
        ]
    }
];

// ============ 象形图绘制函数 ============
const pictographDrawers = {
    drawSea(ctx, w, h) {
        // 海 - 蓝色大海+波浪
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#87CEEB');
        grad.addColorStop(0.5, '#2E86C1');
        grad.addColorStop(1, '#154360');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        // 波浪
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
            const y = 40 + i * 30;
            ctx.beginPath();
            ctx.moveTo(10, y);
            ctx.quadraticCurveTo(35, y - 15, 70, y);
            ctx.quadraticCurveTo(105, y + 15, 130, y);
            ctx.stroke();
        }
        // 太阳
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath();
        ctx.arc(110, 25, 15, 0, Math.PI * 2);
        ctx.fill();
    },
    drawOcean(ctx, w, h) {
        // 洋 - 广阔海洋+鲸鱼
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#5DADE2');
        grad.addColorStop(1, '#1A5276');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        // 鲸鱼身体
        ctx.fillStyle = '#2C3E50';
        ctx.beginPath();
        ctx.ellipse(w / 2, h / 2 + 10, 35, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        // 鲸鱼尾巴
        ctx.beginPath();
        ctx.moveTo(w / 2 + 30, h / 2 + 10);
        ctx.quadraticCurveTo(w / 2 + 50, h / 2 - 10, w / 2 + 55, h / 2 - 20);
        ctx.quadraticCurveTo(w / 2 + 45, h / 2 + 5, w / 2 + 55, h / 2 + 25);
        ctx.quadraticCurveTo(w / 2 + 50, h / 2 + 15, w / 2 + 30, h / 2 + 10);
        ctx.fill();
        // 眼睛
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(w / 2 - 20, h / 2 + 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(w / 2 - 19, h / 2 + 5, 2, 0, Math.PI * 2);
        ctx.fill();
        // 水花
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(w / 2 - 10, h / 2 - 15, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(w / 2, h / 2 - 20, 4, 0, Math.PI * 2);
        ctx.fill();
    },
    drawBlue(ctx, w, h) {
        // 蓝 - 蓝天白云
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#2E86C1');
        grad.addColorStop(1, '#AED6F1');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        // 白云
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(40, 45, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(60, 40, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(80, 48, 16, 0, Math.PI * 2);
        ctx.fill();
        // 第二朵云
        ctx.beginPath();
        ctx.arc(90, 85, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(108, 80, 18, 0, Math.PI * 2);
        ctx.fill();
    },
    drawDeep(ctx, w, h) {
        // 深 - 深海+鱼
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#1A5276');
        grad.addColorStop(1, '#0B2545');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        // 深海发光鱼
        ctx.fillStyle = '#5DADE2';
        ctx.beginPath();
        ctx.ellipse(w / 2, h / 2, 20, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        // 灯笼
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.arc(w / 2 - 15, h / 2 - 8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#F4D03F';
        ctx.fill();
        ctx.shadowBlur = 0;
        // 尾巴
        ctx.fillStyle = '#5DADE2';
        ctx.beginPath();
        ctx.moveTo(w / 2 + 18, h / 2);
        ctx.lineTo(w / 2 + 35, h / 2 - 10);
        ctx.lineTo(w / 2 + 35, h / 2 + 10);
        ctx.closePath();
        ctx.fill();
        // 气泡
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(w / 2 + 5, h / 2 - 25, 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(w / 2 + 15, h / 2 - 35, 3, 0, Math.PI * 2);
        ctx.stroke();
    },
    drawWave(ctx, w, h) {
        // 波 - 波浪
        ctx.fillStyle = '#1A5276';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#5DADE2';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        for (let i = 0; i < 4; i++) {
            const y = 25 + i * 28;
            ctx.beginPath();
            ctx.moveTo(10, y);
            ctx.bezierCurveTo(35, y - 20, 55, y + 20, 70, y);
            ctx.bezierCurveTo(90, y - 20, 110, y + 20, 130, y);
            ctx.stroke();
        }
        // 水滴
        ctx.fillStyle = '#AED6F1';
        ctx.beginPath();
        ctx.arc(50, 35, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(100, 70, 4, 0, Math.PI * 2);
        ctx.fill();
    },
    drawSurf(ctx, w, h) {
        // 浪 - 浪花拍岸
        // 沙滩
        ctx.fillStyle = '#F5CBA7';
        ctx.fillRect(0, h * 0.6, w, h * 0.4);
        // 海水
        const grad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
        grad.addColorStop(0, '#2E86C1');
        grad.addColorStop(1, '#5DADE2');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h * 0.6);
        // 浪花
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.55);
        ctx.quadraticCurveTo(25, h * 0.45, 45, h * 0.55);
        ctx.quadraticCurveTo(65, h * 0.65, 90, h * 0.55);
        ctx.quadraticCurveTo(115, h * 0.45, w, h * 0.55);
        ctx.lineTo(w, h * 0.65);
        ctx.lineTo(0, h * 0.65);
        ctx.closePath();
        ctx.fill();
        // 贝壳
        ctx.fillStyle = '#E67E22';
        ctx.beginPath();
        ctx.arc(100, h * 0.8, 8, Math.PI, 0);
        ctx.fill();
    },
    drawFish(ctx, w, h) {
        // 鱼 - 小金鱼
        ctx.fillStyle = '#1A5276';
        ctx.fillRect(0, 0, w, h);
        // 鱼身
        ctx.fillStyle = '#E67E22';
        ctx.beginPath();
        ctx.ellipse(w / 2, h / 2, 25, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        // 尾巴
        ctx.beginPath();
        ctx.moveTo(w / 2 + 22, h / 2);
        ctx.quadraticCurveTo(w / 2 + 45, h / 2 - 20, w / 2 + 48, h / 2 - 25);
        ctx.quadraticCurveTo(w / 2 + 38, h / 2, w / 2 + 48, h / 2 + 25);
        ctx.quadraticCurveTo(w / 2 + 45, h / 2 + 20, w / 2 + 22, h / 2);
        ctx.fill();
        // 眼睛
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(w / 2 - 12, h / 2 - 4, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(w / 2 - 10, h / 2 - 4, 3, 0, Math.PI * 2);
        ctx.fill();
        // 气泡
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(w / 2 - 30, h / 2 - 10, 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(w / 2 - 35, h / 2 - 25, 3, 0, Math.PI * 2);
        ctx.stroke();
    },
    drawDoor(ctx, w, h) {
        // 门 - 大门
        // 墙
        ctx.fillStyle = '#BDC3C7';
        ctx.fillRect(15, 15, w - 30, h - 30);
        // 门框
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(40, 30, 60, h - 45);
        // 门
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(45, 35, 25, h - 52);
        ctx.fillRect(72, 35, 25, h - 52);
        // 门把手
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.arc(67, h / 2 + 10, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(75, h / 2 + 10, 4, 0, Math.PI * 2);
        ctx.fill();
    },
    drawIce(ctx, w, h) {
        // 冰 - 冰块
        ctx.fillStyle = '#D6EAF8';
        ctx.fillRect(0, 0, w, h);
        // 冰块
        ctx.fillStyle = 'rgba(174, 214, 241, 0.8)';
        ctx.beginPath();
        ctx.moveTo(30, h - 30);
        ctx.lineTo(40, 35);
        ctx.lineTo(70, 25);
        ctx.lineTo(100, 35);
        ctx.lineTo(110, h - 30);
        ctx.closePath();
        ctx.fill();
        // 冰块高光
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.moveTo(50, 45);
        ctx.lineTo(55, 60);
        ctx.lineTo(65, 55);
        ctx.lineTo(60, 40);
        ctx.closePath();
        ctx.fill();
        // 冰碴
        ctx.strokeStyle = '#85C1E9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(75, 45);
        ctx.lineTo(80, 70);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(85, 50);
        ctx.lineTo(88, 80);
        ctx.stroke();
        // 雪花
        ctx.fillStyle = '#FFF';
        ctx.font = '14px serif';
        ctx.fillText('*', 20, 25);
        ctx.fillText('*', 115, 50);
    },
    drawCold(ctx, w, h) {
        // 寒 - 寒冷冬天
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#AED6F1');
        grad.addColorStop(1, '#D6EAF8');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        // 雪地
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.7);
        ctx.quadraticCurveTo(w / 4, h * 0.65, w / 2, h * 0.7);
        ctx.quadraticCurveTo(w * 3 / 4, h * 0.75, w, h * 0.7);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();
        // 小树
        ctx.fillStyle = '#5D4E37';
        ctx.fillRect(w / 2 - 4, h * 0.45, 8, h * 0.25);
        ctx.fillStyle = '#2E86C1';
        ctx.beginPath();
        ctx.moveTo(w / 2, h * 0.2);
        ctx.lineTo(w / 2 + 25, h * 0.5);
        ctx.lineTo(w / 2 - 25, h * 0.5);
        ctx.closePath();
        ctx.fill();
        // 树上的雪
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.moveTo(w / 2, h * 0.2);
        ctx.lineTo(w / 2 + 12, h * 0.32);
        ctx.lineTo(w / 2 - 12, h * 0.32);
        ctx.closePath();
        ctx.fill();
        // 雪花
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        for (let i = 0; i < 8; i++) {
            const x = 15 + Math.random() * (w - 30);
            const y = 10 + Math.random() * (h * 0.6);
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    drawWell(ctx, w, h) {
        // 井 - 水井
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(0, 0, w, h);
        // 井口（方形）
        ctx.fillStyle = '#7F8C8D';
        ctx.fillRect(30, 40, 80, 70);
        // 井内（黑色水面）
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(38, 48, 64, 54);
        // 水面反光
        ctx.fillStyle = 'rgba(93, 173, 226, 0.4)';
        ctx.fillRect(38, 80, 64, 22);
        // 井绳
        ctx.strokeStyle = '#D4AC6E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w / 2, 25);
        ctx.lineTo(w / 2, 80);
        ctx.stroke();
        // 横梁
        ctx.strokeStyle = '#5D4E37';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(25, 35);
        ctx.lineTo(115, 35);
        ctx.stroke();
        // 柱子
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(30, 35);
        ctx.lineTo(30, h - 15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(110, 35);
        ctx.lineTo(110, h - 15);
        ctx.stroke();
    },
    drawDark(ctx, w, h) {
        // 暗 - 黑暗中的灯
        ctx.fillStyle = '#0B0B1A';
        ctx.fillRect(0, 0, w, h);
        // 灯光渐变
        const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, 50);
        grad.addColorStop(0, 'rgba(244, 208, 63, 0.6)');
        grad.addColorStop(0.5, 'rgba(244, 208, 63, 0.15)');
        grad.addColorStop(1, 'rgba(244, 208, 63, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        // 蜡烛
        ctx.fillStyle = '#F5CBA7';
        ctx.fillRect(w / 2 - 5, h / 2, 10, 30);
        // 火焰
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.ellipse(w / 2, h / 2 - 5, 6, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#E67E22';
        ctx.beginPath();
        ctx.ellipse(w / 2, h / 2 - 3, 3, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // 星星
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(25, 25, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(110, 30, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(30, 100, 1, 0, Math.PI * 2);
        ctx.fill();
    }
};

// ============ 游戏状态 ============
let gameState = {
    completedChapters: [],
    currentChapter: null,
    phase: 'menu',
    mathQuestionIndex: 0
};

let storyIndex = 0;
let hanziIndex = 0;
let quizAnswered = false;
let rewardCallback = null;

// ============ 语音（Edge-TTS MP3 + Web Speech API fallback） ============
const audioCache = {};

function playAudio(audioPath, fallbackText) {
    let audio = audioCache[audioPath];
    if (!audio) {
        audio = new Audio(audioPath);
        audioCache[audioPath] = audio;
    }
    audio.currentTime = 0;
    audio.onerror = () => {
        console.log('音频加载失败，使用 TTS 备选:', audioPath);
        speak(fallbackText);
    };
    audio.play().catch(() => speak(fallbackText));
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

// 音频路径生成
const neptuneAudio = {
    correct: 'audio/neptune/correct.mp3',
    finalBadge: 'audio/neptune/final-badge.mp3',
    story: (chId, idx) => `audio/neptune/ch${chId}-story-${idx}.mp3`,
    hanzi: (chId, idx) => `audio/neptune/ch${chId}-hanzi-${idx}.mp3`,
    quiz: (chId) => `audio/neptune/ch${chId}-quiz.mp3`,
    quizOption: (chId, optIdx) => `audio/neptune/ch${chId}-quiz-${['a','b','c'][optIdx]}.mp3`,
    quizHint: (chId) => `audio/neptune/ch${chId}-quiz-hint.mp3`,
    math: (chId, qIdx) => qIdx > 0 ? `audio/neptune/ch${chId}-math-${qIdx + 1}.mp3` : `audio/neptune/ch${chId}-math.mp3`,
    mathHint: (chId, qIdx) => qIdx > 0 ? `audio/neptune/ch${chId}-math-${qIdx + 1}-hint.mp3` : `audio/neptune/ch${chId}-math-hint.mp3`,
    complete: (chId) => `audio/neptune/ch${chId}-complete.mp3`
};

// ============ 存档 ============
function saveProgress() {
    localStorage.setItem('neptuneExplorer', JSON.stringify({
        completedChapters: gameState.completedChapters
    }));
}

function loadProgress() {
    try {
        const data = JSON.parse(localStorage.getItem('neptuneExplorer'));
        if (data && data.completedChapters) {
            gameState.completedChapters = data.completedChapters;
        }
    } catch (e) {}
}

// ============ Three.js 初始化 ============
function init() {
    clock = new THREE.Clock();
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000005);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 5, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 12;
    controls.maxDistance = 50;
    controls.enablePan = false;

    createStarfield();
    createNeptune();
    createSunReference();
    addLights();

    window.addEventListener('resize', onWindowResize);

    // 纹理加载检测
    const checkLoaded = setInterval(() => {
        if (neptuneMesh && neptuneMesh.material && neptuneMesh.material.uniforms &&
            neptuneMesh.material.uniforms.planetTexture.value.image) {
            clearInterval(checkLoaded);
            document.getElementById('loadingScreen').classList.add('hidden');
        }
    }, 200);

    // 5秒后强制隐藏loading
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 5000);

    animate();
}

// ============ 创建海王星 ============
function createNeptune() {
    const geometry = new THREE.SphereGeometry(6, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const neptuneMap = textureLoader.load('textures/neptune.jpg');

    const neptuneMaterial = new THREE.ShaderMaterial({
        uniforms: {
            planetTexture: { value: neptuneMap },
            sunDirection: { value: new THREE.Vector3(1, 0.3, 0.5).normalize() },
            time: { value: 0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vWorldPos;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vUv = uv;
                vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D planetTexture;
            uniform vec3 sunDirection;
            uniform float time;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vWorldPos;

            void main() {
                vec3 surfaceColor = texture2D(planetTexture, vUv).rgb;
                // 提亮纹理
                surfaceColor *= 1.2;

                // 光照
                vec3 lightDir = normalize(sunDirection);
                float diff = max(dot(vNormal, lightDir), 0.0);
                float ambient = 0.15;
                surfaceColor *= (diff * 0.8 + ambient);

                // Fresnel 蓝色大气散射（强度0.3）
                vec3 viewDir = normalize(cameraPosition - vWorldPos);
                float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
                vec3 atmosphereColor = vec3(0.1, 0.4, 0.9); // 深蓝色大气
                surfaceColor += atmosphereColor * fresnel * 0.3;

                gl_FragColor = vec4(surfaceColor, 1.0);
            }
        `
    });

    neptuneMesh = new THREE.Mesh(geometry, neptuneMaterial);
    scene.add(neptuneMesh);
}

// ============ 创建星空 ============
function createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 500 + Math.random() * 500;
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
        sizes[i] = 0.5 + Math.random() * 1.5;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8
    });

    starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
}

// ============ 创建远处小太阳（海王星离太阳很远，太阳很小） ============
function createSunReference() {
    const geometry = new THREE.SphereGeometry(1.2, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffdd44
    });

    sunRef = new THREE.Mesh(geometry, material);
    sunRef.position.set(60, 20, -50);
    scene.add(sunRef);

    // 太阳光芒
    const glowGeometry = new THREE.SphereGeometry(1.8, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffee88,
        transparent: true,
        opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    sunRef.add(glow);
}

// ============ 灯光 ============
function addLights() {
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(50, 20, 30);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x1a2a44, 0.4);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0x2255aa, 0.3);
    rimLight.position.set(-30, -10, -20);
    scene.add(rimLight);
}

// ============ 动画循环 ============
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    // 海王星缓慢自转
    if (neptuneMesh) {
        neptuneMesh.rotation.y += delta * 0.05;
        if (neptuneMesh.material.uniforms) {
            neptuneMesh.material.uniforms.time.value = elapsed;
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

// ============ 窗口大小变化 ============
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    const sfCanvas = document.getElementById('starFallCanvas');
    sfCanvas.width = window.innerWidth;
    sfCanvas.height = window.innerHeight;
}

// ============ 相机动画 ============
function animateCameraTo(pos, lookAt, duration) {
    duration = duration || 1500;
    const startPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const startTarget = { x: controls.target.x, y: controls.target.y, z: controls.target.z };
    const startTime = performance.now();

    function step(now) {
        const t = Math.min((now - startTime) / duration, 1);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        camera.position.set(
            startPos.x + (pos.x - startPos.x) * ease,
            startPos.y + (pos.y - startPos.y) * ease,
            startPos.z + (pos.z - startPos.z) * ease
        );

        if (lookAt) {
            controls.target.set(
                startTarget.x + (lookAt.x - startTarget.x) * ease,
                startTarget.y + (lookAt.y - startTarget.y) * ease,
                startTarget.z + (lookAt.z - startTarget.z) * ease
            );
        }

        controls.update();
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// ============ 章节3D效果 ============
const chapterEffects = {
    1: () => {
        // 最远的行星 - 正面近景
        animateCameraTo({ x: 0, y: 2, z: 16 }, { x: 0, y: 0, z: 0 });
    },
    2: () => {
        // 蓝色巨人 - 侧面看蓝色
        animateCameraTo({ x: 15, y: 5, z: 15 }, { x: 0, y: 0, z: 0 });
    },
    3: () => {
        // 超级风暴 - 近距离看大气
        animateCameraTo({ x: -3, y: 1, z: 13 }, { x: -2, y: 0, z: 0 });
    },
    4: () => {
        // 卫星 - 远景
        animateCameraTo({ x: -10, y: 10, z: 20 }, { x: 0, y: 0, z: 0 });
    },
    5: () => {
        // 冰巨星 - 近距离
        animateCameraTo({ x: 3, y: -1, z: 12 }, { x: 0, y: -2, z: 0 });
    },
    6: () => {
        // 发现海王星 - 远景全貌
        animateCameraTo({ x: 5, y: 12, z: 22 }, { x: 0, y: 0, z: 0 });
    }
};

// ============ UI：渲染章节菜单 ============
function renderChapterMenu() {
    const grid = document.getElementById('chapterGrid');
    grid.innerHTML = '';

    chaptersData.forEach((ch, index) => {
        const isCompleted = gameState.completedChapters.includes(ch.id);
        const isLocked = index > 0 && !gameState.completedChapters.includes(chaptersData[index - 1].id) && !isCompleted;

        const card = document.createElement('div');
        card.className = 'chapter-card' + (isCompleted ? ' completed' : '') + (isLocked ? ' locked' : '');

        card.innerHTML = `
            <div class="ch-icon">${ch.icon}</div>
            <div class="ch-title">${ch.title}</div>
            <div class="ch-desc">${ch.desc}</div>
            ${isLocked ? '<div class="lock-icon">🔒</div>' : ''}
            ${isCompleted ? '<div class="lock-icon">⭐</div>' : ''}
        `;

        if (!isLocked) {
            card.onclick = () => startChapter(ch.id);
        }

        grid.appendChild(card);
    });
}

// ============ UI：更新进度条 ============
function renderProgressBar() {
    const container = document.getElementById('progressStars');
    container.innerHTML = '';

    chaptersData.forEach(ch => {
        const star = document.createElement('div');
        star.className = 'progress-star';
        const isCompleted = gameState.completedChapters.includes(ch.id);
        if (isCompleted) star.classList.add('completed');
        if (gameState.currentChapter === ch.id) star.classList.add('current');
        star.textContent = isCompleted ? '⭐' : ch.id;
        container.appendChild(star);
    });

    document.getElementById('progressLabel').textContent =
        `${gameState.completedChapters.length}/6`;
}

// ============ 显示章节菜单 ============
function showChapterMenu() {
    hideAllPanels();
    gameState.phase = 'menu';
    gameState.currentChapter = null;
    renderChapterMenu();
    renderProgressBar();
    document.getElementById('chapterMenu').classList.add('visible');
    animateCameraTo({ x: 0, y: 5, z: 20 }, { x: 0, y: 0, z: 0 });
}

// ============ 隐藏所有面板 ============
function hideAllPanels() {
    document.getElementById('chapterMenu').classList.remove('visible');
    document.getElementById('storyPanel').classList.remove('visible');
    document.getElementById('hanziPanel').classList.remove('visible');
    document.getElementById('quizPanel').classList.remove('visible');
    document.getElementById('rewardPopup').classList.remove('visible');
    document.getElementById('finalBadge').classList.remove('visible');
}

// ============ 开始章节 ============
function startChapter(chapterId) {
    const ch = chaptersData.find(c => c.id === chapterId);
    if (!ch) return;

    gameState.currentChapter = chapterId;
    gameState.phase = 'story';
    storyIndex = 0;

    hideAllPanels();
    renderProgressBar();

    if (chapterEffects[chapterId]) {
        chapterEffects[chapterId]();
    }

    setTimeout(() => showStory(ch), 800);
}

// ============ 科普故事 ============
function showStory(ch) {
    const panel = document.getElementById('storyPanel');
    document.getElementById('storyTag').textContent = `第${ch.id}章 · ${ch.title}`;

    const storyHtml = ch.stories[storyIndex];
    document.getElementById('storyText').innerHTML = storyHtml;

    const plainText = storyHtml.replace(/<[^>]*>/g, '');
    playAudio(neptuneAudio.story(ch.id, storyIndex + 1), plainText);

    const dots = document.getElementById('storyDots');
    dots.innerHTML = '';
    ch.stories.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'story-dot' + (i === storyIndex ? ' active' : '');
        dots.appendChild(dot);
    });

    const btn = document.getElementById('storyNextBtn');
    btn.textContent = storyIndex < ch.stories.length - 1 ? '继续 →' : '学汉字 →';

    panel.classList.add('visible');
}

// ============ 故事翻页 ============
function advanceStory() {
    const ch = chaptersData.find(c => c.id === gameState.currentChapter);
    if (!ch) return;

    storyIndex++;
    if (storyIndex < ch.stories.length) {
        showStory(ch);
    } else {
        document.getElementById('storyPanel').classList.remove('visible');
        hanziIndex = 0;
        gameState.phase = 'hanzi';
        setTimeout(() => showHanzi(ch), 400);
    }
}

// ============ 汉字学习 ============
function showHanzi(ch) {
    const panel = document.getElementById('hanziPanel');
    const hanzi = ch.hanzi[hanziIndex];

    document.getElementById('hanziTag').textContent =
        `汉字学习 · 第${hanziIndex + 1}/${ch.hanzi.length}个`;
    document.getElementById('hanziChar').textContent = hanzi.char;
    document.getElementById('hanziPinyin').textContent = hanzi.pinyin;
    document.getElementById('hanziWords').textContent = hanzi.words;
    document.getElementById('hanziSentence').textContent = hanzi.sentence;

    const canvas = document.getElementById('hanziPictograph');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (hanzi.pictograph && pictographDrawers[hanzi.pictograph]) {
        pictographDrawers[hanzi.pictograph](ctx, canvas.width, canvas.height);
    }

    const hanziText = `${hanzi.char}，${hanzi.pinyin}，${hanzi.words.replace(/·/g, '，')}。${hanzi.sentence}`;
    playAudio(neptuneAudio.hanzi(ch.id, hanziIndex + 1), hanziText);

    document.getElementById('hanziNextBtn').textContent =
        hanziIndex < ch.hanzi.length - 1 ? '下一个字 →' : '去答题 →';

    panel.classList.add('visible');
}

// ============ 汉字翻页 ============
function advanceHanzi() {
    const ch = chaptersData.find(c => c.id === gameState.currentChapter);
    if (!ch) return;

    hanziIndex++;
    if (hanziIndex < ch.hanzi.length) {
        document.getElementById('hanziPanel').classList.remove('visible');
        setTimeout(() => showHanzi(ch), 300);
    } else {
        document.getElementById('hanziPanel').classList.remove('visible');
        gameState.phase = 'quiz';
        setTimeout(() => showQuiz(ch), 400);
    }
}

// ============ 知识测验 ============
function showQuiz(ch) {
    quizAnswered = false;
    const panel = document.getElementById('quizPanel');
    document.getElementById('quizTag').textContent = '知识测验';
    document.getElementById('quizTag').className = 'quiz-tag knowledge';
    document.getElementById('quizQuestion').textContent = ch.quiz.question;

    const labels = ['A', 'B', 'C'];
    const fullText = ch.quiz.question + '。' + ch.quiz.options.map((opt, i) => labels[i] + '，' + opt.text).join('。') + '。选一选吧！';
    playAudio(neptuneAudio.quiz(ch.id), fullText);

    const optionsDiv = document.getElementById('quizOptions');
    optionsDiv.innerHTML = '';

    ch.quiz.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.innerHTML = `<span class="opt-label">${labels[i]}</span><span class="opt-text">${opt.text}</span>`;
        const soundBtn = document.createElement('span');
        soundBtn.className = 'opt-sound';
        soundBtn.textContent = '\u{1F50A}';
        soundBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playAudio(neptuneAudio.quizOption(ch.id, i), labels[i] + '，' + opt.text);
        });
        btn.appendChild(soundBtn);
        btn.onclick = () => handleQuizAnswer(btn, opt.correct, ch.quiz.hint, 'quiz');
        optionsDiv.appendChild(btn);
    });

    panel.classList.add('visible');
}

// ============ 数学挑战 ============
function showMath(ch) {
    quizAnswered = false;
    const panel = document.getElementById('quizPanel');
    const qIdx = gameState.mathQuestionIndex;
    const mathQ = ch.math[qIdx];
    const total = ch.math.length;

    document.getElementById('quizTag').textContent = `数学挑战 (${qIdx + 1}/${total})`;
    document.getElementById('quizTag').className = 'quiz-tag math';

    const optionsDiv = document.getElementById('quizOptions');
    optionsDiv.innerHTML = '';

    const audioPath = neptuneAudio.math(ch.id, qIdx);

    if (mathQ.type === 'choice') {
        document.getElementById('quizQuestion').textContent = mathQ.question;
        playAudio(audioPath, mathQ.question);
        const labels = ['A', 'B', 'C'];
        mathQ.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.innerHTML = `<span class="opt-label">${labels[i]}</span><span>${opt.text}</span>`;
            btn.onclick = () => handleQuizAnswer(btn, opt.correct, mathQ.hint, 'math');
            optionsDiv.appendChild(btn);
        });
    } else if (mathQ.type === 'fillin') {
        document.getElementById('quizQuestion').textContent = mathQ.question;
        playAudio(audioPath, mathQ.question);
        const numpad = document.createElement('div');
        numpad.className = 'math-numpad';
        for (let n = 0; n <= 10; n++) {
            const btn = document.createElement('button');
            btn.className = 'numpad-btn';
            btn.textContent = n;
            btn.onclick = () => handleQuizAnswer(btn, n === mathQ.answer, mathQ.hint, 'math');
            numpad.appendChild(btn);
        }
        optionsDiv.appendChild(numpad);
    } else if (mathQ.type === 'compare') {
        document.getElementById('quizQuestion').innerHTML =
            `${mathQ.question}<div class="compare-expr"><span class="compare-num">${mathQ.left}</span> <span class="compare-circle">○</span> <span class="compare-num">${mathQ.right}</span></div>`;
        playAudio(audioPath, `比一比，${mathQ.left}和${mathQ.right}，哪个大？`);
        const compareDiv = document.createElement('div');
        compareDiv.className = 'compare-buttons';
        [['>', '大于'], ['=', '等于'], ['<', '小于']].forEach(([symbol, text]) => {
            const btn = document.createElement('button');
            btn.className = 'compare-btn';
            btn.innerHTML = `<span class="compare-symbol">${symbol}</span><span class="compare-text">${text}</span>`;
            btn.onclick = () => handleQuizAnswer(btn, symbol === mathQ.answer, mathQ.hint, 'math');
            compareDiv.appendChild(btn);
        });
        optionsDiv.appendChild(compareDiv);
    } else if (mathQ.type === 'sequential') {
        // 连续加减法：显示故事 + 高亮算式 + 数字键盘
        const exprParts = mathQ.expression.replace(/\s/g, '').split(/([+\-])/);
        let exprHTML = exprParts.map(p => {
            if (p === '+' || p === '-') return `<span class="seq-op">${p}</span>`;
            return `<span>${p}</span>`;
        }).join(' ');
        exprHTML += ` <span class="seq-op">=</span> <span class="seq-q">?</span>`;
        document.getElementById('quizQuestion').innerHTML =
            `${mathQ.question}<div class="sequential-expr">${exprHTML}</div>`;
        playAudio(audioPath, mathQ.question);
        const numpad = document.createElement('div');
        numpad.className = 'math-numpad';
        for (let n = 0; n <= 10; n++) {
            const btn = document.createElement('button');
            btn.className = 'numpad-btn';
            btn.textContent = n;
            btn.onclick = () => handleQuizAnswer(btn, n === mathQ.answer, mathQ.hint, 'math');
            numpad.appendChild(btn);
        }
        optionsDiv.appendChild(numpad);
    }

    panel.classList.add('visible');
}

// ============ 测验答题处理 ============
function handleQuizAnswer(btnEl, isCorrect, hint, type) {
    if (quizAnswered) return;
    const chId = gameState.currentChapter;

    if (isCorrect) {
        quizAnswered = true;
        btnEl.classList.add('correct');
        playAudio(neptuneAudio.correct, '太棒了！回答正确！');

        setTimeout(() => {
            document.getElementById('quizPanel').classList.remove('visible');

            if (gameState.phase === 'quiz') {
                gameState.phase = 'math';
                gameState.mathQuestionIndex = 0;
                const ch = chaptersData.find(c => c.id === chId);
                setTimeout(() => showMath(ch), 500);
            } else if (gameState.phase === 'math') {
                gameState.mathQuestionIndex++;
                const ch = chaptersData.find(c => c.id === chId);
                if (gameState.mathQuestionIndex < ch.math.length) {
                    setTimeout(() => showMath(ch), 500);
                } else {
                    completeChapter();
                }
            }
        }, 1200);
    } else {
        btnEl.classList.add('wrong');
        const hintAudioPath = type === 'math' ? neptuneAudio.mathHint(chId, gameState.mathQuestionIndex) : neptuneAudio.quizHint(chId);
        playAudio(hintAudioPath, hint || '再想一想！');

        setTimeout(() => {
            btnEl.classList.remove('wrong');
        }, 1000);
    }
}

// ============ 章节完成 ============
function completeChapter() {
    const chId = gameState.currentChapter;
    if (!gameState.completedChapters.includes(chId)) {
        gameState.completedChapters.push(chId);
        saveProgress();
    }

    renderProgressBar();
    triggerStarFall();

    const ch = chaptersData.find(c => c.id === chId);
    document.getElementById('rewardIcon').textContent = '⭐';
    document.getElementById('rewardTitle').textContent = `第${chId}章完成！`;
    document.getElementById('rewardDesc').textContent = `「${ch.title}」探险成功！你获得了一颗星星！`;
    playAudio(neptuneAudio.complete(chId), `太厉害了！第${chId}章，${ch.title}，探险成功！你获得了一颗星星！`);

    document.getElementById('rewardPopup').classList.add('visible');
}

// ============ 关闭奖励弹窗 ============
function closeReward() {
    document.getElementById('rewardPopup').classList.remove('visible');

    if (gameState.completedChapters.length >= 6) {
        setTimeout(() => {
            showFinalBadge();
        }, 500);
    } else {
        showChapterMenu();
    }
}

// ============ 最终徽章 ============
function showFinalBadge() {
    triggerStarFall();
    playAudio(neptuneAudio.finalBadge, '恭喜智天！你完成了全部6个章节的海王星探险！你获得了海王星探险家大徽章！');
    document.getElementById('finalBadge').classList.add('visible');
}

function closeFinalBadge() {
    document.getElementById('finalBadge').classList.remove('visible');
    showChapterMenu();
}

// ============ 星星飘落特效 ============
function triggerStarFall() {
    const canvas = document.getElementById('starFallCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    const particles = [];
    for (let i = 0; i < 40; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: -20 - Math.random() * 200,
            vx: (Math.random() - 0.5) * 2,
            vy: 1.5 + Math.random() * 3,
            size: 8 + Math.random() * 16,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            opacity: 0.7 + Math.random() * 0.3,
            type: Math.random() > 0.5 ? '⭐' : '✨'
        });
    }

    let frame = 0;
    function drawFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;

        particles.forEach(p => {
            if (p.y > canvas.height + 50) return;
            alive = true;

            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.03;
            p.rotation += p.rotationSpeed;
            p.opacity -= 0.003;
            if (p.opacity < 0) p.opacity = 0;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = p.opacity;
            ctx.font = `${p.size}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.type, 0, 0);
            ctx.restore();
        });

        frame++;
        if (alive && frame < 300) {
            requestAnimationFrame(drawFrame);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    requestAnimationFrame(drawFrame);
}

// ============ 初始化入口 ============
function start() {
    loadProgress();
    init();
    renderChapterMenu();
    renderProgressBar();

    const sfCanvas = document.getElementById('starFallCanvas');
    sfCanvas.width = window.innerWidth;
    sfCanvas.height = window.innerHeight;
}

window.addEventListener('DOMContentLoaded', start);
