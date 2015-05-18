import _ from 'underscore';
import parseQueryParams from 'utils/parse-query-params';

export default function (key, val, baseUrl) {
    var qp = parseQueryParams(baseUrl);
    if (_.isUndefined(val)) {
        delete qp[key];
    } else {
        qp[key] = val;
    }
    return _.pairs(qp)
        .filter(function(p){ return !!p[0]; })
        .map(function(p){ return p[0] + (p[1] ? '=' + p[1] : '='); })
        .join('&');
}
