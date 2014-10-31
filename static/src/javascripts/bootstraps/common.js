/* jshint nonew: false */
/* TODO - fix module constructors so we can remove the above jshint override */
define([
    'bean',
    'bonzo',
    'enhancer',
    'fastclick',
    'qwery',

    'bootstraps/identity',

    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/url',

    'common/modules/analytics/clickstream',
    'common/modules/analytics/foresee-survey',
    'common/modules/analytics/livestats',
    'common/modules/analytics/omniture',
    'common/modules/analytics/register',
    'common/modules/analytics/scrollDepth',
    'common/modules/commercial/user-ad-targeting',
    'common/modules/discussion/comment-count',
    'common/modules/discussion/loader',
    'common/modules/experiments/ab',
    'common/modules/identity/api',
    'common/modules/identity/autosignin',
    'common/modules/navigation/navigation',
    'common/modules/navigation/profile',
    'common/modules/navigation/search',
    'common/modules/onward/breaking-news',
    'common/modules/onward/history',
    'common/modules/onward/more-tags',
    'common/modules/onward/onward-content',
    'common/modules/onward/popular',
    'common/modules/onward/related',
    'common/modules/onward/tonal',
    'common/modules/release-message',
    'common/modules/social/share-count',
    'common/modules/ui/dropdowns',
    'common/modules/ui/faux-block-link',
    'common/modules/ui/fonts',
    'common/modules/ui/message',
    'common/modules/ui/relativedates',
    'common/modules/ui/smartAppBanner',
    'common/modules/ui/tabs',
    'common/modules/ui/toggles',
    'common/modules/userPrefs'
], function (
    bean,
    bonzo,
    enhancer,
    FastClick,
    qwery,

    identity,

    $,
    ajax,
    config,
    Cookies,
    detect,
    mediator,
    Url,

    Clickstream,
    Foresee,
    liveStats,
    Omniture,
    register,
    ScrollDepth,
    userAdTargeting,
    CommentCount,
    DiscussionLoader,
    ab,
    id,
    AutoSignin,
    navigation,
    Profile,
    Search,
    breakingNews,
    history,
    MoreTags,
    Onward,
    Popular,
    Related,
    TonalComponent,
    releaseMessage,
    shareCount,
    Dropdowns,
    fauxBlockLink,
    Fonts,
    Message,
    RelativeDates,
    smartAppBanner,
    Tabs,
    Toggles,
    userPrefs
    ) {

    var modules = {

            initFastClick: function () {
                new FastClick(document.body);
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
                        profile = new Profile(header, {
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
                new Related().renderRelatedComponent();
            },

            transcludePopular: function () {
                if (!config.page.isFront) {
                    new Popular().init();
                }
            },

            transcludeOnwardContent: function () {
                if ('seriesId' in config.page) {
                    new Onward(qwery('.js-onward'));
                } else if (config.page.tones !== '') {
                    $('.js-onward').each(function (c) {
                        new TonalComponent().fetch(c, 'html');
                    });
                }
            },

            showTabs: function () {
                var tabs = new Tabs();
                mediator.on('modules:popular:loaded', function (el) {
                    tabs.init(el);
                });
            },

            showToggles: function () {
                var toggles = new Toggles();
                toggles.init(document);
                mediator.on('page:common:ready', function () {
                    toggles.reset();
                    Dropdowns.init();
                });
            },

            showRelativeDates: function () {
                var dates = RelativeDates;
                mediator.on('page:common:ready', function () {
                    dates.init();
                });
                mediator.on('fragment:ready:dates', function (el) {
                    dates.init(el);
                });
            },

            initClickstream: function () {
                new Clickstream({filter: ['a', 'button']});
            },

            logLiveStats: function () {
                liveStats.log();
            },

            loadAnalytics: function () {
                new Omniture(window.s).go();

                if (config.switches.ophan) {
                    require('ophan/ng', function (ophan) {
                        ophan.record({ab: ab.getParticipations()});

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
                Cookies.cleanUp(['mmcore.pd', 'mmcore.srv', 'mmid', 'GU_ABFACIA', 'GU_FACIA', 'GU_ALPHA']);
                Cookies.cleanUpDuplicates(['GU_VIEW']);
            },

            // opt-in to the responsive alpha
            optIn: function () {
                var countMeIn = /#countmein/.test(window.location.hash);
                if (countMeIn) {
                    Cookies.add('GU_VIEW', 'responsive', 365);
                }
            },

            // display a flash message to devices over 600px who don't have the mobile cookie
            displayReleaseMessage: function () {

                var exitLink, msg, usMsg, feedbackLink,
                    path = (document.location.pathname) ? document.location.pathname : '/',
                    releaseMessage = new Message('alpha', {pinOnHide: true});

                if (
                    config.switches.releaseMessage &&
                    config.page.showClassicVersion &&
                    (detect.getBreakpoint() !== 'mobile')
                ) {
                    // force the visitor in to the alpha release for subsequent visits
                    Cookies.add('GU_VIEW', 'responsive', 365);

                    exitLink = '/preference/platform/classic?page=' + encodeURIComponent(path + '?view=classic');

                    feedbackLink = 'https://www.surveymonkey.com/s/theguardian-' +
                        (config.page.edition || 'uk').toLowerCase() + '-edition-feedback';

                    msg = '<p class="site-message__message" id="site-message__message">' +
                        'You’re viewing a beta release of the Guardian’s responsive website.' +
                        ' We’d love to hear what you think.' +
                        '</p>' +
                        '<ul class="site-message__actions u-unstyled">' +
                        '<li class="site-message__actions__item">' +
                        '<i class="i i-back"></i>' +
                        '<a class="js-main-site-link" rel="nofollow" href="' + exitLink + '"' +
                        'data-link-name="opt-out">Use current version</a>' +
                        '</li>' +
                        '<li class="site-message__actions__item">' +
                        '<i class="i i-arrow-white-right"></i>' +
                        '<a href="' + feedbackLink + '" target="_blank">Leave feedback</a>' +
                        '</li>' +
                        '</ul>';

                    usMsg = '<p class="site-message__message" id="site-message__message">' +
                        'You’re viewing a beta release of the Guardian’s responsive website.' +
                        ' We’d love to hear what you think.' +
                        '</p>' +
                        '<ul class="site-message__actions u-unstyled">' +
                        '<li class="site-message__actions__item">' +
                        '<i class="i i-arrow-white-right"></i>' +
                        '<a href="' + feedbackLink + '" target="_blank">Leave feedback</a>' +
                        '</li>' +
                        '<li class="site-message__actions__item">' +
                        '<i class="i i-arrow-white-right"></i>' +
                        '<a href="http://next.theguardian.com" target="_blank">Find out more</a>' +
                        '</li>' +
                        '</ul>';

                    if (config.page.edition === 'US') {
                        releaseMessage.show(usMsg);
                    } else {
                        releaseMessage.show(msg);
                    }
                }
            },

            displayBreakingNews: function () {
                if (config.switches.breakingNews) {
                    breakingNews();
                }
            },

            unshackleParagraphs: function () {
                if (userPrefs.isOff('para-indents')) {
                    $('.paragraph-spacing--indents').removeClass('paragraph-spacing--indents');
                }
            },

            logReadingHistory: function () {
                mediator.on('page:common:ready', function () {
                    if (config.page.contentType !== 'Network Front') {
                        history.log({
                            id: '/' + config.page.pageId,
                            meta: {
                                section: config.page.section,
                                keywords: config.page.keywordIds && (config.page.keywordIds + '').split(',').slice(0, 5)
                            }
                        });
                    }
                });
            },

            initAutoSignin: function () {
                mediator.on('page:common:ready', function () {
                    if (config.switches && config.switches.facebookAutosignin && detect.getBreakpoint() !== 'mobile') {
                        new AutoSignin().init();
                    }
                });
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
                mediator.on('page:common:ready', function () {
                    if (/Article|Interactive|LiveBlog/.test(config.page.contentType)) {
                        $('figure.interactive').each(function (el) {
                            enhancer.render(el, document, config, mediator);
                        });
                    }
                });
            },

            startRegister: function () {
                if (!config.page.isSSL) {
                    register.initialise();
                }
            },

            repositionComments: function () {
                mediator.on('page:common:ready', function () {
                    if (!id.isUserLoggedIn()) {
                        $('.js-comments').appendTo(qwery('.js-repositioned-comments'));
                    }
                });
            },

            showMoreTagsLink: function () {
                new MoreTags().init();
            },

            showSmartBanner: function () {
                smartAppBanner.init();
            },

            initDiscussion: function () {
                mediator.on('page:common:ready', function () {
                    if (config.page.commentable && config.switches.discussion) {
                        var el = qwery('.discussion')[0];
                        if (el) {
                            new DiscussionLoader().attachTo(el);
                        }
                    }
                    CommentCount.init();
                });
            },

            testCookie: function () {
                var queryParams = Url.getUrlVars();
                if (queryParams.test) {
                    Cookies.addSessionCookie('GU_TEST', encodeURIComponent(queryParams.test));
                }
            },

            initReleaseMessage: function () {
                releaseMessage.init();
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

            }
        },
        ready = function () {
            modules.initDiscussion();
            modules.initFastClick();
            modules.testCookie();
            modules.windowEventListeners();
            modules.initShareCounts();
            modules.initialiseFauxBlockLink();
            modules.checkIframe();
            modules.showTabs();
            modules.initialiseTopNavItems();
            modules.initialiseNavigation();
            modules.displayBreakingNews();
            modules.showToggles();
            modules.showRelativeDates();
            modules.initClickstream();
            modules.optIn();
            modules.displayReleaseMessage();
            modules.logReadingHistory();
            modules.unshackleParagraphs();
            modules.initAutoSignin();
            modules.augmentInteractive();
            modules.runForseeSurvey();
            modules.startRegister();
            modules.repositionComments();
            modules.showMoreTagsLink();
            modules.showSmartBanner();
            modules.logLiveStats();
            modules.loadAnalytics();
            modules.cleanupCookies();
            modules.transcludePopular();
            modules.transcludeRelated();
            modules.transcludeOnwardContent();
            modules.initReleaseMessage();
            modules.initOpenOverlayOnClick();

            mediator.emit('page:common:ready');
        };

    return {
        init: ready
    };
});
