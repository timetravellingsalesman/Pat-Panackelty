// Scramble game — unscramble "PAT PANACKELTY"
// 2D scattered letter tiles that drag into a target row at the bottom.
// The first "P" is pre-placed as a hint.
//
// Uses pointer events so it works with mouse and touch.
(function () {
  const TARGET = "PATPANACKELTY"; // 13 letters, no space; we render the space visually
  const LOCK_INDEX = 0; // The first P is locked
  const DISPLAY_SPACE_AT = 3; // Show a visual gap between "PAT" and "PANACKELTY"

  window.ScrambleGame = {
    mount(el) {
      el.innerHTML = "";
      const game = document.createElement("div");
      game.className = "scramble-game";
      game.innerHTML = `
        <p class="scramble-hint">Drag the letters to remember your name.</p>
        <div class="scramble-scatter" id="scramble-scatter"></div>
        <div class="scramble-slots" id="scramble-slots"></div>
        <div class="scramble-success" id="scramble-success"></div>
      `;
      el.appendChild(game);

      this.scatter = game.querySelector("#scramble-scatter");
      this.slotRow = game.querySelector("#scramble-slots");
      this.success = game.querySelector("#scramble-success");

      this.state = {
        solved: false,
        placements: {},
        tileToSlot: {},
        tiles: [],
      };

      this.buildSlots();
      this.buildTiles();
      this.bindDrag();
      requestAnimationFrame(() => this.scatterPositions());
      window.addEventListener("resize", () => {
        if (!this.state.solved) this.scatterPositions(true);
      });
      // When the book navigates, the chapter may have been display:none until now.
      // Re-scatter if our tiles haven't been placed yet (clientWidth was 0 at mount).
      window.addEventListener("chapterChange", () => {
        if (!this.state.solved) {
          // Retry until our container has size
          const tryScatter = (attempt) => {
            if (this.scatter.clientWidth > 0) {
              // Only scatter if tiles don't have positions yet
              const anyPlaced = this.state.tiles.some(t => t.x !== 0 || t.y !== 0);
              if (!anyPlaced) this.scatterPositions();
            } else if (attempt < 20) {
              requestAnimationFrame(() => tryScatter(attempt + 1));
            }
          };
          tryScatter(0);
        }
      });
    },

    buildSlots() {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < TARGET.length; i++) {
        if (i === DISPLAY_SPACE_AT) {
          const spacer = document.createElement("div");
          spacer.className = "scramble-slot space";
          frag.appendChild(spacer);
        }
        const slot = document.createElement("div");
        slot.className = "scramble-slot";
        slot.dataset.slotIndex = i;
        if (i === LOCK_INDEX) {
          slot.classList.add("filled", "locked");
          slot.innerHTML = `<span class="scramble-slot-text">${TARGET[i]}</span>`;
        } else {
          slot.innerHTML = `<span class="scramble-slot-text"></span>`;
        }
        frag.appendChild(slot);
      }
      this.slotRow.innerHTML = "";
      this.slotRow.appendChild(frag);
    },

    buildTiles() {
      const letters = [];
      for (let i = 0; i < TARGET.length; i++) {
        if (i === LOCK_INDEX) continue;
        letters.push({ letter: TARGET[i], originalIndex: i });
      }
      // Fisher-Yates shuffle
      for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
      }

      this.state.tiles = letters.map((l, idx) => {
        const tile = {
          id: "t" + idx,
          letter: l.letter,
          rot: (Math.random() - 0.5) * 24,
          colorClass: "c" + ((idx % 4) + 1),
          x: 0,
          y: 0,
          placed: false,
          locked: false,
          slotIndex: null,
        };
        const el = document.createElement("div");
        el.className = `letter-tile ${tile.colorClass}`;
        el.dataset.tileId = tile.id;
        el.textContent = l.letter;
        el.style.transform = `rotate(${tile.rot}deg)`;
        tile.el = el;
        this.scatter.appendChild(el);
        return tile;
      });

      this.state.placements[LOCK_INDEX] = "__locked__";
    },

    scatterPositions(animate) {
      const w = this.scatter.clientWidth;
      const h = this.scatter.clientHeight;
      if (w === 0) return;

      const tileW = 46;
      const tileH = 54;
      const cols = Math.max(4, Math.floor((w - 20) / (tileW + 6)));
      const rows = Math.ceil(this.state.tiles.length / cols);
      const cellW = (w - 20) / cols;
      const cellH = Math.min((h - 20) / rows, tileH + 10);
      const yOffset = (h - rows * cellH) / 2;

      const indices = this.state.tiles.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      indices.forEach((tileIdx, cellIdx) => {
        const tile = this.state.tiles[tileIdx];
        if (tile.placed) return;
        const col = cellIdx % cols;
        const row = Math.floor(cellIdx / cols);
        const baseX = 10 + col * cellW + (cellW - tileW) / 2;
        const baseY = yOffset + row * cellH + (cellH - tileH) / 2;
        const jitterX = (Math.random() - 0.5) * Math.min(16, cellW - tileW);
        const jitterY = (Math.random() - 0.5) * Math.min(10, cellH - tileH);
        tile.x = baseX + jitterX;
        tile.y = baseY + jitterY;
        tile.el.style.left = tile.x + "px";
        tile.el.style.top = tile.y + "px";
        tile.el.style.transform = `rotate(${tile.rot}deg)`;
      });
    },

    bindDrag() {
      let dragging = null;
      let dragOffset = { x: 0, y: 0 };

      const onDown = (e) => {
        if (this.state.solved) return;
        const target = e.target.closest(".letter-tile");
        if (!target) return;
        const tileId = target.dataset.tileId;
        const tile = this.state.tiles.find((t) => t.id === tileId);
        if (!tile || tile.locked) return;

        e.preventDefault();
        dragging = tile;
        const rect = target.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;

        if (tile.placed) {
          const slotIndex = tile.slotIndex;
          delete this.state.placements[slotIndex];
          this.state.tileToSlot[tileId] = null;
          const slot = this.slotRow.querySelector(`[data-slot-index="${slotIndex}"]`);
          if (slot) {
            slot.classList.remove("filled");
            slot.querySelector(".scramble-slot-text").textContent = "";
          }
          tile.placed = false;
          tile.slotIndex = null;
          this.scatter.appendChild(tile.el);
        }

        tile.el.classList.add("dragging");
        tile.el.style.position = "fixed";
        tile.el.style.left = (e.clientX - dragOffset.x) + "px";
        tile.el.style.top = (e.clientY - dragOffset.y) + "px";

        try { target.setPointerCapture(e.pointerId); } catch (err) {}
      };

      const onMove = (e) => {
        if (!dragging) return;
        e.preventDefault();
        dragging.el.style.left = (e.clientX - dragOffset.x) + "px";
        dragging.el.style.top = (e.clientY - dragOffset.y) + "px";

        this.slotRow.querySelectorAll(".scramble-slot").forEach((s) => s.classList.remove("dragover"));
        const slot = this.slotUnderPoint(e.clientX, e.clientY);
        if (slot) {
          const idx = parseInt(slot.dataset.slotIndex, 10);
          if (!this.state.placements.hasOwnProperty(idx)) {
            slot.classList.add("dragover");
          }
        }
      };

      const onUp = (e) => {
        if (!dragging) return;
        const tile = dragging;
        dragging = null;

        this.slotRow.querySelectorAll(".scramble-slot").forEach((s) => s.classList.remove("dragover"));
        tile.el.classList.remove("dragging");

        const slot = this.slotUnderPoint(e.clientX, e.clientY);
        if (slot) {
          const slotIndex = parseInt(slot.dataset.slotIndex, 10);
          if (!this.state.placements.hasOwnProperty(slotIndex)) {
            this.placeTileInSlot(tile, slotIndex);
            return;
          }
        }
        this.returnToScatter(tile, e.clientX, e.clientY);
      };

      this.scatter.addEventListener("pointerdown", onDown);
      this.slotRow.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },

    slotUnderPoint(x, y) {
      const slots = this.slotRow.querySelectorAll(".scramble-slot:not(.space)");
      for (const s of slots) {
        const r = s.getBoundingClientRect();
        if (x >= r.left - 4 && x <= r.right + 4 && y >= r.top - 20 && y <= r.bottom + 20) {
          return s;
        }
      }
      return null;
    },

    placeTileInSlot(tile, slotIndex) {
      const slot = this.slotRow.querySelector(`[data-slot-index="${slotIndex}"]`);
      if (!slot) return;

      tile.placed = true;
      tile.slotIndex = slotIndex;
      this.state.placements[slotIndex] = tile.id;
      this.state.tileToSlot[tile.id] = slotIndex;

      slot.appendChild(tile.el);
      tile.el.style.position = "absolute";
      tile.el.style.left = "50%";
      tile.el.style.top = "50%";
      tile.el.style.transform = "translate(-50%, -50%) rotate(0deg)";
      tile.el.classList.add("placed");
      slot.classList.add("filled");

      if (tile.letter === TARGET[slotIndex]) {
        tile.locked = true;
        tile.el.classList.add("locked");
        slot.classList.add("locked");
      }

      this.checkSolved();
    },

    returnToScatter(tile, pointerX, pointerY) {
      this.scatter.appendChild(tile.el);
      tile.el.style.position = "absolute";
      const scatterRect = this.scatter.getBoundingClientRect();
      let x, y;
      if (pointerX >= scatterRect.left && pointerX <= scatterRect.right &&
          pointerY >= scatterRect.top && pointerY <= scatterRect.bottom) {
        x = pointerX - scatterRect.left - 23;
        y = pointerY - scatterRect.top - 27;
        tile.x = x;
        tile.y = y;
      } else {
        x = tile.x;
        y = tile.y;
      }
      tile.el.style.left = x + "px";
      tile.el.style.top = y + "px";
      tile.el.style.transform = `rotate(${tile.rot}deg)`;
    },

    checkSolved() {
      for (let i = 0; i < TARGET.length; i++) {
        if (i === LOCK_INDEX) continue;
        const tileId = this.state.placements[i];
        if (!tileId) return;
        const tile = this.state.tiles.find((t) => t.id === tileId);
        if (!tile || tile.letter !== TARGET[i]) return;
      }
      this.onSolved();
    },

    onSolved() {
      this.state.solved = true;
      this.scatter.style.transition = "opacity 0.8s";
      this.scatter.style.opacity = "0";
      setTimeout(() => { this.scatter.style.display = "none"; }, 900);

      this.success.innerHTML = "Pat Panackelty";
      this.success.classList.add("visible");

      setTimeout(() => {
        const hint = document.createElement("div");
        hint.className = "scramble-hint";
        hint.style.marginTop = "1rem";
        hint.innerHTML = "That's you.";
        this.success.parentElement.appendChild(hint);
      }, 2200);
    },
  };
})();
