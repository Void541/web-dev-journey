export function createTalentSystem() {
  function allocateTalentPoint(state, talent) {
    if (!state.progression) {
      state.progression = {
        level: 1,
        xp: 0,
        xpToNext: 100,
        talentPoints: 0,
        talents: {
          dmg: 0,
          hp: 0,
          speed: 0,
        },
      };
    }

    if (!state.progression.talents) {
      state.progression.talents = {
        dmg: 0,
        hp: 0,
        speed: 0,
      };
    }

    if ((state.progression.talentPoints ?? 0) <= 0) {
      return false;
    }

    const validTalents = ["dmg", "hp", "speed"];
    if (!validTalents.includes(talent)) {
      return false;
    }

    state.progression.talents[talent] += 1;
    state.progression.talentPoints -= 1;

    return true;
  }

  return {
    allocateTalentPoint,
  };
}
