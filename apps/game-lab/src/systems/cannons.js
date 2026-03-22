export const CANNON_TYPES = {
  light: {
    id: "light",
    name: "Light Cannon",
    damage: 1,
    fireRate: 1.0,
    range: 480,
    projectileSpeed: 720,
  },

  heavy: {
    id: "heavy",
    name: "Heavy Cannon",
    damage: 3,
    fireRate: 0.45,
    range: 560,
    projectileSpeed: 680,
  },

  rapid: {
    id: "rapid",
    name: "Rapid Cannon",
    damage: 1,
    fireRate: 3.0,
    range: 420,
    projectileSpeed: 760,
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