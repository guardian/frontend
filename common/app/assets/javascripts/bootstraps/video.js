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
                if(config.switches.videoAdverts && !config.page.blockAds) {
                    var support = detect.getVideoFormatSupport();
                    var a = new Advert({
                        el: context.querySelector('.player video'),
                        support: support
                    }).init();
                }
            });
        },

        initAnalytics: function () {
            common.mediator.on('page:video:ready', function(config, context) {
                var v = new Videostream({
                    id: config.page.id,
                    el: context.querySelector('.player video'),
                    ophanUrl: config.page.ophanUrl
                });

                v.init();
            });
        }
    };


    var ready = function (config, context) {
        ready = function (config, context) {
            common.mediator.emit("page:video:ready", config, context);
        };
        // On first call to this fn only:
        modules.initAnalytics();
        modules.initAdverts();
        ready(config, context);
    };

    return {
        init: ready
    };
});
