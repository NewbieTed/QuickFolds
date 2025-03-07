


if (typeof localStorage === "undefined" || localStorage === null) {
  const obj = (globalThis as any).localStorage = {
    store: {} as Record<string, string>,

    getItem(key: string) {
      return this.store.hasOwnProperty(key) ? this.store[key] : null;
    },

    setItem(key: string, value: string) {
      this.store[key] = String(value);
    },

    removeItem(key: string) {
      delete this.store[key];
    },

    clear() {
      this.store = {};
    },

    key(index: number) {
      return Object.keys(this.store)[index] || null;
    },

    get length() {
      return Object.keys(this.store).length;
    }
  };

  obj.setItem("currentOrigamiIdForEditor", "0");
}
