define([
    'underscore',
    'utils/parse-query-params',
    'utils/identity'
], function(
    _,
    parseQueryParams,
    identity
) {
    return function (url) {
        var bits = (url + '').split('?');

        if (bits.length <= 1) {
            return url;

        } else {
            return _.initial(bits).concat(
                _.map(
                    parseQueryParams(url, {
                        predicateKey: function(key) { return key !== 'api-key'; },
                        predicateVal: identity
                    }),
                    function(val, key) { return key + '=' + val; }
                ).join('&')
            ).join('?');
        }
    };
});
