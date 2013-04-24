define([
    //Commmon libraries
    'common',
    'modules/userPrefs',
    //Vendor libraries
    'domReady',
    'bonzo',
    //Modules
    'modules/popular',
    'modules/related',
    'modules/router',
    'modules/images',
    'modules/navigation/top-stories',
    'modules/navigation/sections',
    'modules/navigation/search',
    'modules/navigation/control',
    'modules/tabs',
    'modules/relativedates',
    'modules/analytics/clickstream',
    'modules/analytics/omniture',
    'modules/analytics/optimizely',
    'modules/adverts/adverts',
    'modules/cookies',
    'modules/analytics/omnitureMedia',
    'modules/debug',
    'modules/experiments/ab'
], function (
    common,
    userPrefs,

    domReady,
    bonzo,

    popular,
    related,
    Router,
    Images,
    TopStories,
    Sections,
    Search,
    NavControl,
    Tabs,
    RelativeDates,
    Clickstream,
    Omniture,
    optimizely,
    Adverts,
    Cookies,
    Video,
    Debug,
    AB
) {

    var modules = {

        upgradeImages: function () {
            var images = new Images();
            common.mediator.on('page:common:ready', function(config, context) {
                images.upgrade(context);
            });
            common.mediator.on('fragment:ready:images', function(context) {
                images.upgrade(context);
            });
        },

        initialiseNavigation: function (config) {
            var navControl = new NavControl();
            var sections = new Sections();
            var search = new Search(config);
            common.mediator.on('page:common:ready', function(config, context) {
                var header = bonzo(context.querySelector('header'));
                if(!header.hasClass('initialised')) {
                    header.addClass('initialised');

                    navControl.init(context);
                    sections.init(context);
                    search.init(context);
                }
            });
        },

        transcludeTopStories: function () {
            var topStories = new TopStories();
            common.mediator.on('page:common:ready', function(config, context) {
                topStories.load(config, context);
            });
        },

        transcludeRelated: function () {
            common.mediator.on("page:common:ready", function(config, context){
                related(config, context);
            });
        },

        transcludePopular: function () {
            common.mediator.on('page:common:ready', function(config, context) {
                popular(config, context);
            });
        },

        showTabs: function() {
            var tabs = new Tabs();
            common.mediator.on('modules:popular:loaded', function(el) {
                tabs.init(el);
            });
        },

        showRelativeDates: function () {
            var dates = RelativeDates;
            common.mediator.on('page:common:ready', function(config, context) {
                dates.init(context);
            });
            common.mediator.on('fragment:ready:dates', function(el) {
                dates.init(el);
            });
        },

        loadOmnitureAnalytics: function (config) {
            common.mediator.on('module:omniture:loaded', function() {
                var videos = document.getElementsByTagName("video");
                if(videos) {
                    for(var i = 0, l = videos.length; i < l; i++) {
                        var v = new Video({
                            el: videos[i],
                            config: config
                        }).init();
                    }
                }
            });

            var cs = new Clickstream({filter: ["a", "button"]}),
                o = new Omniture(null, config).init();
        },

        loadOphanAnalytics: function (config) {
            require(config.page.ophanUrl, function (Ophan) {
                    if(AB.inTest(config.switches)) {
                        Ophan.additionalViewData(function() {
                            var test = AB.getTest(),
                                data = [
                                    {
                                        id: test.id,
                                        variant: test.variant
                                    }
                                ];
                            return {
                                "experiments_json": JSON.stringify(data)
                            };
                        });
                    }
                Ophan.startLog();
            });
        },

        loadAdverts: function (config) {
            common.mediator.on('page:common:deferred:loaded', function(config, context) {
                if (config.switches.adverts) {
                    Adverts.init(config, context);
                    common.mediator.on('modules:adverts:docwrite:loaded', Adverts.loadAds);
                }
            });
        },

        cleanupCookies: function() {
            Cookies.cleanUp(["mmcore.pd", "mmcore.srv", "mmid"]);
        },

        initialiseSearch: function(config) {
            var s = new Search(config);
            common.mediator.on('modules:control:change:sections-control-header:true', function(args) {
                s.init();
            });
        },

        showSharedWisdomToolbar: function(config) {
            // only display if switched on
            if (userPrefs.isOn('shared-wisdom-toolbar')) {
                require('modules/shared-wisdom-toolbar', function(sharedWisdomToolbar) {
                    sharedWisdomToolbar.init(function() {
                        sharedWisdomToolbar.show();
                    }, config.modules.sharedWisdomToolbar);
                });
            }
        },

        initialiseAnalyticsAndAbTesting: function(config, context) {
            common.mediator.on('ab:loaded', function() {
                modules.loadOmnitureAnalytics(config);
                modules.loadOphanAnalytics(config);
            });

            AB.init(config, context);
        }
    };

    var deferrable = function (config, context) {
        if (!this.initialisedDeferred) {
            this.initialisedDeferred = true;
            common.deferToLoadEvent(function() {
                modules.loadAdverts();

                // TODO: make these run in event 'page:common:deferred:loaded'
                modules.initialiseAnalyticsAndAbTesting(config, context);
                modules.cleanupCookies(context);
                modules.showSharedWisdomToolbar(config);
            });
        }

        common.mediator.emit("page:common:deferred:loaded", config, context);
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.upgradeImages();
            modules.showTabs();
            modules.showRelativeDates();
            modules.transcludeRelated();
            modules.transcludePopular();
            modules.transcludeTopStories();
            modules.initialiseNavigation(config);
        }
        common.mediator.emit("page:common:ready", config, context);
    };

    var init = function (config, context) {
        ready(config, context);
        deferrable(config, context);
    };

    return {
        init: init
    };
});
