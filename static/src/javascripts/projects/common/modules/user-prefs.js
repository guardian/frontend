// @flow
import storage from 'lib/storage';

const storagePrefix = 'gu.prefs.';
const defaultOptions = {
    type: 'local',
};

type Options = {
    type?: string,
};

const set = (name: string, value: any, options: Options = {}) => {
    storage[options.type || defaultOptions.type].set(
        storagePrefix + name,
        value
    );
};

const get = (name: string, options: Options = {}) =>
    storage[options.type || defaultOptions.type].get(storagePrefix + name);

const remove = (name: string, options: Options = {}) => {
    storage[options.type || defaultOptions.type].remove(storagePrefix + name);
};

const switchOn = (name: string, options: Options = {}) => {
    storage[options.type || defaultOptions.type].set(
        `${storagePrefix}switch.${name}`,
        true
    );
};

const switchOff = (name: string, options: Options = {}) => {
    storage[options.type || defaultOptions.type].set(
        `${storagePrefix}switch.${name}`,
        false
    );
};

const removeSwitch = (name: string, options: Options = {}) => {
    storage[options.type || defaultOptions.type]
        .remove(`${storagePrefix}switch.${name}`);
};

const isOn = (name: string, options: Options = {}) =>
    storage[options.type || defaultOptions.type]
        .get(`${storagePrefix}switch.${name}`) === true;

const isOff = (name: string, options: Options = {}) =>
    storage[options.type || defaultOptions.type]
        .get(`${storagePrefix}switch.${name}`) === false;

const isNumeric = str => !isNaN(str);

const isBoolean = str => str === 'true' || str === 'false';

const setPrefs = (loc: Object) => {
    const qs = loc.hash.substr(1).split('&');
    let m;
    let key;
    let val;
    let v;
    let i;
    let j;
    for ((i = 0), (j = qs.length); i < j; i += 1) {
        m = qs[i].match(/^gu\.prefs\.(.*)=(.*)$/);
        if (m) {
            key = m[1];
            val = m[2];
            switch (key) {
                case 'switchOn':
                    switchOn(val);
                    break;
                case 'switchOff':
                    switchOff(val);
                    break;
                default:
                    // 1. +val casts any number (int, float) from a string
                    // 2. String(val) === "true" converts a string to bool
                    v = isNumeric(val)
                        ? +val
                        : isBoolean(val)
                              ? String(val).toLowerCase() === 'true'
                              : val;
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
