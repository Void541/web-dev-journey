import {
  updateEnemyTimers,
  ensureEnemyDirection,
  getVectorToPlayer,
  getDesiredDirection,
  applySteering,
} from "./enemyAI.js";
import { updateEnemyShooting } from "./enemyShooting.js";
import { updateEnemyMovement } from "./enemyMovement.js";
import { resolveEnemySeparation } from "./enemySeparation.js";

export function updateEnemies(dt, state) {
  const { enemies, player, rand, world } = state;

  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (!e) continue;

    updateEnemyTimers(e, dt);
    ensureEnemyDirection(e, rand);

    const toPlayer = getVectorToPlayer(e, player);
    const desired = getDesiredDirection(e, state, toPlayer, dt);

    applySteering(e, desired, state);
    updateEnemyShooting(e, dt, state, toPlayer);
    updateEnemyMovement(e, dt, state);
  }

  resolveEnemySeparation(enemies, world);
}