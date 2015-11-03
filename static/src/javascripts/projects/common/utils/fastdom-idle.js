define(['fastdom'], function (fastdom) {

    function idleFastdom(action, callback) {
        if (location.hash === '#idle' && 'requestIdleCallback' in window) {
            requestIdleCallback(function () {
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
