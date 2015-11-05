define([
    'lodash/collections/map'
], function (
    map) {
    return function (xs, f) {
        return Array.prototype.concat.apply([], map(xs, f));
    };
});
