const path = require("path");
// Load the server-local .env even if Node is started from the project root.
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const bcrypt = require("bcryptjs");


const app = express();
const server = http.createServer(app);

const mongoose = require("mongoose");

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error.message);
});

mongoose
  .connect(process.env.MONGODB_URI)
  .catch((error) => {
    console.error("MongoDB is unavailable. The server will keep running without database access.");
    console.error(error.message);
  });

const Player = require("./models/Player");
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

function toClientPlayer(player) {
  // Only send safe player data back to the browser.
  return {
    id: String(player._id),
    username: player.username,
    email: player.email,
    emailVerified: Boolean(player.emailVerified),
    progression: player.progression,
    ship: player.ship,
    loadout: player.loadout,
    crew: player.crew,
    inventory: player.inventory,
  };
}

app.post("/register", async (req, res) => {
  console.log("[AUTH] Register request received for:", req.body?.username ?? "(missing username)");
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Database unavailable" });
  }

  const { username, email, password } = req.body;



  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, email, and password are required" });
  }

  // Hash passwords on the server so the raw value never gets stored in MongoDB.
  const passwordHash = bcrypt.hashSync(password, 10); // In production, use a proper password hashing strategy with salts and unique hashes per user.

  try {
    const newPlayer = new Player({
      username,
      email,
      passwordHash,
      emailVerified: false,
      verificationToken: null,
      progression: {
        level: 1,
        xp: 0,
        talentPoints: 0,
        talents: {dmg: 0, hp: 0, speed: 0,},
        unlocked: {
          ships: { sloop: true, brig: false, frigate: false },
          weapons: { light: true, heavy: false, rapid: false },
          crew: { captain: true, firstMate: false, navigator: false, gunner: false },
        },
      },
      ship: { id: "sloop" },
      loadout: {
        cannons: ["light", null, null],
        activeCannonSlot: 0,
      },
      crew: {
        gunner: false,
        navigator: false,
        firstMate: false,
        captain: true,
      },
      inventory: { credits: 0, wood: 0, metal: 0, scrap: 0, cloth: 0, tech: 0, powder: 0, gear: 0 },
      });
      
    await newPlayer.save();
    res.json({
      success: true,
      player: toClientPlayer(newPlayer),
      message: "Registration successful. Email verification can be added next.",
    });
  } catch (error) {
    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern ?? {})[0];
      const fieldLabel = duplicateField === "email" ? "Email" : "Username";
      return res.status(400).json({ error: `${fieldLabel} already exists` });
    }

    console.error("[AUTH] Register error:", error);
    res.status(400).json({ error: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  console.log("[AUTH] Login request received for:", req.body?.username ?? "(missing username)");
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Database unavailable" });
  }

  const { username, password } = req.body;

  const player = await Player.findOne({ username });

  if (!player || bcrypt.compareSync(password, player.passwordHash) === false) {
    return res.status(401).json({ error: "Invalid login credentials" });
  }

  res.json({ success: true, player: toClientPlayer(player) });
});

app.post("/save-loadout", async (req, res) => {
  console.log("[AUTH] Save loadout request received for:", req.body?.playerId ?? "(missing player id)");
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Database unavailable" });
  }

  const { playerId, ship, loadout, crew, inventory, progression } = req.body ?? {};

  if (!playerId) {
    return res.status(400).json({ error: "Player id is required" });
  }

  try {
    const player = await Player.findById(playerId);

    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    if (ship?.id) {
      player.ship = { id: ship.id };
    }

    if (loadout) {
      player.loadout = {
        cannons: Array.isArray(loadout.cannons) ? loadout.cannons.slice(0, 3) : ["light", null, null],
        activeCannonSlot: Number(loadout.activeCannonSlot ?? 0),
      };
    }

    if (crew) {
      player.crew = {
        gunner: Boolean(crew.gunner),
        navigator: Boolean(crew.navigator),
        firstMate: Boolean(crew.firstMate),
        captain: Boolean(crew.captain),
      };
    }

    if (inventory) {
      player.inventory = {
        credits: Number(inventory.credits ?? inventory.gold ?? player.inventory?.credits ?? player.inventory?.gold ?? 0),
        wood: Number(inventory.wood ?? player.inventory?.wood ?? 0),
        metal: Number(inventory.metal ?? player.inventory?.metal ?? 0),
        scrap: Number(inventory.scrap ?? player.inventory?.scrap ?? player.inventory?.metal ?? 0),
        cloth: Number(inventory.cloth ?? player.inventory?.cloth ?? 0),
        tech: Number(inventory.tech ?? player.inventory?.tech ?? 0),
        powder: Number(inventory.powder ?? player.inventory?.powder ?? 0),
        gear: Number(inventory.gear ?? player.inventory?.gear ?? 0),
      };
    }

    if (progression?.unlocked) {
      player.progression = player.progression ?? {};
      player.progression.unlocked = {
        ships: {
          sloop: Boolean(progression.unlocked.ships?.sloop ?? player.progression?.unlocked?.ships?.sloop ?? true),
          brig: Boolean(progression.unlocked.ships?.brig ?? player.progression?.unlocked?.ships?.brig ?? false),
          frigate: Boolean(progression.unlocked.ships?.frigate ?? player.progression?.unlocked?.ships?.frigate ?? false),
        },
        weapons: {
          light: Boolean(progression.unlocked.weapons?.light ?? player.progression?.unlocked?.weapons?.light ?? true),
          heavy: Boolean(progression.unlocked.weapons?.heavy ?? player.progression?.unlocked?.weapons?.heavy ?? false),
          rapid: Boolean(progression.unlocked.weapons?.rapid ?? player.progression?.unlocked?.weapons?.rapid ?? false),
        },
        crew: {
          captain: Boolean(progression.unlocked.crew?.captain ?? player.progression?.unlocked?.crew?.captain ?? true),
          firstMate: Boolean(progression.unlocked.crew?.firstMate ?? player.progression?.unlocked?.crew?.firstMate ?? false),
          navigator: Boolean(progression.unlocked.crew?.navigator ?? player.progression?.unlocked?.crew?.navigator ?? false),
          gunner: Boolean(progression.unlocked.crew?.gunner ?? player.progression?.unlocked?.crew?.gunner ?? false),
        },
      };
    }

    await player.save();
    res.json({ success: true, player: toClientPlayer(player) });
  } catch (error) {
    console.error("[AUTH] Save loadout error:", error);
    res.status(400).json({ error: "Could not save loadout" });
  }
});

app.get("/", (req, res) => {
  res.send("Multiplayer server is running.");
});

const io = new Server(server, {
  cors: { origin: "*" },
});

const players = {};
const sharedEnemies = [];
let nextEnemyId = 1;
let spawnTimer = 0;

const SHARED_WORLD = {
  width: 4000,
  height: 1400,
  enemyCap: 10,
  spawnEvery: 1.6,
  tickRateMs: 50,
};

const ENEMY_TYPES = {
  basic: { hp: 24, r: 16, speed: 90, color: "rgb(170,45,40)", spawnWeight: 70 },
  tank: { hp: 40, r: 22, speed: 58, color: "rgb(120,40,40)", spawnWeight: 18 },
  sniper: { hp: 18, r: 16, speed: 80, color: "rgb(200,200,255)", spawnWeight: 8 },
  disabler: { hp: 28, r: 17, speed: 86, color: "rgb(140,220,160)", spawnWeight: 4 },
};

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function pickSharedEnemyType() {
  const entries = Object.entries(ENEMY_TYPES).filter(([type]) => type !== "admiral");
  const totalWeight = entries.reduce((sum, [, config]) => sum + (config.spawnWeight ?? 1), 0);
  let roll = rand(0, totalWeight);

  for (const [type, config] of entries) {
    roll -= config.spawnWeight ?? 1;
    if (roll <= 0) return type;
  }

  return "basic";
}

function getOverworldPlayers() {
  return Object.values(players).filter((player) => player.mode === "overworld");
}

function toClientEnemy(enemy) {
  return {
    id: enemy.id,
    type: enemy.type,
    x: enemy.x,
    y: enemy.y,
    vx: enemy.vx,
    vy: enemy.vy,
    speed: enemy.speed,
    r: enemy.r,
    hp: enemy.hp,
    maxHp: enemy.maxHp,
    color: enemy.color,
    name: enemy.name,
    isAdmiral: Boolean(enemy.isAdmiral),
  };
}

function spawnSharedEnemy(options = {}) {
  const type = options.type ?? "basic";
  const config = ENEMY_TYPES[type] ?? ENEMY_TYPES.basic;
  const margin = config.r + 12;

  const anchor = options.anchor ?? null;
  const x =
    options.x ??
    (anchor
      ? clamp(anchor.x + rand(-320, 320), margin, SHARED_WORLD.width - margin)
      : rand(margin, SHARED_WORLD.width - margin));
  const y =
    options.y ??
    (anchor
      ? clamp(anchor.y + rand(-220, 220), margin, SHARED_WORLD.height - margin)
      : rand(margin, SHARED_WORLD.height - margin));

  const angle = rand(0, Math.PI * 2);

  const enemy = {
    id: nextEnemyId++,
    type,
    x,
    y,
    vx: Math.cos(angle),
    vy: Math.sin(angle),
    r: Math.round(config.r * (options.admiral ? 1.35 : 1)),
    hp: Math.round(config.hp * (options.admiral ? 3 : 1)),
    maxHp: Math.round(config.hp * (options.admiral ? 3 : 1)),
    speed: config.speed * (options.admiral ? 0.85 : 1),
    color: config.color,
    isAdmiral: Boolean(options.admiral),
    name: options.admiral ? "Admiral Raider Command" : "Raider Patrol",
    aggroT: 0,
    turnT: rand(0.8, 1.8),
  };

  sharedEnemies.push(enemy);
  return enemy;
}

function updateSharedEnemies(dt) {
  const overworldPlayers = getOverworldPlayers();

  spawnTimer -= dt;
  if (
    overworldPlayers.length > 0 &&
    sharedEnemies.length < SHARED_WORLD.enemyCap &&
    spawnTimer <= 0
  ) {
    spawnSharedEnemy({
      type: pickSharedEnemyType(),
      anchor: overworldPlayers[Math.floor(Math.random() * overworldPlayers.length)],
    });
    spawnTimer = SHARED_WORLD.spawnEvery;
  }

  for (const enemy of sharedEnemies) {
    enemy.aggroT = Math.max(0, (enemy.aggroT ?? 0) - dt);

    const target = overworldPlayers.reduce((best, player) => {
      if (!best) return player;
      const bestDist = (best.x - enemy.x) ** 2 + (best.y - enemy.y) ** 2;
      const candidateDist = (player.x - enemy.x) ** 2 + (player.y - enemy.y) ** 2;
      return candidateDist < bestDist ? player : best;
    }, null);

    let desiredX = enemy.vx ?? 1;
    let desiredY = enemy.vy ?? 0;

    if (target) {
      const dx = target.x - enemy.x;
      const dy = target.y - enemy.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;

      if ((enemy.aggroT ?? 0) > 0) {
        desiredX = ux;
        desiredY = uy;
      } else {
        enemy.turnT = (enemy.turnT ?? 0) - dt;

        if (enemy.turnT <= 0) {
          enemy.turnT = rand(0.8, 1.8);
          const cruiseX = (enemy.vx ?? 0) + rand(-0.45, 0.45);
          const cruiseY = (enemy.vy ?? 0) + rand(-0.45, 0.45);
          const cruiseLen = Math.hypot(cruiseX, cruiseY) || 1;
          desiredX = cruiseX / cruiseLen;
          desiredY = cruiseY / cruiseLen;
        }
      }
    } else {
      enemy.turnT = (enemy.turnT ?? 0) - dt;

      if (enemy.turnT <= 0) {
        enemy.turnT = rand(0.8, 1.8);
        const cruiseX = (enemy.vx ?? 0) + rand(-0.45, 0.45);
        const cruiseY = (enemy.vy ?? 0) + rand(-0.45, 0.45);
        const cruiseLen = Math.hypot(cruiseX, cruiseY) || 1;
        desiredX = cruiseX / cruiseLen;
        desiredY = cruiseY / cruiseLen;
      }
    }

    const steer = (enemy.aggroT ?? 0) > 0 ? 0.12 : 0.08;
    enemy.vx = (enemy.vx ?? desiredX) + (desiredX - (enemy.vx ?? desiredX)) * steer;
    enemy.vy = (enemy.vy ?? desiredY) + (desiredY - (enemy.vy ?? desiredY)) * steer;

    const moveLen = Math.hypot(enemy.vx, enemy.vy) || 1;
    enemy.vx /= moveLen;
    enemy.vy /= moveLen;

    enemy.x = clamp(enemy.x + enemy.vx * enemy.speed * dt, enemy.r, SHARED_WORLD.width - enemy.r);
    enemy.y = clamp(enemy.y + enemy.vy * enemy.speed * dt, enemy.r, SHARED_WORLD.height - enemy.r);

    if (enemy.x <= enemy.r) {
      enemy.x = enemy.r;
      enemy.vx *= -1;
    }
    if (enemy.x >= SHARED_WORLD.width - enemy.r) {
      enemy.x = SHARED_WORLD.width - enemy.r;
      enemy.vx *= -1;
    }
    if (enemy.y <= enemy.r) {
      enemy.y = enemy.r;
      enemy.vy *= -1;
    }
    if (enemy.y >= SHARED_WORLD.height - enemy.r) {
      enemy.y = SHARED_WORLD.height - enemy.r;
      enemy.vy *= -1;
    }
  }
}

setInterval(() => {
  const dt = SHARED_WORLD.tickRateMs / 1000;
  updateSharedEnemies(dt);
  io.emit("enemiesState", sharedEnemies.map(toClientEnemy));
}, SHARED_WORLD.tickRateMs);

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  players[socket.id] = {
    id: socket.id,
    x: 200,
    y: 200,
    angle: 0,
    mode: "pirateCove",
  };

  socket.emit("currentPlayers", players);
  socket.emit("currentEnemies", sharedEnemies.map(toClientEnemy));
  socket.broadcast.emit("playerJoined", players[socket.id]);

  socket.on("playerMove", (data) => {
    if (!players[socket.id]) return;

    players[socket.id].x = data.x;
    players[socket.id].y = data.y;
    players[socket.id].angle = data.angle ?? 0;
    players[socket.id].mode = data.mode ?? players[socket.id].mode ?? "pirateCove";

    console.log("playerMove received server:", players[socket.id]);

    socket.broadcast.emit("playerMoved", players[socket.id]);
  });

  socket.on("enemyHit", ({ targetId, damage }) => {
    const attacker = players[socket.id];
    if (!attacker || attacker.mode !== "overworld") return;

    const enemy = sharedEnemies.find((entry) => entry.id === targetId);
    if (!enemy) return;

    const distance = Math.hypot(enemy.x - attacker.x, enemy.y - attacker.y);
    if (distance > 900) return;

    const appliedDamage = Math.max(0, Math.min(Number(damage) || 0, 100));
    if (appliedDamage <= 0) return;

    enemy.hp -= appliedDamage;
    enemy.aggroT = 4;

    if (enemy.hp <= 0) {
      const defeated = { ...enemy };
      const index = sharedEnemies.findIndex((entry) => entry.id === enemy.id);
      if (index >= 0) sharedEnemies.splice(index, 1);
      socket.emit("enemyKilled", { enemy: toClientEnemy(defeated) });
    }
  });

  socket.on("requestQuestAdmiral", ({ x, y }) => {
    const attacker = players[socket.id];
    if (!attacker || attacker.mode !== "overworld") return;
    if (sharedEnemies.some((enemy) => enemy.isAdmiral)) return;

    spawnSharedEnemy({
      type: "basic",
      admiral: true,
      x,
      y,
      anchor: attacker,
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
    delete players[socket.id];
    io.emit("playerLeft", socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
