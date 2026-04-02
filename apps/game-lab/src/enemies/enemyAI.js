export function updateEnemyTimers(e, dt) {
  e.hitT = Math.max(0, (e.hitT ?? 0) - dt);
  e.aggroT = Math.max(0, (e.aggroT ?? 0) - dt);
  e.stunT = Math.max(0, (e.stunT ?? 0) - dt);
}

export function ensureEnemyDirection(e, rand) {
  const invalidDir =
    !Number.isFinite(e.vx) ||
    !Number.isFinite(e.vy) ||
    (Math.abs(e.vx) + Math.abs(e.vy) < 0.001);

  if (!invalidDir) return;

  const angle = Math.random() * Math.PI * 2;
  e.vx = Math.cos(angle);
  e.vy = Math.sin(angle);
  e.turnT = rand(0.8, 1.8);
}

export function getVectorToPlayer(e, player) {
  const dx = player.x - e.x;
  const dy = player.y - e.y;
  const dist = Math.hypot(dx, dy) || 1;

  return {
    dx,
    dy,
    dist,
    ux: dx / dist,
    uy: dy / dist,
  };
}

export function updateCruiseDirection(e, dt, rand, norm) {
  e.turnT = (e.turnT ?? 0) - dt;

  if (e.turnT > 0) return;

  e.turnT = rand(0.8, 1.8);

  const vx = (e.vx ?? 0) + rand(-0.45, 0.45);
  const vy = (e.vy ?? 0) + rand(-0.45, 0.45);
  const n = norm(vx, vy);

  e.vx = n.x;
  e.vy = n.y;
}

function getOrbitDirection(toPlayer, preferredRange) {
  const { ux, uy, dist } = toPlayer;

  let desiredX;
  let desiredY;

  if (dist < preferredRange * 0.8) {
    desiredX = -ux;
    desiredY = -uy;
  } else if (dist > preferredRange * 1.2) {
    desiredX = ux;
    desiredY = uy;
  } else {
    desiredX = -uy;
    desiredY = ux;
  }

  const len = Math.hypot(desiredX, desiredY) || 1;
  return { x: desiredX / len, y: desiredY / len };
}

function getTankDirection(toPlayer, preferredRange) {
  const { ux, uy, dist } = toPlayer;

  let desiredX;
  let desiredY;

  if (dist > preferredRange) {
    desiredX = ux;
    desiredY = uy;
  } else if (dist < preferredRange * 0.7) {
    desiredX = -ux;
    desiredY = -uy;
  } else {
    desiredX = ux * 0.35 + (-uy) * 0.65;
    desiredY = uy * 0.35 + (ux) * 0.65;
  }

  const len = Math.hypot(desiredX, desiredY) || 1;
  return { x: desiredX / len, y: desiredY / len };
}

function getRammerDirection(toPlayer) {
  const { ux, uy } = toPlayer;
  return { x: ux, y: uy };
}

function getSniperDirection(toPlayer, preferredRange) {
  const { ux, uy, dist } = toPlayer;

  let desiredX;
  let desiredY;

  if (dist < preferredRange * 0.9) {
    desiredX = -ux;
    desiredY = -uy;
  } else if (dist > preferredRange * 1.1) {
    desiredX = ux;
    desiredY = uy;
  } else {
    desiredX = -uy;
    desiredY = ux;
  }

  const len = Math.hypot(desiredX, desiredY) || 1;
  return { x: desiredX / len, y: desiredY / len };
}

function getKiteDirection(toPlayer, preferredRange) {
  const { ux, uy, dist } = toPlayer;

  let desiredX;
  let desiredY;

  if (dist < preferredRange) {
    desiredX = -ux * 0.8 + -uy * 0.2;
    desiredY = -uy * 0.8 + ux * 0.2;
  } else {
    desiredX = -uy;
    desiredY = ux;
  }

  const len = Math.hypot(desiredX, desiredY) || 1;
  return { x: desiredX / len, y: desiredY / len };
}

export function getCombatDesiredDirection(e, state, toPlayer) {
  const tcfg = state.enemyTypes?.[e.type] ?? {};
  const ai = tcfg.ai ?? "orbit";
  const preferredRange = tcfg.preferredRange ?? 200;

  switch (ai) {
    case "rammer":
      return getRammerDirection(toPlayer);

    case "tank":
      return getTankDirection(toPlayer, preferredRange);

    case "sniper":
      return getSniperDirection(toPlayer, preferredRange);

    case "kite":
      return getKiteDirection(toPlayer, preferredRange);

    case "orbit":
    default:
      return getOrbitDirection(toPlayer, preferredRange);
  }
}

export function getDesiredDirection(e, state, toPlayer, dt) {
  const { mode, rand, norm } = state;

  const inOverworld = mode === "overworld";
  const isAggro = (e.aggroT ?? 0) > 0;

  if (inOverworld && !isAggro) {
    updateCruiseDirection(e, dt, rand, norm);

    const len = Math.hypot(e.vx, e.vy) || 1;
    return {
      x: e.vx / len,
      y: e.vy / len,
    };
  }

  return getCombatDesiredDirection(e, state, toPlayer);
}

export function applySteering(e, desired, state) {
  const tcfg = state.enemyTypes?.[e.type] ?? {};
  const ai = tcfg.ai ?? "orbit";

  const turn =
    ai === "tank" ? 0.05 :
    ai === "rammer" ? 0.10 :
    0.12;

  e.vx = (e.vx ?? desired.x) + (desired.x - (e.vx ?? desired.x)) * turn;
  e.vy = (e.vy ?? desired.y) + (desired.y - (e.vy ?? desired.y)) * turn;

  const len = Math.hypot(e.vx, e.vy) || 1;
  e.vx /= len;
  e.vy /= len;
}
