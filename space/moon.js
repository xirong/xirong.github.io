/**
 * 月球探险家 - 柳智天的宇宙课堂
 * 6大章节闯关：科普故事 → 汉字学习 → 知识测验 → 数学挑战 → 获得星星
 */

// ============ 全局变量 ============
let scene, camera, renderer, controls;
let moonMesh, earthRef, starField;
let clock;

// ============ 章节数据 ============
const chaptersData = [
    {
        id: 1,
        title: '月球引力',
        icon: '🏋️',
        desc: '引力只有地球的1/6',
        stories: [
            '月球比地球<span class="highlight">小很多</span>，它的引力只有地球的<span class="highlight">六分之一</span>！',
            '在月球上，你能跳得比地球上<span class="highlight">高6倍</span>！如果你在地球上跳1米，在月球上能跳<span class="highlight">6米</span>高！',
            '宇航员在月球上走路像在<span class="highlight">蹦蹦跳跳</span>，因为太轻了！'
        ],
        hanzi: [
            { char: '月', pinyin: 'yuè', words: '月亮 · 月光', sentence: '月亮悄悄爬上了树梢。', pictograph: 'drawMoon' },
            { char: '大', pinyin: 'dà', words: '大小 · 大人', sentence: '大象很大，小蚂蚁很小。', pictograph: 'drawBig' }
        ],
        quiz: {
            question: '在月球上跳高，能跳多高？',
            options: [
                { text: '比地球上高6倍', correct: true },
                { text: '跟地球上一样', correct: false },
                { text: '跳不起来', correct: false }
            ],
            hint: '月球引力是地球的六分之一哦！'
        },
        math: [
            {
                type: 'choice',
                question: '宇航员在地球跳1米高，在月球跳了6米，高了几米？',
                options: [
                    { text: '3 米', correct: false },
                    { text: '5 米', correct: true },
                    { text: '7 米', correct: false }
                ],
                hint: '6 - 1 = ?'
            },
            {
                type: 'fillin',
                question: '月球上有4个宇航员，又来了3个，现在一共有几个？',
                answer: 7,
                hint: '4 + 3 = ?'
            },
            {
                type: 'fillin',
                question: '月球上有4个陨石坑，又被小行星撞出了3个新坑，现在一共有几个陨石坑？',
                answer: 7,
                hint: '4加3等于7'
            },
            {
                type: 'sequential',
                question: '月球上原来有8块月球岩石，宇航员带走了3块，又捡回来了2块，现在有几块？',
                expression: '8 - 3 + 2',
                answer: 7,
                hint: '先算8减3等于5，再算5加2等于7'
            }
        ]
    },
    {
        id: 2,
        title: '大碰撞诞生',
        icon: '💥',
        desc: '月球是怎么来的？',
        stories: [
            '很久很久以前，一个<span class="highlight">火星大小</span>的星球撞上了地球！',
            '碰撞产生了好多好多<span class="highlight">碎片</span>，飞到了太空中。',
            '这些碎片慢慢聚在一起，就变成了我们的<span class="highlight">月亮</span>！这叫做<span class="highlight">"大碰撞假说"</span>。'
        ],
        hanzi: [
            { char: '石', pinyin: 'shí', words: '石头 · 岩石', sentence: '河边有很多圆圆的石头。', pictograph: 'drawStone' },
            { char: '星', pinyin: 'xīng', words: '星星 · 星空', sentence: '满天星星亮晶晶。', pictograph: 'drawStar' }
        ],
        quiz: {
            question: '月球是怎么形成的？',
            options: [
                { text: '太阳变出来的', correct: false },
                { text: '一直就在那里', correct: false },
                { text: '大碰撞产生的碎片聚成的', correct: true }
            ],
            hint: '想一想，一个大星球撞了地球后...'
        },
        math: [
            {
                type: 'choice',
                question: '碰撞后飞出了5块大碎片和3块小碎片，一共几块？',
                options: [
                    { text: '8 块', correct: true },
                    { text: '7 块', correct: false },
                    { text: '9 块', correct: false }
                ],
                hint: '5 + 3 = ?'
            },
            {
                type: 'fillin',
                question: '碰撞后有9块碎片，飞走了4块，还剩几块？',
                answer: 5,
                hint: '9 - 4 = ?'
            },
            {
                type: 'fillin',
                question: '月球基地里有6名宇航员，又乘飞船来了4名，现在月球基地有几名宇航员？',
                answer: 10,
                hint: '6加4等于10'
            },
            {
                type: 'sequential',
                question: '月球基地有9套太空服，坏了2套送去修理，又新运来了3套，现在有几套太空服？',
                expression: '9 - 2 + 3',
                answer: 10,
                hint: '先算9减2等于7，再算7加3等于10'
            }
        ]
    },
    {
        id: 3,
        title: '潮汐锁定',
        icon: '🔒',
        desc: '永远一面朝地球',
        stories: [
            '你知道吗？我们在地球上<span class="highlight">永远只能看到月球的一面</span>！',
            '月球自转一圈的时间和绕地球一圈的时间<span class="highlight">一模一样</span>，都是大约<span class="highlight">27天</span>！',
            '这就叫<span class="highlight">"潮汐锁定"</span>，就像月球被地球<span class="highlight">"锁住"</span>了一样。另一面我们永远看不到！'
        ],
        hanzi: [
            { char: '天', pinyin: 'tiān', words: '天空 · 蓝天', sentence: '蓝色的天空让人心情愉快。', pictograph: 'drawSky' },
            { char: '地', pinyin: 'dì', words: '大地 · 地球', sentence: '大地上长满了绿草和鲜花。', pictograph: 'drawGround' }
        ],
        quiz: {
            question: '我们能看到月球的几面？',
            options: [
                { text: '两面都能看到', correct: false },
                { text: '永远只能看到一面', correct: true },
                { text: '看不到月球', correct: false }
            ],
            hint: '月球被地球"锁住"了...'
        },
        math: [
            {
                type: 'choice',
                question: '智天连续看了3个晚上的月亮，又看了4个晚上，一共看了几个晚上？',
                options: [
                    { text: '6 个晚上', correct: false },
                    { text: '8 个晚上', correct: false },
                    { text: '7 个晚上', correct: true }
                ],
                hint: '3 + 4 = ?'
            },
            {
                type: 'fillin',
                question: '月球绕地球转了2圈，又转了6圈，一共转了几圈？',
                answer: 8,
                hint: '2 + 6 = ?'
            },
            {
                type: 'fillin',
                question: '月球车在月球上行驶了5圈，因为低重力又多跑了2圈，一共跑了几圈？',
                answer: 7,
                hint: '5加2等于7'
            },
            {
                type: 'sequential',
                question: '月球车出发时带了10块月球岩石，放下了4块，又装上了1块，现在带着几块？',
                expression: '10 - 4 + 1',
                answer: 7,
                hint: '先算10减4等于6，再算6加1等于7'
            }
        ]
    },
    {
        id: 4,
        title: '登月英雄',
        icon: '🚀',
        desc: '阿波罗11号的故事',
        stories: [
            '<span class="highlight">1969年</span>，美国的<span class="highlight">阿波罗11号</span>飞船载着3位宇航员飞向月球！',
            '<span class="highlight">阿姆斯特朗</span>第一个踏上月球，他说："这是个人的一小步，却是人类的<span class="highlight">一大步</span>！"',
            '宇航员在月球上插了一面旗，留下了<span class="highlight">脚印</span>。因为没有风，脚印到现在还在呢！'
        ],
        hanzi: [
            { char: '人', pinyin: 'rén', words: '大人 · 人们', sentence: '小朋友长大变成大人。', pictograph: 'drawPerson' },
            { char: '飞', pinyin: 'fēi', words: '飞机 · 飞船', sentence: '小鸟展开翅膀飞上蓝天。', pictograph: 'drawFly' }
        ],
        quiz: {
            question: '第一个登上月球的人是谁？',
            options: [
                { text: '阿姆斯特朗', correct: true },
                { text: '杨利伟', correct: false },
                { text: '爱因斯坦', correct: false }
            ],
            hint: '他说了一句很有名的话...'
        },
        math: [
            {
                type: 'choice',
                question: '阿波罗11号有3名宇航员，加上阿波罗12号的3名，一共几名？',
                options: [
                    { text: '5 名', correct: false },
                    { text: '6 名', correct: true },
                    { text: '7 名', correct: false }
                ],
                hint: '3 + 3 = ?'
            },
            {
                type: 'fillin',
                question: '宇航员带了8面旗帜，插了5面，还剩几面？',
                answer: 3,
                hint: '8 - 5 = ?'
            },
            {
                type: 'fillin',
                question: '阿波罗飞船上有3名宇航员穿着太空服，还有5名没穿，一共有几名宇航员？',
                answer: 8,
                hint: '3加5等于8'
            },
            {
                type: 'sequential',
                question: '宇航员在月球插了6面旗帜，风把2面吹倒了，他们又插了4面新旗，现在立着几面旗？',
                expression: '6 - 2 + 4',
                answer: 8,
                hint: '先算6减2等于4，再算4加4等于8'
            }
        ]
    },
    {
        id: 5,
        title: '月球表面',
        icon: '🌑',
        desc: '陨石坑和月海',
        stories: [
            '月球表面有很多<span class="highlight">大坑</span>，叫做<span class="highlight">"陨石坑"</span>，是小行星撞出来的！',
            '月球上有一些<span class="highlight">暗色的大块区域</span>，古人以为是海，所以叫<span class="highlight">"月海"</span>。其实那里没有水，是很久以前岩浆冷却后的<span class="highlight">平原</span>。',
            '最大的陨石坑叫<span class="highlight">南极-艾特肯盆地</span>，直径有<span class="highlight">2500公里</span>，比中国一半还大！'
        ],
        hanzi: [
            { char: '山', pinyin: 'shān', words: '高山 · 山峰', sentence: '高高的山像巨人站着。', pictograph: 'drawMountain' },
            { char: '土', pinyin: 'tǔ', words: '泥土 · 土地', sentence: '泥土里长出了小苗。', pictograph: 'drawEarth' }
        ],
        quiz: {
            question: '月球上的大坑是怎么来的？',
            options: [
                { text: '人挖的', correct: false },
                { text: '风吹出来的', correct: false },
                { text: '小行星撞出来的', correct: true }
            ],
            hint: '月球上没有空气也没有风哦...'
        },
        math: [
            {
                type: 'choice',
                question: '月球上有2个大陨石坑和5个小陨石坑，一共几个？',
                options: [
                    { text: '7 个', correct: true },
                    { text: '6 个', correct: false },
                    { text: '8 个', correct: false }
                ],
                hint: '2 + 5 = ?'
            },
            {
                type: 'fillin',
                question: '探测器发现了10个陨石坑，有3个被探测过，还有几个没探测？',
                answer: 7,
                hint: '10 - 3 = ?'
            },
            {
                type: 'fillin',
                question: '月球表面有8个大陨石坑，宇宙射线填平了3个，还剩几个大陨石坑？',
                answer: 5,
                hint: '8减3等于5'
            },
            {
                type: 'sequential',
                question: '探测器发现了5个月海，又发现了3个新月海，后来证实其中2个不是月海，真正的月海有几个？',
                expression: '5 + 3 - 2',
                answer: 6,
                hint: '先算5加3等于8，再算8减2等于6'
            }
        ]
    },
    {
        id: 6,
        title: '没有空气',
        icon: '🌬️',
        desc: '月球上不能呼吸',
        stories: [
            '月球上<span class="highlight">没有空气</span>！所以在月球上，声音<span class="highlight">传不出去</span>，不管你怎么喊，旁边的人都听不到！',
            '白天月球表面温度可以到<span class="highlight">127度</span>，比开水还烫！晚上降到<span class="highlight">零下173度</span>，比北极还冷一百倍！',
            '所以宇航员要穿<span class="highlight">特殊的太空服</span>，里面有氧气、有水、还有调温系统，像穿着一个<span class="highlight">小房子</span>！'
        ],
        hanzi: [
            { char: '风', pinyin: 'fēng', words: '大风 · 风车', sentence: '大风把树叶吹得沙沙响。', pictograph: 'drawWind' },
            { char: '空', pinyin: 'kōng', words: '天空 · 太空', sentence: '天空中飘着白白的云朵。', pictograph: 'drawEmpty' }
        ],
        quiz: {
            question: '在月球上能听到声音吗？',
            options: [
                { text: '能听到', correct: false },
                { text: '听不到，因为没有空气', correct: true },
                { text: '只能听到一点点', correct: false }
            ],
            hint: '声音需要空气来传播...'
        },
        math: [
            {
                type: 'choice',
                question: '太空服有头盔、手套、靴子、背包和连体衣，一共几个部件？',
                options: [
                    { text: '4 个', correct: false },
                    { text: '6 个', correct: false },
                    { text: '5 个', correct: true }
                ],
                hint: '数一数：头盔1 + 手套1 + 靴子1 + 背包1 + 连体衣1'
            },
            {
                type: 'fillin',
                question: '宇航员带了7瓶氧气，用了4瓶，还剩几瓶？',
                answer: 3,
                hint: '7 - 4 = ?'
            },
            {
                type: 'fillin',
                question: '宇航员太空服里有7瓶氧气，用掉了2瓶，还剩几瓶氧气？',
                answer: 5,
                hint: '7减2等于5'
            },
            {
                type: 'sequential',
                question: '月球基地有4瓶氧气，补充了6瓶，宇航员用掉了3瓶，现在还有几瓶？',
                expression: '4 + 6 - 3',
                answer: 7,
                hint: '先算4加6等于10，再算10减3等于7'
            }
        ]
    }
];

// ============ 象形图绘制函数 ============
const pictographDrawers = {
    drawMoon(ctx, w, h) {
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath(); ctx.arc(w/2, h/2, 45, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fffaf5';
        ctx.beginPath(); ctx.arc(w/2+25, h/2-15, 35, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#E67E22';
        ctx.beginPath(); ctx.arc(w/2-15, h/2-5, 4, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#E67E22'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(w/2-8, h/2+12, 10, 0.3, Math.PI-0.3); ctx.stroke();
    },
    drawBig(ctx, w, h) {
        ctx.fillStyle = '#9B59B6';
        ctx.beginPath(); ctx.arc(w/2, 25, 15, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#9B59B6'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(w/2, 40); ctx.lineTo(w/2, 85); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(20, 55); ctx.lineTo(w/2, 55); ctx.lineTo(w-20, 55); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2, 85); ctx.lineTo(30, 125); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2, 85); ctx.lineTo(w-30, 125); ctx.stroke();
    },
    drawStone(ctx, w, h) {
        ctx.fillStyle = '#7F8C8D';
        ctx.beginPath();
        ctx.moveTo(30, h-30); ctx.quadraticCurveTo(20, h/2, 50, 35);
        ctx.quadraticCurveTo(80, 25, 100, 40);
        ctx.quadraticCurveTo(120, 60, 110, h-30); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#95A5A6';
        ctx.beginPath(); ctx.ellipse(65, 55, 20, 12, 0.3, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#BDC3C7';
        ctx.beginPath(); ctx.ellipse(80, 70, 8, 5, -0.2, 0, Math.PI*2); ctx.fill();
    },
    drawStar(ctx, w, h) {
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI / 5) - Math.PI/2;
            const x = w/2 + Math.cos(angle) * 45;
            const y = h/2 + Math.sin(angle) * 45;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.arc(w/2+10, h/2-15, 5, 0, Math.PI*2); ctx.fill();
    },
    drawSky(ctx, w, h) {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#87CEEB'); grad.addColorStop(1, '#E0F7FA');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath(); ctx.arc(100, 35, 20, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.arc(35, 50, 15, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(55, 45, 18, 0, Math.PI*2); ctx.fill();
    },
    drawGround(ctx, w, h) {
        // 地 - 大地+小苗
        const grad = ctx.createLinearGradient(0, h/2, 0, h);
        grad.addColorStop(0, '#8B6914'); grad.addColorStop(1, '#654321');
        ctx.fillStyle = grad;
        ctx.fillRect(10, h/2+10, w-20, h/2-20);
        // 草
        ctx.strokeStyle = '#27AE60'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        for (let i = 0; i < 5; i++) {
            const x = 25 + i * 25;
            ctx.beginPath(); ctx.moveTo(x, h/2+10); ctx.lineTo(x-5, h/2-10); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x, h/2+10); ctx.lineTo(x+5, h/2-15); ctx.stroke();
        }
    },
    drawPerson(ctx, w, h) {
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath(); ctx.arc(w/2, 35, 20, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#3498DB'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(w/2, 55); ctx.lineTo(w/2, 95); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2-25, 70); ctx.lineTo(w/2, 60); ctx.lineTo(w/2+25, 70); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2, 95); ctx.lineTo(w/2-20, 125); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w/2, 95); ctx.lineTo(w/2+20, 125); ctx.stroke();
    },
    drawFly(ctx, w, h) {
        // 飞 - 小鸟展翅
        ctx.fillStyle = '#3498DB';
        ctx.beginPath(); ctx.ellipse(w/2, h/2+5, 18, 12, 0, 0, Math.PI*2); ctx.fill();
        // 左翅
        ctx.beginPath();
        ctx.moveTo(w/2-10, h/2); ctx.quadraticCurveTo(w/2-40, h/2-35, w/2-55, h/2-15);
        ctx.quadraticCurveTo(w/2-35, h/2-5, w/2-10, h/2+5); ctx.fill();
        // 右翅
        ctx.beginPath();
        ctx.moveTo(w/2+10, h/2); ctx.quadraticCurveTo(w/2+40, h/2-35, w/2+55, h/2-15);
        ctx.quadraticCurveTo(w/2+35, h/2-5, w/2+10, h/2+5); ctx.fill();
        // 头
        ctx.fillStyle = '#2980B9';
        ctx.beginPath(); ctx.arc(w/2+15, h/2-2, 8, 0, Math.PI*2); ctx.fill();
        // 嘴
        ctx.fillStyle = '#F39C12';
        ctx.beginPath(); ctx.moveTo(w/2+23, h/2-2); ctx.lineTo(w/2+33, h/2); ctx.lineTo(w/2+23, h/2+2); ctx.closePath(); ctx.fill();
        // 眼
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.arc(w/2+17, h/2-4, 3, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(w/2+18, h/2-4, 1.5, 0, Math.PI*2); ctx.fill();
    },
    drawMountain(ctx, w, h) {
        ctx.fillStyle = '#2ECC71';
        ctx.beginPath(); ctx.moveTo(w/2, 20); ctx.lineTo(w/2+50, h-20); ctx.lineTo(w/2-50, h-20); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#27AE60';
        ctx.beginPath(); ctx.moveTo(w/2-30, 45); ctx.lineTo(w/2-30+35, h-20); ctx.lineTo(w/2-30-35, h-20); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(w/2+35, 50); ctx.lineTo(w/2+35+30, h-20); ctx.lineTo(w/2+35-30, h-20); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.moveTo(w/2, 20); ctx.lineTo(w/2+12, 40); ctx.lineTo(w/2-12, 40); ctx.closePath(); ctx.fill();
    },
    drawEarth(ctx, w, h) {
        ctx.fillStyle = '#D35400';
        ctx.beginPath();
        ctx.moveTo(15, h-25); ctx.lineTo(w-15, h-25);
        ctx.lineTo(w-35, h-55); ctx.lineTo(35, h-55); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#E67E22';
        ctx.fillRect(20, h-25, w-40, 15);
        ctx.strokeStyle = '#27AE60'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(w/2, h-55); ctx.lineTo(w/2, h-80); ctx.stroke();
        ctx.fillStyle = '#2ECC71';
        ctx.beginPath(); ctx.ellipse(w/2-8, h-80, 10, 6, -0.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(w/2+8, h-80, 10, 6, 0.5, 0, Math.PI*2); ctx.fill();
    },
    drawWind(ctx, w, h) {
        // 风 - 风吹树弯
        ctx.strokeStyle = '#5DADE2'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        for (let i = 0; i < 4; i++) {
            const y = 25 + i * 28;
            ctx.beginPath();
            ctx.moveTo(15, y);
            ctx.quadraticCurveTo(40, y - 12, 65, y);
            ctx.quadraticCurveTo(90, y + 12, 115, y - 5);
            ctx.stroke();
        }
        // 小叶子
        ctx.fillStyle = '#27AE60';
        ctx.beginPath(); ctx.ellipse(95, 40, 8, 5, -0.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(80, 80, 6, 4, 0.3, 0, Math.PI*2); ctx.fill();
    },
    drawEmpty(ctx, w, h) {
        // 空 - 天空穹顶
        const grad = ctx.createRadialGradient(w/2, h/2, 5, w/2, h/2, 55);
        grad.addColorStop(0, '#1a1a40');
        grad.addColorStop(1, '#0a0a20');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(w/2, h/2, 50, 0, Math.PI*2); ctx.fill();
        // 星星
        ctx.fillStyle = '#FFF';
        const starPositions = [[w/2-20, h/2-25], [w/2+15, h/2-30], [w/2+30, h/2], [w/2-30, h/2+10], [w/2+10, h/2+20], [w/2-15, h/2+30]];
        starPositions.forEach(([x, y]) => {
            ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI*2); ctx.fill();
        });
        // 弧形穹顶线
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(w/2, h/2+30, 45, Math.PI*1.2, Math.PI*1.8); ctx.stroke();
    }
};

// ============ 游戏状态 ============
let gameState = {
    completedChapters: [],  // 已完成的章节ID数组
    currentChapter: null,   // 当前正在进行的章节
    phase: 'menu',          // menu, story, hanzi, quiz, math
    mathQuestionIndex: 0    // 当前数学题索引（0-2）
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
const moonAudio = {
    correct: 'audio/moon/correct.mp3',
    finalBadge: 'audio/moon/final-badge.mp3',
    story: (chId, idx) => `audio/moon/ch${chId}-story-${idx}.mp3`,
    hanzi: (chId, idx) => `audio/moon/ch${chId}-hanzi-${idx}.mp3`,
    quiz: (chId) => `audio/moon/ch${chId}-quiz.mp3`,
    quizOption: (chId, optIdx) => `audio/moon/ch${chId}-quiz-${['a','b','c'][optIdx]}.mp3`,
    quizHint: (chId) => `audio/moon/ch${chId}-quiz-hint.mp3`,
    math: (chId, qIdx) => qIdx > 0 ? `audio/moon/ch${chId}-math-${qIdx + 1}.mp3` : `audio/moon/ch${chId}-math.mp3`,
    mathHint: (chId, qIdx) => qIdx > 0 ? `audio/moon/ch${chId}-math-${qIdx + 1}-hint.mp3` : `audio/moon/ch${chId}-math-hint.mp3`,
    complete: (chId) => `audio/moon/ch${chId}-complete.mp3`
};

// ============ 存档 ============
function saveProgress() {
    localStorage.setItem('moonExplorer', JSON.stringify({
        completedChapters: gameState.completedChapters
    }));
}

function loadProgress() {
    try {
        const data = JSON.parse(localStorage.getItem('moonExplorer'));
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
    createMoon();
    createEarthReference();
    addLights();

    window.addEventListener('resize', onWindowResize);

    // 纹理加载检测
    const checkLoaded = setInterval(() => {
        if (moonMesh && moonMesh.material && moonMesh.material.uniforms &&
            moonMesh.material.uniforms.planetTexture.value.image) {
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

// ============ 创建月球 ============
function createMoon() {
    const geometry = new THREE.SphereGeometry(6, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const moonMap = textureLoader.load('textures/moon.jpg');

    const moonMaterial = new THREE.ShaderMaterial({
        uniforms: {
            planetTexture: { value: moonMap },
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

                // Fresnel 边缘微光
                vec3 viewDir = normalize(cameraPosition - vWorldPos);
                float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
                surfaceColor += vec3(0.6, 0.6, 0.7) * fresnel * 0.15;

                gl_FragColor = vec4(surfaceColor, 1.0);
            }
        `
    });

    moonMesh = new THREE.Mesh(geometry, moonMaterial);
    scene.add(moonMesh);
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
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load('textures/earth_daymap.jpg');

    const material = new THREE.MeshPhongMaterial({
        map: earthMap,
        shininess: 25
    });

    earthRef = new THREE.Mesh(geometry, material);
    earthRef.position.set(-40, 15, -30);
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

    // 月球缓慢自转
    if (moonMesh) {
        moonMesh.rotation.y += delta * 0.05;
        if (moonMesh.material.uniforms) {
            moonMesh.material.uniforms.time.value = elapsed;
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
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad

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
        // 引力 - 正面近景
        animateCameraTo({ x: 0, y: 2, z: 16 }, { x: 0, y: 0, z: 0 });
    },
    2: () => {
        // 大碰撞 - 侧面远景
        animateCameraTo({ x: 15, y: 8, z: 15 }, { x: 0, y: 0, z: 0 });
    },
    3: () => {
        // 潮汐锁定 - 能看到远处地球
        animateCameraTo({ x: -10, y: 10, z: 20 }, { x: 0, y: 0, z: 0 });
    },
    4: () => {
        // 登月 - 月面近景
        animateCameraTo({ x: 3, y: -1, z: 12 }, { x: 0, y: -2, z: 0 });
    },
    5: () => {
        // 表面特征 - 推近月面
        animateCameraTo({ x: -2, y: 1, z: 13 }, { x: -2, y: 0, z: 0 });
    },
    6: () => {
        // 没有空气 - 远景全貌
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
        star.onclick = () => {
            // 可以点击跳回章节菜单查看
        };
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
    document.getElementById('storyTag').textContent = `第${ch.id}章 · ${ch.title}`;

    // 渲染故事内容
    const storyHtml = ch.stories[storyIndex];
    document.getElementById('storyText').innerHTML = storyHtml;

    // 语音朗读（Edge-TTS MP3，fallback 到 Web Speech）
    const plainText = storyHtml.replace(/<[^>]*>/g, '');
    playAudio(moonAudio.story(ch.id, storyIndex + 1), plainText);

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
        // 进入汉字学习
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

    // 绘制象形图
    const canvas = document.getElementById('hanziPictograph');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (hanzi.pictograph && pictographDrawers[hanzi.pictograph]) {
        pictographDrawers[hanzi.pictograph](ctx, canvas.width, canvas.height);
    }

    // 语音
    const hanziText = `${hanzi.char}，${hanzi.pinyin}，${hanzi.words.replace(/·/g, '，')}。${hanzi.sentence}`;
    playAudio(moonAudio.hanzi(ch.id, hanziIndex + 1), hanziText);

    // 按钮文字
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
        // 进入知识测验
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
    playAudio(moonAudio.quiz(ch.id), fullText);

    const optionsDiv = document.getElementById('quizOptions');
    optionsDiv.innerHTML = '';

    ch.quiz.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        const safeText = opt.text.replace(/'/g, "\\'");
        btn.innerHTML = `<span class="opt-label">${labels[i]}</span><span class="opt-text">${opt.text}</span><span class="opt-sound" onclick="event.stopPropagation(); playAudio(moonAudio.quizOption(${ch.id}, ${i}), '${labels[i]}，${safeText}')">&#128264;</span>`;
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

    const audioPath = moonAudio.math(ch.id, qIdx);

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
        playAudio(moonAudio.correct, '太棒了！回答正确！');

        setTimeout(() => {
            document.getElementById('quizPanel').classList.remove('visible');

            if (gameState.phase === 'quiz') {
                // 知识测验答对 → 进入数学挑战
                gameState.phase = 'math';
                gameState.mathQuestionIndex = 0;
                const ch = chaptersData.find(c => c.id === chId);
                setTimeout(() => showMath(ch), 500);
            } else if (gameState.phase === 'math') {
                // 数学挑战答对 → 下一题或章节完成
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
            ? moonAudio.mathHint(chId, gameState.mathQuestionIndex)
            : moonAudio.quizHint(chId);
        playAudio(hintAudioPath, hint || '再想一想！');

        // 1秒后重置
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

    // 星星飘落特效
    triggerStarFall();

    // 显示奖励
    const ch = chaptersData.find(c => c.id === chId);
    document.getElementById('rewardIcon').textContent = '⭐';
    document.getElementById('rewardTitle').textContent = `第${chId}章完成！`;
    document.getElementById('rewardDesc').textContent = `「${ch.title}」探险成功！你获得了一颗星星！`;
    playAudio(moonAudio.complete(chId), `太厉害了！第${chId}章，${ch.title}，探险成功！你获得了一颗星星！`);

    document.getElementById('rewardPopup').classList.add('visible');
}

// ============ 关闭奖励弹窗 ============
function closeReward() {
    document.getElementById('rewardPopup').classList.remove('visible');

    // 检查是否全部完成
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
    playAudio(moonAudio.finalBadge, '恭喜智天！你完成了全部6个章节的月球探险！你获得了月球探险家大徽章！');
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

    // 初始化星星特效canvas尺寸
    const sfCanvas = document.getElementById('starFallCanvas');
    sfCanvas.width = window.innerWidth;
    sfCanvas.height = window.innerHeight;
}

// 页面加载后启动
window.addEventListener('DOMContentLoaded', start);
