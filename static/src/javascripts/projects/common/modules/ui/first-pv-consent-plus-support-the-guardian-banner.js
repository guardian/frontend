// @flow
import config from 'lib/config';
import { Message } from 'common/modules/ui/message';
import checkIcon from 'svgs/icon/tick.svg';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import type { Banner } from 'common/modules/ui/bannerPicker';
import { acquisitionsBannerControlTemplate } from 'common/modules/commercial/templates/acquisitions-banner-control';
import { engagementBannerParams } from 'common/modules/commercial/membership-engagement-banner-parameters';
import {addTrackingCodesToUrl} from "common/modules/commercial/acquisitions-ophan";
import {
    track as trackFirstPvConsent,
    bindClickHandlers as bindFirstPvConsentClickHandlers,
    canShow as canShowFirstPvConsent
} from 'common/modules/ui/first-pv-consent-banner';
import {
    canShow as canShowSupportTheGuardianBanner
} from 'common/modules/commercial/membership-engagement-banner';

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

const messageCode: string = 'first-pv-consent';

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
    ${acquisitionsBannerControlTemplate(bannerTemplateParams)}
    ${firstPvConsentHtml(template, bindableClassNames)}
`;


const show = (): void => {
    trackFirstPvConsent();

    const msg = new Message(messageCode, {
        important: true,
        permanent: true,
        customJs: () => {
            bindFirstPvConsentClickHandlers(msg);
        },
    });
    msg.show(bannerHtml);
};

const firstPvConsentPlusSupportTheGuardianBanner: Banner = {
    id: messageCode,
    canShow: () => canShowFirstPvConsent() && canShowSupportTheGuardianBanner(),
    show,
};

// export const _ = {
//     onAgree,
//     bindableClassNames,
// };

export { firstPvConsentPlusSupportTheGuardianBanner };
