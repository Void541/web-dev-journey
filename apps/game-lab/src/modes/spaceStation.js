import { openMerchant, updateMerchant, renderMerchantUI } from "../npcs/merchant.js";
import { openDockmaster } from "../npcs/dockmaster.js";
import { openNavigator, updateNavigator, renderNavigatorUI } from "../npcs/navigator.js";

const services = {
  contracts: { x: 0.29, y: 0.31, uniform: "#89d9e1" },
  trade: { x: 0.27, y: 0.63, uniform: "#b0cf91" },
  workshop: { x: 0.73, y: 0.34, uniform: "#e4a25d" },
  shipyard: { x: 0.74, y: 0.65, uniform: "#dcc78d" },
};

const patrols = [
  { from: [0.32, 0.42], to: [0.32, 0.73], offset: 0, uniform: "#819fa9" },
  { from: [0.68, 0.43], to: [0.68, 0.74], offset: 2, uniform: "#aeb8c3" },
  { from: [0.35, 0.79], to: [0.65, 0.79], offset: 4, uniform: "#ba9364" },
];

function drawCrew(ctx, x, y, uniform, scale, step = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#171c20";
  ctx.beginPath();
  ctx.ellipse(2, 6, 12, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-7, 3 + step, 6, 9);
  ctx.fillRect(1, 3 - step, 6, 9);
  ctx.fillStyle = uniform;
  ctx.fillRect(-10, -5, 20, 12);
  ctx.fillStyle = "#20262a";
  ctx.fillRect(-6, -11, 12, 11);
  ctx.fillStyle = "#eff7f6";
  ctx.fillRect(-4, -9, 8, 3);
  ctx.restore();
}

function closeServices(ui) {
  ui.workshopOpen = false;
  ui.skillsOpen = false;
  ui.merchantOpen = false;
  ui.navigatorOpen = false;
  ui.dockmasterOpen = false;

  // Canvas hit areas belong to the previous panel until the next render.
  for (const key of ["merchantButtons", "navigatorButtons", "workshopTabButtons",
    "cannonSlotButtons", "cannonButtons", "shipButtons", "workshopButtons", "crewButtons"]) {
    ui[key] = [];
  }
}

export function createSpaceStation() {
  let crewTime = 0;

  function enter(state) {
    crewTime = 0;
    state.enemies.length = 0;
    state.projectiles.length = 0;
    state.moveTarget = null;
    state.combat.targetId = null;
    state.combat.cooldown = 0;

    state.player.x = state.world.w * 0.5;
    state.player.y = state.world.h * 0.53;
    state.player.angle = -Math.PI / 2;

    state.ui ??= {};
    closeServices(state.ui);
    state.ui.dockmasterHint = false;
    state.ui.navigatorWindow = { x: null, y: null, dragging: false };
    state.islands.islands = [];

    state.locationName = "Mercenary Hangar";
    state.locationSubtitle = "Human frontier outpost";
  }

  function update(dt, state) {
    crewTime += dt;
    if (state.input.wasPressed("f")) {
      closeServices(state.ui);
      return;
    }
    updateMerchant(state);
    updateNavigator(state);
  }

  function selectService(state, action) {
    const { ui } = state;
    const isOpen =
      (action === "contracts" && ui.navigatorOpen) ||
      (action === "trade" && ui.merchantOpen) ||
      (action === "workshop" && ui.workshopOpen && ui.workshopTab !== "shipyard") ||
      (action === "shipyard" && ui.workshopOpen && ui.workshopTab === "shipyard");
    closeServices(ui);
    if (isOpen) return;

    switch (action) {
      case "contracts":
        openNavigator(state);
        break;
      case "trade":
        openMerchant(state);
        break;
      case "workshop":
      case "shipyard":
        ui.workshopTab = action === "shipyard" ? "shipyard" : "weapons";
        openDockmaster(state);
        break;
      case "launch":
        state.setMode("overworld", {
          playerPos: state.transitions?.overworldReturn ?? { x: state.world.w / 2, y: 40 },
        });
        break;
    }
  }

  function renderWorld(ctx, state) {
    const { w, h } = state.world;
    if (!state.sprites.draw(ctx, "hangar_interior", w / 2, h / 2, w, h)) {
      ctx.save();
      ctx.fillStyle = "#222b30";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    const crewScale = Math.max(1, (w * 0.6) / Math.max(1, state.canvas.clientWidth));
    for (const service of Object.values(services)) {
      drawCrew(ctx, service.x * w, service.y * h, service.uniform, crewScale);
    }

    for (const { from, to, offset, uniform } of patrols) {
      const cycle = (crewTime + offset) % 10;
      const progress = Math.min(cycle / 4, 1, (10 - cycle) / 4);
      const walking = cycle < 4 || cycle > 6;
      const x = (from[0] + (to[0] - from[0]) * progress) * w;
      const y = (from[1] + (to[1] - from[1]) * progress) * h;
      const step = walking ? Math.sin(crewTime * 14 + offset) * 3 : 0;
      drawCrew(ctx, x, y, uniform, crewScale, step);
    }
  }

  function renderUI(ctx, state) {
    renderMerchantUI(ctx, state);
    renderNavigatorUI(ctx, state);
  }

  return { enter, update, renderWorld, renderUI, selectService, services };
}
