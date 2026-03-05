// src/minimap.js
export function drawMinimap(ctx, state, opts = {}) {
  const {
    canvas,
    world,
    camera,
    player,
    enemies,
  } = state;

  // ---- config / layout ----
  const pad = opts.pad ?? 16;
  const mmW = opts.width ?? 220;
  const mmH = opts.height ?? 120;

  // Top-right by default
  const x0 = (opts.x ?? (canvas.clientWidth - pad - mmW));
  const y0 = (opts.y ?? (pad));

  const bgAlpha = opts.bgAlpha ?? 0.35;

  // scale world -> minimap
  const sx = mmW / world.w;
  const sy = mmH / world.h;

  // helper map world->minimap
  const mapX = (wx) => x0 + wx * sx;
  const mapY = (wy) => y0 + wy * sy;

  ctx.save();

  // Panel background
  ctx.globalAlpha = 1;
  ctx.fillStyle = `rgba(0,0,0,${bgAlpha})`;
  ctx.fillRect(x0, y0, mmW, mmH);

  // Border
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(x0, y0, mmW, mmH);

  // ---- Camera viewport rect ----
  // camera.x/y in world units, viewport size is canvas.clientWidth/Height in world units
  const vw = canvas.clientWidth;
  const vh = canvas.clientHeight;

  const vx = mapX(camera.x);
  const vy = mapY(camera.y);
  const vwMm = vw * sx;
  const vhMm = vh * sy;

  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  ctx.strokeRect(vx, vy, vwMm, vhMm);

  // ---- Enemies ----
  for (const e of enemies) {
    if (!e) continue;
    const ex = mapX(e.x);
    const ey = mapY(e.y);

    // Farbe nach Klasse
    const col =
      e.type === "tank"     ? "rgba(120,40,40,0.95)" :
      e.type === "sniper"   ? "rgba(190,120,255,0.95)" :
      e.type === "disabler" ? "rgba(80,200,255,0.95)" :
                              "rgba(220,70,70,0.95)"; // basic default

    ctx.globalAlpha = 1;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(ex, ey, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- Player ----
  {
    const px = mapX(player.x);
    const py = mapY(player.y);

    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.arc(px, py, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Richtung optional (kleiner Strich nach vorn)
    const dirLen = 8;
    const vx = (state.input?.isDown?.("d") || state.input?.isDown?.("arrowright")) -
               (state.input?.isDown?.("a") || state.input?.isDown?.("arrowleft"));
    const vy = (state.input?.isDown?.("s") || state.input?.isDown?.("arrowdown")) -
               (state.input?.isDown?.("w") || state.input?.isDown?.("arrowup"));

    if (vx || vy) {
      const L = Math.hypot(vx, vy) || 1;
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + (vx / L) * dirLen, py + (vy / L) * dirLen);
      ctx.stroke();
    }
  }

  // Label
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "#fff";
  ctx.font = "600 12px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Minimap", x0 + 8, y0 + 6);

  ctx.restore();
}