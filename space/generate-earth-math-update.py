#!/usr/bin/env python3
"""
Edge-TTS 音频生成脚本 - 地球探险家数学题更新
重新生成第3题（比大小→加减法）+ 新增第4题（连续加减法）的 MP3
"""

import edge_tts
import asyncio
import os

VOICE = "zh-CN-XiaoxiaoNeural"

# 每章需要更新的音频：第3题（math-3）和第4题（math-4）
MATH_UPDATES = [
    {
        "id": 1,
        "q3": "地球上有3片海洋，又发现了2片，一共有几片？",
        "q3_hint": "3加2等于5",
        "q4": "地球上有8朵云，飘走了3朵，又飘来了2朵，现在有几朵？",
        "q4_hint": "先算8减3等于5，再算5加2等于7",
    },
    {
        "id": 2,
        "q3": "白天有5只小鸟在唱歌，飞来了3只，一共几只？",
        "q3_hint": "5加3等于8",
        "q4": "树上有9只小鸟，飞走了4只，又飞来了2只，现在有几只？",
        "q4_hint": "先算9减4等于5，再算5加2等于7",
    },
    {
        "id": 3,
        "q3": "池塘里有7条鱼和3只虾，一共有几只小动物？",
        "q3_hint": "7加3等于10",
        "q4": "池塘有10条鱼，游走了6条，又游来了3条，现在有几条？",
        "q4_hint": "先算10减6等于4，再算4加3等于7",
    },
    {
        "id": 4,
        "q3": "天空中有6朵白云和2朵乌云，一共有几朵云？",
        "q3_hint": "6加2等于8",
        "q4": "天上有10朵云，散开了5朵，又飘来了3朵，现在有几朵？",
        "q4_hint": "先算10减5等于5，再算5加3等于8",
    },
    {
        "id": 5,
        "q3": "春天开了4朵花，秋天落了2朵，还剩几朵？",
        "q3_hint": "4减2等于2",
        "q4": "花园有8朵花，摘了3朵送妈妈，又开了4朵，现在有几朵？",
        "q4_hint": "先算8减3等于5，再算5加4等于9",
    },
    {
        "id": 6,
        "q3": "森林里有5只兔子和4只松鼠，一共有几只小动物？",
        "q3_hint": "5加4等于9",
        "q4": "草地上有7只兔子，跑走了3只，又来了5只，现在有几只？",
        "q4_hint": "先算7减3等于4，再算4加5等于9",
    },
]


def collect_audios():
    audios = []
    for ch in MATH_UPDATES:
        cid = ch["id"]
        prefix = f"audio/earth-explorer/ch{cid}"
        # 第3题（覆盖旧的比大小音频）
        audios.append((f"{prefix}-math-3.mp3", ch["q3"]))
        audios.append((f"{prefix}-math-3-hint.mp3", ch["q3_hint"]))
        # 第4题（新增）
        audios.append((f"{prefix}-math-4.mp3", ch["q4"]))
        audios.append((f"{prefix}-math-4-hint.mp3", ch["q4_hint"]))
    return audios


async def generate_audio(path, text, semaphore):
    async with semaphore:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        communicate = edge_tts.Communicate(text, VOICE)
        await communicate.save(path)
        print(f"✓ {path}")


async def main():
    audios = collect_audios()
    print(f"需要生成 {len(audios)} 个音频文件\n")
    semaphore = asyncio.Semaphore(5)
    tasks = [generate_audio(path, text, semaphore) for path, text in audios]
    await asyncio.gather(*tasks)
    print(f"\n全部完成！共生成 {len(audios)} 个文件")


if __name__ == "__main__":
    asyncio.run(main())
