#!/usr/bin/env python3
"""
Edge-TTS 音频生成脚本 - 智天宇宙魔法学院地球村第 1 天。
页面会优先播放这里生成的 MP3，缺失时再降级到浏览器 TTS。
"""

import json
import shutil
import subprocess
import time
from pathlib import Path

VOICE = "zh-CN-XiaoxiaoNeural"

REPO_ROOT = Path(__file__).resolve().parent.parent
AUDIO_DIR = REPO_ROOT / "space" / "audio" / "magic-academy" / "day1"


def load_data():
    script = """
global.window = global;
require('./space/magic-academy-data.js');
process.stdout.write(JSON.stringify(global.MagicAcademyDay1Data));
"""
    result = subprocess.run(
        ["node", "-e", script],
        cwd=REPO_ROOT,
        check=True,
        text=True,
        capture_output=True,
    )
    return json.loads(result.stdout)


def audio_path_from_relative(relative_path):
    return REPO_ROOT / "space" / relative_path


def build_items(data):
    items = [
        (audio_path_from_relative(data["introAudio"]), data["introText"]),
    ]

    for mission in data["missions"]:
        if mission["type"] == "story":
            text = "。".join(mission["lines"])
        elif mission["type"] == "hanzi":
            text = f'{mission["char"]}，{mission["pinyin"]}，{mission["words"]}。{mission["sentence"]}'
        elif mission["type"] == "english":
            text = "。".join(f'{item["word"]}，{item["cn"]}，{item["sentence"]}' for item in mission["words"])
        elif mission["type"] == "math":
            text = "火箭补给站，完成五道十以内加减法，给火箭加满能量。"
            for question in mission["questions"]:
                items.append((AUDIO_DIR / f'math-{question["id"]}.mp3', f'{question["question"]}。{question["expression"]} 等于几？'))
                items.append((AUDIO_DIR / f'math-{question["id"]}-hint.mp3', question["hint"]))
        elif mission["type"] == "star-size":
            text = mission["sentence"]
        else:
            text = mission["title"]

        items.append((audio_path_from_relative(mission["audio"]), text))

        reward_id = mission.get("rewardId")
        if reward_id:
            reward = next((item for item in data["rewards"] if item["id"] == reward_id), None)
            reward_text = mission.get("rewardText") or (reward["text"] if reward else "获得宇宙奖励。")
            items.append((AUDIO_DIR / f"reward-{reward_id}.mp3", reward_text))

    return items


def generate_audio(edge_tts_bin, output_path, text):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    if output_path.exists() and output_path.stat().st_size > 0:
        print(f"跳过已存在: {output_path.relative_to(REPO_ROOT)}")
        return True

    for attempt in range(1, 4):
        try:
            subprocess.run(
                [
                    edge_tts_bin,
                    "--voice",
                    VOICE,
                    "--rate=-5%",
                    "--text",
                    text,
                    "--write-media",
                    str(output_path),
                ],
                check=True,
                timeout=45,
            )
            print(f"生成: {output_path.relative_to(REPO_ROOT)}")
            return True
        except Exception as exc:
            if output_path.exists() and output_path.stat().st_size == 0:
                output_path.unlink()
            print(f"失败 {attempt}/3: {output_path.relative_to(REPO_ROOT)} ({exc})")
            time.sleep(1.5 * attempt)

    return False


def main():
    edge_tts_bin = shutil.which("edge-tts")
    if not edge_tts_bin:
        raise SystemExit("找不到 edge-tts CLI，请先安装 edge-tts。")

    items = build_items(load_data())
    print(f"准备生成 {len(items)} 个地球村第 1 天音频...")

    failed = []
    for output_path, text in items:
        if not generate_audio(edge_tts_bin, output_path, text):
            failed.append(output_path.relative_to(REPO_ROOT))

    if failed:
        print("以下音频未生成，可稍后重跑脚本补齐：")
        for path in failed:
            print(f"- {path}")
        raise SystemExit(1)

    print("完成。")


if __name__ == "__main__":
    main()
