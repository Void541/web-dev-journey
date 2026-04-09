export const CANNON_TYPES = {
  light: {
    id: "light",
    name: "Pulse Laser",
    damage: 10,
    fireRate: 1.0,
    range: 480,
    projectileSpeed: 720,
    cost: null,
  },

  heavy: {
    id: "heavy",
    name: "Heavy Laser",
    damage: 24,
    fireRate: 0.45,
    range: 560,
    projectileSpeed: 680,
    cost: {
      gold: 120,
      scrap: 12,
      tech: 3,
    },
  },

  rapid: {
    id: "rapid",
    name: "Burst Laser",
    damage: 6,
    fireRate: 2.4,
    range: 420,
    projectileSpeed: 760,
    cost: {
      gold: 120,
      scrap: 10,
      tech: 2,
    },
  },
};

export function getCannonStats(id) {
  return CANNON_TYPES[id] ?? CANNON_TYPES.light;
}

export function getEquippedCannon(state) {
  const id = state.playerLoadout?.cannons?.[0] ?? "light";
  return CANNON_TYPES[id] ?? CANNON_TYPES.light;
}

export function getEquippedCannons(state) {
  return state.playerLoadout?.cannons ?? ["light", null, null];
}
