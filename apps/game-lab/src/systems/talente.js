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
      console.log("No talent points available!");
      return false;
    }

    const validTalents = ["dmg", "hp", "speed"];
    if (!validTalents.includes(talent)) {
      console.log("Unknown talent:", talent);
      return false;
    }

    state.progression.talents[talent] += 1;
    state.progression.talentPoints -= 1;

    console.log(
      `Allocated 1 point to ${talent}. New value: ${state.progression.talents[talent]}`
    );

    return true;
  }

  return {
    allocateTalentPoint,
  };
}