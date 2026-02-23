#!/usr/bin/env python3
"""
Edge-TTS 音频生成脚本 - 太阳探险家
为 sun.html 生成所有需要的中文语音 MP3 文件
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
        "title": "太阳有多大",
        "stories": [
            "太阳是太阳系中心的大火球，所有的行星都围着它转！",
            "太阳能装下130万个地球！它真的非常非常大！",
            "如果太阳是一个篮球，地球只有绿豆那么大！"
        ],
        "hanzi": [
            {"char": "日", "pinyin": "rì", "words": "日头，日出", "sentence": "太阳从东方升起。"},
            {"char": "火", "pinyin": "huǒ", "words": "火焰，火山", "sentence": "红红的火焰跳来跳去。"}
        ],
        "quiz_question": "太阳能装下多少个地球？",
        "quiz_hint": "太阳非常非常大哦！",
        "math_question": "太阳系有4个岩石行星和4个气态行星，一共几个？",
        "math_hint": "4加4等于几？",
        "complete": "太厉害了！第1章，太阳有多大，探险成功！你获得了一颗星星！"
    },
    {
        "id": 2,
        "title": "核聚变发光",
        "stories": [
            "太阳为什么会发光？因为核聚变！",
            "氢变成氦，释放出巨大的能量！",
            "就像一个超级大火炉，不停地燃烧，给我们带来光和热！"
        ],
        "hanzi": [
            {"char": "光", "pinyin": "guāng", "words": "光明，阳光", "sentence": "阳光照得大地亮堂堂。"},
            {"char": "热", "pinyin": "rè", "words": "热水，炎热", "sentence": "夏天真热要多喝水。"}
        ],
        "quiz_question": "太阳发光是因为？",
        "quiz_hint": "太阳里面氢变成氦...",
        "math_question": "太阳的光到地球要8分钟，小明等了2分钟，还要等几分钟？",
        "math_hint": "8减2等于几？",
        "complete": "太厉害了！第2章，核聚变发光，探险成功！你获得了一颗星星！"
    },
    {
        "id": 3,
        "title": "太阳温度",
        "stories": [
            "太阳表面温度有5500度，比火山岩浆还热！",
            "太阳核心温度更高，有1500万度！",
            "但太阳离我们很远，所以我们只觉得温暖。"
        ],
        "hanzi": [
            {"char": "红", "pinyin": "hóng", "words": "红色，红花", "sentence": "秋天枫叶红红的。"},
            {"char": "明", "pinyin": "míng", "words": "明天，光明", "sentence": "明天又是美好的一天。"}
        ],
        "quiz_question": "太阳表面大约多少度？",
        "quiz_hint": "比开水热多了，比1万度低一些...",
        "math_question": "小明看了3次太阳黑子，小红看了4次，一共看了几次？",
        "math_hint": "3加4等于几？",
        "complete": "太厉害了！第3章，太阳温度，探险成功！你获得了一颗星星！"
    },
    {
        "id": 4,
        "title": "太阳黑子",
        "stories": [
            "太阳表面有黑色斑点，叫做太阳黑子！",
            "它们不是真的黑，只是比周围温度低！",
            "黑子也有4000多度，但旁边更亮，所以显得黑！"
        ],
        "hanzi": [
            {"char": "金", "pinyin": "jīn", "words": "金子，金色", "sentence": "金色阳光洒满大地。"},
            {"char": "亮", "pinyin": "liàng", "words": "明亮，亮光", "sentence": "星星闪闪亮晶晶。"}
        ],
        "quiz_question": "太阳黑子看起来黑是因为？",
        "quiz_hint": "黑子温度比旁边低...",
        "math_question": "望远镜看到5个大黑子和2个小黑子，一共几个？",
        "math_hint": "5加2等于几？",
        "complete": "太厉害了！第4章，太阳黑子，探险成功！你获得了一颗星星！"
    },
    {
        "id": 5,
        "title": "太阳与生命",
        "stories": [
            "没有太阳，地球会变成冰球！",
            "植物需要阳光进行光合作用，才能生长！",
            "太阳给我们带来白天黑夜和四季变化！"
        ],
        "hanzi": [
            {"char": "力", "pinyin": "lì", "words": "力气，力量", "sentence": "大力士力气真大。"},
            {"char": "能", "pinyin": "néng", "words": "能力，能量", "sentence": "我能自己穿衣服了。"}
        ],
        "quiz_question": "没有太阳，地球会怎样？",
        "quiz_hint": "太阳给地球带来温暖...",
        "math_question": "春夏秋冬4个季节，智天最喜欢2个，不喜欢几个？",
        "math_hint": "4减2等于几？",
        "complete": "太厉害了！第5章，太阳与生命，探险成功！你获得了一颗星星！"
    },
    {
        "id": 6,
        "title": "太阳的未来",
        "stories": [
            "太阳已经燃烧了46亿年！",
            "大约50亿年后，太阳会变成红巨星！",
            "最后变成白矮星，像一颗安静的小星星。"
        ],
        "hanzi": [
            {"char": "阳", "pinyin": "yáng", "words": "太阳，阳光", "sentence": "阳光下的花儿开得真美。"},
            {"char": "白", "pinyin": "bái", "words": "白色，雪白", "sentence": "白白的云朵飘在天上。"}
        ],
        "quiz_question": "太阳最后会变成什么？",
        "quiz_hint": "太阳会变成一颗安静的小星星...",
        "math_question": "太阳家族有8颗行星，走了3颗去旅行，还剩几颗？",
        "math_hint": "8减3等于几？",
        "complete": "太厉害了！第6章，太阳的未来，探险成功！你获得了一颗星星！"
    }
]

def collect_all_audios():
    """收集所有需要生成的音频列表"""
    audios = []

    # 固定文本
    audios.append(("audio/sun/correct.mp3", "太棒了！回答正确！"))
    audios.append(("audio/sun/final-badge.mp3", "恭喜智天！你完成了全部6个章节的太阳探险！你获得了太阳探险家大徽章！"))

    for ch in CHAPTERS:
        cid = ch["id"]
        prefix = f"audio/sun/ch{cid}"

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
