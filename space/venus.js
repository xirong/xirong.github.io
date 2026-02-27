/**
 * 金星探险家 - 柳智天的宇宙课堂
 * 6大章节闯关：科普故事 → 汉字学习 → 知识测验 → 数学挑战 → 获得星星
 */

// ============ 全局变量 ============
let scene, camera, renderer, controls;
let venusMesh, earthRef, starField;
let clock;

// ============ 章节数据 ============
const chaptersData = [
    {
        id: 1,
        title: '地球的姐妹',
        icon: '👯',
        desc: '金星和地球是姐妹星',
        stories: [
            '金星和地球<span class="highlight">大小差不多</span>，所以被叫做地球的<span class="highlight">"姐妹星"</span>！',
            '但是金星和地球其实<span class="highlight">非常不一样</span>，它是太阳系中<span class="highlight">最热的行星</span>！',
            '金星是夜空中除了月亮以外<span class="highlight">最亮的天体</span>，古人叫它<span class="highlight">"太白金星"</span>！'
        ],
        hanzi: [
            { char: '心', pinyin: 'xīn', words: '心脏 · 开心', sentence: '今天玩得好开心！', pictograph: 'drawHeart' },
            { char: '热', pinyin: 'rè', words: '炎热 · 热水', sentence: '夏天好热要吃西瓜！', pictograph: 'drawHot' }
        ],
        quiz: {
            question: '金星被叫做地球的什么？',
            options: [
                { text: '姐妹星', correct: true },
                { text: '兄弟星', correct: false },
                { text: '邻居星', correct: false }
            ],
            hint: '金星和地球大小差不多哦！'
        },
        math: [
            {
                type: 'choice',
                question: '金星和地球是姐妹，再加上火星3个好朋友，一共几个？',
                options: [
                    { text: '2个', correct: false },
                    { text: '3个', correct: true },
                    { text: '4个', correct: false }
                ],
                hint: '金星、地球、火星，数一数！'
            },
            {
                type: 'fillin',
                question: '金星有2个好朋友来做客，又来了3个，现在一共有几个好朋友？',
                answer: 5,
                hint: '2 + 3 = ?'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 3,
                right: 2,
                answer: '>',
                hint: '3比2大！金星比水星大哦！'
            }
        ]
    },
    {
        id: 2,
        title: '超级大气层',
        icon: '☁️',
        desc: '厚厚的云层包裹着',
        stories: [
            '金星被<span class="highlight">厚厚的云层</span>包裹着，从外面根本看不到表面！',
            '金星的大气层主要是<span class="highlight">二氧化碳</span>，产生了超强的<span class="highlight">温室效应</span>！',
            '大气压力是地球的<span class="highlight">90倍</span>！就像在<span class="highlight">900米深</span>的海底一样。'
        ],
        hanzi: [
            { char: '厚', pinyin: 'hòu', words: '厚薄 · 厚度', sentence: '冬天要穿厚厚的棉衣。', pictograph: 'drawThick' },
            { char: '薄', pinyin: 'báo', words: '薄薄 · 薄片', sentence: '薄薄的纸一撕就破。', pictograph: 'drawThin' }
        ],
        quiz: {
            question: '金星表面看不到是因为？',
            options: [
                { text: '太远了', correct: false },
                { text: '太暗了', correct: false },
                { text: '被厚厚的云层包裹着', correct: true }
            ],
            hint: '金星被什么东西包住了呢？'
        },
        math: [
            {
                type: 'choice',
                question: '金星有5层厚厚的云，地球有3层，金星多几层？',
                options: [
                    { text: '2层', correct: true },
                    { text: '3层', correct: false },
                    { text: '1层', correct: false }
                ],
                hint: '5 - 3 = ?'
            },
            {
                type: 'fillin',
                question: '金星的云层里有4朵黄云和3朵白云，一共有几朵云？',
                answer: 7,
                hint: '4 + 3 = ?'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 5,
                right: 3,
                answer: '>',
                hint: '5比3大！金星的云层比地球厚！'
            }
        ]
    },
    {
        id: 3,
        title: '最热的行星',
        icon: '🔥',
        desc: '表面温度465度！',
        stories: [
            '金星表面温度高达<span class="highlight">465度</span>！比水星还热，虽然水星离太阳更近！',
            '这是因为金星的<span class="highlight">温室效应太强</span>了，热量进去就出不来！',
            '<span class="highlight">铅和锡</span>到了金星上都会被融化成液体！'
        ],
        hanzi: [
            { char: '高', pinyin: 'gāo', words: '高大 · 高兴', sentence: '长颈鹿长得又高又大。', pictograph: 'drawTall' },
            { char: '低', pinyin: 'dī', words: '高低 · 低头', sentence: '小草低低的贴着地面。', pictograph: 'drawLow' }
        ],
        quiz: {
            question: '太阳系最热的行星是？',
            options: [
                { text: '水星', correct: false },
                { text: '金星', correct: true },
                { text: '火星', correct: false }
            ],
            hint: '温室效应最强的那颗！'
        },
        math: [
            {
                type: 'choice',
                question: '今天温度升高了3度，明天又升高了4度，一共升了几度？',
                options: [
                    { text: '6度', correct: false },
                    { text: '8度', correct: false },
                    { text: '7度', correct: true }
                ],
                hint: '3 + 4 = ?'
            },
            {
                type: 'fillin',
                question: '金星表面有9块熔岩石，被高温融化了3块，还剩几块？',
                answer: 6,
                hint: '9 - 3 = ?'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 4,
                right: 7,
                answer: '<',
                hint: '4比7小！金星温度比地球高很多倍！'
            }
        ]
    },
    {
        id: 4,
        title: '倒着转的行星',
        icon: '🔄',
        desc: '太阳从西边升起！',
        stories: [
            '金星是太阳系中唯一<span class="highlight">"倒着转"</span>的行星！',
            '在金星上，太阳是从<span class="highlight">西边升起</span>、<span class="highlight">东边落下</span>的，和地球完全相反！',
            '而且金星自转一圈要<span class="highlight">243天</span>，比它绕太阳一圈的<span class="highlight">225天</span>还长！'
        ],
        hanzi: [
            { char: '开', pinyin: 'kāi', words: '开门 · 打开', sentence: '开门迎接好朋友！', pictograph: 'drawOpen' },
            { char: '关', pinyin: 'guān', words: '关门 · 关闭', sentence: '睡觉前要关好门窗。', pictograph: 'drawClose' }
        ],
        quiz: {
            question: '金星上太阳从哪边升起？',
            options: [
                { text: '西边', correct: true },
                { text: '东边', correct: false },
                { text: '北边', correct: false }
            ],
            hint: '金星是"倒着转"的哦！'
        },
        math: [
            {
                type: 'choice',
                question: '金星转了2圈，地球转了8圈，地球多转了几圈？',
                options: [
                    { text: '5圈', correct: false },
                    { text: '6圈', correct: true },
                    { text: '7圈', correct: false }
                ],
                hint: '8 - 2 = ?'
            },
            {
                type: 'fillin',
                question: '金星上太阳从西边升起，小宇航员看了4次日出又看了2次日落，一共看了几次？',
                answer: 6,
                hint: '4 + 2 = ?'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 2,
                right: 8,
                answer: '<',
                hint: '2比8小！金星转得比地球慢很多！'
            }
        ]
    },
    {
        id: 5,
        title: '金星的表面',
        icon: '🌋',
        desc: '火山和熔岩平原',
        stories: [
            '科学家用<span class="highlight">雷达</span>穿过厚厚的云层，终于看到了金星的表面！',
            '金星上有很多<span class="highlight">火山</span>，有些可能现在还在喷发！',
            '金星表面有高山、峡谷和大片的<span class="highlight">熔岩平原</span>，像一个炼狱般的世界。'
        ],
        hanzi: [
            { char: '左', pinyin: 'zuǒ', words: '左边 · 左手', sentence: '左手和右手是好朋友！', pictograph: 'drawLeft' },
            { char: '右', pinyin: 'yòu', words: '右边 · 右手', sentence: '用右手写出漂亮的字。', pictograph: 'drawRight' }
        ],
        quiz: {
            question: '科学家用什么看到金星表面的？',
            options: [
                { text: '望远镜', correct: false },
                { text: '照相机', correct: false },
                { text: '雷达', correct: true }
            ],
            hint: '需要穿过厚厚的云层...'
        },
        math: [
            {
                type: 'choice',
                question: '金星上有3座大火山和4座小火山，一共几座？',
                options: [
                    { text: '7座', correct: true },
                    { text: '6座', correct: false },
                    { text: '8座', correct: false }
                ],
                hint: '3 + 4 = ?'
            },
            {
                type: 'fillin',
                question: '雷达拍了10张金星表面照片，有2张模糊了，清晰的有几张？',
                answer: 8,
                hint: '10 - 2 = ?'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 7,
                right: 7,
                answer: '=',
                hint: '7等于7！两边一样多！'
            }
        ]
    },
    {
        id: 6,
        title: '探索金星',
        icon: '🛰️',
        desc: '勇敢的探测器',
        stories: [
            '苏联的<span class="highlight">"金星号"</span>系列探测器多次降落在金星表面！',
            '但是因为金星<span class="highlight">太热太热</span>了，探测器最多只能坚持<span class="highlight">2个小时</span>就被烤坏了！',
            '科学家们正在设计新的探测器，希望能在金星上<span class="highlight">待更久</span>！'
        ],
        hanzi: [
            { char: '出', pinyin: 'chū', words: '出发 · 日出', sentence: '太阳从山后面出来了！', pictograph: 'drawOut' },
            { char: '入', pinyin: 'rù', words: '进入 · 出入', sentence: '秋天到了果实入仓了。', pictograph: 'drawIn' }
        ],
        quiz: {
            question: '探测器在金星上坚持不久是因为？',
            options: [
                { text: '没有电', correct: false },
                { text: '太热了被烤坏', correct: true },
                { text: '被风吹走了', correct: false }
            ],
            hint: '金星表面有多少度来着？'
        },
        math: [
            {
                type: 'choice',
                question: '探测器拍了5张照片，发回了3张，还剩几张没发？',
                options: [
                    { text: '1张', correct: false },
                    { text: '3张', correct: false },
                    { text: '2张', correct: true }
                ],
                hint: '5 - 3 = ?'
            },
            {
                type: 'fillin',
                question: '金星号探测器坚持了2个小时就坏了，如果新探测器能多坚持4个小时，一共能坚持几个小时？',
                answer: 6,
                hint: '2 + 4 = ?'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 5,
                right: 3,
                answer: '>',
                hint: '5比3大！拍的照片比发回的多！'
            }
        ]
    }
];

// ============ 象形图绘制函数 ============
const pictographDrawers = {
    drawHeart(ctx, w, h) {
        // 心 - 爱心形状
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        const cx = w / 2, cy = h / 2;
        ctx.moveTo(cx, cy + 25);
        ctx.bezierCurveTo(cx - 50, cy - 10, cx - 40, cy - 45, cx, cy - 20);
        ctx.bezierCurveTo(cx + 40, cy - 45, cx + 50, cy - 10, cx, cy + 25);
        ctx.fill();
        // 高光
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.ellipse(cx - 15, cy - 20, 8, 6, -0.5, 0, Math.PI * 2);
        ctx.fill();
    },
    drawHot(ctx, w, h) {
        // 热 - 火焰
        const cx = w / 2, cy = h / 2 + 10;
        // 外层大火焰
        ctx.fillStyle = '#E67E22';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 50);
        ctx.quadraticCurveTo(cx + 35, cy - 30, cx + 30, cy + 10);
        ctx.quadraticCurveTo(cx + 25, cy + 30, cx, cy + 35);
        ctx.quadraticCurveTo(cx - 25, cy + 30, cx - 30, cy + 10);
        ctx.quadraticCurveTo(cx - 35, cy - 30, cx, cy - 50);
        ctx.fill();
        // 内层火焰
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 30);
        ctx.quadraticCurveTo(cx + 18, cy - 15, cx + 15, cy + 5);
        ctx.quadraticCurveTo(cx + 10, cy + 20, cx, cy + 22);
        ctx.quadraticCurveTo(cx - 10, cy + 20, cx - 15, cy + 5);
        ctx.quadraticCurveTo(cx - 18, cy - 15, cx, cy - 30);
        ctx.fill();
        // 最内芯
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 5, 6, 10, 0, 0, Math.PI * 2);
        ctx.fill();
    },
    drawThick(ctx, w, h) {
        // 厚 - 多层叠加
        const colors = ['#8B6914', '#A07818', '#B8901E', '#D4A017', '#E8B830'];
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = colors[i];
            const y = 20 + i * 20;
            ctx.beginPath();
            ctx.roundRect(25, y, w - 50, 16, 4);
            ctx.fill();
        }
        // 标注箭头
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w - 18, 25);
        ctx.lineTo(w - 18, 115);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w - 23, 30);
        ctx.lineTo(w - 18, 20);
        ctx.lineTo(w - 13, 30);
        ctx.fill();
    },
    drawThin(ctx, w, h) {
        // 薄 - 一张薄纸
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(30, 30, w - 60, h - 60);
        ctx.strokeStyle = '#BDC3C7';
        ctx.lineWidth = 1;
        ctx.strokeRect(30, 30, w - 60, h - 60);
        // 纸的边角翻起
        ctx.fillStyle = '#95A5A6';
        ctx.beginPath();
        ctx.moveTo(w - 30, h - 30);
        ctx.lineTo(w - 50, h - 30);
        ctx.lineTo(w - 30, h - 50);
        ctx.closePath();
        ctx.fill();
        // 文字线
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(40, 50 + i * 18);
            ctx.lineTo(w - 45, 50 + i * 18);
            ctx.stroke();
        }
    },
    drawTall(ctx, w, h) {
        // 高 - 长颈鹿
        ctx.fillStyle = '#F4D03F';
        // 身体
        ctx.beginPath();
        ctx.ellipse(w / 2 + 5, h - 35, 22, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        // 脖子
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.moveTo(w / 2 - 5, h - 45);
        ctx.lineTo(w / 2 - 10, 35);
        ctx.lineTo(w / 2 + 5, 30);
        ctx.lineTo(w / 2 + 8, h - 42);
        ctx.closePath();
        ctx.fill();
        // 头
        ctx.beginPath();
        ctx.ellipse(w / 2 - 2, 28, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        // 斑点
        ctx.fillStyle = '#D4A017';
        ctx.beginPath(); ctx.arc(w / 2 - 2, h - 55, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(w / 2 + 2, h - 70, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(w / 2 - 5, h - 85, 3, 0, Math.PI * 2); ctx.fill();
        // 腿
        ctx.strokeStyle = '#F4D03F';
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(w / 2 - 12, h - 22); ctx.lineTo(w / 2 - 15, h - 5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w / 2 + 20, h - 22); ctx.lineTo(w / 2 + 22, h - 5); ctx.stroke();
        // 眼睛
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(w / 2 - 6, 26, 2, 0, Math.PI * 2); ctx.fill();
    },
    drawLow(ctx, w, h) {
        // 低 - 小草贴地
        // 地面
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(10, h - 30, w - 20, 25);
        // 小草
        ctx.strokeStyle = '#27AE60';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        for (let i = 0; i < 7; i++) {
            const x = 20 + i * 16;
            ctx.beginPath();
            ctx.moveTo(x, h - 30);
            ctx.quadraticCurveTo(x - 3, h - 42, x + 2, h - 48);
            ctx.stroke();
        }
        // 向下箭头标识低
        ctx.strokeStyle = '#5DADE2';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w / 2, 20);
        ctx.lineTo(w / 2, h - 55);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w / 2 - 8, h - 62);
        ctx.lineTo(w / 2, h - 50);
        ctx.lineTo(w / 2 + 8, h - 62);
        ctx.stroke();
    },
    drawOpen(ctx, w, h) {
        // 开 - 门打开
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(25, 20, 45, 100);
        ctx.fillRect(75, 20, 45, 100);
        // 左门（打开状态）
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.moveTo(25, 20);
        ctx.lineTo(45, 30);
        ctx.lineTo(45, 110);
        ctx.lineTo(25, 120);
        ctx.closePath();
        ctx.fill();
        // 右门（打开状态）
        ctx.beginPath();
        ctx.moveTo(120, 20);
        ctx.lineTo(100, 30);
        ctx.lineTo(100, 110);
        ctx.lineTo(120, 120);
        ctx.closePath();
        ctx.fill();
        // 中间光线
        const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, 40);
        grad.addColorStop(0, 'rgba(244,208,63,0.6)');
        grad.addColorStop(1, 'rgba(244,208,63,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(45, 30, 55, 80);
    },
    drawClose(ctx, w, h) {
        // 关 - 门关上
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(30, 20, 80, 100);
        // 门板
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(32, 22, 76, 96);
        // 分割线
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w / 2, 22);
        ctx.lineTo(w / 2, 118);
        ctx.stroke();
        // 门把手
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.arc(w / 2 - 10, 70, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(w / 2 + 10, 70, 4, 0, Math.PI * 2);
        ctx.fill();
        // 锁
        ctx.fillStyle = '#95A5A6';
        ctx.beginPath();
        ctx.arc(w / 2, 85, 6, 0, Math.PI * 2);
        ctx.fill();
    },
    drawLeft(ctx, w, h) {
        // 左 - 左手
        ctx.fillStyle = '#FDBCB4';
        // 手掌
        ctx.beginPath();
        ctx.ellipse(w / 2 + 10, h / 2 + 15, 28, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        // 手指
        const fingers = [
            { x: w / 2 - 15, y: h / 2 - 25, a: -0.3 },
            { x: w / 2 - 5, y: h / 2 - 32, a: -0.1 },
            { x: w / 2 + 8, y: h / 2 - 34, a: 0.1 },
            { x: w / 2 + 20, y: h / 2 - 28, a: 0.3 }
        ];
        fingers.forEach(f => {
            ctx.beginPath();
            ctx.ellipse(f.x, f.y, 7, 18, f.a, 0, Math.PI * 2);
            ctx.fill();
        });
        // 大拇指
        ctx.beginPath();
        ctx.ellipse(w / 2 + 38, h / 2 + 5, 8, 16, 0.8, 0, Math.PI * 2);
        ctx.fill();
        // "左"字标注
        ctx.fillStyle = '#E74C3C';
        ctx.font = 'bold 16px Noto Sans SC';
        ctx.textAlign = 'center';
        ctx.fillText('左', 25, 25);
        // 左箭头
        ctx.strokeStyle = '#E74C3C';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(45, 20);
        ctx.lineTo(20, 20);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(28, 14);
        ctx.lineTo(20, 20);
        ctx.lineTo(28, 26);
        ctx.stroke();
    },
    drawRight(ctx, w, h) {
        // 右 - 右手
        ctx.fillStyle = '#FDBCB4';
        // 手掌
        ctx.beginPath();
        ctx.ellipse(w / 2 - 10, h / 2 + 15, 28, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        // 手指
        const fingers = [
            { x: w / 2 - 20, y: h / 2 - 28, a: -0.3 },
            { x: w / 2 - 8, y: h / 2 - 34, a: -0.1 },
            { x: w / 2 + 5, y: h / 2 - 32, a: 0.1 },
            { x: w / 2 + 15, y: h / 2 - 25, a: 0.3 }
        ];
        fingers.forEach(f => {
            ctx.beginPath();
            ctx.ellipse(f.x, f.y, 7, 18, f.a, 0, Math.PI * 2);
            ctx.fill();
        });
        // 大拇指
        ctx.beginPath();
        ctx.ellipse(w / 2 - 38, h / 2 + 5, 8, 16, -0.8, 0, Math.PI * 2);
        ctx.fill();
        // "右"字标注
        ctx.fillStyle = '#3498DB';
        ctx.font = 'bold 16px Noto Sans SC';
        ctx.textAlign = 'center';
        ctx.fillText('右', w - 25, 25);
        // 右箭头
        ctx.strokeStyle = '#3498DB';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(w - 45, 20);
        ctx.lineTo(w - 20, 20);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w - 28, 14);
        ctx.lineTo(w - 20, 20);
        ctx.lineTo(w - 28, 26);
        ctx.stroke();
    },
    drawOut(ctx, w, h) {
        // 出 - 太阳从山后出来
        // 山
        ctx.fillStyle = '#27AE60';
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(w / 2, h / 2 + 10);
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
        // 太阳升起
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2 + 5, 22, Math.PI, 0);
        ctx.fill();
        // 光芒
        ctx.strokeStyle = '#F4D03F';
        ctx.lineWidth = 2;
        for (let i = 0; i < 7; i++) {
            const angle = Math.PI + (i * Math.PI / 6) - Math.PI / 12;
            ctx.beginPath();
            ctx.moveTo(w / 2 + Math.cos(angle) * 26, h / 2 + 5 + Math.sin(angle) * 26);
            ctx.lineTo(w / 2 + Math.cos(angle) * 36, h / 2 + 5 + Math.sin(angle) * 36);
            ctx.stroke();
        }
        // 向上箭头
        ctx.strokeStyle = '#E74C3C';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2 - 5);
        ctx.lineTo(w / 2, 15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w / 2 - 8, 23);
        ctx.lineTo(w / 2, 12);
        ctx.lineTo(w / 2 + 8, 23);
        ctx.stroke();
    },
    drawIn(ctx, w, h) {
        // 入 - 果实入仓
        // 仓房
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(25, 40, 90, 80);
        // 屋顶
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.moveTo(15, 45);
        ctx.lineTo(w / 2, 15);
        ctx.lineTo(w - 15, 45);
        ctx.closePath();
        ctx.fill();
        // 门洞
        ctx.fillStyle = '#4A2A0A';
        ctx.beginPath();
        ctx.arc(w / 2, 120, 20, Math.PI, 0);
        ctx.lineTo(w / 2 + 20, 120);
        ctx.lineTo(w / 2 - 20, 120);
        ctx.fill();
        // 果实
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath(); ctx.arc(w / 2 - 8, 105, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#F39C12';
        ctx.beginPath(); ctx.arc(w / 2 + 6, 108, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath(); ctx.arc(w / 2, 112, 4, 0, Math.PI * 2); ctx.fill();
        // 向下箭头
        ctx.strokeStyle = '#27AE60';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w / 2, 52);
        ctx.lineTo(w / 2, 85);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w / 2 - 6, 78);
        ctx.lineTo(w / 2, 88);
        ctx.lineTo(w / 2 + 6, 78);
        ctx.stroke();
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
const venusAudio = {
    correct: 'audio/venus/correct.mp3',
    finalBadge: 'audio/venus/final-badge.mp3',
    story: (chId, idx) => `audio/venus/ch${chId}-story-${idx}.mp3`,
    hanzi: (chId, idx) => `audio/venus/ch${chId}-hanzi-${idx}.mp3`,
    quiz: (chId) => `audio/venus/ch${chId}-quiz.mp3`,
    quizOption: (chId, optIdx) => `audio/venus/ch${chId}-quiz-${['a','b','c'][optIdx]}.mp3`,
    quizHint: (chId) => `audio/venus/ch${chId}-quiz-hint.mp3`,
    math: (chId, qIdx) => qIdx > 0 ? `audio/venus/ch${chId}-math-${qIdx + 1}.mp3` : `audio/venus/ch${chId}-math.mp3`,
    mathHint: (chId, qIdx) => qIdx > 0 ? `audio/venus/ch${chId}-math-${qIdx + 1}-hint.mp3` : `audio/venus/ch${chId}-math-hint.mp3`,
    complete: (chId) => `audio/venus/ch${chId}-complete.mp3`
};

// ============ 存档 ============
function saveProgress() {
    localStorage.setItem('venusExplorer', JSON.stringify({
        completedChapters: gameState.completedChapters
    }));
}

function loadProgress() {
    try {
        const data = JSON.parse(localStorage.getItem('venusExplorer'));
        if (data && data.completedChapters) {
            gameState.completedChapters = data.completedChapters;
        }
    } catch (e) { }
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
    createVenus();
    createEarthReference();
    addLights();

    window.addEventListener('resize', onWindowResize);

    // 纹理加载检测
    const checkLoaded = setInterval(() => {
        if (venusMesh && venusMesh.material && venusMesh.material.uniforms &&
            venusMesh.material.uniforms.planetTexture.value.image) {
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

// ============ 创建金星 ============
function createVenus() {
    const geometry = new THREE.SphereGeometry(6, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const venusMap = textureLoader.load('textures/venus_atmosphere.jpg');

    const venusMaterial = new THREE.ShaderMaterial({
        uniforms: {
            planetTexture: { value: venusMap },
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
                // 提亮纹理，金星偏暖色
                surfaceColor *= 1.2;

                // 光照
                vec3 lightDir = normalize(sunDirection);
                float diff = max(dot(vNormal, lightDir), 0.0);
                float ambient = 0.15;
                surfaceColor *= (diff * 0.8 + ambient);

                // 强黄色 Fresnel 大气散射（金星大气层很厚，强度0.3）
                vec3 viewDir = normalize(cameraPosition - vWorldPos);
                float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
                vec3 atmosphereColor = vec3(0.95, 0.75, 0.2); // 黄色大气
                surfaceColor += atmosphereColor * fresnel * 0.3;

                gl_FragColor = vec4(surfaceColor, 1.0);
            }
        `
    });

    venusMesh = new THREE.Mesh(geometry, venusMaterial);
    scene.add(venusMesh);

    // 大气层光晕（外层发光球体）
    const glowGeometry = new THREE.SphereGeometry(6.4, 64, 64);
    const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            sunDirection: { value: new THREE.Vector3(1, 0.3, 0.5).normalize() }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vWorldPos;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 sunDirection;
            varying vec3 vNormal;
            varying vec3 vWorldPos;
            void main() {
                vec3 viewDir = normalize(cameraPosition - vWorldPos);
                float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 4.0);
                float lightFacing = max(dot(vNormal, normalize(sunDirection)), 0.0) * 0.5 + 0.5;
                vec3 glowColor = vec3(0.95, 0.78, 0.2);
                float alpha = fresnel * 0.35 * lightFacing;
                gl_FragColor = vec4(glowColor, alpha);
            }
        `,
        transparent: true,
        side: THREE.FrontSide,
        depthWrite: false
    });

    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);
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

// ============ 创建远处小地球 ============
function createEarthReference() {
    const geometry = new THREE.SphereGeometry(1.8, 32, 32);
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load('textures/earth_daymap.jpg');

    const material = new THREE.MeshPhongMaterial({
        map: earthMap,
        shininess: 25
    });

    earthRef = new THREE.Mesh(geometry, material);
    earthRef.position.set(35, 12, -25);
    scene.add(earthRef);
}

// ============ 灯光 ============
function addLights() {
    const sunLight = new THREE.DirectionalLight(0xfff8e0, 1.3);
    sunLight.position.set(50, 20, 30);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x332211, 0.3);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0xaa8844, 0.3);
    rimLight.position.set(-30, -10, -20);
    scene.add(rimLight);
}

// ============ 动画循环 ============
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    // 金星缓慢逆向自转（金星自转方向和其他行星相反！）
    if (venusMesh) {
        venusMesh.rotation.y -= delta * 0.03; // 负号表示逆向
        if (venusMesh.material.uniforms) {
            venusMesh.material.uniforms.time.value = elapsed;
        }
    }

    // 地球参照缓慢自转
    if (earthRef) {
        earthRef.rotation.y += delta * 0.1;
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
        // 姐妹星 - 能看到远处地球
        animateCameraTo({ x: -8, y: 8, z: 18 }, { x: 0, y: 0, z: 0 });
    },
    2: () => {
        // 大气层 - 侧面看大气光晕
        animateCameraTo({ x: 14, y: 4, z: 14 }, { x: 0, y: 0, z: 0 });
    },
    3: () => {
        // 最热 - 正面近景
        animateCameraTo({ x: 0, y: 2, z: 15 }, { x: 0, y: 0, z: 0 });
    },
    4: () => {
        // 倒着转 - 侧面观察自转
        animateCameraTo({ x: 12, y: 0, z: 16 }, { x: 0, y: 0, z: 0 });
    },
    5: () => {
        // 表面 - 推近
        animateCameraTo({ x: -3, y: -1, z: 13 }, { x: -1, y: -1, z: 0 });
    },
    6: () => {
        // 探索 - 远景全貌
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
    playAudio(venusAudio.story(ch.id, storyIndex + 1), plainText);

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
    playAudio(venusAudio.hanzi(ch.id, hanziIndex + 1), hanziText);

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
    playAudio(venusAudio.quiz(ch.id), fullText);

    const optionsDiv = document.getElementById('quizOptions');
    optionsDiv.innerHTML = '';

    ch.quiz.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        const safeText = opt.text.replace(/'/g, "\\'");
        btn.innerHTML = `<span class="opt-label">${labels[i]}</span><span class="opt-text">${opt.text}</span><span class="opt-sound" onclick="event.stopPropagation(); playAudio(venusAudio.quizOption(${ch.id}, ${i}), '${labels[i]}，${safeText}')">&#128264;</span>`;
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

    const audioPath = venusAudio.math(ch.id, qIdx);

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
        playAudio(venusAudio.correct, '太棒了！回答正确！');

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
        const hintAudioPath = type === 'math' ? venusAudio.mathHint(chId, gameState.mathQuestionIndex) : venusAudio.quizHint(chId);
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
    playAudio(venusAudio.complete(chId), `太厉害了！第${chId}章，${ch.title}，探险成功！你获得了一颗星星！`);

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
    playAudio(venusAudio.finalBadge, '恭喜智天！你完成了全部6个章节的金星探险！你获得了金星探险家大徽章！');
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
