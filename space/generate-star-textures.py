#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import subprocess
from urllib.request import urlopen

from PIL import Image, ImageEnhance, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parent
TEXTURES_DIR = ROOT / "textures"
STARS_DIR = TEXTURES_DIR / "stars"
SUN_TEXTURE = TEXTURES_DIR / "sun.jpg"
OUTPUT_SIZE = (2048, 1024)


OFFICIAL_STAR_SOURCES = {
    "betelgeuse_source.jpg": {
        "url": "https://www.eso.org/public/archives/images/wallpaper5/eso2109c.jpg",
        "credit": "ESO/M. Montargès et al.",
        "source_page": "https://www.hq.eso.org/public/images/eso2109c/",
        "title": "Image of Betelgeuse’s surface taken in March 2020",
    },
    "antares_source.jpg": {
        "url": "https://www.eso.org/public/archives/images/wallpaper5/eso1726a.jpg",
        "credit": "ESO/K. Ohnaka",
        "source_page": "https://www.eso.org/public/images/eso1726a/",
        "title": "VLTI reconstructed view of the surface of Antares",
    },
}


PROXY_TEXTURES = {
    "yellow_star_surface.jpg": {
        "dark": "#874100",
        "light": "#fff4c1",
        "blend": 0.35,
        "contrast": 1.1,
        "brightness": 1.02,
    },
    "orange_star_surface.jpg": {
        "dark": "#6a2100",
        "light": "#ffd08a",
        "blend": 0.18,
        "contrast": 1.15,
        "brightness": 1.0,
    },
    "red_dwarf_surface.jpg": {
        "dark": "#4a0a0a",
        "light": "#ff8c62",
        "blend": 0.1,
        "contrast": 1.25,
        "brightness": 0.92,
        "blur": 0.5,
    },
    "blue_white_star_surface.jpg": {
        "dark": "#1b3d84",
        "light": "#f7fbff",
        "blend": 0.28,
        "contrast": 1.08,
        "brightness": 1.08,
    },
    "white_star_surface.jpg": {
        "dark": "#7f8cb0",
        "light": "#ffffff",
        "blend": 0.32,
        "contrast": 1.05,
        "brightness": 1.04,
    },
}


def ensure_dirs() -> None:
    STARS_DIR.mkdir(parents=True, exist_ok=True)


def download(url: str, destination: Path) -> None:
    try:
        with urlopen(url, timeout=30) as response:
            destination.write_bytes(response.read())
            return
    except Exception:
        subprocess.run(
            [
                "curl",
                "-L",
                "--fail",
                "--max-time",
                "60",
                "-o",
                str(destination),
                url,
            ],
            check=True,
        )


def expand_bbox(bbox: tuple[int, int, int, int], width: int, height: int, padding: float = 0.08) -> tuple[int, int, int, int]:
    left, top, right, bottom = bbox
    pad_x = int((right - left) * padding)
    pad_y = int((bottom - top) * padding)
    return (
        max(0, left - pad_x),
        max(0, top - pad_y),
        min(width, right + pad_x),
        min(height, bottom + pad_y),
    )


def crop_bright_disc(image: Image.Image) -> Image.Image:
    rgb = image.convert("RGB")
    gray = rgb.convert("L")
    mask = gray.point(lambda pixel: 255 if pixel > 18 else 0)
    bbox = mask.getbbox() or (0, 0, rgb.width, rgb.height)
    left, top, right, bottom = expand_bbox(bbox, rgb.width, rgb.height)
    cropped = rgb.crop((left, top, right, bottom))

    square_size = max(cropped.width, cropped.height)
    square = Image.new("RGB", (square_size, square_size), "black")
    paste_x = (square_size - cropped.width) // 2
    paste_y = (square_size - cropped.height) // 2
    square.paste(cropped, (paste_x, paste_y))
    return square


def save_disc_texture(source: Path, destination: Path, contrast: float = 1.15, brightness: float = 1.02) -> None:
    disc = crop_bright_disc(Image.open(source))
    disc = ImageEnhance.Contrast(disc).enhance(contrast)
    disc = ImageEnhance.Brightness(disc).enhance(brightness)
    disc = disc.resize(OUTPUT_SIZE, Image.LANCZOS)
    disc.save(destination, quality=95)


def save_proxy_texture(base: Image.Image, destination: Path, config: dict[str, float | str]) -> None:
    grayscale = base.convert("L")
    proxy = ImageOps.colorize(grayscale, black=config["dark"], white=config["light"])
    if config.get("blend", 0) > 0:
        proxy = Image.blend(proxy, base, float(config["blend"]))
    if config.get("blur", 0) > 0:
        proxy = proxy.filter(ImageFilter.GaussianBlur(radius=float(config["blur"])))
    proxy = ImageEnhance.Contrast(proxy).enhance(float(config["contrast"]))
    proxy = ImageEnhance.Brightness(proxy).enhance(float(config["brightness"]))
    proxy.save(destination, quality=95)


def write_credits_file() -> None:
    credits_path = STARS_DIR / "README.md"
    lines = [
        "# Star Texture Credits",
        "",
        "- `sun.jpg`: existing repository texture, used as the base for solar-type proxy textures",
        "- `betelgeuse_source.jpg`: downloaded from ESO archive image `eso2109c`, credit `ESO/M. Montargès et al.`",
        "  source: https://www.hq.eso.org/public/images/eso2109c/",
        "- `betelgeuse_surface.jpg`: derived from ESO public image `eso2109c`, credit `ESO/M. Montargès et al.`",
        "  source: https://www.hq.eso.org/public/images/eso2109c/",
        "- `red_supergiant_surface.jpg`: derived from the Betelgeuse observation above and reused as a generic red supergiant texture",
        "  source: https://www.hq.eso.org/public/images/eso2109c/",
        "- `antares_source.jpg`: downloaded from ESO archive image `eso1726a`, credit `ESO/K. Ohnaka`",
        "  source: https://www.eso.org/public/images/eso1726a/",
        "- `antares_surface.jpg`: derived from ESO public image `eso1726a`, credit `ESO/K. Ohnaka`",
        "  source: https://www.eso.org/public/images/eso1726a/",
        "- proxy textures (`yellow`, `orange`, `red_dwarf`, `blue_white`, `white`): generated locally from the repository `sun.jpg` to give unresolved stars a textured surface instead of a flat solid color",
        "",
    ]
    credits_path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    ensure_dirs()

    for filename, meta in OFFICIAL_STAR_SOURCES.items():
        source_path = STARS_DIR / filename
        download(meta["url"], source_path)

    save_disc_texture(STARS_DIR / "betelgeuse_source.jpg", STARS_DIR / "betelgeuse_surface.jpg", contrast=1.18, brightness=1.04)
    save_disc_texture(STARS_DIR / "antares_source.jpg", STARS_DIR / "antares_surface.jpg", contrast=1.12, brightness=1.03)
    save_disc_texture(STARS_DIR / "betelgeuse_source.jpg", STARS_DIR / "red_supergiant_surface.jpg", contrast=1.05, brightness=0.98)

    base_sun = Image.open(SUN_TEXTURE).convert("RGB").resize(OUTPUT_SIZE, Image.LANCZOS)
    for filename, config in PROXY_TEXTURES.items():
        save_proxy_texture(base_sun, STARS_DIR / filename, config)

    write_credits_file()


if __name__ == "__main__":
    main()
