/**
 * 天王星探险家 - 柳智天的宇宙课堂
 * 6大章节闯关：科普故事 → 汉字学习 → 知识测验 → 数学挑战 → 获得星星
 */

// ============ 全局变量 ============
let scene, camera, renderer, controls;
let uranusMesh, uranusRing, uranusGroup, earthRef, starField;
let clock;

// ============ 章节数据 ============
const chaptersData = [
    {
        id: 1,
        title: '横躺的行星',
        icon: '🔄',
        desc: '天王星为什么是躺着转',
        stories: [
            '天王星是一颗非常特别的行星——它是<span class="highlight">横着躺</span>在太空中的！',
            '科学家觉得很久很久以前，一颗地球大小的天体<span class="highlight">撞</span>了天王星，把它撞歪了。',
            '天王星的自转轴倾斜了<span class="highlight">98度</span>，就像一个球在地上滚着前进一样！'
        ],
        hanzi: [
            { char: '倒', pinyin: 'dǎo', words: '倒下 · 倒立', sentence: '天王星是横着躺倒的行星。', pictograph: 'drawFall' },
            { char: '转', pinyin: 'zhuàn', words: '旋转 · 转动', sentence: '地球像陀螺一样不停地转。', pictograph: 'drawSpin' },
            { char: '歪', pinyin: 'wāi', words: '歪斜 · 歪头', sentence: '小狗歪着头看着我。', pictograph: 'drawTilt' }
        ],
        quiz: {
            question: '天王星为什么是横着转的？',
            options: [
                { text: '被大天体撞歪了', correct: true },
                { text: '本来就这样', correct: false },
                { text: '太阳吹歪的', correct: false }
            ],
            hint: '很久以前被一颗地球大小的天体撞了...'
        },
        math: [
            {
                type: 'choice',
                question: '天王星倾斜了98度，直立的行星是0度，天王星比直立多歪了多少度？',
                options: [
                    { text: '88度', correct: false },
                    { text: '98度', correct: true },
                    { text: '90度', correct: false }
                ],
                hint: '98 - 0 = ?'
            },
            {
                type: 'fillin',
                question: '太阳系有8颗行星，横躺着转的只有1颗，竖着转的有几颗？',
                answer: 7,
                hint: '8 - 1 = 7'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 8,
                right: 1,
                answer: '>',
                hint: '8比1大！竖着转的行星比横着转的多。'
            }
        ]
    },
    {
        id: 2,
        title: '冰巨星的秘密',
        icon: '🧊',
        desc: '天王星是一颗冰巨星',
        stories: [
            '天王星和海王星被称为<span class="highlight">"冰巨星"</span>，和木星、土星不一样。',
            '天王星的内部有大量的<span class="highlight">水冰、甲烷冰和氨冰</span>，就像一个巨大的冰球。',
            '天王星之所以看起来是<span class="highlight">青蓝色</span>的，是因为大气中的甲烷气体会吸收红光。'
        ],
        hanzi: [
            { char: '冷', pinyin: 'lěng', words: '寒冷 · 冰冷', sentence: '冬天好冷，要穿厚衣服。', pictograph: 'drawCold' },
            { char: '蓝', pinyin: 'lán', words: '蓝色 · 蓝天', sentence: '天王星是美丽的蓝色。', pictograph: 'drawBlue' },
            { char: '气', pinyin: 'qì', words: '空气 · 气球', sentence: '天王星的大气有甲烷气。', pictograph: 'drawGas' }
        ],
        quiz: {
            question: '天王星为什么看起来是青蓝色的？',
            options: [
                { text: '因为有很多海洋', correct: false },
                { text: '因为大气中的甲烷吸收红光', correct: true },
                { text: '因为太阳照的', correct: false }
            ],
            hint: '大气中有一种特殊的气体...'
        },
        math: [
            {
                type: 'choice',
                question: '太阳系有2颗冰巨星和2颗气态巨行星，一共几颗巨行星？',
                options: [
                    { text: '3颗', correct: false },
                    { text: '4颗', correct: true },
                    { text: '5颗', correct: false }
                ],
                hint: '2 + 2 = ?'
            },
            {
                type: 'fillin',
                question: '天王星有3种冰：水冰、甲烷冰、氨冰，如果融化了1种，还剩几种？',
                answer: 2,
                hint: '3 - 1 = 2'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 2,
                right: 2,
                answer: '=',
                hint: '2和2一样大！冰巨星和气态巨行星一样多。'
            }
        ]
    },
    {
        id: 3,
        title: '天王星的光环',
        icon: '💫',
        desc: '暗淡而神秘的环系统',
        stories: [
            '你知道吗？天王星也有<span class="highlight">光环</span>！只是比土星的暗淡得多。',
            '天王星一共有<span class="highlight">13道</span>光环，它们非常细而且很暗，肉眼看不到。',
            '天王星的光环是<span class="highlight">竖着的</span>！因为天王星是横躺的，所以环也跟着竖起来了。'
        ],
        hanzi: [
            { char: '暗', pinyin: 'àn', words: '黑暗 · 暗淡', sentence: '关了灯，房间一片暗。', pictograph: 'drawDark' },
            { char: '细', pinyin: 'xì', words: '细小 · 细线', sentence: '天王星的光环又细又暗。', pictograph: 'drawThin' },
            { char: '竖', pinyin: 'shù', words: '竖立 · 竖起', sentence: '天王星的光环是竖着的。', pictograph: 'drawVertical' }
        ],
        quiz: {
            question: '天王星有几道光环？',
            options: [
                { text: '7道', correct: false },
                { text: '13道', correct: true },
                { text: '100道', correct: false }
            ],
            hint: '比10多，比15少...'
        },
        math: [
            {
                type: 'choice',
                question: '天王星有13道环，科学家先发现了9道，后来又发现了几道？',
                options: [
                    { text: '3道', correct: false },
                    { text: '4道', correct: true },
                    { text: '5道', correct: false }
                ],
                hint: '13 - 9 = ?'
            },
            {
                type: 'fillin',
                question: '天王星有13道环，土星肉眼可见的环有3道，天王星比土星多几道？',
                answer: 10,
                hint: '13 - 3 = 10'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 9,
                right: 4,
                answer: '>',
                hint: '9比4大！先发现的环比后发现的多。'
            }
        ]
    },
    {
        id: 4,
        title: '奇特的卫星',
        icon: '🌕',
        desc: '以莎士比亚命名的卫星',
        stories: [
            '天王星有<span class="highlight">27颗</span>已知的卫星，它们都是以文学作品中的人物命名的！',
            '其中最大的卫星叫<span class="highlight">天卫三</span>（泰坦妮亚），它的表面有峡谷和悬崖。',
            '还有一颗叫<span class="highlight">天卫五</span>（米兰达）的卫星特别奇怪，表面有一个高达20公里的大悬崖！'
        ],
        hanzi: [
            { char: '高', pinyin: 'gāo', words: '高大 · 高山', sentence: '天卫五的悬崖特别高。', pictograph: 'drawTall' },
            { char: '名', pinyin: 'míng', words: '名字 · 有名', sentence: '天王星的卫星名字很好听。', pictograph: 'drawName' },
            { char: '深', pinyin: 'shēn', words: '深处 · 深海', sentence: '峡谷很深很深。', pictograph: 'drawDeep' }
        ],
        quiz: {
            question: '天王星的卫星是以什么命名的？',
            options: [
                { text: '科学家的名字', correct: false },
                { text: '文学作品人物', correct: true },
                { text: '数字编号', correct: false }
            ],
            hint: '是文学作品中的人物哦...'
        },
        math: [
            {
                type: 'choice',
                question: '天王星有27颗卫星，其中5颗比较大，小卫星有几颗？',
                options: [
                    { text: '20颗', correct: false },
                    { text: '22颗', correct: true },
                    { text: '25颗', correct: false }
                ],
                hint: '27 - 5 = ?'
            },
            {
                type: 'fillin',
                question: '探测器拍了5颗大卫星的照片，又拍了3颗小卫星，一共拍了几颗？',
                answer: 8,
                hint: '5 + 3 = 8'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 5,
                right: 3,
                answer: '>',
                hint: '5比3大！拍大卫星比拍小卫星多。'
            }
        ]
    },
    {
        id: 5,
        title: '极端的季节',
        icon: '❄️',
        desc: '42年的白天和黑夜',
        stories: [
            '因为天王星是横着转的，所以它的季节<span class="highlight">非常极端</span>！',
            '天王星的一个极地面朝太阳时，那里会有<span class="highlight">连续42年的白天</span>！',
            '然后另一个极转向太阳，前一个极就开始<span class="highlight">连续42年的黑夜</span>！天王星绕太阳一圈要84年。'
        ],
        hanzi: [
            { char: '长', pinyin: 'cháng', words: '长久 · 很长', sentence: '天王星的一天很长。', pictograph: 'drawLong' },
            { char: '黑', pinyin: 'hēi', words: '黑夜 · 黑色', sentence: '天王星的极地有42年黑夜。', pictograph: 'drawBlack' },
            { char: '白', pinyin: 'bái', words: '白天 · 白色', sentence: '天王星的极地有42年白天。', pictograph: 'drawWhite' }
        ],
        quiz: {
            question: '天王星绕太阳一圈要多少年？',
            options: [
                { text: '42年', correct: false },
                { text: '84年', correct: true },
                { text: '100年', correct: false }
            ],
            hint: '42年白天加42年黑夜...'
        },
        math: [
            {
                type: 'choice',
                question: '天王星极地有42年白天和42年黑夜，加起来是多少年？',
                options: [
                    { text: '80年', correct: false },
                    { text: '84年', correct: true },
                    { text: '82年', correct: false }
                ],
                hint: '42 + 42 = ?'
            },
            {
                type: 'fillin',
                question: '地球1年有4个季节，天王星也有4个季节但每个季节约21年，21比4多几？',
                answer: 17,
                hint: '21 - 4 = 17'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 42,
                right: 42,
                answer: '=',
                hint: '42和42一样大！白天和黑夜一样长。'
            }
        ]
    },
    {
        id: 6,
        title: '发现天王星',
        icon: '🔭',
        desc: '用望远镜发现的行星',
        stories: [
            '天王星是第一颗用<span class="highlight">望远镜</span>发现的行星！之前的行星都能用肉眼看到。',
            '1781年，一位叫<span class="highlight">赫歇尔</span>的天文学家用自制的望远镜发现了它。',
            '旅行者2号是唯一<span class="highlight">飞越天王星</span>的探测器，它在1986年拍下了天王星的照片。'
        ],
        hanzi: [
            { char: '看', pinyin: 'kàn', words: '看见 · 好看', sentence: '用望远镜可以看到很远。', pictograph: 'drawLook' },
            { char: '远', pinyin: 'yuǎn', words: '远方 · 遥远', sentence: '天王星离太阳很远。', pictograph: 'drawFar' },
            { char: '新', pinyin: 'xīn', words: '新发现 · 新的', sentence: '赫歇尔发现了新行星。', pictograph: 'drawNew' }
        ],
        quiz: {
            question: '天王星是怎么被发现的？',
            options: [
                { text: '肉眼看到的', correct: false },
                { text: '飞船发现的', correct: false },
                { text: '用望远镜发现的', correct: true }
            ],
            hint: '赫歇尔用了一种工具...'
        },
        math: [
            {
                type: 'choice',
                question: '天王星在1781年被发现，旅行者2号1986年飞越，相隔多少年？',
                options: [
                    { text: '195年', correct: false },
                    { text: '205年', correct: true },
                    { text: '215年', correct: false }
                ],
                hint: '1986 - 1781 = ?'
            },
            {
                type: 'fillin',
                question: '旅行者2号拍了6张天王星的照片和4张卫星的照片，一共几张？',
                answer: 10,
                hint: '6 + 4 = 10'
            },
            {
                type: 'compare',
                question: '比一比大小',
                left: 6,
                right: 4,
                answer: '>',
                hint: '6比4大！天王星的照片比卫星的多。'
            }
        ]
    }
];

// ============ 象形图绘制函数 ============
const pictographDrawers = {
    drawFall(ctx, w, h) {
        // 倒 - 一个倒下的人
        ctx.strokeStyle = '#F4D03F';
        ctx.lineWidth = 4;
        // 站着的人（虚线）
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(244, 208, 63, 0.3)';
        ctx.beginPath();
        ctx.arc(30, 30, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(30, 38);
        ctx.lineTo(30, 70);
        ctx.stroke();
        ctx.setLineDash([]);
        // 倒下的人
        ctx.strokeStyle = '#F4D03F';
        ctx.beginPath();
        ctx.arc(w / 2 + 10, h / 2 + 15, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w / 2 + 10, h / 2 + 25);
        ctx.lineTo(w / 2 + 50, h / 2 + 25);
        ctx.stroke();
        // 腿
        ctx.beginPath();
        ctx.moveTo(w / 2 + 50, h / 2 + 25);
        ctx.lineTo(w / 2 + 60, h / 2 + 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w / 2 + 50, h / 2 + 25);
        ctx.lineTo(w / 2 + 60, h / 2 + 40);
        ctx.stroke();
        // 弧线箭头
        ctx.strokeStyle = '#72D8E0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(50, 50, 30, -Math.PI / 2, Math.PI / 6);
        ctx.stroke();
    },
    drawSpin(ctx, w, h) {
        // 转 - 旋转的箭头
        const cx = w / 2, cy = h / 2;
        ctx.strokeStyle = '#72D8E0';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 1.5);
        ctx.stroke();
        // 箭头
        const arrowX = cx;
        const arrowY = cy - 30;
        ctx.fillStyle = '#72D8E0';
        ctx.beginPath();
        ctx.moveTo(arrowX - 8, arrowY + 5);
        ctx.lineTo(arrowX + 5, arrowY);
        ctx.lineTo(arrowX - 3, arrowY - 8);
        ctx.closePath();
        ctx.fill();
        // 中心圆
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
    },
    drawTilt(ctx, w, h) {
        // 歪 - 歪着的天王星
        ctx.fillStyle = '#72D8E0';
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(Math.PI / 3);
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();
        // 光环
        ctx.strokeStyle = 'rgba(114, 216, 224, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 40, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        // 虚线参考（正常轴）
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w / 2, 10);
        ctx.lineTo(w / 2, h - 10);
        ctx.stroke();
        ctx.setLineDash([]);
    },
    drawCold(ctx, w, h) {
        // 冷 - 雪花
        const cx = w / 2, cy = h / 2;
        ctx.strokeStyle = '#AED6F1';
        ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * 35, cy + Math.sin(angle) * 35);
            ctx.stroke();
            // 小分支
            const bx = cx + Math.cos(angle) * 20;
            const by = cy + Math.sin(angle) * 20;
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(bx + Math.cos(angle + 0.5) * 10, by + Math.sin(angle + 0.5) * 10);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(bx + Math.cos(angle - 0.5) * 10, by + Math.sin(angle - 0.5) * 10);
            ctx.stroke();
        }
        ctx.fillStyle = '#AED6F1';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
    },
    drawBlue(ctx, w, h) {
        // 蓝 - 蓝色渐变球
        const cx = w / 2, cy = h / 2;
        const grad = ctx.createRadialGradient(cx - 10, cy - 10, 5, cx, cy, 40);
        grad.addColorStop(0, '#A8E6EF');
        grad.addColorStop(0.5, '#72D8E0');
        grad.addColorStop(1, '#2980B9');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, 40, 0, Math.PI * 2);
        ctx.fill();
        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(cx - 12, cy - 12, 12, 0, Math.PI * 2);
        ctx.fill();
    },
    drawGas(ctx, w, h) {
        // 气 - 气体飘散
        ctx.strokeStyle = 'rgba(114, 216, 224, 0.6)';
        ctx.lineWidth = 3;
        const waves = [[30, 50], [50, 40], [70, 60], [90, 35]];
        waves.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.moveTo(x, y + 30);
            ctx.quadraticCurveTo(x + 10, y, x + 20, y + 15);
            ctx.quadraticCurveTo(x + 30, y + 30, x + 10, y + 5);
            ctx.stroke();
        });
        // 气泡
        ctx.fillStyle = 'rgba(114, 216, 224, 0.3)';
        [[40, 80, 8], [70, 75, 6], [100, 85, 10], [55, 95, 5]].forEach(([x, y, r]) => {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        });
    },
    drawDark(ctx, w, h) {
        // 暗 - 黑暗中的微光
        const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, 55);
        grad.addColorStop(0, 'rgba(60, 60, 80, 0.8)');
        grad.addColorStop(1, 'rgba(5, 5, 15, 1)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        // 微弱的星光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        [[30, 40, 2], [80, 25, 1.5], [110, 60, 1], [50, 90, 2], [95, 100, 1.5]].forEach(([x, y, r]) => {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        });
        // 月牙
        ctx.fillStyle = 'rgba(200, 200, 220, 0.2)';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(5, 5, 15, 1)';
        ctx.beginPath();
        ctx.arc(w / 2 + 10, h / 2 - 5, 18, 0, Math.PI * 2);
        ctx.fill();
    },
    drawThin(ctx, w, h) {
        // 细 - 细线和粗线对比
        // 粗线
        ctx.strokeStyle = '#E67E22';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(30, 30);
        ctx.lineTo(30, h - 30);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '10px Noto Sans SC';
        ctx.fillText('粗', 22, h - 15);
        // 细线
        ctx.strokeStyle = '#72D8E0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(70, 30);
        ctx.lineTo(70, h - 30);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText('细', 62, h - 15);
        // 天王星环示意
        ctx.strokeStyle = 'rgba(114, 216, 224, 0.5)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.ellipse(w / 2 + 25, h / 2, 15 + i * 4, 35 + i * 4, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
    },
    drawVertical(ctx, w, h) {
        // 竖 - 竖着的环
        const cx = w / 2, cy = h / 2;
        // 天王星（横着）
        ctx.fillStyle = '#72D8E0';
        ctx.save();
        ctx.translate(cx, cy);
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        // 竖着的环
        ctx.strokeStyle = 'rgba(200, 220, 230, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 35, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        // "竖" 标注箭头
        ctx.strokeStyle = '#F4D03F';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + 30, cy - 30);
        ctx.lineTo(cx + 30, cy + 30);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 25, cy - 25);
        ctx.lineTo(cx + 30, cy - 30);
        ctx.lineTo(cx + 35, cy - 25);
        ctx.stroke();
    },
    drawTall(ctx, w, h) {
        // 高 - 高高的悬崖
        ctx.fillStyle = '#7F8C8D';
        // 悬崖
        ctx.beginPath();
        ctx.moveTo(20, h - 20);
        ctx.lineTo(20, 25);
        ctx.lineTo(60, 25);
        ctx.lineTo(60, h / 2);
        ctx.lineTo(w - 20, h / 2);
        ctx.lineTo(w - 20, h - 20);
        ctx.closePath();
        ctx.fill();
        // 悬崖纹理
        ctx.strokeStyle = '#95A5A6';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(60, 25);
        ctx.lineTo(60, h / 2);
        ctx.stroke();
        // 高度标注
        ctx.strokeStyle = '#F4D03F';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(75, 25);
        ctx.lineTo(75, h / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#F4D03F';
        ctx.font = '14px Noto Sans SC';
        ctx.textAlign = 'center';
        ctx.fillText('高', 85, h / 2 - 20);
        // 小人
        ctx.fillStyle = '#3498DB';
        ctx.beginPath();
        ctx.arc(40, 18, 5, 0, Math.PI * 2);
        ctx.fill();
    },
    drawName(ctx, w, h) {
        // 名 - 名字标签
        const cx = w / 2, cy = h / 2;
        // 标签背景
        ctx.fillStyle = 'rgba(114, 216, 224, 0.2)';
        ctx.strokeStyle = '#72D8E0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cx - 40, cy - 25, 80, 50, 10);
        ctx.fill();
        ctx.stroke();
        // 文字
        ctx.fillStyle = '#F4D03F';
        ctx.font = 'bold 16px Noto Sans SC';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('泰坦妮亚', cx, cy);
        // 星星装饰
        ctx.fillStyle = '#72D8E0';
        ctx.font = '14px serif';
        ctx.fillText('⭐', cx - 35, cy - 30);
        ctx.fillText('⭐', cx + 25, cy - 30);
    },
    drawDeep(ctx, w, h) {
        // 深 - 深谷
        ctx.fillStyle = '#8B7355';
        // 左壁
        ctx.beginPath();
        ctx.moveTo(10, 20);
        ctx.lineTo(w / 2 - 15, 20);
        ctx.lineTo(w / 2 - 8, h - 10);
        ctx.lineTo(10, h - 40);
        ctx.closePath();
        ctx.fill();
        // 右壁
        ctx.fillStyle = '#6B5340';
        ctx.beginPath();
        ctx.moveTo(w / 2 + 15, 20);
        ctx.lineTo(w - 10, 20);
        ctx.lineTo(w - 10, h - 40);
        ctx.lineTo(w / 2 + 8, h - 10);
        ctx.closePath();
        ctx.fill();
        // 谷底
        const grad = ctx.createLinearGradient(0, h / 2, 0, h);
        grad.addColorStop(0, 'rgba(20, 20, 40, 0.3)');
        grad.addColorStop(1, 'rgba(5, 5, 15, 0.9)');
        ctx.fillStyle = grad;
        ctx.fillRect(w / 2 - 10, h / 2, 20, h / 2);
        // 深度标注
        ctx.strokeStyle = '#F4D03F';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(w / 2, 25);
        ctx.lineTo(w / 2, h - 15);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#F4D03F';
        ctx.font = '12px Noto Sans SC';
        ctx.textAlign = 'center';
        ctx.fillText('深', w / 2 + 18, h / 2);
    },
    drawLong(ctx, w, h) {
        // 长 - 长长的时间线
        ctx.strokeStyle = '#72D8E0';
        ctx.lineWidth = 3;
        // 长线
        ctx.beginPath();
        ctx.moveTo(15, h / 2);
        ctx.lineTo(w - 15, h / 2);
        ctx.stroke();
        // 箭头
        ctx.beginPath();
        ctx.moveTo(w - 25, h / 2 - 8);
        ctx.lineTo(w - 15, h / 2);
        ctx.lineTo(w - 25, h / 2 + 8);
        ctx.stroke();
        // 刻度
        ctx.fillStyle = '#F4D03F';
        ctx.font = '10px Noto Sans SC';
        ctx.textAlign = 'center';
        for (let i = 0; i < 5; i++) {
            const x = 25 + i * 25;
            ctx.beginPath();
            ctx.moveTo(x, h / 2 - 5);
            ctx.lineTo(x, h / 2 + 5);
            ctx.stroke();
        }
        ctx.fillText('42年', w / 2, h / 2 - 15);
        ctx.fillText('很长！', w / 2, h / 2 + 25);
    },
    drawBlack(ctx, w, h) {
        // 黑 - 黑夜
        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(0, 0, w, h);
        // 星星
        ctx.fillStyle = '#fff';
        [[20, 30, 2], [50, 15, 1.5], [80, 40, 1], [110, 20, 2], [35, 70, 1.5],
         [70, 80, 1], [100, 65, 2], [25, 100, 1], [90, 95, 1.5]].forEach(([x, y, r]) => {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        });
        // "黑夜" 文字
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = '16px Noto Sans SC';
        ctx.textAlign = 'center';
        ctx.fillText('黑夜', w / 2, h - 15);
    },
    drawWhite(ctx, w, h) {
        // 白 - 白天
        const grad = ctx.createRadialGradient(w / 2, 30, 10, w / 2, h / 2, 70);
        grad.addColorStop(0, '#FFF8DC');
        grad.addColorStop(0.5, '#87CEEB');
        grad.addColorStop(1, '#4A90D9');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        // 太阳
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.arc(w / 2, 30, 18, 0, Math.PI * 2);
        ctx.fill();
        // 光线
        ctx.strokeStyle = '#F4D03F';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            ctx.beginPath();
            ctx.moveTo(w / 2 + Math.cos(angle) * 22, 30 + Math.sin(angle) * 22);
            ctx.lineTo(w / 2 + Math.cos(angle) * 30, 30 + Math.sin(angle) * 30);
            ctx.stroke();
        }
        // 地面
        ctx.fillStyle = '#27AE60';
        ctx.fillRect(0, h - 25, w, 25);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.font = '14px Noto Sans SC';
        ctx.textAlign = 'center';
        ctx.fillText('白天', w / 2, h - 30);
    },
    drawLook(ctx, w, h) {
        // 看 - 望远镜
        ctx.strokeStyle = '#E8D5A3';
        ctx.lineWidth = 3;
        // 镜筒
        ctx.beginPath();
        ctx.moveTo(30, h - 30);
        ctx.lineTo(w - 30, 30);
        ctx.stroke();
        // 大镜片
        ctx.strokeStyle = '#72D8E0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(w - 25, 25, 15, 10, -Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(114, 216, 224, 0.2)';
        ctx.fill();
        // 小镜片
        ctx.strokeStyle = '#E8D5A3';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(35, h - 25, 8, 0, Math.PI * 2);
        ctx.stroke();
        // 三脚架
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        ctx.lineTo(w / 2 - 20, h - 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        ctx.lineTo(w / 2 + 20, h - 10);
        ctx.stroke();
        // 星星
        ctx.fillStyle = '#F4D03F';
        ctx.font = '16px serif';
        ctx.fillText('⭐', w - 40, 15);
    },
    drawFar(ctx, w, h) {
        // 远 - 远方
        ctx.fillStyle = '#1a1a3a';
        ctx.fillRect(0, 0, w, h);
        // 近处大星球
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.arc(25, h - 25, 20, 0, Math.PI * 2);
        ctx.fill();
        // 中间
        ctx.fillStyle = '#E67E22';
        ctx.beginPath();
        ctx.arc(60, h / 2, 10, 0, Math.PI * 2);
        ctx.fill();
        // 远处小星球
        ctx.fillStyle = '#72D8E0';
        ctx.beginPath();
        ctx.arc(w - 25, 25, 5, 0, Math.PI * 2);
        ctx.fill();
        // 距离标注虚线
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.setLineDash([3, 5]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(45, h - 25);
        ctx.lineTo(w - 30, 25);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '11px Noto Sans SC';
        ctx.textAlign = 'center';
        ctx.fillText('很远', w / 2, h / 2 - 10);
    },
    drawNew(ctx, w, h) {
        // 新 - 新发现的闪光
        const cx = w / 2, cy = h / 2;
        // 爆炸式闪光
        ctx.fillStyle = '#F4D03F';
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI) / 6;
            const len = i % 2 === 0 ? 35 : 20;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
            ctx.lineTo(cx + Math.cos(angle + Math.PI / 12) * (len * 0.3), cy + Math.sin(angle + Math.PI / 12) * (len * 0.3));
            ctx.closePath();
            ctx.fill();
        }
        // 中心
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fill();
        // NEW 标记
        ctx.fillStyle = '#72D8E0';
        ctx.font = 'bold 12px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('NEW!', cx, cy + 45);
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
const uranusAudio = {
    correct: 'audio/uranus/correct.mp3',
    finalBadge: 'audio/uranus/final-badge.mp3',
    story: (chId, idx) => `audio/uranus/ch${chId}-story-${idx}.mp3`,
    hanzi: (chId, idx) => `audio/uranus/ch${chId}-hanzi-${idx}.mp3`,
    quiz: (chId) => `audio/uranus/ch${chId}-quiz.mp3`,
    quizHint: (chId) => `audio/uranus/ch${chId}-quiz-hint.mp3`,
    math: (chId, qIdx) => qIdx > 0 ? `audio/uranus/ch${chId}-math-${qIdx + 1}.mp3` : `audio/uranus/ch${chId}-math.mp3`,
    mathHint: (chId, qIdx) => qIdx > 0 ? `audio/uranus/ch${chId}-math-${qIdx + 1}-hint.mp3` : `audio/uranus/ch${chId}-math-hint.mp3`,
    complete: (chId) => `audio/uranus/ch${chId}-complete.mp3`
};

// ============ 存档 ============
function saveProgress() {
    localStorage.setItem('uranusExplorer', JSON.stringify({
        completedChapters: gameState.completedChapters
    }));
}

function loadProgress() {
    try {
        const data = JSON.parse(localStorage.getItem('uranusExplorer'));
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
    createUranus();
    createEarthReference();
    addLights();

    window.addEventListener('resize', onWindowResize);

    // 纹理加载检测
    const checkLoaded = setInterval(() => {
        if (uranusMesh && uranusMesh.material && uranusMesh.material.uniforms &&
            uranusMesh.material.uniforms.planetTexture.value.image) {
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

// ============ 创建天王星（球体+光环） ============
function createUranus() {
    // 天王星组（球体+环一起倾斜）
    uranusGroup = new THREE.Group();

    const textureLoader = new THREE.TextureLoader();
    const uranusMap = textureLoader.load('textures/uranus.jpg');

    // 天王星球体
    const geometry = new THREE.SphereGeometry(6, 64, 64);
    const uranusMaterial = new THREE.ShaderMaterial({
        uniforms: {
            planetTexture: { value: uranusMap },
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

                // Fresnel 青蓝色大气边缘光
                vec3 viewDir = normalize(cameraPosition - vWorldPos);
                float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
                surfaceColor += vec3(0.3, 0.8, 0.85) * fresnel * 0.25;

                gl_FragColor = vec4(surfaceColor, 1.0);
            }
        `
    });

    uranusMesh = new THREE.Mesh(geometry, uranusMaterial);
    uranusGroup.add(uranusMesh);

    // 天王星光环（细而暗淡）
    const innerRadius = 7.8;
    const outerRadius = 10.5;
    const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 128);

    // 修正UV
    const pos = ringGeo.attributes.position;
    const uv = ringGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
        const dist = Math.sqrt(x * x + y * y);
        uv.setXY(i, (dist - innerRadius) / (outerRadius - innerRadius), 0.5);
    }

    const ringMat = new THREE.MeshBasicMaterial({
        color: 0x8899aa,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.25
    });

    uranusRing = new THREE.Mesh(ringGeo, ringMat);
    uranusRing.rotation.x = -Math.PI / 2; // 平放
    uranusGroup.add(uranusRing);

    // 天王星整体倾斜约98度（几乎横躺）
    uranusGroup.rotation.z = THREE.MathUtils.degToRad(98);

    scene.add(uranusGroup);
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

    const rimLight = new THREE.DirectionalLight(0x446688, 0.3);
    rimLight.position.set(-30, -10, -20);
    scene.add(rimLight);
}

// ============ 动画循环 ============
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    // 天王星缓慢自转
    if (uranusMesh) {
        uranusMesh.rotation.y += delta * 0.06;
        if (uranusMesh.material.uniforms) {
            uranusMesh.material.uniforms.time.value = elapsed;
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
        // 横躺 - 侧面看倾斜
        animateCameraTo({ x: 15, y: 5, z: 18 }, { x: 0, y: 0, z: 0 });
    },
    2: () => {
        // 冰巨星 - 正面近景
        animateCameraTo({ x: 0, y: 2, z: 18 }, { x: 0, y: 0, z: 0 });
    },
    3: () => {
        // 光环 - 从上方斜看
        animateCameraTo({ x: 5, y: 15, z: 15 }, { x: 0, y: 0, z: 0 });
    },
    4: () => {
        // 卫星 - 远景
        animateCameraTo({ x: -12, y: 8, z: 20 }, { x: 0, y: 0, z: 0 });
    },
    5: () => {
        // 极端季节 - 俯视看极地
        animateCameraTo({ x: 5, y: 18, z: 12 }, { x: 0, y: 0, z: 0 });
    },
    6: () => {
        // 发现天王星 - 全景远景
        animateCameraTo({ x: -5, y: 3, z: 22 }, { x: 0, y: 0, z: 0 });
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
    playAudio(uranusAudio.story(ch.id, storyIndex + 1), plainText);

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
    playAudio(uranusAudio.hanzi(ch.id, hanziIndex + 1), hanziText);

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

    playAudio(uranusAudio.quiz(ch.id), ch.quiz.question);

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

    const audioPath = uranusAudio.math(ch.id, qIdx);

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
        for (let n = 0; n <= 20; n++) {
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
        playAudio(uranusAudio.correct, '太棒了！回答正确！');

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
            ? uranusAudio.mathHint(chId, gameState.mathQuestionIndex)
            : uranusAudio.quizHint(chId);
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
    playAudio(uranusAudio.complete(chId), `太厉害了！第${chId}章，${ch.title}，探险成功！你获得了一颗星星！`);

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
    playAudio(uranusAudio.finalBadge, '恭喜智天！你完成了全部6个章节的天王星探险！你获得了天王星探险家大徽章！');
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
