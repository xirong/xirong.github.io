#!/usr/bin/env python3
"""
Edge-TTS 音频生成脚本 - 木星探险家
为 jupiter.html 生成所有需要的中文语音 MP3 文件
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
        "title": "太阳系最大",
        "stories": [
            "木星是太阳系中最大的行星！",
            "木星能装下1300多个地球！它的直径是地球的11倍！",
            "如果把太阳系所有行星加在一起，木星的质量还是比它们的总和大2倍多！"
        ],
        "hanzi": [
            {"char": "木", "pinyin": "mù", "words": "木头，树木", "sentence": "森林里有好多大树木。"},
            {"char": "目", "pinyin": "mù", "words": "目光，眼目", "sentence": "小宝宝的目光亮亮的。"}
        ],
        "quiz_question": "太阳系最大的行星是？",
        "quiz_hint": "它能装下1300多个地球哦！",
        "math_question": "木星有4颗大卫星和3颗小卫星在身边，一共几颗？",
        "math_hint": "4加3等于几？",
        "complete": "太厉害了！第1章，太阳系最大，探险成功！你获得了一颗星星！"
    },
    {
        "id": 2,
        "title": "气态巨行星",
        "stories": [
            "木星没有固体的地面！它全部是由气体组成的！",
            "主要是氢气和氦气，就像一个超级巨大的气球！",
            "如果你想在木星上降落，会一直往下沉，因为没有地面可以站！"
        ],
        "hanzi": [
            {"char": "云", "pinyin": "yún", "words": "白云，乌云", "sentence": "白白的云朵像棉花糖。"},
            {"char": "气", "pinyin": "qì", "words": "空气，气球", "sentence": "五颜六色的气球飞上天。"}
        ],
        "quiz_question": "木星的表面是什么？",
        "quiz_hint": "木星是气态巨行星哦！",
        "math_question": "木星大气有5层，我们看到了3层，还有几层没看到？",
        "math_hint": "5减3等于几？",
        "complete": "太厉害了！第2章，气态巨行星，探险成功！你获得了一颗星星！"
    },
    {
        "id": 3,
        "title": "大红斑",
        "stories": [
            "木星上有一个超级大风暴叫大红斑，比地球还要大！",
            "这个风暴已经刮了至少400年了，一直没有停！",
            "大红斑里面的风速可以达到每小时600多公里，比地球上最强的台风还厉害！"
        ],
        "hanzi": [
            {"char": "雷", "pinyin": "léi", "words": "打雷，雷声", "sentence": "轰隆隆，天上打雷了。"},
            {"char": "电", "pinyin": "diàn", "words": "闪电，电灯", "sentence": "闪电划过夜空好亮。"}
        ],
        "quiz_question": "木星的大红斑是什么？",
        "quiz_hint": "它已经刮了400年了！",
        "math_question": "大风暴里有4股大风和3股小风，一共几股风？",
        "math_hint": "4加3等于几？",
        "complete": "太厉害了！第3章，大红斑，探险成功！你获得了一颗星星！"
    },
    {
        "id": 4,
        "title": "木星的卫星",
        "stories": [
            "木星有79颗卫星，是太阳系卫星最多的行星之一！",
            "最有名的是四颗伽利略卫星：木卫一、木卫二、木卫三和木卫四！",
            "木卫二表面覆盖着冰，冰下面可能有海洋，说不定有生命哦！"
        ],
        "hanzi": [
            {"char": "口", "pinyin": "kǒu", "words": "人口，口袋", "sentence": "张开口大声唱歌。"},
            {"char": "耳", "pinyin": "ěr", "words": "耳朵，耳环", "sentence": "竖起耳朵仔细听。"}
        ],
        "quiz_question": "木星最有名的四颗卫星叫什么？",
        "quiz_hint": "是一位著名天文学家发现的！",
        "math_question": "伽利略发现了4颗卫星，后来又发现了3颗，一共几颗？",
        "math_hint": "4加3等于几？",
        "complete": "太厉害了！第4章，木星的卫星，探险成功！你获得了一颗星星！"
    },
    {
        "id": 5,
        "title": "木星的环",
        "stories": [
            "你知道吗？木星也有环！不过木星的环非常非常暗淡，肉眼看不到！",
            "木星环主要是由尘埃组成的，不像土星环那么漂亮！",
            "直到1979年旅行者1号飞过木星时才发现了它的环！"
        ],
        "hanzi": [
            {"char": "环", "pinyin": "huán", "words": "环绕，光环", "sentence": "土星的光环真漂亮。"},
            {"char": "圈", "pinyin": "quān", "words": "圆圈，跑圈", "sentence": "小朋友在操场跑了一圈。"}
        ],
        "quiz_question": "木星的环是由什么组成的？",
        "quiz_hint": "木星环非常暗淡...",
        "math_question": "木星环有3层，土星环有7层，木星比土星少几层？",
        "math_hint": "7减3等于几？",
        "complete": "太厉害了！第5章，木星的环，探险成功！你获得了一颗星星！"
    },
    {
        "id": 6,
        "title": "保护地球",
        "stories": [
            "木星有一个特别重要的作用，保护地球！",
            "木星的引力特别大，能把飞向地球的小行星和彗星吸引走！",
            "就像一个大哥哥，帮地球挡住了很多危险的石头雨，所以木星被叫做宇宙吸尘器！"
        ],
        "hanzi": [
            {"char": "雨", "pinyin": "yǔ", "words": "下雨，雨水", "sentence": "哗哗哗，下雨啦。"},
            {"char": "手", "pinyin": "shǒu", "words": "小手，手指", "sentence": "我有两只小小手。"}
        ],
        "quiz_question": "木星被叫做什么？",
        "quiz_hint": "它帮地球吸走了很多危险的东西...",
        "math_question": "木星帮地球挡住了5块大石头和3块小石头，一共几块？",
        "math_hint": "5加3等于几？",
        "complete": "太厉害了！第6章，保护地球，探险成功！你获得了一颗星星！"
    }
]

def collect_all_audios():
    """收集所有需要生成的音频列表"""
    audios = []

    # 固定文本
    audios.append(("audio/jupiter/correct.mp3", "太棒了！回答正确！"))
    audios.append(("audio/jupiter/final-badge.mp3", "恭喜智天！你完成了全部6个章节的木星探险！你获得了木星探险家大徽章！"))

    for ch in CHAPTERS:
        cid = ch["id"]
        prefix = f"audio/jupiter/ch{cid}"

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
