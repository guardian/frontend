// @flow
import { Message } from 'common/modules/ui/message';
import type { Banner } from 'common/modules/ui/bannerPicker';
import { acquisitionsBannerFivTemplate } from 'common/modules/commercial/templates/acquisitions-banner-fiv';
import {
    messageCode as fivMessageCode,
    canShow as canShowFivBanner,
    defaultEngagementBannerParams,
    getBannerHtml as getFivBannerHtml,
} from 'common/modules/commercial/fiv-banner';
import {
    track as trackFirstPvConsent,
    bindClickHandlers as bindFirstPvConsentClickHandlers,
    canShow as canShowFirstPvConsent,
    messageCode as firstPvConsentMessageCode,
    makeHtml as makeFirstPvConsentHtml,
} from 'common/modules/ui/first-pv-consent-banner';
import marque36icon from 'svgs/icon/marque-36.svg';

const messageCode: string = 'first-pv-consent-plus-fiv-banner';

const bannerParams: EngagementBannerParams = defaultEngagementBannerParams();

const getBannerHtml = (params: EngagementBannerParams) => {
    return `<div class="site-message js-site-message js-double-site-message site-message--banner site-message--double-banner" tabindex="-1" role="dialog" aria-label="welcome" aria-describedby="site-message__message" data-component="AcquisitionsEngagementBannerStylingTweaks_control">
        <div class="js-fiv-banner-site-message site-message--engagement-banner site-message--fiv-banner">
            <div class="gs-container">
                <div class="site-message__inner js-site-message-inner">
                    <div class="site-message__roundel">
                        ${marque36icon.markup}
                    </div>
                    <div class="site-message__copy js-site-message-copy u-cf">
                        ${acquisitionsBannerFivTemplate(params)}
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
    </div>`
}

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

const firstPvFivPlusfivMessage = new Message(messageCode);

const firstPvConsentMessage = new SubMessage(
    firstPvConsentMessageCode,
    '.js-first-pv-consent-site-message',
    firstPvFivPlusfivMessage
);
const fivMessage = new SubMessage(
    fivMessageCode,
    '.js-fiv-banner-site-message',
    firstPvFivPlusfivMessage,
);

const show = (): Promise<boolean> => {
    const fivBannerHtml = getFivBannerHtml(bannerParams);
    const bannerHtml = getBannerHtml(fivBannerHtml);

    trackFirstPvConsent();
    if (document.body) {
        document.body.insertAdjacentHTML('beforeend', bannerHtml);
    }
    bindFirstPvConsentClickHandlers(firstPvConsentMessage);
    fivMessage.bindCloseHandler();

    return Promise.resolve(true);
};

const firstPvConsentPlusFivBanner: Banner = {
    id: messageCode,
    canShow: (): Promise<boolean> =>
        Promise.all([canShowFirstPvConsent(), canShowFivBanner()]).then(
            (canShowBanners: Array<boolean>) =>
                canShowBanners.every(canShowBanner => canShowBanner === true) &&
                !(
                    firstPvConsentMessage.isRemembered() ||
                    fivMessage.isRemembered()
                )
        ),
    show,
};

export { firstPvConsentPlusFivBanner };
