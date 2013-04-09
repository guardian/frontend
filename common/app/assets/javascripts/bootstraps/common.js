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
    'modules/navigation/controls',
    'modules/navigation/top-stories',
    'modules/navigation/sections',
    'modules/navigation/search',
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
    'modules/shared-wisdom-toolbar'
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
    Control,
    TopStories,
    Sections,
    Search,
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
    sharedWisdomToolbar
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

            // the section panel
            new Sections().init();
            new Search(config).init();

            // the toolbar
            var t = new Control({id: 'topstories-control-header'}),
                s = new Control({id: 'search-control-header'}),
                n = new Control({id: 'sections-control-header'});

            t.init();
            s.init();
            n.init();

            common.mediator.on('modules:topstories:render', function(args) {
                t.show();
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
            var dependOn = [config.page.ophanUrl];
            if (config.switches.optimizely === true) {
                dependOn.push('js!' + config.page.optimizelyUrl);
            }
            require(dependOn, function (Ophan) {
                if (config.switches.optimizely === true) {
                    Ophan.additionalViewData(function() {
                        return {
                            "optimizely": optimizely.readTests()
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
        
        showSharedWisdomToolbar: function() {
        	sharedWisdomToolbar.init(function() {
        		sharedWisdomToolbar.show();
        	});
        }
    };

    var pageReady = function (config, context) {
        modules.initialiseNavigation(config);

        common.deferToLoadEvent(function() {
            modules.loadOmnitureAnalytics(config, context);
            modules.loadOphanAnalytics(config, context);
            modules.loadAdverts(config, context);
            modules.cleanupCookies(context);
            modules.showSharedWisdomToolbar();
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
    };

    return {
        runOnce: runOnce,
        pageReady: pageReady
    };

});
