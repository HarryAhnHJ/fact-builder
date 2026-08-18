// Minimal observable store (zustand-style, no dependencies).
export function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();
  return {
    get: () => state,
    set(updater) {
      state = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
      for (const fn of [...listeners]) fn(state);
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
