export type WeaponClickAction = "need-resources" | "unlock" | "equip";

export function getWeaponClickAction(
  isUnlocked: boolean,
  canPay: boolean
): WeaponClickAction {
  if (!isUnlocked && !canPay) return "need-resources";
  if (!isUnlocked && canPay) return "unlock";
  return "equip";
}

