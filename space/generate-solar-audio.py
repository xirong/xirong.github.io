#!/usr/bin/env python3
"""
Edge-TTS 音频生成脚本
为 solar-system.html 生成每个天体的周期说明语音 MP3 文件
"""

import edge_tts
import asyncio
import os

# 语音配置
VOICE_CN = "zh-CN-XiaoxiaoNeural"  # 中文部分用小晓

# 输出目录
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "audio", "solar")

# ============ 天体语音文案 ============
CELESTIAL_AUDIO_TEXTS = {
    "sun": "太阳，Sun，太阳系的中心恒星。自转转完一整圈，约等于25.4个地球天。",
    "mercury": "水星，Mercury，距离太阳0.4个天文单位。自转转完一整圈，约等于58.6个地球天。绕太阳公转一整圈，约等于0.24个地球年。",
    "venus": "金星，Venus，距离太阳0.7个天文单位。自转转完一整圈，约等于243个地球天。绕太阳公转一整圈，约等于0.62个地球年。",
    "earth": "地球，Earth，距离太阳1个天文单位。自转转完一整圈，约等于1个地球天。绕太阳公转一整圈，约等于1个地球年。",
    "moon": "月球，Moon，地球的天然卫星。自转转完一整圈，约等于27.3个地球天。绕地球公转一整圈，约等于27.3个地球天。",
    "mars": "火星，Mars，距离太阳1.5个天文单位。自转转完一整圈，约等于1.03个地球天。绕太阳公转一整圈，约等于1.88个地球年。",
    "io": "木卫一，Io，太阳系里火山活动最活跃的卫星。它的表面有很多活火山，经常会喷出岩浆和硫磺，所以看起来是黄色、橙色、红色。它不是一颗安静的月亮，而像一个一直在冒火的小火球。",
    "europa": "木卫二，Europa，木星的一颗冰壳卫星，表面覆盖着厚厚的冰，冰下面可能有一片很深的地下海洋。科学家认为，那里可能有适合生命存在的环境，所以木卫二是太阳系里最值得探索的卫星之一。",
    "ganymede": "木卫三，Ganymede，太阳系最大的卫星，比水星还大，它的外面像冰壳，里面可能有一片看不见的大海，木卫三有自己的磁场，像是自己的保护罩。",
    "titan": "土卫六，Titan，土星最大的卫星之一，拥有浓厚氮气大气层，表面有甲烷湖和雾色地形，常被拿来讨论原始化学与类地球环境。",
    "enceladus": "土卫二，Enceladus，土星内部热活动很活跃，南极有冰裂隙“虎纹”，会喷出冰尘和水蒸气羽流，常被当成‘探测生命线索的优先目标’。",
    "rhea": "土卫五，Rhea，土星的一颗大型冰质卫星，表面反光性高，布满陨石坑和断裂带，保留了很久的撞击历史。",
    "phobos": "火卫一，Phobos，火星最近的一颗小卫星，形状不规则、表面坑坑洼洼，离火星很近，每天需要绕行多圈。",
    "deimos": "火卫二，Deimos，火星的外侧卫星，体积更小更暗，轨道更远更平稳，像颗安静的伴星。",
    "triton": "海卫一，Triton，海王星最大的卫星，公转方向是逆行的，说明它可能是后期俘获天体，表面有年轻地质活动迹象。",
    "titania": "天卫一，Titania，天王星系统较大的卫星，表面有明暗交错地形与巨大断裂谷，反映复杂的内部演化历史。",
    "ceres": "谷神星，Ceres，距离太阳2.8个天文单位。自转转完一整圈，约等于0.38个地球天。绕太阳公转一整圈，约等于4.6个地球年。",
    "jupiter": "木星，Jupiter，距离太阳5.2个天文单位。自转转完一整圈，约等于0.41个地球天。绕太阳公转一整圈，约等于11.86个地球年。",
    "saturn": "土星，Saturn，距离太阳9.5个天文单位。自转转完一整圈，约等于0.45个地球天。绕太阳公转一整圈，约等于29.46个地球年。",
    "uranus": "天王星，Uranus，距离太阳19.2个天文单位。自转转完一整圈，约等于0.72个地球天。绕太阳公转一整圈，约等于84个地球年。",
    "neptune": "海王星，Neptune，距离太阳30个天文单位。自转转完一整圈，约等于0.67个地球天。绕太阳公转一整圈，约等于164.8个地球年。",
    "pluto": "冥王星，Pluto，距离太阳39.5个天文单位。自转转完一整圈，约等于6.4个地球天。绕太阳公转一整圈，约等于247.94个地球年。",
    "haumea": "妊神星，Haumea，距离太阳43.1个天文单位。自转转完一整圈，约等于0.16个地球天。绕太阳公转一整圈，约等于285个地球年。",
    "makemake": "鸟神星，Makemake，距离太阳45.8个天文单位。自转转完一整圈，约等于0.94个地球天。绕太阳公转一整圈，约等于305个地球年。",
    "eris": "阋神星，Eris，距离太阳67.7个天文单位。自转转完一整圈，约等于1.08个地球天。绕太阳公转一整圈，约等于559个地球年。",
}


async def generate_audio(path, text, voice, semaphore):
    """生成单个音频文件"""
    async with semaphore:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(path)
        print(f"✓ Generated: {path}")


async def main():
    """主函数：为每个天体生成完整语音"""
    audios = []

    for key, text in CELESTIAL_AUDIO_TEXTS.items():
        path = os.path.join(OUTPUT_DIR, f"{key}.mp3")
        audios.append((path, text, VOICE_CN))

    print(f"准备生成 {len(audios)} 个音频文件...\n")

    # 使用信号量限制并发数
    semaphore = asyncio.Semaphore(5)

    tasks = [generate_audio(path, text, voice, semaphore)
             for path, text, voice in audios]
    await asyncio.gather(*tasks)

    print(f"\n✅ 完成！共生成 {len(audios)} 个音频文件到 {OUTPUT_DIR}")


if __name__ == "__main__":
    asyncio.run(main())
