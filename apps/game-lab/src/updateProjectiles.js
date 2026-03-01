// src/updateProjectiles.js
export function updateProjectiles(dt, state) {
  const { canvas, player, enemies, projectiles, combat, dist2 } = state;

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];

    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.ttl -= dt;

    const out =
      p.ttl <= 0 ||
      p.x < -80 || p.x > canvas.width + 80 ||
      p.y < -80 || p.y > canvas.height + 80;

    if (out) {
      projectiles.splice(i, 1);
      continue;
    }

    if (p.fromEnemy) {
      // hit player
      const rr = p.r + player.r;
      if (dist2(p.x, p.y, player.x, player.y) <= rr * rr) {
        player.hp -= p.dmg;
        projectiles.splice(i, 1);
        continue;
      }
    } else {
      // hit enemies
      for (let ei = enemies.length - 1; ei >= 0; ei--) {
        const e = enemies[ei];
        const rr = p.r + e.r;

        if (dist2(p.x, p.y, e.x, e.y) <= rr * rr) {
          e.hp -= p.dmg;
          e.hitT = 0.12;

          // Aggro + stehen bleiben (wenn du das willst)
          e.aggroT = state.ENEMY_AGGRO_TIME;
          e.stunned = true;
          e.vx = 0;
          e.vy = 0;

          // Damage numbers (NEU)
          if (state.damage) {
            // optional crit später
            state.damage.spawn(e.x, e.y - e.r - 10, p.dmg);
          }

          projectiles.splice(i, 1);

          if (e.hp <= 0) {
            if (combat.targetId === e.id) combat.targetId = null;
            enemies.splice(ei, 1);
          }
          break;
        }
      }
    }
  }
}