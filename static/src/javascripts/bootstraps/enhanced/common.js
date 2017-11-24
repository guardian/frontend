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
import { requestUserSegmentsFromId } from 'commercial/modules/user-ad-targeting';
import { initDonotUseAdblock } from 'common/modules/commercial/donot-use-adblock';
import { refresh as refreshUserFeatures } from 'commercial/modules/user-features';
import CommentCount from 'common/modules/discussion/comment-count';
import { init as initCookieRefresh } from 'common/modules/identity/cookierefresh';
import { initNavigation } from 'common/modules/navigation/navigation';
import { Profile } from 'common/modules/navigation/profile';
import { Search } from 'common/modules/navigation/search';
import { initMembership } from 'common/modules/navigation/membership';
import {
    logHistory,
    logSummary,
    showInMegaNav,
} from 'common/modules/onward/history';
import { initTechFeedback } from 'common/modules/onward/tech-feedback';
import { initAccessibilityPreferences } from 'common/modules/ui/accessibility-prefs';
import { Clickstream } from 'common/modules/ui/clickstream';
import { init as initDropdowns } from 'common/modules/ui/dropdowns';
import { fauxBlockLink } from 'common/modules/ui/faux-block-link';
import cookiesBanner from 'common/modules/ui/cookiesBanner';
import { init as initRelativeDates } from 'common/modules/ui/relativedates';
import { init as initCustomSmartAppBanner } from 'common/modules/ui/smartAppBanner';
import { init as initTabs } from 'common/modules/ui/tabs';
import { Toggles } from 'common/modules/ui/toggles';
import { breakingNewsInit } from 'common/modules/onward/breaking-news';
import { initPinterest } from 'common/modules/social/pinterest';
import { hiddenShareToggle } from 'common/modules/social/hidden-share-toggle';
import { membershipEngagementBannerInit } from 'common/modules/commercial/membership-engagement-banner';
import { initEmail } from 'common/modules/email/email';
import { init as initEmailArticle } from 'common/modules/email/email-article';
import { init as initIdentity } from 'bootstraps/enhanced/identity-common';
import ophan from 'ophan/ng';

const initialiseTopNavItems = (): void => {
    const header: ?HTMLElement = document.getElementById('header');

    new Search();

    if (header) {
        if (config.switches.idProfileNavigation) {
            const profile: Profile = new Profile({
                url: config.page.idUrl,
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

const initClickstream = (): void => {
    new Clickstream({
        filter: ['a', 'button'],
    });
};

const showAdblockMessage = (): void => {
    initDonotUseAdblock();
};

const loadAnalytics = (): void => {
    interactionTracking.init();
    if (config.switches.ophan) {
        if (config.switches.scrollDepth) {
            mediator.on('scrolldepth:data', ophan.record);

            new ScrollDepth({
                isContent: /Article|LiveBlog/.test(config.page.contentType),
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
        'gu_adfree_user',
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
    if (config.page.contentType !== 'Network Front') {
        logSummary(config.page);
    }

    logHistory(config.page);
};

const showHistoryInMegaNav = (): void => {
    if (config.switches.historyTags) {
        mediator.once('modules:nav:open', () => {
            showInMegaNav();
        });
    }
};

const idCookieRefresh = (): void => {
    if (config.switches.idCookieRefresh) {
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

const startRegister = (): void => {
    initAnalyticsRegister();
};

const initDiscussion = (): void => {
    if (config.switches.enableDiscussionSwitch) {
        CommentCount.init();
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

const loadBreakingNews = (): void => {
    if (
        config.switches.breakingNews &&
        config.page.section !== 'identity' &&
        !config.page.isHosted
    ) {
        breakingNewsInit().catch(() => {
            // breaking news may not load if local storage is unavailable - this is fine
        });
    }
};

const initPublicApi = (): void => {
    // BE CAREFUL what you expose here...
    window.guardian.api = {};
};

const startPinterest = (): void => {
    if (/Article|LiveBlog|Gallery|Video/.test(config.page.contentType)) {
        initPinterest();
    }
};

const membershipEngagementBanner = (): void => {
    if (config.switches.membershipEngagementBanner) {
        membershipEngagementBannerInit();
    }
};

const initialiseEmail = (): void => {
    // Initalise email embedded in page
    initEmail();

    // Initalise email insertion into articles
    if (config.switches.emailInArticle) {
        initEmailArticle();
    }

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

const init = (): void => {
    catchErrorsWithContext([
        // Analytics comes at the top. If you think your thing is more important then please think again...
        ['c-analytics', loadAnalytics],
        ['c-cookies-banner', cookiesBanner.init],
        ['c-identity', initIdentity],
        ['c-adverts', requestUserSegmentsFromId],
        ['c-discussion', initDiscussion],
        ['c-test-cookie', testCookie],
        ['c-event-listeners', windowEventListeners],
        ['c-breaking-news', loadBreakingNews],
        ['c-block-link', fauxBlockLink],
        ['c-iframe', checkIframe],
        ['c-tabs', showTabs],
        ['c-top-nav', initialiseTopNavItems],
        ['c-init-nav', initialiseNavigation],
        ['c-toggles', showToggles],
        ['c-dates', showRelativeDates],
        ['c-clickstream', initClickstream],
        ['c-history', updateHistory],
        ['c-id-cookie-refresh', idCookieRefresh],
        ['c-history-nav', showHistoryInMegaNav],
        ['c-start-register', startRegister],
        ['c-smart-banner', initCustomSmartAppBanner],
        ['c-adblock', showAdblockMessage],
        ['c-cookies', cleanupCookies],
        ['c-localStorage', cleanupLocalStorage],
        ['c-overlay', initOpenOverlayOnClick],
        ['c-public-api', initPublicApi],
        ['c-tech-feedback', initTechFeedback],
        ['c-media-listeners', mediaListener],
        ['c-accessibility-prefs', initAccessibilityPreferences],
        ['c-pinterest', startPinterest],
        ['c-hidden-share-toggle', hiddenShareToggle],
        ['c-show-membership-engagement-banner', membershipEngagementBanner],
        ['c-email', initialiseEmail],
        ['c-user-features', refreshUserFeatures],
        ['c-membership', initMembership],
    ]);
};

export { init };
