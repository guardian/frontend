

export const signInGateTimesOfDay = {
    id: 'SignInGateTimesOfDay',
    start: '2020-05-20',
    expiry: '2023-12-31',
    author: 'Lindsey Dew',
    description:
        'Show sign in gate more frequently to users in the morning',
    audience: 0.4,
    audienceOffset: 0.5,
    successMeasure: 'Increase registration and sign ins by 5%',
    audienceCriteria:
        '1st article of the day, max 5 articles, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss, not on help, info sections etc. Exclude iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
    ophanComponentId: 'morning',
    dataLinkNames: 'SignInGateTimesOfDay',
    idealOutcome:
        'TODO',
    showForSensitive: false,
    canRun: () => true,
    variants: [
        {
            id: 'morning',
            test: () => {},
        },
    ],
};
