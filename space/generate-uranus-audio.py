#!/usr/bin/env python3
"""
Edge-TTS 音频生成脚本 - 天王星探险家
为 uranus.html 生成所有需要的中文语音 MP3 文件
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
        "title": "横躺的行星",
        "stories": [
            "天王星是一颗非常特别的行星——它是横着躺在太空中的！",
            "科学家觉得很久很久以前，一颗地球大小的天体撞了天王星，把它撞歪了。",
            "天王星的自转轴倾斜了98度，就像一个球在地上滚着前进一样！"
        ],
        "hanzi": [
            {"char": "倒", "pinyin": "dǎo", "words": "倒下，倒立", "sentence": "天王星是横着躺倒的行星。"},
            {"char": "转", "pinyin": "zhuàn", "words": "旋转，转动", "sentence": "地球像陀螺一样不停地转。"},
            {"char": "歪", "pinyin": "wāi", "words": "歪斜，歪头", "sentence": "小狗歪着头看着我。"}
        ],
        "quiz_question": "天王星为什么是横着转的？",
        "quiz_hint": "很久以前被一颗地球大小的天体撞了...",
        "math": [
            {"question": "天王星倾斜了98度，直立的行星是0度，天王星比直立多歪了多少度？", "hint": "98减0等于几？"},
            {"question": "太阳系有8颗行星，横躺着转的只有1颗，竖着转的有几颗？", "hint": "8减1等于7"},
            {"question": "比一比，8和1，哪个大？", "hint": "8比1大！竖着转的行星比横着转的多。"}
        ],
        "complete": "太厉害了！第1章，横躺的行星，探险成功！你获得了一颗星星！"
    },
    {
        "id": 2,
        "title": "冰巨星的秘密",
        "stories": [
            "天王星和海王星被称为冰巨星，和木星、土星不一样。",
            "天王星的内部有大量的水冰、甲烷冰和氨冰，就像一个巨大的冰球。",
            "天王星之所以看起来是青蓝色的，是因为大气中的甲烷气体会吸收红光。"
        ],
        "hanzi": [
            {"char": "冷", "pinyin": "lěng", "words": "寒冷，冰冷", "sentence": "冬天好冷，要穿厚衣服。"},
            {"char": "蓝", "pinyin": "lán", "words": "蓝色，蓝天", "sentence": "天王星是美丽的蓝色。"},
            {"char": "气", "pinyin": "qì", "words": "空气，气球", "sentence": "天王星的大气有甲烷气。"}
        ],
        "quiz_question": "天王星为什么看起来是青蓝色的？",
        "quiz_hint": "大气中有一种特殊的气体...",
        "math": [
            {"question": "太阳系有2颗冰巨星和2颗气态巨行星，一共几颗巨行星？", "hint": "2加2等于几？"},
            {"question": "天王星有3种冰：水冰、甲烷冰、氨冰，如果融化了1种，还剩几种？", "hint": "3减1等于2"},
            {"question": "比一比，2和2，哪个大？", "hint": "2和2一样大！冰巨星和气态巨行星一样多。"}
        ],
        "complete": "太厉害了！第2章，冰巨星的秘密，探险成功！你获得了一颗星星！"
    },
    {
        "id": 3,
        "title": "天王星的光环",
        "stories": [
            "你知道吗？天王星也有光环！只是比土星的暗淡得多。",
            "天王星一共有13道光环，它们非常细而且很暗，肉眼看不到。",
            "天王星的光环是竖着的！因为天王星是横躺的，所以环也跟着竖起来了。"
        ],
        "hanzi": [
            {"char": "暗", "pinyin": "àn", "words": "黑暗，暗淡", "sentence": "关了灯，房间一片暗。"},
            {"char": "细", "pinyin": "xì", "words": "细小，细线", "sentence": "天王星的光环又细又暗。"},
            {"char": "竖", "pinyin": "shù", "words": "竖立，竖起", "sentence": "天王星的光环是竖着的。"}
        ],
        "quiz_question": "天王星有几道光环？",
        "quiz_hint": "比10多，比15少...",
        "math": [
            {"question": "天王星有13道环，科学家先发现了9道，后来又发现了几道？", "hint": "13减9等于几？"},
            {"question": "天王星有13道环，土星肉眼可见的环有3道，天王星比土星多几道？", "hint": "13减3等于10"},
            {"question": "比一比，9和4，哪个大？", "hint": "9比4大！先发现的环比后发现的多。"}
        ],
        "complete": "太厉害了！第3章，天王星的光环，探险成功！你获得了一颗星星！"
    },
    {
        "id": 4,
        "title": "奇特的卫星",
        "stories": [
            "天王星有27颗已知的卫星，它们都是以文学作品中的人物命名的！",
            "其中最大的卫星叫天卫三，也叫泰坦妮亚，它的表面有峡谷和悬崖。",
            "还有一颗叫天卫五，也叫米兰达的卫星特别奇怪，表面有一个高达20公里的大悬崖！"
        ],
        "hanzi": [
            {"char": "高", "pinyin": "gāo", "words": "高大，高山", "sentence": "天卫五的悬崖特别高。"},
            {"char": "名", "pinyin": "míng", "words": "名字，有名", "sentence": "天王星的卫星名字很好听。"},
            {"char": "深", "pinyin": "shēn", "words": "深处，深海", "sentence": "峡谷很深很深。"}
        ],
        "quiz_question": "天王星的卫星是以什么命名的？",
        "quiz_hint": "是文学作品中的人物哦...",
        "math": [
            {"question": "天王星有27颗卫星，其中5颗比较大，小卫星有几颗？", "hint": "27减5等于几？"},
            {"question": "探测器拍了5颗大卫星的照片，又拍了3颗小卫星，一共拍了几颗？", "hint": "5加3等于8"},
            {"question": "比一比，5和3，哪个大？", "hint": "5比3大！拍大卫星比拍小卫星多。"}
        ],
        "complete": "太厉害了！第4章，奇特的卫星，探险成功！你获得了一颗星星！"
    },
    {
        "id": 5,
        "title": "极端的季节",
        "stories": [
            "因为天王星是横着转的，所以它的季节非常极端！",
            "天王星的一个极地面朝太阳时，那里会有连续42年的白天！",
            "然后另一个极转向太阳，前一个极就开始连续42年的黑夜！天王星绕太阳一圈要84年。"
        ],
        "hanzi": [
            {"char": "长", "pinyin": "cháng", "words": "长久，很长", "sentence": "天王星的一天很长。"},
            {"char": "黑", "pinyin": "hēi", "words": "黑夜，黑色", "sentence": "天王星的极地有42年黑夜。"},
            {"char": "白", "pinyin": "bái", "words": "白天，白色", "sentence": "天王星的极地有42年白天。"}
        ],
        "quiz_question": "天王星绕太阳一圈要多少年？",
        "quiz_hint": "42年白天加42年黑夜...",
        "math": [
            {"question": "天王星极地有42年白天和42年黑夜，加起来是多少年？", "hint": "42加42等于几？"},
            {"question": "地球1年有4个季节，天王星也有4个季节但每个季节约21年，21比4多几？", "hint": "21减4等于17"},
            {"question": "比一比，42和42，哪个大？", "hint": "42和42一样大！白天和黑夜一样长。"}
        ],
        "complete": "太厉害了！第5章，极端的季节，探险成功！你获得了一颗星星！"
    },
    {
        "id": 6,
        "title": "发现天王星",
        "stories": [
            "天王星是第一颗用望远镜发现的行星！之前的行星都能用肉眼看到。",
            "1781年，一位叫赫歇尔的天文学家用自制的望远镜发现了它。",
            "旅行者2号是唯一飞越天王星的探测器，它在1986年拍下了天王星的照片。"
        ],
        "hanzi": [
            {"char": "看", "pinyin": "kàn", "words": "看见，好看", "sentence": "用望远镜可以看到很远。"},
            {"char": "远", "pinyin": "yuǎn", "words": "远方，遥远", "sentence": "天王星离太阳很远。"},
            {"char": "新", "pinyin": "xīn", "words": "新发现，新的", "sentence": "赫歇尔发现了新行星。"}
        ],
        "quiz_question": "天王星是怎么被发现的？",
        "quiz_hint": "赫歇尔用了一种工具...",
        "math": [
            {"question": "天王星在1781年被发现，旅行者2号1986年飞越，相隔多少年？", "hint": "1986减1781等于几？"},
            {"question": "旅行者2号拍了6张天王星的照片和4张卫星的照片，一共几张？", "hint": "6加4等于10"},
            {"question": "比一比，6和4，哪个大？", "hint": "6比4大！天王星的照片比卫星的多。"}
        ],
        "complete": "太厉害了！第6章，发现天王星，探险成功！你获得了一颗星星！"
    }
]

def collect_all_audios():
    """收集所有需要生成的音频列表"""
    audios = []

    # 固定文本
    audios.append(("audio/uranus/correct.mp3", "太棒了！回答正确！"))
    audios.append(("audio/uranus/final-badge.mp3", "恭喜智天！你完成了全部6个章节的天王星探险！你获得了天王星探险家大徽章！"))

    for ch in CHAPTERS:
        cid = ch["id"]
        prefix = f"audio/uranus/ch{cid}"

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

        # 数学挑战题目（3题）
        for k, m in enumerate(ch["math"]):
            if k == 0:
                audios.append((f"{prefix}-math.mp3", m["question"]))
                audios.append((f"{prefix}-math-hint.mp3", m["hint"]))
            else:
                audios.append((f"{prefix}-math-{k + 1}.mp3", m["question"]))
                audios.append((f"{prefix}-math-{k + 1}-hint.mp3", m["hint"]))

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
