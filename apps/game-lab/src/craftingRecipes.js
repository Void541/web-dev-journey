export const craftingRecipes = {
  cannonUpgrade: {
    name: "Cannon Upgrade",
    cost: { wood: 4, scrap: 2 },
    apply(state) {
      state.shipStats.cannonLevel += 1;
    }
  },

  hullUpgrade: {
    name: "Hull Reinforcement",
    cost: { scrap: 5, cloth: 2 },
    apply(state) {
      state.shipStats.hullLevel += 1;

      const hp = state.shipStats.getMaxHp();
      state.player.maxHp = hp;
      state.player.hp = hp;
    }
  },

  sailUpgrade: {
    name: "Sail Upgrade",
    cost: { cloth: 3, tech: 1 },
    apply(state) {
      state.shipStats.sailLevel += 1;
    }
  }
};