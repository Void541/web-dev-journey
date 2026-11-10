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
  const edgeMargin = e.r + 8;
  const atLeft = e.x <= edgeMargin;
  const atRight = e.x >= w - edgeMargin;
  const atTop = e.y <= edgeMargin;
  const atBottom = e.y >= h - edgeMargin;
  const nearEdge = atLeft || atRight || atTop || atBottom;

  // Allow combat enemies to move inward when they reach a map edge.
  if ((!inCombat || nearEdge) && (e.stunT ?? 0) <= 0) {
    if (nearEdge) {
      if (atLeft) e.vx = Math.max(0.5, e.vx);
      if (atRight) e.vx = Math.min(-0.5, e.vx);
      if (atTop) e.vy = Math.max(0.5, e.vy);
      if (atBottom) e.vy = Math.min(-0.5, e.vy);
      const length = Math.hypot(e.vx, e.vy) || 1;
      e.vx /= length;
      e.vy /= length;
    }
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
