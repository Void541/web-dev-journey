export function createInput() {
  const down = new Set();
  const pressed = new Set(); // one-frame press

  function onKeyDown(e) {
    const key = e.key.toLowerCase();
    if (!down.has(key)) pressed.add(key);
    down.add(key);
  }

  function onKeyUp(e) {
    down.delete(e.key.toLowerCase());
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  return {
    isDown(key) { return down.has(key.toLowerCase()); },
    wasPressed(key) { return pressed.has(key.toLowerCase()); },
    endFrame() { pressed.clear(); },
    destroy() {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    }
  };
}