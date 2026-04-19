# Pat Panackelty

A web version of the picture book, with four interactive mini-games embedded at the right moments in the text.

## What's inside

```
patbook/
├── index.html         # main page
├── css/
│   └── style.css      # all styling
├── js/
│   ├── book.js        # chapter navigation, vocabulary panel
│   ├── content.js     # full text of the book, chapter by chapter
│   ├── vocab.js       # kid-friendly definitions for clickable words
│   └── games/
│       ├── scramble.js    # unscramble "Pat Panackelty" (end of dream intro)
│       ├── forest.js      # top-down walk with fog of war (Jeannie ch., before the van)
│       ├── tinder.js      # collect sticks and cattails (Jeannie ch., morning firepit)
│       └── maze.js        # frog escapes chef through the hedge maze (Queen ch.)
└── assets/
    ├── board.jpg          # forest walk board (hand-drawn on graph paper)
    ├── tinder_board.jpg   # lakeside board (landscape)
    ├── pat.png            # top-down Pat sprite (used in forest + tinder)
    ├── frog.png           # pixel frog (used in maze)
    └── chef.png           # pixel chef with cleaver (used in maze)
```

Total size: ~200 KB. Everything runs client-side — no backend, no build step.

## How to publish on GitHub Pages (free)

**One-time setup (about 5 minutes):**

1. Go to https://github.com and sign in. If you don't have an account, make one.
2. Click the **+** at top-right → **New repository**.
3. Name it something like `pat-panackelty` (this will become part of the URL).
4. Make it **Public** (Pages is free only for public repos on a free plan).
5. Check **Add a README file** — doesn't matter, it'll be overwritten.
6. Click **Create repository**.

**Upload the files:**

1. On the new empty repo page, click **Add file → Upload files**.
2. Drag the entire contents of this `patbook/` folder (not the folder itself, everything **inside** it) into the browser.
3. Scroll to the bottom, click **Commit changes**.

**Turn on Pages:**

1. In the repo, click **Settings** (top right of the repo, not your profile).
2. In the left sidebar, click **Pages**.
3. Under "Build and deployment → Source", select **Deploy from a branch**.
4. Branch: **main**, folder: **/ (root)**, click **Save**.
5. Wait 1–2 minutes. Reload the Pages settings — it'll show **Your site is live at https://YOUR-USERNAME.github.io/pat-panackelty/**
6. Done. Share that URL with whoever you want.

**To update the book later:** edit a file in the repo (pencil icon) or upload a replacement, commit. The site updates in a minute or two.

## How to test it locally before publishing

You can't just double-click `index.html` — because JavaScript modules need to be served from a real URL.

**Easiest option** — if you have Python installed (Mac/Linux usually do):

```bash
cd patbook/
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

**Easier option** — use the free **Five Server** or **Live Server** extension in VS Code. Open the patbook folder, right-click `index.html`, "Open with Live Server".

## How to edit content

### Change the book's text

Open `js/content.js`. Each chapter is a block in the `CHAPTERS` array. Edit the `html` field — it's HTML with `<p>` tags for paragraphs. A few special classes:

- `class="dialogue"` — for lines of spoken dialogue (indented differently)
- `class="dropcap"` — on the first paragraph of a chapter, for the big coloured first letter

### Add a new clickable vocabulary word

1. Open `js/vocab.js` and add an entry, e.g.

```js
crepuscular: {
  word: "crepuscular",
  pron: "kre-PUS-kyuh-ler",
  def: "Active at twilight — those magical in-between hours of dawn and dusk when bats and owls come out.",
  source: "https://en.wiktionary.org/wiki/crepuscular"
},
```

2. In `js/content.js`, wrap the word in the prose:

```html
<span class="vocab" data-vocab="crepuscular">crepuscular</span>
```

### Replace an illustration

Drop a new file into `assets/` with the same name and extension as the one you're replacing. Refresh. Done.

### Change the cover, ornaments, or colour palette

- **Colour palette**: top of `css/style.css`, the `:root` block. `--paper` is the background cream, `--accent` is the warm red, `--forest` is the hedge green, `--gold` is the orb yellow, etc.
- **Fonts**: body uses *Sorts Mill Goudy*, display italic uses *IM Fell English* — both free via Google Fonts.
- **Cover text**: search `cover-title` in `js/content.js`.

## Known small things

- **Tinder game**: SVG item markers sit on top of the hand-drawn marks on the paper board. When collected, the marker fades but the paper mark underneath stays visible. A kid playing won't notice, but a purist might.
- **Maze difficulty**: chef moves every 3 frog moves with 50% corner-hesitation. If it feels too easy or too hard, change `CHEF_PERIOD` (higher = easier for player) or `CHEF_CORNER_HESITATE` in `js/games/maze.js`.
- **Mobile browsers** (especially iOS Safari): arrow-key navigation is obviously unavailable; the games all support tap or swipe. The chapter navigation uses tap-on-buttons.
- **Pixel sprites** (frog, chef) use `image-rendering: pixelated` — they stay crisp and chunky at any size.

## Credits

Book by you. Site scaffolding, games, and typography put together with Claude. Fonts by Barry Schwartz (Sorts Mill Goudy) and Igino Marini (IM Fell), both open-source via Google Fonts.
