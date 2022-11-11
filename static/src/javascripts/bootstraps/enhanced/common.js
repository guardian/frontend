/* eslint-disable no-new */
/* TODO - fix module constructors */
import bean from 'bean';
import config from 'lib/config';
import { cleanUp, addSessionCookie } from 'lib/cookies';
import { mediator } from 'lib/mediator';
import { getUrlVars } from 'lib/url';
import { catchErrorsWithContext } from 'lib/robust';
import { storage } from '@guardian/libs';
import { mediaListener } from 'common/modules/analytics/media-listener';
import interactionTracking from 'common/modules/analytics/interaction-tracking';
import { initAnalyticsRegister } from 'common/modules/analytics/register';
import {
    refresh as refreshUserFeatures,
    extendContribsCookieExpiry,
} from 'common/modules/commercial/user-features';
import { initCommentCount } from 'common/modules/discussion/comment-count';
import { init as initCookieRefresh } from 'common/modules/identity/cookierefresh';
import { initNavigation } from 'common/modules/navigation/navigation';
import { Profile } from 'common/modules/navigation/profile';
import { Search } from 'common/modules/navigation/search';
import {
    initMembership,
    membershipBanner,
} from 'common/modules/navigation/membership';
import {
    logHistory,
    logSummary,
    showInMegaNav,
} from 'common/modules/onward/history';
import { initAccessibilityPreferences } from 'common/modules/ui/accessibility-prefs';
import { initClickstream } from 'common/modules/ui/clickstream';
import { init as initDropdowns } from 'common/modules/ui/dropdowns';
import { fauxBlockLink } from 'common/modules/ui/faux-block-link';
import { init as initRelativeDates } from 'common/modules/ui/relativedates';
import { init as initTabs } from 'common/modules/ui/tabs';
import { Toggles } from 'common/modules/ui/toggles';
import { init as initIdentity } from 'bootstraps/enhanced/identity-common';
import { init as initBannerPicker } from 'common/modules/ui/bannerPicker';
import { trackConsentCookies } from 'common/modules/analytics/send-privacy-prefs';
import { getAllAdConsentsWithState } from 'common/modules/commercial/ad-prefs.lib';
import ophan from 'ophan/ng';
import { adFreeBanner } from 'common/modules/commercial/ad-free-banner';
import { init as initReaderRevenueDevUtils } from 'common/modules/commercial/reader-revenue-dev-utils';
import {
    cmpBannerCandidate,
    addPrivacySettingsLink,
} from 'common/modules/ui/cmp-ui';
import { signInGate } from 'common/modules/identity/sign-in-gate';
import { buildBrazeBanner } from 'common/modules/commercial/braze/brazeBanner';
import { buildBrazeMessaging } from 'common/modules/commercial/braze/buildBrazeMessaging';
import { readerRevenueBanner } from 'common/modules/commercial/reader-revenue-banner';
import { puzzlesBanner } from 'common/modules/commercial/puzzles-banner';
import { init as initGoogleAnalytics } from 'common/modules/tracking/google-analytics';
import { bufferedNotificationListener } from 'common/modules/bufferedNotificationListener';

const initialiseTopNavItems = () => {
    const header = document.getElementById('header');

    new Search();

    if (header) {
        if (config.get('switches.idProfileNavigation')) {
            const profile = new Profile({
                url: config.get('page.idUrl'),
            });
            profile.init();
        }
    }
};

const initialiseNavigation = () => {
    initNavigation();
};

const showTabs = () => {
    ['modules:popular:loaded', 'modules:geomostpopular:ready'].forEach(
        event => {
            mediator.on(event, initTabs);
        }
    );
};

const showToggles = () => {
    const toggles = new Toggles();
    toggles.init();
    toggles.reset();
    initDropdowns();
};

const showRelativeDates = () => {
    initRelativeDates();
};

const initialiseClickstream = () => {
    initClickstream({
        filter: ['a', 'button'],
    });
};

const loadAnalytics = () => {
    interactionTracking.init();
};

const loadGoogleAnalytics = () => {
    const handleGoogleAnalytics = (gaHasConsent) => {
        if (gaHasConsent && !config.get('page.gaIsInitalised')) {
            window.guardian.googleAnalytics.initialiseGa()
        } else {
            // set window.ga back to a stub function when ga consents are removed so that we don't track events
            window.ga = function() {}
            config.set('page.gaIsInitalised', false)
        }
    }
    mediator.on('ga:gaConsentChange', handleGoogleAnalytics)
}

const cleanupCookies = () => {
    cleanUp([
        'mmcore.pd',
        'mmcore.srv',
        'mmid',
        'GU_ABFACIA',
        'GU_FACIA',
        'GU_ALPHA',
        'GU_ME',
        'at',
        'gu_join_date',
    ]);
};

const cleanupLocalStorage = () => {
    const deprecatedKeys = [
        'gu.subscriber',
        'gu.contributor',
        'gu.cachedRecommendations',
        'gu.recommendationsEnabled',
        'gu.abb3.exempt',
    ];
    deprecatedKeys.forEach(key => storage.local.remove(key));
};

const updateHistory = () => {
    const page = config.get('page');

    if (page) {
        const { contentType } = page;

        if (contentType !== 'Network Front') {
            logSummary(page);
        }

        logHistory(page);
    }
};

const showHistoryInMegaNav = () => {
    if (config.get('switches.historyTags')) {
        mediator.once('modules:nav:open', () => {
            showInMegaNav();
        });
    }
};

const idCookieRefresh = () => {
    if (config.get('switches.idCookieRefresh')) {
        initCookieRefresh();
    }
};

const windowEventListeners = () => {
    ['orientationchange'].forEach(event => {
        window.addEventListener(
            event,
            mediator.emit.bind(mediator, `window:${event}`)
        );
    });
};

const checkIframe = () => {
    if (window.self !== window.top) {
        const html = document.documentElement;
        if (html) {
            html.classList.add('iframed');
        }
    }
};

const normalise = () => {
    if (document.location.hash === '#nfn') {
        storage.local.set('nfn', true);
    }
    if (document.location.hash === '#nnfn') {
        storage.local.remove('nfn');
    }
    if (storage.local.get('nfn')) {
        import('common/modules/ui/normalise').then(({ go }) => {
            go();
        });
    }
};

const startRegister = () => {
    initAnalyticsRegister();
};

const initDiscussion = () => {
    if (config.get('switches.enableDiscussionSwitch')) {
        initCommentCount();
    }
};

const testCookie = () => {
    const queryParams = getUrlVars();
    if (queryParams.test) {
        addSessionCookie('GU_TEST', encodeURIComponent(queryParams.test));
    }
};

const initOpenOverlayOnClick = () => {
    let offset;
    const body = document.body;

    if (!body) return;

    bean.on(body, 'click', '[data-open-overlay-on-click]', e => {
        const elId = (e.currentTarget).getAttribute(
            'data-open-overlay-on-click'
        );
        offset = body.scrollTop;
        body.classList.add('has-overlay');
        const el = document.getElementById(elId);
        if (el) {
            el.classList.add('overlay--open');
            body.appendChild(el);
        }
    });

    bean.on(body, 'click', '.js-overlay-close', e => {
        const overlay = (e.target).closest('.overlay');
        if (overlay) {
            overlay.classList.remove('overlay--open');
        }
        body.classList.remove('has-overlay');
        window.setTimeout(() => {
            if (offset) {
                body.scrollTop = offset;
                offset = null;
            }
        }, 1);
    });
};

const initPublicApi = () => {
    // BE CAREFUL what you expose here...
    window.guardian.api = {};
};

const initialiseBanner = () => {
    const brazeMessagingPromise = buildBrazeMessaging();
    const brazeMessagesPromise = brazeMessagingPromise.then(
        ({ brazeMessages }) => brazeMessages
    );
    const brazeBanner = buildBrazeBanner(brazeMessagesPromise);

    brazeMessagingPromise.then(
        ({ brazeCards }) => brazeCards
    ).then((brazeCards) => {
        return brazeCards.getCardsForProfileBadge();
    }).then(cards => {
        console.log("Your notifications", cards);

        cards.filter((card) => {
            return Boolean(card.extras.target && card.extras.message);
        }).forEach((card) => {
            const notification = {
                target: card.extras.target,
                message: card.extras.message,
            };

            bufferedNotificationListener.emit(notification);
        })
    })

    const isPreview = config.get('page.isPreview', false)
    // ordered by priority
    // in preview we don't want to show most banners as they are an unnecessary interruption
    // however braze banner does use preview for testing
    const bannerList = isPreview ? [
        cmpBannerCandidate,
        brazeBanner,
    ] : [
        cmpBannerCandidate,
        signInGate,
        membershipBanner,
        puzzlesBanner,
        readerRevenueBanner,
        adFreeBanner,
        brazeBanner,
    ];

    initBannerPicker(bannerList);
};

const initialiseConsentCookieTracking = () =>
    trackConsentCookies(getAllAdConsentsWithState());

const init = () => {
    catchErrorsWithContext([
        // Analytics comes at the top. If you think your thing is more important then please think again...
        ['c-analytics', loadAnalytics],
        ['c-consent-cookie-tracking', initialiseConsentCookieTracking],
        ['c-identity', initIdentity],
        ['c-discussion', initDiscussion],
        ['c-test-cookie', testCookie],
        ['c-event-listeners', windowEventListeners],
        ['c-block-link', fauxBlockLink],
        ['c-iframe', checkIframe],
        ['c-normalise', normalise],
        ['c-tabs', showTabs],
        ['c-top-nav', initialiseTopNavItems],
        ['c-init-nav', initialiseNavigation],
        ['c-toggles', showToggles],
        ['c-dates', showRelativeDates],
        ['c-clickstream', initialiseClickstream],
        ['c-history', updateHistory],
        ['c-id-cookie-refresh', idCookieRefresh],
        ['c-history-nav', showHistoryInMegaNav],
        ['c-start-register', startRegister],
        ['c-cookies', cleanupCookies],
        ['c-extend-contribs-expiry', extendContribsCookieExpiry],
        ['c-localStorage', cleanupLocalStorage],
        ['c-overlay', initOpenOverlayOnClick],
        ['c-public-api', initPublicApi],
        ['c-media-listeners', mediaListener],
        ['c-accessibility-prefs', initAccessibilityPreferences],
        ['c-user-features', refreshUserFeatures],
        ['c-membership', initMembership],
        ['c-banner-picker', initialiseBanner],
        ['c-reader-revenue-dev-utils', initReaderRevenueDevUtils],
        ['c-add-privacy-settings-link', addPrivacySettingsLink],
        ['c-load-google-analytics', loadGoogleAnalytics],
        ['c-google-analytics', initGoogleAnalytics],
    ]);
};

export { init };
