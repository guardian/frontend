// @flow
import config from 'lib/config';
import { local } from 'lib/storage';
import { adblockInUse } from 'lib/detect';
import { Message } from 'common/modules/ui/message';
import mediator from 'lib/mediator';
import { membershipEngagementBannerTests } from 'common/modules/experiments/tests/membership-engagement-banner-tests';
import { inlineSvg } from 'common/views/svgs';
import { testCanBeRun } from 'common/modules/experiments/test-can-run-checks';
import { isInTest, variantFor } from 'common/modules/experiments/segment-util';
import { engagementBannerParams } from 'common/modules/commercial/membership-engagement-banner-parameters';
import { isBlocked } from 'common/modules/commercial/membership-engagement-banner-block';
import { getSync as getGeoLocation } from 'lib/geolocation';
import { shouldShowReaderRevenue } from 'common/modules/commercial/contributions-utilities';

import {
    submitComponentEvent,
    addTrackingCodesToUrl,
} from 'common/modules/commercial/acquisitions-ophan';
import { acquisitionsBannerControlTemplate } from 'common/modules/commercial/templates/acquisitions-banner-control';

// change messageCode to force redisplay of the message to users who already closed it.
const messageCode = 'engagement-banner-2018-01-16';

const canDisplayMembershipEngagementBanner = (): Promise<boolean> =>
    adblockInUse.then(adblockUsed => !adblockUsed && shouldShowReaderRevenue());

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
 *    colourStrategy: // a function to determine what css class to use for the banner's colour
 *    buttonCaption: "Become a Supporter"
 *  }
 *
 */
const deriveBannerParams = (location: string): ?EngagementBannerParams => {
    const defaultParams = engagementBannerParams(location);
    const userTest = getUserTest();
    const campaignId = userTest ? userTest.campaignId : undefined;
    const userVariant = getUserVariant(userTest);

    if (userVariant && userVariant.blockEngagementBanner) {
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

const messageModifierClass = (
    colourClass: string,
    modifierClass: ?string
): string => {
    if (modifierClass) {
        return `${colourClass} ${modifierClass}`;
    }

    return colourClass;
};

const showBanner = (params: EngagementBannerParams): void => {
    if (isBlocked()) {
        return;
    }

    const test = getUserTest();
    const variant = getUserVariant(test);
    const paypalAndCreditCardImage =
        config.get('images.acquisitions.paypal-and-credit-card') || '';
    const colourClass = params.colourStrategy();
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
    const buttonSvg = inlineSvg('arrowWhiteRight');
    const templateParams = {
        messageText,
        ctaText,
        paypalAndCreditCardImage,
        colourClass,
        linkUrl,
        buttonCaption,
        buttonSvg,
    };

    const renderedBanner: string = params.template
        ? params.template(templateParams)
        : acquisitionsBannerControlTemplate(templateParams);
    const messageShown = new Message(messageCode, {
        pinOnHide: false,
        siteMessageLinkName: 'membership message',
        siteMessageCloseBtn: 'hide',
        siteMessageComponentName: params.campaignCode,
        trackDisplay: true,
        cssModifierClass: messageModifierClass(
            colourClass,
            params.bannerModifierClass
        ),
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

const membershipEngagementBannerInit = (): Promise<void> => {
    const bannerParams = deriveBannerParams(getGeoLocation());
    if (bannerParams && getVisitCount() >= bannerParams.minArticles) {
        return canDisplayMembershipEngagementBanner().then(canShow => {
            if (canShow) {
                mediator.on(
                    'modules:onwards:breaking-news:ready',
                    breakingShown => {
                        if (!breakingShown) {
                            showBanner(bannerParams);
                        }
                    }
                );
            }
        });
    }
    return Promise.resolve(undefined);
};

export { membershipEngagementBannerInit };
