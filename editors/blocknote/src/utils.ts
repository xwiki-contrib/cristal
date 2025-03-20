function debounce<T>(func: (arg: T) => unknown): (arg: T) => void {
  let running = false;

  const debounced = (arg: T) => {
    if (running) {
      return;
    }

    running = true;

    try {
      func(arg);
    } catch (e) {
      console.error(e);
    }

    running = false;
  };

  return debounced;
}

function stringToColor(str: string, prc?: number) {
  // Check for optional lightness/darkness
  prc = prc ?? -10;

  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const rgba =
    ((hash >> 24) & 0xff).toString(16) +
    ((hash >> 16) & 0xff).toString(16) +
    ((hash >> 8) & 0xff).toString(16) +
    (hash & 0xff).toString(16);

  const num = parseInt(rgba, 16),
    amt = Math.round(2.55 * prc),
    R = (num >> 16) + amt,
    G = ((num >> 8) & 0x00ff) + amt,
    B = (num & 0x0000ff) + amt;

  const comp =
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255);

  return comp.toString(16).slice(1);
}

export { debounce, stringToColor };
