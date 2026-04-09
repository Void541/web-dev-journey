export const QUESTS = [
  {
    id: "kill5",
    title: "Clear the Outer Lane",
    desc: "Raider scouts have been harassing ships near the West Relay. Clear out 5 hostile ships so local traffic can move safely again.",
    type: "kills",
    target: 5,
    reward: { gold: 10, scrap: 2 },
    nextQuestID: "admiral1",
  },
  {
    id: "scrap10",
    title: "Recover Field Salvage",
    desc: "The hangar crew needs usable scrap from the Outer Lane to keep ships flying. Recover 10 units of salvage from the nearby sector and bring the haul back.",
    type: "resource",
    resource: "scrap",
    target: 10,
    reward: { gold: 8, tech: 1 },
  },
  {
    id: "admiral1",
    title: "Break the Raider Command Ship",
    desc: "The scout patrol was only a screen. A hostile admiral has entered the sector near the West Relay to punish the disruption. Destroy the command ship before it regroups the raiders.",
    type: "admiral",
    target: 1,
    reward: { gold: 20, tech: 1 },
    requiresQuestID: "kill5",
  },
];
