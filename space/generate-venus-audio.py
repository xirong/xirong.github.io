#!/usr/bin/env python3
"""
Edge-TTS 音频生成脚本 - 金星探险家
为 venus.html 生成所有需要的中文语音 MP3 文件
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
        "title": "地球的姐妹",
        "stories": [
            "金星和地球大小差不多，所以被叫做地球的姐妹星！",
            "但是金星和地球其实非常不一样，它是太阳系中最热的行星！",
            "金星是夜空中除了月亮以外最亮的天体，古人叫它太白金星！"
        ],
        "hanzi": [
            {"char": "心", "pinyin": "xīn", "words": "心脏，开心", "sentence": "今天玩得好开心！"},
            {"char": "热", "pinyin": "rè", "words": "炎热，热水", "sentence": "夏天好热要吃西瓜！"}
        ],
        "quiz_question": "金星被叫做地球的什么？",
        "quiz_hint": "金星和地球大小差不多哦！",
        "math_question": "金星和地球是姐妹，再加上火星3个好朋友，一共几个？",
        "math_hint": "金星、地球、火星，数一数！",
        "complete": "太厉害了！第1章，地球的姐妹，探险成功！你获得了一颗星星！"
    },
    {
        "id": 2,
        "title": "超级大气层",
        "stories": [
            "金星被厚厚的云层包裹着，从外面根本看不到表面！",
            "金星的大气层主要是二氧化碳，产生了超强的温室效应！",
            "大气压力是地球的90倍！就像在900米深的海底一样。"
        ],
        "hanzi": [
            {"char": "厚", "pinyin": "hòu", "words": "厚薄，厚度", "sentence": "冬天要穿厚厚的棉衣。"},
            {"char": "薄", "pinyin": "báo", "words": "薄薄，薄片", "sentence": "薄薄的纸一撕就破。"}
        ],
        "quiz_question": "金星表面看不到是因为？",
        "quiz_hint": "金星被什么东西包住了呢？",
        "math_question": "金星有5层厚厚的云，地球有3层，金星多几层？",
        "math_hint": "5减3等于几？",
        "complete": "太厉害了！第2章，超级大气层，探险成功！你获得了一颗星星！"
    },
    {
        "id": 3,
        "title": "最热的行星",
        "stories": [
            "金星表面温度高达465度！比水星还热，虽然水星离太阳更近！",
            "这是因为金星的温室效应太强了，热量进去就出不来！",
            "铅和锡到了金星上都会被融化成液体！"
        ],
        "hanzi": [
            {"char": "高", "pinyin": "gāo", "words": "高大，高兴", "sentence": "长颈鹿长得又高又大。"},
            {"char": "低", "pinyin": "dī", "words": "高低，低头", "sentence": "小草低低的贴着地面。"}
        ],
        "quiz_question": "太阳系最热的行星是？",
        "quiz_hint": "温室效应最强的那颗！",
        "math_question": "今天温度升高了3度，明天又升高了4度，一共升了几度？",
        "math_hint": "3加4等于几？",
        "complete": "太厉害了！第3章，最热的行星，探险成功！你获得了一颗星星！"
    },
    {
        "id": 4,
        "title": "倒着转的行星",
        "stories": [
            "金星是太阳系中唯一倒着转的行星！",
            "在金星上，太阳是从西边升起、东边落下的，和地球完全相反！",
            "而且金星自转一圈要243天，比它绕太阳一圈的225天还长！"
        ],
        "hanzi": [
            {"char": "开", "pinyin": "kāi", "words": "开门，打开", "sentence": "开门迎接好朋友！"},
            {"char": "关", "pinyin": "guān", "words": "关门，关闭", "sentence": "睡觉前要关好门窗。"}
        ],
        "quiz_question": "金星上太阳从哪边升起？",
        "quiz_hint": "金星是倒着转的哦！",
        "math_question": "金星转了2圈，地球转了8圈，地球多转了几圈？",
        "math_hint": "8减2等于几？",
        "complete": "太厉害了！第4章，倒着转的行星，探险成功！你获得了一颗星星！"
    },
    {
        "id": 5,
        "title": "金星的表面",
        "stories": [
            "科学家用雷达穿过厚厚的云层，终于看到了金星的表面！",
            "金星上有很多火山，有些可能现在还在喷发！",
            "金星表面有高山、峡谷和大片的熔岩平原，像一个炼狱般的世界。"
        ],
        "hanzi": [
            {"char": "左", "pinyin": "zuǒ", "words": "左边，左手", "sentence": "左手和右手是好朋友！"},
            {"char": "右", "pinyin": "yòu", "words": "右边，右手", "sentence": "用右手写出漂亮的字。"}
        ],
        "quiz_question": "科学家用什么看到金星表面的？",
        "quiz_hint": "需要穿过厚厚的云层...",
        "math_question": "金星上有3座大火山和4座小火山，一共几座？",
        "math_hint": "3加4等于几？",
        "complete": "太厉害了！第5章，金星的表面，探险成功！你获得了一颗星星！"
    },
    {
        "id": 6,
        "title": "探索金星",
        "stories": [
            "苏联的金星号系列探测器多次降落在金星表面！",
            "但是因为金星太热太热了，探测器最多只能坚持2个小时就被烤坏了！",
            "科学家们正在设计新的探测器，希望能在金星上待更久！"
        ],
        "hanzi": [
            {"char": "出", "pinyin": "chū", "words": "出发，日出", "sentence": "太阳从山后面出来了！"},
            {"char": "入", "pinyin": "rù", "words": "进入，出入", "sentence": "秋天到了果实入仓了。"}
        ],
        "quiz_question": "探测器在金星上坚持不久是因为？",
        "quiz_hint": "金星表面有多少度来着？",
        "math_question": "探测器拍了5张照片，发回了3张，还剩几张没发？",
        "math_hint": "5减3等于几？",
        "complete": "太厉害了！第6章，探索金星，探险成功！你获得了一颗星星！"
    }
]

def collect_all_audios():
    """收集所有需要生成的音频列表"""
    audios = []

    # 固定文本
    audios.append(("audio/venus/correct.mp3", "太棒了！回答正确！"))
    audios.append(("audio/venus/final-badge.mp3", "恭喜智天！你完成了全部6个章节的金星探险！你获得了金星探险家大徽章！"))

    for ch in CHAPTERS:
        cid = ch["id"]
        prefix = f"audio/venus/ch{cid}"

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
