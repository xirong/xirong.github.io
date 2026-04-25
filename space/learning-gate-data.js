/**
 * 宇宙能量补给题库
 * 入口闸门只读取这里的 plan 和 questionBanks，后续可以继续加入汉字识别、拼音等题型。
 */
(function () {
    const SPACE_ENERGY_MATH_QUESTIONS = [
        {
            id: 'sun-add-rock-gas-planets',
            kind: 'math',
            type: 'add',
            source: '太阳探险家',
            question: '太阳系有4个岩石行星和4个气态行星，一共几个？',
            expression: '4 + 4',
            answer: 8,
            hint: '4加4等于8'
        },
        {
            id: 'sun-add-light-energy',
            kind: 'math',
            type: 'add',
            source: '太阳探险家',
            question: '太阳能板今天收集了6份光能，又收集了4份，一共收集了几份光能？',
            expression: '6 + 4',
            answer: 10,
            hint: '6加4等于10'
        },
        {
            id: 'mars-add-volcanoes',
            kind: 'math',
            type: 'add',
            source: '火星探险家',
            question: '火星上有3座大火山和4座小火山，一共几座？',
            expression: '3 + 4',
            answer: 7,
            hint: '3加4等于7'
        },
        {
            id: 'mars-add-rovers-photos',
            kind: 'math',
            type: 'add',
            source: '火星探险家',
            question: '祝融号拍了4张照片，好奇号拍了6张，一共拍了几张？',
            expression: '4 + 6',
            answer: 10,
            hint: '4加6等于10'
        },
        {
            id: 'jupiter-add-moons',
            kind: 'math',
            type: 'add',
            source: '木星探险家',
            question: '木星有4颗大卫星和3颗小卫星在身边，一共几颗？',
            expression: '4 + 3',
            answer: 7,
            hint: '4加3等于7'
        },
        {
            id: 'jupiter-add-ice-rivers',
            kind: 'math',
            type: 'add',
            source: '木星探险家',
            question: '木卫二的冰面下有4条地下河，科学家又发现了5条，一共几条？',
            expression: '4 + 5',
            answer: 9,
            hint: '4加5等于9'
        },
        {
            id: 'saturn-add-rings',
            kind: 'math',
            type: 'add',
            source: '土星探险家',
            question: '土星环有3层明亮的环和4层暗淡的环，一共几层？',
            expression: '3 + 4',
            answer: 7,
            hint: '3加4等于7'
        },
        {
            id: 'saturn-add-cassini-photos',
            kind: 'math',
            type: 'add',
            source: '土星探险家',
            question: '卡西尼号拍了5张土星照片和4张卫星照片，一共几张？',
            expression: '5 + 4',
            answer: 9,
            hint: '5加4等于9'
        },
        {
            id: 'moon-add-astronauts',
            kind: 'math',
            type: 'add',
            source: '月球探险家',
            question: '月球上有4个宇航员，又来了3个，现在一共有几个？',
            expression: '4 + 3',
            answer: 7,
            hint: '4加3等于7'
        },
        {
            id: 'moon-add-spacesuits',
            kind: 'math',
            type: 'add',
            source: '月球探险家',
            question: '月球基地里有6名宇航员，又乘飞船来了4名，现在月球基地有几名宇航员？',
            expression: '6 + 4',
            answer: 10,
            hint: '6加4等于10'
        },
        {
            id: 'neptune-add-blue-zones',
            kind: 'math',
            type: 'add',
            source: '海王星探险家',
            question: '海王星的深蓝色很美，科学家数了5个蓝色区域，又发现了3个，一共几个？',
            expression: '5 + 3',
            answer: 8,
            hint: '5加3等于8'
        },
        {
            id: 'mercury-add-craters',
            kind: 'math',
            type: 'add',
            source: '水星探险家',
            question: '水星上有4个大陨石坑和5个小坑，一共几个？',
            expression: '4 + 5',
            answer: 9,
            hint: '4加5等于9'
        },
        {
            id: 'sun-sub-earth-models',
            kind: 'math',
            type: 'sub',
            source: '太阳探险家',
            question: '太阳能装下130万个地球！桌上原来有9个地球模型，搬走了3个，还剩几个？',
            expression: '9 - 3',
            answer: 6,
            hint: '9减3等于6'
        },
        {
            id: 'sun-sub-light-rays',
            kind: 'math',
            type: 'sub',
            source: '太阳探险家',
            question: '太阳发出了9束光线，有4束照到了地球，还有几束没照到地球？',
            expression: '9 - 4',
            answer: 5,
            hint: '9减4等于5'
        },
        {
            id: 'mars-sub-red-stones',
            kind: 'math',
            type: 'sub',
            source: '火星探险家',
            question: '火星表面有6块红色石头，风吹走了2块，还剩几块？',
            expression: '6 - 2',
            answer: 4,
            hint: '6减2等于4'
        },
        {
            id: 'mars-sub-ice',
            kind: 'math',
            type: 'sub',
            source: '火星探险家',
            question: '火星北极有7块大冰，融化了1块，还有几块？',
            expression: '7 - 1',
            answer: 6,
            hint: '7减1等于6'
        },
        {
            id: 'jupiter-sub-cloud-layers',
            kind: 'math',
            type: 'sub',
            source: '木星探险家',
            question: '木星大气有5层，我们看到了3层，还有几层没看到？',
            expression: '5 - 3',
            answer: 2,
            hint: '5减3等于2'
        },
        {
            id: 'jupiter-sub-dust',
            kind: 'math',
            type: 'sub',
            source: '木星探险家',
            question: '木星环上飘着6粒尘埃，飞走了2粒，还剩几粒？',
            expression: '6 - 2',
            answer: 4,
            hint: '6减2等于4'
        },
        {
            id: 'saturn-sub-ice-blocks',
            kind: 'math',
            type: 'sub',
            source: '土星探险家',
            question: '土星环上有8块大冰块，碎掉了2块，还剩几块？',
            expression: '8 - 2',
            answer: 6,
            hint: '8减2等于6'
        },
        {
            id: 'saturn-sub-rivers',
            kind: 'math',
            type: 'sub',
            source: '土星探险家',
            question: '土卫六上有9条甲烷河流，干涸了4条，还有几条在流动？',
            expression: '9 - 4',
            answer: 5,
            hint: '9减4等于5'
        },
        {
            id: 'moon-sub-flags',
            kind: 'math',
            type: 'sub',
            source: '月球探险家',
            question: '宇航员带了8面旗帜，插了5面，还剩几面？',
            expression: '8 - 5',
            answer: 3,
            hint: '8减5等于3'
        },
        {
            id: 'moon-sub-oxygen',
            kind: 'math',
            type: 'sub',
            source: '月球探险家',
            question: '宇航员带了7瓶氧气，用了4瓶，还剩几瓶？',
            expression: '7 - 4',
            answer: 3,
            hint: '7减4等于3'
        },
        {
            id: 'neptune-sub-diamonds',
            kind: 'math',
            type: 'sub',
            source: '海王星探险家',
            question: '钻石雨下了8颗钻石，智天捡了5颗，还剩几颗？',
            expression: '8 - 5',
            answer: 3,
            hint: '8减5等于3'
        },
        {
            id: 'mercury-sub-temperature',
            kind: 'math',
            type: 'sub',
            source: '水星探险家',
            question: '水星白天很热晚上很冷！温度计白天升了6格，晚上降了4格，还剩几格？',
            expression: '6 - 4',
            answer: 2,
            hint: '6减4等于2'
        },
        {
            id: 'sun-seq-light-energy',
            kind: 'math',
            type: 'sequential',
            source: '太阳探险家',
            question: '太阳能板有8份光能，用掉了3份照明，又收集了2份，现在有几份光能？',
            expression: '8 - 3 + 2',
            answer: 7,
            hint: '先算8减3等于5，再算5加2等于7'
        },
        {
            id: 'sun-seq-hot-zones',
            kind: 'math',
            type: 'sequential',
            source: '太阳探险家',
            question: '太阳表面有9个热区，冷却了4个变成暗区，又爆发了2个新热区，现在有几个热区？',
            expression: '9 - 4 + 2',
            answer: 7,
            hint: '先算9减4等于5，再算5加2等于7'
        },
        {
            id: 'mars-seq-red-stones',
            kind: 'math',
            type: 'sequential',
            source: '火星探险家',
            question: '火星沙漠里有8粒红色石子，风吹走了3粒，又落下来2粒，现在有几粒？',
            expression: '8 - 3 + 2',
            answer: 7,
            hint: '先算8减3等于5，再算5加2等于7'
        },
        {
            id: 'mars-seq-canyons',
            kind: 'math',
            type: 'sequential',
            source: '火星探险家',
            question: '火星地形探测器发现了5条峡谷，又找到了3条，其中2条已经研究完了，还有几条没研究？',
            expression: '5 + 3 - 2',
            answer: 6,
            hint: '先算5加3等于8，再算8减2等于6'
        },
        {
            id: 'jupiter-seq-small-planets',
            kind: 'math',
            type: 'sequential',
            source: '木星探险家',
            question: '木星装了9颗小星球，飞走了3颗，又被吸引来了2颗，现在装了几颗？',
            expression: '9 - 3 + 2',
            answer: 8,
            hint: '先算9减3等于6，再算6加2等于8'
        },
        {
            id: 'jupiter-seq-storm-days',
            kind: 'math',
            type: 'sequential',
            source: '木星探险家',
            question: '大红斑风暴持续了6天，又加强了2天，减弱了1天，一共刮了几天？',
            expression: '6 + 2 - 1',
            answer: 7,
            hint: '先算6加2等于8，再算8减1等于7'
        },
        {
            id: 'saturn-seq-floating-balls',
            kind: 'math',
            type: 'sequential',
            source: '土星探险家',
            question: '游泳池里有9个球，沉下去3个，又浮上来2个，现在浮着几个？',
            expression: '9 - 3 + 2',
            answer: 8,
            hint: '先算9减3等于6，再算6加2等于8'
        },
        {
            id: 'moon-seq-rocks',
            kind: 'math',
            type: 'sequential',
            source: '月球探险家',
            question: '月球上原来有8块月球岩石，宇航员带走了3块，又捡回来了2块，现在有几块？',
            expression: '8 - 3 + 2',
            answer: 7,
            hint: '先算8减3等于5，再算5加2等于7'
        },
        {
            id: 'neptune-seq-clouds',
            kind: 'math',
            type: 'sequential',
            source: '海王星探险家',
            question: '海王星大气有10层深蓝色云，消散了4层，又生成了2层，现在有几层？',
            expression: '10 - 4 + 2',
            answer: 8,
            hint: '先算10减4等于6，再算6加2等于8'
        },
        {
            id: 'mercury-seq-craters',
            kind: 'math',
            type: 'sequential',
            source: '水星探险家',
            question: '水星表面有10个陨石坑，小行星填平了3个，探测器又发现了2个新坑，现在一共有几个陨石坑？',
            expression: '10 - 3 + 2',
            answer: 9,
            hint: '先算10减3等于7，再算7加2等于9'
        }
    ];

    window.LearningGateData = {
        defaultPlanId: 'space-energy-math-10',
        defaultCooldownHours: 24,
        plans: {
            'space-energy-math-10': {
                title: '宇宙能量补给',
                subtitle: '先补满能量，再探索宇宙奥秘',
                // gate 表示每个入口各自冷却，改成 plan 可变成所有入口共享一次冷却。
                completionScope: 'gate',
                // 可改成 5 等其他小时数，同一个入口在冷却时间内不会重复弹出。
                cooldownHours: 24,
                answerRange: { min: 0, max: 10 },
                wrongLockMs: 650,
                correctDelayMs: 1150,
                sections: [
                    { kind: 'math', type: 'add', label: '加法能量', count: 4 },
                    { kind: 'math', type: 'sub', label: '减法能量', count: 4 },
                    { kind: 'math', type: 'sequential', label: '连续加减法', count: 2 }
                ]
            }
        },
        questionBanks: {
            math: SPACE_ENERGY_MATH_QUESTIONS
        }
    };
})();
