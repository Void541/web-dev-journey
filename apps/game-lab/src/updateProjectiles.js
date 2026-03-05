// src/updateProjectiles.js
export function updateProjectiles(dt, state) {
  const { canvas, world, player, enemies, projectiles, combat, dist2 } = state;

  const margin = 120; // großzügig

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];

    // move
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.ttl -= dt;

    // IMPORTANT: World bounds (nicht canvas!)
    const out =
      p.ttl <= 0 ||
      p.x < -margin || p.x > world.w + margin ||
      p.y < -margin || p.y > world.h + margin;

    if (out) {
      projectiles.splice(i, 1);
      continue;
    }

    if (p.fromEnemy) {
      // hit player
      const rr = p.r + player.r;
      if (dist2(p.x, p.y, player.x, player.y) <= rr * rr) {
        player.hp -= p.dmg;

        state.onPlayerHit?.(p);

        projectiles.splice(i, 1);
        continue;
      }
    } else {
      // hit enemies
      for (let ei = enemies.length - 1; ei >= 0; ei--) {
        const e = enemies[ei];
        if (!e) continue;

        const rr = p.r + e.r;
        if (dist2(p.x, p.y, e.x, e.y) <= rr * rr) {
          
          // damage
          e.hp -= p.dmg;
          e.hitT = 0.12;

          if(p.effect?.kind === "slow") {
            const t=p.effect.t ?? 1.0;
            player.slowT = Math.max(player.slowT ?? 0, t);
            player.slowMul = p.effect.mul ?? 0.6;
          }
          state.onPlayerHit?.(p);
          projectiles.splice(i, 1);

          // Aggro: nur wenn du zuerst schießt (Overworld)
          // -> Wir setzen aggro immer bei Player-Hit; updateEnemies entscheidet, ob das Fire erlaubt ist.
          e.aggroT = state.ENEMY_AGGRO_TIME ?? 6;

          // kurzer Stun / Stop
          e.stunT = Math.max(e.stunT ?? 0, 0.28);
          // Damage numbers
          if (state.damage?.spawn) {
            state.damage.spawn(e.x, e.y - e.r - 10, p.dmg);
          }

          // remove projectile
          projectiles.splice(i, 1);

          // kill
          if (e.hp <= 0) {
            if (combat?.targetId === e.id) combat.targetId = null;

            state.onEnemyKilled?.(e);
            enemies.splice(ei, 1);
          }
          break;
        }
      }
    }
  }
}