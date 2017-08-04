// @flow
import config from 'lib/config';
import { local } from 'lib/storage';
import { Message } from 'common/modules/ui/message';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import mediator from 'lib/mediator';
import { inlineSvg } from 'common/views/svgs';
import membershipEngagementBannerUtils from 'common/modules/commercial/membership-engagement-banner-parameters';
import { isBlocked } from 'common/modules/commercial/membership-engagement-banner-block';
import ophan from 'ophan/ng';
import { get as getGeoLocation } from 'lib/geolocation';
import { constructQuery } from 'lib/url';

// change messageCode to force redisplay of the message to users who already closed it.
const messageCode = 'engagement-banner-2017-07-05';

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
        const bannerParams = membershipEngagementBannerUtils.defaultParams(
            location
        );

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
