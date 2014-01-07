define(['utils/query-params', 'lodash/objects/isUndefined', 'lodash/objects/pairs'], function(queryParams, isUndefined, pairs) {
    return function(key, val) {
        var qp = queryParams();
        if (isUndefined(val)) {
            delete qp[key];
        } else {
            qp[key] = val;
        }
        return pairs(qp)
            .filter(function(p){ return !!p[0]; })
            .map(function(p){ return p[0] + (p[1] ? '=' + p[1] : ''); })
            .join('&');
    };
});
