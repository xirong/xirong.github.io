#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 NASA/SDO 日面图重投影成球面等距柱状贴图，并裁出日冕光环贴图。

用法（先把原图下载到某个目录）：
  python3 tools/build-textures.py <下载目录>

需要的原图：
  sdo/            tools/fetch-sdo.py 下载的四个相位 × 四个波段，以及 frames.json
  eclipse.jpg     NASA/Carla Thomas 2017 日全食（AFRC2017-0233-005）
  granules-observation.jpg   Hinode/SOT G 波段米粒组织（../sun-lab/assets/ 里同名文件）

处理思路：
  1. SDO 图的日面居中；用径向亮度曲线的最陡下降处找日面半径。
  2. 除以径向中位数亮度，去掉照片里自带的临边昏暗/增亮（页面 shader 会按物理规律重新加上）。
  3. 每个经纬度点，按卡林顿自转率换算出它在每张图里的位置，取离日面中心最近的几张加权平均。
     四张图相隔约 1/4 圈，所以整个球面（包括背面）都是真实观测，只是拍摄日期不同。
"""
import json
import sys
from datetime import datetime
from pathlib import Path

import numpy as np
from PIL import Image

OUT = Path(__file__).resolve().parent.parent / 'assets'
MAP_W, MAP_H = 4096, 2048


# ============ 读取与找日面 ============
def load(path, mode='RGB'):
    return np.asarray(Image.open(path).convert(mode)).astype(np.float32)


def radial_profile(lum, cx, cy, rmax, bins=2000):
    h, w = lum.shape
    yy, xx = np.mgrid[0:h, 0:w]
    r = np.hypot(xx - cx, yy - cy)
    idx = np.clip((r / rmax * bins).astype(int), 0, bins - 1)
    sums = np.bincount(idx.ravel(), lum.ravel(), bins)
    cnts = np.maximum(np.bincount(idx.ravel(), None, bins), 1)
    return sums / cnts


def find_radius(lum):
    h, w = lum.shape
    cx, cy = (w - 1) / 2, (h - 1) / 2
    rmax = w / 2
    prof = radial_profile(lum, cx, cy, rmax)
    prof = np.convolve(prof, np.ones(5) / 5, 'same')
    # 只在合理范围内找最陡下降（日面半径约占图宽的 35%～49%）
    lo, hi = int(0.70 * len(prof)), int(0.98 * len(prof))
    k = lo + int(np.argmin(np.diff(prof[lo:hi])))
    return cx, cy, (k + 1) / len(prof) * rmax


# ============ 去掉照片中的临边变化 ============
def flatten(img, cx, cy, R):
    lum = img.mean(axis=2) if img.ndim == 3 else img
    h, w = lum.shape
    yy, xx = np.mgrid[0:h, 0:w]
    rn = np.hypot(xx - cx, yy - cy) / R
    bins = 400
    idx = np.clip((rn * bins).astype(int), 0, bins - 1)
    inside = rn < 1
    med = np.zeros(bins, np.float32)
    for b in range(bins):
        v = lum[(idx == b) & inside]
        med[b] = np.median(v) if v.size else 0
    # 最外圈样本少，用前一段延续
    last = int(0.995 * bins)
    med[last:] = med[last - 1]
    med = np.maximum(np.convolve(med, np.ones(7) / 7, 'same'), 1)
    med[-4:] = med[-5]
    ref = med[:int(0.3 * bins)].mean()
    gain = ref / med[idx]
    gain = gain[..., None] if img.ndim == 3 else gain
    return np.clip(img * gain, 0, 255)


# ============ 重投影成等距柱状贴图 ============
CARRINGTON_RATE = 360 / 27.2753  # 卡林顿会合自转率，度/天（拼图惯例，各纬度同一速率）


def sample(img, px, py):
    x0 = np.clip(np.floor(px).astype(int), 0, img.shape[1] - 2)
    y0 = np.clip(np.floor(py).astype(int), 0, img.shape[0] - 2)
    fx, fy = px - x0, py - y0
    if img.ndim == 3:
        fx, fy = fx[..., None], fy[..., None]
    a = img[y0, x0] * (1 - fx) + img[y0, x0 + 1] * fx
    b = img[y0 + 1, x0] * (1 - fx) + img[y0 + 1, x0 + 1] * fx
    return a * (1 - fy) + b * fy


def to_equirect(frames):
    """frames：[(图像, cx, cy, R, 距最新一张的天数)]。经度 0 = 最新一张的日面中心。"""
    lon = (np.arange(MAP_W) + 0.5) / MAP_W * 2 * np.pi - np.pi
    lat = np.pi / 2 - (np.arange(MAP_H) + 0.5) / MAP_H * np.pi
    lon, lat = np.meshgrid(lon, lat)
    rate = np.radians(CARRINGTON_RATE)
    acc, wsum = None, np.zeros(lon.shape, np.float32)
    for img, cx, cy, R, days in frames:
        local = (lon - rate * days + np.pi) % (2 * np.pi) - np.pi
        mu = np.cos(lat) * np.cos(local)                 # 离日面中心越近越大
        w = np.where(np.abs(local) < np.radians(88), np.clip(mu, 0.03, 1) ** 6, 0)
        x = np.cos(lat) * np.sin(local)
        y = np.sin(lat)
        val = sample(img, cx + x * R * 0.997, cy - y * R * 0.997)
        wv = w[..., None] if img.ndim == 3 else w
        acc = val * wv if acc is None else acc + val * wv
        wsum += w
    wsum = np.maximum(wsum, 1e-9)
    return acc / (wsum[..., None] if acc.ndim == 3 else wsum)


# ============ 日冕光环（日面外的部分） ============
def corona_ring(img, cx, cy, R, outer, fade_from, size=2048):
    """裁出 outer×R 的方块；日面内涂黑，外缘渐隐，用于加法混合的广告牌。"""
    img = img.copy()
    img[int(img.shape[0] * 0.955):] = 0   # 去掉 SDO 图底部的日期文字
    half = outer * R
    box = (int(cx - half), int(cy - half), int(cx + half), int(cy + half))
    pil = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).crop(box).resize((size, size), Image.LANCZOS)
    a = np.asarray(pil).astype(np.float32)
    c = (size - 1) / 2
    yy, xx = np.mgrid[0:size, 0:size]
    rn = np.hypot(xx - c, yy - c) / (size / 2) * outer
    inner = np.clip((rn - 0.985) / 0.02, 0, 1)
    fade = np.clip((outer - rn) / (outer - fade_from), 0, 1) ** 1.5
    m = inner * fade
    return a * (m[..., None] if a.ndim == 3 else m)


def find_moon(lum):
    """日全食照片：月亮和夜空一样黑，区别是月亮被亮环围住。
    从图像边框向内“灌水”，灌不到的暗区就是月亮。"""
    k = 4
    small = lum[::k, ::k]
    wall = small > 40
    reach = np.zeros_like(wall)
    reach[0, :] = reach[-1, :] = reach[:, 0] = reach[:, -1] = True
    reach &= ~wall
    while True:
        grow = reach.copy()
        grow[1:] |= reach[:-1]; grow[:-1] |= reach[1:]
        grow[:, 1:] |= reach[:, :-1]; grow[:, :-1] |= reach[:, 1:]
        grow &= ~wall
        if (grow == reach).all():
            break
        reach = grow
    moon = ~wall & ~reach
    ys, xs = np.nonzero(moon)
    return xs.mean() * k, ys.mean() * k, np.sqrt(moon.sum() / np.pi) * k


def granule_tile(img, size=1024, band=120):
    """切掉黑子小孔和日期文字，做成可以无缝平铺的灰度米粒贴图。
    无缝做法：把末尾一条带子渐变叠到开头，再把末尾裁掉，左右、上下各做一次。"""
    t = img[20:900, 20:940].astype(np.float32)
    t = (t - t.mean()) / t.std() * 40 + 128          # 统一亮度和对比度
    for axis in (1, 0):
        n = t.shape[axis] - band
        ramp = np.linspace(0, 1, band, endpoint=False)
        ramp = ramp[None, :] if axis == 1 else ramp[:, None]
        head = np.take(t, range(band), axis=axis)
        tail = np.take(t, range(n, n + band), axis=axis)
        t = np.take(t, range(n), axis=axis).copy()
        idx = [slice(None)] * 2
        idx[axis] = slice(0, band)
        t[tuple(idx)] = head * ramp + tail * (1 - ramp)
    return np.asarray(Image.fromarray(np.clip(t, 0, 255).astype(np.uint8)).resize((size, size), Image.LANCZOS))


def save(arr, name, quality=88):
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(OUT / name, quality=quality, optimize=True)
    print('写出', name)


def main():
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    frames_info = json.loads((src / 'sdo' / 'frames.json').read_text())

    jobs = [
        ('HMIIC', 'map-visible.jpg', None),
        ('0304', 'map-304.jpg', ('corona-304.jpg', 1.45, 1.12)),
        ('0171', 'map-171.jpg', ('corona-171.jpg', 1.32, 1.08)),
        ('HMIB', 'map-magnetic.jpg', None),
    ]
    for wave, out, ring in jobs:
        infos = frames_info[wave]
        t0 = datetime.fromisoformat(infos[0]['time'])
        frames = []
        for i, info in enumerate(infos):
            mode = 'L' if wave in ('HMIIC', 'HMIB') else 'RGB'
            img = load(src / 'sdo' / info['file'], mode)
            cx, cy, R = find_radius(img if img.ndim == 2 else img.mean(axis=2))
            days = (t0 - datetime.fromisoformat(info['time'])).total_seconds() / 86400
            print(wave, info['time'][:16], '日面半径', round(R), '相隔', round(days, 1), '天')
            if ring and i == 0:
                save(corona_ring(img, cx, cy, R, ring[1], ring[2]), ring[0])
            if wave != 'HMIB':
                img = flatten(img, cx, cy, R)
            frames.append((img, cx, cy, R, days))
        save(to_equirect(frames), out, 80 if wave == 'HMIB' else 86)

    # 页面上显示的拍摄日期
    (OUT / 'frames.js').write_text('// 由 tools/build-textures.py 生成\nwindow.SUN_FRAMES = '
                                   + json.dumps(frames_info, ensure_ascii=False) + ';\n')

    save(granule_tile(load(src / 'granules-observation.jpg', 'L')), 'granules-tile.jpg', 90)

    ecl = load(src / 'eclipse.jpg')
    cx, cy, R = find_moon(ecl.mean(axis=2))
    print('日全食 月心', round(cx), round(cy), '半径', round(R))
    save(corona_ring(ecl, cx, cy, R, 4.0, 1.4), 'corona-eclipse.jpg')


if __name__ == '__main__':
    main()
