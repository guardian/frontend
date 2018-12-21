// @flow
import type { AdConsent } from 'common/modules/commercial/ad-prefs.lib';
import { thirdPartyTrackingAdConsent } from 'common/modules/commercial/ad-prefs.lib';

type CheckboxWording = {
    title: string,
    text?: string,
};

type ConsentWording = {
    question: string,
    yesCheckbox: CheckboxWording,
    noCheckbox: CheckboxWording,
};

const ThirdPartyConsentWording: ConsentWording = {
    question:
        'We use cookies to improve your experience on our site and to show you personalised advertising.',
    yesCheckbox: {
        title: 'I\'m OK with that',
        text: `You can change your mind at any time by taking the steps set out in our <a class="u-underline" href="https://www.theguardian.com/info/cookies">cookie policy</a>, where you can also learn more about what cookies are and how they are used by The Guardian.`,
    },
    noCheckbox: {
        title: 'I want to manage relevant advertising',
        text: `Choosing this option will immediately reduce the number of advertising partners who will serve you with relevant adverts, although you may still see some advertising that has been tailored to you. However, if you wish to disable cookies on The Guardian, including advertising cookies, you will need to take further steps. Please follow the instructions in our <a class="u-underline" href="https://www.theguardian.com/info/cookies">cookie policy</a>.`,
    },
};

const getConsentWording = (consent: AdConsent): ConsentWording => {
    if (consent.cookie === thirdPartyTrackingAdConsent.cookie)
        return ThirdPartyConsentWording;
    return {
        question: consent.label,
        yesCheckbox: {
            title: 'yes',
        },
        noCheckbox: {
            title: 'no',
        },
    };
};

export type { ConsentWording, CheckboxWording };
export { getConsentWording };
