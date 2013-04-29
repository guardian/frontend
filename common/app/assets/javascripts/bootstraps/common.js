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
    'modules/experiments/ab',
    'modules/editionswipe'
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
    AB,
    editionSwipe
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

        loadAnalytics: function () {
            var cs = new Clickstream({filter: ["a", "button"]}),
                omniture = new Omniture();

            common.mediator.on('page:common:deferred:loaded', function(config, context) {

                // AB must execute before Omniture
                AB.init(config);

                omniture.go(config, function(){
                    // Omniture callback logic:

                    Array.prototype.forEach.call(context.getElementsByTagName("video"), function(video){
                        if (!bonzo(video).hasClass('tracking-applied')) {
                            bonzo(video).addClass('tracking-applied');
                            var v = new Video({
                                el: video,
                                config: config
                            }).init();
                        }
                    });
                });

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

        initEditionSwipe: function(config) { // TODO: config shouldn;t be passed here; should come via jsonp reaponse and be passed into afterShow
            var opts = {
                afterShow: function(configSwipe) {
                    var edition;

                    config.swipe = configSwipe;

                    if( config.swipe.initiatedBy === 'initial' || config.swipe.initiatedBy === 'link') {
                        edition = [];
                        // First page in edition is the referrer
                        edition.push(common.urlPath(config.swipe.referrer));
                        // Second page in edition is the current page
                        common.pushIfNew(window.location.pathname, edition);
                        // Remaining pages are scraped from trails
                        common.$g('li[data-link-name="trail"] a', config.swipe.visiblePane).each(function(el, index) {
                            common.pushIfNew(el.pathname, edition);
                        });
                        if (edition.length >= 3) {
                            config.swipe.api.setEdition(edition);
                        }
                    }

                    if( config.swipe.initiatedBy !== 'initial') {
                        common.mediator.emit('page:ready', config, config.swipe.visiblePane);
                    }

                },
                el: '#swipepages',
                linkSelector: 'a:not(.control)',
                ajaxStrip: [
                    [/^[\s\S]*<div id=\"swipepage-1\">/, ''],
                    [/<\/div swipepage-1>[\s\S]*$/, '']
                ],
                widthGuess: 1
            };
            editionSwipe(opts);
        }
    };

    var deferrable = function (config, context) {
        var self = this;
        common.deferToLoadEvent(function() {
            if (!self.initialisedDeferred) {
                self.initialisedDeferred = true;
                modules.loadAdverts();
                modules.loadAnalytics();

                // TODO: make these run in event 'page:common:deferred:loaded'
                modules.cleanupCookies(context);
                modules.showSharedWisdomToolbar(config);
            }
            common.mediator.emit("page:common:deferred:loaded", config, context);
        });
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
            modules.initEditionSwipe(config);
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
