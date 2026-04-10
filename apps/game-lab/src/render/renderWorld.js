import { drawMinimap } from "../minimap.js";
import { renderWorkshopUI } from "../ui/workshop.js";
import { renderPilotSkillsUI } from "../ui/pilotSkills.js";
import {
  renderEnemies,
  renderPlayer,
  renderRemotePlayers,
} from "./renderEntities.js";
import {
  renderLootNotifications,
  renderMuzzleEffects,
  renderPauseOverlay,
  renderProjectiles,
  renderRepairEffects,
  renderTrail,
} from "./renderEffects.js";
import { renderEnemyRanges, renderIslandColliders } from "./renderDebug.js";

function renderStatusPanels(ctx, state) {
  if (state.admirals && state.mode !== "pirateCove") {
    const remaining = Math.max(0, state.admirals.killsNeeded - state.admirals.killCount);
    const admiralText =
      state.admirals.active > 0
        ? "Admiral active"
        : `Next Admiral in: ${remaining} Raider kills`;

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(16, 92, 220, 34);

    ctx.fillStyle = state.admirals.active > 0 ? "rgb(255,215,90)" : "#fff";
    ctx.font = "600 14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(admiralText, 28, 109);
    ctx.restore();
  }

  const equippedShip = state.getEquippedShip?.(state);
  if (!equippedShip) return;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(16, 130, 220, 34);

  ctx.fillStyle = "#fff";
  ctx.font = "600 14px system-ui";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(
    `Ship: ${equippedShip.name} (${equippedShip.cannonSlots} slots)`,
    28,
    147
  );
  ctx.restore();
}

export function renderGame(ctx, state, options) {
  const {
    currentMode,
    remotePlayers,
    showEnemyRanges,
    showMinimap,
    paused,
    repair,
    lootNotices,
    getTargetEnemy,
    getIslandColliders,
  } = options;

  const viewWidth = state.canvas.clientWidth;
  const viewHeight = state.canvas.clientHeight;

  ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
  ctx.clearRect(0, 0, viewWidth, viewHeight);

  state.space.render(ctx, state.canvas);

  ctx.save();
  ctx.translate(-state.camera.x, -state.camera.y);

  state.islands.render(ctx);
  state.wrecks.render(ctx, state);
  currentMode.renderWorld?.(ctx, state);

  renderRemotePlayers(ctx, remotePlayers, state.player.r);
  renderTrail(ctx, state.trail);
  renderProjectiles(ctx, state.projectiles, state.sprites);
  if (state.mode !== "pirateCove") {
    renderEnemies(ctx, state.enemies, state);
  }

  if (showEnemyRanges) {
    renderEnemyRanges(ctx, state.enemies, state.enemyTypes);
  }

  renderPlayer(ctx, state);
  renderMuzzleEffects(ctx, state.effects);
  renderRepairEffects(ctx, state.player, repair);
  state.damage.render(ctx);
  renderIslandColliders(ctx, getIslandColliders());

  ctx.restore();

  currentMode.renderUI?.(ctx, state);

  const target = getTargetEnemy(state);
  state.hudOverlay.update(state, target);
  state.wrecks.renderHud(ctx, state.canvas, state);

  if (showMinimap) {
    drawMinimap(ctx, state, {
      width: 240,
      height: 135,
      pad: 16,
    });
  }

  renderStatusPanels(ctx, state);
  renderLootNotifications(ctx, state.canvas, lootNotices);
  renderWorkshopUI(ctx, state);
  renderPilotSkillsUI(ctx, state);

  if (paused) {
    renderPauseOverlay(ctx, viewWidth, viewHeight);
  }
}
