export function getXpToNext(level) {
  return 100 + (level - 1) * 50;
}

export function createLevelSystem() {

  function addXP(state, amount) {
    if (!state.progression) {
      state.progression = {
        level: 1,
        xp: 0,
        xpToNext: 100,
        talentPoints: 0, // Initialize talent points
      };
    }

    const progression = state.progression;
    progression.xp += amount;

    let level = progression.level;
    let xp = progression.xp;
    let xpToNext = getXpToNext(level);
    let talentPoints = progression.talentPoints;

while (xp >= xpToNext) {
  // Level up the player.
  xp -= xpToNext;
  level++;
  talentPoints++; // Increase the player's talent points on level up
  xpToNext = getXpToNext(level); // Update the experience required for the next level
  }

    progression.level = level;
    progression.xp = xp;
    progression.xpToNext = xpToNext;
    progression.talentPoints = talentPoints;
}

 return {
    addXP,
  };
}
