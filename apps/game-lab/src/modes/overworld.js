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

    // optional: andere island layout für overworld
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

    // Übergang zur Pirate Cove über den nördlichen Rand
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

  return { enter, update };
}