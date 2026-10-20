"""
Background removal + asset optimizer for BAZOOKA raw renders (Phase 1 + Phase 2 Bonus Assets).

Uses border-connected flood fill + soft edge alpha ramp (via numpy + scipy + Pillow)
to preserve internal whites (garlic toum, aluminum foil highlights, glass highlights, tungsten bulbs)
while cleanly knocking out the pure #FFFFFF studio backdrop.
Splits `cross section.jpg` into 5 individual pinwheel slice sprites (`slice-1..5.webp`)
and `garnishes.jpg` into 4 individual flying garnish sprites (`garnish-1..4.webp`).
"""
from pathlib import Path
from PIL import Image
import numpy as np
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "assets"
OUT = ROOT / "design" / "assets"
OUT.mkdir(parents=True, exist_ok=True)


def knockout_white(
    img: Image.Image,
    seed_thresh: int = 242,
    edge_low: int = 212,
    grow_px: int = 3,
) -> Image.Image:
    """Border-flood-fill white knockout with soft edge ramp."""
    rgba = img.convert("RGBA")
    arr = np.array(rgba, dtype=np.float32)
    r, g, b, _ = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]

    luminance = (0.299 * r + 0.587 * g + 0.114 * b)
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    chroma = max_c - min_c

    near_white = (luminance >= seed_thresh) & (chroma <= 18)

    # Connected components seeded from all 4 image edges
    labeled, _ = ndimage.label(near_white)
    border_labels = set()
    border_labels.update(np.unique(labeled[0, :]).tolist())
    border_labels.update(np.unique(labeled[-1, :]).tolist())
    border_labels.update(np.unique(labeled[:, 0]).tolist())
    border_labels.update(np.unique(labeled[:, -1]).tolist())
    border_labels.discard(0)

    bg_mask = np.isin(labeled, list(border_labels))

    if grow_px > 0:
        struct = ndimage.generate_binary_structure(2, 2)
        bg_zone = ndimage.binary_dilation(bg_mask, structure=struct, iterations=grow_px)
    else:
        bg_zone = bg_mask

    # Soft color-to-alpha ramp in the boundary zone
    effective = luminance - chroma * 0.9
    ramp = np.clip((seed_thresh - effective) / max(1.0, (seed_thresh - edge_low)), 0.0, 1.0)

    alpha = np.ones_like(luminance)
    alpha = np.where(bg_zone, ramp, alpha)
    alpha = np.where(bg_mask & (luminance >= seed_thresh + 2) & (chroma <= 12), 0.0, alpha)

    # Decontaminate white halo on semi-transparent edge pixels
    edge_band = (alpha > 0.02) & (alpha < 0.95)
    for c in range(3):
        channel = arr[..., c]
        arr[..., c] = np.where(
            edge_band,
            np.clip((channel - (1.0 - alpha) * 255.0) / np.maximum(alpha, 0.15), 0.0, 255.0),
            channel,
        )

    arr[..., 3] = np.clip(alpha * 255.0, 0.0, 255.0)
    return Image.fromarray(arr.astype(np.uint8), mode="RGBA")


def trim_alpha(img: Image.Image, pad: int = 12, alpha_floor: int = 12) -> Image.Image:
    arr = np.array(img)
    ys, xs = np.where(arr[..., 3] > alpha_floor)
    if len(xs) == 0:
        return img
    x0 = max(0, int(xs.min()) - pad)
    y0 = max(0, int(ys.min()) - pad)
    x1 = min(img.width, int(xs.max()) + 1 + pad)
    y1 = min(img.height, int(ys.max()) + 1 + pad)
    return img.crop((x0, y0, x1, y1))


def resize_max(img: Image.Image, max_dim: int) -> Image.Image:
    w, h = img.size
    if max(w, h) <= max_dim:
        return img
    if w >= h:
        new_w = max_dim
        new_h = int(round(h * (max_dim / w)))
    else:
        new_h = max_dim
        new_w = int(round(w * (max_dim / h)))
    return img.resize((new_w, new_h), Image.Resampling.LANCZOS)


def process_cutout(
    src_name: str,
    dst_name: str,
    max_dim: int = 1280,
    seed_thresh: int = 242,
    edge_low: int = 212,
    grow_px: int = 3,
):
    src = RAW / src_name
    if not src.exists():
        print(f"  ! MISSING {src_name}")
        return None
    img = Image.open(src)
    cut = knockout_white(img, seed_thresh=seed_thresh, edge_low=edge_low, grow_px=grow_px)
    cut = trim_alpha(cut, pad=14)
    cut = resize_max(cut, max_dim)
    dst = OUT / dst_name
    cut.save(dst, "WEBP", quality=88, method=6)
    print(f"  + {src_name:24s} -> {dst_name:22s} ({cut.width}x{cut.height}, {dst.stat().st_size // 1024} KB)")
    return cut


def split_row_sprites(
    src_name: str,
    full_dst_name: str,
    prefix: str,
    max_sprite_dim: int = 560,
):
    src = RAW / src_name
    if not src.exists():
        print(f"  ! MISSING {src_name}")
        return
    img = Image.open(src)
    cut = knockout_white(img, seed_thresh=242, edge_low=210, grow_px=3)

    full_row = resize_max(trim_alpha(cut, pad=14), 1600)
    full_dst = OUT / full_dst_name
    full_row.save(full_dst, "WEBP", quality=88, method=6)
    print(f"  + {src_name:24s} -> {full_dst_name:22s} ({full_row.width}x{full_row.height}, {full_dst.stat().st_size // 1024} KB)")

    arr = np.array(cut)
    mask = arr[..., 3] > 35
    # Dilate slightly so tiny detached spice specks join their parent garnish
    struct = ndimage.generate_binary_structure(2, 2)
    dilated = ndimage.binary_dilation(mask, structure=struct, iterations=8)
    labeled, num_features = ndimage.label(dilated)

    boxes = []
    min_area = (cut.width * cut.height) * 0.008
    for lbl in range(1, num_features + 1):
        ys, xs = np.where(labeled == lbl)
        if len(xs) < min_area:
            continue
        boxes.append((int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max()), lbl))

    # Sort left-to-right by x0
    boxes.sort(key=lambda b: b[0])

    print(f"    Detected {len(boxes)} sprites in {src_name}")
    for idx, (x0, y0, x1, y1, lbl) in enumerate(boxes, 1):
        # Mask out any pixels belonging to neighboring components inside the bounding box
        comp_rgba = arr.copy()
        other_comp = (labeled > 0) & (labeled != lbl)
        comp_rgba[other_comp, 3] = 0
        sub = Image.fromarray(comp_rgba, mode="RGBA").crop(
            (max(0, x0 - 6), max(0, y0 - 6), min(cut.width, x1 + 6), min(cut.height, y1 + 6))
        )
        sub = trim_alpha(sub, pad=12)
        sub = resize_max(sub, max_sprite_dim)
        dst = OUT / f"{prefix}-{idx}.webp"
        sub.save(dst, "WEBP", quality=88, method=6)
        print(f"    -> {prefix}-{idx}.webp ({sub.width}x{sub.height}, {dst.stat().st_size // 1024} KB)")


def process_scene(src_name: str, dst_name: str, max_dim: int = 1920, quality: int = 86):
    src = RAW / src_name
    if not src.exists():
        print(f"  ! MISSING {src_name}")
        return
    img = Image.open(src).convert("RGB")
    img = resize_max(img, max_dim)
    dst = OUT / dst_name
    img.save(dst, "WEBP", quality=quality, method=6)
    print(f"  * {src_name:24s} -> {dst_name:22s} ({img.width}x{img.height}, {dst.stat().st_size // 1024} KB)")


def main():
    print("=== Processing BAZOOKA Cutouts & Scenes (Phase 1 + Phase 2 Bonus) ===")
    # 1. Cutouts with bright aluminum foil / white toum / wax paper / tungsten bulbs
    process_cutout("hero shwarma.jpg", "saroukh-hero.webp", max_dim=1350, seed_thresh=245, edge_low=222, grow_px=2)
    process_cutout("shwarma variant 1.jpg", "saroukh-shatta.webp", max_dim=1250, seed_thresh=245, edge_low=222, grow_px=2)
    process_cutout("shwarma variant 2.jpg", "saroukh-lamb.webp", max_dim=1250, seed_thresh=245, edge_low=222, grow_px=2)
    process_cutout("shwarma variant 3.jpg", "saroukh-toum.webp", max_dim=1250, seed_thresh=246, edge_low=225, grow_px=2)
    process_cutout("foil.jpg", "foil-curl.webp", max_dim=1100, seed_thresh=246, edge_low=224, grow_px=2)
    process_cutout("toum.jpg", "toum-mortar.webp", max_dim=960, seed_thresh=246, edge_low=224, grow_px=2)

    # 2. Standard studio cutouts (Phase 1)
    process_cutout("shwarma box.jpg", "arabi-box.webp", max_dim=1200, seed_thresh=242, edge_low=214, grow_px=3)
    process_cutout("carving knife.jpg", "knife.webp", max_dim=1200, seed_thresh=244, edge_low=218, grow_px=2)
    process_cutout("meat split.jpg", "spit-cone.webp", max_dim=1350, seed_thresh=243, edge_low=215, grow_px=3)
    process_cutout("pickle jar.jpg", "pickle-jar.webp", max_dim=1050, seed_thresh=244, edge_low=216, grow_px=2)
    process_cutout("chilli splash.jpg", "chilli-splash.webp", max_dim=1100, seed_thresh=243, edge_low=210, grow_px=3)

    # 3. Phase 2 Bonus Cutouts
    process_cutout("ember and coals.jpg", "charcoal-embers.webp", max_dim=1200, seed_thresh=242, edge_low=210, grow_px=3)
    process_cutout("plate and paper.jpg", "brass-tray.webp", max_dim=1300, seed_thresh=245, edge_low=220, grow_px=2)
    process_cutout("cocktail.jpg", "jallab-glass.webp", max_dim=1050, seed_thresh=244, edge_low=216, grow_px=2)
    process_cutout("stamp and sear.jpg", "iron-press.webp", max_dim=1250, seed_thresh=243, edge_low=215, grow_px=2)
    process_cutout("arch and bulbs.jpg", "cinema-marquee.webp", max_dim=1920, seed_thresh=246, edge_low=224, grow_px=2)

    # 4. Multi-sprite horizontal rows (5 cross-section slices + 4 flying garnishes)
    split_row_sprites("cross section.jpg", "slices-row.webp", "slice", max_sprite_dim=560)
    split_row_sprites("garnishes.jpg", "garnishes-row.webp", "garnish", max_sprite_dim=480)

    # 5. Full-frame 16:9 scenes
    process_scene("wall.jpg", "tile-wall.webp", max_dim=1920, quality=86)
    process_scene("shop.jpg", "night-shop.webp", max_dim=1920, quality=86)
    print("=== Done! ===")


if __name__ == "__main__":
    main()
