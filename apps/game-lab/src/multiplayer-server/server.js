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
      inventory: { gold: 0, wood: 0, metal: 0, scrap: 0, cloth: 0, tech: 0, powder: 0, gear: 0 },
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
        gold: Number(inventory.gold ?? player.inventory?.gold ?? 0),
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

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  players[socket.id] = {
    id: socket.id,
    x: 200,
    y: 200,
    angle: 0,
  };

  socket.emit("currentPlayers", players);
  socket.broadcast.emit("playerJoined", players[socket.id]);

  socket.on("playerMove", (data) => {
    if (!players[socket.id]) return;

    players[socket.id].x = data.x;
    players[socket.id].y = data.y;
    players[socket.id].angle = data.angle ?? 0;

    console.log("playerMove received server:", players[socket.id]);

    socket.broadcast.emit("playerMoved", players[socket.id]);
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
