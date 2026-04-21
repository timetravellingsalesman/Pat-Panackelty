// Cinematic parallax flight scene for the Time Travelling Salesman chapter.
// Pat has just jumped through a portal and sees the sea + seagulls drifting
// below — "a sliding parallax that made the height and depth more apparent."
// This is not interactive. Canvas 2D pixel art with multiple scroll layers.
//
// Tech: render at a low internal resolution (240x135) and scale up with
// image-rendering: pixelated so the pixels stay chunky at any size. The
// animation auto-pauses when the scene leaves the viewport.

(function () {
  // Internal pixel-art resolution. We upscale this in CSS.
  const W = 240;
  const H = 135;

  // Palette — tuned to the book's warm paper aesthetic.
  // Sky goes from cream at top to a warm horizon peach, into a soft sky blue.
  const COL = {
    skyTop:     "#f5eedc",   // paper (matches page background)
    skyMid:     "#f2ddc2",   // warm haze
    skyLow:     "#d9cfb6",   // hazy band near horizon
    horizon:    "#b8b79a",   // the horizon line itself (muted)
    seaHi:      "#7a98a8",   // upper sea (lighter, under horizon light)
    seaLo:      "#3f5f75",   // deeper sea at bottom
    seaCrest:   "#b8cfd9",   // foam/crest highlights
    seaShadow:  "#2d4658",   // wave trough
    cloudLight: "#f8f1dc",   // highlight side of cloud
    cloudMid:   "#e8dcc0",   // cloud body (cream, not white)
    cloudDark:  "#c9b999",   // cloud shadow
    star:       "#d9c98a",   // tiny speck in sky
    gull:       "#2b241a",   // ink color (same as body text)
    gullBelly:  "#4a3e2c",
    patShadow:  "rgba(40, 30, 15, 0.22)",
  };

  // Deterministic RNG so the scene looks the same each visit within a session.
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

      // Pre-generate the procedural content with a fixed seed
      const rng = mulberry32(0x7a1e);
      this.stars = this.makeStars(rng);
      this.cloudsFar = this.makeClouds(rng, 5, 0.30, 0.26); // (count, minY, maxY as fraction of H)
      this.cloudsMid = this.makeClouds(rng, 4, 0.15, 0.45);
      this.cloudsNear = this.makeClouds(rng, 3, 0.08, 0.50, true);
      this.gulls = this.makeGulls(rng);

      // Scroll offsets per layer
      this.off = { stars: 0, far: 0, mid: 0, near: 0, gulls: 0, sea: 0 };

      // Pat bobbing state
      this.t0 = performance.now();
      this.running = false;
      this.raf = null;

      // Position Pat once layout is known
      this.placePat();

      // Start when scrolled into view; pause when it leaves. Saves battery on
      // a long page where the reader might be elsewhere.
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

    // ---- procedural content generators ----

    makeStars(rng) {
      // sparse "stars" / specks drifting across the sky
      const arr = [];
      for (let i = 0; i < 18; i++) {
        arr.push({
          x: rng() * W,
          y: rng() * (H * 0.4),
          tw: rng() * Math.PI * 2, // twinkle phase
        });
      }
      return arr;
    },

    makeClouds(rng, count, minYFrac, maxYFrac, chunky) {
      const arr = [];
      const minY = H * minYFrac;
      const maxY = H * maxYFrac;
      for (let i = 0; i < count; i++) {
        const w = chunky ? (14 + Math.floor(rng() * 22)) : (10 + Math.floor(rng() * 18));
        const h = chunky ? (5 + Math.floor(rng() * 4)) : (3 + Math.floor(rng() * 3));
        // A cloud is a collection of overlapping rect blobs so it has an irregular silhouette
        const blobs = [];
        const n = 3 + Math.floor(rng() * 3);
        for (let j = 0; j < n; j++) {
          blobs.push({
            dx: Math.floor(rng() * w) - Math.floor(w / 2),
            dy: Math.floor(rng() * (h - 1)) - Math.floor((h - 1) / 2),
            bw: Math.floor(w * (0.3 + rng() * 0.4)),
            bh: Math.max(2, Math.floor(h * (0.5 + rng() * 0.5))),
          });
        }
        arr.push({
          x: (i / count) * (W + 40) + rng() * 40,
          y: Math.floor(minY + rng() * (maxY - minY)),
          w, h, blobs,
          chunky: !!chunky,
        });
      }
      return arr;
    },

    makeGulls(rng) {
      const arr = [];
      for (let i = 0; i < 5; i++) {
        arr.push({
          x: rng() * W,
          y: Math.floor(H * 0.2 + rng() * H * 0.2),
          ph: rng() * Math.PI * 2,
        });
      }
      return arr;
    },

    placePat() {
      // Pat sits visually centered. The sprite is 32x20 pixels (wider than
      // tall, horizontal flight pose). Width scales with wrap size; height
      // follows the native aspect ratio.
      const wrapW = this.wrap.clientWidth;
      if (!wrapW) return;
      // target display width for Pat ~18% of the scene width (he's horizontal
      // so a bit wider than a square sprite would be)
      const displayW = Math.max(52, Math.round(wrapW * 0.18));
      const displayH = Math.round(displayW * (20 / 32));
      this.pat.style.width = displayW + "px";
      this.pat.style.height = displayH + "px";
    },

    start() {
      if (this.running) return;
      this.running = true;
      this.lastTick = performance.now();
      const loop = (now) => {
        if (!this.running) return;
        const dt = Math.min(50, now - this.lastTick); // cap frame delta
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

    // ---- per-frame update ----

    update(dt) {
      // px/ms scroll speeds, per layer (lower = farther away)
      const s = dt; // 1 ms = 1 unit
      this.off.stars = (this.off.stars + 0.004 * s) % W;
      this.off.far   = (this.off.far   + 0.012 * s) % W;
      this.off.mid   = (this.off.mid   + 0.030 * s) % W;
      this.off.gulls = (this.off.gulls + 0.050 * s) % (W + 40);
      this.off.near  = (this.off.near  + 0.065 * s) % W;
      this.off.sea   = (this.off.sea   + 0.090 * s) % 16;
    },

    // ---- drawing ----

    render(now) {
      const ctx = this.ctx;
      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.62);
      sky.addColorStop(0, COL.skyTop);
      sky.addColorStop(0.55, COL.skyMid);
      sky.addColorStop(1, COL.skyLow);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, Math.floor(H * 0.62));

      // Stars / specks (barely-moving)
      ctx.fillStyle = COL.star;
      for (const s of this.stars) {
        const twinkle = 0.5 + 0.5 * Math.sin((now / 700) + s.tw);
        if (twinkle < 0.45) continue;
        const x = Math.floor((s.x - this.off.stars) % W);
        const xx = x < 0 ? x + W : x;
        ctx.fillRect(xx, Math.floor(s.y), 1, 1);
      }

      // Far clouds
      this.drawClouds(ctx, this.cloudsFar, this.off.far, 0.55);

      // Gulls (behind near clouds but ahead of far)
      this.drawGulls(ctx, now);

      // Mid clouds
      this.drawClouds(ctx, this.cloudsMid, this.off.mid, 0.75);

      // Horizon line (a subtle muted band)
      const horizonY = Math.floor(H * 0.60);
      ctx.fillStyle = COL.horizon;
      ctx.fillRect(0, horizonY, W, 1);

      // Sea
      this.drawSea(ctx, horizonY + 1, H - (horizonY + 1));

      // Near clouds (in front of sea band too, so they can drift over horizon)
      this.drawClouds(ctx, this.cloudsNear, this.off.near, 1.0);

      // Pat shadow on the sea — a small oval that ripples
      this.drawPatShadow(ctx, now);
    },

    drawClouds(ctx, clouds, offset, opacity) {
      ctx.globalAlpha = opacity;
      for (const c of clouds) {
        // Each cloud is drawn at (x - offset) wrapped; draw two copies to cover wrap
        for (let rep = 0; rep < 2; rep++) {
          const cx = Math.floor(c.x - offset + rep * W);
          if (cx < -c.w * 2 || cx > W + c.w * 2) continue;
          this.drawCloudBlob(ctx, c, cx);
        }
      }
      ctx.globalAlpha = 1;
    },

    drawCloudBlob(ctx, c, cx) {
      // Shadow first (a hair below)
      ctx.fillStyle = COL.cloudDark;
      for (const b of c.blobs) {
        ctx.fillRect(cx + b.dx, c.y + b.dy + 1, b.bw, b.bh);
      }
      // Body
      ctx.fillStyle = COL.cloudMid;
      for (const b of c.blobs) {
        ctx.fillRect(cx + b.dx, c.y + b.dy, b.bw, b.bh);
      }
      // Highlight
      ctx.fillStyle = COL.cloudLight;
      for (const b of c.blobs) {
        ctx.fillRect(cx + b.dx, c.y + b.dy, Math.max(1, Math.floor(b.bw * 0.45)), 1);
      }
    },

    drawGulls(ctx, now) {
      // Each gull flies at slightly different speeds/positions. Wing flap is
      // a 2-frame thing based on time.
      ctx.fillStyle = COL.gull;
      for (const g of this.gulls) {
        const x = Math.floor((g.x - this.off.gulls) % (W + 40));
        const xx = x < -6 ? x + (W + 40) : x;
        if (xx > W + 4) continue;
        // gentle vertical bob
        const y = Math.floor(g.y + Math.sin((now / 900) + g.ph) * 1.2);
        // flap frame
        const flap = (Math.floor((now / 220) + g.ph) % 2) === 0;
        if (flap) {
          // wings up: "  .    .  " with a center point
          ctx.fillRect(xx, y, 1, 1);
          ctx.fillRect(xx + 1, y + 1, 1, 1);
          ctx.fillRect(xx + 2, y, 1, 1);
        } else {
          // wings out: ".       ."
          ctx.fillRect(xx - 1, y + 1, 1, 1);
          ctx.fillRect(xx, y + 1, 1, 1);
          ctx.fillRect(xx + 1, y + 1, 1, 1);
          ctx.fillRect(xx + 2, y + 1, 1, 1);
          ctx.fillRect(xx + 3, y + 1, 1, 1);
        }
      }
    },

    drawSea(ctx, y0, seaH) {
      const ctx2 = ctx;
      // Vertical gradient for sea depth
      const seaGrad = ctx2.createLinearGradient(0, y0, 0, y0 + seaH);
      seaGrad.addColorStop(0, COL.seaHi);
      seaGrad.addColorStop(1, COL.seaLo);
      ctx2.fillStyle = seaGrad;
      ctx2.fillRect(0, y0, W, seaH);

      // Scrolling wave-crest pattern: rows of dashes offset per-row to fake depth
      const crestRows = [
        { yOff: 4,  dash: 4, gap: 10, phaseMul: 1.0, w: 2 },
        { yOff: 10, dash: 3, gap: 13, phaseMul: 1.3, w: 2 },
        { yOff: 17, dash: 5, gap: 16, phaseMul: 1.7, w: 2 },
        { yOff: 25, dash: 4, gap: 19, phaseMul: 2.1, w: 3 },
        { yOff: 33, dash: 6, gap: 22, phaseMul: 2.6, w: 3 },
        { yOff: 42, dash: 7, gap: 28, phaseMul: 3.4, w: 3 },
      ];
      ctx2.fillStyle = COL.seaCrest;
      for (const r of crestRows) {
        const y = y0 + r.yOff;
        if (y >= y0 + seaH) break;
        const period = r.dash + r.gap;
        const shift = Math.floor(this.off.sea * r.phaseMul) % period;
        for (let x = -period; x < W; x += period) {
          ctx2.fillRect(x + shift, y, r.dash, 1);
        }
      }
      // Trough shading (darker) interleaved
      ctx2.fillStyle = COL.seaShadow;
      const troughs = [
        { yOff: 7,  dash: 2, gap: 13, phaseMul: 1.1 },
        { yOff: 14, dash: 2, gap: 17, phaseMul: 1.5 },
        { yOff: 22, dash: 3, gap: 21, phaseMul: 1.9 },
        { yOff: 30, dash: 3, gap: 26, phaseMul: 2.4 },
      ];
      for (const r of troughs) {
        const y = y0 + r.yOff;
        if (y >= y0 + seaH) break;
        const period = r.dash + r.gap;
        const shift = Math.floor(this.off.sea * r.phaseMul) % period + period / 2;
        for (let x = -period; x < W; x += period) {
          ctx2.fillRect(x + shift, y, r.dash, 1);
        }
      }
    },

    drawPatShadow(ctx, now) {
      // An oval-ish shadow that ripples with the sea. Follows Pat's horizontal
      // center but stays anchored vertically near the top of the sea.
      const bob = Math.sin(now / 650) * 2;
      const cx = Math.floor(W / 2 + bob * 0.3);
      const cy = Math.floor(H * 0.64);
      ctx.fillStyle = COL.patShadow;
      // 7-pixel-wide flat oval
      ctx.fillRect(cx - 3, cy, 7, 1);
      ctx.fillRect(cx - 2, cy + 1, 5, 1);

      // Update the DOM Pat sprite position. Bob vertically on a slow sine,
      // and drift left/right a hair so it doesn't feel pinned.
      // The Pat image is percentage-positioned via CSS; we apply a small
      // transform on top.
      if (this.pat) {
        const bobY = Math.sin(now / 650) * 6;      // ~6px up/down
        const swayX = Math.sin(now / 1100) * 3;    // ~3px left/right
        // keep CSS's default translate that centers it, then add bob/sway
        this.pat.style.transform =
          `translate(calc(-50% + ${swayX}px), calc(-50% + ${bobY}px))`;
      }
    },
  };
})();
