define([
    'common/utils/_',
    'lodash/collections/map'
], function (
    _,
    map) {
    return function (xs, f) {
        return Array.prototype.concat.apply([], map(xs, f));
    };
});
