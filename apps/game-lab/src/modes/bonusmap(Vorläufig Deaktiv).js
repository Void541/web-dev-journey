// src/bonusmap.js
export function createBonusmap() {
  function enter(state) {
    state.enemies.length = 0;

    state.player.x = 200;
    state.player.y = 200;

    // wave state sauber resetten
    state.wave = 1;
    state.waveActive = false;

    state.waveEnemiesLeft = 0;  // wie viele KILLS fehlen noch
    state.waveSpawnLeft = 0;    // wie viele Spawns fehlen noch

    state.waveTimer = state.cfg.WAVE_COOLDOWN ?? 2;
    state.waveSpawnTimer = 0;
  }

  function startWave(state) {
    state.waveActive = true;

    const base = state.cfg.WAVE_BASE ?? 3;
    const scale = state.cfg.WAVE_SCALE ?? 2;

    const total = base + state.wave * scale;

    state.waveEnemiesLeft = total;
    state.waveSpawnLeft = total;

    state.waveSpawnTimer = 0.15; // kurzer delay bis erster Spawn
  }

  function update(dt, state) {
    const cfg = state.cfg;

    const spawnEvery = cfg.WAVE_SPAWN_EVERY ?? 0.35;
    const cap = cfg.ENEMY_CAP ?? 30;
    const cooldown = cfg.WAVE_COOLDOWN ?? 2;

    if (!state.waveActive) {
      state.waveTimer = Math.max(0, (state.waveTimer ?? cooldown) - dt);
      if (state.waveTimer <= 0) startWave(state);
      return;
    }

    // Spawn Tick
    if (state.waveSpawnLeft > 0) {
      state.waveSpawnTimer -= dt;

      const canSpawn = state.enemies.length < cap;
      if (state.waveSpawnTimer <= 0 && canSpawn) {
        state.spawnEnemy();
        state.waveSpawnLeft--;
        state.waveSpawnTimer = spawnEvery;
      }
    }

    // Wave fertig: alles gespawnt + alles gekillt + keine enemies mehr da
    if (state.waveSpawnLeft <= 0 && state.waveEnemiesLeft <= 0 && state.enemies.length === 0) {
      state.waveActive = false;
      state.wave++;
      state.waveTimer = cooldown;
    }
  }

  // wird von updateProjectiles / kill-logic aufgerufen
  function onEnemyKilled(state) {
    if (state.waveActive) {
      state.waveEnemiesLeft = Math.max(0, (state.waveEnemiesLeft ?? 0) - 1);
    }
  }

  return { enter, update, onEnemyKilled };
}