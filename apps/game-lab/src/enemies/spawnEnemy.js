import * as CFG from "../config.js";
import { pickEnemyType } from "./pickEnemyType.js";

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function norm(dx, dy) {
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len, len };
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function spawnEnemy(state, options = {}) {
  const { enemies, enemyTypes, islands, world } = state;

  const {
    type: forcedType = null,
    admiral = false,
    x: forcedX = null,
    y: forcedY = null,
  } = options;

  const type = forcedType ?? pickEnemyType(enemyTypes);
  const tcfg = enemyTypes[type];

  const hpMul = admiral ? 3.0 : 1.0;
  const radiusMul = admiral ? 1.35 : 1.0;
  const fireCooldownMul = admiral ? 0.75 : 1.0;
  const goldBonus = admiral ? 12 : 0;
  const damageMul = admiral ? 2.0 : 1.0;

  const r = Math.round((tcfg.r ?? 16) * radiusMul);
  const maxHp = Math.round((tcfg.hp ?? 5) * hpMul);

  const margin = r + 6;
  const side = Math.floor(Math.random() * 4);

let x = forcedX;
let y = forcedY;

if (x == null || y == null) {
  if (admiral) {
    const nearPlayerRangeX = 320;
    const nearPlayerRangeY = 220;

    x = clamp(
      state.player.x + rand(-nearPlayerRangeX, nearPlayerRangeX),
      margin,
      world.w - margin
    );
    y = clamp(
      state.player.y + rand(-nearPlayerRangeY, nearPlayerRangeY),
      margin,
      world.h - margin
    );
  } else {
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

    if (admiral) {
      x = clamp(
        state.player.x + rand(-nearPlayerRangeX, nearPlayerRangeX),
        margin,
        world.w - margin
      );
      y = clamp(
        state.player.y + rand(-nearPlayerRangeY, nearPlayerRangeY),
        margin,
        world.h - margin
      );
    } else {
      x = rand(margin, world.w - margin);
      y = rand(margin, world.h - margin);
    }
  }
}

  const cx = world.w * 0.5 + rand(-CFG.SPAWN_CENTER_VARIANCE, CFG.SPAWN_CENTER_VARIANCE);
  const cy = world.h * 0.5 + rand(-CFG.SPAWN_CENTER_VARIANCE, CFG.SPAWN_CENTER_VARIANCE);
  const dir = norm(cx - x, cy - y);

  const baseName = state.randomEnemyName?.(type) ?? type;

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
    fireCooldown: (tcfg.fireCooldown ?? 1.2) * fireCooldownMul,
    turnT: rand(0.4, 1.2),
    hitT: 0,
    fireT: (tcfg.fireCooldown ?? 1.2) * fireCooldownMul,
    aggroT: 0,
    stunT: 0,
    color: tcfg.color,
    speed: (state.ENEMY_SPEED ?? 90) * (tcfg.speedMul ?? 1.0),
    name: admiral ? `Admiral ${baseName}` : baseName,
    isAdmiral: admiral,
    goldBonus,
    damageMul
  };


  console.log("SPAWN ENEMY", {
  type,
  admiral,
  isAdmiral: enemy.isAdmiral,
  name: enemy.name,
  x: enemy.x,
  y: enemy.y,
});

  enemies.push(enemy);

  const cap = state.cfg?.ENEMY_CAP ?? 30;
  if (enemies.length > cap) {
    enemies.shift();
  }

  return enemy;
}