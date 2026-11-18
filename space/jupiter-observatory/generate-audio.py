"""在本目录运行 ../sun-3d/.venv/bin/python generate-audio.py。--force 可更新已有录音。"""

import argparse
import asyncio
import json
from pathlib import Path
from tempfile import NamedTemporaryFile

import edge_tts
from narration import NARRATION

ROOT = Path(__file__).resolve().parent
AUDIO = ROOT / "audio"


async def generate(key, text, force):
    target = AUDIO / f"{key}.mp3"
    if not force and target.is_file() and target.stat().st_size:
        return True
    with NamedTemporaryFile(dir=AUDIO, suffix=".part", delete=False) as handle:
        temporary = Path(handle.name)
    try:
        voice = edge_tts.Communicate(text, "zh-CN-XiaoxiaoNeural", rate="-5%")
        await voice.save(str(temporary))
        if not temporary.stat().st_size:
            raise ValueError("空录音")
        temporary.replace(target)
        return True
    except Exception as error:
        print(f"{key} 生成失败：{type(error).__name__}")
        return False
    finally:
        temporary.unlink(missing_ok=True)


async def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    AUDIO.mkdir(exist_ok=True)
    results = await asyncio.gather(
        *(generate(key, text, args.force) for key, text in NARRATION.items())
    )
    lines = json.dumps(NARRATION, ensure_ascii=False, indent=2)
    (ROOT / "narration.js").write_text(
        f"// 此文件由 generate-audio.py 根据 narration.py 生成。\nwindow.OBS_VOICE = {lines};\n",
        encoding="utf-8",
    )
    print(f"完成 {results.count(True)} 条，失败 {results.count(False)} 条")
    return 0 if all(results) else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
