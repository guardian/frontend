// @flow
import config from 'lib/config';
import { local } from 'lib/storage';
import { Message } from 'common/modules/ui/message';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import mediator from 'lib/mediator';
import { testCanBeRun } from 'common/modules/experiments/test-can-run-checks';
import MembershipEngagementBannerTests from 'common/modules/experiments/tests/membership-engagement-banner-tests';
import { inlineSvg } from 'common/views/svgs';
import { isInTest, variantFor } from 'common/modules/experiments/segment-util';
import { epicEngagementBannerTests } from 'common/modules/experiments/acquisition-test-selector';
import membershipEngagementBannerUtils from 'common/modules/commercial/membership-engagement-banner-parameters';
import { isBlocked } from 'common/modules/commercial/membership-engagement-banner-block';
import ophan from 'ophan/ng';
import { get as getGeoLocation } from 'lib/geolocation';
import { constructQuery } from 'lib/url';

// change messageCode to force redisplay of the message to users who already closed it.
const messageCode = 'engagement-banner-2017-07-05';

const getUserTest = (): ?ContributionsABTest => {
    const engagementBannerTests = MembershipEngagementBannerTests.concat(
        epicEngagementBannerTests
    );

    return engagementBannerTests.find(
        test => testCanBeRun(test) && isInTest(test)
    );
};

const getUserVariant = (test: ?ABTest): ?Variant =>
    test ? variantFor(test) : undefined;

const buildCampaignCode = (
    offering: string,
    campaignId: string,
    variantId: string
): string => {
    let prefix = '';
    const offerings = membershipEngagementBannerUtils.offerings;

    // mem and cont chosen to be consistent with default campaign code prefixes.
    if (offering === offerings.membership) {
        prefix = 'mem';
    } else if (offering === offerings.contributions) {
        prefix = 'cont';
    }

    return `${prefix}_${campaignId}_${variantId}`;
};

const getUserVariantParams = (
    userVariant: ?Variant,
    campaignId: ?string,
    defaultOffering: string
): EngagementBannerParams | {} => {
    if (campaignId && userVariant && userVariant.engagementBannerParams) {
        const userVariantParams = userVariant.engagementBannerParams;

        if (!userVariantParams.campaignCode) {
            const offering = userVariantParams.offering || defaultOffering;

            userVariantParams.campaignCode = buildCampaignCode(
                offering,
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
    const defaultParams = membershipEngagementBannerUtils.defaultParams(
        location
    );
    const userTest = getUserTest();
    const campaignId = userTest ? userTest.campaignId : undefined;
    const userVariant = getUserVariant(userTest);

    if (userVariant && userVariant.blockEngagementBanner) {
        return;
    }

    return Object.assign(
        {},
        defaultParams,
        getUserVariantParams(userVariant, campaignId, defaultParams.offering)
    );
};

// Used to send an interaction if the engagement banner is shown.
const recordInteraction = (interaction: Interaction): void => {
    const { component, value } = interaction;

    ophan.record({
        component,
        value,
    });
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
    const linkUrl = `${params.linkUrl}?${constructQuery(urlParameters)}`;
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
        recordInteraction(params.interactionOnMessageShow);

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
