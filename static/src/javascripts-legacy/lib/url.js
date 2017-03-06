define([
    'lib/detect'
], function (detect) {

    var supportsPushState = detect.hasPushStateSupport(),
        model = {

            // returns a map of querystrings
            // eg ?foo=bar&fizz=buzz returns {foo: 'bar', fizz: 'buzz'}
            getUrlVars: function (options) {
                var opts = options || {};
                return (opts.query || model.getCurrentQueryString()).split('&')
                    .filter(Boolean)
                    .map(function (query) {
                        return query.indexOf('=') > -1 ? query.split('=') : [query, true];
                    })
                    .reduce(function (result, input) {
                        result[input[0]] = input[1];
                        return result;
                    }, {});
            },

            // returns "foo=bar&fizz=buzz" (eg. no ? symbol)
            getCurrentQueryString: function () {
                return window.location.search.replace(/^\?/, '');
            },

            updateQueryString: function (params, historyFn) {
                var querystringChanged = model.getCurrentQueryString() !== params.querystring;

                if (params.querystring && querystringChanged && supportsPushState) {
                    historyFn(
                        params.state || {},
                        params.title || window.title,
                        params.querystring + window.location.hash
                    );
                }
            },

            // this will replace anything after the root/domain of the URL
            // and add an item to the browser history.
            // params object requires a "querystring" property
            // and optionally takes a "state" and "title" property too
            pushQueryString: function (params) {
                return model.updateQueryString(params, history.pushState.bind(history));
            },

            // equivalent to pushQueryString but uses history.replaceState to
            // overwrite history rather than history.pushState
            replaceQueryString: function (params) {
               return model.updateQueryString(params, history.replaceState.bind(history));
            },

            // take an object, construct into a query, e.g. {page: 1, pageSize: 10} => page=1&pageSize=10
            constructQuery: function (query) {
                return Object.keys(query).map(function (param) {
                        var value = query[param];
                        return param + '=' + (Array.isArray(value) ? value.join(',') : value);
                    }).join('&');
            },

            getPath: function (url) {
                var a = document.createElement('a');
                a.href = url;
                return a.pathname;
            },

            pushUrl: function (state, title, url, replace) {
                if (supportsPushState) {
                    window.history[replace ? 'replaceState' : 'pushState'](state, title, url);
                }
            },

            back: function () {
                if (supportsPushState) {
                    window.history.back();
                }
            }
        };

    // not exposing all the methods here
    return {
        getUrlVars: model.getUrlVars,
        getPath: model.getPath,
        pushUrl: model.pushUrl,
        constructQuery: model.constructQuery,
        back: model.back,
        hasHistorySupport: supportsPushState,
        pushQueryString: model.pushQueryString,
        replaceQueryString: model.replaceQueryString
    };

});
