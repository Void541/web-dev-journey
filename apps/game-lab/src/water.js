// src/water.js
export function createWater() {
  let t = 0;

  function update(dt) {
    t += dt;
  }

  // Simple animated wave lines (fast, looks good, no images)
  function render(ctx, canvas) {
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    // base ocean
    ctx.save();
    ctx.fillStyle = "rgb(12, 28, 44)";
    ctx.fillRect(0, 0, W, H);

    // moving wave lines
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = "rgba(120, 190, 255, 1)";
    ctx.lineWidth = 1;

    const spacing = 26;
    const amp = 6;

    for (let y = -spacing; y < H + spacing; y += spacing) {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 18) {
        const yy =
          y +
          Math.sin((x * 0.015) + t * 1.4) * amp +
          Math.sin((y * 0.02) - t * 1.1) * (amp * 0.5);
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }

    // subtle vignette
    const grd = ctx.createRadialGradient(W * 0.5, H * 0.5, 80, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
    grd.addColorStop(0, "rgba(0,0,0,0)");
    grd.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    ctx.restore();
  }

  return { update, render };
}