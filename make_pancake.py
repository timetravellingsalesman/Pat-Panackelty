"""
Pancake sprite for the crepe-catching mini-game.

A small tan/golden oval with darker edges. 12 wide x 6 tall.
"""
from PIL import Image

T = (0, 0, 0, 0)

OUT  = (43, 36, 26, 255)         # outline
TAN  = (230, 190, 120, 255)      # pancake top
TAND = (190, 145, 85, 255)       # pancake shadow/edge
TANH = (248, 215, 160, 255)      # pancake highlight
BUTT = (250, 220, 130, 255)      # butter/maple accent on top

GRID = [
    "...OOOOOO...",  # 0
    "..OttTttttO.",  # 1  top edge
    ".OTtTtbtttTO",  # 2  body (with tiny butter dab)
    ".OttttttttTO",  # 3
    "..OdtttdtdO.",  # 4  bottom (darker)
    "...OOOOOO...",  # 5
]

charmap = {
    '.': T,
    'O': OUT,
    't': TAN,
    'T': TANH,
    'd': TAND,
    'b': BUTT,
}

W, H = 12, 6
assert len(GRID) == H
for i, row in enumerate(GRID):
    assert len(row) == W, f"row {i} bad width ({len(row)})"

img = Image.new("RGBA", (W, H), T)
px = img.load()
for y, row in enumerate(GRID):
    for x, ch in enumerate(row):
        if ch not in charmap:
            raise ValueError(f"unknown {ch!r} at ({x},{y})")
        px[x, y] = charmap[ch]

img.save("assets/pancake.png")
print("wrote assets/pancake.png (12x6)")

preview = img.resize((W * 20, H * 20), Image.NEAREST)
preview.save("/tmp/pancake_preview.png")
print("preview ready")
