// @flow

export const signInGateDesignOpt: ABTest = {
    id: 'SignInGateDesignOpt',
    start: '2020-10-09', // todo
    expiry: '2020-12-01', // todo
    author: 'vlbee',
    description:
        'Compare 6 different gate design changes, on 3rd page view, on simple article templates, with higher priority over banners and epi',
    audience: 0.1971,
    audienceOffset: 0.7029,
    successMeasure: 'Users sign in or create a Guardian account',
    audienceCriteria:
        '3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss or reshown after 5 dismisses, not on help, info sections etc. exclude iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
    ophanComponentId: 'design_opt_test',
    dataLinkNames: 'SignInGateDesignOpt',
    idealOutcome:
        'We believe that we could increase sign in conversion by at least 5% by implementing these design changes',
    showForSensitive: false,
    canRun: () => true,
    variants: [
        {
            id: 'design-opt-control',
            test: (): void => {},
        },
        {
            id: 'design-opt-variant-1', // No FAQs
            test: (): void => {},
        },
        {
            id: 'design-opt-variant-2', // Blue highlight on key line of the text
            test: (): void => {},
        },
        {
            id: 'design-opt-variant-3', // Less whitespace
            test: (): void => {},
        },
        {
            id: 'design-opt-variant-4', // No line between primary and secondary CTA
            test: (): void => {},
        },
        {
            id: 'design-opt-variant-5', // Slight colour highlight
            test: (): void => {},
        },
        {
            id: 'design-opt-variant-6', // Move button above text
            test: (): void => {},
        },
    ],
};
