#!/usr/bin/env python3
"""
Edge-TTS 音频生成脚本
为 solar-system.html 生成每个天体的中英文+距离语音 MP3 文件
"""

import edge_tts
import asyncio
import os

# 语音配置
VOICE_CN = "zh-CN-XiaoxiaoNeural"  # 中文部分用小晓
VOICE_EN = "en-US-AriaNeural"       # 英文部分用 Aria

# 输出目录
OUTPUT_DIR = "audio/solar"

# ============ 天体数据：key, 中文名, 英文名, 距离描述 ============
CELESTIAL_BODIES = [
    ("sun",      "太阳",   "Sun",        "太阳系的中心恒星"),
    ("mercury",  "水星",   "Mercury",    "距离太阳0.4个天文单位"),
    ("venus",    "金星",   "Venus",      "距离太阳0.7个天文单位"),
    ("earth",    "地球",   "Earth",      "距离太阳1个天文单位"),
    ("moon",     "月球",   "Moon",       "地球的天然卫星"),
    ("mars",     "火星",   "Mars",       "距离太阳1.5个天文单位"),
    ("ceres",    "谷神星", "Ceres",      "距离太阳2.8个天文单位"),
    ("jupiter",  "木星",   "Jupiter",    "距离太阳5.2个天文单位"),
    ("saturn",   "土星",   "Saturn",     "距离太阳9.5个天文单位"),
    ("uranus",   "天王星", "Uranus",     "距离太阳19.2个天文单位"),
    ("neptune",  "海王星", "Neptune",    "距离太阳30个天文单位"),
    ("pluto",    "冥王星", "Pluto",      "距离太阳39.5个天文单位"),
]


async def generate_audio(path, text, voice, semaphore):
    """生成单个音频文件"""
    async with semaphore:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(path)
        print(f"✓ Generated: {path}")


async def main():
    """主函数：为每个天体生成完整语音（中文名 + 英文名 + 距离描述）"""
    audios = []

    for key, cn, en, dist_desc in CELESTIAL_BODIES:
        # 完整语音：中文名，英文名，距离描述
        # 全部用中文语音读（包含英文单词，小晓可以读英文）
        text = f"{cn}，{en}，{dist_desc}"
        path = f"{OUTPUT_DIR}/{key}.mp3"
        audios.append((path, text, VOICE_CN))

    print(f"准备生成 {len(audios)} 个音频文件...\n")

    # 使用信号量限制并发数
    semaphore = asyncio.Semaphore(5)

    tasks = [generate_audio(path, text, voice, semaphore)
             for path, text, voice in audios]
    await asyncio.gather(*tasks)

    print(f"\n✅ 完成！共生成 {len(audios)} 个音频文件到 {OUTPUT_DIR}/")


if __name__ == "__main__":
    asyncio.run(main())
