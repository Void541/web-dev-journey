export function createPlayerCombat() {
  return {
    targetId: null,
    range: 520,
    fireRate: 0.9,
    cooldown: 0,
    projectileSpeed: 720,
    damage: 1,
  };
}

export function getTargetEnemy(state) {
  const { combat, enemies } = state;

  if (!combat.targetId) return null;
  return enemies.find((e) => e && e.id === combat.targetId) || null;
}

export function fireAtTarget(state, target) {
  const { player, combat, effects, shipStats, spawnProjectile } = state;

  if (!target) return false;

  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const d = Math.hypot(dx, dy) || 1;

  const u = {
    x: dx / d,
    y: dy / d,
  };

  const startX = player.x + u.x * (player.r + 6);
  const startY = player.y + u.y * (player.r + 6);
  const ttl = d / combat.projectileSpeed + 0.35;

  spawnProjectile({
    x: startX,
    y: startY,
    vx: u.x * combat.projectileSpeed,
    vy: u.y * combat.projectileSpeed,
    fromEnemy: false,
    dmg: shipStats?.getDamage?.() ?? combat.damage ?? 1,
    ttl,
    r: 3,
  });

  effects.push({
    type: "flash",
    x: startX,
    y: startY,
    t: 0.08,
  });

  return true;
}

export function updatePlayerCombat(dt, state) {
  const { combat } = state;

  const target = getTargetEnemy(state);

  if (combat.targetId && !target) {
    combat.targetId = null;
  }

  combat.cooldown = Math.max(0, combat.cooldown - dt);

  if (!target) return;

  const dx = target.x - state.player.x;
  const dy = target.y - state.player.y;
  const d = Math.hypot(dx, dy);

  if (d > combat.range || target.hp <= 0) {
    combat.targetId = null;
    return;
  }

  if (combat.cooldown <= 0) {
    const fired = fireAtTarget(state, target);

    if (fired) {
      combat.cooldown = 1 / combat.fireRate;
    }
  }
}