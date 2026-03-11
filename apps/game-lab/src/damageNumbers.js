// src/damageNumbers.js
export function createDamageSystem() {
  const numbers = []; // {x,y,vx,vy,text,t,ttl,alpha,scale,color}

  function spawn(x, y, amount, opts = {}) {
    const {
      crit = false,
      color = crit ? "rgba(255,220,120,1)" : "rgba(255,255,255,1)",
      ttl = 0.9,
      scale = crit ? 1.15 : 1.0,
      vx = (Math.random() - 0.5) * 30,
      vy = -70 - Math.random() * 30,
    } = opts;

    numbers.push({
      x,
      y,
      vx,
      vy,
      text: String(amount),
      t: 0,
      ttl,
      color,
      alpha: 1,
      scale,
    });
  }

  function spawnEnemyHit(x, y, amount, opts = {}) {
    spawn(x, y, amount, {
      color: "rgba(255,255,255,1)",
      ttl: 0.9,
      scale: 1.0,
      ...opts,
    });
  }

  function spawnPlayerHit(x, y, amount, opts = {}) {
    spawn(x, y, amount, {
      color: "rgba(255,110,110,1)",
      ttl: 1.0,
      scale: 1.1,
      vy: -85 - Math.random() * 20,
      ...opts,
    });
  }

  function spawnAdmiralHit(x, y, amount, opts = {}) {
    spawn(x, y, amount, {
      color: "rgba(255,215,90,1)",
      ttl: 1.1,
      scale: 1.25,
      vy: -95 - Math.random() * 20,
      ...opts,
    });
  }

  function update(dt) {
    for (let i = numbers.length - 1; i >= 0; i--) {
      const n = numbers[i];
      n.t += dt;

      n.x += n.vx * dt;
      n.y += n.vy * dt;
      n.vy += 140 * dt;

      const life = n.t / n.ttl;
      n.alpha = Math.max(0, 1 - life);

      if (n.t >= n.ttl) {
        numbers.splice(i, 1);
      }
    }
  }

  function render(ctx) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (const n of numbers) {
      ctx.save();
      ctx.translate(n.x, n.y);
      ctx.scale(n.scale, n.scale);

      ctx.globalAlpha = 0.9 * n.alpha;
      ctx.font = "700 16px system-ui, -apple-system, Segoe UI, Roboto, Arial";

      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillText(n.text, 1, 1);

      // text
      ctx.fillStyle = n.color;
      ctx.fillText(n.text, 0, 0);

      ctx.restore();
    }

    ctx.restore();
  }

  return {
    spawn,
    spawnEnemyHit,
    spawnPlayerHit,
    spawnAdmiralHit,
    update,
    render,
  };
}