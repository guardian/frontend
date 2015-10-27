define([
    'Promise',
    'squire'
], function (
    Promise,
    Squire
) {

    var r = Squire.prototype.require;

    Squire.prototype.require = function (deps, cb, eb) {

        return new Promise(function (resolve, reject) {
            r.call(this, deps, function () {
                cb.apply(this, arguments);
                resolve();
            }, function () {
                eb.apply(this, arguments);
                reject();
            });
        }.bind(this));

    };

    return Squire;

});
