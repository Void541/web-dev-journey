function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function resolveEnemySeparation(enemies, world) {
  const k = 0.6;

  for (let i = 0; i < enemies.length; i++) {
    const a = enemies[i];
    if (!a) continue;

    for (let j = i + 1; j < enemies.length; j++) {
      const b = enemies[j];
      if (!b) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 0.0001;
      const minDist = (a.r + b.r) * 0.98;

      if (d < minDist) {
        const nx = dx / d;
        const ny = dy / d;
        const push = (minDist - d) * 0.5 * k;

        a.x -= nx * push;
        a.y -= ny * push;
        b.x += nx * push;
        b.y += ny * push;
      }
    }
  }

  if (!world) return;

  for (const e of enemies) {
    if (!e) continue;
    e.x = clamp(e.x, e.r, world.w - e.r);
    e.y = clamp(e.y, e.r, world.h - e.r);
  }
}