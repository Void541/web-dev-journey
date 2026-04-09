// src/modes/pirateCove.js
import { QUESTS } from "../quests/quests.js";
import {
  getQuestProgress,
  isQuestComplete,
  giveQuestReward,
} from "../quests/questLogic.js";

import {
  updateMerchant,
  renderMerchantWorld,
  renderMerchantUI,
} from "../npcs/merchant.js";

import {
  updateDockmaster,
  renderDockmasterWorld,
  renderDockmasterUI,
} from "../npcs/dockmaster.js";

import {
  initNavigatorUi,
  updateNavigator,
  renderNavigatorWorld,
  renderNavigatorUI,
} from "../npcs/navigator.js";

export function createPirateCove() {

  function enter(state, options = {}) {
    state.enemies.length = 0;
    state.projectiles.length = 0;
    state.moveTarget = null;

    state.combat.targetId = null;
    state.combat.cooldown = 0;

    const playerPos = options.playerPos;

    if (playerPos) {
      state.player.x = Math.max(
        state.player.r + 20,
        Math.min(playerPos.x, state.world.w - state.player.r - 20)
      );
    } else {
      state.player.x = state.world.w * 0.5;
    }

    state.player.y = state.world.h - 90;

    state.ui = state.ui ?? {};

    state.ui.navigatorWindow = state.ui.navigatorWindow ?? {
      x: null,
      y: null,
      dragging: false,
      dragOffX: 0,
      dragOffY: 0,
    };

    state.ui.dockmasterOpen = false;
    state.ui.dockmasterHint = false;
    state.ui.dockButtons = [];

    state.ui.merchantOpen = false;
    state.ui.merchantHint = false;

    state.ui.navigatorOpen = false;
    state.ui.navigatorHint = false;
    state.ui.navigatorButtons = [];

    // Keep the internal mode name stable while giving the hub a stronger
    // world-facing identity everywhere the player can actually see it.
    state.locationName = "Mercenary Hangar";
    state.locationSubtitle = "Safe operations hub";

    if (!state.worldFlags?.mercenaryHangarIntroSeen) {
      state.worldFlags = state.worldFlags ?? {};
      state.worldFlags.mercenaryHangarIntroSeen = true;

      // A short first-visit briefing helps the hub feel like a real base
      // instead of just a technical safe room.
      state.pushLootNotice?.("Mercenary Hangar: safe hub for contracts, repairs, and salvage.");
      state.pushLootNotice?.("Contract Officer for missions. Ship Technician for upgrades. Salvage Broker for trade.");
    }

    state.islands.islands = [
      { x: 400, y: 200, r: 120 },
      { x: 1000, y: 200, r: 140 },
      { x: 700, y: 120, r: 80 },
    ];
  }

  function update(dt, state) {
    state.ui = state.ui ?? {};

    // Dockmaster logic (externalized)
    updateDockmaster(state);

    // Merchant logic (externalized)
    updateMerchant(state);

    // Navigator logic (externalized)
    updateNavigator(state);


    // Return to overworld
    if (state.player.y >= state.world.h - state.player.r - 4) {
      const returnPos = state.transitions?.overworldReturn;

      state.setMode?.("overworld", {
        playerPos: returnPos ?? {
          x: state.world.w * 0.5,
          y: 40,
        },
      });

      return;
    }
  }

  function renderWorld(ctx, state) {
    ctx.save();

    // Dock
    ctx.fillStyle = "rgb(110,70,40)";
    ctx.fillRect(620, 300, 160, 20);
    ctx.fillRect(660, 300, 20, 80);
    ctx.fillRect(720, 300, 20, 80);

    renderMerchantWorld(ctx, state);
    renderDockmasterWorld(ctx, state);
    renderNavigatorWorld(ctx, state);

    ctx.restore();
  }

  function renderUI(ctx, state) {
    ctx.save();

    const bannerW = 260;
    const bannerH = 62;
    const bannerX = state.canvas.clientWidth * 0.5 - bannerW * 0.5;
    const bannerY = 18;

    ctx.fillStyle = "rgba(0,0,0,0.68)";
    ctx.fillRect(bannerX, bannerY, bannerW, bannerH);

    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);

    ctx.fillStyle = "#fff";
    ctx.font = "700 18px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(
      state.locationName ?? "Mercenary Hangar",
      bannerX + bannerW * 0.5,
      bannerY + 14
    );

    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.font = "14px system-ui";
    ctx.fillText(
      state.locationSubtitle ?? "Safe operations hub",
      bannerX + bannerW * 0.5,
      bannerY + 38
    );

    ctx.restore();

    renderDockmasterUI(ctx, state);

    renderMerchantUI(ctx, state);

    renderNavigatorUI(ctx, state);
  }

  return { enter, update, renderWorld, renderUI };
}
