#!/usr/bin/env python3
"""
Edge-TTS 音频生成脚本
为美国州拼图生成所有州介绍的语音 MP3 文件
"""

import edge_tts
import asyncio
import os

# 语音配置
VOICE = "zh-CN-XiaoxiaoNeural"  # 小晓 - 儿童友好的女声

# ============ 美国州信息数据 ============
# 与 us-state-info.js 保持一致（51 个：50 州 + DC）
STATES_DATA = {
    # 东北部 - 新英格兰
    "ME": {"nameCn": "缅因州", "food": "龙虾", "landmark": "阿卡迪亚", "funFact": "美国最东边的州，龙虾产量全美第一！"},
    "NH": {"nameCn": "新罕布什尔州", "food": "枫糖浆", "landmark": "白山", "funFact": "州口号是不自由毋宁死！"},
    "VT": {"nameCn": "佛蒙特州", "food": "冰淇淋", "landmark": "秋叶", "funFact": "Ben and Jerry's冰淇淋的故乡！"},
    "MA": {"nameCn": "马萨诸塞州", "food": "蛤蜊浓汤", "landmark": "哈佛大学", "funFact": "美国独立战争的发源地！"},
    "RI": {"nameCn": "罗德岛州", "food": "炸鱿鱼", "landmark": "纽波特", "funFact": "美国最小的州！"},
    "CT": {"nameCn": "康涅狄格州", "food": "披萨", "landmark": "耶鲁大学", "funFact": "世界上第一部电话簿在这里诞生！"},

    # 东北部 - 中大西洋
    "NY": {"nameCn": "纽约州", "food": "纽约披萨", "landmark": "自由女神", "funFact": "纽约市有800多种语言！"},
    "NJ": {"nameCn": "新泽西州", "food": "番茄派", "landmark": "大西洋城", "funFact": "人口密度最高的州！"},
    "PA": {"nameCn": "宾夕法尼亚州", "food": "椒盐卷饼", "landmark": "自由钟", "funFact": "美国独立宣言在费城签署！"},

    # 东南部
    "DE": {"nameCn": "特拉华州", "food": "蓝蟹", "landmark": "里霍博斯海滩", "funFact": "第一个批准宪法的州！"},
    "MD": {"nameCn": "马里兰州", "food": "马里兰蟹饼", "landmark": "巴尔的摩港", "funFact": "美国国歌在这里诞生！"},
    "DC": {"nameCn": "华盛顿特区", "food": "烟熏肠", "landmark": "白宫", "funFact": "美国首都，不属于任何州！"},
    "VA": {"nameCn": "弗吉尼亚州", "food": "花生", "landmark": "弗农山庄", "funFact": "8位美国总统出生在这里！"},
    "WV": {"nameCn": "西弗吉尼亚州", "food": "荞麦饼", "landmark": "新河峡谷", "funFact": "内战期间从弗吉尼亚分离出来！"},
    "NC": {"nameCn": "北卡罗来纳州", "food": "烧烤", "landmark": "小鹰镇", "funFact": "莱特兄弟在这里首次飞行！"},
    "SC": {"nameCn": "南卡罗来纳州", "food": "虾仁粗玉米粥", "landmark": "查尔斯顿", "funFact": "美国内战第一枪在这里打响！"},
    "GA": {"nameCn": "佐治亚州", "food": "桃子", "landmark": "亚特兰大", "funFact": "可口可乐的故乡！"},
    "FL": {"nameCn": "佛罗里达州", "food": "橙子", "landmark": "迪士尼乐园", "funFact": "阳光之州，有世界最大的迪士尼！"},

    # 南部
    "AL": {"nameCn": "阿拉巴马州", "food": "烧烤", "landmark": "太空中心", "funFact": "美国太空计划的重要基地！"},
    "MS": {"nameCn": "密西西比州", "food": "鲶鱼", "landmark": "蓝调之路", "funFact": "蓝调音乐的发源地！"},
    "LA": {"nameCn": "路易斯安那州", "food": "秋葵浓汤", "landmark": "新奥尔良", "funFact": "爵士乐的诞生地！"},
    "AR": {"nameCn": "阿肯色州", "food": "大米", "landmark": "温泉", "funFact": "沃尔玛总部所在地！"},
    "TN": {"nameCn": "田纳西州", "food": "炸鸡", "landmark": "纳什维尔", "funFact": "乡村音乐之都！"},
    "KY": {"nameCn": "肯塔基州", "food": "炸鸡", "landmark": "肯塔基赛马", "funFact": "KFC肯德基的故乡！"},

    # 中西部
    "OH": {"nameCn": "俄亥俄州", "food": "辛辛那提辣椒", "landmark": "杉点乐园", "funFact": "诞生了7位美国总统！"},
    "MI": {"nameCn": "密歇根州", "food": "樱桃", "landmark": "底特律", "funFact": "美国汽车工业之都！"},
    "IN": {"nameCn": "印第安纳州", "food": "玉米", "landmark": "印第500赛车", "funFact": "世界最著名的赛车比赛在这里！"},
    "IL": {"nameCn": "伊利诺伊州", "food": "深盘披萨", "landmark": "芝加哥", "funFact": "芝加哥有美国最高的摩天大楼！"},
    "WI": {"nameCn": "威斯康星州", "food": "奶酪", "landmark": "密尔沃基", "funFact": "奶酪之州，产量全美第一！"},
    "MN": {"nameCn": "明尼苏达州", "food": "热菜砂锅", "landmark": "美国购物中心", "funFact": "有超过10000个湖泊！"},
    "IA": {"nameCn": "爱荷华州", "food": "甜玉米", "landmark": "玉米田", "funFact": "美国最大的玉米产地！"},
    "MO": {"nameCn": "密苏里州", "food": "堪萨斯城烧烤", "landmark": "大拱门", "funFact": "圣路易斯大拱门是美国最高的人造纪念碑！"},

    # 大平原
    "ND": {"nameCn": "北达科他州", "food": "马铃薯汤", "landmark": "西奥多罗斯福国家公园", "funFact": "美国地理中心附近！"},
    "SD": {"nameCn": "南达科他州", "food": "烤牛肉块", "landmark": "拉什莫尔山", "funFact": "四位总统的头像刻在山上！"},
    "NE": {"nameCn": "内布拉斯加州", "food": "牛排", "landmark": "烟囱岩", "funFact": "股神巴菲特住在这里！"},
    "KS": {"nameCn": "堪萨斯州", "food": "烧烤", "landmark": "向日葵田", "funFact": "绿野仙踪的故事发生在这里！"},
    "OK": {"nameCn": "俄克拉荷马州", "food": "炸牛排", "landmark": "66号公路", "funFact": "66号公路穿过这里！"},
    "TX": {"nameCn": "德克萨斯州", "food": "德州墨西哥菜", "landmark": "阿拉莫", "funFact": "美国面积第二大的州！"},

    # 山区
    "MT": {"nameCn": "蒙大拿州", "food": "野牛肉", "landmark": "冰川国家公园", "funFact": "大天空之州！"},
    "WY": {"nameCn": "怀俄明州", "food": "麋鹿肉", "landmark": "黄石公园", "funFact": "人口最少的州，有世界第一个国家公园！"},
    "ID": {"nameCn": "爱达荷州", "food": "马铃薯", "landmark": "月球陨石坑", "funFact": "马铃薯产量全美第一！"},
    "CO": {"nameCn": "科罗拉多州", "food": "落基山牡蛎", "landmark": "落基山脉", "funFact": "平均海拔最高的州！"},
    "NM": {"nameCn": "新墨西哥州", "food": "青辣椒", "landmark": "热气球节", "funFact": "世界最大的热气球节！"},
    "AZ": {"nameCn": "亚利桑那州", "food": "索诺兰热狗", "landmark": "大峡谷", "funFact": "大峡谷是世界七大自然奇观之一！"},
    "UT": {"nameCn": "犹他州", "food": "果冻", "landmark": "盐湖城", "funFact": "盐湖城有著名的摩门教堂！"},
    "NV": {"nameCn": "内华达州", "food": "自助餐", "landmark": "拉斯维加斯", "funFact": "赌城拉斯维加斯在这里！"},

    # 太平洋沿岸
    "WA": {"nameCn": "华盛顿州", "food": "咖啡", "landmark": "雷尼尔山", "funFact": "星巴克和亚马逊的总部！"},
    "OR": {"nameCn": "俄勒冈州", "food": "葡萄酒", "landmark": "火山湖", "funFact": "没有销售税的州！"},
    "CA": {"nameCn": "加利福尼亚州", "food": "玉米饼", "landmark": "金门大桥", "funFact": "人口最多的州，好莱坞在这里！"},
    "AK": {"nameCn": "阿拉斯加州", "food": "帝王蟹", "landmark": "德纳利山", "funFact": "美国最大的州，比德州大两倍！"},
    "HI": {"nameCn": "夏威夷州", "food": "生鱼沙拉", "landmark": "威基基海滩", "funFact": "唯一全部由岛屿组成的州！"},
}


def collect_all_audios():
    """收集所有需要生成的音频列表"""
    audios = []

    for state_id, info in STATES_DATA.items():
        name = info["nameCn"]
        food = info["food"]
        landmark = info["landmark"]
        funFact = info["funFact"]

        text = f"{name}，美食是{food}，著名景点有{landmark}。{funFact}"
        path = f"audio/states/{state_id}.mp3"
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
    print(f"准备生成 {len(audios)} 个州介绍音频文件...\n")

    semaphore = asyncio.Semaphore(5)
    tasks = [generate_audio(path, text, semaphore) for path, text in audios]
    await asyncio.gather(*tasks)

    print(f"\n✅ 完成！共生成 {len(audios)} 个音频文件。")
    print(f"音频文件保存在: audio/states/")


if __name__ == "__main__":
    asyncio.run(main())
