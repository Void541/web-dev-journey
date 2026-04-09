import { startLoop } from "./src/engine/loop.js";
import { createInput } from "./src/engine/input.js";
import { clamp } from "./src/engine/math.js";
import { updateEnemies } from "./src/enemies/updateEnemies.js";
import { spawnEnemy } from "./src/enemies/spawnEnemy.js";
import { updateProjectiles } from "./src/updateProjectiles.js";
import { createDamageSystem } from "./src/damageNumbers.js";
import { createSpace } from "./src/space.js";
import { createIslands } from "./src/islands.js";
import { createOverworld } from "./src/modes/overworld.js";
import { createPirateCove } from "./src/modes/pirateCove.js";
import { enemyTypes } from "./src/entities/enemyTypes.js";
import { createWreckSystem } from "./src/systems/wrecks.js";
import { createLootTable } from "./src/systems/lootTable.js";
import { createHudOverlay } from "./src/render/hudOverlay.js";
import { renderGame } from "./src/render/renderWorld.js";
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
import { SHIP_TYPES, getEquippedShip } from "./src/systems/ships.js";
import { CrewSystem, getEquippedCrew } from "./src/systems/crew.js";
import { CANNON_TYPES } from "./src/systems/cannons.js";
import { createLevelSystem } from "./src/systems/levels.js";
import { createTalentSystem } from "./src/systems/talente.js";
import { createNetworkSystem } from "./src/multiplayer-server/network.js";
import { isQuestComplete, giveQuestReward } from "./src/quests/questLogic.js";
import { QUESTS } from "./src/quests/quests.js";
import { merchantNpc, openMerchant } from "./src/npcs/merchant.js";
import { dockmasterNpc, openDockmaster } from "./src/npcs/dockmaster.js";
import { navigatorNpc, openNavigator } from "./src/npcs/navigator.js";

const DEV_MODE = true;
const PLAYER_API_BASE = "http://127.0.0.1:3000";
const HP_TALENT_BONUS = 15;
const SPEED_TALENT_STEP = 0.08;

const multiplayerNetwork = createNetworkSystem();
const remotePlayers = multiplayerNetwork.remotePlayers;


const overworld = createOverworld();
const pirateCove = createPirateCove();
const sprites = createSpriteManager();

// --- Load sprites ---
sprites.load("player", "assets/ships/player.png");
sprites.load("enemy_tank", "assets/ships/enemy_tank.png");
sprites.load("enemy_sniper", "assets/ships/enemy_sniper.png");
sprites.load("enemy_disabler", "assets/ships/enemy_disabler.png");
sprites.load("enemy_raider", "assets/ships/enemy_raider.png");
sprites.load("cannonball", "assets/ships/cannonball.png");

const shipStats = createShipStats();
const craftingRecipes = createCraftingRecipes();
const craftingSystem = createCraftingSystem(craftingRecipes);

let currentMode = pirateCove;
let overworldSpawnTimer = 0;
let mode = "pirateCove";

function setMode(next, options = {}) {
  mode = next;
  state.mode = next;

  applyWorld(WORLDS[next]);

  if (next === "pirateCove") {
    currentMode = pirateCove;
  } else {
    currentMode = overworld;
  }

  currentMode.enter?.(state, options);
}

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const input = createInput();
const islands = createIslands();
const space = createSpace();
const damage = createDamageSystem();
const CW = () => canvas.clientWidth;
const CH = () => canvas.clientHeight;
const effect = [];
const effects = [];
const levelSystem = createLevelSystem();
const talentSystem = createTalentSystem();

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


// World/camera
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

// ---- World presets ----
const WORLDS = {
  overworld: { w: 4000, h: 1400 },
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
  angle: 0,
};

let lastSent = {
  x: player.x,
  y:player.y,
  angle: player.angle,
};

function shouldSendPlayerState(player) {
  const moved =
    Math.abs(player.x - lastSent.x) > 0.5 ||
    Math.abs(player.y - lastSent.y) > 0.5;
  const rotated = Math.abs((player.angle ?? 0) - (lastSent.angle ?? 0)) > 0.01;

  if (!moved && !rotated) return false;

  lastSent = {
    x: player.x,
    y: player.y,
    angle: player.angle ?? 0,
  };

  return true;
}


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
  combat, islands, space, damage,
  mode,
  overworldSpawnTimer,
  enemyTypes,
  sprites,
  enemyRuntime,
  randomEnemyName,
  ENEMY_SPEED,
  transitions: {
    // Stores where the player should return after leaving the home hub.
    overworldReturn: null,
  },
};

async function saveLoadoutState() {
  if (!state.account?.playerId) return;

  try {
    await fetch(`${PLAYER_API_BASE}/save-loadout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId: state.account.playerId,
        ship: state.playerShip,
        loadout: {
          cannons: state.playerLoadout?.cannons ?? ["light", null, null],
          activeCannonSlot: state.ui?.activeCannonSlot ?? 0,
        },
        crew: state.crew,
        inventory: {
          ...state.inventory,
          gold: state.gold,
        },
        progression: {
          unlocked: state.progression?.unlocked,
        },
      }),
    });
  } catch (error) {
    console.error("Loadout save failed:", error);
  }
}

function applyAuthenticatedPlayer(playerData) {
  if (!playerData) return;

  // Keep account identity in local state so gameplay changes can be persisted.
  state.account = {
    playerId: playerData.id,
    username: playerData.username,
  };

  if (playerData.progression) {
    state.progression = {
      ...state.progression,
      ...playerData.progression,
    };
  }

  if (playerData.ship?.id) {
    state.playerShip = { id: playerData.ship.id };
  }

  if (playerData.loadout) {
    state.playerLoadout = {
      ...state.playerLoadout,
      cannons: Array.isArray(playerData.loadout.cannons)
        ? [...playerData.loadout.cannons]
        : state.playerLoadout.cannons,
      cooldowns: [0, 0, 0],
    };
    state.ui.activeCannonSlot = Number(playerData.loadout.activeCannonSlot ?? 0);
  }

  if (playerData.crew) {
    state.crew = {
      ...state.crew,
      ...playerData.crew,
    };
  }

  if (playerData.inventory) {
    state.gold = Number(playerData.inventory.gold ?? state.gold ?? 0);
    state.inventory = {
      ...state.inventory,
      ...playerData.inventory,
    };
  }
}

function getResourceAmount(key) {
  if (key === "gold") return state.gold ?? 0;
  if (key === "scrap") return state.inventory?.scrap ?? state.inventory?.metal ?? 0;
  return state.inventory?.[key] ?? 0;
}

function canAffordCost(cost) {
  if (!cost) return true;
  return Object.entries(cost).every(([key, amount]) => getResourceAmount(key) >= amount);
}

function spendCost(cost) {
  if (!cost) return true;
  if (!canAffordCost(cost)) return false;

  for (const [key, amount] of Object.entries(cost)) {
    if (key === "gold") {
      state.gold = Math.max(0, (state.gold ?? 0) - amount);
      continue;
    }

    if (key === "scrap") {
      if ((state.inventory?.scrap ?? 0) > 0) {
        state.inventory.scrap = Math.max(0, (state.inventory.scrap ?? 0) - amount);
      } else {
        state.inventory.metal = Math.max(0, (state.inventory?.metal ?? 0) - amount);
      }
      continue;
    }

    state.inventory[key] = Math.max(0, (state.inventory?.[key] ?? 0) - amount);
  }

  return true;
}

function formatCostText(cost) {
  if (!cost) return "starter issue";
  return Object.entries(cost)
    .map(([key, value]) => `${value} ${key}`)
    .join(", ");
}

state.questTracker = createQuestTracker(state);
state.mode = mode;
state.setMode = setMode;
state.spawnProjectile = spawnProjectile;
state.spawnEnemy = (options) => spawnEnemy(state, options);
state.pushLootNotice = pushLootNotice;

const hudOverlay = createHudOverlay();
state.hudOverlay = hudOverlay;
state.getEquippedShip = getEquippedShip;


state.playerShip = {
  id: "frigate",
};

state.shipStats = shipStats;
state.playerLoadout = {
  cannons:["light", null, null],
  cooldowns: [0, 0, 0],
};

state.admirals = {
  naturalSpawn: false,
  killCount: 0,
  killsNeeded: 99999,
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

state.questEvents = state.questEvents ?? {
  firstAdmiralTriggered:false,
};

state.progression = {
  level: 1,
  xp: 0,
  xpToNext: 100,
  talentPoints: 0,
  talents: {
    dmg: 0,
    hp: 0,
    speed: 0,
  },
  unlocked: {
    ships: { sloop: true, brig: false, frigate: false },
    weapons: { light: true, heavy: false, rapid: false },
    crew: { captain: true, firstMate: false, navigator: false, gunner: false },
  },
};

state.ui = {
  shipyardOpen: false,
  workshopOpen: false,
  skillsOpen: false,
  dockmasterOpen: false,
  craftingOpen: false,
  activeCannonSlot: 0,
};

state.moveTarget = null;

state.crew = state.crew ?? {};

state.crew = {
  gunner:false,
  navigator:false,
  firstMate:false,
  captain:true,
};

state.ui.activeCannonSlot = state.ui.cannonSlot ?? 0;

window.addEventListener("auth:login-success", (event) => {
  applyAuthenticatedPlayer(event.detail?.player);
});

state.crafting = {
  recipes: craftingRecipes,
  craft: (id) => {
    if (state.mode !== "pirateCove") {
      state.pushLootNotice?.("Crafting is only available in the Mercenary Hangar");
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

state.inventory = state.inventory ?? { gold: 0, wood: 0, metal: 0, scrap: 0, cloth: 0, tech: 0, powder: 0, gear: 0 };
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
    state.pushLootNotice?.(`+${enemy.xp ?? 0} XP`);

if(enemy.isAdmiral) {
  state.progress.admiralKills += 1;
} else {
  state.progress.kills += 1;
}

const activeQuest = state.quests?.active;

if(activeQuest?.id === "kill5" && 
  isQuestComplete(state, activeQuest) &&
  !state.questEvents.firstAdmiralTriggered) {
    giveQuestReward(state, activeQuest);
    state.quests.completed.push(activeQuest.id);
    state.pushLootNotice?.(`Completed quest: ${activeQuest.title}`);
    state.quests.active = QUESTS.find(q => q.id === activeQuest.nextQuestID) ?? null;
  state.questEvents.firstAdmiralTriggered = true;
    console.log("First admiral kill triggered");
  state.spawnEnemy?.({
    type: "basic",
    admiral: true,
  });
  }

  if (enemy.isAdmiral) {
    state.admirals.active = Math.max(0, state.admirals.active - 1);
    state.pushLootNotice?.(`${enemy.name} defeated`);
 } else {
  const countsForAdmiral =
    enemy.type === "basic" || enemy.type === "basic";

  if (countsForAdmiral) {
    state.admirals.killCount += 1;
  }

  const adm = state.admirals;
  if (adm.killCount >= adm.killsNeeded && adm.active < adm.maxActive && adm.naturalSpawn) {
    const spawned = state.spawnEnemy?.({
      type: "basic",
      admiral: true,
    });

    if (spawned) {
      adm.killCount = 0;
      adm.active += 1;
      state.pushLootNotice?.(`${spawned.name} has appeared!`);
    }
  }
}
levelSystem.addXP?.(state, enemy.xp ?? 0,);
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

// Run the same mode setup path on first load that we use for later
// transitions so the initial world size and hub state stay in sync.
setMode(mode);

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
    if (state.ui.workshopOpen) {
      state.ui.skillsOpen = false;
    }
  },

  toggleSkills: () => {
    state.ui.skillsOpen = !state.ui.skillsOpen;
    if (state.ui.skillsOpen) {
      state.ui.workshopOpen = false;
    }
  },

  craft: (id) => {
    state.crafting?.craft?.(id);
  },
};

if (DEV_MODE) {
  window.addEventListener("keydown", (e) => {
    if (isTypingIntoUi()) return;
    const k = e.key.toLowerCase();

    if (k === "m") {
      state.spawnEnemy?.({
        type: "basic",
        admiral: true,
      });
    }
  });
}

window.addEventListener("keydown", (e) => {
  if (isTypingIntoUi()) return;
  const k = e.key.toLowerCase();

  if (k === "p") togglePause();

  if (k === "escape") {
    state.ui.dockmasterOpen = false;
    state.ui.merchantOpen = false;
    state.ui.navigatorOpen = false;
    state.ui.workshopOpen = false;
    state.ui.skillsOpen = false;
  }

  if (k === "r") {
    repair.active = !repair.active;
    repair.t = 0;
  }

  if (k === "g") showEnemyRanges = !showEnemyRanges;
  if (k === "n") showMinimap = !showMinimap;
  if (k === "c") state.ui.workshopOpen = !state.ui.workshopOpen;
  if (k === "k") {
    state.ui.skillsOpen = !state.ui.skillsOpen;
    if (state.ui.skillsOpen) {
      state.ui.workshopOpen = false;
    }
  }
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

function getEnemyApproachRange() {
  const cannons = state.playerLoadout?.cannons ?? [];
  const ranges = cannons
    .filter(Boolean)
    .map((id) => CANNON_TYPES[id]?.range ?? 0)
    .filter((range) => range > 0);

  if (ranges.length === 0) return 280;

  const shortestRange = Math.min(...ranges);
  return Math.max(120, shortestRange - 36);
}

function findHangarInteractableAt(x, y) {
  if (state.mode !== "pirateCove") return null;

  const interactables = [
    {
      id: "merchant",
      x: merchantNpc.x,
      y: merchantNpc.y,
      hitRadius: merchantNpc.r + 12,
      stopRange: merchantNpc.r + 24,
    },
    {
      id: "dockmaster",
      x: dockmasterNpc.x,
      y: dockmasterNpc.y,
      hitRadius: dockmasterNpc.r + 12,
      stopRange: dockmasterNpc.r + 60,
    },
    {
      id: "navigator",
      x: navigatorNpc.x,
      y: navigatorNpc.y,
      hitRadius: navigatorNpc.r + 12,
      stopRange: navigatorNpc.r + 60,
    },
  ];

  for (const npc of interactables) {
    const dx = x - npc.x;
    const dy = y - npc.y;

    if (dx * dx + dy * dy <= npc.hitRadius * npc.hitRadius) {
      return npc;
    }
  }

  return null;
}

canvas.addEventListener("click", (ev) => {
  const m = getMousePos(ev);
  const wpos = screenToWorld(m.x, m.y);
  const interactable = findHangarInteractableAt(wpos.x, wpos.y);

  if (interactable) {
    state.moveTarget = {
      kind: "interact",
      targetId: interactable.id,
      x: interactable.x,
      y: interactable.y,
      stopRange: interactable.stopRange,
    };

    combat.targetId = null;
    const npcLabel =
      interactable.id === "dockmaster"
        ? "Ship Technician"
        : interactable.id === "navigator"
          ? "Contract Officer"
          : "Salvage Broker";
    state.pushLootNotice?.(`Autopilot engaged: ${npcLabel}`);
    return;
  }

  const e = findEnemyAt(wpos.x, wpos.y);
  combat.targetId = e ? e.id : null;

  if (e) {
    state.moveTarget = {
      kind: "enemy",
      enemyId: e.id,
      stopRange: getEnemyApproachRange(),
    };
    return;
  }

  state.moveTarget = null;
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
const newMaxHp =
  Number(
    equippedShip.maxHp +
      (state.progression?.talents?.hp ?? 0) * HP_TALENT_BONUS
  ) || 10 ;

const oldMaxHp = Number(player.maxHp) || newMaxHp ;
const oldHp = Number(player.hp) || oldMaxHp;

if (oldMaxHp !== newMaxHp) {
  const hpRatio = oldMaxHp > 0 ? oldHp / oldMaxHp : 1;

  player.maxHp = newMaxHp ;
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

  if (wantsMove && state.moveTarget) {
    state.moveTarget = null;
  }

const equippedCrew = getEquippedCrew(state);
const repairMul = equippedCrew.firstMate?.repairMul ?? 1.0;

  if (repair.active && wantsMove) {
    repair.active = false;
    repair.t = 0;
    repair.interrupted = true;
  }

  if (repair.active && player.hp > 0 && player.hp < player.maxHp) {
    repair.interrupted = false;
    repair.fxT += dt;
    repair.healAcc += repair.rate * dt * repairMul;

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

  space.update(dt);

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

  if (!wantsMove && state.moveTarget) {
    let targetX = state.moveTarget.x;
    let targetY = state.moveTarget.y;

    if (state.moveTarget.kind === "enemy") {
      const targetEnemy = enemies.find((enemy) => enemy?.id === state.moveTarget.enemyId);

      if (!targetEnemy || targetEnemy.hp <= 0) {
        state.moveTarget = null;
      } else {
        targetX = targetEnemy.x;
        targetY = targetEnemy.y;
      }
    }

    if (state.moveTarget) {
      const dx = targetX - player.x;
      const dy = targetY - player.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= (state.moveTarget.stopRange ?? player.r + 8)) {
        if (state.moveTarget.kind === "interact") {
          if (state.moveTarget.targetId === "merchant") {
            openMerchant(state);
          } else if (state.moveTarget.targetId === "dockmaster") {
            openDockmaster(state);
          } else if (state.moveTarget.targetId === "navigator") {
            openNavigator(state);
          }

          state.moveTarget = null;
        }
      } else {
        const dir = norm(dx, dy);
        ax = dir.x;
        ay = dir.y;
        player.angle = Math.atan2(dir.y, dir.x);
      }
    }
  }

   if ( ax !== 0 || ay !== 0) {
        player.angle = Math.atan2(ay, ax);  
  }

multiplayerNetwork.updateRemotePlayers();


  const islandColliders = islands.getColliders();

  if (typeof islands.resolveCircle === "function") {
    islands.resolveCircle(player);
  }

  

  const ship = getEquippedShip(state);
  const speedMul = equippedCrew.navigator?.speed ?? 1.0;
  const moveSpeed =
    shipStats.getSpeed(PLAYER_SPEED) *
    ship.speedMul *
    speedMul *
    (1 + (state.progression?.talents?.speed ?? 0) * SPEED_TALENT_STEP);

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

  for (const b of state.ui.workshopTabButtons ?? []) {
    const inside =
      mx >= b.x &&
      mx <= b.x + b.w &&
      my >= b.y &&
      my <= b.y + b.h;

    if (!inside) continue;
    state.ui.workshopTab = b.id;
  }

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
//Crew selection buttons
for (const b of state.ui.crewButtons ?? []) {
  const inside =
    mx >= b.x &&
    mx <= b.x + b.w &&
    my >= b.y &&
    my <= b.y + b.h;

    if(!inside) continue;
    if(b.disabled) continue;

    state.progression = state.progression ?? {};
    state.progression.unlocked = state.progression.unlocked ?? {};
    state.progression.unlocked.crew = state.progression.unlocked.crew ?? {
      captain: true,
      firstMate: false,
      navigator: false,
      gunner: false,
    };

    const crewData = CrewSystem[b.id];
    const isUnlocked = Boolean(state.progression.unlocked.crew[b.id]);

    if (!isUnlocked) {
      if (!spendCost(crewData?.cost)) {
        state.pushLootNotice?.(`Need ${formatCostText(crewData?.cost)} to hire ${b.label}`);
        continue;
      }

      state.progression.unlocked.crew[b.id] = true;
      state.pushLootNotice?.(`Hired ${b.label}`);
      saveLoadoutState();
      continue;
    }

    state.crew = state.crew ?? {};
    state.crew[b.id] = !(state.crew?.[b.id] ?? false);

    state.pushLootNotice?.(`${state.crew[b.id] ? "Equipped" : "Unequipped"} ${b.label}`);
    saveLoadoutState();
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
    saveLoadoutState();
  }

  // Cannon equip buttons
  for (const b of state.ui.cannonButtons ?? []) {
    const inside =
      mx >= b.x &&
      mx <= b.x + b.w &&
      my >= b.y &&
      my <= b.y + b.h;

    if (!inside) continue;

    state.progression = state.progression ?? {};
    state.progression.unlocked = state.progression.unlocked ?? {};
    state.progression.unlocked.weapons = state.progression.unlocked.weapons ?? {
      light: true,
      heavy: false,
      rapid: false,
    };

    const cannonData = CANNON_TYPES[b.id];
    const isUnlocked = Boolean(state.progression.unlocked.weapons[b.id]);

    if (!isUnlocked) {
      if (!spendCost(cannonData?.cost)) {
        state.pushLootNotice?.(`Need ${formatCostText(cannonData?.cost)} to unlock ${b.label}`);
        continue;
      }

      state.progression.unlocked.weapons[b.id] = true;
      state.pushLootNotice?.(`Unlocked ${b.label}`);
      saveLoadoutState();
      continue;
    }

    state.playerLoadout = state.playerLoadout ?? {};
    state.playerLoadout.cannons = state.playerLoadout.cannons ?? ["light", null, null];

    const slot = state.ui?.activeCannonSlot ?? 0;
    state.playerLoadout.cannons[slot] = b.id;

    state.pushLootNotice?.(`Equipped ${b.label} to Slot ${slot + 1}`);
    saveLoadoutState();

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

    state.progression = state.progression ?? {};
    state.progression.unlocked = state.progression.unlocked ?? {};
    state.progression.unlocked.ships = state.progression.unlocked.ships ?? {
      sloop: true,
      brig: false,
      frigate: false,
    };

    const shipData = SHIP_TYPES[b.id];
    const isUnlocked = Boolean(state.progression.unlocked.ships[b.id]);

    if (!isUnlocked) {
      if (!spendCost(shipData?.cost)) {
        state.pushLootNotice?.(`Need ${formatCostText(shipData?.cost)} to unlock ${b.label}`);
        continue;
      }

      state.progression.unlocked.ships[b.id] = true;
      state.pushLootNotice?.(`Unlocked ship: ${b.label}`);
      saveLoadoutState();
      continue;
    }

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
    saveLoadoutState();
  }
}

if (state.ui?.skillsOpen && state.input?.mousePressed?.()) {
  const rect = state.canvas.getBoundingClientRect();
  const mx = state.input.mouse.x - rect.left;
  const my = state.input.mouse.y - rect.top;

  for (const b of state.ui.skillButtons ?? []) {
    const inside =
      mx >= b.x &&
      mx <= b.x + b.w &&
      my >= b.y &&
      my <= b.y + b.h;

    if (!inside) continue;
    if (b.disabled) continue;

    const spent = talentSystem.allocateTalentPoint(state, b.id);
    if (spent) {
      state.pushLootNotice?.(`Talent upgraded: ${b.label}`);
      saveLoadoutState();
    }
  }
}

  if (shouldSendPlayerState(player)) {
    multiplayerNetwork.sendPlayerState(player);
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

function isTypingIntoUi() {
  const el = document.activeElement;
  if (!el) return false;

  const tag = el.tagName?.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    el.isContentEditable === true
  );
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

    // Draw a simple rank marker above admiral ships so they stand out in combat.
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
  renderGame(ctx, state, {
    currentMode,
    remotePlayers,
    showEnemyRanges,
    showMinimap,
    paused,
    repair,
    lootNotices,
    getTargetEnemy,
    getIslandColliders,
  });
}

