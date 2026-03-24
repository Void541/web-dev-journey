export const CrewSystem = {

    captain: {
        id: "captain",
        name: "Captain",
        description: "The captain is the leader of the crew and is responsible for making important decisions. They are skilled in navigation and strategy.",
        speed: 1.0,
    },

    firstMate: {
        id: "firstMate",
        name: "First Mate",
        description: "The first mate assists the captain and is responsible for managing the ship's operations and crew.",
        repairMul: 1.5,
    },

    navigator: {
        id: "navigator",
        name: "Navigator",
        description: "The navigator is responsible for charting the ship's course and ensuring it stays on track.",
        speed: 1.5,
    },

    gunner: {
        id: "gunner",
        name: "Gunner",
        description: "The gunner is responsible for operating the ship's cannons and defending against enemy attacks.",
        dmgMul: 1.5,
        reloadCooldownMul: 0.8,
    },

};

export function getEquippedCrew(state) {
    const crew = state.crew ?? {};
    return {
        captain: CrewSystem.captain ? CrewSystem.captain : null,
        firstMate: crew.firstMate ? CrewSystem.firstMate : null,
        navigator: crew.navigator ? CrewSystem.navigator : null,
        gunner: crew.gunner ? CrewSystem.gunner : null,
    };
}