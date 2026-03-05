// src/updateEnemies.js
export function updateEnemies(dt, state) {
  const {
    enemies,
    player,
    world,
    islands,
    mode,
    norm,
    rand,
    spawnProjectile,
    ENEMY_SPEED,
    ENEMY_FIRE_ENABLED,
    ENEMY_FIRE_COOLDOWN,
    ENEMY_BULLET_SPEED,
    ENEMY_BULLET_TTL,
    ENEMY_AGGRO_TIME,
  } = state;

  const w = world.w;
  const h = world.h;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const inBonusmap = mode === "bonusmap";
  const inOverworld = mode !== "bonusmap";

  // Separation einmal pro Frame
  function resolveEnemySeparation(list) {
    const k = 0.6;
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      if (!a) continue;
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j];
        if (!b) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.0001;
        const minDist = (a.r + b.r) * 0.98;

        if (d < minDist) {
          const nx = dx / d, ny = dy / d;
          const push = (minDist - d) * 0.5 * k;
          a.x -= nx * push; a.y -= ny * push;
          b.x += nx * push; b.y += ny * push;
        }
      }
    }
  }

  // ---- per enemy
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (!e) continue;

    // timers
    e.hitT = Math.max(0, (e.hitT ?? 0) - dt);
    e.aggroT = Math.max(0, (e.aggroT ?? 0) - dt);
    e.stunT = Math.max(0, (e.stunT ?? 0) - dt);

    const isAggro = (e.aggroT ?? 0) > 0;

    // init direction if missing
    if (!Number.isFinite(e.vx) || !Number.isFinite(e.vy) || (Math.abs(e.vx) + Math.abs(e.vy) < 0.001)) {
      const a = Math.random() * Math.PI * 2;
      e.vx = Math.cos(a);
      e.vy = Math.sin(a);
      e.turnT = rand(0.8, 1.8);
    }

    // vector to player
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;

    // ---- AI: Overworld = cruisen, aber wenn Aggro dann “combat steering”
    let desiredX = e.vx;
    let desiredY = e.vy;

    if (inOverworld) {
      if (!isAggro) {
        // cruisen: leichte Richtungsänderungen alle X Sekunden
        e.turnT = (e.turnT ?? 0) - dt;
        if (e.turnT <= 0) {
          e.turnT = rand(0.8, 1.8);
          let vx = e.vx + rand(-0.45, 0.45);
          let vy = e.vy + rand(-0.45, 0.45);
          const n = norm(vx, vy);
          e.vx = n.x; e.vy = n.y;
        }
        desiredX = e.vx;
        desiredY = e.vy;
      } else {
        // Aggro combat steering (nur wenn du zuerst geschossen hast -> aggroT gesetzt)
        if (e.type === "rammer") {
          desiredX = ux; desiredY = uy;
        } else if (e.type === "tank") {
          const preferred = 160;
          if (dist > preferred) { desiredX = ux; desiredY = uy; }
          else if (dist < preferred * 0.7) { desiredX = -ux; desiredY = -uy; }
          else { desiredX = ux * 0.35 + (-uy) * 0.65; desiredY = uy * 0.35 + (ux) * 0.65; }
        } else {
          // basic
          const preferred = 220;
          if (dist < preferred * 0.8) { desiredX = -ux; desiredY = -uy; }
          else if (dist > preferred * 1.2) { desiredX = ux; desiredY = uy; }
          else { desiredX = -uy; desiredY = ux; }
        }
      }
    } else {
      // Bonusmap: immer combat steering
      if (e.type === "rammer") {
        desiredX = ux; desiredY = uy;
      } else if (e.type === "tank") {
        const preferred = 150;
        if (dist > preferred) { desiredX = ux; desiredY = uy; }
        else if (dist < preferred * 0.7) { desiredX = -ux; desiredY = -uy; }
        else { desiredX = ux * 0.35 + (-uy) * 0.65; desiredY = uy * 0.35 + (ux) * 0.65; }
      } else {
        // basic
        const preferred = 200;
        if (dist < preferred * 0.8) { desiredX = -ux; desiredY = -uy; }
        else if (dist > preferred * 1.2) { desiredX = ux; desiredY = uy; }
        else { desiredX = -uy; desiredY = ux; }
      }
    }

    // normalize desired
    {
      const L = Math.hypot(desiredX, desiredY) || 1;
      desiredX /= L; desiredY /= L;
    }

    // smooth turn
    const turn =
      e.type === "tank" ? 0.05 :
      e.type === "rammer" ? 0.10 :
      0.12;

    e.vx = (e.vx ?? desiredX) + (desiredX - (e.vx ?? desiredX)) * turn;
    e.vy = (e.vy ?? desiredY) + (desiredY - (e.vy ?? desiredY)) * turn;

    // normalize velocity
    {
      const L = Math.hypot(e.vx, e.vy) || 1;
      e.vx /= L; e.vy /= L;
    }

    // ---- Shooting
    // Bonusmap: darf immer (wenn fireEnabled)
    // Overworld: nur wenn Aggro (du hast zuerst geschossen)
    const canReturnFire = inBonusmap ? true : isAggro;

    if (ENEMY_FIRE_ENABLED && canReturnFire && e.fireEnabled) {
      const cd = e.fireCooldown ?? ENEMY_FIRE_COOLDOWN;
      e.fireT = (e.fireT ?? cd) - dt;

      if (e.fireT <= 0) {
        // range check
        if (dist < 520) {

          const u = norm(dx, dy);
          const isDisabler = e.type === "disabler";

          spawnProjectile({
            x: e.x + u.x * (e.r + 4),
            y: e.y + u.y * (e.r + 4),
            vx: u.x * ENEMY_BULLET_SPEED,
            vy: u.y * ENEMY_BULLET_SPEED,
            fromEnemy: true,
            dmg: 1,
            ttl: ENEMY_BULLET_TTL,
            r: 3,

            //Statuseffekt
            effect: isDisabler ?{kind: "slow", t: 1.2, mul: 0.6} : null,
          });
        }
        e.fireT = cd;
      }
    }

    // ---- Movement (stun blocks movement, aber Shooting oben läuft trotzdem)
    if ((e.stunT ?? 0) > 0) continue;

    const spMul = (state.enemyTypes?.[e.type]?.speed ?? 1.0);
    const baseSpeed = (e.speed ?? ENEMY_SPEED);
    const speed = baseSpeed * spMul;
    const inCombat = e.aggroT > 0;

    if(!inCombat && e.stunT <= 0) {
    e.x += e.vx * speed * dt;
    e.y += e.vy * speed * dt;
    }
    // bounce world bounds
    if (e.x < e.r) { e.x = e.r; e.vx *= -1; }
    if (e.x > w - e.r) { e.x = w - e.r; e.vx *= -1; }
    if (e.y < e.r) { e.y = e.r; e.vy *= -1; }
    if (e.y > h - e.r) { e.y = h - e.r; e.vy *= -1; }

    e.x = clamp(e.x, e.r, w - e.r);
    e.y = clamp(e.y, e.r, h - e.r);

    // island pushout
    if (islands?.resolveCircle) {
      islands.resolveCircle(e);
      e.x = clamp(e.x, e.r, w - e.r);
      e.y = clamp(e.y, e.r, h - e.r);
    }
  }

  // after movement
  resolveEnemySeparation(enemies);
}