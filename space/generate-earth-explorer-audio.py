#!/usr/bin/env python3
"""
Edge-TTS 音频生成脚本 - 地球探险家
为 earth-explorer.html 生成所有需要的中文语音 MP3 文件
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
        "title": "我们的家园",
        "stories": [
            "地球是我们的家，所有人、动物、花草都住在上面！",
            "地球看起来像一个大球，但不是完美的圆球，而是稍微有点扁的！",
            "从太空看地球，蓝色的是海洋，绿色和棕色的是陆地，白色的是云。"
        ],
        "hanzi": [
            {"char": "地", "pinyin": "dì", "words": "大地，地球", "sentence": "我们住在大地上。"},
            {"char": "球", "pinyin": "qiú", "words": "地球，皮球", "sentence": "地球是一个大球。"},
            {"char": "家", "pinyin": "jiā", "words": "家人，回家", "sentence": "地球是我们的家。"}
        ],
        "quiz_question": "地球是什么形状的？",
        "quiz_hint": "从太空看地球，像一个圆圆的球！",
        "math": [
            {"question": "地球上有3片大海和2块大陆地，一共几个？", "hint": "3加2等于几？"},
            {"question": "天上有7朵白云，飘走了3朵，还剩几朵？", "hint": "7减3等于几？"},
            {"question": "比一比，3和2，哪个大？", "hint": "3比2大！地球上海洋比陆地多！"}
        ],
        "complete": "太厉害了！第1章，我们的家园，探险成功！你获得了一颗星星！"
    },
    {
        "id": 2,
        "title": "转啊转",
        "stories": [
            "地球像陀螺一样，不停地转圈圈，这叫自转！",
            "地球转一圈需要1天，也就是24小时！",
            "朝着太阳的一面是白天，背着太阳的一面是黑夜。所以白天和黑夜会交替出现！"
        ],
        "hanzi": [
            {"char": "日", "pinyin": "rì", "words": "日出，生日", "sentence": "太阳从东方升起来了。"},
            {"char": "月", "pinyin": "yuè", "words": "月亮，月饼", "sentence": "月亮弯弯像小船。"},
            {"char": "天", "pinyin": "tiān", "words": "天空，白天", "sentence": "天上有白白的云。"}
        ],
        "quiz_question": "为什么会有白天和黑夜？",
        "quiz_hint": "地球像陀螺一样转，朝着太阳就是白天！",
        "math": [
            {"question": "白天有5只小鸟飞来了，又飞来了3只，一共有几只？", "hint": "5加3等于几？"},
            {"question": "地球转一圈是1天，转了2圈就是几天？", "hint": "1加1等于几？"},
            {"question": "比一比，5和3，哪个大？", "hint": "5比3大！白天比黑夜的小鸟多！"}
        ],
        "complete": "太厉害了！第2章，转啊转，探险成功！你获得了一颗星星！"
    },
    {
        "id": 3,
        "title": "蓝色星球",
        "stories": [
            "地球表面大部分都是水！海洋占了十分之七！",
            "水会变魔术：太阳一晒变成水蒸气飞到天上，遇冷变成小水滴组成云！",
            "云越来越重就会下雨，雨水流入河里、流入大海，再被太阳晒……不停地循环！"
        ],
        "hanzi": [
            {"char": "水", "pinyin": "shuǐ", "words": "水杯，河水", "sentence": "清清的河水哗哗流。"},
            {"char": "雨", "pinyin": "yǔ", "words": "下雨，雨伞", "sentence": "下雨了要打雨伞。"},
            {"char": "海", "pinyin": "hǎi", "words": "大海，海洋", "sentence": "大海又大又蓝。"}
        ],
        "quiz_question": "地球为什么叫蓝色星球？",
        "quiz_hint": "地球表面十分之七都是水，海洋是蓝色的！",
        "math": [
            {"question": "天上有4朵云，又飘来了4朵，一共几朵？", "hint": "4加4等于几？"},
            {"question": "池塘里有9条小鱼，游走了3条，还剩几条？", "hint": "9减3等于几？"},
            {"question": "比一比，7和3，哪个大？", "hint": "7比3大！海洋占了7份，陆地只有3份！"}
        ],
        "complete": "太厉害了！第3章，蓝色星球，探险成功！你获得了一颗星星！"
    },
    {
        "id": 4,
        "title": "空气外衣",
        "stories": [
            "地球外面包了一层大气层，就像一件看不见的外衣！",
            "大气层里有我们呼吸的空气，没有空气，人和动物都不能活！",
            "阳光穿过大气层时，蓝色的光被散射开来，所以天空看起来是蓝色的！太阳落山时光走得更远，变成红色和橙色，就是美丽的晚霞！"
        ],
        "hanzi": [
            {"char": "风", "pinyin": "fēng", "words": "大风，风车", "sentence": "风吹树叶沙沙响。"},
            {"char": "云", "pinyin": "yún", "words": "白云，乌云", "sentence": "白云在天上飘来飘去。"},
            {"char": "气", "pinyin": "qì", "words": "空气，天气", "sentence": "空气看不见摸不着。"}
        ],
        "quiz_question": "天空为什么是蓝色的？",
        "quiz_hint": "阳光穿过大气层，蓝色光被撒开来了！",
        "math": [
            {"question": "天上有6朵白云和2朵乌云，一共几朵？", "hint": "6加2等于几？"},
            {"question": "刮风了，8片树叶掉了5片，树上还有几片？", "hint": "8减5等于几？"},
            {"question": "比一比，6和2，哪个大？", "hint": "6比2大！白云比乌云多！"}
        ],
        "complete": "太厉害了！第4章，空气外衣，探险成功！你获得了一颗星星！"
    },
    {
        "id": 5,
        "title": "四季变化",
        "stories": [
            "地球还会绕着太阳转圈圈，转一圈就是1年！",
            "地球是歪着转的，所以太阳照射的地方会变化，就有了春夏秋冬！",
            "春天花开了，夏天好热呀，秋天叶子黄了，冬天下雪啦！四季就这样轮流来！"
        ],
        "hanzi": [
            {"char": "春", "pinyin": "chūn", "words": "春天，春风", "sentence": "春天到了花开了。"},
            {"char": "冬", "pinyin": "dōng", "words": "冬天，冬瓜", "sentence": "冬天下雪真好玩。"},
            {"char": "花", "pinyin": "huā", "words": "花朵，开花", "sentence": "花园里花儿真美。"}
        ],
        "quiz_question": "为什么会有四季变化？",
        "quiz_hint": "地球歪着身子绕太阳转，阳光照射角度不同就有四季！",
        "math": [
            {"question": "春天开了4朵红花和3朵黄花，一共几朵？", "hint": "4加3等于几？"},
            {"question": "秋天树上有10个苹果，摘了4个，还有几个？", "hint": "10减4等于几？"},
            {"question": "比一比，4和4，哪个大？", "hint": "4等于4！一年四季一样多！"}
        ],
        "complete": "太厉害了！第5章，四季变化，探险成功！你获得了一颗星星！"
    },
    {
        "id": 6,
        "title": "生命的摇篮",
        "stories": [
            "地球是我们目前知道的唯一有生命的星球！",
            "地球上有空气可以呼吸，有水可以喝，温度刚刚好，不太热也不太冷！",
            "所以地球上有大树、小草、小动物和我们！我们要爱护地球，保护我们的家园！"
        ],
        "hanzi": [
            {"char": "树", "pinyin": "shù", "words": "大树，树叶", "sentence": "大树上住着小鸟。"},
            {"char": "草", "pinyin": "cǎo", "words": "小草，草地", "sentence": "草地上绿油油的。"},
            {"char": "鸟", "pinyin": "niǎo", "words": "小鸟，鸟窝", "sentence": "小鸟在天上飞。"}
        ],
        "quiz_question": "为什么地球上有生命？",
        "quiz_hint": "地球有空气、有水、温度也不太冷不太热！",
        "math": [
            {"question": "草地上有5只兔子和4只松鼠，一共几只小动物？", "hint": "5加4等于几？"},
            {"question": "树上有6只小鸟，飞走了2只，还有几只？", "hint": "6减2等于几？"},
            {"question": "比一比，5和4，哪个大？", "hint": "5比4大！兔子比松鼠多1只！"}
        ],
        "complete": "太厉害了！第6章，生命的摇篮，探险成功！你获得了一颗星星！"
    }
]

def collect_all_audios():
    """收集所有需要生成的音频列表"""
    audios = []

    # 固定文本
    audios.append(("audio/earth-explorer/correct.mp3", "太棒了！回答正确！"))
    audios.append(("audio/earth-explorer/final-badge.mp3", "恭喜智天！你完成了全部6个章节的地球探险！你获得了地球探险家大徽章！"))

    for ch in CHAPTERS:
        cid = ch["id"]
        prefix = f"audio/earth-explorer/ch{cid}"

        # 科普故事（每条）
        for i, story in enumerate(ch["stories"], 1):
            audios.append((f"{prefix}-story-{i}.mp3", story))

        # 汉字学习（每个汉字3个）
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
