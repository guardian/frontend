define(['common', 'ajax'], function (common, ajax) {

    var lazyLoad = function(opts) {

        /*
            Accepts these options:

            url               - string
            container         - element object
            success           - callback function, optional
            jsonpCallbackName - string, optional
            fore              - boolean, default false. Reload an already-populated container
        */

        var load;

        opts = opts || {};

        load = opts.force || opts.container.innerHTML.match(/^\s*$/g);

        opts.beforeInsert = opts.beforeInsert || function(html) { return html; };

        if (load && opts.url && opts.container) {
            return ajax({
                url: opts.url,
                type: 'jsonp',
                jsonpCallbackName: opts.jsonpCallbackName,
                success: function (json) {
                    opts.container.innerHTML = opts.beforeInsert(json.html);
                    if (typeof opts.success === 'function') {
                        opts.success();
                    }
                }
            });
        }

    };

    return lazyLoad;
});
