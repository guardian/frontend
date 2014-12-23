define([
    'common/utils/_'
], function (
    _
) {
    return function (xs, f) {
        return Array.prototype.concat.apply([], _.map(xs, f));
    };
});
