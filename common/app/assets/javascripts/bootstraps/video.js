define([
    "common",
    "modules/analytics/video",
    "modules/accordion",
    "modules/story/experiment"
], function(
    common,
    Videostream,
    Accordion,
    Experiment
) {

    var modules = {
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
        ready(config, context);
    };

    return {
        init: ready
    };
});
