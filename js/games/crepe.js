// Crêpe catching mini-game for the Chef de Palais chapter.
// 3-lane Nu-Pogodi-style: the chef tosses pancakes from above, Pat moves
// left/right with her pan to catch them. Multiple pancakes in flight.
//
// Win: 8 catches. Fail: 3 splats → wholesome restart prompt.

(function () {
  const LANES = 3;
  const CATCH_GOAL = 8;
  const MAX_SPLATS = 3;
  const FIELD_H = 320;        // scene height in px
  const FALL_BASE_SPEED = 75; // px/sec — slow enough for kids
  const FALL_SPEED_RAMP = 8;  // +px/sec per catch, gentle difficulty ramp
  const SPAWN_BASE_MS = 1600; // time between pancake spawns
  const SPAWN_MIN_MS = 900;   // minimum spawn interval at full difficulty
  const SPAWN_RAMP = 80;      // reduction per catch (ms)

  window.CrepeGame = {
    mount(el) {
      el.innerHTML = "";
      const game = document.createElement("div");
      game.className = "crepe-game";
      game.innerHTML = `
        <div class="crepe-hud">
          <div class="crepe-score">
            <span class="crepe-score-label">plated:</span>
            <span class="crepe-score-num" id="crepe-caught">0</span>
            <span class="crepe-score-goal">/ ${CATCH_GOAL}</span>
          </div>
          <div class="crepe-lives" id="crepe-lives"></div>
        </div>
        <div class="crepe-field" id="crepe-field">
          <div class="crepe-chef" id="crepe-chef" title="the chef is tossing pancakes"></div>
          <div class="crepe-lane-hints">
            <div class="crepe-lane-hint" data-lane="0"></div>
            <div class="crepe-lane-hint" data-lane="1"></div>
            <div class="crepe-lane-hint" data-lane="2"></div>
          </div>
          <div class="crepe-stoves">
            <div class="crepe-stove" data-lane="0"></div>
            <div class="crepe-stove" data-lane="1"></div>
            <div class="crepe-stove" data-lane="2"></div>
          </div>
          <img class="crepe-pat" id="crepe-pat" src="assets/pat_chef.png" alt="Pat the chef" draggable="false">
          <div class="crepe-message" id="crepe-message" aria-live="polite"></div>
        </div>
        <p class="crepe-hint">← / → to move Pat. Tap a lane on mobile.</p>
        <button class="crepe-restart" id="crepe-restart" style="display:none">try again</button>
      `;
      el.appendChild(game);

      this.field = game.querySelector("#crepe-field");
      this.pat = game.querySelector("#crepe-pat");
      this.caughtEl = game.querySelector("#crepe-caught");
      this.livesEl = game.querySelector("#crepe-lives");
      this.msgEl = game.querySelector("#crepe-message");
      this.restartBtn = game.querySelector("#crepe-restart");
      this.stoves = game.querySelectorAll(".crepe-stove");
      this.laneHints = game.querySelectorAll(".crepe-lane-hint");

      this.reset();

      // Controls
      this.bindControls(game);

      // Start/stop the loop based on visibility. The chapter is display:none
      // while not active, so IntersectionObserver won't fire until the
      // reader actually arrives at the chef chapter.
      this.io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              // Need non-zero field size before starting — layout may not
              // have settled on the first intersect.
              const kick = () => {
                if (!this.field.clientWidth) {
                  requestAnimationFrame(kick);
                  return;
                }
                this.layout();
                this.resume();
                this.startLoop();
              };
              kick();
            } else {
              this.pause();
              this.stopLoop();
            }
          });
        },
        { threshold: 0.05 }
      );
      this.io.observe(this.field);

      window.addEventListener("resize", () => this.layout());

      this.restartBtn.addEventListener("click", () => {
        this.reset();
        this.layout();
        this.msgEl.textContent = "";
        this.restartBtn.style.display = "none";
        this.startLoop();
      });
    },

    reset() {
      this.state = {
        patLane: 1,
        pancakes: [],     // { id, lane, y, fallSpeed }
        caught: 0,
        splats: 0,
        complete: false,
        failed: false,
        lastSpawn: 0,
        nextSpawnMs: SPAWN_BASE_MS,
        paused: false,
      };
      this.nextPancakeId = 0;
      // Clear any floating pancake DOM
      this.field.querySelectorAll(".crepe-pancake, .crepe-splat, .crepe-catch-puff").forEach(n => n.remove());
      this.updateHud();
      this.layout();
    },

    layout() {
      const w = this.field.clientWidth;
      if (w < 50) return;
      this.laneWidth = w / LANES;
      // Pat positioned at bottom of field; width scales
      const patDisplayW = Math.max(56, Math.round(this.laneWidth * 0.55));
      const patDisplayH = Math.round(patDisplayW * (32 / 28));
      this.pat.style.width = patDisplayW + "px";
      this.pat.style.height = patDisplayH + "px";
      this.patDisplayH = patDisplayH;
      // Anchor Pat at bottom of field minus a little padding
      this.patBottomPad = 4;
      this.movePat(this.state.patLane, true);
      // Position stoves
      this.stoves.forEach((s, i) => {
        s.style.left = (i * this.laneWidth) + "px";
        s.style.width = this.laneWidth + "px";
      });
      this.laneHints.forEach((h, i) => {
        h.style.left = (i * this.laneWidth) + "px";
        h.style.width = this.laneWidth + "px";
      });
    },

    bindControls(game) {
      // Keyboard
      this.keyHandler = (e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        const rect = this.field.getBoundingClientRect();
        if (rect.top >= window.innerHeight || rect.bottom <= 0) return;
        e.preventDefault();
        e.stopPropagation();
        if (this.state.complete || this.state.failed) return;
        if (e.key === "ArrowLeft") this.movePat(this.state.patLane - 1);
        else this.movePat(this.state.patLane + 1);
      };
      window.addEventListener("keydown", this.keyHandler, true);

      // Tap/click lanes
      this.field.addEventListener("pointerdown", (e) => {
        if (this.state.complete || this.state.failed) return;
        const rect = this.field.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const lane = Math.max(0, Math.min(LANES - 1, Math.floor(x / this.laneWidth)));
        this.movePat(lane);
      });
    },

    movePat(lane, instant) {
      lane = Math.max(0, Math.min(LANES - 1, lane));
      this.state.patLane = lane;
      if (!this.laneWidth) return;
      const cx = (lane + 0.5) * this.laneWidth;
      const patW = this.pat.clientWidth || 56;
      const left = cx - patW / 2;
      if (instant) {
        this.pat.style.transition = "none";
        // force reflow so subsequent transitions apply
        void this.pat.offsetWidth;
      } else {
        this.pat.style.transition = "left 0.12s ease-out";
      }
      this.pat.style.left = left + "px";
      // Highlight the active lane subtly
      this.laneHints.forEach((h, i) => h.classList.toggle("active", i === lane));
    },

    startLoop() {
      if (this._rafing) return;
      this._rafing = true;
      this.lastTick = performance.now();
      const loop = (now) => {
        if (!this._rafing) return;
        if (!this.state.paused && !this.state.complete && !this.state.failed) {
          const dt = Math.min(50, now - this.lastTick);
          this.lastTick = now;
          this.update(dt, now);
        } else {
          this.lastTick = now;
        }
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    },

    stopLoop() {
      this._rafing = false;
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = null;
    },

    pause() { this.state.paused = true; },
    resume() {
      this.state.paused = false;
      this.lastTick = performance.now();
    },

    update(dt, now) {
      // Spawn new pancake?
      this.state.lastSpawn += dt;
      const spawnInterval = Math.max(SPAWN_MIN_MS, SPAWN_BASE_MS - this.state.caught * SPAWN_RAMP);
      if (this.state.lastSpawn >= spawnInterval) {
        this.state.lastSpawn = 0;
        this.state.nextSpawnMs = spawnInterval;
        this.spawnPancake();
      }

      // Update falling pancakes
      const fallSpeed = FALL_BASE_SPEED + this.state.caught * FALL_SPEED_RAMP;
      const fieldH = this.field.clientHeight || FIELD_H;
      const catchLine = fieldH - this.patDisplayH - this.patBottomPad - 14; // where the pan is
      for (let i = this.state.pancakes.length - 1; i >= 0; i--) {
        const p = this.state.pancakes[i];
        p.y += fallSpeed * dt / 1000;
        p.el.style.top = p.y + "px";

        if (p.y >= catchLine) {
          // It's at pan-height. Check lane match.
          if (p.lane === this.state.patLane) {
            this.onCatch(p);
          } else {
            // Let it fall a bit further to show it missed the pan, then splat
            if (p.y >= fieldH - 18) {
              this.onSplat(p);
            }
          }
          if (p.caught || p.splatted) {
            // Remove from active list; DOM stays a moment for effect
            this.state.pancakes.splice(i, 1);
          }
        }
      }
    },

    spawnPancake() {
      const lane = Math.floor(Math.random() * LANES);
      const id = ++this.nextPancakeId;
      const el = document.createElement("div");
      el.className = "crepe-pancake";
      el.dataset.id = id;
      // Start above the stove (near the chef sprite) and fall into the lane
      const laneCx = (lane + 0.5) * this.laneWidth;
      el.style.left = (laneCx - 12) + "px"; // 12 = half pancake width * scale, roughly
      el.style.top = "-12px";
      this.field.appendChild(el);
      // Tiny flash on the lane hint to show "incoming"
      const hint = this.laneHints[lane];
      if (hint) {
        hint.classList.add("incoming");
        setTimeout(() => hint.classList.remove("incoming"), 300);
      }
      this.state.pancakes.push({ id, lane, y: -12, el, caught: false, splatted: false });
    },

    onCatch(p) {
      p.caught = true;
      this.state.caught += 1;
      this.updateHud();
      // Fade the pancake into the pan with a tiny puff
      p.el.classList.add("caught");
      // small puff of steam
      const puff = document.createElement("div");
      puff.className = "crepe-catch-puff";
      puff.style.left = ((p.lane + 0.5) * this.laneWidth - 8) + "px";
      puff.style.top = (this.field.clientHeight - this.patDisplayH - this.patBottomPad - 16) + "px";
      this.field.appendChild(puff);
      setTimeout(() => puff.remove(), 500);
      setTimeout(() => p.el.remove(), 200);

      if (this.state.caught >= CATCH_GOAL) {
        this.onWin();
      }
    },

    onSplat(p) {
      p.splatted = true;
      this.state.splats += 1;
      this.updateHud();
      // Turn the pancake into a splat on the ground
      p.el.classList.add("splatted");
      p.el.style.top = (this.field.clientHeight - 12) + "px";
      setTimeout(() => p.el.remove(), 900);

      if (this.state.splats >= MAX_SPLATS) {
        this.onFail();
      } else {
        this.flashMessage("splat!");
      }
    },

    flashMessage(text, persist) {
      this.msgEl.textContent = text;
      this.msgEl.classList.remove("persist");
      clearTimeout(this._msgTO);
      if (!persist) {
        this._msgTO = setTimeout(() => {
          this.msgEl.textContent = "";
        }, 900);
      } else {
        this.msgEl.classList.add("persist");
      }
    },

    onWin() {
      this.state.complete = true;
      this.flashMessage("You're getting the hang of it!", true);
      // Reveal gated chapter content
      const locked = document.getElementById("chef-after-crepe");
      if (locked) {
        setTimeout(() => {
          locked.classList.add("revealed");
          locked.setAttribute("aria-hidden", "false");
          setTimeout(() => {
            locked.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 1200);
        }, 1400);
      }
      window.dispatchEvent(new CustomEvent("crepeWon"));
    },

    onFail() {
      this.state.failed = true;
      this.flashMessage("Oh no! Don't worry — let's try again.", true);
      this.restartBtn.style.display = "inline-block";
    },

    updateHud() {
      this.caughtEl.textContent = this.state.caught;
      // Render lives as pancake icons, dim for used ones
      this.livesEl.innerHTML = "";
      for (let i = 0; i < MAX_SPLATS; i++) {
        const icon = document.createElement("span");
        icon.className = "crepe-life" + (i < this.state.splats ? " used" : "");
        this.livesEl.appendChild(icon);
      }
    },
  };
})();
