define([
    //Common libraries
    "common",
    "qwery",
    "domReady",
    //Modules
    "modules/expandable",
    "modules/trailblocktoggle",
    "modules/trailblock-show-more",
    "modules/footballfixtures"
], function (
    common,
    qwery,
    domReady,

    Expandable,
    TrailblockToggle,
    TrailblockShowMore,
    FootballFixtures
) {

    var modules = {
            
        showTrailblockToggles: function (config) {
            var tt = new TrailblockToggle();
            common.mediator.on('page:front:ready', function(config, context) {
                tt.go(config, context);
            });
        },

        showTrailblockShowMore: function () {
            var trailblockShowMore = new TrailblockShowMore();
            trailblockShowMore.init();
        },

        showFootballFixtures: function(path) {
            var prependTo,
            table;

            common.mediator.on('modules:footballfixtures:expand', function(id) {
                var expandable = new Expandable({ id: id, expanded: false });
                expandable.init();
            });

            switch(path) {
                case "/" :
                    prependTo = qwery('ul > li', '.zone-sport')[1];
                    table = new FootballFixtures({
                        prependTo: prependTo,
                        competitions: ['500', '510', '100'],
                        contextual: false,
                        expandable: true,
                        numVisible: 3
                    }).init();
                    break;
                case "/sport" :
                    prependTo = qwery('ul > li', '.trailblock')[1];
                    table = new FootballFixtures({
                        prependTo: prependTo,
                        contextual: false,
                        expandable: true,
                        numVisible: 5
                    }).init();
                    break;
            }
        }
    };

    var ready = function (config, context) {
        ready = function (config, context) {
            common.mediator.emit("page:front:ready", config, context);
        };
        // On first call to this fn only:
        modules.showTrailblockToggles(config);
        modules.showTrailblockShowMore();
        if(config.page.edition === "UK") {
            modules.showFootballFixtures(window.location.pathname);
        }
        ready(config, context);
    };

    return {
        init: ready
    };

});
