export const SHIP_TYPES = {
  sloop: {
    id: "sloop",
    name: "Sloop",
    maxHp: 10,
    speedMul: 1.15,
    cannonSlots: 1,
  },

  brig: {
    id: "brig",
    name: "Brig",
    maxHp: 14,
    speedMul: 1.0,
    cannonSlots: 2,
  },

  frigate: {
    id: "frigate",
    name: "Frigate",
    maxHp: 18,
    speedMul: 0.88,
    cannonSlots: 3,
  },
};

export function getEquippedShip(state) {
  const id = state.playerShip?.id ?? "sloop";
  return SHIP_TYPES[id] ?? SHIP_TYPES.sloop;
}