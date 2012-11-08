define([
        //Commmon libraries
        'common',
        'modules/detect',
        //Vendor libraries
        'domReady',
        'bonzo',
        'qwery',
        //Moodules
        'modules/router',
        'modules/errors',
        'modules/images',
        'modules/navigation/controls',
        'modules/navigation/top-stories',
        'modules/popular',
        'modules/expandable',
        'modules/fonts',
        'modules/relativedates',
        'modules/tabs',
        'modules/analytics/clickstream',
        'modules/analytics/omniture',
        'modules/adverts/adverts',
        'modules/cookies'
    ],
    function (
        common,
        detect,

        domReady,
        bonzo,
        qwery,

        Router,
        Errors,
        Images,
        NavigationControls,
        TopStories,
        Popular,
        Expandable,
        Fonts,
        RelativeDates,
        Tabs,
        Clickstream,
        Omniture,
        Adverts,
        Cookies
    ) {

        var modules = {

            attachGlobalErrorHandler: function () {
                var e = new Errors(window);
                    e.init();
                common.mediator.on("module:error", e.log);
            },

            upgradeImages: function () {
                new Images().upgrade();
            },

            transcludeNavigation: function (config) {
                new NavigationControls().init();
            },

            transcludeTopStories: function (config) {
                new TopStories().load(config);
            },

            transcludeMostPopular: function (host, section, edition) {
                var url = host + '/most-popular/' + edition + '/' + section,
                    domContainer = document.getElementById('js-popular');
                new Popular(domContainer).load(url);

                common.mediator.on('modules:popular:render', function () {
                    common.mediator.emit('modules:tabs:render', '#js-popular-tabs');
                    qwery('.trailblock', domContainer).forEach(function (tab) {
                        var popularExpandable = new Expandable({ id: tab.id, expanded: false });
                        common.mediator.on('modules:popular:render', popularExpandable.init());
                    });
                });
            },

            loadFonts: function(config, ua, prefs) {
                var showFonts = false;
                if(config.switches.fontFamily || prefs.isOn('font-family')) {
                    showFonts = true;
                }
                if (prefs.isOff('font-family')) {
                    showFonts = false;
                }
                var fileFormat = detect.getFontFormatSupport(ua),
                    fontStyleNodes = document.querySelectorAll('[data-cache-name].initial');
                if (showFonts) {
                    new Fonts(fontStyleNodes, fileFormat).loadFromServerAndApply();
                } else {
                    Fonts.clearFontsFromStorage();
                }
            },

            showRelativeDates: function () {
                RelativeDates.init();
            },

            showTabs: function () {
                var t = new Tabs().init();
            },


            loadOmnitureAnalytics: function (config) {
                var cs = new Clickstream({ filter: ["a", "span", "button"] }),
                    o = new Omniture(null, config).init();
            },

            loadOphanAnalytics: function () {
                require(['http://s.ophan.co.uk/js/t6.min.js'], function (ophan) {});
            },

            loadAdverts: function (config) {
                Adverts.init(config);
                Adverts.loadAds();

                // Check every second if page has scrolled and attempt to load new ads.
                var currentScroll = window.pageYOffset;
                setInterval(function() {
                    if (window.pageYOffset !== currentScroll) {
                        currentScroll = window.pageYOffset;
                        Adverts.loadAds();
                    }
                }, 1000);
            },

            cleanupCookies: function() {
                Cookies.cleanUp(["mmcore.pd", "mmcore.srv", "mmid"]);
            }
    };

    var routes = function() {
        // var r = new Router();

        // r.add('', function() {

        // });
    };

    // All methods placed inside here will exec after DOMReady
    var ready = function(config, userPrefs) {
        domReady(function() {
            modules.attachGlobalErrorHandler();
            modules.transcludeNavigation(config);

            modules.loadFonts(config, navigator.userAgent, userPrefs);
            modules.upgradeImages();
            
            modules.showRelativeDates();
            modules.showTabs();

            routes();
        });
    };

    // If you can wait for load event, do so.
    var defer = function(config, userPrefs) {
        common.deferToLoadEvent(function() {
            modules.loadOmnitureAnalytics(config);
            modules.loadOphanAnalytics();
            modules.loadAdverts(config);
            modules.cleanupCookies();
        });
    };

    var init = function (config, userPrefs) {
        ready(config, userPrefs);
        defer(config, userPrefs);
    };

    return {
        go: init
    };

});
