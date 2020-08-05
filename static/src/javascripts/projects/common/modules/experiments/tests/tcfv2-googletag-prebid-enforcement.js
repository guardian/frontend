// @flow strict

export const googletagPrebidEnforcement: ABTest = {
    id: 'Tcfv2GoogletagPrebidEnforcement',
    start: '2020-08-04',
    expiry: '2020-09-30',
    author: 'Ioanna Kyprianou',
    description: 'This is to test adding googletag and prebid behind TCFv2 Sourcepoint enforcement',
    audience: 0.0,
    audienceOffset: 0.0,
    successMeasure: 'We don\'t break the site',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'We don\'t break the site',
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

