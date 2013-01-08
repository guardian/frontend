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
    'modules/navigation/sections',
    'modules/related',
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
    Control,
    TopStories,
    Sections,
    Related,
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

        initialiseNavigation: function (config) {
           
            // the section panel
            new Sections().init();

            // the toolbar
            var t = new Control({id: 'topstories-control-header'}),
                s = new Control({id: 'sections-control-header'});

            t.init();
            s.init();

            common.mediator.on('modules:topstories:render', function(args) {
                t.show();
            });
        },

        transcludeTopStories: function (config) {
            new TopStories().load(config);
        },

        transcludeRelated: function (config){

          common.mediator.on("modules:related:load", function(url){

              var hasStoryPackage = document.getElementById("related-trails") !== null;

              var relatedExpandable = new Expandable({ id: 'related-trails', expanded: false });

              if (hasStoryPackage) {
                  relatedExpandable.init();
              } else {
                  common.mediator.on('modules:related:render', relatedExpandable.init);
                  new Related(document.getElementById('js-related'), config.switches).load(url[0]);
              }
          });
        },

        transcludeMostPopular: function (host, section, edition) {
            var url = host + '/most-popular' + (section ? '/' + section : ''),
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

        loadFonts: function(config, ua, prefs) {
            var showFonts = false;
            if(config.switches.webFonts) {
                showFonts = true;
            }
            
            var fileFormat = detect.getFontFormatSupport(ua),
                fontStyleNodes = document.querySelectorAll('[data-cache-name].initial');
            
            var f = new Fonts(fontStyleNodes, fileFormat);
            if (showFonts) {
                f.loadFromServerAndApply();
            } else {
                f.clearFontsFromStorage();
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

        modules.initialiseNavigation(config);
        modules.transcludeTopStories(config);

        modules.transcludeRelated(config);
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
