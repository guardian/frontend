define([
    //Common libraries
    "common",
    "domReady",
    //Modules
    "modules/trailblocktoggle",
    "modules/trailblock-show-more",
    "modules/footballfixtures"
], function (
    common,
    domReady,

    TrailblockToggle,
    TrailblockShowMore,
    FootballFixtures
) {

    var modules = {
            
        showTrailblockToggles: function () {
            var tt = new TrailblockToggle();
            common.mediator.on('page:front:ready', function(config, context) {
                tt.go(config, context);
            });
        },

        showTrailblockShowMore: function () {
            var trailblockShowMore = new TrailblockShowMore();
            common.mediator.on('page:front:ready', function(config, context) {
                trailblockShowMore.init(context);
            });
        },

        showFootballFixtures: function(path) {
            common.mediator.on('page:front:ready', function(config, context) {
                if(config.page.edition === "UK") {

                    var prependTo,
                    table;

                    switch(window.location.pathname) {
                        case "/" :
                            prependTo = context.querySelector('.zone-sport ul > li');
                            table = new FootballFixtures({
                                prependTo: prependTo,
                                competitions: ['500', '510', '100'],
                                contextual: false,
                                expandable: true,
                                numVisible: 3
                            }).init();
                            break;
                        case "/sport" :
                            prependTo = context.querySelector('.trailblock ul > li');
                            table = new FootballFixtures({
                                prependTo: prependTo,
                                contextual: false,
                                expandable: true,
                                numVisible: 5
                            }).init();
                            break;
                    }
                }
            });
        }
    };

    var ready = function (config, context) {
        ready = function (config, context) {
            common.mediator.emit("page:front:ready", config, context);
        };
        // On first call to this fn only:
        modules.showTrailblockToggles();
        modules.showTrailblockShowMore();
        modules.showFootballFixtures();

        ready(config, context);
    };

    return {
        init: ready
    };

});
