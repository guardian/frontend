define(['modules/storage'], function(storage) {

    var storagePrefix = 'gu.prefs.',
        store = storage,
        location = document.location,
        qs = (location.search.substr(1) + '&' + location.hash.substr(1)).split('&');

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

    for (var i = 0, j = qs.length; i<j; ++i) {
        var m = qs[i].match(/^gu\.prefs\.(.*)=(.*)$/);
        if (m) {
            switch (m[1]) {
                case "switchOn":
                    switchOn(m[2]);
                    break;
                case "switchOff":
                    switchOff(m[2]);
                    break;
                default:
                    set(m[1], m[2]);
            }
        }
    }

    return {
        set: set,
        get: get,
        remove: remove,
        switchOn: switchOn,
        switchOff: switchOff,
        removeSwitch: removeSwitch,
        isOn: isOn,
        isOff: isOff
    };
});