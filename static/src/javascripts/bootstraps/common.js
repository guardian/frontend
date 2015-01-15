/* jshint nonew: false */
/* TODO - fix module constructors so we can remove the above jshint override */
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
    'common/utils/mediator',
    'common/utils/template',
    'common/utils/url',

    'common/modules/analytics/clickstream',
    'common/modules/analytics/foresee-survey',
    'common/modules/analytics/livestats',
    'common/modules/analytics/omniture',
    'common/modules/analytics/register',
    'common/modules/analytics/scrollDepth',
    'common/modules/analytics/css-logging',
    'common/modules/commercial/user-ad-targeting',
    'common/modules/crosswords/thumbnails',
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
    'common/modules/user-prefs',
    'common/modules/weather',

    'bootstraps/identity',

    'text!common/views/release-message.html',
    'text!common/views/release-message-compulsory.html',
    'text!common/views/release-message-launched.html'
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
    mediator,
    template,
    url,

    Clickstream,
    Foresee,
    liveStats,
    Omniture,
    register,
    ScrollDepth,
    cssLogging,
    userAdTargeting,
    crosswordThumbnails,
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
    TonalComponent,
    releaseMessage,
    shareCount,
    Dropdowns,
    fauxBlockLink,
    fonts,
    Message,
    RelativeDates,
    smartAppBanner,
    Tabs,
    Toggles,
    userPrefs,
    weather,

    identity,

    releaseMessageTpl,
    releaseMessageCompulsoryTpl,
    releaseMessageLaunchedTpl
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

            transcludePopular: function () {
                if (!config.page.isFront) {
                    new Popular().init();
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
                cookies.cleanUp(['mmcore.pd', 'mmcore.srv', 'mmid', 'GU_ABFACIA', 'GU_FACIA', 'GU_ALPHA', 'GU_ME']);
                cookies.cleanUpDuplicates(['GU_VIEW']);
            },

            // opt-in to the responsive alpha
            optIn: function () {
                if (window.location.hash.substr(1).split('&').indexOf('countmein') !== -1) {
                    cookies.add('GU_VIEW', 'responsive', 365);
                }
            },

            // display a flash message to devices over 600px who don't have the mobile cookie
            displayReleaseMessage: function () {

                var exitLink, shift,
                    path = (document.location.pathname) ? document.location.pathname : '/',
                    releaseMessage = new Message('alpha', {pinOnHide: true}),
                    feedbackLink = 'https://www.surveymonkey.com/s/theguardian-' + (config.page.edition || 'uk').toLowerCase() + '-edition-feedback';

                if (
                    config.switches.releaseMessage &&
                    (detect.getBreakpoint() !== 'mobile')
                ) {
                    if (config.page.showClassicVersion) {
                        // force the visitor in to the alpha release for subsequent visits
                        cookies.add('GU_VIEW', 'responsive', 365);

                        exitLink = '/preference/platform/classic?page=' + encodeURIComponent(path + '?view=classic');

                        // The shift cookie may be 'in|...', 'ignore', or 'out'.
                        shift = cookies.get('GU_SHIFT') || '';

                        if (config.page.edition === 'US' || /in\|/.test(shift)) {
                            releaseMessage.show(template(
                                releaseMessageCompulsoryTpl,
                                {
                                    feedbackLink: feedbackLink
                                }
                            ));
                        } else {
                            releaseMessage.show(template(
                                releaseMessageTpl,
                                {
                                    exitLink: exitLink,
                                    feedbackLink: feedbackLink
                                }
                            ));
                        }
                    } else {
                        releaseMessage.show(template(
                            releaseMessageLaunchedTpl,
                            {
                                feedbackLink: feedbackLink
                            }
                        ));
                    }
                }
            },

            unshackleParagraphs: function () {
                if (userPrefs.isOff('para-indents')) {
                    $('.paragraph-spacing--indents').removeClass('paragraph-spacing--indents');
                }
            },

            updateHistory: function () {
                mediator.on('page:common:ready', function () {
                    if (config.page.contentType !== 'Network Front') {
                        history.logSummary(config.page);
                    }

                    if (config.page.contentType === 'Video') {
                        history.logHistory(config.page);
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
                    if (config.switches.discussion) {
                        CommentCount.init();
                        if (config.page.commentable) {
                            var el = qwery('.discussion')[0];
                            if (el) {
                                new DiscussionLoader().attachTo(el);
                            }
                        }
                    }
                });
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
            },

            runCssLogging: function () {
                mediator.on('page:common:ready', function () {
                    if (config.switches.cssLogging && Math.random() < 0.0001) {
                        cssLogging.run();
                    }
                });
            }

        },
        ready = function () {
            modules.loadFonts();
            modules.initId();
            modules.initUserAdTargeting();
            modules.initDiscussion();
            modules.initFastClick();
            modules.testCookie();
            modules.adTestCookie();
            modules.windowEventListeners();
            modules.initShareCounts();
            modules.initialiseFauxBlockLink();
            modules.checkIframe();
            modules.showTabs();
            modules.initialiseTopNavItems();
            modules.initialiseNavigation();
            modules.showToggles();
            modules.showRelativeDates();
            modules.initClickstream();
            modules.optIn();
            modules.displayReleaseMessage();
            modules.updateHistory();
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
            modules.runCssLogging();
            crosswordThumbnails.init();

            mediator.emit('page:common:ready');
        };

    return {
        init: ready
    };
});
