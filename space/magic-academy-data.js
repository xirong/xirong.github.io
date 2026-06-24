/**
 * 智天宇宙魔法学院 - 地球村第 1 天数据
 * 第一版只放 Day 1，后续 Day 2-7 继续追加在 days 数组里。
 */
(function () {
    const audioBase = 'audio/magic-academy/day1';

    window.MagicAcademyDay1Data = {
        academyName: '智天宇宙魔法学院',
        planetName: '地球村',
        dayLabel: '第 1 天',
        storageKey: 'magicAcademyEarthVillageDay1',
        introAudio: `${audioBase}/intro.mp3`,
        introText: '欢迎智天来到宇宙魔法学院，今天我们先降落在地球村。点亮天空和太阳，给火箭加满能量。',
        missions: [
            {
                id: 'story-sky-sun',
                type: 'story',
                title: '地球村欢迎日',
                shortTitle: '欢迎日',
                instruction: '点亮 3 颗蓝色信标，唤醒地球村',
                audio: `${audioBase}/story-sky-sun.mp3`,
                rewardId: 'earth-card',
                rewardText: '你获得了地球村通行卡',
                lines: [
                    '地球村是我们的第一颗星球，蓝色的大海和白色的云正在欢迎智天。',
                    '太阳升起来，天空变亮，今天的小宇航员任务开始了。',
                    '点一点发光的信标，让地球村醒过来。'
                ]
            },
            {
                id: 'hanzi-tian',
                type: 'hanzi',
                title: '点亮汉字星：天',
                shortTitle: '天',
                char: '天',
                pinyin: 'tiān',
                english: 'Sky',
                words: '天空 · 白天',
                sentence: '天上有蓝蓝的天空。',
                audio: `${audioBase}/hanzi-tian.mp3`,
                rewardId: 'star-spark',
                rewardText: '你点亮了一颗天空星'
            },
            {
                id: 'hanzi-ri',
                type: 'hanzi',
                title: '点亮汉字星：日',
                shortTitle: '日',
                char: '日',
                pinyin: 'rì',
                english: 'Sun',
                words: '红日 · 日出',
                sentence: '红日升起来，地球村变亮了。',
                audio: `${audioBase}/hanzi-ri.mp3`,
                rewardId: 'sun-spark',
                rewardText: '你点亮了一颗太阳星'
            },
            {
                id: 'english-sun-sky',
                type: 'english',
                title: '英语电台：Sun 和 Sky',
                shortTitle: 'Sun Sky',
                audio: `${audioBase}/english-sun-sky.mp3`,
                rewardId: 'uranus-card',
                rewardText: '你获得了天王星冰蓝卡',
                words: [
                    { word: 'Sun', cn: '太阳', sentence: 'I see the sun.' },
                    { word: 'Sky', cn: '天空', sentence: 'I see the sky.' }
                ]
            },
            {
                id: 'math-rocket-energy',
                type: 'math',
                title: '火箭补给站',
                shortTitle: '补给',
                audio: `${audioBase}/math-rocket-energy.mp3`,
                rewardId: 'neptune-card',
                rewardText: '你获得了海王星深蓝卡',
                questions: [
                    {
                        id: 'rocket-add-3-2',
                        question: '火箭有 3 格能量，又得到 2 格，现在有几格？',
                        expression: '3 + 2',
                        answer: 5,
                        options: [4, 5, 6],
                        hint: '先数 3 格，再接着数 2 格。'
                    },
                    {
                        id: 'cloud-sub-5-1',
                        question: '天上有 5 朵云，飘走 1 朵，还剩几朵？',
                        expression: '5 - 1',
                        answer: 4,
                        options: [3, 4, 5],
                        hint: '从 5 朵里面拿走 1 朵。'
                    },
                    {
                        id: 'sun-add-4-1',
                        question: '太阳送来 4 束光，又送来 1 束，一共几束？',
                        expression: '4 + 1',
                        answer: 5,
                        options: [5, 6, 7],
                        hint: '4 后面再数 1 个。'
                    },
                    {
                        id: 'star-sub-6-2',
                        question: '星星灯有 6 盏，关掉 2 盏，还亮着几盏？',
                        expression: '6 - 2',
                        answer: 4,
                        options: [2, 4, 6],
                        hint: '亮着的星星灯要减掉关掉的 2 盏。'
                    },
                    {
                        id: 'beacon-add-2-3',
                        question: '地球村有 2 个信标，又点亮 3 个，一共几个？',
                        expression: '2 + 3',
                        answer: 5,
                        options: [5, 6, 7],
                        hint: '2 个信标后面继续数 3 个。'
                    }
                ]
            },
            {
                id: 'star-size-alnitak',
                type: 'star-size',
                title: '恒星比较奖励：参宿一',
                shortTitle: '参宿一',
                audio: `${audioBase}/star-size-alnitak.mp3`,
                rewardId: 'alnitak-star',
                rewardText: '你获得了参宿一恒星比较星',
                starName: '参宿一',
                starNameEn: 'Alnitak',
                diameterRatio: 20,
                capacityLabel: '约 8000 个太阳',
                sentence: '参宿一的主星直径大约是太阳的 20 倍，按体积想象，能装下大约 8000 个太阳。'
            }
        ],
        rewards: [
            {
                id: 'earth-card',
                kind: 'planet',
                title: '地球村通行卡',
                name: '地球',
                nameEn: 'Earth',
                texture: 'textures/earth_daymap.jpg',
                text: '地球是我们的家，有海洋、陆地和云。'
            },
            {
                id: 'star-spark',
                kind: 'spark',
                title: '天空星',
                name: '天',
                nameEn: 'Sky',
                text: '你点亮了第一颗汉字星。'
            },
            {
                id: 'sun-spark',
                kind: 'spark',
                title: '太阳星',
                name: '日',
                nameEn: 'Sun',
                text: '太阳升起来，地球村变亮了。'
            },
            {
                id: 'uranus-card',
                kind: 'planet',
                title: '天王星冰蓝卡',
                name: '天王星',
                nameEn: 'Uranus',
                texture: 'textures/uranus.jpg',
                text: '天王星是淡蓝绿色的冰巨星。'
            },
            {
                id: 'neptune-card',
                kind: 'planet',
                title: '海王星深蓝卡',
                name: '海王星',
                nameEn: 'Neptune',
                texture: 'textures/neptune.jpg',
                text: '海王星是深蓝色的遥远行星。'
            },
            {
                id: 'alnitak-star',
                kind: 'star',
                title: '参宿一比较星',
                name: '参宿一',
                nameEn: 'Alnitak',
                text: '参宿一主星直径约为太阳的 20 倍，体积想象约能装下 8000 个太阳。'
            }
        ],
        completionText: '第一天完成！智天已经成为地球村见习宇航员。'
    };
})();
