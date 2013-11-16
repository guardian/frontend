define(['utils/storage'], function(storage) {

    var storagePrefix = 'gu.prefs.',
        store = storage.local;

    function set(name, value) {
        store.set(storagePrefix + name, value);
    }

    function get(name) {
        return store.get(storagePrefix + name);
    }

    function remove(name) {
        store.remove(storagePrefix + name);
    }

    function switchOn(name) {
        store.set(storagePrefix + "switch." + name, true);
    }

    function switchOff(name) {
        store.set(storagePrefix + "switch." + name, false);
    }

    function removeSwitch(name) {
        store.remove(storagePrefix + "switch." + name);
    }

    function isOn(name) {
        return store.get(storagePrefix + "switch." + name) === true;
    }

    function isOff(name) {
        return store.get(storagePrefix + "switch." + name) === false;
    }

    function isNumeric(str){
        return !isNaN(str);
    }

    function isBoolean(str){
        return (str === "true" || str === "false");
    }

    function setPrefs(loc) {
        var qs = loc.hash.substr(1).split('&');
        for (var i = 0, j = qs.length; i<j; ++i) {
            var m = qs[i].match(/^gu\.prefs\.(.*)=(.*)$/);
            if (m) {
                var key = m[1],
                    val = m[2];
                switch (key) {
                    case "switchOn":
                        switchOn(val);
                        break;
                    case "switchOff":
                        switchOff(val);
                        break;
                    default:
                        // 1. +val casts any number (int, float) from a string
                        // 2. String(val) === "true" converts a string to bool
                        var v = (isNumeric(val) ? +val : isBoolean(val) ? (String(val).toLowerCase() === "true") : val);
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
