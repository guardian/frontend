define([
    //Common libraries
    "common",
    "qwery",
    "domReady",
    //Modules
    "modules/expandable",
    "modules/trailblocktoggle",
    "modules/trailblock-show-more",
    "modules/footballfixtures",
    "modules/story/frontstories"
], function (
    common,
    qwery,
    domReady,

    Expandable,
    TrailblockToggle,
    TrailblockShowMore,
    FootballFixtures,
    FrontStories
) {

    var modules = {
            
        showFrontExpanders: function () {
            var frontTrailblocks = common.$g('.js-front-trailblock'), i, l;
            for (i=0, l=frontTrailblocks.length; i<l; i++) {
                var elm = frontTrailblocks[i];
                var id = elm.id;
                var frontExpandable = new Expandable({ id: id, expanded: false });
                frontExpandable.init();
            }
        },
        
        showTrailblockToggles: function (config) {
            var edition = config.page.edition;
            var tt = new TrailblockToggle();
            tt.go(edition);
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
        },

        showFrontStories: function(config) {
            var fs = new FrontStories().init(config);
        }
    };

    // All methods placed inside here will exec after DOMReady
    var ready = function(req, config, context) {
        modules.showTrailblockToggles(config);
        modules.showTrailblockShowMore();
        if(config.page.edition === "UK") {
            modules.showFootballFixtures(req.url);
        }
        modules.showFrontStories(config);
    };

    return {
        init: ready
    };

});
