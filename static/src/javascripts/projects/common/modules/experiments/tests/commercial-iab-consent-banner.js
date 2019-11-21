// @flow

export const commercialIabConsentBanner: ABTest = {
    id: 'CommercialIabConsentBanner',
    start: '2019-11-17',
    expiry: '2019-11-27',
    author: 'George Haberis',
    description: '1% participation AB test for an IAB compliant consent banner',
    audience: 0.01,
    audienceOffset: 0.7,
    successMeasure:
        'IAB compliant consent banner does not adversely affect consent rates',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'consent rates do not go down at all',
    showForSensitive: true,
    canRun: () => true,
    variants: [
        {
            id: 'variant',
            test: (): void => {},
        },
    ],
};
