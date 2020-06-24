// @flow
import config from 'lib/config';
import { Message } from 'common/modules/ui/message';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { getControlEngagementBannerParams } from 'common/modules/commercial/membership-engagement-banner-parameters';
import { isBlocked } from 'common/modules/commercial/membership-engagement-banner-block';
import {
    type ReaderRevenueRegion,
    getReaderRevenueRegion,
    canShowBannerSync,
    getVisitCount,
} from 'common/modules/commercial/contributions-utilities';
import type { Banner } from 'common/modules/ui/bannerPicker';
import bean from 'bean';
import fetchJson from 'lib/fetch-json';
import reportError from 'lib/report-error';

import {
    submitComponentEvent,
    addTrackingCodesToUrl,
} from 'common/modules/commercial/acquisitions-ophan';
import { acquisitionsBannerControlTemplate } from 'common/modules/commercial/templates/acquisitions-banner-control';
import userPrefs from 'common/modules/user-prefs';
import { initTicker } from 'common/modules/commercial/ticker';
import { getEngagementBannerTestToRun } from 'common/modules/experiments/ab';
import memoize from 'lodash/memoize';
import {bannerSetupArticlesViewedOptOut} from "common/modules/commercial/articles-read-tooltip";

type BannerDeployLog = {
    time: string,
};

const messageCode = 'engagement-banner';

/**
 * minArticlesBeforeShowingBanner is used by the
 * showMeTheBanner function in reader-rev-dev-utils,
 * it is not used in Prod. In Prod minArticlesBeforeShowingBanner
 * value comes from getControlEngagementBannerParams()
 */
const minArticlesBeforeShowingBanner = 2;

const lastClosedAtKey = 'engagementBannerLastClosedAt';

/**
 * We're temporarily using the "/rest-of-world" route
 * for users in the "european-union" region.
 */
const getTimestampOfLastBannerDeployForLocation = (
    region: ReaderRevenueRegion
): Promise<string> =>
    fetchJson(`/reader-revenue/contributions-banner-deploy-log/${region === 'european-union' ? 'rest-of-world' : region}`, {
        mode: 'cors',
    }).then((resp: BannerDeployLog) => resp && resp.time);

const hasBannerBeenRedeployedSinceClosed = (
    userLastClosedBannerAt: string,
    region: ReaderRevenueRegion
): Promise<boolean> =>
    getTimestampOfLastBannerDeployForLocation(region)
        .then(timestamp => {
            // In order to migrate between ISO string and millisecond format support both temporarily
            const stringOrNumberTimestamp = Number(timestamp) || timestamp;
            const bannerLastDeployedAt = new Date(stringOrNumberTimestamp);
            return bannerLastDeployedAt > new Date(userLastClosedBannerAt);
        })
        .catch(err => {
            // Capture in sentry
            reportError(
                new Error(`Unable to get engagement banner deploy log: ${err}`),
                { feature: 'engagement-banner' },
                false
            );
            return false;
        });

const deriveBannerParams = (
    testToRun: ?Runnable<AcquisitionsABTest>
): Promise<EngagementBannerParams> =>
    getControlEngagementBannerParams().then(defaultParams => {
        // If something goes wrong with fetching the control params, we don't
        // want to register a test participation since they could be seeing
        // a different control, which would screw up the test.
        if (testToRun && !defaultParams.isHardcodedFallback) {
            return {
                ...defaultParams,
                ...testToRun.variantToRun.engagementBannerParams,
                abTest: {
                    name: testToRun.id,
                    variant: testToRun.variantToRun.id,
                },
                campaignCode: `${testToRun.id}_${testToRun.variantToRun.id}`,
            };
        }
        return defaultParams;
    });

const selectSequentiallyFrom = (array: Array<string>): string =>
    array[getVisitCount() % array.length];

const hideBanner = (banner: Message) => {
    banner.hide();

    // Store timestamp in localStorage
    userPrefs.set(lastClosedAtKey, new Date().toISOString());
};

const clearBannerHistory = (): void => {
    userPrefs.remove(lastClosedAtKey);
};

const pageIsIdentity = (): boolean => {
    const isIdentityPage =
        config.get('page.contentType') === 'Identity' ||
        config.get('page.section') === 'identity';
    return isIdentityPage;
};

const bannerParamsToHtml = (params: EngagementBannerParams): string => {
    const messageText = Array.isArray(params.messageText)
        ? selectSequentiallyFrom(params.messageText)
        : params.messageText;
    const ctaText = params.ctaText;
    const leadSentence = params.leadSentence;
    const tickerHeader = params.tickerHeader;

    const linkUrl = addTrackingCodesToUrl({
        base: params.linkUrl,
        componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
        componentId: params.campaignCode,
        campaignCode: params.campaignCode,
        ...(params.abTest ? { abTest: params.abTest } : {}),
    });

    const subsLinkUrl = addTrackingCodesToUrl({
        base: `${config.get('page.supportUrl')}/subscribe`,
        componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
        componentId: params.campaignCode,
        campaignCode: params.campaignCode,
        ...(params.abTest ? { abTest: params.abTest } : {}),
    });

    const buttonCaption = params.buttonCaption;
    const templateParams = {
        titles: params.titles,
        leadSentence,
        messageText,
        mobileMessageText: params.mobileMessageText,
        closingSentence: params.closingSentence,
        ctaText,
        linkUrl,
        buttonCaption,
        hasTicker: params.hasTicker,
        tickerHeader,
        signInUrl: params.signInUrl,
        secondaryLinkUrl: params.secondaryLinkUrl,
        secondaryLinkLabel: params.secondaryLinkLabel,
        subsLinkUrl,
    };

    return params.template
        ? params.template(templateParams)
        : acquisitionsBannerControlTemplate(templateParams);
};

const showBannerAsMessage = (
    code: string,
    params: EngagementBannerParams,
    html: string
): boolean =>
    new Message(code, {
        siteMessageLinkName: 'membership message',
        siteMessageCloseBtn: 'hide',
        siteMessageComponentName: params.campaignCode,
        trackDisplay: true,
        cssModifierClass: params.bannerModifierClass || 'engagement-banner',
        customJs() {
            bean.on(
                document,
                'click',
                '.js-engagement-banner-close-button',
                () => hideBanner(this)
            );
        },
    }).show(html);

const trackBanner = (params: EngagementBannerParams): void => {
    ['INSERT', 'VIEW'].forEach(action => {
        submitComponentEvent({
            component: {
                componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
                products: params.products,
                campaignCode: params.campaignCode,
                id: params.campaignCode,
            },
            action,
            ...(params.abTest ? { abTest: params.abTest } : {}),
        });
    });
};

const showBanner = (params: EngagementBannerParams): boolean => {
    const html = bannerParamsToHtml(params);
    const messageShown = showBannerAsMessage(messageCode, params, html);

    if (messageShown) {
        if (params.bannerShownCallback) {
            params.bannerShownCallback();
        }

        bannerSetupArticlesViewedOptOut();
        trackBanner(params);

        if (params.hasTicker) {
            initTicker('.js-engagement-banner-ticker');
        }

        return true;
    }

    return false;
};

const getBannerParams = memoize(
    (): Promise<EngagementBannerParams> =>
        getEngagementBannerTestToRun().then(deriveBannerParams)
);

const show = (): Promise<boolean> =>
    getBannerParams()
        .then(showBanner)
        .catch(err => {
            reportError(
                new Error(
                    `Could not show banner. ${err.message}. Stack: ${err.stack}`
                ),
                { feature: 'engagement-banner' },
                false
            );
            return false;
        });

const canShow = (): Promise<boolean> => {
    if (
        !config.get('switches.membershipEngagementBanner') ||
        isBlocked() ||
        pageIsIdentity()
    ) {
        return Promise.resolve(false);
    }
    return getBannerParams().then(params => {
        if (
            canShowBannerSync(
                params.minArticlesBeforeShowingBanner,
                params.userCohort
            )
        ) {
            const userLastClosedBannerAt = userPrefs.get(lastClosedAtKey);

            if (!userLastClosedBannerAt) {
                // show the banner if we can't get a value for this
                return Promise.resolve(true);
            }

            return hasBannerBeenRedeployedSinceClosed(
                userLastClosedBannerAt,
                getReaderRevenueRegion(geolocationGetSync())
            );
        }
        return Promise.resolve(false);
    });
};

const membershipEngagementBanner: Banner = {
    id: messageCode,
    show,
    canShow,
};

export {
    membershipEngagementBanner,
    canShow,
    messageCode,
    hideBanner,
    clearBannerHistory,
    minArticlesBeforeShowingBanner,
    deriveBannerParams,
    bannerParamsToHtml,
    trackBanner,
};
