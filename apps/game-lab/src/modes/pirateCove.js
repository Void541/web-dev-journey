export function createPirateCove() {
  return {
    enter(state) {
      state.enemies.length = 0;
      state.projectiles.length = 0;
      state.combat.targetId = null;
      state.combat.cooldown = 0;

      state.player.x = state.world.w * 0.5;
      state.player.y = state.world.h - 90;
    },

    update(dt, state) {
      // Rückweg in die Overworld über den südlichen Rand
      if (state.player.y >= state.world.h - state.player.r - 4) {
        state.setMode?.("overworld");
      }
    },
  };
}