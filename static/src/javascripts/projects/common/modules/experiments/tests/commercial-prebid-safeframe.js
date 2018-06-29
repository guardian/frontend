// @flow

export const commercialPrebidSafeframe: ABTest = {
    id: 'CommercialPrebidSafeframe',
    start: '2018-06-29',
    expiry: '2019-09-30',
    author: 'Jerome Eteve',
    description: 'This test will serve prebid ads via safeframe line items',
    audience: 0.01,
    audienceOffset: 0,
    successMeasure: 'Measurement of prebid ads yield',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'No difference between safeframe and standard',
    canRun: () => true,
    variants: [
        {
            id: 'control',
            test: (): void => {
                console.log('In control');
            },
        },
        {
            id: 'variant',
            test: (): void => {
                console.log('In variant');
                // TODO insert code that sends render=safeframe to sonobi prebid
            },
        },
    ],
};
