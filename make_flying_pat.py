"""
v7 — polished flying Pat. Cleanup of v6, fixing:
  - the floating leg fragment (now properly connected to the body)
  - overly thick gold belt (now a thin 1-pixel band)
  - messy head/arm junction (arm now clearly emerges from a shoulder under the head)
  - face-sliver that read as a speck (removed; hair is clean silhouette with
    only a tiny highlight for the ear/nape)

Side-profile Superman pose, pointing right. 32×20 canvas.
"""
from PIL import Image

T = (0, 0, 0, 0)

OUT  = (43, 36, 26, 255)
OUT2 = (74, 62, 44, 255)

SK   = (228, 182, 138, 255)
SKS  = (180, 130, 90, 255)
SKH  = (246, 210, 170, 255)

HA   = (58, 38, 22, 255)
HAD  = (36, 22, 12, 255)

R    = (163, 59, 42, 255)
RS   = (122, 43, 31, 255)
RH   = (200, 95, 70, 255)

G  = (200, 155, 60, 255)
GS = (150, 115, 40, 255)

B    = (58, 42, 28, 255)
BH   = (90, 66, 42, 255)

WIND = (122, 107, 85, 255)

# 32 × 20. Flying right. I've drawn this row by row paying attention to
# every pixel's neighbors so limbs connect properly.
#
# Body layout left-to-right:
#   cols 0-3   : wind streaks
#   cols 3-9   : trailing legs + boots
#   cols 9-21  : torso + belt
#   cols 20-24 : head
#   cols 24-30 : extended arm + fist

GRID = [
    "................................",  #  0
    ".....................OOOO.......",  #  1  hair top
    "....................OHhhhO......",  #  2
    "...................OHhhhhhO.....",  #  3  head crown
    "..................OHhhhhhhO.....",  #  4
    ".................OHhhhhhhhO.....",  #  5  back of head
    "............OOOOOOHhhhhhhsO.....",  #  6  shoulders meet nape; skin sliver = ear/cheek
    "...........OrrrrrrOHhhhhOOOOOOO.",  #  7  back begins; arm emerges on right
    "..........OrrrrrrrOOHhhOsssssssO",  #  8  arm shoulder -> forearm -> hand
    ".........OrrrrXrrrrrOOOOsssssskO",  # 9  hand + fingers
    "........OrrrrXXrrrrrrrOOOOOOOOO.",  # 10  hand closes
    "........OxrrrrrrrrrrO...........",  # 11  torso
    "...w....OxxrrrrrrrrO............",  # 12
    "...w...OgggggggggggO............",  # 13  THIN belt (1 row only)
    "...w..OrrrrrrrrrrrO.............",  # 14  lower tunic
    "..w..OxrrrrrrrrrrO..............",  # 15
    "....OxxrrrrrrrrrO...............",  # 16
    "OsSOxxxrrrrrrrOO................",  # 17  trailing leg connects cleanly (no gap)
    "OBBBBOOOOOsssSO.................",  # 18  rear boot + near leg
    "OOOOO.....OBbBO.................",  # 19  front boot
]

GRID = [row.ljust(32, '.')[:32] for row in GRID]
assert len(GRID) == 20
for i, row in enumerate(GRID):
    assert len(row) == 32, f"row {i} bad width ({len(row)}): {row!r}"

charmap = {
    '.': T, ' ': T,
    'O': OUT,  'o': OUT2,
    's': SK,   'S': SKS, 'k': SKH,
    'h': HA,   'H': HAD,
    'r': R,    'x': RS,  'X': RH,
    'g': G,    'j': GS,
    'b': B,    'B': BH,
    'w': WIND,
}

img = Image.new("RGBA", (32, 20), T)
px = img.load()
for y, row in enumerate(GRID):
    for x, ch in enumerate(row):
        if ch not in charmap:
            raise ValueError(f"unknown {ch!r} at ({x},{y})")
        px[x, y] = charmap[ch]

img.save("assets/pat_flying.png")
print("wrote assets/pat_flying.png (32x20)")

preview = img.resize((32 * 12, 20 * 12), Image.NEAREST)
preview.save("/tmp/pat_flying_preview.png")
print("preview ready")
