// @flow
export const signInGatePageview: ABTest = {
    id: 'SignInGatePageview',
    start: '2020-10-09',
    expiry: '2020-12-01',
    author: 'vlbee',
    description:
        'Compare showing the gate on the 2nd vs 3rd article view with new and old dimiss rule variants, on simple article templates, with higher priority over banners and epi, excluding the US',
    audience: 0.2333,
    audienceOffset: 0.6667,
    successMeasure: 'Users sign in or create a Guardian account',
    audienceCriteria:
        '2nd or 3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss or reshown after 5 dismisses, not on help, info sections etc. Exclude US, iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
    dataLinkNames: 'SignInGatePageview',
    idealOutcome:
        'Moving to a second page view gate would lead to an estimated increase in the number of weekly sign ins of between +25% and +35%.',
    showForSensitive: false,
    canRun: () => true,
    variants: [
        {
            id: 'pageview-variant-1', // 3rd page view & new dismiss rule (capped at 5)
            test: (): void => {},
        },
        {
            id: 'pageview-variant-2', // 2nd page view & new dismiss rule (capped at 5)
            test: (): void => {},
        },
        {
            id: 'pageview-variant-3', // 3rd page view & old dismiss rule (never see gate again after first dismissal)
            test: (): void => {},
        },
        {
            id: 'pageview-variant-4', // 2nd page view & new dismiss rule (never see gate again after first dismissal)
            test: (): void => {},
        },
    ],
};
