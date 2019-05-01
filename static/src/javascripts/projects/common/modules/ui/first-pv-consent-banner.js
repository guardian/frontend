// @flow
import config from 'lib/config';
import { getCookie } from 'lib/cookies';
import { Message, hasUserAcknowledgedBanner } from 'common/modules/ui/message';
import checkIcon from 'svgs/icon/tick.svg';
import {
    getAdConsentState,
    setAdConsentState,
    allAdConsents,
} from 'common/modules/commercial/ad-prefs.lib';
import { trackNonClickInteraction } from 'common/modules/analytics/google';
import ophan from 'ophan/ng';
import { upAlertViewCount } from 'common/modules/analytics/send-privacy-prefs';
import type { AdConsent } from 'common/modules/commercial/ad-prefs.lib';
import type { Banner } from 'common/modules/ui/bannerPicker';
import { commercialConsentGlobalBanner } from 'common/modules/experiments/tests/commercial-consent-global-banner';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';

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

const displayEventKey: string = 'first-pv-consent : display';
const messageCode: string = 'first-pv-consent';

const links: Links = {
    privacy: 'https://www.theguardian.com/help/privacy-policy',
    cookies: 'https://www.theguardian.com/info/cookies',
};

const template: Template = {
    heading: `Your privacy`,
    consentText: [
        `We use cookies to improve your experience on our site and to show you personalised advertising.`,
        `To find out more, read our <a class="u-underline" data-link-name="first-pv-consent : to-privacy" href="${
            links.privacy
        }">privacy policy</a> and <a class="u-underline" data-link-name="first-pv-consent : to-cookies" href="${
            links.cookies
        }">cookie policy</a>.`,
    ],
    agreeButton: "I'm OK with that",
    choicesButton: 'My options',
    linkToPreferences: `${config.get('page.idUrl')}/privacy-settings`,
};

const bindableClassNames: BindableClassNames = {
    agree: 'js-first-pv-consent-agree',
};

const makeHtml = (): string => `
    <div class="site-message--first-pv-consent__block site-message--first-pv-consent__block--head">${
        template.heading
    }</div>
    <div class="site-message--first-pv-consent__block site-message--first-pv-consent__block--intro">${template.consentText
        .map(_ => `<p>${_}</p>`)
        .join('')}
    </div>
    <div class="site-message--first-pv-consent__actions">
        <button
            data-link-name="first-pv-consent : agree"
            class="site-message--first-pv-consent__button site-message--first-pv-consent__button--main ${
                bindableClassNames.agree
            }"
        >${checkIcon.markup}<span>${template.agreeButton}</span></button>
        <a
            href="${template.linkToPreferences}"
            data-link-name="first-pv-consent : to-prefs"
            class="site-message--first-pv-consent__link u-underline"
        >${template.choicesButton}</a>
    </div>
`;

const isInEU = (): boolean =>
    (getCookie('GU_geo_continent') || 'OTHER').toUpperCase() === 'EU';

const hasUnsetAdChoices = (): boolean =>
    allAdConsents.some((_: AdConsent) => getAdConsentState(_) === null);

const onAgree = (msg: Message): void => {
    allAdConsents.forEach(_ => {
        setAdConsentState(_, true);
    });
    msg.hide();
};

const trackInteraction = (interaction: string): void => {
    ophan.record({
        component: 'first-pv-consent',
        action: interaction,
        value: interaction,
    });
    trackNonClickInteraction(interaction);
};

const isInCommercialConsentGlobalBannerTest = (): boolean =>
    isInVariantSynchronous(commercialConsentGlobalBanner, 'regularVariant') ||
    isInVariantSynchronous(commercialConsentGlobalBanner, 'noScrollVariant') ||
    isInVariantSynchronous(commercialConsentGlobalBanner, 'tallVariant') ||
    isInVariantSynchronous(commercialConsentGlobalBanner, 'animatedVariant') ||
    isInVariantSynchronous(commercialConsentGlobalBanner, 'floatingVariant');

const canShow = (): Promise<boolean> =>
    Promise.resolve(
        hasUnsetAdChoices() &&
            (isInEU() || isInCommercialConsentGlobalBannerTest()) &&
            !hasUserAcknowledgedBanner(messageCode)
    );

const track = (): void => {
    upAlertViewCount();
    trackInteraction(displayEventKey);
};

const bindClickHandlers = (msg: Message): void => {
    Array.from(
        document.querySelectorAll(`.${bindableClassNames.agree}`)
    ).forEach(agreeButtonEl => {
        agreeButtonEl.addEventListener('click', () => onAgree(msg));
    });
};

const preventScroll = (msg: Message): void => {
    msg.$siteMessageContainer[0].addEventListener('touchmove', e => {
        e.preventDefault();
    });
};

const increaseBannerHeight = (msg: Message): void => {
    msg.$siteMessageContainer[0].classList.add(
        'site-message--first-pv-consent--tall-banner'
    );
};

const animateBanner = (msg: Message): void => {
    const banner = msg.$siteMessageContainer[0];

    banner.classList.add(
        'site-message--first-pv-consent--animation-banner'
    );

    setTimeout(() => {
        banner.classList.add(
            'site-message--first-pv-consent--animation-banner--animate'
        );
    }, 750);
};

const createFloatingBanner = (msg: Message): void => {
    msg.$siteMessageContainer[0].classList.add(
        'site-message--first-pv-consent--floating-banner'
    );
};

const show = (): Promise<boolean> => {
    track();

    const msg = new Message(messageCode, {
        important: true,
        permanent: true,
        customJs: () => {
            bindClickHandlers(msg);
            if (
                isInVariantSynchronous(
                    commercialConsentGlobalBanner,
                    'noScrollVariant'
                )
            ) {
                preventScroll(msg);
            } else if (
                isInVariantSynchronous(
                    commercialConsentGlobalBanner,
                    'tallVariant'
                )
            ) {
                increaseBannerHeight(msg);
            } else if (
                isInVariantSynchronous(
                    commercialConsentGlobalBanner,
                    'animatedVariant'
                )
            ) {
                animateBanner(msg);
            } else if (
                isInVariantSynchronous(
                    commercialConsentGlobalBanner,
                    'floatingVariant'
                )
            ) {
                createFloatingBanner(msg);
            }
        },
    });

    return Promise.resolve(msg.show(makeHtml()));
};

const firstPvConsentBanner: Banner = {
    id: messageCode,
    canShow,
    show,
};

export const _ = {
    onAgree,
    bindableClassNames,
};

export {
    firstPvConsentBanner,
    canShow,
    track,
    bindClickHandlers,
    messageCode,
    makeHtml,
};
