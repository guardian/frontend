// @flow

export const commercialCmpUiNonDismissable: ABTest = {
    id: 'CommercialCmpUiNonDismissable',
    start: '2019-11-13',
    expiry: '2019-12-03',
    author: 'George Haberis',
    description:
        '1% participation AB test for the new CMP UI testing non-dismissable variant',
    audience: 0.01,
    audienceOffset: 0.6,
    successMeasure:
        'Our new CMP UI obtains target consent rates using non-dismissable variant',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome:
        'Our new CMP UI obtains target consent rates using non-dismissable variant',
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
