
export const signInGateDevice = {
    id: 'SignInGateDevice',
    start: '2023-12-19',
    expiry: '2024-01-30',
    author: 'Lindsey Dew',
    description:
        'Test showing the sign in gate at different levels of frequency by device type',
    audience: 0.09,
    audienceOffset: 0.81,
    successMeasure: 'Users sign in or create a Guardian account',
    audienceCriteria:
        '3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss, not on help, info sections etc. Exclude iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
    ophanComponentId: 'sign_in_gate_device',
    dataLinkNames: 'SignInGateMain',
    idealOutcome:
        'Increase the number of users signed in whilst running at a reasonable scale',
    showForSensitive: false,
    canRun: () => true,
    variants: [
        {
            id: 'control',
            test: () => {},
        },
        {
            id: 'desktop',
            test: () => {},
        },
        {
            id: 'mobile',
            test: ()=> {},
        }
    ],
};
