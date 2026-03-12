// src/modes/overworld.js
export function createOverworld() {
  function enter(state) {
    state.overworldSpawnTimer = 0;
    state.enemies.length = 0;

    state.player.x = state.world.w * 0.5;
    state.player.y = state.world.h * 0.5;

    // optional: andere island layout für overworld
    if (state.islands?.generateDefault) state.islands.generateDefault(state.world);
  }

  function update(dt, state) {
    const cfg = state.cfg;

    state.overworldSpawnTimer = (state.overworldSpawnTimer ?? 0) - dt;

    const target = cfg.OVERWORLD_TARGET_ENEMIES ?? 8;

    const need = state.enemies.length < target;

    if (state.overworldSpawnTimer <= 0 && need) {
      state.spawnEnemy(); // <- kommt aus main.js/state
      state.overworldSpawnTimer = state.cfg.OVERWORLD_SPAWN_EVERY;
    }

    // Übergang zur Pirate Cove über den nördlichen Rand
    if (state.player.y <= state.player.r + 4) {
      state.setMode?.("pirateCove");
     return
    }
  }

  return { enter, update };
}