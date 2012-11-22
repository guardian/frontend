define([
    //Commmon libraries
    'common',
    'modules/detect',
    'modules/userPrefs',
    //Vendor libraries
    'domReady',
    'qwery',
    //Modules
    'modules/router',
    'modules/errors',
    'modules/images',
    'modules/navigation/controls',
    'modules/navigation/top-stories',
    'modules/popular',
    'modules/expandable',
    'modules/fonts',
    'modules/tabs',
    'modules/relativedates',
    'modules/analytics/clickstream',
    'modules/analytics/omniture',
    'modules/adverts/adverts',
    'modules/cookies'
], function (
    common,
    detect,
    userPrefs,

    domReady,
    qwery,

    Router,
    Errors,
    Images,
    NavigationControls,
    TopStories,
    Popular,
    Expandable,
    Fonts,
    Tabs,
    RelativeDates,
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
                domContainer = document.getElementById('js-popular'),
                p = new Popular(domContainer).load(url);

            common.mediator.on('modules:popular:render', function() {
                common.mediator.emit('modules:tabs:render', '#js-popular-tabs');
            });
        },

        showTabs: function() {
            var t = new Tabs().init();
        },

        loadFonts: function(config, ua, prefs) {
            var showFonts = false;
            if(config.switches.webFonts) {
                showFonts = true;
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

        loadOmnitureAnalytics: function (config) {
            var cs = new Clickstream({ filter: ["a", "span", "button"] }),
                o = new Omniture(null, config).init();
        },

        loadOphanAnalytics: function () {
            require(['js!http://s.ophan.co.uk/js/t6.min.js'], function (ophan) {});
        },

        loadAdverts: function (config) {
            Adverts.init(config);

            common.mediator.on('modules:adverts:docwrite:loaded', Adverts.loadAds);
        },

        cleanupCookies: function() {
            Cookies.cleanUp(["mmcore.pd", "mmcore.srv", "mmid"]);
        }
    };

    var ready = function(config) {
        modules.attachGlobalErrorHandler();
        modules.loadFonts(config, navigator.userAgent, userPrefs);
        modules.upgradeImages();
        modules.showTabs();

        modules.transcludeNavigation(config);
        modules.transcludeTopStories(config);

        modules.transcludeMostPopular(config.page.coreNavigationUrl, config.page.section, config.page.edition);

        modules.showRelativeDates();
    };

    // If you can wait for load event, do so.
    var defer = function(config) {
        common.deferToLoadEvent(function() {
            modules.loadOmnitureAnalytics(config);
            modules.loadOphanAnalytics();
            modules.loadAdverts(config);
            modules.cleanupCookies();
        });
    };

    var init = function (config) {
        ready(config, userPrefs);
        defer(config);
    };

    return {
        init: init
    };

});
