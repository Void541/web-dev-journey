// src/lootTable.js

function rand() {
  return Math.random();
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

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

function rollEntries(entries) {
  const out = {};

  for (const e of entries) {
    const p = e.p ?? 1;
    if (rand() > p) continue;

    const min = e.min ?? 1;
    const max = e.max ?? min;
    const amt = Math.floor(min + rand() * (max - min + 1));

    if (amt > 0) {
      out[e.id] = (out[e.id] ?? 0) + amt;
    }
  }

  return out;
}

function mergeLoot(a, b) {
  const out = { ...(a || {}) };

  for (const [k, v] of Object.entries(b || {})) {
    if (k === "__rarity") continue;
    out[k] = (out[k] ?? 0) + v;
  }

  return out;
}

export function createLootTable(cfg = {}) {
  const C = {
    rarityWeights: cfg.rarityWeights ?? [
      { id: "common", w: 68 },
      { id: "uncommon", w: 22 },
      { id: "rare", w: 8 },
      { id: "epic", w: 2 },
    ],

    // Early game: die 4 Basisressourcen sollen regelmäßig vorkommen
    baseMats: cfg.baseMats ?? [
      { id: "wood",  min: 1, max: 3, p: 0.95 },
      { id: "scrap", min: 1, max: 2, p: 0.82 },
      { id: "cloth", min: 0, max: 1, p: 0.42 },
      { id: "tech",  min: 0, max: 1, p: 0.12 },
    ],

    specialPools: cfg.specialPools ?? {
      common: [
        { id: "wood",  min: 1, max: 2, p: 0.55 },
        { id: "scrap", min: 1, max: 2, p: 0.45 },
        { id: "cloth", min: 1, max: 1, p: 0.35 },
      ],
      uncommon: [
        { id: "cloth", min: 1, max: 2, p: 0.70 },
        { id: "tech",  min: 1, max: 1, p: 0.30 },
        { id: "powder", min: 0, max: 1, p: 0.35 },
      ],
      rare: [
        { id: "cloth", min: 1, max: 2, p: 0.65 },
        { id: "tech",  min: 1, max: 2, p: 0.65 },
        { id: "gear",  min: 0, max: 1, p: 0.45 },
      ],
      epic: [
        { id: "tech", min: 2, max: 3, p: 0.85 },
        { id: "gear", min: 1, max: 2, p: 0.70 },
        { id: "blueprint", min: 1, max: 1, p: 0.35 },
      ],
    },

    byType: cfg.byType ?? {
      basic: {
        rolls: 1,
        matMul: 1.0,
        specialChance: 0.22,
        gold: 2,
      },

      rammer: {
        rolls: 1,
        matMul: 1.05,
        specialChance: 0.18,
        gold: 2,
      },

      tank: {
        rolls: 2,
        matMul: 1.35,
        specialChance: 0.24,
        gold: 4,
        bonusLoot: [
          { id: "scrap", min: 1, max: 2, p: 0.75 },
        ],
      },

      sniper: {
        rolls: 1,
        matMul: 1.0,
        specialChance: 0.24,
        gold: 3,
        bonusLoot: [
          { id: "tech", min: 0, max: 1, p: 0.30 },
        ],
      },

      disabler: {
        rolls: 1,
        matMul: 1.05,
        specialChance: 0.28,
        gold: 3,
        bonusLoot: [
          { id: "cloth", min: 1, max: 2, p: 0.55 },
        ],
      },
    },

    admiral: cfg.admiral ?? {
      matMul: 2.2,
      extraRolls: 2,
      guaranteed: [
        { id: "cloth", min: 1, max: 2, p: 1.0 },
        { id: "tech", min: 1, max: 2, p: 1.0 },
      ],
      extraGold: 10,
      specialChanceBonus: 0.30,
    },
  };

  function scaleLoot(loot, mul) {
    const out = {};

    for (const [k, v] of Object.entries(loot || {})) {
      out[k] = Math.max(0, Math.round(v * mul));
    }

    return out;
  }

  function rollForEnemy(enemy) {
    const type = enemy?.type ?? "basic";
    const tcfg = C.byType[type] ?? C.byType.basic;

    let loot = rollEntries(C.baseMats);

    if (tcfg.bonusLoot) {
      loot = mergeLoot(loot, rollEntries(tcfg.bonusLoot));
    }

    let rarity = "common";
    const totalRolls = clamp(
      (tcfg.rolls ?? 1) + (enemy?.isAdmiral ? C.admiral.extraRolls : 0),
      1,
      6
    );

    for (let i = 0; i < totalRolls; i++) {
      const extra = rollEntries([
        { id: "wood",  min: 0, max: 2, p: 0.60 },
        { id: "scrap", min: 0, max: 2, p: 0.50 },
        { id: "cloth", min: 0, max: 1, p: 0.30 },
        { id: "tech",  min: 0, max: 1, p: 0.10 },
      ]);

      loot = mergeLoot(loot, extra);

      const specialChance =
        (tcfg.specialChance ?? 0) +
        (enemy?.isAdmiral ? C.admiral.specialChanceBonus : 0);

      if (rand() < specialChance) {
        const rolledRarity = pickWeighted(C.rarityWeights).id;
        const pool = C.specialPools[rolledRarity] ?? [];
        loot = mergeLoot(loot, rollEntries(pool));
        rarity = rolledRarity;
      }
    }

    if (enemy?.isAdmiral) {
      loot = mergeLoot(loot, rollEntries(C.admiral.guaranteed));
    }

    const totalMul =
      (tcfg.matMul ?? 1.0) * (enemy?.isAdmiral ? C.admiral.matMul : 1.0);

    loot = scaleLoot(loot, totalMul);

    const gold =
      (tcfg.gold ?? 1) +
      (enemy?.isAdmiral ? C.admiral.extraGold : 0);

    return { loot, gold, rarity };
  }

  return { rollForEnemy };
}