export function createNetworkSystem() {
  const serverUrl =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:3000"
      : undefined;

  const socket = io(serverUrl, {
    autoConnect: true,
  });
  const remotePlayers = {};
  let sharedEnemiesStore = null;
  let enemyKilledHandler = null;
  const ENEMY_PREDICTION_SECONDS = 0.05;

  function syncEnemySnapshots(serverEnemies = []) {
    if (!sharedEnemiesStore) return;

    const seen = new Set();

    for (const enemy of serverEnemies) {
      seen.add(enemy.id);

      const existing = sharedEnemiesStore.find((entry) => entry.id === enemy.id);
      if (!existing) {
        sharedEnemiesStore.push({
          ...enemy,
          targetX: enemy.x + (enemy.vx ?? 0) * (enemy.speed ?? 0) * ENEMY_PREDICTION_SECONDS,
          targetY: enemy.y + (enemy.vy ?? 0) * (enemy.speed ?? 0) * ENEMY_PREDICTION_SECONDS,
        });
        continue;
      }

      Object.assign(existing, enemy);
      existing.targetX = enemy.x + (enemy.vx ?? 0) * (enemy.speed ?? 0) * ENEMY_PREDICTION_SECONDS;
      existing.targetY = enemy.y + (enemy.vy ?? 0) * (enemy.speed ?? 0) * ENEMY_PREDICTION_SECONDS;
    }

    for (let i = sharedEnemiesStore.length - 1; i >= 0; i--) {
      if (!seen.has(sharedEnemiesStore[i].id)) {
        sharedEnemiesStore.splice(i, 1);
      }
    }
  }

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

  socket.on("currentEnemies", (serverEnemies) => {
    syncEnemySnapshots(serverEnemies);
  });

  socket.on("enemiesState", (serverEnemies) => {
    syncEnemySnapshots(serverEnemies);
  });

  socket.on("enemyKilled", (payload) => {
    enemyKilledHandler?.(payload);
  });

  function sendPlayerState(player, mode) {
    if (!socket.connected) return;

    socket.emit("playerMove", {
      x: player.x,
      y: player.y,
      angle: player.angle ?? 0,
      mode,
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

    if (!sharedEnemiesStore) return;

    for (const enemy of sharedEnemiesStore) {
      const dx = (enemy.targetX ?? enemy.x) - enemy.x;
      const dy = (enemy.targetY ?? enemy.y) - enemy.y;
      const drift = Math.hypot(dx, dy);

      if (drift > 140) {
        enemy.x = enemy.targetX ?? enemy.x;
        enemy.y = enemy.targetY ?? enemy.y;
        continue;
      }

      enemy.x += dx * 0.26;
      enemy.y += dy * 0.26;
    }
  }

  return {
    socket,
    remotePlayers,
    attachSharedEnemiesStore(store) {
      sharedEnemiesStore = store;
    },
    setEnemyKilledHandler(handler) {
      enemyKilledHandler = handler;
    },
    isSharedWorldActive() {
      return socket.connected;
    },
    sendPlayerState,
    sendEnemyHit(payload) {
      if (!socket.connected) return;
      socket.emit("enemyHit", payload);
    },
    requestQuestAdmiral(payload) {
      if (!socket.connected) return;
      socket.emit("requestQuestAdmiral", payload);
    },
    updateRemotePlayers,
  };
}
