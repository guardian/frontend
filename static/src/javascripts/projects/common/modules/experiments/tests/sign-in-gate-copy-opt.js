export const signInGateCopyOpt = {
    id: 'SignInGateCopyOpt',
    start: '2021-02-24',
    expiry: '2021-12-01',
    author: 'rebecca-thompson',
    description:
        'Compare 6 different gate copy changes, on 3rd page view of the day, on simple article templates, with higher priority over banners and epi',
    audience: 0.2,
    audienceOffset: 0.7,
    successMeasure: 'Users sign in or create a Guardian account',
    audienceCriteria:
        '3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss, not on help, info sections etc. Exclude iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
    ophanComponentId: 'copy_opt',
    dataLinkNames: 'SignInGateCopyOpt',
    idealOutcome:
        'We believe that we could increase sign in conversion by at least 5% by implementing these copy changes',
    showForSensitive: false,
    canRun: () => true,
    variants: [
        {
            id: 'copy-opt-control',
            test: () => {},
        },
        {
            id: 'copy-opt-variant-1', // Transparency 1 - You need to register to keep reading
            test: () => {},
        },
        {
            id: 'copy-opt-variant-2', // Transparency 2 - Register to keep reading
            test: () => {},
        },
        {
            id: 'copy-opt-variant-3', // Purpose - We’ll keep holding power to account
            test: () => {},
        },
        {
            id: 'copy-opt-variant-4', // Petition - Do you believe in independent journalism?
            test: () => {},
        },
        {
            id: 'copy-opt-variant-5', // Belonging 1 - Join our mission
            test: () => {},
        },
        {
            id: 'copy-opt-variant-6', // Belonging 2 - Register to keep reading
            test: () => {},
        },
    ],
};
