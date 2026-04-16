"""Make near-black neutral pixels transparent; keep dark navy (blue-shifted dark pixels)."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image


def should_be_transparent(r: int, g: int, b: int) -> bool:
    mx, mn = max(r, g, b), min(r, g, b)
    spread = mx - mn
    # Dark navy / blue ink: keep (blue channel leads)
    if mx > 18 and b >= mx and b > r + 5 and b > g + 5:
        return False
    # #000 / flat black and dark neutral grays (background + antialias on black)
    if mx <= 14 and spread <= 8:
        return True
    if mx <= 32 and spread <= 12:
        return True
    return False


def main(src: Path, dst: Path) -> None:
    im = Image.open(src).convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if should_be_transparent(r, g, b):
                px[x, y] = (r, g, b, 0)
    dst.parent.mkdir(parents=True, exist_ok=True)
    im.save(dst, optimize=True)
    print(f"Wrote {dst} ({im.size[0]}x{im.size[1]})")


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "assets" / "pumpgo-wordmark-source.png"
    dst = Path(sys.argv[2]) if len(sys.argv) > 2 else root / "public" / "assets" / "pumpgo-header-logo.png"
    main(src, dst)
