import { startLoop } from "./engine/loop.js";
import { createInput } from "./engine/input.js";
import { clamp } from "./engine/math.js";
import { updateEnemies } from "./src/updateEnemies.js";
import { updateProjectiles } from "./src/updateProjectiles.js";
import { drawHud } from "./src/hud.js";
import { createDamageSystem } from "./src/damageNumbers.js";
import { createWater } from "./src/water.js";
import { createIslands } from "./src/islands.js";
import { createBonusmap } from "./src/modes/bonusmap(Vorläufig Deaktiv).js";
import { createOverworld } from "./src/modes/overworld.js";


const overworld = createOverworld();
const bonusmap = createBonusmap();

let currentMode = overworld; // default mode

function setMode(next) {
  mode = next;
  state.mode = next;

  applyWorld(WORLDS[next]);

  currentMode= (next === "bonusmap")? bonusmap:overworld;
  currentMode.enter(state);
}

let overworldSpawnTimer = 0;


const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const fpsEl = document.getElementById("fps");
const input = createInput();
const islands = createIslands();
const water = createWater();
const damage = createDamageSystem();
const CW = () => canvas.clientWidth;
const CH = () => canvas.clientHeight;
const effect = [];

// --- Repair ---
const repair = {
  active: false,
  rate: 1.2, // HP per second
  minDelay:0.25, // seconds after taking damage until repair starts
  t: 0,
  healAcc: 0, // für diskrete Heal-Amounts, optional
  interrupted: false, // optional, falls du eine "Repair unterbrochen"-Logik haben willst
  fxT: 0, // für visuelle Effekte beim Heilen
  breakFlash: 0, // für visuelle Effekte beim Unterbrechen durch Schaden
};

//World/Camera
const world = {
  w: 4000,
  h: 1400,
};

const camera = {
  x: 0,
  y: 0,
  smooth:0.12,
};


function regenerateIslands() {
  islands.generateDefault(world);
}

function fitCanvas() {
  const wrapper = canvas.parentElement;
  const maxW = wrapper.clientWidth;
  const maxH = wrapper.clientHeight;

  const aspect = 16 / 9;
  let cssW = maxW;
  let cssH = cssW / aspect;
  if (cssH > maxH) { cssH = maxH; cssW = cssH * aspect; }

  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  regenerateIslands();
}


window.addEventListener("resize", fitCanvas);
fitCanvas(); // das callt dann auch regenerateIslands()

function getIslandColliders() {
  if (typeof islands.getColliders === "function") {
    return islands.getColliders();
  }
  if (Array.isArray(islands.colliders)) 
  return islands.colliders;
  if (Array.isArray(islands.islands)) return islands.islands; // fallback, if colliders are just the islands themselves
  return [];
}

const enemyTypes = {
  basic: { hp: 5, r: 16, fireEnabled: true, fireCooldown: 1.2, speed: 1.0, color: "rgb(170,45,40)" },
  sniper: {hp: 3, r: 18, fireEnabled:true, fireCooldown: 2.6, speed: 1.15,range: 640,bulletSpeed: 520, color: "rgb(60,120,220)" },
  disabler: {hp: 4, r: 16, fireEnabled:true, fireCooldown: 2.2, speed: 1, disableOnHit: {slowT: 1.2, slowMul: 0.6}, color: "rgb(160,60,200)" },
  tank: {hp: 16, r: 22, fireEnabled: true, fireCooldown: 2.0, speed: 0.65, color: "rgb(120,40,40)" },
};

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

// ---- World presents ----
const WORLDS={
  overworld: { w:4000, h:1400 },
  bonusmap: { w: 1200, h: 700 },
};


function applyWorld(present) {
  world.w = present.w;
  world.h = present.h;

  islands.generateDefault(world);

  clampCam();
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

  slowT: 0, // für Effekte von Disabler-Enemy
  slowMul: 1.0, // für Effekte von Disabler-Enemy
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
let mode ="overworld";
const state = {
  canvas, ctx, input,
  world, camera, 
  player, enemies, projectiles, effects, trail,
  combat, islands, water, damage,
  //timers/mode:
  mode,
  overworldSpawnTimer,
};
state.enemyTypes = enemyTypes;
state.mode = mode;

state.wave = 1;
state.waveActive = false;
state.waveEnemiesLeft = 0;
state.waveCooldown = 2;
state.waveTimer = state.waveCooldown;
state.waveSpawnLeft = 0;
state.waveSpawnTimer = 0;

state.overworldSpawnTimer = 0;

const cfg = {
  ENEMY_CAP,
  // overworld
  OVERWORLD_TARGET_ENEMIES: 20,
  OVERWORLD_SPAWN_EVERY: 1.0,
  // bonusmap waves
  WAVE_COOLDOWN: 2,
  WAVE_SPAWN_EVERY: 0.35,
  WAVE_BASE: 3,
  WAVE_SCALE: 2,
};
state.cfg = cfg;
state.spawnEnemy = spawnEnemy;

// Debug helpers (make module state visible in DevTools)
window.__dbg = {state};
// ---------- Pause ----------
const loop = startLoop({ update, render });

function togglePause() {
  paused = !paused;
  loop.setPaused(paused);
}
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k === "p") togglePause();

  if(k === "r") {
    repair.active = !repair.active;
    repair.t = 0;
  }
  //if(k === "m") {
  //  setMode(mode === "bonusmap" ? "overworld" : "bonusmap");
  //}
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
  const wpos = screenToWorld(m.x, m.y);
  const e = findEnemyAt(wpos.x, wpos.y);
  combat.targetId = e ? e.id : null;
});

// ---------- Spawning ----------
function spawnEnemy() {
  const w = world.w;
  const h = world.h;

  const types = Object.keys(enemyTypes);
  const type = types[Math.floor(Math.random() * types.length)];
  const tcfg = enemyTypes[type];

  const r = tcfg.r ?? ENEMY_R;
  const maxHp = tcfg.hp ?? ENEMY_MAX_HP;

  const margin = r + 6;
  const side = Math.floor(Math.random() * 4);

  let x = 0, y = 0;
  if (side === 0) { x = rand(margin, w - margin); y = margin; }
  else if (side === 1) { x = w - margin; y = rand(margin, h - margin); }
  else if (side === 2) { x = rand(margin, w - margin); y = h - margin; }
  else { x = margin; y = rand(margin, h - margin); }

  // nicht in Inseln spawnen
  let tries = 0;
  while (tries++ < 40) {
    let ok = true;
    for (const c of islands.getColliders()) {
      const d = Math.hypot(x - c.x, y - c.y);
      if (d < (c.r + r + 6)) { ok = false; break; }
    }
    if (ok) break;

    x = rand(margin, w - margin);
    y = rand(margin, h - margin);
  }

  // initial dir zur map-mitte
  const cx = w * 0.5 + rand(-120, 120);
  const cy = h * 0.5 + rand(-120, 120);
  const dir = norm(cx - x, cy - y);

  enemies.push({
    id: enemyIdCounter++,
    type,
    x, y,
    r,
    hp: maxHp,
    maxHp,
    vx: dir.x,
    vy: dir.y,
    fireEnabled: tcfg.fireEnabled ?? true,
    fireCooldown: tcfg.fireCooldown ?? ENEMY_FIRE_COOLDOWN,
    turnT: rand(0.4, 1.2),
    hitT: 0,
    fireT: tcfg.fireCooldown ?? ENEMY_FIRE_COOLDOWN,
    aggro: false,
    aggroT: 0,
    stunned: false,
    color: tcfg.color,
  });

  if (enemies.length > ENEMY_CAP) enemies.shift();
}
function startWave() {
  state.waveActive = true;

  // Anzahl Gegner = Wellen-Nummer + bisschen Zufall
  const base = 3;
  const scale = 2;

  const total = base + wave * scale;
  waveEnemiesLeft = total; // Setze die Anzahl der Gegner, die in dieser Welle noch gespawnt werden müssen
  waveSpawnLeft = total; // Setze die Anzahl der Gegner, die noch gespawnt werden müssen
  waveSpawnTimer = 0.2; // Timer zurücksetzen, damit sofort der erste Gegner spawnt
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
    effect: effect ?? null
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
  if(Math.random()<0.01){
    console.log("Mode",mode,"enemies",enemies.length,"timer:", state.overworldSpawnTimer);
  }
  time += dt;

  if (paused) {
    input.endFrame();
    return;
  }

  player.slowT = Math.max(0, (player.slowT ?? 0) - dt);
  player.slowMul = player.slowT > 0 ? 0.6 : 1,0; // Beispiel: 40% slow, wenn slowT aktiv

currentMode.update(dt, state);

// --- Repair: wenn aktiv, darfst du nicht bewegen + kontinuierlich heilen
// Wir merken uns, ob der Spieler sich bewegen wollte:
const wantsMove =
  input.isDown("a") || input.isDown("d") || input.isDown("w") || input.isDown("s") ||
  input.isDown("arrowleft") || input.isDown("arrowright") || input.isDown("arrowup") || input.isDown("arrowdown");

// Wenn Repair aktiv und Player will sich bewegen -> abbrechen
if (repair.active && wantsMove) {
  repair.active = false;
  repair.t = 0;
  repair.interrupted = true; // optional, falls du eine "Repair unterbrochen"-Logik haben willst
}

// Heal über Zeit (nur wenn aktiv, nicht tot, nicht full hp)
if (repair.active && player.hp > 0 && player.hp < player.maxHp) {
  repair.interrupted = false; // optional, falls du eine "Repair unterbrochen"-Logik haben willst
  repair.fxT += dt; // für visuelle Effekte beim Heilen
  repair.healAcc += repair.rate * dt; // für diskrete Heal-Amounts, optional

  while (repair.healAcc >= 1 && player.hp < player.maxHp) {
    player.hp += 1;
    repair.healAcc -= 1;
  }
if (player.hp >= player.maxHp) {
  repair.active = false;
  repair.t = 0;
}

} else {
  if (!repair.active) repair.healAcc = 0; // reset Acc, wenn Repair nicht aktiv ist
}

water.update(dt);

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
  const islandColliders = islands.getColliders();


islands.resolveCircle(player);

  player.x += ax * PLAYER_SPEED * player.slowMul * dt;
  player.y += ay * PLAYER_SPEED * player.slowMul * dt;

  player.x = clamp(player.x, player.r, world.w - player.r);
  player.y = clamp(player.y, player.r, world.h - player.r);

  if(typeof islands.resolveCircle === "function") {
    islands.resolveCircle(player);
  }

  const moving = Math.abs(ax) + Math.abs(ay) > 0;
  if (moving) {
    trail.push({ x: player.x - ax * 6, y: player.y - ay * 6, t: 0.6 });
    if (trail.length > TRAIL_MAX) trail.shift();
  }
  for (let i = trail.length - 1; i >= 0; i--) {
    trail[i].t -= dt;
    if (trail[i].t <= 0) trail.splice(i, 1);
  }


 // ---- Enemies update (wander + bounce + optional shooting)
updateEnemies(dt, {
  enemies, player, canvas,
  world,
  ENEMY_SPEED,
  ENEMY_FIRE_ENABLED,
  ENEMY_FIRE_COOLDOWN,
  ENEMY_BULLET_SPEED,
  ENEMY_BULLET_TTL,
  ENEMY_AGGRO_TIME,
  norm, rand,
  spawnProjectile,
  islandColliders,
  islands,
  mode: state.mode,
  enemyTypes: state.enemyTypes,
});

//console.log("Enemy_Speed",ENEMY_SPEED,"mode", mode, "world", state.world);
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
  canvas, world: state.world,
  player, enemies, projectiles, combat, dist2,
  ENEMY_AGGRO_TIME,
  damage,
  islandColliders,
  onEnemyKilled: () => currentMode.onEnemyKilled?.(state),
  onPlayerHit: () => {
    // Repair bricht ab sobald Schaden kommt
    repair.active = false;
    repair.t = 0;
    repair.interrupted = true; 
    repair.breakFlash = 0.4; // für visuelle Effekte beim Unterbrechen durch Schaden
  },
});

repair.breakFlash = Math.max(0, repair.breakFlash - dt);

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

  updateCamera();

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

function clampCam() {
  const vw = canvas.clientWidth;
  const vh = canvas.clientHeight;
  camera.x = clamp(camera.x, 0, Math.max(0, world.w - vw));
  camera.y = clamp(camera.y, 0, Math.max(0, world.h - vh));
}

function updateCamera() {
  const vw = canvas.clientWidth;
  const vh = canvas.clientHeight;

  const targetX = player.x - vw / 2;
  const targetY = player.y - vh / 2;

  camera.x += (targetX - camera.x) * camera.smooth;
  camera.y += (targetY - camera.y) * camera.smooth;

  clampCam();
}

function screenToWorld(sx, sy) {
  return {
    x: sx + camera.x,
    y: sy + camera.y,
  };
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
  const angle = Math.atan2(e.vy, e.vx);

  renderShip(ctx, e.x, e.y, e.r, angle, isTarget, true);
  ctx.globalAlpha = e.hitT > 0 ? 0.65 : 0.95;

  ctx.__enemyType = e.type;
  ctx.__enemyColor = e.color || "rgb(170,45,40)";

 function renderShip(ctx, x, y, r, angle, isTarget, isEnemy) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // --- Klassen-Parameter (Silhouette) ---
  const type = isEnemy ? (ctx.__enemyType || "basic") : "player";

  // Defaults
  let hullFront = r + 10;
  let hullBack1 = -r - 8;
  let hullBack2 = -r - 14;
  let hullHeight = r;          // wie "breit" das Schiff ist
  let mastH = r + 8;
  let mastX = -2;
  let sailW = r + 8;
  let sailTop = -r - 6;
  let sailBottom = r - 2;
  let mastLineW = 2;

  // --- Silhouetten pro Klasse ---
  if (type === "tank") {
    hullFront = r + 8;
    hullBack1 = -r - 12;
    hullBack2 = -r - 18;
    hullHeight = r * 1.25;       // breiter
    mastH = r + 10;
    mastLineW = 3;               // dicker Mast
    sailW = r + 6;               // etwas kompakter
  }

  if (type === "sniper") {
    hullFront = r + 16;          // langer Bug
    hullBack1 = -r - 6;
    hullBack2 = -r - 10;
    hullHeight = r * 0.85;       // schlanker
    mastH = r + 14;              // höherer Mast
    sailW = r + 14;              // größere Segel
  }

  if (type === "disabler") {
    hullFront = r + 12;
    hullBack1 = -r - 9;
    hullBack2 = -r - 15;
    hullHeight = r * 1.05;
    mastH = r + 12;
    sailW = r + 10;
  }

  // --- Optional Aura beim Disabler (super klar lesbar) ---
  if (type === "disabler") {
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "rgba(160,60,200,1)";
    ctx.beginPath();
    ctx.arc(0, 0, r + 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // --- Hull ---
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = isEnemy ? (ctx.__enemyColor || "rgb(170,45,40)") : "rgb(90, 60, 35)";
  ctx.beginPath();
  ctx.moveTo(hullFront, 0);
  ctx.lineTo(hullBack1, -hullHeight);
  ctx.lineTo(hullBack2, 0);
  ctx.lineTo(hullBack1, hullHeight);
  ctx.closePath();
  ctx.fill();

  // --- Deck highlight ---
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(r + 4, -2);
  ctx.lineTo(hullBack1 + 2, -hullHeight + 4);
  ctx.lineTo(hullBack2 + 2, 0);
  ctx.closePath();
  ctx.fill();

  // --- Mast ---
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = mastLineW;
  ctx.beginPath();
  ctx.moveTo(mastX, -mastH);
  ctx.lineTo(mastX, r + 6);
  ctx.stroke();

  // --- Sail ---
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = isEnemy ? "rgba(255,220,220,0.75)" : "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.moveTo(mastX, sailTop);
  ctx.lineTo(sailW, 0);
  ctx.lineTo(mastX, sailBottom);
  ctx.closePath();
  ctx.fill();

  // --- Target ring ---
  if (isTarget) {
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r + 6, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

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
  // 1) clear in CSS pixels
  ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
  ctx.clearRect(0, 0, CW(), CH());

  // 2) Screen-space background (bleibt "am Bildschirm kleben")
  water.render(ctx, canvas);


  // 3) World-space draw (alles was sich mit Kamera bewegt)
  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  islands.render(ctx);

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

  // Player ship
  ctx.save();
  ctx.translate(player.x, player.y);

  const angle = Math.atan2(
    (input.isDown("s") || input.isDown("arrowdown")) - (input.isDown("w") || input.isDown("arrowup")),
    (input.isDown("d") || input.isDown("arrowright")) - (input.isDown("a") || input.isDown("arrowleft"))
  );
  const hasDir =
    input.isDown("a") || input.isDown("d") || input.isDown("w") || input.isDown("s") ||
    input.isDown("arrowleft") || input.isDown("arrowright") || input.isDown("arrowup") || input.isDown("arrowdown");

  ctx.rotate(hasDir ? angle : 0);

  ctx.globalAlpha = 0.95;
  ctx.fillStyle = "rgb(90, 60, 35)";
  ctx.beginPath();
  ctx.moveTo(player.r + 10, 0);
  ctx.lineTo(-player.r - 8, -player.r);
  ctx.lineTo(-player.r - 14, 0);
  ctx.lineTo(-player.r - 8, player.r);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(player.r + 4, -2);
  ctx.lineTo(-player.r - 6, -player.r + 4);
  ctx.lineTo(-player.r - 10, 0);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-2, -player.r - 8);
  ctx.lineTo(-2, player.r + 6);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.moveTo(-2, -player.r - 6);
  ctx.lineTo(player.r + 8, 0);
  ctx.lineTo(-2, player.r - 2);
  ctx.closePath();
  ctx.fill();

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


  // --- Repair Visual FX ---
if (repair.active) {
  ctx.save();

  // sanfter grüner Glow pulsierend
  const pulse = 0.6 + Math.sin(repair.fxT * 4) * 0.4;

  ctx.globalAlpha = 0.25 * pulse;
  ctx.fillStyle = "rgba(120,255,120,1)";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r + 22, 0, Math.PI * 2);
  ctx.fill();

  // kleine Partikel (Holzsplitter Look)
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = "rgba(180,255,180,1)";

  for (let i = 0; i < 6; i++) {
    const angle = repair.fxT * 2 + i;
    const dist = 18 + (Math.sin(repair.fxT * 3 + i) * 6);
    const px = player.x + Math.cos(angle) * dist;
    const py = player.y + Math.sin(angle) * dist;

    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

if (repair.breakFlash > 0) {
  ctx.save();

  ctx.globalAlpha = repair.breakFlash * 0.8;
  ctx.fillStyle = "rgba(255,80,80,1)";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r + 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

  damage.render(ctx);

  // debug colliders (world-space!)
  const ic = getIslandColliders();
  ctx.save();
  ctx.fillStyle = "rgba(255,0,0,0.25)";
  for (const c of ic) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // done with world-space
  ctx.restore();
  
  function drawRepairBar() {
  const x = 18;
  const y = 132;     // unter HP/Reload
  const w = 220;
  const h = 10;

  // Progress bis zum nächsten +1 HP Tick (0..1)
  const p = Math.max(0, Math.min(1, repair.healAcc));

  ctx.save();
  ctx.globalAlpha = 0.9;

  // Panel
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(x - 10, y - 18, w + 170, 42);

  ctx.fillStyle = "#fff";
  ctx.font = "600 13px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const label =
    player.hp >= player.maxHp ? "Repair (Full)" :
    repair.active ? "Repairing..." :
    repair.interrupted ? "Repair interrupted" :
    "Repair: Press R";

  ctx.fillText(label, x, y - 16);

  // Bar bg
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#000";
  ctx.fillRect(x, y, w, h);

  // Bar fill (nur sichtbar wenn aktiv)
  ctx.globalAlpha = repair.active ? 0.9 : 0.2;
  ctx.fillStyle = "rgba(120,255,120,0.95)";
  ctx.fillRect(x, y, w * p, h);

  // Stroke
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(x, y, w, h);

  // Text rechts: HP ganzzahlig
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.fillText(`${player.hp} / ${player.maxHp}`, x + w + 12, y - 4);

  ctx.restore();
}

  // 4) Screen-space HUD (NICHT mit Kamera bewegen)
  const t = getTargetEnemy();
  drawHud(ctx, canvas, player, t, combat, drawHpBar, renderReloadUI);
  drawRepairBar();

  ctx.save();
  ctx.fillStyle = repair.active ? "rgba(120,255,120,0.95)" : "rgba(255,255,255,0.75)";
  ctx.font = "600 14px system-ui";
  ctx.textAlign = "left";
  
  ctx.restore();

  ctx.save();
ctx.fillStyle = "#fff";
ctx.font = "600 16px system-ui";
ctx.textAlign = "center";
ctx.restore();


  if (paused) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, CW(), CH());

    ctx.fillStyle = "#fff";
    ctx.font = "700 28px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("PAUSED", CW() / 2, CH() / 2 - 12);

    ctx.globalAlpha = 0.85;
    ctx.font = "500 14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("Press P to resume", CW() / 2, CH() / 2 + 18);
    ctx.restore();
  }
}
