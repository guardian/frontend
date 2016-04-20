define([
    'fastdom',
    'common/modules/user-prefs'
], function (
    fastdom,
    userPrefs
) {

    function idleFastdom(action, callback) {
        if (userPrefs.get('use-idle-callback') && 'requestIdleCallback' in window) {
            window.requestIdleCallback(function () {
                fastdom[action](callback);
            });
        } else {
            fastdom[action](callback);
        }
    }

    return {
        read: function (callback) {
            idleFastdom('read', callback);
        },
        write: function (callback) {
            idleFastdom('write', callback);
        }
    };
});
