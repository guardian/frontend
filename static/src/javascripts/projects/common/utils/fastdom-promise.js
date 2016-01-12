define([
    'fastdom',
    'Promise'
], function (
    fastdom,
    Promise
) {
    function fastDomAction(action, fn) {
        return new Promise(function (resolve, reject) {
            fastdom[action](function () {
                try {
                    resolve(fn());
                } catch (e) {
                    reject(e);
                }
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
