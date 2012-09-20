define([
        'common',
        'modules/related',
        'modules/images',
        'modules/popular',
        'modules/expandable',
        'vendor/ios-orientationchange-fix',
        'modules/relativedates',
        'modules/analytics/clickstream',
        'modules/analytics/omniture',
        'modules/tabs',
        'modules/fonts',
        'qwery',
        'modules/detect',
        'modules/navigation/top-stories.js',
        'modules/navigation/controls.js',
        'domReady'
    ],
    function (
        common,
        Related,
        Images,
        Popular,
        Expandable,
        Orientation,
        RelativeDates,
        Clickstream,
        Omniture,
        Tabs,
        Fonts,
        qwery,
        detect,
        TopStories,
        NavigationControls,
        domReady) {

        var modules = {

            isNetworkFront: false, // use this to disable some functions for NF

            setNetworkFrontStatus: function(status) {
                this.isNetworkFront = (status === "") ? true : false;
            },

            upgradeImages: function () {
                var i = new Images();
                i.upgrade();
            },

            transcludeNavigation: function (config) {
                new NavigationControls().initialise();

                if (!this.isNetworkFront) {
                    new TopStories().load(config);
                }

            },

            transcludeRelated: function (host, pageId, showInRelated) {

                var url =  host + '/related/UK/' + pageId,
                     hasStoryPackage = !document.getElementById('js-related'),
                     relatedExpandable = new Expandable({ id: 'related-trails', expanded: false });
               
                if (hasStoryPackage) {
                    relatedExpandable.initalise();
                }
    

                if (!hasStoryPackage && showInRelated) {
                    common.mediator.on('modules:related:render', relatedExpandable.initalise);
                    new Related(document.getElementById('js-related')).load(url);
                }
            },

            transcludeMostPopular: function (host, section) {

                if (this.isNetworkFront) { return false; }

                var url = host + '/most-popular/UK/' + section,
                    domContainer = document.getElementById('js-popular');

                new Popular(domContainer).load(url);
                
                common.mediator.on('modules:popular:render', function () {
                    common.mediator.emit('modules:tabs:render', '#js-popular-tabs');
                    qwery('.trailblock', domContainer).forEach(function (tab) {
                        var popularExpandable = new Expandable({ id: tab.id, expanded: false });
                        common.mediator.on('modules:popular:render', popularExpandable.initalise);
                    });
                });
            },

            loadFonts: function(config, ua, prefs) {
                var fileFormat = detect.getFontFormatSupport(ua),
                    fontStyleNodes = document.querySelectorAll('[data-cache-name].initial');
                if (config.switches.fontFamily && prefs.exists('font-family')) {
                    new Fonts(fontStyleNodes, fileFormat).loadFromServerAndApply();
                } else {
                    Fonts.clearFontsFromStorage();
                }
            },

            showRelativeDates: function () {
                RelativeDates.init();
            },

            loadOmnitureAnalytics: function (config) {
                var cs = new Clickstream({ filter: ["a", "span"] }),
                    o = new Omniture(null, config).init();
            },

            loadOphanAnalytics: function () {
                require(['http://s.ophan.co.uk/js/t6.min.js'], function (ophan) {});
            },

            showTabs: function () {
                var tabs = new Tabs().init();
            }
         
        };

    var bootstrap = function (config, userPrefs) {
        modules.setNetworkFrontStatus(config.page.pageId);
        modules.upgradeImages();
        modules.transcludeRelated(config.page.coreNavigationUrl, config.page.pageId, config.page.showInRelated);
        modules.transcludeMostPopular(config.page.coreNavigationUrl, config.page.section);
        modules.showRelativeDates();
        modules.showTabs();
        modules.transcludeNavigation(config);
        modules.loadOmnitureAnalytics(config);
        modules.loadFonts(config, navigator.userAgent, userPrefs);
        modules.loadOphanAnalytics();
    };

    // domReady proxy for bootstrap
    var domReadyBootstrap = function (config, userPrefs) {
        domReady(function () {
            bootstrap(config, userPrefs);
        });
    };

    return {
        go: domReadyBootstrap
    };

});
