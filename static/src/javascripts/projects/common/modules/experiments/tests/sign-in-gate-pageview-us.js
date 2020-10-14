// @flow
export const signInGatePageviewUs: ABTest = {
    id: 'SignInGatePageviewUs',
    start: '2020-10-04',
    expiry: '2020-12-01',
    author: 'vlbee',
    description:
        'Compare showing the gate on the 2nd vs 3rd article view to US browsers, capped 5 dismissals, on simple article templates, with higher priority over banners and epics',
    audience: 0.1388,
    audienceOffset: 0.5322,
    successMeasure: 'Users sign in or create a Guardian account',
    audienceCriteria:
        '2nd or 3rd article of the day, US browsers only, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not reshown after 5 dismisses, not on help, info sections etc. Exclude US, iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
    dataLinkNames: 'SignInGatePageviewUs',
    ophanComponentId: 'pageview_us_test',
    idealOutcome:
        'Moving to a second page view gate would lead to an estimated increase in the number of weekly sign ins of between +25% and +35%.',
    showForSensitive: false,
    canRun: () => true,
    variants: [
        {
            id: 'pageview-us-variant-1', // 3rd page view & new dismiss rule (capped at 5)
            test: (): void => {},
        },
        {
            id: 'pageview-us-variant-2', // 2nd page view & new dismiss rule (capped at 5)
            test: (): void => {},
        },
    ],
};
