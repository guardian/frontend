// @flow
import config from 'lib/config';
import { local } from 'lib/storage';
import { Message } from 'common/modules/ui/message';
import mediator from 'lib/mediator';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import {
    defaultEngagementBannerParams,
    getUserVariantParams,
    getControlEngagementBannerParams,
} from 'common/modules/commercial/membership-engagement-banner-parameters';
import { isBlocked } from 'common/modules/commercial/membership-engagement-banner-block';
import {
    type ReaderRevenueRegion,
    shouldShowReaderRevenue,
    getReaderRevenueRegion,
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
import { engagementBannerTestToRun } from '../experiments/ab-tests';

type BannerDeployLog = {
    time: string,
};

const messageCode = 'engagement-banner';
const minArticlesBeforeShowingBanner = 3;

const lastClosedAtKey = 'engagementBannerLastClosedAt';

const getTestAndVariant = (): {
    test: ?Runnable<AcquisitionsABTest>,
    variant: ?Variant,
} => {
    const variant: ?Variant =
        engagementBannerTestToRun && engagementBannerTestToRun.variantToRun;

    return { test: engagementBannerTestToRun, variant };
};

const getVariant = (): ?Variant => getTestAndVariant().variant;

const getTimestampOfLastBannerDeployForLocation = (
    region: ReaderRevenueRegion
): Promise<string> =>
    fetchJson(`/reader-revenue/contributions-banner-deploy-log/${region}`, {
        mode: 'cors',
    }).then((resp: BannerDeployLog) => resp && resp.time);

const hasBannerBeenRedeployedSinceClosed = (
    userLastClosedBannerAt: string,
    region: ReaderRevenueRegion
): Promise<boolean> =>
    getTimestampOfLastBannerDeployForLocation(region)
        .then(timestamp => {
            const bannerLastDeployedAt = new Date(timestamp);
            return bannerLastDeployedAt > new Date(userLastClosedBannerAt);
        })
        .catch(err => {
            // Capture in sentry
            reportError(
                new Error(
                    `Unable to get contributions banner deploy log: ${err}`
                ),
                { feature: 'reader-revenue-contributions-banner' },
                false
            );
            return false;
        });

/*
 * Params for the banner are overlaid in this order, earliest taking precedence:
 *
 *  * Variant (if the user is in an A/B testing variant)
 *  * Edition
 *  * Offering ('membership' or 'contributions')
 *  * Default
 *
 * The 'offering' in use comes from either:
 *
 *  * Variant (if the user is in an A/B testing variant)
 *  * Edition (only one offering can be the default for a given Edition)
 *
 * Returns either 'null' if no banner is available for this edition,
 * otherwise a populated params object that looks like this:
 *
 *  {
 *    messageText: "..."
 *    buttonCaption: "Become a Supporter"
 *  }
 *
 */

const buildCampaignCode = (
    userTest: ?AcquisitionsABTest,
    userVariant: ?Variant
): ?{ campaignCode: string } => {
    if (userTest && userVariant) {
        const params = userVariant.engagementBannerParams;
        if (params && params.campaignCode) {
            return params.campaignCode;
        }
        return { campaignCode: `${userTest.campaignId}_${userVariant.id}` };
    }
};

const deriveBannerParams = (): Promise<?EngagementBannerParams> => {
    const { test, variant } = getTestAndVariant();
    const defaultParams: EngagementBannerParams = defaultEngagementBannerParams();

    // if the user isn't in a test variant, use the control in google docs
    if (!test) {
        return getControlEngagementBannerParams().then(controlParams => ({
            ...defaultParams,
            ...controlParams,
        }));
    }

    const campaignCode: ?{ campaignCode: string } = buildCampaignCode(
        test,
        variant
    );

    return getUserVariantParams(variant)
        .then(variantParams => ({
            ...defaultParams,
            ...variantParams,
            ...campaignCode,
        }))
        .catch(() => defaultParams);
};

const userVariantCanShow = (): boolean => {
    const variant = getVariant();

    if (variant && variant.options && variant.options.blockEngagementBanner) {
        return false;
    }
    return true;
};

const getVisitCount = (): number => local.get('gu.alreadyVisited') || 0;

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

const showBanner = (params: EngagementBannerParams): void => {
    const { test, variant } = getTestAndVariant();

    const messageText = Array.isArray(params.messageText)
        ? selectSequentiallyFrom(params.messageText)
        : params.messageText;
    const ctaText = params.ctaText;

    const linkUrl = addTrackingCodesToUrl({
        base: params.linkUrl,
        componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
        componentId: params.campaignCode,
        campaignCode: params.campaignCode,
        abTest:
            test && variant
                ? { name: test.id, variant: variant.id }
                : undefined,
    });
    const buttonCaption = params.buttonCaption;
    const templateParams = {
        messageText,
        ctaText,
        linkUrl,
        buttonCaption,
        hasTicker: params.hasTicker,
    };

    const renderedBanner: string = params.template
        ? params.template(templateParams)
        : acquisitionsBannerControlTemplate(templateParams);
    const messageShown = new Message(messageCode, {
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
    }).show(renderedBanner);

    if (messageShown) {
        ['INSERT', 'VIEW'].forEach(action => {
            submitComponentEvent({
                component: {
                    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
                    products: params.products,
                    campaignCode: params.campaignCode,
                    id: params.campaignCode,
                },
                action,
                ...(test && variant
                    ? {
                          abTest: {
                              name: test.id,
                              variant: variant.id,
                          },
                      }
                    : {}),
            });
        });

        if (params.hasTicker) {
            initTicker('.js-engagement-banner-ticker');
        }

        mediator.emit('membership-message:display');
    }
};

const show = (): Promise<boolean> =>
    deriveBannerParams().then(params => {
        if (params) {
            showBanner(params);
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    });

const canShow = (): Promise<boolean> => {
    if (!config.get('switches.membershipEngagementBanner') || isBlocked()) {
        return Promise.resolve(false);
    }

    const hasSeenEnoughArticles: boolean =
        getVisitCount() >= minArticlesBeforeShowingBanner;
    const geolocation: string = geolocationGetSync();
    const region: ReaderRevenueRegion = getReaderRevenueRegion(geolocation);

    if (
        hasSeenEnoughArticles &&
        shouldShowReaderRevenue() &&
        userVariantCanShow()
    ) {
        const userLastClosedBannerAt = userPrefs.get(lastClosedAtKey);

        if (!userLastClosedBannerAt) {
            // show the banner if we can't get a value for this
            return Promise.resolve(true);
        }

        return hasBannerBeenRedeployedSinceClosed(
            userLastClosedBannerAt,
            region
        );
    }
    return Promise.resolve(false);
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
};
