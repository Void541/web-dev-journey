export function renderWorkshopUI(ctx, state) {
  if (!state.ui?.workshopOpen) return;

  const recipes = state.crafting?.recipes?.list ?? [];
  const inventory = state.inventory ?? {};

  const x = state.canvas.clientWidth / 2 - 360;
  const y = state.canvas.clientHeight / 2 - 220;
  const w = 720;
  const h = 440;

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
  ctx.fillText("Harbor Workshop", x + 18, y + 10);

  // Panels
  const leftX = x + 20;
  const leftY = y + 58;
  const leftW = 250;
  const leftH = 330;

  const rightX = x + 290;
  const rightY = y + 58;
  const rightW = 410;
  const rightH = 330;

  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(leftX, leftY, leftW, leftH);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.strokeRect(leftX, leftY, leftW, leftH);

  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(rightX, rightY, rightW, rightH);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.strokeRect(rightX, rightY, rightW, rightH);

  // Mouse
  const rect = state.canvas.getBoundingClientRect();
  const mx = (state.input?.mouse?.x ?? -9999) - rect.left;
  const my = (state.input?.mouse?.y ?? -9999) - rect.top;

  // Inventory
  ctx.fillStyle = "#fff";
  ctx.font = "700 16px system-ui";
  ctx.fillText("Inventory", leftX + 12, leftY + 10);

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

  let invY = leftY + 54;
  for (const line of invLines) {
    ctx.fillText(line, leftX + 12, invY);
    invY += 24;
  }

  // Cannon Loadout
  const currentCannon = state.playerLoadout?.cannon ?? "light";

  ctx.fillStyle = "#fff";
  ctx.font = "14px system-ui";

  const cannonButtons = [
    { id: "light", label: "Light Cannon", x: leftX + 12, y: leftY + 240, w: 210, h: 28 },
    { id: "heavy", label: "Heavy Cannon", x: leftX + 12, y: leftY + 274, w: 210, h: 28 },
    { id: "rapid", label: "Rapid Cannon", x: leftX + 12, y: leftY + 308, w: 210, h: 28 },
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

  // Crafting
  ctx.fillStyle = "#fff";
  ctx.font = "700 16px system-ui";
  ctx.fillText("Crafting", rightX + 12, rightY + 10);

  state.ui.workshopButtons = [];

  let by = rightY + 38;

  if (recipes.length === 0) {
    ctx.font = "14px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText("No recipes found", rightX + 12, by);
  }

  for (const recipe of recipes) {
    const canCraft = state.crafting?.recipes?.canCraft?.(state, recipe.id) ?? false;

    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fillRect(rightX + 8, by - 6, rightW - 16, 58);

    ctx.fillStyle = "#fff";
    ctx.font = "15px system-ui";
    ctx.fillText(recipe.name ?? recipe.id, rightX + 16, by);

    const costText = Object.entries(recipe.cost ?? {})
      .map(([k, v]) => `${v} ${k}`)
      .join(", ");

    ctx.font = "13px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.68)";
    ctx.fillText(costText || "No cost", rightX + 16, by + 20);

    const button = {
      id: recipe.id,
      x: rightX + rightW - 118,
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
    if (by > rightY + rightH - 30) break;
  }

  // Footer
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("Press F to close • Move away from Dockmaster to close", x + w / 2, y + h - 22);
  ctx.textAlign = "left";

  ctx.restore();
}