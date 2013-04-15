define(['common', 'ajax', 'bonzo'], function (common, ajax, bonzo) {

    var lazyLoad = function(opts) {

        /*
            Accepts these options:

            url               - string
            container         - element object
            beforeInsert      - function applied to response html before inserting it into container, optional
            success           - callback function, optional
            jsonpCallbackName - string, optional
            force             - boolean, default false. Reload an already-populated container
        */

        var into;

        opts = opts || {};
        opts.beforeInsert = opts.beforeInsert || function(html) { return html; };

        if (opts.url && opts.container) {
            into = bonzo(opts.container);
            if (opts.force || ! into.hasClass('lazyloaded')) {
                return ajax({
                    url: opts.url,
                    type: 'jsonp',
                    jsonpCallbackName: opts.jsonpCallbackName,
                    success: function (json) {
                        into.html(opts.beforeInsert(json.html));
                        into.addClass('lazyloaded');
                        if (typeof opts.success === 'function') {
                            opts.success();
                        }
                    }
                });
            }
        }

    };

    return lazyLoad;
});
