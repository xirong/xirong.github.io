#!/usr/bin/env python3
"""
和谐号 G879 高铁模拟器 - 语音生成脚本
使用 Edge-TTS 生成高质量中文语音
路线：北京南 → 德州东 → 济南东
"""

import edge_tts
import asyncio
import os

VOICE = "zh-CN-XiaoxiaoNeural"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "audio", "train")

AUDIO_DATA = {
    'welcome': '欢迎乘坐G879次列车！本次列车由北京南开往济南东，沿途停靠德州东。请您拿好车票，准备上车！',
    'boarding': '旅客您好，G879次列车即将开车，请抓紧时间上车。',
    'depart': '各位旅客，列车出发了！请坐好扶稳，祝您旅途愉快！',
    'speed-200': '现在时速200公里！窗外的风景在飞速后退！',
    'speed-300': '哇，300公里每小时了！这就是高铁的速度！',
    'arriving-dezhou': '前方到站，德州东。请在德州东下车的旅客提前做好准备。',
    'dezhou-stop': '德州东站到了。请下车的旅客带好随身物品。',
    'dezhou-depart': '德州东站开车，下一站，济南东。',
    'arriving-jinan': '前方终点站，济南东。请全体旅客带好随身物品，准备下车。',
    'arrived': '济南东站到了！全程406公里，感谢您乘坐G879次列车！',
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
    print("开始生成语音文件...")
    for name, text in AUDIO_DATA.items():
        await generate_audio(name, text)
    print("完成！")


if __name__ == "__main__":
    asyncio.run(main())
