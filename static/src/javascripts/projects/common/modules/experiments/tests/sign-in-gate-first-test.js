// @flow
export const signInGateSecundus: ABTest = {
    id: 'SignInGateSecundus',
    start: '2019-12-20',
    expiry: '2020-01-31',
    author: 'Mahesh Makani, Dominic Kendrick',
    description:
        'Test adding a sign in component on the 2nd pageview of simple article templates, with higher priority over banners and epic, and a much larget audience size.',
    audience: 0.40,
    audienceOffset: 0.1,
    successMeasure: 'Users sign in or create a Guardian account',
    audienceCriteria:
        'The contributions epic is not shown, The consent banner is not shown, The contributions banner is not shown, Should only appear on simple article template, Should not show if they are already signed in, Users will not need to go through the marketing consents as part of signup flow',
    dataLinkNames: 'n/a',
    idealOutcome: '60% of users sign in, and dismiss rate is below 40%',
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
