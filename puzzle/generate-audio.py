#!/usr/bin/env python3
"""
Edge-TTS 音频生成脚本
为中国省份拼图生成所有省份介绍的语音 MP3 文件
"""

import edge_tts
import asyncio
import os

# 语音配置
VOICE = "zh-CN-XiaoxiaoNeural"  # 小晓 - 儿童友好的女声

# ============ 省份信息数据 ============
# 与 province-info.js 保持一致
PROVINCES_DATA = {
    # 直辖市 (4)
    "beijing": {
        "name": "北京",
        "food": "北京烤鸭",
        "landmark": "长城",
        "funFact": "北京是中国的首都，有600多年历史的故宫！"
    },
    "tianjin": {
        "name": "天津",
        "food": "狗不理包子",
        "landmark": "天津之眼",
        "funFact": "天津的麻花和包子超好吃！"
    },
    "shanghai": {
        "name": "上海",
        "food": "小笼包",
        "landmark": "东方明珠",
        "funFact": "上海是中国最大的城市之一！"
    },
    "chongqing": {
        "name": "重庆",
        "food": "重庆火锅",
        "landmark": "洪崖洞",
        "funFact": "重庆是山城，到处都是上坡下坡！"
    },

    # 东北三省
    "heilongjiang": {
        "name": "黑龙江",
        "food": "锅包肉",
        "landmark": "冰雪大世界",
        "funFact": "黑龙江的冬天可以看到美丽的冰雕！"
    },
    "jilin": {
        "name": "吉林",
        "food": "延边冷面",
        "landmark": "长白山",
        "funFact": "长白山有神秘的天池！"
    },
    "liaoning": {
        "name": "辽宁",
        "food": "沈阳鸡架",
        "landmark": "沈阳故宫",
        "funFact": "辽宁有中国第二大故宫！"
    },

    # 华北地区
    "hebei": {
        "name": "河北",
        "food": "驴肉火烧",
        "landmark": "承德避暑山庄",
        "funFact": "河北环绕着北京和天津！"
    },
    "shanxi": {
        "name": "山西",
        "food": "刀削面",
        "landmark": "平遥古城",
        "funFact": "山西的醋特别有名！"
    },
    "neimenggu": {
        "name": "内蒙古",
        "food": "烤全羊",
        "landmark": "呼伦贝尔大草原",
        "funFact": "内蒙古有广阔的大草原和蒙古包！"
    },

    # 华东地区
    "shandong": {
        "name": "山东",
        "food": "煎饼卷大葱",
        "landmark": "泰山",
        "funFact": "山东的泰山是五岳之首！"
    },
    "jiangsu": {
        "name": "江苏",
        "food": "阳澄湖大闸蟹",
        "landmark": "苏州园林",
        "funFact": "苏州的园林像画一样美！"
    },
    "anhui": {
        "name": "安徽",
        "food": "臭鳜鱼",
        "landmark": "黄山",
        "funFact": "黄山的云海像仙境一样！"
    },
    "zhejiang": {
        "name": "浙江",
        "food": "东坡肉",
        "landmark": "西湖",
        "funFact": "杭州西湖有美丽的传说！"
    },
    "fujian": {
        "name": "福建",
        "food": "沙县小吃",
        "landmark": "土楼",
        "funFact": "福建的土楼像外星飞船！"
    },
    "jiangxi": {
        "name": "江西",
        "food": "瓦罐汤",
        "landmark": "庐山",
        "funFact": "庐山的瀑布特别壮观！"
    },
    "taiwan": {
        "name": "台湾",
        "food": "珍珠奶茶",
        "landmark": "日月潭",
        "funFact": "台湾的夜市小吃超级多！"
    },

    # 华中地区
    "henan": {
        "name": "河南",
        "food": "烩面",
        "landmark": "少林寺",
        "funFact": "少林功夫天下闻名！"
    },
    "hubei": {
        "name": "湖北",
        "food": "热干面",
        "landmark": "黄鹤楼",
        "funFact": "武汉是九省通衢！"
    },
    "hunan": {
        "name": "湖南",
        "food": "剁椒鱼头",
        "landmark": "张家界",
        "funFact": "张家界的山像阿凡达电影里的！"
    },

    # 华南地区
    "guangdong": {
        "name": "广东",
        "food": "早茶",
        "landmark": "广州塔",
        "funFact": "广东人什么都敢吃！"
    },
    "guangxi": {
        "name": "广西",
        "food": "螺蛳粉",
        "landmark": "桂林山水",
        "funFact": "桂林山水甲天下！"
    },
    "hainan": {
        "name": "海南",
        "food": "文昌鸡",
        "landmark": "三亚海滩",
        "funFact": "海南是中国的热带海岛！"
    },
    "xianggang": {
        "name": "香港",
        "food": "丝袜奶茶",
        "landmark": "迪士尼乐园",
        "funFact": "香港是购物天堂！"
    },
    "aomen": {
        "name": "澳门",
        "food": "葡式蛋挞",
        "landmark": "大三巴牌坊",
        "funFact": "澳门曾经是葡萄牙管辖！"
    },

    # 西南地区
    "sichuan": {
        "name": "四川",
        "food": "麻婆豆腐",
        "landmark": "大熊猫基地",
        "funFact": "四川有可爱的大熊猫！"
    },
    "guizhou": {
        "name": "贵州",
        "food": "酸汤鱼",
        "landmark": "黄果树瀑布",
        "funFact": "黄果树瀑布是中国最大瀑布！"
    },
    "yunnan": {
        "name": "云南",
        "food": "过桥米线",
        "landmark": "玉龙雪山",
        "funFact": "云南有26个少数民族！"
    },
    "xizang": {
        "name": "西藏",
        "food": "糌粑",
        "landmark": "布达拉宫",
        "funFact": "西藏有世界最高的山峰珠穆朗玛峰！"
    },

    # 西北地区
    "shanxiHZ": {
        "name": "陕西",
        "food": "肉夹馍",
        "landmark": "兵马俑",
        "funFact": "秦始皇的兵马俑被称为世界第八大奇迹！"
    },
    "gansu": {
        "name": "甘肃",
        "food": "兰州拉面",
        "landmark": "敦煌莫高窟",
        "funFact": "莫高窟有精美的壁画！"
    },
    "qinghai": {
        "name": "青海",
        "food": "手抓羊肉",
        "landmark": "青海湖",
        "funFact": "青海湖是中国最大的湖泊！"
    },
    "ningxia": {
        "name": "宁夏",
        "food": "手抓羊肉",
        "landmark": "沙坡头",
        "funFact": "宁夏有金色的沙漠！"
    },
    "xinjiang": {
        "name": "新疆",
        "food": "羊肉串",
        "landmark": "天山天池",
        "funFact": "新疆是中国最大的省区！"
    },
}


def collect_all_audios():
    """收集所有需要生成的音频列表"""
    audios = []

    for province_id, info in PROVINCES_DATA.items():
        name = info["name"]
        food = info["food"]
        landmark = info["landmark"]
        funFact = info["funFact"]

        # 朗读内容："{name}，美食是{food}，著名景点有{landmark}。{funFact}"
        text = f"{name}，美食是{food}，著名景点有{landmark}。{funFact}"
        path = f"audio/provinces/{province_id}.mp3"
        audios.append((path, text))

    return audios


async def generate_audio(path, text, semaphore):
    """生成单个音频文件"""
    async with semaphore:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        communicate = edge_tts.Communicate(text, VOICE)
        await communicate.save(path)
        print(f"✓ Generated: {path}")


async def main():
    """主函数：生成所有音频"""
    audios = collect_all_audios()
    print(f"准备生成 {len(audios)} 个省份介绍音频文件...\n")

    # 使用信号量限制并发数
    semaphore = asyncio.Semaphore(5)

    tasks = [generate_audio(path, text, semaphore) for path, text in audios]
    await asyncio.gather(*tasks)

    print(f"\n✅ 完成！共生成 {len(audios)} 个音频文件。")
    print(f"音频文件保存在: audio/provinces/")


if __name__ == "__main__":
    asyncio.run(main())
