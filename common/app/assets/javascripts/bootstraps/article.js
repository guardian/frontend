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
        'modules/navigation/top-stories',
        'modules/navigation/controls',
        'domReady',
        'modules/trailblocktoggle',
        'bean',
        'modules/more-fixtures',
        'bonzo'
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
        domReady,
        TrailblockToggle,
        bean,
        MoreFixtures,
        bonzo) {

        var modules = {

            upgradeImages: function () {
                var i = new Images();
                i.upgrade();
            },

            transcludeNavigation: function (config) {
                new NavigationControls().initialise();
            },

            transcludeTopStories: function (config) {
                new TopStories().load(config);
            },

            transcludeRelated: function (config){
                var host = config.page.coreNavigationUrl,
                    pageId = config.page.pageId,
                    showInRelated = config.page.showInRelated,
                    edition = config.page.edition;

                var url =  host + '/related/' + edition + '/' + pageId,
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

            transcludeMostPopular: function (host, section, edition) {
                var url = host + '/most-popular/' + edition + '/' + section,
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
            },

            showFrontExpanders: function () {
                var frontTrailblocks = common.$g('.js-front-trailblock'), i, l;
                for (i=0, l=frontTrailblocks.length; i<l; i++) {
                    var elm = frontTrailblocks[i];
                    var id = elm.id;
                    var frontExpandable = new Expandable({ id: id, expanded: false });
                    frontExpandable.initalise();
                }
            },

            showTrailblockToggles: function (config) {
                var edition = config.page.edition;
                var tt = new TrailblockToggle();
                tt.go(edition);
            },
            
            showMoreFixtures: function() {
            	var fixturesNav = document.getElementById('fixtures-nav');
            	MoreFixtures.init(fixturesNav);
            	bean.add(fixturesNav, 'a', 'click', function(e) {
            		e.preventDefault();
            		common.mediator.emit('ui:more-fixtures:clicked', [e.currentTarget]);
            	})
            }
         
        };

    var bootstrap = function (config, userPrefs) {

        var isNetworkFront = (config.page.pageId === "");
        
        modules.upgradeImages();
        modules.transcludeRelated(config);
        modules.showRelativeDates();
        modules.showTabs();
        modules.transcludeNavigation(config);
        modules.transcludeMostPopular(config.page.coreNavigationUrl, config.page.section, config.page.edition);
        
        switch (isNetworkFront) {

            case true:
                modules.showFrontExpanders();
                modules.showTrailblockToggles(config);
                break;

            case false:
                modules.transcludeTopStories(config);
                break;
        
        }
        
        // page specific functionality
        switch (config.page.pageId) {
        
        	case 'football/fixtures':
        		// loading only occurs on fixtures homepage (i.e. not on date)
        		if (window.location.pathname === '/football/fixtures') {
        			modules.showMoreFixtures();
        		}
        	
        }
        
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
