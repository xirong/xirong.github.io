#!/usr/bin/env python3
"""
复兴号 G746 高铁模拟器 - 语音生成脚本
使用 Edge-TTS 生成高质量中文语音
路线：德州东 → 廊坊 → 北京南（回程）
"""

import edge_tts
import asyncio
import os

VOICE = "zh-CN-XiaoxiaoNeural"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "audio", "train-g746")

AUDIO_DATA = {
    'welcome': '欢迎乘坐G746次复兴号列车！本次列车由德州东开往北京南，沿途停靠廊坊。一等座16车10F号，祝您旅途愉快！',
    'boarding': '旅客您好，G746次列车即将开车，请抓紧时间上车。',
    'depart': '各位旅客，列车出发了！请坐好扶稳，祝您旅途愉快！',
    'speed-200': '现在时速200公里！窗外的风景在飞速后退！',
    'speed-300': '哇，300公里每小时了！复兴号真快！',
    'speed-350': '350公里每小时！这就是复兴号的最高速度！',
    'arriving-langfang': '前方到站，廊坊。请在廊坊下车的旅客提前做好准备。',
    'langfang-stop': '廊坊站到了。请下车的旅客带好随身物品。',
    'langfang-depart': '廊坊站开车，下一站，终点站北京南。',
    'arriving-beijing': '前方终点站，北京南。请全体旅客带好随身物品，准备下车。',
    'arrived': '北京南站到了！全程315公里，感谢您乘坐G746次复兴号列车！',
}


async def generate_audio(name, text):
    path = os.path.join(OUTPUT_DIR, f"{name}.mp3")
    if os.path.exists(path):
        print(f"  跳过（已存在）: {path}")
        return
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(path)
    print(f"  生成: {path}")


async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("开始生成 G746 复兴号语音文件...")
    for name, text in AUDIO_DATA.items():
        await generate_audio(name, text)
    print("完成！")


if __name__ == "__main__":
    asyncio.run(main())
