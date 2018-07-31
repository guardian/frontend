// @flow
import config from 'lib/config';
import { local } from 'lib/storage';
import { Message } from 'common/modules/ui/message';
import mediator from 'lib/mediator';
import { membershipEngagementBannerTests } from 'common/modules/experiments/tests/membership-engagement-banner-tests';
import { testCanBeRun } from 'common/modules/experiments/test-can-run-checks';
import { isInTest, variantFor } from 'common/modules/experiments/segment-util';
import { engagementBannerParams } from 'common/modules/commercial/membership-engagement-banner-parameters';
import { isBlocked } from 'common/modules/commercial/membership-engagement-banner-block';
import { getSync as getGeoLocation } from 'lib/geolocation';
import { shouldShowReaderRevenue } from 'common/modules/commercial/contributions-utilities';
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

type BannerDeployLog = {
    time: string,
};

const messageCode = 'engagement-banner';

const getTimestampOfLastBannerDeploy = (): Promise<string> =>
    fetchJson('/reader-revenue/contributions-banner-deploy-log', {
        mode: 'cors',
    }).then((resp: BannerDeployLog) => resp && resp.time);

const hasBannerBeenRedeployedSinceClosed = (): Promise<boolean> =>
    getTimestampOfLastBannerDeploy()
        .then(timestamp => {
            const bannerLastDeployedAt = new Date(timestamp);
            const userLastClosedBannerAt = new Date(
                userPrefs.get('engagementBannerLastClosedAt')
            );

            return bannerLastDeployedAt > userLastClosedBannerAt;
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

const getUserTest = (): ?AcquisitionsABTest =>
    membershipEngagementBannerTests.find(
        test => testCanBeRun(test) && isInTest(test)
    );

const getUserVariant = (test: ?ABTest): ?Variant =>
    test ? variantFor(test) : undefined;

const buildCampaignCode = (campaignId: string, variantId: string): string =>
    `${campaignId}_${variantId}`;

const getUserVariantParams = (
    userVariant: ?Variant,
    campaignId: ?string
): EngagementBannerParams | {} => {
    if (
        campaignId &&
        userVariant &&
        userVariant.options &&
        userVariant.options.engagementBannerParams
    ) {
        const userVariantParams = userVariant.options.engagementBannerParams;

        if (!userVariantParams.campaignCode) {
            userVariantParams.campaignCode = buildCampaignCode(
                campaignId,
                userVariant.id
            );
        }

        return userVariantParams;
    } else if (campaignId && userVariant) {
        return {
            campaignCode: buildCampaignCode(campaignId, userVariant.id),
        };
    }
    return {};
};

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
 *    minArticles: 5, // how many articles should the user see before they get the engagement banner?
 *    messageText: "..."
 *    buttonCaption: "Become a Supporter"
 *  }
 *
 */
const deriveBannerParams = (location: string): ?EngagementBannerParams => {
    const defaultParams = engagementBannerParams(location);
    const userTest = getUserTest();
    const campaignId = userTest ? userTest.campaignId : undefined;
    const userVariant = getUserVariant(userTest);

    if (
        userVariant &&
        userVariant.options &&
        userVariant.options.blockEngagementBanner
    ) {
        return;
    }

    return Object.assign(
        {},
        defaultParams,
        getUserVariantParams(userVariant, campaignId)
    );
};

const getVisitCount = (): number => local.get('gu.alreadyVisited') || 0;

const selectSequentiallyFrom = (array: Array<string>): string =>
    array[getVisitCount() % array.length];

const hideBanner = (banner: Message) => {
    banner.hide();

    // Store timestamp in localStorage
    userPrefs.set('engagementBannerLastClosedAt', new Date().toISOString());
};

const showBanner = (params: EngagementBannerParams): void => {
    const test = getUserTest();
    const variant = getUserVariant(test);
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

        mediator.emit('membership-message:display');
    }
};

let bannerParams;

const show = (): void => {
    if (bannerParams) {
        showBanner(bannerParams);
    }
};

const canShow = (): Promise<boolean> => {
    if (!config.get('switches.membershipEngagementBanner') || isBlocked()) {
        return Promise.resolve(false);
    }

    bannerParams = deriveBannerParams(getGeoLocation());
    const hasSeenEnoughArticles =
        bannerParams && getVisitCount() >= bannerParams.minArticles;

    if (hasSeenEnoughArticles && shouldShowReaderRevenue()) {
        return hasBannerBeenRedeployedSinceClosed();
    }

    return Promise.resolve(false);
};

const membershipEngagementBanner: Banner = {
    id: messageCode,
    show,
    canShow,
};

export { membershipEngagementBanner, canShow, messageCode };
