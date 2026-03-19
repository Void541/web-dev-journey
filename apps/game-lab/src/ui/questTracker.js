export function createQuestTracker(state) {
  const root = document.getElementById("questTracker");
  const title = document.getElementById("questTitle");
  const desc = document.getElementById("questDesc");
  const progress = document.getElementById("questProgress");
  const reward = document.getElementById("questReward");
  const drag = document.getElementById("questDrag");
  const close = document.getElementById("questClose");

  const ready =
    root &&
    title &&
    desc &&
    progress &&
    reward &&
    drag &&
    close;

  if (!ready) {
    console.warn("QuestTracker HTML elements not found.");
    return {
      update() {},
    };
  }

  let dragging = false;
  let offX = 0;
  let offY = 0;

  drag.addEventListener("mousedown", (e) => {
    dragging = true;
    offX = e.clientX - root.offsetLeft;
    offY = e.clientY - root.offsetTop;
  });

  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    root.style.left = `${e.clientX - offX}px`;
    root.style.top = `${e.clientY - offY}px`;
    root.style.right = "auto";
  });

  window.addEventListener("mouseup", () => {
    dragging = false;
  });

  close.onclick = () => {
    root.classList.add("hidden");
  };

  function update() {
  const quest = state.quests?.active ?? null;

  if (!quest || typeof quest !== "object") {
    root.classList.add("hidden");
    return;
  }

  root.classList.remove("hidden");

  title.textContent = quest.title ?? "Unknown Quest";
  desc.textContent = quest.desc ?? "";

  let prog = 0;
  const target = quest.target ?? 0;

  if (quest.type === "kills") {
    prog = state.progress?.kills ?? 0;
  } else if (quest.type === "admiral") {
    prog = state.progress?.admiralKills ?? 0;
  } else if (quest.type === "resource") {
    prog = state.inventory?.[quest.resource] ?? 0;
  }

  progress.textContent = `Progress: ${Math.min(prog, target)} / ${target}`;

  const rewardObj = quest.reward ?? {};
  const rewardText = Object.entries(rewardObj)
    .map(([k, v]) => `${v} ${k}`)
    .join(", ");

  reward.textContent = rewardText ? `Reward: ${rewardText}` : "Reward: -";
}

  return { update };
}