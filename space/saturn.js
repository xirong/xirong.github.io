/**
 * 土星探险家 - 柳智天的宇宙课堂
 * 6大章节闯关：科普故事 → 汉字学习 → 知识测验 → 数学挑战 → 获得星星
 */

// ============ 全局变量 ============
let scene, camera, renderer, controls;
let saturnMesh, saturnRing, saturnGroup, earthRef, starField;
let clock;

// ============ 章节数据 ============
const chaptersData = [
    {
        id: 1,
        title: '美丽的光环',
        icon: '💍',
        desc: '土星最有名的光环',
        stories: [
            '土星最有名的就是它<span class="highlight">美丽的光环</span>！光环看起来像一个大大的帽檐。',
            '土星环是由无数<span class="highlight">冰块和岩石</span>组成的，大的像房子，小的像沙粒。',
            '这些冰块和石头围绕土星<span class="highlight">高速旋转</span>，看起来就像一个巨大的唱片！'
        ],
        hanzi: [
            { char: '圆', pinyin: 'yuán', words: '圆形 · 团圆', sentence: '中秋节的月亮又大又圆。', pictograph: 'drawCircle' },
            { char: '方', pinyin: 'fāng', words: '方形 · 方向', sentence: '积木有圆的也有方的。', pictograph: 'drawSquare' }
        ],
        quiz: {
            question: '土星环是由什么组成的？',
            options: [
                { text: '冰块和岩石', correct: true },
                { text: '彩虹', correct: false },
                { text: '云朵', correct: false }
            ],
            hint: '想想那些大大小小的冰块...'
        },
        math: [
            {
                type: 'choice',
                question: '土星环有3层明亮的环和4层暗淡的环，一共几层？',
                options: [
                    { text: '6层', correct: false },
                    { text: '7层', correct: true },
                    { text: '8层', correct: false }
                ],
                hint: '3 + 4 = ?'
            },
            {
                type: 'fillin',
                question: '土星环上有8块大冰块，碎掉了2块，还剩几块？',
                answer: 6,
                hint: '8 - 2 = 6'
            },
            {
                type: 'fillin',
                question: '土星环上有7块大冰块，又飞来了3块，现在一共几块？',
                answer: 10,
                hint: '7加3等于10'
            },
            {
                type: 'sequential',
                question: '土星环上有8块冰块，碎了3块，又飘来了2块，现在有几块？',
                expression: '8 - 3 + 2',
                answer: 7,
                hint: '先算8减3等于5，再算5加2等于7'
            }
        ]
    },
    {
        id: 2,
        title: '密度最小',
        icon: '🏊',
        desc: '能浮在水上的星球',
        stories: [
            '土星有一个超级有趣的特点——它的密度比水还<span class="highlight">小</span>！',
            '如果有一个足够大的游泳池，把土星放进去，它会<span class="highlight">浮在水面上</span>！',
            '这是因为土星主要由<span class="highlight">氢气和氦气</span>组成，非常非常轻。'
        ],
        hanzi: [
            { char: '小', pinyin: 'xiǎo', words: '大小 · 小鸟', sentence: '小蚂蚁搬着大米粒。', pictograph: 'drawSmall' },
            { char: '中', pinyin: 'zhōng', words: '中间 · 中国', sentence: '我站在小朋友中间。', pictograph: 'drawMiddle' }
        ],
        quiz: {
            question: '把土星放进水里会怎样？',
            options: [
                { text: '沉到底', correct: false },
                { text: '溶化掉', correct: false },
                { text: '浮在水面上', correct: true }
            ],
            hint: '土星的密度比水还小呢！'
        },
        math: [
            {
                type: 'choice',
                question: '游泳池里有8个球，沉下去了3个，浮着的有几个？',
                options: [
                    { text: '5个', correct: true },
                    { text: '4个', correct: false },
                    { text: '6个', correct: false }
                ],
                hint: '8 - 3 = ?'
            },
            {
                type: 'fillin',
                question: '土星的密度很小，如果放4个土星和3个木星进游泳池，一共放了几个星球？',
                answer: 7,
                hint: '4 + 3 = 7'
            },
            {
                type: 'fillin',
                question: '游泳池里放了4个土星，又放了3个土星，一共放了几个？',
                answer: 7,
                hint: '4加3等于7'
            },
            {
                type: 'sequential',
                question: '游泳池里有9个球，沉下去3个，又浮上来2个，现在浮着几个？',
                expression: '9 - 3 + 2',
                answer: 8,
                hint: '先算9减3等于6，再算6加2等于8'
            }
        ]
    },
    {
        id: 3,
        title: '土星的风',
        icon: '🌪️',
        desc: '超级大风和六边形旋风',
        stories: [
            '土星上的风速快得吓人，最快能到每小时<span class="highlight">1800公里</span>！',
            '这比地球上最快的飞机还要快<span class="highlight">好几倍</span>！',
            '在土星的两极还有<span class="highlight">六边形的旋风</span>，形状特别奇怪，像一个巨大的蜂巢！'
        ],
        hanzi: [
            { char: '上', pinyin: 'shàng', words: '上面 · 上课', sentence: '小鸟飞到树上去。', pictograph: 'drawUp' },
            { char: '下', pinyin: 'xià', words: '下面 · 下雨', sentence: '雨滴从天上掉下来。', pictograph: 'drawDown' }
        ],
        quiz: {
            question: '土星两极的旋风是什么形状？',
            options: [
                { text: '圆形', correct: false },
                { text: '六边形', correct: true },
                { text: '三角形', correct: false }
            ],
            hint: '像蜂巢的形状...'
        },
        math: [
            {
                type: 'choice',
                question: '土星刮了2天大风，又刮了6天小风，一共刮了几天？',
                options: [
                    { text: '7天', correct: false },
                    { text: '9天', correct: false },
                    { text: '8天', correct: true }
                ],
                hint: '2 + 6 = ?'
            },
            {
                type: 'fillin',
                question: '六边形旋风有6条边，普通旋风有0条边，它们相差几条边？',
                answer: 6,
                hint: '6 - 0 = 6'
            },
            {
                type: 'fillin',
                question: '土星风暴刮了6条边，停下了0条，还有几条在转？',
                answer: 6,
                hint: '6减0等于6'
            },
            {
                type: 'sequential',
                question: '土星有4个大风暴，又来了5个，平息了3个，现在有几个？',
                expression: '4 + 5 - 3',
                answer: 6,
                hint: '先算4加5等于9，再算9减3等于6'
            }
        ]
    },
    {
        id: 4,
        title: '神秘的土卫六',
        icon: '🌫️',
        desc: '有湖泊的卫星',
        stories: [
            '土卫六是土星最大的卫星，也叫<span class="highlight">"泰坦"</span>。',
            '它有厚厚的大气层，是太阳系中除了地球以外唯一有<span class="highlight">浓厚大气</span>的卫星。',
            '土卫六上有湖泊和河流，但不是水，而是<span class="highlight">液态的甲烷</span>！'
        ],
        hanzi: [
            { char: '里', pinyin: 'lǐ', words: '里面 · 家里', sentence: '盒子里面有什么呢？', pictograph: 'drawInside' },
            { char: '外', pinyin: 'wài', words: '外面 · 外婆', sentence: '外面的世界真精彩。', pictograph: 'drawOutside' }
        ],
        quiz: {
            question: '土卫六上的湖泊是什么做的？',
            options: [
                { text: '液态甲烷', correct: true },
                { text: '水', correct: false },
                { text: '岩浆', correct: false }
            ],
            hint: '不是水哦，是一种特殊的液体...'
        },
        math: [
            {
                type: 'choice',
                question: '土卫六有2片大湖和4片小湖，一共几片？',
                options: [
                    { text: '5片', correct: false },
                    { text: '6片', correct: true },
                    { text: '7片', correct: false }
                ],
                hint: '2 + 4 = ?'
            },
            {
                type: 'fillin',
                question: '土卫六上有9条甲烷河流，干涸了4条，还有几条在流动？',
                answer: 5,
                hint: '9 - 4 = 5'
            },
            {
                type: 'fillin',
                question: '土卫六上有7条甲烷河，又出现了2条新的，一共有几条？',
                answer: 9,
                hint: '7加2等于9'
            },
            {
                type: 'sequential',
                question: '土卫六有8片湖，干涸了3片，又新生成了2片，现在有几片？',
                expression: '8 - 3 + 2',
                answer: 7,
                hint: '先算8减3等于5，再算5加2等于7'
            }
        ]
    },
    {
        id: 5,
        title: '土星的卫星',
        icon: '🌕',
        desc: '80多颗卫星的大家族',
        stories: [
            '土星有<span class="highlight">80多颗卫星</span>，是太阳系中卫星第二多的行星！',
            '除了土卫六，还有一颗很特别的卫星叫<span class="highlight">土卫二</span>。',
            '土卫二的南极会喷出<span class="highlight">冰的喷泉</span>！科学家觉得冰下面可能有温暖的海洋。'
        ],
        hanzi: [
            { char: '花', pinyin: 'huā', words: '花朵 · 开花', sentence: '春天百花齐开放。', pictograph: 'drawFlower' },
            { char: '美', pinyin: 'měi', words: '美丽 · 美好', sentence: '夜空的星星真美。', pictograph: 'drawBeauty' }
        ],
        quiz: {
            question: '土卫二有什么特别之处？',
            options: [
                { text: '有火山', correct: false },
                { text: '有森林', correct: false },
                { text: '会喷冰的喷泉', correct: true }
            ],
            hint: '南极有什么特殊的东西喷出来？'
        },
        math: [
            {
                type: 'choice',
                question: '我们发现了4颗有冰的卫星和2颗没冰的，一共几颗？',
                options: [
                    { text: '6颗', correct: true },
                    { text: '5颗', correct: false },
                    { text: '7颗', correct: false }
                ],
                hint: '4 + 2 = ?'
            },
            {
                type: 'fillin',
                question: '土卫二喷出了10股冰泉，停了3股，还在喷的有几股？',
                answer: 7,
                hint: '10 - 3 = 7'
            },
            {
                type: 'fillin',
                question: '土卫二喷出5股冰泉，土卫六喷出3股甲烷，一共几股？',
                answer: 8,
                hint: '5加3等于8'
            },
            {
                type: 'sequential',
                question: '土卫二有9股冰泉，停了4股，又喷出2股，现在有几股？',
                expression: '9 - 4 + 2',
                answer: 7,
                hint: '先算9减4等于5，再算5加2等于7'
            }
        ]
    },
    {
        id: 6,
        title: '卡西尼号探测器',
        icon: '🛰️',
        desc: '探索土星的太空使者',
        stories: [
            '人类派了一个叫<span class="highlight">"卡西尼号"</span>的探测器去研究土星！',
            '它飞了<span class="highlight">7年</span>才到土星，在那里工作了<span class="highlight">13年</span>！',
            '最后卡西尼号冲进了土星的大气层，像一颗<span class="highlight">流星</span>一样消失了，完成了它的使命。'
        ],
        hanzi: [
            { char: '冰', pinyin: 'bīng', words: '冰块 · 冰激凌', sentence: '冬天河面结了厚厚的冰。', pictograph: 'drawIce' },
            { char: '石', pinyin: 'shí', words: '石头 · 岩石', sentence: '河边有很多圆圆的石头。', pictograph: 'drawStone' }
        ],
        quiz: {
            question: '卡西尼号最后怎么了？',
            options: [
                { text: '飞回了地球', correct: false },
                { text: '冲进了土星大气层', correct: true },
                { text: '飞到了其他星球', correct: false }
            ],
            hint: '它像流星一样完成了使命...'
        },
        math: [
            {
                type: 'choice',
                question: '卡西尼号拍了5张土星照片和4张卫星照片，一共几张？',
                options: [
                    { text: '8张', correct: false },
                    { text: '10张', correct: false },
                    { text: '9张', correct: true }
                ],
                hint: '5 + 4 = ?'
            },
            {
                type: 'fillin',
                question: '卡西尼号飞了7年到土星，中途休息了0年，实际飞行几年？',
                answer: 7,
                hint: '7 - 0 = 7'
            },
            {
                type: 'fillin',
                question: '卡西尼号飞行了7年，中途检查了2次设备，还剩几年没检查？',
                answer: 5,
                hint: '7减2等于5'
            },
            {
                type: 'sequential',
                question: '卡西尼号拍了5张土星照片，又拍了3张，发回了4张，还剩几张？',
                expression: '5 + 3 - 4',
                answer: 4,
                hint: '先算5加3等于8，再算8减4等于4'
            }
        ]
    }
];

// ============ 象形图绘制函数 ============
const pictographDrawers = {
    drawCircle(ctx, w, h) {
        // 圆 - 一个完美的圆
        ctx.strokeStyle = '#F4D03F';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 40, 0, Math.PI * 2);
        ctx.stroke();
        // 中心点
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 6, 0, Math.PI * 2);
        ctx.fill();
        // 月饼装饰
        ctx.fillStyle = '#E8D5A3';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#C4A96A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 20, h / 2);
        ctx.lineTo(w / 2 + 20, h / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2 - 20);
        ctx.lineTo(w / 2, h / 2 + 20);
        ctx.stroke();
    },
    drawSquare(ctx, w, h) {
        // 方 - 积木方块
        ctx.fillStyle = '#3498DB';
        ctx.fillRect(w / 2 - 30, h / 2 - 30, 60, 60);
        ctx.strokeStyle = '#2980B9';
        ctx.lineWidth = 3;
        ctx.strokeRect(w / 2 - 30, h / 2 - 30, 60, 60);
        // 3D效果
        ctx.fillStyle = '#5DADE2';
        ctx.beginPath();
        ctx.moveTo(w / 2 - 30, h / 2 - 30);
        ctx.lineTo(w / 2 - 20, h / 2 - 40);
        ctx.lineTo(w / 2 + 40, h / 2 - 40);
        ctx.lineTo(w / 2 + 30, h / 2 - 30);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#2471A3';
        ctx.beginPath();
        ctx.moveTo(w / 2 + 30, h / 2 - 30);
        ctx.lineTo(w / 2 + 40, h / 2 - 40);
        ctx.lineTo(w / 2 + 40, h / 2 + 20);
        ctx.lineTo(w / 2 + 30, h / 2 + 30);
        ctx.closePath();
        ctx.fill();
    },
    drawSmall(ctx, w, h) {
        // 小 - 小蚂蚁
        ctx.fillStyle = '#8B4513';
        // 身体
        ctx.beginPath();
        ctx.ellipse(w / 2, h / 2 + 5, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // 头
        ctx.beginPath();
        ctx.arc(w / 2 + 15, h / 2, 7, 0, Math.PI * 2);
        ctx.fill();
        // 触角
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w / 2 + 20, h / 2 - 5);
        ctx.lineTo(w / 2 + 28, h / 2 - 15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w / 2 + 18, h / 2 - 6);
        ctx.lineTo(w / 2 + 24, h / 2 - 18);
        ctx.stroke();
        // 腿
        for (let i = 0; i < 3; i++) {
            const x = w / 2 - 8 + i * 8;
            ctx.beginPath();
            ctx.moveTo(x, h / 2 + 10);
            ctx.lineTo(x - 5, h / 2 + 25);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, h / 2 + 10);
            ctx.lineTo(x + 5, h / 2 + 25);
            ctx.stroke();
        }
        // 大米粒
        ctx.fillStyle = '#FFF8DC';
        ctx.beginPath();
        ctx.ellipse(w / 2 - 20, h / 2 - 5, 10, 5, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // "小" 标注
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '12px Noto Sans SC';
        ctx.fillText('小', w / 2 + 30, h / 2 + 35);
    },
    drawMiddle(ctx, w, h) {
        // 中 - 中间的小人
        // 左右小人
        ctx.fillStyle = '#AED6F1';
        ctx.beginPath();
        ctx.arc(25, h / 2 - 10, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(20, h / 2, 10, 20);
        ctx.fillStyle = '#AED6F1';
        ctx.beginPath();
        ctx.arc(w - 25, h / 2 - 10, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(w - 30, h / 2, 10, 20);
        // 中间小人（突出）
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2 - 15, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(w / 2 - 8, h / 2, 16, 25);
        // 箭头指向中间
        ctx.strokeStyle = '#E74C3C';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(45, h / 2);
        ctx.lineTo(w / 2 - 20, h / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w - 45, h / 2);
        ctx.lineTo(w / 2 + 20, h / 2);
        ctx.stroke();
    },
    drawUp(ctx, w, h) {
        // 上 - 小鸟飞上树
        // 树干
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(w / 2 - 8, h / 2 - 10, 16, h / 2 + 10);
        // 树叶
        ctx.fillStyle = '#27AE60';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2 - 20, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2ECC71';
        ctx.beginPath();
        ctx.arc(w / 2 - 15, h / 2 - 10, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(w / 2 + 15, h / 2 - 10, 18, 0, Math.PI * 2);
        ctx.fill();
        // 小鸟飞上去
        ctx.fillStyle = '#3498DB';
        ctx.beginPath();
        ctx.ellipse(w / 2 + 30, h / 2 - 35, 8, 5, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // 翅膀
        ctx.beginPath();
        ctx.moveTo(w / 2 + 25, h / 2 - 38);
        ctx.quadraticCurveTo(w / 2 + 15, h / 2 - 50, w / 2 + 20, h / 2 - 45);
        ctx.stroke();
        // 向上箭头
        ctx.strokeStyle = '#F4D03F';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(w / 2 + 35, h / 2 - 25);
        ctx.lineTo(w / 2 + 35, h / 2 - 45);
        ctx.lineTo(w / 2 + 30, h / 2 - 40);
        ctx.moveTo(w / 2 + 35, h / 2 - 45);
        ctx.lineTo(w / 2 + 40, h / 2 - 40);
        ctx.stroke();
    },
    drawDown(ctx, w, h) {
        // 下 - 雨滴掉下来
        // 乌云
        ctx.fillStyle = '#7F8C8D';
        ctx.beginPath();
        ctx.arc(w / 2, 30, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(w / 2 - 18, 35, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(w / 2 + 18, 35, 15, 0, Math.PI * 2);
        ctx.fill();
        // 雨滴
        ctx.fillStyle = '#5DADE2';
        const drops = [[w / 2 - 15, 60], [w / 2, 75], [w / 2 + 15, 65], [w / 2 - 8, 90], [w / 2 + 8, 95]];
        drops.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.moveTo(x, y - 8);
            ctx.quadraticCurveTo(x + 5, y, x, y + 5);
            ctx.quadraticCurveTo(x - 5, y, x, y - 8);
            ctx.fill();
        });
        // 地面水坑
        ctx.fillStyle = '#3498DB';
        ctx.beginPath();
        ctx.ellipse(w / 2, h - 20, 35, 8, 0, 0, Math.PI * 2);
        ctx.fill();
    },
    drawInside(ctx, w, h) {
        // 里 - 盒子里面
        ctx.strokeStyle = '#E67E22';
        ctx.lineWidth = 4;
        ctx.strokeRect(w / 2 - 35, h / 2 - 25, 70, 55);
        // 盒盖
        ctx.beginPath();
        ctx.moveTo(w / 2 - 40, h / 2 - 25);
        ctx.lineTo(w / 2, h / 2 - 45);
        ctx.lineTo(w / 2 + 40, h / 2 - 25);
        ctx.stroke();
        // 里面的小星星
        ctx.fillStyle = '#F4D03F';
        ctx.font = '24px serif';
        ctx.textAlign = 'center';
        ctx.fillText('⭐', w / 2, h / 2 + 15);
        // 问号
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '16px Noto Sans SC';
        ctx.fillText('?', w / 2 + 20, h / 2 + 5);
    },
    drawOutside(ctx, w, h) {
        // 外 - 外面的世界
        // 房子框
        ctx.strokeStyle = '#95A5A6';
        ctx.lineWidth = 3;
        ctx.strokeRect(15, h / 2 - 15, 45, 40);
        // 屋顶
        ctx.beginPath();
        ctx.moveTo(10, h / 2 - 15);
        ctx.lineTo(37, h / 2 - 35);
        ctx.lineTo(65, h / 2 - 15);
        ctx.stroke();
        // 门
        ctx.fillStyle = '#7F8C8D';
        ctx.fillRect(30, h / 2 + 5, 15, 20);
        // 外面的太阳
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.arc(100, 30, 15, 0, Math.PI * 2);
        ctx.fill();
        // 光线
        ctx.strokeStyle = '#F4D03F';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            const angle = i * Math.PI / 3;
            ctx.beginPath();
            ctx.moveTo(100 + Math.cos(angle) * 18, 30 + Math.sin(angle) * 18);
            ctx.lineTo(100 + Math.cos(angle) * 25, 30 + Math.sin(angle) * 25);
            ctx.stroke();
        }
        // 树
        ctx.fillStyle = '#27AE60';
        ctx.beginPath();
        ctx.arc(95, h / 2 - 10, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(92, h / 2 + 5, 6, 20);
        // 箭头指向外
        ctx.strokeStyle = '#E74C3C';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(60, h / 2 + 5);
        ctx.lineTo(80, h / 2 + 5);
        ctx.lineTo(75, h / 2);
        ctx.moveTo(80, h / 2 + 5);
        ctx.lineTo(75, h / 2 + 10);
        ctx.stroke();
    },
    drawFlower(ctx, w, h) {
        // 花 - 美丽的花朵
        const cx = w / 2, cy = h / 2;
        // 花瓣
        const colors = ['#E74C3C', '#F39C12', '#9B59B6', '#3498DB', '#E91E63'];
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const px = cx + Math.cos(angle) * 22;
            const py = cy + Math.sin(angle) * 22;
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.arc(px, py, 15, 0, Math.PI * 2);
            ctx.fill();
        }
        // 花心
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.fill();
        // 茎
        ctx.strokeStyle = '#27AE60';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 30);
        ctx.lineTo(cx, h - 10);
        ctx.stroke();
        // 叶子
        ctx.fillStyle = '#2ECC71';
        ctx.beginPath();
        ctx.ellipse(cx + 15, cy + 45, 12, 6, 0.5, 0, Math.PI * 2);
        ctx.fill();
    },
    drawBeauty(ctx, w, h) {
        // 美 - 星空之美
        const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, 55);
        grad.addColorStop(0, '#1a1a40');
        grad.addColorStop(1, '#0a0a20');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 50, 0, Math.PI * 2);
        ctx.fill();
        // 星星们
        ctx.fillStyle = '#F4D03F';
        const starPositions = [[35, 30], [90, 25], [65, 55], [40, 80], [100, 70], [70, 100], [25, 60], [110, 45]];
        starPositions.forEach(([x, y], i) => {
            const size = i % 3 === 0 ? 3 : 2;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        });
        // 大星星（五角星）
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
            const x = w / 2 + Math.cos(angle) * 18;
            const y = h / 2 + Math.sin(angle) * 18;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    },
    drawIce(ctx, w, h) {
        // 冰 - 冰块
        ctx.fillStyle = '#AED6F1';
        // 冰块形状
        ctx.beginPath();
        ctx.moveTo(w / 2 - 25, h / 2 + 20);
        ctx.lineTo(w / 2 - 30, h / 2 - 15);
        ctx.lineTo(w / 2 - 10, h / 2 - 30);
        ctx.lineTo(w / 2 + 15, h / 2 - 25);
        ctx.lineTo(w / 2 + 30, h / 2 - 10);
        ctx.lineTo(w / 2 + 25, h / 2 + 20);
        ctx.closePath();
        ctx.fill();
        // 反光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(w / 2 - 15, h / 2 - 20);
        ctx.lineTo(w / 2 - 5, h / 2 - 25);
        ctx.lineTo(w / 2 + 5, h / 2 - 15);
        ctx.lineTo(w / 2 - 5, h / 2 - 10);
        ctx.closePath();
        ctx.fill();
        // 碎冰
        ctx.fillStyle = '#D6EAF8';
        ctx.beginPath();
        ctx.moveTo(w / 2 + 35, h / 2 + 10);
        ctx.lineTo(w / 2 + 45, h / 2 + 5);
        ctx.lineTo(w / 2 + 45, h / 2 + 18);
        ctx.closePath();
        ctx.fill();
        // 冷气效果
        ctx.strokeStyle = 'rgba(174, 214, 241, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(w / 2 - 10, h / 2 + 25);
        ctx.quadraticCurveTo(w / 2, h / 2 + 35, w / 2 + 10, h / 2 + 28);
        ctx.stroke();
        ctx.setLineDash([]);
    },
    drawStone(ctx, w, h) {
        // 石 - 石头
        ctx.fillStyle = '#7F8C8D';
        ctx.beginPath();
        ctx.moveTo(30, h - 30);
        ctx.quadraticCurveTo(20, h / 2, 50, 35);
        ctx.quadraticCurveTo(80, 25, 100, 40);
        ctx.quadraticCurveTo(120, 60, 110, h - 30);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#95A5A6';
        ctx.beginPath();
        ctx.ellipse(65, 55, 20, 12, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#BDC3C7';
        ctx.beginPath();
        ctx.ellipse(80, 70, 8, 5, -0.2, 0, Math.PI * 2);
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
const saturnAudio = {
    correct: 'audio/saturn/correct.mp3',
    finalBadge: 'audio/saturn/final-badge.mp3',
    story: (chId, idx) => `audio/saturn/ch${chId}-story-${idx}.mp3`,
    hanzi: (chId, idx) => `audio/saturn/ch${chId}-hanzi-${idx}.mp3`,
    quiz: (chId) => `audio/saturn/ch${chId}-quiz.mp3`,
    quizOption: (chId, optIdx) => `audio/saturn/ch${chId}-quiz-${['a','b','c'][optIdx]}.mp3`,
    quizHint: (chId) => `audio/saturn/ch${chId}-quiz-hint.mp3`,
    math: (chId, qIdx) => qIdx > 0 ? `audio/saturn/ch${chId}-math-${qIdx + 1}.mp3` : `audio/saturn/ch${chId}-math.mp3`,
    mathHint: (chId, qIdx) => qIdx > 0 ? `audio/saturn/ch${chId}-math-${qIdx + 1}-hint.mp3` : `audio/saturn/ch${chId}-math-hint.mp3`,
    complete: (chId) => `audio/saturn/ch${chId}-complete.mp3`
};

// ============ 存档 ============
function saveProgress() {
    localStorage.setItem('saturnExplorer', JSON.stringify({
        completedChapters: gameState.completedChapters
    }));
}

function loadProgress() {
    try {
        const data = JSON.parse(localStorage.getItem('saturnExplorer'));
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
    camera.position.set(0, 8, 25);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 14;
    controls.maxDistance = 55;
    controls.enablePan = false;

    createStarfield();
    createSaturn();
    createEarthReference();
    addLights();

    window.addEventListener('resize', onWindowResize);

    // 纹理加载检测
    const checkLoaded = setInterval(() => {
        if (saturnMesh && saturnMesh.material && saturnMesh.material.uniforms &&
            saturnMesh.material.uniforms.planetTexture.value.image) {
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

// ============ 创建土星（球体+光环） ============
function createSaturn() {
    // 土星组（球体+环一起倾斜）
    saturnGroup = new THREE.Group();

    const textureLoader = new THREE.TextureLoader();
    const saturnMap = textureLoader.load('textures/saturn.jpg');

    // 土星球体
    const geometry = new THREE.SphereGeometry(6, 64, 64);
    const saturnMaterial = new THREE.ShaderMaterial({
        uniforms: {
            planetTexture: { value: saturnMap },
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
                surfaceColor *= 1.15;

                // 光照
                vec3 lightDir = normalize(sunDirection);
                float diff = max(dot(vNormal, lightDir), 0.0);
                float ambient = 0.12;
                surfaceColor *= (diff * 0.85 + ambient);

                // Fresnel 弱黄色大气边缘光
                vec3 viewDir = normalize(cameraPosition - vWorldPos);
                float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
                surfaceColor += vec3(0.8, 0.7, 0.4) * fresnel * 0.15;

                gl_FragColor = vec4(surfaceColor, 1.0);
            }
        `
    });

    saturnMesh = new THREE.Mesh(geometry, saturnMaterial);
    saturnGroup.add(saturnMesh);

    // 土星环
    const ringTexture = textureLoader.load('textures/saturn_ring.png');
    const innerRadius = 7.5;
    const outerRadius = 14;
    const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 128);

    // 修正UV让纹理正确映射到环上
    const pos = ringGeo.attributes.position;
    const uv = ringGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
        const dist = Math.sqrt(x * x + y * y);
        uv.setXY(i, (dist - innerRadius) / (outerRadius - innerRadius), 0.5);
    }

    const ringMat = new THREE.MeshBasicMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
    });

    saturnRing = new THREE.Mesh(ringGeo, ringMat);
    saturnRing.rotation.x = -Math.PI / 2; // 平放
    saturnGroup.add(saturnRing);

    // 整体倾斜约27度
    saturnGroup.rotation.z = THREE.MathUtils.degToRad(27);

    scene.add(saturnGroup);
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

    const material = new THREE.MeshPhongMaterial({
        map: earthMap,
        shininess: 25
    });

    earthRef = new THREE.Mesh(geometry, material);
    earthRef.position.set(-45, 20, -35);
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

    // 土星缓慢自转
    if (saturnMesh) {
        saturnMesh.rotation.y += delta * 0.08;
        if (saturnMesh.material.uniforms) {
            saturnMesh.material.uniforms.time.value = elapsed;
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
        // 光环 - 侧面看环
        animateCameraTo({ x: 10, y: 5, z: 20 }, { x: 0, y: 0, z: 0 });
    },
    2: () => {
        // 密度 - 正面近景
        animateCameraTo({ x: 0, y: 2, z: 18 }, { x: 0, y: 0, z: 0 });
    },
    3: () => {
        // 大风 - 俯视看极地六边形
        animateCameraTo({ x: 5, y: 18, z: 12 }, { x: 0, y: 0, z: 0 });
    },
    4: () => {
        // 土卫六 - 远景
        animateCameraTo({ x: -12, y: 8, z: 20 }, { x: 0, y: 0, z: 0 });
    },
    5: () => {
        // 卫星家族 - 全景远景
        animateCameraTo({ x: 15, y: 12, z: 22 }, { x: 0, y: 0, z: 0 });
    },
    6: () => {
        // 卡西尼号 - 环的近距离
        animateCameraTo({ x: -5, y: 3, z: 16 }, { x: 0, y: 0, z: 0 });
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
    animateCameraTo({ x: 0, y: 8, z: 25 }, { x: 0, y: 0, z: 0 });
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
    playAudio(saturnAudio.story(ch.id, storyIndex + 1), plainText);

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
    playAudio(saturnAudio.hanzi(ch.id, hanziIndex + 1), hanziText);

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
    playAudio(saturnAudio.quiz(ch.id), fullText);

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
            playAudio(saturnAudio.quizOption(ch.id, i), labels[i] + '，' + opt.text);
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

    const audioPath = saturnAudio.math(ch.id, qIdx);

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
        playAudio(saturnAudio.correct, '太棒了！回答正确！');

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
            ? saturnAudio.mathHint(chId, gameState.mathQuestionIndex)
            : saturnAudio.quizHint(chId);
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
    playAudio(saturnAudio.complete(chId), `太厉害了！第${chId}章，${ch.title}，探险成功！你获得了一颗星星！`);

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
    playAudio(saturnAudio.finalBadge, '恭喜智天！你完成了全部6个章节的土星探险！你获得了土星探险家大徽章！');
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
