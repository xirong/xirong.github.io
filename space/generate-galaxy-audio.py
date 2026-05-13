#!/usr/bin/env python3
"""
Edge-TTS 音频生成脚本
为 galaxy.html 的星系 Dock 生成微软 TTS 介绍音频
"""

import os
import shutil
import subprocess
import tempfile


VOICE = "zh-CN-XiaoxiaoNeural"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "audio", "galaxy")


GALAXY_AUDIO_TEXTS = {
    "galacticCenter": "银河系中心黑洞，人马座A星。它位于银河系正中央，是一个超大质量黑洞。它的质量约为400万个太阳，周围的恒星会围着它高速绕行。这里是银河系最深处的核心区域。",
    "lmc": "大麦哲伦云，Large Magellanic Cloud。它是不规则星系，距离我们16万光年，直径1.4万光年，恒星数量约300亿颗。它是银河系最大的卫星星系，肉眼可见于南半球夜空。大麦哲伦云正在与银河系发生引力相互作用，未来可能被银河系吞噬。",
    "smc": "小麦哲伦云，Small Magellanic Cloud。它是不规则矮星系，距离我们20万光年，直径7000光年，恒星数量约30亿颗。它是银河系的另一个卫星星系，与大麦哲伦云是姐妹星系。小麦哲伦云是航海家麦哲伦在环球航行时记录的，因此得名。",
    "andromeda": "仙女座星系，Andromeda Galaxy，也叫M31。它是棒旋星系，距离我们254万光年，直径22万光年，恒星数量约1万亿颗。它是本星系群中最大的星系，也是肉眼可见的最远天体。仙女座星系正以每秒300公里的速度向银河系靠近，约45亿年后将与银河系碰撞合并。",
    "triangulum": "三角座星系，Triangulum Galaxy，也叫M33。它是螺旋星系，距离我们300万光年，直径6万光年，恒星数量约400亿颗。它是本星系群第三大星系，拥有活跃的恒星形成区域。三角座星系可能是仙女座星系的卫星星系，它们之间有氢气桥连接。",
    "sombrero": "草帽星系，Sombrero Galaxy，也叫M104。它是螺旋星系，距离我们2900万光年，直径5万光年，恒星数量约8000亿颗。它因独特的侧面视角和明亮的核心而得名。草帽星系的中心黑洞质量是太阳的10亿倍，是银河系中心黑洞的250倍。",
    "whirlpool": "漩涡星系，Whirlpool Galaxy，也叫M51。它是螺旋星系，距离我们2300万光年，直径6万光年，恒星数量约1000亿颗。它是经典的正面螺旋星系，旋臂结构清晰可见。漩涡星系正在与旁边的小星系NGC 5195发生引力交互，这使它的旋臂特别明显。",
    "centaurusA": "半人马座A，Centaurus A。它是椭圆星系，距离我们1200万光年，直径6万光年，恒星数量约3000亿颗。它是最近的活跃星系核之一，中心会喷射强大的射电喷流。半人马座A的射电喷流延伸超过100万光年，是宇宙中很壮观的景象。",
    "antennae": "触须星系，Antennae Galaxies。它是碰撞星系，距离我们4500万光年，直径共约10万光年，恒星数量有数千亿颗。它由两个正在碰撞合并的螺旋星系组成，呈现独特的触须形态。它像是银河系与仙女座星系未来碰撞的一次预演。",
    "sgrDsph": "人马座矮椭球，Sagittarius Dwarf。它是矮椭球星系，距离我们约7万光年，直径1万光年，恒星数量有数亿颗。它是银河系最近的卫星星系之一，正在被银河系的潮汐力撕裂吞噬。它的恒星正沿着一条潮汐流散落在银河系周围，环绕银河整整一圈。",
    "sculptorDwarf": "玉夫座矮星系，Sculptor Dwarf。它是矮椭球星系，距离我们29万光年，直径约3000光年，恒星数量有数百万颗。它是银河系的卫星矮星系之一，几乎只剩老年恒星。玉夫座矮星系含有大量暗物质，质量是可见恒星的几十倍。",
    "leoI": "狮子座一矮星系，Leo I Dwarf。它是矮椭球星系，距离我们82万光年，直径约2000光年，恒星数量有数百万颗。它是本星系群中距离较远的银河系卫星之一。狮子座一很孤立，科学家还在研究它是否真的属于银河系。",
    "ngc6822": "巴纳德星系，Barnard's Galaxy，也叫NGC 6822。它是不规则矮星系，距离我们160万光年，直径约7000光年，恒星数量约10亿颗。它是本星系群中较活跃的矮星系，由天文学家爱德华巴纳德发现。它含有许多明亮的恒星形成区，像一个迷你麦哲伦云。",
    "ic10": "IC 10 星系。它是不规则矮星系，距离我们220万光年，直径约5000光年，恒星数量约10亿颗。它是本星系群中唯一已知的星暴矮星系，恒星诞生非常活跃。IC 10 拥有罕见高密度的沃尔夫拉叶星，是研究大质量恒星演化的天然实验室。",
    "ic1613": "IC 1613 星系。它是不规则矮星系，距离我们240万光年，直径约1万光年，恒星数量约1亿颗。它位于本星系群边缘，几乎不含尘埃，所以很适合观测变星。因为没有尘埃遮挡，天文学家常用它来测量宇宙距离。",
    "m32": "M32 矮椭圆星系，也叫NGC 221。它是致密椭圆星系，距离我们254万光年，直径约6500光年，恒星数量约30亿颗。它紧邻仙女座星系，可能曾经是被仙女座剥离的星系核。M32 中心也藏着一颗超大质量黑洞，质量约为太阳的250万倍。",
    "m110": "M110 矮椭圆星系，也叫NGC 205。它是矮椭圆星系，距离我们270万光年，直径约1.7万光年，恒星数量约90亿颗。它是仙女座星系的另一颗著名卫星，比M32更松散。M110 是少数含有尘埃带和年轻恒星的椭圆星系。",
    "ngc253": "玉夫座星系，Sculptor Galaxy，也叫NGC 253。它是中间型螺旋星系，距离我们1100万光年，直径约9万光年，恒星数量约3000亿颗。它是玉夫座星系群最亮的成员，也是南天很壮观的螺旋星系之一。NGC 253 是著名的星暴星系，中心区域恒星形成速度是银河系的数十倍。",
    "m81m82": "M81 和雪茄星系，M81 and M82。它们是互动双星系，距离我们1200万光年，直径合计约15万光年，恒星数量有数千亿颗。M81 是宏伟的螺旋星系，M82 因受到 M81 引力扰动，正在剧烈爆发恒星形成。它们在数亿年前曾近距离相擦，扰动至今没有平息。",
}


def generate_audio(edge_tts_bin, key, text):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_path = os.path.join(OUTPUT_DIR, f"{key}.mp3")

    with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".txt", delete=False) as temp_file:
        temp_file.write(text)
        temp_text_path = temp_file.name

    try:
        subprocess.run(
            [
                edge_tts_bin,
                "--voice",
                VOICE,
                "--file",
                temp_text_path,
                "--write-media",
                output_path,
            ],
            check=True,
        )
        print(f"✓ Generated: {output_path}")
    finally:
        os.unlink(temp_text_path)


def main():
    edge_tts_bin = shutil.which("edge-tts")
    if not edge_tts_bin:
        raise SystemExit("未找到 edge-tts，请先安装 Microsoft Edge TTS CLI")

    print(f"准备生成 {len(GALAXY_AUDIO_TEXTS)} 个银河系 Dock 语音文件...\n")
    for key, text in GALAXY_AUDIO_TEXTS.items():
        generate_audio(edge_tts_bin, key, text)

    print(f"\n完成，音频输出目录：{OUTPUT_DIR}")


if __name__ == "__main__":
    main()
