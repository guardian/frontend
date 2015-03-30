define([
    'underscore',
    'utils/url-query'
], function(
    _,
    urlQuery
) {
    /**
     * Returns query params as an object.
     * @param {function} opts                  optional options
     * @param {function} opts.predicateKey     fn to determine which keys get included
     * @param {function} opts.predicateVal     fn to determine which vals get included
     * @param {string}   opts.namespace        prefix for keys
     * @param {boolean}  opts.excludeNamespace whether to exclude or include prefixed keys
     * @param {boolean}  opts.stripNamespace   whether to strip prefix from returned object's keys
     * @param {boolean}  opts.multipleValues   whether a key can appear multiple times, all values are array
     */

    return function(url, opts) {
        opts = opts || {};

        var nsIndex = opts.excludeNamespace ? -1 : 0,
            nsStrip = opts.namespace && opts.stripNamespace && !opts.excludeNamespace,
            nsLength = opts.namespace ? ('' + opts.namespace).length : 0,
            result = {};

        _.chain(urlQuery(url).split('&'))
            .filter(function(kv) {
                return kv; })

            .map(function(kv) {
                return kv.split('='); })

            .filter(function(kv) {
                return _.isFunction(opts.predicateKey) ? opts.predicateKey(kv[0]) : true; })

            .filter(function(kv) {
                return _.isFunction(opts.predicateVal) ? opts.predicateVal(kv[1]) : true; })

            .filter(function(kv) {
                return !opts.namespace || kv[0].indexOf(opts.namespace) === nsIndex; })

            .map(function(kv) {
                var key = nsStrip ? kv[0].slice(nsLength) : kv[0],
                    value = kv[1] === undefined ? undefined : decodeURIComponent(kv[1].replace(/\+/g, ' '));

                if (opts.multipleValues) {
                    if (!_.has(result, key)) {
                        result[key] = [];
                    }
                    result[key].push(value);
                } else {
                    result[key] = value;
                }
            });
        return result;
    };
});
