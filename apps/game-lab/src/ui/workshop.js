import { CrewSystem } from "../systems/crew.js";

export function renderWorkshopUI(ctx, state) {
  if (!state.ui?.workshopOpen) return;

  const recipes = state.crafting?.recipes?.list ?? [];
  const inventory = state.inventory ?? {};

  const x = state.canvas.clientWidth / 2 - 470;
  const y = state.canvas.clientHeight / 2 - 290;
  const w = 940;
  const h = 580;

  ctx.save();

  // Background
  ctx.fillStyle = "rgba(0,0,0,0.86)";
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.strokeRect(x, y, w, h);

  // Header
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(x, y, w, 42);

  ctx.fillStyle = "#fff";
  ctx.font = "700 20px system-ui";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Space Station", x + 18, y + 10);

  // Panels
  const col1X = x + 20;
  const col1Y = y + 58;
  const col1W = 220;
  const col1H = 470;

  const col2X = x + 260;
  const col2Y = y + 58;
  const col2W = 280;
  const col2H = 470;

  const col3X = x + 560;
  const col3Y = y + 58;
  const col3W = 360;
  const col3H = 470;

  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(col1X, col1Y, col1W, col1H);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.strokeRect(col1X, col1Y, col1W, col1H);

  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(col2X, col2Y, col2W, col2H);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.strokeRect(col2X, col2Y, col2W, col2H);

  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(col3X, col3Y, col3W, col3H);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.strokeRect(col3X, col3Y, col3W, col3H);

  // Mouse
  const rect = state.canvas.getBoundingClientRect();
  const mx = (state.input?.mouse?.x ?? -9999) - rect.left;
  const my = (state.input?.mouse?.y ?? -9999) - rect.top;

  // =========================
  // Inventory (left column)
  // =========================
  ctx.fillStyle = "#fff";
  ctx.font = "700 16px system-ui";
  ctx.fillText("Inventory", col1X + 12, col1Y + 10);

  ctx.font = "14px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.9)";

  const invLines = [
    `Gold: ${state.gold ?? 0}`,
    `Wood: ${inventory.wood ?? 0}`,
    `Scrap: ${inventory.scrap ?? inventory.metal ?? 0}`,
    `Cloth: ${inventory.cloth ?? 0}`,
    `Tech: ${inventory.tech ?? 0}`,
    `Powder: ${inventory.powder ?? 0}`,
    `Gear: ${inventory.gear ?? 0}`,
  ];

  let invY = col1Y + 48;
  for (const line of invLines) {
    ctx.fillText(line, col1X + 12, invY);
    invY += 26;
  }

  // =========================
  // Loadout (middle column)
  // =========================
  const ship = state.playerShip ?? { id: "sloop" };
  const shipSlots =
    ship.id === "frigate" ? 3 :
    ship.id === "brig" ? 2 :
    1;

  const equippedCannons = state.playerLoadout?.cannons ?? ["light", null, null];

  // Cannon Loadout title
  ctx.fillStyle = "#fff";
  ctx.font = "700 16px system-ui";
  ctx.fillText("Cannon Loadout", col2X + 12, col2Y + 10);

  ctx.font = "13px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillText(`Available Slots: ${shipSlots}`, col2X + 12, col2Y + 32);

 // Slot overview
  const activeSlot = state.ui?.activeCannonSlot ?? 0;

  const slotRows = [
    { index: 0, y: col2Y + 52 },
    { index: 1, y: col2Y + 80 },
    { index: 2, y: col2Y + 108 },
  ];

  state.ui.cannonSlotButtons = [];

  for (const row of slotRows) {
    const active = row.index < shipSlots;
    const value = equippedCannons[row.index];
    const selected = activeSlot === row.index;

    const slotButton = {
      index: row.index,
      x: col2X + 12,
      y: row.y,
      w: 230,
      h: 22,
      disabled: !active,
    };

    state.ui.cannonSlotButtons.push(slotButton);

    ctx.fillStyle = !active
      ? "rgba(120,120,120,0.10)"
      : selected
        ? "rgba(90,180,255,0.22)"
        : "rgba(255,255,255,0.08)";
    ctx.fillRect(slotButton.x, slotButton.y, slotButton.w, slotButton.h);

    ctx.strokeStyle = !active
      ? "rgba(120,120,120,0.20)"
      : selected
        ? "rgba(90,180,255,0.65)"
        : "rgba(255,255,255,0.20)";
    ctx.strokeRect(slotButton.x, slotButton.y, slotButton.w, slotButton.h);

    ctx.fillStyle = active ? "#fff" : "rgba(255,255,255,0.4)";
    ctx.font = "13px system-ui";
    ctx.fillText(
      `Slot ${row.index + 1}: ${active ? (value ?? "Empty") : "Locked"}`,
      slotButton.x + 8,
      slotButton.y + 4
    );
  }
  for (const row of slotRows) {
    const active = row.index < shipSlots;
    const value = equippedCannons[row.index];

    ctx.fillStyle = active
      ? "rgba(255,255,255,0.08)"
      : "rgba(120,120,120,0.10)";
    ctx.fillRect(col2X + 12, row.y, 230, 22);

    ctx.strokeStyle = active
      ? "rgba(255,255,255,0.20)"
      : "rgba(120,120,120,0.20)";
    ctx.strokeRect(col2X + 12, row.y, 230, 22);

    ctx.fillStyle = active ? "#fff" : "rgba(255,255,255,0.4)";
    ctx.font = "13px system-ui";
    ctx.fillText(
      `Slot ${row.index + 1}: ${active ? (value ?? "Empty") : "Locked"}`,
      col2X + 20,
      row.y + 4
    );
  }

  // Equip Slot 1
  ctx.fillStyle = "#fff";
  ctx.font = "13px system-ui";
  ctx.fillText(`Equip to Slot ${(activeSlot ?? 0)+ 1}`, col2X + 12, col2Y + 150);

  const currentCannon = equippedCannons[activeSlot] ?? "light";

  const cannonButtons = [
    { id: "light", label: "Light Cannon", x: col2X + 12, y: col2Y + 168, w: 230, h: 28 },
    { id: "heavy", label: "Heavy Cannon", x: col2X + 12, y: col2Y + 202, w: 230, h: 28 },
    { id: "rapid", label: "Rapid Cannon", x: col2X + 12, y: col2Y + 236, w: 230, h: 28 },
  ];

  state.ui.cannonButtons = cannonButtons;

  for (const b of cannonButtons) {
    const selected = currentCannon === b.id;
    const hover =
      mx >= b.x &&
      mx <= b.x + b.w &&
      my >= b.y &&
      my <= b.y + b.h;

    ctx.fillStyle = selected
      ? "rgba(255,215,90,0.28)"
      : hover
        ? "rgba(255,255,255,0.18)"
        : "rgba(255,255,255,0.08)";
    ctx.fillRect(b.x, b.y, b.w, b.h);

    ctx.strokeStyle = selected
      ? "rgba(255,215,90,0.7)"
      : "rgba(255,255,255,0.28)";
    ctx.strokeRect(b.x, b.y, b.w, b.h);

    ctx.fillStyle = "#fff";
    ctx.font = "14px system-ui";
    ctx.fillText(
      selected ? `${b.label} (Equipped)` : b.label,
      b.x + 10,
      b.y + 6
    );
  }

  // Ship Loadout
  const currentShip = state.playerShip?.id ?? "sloop";

  ctx.fillStyle = "#fff";
  ctx.font = "700 16px system-ui";
  ctx.fillText("Ship Loadout", col2X + 12, col2Y + 300);

  const shipButtons = [
    { id: "sloop", label: "Sloop", x: col2X + 12, y: col2Y + 328, w: 230, h: 28 },
    { id: "brig", label: "Brig", x: col2X + 12, y: col2Y + 362, w: 230, h: 28 },
    { id: "frigate", label: "Frigate", x: col2X + 12, y: col2Y + 396, w: 230, h: 28 },
  ];

  state.ui.shipButtons = shipButtons;

  for (const b of shipButtons) {
    const selected = currentShip === b.id;
    const hover =
      mx >= b.x &&
      mx <= b.x + b.w &&
      my >= b.y &&
      my <= b.y + b.h;

    ctx.fillStyle = selected
      ? "rgba(90,180,255,0.28)"
      : hover
        ? "rgba(255,255,255,0.18)"
        : "rgba(255,255,255,0.08)";
    ctx.fillRect(b.x, b.y, b.w, b.h);

    ctx.strokeStyle = selected
      ? "rgba(90,180,255,0.7)"
      : "rgba(255,255,255,0.28)";
    ctx.strokeRect(b.x, b.y, b.w, b.h);

    ctx.fillStyle = "#fff";
    ctx.font = "14px system-ui";
    ctx.fillText(
      selected ? `${b.label} (Equipped)` : b.label,
      b.x + 10,
      b.y + 6
    );
  }

  // =========================
  // Crafting (right column)
  // =========================
  ctx.fillStyle = "#fff";
  ctx.font = "700 16px system-ui";
  ctx.fillText("Crafting", col3X + 12, col3Y + 10);

  state.ui.workshopButtons = [];

  let by = col3Y + 38;

  if (recipes.length === 0) {
    ctx.font = "14px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText("No recipes found", col3X + 12, by);
  }

  for (const recipe of recipes) {
    const canCraft = state.crafting?.recipes?.canCraft?.(state, recipe.id) ?? false;

    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fillRect(col3X + 8, by - 6, col3W - 16, 58);

    ctx.fillStyle = "#fff";
    ctx.font = "15px system-ui";
    ctx.fillText(recipe.name ?? recipe.id, col3X + 16, by);

    const costText = Object.entries(recipe.cost ?? {})
      .map(([k, v]) => `${v} ${k}`)
      .join(", ");

    ctx.font = "13px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.68)";
    ctx.fillText(costText || "No cost", col3X + 16, by + 20);

    const button = {
      id: recipe.id,
      x: col3X + col3W - 118,
      y: by + 1,
      w: 96,
      h: 28,
      disabled: !canCraft,
    };

    state.ui.workshopButtons.push(button);

    const hover =
      mx >= button.x &&
      mx <= button.x + button.w &&
      my >= button.y &&
      my <= button.y + button.h;

    ctx.fillStyle = button.disabled
      ? "rgba(120,120,120,0.14)"
      : hover
        ? "rgba(255,255,255,0.20)"
        : "rgba(255,255,255,0.08)";
    ctx.fillRect(button.x, button.y, button.w, button.h);

    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.strokeRect(button.x, button.y, button.w, button.h);

    ctx.fillStyle = button.disabled ? "rgba(255,255,255,0.45)" : "#fff";
    ctx.font = "14px system-ui";
    ctx.fillText(canCraft ? "Craft" : "Locked", button.x + 20, button.y + 6);

    by += 66;
    if (by > col3Y + col3H - 30) break;
  }

    ctx.fillStyle = "#fff";
    ctx.font = "700 16px system-ui";
    by += 30;
    ctx.fillText("Crew", col3X + 12, by);
    by += 28;

    state.ui.crewButtons = [];

    const crewEntries = Object.values(CrewSystem);

    for (const member of crewEntries) {
      const active = member.id === "captain" 
      ? true 
      : (state.crew?.[member.id] ?? false);

      ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fillRect(col3X + 8, by - 6, col3W - 16, 58);

    ctx.fillStyle = "#fff";
    ctx.font = "15px system-ui";
    ctx.fillText(member.name ?? member.id, col3X + 16, by);

      const button = {
      id: member.id,
      label: member.name,
      x: col3X + col3W - 102,
      y: by + 8,
      w: 84,
      h: 28,
      disabled: member.id === "captain",
    };
    by += 38;
      state.ui.crewButtons.push(button);

      ctx.font = "13px system-ui";
      ctx.fillStyle = "rgba(255,255,255,0.68)";
      ctx.fillText(active? "active" : "inactive", col3X + 16, by - 12);

      const buttonText = member.id === "captain" 
      ? "Fixed" 
      : active 
        ? "Active" 
        : "Equip";

      const hover =
      mx >= button.x &&
      mx <= button.x + button.w &&
      my >= button.y &&
      my <= button.y + button.h;

      ctx.fillStyle = button.disabled
      ? "rgba(255, 220, 120, 0.9)" //gold
      : hover
        ? "rgba(120,255,160,0.9)" //grün
        : "rgba(255,255,255,0.6)"; //grau
    ctx.fillRect(button.x, button.y, button.w, button.h);
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.strokeRect(button.x, button.y, button.w, button.h);
    ctx.fillStyle = button.disabled ? "rgba(255,255,255,0.45)" : "#fff";
    ctx.font = "14px system-ui";
    ctx.fillText(buttonText, button.x + 20, button.y + 6);

    by += 18;

  }


  // Footer
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("Press F to close • Move away from Dockmaster to close", x + w / 2, y + h - 22);
  ctx.textAlign = "left";

  ctx.restore();
}