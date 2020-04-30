// @flow
export const signInGate: ABTest = {
    id: 'SignInGatePatientia',
    start: '2020-04-30',
    expiry: '2020-12-01',
    author: 'Mahesh Makani, vlbee',
    description:
        'Marathon sign in gate test on 3nd article view of simple article templates, with higher priority over banners and epic',
    audience: 0.0, // todo
    audienceOffset: 0.0, // todo
    successMeasure: 'Users sign in or create a Guardian account',
    audienceCriteria:
        '3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss, not on help, info sections etc. Exclude iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
    dataLinkNames: 'SignInGatePatientia',
    idealOutcome:
        'Conversion to sign in is higher when the gate is shown over a longer period of time, with no sustained negative impact to engagement levels or supporter acquisition',
    showForSensitive: false,
    canRun: () => true,
    variants: [
        {
            id: 'control',
            test: (): void => {},
        },
        {
            id: 'variant',
            test: (): void => {},
        },
    ],
};
