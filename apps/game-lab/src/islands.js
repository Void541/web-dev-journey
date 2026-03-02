// src/islands.js
export function createIslands(canvas) {
  const islands = [];

  function add(x, y, r) {
    islands.push({ x, y, r });
  }

  // Example layout (you can tweak later)
  function generateDefault() {
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    islands.length = 0;
    add(W * 0.30, H * 0.35, 55);
    add(W * 0.70, H * 0.62, 70);
    add(W * 0.52, H * 0.25, 45);
  }

  function render(ctx) {
    ctx.save();

    for (const isl of islands) {
      // sand ring
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = "rgb(205, 185, 120)";
      ctx.beginPath();
      ctx.arc(isl.x, isl.y, isl.r + 10, 0, Math.PI * 2);
      ctx.fill();

      // grass core
      ctx.fillStyle = "rgb(70, 140, 70)";
      ctx.beginPath();
      ctx.arc(isl.x, isl.y, isl.r, 0, Math.PI * 2);
      ctx.fill();

      // tiny shadow
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(isl.x + 10, isl.y + 12, isl.r * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  // ✅ Colliders export (needed for enemies/projectiles)
  function getColliders() {
    return islands.map((i) => ({ x: i.x, y: i.y, r: i.r }));
  }

  // Circle vs circle resolve for entity (simple push-out)
  function resolveCircle(entity) {
    for (const isl of islands) {
      const dx = entity.x - isl.x;
      const dy = entity.y - isl.y;
      const d = Math.hypot(dx, dy) || 0.0001;
      const minDist = entity.r + isl.r;

      if (d < minDist) {
        const nx = dx / d;
        const ny = dy / d;
        const push = minDist - d;

        entity.x += nx * push;
        entity.y += ny * push;
      }
    }
  }

  return { islands, add, generateDefault, render, resolveCircle, getColliders };
}