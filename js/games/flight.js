// Cinematic parallax flight scene for the Time Travelling Salesman chapter.
// Pat has just jumped through a portal and sees the sea + clouds + islands
// drifting below — "a sliding parallax that made the height and depth more
// apparent."
//
// Top-down view: Pat flies toward the top of the screen. World scrolls
// downward. Multiple layers scroll at different speeds — true parallax
// depth, with clouds visibly passing OVER islands and sea.
//
// Tech: render at a low internal resolution (240x135) and scale up with
// image-rendering: pixelated. Animation auto-pauses when offscreen.

(function () {
  const W = 240;
  const H = 135;

  const COL = {
    seaLight:   "#6d98b0",
    seaMid:     "#4f7a92",
    seaDeep:    "#2e5168",
    seaShadow:  "#1f3a4c",
    seaCrest:   "#a8c4d4",
    seaFoam:    "#d8e3eb",

    cloudLight: "#f8f1dc",
    cloudMid:   "#e8dcc0",
    cloudDark:  "#c9b999",
    highCloud:  "#faf4e1",

    islandRim:  "#c9b87a",
    islandSand: "#e8d89a",
    islandGrass:"#6b8b48",
    islandShade:"#4a6b3a",

    patShadow:  "rgba(20, 30, 45, 0.35)",
  };

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  window.FlightGame = {
    mount(el) {
      el.innerHTML = "";
      const game = document.createElement("div");
      game.className = "flight-scene";
      game.innerHTML = `
        <div class="flight-wrap">
          <canvas class="flight-canvas" width="${W}" height="${H}"></canvas>
          <img class="flight-pat" src="assets/pat_flying.png" alt="Pat flying" draggable="false">
        </div>
        <p class="flight-caption">— drifting —</p>
      `;
      el.appendChild(game);

      this.canvas = game.querySelector(".flight-canvas");
      this.pat = game.querySelector(".flight-pat");
      this.wrap = game.querySelector(".flight-wrap");
      this.ctx = this.canvas.getContext("2d");
      this.ctx.imageSmoothingEnabled = false;

      const rng = mulberry32(0x0c3a);
      this.deepPatches = this.makeDeepPatches(rng);
      this.islands = this.makeIslands(rng);
      this.lowClouds = this.makeClouds(rng, 5, 'low');
      this.highClouds = this.makeClouds(rng, 3, 'high');
      // Seed Y positions so objects don't all appear in a line at t=0.
      this.islands.forEach((o, i) => { o.y = -30 - i * 90 - rng() * 60; });
      this.lowClouds.forEach((o, i) => { o.y = -20 - i * 50 - rng() * 40; });
      this.highClouds.forEach((o, i) => { o.y = -30 - i * 80 - rng() * 50; });

      this.off = {
        sea: 0,
        deepPatches: 0,
        islands: 0,
        lowCloud: 0,
        highCloud: 0,
      };

      this.t0 = performance.now();
      this.running = false;
      this.raf = null;

      this.placePat();

      this.io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) this.start();
            else this.stop();
          });
        },
        { threshold: 0.1 }
      );
      this.io.observe(this.canvas);

      window.addEventListener("resize", () => this.placePat());
    },

    // ---- procedural content ----

    makeDeepPatches(rng) {
      const arr = [];
      for (let i = 0; i < 7; i++) {
        const cx = rng() * W;
        const cy = rng() * H * 3;
        const size = 14 + rng() * 22;
        const blobs = [];
        const n = 3 + Math.floor(rng() * 3);
        for (let j = 0; j < n; j++) {
          blobs.push({
            dx: Math.floor(rng() * size) - Math.floor(size / 2),
            dy: Math.floor(rng() * (size * 0.5)) - Math.floor(size * 0.25),
            bw: Math.floor(size * (0.35 + rng() * 0.35)),
            bh: Math.max(2, Math.floor(size * (0.2 + rng() * 0.25))),
          });
        }
        arr.push({ x: cx, y: cy, blobs });
      }
      return arr;
    },

    makeIslands(rng) {
      const arr = [];
      const count = 5;
      for (let i = 0; i < count; i++) {
        const sizeClass = Math.floor(rng() * 3);
        const w = [14, 22, 30][sizeClass];
        const h = [10, 15, 20][sizeClass];
        arr.push({
          x: Math.floor(20 + rng() * (W - 40 - w)),
          y: 0,
          w, h,
          grassSpots: this.makeGrassSpots(rng, w, h),
        });
      }
      return arr;
    },

    makeGrassSpots(rng, w, h) {
      const n = 2 + Math.floor(rng() * 3);
      const arr = [];
      for (let i = 0; i < n; i++) {
        arr.push({
          dx: Math.floor(rng() * (w - 4)) - Math.floor((w - 4) / 2),
          dy: Math.floor(rng() * (h - 4)) - Math.floor((h - 4) / 2),
          r: 1 + Math.floor(rng() * 2),
        });
      }
      return arr;
    },

    makeClouds(rng, count, layer) {
      const arr = [];
      const sizeMul = layer === 'high' ? 0.7 : 1.0;
      for (let i = 0; i < count; i++) {
        const w = Math.floor((18 + rng() * 28) * sizeMul);
        const h = Math.floor((5 + rng() * 5) * sizeMul);
        const blobs = [];
        const n = 3 + Math.floor(rng() * 3);
        for (let j = 0; j < n; j++) {
          blobs.push({
            dx: Math.floor(rng() * w) - Math.floor(w / 2),
            dy: Math.floor(rng() * h) - Math.floor(h / 2),
            bw: Math.floor(w * (0.3 + rng() * 0.4)),
            bh: Math.max(2, Math.floor(h * (0.4 + rng() * 0.5))),
          });
        }
        arr.push({
          x: Math.floor(rng() * W),
          y: 0,
          w, h, blobs,
          layer,
        });
      }
      return arr;
    },

    placePat() {
      const wrapW = this.wrap.clientWidth;
      if (!wrapW) return;
      // Pat sprite is 28x32 (top-down view, see make_flying_pat.py).
      // Scale to ~18% of scene width, preserving aspect ratio.
      const displayW = Math.max(52, Math.round(wrapW * 0.18));
      const displayH = Math.round(displayW * (32 / 28));
      this.pat.style.width = displayW + "px";
      this.pat.style.height = displayH + "px";
    },

    start() {
      if (this.running) return;
      this.running = true;
      this.lastTick = performance.now();
      const loop = (now) => {
        if (!this.running) return;
        const dt = Math.min(50, now - this.lastTick);
        this.lastTick = now;
        this.update(dt);
        this.render(now);
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    },

    stop() {
      this.running = false;
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = null;
    },

    update(dt) {
      // All layers scroll DOWNWARD. Closer = faster.
      this.off.sea         += 0.008 * dt;
      this.off.deepPatches += 0.010 * dt;
      this.off.islands     += 0.018 * dt;
      this.off.lowCloud    += 0.045 * dt;
      this.off.highCloud   += 0.085 * dt;
    },

    render(now) {
      const ctx = this.ctx;

      // Base sea gradient
      const sea = ctx.createLinearGradient(0, 0, 0, H);
      sea.addColorStop(0, COL.seaLight);
      sea.addColorStop(0.5, COL.seaMid);
      sea.addColorStop(1, COL.seaDeep);
      ctx.fillStyle = sea;
      ctx.fillRect(0, 0, W, H);

      this.drawDeepPatches(ctx);
      this.drawWaves(ctx);
      this.drawPatShadow(ctx);
      this.drawIslands(ctx);
      this.drawCloudLayer(ctx, this.lowClouds, this.off.lowCloud, 0.82);
      this.animatePatSprite(now);
      this.drawCloudLayer(ctx, this.highClouds, this.off.highCloud, 0.55);
    },

    drawDeepPatches(ctx) {
      const period = H * 3;
      const offset = this.off.deepPatches % period;
      ctx.fillStyle = COL.seaShadow;
      for (const p of this.deepPatches) {
        for (let rep = 0; rep < 2; rep++) {
          const y = Math.floor(p.y + offset - rep * period);
          if (y < -60 || y > H + 60) continue;
          ctx.globalAlpha = 0.55;
          for (const b of p.blobs) {
            ctx.fillRect(p.x + b.dx, y + b.dy, b.bw, b.bh);
          }
        }
      }
      ctx.globalAlpha = 1;
    },

    drawWaves(ctx) {
      // Horizontal whitecap dashes at multiple periods, scrolling downward.
      const rows = [
        { rowPeriod: 7,  dashLen: 4, gap: 16, phaseMul: 1.0, col: COL.seaCrest },
        { rowPeriod: 11, dashLen: 6, gap: 22, phaseMul: 1.3, col: COL.seaCrest },
        { rowPeriod: 17, dashLen: 3, gap: 18, phaseMul: 1.7, col: COL.seaFoam },
        { rowPeriod: 23, dashLen: 5, gap: 26, phaseMul: 2.2, col: COL.seaCrest },
      ];
      for (const r of rows) {
        ctx.fillStyle = r.col;
        const yShift = Math.floor(this.off.sea * r.phaseMul) % r.rowPeriod;
        const period = r.dashLen + r.gap;
        for (let y = -r.rowPeriod; y < H; y += r.rowPeriod) {
          const yy = y + yShift;
          const xShift = Math.floor((yy * 3) % period);
          for (let x = -period; x < W; x += period) {
            ctx.fillRect(x + xShift, yy, r.dashLen, 1);
          }
        }
      }
    },

    drawPatShadow(ctx) {
      // Pat's shadow appears on the sea beneath him. Since Pat is centered
      // and the sea is the canvas background, the shadow sits dead-center.
      const cx = Math.floor(W / 2);
      const cy = Math.floor(H * 0.5);
      ctx.fillStyle = COL.patShadow;
      ctx.fillRect(cx - 5, cy - 1, 11, 1);
      ctx.fillRect(cx - 6, cy, 13, 1);
      ctx.fillRect(cx - 5, cy + 1, 11, 1);
    },

    drawIslands(ctx) {
      const period = H * 3;
      const offset = this.off.islands % period;
      for (const island of this.islands) {
        for (let rep = 0; rep < 2; rep++) {
          const y = Math.floor(island.y + offset - rep * period);
          if (y < -island.h - 5 || y > H + 5) continue;
          this.drawIsland(ctx, island, y);
        }
      }
    },

    drawIsland(ctx, island, yTop) {
      const { x, w, h } = island;
      // Wet sand rim
      ctx.fillStyle = COL.islandRim;
      ctx.fillRect(x + 1, yTop, w - 2, h);
      ctx.fillRect(x, yTop + 1, w, h - 2);
      // Sand (lighter center)
      ctx.fillStyle = COL.islandSand;
      ctx.fillRect(x + 2, yTop + 1, w - 4, h - 2);
      ctx.fillRect(x + 1, yTop + 2, w - 2, h - 4);
      // Grass/palm spots
      for (const g of island.grassSpots) {
        const gx = x + Math.floor(w / 2) + g.dx;
        const gy = yTop + Math.floor(h / 2) + g.dy;
        ctx.fillStyle = COL.islandGrass;
        ctx.fillRect(gx - g.r, gy - g.r, g.r * 2 + 1, g.r * 2 + 1);
        ctx.fillStyle = COL.islandShade;
        ctx.fillRect(gx - g.r + 1, gy + 1, 1, 1);
      }
    },

    drawCloudLayer(ctx, clouds, offset, opacity) {
      const period = H * 2;
      const off = offset % period;
      ctx.globalAlpha = opacity;
      for (const c of clouds) {
        for (let rep = 0; rep < 2; rep++) {
          const cy = Math.floor(c.y + off - rep * period);
          if (cy < -c.h - 10 || cy > H + 10) continue;
          this.drawCloudBlob(ctx, c, c.x, cy);
        }
      }
      ctx.globalAlpha = 1;
    },

    drawCloudBlob(ctx, c, cx, cy) {
      // Shadow
      ctx.fillStyle = COL.cloudDark;
      for (const b of c.blobs) {
        ctx.fillRect(cx + b.dx, cy + b.dy + 1, b.bw, b.bh);
      }
      // Body
      ctx.fillStyle = (c.layer === 'high') ? COL.highCloud : COL.cloudMid;
      for (const b of c.blobs) {
        ctx.fillRect(cx + b.dx, cy + b.dy, b.bw, b.bh);
      }
      // Highlight
      ctx.fillStyle = COL.cloudLight;
      for (const b of c.blobs) {
        ctx.fillRect(cx + b.dx, cy + b.dy, Math.max(1, Math.floor(b.bw * 0.45)), 1);
      }
    },

    animatePatSprite(now) {
      if (!this.pat) return;
      const bobY = Math.sin(now / 650) * 5;
      const swayX = Math.sin(now / 1100) * 3;
      this.pat.style.transform =
        `translate(calc(-50% + ${swayX}px), calc(-50% + ${bobY}px))`;
    },
  };
})();
