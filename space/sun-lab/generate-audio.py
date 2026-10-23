#!/usr/bin/env python3
"""生成小晓 MP3 和浏览器旁白表。已生成且文本未变的音频不重复请求。"""
import argparse
import asyncio
import hashlib
import json
import os
from pathlib import Path

import edge_tts
from narration import NARRATION

ROOT = Path(__file__).resolve().parent


async def main(force=False):
    output = ROOT / "audio"
    output.mkdir(exist_ok=True)
    manifest_path = output / "manifest.json"
    old = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    manifest = {}
    failed = []
    semaphore = asyncio.Semaphore(3)

    async def generate(key, text):
        digest = hashlib.sha256((text + "zh-CN-XiaoxiaoNeural:-5%").encode()).hexdigest()
        target = output / f"{key}.mp3"
        if not force and old.get(key) == digest and target.exists() and target.stat().st_size > 100:
            manifest[key] = digest
            return
        temporary = output / f"{key}.mp3.part"
        async with semaphore:
            try:
                await asyncio.wait_for(edge_tts.Communicate(text, "zh-CN-XiaoxiaoNeural", rate="-5%").save(str(temporary)), 75)
                if temporary.stat().st_size < 100:
                    raise ValueError("empty audio")
                os.replace(temporary, target)
                manifest[key] = digest
                print(f"生成 {key}", flush=True)
            except Exception as exc:
                temporary.unlink(missing_ok=True)
                failed.append(key)
                print(f"失败 {key}: {type(exc).__name__}", flush=True)

    await asyncio.gather(*(generate(key, text) for key, text in NARRATION.items()))
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    browser = {key: {"text": text, "audio": f"audio/{key}.mp3?v={manifest[key][:12]}" if key in manifest else None} for key, text in NARRATION.items()}
    (ROOT / "narration.js").write_text("// 由 generate-audio.py 生成，请修改 narration.py。\nwindow.NARRATION = " + json.dumps(browser, ensure_ascii=False, indent=2) + ";\n")
    print(f"旁白就绪 {len(manifest)}，失败 {len(failed)}。", flush=True)
    if failed:
        print("若无法连接语音服务，请切换到可以打开 bing.com 的网络节点后重跑。")
        raise SystemExit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true")
    asyncio.run(main(parser.parse_args().force))
