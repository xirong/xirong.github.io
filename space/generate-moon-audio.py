#!/usr/bin/env python3
"""
Edge-TTS 音频生成脚本 - 月球探险家
为 moon.html 生成所有需要的中文语音 MP3 文件
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
        "title": "月球引力",
        "stories": [
            "月球比地球小很多，它的引力只有地球的六分之一！",
            "在月球上，你能跳得比地球上高6倍！如果你在地球上跳1米，在月球上能跳6米高！",
            "宇航员在月球上走路像在蹦蹦跳跳，因为太轻了！"
        ],
        "hanzi": [
            {"char": "月", "pinyin": "yuè", "words": "月亮，月光", "sentence": "月亮悄悄爬上了树梢。"},
            {"char": "大", "pinyin": "dà", "words": "大小，大人", "sentence": "大象很大，小蚂蚁很小。"}
        ],
        "quiz_question": "在月球上跳高，能跳多高？",
        "quiz_hint": "月球引力是地球的六分之一哦！",
        "math_question": "宇航员在地球跳1米高，在月球跳了6米，高了几米？",
        "math_hint": "6减1等于几？",
        "complete": "太厉害了！第1章，月球引力，探险成功！你获得了一颗星星！"
    },
    {
        "id": 2,
        "title": "大碰撞诞生",
        "stories": [
            "很久很久以前，一个火星大小的星球撞上了地球！",
            "碰撞产生了好多好多碎片，飞到了太空中。",
            "这些碎片慢慢聚在一起，就变成了我们的月亮！这叫做大碰撞假说。"
        ],
        "hanzi": [
            {"char": "石", "pinyin": "shí", "words": "石头，岩石", "sentence": "河边有很多圆圆的石头。"},
            {"char": "星", "pinyin": "xīng", "words": "星星，星空", "sentence": "满天星星亮晶晶。"}
        ],
        "quiz_question": "月球是怎么形成的？",
        "quiz_hint": "想一想，一个大星球撞了地球后...",
        "math_question": "碰撞后飞出了5块大碎片和3块小碎片，一共几块？",
        "math_hint": "5加3等于几？",
        "complete": "太厉害了！第2章，大碰撞诞生，探险成功！你获得了一颗星星！"
    },
    {
        "id": 3,
        "title": "潮汐锁定",
        "stories": [
            "你知道吗？我们在地球上永远只能看到月球的一面！",
            "月球自转一圈的时间和绕地球一圈的时间一模一样，都是大约27天！",
            "这就叫潮汐锁定，就像月球被地球锁住了一样。另一面我们永远看不到！"
        ],
        "hanzi": [
            {"char": "天", "pinyin": "tiān", "words": "天空，蓝天", "sentence": "蓝色的天空让人心情愉快。"},
            {"char": "地", "pinyin": "dì", "words": "大地，地球", "sentence": "大地上长满了绿草和鲜花。"}
        ],
        "quiz_question": "我们能看到月球的几面？",
        "quiz_hint": "月球被地球锁住了...",
        "math_question": "智天连续看了3个晚上的月亮，又看了4个晚上，一共看了几个晚上？",
        "math_hint": "3加4等于几？",
        "complete": "太厉害了！第3章，潮汐锁定，探险成功！你获得了一颗星星！"
    },
    {
        "id": 4,
        "title": "登月英雄",
        "stories": [
            "1969年，美国的阿波罗11号飞船载着3位宇航员飞向月球！",
            "阿姆斯特朗第一个踏上月球，他说：这是个人的一小步，却是人类的一大步！",
            "宇航员在月球上插了一面旗，留下了脚印。因为没有风，脚印到现在还在呢！"
        ],
        "hanzi": [
            {"char": "人", "pinyin": "rén", "words": "大人，人们", "sentence": "小朋友长大变成大人。"},
            {"char": "飞", "pinyin": "fēi", "words": "飞机，飞船", "sentence": "小鸟展开翅膀飞上蓝天。"}
        ],
        "quiz_question": "第一个登上月球的人是谁？",
        "quiz_hint": "他说了一句很有名的话...",
        "math_question": "阿波罗11号有3名宇航员，加上阿波罗12号的3名，一共几名？",
        "math_hint": "3加3等于几？",
        "complete": "太厉害了！第4章，登月英雄，探险成功！你获得了一颗星星！"
    },
    {
        "id": 5,
        "title": "月球表面",
        "stories": [
            "月球表面有很多大坑，叫做陨石坑，是小行星撞出来的！",
            "月球上有一些暗色的大块区域，古人以为是海，所以叫月海。其实那里没有水，是很久以前岩浆冷却后的平原。",
            "最大的陨石坑叫南极艾特肯盆地，直径有2500公里，比中国一半还大！"
        ],
        "hanzi": [
            {"char": "山", "pinyin": "shān", "words": "高山，山峰", "sentence": "高高的山像巨人站着。"},
            {"char": "土", "pinyin": "tǔ", "words": "泥土，土地", "sentence": "泥土里长出了小苗。"}
        ],
        "quiz_question": "月球上的大坑是怎么来的？",
        "quiz_hint": "月球上没有空气也没有风哦...",
        "math_question": "月球上有2个大陨石坑和5个小陨石坑，一共几个？",
        "math_hint": "2加5等于几？",
        "complete": "太厉害了！第5章，月球表面，探险成功！你获得了一颗星星！"
    },
    {
        "id": 6,
        "title": "没有空气",
        "stories": [
            "月球上没有空气！所以在月球上，声音传不出去，不管你怎么喊，旁边的人都听不到！",
            "白天月球表面温度可以到127度，比开水还烫！晚上降到零下173度，比北极还冷一百倍！",
            "所以宇航员要穿特殊的太空服，里面有氧气、有水、还有调温系统，像穿着一个小房子！"
        ],
        "hanzi": [
            {"char": "风", "pinyin": "fēng", "words": "大风，风车", "sentence": "大风把树叶吹得沙沙响。"},
            {"char": "空", "pinyin": "kōng", "words": "天空，太空", "sentence": "天空中飘着白白的云朵。"}
        ],
        "quiz_question": "在月球上能听到声音吗？",
        "quiz_hint": "声音需要空气来传播...",
        "math_question": "太空服有头盔、手套、靴子、背包和连体衣，一共几个部件？",
        "math_hint": "数一数：头盔1加手套1加靴子1加背包1加连体衣1",
        "complete": "太厉害了！第6章，没有空气，探险成功！你获得了一颗星星！"
    }
]

def collect_all_audios():
    """收集所有需要生成的音频列表"""
    audios = []

    # 固定文本
    audios.append(("audio/moon/correct.mp3", "太棒了！回答正确！"))
    audios.append(("audio/moon/final-badge.mp3", "恭喜智天！你完成了全部6个章节的月球探险！你获得了月球探险家大徽章！"))

    for ch in CHAPTERS:
        cid = ch["id"]
        prefix = f"audio/moon/ch{cid}"

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
