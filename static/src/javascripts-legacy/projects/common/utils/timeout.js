define([
    'Promise'
], function (
    Promise
) {
    /**
     * Make a Promise fail if it didn't resolve quickly enough
     */
    return function (interval, promise) {
        return Promise.race([
            promise,
            new Promise(function (resolve, reject) {
                setTimeout(function () {
                    reject(new Error('Timeout'));
                }, interval);
            })
        ]);
    };
});
