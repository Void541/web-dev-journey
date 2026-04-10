export const SHIP_TYPES = {
  sloop: {
    id: "sloop",
    name: "Scout",
    maxHp: 120,
    speedMul: 1.15,
    cannonSlots: 1,
    cost: null,
  },

  brig: {
    id: "brig",
    name: "Striker",
    maxHp: 180,
    speedMul: 1.0,
    cannonSlots: 2,
    cost: {
      credits: 250,
      scrap: 20,
      tech: 3,
    },
  },

  frigate: {
    id: "frigate",
    name: "Frigate",
    maxHp: 260,
    speedMul: 0.88,
    cannonSlots: 3,
    cost: {
      credits: 700,
      scrap: 60,
      tech: 10,
      gear: 1,
    },
  },
};

export function getEquippedShip(state) {
  const id = state.playerShip?.id ?? "sloop";
  return SHIP_TYPES[id] ?? SHIP_TYPES.sloop;
}
