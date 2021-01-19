export const signInGateDesignOpt = {
	id: 'SignInGateDesignOpt',
	start: '2021-01-20',
	expiry: '2021-12-01',
	author: 'coldlink',
    description:
        'Compare 6 different gate design changes, on 3rd page view, on simple article templates, with higher priority over banners and epi',
    audience: 0.2,
    audienceOffset: 0.7,
    successMeasure: 'Users sign in or create a Guardian account',
    audienceCriteria:
        '3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss, not on help, info sections etc. Exclude iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
    ophanComponentId: 'design_opt',
    dataLinkNames: 'SignInGateDesignOpt',
    idealOutcome:
        'We believe that we could increase sign in conversion by at least 5% by implementing these design changes',
    showForSensitive: false,
    canRun: () => true,
    variants: [
        {
            id: 'design-opt-control',
            test: () => {},
        },
        {
            id: 'design-opt-variant-1',
            test: () => {},
        },
        {
            id: 'design-opt-variant-2',
            test: () => {},
        },
        {
            id: 'design-opt-variant-3',
            test: () => {},
        },
        {
            id: 'design-opt-variant-4',
            test: () => {},
        },
        {
            id: 'design-opt-variant-5',
            test: () => {},
        },
        {
            id: 'design-opt-variant-6',
            test: () => {},
        },
    ],
};
