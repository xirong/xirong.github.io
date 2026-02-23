#!/usr/bin/env python3
"""
Edge-TTS 音频生成脚本 - 海王星探险家
为 neptune.html 生成所有需要的中文语音 MP3 文件
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
        "title": "最远的行星",
        "stories": [
            "海王星是太阳系中离太阳最远的行星！",
            "海王星离太阳大约45亿公里！阳光到海王星要4个多小时！",
            "在海王星上看太阳，太阳就像一颗特别亮的星星。"
        ],
        "hanzi": [
            {"char": "海", "pinyin": "hǎi", "words": "大海，海洋", "sentence": "蓝蓝的大海一望无际。"},
            {"char": "洋", "pinyin": "yáng", "words": "海洋，太平洋", "sentence": "太平洋是最大的海洋。"}
        ],
        "quiz_question": "太阳系中离太阳最远的行星是？",
        "quiz_hint": "它是太阳系的第8颗行星哦！",
        "math_question": "太阳系有8颗行星，海王星排第8，前面有几颗？",
        "math_hint": "8减1等于几？",
        "complete": "太厉害了！第1章，最远的行星，探险成功！你获得了一颗星星！"
    },
    {
        "id": 2,
        "title": "蓝色的巨人",
        "stories": [
            "海王星是一颗美丽的蓝色星球！",
            "它的蓝色来自大气中的甲烷气体，甲烷吸收了红光，只反射蓝光！",
            "海王星的大小是地球的4倍，能装下57个地球！"
        ],
        "hanzi": [
            {"char": "蓝", "pinyin": "lán", "words": "蓝色，蓝天", "sentence": "蓝天上飘着白云。"},
            {"char": "深", "pinyin": "shēn", "words": "深浅，深海", "sentence": "大海深处住着大鲸鱼。"}
        ],
        "quiz_question": "海王星为什么是蓝色的？",
        "quiz_hint": "跟大气中一种特殊的气体有关...",
        "math_question": "海王星能装下地球，智天数了4个又数了3个，一共数了几个？",
        "math_hint": "4加3等于几？",
        "complete": "太厉害了！第2章，蓝色的巨人，探险成功！你获得了一颗星星！"
    },
    {
        "id": 3,
        "title": "超级风暴",
        "stories": [
            "海王星上的风是太阳系中最快的！风速可以超过每小时2000公里！",
            "1989年旅行者2号发现了一个叫大黑斑的巨大风暴！",
            "海王星上还有高高的冰云在天上飘。"
        ],
        "hanzi": [
            {"char": "波", "pinyin": "bō", "words": "波浪，风波", "sentence": "海面上翻起了大波浪。"},
            {"char": "浪", "pinyin": "làng", "words": "浪花，海浪", "sentence": "海浪拍打着沙滩。"}
        ],
        "quiz_question": "海王星上发现的巨大风暴叫什么？",
        "quiz_hint": "它的颜色是黑色的哦...",
        "math_question": "风暴刮了3天停了，又刮了5天，一共刮了几天？",
        "math_hint": "3加5等于几？",
        "complete": "太厉害了！第3章，超级风暴，探险成功！你获得了一颗星星！"
    },
    {
        "id": 4,
        "title": "海王星的卫星",
        "stories": [
            "海王星有16颗已知的卫星，最大的叫海卫一，也叫特里同！",
            "海卫一很特别，它是倒着绕海王星转的！说明它可能是被海王星抓来的！",
            "海卫一表面有氮冰喷泉，会喷出黑色的烟柱！"
        ],
        "hanzi": [
            {"char": "鱼", "pinyin": "yú", "words": "小鱼，金鱼", "sentence": "小鱼在水里游来游去。"},
            {"char": "门", "pinyin": "mén", "words": "大门，门口", "sentence": "打开大门迎客人。"}
        ],
        "quiz_question": "海卫一为什么特别？",
        "quiz_hint": "它转的方向跟其他卫星不一样...",
        "math_question": "海卫一喷了2次冰泉，又喷了4次，一共喷了几次？",
        "math_hint": "2加4等于几？",
        "complete": "太厉害了！第4章，海王星的卫星，探险成功！你获得了一颗星星！"
    },
    {
        "id": 5,
        "title": "冰巨星",
        "stories": [
            "海王星和天王星被叫做冰巨星，它们和木星土星的气巨星不同！",
            "海王星内部有大量的水冰、氨冰和甲烷冰！",
            "科学家猜测在海王星深处，巨大的压力可能把碳变成了钻石雨！"
        ],
        "hanzi": [
            {"char": "冰", "pinyin": "bīng", "words": "冰块，冰冷", "sentence": "冬天河面结了厚厚的冰。"},
            {"char": "寒", "pinyin": "hán", "words": "寒冷，严寒", "sentence": "寒冷的冬天要穿棉袄。"}
        ],
        "quiz_question": "海王星深处可能下什么雨？",
        "quiz_hint": "碳在巨大压力下会变成一种很珍贵的东西...",
        "math_question": "天上下了4颗钻石和2颗冰块，一共下了几颗？",
        "math_hint": "4加2等于几？",
        "complete": "太厉害了！第5章，冰巨星，探险成功！你获得了一颗星星！"
    },
    {
        "id": 6,
        "title": "发现海王星",
        "stories": [
            "海王星是人类用数学计算发现的！科学家发现天王星的轨道不太对，推测外面还有一颗行星在拉它！",
            "1846年，科学家按照计算的位置用望远镜找到了海王星！",
            "这证明了数学的力量真的很厉害！"
        ],
        "hanzi": [
            {"char": "井", "pinyin": "jǐng", "words": "水井，天井", "sentence": "古时候人们从井里打水喝。"},
            {"char": "暗", "pinyin": "àn", "words": "黑暗，暗淡", "sentence": "黑暗中有一盏小灯。"}
        ],
        "quiz_question": "海王星是怎么被发现的？",
        "quiz_hint": "科学家先算出了它应该在哪里...",
        "math_question": "科学家算了3天又算了4天，终于找到了海王星，一共算了几天？",
        "math_hint": "3加4等于几？",
        "complete": "太厉害了！第6章，发现海王星，探险成功！你获得了一颗星星！"
    }
]

def collect_all_audios():
    """收集所有需要生成的音频列表"""
    audios = []

    # 固定文本
    audios.append(("audio/neptune/correct.mp3", "太棒了！回答正确！"))
    audios.append(("audio/neptune/final-badge.mp3", "恭喜智天！你完成了全部6个章节的海王星探险！你获得了海王星探险家大徽章！"))

    for ch in CHAPTERS:
        cid = ch["id"]
        prefix = f"audio/neptune/ch{cid}"

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
