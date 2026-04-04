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
      },

       ship: {id:"frigate"},
       inventory: { gold: 0, wood: 0, metal: 0},
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
