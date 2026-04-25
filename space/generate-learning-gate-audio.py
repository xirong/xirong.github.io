#!/usr/bin/env python3
"""
Edge-TTS 音频生成脚本 - 为宇宙能量补给闸门生成题目和提示音频。
题库来源是 learning-gate-data.js，避免题目文案在脚本里重复维护。
"""

import json
import os
import shutil
import subprocess
from pathlib import Path

VOICE = "zh-CN-XiaoxiaoNeural"

REPO_ROOT = Path(__file__).resolve().parent.parent
AUDIO_DIR = REPO_ROOT / "space" / "audio" / "learning-gate"


def to_speech_expression(expression):
    """把 10 - 3 + 2 转换成适合朗读的 10减3加2等于几。"""
    return expression.replace(" ", "").replace("+", "加").replace("-", "减") + "等于几"


def load_questions():
    """通过 Node 读取 JS 题库，返回题目列表。"""
    script = """
global.window = global;
require('./space/learning-gate-data.js');
process.stdout.write(JSON.stringify(global.LearningGateData.questionBanks.math));
"""
    result = subprocess.run(
        ["node", "-e", script],
        cwd=REPO_ROOT,
        check=True,
        text=True,
        capture_output=True,
    )
    return json.loads(result.stdout)


def build_audio_items(questions):
    """生成 (输出路径, 文本) 列表。"""
    items = []
    for question in questions:
        question_text = question["question"]
        expression = question.get("expression")
        if expression:
            question_text = f"{question_text}。{to_speech_expression(expression)}"

        items.append((AUDIO_DIR / f"{question['id']}.mp3", question_text))

        hint = question.get("hint")
        if hint:
            items.append((AUDIO_DIR / f"{question['id']}-hint.mp3", hint))

    return items


def generate_audio(edge_tts_bin, output_path, text):
    """调用 edge-tts CLI 生成单个音频。"""
    output_path.parent.mkdir(parents=True, exist_ok=True)
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
    except Exception:
        if output_path.exists() and output_path.stat().st_size == 0:
            output_path.unlink()
        raise
    print(f"✓ {output_path.relative_to(REPO_ROOT)}")


def main():
    edge_tts_bin = shutil.which("edge-tts")
    if not edge_tts_bin:
        raise SystemExit("找不到 edge-tts CLI，请先安装 edge-tts。")

    items = build_audio_items(load_questions())
    print(f"准备生成 {len(items)} 个宇宙能量补给音频...")

    for output_path, text in items:
        if output_path.exists() and output_path.stat().st_size > 0:
            print(f"跳过已存在: {output_path.relative_to(REPO_ROOT)}")
            continue
        generate_audio(edge_tts_bin, output_path, text)

    print("完成。")


if __name__ == "__main__":
    main()
