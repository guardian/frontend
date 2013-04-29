define([
    //Commmon libraries
    'common',
    'modules/userPrefs',
    //Vendor libraries
    'domReady',
    'bonzo',
    //Modules
    'modules/pageconfig',
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

    pageConfig,
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

        initSwipe: function(config) { // TODO: config shouldn;t be passed here; should come via jsonp reaponse and be passed into afterShow
            
            var pages = document.querySelector('#swipepages');
            var page0 = pages.querySelector('#swipepage-0 .parts');
            var page1 = pages.querySelector('#swipepage-1 .parts');
            var page2 = pages.querySelector('#swipepage-2 .parts');

            var head = page1.querySelector('.parts__head');
            var foot = page1.querySelector('.parts__foot');

            bonzo(page0).append(head.cloneNode(true));
            bonzo(page0).append(bonzo.create('<div class="parts__body">'));
            bonzo(page0).append(foot.cloneNode(true));

            bonzo(page2).append(head.cloneNode(true));
            bonzo(page2).append(bonzo.create('<div class="parts__body">'));
            bonzo(page2).append(foot.cloneNode(true));

            var opts = {
                afterShow: function(swipeSpec) {
                    var edition;

                    if( swipeSpec.initiatedBy !== 'initial') {
                        common.mediator.emit('page:ready', pageConfig(swipeSpec.config), swipeSpec.visiblePane);
                    }

                    if( swipeSpec.initiatedBy === 'initial' || swipeSpec.initiatedBy === 'link') {
                        edition = [];
                        // First page in edition is the referrer
                        edition.push(common.urlPath(swipeSpec.config.referrer));
                        // Second page in edition is the current page
                        common.pushIfNew(window.location.pathname, edition);
                        // Remaining pages are scraped from trails
                        common.$g('.trail h2 a, .trail h3 a', swipeSpec.visiblePane).each(function(el, index) {
                            common.pushIfNew(el.pathname, edition);
                        });
                        if (edition.length >= 3) {
                            swipeSpec.api.setEdition(edition);
                        }
                    }
                },
                el: '#swipepages',
                bodySelector: '.parts__body',
                linkSelector: 'a:not(.control)',
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
            modules.initSwipe(config);
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
