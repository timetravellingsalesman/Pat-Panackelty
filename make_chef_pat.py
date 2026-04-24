"""
Chef Pat sprite v2 — cleaner pan (handle on ONE side only, rounder pan bowl),
and slightly clearer arm pose holding the pan.

28 wide x 32 tall.
"""
from PIL import Image

T = (0, 0, 0, 0)

OUT  = (43, 36, 26, 255)
OUT2 = (74, 62, 44, 255)

WH   = (245, 240, 220, 255)
WHS  = (215, 205, 180, 255)
WHH  = (255, 250, 235, 255)

SK   = (228, 182, 138, 255)
SKS  = (180, 130, 90, 255)

HA   = (74, 46, 28, 255)
HAD  = (36, 22, 12, 255)

R    = (163, 59, 42, 255)
RS   = (122, 43, 31, 255)

PAN  = (90, 80, 70, 255)
PAND = (55, 48, 40, 255)
PANH = (130, 118, 100, 255)
HAND = (88, 58, 30, 255)   # lighter wood for contrast

LEG  = (60, 48, 36, 255)
LEGS = (38, 28, 18, 255)

B    = (58, 42, 28, 255)
BH   = (90, 66, 42, 255)

# Legend:
#   . ' ' transparent   O outline   o soft outline
#   w/W/x  white / shadow / highlight
#   s/S    skin / shadow
#   h/H    hair / deep
#   r/R    red / shadow
#   p/P/q  pan / dark / highlight
#   n      handle (wood)
#   l/L    legs
#   b/B    boots

GRID = [
    "............................",  #  0
    ".........OwwwwwwwO..........",  #  1  hat puff top
    "........OwwWwwwwwwO.........",  #  2
    ".......OwxwwwwwwwwwO........",  #  3
    "......OwwwwwwWwwwwwwO.......",  #  4
    ".....OwwxwwwwwwwwwwwwO......",  #  5
    "......OwwwwwWwwwwwwwO.......",  #  6
    "......OOOOOOOOOOOOOO........",  #  7  hat band
    ".......OhhhhhhhhhhO.........",  #  8
    ".......OhhsssssshO..........",  #  9
    ".......OhsOsssOshO..........",  # 10  eyes
    "........OsssssssO...........",  # 11
    ".........OOOOOOO............",  # 12  chin
    "........OrrrrrrrO...........",  # 13  red collar
    "......OOsrrrrrrrsOO.........",  # 14  shoulders
    ".....Osss OrrrrrO sssO......",  # 15  arms start
    ".....OssOOwwwwwwwOOssO......",  # 16  apron bib
    "......OsO wwwwwww OsO.......",  # 17
    "......OOO OwWwwwO OOO.......",  # 18  apron middle
    ".........OOOOOOOO...........",  # 19  apron hem
    "..................nnnn......",  # 20  handle begins (right side only)
    "........OOOOOOOOOOnnO.......",  # 21  pan top rim + handle
    ".......OPPPPPPPPPPOOO.......",  # 22  pan body (dark rim)
    ".......OPppppppppPO.........",  # 23  pan bowl mid
    ".......OPpqpppppPO..........",  # 24  pan bowl bottom (highlight)
    "........OOPPPPPPO...........",  # 25  pan bottom
    "..........OOOOOO............",  # 26
    "..........OllllO............",  # 27  legs
    "..........OlLllO............",  # 28
    "..........OllLlO............",  # 29
    "..........OOOOOO............",  # 30
    "............................",  # 31
]

GRID = [row.ljust(28, '.')[:28] for row in GRID]
assert len(GRID) == 32
for i, row in enumerate(GRID):
    assert len(row) == 28, f"row {i} bad width ({len(row)}): {row!r}"

charmap = {
    '.': T, ' ': T,
    'O': OUT,  'o': OUT2,
    'w': WH, 'W': WHS, 'x': WHH,
    's': SK,   'S': SKS,
    'h': HA,   'H': HAD,
    'r': R,    'R': RS,
    'p': PAN,  'P': PAND, 'q': PANH,
    'n': HAND,
    'l': LEG,  'L': LEGS,
    'b': B,    'B': BH,
}

img = Image.new("RGBA", (28, 32), T)
px = img.load()
for y, row in enumerate(GRID):
    for x, ch in enumerate(row):
        if ch not in charmap:
            raise ValueError(f"unknown {ch!r} at ({x},{y})")
        px[x, y] = charmap[ch]

img.save("assets/pat_chef.png")
print("wrote assets/pat_chef.png (28x32)")

preview = img.resize((28 * 12, 32 * 12), Image.NEAREST)
preview.save("/tmp/pat_chef_preview.png")
print("preview ready")
