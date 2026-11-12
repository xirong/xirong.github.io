#!/usr/bin/env python3
"""根据资料生成天王星和海王星卫星的小晓旁白。"""
import asyncio
import json
import os
from pathlib import Path
import subprocess
import edge_tts

ROOT = Path(__file__).resolve().parent
NODE = "const vm=require('vm'),fs=require('fs');const c={window:{}};vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8'),c);process.stdout.write(JSON.stringify(c.window.ICE_GIANT_MOON_DETAILS));"
DATA = json.loads(subprocess.check_output(['node', '-e', NODE, str(ROOT / 'ice-giant-moon-details.js')]))

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
                print(f"已生成 {output.name}", flush=True)
            finally:
                temporary.unlink(missing_ok=True)
    await asyncio.gather(*(generate(moon) for moon in DATA if moon['key'] not in ('miranda', 'triton')))

if __name__ == '__main__':
    asyncio.run(main())
