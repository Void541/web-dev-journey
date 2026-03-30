// src/space.js
export function createSpace() {
  let t = 0;
  let stars = [];
  let lastW = 0;
  let lastH = 0;
  const star = 150;

      for (let i = 0; i < star; i++) {
    stars.push({
      x: Math.random() * 800,
      y: Math.random() * 600,
      size: Math.random() * 1.5 + 0.5,
      twinkleOffset: Math.random() * 10,
    });
  }

  function update(dt) {
    t += dt;
  }

  // Simple animated wave lines (fast, looks good, no images)
  function render(ctx, canvas) {
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

      if(stars.length === 0 || W !== lastW || H !== lastH) {
        stars = [];
        for (let i = 0; i < star; i++) {
          stars.push({
            x: Math.random() * W,
            y: Math.random() * H,
            size: Math.random() * 1.5 + 0.5,
            twinkleOffset: Math.random() * 10,
            fillStyle: Math.random() < 0.8 ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 255, 13, 0.5)",
          });
          lastW = W;
          lastH = H;
        }
      }

    // base ocean
    ctx.save();
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, W, H);

    // moving wave lines
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = "rgba(57, 255, 20, 0.3)";
    ctx.lineWidth = 1;

    const spacing = 100;
    const amp = 0.1;

    for (let y = -spacing; y < H + spacing; y += spacing) {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 18) {
        const yy =
            y +
          Math.sin((x * 0.015) + t * 1.4) * amp;
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }

    stars.forEach((s) => {
      ctx.beginPath();
      ctx.fillStyle = s.fillStyle;
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 2 + s.twinkleOffset);
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // subtle vignette
    const grd = ctx.createRadialGradient(W * 0.5, H * 0.5, 80, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
    grd.addColorStop(0, "rgba(30, 65, 36, 0)");
    grd.addColorStop(1, "rgba(0, 0, 0, 0.35)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    ctx.restore();
  }

  return { update, render };
}