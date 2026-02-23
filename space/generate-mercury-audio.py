#!/usr/bin/env python3
"""
Edge-TTS 音频生成脚本 - 水星探险家
为 mercury.html 生成所有需要的中文语音 MP3 文件
"""

import edge_tts
import asyncio
import os

# 语音配置
VOICE = "zh-CN-XiaoxiaoNeural"  # 小晓 - 儿童友好的女声

# ============ 章节数据 ============
CHAPTERS = [
    {
        "id": 1,
        "title": "离太阳最近",
        "stories": [
            "水星是离太阳最近的行星，太阳在水星上看起来比在地球上大3倍！",
            "水星绕太阳一圈只要88天，是太阳系中跑得最快的行星",
            "水星的名字在英文里叫Mercury，就是罗马神话中跑得最快的信使之神"
        ],
        "hanzi": [
            {"char": "快", "pinyin": "kuài", "words": "快速，快乐", "sentence": "小兔子跑得真快"},
            {"char": "慢", "pinyin": "màn", "words": "慢慢，缓慢", "sentence": "小乌龟慢慢地爬"}
        ],
        "quiz_question": "离太阳最近的行星是？",
        "quiz_hint": "它是太阳系中跑得最快的行星哦！",
        "math_question": "水星跑了3圈，又跑了4圈，一共跑了几圈？",
        "math_hint": "3加4等于几？",
        "complete": "太厉害了！第1章，离太阳最近，探险成功！你获得了一颗星星！"
    },
    {
        "id": 2,
        "title": "极端温差",
        "stories": [
            "水星白天超级热，温度能到430度！",
            "但是到了晚上，温度会降到零下180度！",
            "这是因为水星几乎没有大气层保护，热量一下子就跑光了"
        ],
        "hanzi": [
            {"char": "早", "pinyin": "zǎo", "words": "早上，早安", "sentence": "早上起床要说早安"},
            {"char": "晚", "pinyin": "wǎn", "words": "晚上，晚安", "sentence": "晚上月亮出来了"}
        ],
        "quiz_question": "水星温差大是因为？",
        "quiz_hint": "没有大气层保护，热量就留不住...",
        "math_question": "白天热了5度，晚上又冷了3度，温度变化了几度？",
        "math_hint": "5加3等于几？",
        "complete": "太厉害了！第2章，极端温差，探险成功！你获得了一颗星星！"
    },
    {
        "id": 3,
        "title": "水星表面",
        "stories": [
            "水星的表面和月球很像，坑坑洼洼的全是陨石坑",
            "最大的陨石坑叫卡洛里盆地，直径有1500公里",
            "水星看起来灰灰的，因为表面都是岩石和尘土"
        ],
        "hanzi": [
            {"char": "黑", "pinyin": "hēi", "words": "黑色，黑夜", "sentence": "黑夜里有亮亮的星星"},
            {"char": "白", "pinyin": "bái", "words": "白色，雪白", "sentence": "白白的云朵飘在天上"}
        ],
        "quiz_question": "水星的表面和什么很像？",
        "quiz_hint": "想一想哪个天体也有很多陨石坑...",
        "math_question": "水星上有4个大陨石坑和5个小坑，一共几个？",
        "math_hint": "4加5等于几？",
        "complete": "太厉害了！第3章，水星表面，探险成功！你获得了一颗星星！"
    },
    {
        "id": 4,
        "title": "水星的一天",
        "stories": [
            "水星自转一圈要59个地球日！",
            "但是水星的一个太阳日，从日出到下一次日出，要176个地球日！",
            "也就是说水星上的一天比一年，88天绕太阳一圈，还要长！"
        ],
        "hanzi": [
            {"char": "长", "pinyin": "cháng", "words": "长短，长大", "sentence": "长颈鹿的脖子长长的"},
            {"char": "短", "pinyin": "duǎn", "words": "短小，长短", "sentence": "铅笔用短了要换新的"}
        ],
        "quiz_question": "水星的一天和一年比，哪个长？",
        "quiz_hint": "水星的太阳日有176天，而一年只有88天...",
        "math_question": "水星转了2圈太阳，地球转了6圈，地球多转了几圈？",
        "math_hint": "6减2等于几？",
        "complete": "太厉害了！第4章，水星的一天，探险成功！你获得了一颗星星！"
    },
    {
        "id": 5,
        "title": "没有月亮",
        "stories": [
            "水星没有卫星！它是太阳系中除了金星以外唯一没有月亮的行星",
            "水星也没有光环，是一颗孤独的小行星",
            "但是水星有一个很大的铁核，占了它体积的大部分"
        ],
        "hanzi": [
            {"char": "多", "pinyin": "duō", "words": "多少，很多", "sentence": "花园里有很多漂亮的花"},
            {"char": "少", "pinyin": "shǎo", "words": "多少，少数", "sentence": "今天作业很少真开心"}
        ],
        "quiz_question": "水星有几颗卫星？",
        "quiz_hint": "水星是一颗孤独的行星哦...",
        "math_question": "地球有1颗月亮，火星有2颗，水星有0颗，一共几颗？",
        "math_hint": "1加2加0等于几？",
        "complete": "太厉害了！第5章，没有月亮，探险成功！你获得了一颗星星！"
    },
    {
        "id": 6,
        "title": "探索水星",
        "stories": [
            "探索水星很难，因为它离太阳太近了",
            "美国的信使号探测器花了好多年才到达水星，围着它转了4年",
            "现在欧洲和日本的贝皮科伦坡号正在飞往水星的路上"
        ],
        "hanzi": [
            {"char": "前", "pinyin": "qián", "words": "前面，前进", "sentence": "勇敢地向前走"},
            {"char": "后", "pinyin": "hòu", "words": "后面，以后", "sentence": "小猫躲在椅子后面"}
        ],
        "quiz_question": "第一个围绕水星飞行的探测器叫？",
        "quiz_hint": "它的名字和水星的英文名Mercury有关...",
        "math_question": "信使号拍了6张照片，传回了4张，还没传回几张？",
        "math_hint": "6减4等于几？",
        "complete": "太厉害了！第6章，探索水星，探险成功！你获得了一颗星星！"
    }
]

def collect_all_audios():
    """收集所有需要生成的音频列表"""
    audios = []

    # 固定文本
    audios.append(("audio/mercury/correct.mp3", "太棒了！回答正确！"))
    audios.append(("audio/mercury/final-badge.mp3", "恭喜智天！你完成了全部6个章节的水星探险！你获得了水星探险家大徽章！"))

    for ch in CHAPTERS:
        cid = ch["id"]
        prefix = f"audio/mercury/ch{cid}"

        # 科普故事（每条）
        for i, story in enumerate(ch["stories"], 1):
            audios.append((f"{prefix}-story-{i}.mp3", story))

        # 汉字学习
        for j, h in enumerate(ch["hanzi"], 1):
            text = f"{h['char']}，{h['pinyin']}，{h['words']}。{h['sentence']}"
            audios.append((f"{prefix}-hanzi-{j}.mp3", text))

        # 知识测验题目
        audios.append((f"{prefix}-quiz.mp3", ch["quiz_question"]))
        audios.append((f"{prefix}-quiz-hint.mp3", ch["quiz_hint"]))

        # 数学挑战题目
        audios.append((f"{prefix}-math.mp3", ch["math_question"]))
        audios.append((f"{prefix}-math-hint.mp3", ch["math_hint"]))

        # 章节完成
        audios.append((f"{prefix}-complete.mp3", ch["complete"]))

    return audios


async def generate_audio(path, text, semaphore):
    """生成单个音频文件"""
    async with semaphore:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        communicate = edge_tts.Communicate(text, VOICE)
        await communicate.save(path)
        print(f"✓ {path}")


async def main():
    """主函数：生成所有音频"""
    audios = collect_all_audios()
    print(f"准备生成 {len(audios)} 个音频文件...\n")

    semaphore = asyncio.Semaphore(5)
    tasks = [generate_audio(path, text, semaphore) for path, text in audios]
    await asyncio.gather(*tasks)

    print(f"\n✅ 完成！共生成 {len(audios)} 个音频文件。")


if __name__ == "__main__":
    asyncio.run(main())
