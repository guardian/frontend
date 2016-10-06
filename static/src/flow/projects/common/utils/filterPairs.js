define([
    'lodash/collections/map',
    'lodash/collections/filter',
    'common/utils/chain'
], function (map, filter, chain) {
    return function (pairs) {
        return chain(pairs).and(filter, function (pair) {
            return pair[1];
        }).and(map, function (pair) {
            return pair[0];
        }).value();
    };
});
