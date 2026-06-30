#!/usr/bin/env python3
"""
Edge-TTS 音频生成脚本
为 solar-system.html 生成每个天体的周期说明语音 MP3 文件
"""

import edge_tts
import asyncio
import os
import sys

# 语音配置
VOICE_CN = "zh-CN-XiaoxiaoNeural"  # 中文部分用小晓

# 输出目录
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "audio", "solar")
PROXY_URL = os.environ.get("https_proxy") or os.environ.get("http_proxy") or os.environ.get("all_proxy")

# ============ 天体语音文案 ============
CELESTIAL_AUDIO_TEXTS = {
    "sun": "太阳，Sun，太阳系的中心恒星。自转转完一整圈，约等于25.4个地球天。",
    "proximaCentauri": "比邻星，Proxima Centauri。它是离太阳最近的恒星，是一颗又小又暗的红矮星，直径大约是太阳的0.154倍。",
    "alphaCentauri": "半人马座α星，Alpha Centauri A。它是距离太阳系最近的恒星系统中最亮的主星，大小和太阳很接近，但比太阳稍大、稍重。",
    "betaCentauri": "半人马座β星，Beta Centauri。它是一颗明亮的蓝白色巨星，南半球常把它和半人马座α星一起当作指向南十字座的指针星。",
    "sirius": "天狼星，Sirius A。它是夜空中最亮的恒星，主星比太阳更大、更亮，旁边还有一颗很小但密度极高的白矮星。",
    "arcturus": "大角星，Arcturus。它是一颗红巨星，直径大约是太阳的25倍，用来理解恒星变老后会膨胀很直观。",
    "antares": "心宿二，Antares。它是天蝎座的红超巨星，名字有火星的对手的意思，因为它看起来也带着醒目的红色。",
    "betelgeuse": "参宿四，Betelgeuse。它是猎户座肩膀位置的红超巨星，如果放到太阳的位置，它的外层会大到接近木星轨道。",
    "rigel": "参宿七，Rigel。它是猎户座脚边明亮的蓝超巨星，直径约为太阳的79倍，质量约为太阳的21倍。",
    "alnitak": "参宿一，Alnitak。它是猎户腰带东侧的蓝超巨星三合星系统，主星直径约为太阳的20倍，质量约为太阳的33倍。",
    "vyCanisMajoris": "大犬座VY，VY Canis Majoris。它是非常巨大的红特超巨星，太阳放到它旁边会像一个小亮点。",
    "uyScuti": "盾牌座UY，UY Scuti。它曾被认为是已知体积最大的恒星之一，很适合用来感受红超巨星的夸张尺度。",
    "sagittariusA": "银河系中心黑洞，Sagittarius A star。它藏在银河系中央，质量大约是太阳的430万倍，是认识超大质量黑洞的起点。",
    "m31BlackHole": "仙女座中心黑洞，M31 star。它位于仙女座星系中央，质量大约是太阳的1.4亿倍，是银河系中心黑洞的30多倍。",
    "s50014BlackHole": "S5 0014+81。它是遥远类星体里的巨型黑洞，常见估算约为太阳质量的400亿倍，比仙女座中心黑洞还要大很多。",
    "ton618BlackHole": "TON 618。它是非常夸张的超大质量黑洞，质量超过太阳的600亿倍，适合作为黑洞尺度对比里的终极大个子。",
    "phoenixABlackHole": "凤凰座A星中心黑洞，Phoenix A star。它位于凤凰星系团中央，模型估算质量约为太阳的1000亿倍，可能比 TON 618 还要巨大。",
    "mercury": "水星，Mercury，距离太阳0.4个天文单位。自转转完一整圈，约等于58.6个地球天。绕太阳公转一整圈，约等于0.24个地球年。直径约为4879公里。",
    "venus": "金星，Venus，距离太阳0.7个天文单位。自转转完一整圈，约等于243个地球天。绕太阳公转一整圈，约等于0.62个地球年。直径约为12104公里。",
    "earth": "地球，Earth，距离太阳1个天文单位。自转转完一整圈，约等于1个地球天。绕太阳公转一整圈，约等于1个地球年。直径约为12742公里。",
    "moon": "月球，Moon，地球的天然卫星。自转转完一整圈，约等于27.3个地球天。绕地球公转一整圈，约等于27.3个地球天。直径约为3474公里。",
    "mars": "火星，Mars，距离太阳1.5个天文单位。自转转完一整圈，约等于1.03个地球天。绕太阳公转一整圈，约等于1.88个地球年。直径约为6779公里。",
    "io": "木卫一，Io，太阳系里火山活动最活跃的卫星。它的表面有很多活火山，经常会喷出岩浆和硫磺，所以看起来是黄色、橙色、红色。它不是一颗安静的月亮，而像一个一直在冒火的小火球。",
    "europa": "木卫二，Europa，木星的一颗冰壳卫星，表面覆盖着厚厚的冰，冰下面可能有一片很深的地下海洋。科学家认为，那里可能有适合生命存在的环境，所以木卫二是太阳系里最值得探索的卫星之一。",
    "ganymede": "木卫三，Ganymede，太阳系最大的卫星，比水星还大，它的外面像冰壳，里面可能有一片看不见的大海，木卫三有自己的磁场，像是自己的保护罩。",
    "titan": "土卫六，Titan，土星最大的卫星之一，拥有浓厚氮气大气层，表面有甲烷湖和雾色地形，常被拿来讨论原始化学与类地球环境。",
    "enceladus": "土卫二，Enceladus，土星内部热活动很活跃，南极有冰裂隙“虎纹”，会喷出冰尘和水蒸气羽流，常被当成‘探测生命线索的优先目标’。",
    "rhea": "土卫五，Rhea，土星的一颗大型冰质卫星，表面反光性高，布满陨石坑和断裂带，保留了很久的撞击历史。这里画出的淡淡光环，英文可以说 Rhea dust ring，也就是土卫五尘埃环。它不像土星光环那样明亮，更像非常稀薄的尘埃带，帮助我们理解卫星旁边也可能有环状物质。",
    "phobos": "火卫一，Phobos，火星最近的一颗小卫星，形状不规则、表面坑坑洼洼，离火星很近，每天需要绕行多圈。",
    "deimos": "火卫二，Deimos，火星的外侧卫星，体积更小更暗，轨道更远更平稳，像颗安静的伴星。",
    "triton": "海卫一，Triton，海王星最大的卫星，公转方向是逆行的，说明它可能是后期俘获天体，表面有年轻地质活动迹象。",
    "titania": "天卫一，Titania，天王星系统较大的卫星，表面有明暗交错地形与巨大断裂谷，反映复杂的内部演化历史。",
    "miranda": "天卫五，Miranda，天王星的一颗小卫星，表面有巨大的断崖、沟槽和拼贴状地形。它像一块被撞击和内部活动反复改造过的冰岩世界。",
    "charon": "冥卫一，Charon，冥王星最大的卫星，大小接近冥王星的一半。它和冥王星互相潮汐锁定，像一对很特别的双人舞伙伴。",
    "nix": "冥卫二，Nix，冥王星的一颗小卫星，形状不规则，和冥卫三一样大约只有几十公里宽。它来自遥远的柯伊伯带，很适合观察小冰岩天体。",
    "hydra": "冥卫三，Hydra，冥王星外侧的小卫星之一，形状细长，表面反光较亮。它和冥卫二都是新视野号重点拍到的小卫星。",
    "kerberos": "冥卫四，Kerberos，冥王星的一颗更小的卫星，英文读作 Kerberos。它非常暗、非常小，像一块绕着冥王星运行的冰岩碎片。",
    "styx": "冥卫五，Styx，冥王星最小的卫星之一，名字来自希腊神话中的冥河。它体积很小，轨道位于冥王星小卫星家族之中。",
    "hiiaka": "妊卫一，Hiʻiaka，妊神星较大、较外侧的卫星，英文读作 Hiʻiaka。它表面可能富含明亮的水冰，名字来自夏威夷神话。",
    "mk2": "鸟卫一，S/2015 (136472) 1，也常被叫作 MK2，是鸟神星目前已知的唯一卫星。它很暗，比鸟神星暗一千多倍，像一颗小小的黑色伴星。",
    "dysnomia": "阋卫一，Dysnomia，阋神星目前已知的唯一卫星，英文读作 Dysnomia。科学家通过观察它绕阋神星运动，测出了阋神星的质量。",
    "ceres": "谷神星，Ceres，距离太阳2.8个天文单位。自转转完一整圈，约等于0.38个地球天。绕太阳公转一整圈，约等于4.6个地球年。直径约为940公里。",
    "jupiter": "木星，Jupiter，距离太阳5.2个天文单位。自转转完一整圈，约等于0.41个地球天。绕太阳公转一整圈，约等于11.86个地球年。直径约为139820公里。",
    "saturn": "土星，Saturn，距离太阳9.5个天文单位。自转转完一整圈，约等于0.45个地球天。绕太阳公转一整圈，约等于29.46个地球年。直径约为116460公里。土星光环的英文通常叫 Saturn's rings，也可以说 rings of Saturn。它们不是一整块硬硬的圆盘，而是无数冰块、尘埃和岩石碎片绕着土星运行，从远处看像一圈又一圈亮亮的带子。",
    "uranus": "天王星，Uranus，距离太阳19.2个天文单位。自转转完一整圈，约等于0.72个地球天。绕太阳公转一整圈，约等于84个地球年。直径约为50724公里。天王星光环的英文叫 Uranian rings，也可以说 rings of Uranus。它们比土星光环暗得多，主要由很黑的尘埃和小颗粒组成，所以在望远镜里不容易看见。",
    "neptune": "海王星，Neptune，距离太阳30个天文单位。自转转完一整圈，约等于0.67个地球天。绕太阳公转一整圈，约等于164.8个地球年。直径约为49244公里。",
    "pluto": "冥王星，Pluto，距离太阳39.5个天文单位。自转转完一整圈，约等于6.4个地球天。绕太阳公转一整圈，约等于247.94个地球年。直径约为2377公里。",
    "haumea": "妊神星，Haumea，距离太阳43.1个天文单位。自转转完一整圈，约等于0.16个地球天。绕太阳公转一整圈，约等于285个地球年。直径约为1632公里。",
    "makemake": "鸟神星，Makemake，距离太阳45.8个天文单位。自转转完一整圈，约等于0.94个地球天。绕太阳公转一整圈，约等于305个地球年。直径约为1430公里。",
    "eris": "阋神星，Eris，距离太阳67.7个天文单位。自转转完一整圈，约等于1.08个地球天。绕太阳公转一整圈，约等于559个地球年。直径约为2326公里。",
    "oortCloud": "奥尔特云，Oort Cloud。它是太阳系最遥远的边疆，是一个巨大的球形云团，包裹着整个太阳系，由数万亿颗冰冻天体组成。",
}


async def generate_audio(path, text, voice, semaphore):
    """生成单个音频文件"""
    async with semaphore:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        tmp_path = f"{path}.tmp"
        communicate = edge_tts.Communicate(text, voice, proxy=PROXY_URL)
        try:
            await communicate.save(tmp_path)
            os.replace(tmp_path, path)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
        print(f"✓ Generated: {path}")


async def main():
    """主函数：为每个天体生成完整语音"""
    audios = []
    selected_keys = sys.argv[1:]
    missing_keys = [key for key in selected_keys if key not in CELESTIAL_AUDIO_TEXTS]
    if missing_keys:
        raise SystemExit(f"未知天体 key: {', '.join(missing_keys)}")

    source_items = CELESTIAL_AUDIO_TEXTS.items()
    if selected_keys:
        source_items = ((key, CELESTIAL_AUDIO_TEXTS[key]) for key in selected_keys)

    for key, text in source_items:
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
