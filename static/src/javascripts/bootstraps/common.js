/*eslint-disable no-new*/
/* TODO - fix module constructors */
define([
    'bean',
    'bonzo',
    'fastclick',
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'common/utils/url',
    'common/utils/robusts',
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
    'common/modules/experiments/ab',
    'common/modules/identity/autosignin',
    'common/modules/navigation/navigation',
    'common/modules/navigation/sticky',
    'common/modules/navigation/profile',
    'common/modules/navigation/search',
    'common/modules/onward/history',
    'common/modules/onward/more-tags',
    'common/modules/onward/tech-feedback',
    'common/modules/ui/accessibility-prefs',
    'common/modules/ui/clickstream',
    'common/modules/ui/dropdowns',
    'common/modules/ui/faux-block-link',
    'common/modules/ui/fonts',
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
    'bootstraps/identity-common'
], function (
    bean,
    bonzo,
    FastClick,
    qwery,
    $,
    config,
    cookies,
    detect,
    mediator,
    template,
    url,
    robusts,
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
    ab,
    AutoSignin,
    navigation,
    sticky,
    Profile,
    Search,
    history,
    MoreTags,
    techFeedback,
    accessibilityPrefs,
    Clickstream,
    Dropdowns,
    fauxBlockLink,
    fonts,
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
            initFastClick: function () {
                // Unfortunately FastClick’s UMD exports are not consistent for
                // all types. AMD exports FastClick, CJS exports FastClick.attach
                // As per: https://github.com/ftlabs/fastclick/blob/master/lib/fastclick.js#L829-L840
                (config.tests.jspmTest ? FastClick : FastClick.attach)(document.body);
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

            initialiseStickyHeader: function () {
                if (ab.shouldRunTest('Viewability', 'variant') && config.page.contentType !== 'Interactive') {
                    sticky.init();
                }
            },

            showTabs: function () {
                var tabs = new Tabs();
                ['modules:popular:loaded', 'modules:geomostpopular:ready'].forEach(function (event) {
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
                ['resize', 'scroll', 'orientationchange'].forEach(function (event) {
                    bean.on(window, event, mediator.emit.bind(mediator, 'window:' + event));
                });
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

            startRegister: function () {
                if (!config.page.isSSL) {
                    register.initialise();
                }
            },

            showMoreTagsLink: function () {
                new MoreTags().init();
            },

            initDiscussion: function () {
                if (config.switches.discussion) {
                    CommentCount.init();
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

            loadBreakingNews: function () {
                if (config.switches.breakingNews && config.page.section !== 'identity') {
                    breakingNews();
                }
            },

            runCssLogging: function () {
                if (config.switches.cssLogging) {
                    logCss();
                }
            },

            initPublicApi: function () {
                // BE CAREFUL what you expose here...
                window.guardian.api = {
                    logCss: logCss
                };
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
        };

    return {
        init: function () {
            robusts([
                ['c-fonts', fonts],
                ['c-identity', identity],
                ['c-adverts', userAdTargeting.requestUserSegmentsFromId],
                ['c-discussion', modules.initDiscussion],
                ['c-fast-click', modules.initFastClick],
                ['c-test-cookie', modules.testCookie],
                ['c-ad-cookie', modules.adTestCookie],
                ['c-event-listeners', modules.windowEventListeners],
                ['c-breaking-news', modules.loadBreakingNews],
                ['c-block-link', fauxBlockLink],
                ['c-iframe', modules.checkIframe],
                ['c-tabs', modules.showTabs],
                ['c-top-nav', modules.initialiseTopNavItems],
                ['c-init-nav', modules.initialiseNavigation],
                ['c-sticky-header', modules.initialiseStickyHeader],
                ['c-toggles', modules.showToggles],
                ['c-dates', modules.showRelativeDates],
                ['c-clickstream', modules.initClickstream],
                ['c-history', modules.updateHistory],
                ['c-sign-in', modules.initAutoSignin],
                ['c-history-nav', modules.showHistoryInMegaNav],
                ['c-forsee', modules.runForseeSurvey],
                ['c-start-register', modules.startRegister],
                ['c-tag-links', modules.showMoreTagsLink],
                ['c-smart-banner', smartAppBanner.init],
                ['c-adblock', modules.showAdblockMessage],
                ['c-log-stats', modules.logLiveStats],
                ['c-analytics', modules.loadAnalytics],
                ['c-cookies', modules.cleanupCookies],
                ['c-overlay', modules.initOpenOverlayOnClick],
                ['c-css-logging', modules.runCssLogging],
                ['c-public-api', modules.initPublicApi],
                ['c-simple-metrics', simpleMetrics],
                ['c-tech-feedback', techFeedback],
                ['c-media-listeners', mediaListener],
                ['c-accessibility-prefs', accessibilityPrefs],
                ['c-international-signposting', modules.internationalSignposting]
            ]);
            if (window.console && window.console.log && !config.page.isDev) {
                window.console.log('##::::: ##: ########::::::: ###:::: ########:: ########:::: ##:::: ##: ####: ########:: ####: ##::: ##:: ######::\n##: ##: ##: ##.....::::::: ## ##::: ##.... ##: ##.....::::: ##:::: ##:. ##:: ##.... ##:. ##:: ###:: ##: ##... ##:\n##: ##: ##: ##::::::::::: ##:. ##:: ##:::: ##: ##:::::::::: ##:::: ##:: ##:: ##:::: ##:: ##:: ####: ##: ##:::..::\n##: ##: ##: ######:::::: ##:::. ##: ########:: ######:::::: #########:: ##:: ########::: ##:: ## ## ##: ##:: ####\n##: ##: ##: ##...::::::: #########: ##.. ##::: ##...::::::: ##.... ##:: ##:: ##.. ##:::: ##:: ##. ####: ##::: ##:\n##: ##: ##: ##:::::::::: ##.... ##: ##::. ##:: ##:::::::::: ##:::: ##:: ##:: ##::. ##::: ##:: ##:. ###: ##::: ##:\n ###. ###:: ########:::: ##:::: ##: ##:::. ##: ########:::: ##:::: ##: ####: ##:::. ##: ####: ##::. ##:. ######::\n\nEver thought about joining us?\nhttp://developers.theguardian.com/join-the-team.html');
            }
        }
    };
});
