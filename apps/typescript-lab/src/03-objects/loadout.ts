import type { CannonId } from "../01-types/cannons";

export type CannonSlot = CannonId | null;
export type CannonLoadout = CannonSlot[];

export const starterLoadout: CannonLoadout = ["light", null, null];

export function equipCannon(
  loadout: CannonLoadout,
  slot: number,
  cannonId: CannonId
): CannonLoadout {
  const nextLoadout = [...loadout];
  nextLoadout[slot] = cannonId;
  return nextLoadout;
}

