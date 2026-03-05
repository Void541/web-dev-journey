// src/enemyTypes.js
export const enemyTypes = {
  basic: {
    name: "Basic",
    hp: 5,
    r: 16,
    speedMul: 1.0,
    color: "rgb(170,45,40)",
    fireEnabled: true,
    fireCooldown: 1.2,
    preferredRange: 200,
    gold: 4,
  },

  tank: {
    name: "Tank",
    hp: 16,
    r: 22,
    speedMul: 0.65,
    color: "rgb(120,40,40)",
    fireEnabled: true,
    fireCooldown: 2.0,
    preferredRange: 150,
    gold: 9,
  },

  sniper: {
    name: "Sniper",
    hp: 6,
    r: 16,
    speedMul: 0.9,
    color: "rgb(200,200,255)",
    fireEnabled: true,
    fireCooldown: 2.4,
    preferredRange: 420,
    rangeMul: 1.35, // optional fürs AI spacing/shot range
    gold: 7,
  },

  disabler: {
    name: "Disabler",
    hp: 8,
    r: 17,
    speedMul: 0.95,
    color: "rgb(140,220,160)",
    fireEnabled: true,
    fireCooldown: 1.7,
    preferredRange: 260,
    appliesSlow: true,
    slowAmount: 0.45,
    slowDuration: 1.6,
    gold: 8,
  },
};