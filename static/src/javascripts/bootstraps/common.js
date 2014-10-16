/* jshint nonew: false */
/* TODO - fix module constructors so we can remove the above jshint override */
define([
    'bean',
    'bonzo',
    'enhancer',
    'fastclick',
    'lodash/functions/debounce',
    'qwery',

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
    'common/modules/discussion/api',
    'common/modules/discussion/comment-count',
    'common/modules/discussion/loader',
    'common/modules/experiments/ab',
    'common/modules/identity/api',
    'common/modules/identity/autosignin',
    'common/modules/navigation/navigation',
    'common/modules/navigation/profile',
    'common/modules/navigation/search',
    'common/modules/onward/breaking-news',
    'common/modules/onward/geo-most-popular',
    'common/modules/onward/history',
    'common/modules/onward/more-tags',
    'common/modules/onward/popular',
    'common/modules/onward/onward-content',
    'common/modules/onward/related',
    'common/modules/onward/tonal',
    'common/modules/release-message',
    'common/modules/ui/dropdowns',
    'common/modules/ui/faux-block-link',
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
    debounce,
    qwery,

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
    discussionApi,
    CommentCount,
    DiscussionLoader,
    ab,
    id,
    AutoSignin,
    Navigation,
    Profile,
    Search,
    breakingNews,
    GeoMostPopular,
    history,
    MoreTags,
    Popular,
    Onward,
    Related,
    TonalComponent,
    releaseMessage,
    Dropdowns,
    fauxBlockLink,
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
                    search = new Search(config),
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
                Navigation.init(config);
            },

            transcludeRelated: function () {
                var r = new Related();
                r.renderRelatedComponent(config);
            },

            transcludePopular: function () {
                if (!config.page.isFront) { new Popular().init(); }
            },

            transcludeOnwardContent: function () {
                if ('seriesId' in config.page) {
                    new Onward(config, qwery('.js-onward'));
                } else if (config.page.tones !== '') {
                    $('.js-onward').each(function (c) {
                        new TonalComponent(config, c).fetch(c, 'html');
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

            initRightHandComponent: function () {
                if (config.page.contentType === 'Article' &&
                    detect.getBreakpoint() !== 'mobile' &&
                    parseInt(config.page.wordCount, 10) > 500) {
                    new GeoMostPopular({});
                }
            },

            logLiveStats: function () {
                liveStats.log(config);
            },

            loadAnalytics: function () {
                var omniture = new Omniture();

                omniture.go(config);

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

                var exitLink, msg, usMsg,
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
                        '<a href="https://www.surveymonkey.com/s/theguardian-beta-feedback" target="_blank">Leave feedback</a>' +
                        '</li>' +
                        '</ul>';

                    usMsg = '<p class="site-message__message" id="site-message__message">' +
                        'You’re viewing a beta release of the Guardian’s responsive website.' +
                        ' We’d love to hear what you think.' +
                        '</p>' +
                        '<ul class="site-message__actions u-unstyled">' +
                        '<li class="site-message__actions__item">' +
                        '<i class="i i-arrow-white-right"></i>' +
                        '<a href="https://www.surveymonkey.com/s/theguardian-beta-feedback" target="_blank">Leave feedback</a>' +
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
                    breakingNews(config);
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
                        new AutoSignin(config).init();
                    }
                });
            },

            windowEventListeners: function () {
                var event,
                    events = {
                        resize: 'window:resize',
                        orientationchange: 'window:orientationchange',
                        scroll: 'window:scroll'
                    },
                    emitEvent = function (eventName) {
                        return function (e) {
                            mediator.emit(eventName, e);
                        };
                    };
                for (event in events) {
                    bean.on(window, event, debounce(emitEvent(events[event]), 200));
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
                            enhancer.render(el, config, mediator);
                        });
                    }
                });
            },

            startRegister: function () {
                if (!config.page.isSSL) {
                    register.initialise(config);
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
                discussionApi.init(config);
                mediator.on('page:common:ready', function () {
                    if (config.page.commentable && config.switches.discussion) {
                        var discussionLoader = new DiscussionLoader();
                        discussionLoader.attachTo($('.discussion')[0]);
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
                releaseMessage.init(config);
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
            }
        },
        ready = function () {
            modules.initFastClick();
            modules.testCookie();
            modules.windowEventListeners();
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
            modules.initDiscussion();
            modules.logLiveStats();
            modules.loadAnalytics();
            modules.cleanupCookies();
            modules.transcludePopular();
            modules.transcludeRelated();
            modules.transcludeOnwardContent();
            modules.initRightHandComponent();
            modules.initReleaseMessage();
            modules.initOpenOverlayOnClick();

            mediator.emit('page:common:ready');
        };

    return {
        init: ready
    };
});
