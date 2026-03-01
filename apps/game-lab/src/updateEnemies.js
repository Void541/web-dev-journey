// src/updateEnemies.js
export function updateEnemies(dt, state) {
  const {
    enemies,
    player,
    canvas,
    ENEMY_SPEED,
    ENEMY_FIRE_ENABLED,
    ENEMY_FIRE_COOLDOWN,
    ENEMY_BULLET_SPEED,
    ENEMY_BULLET_TTL,
    norm,
    rand,
    spawnProjectile,
  } = state;

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  // IMPORTANT: movement/bounds in CSS pixels (because ctx.setTransform(dpr,..))
  const CW = canvas.clientWidth;
  const CH = canvas.clientHeight;

  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (!e) continue;

    e.hitT = Math.max(0, e.hitT - dt);

    // Aggro timer
    e.aggroT = Math.max(0, (e.aggroT ?? 0) - dt);
    const isAggro = e.aggroT > 0;

    // Unfreeze wenn Aggro vorbei
    if (e.stunned && !isAggro) {
      e.stunned = false;

      //neue Richtung geben
        e.vx = rand(-1, 1);
        e.vy = rand(-1, 1);
        const n = norm(e.vx, e.vy);
        e.vx = n.x;
        e.vy = n.y;

        //turn timer neustarten
        e.turnT = rand(0.4, 1.2);
    }

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

    e.turnT -= dt;
    if (e.turnT <= 0) {
      e.turnT = rand(0.4, 1.2);
      e.vx += rand(-0.6, 0.6);
      e.vy += rand(-0.6, 0.6);
      const n = norm(e.vx, e.vy);
      e.vx = n.x;
      e.vy = n.y;
    }

    e.x += e.vx * ENEMY_SPEED * dt;
    e.y += e.vy * ENEMY_SPEED * dt;

    // bounce
    if (e.x < e.r || e.x > CW - e.r) e.vx *= -1;
    if (e.y < e.r || e.y > CH - e.r) e.vy *= -1;

    // clamp (CSS px)
    e.x = clamp(e.x, e.r, CW - e.r);
    e.y = clamp(e.y, e.r, CH - e.r);
  }
}