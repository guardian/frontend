define([
    'common/utils/_'
], function (
    _
) {
    return function (xs, f) {
        return _.flatten(_.map(xs, f));
    };
});
