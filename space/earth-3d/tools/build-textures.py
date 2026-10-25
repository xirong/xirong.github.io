#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 NASA 公有领域的地球影像处理成网页贴图（两档：电脑 8192×4096，手机 4096×2048）。

用法：python3 tools/build-textures.py <下载目录>

需要的原图（NASA Visible Earth / Earth Observatory，公有领域）：
  bmng_july.jpg      Blue Marble Next Generation 2004 年 7 月，21600×10800（74092）
  black_marble.jpg   Black Marble 2016 夜间灯光，13500×6750（144898）
  clouds.tif         Blue Marble 云图 cloud_combined_8192（57747）
  elev.png           GEBCO 2008 陆地高程灰度，21600×10800（73934）
  bath.png           GEBCO 2008 海底深度灰度，21600×10800（73963）

输出到 assets/textures/：
  day-8k.jpg / day-4k.jpg        白天地表（没有加阴影的真实颜色，光照交给 shader）
  night-8k.jpg / night-4k.jpg    夜间灯光
  clouds-8k.jpg / clouds-4k.jpg  云（灰度当透明度）
  normal-8k.jpg / normal-4k.jpg  由陆地高程算出的法线贴图（山脉起伏）
  ocean-4k.png                   海洋遮罩（白 = 海，用来画海面反光），由海底深度图得到
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

Image.MAX_IMAGE_PIXELS = None
OUT = Path(__file__).resolve().parent.parent / 'assets' / 'textures'
SIZES = {'8k': (8192, 4096), '4k': (4096, 2048)}


def save_sizes(img, stem, quality=88):
    for tag, size in SIZES.items():
        im = img.resize(size, Image.LANCZOS)
        path = OUT / f'{stem}-{tag}.jpg'
        im.save(path, quality=quality, optimize=True, progressive=True)
        print('写出', path.name, f'{path.stat().st_size / 1e6:.1f} MB')


# ============ 法线贴图：用高程的坡度算 ============
def normal_map(elev_path, strength):
    """高程灰度 → 切线空间法线。经度方向每像素的实际距离随纬度变短，所以 x 方向坡度除以 cos(纬度)。"""
    h = np.asarray(Image.open(elev_path).convert('L').resize((8192, 4096), Image.LANCZOS)).astype(np.float32) / 255.0
    H, W = h.shape
    dx = (np.roll(h, -1, axis=1) - np.roll(h, 1, axis=1)) * 0.5
    dy = np.zeros_like(h)
    dy[1:-1] = (h[2:] - h[:-2]) * 0.5
    lat = (0.5 - (np.arange(H) + 0.5) / H) * np.pi
    dx /= np.maximum(np.cos(lat), 0.08)[:, None]
    nx, ny, nz = -dx * strength, dy * strength, np.ones_like(h)
    n = np.sqrt(nx * nx + ny * ny + nz * nz)
    rgb = np.stack([nx / n, ny / n, nz / n], axis=-1) * 0.5 + 0.5
    return Image.fromarray((rgb * 255).astype(np.uint8))


def main():
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)

    save_sizes(Image.open(src / 'bmng_july.jpg').convert('RGB'), 'day')
    save_sizes(Image.open(src / 'black_marble.jpg').convert('RGB'), 'night', 85)
    save_sizes(Image.open(src / 'clouds.tif').convert('L'), 'clouds', 80)

    normal = normal_map(src / 'elev.png', strength=60)
    save_sizes(normal, 'normal', 84)

    # 海洋遮罩：海底深度图里陆地是纯白（255），其余都是海；稍微模糊一点，海岸线不会锯齿
    bath = np.asarray(Image.open(src / 'bath.png').convert('L'))
    ocean = Image.fromarray(((bath < 255) * 255).astype(np.uint8)).resize((4096, 2048), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.0))
    ocean.save(OUT / 'ocean-4k.png', optimize=True)
    print('写出 ocean-4k.png')


if __name__ == '__main__':
    main()
