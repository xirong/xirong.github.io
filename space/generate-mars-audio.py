#!/usr/bin/env python3
"""
Edge-TTS 音频生成脚本 - 火星探险家
为 mars.html 生成所有需要的中文语音 MP3 文件
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
        "title": "红色星球",
        "stories": [
            "火星是太阳系第四颗行星，排在地球后面！",
            "火星看起来是红色的，因为表面有很多氧化铁，就像铁生锈一样！",
            "所以火星也叫红色星球，中国古人叫它荧惑。"
        ],
        "hanzi": [
            {"char": "沙", "pinyin": "shā", "words": "沙子，沙漠", "sentence": "沙滩上的沙子细细的。"},
            {"char": "尘", "pinyin": "chén", "words": "灰尘，尘土", "sentence": "风吹起了一片尘土。"}
        ],
        "quiz_question": "火星为什么是红色的？",
        "quiz_hint": "想想铁生锈后是什么颜色？",
        "math_question": "火星上有3座大火山和4座小火山，一共几座？",
        "math_hint": "3加4等于几？",
        "complete": "太厉害了！第1章，红色星球，探险成功！你获得了一颗星星！"
    },
    {
        "id": 2,
        "title": "火星地形",
        "stories": [
            "火星上有太阳系最高的山，奥林帕斯山，高度是珠穆朗玛峰的3倍！",
            "火星上还有一条超级大峡谷叫水手号峡谷，长4000公里！",
            "火星的北半球平坦，南半球坑坑洼洼，科学家觉得很奇怪。"
        ],
        "hanzi": [
            {"char": "远", "pinyin": "yuǎn", "words": "远方，远处", "sentence": "远处的山看起来小小的。"},
            {"char": "近", "pinyin": "jìn", "words": "近处，附近", "sentence": "走近一看花开了。"}
        ],
        "quiz_question": "太阳系最高的山在哪里？",
        "quiz_hint": "想想奥林帕斯山在哪颗星球上...",
        "math_question": "峡谷里有6块大石头，滚走了2块，还剩几块？",
        "math_hint": "6减2等于几？",
        "complete": "太厉害了！第2章，火星地形，探险成功！你获得了一颗星星！"
    },
    {
        "id": 3,
        "title": "火星大气",
        "stories": [
            "火星有大气层，但非常非常稀薄，只有地球的百分之一！",
            "火星大气主要是二氧化碳，人类不能直接呼吸。",
            "火星上经常刮沙尘暴，有时候能把整个火星都包起来！"
        ],
        "hanzi": [
            {"char": "干", "pinyin": "gān", "words": "干燥，干净", "sentence": "沙漠里又干又热。"},
            {"char": "冷", "pinyin": "lěng", "words": "寒冷，冰冷", "sentence": "冬天好冷要穿厚衣服。"}
        ],
        "quiz_question": "火星上经常发生什么？",
        "quiz_hint": "火星上很干燥，风会卷起沙尘...",
        "math_question": "火星上刮了3天沙尘暴，又刮了5天，一共刮了几天？",
        "math_hint": "3加5等于几？",
        "complete": "太厉害了！第3章，火星大气，探险成功！你获得了一颗星星！"
    },
    {
        "id": 4,
        "title": "寻找水",
        "stories": [
            "科学家发现火星的南北极有大片的冰盖！",
            "火星上还有干涸的河道，说明很久以前火星上可能有河流和海洋。",
            "有水就可能有生命，所以科学家特别想知道火星上有没有生物。"
        ],
        "hanzi": [
            {"char": "冰", "pinyin": "bīng", "words": "冰块，冰冷", "sentence": "冬天河面结了厚厚的冰。"},
            {"char": "水", "pinyin": "shuǐ", "words": "水杯，河水", "sentence": "清清的河水哗哗地流。"}
        ],
        "quiz_question": "火星的极地有什么？",
        "quiz_hint": "科学家在火星南北极发现了什么？",
        "math_question": "探测器找到了3块冰和2块岩石，一共找到几块？",
        "math_hint": "3加2等于几？",
        "complete": "太厉害了！第4章，寻找水，探险成功！你获得了一颗星星！"
    },
    {
        "id": 5,
        "title": "火星探测器",
        "stories": [
            "人类派了好多机器人去火星探险！美国的好奇号火星车已经在火星上跑了好多年！",
            "中国的祝融号也成功登陆了火星，在上面拍了好多照片！",
            "这些火星车用太阳能或核电池供电，替我们探索火星。"
        ],
        "hanzi": [
            {"char": "车", "pinyin": "chē", "words": "汽车，火车", "sentence": "小汽车在马路上跑。"},
            {"char": "轮", "pinyin": "lún", "words": "车轮，轮子", "sentence": "自行车有两个轮子。"}
        ],
        "quiz_question": "中国的火星车叫什么名字？",
        "quiz_hint": "祝融是中国神话中的火神...",
        "math_question": "好奇号有6个轮子，坏了1个，还有几个好的？",
        "math_hint": "6减1等于几？",
        "complete": "太厉害了！第5章，火星探测器，探险成功！你获得了一颗星星！"
    },
    {
        "id": 6,
        "title": "火星的卫星",
        "stories": [
            "火星有2个小卫星，叫火卫一和火卫二！",
            "它们的名字来自希腊神话，意思是恐惧和恐慌。",
            "这两个卫星形状不像月球那样圆，而是像土豆一样不规则！"
        ],
        "hanzi": [
            {"char": "色", "pinyin": "sè", "words": "颜色，红色", "sentence": "彩虹有七种颜色。"},
            {"char": "红", "pinyin": "hóng", "words": "红色，红花", "sentence": "秋天的苹果红红的。"}
        ],
        "quiz_question": "火星有几个卫星？",
        "quiz_hint": "火卫一和火卫二...",
        "math_question": "地球有1个月亮，火星有2个小卫星，一共几个？",
        "math_hint": "1加2等于几？",
        "complete": "太厉害了！第6章，火星的卫星，探险成功！你获得了一颗星星！"
    }
]

def collect_all_audios():
    """收集所有需要生成的音频列表"""
    audios = []

    # 固定文本
    audios.append(("audio/mars/correct.mp3", "太棒了！回答正确！"))
    audios.append(("audio/mars/final-badge.mp3", "恭喜智天！你完成了全部6个章节的火星探险！你获得了火星探险家大徽章！"))

    for ch in CHAPTERS:
        cid = ch["id"]
        prefix = f"audio/mars/ch{cid}"

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
