/* global _: true */
define(['utils/url-query'], function(urlQuery) {
    /**
     * Returns query params as an object.
     * @param {function} opts                  optional options
     * @param {function} opts.predicate        fn to determine which vals get included
     * @param {string}   opts.namespace        prefix for param keys
     * @param {boolean}  opts.excludeNamespace whether to exclude or include prefixed keys
     * @param {boolean}  opts.stripNamespace   whether to strip prefix from returned object's keys
     */

    return function(url, opts) {
        opts = opts || {};

        var nsIndex = opts.excludeNamespace ? -1 : 0,
            nsStrip = opts.namespace && opts.stripNamespace && !opts.excludeNamespace,
            nsLength = opts.namespace ? ('' + opts.namespace).length : 0;

        return _.chain(urlQuery(url).split('&'))
            .filter(function(kv) {
                return kv; })

            .map(function(kv) {
                return kv.split('='); })

            .filter(function(kv) {
                return _.isFunction(opts.predicate) ? opts.predicate(kv[1]) : true; })

            .filter(function(kv) {
                return !opts.namespace || kv[0].indexOf(opts.namespace) === nsIndex; })

            .map(function(kv) {
                return [
                    nsStrip ? kv[0].slice(nsLength) : kv[0],
                    kv[1] === undefined ? undefined : decodeURIComponent(kv[1].replace(/\+/g, ' '))
                ]; })

            .object()
            .value();
    };
});
