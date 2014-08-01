/* global _: true */
define(['utils/parse-query-params'], function(parseQueryParams) {
    return function (url) {
        var bits = (url + '').split('?');

        if (bits.length <= 1) {
            return url;

        } else {
            return _.initial(bits).concat(
                _.map(
                    parseQueryParams(url, {predicate: function(str) { return str;}}),
                    function(val, key) { return key + '=' + val; }
                ).join('&')
            ).join('?');
        }
    };
});
