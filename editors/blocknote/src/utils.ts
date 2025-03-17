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

export { debounce };
