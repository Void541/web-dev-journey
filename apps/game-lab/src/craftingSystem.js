export function craft(recipe, state) {
  const inv = state.inventory;

  for (const [res, amount] of Object.entries(recipe.cost)) {
    if ((inv[res] ?? 0) < amount) {
      return false;
    }
  }

  for (const [res, amount] of Object.entries(recipe.cost)) {
    inv[res] -= amount;
  }

  recipe.apply(state);

  state.pushLootNotice?.(`${recipe.name} crafted`);

  return true;
}