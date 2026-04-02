export function createNetworkSystem() {
  const serverUrl =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:3000"
      : undefined;

  const socket = io(serverUrl, {
    autoConnect: true,
  });
  const remotePlayers = {};

  socket.on("connect", () => {
    console.log("Connected:", socket.id);
  });

  socket.on("currentPlayers", (serverPlayers) => {
    for (const id in serverPlayers) {
      if (id === socket.id) continue;

      remotePlayers[id] = {
        ...serverPlayers[id],
        targetX: serverPlayers[id].x,
        targetY: serverPlayers[id].y,
        targetAngle: serverPlayers[id].angle ?? 0,
      };
    }
  });

  socket.on("playerJoined", (player) => {
    if (player.id === socket.id) return;

    remotePlayers[player.id] = {
      ...player,
      targetX: player.x,
      targetY: player.y,
      targetAngle: player.angle ?? 0,
    };
  });

  socket.on("playerMoved", (player) => {
    if (player.id === socket.id) return;

    if (!remotePlayers[player.id]) {
      remotePlayers[player.id] = {
        ...player,
        targetX: player.x,
        targetY: player.y,
        targetAngle: player.angle ?? 0,
      };
      return;
    }

    remotePlayers[player.id].targetX = player.x;
    remotePlayers[player.id].targetY = player.y;
    remotePlayers[player.id].targetAngle = player.angle ?? 0;
  });

  socket.on("playerLeft", (playerId) => {
    delete remotePlayers[playerId];
  });

  function sendPlayerState(player) {
    if (!socket.connected) return;

    socket.emit("playerMove", {
      x: player.x,
      y: player.y,
      angle: player.angle ?? 0,
    });
  }

  function updateRemotePlayers() {
    for (const id in remotePlayers) {
      const rp = remotePlayers[id];

      const smoothing = 0.15;
      rp.x += (rp.targetX - rp.x) * smoothing;
      rp.y += (rp.targetY - rp.y) * smoothing;
      rp.angle += ((rp.targetAngle ?? 0) - (rp.angle ?? 0)) * 0.2;
    }
  }

  return {
    socket,
    remotePlayers,
    sendPlayerState,
    updateRemotePlayers,
  };
}

export const createMultiplayerNetwork = createNetworkSystem;
