// @flow
import config from 'lib/config';
import { local } from 'lib/storage';
import template from 'lodash/utilities/template';
import Message from 'common/modules/ui/message';
import messageTemplate from 'raw-loader!common/views/membership-message.html';
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
import { get } from 'lib/geolocation';
import { constructQuery } from 'lib/url';

// change messageCode to force redisplay of the message to users who already closed it.
// messageCode is also consumed by .../test/javascripts/spec/common/commercial/membership-engagement-banner.spec.js
const messageCode = 'engagement-banner-2017-07-05';

const DO_NOT_RENDER_ENGAGEMENT_BANNER = 'do no render engagement banner';

const getUserTest = () => {
    const engagementBannerTests = MembershipEngagementBannerTests.concat(
        epicEngagementBannerTests
    );

    return engagementBannerTests.find(
        test => testCanBeRun(test) && isInTest(test)
    );
};

const getUserVariant = test => (test ? variantFor(test) : undefined);

const buildCampaignCode = (offering, campaignId, variantId) => {
    let prefix = '';
    const offerings = membershipEngagementBannerUtils.offerings;

    // mem and cont chosen to be consistent with default campaign code prefixes.
    if (offering === offerings.membership) {
        prefix = 'mem_';
    } else if (offering === offerings.contributions) {
        prefix = 'cont_';
    }

    return `${prefix + campaignId}_${variantId}`;
};

const getUserVariantParams = (userVariant, campaignId, defaultOffering) => {
    if (userVariant && userVariant.engagementBannerParams) {
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
const deriveBannerParams = location => {
    const defaultParams = membershipEngagementBannerUtils.defaultParams(
        location
    );
    const userTest = getUserTest();
    const campaignId = userTest ? userTest.campaignId : undefined;
    const userVariant = getUserVariant(userTest);

    if (userVariant && userVariant.blockEngagementBanner) {
        return DO_NOT_RENDER_ENGAGEMENT_BANNER;
    }

    return Object.assign(
        {},
        defaultParams,
        getUserVariantParams(userVariant, campaignId, defaultParams.offering)
    );
};

// Used to send an interaction if the engagement banner is shown.
const recordInteraction = interaction => {
    if (interaction) {
        const component = interaction.component;
        const value = interaction.value;

        if (component && value) {
            ophan.record({
                component,
                value,
            });
        }
    }
};

const paypalAndCreditCardImage =
    (config.images &&
        config.images.acquisitions &&
        config.images.acquisitions['paypal-and-credit-card']) ||
    '';

const selectSequentiallyFrom = array =>
    array[local.get('gu.alreadyVisited') % array.length];

const showBanner = params => {
    if (params === DO_NOT_RENDER_ENGAGEMENT_BANNER || isBlocked()) {
        return;
    }

    const colourClass = params.colourStrategy();

    const messageText = Array.isArray(params.messageText)
        ? selectSequentiallyFrom(params.messageText)
        : params.messageText;

    const urlParameters = {
        REFPVID: params.pageviewId,
        INTCMP: params.campaignCode,
    };

    const linkUrl = `${params.linkUrl}?${constructQuery(urlParameters)}`;

    const renderedBanner = template(messageTemplate, {
        linkHref: linkUrl,
        messageText,
        buttonCaption: params.buttonCaption,
        colourClass,
        arrowWhiteRight: inlineSvg('arrowWhiteRight'),
        paypalLogoSrc: paypalAndCreditCardImage,
    });

    const messageShown = new Message(messageCode, {
        pinOnHide: false,
        siteMessageLinkName: 'membership message',
        siteMessageCloseBtn: 'hide',
        siteMessageComponentName: params.campaignCode,
        trackDisplay: true,
        cssModifierClass: colourClass,
    }).show(renderedBanner);

    if (messageShown) {
        recordInteraction(params.interactionOnMessageShown);

        mediator.emit('membership-message:display');
    }

    mediator.emit('banner-message:complete');
};

const membershipEngagementBannerInit = () =>
    get().then(location => {
        const bannerParams = deriveBannerParams(location);

        if (
            bannerParams &&
            (local.get('gu.alreadyVisited') || 0) >= bannerParams.minArticles
        ) {
            return commercialFeatures.asynchronous.canDisplayMembershipEngagementBanner.then(
                canShow => {
                    if (canShow) {
                        mediator.on(
                            'modules:onwards:breaking-news:ready',
                            breakingShown => {
                                if (!breakingShown) {
                                    showBanner(bannerParams);
                                } else {
                                    mediator.emit('banner-message:complete');
                                }
                            }
                        );
                    } else {
                        mediator.emit('banner-message:complete');
                    }
                }
            );
        }
    });

export { membershipEngagementBannerInit, messageCode };
