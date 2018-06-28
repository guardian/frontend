// @flow
import config from 'lib/config';
import { Message } from 'common/modules/ui/message';
import checkIcon from 'svgs/icon/tick.svg';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import type { Banner } from 'common/modules/ui/bannerPicker';
import { acquisitionsBannerControlTemplate } from 'common/modules/commercial/templates/acquisitions-banner-control';
import { engagementBannerParams } from 'common/modules/commercial/membership-engagement-banner-parameters';
import {
    messageCode as supportTheGuardianMessageCode
} from 'common/modules/commercial/membership-engagement-banner';
import {addTrackingCodesToUrl} from "common/modules/commercial/acquisitions-ophan";
import {
    track as trackFirstPvConsent,
    bindClickHandlers as bindFirstPvConsentClickHandlers,
    canShow as canShowFirstPvConsent,
    messageCode as firstPvConsentMessageCode,
} from 'common/modules/ui/first-pv-consent-banner';
import {
    canShow as canShowSupportTheGuardianBanner
} from 'common/modules/commercial/membership-engagement-banner';
import marque36icon from 'svgs/icon/marque-36.svg';
import userPrefs from "common/modules/user-prefs";


type Template = {
    heading: string,
    consentText: string[],
    agreeButton: string,
    choicesButton: string,
    linkToPreferences: string,
};

type BindableClassNames = {
    agree: string,
};

type Links = {
    privacy: string,
    cookies: string,
};

const messageCode: string = 'first-pv-consent-plus-support-the-guardian';

const links: Links = {
    privacy: 'https://www.theguardian.com/help/privacy-policy',
    cookies: 'https://www.theguardian.com/info/cookies',
};

const template: Template = {
    heading: `Your privacy`,
    consentText: [
        `We use cookies to improve your experience on our site and to show you relevant&nbsp;advertising.`,
        `To find out more, read our updated <a class="u-underline" data-link-name="first-pv-consent : to-privacy" href="${
            links.privacy
        }">privacy policy</a> and <a class="u-underline" data-link-name="first-pv-consent : to-cookies" href="${
            links.cookies
        }">cookie policy</a>.`,
    ],
    agreeButton: 'OK',
    choicesButton: 'More information',
    linkToPreferences: `${config.get('page.idUrl')}/privacy-settings`,
};

const bindableClassNames: BindableClassNames = {
    agree: 'js-first-pv-consent-agree',
};

const firstPvConsentHtml = (tpl: Template, classes: BindableClassNames): string => `
    <div class="site-message--first-pv-consent__block site-message--first-pv-consent__block--head">${
        tpl.heading
    }</div>
    <div class="site-message--first-pv-consent__block site-message--first-pv-consent__block--intro">${tpl.consentText
        .map(_ => `<p>${_}</p>`)
        .join('')}
        <div class="site-message--first-pv-consent__actions">
            <button 
                data-link-name="first-pv-consent : agree" 
                class="site-message--first-pv-consent__button site-message--first-pv-consent__button--main ${
                    classes.agree
                }"
            >${checkIcon.markup}<span>${tpl.agreeButton}</span></button>
            <a 
                href="${tpl.linkToPreferences}" 
                data-link-name="first-pv-consent : to-prefs" 
                class="site-message--first-pv-consent__link u-underline"
            >${tpl.choicesButton}</a>
        </div>
    </div>
`;

const bannerParams: EngagementBannerParams = engagementBannerParams(geolocationGetSync());

const bannerTemplateParams: EngagementBannerTemplateParams = {
    messageText: bannerParams.messageText,
    ctaText: bannerParams.ctaText,
    buttonCaption: bannerParams.buttonCaption,
    linkUrl: addTrackingCodesToUrl({
        base: bannerParams.linkUrl,
        componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
        componentId: 'first_pv_consent_plus_support_the_guardian_banner',
    })
};

const bannerHtml = `
    <div class="site-message js-site-message js-double-site-message site-message--banner" tabindex="-1" role="dialog" aria-label="welcome" aria-describedby="site-message__message" data-component="AcquisitionsEngagementBannerStylingTweaks_control">
        <div class="js-support-the-guardian-site-message site-message--support-the-guardian-banner">
            <div class="gs-container">
                <div class="site-message__inner js-site-message-inner">
                    <div class="site-message__roundel">
                        ${marque36icon.markup}
                    </div>
                    <div class="site-message__copy js-site-message-copy u-cf">
                        ${acquisitionsBannerControlTemplate(bannerTemplateParams)}
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
                        ${firstPvConsentHtml(template, bindableClassNames)}
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

class SubMessage extends Message {
    elementSelector: string;

    constructor(id: string, elementSelector: string, options?: Object) {
        super(id, options);
        this.elementSelector = elementSelector;
    }

    hide() {
        const element = document.querySelector(this.elementSelector);
        if (element) {
            const parent = element.parentElement;
            element.remove();
            if (parent && parent.childElementCount === 0) {
                parent.remove();
            }
        }

        // Don't display the double banner again
        // if either of the sub-banners has been hidden
        firstPvConsentPlusSupportTheGuardianMessage.remember();
    }

    bindCloseHandler() {
        const element = document.querySelector(this.elementSelector);
        if (element) {
            const closeButton = element.querySelector('.js-site-message-close');
            if (closeButton) {
                closeButton.addEventListener('click', (ev: Event) => {
                    this.acknowledge();
                })
            }
        }
    }

    isAcknowledged(): boolean {
        const messageStates = userPrefs.get(this.prefs) || [];
        return messageStates.includes(this.id);
    }
}

const firstPvConsentMessage = new SubMessage(firstPvConsentMessageCode, '.js-first-pv-consent-site-message');
const supportTheGuardianMessage = new SubMessage(supportTheGuardianMessageCode, '.js-support-the-guardian-site-message');
const firstPvConsentPlusSupportTheGuardianMessage = new Message(messageCode);

const show = (): void => {
    trackFirstPvConsent();
    if (document.body) {
        document.body.insertAdjacentHTML('beforeend', bannerHtml);
    }
    bindFirstPvConsentClickHandlers(firstPvConsentMessage);
    supportTheGuardianMessage.bindCloseHandler();
};

const firstPvConsentPlusSupportTheGuardianBanner: Banner = {
    id: messageCode,
    // TODO: WHY DOES GU_TK NOT GET SET IN DEV MODE?
    canShow: () =>
        canShowFirstPvConsent() &&
        canShowSupportTheGuardianBanner() &&
        Promise.resolve(!(firstPvConsentMessage.isAcknowledged() || supportTheGuardianMessage.isAcknowledged())),
    show,
};

export { firstPvConsentPlusSupportTheGuardianBanner };
