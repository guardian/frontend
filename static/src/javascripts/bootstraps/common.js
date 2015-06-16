/*eslint-disable no-new*/
/* TODO - fix module constructors */
define([
    'bean',
    'bonzo',
    'enhancer',
    'fastclick',
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/detect',
    'common/utils/proximity-loader',
    'common/utils/mediator',
    'common/utils/template',
    'common/utils/url',
    'common/utils/robust',
    'common/utils/storage',
    'common/modules/analytics/foresee-survey',
    'common/modules/analytics/livestats',
    'common/modules/analytics/media-listener',
    'common/modules/analytics/omniture',
    'common/modules/analytics/register',
    'common/modules/analytics/scrollDepth',
    'common/modules/analytics/css-logging',
    'common/modules/analytics/simple-metrics',
    'common/modules/commercial/user-ad-targeting',
    'common/modules/discussion/comment-count',
    'common/modules/discussion/loader',
    'common/modules/experiments/ab',
    'common/modules/identity/api',
    'common/modules/identity/autosignin',
    'common/modules/navigation/navigation',
    'common/modules/navigation/profile',
    'common/modules/navigation/search',
    'common/modules/onward/history',
    'common/modules/onward/more-tags',
    'common/modules/onward/onward-content',
    'common/modules/onward/popular',
    'common/modules/onward/related',
    'common/modules/onward/tech-feedback',
    'common/modules/onward/tonal',
    'common/modules/social/share-count',
    'common/modules/ui/accessibility-prefs',
    'common/modules/ui/clickstream',
    'common/modules/ui/dropdowns',
    'common/modules/ui/faux-block-link',
    'common/modules/ui/fonts',
    'common/modules/ui/last-modified',
    'common/modules/ui/message',
    'common/modules/ui/relativedates',
    'common/modules/ui/smartAppBanner',
    'common/modules/ui/tabs',
    'common/modules/ui/toggles',
    'common/modules/user-prefs',
    'common/modules/onward/breaking-news',
    'text!common/views/international-message.html',
    'text!common/views/international-control-message.html',
    'text!common/views/donot-use-adblock.html',
    'bootstraps/identity'
], function (
    bean,
    bonzo,
    enhancer,
    FastClick,
    qwery,
    $,
    config,
    cookies,
    detect,
    proximityLoader,
    mediator,
    template,
    url,
    robust,
    storage,
    Foresee,
    liveStats,
    mediaListener,
    omniture,
    register,
    ScrollDepth,
    logCss,
    simpleMetrics,
    userAdTargeting,
    CommentCount,
    DiscussionLoader,
    ab,
    id,
    AutoSignin,
    navigation,
    Profile,
    Search,
    history,
    MoreTags,
    Onward,
    Popular,
    Related,
    techFeedback,
    TonalComponent,
    shareCount,
    accessilbilityPrefs,
    Clickstream,
    Dropdowns,
    fauxBlockLink,
    fonts,
    LastModified,
    Message,
    RelativeDates,
    smartAppBanner,
    Tabs,
    Toggles,
    userPrefs,
    breakingNews,
    internationalMessage,
    internationalControlMessage,
    doNotUseAdblockTemplate,
    identity
) {
    var modules = {
            loadFonts: function () {
                fonts.load();
            },

            initId: function () {
                identity.init(config);
            },

            initUserAdTargeting: function () {
                userAdTargeting.requestUserSegmentsFromId();
            },

            initFastClick: function () {
                // Unfortunately FastClick’s UMD exports are not consistent for
                // all types. AMD exports FastClick, CJS exports FastClick.attach
                // As per: https://github.com/ftlabs/fastclick/blob/master/lib/fastclick.js#L829-L840
                (config.tests.jspmTest ? FastClick : FastClick.attach)(document.body);
            },

            initialiseFauxBlockLink: function () {
                fauxBlockLink().init();
            },

            initialiseTopNavItems: function () {
                var profile,
                    search = new Search(),
                    header = document.getElementById('header');

                if (header) {
                    if (config.switches.idProfileNavigation) {
                        profile = new Profile({
                            url: config.page.idUrl
                        });
                        profile.init();
                    }
                }

                search.init(header);
            },

            initialiseNavigation: function () {
                navigation.init();
            },

            transcludeRelated: function () {
                var opts = {
                    excludeTags: []
                };

                // exclude ad features from non-ad feature content
                if (config.page.sponsorshipType !== 'advertisement-features') {
                    opts.excludeTags.push('tone/advertisement-features');
                }
                // don't want to show professional network content on videos or interactives
                if ('contentType' in config.page && ['video', 'interactive'].indexOf(config.page.contentType.toLowerCase()) >= 0) {
                    opts.excludeTags.push('guardian-professional/guardian-professional');
                }
                new Related(opts).renderRelatedComponent();
            },

            initRelated: function () {
                if (window.location.hash) {
                    modules.transcludeRelated();
                } else {
                    var relatedEl = qwery('.js-related')[0];
                    if (relatedEl) {
                        proximityLoader.add(relatedEl, 1500, modules.transcludeRelated);
                    }
                }
            },

            transcludePopular: function () {
                new Popular().init();
            },

            initPopular: function () {
                if (!config.page.isFront) {
                    if (window.location.hash) {
                        modules.transcludePopular();
                    } else {
                        var onwardEl = qwery('.js-popular-trails')[0];
                        if (onwardEl) {
                            proximityLoader.add(onwardEl, 1500, modules.transcludePopular);
                        }
                    }
                }
            },

            transcludeOnwardContent: function () {
                if ((config.page.seriesId || config.page.blogIds) && config.page.showRelatedContent) {
                    new Onward(qwery('.js-onward'));
                } else if (config.page.tones !== '') {
                    $('.js-onward').each(function (c) {
                        new TonalComponent().fetch(c, 'html');
                    });
                }
            },

            initOnwardContent: function () {
                if (window.location.hash) {
                    modules.transcludeOnwardContent();
                } else {
                    var onwardEl = qwery('.js-onward')[0];
                    if (onwardEl) {
                        proximityLoader.add(onwardEl, 1500, modules.transcludeOnwardContent);
                    }
                }
            },

            showTabs: function () {
                var tabs = new Tabs();
                [
                    'modules:popular:loaded',
                    'modules:geomostpopular:ready'
                ].forEach(function (event) {
                    mediator.on(event, function (el) {
                        tabs.init(el);
                    });
                });
            },

            showToggles: function () {
                var toggles = new Toggles();
                toggles.init(document);
                toggles.reset();
                Dropdowns.init();
            },

            showRelativeDates: function () {
                var dates = RelativeDates;
                dates.init();
                mediator.on('fragment:ready:dates', function (el) {
                    dates.init(el);
                });
            },

            initClickstream: function () {
                new Clickstream({filter: ['a', 'button']});
            },

            showAdblockMessage: function () {
                var alreadyVisted = storage.local.get('alreadyVisited') || 0,
                    adblockLink = 'https://membership.theguardian.com/about/supporter?INTCMP=adb-mv';

                if (detect.getBreakpoint() !== 'mobile' && detect.adblockInUse && config.switches.adblock && alreadyVisted) {
                    new Message('adblock', {
                        pinOnHide: false,
                        siteMessageLinkName: 'adblock message variant',
                        siteMessageCloseBtn: 'hide'
                    }).show(template(
                            doNotUseAdblockTemplate,
                            {
                                adblockLink: adblockLink,
                                messageText: 'We notice you\'ve got an ad-blocker switched on. Perhaps you\'d like to support the Guardian another way?',
                                linkText: 'Become a supporter today'
                            }
                        ));
                }

                storage.local.set('alreadyVisited', alreadyVisted + 1);
            },

            logLiveStats: function () {
                liveStats.log();
            },

            loadAnalytics: function () {
                omniture.go();

                if (config.switches.ophan) {
                    require(['ophan/ng'], function (ophan) {

                        if (config.switches.scrollDepth) {
                            mediator.on('scrolldepth:data', ophan.record);

                            new ScrollDepth({
                                isContent: /Article|LiveBlog/.test(config.page.contentType)
                            });
                        }
                    });
                }
            },

            cleanupCookies: function () {
                cookies.cleanUp(['mmcore.pd', 'mmcore.srv', 'mmid', 'GU_ABFACIA', 'GU_FACIA', 'GU_ALPHA', 'GU_ME', 'at']);
            },

            updateHistory: function () {
                if (config.page.contentType !== 'Network Front') {
                    history.logSummary(config.page);
                }

                if (config.page.contentType === 'Video') {
                    history.logHistory(config.page);
                }
            },

            showHistoryInMegaNav: function () {
                if (config.switches.historyTags) {
                    mediator.once('modules:nav:open', function () {
                        history.showInMegaNav();
                    });
                }
            },

            initAutoSignin: function () {
                if (config.switches.facebookAutosignin && detect.getBreakpoint() !== 'mobile') {
                    new AutoSignin().init();
                }
            },

            windowEventListeners: function () {
                var event,
                    events = {
                        resize:            'window:resize',
                        scroll:            'window:scroll',
                        orientationchange: 'window:orientationchange'
                    };
                for (event in events) {
                    bean.on(window, event, mediator.emit.bind(mediator, events[event]));
                }
            },

            mediaEventListeners: function () {
                mediaListener.init();
            },

            checkIframe: function () {
                if (window.self !== window.top) {
                    $('html').addClass('iframed');
                }
            },

            runForseeSurvey: function () {
                if (config.switches.foresee) {
                    Foresee.load();
                }
            },

            augmentInteractive: function () {
                if (/Article|Interactive|LiveBlog/.test(config.page.contentType)) {
                    $('figure.interactive').each(function (el) {
                        enhancer.render(el, document, config, mediator);
                    });
                }
            },

            startRegister: function () {
                if (!config.page.isSSL) {
                    register.initialise();
                }
            },

            repositionComments: function () {
                if (!id.isUserLoggedIn()) {
                    $('.js-comments').appendTo(qwery('.js-repositioned-comments'));
                }
            },

            showMoreTagsLink: function () {
                new MoreTags().init();
            },

            showSmartBanner: function () {
                smartAppBanner.init();
            },

            initDiscussion: function () {
                if (config.switches.discussion) {
                    CommentCount.init();
                    if (config.page.commentable) {
                        var el = qwery('.discussion')[0];
                        if (el) {
                            new DiscussionLoader().attachTo(el);
                        }
                    }
                }
            },

            testCookie: function () {
                var queryParams = url.getUrlVars();
                if (queryParams.test) {
                    cookies.addSessionCookie('GU_TEST', encodeURIComponent(queryParams.test));
                }
            },

            adTestCookie: function () {
                var queryParams = url.getUrlVars();
                if (queryParams.adtest === 'clear') {
                    cookies.remove('adtest');
                } else if (queryParams.adtest) {
                    cookies.add('adtest', encodeURIComponent(queryParams.adtest), 10);
                }
            },

            initOpenOverlayOnClick: function () {
                var offset;

                bean.on(document.body, 'click', '[data-open-overlay-on-click]', function (e) {
                    var elId = bonzo(e.currentTarget).data('open-overlay-on-click');
                    offset = document.body.scrollTop;
                    bonzo(document.body).addClass('has-overlay');
                    $('#' + elId).addClass('overlay--open').appendTo(document.body);
                });

                bean.on(document.body, 'click', '.js-overlay-close', function (e) {
                    var overlay = $.ancestor(e.target, 'overlay');
                    if (overlay) {
                        bonzo(overlay).removeClass('overlay--open');
                    }
                    bonzo(document.body).removeClass('has-overlay');
                    if (offset) {
                        window.setTimeout(function () {
                            document.body.scrollTop = offset;
                            offset = null;
                        }, 1);
                    }
                });
            },

            initShareCounts: function () {
                shareCount.init();
            },

            initLastModified: function () {
                LastModified.init();
            },

            loadBreakingNews: function () {
                if (config.switches.breakingNews) {
                    breakingNews();
                }
            },

            runCssLogging: function () {
                if (config.switches.cssLogging) {
                    logCss();
                }
            },

            initSimpleMetrics: function () {
                simpleMetrics.init();
            },

            initTechFeedback: function () {
                techFeedback.init();
            },

            initAccessibilityPrefs: function () {
                accessilbilityPrefs.init();
            },

            initPublicApi: function () {
                // BE CAREFUL what you expose here...
                window.guardian.api = {
                    logCss: logCss
                };
            },

            runCustomAbTests: function () {
                if (ab.shouldRunTest('MtRec1', 'A')) {
                    ab.getTest('MtRec1').fireRecTest();
                }

                if (ab.shouldRunTest('MtRec2', 'A')) {
                    ab.getTest('MtRec2').fireRecTest();
                }
            },

            internationalSignposting: function () {
                if ('internationalEdition' in config.page) {
                    if (config.page.internationalEdition === 'international' && config.page.pageId === 'international') {
                        new Message('international-with-survey-new', {
                            pinOnHide: true
                        }).show(template(internationalMessage, {}));
                    } else if (config.page.internationalEdition === 'control' && config.page.pageId === 'uk') {
                        new Message('international', {
                            pinOnHide: true
                        }).show(template(internationalControlMessage, {}));
                    }
                }
            }
        },

        ready = function () {
            robust('c-fonts',           modules.loadFonts);
            robust('c-identity',        modules.initId);
            robust('c-adverts',         modules.initUserAdTargeting);
            robust('c-discussion',      modules.initDiscussion);
            robust('c-fast-click',      modules.initFastClick);
            robust('c-test-cookie',     modules.testCookie);
            robust('c-ad-cookie',       modules.adTestCookie);
            robust('c-event-listeners', modules.windowEventListeners);
            robust('c-breaking-news',   modules.loadBreakingNews);
            robust('c-shares',          modules.initShareCounts);
            robust('c-last-modified',   modules.initLastModified);
            robust('c-block-link',      modules.initialiseFauxBlockLink);
            robust('c-iframe',          modules.checkIframe);
            robust('c-tabs',            modules.showTabs);
            robust('c-top-nav',         modules.initialiseTopNavItems);
            robust('c-init-nav',        modules.initialiseNavigation);
            robust('c-toggles',         modules.showToggles);
            robust('c-dates',           modules.showRelativeDates);
            robust('c-clickstream',     modules.initClickstream);
            robust('c-history',         modules.updateHistory);
            robust('c-sign-in',         modules.initAutoSignin);
            robust('c-interactive',     modules.augmentInteractive);
            robust('c-history-nav',     modules.showHistoryInMegaNav);
            robust('c-forsee',          modules.runForseeSurvey);
            robust('c-start-register',  modules.startRegister);
            robust('c-comments',        modules.repositionComments);
            robust('c-tag-links',       modules.showMoreTagsLink);
            robust('c-smart-banner',    modules.showSmartBanner);
            robust('c-adblock',         modules.showAdblockMessage);
            robust('c-log-stats',       modules.logLiveStats);
            robust('c-analytics',       modules.loadAnalytics);
            robust('c-cookies',         modules.cleanupCookies);
            robust('c-popular',         modules.initPopular);
            robust('c-related',         modules.initRelated);
            robust('c-onward',          modules.initOnwardContent);
            robust('c-overlay',         modules.initOpenOverlayOnClick);
            robust('c-css-logging',     modules.runCssLogging);
            robust('c-public-api',      modules.initPublicApi);
            robust('c-simple-metrics',  modules.initSimpleMetrics);
            robust('c-tech-feedback',   modules.initTechFeedback);
            robust('c-media-listeners', modules.mediaEventListeners);
            robust('c-run-custom-ab',   modules.runCustomAbTests);
            robust('c-accessibility-prefs',       modules.initAccessibilityPrefs);
            robust('c-international-signposting', modules.internationalSignposting);
            if (window.console && window.console.log && !config.page.isDev) {
                window.console.log('##::::: ##: ########::::::: ###:::: ########:: ########:::: ##:::: ##: ####: ########:: ####: ##::: ##:: ######::\n##: ##: ##: ##.....::::::: ## ##::: ##.... ##: ##.....::::: ##:::: ##:. ##:: ##.... ##:. ##:: ###:: ##: ##... ##:\n##: ##: ##: ##::::::::::: ##:. ##:: ##:::: ##: ##:::::::::: ##:::: ##:: ##:: ##:::: ##:: ##:: ####: ##: ##:::..::\n##: ##: ##: ######:::::: ##:::. ##: ########:: ######:::::: #########:: ##:: ########::: ##:: ## ## ##: ##:: ####\n##: ##: ##: ##...::::::: #########: ##.. ##::: ##...::::::: ##.... ##:: ##:: ##.. ##:::: ##:: ##. ####: ##::: ##:\n##: ##: ##: ##:::::::::: ##.... ##: ##::. ##:: ##:::::::::: ##:::: ##:: ##:: ##::. ##::: ##:: ##:. ###: ##::: ##:\n ###. ###:: ########:::: ##:::: ##: ##:::. ##: ########:::: ##:::: ##: ####: ##:::. ##: ####: ##::. ##:. ######::\n\nEver thought about joining us?\nhttp://developers.theguardian.com/join-the-team.html');
            }
        };

    return {
        init: ready
    };
});
