define([
    'lodash/collections/reduce',
    'lodash/arrays/last'
], function (
    reduce,
    last) {
    return function (xs, f, z) {
        return reduce(xs, function (acc, x) {
            return acc.concat(f(last(acc), x));
        }, [z]);
    };
});
