/* jshint nonew: false */
/* TODO - fix module constructors so we can remove the above jshint override */
define([
    //Commmon libraries
    'common/$',
    'common/utils/mediator',
    'common/utils/deferToLoad',
    'common/utils/ajax',
    'common/modules/userPrefs',
    //Vendor libraries
    'bonzo',
    'bean',
    'qwery',
    'enhancer',
    'lodash/objects/assign',
    'lodash/functions/debounce',
    //Modules
    'common/utils/storage',
    'common/utils/detect',
    'common/modules/onward/popular',
    'common/modules/onward/related',
    'common/modules/onward/series-content',
    'common/modules/ui/images',
    'common/modules/navigation/profile',
    'common/modules/navigation/sections',
    'common/modules/navigation/search',
    'common/modules/ui/tabs',
    'common/modules/ui/toggles',
    'common/modules/ui/dropdowns',
    'common/modules/ui/relativedates',
    'common/modules/analytics/clickstream',
    'common/modules/analytics/omniture',
    'common/modules/analytics/scrollDepth',
    'common/utils/cookies',
    'common/modules/analytics/omnitureMedia',
    'common/modules/analytics/livestats',
    'common/modules/experiments/ab',
    'common/modules/adverts/video',
    'common/modules/discussion/comment-count',
    'common/modules/gallery/lightbox',
    'common/modules/onward/history',
    'common/modules/onward/sequence',
    'common/modules/ui/message',
    'common/modules/identity/autosignin',
    'common/modules/adverts/article-body-adverts',
    'common/modules/adverts/collection-adverts',
    'common/modules/adverts/dfp',
    'common/modules/analytics/commercial/tags/container',
    'common/modules/analytics/foresee-survey',
    'common/modules/onward/right-most-popular',
    'common/modules/analytics/register',
    'common/modules/commercial/loader'
], function (
    $,
    mediator,
    deferToLoadEvent,
    ajax,
    userPrefs,

    bonzo,
    bean,
    qwery,
    enhancer,
    extend,
    debounce,

    storage,
    detect,
    popular,
    Related,
    Series,
    images,
    Profile,
    Sections,
    Search,

    Tabs,
    Toggles,
    Dropdowns,
    RelativeDates,
    Clickstream,
    Omniture,
    ScrollDepth,
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
    ArticleBodyAdverts,
    CollectionAdverts,
    DFP,
    TagContainer,
    Foresee,
    RightMostPopular,
    register,
    CommercialLoader
) {

    var hasBreakpointChanged = detect.hasCrossedBreakpoint();

    var modules = {

        upgradeImages: function () {
            images.upgrade();
            images.listen();
        },

        initialiseNavigation: function (config) {
            var sections = new Sections(config),
                search = new Search(config),
                header = document.getElementById('header');

            if (header) {
                if (config.switches.idProfileNavigation) {
                    var profile = new Profile(header, {
                        url: config.page.idUrl
                    });
                    profile.init();
                }
            }

            sections.init(document);
            search.init(header);
        },

        transcludeRelated: function (config, context) {
            var r = new Related();
            r.renderRelatedComponent(config, context);
        },

        transcludePopular: function () {
            mediator.on('page:common:ready', function(config, context) {
                popular(config, context);
            });
        },

        transcludeSeriesContent: function(config, context){
            if ('seriesId' in config.page) {
                new Series(config, qwery('.js-series', context));
            }
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
            mediator.on('page:common:ready', function() {
                toggles.reset();
            });

            Dropdowns.init();
        },

        showRelativeDates: function (config) {
            var dates = RelativeDates,
                opts = config.switches.hideOldTimestamps && config.page.isFront ? {notAfter: 3600} : undefined; // 1 hour

            mediator.on('page:common:ready', function(config, context) {
                dates.init(context, opts);
            });
            mediator.on('fragment:ready:dates', function(el) {
                dates.init(el, opts);
            });
        },

        initClickstream: function () {
            new Clickstream({filter: ['a', 'button']});
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

        initRightHandComponent: function(config) {
            if(config.page.contentType === 'Article' && detect.getBreakpoint() !== 'mobile' && parseInt(config.page.wordCount, 10) > 500  ) {
                new RightMostPopular(mediator, {type: 'image', maxTrails: 5});
            }
        },

        logLiveStats: function (config) {
            liveStats.log(config);
        },

        loadAnalytics: function (config, context) {
            var omniture = new Omniture();

            omniture.go(config, function(){
                // callback:

                Array.prototype.forEach.call(context.getElementsByTagName('video'), function(video){
                    if (!bonzo(video).hasClass('tracking-applied')) {
                        bonzo(video).addClass('tracking-applied');
                        new OmnitureMedia({
                            el: video,
                            config: config
                        }).init();
                    }
                });
            });

            if (config.switches.ophan && !config.page.isSSL) {
                require('ophan/ng', function (ophan) {
                    ophan.record({'ab': ab.getParticipations()});

                    if(config.switches.scrollDepth) {
                        mediator.on('scrolldepth:data', ophan.record);

                        new ScrollDepth({
                            isContent: config.page.contentType === 'Article'
                        });
                    }
                });
            }
        },

        loadAdverts: function (config) {

            var showAds =
                !userPrefs.isOff('adverts') &&
                !config.page.shouldHideAdverts &&
                !config.page.isSSL &&
                (
                    config.switches.standardAdverts || config.switches.commercialComponents
                );

            if (showAds) {

                var onResize = {
                        cmd: [],
                        execute: function () {
                            hasBreakpointChanged(function () {
                                onResize.cmd.forEach(function (func) {
                                    func();
                                });
                            });
                        }
                    },
                    dfpAds,
                    options = {};

                // if it's an article, excluding live blogs, create our inline adverts
                if (config.switches.standardAdverts && config.page.contentType === 'Article' && !config.page.isLiveBlog) {
                    new ArticleBodyAdverts().init();
                }

                new CollectionAdverts(config).init();

                if (!config.switches.standardAdverts) {
                    options.dfpSelector = '.ad-slot--commercial-component';
                } else if (!config.switches.commercialComponents) {
                    options.dfpSelector = '.ad-slot--dfp:not(.ad-slot--commercial-component)';
                }

                dfpAds = new DFP(extend(config, options));
                dfpAds.init();
                onResize.cmd.push(dfpAds.reload);

                // Push the reloaded command once
                onResize.cmd.push(function () {
                    mediator.emit('modules:adverts:reloaded');
                });
                mediator.on('window:resize', debounce(onResize.execute.bind(this), 2000));
            }
        },

        loadVideoAdverts: function() {
            mediator.on('page:common:ready', function(config, context) {
                if (config.switches.videoAdverts && !config.page.blockVideoAds) {
                    Array.prototype.forEach.call(context.querySelectorAll('video'), function(el) {
                        var support = detect.getVideoFormatSupport();
                        new VideoAdvert({
                            el: el,
                            support: support,
                            config: config,
                            context: context
                        }).init(config.page);
                    });
                } else {
                    mediator.emit('video:ads:finished', config, context);
                }
            });
        },

        cleanupCookies: function() {
            Cookies.cleanUp(['mmcore.pd', 'mmcore.srv', 'mmid', 'GU_ABFACIA', 'GU_FACIA']);
            Cookies.cleanUpDuplicates(['GU_ALPHA','GU_VIEW']);
        },

        // opt-in to the responsive alpha
        optIn: function () {
            var countMeIn = /#countmein/.test(window.location.hash);
            if (countMeIn) {
                Cookies.add('GU_VIEW', 'responsive', 365);
            }
        },

        // display a flash message to devices over 600px who don't have the mobile cookie
        displayReleaseMessage: function (config) {

            var path = (document.location.pathname) ? document.location.pathname : '/',
                exitLink = '/preference/platform/classic?page=' + encodeURIComponent(path + '?view=classic'),
                msg = '<p class="site-message__message" id="site-message__message">' +
                            'You’re viewing a beta release of the Guardian’s responsive website.' +
                            ' We’d love to hear your <a href="https://www.surveymonkey.com/s/theguardian-beta-feedback" data-link-name="feedback">feedback</a>' +
                      '</p>' +
                      '<ul class="site-message__actions u-unstyled">' +
                           '<li class="site-message__actions__item">' +
                               '<i class="i i-back"></i>' +
                                   '<a class="js-main-site-link" rel="nofollow" href="' + exitLink + '"' +
                                       'data-link-name="opt-out">Opt-out and return to our current site </a>' +
                           '</li>' +
                      '</ul>';

            var releaseMessage = new Message('alpha');

            // Do not show the release message on -sp- based paths.
            var spRegExp = new RegExp('.*/-sp-.*');

            if (config.switches.releaseMessage && (detect.getBreakpoint() !== 'mobile') && !spRegExp.test(path)) {
                // force the visitor in to the alpha release for subsequent visits
                Cookies.add('GU_VIEW', 'responsive', 365);
                releaseMessage.show(msg);
            }
        },

        displayOnboardMessage: function (config) {
            if(window.location.hash === '#opt-in-message' && config.switches.networkFrontOptIn && detect.getBreakpoint() !== 'mobile') {
                bean.on(document, 'click', '.js-site-message-close', function() {
                    Cookies.add('GU_VIEW', 'responsive', 365);
                    Cookies.add('GU_ALPHA', '2', 365);
                });
                bean.on(document, 'click', '.js-site-message', function() {
                    Cookies.add('GU_VIEW', 'responsive', 365);
                    Cookies.add('GU_ALPHA', '2', 365);
                });
                var message = new Message('onboard', { type: 'modal' }),
                    path = (document.location.pathname) ? document.location.pathname : '/',
                    exitLink = '/preference/platform/classic?page=' + encodeURIComponent(path + '?view=classic'),
                    msg = '<h2 class="site-message__header">Thanks for joining us.</h2>' +
                    '<div class="site-message__message" id="site-message__message">' +
                    '<p>You’re looking at a prototype of our new website. Opt-out any time by clicking "Current version" at the bottom of the page. <a href="http://next.theguardian.com/">Find out more</a>.</p>' +
                    '<ul class="site-message__list">' +
                    '<li class="site-message__list__item">We love feedback - <a href="https://www.surveymonkey.com/s/theguardian-beta-feedback">let us know yours</a>.</li>' +
                    '<li class="site-message__list__item">Stay up to date with new releases on <a href="http://next.theguardian.com/blog/">our blog</a>.</li>' +
                    '</ul>' +
                    '<ul class="site-message__actions u-unstyled">' +
                    '<li class="site-message__actions__item"><i class="i i-arrow-white-circle"></i>  '+
                    '<a class="js-site-message-close" data-link-name="R2 alpha opt in" href="#" tabindex=1>Got it</a>' +
                    '<li class="site-message__actions__item">' +
                    '<i class="i i-back-white"></i>' +
                    '<a class="js-main-site-link" rel="nofollow" href="' + exitLink + '"' +
                    'data-link-name="R2 alpha opt out">Opt-out and return to the current site </a>' +
                    '</li>' +
                    '</ul>';
                message.show(msg);
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
                if (config.page.section !== 'identity') {
                    sequence.init('/' + config.page.pageId);
                }
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
                if (config.page.contentType !== 'Identity' && config.page.section !== 'identity') {
                    TagContainer.init(config);
                }
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
        },

        runForseeSurvey: function(config) {
            if(config.switches.foresee) {
                Foresee.load();
            }
        },

        augmentInteractive: function() {
            mediator.on('page:common:ready', function(config, context) {
                if (/Article|Interactive/.test(config.page.contentType)) {
                    $('figure.interactive').each(function (el) {
                        enhancer.render(el, context, config, mediator);
                    });
                }
            });
        },

        startRegister: function(config) {
            if (!config.page.isSSL) {
                register.initialise(config);
            }
        },

        loadCommercialComponent: function(config) {
            var commercialComponent = /^#commercial-component=(.*)$/.exec(window.location.hash),
                slot = qwery('[data-name="merchandising"]').shift();
            if (commercialComponent && slot) {
                new CommercialLoader({ config: config })
                    .init(commercialComponent[1], slot);
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
                modules.loadAnalytics(config, context);
                modules.cleanupCookies(context);
                modules.runAbTests(config, context);
                modules.loadAdverts(config);
                modules.transcludeRelated(config, context);
                modules.transcludeSeriesContent(config, context);
                modules.initRightHandComponent(config, context);
                modules.loadCommercialComponent(config, context);
            }
            mediator.emit('page:common:deferred:loaded', config, context);
        });
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.displayOnboardMessage(config);
            modules.windowEventListeners();
            modules.checkIframe();
            modules.upgradeImages();
            modules.showTabs();
            modules.initialiseNavigation(config);
            modules.showToggles();
            modules.showRelativeDates(config);
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
            modules.augmentInteractive();
            modules.runForseeSurvey(config);
            modules.startRegister(config);
        }
        mediator.emit('page:common:ready', config, context);
    };

    var init = function (config, context) {
        ready(config, context);
        deferrable(config, context);
    };

    return {
        init: init
    };
});
