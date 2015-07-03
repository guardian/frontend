define([
    'common/utils/_'
], function (_) {
    return function (pairs) {
        return _.chain(pairs).filter(function (pair) {
            return pair[1];
        }).map(function (pair) {
            return pair[0];
        }).value();
    };
});
