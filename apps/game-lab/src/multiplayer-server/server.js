const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

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