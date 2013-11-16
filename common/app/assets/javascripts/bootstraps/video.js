define([
    "common",
    "utils/detect",
    "modules/analytics/video"
], function(
    common,
    detect,
    Videostream
) {

    var modules = {

        initAnalytics: function () {
            common.mediator.on('video:ads:finished', function(config, context) {
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
            common.lazyLoadCss('video', config);
            modules.initAnalytics();
        }
        common.mediator.emit("page:video:ready", config, context);
    };

    return {
        init: ready
    };
});
