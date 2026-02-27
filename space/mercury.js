/**
 * 水星探险家 - 柳智天的宇宙课堂
 * 6大章节闯关：科普故事 → 汉字学习 → 知识测验 → 数学挑战 → 获得星星
 */

// ============ 全局变量 ============
let scene, camera, renderer, controls;
let mercuryMesh, sunRef, starField;
let clock;

// ============ 章节数据 ============
const chaptersData = [
    {
        id: 1,
        title: '离太阳最近',
        icon: '☀️',
        desc: '太阳系最内侧的行星',
        stories: [
            '水星是离太阳<span class="highlight">最近</span>的行星，太阳在水星上看起来比在地球上<span class="highlight">大3倍</span>！',
            '水星绕太阳一圈只要<span class="highlight">88天</span>，是太阳系中<span class="highlight">"跑"得最快</span>的行星',
            '水星的名字在英文里叫<span class="highlight">Mercury</span>，就是罗马神话中跑得最快的<span class="highlight">信使之神</span>'
        ],
        hanzi: [
            { char: '快', pinyin: 'kuài', words: '快速 · 快乐', sentence: '小兔子跑得真快', pictograph: 'drawFast' },
            { char: '慢', pinyin: 'màn', words: '慢慢 · 缓慢', sentence: '小乌龟慢慢地爬', pictograph: 'drawSlow' }
        ],
        quiz: {
            question: '离太阳最近的行星是？',
            options: [
                { text: '水星', correct: true },
                { text: '金星', correct: false },
                { text: '地球', correct: false }
            ],
            hint: '它是太阳系中跑得最快的行星哦！'
        },
        math: [
            {
                type: 'choice',
                question: '水星跑了3圈，又跑了4圈，一共跑了几圈？',
                options: [
                    { text: '6 圈', correct: false },
                    { text: '7 圈', correct: true },
                    { text: '8 圈', correct: false }
                ],
                hint: '3 + 4 = ?'
            },
            {
                type: 'fillin',
                question: '水星绕太阳跑了9圈，地球才跑了1圈，水星多跑了几圈？',
                answer: 8,
                hint: '9 - 1 = ?'
            },
            {
                type: 'compare',
                question: '比一比，水星绕太阳的速度和地球的速度：',
                left: 9,
                right: 3,
                answer: '>',
                hint: '9比3大！水星跑得比地球快多了！'
            }
        ]
    },
    {
        id: 2,
        title: '极端温差',
        icon: '🌡️',
        desc: '白天430度，晚上零下180度',
        stories: [
            '水星白天超级热，温度能到<span class="highlight">430度</span>！',
            '但是到了晚上，温度会降到<span class="highlight">零下180度</span>！',
            '这是因为水星几乎<span class="highlight">没有大气层</span>保护，热量一下子就跑光了'
        ],
        hanzi: [
            { char: '早', pinyin: 'zǎo', words: '早上 · 早安', sentence: '早上起床要说早安', pictograph: 'drawMorning' },
            { char: '晚', pinyin: 'wǎn', words: '晚上 · 晚安', sentence: '晚上月亮出来了', pictograph: 'drawNight' }
        ],
        quiz: {
            question: '水星温差大是因为？',
            options: [
                { text: '离太阳太远', correct: false },
                { text: '有水', correct: false },
                { text: '几乎没有大气层', correct: true }
            ],
            hint: '没有大气层保护，热量就留不住...'
        },
        math: [
            {
                type: 'choice',
                question: '白天热了5度，晚上又冷了3度，温度变化了几度？',
                options: [
                    { text: '8 度', correct: true },
                    { text: '7 度', correct: false },
                    { text: '2 度', correct: false }
                ],
                hint: '5 + 3 = ?'
            },
            {
                type: 'fillin',
                question: '水星白天很热晚上很冷！温度计白天升了6格，晚上降了4格，还剩几格？',
                answer: 2,
                hint: '6 - 4 = ?'
            },
            {
                type: 'compare',
                question: '比一比，水星白天温度和晚上温度（用数字代替）：',
                left: 10,
                right: 0,
                answer: '>',
                hint: '10比0大！水星白天比晚上热得多！'
            }
        ]
    },
    {
        id: 3,
        title: '水星表面',
        icon: '🪨',
        desc: '坑坑洼洼像月球',
        stories: [
            '水星的表面和月球很像，<span class="highlight">坑坑洼洼</span>的全是陨石坑',
            '最大的陨石坑叫<span class="highlight">"卡洛里盆地"</span>，直径有<span class="highlight">1500公里</span>',
            '水星看起来<span class="highlight">灰灰的</span>，因为表面都是岩石和尘土'
        ],
        hanzi: [
            { char: '黑', pinyin: 'hēi', words: '黑色 · 黑夜', sentence: '黑夜里有亮亮的星星', pictograph: 'drawBlack' },
            { char: '白', pinyin: 'bái', words: '白色 · 雪白', sentence: '白白的云朵飘在天上', pictograph: 'drawWhite' }
        ],
        quiz: {
            question: '水星的表面和什么很像？',
            options: [
                { text: '地球', correct: false },
                { text: '月球', correct: true },
                { text: '木星', correct: false }
            ],
            hint: '想一想哪个天体也有很多陨石坑...'
        },
        math: [
            {
                type: 'choice',
                question: '水星上有4个大陨石坑和5个小坑，一共几个？',
                options: [
                    { text: '8 个', correct: false },
                    { text: '10 个', correct: false },
                    { text: '9 个', correct: true }
                ],
                hint: '4 + 5 = ?'
            },
            {
                type: 'fillin',
                question: '水星表面有10个陨石坑，探测器拍了7个，还有几个没拍到？',
                answer: 3,
                hint: '10 - 7 = ?'
            },
            {
                type: 'compare',
                question: '比一比，大陨石坑的数量和小陨石坑的数量：',
                left: 4,
                right: 5,
                answer: '<',
                hint: '4比5小！小陨石坑比大陨石坑多！'
            }
        ]
    },
    {
        id: 4,
        title: '水星的一天',
        icon: '⏰',
        desc: '一天比一年还长！',
        stories: [
            '水星自转一圈要<span class="highlight">59个地球日</span>！',
            '但是水星的一个"太阳日"（从日出到下一次日出）要<span class="highlight">176个地球日</span>！',
            '也就是说水星上的<span class="highlight">一天比一年</span>（88天绕太阳一圈）<span class="highlight">还要长</span>！'
        ],
        hanzi: [
            { char: '长', pinyin: 'cháng', words: '长短 · 长大', sentence: '长颈鹿的脖子长长的', pictograph: 'drawLong' },
            { char: '短', pinyin: 'duǎn', words: '短小 · 长短', sentence: '铅笔用短了要换新的', pictograph: 'drawShort' }
        ],
        quiz: {
            question: '水星的一天和一年比，哪个长？',
            options: [
                { text: '一天比一年长', correct: true },
                { text: '一年比一天长', correct: false },
                { text: '一样长', correct: false }
            ],
            hint: '水星的太阳日有176天，而一年只有88天...'
        },
        math: [
            {
                type: 'choice',
                question: '水星转了2圈太阳，地球转了6圈，地球多转了几圈？',
                options: [
                    { text: '3 圈', correct: false },
                    { text: '4 圈', correct: true },
                    { text: '5 圈', correct: false }
                ],
                hint: '6 - 2 = ?'
            },
            {
                type: 'fillin',
                question: '水星的一天有176个地球日，一年有88天。176比88多多少？先算：9-1=?',
                answer: 8,
                hint: '9 - 1 = ?'
            },
            {
                type: 'compare',
                question: '比一比，水星的一天和一年谁更长？（用数字代替）',
                left: 7,
                right: 4,
                answer: '>',
                hint: '7比4大！水星的一天比一年还长！'
            }
        ]
    },
    {
        id: 5,
        title: '没有月亮',
        icon: '🔭',
        desc: '孤独的小行星',
        stories: [
            '水星<span class="highlight">没有卫星</span>！它是太阳系中除了金星以外唯一没有月亮的行星',
            '水星也没有光环，是一颗<span class="highlight">"孤独"的小行星</span>',
            '但是水星有一个很大的<span class="highlight">铁核</span>，占了它体积的大部分'
        ],
        hanzi: [
            { char: '多', pinyin: 'duō', words: '多少 · 很多', sentence: '花园里有很多漂亮的花', pictograph: 'drawMany' },
            { char: '少', pinyin: 'shǎo', words: '多少 · 少数', sentence: '今天作业很少真开心', pictograph: 'drawFew' }
        ],
        quiz: {
            question: '水星有几颗卫星？',
            options: [
                { text: '1 颗', correct: false },
                { text: '2 颗', correct: false },
                { text: '0 颗，没有卫星', correct: true }
            ],
            hint: '水星是一颗"孤独"的行星哦...'
        },
        math: [
            {
                type: 'choice',
                question: '地球有1颗月亮，火星有2颗，水星有0颗，一共几颗？',
                options: [
                    { text: '3 颗', correct: true },
                    { text: '2 颗', correct: false },
                    { text: '4 颗', correct: false }
                ],
                hint: '1 + 2 + 0 = ?'
            },
            {
                type: 'fillin',
                question: '水星没有卫星好孤独！木星有5颗大卫星，比水星多几颗？',
                answer: 5,
                hint: '5 - 0 = ?'
            },
            {
                type: 'compare',
                question: '比一比，地球的卫星数量和水星的卫星数量：',
                left: 1,
                right: 0,
                answer: '>',
                hint: '1比0大！地球有月亮，水星没有！'
            }
        ]
    },
    {
        id: 6,
        title: '探索水星',
        icon: '🛰️',
        desc: '信使号和贝皮科伦坡号',
        stories: [
            '探索水星很难，因为它<span class="highlight">离太阳太近</span>了',
            '美国的<span class="highlight">"信使号"</span>探测器花了好多年才到达水星，围着它转了<span class="highlight">4年</span>',
            '现在欧洲和日本的<span class="highlight">"贝皮科伦坡号"</span>正在飞往水星的路上'
        ],
        hanzi: [
            { char: '前', pinyin: 'qián', words: '前面 · 前进', sentence: '勇敢地向前走', pictograph: 'drawForward' },
            { char: '后', pinyin: 'hòu', words: '后面 · 以后', sentence: '小猫躲在椅子后面', pictograph: 'drawBehind' }
        ],
        quiz: {
            question: '第一个围绕水星飞行的探测器叫？',
            options: [
                { text: '好奇号', correct: false },
                { text: '信使号', correct: true },
                { text: '旅行者号', correct: false }
            ],
            hint: '它的名字和水星的英文名Mercury有关...'
        },
        math: [
            {
                type: 'choice',
                question: '信使号拍了6张照片，传回了4张，还没传回几张？',
                options: [
                    { text: '1 张', correct: false },
                    { text: '3 张', correct: false },
                    { text: '2 张', correct: true }
                ],
                hint: '6 - 4 = ?'
            },
            {
                type: 'fillin',
                question: '探测器飞向水星要经过3个行星轨道，再经过2个小行星带，一共经过几个？',
                answer: 5,
                hint: '3 + 2 = ?'
            },
            {
                type: 'compare',
                question: '比一比，信使号拍的照片和传回的照片数量：',
                left: 6,
                right: 4,
                answer: '>',
                hint: '6比4大！拍的比传回来的多！'
            }
        ]
    }
];

// ============ 象形图绘制函数 ============
const pictographDrawers = {
    drawFast(ctx, w, h) {
        // 快 - 奔跑的小兔子
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath(); ctx.ellipse(w/2+5, h/2, 22, 16, 0, 0, Math.PI*2); ctx.fill();
        // 头
        ctx.beginPath(); ctx.arc(w/2+25, h/2-10, 12, 0, Math.PI*2); ctx.fill();
        // 耳朵
        ctx.fillStyle = '#E67E22';
        ctx.beginPath(); ctx.ellipse(w/2+20, h/2-28, 4, 12, -0.3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(w/2+30, h/2-26, 4, 12, 0.3, 0, Math.PI*2); ctx.fill();
        // 眼
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(w/2+28, h/2-12, 2, 0, Math.PI*2); ctx.fill();
        // 腿（奔跑姿势）
        ctx.strokeStyle = '#F4D03F'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(w/2-10, h/2+10); ctx.lineTo(w/2-25, h/2+25); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2+15, h/2+10); ctx.lineTo(w/2+30, h/2+25); ctx.stroke();
        // 速度线
        ctx.strokeStyle = '#5DADE2'; ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            const y = h/2 - 10 + i * 12;
            ctx.beginPath(); ctx.moveTo(15, y); ctx.lineTo(35, y); ctx.stroke();
        }
    },
    drawSlow(ctx, w, h) {
        // 慢 - 小乌龟
        ctx.fillStyle = '#27AE60';
        ctx.beginPath(); ctx.ellipse(w/2, h/2+5, 28, 18, 0, Math.PI, 0); ctx.fill();
        // 壳花纹
        ctx.strokeStyle = '#1E8449'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(w/2, h/2-5, 12, Math.PI, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2, h/2-17); ctx.lineTo(w/2, h/2+5); ctx.stroke();
        // 头
        ctx.fillStyle = '#58D68D';
        ctx.beginPath(); ctx.arc(w/2+28, h/2+8, 8, 0, Math.PI*2); ctx.fill();
        // 眼
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(w/2+31, h/2+6, 2, 0, Math.PI*2); ctx.fill();
        // 腿
        ctx.fillStyle = '#58D68D';
        ctx.fillRect(w/2-18, h/2+5, 6, 12);
        ctx.fillRect(w/2+10, h/2+5, 6, 12);
        // 底部线
        ctx.strokeStyle = '#8B6914'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(15, h/2+20); ctx.lineTo(w-15, h/2+20); ctx.stroke();
    },
    drawMorning(ctx, w, h) {
        // 早 - 太阳升起
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#87CEEB'); grad.addColorStop(1, '#FFF3E0');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
        // 地平线
        ctx.fillStyle = '#27AE60';
        ctx.fillRect(0, h*0.7, w, h*0.3);
        // 太阳
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath(); ctx.arc(w/2, h*0.55, 20, 0, Math.PI*2); ctx.fill();
        // 光芒
        ctx.strokeStyle = '#FFD93D'; ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = i * Math.PI / 4;
            ctx.beginPath();
            ctx.moveTo(w/2 + Math.cos(angle)*25, h*0.55 + Math.sin(angle)*25);
            ctx.lineTo(w/2 + Math.cos(angle)*35, h*0.55 + Math.sin(angle)*35);
            ctx.stroke();
        }
    },
    drawNight(ctx, w, h) {
        // 晚 - 月亮和星星
        ctx.fillStyle = '#1a1a40'; ctx.fillRect(0, 0, w, h);
        // 月亮
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath(); ctx.arc(w/2+15, 35, 20, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#1a1a40';
        ctx.beginPath(); ctx.arc(w/2+25, 28, 16, 0, Math.PI*2); ctx.fill();
        // 星星
        ctx.fillStyle = '#FFF';
        [[25,25],[50,50],[90,20],[110,55],[35,80],[85,75]].forEach(([x,y]) => {
            ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI*2); ctx.fill();
        });
        // 房子
        ctx.fillStyle = '#5D4E37';
        ctx.fillRect(w/2-20, h-45, 40, 30);
        ctx.fillStyle = '#F4D03F';
        ctx.fillRect(w/2-8, h-35, 10, 10);
        // 屋顶
        ctx.fillStyle = '#8B4513';
        ctx.beginPath(); ctx.moveTo(w/2-25, h-45); ctx.lineTo(w/2, h-65); ctx.lineTo(w/2+25, h-45); ctx.closePath(); ctx.fill();
        // 地面
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(0, h-15, w, 15);
    },
    drawBlack(ctx, w, h) {
        // 黑 - 黑夜星空
        ctx.fillStyle = '#0a0a20'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#FFF';
        const stars = [[20,20],[45,35],[80,15],[110,40],[30,65],[70,55],[100,75],[55,95],[25,105],[90,100]];
        stars.forEach(([x,y]) => {
            const size = 1 + Math.random() * 2;
            ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI*2); ctx.fill();
        });
        // 大星星
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI / 5) - Math.PI/2;
            const x = w/2 + Math.cos(angle) * 18;
            const y = h/2 + Math.sin(angle) * 18;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.fill();
    },
    drawWhite(ctx, w, h) {
        // 白 - 白云蓝天
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#87CEEB'); grad.addColorStop(1, '#B3E5FC');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
        // 白云
        ctx.fillStyle = '#FFF';
        // 云1
        ctx.beginPath(); ctx.arc(45, 45, 18, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(65, 40, 22, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(85, 48, 16, 0, Math.PI*2); ctx.fill();
        // 云2
        ctx.beginPath(); ctx.arc(70, 90, 15, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(90, 85, 20, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(105, 92, 14, 0, Math.PI*2); ctx.fill();
    },
    drawLong(ctx, w, h) {
        // 长 - 长颈鹿
        ctx.fillStyle = '#F39C12';
        // 身体
        ctx.beginPath(); ctx.ellipse(w/2+10, h-35, 20, 12, 0, 0, Math.PI*2); ctx.fill();
        // 长脖子
        ctx.fillRect(w/2+5, h-90, 12, 55);
        // 头
        ctx.beginPath(); ctx.ellipse(w/2+11, h-95, 10, 8, 0, 0, Math.PI*2); ctx.fill();
        // 斑点
        ctx.fillStyle = '#D35400';
        ctx.beginPath(); ctx.arc(w/2+8, h-70, 3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w/2+14, h-60, 3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w/2+9, h-50, 3, 0, Math.PI*2); ctx.fill();
        // 眼
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(w/2+15, h-97, 2, 0, Math.PI*2); ctx.fill();
        // 腿
        ctx.strokeStyle = '#F39C12'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(w/2, h-25); ctx.lineTo(w/2-5, h-10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2+20, h-25); ctx.lineTo(w/2+25, h-10); ctx.stroke();
        // 角
        ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(w/2+8, h-103); ctx.lineTo(w/2+5, h-112); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2+14, h-103); ctx.lineTo(w/2+17, h-112); ctx.stroke();
        ctx.fillStyle = '#F39C12';
        ctx.beginPath(); ctx.arc(w/2+5, h-113, 3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w/2+17, h-113, 3, 0, Math.PI*2); ctx.fill();
    },
    drawShort(ctx, w, h) {
        // 短 - 短铅笔
        ctx.fillStyle = '#F4D03F';
        ctx.fillRect(w/2-8, h/2-15, 16, 35);
        // 铅笔头
        ctx.fillStyle = '#E67E22';
        ctx.beginPath();
        ctx.moveTo(w/2-8, h/2+20); ctx.lineTo(w/2, h/2+35); ctx.lineTo(w/2+8, h/2+20);
        ctx.closePath(); ctx.fill();
        // 笔尖
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(w/2-3, h/2+28); ctx.lineTo(w/2, h/2+35); ctx.lineTo(w/2+3, h/2+28);
        ctx.closePath(); ctx.fill();
        // 橡皮头
        ctx.fillStyle = '#E74C3C';
        ctx.fillRect(w/2-8, h/2-20, 16, 6);
        // 金属箍
        ctx.fillStyle = '#BDC3C7';
        ctx.fillRect(w/2-9, h/2-15, 18, 4);
        // 文字标注"短"
        ctx.fillStyle = '#999';
        ctx.font = '12px Noto Sans SC';
        ctx.textAlign = 'center';
        ctx.fillText('← 短 →', w/2, h/2-30);
    },
    drawMany(ctx, w, h) {
        // 多 - 很多花朵
        const colors = ['#E74C3C', '#F39C12', '#9B59B6', '#3498DB', '#2ECC71', '#E91E63', '#FF9800'];
        for (let i = 0; i < 7; i++) {
            const cx = 20 + (i % 4) * 30;
            const cy = 25 + Math.floor(i / 4) * 45;
            ctx.fillStyle = colors[i];
            for (let p = 0; p < 5; p++) {
                const angle = p * Math.PI * 2 / 5;
                ctx.beginPath();
                ctx.arc(cx + Math.cos(angle)*8, cy + Math.sin(angle)*8, 5, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.fillStyle = '#F4D03F';
            ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI*2); ctx.fill();
            // 茎
            ctx.strokeStyle = '#27AE60'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(cx, cy+10); ctx.lineTo(cx, cy+25); ctx.stroke();
        }
    },
    drawFew(ctx, w, h) {
        // 少 - 只有一朵小花
        ctx.fillStyle = '#E8E8E8'; ctx.fillRect(0, 0, w, h);
        // 一朵花
        const cx = w/2, cy = h/2 - 10;
        ctx.fillStyle = '#E74C3C';
        for (let p = 0; p < 5; p++) {
            const angle = p * Math.PI * 2 / 5 - Math.PI/2;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(angle)*10, cy + Math.sin(angle)*10, 7, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI*2); ctx.fill();
        // 茎
        ctx.strokeStyle = '#27AE60'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx, cy+12); ctx.lineTo(cx, cy+40); ctx.stroke();
        // 叶子
        ctx.fillStyle = '#27AE60';
        ctx.beginPath(); ctx.ellipse(cx+12, cy+28, 8, 4, 0.5, 0, Math.PI*2); ctx.fill();
    },
    drawForward(ctx, w, h) {
        // 前 - 向前走的小人+箭头
        ctx.fillStyle = '#3498DB';
        ctx.beginPath(); ctx.arc(w/2, 30, 12, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#3498DB'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(w/2, 42); ctx.lineTo(w/2, 78); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2-18, 58); ctx.lineTo(w/2, 50); ctx.lineTo(w/2+18, 58); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2, 78); ctx.lineTo(w/2-12, 105); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2, 78); ctx.lineTo(w/2+12, 105); ctx.stroke();
        // 前进箭头
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.moveTo(w/2+35, 60); ctx.lineTo(w/2+55, 70); ctx.lineTo(w/2+35, 80);
        ctx.closePath(); ctx.fill();
        ctx.fillRect(w/2+20, 65, 16, 10);
    },
    drawBehind(ctx, w, h) {
        // 后 - 小猫躲在椅子后面
        // 椅子
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(w/2-15, h/2-20, 6, 50);
        ctx.fillRect(w/2+15, h/2+5, 6, 25);
        ctx.fillRect(w/2-15, h/2+5, 36, 5);
        ctx.fillRect(w/2-15, h/2-20, 36, 5);
        // 小猫露出半个头
        ctx.fillStyle = '#F39C12';
        ctx.beginPath(); ctx.arc(w/2+30, h/2-5, 12, 0, Math.PI*2); ctx.fill();
        // 耳朵
        ctx.beginPath(); ctx.moveTo(w/2+23, h/2-14); ctx.lineTo(w/2+20, h/2-25); ctx.lineTo(w/2+28, h/2-17); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(w/2+33, h/2-14); ctx.lineTo(w/2+40, h/2-25); ctx.lineTo(w/2+37, h/2-17); ctx.closePath(); ctx.fill();
        // 眼睛
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(w/2+27, h/2-6, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w/2+34, h/2-6, 2, 0, Math.PI*2); ctx.fill();
        // 胡须
        ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(w/2+22, h/2); ctx.lineTo(w/2+15, h/2-2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2+22, h/2+2); ctx.lineTo(w/2+15, h/2+3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2+38, h/2); ctx.lineTo(w/2+48, h/2-2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2+38, h/2+2); ctx.lineTo(w/2+48, h/2+3); ctx.stroke();
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
const mercuryAudio = {
    correct: 'audio/mercury/correct.mp3',
    finalBadge: 'audio/mercury/final-badge.mp3',
    story: (chId, idx) => `audio/mercury/ch${chId}-story-${idx}.mp3`,
    hanzi: (chId, idx) => `audio/mercury/ch${chId}-hanzi-${idx}.mp3`,
    quiz: (chId) => `audio/mercury/ch${chId}-quiz.mp3`,
    quizHint: (chId) => `audio/mercury/ch${chId}-quiz-hint.mp3`,
    math: (chId, qIdx) => qIdx > 0 ? `audio/mercury/ch${chId}-math-${qIdx + 1}.mp3` : `audio/mercury/ch${chId}-math.mp3`,
    mathHint: (chId, qIdx) => qIdx > 0 ? `audio/mercury/ch${chId}-math-${qIdx + 1}-hint.mp3` : `audio/mercury/ch${chId}-math-hint.mp3`,
    complete: (chId) => `audio/mercury/ch${chId}-complete.mp3`
};

// ============ 存档 ============
function saveProgress() {
    localStorage.setItem('mercuryExplorer', JSON.stringify({
        completedChapters: gameState.completedChapters
    }));
}

function loadProgress() {
    try {
        const data = JSON.parse(localStorage.getItem('mercuryExplorer'));
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
    createMercury();
    createSunReference();
    addLights();

    window.addEventListener('resize', onWindowResize);

    // 纹理加载检测
    const checkLoaded = setInterval(() => {
        if (mercuryMesh && mercuryMesh.material && mercuryMesh.material.uniforms &&
            mercuryMesh.material.uniforms.planetTexture.value.image) {
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

// ============ 创建水星 ============
function createMercury() {
    const geometry = new THREE.SphereGeometry(6, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const mercuryMap = textureLoader.load('textures/mercury.jpg');

    const mercuryMaterial = new THREE.ShaderMaterial({
        uniforms: {
            planetTexture: { value: mercuryMap },
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
                float ambient = 0.10;
                surfaceColor *= (diff * 0.88 + ambient);

                // 极弱 Fresnel 灰色边缘光（水星无大气层）
                vec3 viewDir = normalize(cameraPosition - vWorldPos);
                float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.5);
                surfaceColor += vec3(0.5, 0.5, 0.55) * fresnel * 0.10;

                gl_FragColor = vec4(surfaceColor, 1.0);
            }
        `
    });

    mercuryMesh = new THREE.Mesh(geometry, mercuryMaterial);
    scene.add(mercuryMesh);
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

// ============ 创建远处小太阳（水星离太阳最近） ============
function createSunReference() {
    const geometry = new THREE.SphereGeometry(3, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffdd44
    });

    sunRef = new THREE.Mesh(geometry, material);
    sunRef.position.set(45, 15, -35);
    scene.add(sunRef);

    // 太阳光晕
    const glowGeometry = new THREE.SphereGeometry(4.5, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffee88,
        transparent: true,
        opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.copy(sunRef.position);
    scene.add(glow);
}

// ============ 灯光 ============
function addLights() {
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.3);
    sunLight.position.set(50, 20, 30);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x222233, 0.25);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0x4466aa, 0.2);
    rimLight.position.set(-30, -10, -20);
    scene.add(rimLight);
}

// ============ 动画循环 ============
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    // 水星缓慢自转
    if (mercuryMesh) {
        mercuryMesh.rotation.y += delta * 0.03;
        if (mercuryMesh.material.uniforms) {
            mercuryMesh.material.uniforms.time.value = elapsed;
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
        // 离太阳最近 - 能看到远处太阳
        animateCameraTo({ x: 10, y: 5, z: 18 }, { x: 0, y: 0, z: 0 });
    },
    2: () => {
        // 极端温差 - 正面近景
        animateCameraTo({ x: 0, y: 2, z: 16 }, { x: 0, y: 0, z: 0 });
    },
    3: () => {
        // 水星表面 - 推近看表面
        animateCameraTo({ x: -2, y: 1, z: 13 }, { x: -2, y: 0, z: 0 });
    },
    4: () => {
        // 水星的一天 - 侧面
        animateCameraTo({ x: 15, y: 8, z: 15 }, { x: 0, y: 0, z: 0 });
    },
    5: () => {
        // 没有月亮 - 孤独的远景
        animateCameraTo({ x: 5, y: 12, z: 22 }, { x: 0, y: 0, z: 0 });
    },
    6: () => {
        // 探索水星 - 从远到近
        animateCameraTo({ x: -10, y: 6, z: 20 }, { x: 0, y: 0, z: 0 });
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
    playAudio(mercuryAudio.story(ch.id, storyIndex + 1), plainText);

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
    playAudio(mercuryAudio.hanzi(ch.id, hanziIndex + 1), hanziText);

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

    playAudio(mercuryAudio.quiz(ch.id), ch.quiz.question);

    const optionsDiv = document.getElementById('quizOptions');
    optionsDiv.innerHTML = '';

    const labels = ['A', 'B', 'C'];
    ch.quiz.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.innerHTML = `<span class="opt-label">${labels[i]}</span><span>${opt.text}</span>`;
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

    const audioPath = mercuryAudio.math(ch.id, qIdx);

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
        playAudio(mercuryAudio.correct, '太棒了！回答正确！');

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
            ? mercuryAudio.mathHint(chId, gameState.mathQuestionIndex)
            : mercuryAudio.quizHint(chId);
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
    playAudio(mercuryAudio.complete(chId), `太厉害了！第${chId}章，${ch.title}，探险成功！你获得了一颗星星！`);

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
    playAudio(mercuryAudio.finalBadge, '恭喜智天！你完成了全部6个章节的水星探险！你获得了水星探险家大徽章！');
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
