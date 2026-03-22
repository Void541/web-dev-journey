import { getEquippedCannons, getCannonStats } from "./cannons.js";

export function createPlayerCombat() {
  return {
    targetId: null,
  };
}

export function getTargetEnemy(state) {
  const { combat, enemies } = state;

  if (!combat?.targetId) return null;
  return enemies.find((e) => e && e.id === combat.targetId) || null;
}

export function fireCannonAtTarget(state, target, cannonId) {
  if (!cannonId) return false;

  const cannon = getCannonStats(cannonId);
  if (!cannon) return false;

  const dx = target.x - state.player.x;
  const dy = target.y - state.player.y;
  const d = Math.hypot(dx, dy) || 1;

  const dirX = dx / d;
  const dirY = dy / d;

  state.spawnProjectile({
    x: state.player.x,
    y: state.player.y,
    vx: dirX * cannon.projectileSpeed,
    vy: dirY * cannon.projectileSpeed,
    dmg: cannon.damage,
    ttl: 2,
    r: 3,
  });

  return true;
}

export function updatePlayerCombat(dt, state) {
  const { combat, player } = state;
  if (!combat) return;

  if (state.mode === "pirateCove") {
    combat.targetId = null;
    return;
  }

  const target = getTargetEnemy(state);

  if (combat.targetId && !target) {
    combat.targetId = null;
  }

  if (!target) return;

  const cannons = getEquippedCannons(state);
  state.playerLoadout = state.playerLoadout ?? {};
  state.playerLoadout.cooldowns = state.playerLoadout.cooldowns ?? [0, 0, 0];

  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const d = Math.hypot(dx, dy);

  // Reichweite prüfen:
  // Wenn mindestens eine belegte Kanone in Reichweite ist, darf geschossen werden
  let anyInRange = false;
  for (let i = 0; i < cannons.length; i++) {
    const cannonId = cannons[i];
    if (!cannonId) continue;

    const cannon = getCannonStats(cannonId);
    if (d <= cannon.range) {
      anyInRange = true;
      break;
    }
  }

  if (!anyInRange || target.hp <= 0) {
    combat.targetId = null;
    return;
  }

  // Cooldowns runterzählen
  for (let i = 0; i < state.playerLoadout.cooldowns.length; i++) {
    state.playerLoadout.cooldowns[i] = Math.max(
      0,
      (state.playerLoadout.cooldowns[i] ?? 0) - dt
    );
  }

  // Jede Kanone feuert einzeln, wenn ihr Slot-Cooldown abgelaufen ist
  for (let i = 0; i < cannons.length; i++) {
    const cannonId = cannons[i];
    if (!cannonId) continue;

    const cannon = getCannonStats(cannonId);
    if (d > cannon.range) continue;

    const cd = state.playerLoadout.cooldowns[i] ?? 0;
    if (cd > 0) continue;

    const fired = fireCannonAtTarget(state, target, cannonId);
    if (fired) {
      state.playerLoadout.cooldowns[i] = 1 / cannon.fireRate;
    }
  }
}