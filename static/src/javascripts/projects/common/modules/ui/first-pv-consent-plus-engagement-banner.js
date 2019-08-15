// @flow
import { Message } from 'common/modules/ui/message';
import type { Banner } from 'common/modules/ui/bannerPicker';
import {
    messageCode as engagementMessageCode,
    canShow as canShowEngagementBanner,
    hideBanner as hideEngagementBanner,
    deriveBannerParams as deriveEngagementBannerParams,
    bannerParamsToHtml as engagementBannerParamsToHtml,
    trackBanner,
} from 'common/modules/commercial/membership-engagement-banner';
import {
    track as trackFirstPvConsent,
    bindClickHandlers as bindFirstPvConsentClickHandlers,
    canShow as canShowFirstPvConsent,
    messageCode as firstPvConsentMessageCode,
    makeHtml as makeFirstPvConsentHtml,
} from 'common/modules/ui/first-pv-consent-banner';
import marque36icon from 'svgs/icon/marque-36.svg';
import { getEngagementBannerTestToRun } from 'common/modules/experiments/ab';
import fastdom from 'lib/fastdom-promise';
import reportError from 'lib/report-error';

const messageCode: string = 'first-pv-consent-plus-engagement-banner';

const doubleBannerHtml = (
    engagementBannerHtml: string,
    customClass: string
): string => `
    <div class="site-message js-site-message js-double-site-message site-message--banner site-message--double-banner" tabindex="-1" role="dialog" aria-label="welcome" aria-describedby="site-message__message" data-component="AcquisitionsEngagementBannerStylingTweaks_control" aria-live="polite">
        <div class="js-engagement-banner-site-message ${customClass} site-message--engagement-banner">
            <div class="gs-container">
                <div class="site-message__inner js-site-message-inner">
                    <div class="site-message__roundel">
                        ${marque36icon.markup}
                    </div>
                    <div class="site-message__copy js-site-message-copy u-cf">
                        ${engagementBannerHtml}
                    </div>
                </div>
            </div>
        </div>

        <div class="js-first-pv-consent-site-message site-message--first-pv-consent" tabindex="-1" data-link-name="release message" role="dialog" aria-label="welcome" aria-describedby="site-message__message">
            <div class="gs-container">
                <div class="site-message__inner js-site-message-inner">
                    <div class="site-message__copy js-site-message-copy u-cf">
                        ${makeFirstPvConsentHtml()}
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

class SubMessage extends Message {
    elementSelector: string;
    parent: Message;

    constructor(
        id: string,
        elementSelector: string,
        parent: Message,
        options?: Object
    ) {
        super(id, options);
        this.elementSelector = elementSelector;
        this.parent = parent;
    }

    hide(): void {
        const element = document.querySelector(this.elementSelector);
        if (element) {
            const parentElement = element.parentElement;
            element.remove();
            if (parentElement && parentElement.childElementCount === 0) {
                parentElement.remove();
            }
        }

        // Don't display parent again if any sub-message has been hidden
        this.parent.remember();
    }

    bindCloseHandler(close: (banner: Message) => void): void {
        const element = document.querySelector(this.elementSelector);
        if (element) {
            const closeButtons = element.querySelectorAll(
                '.js-site-message-close'
            );

            // https://developer.mozilla.org/en-US/docs/Web/API/NodeList#Example
            Array.prototype.forEach.call(closeButtons, button => {
                button.addEventListener('click', () => {
                    close(this);
                });
            });
        }
    }
}

const firstPvConsentPlusEngagementMessage = new Message(messageCode);

const firstPvConsentMessage = new SubMessage(
    firstPvConsentMessageCode,
    '.js-first-pv-consent-site-message',
    firstPvConsentPlusEngagementMessage
);
const engagementMessage = new SubMessage(
    engagementMessageCode,
    '.js-engagement-banner-site-message',
    firstPvConsentPlusEngagementMessage
);

const show = (): Promise<boolean> => {
    trackFirstPvConsent();
    return getEngagementBannerTestToRun()
        .then(deriveEngagementBannerParams)
        .then(params => {
            // A/B test information is still preserved in the dedicated abTest field
            // But we can identify the double banner via campaignCode/componentId
            const paramsWithCustomCampaignCode = {
                ...params,
                campaignCode: 'double_banner',
            };
            return {
                params: paramsWithCustomCampaignCode,
                html: engagementBannerParamsToHtml(
                    paramsWithCustomCampaignCode
                ),
            };
        })
        .then(paramsAndEngagementBannerHtml =>
            fastdom.write(() => {
                const modifierClass = paramsAndEngagementBannerHtml.params
                    .bannerModifierClass
                    ? `site-message--${
                          paramsAndEngagementBannerHtml.params
                              .bannerModifierClass
                      }`
                    : '';
                const html = doubleBannerHtml(
                    paramsAndEngagementBannerHtml.html,
                    modifierClass
                );
                if (document.body) {
                    document.body.insertAdjacentHTML('beforeend', html);
                }
                bindFirstPvConsentClickHandlers(firstPvConsentMessage);
                engagementMessage.bindCloseHandler(hideEngagementBanner);

                trackBanner(paramsAndEngagementBannerHtml.params);

                if (paramsAndEngagementBannerHtml.params.bannerShownCallback) {
                    paramsAndEngagementBannerHtml.params.bannerShownCallback();
                }

                return true;
            })
        )
        .catch(err => {
            reportError(
                new Error(
                    `Could not show banner within double banner. ${
                        err.message
                    }. Stack: ${err.stack}`
                ),
                { feature: 'engagement-banner' },
                false
            );
            return false;
        });
};

const firstPvConsentPlusEngagementBanner: Banner = {
    id: messageCode,
    canShow: (): Promise<boolean> =>
        Promise.all([canShowFirstPvConsent(), canShowEngagementBanner()]).then(
            (canShowBanners: Array<boolean>) =>
                canShowBanners.every(canShowBanner => canShowBanner === true)
        ),
    show,
};

export { firstPvConsentPlusEngagementBanner };
