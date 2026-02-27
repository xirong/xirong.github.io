#!/usr/bin/env python3
"""
为 moon, sun, mercury, venus, mars 五个星球探险家的知识测验生成 TTS 音频。
每章生成4个文件：
  - ch{N}-quiz.mp3     完整朗读：题目 + A/B/C 选项 + "选一选吧！"
  - ch{N}-quiz-a.mp3   "A，选项1"
  - ch{N}-quiz-b.mp3   "B，选项2"
  - ch{N}-quiz-c.mp3   "C，选项3"

语音：zh-CN-XiaoxiaoNeural（小晓）
"""

import edge_tts
import asyncio
import os

VOICE = "zh-CN-XiaoxiaoNeural"

# ============ 月球探险家 quiz 数据 ============
moon_quizzes = [
    {
        "id": 1,
        "question": "在月球上跳高，能跳多高？",
        "options": ["比地球上高6倍", "跟地球上一样", "跳不起来"]
    },
    {
        "id": 2,
        "question": "月球是怎么形成的？",
        "options": ["太阳变出来的", "一直就在那里", "大碰撞产生的碎片聚成的"]
    },
    {
        "id": 3,
        "question": "我们能看到月球的几面？",
        "options": ["两面都能看到", "永远只能看到一面", "看不到月球"]
    },
    {
        "id": 4,
        "question": "第一个登上月球的人是谁？",
        "options": ["阿姆斯特朗", "杨利伟", "爱因斯坦"]
    },
    {
        "id": 5,
        "question": "月球上的大坑是怎么来的？",
        "options": ["人挖的", "风吹出来的", "小行星撞出来的"]
    },
    {
        "id": 6,
        "question": "在月球上能听到声音吗？",
        "options": ["能听到", "听不到，因为没有空气", "只能听到一点点"]
    },
]

# ============ 太阳探险家 quiz 数据 ============
sun_quizzes = [
    {
        "id": 1,
        "question": "太阳能装下多少个地球？",
        "options": ["130万个", "100个", "1万个"]
    },
    {
        "id": 2,
        "question": "太阳发光是因为？",
        "options": ["在烧木头", "通了电", "核聚变"]
    },
    {
        "id": 3,
        "question": "太阳表面大约多少度？",
        "options": ["100度", "5500度", "1万度"]
    },
    {
        "id": 4,
        "question": "太阳黑子看起来黑是因为？",
        "options": ["比周围温度低显得暗", "被墨水染的", "是洞"]
    },
    {
        "id": 5,
        "question": "没有太阳，地球会怎样？",
        "options": ["会更热", "没变化", "变成冰球"]
    },
    {
        "id": 6,
        "question": "太阳最后会变成什么？",
        "options": ["黑洞", "白矮星", "消失不见"]
    },
]

# ============ 水星探险家 quiz 数据 ============
mercury_quizzes = [
    {
        "id": 1,
        "question": "离太阳最近的行星是？",
        "options": ["水星", "金星", "地球"]
    },
    {
        "id": 2,
        "question": "水星温差大是因为？",
        "options": ["离太阳太远", "有水", "几乎没有大气层"]
    },
    {
        "id": 3,
        "question": "水星的表面和什么很像？",
        "options": ["地球", "月球", "木星"]
    },
    {
        "id": 4,
        "question": "水星的一天和一年比，哪个长？",
        "options": ["一天比一年长", "一年比一天长", "一样长"]
    },
    {
        "id": 5,
        "question": "水星有几颗卫星？",
        "options": ["1颗", "2颗", "0颗，没有卫星"]
    },
    {
        "id": 6,
        "question": "第一个围绕水星飞行的探测器叫？",
        "options": ["好奇号", "信使号", "旅行者号"]
    },
]

# ============ 金星探险家 quiz 数据 ============
venus_quizzes = [
    {
        "id": 1,
        "question": "金星被叫做地球的什么？",
        "options": ["姐妹星", "兄弟星", "邻居星"]
    },
    {
        "id": 2,
        "question": "金星表面看不到是因为？",
        "options": ["太远了", "太暗了", "被厚厚的云层包裹着"]
    },
    {
        "id": 3,
        "question": "太阳系最热的行星是？",
        "options": ["水星", "金星", "火星"]
    },
    {
        "id": 4,
        "question": "金星上太阳从哪边升起？",
        "options": ["西边", "东边", "北边"]
    },
    {
        "id": 5,
        "question": "科学家用什么看到金星表面的？",
        "options": ["望远镜", "照相机", "雷达"]
    },
    {
        "id": 6,
        "question": "探测器在金星上坚持不久是因为？",
        "options": ["没有电", "太热了被烤坏", "被风吹走了"]
    },
]

# ============ 火星探险家 quiz 数据 ============
mars_quizzes = [
    {
        "id": 1,
        "question": "火星为什么是红色的？",
        "options": ["表面有氧化铁（铁锈）", "被太阳晒红了", "涂了红色油漆"]
    },
    {
        "id": 2,
        "question": "太阳系最高的山在哪里？",
        "options": ["地球", "月球", "火星"]
    },
    {
        "id": 3,
        "question": "火星上经常发生什么？",
        "options": ["下大雨", "沙尘暴", "下大雪"]
    },
    {
        "id": 4,
        "question": "火星的极地有什么？",
        "options": ["冰盖", "大海", "森林"]
    },
    {
        "id": 5,
        "question": "中国的火星车叫什么名字？",
        "options": ["嫦娥号", "天宫号", "祝融号"]
    },
    {
        "id": 6,
        "question": "火星有几个卫星？",
        "options": ["1个", "2个", "没有"]
    },
]

# ============ 所有星球汇总 ============
all_planets = {
    "moon": moon_quizzes,
    "sun": sun_quizzes,
    "mercury": mercury_quizzes,
    "venus": venus_quizzes,
    "mars": mars_quizzes,
}


async def generate_audio(path, text):
    """生成单个 MP3 文件"""
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(path)


async def main():
    labels = ["A", "B", "C"]
    total_files = 0

    for planet, quizzes in all_planets.items():
        audio_dir = f"audio/{planet}"
        os.makedirs(audio_dir, exist_ok=True)

        for quiz in quizzes:
            ch_id = quiz["id"]
            question = quiz["question"]
            options = quiz["options"]

            # 1. 完整 quiz 音频：题目 + A/B/C + "选一选吧！"
            full_text = question + "。" + "。".join(
                [f"{labels[i]}，{options[i]}" for i in range(len(options))]
            ) + "。选一选吧！"
            quiz_path = f"{audio_dir}/ch{ch_id}-quiz.mp3"
            print(f"[{planet}] 生成 {quiz_path}")
            await generate_audio(quiz_path, full_text)
            total_files += 1

            # 2. 各选项独立音频
            for i, opt in enumerate(options):
                opt_label = labels[i].lower()  # a, b, c
                opt_text = f"{labels[i]}，{opt}"
                opt_path = f"{audio_dir}/ch{ch_id}-quiz-{opt_label}.mp3"
                print(f"[{planet}] 生成 {opt_path}")
                await generate_audio(opt_path, opt_text)
                total_files += 1

    print(f"\n✅ 完成！共生成 {total_files} 个音频文件")


if __name__ == "__main__":
    asyncio.run(main())
