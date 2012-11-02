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
        'modules/adverts/adverts',
        'bean',
        'modules/more-matches',
        'bonzo',
        'modules/togglepanel',
        'modules/errors',
        'modules/autoupdate',
        'modules/footballfixtures'
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
        Adverts,
        bean,
        MoreMatches,
        bonzo,
        TogglePanel,
        Errors,
        AutoUpdate,
        FootballFixtures) {

        var modules = {

            hideJsElements: function () {
                var html = common.$g('body')[0];
                bonzo(html).toggleClass('js-off js-on');
            },

            attachGlobalErrorHandler: function () {
                var e = new Errors(window);
                e.init();
                common.mediator.on("module:error", e.log);
            },

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

            loadOmnitureAnalytics: function (config) {
                var cs = new Clickstream({ filter: ["a", "span", "button"] }),
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

            showMoreMatches: function() {
                var matchesNav = document.getElementById('matches-nav');
                MoreMatches.init(matchesNav);
            },

            bindTogglePanels: function () {
                var tp = new TogglePanel();
                tp.init();
            },

            liveBlogging: function(config) {
                if(config.page.isLive) {
                    var path = window.location.pathname,
                        delay = 60000,
                        el = document.querySelector(".article-body");

                    var a = new AutoUpdate(window.location.pathname, delay, el, config.switches).init();

                }
            },

            showFootballFixtures: function(page) {
                    var path = window.location.pathname,
                    prependTo = null,
                    table;

                common.mediator.on('modules:footballfixtures:expand', function(id) {
                    var expandable = new Expandable({ id: id, expanded: false });
                    expandable.initalise();
                });

                switch(path) {
                    case "/" :
                        prependTo = qwery('ul > li', '.zone-sport')[1];
                        table = new FootballFixtures({prependTo: prependTo, competitions: ['500', '510', '100'], expandable: true}).init();
                        break;
                    case "/sport" :
                        prependTo = qwery('ul > li', '.trailblock')[1];
                        table = new FootballFixtures({prependTo: prependTo, expandable: true}).init();
                        break;
                    case "/football" :
                        prependTo = qwery('ul > li', '.trailblock')[1];
                        table = new FootballFixtures({prependTo: prependTo, expandable: false}).init();
                        break;
                }

                if(page.paFootballCompetition) {
                    prependTo = qwery('ul > li', '.trailblock')[1];
                    table = new FootballFixtures({prependTo: prependTo, competitions: [page.paFootballCompetition], expandable: false}).init();
                }
            }

        };

    var bootstrap = function (config, userPrefs) {
        
        var isNetworkFront = (config.page.pageId === "");

        modules.hideJsElements();
        modules.attachGlobalErrorHandler();
        modules.upgradeImages();
        modules.transcludeRelated(config);
        modules.showRelativeDates();
        modules.showTabs();
        modules.transcludeNavigation(config);
        modules.transcludeMostPopular(config.page.coreNavigationUrl, config.page.section, config.page.edition);
        modules.liveBlogging(config);
        modules.showFootballFixtures(config.page);

        // trailblock toggles and expanders are now on sport and culture section fronts
        if (["", "sport", "culture"].indexOf(config.page.pageId) !== -1) {
            modules.showTrailblockToggles(config);
            modules.showFrontExpanders();
        }

        if (!isNetworkFront) {
            modules.transcludeTopStories(config);
        }
        
        // page-specific functionality
        // loading only occurs on fixtures and results homepage (i.e. not on date)
        var footballIndexRegex = /\/football(\/.*)?\/(fixtures|results)$/g;
        if (window.location.pathname.match(footballIndexRegex)) {
            modules.showMoreMatches();
        }

        modules.loadFonts(config, navigator.userAgent, userPrefs);

        // auto-update for live page
        if (config.page.pageId === 'football/live') {
            // only load auto update module if there is a live match currently on
            if (qwery('.match.live-match').length) {
                // load the auto update
                // TODO - confirm update is every 10secs
                new AutoUpdate(window.location.pathname, 10000, qwery(".matches-container")[0], config.switches).init();
            }
        }
        
        modules.bindTogglePanels();

        // If you can wait for load event, do so.
        deferToLoadEvent(function() {
            modules.loadOmnitureAnalytics(config);
            modules.loadOphanAnalytics();
            modules.loadAdverts(config.page);
        });

    };

    // domReady proxy for bootstrap
    var domReadyBootstrap = function (config, userPrefs) {
        domReady(function () {
            bootstrap(config, userPrefs);
        });
    };

    var deferToLoadEvent = function(ref) {
        if (document.readyState === 'complete') {
            ref();
        } else {
            window.addEventListener('load', function() {
                ref();
            });
        }
    };

    return {
        go: domReadyBootstrap
    };

});
