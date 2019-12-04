// @flow
export const signInGatePrius: ABTest = {
    id: 'SignInGatePrius',
    start: '2019-12-02',
    expiry: '2019-12-17',
    author: 'Mahesh Makani, Dominic Kendrick',
    description:
        'Test adding a sign in component on the 2nd pageview of simple article templates, with higher priority over banners and epic.',
    audience: 0.015,
    audienceOffset: 0.9,
    successMeasure: 'Users sign in or create a Guardian account',
    audienceCriteria:
        'The contributions epic is not shown, The consent banner is not shown, The contributions banner is not shown, Should only appear on simple article template, Should not show if they are already signed in, Users will not need to go through the marketing consents as part of signup flow',
    dataLinkNames: 'n/a',
    idealOutcome: '60% of users sign in, and bounce rate is below 40%',
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
