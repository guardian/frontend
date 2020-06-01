// @flow

// Trigger test in Dev
// http://m.thegulocal.com/uk#ab-SignInGateVii=vii-variant

export const signInGateVii: ABTest = {
    id: 'SignInGateVii',
    start: '2020-06-04',
    expiry: '2020-12-01',
    author: 'vlbee',
    description:
        'Compare new design variant to 100% sign in test design, shown to users on 3rd article view of simple article templates, with higher priority over banners and epic',
    audience: 0.0002,
    audienceOffset: 0.9997,
    successMeasure:
        'New copy and design will increase sign in conversion compared to the current copy and design (centesimus-control-1)',
    audienceCriteria:
        '3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss, not on help, info sections etc. Exclude iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
    ophanComponentId: 'sign-in-gate-test-vii',
    dataLinkNames: 'SignInGateVii',
    idealOutcome:
        'Increase sign in conversion compared to the current copy and design',
    showForSensitive: false,
    canRun: () => true,
    variants: [
        {
            id: 'vii-variant',
            test: (): void => {},
        },
    ],
};
