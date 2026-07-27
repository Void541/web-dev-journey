export type CannonId = "light" | "heavy" | "rapid";

export interface Cannon {
  id: CannonId;
  name: string;
  damage: number;
  fireRate: number;
  range: number;
  cost?: number;
}

export type CannonTypes = Record<CannonId, Cannon>;

export const CANNON_TYPES: CannonTypes = {
  light: {
    id: "light",
    name: "Pulse",
    damage: 10,
    fireRate: 1.2,
    range: 420,
  },
  heavy: {
    id: "heavy",
    name: "Heavy",
    damage: 24,
    fireRate: 0.8,
    range: 520,
    cost: 300,
  },
  rapid: {
    id: "rapid",
    name: "Burst",
    damage: 6,
    fireRate: 2.4,
    range: 360,
    cost: 180,
  },
};

export function getCannonName(id: CannonId): string {
  return CANNON_TYPES[id].name;
}

