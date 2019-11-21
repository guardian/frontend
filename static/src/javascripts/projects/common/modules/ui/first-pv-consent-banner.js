// @flow
import config from 'lib/config';
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
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { commercialCmpUiIab } from 'common/modules/experiments/tests/commercial-cmp-ui-iab';
import { commercialCmpUiNonDismissable } from 'common/modules/experiments/tests/commercial-cmp-ui-non-dismissable';
import { commercialIabConsentBanner } from 'common/modules/experiments/tests/commercial-iab-consent-banner';

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

const INFO_LIST_BUTTON_ID = 'cmp-info-list-button';
const PURPOSE_LIST_BUTTON_ID = 'cmp-purpose-list-button';
const INFO_LIST_ID = 'cmp-info-list';
const PURPOSE_LIST_ID = 'cmp-purpose-button';

const buildInfoList = (): string => {
    const listItems = [
        'Type of browser and its settings',
        'Cookie information',
        'Information about other identifiers assigned to the device',
        "The IP address from which the device accesses a client's website or mobile application",
        'Information about the geographic location of the device when it accesses a website or mobile application',
    ]
        .map(listItem => `<li>${listItem}</li>`)
        .join('');

    return `<ul class="cmp-list">${listItems}</ul>`;
};

const buildPurposeList = (): string => {
    const listItems = [
        'Storage and access of information',
        'Ad selection and delivery',
        'Content selection and delivery',
        'Personalization',
        'Measurement',
    ]
        .map(listItem => `<li>${listItem}</li>`)
        .join('');

    return `<ul class="cmp-list">${listItems}</ul>`;
};

const makeHtml = (): string => `
    <div class="site-message--first-pv-consent__block site-message--first-pv-consent__block--head ">${
        template.heading
    }</div>
    <div class="site-message--first-pv-consent__block site-message--first-pv-consent__block--intro">${template.consentText
        .map(_ => `<p>${_}</p>`)
        .join('')}
    </div>
    ${
        isInVariantSynchronous(commercialIabConsentBanner, 'variant')
            ? `
                <div class="site-message--first-pv-consent--commercialIabConsentBanner site-message--first-pv-consent__block site-message--first-pv-consent__block--intro">
                    <div class="cmp-list-container" id="${INFO_LIST_ID}">
                        <button class="cmp-button" id="${INFO_LIST_BUTTON_ID}" >
                            Information that may be used
                        </button>
                        ${buildInfoList()}
                    </div>
                    <div class="cmp-list-container" id="${PURPOSE_LIST_ID}">
                        <button class="cmp-button" id="${PURPOSE_LIST_BUTTON_ID}">
                            Purposes for storing information
                        </button>
                        ${buildPurposeList()}
                    </div>
                </div>
            `
            : ''
    }
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

const canShow = (): Promise<boolean> =>
    Promise.resolve(
        hasUnsetAdChoices() &&
            !hasUserAcknowledgedBanner(messageCode) &&
            (!isInVariantSynchronous(commercialCmpUiIab, 'variant') ||
                !isInVariantSynchronous(
                    commercialCmpUiNonDismissable,
                    'control'
                ) ||
                !isInVariantSynchronous(
                    commercialCmpUiNonDismissable,
                    'variant'
                ))
    );

const track = (): void => {
    upAlertViewCount();
    trackInteraction(displayEventKey);
};

const toggleListVisibility = (listId: string): void => {
    const SHOW_LIST_CLASS = 'cmp-list-container--visible';

    const listContainerElem = document.getElementById(listId);

    if (listContainerElem) {
        if (listContainerElem.classList.contains(SHOW_LIST_CLASS)) {
            listContainerElem.classList.remove(SHOW_LIST_CLASS);
        } else {
            listContainerElem.classList.add(SHOW_LIST_CLASS);
        }
    }
};

const bindClickHandlers = (msg: Message): void => {
    Array.from(
        document.querySelectorAll(`.${bindableClassNames.agree}`)
    ).forEach(agreeButtonEl => {
        agreeButtonEl.addEventListener('click', () => onAgree(msg));
    });

    if (isInVariantSynchronous(commercialIabConsentBanner, 'variant')) {
        const infoListButton = document.getElementById(INFO_LIST_BUTTON_ID);

        if (infoListButton) {
            infoListButton.addEventListener('click', () => {
                toggleListVisibility(INFO_LIST_ID);
            });
        }

        const purposeListButton = document.getElementById(
            PURPOSE_LIST_BUTTON_ID
        );

        if (purposeListButton) {
            purposeListButton.addEventListener('click', () => {
                toggleListVisibility(PURPOSE_LIST_ID);
            });
        }
    }
};

const show = (): Promise<boolean> => {
    track();

    const opts = {};

    if (isInVariantSynchronous(commercialIabConsentBanner, 'variant')) {
        opts.cssModifierClass = 'first-pv-consent--commercialIabConsentBanner';
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
    hasUnsetAdChoices,
};
