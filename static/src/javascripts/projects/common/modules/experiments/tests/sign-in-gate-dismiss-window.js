// @flow
export const signInGateDismissWindow: ABTest = {
    id: 'SignInGateDismissWindow',
    start: '2020-08-12',
    expiry: '2020-12-01',
    author: 'vlbee',
    description:
        'Dismiss Window sign in gate test on 3nd article view of simple article templates, with higher priority over banners and epic',
    audience: 0.025,
    audienceOffset: 0.875,
    successMeasure:
        'More users who previously dismissed the gate sign in or create a Guardian account',
    audienceCriteria:
        '3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not on help, info sections etc. Exclude iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics. Control group will no longer see gate after first dismissal, Variant 1 will see gate on every article after first dimissal, Variant 2 will see gate again after 24hrs first dimissal in same session',
    ophanComponentId: 'dismiss_window_test',
    dataLinkNames: 'SignInGateDismissWindow',
    idealOutcome:
        'Conversion to sign in is higher with increased gate impressions after initial dismissal, with no sustained negative impact to engagement levels or supporter acquisition',
    showForSensitive: false,
    canRun: () => true,
    variants: [
        {
            id: 'dismiss-window-control',
            test: (): void => {},
        },
        {
            id: 'dismiss-window-variant-1-article',
            test: (): void => {},
        },
        {
            id: 'dismiss-window-variant-2-day',
            test: (): void => {},
        },
    ],
};
