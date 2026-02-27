/**
 * 木星探险家 - 柳智天的宇宙课堂
 * 6大章节闯关：科普故事 → 汉字学习 → 知识测验 → 数学挑战 → 获得星星
 */

// ============ 全局变量 ============
let scene, camera, renderer, controls;
let jupiterMesh, earthRef, starField;
let clock;

// ============ 章节数据 ============
const chaptersData = [
    {
        id: 1,
        title: '太阳系最大',
        icon: '🪐',
        desc: '最大的行星',
        stories: [
            '木星是太阳系中<span class="highlight">最大的行星</span>！',
            '木星能装下<span class="highlight">1300多个地球</span>！它的直径是地球的<span class="highlight">11倍</span>！',
            '如果把太阳系所有行星加在一起，木星的质量还是比它们的<span class="highlight">总和大2倍多</span>！'
        ],
        hanzi: [
            { char: '木', pinyin: 'mù', words: '木头 · 树木', sentence: '森林里有好多大树木。', pictograph: 'drawWood' },
            { char: '目', pinyin: 'mù', words: '目光 · 眼目', sentence: '小宝宝的目光亮亮的。', pictograph: 'drawEye' }
        ],
        quiz: {
            question: '太阳系最大的行星是？',
            options: [
                { text: '木星', correct: true },
                { text: '土星', correct: false },
                { text: '地球', correct: false }
            ],
            hint: '它能装下1300多个地球哦！'
        },
        math: [
            {
                type: 'choice',
                question: '木星有4颗大卫星和3颗小卫星在身边，一共几颗？',
                options: [
                    { text: '6颗', correct: false },
                    { text: '7颗', correct: true },
                    { text: '8颗', correct: false }
                ],
                hint: '4 + 3 = ?'
            },
            {
                type: 'fillin',
                question: '木星能装下10个小星球，已经装了4个，还能装几个？',
                answer: 6,
                hint: '10 - 4 = 6'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 8,
                right: 5,
                answer: '>',
                hint: '8比5大！'
            }
        ]
    },
    {
        id: 2,
        title: '气态巨行星',
        icon: '🎈',
        desc: '没有固体地面',
        stories: [
            '木星没有固体的地面！它全部是由<span class="highlight">气体</span>组成的！',
            '主要是<span class="highlight">氢气和氦气</span>，就像一个超级巨大的<span class="highlight">气球</span>！',
            '如果你想在木星上降落，会一直往下沉，因为<span class="highlight">没有地面</span>可以站！'
        ],
        hanzi: [
            { char: '云', pinyin: 'yún', words: '白云 · 乌云', sentence: '白白的云朵像棉花糖。', pictograph: 'drawCloud' },
            { char: '气', pinyin: 'qì', words: '空气 · 气球', sentence: '五颜六色的气球飞上天。', pictograph: 'drawBalloon' }
        ],
        quiz: {
            question: '木星的表面是什么？',
            options: [
                { text: '岩石', correct: false },
                { text: '海洋', correct: false },
                { text: '没有固体表面，全是气体', correct: true }
            ],
            hint: '木星是气态巨行星哦！'
        },
        math: [
            {
                type: 'choice',
                question: '木星大气有5层，我们看到了3层，还有几层没看到？',
                options: [
                    { text: '2层', correct: true },
                    { text: '3层', correct: false },
                    { text: '1层', correct: false }
                ],
                hint: '5 - 3 = ?'
            },
            {
                type: 'fillin',
                question: '木星的气体云有3团白色的和4团橙色的，一共有几团？',
                answer: 7,
                hint: '3 + 4 = 7'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 3,
                right: 6,
                answer: '<',
                hint: '3比6小！'
            }
        ]
    },
    {
        id: 3,
        title: '大红斑',
        icon: '🌀',
        desc: '超级大风暴',
        stories: [
            '木星上有一个超级大风暴叫<span class="highlight">"大红斑"</span>，比地球还要大！',
            '这个风暴已经刮了至少<span class="highlight">400年</span>了，一直没有停！',
            '大红斑里面的风速可以达到每小时<span class="highlight">600多公里</span>，比地球上最强的台风还厉害！'
        ],
        hanzi: [
            { char: '雷', pinyin: 'léi', words: '打雷 · 雷声', sentence: '轰隆隆，天上打雷了。', pictograph: 'drawThunder' },
            { char: '电', pinyin: 'diàn', words: '闪电 · 电灯', sentence: '闪电划过夜空好亮。', pictograph: 'drawLightning' }
        ],
        quiz: {
            question: '木星的大红斑是什么？',
            options: [
                { text: '一座火山', correct: false },
                { text: '一个超级大风暴', correct: true },
                { text: '一片海洋', correct: false }
            ],
            hint: '它已经刮了400年了！'
        },
        math: [
            {
                type: 'choice',
                question: '大风暴里有4股大风和3股小风，一共几股风？',
                options: [
                    { text: '6股', correct: false },
                    { text: '8股', correct: false },
                    { text: '7股', correct: true }
                ],
                hint: '4 + 3 = ?'
            },
            {
                type: 'fillin',
                question: '大红斑的风速特别快，如果风吹走了9片云，又飘来了1片，还剩几片被吹走的？',
                answer: 8,
                hint: '9 - 1 = 8'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 7,
                right: 7,
                answer: '=',
                hint: '7和7一样大！'
            }
        ]
    },
    {
        id: 4,
        title: '木星的卫星',
        icon: '🌕',
        desc: '伽利略卫星',
        stories: [
            '木星有<span class="highlight">79颗</span>卫星，是太阳系卫星最多的行星之一！',
            '最有名的是四颗<span class="highlight">伽利略卫星</span>：木卫一、木卫二、木卫三和木卫四！',
            '木卫二表面覆盖着<span class="highlight">冰</span>，冰下面可能有<span class="highlight">海洋</span>，说不定有生命哦！'
        ],
        hanzi: [
            { char: '口', pinyin: 'kǒu', words: '人口 · 口袋', sentence: '张开口大声唱歌。', pictograph: 'drawMouth' },
            { char: '耳', pinyin: 'ěr', words: '耳朵 · 耳环', sentence: '竖起耳朵仔细听。', pictograph: 'drawEar' }
        ],
        quiz: {
            question: '木星最有名的四颗卫星叫什么？',
            options: [
                { text: '伽利略卫星', correct: true },
                { text: '阿波罗卫星', correct: false },
                { text: '哈勃卫星', correct: false }
            ],
            hint: '是一位著名天文学家发现的！'
        },
        math: [
            {
                type: 'choice',
                question: '伽利略发现了4颗卫星，后来又发现了3颗，一共几颗？',
                options: [
                    { text: '6颗', correct: false },
                    { text: '7颗', correct: true },
                    { text: '8颗', correct: false }
                ],
                hint: '4 + 3 = ?'
            },
            {
                type: 'fillin',
                question: '木卫二的冰面上有5条裂缝，又发现了3条，一共几条？',
                answer: 8,
                hint: '5 + 3 = 8'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 4,
                right: 9,
                answer: '<',
                hint: '4比9小！'
            }
        ]
    },
    {
        id: 5,
        title: '木星的环',
        icon: '💫',
        desc: '看不见的光环',
        stories: [
            '你知道吗？木星也有<span class="highlight">环</span>！不过木星的环非常非常暗淡，肉眼看不到！',
            '木星环主要是由<span class="highlight">尘埃</span>组成的，不像土星环那么漂亮！',
            '直到<span class="highlight">1979年</span>旅行者1号飞过木星时才发现了它的环！'
        ],
        hanzi: [
            { char: '环', pinyin: 'huán', words: '环绕 · 光环', sentence: '土星的光环真漂亮。', pictograph: 'drawRing' },
            { char: '圈', pinyin: 'quān', words: '圆圈 · 跑圈', sentence: '小朋友在操场跑了一圈。', pictograph: 'drawCircle' }
        ],
        quiz: {
            question: '木星的环是由什么组成的？',
            options: [
                { text: '冰块', correct: false },
                { text: '岩石', correct: false },
                { text: '尘埃', correct: true }
            ],
            hint: '木星环非常暗淡...'
        },
        math: [
            {
                type: 'choice',
                question: '木星环有3层，土星环有7层，木星比土星少几层？',
                options: [
                    { text: '4层', correct: true },
                    { text: '3层', correct: false },
                    { text: '5层', correct: false }
                ],
                hint: '7 - 3 = ?'
            },
            {
                type: 'fillin',
                question: '木星环上飘着6粒尘埃，飞走了2粒，还剩几粒？',
                answer: 4,
                hint: '6 - 2 = 4'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 3,
                right: 7,
                answer: '<',
                hint: '3比7小！木星环比土星环少。'
            }
        ]
    },
    {
        id: 6,
        title: '保护地球',
        icon: '🛡️',
        desc: '宇宙吸尘器',
        stories: [
            '木星有一个特别重要的作用——<span class="highlight">保护地球</span>！',
            '木星的引力特别大，能把飞向地球的<span class="highlight">小行星和彗星</span>吸引走！',
            '就像一个大哥哥，帮地球挡住了很多危险的"石头雨"，所以木星被叫做<span class="highlight">"宇宙吸尘器"</span>！'
        ],
        hanzi: [
            { char: '雨', pinyin: 'yǔ', words: '下雨 · 雨水', sentence: '哗哗哗，下雨啦。', pictograph: 'drawRain' },
            { char: '手', pinyin: 'shǒu', words: '小手 · 手指', sentence: '我有两只小小手。', pictograph: 'drawHand' }
        ],
        quiz: {
            question: '木星被叫做什么？',
            options: [
                { text: '宇宙灯塔', correct: false },
                { text: '宇宙吸尘器', correct: true },
                { text: '宇宙磁铁', correct: false }
            ],
            hint: '它帮地球吸走了很多危险的东西...'
        },
        math: [
            {
                type: 'choice',
                question: '木星帮地球挡住了5块大石头和3块小石头，一共几块？',
                options: [
                    { text: '7块', correct: false },
                    { text: '9块', correct: false },
                    { text: '8块', correct: true }
                ],
                hint: '5 + 3 = ?'
            },
            {
                type: 'fillin',
                question: '木星吸走了10颗小行星，地球自己挡住了1颗，木星比地球多挡了几颗？',
                answer: 9,
                hint: '10 - 1 = 9'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 5,
                right: 3,
                answer: '>',
                hint: '5比3大！大石头比小石头多。'
            }
        ]
    }
];

// ============ 象形图绘制函数 ============
const pictographDrawers = {
    drawWood(ctx, w, h) {
        // 木 - 树干+树枝
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        // 树干
        ctx.beginPath(); ctx.moveTo(w/2, 25); ctx.lineTo(w/2, 115); ctx.stroke();
        // 横枝
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(25, 60); ctx.lineTo(w-25, 60); ctx.stroke();
        // 左撇
        ctx.beginPath(); ctx.moveTo(w/2, 75); ctx.lineTo(25, 115); ctx.stroke();
        // 右捺
        ctx.beginPath(); ctx.moveTo(w/2, 75); ctx.lineTo(w-25, 115); ctx.stroke();
        // 绿叶
        ctx.fillStyle = '#27AE60';
        ctx.beginPath(); ctx.arc(w/2, 18, 12, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(25, 52, 8, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w-25, 52, 8, 0, Math.PI*2); ctx.fill();
    },
    drawEye(ctx, w, h) {
        // 目 - 眼睛
        ctx.strokeStyle = '#3498DB';
        ctx.lineWidth = 4;
        // 外框
        ctx.beginPath();
        ctx.ellipse(w/2, h/2, 40, 28, 0, 0, Math.PI*2);
        ctx.stroke();
        // 眼球
        ctx.fillStyle = '#2C3E50';
        ctx.beginPath(); ctx.arc(w/2, h/2, 16, 0, Math.PI*2); ctx.fill();
        // 瞳孔
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(w/2, h/2, 8, 0, Math.PI*2); ctx.fill();
        // 高光
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(w/2+5, h/2-5, 4, 0, Math.PI*2); ctx.fill();
        // 横线（目字结构）
        ctx.strokeStyle = '#3498DB'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(w/2-40, h/2); ctx.lineTo(w/2+40, h/2); ctx.stroke();
    },
    drawCloud(ctx, w, h) {
        // 云 - 白云朵
        ctx.fillStyle = '#ECF0F1';
        ctx.beginPath(); ctx.arc(w/2, h/2+5, 25, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w/2-20, h/2+10, 20, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w/2+20, h/2+10, 20, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w/2-10, h/2-5, 18, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w/2+12, h/2-3, 16, 0, Math.PI*2); ctx.fill();
        // 底部的雨线
        ctx.strokeStyle = '#85C1E9'; ctx.lineWidth = 2; ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
            const x = w/2 - 15 + i * 15;
            ctx.beginPath(); ctx.moveTo(x, h/2+30); ctx.lineTo(x-3, h/2+45); ctx.stroke();
        }
    },
    drawBalloon(ctx, w, h) {
        // 气 - 气球
        const colors = ['#E74C3C', '#3498DB', '#F39C12', '#2ECC71'];
        for (let i = 0; i < 4; i++) {
            const x = 25 + i * 25;
            const y = 30 + (i % 2) * 15;
            ctx.fillStyle = colors[i];
            ctx.beginPath(); ctx.ellipse(x, y, 12, 16, 0, 0, Math.PI*2); ctx.fill();
            // 绳子
            ctx.strokeStyle = '#95A5A6'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x, y+16); ctx.lineTo(x+(i-1.5)*3, h-25); ctx.stroke();
        }
        // 蝴蝶结
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath(); ctx.moveTo(w/2-8, h-25); ctx.lineTo(w/2, h-30); ctx.lineTo(w/2+8, h-25);
        ctx.lineTo(w/2, h-20); ctx.closePath(); ctx.fill();
    },
    drawThunder(ctx, w, h) {
        // 雷 - 乌云+闪电
        ctx.fillStyle = '#7F8C8D';
        ctx.beginPath(); ctx.arc(w/2, 35, 22, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w/2-18, 38, 16, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w/2+18, 38, 16, 0, Math.PI*2); ctx.fill();
        // 闪电
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.moveTo(w/2+5, 55); ctx.lineTo(w/2-10, 80);
        ctx.lineTo(w/2, 78); ctx.lineTo(w/2-8, 110);
        ctx.lineTo(w/2+12, 80); ctx.lineTo(w/2+2, 82);
        ctx.closePath(); ctx.fill();
        // 雷字底部的田
        ctx.strokeStyle = '#F4D03F'; ctx.lineWidth = 2;
        ctx.strokeRect(w/2-12, 90, 24, 20);
        ctx.beginPath(); ctx.moveTo(w/2, 90); ctx.lineTo(w/2, 110); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2-12, 100); ctx.lineTo(w/2+12, 100); ctx.stroke();
    },
    drawLightning(ctx, w, h) {
        // 电 - 闪电符号
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.moveTo(w/2+10, 15); ctx.lineTo(w/2-20, h/2+5);
        ctx.lineTo(w/2-2, h/2+5); ctx.lineTo(w/2-15, h-15);
        ctx.lineTo(w/2+20, h/2-5); ctx.lineTo(w/2+2, h/2-5);
        ctx.closePath(); ctx.fill();
        // 发光效果
        ctx.shadowColor = '#F4D03F';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
    },
    drawMouth(ctx, w, h) {
        // 口 - 嘴巴
        ctx.strokeStyle = '#E74C3C';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        // 方口
        const cx = w/2, cy = h/2;
        ctx.strokeRect(cx-25, cy-22, 50, 44);
        // 舌头（红色）
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.ellipse(cx, cy+12, 15, 8, 0, 0, Math.PI);
        ctx.fill();
        // 牙齿
        ctx.fillStyle = '#FFF';
        ctx.fillRect(cx-20, cy-22, 12, 10);
        ctx.fillRect(cx+8, cy-22, 12, 10);
    },
    drawEar(ctx, w, h) {
        // 耳 - 耳朵
        ctx.strokeStyle = '#E67E22';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        // 外耳轮廓
        ctx.beginPath();
        ctx.moveTo(w/2+5, 20);
        ctx.quadraticCurveTo(w/2+35, 30, w/2+35, h/2);
        ctx.quadraticCurveTo(w/2+35, h-25, w/2+5, h-20);
        ctx.stroke();
        // 内耳
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(w/2+5, 40);
        ctx.quadraticCurveTo(w/2+20, 45, w/2+20, h/2);
        ctx.quadraticCurveTo(w/2+20, h-40, w/2+5, h-35);
        ctx.stroke();
        // 耳垂
        ctx.fillStyle = '#FDEBD0';
        ctx.beginPath(); ctx.arc(w/2+10, h-22, 8, 0, Math.PI*2); ctx.fill();
        // 竖线
        ctx.strokeStyle = '#E67E22'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(w/2-15, 25); ctx.lineTo(w/2-15, h-20); ctx.stroke();
        // 横线
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(w/2-25, h/2); ctx.lineTo(w/2+5, h/2); ctx.stroke();
    },
    drawRing(ctx, w, h) {
        // 环 - 光环
        ctx.strokeStyle = '#D4A04A';
        ctx.lineWidth = 3;
        // 行星
        ctx.fillStyle = '#C88B3A';
        ctx.beginPath(); ctx.arc(w/2, h/2, 18, 0, Math.PI*2); ctx.fill();
        // 环
        ctx.beginPath();
        ctx.ellipse(w/2, h/2, 45, 15, -0.2, 0, Math.PI*2);
        ctx.stroke();
        ctx.strokeStyle = '#E67E22'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(w/2, h/2, 38, 12, -0.2, 0, Math.PI*2);
        ctx.stroke();
        // 星星
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.arc(25, 25, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w-30, 30, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(20, h-30, 2, 0, Math.PI*2); ctx.fill();
    },
    drawCircle(ctx, w, h) {
        // 圈 - 圆圈/跑圈
        // 跑道
        ctx.strokeStyle = '#E67E22';
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(w/2, h/2, 40, 0, Math.PI*2); ctx.stroke();
        // 内圆（草地）
        ctx.fillStyle = '#27AE60';
        ctx.beginPath(); ctx.arc(w/2, h/2, 30, 0, Math.PI*2); ctx.fill();
        // 小人在跑
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath(); ctx.arc(w/2+38, h/2, 6, 0, Math.PI*2); ctx.fill();
        // 小人身体
        ctx.strokeStyle = '#3498DB'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(w/2+38, h/2+6); ctx.lineTo(w/2+38, h/2+16); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2+34, h/2+10); ctx.lineTo(w/2+42, h/2+10); ctx.stroke();
        // 跑步线
        ctx.beginPath(); ctx.moveTo(w/2+35, h/2+16); ctx.lineTo(w/2+32, h/2+22); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2+41, h/2+16); ctx.lineTo(w/2+44, h/2+22); ctx.stroke();
    },
    drawRain(ctx, w, h) {
        // 雨 - 下雨
        // 云
        ctx.fillStyle = '#7F8C8D';
        ctx.beginPath(); ctx.arc(w/2, 30, 20, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w/2-16, 33, 14, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w/2+16, 33, 14, 0, Math.PI*2); ctx.fill();
        // 雨滴
        ctx.fillStyle = '#5DADE2';
        const drops = [
            [w/2-25, 60], [w/2-10, 55], [w/2+5, 62], [w/2+20, 57],
            [w/2-20, 80], [w/2-5, 85], [w/2+10, 78], [w/2+25, 82],
            [w/2-15, 100], [w/2, 105], [w/2+15, 98]
        ];
        drops.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.moveTo(x, y-6);
            ctx.quadraticCurveTo(x+5, y+2, x, y+6);
            ctx.quadraticCurveTo(x-5, y+2, x, y-6);
            ctx.fill();
        });
    },
    drawHand(ctx, w, h) {
        // 手 - 小手掌
        ctx.fillStyle = '#FDEBD0';
        // 手掌
        ctx.beginPath();
        ctx.ellipse(w/2, h/2+15, 25, 22, 0, 0, Math.PI*2);
        ctx.fill();
        // 手指
        const fingers = [
            { x: w/2-18, y: h/2-8, w: 8, h: 25, angle: 0.2 },
            { x: w/2-7, y: h/2-18, w: 8, h: 28, angle: 0.05 },
            { x: w/2+4, y: h/2-20, w: 8, h: 30, angle: -0.05 },
            { x: w/2+15, y: h/2-15, w: 8, h: 25, angle: -0.15 },
        ];
        fingers.forEach(f => {
            ctx.save();
            ctx.translate(f.x+4, f.y+f.h);
            ctx.rotate(f.angle);
            ctx.beginPath();
            ctx.roundRect(-4, -f.h, f.w, f.h, 4);
            ctx.fill();
            ctx.restore();
        });
        // 大拇指
        ctx.save();
        ctx.translate(w/2-28, h/2+5);
        ctx.rotate(0.5);
        ctx.beginPath();
        ctx.roundRect(-4, -18, 9, 22, 4);
        ctx.fill();
        ctx.restore();
        // 指甲
        ctx.fillStyle = '#F5CBA7';
        fingers.forEach(f => {
            ctx.beginPath(); ctx.arc(f.x+4, f.y+2, 3, 0, Math.PI*2); ctx.fill();
        });
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
const jupiterAudio = {
    correct: 'audio/jupiter/correct.mp3',
    finalBadge: 'audio/jupiter/final-badge.mp3',
    story: (chId, idx) => `audio/jupiter/ch${chId}-story-${idx}.mp3`,
    hanzi: (chId, idx) => `audio/jupiter/ch${chId}-hanzi-${idx}.mp3`,
    quiz: (chId) => `audio/jupiter/ch${chId}-quiz.mp3`,
    quizOption: (chId, optIdx) => `audio/jupiter/ch${chId}-quiz-${['a','b','c'][optIdx]}.mp3`,
    quizHint: (chId) => `audio/jupiter/ch${chId}-quiz-hint.mp3`,
    math: (chId, qIdx) => qIdx > 0 ? `audio/jupiter/ch${chId}-math-${qIdx + 1}.mp3` : `audio/jupiter/ch${chId}-math.mp3`,
    mathHint: (chId, qIdx) => qIdx > 0 ? `audio/jupiter/ch${chId}-math-${qIdx + 1}-hint.mp3` : `audio/jupiter/ch${chId}-math-hint.mp3`,
    complete: (chId) => `audio/jupiter/ch${chId}-complete.mp3`
};

// ============ 存档 ============
function saveProgress() {
    localStorage.setItem('jupiterExplorer', JSON.stringify({
        completedChapters: gameState.completedChapters
    }));
}

function loadProgress() {
    try {
        const data = JSON.parse(localStorage.getItem('jupiterExplorer'));
        if (data && data.completedChapters) {
            gameState.completedChapters = data.completedChapters;
        }
    } catch(e) {}
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
    createJupiter();
    createEarthReference();
    addLights();

    window.addEventListener('resize', onWindowResize);

    // 纹理加载检测
    const checkLoaded = setInterval(() => {
        if (jupiterMesh && jupiterMesh.material && jupiterMesh.material.uniforms &&
            jupiterMesh.material.uniforms.planetTexture.value.image) {
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

// ============ 创建木星 ============
function createJupiter() {
    const geometry = new THREE.SphereGeometry(6, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const jupiterMap = textureLoader.load('textures/jupiter.jpg');

    const jupiterMaterial = new THREE.ShaderMaterial({
        uniforms: {
            planetTexture: { value: jupiterMap },
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
                surfaceColor *= 1.15;

                // 光照
                vec3 lightDir = normalize(sunDirection);
                float diff = max(dot(vNormal, lightDir), 0.0);
                float ambient = 0.12;
                surfaceColor *= (diff * 0.85 + ambient);

                // Fresnel 弱土黄色大气边缘光
                vec3 viewDir = normalize(cameraPosition - vWorldPos);
                float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
                surfaceColor += vec3(0.78, 0.55, 0.22) * fresnel * 0.15;

                gl_FragColor = vec4(surfaceColor, 1.0);
            }
        `
    });

    jupiterMesh = new THREE.Mesh(geometry, jupiterMaterial);
    scene.add(jupiterMesh);
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

// ============ 创建远处小地球（大小对比参照） ============
function createEarthReference() {
    // 地球直径约为木星的1/11，木星半径6，地球约0.55
    const geometry = new THREE.SphereGeometry(0.55, 32, 32);
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load('textures/earth_daymap.jpg');

    const material = new THREE.MeshPhongMaterial({
        map: earthMap,
        shininess: 25
    });

    earthRef = new THREE.Mesh(geometry, material);
    earthRef.position.set(10, 3, 5);
    scene.add(earthRef);
}

// ============ 灯光 ============
function addLights() {
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(50, 20, 30);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x222233, 0.3);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0x4466aa, 0.3);
    rimLight.position.set(-30, -10, -20);
    scene.add(rimLight);
}

// ============ 动画循环 ============
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    // 木星缓慢自转（展示条纹）
    if (jupiterMesh) {
        jupiterMesh.rotation.y += delta * 0.08;
        if (jupiterMesh.material.uniforms) {
            jupiterMesh.material.uniforms.time.value = elapsed;
        }
    }

    // 地球参照缓慢自转
    if (earthRef) {
        earthRef.rotation.y += delta * 0.15;
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
        // 太阳系最大 - 正面近景，能看到小地球对比
        animateCameraTo({ x: 5, y: 3, z: 16 }, { x: 0, y: 0, z: 0 });
    },
    2: () => {
        // 气态巨行星 - 远景全貌
        animateCameraTo({ x: -10, y: 8, z: 22 }, { x: 0, y: 0, z: 0 });
    },
    3: () => {
        // 大红斑 - 推近看表面条纹
        animateCameraTo({ x: 3, y: -1, z: 13 }, { x: 0, y: -2, z: 0 });
    },
    4: () => {
        // 木星的卫星 - 侧面远景
        animateCameraTo({ x: 15, y: 8, z: 15 }, { x: 0, y: 0, z: 0 });
    },
    5: () => {
        // 木星的环 - 稍远能看到环
        animateCameraTo({ x: -2, y: 12, z: 20 }, { x: 0, y: 0, z: 0 });
    },
    6: () => {
        // 保护地球 - 能看到远处地球
        animateCameraTo({ x: -8, y: 5, z: 18 }, { x: 0, y: 0, z: 0 });
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
        star.onclick = () => {};
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
    playAudio(jupiterAudio.story(ch.id, storyIndex + 1), plainText);

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
    playAudio(jupiterAudio.hanzi(ch.id, hanziIndex + 1), hanziText);

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
    playAudio(jupiterAudio.quiz(ch.id), fullText);

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
            playAudio(jupiterAudio.quizOption(ch.id, i), labels[i] + '，' + opt.text);
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

    const audioPath = jupiterAudio.math(ch.id, qIdx);

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
            `${mathQ.question}<div class="compare-expr"><span class="compare-num">${mathQ.left}</span> <span class="compare-circle">&#9675;</span> <span class="compare-num">${mathQ.right}</span></div>`;
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
        playAudio(jupiterAudio.correct, '太棒了！回答正确！');

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
        const hintAudioPath = type === 'math'
            ? jupiterAudio.mathHint(chId, gameState.mathQuestionIndex)
            : jupiterAudio.quizHint(chId);
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
    playAudio(jupiterAudio.complete(chId), `太厉害了！第${chId}章，${ch.title}，探险成功！你获得了一颗星星！`);

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
    playAudio(jupiterAudio.finalBadge, '恭喜智天！你完成了全部6个章节的木星探险！你获得了木星探险家大徽章！');
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
