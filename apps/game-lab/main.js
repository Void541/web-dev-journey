import { startLoop } from "./engine/loop.js";
import { createInput } from "./engine/input.js";
import { clamp } from "./engine/math.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const fpsEl = document.getElementById("fps");
const input = createInput();

// ---------- Canvas fit ----------
function fitCanvas() {
  const wrapper = canvas.parentElement;
  const maxW = wrapper.clientWidth;
  const maxH = wrapper.clientHeight;

  const aspect = 16 / 9;

  let cssW = maxW;
  let cssH = cssW / aspect;

  if (cssH > maxH) {
    cssH = maxH;
    cssW = cssH * aspect;
  }

  const dpr = window.devicePixelRatio || 1;

  // CSS size (layout)
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;

  // Real pixel buffer (drawing resolution)
  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);

  // Normalize drawing coords back to CSS pixels
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", fitCanvas);
fitCanvas();

// ---------- Utils ----------
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function dist2(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}
function norm(dx, dy) {
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len, len };
}
function getMousePos(evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (evt.clientX - rect.left) * (canvas.width / rect.width),
    y: (evt.clientY - rect.top) * (canvas.height / rect.height),
  };
}

// ---------- Tuning ----------
const GRID_STEP = 48;

const PLAYER_SPEED = 260;
const PLAYER_R = 14;
const PLAYER_MAX_HP = 10;

const ENEMY_SPAWN_EVERY = 1.2;
const ENEMY_SPEED = 90;
const ENEMY_R = 16;
const ENEMY_MAX_HP = 5;
const ENEMY_CAP = 30;

const ENEMY_FIRE_ENABLED = true;
const ENEMY_FIRE_COOLDOWN = 1.2;
const ENEMY_BULLET_SPEED = 320;
const ENEMY_BULLET_TTL = 2.6;

const TRAIL_MAX = 80;

// Seafight-ish combat
const combat = {
  targetId: null,
  range: 520,
  fireRate: 0.9, // shots per second
  cooldown: 0,
  projectileSpeed: 720,
  damage: 1,
};
const ENEMY_AGGRO_DECAY = 4.0; // optional, for UI purposes (z.B. rotes HP-Bar-Overlay, das mit Aggro-Time hochgeht und langsam wieder runterfaded)

// ---------- State ----------
const player = {
  x: 200,
  y: 200,
  r: PLAYER_R,
  hp: PLAYER_MAX_HP,
  maxHp: PLAYER_MAX_HP,
};

const enemies = []; // {id,x,y,r,hp,maxHp,vx,vy,turnT,hitT,fireT}
const projectiles = []; // {x,y,vx,vy,r,ttl,dmg,fromEnemy:boolean}
const effects = []; // {x,y,t,type}
const trail = []; // {x,y,t}

let paused = false;
let spawnTimer = 0;
let time = 0;
let fpsSmoothing = 0;

let enemyIdCounter = 1;

// ---------- Pause ----------
const loop = startLoop({ update, render });

function togglePause() {
  paused = !paused;
  loop.setPaused(paused);
}
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "p") togglePause();
});

// ---------- Theme toggle ----------
const themeBtn = document.getElementById("themeToggle");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const root = document.documentElement;
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
  });
}

// ---------- Targeting ----------
function findEnemyAt(x, y) {
  // topmost (last) enemy wins
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (!e) continue;
    const rr = (e.r + 8) * (e.r + 8); // clickable padding
    if (dist2(x, y, e.x, e.y) <= rr) return e;
  }
  return null;
}

canvas.addEventListener("click", (ev) => {
  const m = getMousePos(ev);
  const e = findEnemyAt(m.x, m.y);
  combat.targetId = e ? e.id : null;
});

// ---------- Spawning ----------
function spawnEnemy() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  ctx.clearRect(0, 0, w, h);

 const step = 48;

ctx.beginPath();
for (let x = 0; x <= w; x += step) {
  ctx.moveTo(x, 0);
  ctx.lineTo(x, h);
}
for (let y = 0; y <= h; y += step) {
  ctx.moveTo(0, y);
  ctx.lineTo(w, y);
}
ctx.stroke();

  const margin = ENEMY_R + 6; // sicher innerhalb
  const side = Math.floor(Math.random() * 4);

  let x = 0, y = 0;

  if (side === 0) {           // top
    x = rand(margin, w - margin);
    y = margin;
  } else if (side === 1) {    // right
    x = w - margin;
    y = rand(margin, h - margin);
  } else if (side === 2) {    // bottom
    x = rand(margin, w - margin);
    y = h - margin;
  } else {                    // left
    x = margin;
    y = rand(margin, h - margin);
  }

  // Richtung grob zur Mitte + bisschen Zufall
  const cx = w * 0.5 + rand(-120, 120);
  const cy = h * 0.5 + rand(-120, 120);
  const dir = norm(cx - x, cy - y);

  enemies.push({
    id: enemyIdCounter++,
    x,
    y,
    r: ENEMY_R,
    hp: ENEMY_MAX_HP,
    maxHp: ENEMY_MAX_HP,
    vx: dir.x,
    vy: dir.y,
    turnT: rand(0.4, 1.2),
    hitT: 0,
    fireT: ENEMY_FIRE_COOLDOWN,
    aggro: false,
    aggroT: 0,
    stunned: false, 

  });

  if (enemies.length > ENEMY_CAP) enemies.shift();
}

// projectile travel
function spawnProjectile({ x, y, vx, vy, fromEnemy, dmg, ttl, r }) {
  projectiles.push({
    x,
    y,
    vx,
    vy,
    fromEnemy: !!fromEnemy,
    dmg: dmg ?? 1,
    ttl: ttl ?? 2.0,
    r: r ?? 3,
  });
}

function getTargetEnemy() {
  if (!combat.targetId) return null;
  return enemies.find((e) => e && e.id === combat.targetId) || null;
}

function fireAtTarget(target) {
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const d = Math.hypot(dx, dy) || 1;

  const u = { x: dx / d, y: dy / d };

  const startX = player.x + u.x * (player.r + 6);
  const startY = player.y + u.y * (player.r + 6);

  const ttl = d / combat.projectileSpeed + 0.35;

  spawnProjectile({
    x: startX,
    y: startY,
    vx: u.x * combat.projectileSpeed,
    vy: u.y * combat.projectileSpeed,
    fromEnemy: false,
    dmg: combat.damage,
    ttl,
    r: 3,
  });

  effects.push({ type: "flash", x: startX, y: startY, t: 0.08 });
}

// ---------- Update ----------
function update(dt) {
  time += dt;
  if (paused) {
    input.endFrame();
    return;
  }

  // ---- Player movement
  let ax = 0,
    ay = 0;

  if (input.isDown("a") || input.isDown("arrowleft")) ax -= 1;
  if (input.isDown("d") || input.isDown("arrowright")) ax += 1;
  if (input.isDown("w") || input.isDown("arrowup")) ay -= 1;
  if (input.isDown("s") || input.isDown("arrowdown")) ay += 1;

  if (ax !== 0 && ay !== 0) {
    const inv = 1 / Math.sqrt(2);
    ax *= inv;
    ay *= inv;
  }

  player.x += ax * PLAYER_SPEED * dt;
  player.y += ay * PLAYER_SPEED * dt;

  player.x = clamp(player.x, player.r, canvas.width - player.r);
  player.y = clamp(player.y, player.r, canvas.height - player.r);

  const moving = Math.abs(ax) + Math.abs(ay) > 0;
  if (moving) {
    trail.push({ x: player.x - ax * 6, y: player.y - ay * 6, t: 0.6 });
    if (trail.length > TRAIL_MAX) trail.shift();
  }
  for (let i = trail.length - 1; i >= 0; i--) {
    trail[i].t -= dt;
    if (trail[i].t <= 0) trail.splice(i, 1);
  }

  // ---- Enemy spawning
  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawnEnemy();
    spawnTimer = ENEMY_SPAWN_EVERY;
  }

 // ---- Enemies update (wander + bounce + optional shooting)
for (let i = 0; i < enemies.length; i++) {
  const e = enemies[i];
  if (!e) continue;

  // Hit flash decay
  e.hitT = Math.max(0, e.hitT - dt);

  // ---- Aggro Timer
  e.aggroT = Math.max(0, (e.aggroT ?? 0) - dt);
  const isAggro = e.aggroT > 0;

  // ---- Shooting (auch wenn stunned)
  if (ENEMY_FIRE_ENABLED && isAggro) {
    e.fireT = (e.fireT ?? ENEMY_FIRE_COOLDOWN) - dt;

    if (e.fireT <= 0) {
      e.fireT = ENEMY_FIRE_COOLDOWN;

      const dx = player.x - e.x;
      const dy = player.y - e.y;
      const d = Math.hypot(dx, dy);

      if (d < 520) {
        const u = norm(dx, dy);

        spawnProjectile({
          x: e.x,
          y: e.y,
          vx: u.x * ENEMY_BULLET_SPEED,
          vy: u.y * ENEMY_BULLET_SPEED,
          fromEnemy: true,
          dmg: 1,
          ttl: ENEMY_BULLET_TTL,
          r: 4,
        });
      }
    }
  }

  // ---- Movement (nur wenn NICHT stunned)
  if (e.stunned) continue;

  e.turnT -= dt;
  if (e.turnT <= 0) {
    e.turnT = rand(0.4, 1.2);

    e.vx += rand(-0.6, 0.6);
    e.vy += rand(-0.6, 0.6);

    const n = norm(e.vx, e.vy);
    e.vx = n.x;
    e.vy = n.y;
  }

  e.x += e.vx * ENEMY_SPEED * dt;
  e.y += e.vy * ENEMY_SPEED * dt;

  if (e.x < e.r || e.x > canvas.width - e.r) e.vx *= -1;
  if (e.y < e.r || e.y > canvas.height - e.r) e.vy *= -1;
}



  // ---- Validate target
  const target = getTargetEnemy();
  if (combat.targetId && !target) combat.targetId = null;

  // ---- Auto fire (Seafight)
  combat.cooldown = Math.max(0, combat.cooldown - dt);
  if (target) {
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const d = Math.hypot(dx, dy);

    if (d > combat.range || target.hp <= 0) {
      combat.targetId = null;
    } else if (combat.cooldown <= 0) {
      fireAtTarget(target);
      combat.cooldown = 1 / combat.fireRate;
    }
  }

  // ---- Projectiles update + collisions
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];

    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.ttl -= dt;

    const out =
      p.ttl <= 0 ||
      p.x < -80 ||
      p.x > canvas.width + 80 ||
      p.y < -80 ||
      p.y > canvas.height + 80;

    if (out) {
      projectiles.splice(i, 1);
      continue;
    }
  
    if (p.fromEnemy) {
      // hit player
      const rr = p.r + player.r;
      if (dist2(p.x, p.y, player.x, player.y) <= rr * rr) {
        player.hp -= p.dmg;
        projectiles.splice(i, 1);
        continue;
      }
    } else {
      // hit enemies
      for (let ei = enemies.length - 1; ei >= 0; ei--) {

        const e = enemies[ei];
        const rr = p.r + e.r;

        if (dist2(p.x, p.y, e.x, e.y) <= rr * rr) {
          e.hp -= p.dmg;
          e.hitT = 0.12;
          const ENEMY_AGGRO_TIME = 6.0;

          // Aggro + stehen bleiben (nur setzen, kein Timer-Update hier!)
          e.aggroT = ENEMY_AGGRO_TIME;  // z.B. 6.0 Sekunden
          e.stunned = true;

          // optional: wirklich einfrieren
          e.vx = 0;
          e.vy = 0;

          // Projectile entfernen
          projectiles.splice(i, 1);

          // Enemy tot?
          if (e.hp <= 0) {
            if (combat.targetId === e.id) combat.targetId = null;
            enemies.splice(ei, 1);
          }
          break;
        } 
      }
    }
  }


  // ---- Effects
  for (let i = effects.length - 1; i >= 0; i--) {
    effects[i].t -= dt;
    if (effects[i].t <= 0) effects.splice(i, 1);
  }

  // ---- Game over simple reset
  if (player.hp <= 0) {
    player.hp = player.maxHp;
    enemies.length = 0;
    projectiles.length = 0;
    effects.length = 0;
    trail.length = 0;
    combat.targetId = null;
    combat.cooldown = 0;
  }

  // ---- FPS HUD
  const fps = 1 / dt;
  fpsSmoothing = fpsSmoothing ? fpsSmoothing * 0.9 + fps * 0.1 : fps;
  if (fpsEl) {
    fpsEl.textContent = `FPS: ${fpsSmoothing.toFixed(0)} | E: ${enemies.length} | P: ${projectiles.length}`;
  }

  input.endFrame();
}

// ---------- Render helpers ----------
function drawHpBar(x, y, w, h, hp, maxHp, label, align = "left") {
  const ratio = maxHp <= 0 ? 0 : clamp(hp / maxHp, 0, 1);

  ctx.save();
  ctx.globalAlpha = 0.9;

  // Für left: x ist links.
  // Für right: x ist RECHTS (Anker)
  const bx = align === "right" ? (x - w) : x;
  const by = y + 2;

  // Panel-Layout (kleiner & sauber)
  const panelPadX = 14;
  const panelPadY = 12;
  const panelW = w + 120;
  const panelH = 44;

  // Panel so platzieren, dass es nicht rausläuft
  let panelX = align === "right"
    ? (x - panelW)     // Panel endet bei x
    : (bx - panelPadX);

  let panelY = y - panelPadY;

  const pad = 6;
  panelX = clamp(panelX, pad, canvas.width - panelW - pad);
  panelY = clamp(panelY, pad, canvas.height - panelH - pad);

  // Wenn wir das Panel geclamped haben, müssen wir bx bei right ggf. neu ableiten
  const barX = align === "right"
    ? (panelX + panelW - panelPadX - w)
    : (panelX + panelPadX);

  // panel bg
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(panelX, panelY, panelW, panelH);

  // label
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = "#fff";
  ctx.font = "700 14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textBaseline = "top";
  ctx.textAlign = align;

  const labelX = align === "right" ? (panelX + panelW - panelPadX) : (panelX + panelPadX);
  ctx.fillText(label, labelX, panelY + 2);

  // bar bg
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#000";
  ctx.fillRect(barX, by, w, h);

  // bar fill
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = ratio <= 0.3 ? "rgb(220,60,60)" : "rgb(32,172,32)";
  ctx.fillRect(barX, by, w * ratio, h);

  // bar stroke
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(barX, by, w, h);

  // text hp/max
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "#fff";
  ctx.font = "600 13px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "left";
  ctx.fillText(`${hp} / ${maxHp}`, barX + w + 12, y);

  ctx.restore();
}

function renderReloadUI() {
  const pad = 18;
  const w = 220;
  const h = 10;

  const cdMax = 1 / combat.fireRate;
  const t = clamp(1 - combat.cooldown / cdMax, 0, 1);

  ctx.save();
  ctx.globalAlpha = 0.9;

  // small panel under player HP
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(pad - 10, pad + 52, w + 170, 36);

  ctx.fillStyle = "#fff";
  ctx.font = "600 13px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillText("Cannons", pad, pad + 56);

  const bx = pad + 78;
  const by = pad + 60;
  const barW = w;

  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#000";
  ctx.fillRect(bx, by, barW, h);

  ctx.globalAlpha = 0.9;
  ctx.fillStyle = t >= 1 ? "rgb(32,172,32)" : "rgb(60,160,255)";
  ctx.fillRect(bx, by, barW * t, h);

  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(bx, by, barW, h);

  ctx.globalAlpha = 0.9;
  const label = t >= 1 ? "Ready" : `Reload ${combat.cooldown.toFixed(2)}s`;
  ctx.fillText(label, bx, by + 14);

  ctx.restore();
}

function renderEnemy(e) {
  ctx.save();

  const isTarget = combat.targetId === e.id;
  ctx.globalAlpha = e.hitT > 0 ? 0.65 : 0.95;

  ctx.beginPath();
  ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
  ctx.fillStyle = isTarget ? "rgb(220,80,80)" : "rgb(255, 73, 60)";
  ctx.fill();

  if (isTarget) {
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  
  // HP bar under model
  const w = 34;
  const h = 5;
  const pct = clamp(e.hp / (e.maxHp || 1), 0, 1);

  const bx = e.x - w / 2;
  const by = e.y + e.r + 8;


  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#000";
  ctx.fillRect(bx, by, w, h);

  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "rgb(32,172,32)";
  ctx.fillRect(bx, by, w * pct, h);

  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(bx, by, w, h);

  ctx.restore();
}

// ---------- Render ----------
function render() {

  //console.log(canvas.width, canvas.clientWidth);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Grid
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1;

  ctx.beginPath();
  for (let x = 0; x <= canvas.width; x += GRID_STEP) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
  }
  for (let y = 0; y <= canvas.height; y += GRID_STEP) {
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
  }
  ctx.stroke();
  ctx.restore();

  // Trail
  ctx.save();
  ctx.fillStyle = "#fff";
  for (const p of trail) {
    const a = Math.max(0, p.t / 0.6);
    ctx.globalAlpha = 0.35 * a;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6 * a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Player
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgb(32,172,32)";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Projectiles
  ctx.save();
  for (const p of projectiles) {
    ctx.fillStyle = p.fromEnemy ? "rgba(255,120,120,0.95)" : "#fff";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Enemies
  for (const e of enemies) renderEnemy(e);

  // Target ring
  const t = getTargetEnemy();
  if (t) {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = "rgb(32,172,32)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.r + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Muzzle flash
  ctx.save();
  ctx.fillStyle = "#fff";
  for (const e of effects) {
    const life = Math.max(0, e.t / 0.12);

    ctx.globalAlpha = 0.55 * life;
    ctx.beginPath();
    ctx.arc(e.x, e.y, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.9 * life;
    ctx.beginPath();
    ctx.moveTo(e.x - 2, e.y);
    ctx.lineTo(e.x + 18, e.y - 8);
    ctx.lineTo(e.x + 18, e.y + 8);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // HUD: HP + Reload
  const barW = 220;
  drawHpBar(18, 18, barW, 12, player.hp, player.maxHp, "HP", "left");
  if (t) drawHpBar(canvas.width - 18, 18, barW, 12, t.hp, t.maxHp, "Target", "right");
  renderReloadUI();

  // Pause overlay
  if (paused) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.font = "700 28px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2 - 12);

    ctx.globalAlpha = 0.85;
    ctx.font = "500 14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("Press P to resume", canvas.width / 2, canvas.height / 2 + 18);
    ctx.restore();
  }
}
