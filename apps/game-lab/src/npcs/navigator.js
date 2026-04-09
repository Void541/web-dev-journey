import { QUESTS } from "../quests/quests.js";
import {
  isQuestComplete,
  giveQuestReward,
} from "../quests/questLogic.js";

export const navigatorNpc = {
  x: 880,
  y: 300,
  r: 40,
};

export function openNavigator(state) {
  state.ui = state.ui ?? {};
  state.ui.navigatorOpen = true;
  state.ui.dockmasterOpen = false;
  state.ui.merchantOpen = false;
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

export function initNavigatorUi(state) {
  state.ui = state.ui ?? {};

  state.ui.navigatorWindow = state.ui.navigatorWindow ?? {
    x: null,
    y: null,
    dragging: false,
    dragOffX: 0,
    dragOffY: 0,
  };

  state.ui.navigatorOpen = state.ui.navigatorOpen ?? false;
  state.ui.navigatorHint = state.ui.navigatorHint ?? false;
  state.ui.navigatorButtons = state.ui.navigatorButtons ?? [];
}

export function updateNavigator(state) {
  initNavigatorUi(state);

  const dx = state.player.x - navigatorNpc.x;
  const dy = state.player.y - navigatorNpc.y;
  const dist = Math.hypot(dx, dy);
  const nearNavigator = dist < navigatorNpc.r;

  state.ui.navigatorHint = nearNavigator;

  if (nearNavigator && state.input?.wasPressed?.("f")) {
    state.ui.navigatorOpen = !state.ui.navigatorOpen;
    if (state.ui.navigatorOpen) {
      openNavigator(state);
    }
  }

  if (state.ui?.navigatorOpen) {
    const { x: mx, y: my } = getMouseInCanvas(state);

    const win = state.ui.navigatorWindow ?? {
      x: state.canvas.clientWidth / 2 - 210,
      y: state.canvas.clientHeight / 2 - 125,
      dragging: false,
      dragOffX: 0,
      dragOffY: 0,
    };

    const w = 420;
    const h = 250;
    const x = win.x ?? (state.canvas.clientWidth / 2 - w / 2);
    const y = win.y ?? (state.canvas.clientHeight / 2 - h / 2);

    const headerH = 36;
    const overHeader =
      mx >= x &&
      mx <= x + w &&
      my >= y &&
      my <= y + headerH;

    if (state.input?.mousePressed?.() && overHeader) {
      win.dragging = true;
      win.dragOffX = mx - x;
      win.dragOffY = my - y;
    }

    if (!state.input.mouse.down) {
      win.dragging = false;
    }

    if (win.dragging) {
      win.x = Math.max(
        10,
        Math.min(mx - win.dragOffX, state.canvas.clientWidth - w - 10)
      );
      win.y = Math.max(
        10,
        Math.min(my - win.dragOffY, state.canvas.clientHeight - h - 10)
      );
    }

    state.ui.navigatorWindow = win;
  }

  if (
    state.ui?.navigatorOpen &&
    state.input?.mousePressed?.() &&
    !state.ui.navigatorWindow?.dragging
  ) {
    const { x: mx, y: my } = getMouseInCanvas(state);

    for (const b of state.ui.navigatorButtons ?? []) {
      if (!isInside(mx, my, b)) continue;
      if (b.disabled) continue;

      if (b.id.startsWith("accept:")) {
        const questId = b.id.split(":")[1];
        const quest = QUESTS.find((q) => q.id === questId);

        if (quest) {
          state.quests.active = quest;
          state.ui.navigatorOpen = false;
          state.pushLootNotice?.(`Accepted quest: ${quest.title}`);
        }
      }

      if (b.id === "claim") {
        const quest = state.quests.active;
        if (quest && isQuestComplete(state, quest)) {
          giveQuestReward(state, quest);
          state.quests.completed.push(quest.id);
          state.pushLootNotice?.(`Completed quest: ${quest.title}`);
          state.quests.active = null;
        }
      }

      if (b.id === "abandon") {
        if (state.quests.active) {
          state.pushLootNotice?.(`Abandoned quest: ${state.quests.active.title}`);
          state.quests.active = null;
        }
      }
    }
  }
}

export function renderNavigatorWorld(ctx) {
  ctx.save();

  ctx.fillStyle = "rgb(120,170,220)";
  ctx.beginPath();
  ctx.arc(navigatorNpc.x, navigatorNpc.y, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.font = "700 12px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("Contract Officer", navigatorNpc.x, navigatorNpc.y - 20);

  ctx.restore();
}

export function renderNavigatorUI(ctx, state) {
  if (
    state.ui?.navigatorHint &&
    !state.ui?.dockmasterOpen &&
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
    ctx.fillText("Press F - Contract Officer", state.canvas.clientWidth / 2, 42);
    ctx.restore();
  }

  if (!state.ui?.navigatorOpen) return;

  ctx.save();

  const w = 420;
  const h = 320;

  state.ui.navigatorWindow = state.ui.navigatorWindow ?? {
    x: state.canvas.clientWidth / 2 - w / 2,
    y: state.canvas.clientHeight / 2 - h / 2,
    dragging: false,
    dragOffX: 0,
    dragOffY: 0,
  };

  if (state.ui.navigatorWindow.x == null) {
    state.ui.navigatorWindow.x = state.canvas.clientWidth / 2 - w / 2;
  }
  if (state.ui.navigatorWindow.y == null) {
    state.ui.navigatorWindow.y = state.canvas.clientHeight / 2 - h / 2;
  }

  const x = state.ui.navigatorWindow.x;
  const y = state.ui.navigatorWindow.y;

  ctx.fillStyle = "rgba(0,0,0,0.84)";
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(x, y, w, 36);

  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = "#fff";
  ctx.font = "700 18px system-ui";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Contract Officer", x + 20, y + 10);

  ctx.font = "13px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.68)";
  ctx.fillText("Sector assignments and mission escalation", x + 20, y + 34);

  const { x: mx, y: my } = getMouseInCanvas(state);

  const buttons = [];
  const active = state.quests?.active ?? null;

  if (active) {
    const done = isQuestComplete(state, active);

    ctx.font = "16px system-ui";
    ctx.fillStyle = "#fff";
    ctx.fillText(active.title, x + 20, y + 60);

    ctx.font = "14px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    wrapText(ctx, active.desc, x + 20, y + 88, w - 40, 18);

    if (done) {
      ctx.font = "14px system-ui";
      ctx.fillStyle = "rgba(120,255,120,0.9)";
      ctx.fillText("Status: Ready to claim", x + 20, y + 162);

      buttons.push({
        id: "claim",
        label: "Claim Reward",
        x: x + 20,
        y: y + 212,
        w: 180,
        h: 32,
        disabled: false,
      });
    } else {
      ctx.font = "14px system-ui";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText("Status: In progress", x + 20, y + 162);
    }

    buttons.push({
      id: "abandon",
      label: "Abandon Quest",
      x: x + 220,
      y: y + 212,
      w: 180,
      h: 32,
      disabled: false,
    });
  } else {
    ctx.font = "16px system-ui";
    ctx.fillStyle = "#fff";
    ctx.fillText("Available Contracts", x + 20, y + 55);

    let by = y + 85;
    for (const q of QUESTS) {
      const alreadyDone = state.quests?.completed?.includes(q.id);
      if (alreadyDone) continue;

      const requirementMet = !q.requiresQuestID || state.quests?.completed?.includes(q.requiresQuestID);
      
      if (!requirementMet) continue;

      ctx.font = "15px system-ui";
      ctx.fillStyle = "#fff";
      ctx.fillText(q.title, x + 20, by);

      ctx.font = "13px system-ui";
      ctx.fillStyle = "rgba(255,255,255,0.72)";
      wrapText(ctx, q.desc, x + 20, by + 20, 240, 16);

      buttons.push({
        id: `accept:${q.id}`,
        label: "Accept",
        x: x + 280,
        y: by - 2,
        w: 120,
        h: 28,
        disabled: false,
      });

      by += 78;
    }
  }

  state.ui.navigatorButtons = buttons;

  for (const b of buttons) {
    const hover = isInside(mx, my, b);

    ctx.fillStyle = b.disabled
      ? "rgba(120,120,120,0.12)"
      : hover
        ? "rgba(255,255,255,0.18)"
        : "rgba(255,255,255,0.08)";
    ctx.fillRect(b.x, b.y, b.w, b.h);

    ctx.strokeStyle = "rgba(255,255,255,0.30)";
    ctx.strokeRect(b.x, b.y, b.w, b.h);

    ctx.fillStyle = b.disabled ? "rgba(255,255,255,0.45)" : "#fff";
    ctx.font = "15px system-ui";
    ctx.fillText(b.label, b.x + 10, b.y + 6);
  }

  ctx.restore();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  if (!text) return;

  const words = text.split(" ");
  let line = "";
  let lineY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const width = ctx.measureText(testLine).width;

    if (width > maxWidth && line) {
      ctx.fillText(line, x, lineY);
      line = word;
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    ctx.fillText(line, x, lineY);
  }
}
