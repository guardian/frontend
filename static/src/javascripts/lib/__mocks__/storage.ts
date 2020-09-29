
class StorageMock {

  storage: any;

  available: boolean | null | undefined;

  constructor() {
    this.storage = {};
    this.available = true;
  }

  isAvailable(): boolean | null | undefined {
    return this.available;
  }

  get(key: string): any {
    if (!this.available) {
      return;
    }

    let data;

    // try and parse the data
    try {
      const value = this.getRaw(key);

      if (value === null || value === undefined) {
        return null;
      }

      data = JSON.parse(value);

      if (data === null) {
        return null;
      }
    } catch (e) {
      this.remove(key);
      return null;
    }

    // has it expired?
    if (data.expires && new Date() > new Date(data.expires)) {
      this.remove(key);
      return null;
    }

    return data.value;
  }

  set(key: string, value: any, options: Object = {}): any {
    if (!this.available) {
      return;
    }

    this.storage[key] = JSON.stringify({
      value,
      expires: options.expires
    });

    return this.storage;
  }

  getRaw(key: string): string | null | undefined {
    if (this.available) {
      return this.storage[key];
    }
  }

  remove(key: string): any {
    if (this.available) {
      delete this.storage[key];
      return this.storage;
    }
  }
}

export const local = new StorageMock();
export const session = new StorageMock();