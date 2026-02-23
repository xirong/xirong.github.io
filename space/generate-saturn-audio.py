#!/usr/bin/env python3
"""
Edge-TTS 音频生成脚本 - 土星探险家
为 saturn.html 生成所有需要的中文语音 MP3 文件
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
        "title": "美丽的光环",
        "stories": [
            "土星最有名的就是它美丽的光环！光环看起来像一个大大的帽檐。",
            "土星环是由无数冰块和岩石组成的，大的像房子，小的像沙粒。",
            "这些冰块和石头围绕土星高速旋转，看起来就像一个巨大的唱片！"
        ],
        "hanzi": [
            {"char": "圆", "pinyin": "yuán", "words": "圆形，团圆", "sentence": "中秋节的月亮又大又圆。"},
            {"char": "方", "pinyin": "fāng", "words": "方形，方向", "sentence": "积木有圆的也有方的。"}
        ],
        "quiz_question": "土星环是由什么组成的？",
        "quiz_hint": "想想那些大大小小的冰块...",
        "math_question": "土星环有3层明亮的环和4层暗淡的环，一共几层？",
        "math_hint": "3加4等于几？",
        "complete": "太厉害了！第1章，美丽的光环，探险成功！你获得了一颗星星！"
    },
    {
        "id": 2,
        "title": "密度最小",
        "stories": [
            "土星有一个超级有趣的特点——它的密度比水还小！",
            "如果有一个足够大的游泳池，把土星放进去，它会浮在水面上！",
            "这是因为土星主要由氢气和氦气组成，非常非常轻。"
        ],
        "hanzi": [
            {"char": "小", "pinyin": "xiǎo", "words": "大小，小鸟", "sentence": "小蚂蚁搬着大米粒。"},
            {"char": "中", "pinyin": "zhōng", "words": "中间，中国", "sentence": "我站在小朋友中间。"}
        ],
        "quiz_question": "把土星放进水里会怎样？",
        "quiz_hint": "土星的密度比水还小呢！",
        "math_question": "游泳池里有8个球，沉下去了3个，浮着的有几个？",
        "math_hint": "8减3等于几？",
        "complete": "太厉害了！第2章，密度最小，探险成功！你获得了一颗星星！"
    },
    {
        "id": 3,
        "title": "土星的风",
        "stories": [
            "土星上的风速快得吓人，最快能到每小时1800公里！",
            "这比地球上最快的飞机还要快好几倍！",
            "在土星的两极还有六边形的旋风，形状特别奇怪，像一个巨大的蜂巢！"
        ],
        "hanzi": [
            {"char": "上", "pinyin": "shàng", "words": "上面，上课", "sentence": "小鸟飞到树上去。"},
            {"char": "下", "pinyin": "xià", "words": "下面，下雨", "sentence": "雨滴从天上掉下来。"}
        ],
        "quiz_question": "土星两极的旋风是什么形状？",
        "quiz_hint": "像蜂巢的形状...",
        "math_question": "土星刮了2天大风，又刮了6天小风，一共刮了几天？",
        "math_hint": "2加6等于几？",
        "complete": "太厉害了！第3章，土星的风，探险成功！你获得了一颗星星！"
    },
    {
        "id": 4,
        "title": "神秘的土卫六",
        "stories": [
            "土卫六是土星最大的卫星，也叫泰坦。",
            "它有厚厚的大气层，是太阳系中除了地球以外唯一有浓厚大气的卫星。",
            "土卫六上有湖泊和河流，但不是水，而是液态的甲烷！"
        ],
        "hanzi": [
            {"char": "里", "pinyin": "lǐ", "words": "里面，家里", "sentence": "盒子里面有什么呢？"},
            {"char": "外", "pinyin": "wài", "words": "外面，外婆", "sentence": "外面的世界真精彩。"}
        ],
        "quiz_question": "土卫六上的湖泊是什么做的？",
        "quiz_hint": "不是水哦，是一种特殊的液体...",
        "math_question": "土卫六有2片大湖和4片小湖，一共几片？",
        "math_hint": "2加4等于几？",
        "complete": "太厉害了！第4章，神秘的土卫六，探险成功！你获得了一颗星星！"
    },
    {
        "id": 5,
        "title": "土星的卫星",
        "stories": [
            "土星有80多颗卫星，是太阳系中卫星第二多的行星！",
            "除了土卫六，还有一颗很特别的卫星叫土卫二。",
            "土卫二的南极会喷出冰的喷泉！科学家觉得冰下面可能有温暖的海洋。"
        ],
        "hanzi": [
            {"char": "花", "pinyin": "huā", "words": "花朵，开花", "sentence": "春天百花齐开放。"},
            {"char": "美", "pinyin": "měi", "words": "美丽，美好", "sentence": "夜空的星星真美。"}
        ],
        "quiz_question": "土卫二有什么特别之处？",
        "quiz_hint": "南极有什么特殊的东西喷出来？",
        "math_question": "我们发现了4颗有冰的卫星和2颗没冰的，一共几颗？",
        "math_hint": "4加2等于几？",
        "complete": "太厉害了！第5章，土星的卫星，探险成功！你获得了一颗星星！"
    },
    {
        "id": 6,
        "title": "卡西尼号探测器",
        "stories": [
            "人类派了一个叫卡西尼号的探测器去研究土星！",
            "它飞了7年才到土星，在那里工作了13年！",
            "最后卡西尼号冲进了土星的大气层，像一颗流星一样消失了，完成了它的使命。"
        ],
        "hanzi": [
            {"char": "冰", "pinyin": "bīng", "words": "冰块，冰激凌", "sentence": "冬天河面结了厚厚的冰。"},
            {"char": "石", "pinyin": "shí", "words": "石头，岩石", "sentence": "河边有很多圆圆的石头。"}
        ],
        "quiz_question": "卡西尼号最后怎么了？",
        "quiz_hint": "它像流星一样完成了使命...",
        "math_question": "卡西尼号拍了5张土星照片和4张卫星照片，一共几张？",
        "math_hint": "5加4等于几？",
        "complete": "太厉害了！第6章，卡西尼号探测器，探险成功！你获得了一颗星星！"
    }
]

def collect_all_audios():
    """收集所有需要生成的音频列表"""
    audios = []

    # 固定文本
    audios.append(("audio/saturn/correct.mp3", "太棒了！回答正确！"))
    audios.append(("audio/saturn/final-badge.mp3", "恭喜智天！你完成了全部6个章节的土星探险！你获得了土星探险家大徽章！"))

    for ch in CHAPTERS:
        cid = ch["id"]
        prefix = f"audio/saturn/ch{cid}"

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
