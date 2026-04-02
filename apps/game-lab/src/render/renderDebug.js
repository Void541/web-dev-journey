import * as CFG from "../config.js";

export function renderEnemyRanges(ctx, enemies, enemyTypes) {
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;

  for (const enemy of enemies) {
    if (!enemy) continue;
    if (!enemy.fireEnabled) continue;

    const range =
      enemyTypes?.[enemy.type]?.range ??
      (enemy.type === "sniper" ? CFG.SNIPER_ATTACK_RANGE : CFG.ENEMY_ATTACK_RANGE);

    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, range, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function renderIslandColliders(ctx, colliders) {
  ctx.save();
  ctx.fillStyle = "rgba(255,0,0,0.25)";

  for (const collider of colliders) {
    ctx.beginPath();
    ctx.arc(collider.x, collider.y, collider.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
