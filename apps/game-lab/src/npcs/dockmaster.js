export const dockmasterNpc = {
  x: 700,
  y: 300,
  r: 40,
};

export function openDockmaster(state) {
  state.ui = state.ui ?? {};
  state.ui.workshopOpen = true;
  state.ui.merchantOpen = false;
  state.ui.navigatorOpen = false;
  state.ui.dockmasterOpen = false;
}

export function updateDockmaster(state) {
  const dx = state.player.x - dockmasterNpc.x;
  const dy = state.player.y - dockmasterNpc.y;
  const dist = Math.hypot(dx, dy);

  const interactRange = dockmasterNpc.r + 60;
  const nearDockmaster = dist < interactRange;

  state.ui.dockmasterHint = nearDockmaster;

  if (!nearDockmaster) {
    state.ui.dockmasterOpen = false;
    state.ui.workshopOpen = false;
  }

  if (nearDockmaster && state.input?.wasPressed?.("f")) {
    state.ui.workshopOpen = !state.ui.workshopOpen;

    if (state.ui.workshopOpen) {
      openDockmaster(state);
    }
  }
}

export function renderDockmasterWorld(ctx) {
  ctx.save();

  ctx.fillStyle = "rgb(200,160,80)";
  ctx.beginPath();
  ctx.arc(dockmasterNpc.x, dockmasterNpc.y, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.font = "700 12px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("Ship Technician", dockmasterNpc.x, dockmasterNpc.y - 20);

  ctx.restore();
}

export function renderDockmasterUI(ctx, state) {
  if (
    state.ui?.dockmasterHint &&
    !state.ui?.workshopOpen &&
    !state.ui?.merchantOpen &&
    !state.ui?.navigatorOpen
  ) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(state.canvas.clientWidth / 2 - 120, 24, 240, 36);

    ctx.fillStyle = "#fff";
    ctx.font = "600 16px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Press F - Ship Technician", state.canvas.clientWidth / 2, 42);
    ctx.restore();
  }
}
