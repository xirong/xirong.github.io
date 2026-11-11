#!/usr/bin/env python3
"""从木星卫星资料生成小晓语音：python3 space/generate-jupiter-moon-audio.py。"""
import asyncio
import json
import os
from pathlib import Path
import subprocess

import edge_tts

ROOT = Path(__file__).resolve().parent
NODE = "const vm=require('vm'),fs=require('fs');const c={window:{}};vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8'),c);process.stdout.write(JSON.stringify(c.window.JUPITER_MOON_DETAILS));"
DATA = json.loads(subprocess.check_output(['node', '-e', NODE, str(ROOT / 'jupiter-moon-details.js')]))

async def main():
    semaphore = asyncio.Semaphore(4)
    async def generate(moon):
        async with semaphore:
            output = ROOT / 'audio' / 'solar' / (moon['key'] + '.mp3')
            temporary = output.with_suffix('.mp3.part')
            text = f"{moon['nameCN']}，英文叫 {moon['nameEN']}。{moon['description']}它的直径约{moon['diameter']}公里。"
            try:
                await edge_tts.Communicate(text, 'zh-CN-XiaoxiaoNeural', rate='-5%').save(str(temporary))
                if temporary.stat().st_size == 0:
                    raise ValueError('音频为空')
                os.replace(temporary, output)
                print(f"已生成 {output.name}")
            finally:
                temporary.unlink(missing_ok=True)
    await asyncio.gather(*(generate(moon) for moon in DATA))

if __name__ == '__main__':
    asyncio.run(main())
