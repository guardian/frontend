define(['common', 'ajax'], function (common, ajax) {

    var lazyLoad = function(opts) {

        /*
            Accepts these options:

            url               - string
            container         - element object
            success           - callback function, optional
            jsonpCallbackName - string, optional
        */

        opts = opts || {};

        if (opts.url && opts.container) {
            return ajax({
                url: opts.url,
                type: 'jsonp',
                jsonpCallbackName: opts.jsonpCallbackName,
                success: function (json) {
                    opts.container.innerHTML = json.html;
                    if (typeof opts.success === 'function') {
                        opts.success();
                    }
                }
            });
        }

    };

    return lazyLoad;
});
