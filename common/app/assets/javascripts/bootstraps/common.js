/*global Imager:true */
define([
    //Commmon libraries
    '$',
    'utils/mediator',
    'utils/deferToLoad',
    'utils/ajax',
    'modules/userPrefs',
    //Vendor libraries
    'domReady',
    'bonzo',
    'bean',
    'lodash/functions/debounce',
    //Modules
    'utils/storage',
    'utils/detect',
    'modules/onward/popular',
    'modules/onward/related',
    'modules/router',
    'modules/ui/images',
    'modules/navigation/top-stories',
    'modules/navigation/profile',
    'modules/navigation/sections',
    'modules/navigation/search',
    'modules/ui/tabs',
    'modules/ui/toggles',
    'modules/ui/relativedates',
    'modules/analytics/clickstream',
    'modules/analytics/omniture',
    'modules/adverts/adverts',
    'utils/cookies',
    'modules/analytics/omnitureMedia',
    'modules/analytics/adverts',
    'modules/experiments/ab',
    "modules/adverts/video",
    "modules/discussion/comment-count",
    "modules/gallery/lightbox",
    "modules/imager",
    "modules/onward/history",
    "modules/onward/sequence"
], function (
    $,
    mediator,
    deferToLoadEvent,
    ajax,
    userPrefs,

    domReady,
    bonzo,
    bean,
    debounce,

    storage,
    detect,
    popular,
    related,
    Router,
    Images,
    TopStories,
    Profile,
    Sections,
    Search,

    Tabs,
    Toggles,
    RelativeDates,
    Clickstream,
    Omniture,
    Adverts,
    Cookies,
    OmnitureMedia,
    AdvertsAnalytics,
    ab,
    VideoAdvert,
    CommentCount,
    LightboxGallery,
    imager,
    History,
    sequence
) {

    var modules = {

        upgradeImages: function () {
            imager.upgrade();
            imager.listen();

            var images = new Images();
            mediator.on('page:common:ready', function(config, context) {
                images.upgrade(context);
            });
            mediator.on('fragment:ready:images', function(context) {
                images.upgrade(context);
            });
            mediator.on('modules:related:loaded', function(config, context) {
                images.upgrade(context);
            });
            mediator.on('modules:images:upgrade', function() {
                $('body').addClass('images-upgraded');
            });
        },

        initialiseNavigation: function (config) {
             var topStories = new TopStories(),
                sections = new Sections(config),
                search = new Search(config),
                header = document.getElementById('header'),
                profile;

            if (config.switches.idProfileNavigation) {
                profile = new Profile(header, {
                    url: config.page.idUrl
                });
                profile.init();
            }

            sections.init(document);
            topStories.load(config, header);
            search.init(header);
        },

        transcludeRelated: function (config, context) {
            related(config, context);
        },

        transcludePopular: function () {
            mediator.on('page:common:ready', function(config, context) {
                popular(config, context);
            });
        },

        showTabs: function() {
            var tabs = new Tabs();
            mediator.on('modules:popular:loaded', function(el) {
                tabs.init(el);
            });
        },

        showToggles: function() {
            var toggles = new Toggles();
            toggles.init(document);
            mediator.on('page:common:ready', function(config, context) {
                toggles.reset();
            });
        },

        showRelativeDates: function () {
            var dates = RelativeDates;
            mediator.on('page:common:ready', function(config, context) {
                dates.init(context);
            });
            mediator.on('fragment:ready:dates', function(el) {
                dates.init(el);
            });
        },

        initClickstream: function () {
            var cs = new Clickstream({filter: ["a", "button"]});
        },

        transcludeCommentCounts: function () {
            mediator.on('page:common:ready', function(config, context) {
                CommentCount.init(context);
            });
        },

        initLightboxGalleries: function () {
            var thisPageId;
            mediator.on('page:common:ready', function(config, context) {
                var galleries = new LightboxGallery(config, context);
                thisPageId = config.page.pageId;
                galleries.init();
            });

            // Register as a page view if invoked from elsewhere than its gallery page (like a trailblock)
            mediator.on('module:lightbox-gallery:loaded', function(config, context) {
                if (thisPageId !== config.page.pageId) {
                    mediator.emit('page:common:deferred:loaded', config, context);
                }
            });
        },

        runAbTests: function (config, context) {
            ab.run(config, context);
        },

        loadAnalytics: function () {
            var omniture = new Omniture();

            mediator.on('page:common:deferred:loaded:omniture', function(config, context) {
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

                    if (config.switches.adslotImpressionStats) {
                        var advertsAnalytics = new AdvertsAnalytics(config, context);
                    }
                });
            });

            mediator.on('page:common:deferred:loaded', function(config, context) {

                mediator.emit('page:common:deferred:loaded:omniture', config, context);

                require(config.page.ophanUrl, function (Ophan) {

                    if (!Ophan.isInitialised) {
                        Ophan.isInitialised = true;
                        Ophan.initLog();
                    }

                    Ophan.additionalViewData(function() {

                        var viewData = {};

                        var audsci = storage.local.get('gu.ads.audsci');
                        if (audsci) {
                            viewData.audsci_json = JSON.stringify(audsci);
                        }

                        var participations = ab.getParticipations(),
                            participationsKeys = Object.keys(participations);

                        if (participationsKeys.length > 0) {
                            var testData = participationsKeys.map(function(k) {
                                return { id: k, variant: participations[k].variant };
                            });
                            viewData.experiments_json = JSON.stringify(testData);
                        }

                        return viewData;
                    });

                    Ophan.sendLog(config.swipe ? config.swipe.referrer : undefined, true);
                });

            });

        },

        loadAdverts: function () {
            if (!userPrefs.isOff('adverts')){
                mediator.on('page:common:deferred:loaded', function(config, context) {
                    if (config.switches && config.switches.adverts && !config.page.blockAds) {
                        Adverts.init(config, context);
                    }
                });
                mediator.on('modules:adverts:docwrite:loaded', function(){
                    Adverts.loadAds();
                });

                mediator.on('window:resize', function () {
                    Adverts.hideAds();
                });
                mediator.on('window:orientationchange', function () {
                    Adverts.hideAds();
                });
            }
        },

        loadVideoAdverts: function(config) {
            mediator.on('page:common:ready', function(config, context) {
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
                    mediator.emit("video:ads:finished", config, context);
                }
            });
        },

        cleanupCookies: function() {
            Cookies.cleanUp(["mmcore.pd", "mmcore.srv", "mmid", 'GU_ABFACIA', 'GU_FACIA']);
        },

        // opt-in to the responsive alpha
        optIn: function () {
            var countMeIn = /#countmein/.test(window.location.hash);
            if (countMeIn) {
                Cookies.add("GU_VIEW", "mobile", 365);
            }
        },

        // display a flash message to devices over 600px who don't have the mobile cookie
        displayReleaseMessage: function (config) {

            var alreadyOptedIn = !!userPrefs.get('releaseMessage'),
                releaseMessage = {
                    show: function () {
                        $('#header').addClass('js-site-message');
                        $('.site-message').removeClass('u-h');
                    },
                    hide: function () {
                        userPrefs.set('releaseMessage', true);
                        $('#header').removeClass('js-site-message');
                        $('.site-message').addClass('u-h');
                    }
                };

            if (config.switches.releaseMessage && !alreadyOptedIn && (detect.getBreakpoint() !== 'mobile')) {
                // force the visitor in to the alpha release for subsequent visits
                Cookies.add("GU_VIEW", "mobile", 365);

                releaseMessage.show();

                bean.on(document, 'click', '.js-site-message-close', function(e) {
                    releaseMessage.hide();
                });
            }
        },

        logReadingHistory : function() {
            mediator.on('page:common:ready', function(config) {
                 if(/Article|Video|Gallery|Interactive/.test(config.page.contentType)) {
                    new History().log({
                        id: '/' + config.page.pageId,
                        meta: {
                            section: config.page.section,
                            keywords: config.page.keywordIds.split(',').slice(0, 5)
                        }
                    });
                }
                sequence.init();
            });
        },

        windowEventListeners: function() {
            var events = {
                    resize: 'window:resize',
                    orientationchange: 'window:orientationchange'
                },
                emitEvent = function(eventName) {
                    return function(e) {
                        mediator.emit(eventName, e);
                    };
                };
            for (var event in events) {
                bean.on(window, event, debounce(emitEvent(events[event]), 200));
            }
        }
    };

    var deferrable = function (config, context) {
        var self = this;
        deferToLoadEvent(function() {
            if (!self.initialisedDeferred) {
                self.initialisedDeferred = true;
                modules.loadAdverts();
                if (!config.switches.analyticsOnDomReady) {
                    modules.loadAnalytics();
                }

                // TODO: make these run in event 'page:common:deferred:loaded'
                modules.cleanupCookies(context);
            }
            mediator.emit("page:common:deferred:loaded", config, context);
        });
    };

    var ready = function (config, context, contextHtml) {
        if (!this.initialised) {
            this.initialised = true;

            mediator.on("page:common:ready", function(config, context){
                modules.runAbTests(config, context);
                modules.transcludeRelated(config, context);
            });

            modules.windowEventListeners();
            modules.upgradeImages();
            modules.showTabs();
            modules.initialiseNavigation(config);
            modules.showToggles();
            modules.showRelativeDates();
            modules.transcludePopular();
            modules.loadVideoAdverts(config);
            modules.initClickstream();
            if (config.switches.analyticsOnDomReady) {
                modules.loadAnalytics();
            }
            modules.transcludeCommentCounts();
            modules.initLightboxGalleries();
            modules.optIn();
            modules.displayReleaseMessage(config);
            modules.logReadingHistory();
        }
        mediator.emit("page:common:ready", config, context);
    };

    var init = function (config, context, contextHtml) {
        ready(config, context, contextHtml);
        deferrable(config, context);
    };

    return {
        init: init
    };
});
