// @flow

/* eslint consistent-return: 0, no-plusplus: 0 */

class Storage {
    constructor(type: string) {
        this.type = type;
        this.storage = window[type];
        this.available = undefined;
    }

    setWindow(win) {
        this.storage = win[this.type];
    }

    isAvailable() {
        const key = 'local-storage-module-test';

        if (this.available !== undefined) {
            return this.available;
        }

        try {
            // to fully test, need to set item
            // http://stackoverflow.com/questions/9077101/iphone-localstorage-quota-exceeded-err-issue#answer-12976988
            this.storage.setItem(key, 'graun');
            this.storage.removeItem(key);
            this.available = true;
        } catch (err) {
            this.available = false;
        }

        return this.available;
    }

    get(key: string) {
        if (!this.isAvailable()) {
            return;
        }

        let data;

        // try and parse the data
        try {
            data = JSON.parse(this.storage.getItem(key));
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

    set(key: string, value: any, options: ?Object = {}) {
        if (!this.isAvailable()) {
            return;
        }

        return this.storage.setItem(key, JSON.stringify({
            value,
            expires: options.expires,
        }));
    }

    getRaw(key: string) {
        if (this.isAvailable()) {
            return this.storage.getItem(key);
        }
    }

    remove(key: string) {
        if (this.isAvailable()) {
            return this.storage.removeItem(key);
        }
    }
}

export default {
    local: new Storage('localStorage'),
    session: new Storage('sessionStorage'),
};
