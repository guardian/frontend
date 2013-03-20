define([
    "common",
    "modules/detect",
    "modules/analytics/video",
    "modules/accordion",
    "modules/story/experiment"
], function(
    common,
    detect,
    Videostream,
    Accordion,
    Experiment
) {

    var modules = {

        initAdverts: function(config) {
            if(!config.page.blockAds) {
                console.log(detect.getVideoFormatSupport());
            }
        },

        initAnalytics: function (config) {
            var v = new Videostream({
                id: config.page.id,
                el: document.querySelector('#player video'),
                ophanUrl: config.ophanUrl
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

    var init = function(req, config) {
        modules.initAdverts(config);
        modules.initExperiments(config);
        modules.initAnalytics(config);
    };

    return {
        init: init
    };
});