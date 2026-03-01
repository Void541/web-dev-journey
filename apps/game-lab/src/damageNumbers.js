// src/damageNumbers.js
export function createDamageSystem() {
  const numbers = []; // {x,y,vx,vy,text,t,ttl,alpha,scale}

  function spawn(x, y, amount, opts = {}) {
    const {
      crit = false,
      color = crit ? "rgba(255, 220, 120, 1)" : "rgba(255,255,255,1)",
      ttl = 0.9,
    } = opts;

    numbers.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 30,
      vy: -70 - Math.random() * 30,
      text: String(amount),
      t: 0,
      ttl,
      color,
      alpha: 1,
      scale: crit ? 1.15 : 1.0,
    });
  }

  function update(dt) {
    for (let i = numbers.length - 1; i >= 0; i--) {
      const n = numbers[i];
      n.t += dt;

      n.x += n.vx * dt;
      n.y += n.vy * dt;
      n.vy += 140 * dt; // leichte “gravity” damit es smooth wirkt

      const life = n.t / n.ttl;
      n.alpha = Math.max(0, 1 - life);

      if (n.t >= n.ttl) numbers.splice(i, 1);
    }
  }

  function render(ctx) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 16px system-ui, -apple-system, Segoe UI, Roboto, Arial";

    for (const n of numbers) {
      ctx.globalAlpha = 0.9 * n.alpha;

      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillText(n.text, n.x + 1, n.y + 1);

      // text
      ctx.fillStyle = n.color;
      ctx.fillText(n.text, n.x, n.y);
    }

    ctx.restore();
  }

  return { spawn, update, render };
}