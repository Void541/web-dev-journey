export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
function pushOutCircleCircle(ax, ay, ar, bx, by, br) {
  const dx = ax - bx;
  const dy = ay - by;
  const d = Math.hypot(dx, dy) || 1e-6;
  const minD = ar + br;
  if (d >= minD) return { x: ax, y: ay, hit: false };

  const nx = dx / d;
  const ny = dy / d;
  const push = (minD - d);

  return { x: ax + nx * push, y: ay + ny * push, hit: true };
}