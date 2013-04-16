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

        common.mediator.emit("page:gallery:ready", config, context);

        modules.initAnalytics(config);
    };

    return {
        init: init
    };
});