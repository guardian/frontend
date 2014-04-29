/* global _: true */
define(['utils/url-query'], function(urlQuery) {
    return function(url, namespace, excludeNamespace, stripNamespace) {
      return _.chain(urlQuery(url).split('&'))
          .filter(function(kv) { return kv; })
          .map(function(kv) { return kv.split('='); })
          .filter(function(kv) { return !namespace || kv[0].indexOf(namespace) === (excludeNamespace ? -1 : 0); })
          .map(function(kv) { return [
              namespace && stripNamespace && !excludeNamespace ? kv[0].slice(namespace.length) : kv[0],
              kv[1] === undefined ? undefined : decodeURIComponent(kv[1])
          ]; })
          .object()
          .value();
    };
});
