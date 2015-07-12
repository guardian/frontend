define([
    'fastdom',
    'Promise'
], function (
    fastdom,
    Promise
) {
    function fastDomAction(action, fn) {
        return new Promise(function (resolve) {
            fastdom[action](function () {
                resolve(fn());
            });
        });
    }

    return {
        read: function (fn) {
            return fastDomAction('read', fn);
        },
        write: function (fn) {
            return fastDomAction('write', fn);
        }
    };
});
