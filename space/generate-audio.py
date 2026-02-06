#!/usr/bin/env python3
"""
Edge-TTS 音频生成脚本
为 kids.html 生成所有需要的中文语音 MP3 文件
"""

import edge_tts
import asyncio
import os

# 语音配置
VOICE = "zh-CN-XiaoxiaoNeural"  # 小晓 - 儿童友好的女声

# ============ 固定文本 ============
FIXED_TEXTS = [
    ("audio/fixed/quiz-correct.mp3", "太棒了！答对啦！"),
    ("audio/fixed/word-intro.mp3", "欢迎来到识字探险！点击任意星球开始学习汉字吧！"),
    ("audio/fixed/word-no-task.mp3", "这个星球暂时没有汉字任务，试试别的星球吧！"),
]

# ============ 关卡介绍和徽章 ============
LEVELS_DATA = [
    {
        "id": 1,
        "intro": "我是地球，你的家在我身上。我有蓝色的大海和绿色的陆地。",
        "badge_name": "地球徽章",
        "tasks": [
            {"success": "太棒了！这就是地球，我们的家！", "hint": "再找找看哦！蓝色+绿色的那个就是地球哦！"},
            {"success": "对啦！月亮一直绕着地球转呀转！", "hint": "再找找看哦！看，地球旁边有个小伙伴！"},
            {"hint": "想一想，月亮是谁的小伙伴？"}
        ]
    },
    {
        "id": 2,
        "intro": "水星和金星离太阳最近，那里非常非常热！",
        "badge_name": "烈日徽章",
        "tasks": [
            {"success": "对！太阳是个超级大火球！", "hint": "再找找看哦！中间那个超级大的金色球！"},
            {"success": "找到啦！水星离太阳最近，超级热！", "hint": "再找找看哦！太阳旁边最近的灰色小球！"},
            {"hint": "太阳是个大火球，靠近它会怎样呢？"}
        ]
    },
    {
        "id": 3,
        "intro": "我是火星，我红红的。也许未来我们会去我那里探险。",
        "badge_name": "火星徽章",
        "tasks": [
            {"success": "太厉害了！火星就是红色的！", "hint": "再找找看哦！找找看哪个是橙红色的？"},
            {"hint": "火星的名字里有个'火'字哦！"}
        ]
    },
    {
        "id": 4,
        "intro": "我是木星，我是最大的行星。我有很多很多卫星，比如木卫一、木卫二。",
        "badge_name": "木星徽章",
        "tasks": [
            {"success": "答对啦！木星是太阳系里最大的行星！", "hint": "再找找看哦！看看哪个星球最大还有条纹？"},
            {"hint": "木星的卫星可多啦！比如木卫一、木卫二。"}
        ]
    },
    {
        "id": 5,
        "intro": "我是土星，我戴着漂亮的光环，像呼啦圈一样。",
        "badge_name": "土星徽章",
        "tasks": [
            {"success": "太棒了！土星的光环好漂亮！", "hint": "再找找看哦！哪个星球有漂亮的环？"},
            {"hint": "光环绕着土星转呀转！"}
        ]
    },
    {
        "id": 6,
        "intro": "我们住得很远很远，那里很冷很冷。天王星是青绿色的，海王星是深蓝色的。",
        "badge_name": "冰雪徽章",
        "tasks": [
            {"success": "找到啦！海王星离太阳最远最远！", "hint": "再找找看哦！看看最外面那个深蓝色的！"},
            {"hint": "太阳是暖暖的，离开它越远..."}
        ]
    }
]

# ============ 星球介绍 ============
PLANETS_DATA = {
    "sun": {"must_know": "太阳是个超级大火球！", "fun_fact": "太阳一直在燃烧自己，给大家带来光和热。所有的行星都绕着太阳转呀转。"},
    "mercury": {"must_know": "水星离太阳最近，跑得最快！", "fun_fact": "水星很小，白天超级热，晚上超级冷，温差特别特别大！"},
    "venus": {"must_know": "金星是最热最热的行星！", "fun_fact": "金星离太阳近，又被厚厚的云包着，热气散不出去，所以比水星还热呢！"},
    "earth": {"must_know": "地球是我们的家！", "fun_fact": "地球有蓝色的大海、绿色的陆地，还有厚厚的大气层保护着我们。"},
    "moon": {"must_know": "月亮绕着地球转！", "fun_fact": "月亮是地球的卫星，它自己不会发光，我们看到的月光其实是太阳光照在月亮上反射过来的。"},
    "mars": {"must_know": "火星红红的！", "fun_fact": "火星上有太阳系最大的火山——奥林帕斯山，还经常刮很大很大的沙尘暴！也许未来我们会去火星探险。"},
    "jupiter": {"must_know": "木星最大！", "fun_fact": "木星是气态行星，没有硬硬的地面。身上的大红斑是一个超级大风暴，已经刮了好几百年了！木星有很多卫星，比如木卫一、木卫二。"},
    "saturn": {"must_know": "土星有漂亮的光环！", "fun_fact": "土星也是气态行星。它的光环是由无数冰块和石头组成的。土星特别特别轻，如果有个超级大浴缸，它能浮在水上呢！"},
    "uranus": {"must_know": "天王星是青绿色的！", "fun_fact": "天王星躺着转，跟别人不一样。它是太阳系最冷的行星，因为离太阳很远，自己又不会发热。"},
    "neptune": {"must_know": "海王星离太阳最远！", "fun_fact": "海王星是深蓝色的，上面的风超级超级大，是太阳系里风最大的行星！"},
    "asteroidBelt": {"must_know": "小行星带在火星和木星之间！", "fun_fact": "这里有很多很多大大小小的石头和岩石，它们也绕着太阳转。最大的一颗叫谷神星，是个矮行星。"},
    "pluto": {"must_know": "冥王星是一颗矮行星！", "fun_fact": "冥王星很小很小，以前被当作第九大行星，后来科学家发现它太小了，就改叫矮行星啦。它住在柯伊伯带里。"},
    "kuiperBelt": {"must_know": "柯伊伯带在海王星外面！", "fun_fact": "柯伊伯带是太阳系外围的一个大圈圈，里面有很多冰块和小天体。冥王星就住在这里，它还有很多邻居呢！"}
}

# ============ 识字汉字数据 ============
PLANET_WORDS = {
    "sun": [
        {"char": "日", "pinyin": "rì", "sentence": "红日初升，照亮了大地。"},
        {"char": "火", "pinyin": "huǒ", "sentence": "火苗跳跃，温暖了整个房间。"},
        {"char": "大", "pinyin": "dà", "sentence": "大象很大，小蚂蚁很小。"},
        {"char": "光", "pinyin": "guāng", "sentence": "阳光暖暖的照在身上。"},
        {"char": "热", "pinyin": "rè", "sentence": "夏天好热，吃冰棍凉快。"},
    ],
    "earth": [
        {"char": "山", "pinyin": "shān", "sentence": "高高的山像巨人站着。"},
        {"char": "水", "pinyin": "shuǐ", "sentence": "小河的水哗啦啦地流。"},
        {"char": "木", "pinyin": "mù", "sentence": "森林里有很多树木。"},
        {"char": "土", "pinyin": "tǔ", "sentence": "泥土里长出了小苗。"},
        {"char": "田", "pinyin": "tián", "sentence": "田野里麦苗绿油油一片。"},
        {"char": "云", "pinyin": "yún", "sentence": "白云像棉花糖飘在天上。"},
        {"char": "雨", "pinyin": "yǔ", "sentence": "下雨了，滴答滴答响。"},
    ],
    "moon": [
        {"char": "月", "pinyin": "yuè", "sentence": "月亮悄悄爬上了树梢。"},
        {"char": "石", "pinyin": "shí", "sentence": "河边有很多圆圆的石头。"},
        {"char": "小", "pinyin": "xiǎo", "sentence": "小小的蚂蚁力气大。"},
    ],
    "saturn": [
        {"char": "星", "pinyin": "xīng", "sentence": "满天星星亮晶晶。"},
        {"char": "目", "pinyin": "mù", "sentence": "用眼睛看世界真奇妙。"},
        {"char": "口", "pinyin": "kǒu", "sentence": "他口才极佳，赢得了众人赞许。"},
    ],
    "mars": [
        {"char": "人", "pinyin": "rén", "sentence": "小朋友长大变成大人。"},
        {"char": "上", "pinyin": "shàng", "sentence": "小鸟飞到树上去了。"},
        {"char": "下", "pinyin": "xià", "sentence": "苹果从树上掉下来了。"},
    ],
    "jupiter": [
        {"char": "天", "pinyin": "tiān", "sentence": "蓝色的天空让人心情愉快。"},
        {"char": "手", "pinyin": "shǒu", "sentence": "我有两只小手会画画。"},
        {"char": "足", "pinyin": "zú", "sentence": "小脚丫踩在沙滩上。"},
    ],
    "neptune": [
        {"char": "鱼", "pinyin": "yú", "sentence": "小鱼在水里游来游去。"},
        {"char": "门", "pinyin": "mén", "sentence": "打开门，阳光照进来。"},
        {"char": "井", "pinyin": "jǐng", "sentence": "村民们在水井旁洗衣服。"},
    ],
    "venus": [
        {"char": "心", "pinyin": "xīn", "sentence": "帮助别人让我很开心。"},
        {"char": "耳", "pinyin": "ěr", "sentence": "用耳朵听美妙的音乐。"},
        {"char": "舟", "pinyin": "zhōu", "sentence": "小舟在湖面上轻轻漂。"},
    ],
}

def collect_all_audios():
    """收集所有需要生成的音频列表"""
    audios = []

    # 1. 固定文本
    audios.extend(FIXED_TEXTS)

    # 2. 关卡介绍和徽章
    for level in LEVELS_DATA:
        level_id = level["id"]
        # 关卡介绍
        audios.append((f"audio/levels/level-{level_id}-intro.mp3", level["intro"]))
        # 徽章奖励
        audios.append((f"audio/levels/level-{level_id}-badge.mp3", f"恭喜你！获得了{level['badge_name']}！"))
        # 任务成功和提示
        for task_idx, task in enumerate(level["tasks"], 1):
            if "success" in task:
                audios.append((f"audio/levels/level-{level_id}-task-{task_idx}-success.mp3", task["success"]))
            if "hint" in task:
                audios.append((f"audio/levels/level-{level_id}-task-{task_idx}-hint.mp3", task["hint"]))

    # 3. 星球介绍
    for planet_key, data in PLANETS_DATA.items():
        text = data["must_know"] + " " + data["fun_fact"]
        audios.append((f"audio/planets/{planet_key}-info.mp3", text))

    # 4. 识字汉字
    for planet_key, words in PLANET_WORDS.items():
        for word in words:
            char = word["char"]
            pinyin = word["pinyin"]
            sentence = word["sentence"]

            # 完整介绍：字，拼音。句子
            intro_text = f"{char}，{pinyin}。{sentence}"
            audios.append((f"audio/words/{char}-intro.mp3", intro_text))

            # 单字发音（用于测验播放）
            audios.append((f"audio/words/{char}-char.mp3", char))

            # 答对：太棒了！答对啦！字，句子
            correct_text = f"太棒了！答对啦！{char}，{sentence}"
            audios.append((f"audio/words/{char}-correct.mp3", correct_text))

            # 答错：没关系！正确答案是字。句子
            wrong_text = f"没关系！正确答案是{char}。{sentence}"
            audios.append((f"audio/words/{char}-wrong.mp3", wrong_text))

    # 5. 完成星球汉字的提示
    planet_names = {
        "sun": "太阳", "earth": "地球", "moon": "月球", "saturn": "土星",
        "mars": "火星", "jupiter": "木星", "neptune": "海王星", "venus": "金星"
    }
    for planet_key, name in planet_names.items():
        text = f"太棒了！{name}的汉字都学完了！试试别的星球吧！"
        audios.append((f"audio/words/planet-{planet_key}-complete.mp3", text))

    return audios

async def generate_audio(path, text, semaphore):
    """生成单个音频文件"""
    async with semaphore:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        communicate = edge_tts.Communicate(text, VOICE)
        await communicate.save(path)
        print(f"✓ Generated: {path}")

async def main():
    """主函数：生成所有音频"""
    audios = collect_all_audios()
    print(f"准备生成 {len(audios)} 个音频文件...\n")

    # 使用信号量限制并发数
    semaphore = asyncio.Semaphore(5)

    tasks = [generate_audio(path, text, semaphore) for path, text in audios]
    await asyncio.gather(*tasks)

    print(f"\n✅ 完成！共生成 {len(audios)} 个音频文件。")

if __name__ == "__main__":
    asyncio.run(main())
