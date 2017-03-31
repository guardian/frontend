// @flow

/* eslint no-plusplus: 0 */

import storage from 'lib/storage';

const prefix = `gu.prefs`;

// #? Instead of any we could use the class object type, but we want to
// refactor it anyway, let's keep it for now
const getStorage = (options): any => {
    const { type = 'local' } = options;
    return storage[type];
};

const buildKey = (name: string): string => `${prefix}.switch.${name}`;

const set = (name: string, value: any, options?: Object = {}): void => {
    getStorage(options).set(prefix + name, value);
};

const get = (name: string, options?: Object = {}): any =>
    getStorage(options).get(prefix + name);

const remove = (name: string, options?: Object = {}): void => {
    getStorage(options).remove(prefix + name);
};

const switchOn = (name: string, options?: Object = {}): void => {
    getStorage(options).set(buildKey(name), true);
};

const switchOff = (name: string, options?: Object = {}): void => {
    getStorage(options).set(buildKey(name), false);
};

const removeSwitch = (name: string, options?: Object = {}): void => {
    getStorage(options).remove(buildKey(name));
};

const isOn = (name: string, options?: Object = {}): boolean =>
    getStorage(options).get(buildKey(name)) === true;

const isOff = (name: string, options?: Object = {}): boolean =>
    getStorage(options.type).get(buildKey(name)) === false;

const isNumeric = (str: any): boolean => !isNaN(str);

const isBoolean = (str: any): boolean => str === 'true' || str === 'false';

const setPrefs = (location: Object): void => {
    const query = location.hash.substr(1).split('&');
    const matcher = new RegExp(`^gu.prefs.(.*)=(.*)$`);
    const setKey = (param: string): void => {
        const match = param.match(matcher);

        if (match) {
            const key = match[0];
            let val = match[1];

            switch (key) {
                case 'switchOn':
                    switchOn(val);
                    break;

                case 'switchOff':
                    switchOff(val);
                    break;

                default:
                    if (isNumeric(val)) {
                        // +val casts any number from a string
                        val = +val;
                    } else if (isBoolean(val)) {
                        // String(val) === "true" converts a string to bool
                        val = String(val).toLowerCase() === 'true';
                    }

                    set(key, val);
            }
        }
    };

    query.forEach(setKey);
};

setPrefs(window.location);

export default {
    set,
    get,
    remove,
    switchOn,
    switchOff,
    removeSwitch,
    isOn,
    isOff,
    setPrefs,
};
