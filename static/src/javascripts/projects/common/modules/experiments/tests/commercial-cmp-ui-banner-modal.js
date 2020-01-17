// @flow

export const commercialCmpUiBannerModal: ABTest = {
    id: 'CommercialCmpUiBannerModal',
    start: '2020-01-13',
    expiry: '2020-01-28',
    author: 'George Haberis',
    description: '2% participation AB test for the new banner/modal CMP UI',
    audience: 0.02,
    audienceOffset: 0.8,
    successMeasure: 'Our new banner/modal CMP UI obtains target consent rates',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'Our new banner/modal CMP UI obtains target consent rates',
    showForSensitive: true,
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
