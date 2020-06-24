// @flow

// Trigger test in Dev
// http://m.thegulocal.com/uk#ab-SignInGateCentesimus=centesimus-control-1

export const signInGateCentesimus: ABTest = {
    id: 'SignInGateCentesimus',
    start: '2020-05-20',
    expiry: '2020-12-01',
    author: 'vlbee',
    description:
        'Show sign in gate to 100% of users on 3rd article view of simple article templates, with higher priority over banners and epic',
    audience: 0.9997,
    audienceOffset: 0.0,
    successMeasure: 'Users sign in or create a Guardian account',
    audienceCriteria:
        '3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss, not on help, info sections etc. Exclude iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
    ophanComponentId: 'centesimus_test',
    dataLinkNames: 'SignInGateCentesimus',
    idealOutcome:
        'Increase the number of users signed in whilst running at a reasonable scale',
    showForSensitive: false,
    canRun: () => true,
    variants: [
        {
            id: 'centesimus-control-1',
            test: (): void => {},
        },
        // {
        //     id: 'centesimus-variant-1',
        //     test: (): void => {},
        // },
    ],
};
