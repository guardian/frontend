define([
    "common",
    "modules/analytics/video",
    "modules/accordion",
    "modules/experiment"
], function(
    common,
    Videostream,
    Accordion,
    Experiment
) {

    var modules = {
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
            var e = new Experiment();

            e.init(config);
        }
    };

    var init = function(req, config) {
        modules.initExperiments(config);
        modules.initAnalytics(config);
    };

    return {
        init: init
    };
});