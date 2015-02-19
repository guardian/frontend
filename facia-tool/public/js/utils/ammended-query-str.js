define([
    'underscore',
    'utils/query-params'
], function(
    _,
    queryParams
) {
    return function (key, val) {
        var qp = queryParams();
        if (_.isUndefined(val)) {
            delete qp[key];
        } else {
            qp[key] = val;
        }
        return _.pairs(qp)
            .filter(function(p){ return !!p[0]; })
            .map(function(p){ return p[0] + (p[1] ? '=' + p[1] : ''); })
            .join('&');
    };
});
