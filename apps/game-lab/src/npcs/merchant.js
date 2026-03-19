function getScrapKey(state) {
  if ("scrap" in (state.inventory ?? {})) return "scrap";
  return "metal";
}

function canAfford(state, amount) {
  return (state.gold ?? 0) >= amount;
}

function addItem(state, key, amount) {
  state.inventory = state.inventory ?? {};
  state.inventory[key] = (state.inventory[key] ?? 0) + amount;
}

function removeItem(state, key, amount) {
  state.inventory = state.inventory ?? {};
  const have = state.inventory[key] ?? 0;
  if (have < amount) return false;
  state.inventory[key] = have - amount;
  return true;
}

function getMouseInCanvas(state) {
  const rect = state.canvas.getBoundingClientRect();
  return {
    x: state.input.mouse.x - rect.left,
    y: state.input.mouse.y - rect.top,
  };
}

function isInside(mx, my, rect) {
  return (
    mx >= rect.x &&
    mx <= rect.x + rect.w &&
    my >= rect.y &&
    my <= rect.y + rect.h
  );
}

export const merchantNpc = {
  x: 520,
  y: 300,
  r: 40,
};

export function updateMerchant(state) {
  const dx = state.player.x - merchantNpc.x;
  const dy = state.player.y - merchantNpc.y;
  const dist = Math.hypot(dx, dy);
  const nearMerchant = dist < merchantNpc.r;

  state.ui.merchantHint = nearMerchant;

  if (nearMerchant && state.input?.wasPressed?.("f")) {
    state.ui.merchantOpen = !state.ui.merchantOpen;
    if (state.ui.merchantOpen) {
      state.ui.dockmasterOpen = false;
      state.ui.navigatorOpen = false;
    }
  }

  if (state.ui?.merchantOpen && state.input?.mousePressed?.()) {
    const { x: mx, y: my } = getMouseInCanvas(state);
    const scrapKey = getScrapKey(state);

    for (const b of state.ui.merchantButtons ?? []) {
      if (!isInside(mx, my, b)) continue;

      if (b.id === "sellWood") {
        if (removeItem(state, "wood", 5)) {
          state.gold += 2;
          state.pushLootNotice?.("Sold 5 wood for 2 gold");
        } else {
          state.pushLootNotice?.("Not enough wood to sell");
        }
      }

      if (b.id === "sellScrap") {
        if (removeItem(state, scrapKey, 10)) {
          state.gold += 3;
          state.pushLootNotice?.(`Sold 10 ${scrapKey} for 3 gold`);
        } else {
          state.pushLootNotice?.(`Not enough ${scrapKey} to sell`);
        }
      }

      if (b.id === "buyCloth") {
        if (canAfford(state, 6)) {
          state.gold -= 6;
          addItem(state, "cloth", 1);
          state.pushLootNotice?.("Bought 1 cloth for 6 gold");
        } else {
          state.pushLootNotice?.("Not enough gold to buy cloth");
        }
      }

      if (b.id === "buyTech") {
        if (canAfford(state, 12)) {
          state.gold -= 12;
          addItem(state, "tech", 1);
          state.pushLootNotice?.("Bought 1 tech for 12 gold");
        } else {
          state.pushLootNotice?.("Not enough gold to buy tech");
        }
      }
    }
  }
}

export function renderMerchantWorld(ctx) {
  ctx.save();

  ctx.fillStyle = "rgb(120,200,120)";
  ctx.beginPath();
  ctx.arc(merchantNpc.x, merchantNpc.y, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#111";
  ctx.font = "700 12px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("Merchant", merchantNpc.x, merchantNpc.y - 20);

  ctx.restore();
}

export function renderMerchantUI(ctx, state) {
  if (state.ui?.merchantHint && !state.ui?.dockmasterOpen && !state.ui?.merchantOpen && !state.ui?.navigatorOpen) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(state.canvas.clientWidth / 2 - 120, 24, 240, 36);

    ctx.fillStyle = "#fff";
    ctx.font = "600 16px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Press F - Merchant", state.canvas.clientWidth / 2, 42);
    ctx.restore();
  }

  if (!state.ui?.merchantOpen) return;

  ctx.save();

  const scrapKey = getScrapKey(state);
  const w = 340;
  const h = 280;
  const x = state.canvas.clientWidth / 2 - w / 2;
  const y = state.canvas.clientHeight / 2 - h / 2;

  ctx.fillStyle = "rgba(0,0,0,0.82)";
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = "#fff";
  ctx.font = "700 18px system-ui";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Merchant", x + 20, y + 20);

  ctx.font = "14px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText(`Gold: ${state.gold ?? 0}`, x + 20, y + 60);

  const { x: mx, y: my } = getMouseInCanvas(state);

  const buttons = [
    { id: "sellWood", label: "Sell 5 wood for 2 gold", x: x + 20, y: y + 100, w: 300, h: 28 },
    { id: "sellScrap", label: `Sell 10 ${scrapKey} for 3 gold`, x: x + 20, y: y + 140, w: 300, h: 28 },
    { id: "buyCloth", label: "Buy 1 cloth for 6 gold", x: x + 20, y: y + 180, w: 300, h: 28 },
    { id: "buyTech", label: "Buy 1 tech for 12 gold", x: x + 20, y: y + 220, w: 300, h: 28 },
  ];

  state.ui.merchantButtons = buttons;

  for (const b of buttons) {
    const hover = isInside(mx, my, b);

    ctx.fillStyle = hover
      ? "rgba(255,255,255,0.18)"
      : "rgba(255,255,255,0.08)";
    ctx.fillRect(b.x, b.y, b.w, b.h);

    ctx.strokeStyle = "rgba(255,255,255,0.30)";
    ctx.strokeRect(b.x, b.y, b.w, b.h);

    ctx.fillStyle = "#fff";
    ctx.font = "16px system-ui";
    ctx.fillText(b.label, b.x + 10, b.y + 8);
  }

  ctx.restore();
}