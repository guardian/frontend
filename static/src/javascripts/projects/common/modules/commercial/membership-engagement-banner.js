// @flow
import config from 'lib/config';
import { local } from 'lib/storage';
import { Message } from 'common/modules/ui/message';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import mediator from 'lib/mediator';
import { membershipEngagementBannerTests } from 'common/modules/experiments/tests/membership-engagement-banner-tests';
import { inlineSvg } from 'common/views/svgs';
import { variantFor } from 'common/modules/experiments/segment-util';
import { engagementBannerParams } from 'common/modules/commercial/membership-engagement-banner-parameters';
import { isBlocked } from 'common/modules/commercial/membership-engagement-banner-block';
import { get as getGeoLocation } from 'lib/geolocation';
import { constructQuery } from 'lib/url';
import { getTest as getAcquisitionTest } from 'common/modules/experiments/acquisition-test-selector';
import {
    submitInsertEvent,
    submitViewEvent,
} from 'common/modules/commercial/acquisitions-ophan';

// change messageCode to force redisplay of the message to users who already closed it.
const messageCode = 'engagement-banner-2017-09-07';

// This piece of code should be reverted when we remove this test.
const getUserTest = (): ?AcquisitionsABTest =>
    membershipEngagementBannerTests.find(test => {
        const acquisitionTest = getAcquisitionTest();
        let response = false;
        if (acquisitionTest) {
            response = acquisitionTest.id === test.id;
        }

        return response;
    });

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

const showBanner = (params: EngagementBannerParams): void => {
    if (isBlocked()) {
        return;
    }

    const paypalAndCreditCardImage =
        config.get('images.acquisitions.paypal-and-credit-card') || '';
    const colourClass = params.colourStrategy();
    const messageText = Array.isArray(params.messageText)
        ? selectSequentiallyFrom(params.messageText)
        : params.messageText;
    const urlParameters = {
        REFPVID: params.pageviewId,
        INTCMP: params.campaignCode,
    };
    const linkUrl = `${params.linkUrl}${params.linkUrl &&
    params.linkUrl.indexOf('?') > 0
        ? '&'
        : '?'}${constructQuery(urlParameters)}`;
    const buttonCaption = params.buttonCaption;
    const buttonSvg = inlineSvg('arrowWhiteRight');
    const renderedBanner = `
    <div id="site-message__message">
        <div class="site-message__message site-message__message--membership">
            <span class = "membership__message-text">${messageText}</span>
            <span class="membership__paypal-container">
                <img class="membership__paypal-logo" src="${paypalAndCreditCardImage}" alt="Paypal and credit card">
                <span class="membership__support-button"><a class="message-button-rounded__cta ${colourClass}" href="${linkUrl}">${buttonCaption}${buttonSvg}</a></span>
            </span>
        </div>
        <a class="u-faux-block-link__overlay js-engagement-message-link" target="_blank" href="${linkUrl}" data-link-name="Read more link"></a>
    </div>`;

    const messageShown = new Message(messageCode, {
        pinOnHide: false,
        siteMessageLinkName: 'membership message',
        siteMessageCloseBtn: 'hide',
        siteMessageComponentName: params.campaignCode,
        trackDisplay: true,
        cssModifierClass: colourClass,
    }).show(renderedBanner);

    if (messageShown) {
        submitInsertEvent(
            'ACQUISITIONS_ENGAGEMENT_BANNER',
            params.products,
            params.campaignCode
        );

        submitViewEvent(
            'ACQUISITIONS_ENGAGEMENT_BANNER',
            params.products,
            params.campaignCode
        );

        mediator.emit('membership-message:display');
    }
};

const membershipEngagementBannerInit = (): Promise<void> =>
    getGeoLocation().then(location => {
        const bannerParams = deriveBannerParams(location);

        if (bannerParams && getVisitCount() >= bannerParams.minArticles) {
            return commercialFeatures.asynchronous.canDisplayMembershipEngagementBanner.then(
                canShow => {
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
                }
            );
        }
    });

export { membershipEngagementBannerInit };
