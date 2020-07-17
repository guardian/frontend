// @flow

// Trigger test in Dev
// http://m.thegulocal.com/uk#ab-SignInGateCentesimus=centesimus-control-2

// Centesismus (100%) test is a feature switch where we roll out winning changes from other AB sign in gate tests
// The number represents the design version being used.

export const signInGateMainControl: ABTest = {
    id: 'SignInGateMainControl1',
    start: '2020-05-20',
    expiry: '2020-12-01',
    author: 'Mahesh Makani',
    description:
        'Show sign in gate to 100% of users on 3rd article view of simple article templates, with higher priority over banners and epic. Control Audience.',
    audience: 0.09,
    audienceOffset: 0.9,
    successMeasure: 'Users sign in or create a Guardian account',
    audienceCriteria:
        '3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss, not on help, info sections etc. Exclude iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
    ophanComponentId: 'main_control_1',
    dataLinkNames: 'SignInGateMain',
    idealOutcome:
        'Increase the number of users signed in whilst running at a reasonable scale',
    showForSensitive: false,
    canRun: () => true,
    variants: [
        {
            id: 'main-control-1',
            test: (): void => {},
        },
    ],
};
