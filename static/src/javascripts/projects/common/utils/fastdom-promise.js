define([
    'fastdom',
    'Promise'
], function (
    fastdom,
    Promise
) {
    function promisify(fdaction) {
        return function (fn, ctx) {
            return new Promise(function (resolve, reject) {
                fdaction(function () {
                    try {
                        resolve(fn.call(this));
                    } catch (e) {
                        reject(e);
                    }
                }, ctx);
            });
        };
    }

    return {
        read: promisify(fastdom.read),
        write: promisify(fastdom.write)
    };
});
