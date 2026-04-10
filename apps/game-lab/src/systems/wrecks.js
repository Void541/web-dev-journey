// src/wrecks.js
export function createWreckSystem(cfg = {}) {
  const {
    PICKUP_RADIUS = 46,
    SALVAGE_TIME = 1.8,
    DESPAWN_TIME = 35,
  } = cfg;

  /** @type {Array<{x:number,y:number,r:number,t:number, salvageT:number, flash:number, dead?:boolean}>} */
  const wrecks = [];
  /** @type {Array<{x:number,y:number,vx:number,vy:number,t:number}>} */
  const fx = [];

  function spawn(x, y, opts = {}) {
    wrecks.push({
      x, y,
      r: opts.r ?? 12,
      t: DESPAWN_TIME,
      salvageT: 0,
      flash: 0,
      dead: false,
      // optional loot payload:
      loot: opts.loot ?? null,
    });
  }

  function spawnFxBurst(x, y, n = 10) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 90;
      fx.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        t: 0.25 + Math.random() * 0.35,
      });
    }
  }

  function update(dt) {
    // wreck lifetime
    for (let i = wrecks.length - 1; i >= 0; i--) {
      const w = wrecks[i];
      w.t -= dt;
      w.flash = Math.max(0, w.flash - dt);

      if (w.t <= 0 || w.dead) wrecks.splice(i, 1);
    }

    // fx particles
    for (let i = fx.length - 1; i >= 0; i--) {
      const p = fx[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.pow(0.08, dt); // strong drag
      p.vy *= Math.pow(0.08, dt);
      p.t -= dt;
      if (p.t <= 0) fx.splice(i, 1);
    }
  }

  function nearestWreck(state) {
    const px = state.player.x;
    const py = state.player.y;

    let best = null;
    let bestD2 = Infinity;

    for (const w of wrecks) {
      const dx = w.x - px;
      const dy = w.y - py;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestD2) { bestD2 = d2; best = w; }
    }
    return { w: best, d2: bestD2 };
  }

  // Hold-to-salvage: F gedrückt + stehen bleiben/keine Bewegung (wie repair)
  function trySalvage(dt, state) {
    const input = state.input;
    if (!input) return;

    const hold = input.isDown?.("f") || input.isDown?.("F");
    const wantsMove =
      input.isDown?.("a") || input.isDown?.("d") || input.isDown?.("w") || input.isDown?.("s") ||
      input.isDown?.("arrowleft") || input.isDown?.("arrowright") || input.isDown?.("arrowup") || input.isDown?.("arrowdown");

    const { w, d2 } = nearestWreck(state);
    state.ui = state.ui || {};
    state.ui.salvage = state.ui.salvage || { active: false, p: 0, inRange: false };

    if (!w) {
      state.ui.salvage.active = false;
      state.ui.salvage.p = 0;
      state.ui.salvage.inRange = false;
      return;
    }

    const rr = (PICKUP_RADIUS + w.r);
    const inRange = d2 <= rr * rr;
    state.ui.salvage.inRange = inRange;

    // Wenn nicht in range -> reset progress
    if (!inRange) {
      w.salvageT = 0;
      state.ui.salvage.active = false;
      state.ui.salvage.p = 0;
      return;
    }

    // In Range, aber bewegt -> stop salvaging
    if (wantsMove) {
      w.salvageT = 0;
      state.ui.salvage.active = false;
      state.ui.salvage.p = 0;
      return;
    }

    // Hold E to salvage
    if (hold) {
      state.ui.salvage.active = true;
      w.salvageT += dt;

      // kleine Partikel während salvage
      if (Math.random() < 0.35) spawnFxBurst(w.x, w.y, 2);

      const p = Math.min(1, w.salvageT / SALVAGE_TIME);
      state.ui.salvage.p = p;

      if (w.salvageT >= SALVAGE_TIME) {
        // ✅ REWARD: Materialien + optional extra credits if needed later.
        // Credits come from kills for now, so wrecks only hand out materials.
        state.inventory = state.inventory || {};
        const inv = state.inventory;

        // simple mats (später ersetzen durch loot-table)
        
        inv.scrap = (inv.scrap ?? 0);

        // optional: wenn w.loot existiert
        if (w.loot) {
          for (const [k, v] of Object.entries(w.loot)) {
            if(k=== "__rarity") continue; // Meta info überspringen
            inv[k] = (inv[k] ?? 0) + v;
            state.pushLootNotice(`+${v} ${k}`); 
          }
          state.onSalvageLoot?.(w.loot);
        }

        // FX burst + remove wreck
        w.flash = 0.35;
        spawnFxBurst(w.x, w.y, 18);
        w.dead = true;

        state.ui.salvage.active = false;
        state.ui.salvage.p = 0;
      }
    } else {
      // Releasing the key slowly drains progress so salvaging still feels deliberate.
      w.salvageT = Math.max(0, w.salvageT - dt * 0.9);
      state.ui.salvage.active = false;
      state.ui.salvage.p = Math.min(1, w.salvageT / SALVAGE_TIME);
    }
  }

  // World-space render (mit Kamera)
  function render(ctx, state) {
    // wracks
    for (const w of wrecks) {
      const pulse = 0.6 + Math.sin((state.time ?? 0) * 3.2) * 0.4;

      // glow
      ctx.save();
      ctx.globalAlpha = 0.18 * pulse;
      ctx.fillStyle = "rgba(255,255,255,1)";
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.r + 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // debris body
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "rgba(120,90,55,1)";
      ctx.beginPath();
      ctx.ellipse(w.x, w.y, w.r + 6, w.r, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // little planks
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = "rgba(190,160,110,1)";
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + 0.7;
        const px = w.x + Math.cos(a) * (w.r * 0.9);
        const py = w.y + Math.sin(a) * (w.r * 0.6);
        ctx.fillRect(px - 6, py - 2, 12, 4);
      }
      ctx.restore();

      // in-range ring + progress arc
      const ui = state.ui?.salvage;
      if (ui?.inRange) {
        const p = Math.min(1, w.salvageT / SALVAGE_TIME);

        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = "rgba(255,255,255,1)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.r + 18, 0, Math.PI * 2);
        ctx.stroke();

        // progress arc
        if (p > 0) {
          ctx.globalAlpha = 0.85;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(w.x, w.y, w.r + 18, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p);
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    // fx particles
    for (const p of fx) {
      const a = Math.max(0, Math.min(1, p.t / 0.6));
      ctx.save();
      ctx.globalAlpha = 0.7 * a;
      ctx.fillStyle = "rgba(220,255,220,1)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Screen-space HUD hint (ohne Kamera)
  function renderHud(ctx, canvas, state) {
    const ui = state.ui?.salvage;
    if (!ui?.inRange) return;

    const label =
      ui.active ? "Salvaging... (hold F)" :
      "Hold F to Salvage";

    // kein Decimal, optional: Prozent als int
    const pct = Math.round((ui.p ?? 0) * 100);

    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(18, 168, 260, 34);

    ctx.fillStyle = "#fff";
    ctx.font = "600 14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`${label}  ${pct}%`, 28, 185);
    ctx.restore();
  }

  return {
    wrecks,
    spawn,
    update,
    trySalvage,
    render,
    renderHud,
  };
}

