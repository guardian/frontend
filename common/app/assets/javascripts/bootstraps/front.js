define([
    //Common libraries
    "common",
    "bonzo",
    "domReady",
    //Modules
    "modules/trailblocktoggle",
    "modules/trailblock-show-more",
    "modules/footballfixtures",
    'modules/story/frontstories'
], function (
    common,
    bonzo,
    domReady,

    TrailblockToggle,
    TrailblockShowMore,
    FootballFixtures,
    FrontStories
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

                    var opts,
                        table;

                    switch(window.location.pathname) {
                        case "/" :
                            opts = {
                                prependTo: context.querySelector('.zone-sport ul > li'),
                                competitions: ['500', '510', '100'],
                                contextual: false,
                                expandable: true,
                                numVisible: 3
                            };
                            break;
                        case "/sport" :
                            opts = {
                                prependTo: context.querySelector('.trailblock ul > li'),
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
        },
        
        showFrontStories: function(config) {
            var frontStories = new FrontStories();
            frontStories.init(config);
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.showTrailblockToggles();
            modules.showTrailblockShowMore();
            modules.showFootballFixtures();
            modules.showFrontStories(config);
        }
        common.mediator.emit("page:front:ready", config, context);
    };

    return {
        init: ready
    };

});
