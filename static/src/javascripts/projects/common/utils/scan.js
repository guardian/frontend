define([
    'common/utils/_'
], function (
    _
) {
    return function (xs, f, z) {
        return _.reduce(xs, function (acc, x) {
            return acc.concat(f(_.last(acc), x));
        }, [z]);
    };
});
