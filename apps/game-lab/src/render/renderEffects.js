export function renderTrail(ctx, trail) {
  ctx.save();
  ctx.fillStyle = "#fff";

  for (const point of trail) {
    const alpha = Math.max(0, point.t / 0.6);
    ctx.globalAlpha = 0.35 * alpha;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6 * alpha, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function renderProjectiles(ctx, projectiles, sprites) {
  ctx.save();

  for (const projectile of projectiles) {
    const angle = Math.atan2(projectile.vy, projectile.vx);
    const drewProjectile = sprites?.draw(
      ctx,
      "cannonball",
      projectile.x,
      projectile.y,
      projectile.r * 5,
      projectile.r * 5,
      angle
    );

    if (!drewProjectile) {
      ctx.fillStyle = projectile.fromEnemy ? "rgba(255,120,120,0.95)" : "rgb(13,155,48)";
      ctx.beginPath();
      ctx.save();
      ctx.translate(projectile.x, projectile.y);
      ctx.rotate(angle);
      ctx.moveTo(-projectile.r, -projectile.r * 0.5);
      ctx.lineTo(projectile.r, 0);
      ctx.lineTo(-projectile.r, projectile.r * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore();
}

export function renderMuzzleEffects(ctx, effects) {
  ctx.save();
  ctx.fillStyle = "#fff";

  for (const effect of effects) {
    const life = Math.max(0, effect.t / 0.12);
    ctx.globalAlpha = 0.55 * life;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.9 * life;
    ctx.beginPath();
    ctx.moveTo(effect.x - 2, effect.y);
    ctx.lineTo(effect.x + 18, effect.y - 8);
    ctx.lineTo(effect.x + 18, effect.y + 8);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

export function renderRepairEffects(ctx, player, repair) {
  if (repair.active) {
    ctx.save();

    const pulse = 0.6 + Math.sin(repair.fxT * 4) * 0.4;

    ctx.globalAlpha = 0.25 * pulse;
    ctx.fillStyle = "rgba(120,255,120,1)";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r + 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.6;
    ctx.fillStyle = "rgba(180,255,180,1)";

    for (let i = 0; i < 6; i++) {
      const angle = repair.fxT * 2 + i;
      const distance = 18 + Math.sin(repair.fxT * 3 + i) * 6;
      const particleX = player.x + Math.cos(angle) * distance;
      const particleY = player.y + Math.sin(angle) * distance;

      ctx.beginPath();
      ctx.arc(particleX, particleY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  if (repair.breakFlash > 0) {
    ctx.save();
    ctx.globalAlpha = repair.breakFlash * 0.8;
    ctx.fillStyle = "rgba(255,80,80,1)";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r + 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function renderLootNotifications(ctx, canvas, lootNotices) {
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = "600 14px system-ui, -apple-system, Segoe UI, Roboto, Arial";

  for (let i = 0; i < lootNotices.length; i++) {
    const notice = lootNotices[i];
    const alpha = Math.min(1, notice.t / 0.4);
    const x = canvas.clientWidth / 2 - ctx.measureText(notice.text).width / 2;
    const y = 110 + i * 24 - notice.yOff;

    ctx.globalAlpha = alpha * 0.8;
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillText(notice.text, x + 1, y + 1);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#fff";
    ctx.fillText(notice.text, x, y);
  }

  ctx.restore();
}

export function renderPauseOverlay(ctx, width, height) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#fff";
  ctx.font = "700 28px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PAUSED", width / 2, height / 2 - 12);

  ctx.globalAlpha = 0.85;
  ctx.font = "500 14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("Press P to resume", width / 2, height / 2 + 18);
  ctx.restore();
}
