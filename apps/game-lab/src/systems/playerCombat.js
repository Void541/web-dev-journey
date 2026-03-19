import { getEquippedCannon } from "./cannons.js";

export function createPlayerCombat() {
  return {
    targetId: null,
    cooldown: 0,
  };
}

export function getTargetEnemy(state) {
  const { combat, enemies } = state;

  if (!combat?.targetId) return null;
  return enemies.find((e) => e && e.id === combat.targetId) || null;
}

export function fireAtTarget(state, target) {
  const { player, combat } = state;
  if (!target || !player || !combat) return false;

  const cannon = getEquippedCannon(state);

  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const d = Math.hypot(dx, dy) || 1;

  const nx = dx / d;
  const ny = dy / d;

  const muzzleX = player.x + nx * (player.r + 8);
  const muzzleY = player.y + ny * (player.r + 8);

  state.spawnProjectile?.({
    x: muzzleX,
    y: muzzleY,
    vx: nx * cannon.projectileSpeed,
    vy: ny * cannon.projectileSpeed,
    fromEnemy: false,
    dmg: cannon.damage,
    ttl: d / cannon.projectileSpeed + 0.35,
    r: 3,
  });

  state.effects?.push({
    x: muzzleX,
    y: muzzleY,
    t: 0.12,
  });

  return true;
}

export function updatePlayerCombat(dt, state) {
  const cannon = getEquippedCannon(state);
  const { combat, player } = state;

  if (!combat) return;

  if (state.mode === "pirateCove") {
    combat.targetId = null;
    combat.cooldown = 0;
    return;
  }

  const target = getTargetEnemy(state);

  if (combat.targetId && !target) {
    combat.targetId = null;
  }

  // Cooldown runterzählen
  combat.cooldown = Math.max(0, combat.cooldown - dt);

  if (!target) return;

  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const d = Math.hypot(dx, dy);

  // 🔥 FIX: range kommt jetzt aus cannon
  if (d > cannon.range || target.hp <= 0) {
    combat.targetId = null;
    return;
  }

  if (combat.cooldown <= 0) {
    const fired = fireAtTarget(state, target);
    if (fired) {
      // 🔥 FIX: cooldown gehört zu combat
      combat.cooldown = 1 / cannon.fireRate;
    }
  }
}