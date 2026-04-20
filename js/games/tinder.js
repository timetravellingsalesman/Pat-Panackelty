// Tinder collection game
// Pat walks around Jeannie's lakeside board collecting 3 sticks and 3 cattails.
// The board image is used as the visual; collectibles are overlay divs at %
// positions we've calibrated. Pat moves one "step" at a time (arrows / tap).
// The river on the right is a soft wall - Pat just can't walk that far right.

(function () {
  // Percentages are of the cropped board image (900×378 — now landscape).
  // x is horizontal (0–100, left to right), y is vertical (0–100, top to bottom).
  // The river now flows across the TOP of the board; Pat walks on the beach below it.
  const ITEMS = [
    // Sticks (the X-shaped hash marks)
    { id: "s1", type: "stick", x: 9, y: 50 },
    { id: "s2", type: "stick", x: 19, y: 80 },
    { id: "s3", type: "stick", x: 78, y: 80 },
    // Cattails (the oval-headed stalks)
    { id: "c1", type: "cattail", x: 7, y: 13 },
    { id: "c2", type: "cattail", x: 33, y: 48 },
    { id: "c3", type: "cattail", x: 93, y: 17 },
  ];

  // Firepit - where Pat starts (bottom-left now).
  const FIREPIT = { x: 9, y: 77 };

  // Obstacle zones - Pat can't walk onto these. (x, y, radius) in percent.
  const OBSTACLE_ZONES = [
    { x: 9, y: 77, r: 8 },   // firepit - the embery blob
    { x: 78, y: 45, r: 8 },  // boot / trash-furniture in the middle-right
  ];

  function hitsObstacle(x, y) {
    for (const o of OBSTACLE_ZONES) {
      const dx = x - o.x;
      const dy = y - o.y;
      if (dx * dx + dy * dy < o.r * o.r) return true;
    }
    return false;
  }

  const STEP = 7;

  // The river flows across the top. Returns the MIN allowed y for a given x
  // (Pat can't walk UP past this line).
  function minYAt(x) {
    // River dips down from ~y=12% at the edges to ~y=30% in the middle
    if (x < 10) return 14;
    if (x < 20) return 18;
    if (x < 35) return 22;
    if (x < 55) return 28;
    if (x < 70) return 22;
    if (x < 85) return 18;
    return 14;
  }

  window.TinderGame = {
    mount(el) {
      el.innerHTML = "";
      const game = document.createElement("div");
      game.className = "tinder-game";
      game.innerHTML = `
        <div class="tinder-board-wrap" id="tinder-board-wrap">
          <img class="tinder-board-img" src="assets/tinder_board.jpg" alt="" draggable="false">
          <img class="tinder-pat" src="assets/pat.png" alt="Pat" draggable="false" id="tinder-pat">
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
          <div class="tinder-hint">Arrow keys, or tap near Pat to move her.</div>
        </div>
      `;
      el.appendChild(game);

      this.board = game.querySelector("#tinder-board-wrap");
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
        pat: { x: 24, y: 72 }, // open ground east of firepit, clear of items
        collected: { stick: 0, cattail: 0 },
        remaining: ITEMS.slice(),
        complete: false,
        focused: false,
        facing: "right", // starts facing into the scene
      };

      // Place item markers
      this.itemEls = {};
      ITEMS.forEach((it) => {
        const d = document.createElement("div");
        d.className = "tinder-item";
        d.dataset.id = it.id;
        d.style.left = it.x + "%";
        d.style.top = it.y + "%";
        // Draw the item as an SVG icon so it reads well
        d.innerHTML = it.type === "stick" ? this.stickSvg() : this.cattailSvg();
        this.board.appendChild(d);
        this.itemEls[it.id] = d;
      });

      this.renderPat();
      this.bindControls();
    },

    stickSvg() {
      // Two crossed sticks, in ink
      return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
        <g fill="none" stroke="#2b241a" stroke-width="3.5" stroke-linecap="round">
          <line x1="6" y1="10" x2="34" y2="32"/>
          <line x1="34" y1="10" x2="6" y2="32"/>
          <line x1="20" y1="4" x2="20" y2="36"/>
        </g>
      </svg>`;
    },

    cattailSvg() {
      // Three small oval-headed stalks in a little bunch
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
      this.pat.style.left = this.state.pat.x + "%";
      this.pat.style.top = this.state.pat.y + "%";
      // Default sprite faces left. Mirror-flip when facing right. Vertical moves keep last facing.
      const scale = this.state.facing === "right" ? "-1" : "1";
      this.pat.style.transform = `translate(-50%, -50%) scaleX(${scale})`;
    },

    bindControls() {
      const keyHandler = (e) => {
        if (this.state.complete) return;
        // Only react to arrows when a chapter-level arrow won't also fire
        const rect = this.board.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (!isVisible) return;
        let dx = 0, dy = 0;
        if (e.key === "ArrowUp") dy = -STEP;
        else if (e.key === "ArrowDown") dy = STEP;
        else if (e.key === "ArrowLeft") dx = -STEP;
        else if (e.key === "ArrowRight") dx = STEP;
        else return;
        // Intercept so book-level nav doesn't also move chapter
        e.preventDefault();
        e.stopPropagation();
        this.move(dx, dy);
      };
      window.addEventListener("keydown", keyHandler, true);

      // Tap-to-move: tap anywhere on the board, Pat hops toward it (1 step)
      this.board.addEventListener("pointerdown", (e) => {
        if (this.state.complete) return;
        const rect = this.board.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;
        const dx = px - this.state.pat.x;
        const dy = py - this.state.pat.y;
        // Choose whichever axis dominates, step one STEP in that direction
        if (Math.abs(dx) > Math.abs(dy)) {
          this.move(dx > 0 ? STEP : -STEP, 0);
        } else {
          this.move(0, dy > 0 ? STEP : -STEP);
        }
      });
    },

    move(dx, dy) {
      // Update facing on horizontal moves only
      if (dx > 0) this.state.facing = "right";
      else if (dx < 0) this.state.facing = "left";

      const nx = Math.max(4, Math.min(96, this.state.pat.x + dx));
      const ny = Math.max(4, Math.min(96, this.state.pat.y + dy));
      // River check: can't walk UP past the river line
      const minY = minYAt(nx);
      const clampedY = Math.max(ny, minY);
      // Obstacle check - firepit, boot
      if (hitsObstacle(nx, clampedY)) {
        this.renderPat(); // still show the turn
        return;
      }
      this.state.pat.x = nx;
      this.state.pat.y = clampedY;
      this.renderPat();
      this.checkCollection();
    },

    checkCollection() {
      const px = this.state.pat.x;
      const py = this.state.pat.y;
      // Items Pat is close enough to
      this.state.remaining = this.state.remaining.filter((item) => {
        const dx = item.x - px;
        const dy = item.y - py;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 64) { // within ~8 percent radius
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
      void box.offsetWidth; // restart animation
      box.classList.add("bump");
      if (remaining === 0) box.classList.add("done");

      if (this.state.collected.stick === 3 && this.state.collected.cattail === 3) {
        this.onComplete();
      }
    },

    onComplete() {
      this.state.complete = true;
      // Move Pat back next to the firepit
      setTimeout(() => {
        this.state.pat = { x: 22, y: 70 };
        this.renderPat();
      }, 400);
      // After a beat, reveal the completion message
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
      // Reveal the gated chapter content (letter to Jeannie) and dispatch event
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
