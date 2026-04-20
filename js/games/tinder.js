// Tinder collection game - grid-based, modeled on the van/forest walk.
// 7 cols × 3 rows. Pat walks on the lakeside board collecting 3 sticks and 3 cattails.
// Blocked cells: river (row 0 cols 1-5), boot (5,1), firepit (0,2).

(function () {
  const COLS = 7;
  const ROWS = 3;
  const START = { c: 1, r: 1 };  // middle-left, clear of items

  // Cells containing collectibles
  const ITEMS = [
    // Cattails (3)
    { id: "c1", type: "cattail", c: 0, r: 0 }, // top-left
    { id: "c2", type: "cattail", c: 2, r: 1 }, // middle
    { id: "c3", type: "cattail", c: 6, r: 0 }, // top-right
    // Sticks (3)
    { id: "s1", type: "stick", c: 0, r: 1 }, // middle-left
    { id: "s2", type: "stick", c: 1, r: 2 }, // bottom-left
    { id: "s3", type: "stick", c: 5, r: 2 }, // bottom-right
  ];

  // Blocked cells (river, boot, firepit)
  const OBSTACLES = new Set([
    // River spans row 0 cols 2-5 (col 1 has just the edge of the river - walkable)
    "2,0", "3,0", "4,0", "5,0",
    // Boot (middle-right)
    "5,1",
    // Firepit (bottom-left)
    "0,2",
  ]);

  function key(c, r) { return c + "," + r; }
  function isObstacle(c, r) { return OBSTACLES.has(key(c, r)); }
  function inBounds(c, r) { return c >= 0 && c < COLS && r >= 0 && r < ROWS; }

  window.TinderGame = {
    mount(el) {
      el.innerHTML = "";
      const game = document.createElement("div");
      game.className = "tinder-game";
      game.innerHTML = `
        <div class="tinder-board-wrap" id="tinder-board-wrap">
          <img class="tinder-board-img" src="assets/tinder_board.jpg" alt="" draggable="false">
          <img class="tinder-pat" src="assets/pat_sprite.png" alt="Pat" draggable="false" id="tinder-pat">
        </div>
        <div class="tinder-sidebar">
          <div class="tinder-counter" id="counter-cattail">
            <div class="tinder-counter-label">cattails</div>
            <div class="tinder-counter-num" id="num-cattail">3</div>
          </div>
          <div class="tinder-counter" id="counter-stick">
            <div class="tinder-counter-label">sticks</div>
            <div class="tinder-counter-num" id="num-stick">3</div>
          </div>
          <div class="tinder-hint">Arrow keys or tap to move. Gather 3 sticks and 3 cattails.</div>
        </div>
      `;
      el.appendChild(game);

      this.board = game.querySelector("#tinder-board-wrap");
      this.boardImg = this.board.querySelector(".tinder-board-img");
      this.pat = game.querySelector("#tinder-pat");
      this.counters = {
        stick: game.querySelector("#num-stick"),
        cattail: game.querySelector("#num-cattail"),
      };
      this.counterBoxes = {
        stick: game.querySelector("#counter-stick"),
        cattail: game.querySelector("#counter-cattail"),
      };

      this.state = {
        pat: { ...START },
        collected: { stick: 0, cattail: 0 },
        remaining: ITEMS.slice(),
        complete: false,
        facing: "up",  // top-down sprite defaults to facing up
      };

      this.itemEls = {};
      ITEMS.forEach((it) => {
        // Each item marker is positioned at the center of its cell
        const d = document.createElement("div");
        d.className = "tinder-item";
        d.dataset.id = it.id;
        // Position as % of board (center of the cell)
        d.style.left = ((it.c + 0.5) / COLS) * 100 + "%";
        d.style.top = ((it.r + 0.5) / ROWS) * 100 + "%";
        d.innerHTML = it.type === "stick" ? this.stickSvg() : this.cattailSvg();
        this.board.appendChild(d);
        this.itemEls[it.id] = d;
      });

      this.renderPat();
      this.bindControls();
    },

    stickSvg() {
      return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
        <g fill="none" stroke="#2b241a" stroke-width="3.5" stroke-linecap="round">
          <line x1="6" y1="10" x2="34" y2="32"/>
          <line x1="34" y1="10" x2="6" y2="32"/>
          <line x1="20" y1="4" x2="20" y2="36"/>
        </g>
      </svg>`;
    },

    cattailSvg() {
      return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
        <g fill="none" stroke="#2b241a" stroke-width="2" stroke-linecap="round">
          <line x1="20" y1="36" x2="20" y2="22"/>
          <line x1="20" y1="36" x2="8" y2="20"/>
          <line x1="20" y1="36" x2="32" y2="22"/>
          <ellipse cx="20" cy="16" rx="4" ry="6" fill="#2b241a"/>
          <ellipse cx="8" cy="14" rx="3.5" ry="5" fill="#2b241a"/>
          <ellipse cx="32" cy="16" rx="3.5" ry="5" fill="#2b241a"/>
        </g>
      </svg>`;
    },

    renderPat() {
      // Pat is an overlay on the board: position as % of board size
      const xPct = ((this.state.pat.c + 0.5) / COLS) * 100;
      const yPct = ((this.state.pat.r + 0.5) / ROWS) * 100;
      this.pat.style.left = xPct + "%";
      this.pat.style.top = yPct + "%";
      // Rotate whole body based on facing direction (top-down view).
      const rot = { up: 0, right: 90, down: 180, left: 270 }[this.state.facing] || 0;
      this.pat.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
    },

    move(dc, dr) {
      if (this.state.complete) return;
      // Update facing in all 4 directions (top-down rotation)
      if (dr === -1) this.state.facing = "up";
      else if (dr === 1) this.state.facing = "down";
      else if (dc === -1) this.state.facing = "left";
      else if (dc === 1) this.state.facing = "right";

      const nc = this.state.pat.c + dc;
      const nr = this.state.pat.r + dr;
      if (!inBounds(nc, nr) || isObstacle(nc, nr)) {
        this.renderPat();  // show the turn even if blocked
        return;
      }
      this.state.pat.c = nc;
      this.state.pat.r = nr;
      this.renderPat();
      this.checkCollection();
    },

    checkCollection() {
      const { c, r } = this.state.pat;
      this.state.remaining = this.state.remaining.filter((item) => {
        if (item.c === c && item.r === r) {
          this.collect(item);
          return false;
        }
        return true;
      });
    },

    collect(item) {
      const el = this.itemEls[item.id];
      if (el) el.classList.add("collected");
      this.state.collected[item.type]++;
      const remaining = item.type === "stick" ? 3 - this.state.collected.stick : 3 - this.state.collected.cattail;
      this.counters[item.type].textContent = remaining;
      const box = this.counterBoxes[item.type];
      box.classList.remove("bump");
      void box.offsetWidth;
      box.classList.add("bump");
      if (remaining === 0) box.classList.add("done");

      if (this.state.collected.stick === 3 && this.state.collected.cattail === 3) {
        this.onComplete();
      }
    },

    bindControls() {
      const keyHandler = (e) => {
        if (this.state.complete) return;
        const rect = this.board.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (!isVisible) return;
        let dc = 0, dr = 0;
        if (e.key === "ArrowUp") dr = -1;
        else if (e.key === "ArrowDown") dr = 1;
        else if (e.key === "ArrowLeft") dc = -1;
        else if (e.key === "ArrowRight") dc = 1;
        else return;
        e.preventDefault();
        e.stopPropagation();
        this.move(dc, dr);
      };
      window.addEventListener("keydown", keyHandler, true);

      // Tap-to-move: tap adjacent cell
      this.board.addEventListener("pointerdown", (e) => {
        if (this.state.complete) return;
        const rect = this.board.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const c = Math.floor(px * COLS);
        const r = Math.floor(py * ROWS);
        const dc = c - this.state.pat.c;
        const dr = r - this.state.pat.r;
        if (Math.abs(dc) + Math.abs(dr) === 1) {
          this.move(dc, dr);
        } else if (Math.abs(dc) + Math.abs(dr) > 1) {
          if (Math.abs(dc) > Math.abs(dr)) this.move(Math.sign(dc), 0);
          else this.move(0, Math.sign(dr));
        }
      });
    },

    onComplete() {
      this.state.complete = true;
      // Move Pat back next to the firepit visually
      setTimeout(() => {
        this.state.pat = { c: 1, r: 2 };  // next to firepit
        this.renderPat();
      }, 400);
      setTimeout(() => {
        const wrap = this.board.parentElement;
        const msg = document.createElement("div");
        msg.className = "tinder-complete";
        msg.textContent = "Enough to wake the fire.";
        msg.style.opacity = "0";
        msg.style.transition = "opacity 1s";
        wrap.parentElement.appendChild(msg);
        requestAnimationFrame(() => { msg.style.opacity = "1"; });
      }, 1400);
      // Reveal the gated chapter content
      const locked = document.getElementById("jeannie-after-tinder");
      if (locked) {
        setTimeout(() => {
          locked.classList.add("revealed");
          locked.setAttribute("aria-hidden", "false");
          setTimeout(() => {
            locked.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 1200);
        }, 1800);
      }
      window.dispatchEvent(new CustomEvent("tinderWon"));
    },
  };
})();
