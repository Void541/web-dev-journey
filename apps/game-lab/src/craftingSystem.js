export function createCraftingSystem(recipes) {

  function canCraft(state, recipeId) {

    const recipe = recipes[recipeId];
    if (!recipe) return false;

    const cost = recipe.cost(state);
    const inv = state.inventory;

    for (const res in cost) {
      if ((inv[res] ?? 0) < cost[res]) {
        return false;
      }
    }

    return true;
  }

  function craft(state, recipeId) {

    const recipe = recipes[recipeId];
    if (!recipe) return false;

    const cost = recipe.cost(state);

    if (!canCraft(state, recipeId)) return false;

    for (const res in cost) {
      state.inventory[res] -= cost[res];
    }

    recipe.apply(state);

    return true;
  }

  return { craft, canCraft, recipes };
}