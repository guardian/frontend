define([
    'common/modules/user-prefs'
], function (
    userPrefs
) {
    function saveState(state) {
        for (var key in state) {
            if (state.hasOwnProperty(key)) {
                userPrefs.set(module.KEY_PREFIX + '.' + key, state[key]);
            }
        }
    }

    function getStoredValue(key) {
        var stored = userPrefs.get(module.KEY_PREFIX + '.' + key);
        // Defaults to true
        return stored === false ? false : true;
    }

    function isOn(key) {
        return getStoredValue(key) === true;
    }

    var module = {
        KEY_PREFIX: 'accessibility',
        saveState: saveState,
        isOn: isOn
    };
    return module;
});
