// src/lootTable.js

// Kleine Helpers
function rand() { return Math.random(); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// Weighted random (z.B. rarity)
function pickWeighted(items) {
  let sum = 0;
  for (const it of items) sum += it.w;
  let r = rand() * sum;
  for (const it of items) {
    r -= it.w;
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

// Rollt mehrere mögliche Drops aus einer Liste
// entries: [{id:"wood", min:1, max:3, p:0.8}, ...]
function rollEntries(entries) {
  const out = {};
  for (const e of entries) {
    const p = e.p ?? 1;
    if (rand() > p) continue;

    const min = e.min ?? 1;
    const max = e.max ?? min;
    const amt = Math.floor(min + rand() * (max - min + 1));

    if (amt > 0) out[e.id] = (out[e.id] ?? 0) + amt;
  }
  return out;
}

// Merge helper
function mergeLoot(a, b) {
  const out = { ...(a || {}) };
  for (const [k, v] of Object.entries(b || {})) {
    out[k] = (out[k] ?? 0) + v;
  }
  return out;
}

/**
 * LootTable-Konzept:
 * - Gold: gibt’s sofort on kill (nicht im Wreck)
 * - Wreck Loot: Materialien/Items zum Salvagen
 *
 * Enemy-Type bestimmt:
 * - base materials
 * - chance für “special drop”
 * - rolls count (mehr rolls = mehr loot variety)
 */
export function createLootTable(cfg = {}) {
  const C = {
    // Rarity weights (mehr = häufiger)
    rarityWeights: cfg.rarityWeights ?? [
      { id: "common",   w: 70 },
      { id: "uncommon", w: 22 },
      { id: "rare",     w: 7  },
      { id: "epic",     w: 1  },
    ],

    // Global base mats (fast immer)
    baseMats: cfg.baseMats ?? [
      { id: "wood",  min: 1, max: 3, p: 0.95 },
      { id: "scrap", min: 0, max: 2, p: 0.85 },
    ],

    // Per rarity: “special pool” (seltene Items)
    specialPools: cfg.specialPools ?? {
      common: [
        { id: "cloth", min: 0, max: 1, p: 0.25 },
      ],
      uncommon: [
        { id: "cloth",   min: 1, max: 2, p: 0.65 },
        { id: "powder",  min: 0, max: 1, p: 0.40 },
      ],
      rare: [
        { id: "powder",  min: 1, max: 2, p: 0.70 },
        { id: "gear",    min: 0, max: 1, p: 0.45 },
      ],
      epic: [
        { id: "gear",     min: 1, max: 2, p: 0.75 },
        { id: "blueprint",min: 1, max: 1, p: 0.35 }, // super selten
      ],
    },

    // Enemy-Type Tuning
    byType: cfg.byType ?? {
      basic: {
        rolls: 1,
        matMul: 1.0,
        specialChance: 0.10,
      },
      rammer: {
        rolls: 1,
        matMul: 1.1,
        specialChance: 0.12,
      },
      tank: {
        rolls: 2,
        matMul: 1.4,
        specialChance: 0.18,
      },
      sniper: {
        rolls: 1,
        matMul: 1.0,
        specialChance: 0.16,
      },
      disabler: {
        rolls: 1,
        matMul: 1.0,
        specialChance: 0.20,
      },
    },
  };

  function scaleLoot(loot, mul) {
    const out = {};
    for (const [k, v] of Object.entries(loot || {})) {
      // mats skalieren (runde “gamey”)
      out[k] = Math.max(0, Math.round(v * mul));
    }
    return out;
  }

  /**
   * Return: { loot: {...}, rarity: "common"|"uncommon"|..., gold: number }
   * gold kannst du separat on-kill geben (empfohlen).
   */
  function rollForEnemy(enemy) {
    const type = enemy?.type ?? "basic";
    const tcfg = C.byType[type] ?? C.byType.basic;

    // 1) Base mats
    let loot = rollEntries(C.baseMats);

    // 2) Extra rolls (mehr variety)
    const rolls = clamp(tcfg.rolls ?? 1, 1, 4);
    for (let i = 0; i < rolls; i++) {
      // etwas “zusätzliche mats”
      const extra = rollEntries([
        { id: "wood",  min: 0, max: 2, p: 0.65 },
        { id: "scrap", min: 0, max: 2, p: 0.55 },
      ]);
      loot = mergeLoot(loot, extra);

      // special chance
      if (rand() < (tcfg.specialChance ?? 0)) {
        const r = pickWeighted(C.rarityWeights).id;
        const pool = C.specialPools[r] ?? [];
        loot = mergeLoot(loot, rollEntries(pool));
        // optional: rarity meta nur fürs UI (wenn du willst)
        loot.__rarity = r;
      }
    }

    // 3) Type scaling (Tank gibt mehr mats)
    loot = scaleLoot(loot, tcfg.matMul ?? 1.0);

    // 4) Gold (instant)
    // (optional) du kannst das später aus enemyStats ziehen
    const baseGold =
      type === "tank" ? 4 :
      type === "sniper" ? 3 :
      type === "disabler" ? 3 :
      type === "rammer" ? 2 : 1;

    const gold = baseGold;

    return { loot, gold, rarity: loot.__rarity ?? "common" };
  }

  return { rollForEnemy };
}