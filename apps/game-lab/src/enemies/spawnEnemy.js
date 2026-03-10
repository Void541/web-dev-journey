import * as CFG from "../config.js";
import { pickEnemyType } from "./pickEnemyType.js";

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function norm(dx, dy) {
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len, len };
}

export function spawnEnemy(state) {
  const { enemies, enemyTypes, islands, world } = state;

  const type = pickEnemyType(enemyTypes);
  const tcfg = enemyTypes[type];

  const r = tcfg.r ?? 16;
  const maxHp = tcfg.hp ?? 5;

  const margin = r + 6;
  const side = Math.floor(Math.random() * 4);

  let x = 0;
  let y = 0;

  if (side === 0) {
    x = rand(margin, world.w - margin);
    y = margin;
  } else if (side === 1) {
    x = world.w - margin;
    y = rand(margin, world.h - margin);
  } else if (side === 2) {
    x = rand(margin, world.w - margin);
    y = world.h - margin;
  } else {
    x = margin;
    y = rand(margin, world.h - margin);
  }

  let tries = 0;
  while (tries++ < CFG.SPAWN_TRIES) {
    let ok = true;

    for (const c of islands.getColliders()) {
      const d = Math.hypot(x - c.x, y - c.y);
      if (d < c.r + r + 6) {
        ok = false;
        break;
      }
    }

    if (ok) break;

    x = rand(margin, world.w - margin);
    y = rand(margin, world.h - margin);
  }

  const cx = world.w * 0.5 + rand(-CFG.SPAWN_CENTER_VARIANCE, CFG.SPAWN_CENTER_VARIANCE);
  const cy = world.h * 0.5 + rand(-CFG.SPAWN_CENTER_VARIANCE, CFG.SPAWN_CENTER_VARIANCE);
  const dir = norm(cx - x, cy - y);

  const enemy = {
    id: state.enemyRuntime.nextId++,
    type,
    x,
    y,
    r,
    hp: maxHp,
    maxHp,
    vx: dir.x,
    vy: dir.y,
    fireEnabled: tcfg.fireEnabled ?? true,
    fireCooldown: tcfg.fireCooldown ?? 1.2,
    turnT: rand(0.4, 1.2),
    hitT: 0,
    fireT: tcfg.fireCooldown ?? 1.2,
    aggroT: 0,
    stunT: 0,
    color: tcfg.color,
    speed: (state.ENEMY_SPEED ?? 90) * (tcfg.speedMul ?? 1.0),
    name: state.randomEnemyName?.(type) ?? type,
  };

  enemies.push(enemy);

  const cap = state.cfg?.ENEMY_CAP ?? 30;
  if (enemies.length > cap) {
    enemies.shift();
  }

  return enemy;
}