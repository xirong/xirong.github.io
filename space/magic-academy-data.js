/**
 * 智天宇宙魔法学院 - 太阳系新生区
 * 第一版先把太阳系核心对象做成 8 枚勋章，每枚勋章包含汉字、英文、数学和观测任务。
 */
(function () {
    const q = (id, question, expression, answer, hint, audio) => ({
        id,
        question,
        expression,
        answer,
        hint,
        audio: audio || ''
    });

    const c = (char, pinyin, words, sentence, audio) => ({
        char,
        pinyin,
        words,
        sentence,
        audio: audio || `audio/words/${char}-intro.mp3`
    });

    const e = (word, cn, sentence, audio) => ({
        word,
        cn,
        sentence,
        audio: audio || ''
    });

    const station = (config) => ({
        type: 'badge',
        ...config
    });

    window.MagicAcademyData = {
        academyName: '智天宇宙魔法学院',
        zoneName: '太阳系新生区',
        storageKey: 'magicAcademySolarRookieV1',
        introAudio: 'audio/magic-academy/day1/intro.mp3',
        introText: '欢迎智天进入太阳系新生区。每一枚勋章都要认十个汉字，读十个英文，再完成十道能量题。',
        completionText: '太阳系新生区完成！智天已经集齐第一批太阳系勋章，可以准备进入卫星和银河任务。',
        missions: [
            station({
                id: 'sun-badge',
                shortTitle: '太阳',
                title: '太阳勋章',
                instruction: '认识太阳、光和热，点亮第一枚太阳系勋章',
                rewardId: 'sun-badge',
                targetName: '太阳',
                targetNameEn: 'Sun',
                texture: 'textures/sun.jpg',
                audio: 'audio/solar/sun.mp3',
                observeLink: 'solar-system.html',
                lines: [
                    '太阳是太阳系的中心，也是一颗会自己发光发热的恒星。',
                    '先把和太阳有关的字、英文和能量题完成，再领取太阳勋章。'
                ],
                chars: [
                    c('日', 'rì', '日出 · 红日', '太阳出来的时候，我们说红日升起。'),
                    c('火', 'huǒ', '火焰 · 火山', '太阳像一团巨大的火。'),
                    c('光', 'guāng', '阳光 · 光明', '太阳给地球带来光。'),
                    c('热', 'rè', '炎热 · 热水', '太阳让白天变得暖暖的。'),
                    c('明', 'míng', '明亮 · 明天', '阳光照亮了天空。'),
                    c('亮', 'liàng', '亮光 · 闪亮', '太阳看起来很亮。'),
                    c('能', 'néng', '能量 · 能力', '太阳给地球送来能量。'),
                    c('力', 'lì', '力量 · 力气', '太阳有很强大的力量。'),
                    c('白', 'bái', '白天 · 白云', '太阳升起就是白天。'),
                    c('阳', 'yáng', '太阳 · 阳光', '阳光照在大地上。')
                ],
                english: [
                    e('Sun', '太阳', 'The Sun is a star.', 'audio/solar/sun.mp3'),
                    e('Star', '恒星', 'A star makes light.'),
                    e('Light', '光', 'Light comes from the sun.'),
                    e('Heat', '热', 'The sun gives heat.'),
                    e('Day', '白天', 'The sun makes the day bright.'),
                    e('Energy', '能量', 'The sun gives energy.'),
                    e('Orbit', '轨道', 'Planets orbit the sun.'),
                    e('Solar System', '太阳系', 'We live in the Solar System.'),
                    e('Planet', '行星', 'A planet goes around a star.'),
                    e('Sky', '天空', 'The sky is bright in the day.')
                ],
                questions: [
                    q('sun-add-rock-gas-planets', '太阳系有4个岩石行星和4个气态行星，一共几个？', '4 + 4', 8, '把两组行星合在一起数。', 'audio/learning-gate/sun-add-rock-gas-planets.mp3'),
                    q('sun-add-light-energy', '太阳能板收集了6份光能，又收集4份，一共几份？', '6 + 4', 10, '从6继续数4个。', 'audio/learning-gate/sun-add-light-energy.mp3'),
                    q('sun-sub-earth-models', '桌上有9个地球模型，搬走3个，还剩几个？', '9 - 3', 6, '从9里面拿走3个。', 'audio/learning-gate/sun-sub-earth-models.mp3'),
                    q('sun-sub-light-rays', '太阳发出9束光，有4束照到地球，还有几束没照到？', '9 - 4', 5, '总数9束，去掉4束。', 'audio/learning-gate/sun-sub-light-rays.mp3'),
                    q('sun-seq-light-energy', '太阳能板有8份光能，用掉3份，又收集2份，现在有几份？', '8 - 3 + 2', 7, '先减3，再加2。', 'audio/learning-gate/sun-seq-light-energy.mp3'),
                    q('sun-seq-hot-zones', '太阳表面9个热区，冷却4个，又爆发2个，现在几个？', '9 - 4 + 2', 7, '先看冷却后剩下多少，再加新热区。', 'audio/learning-gate/sun-seq-hot-zones.mp3'),
                    q('sun-light-1', '智天点亮3盏太阳灯，又点亮5盏，一共几盏？', '3 + 5', 8, '从3继续数5盏。'),
                    q('sun-light-2', '10束阳光里有2束被云挡住，还剩几束？', '10 - 2', 8, '从10里面去掉2。'),
                    q('sun-light-3', '火箭有5格太阳能，又充3格，用掉1格，还剩几格？', '5 + 3 - 1', 7, '先加3，再减1。'),
                    q('sun-light-4', '太阳徽章需要7颗星，已经找到4颗，还差几颗？', '7 - 4', 3, '从7里面去掉已经找到的4颗。')
                ]
            }),
            station({
                id: 'mercury-badge',
                shortTitle: '水星',
                title: '水星勋章',
                instruction: '认识最快的水星，完成陨石坑和冷热任务',
                rewardId: 'mercury-badge',
                targetName: '水星',
                targetNameEn: 'Mercury',
                texture: 'textures/mercury.jpg',
                audio: 'audio/solar/mercury.mp3',
                observeLink: 'solar-system.html',
                lines: [
                    '水星离太阳最近，绕太阳跑得最快。',
                    '它表面有很多陨石坑，白天很热，夜晚很冷。'
                ],
                chars: [
                    c('水', 'shuǐ', '水星 · 水杯', '水星名字里有水，但它不是有很多水的行星。'),
                    c('快', 'kuài', '快速 · 快乐', '水星绕太阳跑得最快。'),
                    c('慢', 'màn', '慢慢 · 缓慢', '和水星相比，很多行星跑得更慢。'),
                    c('早', 'zǎo', '早上 · 早安', '水星的日出和地球不一样。'),
                    c('晚', 'wǎn', '晚上 · 晚安', '水星夜晚会很冷。'),
                    c('黑', 'hēi', '黑夜 · 黑色', '没有阳光的地方很黑。'),
                    c('白', 'bái', '白天 · 白色', '太阳照到的地方是白天。'),
                    c('长', 'cháng', '长短 · 很长', '水星的一天很特别。'),
                    c('短', 'duǎn', '短小 · 长短', '水星的一年很短。'),
                    c('坑', 'kēng', '土坑 · 陨石坑', '水星表面有许多陨石坑。')
                ],
                english: [
                    e('Mercury', '水星', 'Mercury is closest to the sun.', 'audio/solar/mercury.mp3'),
                    e('Crater', '陨石坑', 'A crater is a round hole.'),
                    e('Fast', '快', 'Mercury is fast.'),
                    e('Hot', '热', 'Mercury can be very hot.'),
                    e('Cold', '冷', 'Mercury can be very cold.'),
                    e('Rock', '岩石', 'Mercury is a rocky planet.'),
                    e('Small', '小', 'Mercury is small.'),
                    e('Closest', '最近', 'Mercury is closest to the sun.'),
                    e('Day', '白天', 'A day on Mercury is special.'),
                    e('Year', '年', 'Mercury has a short year.')
                ],
                questions: [
                    q('mercury-add-craters', '水星上有4个大陨石坑和5个小坑，一共几个？', '4 + 5', 9, '把大坑和小坑合起来。', 'audio/learning-gate/mercury-add-craters.mp3'),
                    q('mercury-sub-temperature', '温度计白天升了6格，晚上降了4格，还剩几格？', '6 - 4', 2, '从6里面降下去4格。', 'audio/learning-gate/mercury-sub-temperature.mp3'),
                    q('mercury-seq-craters', '水星有10个坑，填平3个，又发现2个，现在几个？', '10 - 3 + 2', 9, '先减3，再加2。', 'audio/learning-gate/mercury-seq-craters.mp3'),
                    q('mercury-1', '水星车找到2块灰石，又找到6块，一共几块？', '2 + 6', 8, '从2继续数6个。'),
                    q('mercury-2', '8盏探照灯关掉5盏，还亮几盏？', '8 - 5', 3, '从8里面去掉5。'),
                    q('mercury-3', '飞船飞过3个坑，又飞过4个坑，一共几个？', '3 + 4', 7, '3和4合起来。'),
                    q('mercury-4', '水星徽章有9格能量，用掉2格，还剩几格？', '9 - 2', 7, '从9里面去掉2。'),
                    q('mercury-5', '智天看到5个小坑，又看到3个，其中1个被挡住，还看到几个？', '5 + 3 - 1', 7, '先加3，再减1。'),
                    q('mercury-6', '机器人有6个轮印，又压出2个，一共几个？', '6 + 2', 8, '6后面再数2。'),
                    q('mercury-7', '10个任务完成了7个，还剩几个？', '10 - 7', 3, '从10里面去掉7。')
                ]
            }),
            station({
                id: 'venus-badge',
                shortTitle: '金星',
                title: '金星勋章',
                instruction: '认识厚云、热表面和明亮的金星',
                rewardId: 'venus-badge',
                targetName: '金星',
                targetNameEn: 'Venus',
                texture: 'textures/venus_atmosphere.jpg',
                audio: 'audio/solar/venus.mp3',
                observeLink: 'solar-system.html',
                lines: [
                    '金星和地球大小很接近，但被厚厚的大气包住。',
                    '它非常明亮，也非常热。'
                ],
                chars: [
                    c('金', 'jīn', '金星 · 金色', '金星在夜空里很亮。'),
                    c('心', 'xīn', '开心 · 心脏', '学习新星球很开心。'),
                    c('热', 'rè', '炎热 · 热水', '金星表面非常热。'),
                    c('厚', 'hòu', '厚云 · 厚度', '金星有厚厚的大气。'),
                    c('薄', 'báo', '薄片 · 薄云', '厚和薄是一对意思相反的字。'),
                    c('高', 'gāo', '高温 · 高山', '金星有很高的温度。'),
                    c('低', 'dī', '低头 · 高低', '高和低也能一起记。'),
                    c('开', 'kāi', '打开 · 开门', '打开望远镜看金星。'),
                    c('关', 'guān', '关闭 · 关门', '观察结束要关闭设备。'),
                    c('云', 'yún', '白云 · 云层', '金星外面有厚厚云层。')
                ],
                english: [
                    e('Venus', '金星', 'Venus is very bright.', 'audio/solar/venus.mp3'),
                    e('Cloud', '云', 'Venus has thick clouds.'),
                    e('Hot', '热', 'Venus is very hot.'),
                    e('Bright', '明亮', 'Venus is bright.'),
                    e('Atmosphere', '大气', 'Venus has a thick atmosphere.'),
                    e('Yellow', '黄色', 'Venus looks yellow.'),
                    e('Twin', '双胞胎', 'Venus is near Earth size.'),
                    e('Morning Star', '晨星', 'Venus can be a morning star.'),
                    e('Evening Star', '昏星', 'Venus can be an evening star.'),
                    e('Rocky Planet', '岩石行星', 'Venus is rocky.')
                ],
                questions: [
                    q('venus-1', '金星云层有5层，又发现3层，一共几层？', '5 + 3', 8, '5和3合起来。'),
                    q('venus-2', '10颗亮星里有2颗被云挡住，还能看到几颗？', '10 - 2', 8, '从10里面去掉2。'),
                    q('venus-3', '探测器拍了4张金星照片，又拍4张，一共几张？', '4 + 4', 8, '两个4合起来。'),
                    q('venus-4', '金星任务有9格热量，散掉3格，还剩几格？', '9 - 3', 6, '从9里面去掉3。'),
                    q('venus-5', '云层原来6朵，飘来2朵，又散开1朵，现在几朵？', '6 + 2 - 1', 7, '先加2，再减1。'),
                    q('venus-6', '智天收集3个金色徽章碎片，又收集5个，一共几个？', '3 + 5', 8, '3后面再数5。'),
                    q('venus-7', '8个观测点关闭4个，还开着几个？', '8 - 4', 4, '从8里面去掉4。'),
                    q('venus-8', '飞船有7瓶冷却水，用掉2瓶，还剩几瓶？', '7 - 2', 5, '从7里面去掉2。'),
                    q('venus-9', '金星车先走2步，又走6步，一共几步？', '2 + 6', 8, '2和6合起来。'),
                    q('venus-10', '任务灯有5盏，又亮3盏，灭掉2盏，现在亮几盏？', '5 + 3 - 2', 6, '先加3，再减2。')
                ]
            }),
            station({
                id: 'earth-moon-badge',
                shortTitle: '地月',
                title: '地月勋章',
                instruction: '把地球和月球一起认识，完成我们的家园任务',
                rewardId: 'earth-moon-badge',
                targetName: '地球和月球',
                targetNameEn: 'Earth and Moon',
                texture: 'textures/earth_daymap.jpg',
                audio: 'audio/solar/earth.mp3',
                observeLink: 'solar-system.html',
                lines: [
                    '地球是我们的家，月球是地球最熟悉的伙伴。',
                    '这枚勋章把地球、月亮、天空和大地放在一起复习。'
                ],
                chars: [
                    c('地', 'dì', '大地 · 地球', '我们住在地球上。'),
                    c('球', 'qiú', '地球 · 皮球', '地球像一个大球。'),
                    c('家', 'jiā', '家人 · 回家', '地球是我们的家。'),
                    c('月', 'yuè', '月亮 · 月光', '月亮绕着地球转。'),
                    c('天', 'tiān', '天空 · 白天', '天上有白云和星星。'),
                    c('水', 'shuǐ', '水杯 · 河水', '地球上有很多水。'),
                    c('雨', 'yǔ', '下雨 · 雨伞', '云里会落下雨。'),
                    c('海', 'hǎi', '大海 · 海洋', '地球有蓝色的大海。'),
                    c('风', 'fēng', '大风 · 风车', '风吹动云和树叶。'),
                    c('云', 'yún', '白云 · 云朵', '云在天空中飘。')
                ],
                english: [
                    e('Earth', '地球', 'Earth is our home.', 'audio/solar/earth.mp3'),
                    e('Moon', '月球', 'The Moon goes around Earth.', 'audio/solar/moon.mp3'),
                    e('Home', '家', 'Earth is our home.'),
                    e('Ocean', '海洋', 'Earth has oceans.'),
                    e('Cloud', '云', 'Clouds float in the sky.'),
                    e('Rain', '雨', 'Rain falls from clouds.'),
                    e('Sky', '天空', 'The sky is blue.'),
                    e('Land', '陆地', 'We stand on land.'),
                    e('Water', '水', 'Water is important.'),
                    e('Life', '生命', 'Earth has life.')
                ],
                questions: [
                    q('moon-add-astronauts', '月球上有4个宇航员，又来了3个，现在几个？', '4 + 3', 7, '先数原来的，再数后来的人。', 'audio/learning-gate/moon-add-astronauts.mp3'),
                    q('moon-add-spacesuits', '基地有6名宇航员，又来了4名，现在几名？', '6 + 4', 10, '6和4合起来。', 'audio/learning-gate/moon-add-spacesuits.mp3'),
                    q('moon-sub-flags', '宇航员带了8面旗，插了5面，还剩几面？', '8 - 5', 3, '从8里面去掉5。', 'audio/learning-gate/moon-sub-flags.mp3'),
                    q('moon-sub-oxygen', '带了7瓶氧气，用了4瓶，还剩几瓶？', '7 - 4', 3, '从7里面去掉4。', 'audio/learning-gate/moon-sub-oxygen.mp3'),
                    q('moon-seq-rocks', '月球有8块岩石，带走3块，又捡回2块，现在几块？', '8 - 3 + 2', 7, '先减3，再加2。', 'audio/learning-gate/moon-seq-rocks.mp3'),
                    q('earth-1', '地球村有3朵云，又飘来4朵，一共几朵？', '3 + 4', 7, '3和4合起来。'),
                    q('earth-2', '10滴雨落下6滴，云里还剩几滴？', '10 - 6', 4, '从10里面去掉6。'),
                    q('earth-3', '月亮灯有5盏，又亮2盏，一共几盏？', '5 + 2', 7, '5后面再数2。'),
                    q('earth-4', '地球卡有8颗星，已经贴5颗，还差几颗？', '8 - 5', 3, '从8里面去掉5。'),
                    q('earth-5', '海洋球有4个，又放3个，拿走2个，现在几个？', '4 + 3 - 2', 5, '先加3，再减2。')
                ]
            }),
            station({
                id: 'mars-badge',
                shortTitle: '火星',
                title: '火星勋章',
                instruction: '认识红色火星、沙尘、冰和探测车',
                rewardId: 'mars-badge',
                targetName: '火星',
                targetNameEn: 'Mars',
                texture: 'textures/mars.jpg',
                audio: 'audio/solar/mars.mp3',
                observeLink: 'solar-system.html',
                lines: [
                    '火星是红色的岩石行星，有高山、峡谷、沙尘和冰。',
                    '这枚勋章会复习颜色、远近、冷热和探测车。'
                ],
                chars: [
                    c('火', 'huǒ', '火星 · 火焰', '火星的名字里有火。'),
                    c('沙', 'shā', '沙子 · 沙漠', '火星表面有很多沙尘。'),
                    c('尘', 'chén', '灰尘 · 尘土', '沙尘暴会遮住火星天空。'),
                    c('远', 'yuǎn', '远方 · 遥远', '火星离地球很远。'),
                    c('近', 'jìn', '近处 · 附近', '远和近是一对相反的字。'),
                    c('干', 'gān', '干燥 · 干净', '火星表面很干。'),
                    c('冷', 'lěng', '寒冷 · 冰冷', '火星比地球冷。'),
                    c('冰', 'bīng', '冰块 · 冰冷', '火星两极有冰。'),
                    c('车', 'chē', '汽车 · 火车', '探测车在火星上工作。'),
                    c('红', 'hóng', '红色 · 红花', '火星看起来红红的。')
                ],
                english: [
                    e('Mars', '火星', 'Mars is the red planet.', 'audio/solar/mars.mp3'),
                    e('Red Planet', '红色行星', 'Mars is called the Red Planet.'),
                    e('Dust', '尘土', 'Mars has dust storms.'),
                    e('Rover', '探测车', 'A rover drives on Mars.'),
                    e('Volcano', '火山', 'Mars has a giant volcano.'),
                    e('Canyon', '峡谷', 'Mars has a huge canyon.'),
                    e('Ice', '冰', 'Mars has ice.'),
                    e('Rock', '岩石', 'Mars is rocky.'),
                    e('Phobos', '火卫一', 'Phobos is a moon of Mars.', 'audio/solar/phobos.mp3'),
                    e('Deimos', '火卫二', 'Deimos is a small moon of Mars.', 'audio/solar/deimos.mp3')
                ],
                questions: [
                    q('mars-add-volcanoes', '火星上有3座大火山和4座小火山，一共几座？', '3 + 4', 7, '把大火山和小火山合起来。', 'audio/learning-gate/mars-add-volcanoes.mp3'),
                    q('mars-add-rovers-photos', '祝融号拍4张照片，好奇号拍6张，一共几张？', '4 + 6', 10, '4和6合起来。', 'audio/learning-gate/mars-add-rovers-photos.mp3'),
                    q('mars-sub-red-stones', '火星表面有6块红石头，风吹走2块，还剩几块？', '6 - 2', 4, '从6里面去掉2。', 'audio/learning-gate/mars-sub-red-stones.mp3'),
                    q('mars-sub-ice', '火星北极有7块大冰，融化1块，还有几块？', '7 - 1', 6, '从7里面去掉1。', 'audio/learning-gate/mars-sub-ice.mp3'),
                    q('mars-seq-red-stones', '火星沙漠有8粒红石子，吹走3粒，又落下2粒，现在几粒？', '8 - 3 + 2', 7, '先减3，再加2。', 'audio/learning-gate/mars-seq-red-stones.mp3'),
                    q('mars-seq-canyons', '发现5条峡谷，又找到3条，研究完2条，还有几条没研究？', '5 + 3 - 2', 6, '先加3，再减2。', 'audio/learning-gate/mars-seq-canyons.mp3'),
                    q('mars-1', '火星车有5个车轮印，又压出4个，一共几个？', '5 + 4', 9, '5和4合起来。'),
                    q('mars-2', '9块红石头里捡走5块，还剩几块？', '9 - 5', 4, '从9里面去掉5。'),
                    q('mars-3', '火卫一和火卫二一共有几颗火星卫星？', '1 + 1', 2, '一颗加一颗。'),
                    q('mars-4', '任务箱有10格氧气，用掉3格，又补1格，现在几格？', '10 - 3 + 1', 8, '先减3，再加1。')
                ]
            }),
            station({
                id: 'jupiter-badge',
                shortTitle: '木星',
                title: '木星勋章',
                instruction: '认识最大的行星、条纹云和四颗大卫星',
                rewardId: 'jupiter-badge',
                targetName: '木星',
                targetNameEn: 'Jupiter',
                texture: 'textures/jupiter.jpg',
                audio: 'audio/solar/jupiter.mp3',
                observeLink: 'solar-system.html',
                lines: [
                    '木星是太阳系最大的行星，身边有很多卫星。',
                    '四颗伽利略卫星很适合一起记：木卫一、木卫二、木卫三、木卫四。'
                ],
                chars: [
                    c('木', 'mù', '木星 · 木头', '木星是最大的行星。'),
                    c('目', 'mù', '目光 · 眼目', '木和目读音一样，字形不同。'),
                    c('云', 'yún', '白云 · 云层', '木星表面是厚厚云层。'),
                    c('气', 'qì', '空气 · 气体', '木星是气态巨行星。'),
                    c('雷', 'léi', '打雷 · 雷声', '木星有强烈风暴。'),
                    c('电', 'diàn', '闪电 · 电灯', '风暴里可能有闪电。'),
                    c('口', 'kǒu', '人口 · 口袋', '口字像一个小框。'),
                    c('耳', 'ěr', '耳朵 · 耳环', '耳朵用来听声音。'),
                    c('环', 'huán', '光环 · 环绕', '木星也有很暗的环。'),
                    c('雨', 'yǔ', '下雨 · 雨水', '木星云层里有奇妙天气。')
                ],
                english: [
                    e('Jupiter', '木星', 'Jupiter is the largest planet.', 'audio/solar/jupiter.mp3'),
                    e('Io', '木卫一', 'Io has many volcanoes.', 'audio/solar/io.mp3'),
                    e('Europa', '木卫二', 'Europa has ice.', 'audio/solar/europa.mp3'),
                    e('Ganymede', '木卫三', 'Ganymede is the largest moon.', 'audio/solar/ganymede.mp3'),
                    e('Callisto', '木卫四', 'Callisto is a moon of Jupiter.'),
                    e('Storm', '风暴', 'Jupiter has a big storm.'),
                    e('Great Red Spot', '大红斑', 'The Great Red Spot is a storm.'),
                    e('Gas Giant', '气态巨行星', 'Jupiter is a gas giant.'),
                    e('Cloud Band', '云带', 'Jupiter has cloud bands.'),
                    e('Moon', '卫星', 'Jupiter has many moons.')
                ],
                questions: [
                    q('jupiter-add-moons', '木星有4颗大卫星和3颗小卫星，一共几颗？', '4 + 3', 7, '把两组卫星合起来。', 'audio/learning-gate/jupiter-add-moons.mp3'),
                    q('jupiter-add-ice-rivers', '木卫二冰面下有4条地下河，又发现5条，一共几条？', '4 + 5', 9, '4和5合起来。', 'audio/learning-gate/jupiter-add-ice-rivers.mp3'),
                    q('jupiter-sub-cloud-layers', '木星大气有5层，看到了3层，还有几层没看到？', '5 - 3', 2, '从5里面去掉3。', 'audio/learning-gate/jupiter-sub-cloud-layers.mp3'),
                    q('jupiter-sub-dust', '木星环上有6粒尘埃，飞走2粒，还剩几粒？', '6 - 2', 4, '从6里面去掉2。', 'audio/learning-gate/jupiter-sub-dust.mp3'),
                    q('jupiter-seq-small-planets', '木星装了9颗小星球，飞走3颗，又来2颗，现在几颗？', '9 - 3 + 2', 8, '先减3，再加2。', 'audio/learning-gate/jupiter-seq-small-planets.mp3'),
                    q('jupiter-seq-storm-days', '大红斑刮6天，又加强2天，减弱1天，一共几天？', '6 + 2 - 1', 7, '先加2，再减1。', 'audio/learning-gate/jupiter-seq-storm-days.mp3'),
                    q('jupiter-1', '木卫一有3座火山，木卫二有2条冰裂缝，一共几个目标？', '3 + 2', 5, '3和2合起来。'),
                    q('jupiter-2', '10朵云里散开4朵，还剩几朵？', '10 - 4', 6, '从10里面去掉4。'),
                    q('jupiter-3', '木星徽章有8格能量，用掉5格，还剩几格？', '8 - 5', 3, '从8里面去掉5。'),
                    q('jupiter-4', '智天先看到2条云带，又看到6条，一共几条？', '2 + 6', 8, '2和6合起来。')
                ]
            }),
            station({
                id: 'saturn-badge',
                shortTitle: '土星',
                title: '土星勋章',
                instruction: '认识漂亮光环、冰块和土卫六',
                rewardId: 'saturn-badge',
                targetName: '土星',
                targetNameEn: 'Saturn',
                texture: 'textures/saturn.jpg',
                audio: 'audio/solar/saturn.mp3',
                observeLink: 'solar-system.html',
                lines: [
                    '土星最容易被记住，因为它有非常漂亮的光环。',
                    '土星身边还有很多卫星，土卫六和土卫二都很有名。'
                ],
                chars: [
                    c('土', 'tǔ', '土星 · 土地', '土星是有大光环的行星。'),
                    c('圆', 'yuán', '圆形 · 团圆', '土星环像圆圆的圈。'),
                    c('方', 'fāng', '方形 · 方向', '圆和方可以一起比较。'),
                    c('小', 'xiǎo', '小鸟 · 大小', '小冰块组成大光环。'),
                    c('中', 'zhōng', '中间 · 中国', '土星在太阳系外侧中间一带。'),
                    c('上', 'shàng', '上面 · 上课', '光环在土星周围。'),
                    c('下', 'xià', '下面 · 下雨', '上和下是一对方向字。'),
                    c('里', 'lǐ', '里面 · 家里', '光环里有冰和石头。'),
                    c('外', 'wài', '外面 · 外婆', '土星在地球轨道外面。'),
                    c('冰', 'bīng', '冰块 · 冰冷', '土星环里有很多冰。')
                ],
                english: [
                    e('Saturn', '土星', 'Saturn has rings.', 'audio/solar/saturn.mp3'),
                    e('Ring', '光环', 'Saturn has beautiful rings.'),
                    e('Ice', '冰', 'The rings have ice.'),
                    e('Titan', '土卫六', 'Titan is a moon of Saturn.', 'audio/solar/titan.mp3'),
                    e('Rhea', '土卫五', 'Rhea is a moon of Saturn.', 'audio/solar/rhea.mp3'),
                    e('Enceladus', '土卫二', 'Enceladus has ice.', 'audio/solar/enceladus.mp3'),
                    e('Gas Giant', '气态巨行星', 'Saturn is a gas giant.'),
                    e('Circle', '圆圈', 'A ring is like a circle.'),
                    e('Moon', '卫星', 'Saturn has many moons.'),
                    e('Cassini', '卡西尼', 'Cassini studied Saturn.')
                ],
                questions: [
                    q('saturn-add-rings', '土星环有3层明亮的环和4层暗淡的环，一共几层？', '3 + 4', 7, '把两种环合起来。', 'audio/learning-gate/saturn-add-rings.mp3'),
                    q('saturn-add-cassini-photos', '卡西尼号拍了5张土星照片和4张卫星照片，一共几张？', '5 + 4', 9, '5和4合起来。', 'audio/learning-gate/saturn-add-cassini-photos.mp3'),
                    q('saturn-sub-ice-blocks', '土星环上有8块大冰块，碎掉2块，还剩几块？', '8 - 2', 6, '从8里面去掉2。', 'audio/learning-gate/saturn-sub-ice-blocks.mp3'),
                    q('saturn-sub-rivers', '土卫六有9条甲烷河，干涸4条，还有几条？', '9 - 4', 5, '从9里面去掉4。', 'audio/learning-gate/saturn-sub-rivers.mp3'),
                    q('saturn-seq-floating-balls', '池子里有9个球，沉下3个，又浮上2个，现在几个？', '9 - 3 + 2', 8, '先减3，再加2。', 'audio/learning-gate/saturn-seq-floating-balls.mp3'),
                    q('saturn-1', '土星有6颗小冰粒，又飞来3颗，一共几颗？', '6 + 3', 9, '6和3合起来。'),
                    q('saturn-2', '10个环影里挡住5个，还看到几个？', '10 - 5', 5, '从10里面去掉5。'),
                    q('saturn-3', '土卫六拍2张图，土卫二拍4张图，一共几张？', '2 + 4', 6, '2和4合起来。'),
                    q('saturn-4', '光环任务有8步，完成6步，还剩几步？', '8 - 6', 2, '从8里面去掉6。'),
                    q('saturn-5', '冰块先有5块，又来3块，碎掉1块，现在几块？', '5 + 3 - 1', 7, '先加3，再减1。')
                ]
            }),
            station({
                id: 'ice-giants-badge',
                shortTitle: '冰巨',
                title: '冰巨星勋章',
                instruction: '把天王星和海王星放在一起，认识遥远蓝色世界',
                rewardId: 'ice-giants-badge',
                targetName: '天王星和海王星',
                targetNameEn: 'Uranus and Neptune',
                texture: 'textures/uranus.jpg',
                audio: 'audio/solar/uranus.mp3',
                observeLink: 'solar-system.html',
                lines: [
                    '天王星和海王星都是遥远的冰巨星，看起来有蓝绿色和深蓝色。',
                    '这枚勋章把横躺的天王星、强风的海王星和远方卫星一起复习。'
                ],
                chars: [
                    c('天', 'tiān', '天王星 · 天空', '天王星像侧躺着转。'),
                    c('王', 'wáng', '王子 · 国王', '天王星名字里有王。'),
                    c('海', 'hǎi', '海王星 · 大海', '海王星是深蓝色。'),
                    c('蓝', 'lán', '蓝色 · 蓝天', '两颗冰巨星都带蓝色。'),
                    c('深', 'shēn', '深蓝 · 深海', '海王星是深蓝色。'),
                    c('冷', 'lěng', '寒冷 · 冰冷', '远离太阳会很冷。'),
                    c('倒', 'dǎo', '倒下 · 倒立', '天王星像倒着转。'),
                    c('转', 'zhuàn', '旋转 · 转动', '行星都会转动。'),
                    c('远', 'yuǎn', '远方 · 遥远', '海王星离太阳很远。'),
                    c('新', 'xīn', '新的 · 新发现', '天王星曾是望远镜发现的新行星。')
                ],
                english: [
                    e('Uranus', '天王星', 'Uranus is an ice giant.', 'audio/solar/uranus.mp3'),
                    e('Neptune', '海王星', 'Neptune is far away.', 'audio/solar/neptune.mp3'),
                    e('Ice Giant', '冰巨星', 'Uranus and Neptune are ice giants.'),
                    e('Blue', '蓝色', 'Neptune is blue.'),
                    e('Tilt', '倾斜', 'Uranus has a big tilt.'),
                    e('Wind', '风', 'Neptune has strong winds.'),
                    e('Triton', '海卫一', 'Triton is a moon of Neptune.', 'audio/solar/triton.mp3'),
                    e('Titania', '天卫一', 'Titania is a moon of Uranus.', 'audio/solar/titania.mp3'),
                    e('Miranda', '天卫五', 'Miranda has cliffs.', 'audio/solar/miranda.mp3'),
                    e('Far', '遥远', 'These planets are far from the sun.')
                ],
                questions: [
                    q('neptune-add-blue-zones', '海王星有5个蓝色区域，又发现3个，一共几个？', '5 + 3', 8, '5和3合起来。', 'audio/learning-gate/neptune-add-blue-zones.mp3'),
                    q('neptune-sub-diamonds', '钻石雨下了8颗，智天捡了5颗，还剩几颗？', '8 - 5', 3, '从8里面去掉5。', 'audio/learning-gate/neptune-sub-diamonds.mp3'),
                    q('neptune-seq-clouds', '海王星有10层云，消散4层，又生成2层，现在几层？', '10 - 4 + 2', 8, '先减4，再加2。', 'audio/learning-gate/neptune-seq-clouds.mp3'),
                    q('ice-1', '天王星有4个蓝色信标，海王星有4个，一共几个？', '4 + 4', 8, '两个4合起来。'),
                    q('ice-2', '9阵强风里停了3阵，还剩几阵？', '9 - 3', 6, '从9里面去掉3。'),
                    q('ice-3', '天卫五有5条峡谷，又看到2条，一共几条？', '5 + 2', 7, '5和2合起来。'),
                    q('ice-4', '海卫一任务有8格能量，用掉4格，还剩几格？', '8 - 4', 4, '从8里面去掉4。'),
                    q('ice-5', '冰巨星卡片先有3张，又收4张，送出1张，现在几张？', '3 + 4 - 1', 6, '先加4，再减1。'),
                    q('ice-6', '10颗蓝星点亮了7颗，还差几颗？', '10 - 7', 3, '从10里面去掉7。'),
                    q('ice-7', '智天读了2个英文名，又读8个，一共几个？', '2 + 8', 10, '2和8合起来。')
                ]
            }),
            station({
                id: 'rookie-master-badge',
                shortTitle: '总复习',
                title: '太阳系新生总勋章',
                instruction: '把八大行星和常见卫星按名字、英文和数量全部复习一遍',
                rewardId: 'rookie-master-badge',
                targetName: '太阳系',
                targetNameEn: 'Solar System',
                texture: 'textures/2.png',
                audio: 'audio/magic-academy/day1/intro.mp3',
                observeLink: 'solar-system.html',
                lines: [
                    '最后一枚是太阳系新生总勋章，要把前面学过的名字串起来。',
                    '完成后，智天就可以进入卫星探险区和银河远航区。'
                ],
                chars: [
                    c('星', 'xīng', '星星 · 行星', '太阳系里有很多天体。'),
                    c('行', 'xíng', '行走 · 行星', '行星绕着太阳运行。'),
                    c('卫', 'wèi', '卫星 · 守卫', '卫星绕着行星转。'),
                    c('太', 'tài', '太阳 · 太空', '太阳系在太空中。'),
                    c('空', 'kōng', '天空 · 太空', '太空非常辽阔。'),
                    c('大', 'dà', '大小 · 大人', '木星很大。'),
                    c('小', 'xiǎo', '小鸟 · 小星球', '水星比较小。'),
                    c('多', 'duō', '多少 · 很多', '木星和土星有很多卫星。'),
                    c('少', 'shǎo', '少数 · 多少', '有的行星卫星很少。'),
                    c('看', 'kàn', '看见 · 好看', '看一看太阳系全景。')
                ],
                english: [
                    e('Sun', '太阳', 'The Sun is a star.', 'audio/solar/sun.mp3'),
                    e('Mercury', '水星', 'Mercury is closest to the sun.', 'audio/solar/mercury.mp3'),
                    e('Venus', '金星', 'Venus is bright.', 'audio/solar/venus.mp3'),
                    e('Earth', '地球', 'Earth is our home.', 'audio/solar/earth.mp3'),
                    e('Mars', '火星', 'Mars is red.', 'audio/solar/mars.mp3'),
                    e('Jupiter', '木星', 'Jupiter is the largest planet.', 'audio/solar/jupiter.mp3'),
                    e('Saturn', '土星', 'Saturn has rings.', 'audio/solar/saturn.mp3'),
                    e('Uranus', '天王星', 'Uranus is an ice giant.', 'audio/solar/uranus.mp3'),
                    e('Neptune', '海王星', 'Neptune is far away.', 'audio/solar/neptune.mp3'),
                    e('Moon', '月球', 'The Moon goes around Earth.', 'audio/solar/moon.mp3')
                ],
                questions: [
                    q('master-1', '八大行星里有4个岩石行星和4个巨行星，一共几个？', '4 + 4', 8, '4和4合起来。'),
                    q('master-2', '智天先认了5个行星英文，又认了5个，一共几个？', '5 + 5', 10, '5和5合起来。'),
                    q('master-3', '10张行星卡片收好8张，还剩几张？', '10 - 8', 2, '从10里面去掉8。'),
                    q('master-4', '太阳系任务有9颗星，已经点亮6颗，还差几颗？', '9 - 6', 3, '从9里面去掉6。'),
                    q('master-5', '先找到3颗内侧行星，又找到5颗外侧行星，一共几颗？', '3 + 5', 8, '3和5合起来。'),
                    q('master-6', '卫星队有7颗卫星，飞走2颗，又回来3颗，现在几颗？', '7 - 2 + 3', 8, '先减2，再加3。'),
                    q('master-7', '火箭有10格能量，用掉4格，又补2格，现在几格？', '10 - 4 + 2', 8, '先减4，再加2。'),
                    q('master-8', '智天有6枚小徽章，又得到2枚，一共几枚？', '6 + 2', 8, '6后面再数2。'),
                    q('master-9', '8颗行星里已经复习5颗，还剩几颗？', '8 - 5', 3, '从8里面去掉5。'),
                    q('master-10', '总勋章需要4颗蓝星和4颗金星，一共几颗？', '4 + 4', 8, '两个4合起来。')
                ]
            })
        ],
        rewards: [
            { id: 'sun-badge', kind: 'star', title: '太阳勋章', name: '太阳', nameEn: 'Sun', texture: 'textures/sun.jpg', text: '你认识了太阳、光、热和太阳能量。' },
            { id: 'mercury-badge', kind: 'planet', title: '水星勋章', name: '水星', nameEn: 'Mercury', texture: 'textures/mercury.jpg', text: '你认识了最快的水星和陨石坑。' },
            { id: 'venus-badge', kind: 'planet', title: '金星勋章', name: '金星', nameEn: 'Venus', texture: 'textures/venus_atmosphere.jpg', text: '你认识了明亮又炎热的金星。' },
            { id: 'earth-moon-badge', kind: 'planet', title: '地月勋章', name: '地月', nameEn: 'Earth and Moon', texture: 'textures/earth_daymap.jpg', text: '你认识了地球家园和月球伙伴。' },
            { id: 'mars-badge', kind: 'planet', title: '火星勋章', name: '火星', nameEn: 'Mars', texture: 'textures/mars.jpg', text: '你认识了红色火星、沙尘、冰和探测车。' },
            { id: 'jupiter-badge', kind: 'planet', title: '木星勋章', name: '木星', nameEn: 'Jupiter', texture: 'textures/jupiter.jpg', text: '你认识了最大的行星和木星卫星。' },
            { id: 'saturn-badge', kind: 'planet', title: '土星勋章', name: '土星', nameEn: 'Saturn', texture: 'textures/saturn.jpg', text: '你认识了土星光环和土星卫星。' },
            { id: 'ice-giants-badge', kind: 'planet', title: '冰巨星勋章', name: '冰巨星', nameEn: 'Ice Giants', texture: 'textures/uranus.jpg', text: '你认识了天王星、海王星和遥远蓝色世界。' },
            { id: 'rookie-master-badge', kind: 'star', title: '太阳系新生总勋章', name: '总勋章', nameEn: 'Solar Rookie', texture: 'textures/2.png', text: '你完成了太阳系新生区第一轮总复习。' }
        ]
    };

    window.MagicAcademyDay1Data = window.MagicAcademyData;
})();
