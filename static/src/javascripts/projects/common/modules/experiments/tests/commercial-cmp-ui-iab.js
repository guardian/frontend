// @flow

export const commercialCmpUiIab: ABTest = {
    id: 'CommercialCmpUiIab',
    start: '2019-10-14',
    expiry: '2020-01-08',
    author: 'George Haberis',
    description: '1% participation AB test for the new CMP UI',
    audience: 0.01,
    audienceOffset: 0.5,
    successMeasure: 'Our new CMP UI obtains target consent rates',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'Our new CMP UI obtains target consent rates',
    showForSensitive: true,
    canRun: () => true,
    variants: [
        {
            id: 'variant',
            test: (): void => {},
        },
    ],
};
