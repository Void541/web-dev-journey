// src/hud.js
export function drawHud(ctx, canvas, player, target, combat, drawHpBar, renderReloadUI) {
  const barW = 220;

  // Wir zeichnen in CSS-Pixeln (weil ctx.setTransform(dpr,...) -> Koords sind CSS)
  const CW = canvas.clientWidth;

  const HUD_PAD = 18;

  drawHpBar(HUD_PAD, HUD_PAD, barW, 12, player.hp, player.maxHp, "HP", "left");

  if (target) {
    drawHpBar(CW -18, HUD_PAD, barW, 12, target.hp, target.maxHp, "Target", "right");
  }

  renderReloadUI();
}