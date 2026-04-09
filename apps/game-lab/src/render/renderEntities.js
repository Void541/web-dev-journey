import { clamp } from "../engine/math.js";

function getEnemySpriteKey(type) {
  switch (type) {
    case "tank":
      return "enemy_tank";
    case "sniper":
      return "enemy_sniper";
    case "disabler":
      return "enemy_disabler";
    case "raider":
    case "basic":
    default:
      return "enemy_raider";
  }
}

export function renderFallbackShip(
  ctx,
  x,
  y,
  r,
  angle,
  isTarget,
  isEnemy,
  type = "basic",
  color = "rgb(170,45,40)"
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  let hullFront = r + 12;
  let hullBack1 = -r - 8;
  let hullBack2 = -r - 14;
  let hullHeight = r;

  let wingSpan = r * 2;
  let wingBack = r * 2 * 0.6;

  let engineRadius = r * 0.25;
  let engineCount = 2;

  if (type === "tank") {
    hullFront = r + 8;
    hullBack1 = -r - 12;
    hullBack2 = -r - 18;
    hullHeight = r * 1.25;

    wingSpan = r * 2;
    wingBack = r * 2 * 0.8;

    engineCount = 3;
    engineRadius = r * 0.35;
  }

  if (type === "sniper") {
    hullFront = r + 16;
    hullBack1 = -r - 6;
    hullBack2 = -r - 10;
    hullHeight = r * 0.85;

    wingSpan = r * 2 * 0.75;
    wingBack = r * 2 * 0.45;

    engineCount = 1;
    engineRadius = r * 0.22;
  }

  if (type === "disabler") {
    hullFront = r + 12;
    hullBack1 = -r - 9;
    hullBack2 = -r - 15;
    hullHeight = r * 1.05;

    wingSpan = r * 2 * 0.8;
    wingBack = r * 0.3;

    engineCount = 2;
    engineRadius = r * 0.28;
  }

  const engineOffset = hullBack2 - r * 0.2;

  if (type === "disabler") {
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "rgba(160,60,200,1)";
    ctx.beginPath();
    ctx.arc(0, 0, r + 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  for (let i = 0; i < engineCount; i++) {
    const offset = (i - (engineCount - 1) / 2) * engineRadius * 2.2;

    ctx.globalAlpha = 0.45;
    ctx.fillStyle = "rgba(0,255,100,1)";
    ctx.beginPath();
    ctx.arc(engineOffset, offset, engineRadius * 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "rgba(140,255,190,1)";
    ctx.beginPath();
    ctx.arc(engineOffset, offset, engineRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = isEnemy ? color : "rgb(55, 62, 70)";

  ctx.beginPath();
  ctx.moveTo(-r * 0.2, -wingSpan * 0.3);
  ctx.lineTo(-wingBack, -wingSpan);
  ctx.lineTo(-wingBack * 0.55, -wingSpan * 0.18);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-r * 0.2, wingSpan * 0.3);
  ctx.lineTo(-wingBack, wingSpan);
  ctx.lineTo(-wingBack * 0.55, wingSpan * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.globalAlpha = 0.95;
  ctx.fillStyle = isEnemy ? color : "rgb(70, 78, 88)";
  ctx.beginPath();
  ctx.moveTo(hullFront, 0);
  ctx.lineTo(hullBack1, -hullHeight);
  ctx.lineTo(hullBack2, 0);
  ctx.lineTo(hullBack1, hullHeight);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(r + 4, -2);
  ctx.lineTo(hullBack1 + 2, -hullHeight + 4);
  ctx.lineTo(hullBack2 + 2, 0);
  ctx.closePath();
  ctx.fill();

  if (!isEnemy) {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = "rgba(0,255,120,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(r * 0.25, 0);
    ctx.lineTo(hullBack1 * 0.35, 0);
    ctx.stroke();
    ctx.restore();
  }

  if (isTarget) {
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r + 6, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function renderRemotePlayers(ctx, remotePlayers, playerRadius) {
  for (const id in remotePlayers) {
    const remotePlayer = remotePlayers[id];
    renderFallbackShip(
      ctx,
      remotePlayer.x,
      remotePlayer.y,
      playerRadius,
      remotePlayer.angle ?? 0,
      false,
      false,
      "basic",
      "rgb(100,100,255)"
    );
  }
}

export function renderEnemy(ctx, enemy, state) {
  ctx.save();

  const isTarget = state.combat?.targetId === enemy.id;
  const angle = Math.atan2(enemy.vy, enemy.vx);
  const spriteKey = getEnemySpriteKey(enemy.type);

  const drewSprite = state.sprites?.draw(
    ctx,
    spriteKey,
    enemy.x,
    enemy.y,
    enemy.r * 3.2,
    enemy.r * 3.2,
    angle
  );

  if (!drewSprite) {
    renderFallbackShip(
      ctx,
      enemy.x,
      enemy.y,
      enemy.r,
      angle,
      isTarget,
      true,
      enemy.type,
      enemy.color || "rgb(170,45,40)"
    );
  }

  if (enemy.isAdmiral) {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "rgba(255,215,80,1)";
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.r + 22, 0, Math.PI * 2);
    ctx.fill();

    const iconY = enemy.y - enemy.r - 20;

    ctx.globalAlpha = 0.95;
    ctx.fillStyle = "rgb(255,215,90)";
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(enemy.x, iconY - 10);
    ctx.lineTo(enemy.x + 10, iconY);
    ctx.lineTo(enemy.x, iconY + 10);
    ctx.lineTo(enemy.x - 10, iconY);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(enemy.x, iconY, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.restore();
  }

  ctx.globalAlpha = enemy.hitT > 0 ? 0.65 : 0.95;

  const typeConfig = state.enemyTypes?.[enemy.type] || {};
  ctx.fillStyle = typeConfig.color || "rgb(170,45,40)";

  ctx.globalAlpha = 0.95;
  ctx.font = "600 11px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillText(enemy.name ?? enemy.type ?? "Enemy", enemy.x + 1, enemy.y + enemy.r + 6);

  ctx.fillStyle = enemy.isAdmiral ? "rgb(255,215,90)" : "#fff";
  ctx.font = enemy.isAdmiral
    ? "700 12px system-ui, -apple-system, Segoe UI, Roboto, Arial"
    : "600 11px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText(enemy.name ?? enemy.type ?? "Enemy", enemy.x, enemy.y + enemy.r + 10);

  const barWidth = 34;
  const barHeight = 5;
  const healthRatio = clamp(enemy.hp / (enemy.maxHp || 1), 0, 1);
  const barX = enemy.x - barWidth / 2;
  const barY = enemy.y + enemy.r + 15;

  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#000";
  ctx.fillRect(barX, barY, barWidth, barHeight);

  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "rgb(32,172,32)";
  ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);

  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = enemy.isAdmiral ? "rgb(255,210,60)" : "#fff";
  ctx.lineWidth = enemy.isAdmiral ? 2 : 1;
  ctx.strokeRect(barX, barY, barWidth, barHeight);

  ctx.restore();
}

export function renderEnemies(ctx, enemies, state) {
  for (const enemy of enemies) {
    renderEnemy(ctx, enemy, state);
  }
}

export function renderPlayer(ctx, state) {
  const { player } = state;
  const playerAngle = player.angle ?? 0;

  const drewPlayer = state.sprites?.draw(
    ctx,
    "player",
    player.x,
    player.y,
    player.r * 4.2,
    player.r * 4.2,
    playerAngle
  );

  if (!drewPlayer) {
    renderFallbackShip(
      ctx,
      player.x,
      player.y,
      player.r,
      playerAngle,
      false,
      false,
      "player"
    );
  }
}
