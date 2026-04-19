// Forest walk game - Day 3
// Grid-based top-down walk on the hand-drawn forest board.
// 14 cols × 10 rows. Pat enters at (0, 4), reaches van door at (13, 1).
// Two fog-of-war modes: "discrete" (default) and "flashlight".

(function () {
  const COLS = 14;
  const ROWS = 10;
  const START = { c: 0, r: 4 };
  const GOAL = { c: 13, r: 1 };
  const FLASHLIGHT_RADIUS = 2.3;

  // Obstacles (drawn items Pat can't cross). Hand-mapped from the board image.
  const OBSTACLES = new Set([
    // Van top-right
    "6,0","7,0","8,0","9,0","10,0","11,0","12,0","13,0",
    "7,1","8,1","9,1","10,1","11,1",  // body + wheels (keep (13,1) open as door)
    // Monkey creature left-upper
    "3,1","3,2",
    // Potted plant top-right
    "11,2","12,2",
    // Bathtub center
    "5,3","6,3","7,3",
    // Bushes bottom-right
    "9,8","10,8","8,8",
    "10,9","11,9","9,9",
    // Acorn + cat cluster
    "12,8","12,9",
    "13,9",
  ]);

  function key(c, r) { return c + "," + r; }
  function isObstacle(c, r) { return OBSTACLES.has(key(c, r)); }
  function inBounds(c, r) { return c >= 0 && c < COLS && r >= 0 && r < ROWS; }

  window.ForestGame = {
    mount(el) {
      el.innerHTML = "";
      const game = document.createElement("div");
      game.className = "forest-game";
      game.innerHTML = `
        <div class="forest-controls">
          <span class="forest-mode-label">fog of war:</span>
          <button class="forest-mode-btn active" data-mode="discrete">hex reveal</button>
          <button class="forest-mode-btn" data-mode="flashlight">flashlight</button>
        </div>
        <div class="forest-board-wrap" id="forest-board-wrap">
          <img class="forest-board-img" src="assets/board.jpg" alt="" draggable="false">
          <canvas class="forest-fog" id="forest-fog"></canvas>
          <img class="forest-pat" src="assets/pat.png" alt="Pat" draggable="false" id="forest-pat">
        </div>
        <p class="forest-hint">Arrow keys or tap to move. Find the van.</p>
        <div class="forest-complete" id="forest-complete"></div>
      `;
      el.appendChild(game);

      this.wrap = game.querySelector("#forest-board-wrap");
      this.fog = game.querySelector("#forest-fog");
      this.pat = game.querySelector("#forest-pat");
      this.completeMsg = game.querySelector("#forest-complete");
      this.img = this.wrap.querySelector(".forest-board-img");

      this.state = {
        pat: { ...START },
        visited: new Set([key(START.c, START.r)]),
        mode: "discrete",
        complete: false,
      };

      this.img.addEventListener("load", () => this.resizeAndRender());
      if (this.img.complete) this.resizeAndRender();
      window.addEventListener("resize", () => this.resizeAndRender());

      game.querySelectorAll(".forest-mode-btn").forEach((b) => {
        b.addEventListener("click", () => {
          game.querySelectorAll(".forest-mode-btn").forEach((x) => x.classList.remove("active"));
          b.classList.add("active");
          this.state.mode = b.dataset.mode;
          this.renderFog();
        });
      });

      this.bindControls();
    },

    resizeAndRender() {
      const w = this.img.clientWidth;
      const h = this.img.clientHeight;
      if (!w || w < 20 || !h || h < 20) {
        requestAnimationFrame(() => this.resizeAndRender());
        return;
      }
      const dpr = window.devicePixelRatio || 1;
      this.fog.width = w * dpr;
      this.fog.height = h * dpr;
      this.fog.style.width = w + "px";
      this.fog.style.height = h + "px";
      const ctx = this.fog.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.cellW = w / COLS;
      this.cellH = h / ROWS;
      this.renderPat();
      this.renderFog();
    },

    renderPat() {
      if (!this.cellW || !isFinite(this.cellW)) return;
      const x = (this.state.pat.c + 0.5) * this.cellW;
      const y = (this.state.pat.r + 0.5) * this.cellH;
      this.pat.style.left = x + "px";
      this.pat.style.top = y + "px";
      this.pat.style.width = (this.cellW * 0.85) + "px";
    },

    renderFog() {
      if (!this.cellW || !isFinite(this.cellW)) return;
      const w = this.fog.clientWidth;
      const h = this.fog.clientHeight;
      if (!w || !h) return;
      const ctx = this.fog.getContext("2d");
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(30, 24, 16, 0.82)";
      ctx.fillRect(0, 0, w, h);
      if (this.state.mode === "discrete") this.renderDiscreteFog(ctx);
      else this.renderFlashlightFog(ctx);
    },

    renderDiscreteFog(ctx) {
      const pat = this.state.pat;
      const vis = {};
      vis[key(pat.c, pat.r)] = 1.0;
      [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dc, dr]) => {
        const nc = pat.c + dc, nr = pat.r + dr;
        if (inBounds(nc, nr)) vis[key(nc, nr)] = 1.0;
      });
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dc, dr]) => {
        const nc = pat.c + dc, nr = pat.r + dr;
        if (inBounds(nc, nr)) vis[key(nc, nr)] = 0.5;
      });
      this.state.visited.forEach((k) => {
        if (vis[k] === undefined) vis[k] = 0.2;
      });
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      for (const k in vis) {
        const [c, r] = k.split(",").map(Number);
        const alpha = vis[k];
        const cx = (c + 0.5) * this.cellW;
        const cy = (r + 0.5) * this.cellH;
        ctx.globalAlpha = alpha;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, this.cellW * 0.7);
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(0.65, "rgba(0,0,0,0.9)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(cx - this.cellW, cy - this.cellH, this.cellW * 2, this.cellH * 2);
      }
      ctx.restore();
    },

    renderFlashlightFog(ctx) {
      const pat = this.state.pat;
      const cx = (pat.c + 0.5) * this.cellW;
      const cy = (pat.r + 0.5) * this.cellH;
      const radius = FLASHLIGHT_RADIUS * Math.min(this.cellW, this.cellH);
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      this.state.visited.forEach((k) => {
        const [c, r] = k.split(",").map(Number);
        const x = (c + 0.5) * this.cellW;
        const y = (r + 0.5) * this.cellH;
        ctx.globalAlpha = 0.2;
        const g = ctx.createRadialGradient(x, y, 0, x, y, this.cellW * 0.7);
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x - this.cellW, y - this.cellH, this.cellW * 2, this.cellH * 2);
      });
      ctx.globalAlpha = 1;
      const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      g2.addColorStop(0, "rgba(0,0,0,1)");
      g2.addColorStop(0.3, "rgba(0,0,0,0.95)");
      g2.addColorStop(0.7, "rgba(0,0,0,0.4)");
      g2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g2;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      ctx.restore();
    },

    move(dc, dr) {
      if (this.state.complete) return;
      const nc = this.state.pat.c + dc;
      const nr = this.state.pat.r + dr;
      if (!inBounds(nc, nr)) return;
      if (isObstacle(nc, nr)) return;
      this.state.pat.c = nc;
      this.state.pat.r = nr;
      this.state.visited.add(key(nc, nr));
      this.renderPat();
      this.renderFog();
      if (nc === GOAL.c && nr === GOAL.r) this.onComplete();
    },

    bindControls() {
      const handler = (e) => {
        if (this.state.complete) return;
        const rect = this.wrap.getBoundingClientRect();
        if (rect.top >= window.innerHeight || rect.bottom <= 0) return;
        let dx = 0, dy = 0;
        if (e.key === "ArrowUp") dy = -1;
        else if (e.key === "ArrowDown") dy = 1;
        else if (e.key === "ArrowLeft") dx = -1;
        else if (e.key === "ArrowRight") dx = 1;
        else return;
        e.preventDefault();
        e.stopPropagation();
        this.move(dx, dy);
      };
      window.addEventListener("keydown", handler, true);

      this.wrap.addEventListener("pointerdown", (e) => {
        if (this.state.complete) return;
        const rect = this.wrap.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const c = Math.floor(x / this.cellW);
        const r = Math.floor(y / this.cellH);
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
      this.fog.style.transition = "opacity 1.2s";
      this.fog.style.opacity = "0";
      setTimeout(() => {
        this.completeMsg.textContent = "The bus. And the smell of something smoky.";
        this.completeMsg.classList.add("visible");
      }, 900);
    },
  };
})();
