/**
 * 火星探险家 - 柳智天的宇宙课堂
 * 6大章节闯关：科普故事 → 汉字学习 → 知识测验 → 数学挑战 → 获得星星
 */

// ============ 全局变量 ============
let scene, camera, renderer, controls;
let marsMesh, earthRef, starField;
let clock;

// ============ 章节数据 ============
const chaptersData = [
    {
        id: 1,
        title: '红色星球',
        icon: '🔴',
        desc: '火星为什么是红色的？',
        stories: [
            '火星是太阳系<span class="highlight">第四颗行星</span>，排在地球后面！',
            '火星看起来是<span class="highlight">红色</span>的，因为表面有很多<span class="highlight">氧化铁</span>，就像铁生锈一样！',
            '所以火星也叫<span class="highlight">"红色星球"</span>，中国古人叫它<span class="highlight">"荧惑"</span>。'
        ],
        hanzi: [
            { char: '沙', pinyin: 'shā', words: '沙子 · 沙漠', sentence: '沙滩上的沙子细细的。', pictograph: 'drawSand' },
            { char: '尘', pinyin: 'chén', words: '灰尘 · 尘土', sentence: '风吹起了一片尘土。', pictograph: 'drawDust' }
        ],
        quiz: {
            question: '火星为什么是红色的？',
            options: [
                { text: '表面有氧化铁（铁锈）', correct: true },
                { text: '被太阳晒红了', correct: false },
                { text: '涂了红色油漆', correct: false }
            ],
            hint: '想想铁生锈后是什么颜色？'
        },
        math: [
            {
                type: 'choice',
                question: '火星上有3座大火山和4座小火山，一共几座？',
                options: [
                    { text: '6 座', correct: false },
                    { text: '7 座', correct: true },
                    { text: '8 座', correct: false }
                ],
                hint: '3 + 4 = ?'
            },
            {
                type: 'fillin',
                question: '火星表面有6块红色石头，风吹走了2块，还剩几块？',
                answer: 4,
                hint: '6 - 2 = ?'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 4,
                right: 3,
                answer: '>',
                hint: '4比3大！火星排在第4颗，地球排第3颗！'
            }
        ]
    },
    {
        id: 2,
        title: '火星地形',
        icon: '🏔️',
        desc: '太阳系最高的山',
        stories: [
            '火星上有太阳系最高的山——<span class="highlight">奥林帕斯山</span>，高度是珠穆朗玛峰的<span class="highlight">3倍</span>！',
            '火星上还有一条超级大峡谷叫<span class="highlight">水手号峡谷</span>，长<span class="highlight">4000公里</span>！',
            '火星的北半球<span class="highlight">平坦</span>，南半球<span class="highlight">坑坑洼洼</span>，科学家觉得很奇怪。'
        ],
        hanzi: [
            { char: '远', pinyin: 'yuǎn', words: '远方 · 远处', sentence: '远处的山看起来小小的。', pictograph: 'drawFar' },
            { char: '近', pinyin: 'jìn', words: '近处 · 附近', sentence: '走近一看花开了。', pictograph: 'drawNear' }
        ],
        quiz: {
            question: '太阳系最高的山在哪里？',
            options: [
                { text: '地球', correct: false },
                { text: '月球', correct: false },
                { text: '火星', correct: true }
            ],
            hint: '想想奥林帕斯山在哪颗星球上...'
        },
        math: [
            {
                type: 'choice',
                question: '峡谷里有6块大石头，滚走了2块，还剩几块？',
                options: [
                    { text: '4 块', correct: true },
                    { text: '3 块', correct: false },
                    { text: '5 块', correct: false }
                ],
                hint: '6 - 2 = ?'
            },
            {
                type: 'fillin',
                question: '奥林帕斯山上有5个观测站，又新建了3个，一共有几个？',
                answer: 8,
                hint: '5 + 3 = ?'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 3,
                right: 9,
                answer: '<',
                hint: '3比9小！奥林帕斯山比珠峰高3倍呢！'
            }
        ]
    },
    {
        id: 3,
        title: '火星大气',
        icon: '🌪️',
        desc: '稀薄大气和沙尘暴',
        stories: [
            '火星有大气层，但<span class="highlight">非常非常稀薄</span>，只有地球的<span class="highlight">1%</span>！',
            '火星大气主要是<span class="highlight">二氧化碳</span>，人类不能直接呼吸。',
            '火星上经常刮<span class="highlight">沙尘暴</span>，有时候能把<span class="highlight">整个火星</span>都包起来！'
        ],
        hanzi: [
            { char: '干', pinyin: 'gān', words: '干燥 · 干净', sentence: '沙漠里又干又热。', pictograph: 'drawDry' },
            { char: '冷', pinyin: 'lěng', words: '寒冷 · 冰冷', sentence: '冬天好冷要穿厚衣服。', pictograph: 'drawCold' }
        ],
        quiz: {
            question: '火星上经常发生什么？',
            options: [
                { text: '下大雨', correct: false },
                { text: '沙尘暴', correct: true },
                { text: '下大雪', correct: false }
            ],
            hint: '火星上很干燥，风会卷起沙尘...'
        },
        math: [
            {
                type: 'choice',
                question: '火星上刮了3天沙尘暴，又刮了5天，一共刮了几天？',
                options: [
                    { text: '7 天', correct: false },
                    { text: '9 天', correct: false },
                    { text: '8 天', correct: true }
                ],
                hint: '3 + 5 = ?'
            },
            {
                type: 'fillin',
                question: '沙尘暴卷起了9粒沙子，落下了4粒，空中还有几粒？',
                answer: 5,
                hint: '9 - 4 = ?'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 1,
                right: 8,
                answer: '<',
                hint: '1比8小！火星大气只有地球的1%！'
            }
        ]
    },
    {
        id: 4,
        title: '寻找水',
        icon: '💧',
        desc: '火星上有水吗？',
        stories: [
            '科学家发现火星的<span class="highlight">南北极</span>有大片的<span class="highlight">冰盖</span>！',
            '火星上还有<span class="highlight">干涸的河道</span>，说明很久以前火星上可能有<span class="highlight">河流和海洋</span>。',
            '有水就可能有<span class="highlight">生命</span>，所以科学家特别想知道火星上有没有生物。'
        ],
        hanzi: [
            { char: '冰', pinyin: 'bīng', words: '冰块 · 冰冷', sentence: '冬天河面结了厚厚的冰。', pictograph: 'drawIce' },
            { char: '水', pinyin: 'shuǐ', words: '水杯 · 河水', sentence: '清清的河水哗哗地流。', pictograph: 'drawWater' }
        ],
        quiz: {
            question: '火星的极地有什么？',
            options: [
                { text: '冰盖', correct: true },
                { text: '大海', correct: false },
                { text: '森林', correct: false }
            ],
            hint: '科学家在火星南北极发现了什么？'
        },
        math: [
            {
                type: 'choice',
                question: '探测器找到了3块冰和2块岩石，一共找到几块？',
                options: [
                    { text: '4 块', correct: false },
                    { text: '5 块', correct: true },
                    { text: '6 块', correct: false }
                ],
                hint: '3 + 2 = ?'
            },
            {
                type: 'fillin',
                question: '火星北极有7块大冰，融化了1块，还有几块？',
                answer: 6,
                hint: '7 - 1 = ?'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 3,
                right: 2,
                answer: '>',
                hint: '3比2大！找到的冰比岩石多！'
            }
        ]
    },
    {
        id: 5,
        title: '火星探测器',
        icon: '🤖',
        desc: '机器人探险家',
        stories: [
            '人类派了好多<span class="highlight">机器人</span>去火星探险！美国的<span class="highlight">"好奇号"</span>火星车已经在火星上跑了好多年！',
            '中国的<span class="highlight">"祝融号"</span>也成功登陆了火星，在上面拍了好多照片！',
            '这些火星车用<span class="highlight">太阳能</span>或<span class="highlight">核电池</span>供电，替我们探索火星。'
        ],
        hanzi: [
            { char: '车', pinyin: 'chē', words: '汽车 · 火车', sentence: '小汽车在马路上跑。', pictograph: 'drawCar' },
            { char: '轮', pinyin: 'lún', words: '车轮 · 轮子', sentence: '自行车有两个轮子。', pictograph: 'drawWheel' }
        ],
        quiz: {
            question: '中国的火星车叫什么名字？',
            options: [
                { text: '嫦娥号', correct: false },
                { text: '天宫号', correct: false },
                { text: '祝融号', correct: true }
            ],
            hint: '祝融是中国神话中的火神...'
        },
        math: [
            {
                type: 'choice',
                question: '好奇号有6个轮子，坏了1个，还有几个好的？',
                options: [
                    { text: '5 个', correct: true },
                    { text: '4 个', correct: false },
                    { text: '3 个', correct: false }
                ],
                hint: '6 - 1 = ?'
            },
            {
                type: 'fillin',
                question: '祝融号拍了4张照片，好奇号拍了6张，一共拍了几张？',
                answer: 10,
                hint: '4 + 6 = ?'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 6,
                right: 6,
                answer: '=',
                hint: '6等于6！两边一样多！'
            }
        ]
    },
    {
        id: 6,
        title: '火星的卫星',
        icon: '🥔',
        desc: '像土豆的小卫星',
        stories: [
            '火星有<span class="highlight">2个</span>小卫星，叫<span class="highlight">火卫一</span>和<span class="highlight">火卫二</span>！',
            '它们的名字来自希腊神话，意思是<span class="highlight">"恐惧"</span>和<span class="highlight">"恐慌"</span>。',
            '这两个卫星形状不像月球那样圆，而是像<span class="highlight">土豆</span>一样不规则！'
        ],
        hanzi: [
            { char: '色', pinyin: 'sè', words: '颜色 · 红色', sentence: '彩虹有七种颜色。', pictograph: 'drawColor' },
            { char: '红', pinyin: 'hóng', words: '红色 · 红花', sentence: '秋天的苹果红红的。', pictograph: 'drawRed' }
        ],
        quiz: {
            question: '火星有几个卫星？',
            options: [
                { text: '1 个', correct: false },
                { text: '2 个', correct: true },
                { text: '没有', correct: false }
            ],
            hint: '火卫一和火卫二...'
        },
        math: [
            {
                type: 'choice',
                question: '地球有1个月亮，火星有2个小卫星，一共几个？',
                options: [
                    { text: '2 个', correct: false },
                    { text: '4 个', correct: false },
                    { text: '3 个', correct: true }
                ],
                hint: '1 + 2 = ?'
            },
            {
                type: 'fillin',
                question: '火卫一绕火星转了5圈，火卫二转了3圈，一共转了几圈？',
                answer: 8,
                hint: '5 + 3 = ?'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 2,
                right: 1,
                answer: '>',
                hint: '2比1大！火星的卫星比地球多！'
            }
        ]
    }
];

// ============ 象形图绘制函数 ============
const pictographDrawers = {
    drawSand(ctx, w, h) {
        // 沙 - 沙漠和沙丘
        const grad = ctx.createLinearGradient(0, h * 0.4, 0, h);
        grad.addColorStop(0, '#E8C170');
        grad.addColorStop(1, '#C49B3D');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.6);
        ctx.quadraticCurveTo(w * 0.25, h * 0.4, w * 0.5, h * 0.55);
        ctx.quadraticCurveTo(w * 0.75, h * 0.7, w, h * 0.5);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();
        // 小沙粒
        ctx.fillStyle = '#D4A84B';
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * w;
            const y = h * 0.6 + Math.random() * h * 0.35;
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        // 太阳
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath();
        ctx.arc(w * 0.8, h * 0.2, 15, 0, Math.PI * 2);
        ctx.fill();
    },
    drawDust(ctx, w, h) {
        // 尘 - 尘土飞扬
        ctx.strokeStyle = '#B8956A';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        // 风卷尘土的曲线
        for (let i = 0; i < 4; i++) {
            const y = 25 + i * 25;
            ctx.beginPath();
            ctx.moveTo(10, y);
            ctx.quadraticCurveTo(w * 0.4, y - 15, w * 0.6, y + 5);
            ctx.quadraticCurveTo(w * 0.8, y + 15, w - 15, y - 5);
            ctx.stroke();
        }
        // 小尘粒
        ctx.fillStyle = '#C49B3D';
        for (let i = 0; i < 12; i++) {
            const x = 20 + Math.random() * (w - 40);
            const y = 20 + Math.random() * (h - 40);
            ctx.beginPath();
            ctx.arc(x, y, 2 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    drawFar(ctx, w, h) {
        // 远 - 远处的山
        ctx.fillStyle = '#6B8E9B';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.7);
        ctx.lineTo(w * 0.3, h * 0.35);
        ctx.lineTo(w * 0.6, h * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#8BAAB5';
        ctx.beginPath();
        ctx.moveTo(w * 0.4, h * 0.7);
        ctx.lineTo(w * 0.7, h * 0.4);
        ctx.lineTo(w, h * 0.7);
        ctx.closePath();
        ctx.fill();
        // 小人在前
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath();
        ctx.arc(w * 0.2, h * 0.75, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFD93D';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(w * 0.2, h * 0.81);
        ctx.lineTo(w * 0.2, h * 0.93);
        ctx.stroke();
        // 箭头指向远方
        ctx.strokeStyle = '#5DADE2';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w * 0.3, h * 0.82);
        ctx.lineTo(w * 0.7, h * 0.55);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w * 0.65, h * 0.52);
        ctx.lineTo(w * 0.7, h * 0.55);
        ctx.lineTo(w * 0.63, h * 0.58);
        ctx.stroke();
    },
    drawNear(ctx, w, h) {
        // 近 - 走近看花
        ctx.fillStyle = '#27AE60';
        ctx.beginPath();
        ctx.moveTo(w * 0.5, h * 0.5);
        ctx.lineTo(w * 0.5, h * 0.85);
        ctx.stroke();
        ctx.strokeStyle = '#27AE60';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(w * 0.5, h * 0.5);
        ctx.lineTo(w * 0.5, h * 0.85);
        ctx.stroke();
        // 花朵
        ctx.fillStyle = '#E74C3C';
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const x = w * 0.5 + Math.cos(angle) * 12;
            const y = h * 0.42 + Math.sin(angle) * 12;
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.42, 6, 0, Math.PI * 2);
        ctx.fill();
        // 大眼睛表示看
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(w * 0.25, h * 0.35, 12, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2C3E50';
        ctx.beginPath();
        ctx.arc(w * 0.25, h * 0.35, 5, 0, Math.PI * 2);
        ctx.fill();
    },
    drawDry(ctx, w, h) {
        // 干 - 干裂的大地
        ctx.fillStyle = '#C49B3D';
        ctx.fillRect(10, h * 0.5, w - 20, h * 0.45);
        // 裂纹
        ctx.strokeStyle = '#8B6914';
        ctx.lineWidth = 2;
        const cracks = [[30, h*0.5, 45, h*0.7, 25, h*0.9], [60, h*0.55, 80, h*0.75, 70, h*0.88],
                         [90, h*0.5, 105, h*0.65, 115, h*0.85]];
        cracks.forEach(c => {
            ctx.beginPath();
            ctx.moveTo(c[0], c[1]);
            ctx.lineTo(c[2], c[3]);
            ctx.lineTo(c[4], c[5]);
            ctx.stroke();
        });
        // 太阳
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath();
        ctx.arc(w * 0.75, h * 0.25, 18, 0, Math.PI * 2);
        ctx.fill();
        // 光线
        ctx.strokeStyle = '#FFD93D';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(w * 0.75 + Math.cos(angle) * 22, h * 0.25 + Math.sin(angle) * 22);
            ctx.lineTo(w * 0.75 + Math.cos(angle) * 30, h * 0.25 + Math.sin(angle) * 30);
            ctx.stroke();
        }
    },
    drawCold(ctx, w, h) {
        // 冷 - 雪花+冰
        ctx.fillStyle = '#AED6F1';
        ctx.fillRect(0, 0, w, h);
        // 大雪花
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        const cx = w / 2, cy = h / 2;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * 35, cy + Math.sin(angle) * 35);
            ctx.stroke();
            // 小分枝
            const mx = cx + Math.cos(angle) * 20;
            const my = cy + Math.sin(angle) * 20;
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(mx + Math.cos(angle + 0.6) * 10, my + Math.sin(angle + 0.6) * 10);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(mx + Math.cos(angle - 0.6) * 10, my + Math.sin(angle - 0.6) * 10);
            ctx.stroke();
        }
        // 小人发抖
        ctx.fillStyle = '#5DADE2';
        ctx.beginPath();
        ctx.arc(w * 0.2, h * 0.8, 6, 0, Math.PI * 2);
        ctx.fill();
    },
    drawIce(ctx, w, h) {
        // 冰 - 冰块
        ctx.fillStyle = '#D4E6F1';
        ctx.beginPath();
        ctx.moveTo(w * 0.2, h * 0.3);
        ctx.lineTo(w * 0.8, h * 0.25);
        ctx.lineTo(w * 0.85, h * 0.6);
        ctx.lineTo(w * 0.75, h * 0.75);
        ctx.lineTo(w * 0.25, h * 0.8);
        ctx.lineTo(w * 0.15, h * 0.55);
        ctx.closePath();
        ctx.fill();
        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.moveTo(w * 0.3, h * 0.35);
        ctx.lineTo(w * 0.55, h * 0.32);
        ctx.lineTo(w * 0.5, h * 0.5);
        ctx.lineTo(w * 0.28, h * 0.48);
        ctx.closePath();
        ctx.fill();
        // 裂纹
        ctx.strokeStyle = '#AED6F1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(w * 0.4, h * 0.35);
        ctx.lineTo(w * 0.5, h * 0.55);
        ctx.lineTo(w * 0.65, h * 0.65);
        ctx.stroke();
    },
    drawWater(ctx, w, h) {
        // 水 - 水滴和波纹
        // 大水滴
        ctx.fillStyle = '#3498DB';
        ctx.beginPath();
        ctx.moveTo(w / 2, h * 0.15);
        ctx.quadraticCurveTo(w / 2 + 25, h * 0.45, w / 2, h * 0.6);
        ctx.quadraticCurveTo(w / 2 - 25, h * 0.45, w / 2, h * 0.15);
        ctx.fill();
        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(w / 2 - 5, h * 0.35, 5, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // 水波纹
        ctx.strokeStyle = '#5DADE2';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            const y = h * 0.72 + i * 12;
            const r = 15 + i * 10;
            ctx.beginPath();
            ctx.arc(w / 2, y, r, Math.PI * 0.1, Math.PI * 0.9);
            ctx.stroke();
        }
    },
    drawCar(ctx, w, h) {
        // 车 - 小汽车
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.moveTo(25, h * 0.55);
        ctx.lineTo(35, h * 0.35);
        ctx.lineTo(95, h * 0.35);
        ctx.lineTo(115, h * 0.55);
        ctx.lineTo(115, h * 0.7);
        ctx.lineTo(25, h * 0.7);
        ctx.closePath();
        ctx.fill();
        // 车身下部
        ctx.fillStyle = '#C0392B';
        ctx.fillRect(20, h * 0.55, 100, h * 0.15);
        // 窗户
        ctx.fillStyle = '#AED6F1';
        ctx.fillRect(42, h * 0.38, 22, h * 0.15);
        ctx.fillRect(70, h * 0.38, 22, h * 0.15);
        // 车轮
        ctx.fillStyle = '#2C3E50';
        ctx.beginPath();
        ctx.arc(45, h * 0.73, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(95, h * 0.73, 10, 0, Math.PI * 2);
        ctx.fill();
        // 车轮中心
        ctx.fillStyle = '#95A5A6';
        ctx.beginPath();
        ctx.arc(45, h * 0.73, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(95, h * 0.73, 4, 0, Math.PI * 2);
        ctx.fill();
    },
    drawWheel(ctx, w, h) {
        // 轮 - 轮子
        const cx = w / 2, cy = h / 2;
        // 外圈
        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(cx, cy, 40, 0, Math.PI * 2);
        ctx.stroke();
        // 轮胎
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(cx, cy, 40, 0, Math.PI * 2);
        ctx.stroke();
        // 轮辐
        ctx.strokeStyle = '#95A5A6';
        ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * 32, cy + Math.sin(angle) * 32);
            ctx.stroke();
        }
        // 中心
        ctx.fillStyle = '#BDC3C7';
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
    },
    drawColor(ctx, w, h) {
        // 色 - 彩虹
        const colors = ['#E74C3C', '#E67E22', '#F4D03F', '#2ECC71', '#3498DB', '#9B59B6'];
        colors.forEach((color, i) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(w / 2, h * 0.7, 50 - i * 8, Math.PI, 0);
            ctx.stroke();
        });
    },
    drawRed(ctx, w, h) {
        // 红 - 红苹果
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.arc(w / 2 - 8, h / 2, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(w / 2 + 8, h / 2, 28, 0, Math.PI * 2);
        ctx.fill();
        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(w / 2 - 10, h / 2 - 12, 8, 5, -0.5, 0, Math.PI * 2);
        ctx.fill();
        // 叶子
        ctx.fillStyle = '#27AE60';
        ctx.beginPath();
        ctx.ellipse(w / 2 + 5, h / 2 - 30, 12, 6, 0.5, 0, Math.PI * 2);
        ctx.fill();
        // 茎
        ctx.strokeStyle = '#8B6914';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2 - 25);
        ctx.lineTo(w / 2, h / 2 - 35);
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
const marsAudio = {
    correct: 'audio/mars/correct.mp3',
    finalBadge: 'audio/mars/final-badge.mp3',
    story: (chId, idx) => `audio/mars/ch${chId}-story-${idx}.mp3`,
    hanzi: (chId, idx) => `audio/mars/ch${chId}-hanzi-${idx}.mp3`,
    quiz: (chId) => `audio/mars/ch${chId}-quiz.mp3`,
    quizHint: (chId) => `audio/mars/ch${chId}-quiz-hint.mp3`,
    math: (chId, qIdx) => qIdx > 0 ? `audio/mars/ch${chId}-math-${qIdx + 1}.mp3` : `audio/mars/ch${chId}-math.mp3`,
    mathHint: (chId, qIdx) => qIdx > 0 ? `audio/mars/ch${chId}-math-${qIdx + 1}-hint.mp3` : `audio/mars/ch${chId}-math-hint.mp3`,
    complete: (chId) => `audio/mars/ch${chId}-complete.mp3`
};

// ============ 存档 ============
function saveProgress() {
    localStorage.setItem('marsExplorer', JSON.stringify({
        completedChapters: gameState.completedChapters
    }));
}

function loadProgress() {
    try {
        const data = JSON.parse(localStorage.getItem('marsExplorer'));
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
    createMars();
    createEarthReference();
    addLights();

    window.addEventListener('resize', onWindowResize);

    // 纹理加载检测
    const checkLoaded = setInterval(() => {
        if (marsMesh && marsMesh.material && marsMesh.material.uniforms &&
            marsMesh.material.uniforms.planetTexture.value.image) {
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

// ============ 创建火星 ============
function createMars() {
    const geometry = new THREE.SphereGeometry(6, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const marsMap = textureLoader.load('textures/mars.jpg');

    const marsMaterial = new THREE.ShaderMaterial({
        uniforms: {
            planetTexture: { value: marsMap },
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

                // Fresnel 橙红色稀薄大气边缘光（强度0.2，比地球弱）
                vec3 viewDir = normalize(cameraPosition - vWorldPos);
                float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
                surfaceColor += vec3(0.85, 0.35, 0.1) * fresnel * 0.2;

                gl_FragColor = vec4(surfaceColor, 1.0);
            }
        `
    });

    marsMesh = new THREE.Mesh(geometry, marsMaterial);
    scene.add(marsMesh);
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
    earthRef.position.set(-45, 18, -35);
    scene.add(earthRef);
}

// ============ 灯光 ============
function addLights() {
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(50, 20, 30);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x332211, 0.3);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0x664422, 0.3);
    rimLight.position.set(-30, -10, -20);
    scene.add(rimLight);
}

// ============ 动画循环 ============
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    // 火星缓慢自转
    if (marsMesh) {
        marsMesh.rotation.y += delta * 0.05;
        if (marsMesh.material.uniforms) {
            marsMesh.material.uniforms.time.value = elapsed;
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
        // 红色星球 - 正面近景
        animateCameraTo({ x: 0, y: 2, z: 16 }, { x: 0, y: 0, z: 0 });
    },
    2: () => {
        // 火星地形 - 侧面远景
        animateCameraTo({ x: 15, y: 8, z: 15 }, { x: 0, y: 0, z: 0 });
    },
    3: () => {
        // 火星大气 - 远景看大气
        animateCameraTo({ x: -10, y: 10, z: 20 }, { x: 0, y: 0, z: 0 });
    },
    4: () => {
        // 寻找水 - 极地视角
        animateCameraTo({ x: 3, y: 12, z: 14 }, { x: 0, y: 2, z: 0 });
    },
    5: () => {
        // 火星探测器 - 月面近景
        animateCameraTo({ x: -2, y: -1, z: 13 }, { x: -2, y: 0, z: 0 });
    },
    6: () => {
        // 火星的卫星 - 远景全貌
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

    const storyHtml = ch.stories[storyIndex];
    document.getElementById('storyText').innerHTML = storyHtml;

    // 语音朗读
    const plainText = storyHtml.replace(/<[^>]*>/g, '');
    playAudio(marsAudio.story(ch.id, storyIndex + 1), plainText);

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
    playAudio(marsAudio.hanzi(ch.id, hanziIndex + 1), hanziText);

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

    playAudio(marsAudio.quiz(ch.id), ch.quiz.question);

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

    const audioPath = marsAudio.math(ch.id, qIdx);

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
        playAudio(marsAudio.correct, '太棒了！回答正确！');

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
        const hintAudioPath = type === 'math' ? marsAudio.mathHint(chId, gameState.mathQuestionIndex) : marsAudio.quizHint(chId);
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
    playAudio(marsAudio.complete(chId), `太厉害了！第${chId}章，${ch.title}，探险成功！你获得了一颗星星！`);

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
    playAudio(marsAudio.finalBadge, '恭喜智天！你完成了全部6个章节的火星探险！你获得了火星探险家大徽章！');
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
