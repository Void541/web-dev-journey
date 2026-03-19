export function createInput() {
  const down = new Set();
  const pressed = new Set(); // one-frame press

  const mouse = {
    x: 0,
    y: 0,
    down: false,
    pressed: false
  };

  function onKeyDown(e) {
    const key = e.key.toLowerCase();
    if (!down.has(key)) pressed.add(key);
    down.add(key);
  }

  function onKeyUp(e) {
    down.delete(e.key.toLowerCase());
  }

  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  function onMouseDown() {
    mouse.down = true;
    mouse.pressed = true;
  }

  function onMouseUp() {
    mouse.down = false;
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);

  return {
    isDown(key) { return down.has(key.toLowerCase()); },
    wasPressed(key) { return pressed.has(key.toLowerCase()); },

    mouse,

    mousePressed() {
      return mouse.pressed;
    },

    endFrame() {
      pressed.clear();
      mouse.pressed = false;
    },

    destroy() {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);

      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    }
  };
}