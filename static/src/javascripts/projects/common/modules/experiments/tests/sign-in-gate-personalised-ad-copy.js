// @flow

// Main test is a feature switch where we roll out winning changes from other AB sign in gate tests
// variant audience sees the gate

export const signInGatePersonalisedAdCopy: ABTest = {
    id: 'SignInGatePersonalisedAdCopy',
    start: '2020-10-13',
    expiry: '2020-12-01',
    author: 'vlbee',
    description:
        'Show sign in gate with and without personalised adverstising copy to 100% of users on 3rd article view of simple article templates, with higher priority over banners and epic.',
    audience: 0.1,
    audienceOffset: 0.671,
    successMeasure: 'Users sign in or create a Guardian account',
    audienceCriteria:
        '3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss, not on help, info sections etc. Exclude iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
    ophanComponentId: 'personalised-ad-copy',
    dataLinkNames: 'SignInGatePersonalisedAdCopy',
    idealOutcome:
        'Increase the number of users signed in whilst running at a reasonable scale',
    showForSensitive: false,
    canRun: () => true,
    variants: [
        {
            id: 'personalised-ad-copy-variant-1', // with copy (main-variant)
            test: (): void => {},
        },
        {
            id: 'personalised-ad-copy-variant-2', // without copy
            test: (): void => {},
        },
    ],
};
