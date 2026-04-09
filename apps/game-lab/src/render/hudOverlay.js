// src/hudOverlay.js
const STORAGE_KEYS = {
  player: "hud_pos_player_panel",
  target: "hud_pos_target_panel",
  hotbar: "hud_pos_hotbar_panel",
  shipyard: "hud_pos_shipyard_panel",
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
  if (!panel) return;

  const handle = panel.querySelector(".hud-drag-handle");
  if (!handle) return;

  const saved = loadPos(storageKey);
  if (saved) {
    panel.style.left = `${saved.x}px`;
    panel.style.top = `${saved.y}px`;
    panel.style.right = "auto";
    panel.style.bottom = "auto";
    panel.style.transform = "none";
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
    panel.style.bottom = "auto";
    panel.style.transform = "none";
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

    scrap: document.getElementById("hud-scrap"),
    tech: document.getElementById("hud-tech"),
    gear: document.getElementById("hud-gear"),

    playerPanel: document.getElementById("player-panel"),
    playerName: document.getElementById("player-name"),
    playerLevel: document.getElementById("player-level"),
    playerXpFill: document.getElementById("player-xp-fill"),
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
    skillsBtn: document.getElementById("hotbar-skills"),
    craftBtn: document.getElementById("hotbar-craft"),

    shipyardPanel: document.getElementById("shipyard-panel"),
    upgradeCannon: document.getElementById("upgrade-cannon"),
    upgradeHull: document.getElementById("upgrade-hull"),
    upgradeSail: document.getElementById("upgrade-sail"),

    levelCannon: document.getElementById("level-cannon"),
    levelHull: document.getElementById("level-hull"),
    levelSail: document.getElementById("level-sail"),

    statCannon: document.getElementById("stat-cannon"),
    statHull: document.getElementById("stat-hull"),
    statSail: document.getElementById("stat-sail"),

    costCannon: document.getElementById("cost-cannon"),
    costHull: document.getElementById("cost-hull"),
    costSail: document.getElementById("cost-sail"),
  };

  makeDraggable(els.playerPanel, STORAGE_KEYS.player);
  makeDraggable(els.targetPanel, STORAGE_KEYS.target);
  makeDraggable(els.hotbarPanel, STORAGE_KEYS.hotbar);
  makeDraggable(els.shipyardPanel, STORAGE_KEYS.shipyard);

  if (els.repairBtn) {
    els.repairBtn.addEventListener("click", () => {
      window.__gameActions?.toggleRepair?.();
    });
  }

  if (els.salvageBtn) {
    els.salvageBtn.addEventListener("click", () => {
      window.__gameActions?.holdSalvage?.();
    });
  }

  if (els.shootBtn) {
    els.shootBtn.addEventListener("click", () => {
      window.__gameActions?.shootTarget?.();
    });
  }

  if (els.skillsBtn) {
    els.skillsBtn.addEventListener("click", () => {
      window.__gameActions?.toggleSkills?.();
    });
  }

  if (els.craftBtn) {
    els.craftBtn.classList.remove("hotbar-disabled");
    els.craftBtn.addEventListener("click", () => {
      window.__gameActions?.toggleShipyard?.();
    });
  }

  if (els.upgradeCannon) {
    els.upgradeCannon.addEventListener("click", () => {
      window.__gameActions?.craft?.("cannonUpgrade");
    });
  }

  if (els.upgradeHull) {
    els.upgradeHull.addEventListener("click", () => {
      window.__gameActions?.craft?.("hullUpgrade");
    });
  }

  if (els.upgradeSail) {
    els.upgradeSail.addEventListener("click", () => {
      window.__gameActions?.craft?.("sailUpgrade");
    });
  }

  function update(state, target) {
    const inv = state.inventory ?? {};
    const gold = state.gold ?? 0;

    if (els.gold) els.gold.textContent = `Credits: ${gold}`;
    if (els.silver) els.silver.textContent = `Silver: ${state.silver ?? 0}`;
    if (els.tokens) els.tokens.textContent = `Tokens: ${state.tokens ?? 0}`;

    if (els.scrap) els.scrap.textContent = `Scrap: ${inv.scrap ?? 0}`;
    if (els.tech) els.tech.textContent = `Tech: ${inv.tech ?? 0}`;
    if (els.gear) els.gear.textContent = `Gear: ${inv.gear ?? 0}`;

    const php = Math.max(0, Math.ceil(state.player?.hp ?? 0));
    const pmax = Math.ceil(state.player?.maxHp ?? 1);
    const pratio = Math.max(0, Math.min(1, php / pmax));

    if (els.playerName) els.playerName.textContent = "Your Ship";
    if (els.playerLevel) els.playerLevel.textContent = `Level ${state.progression?.level ?? 1}`;
    if (els.playerXpFill) els.playerXpFill.style.width = `${((state.progression?.xp ?? 0) / (state.progression?.xpToNext ?? 100)) * 100}%`;
    if (els.playerHpFill) els.playerHpFill.style.width = `${pratio * 100}%`;
    if (els.playerHpText) els.playerHpText.textContent = `${php} / ${pmax}`;

    if (target) {
      const thp = Math.max(0, Math.ceil(target.hp ?? 0));
      const tmax = Math.ceil(target.maxHp ?? 1);
      const tratio = Math.max(0, Math.min(1, thp / tmax));

      if (els.targetName) els.targetName.textContent = target.name ?? target.type ?? "Enemy";
      if (els.targetHpFill) els.targetHpFill.style.width = `${tratio * 100}%`;
      if (els.targetHpText) els.targetHpText.textContent = `${thp} / ${tmax}`;
    } else {
      if (els.targetName) els.targetName.textContent = "No Target";
      if (els.targetHpFill) els.targetHpFill.style.width = "0%";
      if (els.targetHpText) els.targetHpText.textContent = "-";
    }

    const shipStats = state.shipStats ?? {};

    if (els.shipyardPanel) {
      const open = !!state.ui?.shipyardOpen;
      els.shipyardPanel.classList.toggle("hidden", !open);
    }

    if (els.levelCannon) {
      els.levelCannon.textContent = `Lv. ${shipStats.cannonLevel ?? 1}`;
    }

    if (els.levelHull) {
      els.levelHull.textContent = `Lv. ${shipStats.hullLevel ?? 1}`;
    }

    if (els.levelSail) {
      els.levelSail.textContent = `Lv. ${shipStats.sailLevel ?? 1}`;
    }

    if (els.statCannon) {
      els.statCannon.textContent = `Damage: ${(shipStats.getDamage?.() ?? 1).toFixed(1)}`;
    }

    if (els.statHull) {
      els.statHull.textContent = `Max HP: ${Math.round(shipStats.getMaxHp?.() ?? 10)}`;
    }

    if (els.statSail) {
      els.statSail.textContent = `Speed: ${Math.round(shipStats.getSpeed?.(260) ?? 260)}`;
    }

    const recipes = state.crafting?.recipes ?? {};

    function costText(recipe) {
      if (!recipes) return "";

      const costs = recipe.cost(state);

      return Object.entries(costs)
        .map(([r, a]) => `${a} ${r}`)
        .join(", ");
    }

    function canCraft(recipe) {
      if (!recipe) return false;

      const costs = recipe.cost(state);

      for (const [res, amount] of Object.entries(costs)) {
        if ((inv[res] ?? 0) < amount) return false;
      }
      return true;
    }

    if (els.upgradeCannon) {
      els.upgradeCannon.disabled = !canCraft(recipes.cannonUpgrade);
    }
    if(els.costCannon) {
      els.costCannon.textContent = costText(recipes.cannonUpgrade);
    }

    if (els.upgradeHull) {
      els.upgradeHull.disabled = !canCraft(recipes.hullUpgrade);
    }
    if(els.costHull) {
      els.costHull.textContent = costText(recipes.hullUpgrade);
    }

    if (els.upgradeSail) {
      els.upgradeSail.disabled = !canCraft(recipes.sailUpgrade);
    }
    if(els.costSail) {
      els.costSail.textContent = costText(recipes.sailUpgrade);
    }
  }

  return { update };
}
