define([
    //Common libraries
    "common",
    "qwery",
    "domReady",
    //Modules
    "modules/expandable",
    "modules/trailblocktoggle",
    "modules/footballfixtures"
], function (
    common,
    qwery,
    domReady,

    Expandable,
    TrailblockToggle,
    FootballFixtures
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
                    table = new FootballFixtures({prependTo: prependTo, competitions: ['500', '510', '100'], expandable: true}).init();
                    break;
                case "/sport" :
                    prependTo = qwery('ul > li', '.trailblock')[1];
                    table = new FootballFixtures({prependTo: prependTo, expandable: true}).init();
                    break;
            }
        }
    };

    // All methods placed inside here will exec after DOMReady
    var ready = function(req, config) {
        modules.showFrontExpanders();
        modules.showTrailblockToggles(config);
        modules.showFootballFixtures(req.url);
    };

    return {
        init: ready
    };

});
