define(function() {

    var storagePrefix = 'gu.prefs.',
        store = localStorage,
        location = document.location,
        qs = (location.search.substr(1) + '&' + location.hash.substr(1)).split('&');

    function set(name, value) {
        store[storagePrefix + name] = value;
    }
    function get(name) {
        return store[storagePrefix + name];
    }
    function remove(name) {
        store.removeItem(storagePrefix + name);
    }

    function switchOn(name) {
        store[storagePrefix + "switch." + name] = "true";
    }
    function switchOff(name) {
        store[storagePrefix + "switch." + name] = "false";
    }
    function removeSwitch(name) {
        store.removeItem(storagePrefix + "switch." + name);
    }

    function isOn(name) {
        return store[storagePrefix + "switch." + name] === "true";
    }
    function isOff(name) {
        return store[storagePrefix + "switch." + name] === "false";
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