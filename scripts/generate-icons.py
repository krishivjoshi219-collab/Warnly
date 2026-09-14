import os
import sys
from PySide6.QtSvg import QSvgRenderer
from PySide6.QtGui import QImage, QPainter
from PySide6.QtCore import QRectF, Qt, QByteArray

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SVG_PATH = os.path.join(PROJECT_ROOT, "icon", "favicon.svg")
RES_DIR = os.path.join(PROJECT_ROOT, "android", "app", "src", "main", "res")

DENSITIES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

def load_svg_variants(svg_path: str):
    with open(svg_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Inset the squircle chassis stroke slightly so the 1.2px stroke sits cleanly within the canvas
    square_svg = content.replace(
        '<rect width="40" height="40" rx="11" fill="#090D16" stroke="#1E293B" stroke-width="1.2" />',
        '<rect x="0.6" y="0.6" width="38.8" height="38.8" rx="10.5" fill="#090D16" stroke="#1E293B" stroke-width="1.2" />'
    )

    # For round icon variant, convert chassis to circle with radius 19.2 so stroke is within 40x40 canvas
    round_svg = content.replace(
        '<rect width="40" height="40" rx="11" fill="#090D16" stroke="#1E293B" stroke-width="1.2" />',
        '<circle cx="20" cy="20" r="19.2" fill="#090D16" stroke="#1E293B" stroke-width="1.2" />'
    )

    return square_svg, round_svg

def render_svg_to_png(svg_str: str, size: int, output_path: str):
    renderer = QSvgRenderer(QByteArray(svg_str.encode("utf-8")))
    if not renderer.isValid():
        raise RuntimeError(f"Invalid SVG data for size {size}")

    img = QImage(size, size, QImage.Format_ARGB32_Premultiplied)
    img.fill(Qt.transparent)

    painter = QPainter(img)
    painter.setRenderHint(QPainter.Antialiasing, True)
    painter.setRenderHint(QPainter.SmoothPixmapTransform, True)
    renderer.render(painter, QRectF(0, 0, size, size))
    painter.end()

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    if not img.save(output_path, "PNG"):
        raise RuntimeError(f"Failed to save PNG to {output_path}")

def main():
    if not os.path.exists(SVG_PATH):
        print(f"Error: SVG file not found at {SVG_PATH}", file=sys.stderr)
        sys.exit(1)

    print(f"Reading SVG from: {SVG_PATH}")
    square_svg, round_svg = load_svg_variants(SVG_PATH)

    total_generated = 0
    for folder, size in DENSITIES.items():
        folder_path = os.path.join(RES_DIR, folder)
        square_out = os.path.join(folder_path, "ic_launcher.png")
        round_out = os.path.join(folder_path, "ic_launcher_round.png")

        render_svg_to_png(square_svg, size, square_out)
        render_svg_to_png(round_svg, size, round_out)

        print(f"Generated {folder} ({size}x{size}):")
        print(f"  - {os.path.basename(square_out)} ({os.path.getsize(square_out)} bytes)")
        print(f"  - {os.path.basename(round_out)} ({os.path.getsize(round_out)} bytes)")
        total_generated += 2

    # Also render 512x512 master previews in icon/ for reference
    master_square = os.path.join(PROJECT_ROOT, "icon", "icon.png")
    master_round = os.path.join(PROJECT_ROOT, "icon", "icon-round.png")
    render_svg_to_png(square_svg, 512, master_square)
    render_svg_to_png(round_svg, 512, master_round)
    print(f"Generated master previews in icon/:")
    print(f"  - icon.png (512x512)")
    print(f"  - icon-round.png (512x512)")

    print(f"\nSuccessfully generated {total_generated} Android mipmap icon files.")

if __name__ == "__main__":
    main()
