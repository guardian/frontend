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
            var experimentName = localStorage.getItem('gu.experiment') || '',
                experiment;

            if (!experimentName) {
                for (var key in config.switches) {
                    if (config.switches[key] && key.match(/^experiment(\w+)/)) {
                        experimentName = key.match(/^experiment(\w+)/)[1];
                        break;
                    }
                }
            }

            experimentName = experimentName.toLowerCase();

            if (experimentName) {
                common.mediator.on('modules:experiment:render', function() {
                    if(document.querySelector('.accordion')) {
                        var a = new Accordion();
                    }
                });
                experiment = new Experiment(config, experimentName).init();
            } else {
                common.mediator.emit("modules:related:load");
            }
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