define([
    'common/utils/_',
    'common/utils/robust'
], function (
    _,
    robust
) {
    return function (modules) {
        _.forEach(modules, function (pair) {
            robust(pair[0], pair[1]);
        });
    };
});
