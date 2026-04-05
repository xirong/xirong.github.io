/**
 * 地球探险家 - 柳智天的宇宙课堂
 * 6大章节闯关：科普故事 → 汉字学习 → 知识测验 → 数学挑战 → 获得星星
 * 星球探险家系列 第1-2集（最早的两集，内容基础、适合5岁儿童）
 */

// ============ 全局变量 ============
let scene, camera, renderer, controls;
let earthMesh, cloudsMesh, moonRef, starField;
let clock;

// ============ 章节数据 ============
const chaptersData = [
    {
        id: 1,
        title: '我们的家园',
        icon: '🌍',
        desc: '地球是什么形状？',
        stories: [
            '地球是我们的<span class="highlight">家</span>，所有人、动物、花草都住在上面！',
            '地球看起来像一个<span class="highlight">大球</span>，但不是完美的圆球，而是稍微有点<span class="highlight">扁</span>的！',
            '从太空看地球，蓝色的是<span class="highlight">海洋</span>，绿色和棕色的是<span class="highlight">陆地</span>，白色的是<span class="highlight">云</span>。'
        ],
        hanzi: [
            { char: '地', pinyin: 'dì', words: '大地 · 地球', sentence: '我们住在大地上。', pictograph: 'drawEarth' },
            { char: '球', pinyin: 'qiú', words: '地球 · 皮球', sentence: '地球是一个大球。', pictograph: 'drawBall' },
            { char: '家', pinyin: 'jiā', words: '家人 · 回家', sentence: '地球是我们的家。', pictograph: 'drawHome' }
        ],
        quiz: {
            question: '地球是什么形状的？',
            options: [
                { text: '像一个大球', correct: true },
                { text: '像一块大饼', correct: false },
                { text: '像一个正方形', correct: false }
            ],
            hint: '从太空看地球，像一个圆圆的球！'
        },
        math: [
            {
                type: 'choice',
                question: '地球上有3片大海和2块大陆地，一共几个？',
                options: [
                    { text: '4 个', correct: false },
                    { text: '5 个', correct: true },
                    { text: '6 个', correct: false }
                ],
                hint: '3 + 2 = ?'
            },
            {
                type: 'fillin',
                question: '天上有7朵白云，飘走了3朵，还剩几朵？',
                answer: 4,
                hint: '7 - 3 = ?'
            },
            {
                type: 'fillin',
                question: '地球上有3片海洋，又发现了2片，一共有几片？',
                answer: 5,
                hint: '3 + 2 = 5'
            },
            {
                type: 'sequential',
                question: '地球上有8朵云，飘走了3朵，又飘来了2朵，现在有几朵？',
                expression: '8 - 3 + 2',
                answer: 7,
                hint: '先算 8-3=5，再算 5+2=7'
            }
        ]
    },
    {
        id: 2,
        title: '转啊转',
        icon: '🔄',
        desc: '地球为什么会有白天和黑夜？',
        stories: [
            '地球像<span class="highlight">陀螺</span>一样，不停地<span class="highlight">转圈圈</span>，这叫<span class="highlight">自转</span>！',
            '地球转一圈需要<span class="highlight">1天</span>，也就是<span class="highlight">24小时</span>！',
            '朝着太阳的一面是<span class="highlight">白天</span>，背着太阳的一面是<span class="highlight">黑夜</span>。所以白天和黑夜会<span class="highlight">交替</span>出现！'
        ],
        hanzi: [
            { char: '日', pinyin: 'rì', words: '日出 · 生日', sentence: '太阳从东方升起来了。', pictograph: 'drawSun' },
            { char: '月', pinyin: 'yuè', words: '月亮 · 月饼', sentence: '月亮弯弯像小船。', pictograph: 'drawMoon' },
            { char: '天', pinyin: 'tiān', words: '天空 · 白天', sentence: '天上有白白的云。', pictograph: 'drawSky' }
        ],
        quiz: {
            question: '为什么会有白天和黑夜？',
            options: [
                { text: '太阳会关灯', correct: false },
                { text: '地球在转圈', correct: true },
                { text: '云把太阳挡住了', correct: false }
            ],
            hint: '地球像陀螺一样转，朝着太阳就是白天！'
        },
        math: [
            {
                type: 'choice',
                question: '白天有5只小鸟飞来了，又飞来了3只，一共有几只？',
                options: [
                    { text: '7 只', correct: false },
                    { text: '8 只', correct: true },
                    { text: '9 只', correct: false }
                ],
                hint: '5 + 3 = ?'
            },
            {
                type: 'fillin',
                question: '地球转一圈是1天，转了2圈就是几天？',
                answer: 2,
                hint: '1 + 1 = ?'
            },
            {
                type: 'fillin',
                question: '白天有5只小鸟在唱歌，飞来了3只，一共几只？',
                answer: 8,
                hint: '5 + 3 = 8'
            },
            {
                type: 'sequential',
                question: '树上有9只小鸟，飞走了4只，又飞来了2只，现在有几只？',
                expression: '9 - 4 + 2',
                answer: 7,
                hint: '先算 9-4=5，再算 5+2=7'
            }
        ]
    },
    {
        id: 3,
        title: '蓝色星球',
        icon: '💧',
        desc: '地球为什么叫蓝色星球？',
        stories: [
            '地球表面大部分都是<span class="highlight">水</span>！海洋占了<span class="highlight">十分之七</span>！',
            '水会<span class="highlight">变魔术</span>：太阳一晒变成<span class="highlight">水蒸气</span>飞到天上，遇冷变成<span class="highlight">小水滴</span>组成云！',
            '云越来越重就会下<span class="highlight">雨</span>，雨水流入河里、流入大海，再被太阳晒……不停地<span class="highlight">循环</span>！'
        ],
        hanzi: [
            { char: '水', pinyin: 'shuǐ', words: '水杯 · 河水', sentence: '清清的河水哗哗流。', pictograph: 'drawWater' },
            { char: '雨', pinyin: 'yǔ', words: '下雨 · 雨伞', sentence: '下雨了要打雨伞。', pictograph: 'drawRain' },
            { char: '海', pinyin: 'hǎi', words: '大海 · 海洋', sentence: '大海又大又蓝。', pictograph: 'drawSea' }
        ],
        quiz: {
            question: '地球为什么叫蓝色星球？',
            options: [
                { text: '涂了蓝色油漆', correct: false },
                { text: '因为大部分是海洋', correct: true },
                { text: '天空是蓝色的', correct: false }
            ],
            hint: '地球表面十分之七都是水，海洋是蓝色的！'
        },
        math: [
            {
                type: 'choice',
                question: '天上有4朵云，又飘来了4朵，一共几朵？',
                options: [
                    { text: '7 朵', correct: false },
                    { text: '8 朵', correct: true },
                    { text: '9 朵', correct: false }
                ],
                hint: '4 + 4 = ?'
            },
            {
                type: 'fillin',
                question: '池塘里有9条小鱼，游走了3条，还剩几条？',
                answer: 6,
                hint: '9 - 3 = ?'
            },
            {
                type: 'fillin',
                question: '池塘里有7条鱼和3只虾，一共有几只小动物？',
                answer: 10,
                hint: '7 + 3 = 10'
            },
            {
                type: 'sequential',
                question: '池塘有10条鱼，游走了6条，又游来了3条，现在有几条？',
                expression: '10 - 6 + 3',
                answer: 7,
                hint: '先算 10-6=4，再算 4+3=7'
            }
        ]
    },
    {
        id: 4,
        title: '空气外衣',
        icon: '🌈',
        desc: '为什么天是蓝色的？',
        stories: [
            '地球外面包了一层<span class="highlight">大气层</span>，就像一件看不见的<span class="highlight">外衣</span>！',
            '大气层里有我们呼吸的<span class="highlight">空气</span>，没有空气，人和动物都不能活！',
            '阳光穿过大气层时，蓝色的光被<span class="highlight">散射</span>开来，所以天空看起来是<span class="highlight">蓝色</span>的！太阳落山时光走得更远，变成<span class="highlight">红色</span>和<span class="highlight">橙色</span>，就是美丽的晚霞！'
        ],
        hanzi: [
            { char: '风', pinyin: 'fēng', words: '大风 · 风车', sentence: '风吹树叶沙沙响。', pictograph: 'drawWind' },
            { char: '云', pinyin: 'yún', words: '白云 · 乌云', sentence: '白云在天上飘来飘去。', pictograph: 'drawCloud' },
            { char: '气', pinyin: 'qì', words: '空气 · 天气', sentence: '空气看不见摸不着。', pictograph: 'drawAir' }
        ],
        quiz: {
            question: '天空为什么是蓝色的？',
            options: [
                { text: '天空涂了蓝色', correct: false },
                { text: '海水映上去的', correct: false },
                { text: '阳光中蓝色光被散射了', correct: true }
            ],
            hint: '阳光穿过大气层，蓝色光被撒开来了！'
        },
        math: [
            {
                type: 'choice',
                question: '天上有6朵白云和2朵乌云，一共几朵？',
                options: [
                    { text: '7 朵', correct: false },
                    { text: '8 朵', correct: true },
                    { text: '9 朵', correct: false }
                ],
                hint: '6 + 2 = ?'
            },
            {
                type: 'fillin',
                question: '刮风了，8片树叶掉了5片，树上还有几片？',
                answer: 3,
                hint: '8 - 5 = ?'
            },
            {
                type: 'fillin',
                question: '天空中有6朵白云和2朵乌云，一共有几朵云？',
                answer: 8,
                hint: '6 + 2 = 8'
            },
            {
                type: 'sequential',
                question: '天上有10朵云，散开了5朵，又飘来了3朵，现在有几朵？',
                expression: '10 - 5 + 3',
                answer: 8,
                hint: '先算 10-5=5，再算 5+3=8'
            }
        ]
    },
    {
        id: 5,
        title: '四季变化',
        icon: '🌸',
        desc: '为什么会有春夏秋冬？',
        stories: [
            '地球还会绕着<span class="highlight">太阳</span>转圈圈，转一圈就是<span class="highlight">1年</span>！',
            '地球是<span class="highlight">歪着</span>转的，所以太阳照射的地方会变化，就有了<span class="highlight">春夏秋冬</span>！',
            '<span class="highlight">春天</span>花开了，<span class="highlight">夏天</span>好热呀，<span class="highlight">秋天</span>叶子黄了，<span class="highlight">冬天</span>下雪啦！四季就这样<span class="highlight">轮流来</span>！'
        ],
        hanzi: [
            { char: '春', pinyin: 'chūn', words: '春天 · 春风', sentence: '春天到了花开了。', pictograph: 'drawSpring' },
            { char: '冬', pinyin: 'dōng', words: '冬天 · 冬瓜', sentence: '冬天下雪真好玩。', pictograph: 'drawWinter' },
            { char: '花', pinyin: 'huā', words: '花朵 · 开花', sentence: '花园里花儿真美。', pictograph: 'drawFlower' }
        ],
        quiz: {
            question: '为什么会有四季变化？',
            options: [
                { text: '太阳变大变小', correct: false },
                { text: '地球歪着绕太阳转', correct: true },
                { text: '风吹来吹去', correct: false }
            ],
            hint: '地球歪着身子绕太阳转，阳光照射角度不同就有四季！'
        },
        math: [
            {
                type: 'choice',
                question: '春天开了4朵红花和3朵黄花，一共几朵？',
                options: [
                    { text: '6 朵', correct: false },
                    { text: '7 朵', correct: true },
                    { text: '8 朵', correct: false }
                ],
                hint: '4 + 3 = ?'
            },
            {
                type: 'fillin',
                question: '秋天树上有10个苹果，摘了4个，还有几个？',
                answer: 6,
                hint: '10 - 4 = ?'
            },
            {
                type: 'fillin',
                question: '春天开了4朵花，秋天落了2朵，还剩几朵？',
                answer: 2,
                hint: '4 - 2 = 2'
            },
            {
                type: 'sequential',
                question: '花园有8朵花，摘了3朵送妈妈，又开了4朵，现在有几朵？',
                expression: '8 - 3 + 4',
                answer: 9,
                hint: '先算 8-3=5，再算 5+4=9'
            }
        ]
    },
    {
        id: 6,
        title: '生命的摇篮',
        icon: '🌱',
        desc: '地球上有什么特别的？',
        stories: [
            '地球是我们目前知道的<span class="highlight">唯一</span>有<span class="highlight">生命</span>的星球！',
            '地球上有<span class="highlight">空气</span>可以呼吸，有<span class="highlight">水</span>可以喝，<span class="highlight">温度</span>刚刚好，不太热也不太冷！',
            '所以地球上有<span class="highlight">大树</span>、<span class="highlight">小草</span>、<span class="highlight">小动物</span>和<span class="highlight">我们</span>！我们要<span class="highlight">爱护</span>地球，保护我们的家园！'
        ],
        hanzi: [
            { char: '树', pinyin: 'shù', words: '大树 · 树叶', sentence: '大树上住着小鸟。', pictograph: 'drawTree' },
            { char: '草', pinyin: 'cǎo', words: '小草 · 草地', sentence: '草地上绿油油的。', pictograph: 'drawGrass' },
            { char: '鸟', pinyin: 'niǎo', words: '小鸟 · 鸟窝', sentence: '小鸟在天上飞。', pictograph: 'drawBird' }
        ],
        quiz: {
            question: '为什么地球上有生命？',
            options: [
                { text: '有空气、有水、温度合适', correct: true },
                { text: '地球最大', correct: false },
                { text: '地球离太阳最近', correct: false }
            ],
            hint: '地球有空气、有水、温度也不太冷不太热！'
        },
        math: [
            {
                type: 'choice',
                question: '草地上有5只兔子和4只松鼠，一共几只小动物？',
                options: [
                    { text: '8 只', correct: false },
                    { text: '9 只', correct: true },
                    { text: '10 只', correct: false }
                ],
                hint: '5 + 4 = ?'
            },
            {
                type: 'fillin',
                question: '树上有6只小鸟，飞走了2只，还有几只？',
                answer: 4,
                hint: '6 - 2 = ?'
            },
            {
                type: 'fillin',
                question: '森林里有5只兔子和4只松鼠，一共有几只小动物？',
                answer: 9,
                hint: '5 + 4 = 9'
            },
            {
                type: 'sequential',
                question: '草地上有7只兔子，跑走了3只，又来了5只，现在有几只？',
                expression: '7 - 3 + 5',
                answer: 9,
                hint: '先算 7-3=4，再算 4+5=9'
            }
        ]
    }
];

// ============ 象形图绘制函数 ============
const pictographDrawers = {
    drawEarth(ctx, w, h) {
        // 地 - 地球图案
        const cx = w / 2, cy = h / 2;
        // 蓝色地球
        ctx.fillStyle = '#3498DB';
        ctx.beginPath();
        ctx.arc(cx, cy, 40, 0, Math.PI * 2);
        ctx.fill();
        // 绿色陆地
        ctx.fillStyle = '#27AE60';
        ctx.beginPath();
        ctx.ellipse(cx - 10, cy - 8, 18, 12, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 15, cy + 12, 10, 8, 0.4, 0, Math.PI * 2);
        ctx.fill();
        // 白色极冠
        ctx.fillStyle = '#ECF0F1';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 35, 15, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    },
    drawBall(ctx, w, h) {
        // 球 - 皮球
        const cx = w / 2, cy = h / 2;
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.arc(cx, cy, 38, 0, Math.PI * 2);
        ctx.fill();
        // 条纹
        ctx.strokeStyle = '#C0392B';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, 38, -0.3, Math.PI + 0.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx, cy, 38, 15, 0, 0, Math.PI * 2);
        ctx.stroke();
        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(cx - 12, cy - 15, 10, 7, -0.5, 0, Math.PI * 2);
        ctx.fill();
    },
    drawHome(ctx, w, h) {
        // 家 - 小房子
        const cx = w / 2;
        // 屋顶（三角形）
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.moveTo(cx, h * 0.15);
        ctx.lineTo(cx - 45, h * 0.5);
        ctx.lineTo(cx + 45, h * 0.5);
        ctx.closePath();
        ctx.fill();
        // 墙壁
        ctx.fillStyle = '#F4D03F';
        ctx.fillRect(cx - 35, h * 0.5, 70, h * 0.38);
        // 门
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(cx - 10, h * 0.6, 20, h * 0.28);
        // 窗户
        ctx.fillStyle = '#AED6F1';
        ctx.fillRect(cx - 30, h * 0.55, 15, 15);
        ctx.fillRect(cx + 15, h * 0.55, 15, 15);
    },
    drawSun(ctx, w, h) {
        // 日 - 太阳
        const cx = w / 2, cy = h / 2;
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath();
        ctx.arc(cx, cy, 25, 0, Math.PI * 2);
        ctx.fill();
        // 光线
        ctx.strokeStyle = '#F39C12';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * 30, cy + Math.sin(angle) * 30);
            ctx.lineTo(cx + Math.cos(angle) * 42, cy + Math.sin(angle) * 42);
            ctx.stroke();
        }
    },
    drawMoon(ctx, w, h) {
        // 月 - 弯弯的月亮
        const cx = w / 2, cy = h / 2;
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.fill();
        // 用深色圆盖住一部分做成弯月
        ctx.fillStyle = '#0a0a0f';
        ctx.beginPath();
        ctx.arc(cx + 15, cy - 5, 28, 0, Math.PI * 2);
        ctx.fill();
        // 小星星
        ctx.fillStyle = '#FFD93D';
        ctx.font = '14px serif';
        ctx.fillText('✦', cx + 30, cy - 25);
        ctx.fillText('✦', cx + 20, cy + 30);
    },
    drawSky(ctx, w, h) {
        // 天 - 蓝天白云
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#5DADE2');
        grad.addColorStop(1, '#AED6F1');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        // 白云
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(w * 0.3, h * 0.35, 15, 0, Math.PI * 2);
        ctx.arc(w * 0.45, h * 0.3, 18, 0, Math.PI * 2);
        ctx.arc(w * 0.6, h * 0.35, 14, 0, Math.PI * 2);
        ctx.fill();
        // 太阳
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath();
        ctx.arc(w * 0.8, h * 0.2, 15, 0, Math.PI * 2);
        ctx.fill();
    },
    drawWater(ctx, w, h) {
        // 水 - 水滴和波纹
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
    drawRain(ctx, w, h) {
        // 雨 - 下雨
        // 乌云
        ctx.fillStyle = '#7F8C8D';
        ctx.beginPath();
        ctx.arc(w * 0.3, h * 0.25, 18, 0, Math.PI * 2);
        ctx.arc(w * 0.5, h * 0.2, 22, 0, Math.PI * 2);
        ctx.arc(w * 0.7, h * 0.25, 16, 0, Math.PI * 2);
        ctx.fill();
        // 雨滴
        ctx.fillStyle = '#5DADE2';
        const drops = [[30, 55], [50, 70], [70, 50], [90, 75], [45, 90], [75, 95], [60, 110]];
        drops.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(x + 4, y + 8, x, y + 12);
            ctx.quadraticCurveTo(x - 4, y + 8, x, y);
            ctx.fill();
        });
    },
    drawSea(ctx, w, h) {
        // 海 - 大海和波浪
        // 蓝色海水
        const grad = ctx.createLinearGradient(0, h * 0.3, 0, h);
        grad.addColorStop(0, '#2980B9');
        grad.addColorStop(1, '#1A5276');
        ctx.fillStyle = grad;
        ctx.fillRect(0, h * 0.35, w, h * 0.65);
        // 天空
        ctx.fillStyle = '#85C1E9';
        ctx.fillRect(0, 0, w, h * 0.35);
        // 波浪
        ctx.strokeStyle = '#AED6F1';
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
            const y = h * 0.4 + i * 20;
            ctx.beginPath();
            ctx.moveTo(0, y);
            for (let x = 0; x < w; x += 20) {
                ctx.quadraticCurveTo(x + 5, y - 6, x + 10, y);
                ctx.quadraticCurveTo(x + 15, y + 6, x + 20, y);
            }
            ctx.stroke();
        }
        // 太阳
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath();
        ctx.arc(w * 0.8, h * 0.15, 12, 0, Math.PI * 2);
        ctx.fill();
    },
    drawWind(ctx, w, h) {
        // 风 - 风吹曲线
        ctx.strokeStyle = '#5DADE2';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        for (let i = 0; i < 4; i++) {
            const y = 25 + i * 25;
            ctx.beginPath();
            ctx.moveTo(15, y);
            ctx.quadraticCurveTo(w * 0.3, y - 12, w * 0.5, y);
            ctx.quadraticCurveTo(w * 0.7, y + 12, w - 15, y - 5);
            ctx.stroke();
        }
        // 树叶被吹走
        ctx.fillStyle = '#27AE60';
        ctx.beginPath();
        ctx.ellipse(w * 0.7, h * 0.3, 8, 5, 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(w * 0.85, h * 0.55, 6, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();
    },
    drawCloud(ctx, w, h) {
        // 云 - 白云
        ctx.fillStyle = '#AED6F1';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#FFF';
        // 大云
        ctx.beginPath();
        ctx.arc(w * 0.35, h * 0.45, 22, 0, Math.PI * 2);
        ctx.arc(w * 0.55, h * 0.38, 28, 0, Math.PI * 2);
        ctx.arc(w * 0.72, h * 0.45, 20, 0, Math.PI * 2);
        ctx.fill();
        // 小云
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(w * 0.25, h * 0.75, 12, 0, Math.PI * 2);
        ctx.arc(w * 0.38, h * 0.72, 14, 0, Math.PI * 2);
        ctx.arc(w * 0.48, h * 0.75, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    },
    drawAir(ctx, w, h) {
        // 气 - 看不见的空气（用气泡表示）
        ctx.fillStyle = '#D5F5E3';
        ctx.fillRect(0, 0, w, h);
        // 透明气泡
        ctx.strokeStyle = 'rgba(46, 204, 113, 0.5)';
        ctx.lineWidth = 2;
        const bubbles = [[30, 70, 15], [60, 40, 20], [90, 80, 12], [50, 100, 10], [80, 55, 18], [35, 35, 8]];
        bubbles.forEach(([x, y, r]) => {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.stroke();
            // 小高光
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.25, 0, Math.PI * 2);
            ctx.fill();
        });
    },
    drawSpring(ctx, w, h) {
        // 春 - 春天开花
        // 绿地
        ctx.fillStyle = '#82E0AA';
        ctx.fillRect(0, h * 0.6, w, h * 0.4);
        // 天空
        ctx.fillStyle = '#AED6F1';
        ctx.fillRect(0, 0, w, h * 0.6);
        // 花朵
        const flowers = [[25, h * 0.55], [55, h * 0.5], [85, h * 0.55], [110, h * 0.52]];
        flowers.forEach(([fx, fy]) => {
            // 茎
            ctx.strokeStyle = '#27AE60';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(fx, fy + 30);
            ctx.stroke();
            // 花瓣
            const colors = ['#E74C3C', '#F39C12', '#9B59B6', '#E91E63'];
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2;
                ctx.beginPath();
                ctx.arc(fx + Math.cos(angle) * 6, fy + Math.sin(angle) * 6, 4, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = '#F4D03F';
            ctx.beginPath();
            ctx.arc(fx, fy, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    },
    drawWinter(ctx, w, h) {
        // 冬 - 雪花和雪地
        ctx.fillStyle = '#D5DBDB';
        ctx.fillRect(0, 0, w, h);
        // 雪地
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.65);
        ctx.quadraticCurveTo(w * 0.3, h * 0.6, w * 0.5, h * 0.65);
        ctx.quadraticCurveTo(w * 0.7, h * 0.7, w, h * 0.63);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();
        // 雪花
        ctx.strokeStyle = '#5DADE2';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        const cx = w * 0.5, cy = h * 0.3;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * 20, cy + Math.sin(angle) * 20);
            ctx.stroke();
        }
        // 雪人
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(w * 0.25, h * 0.78, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(w * 0.25, h * 0.65, 8, 0, Math.PI * 2);
        ctx.fill();
    },
    drawFlower(ctx, w, h) {
        // 花 - 大花朵
        const cx = w / 2, cy = h / 2 - 5;
        // 茎
        ctx.strokeStyle = '#27AE60';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 15);
        ctx.lineTo(cx, h * 0.9);
        ctx.stroke();
        // 叶子
        ctx.fillStyle = '#27AE60';
        ctx.beginPath();
        ctx.ellipse(cx + 15, cy + 30, 12, 6, 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx - 15, cy + 40, 12, 6, -0.5, 0, Math.PI * 2);
        ctx.fill();
        // 花瓣
        ctx.fillStyle = '#E74C3C';
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.ellipse(cx + Math.cos(angle) * 15, cy + Math.sin(angle) * 15, 10, 7, angle, 0, Math.PI * 2);
            ctx.fill();
        }
        // 花蕊
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
    },
    drawTree(ctx, w, h) {
        // 树 - 大树
        const cx = w / 2;
        // 树干
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(cx - 8, h * 0.45, 16, h * 0.45);
        // 树冠
        ctx.fillStyle = '#27AE60';
        ctx.beginPath();
        ctx.arc(cx, h * 0.35, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx - 18, h * 0.42, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 18, h * 0.42, 18, 0, Math.PI * 2);
        ctx.fill();
        // 小果子
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.arc(cx - 10, h * 0.3, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 12, h * 0.35, 4, 0, Math.PI * 2);
        ctx.fill();
    },
    drawGrass(ctx, w, h) {
        // 草 - 绿草地
        // 泥土
        ctx.fillStyle = '#BA8B5B';
        ctx.fillRect(0, h * 0.7, w, h * 0.3);
        // 草
        ctx.strokeStyle = '#27AE60';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        for (let i = 0; i < 12; i++) {
            const x = 10 + i * 11;
            const h1 = 20 + Math.random() * 30;
            ctx.beginPath();
            ctx.moveTo(x, h * 0.7);
            ctx.quadraticCurveTo(x + (Math.random() - 0.5) * 10, h * 0.7 - h1 * 0.6, x + (Math.random() - 0.5) * 8, h * 0.7 - h1);
            ctx.stroke();
        }
        // 蝴蝶
        ctx.fillStyle = '#9B59B6';
        ctx.beginPath();
        ctx.ellipse(w * 0.7, h * 0.35, 8, 5, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(w * 0.7 + 8, h * 0.35 + 2, 7, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();
    },
    drawBird(ctx, w, h) {
        // 鸟 - 小鸟
        const cx = w / 2, cy = h / 2;
        // 身体
        ctx.fillStyle = '#E67E22';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 22, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        // 头
        ctx.fillStyle = '#D35400';
        ctx.beginPath();
        ctx.arc(cx + 18, cy - 8, 12, 0, Math.PI * 2);
        ctx.fill();
        // 眼睛
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx + 22, cy - 10, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2C3E50';
        ctx.beginPath();
        ctx.arc(cx + 23, cy - 10, 2, 0, Math.PI * 2);
        ctx.fill();
        // 嘴巴
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.moveTo(cx + 30, cy - 8);
        ctx.lineTo(cx + 40, cy - 5);
        ctx.lineTo(cx + 30, cy - 3);
        ctx.closePath();
        ctx.fill();
        // 翅膀
        ctx.fillStyle = '#B7950B';
        ctx.beginPath();
        ctx.ellipse(cx - 5, cy - 5, 15, 8, -0.4, 0, Math.PI * 2);
        ctx.fill();
        // 尾巴
        ctx.fillStyle = '#8B6914';
        ctx.beginPath();
        ctx.moveTo(cx - 20, cy);
        ctx.lineTo(cx - 38, cy - 10);
        ctx.lineTo(cx - 35, cy + 5);
        ctx.closePath();
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
const earthAudio = {
    correct: 'audio/earth-explorer/correct.mp3',
    finalBadge: 'audio/earth-explorer/final-badge.mp3',
    story: (chId, idx) => `audio/earth-explorer/ch${chId}-story-${idx}.mp3`,
    hanzi: (chId, idx) => `audio/earth-explorer/ch${chId}-hanzi-${idx}.mp3`,
    quiz: (chId) => `audio/earth-explorer/ch${chId}-quiz.mp3`,
    quizOption: (chId, optIdx) => `audio/earth-explorer/ch${chId}-quiz-${['a','b','c'][optIdx]}.mp3`,
    quizHint: (chId) => `audio/earth-explorer/ch${chId}-quiz-hint.mp3`,
    math: (chId, qIdx) => qIdx > 0 ? `audio/earth-explorer/ch${chId}-math-${qIdx + 1}.mp3` : `audio/earth-explorer/ch${chId}-math.mp3`,
    mathHint: (chId, qIdx) => qIdx > 0 ? `audio/earth-explorer/ch${chId}-math-${qIdx + 1}-hint.mp3` : `audio/earth-explorer/ch${chId}-math-hint.mp3`,
    complete: (chId) => `audio/earth-explorer/ch${chId}-complete.mp3`
};

// ============ 存档 ============
function saveProgress() {
    localStorage.setItem('earthExplorer', JSON.stringify({
        completedChapters: gameState.completedChapters
    }));
}

function loadProgress() {
    try {
        const data = JSON.parse(localStorage.getItem('earthExplorer'));
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
    createEarth();
    createClouds();
    createMoonReference();
    addLights();

    window.addEventListener('resize', onWindowResize);

    // 纹理加载检测
    const checkLoaded = setInterval(() => {
        if (earthMesh && earthMesh.material && earthMesh.material.uniforms &&
            earthMesh.material.uniforms.planetTexture.value.image) {
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

// ============ 创建地球 ============
function createEarth() {
    const geometry = new THREE.SphereGeometry(6, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load('textures/earth_daymap.jpg');
    const nightMap = textureLoader.load('textures/earth_nightmap.jpg');

    const earthMaterial = new THREE.ShaderMaterial({
        uniforms: {
            planetTexture: { value: earthMap },
            nightTexture: { value: nightMap },
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
            uniform sampler2D nightTexture;
            uniform vec3 sunDirection;
            uniform float time;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vWorldPos;

            void main() {
                vec3 dayColor = texture2D(planetTexture, vUv).rgb;
                vec3 nightColor = texture2D(nightTexture, vUv).rgb;
                // 提亮纹理
                dayColor *= 1.15;

                // 光照
                vec3 lightDir = normalize(sunDirection);
                float diff = max(dot(vNormal, lightDir), 0.0);
                float ambient = 0.08;

                // 白天-黑夜混合
                float dayNightMix = smoothstep(-0.1, 0.2, diff);
                vec3 surfaceColor = mix(nightColor * 1.5, dayColor * (diff * 0.85 + ambient), dayNightMix);

                // Fresnel 蓝色大气边缘光
                vec3 viewDir = normalize(cameraPosition - vWorldPos);
                float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
                surfaceColor += vec3(0.3, 0.5, 1.0) * fresnel * 0.35;

                gl_FragColor = vec4(surfaceColor, 1.0);
            }
        `
    });

    earthMesh = new THREE.Mesh(geometry, earthMaterial);
    scene.add(earthMesh);
}

// ============ 创建云层 ============
function createClouds() {
    const geometry = new THREE.SphereGeometry(6.12, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const cloudsMap = textureLoader.load('textures/earth_clouds.jpg');

    const cloudsMaterial = new THREE.MeshPhongMaterial({
        map: cloudsMap,
        transparent: true,
        opacity: 0.35,
        depthWrite: false
    });

    cloudsMesh = new THREE.Mesh(geometry, cloudsMaterial);
    scene.add(cloudsMesh);
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

// ============ 创建远处小月球 ============
function createMoonReference() {
    const geometry = new THREE.SphereGeometry(1.2, 32, 32);
    const textureLoader = new THREE.TextureLoader();
    const moonMap = textureLoader.load('textures/moon.jpg');

    const material = new THREE.MeshPhongMaterial({
        map: moonMap,
        shininess: 5
    });

    moonRef = new THREE.Mesh(geometry, material);
    moonRef.position.set(35, 12, -25);
    scene.add(moonRef);
}

// ============ 灯光 ============
function addLights() {
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(50, 20, 30);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x112244, 0.3);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0x224466, 0.3);
    rimLight.position.set(-30, -10, -20);
    scene.add(rimLight);
}

// ============ 动画循环 ============
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    // 地球缓慢自转
    if (earthMesh) {
        earthMesh.rotation.y += delta * 0.05;
        if (earthMesh.material.uniforms) {
            earthMesh.material.uniforms.time.value = elapsed;
        }
    }

    // 云层稍快自转
    if (cloudsMesh) {
        cloudsMesh.rotation.y += delta * 0.07;
    }

    // 月球参照缓慢自转
    if (moonRef) {
        moonRef.rotation.y += delta * 0.08;
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
        // 我们的家园 - 正面全景
        animateCameraTo({ x: 0, y: 2, z: 16 }, { x: 0, y: 0, z: 0 });
    },
    2: () => {
        // 转啊转 - 侧面看自转
        animateCameraTo({ x: 15, y: 5, z: 12 }, { x: 0, y: 0, z: 0 });
    },
    3: () => {
        // 蓝色星球 - 俯视看海洋
        animateCameraTo({ x: -5, y: 12, z: 14 }, { x: 0, y: 0, z: 0 });
    },
    4: () => {
        // 空气外衣 - 远景看大气层
        animateCameraTo({ x: -10, y: 8, z: 18 }, { x: 0, y: 0, z: 0 });
    },
    5: () => {
        // 四季变化 - 斜上方看赤道倾斜
        animateCameraTo({ x: 8, y: 10, z: 15 }, { x: 0, y: 1, z: 0 });
    },
    6: () => {
        // 生命的摇篮 - 近景看地表
        animateCameraTo({ x: -2, y: -1, z: 13 }, { x: -2, y: 0, z: 0 });
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
    playAudio(earthAudio.story(ch.id, storyIndex + 1), plainText);

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
    playAudio(earthAudio.hanzi(ch.id, hanziIndex + 1), hanziText);

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

    const labels = ['A', 'B', 'C'];
    const fullText = ch.quiz.question + '。' + ch.quiz.options.map((opt, i) => labels[i] + '，' + opt.text).join('。') + '。选一选吧！';
    playAudio(earthAudio.quiz(ch.id), fullText);

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
            playAudio(earthAudio.quizOption(ch.id, i), labels[i] + '，' + opt.text);
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

    const audioPath = earthAudio.math(ch.id, qIdx);

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
        playAudio(earthAudio.correct, '太棒了！回答正确！');

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
        const hintAudioPath = type === 'math' ? earthAudio.mathHint(chId, gameState.mathQuestionIndex) : earthAudio.quizHint(chId);
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
    playAudio(earthAudio.complete(chId), `太厉害了！第${chId}章，${ch.title}，探险成功！你获得了一颗星星！`);

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
    playAudio(earthAudio.finalBadge, '恭喜智天！你完成了全部6个章节的地球探险！你获得了地球探险家大徽章！');
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
