define([
    "common",
    "modules/detect",
    "modules/analytics/video",
    "modules/adverts/video"
], function(
    common,
    detect,
    Videostream,
    Advert
) {

    var modules = {

        initAdverts: function(config) {
            common.mediator.on('page:video:ready', function(config, context) {
                if(!config.page.blockAds) {
                    var support = detect.getVideoFormatSupport();
                    var a = new Advert({
                        el: context.querySelector('.player video'),
                        support: support,
                        config: config,
                        context: context
                    }).init(config.page);
                } else {
                    common.mediator.emit("video:ads:finished", config, context);
                }
            });
        },

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
            modules.initAdverts();
        }
        common.mediator.emit("page:video:ready", config, context);
    };

    return {
        init: ready
    };
});
