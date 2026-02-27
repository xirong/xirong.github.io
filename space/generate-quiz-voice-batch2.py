#!/usr/bin/env python3
"""
为5个星球探险家(jupiter, saturn, neptune, earth-explorer, uranus)的知识测验
生成 TTS 音频：每章的完整题目+选项朗读，以及每个选项的单独朗读。

使用 edge-tts，语音 zh-CN-XiaoxiaoNeural

输出文件：
  - ch{N}-quiz.mp3    — 完整朗读：题目 + A/B/C 选项 + "选一选吧！"（替换旧文件）
  - ch{N}-quiz-a.mp3  — "A，选项1"
  - ch{N}-quiz-b.mp3  — "B，选项2"
  - ch{N}-quiz-c.mp3  — "C，选项3"
"""

import edge_tts
import asyncio
import os

VOICE = "zh-CN-XiaoxiaoNeural"

# ============ 5个探险家的 quiz 数据 ============

quiz_data = {
    "jupiter": [
        {
            "id": 1,
            "question": "太阳系最大的行星是？",
            "options": ["木星", "土星", "地球"]
        },
        {
            "id": 2,
            "question": "木星的表面是什么？",
            "options": ["岩石", "海洋", "没有固体表面，全是气体"]
        },
        {
            "id": 3,
            "question": "木星的大红斑是什么？",
            "options": ["一座火山", "一个超级大风暴", "一片海洋"]
        },
        {
            "id": 4,
            "question": "木星最有名的四颗卫星叫什么？",
            "options": ["伽利略卫星", "阿波罗卫星", "哈勃卫星"]
        },
        {
            "id": 5,
            "question": "木星的环是由什么组成的？",
            "options": ["冰块", "岩石", "尘埃"]
        },
        {
            "id": 6,
            "question": "木星被叫做什么？",
            "options": ["宇宙灯塔", "宇宙吸尘器", "宇宙磁铁"]
        }
    ],
    "saturn": [
        {
            "id": 1,
            "question": "土星环是由什么组成的？",
            "options": ["冰块和岩石", "彩虹", "云朵"]
        },
        {
            "id": 2,
            "question": "把土星放进水里会怎样？",
            "options": ["沉到底", "溶化掉", "浮在水面上"]
        },
        {
            "id": 3,
            "question": "土星两极的旋风是什么形状？",
            "options": ["圆形", "六边形", "三角形"]
        },
        {
            "id": 4,
            "question": "土卫六上的湖泊是什么做的？",
            "options": ["液态甲烷", "水", "岩浆"]
        },
        {
            "id": 5,
            "question": "土卫二有什么特别之处？",
            "options": ["有火山", "有森林", "会喷冰的喷泉"]
        },
        {
            "id": 6,
            "question": "卡西尼号最后怎么了？",
            "options": ["飞回了地球", "冲进了土星大气层", "飞到了其他星球"]
        }
    ],
    "neptune": [
        {
            "id": 1,
            "question": "太阳系中离太阳最远的行星是？",
            "options": ["海王星", "天王星", "土星"]
        },
        {
            "id": 2,
            "question": "海王星为什么是蓝色的？",
            "options": ["因为有很多水", "因为很冷", "大气中的甲烷吸收了红光"]
        },
        {
            "id": 3,
            "question": "海王星上发现的巨大风暴叫什么？",
            "options": ["大红斑", "大黑斑", "大蓝斑"]
        },
        {
            "id": 4,
            "question": "海卫一为什么特别？",
            "options": ["它是倒着绕海王星转的", "它有大气层", "它会发光"]
        },
        {
            "id": 5,
            "question": "海王星深处可能下什么雨？",
            "options": ["水雨", "铁雨", "钻石雨"]
        },
        {
            "id": 6,
            "question": "海王星是怎么被发现的？",
            "options": ["碰巧看到的", "用数学计算出位置再找到的", "宇航员飞过去的"]
        }
    ],
    "earth-explorer": [
        {
            "id": 1,
            "question": "地球是什么形状的？",
            "options": ["像一个大球", "像一块大饼", "像一个正方形"]
        },
        {
            "id": 2,
            "question": "为什么会有白天和黑夜？",
            "options": ["太阳会关灯", "地球在转圈", "云把太阳挡住了"]
        },
        {
            "id": 3,
            "question": "地球为什么叫蓝色星球？",
            "options": ["涂了蓝色油漆", "因为大部分是海洋", "天空是蓝色的"]
        },
        {
            "id": 4,
            "question": "天空为什么是蓝色的？",
            "options": ["天空涂了蓝色", "海水映上去的", "阳光中蓝色光被散射了"]
        },
        {
            "id": 5,
            "question": "为什么会有四季变化？",
            "options": ["太阳变大变小", "地球歪着绕太阳转", "风吹来吹去"]
        },
        {
            "id": 6,
            "question": "为什么地球上有生命？",
            "options": ["有空气、有水、温度合适", "地球最大", "地球离太阳最近"]
        }
    ],
    "uranus": [
        {
            "id": 1,
            "question": "天王星为什么是横着转的？",
            "options": ["被大天体撞歪了", "本来就这样", "太阳吹歪的"]
        },
        {
            "id": 2,
            "question": "天王星为什么看起来是青蓝色的？",
            "options": ["因为有很多海洋", "因为大气中的甲烷吸收红光", "因为太阳照的"]
        },
        {
            "id": 3,
            "question": "天王星有几道光环？",
            "options": ["7道", "13道", "100道"]
        },
        {
            "id": 4,
            "question": "天王星的卫星是以什么命名的？",
            "options": ["科学家的名字", "文学作品人物", "数字编号"]
        },
        {
            "id": 5,
            "question": "天王星绕太阳一圈要多少年？",
            "options": ["42年", "84年", "100年"]
        },
        {
            "id": 6,
            "question": "天王星是怎么被发现的？",
            "options": ["肉眼看到的", "飞船发现的", "用望远镜发现的"]
        }
    ]
}

LABELS = ["A", "B", "C"]


async def generate_audio(path, text):
    """生成单个 MP3 文件"""
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(path)
    print(f"  ✓ {os.path.basename(path)}")


async def generate_planet_audios(planet, chapters):
    """为一个探险家生成所有 quiz 音频"""
    audio_dir = f"audio/{planet}"
    os.makedirs(audio_dir, exist_ok=True)

    print(f"\n{'='*50}")
    print(f"生成 {planet} 的 quiz 音频...")
    print(f"{'='*50}")

    for ch in chapters:
        ch_id = ch["id"]
        question = ch["question"]
        options = ch["options"]

        # 1. 完整的 quiz 音频（题目 + 所有选项 + 提示语）
        full_text = question + "。"
        for i, opt in enumerate(options):
            full_text += f"{LABELS[i]}，{opt}。"
        full_text += "选一选吧！"

        await generate_audio(f"{audio_dir}/ch{ch_id}-quiz.mp3", full_text)

        # 2. 每个选项的单独音频
        for i, opt in enumerate(options):
            label = LABELS[i].lower()
            opt_text = f"{LABELS[i]}，{opt}"
            await generate_audio(f"{audio_dir}/ch{ch_id}-quiz-{label}.mp3", opt_text)


async def main():
    print("=" * 60)
    print("星球探险家 Quiz 语音生成（batch2: jupiter/saturn/neptune/earth-explorer/uranus）")
    print("=" * 60)

    total_files = 0
    for planet, chapters in quiz_data.items():
        await generate_planet_audios(planet, chapters)
        total_files += len(chapters) * 4  # 每章 4 个文件

    print(f"\n{'='*60}")
    print(f"全部完成！共生成 {total_files} 个音频文件。")
    print(f"{'='*60}")


if __name__ == "__main__":
    asyncio.run(main())
