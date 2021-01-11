class StorageMock {
    storage;
    available;

    constructor() {
        this.storage = {};
        this.available = true;
    }

    isAvailable() {
        return this.available;
    }

    get(key) {
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

    set(key, value, options = {}) {
        if (!this.available) {
            return;
        }

        this.storage[key] = JSON.stringify({
            value,
            expires: options.expires,
        });

        return this.storage;
    }

    getRaw(key) {
        if (this.available) {
            return this.storage[key];
        }
    }

    remove(key) {
        if (this.available) {
            delete this.storage[key];
            return this.storage;
        }
    }
}

export const local = new StorageMock();
export const session = new StorageMock();
