#!/usr/bin/env python3
"""build-textures.py — 由木星全球主图生成 8k/4k 纹理。

用法:
    python tools/build-textures.py <源jpg>

输出（space/jupiter-3d/assets/textures/）:
    jupiter-8k.jpg  8192×4096
    jupiter-4k.jpg  4096×2048

缩放参数: LANCZOS, quality=88, optimize=True, progressive=True。
脚本可重复运行，不删除源文件。
"""

import sys
from pathlib import Path

from PIL import Image

# 源图为 14400×7200（约1.04亿像素），超过 Pillow 默认防炸弹上限
Image.MAX_IMAGE_PIXELS = None

# ============ 配置 ============
# (输出文件名, 目标宽, 目标高)，均为 2:1 经纬等距投影
OUTPUTS = [
    ("jupiter-8k.jpg", 8192, 4096),
    ("jupiter-4k.jpg", 4096, 2048),
]

ROOT = Path(__file__).resolve().parent.parent  # space/jupiter-3d
TEXTURES_DIR = ROOT / "assets" / "textures"

JPEG_KWARGS = dict(quality=88, optimize=True, progressive=True)


# ============ resize_texture ============
def resize_texture(src: Path, name: str, width: int, height: int) -> Path:
    """把源图等比缩放到 (width, height) 并保存为优化 JPEG。"""
    with Image.open(src) as im:
        if im.size != (width, height):
            im = im.resize((width, height), Image.LANCZOS)
        out = TEXTURES_DIR / name
        im.save(out, "JPEG", **JPEG_KWARGS)
    return out


# ============ main ============
def main() -> int:
    if len(sys.argv) != 2:
        print("用法: python tools/build-textures.py <源jpg>", file=sys.stderr)
        return 1

    src = Path(sys.argv[1]).resolve()
    if not src.is_file():
        print(f"错误: 源文件不存在: {src}", file=sys.stderr)
        return 1

    TEXTURES_DIR.mkdir(parents=True, exist_ok=True)

    with Image.open(src) as im:
        im.verify()
    with Image.open(src) as im:
        print(f"源图: {src.name} {im.size[0]}×{im.size[1]} {im.format}")

    for name, width, height in OUTPUTS:
        out = resize_texture(src, name, width, height)
        size_mb = out.stat().st_size / (1024 * 1024)
        print(f"输出: {out.relative_to(ROOT)} {width}×{height} {size_mb:.2f} MB")

    return 0


if __name__ == "__main__":
    sys.exit(main())
