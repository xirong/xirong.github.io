/**
 * 省份详细信息
 * key 与 SVG 中的 class 名称对应
 */

const ProvinceInfo = {
    // ============ 直辖市 (4) ============
    "beijing": {
        name: "北京",
        color: "#FFD93D",
        region: "华北",
        type: "直辖市",
        food: { emoji: "🦆", name: "北京烤鸭" },
        landmark: { emoji: "🏯", name: "长城" },
        funFact: "北京是中国的首都，有600多年历史的故宫！"
    },
    "tianjin": {
        name: "天津",
        color: "#FFAB4C",
        region: "华北",
        type: "直辖市",
        food: { emoji: "🥟", name: "狗不理包子" },
        landmark: { emoji: "🎡", name: "天津之眼" },
        funFact: "天津的麻花和包子超好吃！"
    },
    "shanghai": {
        name: "上海",
        color: "#FF6B6B",
        region: "华东",
        type: "直辖市",
        food: { emoji: "🥮", name: "小笼包" },
        landmark: { emoji: "🗼", name: "东方明珠" },
        funFact: "上海是中国最大的城市之一！"
    },
    "chongqing": {
        name: "重庆",
        color: "#C56CF0",
        region: "西南",
        type: "直辖市",
        food: { emoji: "🍲", name: "重庆火锅" },
        landmark: { emoji: "🌉", name: "洪崖洞" },
        funFact: "重庆是山城，到处都是上坡下坡！"
    },

    // ============ 东北三省 ============
    "heilongjiang": {
        name: "黑龙江",
        color: "#5F9EA0",
        region: "东北",
        type: "省",
        food: { emoji: "🍖", name: "锅包肉" },
        landmark: { emoji: "❄️", name: "冰雪大世界" },
        funFact: "黑龙江的冬天可以看到美丽的冰雕！"
    },
    "jilin": {
        name: "吉林",
        color: "#4682B4",
        region: "东北",
        type: "省",
        food: { emoji: "🍗", name: "延边冷面" },
        landmark: { emoji: "🌲", name: "长白山" },
        funFact: "长白山有神秘的天池！"
    },
    "liaoning": {
        name: "辽宁",
        color: "#6495ED",
        region: "东北",
        type: "省",
        food: { emoji: "🥟", name: "沈阳鸡架" },
        landmark: { emoji: "🏰", name: "沈阳故宫" },
        funFact: "辽宁有中国第二大故宫！"
    },

    // ============ 华北地区 ============
    "hebei": {
        name: "河北",
        color: "#FFA07A",
        region: "华北",
        type: "省",
        food: { emoji: "🍜", name: "驴肉火烧" },
        landmark: { emoji: "⛩️", name: "承德避暑山庄" },
        funFact: "河北环绕着北京和天津！"
    },
    "shanxi": {
        name: "山西",
        color: "#FF7F50",
        region: "华北",
        type: "省",
        food: { emoji: "🍝", name: "刀削面" },
        landmark: { emoji: "🏛️", name: "平遥古城" },
        funFact: "山西的醋特别有名！"
    },
    "neimenggu": {
        name: "内蒙古",
        color: "#DEB887",
        region: "华北",
        type: "自治区",
        food: { emoji: "🥩", name: "烤全羊" },
        landmark: { emoji: "🌾", name: "呼伦贝尔大草原" },
        funFact: "内蒙古有广阔的大草原和蒙古包！"
    },

    // ============ 华东地区 ============
    "shandong": {
        name: "山东",
        color: "#32CD32",
        region: "华东",
        type: "省",
        food: { emoji: "🧅", name: "煎饼卷大葱" },
        landmark: { emoji: "⛰️", name: "泰山" },
        funFact: "山东的泰山是五岳之首！"
    },
    "jiangsu": {
        name: "江苏",
        color: "#3CB371",
        region: "华东",
        type: "省",
        food: { emoji: "🦀", name: "阳澄湖大闸蟹" },
        landmark: { emoji: "🏯", name: "苏州园林" },
        funFact: "苏州的园林像画一样美！"
    },
    "anhui": {
        name: "安徽",
        color: "#2E8B57",
        region: "华东",
        type: "省",
        food: { emoji: "🍲", name: "臭鳜鱼" },
        landmark: { emoji: "🏔️", name: "黄山" },
        funFact: "黄山的云海像仙境一样！"
    },
    "zhejiang": {
        name: "浙江",
        color: "#00CED1",
        region: "华东",
        type: "省",
        food: { emoji: "🍖", name: "东坡肉" },
        landmark: { emoji: "🌊", name: "西湖" },
        funFact: "杭州西湖有美丽的传说！"
    },
    "fujian": {
        name: "福建",
        color: "#20B2AA",
        region: "华东",
        type: "省",
        food: { emoji: "🍜", name: "沙县小吃" },
        landmark: { emoji: "🏠", name: "土楼" },
        funFact: "福建的土楼像外星飞船！"
    },
    "jiangxi": {
        name: "江西",
        color: "#48D1CC",
        region: "华东",
        type: "省",
        food: { emoji: "🌶️", name: "瓦罐汤" },
        landmark: { emoji: "🏞️", name: "庐山" },
        funFact: "庐山的瀑布特别壮观！"
    },
    "taiwan": {
        name: "台湾",
        color: "#FFD700",
        region: "华东",
        type: "省",
        food: { emoji: "🧋", name: "珍珠奶茶" },
        landmark: { emoji: "🌅", name: "日月潭" },
        funFact: "台湾的夜市小吃超级多！"
    },

    // ============ 华中地区 ============
    "henan": {
        name: "河南",
        color: "#00BFFF",
        region: "华中",
        type: "省",
        food: { emoji: "🍜", name: "烩面" },
        landmark: { emoji: "🥋", name: "少林寺" },
        funFact: "少林功夫天下闻名！"
    },
    "hubei": {
        name: "湖北",
        color: "#1E90FF",
        region: "华中",
        type: "省",
        food: { emoji: "🍜", name: "热干面" },
        landmark: { emoji: "🏛️", name: "黄鹤楼" },
        funFact: "武汉是九省通衢！"
    },
    "hunan": {
        name: "湖南",
        color: "#4169E1",
        region: "华中",
        type: "省",
        food: { emoji: "🌶️", name: "剁椒鱼头" },
        landmark: { emoji: "🏔️", name: "张家界" },
        funFact: "张家界的山像阿凡达电影里的！"
    },

    // ============ 华南地区 ============
    "guangdong": {
        name: "广东",
        color: "#FF69B4",
        region: "华南",
        type: "省",
        food: { emoji: "🥘", name: "早茶" },
        landmark: { emoji: "🗼", name: "广州塔" },
        funFact: "广东人什么都敢吃！"
    },
    "guangxi": {
        name: "广西",
        color: "#FF1493",
        region: "华南",
        type: "自治区",
        food: { emoji: "🍜", name: "螺蛳粉" },
        landmark: { emoji: "🏞️", name: "桂林山水" },
        funFact: "桂林山水甲天下！"
    },
    "hainan": {
        name: "海南",
        color: "#DB7093",
        region: "华南",
        type: "省",
        food: { emoji: "🍗", name: "文昌鸡" },
        landmark: { emoji: "🏖️", name: "三亚海滩" },
        funFact: "海南是中国的热带海岛！"
    },
    "xianggang": {
        name: "香港",
        color: "#FFD700",
        region: "华南",
        type: "特别行政区",
        food: { emoji: "🥤", name: "丝袜奶茶" },
        landmark: { emoji: "🎢", name: "迪士尼乐园" },
        funFact: "香港是购物天堂！"
    },
    "aomen": {
        name: "澳门",
        color: "#FFA500",
        region: "华南",
        type: "特别行政区",
        food: { emoji: "🥚", name: "葡式蛋挞" },
        landmark: { emoji: "🏛️", name: "大三巴牌坊" },
        funFact: "澳门曾经是葡萄牙管辖！"
    },

    // ============ 西南地区 ============
    "sichuan": {
        name: "四川",
        color: "#9B59B6",
        region: "西南",
        type: "省",
        food: { emoji: "🌶️", name: "麻婆豆腐" },
        landmark: { emoji: "🐼", name: "大熊猫基地" },
        funFact: "四川有可爱的大熊猫！"
    },
    "guizhou": {
        name: "贵州",
        color: "#8E44AD",
        region: "西南",
        type: "省",
        food: { emoji: "🍲", name: "酸汤鱼" },
        landmark: { emoji: "💧", name: "黄果树瀑布" },
        funFact: "黄果树瀑布是中国最大瀑布！"
    },
    "yunnan": {
        name: "云南",
        color: "#9370DB",
        region: "西南",
        type: "省",
        food: { emoji: "🍜", name: "过桥米线" },
        landmark: { emoji: "🏔️", name: "玉龙雪山" },
        funFact: "云南有26个少数民族！"
    },
    "xizang": {
        name: "西藏",
        color: "#BA55D3",
        region: "西南",
        type: "自治区",
        food: { emoji: "🫓", name: "糌粑" },
        landmark: { emoji: "🏯", name: "布达拉宫" },
        funFact: "西藏有世界最高的山峰珠穆朗玛峰！"
    },

    // ============ 西北地区 ============
    "shanxiHZ": {
        name: "陕西",
        color: "#A0522D",
        region: "西北",
        type: "省",
        food: { emoji: "🍜", name: "肉夹馍" },
        landmark: { emoji: "🗿", name: "兵马俑" },
        funFact: "秦始皇的兵马俑被称为世界第八大奇迹！"
    },
    "gansu": {
        name: "甘肃",
        color: "#8B4513",
        region: "西北",
        type: "省",
        food: { emoji: "🍜", name: "兰州拉面" },
        landmark: { emoji: "🏜️", name: "敦煌莫高窟" },
        funFact: "莫高窟有精美的壁画！"
    },
    "qinghai": {
        name: "青海",
        color: "#CD853F",
        region: "西北",
        type: "省",
        food: { emoji: "🥩", name: "手抓羊肉" },
        landmark: { emoji: "🌊", name: "青海湖" },
        funFact: "青海湖是中国最大的湖泊！"
    },
    "ningxia": {
        name: "宁夏",
        color: "#D2691E",
        region: "西北",
        type: "自治区",
        food: { emoji: "🍖", name: "手抓羊肉" },
        landmark: { emoji: "⛰️", name: "沙坡头" },
        funFact: "宁夏有金色的沙漠！"
    },
    "xinjiang": {
        name: "新疆",
        color: "#B8860B",
        region: "西北",
        type: "自治区",
        food: { emoji: "🍢", name: "羊肉串" },
        landmark: { emoji: "🏜️", name: "天山天池" },
        funFact: "新疆是中国最大的省区！"
    }
};

// 省份数量统计
const AdminStats = {
    province: 23,      // 省
    autonomous: 5,     // 自治区
    municipality: 4,   // 直辖市
    sar: 2            // 特别行政区
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProvinceInfo, AdminStats };
}
