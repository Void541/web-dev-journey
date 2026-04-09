# Game Lab Mini GDD

## Vision
Game Lab is a browser-based space shooter MMO-lite inspired by Dark Orbit.
Players pilot ships through contested sectors, fight alongside other players, explore dangerous zones, gather resources, craft upgrades, and grow into defined combat roles.

The goal is not to recreate Dark Orbit one-to-one.
The goal is to keep the strong space-combat fantasy while improving fairness, purpose, and world-building.

## Design Goals
- Shared world: Other players should feel present and relevant.
- Purpose: Quests, enemies, and zones should have a clear reason to exist.
- Fair progression: Power should come from play and decisions, not pay-to-win systems.
- Role identity: Classes should meaningfully change how the game is played.
- PvE first: Cooperative world-building comes before competitive PvP.

## Problems To Avoid
- Grind without story or context
- Overloaded menus
- Unsafe progression for weaker players
- PvP dominating every part of the game
- Progression that only increases numbers without changing playstyle

## First 30 Minutes
1. Intro sequence: explain who the player is and why this sector matters.
2. Flight tutorial: movement, aiming, firing, and repairing.
3. Ammo tutorial: teach basic ammo plus one or two alternate ammo types.
4. First exploration task: move through a safe nearby zone.
5. First gathering task: salvage or collect a simple resource.
6. First crafting contact: create a small consumable, module, or ammo pack.
7. Return to hub: meet core NPCs and understand the main loop.
8. First real PvE mission: a combat objective with story context.

## Core Pillars

### Shared World
The world should feel persistent and alive.
Important events, enemies, and players should exist in a common game space rather than only on each client.

### Meaningful Progression
Players should grow through ships, roles, gear, crafting, and choices.
Progression should unlock new ways to play, not only higher damage values.

### Role Identity
The first version can use classic roles:
- Tank
- Healer
- Damage Dealer

These can later evolve into more thematic class names.

### Purposeful PvE
PvE should be more than "kill X enemies."
Combat, gathering, exploration, and dungeons should all support the world fantasy.

### Controlled PvP
PvP should be rewarding, but it should not destroy the experience for newer players.
Safe zones, controlled PvP zones, or dedicated PvP activities should prevent the problems of old-school Dark Orbit.

## PvE Foundation

### Start Hub
A safe social space with the core NPCs needed for the early game.

Required hub functions:
- Quest giver
- Shop
- Crafting/workshop
- Class or ship mentor
- Dungeon or mission terminal
- Safe meeting point for players

Current implementation note:
The current in-game hub is still named Pirate Cove.
This should evolve into a more fitting sci-fi hub identity.

### Hub Identity: Mercenary Hangar
The working long-term hub identity is Mercenary Hangar.

Mercenary Hangar is a neutral or semi-neutral operations post at the edge of contested sectors.
It acts as the player's early home base and should feel like a practical staging ground for pilots, contractors, salvagers, and technicians.

Hub fantasy:
- safe starting location
- mission control point
- repair and upgrade location
- social gathering space
- preparation area before entering dangerous sectors

Atmosphere goals:
- functional rather than luxurious
- busy but readable
- grounded in sci-fi operations
- more like a frontier contract station than a pirate hideout

Suggested core NPC roles:
- Contract Officer
- Ship Technician
- Quartermaster
- Salvage Broker
- Hangar Mentor
- Gate Controller

Why this hub matters:
- gives the player a believable reason to start here
- supports story-driven quest handoff
- keeps early progression readable
- creates a strong identity beyond the original Dark Orbit inspiration

### First Outer Zone
A nearby low-risk zone connected to the hub.

Zone goals:
- Teach enemy combat
- Introduce resource gathering
- Reward exploration
- Show early world-building
- Include one low-pressure open-world admiral encounter

### First Quest Types
- Combat: defeat an enemy patrol with story context
- Exploration: reach or scan a location
- Gathering: collect salvage or ore
- Return: bring materials back to the hub
- Event support: help fight an admiral

### Admirals
Admirals are open-world elite enemies.
They should create spontaneous cooperative moments and feel like special encounters instead of normal enemies with inflated health.

### First Dungeon
A low-level captain from a stronger faction.

Dungeon goals:
- Teach early group play
- Provide a controlled loot source
- Introduce one simple mechanic beyond pure damage
- Show faction conflict in a more focused way

## PvP Direction
PvP should be a meaningful layer, not a constant punishment.

Planned direction:
- PvP-specific rewards
- PvP currency
- PvP-only weapons or modules
- Controlled PvP areas or modes
- Safer progression for newer players

## Technical Direction

### Short Term
- Keep the game playable in browser with low setup friction
- Improve the PvE foundation before adding more PvP complexity
- Move more world logic toward shared multiplayer systems

### Multiplayer Goal
The long-term target is a more server-authoritative shared world:
- shared enemy spawns
- shared enemy state
- shared events
- shared combat outcomes

## Roadmap

### Phase 1: PvE Base
- Clarify the start hub
- Improve the outer zone structure
- Add stronger story context to early quests
- Make the first admiral encounter feel intentional
- Improve tutorial flow

### Phase 2: Shared World
- Synchronize enemies between players
- Move enemy state to the server
- Introduce shared world events

### Phase 3: Role Identity
- Make roles/classes affect gameplay in visible ways
- Add early class-specific tools or abilities

### Phase 4: Dungeon Loop
- Build the first dungeon
- Define dungeon loot and rewards
- Connect dungeon play to progression

### Phase 5: Crafting and Progression
- Expand resources and recipes
- Add gear choices that change builds
- Make progression less linear

### Phase 6: PvP Layer
- Add structured PvP activities
- Add PvP currency and rewards
- Keep the game fair for newer players

## Immediate Build Priorities
These are the best next development targets based on the current codebase.

1. Define the current hub, outer zone, quests, and admiral systems as a clear early-game flow.
2. Move enemies toward shared multiplayer synchronization.
3. Improve the tutorial and opening mission structure.
4. Make the start hub safer and more purposeful.
5. Begin designing the first dungeon as a contained PvE milestone.

## Phase 1 Task Breakdown

### Hub
- Decide which current map or mode is the true start hub.
- List the NPCs the player must meet in the first session.
- Make the hub a no-PvP, low-pressure learning space.

### Outer Zone
- Define one clear beginner combat zone.
- Place resource nodes or salvage opportunities in that zone.
- Add one stronger enemy landmark or event.

### Quests
- Rewrite the first quests with story context.
- Ensure early quests teach one mechanic each.
- Avoid stacking too many systems in the first mission chain.

### Admirals
- Decide how admirals appear: timer, event trigger, or zone condition.
- Give the first admiral one readable mechanic.
- Make the reward feel worth grouping for.

### Tutorial
- Teach movement and aiming first.
- Introduce ammo and repair second.
- Introduce gathering/crafting third.
- End with a meaningful first mission instead of a pure tutorial checklist.

## Phase 1 Early Game Flow

### Current Working Hub
The current start hub is Pirate Cove.
The name can change later, but for now it already serves an important design role:
- safe introduction space
- player preparation area
- quest handoff location
- social anchor point before entering danger

For the current version, Pirate Cove should be treated as the official early-game hub.

### Current Working Start Zone
The current starting zone is the zone where the player first leaves the hub and begins active combat.
This zone should teach:
- basic movement in open space
- first combat encounters
- first enemy threat recognition
- first simple world navigation

It should feel like a controlled beginner sector, not a chaotic sandbox.

### First Questline
The early questline should turn the existing combat prototype into a more meaningful flow.

Suggested structure:

1. First Contact
The player accepts a first mission in Pirate Cove and is sent into the nearby sector to investigate enemy activity.

2. Patrol Cleanup
The player defeats a small number of basic enemies.
This keeps the current "kill X enemies" structure, but gives it context.

3. Field Recovery
The player is asked to recover or inspect something in the same zone.
This introduces exploration, salvage, or resource collection.

4. Admiral Trigger
The enemy patrol turns out to be part of a larger operation.
Defeating or completing the previous objective triggers the first admiral encounter.

5. Return To Hub
The player returns to Pirate Cove, turns in the mission, and gets the feeling that the world is larger than the first fight.

### First Admiral Encounter
The current admiral concept should become the first real early-game climax.

Design goals for the first admiral:
- feels stronger and more important than normal enemies
- is introduced through the questline, not randomly
- teaches that larger threats exist in the outer sectors
- encourages the idea of future cooperation

The first admiral does not need to be mechanically complex yet.
It just needs to feel memorable, readable, and worth defeating.

### Immediate Gameplay Loop Goal
The first playable loop should be:

1. Start in Pirate Cove
2. Accept first mission
3. Enter the nearby beginner zone
4. Fight basic enemies
5. Explore or collect one objective
6. Trigger the first admiral
7. Defeat the admiral
8. Return to Pirate Cove for reward and next direction

This loop is the current best target for turning the prototype into the first true game slice.

### Implemented Prototype Note
The current prototype already supports a first version of this loop:
- accept the first quest from the Navigator
- defeat the required basic enemies
- automatically trigger the admiral follow-up quest
- spawn the first admiral as a quest escalation event
- defeat the admiral
- return to the Navigator to claim the reward

This is the current foundation to improve rather than replace.

## Balance Notes

### Purpose
These notes define the early progression model for ships, weapons, enemies, and talents.
The goal is to avoid random number tweaking and instead give each value a clear gameplay reason.

### Early Ship Model
- Scout
  120 HP, 1.15 speed multiplier, 1 weapon slot
  Role: fast starter ship, low durability, good learning platform
- Striker
  180 HP, 1.0 speed multiplier, 2 weapon slots
  Role: early all-rounder and first real upgrade target
- Frigate
  260 HP, 0.88 speed multiplier, 3 weapon slots
  Role: heavier PvE ship with more staying power and more weapon flexibility

### Early Weapon Model
- Pulse Laser
  10 damage, 1.0 fire rate, 480 range
  Role: stable default weapon and baseline reference
- Heavy Laser
  24 damage, 0.45 fire rate, 560 range
  Role: slow, hard-hitting weapon for sturdier targets and bosses
- Burst Laser
  6 damage, 2.4 fire rate, 420 range
  Role: high-pressure sustained weapon with low per-shot impact

### Early Enemy Reference Values
- Raider Scout: 24 HP
- Raider Bruiser: 40 HP
- Raider Sniper: 18 HP
- First Admiral: 160 HP

These values are not final, but they create a readable early balance target for combat feel.

### Talent Scaling Notes
Current talent effects are spread across the runtime code and need cleanup.

Desired direction:
- Damage talent should give a small flat or controlled bonus per point
- HP talent should give a more noticeable survivability gain per point
- Speed talent should use a small multiplier bonus, not a full +100% step per point

Suggested target:
- Damage: +2 or +3 damage per point
- HP: +12 or +15 max HP per point
- Speed: +0.06 to +0.08 multiplier per point

### Progression Rules
- Ships define durability, speed class, and weapon slot count
- Weapons define combat style, not only raw upgrade order
- Talents provide fine tuning, not complete role replacement
- Crew should later act as support bonuses on top of ships and weapons
- Progression should unlock different playstyles, not only larger numbers

### Implementation Targets
When these values are applied in code, the main files to touch are:
- `src/systems/ships.js`
- `src/systems/cannons.js`
- `src/systems/playerCombat.js`
- `main.js`
- `src/ui/workshop.js`

### Next Balance Pass
The next implementation pass should:
1. align ship HP, speed, and slot values with this table
2. align weapon damage, fire rate, and range values with this table
3. reduce the current speed talent scaling
4. review enemy HP so early combat time-to-kill feels intentional
