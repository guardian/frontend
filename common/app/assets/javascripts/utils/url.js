define([
    'lodash/objects/isArray',
    'lodash/objects/pairs',
    'common/utils/detect',
    'common/utils/mediator'
], function(
    isArray,
    pairs,
    detect,
    mediator
) {
    
    var supportsPushState = detect.hasPushStateSupport();

    var model = {

        // returns a map of querystrings
        // eg ?foo=bar&fizz=buzz returns x.foo = bar and x.fizz = buzz
        getUrlVars: function (options) {
            var opts = options || {},
                vars = {},
                hash,
                hashes = (opts.query || model.getCurrentQueryString()).split('&'),
                hash_length = hashes.length;
            for (var i = 0; i < hash_length; i++) {
                hash = hashes[i].split('=');
                vars[hash[0]] = hash[1];
            }
            return vars;
        },

        // returns "foo=bar&fizz=buzz" (eg. no ? symbol)
        getCurrentQueryString: function () {
            return window.location.search.replace(/^\?/, '');
        },

        // this will replace anything after the root/domain of the URL
        // and add an item to the browser history.
        // params object requires a "querystring" property
        // and optionally takes a "state" and "title" property too
        pushQueryString: function (params) {
            if (!params.querystring) { return; }
            if (supportsPushState) {
                if (model.getCurrentQueryString() !== params.querystring) {
                    history.pushState(
                        params.state || {},
                        params.title || window.title,
                        params.querystring + window.location.hash
                    );
                }
            }
        },

        // take an object, construct into a query, e.g. {page: 1, pageSize: 10} => page=1&pageSize=10
        constructQuery: function (query) {
            return pairs(query).map(function(queryParts) {
                    var value = queryParts[1];
                    if (isArray(value)) {
                        value = value.join(',');
                    }
                    return [queryParts[0], '=', value].join('');
                }).join('&');
        },

        pushUrl: function (state, title, url, replace) {
            if (supportsPushState) {
                window.history[replace? 'replaceState' : 'pushState'](state, title, url);
            }
        }
    };

    // pubsub
    mediator.on('modules:url:pushquerystring', model.pushQueryString);

    // not exposing all the methods here
    return {
        getUrlVars: model.getUrlVars,
        pushUrl: model.pushUrl,
        constructQuery: model.constructQuery
    };

});
