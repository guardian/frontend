// @flow strict

export const xaxisAdapterTest: ABTest = {
    id: 'CommercialXaxisAdapter',
    start: '2019-09-24',
    expiry: '2020-07-30',
    author: 'Ioanna Kyprianou',
    description:
        'Test new implementation of xaxis adapter with multiple placement ids',
    audience: 0.0,
    audienceOffset: 0.0,
    successMeasure: 'Xaxis adapter works with multiple placement ids',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome:
        'No significant impact to performance as well as higher ad yield',
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
