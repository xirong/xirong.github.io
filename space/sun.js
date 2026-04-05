/**
 * 太阳探险家 - 柳智天的宇宙课堂
 * 6大章节闯关：科普故事 → 汉字学习 → 知识测验 → 数学挑战 → 获得星星
 */

// ============ 全局变量 ============
let scene, camera, renderer, controls;
let sunMesh, coronaMesh, earthRef, starField;
let clock;

// ============ 章节数据 ============
const chaptersData = [
    {
        id: 1,
        title: '太阳有多大',
        icon: '🌞',
        desc: '能装下130万个地球',
        stories: [
            '太阳是太阳系中心的<span class="highlight">大火球</span>，所有的行星都围着它转！',
            '太阳能装下<span class="highlight">130万个地球</span>！它真的非常非常大！',
            '如果太阳是一个<span class="highlight">篮球</span>，地球只有<span class="highlight">绿豆</span>那么大！'
        ],
        hanzi: [
            { char: '日', pinyin: 'rì', words: '日头 · 日出', sentence: '太阳从东方升起。', pictograph: 'drawSun' },
            { char: '火', pinyin: 'huǒ', words: '火焰 · 火山', sentence: '红红的火焰跳来跳去。', pictograph: 'drawFire' }
        ],
        quiz: {
            question: '太阳能装下多少个地球？',
            options: [
                { text: '130万个', correct: true },
                { text: '100个', correct: false },
                { text: '1万个', correct: false }
            ],
            hint: '太阳非常非常大哦！'
        },
        math: [
            {
                type: 'choice',
                question: '太阳系有4个岩石行星和4个气态行星，一共几个？',
                options: [
                    { text: '7 个', correct: false },
                    { text: '8 个', correct: true },
                    { text: '9 个', correct: false }
                ],
                hint: '4 + 4 = ?'
            },
            {
                type: 'fillin',
                question: '太阳能装下130万个地球！如果搬走了3个地球模型，桌上还剩几个？（原来有9个）',
                answer: 6,
                hint: '9 - 3 = ?'
            },
            {
                type: 'fillin',
                question: '太阳能板今天收集了6份光能，又收集了4份，一共收集了几份光能？',
                answer: 10,
                hint: '6加4等于10'
            },
            {
                type: 'sequential',
                question: '太阳能板有8份光能，用掉了3份照明，又收集了2份，现在有几份光能？',
                expression: '8 - 3 + 2',
                answer: 7,
                hint: '先算8减3等于5，再算5加2等于7'
            }
        ]
    },
    {
        id: 2,
        title: '核聚变发光',
        icon: '💡',
        desc: '太阳为什么会发光？',
        stories: [
            '太阳为什么会发光？因为<span class="highlight">核聚变</span>！',
            '<span class="highlight">氢</span>变成<span class="highlight">氦</span>，释放出巨大的能量！',
            '就像一个<span class="highlight">超级大火炉</span>，不停地燃烧，给我们带来光和热！'
        ],
        hanzi: [
            { char: '光', pinyin: 'guāng', words: '光明 · 阳光', sentence: '阳光照得大地亮堂堂。', pictograph: 'drawLight' },
            { char: '热', pinyin: 'rè', words: '热水 · 炎热', sentence: '夏天真热要多喝水。', pictograph: 'drawHot' }
        ],
        quiz: {
            question: '太阳发光是因为？',
            options: [
                { text: '在烧木头', correct: false },
                { text: '通了电', correct: false },
                { text: '核聚变', correct: true }
            ],
            hint: '太阳里面氢变成氦...'
        },
        math: [
            {
                type: 'choice',
                question: '太阳的光到地球要8分钟，小明等了2分钟，还要等几分钟？',
                options: [
                    { text: '6 分钟', correct: true },
                    { text: '7 分钟', correct: false },
                    { text: '5 分钟', correct: false }
                ],
                hint: '8 - 2 = ?'
            },
            {
                type: 'fillin',
                question: '核聚变把4个氢原子变成1个氦原子，用掉了几个氢？',
                answer: 4,
                hint: '数一数，一共用了几个？'
            },
            {
                type: 'fillin',
                question: '太阳发出了9束光线，有4束照到了地球，还有几束没照到地球？',
                answer: 5,
                hint: '9减4等于5'
            },
            {
                type: 'sequential',
                question: '太阳发出了7束光线，地球接收了3束，植物又吸收了2束用于光合作用，剩余几束光线照射着地面？',
                expression: '7 - 3 - 2',
                answer: 2,
                hint: '先算7减3等于4，再算4减2等于2'
            }
        ]
    },
    {
        id: 3,
        title: '太阳温度',
        icon: '🌡️',
        desc: '比火山岩浆还热！',
        stories: [
            '太阳表面温度有<span class="highlight">5500度</span>，比火山岩浆还热！',
            '太阳核心温度更高，有<span class="highlight">1500万度</span>！',
            '但太阳离我们<span class="highlight">很远</span>，所以我们只觉得温暖。'
        ],
        hanzi: [
            { char: '红', pinyin: 'hóng', words: '红色 · 红花', sentence: '秋天枫叶红红的。', pictograph: 'drawRed' },
            { char: '明', pinyin: 'míng', words: '明天 · 光明', sentence: '明天又是美好的一天。', pictograph: 'drawBright' }
        ],
        quiz: {
            question: '太阳表面大约多少度？',
            options: [
                { text: '100度', correct: false },
                { text: '5500度', correct: true },
                { text: '1万度', correct: false }
            ],
            hint: '比开水热多了，比1万度低一些...'
        },
        math: [
            {
                type: 'choice',
                question: '小明看了3次太阳黑子，小红看了4次，一共看了几次？',
                options: [
                    { text: '6 次', correct: false },
                    { text: '8 次', correct: false },
                    { text: '7 次', correct: true }
                ],
                hint: '3 + 4 = ?'
            },
            {
                type: 'fillin',
                question: '太阳表面温度5500度！如果温度计最高10度，需要几个温度计叠起来才到10度？（2+8=?）',
                answer: 10,
                hint: '2 + 8 = ?'
            },
            {
                type: 'fillin',
                question: '太阳表面有5个热区，又出现了3个新热区，一共有几个热区？',
                answer: 8,
                hint: '5加3等于8'
            },
            {
                type: 'sequential',
                question: '太阳表面有9个热区，冷却了4个变成暗区，又爆发了2个新热区，现在有几个热区？',
                expression: '9 - 4 + 2',
                answer: 7,
                hint: '先算9减4等于5，再算5加2等于7'
            }
        ]
    },
    {
        id: 4,
        title: '太阳黑子',
        icon: '🔭',
        desc: '太阳上的黑色斑点',
        stories: [
            '太阳表面有<span class="highlight">黑色斑点</span>，叫做<span class="highlight">太阳黑子</span>！',
            '它们不是真的黑，只是比周围<span class="highlight">温度低</span>！',
            '黑子也有<span class="highlight">4000多度</span>，但旁边更亮，所以显得黑！'
        ],
        hanzi: [
            { char: '金', pinyin: 'jīn', words: '金子 · 金色', sentence: '金色阳光洒满大地。', pictograph: 'drawGold' },
            { char: '亮', pinyin: 'liàng', words: '明亮 · 亮光', sentence: '星星闪闪亮晶晶。', pictograph: 'drawShine' }
        ],
        quiz: {
            question: '太阳黑子看起来黑是因为？',
            options: [
                { text: '比周围温度低显得暗', correct: true },
                { text: '被墨水染的', correct: false },
                { text: '是洞', correct: false }
            ],
            hint: '黑子温度比旁边低...'
        },
        math: [
            {
                type: 'choice',
                question: '望远镜看到5个大黑子和2个小黑子，一共几个？',
                options: [
                    { text: '6 个', correct: false },
                    { text: '7 个', correct: true },
                    { text: '8 个', correct: false }
                ],
                hint: '5 + 2 = ?'
            },
            {
                type: 'fillin',
                question: '太阳上有9个黑子，消失了3个，还剩几个？',
                answer: 6,
                hint: '9 - 3 = ?'
            },
            {
                type: 'fillin',
                question: '太阳上出现了6个太阳黑子，消失了4个，还剩几个太阳黑子？',
                answer: 2,
                hint: '6减4等于2'
            },
            {
                type: 'sequential',
                question: '太阳上有4个太阳黑子，耀斑爆发新增了5个，其中3个快速消失了，还剩几个太阳黑子？',
                expression: '4 + 5 - 3',
                answer: 6,
                hint: '先算4加5等于9，再算9减3等于6'
            }
        ]
    },
    {
        id: 5,
        title: '太阳与生命',
        icon: '🌱',
        desc: '万物生长靠太阳',
        stories: [
            '没有太阳，地球会变成<span class="highlight">冰球</span>！',
            '植物需要<span class="highlight">阳光</span>进行<span class="highlight">光合作用</span>，才能生长！',
            '太阳给我们带来<span class="highlight">白天黑夜</span>和<span class="highlight">四季</span>变化！'
        ],
        hanzi: [
            { char: '力', pinyin: 'lì', words: '力气 · 力量', sentence: '大力士力气真大。', pictograph: 'drawPower' },
            { char: '能', pinyin: 'néng', words: '能力 · 能量', sentence: '我能自己穿衣服了。', pictograph: 'drawEnergy' }
        ],
        quiz: {
            question: '没有太阳，地球会怎样？',
            options: [
                { text: '会更热', correct: false },
                { text: '没变化', correct: false },
                { text: '变成冰球', correct: true }
            ],
            hint: '太阳给地球带来温暖...'
        },
        math: [
            {
                type: 'choice',
                question: '春夏秋冬4个季节，智天最喜欢2个，不喜欢几个？',
                options: [
                    { text: '2 个', correct: true },
                    { text: '3 个', correct: false },
                    { text: '1 个', correct: false }
                ],
                hint: '4 - 2 = ?'
            },
            {
                type: 'fillin',
                question: '植物需要阳光才能长大！花园里有3朵红花和4朵黄花，一共几朵？',
                answer: 7,
                hint: '3 + 4 = ?'
            },
            {
                type: 'fillin',
                question: '花园里有3朵向日葵，太阳照射后又开了4朵，现在一共有几朵向日葵？',
                answer: 7,
                hint: '3加4等于7'
            },
            {
                type: 'sequential',
                question: '花园里有8朵花，太阳太强晒蔫了2朵，下雨后又开了3朵，现在有几朵花？',
                expression: '8 - 2 + 3',
                answer: 9,
                hint: '先算8减2等于6，再算6加3等于9'
            }
        ]
    },
    {
        id: 6,
        title: '太阳的未来',
        icon: '🔮',
        desc: '太阳也会变老吗？',
        stories: [
            '太阳已经燃烧了<span class="highlight">46亿年</span>！',
            '大约<span class="highlight">50亿年</span>后，太阳会变成<span class="highlight">红巨星</span>！',
            '最后变成<span class="highlight">白矮星</span>，像一颗安静的小星星。'
        ],
        hanzi: [
            { char: '阳', pinyin: 'yáng', words: '太阳 · 阳光', sentence: '阳光下的花儿开得真美。', pictograph: 'drawYang' },
            { char: '白', pinyin: 'bái', words: '白色 · 雪白', sentence: '白白的云朵飘在天上。', pictograph: 'drawWhite' }
        ],
        quiz: {
            question: '太阳最后会变成什么？',
            options: [
                { text: '黑洞', correct: false },
                { text: '白矮星', correct: true },
                { text: '消失不见', correct: false }
            ],
            hint: '太阳会变成一颗安静的小星星...'
        },
        math: [
            {
                type: 'choice',
                question: '太阳家族有8颗行星，走了3颗去旅行，还剩几颗？',
                options: [
                    { text: '4 颗', correct: false },
                    { text: '6 颗', correct: false },
                    { text: '5 颗', correct: true }
                ],
                hint: '8 - 3 = ?'
            },
            {
                type: 'fillin',
                question: '太阳已经燃烧了46亿年！如果用小火柴来数，6根加上2根是几根？',
                answer: 8,
                hint: '6 + 2 = ?'
            },
            {
                type: 'fillin',
                question: '太阳风带走了6颗宇宙尘埃，又卷走了3颗，一共带走了几颗尘埃？',
                answer: 9,
                hint: '6加3等于9'
            },
            {
                type: 'sequential',
                question: '太阳有10份热量，变成红巨星后散发了4份，剩余热量变成白矮星又冷却了3份，最后还有几份热量？',
                expression: '10 - 4 - 3',
                answer: 3,
                hint: '先算10减4等于6，再算6减3等于3'
            }
        ]
    }
];

// ============ 象形图绘制函数 ============
const pictographDrawers = {
    // 日 - 太阳
    drawSun(ctx, w, h) {
        // 圆形太阳
        ctx.fillStyle = '#FFB300';
        ctx.beginPath(); ctx.arc(w/2, h/2, 30, 0, Math.PI*2); ctx.fill();
        // 光芒线
        ctx.strokeStyle = '#FFD54F'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const x1 = w/2 + Math.cos(angle) * 35;
            const y1 = h/2 + Math.sin(angle) * 35;
            const x2 = w/2 + Math.cos(angle) * 50;
            const y2 = h/2 + Math.sin(angle) * 50;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        }
        // 笑脸
        ctx.fillStyle = '#FF8F00';
        ctx.beginPath(); ctx.arc(w/2-8, h/2-5, 3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w/2+8, h/2-5, 3, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#FF8F00'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(w/2, h/2+2, 10, 0.2, Math.PI-0.2); ctx.stroke();
    },
    // 火 - 火焰
    drawFire(ctx, w, h) {
        // 外焰 - 红色
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.moveTo(w/2, 15);
        ctx.quadraticCurveTo(w/2+35, 40, w/2+25, 80);
        ctx.quadraticCurveTo(w/2+30, 110, w/2, 120);
        ctx.quadraticCurveTo(w/2-30, 110, w/2-25, 80);
        ctx.quadraticCurveTo(w/2-35, 40, w/2, 15);
        ctx.fill();
        // 内焰 - 橙色
        ctx.fillStyle = '#F39C12';
        ctx.beginPath();
        ctx.moveTo(w/2, 35);
        ctx.quadraticCurveTo(w/2+20, 55, w/2+15, 80);
        ctx.quadraticCurveTo(w/2+18, 100, w/2, 110);
        ctx.quadraticCurveTo(w/2-18, 100, w/2-15, 80);
        ctx.quadraticCurveTo(w/2-20, 55, w/2, 35);
        ctx.fill();
        // 核心 - 黄色
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.moveTo(w/2, 60);
        ctx.quadraticCurveTo(w/2+10, 75, w/2+8, 90);
        ctx.quadraticCurveTo(w/2+8, 105, w/2, 108);
        ctx.quadraticCurveTo(w/2-8, 105, w/2-8, 90);
        ctx.quadraticCurveTo(w/2-10, 75, w/2, 60);
        ctx.fill();
    },
    // 光 - 光芒四射
    drawLight(ctx, w, h) {
        // 中心光源
        const grad = ctx.createRadialGradient(w/2, h/2, 5, w/2, h/2, 50);
        grad.addColorStop(0, '#FFF9C4');
        grad.addColorStop(0.5, '#FFD54F');
        grad.addColorStop(1, 'rgba(255,213,79,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        // 光线
        ctx.strokeStyle = '#FFB300'; ctx.lineWidth = 2; ctx.lineCap = 'round';
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI * 2) / 12;
            const len = 20 + (i % 2) * 15;
            const x1 = w/2 + Math.cos(angle) * 15;
            const y1 = h/2 + Math.sin(angle) * 15;
            const x2 = w/2 + Math.cos(angle) * (15 + len);
            const y2 = h/2 + Math.sin(angle) * (15 + len);
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        }
        // 中心圆
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.arc(w/2, h/2, 10, 0, Math.PI*2); ctx.fill();
    },
    // 热 - 热气腾腾的杯子
    drawHot(ctx, w, h) {
        // 杯子
        ctx.fillStyle = '#5DADE2';
        ctx.beginPath();
        ctx.moveTo(w/2-25, h/2+5); ctx.lineTo(w/2-20, h-20);
        ctx.lineTo(w/2+20, h-20); ctx.lineTo(w/2+25, h/2+5);
        ctx.closePath(); ctx.fill();
        // 杯口
        ctx.fillStyle = '#85C1E9';
        ctx.fillRect(w/2-28, h/2, 56, 8);
        // 热气 - 三条波浪线
        ctx.strokeStyle = '#E74C3C'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
            const x = w/2 - 15 + i * 15;
            ctx.beginPath();
            ctx.moveTo(x, h/2-5);
            ctx.quadraticCurveTo(x+6, h/2-18, x, h/2-28);
            ctx.quadraticCurveTo(x-6, h/2-38, x, h/2-48);
            ctx.stroke();
        }
    },
    // 红 - 红色枫叶
    drawRed(ctx, w, h) {
        ctx.fillStyle = '#E74C3C';
        // 简单枫叶形状
        ctx.beginPath();
        ctx.moveTo(w/2, 15);
        ctx.lineTo(w/2+10, 35); ctx.lineTo(w/2+35, 30);
        ctx.lineTo(w/2+20, 50); ctx.lineTo(w/2+40, 65);
        ctx.lineTo(w/2+15, 65); ctx.lineTo(w/2+10, 85);
        ctx.lineTo(w/2, 70);
        ctx.lineTo(w/2-10, 85); ctx.lineTo(w/2-15, 65);
        ctx.lineTo(w/2-40, 65); ctx.lineTo(w/2-20, 50);
        ctx.lineTo(w/2-35, 30); ctx.lineTo(w/2-10, 35);
        ctx.closePath(); ctx.fill();
        // 叶柄
        ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(w/2, 70); ctx.lineTo(w/2, 120); ctx.stroke();
    },
    // 明 - 日+月=明
    drawBright(ctx, w, h) {
        // 左边 - 太阳
        ctx.fillStyle = '#FFB300';
        ctx.beginPath(); ctx.arc(w/2-25, h/2, 22, 0, Math.PI*2); ctx.fill();
        // 太阳光线
        ctx.strokeStyle = '#FFD54F'; ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const x1 = w/2-25 + Math.cos(angle) * 25;
            const y1 = h/2 + Math.sin(angle) * 25;
            const x2 = w/2-25 + Math.cos(angle) * 33;
            const y2 = h/2 + Math.sin(angle) * 33;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        }
        // 右边 - 月亮
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath(); ctx.arc(w/2+25, h/2, 20, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#0a0a0f';
        ctx.beginPath(); ctx.arc(w/2+35, h/2-8, 17, 0, Math.PI*2); ctx.fill();
    },
    // 金 - 金元宝
    drawGold(ctx, w, h) {
        // 元宝形状
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.moveTo(w/2-35, h/2+15);
        ctx.quadraticCurveTo(w/2-40, h/2-10, w/2-15, h/2-20);
        ctx.quadraticCurveTo(w/2, h/2-35, w/2+15, h/2-20);
        ctx.quadraticCurveTo(w/2+40, h/2-10, w/2+35, h/2+15);
        ctx.quadraticCurveTo(w/2, h/2+5, w/2-35, h/2+15);
        ctx.fill();
        // 底座
        ctx.fillStyle = '#E6B800';
        ctx.beginPath();
        ctx.ellipse(w/2, h/2+18, 38, 12, 0, 0, Math.PI*2);
        ctx.fill();
        // 高光
        ctx.fillStyle = '#FFF9C4';
        ctx.beginPath();
        ctx.ellipse(w/2-10, h/2-10, 8, 4, -0.3, 0, Math.PI*2);
        ctx.fill();
        // "金"字标记
        ctx.fillStyle = '#B8860B';
        ctx.font = 'bold 16px Noto Sans SC';
        ctx.textAlign = 'center';
        ctx.fillText('$', w/2, h/2+8);
    },
    // 亮 - 灯泡发光
    drawShine(ctx, w, h) {
        // 灯泡外光晕
        const grad = ctx.createRadialGradient(w/2, h/2-10, 10, w/2, h/2-10, 45);
        grad.addColorStop(0, 'rgba(255,213,79,0.4)');
        grad.addColorStop(1, 'rgba(255,213,79,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        // 灯泡
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath(); ctx.arc(w/2, h/2-15, 25, 0, Math.PI*2); ctx.fill();
        // 灯座
        ctx.fillStyle = '#95A5A6';
        ctx.fillRect(w/2-12, h/2+10, 24, 20);
        // 灯丝
        ctx.strokeStyle = '#FF8F00'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w/2-8, h/2-5);
        ctx.lineTo(w/2-4, h/2-20);
        ctx.lineTo(w/2+4, h/2-5);
        ctx.lineTo(w/2+8, h/2-20);
        ctx.stroke();
    },
    // 力 - 举重力士
    drawPower(ctx, w, h) {
        // 头
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath(); ctx.arc(w/2, 30, 15, 0, Math.PI*2); ctx.fill();
        // 身体
        ctx.strokeStyle = '#E74C3C'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(w/2, 45); ctx.lineTo(w/2, 85); ctx.stroke();
        // 手臂举起（弯曲向上）
        ctx.beginPath(); ctx.moveTo(w/2, 55);
        ctx.lineTo(w/2-20, 50); ctx.lineTo(w/2-25, 30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2, 55);
        ctx.lineTo(w/2+20, 50); ctx.lineTo(w/2+25, 30); ctx.stroke();
        // 哑铃
        ctx.fillStyle = '#555';
        ctx.fillRect(w/2-35, 25, 12, 10);
        ctx.fillRect(w/2+23, 25, 12, 10);
        ctx.strokeStyle = '#777'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(w/2-25, 30); ctx.lineTo(w/2+25, 30); ctx.stroke();
        // 腿
        ctx.strokeStyle = '#3498DB'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(w/2, 85); ctx.lineTo(w/2-18, 120); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2, 85); ctx.lineTo(w/2+18, 120); ctx.stroke();
    },
    // 能 - 闪电能量
    drawEnergy(ctx, w, h) {
        // 闪电
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.moveTo(w/2+5, 10);
        ctx.lineTo(w/2-20, h/2+5);
        ctx.lineTo(w/2-2, h/2+5);
        ctx.lineTo(w/2-10, h-10);
        ctx.lineTo(w/2+25, h/2-5);
        ctx.lineTo(w/2+5, h/2-5);
        ctx.closePath(); ctx.fill();
        // 边框
        ctx.strokeStyle = '#FF8F00'; ctx.lineWidth = 2;
        ctx.stroke();
        // 能量圈
        ctx.strokeStyle = 'rgba(244,208,63,0.3)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(w/2, h/2, 50, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(w/2, h/2, 40, 0, Math.PI*2); ctx.stroke();
    },
    // 阳 - 太阳+山丘（阳光照山）
    drawYang(ctx, w, h) {
        // 天空渐变
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#87CEEB'); grad.addColorStop(1, '#E8F5E9');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
        // 山丘
        ctx.fillStyle = '#27AE60';
        ctx.beginPath();
        ctx.moveTo(0, h); ctx.quadraticCurveTo(w/4, h/2+10, w/2, h/2+20);
        ctx.quadraticCurveTo(w*3/4, h/2+10, w, h);
        ctx.closePath(); ctx.fill();
        // 太阳
        ctx.fillStyle = '#FFB300';
        ctx.beginPath(); ctx.arc(w/2, 35, 20, 0, Math.PI*2); ctx.fill();
        // 光线
        ctx.strokeStyle = '#FFD54F'; ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            ctx.beginPath();
            ctx.moveTo(w/2 + Math.cos(angle)*23, 35 + Math.sin(angle)*23);
            ctx.lineTo(w/2 + Math.cos(angle)*32, 35 + Math.sin(angle)*32);
            ctx.stroke();
        }
    },
    // 白 - 白云朵
    drawWhite(ctx, w, h) {
        // 蓝天背景
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, w, h);
        // 大白云
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.arc(w/2-15, h/2, 25, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w/2+15, h/2, 22, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w/2, h/2-15, 20, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w/2-25, h/2+5, 18, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w/2+25, h/2+5, 18, 0, Math.PI*2); ctx.fill();
        // 小白云
        ctx.beginPath(); ctx.arc(35, 30, 12, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(50, 25, 10, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(45, 35, 8, 0, Math.PI*2); ctx.fill();
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
const sunAudio = {
    correct: 'audio/sun/correct.mp3',
    finalBadge: 'audio/sun/final-badge.mp3',
    story: (chId, idx) => `audio/sun/ch${chId}-story-${idx}.mp3`,
    hanzi: (chId, idx) => `audio/sun/ch${chId}-hanzi-${idx}.mp3`,
    quiz: (chId) => `audio/sun/ch${chId}-quiz.mp3`,
    quizOption: (chId, optIdx) => `audio/sun/ch${chId}-quiz-${['a','b','c'][optIdx]}.mp3`,
    quizHint: (chId) => `audio/sun/ch${chId}-quiz-hint.mp3`,
    math: (chId, qIdx) => qIdx > 0 ? `audio/sun/ch${chId}-math-${qIdx + 1}.mp3` : `audio/sun/ch${chId}-math.mp3`,
    mathHint: (chId, qIdx) => qIdx > 0 ? `audio/sun/ch${chId}-math-${qIdx + 1}-hint.mp3` : `audio/sun/ch${chId}-math-hint.mp3`,
    complete: (chId) => `audio/sun/ch${chId}-complete.mp3`
};

// ============ 存档 ============
function saveProgress() {
    localStorage.setItem('sunExplorer', JSON.stringify({
        completedChapters: gameState.completedChapters
    }));
}

function loadProgress() {
    try {
        const data = JSON.parse(localStorage.getItem('sunExplorer'));
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
    createSun();
    createCorona();
    createEarthReference();

    window.addEventListener('resize', onWindowResize);

    // 纹理加载检测
    const checkLoaded = setInterval(() => {
        if (sunMesh && sunMesh.material && sunMesh.material.uniforms &&
            sunMesh.material.uniforms.planetTexture.value.image) {
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

// ============ 创建太阳 ============
function createSun() {
    const geometry = new THREE.SphereGeometry(6, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const sunMap = textureLoader.load('textures/sun.jpg');

    const sunMaterial = new THREE.ShaderMaterial({
        uniforms: {
            planetTexture: { value: sunMap },
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
            uniform float time;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vWorldPos;

            void main() {
                vec3 surfaceColor = texture2D(planetTexture, vUv).rgb;

                // 提亮纹理 - 太阳自发光
                surfaceColor *= 1.4;

                // 轻微脉动效果
                float pulse = 1.0 + 0.05 * sin(time * 1.5);
                surfaceColor *= pulse;

                // Fresnel 金色光晕边缘
                vec3 viewDir = normalize(cameraPosition - vWorldPos);
                float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
                vec3 glowColor = vec3(1.0, 0.7, 0.1); // 金橙色
                surfaceColor += glowColor * fresnel * 0.8;

                // 整体发光增强
                surfaceColor += vec3(0.15, 0.08, 0.02);

                gl_FragColor = vec4(surfaceColor, 1.0);
            }
        `
    });

    sunMesh = new THREE.Mesh(geometry, sunMaterial);
    scene.add(sunMesh);
}

// ============ 创建日冕/光晕 ============
function createCorona() {
    const coronaGeometry = new THREE.SphereGeometry(7.5, 64, 64);
    const coronaMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
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
            uniform float time;
            varying vec3 vNormal;
            varying vec3 vWorldPos;

            void main() {
                vec3 viewDir = normalize(cameraPosition - vWorldPos);
                float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.0);

                // 日冕颜色 - 金橙色到透明
                vec3 coronaColor = mix(vec3(1.0, 0.6, 0.1), vec3(1.0, 0.3, 0.0), fresnel);

                // 脉动
                float pulse = 1.0 + 0.15 * sin(time * 2.0);
                float alpha = fresnel * 0.4 * pulse;

                // 内部完全透明
                float innerFade = smoothstep(0.0, 0.3, fresnel);
                alpha *= innerFade;

                gl_FragColor = vec4(coronaColor, alpha);
            }
        `,
        transparent: true,
        side: THREE.FrontSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    coronaMesh = new THREE.Mesh(coronaGeometry, coronaMaterial);
    scene.add(coronaMesh);
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
    const geometry = new THREE.SphereGeometry(1.5, 32, 32);
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load('textures/earth_daymap.jpg');

    const material = new THREE.MeshBasicMaterial({
        map: earthMap
    });

    earthRef = new THREE.Mesh(geometry, material);
    earthRef.position.set(40, 10, -30);
    scene.add(earthRef);
}

// ============ 动画循环 ============
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    // 太阳缓慢自转
    if (sunMesh) {
        sunMesh.rotation.y += delta * 0.03;
        if (sunMesh.material.uniforms) {
            sunMesh.material.uniforms.time.value = elapsed;
        }
    }

    // 日冕同步
    if (coronaMesh) {
        coronaMesh.rotation.y = sunMesh ? sunMesh.rotation.y : 0;
        if (coronaMesh.material.uniforms) {
            coronaMesh.material.uniforms.time.value = elapsed;
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
        // 太阳有多大 - 正面近景
        animateCameraTo({ x: 0, y: 2, z: 16 }, { x: 0, y: 0, z: 0 });
    },
    2: () => {
        // 核聚变 - 侧面近景看细节
        animateCameraTo({ x: 12, y: 5, z: 12 }, { x: 0, y: 0, z: 0 });
    },
    3: () => {
        // 温度 - 推近表面
        animateCameraTo({ x: -3, y: 1, z: 14 }, { x: -2, y: 0, z: 0 });
    },
    4: () => {
        // 黑子 - 近距离观察表面
        animateCameraTo({ x: 3, y: -1, z: 13 }, { x: 0, y: -2, z: 0 });
    },
    5: () => {
        // 太阳与生命 - 能看到远处地球
        animateCameraTo({ x: -10, y: 10, z: 20 }, { x: 0, y: 0, z: 0 });
    },
    6: () => {
        // 太阳的未来 - 远景全貌
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
            ${isLocked ? '<div class="lock-icon">&#128274;</div>' : ''}
            ${isCompleted ? '<div class="lock-icon">&#11088;</div>' : ''}
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
        star.textContent = isCompleted ? '\u2B50' : ch.id;
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

    // 触发3D效果
    if (chapterEffects[chapterId]) {
        chapterEffects[chapterId]();
    }

    // 延迟显示故事面板
    setTimeout(() => showStory(ch), 800);
}

// ============ 科普故事 ============
function showStory(ch) {
    const panel = document.getElementById('storyPanel');
    document.getElementById('storyTag').textContent = `第${ch.id}章 \u00B7 ${ch.title}`;

    const storyHtml = ch.stories[storyIndex];
    document.getElementById('storyText').innerHTML = storyHtml;

    // 语音朗读
    const plainText = storyHtml.replace(/<[^>]*>/g, '');
    playAudio(sunAudio.story(ch.id, storyIndex + 1), plainText);

    // 渲染导航点
    const dots = document.getElementById('storyDots');
    dots.innerHTML = '';
    ch.stories.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'story-dot' + (i === storyIndex ? ' active' : '');
        dots.appendChild(dot);
    });

    // 按钮文字
    const btn = document.getElementById('storyNextBtn');
    btn.textContent = storyIndex < ch.stories.length - 1 ? '\u7EE7\u7EED \u2192' : '\u5B66\u6C49\u5B57 \u2192';

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
        `\u6C49\u5B57\u5B66\u4E60 \u00B7 \u7B2C${hanziIndex + 1}/${ch.hanzi.length}\u4E2A`;
    document.getElementById('hanziChar').textContent = hanzi.char;
    document.getElementById('hanziPinyin').textContent = hanzi.pinyin;
    document.getElementById('hanziWords').textContent = hanzi.words;
    document.getElementById('hanziSentence').textContent = hanzi.sentence;

    // 绘制象形图
    const canvas = document.getElementById('hanziPictograph');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (hanzi.pictograph && pictographDrawers[hanzi.pictograph]) {
        pictographDrawers[hanzi.pictograph](ctx, canvas.width, canvas.height);
    }

    // 语音
    const hanziText = `${hanzi.char}\uFF0C${hanzi.pinyin}\uFF0C${hanzi.words.replace(/\u00B7/g, '\uFF0C')}\u3002${hanzi.sentence}`;
    playAudio(sunAudio.hanzi(ch.id, hanziIndex + 1), hanziText);

    // 按钮文字
    document.getElementById('hanziNextBtn').textContent =
        hanziIndex < ch.hanzi.length - 1 ? '\u4E0B\u4E00\u4E2A\u5B57 \u2192' : '\u53BB\u7B54\u9898 \u2192';

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
    document.getElementById('quizTag').textContent = '\u77E5\u8BC6\u6D4B\u9A8C';
    document.getElementById('quizTag').className = 'quiz-tag knowledge';
    document.getElementById('quizQuestion').textContent = ch.quiz.question;

    const labels = ['A', 'B', 'C'];
    const fullText = ch.quiz.question + '。' + ch.quiz.options.map((opt, i) => labels[i] + '，' + opt.text).join('。') + '。选一选吧！';
    playAudio(sunAudio.quiz(ch.id), fullText);

    const optionsDiv = document.getElementById('quizOptions');
    optionsDiv.innerHTML = '';

    ch.quiz.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        const safeText = opt.text.replace(/'/g, "\\'");
        btn.innerHTML = `<span class="opt-label">${labels[i]}</span><span class="opt-text">${opt.text}</span><span class="opt-sound" onclick="event.stopPropagation(); playAudio(sunAudio.quizOption(${ch.id}, ${i}), '${labels[i]}，${safeText}')">&#128264;</span>`;
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

    const audioPath = sunAudio.math(ch.id, qIdx);

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
        playAudio(sunAudio.correct, '太棒了！回答正确！');

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
            ? sunAudio.mathHint(chId, gameState.mathQuestionIndex)
            : sunAudio.quizHint(chId);
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
    document.getElementById('rewardIcon').textContent = '\u2B50';
    document.getElementById('rewardTitle').textContent = `\u7B2C${chId}\u7AE0\u5B8C\u6210\uFF01`;
    document.getElementById('rewardDesc').textContent = `\u300C${ch.title}\u300D\u63A2\u9669\u6210\u529F\uFF01\u4F60\u83B7\u5F97\u4E86\u4E00\u9897\u661F\u661F\uFF01`;
    playAudio(sunAudio.complete(chId), `\u592A\u5389\u5BB3\u4E86\uFF01\u7B2C${chId}\u7AE0\uFF0C${ch.title}\uFF0C\u63A2\u9669\u6210\u529F\uFF01\u4F60\u83B7\u5F97\u4E86\u4E00\u9897\u661F\u661F\uFF01`);

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
    playAudio(sunAudio.finalBadge, '\u606D\u559C\u667A\u5929\uFF01\u4F60\u5B8C\u6210\u4E86\u5168\u90E86\u4E2A\u7AE0\u8282\u7684\u592A\u9633\u63A2\u9669\uFF01\u4F60\u83B7\u5F97\u4E86\u592A\u9633\u63A2\u9669\u5BB6\u5927\u5FBD\u7AE0\uFF01');
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
            type: Math.random() > 0.5 ? '\u2B50' : '\u2728'
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
