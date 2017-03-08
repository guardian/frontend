/*eslint-disable no-new*/
/* TODO - fix module constructors */
define([
    'fastdom',
    'bean',
    'bonzo',
    'qwery',
    'lib/$',
    'lib/config',
    'lib/cookies',
    'lib/detect',
    'lib/mediator',
    'lib/template',
    'lib/url',
    'lib/robust',
    'lib/storage',
    'common/modules/analytics/foresee-survey',
    'common/modules/analytics/media-listener',
    'common/modules/analytics/interaction-tracking',
    'common/modules/analytics/register',
    'common/modules/analytics/scrollDepth',
    'commercial/modules/user-ad-targeting',
    'common/modules/commercial/donot-use-adblock',
    'commercial/modules/user-features',
    'common/modules/discussion/comment-count',
    'common/modules/identity/autosignin',
    'common/modules/identity/cookierefresh',
    'common/modules/navigation/navigation',
    'common/modules/navigation/profile',
    'common/modules/navigation/search',
    'common/modules/navigation/membership',
    'common/modules/onward/history',
    'common/modules/onward/more-tags',
    'common/modules/onward/tech-feedback',
    'common/modules/ui/accessibility-prefs',
    'common/modules/ui/clickstream',
    'common/modules/ui/dropdowns',
    'common/modules/ui/faux-block-link',
    'common/modules/ui/message',
    'common/modules/ui/cookiesBanner',
    'common/modules/ui/relativedates',
    'common/modules/ui/smartAppBanner',
    'common/modules/ui/tabs',
    'common/modules/ui/toggles',
    'common/modules/user-prefs',
    'common/modules/onward/breaking-news',
    'common/modules/social/pinterest',
    'common/modules/social/hidden-share-toggle',
    'common/modules/save-for-later',
    'common/modules/commercial/membership-engagement-banner',
    'common/modules/email/email',
    'common/modules/email/email-article',
    'bootstraps/enhanced/identity-common',
    'lodash/collections/forEach',
    'ophan/ng'
], function (
    fastdom,
    bean,
    bonzo,
    qwery,
    $,
    config,
    cookies,
    detect,
    mediator,
    template,
    url,
    robust,
    storage,
    Foresee,
    mediaListener,
    interactionTracking,
    register,
    ScrollDepth,
    userAdTargeting,
    donotUseAdblock,
    userFeatures,
    CommentCount,
    AutoSignin,
    CookieRefresh,
    navigation,
    Profile,
    Search,
    membership,
    history,
    MoreTags,
    techFeedback,
    accessibilityPrefs,
    Clickstream,
    Dropdowns,
    fauxBlockLink,
    Message,
    cookiesBanner,
    RelativeDates,
    customSmartAppBanner,
    Tabs,
    Toggles,
    userPrefs,
    breakingNews,
    pinterest,
    hiddenShareToggle,
    SaveForLater,
    membershipEngagementBanner,
    email,
    emailArticle,
    identity,
    forEach,
    ophan
) {
    var modules = {
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
            },

            initClickstream: function () {
                new Clickstream({filter: ['a', 'button']});
            },

            showAdblockMessage: function () {
                donotUseAdblock.init();
            },

            loadAnalytics: function () {
                interactionTracking.init();
                if (config.switches.ophan) {
                    if (config.switches.scrollDepth) {
                        mediator.on('scrolldepth:data', ophan.record);

                        new ScrollDepth({
                            isContent: /Article|LiveBlog/.test(config.page.contentType)
                        });
                    }
                }
            },

            cleanupCookies: function () {
                cookies.cleanUp(['mmcore.pd', 'mmcore.srv', 'mmid', 'GU_ABFACIA', 'GU_FACIA', 'GU_ALPHA', 'GU_ME', 'at', 'gu_adfree_user']);
            },

            cleanupLocalStorage : function () {
                var deprecatedKeys = [
                    'gu.subscriber',
                    'gu.contributor',
                    'gu.abb3.exempt'
                ];
                forEach(deprecatedKeys, storage.remove);
            },

            updateHistory: function () {
                if (config.page.contentType !== 'Network Front') {
                    history.logSummary(config.page);
                }

                history.logHistory(config.page);
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

            idCookieRefresh: function () {
                if (config.switches.idCookieRefresh) {
                    new CookieRefresh().init();
                }
            },

            windowEventListeners: function () {
                ['orientationchange'].forEach(function (event) {
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
                register.initialise();
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
                if (config.switches.breakingNews && config.page.section !== 'identity' && !config.page.isHosted) {
                    breakingNews().catch(function() {
                        // breaking news may not load if local storage is unavailable - this is fine
                    });
                }
            },

            initPublicApi: function () {
                // BE CAREFUL what you expose here...
                window.guardian.api = {
                };
            },

            initPinterest: function () {
                if (/Article|LiveBlog|Gallery|Video/.test(config.page.contentType)) {
                    pinterest();
                }
            },


            saveForLater: function () {
                if (config.switches.saveForLater) {
                    var saveForLater = new SaveForLater();
                    saveForLater.conditionalInit();
                }
            },

            membershipEngagementBanner: function() {
                if (config.switches.membershipEngagementBanner) {
                    membershipEngagementBanner.init();
                }
            },

            initEmail: function () {
                // Initalise email embedded in page
                email.init();

                // Initalise email insertion into articles
                if (config.switches.emailInArticle) {
                    emailArticle.init();
                }

                // Initalise email forms in iframes
                forEach(document.getElementsByClassName('js-email-sub__iframe'), function (el) {
                    email.init(el);
                });

                // Listen for interactive load event and initalise forms
                bean.on(window, 'interactive-loaded', function () {
                    forEach(qwery('.guInteractive .js-email-sub__iframe'), function (el) {
                        email.init(el);
                    });
                });
            }
        };
    return {
        init: function () {
            forEach(robust.makeBlocks([

                // Analytics comes at the top. If you think your thing is more important then please think again...
                ['c-analytics', modules.loadAnalytics],

                ['c-cookies-banner', cookiesBanner.init],
                ['c-identity', identity],
                ['c-adverts', userAdTargeting.requestUserSegmentsFromId],
                ['c-discussion', modules.initDiscussion],
                ['c-test-cookie', modules.testCookie],
                ['c-event-listeners', modules.windowEventListeners],
                ['c-breaking-news', modules.loadBreakingNews],
                ['c-block-link', fauxBlockLink],
                ['c-iframe', modules.checkIframe],
                ['c-tabs', modules.showTabs],
                ['c-top-nav', modules.initialiseTopNavItems],
                ['c-init-nav', modules.initialiseNavigation],
                ['c-toggles', modules.showToggles],
                ['c-dates', modules.showRelativeDates],
                ['c-clickstream', modules.initClickstream],
                ['c-history', modules.updateHistory],
                ['c-sign-in', modules.initAutoSignin],
                ['c-id-cookie-refresh', modules.idCookieRefresh],
                ['c-history-nav', modules.showHistoryInMegaNav],
                ['c-forsee', modules.runForseeSurvey],
                ['c-start-register', modules.startRegister],
                ['c-tag-links', modules.showMoreTagsLink],
                ['c-smart-banner', customSmartAppBanner.init],
                ['c-adblock', modules.showAdblockMessage],
                ['c-cookies', modules.cleanupCookies],
                ['c-localStorage', modules.cleanupLocalStorage],
                ['c-overlay', modules.initOpenOverlayOnClick],
                ['c-public-api', modules.initPublicApi],
                ['c-tech-feedback', techFeedback],
                ['c-media-listeners', mediaListener],
                ['c-accessibility-prefs', accessibilityPrefs],
                ['c-pinterest', modules.initPinterest],
                ['c-hidden-share-toggle', hiddenShareToggle],
                ['c-save-for-later', modules.saveForLater],
                ['c-show-membership-engagement-banner', modules.membershipEngagementBanner],
                ['c-email', modules.initEmail],
                ['c-user-features', userFeatures.refresh.bind(userFeatures)],
                ['c-membership',membership]

            ]), function (fn) {
                fn();
            });
        }
    };
});
