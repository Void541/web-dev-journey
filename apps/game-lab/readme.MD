# Web Dev Journey - Fabian Materna

Hi, I'm Fabian.
I'm an aspiring web developer currently focused on improving my HTML, CSS, and JavaScript skills.

This repository documents my learning journey through personal projects and continuous iteration.

---

## Game Lab - Browser Game

A self-built browser game focused on gameplay systems, combat logic, and modular game structure.

### Features
- Player movement
- Enemies and combat
- Collision handling
- UI / HUD
- Resource systems
- Crafting and upgrades

Live demo:
https://void541.github.io/web-dev-journey/apps/game-lab/

Code:
https://github.com/Void541/web-dev-journey

### Player Progress Persistence

The browser sends player data to `POST /save-loadout`. The server updates the
player document in MongoDB. Saving requires a logged-in account (`playerId`).

The saved data includes:

- Level, XP, available talent points, and allocated talents.
- Unlocked ships, weapons, and crew.
- Equipped ship, cannon loadout, active cannon slot, and crew selection.
- Inventory resources and credits.
- Active quest ID, completed quest IDs, normal/admiral kill counters, and the
  `firstAdmiralTriggered` event flag. Quest definitions remain in `QUESTS`.

On login, `applyAuthenticatedPlayer()` restores these fields. The XP threshold
for the next level is derived using `getXpToNext(level)` rather than stored:
`100 + (level - 1) * 50`.

#### Save Timing and Retries

`markProgressChanged()` increments an in-memory revision counter after a
persistent change. Enemy kills, salvaged loot, and successful crafting mark
changes for the periodic save check. Purchases, equipment changes, active slot
selection, and successful talent allocation also request an immediate save.
Accepting, abandoning, and claiming a quest mark changes through
`state.markProgressChanged()` for the periodic save check.

Every 10 seconds, the browser checks whether `revision > savedRevision`.
If changes are pending, it attempts to save. Only one request can run at a time.

Each request captures the revision and serializes the current player data before
waiting for the response. A successful HTTP response confirms only that captured
revision. Changes made during the request remain pending for a later save.
HTTP errors and network failures are logged, leave the confirmed revision
unchanged, and release the request lock so the next check can retry.
Retries resend the current state; they do not repeat purchases or deduct costs
again.

#### Resuming the Admiral Quest

`ensureQuestAdmiral()` runs after login data is restored, after entering a map,
and after an automatic quest transition. It acts only in the overworld when
`admiral1` is active and its goal is not complete. An existing local admiral is
reused. Otherwise, offline play spawns one locally; connected play sends the
current player mode and requests an admiral from the server. The server checks
for an existing admiral before spawning one.

The saved event flag records that the event was triggered, not that an admiral
still exists or has been defeated. It does not block replacing a missing enemy.
Enemy position and remaining HP are not persisted.

#### Verification and Open Limits

Isolated checks with simulated HTTP responses have covered save success, HTTP
503, network failure, automatic retries, and changes during an active request.
They also checked crafting success/failure, loot change marking, and level
threshold calculation. These were ad hoc checks, not a committed test suite.
Additional checks exercised quest menu actions and a combined accept, progress,
save, restore, transition, and final reward claim flow. The combined check used
the actual player schema and route logic with in-memory database substitutes,
simulated HTTP transport, and manually supplied gameplay counters. It also
checked restoring the event flag and replacing a missing offline admiral.

- A real MongoDB save followed by a fresh login has not yet been verified.
- Live multiplayer recovery, including reconnects and server restarts during
  an ongoing session, has not been verified. Recovery checks are not currently
  triggered by network reconnect events.
- There is no local backup or guaranteed final save when the page closes.
  Unsaved changes can be lost on reload, browser closure, or a crash.
- Failed saves currently appear only in the console, without an in-game status.
- Revision counters are local to one page session. They do not prevent conflicts
  between tabs or devices, and account switching needs separate handling.
- The save endpoint currently trusts client-supplied state and a player ID;
  authenticated ownership checks and server-side progression validation remain
  necessary before treating it as a public MMO persistence system.

Relevant implementation: `main.js`, `src/systems/levels.js`,
`src/multiplayer-server/server.js`, and
`src/multiplayer-server/models/Player.js`.

---

## Portfolio

Personal portfolio page:

https://void541.github.io/web-dev-journey/apps/portfolio/

---

## Technologies

- HTML
- CSS
- JavaScript (Vanilla)
- Git / GitHub

---

## Goal

My goal is to keep improving as a web developer and gain practical experience through increasingly structured projects.

---

## 📫 Kontakt

GitHub: https://github.com/Void541
