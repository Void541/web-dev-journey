export function pickEnemyType(enemyTypes) {
  const entries = Object.entries(enemyTypes).filter(
    ([, cfg]) => (cfg.spawnWeight ?? 0) > 0
  );

  if (entries.length === 0) {
    return "basic";
  }

  let totalWeight = 0;

  for (const [, cfg] of entries) {
    totalWeight += cfg.spawnWeight ?? 0;
  }

  let roll = Math.random() * totalWeight;

  for (const [type, cfg] of entries) {
    roll -= cfg.spawnWeight ?? 0;

    if (roll <= 0) {
      return type;
    }
  }

  return entries[entries.length - 1][0];
}