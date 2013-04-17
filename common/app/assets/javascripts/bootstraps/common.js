define([
    //Commmon libraries
    'common',
    'ajax',
    'modules/detect',
    'modules/userPrefs',
    //Vendor libraries
    'domReady',
    'qwery',
    //Modules
    'modules/popular',
    'modules/related',
    'modules/router',
    'modules/errors',
    'modules/images',
    'modules/navigation/top-stories',
    'modules/navigation/sections',
    'modules/navigation/search',
    'modules/navigation/control',
    'modules/fonts',
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
    ajax,
    detect,
    userPrefs,

    domReady,
    qwery,

    popular,
    related,
    Router,
    Errors,
    Images,
    TopStories,
    Sections,
    Search,
    NavControl,
    Fonts,
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

        initialiseAjax: function(config) {
            ajax.init(config.page.ajaxUrl);
        },

        attachGlobalErrorHandler: function (config) {
            var e = new Errors({
                window: window,
                isDev: config.page.isDev
            });
            e.init();
            common.mediator.on("module:error", e.log);
        },

        upgradeImages: function () {
            var images = new Images();
            common.mediator.on('page:ready', function(config, context) {
                images.upgrade(context);
            });
            common.mediator.on('fragment:ready:images', function(context) {
                images.upgrade(context);
            });
        },

        showDebug: function () {
            new Debug().show();
        },

        initialiseNavigation: function (config) {
            var navControl = new NavControl();
            var sections = new Sections();
            var search = new Search(config);
            common.mediator.on('page:ready', function(config, context) {
                navControl.init(context);
                sections.init(context);
                search.init(context);
            });
        },

        transcludeTopStories: function () {
            var topStories = new TopStories();
            common.mediator.on('page:ready', function(config, context) {
                topStories.load(config, context);
            });
        },

        transcludeRelated: function () {
            common.mediator.on("page:article:ready", function(config, context){
                related(config, context);
            });
        },

        transcludePopular: function () {
            common.mediator.on('page:ready', function(config, context) {
                popular(config, context);
            });
        },

        showTabs: function() {
            var tabs = new Tabs();
            common.mediator.on('modules:popular:loaded', function(el) {
                tabs.init(el);
            });
        },

        loadFonts: function(config, ua) {
            if(config.switches.webFonts) {
                var fileFormat = detect.getFontFormatSupport(ua),
                    fontStyleNodes = document.querySelectorAll('[data-cache-name].initial');
                var f = new Fonts(fontStyleNodes, fileFormat);
                f.loadFromServerAndApply();
            }
        },

        showRelativeDates: function () {
            var dates = RelativeDates;
            common.mediator.on('page:ready', function(config, context) {
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

            var cs = new Clickstream({ filter: ["a", "span", "button"] }),
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
                                "experiments": JSON.stringify(data)
                            };
                        });
                    }
                Ophan.startLog();
            });
        },

        loadAdverts: function (config) {

            if (config.switches.adverts) {
                Adverts.init(config);
                common.mediator.on('modules:adverts:docwrite:loaded', Adverts.loadAds);
            }
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

        initialiseAbTesting: function(config, context) {
            common.mediator.on('ab:loaded', function() {
                modules.loadOmnitureAnalytics(config);
                modules.loadOphanAnalytics(config);
            });

            AB.init(config, context);
        }
    };

    var pageReady = function (config, context) {
        common.deferToLoadEvent(function() {
            modules.initialiseAbTesting(config, context);
            modules.loadAdverts(config);
            modules.cleanupCookies();
            modules.showSharedWisdomToolbar(config);
        });
    };

    var runOnce = function (config) {
        modules.initialiseAjax(config);
        modules.attachGlobalErrorHandler(config);
        modules.loadFonts(config, navigator.userAgent);
        modules.showDebug();

        modules.upgradeImages();
        modules.showTabs();
        modules.showRelativeDates();
        modules.transcludeRelated();
        modules.transcludePopular();
        modules.transcludeTopStories();
        modules.initialiseNavigation(config);
    };

    return {
        runOnce: runOnce,
        pageReady: pageReady
    };

});
