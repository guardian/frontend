define([
    'squire',
    './svg-paths'
], function (
    Squire,
    svgPaths
) {

    var buildSvgMocks = function() {
        return svgPaths.reduce(function(acc, path) {
            acc[path] = { markup: '' }

            return acc
        }, {});
    };

    var r = Squire.prototype.require;

    Squire.prototype.require = function (deps, cb, eb) {
        this.mock(buildSvgMocks());

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
