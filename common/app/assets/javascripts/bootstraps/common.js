define([
    //Commmon libraries
    'common',
    'ajax',
    'modules/userPrefs',
    //Vendor libraries
    'domReady',
    'bonzo',
    //Modules
    'modules/storage',
    'modules/detect',
    'modules/popular',
    'modules/related',
    'modules/router',
    'modules/images',
    'modules/navigation/top-stories',
    'modules/navigation/sections',
    'modules/navigation/search',
    'modules/navigation/control',
    'modules/navigation/australia',
    'modules/navigation/edition-switch',
    'modules/tabs',
    'modules/relativedates',
    'modules/analytics/clickstream',
    'modules/analytics/omniture',
    'modules/adverts/adverts',
    'modules/cookies',
    'modules/analytics/omnitureMedia',
    'modules/debug',
    'modules/experiments/ab',
    'modules/swipenav',
    "modules/adverts/video",
    "modules/discussion/commentCount"
], function (
    common,
    ajax,
    userPrefs,

    domReady,
    bonzo,

    storage,
    detect,
    popular,
    related,
    Router,
    Images,
    TopStories,
    Sections,
    Search,
    NavControl,
    Australia,
    EditionSwitch,
    Tabs,
    RelativeDates,
    Clickstream,
    Omniture,
    Adverts,
    Cookies,
    OmnitureMedia,
    Debug,
    AB,
    swipeNav,
    VideoAdvert,
    CommentCount
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
            var navControl = new NavControl(),
                topStories = new TopStories(),
                sections = new Sections(),
                search = new Search(config),
                aus = new Australia(config), // TODO temporary till we have single domain editions
                editions = new EditionSwitch(),
                header = document.querySelector('body');

            navControl.init(header);
            topStories.load(config, header);
            sections.init(header);
            search.init(header);
            aus.init(header);

            common.mediator.on('page:common:ready', function(){
                navControl.reset();
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

        initClickstream: function () {
            var cs = new Clickstream({filter: ["a", "button"]});
        },

        transcludeCommentCounts: function () {
            common.mediator.on('page:common:ready', function(config, context) {
                if(context.querySelector("[data-discussion-id]")) {
                    CommentCount.init(context);
                }
            });
        },

        loadAnalytics: function () {
            var omniture = new Omniture();

            common.mediator.on('page:common:deferred:loaded:omniture', function(config, context) {
                omniture.go(config, function(){
                    // callback:

                    Array.prototype.forEach.call(context.getElementsByTagName("video"), function(video){
                        if (!bonzo(video).hasClass('tracking-applied')) {
                            bonzo(video).addClass('tracking-applied');
                            var v = new OmnitureMedia({
                                el: video,
                                config: config
                            }).init();
                        }
                    });
                });
            });

            common.mediator.on('page:common:deferred:loaded', function(config, context) {

                // AB must execute before Omniture
                AB.init(config, context);

                common.mediator.emit('page:common:deferred:loaded:omniture', config, context);

                require(config.page.ophanUrl, function (Ophan) {

                    if (!Ophan.isInitialised) {
                        Ophan.isInitialised = true;
                        Ophan.initLog();
                    }

                    Ophan.additionalViewData(function() {

                        var viewData = {};

                        var audsci = storage.get('gu.ads.audsci');
                        if (audsci) {
                            viewData.audsci_json = JSON.stringify(audsci);
                        }

                        if(AB.inTest(config.switches)) {
                            var test = AB.getTest();
                            viewData.experiments_json = JSON.stringify([{
                                id: test.id,
                                variant: test.variant
                            }]);
                        }

                        return viewData;
                    });

                    Ophan.sendLog(config.swipe ? config.swipe.referrer : undefined);
                });

            });

        },

        loadAdverts: function () {
            if (!userPrefs.isOff('adverts')){
                common.mediator.on('page:common:deferred:loaded', function(config, context) {
                    if (config.switches && config.switches.adverts) {
                        Adverts.init(config, context);
                    }
                });
                common.mediator.on('modules:adverts:docwrite:loaded', function(){
                    Adverts.loadAds();
                });
            }
        },

        loadVideoAdverts: function(config) {
            common.mediator.on('page:video:ready', function(config, context) {
                if(config.switches.videoAdverts && !config.page.blockAds) {
                    Array.prototype.forEach.call(context.querySelectorAll('video'), function(el) {
                        var support = detect.getVideoFormatSupport();
                        var a = new VideoAdvert({
                            el: el,
                            support: support,
                            config: config,
                            context: context
                        }).init(config.page);
                    });
                } else {
                    common.mediator.emit("video:ads:finished", config, context);
                }
            });
        },

        cleanupCookies: function() {
            Cookies.cleanUp(["mmcore.pd", "mmcore.srv", "mmid"]);
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

        initSwipe: function(config) {
            if (config.switches.swipeNav && detect.canSwipe() && !userPrefs.isOff('swipe') || userPrefs.isOn('swipe-dev')) {
                swipeNav(config);
            }
            if (config.switches.swipeNav && detect.canSwipe()) {
                bonzo(document.body).addClass('can-swipe');
                common.mediator.on('module:clickstream:click', function(clickSpec){
                    if (clickSpec.tag.indexOf('switch-swipe-on') > -1) {
                        userPrefs.switchOn('swipe');
                        window.location.reload();
                    }
                    else if (clickSpec.tag.indexOf('switch-swipe-off') > -1) {
                        userPrefs.switchOff('swipe');
                        window.location.reload();
                    }
                });
            }
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
            modules.initialiseNavigation(config);
            modules.loadVideoAdverts(config);
            modules.initClickstream();
            modules.initSwipe(config);
            modules.transcludeCommentCounts();
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
