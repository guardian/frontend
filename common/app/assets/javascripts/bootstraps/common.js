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
    'modules/router',
    'modules/errors',
    'modules/images',
    'modules/navigation/controls',
    'modules/navigation/top-stories',
    'modules/navigation/sections',
    'modules/navigation/search',
    'modules/related',
    'modules/popular',
    'modules/expandable',
    'modules/fonts',
    'modules/tabs',
    'modules/relativedates',
    'modules/analytics/clickstream',
    'modules/analytics/omniture',
    'modules/analytics/optimizely',
    'modules/adverts/adverts',
    'modules/cookies',
    'modules/analytics/omnitureMedia',
    'modules/debug'
], function (
    common,
    ajax,
    detect,
    userPrefs,

    domReady,
    qwery,

    Router,
    Errors,
    Images,
    Control,
    TopStories,
    Sections,
    Search,
    Related,
    Popular,
    Expandable,
    Fonts,
    Tabs,
    RelativeDates,
    Clickstream,
    Omniture,
    optimizely,
    Adverts,
    Cookies,
    Video,
    Debug
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
            new Images().upgrade();
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

        transcludeTopStories: function (config) {
            new TopStories().load(config);
        },

        transcludeRelated: function (config){
            common.mediator.on("modules:related:load", function(){
                var relatedExpandable,
                    pageId,
                    url;

                if (config.page.hasStoryPackage) {
                    relatedExpandable = new Expandable({ id: 'related-trails', expanded: false });
                    relatedExpandable.init();
                } else {
                    pageId = config.page.pageId;
                    url =  '/related/' + pageId;
                    common.mediator.on('modules:related:render', function() {
                        relatedExpandable = new Expandable({ id: 'related-trails', expanded: false });
                        relatedExpandable.init();
                    });
                    new Related(document.getElementById('js-related'), config.switches).load(url);
                }
            });
        },

        transcludeMostPopular: function (section, edition) {
            var url = '/most-read' + (section ? '/' + section : '') + '.json',
                domContainer = document.getElementById('js-popular');

            if (domContainer) {
                new Popular(domContainer).load(url);
                common.mediator.on('modules:popular:render', function() {
                    common.mediator.emit('modules:tabs:render', '#js-popular-tabs');
                });
            }

        },

        showTabs: function() {
            var t = new Tabs().init();
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
            RelativeDates.init();
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
        }
    };

    var pageView = function (config) {
        modules.upgradeImages();
        modules.showTabs();
        modules.initialiseNavigation(config);
        modules.transcludeTopStories(config);
        modules.transcludeRelated(config);
        modules.transcludeMostPopular(config.page.section, config.page.edition);
        modules.showRelativeDates();

        common.deferToLoadEvent(function() {
            modules.loadOmnitureAnalytics(config);
            modules.loadOphanAnalytics(config);
            modules.loadAdverts(config);
            modules.cleanupCookies();
        });
    };

    var runOnce = function (config) {
        modules.showDebug();
        modules.initialiseAjax(config);
        modules.attachGlobalErrorHandler(config);
        modules.loadFonts(config, navigator.userAgent);
    };

    return {
        runOnce: runOnce,
        pageView: pageView
    };

});
