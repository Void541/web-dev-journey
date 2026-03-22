import { startLoop } from "./src/engine/loop.js";
import { createInput } from "./src/engine/input.js";
import { clamp } from "./src/engine/math.js";
import { updateEnemies } from "./src/enemies/updateEnemies.js";
import { spawnEnemy } from "./src/enemies/spawnEnemy.js";
import { updateProjectiles } from "./src/updateProjectiles.js";
import { createDamageSystem } from "./src/damageNumbers.js";
import { createWater } from "./src/water.js";
import { createIslands } from "./src/islands.js";
import { createOverworld } from "./src/modes/overworld.js";
import { createPirateCove } from "./src/modes/pirateCove.js";
import { enemyTypes } from "./src/entities/enemyTypes.js";
import { drawMinimap } from "./src/minimap.js";
import { createWreckSystem } from "./src/systems/wrecks.js";
import { createLootTable } from "./src/systems/lootTable.js";
import * as CFG from "./src/config.js";
import { createHudOverlay } from "./src/render/hudOverlay.js";
import { createShipStats } from "./src/systems/shipStats.js";
import { createCraftingRecipes } from "./src/crafting/craftingRecipes.js";
import { createCraftingSystem } from "./src/crafting/craftingSystem.js";
import { createSpriteManager } from "./src/sprites.js";
import {
  createPlayerCombat,
  getTargetEnemy,
  fireCannonAtTarget,
  updatePlayerCombat,
} from "./src/systems/playerCombat.js";
import { createQuestTracker } from "./src/ui/questTracker.js";
import { renderWorkshopUI } from "./src/ui/workshop.js";
import { getEquippedCannon } from "./src/systems/cannons.js";
import { getEquippedShip } from "./src/systems/ships.js";

const DEV_MODE = true;

const overworld = createOverworld();
const pirateCove = createPirateCove();
const sprites = createSpriteManager();

// --- Sprites laden ---
sprites.load("player", "assets/ships/player.png");
sprites.load("enemy_tank", "assets/ships/enemy_tank.png");
sprites.load("enemy_sniper", "assets/ships/enemy_sniper.png");
sprites.load("enemy_disabler", "assets/ships/enemy_disabler.png");
sprites.load("enemy_raider", "assets/ships/enemy_raider.png");
sprites.load("cannonball", "assets/ships/cannonball.png");

const shipStats = createShipStats();
const craftingRecipes = createCraftingRecipes();
const craftingSystem = createCraftingSystem(craftingRecipes);

let currentMode = overworld;
let overworldSpawnTimer = 0;
let mode = "overworld";

function setMode(next, options = {}) {
  mode = next;
  state.mode = next;

  applyWorld(WORLDS[next]);

  if (next === "bonusmap") {
    currentMode = bonusmap;
  } else if (next === "pirateCove") {
    currentMode = pirateCove;
  } else {
    currentMode = overworld;
  }

  currentMode.enter?.(state, options);
}

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
const effects = [];

// --- Repair ---
const repair = {
  active: false,
  rate: 1.2,
  minDelay: 0.25,
  t: 0,
  healAcc: 0,
  interrupted: false,
  fxT: 0,
  breakFlash: 0,
};

// World/Camera
const world = {
  w: 4000,
  h: 1400,
};

const camera = {
  x: 0,
  y: 0,
  smooth: 0.12,
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
  if (cssH > maxH) {
    cssH = maxH;
    cssW = cssH * aspect;
  }

  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  regenerateIslands();
}

window.addEventListener("resize", fitCanvas);
fitCanvas();

function getIslandColliders() {
  if (typeof islands.getColliders === "function") {
    return islands.getColliders();
  }
  if (Array.isArray(islands.colliders)) return islands.colliders;
  if (Array.isArray(islands.islands)) return islands.islands;
  return [];
}

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

function getEnemySpriteKey(type) {
  switch (type) {
    case "tank":
      return "enemy_tank";
    case "sniper":
      return "enemy_sniper";
    case "disabler":
      return "enemy_disabler";
    case "raider":
    case "basic":
    default:
      return "enemy_raider";
  }
}

// ---- World presets ----
const WORLDS = {
  overworld: { w: 4000, h: 1400 },
  bonusmap: { w: 1200, h: 700 },
  pirateCove: { w: 1400, h: 800 },
};

function applyWorld(preset) {
  world.w = preset.w;
  world.h = preset.h;

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
const ENEMY_AGGRO_TIME = 6;
const ENEMY_FIRE_ENABLED = true;
const ENEMY_FIRE_COOLDOWN = 1.2;
const ENEMY_BULLET_SPEED = 320;
const ENEMY_BULLET_TTL = 2.6;

const ENEMY_NAMES = [
  "Marlow",
  "Briggs",
  "Vane",
  "Rourke",
  "Crow",
  "Sable",
  "Drake",
  "Hawke",
  "Grimm",
  "Vale",
  "Ashford",
  "Blacktide",
  "Reddock",
  "Morrow",
  "Thorne"
];

function randomEnemyName(type) {
  const base = ENEMY_NAMES[Math.floor(Math.random() * ENEMY_NAMES.length)];

  const title =
    type === "tank" ? "Bulwark" :
    type === "sniper" ? "Sharpshot" :
    type === "disabler" ? "Hexer" :
    "Raider";

  return `${title} ${base}`;
}

const TRAIL_MAX = 80;

// Seafight-ish combat
const combat = createPlayerCombat();

const ENEMY_AGGRO_DECAY = 4.0;

// ---------- State ----------
const player = {
  x: 200,
  y: 200,
  r: PLAYER_R,
  hp: PLAYER_MAX_HP,
  maxHp: PLAYER_MAX_HP,
  slowT: 0,
  slowMul: 1.0,
};

const enemies = [];
const projectiles = [];
const trail = [];

let paused = false;
let time = 0;
let fpsSmoothing = 0;
const enemyRuntime = {
  nextId: 1,
}

const state = {
  canvas, ctx, input,
  world, camera,
  player, enemies, projectiles, effects, trail,
  combat, islands, water, damage,
  mode,
  overworldSpawnTimer,
  enemyTypes,
  sprites,
  enemyRuntime,
  randomEnemyName,
  ENEMY_SPEED,
  transitions: {
  overworldReturn: null, // placeholder für Übergang von Pirate Cove zurück zur Overworld
},
};

state.questTracker = createQuestTracker(state);
state.mode = mode;
state.setMode = setMode;
state.spawnProjectile = spawnProjectile;
state.spawnEnemy = (options) => spawnEnemy(state, options);
state.pushLootNotice = pushLootNotice;

const hudOverlay = createHudOverlay();
state.hudOverlay = hudOverlay;


state.playerShip = {
  id: "frigate",
};

const equippedShip = getEquippedShip(state);

state.shipStats = shipStats;
state.playerLoadout = {
  cannons:["light", null, null],
  cooldowns: [0, 0, 0],
};

state.admirals = {
  killCount: 0,
  killsNeeded: 5,
  active: 0,
  maxActive: 1,
};

state.quests = state.quests ?? {
  active: null,
  completed: [],
};

state.progress = state.progress ?? {
  kills: 0,
  admiralKills: 0,
};

state.ui = {
  shipyardOpen: false,
  workshopOpen: false,
  dockmasterOpen: false,
  craftingOpen: false,
  activeCannonSlot: 0,
};

state.ui.activeCannonSlot = state.ui.cannonSlot ?? 0;

state.crafting = {
  recipes: craftingRecipes,
  craft: (id) => {
    if (state.mode !== "pirateCove") {
      state.pushLootNotice?.("Crafting only available in Pirate Cove");
      return false;
    }
    return craftingSystem.craft(state, id);
  }
};

const cfg = {
  ENEMY_CAP,
  OVERWORLD_TARGET_ENEMIES: 20,
  OVERWORLD_SPAWN_EVERY: 1.0,
};

state.cfg = cfg;

const wrecks = createWreckSystem({
  SALVAGE_TIME: 1.8,
  PICKUP_RADIUS: 46,
  DESPAWN_TIME: 35,
});

const lootTable = createLootTable();
state.lootTable = lootTable;

state.inventory = state.inventory ?? { wood: 0, metal: 0, cloth: 0, tech: 0 };
state.gold = state.gold ?? 0;

state.onEnemyKilled = (enemy, drop) => {
  const gold =
    (drop?.gold ?? state.enemyTypes?.[enemy.type]?.gold ?? 0) +
    (enemy.goldBonus ?? 0);

  const loot = drop?.loot ?? null;

  state.gold += gold;

  if (loot) {
    state.wrecks?.spawn(enemy.x, enemy.y, { loot });
  }

  if (gold > 0) {
    state.pushLootNotice?.(`+${gold} Gold`);
  }

if(enemy.isAdmiral) {
  state.progress.admiralKills += 1;
} else {
  state.progress.kills += 1;
}

  if (enemy.isAdmiral) {
    state.admirals.active = Math.max(0, state.admirals.active - 1);
    state.pushLootNotice?.(`${enemy.name} defeated`);
 } else {
  const countsForAdmiral =
    enemy.type === "basic" || enemy.type === "raider";

  if (countsForAdmiral) {
    state.admirals.killCount += 1;
  }

  const adm = state.admirals;
  if (adm.killCount >= adm.killsNeeded && adm.active < adm.maxActive) {
    const spawned = state.spawnEnemy?.({
      type: "raider",
      admiral: true,
    });

    if (spawned) {
      adm.killCount = 0;
      adm.active += 1;
      state.pushLootNotice?.(`${spawned.name} has appeared!`);
    }
  }
}

  currentMode.onEnemyKilled?.(state, enemy, drop);
};

state.onSpawnWreck = (e) => {
  wrecks.spawnWreck(e.x, e.y, e.type);
};

state.wrecks = wrecks;

const lootNotices = [];

function pushLootNotice(text) {
  lootNotices.push({ text, t: 2.5, yOff: 0 });
}

// Debug helpers
window.__dbg = { state };

// ---------- Pause ----------
const loop = startLoop({ update, render });

function togglePause() {
  paused = !paused;
  loop.setPaused(paused);
}

window.__gameActions = {
  toggleRepair: () => {
    repair.active = !repair.active;
    repair.t = 0;
  },

  holdSalvage: () => {
    state.wrecks?.trySalvage?.(0.2, state);
  },

shootTarget: () => {
  const target = getTargetEnemy(state);
  if (!target) return;

  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const d = Math.hypot(dx, dy);

  if (d <= combat.range && combat.cooldown <= 0) {
    const fired = fireCannonAtTarget(state, target, combat.cannonId);
    if (fired) {
      combat.cooldown = 1 / combat.fireRate;
    }
  }
},

  toggleWorkshop: () => {
    state.ui.workshopOpen = !state.ui.workshopOpen;
  },

  craft: (id) => {
    state.crafting?.craft?.(id);
  },
};

if (DEV_MODE) {
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();

if (k === "m") {
  state.spawnEnemy?.({
    type: "basic",
    admiral: true,
  });

    if (k === "k") killAllEnemies();
    if (k === "l") giveLoot();
}
  });
}

window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();

  if (k === "p") togglePause();

  if (k === "escape") {
    state.ui.dockmasterOpen = false;
    state.ui.merchantOpen = false;
    state.ui.navigatorOpen = false;
    state.ui.workshopOpen = false;
  }

  if (k === "r") {
    repair.active = !repair.active;
    repair.t = 0;
  }

  if (k === "g") showEnemyRanges = !showEnemyRanges;
  if (k === "n") showMinimap = !showMinimap;
  if (k === "c") state.ui.workshopOpen = !state.ui.workshopOpen;
});

let showEnemyRanges = false;
let showMinimap = true;

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
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (!e) continue;
    const rr = (e.r + 8) * (e.r + 8);
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
    effect: null,
  });
}



player.maxHp = state.shipStats.getMaxHp();
player.hp = player.maxHp;

// ---------- Update ----------
function update(dt) {

  time += dt;

const equippedShip = getEquippedShip(state);
const newMaxHp = Number(equippedShip.maxHp) || 10;

const oldMaxHp = Number(player.maxHp) || newMaxHp;
const oldHp = Number(player.hp) || oldMaxHp;

if (oldMaxHp !== newMaxHp) {
  const hpRatio = oldMaxHp > 0 ? oldHp / oldMaxHp : 1;

  player.maxHp = newMaxHp;
  player.hp = Math.max(1, Math.min(newMaxHp, Math.round(newMaxHp * hpRatio)));
}

  if (paused) {
    input.endFrame();
    return;
  }

  player.slowT = Math.max(0, (player.slowT ?? 0) - dt);
  player.slowMul = player.slowT > 0 ? 0.6 : 1.0;

  currentMode.update?.(dt, state);

  wrecks.update(dt);
  wrecks.trySalvage(dt, state);

  const wantsMove =
    input.isDown("a") || input.isDown("d") || input.isDown("w") || input.isDown("s") ||
    input.isDown("arrowleft") || input.isDown("arrowright") || input.isDown("arrowup") || input.isDown("arrowdown");

  if (repair.active && wantsMove) {
    repair.active = false;
    repair.t = 0;
    repair.interrupted = true;
  }

  if (repair.active && player.hp > 0 && player.hp < player.maxHp) {
    repair.interrupted = false;
    repair.fxT += dt;
    repair.healAcc += repair.rate * dt;

    while (repair.healAcc >= 1 && player.hp < player.maxHp) {
      player.hp += 1;
      repair.healAcc -= 1;
    }

    if (player.hp >= player.maxHp) {
      repair.active = false;
      repair.t = 0;
    }
  } else {
    if (!repair.active) repair.healAcc = 0;
  }

  water.update(dt);

  let ax = 0;
  let ay = 0;

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

  if (typeof islands.resolveCircle === "function") {
    islands.resolveCircle(player);
  }

  const ship = getEquippedShip(state);
  const moveSpeed = shipStats.getSpeed(PLAYER_SPEED)* ship.speedMul;

  player.x += ax * moveSpeed * player.slowMul * dt;
  player.y += ay * moveSpeed * player.slowMul * dt;

  player.x = clamp(player.x, player.r, world.w - player.r);
  player.y = clamp(player.y, player.r, world.h - player.r);

  if (typeof islands.resolveCircle === "function") {
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

  updatePlayerCombat(dt, state);

  state.dist2 = dist2;
  state.ENEMY_AGGRO_TIME = ENEMY_AGGRO_TIME;

  state.onPlayerHit = () => {
    repair.active = false;
    repair.t = 0;
    repair.interrupted = true;
    repair.breakFlash = 0.4;
  };

  updateProjectiles(dt, state);

  repair.breakFlash = Math.max(0, repair.breakFlash - dt);

  for (let i = effects.length - 1; i >= 0; i--) {
    effects[i].t -= dt;
    if (effects[i].t <= 0) effects.splice(i, 1);
  }

  if (player.hp <= 0) {
    player.hp = player.maxHp;
    enemies.length = 0;
    projectiles.length = 0;
    effects.length = 0;
    trail.length = 0;
    combat.targetId = null;
    combat.cooldown = 0;
  }

  const fps = 1 / dt;
  fpsSmoothing = fpsSmoothing ? fpsSmoothing * 0.9 + fps * 0.1 : fps;
  if (fpsEl) {
    fpsEl.textContent = `FPS: ${fpsSmoothing.toFixed(0)} | E: ${enemies.length} | P: ${projectiles.length}`;
  }

  damage.update(dt);

  for (let i = lootNotices.length - 1; i >= 0; i--) {
    const n = lootNotices[i];
    n.t -= dt;
    n.yOff += 18 * dt;

    if (n.t <= 0) lootNotices.splice(i, 1);
  }

  updateCamera();


if (state.ui?.workshopOpen && state.input?.mousePressed?.()) {
  const rect = state.canvas.getBoundingClientRect();
  const mx = state.input.mouse.x - rect.left;
  const my = state.input.mouse.y - rect.top;

  // Crafting buttons
  for (const b of state.ui.workshopButtons ?? []) {
    const inside =
      mx >= b.x &&
      mx <= b.x + b.w &&
      my >= b.y &&
      my <= b.y + b.h;

    if (!inside) continue;
    if (b.disabled) continue;

    state.crafting?.craft?.(b.id);
  }

  // Cannon slot selection
  for (const b of state.ui.cannonSlotButtons ?? []) {
    const inside =
      mx >= b.x &&
      mx <= b.x + b.w &&
      my >= b.y &&
      my <= b.y + b.h;

    if (!inside) continue;
    if (b.disabled) continue;

    state.ui.activeCannonSlot = b.index;
    state.pushLootNotice?.(`Selected Slot ${b.index + 1}`);
  }

  // Cannon equip buttons
  for (const b of state.ui.cannonButtons ?? []) {
    const inside =
      mx >= b.x &&
      mx <= b.x + b.w &&
      my >= b.y &&
      my <= b.y + b.h;

    if (!inside) continue;

    state.playerLoadout = state.playerLoadout ?? {};
    state.playerLoadout.cannons = state.playerLoadout.cannons ?? ["light", null, null];

    const slot = state.ui?.activeCannonSlot ?? 0;
    state.playerLoadout.cannons[slot] = b.id;

    state.pushLootNotice?.(`Equipped ${b.label} to Slot ${slot + 1}`);

    state.effects.push({
      x: player.x,
      y: player.y,
      t: 0.4,
      size: 20,
      type: "equip",
    });
  }

  // Ship buttons
  for (const b of state.ui.shipButtons ?? []) {
    const inside =
      mx >= b.x &&
      mx <= b.x + b.w &&
      my >= b.y &&
      my <= b.y + b.h;

    if (!inside) continue;

    state.playerShip = state.playerShip ?? {};
    state.playerShip.id = b.id;

    state.playerLoadout = state.playerLoadout ?? {};
    state.playerLoadout.cannons = state.playerLoadout.cannons ?? ["light", null, null];
    state.playerLoadout.cooldowns = state.playerLoadout.cooldowns ?? [0, 0, 0];

    for(let i = 0; i < 3; i++) {
      state.playerLoadout.cannons[i] = null;
      state.playerLoadout.cooldowns[i] = 0;
    }

    const maxSlots =
      b.id === "brig" ? 2 :
      b.id === "frigate" ? 3 :
      1;

    for (let i = maxSlots; i < 3; i++) {
      state.playerLoadout.cannons[i] = null;
    }

    if (!state.playerLoadout.cannons[0]) {
      state.playerLoadout.cannons[0] = "light";
    }

    if ((state.ui.activeCannonSlot ?? 0) >= maxSlots) {
      state.ui.activeCannonSlot = 0;
    }

    state.pushLootNotice?.(`Equipped ship: ${b.label}`);
  }
}

state.questTracker.update();
input.endFrame();
}
// ---------- Render helpers ----------

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


function renderFallbackShip(ctx, x, y, r, angle, isTarget, isEnemy, type = "basic", color = "rgb(170,45,40)") {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  let hullFront = r + 10;
  let hullBack1 = -r - 8;
  let hullBack2 = -r - 14;
  let hullHeight = r;
  let mastH = r + 8;
  let mastX = -2;
  let sailW = r + 8;
  let sailTop = -r - 6;
  let sailBottom = r - 2;
  let mastLineW = 2;

  if (type === "tank") {
    hullFront = r + 8;
    hullBack1 = -r - 12;
    hullBack2 = -r - 18;
    hullHeight = r * 1.25;
    mastH = r + 10;
    mastLineW = 3;
    sailW = r + 6;
  }

  if (type === "sniper") {
    hullFront = r + 16;
    hullBack1 = -r - 6;
    hullBack2 = -r - 10;
    hullHeight = r * 0.85;
    mastH = r + 14;
    sailW = r + 14;
  }

  if (type === "disabler") {
    hullFront = r + 12;
    hullBack1 = -r - 9;
    hullBack2 = -r - 15;
    hullHeight = r * 1.05;
    mastH = r + 12;
    sailW = r + 10;
  }

  if (type === "disabler") {
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "rgba(160,60,200,1)";
    ctx.beginPath();
    ctx.arc(0, 0, r + 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.globalAlpha = 0.95;
  ctx.fillStyle = isEnemy ? color : "rgb(90, 60, 35)";
  ctx.beginPath();
  ctx.moveTo(hullFront, 0);
  ctx.lineTo(hullBack1, -hullHeight);
  ctx.lineTo(hullBack2, 0);
  ctx.lineTo(hullBack1, hullHeight);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(r + 4, -2);
  ctx.lineTo(hullBack1 + 2, -hullHeight + 4);
  ctx.lineTo(hullBack2 + 2, 0);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = mastLineW;
  ctx.beginPath();
  ctx.moveTo(mastX, -mastH);
  ctx.lineTo(mastX, r + 6);
  ctx.stroke();

  ctx.globalAlpha = 0.85;
  ctx.fillStyle = isEnemy ? "rgba(255,220,220,0.75)" : "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.moveTo(mastX, sailTop);
  ctx.lineTo(sailW, 0);
  ctx.lineTo(mastX, sailBottom);
  ctx.closePath();
  ctx.fill();

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

function renderEnemy(e) {
  ctx.save();

  const isTarget = combat.targetId === e.id;
  const angle = Math.atan2(e.vy, e.vx);
  const spriteKey = getEnemySpriteKey(e.type);

  const drewSprite = state.sprites?.draw(
    ctx,
    spriteKey,
    e.x,
    e.y,
    e.r * 3.2,
    e.r * 3.2,
    angle
  );

  if (!drewSprite) {
    renderFallbackShip(ctx, e.x, e.y, e.r, angle, isTarget, true, e.type, e.color || "rgb(170,45,40)");
  }

  if (e.isAdmiral) {
    ctx.save();

    // Goldene Aura
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "rgba(255,215,80,1)";
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r + 22, 0, Math.PI * 2);
    ctx.fill();

    // Admiral-Symbol über dem Schiff
    const iconY = e.y - e.r - 20;

    ctx.globalAlpha = 0.95;
    ctx.fillStyle = "rgb(255,215,90)";
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(e.x, iconY - 10);       // oben
    ctx.lineTo(e.x + 10, iconY);       // rechts
    ctx.lineTo(e.x, iconY + 10);       // unten
    ctx.lineTo(e.x - 10, iconY);       // links
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    // kleiner Punkt in der Mitte
    ctx.beginPath();
    ctx.arc(e.x, iconY, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    ctx.restore();
  }

  ctx.globalAlpha = e.hitT > 0 ? 0.65 : 0.95;

  const tcfg = state.enemyTypes?.[e.type] || {};
  ctx.fillStyle = tcfg.color || "rgb(170,45,40)";

  ctx.globalAlpha = 0.95;
  ctx.font = "600 11px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillText(e.name ?? e.type ?? "Enemy", e.x + 1, e.y + e.r + 6);

ctx.fillStyle = e.isAdmiral ? "rgb(255,215,90)" : "#fff";
ctx.font = e.isAdmiral
  ? "700 12px system-ui, -apple-system, Segoe UI, Roboto, Arial"
  : "600 11px system-ui, -apple-system, Segoe UI, Roboto, Arial";

ctx.fillText(e.name ?? e.type ?? "Enemy", e.x, e.y + e.r + 10);

  const w = 34;
  const h = 5;
  const pct = clamp(e.hp / (e.maxHp || 1), 0, 1);

  const bx = e.x - w / 2;
  const by = e.y + e.r + 15;

  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#000";
  ctx.fillRect(bx, by, w, h);

  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "rgb(32,172,32)";
  ctx.fillRect(bx, by, w * pct, h);

ctx.globalAlpha = 0.35;
ctx.strokeStyle = e.isAdmiral ? "rgb(255,210,60)" : "#fff";
ctx.lineWidth = e.isAdmiral ? 2 : 1;
ctx.strokeRect(bx, by, w, h);

  ctx.restore();

}

// ---------- Render ----------
function render() {
  ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
  ctx.clearRect(0, 0, CW(), CH());

  water.render(ctx, canvas);

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  islands.render(ctx);
  wrecks.render(ctx, state);

  currentMode.renderWorld?.(ctx, state);

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
    const angle = Math.atan2(p.vy, p.vx);
    const drewProjectile = state.sprites?.draw(
      ctx,
      "cannonball",
      p.x,
      p.y,
      p.r * 5,
      p.r * 5,
      angle
    );

    if (!drewProjectile) {
      ctx.fillStyle = p.fromEnemy ? "rgba(255,120,120,0.95)" : "#fff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  for (const e of enemies) renderEnemy(e);

  if (showEnemyRanges) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;

    for (const e of enemies) {
      if (!e) continue;
      if (!e.fireEnabled) continue;

      const range =
        state.enemyTypes?.[e.type]?.range ??
        (e.type === "sniper" ? CFG.SNIPER_ATTACK_RANGE : CFG.ENEMY_ATTACK_RANGE);

      ctx.beginPath();
      ctx.arc(e.x, e.y, range, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Player ship
  const playerAngle = Math.atan2(
    (input.isDown("s") || input.isDown("arrowdown")) - (input.isDown("w") || input.isDown("arrowup")),
    (input.isDown("d") || input.isDown("arrowright")) - (input.isDown("a") || input.isDown("arrowleft"))
  );

  const hasDir =
    input.isDown("a") || input.isDown("d") || input.isDown("w") || input.isDown("s") ||
    input.isDown("arrowleft") || input.isDown("arrowright") || input.isDown("arrowup") || input.isDown("arrowdown");

  const drewPlayer = state.sprites?.draw(
    ctx,
    "player",
    player.x,
    player.y,
    player.r * 4.2,
    player.r * 4.2,
    hasDir ? playerAngle : 0
  );

  if (!drewPlayer) {
    renderFallbackShip(ctx, player.x, player.y, player.r, hasDir ? playerAngle : 0, false, false, "player");
  }

  const cannon = getEquippedCannon(state);

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

  if (repair.active) {
    ctx.save();

    const pulse = 0.6 + Math.sin(repair.fxT * 4) * 0.4;

    ctx.globalAlpha = 0.25 * pulse;
    ctx.fillStyle = "rgba(120,255,120,1)";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r + 22, 0, Math.PI * 2);
    ctx.fill();

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

  const ic = getIslandColliders();
  ctx.save();
  ctx.fillStyle = "rgba(255,0,0,0.25)";
  for (const c of ic) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.restore();

  currentMode.renderUI?.(ctx, state);

  const t = getTargetEnemy(state);

  hudOverlay.update(state, t);
  wrecks.renderHud(ctx, canvas, state);

  ctx.save();
  ctx.fillStyle = repair.active ? "rgba(120,255,120,0.95)" : "rgba(255,255,255,0.75)";
  ctx.font = "600 14px system-ui";
  ctx.textAlign = "left";
  ctx.restore();

  if (showMinimap) {
    drawMinimap(ctx, state, {
      width: 240,
      height: 135,
      pad: 16,
    });
  }

  ctx.save();
  ctx.fillStyle = "#fff";
  ctx.font = "600 16px system-ui";
  ctx.textAlign = "center";
  ctx.restore();

  // Loot notifications
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = "600 14px system-ui, -apple-system, Segoe UI, Roboto, Arial";

   // Admiral progress
if (state.admirals) {
  const remaining = Math.max(0, state.admirals.killsNeeded - state.admirals.killCount);
  const text =
    state.admirals.active > 0
      ? "Admiral active"
      : `Next Admiral in: ${remaining} Raider kills`;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(16, 92, 220, 34);

  ctx.fillStyle = state.admirals.active > 0 ? "rgb(255,215,90)" : "#fff";
  ctx.font = "600 14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 28, 109);
  ctx.restore();
}

const equippedShipHud = getEquippedShip(state);

ctx.save();
ctx.fillStyle = "rgba(0,0,0,0.45)";
ctx.fillRect(16, 172, 220, 34);

ctx.fillStyle = "#fff";
ctx.font = "600 14px system-ui";
ctx.textAlign = "left";
ctx.textBaseline = "middle";
ctx.fillText(
  `Ship: ${equippedShipHud.name} (${equippedShipHud.cannonSlots} slots)`,
  28,
  189
);
ctx.restore();


  for (let i = 0; i < lootNotices.length; i++) {
    const n = lootNotices[i];
    const alpha = Math.min(1, n.t / 0.4);

    const x = canvas.clientWidth - 300;
    const y = 110 + i * 24 - n.yOff;

    ctx.globalAlpha = alpha * 0.8;
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillText(n.text, x + 1, y + 1);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#fff";
    ctx.fillText(n.text, x, y);
  }
  ctx.restore();

  renderWorkshopUI(ctx, state);

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