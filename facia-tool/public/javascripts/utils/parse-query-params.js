/* global _: true */
define(['utils/url-query'], function(urlQuery) {
    return function(url, opts) {
        opts = opts || {};

        /**
         * Returns query params as an object.
         * @param {function} predicate        Function to determine which vals get included
         * @param {string}   namespace        Optional prefix for param keys
         * @param {boolean}  excludeNamespace Optional whether to exclude or include namespaced params
         * @param {boolean}  stripNamespace   Optional whether to strip namsepace from param names
         */

        return _.chain(urlQuery(url).split('&'))
            .filter(function(kv) {
                return kv; })

            .map(function(kv) {
                return kv.split('='); })

            .filter(function(kv) {
                return _.isFunction(opts.predicate) ? opts.predicate(kv[1]) : true; })

            .filter(function(kv) {
                return !opts.namespace || kv[0].indexOf(opts.namespace) === (opts.excludeNamespace ? -1 : 0); })

            .map(function(kv) {
                return [
                    opts.namespace && opts.stripNamespace && !opts.excludeNamespace ? kv[0].slice(opts.namespace.length) : kv[0],
                    kv[1] === undefined ? undefined : decodeURIComponent(kv[1].replace(/\+/g, ' '))
                ]; })

            .object()
            .value();
    };
});
