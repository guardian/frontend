// @flow
import { Message } from 'common/modules/ui/message';
import type { Banner } from 'common/modules/ui/bannerPicker';
import { acquisitionsBannerControlTemplate } from 'common/modules/commercial/templates/acquisitions-banner-control';
import { defaultEngagementBannerParams } from 'common/modules/commercial/membership-engagement-banner-parameters';
import { addTrackingCodesToUrl } from 'common/modules/commercial/acquisitions-ophan';
import {
    messageCode as engagementMessageCode,
    canShow as canShowEngagementBanner,
} from 'common/modules/commercial/membership-engagement-banner';
import {
    track as trackFirstPvConsent,
    bindClickHandlers as bindFirstPvConsentClickHandlers,
    canShow as canShowFirstPvConsent,
    messageCode as firstPvConsentMessageCode,
    makeHtml as makeFirstPvConsentHtml,
} from 'common/modules/ui/first-pv-consent-banner';
import marque36icon from 'svgs/icon/marque-36.svg';

const messageCode: string = 'first-pv-consent-plus-engagement-banner';

const bannerParams: EngagementBannerParams = defaultEngagementBannerParams();

const bannerTemplateParams: EngagementBannerTemplateParams = {
    messageText: bannerParams.messageText,
    ctaText: bannerParams.ctaText,
    buttonCaption: bannerParams.buttonCaption,
    linkUrl: addTrackingCodesToUrl({
        base: bannerParams.linkUrl,
        componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
        componentId: 'first_pv_consent_plus_support_the_guardian_banner',
    }),
};

const bannerHtml = `
    <div class="site-message js-site-message js-double-site-message site-message--banner site-message--double-banner" tabindex="-1" role="dialog" aria-label="welcome" aria-describedby="site-message__message" data-component="AcquisitionsEngagementBannerStylingTweaks_control">
        <div class="js-engagement-banner-site-message site-message--engagement-banner">
            <div class="gs-container">
                <div class="site-message__inner js-site-message-inner">
                    <div class="site-message__roundel">
                        ${marque36icon.markup}
                    </div>
                    <div class="site-message__copy js-site-message-copy u-cf">
                        ${acquisitionsBannerControlTemplate(
                            bannerTemplateParams
                        )}
                    </div>
                </div>
            </div>
        </div>
    
        <div class="js-first-pv-consent-site-message site-message--first-pv-consent" tabindex="-1" data-link-name="release message" role="dialog" aria-label="welcome" aria-describedby="site-message__message">
            <div class="gs-container">
                <div class="site-message__inner js-site-message-inner">
                    <div class="site-message__roundel">
                        ${marque36icon.markup}
                    </div>
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

    bindCloseHandler(): void {
        const element = document.querySelector(this.elementSelector);
        if (element) {
            const closeButton = element.querySelector('.js-site-message-close');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    this.acknowledge();
                });
            }
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
    if (document.body) {
        document.body.insertAdjacentHTML('beforeend', bannerHtml);
    }
    bindFirstPvConsentClickHandlers(firstPvConsentMessage);
    engagementMessage.bindCloseHandler();

    return Promise.resolve(true);
};

const firstPvConsentPlusEngagementBanner: Banner = {
    id: messageCode,
    canShow: (): Promise<boolean> =>
        Promise.all([canShowFirstPvConsent(), canShowEngagementBanner()]).then(
            (canShowBanners: Array<boolean>) =>
                canShowBanners.every(canShowBanner => canShowBanner === true) &&
                !(
                    firstPvConsentMessage.isRemembered() ||
                    engagementMessage.isRemembered()
                )
        ),
    show,
};

export { firstPvConsentPlusEngagementBanner };
