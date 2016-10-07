define([
    'common/modules/user-prefs'
], function (
    userPrefs
) {
    var KEY_PREFIX = 'accessibility';

    function saveState(state) {
        for (var key in state) {
            if (state.hasOwnProperty(key)) {
                userPrefs.set(KEY_PREFIX + '.' + key, state[key]);
            }
        }
    }

    function getStoredValue(key) {
        var stored = userPrefs.get(KEY_PREFIX + '.' + key);
        // Defaults to true
        return stored === false ? false : true;
    }

    function isOn(key) {
        return getStoredValue(key) === true;
    }

    var module = {
        KEY_PREFIX: KEY_PREFIX,
        saveState: saveState,
        isOn: isOn
    };
    return module;
});
