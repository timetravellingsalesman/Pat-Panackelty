"""
Top-down flying Pat — v5.

Revisions from v4:
  - hair trails to ONE SIDE (off the back of the head into empty space),
    not down the middle of the tunic. Tunic back is a clean solid shape.
  - arms are clearly-readable sleeves with small hand blocks at the tips
  - legs are distinct dark red leggings, ending in boot blocks
  - no face elements (we're directly above her head)

The hair stream tilts slightly off-axis so it reads as "blown by wind" and
doesn't mirror the central axis of the body.

Pat flies toward the top of the screen (row 0).

28 wide x 32 tall.
"""
from PIL import Image

T = (0, 0, 0, 0)

OUT  = (43, 36, 26, 255)
OUT2 = (74, 62, 44, 255)

SK   = (228, 182, 138, 255)
SKS  = (180, 130, 90, 255)

HA   = (74, 46, 28, 255)       # light-ish hair brown
HAM  = (58, 38, 22, 255)       # mid hair
HAD  = (36, 22, 12, 255)       # deepest

R    = (163, 59, 42, 255)
RS   = (122, 43, 31, 255)
RH   = (200, 95, 70, 255)

G    = (200, 155, 60, 255)
GS   = (150, 115, 40, 255)

B    = (58, 42, 28, 255)
BH   = (90, 66, 42, 255)

# Legend:
#   .  transparent   ' ' transparent
#   O  hard outline   o  soft outline
#   s/S  skin/shadow
#   h  mid hair  H  deep hair  a  light hair strand
#   r/x/X  tunic / shadow / highlight
#   g/j  belt gold / shadow
#   b/B  boot / highlight
#
# Pat is vertically centered in the sprite. Her head is at the TOP (since
# she's flying up). The hair trails DOWN-AND-RIGHT a bit — a diagonal trail
# that feels wind-blown rather than a stiff symmetric ribbon.

GRID = [
    "............................",  #  0
    "...........OOOOO............",  #  1  crown top
    "..........OhhhahhO..........",  #  2
    ".........OHhhhahhhO.........",  #  3
    ".........OhhahhhhhO.........",  #  4  head full width
    "........OhhhhhhhhhO.........",  #  5
    "........OHhhhhhhhhO.........",  #  6
    "........OhhhhhhhHhO.........",  #  7  hair starts spilling off the back-right
    ".OOOO....OOhhhhhhhHO........",  #  8  LEFT arm (red sleeve) starts from shoulder
    ".OrrrOO...OrrrrrrOhhO.......",  #  9  LEFT arm extends left; hair trail continues right
    "OrrrrrOO.OrrrrrrrOHhhO......",  # 10  arms continue
    "OsrrrrrrOrrrrXrrrOhhHhO.....",  # 11  LEFT hand peeks (skin), tunic core visible
    "OsssOrrrrrrrrXrrrOhhhhO.....",  # 12
    ".OOOOrrrrrrrrrrrrOhHhhO.....",  # 13  LEFT arm terminates, torso continues
    "....OrrrrrrrrrrrrOhhhHO.....",  # 14  RIGHT side: another arm + trailing hair
    "....OxxrrrrrrrrrrOhHhhO.....",  # 15
    "....OggjggggggggOOhhhhO.....",  # 16  belt across lower back
    "....OrrxxrrrrrrxOhhhhO......",  # 17  lower tunic tapers
    ".....Oxxxrrrrxxr OhhhO......",  # 18
    ".....OxxxrrrrxxxOhhO........",  # 19  tunic hem
    "......OOOrrrrOOOOhO.........",  # 20  tunic ends here; legs emerge
    "........OssOssO.OO..........",  # 21  leg-gap (two legs close together)
    "........OssOssO.............",  # 22
    "........OssOssO.............",  # 23
    "........OSsOSsO.............",  # 24  leg shadows
    "........OBbOBbO.............",  # 25  boots
    "........OOOOOOO.............",  # 26  boot soles
    "............................",  # 27
    "............................",  # 28
    "............................",  # 29
    "............................",  # 30
    "............................",  # 31
]

GRID = [row.ljust(28, '.')[:28] for row in GRID]
assert len(GRID) == 32
for i, row in enumerate(GRID):
    assert len(row) == 28, f"row {i} bad width ({len(row)}): {row!r}"

charmap = {
    '.': T, ' ': T,
    'O': OUT,  'o': OUT2,
    's': SK,   'S': SKS,
    'h': HAM,  'H': HAD, 'a': HA,
    'r': R,    'x': RS,  'X': RH,
    'g': G,    'j': GS,
    'b': B,    'B': BH,
}

img = Image.new("RGBA", (28, 32), T)
px = img.load()
for y, row in enumerate(GRID):
    for x, ch in enumerate(row):
        if ch not in charmap:
            raise ValueError(f"unknown {ch!r} at ({x},{y})")
        px[x, y] = charmap[ch]

img.save("assets/pat_flying.png")
print("wrote assets/pat_flying.png (28x32)")

preview = img.resize((28 * 12, 32 * 12), Image.NEAREST)
preview.save("/tmp/pat_flying_preview.png")
print("preview ready")
