// Maze game
// Two layouts (your sketch + a Claude-generated alternate) selectable via toggle.
// Difficulty: easy / normal / hard. Hard default.
// Chef moves toward frog via BFS, with corner-hesitation and period-based pacing.

(function () {
  const N = 13;

  const MAZE_YOURS = {
    H: [
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
    ],
    V: [
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
    ],
  };

  const MAZE_CLAUDE = {
    H: [[0,1,0,0,1,1,0,0,0,0,0,0,1],[1,0,0,1,0,1,0,1,1,0,1,1,0],[0,0,0,0,0,0,1,1,0,1,0,0,0],[0,0,0,0,1,0,1,0,0,0,0,0,0],[0,0,0,0,0,1,0,1,1,1,1,0,0],[0,1,0,0,1,0,1,1,0,1,0,0,0],[0,0,0,0,0,1,0,1,1,0,1,0,0],[1,0,0,1,0,0,0,0,1,1,0,0,0],[0,0,1,1,0,0,0,0,1,0,0,1,0],[0,1,0,0,0,1,1,0,1,0,0,0,1],[0,0,1,0,0,0,1,0,0,1,1,1,0],[0,0,1,1,0,1,1,1,0,0,0,0,0]],
    V: [[1,0,0,0,0,0,0,1,1,0,0,0],[0,1,0,0,0,1,1,0,1,1,0,0],[1,0,1,1,0,1,0,0,1,0,1,0],[1,1,1,0,1,0,0,0,0,1,1,0],[1,1,0,1,0,0,0,0,0,0,1,1],[0,1,0,0,1,0,0,1,0,0,1,1],[1,0,0,0,0,1,0,0,1,0,0,1],[0,1,0,0,0,1,1,0,0,0,0,1],[1,0,0,0,1,1,1,0,0,1,0,1],[0,0,1,0,1,0,1,0,1,1,1,0],[0,1,0,1,0,0,1,1,0,1,0,0],[1,1,0,0,1,0,0,1,1,0,1,0],[1,0,0,0,0,0,0,0,0,1,0,0]],
  };

  // Generate a random maze via DFS carving + extra openings.
  // Returns { H, V } in the same shape as the other mazes.
  function generateMaze() {
    // Walls present everywhere initially
    const H = Array.from({ length: N - 1 }, () => Array(N).fill(1));
    const V = Array.from({ length: N }, () => Array(N - 1).fill(1));
    const visited = Array.from({ length: N }, () => Array(N).fill(false));
    // Iterative DFS
    const stack = [{ r: 0, c: 0 }];
    visited[0][0] = true;
    while (stack.length) {
      const { r, c } = stack[stack.length - 1];
      const neighbours = [];
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < N && nc >= 0 && nc < N && !visited[nr][nc]) {
          neighbours.push({ nr, nc, dr, dc });
        }
      }
      if (neighbours.length === 0) { stack.pop(); continue; }
      const choice = neighbours[Math.floor(Math.random() * neighbours.length)];
      if (choice.dr === -1) H[choice.nr][choice.nc] = 0;
      else if (choice.dr === 1) H[r][c] = 0;
      else if (choice.dc === -1) V[choice.nr][choice.nc] = 0;
      else V[r][c] = 0;
      visited[choice.nr][choice.nc] = true;
      stack.push({ r: choice.nr, c: choice.nc });
    }
    // Knock out some random walls for multiple routes (~18% chance)
    for (let r = 0; r < N - 1; r++) {
      for (let c = 0; c < N; c++) {
        if (H[r][c] && Math.random() < 0.18) H[r][c] = 0;
      }
    }
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N - 1; c++) {
        if (V[r][c] && Math.random() < 0.18) V[r][c] = 0;
      }
    }
    // Guarantee exit approach: always open the wall between (N-2, N-1) and (N-1, N-1)
    // (i.e. the cell above the exit) AND between (N-1, N-2) and (N-1, N-1).
    // This ensures the exit is reachable from at least two directions.
    H[N - 2][N - 1] = 0;
    V[N - 1][N - 2] = 0;
    // Guarantee start (0, 0) has both neighbours open so Pat never feels trapped
    H[0][0] = 0;  // (0,0) - (1,0) open
    V[0][0] = 0;  // (0,0) - (0,1) open
    return { H, V };
  }

  const FROG_START = { r: 0, c: 0 };
  const CHEF_START = { r: 6, c: 0 };  // far enough that random mazes don't trap Pat immediately
  const GOAL = { r: N - 1, c: N - 1 };

  // Before the chef starts moving on each reset, give Pat this much time to orient.
  const GRACE_MS = 900;

  // Real-time chef: chef walks on a timer.
  //   stepMs: ms between chef steps (lower = faster, more dangerous)
  //   hesitate: chance he pauses when changing direction
  //   stumble: random chance he skips a step regardless
  //   random: chance he makes a random adjacent step instead of BFS-optimal
  const DIFFICULTY = {
    easy:   { stepMs: 900, hesitate: 0.50, stumble: 0.30, random: 0.35 },
    normal: { stepMs: 600, hesitate: 0.30, stumble: 0.18, random: 0.18 },
    hard:   { stepMs: 380, hesitate: 0.12, stumble: 0.08, random: 0.06 },
  };

  function canMove(maze, r, c, dr, dc) {
    const { H, V } = maze;
    if (dr === -1 && dc === 0) return r > 0 && !H[r - 1][c];
    if (dr === 1 && dc === 0) return r < N - 1 && !H[r][c];
    if (dr === 0 && dc === -1) return c > 0 && !V[r][c - 1];
    if (dr === 0 && dc === 1) return c < N - 1 && !V[r][c];
    return false;
  }

  function nextStepToward(maze, start, goal) {
    if (start.r === goal.r && start.c === goal.c) return null;
    const visited = Array(N).fill(0).map(() => Array(N).fill(null));
    visited[start.r][start.c] = { r: start.r, c: start.c };
    const q = [start];
    let head = 0;
    while (head < q.length) {
      const cur = q[head++];
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nr = cur.r + dr, nc = cur.c + dc;
        if (nr < 0 || nr >= N || nc < 0 || nc >= N) continue;
        if (visited[nr][nc]) continue;
        if (!canMove(maze, cur.r, cur.c, dr, dc)) continue;
        visited[nr][nc] = cur;
        if (nr === goal.r && nc === goal.c) {
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
        <div class="maze-controls">
          <div class="maze-control-group">
            <span class="maze-control-label">maze:</span>
            <button class="maze-ctrl-btn" data-maze="yours">yours</button>
            <button class="maze-ctrl-btn" data-maze="claude">alt</button>
            <button class="maze-ctrl-btn active" data-maze="random">random</button>
          </div>
          <div class="maze-control-group">
            <span class="maze-control-label">difficulty:</span>
            <button class="maze-ctrl-btn" data-diff="easy">easy</button>
            <button class="maze-ctrl-btn" data-diff="normal">normal</button>
            <button class="maze-ctrl-btn active" data-diff="hard">hard</button>
          </div>
        </div>
        <div class="maze-status">
          <span class="maze-status-text" id="maze-status-text">Hop to the far corner.</span>
          <button class="maze-restart" id="maze-restart" style="display:none;">start again</button>
        </div>
        <div class="maze-board-wrap" id="maze-board-wrap">
          <canvas class="maze-canvas" id="maze-canvas"></canvas>
        </div>
        <p class="maze-hint">Arrow keys or tap a direction near Pat. The chef is slower. Don't get caught.</p>
      `;
      el.appendChild(game);

      this.canvas = game.querySelector("#maze-canvas");
      this.wrap = game.querySelector("#maze-board-wrap");
      this.statusText = game.querySelector("#maze-status-text");
      this.restartBtn = game.querySelector("#maze-restart");
      this.ctx = this.canvas.getContext("2d");

      this.activeMazeKey = "random";
      this.activeMaze = MAZE_YOURS;  // placeholder; reset() will regenerate
      this.difficulty = DIFFICULTY.hard;
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

      // Stop the chef timer when navigating away from this chapter;
      // restart it when coming back (only if not already complete/caught).
      window.addEventListener("chapterChange", (e) => {
        const chId = e.detail && e.detail.chapter && e.detail.chapter.id;
        if (chId === "queen") {
          // Restart loop if the game is still active
          if (this.state && !this.state.complete && !this.state.caught && !this._chefRaf) {
            this._chefLastStepAt = performance.now();
            this.startChefLoop();
          }
        } else {
          this.stopChefLoop();
        }
      });

      game.querySelectorAll("[data-maze]").forEach((b) => {
        b.addEventListener("click", () => {
          game.querySelectorAll("[data-maze]").forEach((x) => x.classList.remove("active"));
          b.classList.add("active");
          this.activeMazeKey = b.dataset.maze;
          this.reset();
        });
      });
      game.querySelectorAll("[data-diff]").forEach((b) => {
        b.addEventListener("click", () => {
          game.querySelectorAll("[data-diff]").forEach((x) => x.classList.remove("active"));
          b.classList.add("active");
          this.difficulty = DIFFICULTY[b.dataset.diff];
          this.reset();
        });
      });
    },

    reset() {
      this.stopChefLoop();
      // Choose active maze based on toggle; random regenerates every reset
      if (this.activeMazeKey === "claude") this.activeMaze = MAZE_CLAUDE;
      else if (this.activeMazeKey === "random") this.activeMaze = generateMaze();
      else this.activeMaze = MAZE_YOURS;

      this.state = {
        frog: { ...FROG_START },
        chef: { ...CHEF_START },
        complete: false,
        caught: false,
        chefFacing: "left", // initial direction
        frogFacing: "left",
      };
      this.statusText.textContent = "Hop to the far corner.";
      this.statusText.style.color = "";
      this.restartBtn.style.display = "none";
      this.draw();
      this.startChefLoop();
    },

    startChefLoop() {
      // Give Pat a grace period before the chef starts
      this._chefLastStepAt = performance.now() + GRACE_MS - this.difficulty.stepMs;
      const tick = () => {
        if (!this.state || this.state.complete || this.state.caught) {
          this._chefRaf = null;
          return;
        }
        const now = performance.now();
        if (now - this._chefLastStepAt >= this.difficulty.stepMs) {
          this._chefLastStepAt = now;
          this.chefStep();
        }
        // Redraw every frame so the chef (and any frog animation) glide
        // between cells instead of jumping discretely.
        this.draw();
        this._chefRaf = requestAnimationFrame(tick);
      };
      this._chefRaf = requestAnimationFrame(tick);
    },

    stopChefLoop() {
      if (this._chefRaf) {
        cancelAnimationFrame(this._chefRaf);
        this._chefRaf = null;
      }
    },

    chefStep() {
      if (Math.random() < this.difficulty.stumble) return;

      let step;
      // Sometimes the chef makes a random move instead of optimal BFS
      if (Math.random() < this.difficulty.random) {
        const opts = [];
        const ch = this.state.chef;
        for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
          if (canMove(this.activeMaze, ch.r, ch.c, dr, dc)) {
            opts.push({ r: ch.r + dr, c: ch.c + dc });
          }
        }
        if (opts.length === 0) return;
        step = opts[Math.floor(Math.random() * opts.length)];
      } else {
        step = nextStepToward(this.activeMaze, this.state.chef, this.state.frog);
        if (!step) return;
      }

      if (this.state._lastChefDir) {
        const newDir = [step.r - this.state.chef.r, step.c - this.state.chef.c];
        if (newDir[0] !== this.state._lastChefDir[0] || newDir[1] !== this.state._lastChefDir[1]) {
          if (Math.random() < this.difficulty.hesitate) return;
        }
      }
      this.state._lastChefDir = [step.r - this.state.chef.r, step.c - this.state.chef.c];
      // Only update facing on horizontal moves
      const dc = step.c - this.state.chef.c;
      if (dc === 1) this.state.chefFacing = "right";
      else if (dc === -1) this.state.chefFacing = "left";
      // Start a glide animation from the current logical position to the new one.
      // Duration slightly shorter than stepMs so the chef settles briefly before
      // the next step instead of colliding with it.
      this.state.chefAnim = {
        fromR: this.state.chef.r,
        fromC: this.state.chef.c,
        toR: step.r,
        toC: step.c,
        startAt: performance.now(),
        durMs: Math.max(120, this.difficulty.stepMs * 0.85),
      };
      this.state.chef = step;
      this.checkEndConditions();
    },

    resize() {
      const rect = this.wrap.getBoundingClientRect();
      let w = rect.width;
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

      ctx.clearRect(0, 0, s, s);

      // Goal tile highlight (warm cream, brighter than paper)
      ctx.fillStyle = "rgba(201, 155, 60, 0.18)";
      ctx.fillRect(GOAL.c * cell, GOAL.r * cell, cell, cell);

      const { H, V } = this.activeMaze;
      ctx.strokeStyle = "#4a6b3a";
      ctx.lineWidth = Math.max(2, cell * 0.12);
      ctx.lineCap = "round";

      // Outer border - but leave a gap at the goal cell (right edge and bottom edge)
      const bw = ctx.lineWidth;
      // top
      ctx.beginPath();
      ctx.moveTo(bw / 2, bw / 2);
      ctx.lineTo(s - bw / 2, bw / 2);
      ctx.stroke();
      // left
      ctx.beginPath();
      ctx.moveTo(bw / 2, bw / 2);
      ctx.lineTo(bw / 2, s - bw / 2);
      ctx.stroke();
      // right - skip the goal cell portion
      ctx.beginPath();
      ctx.moveTo(s - bw / 2, bw / 2);
      ctx.lineTo(s - bw / 2, GOAL.r * cell);
      ctx.stroke();
      // bottom - skip the goal cell portion
      ctx.beginPath();
      ctx.moveTo(bw / 2, s - bw / 2);
      ctx.lineTo(GOAL.c * cell, s - bw / 2);
      ctx.stroke();

      for (let r = 0; r < N - 1; r++) {
        for (let c = 0; c < N; c++) {
          if (H[r][c]) {
            ctx.beginPath();
            ctx.moveTo(c * cell, (r + 1) * cell);
            ctx.lineTo((c + 1) * cell, (r + 1) * cell);
            ctx.stroke();
          }
        }
      }
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N - 1; c++) {
          if (V[r][c]) {
            ctx.beginPath();
            ctx.moveTo((c + 1) * cell, r * cell);
            ctx.lineTo((c + 1) * cell, (r + 1) * cell);
            ctx.stroke();
          }
        }
      }

      // Compute a shared pixel scale so the frog and chef are rendered
      // at the same source-pixel-to-screen-pixel ratio. The chef is the
      // "reference" sprite: we size it so its larger dimension ~fills 90%
      // of a cell, then apply the same scale to the frog. This makes the
      // frog appear smaller (since it has fewer source pixels) while the
      // pixels themselves are the same on-screen size for both sprites.
      const chefMax = Math.max(this.chefImg.width, this.chefImg.height);
      const pixelScale = (cell * 0.90) / chefMax;
      // Crisp pixel-art rendering for both sprites
      ctx.imageSmoothingEnabled = false;

      // Frog - drawn with horizontal flip based on facing
      const f = this.state.frog;
      // Use interpolated position if an animation is running
      const fPos = this.state.frogAnim
        ? this.interpPos(this.state.frogAnim)
        : { r: f.r, c: f.c };
      const fx = (fPos.c + 0.5) * cell;
      const fy = (fPos.r + 0.5) * cell;
      const fw = this.frogImg.width * pixelScale;
      const fh = this.frogImg.height * pixelScale;
      this.drawSprite(this.frogImg, fx, fy, fw, fh, this.state.frogFacing);

      // Chef
      const ch = this.state.chef;
      const chPos = this.state.chefAnim
        ? this.interpPos(this.state.chefAnim)
        : { r: ch.r, c: ch.c };
      const cx = (chPos.c + 0.5) * cell;
      const cy = (chPos.r + 0.5) * cell;
      const chw = this.chefImg.width * pixelScale;
      const chh = this.chefImg.height * pixelScale;
      this.drawSprite(this.chefImg, cx, cy, chw, chh, this.state.chefFacing);
    },

    // Given an animation descriptor { fromR, fromC, toR, toC, startAt, durMs },
    // return the current interpolated { r, c } position (eased).
    interpPos(anim) {
      const now = performance.now();
      const t = Math.max(0, Math.min(1, (now - anim.startAt) / anim.durMs));
      // Ease out cubic — feels springier at the start, settles softly
      const e = 1 - Math.pow(1 - t, 3);
      return {
        r: anim.fromR + (anim.toR - anim.fromR) * e,
        c: anim.fromC + (anim.toC - anim.fromC) * e,
      };
    },

    // Draw a sprite centered at (cx, cy) with size (w, h), flipped horizontally if facing "right"
    // (sprites are drawn facing left by default)
    drawSprite(img, cx, cy, w, h, facing) {
      const ctx = this.ctx;
      ctx.save();
      if (facing === "right") {
        ctx.translate(cx, cy);
        ctx.scale(-1, 1);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      } else {
        ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
      }
      ctx.restore();
    },

    moveFrog(dr, dc) {
      if (!this.state || this.state.complete || this.state.caught) return;
      const f = this.state.frog;
      if (!canMove(this.activeMaze, f.r, f.c, dr, dc)) return;
      f.r += dr;
      f.c += dc;
      // Only update facing on horizontal moves; keep last direction for vertical moves
      if (dc === 1) this.state.frogFacing = "right";
      else if (dc === -1) this.state.frogFacing = "left";
      // Frog moves in discrete steps — no animation.
      this.state.frogAnim = null;
      this.draw();
      this.checkEndConditions();
    },

    // Legacy method kept for clarity — no longer called
    moveChef() {
      this.chefStep();
    },

    checkEndConditions() {
      const f = this.state.frog;
      const ch = this.state.chef;
      if (f.r === GOAL.r && f.c === GOAL.c) {
        this.state.complete = true;
        this.stopChefLoop();
        this.statusText.textContent = "You made it to Red.";
        this.statusText.style.color = "var(--forest)";
        this.restartBtn.style.display = "inline-block";
        this.restartBtn.textContent = "play again";
        // Reveal the post-maze text
        const locked = document.getElementById("queen-after-maze");
        if (locked) {
          locked.classList.add("revealed");
          locked.setAttribute("aria-hidden", "false");
          // Give the CSS transition a beat, then smooth-scroll down so the reader
          // sees the new text appear below the maze.
          setTimeout(() => {
            locked.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 1200);
        }
        // Unblock chapter-forward nav
        window.dispatchEvent(new CustomEvent("mazeWon"));
        return;
      }
      if (f.r === ch.r && f.c === ch.c) {
        this.state.caught = true;
        this.stopChefLoop();
        this.statusText.textContent = "Caught! The chef grabs you...";
        this.statusText.style.color = "var(--accent)";
        this.restartBtn.style.display = "inline-block";
        this.restartBtn.textContent = "try again";
        setTimeout(() => { if (this.state.caught) this.reset(); }, 1600);
      }
    },

    bindControls() {
      const handler = (e) => {
        // Only claim arrow keys — other keys should bubble normally
        if (e.key !== "ArrowUp" && e.key !== "ArrowDown" &&
            e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        // If the maze chapter isn't visible on screen, let arrows bubble
        const rect = this.wrap.getBoundingClientRect();
        if (rect.top >= window.innerHeight || rect.bottom <= 0) return;
        // Always swallow arrow keys while the maze is on screen, so a
        // late keypress right after getting caught (or right after winning)
        // can't sneak past and nav to another chapter.
        e.preventDefault();
        e.stopPropagation();
        if (!this.state || this.state.complete || this.state.caught) return;
        let dr = 0, dc = 0;
        if (e.key === "ArrowUp") dr = -1;
        else if (e.key === "ArrowDown") dr = 1;
        else if (e.key === "ArrowLeft") dc = -1;
        else if (e.key === "ArrowRight") dc = 1;
        this.moveFrog(dr, dc);
      };
      window.addEventListener("keydown", handler, true);

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
        if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
        if (Math.abs(dx) > Math.abs(dy)) this.moveFrog(0, Math.sign(dx));
        else this.moveFrog(Math.sign(dy), 0);
        touchStart = null;
      }, { passive: true });
    },
  };
})();
