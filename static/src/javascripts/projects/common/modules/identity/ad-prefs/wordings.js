import React from 'preact-compat';
import { thirdPartyTrackingAdConsent } from 'common/modules/commercial/ad-prefs.lib';




const ThirdPartyConsentWording = {
    question: {
        title: 'Set your personalised ads preferences',
        text: (
            <div>
                <p>
                    We work with{' '}
                    <a
                        className="u-underline"
                        href="https://www.theguardian.com/info/cookies">
                        advertising partners
                    </a>{' '}
                    (including Google and the Ozone project) to show you ads for
                    products and services you might be interested in. You can
                    choose whether the ads you see on our sites are personalised
                    by selecting one of the options below.
                </p>
                <p>
                    Don&apos;t worry, you can always revisit these settings by
                    following the link on our{' '}
                    <a
                        className="u-underline"
                        href="https://www.theguardian.com/info/cookies#nav4">
                        cookies policy page.
                    </a>
                </p>
            </div>
        ),
    },
    yesCheckbox: {
        title: 'I am OK with personalised ads',
        text: `We and our advertising partners will use your data to show you ads that you might be interested in.`,
    },
    noCheckbox: {
        title: 'I do not want to see personalised ads',
        text: `We will ask our advertising partners not to show you personalised ads. Please note that you will still see advertising, but it will be less relevant.`,
    },
};

const getConsentWording = (consent) => {
    if (consent.cookie === thirdPartyTrackingAdConsent.cookie)
        return ThirdPartyConsentWording;
    return {
        question: { title: consent.label },
        yesCheckbox: {
            title: 'yes',
        },
        noCheckbox: {
            title: 'no',
        },
    };
};

export { getConsentWording };
