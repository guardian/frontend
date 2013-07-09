define([
    "common",
    "modules/cricket"
], function (
    common,
    cricket
) {
    var modules = {

        initCricket: function(context) {
            common.mediator.on('page:tag:ready', function(config, context) {

                var options;
                if (config.page.pageId === 'sport/cricket' ) {

                    options = { url: "/cricket/match/34780",
                                loadSummary: true,
                                loadScorecard: false,
                                summaryElement: '.t1',
                                scorecardElement: '.t1',
                                summaryManipulation: 'append',
                                scorecardManipulation: 'append' };
                    cricket(config, context, options);
                }
            });
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.initCricket(context);
        }
        common.mediator.emit("page:tag:ready", config, context);
    };

    return {
        init: ready
    };

});
