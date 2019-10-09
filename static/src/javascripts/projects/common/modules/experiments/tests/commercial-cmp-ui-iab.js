// @flow

export const commercialCmpUiIab: ABTest = {
    id: 'CommercialCmpUiIab',
    start: '2019-10-10',
    expiry: '2019-10-18',
    author: 'George Haberis',
    description: '1% participation AB test for the new CMP UI',
    audience: 0, // TODO: bump to 0.01 when ready
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
