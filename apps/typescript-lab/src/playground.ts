import { getCannonName, CANNON_TYPES, type CannonId } from "./01-types/cannons";
import { getWeaponClickAction } from "./02-functions/weaponActions";
import { equipCannon, starterLoadout } from "./03-objects/loadout";

function getCannonDamage(cannonId: CannonId): number {
  return CANNON_TYPES[cannonId].damage;
}


const name = getCannonName("light");
const action = getWeaponClickAction(false, true);
const loadout = equipCannon(starterLoadout, 1, "heavy");
const damage = getCannonDamage("rapid");



console.log({ name, action, loadout, damage });

