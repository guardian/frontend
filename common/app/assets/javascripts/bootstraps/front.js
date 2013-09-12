define([
    //Common libraries
    "common",
    "bonzo",
    "domReady",
    //Modules
    "modules/trailblocktoggle",
    "modules/trailblock-show-more",
    "modules/footballfixtures",
    "modules/cricket"
], function (
    common,
    bonzo,
    domReady,
    TrailblockToggle,
    TrailblockShowMore,
    FootballFixtures,
    Cricket
) {

    var modules = {

        showCricket: function(){
            common.mediator.on('page:front:ready', function(config, context) {
                Cricket.cricketTrail(config, context);
            });
        },

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

                    var opts,
                        table;

                    switch(config.page.pageId) {
                        case "" :
                            // Network Front
                            opts = {
                                prependTo: context.querySelector('.zone-sport ul > li'),
                                competitions: ['500', '510', '100', '400'],
                                contextual: false,
                                expandable: true,
                                numVisible: 3
                            };
                            break;
                        case "sport" :
                            // Sport Front
                            // don't want to put it in the masthead trailblock
                            var trailblocks = [].filter.call(context.querySelectorAll('.trailblock'), function(trailblock) {
                                return bonzo(trailblock).hasClass('trailblock--masthead') === false;
                            });
                            opts = {
                                prependTo: (trailblocks.length) ? trailblocks[0].querySelector('ul > li') : null,
                                competitions: ['500', '510', '100', '400'],
                                contextual: false,
                                expandable: true,
                                numVisible: 5
                            };
                            break;
                    }

                    if(opts && !bonzo(opts.prependTo).hasClass('footballfixtures-loaded')) {
                        bonzo(opts.prependTo).addClass('footballfixtures-loaded');
                        table = new FootballFixtures(opts).init();
                    }
                }
            });
        }

    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.showTrailblockToggles();
            modules.showTrailblockShowMore();
            modules.showFootballFixtures();
            modules.showCricket();
        }
        common.mediator.emit("page:front:ready", config, context);
    };

    return {
        init: ready
    };

});
