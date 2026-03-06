// src/hudOverlay.js
const STORAGE_KEYS = {
  player: "hud_pos_player_panel",
  target: "hud_pos_target_panel",
};

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function savePos(key, x, y) {
  localStorage.setItem(key, JSON.stringify({ x, y }));
}

function loadPos(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function makeDraggable(panel, storageKey) {
  const handle = panel.querySelector(".hud-drag-handle");
  if (!handle) return;

  const saved = loadPos(storageKey);
  if (saved) {
    panel.style.left = `${saved.x}px`;
    panel.style.top = `${saved.y}px`;
    panel.style.right = "auto";
  }

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  handle.addEventListener("mousedown", (e) => {
    dragging = true;
    const rect = panel.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    handle.style.cursor = "grabbing";
    e.preventDefault();
  });

  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    const maxX = window.innerWidth - panel.offsetWidth - 8;
    const maxY = window.innerHeight - panel.offsetHeight - 8;

    const x = clamp(e.clientX - offsetX, 8, maxX);
    const y = clamp(e.clientY - offsetY, 8, maxY);

    panel.style.left = `${x}px`;
    panel.style.top = `${y}px`;
    panel.style.right = "auto";
  });

  window.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    handle.style.cursor = "grab";

    const rect = panel.getBoundingClientRect();
    savePos(storageKey, rect.left, rect.top);
  });
}

export function createHudOverlay() {
  const els = {
    gold: document.getElementById("hud-gold"),
    silver: document.getElementById("hud-silver"),
    tokens: document.getElementById("hud-tokens"),

    wood: document.getElementById("hud-wood"),
    scrap: document.getElementById("hud-scrap"),
    cloth: document.getElementById("hud-cloth"),
    tech: document.getElementById("hud-tech"),
    powder: document.getElementById("hud-powder"),
    gear: document.getElementById("hud-gear"),

    playerPanel: document.getElementById("player-panel"),
    playerName: document.getElementById("player-name"),
    playerHpFill: document.getElementById("player-hp-fill"),
    playerHpText: document.getElementById("player-hp-text"),

    targetPanel: document.getElementById("target-panel"),
    targetName: document.getElementById("target-name"),
    targetHpFill: document.getElementById("target-hp-fill"),
    targetHpText: document.getElementById("target-hp-text"),

    hotbarPanel: document.getElementById("hotbar-panel"),

    shootBtn: document.getElementById("hotbar-shoot"),
    repairBtn: document.getElementById("hotbar-repair"),
    salvageBtn: document.getElementById("hotbar-salvage"),
    craftBtn: document.getElementById("hotbar-craft"),
  };

  makeDraggable(els.playerPanel, STORAGE_KEYS.player);
  makeDraggable(els.targetPanel, STORAGE_KEYS.target);
  makeDraggable(els.hotbarPanel, STORAGE_KEYS.hotbar);

  if (els.repairBtn) {
  els.repairBtn.addEventListener("click", () => {
    if (typeof window !== "undefined" && window.__gameActions?.toggleRepair) {
      window.__gameActions.toggleRepair();
    }
  });
}

if (els.salvageBtn) {
  els.salvageBtn.addEventListener("click", () => {
    if (typeof window !== "undefined" && window.__gameActions?.holdSalvage) {
      window.__gameActions.holdSalvage();
    }
  });
}

if (els.shootBtn) {
  els.shootBtn.addEventListener("click", () => {
    if (typeof window !== "undefined" && window.__gameActions?.shootTarget) {
      window.__gameActions.shootTarget();
    }
  });
}



  function update(state, target) {
    const inv = state.inventory ?? {};
    const gold = state.gold ?? 0;

    if (els.gold) els.gold.textContent = `Gold: ${gold}`;
    if (els.silver) els.silver.textContent = `Silver: ${state.silver ?? 0}`;
    if (els.tokens) els.tokens.textContent = `Tokens: ${state.tokens ?? 0}`;

    if (els.wood) els.wood.textContent = `Wood: ${inv.wood ?? 0}`;
    if (els.scrap) els.scrap.textContent = `Scrap: ${inv.scrap ?? 0}`;
    if (els.cloth) els.cloth.textContent = `Cloth: ${inv.cloth ?? 0}`;
    if (els.tech) els.tech.textContent = `Tech: ${inv.tech ?? 0}`;
    if (els.powder) els.powder.textContent = `Powder: ${inv.powder ?? 0}`;
    if (els.gear) els.gear.textContent = `Gear: ${inv.gear ?? 0}`;

    const php = state.player?.hp ?? 0;
    const pmax = state.player?.maxHp ?? 1;
    const pratio = Math.max(0, Math.min(1, php / pmax));

    if (els.playerName) els.playerName.textContent = "Your Ship";
    if (els.playerHpFill) els.playerHpFill.style.width = `${pratio * 100}%`;
    if (els.playerHpText) els.playerHpText.textContent = `${php} / ${pmax}`;

    if (target) {
      const thp = target.hp ?? 0;
      const tmax = target.maxHp ?? 1;
      const tratio = Math.max(0, Math.min(1, thp / tmax));

      if (els.targetName) els.targetName.textContent = target.name ?? target.type ?? "Enemy";
      if (els.targetHpFill) els.targetHpFill.style.width = `${tratio * 100}%`;
      if (els.targetHpText) els.targetHpText.textContent = `${thp} / ${tmax}`;
    } else {
      if (els.targetName) els.targetName.textContent = "No Target";
      if (els.targetHpFill) els.targetHpFill.style.width = `0%`;
      if (els.targetHpText) els.targetHpText.textContent = "-";
    }
  }

  return { update };
}