define(['common', 'ajax'], function (common, ajax) {

    var lazyLoad = function(opts) {

        /*
            Accepts these options:

            url               - string
            container         - element object
            success           - callback function, optional
            error             - callback function, optional
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
                },
                error: function () {
                    common.mediator('module:error', 'Failed to lazyload ' + opts.url, 'lazyload.js');
                    if (typeof opts.error === 'function') {
                        opts.error();
                    }
                }
            });
        }

    };

    return lazyLoad;
});
