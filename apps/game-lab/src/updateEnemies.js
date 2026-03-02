// src/updateEnemies.js
export function updateEnemies(dt, state) {
  const {
    enemies, player, canvas,
    ENEMY_SPEED,
    ENEMY_FIRE_ENABLED,
    ENEMY_FIRE_COOLDOWN,
    ENEMY_BULLET_SPEED,
    ENEMY_BULLET_TTL,
    ENEMY_AGGRO_TIME,
    norm, rand,
    spawnProjectile,
    islands, // ✅
  } = state;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (!e) continue;

    e.hitT = Math.max(0, (e.hitT ?? 0) - dt);

    // Aggro timer
    e.aggroT = Math.max(0, (e.aggroT ?? 0) - dt);
    const isAggro = e.aggroT > 0;

    // Shooting (auch wenn stunned)
    if (ENEMY_FIRE_ENABLED && isAggro) {
      e.fireT = (e.fireT ?? ENEMY_FIRE_COOLDOWN) - dt;

      if (e.fireT <= 0) {
        e.fireT = ENEMY_FIRE_COOLDOWN;

        const dx = player.x - e.x;
        const dy = player.y - e.y;
        const d = Math.hypot(dx, dy);

        if (d < 520) {
          const u = norm(dx, dy);
          spawnProjectile({
            x: e.x,
            y: e.y,
            vx: u.x * ENEMY_BULLET_SPEED,
            vy: u.y * ENEMY_BULLET_SPEED,
            fromEnemy: true,
            dmg: 1,
            ttl: ENEMY_BULLET_TTL,
            r: 4,
          });
        }
      }
    }

    // Movement only if not stunned
    if (e.stunned) continue;

    // Wander
    e.turnT = (e.turnT ?? 0) - dt;
    if (e.turnT <= 0) {
      e.turnT = rand(0.4, 1.2);
      e.vx = (e.vx ?? 0) + rand(-0.6, 0.6);
      e.vy = (e.vy ?? 0) + rand(-0.6, 0.6);
      const n = norm(e.vx, e.vy);
      e.vx = n.x;
      e.vy = n.y;
    }

    // Move
    e.x += e.vx * ENEMY_SPEED * dt;
    e.y += e.vy * ENEMY_SPEED * dt;

    // Bounce screen
    if (e.x < e.r || e.x > canvas.clientWidth - e.r) e.vx *= -1;
    if (e.y < e.r || e.y > canvas.clientHeight - e.r) e.vy *= -1;

    // Clamp screen
    e.x = clamp(e.x, e.r, canvas.clientWidth - e.r);
    e.y = clamp(e.y, e.r, canvas.clientHeight - e.r);

    // ✅ Island collision push-out (der Key!)
    if (islands?.resolveCircle) {
      islands.resolveCircle(e);
      // optional: nach Push-Out nochmal clampen
      e.x = clamp(e.x, e.r, canvas.clientWidth - e.r);
      e.y = clamp(e.y, e.r, canvas.clientHeight - e.r);
    }
  }
}