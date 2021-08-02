import {
    getEpicMeta,
    getViewLog,
    getWeeklyArticleHistory,
} from '@guardian/automat-contributions';
import { mountDynamic } from '@guardian/automat-modules';
import { onConsentChange } from '@guardian/consent-management-platform';
import userPrefs from 'common/modules/user-prefs';
import config from '../../../../lib/config';
import { getCookie } from '../../../../lib/cookies';
import fastdom from '../../../../lib/fastdom-promise';
import { fetchJson } from '../../../../lib/fetch-json';
import { getCountryCode } from '../../../../lib/geolocation';
import reportError from '../../../../lib/report-error';
import { trackNonClickInteraction } from '../analytics/google';
import { getMvtValue } from '../analytics/mvt-cookie';
import { submitComponentEvent, submitViewEvent } from './acquisitions-ophan';
import { setupRemoteEpicInLiveblog } from './contributions-liveblog-utilities';
import {
    getVisitCount,
    setupOphanView,
    submitOphanInsert,
} from './contributions-utilities';
import {
    ARTICLES_VIEWED_OPT_OUT_COOKIE,
    getLastOneOffContributionTimestamp,
    getLastOneOffContributionDate,
    isRecurringContributor,
    shouldHideSupportMessaging,
} from './user-features';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';

// See https://github.com/guardian/support-dotcom-components/blob/main/module-versions.md
export const ModulesVersion = 'v2';

const isHosted = config.get('page.isHosted');

const buildKeywordTags = page => {
    const keywordIds = page.keywordIds.split(',');
    const keywords = page.keywords.split(',');
    return keywordIds.map((id, idx) => ({
        id,
        type: 'Keyword',
        title: keywords[idx],
    }));
};

const epicEl = () => {
    const target = document.querySelector(
        '.submeta'
    );
    if (!target) {
        throw new Error(
            'Could not find target element for Epic'
        );
    }

    const parent = target.parentNode;
    if (!parent) {
        throw new Error(
            'Could not find parent element for Epic'
        );
    }

    const container = document.createElement('div');
    parent.insertBefore(container, target);

    return container;
}

const hasOptedOutOfArticleCount = () =>
    !!getCookie(ARTICLES_VIEWED_OPT_OUT_COOKIE.name)

const DAILY_ARTICLE_COUNT_KEY = 'gu.history.dailyArticleCount';
const WEEKLY_ARTICLE_COUNT_KEY = 'gu.history.weeklyArticleCount';

const removeArticleCountsFromLocalStorage = () => {
    window.localStorage.removeItem(DAILY_ARTICLE_COUNT_KEY);
    window.localStorage.removeItem(WEEKLY_ARTICLE_COUNT_KEY);
}

const REQUIRED_CONSENTS_FOR_ARTICLE_COUNT = [1, 3, 7];

/* eslint-disable guardian-frontend/exports-last */
export const getArticleCountConsent = () => {
    if (hasOptedOutOfArticleCount()) {
        return Promise.resolve(false);
    }
    return new Promise((resolve) => {
        onConsentChange(({ ccpa, tcfv2 , aus}) => {
            if (ccpa || aus) {
                resolve(true);
            } else if (tcfv2) {
                const hasRequiredConsents = REQUIRED_CONSENTS_FOR_ARTICLE_COUNT.every(
                    (consent) => tcfv2.consents[consent],
                );

                if (!hasRequiredConsents) {
                    removeArticleCountsFromLocalStorage();
                }

                resolve(hasRequiredConsents);
            }
        });
    });
};

const buildEpicPayload = async () => {
    const ophan = config.get('ophan');
    const page = config.get('page');

    const countryCode = getCountryCode();

    const tracking = {
        ophanPageId: ophan.pageViewId,
        platformId: 'GUARDIAN_WEB',
        clientName: 'frontend',
        referrerUrl:
            window.location.origin + window.location.pathname,
    };

    const targeting = {
        contentType: page.contentType,
        sectionName: page.section,
        shouldHideReaderRevenue: page.shouldHideReaderRevenue,
        isMinuteArticle: config.hasTone('Minute'),
        isPaidContent: page.isPaidContent,
        isSensitive: page.isSensitive,
        tags: buildKeywordTags(page),
        showSupportMessaging: !shouldHideSupportMessaging(),
        isRecurringContributor: isRecurringContributor(),
        lastOneOffContributionDate:
            getLastOneOffContributionTimestamp() || undefined,
        mvtId: getMvtValue(),
        countryCode,
        epicViewLog: getViewLog(),
        weeklyArticleHistory: getWeeklyArticleHistory(),
        hasOptedOutOfArticleCount: !(await getArticleCountConsent()),
        modulesVersion: ModulesVersion,
        url: window.location.origin + window.location.pathname,
    };

    return {
        tracking,
        targeting,
    };
};

const buildHeaderLinksPayload = () => {
    const ophan = config.get('ophan');
    const countryCode = getCountryCode();
    const edition = config.get('page.edition', '');
    return {
        tracking: {
            ophanPageId: ophan.pageViewId,
            platformId: 'GUARDIAN_WEB',
            referrerUrl: window.location.origin + window.location.pathname,
            clientName: 'frontend',
        },
        targeting: {
            showSupportMessaging: !shouldHideSupportMessaging(),
            edition,
            countryCode,
            modulesVersion: ModulesVersion,
            mvtId: getMvtValue(),
            lastOneOffContributionDate: getLastOneOffContributionDate() || undefined,
        },
    };
}

export const NO_RR_BANNER_TIMESTAMP_KEY = 'gu.noRRBannerTimestamp';   // timestamp of when we were last told not to show a RR banner
const twentyMins = 20*60000;

export const withinLocalNoBannerCachePeriod = () => {
    const item = window.localStorage.getItem(NO_RR_BANNER_TIMESTAMP_KEY);
    if (item && !Number.isNaN(parseInt(item, 10))) {
        const withinCachePeriod = (parseInt(item, 10) + twentyMins) > Date.now();
        if (!withinCachePeriod) {
            // Expired
            window.localStorage.removeItem(NO_RR_BANNER_TIMESTAMP_KEY);
        }
        return withinCachePeriod;
    }
    return false;
};

export const setLocalNoBannerCachePeriod = () =>
    window.localStorage.setItem(NO_RR_BANNER_TIMESTAMP_KEY, `${Date.now()}`);

const buildBannerPayload = async () => {
    const page = config.get('page');

    // TODO: Review whether we need to send all of this in the payload to the server
    const tracking = {
        ophanPageId: config.get('ophan.pageViewId'),
        platformId: 'GUARDIAN_WEB',
        clientName: 'frontend',
        referrerUrl: window.location.origin + window.location.pathname,
    };

    const targeting = {
        alreadyVisitedCount: getVisitCount(),
        shouldHideReaderRevenue: page.shouldHideReaderRevenue,
        isPaidContent: page.isPaidContent,
        showSupportMessaging: !shouldHideSupportMessaging(),
        engagementBannerLastClosedAt: userPrefs.get('engagementBannerLastClosedAt') || undefined,
        subscriptionBannerLastClosedAt: userPrefs.get('subscriptionBannerLastClosedAt') || undefined,
        mvtId: getMvtValue(),
        countryCode: getCountryCode(),
        weeklyArticleHistory: getWeeklyArticleHistory(),
        hasOptedOutOfArticleCount: !(await getArticleCountConsent()),
        modulesVersion: ModulesVersion,
    };

    return {
        tracking,
        targeting,
    };
};

const checkResponseOk = response => {
    if (response.ok) {
        return response;
    }

    throw new Error(
        `Contributions fetch failed with response code: ${response.status}`
    );
};

const getForcedVariant = (type) => {
    if (URLSearchParams) {
        const params = new URLSearchParams(window.location.search);
        const value = params.get(`force-${type}`);
        if (value) {
            return value;
        }
    }

    return null;
};

// TODO: add this to the client library
const getStickyBottomBanner = (payload) => {
    const isProd = config.get('page.isProd');
    const URL = isProd ? 'https://contributions.guardianapis.com/banner' : 'https://contributions.code.dev-guardianapis.com/banner';
    const json = JSON.stringify(payload);

    return fetchJson(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: json,
    });
};

const getPuzzlesBanner = (payload) => {
    const isProd = config.get('page.isProd');
    const URL = isProd ? 'https://contributions.guardianapis.com/puzzles' : 'https://contributions.code.dev-guardianapis.com/puzzles?';
    const json = JSON.stringify(payload);

    const forcedVariant = getForcedVariant('banner');
    const queryString = forcedVariant ? `?force=${forcedVariant}` : '';

    return fetchJson(`${URL}${queryString}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: json,
    });
}

const getHeaderLinks = (payload) => {
    const isProd = config.get('page.isProd');
    const url = isProd ? 'https://contributions.guardianapis.com/header' : 'https://contributions.code.dev-guardianapis.com/header';
    const json = JSON.stringify(payload);

    const forcedVariant = getForcedVariant('header');
    const queryString = forcedVariant ? `?force=${forcedVariant}` : '';

    return fetchJson(`${url}${queryString}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: json,
    });
}

const getEpicUrl = (contentType) => {
    const path = contentType === 'LiveBlog' ? 'liveblog-epic' : 'epic';
    return config.get('page.isDev') ?
        `https://contributions.code.dev-guardianapis.com/${path}` :
        `https://contributions.guardianapis.com/${path}`
};

const renderLiveblogEpic = async (module, meta) => {
    const component = await window.guardianPolyfilledImport(module.url);

    const {
        abTestName,
        abTestVariant,
        componentType,
        products = [],
        campaignCode,
        campaignId
    } = meta;

    const element = setupRemoteEpicInLiveblog(component.ContributionsLiveblogEpic, module.props);

    if (element) {
        submitOphanInsert(abTestName, abTestVariant, componentType, products, campaignCode);
        setupOphanView(
            element,
            abTestName,
            abTestVariant,
            campaignCode,
            campaignId,
            componentType,
            products,
        );
    }
};

const renderEpic = async (module, meta) => {
    const component = await window.guardianPolyfilledImport(module.url);

    const {
        abTestName,
        abTestVariant,
        componentType,
        products = [],
        campaignCode,
        campaignId,
        labels,
    } = meta;

    const el = epicEl();
    mountDynamic(el, component.ContributionsEpic, module.props, true);

    submitOphanInsert(abTestName, abTestVariant, componentType, products, campaignCode, labels);
    setupOphanView(
        el,
        abTestName,
        abTestVariant,
        campaignCode,
        campaignId,
        componentType,
        products,
        labels,
    );
};

export const fetchPuzzlesData = async () => {
    const page = config.get('page');
    const payload = await buildBannerPayload();
    const isPuzzlesPage = page.section === 'crosswords' || page.series === 'Sudoku';

    if (payload.targeting.shouldHideReaderRevenue || payload.targeting.isPaidContent) {
        return null;
    }

    if (isPuzzlesPage) {
        return getPuzzlesBanner(payload).then(json => {
            if (!json.data) {
                return null;
            }
            return (json);
        })
    }
    return null;
}

export const fetchBannerData = async () => {
    const payload = await buildBannerPayload();

    if (payload.targeting.shouldHideReaderRevenue || payload.targeting.isPaidContent || isHosted) {
        return Promise.resolve(null);
    }

    if (payload.targeting.engagementBannerLastClosedAt &&
        payload.targeting.subscriptionBannerLastClosedAt &&
        withinLocalNoBannerCachePeriod()
    ) {
        return Promise.resolve(null);
    }

    return getStickyBottomBanner(payload).then(json => {
        if (!json.data) {
            if (payload.targeting.engagementBannerLastClosedAt && payload.targeting.subscriptionBannerLastClosedAt) {
                setLocalNoBannerCachePeriod();
            }
            return null;
        }

        return (json);
    });
};

export const renderBanner = (response) => {
    const { module, meta } = response.data;
    if (!module) {
        return Promise.resolve(false);
    }

    return window.guardianPolyfilledImport(module.url)
        .then(bannerModule => {
            const Banner = bannerModule[module.name];
            const isPuzzlesBanner = module.name === 'PuzzlesBanner';

            return fastdom.mutate(() => {
                const container = document.createElement('div');
                container.classList.add('site-message--banner');
                container.classList.add('remote-banner');
                if (isPuzzlesBanner) {
                    container.classList.add('remote-banner--puzzles');
                }

                if (document.body) {
                    document.body.insertAdjacentElement('beforeend', container);
                }

                return mountDynamic(
                    container,
                    Banner,
                    { submitComponentEvent, ...module.props},
                    !isPuzzlesBanner // The puzzles banner has its own CacheProvider component, and needs this to be false
                );
            }).then(() => {
                const {
                    abTestName,
                    abTestVariant,
                    componentType,
                    products = [],
                    campaignCode
                } = meta;

                submitOphanInsert(abTestName, abTestVariant, componentType, products, campaignCode);

                // Submit view event now, as the standard view tracking is unreliable if the component is instantly in view
                submitViewEvent({
                    component: {
                        componentType,
                        products,
                        campaignCode,
                        id: campaignCode,
                    },
                    abTest: {
                        name: abTestName,
                        variant: abTestVariant,
                    }
                });

                // track banner view event in Google Analytics for subscriptions banner
                if (componentType === 'ACQUISITIONS_SUBSCRIPTIONS_BANNER') {
                    trackNonClickInteraction('subscription-banner : display')
                }

                return true
            });
        })
        .catch(error => {
            console.log(`Error importing remote banner: ${error}`);
            reportError(new Error(`Error importing remote banner: ${error}`), {}, false);
            return false;
        });
};

export const fetchAndRenderEpic = async () => {
    const page = config.get('page');

    if ((page.contentType === 'Article' || page.contentType === 'LiveBlog') && !isHosted) {
        try {
            const payload = await buildEpicPayload();

            const url = getEpicUrl(page.contentType);
            const response = await getEpicMeta(payload, url);
            checkResponseOk(response);
            const json = await response.json();

            if (json && json.data) {
                const {module, meta} = json.data;

                if (page.contentType === 'Article') {
                    await renderEpic(module, meta);
                } else if (page.contentType === 'LiveBlog') {
                    await renderLiveblogEpic(module, meta);
                }
            }

        } catch (error) {
            console.log(`Error importing remote epic: ${error}`);
            reportError(new Error(`Error importing remote epic: ${error}`), {}, false);
        }
    }
};

export const fetchAndRenderHeaderLinks = async () => {
    const requestData = buildHeaderLinksPayload();

    if (!config.get('switches.remoteHeader', false)) {
        return;
    }

    if (config.get('page.contentType') === 'Gallery') {
        return;
    }

    try {
        const response = await getHeaderLinks(requestData);
        if (!response.data) {
            return null;
        }
        const {module} = response.data;
        const component = await window.guardianPolyfilledImport(module.url);
        const Header = component.Header;

        const el = document.createElement('div');
        const container = document.querySelector('.new-header__cta-bar');
        container.appendChild(el);

        mountDynamic(
            el,
            Header,
            {submitComponentEvent, ...module.props},
            true,
        );
    } catch (error) {
        console.log(`Error importing remote header: ${error}`);
        reportError(new Error(`Error importing remote header: ${error}`), {}, false);
    }
};
