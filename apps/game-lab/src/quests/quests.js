export const QUESTS = [
  {
    id: "kill5",
    title: "Sink 5 ships",
    desc: "The seas are dangerous, but someone has to do the dirty work. Sink 5 enemy ships to earn your reward.",
    type: "kills",
    target: 5,
    reward: { gold: 10, cloth: 2 },
  },
  {
    id: "wood10",
    title: "Gather 10 wood",
    desc: "The dockmaster needs materials to maintain the docks. Gather 10 wood to help out and earn a reward.",
    type: "resource",
    resource: "wood",
    target: 10,
    reward: { gold: 8, scrap: 2 },
  },
  {
    id: "admiral1",
    title: "Defeat an Admiral",
    desc: "Admirals are powerful foes that threaten our waters. Defeat one to prove your strength and earn a valuable reward.",
    type: "admiral",
    target: 1,
    reward: { gold: 20, tech: 1 },
  },
];