function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function updateEnemyMovement(e, dt, state) {
  const { world, islands, ENEMY_SPEED, enemyTypes } = state;

  const w = world.w;
  const h = world.h;

  const tcfg = enemyTypes?.[e.type] ?? {};
  const speed = ENEMY_SPEED * (tcfg.speedMul ?? 1.0);
  const inCombat = (e.aggroT ?? 0) > 0;

  // Intended behavior:
  // Enemies roam freely only while they are not aggroed.
  if (!inCombat && (e.stunT ?? 0) <= 0) {
    e.x += e.vx * speed * dt;
    e.y += e.vy * speed * dt;
  }

  if (e.x < e.r) {
    e.x = e.r;
    e.vx *= -1;
  }
  if (e.x > w - e.r) {
    e.x = w - e.r;
    e.vx *= -1;
  }
  if (e.y < e.r) {
    e.y = e.r;
    e.vy *= -1;
  }
  if (e.y > h - e.r) {
    e.y = h - e.r;
    e.vy *= -1;
  }

  e.x = clamp(e.x, e.r, w - e.r);
  e.y = clamp(e.y, e.r, h - e.r);

  if (islands?.resolveCircle) {
    islands.resolveCircle(e);
    e.x = clamp(e.x, e.r, w - e.r);
    e.y = clamp(e.y, e.r, h - e.r);
  }
}
