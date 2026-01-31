// 美国50州 + 华盛顿特区 信息数据
// 每个州包含：名称、颜色、特色美食、著名景点、有趣事实

const USStateInfo = {
    // ============ 东北部 - 新英格兰 (蓝色系) ============
    ME: {
        name: "Maine 缅因州",
        nameEn: "Maine",
        nameCn: "缅因州",
        color: "#4A90D9",
        type: "State",
        food: { emoji: "🦞", name: "Lobster 龙虾" },
        landmark: { emoji: "🏠", name: "Acadia 阿卡迪亚" },
        funFact: "美国最东边的州，龙虾产量全美第一！"
    },
    NH: {
        name: "New Hampshire 新罕布什尔州",
        nameEn: "New Hampshire",
        nameCn: "新罕布什尔州",
        color: "#5B9BD5",
        type: "State",
        food: { emoji: "🍁", name: "Maple Syrup 枫糖浆" },
        landmark: { emoji: "⛰️", name: "White Mountains 白山" },
        funFact: "州口号是'不自由毋宁死'！"
    },
    VT: {
        name: "Vermont 佛蒙特州",
        nameEn: "Vermont",
        nameCn: "佛蒙特州",
        color: "#6BAED6",
        type: "State",
        food: { emoji: "🍦", name: "Ice Cream 冰淇淋" },
        landmark: { emoji: "🍂", name: "Fall Foliage 秋叶" },
        funFact: "Ben & Jerry's冰淇淋的故乡！"
    },
    MA: {
        name: "Massachusetts 马萨诸塞州",
        nameEn: "Massachusetts",
        nameCn: "马萨诸塞州",
        color: "#3182BD",
        type: "State",
        food: { emoji: "🥧", name: "Clam Chowder 蛤蜊浓汤" },
        landmark: { emoji: "🎓", name: "Harvard 哈佛大学" },
        funFact: "美国独立战争的发源地！"
    },
    RI: {
        name: "Rhode Island 罗德岛州",
        nameEn: "Rhode Island",
        nameCn: "罗德岛州",
        color: "#2171B5",
        type: "State",
        food: { emoji: "🍝", name: "Calamari 炸鱿鱼" },
        landmark: { emoji: "⛵", name: "Newport 纽波特" },
        funFact: "美国最小的州！"
    },
    CT: {
        name: "Connecticut 康涅狄格州",
        nameEn: "Connecticut",
        nameCn: "康涅狄格州",
        color: "#08519C",
        type: "State",
        food: { emoji: "🍕", name: "Pizza 披萨" },
        landmark: { emoji: "🎓", name: "Yale 耶鲁大学" },
        funFact: "世界上第一部电话簿在这里诞生！"
    },

    // ============ 东北部 - 中大西洋 (深蓝色系) ============
    NY: {
        name: "New York 纽约州",
        nameEn: "New York",
        nameCn: "纽约州",
        color: "#1E3A5F",
        type: "State",
        food: { emoji: "🍕", name: "NYC Pizza 纽约披萨" },
        landmark: { emoji: "🗽", name: "Statue of Liberty 自由女神" },
        funFact: "纽约市有800多种语言！"
    },
    NJ: {
        name: "New Jersey 新泽西州",
        nameEn: "New Jersey",
        nameCn: "新泽西州",
        color: "#2C5282",
        type: "State",
        food: { emoji: "🍅", name: "Tomato Pie 番茄派" },
        landmark: { emoji: "🎡", name: "Atlantic City 大西洋城" },
        funFact: "人口密度最高的州！"
    },
    PA: {
        name: "Pennsylvania 宾夕法尼亚州",
        nameEn: "Pennsylvania",
        nameCn: "宾夕法尼亚州",
        color: "#2B6CB0",
        type: "State",
        food: { emoji: "🥨", name: "Pretzel 椒盐卷饼" },
        landmark: { emoji: "🔔", name: "Liberty Bell 自由钟" },
        funFact: "美国独立宣言在费城签署！"
    },

    // ============ 东南部 (橙色/暖色系) ============
    DE: {
        name: "Delaware 特拉华州",
        nameEn: "Delaware",
        nameCn: "特拉华州",
        color: "#ED8936",
        type: "State",
        food: { emoji: "🦀", name: "Blue Crab 蓝蟹" },
        landmark: { emoji: "🏖️", name: "Rehoboth Beach 里霍博斯海滩" },
        funFact: "第一个批准宪法的州！"
    },
    MD: {
        name: "Maryland 马里兰州",
        nameEn: "Maryland",
        nameCn: "马里兰州",
        color: "#DD6B20",
        type: "State",
        food: { emoji: "🦀", name: "Maryland Crab 马里兰蟹饼" },
        landmark: { emoji: "⚓", name: "Baltimore 巴尔的摩港" },
        funFact: "美国国歌在这里诞生！"
    },
    DC: {
        name: "Washington D.C. 华盛顿特区",
        nameEn: "Washington D.C.",
        nameCn: "华盛顿特区",
        color: "#C05621",
        type: "District",
        food: { emoji: "🍔", name: "Half-Smoke 烟熏肠" },
        landmark: { emoji: "🏛️", name: "White House 白宫" },
        funFact: "美国首都，不属于任何州！"
    },
    VA: {
        name: "Virginia 弗吉尼亚州",
        nameEn: "Virginia",
        nameCn: "弗吉尼亚州",
        color: "#C53030",
        type: "State",
        food: { emoji: "🥜", name: "Peanuts 花生" },
        landmark: { emoji: "🏛️", name: "Mount Vernon 弗农山庄" },
        funFact: "8位美国总统出生在这里！"
    },
    WV: {
        name: "West Virginia 西弗吉尼亚州",
        nameEn: "West Virginia",
        nameCn: "西弗吉尼亚州",
        color: "#B83280",
        type: "State",
        food: { emoji: "🥞", name: "Buckwheat Cakes 荞麦饼" },
        landmark: { emoji: "🌉", name: "New River Gorge 新河峡谷" },
        funFact: "内战期间从弗吉尼亚分离出来！"
    },
    NC: {
        name: "North Carolina 北卡罗来纳州",
        nameEn: "North Carolina",
        nameCn: "北卡罗来纳州",
        color: "#E53E3E",
        type: "State",
        food: { emoji: "🍖", name: "BBQ 烧烤" },
        landmark: { emoji: "✈️", name: "Kitty Hawk 小鹰镇" },
        funFact: "莱特兄弟在这里首次飞行！"
    },
    SC: {
        name: "South Carolina 南卡罗来纳州",
        nameEn: "South Carolina",
        nameCn: "南卡罗来纳州",
        color: "#FC8181",
        type: "State",
        food: { emoji: "🍤", name: "Shrimp & Grits 虾仁粗玉米粥" },
        landmark: { emoji: "🏝️", name: "Charleston 查尔斯顿" },
        funFact: "美国内战第一枪在这里打响！"
    },
    GA: {
        name: "Georgia 佐治亚州",
        nameEn: "Georgia",
        nameCn: "佐治亚州",
        color: "#F56565",
        type: "State",
        food: { emoji: "🍑", name: "Peach 桃子" },
        landmark: { emoji: "🎬", name: "Atlanta 亚特兰大" },
        funFact: "可口可乐的故乡！"
    },
    FL: {
        name: "Florida 佛罗里达州",
        nameEn: "Florida",
        nameCn: "佛罗里达州",
        color: "#F6AD55",
        type: "State",
        food: { emoji: "🍊", name: "Orange 橙子" },
        landmark: { emoji: "🏰", name: "Disney World 迪士尼乐园" },
        funFact: "阳光之州，有世界最大的迪士尼！"
    },

    // ============ 南部 (红色/棕色系) ============
    AL: {
        name: "Alabama 阿拉巴马州",
        nameEn: "Alabama",
        nameCn: "阿拉巴马州",
        color: "#9B2C2C",
        type: "State",
        food: { emoji: "🍖", name: "BBQ 烧烤" },
        landmark: { emoji: "🚀", name: "Space Center 太空中心" },
        funFact: "美国太空计划的重要基地！"
    },
    MS: {
        name: "Mississippi 密西西比州",
        nameEn: "Mississippi",
        nameCn: "密西西比州",
        color: "#822727",
        type: "State",
        food: { emoji: "🐟", name: "Catfish 鲶鱼" },
        landmark: { emoji: "🎸", name: "Blues Trail 蓝调之路" },
        funFact: "蓝调音乐的发源地！"
    },
    LA: {
        name: "Louisiana 路易斯安那州",
        nameEn: "Louisiana",
        nameCn: "路易斯安那州",
        color: "#744210",
        type: "State",
        food: { emoji: "🦐", name: "Gumbo 秋葵浓汤" },
        landmark: { emoji: "🎭", name: "New Orleans 新奥尔良" },
        funFact: "爵士乐的诞生地！"
    },
    AR: {
        name: "Arkansas 阿肯色州",
        nameEn: "Arkansas",
        nameCn: "阿肯色州",
        color: "#975A16",
        type: "State",
        food: { emoji: "🍚", name: "Rice 大米" },
        landmark: { emoji: "🌲", name: "Hot Springs 温泉" },
        funFact: "沃尔玛总部所在地！"
    },
    TN: {
        name: "Tennessee 田纳西州",
        nameEn: "Tennessee",
        nameCn: "田纳西州",
        color: "#B7791F",
        type: "State",
        food: { emoji: "🍗", name: "Hot Chicken 炸鸡" },
        landmark: { emoji: "🎸", name: "Nashville 纳什维尔" },
        funFact: "乡村音乐之都！"
    },
    KY: {
        name: "Kentucky 肯塔基州",
        nameEn: "Kentucky",
        nameCn: "肯塔基州",
        color: "#D69E2E",
        type: "State",
        food: { emoji: "🍗", name: "Fried Chicken 炸鸡" },
        landmark: { emoji: "🏇", name: "Kentucky Derby 肯塔基赛马" },
        funFact: "KFC肯德基的故乡！"
    },

    // ============ 中西部 (绿色系) ============
    OH: {
        name: "Ohio 俄亥俄州",
        nameEn: "Ohio",
        nameCn: "俄亥俄州",
        color: "#276749",
        type: "State",
        food: { emoji: "🌭", name: "Cincinnati Chili 辛辛那提辣椒" },
        landmark: { emoji: "🎢", name: "Cedar Point 杉点乐园" },
        funFact: "诞生了7位美国总统！"
    },
    MI: {
        name: "Michigan 密歇根州",
        nameEn: "Michigan",
        nameCn: "密歇根州",
        color: "#2F855A",
        type: "State",
        food: { emoji: "🍒", name: "Cherry 樱桃" },
        landmark: { emoji: "🚗", name: "Detroit 底特律" },
        funFact: "美国汽车工业之都！"
    },
    IN: {
        name: "Indiana 印第安纳州",
        nameEn: "Indiana",
        nameCn: "印第安纳州",
        color: "#38A169",
        type: "State",
        food: { emoji: "🌽", name: "Corn 玉米" },
        landmark: { emoji: "🏎️", name: "Indy 500 印第500赛车" },
        funFact: "世界最著名的赛车比赛在这里！"
    },
    IL: {
        name: "Illinois 伊利诺伊州",
        nameEn: "Illinois",
        nameCn: "伊利诺伊州",
        color: "#48BB78",
        type: "State",
        food: { emoji: "🍕", name: "Deep Dish Pizza 深盘披萨" },
        landmark: { emoji: "🏙️", name: "Chicago 芝加哥" },
        funFact: "芝加哥有美国最高的摩天大楼！"
    },
    WI: {
        name: "Wisconsin 威斯康星州",
        nameEn: "Wisconsin",
        nameCn: "威斯康星州",
        color: "#68D391",
        type: "State",
        food: { emoji: "🧀", name: "Cheese 奶酪" },
        landmark: { emoji: "🍺", name: "Milwaukee 密尔沃基" },
        funFact: "奶酪之州，产量全美第一！"
    },
    MN: {
        name: "Minnesota 明尼苏达州",
        nameEn: "Minnesota",
        nameCn: "明尼苏达州",
        color: "#9AE6B4",
        type: "State",
        food: { emoji: "🥧", name: "Hotdish 热菜砂锅" },
        landmark: { emoji: "🛒", name: "Mall of America 美国购物中心" },
        funFact: "有超过10000个湖泊！"
    },
    IA: {
        name: "Iowa 爱荷华州",
        nameEn: "Iowa",
        nameCn: "爱荷华州",
        color: "#C6F6D5",
        type: "State",
        food: { emoji: "🌽", name: "Sweet Corn 甜玉米" },
        landmark: { emoji: "🌾", name: "Corn Fields 玉米田" },
        funFact: "美国最大的玉米产地！"
    },
    MO: {
        name: "Missouri 密苏里州",
        nameEn: "Missouri",
        nameCn: "密苏里州",
        color: "#22543D",
        type: "State",
        food: { emoji: "🍖", name: "KC BBQ 堪萨斯城烧烤" },
        landmark: { emoji: "🌉", name: "Gateway Arch 大拱门" },
        funFact: "圣路易斯大拱门是美国最高的人造纪念碑！"
    },

    // ============ 大平原 (黄色/金色系) ============
    ND: {
        name: "North Dakota 北达科他州",
        nameEn: "North Dakota",
        nameCn: "北达科他州",
        color: "#D4AC0D",
        type: "State",
        food: { emoji: "🥔", name: "Knoephla Soup 马铃薯汤" },
        landmark: { emoji: "🦬", name: "Theodore Roosevelt NP 西奥多罗斯福国家公园" },
        funFact: "美国地理中心附近！"
    },
    SD: {
        name: "South Dakota 南达科他州",
        nameEn: "South Dakota",
        nameCn: "南达科他州",
        color: "#F1C40F",
        type: "State",
        food: { emoji: "🥩", name: "Chislic 烤牛肉块" },
        landmark: { emoji: "🗿", name: "Mount Rushmore 拉什莫尔山" },
        funFact: "四位总统的头像刻在山上！"
    },
    NE: {
        name: "Nebraska 内布拉斯加州",
        nameEn: "Nebraska",
        nameCn: "内布拉斯加州",
        color: "#F39C12",
        type: "State",
        food: { emoji: "🥩", name: "Steak 牛排" },
        landmark: { emoji: "🌾", name: "Chimney Rock 烟囱岩" },
        funFact: "股神巴菲特住在这里！"
    },
    KS: {
        name: "Kansas 堪萨斯州",
        nameEn: "Kansas",
        nameCn: "堪萨斯州",
        color: "#E67E22",
        type: "State",
        food: { emoji: "🍖", name: "BBQ 烧烤" },
        landmark: { emoji: "🌻", name: "Sunflowers 向日葵田" },
        funFact: "《绿野仙踪》的故事发生在这里！"
    },
    OK: {
        name: "Oklahoma 俄克拉荷马州",
        nameEn: "Oklahoma",
        nameCn: "俄克拉荷马州",
        color: "#D35400",
        type: "State",
        food: { emoji: "🍖", name: "Chicken Fried Steak 炸牛排" },
        landmark: { emoji: "🛣️", name: "Route 66 66号公路" },
        funFact: "66号公路穿过这里！"
    },
    TX: {
        name: "Texas 德克萨斯州",
        nameEn: "Texas",
        nameCn: "德克萨斯州",
        color: "#A04000",
        type: "State",
        food: { emoji: "🌮", name: "Tex-Mex 德州墨西哥菜" },
        landmark: { emoji: "🤠", name: "Alamo 阿拉莫" },
        funFact: "美国面积第二大的州！"
    },

    // ============ 山区 (紫色系) ============
    MT: {
        name: "Montana 蒙大拿州",
        nameEn: "Montana",
        nameCn: "蒙大拿州",
        color: "#6B46C1",
        type: "State",
        food: { emoji: "🍖", name: "Bison 野牛肉" },
        landmark: { emoji: "🏔️", name: "Glacier NP 冰川国家公园" },
        funFact: "大天空之州！"
    },
    WY: {
        name: "Wyoming 怀俄明州",
        nameEn: "Wyoming",
        nameCn: "怀俄明州",
        color: "#805AD5",
        type: "State",
        food: { emoji: "🥩", name: "Elk 麋鹿肉" },
        landmark: { emoji: "🌋", name: "Yellowstone 黄石公园" },
        funFact: "人口最少的州，有世界第一个国家公园！"
    },
    ID: {
        name: "Idaho 爱达荷州",
        nameEn: "Idaho",
        nameCn: "爱达荷州",
        color: "#9F7AEA",
        type: "State",
        food: { emoji: "🥔", name: "Potato 马铃薯" },
        landmark: { emoji: "🌙", name: "Craters of the Moon 月球陨石坑" },
        funFact: "马铃薯产量全美第一！"
    },
    CO: {
        name: "Colorado 科罗拉多州",
        nameEn: "Colorado",
        nameCn: "科罗拉多州",
        color: "#B794F4",
        type: "State",
        food: { emoji: "🥩", name: "Rocky Mountain Oysters 落基山牡蛎" },
        landmark: { emoji: "⛷️", name: "Rocky Mountains 落基山脉" },
        funFact: "平均海拔最高的州！"
    },
    NM: {
        name: "New Mexico 新墨西哥州",
        nameEn: "New Mexico",
        nameCn: "新墨西哥州",
        color: "#D6BCFA",
        type: "State",
        food: { emoji: "🌶️", name: "Green Chile 青辣椒" },
        landmark: { emoji: "🎈", name: "Balloon Fiesta 热气球节" },
        funFact: "世界最大的热气球节！"
    },
    AZ: {
        name: "Arizona 亚利桑那州",
        nameEn: "Arizona",
        nameCn: "亚利桑那州",
        color: "#553C9A",
        type: "State",
        food: { emoji: "🌵", name: "Sonoran Hot Dog 索诺兰热狗" },
        landmark: { emoji: "🏜️", name: "Grand Canyon 大峡谷" },
        funFact: "大峡谷是世界七大自然奇观之一！"
    },
    UT: {
        name: "Utah 犹他州",
        nameEn: "Utah",
        nameCn: "犹他州",
        color: "#44337A",
        type: "State",
        food: { emoji: "🍦", name: "Jell-O 果冻" },
        landmark: { emoji: "🏛️", name: "Salt Lake 盐湖城" },
        funFact: "盐湖城有著名的摩门教堂！"
    },
    NV: {
        name: "Nevada 内华达州",
        nameEn: "Nevada",
        nameCn: "内华达州",
        color: "#322659",
        type: "State",
        food: { emoji: "🎰", name: "Buffet 自助餐" },
        landmark: { emoji: "🎰", name: "Las Vegas 拉斯维加斯" },
        funFact: "赌城拉斯维加斯在这里！"
    },

    // ============ 太平洋沿岸 (青色系) ============
    WA: {
        name: "Washington 华盛顿州",
        nameEn: "Washington",
        nameCn: "华盛顿州",
        color: "#0987A0",
        type: "State",
        food: { emoji: "☕", name: "Coffee 咖啡" },
        landmark: { emoji: "🏔️", name: "Mount Rainier 雷尼尔山" },
        funFact: "星巴克和亚马逊的总部！"
    },
    OR: {
        name: "Oregon 俄勒冈州",
        nameEn: "Oregon",
        nameCn: "俄勒冈州",
        color: "#00B5D8",
        type: "State",
        food: { emoji: "🍷", name: "Wine 葡萄酒" },
        landmark: { emoji: "🌊", name: "Crater Lake 火山湖" },
        funFact: "没有销售税的州！"
    },
    CA: {
        name: "California 加利福尼亚州",
        nameEn: "California",
        nameCn: "加利福尼亚州",
        color: "#00CED1",
        type: "State",
        food: { emoji: "🌮", name: "Tacos 玉米饼" },
        landmark: { emoji: "🌉", name: "Golden Gate 金门大桥" },
        funFact: "人口最多的州，好莱坞在这里！"
    },
    AK: {
        name: "Alaska 阿拉斯加州",
        nameEn: "Alaska",
        nameCn: "阿拉斯加州",
        color: "#319795",
        type: "State",
        food: { emoji: "🦀", name: "King Crab 帝王蟹" },
        landmark: { emoji: "🏔️", name: "Denali 德纳利山" },
        funFact: "美国最大的州，比德州大两倍！"
    },
    HI: {
        name: "Hawaii 夏威夷州",
        nameEn: "Hawaii",
        nameCn: "夏威夷州",
        color: "#38B2AC",
        type: "State",
        food: { emoji: "🍍", name: "Poke 生鱼沙拉" },
        landmark: { emoji: "🌺", name: "Waikiki 威基基海滩" },
        funFact: "唯一全部由岛屿组成的州！"
    }
};

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = USStateInfo;
}
