export function createCraftingSystem(recipes) {
    function craft (state, id){
        const recipe = recipes.list.find(r => r.id === id);
        if (!recipe) return false;

        if (!recipes.canCraft(state, id)){
            state.pushLootNotice?.("Not enough resources");
            return false;
        }

        recipes.consumeCost(state, recipe);

        recipe.effect(state);

        state.pushLootNotice?.(`Crafted ${recipe.name ?? recipe.id}`);

        return true;
    }

    return {
        craft,
    };
}