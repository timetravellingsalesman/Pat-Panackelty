// Maze game - Day 3
// 13×13 hedge maze traced from your sketch. Frog (Pat) enters top-left,
// Chef chases from behind. Goal: reach the exit (bottom-right corner, where
// Red is waiting on the other side of the river).
// Chef moves via BFS toward frog, but slower — with corner slowdown so
// the chase feels fair.

(function () {
  const N = 13;
  // Walls: H_WALLS[r][c] = wall between cell (r,c) and (r+1,c)
  //        V_WALLS[r][c] = wall between cell (r,c) and (r,c+1)
  // Traced from maze_source.png
  const H_WALLS = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,1,0,1,0,1,0,0,0],
    [0,1,1,0,1,1,1,1,1,0,1,1,0],
    [1,1,0,1,1,1,1,1,1,1,0,0,1],
    [0,1,1,1,0,1,0,0,1,1,0,1,1],
    [1,1,0,0,1,1,1,0,1,1,1,0,0],
    [0,1,0,0,0,1,0,1,1,1,1,1,0],
    [0,1,0,0,0,0,0,0,1,1,0,1,0],
    [0,0,1,1,0,1,0,0,0,0,1,0,0],
    [0,1,1,1,1,0,0,0,0,1,1,1,0],
    [1,0,0,0,0,0,1,1,0,0,1,0,0],
  ];
  const V_WALLS = [
    [0,0,1,1,0,0,1,0,1,0,1,0],
    [0,0,1,0,1,0,1,1,0,0,1,0],
    [0,0,0,0,0,1,0,1,1,0,1,1],
    [0,0,1,0,0,0,1,0,0,1,0,0],
    [0,0,0,0,0,0,0,0,0,1,0,0],
    [0,0,0,1,0,0,1,0,0,1,1,0],
    [0,0,1,0,1,0,1,0,0,0,1,0],
    [0,0,1,1,0,0,1,0,0,0,0,1],
    [0,0,1,1,1,1,1,0,0,0,1,0],
    [0,0,0,1,0,1,1,1,0,1,0,1],
    [0,0,0,0,1,1,1,1,1,0,0,1],
    [0,0,0,1,0,1,0,1,1,0,0,1],
    [0,0,1,0,1,1,0,0,1,0,1,0],
  ];

  const FROG_START = { r: 0, c: 0 };
  const CHEF_START = { r: 2, c: 0 };  // starts a few cells away
  const GOAL = { r: N - 1, c: N - 1 };

  // How many frog moves per chef move. Higher = frog has more advantage.
  // On each chef-turn, the chef may also "hesitate" on corners (see below).
  const CHEF_PERIOD = 3; // chef tries to move every 3 frog moves
  const CHEF_CORNER_HESITATE = 0.5; // chance he stops for a beat on a turn

  function canMove(r, c, dr, dc) {
    if (dr === -1 && dc === 0) {
      if (r === 0) return false;
      return !H_WALLS[r - 1][c];
    }
    if (dr === 1 && dc === 0) {
      if (r === N - 1) return false;
      return !H_WALLS[r][c];
    }
    if (dr === 0 && dc === -1) {
      if (c === 0) return false;
      return !V_WALLS[r][c - 1];
    }
    if (dr === 0 && dc === 1) {
      if (c === N - 1) return false;
      return !V_WALLS[r][c];
    }
    return false;
  }

  // BFS from start to goal; returns next step toward goal
  function nextStepToward(start, goal) {
    if (start.r === goal.r && start.c === goal.c) return null;
    const visited = Array(N).fill(0).map(() => Array(N).fill(null));
    visited[start.r][start.c] = { r: start.r, c: start.c }; // self
    const q = [start];
    let head = 0;
    while (head < q.length) {
      const cur = q[head++];
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nr = cur.r + dr, nc = cur.c + dc;
        if (nr < 0 || nr >= N || nc < 0 || nc >= N) continue;
        if (visited[nr][nc]) continue;
        if (!canMove(cur.r, cur.c, dr, dc)) continue;
        visited[nr][nc] = cur;
        if (nr === goal.r && nc === goal.c) {
          // Walk back
          let node = { r: nr, c: nc };
          while (visited[node.r][node.c].r !== start.r || visited[node.r][node.c].c !== start.c) {
            node = visited[node.r][node.c];
          }
          return node;
        }
        q.push({ r: nr, c: nc });
      }
    }
    return null;
  }

  window.MazeGame = {
    mount(el) {
      el.innerHTML = "";
      const game = document.createElement("div");
      game.className = "maze-game";
      game.innerHTML = `
        <div class="maze-status">
          <span class="maze-status-text" id="maze-status-text">The hedge maze. Hop to the far corner.</span>
          <button class="maze-restart" id="maze-restart" style="display:none;">start again</button>
        </div>
        <div class="maze-board-wrap" id="maze-board-wrap">
          <canvas class="maze-canvas" id="maze-canvas"></canvas>
        </div>
        <p class="maze-hint">Arrow keys or tap a direction near Pat to hop. The chef is slower. Don't get caught.</p>
      `;
      el.appendChild(game);

      this.canvas = game.querySelector("#maze-canvas");
      this.wrap = game.querySelector("#maze-board-wrap");
      this.statusText = game.querySelector("#maze-status-text");
      this.restartBtn = game.querySelector("#maze-restart");
      this.ctx = this.canvas.getContext("2d");

      this.state = null;
      this.frogImg = new Image();
      this.frogImg.src = "assets/frog.png";
      this.chefImg = new Image();
      this.chefImg.src = "assets/chef.png";
      let loaded = 0;
      const onload = () => {
        loaded++;
        if (loaded === 2) {
          this.reset();
          this.resize();
          this.bindControls();
        }
      };
      this.frogImg.onload = onload;
      this.chefImg.onload = onload;
      if (this.frogImg.complete) onload();
      if (this.chefImg.complete) onload();

      window.addEventListener("resize", () => this.resize());
      this.restartBtn.addEventListener("click", () => this.reset());
    },

    reset() {
      this.state = {
        frog: { ...FROG_START },
        chef: { ...CHEF_START },
        moveCount: 0,
        complete: false,
        caught: false,
      };
      this.statusText.textContent = "The hedge maze. Hop to the far corner.";
      this.statusText.style.color = "";
      this.restartBtn.style.display = "none";
      this.draw();
    },

    resize() {
      const rect = this.wrap.getBoundingClientRect();
      let w = rect.width;
      // If the wrap has no width yet (layout not done), retry shortly.
      if (!w || w < 20) {
        requestAnimationFrame(() => this.resize());
        return;
      }
      w = Math.min(w, 520);
      const size = Math.min(w, window.innerHeight * 0.7);
      const dpr = window.devicePixelRatio || 1;
      this.canvas.style.width = size + "px";
      this.canvas.style.height = size + "px";
      this.canvas.width = size * dpr;
      this.canvas.height = size * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.cell = size / N;
      this.size = size;
      if (this.state) this.draw();
    },

    draw() {
      const ctx = this.ctx;
      const s = this.size;
      const cell = this.cell;
      if (!ctx || !cell) return;
      // Background - soft cream
      ctx.fillStyle = "#f5eedc";
      ctx.fillRect(0, 0, s, s);
      // Goal tile highlight
      ctx.fillStyle = "rgba(201, 155, 60, 0.3)"; // gold tint
      ctx.fillRect(GOAL.c * cell, GOAL.r * cell, cell, cell);

      // Walls
      ctx.strokeStyle = "#4a6b3a"; // forest green for hedge
      ctx.lineWidth = Math.max(2, cell * 0.12);
      ctx.lineCap = "round";

      // Outer border
      ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, s - ctx.lineWidth, s - ctx.lineWidth);

      // Horizontal walls
      for (let r = 0; r < N - 1; r++) {
        for (let c = 0; c < N; c++) {
          if (H_WALLS[r][c]) {
            ctx.beginPath();
            ctx.moveTo(c * cell, (r + 1) * cell);
            ctx.lineTo((c + 1) * cell, (r + 1) * cell);
            ctx.stroke();
          }
        }
      }
      // Vertical walls
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N - 1; c++) {
          if (V_WALLS[r][c]) {
            ctx.beginPath();
            ctx.moveTo((c + 1) * cell, r * cell);
            ctx.lineTo((c + 1) * cell, (r + 1) * cell);
            ctx.stroke();
          }
        }
      }

      // Goal decoration - a little gold dot / orb
      ctx.fillStyle = "#c89b3c";
      ctx.beginPath();
      ctx.arc((GOAL.c + 0.5) * cell, (GOAL.r + 0.5) * cell, cell * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Frog
      const f = this.state.frog;
      const fx = (f.c + 0.5) * cell;
      const fy = (f.r + 0.5) * cell;
      const spriteSize = cell * 0.75;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(this.frogImg, fx - spriteSize / 2, fy - spriteSize / 2, spriteSize, spriteSize);

      // Chef
      const ch = this.state.chef;
      const cx = (ch.c + 0.5) * cell;
      const cy = (ch.r + 0.5) * cell;
      const chefSize = cell * 0.85;
      ctx.drawImage(this.chefImg, cx - chefSize / 2, cy - chefSize * 0.6, chefSize * (22 / 33), chefSize);
    },

    moveFrog(dr, dc) {
      if (this.state.complete || this.state.caught) return;
      const f = this.state.frog;
      if (!canMove(f.r, f.c, dr, dc)) return;
      f.r += dr;
      f.c += dc;
      this.state.moveCount++;
      // Chef moves every CHEF_PERIOD frog moves
      if (this.state.moveCount % CHEF_PERIOD === 0) {
        this.moveChef();
      }
      this.draw();
      this.checkEndConditions();
    },

    moveChef() {
      const step = nextStepToward(this.state.chef, this.state.frog);
      if (!step) return;
      // Corner slowdown: if the chef's next move changes direction from his
      // last move, there's a chance he hesitates (doesn't move this turn).
      if (this.state._lastChefDir) {
        const newDir = [step.r - this.state.chef.r, step.c - this.state.chef.c];
        if (newDir[0] !== this.state._lastChefDir[0] || newDir[1] !== this.state._lastChefDir[1]) {
          if (Math.random() < CHEF_CORNER_HESITATE) {
            // Hesitate on corner
            return;
          }
        }
      }
      this.state._lastChefDir = [step.r - this.state.chef.r, step.c - this.state.chef.c];
      this.state.chef = step;
    },

    checkEndConditions() {
      const f = this.state.frog;
      const ch = this.state.chef;
      if (f.r === GOAL.r && f.c === GOAL.c) {
        this.state.complete = true;
        this.statusText.textContent = "You made it to Red.";
        this.statusText.style.color = "var(--forest)";
        this.restartBtn.style.display = "inline-block";
        this.restartBtn.textContent = "play again";
        return;
      }
      if (f.r === ch.r && f.c === ch.c) {
        this.state.caught = true;
        this.statusText.textContent = "Caught! The chef grabs you...";
        this.statusText.style.color = "var(--accent)";
        this.restartBtn.style.display = "inline-block";
        this.restartBtn.textContent = "try again";
        setTimeout(() => {
          if (this.state.caught) this.reset();
        }, 1600);
      }
    },

    bindControls() {
      const handler = (e) => {
        if (!this.state || this.state.complete || this.state.caught) return;
        const rect = this.wrap.getBoundingClientRect();
        if (rect.top >= window.innerHeight || rect.bottom <= 0) return;
        let dr = 0, dc = 0;
        if (e.key === "ArrowUp") dr = -1;
        else if (e.key === "ArrowDown") dr = 1;
        else if (e.key === "ArrowLeft") dc = -1;
        else if (e.key === "ArrowRight") dc = 1;
        else return;
        e.preventDefault();
        e.stopPropagation();
        this.moveFrog(dr, dc);
      };
      window.addEventListener("keydown", handler, true);

      // Touch: tap adjacent cell or any cell - move toward it 1 step
      this.canvas.addEventListener("pointerdown", (e) => {
        if (!this.state || this.state.complete || this.state.caught) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const c = Math.floor(x / (rect.width / N));
        const r = Math.floor(y / (rect.height / N));
        const dc = c - this.state.frog.c;
        const dr = r - this.state.frog.r;
        if (Math.abs(dr) > Math.abs(dc)) this.moveFrog(Math.sign(dr), 0);
        else if (dc !== 0) this.moveFrog(0, Math.sign(dc));
      });

      // Swipe support for mobile
      let touchStart = null;
      this.canvas.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
          touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
      }, { passive: true });
      this.canvas.addEventListener("touchend", (e) => {
        if (!touchStart || !e.changedTouches[0]) return;
        const dx = e.changedTouches[0].clientX - touchStart.x;
        const dy = e.changedTouches[0].clientY - touchStart.y;
        if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return; // was a tap, not swipe
        if (Math.abs(dx) > Math.abs(dy)) {
          this.moveFrog(0, Math.sign(dx));
        } else {
          this.moveFrog(Math.sign(dy), 0);
        }
        touchStart = null;
      }, { passive: true });
    },
  };
})();
