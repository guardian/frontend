/*eslint-disable no-new*/
/* TODO - fix module constructors */
import bean from 'bean';
import bonzo from 'bonzo';
import qwery from 'qwery';
import $ from 'lib/$';
import config from 'lib/config';
import cookies from 'lib/cookies';
import detect from 'lib/detect';
import mediator from 'lib/mediator';
import template from 'lodash/utilities/template';
import url from 'lib/url';
import robust from 'lib/robust';
import storage from 'lib/storage';
import mediaListener from 'common/modules/analytics/media-listener';
import interactionTracking from 'common/modules/analytics/interaction-tracking';
import register from 'common/modules/analytics/register';
import ScrollDepth from 'common/modules/analytics/scrollDepth';
import userAdTargeting from 'commercial/modules/user-ad-targeting';
import donotUseAdblock from 'common/modules/commercial/donot-use-adblock';
import userFeatures from 'commercial/modules/user-features';
import CommentCount from 'common/modules/discussion/comment-count';
import CookieRefresh from 'common/modules/identity/cookierefresh';
import navigation from 'common/modules/navigation/navigation';
import Profile from 'common/modules/navigation/profile';
import Search from 'common/modules/navigation/search';
import membership from 'common/modules/navigation/membership';
import history from 'common/modules/onward/history';
import techFeedback from 'common/modules/onward/tech-feedback';
import accessibilityPrefs from 'common/modules/ui/accessibility-prefs';
import Clickstream from 'common/modules/ui/clickstream';
import Dropdowns from 'common/modules/ui/dropdowns';
import fauxBlockLink from 'common/modules/ui/faux-block-link';
import Message from 'common/modules/ui/message';
import cookiesBanner from 'common/modules/ui/cookiesBanner';
import RelativeDates from 'common/modules/ui/relativedates';
import customSmartAppBanner from 'common/modules/ui/smartAppBanner';
import tabs from 'common/modules/ui/tabs';
import Toggles from 'common/modules/ui/toggles';
import userPrefs from 'common/modules/user-prefs';
import breakingNews from 'common/modules/onward/breaking-news';
import pinterest from 'common/modules/social/pinterest';
import hiddenShareToggle from 'common/modules/social/hidden-share-toggle';
import membershipEngagementBanner from 'common/modules/commercial/membership-engagement-banner';
import email from 'common/modules/email/email';
import emailArticle from 'common/modules/email/email-article';
import identity from 'bootstraps/enhanced/identity-common';
import forEach from 'lodash/collections/forEach';
import ophan from 'ophan/ng';
var modules = {
    initialiseTopNavItems: function() {
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

    initialiseNavigation: function() {
        navigation.init();
    },

    showTabs: function() {
        [
            'modules:popular:loaded',
            'modules:geomostpopular:ready',
        ].forEach(function(event) {
            mediator.on(event, function() {
                tabs.init();
            });
        });
    },

    showToggles: function() {
        var toggles = new Toggles.Toggles();
        toggles.init();
        toggles.reset();
        Dropdowns.init();
    },

    showRelativeDates: function() {
        var dates = RelativeDates;
        dates.init();
    },

    initClickstream: function() {
        new Clickstream({
            filter: ['a', 'button']
        });
    },

    showAdblockMessage: function() {
        donotUseAdblock.init();
    },

    loadAnalytics: function() {
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

    cleanupCookies: function() {
        cookies.cleanUp(['mmcore.pd', 'mmcore.srv', 'mmid', 'GU_ABFACIA', 'GU_FACIA', 'GU_ALPHA', 'GU_ME', 'at', 'gu_adfree_user', 'gu_join_date']);
    },

    cleanupLocalStorage: function() {
        var deprecatedKeys = [
            'gu.subscriber',
            'gu.contributor',
            'gu.cachedRecommendations',
            'gu.recommendationsEnabled',
            'gu.abb3.exempt'
        ];
        forEach(deprecatedKeys, storage.remove);
    },

    updateHistory: function() {
        if (config.page.contentType !== 'Network Front') {
            history.logSummary(config.page);
        }

        history.logHistory(config.page);
    },

    showHistoryInMegaNav: function() {
        if (config.switches.historyTags) {
            mediator.once('modules:nav:open', function() {
                history.showInMegaNav();
            });
        }
    },

    idCookieRefresh: function() {
        if (config.switches.idCookieRefresh) {
            new CookieRefresh().init();
        }
    },

    windowEventListeners: function() {
        ['orientationchange'].forEach(function(event) {
            bean.on(window, event, mediator.emit.bind(mediator, 'window:' + event));
        });
    },

    checkIframe: function() {
        if (window.self !== window.top) {
            $('html').addClass('iframed');
        }
    },

    startRegister: function() {
        register.initialise();
    },

    initDiscussion: function() {
        if (config.switches.enableDiscussionSwitch) {
            CommentCount.init();
        }
    },

    testCookie: function() {
        var queryParams = url.getUrlVars();
        if (queryParams.test) {
            cookies.addSessionCookie('GU_TEST', encodeURIComponent(queryParams.test));
        }
    },

    initOpenOverlayOnClick: function() {
        var offset;

        bean.on(document.body, 'click', '[data-open-overlay-on-click]', function(e) {
            var elId = bonzo(e.currentTarget).data('open-overlay-on-click');
            offset = document.body.scrollTop;
            bonzo(document.body).addClass('has-overlay');
            $('#' + elId).addClass('overlay--open').appendTo(document.body);
        });

        bean.on(document.body, 'click', '.js-overlay-close', function(e) {
            var overlay = $.ancestor(e.target, 'overlay');
            if (overlay) {
                bonzo(overlay).removeClass('overlay--open');
            }
            bonzo(document.body).removeClass('has-overlay');
            if (offset) {
                window.setTimeout(function() {
                    document.body.scrollTop = offset;
                    offset = null;
                }, 1);
            }
        });
    },

    loadBreakingNews: function() {
        if (config.switches.breakingNews && config.page.section !== 'identity' && !config.page.isHosted) {
            breakingNews.breakingNewsInit().catch(function() {
                // breaking news may not load if local storage is unavailable - this is fine
            });
        }
    },

    initPublicApi: function() {
        // BE CAREFUL what you expose here...
        window.guardian.api = {};
    },

    initPinterest: function() {
        if (/Article|LiveBlog|Gallery|Video/.test(config.page.contentType)) {
            pinterest.initPinterest();
        }
    },

    membershipEngagementBanner: function() {
        if (config.switches.membershipEngagementBanner) {
            membershipEngagementBanner.membershipEngagementBannerInit();
        }
    },

    initEmail: function() {
        // Initalise email embedded in page
        email.init();

        // Initalise email insertion into articles
        if (config.switches.emailInArticle) {
            emailArticle.init();
        }

        // Initalise email forms in iframes
        forEach(document.getElementsByClassName('js-email-sub__iframe'), function(el) {
            email.init(el);
        });

        // Listen for interactive load event and initalise forms
        bean.on(window, 'interactive-loaded', function() {
            forEach(qwery('.guInteractive .js-email-sub__iframe'), function(el) {
                email.init(el);
            });
        });
    }
};
export default {
    init: function() {
        robust.catchErrorsWithContext([
            // Analytics comes at the top. If you think your thing is more important then please think again...
            ['c-analytics', modules.loadAnalytics],

            ['c-cookies-banner', cookiesBanner.init],
            ['c-identity', identity.init],
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
            ['c-id-cookie-refresh', modules.idCookieRefresh],
            ['c-history-nav', modules.showHistoryInMegaNav],
            ['c-start-register', modules.startRegister],
            ['c-smart-banner', customSmartAppBanner.init],
            ['c-adblock', modules.showAdblockMessage],
            ['c-cookies', modules.cleanupCookies],
            ['c-localStorage', modules.cleanupLocalStorage],
            ['c-overlay', modules.initOpenOverlayOnClick],
            ['c-public-api', modules.initPublicApi],
            ['c-tech-feedback', techFeedback.initTechFeedback],
            ['c-media-listeners', mediaListener],
            ['c-accessibility-prefs', accessibilityPrefs.initAccessibilityPreferences],
            ['c-pinterest', modules.initPinterest],
            ['c-hidden-share-toggle', hiddenShareToggle.hiddenShareToggle],
            ['c-show-membership-engagement-banner', modules.membershipEngagementBanner],
            ['c-email', modules.initEmail],
            ['c-user-features', userFeatures.refresh.bind(userFeatures)],
            ['c-membership', membership]
        ]);
    }
};
