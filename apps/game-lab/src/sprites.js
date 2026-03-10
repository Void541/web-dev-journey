    // src/sprites.js
export function createSpriteManager() {
  const images = new Map();

  function load(key, src) {
    const img = new Image();
    img.src = src;
    images.set(key, {
      img,
      loaded: false,
      error: false,
    });

    img.onload = () => {
      const entry = images.get(key);
      if (entry) entry.loaded = true;
    };

    img.onerror = () => {
      const entry = images.get(key);
      if (entry) entry.error = true;
      console.warn(`Sprite failed to load: ${key} -> ${src}`);
    };
  }

  function has(key) {
    const entry = images.get(key);
    return !!entry?.loaded;
  }

  function draw(ctx, key, x, y, w, h, angle = 0) {
    const entry = images.get(key);
    if (!entry || !entry.loaded) return false;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.drawImage(entry.img, -w / 2, -h / 2, w, h);
    ctx.restore();
    return true;
  }

  return {
    load,
    has,
    draw,
  };
}
