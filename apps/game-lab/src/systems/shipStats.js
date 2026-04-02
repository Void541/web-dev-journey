export function createShipStats() {

  let cannonLevel = 1;
  let hullLevel = 1;
  let sailLevel = 1;

  return {

    get cannonLevel() { return cannonLevel; },
    get hullLevel() { return hullLevel; },
    get sailLevel() { return sailLevel; },

    upgradeCannon() {
      cannonLevel++;
    },

    upgradeHull() {
      hullLevel++;
    },

    upgradeSail() {
      sailLevel++;
    },

    getDamage() {
      return 1 + (cannonLevel - 1) * 0.6;
    },

    getMaxHp() {
      return 10 + (hullLevel - 1) * 4;
    },

    getSpeed(baseSpeed = 260) {
      return baseSpeed + (sailLevel - 1) * 25;
    },

    getFireRate(shipId = "sloop") {
    const ship = shipId;

    if (ship === "frigate") return 1.2;
    if (ship === "brig") return 1.0;

    return 0.8;
  }
  };
  
}
