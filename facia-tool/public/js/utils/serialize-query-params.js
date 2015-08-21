import _ from 'underscore';

export default function (...overrides) {
    var params = _.extend({}, ...overrides);
    return _.pairs(params)
        .filter(function(p) {
            return !!p[0] && !_.isUndefined(p[1]);
        })
        .map(function(p) {
            return p[0] + (p[1] ? '=' + p[1] : '=');
        })
        .join('&');
}
