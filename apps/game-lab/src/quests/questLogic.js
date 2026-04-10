function getScrapKey(state) {
  if ("scrap" in (state.inventory ?? {})) return "scrap";
  return "metal";
}

function addItem(state, key, amount) {
  state.inventory = state.inventory ?? {};
  state.inventory[key] = (state.inventory[key] ?? 0) + amount;
}

export function getQuestProgress(state, quest) {
  if (!quest) return 0;

  if (quest.type === "kills") {
    return state.progress?.kills ?? 0;
  }

  if (quest.type === "resource") {
    return state.inventory?.[quest.resource] ?? 0;
  }

  if (quest.type === "admiral") {
    return state.progress?.admiralKills ?? 0;
  }

  return 0;
}

export function isQuestComplete(state, quest) {
  return getQuestProgress(state, quest) >= (quest.target ?? 0);
}

export function giveQuestReward(state, quest) {
  if (!quest?.reward) return;

  const scrapKey = getScrapKey(state);

  for (const [key, amount] of Object.entries(quest.reward)) {
    if (key === "credits") {
      state.credits = (state.credits ?? 0) + amount;
    } else if (key === "scrap") {
      addItem(state, scrapKey, amount);
    } else {
      addItem(state, key, amount);
    }
  }
}
