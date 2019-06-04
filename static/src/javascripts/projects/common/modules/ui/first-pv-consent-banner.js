// @flow
import config from 'lib/config';
import { getCookie } from 'lib/cookies';
import { Message, hasUserAcknowledgedBanner } from 'common/modules/ui/message';
import checkIcon from 'svgs/icon/tick.svg';
import closeCentralIcon from 'svgs/icon/close-central.svg';
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
import { commercialConsentModalBanner } from 'common/modules/experiments/tests/commercial-consent-modal-banner';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import fastdom from 'lib/fastdom-promise';

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

let inModalTestRegularVariant;
const isInModalTestRegularVariant = (): boolean => {
    if (inModalTestRegularVariant === undefined) {
        inModalTestRegularVariant = isInVariantSynchronous(
            commercialConsentModalBanner,
            'regularVariant'
        );
    }

    return inModalTestRegularVariant;
};

let inModalTestDismissableVariant;
const isInModalTestDismissableVariant = (): boolean => {
    if (inModalTestDismissableVariant === undefined) {
        inModalTestDismissableVariant = isInVariantSynchronous(
            commercialConsentModalBanner,
            'dismissableVariant'
        );
    }

    return inModalTestDismissableVariant;
};

let inModalTestNonDismissableVariant;
const isInModalTestNonDismissableVariant = (): boolean => {
    if (inModalTestNonDismissableVariant === undefined) {
        inModalTestNonDismissableVariant = isInVariantSynchronous(
            commercialConsentModalBanner,
            'nonDismissableVariant'
        );
    }

    return inModalTestNonDismissableVariant;
};

const isInCommercialConsentModalBannerTest = (): boolean =>
    isInModalTestRegularVariant() ||
    isInModalTestDismissableVariant() ||
    isInModalTestNonDismissableVariant();

const makeHtml = (): string => `
    <div class="site-message--first-pv-consent__block site-message--first-pv-consent__block--head ">${
        template.heading
    }</div>
    ${
        isInModalTestDismissableVariant()
            ? `<div class="first-pv-consent-banner__close">
            <button tabindex="3" class="button site-message--first-pv-consent__close-button js-site-message-close js-first-pv-consent-banner-close-button" data-link-name="hide consent banner">
                <span class="u-h">Close</span>
                ${closeCentralIcon.markup}
            </button>
        </div>`
            : ''
    }
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
            tabindex="1"
        >${checkIcon.markup}<span>${template.agreeButton}</span></button>
        <a
            href="${template.linkToPreferences}"
            data-link-name="first-pv-consent : to-prefs"
            class="site-message--first-pv-consent__link u-underline"
            tabindex="2"
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
    if (isInModalTestNonDismissableVariant) {
        // enable scrolling on body
        if (document.body) {
            document.body.classList.remove('no-scroll');
        }
    }
};

const trackInteraction = (interaction: string): void => {
    ophan.record({
        component: 'first-pv-consent',
        action: interaction,
        value: interaction,
    });
    trackNonClickInteraction(interaction);
};

const canShow = (): Promise<boolean> =>
    Promise.resolve(
        hasUnsetAdChoices() &&
            (isInEU() || isInCommercialConsentModalBannerTest()) &&
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

const bindModalCloseHandlers = (msg: Message): void => {
    fastdom
        .read(() =>
            document.querySelector('.js-first-pv-consent-banner-close-button')
        )
        .then(closeButton => {
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    msg.hide();
                    // enable scrolling on body
                    if (document.body) {
                        document.body.classList.remove('no-scroll');
                    }
                });
            }
        });
};

const show = (): Promise<boolean> => {
    track();

    const opts = {};

    const getTestVariant = (): ?string => {
        if (isInModalTestDismissableVariant()) {
            return 'dismissableVariant';
        }

        if (isInModalTestNonDismissableVariant()) {
            return 'nonDismissableVariant';
        }
    };

    const getTestModifierClass = (): ?string => {
        const testVariant = getTestVariant();

        if (testVariant) {
            return `first-pv-consent--${testVariant}`;
        }
    };

    const modifierClass = getTestModifierClass();

    if (modifierClass) {
        opts.cssModifierClass = modifierClass;
    }

    const msg = new Message(
        messageCode,
        Object.assign(
            {},
            {
                important: true,
                permanent: true,
                customJs: () => {
                    bindClickHandlers(msg);

                    if (
                        (isInModalTestDismissableVariant() ||
                            isInModalTestNonDismissableVariant()) &&
                        document.body
                    ) {
                        // prevent body scrolling beneath overlay
                        document.body.classList.add('no-scroll');
                    }

                    // if isInModalTestDismissableVariant bind close button handlers
                    if (isInModalTestDismissableVariant()) {
                        bindModalCloseHandlers(msg);
                    }
                },
            },
            opts
        )
    );

    return Promise.resolve(msg.show(makeHtml()));
};

const firstPvConsentBanner: Banner = {
    id: messageCode,
    canShow,
    show,
};

const clearTestVariants = (): void => {
    inModalTestRegularVariant = undefined;
    inModalTestDismissableVariant = undefined;
    inModalTestNonDismissableVariant = undefined;
};

export const _ = {
    onAgree,
    bindableClassNames,
    clearTestVariants,
};

export {
    firstPvConsentBanner,
    canShow,
    track,
    bindClickHandlers,
    messageCode,
    makeHtml,
};
