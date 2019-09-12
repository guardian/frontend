// @flow
/* eslint-disable no-new */
/* TODO - fix module constructors */
import bean from 'bean';
import config from 'lib/config';
import { cleanUp, addSessionCookie } from 'lib/cookies';
import mediator from 'lib/mediator';
import { getUrlVars } from 'lib/url';
import { catchErrorsWithContext } from 'lib/robust';
import { local as localStorage } from 'lib/storage';
import { mediaListener } from 'common/modules/analytics/media-listener';
import interactionTracking from 'common/modules/analytics/interaction-tracking';
import { initAnalyticsRegister } from 'common/modules/analytics/register';
import { ScrollDepth } from 'common/modules/analytics/scrollDepth';
import { requestUserSegmentsFromId } from 'common/modules/commercial/user-ad-targeting';
import {
    refresh as refreshUserFeatures,
    extendContribsCookieExpiry,
} from 'common/modules/commercial/user-features';
import { initCommentCount } from 'common/modules/discussion/comment-count';
import { init as initCookieRefresh } from 'common/modules/identity/cookierefresh';
import { initNavigation } from 'common/modules/navigation/navigation';
import { Profile } from 'common/modules/navigation/profile';
import { Search } from 'common/modules/navigation/search';
import { emailSignInBanner } from 'common/modules/identity/email-sign-in-banner/index';
import {
    initMembership,
    membershipBanner,
} from 'common/modules/navigation/membership';
import {
    logHistory,
    logSummary,
    showInMegaNav,
    incrementDailyArticleCount,
    incrementWeeklyArticleCount,
} from 'common/modules/onward/history';
import { initTechFeedback } from 'common/modules/onward/tech-feedback';
import { initAccessibilityPreferences } from 'common/modules/ui/accessibility-prefs';
import { initClickstream } from 'common/modules/ui/clickstream';
import { init as initDropdowns } from 'common/modules/ui/dropdowns';
import { fauxBlockLink } from 'common/modules/ui/faux-block-link';
import { firstPvConsentPlusEngagementBanner } from 'common/modules/ui/first-pv-consent-plus-engagement-banner';
import { firstPvConsentBanner } from 'common/modules/ui/first-pv-consent-banner';
import { init as initRelativeDates } from 'common/modules/ui/relativedates';
import { smartAppBanner } from 'common/modules/ui/smartAppBanner';
import { init as initTabs } from 'common/modules/ui/tabs';
import { Toggles } from 'common/modules/ui/toggles';
import { initPinterest } from 'common/modules/social/pinterest';
import { membershipEngagementBanner } from 'common/modules/commercial/membership-engagement-banner';
import { initEmail } from 'common/modules/email/email';
import { init as initIdentity } from 'bootstraps/enhanced/identity-common';
import { init as initBannerPicker } from 'common/modules/ui/bannerPicker';
import { breakingNews } from 'common/modules/onward/breaking-news';
import { trackConsentCookies } from 'common/modules/analytics/send-privacy-prefs';
import { getAllAdConsentsWithState } from 'common/modules/commercial/ad-prefs.lib';
import ophan from 'ophan/ng';
import { adFreeBanner } from 'common/modules/commercial/ad-free-banner';
import { init as initReaderRevenueDevUtils } from 'common/modules/commercial/reader-revenue-dev-utils';
import {
    consentManagementPlatformUi,
    addPrivacySettingsLink,
} from 'common/modules/ui/cmp-ui';

const initialiseTopNavItems = (): void => {
    const header: ?HTMLElement = document.getElementById('header');

    new Search();

    if (header) {
        if (config.get('switches.idProfileNavigation')) {
            const profile: Profile = new Profile({
                url: config.get('page.idUrl'),
            });
            profile.init();
        }
    }
};

const initialiseNavigation = (): void => {
    initNavigation();
};

const showTabs = (): void => {
    ['modules:popular:loaded', 'modules:geomostpopular:ready'].forEach(
        event => {
            mediator.on(event, initTabs);
        }
    );
};

const showToggles = (): void => {
    const toggles: Toggles = new Toggles();
    toggles.init();
    toggles.reset();
    initDropdowns();
};

const showRelativeDates = (): void => {
    initRelativeDates();
};

const initialiseClickstream = (): void => {
    initClickstream({
        filter: ['a', 'button'],
    });
};

const loadAnalytics = (): void => {
    interactionTracking.init();
    if (config.get('switches.ophan')) {
        if (config.get('switches.scrollDepth')) {
            mediator.on('scrolldepth:data', ophan.record);

            new ScrollDepth({
                isContent: /Article|LiveBlog/.test(
                    config.get('page.contentType')
                ),
            });
        }
    }
};

const cleanupCookies = (): void => {
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

const cleanupLocalStorage = (): void => {
    const deprecatedKeys = [
        'gu.subscriber',
        'gu.contributor',
        'gu.cachedRecommendations',
        'gu.recommendationsEnabled',
        'gu.abb3.exempt',
    ];
    deprecatedKeys.forEach(key => localStorage.remove(key));
};

const updateHistory = (): void => {
    const page = config.get('page');

    if (page) {
        const { contentType } = page;

        if (contentType !== 'Network Front') {
            logSummary(page);
        }

        logHistory(page);
    }
};

const updateArticleCounts = (): void => {
    const page = config.get('page');

    if (page) {
        incrementDailyArticleCount(page);
        incrementWeeklyArticleCount(page);
    }
};

const showHistoryInMegaNav = (): void => {
    if (config.get('switches.historyTags')) {
        mediator.once('modules:nav:open', () => {
            showInMegaNav();
        });
    }
};

const idCookieRefresh = (): void => {
    if (config.get('switches.idCookieRefresh')) {
        initCookieRefresh();
    }
};

const windowEventListeners = (): void => {
    ['orientationchange'].forEach(event => {
        window.addEventListener(
            event,
            mediator.emit.bind(mediator, `window:${event}`)
        );
    });
};

const checkIframe = (): void => {
    if (window.self !== window.top) {
        const html = document.documentElement;
        if (html) {
            html.classList.add('iframed');
        }
    }
};

const normalise = (): void => {
    if (document.location.hash === '#nfn') {
        localStorage.set('nfn', true);
    }
    if (document.location.hash === '#nnfn') {
        localStorage.remove('nfn');
    }
    if (localStorage.get('nfn')) {
        import('common/modules/ui/normalise').then(({ go }) => {
            go();
        });
    }
};

const startRegister = (): void => {
    initAnalyticsRegister();
};

const initDiscussion = (): void => {
    if (config.get('switches.enableDiscussionSwitch')) {
        initCommentCount();
    }
};

const testCookie = (): void => {
    const queryParams = getUrlVars();
    if (queryParams.test) {
        addSessionCookie('GU_TEST', encodeURIComponent(queryParams.test));
    }
};

const initOpenOverlayOnClick = (): void => {
    let offset: ?number;
    const body = document.body;

    if (!body) return;

    bean.on(body, 'click', '[data-open-overlay-on-click]', e => {
        const elId = (e.currentTarget: any).getAttribute(
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
        const overlay = (e.target: any).closest('.overlay');
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

const initPublicApi = (): void => {
    // BE CAREFUL what you expose here...
    window.guardian.api = {};
};

const startPinterest = (): void => {
    if (/Article|LiveBlog|Gallery|Video/.test(config.get('page.contentType'))) {
        initPinterest();
    }
};

const initialiseEmail = (): void => {
    // Initalise email embedded in page
    initEmail();

    // Initalise email forms in iframes
    Array.from(document.getElementsByClassName('js-email-sub__iframe')).forEach(
        el => {
            const iframe: HTMLIFrameElement = (el: any);

            initEmail(iframe);
        }
    );

    // Listen for interactive load event and initalise forms
    bean.on(window, 'interactive-loaded', () => {
        Array.from(
            document.querySelectorAll('.guInteractive .js-email-sub__iframe')
        ).forEach(el => {
            const iframe: HTMLIFrameElement = (el: any);

            initEmail(iframe);
        });
    });
};

const initialiseBanner = (): void => {
    // ordered by priority
    const bannerList = [
        consentManagementPlatformUi,
        firstPvConsentPlusEngagementBanner,
        firstPvConsentBanner,
        breakingNews,
        membershipBanner,
        membershipEngagementBanner,
        smartAppBanner,
        adFreeBanner,
        emailSignInBanner,
    ];

    initBannerPicker(bannerList);
};

const initialiseConsentCookieTracking = (): void =>
    trackConsentCookies(getAllAdConsentsWithState());

const init = (): void => {
    catchErrorsWithContext([
        // Analytics comes at the top. If you think your thing is more important then please think again...
        ['c-analytics', loadAnalytics],
        ['c-consent-cookie-tracking', initialiseConsentCookieTracking],
        ['c-identity', initIdentity],
        ['c-adverts', requestUserSegmentsFromId],
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
        ['c-tech-feedback', initTechFeedback],
        ['c-media-listeners', mediaListener],
        ['c-accessibility-prefs', initAccessibilityPreferences],
        ['c-pinterest', startPinterest],
        ['c-email', initialiseEmail],
        ['c-user-features', refreshUserFeatures],
        ['c-membership', initMembership],
        ['c-banner-picker', initialiseBanner],
        ['c-increment-article-counts', updateArticleCounts],
        ['c-reader-revenue-dev-utils', initReaderRevenueDevUtils],
        ['c-add-privacy-settings-link', addPrivacySettingsLink],
    ]);
};

export { init };
