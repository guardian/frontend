export const signInGateAlternativeWording = {
    id: 'SignInGateAlternativeWording',
    start: '2024-03-01',
    expiry: '2025-12-01',
    author: 'Raphael Kabo',
    description:
        'Version of the main dismissable sign in gate, testing different messages',
    audience: 0.2,
    audienceOffset: 0.7,
    successMeasure: 'Users sign in or create a Guardian account',
    audienceCriteria:
        '3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss, not on help, info sections etc. Exclude iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
    dataLinkNames: 'SignInGateAlternativeWording',
    idealOutcome:
        'One of the variants performs better than the control, and neither variant performs worse than the control',
    showForSensitive: false,
    canRun: () => true,
    variants: [
        {
            id: 'alternative-wording-guardian-live',
            test: () => { },
        },
        {
            id: 'alternative-wording-saturday-edition',
            test: () => { },
        },
        {
            id: 'alternative-wording-personalise',
            test: () => { },
        },
        {
            id: 'alternative-wording-control',
            test: () => { },
        },
    ],
};
