export function renderPilotSkillsUI(ctx, state) {
  if (!state.ui?.skillsOpen) return;

  const x = state.canvas.clientWidth / 2 - 420;
  const y = state.canvas.clientHeight / 2 - 230;
  const w = 840;
  const h = 460;

  const rect = state.canvas.getBoundingClientRect();
  const mx = (state.input?.mouse?.x ?? -9999) - rect.left;
  const my = (state.input?.mouse?.y ?? -9999) - rect.top;

  const talentPoints = state.progression?.talentPoints ?? 0;
  const talents = state.progression?.talents ?? {
    dmg: 0,
    hp: 0,
    speed: 0,
  };

  state.ui.skillButtons = [];

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.88)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(255,255,255,0.24)";
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(x, y, w, 42);

  ctx.fillStyle = "#fff";
  ctx.font = "700 20px system-ui";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Pilot Skills", x + 18, y + 10);

  ctx.font = "13px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.68)";
  ctx.fillText("Spend talent points outside the station flow and shape your pilot build.", x + 18, y + 48);
  ctx.fillText(`Available Talent Points: ${talentPoints}`, x + 18, y + 72);

  const cards = [
    { id: "dmg", title: "Offense", subtitle: "Improve laser damage output.", value: talents.dmg, accent: "rgba(255,110,110,0.9)", x: x + 32, y: y + 118 },
    { id: "hp", title: "Defense", subtitle: "Improve ship durability.", value: talents.hp, accent: "rgba(110,220,150,0.9)", x: x + 292, y: y + 118 },
    { id: "speed", title: "Mobility", subtitle: "Improve engine handling and speed.", value: talents.speed, accent: "rgba(120,190,255,0.9)", x: x + 552, y: y + 118 },
  ];

  for (const card of cards) {
    const cardW = 220;
    const cardH = 220;
    const button = {
      id: card.id,
      label: card.title,
      x: card.x + 72,
      y: card.y + 148,
      w: 76,
      h: 34,
      disabled: talentPoints <= 0,
    };

    state.ui.skillButtons.push(button);

    const hover =
      mx >= button.x &&
      mx <= button.x + button.w &&
      my >= button.y &&
      my <= button.y + button.h;

    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(card.x, card.y, cardW, cardH);
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.strokeRect(card.x, card.y, cardW, cardH);

    ctx.fillStyle = card.accent;
    ctx.fillRect(card.x, card.y, cardW, 6);

    ctx.fillStyle = "#fff";
    ctx.font = "700 18px system-ui";
    ctx.fillText(card.title, card.x + 16, card.y + 20);

    ctx.font = "14px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.fillText(card.subtitle, card.x + 16, card.y + 58);

    ctx.font = "700 36px system-ui";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(String(card.value), card.x + cardW / 2, card.y + 102);

    ctx.fillStyle = button.disabled
      ? "rgba(120,120,120,0.16)"
      : hover
        ? "rgba(255,255,255,0.18)"
        : "rgba(255,255,255,0.08)";
    ctx.fillRect(button.x, button.y, button.w, button.h);

    ctx.strokeStyle = button.disabled
      ? "rgba(120,120,120,0.26)"
      : "rgba(255,255,255,0.26)";
    ctx.strokeRect(button.x, button.y, button.w, button.h);

    ctx.fillStyle = button.disabled ? "rgba(255,255,255,0.45)" : "#fff";
    ctx.font = "700 16px system-ui";
    ctx.fillText("+1", button.x + button.w / 2, button.y + 9);
    ctx.textAlign = "left";
  }

  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("Press K or Escape to close", x + w / 2, y + h - 22);
  ctx.restore();
}
