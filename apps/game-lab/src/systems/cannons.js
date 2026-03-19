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

export function getEquippedCannon(state) {
  const id = state.playerLoadout?.cannon ?? "light";
  return CANNON_TYPES[id];
}