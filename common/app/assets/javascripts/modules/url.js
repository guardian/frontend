define(['modules/detect', 'common'], function(detect, common){
    
    var model = {

        // returns a map of querystrings
        // eg ?foo=bar&fizz=buzz returns x.foo = bar and x.fizz = buzz
        getUrlVars: function () {
            var vars = [], hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            var hash_length = hashes.length;
            for (var i = 0; i < hash_length; i++) {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
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
            var supportsPushState = detect.hasPushStateSupport();
            if (supportsPushState) {
                if (model.getCurrentQueryString() !== params.querystring) {
                    history.pushState(
                        params.state || {},
                        params.title || window.title,
                        params.querystring
                    );
                }
            }
        }

    };

    // pubsub
    common.mediator.on('modules:url:pushquerystring', model.pushQueryString);

    // not exposing all the methods here
    return {
        getUrlVars: model.getUrlVars
    };

});