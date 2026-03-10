// src/updateProjectiles.js
export function updateProjectiles(dt, state) {
  const { world, player, enemies, projectiles, combat, dist2 } = state;

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];

    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.ttl -= dt;

    const out =
      p.ttl <= 0 ||
      p.x < -80 || p.x > world.w + 80 ||
      p.y < -80 || p.y > world.h + 80;

    if (out) {
      projectiles.splice(i, 1);
      continue;
    }

    if (p.fromEnemy) {
      const rr = p.r + player.r;

      if (dist2(p.x, p.y, player.x, player.y) <= rr * rr) {
        player.hp -= p.dmg;

        if (p.effect?.kind === "slow") {
          player.slowT = Math.max(player.slowT ?? 0, p.effect.t ?? 1.2);
          player.slowMul = p.effect.mul ?? 0.6;
        }

        state.onPlayerHit?.(p);
        projectiles.splice(i, 1);
        continue;
      }
    } else {
      for (let ei = enemies.length - 1; ei >= 0; ei--) {
        const e = enemies[ei];
        if (!e) continue;

        const rr = p.r + e.r;

        if (dist2(p.x, p.y, e.x, e.y) <= rr * rr) {
          e.hp -= p.dmg;
          e.hitT = 0.12;
          e.aggroT = state.ENEMY_AGGRO_TIME;
          e.stunT = 0.35;

          state.damage?.spawn?.(e.x, e.y - e.r - 10, p.dmg);

          projectiles.splice(i, 1);

          if (e.hp <= 0) {
            if (combat.targetId === e.id) {
              combat.targetId = null;
            }

            const drop = state.lootTable?.rollForEnemy?.(e) ?? {
              loot: { wood: 2, metal: 1 },
              gold: state.enemyTypes?.[e.type]?.gold ?? 1,
            };

            state.onEnemyKilled?.(e, drop);
            enemies.splice(ei, 1);
          }

          break;
        }
      }
    }
  }
}