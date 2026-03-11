export function updateEnemyShooting(e, dt, state, toPlayer) {
  const {
    mode,
    ENEMY_FIRE_ENABLED,
    ENEMY_FIRE_COOLDOWN,
    ENEMY_BULLET_SPEED,
    ENEMY_BULLET_TTL,
    spawnProjectile,
    enemyTypes,
  } = state;

  const inBonusmap = mode === "bonusmap";
  const isAggro = (e.aggroT ?? 0) > 0;
  const canReturnFire = inBonusmap ? true : isAggro;

  if (!ENEMY_FIRE_ENABLED || !canReturnFire || !e.fireEnabled) return;

  const cd = e.fireCooldown ?? ENEMY_FIRE_COOLDOWN;
  e.fireT = (e.fireT ?? cd) - dt;

  if (e.fireT > 0) return;

  if (toPlayer.dist < 520) {
    const isDisabler = e.type === "disabler";
    const bulletSpeed = enemyTypes?.[e.type]?.bulletSpeed ?? ENEMY_BULLET_SPEED;

    spawnProjectile({
      x: e.x + toPlayer.ux * (e.r + 4),
      y: e.y + toPlayer.uy * (e.r + 4),
      vx: toPlayer.ux * bulletSpeed,
      vy: toPlayer.uy * bulletSpeed,
      fromEnemy: true,
      isAdmiralShot: !!e.isAdmiral,
      dmg: Math.max(1, Math.round(1 * (e.damageMul ?? 1))),
      ttl: ENEMY_BULLET_TTL,
      r: 3,
      effect: isDisabler
        ? { kind: "slow", t: 1.2, mul: 0.6 }
        : null,
  });
}

  e.fireT = cd;
}