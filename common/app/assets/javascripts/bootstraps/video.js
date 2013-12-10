define([
    "utils/mediator",
    "utils/detect",
    "utils/lazy-load-css",
    "modules/analytics/video"
], function(
    mediator,
    detect,
    lazyLoadCss,
    Videostream
) {

    var modules = {

        initAnalytics: function () {
            mediator.on('video:ads:finished', function(config, context) {
                var v = new Videostream({
                    id: config.page.pageId,
                    el: context.querySelector('.player video'),
                    ophanUrl: config.page.ophanUrl
                });

                v.init();
            });
        }
    };


    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            lazyLoadCss('video', config);
            modules.initAnalytics();
        }
        mediator.emit("page:video:ready", config, context);
    };

    return {
        init: ready
    };
});
