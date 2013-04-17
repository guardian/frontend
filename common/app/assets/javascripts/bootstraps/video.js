define([
    "common",
    "modules/detect",
    "modules/analytics/video",
    "modules/adverts/video",
    "modules/accordion",
    "modules/story/experiment"
], function(
    common,
    detect,
    Videostream,
    Advert,
    Accordion,
    Experiment
) {

    var modules = {

        initAdverts: function(config) {
            if(!config.page.blockAds) {
                var support = detect.getVideoFormatSupport();
                var a = new Advert({
                    el: document.getElementsByTagName('video')[0],
                    support: support
                }).init();
            }
        },

        initAnalytics: function (config) {
            var v = new Videostream({
                id: config.page.id,
                el: document.querySelector('#player video'),
                ophanUrl: config.page.ophanUrl
            });

            v.init();
        },

        initExperiments: function(config) {
            common.mediator.on('modules:experiment:render', function() {
                if(document.querySelector('.accordion')) {
                    var a = new Accordion();
                }
            });
            var e = new Experiment(config);

            e.init();
        }
    };


    var init = function(req, config, context) {
        common.mediator.emit("page:video:ready", config, context);

        modules.initAdverts(config);
        modules.initAnalytics(config);
    };

    return {
        init: init
    };
});