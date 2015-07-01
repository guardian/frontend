define([
    'common/utils/_',
    'fastdom',
    'Promise'
], function (
    _,
    fastdom,
    Promise
) {
    return {
        read: function (fn, context) {
            return new Promise(function (resolve, reject) {
                fastdom.read(function () {
                    if (_.isFunction(fn)) {
                        resolve(fn.call(context));
                    } else {
                        reject();
                    }
                });
            });
        },
        write: function (fn, context) {
            return new Promise(function (resolve, reject) {
                fastdom.write(function () {
                    if (_.isFunction(fn)) {
                        resolve(fn.call(context));
                    } else {
                        reject();
                    }
                });
            });
        }
    };
});
