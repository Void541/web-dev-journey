import { CrewSystem } from "../systems/crew.js";
import { SHIP_TYPES } from "../systems/ships.js";
import { CANNON_TYPES } from "../systems/cannons.js";

function formatCost(cost) {
  if (!cost) return "Starter issue";
  return Object.entries(cost)
    .map(([key, value]) => `${value} ${key}`)
    .join(", ");
}

export function renderWorkshopUI(ctx, state) {
  if (!state.ui?.workshopOpen) return;

  const recipes = state.crafting?.recipes?.list ?? [];
  const inventory = state.inventory ?? {};
  const unlockedWeapons = state.progression?.unlocked?.weapons ?? {};
  const unlockedShips = state.progression?.unlocked?.ships ?? {};
  const unlockedCrew = state.progression?.unlocked?.crew ?? {};

  const x = state.canvas.clientWidth / 2 - 470;
  const y = state.canvas.clientHeight / 2 - 290;
  const w = 940;
  const h = 580;

  const sidebarX = x + 20;
  const sidebarY = y + 58;
  const sidebarW = 220;
  const sidebarH = 470;

  const contentX = x + 260;
  const contentY = y + 58;
  const contentW = 640;

  const rect = state.canvas.getBoundingClientRect();
  const mx = (state.input?.mouse?.x ?? -9999) - rect.left;
  const my = (state.input?.mouse?.y ?? -9999) - rect.top;

  state.ui.workshopTab = state.ui.workshopTab ?? "shipyard";
  state.ui.workshopTabButtons = [];
  state.ui.cannonSlotButtons = [];
  state.ui.cannonButtons = [];
  state.ui.shipButtons = [];
  state.ui.workshopButtons = [];
  state.ui.crewButtons = [];

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.88)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(x, y, w, 42);

  ctx.fillStyle = "#fff";
  ctx.font = "700 20px system-ui";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Mercenary Hangar Station", x + 18, y + 10);

  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(sidebarX, sidebarY, sidebarW, sidebarH);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.strokeRect(sidebarX, sidebarY, sidebarW, sidebarH);

  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(contentX, contentY, contentW, sidebarH);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.strokeRect(contentX, contentY, contentW, sidebarH);

  renderSidebar(ctx, state, {
    x: sidebarX,
    y: sidebarY,
    w: sidebarW,
    inventory,
    mx,
    my,
  });

  if (state.ui.workshopTab === "shipyard") {
    renderShipyardTab(ctx, state, { x: contentX, y: contentY, w: contentW, unlockedShips, mx, my });
  } else if (state.ui.workshopTab === "weapons") {
    renderWeaponsTab(ctx, state, { x: contentX, y: contentY, w: contentW, unlockedWeapons, mx, my });
  } else if (state.ui.workshopTab === "crew") {
    renderCrewTab(ctx, state, { x: contentX, y: contentY, w: contentW, unlockedCrew, mx, my });
  } else {
    renderCraftingTab(ctx, state, { x: contentX, y: contentY, w: contentW, recipes, mx, my });
  }

  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("Press F to close � Press K for Pilot Skills", x + w / 2, y + h - 22);
  ctx.textAlign = "left";
  ctx.restore();
}

function renderSidebar(ctx, state, { x, y, w, inventory, mx, my }) {
  ctx.fillStyle = "#fff";
  ctx.font = "700 16px system-ui";
  ctx.fillText("Station Access", x + 14, y + 14);

  const tabs = [
    { id: "shipyard", label: "Shipyard" },
    { id: "weapons", label: "Weapons" },
    { id: "crew", label: "Crew" },
    { id: "crafting", label: "Crafting" },
  ];

  let tabY = y + 48;
  for (const tab of tabs) {
    const button = { id: tab.id, x: x + 14, y: tabY, w: w - 28, h: 34 };
    state.ui.workshopTabButtons.push(button);

    const hover = mx >= button.x && mx <= button.x + button.w && my >= button.y && my <= button.y + button.h;
    const selected = state.ui.workshopTab === tab.id;

    ctx.fillStyle = selected
      ? "rgba(90,180,255,0.22)"
      : hover
        ? "rgba(255,255,255,0.14)"
        : "rgba(255,255,255,0.06)";
    ctx.fillRect(button.x, button.y, button.w, button.h);

    ctx.strokeStyle = selected
      ? "rgba(90,180,255,0.6)"
      : "rgba(255,255,255,0.16)";
    ctx.strokeRect(button.x, button.y, button.w, button.h);

    ctx.fillStyle = "#fff";
    ctx.font = "14px system-ui";
    ctx.fillText(tab.label, button.x + 12, button.y + 9);
    tabY += 42;
  }

  const equippedShip = SHIP_TYPES[state.playerShip?.id ?? "sloop"] ?? SHIP_TYPES.sloop;

  ctx.fillStyle = "#fff";
  ctx.font = "700 15px system-ui";
  ctx.fillText("Current Loadout", x + 14, y + 232);

  ctx.font = "13px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.fillText(`Ship: ${equippedShip.name}`, x + 14, y + 260);
  ctx.fillText(`Slots: ${equippedShip.cannonSlots}`, x + 14, y + 282);
  ctx.fillText(`Credits: ${state.credits ?? 0}`, x + 14, y + 304);

  ctx.fillStyle = "#fff";
  ctx.font = "700 15px system-ui";
  ctx.fillText("Core Materials", x + 14, y + 344);

  const invLines = [
    `Scrap: ${inventory.scrap ?? inventory.metal ?? 0}`,
    `Tech: ${inventory.tech ?? 0}`,
    `Gear: ${inventory.gear ?? 0}`,
  ];

  let invY = y + 372;
  ctx.font = "13px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  for (const line of invLines) {
    ctx.fillText(line, x + 14, invY);
    invY += 22;
  }
}

function renderShipyardTab(ctx, state, { x, y, w, unlockedShips, mx, my }) {
  const currentShip = state.playerShip?.id ?? "sloop";
  ctx.fillStyle = "#fff";
  ctx.font = "700 18px system-ui";
  ctx.fillText("Shipyard", x + 18, y + 16);
  ctx.font = "13px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.68)";
  ctx.fillText("Unlock new hulls and choose your current chassis.", x + 18, y + 42);

  const shipButtons = [
    { id: "sloop", label: "Scout", x: x + 18, y: y + 82, w: w - 36, h: 64 },
    { id: "brig", label: "Striker", x: x + 18, y: y + 156, w: w - 36, h: 64 },
    { id: "frigate", label: "Frigate", x: x + 18, y: y + 230, w: w - 36, h: 64 },
  ];
  state.ui.shipButtons = shipButtons;

  for (const b of shipButtons) {
    const shipType = SHIP_TYPES[b.id];
    const unlocked = Boolean(unlockedShips[b.id]);
    const selected = currentShip === b.id;
    const hover = mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h;

    ctx.fillStyle = selected
      ? "rgba(90,180,255,0.20)"
      : !unlocked
        ? "rgba(120,120,120,0.10)"
        : hover
          ? "rgba(255,255,255,0.12)"
          : "rgba(255,255,255,0.05)";
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = selected ? "rgba(90,180,255,0.58)" : "rgba(255,255,255,0.16)";
    ctx.strokeRect(b.x, b.y, b.w, b.h);

    ctx.fillStyle = "#fff";
    ctx.font = "700 15px system-ui";
    ctx.fillText(selected ? `${b.label} (Equipped)` : unlocked ? b.label : `${b.label} (Locked)`, b.x + 14, b.y + 10);
    ctx.font = "13px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.fillText(`HP ${shipType.maxHp} � Speed x${shipType.speedMul} � Slots ${shipType.cannonSlots}`, b.x + 14, b.y + 34);
    ctx.fillText(formatCost(shipType.cost), b.x + 14, b.y + 50);
  }
}

function renderWeaponsTab(ctx, state, { x, y, w, unlockedWeapons, mx, my }) {
  const ship = state.playerShip ?? { id: "sloop" };
  const shipSlots = ship.id === "frigate" ? 3 : ship.id === "brig" ? 2 : 1;
  const equippedCannons = state.playerLoadout?.cannons ?? ["light", null, null];
  const activeSlot = state.ui?.activeCannonSlot ?? 0;
  const currentCannon = equippedCannons[activeSlot] ?? "light";

  ctx.fillStyle = "#fff";
  ctx.font = "700 18px system-ui";
  ctx.fillText("Weapons", x + 18, y + 16);
  ctx.font = "13px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.68)";
  ctx.fillText(`Manage laser slots for your ${SHIP_TYPES[ship.id]?.name ?? "ship"}.`, x + 18, y + 42);

  const slotRows = [
    { index: 0, y: y + 86 },
    { index: 1, y: y + 120 },
    { index: 2, y: y + 154 },
  ];

  state.ui.cannonSlotButtons = [];
  for (const row of slotRows) {
    const active = row.index < shipSlots;
    const selected = activeSlot === row.index;
    const value = equippedCannons[row.index];
    const button = { index: row.index, x: x + 18, y: row.y, w: 260, h: 24, disabled: !active };
    state.ui.cannonSlotButtons.push(button);

    ctx.fillStyle = !active
      ? "rgba(120,120,120,0.10)"
      : selected
        ? "rgba(90,180,255,0.22)"
        : "rgba(255,255,255,0.08)";
    ctx.fillRect(button.x, button.y, button.w, button.h);
    ctx.strokeStyle = selected ? "rgba(90,180,255,0.58)" : "rgba(255,255,255,0.16)";
    ctx.strokeRect(button.x, button.y, button.w, button.h);

    ctx.fillStyle = active ? "#fff" : "rgba(255,255,255,0.45)";
    ctx.font = "13px system-ui";
    ctx.fillText(`Slot ${row.index + 1}: ${active ? (value ?? "Empty") : "Locked"}`, button.x + 10, button.y + 5);
  }

  ctx.fillStyle = "#fff";
  ctx.font = "13px system-ui";
  ctx.fillText(`Equip to Slot ${activeSlot + 1}`, x + 18, y + 196);

  const cannonButtons = [
    { id: "light", label: "Pulse Laser", x: x + 18, y: y + 222, w: w - 36, h: 58 },
    { id: "heavy", label: "Heavy Laser", x: x + 18, y: y + 290, w: w - 36, h: 58 },
    { id: "rapid", label: "Burst Laser", x: x + 18, y: y + 358, w: w - 36, h: 58 },
  ];
  state.ui.cannonButtons = cannonButtons;

  for (const b of cannonButtons) {
    const cannon = CANNON_TYPES[b.id];
    const unlocked = Boolean(unlockedWeapons[b.id]);
    const selected = currentCannon === b.id;
    const hover = mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h;

    ctx.fillStyle = selected
      ? "rgba(255,215,90,0.20)"
      : !unlocked
        ? "rgba(120,120,120,0.10)"
        : hover
          ? "rgba(255,255,255,0.12)"
          : "rgba(255,255,255,0.05)";
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = selected ? "rgba(255,215,90,0.56)" : "rgba(255,255,255,0.16)";
    ctx.strokeRect(b.x, b.y, b.w, b.h);

    ctx.fillStyle = "#fff";
    ctx.font = "700 15px system-ui";
    ctx.fillText(selected ? `${b.label} (Equipped)` : unlocked ? b.label : `${b.label} (Locked)`, b.x + 14, b.y + 10);
    ctx.font = "13px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.fillText(`DMG ${cannon.damage} � Rate ${cannon.fireRate} � Range ${cannon.range}`, b.x + 14, b.y + 30);
    ctx.fillText(formatCost(cannon.cost), b.x + 14, b.y + 46);
  }
}

function renderCrewTab(ctx, state, { x, y, w, unlockedCrew, mx, my }) {
  ctx.fillStyle = "#fff";
  ctx.font = "700 18px system-ui";
  ctx.fillText("Crew", x + 18, y + 16);
  ctx.font = "13px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.68)";
  ctx.fillText("Hire specialists and toggle them into the active roster.", x + 18, y + 42);

  state.ui.crewButtons = [];
  let by = y + 82;

  for (const member of Object.values(CrewSystem)) {
    const active = member.id === "captain" ? true : (state.crew?.[member.id] ?? false);
    const unlocked = Boolean(unlockedCrew[member.id]);
    const button = {
      id: member.id,
      label: member.name,
      x: x + w - 110,
      y: by + 14,
      w: 84,
      h: 28,
      disabled: member.id === "captain",
    };
    state.ui.crewButtons.push(button);

    const hover = mx >= button.x && mx <= button.x + button.w && my >= button.y && my <= button.y + button.h;

    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(x + 18, by, w - 36, 64);
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.strokeRect(x + 18, by, w - 36, 64);

    ctx.fillStyle = "#fff";
    ctx.font = "700 15px system-ui";
    ctx.fillText(member.name, x + 32, by + 10);

    ctx.font = "13px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.fillText(
      member.id === "captain"
        ? "Permanent command role"
        : active
          ? "Currently active"
          : unlocked
            ? "Available for assignment"
            : formatCost(member.cost),
      x + 32,
      by + 34
    );

    ctx.fillStyle = button.disabled
      ? "rgba(255,220,120,0.9)"
      : hover
        ? "rgba(120,255,160,0.9)"
        : "rgba(255,255,255,0.6)";
    ctx.fillRect(button.x, button.y, button.w, button.h);
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.strokeRect(button.x, button.y, button.w, button.h);
    ctx.fillStyle = button.disabled ? "rgba(255,255,255,0.45)" : "#fff";
    ctx.font = "14px system-ui";
    ctx.fillText(
      member.id === "captain"
        ? "Fixed"
        : active
          ? "Active"
          : unlocked
            ? "Equip"
            : "Hire",
      button.x + 20,
      button.y + 6
    );

    by += 74;
  }
}

function renderCraftingTab(ctx, state, { x, y, w, recipes, mx, my }) {
  ctx.fillStyle = "#fff";
  ctx.font = "700 18px system-ui";
  ctx.fillText("Crafting", x + 18, y + 16);
  ctx.font = "13px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.68)";
  ctx.fillText("Build consumables and modules from gathered resources.", x + 18, y + 42);

  state.ui.workshopButtons = [];
  let by = y + 82;

  if (recipes.length === 0) {
    ctx.font = "14px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText("No recipes found", x + 18, by);
    return;
  }

  for (const recipe of recipes) {
    const canCraft = state.crafting?.recipes?.canCraft?.(state, recipe.id) ?? false;
    const button = { id: recipe.id, x: x + w - 118, y: by + 12, w: 96, h: 28, disabled: !canCraft };
    state.ui.workshopButtons.push(button);

    const hover = mx >= button.x && mx <= button.x + button.w && my >= button.y && my <= button.y + button.h;

    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(x + 18, by, w - 36, 64);
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.strokeRect(x + 18, by, w - 36, 64);

    ctx.fillStyle = "#fff";
    ctx.font = "700 15px system-ui";
    ctx.fillText(recipe.name ?? recipe.id, x + 32, by + 10);

    ctx.font = "13px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.fillText(formatCost(recipe.cost), x + 32, by + 34);

    ctx.fillStyle = button.disabled
      ? "rgba(120,120,120,0.14)"
      : hover
        ? "rgba(255,255,255,0.18)"
        : "rgba(255,255,255,0.08)";
    ctx.fillRect(button.x, button.y, button.w, button.h);
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.strokeRect(button.x, button.y, button.w, button.h);
    ctx.fillStyle = button.disabled ? "rgba(255,255,255,0.45)" : "#fff";
    ctx.font = "14px system-ui";
    ctx.fillText(canCraft ? "Craft" : "Locked", button.x + 20, button.y + 6);

    by += 74;
    if (by > y + 390) break;
  }
}
