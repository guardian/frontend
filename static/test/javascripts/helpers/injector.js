define([
    'Promise',
    'squire'
], function(
    Promise,
    Squire
) {

    var r = Squire.prototype.require;

    Squire.prototype.require = function (deps, cb, eb) {

        return new Promise(function (resolve, reject) {
            r.call(this, deps, function () {
                var res = cb.apply(this, arguments);
                resolve();
            }, function () {
                var res = eb.apply(this, arguments);
                resolve();
            });
        }.bind(this));

    };

    return Squire;

});
