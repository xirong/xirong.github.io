#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 NASA/SDO 公开图库下载一整圈自转所需的日面图（每隔 1/4 个自转周期一张）。
某个相位缺图时，往前推整数个自转周期补齐。

用法：python3 tools/fetch-sdo.py <下载目录> [结束时间 YYYY-MM-DDTHH:MM]
输出：<目录>/<波段>_<序号>.jpg 以及 <目录>/frames.json（每张图的实际拍摄时间）

太阳自转（从地球看）约 27.2753 天一圈，所以 0、6.8、13.6、20.5 天前的四张图，
各自的正面半球拼起来就能覆盖整颗太阳。
"""
import json
import re
import sys
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

BASE = 'https://sdo.gsfc.nasa.gov/assets/img/browse'
WAVES = ['HMIIC', '0304', '0171', 'HMIB']
SYNODIC_DAYS = 27.2753
STEPS = 4


# ============ 读目录 ============
def listing(day):
    url = f'{BASE}/{day:%Y/%m/%d}/'
    with urllib.request.urlopen(url, timeout=60) as r:
        html = r.read().decode('utf-8', 'ignore')
    return sorted(set(re.findall(r'(\d{8}_\d{6})_4096_([A-Z0-9]+)\.jpg', html)))


def nearest(target, wave):
    best = None
    for day in (target - timedelta(days=1), target, target + timedelta(days=1)):
        try:
            files = listing(day)
        except Exception:
            continue
        for stamp, w in files:
            if w != wave:
                continue
            t = datetime.strptime(stamp, '%Y%m%d_%H%M%S').replace(tzinfo=timezone.utc)
            gap = abs((t - target).total_seconds())
            if best is None or gap < best[0]:
                best = (gap, t, f'{BASE}/{t:%Y/%m/%d}/{stamp}_4096_{wave}.jpg')
    if best is None:
        return None
    return best[1], best[2]


def nearest_any_rotation(target, wave):
    # HMI 偶有缺档：同一自转相位往前推一整圈（或两圈）再找
    for k in range(3):
        hit = nearest(target - timedelta(days=SYNODIC_DAYS * k), wave)
        if hit:
            return hit
    raise RuntimeError(f'找不到 {wave} @ {target}')


def main():
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    end = (datetime.strptime(sys.argv[2], '%Y-%m-%dT%H:%M').replace(tzinfo=timezone.utc)
           if len(sys.argv) > 2 else datetime.now(timezone.utc) - timedelta(hours=12))
    frames = {}
    for i in range(STEPS):
        target = end - timedelta(days=SYNODIC_DAYS / STEPS * i)
        for wave in WAVES:
            t, url = nearest_any_rotation(target, wave)
            dest = out / f'{wave}_{i}.jpg'
            if not dest.exists():
                print('下载', url)
                urllib.request.urlretrieve(url, dest)
            frames.setdefault(wave, []).append({'file': dest.name, 'time': t.isoformat(), 'url': url})
    (out / 'frames.json').write_text(json.dumps(frames, ensure_ascii=False, indent=1))
    print('完成', out / 'frames.json')


if __name__ == '__main__':
    main()
