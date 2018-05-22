// @flow
import type { AdConsent } from 'common/modules/commercial/ad-prefs.lib';
import { thirdPartyTrackingAdConsent } from 'common/modules/commercial/ad-prefs.lib';

type CheckboxWording = {
    title: string,
    text: ?string,
};

type ConsentWording = {
    question: string,
    yesCheckbox: CheckboxWording,
    noCheckbox: CheckboxWording,
};

const ThirdPartyConsentWording: ConsentWording = {
    question:
        'We use cookies to improve your experience on our site and to show you relevant advertising.',
    yesCheckbox: {
        title: 'OK',
        text:
            'You can change your mind at any time by taking the steps set out in our cookie policy, where you can also learn more about what cookies are and how they are used by The Guardian.',
    },
    noCheckbox: {
        title: 'I want to manage the use of advertising cookies',
        text:
            'This option will reduce the number of advertising partners who will serve you with relevant adverts, although you may still see some advertising that has been tailored to you. If you wish to take further steps to disable cookies on The Guardian, including advertising cookies, please follow the instructions in our cookie policy.',
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
