export function createShipStats() {
    return {
        cannonLevel: 1,
        hullLevel: 1,
        sailLevel: 1,

        getDamage(){
            return 1+ (this.cannonLevel -1) * 0.6;
        },
        getMaxHp(){
            return 10 + (this.hullLevel -1) * 3;
        },
        getSpeed(baseSpeed){
            return baseSpeed * (1 + (this.sailLevel -1) * 0.08);
        }
    };
}