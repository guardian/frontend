define([
    'common/utils/storage'
], function (
    storage
) {

    var storagePrefix = 'gu.prefs.';
    var defaultType = 'local';

    function set(name, value, type) {
        type || (type = defaultType);
        storage[type].set(storagePrefix + name, value);
    }

    function get(name, type) {
        type || (type = defaultType);
        return storage[type].get(storagePrefix + name);
    }

    function remove(name, type) {
        type || (type = defaultType);
        storage[type].remove(storagePrefix + name);
    }

    function switchOn(name, type) {
        type || (type = defaultType);
        storage[type].set(storagePrefix + 'switch.' + name, true);
    }

    function switchOff(name, type) {
        type || (type = defaultType);
        storage[type].set(storagePrefix + 'switch.' + name, false);
    }

    function removeSwitch(name, type) {
        type || (type = defaultType);
        storage[type].remove(storagePrefix + 'switch.' + name);
    }

    function isOn(name, type) {
        type || (type = defaultType);
        return storage[type].get(storagePrefix + 'switch.' + name) === true;
    }

    function isOff(name, type) {
        type || (type = defaultType);
        return storage[type].get(storagePrefix + 'switch.' + name) === false;
    }

    function isNumeric(str) {
        return !isNaN(str);
    }

    function isBoolean(str) {
        return (str === 'true' || str === 'false');
    }

    function setPrefs(loc) {
        var qs = loc.hash.substr(1).split('&'),
            m,
            key,
            val,
            v,
            i,
            j;
        for (i = 0, j = qs.length; i < j; ++i) {
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
                        v = (isNumeric(val) ? +val : isBoolean(val) ? (String(val).toLowerCase() === 'true') : val);
                        set(key, v);
                }
            }
        }
    }

    setPrefs(window.location);

    return {
        set: set,
        get: get,
        remove: remove,
        switchOn: switchOn,
        switchOff: switchOff,
        removeSwitch: removeSwitch,
        isOn: isOn,
        isOff: isOff,
        setPrefs: setPrefs
    };
});
