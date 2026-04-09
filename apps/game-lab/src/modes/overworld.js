// src/modes/overworld.js
export function createOverworld() {
  function enter(state, options = {}) {
    const playerPos = options.playerPos;

    if (playerPos) {
      state.player.x = playerPos.x;
      state.player.y = playerPos.y;
    } else {
      state.player.x = state.world.w * 0.5;
      state.player.y = state.world.h * 0.5;
    }

    state.overworldSpawnTimer = 0;
    state.enemies.length = 0;

    state.locationName = "Outer Lane";
    state.locationSubtitle = "Contested traffic corridor";

    if (!state.worldFlags?.outerLaneIntroSeen) {
      state.worldFlags = state.worldFlags ?? {};
      state.worldFlags.outerLaneIntroSeen = true;

      // The first visit should tell the player why this sector matters.
      state.pushLootNotice?.("Outer Lane: raider scouts have been disrupting civilian traffic.");
      state.pushLootNotice?.("Clear patrols, salvage what you can, and fall back to the Mercenary Hangar when needed.");
    }

    // Optional: use a different island layout for the overworld.
    if (state.islands?.generateDefault) {
      state.islands.generateDefault(state.world);
    }
  }

  function update(dt, state) {
    const cfg = state.cfg;

    state.overworldSpawnTimer = (state.overworldSpawnTimer ?? 0) - dt;

    const target = cfg.OVERWORLD_TARGET_ENEMIES ?? 8;
    const need = state.enemies.length < target;

    if (state.overworldSpawnTimer <= 0 && need) {
      state.spawnEnemy();
      state.overworldSpawnTimer = state.cfg.OVERWORLD_SPAWN_EVERY;
    }

    // Transition to Pirate Cove through the northern edge.
    if (state.player.y <= state.player.r + 4) {
      state.transitions = state.transitions ?? {};
      state.transitions.overworldReturn = {
        x: state.player.x,
        y: state.player.r + 20,
      };

      state.setMode?.("pirateCove");
      return;
    }
  }

  function renderWorld(ctx, state) {
    const laneY = 220;
    const laneStartX = state.world.w * 0.28;
    const laneEndX = state.world.w * 0.72;

    ctx.save();

    // The trade lane is a light landmark to help the first combat sector feel
    // intentional instead of like empty space with random enemies.
    ctx.strokeStyle = "rgba(90, 170, 220, 0.22)";
    ctx.lineWidth = 3;
    ctx.setLineDash([18, 14]);
    ctx.beginPath();
    ctx.moveTo(laneStartX, laneY);
    ctx.lineTo(laneEndX, laneY);
    ctx.stroke();
    ctx.setLineDash([]);

    drawRelayBeacon(ctx, laneStartX, laneY, "West Relay");
    drawRelayBeacon(ctx, laneEndX, laneY, "East Relay");

    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.font = "600 16px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("Outer Lane traffic corridor", state.world.w * 0.5, laneY - 24);

    ctx.restore();
  }

  function renderUI(ctx, state) {
    ctx.save();

    const bannerW = 250;
    const bannerH = 56;
    const bannerX = state.canvas.clientWidth * 0.5 - bannerW * 0.5;
    const bannerY = 18;

    ctx.fillStyle = "rgba(0,0,0,0.62)";
    ctx.fillRect(bannerX, bannerY, bannerW, bannerH);

    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);

    ctx.fillStyle = "#fff";
    ctx.font = "700 18px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(state.locationName ?? "Outer Lane", bannerX + bannerW * 0.5, bannerY + 12);

    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.font = "14px system-ui";
    ctx.fillText(
      state.locationSubtitle ?? "Contested traffic corridor",
      bannerX + bannerW * 0.5,
      bannerY + 34
    );

    ctx.restore();
  }

  return { enter, update, renderWorld, renderUI };
}

function drawRelayBeacon(ctx, x, y, label) {
  ctx.save();

  ctx.strokeStyle = "rgba(120, 210, 255, 0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 22, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(120, 210, 255, 0.22)";
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#dff7ff";
  ctx.font = "600 12px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(label, x, y + 28);

  ctx.restore();
}
