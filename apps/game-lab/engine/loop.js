export function startLoop({ update, render }) {
  let last = performance.now();
  let paused = false;

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); // clamp
    last = now;

    if (!paused) update(dt);
    render();

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  return {
    togglePause() { paused = !paused; },
    setPaused(v) { paused = Boolean(v); },
    isPaused() { return paused; }
  };
}