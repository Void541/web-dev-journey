import { startLoop } from "./engine/loop.js";
import { createInput } from "./engine/input.js";
import { clamp } from "./engine/math.js";
import { updateEnemies } from "./src/updateEnemies.js";
import { updateProjectiles } from "./src/updateProjectiles.js";
import { drawHud } from "./src/hud.js";
import { createDamageSystem } from "./src/damageNumbers.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const fpsEl = document.getElementById("fps");
const input = createInput();
const damage = createDamageSystem();
const CW = () => canvas.width;
const CH = () => canvas.height;

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
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
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
const ENEMY_AGGRO_TIME = 6; // Zeit, die ein Enemy nach einem Treffer aggressiv bleibt (d.h. weiter schießt)
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
const step = 48;
const w = CW();
const h = CH();

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

  player.x = clamp(player.x, player.r, CW() - player.r);
  player.y = clamp(player.y, player.r, CH() - player.r);

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
updateEnemies(dt, {
  enemies, player, canvas,
  ENEMY_SPEED,
  ENEMY_FIRE_ENABLED,
  ENEMY_FIRE_COOLDOWN,
  ENEMY_BULLET_SPEED,
  ENEMY_BULLET_TTL,
  ENEMY_AGGRO_TIME,
  norm, rand,
  spawnProjectile,
});

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
 updateProjectiles(dt, {
  canvas, player, enemies, projectiles, combat, dist2,
  ENEMY_AGGRO_TIME,
  damage,
});


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
damage.update(dt);
  input.endFrame();
}

// ---------- Render helpers ----------
function drawHpBar(x, y, w, h, hp, maxHp, label, align = "left") {
  const ratio = maxHp <= 0 ? 0 : clamp(hp / maxHp, 0, 1);

  // We draw in CSS pixels because of ctx.setTransform(dpr,...)
  const CW = canvas.clientWidth;
  const CH = canvas.clientHeight;

  ctx.save();
  ctx.globalAlpha = 0.9;

  // Panel metrics
  const pad = 8;            // outer clamp padding
  const inner = 12;         // inner padding in panel
  const lineH = 16;

  const text = `${hp} / ${maxHp}`;

  // Measure text width (needs font set BEFORE measure)
  ctx.font = "600 13px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  const tw = ctx.measureText(text).width;

  // Panel width: bar + gap + hp-text area (min 54)
  const gap = 10;
  const hpArea = Math.max(54, Math.ceil(tw));
  const panelW = inner + w + gap + hpArea + inner;
  const panelH = inner + lineH + 8 + h + inner;

  // x is "anchor": left = panel starts at x, right = panel ends at x
  let panelX = align === "right" ? (x - panelW) : x;
  let panelY = y;

  // Clamp fully inside canvas
  panelX = clamp(panelX, pad, CW - panelW - pad);
  panelY = clamp(panelY, pad, CH - panelH - pad);

  // Draw panel background
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(panelX, panelY, panelW, panelH);

  // Label (top left/right)
  ctx.font = "700 14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "top";
  ctx.textAlign = align === "right" ? "right" : "left";
  const labelX = align === "right" ? (panelX + panelW - inner) : (panelX + inner);
  ctx.fillText(label, labelX, panelY + inner - 2);

  // Bar position
  const barX = panelX + inner;
  const barY = panelY + inner + lineH + 6;

  // Bar bg
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#000";
  ctx.fillRect(barX, barY, w, h);

  // Bar fill
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = ratio <= 0.3 ? "rgb(220,60,60)" : "rgb(32,172,32)";
  ctx.fillRect(barX, barY, w * ratio, h);

  // Bar stroke
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(barX, barY, w, h);

  // HP text (always inside panel, top-right)
  ctx.globalAlpha = 0.95;
  ctx.font = "600 13px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "right";
  ctx.fillStyle = "#fff";
  ctx.fillText(text, panelX + panelW - inner, barY - 2);

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
  ctx.clearRect(0, 0, CW(), CH());

  // Grid
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1;

  ctx.beginPath();
  for (let x = 0; x <= CW(); x += GRID_STEP) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CH());
  }
  for (let y = 0; y <= CH(); y += GRID_STEP) {
    ctx.moveTo(0, y);
    ctx.lineTo(CW(), y);
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

  // Player
  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fillStyle = "rgb(32,172,32)"; // grün
  ctx.fill();

  // optional: outline
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

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
  damage.render(ctx);

   const t = getTargetEnemy();
   drawHud(ctx, canvas, player, t, combat, drawHpBar, renderReloadUI);

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
