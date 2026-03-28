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
    let xpToNext = progression.xpToNext;
    let talentPoints = progression.talentPoints;

while (xp >= xpToNext) {

  // Level up the player
  console.log('Level Up!');
  xp -= xpToNext;
  level++;
  talentPoints++; // Increase the player's talent points on level up
  xpToNext += 50; // Increase the experience required for the next level
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