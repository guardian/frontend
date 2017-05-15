// @flow
import { local, session } from 'lib/storage';

const storage = {
    local,
    session,
};
const storagePrefix = 'gu.prefs.';
const defaultOptions = {
    type: 'local',
};

type Options = {
    type?: 'local' | 'session',
};

const set = (name: string, value: any, options?: Options = {}): void => {
    storage[options.type || defaultOptions.type].set(
        storagePrefix + name,
        value
    );
};

const get = (name: string, options: Options = {}): any =>
    storage[options.type || defaultOptions.type].get(storagePrefix + name);

const remove = (name: string, options: Options = {}): void => {
    storage[options.type || defaultOptions.type].remove(storagePrefix + name);
};

const switchOn = (name: string, options: Options = {}): void => {
    storage[options.type || defaultOptions.type].set(
        `${storagePrefix}switch.${name}`,
        true
    );
};

const switchOff = (name: string, options: Options = {}): void => {
    storage[options.type || defaultOptions.type].set(
        `${storagePrefix}switch.${name}`,
        false
    );
};

const removeSwitch = (name: string, options: Options = {}): void => {
    storage[options.type || defaultOptions.type]
        .remove(`${storagePrefix}switch.${name}`);
};

const isOn = (name: string, options: Options = {}): boolean =>
    storage[options.type || defaultOptions.type]
        .get(`${storagePrefix}switch.${name}`) === true;

const isOff = (name: string, options: Options = {}): boolean =>
    storage[options.type || defaultOptions.type]
        .get(`${storagePrefix}switch.${name}`) === false;

const isNumeric = (str: string): boolean => !isNaN(str);

const isBoolean = (str: string): boolean => str === 'true' || str === 'false';

const setPrefs = (loc: { hash: string }): void => {
    const qs = loc.hash.substr(1).split('&');
    let i;
    let j;
    for ((i = 0), (j = qs.length); i < j; i += 1) {
        const m = qs[i].match(/^gu\.prefs\.(.*)=(.*)$/);
        if (m) {
            const key = m[1];
            const val = m[2];
            let v;
            switch (key) {
                case 'switchOn':
                    switchOn(val);
                    break;
                case 'switchOff':
                    switchOff(val);
                    break;
                default:
                    if (isNumeric(val)) {
                        // +val casts any number (int, float) from a string
                        v = +val;
                    } else if (isBoolean(val)) {
                        // String(val) === "true" converts a string to bool
                        v = String(val).toLowerCase() === 'true';
                    } else {
                        v = val;
                    }
                    set(key, v);
            }
        }
    }
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
