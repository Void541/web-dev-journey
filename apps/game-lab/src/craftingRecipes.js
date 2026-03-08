export function createCraftingRecipes() {

  return {

    cannonUpgrade: {
      cost(state) {
        const lvl = state.shipStats.cannonLevel;
        return {
          wood: 4 * lvl,
          scrap: 2 * lvl,
        };
      },
      apply(state) {
        state.shipStats.upgradeCannon();
      }
    },

    hullUpgrade: {
      cost(state) {
        const lvl = state.shipStats.hullLevel;
        return {
          scrap: 5 * lvl,
          cloth: 2 * lvl,
        };
      },
      apply(state) {
        state.shipStats.upgradeHull();
      }
    },

    sailUpgrade: {
      cost(state) {
        const lvl = state.shipStats.sailLevel;
        return {
          cloth: 3 * lvl,
          tech: 1 * lvl,
        };
      },
      apply(state) {
        state.shipStats.upgradeSail();
      }
    }

  };
}