define([
    'common/utils/_',
    'common/utils/detect',
    'common/utils/mediator',
    'lodash/objects/isArray'
], function (
    _,
    detect,
    mediator,
    isArray) {

    var supportsPushState = detect.hasPushStateSupport(),
        model = {

            // returns a map of querystrings
            // eg ?foo=bar&fizz=buzz returns {foo: 'bar', fizz: 'buzz'}
            getUrlVars: function (options) {
                var opts = options || {};
                return _((opts.query || model.getCurrentQueryString()).split('&'))
                    .compact()
                    .map(function (query) {
                        return query.indexOf('=') > -1 ? query.split('=') : [query, true];
                    })
                    .zipObject()
                    .valueOf();
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
                if (!params.querystring) {
                    return;
                }
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
                return _(query)
                    .pairs()
                    .map(function (queryParts) {
                        var value = queryParts[1];
                        if (isArray(value)) {
                            value = value.join(',');
                        }
                        return [queryParts[0], '=', value].join('');
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

    // pubsub
    mediator.on('modules:url:pushquerystring', model.pushQueryString);

    // not exposing all the methods here
    return {
        getUrlVars: model.getUrlVars,
        getPath: model.getPath,
        pushUrl: model.pushUrl,
        constructQuery: model.constructQuery,
        back: model.back,
        hasHistorySupport: supportsPushState
    };

});
