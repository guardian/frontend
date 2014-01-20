define([
    //Commmon libraries
    'common/$',
    'common/utils/mediator',
    'common/utils/deferToLoad',
    'common/utils/ajax',
    'common/modules/userPrefs',
    //Vendor libraries
    'domReady',
    'bonzo',
    'bean',
    'lodash/functions/debounce',
    //Modules
    'common/utils/storage',
    'common/utils/detect',
    'common/modules/onward/popular',
    'common/modules/onward/related',
    'common/modules/router',
    'common/modules/ui/images',
    'common/modules/navigation/top-stories',
    'common/modules/navigation/profile',
    'common/modules/navigation/sections',
    'common/modules/navigation/search',
    'common/modules/ui/tabs',
    'common/modules/ui/toggles',
    'common/modules/ui/relativedates',
    'common/modules/analytics/clickstream',
    'common/modules/analytics/omniture',
    'common/modules/adverts/adverts',
    'common/utils/cookies',
    'common/modules/analytics/omnitureMedia',
    'common/modules/analytics/livestats',
    'common/modules/experiments/ab',
    "common/modules/adverts/video",
    "common/modules/discussion/comment-count",
    "common/modules/gallery/lightbox",
    "common/modules/onward/history",
    "common/modules/onward/sequence",
    "common/modules/ui/message",
    "common/modules/identity/autosignin",
    "common/modules/analytics/commercial/tags/container"
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
    images,
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
    liveStats,
    ab,
    VideoAdvert,
    CommentCount,
    LightboxGallery,
    History,
    sequence,
    Message,
    AutoSignin,
    TagContainer
) {

    var modules = {

        upgradeImages: function () {
            images.upgrade();
            images.listen();
        },

        initialiseNavigation: function (config) {
             var topStories = new TopStories(),
                sections = new Sections(config),
                search = new Search(config),
                header = document.getElementById('header');

            if (header) {
                if (config.switches.idProfileNavigation) {
                    var profile = new Profile(header, {
                        url: config.page.idUrl
                    });
                    profile.init();
                }
                topStories.load(config, header);
            }

            sections.init(document);
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

        initAbTests: function (config) {
            ab.segmentUser(config);
        },

        runAbTests: function (config, context) {
            ab.run(config, context);
        },

        logLiveStats: function (config) {
            liveStats.log({ beaconUrl: config.page.beaconUrl }, config);
        },

        loadAnalytics: function (config, context) {
            var omniture = new Omniture();

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

            if (config.switches.ophanMultiEvent) {
                require('ophan/ng', function () {});
            }

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

                Ophan.sendLog(undefined, true);
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

            var path = (document.location.pathname) ? document.location.pathname : '/',
                exitLink = '/preference/platform/desktop?page=' + encodeURIComponent(path + '?view=desktop'),
                msg = '<p class="site-message__message">' +
                            'You’re viewing an alpha release of the Guardian’s responsive website. <a href="/help/2013/oct/04/alpha-testing-and-evolution-of-our-mobile-site">Find out more</a>' +
                      '</p>' +
                      '<ul class="site-message__actions unstyled">' +
                           '<li class="site-message__actions__item">' +
                               '<i class="i i-back"></i>' +
                                   '<a class="js-main-site-link" rel="nofollow" href="' + exitLink + '"' +
                                       'data-link-name="opt-out">Opt-out and return to standard desktop site </a>' +
                           '</li>' +
                      '</ul>';

            var releaseMessage = new Message('alpha');
            var alreadyOptedIn = !!releaseMessage.hasSeen('releaseMessage');

            if (config.switches.releaseMessage && !alreadyOptedIn && (detect.getBreakpoint() !== 'mobile')) {
                // force the visitor in to the alpha release for subsequent visits
                Cookies.add("GU_VIEW", "mobile", 365);
                releaseMessage.show(msg);
            }
        },

        unshackleParagraphs: function (config, context) {
            if (userPrefs.isOff('para-indents')) {
                $('.paragraph-spacing--indents', context).removeClass('paragraph-spacing--indents');
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
                sequence.init('/' + config.page.pageId);
            });
        },

        initAutoSignin : function() {
           mediator.on('page:common:ready', function(config) {
                if (config.switches && config.switches.facebookAutosignin && detect.getBreakpoint() !== 'mobile') {
                    new AutoSignin(config).init();
                }
            });
        },
        
        loadTags : function() {
            mediator.on('page:common:ready', function(config) {
                TagContainer.init(config);
            });
        },

        windowEventListeners: function() {
            var events = {
                    resize: 'window:resize',
                    orientationchange: 'window:orientationchange',
                    scroll: 'window:scroll'
                },
                emitEvent = function(eventName) {
                    return function(e) {
                        mediator.emit(eventName, e);
                    };
                };
            for (var event in events) {
                bean.on(window, event, debounce(emitEvent(events[event]), 200));
            }
        },

        checkIframe: function() {
            if (window.self !== window.top) {
                $('html').addClass('iframed');
            }
        }
    };

    var deferrable = function (config, context) {
        var self = this;
        deferToLoadEvent(function() {
            if (!self.initialisedDeferred) {
                self.initialisedDeferred = true;
                modules.initAbTests(config);
                modules.logLiveStats(config);
                modules.loadAdverts();
                modules.loadAnalytics(config, context);
                modules.cleanupCookies(context);
                modules.runAbTests(config, context);
                modules.transcludeRelated(config, context);
            }
            mediator.emit("page:common:deferred:loaded", config, context);
        });
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.windowEventListeners();
            modules.checkIframe();
            modules.upgradeImages();
            modules.showTabs();
            modules.initialiseNavigation(config);
            modules.showToggles();
            modules.showRelativeDates();
            modules.transcludePopular();
            modules.loadVideoAdverts(config);
            modules.initClickstream();
            modules.transcludeCommentCounts();
            modules.initLightboxGalleries();
            modules.optIn();
            modules.displayReleaseMessage(config);
            modules.logReadingHistory();
            modules.unshackleParagraphs(config, context);
            modules.initAutoSignin(config);
            modules.loadTags(config);
        }
        mediator.emit("page:common:ready", config, context);
    };

    var init = function (config, context) {
        ready(config, context);
        deferrable(config, context);
    };

    return {
        init: init
    };
});
