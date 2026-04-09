export function createCraftingRecipes() {
  const list = [
    {
      id: "repair",
      name: "Repair +2 HP",
      cost: { scrap: 5, tech: 1 },
      effect: (state) => {
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + 2);
      },
    },
    {
      id: "ammo",
      name: "Ammo Pack",
      cost: { scrap: 4, tech: 1 },
      effect: (state) => {
        state.pushLootNotice?.("Ammo restocked");
      },
    },
  ];

  function canCraft(state, id) {
    const r = list.find((r) => r.id === id);
    if (!r) return false;

    for (const [res, amount] of Object.entries(r.cost)) {
      if ((state.inventory?.[res] ?? 0) < amount) {
        return false;
      }
    }

    return true;
  }

  function consumeCost(state, recipe) {
    for (const [res, amount] of Object.entries(recipe.cost)) {
      state.inventory[res] -= amount;
    }
  }

  return {
    list,
    canCraft,
    consumeCost,
  };
}
